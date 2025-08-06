import { z } from 'zod';
import { apiClient } from '@/lib/api-client';

// Zod Schemas
export const LogisticsTaskSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  taskNumber: z.string(),
  type: z.enum(['PICK', 'PACK', 'SHIP', 'RECEIVE', 'PUTAWAY', 'TRANSFER', 'CYCLE_COUNT']),
  status: z.enum(['PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']),
  warehouseId: z.string().uuid().optional(),
  assignedTo: z.string().uuid().optional(),
  orderId: z.string().uuid().optional(),
  shipmentId: z.string().uuid().optional(),
  sourceLocation: z.record(z.any()).optional(),
  destinationLocation: z.record(z.any()).optional(),
  items: z.array(z.record(z.any())),
  estimatedDuration: z.number().optional(),
  actualDuration: z.number().optional(),
  scheduledStart: z.string().datetime().optional(),
  scheduledEnd: z.string().datetime().optional(),
  startedAt: z.string().datetime().optional(),
  completedAt: z.string().datetime().optional(),
  completedBy: z.string().uuid().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.any()).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  createdBy: z.string().uuid(),
  updatedBy: z.string().uuid().optional(),
});

export const LogisticsRouteSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  routeNumber: z.string(),
  name: z.string(),
  description: z.string().optional(),
  type: z.enum(['PICKING', 'PUTAWAY', 'TRANSFER', 'DELIVERY']),
  status: z.enum(['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']),
  warehouseId: z.string().uuid().optional(),
  assignedTo: z.string().uuid().optional(),
  startLocation: z.record(z.any()),
  endLocation: z.record(z.any()),
  waypoints: z.array(z.record(z.any())),
  estimatedDistance: z.number().optional(),
  actualDistance: z.number().optional(),
  estimatedDuration: z.number().optional(),
  actualDuration: z.number().optional(),
  scheduledStart: z.string().datetime().optional(),
  scheduledEnd: z.string().datetime().optional(),
  startedAt: z.string().datetime().optional(),
  completedAt: z.string().datetime().optional(),
  completedBy: z.string().uuid().optional(),
  optimizationData: z.record(z.any()).optional(),
  metadata: z.record(z.any()).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  createdBy: z.string().uuid(),
  updatedBy: z.string().uuid().optional(),
});

export const LogisticsEquipmentSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  equipmentNumber: z.string(),
  name: z.string(),
  type: z.enum(['FORKLIFT', 'PALLET_JACK', 'CONVEYOR', 'SCANNER', 'PRINTER', 'OTHER']),
  model: z.string().optional(),
  manufacturer: z.string().optional(),
  serialNumber: z.string().optional(),
  status: z.enum(['AVAILABLE', 'IN_USE', 'MAINTENANCE', 'OUT_OF_SERVICE']),
  warehouseId: z.string().uuid().optional(),
  assignedTo: z.string().uuid().optional(),
  location: z.record(z.any()).optional(),
  specifications: z.record(z.any()).optional(),
  maintenanceSchedule: z.record(z.any()).optional(),
  lastMaintenance: z.string().datetime().optional(),
  nextMaintenance: z.string().datetime().optional(),
  purchaseDate: z.string().datetime().optional(),
  warrantyExpiry: z.string().datetime().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.any()).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  createdBy: z.string().uuid(),
  updatedBy: z.string().uuid().optional(),
});

export const LogisticsPerformanceSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  date: z.string().datetime(),
  warehouseId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
  metricType: z.enum(['TASK_COMPLETION', 'PICK_RATE', 'PUTAWAY_RATE', 'ACCURACY', 'EFFICIENCY']),
  metricValue: z.number(),
  targetValue: z.number().optional(),
  unit: z.enum(['PERCENTAGE', 'COUNT', 'TIME', 'DISTANCE']),
  period: z.enum(['HOURLY', 'DAILY', 'WEEKLY', 'MONTHLY']),
  context: z.record(z.any()).optional(),
  metadata: z.record(z.any()).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const LogisticsScheduleSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  scheduleNumber: z.string(),
  name: z.string(),
  description: z.string().optional(),
  type: z.enum(['TASK_SCHEDULE', 'ROUTE_SCHEDULE', 'MAINTENANCE_SCHEDULE']),
  status: z.enum(['ACTIVE', 'PAUSED', 'CANCELLED']),
  warehouseId: z.string().uuid().optional(),
  assignedTo: z.string().uuid().optional(),
  schedule: z.record(z.any()),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  lastRun: z.string().datetime().optional(),
  nextRun: z.string().datetime().optional(),
  isRecurring: z.boolean(),
  recurrencePattern: z.record(z.any()).optional(),
  metadata: z.record(z.any()).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  createdBy: z.string().uuid(),
  updatedBy: z.string().uuid().optional(),
});

