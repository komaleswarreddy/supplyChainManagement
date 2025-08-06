import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  logisticsAPI, 
  logisticsAnalyticsAPI,
  type LogisticsTask, 
  type CreateLogisticsTask, 
  type UpdateLogisticsTask,
  type LogisticsRoute,
  type CreateLogisticsRoute,
  type UpdateLogisticsRoute,
  type LogisticsEquipment,
  type CreateLogisticsEquipment,
  type UpdateLogisticsEquipment,
  type LogisticsSchedule,
  type CreateLogisticsSchedule,
  type UpdateLogisticsSchedule,
  type LogisticsZone,
  type CreateLogisticsZone,
  type UpdateLogisticsZone,
  type LogisticsWorkflow,
  type CreateLogisticsWorkflow,
  type UpdateLogisticsWorkflow
} from '@/services/api/logistics';

// Logistics Tasks Hooks
export const useLogisticsTasks = (params?: { page?: number; limit?: number; search?: string; status?: string; type?: string }) => {
  return useQuery({
    queryKey: ['logistics', 'tasks', params],
    queryFn: () => logisticsAPI.getTasks(params),
  });
};

export const useLogisticsTask = (id: string) => {
  return useQuery({
    queryKey: ['logistics', 'tasks', id],
    queryFn: () => logisticsAPI.getTaskById(id),
    enabled: !!id,
  });
};

export const useCreateLogisticsTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateLogisticsTask) => logisticsAPI.createTask(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['logistics', 'tasks'] });
    },
  });
};

export const useUpdateLogisticsTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLogisticsTask }) => 
      logisticsAPI.updateTask(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['logistics', 'tasks'] });
      queryClient.invalidateQueries({ queryKey: ['logistics', 'tasks', id] });
    },
  });
};

export const useDeleteLogisticsTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => logisticsAPI.deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['logistics', 'tasks'] });
    },
  });
};

export const useAssignLogisticsTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, userId }: { id: string; userId: string }) => 
      logisticsAPI.assignTask(id, userId),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['logistics', 'tasks'] });
      queryClient.invalidateQueries({ queryKey: ['logistics', 'tasks', id] });
    },
  });
};

export const useStartLogisticsTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => logisticsAPI.startTask(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['logistics', 'tasks'] });
      queryClient.invalidateQueries({ queryKey: ['logistics', 'tasks', id] });
    },
  });
};

export const useCompleteLogisticsTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => logisticsAPI.completeTask(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['logistics', 'tasks'] });
      queryClient.invalidateQueries({ queryKey: ['logistics', 'tasks', id] });
    },
  });
};

// Logistics Routes Hooks
export const useLogisticsRoutes = (params?: { page?: number; limit?: number; search?: string; status?: string; type?: string }) => {
  return useQuery({
    queryKey: ['logistics', 'routes', params],
    queryFn: () => logisticsAPI.getRoutes(params),
  });
};

export const useLogisticsRoute = (id: string) => {
  return useQuery({
    queryKey: ['logistics', 'routes', id],
    queryFn: () => logisticsAPI.getRouteById(id),
    enabled: !!id,
  });
};

export const useCreateLogisticsRoute = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateLogisticsRoute) => logisticsAPI.createRoute(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['logistics', 'routes'] });
    },
  });
};

export const useUpdateLogisticsRoute = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLogisticsRoute }) => 
      logisticsAPI.updateRoute(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['logistics', 'routes'] });
      queryClient.invalidateQueries({ queryKey: ['logistics', 'routes', id] });
    },
  });
};

export const useDeleteLogisticsRoute = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => logisticsAPI.deleteRoute(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['logistics', 'routes'] });
    },
  });
};

export const useOptimizeLogisticsRoute = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => logisticsAPI.optimizeRoute(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['logistics', 'routes'] });
      queryClient.invalidateQueries({ queryKey: ['logistics', 'routes', id] });
    },
  });
};

// Logistics Equipment Hooks
export const useLogisticsEquipment = (params?: { page?: number; limit?: number; search?: string; status?: string; type?: string }) => {
  return useQuery({
    queryKey: ['logistics', 'equipment', params],
    queryFn: () => logisticsAPI.getEquipment(params),
  });
};

export const useLogisticsEquipmentById = (id: string) => {
  return useQuery({
    queryKey: ['logistics', 'equipment', id],
    queryFn: () => logisticsAPI.getEquipmentById(id),
    enabled: !!id,
  });
};

export const useCreateLogisticsEquipment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateLogisticsEquipment) => logisticsAPI.createEquipment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['logistics', 'equipment'] });
    },
  });
};

export const useUpdateLogisticsEquipment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLogisticsEquipment }) => 
      logisticsAPI.updateEquipment(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['logistics', 'equipment'] });
      queryClient.invalidateQueries({ queryKey: ['logistics', 'equipment', id] });
    },
  });
};

