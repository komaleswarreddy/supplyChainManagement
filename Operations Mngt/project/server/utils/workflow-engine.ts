import { db } from '../db/index.js';
import { automationWorkflows, automationWorkflowExecutions, automationWorkflowSteps } from '../db/schema/automation.js';
import { eq, and } from 'drizzle-orm';
import { logger } from './logger.js';
import { getNotificationService } from './notifications.js';
import nodemailer from 'nodemailer';

export interface WorkflowContext {
  tenantId: string;
  userId: string;
  inputData: Record<string, any>;
  variables: Record<string, any>;
}

export interface WorkflowStep {
  id: string;
  type: 'condition' | 'action' | 'loop' | 'delay' | 'webhook';
  config: Record<string, any>;
  nextStepId?: string;
  conditionStepId?: string;
}

export class WorkflowEngine {
  private context: WorkflowContext;

  constructor(context: WorkflowContext) {
    this.context = context;
  }

  async executeWorkflow(workflowId: string): Promise<void> {
    try {
      // Get workflow definition
      const workflow = await db.query.automationWorkflows.findFirst({
        where: eq(automationWorkflows.id, workflowId),
        with: {
          steps: true
        }
      });

      if (!workflow) {
        throw new Error(`Workflow ${workflowId} not found`);
      }

      // Create execution record
      const execution = await db.insert(automationWorkflowExecutions).values({
        id: crypto.randomUUID(),
        tenantId: this.context.tenantId,
        workflowId,
        status: 'running',
        startedAt: new Date(),
        inputData: this.context.inputData,
        variables: this.context.variables
      }).returning();

      const executionId = execution[0].id;

      try {
        // Execute workflow steps
        await this.executeSteps(workflow.steps, executionId);
        
        // Mark execution as completed
        await db.update(automationWorkflowExecutions)
          .set({ 
            status: 'completed',
            completedAt: new Date()
          })
          .where(eq(automationWorkflowExecutions.id, executionId));

        logger.info(`Workflow ${workflowId} executed successfully`);
      } catch (error) {
        // Mark execution as failed
        await db.update(automationWorkflowExecutions)
          .set({ 
            status: 'failed',
            errorMessage: error instanceof Error ? error.message : 'Unknown error',
            completedAt: new Date()
          })
          .where(eq(automationWorkflowExecutions.id, executionId));

        throw error;
      }
    } catch (error) {
      logger.error(`Failed to execute workflow ${workflowId}:`, error);
      throw error;
    }
  }

  private async executeSteps(steps: any[], executionId: string): Promise<void> {
    for (const step of steps) {
      await this.executeStep(step, executionId);
    }
  }

  private async executeStep(step: WorkflowStep, executionId: string): Promise<void> {
    // Record step execution
    await db.insert(automationWorkflowSteps).values({
      id: crypto.randomUUID(),
      tenantId: this.context.tenantId,
      executionId,
      stepId: step.id,
      status: 'running',
      startedAt: new Date()
    });

    try {
      switch (step.type) {
        case 'condition':
          await this.executeCondition(step);
          break;
        case 'action':
          await this.executeAction(step);
          break;
        case 'loop':
          await this.executeLoop(step);
          break;
        case 'delay':
          await this.executeDelay(step);
          break;
        case 'webhook':
          await this.executeWebhook(step);
          break;
        default:
          throw new Error(`Unknown step type: ${step.type}`);
      }

      // Mark step as completed
      await db.update(automationWorkflowSteps)
        .set({ 
          status: 'completed',
          completedAt: new Date()
        })
        .where(and(
          eq(automationWorkflowSteps.executionId, executionId),
          eq(automationWorkflowSteps.stepId, step.id)
        ));
    } catch (error) {
      // Mark step as failed
      await db.update(automationWorkflowSteps)
        .set({ 
          status: 'failed',
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
          completedAt: new Date()
        })
        .where(and(
          eq(automationWorkflowSteps.executionId, executionId),
          eq(automationWorkflowSteps.stepId, step.id)
        ));
      throw error;
    }
  }

  private async executeCondition(step: WorkflowStep): Promise<void> {
    const { condition, operator, value } = step.config;
    const actualValue = this.getVariableValue(condition);
    
    let result = false;
    switch (operator) {
      case 'equals':
        result = actualValue === value;
        break;
      case 'not_equals':
        result = actualValue !== value;
        break;
      case 'greater_than':
        result = actualValue > value;
        break;
      case 'less_than':
        result = actualValue < value;
        break;
      case 'contains':
        result = String(actualValue).includes(String(value));
        break;
      default:
        throw new Error(`Unknown operator: ${operator}`);
    }

    this.context.variables[`${step.id}_result`] = result;
  }