export const LogisticsZoneSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  zoneNumber: z.string(),
  name: z.string(),
  description: z.string().optional(),
  type: z.enum(['PICKING', 'STORAGE', 'RECEIVING', 'SHIPPING', 'CROSS_DOCK']),
  warehouseId: z.string().uuid().optional(),
  managerId: z.string().uuid().optional(),
  boundaries: z.record(z.any()),
  capacity: z.record(z.any()).optional(),
  restrictions: z.record(z.any()).optional(),
  equipment: z.record(z.any()).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'MAINTENANCE']),
  metadata: z.record(z.any()).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  createdBy: z.string().uuid(),
  updatedBy: z.string().uuid().optional(),
});

export const LogisticsWorkflowSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  workflowNumber: z.string(),
  name: z.string(),
  description: z.string().optional(),
  type: z.enum(['ORDER_FULFILLMENT', 'RECEIVING', 'INVENTORY_MANAGEMENT']),
  status: z.enum(['ACTIVE', 'INACTIVE', 'DRAFT']),
  steps: z.array(z.record(z.any())),
  conditions: z.record(z.any()).optional(),
  actions: z.record(z.any()).optional(),
  triggers: z.record(z.any()).optional(),
  metadata: z.record(z.any()).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  createdBy: z.string().uuid(),
  updatedBy: z.string().uuid().optional(),
});

// Create/Update Schemas
export const CreateLogisticsTaskSchema = LogisticsTaskSchema.omit({
  id: true,
  tenantId: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
  updatedBy: true,
});

export const UpdateLogisticsTaskSchema = CreateLogisticsTaskSchema.partial();

export const CreateLogisticsRouteSchema = LogisticsRouteSchema.omit({
  id: true,
  tenantId: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
  updatedBy: true,
});

export const UpdateLogisticsRouteSchema = CreateLogisticsRouteSchema.partial();

export const CreateLogisticsEquipmentSchema = LogisticsEquipmentSchema.omit({
  id: true,
  tenantId: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
  updatedBy: true,
});

export const UpdateLogisticsEquipmentSchema = CreateLogisticsEquipmentSchema.partial();

export const CreateLogisticsScheduleSchema = LogisticsScheduleSchema.omit({
  id: true,
  tenantId: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
  updatedBy: true,
});

export const UpdateLogisticsScheduleSchema = CreateLogisticsScheduleSchema.partial();

export const CreateLogisticsZoneSchema = LogisticsZoneSchema.omit({
  id: true,
  tenantId: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
  updatedBy: true,
});

export const UpdateLogisticsZoneSchema = CreateLogisticsZoneSchema.partial();

export const CreateLogisticsWorkflowSchema = LogisticsWorkflowSchema.omit({
  id: true,
  tenantId: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
  updatedBy: true,
});

export const UpdateLogisticsWorkflowSchema = CreateLogisticsWorkflowSchema.partial();

// Types
export type LogisticsTask = z.infer<typeof LogisticsTaskSchema>;
export type LogisticsRoute = z.infer<typeof LogisticsRouteSchema>;
export type LogisticsEquipment = z.infer<typeof LogisticsEquipmentSchema>;
export type LogisticsPerformance = z.infer<typeof LogisticsPerformanceSchema>;
export type LogisticsSchedule = z.infer<typeof LogisticsScheduleSchema>;
export type LogisticsZone = z.infer<typeof LogisticsZoneSchema>;
export type LogisticsWorkflow = z.infer<typeof LogisticsWorkflowSchema>;
export type CreateLogisticsTask = z.infer<typeof CreateLogisticsTaskSchema>;
export type UpdateLogisticsTask = z.infer<typeof UpdateLogisticsTaskSchema>;
export type CreateLogisticsRoute = z.infer<typeof CreateLogisticsRouteSchema>;
export type UpdateLogisticsRoute = z.infer<typeof UpdateLogisticsRouteSchema>;
export type CreateLogisticsEquipment = z.infer<typeof CreateLogisticsEquipmentSchema>;
export type UpdateLogisticsEquipment = z.infer<typeof UpdateLogisticsEquipmentSchema>;
export type CreateLogisticsSchedule = z.infer<typeof CreateLogisticsScheduleSchema>;
export type UpdateLogisticsSchedule = z.infer<typeof UpdateLogisticsScheduleSchema>;
export type CreateLogisticsZone = z.infer<typeof CreateLogisticsZoneSchema>;
export type UpdateLogisticsZone = z.infer<typeof UpdateLogisticsZoneSchema>;
export type CreateLogisticsWorkflow = z.infer<typeof CreateLogisticsWorkflowSchema>;
export type UpdateLogisticsWorkflow = z.infer<typeof UpdateLogisticsWorkflowSchema>;

