import { z } from 'zod';

// Base schemas
export const AutomationWorkflowSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  workflowNumber: z.string(),
  name: z.string(),
  description: z.string().optional(),
  type: z.enum(['BUSINESS_PROCESS', 'DATA_PROCESSING', 'NOTIFICATION', 'INTEGRATION', 'REPORTING', 'CUSTOM']),
  category: z.enum(['PROCUREMENT', 'INVENTORY', 'LOGISTICS', 'FINANCE', 'QUALITY', 'SUPPLY_CHAIN', 'GENERAL']),
  status: z.enum(['ACTIVE', 'INACTIVE', 'DRAFT', 'ARCHIVED']),
  version: z.string(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  isRecurring: z.boolean(),
  recurrencePattern: z.record(z.any()).optional(),
  maxRetries: z.number().int().positive(),
  retryDelay: z.number().int().positive(),
  timeout: z.number().int().positive(),
  estimatedDuration: z.number().int().positive().optional(),
  actualDuration: z.number().int().positive().optional(),
  lastExecuted: z.string().datetime().optional(),
  nextExecution: z.string().datetime().optional(),
  executionCount: z.number().int().positive(),
  successCount: z.number().int().positive(),
  failureCount: z.number().int().positive(),
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
    required: z.boolean(),
    onFailure: z.enum(['CONTINUE', 'STOP', 'RETRY', 'ESCALATE']),
  })),
  triggers: z.array(z.string()).optional(),
  conditions: z.record(z.any()).optional(),
  metadata: z.record(z.any()).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  createdBy: z.string().uuid(),
  updatedBy: z.string().uuid().optional(),
});

export const AutomationTaskSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  taskNumber: z.string(),
  workflowId: z.string().uuid(),
  name: z.string(),
  description: z.string().optional(),
  type: z.enum(['ACTION', 'CONDITION', 'APPROVAL', 'NOTIFICATION', 'INTEGRATION', 'DECISION']),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'CANCELLED', 'SKIPPED']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  action: z.string().optional(),
  parameters: z.record(z.any()).optional(),
  conditions: z.record(z.any()).optional(),
  assignedTo: z.string().uuid().optional(),
  estimatedDuration: z.number().int().positive().optional(),
  actualDuration: z.number().int().positive().optional(),
  startTime: z.string().datetime().optional(),
  endTime: z.string().datetime().optional(),
  retryCount: z.number().int().positive(),
  maxRetries: z.number().int().positive(),
  errorMessage: z.string().optional(),
  result: z.record(z.any()).optional(),
  metadata: z.record(z.any()).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  createdBy: z.string().uuid(),
  updatedBy: z.string().uuid().optional(),
});

export const AutomationTriggerSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  triggerNumber: z.string(),
  name: z.string(),
  description: z.string().optional(),
  type: z.enum(['SCHEDULE', 'EVENT', 'WEBHOOK', 'MANUAL', 'CONDITION', 'INTEGRATION']),
  status: z.enum(['ACTIVE', 'INACTIVE', 'PAUSED']),
  workflowId: z.string().uuid(),
  eventType: z.string().optional(),
  eventSource: z.string().optional(),
  schedule: z.string().optional(),
  conditions: z.record(z.any()).optional(),
  parameters: z.record(z.any()).optional(),
  lastTriggered: z.string().datetime().optional(),
  nextTrigger: z.string().datetime().optional(),
  triggerCount: z.number().int().positive(),
  metadata: z.record(z.any()).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  createdBy: z.string().uuid(),
  updatedBy: z.string().uuid().optional(),
});

export const AutomationLogSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  logNumber: z.string(),
  workflowId: z.string().uuid().optional(),
  taskId: z.string().uuid().optional(),
  triggerId: z.string().uuid().optional(),
  level: z.enum(['INFO', 'WARN', 'ERROR', 'DEBUG']),
  message: z.string(),
  details: z.record(z.any()).optional(),
  executionId: z.string().optional(),
  timestamp: z.string().datetime(),
  duration: z.number().int().positive().optional(),
  metadata: z.record(z.any()).optional(),
  createdAt: z.string().datetime(),
});

