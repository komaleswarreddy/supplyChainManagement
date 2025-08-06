import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  automationAPI, 
  automationAnalyticsAPI,
  type AutomationWorkflow, 
  type CreateAutomationWorkflow, 
  type UpdateAutomationWorkflow,
  type AutomationTask,
  type CreateAutomationTask,
  type UpdateAutomationTask,
  type AutomationTrigger,
  type CreateAutomationTrigger,
  type UpdateAutomationTrigger,
  type AutomationSchedule,
  type CreateAutomationSchedule,
  type UpdateAutomationSchedule,
  type AutomationVariable,
  type CreateAutomationVariable,
  type UpdateAutomationVariable,
  type AutomationTemplate,
  type CreateAutomationTemplate,
  type UpdateAutomationTemplate
} from '@/services/api/automation';

// Automation Workflows Hooks
export const useAutomationWorkflows = (params?: { page?: number; limit?: number; search?: string; status?: string; type?: string; category?: string }) => {
  return useQuery({
    queryKey: ['automation', 'workflows', params],
    queryFn: () => automationAPI.getWorkflows(params),
  });
};

export const useAutomationWorkflow = (id: string) => {
  return useQuery({
    queryKey: ['automation', 'workflows', id],
    queryFn: () => automationAPI.getWorkflowById(id),
    enabled: !!id,
  });
};

export const useCreateAutomationWorkflow = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateAutomationWorkflow) => automationAPI.createWorkflow(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automation', 'workflows'] });
    },
  });
};

export const useUpdateAutomationWorkflow = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAutomationWorkflow }) => 
      automationAPI.updateWorkflow(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['automation', 'workflows'] });
      queryClient.invalidateQueries({ queryKey: ['automation', 'workflows', id] });
    },
  });
};

export const useDeleteAutomationWorkflow = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => automationAPI.deleteWorkflow(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automation', 'workflows'] });
    },
  });
};

export const useExecuteAutomationWorkflow = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, inputData }: { id: string; inputData?: Record<string, any> }) => 
      automationAPI.executeWorkflow(id, inputData),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['automation', 'workflows', id] });
    },
  });
};

export const usePauseAutomationWorkflow = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => automationAPI.pauseWorkflow(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['automation', 'workflows'] });
      queryClient.invalidateQueries({ queryKey: ['automation', 'workflows', id] });
    },
  });
};

export const useResumeAutomationWorkflow = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => automationAPI.resumeWorkflow(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['automation', 'workflows'] });
      queryClient.invalidateQueries({ queryKey: ['automation', 'workflows', id] });
    },
  });
};

// Automation Tasks Hooks
export const useAutomationTasks = (workflowId: string) => {
  return useQuery({
    queryKey: ['automation', 'workflows', workflowId, 'tasks'],
    queryFn: () => automationAPI.getTasks(workflowId),
    enabled: !!workflowId,
  });
};

export const useAutomationTask = (workflowId: string, taskId: string) => {
  return useQuery({
    queryKey: ['automation', 'workflows', workflowId, 'tasks', taskId],
    queryFn: () => automationAPI.getTaskById(workflowId, taskId),
    enabled: !!workflowId && !!taskId,
  });
};

export const useCreateAutomationTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ workflowId, data }: { workflowId: string; data: CreateAutomationTask }) => 
      automationAPI.createTask(workflowId, data),
    onSuccess: (_, { workflowId }) => {
      queryClient.invalidateQueries({ queryKey: ['automation', 'workflows', workflowId, 'tasks'] });
    },
  });
};

export const useUpdateAutomationTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      workflowId, 
      taskId, 
      data 
    }: { 
      workflowId: string; 
      taskId: string; 
      data: UpdateAutomationTask 
    }) => automationAPI.updateTask(workflowId, taskId, data),
    onSuccess: (_, { workflowId, taskId }) => {
      queryClient.invalidateQueries({ queryKey: ['automation', 'workflows', workflowId, 'tasks'] });
      queryClient.invalidateQueries({ queryKey: ['automation', 'workflows', workflowId, 'tasks', taskId] });
    },
  });
};

