import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { authenticate } from '../middleware/auth';
import { hasPermissions } from '../middleware/auth';
import { db } from '../db';
import { 
  automationWorkflows, 
  automationTasks, 
  automationTriggers, 
  automationLogs, 
  automationSchedules, 
  automationVariables, 
  automationTemplates,
  automationPermissions
} from '../db/schema';
import { eq, and, desc, asc, like, gte, lte, inArray } from 'drizzle-orm';
import { sql } from 'drizzle-orm';

// Zod schemas for validation
const createAutomationWorkflowSchema = z.object({
  workflowNumber: z.string().min(1, 'Workflow number is required'),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  type: z.enum(['BUSINESS_PROCESS', 'DATA_PROCESSING', 'NOTIFICATION', 'INTEGRATION', 'REPORTING', 'CUSTOM']),
  category: z.enum(['PROCUREMENT', 'INVENTORY', 'LOGISTICS', 'FINANCE', 'QUALITY', 'SUPPLY_CHAIN', 'GENERAL']),
  status: z.enum(['ACTIVE', 'INACTIVE', 'DRAFT', 'ARCHIVED']).default('ACTIVE'),
  version: z.string().default('1.0'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
  isRecurring: z.boolean().default(false),
  recurrencePattern: z.record(z.any()).optional(),
  maxRetries: z.number().int().positive().default(3),
  retryDelay: z.number().int().positive().default(300), // seconds
  timeout: z.number().int().positive().default(3600), // seconds
  estimatedDuration: z.number().int().positive().optional(),
  actualDuration: z.number().int().positive().optional(),
  lastExecuted: z.string().datetime().optional(),
  nextExecution: z.string().datetime().optional(),
  executionCount: z.number().int().positive().default(0),
  successCount: z.number().int().positive().default(0),
  failureCount: z.number().int().positive().default(0),
  averageExecutionTime: z.number().positive().optional(),
  steps: z.array(z.object({
    stepNumber: z.number().int().positive(),
    name: z.string(),
    description: z.string().optional(),
    type: z.enum(['ACTION', 'CONDITION', 'APPROVAL', 'NOTIFICATION', 'INTEGRATION', 'DECISION']),
    action: z.string().optional(),
    parameters: z.record(z.any()).optional(),
    conditions: z.record(z.any()).optional(),
    assignedTo: z.string().uuid().optional(),
    estimatedDuration: z.number().int().positive().optional(),
    required: z.boolean().default(true),
    onFailure: z.enum(['CONTINUE', 'STOP', 'RETRY', 'ESCALATE']).default('STOP'),
  })),
  triggers: z.array(z.string()).optional(),
  conditions: z.record(z.any()).optional(),
  metadata: z.record(z.any()).optional(),
});

const updateAutomationWorkflowSchema = createAutomationWorkflowSchema.partial();

const createAutomationTaskSchema = z.object({
  taskNumber: z.string().min(1, 'Task number is required'),
  workflowId: z.string().uuid(),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  type: z.enum(['ACTION', 'CONDITION', 'APPROVAL', 'NOTIFICATION', 'INTEGRATION', 'DECISION']),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'CANCELLED', 'SKIPPED']).default('PENDING'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
  action: z.string().optional(),
  parameters: z.record(z.any()).optional(),
  conditions: z.record(z.any()).optional(),
  assignedTo: z.string().uuid().optional(),
  estimatedDuration: z.number().int().positive().optional(),
  actualDuration: z.number().int().positive().optional(),
  startTime: z.string().datetime().optional(),
  endTime: z.string().datetime().optional(),
  retryCount: z.number().int().positive().default(0),
  maxRetries: z.number().int().positive().default(3),
  errorMessage: z.string().optional(),
  result: z.record(z.any()).optional(),
  metadata: z.record(z.any()).optional(),
});

const updateAutomationTaskSchema = createAutomationTaskSchema.partial();

