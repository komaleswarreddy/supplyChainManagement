import { apiClient } from '@/lib/api-client';
import { z } from 'zod';

// Zod schemas for validation
export const WarehouseSchema = z.object({
  id: z.string().optional(),
  code: z.string().min(1, 'Code is required'),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  type: z.enum(['DISTRIBUTION', 'FULFILLMENT', 'MANUFACTURING', 'COLD_STORAGE']),
  status: z.enum(['ACTIVE', 'INACTIVE', 'MAINTENANCE', 'CLOSED']),
  address: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string(),
    country: z.string()
  }),
  contactInfo: z.object({
    phone: z.string(),
    email: z.string().email(),
    manager: z.string()
  }),
  operatingHours: z.object({
    monday: z.object({ open: z.string(), close: z.string() }),
    tuesday: z.object({ open: z.string(), close: z.string() }),
    wednesday: z.object({ open: z.string(), close: z.string() }),
    thursday: z.object({ open: z.string(), close: z.string() }),
    friday: z.object({ open: z.string(), close: z.string() }),
    saturday: z.object({ open: z.string(), close: z.string() }),
    sunday: z.object({ open: z.string(), close: z.string() })
  }),
  capacity: z.object({
    totalArea: z.number().min(0),
    storageArea: z.number().min(0),
    pickingArea: z.number().min(0),
    receivingArea: z.number().min(0),
    shippingArea: z.number().min(0)
  }),
  equipment: z.array(z.object({
    id: z.string(),
    type: z.string(),
    name: z.string(),
    status: z.string()
  })).optional(),
  restrictions: z.record(z.any()).optional()
});

export const WarehouseZoneSchema = z.object({
  id: z.string().optional(),
  warehouseId: z.string().min(1, 'Warehouse is required'),
  code: z.string().min(1, 'Code is required'),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  type: z.enum(['PICKING', 'STORAGE', 'RECEIVING', 'SHIPPING', 'CROSS_DOCK']),
  status: z.enum(['ACTIVE', 'INACTIVE', 'MAINTENANCE']),
  capacity: z.object({
    totalArea: z.number().min(0),
    usedArea: z.number().min(0),
    availableArea: z.number().min(0)
  }),
  restrictions: z.record(z.any()).optional(),
  temperature: z.object({
    min: z.number(),
    max: z.number(),
    unit: z.enum(['CELSIUS', 'FAHRENHEIT'])
  }).optional(),
  security: z.record(z.any()).optional()
});

export const WarehouseTaskSchema = z.object({
  id: z.string().optional(),
  warehouseId: z.string().min(1, 'Warehouse is required'),
  taskNumber: z.string().min(1, 'Task number is required'),
  type: z.enum(['PICK', 'PUTAWAY', 'CYCLE_COUNT', 'REPLENISHMENT', 'TRANSFER']),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']),
  status: z.enum(['PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']),
  assignedTo: z.string().optional(),
  sourceLocation: z.object({
    zoneId: z.string().optional(),
    aisleId: z.string().optional(),
    rackId: z.string().optional(),
    binId: z.string().optional()
  }).optional(),
  destinationLocation: z.object({
    zoneId: z.string().optional(),
    aisleId: z.string().optional(),
    rackId: z.string().optional(),
    binId: z.string().optional()
  }).optional(),
  items: z.array(z.object({
    itemId: z.string(),
    quantity: z.number().min(1),
    unit: z.string()
  })),
  estimatedDuration: z.number().min(0).optional(),
  actualDuration: z.number().min(0).optional(),
  scheduledStart: z.string().optional(),
  scheduledEnd: z.string().optional(),
  startedAt: z.string().optional(),
  completedAt: z.string().optional(),
  completedBy: z.string().optional(),
  notes: z.string().optional()
});