export const useDeleteAutomationTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ workflowId, taskId }: { workflowId: string; taskId: string }) => 
      automationAPI.deleteTask(workflowId, taskId),
    onSuccess: (_, { workflowId }) => {
      queryClient.invalidateQueries({ queryKey: ['automation', 'workflows', workflowId, 'tasks'] });
    },
  });
};

// Automation Triggers Hooks
export const useAutomationTriggers = (workflowId: string) => {
  return useQuery({
    queryKey: ['automation', 'workflows', workflowId, 'triggers'],
    queryFn: () => automationAPI.getTriggers(workflowId),
    enabled: !!workflowId,
  });
};

export const useAutomationTrigger = (workflowId: string, triggerId: string) => {
  return useQuery({
    queryKey: ['automation', 'workflows', workflowId, 'triggers', triggerId],
    queryFn: () => automationAPI.getTriggerById(workflowId, triggerId),
    enabled: !!workflowId && !!triggerId,
  });
};

export const useCreateAutomationTrigger = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ workflowId, data }: { workflowId: string; data: CreateAutomationTrigger }) => 
      automationAPI.createTrigger(workflowId, data),
    onSuccess: (_, { workflowId }) => {
      queryClient.invalidateQueries({ queryKey: ['automation', 'workflows', workflowId, 'triggers'] });
    },
  });
};

export const useUpdateAutomationTrigger = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      workflowId, 
      triggerId, 
      data 
    }: { 
      workflowId: string; 
      triggerId: string; 
      data: UpdateAutomationTrigger 
    }) => automationAPI.updateTrigger(workflowId, triggerId, data),
    onSuccess: (_, { workflowId, triggerId }) => {
      queryClient.invalidateQueries({ queryKey: ['automation', 'workflows', workflowId, 'triggers'] });
      queryClient.invalidateQueries({ queryKey: ['automation', 'workflows', workflowId, 'triggers', triggerId] });
    },
  });
};

export const useDeleteAutomationTrigger = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ workflowId, triggerId }: { workflowId: string; triggerId: string }) => 
      automationAPI.deleteTrigger(workflowId, triggerId),
    onSuccess: (_, { workflowId }) => {
      queryClient.invalidateQueries({ queryKey: ['automation', 'workflows', workflowId, 'triggers'] });
    },
  });
};

// Automation Schedules Hooks
export const useAutomationSchedules = (workflowId: string) => {
  return useQuery({
    queryKey: ['automation', 'workflows', workflowId, 'schedules'],
    queryFn: () => automationAPI.getSchedules(workflowId),
    enabled: !!workflowId,
  });
};

export const useAutomationSchedule = (workflowId: string, scheduleId: string) => {
  return useQuery({
    queryKey: ['automation', 'workflows', workflowId, 'schedules', scheduleId],
    queryFn: () => automationAPI.getScheduleById(workflowId, scheduleId),
    enabled: !!workflowId && !!scheduleId,
  });
};

export const useCreateAutomationSchedule = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ workflowId, data }: { workflowId: string; data: CreateAutomationSchedule }) => 
      automationAPI.createSchedule(workflowId, data),
    onSuccess: (_, { workflowId }) => {
      queryClient.invalidateQueries({ queryKey: ['automation', 'workflows', workflowId, 'schedules'] });
    },
  });
};

export const useUpdateAutomationSchedule = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      workflowId, 
      scheduleId, 
      data 
    }: { 
      workflowId: string; 
      scheduleId: string; 
      data: UpdateAutomationSchedule 
    }) => automationAPI.updateSchedule(workflowId, scheduleId, data),
    onSuccess: (_, { workflowId, scheduleId }) => {
      queryClient.invalidateQueries({ queryKey: ['automation', 'workflows', workflowId, 'schedules'] });
      queryClient.invalidateQueries({ queryKey: ['automation', 'workflows', workflowId, 'schedules', scheduleId] });
    },
  });
};

export const useDeleteAutomationSchedule = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ workflowId, scheduleId }: { workflowId: string; scheduleId: string }) => 
      automationAPI.deleteSchedule(workflowId, scheduleId),
    onSuccess: (_, { workflowId }) => {
      queryClient.invalidateQueries({ queryKey: ['automation', 'workflows', workflowId, 'schedules'] });
    },
  });
};

