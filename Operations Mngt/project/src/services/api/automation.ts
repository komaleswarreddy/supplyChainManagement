import { z } from 'zod';
import { apiClient } from '@/lib/api-client';

// Zod Schemas
export const AutomationWorkflowSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  workflowNumber: z.string(),
  name: z.string(),
  description: z.string().optional(),
  type: z.enum(['RPA', 'API_INTEGRATION', 'DATA_PROCESSING', 'NOTIFICATION', 'REPORTING']),
  status: z.enum(['DRAFT', 'ACTIVE', 'PAUSED', 'ARCHIVED']),
  version: z.string(),
  category: z.enum(['PROCUREMENT', 'INVENTORY', 'FINANCE', 'HR', 'CUSTOMER_SERVICE']),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'CRITICAL']),
  ownerId: z.string().uuid().optional(),
  steps: z.array(z.record(z.any())),
  variables: z.record(z.any()).optional(),
  conditions: z.record(z.any()).optional(),
  actions: z.record(z.any()).optional(),
  errorHandling: z.record(z.any()).optional(),
  timeout: z.number().optional(),
  retryCount: z.number().optional(),
  retryDelay: z.number().optional(),
  isRecurring: z.boolean(),
  schedule: z.record(z.any()).optional(),
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
  type: z.enum(['CLICK', 'TYPE', 'SCREENSHOT', 'API_CALL', 'DATA_EXTRACTION', 'VALIDATION']),
  status: z.enum(['PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED']),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'CRITICAL']),
  sequence: z.number(),
  parameters: z.record(z.any()).optional(),
  conditions: z.record(z.any()).optional(),
  actions: z.record(z.any()).optional(),
  errorHandling: z.record(z.any()).optional(),
  timeout: z.number().optional(),
  retryCount: z.number().optional(),
  retryDelay: z.number().optional(),
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
  workflowId: z.string().uuid(),
  name: z.string(),
  description: z.string().optional(),
  type: z.enum(['SCHEDULE', 'EVENT', 'MANUAL', 'API_WEBHOOK', 'CONDITION']),
  status: z.enum(['ACTIVE', 'INACTIVE', 'PAUSED']),
  triggerConfig: z.record(z.any()),
  conditions: z.record(z.any()).optional(),
  filters: z.record(z.any()).optional(),
  metadata: z.record(z.any()).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  createdBy: z.string().uuid(),
  updatedBy: z.string().uuid().optional(),
});

export const AutomationLogSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  workflowId: z.string().uuid(),
  taskId: z.string().uuid().optional(),
  triggerId: z.string().uuid().optional(),
  executionId: z.string(),
  status: z.enum(['STARTED', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED']),
  startTime: z.string().datetime(),
  endTime: z.string().datetime().optional(),
  duration: z.number().optional(),
  errorMessage: z.string().optional(),
  errorDetails: z.record(z.any()).optional(),
  inputData: z.record(z.any()).optional(),
  outputData: z.record(z.any()).optional(),
  steps: z.record(z.any()).optional(),
  metadata: z.record(z.any()).optional(),
  createdAt: z.string().datetime(),
  createdBy: z.string().uuid().optional(),
});

export const AutomationScheduleSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  scheduleNumber: z.string(),
  workflowId: z.string().uuid(),
  name: z.string(),
  description: z.string().optional(),
  type: z.enum(['CRON', 'INTERVAL', 'CALENDAR', 'EVENT_BASED']),
  status: z.enum(['ACTIVE', 'PAUSED', 'CANCELLED']),
  scheduleConfig: z.record(z.any()),
  timezone: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  lastRun: z.string().datetime().optional(),
  nextRun: z.string().datetime().optional(),
  runCount: z.number().optional(),
  maxRuns: z.number().optional(),
  metadata: z.record(z.any()).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  createdBy: z.string().uuid(),
  updatedBy: z.string().uuid().optional(),
});

export const AutomationVariableSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  workflowId: z.string().uuid(),
  name: z.string(),
  description: z.string().optional(),
  type: z.enum(['STRING', 'NUMBER', 'BOOLEAN', 'ARRAY', 'OBJECT']),
  value: z.record(z.any()).optional(),
  defaultValue: z.record(z.any()).optional(),
  isRequired: z.boolean(),
  isSecret: z.boolean(),
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
  category: z.string(),
  type: z.enum(['WORKFLOW', 'TASK', 'TRIGGER']),
  template: z.record(z.any()),
  parameters: z.record(z.any()).optional(),
  isDefault: z.boolean(),
  isActive: z.boolean(),
  version: z.string(),
  metadata: z.record(z.any()).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  createdBy: z.string().uuid(),
  updatedBy: z.string().uuid().optional(),
});

