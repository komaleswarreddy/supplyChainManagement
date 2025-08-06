import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { db } from '../db';
import { eq, and, or, like, desc, asc, gte, lte } from 'drizzle-orm';
import { AppError } from '../utils/app-error';
import { authenticate, hasPermissions } from '../middleware/auth';

// Define route schemas
const createNotificationSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  message: z.string().min(1, 'Message is required'),
  type: z.enum(['INFO', 'SUCCESS', 'WARNING', 'ERROR', 'ALERT']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
  category: z.enum(['SYSTEM', 'WORKFLOW', 'APPROVAL', 'REMINDER', 'ALERT', 'UPDATE', 'SECURITY', 'MAINTENANCE']),
  
  // Recipients
  recipients: z.object({
    users: z.array(z.string().uuid()).optional(),
    roles: z.array(z.string()).optional(),
    departments: z.array(z.string()).optional(),
    groups: z.array(z.string().uuid()).optional(),
    all: z.boolean().default(false),
  }),
  
  // Delivery channels
  channels: z.object({
    inApp: z.boolean().default(true),
    email: z.boolean().default(false),
    sms: z.boolean().default(false),
    push: z.boolean().default(false),
    slack: z.boolean().default(false),
    teams: z.boolean().default(false),
  }),
  
  // Scheduling
  scheduling: z.object({
    sendImmediately: z.boolean().default(true),
    scheduledFor: z.string().datetime().optional(),
    recurring: z.object({
      enabled: z.boolean().default(false),
      frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY']).optional(),
      interval: z.number().int().positive().optional(),
      endDate: z.string().datetime().optional(),
    }).optional(),
  }),
  
  // Content
  content: z.object({
    summary: z.string().optional(),
    body: z.string().optional(),
    actionUrl: z.string().url().optional(),
    actionText: z.string().optional(),
    imageUrl: z.string().url().optional(),
    metadata: z.record(z.any()).optional(),
  }).optional(),
  
  // Configuration
  configuration: z.object({
    persistent: z.boolean().default(true),
    dismissible: z.boolean().default(true),
    autoExpire: z.boolean().default(false),
    expiresAt: z.string().datetime().optional(),
    requireAcknowledgment: z.boolean().default(false),
    trackDelivery: z.boolean().default(true),
  }).optional(),
  
  tags: z.array(z.string()).optional(),
  relatedEntityType: z.string().optional(),
  relatedEntityId: z.string().uuid().optional(),
});