export const useDeleteLogisticsEquipment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => logisticsAPI.deleteEquipment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['logistics', 'equipment'] });
    },
  });
};

// Logistics Schedules Hooks
export const useLogisticsSchedules = (params?: { page?: number; limit?: number; search?: string; status?: string; type?: string }) => {
  return useQuery({
    queryKey: ['logistics', 'schedules', params],
    queryFn: () => logisticsAPI.getSchedules(params),
  });
};

export const useLogisticsSchedule = (id: string) => {
  return useQuery({
    queryKey: ['logistics', 'schedules', id],
    queryFn: () => logisticsAPI.getScheduleById(id),
    enabled: !!id,
  });
};

export const useCreateLogisticsSchedule = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateLogisticsSchedule) => logisticsAPI.createSchedule(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['logistics', 'schedules'] });
    },
  });
};

export const useUpdateLogisticsSchedule = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLogisticsSchedule }) => 
      logisticsAPI.updateSchedule(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['logistics', 'schedules'] });
      queryClient.invalidateQueries({ queryKey: ['logistics', 'schedules', id] });
    },
  });
};

export const useDeleteLogisticsSchedule = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => logisticsAPI.deleteSchedule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['logistics', 'schedules'] });
    },
  });
};

// Logistics Zones Hooks
export const useLogisticsZones = (params?: { page?: number; limit?: number; search?: string; status?: string; type?: string }) => {
  return useQuery({
    queryKey: ['logistics', 'zones', params],
    queryFn: () => logisticsAPI.getZones(params),
  });
};

export const useLogisticsZone = (id: string) => {
  return useQuery({
    queryKey: ['logistics', 'zones', id],
    queryFn: () => logisticsAPI.getZoneById(id),
    enabled: !!id,
  });
};

export const useCreateLogisticsZone = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateLogisticsZone) => logisticsAPI.createZone(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['logistics', 'zones'] });
    },
  });
};

export const useUpdateLogisticsZone = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLogisticsZone }) => 
      logisticsAPI.updateZone(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['logistics', 'zones'] });
      queryClient.invalidateQueries({ queryKey: ['logistics', 'zones', id] });
    },
  });
};

export const useDeleteLogisticsZone = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => logisticsAPI.deleteZone(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['logistics', 'zones'] });
    },
  });
};

// Logistics Workflows Hooks
export const useLogisticsWorkflows = (params?: { page?: number; limit?: number; search?: string; status?: string; type?: string }) => {
  return useQuery({
    queryKey: ['logistics', 'workflows', params],
    queryFn: () => logisticsAPI.getWorkflows(params),
  });
};

export const useLogisticsWorkflow = (id: string) => {
  return useQuery({
    queryKey: ['logistics', 'workflows', id],
    queryFn: () => logisticsAPI.getWorkflowById(id),
    enabled: !!id,
  });
};

export const useCreateLogisticsWorkflow = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateLogisticsWorkflow) => logisticsAPI.createWorkflow(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['logistics', 'workflows'] });
    },
  });
};

export const useUpdateLogisticsWorkflow = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLogisticsWorkflow }) => 
      logisticsAPI.updateWorkflow(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['logistics', 'workflows'] });
      queryClient.invalidateQueries({ queryKey: ['logistics', 'workflows', id] });
    },
  });
};

export const useDeleteLogisticsWorkflow = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => logisticsAPI.deleteWorkflow(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['logistics', 'workflows'] });
    },
  });
};

// Logistics Analytics Hooks
export const useLogisticsDashboard = (params?: { startDate?: string; endDate?: string; warehouseId?: string }) => {
  return useQuery({
    queryKey: ['logistics', 'analytics', 'dashboard', params],
    queryFn: () => logisticsAnalyticsAPI.getDashboard(params),
  });
};

export const useLogisticsPerformance = (params?: { startDate?: string; endDate?: string; metricType?: string; period?: string }) => {
  return useQuery({
    queryKey: ['logistics', 'analytics', 'performance', params],
    queryFn: () => logisticsAnalyticsAPI.getPerformance(params),
  });
};

export const useLogisticsMetrics = (params?: { startDate?: string; endDate?: string; groupBy?: string }) => {
  return useQuery({
    queryKey: ['logistics', 'analytics', 'metrics', params],
    queryFn: () => logisticsAnalyticsAPI.getMetrics(params),
  });
};

export const useLogisticsReports = (params?: { startDate?: string; endDate?: string; type?: string }) => {
  return useQuery({
    queryKey: ['logistics', 'analytics', 'reports', params],
    queryFn: () => logisticsAnalyticsAPI.getReports(params),
  });
};