// API Client Functions
export const logisticsAPI = {
  // Tasks
  getTasks: async (params?: { page?: number; limit?: number; search?: string; status?: string; type?: string }) => {
    const response = await apiClient.get('/api/logistics/tasks', { params });
    return z.array(LogisticsTaskSchema).parse(response.data);
  },

  getTaskById: async (id: string) => {
    const response = await apiClient.get(`/api/logistics/tasks/${id}`);
    return LogisticsTaskSchema.parse(response.data);
  },

  createTask: async (data: CreateLogisticsTask) => {
    const response = await apiClient.post('/api/logistics/tasks', data);
    return LogisticsTaskSchema.parse(response.data);
  },

  updateTask: async (id: string, data: UpdateLogisticsTask) => {
    const response = await apiClient.put(`/api/logistics/tasks/${id}`, data);
    return LogisticsTaskSchema.parse(response.data);
  },

  deleteTask: async (id: string) => {
    await apiClient.delete(`/api/logistics/tasks/${id}`);
  },

  assignTask: async (id: string, userId: string) => {
    const response = await apiClient.post(`/api/logistics/tasks/${id}/assign`, { userId });
    return LogisticsTaskSchema.parse(response.data);
  },

  startTask: async (id: string) => {
    const response = await apiClient.post(`/api/logistics/tasks/${id}/start`);
    return LogisticsTaskSchema.parse(response.data);
  },

  completeTask: async (id: string) => {
    const response = await apiClient.post(`/api/logistics/tasks/${id}/complete`);
    return LogisticsTaskSchema.parse(response.data);
  },

  // Routes
  getRoutes: async (params?: { page?: number; limit?: number; search?: string; status?: string; type?: string }) => {
    const response = await apiClient.get('/api/logistics/routes', { params });
    return z.array(LogisticsRouteSchema).parse(response.data);
  },

  getRouteById: async (id: string) => {
    const response = await apiClient.get(`/api/logistics/routes/${id}`);
    return LogisticsRouteSchema.parse(response.data);
  },

  createRoute: async (data: CreateLogisticsRoute) => {
    const response = await apiClient.post('/api/logistics/routes', data);
    return LogisticsRouteSchema.parse(response.data);
  },

  updateRoute: async (id: string, data: UpdateLogisticsRoute) => {
    const response = await apiClient.put(`/api/logistics/routes/${id}`, data);
    return LogisticsRouteSchema.parse(response.data);
  },

  deleteRoute: async (id: string) => {
    await apiClient.delete(`/api/logistics/routes/${id}`);
  },

  optimizeRoute: async (id: string) => {
    const response = await apiClient.post(`/api/logistics/routes/${id}/optimize`);
    return LogisticsRouteSchema.parse(response.data);
  },

  // Equipment
  getEquipment: async (params?: { page?: number; limit?: number; search?: string; status?: string; type?: string }) => {
    const response = await apiClient.get('/api/logistics/equipment', { params });
    return z.array(LogisticsEquipmentSchema).parse(response.data);
  },

  getEquipmentById: async (id: string) => {
    const response = await apiClient.get(`/api/logistics/equipment/${id}`);
    return LogisticsEquipmentSchema.parse(response.data);
  },

  createEquipment: async (data: CreateLogisticsEquipment) => {
    const response = await apiClient.post('/api/logistics/equipment', data);
    return LogisticsEquipmentSchema.parse(response.data);
  },

  updateEquipment: async (id: string, data: UpdateLogisticsEquipment) => {
    const response = await apiClient.put(`/api/logistics/equipment/${id}`, data);
    return LogisticsEquipmentSchema.parse(response.data);
  },

  deleteEquipment: async (id: string) => {
    await apiClient.delete(`/api/logistics/equipment/${id}`);
  },

  // Schedules
  getSchedules: async (params?: { page?: number; limit?: number; search?: string; status?: string; type?: string }) => {
    const response = await apiClient.get('/api/logistics/schedules', { params });
    return z.array(LogisticsScheduleSchema).parse(response.data);
  },

  getScheduleById: async (id: string) => {
    const response = await apiClient.get(`/api/logistics/schedules/${id}`);
    return LogisticsScheduleSchema.parse(response.data);
  },

  createSchedule: async (data: CreateLogisticsSchedule) => {
    const response = await apiClient.post('/api/logistics/schedules', data);
    return LogisticsScheduleSchema.parse(response.data);
  },

  updateSchedule: async (id: string, data: UpdateLogisticsSchedule) => {
    const response = await apiClient.put(`/api/logistics/schedules/${id}`, data);
    return LogisticsScheduleSchema.parse(response.data);
  },

  deleteSchedule: async (id: string) => {
    await apiClient.delete(`/api/logistics/schedules/${id}`);
  },

  // Zones
  getZones: async (params?: { page?: number; limit?: number; search?: string; status?: string; type?: string }) => {
    const response = await apiClient.get('/api/logistics/zones', { params });
    return z.array(LogisticsZoneSchema).parse(response.data);
  },

  getZoneById: async (id: string) => {
    const response = await apiClient.get(`/api/logistics/zones/${id}`);
    return LogisticsZoneSchema.parse(response.data);
  },

  createZone: async (data: CreateLogisticsZone) => {
    const response = await apiClient.post('/api/logistics/zones', data);
    return LogisticsZoneSchema.parse(response.data);
  },

  updateZone: async (id: string, data: UpdateLogisticsZone) => {
    const response = await apiClient.put(`/api/logistics/zones/${id}`, data);
    return LogisticsZoneSchema.parse(response.data);
  },

  deleteZone: async (id: string) => {
    await apiClient.delete(`/api/logistics/zones/${id}`);
  },

  // Workflows
  getWorkflows: async (params?: { page?: number; limit?: number; search?: string; status?: string; type?: string }) => {
    const response = await apiClient.get('/api/logistics/workflows', { params });
    return z.array(LogisticsWorkflowSchema).parse(response.data);
  },

  getWorkflowById: async (id: string) => {
    const response = await apiClient.get(`/api/logistics/workflows/${id}`);
    return LogisticsWorkflowSchema.parse(response.data);
  },

  createWorkflow: async (data: CreateLogisticsWorkflow) => {
    const response = await apiClient.post('/api/logistics/workflows', data);
    return LogisticsWorkflowSchema.parse(response.data);
  },

  updateWorkflow: async (id: string, data: UpdateLogisticsWorkflow) => {
    const response = await apiClient.put(`/api/logistics/workflows/${id}`, data);
    return LogisticsWorkflowSchema.parse(response.data);
  },

  deleteWorkflow: async (id: string) => {
    await apiClient.delete(`/api/logistics/workflows/${id}`);
  },
};

export const logisticsAnalyticsAPI = {
  getDashboard: async (params?: { startDate?: string; endDate?: string; warehouseId?: string }) => {
    const response = await apiClient.get('/api/logistics/analytics/dashboard', { params });
    return z.record(z.any()).parse(response.data);
  },

  getPerformance: async (params?: { startDate?: string; endDate?: string; metricType?: string; period?: string }) => {
    const response = await apiClient.get('/api/logistics/analytics/performance', { params });
    return z.array(LogisticsPerformanceSchema).parse(response.data);
  },

  getMetrics: async (params?: { startDate?: string; endDate?: string; groupBy?: string }) => {
    const response = await apiClient.get('/api/logistics/analytics/metrics', { params });
    return z.record(z.any()).parse(response.data);
  },

  getReports: async (params?: { startDate?: string; endDate?: string; type?: string }) => {
    const response = await apiClient.get('/api/logistics/analytics/reports', { params });
    return z.record(z.any()).parse(response.data);
  },
}; 