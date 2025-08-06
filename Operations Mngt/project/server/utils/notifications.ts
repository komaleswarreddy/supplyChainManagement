import { db } from '../db/index.js';
import { notifications, notificationTemplates, users } from '../db/schema/shared.js';
import { eq, and, inArray, like } from 'drizzle-orm';
import { logger } from './logger.js';
import { getWebSocketService } from './websocket.js';
import { sql } from 'drizzle-orm';
import nodemailer from 'nodemailer';

// Email configuration
const emailConfig = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || ''
  }
};

// Push notification configuration
const pushConfig = {
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID || '',
    privateKey: process.env.FIREBASE_PRIVATE_KEY || '',
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL || ''
  }
};

export interface NotificationData {
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  metadata?: Record<string, any>;
  actionUrl?: string;
}

export interface NotificationRecipient {
  userId: string;
  tenantId: string;
  channels: ('in_app' | 'email' | 'push')[];
}

export class NotificationService {
  async sendNotification(
    recipients: NotificationRecipient[],
    data: NotificationData
  ): Promise<void> {
    try {
      for (const recipient of recipients) {
        // Create notification record
        const notification = await db.insert(notifications).values({
          id: crypto.randomUUID(),
          tenantId: recipient.tenantId,
          userId: recipient.userId,
          title: data.title,
          message: data.message,
          type: data.type,
          category: data.category,
          priority: data.priority,
          metadata: data.metadata || {},
          actionUrl: data.actionUrl,
          status: 'unread',
          createdAt: new Date()
        }).returning();

        // Send via WebSocket for real-time delivery
        if (recipient.channels.includes('in_app')) {
          await this.sendInAppNotification(recipient, data);
        }

        // Send via email if configured
        if (recipient.channels.includes('email')) {
          await this.sendEmailNotification(recipient, data);
        }

        // Send push notification if configured
        if (recipient.channels.includes('push')) {
          await this.sendPushNotification(recipient, data);
        }

        logger.info(`Notification sent to user ${recipient.userId}: ${data.title}`);
      }
    } catch (error) {
      logger.error('Failed to send notification:', error);
      throw error;
    }
  }

  async sendBulkNotification(
    tenantId: string,
    data: NotificationData,
    filters?: {
      roles?: string[];
      departments?: string[];
      locations?: string[];
    }
  ): Promise<void> {
    try {
      // Get users based on filters
      const users = await this.getUsersByFilters(tenantId, filters);
      
      const recipients: NotificationRecipient[] = users.map(user => ({
        userId: user.id,
        tenantId,
        channels: ['in_app', 'email'] // Default channels
      }));

      await this.sendNotification(recipients, data);
    } catch (error) {
      logger.error('Failed to send bulk notification:', error);
      throw error;
    }
  }

  async sendTemplateNotification(
    templateId: string,
    recipients: NotificationRecipient[],
    variables: Record<string, any>
  ): Promise<void> {
    try {
      // Get template
      const template = await db.query.notificationTemplates.findFirst({
        where: eq(notificationTemplates.id, templateId)
      });

      if (!template) {
        throw new Error(`Notification template ${templateId} not found`);
      }

      // Replace variables in template
      const title = this.replaceVariables(template.title, variables);
      const message = this.replaceVariables(template.message, variables);

      const data: NotificationData = {
        title,
        message,
        type: template.type,
        category: template.category,
        priority: template.priority,
        metadata: { ...template.metadata, ...variables },
        actionUrl: template.actionUrl
      };

      await this.sendNotification(recipients, data);
    } catch (error) {
      logger.error('Failed to send template notification:', error);
      throw error;
    }
  }

  private async sendInAppNotification(
    recipient: NotificationRecipient,
    data: NotificationData
  ): Promise<void> {
    const wsService = getWebSocketService();
    if (!wsService) {
      logger.warn('WebSocket service not available for in-app notification');
      return;
    }

    wsService.broadcastToUser(recipient.userId, {
      type: 'notification',
      data: {
        id: crypto.randomUUID(),
        title: data.title,
        message: data.message,
        type: data.type,
        category: data.category,
        priority: data.priority,
        metadata: data.metadata,
        actionUrl: data.actionUrl,
        timestamp: new Date().toISOString()
      }
    });
  }

  private async sendEmailNotification(
    recipient: NotificationRecipient,
    data: NotificationData
  ): Promise<void> {
    try {
      // Get user email
      const user = await db.select({ email: users.email })
        .from(users)
        .where(eq(users.id, recipient.userId))
        .limit(1);

      if (!user.length || !user[0].email) {
        logger.warn(`No email found for user ${recipient.userId}`);
        return;
      }

      // Create email transporter
      const transporter = nodemailer.createTransporter(emailConfig);

      // Create email template
      const emailHtml = this.createEmailTemplate(data);
      const emailText = this.createEmailText(data);

      // Send email
      await transporter.sendMail({
        from: process.env.SMTP_FROM || 'noreply@pls-scm.com',
        to: user[0].email,
        subject: data.title,
        text: emailText,
        html: emailHtml
      });

      logger.info(`Email notification sent to ${user[0].email}: ${data.title}`);
    } catch (error) {
      logger.error('Failed to send email notification:', error);
      // Don't throw error to avoid breaking notification flow
    }
  }