const createAutomationTriggerSchema = z.object({
  triggerNumber: z.string().min(1, 'Trigger number is required'),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  type: z.enum(['SCHEDULE', 'EVENT', 'WEBHOOK', 'MANUAL', 'CONDITION', 'INTEGRATION']),
  status: z.enum(['ACTIVE', 'INACTIVE', 'PAUSED']).default('ACTIVE'),
  workflowId: z.string().uuid(),
  eventType: z.string().optional(),
  eventSource: z.string().optional(),
  schedule: z.string().optional(), // Cron expression
  conditions: z.record(z.any()).optional(),
  parameters: z.record(z.any()).optional(),
  lastTriggered: z.string().datetime().optional(),
  nextTrigger: z.string().datetime().optional(),
  triggerCount: z.number().int().positive().default(0),
  metadata: z.record(z.any()).optional(),
});

const updateAutomationTriggerSchema = createAutomationTriggerSchema.partial();

const createAutomationScheduleSchema = z.object({
  scheduleNumber: z.string().min(1, 'Schedule number is required'),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  type: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'CUSTOM', 'RECURRING', 'ONE_TIME']),
  status: z.enum(['ACTIVE', 'INACTIVE', 'PAUSED', 'COMPLETED']).default('ACTIVE'),
  workflowId: z.string().uuid(),
  cronExpression: z.string().optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  timezone: z.string().default('UTC'),
  recurrencePattern: z.record(z.any()).optional(),
  lastExecuted: z.string().datetime().optional(),
  nextExecution: z.string().datetime().optional(),
  executionCount: z.number().int().positive().default(0),
  maxExecutions: z.number().int().positive().optional(),
  metadata: z.record(z.any()).optional(),
});

const updateAutomationScheduleSchema = createAutomationScheduleSchema.partial();

const createAutomationVariableSchema = z.object({
  variableNumber: z.string().min(1, 'Variable number is required'),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  type: z.enum(['STRING', 'NUMBER', 'BOOLEAN', 'DATE', 'ARRAY', 'OBJECT', 'JSON']),
  dataType: z.string().optional(),
  value: z.any(),
  defaultValue: z.any().optional(),
  isRequired: z.boolean().default(false),
  isEncrypted: z.boolean().default(false),
  scope: z.enum(['GLOBAL', 'WORKFLOW', 'TASK', 'USER']).default('GLOBAL'),
  workflowId: z.string().uuid().optional(),
  taskId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
  validation: z.record(z.any()).optional(),
  metadata: z.record(z.any()).optional(),
});

const updateAutomationVariableSchema = createAutomationVariableSchema.partial();

const createAutomationTemplateSchema = z.object({
  templateNumber: z.string().min(1, 'Template number is required'),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  category: z.enum(['PROCUREMENT', 'INVENTORY', 'LOGISTICS', 'FINANCE', 'QUALITY', 'SUPPLY_CHAIN', 'GENERAL']),
  type: z.enum(['WORKFLOW', 'TASK', 'TRIGGER', 'SCHEDULE']),
  version: z.string().default('1.0'),
  isDefault: z.boolean().default(false),
  isActive: z.boolean().default(true),
  template: z.record(z.any()),
  parameters: z.array(z.object({
    name: z.string(),
    type: z.string(),
    required: z.boolean(),
    defaultValue: z.any().optional(),
    description: z.string().optional(),
  })).optional(),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.any()).optional(),
});

const updateAutomationTemplateSchema = createAutomationTemplateSchema.partial();