export const AutomationScheduleSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  scheduleNumber: z.string(),
  name: z.string(),
  description: z.string().optional(),
  type: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'CUSTOM', 'RECURRING', 'ONE_TIME']),
  status: z.enum(['ACTIVE', 'INACTIVE', 'PAUSED', 'COMPLETED']),
  workflowId: z.string().uuid(),
  cronExpression: z.string().optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  timezone: z.string(),
  recurrencePattern: z.record(z.any()).optional(),
  lastExecuted: z.string().datetime().optional(),
  nextExecution: z.string().datetime().optional(),
  executionCount: z.number().int().positive(),
  maxExecutions: z.number().int().positive().optional(),
  metadata: z.record(z.any()).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  createdBy: z.string().uuid(),
  updatedBy: z.string().uuid().optional(),
});

export const AutomationVariableSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  variableNumber: z.string(),
  name: z.string(),
  description: z.string().optional(),
  type: z.enum(['STRING', 'NUMBER', 'BOOLEAN', 'DATE', 'ARRAY', 'OBJECT', 'JSON']),
  dataType: z.string().optional(),
  value: z.any(),
  defaultValue: z.any().optional(),
  isRequired: z.boolean(),
  isEncrypted: z.boolean(),
  scope: z.enum(['GLOBAL', 'WORKFLOW', 'TASK', 'USER']),
  workflowId: z.string().uuid().optional(),
  taskId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
  validation: z.record(z.any()).optional(),
  metadata: z.record(z.any()).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  createdBy: z.string().uuid(),
  updatedBy: z.string().uuid().optional(),
});

export const AutomationTemplateSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  templateNumber: z.string(),
  name: z.string(),
  description: z.string().optional(),
  category: z.enum(['PROCUREMENT', 'INVENTORY', 'LOGISTICS', 'FINANCE', 'QUALITY', 'SUPPLY_CHAIN', 'GENERAL']),
  type: z.enum(['WORKFLOW', 'TASK', 'TRIGGER', 'SCHEDULE']),
  version: z.string(),
  isDefault: z.boolean(),
  isActive: z.boolean(),
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
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  createdBy: z.string().uuid(),
  updatedBy: z.string().uuid().optional(),
});

export const AutomationPermissionSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  permissionNumber: z.string(),
  name: z.string(),
  description: z.string().optional(),
  type: z.enum(['WORKFLOW', 'TASK', 'TRIGGER', 'SCHEDULE', 'VARIABLE', 'TEMPLATE']),
  resourceId: z.string().uuid(),
  userId: z.string().uuid().optional(),
  roleId: z.string().uuid().optional(),
  permissions: z.array(z.string()),
  conditions: z.record(z.any()).optional(),
  metadata: z.record(z.any()).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  createdBy: z.string().uuid(),
  updatedBy: z.string().uuid().optional(),
});

// Request/Response schemas
export const CreateAutomationWorkflowSchema = AutomationWorkflowSchema.omit({
  id: true,
  tenantId: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
  updatedBy: true,
  executionCount: true,
  successCount: true,
  failureCount: true,
});

export const UpdateAutomationWorkflowSchema = CreateAutomationWorkflowSchema.partial();

export const CreateAutomationTaskSchema = AutomationTaskSchema.omit({
  id: true,
  tenantId: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
  updatedBy: true,
  retryCount: true,
});

export const UpdateAutomationTaskSchema = CreateAutomationTaskSchema.partial();

export const CreateAutomationTriggerSchema = AutomationTriggerSchema.omit({
  id: true,
  tenantId: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
  updatedBy: true,
  triggerCount: true,
});

export const UpdateAutomationTriggerSchema = CreateAutomationTriggerSchema.partial();

export const CreateAutomationScheduleSchema = AutomationScheduleSchema.omit({
  id: true,
  tenantId: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
  updatedBy: true,
  executionCount: true,
});