export const CycleCountSchema = z.object({
  id: z.string().optional(),
  warehouseId: z.string().min(1, 'Warehouse is required'),
  countNumber: z.string().min(1, 'Count number is required'),
  type: z.enum(['ABC', 'RANDOM', 'LOCATION', 'ITEM']),
  status: z.enum(['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']),
  assignedTo: z.string().optional(),
  locations: z.array(z.object({
    zoneId: z.string(),
    aisleId: z.string().optional(),
    rackId: z.string().optional(),
    binId: z.string().optional()
  })),
  items: z.array(z.object({
    itemId: z.string(),
    expectedQuantity: z.number().min(0),
    countedQuantity: z.number().min(0),
    variance: z.number()
  })),
  scheduledDate: z.string(),
  startedAt: z.string().optional(),
  completedAt: z.string().optional(),
  completedBy: z.string().optional(),
  variances: z.array(z.object({
    itemId: z.string(),
    expectedQuantity: z.number(),
    countedQuantity: z.number(),
    variance: z.number(),
    variancePercentage: z.number()
  })).optional(),
  notes: z.string().optional()
});

export const PickPathSchema = z.object({
  id: z.string().optional(),
  warehouseId: z.string().min(1, 'Warehouse is required'),
  pathNumber: z.string().min(1, 'Path number is required'),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  type: z.enum(['SINGLE_ORDER', 'BATCH', 'ZONE', 'WAVE']),
  status: z.enum(['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']),
  assignedTo: z.string().optional(),
  orders: z.array(z.object({
    orderId: z.string(),
    orderNumber: z.string(),
    priority: z.string()
  })),
  locations: z.array(z.object({
    zoneId: z.string(),
    aisleId: z.string(),
    rackId: z.string(),
    binId: z.string(),
    sequence: z.number()
  })),
  estimatedDuration: z.number().min(0).optional(),
  actualDuration: z.number().min(0).optional(),
  distance: z.number().min(0).optional(),
  scheduledStart: z.string().optional(),
  scheduledEnd: z.string().optional(),
  startedAt: z.string().optional(),
  completedAt: z.string().optional(),
  completedBy: z.string().optional(),
  notes: z.string().optional()
});

// Types
export type Warehouse = z.infer<typeof WarehouseSchema>;
export type WarehouseZone = z.infer<typeof WarehouseZoneSchema>;
export type WarehouseTask = z.infer<typeof WarehouseTaskSchema>;
export type CycleCount = z.infer<typeof CycleCountSchema>;
export type PickPath = z.infer<typeof PickPathSchema>;

// API endpoints
const WAREHOUSE_API_BASE = '/api/warehouse';