// Create/Update Schemas
export const CreateAutomationWorkflowSchema = AutomationWorkflowSchema.omit({
  id: true,
  tenantId: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
  updatedBy: true,
});

export const UpdateAutomationWorkflowSchema = CreateAutomationWorkflowSchema.partial();

export const CreateAutomationTaskSchema = AutomationTaskSchema.omit({
  id: true,
  tenantId: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
  updatedBy: true,
});

export const UpdateAutomationTaskSchema = CreateAutomationTaskSchema.partial();

export const CreateAutomationTriggerSchema = AutomationTriggerSchema.omit({
  id: true,
  tenantId: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
  updatedBy: true,
});

export const UpdateAutomationTriggerSchema = CreateAutomationTriggerSchema.partial();

export const CreateAutomationScheduleSchema = AutomationScheduleSchema.omit({
  id: true,
  tenantId: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
  updatedBy: true,
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

// Types
export type AutomationWorkflow = z.infer<typeof AutomationWorkflowSchema>;
export type AutomationTask = z.infer<typeof AutomationTaskSchema>;
export type AutomationTrigger = z.infer<typeof AutomationTriggerSchema>;
export type AutomationLog = z.infer<typeof AutomationLogSchema>;
export type AutomationSchedule = z.infer<typeof AutomationScheduleSchema>;
export type AutomationVariable = z.infer<typeof AutomationVariableSchema>;
export type AutomationTemplate = z.infer<typeof AutomationTemplateSchema>;
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

// API Client Functions
export const automationAPI = {
  // Workflows
  getWorkflows: async (params?: { page?: number; limit?: number; search?: string; status?: string; type?: string; category?: string }) => {
    const response = await apiClient.get('/api/automation/workflows', { params });
    return z.array(AutomationWorkflowSchema).parse(response.data);
  },

  getWorkflowById: async (id: string) => {
    const response = await apiClient.get(`/api/automation/workflows/${id}`);
    return AutomationWorkflowSchema.parse(response.data);
  },

  createWorkflow: async (data: CreateAutomationWorkflow) => {
    const response = await apiClient.post('/api/automation/workflows', data);
    return AutomationWorkflowSchema.parse(response.data);
  },

  updateWorkflow: async (id: string, data: UpdateAutomationWorkflow) => {
    const response = await apiClient.put(`/api/automation/workflows/${id}`, data);
    return AutomationWorkflowSchema.parse(response.data);
  },

  deleteWorkflow: async (id: string) => {
    await apiClient.delete(`/api/automation/workflows/${id}`);
  },

  executeWorkflow: async (id: string, inputData?: Record<string, any>) => {
    const response = await apiClient.post(`/api/automation/workflows/${id}/execute`, { inputData });
    return z.record(z.any()).parse(response.data);
  },

  pauseWorkflow: async (id: string) => {
    const response = await apiClient.post(`/api/automation/workflows/${id}/pause`);
    return AutomationWorkflowSchema.parse(response.data);
  },

  resumeWorkflow: async (id: string) => {
    const response = await apiClient.post(`/api/automation/workflows/${id}/resume`);
    return AutomationWorkflowSchema.parse(response.data);
  },

  // Tasks
  getTasks: async (workflowId: string) => {
    const response = await apiClient.get(`/api/automation/workflows/${workflowId}/tasks`);
    return z.array(AutomationTaskSchema).parse(response.data);
  },

  getTaskById: async (workflowId: string, taskId: string) => {
    const response = await apiClient.get(`/api/automation/workflows/${workflowId}/tasks/${taskId}`);
    return AutomationTaskSchema.parse(response.data);
  },

  createTask: async (workflowId: string, data: CreateAutomationTask) => {
    const response = await apiClient.post(`/api/automation/workflows/${workflowId}/tasks`, data);
    return AutomationTaskSchema.parse(response.data);
  },

  updateTask: async (workflowId: string, taskId: string, data: UpdateAutomationTask) => {
    const response = await apiClient.put(`/api/automation/workflows/${workflowId}/tasks/${taskId}`, data);
    return AutomationTaskSchema.parse(response.data);
  },

  deleteTask: async (workflowId: string, taskId: string) => {
    await apiClient.delete(`/api/automation/workflows/${workflowId}/tasks/${taskId}`);
  },

  // Triggers
  getTriggers: async (workflowId: string) => {
    const response = await apiClient.get(`/api/automation/workflows/${workflowId}/triggers`);
    return z.array(AutomationTriggerSchema).parse(response.data);
  },

  getTriggerById: async (workflowId: string, triggerId: string) => {
    const response = await apiClient.get(`/api/automation/workflows/${workflowId}/triggers/${triggerId}`);
    return AutomationTriggerSchema.parse(response.data);
  },

  createTrigger: async (workflowId: string, data: CreateAutomationTrigger) => {
    const response = await apiClient.post(`/api/automation/workflows/${workflowId}/triggers`, data);
    return AutomationTriggerSchema.parse(response.data);
  },

  updateTrigger: async (workflowId: string, triggerId: string, data: UpdateAutomationTrigger) => {
    const response = await apiClient.put(`/api/automation/workflows/${workflowId}/triggers/${triggerId}`, data);
    return AutomationTriggerSchema.parse(response.data);
  },

  deleteTrigger: async (workflowId: string, triggerId: string) => {
    await apiClient.delete(`/api/automation/workflows/${workflowId}/triggers/${triggerId}`);
  },

  // Schedules
  getSchedules: async (workflowId: string) => {
    const response = await apiClient.get(`/api/automation/workflows/${workflowId}/schedules`);
    return z.array(AutomationScheduleSchema).parse(response.data);
  },

  getScheduleById: async (workflowId: string, scheduleId: string) => {
    const response = await apiClient.get(`/api/automation/workflows/${workflowId}/schedules/${scheduleId}`);
    return AutomationScheduleSchema.parse(response.data);
  },

  createSchedule: async (workflowId: string, data: CreateAutomationSchedule) => {
    const response = await apiClient.post(`/api/automation/workflows/${workflowId}/schedules`, data);
    return AutomationScheduleSchema.parse(response.data);
  },

  updateSchedule: async (workflowId: string, scheduleId: string, data: UpdateAutomationSchedule) => {
    const response = await apiClient.put(`/api/automation/workflows/${workflowId}/schedules/${scheduleId}`, data);
    return AutomationScheduleSchema.parse(response.data);
  },

  deleteSchedule: async (workflowId: string, scheduleId: string) => {
    await apiClient.delete(`/api/automation/workflows/${workflowId}/schedules/${scheduleId}`);
  },

  // Variables
  getVariables: async (workflowId: string) => {
    const response = await apiClient.get(`/api/automation/workflows/${workflowId}/variables`);
    return z.array(AutomationVariableSchema).parse(response.data);
  },

  getVariableById: async (workflowId: string, variableId: string) => {
    const response = await apiClient.get(`/api/automation/workflows/${workflowId}/variables/${variableId}`);
    return AutomationVariableSchema.parse(response.data);
  },

  createVariable: async (workflowId: string, data: CreateAutomationVariable) => {
    const response = await apiClient.post(`/api/automation/workflows/${workflowId}/variables`, data);
    return AutomationVariableSchema.parse(response.data);
  },

  updateVariable: async (workflowId: string, variableId: string, data: UpdateAutomationVariable) => {
    const response = await apiClient.put(`/api/automation/workflows/${workflowId}/variables/${variableId}`, data);
    return AutomationVariableSchema.parse(response.data);
  },

  deleteVariable: async (workflowId: string, variableId: string) => {
    await apiClient.delete(`/api/automation/workflows/${workflowId}/variables/${variableId}`);
  },

  // Templates
  getTemplates: async (params?: { page?: number; limit?: number; search?: string; category?: string; type?: string }) => {
    const response = await apiClient.get('/api/automation/templates', { params });
    return z.array(AutomationTemplateSchema).parse(response.data);
  },

  getTemplateById: async (id: string) => {
    const response = await apiClient.get(`/api/automation/templates/${id}`);
    return AutomationTemplateSchema.parse(response.data);
  },

  createTemplate: async (data: CreateAutomationTemplate) => {
    const response = await apiClient.post('/api/automation/templates', data);
    return AutomationTemplateSchema.parse(response.data);
  },

  updateTemplate: async (id: string, data: UpdateAutomationTemplate) => {
    const response = await apiClient.put(`/api/automation/templates/${id}`, data);
    return AutomationTemplateSchema.parse(response.data);
  },

  deleteTemplate: async (id: string) => {
    await apiClient.delete(`/api/automation/templates/${id}`);
  },
};

export const automationAnalyticsAPI = {
  getDashboard: async (params?: { startDate?: string; endDate?: string }) => {
    const response = await apiClient.get('/api/automation/analytics/dashboard', { params });
    return z.record(z.any()).parse(response.data);
  },

  getLogs: async (params?: { workflowId?: string; status?: string; startDate?: string; endDate?: string; page?: number; limit?: number }) => {
    const response = await apiClient.get('/api/automation/analytics/logs', { params });
    return z.array(AutomationLogSchema).parse(response.data);
  },

  getMetrics: async (params?: { startDate?: string; endDate?: string; groupBy?: string }) => {
    const response = await apiClient.get('/api/automation/analytics/metrics', { params });
    return z.record(z.any()).parse(response.data);
  },

  getReports: async (params?: { startDate?: string; endDate?: string; type?: string }) => {
    const response = await apiClient.get('/api/automation/analytics/reports', { params });
    return z.record(z.any()).parse(response.data);
  },
}; 