export const UpdateAutomationScheduleSchema = CreateAutomationScheduleSchema.partial();

export const CreateAutomationVariableSchema = AutomationVariableSchema.omit({
  id: true,
  tenantId: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
  updatedBy: true,
});

export const UpdateAutomationVariableSchema = CreateAutomationVariableSchema.partial();

export const CreateAutomationTemplateSchema = AutomationTemplateSchema.omit({
  id: true,
  tenantId: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
  updatedBy: true,
});

export const UpdateAutomationTemplateSchema = CreateAutomationTemplateSchema.partial();

export const CreateAutomationPermissionSchema = AutomationPermissionSchema.omit({
  id: true,
  tenantId: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
  updatedBy: true,
});

export const UpdateAutomationPermissionSchema = CreateAutomationPermissionSchema.partial();

// Analytics schemas
export const AutomationDashboardSchema = z.object({
  metrics: z.object({
    totalWorkflows: z.number(),
    activeWorkflows: z.number(),
    totalExecutions: z.number(),
    successfulExecutions: z.number(),
    failedExecutions: z.number(),
    averageExecutionTime: z.number(),
  }),
  recentLogs: z.array(AutomationLogSchema),
  topWorkflows: z.array(z.object({
    id: z.string().uuid(),
    name: z.string(),
    executionCount: z.number(),
    successRate: z.number(),
  })),
});

export const AutomationAnalyticsSchema = z.object({
  logs: z.array(AutomationLogSchema),
  summary: z.object({
    totalWorkflows: z.number(),
    activeWorkflows: z.number(),
    totalExecutions: z.number(),
    successfulExecutions: z.number(),
    failedExecutions: z.number(),
    averageExecutionTime: z.number(),
  }),
});

// Type exports
export type AutomationWorkflow = z.infer<typeof AutomationWorkflowSchema>;
export type AutomationTask = z.infer<typeof AutomationTaskSchema>;
export type AutomationTrigger = z.infer<typeof AutomationTriggerSchema>;
export type AutomationLog = z.infer<typeof AutomationLogSchema>;
export type AutomationSchedule = z.infer<typeof AutomationScheduleSchema>;
export type AutomationVariable = z.infer<typeof AutomationVariableSchema>;
export type AutomationTemplate = z.infer<typeof AutomationTemplateSchema>;
export type AutomationPermission = z.infer<typeof AutomationPermissionSchema>;

export type CreateAutomationWorkflow = z.infer<typeof CreateAutomationWorkflowSchema>;
export type UpdateAutomationWorkflow = z.infer<typeof UpdateAutomationWorkflowSchema>;
export type CreateAutomationTask = z.infer<typeof CreateAutomationTaskSchema>;
export type UpdateAutomationTask = z.infer<typeof UpdateAutomationTaskSchema>;
export type CreateAutomationTrigger = z.infer<typeof CreateAutomationTriggerSchema>;
export type UpdateAutomationTrigger = z.infer<typeof UpdateAutomationTriggerSchema>;
export type CreateAutomationSchedule = z.infer<typeof CreateAutomationScheduleSchema>;
export type UpdateAutomationSchedule = z.infer<typeof UpdateAutomationScheduleSchema>;
export type CreateAutomationVariable = z.infer<typeof CreateAutomationVariableSchema>;
export type UpdateAutomationVariable = z.infer<typeof UpdateAutomationVariableSchema>;
export type CreateAutomationTemplate = z.infer<typeof CreateAutomationTemplateSchema>;
export type UpdateAutomationTemplate = z.infer<typeof UpdateAutomationTemplateSchema>;
export type CreateAutomationPermission = z.infer<typeof CreateAutomationPermissionSchema>;
export type UpdateAutomationPermission = z.infer<typeof UpdateAutomationPermissionSchema>;

export type AutomationDashboard = z.infer<typeof AutomationDashboardSchema>;
export type AutomationAnalytics = z.infer<typeof AutomationAnalyticsSchema>; 