  private async executeAction(step: WorkflowStep): Promise<void> {
    const { action, parameters } = step.config;
    
    switch (action) {
      case 'send_email':
        await this.sendEmail(parameters);
        break;
      case 'create_record':
        await this.createRecord(parameters);
        break;
      case 'update_record':
        await this.updateRecord(parameters);
        break;
      case 'send_notification':
        await this.sendNotification(parameters);
        break;
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }

  private async executeLoop(step: WorkflowStep): Promise<void> {
    const { collection, maxIterations = 100 } = step.config;
    const items = this.getVariableValue(collection) || [];
    
    if (!Array.isArray(items)) {
      throw new Error(`Collection ${collection} is not an array`);
    }

    const iterations = Math.min(items.length, maxIterations);
    
    for (let i = 0; i < iterations; i++) {
      this.context.variables['current_index'] = i;
      this.context.variables['current_item'] = items[i];
      
      // Execute loop body steps
      if (step.config.steps) {
        await this.executeSteps(step.config.steps, '');
      }
    }
  }

  private async executeDelay(step: WorkflowStep): Promise<void> {
    const { duration } = step.config;
    await new Promise(resolve => setTimeout(resolve, duration));
  }

  private async executeWebhook(step: WorkflowStep): Promise<void> {
    const { url, method = 'POST', headers = {}, body } = step.config;
    
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      body: body ? JSON.stringify(body) : undefined
    });

    if (!response.ok) {
      throw new Error(`Webhook failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    this.context.variables[`${step.id}_response`] = result;
  }

  private getVariableValue(path: string): any {
    const parts = path.split('.');
    let value: any = this.context.variables;
    
    for (const part of parts) {
      if (value && typeof value === 'object' && part in value) {
        value = value[part];
      } else {
        return undefined;
      }
    }
    
    return value;
  }

  private async sendEmail(parameters: any): Promise<void> {
    try {
      const { to, subject, body, from = process.env.SMTP_FROM || 'noreply@pls-scm.com' } = parameters;
      
      if (!to || !subject || !body) {
        throw new Error('Missing required email parameters: to, subject, body');
      }

      // Create email transporter
      const transporter = nodemailer.createTransporter({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER || '',
          pass: process.env.SMTP_PASS || ''
        }
      });

      // Send email
      await transporter.sendMail({
        from,
        to,
        subject,
        html: body
      });

      logger.info(`Workflow email sent to ${to}: ${subject}`);
    } catch (error) {
      logger.error('Failed to send workflow email:', error);
      throw error;
    }
  }

  private async createRecord(parameters: any): Promise<void> {
    try {
      const { table, data } = parameters;
      
      if (!table || !data) {
        throw new Error('Missing required record creation parameters: table, data');
      }

      // Dynamic table selection based on parameter
      let tableSchema: any;
      switch (table) {
        case 'suppliers':
          tableSchema = (await import('../db/schema/suppliers.js')).suppliers;
          break;
        case 'inventory_items':
          tableSchema = (await import('../db/schema/inventory.js')).inventoryItems;
          break;
        case 'purchase_orders':
          tableSchema = (await import('../db/schema/procurement.js')).purchaseOrders;
          break;
        case 'orders':
          tableSchema = (await import('../db/schema/orders.js')).orders;
          break;
        default:
          throw new Error(`Unsupported table: ${table}`);
      }

      // Add required fields
      const recordData = {
        id: crypto.randomUUID(),
        tenantId: this.context.tenantId,
        createdAt: new Date(),
        createdBy: this.context.userId,
        ...data
      };

      await db.insert(tableSchema).values(recordData);
      
      logger.info(`Workflow created record in ${table}: ${recordData.id}`);
    } catch (error) {
      logger.error('Failed to create workflow record:', error);
      throw error;
    }
  }

  private async updateRecord(parameters: any): Promise<void> {
    try {
      const { table, id, data } = parameters;
      
      if (!table || !id || !data) {
        throw new Error('Missing required record update parameters: table, id, data');
      }

      // Dynamic table selection based on parameter
      let tableSchema: any;
      switch (table) {
        case 'suppliers':
          tableSchema = (await import('../db/schema/suppliers.js')).suppliers;
          break;
        case 'inventory_items':
          tableSchema = (await import('../db/schema/inventory.js')).inventoryItems;
          break;
        case 'purchase_orders':
          tableSchema = (await import('../db/schema/procurement.js')).purchaseOrders;
          break;
        case 'orders':
          tableSchema = (await import('../db/schema/orders.js')).orders;
          break;
        default:
          throw new Error(`Unsupported table: ${table}`);
      }

      // Add update fields
      const updateData = {
        ...data,
        updatedAt: new Date(),
        updatedBy: this.context.userId
      };

      await db.update(tableSchema)
        .set(updateData)
        .where(and(
          eq(tableSchema.id, id),
          eq(tableSchema.tenantId, this.context.tenantId)
        ));
      
      logger.info(`Workflow updated record in ${table}: ${id}`);
    } catch (error) {
      logger.error('Failed to update workflow record:', error);
      throw error;
    }
  }

  private async sendNotification(parameters: any): Promise<void> {
    try {
      const { recipients, title, message, type = 'info', category = 'workflow', priority = 'medium' } = parameters;
      
      if (!recipients || !title || !message) {
        throw new Error('Missing required notification parameters: recipients, title, message');
      }

      const notificationService = getNotificationService();
      
      // Convert recipients to proper format
      const notificationRecipients = recipients.map((recipient: any) => ({
        userId: recipient.userId || recipient,
        tenantId: this.context.tenantId,
        channels: recipient.channels || ['in_app', 'email']
      }));

      await notificationService.sendNotification(notificationRecipients, {
        title,
        message,
        type,
        category,
        priority,
        metadata: { source: 'workflow' }
      });

      logger.info(`Workflow notification sent to ${recipients.length} recipients: ${title}`);
    } catch (error) {
      logger.error('Failed to send workflow notification:', error);
      throw error;
    }
  }
} 