// Automation Variables Hooks
export const useAutomationVariables = (workflowId: string) => {
  return useQuery({
    queryKey: ['automation', 'workflows', workflowId, 'variables'],
    queryFn: () => automationAPI.getVariables(workflowId),
    enabled: !!workflowId,
  });
};

export const useAutomationVariable = (workflowId: string, variableId: string) => {
  return useQuery({
    queryKey: ['automation', 'workflows', workflowId, 'variables', variableId],
    queryFn: () => automationAPI.getVariableById(workflowId, variableId),
    enabled: !!workflowId && !!variableId,
  });
};

export const useCreateAutomationVariable = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ workflowId, data }: { workflowId: string; data: CreateAutomationVariable }) => 
      automationAPI.createVariable(workflowId, data),
    onSuccess: (_, { workflowId }) => {
      queryClient.invalidateQueries({ queryKey: ['automation', 'workflows', workflowId, 'variables'] });
    },
  });
};

export const useUpdateAutomationVariable = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      workflowId, 
      variableId, 
      data 
    }: { 
      workflowId: string; 
      variableId: string; 
      data: UpdateAutomationVariable 
    }) => automationAPI.updateVariable(workflowId, variableId, data),
    onSuccess: (_, { workflowId, variableId }) => {
      queryClient.invalidateQueries({ queryKey: ['automation', 'workflows', workflowId, 'variables'] });
      queryClient.invalidateQueries({ queryKey: ['automation', 'workflows', workflowId, 'variables', variableId] });
    },
  });
};

export const useDeleteAutomationVariable = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ workflowId, variableId }: { workflowId: string; variableId: string }) => 
      automationAPI.deleteVariable(workflowId, variableId),
    onSuccess: (_, { workflowId }) => {
      queryClient.invalidateQueries({ queryKey: ['automation', 'workflows', workflowId, 'variables'] });
    },
  });
};

// Automation Templates Hooks
export const useAutomationTemplates = (params?: { page?: number; limit?: number; search?: string; category?: string; type?: string }) => {
  return useQuery({
    queryKey: ['automation', 'templates', params],
    queryFn: () => automationAPI.getTemplates(params),
  });
};

export const useAutomationTemplate = (id: string) => {
  return useQuery({
    queryKey: ['automation', 'templates', id],
    queryFn: () => automationAPI.getTemplateById(id),
    enabled: !!id,
  });
};

export const useCreateAutomationTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateAutomationTemplate) => automationAPI.createTemplate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automation', 'templates'] });
    },
  });
};

export const useUpdateAutomationTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAutomationTemplate }) => 
      automationAPI.updateTemplate(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['automation', 'templates'] });
      queryClient.invalidateQueries({ queryKey: ['automation', 'templates', id] });
    },
  });
};

export const useDeleteAutomationTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => automationAPI.deleteTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automation', 'templates'] });
    },
  });
};

// Automation Analytics Hooks
export const useAutomationDashboard = (params?: { startDate?: string; endDate?: string }) => {
  return useQuery({
    queryKey: ['automation', 'analytics', 'dashboard', params],
    queryFn: () => automationAnalyticsAPI.getDashboard(params),
  });
};

export const useAutomationLogs = (params?: { workflowId?: string; status?: string; startDate?: string; endDate?: string; page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ['automation', 'analytics', 'logs', params],
    queryFn: () => automationAnalyticsAPI.getLogs(params),
  });
};

export const useAutomationMetrics = (params?: { startDate?: string; endDate?: string; groupBy?: string }) => {
  return useQuery({
    queryKey: ['automation', 'analytics', 'metrics', params],
    queryFn: () => automationAnalyticsAPI.getMetrics(params),
  });
};

export const useAutomationReports = (params?: { startDate?: string; endDate?: string; type?: string }) => {
  return useQuery({
    queryKey: ['automation', 'analytics', 'reports', params],
    queryFn: () => automationAnalyticsAPI.getReports(params),
  });
}; 