// Automation routes
export default async function automationRoutes(fastify: FastifyInstance) {
  // Apply authentication middleware to all routes
  fastify.addHook('preHandler', authenticate);
  
  // Get all automation workflows
  fastify.get('/workflows', {
    preHandler: hasPermissions(['view_automation']),
    schema: {
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'number', default: 1 },
          pageSize: { type: 'number', default: 10 },
          type: { type: 'string', enum: ['BUSINESS_PROCESS', 'DATA_PROCESSING', 'NOTIFICATION', 'INTEGRATION', 'REPORTING', 'CUSTOM'] },
          category: { type: 'string', enum: ['PROCUREMENT', 'INVENTORY', 'LOGISTICS', 'FINANCE', 'QUALITY', 'SUPPLY_CHAIN', 'GENERAL'] },
          status: { type: 'string', enum: ['ACTIVE', 'INACTIVE', 'DRAFT', 'ARCHIVED'] },
          priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] },
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
                  workflowNumber: { type: 'string' },
                  name: { type: 'string' },
                  type: { type: 'string' },
                  category: { type: 'string' },
                  status: { type: 'string' },
                  priority: { type: 'string' },
                  version: { type: 'string' },
                  executionCount: { type: 'number' },
                  successCount: { type: 'number' },
                  failureCount: { type: 'number' },
                  lastExecuted: { type: 'string' },
                  nextExecution: { type: 'string' },
                  createdAt: { type: 'string' },
                },
              },
            },
            total: { type: 'number' },
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
      pageSize = 10, 
      type, 
      category, 
      status, 
      priority, 
      search 
    } = request.query as any;

    const offset = (page - 1) * pageSize;
    const conditions = [];

    if (type) conditions.push(eq(automationWorkflows.type, type));
    if (category) conditions.push(eq(automationWorkflows.category, category));
    if (status) conditions.push(eq(automationWorkflows.status, status));
    if (priority) conditions.push(eq(automationWorkflows.priority, priority));
    if (search) {
      conditions.push(
        like(automationWorkflows.name, `%${search}%`)
      );
    }

    const [workflows, total] = await Promise.all([
      db.select()
        .from(automationWorkflows)
        .where(and(...conditions))
        .orderBy(desc(automationWorkflows.createdAt))
        .limit(pageSize)
        .offset(offset),
      db.select({ count: sql`count(*)` })
        .from(automationWorkflows)
        .where(and(...conditions))
        .then(result => Number(result[0]?.count || 0))
    ]);

    return {
      items: workflows,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  });

  // Get automation workflow by ID
  fastify.get('/workflows/:id', {
    preHandler: hasPermissions(['view_automation']),
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
        required: ['id'],
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    
    const workflow = await db.select()
      .from(automationWorkflows)
      .where(eq(automationWorkflows.id, id))
      .limit(1);

    if (!workflow.length) {
      return reply.status(404).send({ error: 'Automation workflow not found' });
    }

    return workflow[0];
  });

  // Create automation workflow
  fastify.post('/workflows', {
    preHandler: hasPermissions(['manage_automation']),
    schema: {
      body: createAutomationWorkflowSchema,
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const data = request.body as z.infer<typeof createAutomationWorkflowSchema>;
    
    const [workflow] = await db.insert(automationWorkflows)
      .values({
        ...data,
        tenantId: request.user.tenantId,
        createdBy: request.user.id,
      })
      .returning();

    return reply.status(201).send(workflow);
  });

  // Update automation workflow
  fastify.put('/workflows/:id', {
    preHandler: hasPermissions(['manage_automation']),
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
        required: ['id'],
      },
      body: updateAutomationWorkflowSchema,
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const data = request.body as z.infer<typeof updateAutomationWorkflowSchema>;
    
    const [workflow] = await db.update(automationWorkflows)
      .set({
        ...data,
        updatedBy: request.user.id,
        updatedAt: new Date(),
      })
      .where(eq(automationWorkflows.id, id))
      .returning();

    if (!workflow) {
      return reply.status(404).send({ error: 'Automation workflow not found' });
    }

    return workflow;
  });

  // Delete automation workflow
  fastify.delete('/workflows/:id', {
    preHandler: hasPermissions(['manage_automation']),
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
        required: ['id'],
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    
    const [workflow] = await db.delete(automationWorkflows)
      .where(eq(automationWorkflows.id, id))
      .returning();

    if (!workflow) {
      return reply.status(404).send({ error: 'Automation workflow not found' });
    }

    return { message: 'Automation workflow deleted successfully' };
  });

  // Execute automation workflow
  fastify.post('/workflows/:id/execute', {
    preHandler: hasPermissions(['manage_automation']),
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
        required: ['id'],
      },
      body: {
        type: 'object',
        properties: {
          parameters: { type: 'object' },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const { parameters } = request.body as { parameters: any };
    
    const workflow = await db.select()
      .from(automationWorkflows)
      .where(eq(automationWorkflows.id, id))
      .limit(1);

    if (!workflow.length) {
      return reply.status(404).send({ error: 'Automation workflow not found' });
    }

    try {
      // Create execution context
      const context = {
        tenantId: request.user.tenantId,
        userId: request.user.id,
        inputData: parameters || {},
        variables: { ...parameters }
      };

      // Import and use workflow engine
      const { WorkflowEngine } = await import('../utils/workflow-engine.js');
      const workflowEngine = new WorkflowEngine(context);

      // Execute workflow asynchronously
      workflowEngine.executeWorkflow(id).catch(error => {
        logger.error(`Workflow execution failed for ${id}:`, error);
      });

      return { 
        message: 'Workflow execution started',
        executionId: 'exec_' + Date.now(),
        status: 'IN_PROGRESS'
      };
    } catch (error) {
      logger.error('Failed to start workflow execution:', error);
      return reply.status(500).send({ 
        error: 'Failed to start workflow execution',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get all automation tasks
  fastify.get('/tasks', {
    preHandler: hasPermissions(['view_automation']),
    schema: {
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'number', default: 1 },
          pageSize: { type: 'number', default: 10 },
          workflowId: { type: 'string', format: 'uuid' },
          type: { type: 'string', enum: ['ACTION', 'CONDITION', 'APPROVAL', 'NOTIFICATION', 'INTEGRATION', 'DECISION'] },
          status: { type: 'string', enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'CANCELLED', 'SKIPPED'] },
          assignedTo: { type: 'string', format: 'uuid' },
          search: { type: 'string' },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { 
      page = 1, 
      pageSize = 10, 
      workflowId, 
      type, 
      status, 
      assignedTo, 
      search 
    } = request.query as any;

    const offset = (page - 1) * pageSize;
    const conditions = [];

    if (workflowId) conditions.push(eq(automationTasks.workflowId, workflowId));
    if (type) conditions.push(eq(automationTasks.type, type));
    if (status) conditions.push(eq(automationTasks.status, status));
    if (assignedTo) conditions.push(eq(automationTasks.assignedTo, assignedTo));
    if (search) {
      conditions.push(
        like(automationTasks.name, `%${search}%`)
      );
    }

    const [tasks, total] = await Promise.all([
      db.select()
        .from(automationTasks)
        .where(and(...conditions))
        .orderBy(desc(automationTasks.createdAt))
        .limit(pageSize)
        .offset(offset),
      db.select({ count: sql`count(*)` })
        .from(automationTasks)
        .where(and(...conditions))
        .then(result => Number(result[0]?.count || 0))
    ]);

    return {
      items: tasks,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  });

  // Get automation task by ID
  fastify.get('/tasks/:id', {
    preHandler: hasPermissions(['view_automation']),
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
        required: ['id'],
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    
    const task = await db.select()
      .from(automationTasks)
      .where(eq(automationTasks.id, id))
      .limit(1);

    if (!task.length) {
      return reply.status(404).send({ error: 'Automation task not found' });
    }

    return task[0];
  });

  // Create automation task
  fastify.post('/tasks', {
    preHandler: hasPermissions(['manage_automation']),
    schema: {
      body: createAutomationTaskSchema,
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const data = request.body as z.infer<typeof createAutomationTaskSchema>;
    
    const [task] = await db.insert(automationTasks)
      .values({
        ...data,
        tenantId: request.user.tenantId,
        createdBy: request.user.id,
      })
      .returning();

    return reply.status(201).send(task);
  });

  // Update automation task
  fastify.put('/tasks/:id', {
    preHandler: hasPermissions(['manage_automation']),
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
        required: ['id'],
      },
      body: updateAutomationTaskSchema,
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const data = request.body as z.infer<typeof updateAutomationTaskSchema>;
    
    const [task] = await db.update(automationTasks)
      .set({
        ...data,
        updatedBy: request.user.id,
        updatedAt: new Date(),
      })
      .where(eq(automationTasks.id, id))
      .returning();

    if (!task) {
      return reply.status(404).send({ error: 'Automation task not found' });
    }

    return task;
  });

  // Delete automation task
  fastify.delete('/tasks/:id', {
    preHandler: hasPermissions(['manage_automation']),
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
        required: ['id'],
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    
    const [task] = await db.delete(automationTasks)
      .where(eq(automationTasks.id, id))
      .returning();

    if (!task) {
      return reply.status(404).send({ error: 'Automation task not found' });
    }

    return { message: 'Automation task deleted successfully' };
  });

  // Get automation logs
  fastify.get('/logs', {
    preHandler: hasPermissions(['view_automation']),
    schema: {
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'number', default: 1 },
          pageSize: { type: 'number', default: 10 },
          workflowId: { type: 'string', format: 'uuid' },
          taskId: { type: 'string', format: 'uuid' },
          level: { type: 'string', enum: ['INFO', 'WARN', 'ERROR', 'DEBUG'] },
          startDate: { type: 'string', format: 'date-time' },
          endDate: { type: 'string', format: 'date-time' },
          search: { type: 'string' },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { 
      page = 1, 
      pageSize = 10, 
      workflowId, 
      taskId, 
      level, 
      startDate, 
      endDate, 
      search 
    } = request.query as any;

    const offset = (page - 1) * pageSize;
    const conditions = [];

    if (workflowId) conditions.push(eq(automationLogs.workflowId, workflowId));
    if (taskId) conditions.push(eq(automationLogs.taskId, taskId));
    if (level) conditions.push(eq(automationLogs.level, level));
    if (startDate) conditions.push(gte(automationLogs.timestamp, new Date(startDate)));
    if (endDate) conditions.push(lte(automationLogs.timestamp, new Date(endDate)));
    if (search) {
      conditions.push(
        like(automationLogs.message, `%${search}%`)
      );
    }

    const [logs, total] = await Promise.all([
      db.select()
        .from(automationLogs)
        .where(and(...conditions))
        .orderBy(desc(automationLogs.timestamp))
        .limit(pageSize)
        .offset(offset),
      db.select({ count: sql`count(*)` })
        .from(automationLogs)
        .where(and(...conditions))
        .then(result => Number(result[0]?.count || 0))
    ]);

    return {
      items: logs,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  });

  // Get automation analytics
  fastify.get('/analytics', {
    preHandler: hasPermissions(['view_automation']),
    schema: {
      querystring: {
        type: 'object',
        properties: {
          startDate: { type: 'string', format: 'date-time' },
          endDate: { type: 'string', format: 'date-time' },
          workflowId: { type: 'string', format: 'uuid' },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { startDate, endDate, workflowId } = request.query as any;

    const conditions = [];
    if (startDate) conditions.push(gte(automationLogs.timestamp, new Date(startDate)));
    if (endDate) conditions.push(lte(automationLogs.timestamp, new Date(endDate)));
    if (workflowId) conditions.push(eq(automationLogs.workflowId, workflowId));

    const logs = await db.select()
      .from(automationLogs)
      .where(and(...conditions))
      .orderBy(desc(automationLogs.timestamp));

    // Calculate summary metrics
    const summary = {
      totalWorkflows: 0,
      activeWorkflows: 0,
      totalExecutions: 0,
      successfulExecutions: 0,
      failedExecutions: 0,
      averageExecutionTime: 0,
    };

    return {
      logs,
      summary,
    };
  });

  // Get automation dashboard
  fastify.get('/dashboard', {
    preHandler: hasPermissions(['view_automation']),
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const [workflows, tasks, logs, templates] = await Promise.all([
      db.select({ count: sql`count(*)` })
        .from(automationWorkflows)
        .where(eq(automationWorkflows.tenantId, request.user.tenantId))
        .then(result => Number(result[0]?.count || 0)),
      db.select({ count: sql`count(*)` })
        .from(automationTasks)
        .where(eq(automationTasks.tenantId, request.user.tenantId))
        .then(result => Number(result[0]?.count || 0)),
      db.select()
        .from(automationLogs)
        .where(eq(automationLogs.tenantId, request.user.tenantId))
        .orderBy(desc(automationLogs.timestamp))
        .limit(10),
      db.select({ count: sql`count(*)` })
        .from(automationTemplates)
        .where(eq(automationTemplates.tenantId, request.user.tenantId))
        .then(result => Number(result[0]?.count || 0)),
    ]);

    return {
      metrics: {
        totalWorkflows: workflows,
        totalTasks: tasks,
        totalTemplates: templates,
      },
      recentLogs: logs,
    };
  });
} 