// Warehouses API
export const warehouseAPI = {
  // Get all warehouses
  getAll: async (params?: {
    search?: string;
    type?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await apiClient.get(`${WAREHOUSE_API_BASE}/warehouses`, { params });
    return response.data;
  },

  // Get warehouse by ID
  getById: async (id: string) => {
    const response = await apiClient.get(`${WAREHOUSE_API_BASE}/warehouses/${id}`);
    return response.data;
  },

  // Create new warehouse
  create: async (data: Omit<Warehouse, 'id'>) => {
    const validatedData = WarehouseSchema.parse(data);
    const response = await apiClient.post(`${WAREHOUSE_API_BASE}/warehouses`, validatedData);
    return response.data;
  },

  // Update warehouse
  update: async (id: string, data: Partial<Warehouse>) => {
    const validatedData = WarehouseSchema.partial().parse(data);
    const response = await apiClient.put(`${WAREHOUSE_API_BASE}/warehouses/${id}`, validatedData);
    return response.data;
  },

  // Delete warehouse
  delete: async (id: string) => {
    const response = await apiClient.delete(`${WAREHOUSE_API_BASE}/warehouses/${id}`);
    return response.data;
  },

  // Get warehouse analytics
  getAnalytics: async (id: string) => {
    const response = await apiClient.get(`${WAREHOUSE_API_BASE}/warehouses/${id}/analytics`);
    return response.data;
  }
};

// Warehouse Zones API
export const warehouseZoneAPI = {
  // Get all zones for a warehouse
  getAll: async (warehouseId: string, params?: {
    search?: string;
    type?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await apiClient.get(`${WAREHOUSE_API_BASE}/warehouses/${warehouseId}/zones`, { params });
    return response.data;
  },

  // Get zone by ID
  getById: async (warehouseId: string, zoneId: string) => {
    const response = await apiClient.get(`${WAREHOUSE_API_BASE}/warehouses/${warehouseId}/zones/${zoneId}`);
    return response.data;
  },

  // Create new zone
  create: async (warehouseId: string, data: Omit<WarehouseZone, 'id' | 'warehouseId'>) => {
    const validatedData = WarehouseZoneSchema.omit({ id: true, warehouseId: true }).parse(data);
    const response = await apiClient.post(`${WAREHOUSE_API_BASE}/warehouses/${warehouseId}/zones`, validatedData);
    return response.data;
  },

  // Update zone
  update: async (warehouseId: string, zoneId: string, data: Partial<WarehouseZone>) => {
    const validatedData = WarehouseZoneSchema.partial().parse(data);
    const response = await apiClient.put(`${WAREHOUSE_API_BASE}/warehouses/${warehouseId}/zones/${zoneId}`, validatedData);
    return response.data;
  },

  // Delete zone
  delete: async (warehouseId: string, zoneId: string) => {
    const response = await apiClient.delete(`${WAREHOUSE_API_BASE}/warehouses/${warehouseId}/zones/${zoneId}`);
    return response.data;
  }
};

// Warehouse Tasks API
export const warehouseTaskAPI = {
  // Get all tasks
  getAll: async (params?: {
    warehouseId?: string;
    type?: string;
    status?: string;
    assignedTo?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await apiClient.get(`${WAREHOUSE_API_BASE}/tasks`, { params });
    return response.data;
  },

  // Get task by ID
  getById: async (id: string) => {
    const response = await apiClient.get(`${WAREHOUSE_API_BASE}/tasks/${id}`);
    return response.data;
  },

  // Create new task
  create: async (data: Omit<WarehouseTask, 'id'>) => {
    const validatedData = WarehouseTaskSchema.parse(data);
    const response = await apiClient.post(`${WAREHOUSE_API_BASE}/tasks`, validatedData);
    return response.data;
  },

  // Update task
  update: async (id: string, data: Partial<WarehouseTask>) => {
    const validatedData = WarehouseTaskSchema.partial().parse(data);
    const response = await apiClient.put(`${WAREHOUSE_API_BASE}/tasks/${id}`, validatedData);
    return response.data;
  },

  // Delete task
  delete: async (id: string) => {
    const response = await apiClient.delete(`${WAREHOUSE_API_BASE}/tasks/${id}`);
    return response.data;
  },

  // Assign task
  assign: async (id: string, assignedTo: string) => {
    const response = await apiClient.post(`${WAREHOUSE_API_BASE}/tasks/${id}/assign`, { assignedTo });
    return response.data;
  },

  // Start task
  start: async (id: string) => {
    const response = await apiClient.post(`${WAREHOUSE_API_BASE}/tasks/${id}/start`);
    return response.data;
  },

  // Complete task
  complete: async (id: string, data?: { actualDuration?: number; notes?: string }) => {
    const response = await apiClient.post(`${WAREHOUSE_API_BASE}/tasks/${id}/complete`, data);
    return response.data;
  },

  // Cancel task
  cancel: async (id: string, reason?: string) => {
    const response = await apiClient.post(`${WAREHOUSE_API_BASE}/tasks/${id}/cancel`, { reason });
    return response.data;
  }
};

// Cycle Counts API
export const cycleCountAPI = {
  // Get all cycle counts
  getAll: async (params?: {
    warehouseId?: string;
    type?: string;
    status?: string;
    assignedTo?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await apiClient.get(`${WAREHOUSE_API_BASE}/cycle-counts`, { params });
    return response.data;
  },

  // Get cycle count by ID
  getById: async (id: string) => {
    const response = await apiClient.get(`${WAREHOUSE_API_BASE}/cycle-counts/${id}`);
    return response.data;
  },

  // Create new cycle count
  create: async (data: Omit<CycleCount, 'id'>) => {
    const validatedData = CycleCountSchema.parse(data);
    const response = await apiClient.post(`${WAREHOUSE_API_BASE}/cycle-counts`, validatedData);
    return response.data;
  },

  // Update cycle count
  update: async (id: string, data: Partial<CycleCount>) => {
    const validatedData = CycleCountSchema.partial().parse(data);
    const response = await apiClient.put(`${WAREHOUSE_API_BASE}/cycle-counts/${id}`, validatedData);
    return response.data;
  },

  // Delete cycle count
  delete: async (id: string) => {
    const response = await apiClient.delete(`${WAREHOUSE_API_BASE}/cycle-counts/${id}`);
    return response.data;
  },

  // Start cycle count
  start: async (id: string) => {
    const response = await apiClient.post(`${WAREHOUSE_API_BASE}/cycle-counts/${id}/start`);
    return response.data;
  },

  // Complete cycle count
  complete: async (id: string, data: { variances: any[]; notes?: string }) => {
    const response = await apiClient.post(`${WAREHOUSE_API_BASE}/cycle-counts/${id}/complete`, data);
    return response.data;
  }
};

// Pick Paths API
export const pickPathAPI = {
  // Get all pick paths
  getAll: async (params?: {
    warehouseId?: string;
    type?: string;
    status?: string;
    assignedTo?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await apiClient.get(`${WAREHOUSE_API_BASE}/pick-paths`, { params });
    return response.data;
  },

  // Get pick path by ID
  getById: async (id: string) => {
    const response = await apiClient.get(`${WAREHOUSE_API_BASE}/pick-paths/${id}`);
    return response.data;
  },

  // Create new pick path
  create: async (data: Omit<PickPath, 'id'>) => {
    const validatedData = PickPathSchema.parse(data);
    const response = await apiClient.post(`${WAREHOUSE_API_BASE}/pick-paths`, validatedData);
    return response.data;
  },

  // Update pick path
  update: async (id: string, data: Partial<PickPath>) => {
    const validatedData = PickPathSchema.partial().parse(data);
    const response = await apiClient.put(`${WAREHOUSE_API_BASE}/pick-paths/${id}`, validatedData);
    return response.data;
  },

  // Delete pick path
  delete: async (id: string) => {
    const response = await apiClient.delete(`${WAREHOUSE_API_BASE}/pick-paths/${id}`);
    return response.data;
  },

  // Start pick path
  start: async (id: string) => {
    const response = await apiClient.post(`${WAREHOUSE_API_BASE}/pick-paths/${id}/start`);
    return response.data;
  },

  // Complete pick path
  complete: async (id: string, data?: { actualDuration?: number; distance?: number; notes?: string }) => {
    const response = await apiClient.post(`${WAREHOUSE_API_BASE}/pick-paths/${id}/complete`, data);
    return response.data;
  }
};

// Warehouse Analytics API
export const warehouseAnalyticsAPI = {
  // Get dashboard metrics
  getDashboardMetrics: async () => {
    const response = await apiClient.get(`${WAREHOUSE_API_BASE}/analytics/dashboard`);
    return response.data;
  },

  // Get task performance
  getTaskPerformance: async (params?: {
    warehouseId?: string;
    startDate?: string;
    endDate?: string;
    type?: string;
  }) => {
    const response = await apiClient.get(`${WAREHOUSE_API_BASE}/analytics/task-performance`, { params });
    return response.data;
  },

  // Get warehouse utilization
  getWarehouseUtilization: async (warehouseId: string) => {
    const response = await apiClient.get(`${WAREHOUSE_API_BASE}/analytics/warehouse-utilization/${warehouseId}`);
    return response.data;
  },

  // Get equipment status
  getEquipmentStatus: async (warehouseId: string) => {
    const response = await apiClient.get(`${WAREHOUSE_API_BASE}/analytics/equipment-status/${warehouseId}`);
    return response.data;
  },

  // Get cycle count accuracy
  getCycleCountAccuracy: async (params?: {
    warehouseId?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    const response = await apiClient.get(`${WAREHOUSE_API_BASE}/analytics/cycle-count-accuracy`, { params });
    return response.data;
  }
}; 