  private async sendPushNotification(
    recipient: NotificationRecipient,
    data: NotificationData
  ): Promise<void> {
    try {
      // Get user's push tokens
      const userTokens = await db.select({ pushToken: users.pushToken })
        .from(users)
        .where(and(
          eq(users.id, recipient.userId),
          sql`${users.pushToken} IS NOT NULL`
        ));

      if (!userTokens.length) {
        logger.warn(`No push tokens found for user ${recipient.userId}`);
        return;
      }

      // Send push notification to all user devices
      for (const token of userTokens) {
        await this.sendFirebasePushNotification(token.pushToken, data);
      }

      logger.info(`Push notification sent to user ${recipient.userId}: ${data.title}`);
    } catch (error) {
      logger.error('Failed to send push notification:', error);
      // Don't throw error to avoid breaking notification flow
    }
  }

  private async getUsersByFilters(
    tenantId: string,
    filters?: {
      roles?: string[];
      departments?: string[];
      locations?: string[];
    }
  ): Promise<Array<{ id: string }>> {
    try {
      let query = db.select({ id: users.id })
        .from(users)
        .where(eq(users.tenantId, tenantId));

      if (filters?.roles?.length) {
        query = query.where(inArray(users.role, filters.roles));
      }

      if (filters?.departments?.length) {
        query = query.where(inArray(users.department, filters.departments));
      }

      if (filters?.locations?.length) {
        query = query.where(inArray(users.location, filters.locations));
      }

      return await query;
    } catch (error) {
      logger.error('Failed to get users by filters:', error);
      return [];
    }
  }

  private createEmailTemplate(data: NotificationData): string {
    const priorityColors = {
      low: '#6B7280',
      medium: '#F59E0B',
      high: '#EF4444',
      urgent: '#DC2626'
    };

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${data.title}</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: ${priorityColors[data.priority]}; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; padding: 12px 24px; background: #3B82F6; color: white; text-decoration: none; border-radius: 6px; }
            .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 14px; color: #6B7280; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${data.title}</h1>
            </div>
            <div class="content">
              <p>${data.message}</p>
              ${data.actionUrl ? `<p><a href="${data.actionUrl}" class="button">View Details</a></p>` : ''}
            </div>
            <div class="footer">
              <p>This is an automated notification from PLS-SCM Operations Management System.</p>
              <p>Priority: ${data.priority.toUpperCase()} | Category: ${data.category}</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private createEmailText(data: NotificationData): string {
    return `
${data.title}

${data.message}

${data.actionUrl ? `View Details: ${data.actionUrl}` : ''}

---
Priority: ${data.priority.toUpperCase()}
Category: ${data.category}

This is an automated notification from PLS-SCM Operations Management System.
    `.trim();
  }

  private async sendFirebasePushNotification(token: string, data: NotificationData): Promise<void> {
    // Implementation would use Firebase Admin SDK
    // For now, we'll log the notification
    logger.info(`Firebase push notification would be sent to token ${token}: ${data.title}`);
    
    // TODO: Implement actual Firebase push notification
    // const admin = require('firebase-admin');
    // const message = {
    //   token: token,
    //   notification: {
    //     title: data.title,
    //     body: data.message
    //   },
    //   data: {
    //     category: data.category,
    //     priority: data.priority,
    //     actionUrl: data.actionUrl || ''
    //   }
    // };
    // await admin.messaging().send(message);
  }

  private replaceVariables(text: string, variables: Record<string, any>): string {
    return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return variables[key] || match;
    });
  }

  // Notification management methods
  async markAsRead(notificationId: string, userId: string): Promise<void> {
    await db.update(notifications)
      .set({ 
        status: 'read',
        readAt: new Date()
      })
      .where(and(
        eq(notifications.id, notificationId),
        eq(notifications.userId, userId)
      ));
  }

  async markAllAsRead(userId: string, tenantId: string): Promise<void> {
    await db.update(notifications)
      .set({ 
        status: 'read',
        readAt: new Date()
      })
      .where(and(
        eq(notifications.userId, userId),
        eq(notifications.tenantId, tenantId),
        eq(notifications.status, 'unread')
      ));
  }

  async deleteNotification(notificationId: string, userId: string): Promise<void> {
    await db.delete(notifications)
      .where(and(
        eq(notifications.id, notificationId),
        eq(notifications.userId, userId)
      ));
  }

  async getUserNotifications(
    userId: string,
    tenantId: string,
    options: {
      status?: 'all' | 'read' | 'unread';
      limit?: number;
      offset?: number;
    } = {}
  ) {
    const { status = 'all', limit = 50, offset = 0 } = options;

    let query = db.select()
      .from(notifications)
      .where(and(
        eq(notifications.userId, userId),
        eq(notifications.tenantId, tenantId)
      ));

    if (status !== 'all') {
      query = query.where(eq(notifications.status, status));
    }

    return await query
      .orderBy(notifications.createdAt)
      .limit(limit)
      .offset(offset);
  }

  async getNotificationStats(userId: string, tenantId: string) {
    const [total, unread] = await Promise.all([
      db.select({ count: sql`count(*)` })
        .from(notifications)
        .where(and(
          eq(notifications.userId, userId),
          eq(notifications.tenantId, tenantId)
        )),
      db.select({ count: sql`count(*)` })
        .from(notifications)
        .where(and(
          eq(notifications.userId, userId),
          eq(notifications.tenantId, tenantId),
          eq(notifications.status, 'unread')
        ))
    ]);

    return {
      total: total[0]?.count || 0,
      unread: unread[0]?.count || 0
    };
  }
}

// Global instance
let notificationService: NotificationService | null = null;

export function getNotificationService(): NotificationService {
  if (!notificationService) {
    notificationService = new NotificationService();
  }
  return notificationService;
} 