const createMessageSchema = z.object({
  subject: z.string().min(1, 'Subject is required'),
  body: z.string().min(1, 'Message body is required'),
  messageType: z.enum(['DIRECT', 'BROADCAST', 'ANNOUNCEMENT', 'SYSTEM']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  
  // Recipients
  recipients: z.object({
    to: z.array(z.string().uuid()).min(1, 'At least one recipient is required'),
    cc: z.array(z.string().uuid()).optional(),
    bcc: z.array(z.string().uuid()).optional(),
  }),
  
  // Content
  content: z.object({
    format: z.enum(['TEXT', 'HTML', 'MARKDOWN']).default('TEXT'),
    attachments: z.array(z.object({
      name: z.string(),
      url: z.string(),
      type: z.string(),
      size: z.number(),
    })).optional(),
    templateId: z.string().uuid().optional(),
    templateData: z.record(z.any()).optional(),
  }).optional(),
  
  // Configuration
  configuration: z.object({
    readReceiptRequired: z.boolean().default(false),
    deliveryReceiptRequired: z.boolean().default(false),
    expiresAt: z.string().datetime().optional(),
    allowReplies: z.boolean().default(true),
    encryptionEnabled: z.boolean().default(false),
  }).optional(),
  
  tags: z.array(z.string()).optional(),
  relatedEntityType: z.string().optional(),
  relatedEntityId: z.string().uuid().optional(),
});

const createAlertRuleSchema = z.object({
  name: z.string().min(1, 'Rule name is required'),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
  
  // Trigger conditions
  trigger: z.object({
    eventType: z.string().min(1, 'Event type is required'),
    conditions: z.array(z.object({
      field: z.string(),
      operator: z.enum(['EQUALS', 'NOT_EQUALS', 'GREATER_THAN', 'LESS_THAN', 'CONTAINS', 'NOT_CONTAINS', 'IN', 'NOT_IN']),
      value: z.any(),
    })),
    aggregation: z.object({
      enabled: z.boolean().default(false),
      function: z.enum(['COUNT', 'SUM', 'AVG', 'MIN', 'MAX']).optional(),
      field: z.string().optional(),
      timeWindow: z.number().int().positive().optional(),
      threshold: z.number().optional(),
    }).optional(),
  }),
  
  // Alert configuration
  alert: z.object({
    severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
    title: z.string().min(1, 'Alert title is required'),
    message: z.string().min(1, 'Alert message is required'),
    category: z.string().min(1, 'Category is required'),
    tags: z.array(z.string()).optional(),
  }),
  
  // Notification settings
  notifications: z.object({
    channels: z.object({
      inApp: z.boolean().default(true),
      email: z.boolean().default(false),
      sms: z.boolean().default(false),
      slack: z.boolean().default(false),
      webhook: z.boolean().default(false),
    }),
    recipients: z.object({
      users: z.array(z.string().uuid()).optional(),
      roles: z.array(z.string()).optional(),
      departments: z.array(z.string()).optional(),
      escalation: z.array(z.object({
        level: z.number().int().positive(),
        delayMinutes: z.number().int().positive(),
        recipients: z.array(z.string().uuid()),
      })).optional(),
    }),
    throttling: z.object({
      enabled: z.boolean().default(false),
      maxPerHour: z.number().int().positive().optional(),
      maxPerDay: z.number().int().positive().optional(),
      cooldownMinutes: z.number().int().positive().optional(),
    }).optional(),
  }),
});

const createCommunicationTemplateSchema = z.object({
  name: z.string().min(1, 'Template name is required'),
  description: z.string().optional(),
  type: z.enum(['EMAIL', 'SMS', 'PUSH', 'IN_APP', 'SLACK']),
  category: z.string().min(1, 'Category is required'),
  
  // Template content
  content: z.object({
    subject: z.string().optional(),
    body: z.string().min(1, 'Template body is required'),
    format: z.enum(['TEXT', 'HTML', 'MARKDOWN']).default('TEXT'),
    variables: z.array(z.object({
      name: z.string(),
      description: z.string(),
      type: z.enum(['STRING', 'NUMBER', 'DATE', 'BOOLEAN', 'OBJECT']),
      required: z.boolean().default(false),
      defaultValue: z.any().optional(),
    })).optional(),
  }),
  
  // Configuration
  configuration: z.object({
    isActive: z.boolean().default(true),
    version: z.string().default('1.0'),
    locale: z.string().default('en'),
    tags: z.array(z.string()).optional(),
  }).optional(),
});

// Notification routes
export default async function notificationRoutes(fastify: FastifyInstance) {
  // Apply authentication middleware to all routes
  fastify.addHook('preHandler', authenticate);
  
  // Get all notifications for current user
  fastify.get('/notifications', {
    preHandler: hasPermissions(['view_notifications']),
    schema: {
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'number', default: 1 },
          pageSize: { type: 'number', default: 20 },
          type: { type: 'string', enum: ['INFO', 'SUCCESS', 'WARNING', 'ERROR', 'ALERT'] },
          priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] },
          category: { type: 'string', enum: ['SYSTEM', 'WORKFLOW', 'APPROVAL', 'REMINDER', 'ALERT', 'UPDATE', 'SECURITY', 'MAINTENANCE'] },
          status: { type: 'string', enum: ['UNREAD', 'READ', 'ACKNOWLEDGED', 'DISMISSED'] },
          dateFrom: { type: 'string', format: 'date-time' },
          dateTo: { type: 'string', format: 'date-time' },
          search: { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  title: { type: 'string' },
                  message: { type: 'string' },
                  type: { type: 'string' },
                  priority: { type: 'string' },
                  category: { type: 'string' },
                  status: { type: 'string' },
                  actionUrl: { type: 'string' },
                  actionText: { type: 'string' },
                  createdAt: { type: 'string', format: 'date-time' },
                  readAt: { type: 'string', format: 'date-time' },
                  acknowledgedAt: { type: 'string', format: 'date-time' },
                },
              },
            },
            total: { type: 'number' },
            unreadCount: { type: 'number' },
            page: { type: 'number' },
            pageSize: { type: 'number' },
            totalPages: { type: 'number' },
          },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { 
      page = 1, 
      pageSize = 20, 
      type, 
      priority, 
      category,
      status,
      search 
    } = request.query as any;
    const user = request.user as any;
    
    // Mock data for demonstration
    const mockNotifications = Array.from({ length: 85 }, (_, i) => ({
      id: `notification-${i + 1}`,
      title: `${['System Update', 'Approval Required', 'Task Reminder', 'Security Alert', 'Maintenance Notice'][i % 5]} ${i + 1}`,
      message: `${['System will be updated tonight', 'Your approval is required for requisition', 'Task deadline approaching', 'Suspicious activity detected', 'Scheduled maintenance window'][i % 5]}`,
      type: ['INFO', 'SUCCESS', 'WARNING', 'ERROR', 'ALERT'][i % 5] as any,
      priority: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'][i % 4] as any,
      category: ['SYSTEM', 'WORKFLOW', 'APPROVAL', 'REMINDER', 'ALERT'][i % 5] as any,
      status: i < 15 ? 'UNREAD' : ['READ', 'ACKNOWLEDGED', 'DISMISSED'][i % 3] as any,
      actionUrl: i % 3 === 0 ? '/dashboard/approvals' : undefined,
      actionText: i % 3 === 0 ? 'View Details' : undefined,
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      readAt: i >= 15 ? new Date(Date.now() - Math.random() * 25 * 24 * 60 * 60 * 1000).toISOString() : undefined,
      acknowledgedAt: i % 5 === 0 && i >= 15 ? new Date(Date.now() - Math.random() * 20 * 24 * 60 * 60 * 1000).toISOString() : undefined,
    }));
    
    // Apply filters
    let filteredData = mockNotifications;
    
    if (type) {
      filteredData = filteredData.filter(item => item.type === type);
    }
    
    if (priority) {
      filteredData = filteredData.filter(item => item.priority === priority);
    }
    
    if (category) {
      filteredData = filteredData.filter(item => item.category === category);
    }
    
    if (status) {
      filteredData = filteredData.filter(item => item.status === status);
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      filteredData = filteredData.filter(item => 
        item.title.toLowerCase().includes(searchLower) ||
        item.message.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply pagination
    const total = filteredData.length;
    const unreadCount = filteredData.filter(item => item.status === 'UNREAD').length;
    const totalPages = Math.ceil(total / pageSize);
    const offset = (page - 1) * pageSize;
    const items = filteredData.slice(offset, offset + pageSize);
    
    return {
      items,
      total,
      unreadCount,
      page,
      pageSize,
      totalPages,
    };
  });
  
  // Create notification
  fastify.post('/notifications', {
    preHandler: hasPermissions(['create_notifications']),
    schema: {
      body: {
        type: 'object',
        required: ['title', 'message', 'type', 'category', 'recipients'],
        properties: {
          title: { type: 'string' },
          message: { type: 'string' },
          type: { type: 'string', enum: ['INFO', 'SUCCESS', 'WARNING', 'ERROR', 'ALERT'] },
          priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] },
          category: { type: 'string', enum: ['SYSTEM', 'WORKFLOW', 'APPROVAL', 'REMINDER', 'ALERT', 'UPDATE', 'SECURITY', 'MAINTENANCE'] },
          recipients: { type: 'object' },
          channels: { type: 'object' },
          scheduling: { type: 'object' },
          content: { type: 'object' },
          configuration: { type: 'object' },
          tags: { type: 'array' },
          relatedEntityType: { type: 'string' },
          relatedEntityId: { type: 'string' },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const data = createNotificationSchema.parse(request.body);
    const user = request.user as any;
    
    // Mock creation
    const newNotification = {
      id: `notification-${Date.now()}`,
      ...data,
      status: 'SENT',
      deliveryStatus: {
        total: 1,
        delivered: 1,
        failed: 0,
        pending: 0,
      },
      tenantId: user.tenantId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: user.id,
    };
    
    reply.status(201);
    return {
      ...newNotification,
      message: 'Notification created and sent successfully',
    };
  });
  
  // Mark notification as read
  fastify.patch('/notifications/:id/read', {
    preHandler: hasPermissions(['update_notifications']),
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const user = request.user as any;
    
    return {
      id,
      status: 'read',
      readAt: new Date().toISOString(),
      message: 'Notification marked as read',
    };
  });
  
  // Mark notification as acknowledged
  fastify.patch('/notifications/:id/acknowledge', {
    preHandler: hasPermissions(['update_notifications']),
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const user = request.user as any;
    
    return {
      id,
      status: 'ACKNOWLEDGED',
      acknowledgedAt: new Date().toISOString(),
      acknowledgedBy: user.id,
      message: 'Notification acknowledged',
    };
  });
  
  // Bulk mark notifications as read
  fastify.patch('/notifications/bulk-read', {
    preHandler: hasPermissions(['update_notifications']),
    schema: {
      body: {
        type: 'object',
        required: ['notificationIds'],
        properties: {
          notificationIds: { 
            type: 'array', 
            items: { type: 'string' },
            minItems: 1,
          },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { notificationIds } = request.body as { notificationIds: string[] };
    const user = request.user as any;
    
    return {
      updatedCount: notificationIds.length,
      readAt: new Date().toISOString(),
      message: `${notificationIds.length} notifications marked as read`,
    };
  });
  
  // Get all messages for current user
  fastify.get('/messages', {
    preHandler: hasPermissions(['view_messages']),
    schema: {
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'number', default: 1 },
          pageSize: { type: 'number', default: 20 },
          messageType: { type: 'string', enum: ['DIRECT', 'BROADCAST', 'ANNOUNCEMENT', 'SYSTEM'] },
          priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] },
          status: { type: 'string', enum: ['UNREAD', 'READ', 'REPLIED', 'ARCHIVED'] },
          folder: { type: 'string', enum: ['INBOX', 'SENT', 'DRAFTS', 'ARCHIVE', 'TRASH'] },
          search: { type: 'string' },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { 
      page = 1, 
      pageSize = 20, 
      messageType, 
      priority,
      status,
      folder = 'INBOX',
      search 
    } = request.query as any;
    const user = request.user as any;
    
    // Mock data for demonstration
    const mockMessages = Array.from({ length: 45 }, (_, i) => ({
      id: `message-${i + 1}`,
      subject: `${['Meeting Request', 'Project Update', 'Approval Needed', 'System Notification', 'Weekly Report'][i % 5]} ${i + 1}`,
      body: `Message body content for ${i + 1}...`,
      messageType: ['DIRECT', 'BROADCAST', 'ANNOUNCEMENT', 'SYSTEM'][i % 4] as any,
      priority: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'][i % 4] as any,
      status: i < 10 ? 'UNREAD' : ['READ', 'REPLIED', 'ARCHIVED'][i % 3] as any,
      from: {
        id: `user-${(i % 10) + 1}`,
        name: `User ${(i % 10) + 1}`,
        email: `user${(i % 10) + 1}@example.com`,
      },
      hasAttachments: i % 4 === 0,
      attachmentCount: i % 4 === 0 ? Math.floor(Math.random() * 3) + 1 : 0,
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      readAt: i >= 10 ? new Date(Date.now() - Math.random() * 25 * 24 * 60 * 60 * 1000).toISOString() : undefined,
    }));
    
    // Apply filters
    let filteredData = mockMessages;
    
    if (messageType) {
      filteredData = filteredData.filter(item => item.messageType === messageType);
    }
    
    if (priority) {
      filteredData = filteredData.filter(item => item.priority === priority);
    }
    
    if (status) {
      filteredData = filteredData.filter(item => item.status === status);
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      filteredData = filteredData.filter(item => 
        item.subject.toLowerCase().includes(searchLower) ||
        item.body.toLowerCase().includes(searchLower) ||
        item.from.name.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply pagination
    const total = filteredData.length;
    const unreadCount = filteredData.filter(item => item.status === 'UNREAD').length;
    const totalPages = Math.ceil(total / pageSize);
    const offset = (page - 1) * pageSize;
    const items = filteredData.slice(offset, offset + pageSize);
    
    return {
      items,
      total,
      unreadCount,
      page,
      pageSize,
      totalPages,
    };
  });
  
  // Send message
  fastify.post('/messages', {
    preHandler: hasPermissions(['send_messages']),
    schema: {
      body: {
        type: 'object',
        required: ['subject', 'body', 'messageType', 'recipients'],
        properties: {
          subject: { type: 'string' },
          body: { type: 'string' },
          messageType: { type: 'string', enum: ['DIRECT', 'BROADCAST', 'ANNOUNCEMENT', 'SYSTEM'] },
          priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] },
          recipients: { type: 'object' },
          content: { type: 'object' },
          configuration: { type: 'object' },
          tags: { type: 'array' },
          relatedEntityType: { type: 'string' },
          relatedEntityId: { type: 'string' },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const data = createMessageSchema.parse(request.body);
    const user = request.user as any;
    
    // Mock creation
    const newMessage = {
      id: `message-${Date.now()}`,
      ...data,
      status: 'SENT',
      deliveryStatus: {
        total: data.recipients.to.length,
        delivered: data.recipients.to.length,
        failed: 0,
        pending: 0,
      },
      tenantId: user.tenantId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: user.id,
    };
    
    reply.status(201);
    return {
      ...newMessage,
      message: 'Message sent successfully',
    };
  });
  
  // Get alert rules
  fastify.get('/alert-rules', {
    preHandler: hasPermissions(['view_alert_rules']),
    schema: {
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'number', default: 1 },
          pageSize: { type: 'number', default: 10 },
          isActive: { type: 'boolean' },
          severity: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] },
          category: { type: 'string' },
          search: { type: 'string' },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { 
      page = 1, 
      pageSize = 10, 
      isActive, 
      severity,
      category,
      search 
    } = request.query as any;
    
    // Mock data for demonstration
    const mockAlertRules = Array.from({ length: 25 }, (_, i) => ({
      id: `alert-rule-${i + 1}`,
      name: `${['High CPU Usage', 'Low Inventory', 'Failed Login Attempts', 'Payment Overdue', 'Contract Expiry'][i % 5]} Alert ${i + 1}`,
      description: `Alert rule for monitoring ${['system performance', 'inventory levels', 'security events', 'payment status', 'contract dates'][i % 5]}`,
      isActive: i % 5 !== 0,
      eventType: ['SYSTEM_METRIC', 'INVENTORY_LEVEL', 'SECURITY_EVENT', 'PAYMENT_STATUS', 'CONTRACT_STATUS'][i % 5],
      severity: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'][i % 4] as any,
      category: ['System', 'Inventory', 'Security', 'Finance', 'Legal'][i % 5],
      triggeredCount: Math.floor(Math.random() * 50),
      lastTriggered: i % 3 === 0 ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() : undefined,
      createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    }));
    
    // Apply filters
    let filteredData = mockAlertRules;
    
    if (isActive !== undefined) {
      filteredData = filteredData.filter(item => item.isActive === isActive);
    }
    
    if (severity) {
      filteredData = filteredData.filter(item => item.severity === severity);
    }
    
    if (category) {
      filteredData = filteredData.filter(item => item.category.toLowerCase().includes(category.toLowerCase()));
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      filteredData = filteredData.filter(item => 
        item.name.toLowerCase().includes(searchLower) ||
        item.description.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply pagination
    const total = filteredData.length;
    const totalPages = Math.ceil(total / pageSize);
    const offset = (page - 1) * pageSize;
    const items = filteredData.slice(offset, offset + pageSize);
    
    return {
      items,
      total,
      page,
      pageSize,
      totalPages,
    };
  });
  
  // Create alert rule
  fastify.post('/alert-rules', {
    preHandler: hasPermissions(['create_alert_rules']),
    schema: {
      body: {
        type: 'object',
        required: ['name', 'trigger', 'alert', 'notifications'],
        properties: {
          name: { type: 'string' },
          description: { type: 'string' },
          isActive: { type: 'boolean' },
          trigger: { type: 'object' },
          alert: { type: 'object' },
          notifications: { type: 'object' },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const data = createAlertRuleSchema.parse(request.body);
    const user = request.user as any;
    
    // Mock creation
    const newAlertRule = {
      id: `alert-rule-${Date.now()}`,
      ...data,
      triggeredCount: 0,
      tenantId: user.tenantId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: user.id,
    };
    
    reply.status(201);
    return {
      ...newAlertRule,
      message: 'Alert rule created successfully',
    };
  });
  
  // Get communication templates
  fastify.get('/templates', {
    preHandler: hasPermissions(['view_templates']),
    schema: {
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'number', default: 1 },
          pageSize: { type: 'number', default: 10 },
          type: { type: 'string', enum: ['EMAIL', 'SMS', 'PUSH', 'IN_APP', 'SLACK'] },
          category: { type: 'string' },
          isActive: { type: 'boolean' },
          search: { type: 'string' },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { 
      page = 1, 
      pageSize = 10, 
      type, 
      category,
      isActive,
      search 
    } = request.query as any;
    
    // Mock data for demonstration
    const mockTemplates = Array.from({ length: 30 }, (_, i) => ({
      id: `template-${i + 1}`,
      name: `${['Welcome Email', 'Password Reset', 'Order Confirmation', 'Invoice Reminder', 'System Alert'][i % 5]} Template ${i + 1}`,
      description: `Template for ${['user onboarding', 'password recovery', 'order processing', 'payment reminders', 'system notifications'][i % 5]}`,
      type: ['EMAIL', 'SMS', 'PUSH', 'IN_APP', 'SLACK'][i % 5] as any,
      category: ['User Management', 'Security', 'Orders', 'Finance', 'System'][i % 5],
      isActive: i % 6 !== 0,
      version: `${Math.floor(i / 5) + 1}.${i % 5}`,
      usageCount: Math.floor(Math.random() * 100),
      lastUsed: i % 3 === 0 ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() : undefined,
      createdAt: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    }));
    
    // Apply filters
    let filteredData = mockTemplates;
    
    if (type) {
      filteredData = filteredData.filter(item => item.type === type);
    }
    
    if (category) {
      filteredData = filteredData.filter(item => item.category.toLowerCase().includes(category.toLowerCase()));
    }
    
    if (isActive !== undefined) {
      filteredData = filteredData.filter(item => item.isActive === isActive);
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      filteredData = filteredData.filter(item => 
        item.name.toLowerCase().includes(searchLower) ||
        item.description.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply pagination
    const total = filteredData.length;
    const totalPages = Math.ceil(total / pageSize);
    const offset = (page - 1) * pageSize;
    const items = filteredData.slice(offset, offset + pageSize);
    
    return {
      items,
      total,
      page,
      pageSize,
      totalPages,
    };
  });
  
  // Create communication template
  fastify.post('/templates', {
    preHandler: hasPermissions(['create_templates']),
    schema: {
      body: {
        type: 'object',
        required: ['name', 'type', 'category', 'content'],
        properties: {
          name: { type: 'string' },
          description: { type: 'string' },
          type: { type: 'string', enum: ['EMAIL', 'SMS', 'PUSH', 'IN_APP', 'SLACK'] },
          category: { type: 'string' },
          content: { type: 'object' },
          configuration: { type: 'object' },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const data = createCommunicationTemplateSchema.parse(request.body);
    const user = request.user as any;
    
    // Mock creation
    const newTemplate = {
      id: `template-${Date.now()}`,
      ...data,
      usageCount: 0,
      tenantId: user.tenantId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: user.id,
    };
    
    reply.status(201);
    return {
      ...newTemplate,
      message: 'Communication template created successfully',
    };
  });
  
  // Get notification analytics
  fastify.get('/analytics', {
    preHandler: hasPermissions(['view_reports']),
    schema: {
      querystring: {
        type: 'object',
        properties: {
          startDate: { type: 'string', format: 'date-time' },
          endDate: { type: 'string', format: 'date-time' },
          type: { type: 'string' },
          category: { type: 'string' },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    // Mock analytics data
    const analytics = {
      summary: {
        totalNotifications: 1250,
        totalMessages: 890,
        deliveryRate: 98.5,
        readRate: 76.3,
        responseRate: 45.2,
        activeAlertRules: 23,
        triggeredAlerts: 156,
      },
      notificationsByType: [
        { type: 'INFO', count: 450, percentage: 36 },
        { type: 'WARNING', count: 325, percentage: 26 },
        { type: 'SUCCESS', count: 275, percentage: 22 },
        { type: 'ERROR', count: 125, percentage: 10 },
        { type: 'ALERT', count: 75, percentage: 6 },
      ],
      notificationsByCategory: [
        { category: 'WORKFLOW', count: 380, percentage: 30.4 },
        { category: 'SYSTEM', count: 275, percentage: 22 },
        { category: 'APPROVAL', count: 225, percentage: 18 },
        { category: 'REMINDER', count: 200, percentage: 16 },
        { category: 'ALERT', count: 170, percentage: 13.6 },
      ],
      deliveryChannels: [
        { channel: 'IN_APP', sent: 1250, delivered: 1248, rate: 99.8 },
        { channel: 'EMAIL', sent: 890, delivered: 875, rate: 98.3 },
        { channel: 'SMS', sent: 234, delivered: 228, rate: 97.4 },
        { channel: 'PUSH', sent: 567, delivered: 552, rate: 97.4 },
        { channel: 'SLACK', sent: 123, delivered: 121, rate: 98.4 },
      ],
      engagementMetrics: {
        readRates: Array.from({ length: 7 }, (_, i) => ({
          date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
          rate: Math.floor(Math.random() * 20) + 70,
        })),
        responseRates: Array.from({ length: 7 }, (_, i) => ({
          date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
          rate: Math.floor(Math.random() * 20) + 35,
        })),
      },
      alertMetrics: {
        totalRules: 23,
        activeRules: 20,
        triggeredToday: 12,
        resolvedToday: 8,
        byCategory: [
          { category: 'System', count: 8, triggered: 45 },
          { category: 'Security', count: 6, triggered: 23 },
          { category: 'Performance', count: 5, triggered: 67 },
          { category: 'Business', count: 4, triggered: 21 },
        ],
      },
      timeline: Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - 29 + i);
        return {
          date: date.toISOString().slice(0, 10),
          notifications: Math.floor(Math.random() * 50) + 20,
          messages: Math.floor(Math.random() * 30) + 15,
          alerts: Math.floor(Math.random() * 10) + 2,
        };
      }),
    };
    
    return analytics;
  });
} 