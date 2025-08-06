import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { authenticate } from '../middleware/auth';
import { hasPermissions } from '../middleware/auth';
import { db } from '../db';
import { 
  logisticsTasks, 
  logisticsRoutes, 
  logisticsEquipment, 
  logisticsPerformance, 
  logisticsSchedules, 
  logisticsZones, 
  logisticsWorkflows 
} from '../db/schema';
import { eq, and, desc, asc, like, gte, lte, inArray } from 'drizzle-orm';
import { sql } from 'drizzle-orm';

// Zod schemas for validation
const createLogisticsTaskSchema = z.object({
  taskNumber: z.string().min(1, 'Task number is required'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  type: z.enum(['PICKING', 'PACKING', 'SHIPPING', 'RECEIVING', 'PUTAWAY', 'CYCLE_COUNT', 'INVENTORY_CHECK', 'MAINTENANCE', 'CLEANING', 'OTHER']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
  status: z.enum(['PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'ON_HOLD']).default('PENDING'),
  assignedTo: z.string().uuid().optional(),
  location: z.string().min(1, 'Location is required'),
  estimatedDuration: z.number().int().positive().optional(),
  actualDuration: z.number().int().positive().optional(),
  startTime: z.string().datetime().optional(),
  endTime: z.string().datetime().optional(),
  dueDate: z.string().datetime().optional(),
  completionDate: z.string().datetime().optional(),
  equipmentRequired: z.array(z.string()).optional(),
  materials: z.array(z.string()).optional(),
  instructions: z.string().optional(),
  attachments: z.array(z.object({
    name: z.string(),
    url: z.string().url(),
    type: z.string(),
    size: z.number(),
  })).optional(),
  metadata: z.record(z.any()).optional(),
});

const updateLogisticsTaskSchema = createLogisticsTaskSchema.partial();

const createLogisticsRouteSchema = z.object({
  routeNumber: z.string().min(1, 'Route number is required'),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  type: z.enum(['DELIVERY', 'PICKUP', 'TRANSFER', 'RETURN', 'EXPRESS', 'STANDARD', 'BULK', 'SPECIALIZED']),
  status: z.enum(['ACTIVE', 'INACTIVE', 'MAINTENANCE', 'DISCONTINUED']).default('ACTIVE'),
  origin: z.string().min(1, 'Origin is required'),
  destination: z.string().min(1, 'Destination is required'),
  distance: z.number().positive().optional(),
  estimatedDuration: z.number().int().positive().optional(),
  actualDuration: z.number().int().positive().optional(),
  costPerMile: z.number().positive().optional(),
  totalCost: z.number().positive().optional(),
  fuelEfficiency: z.number().positive().optional(),
  carbonFootprint: z.number().positive().optional(),
  waypoints: z.array(z.object({
    location: z.string(),
    sequence: z.number().int().positive(),
    estimatedTime: z.number().int().positive(),
    actualTime: z.number().int().positive(),
    status: z.enum(['PENDING', 'COMPLETED', 'SKIPPED']),
  })).optional(),
  restrictions: z.array(z.string()).optional(),
  requirements: z.array(z.string()).optional(),
  equipment: z.array(z.string()).optional(),
  drivers: z.array(z.string()).optional(),
  metadata: z.record(z.any()).optional(),
});

const updateLogisticsRouteSchema = createLogisticsRouteSchema.partial();

const createLogisticsEquipmentSchema = z.object({
  equipmentNumber: z.string().min(1, 'Equipment number is required'),
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['FORKLIFT', 'PALLET_JACK', 'CONVEYOR', 'CRANE', 'TRUCK', 'TRAILER', 'CONTAINER', 'PALLET_RACK', 'SHELVING', 'OTHER']),
  category: z.enum(['MATERIAL_HANDLING', 'TRANSPORTATION', 'STORAGE', 'PACKAGING', 'SAFETY', 'OTHER']),
  status: z.enum(['AVAILABLE', 'IN_USE', 'MAINTENANCE', 'OUT_OF_SERVICE', 'RETIRED']).default('AVAILABLE'),
  location: z.string().min(1, 'Location is required'),
  capacity: z.number().positive().optional(),
  unit: z.string().optional(),
  manufacturer: z.string().optional(),
  model: z.string().optional(),
  serialNumber: z.string().optional(),
  year: z.number().int().positive().optional(),
  purchaseDate: z.string().datetime().optional(),
  purchaseCost: z.number().positive().optional(),
  currentValue: z.number().positive().optional(),
  maintenanceSchedule: z.string().optional(),
  lastMaintenance: z.string().datetime().optional(),
  nextMaintenance: z.string().datetime().optional(),
  operator: z.string().uuid().optional(),
  assignedTo: z.string().uuid().optional(),
  specifications: z.record(z.any()).optional(),
  metadata: z.record(z.any()).optional(),
});

const updateLogisticsEquipmentSchema = createLogisticsEquipmentSchema.partial();

const createLogisticsPerformanceSchema = z.object({
  metricType: z.enum(['EFFICIENCY', 'PRODUCTIVITY', 'QUALITY', 'SAFETY', 'COST', 'DELIVERY_TIME', 'ACCURACY', 'UTILIZATION']),
  metricName: z.string().min(1, 'Metric name is required'),
  value: z.number(),
  unit: z.string().optional(),
  target: z.number().optional(),
  threshold: z.number().optional(),
  period: z.enum(['HOURLY', 'DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY']),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  location: z.string().optional(),
  equipment: z.string().optional(),
  operator: z.string().uuid().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

const updateLogisticsPerformanceSchema = createLogisticsPerformanceSchema.partial();

const createLogisticsScheduleSchema = z.object({
  scheduleNumber: z.string().min(1, 'Schedule number is required'),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  type: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'CUSTOM', 'SHIFT', 'ROTATION']),
  status: z.enum(['ACTIVE', 'INACTIVE', 'PAUSED', 'COMPLETED']).default('ACTIVE'),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  timezone: z.string().default('UTC'),
  recurrence: z.enum(['NONE', 'DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY']).default('NONE'),
  recurrencePattern: z.record(z.any()).optional(),
  assignedTo: z.array(z.string().uuid()).optional(),
  equipment: z.array(z.string()).optional(),
  tasks: z.array(z.string()).optional(),
  location: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
  notes: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

const updateLogisticsScheduleSchema = createLogisticsScheduleSchema.partial();

const createLogisticsZoneSchema = z.object({
  zoneNumber: z.string().min(1, 'Zone number is required'),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  type: z.enum(['STORAGE', 'PICKING', 'PACKING', 'SHIPPING', 'RECEIVING', 'PROCESSING', 'HOLDING', 'QUARANTINE', 'HAZARDOUS', 'COLD_STORAGE', 'OTHER']),
  status: z.enum(['ACTIVE', 'INACTIVE', 'MAINTENANCE', 'RESTRICTED']).default('ACTIVE'),
  location: z.string().min(1, 'Location is required'),
  capacity: z.number().positive().optional(),
  unit: z.string().optional(),
  currentUtilization: z.number().positive().optional(),
  temperature: z.number().optional(),
  humidity: z.number().optional(),
  securityLevel: z.enum(['LOW', 'MEDIUM', 'HIGH', 'RESTRICTED']).default('MEDIUM'),
  accessControl: z.array(z.string()).optional(),
  equipment: z.array(z.string()).optional(),
  restrictions: z.array(z.string()).optional(),
  metadata: z.record(z.any()).optional(),
});

const updateLogisticsZoneSchema = createLogisticsZoneSchema.partial();

const createLogisticsWorkflowSchema = z.object({
  workflowNumber: z.string().min(1, 'Workflow number is required'),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  type: z.enum(['ORDER_FULFILLMENT', 'INVENTORY_MANAGEMENT', 'QUALITY_CONTROL', 'MAINTENANCE', 'SAFETY', 'COMPLIANCE', 'CUSTOM']),
  status: z.enum(['ACTIVE', 'INACTIVE', 'DRAFT', 'ARCHIVED']).default('ACTIVE'),
  version: z.string().default('1.0'),
  steps: z.array(z.object({
    stepNumber: z.number().int().positive(),
    name: z.string(),
    description: z.string().optional(),
    type: z.enum(['TASK', 'APPROVAL', 'NOTIFICATION', 'INTEGRATION', 'DECISION']),
    assignedTo: z.string().uuid().optional(),
    estimatedDuration: z.number().int().positive().optional(),
    required: z.boolean().default(true),
    conditions: z.record(z.any()).optional(),
  })),
  triggers: z.array(z.string()).optional(),
  conditions: z.record(z.any()).optional(),
  metadata: z.record(z.any()).optional(),
});

const updateLogisticsWorkflowSchema = createLogisticsWorkflowSchema.partial();

// Logistics routes
export default async function logisticsRoutes(fastify: FastifyInstance) {
  // Apply authentication middleware to all routes
  fastify.addHook('preHandler', authenticate);
  
  // Get all logistics tasks
  fastify.get('/tasks', {
    preHandler: hasPermissions(['view_logistics']),
    schema: {
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'number', default: 1 },
          pageSize: { type: 'number', default: 10 },
          type: { type: 'string', enum: ['PICKING', 'PACKING', 'SHIPPING', 'RECEIVING', 'PUTAWAY', 'CYCLE_COUNT', 'INVENTORY_CHECK', 'MAINTENANCE', 'CLEANING', 'OTHER'] },
          status: { type: 'string', enum: ['PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'ON_HOLD'] },
          priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] },
          assignedTo: { type: 'string' },
          location: { type: 'string' },
          startDateFrom: { type: 'string', format: 'date-time' },
          startDateTo: { type: 'string', format: 'date-time' },
          dueDateFrom: { type: 'string', format: 'date-time' },
          dueDateTo: { type: 'string', format: 'date-time' },
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
                  taskNumber: { type: 'string' },
                  title: { type: 'string' },
                  type: { type: 'string' },
                  status: { type: 'string' },
                  priority: { type: 'string' },
                  assignedTo: { type: 'string' },
                  location: { type: 'string' },
                  estimatedDuration: { type: 'number' },
                  actualDuration: { type: 'number' },
                  startTime: { type: 'string' },
                  endTime: { type: 'string' },
                  dueDate: { type: 'string' },
                  completionDate: { type: 'string' },
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
      status, 
      priority, 
      assignedTo, 
      location, 
      startDateFrom, 
      startDateTo, 
      dueDateFrom, 
      dueDateTo, 
      search 
    } = request.query as any;

    const offset = (page - 1) * pageSize;
    const conditions = [];

    if (type) conditions.push(eq(logisticsTasks.type, type));
    if (status) conditions.push(eq(logisticsTasks.status, status));
    if (priority) conditions.push(eq(logisticsTasks.priority, priority));
    if (assignedTo) conditions.push(eq(logisticsTasks.assignedTo, assignedTo));
    if (location) conditions.push(like(logisticsTasks.location, `%${location}%`));
    if (search) {
      conditions.push(
        like(logisticsTasks.title, `%${search}%`)
      );
    }

    const [tasks, total] = await Promise.all([
      db.select()
        .from(logisticsTasks)
        .where(and(...conditions))
        .orderBy(desc(logisticsTasks.createdAt))
        .limit(pageSize)
        .offset(offset),
      db.select({ count: sql`count(*)` })
        .from(logisticsTasks)
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

  // Get logistics task by ID
  fastify.get('/tasks/:id', {
    preHandler: hasPermissions(['view_logistics']),
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
      .from(logisticsTasks)
      .where(eq(logisticsTasks.id, id))
      .limit(1);

    if (!task.length) {
      return reply.status(404).send({ error: 'Logistics task not found' });
    }

    return task[0];
  });

  // Create logistics task
  fastify.post('/tasks', {
    preHandler: hasPermissions(['manage_logistics']),
    schema: {
      body: createLogisticsTaskSchema,
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const data = request.body as z.infer<typeof createLogisticsTaskSchema>;
    
    const [task] = await db.insert(logisticsTasks)
      .values({
        ...data,
        tenantId: request.user.tenantId,
        createdBy: request.user.id,
      })
      .returning();

    return reply.status(201).send(task);
  });

  // Update logistics task
  fastify.put('/tasks/:id', {
    preHandler: hasPermissions(['manage_logistics']),
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
        required: ['id'],
      },
      body: updateLogisticsTaskSchema,
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const data = request.body as z.infer<typeof updateLogisticsTaskSchema>;
    
    const [task] = await db.update(logisticsTasks)
      .set({
        ...data,
        updatedBy: request.user.id,
        updatedAt: new Date(),
      })
      .where(eq(logisticsTasks.id, id))
      .returning();

    if (!task) {
      return reply.status(404).send({ error: 'Logistics task not found' });
    }

    return task;
  });

  // Delete logistics task
  fastify.delete('/tasks/:id', {
    preHandler: hasPermissions(['manage_logistics']),
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
    
    const [task] = await db.delete(logisticsTasks)
      .where(eq(logisticsTasks.id, id))
      .returning();

    if (!task) {
      return reply.status(404).send({ error: 'Logistics task not found' });
    }

    return { message: 'Logistics task deleted successfully' };
  });

  // Get all logistics routes
  fastify.get('/routes', {
    preHandler: hasPermissions(['view_logistics']),
    schema: {
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'number', default: 1 },
          pageSize: { type: 'number', default: 10 },
          type: { type: 'string', enum: ['DELIVERY', 'PICKUP', 'TRANSFER', 'RETURN', 'EXPRESS', 'STANDARD', 'BULK', 'SPECIALIZED'] },
          status: { type: 'string', enum: ['ACTIVE', 'INACTIVE', 'MAINTENANCE', 'DISCONTINUED'] },
          origin: { type: 'string' },
          destination: { type: 'string' },
          search: { type: 'string' },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { 
      page = 1, 
      pageSize = 10, 
      type, 
      status, 
      origin, 
      destination, 
      search 
    } = request.query as any;

    const offset = (page - 1) * pageSize;
    const conditions = [];

    if (type) conditions.push(eq(logisticsRoutes.type, type));
    if (status) conditions.push(eq(logisticsRoutes.status, status));
    if (origin) conditions.push(like(logisticsRoutes.origin, `%${origin}%`));
    if (destination) conditions.push(like(logisticsRoutes.destination, `%${destination}%`));
    if (search) {
      conditions.push(
        like(logisticsRoutes.name, `%${search}%`)
      );
    }

    const [routes, total] = await Promise.all([
      db.select()
        .from(logisticsRoutes)
        .where(and(...conditions))
        .orderBy(desc(logisticsRoutes.createdAt))
        .limit(pageSize)
        .offset(offset),
      db.select({ count: sql`count(*)` })
        .from(logisticsRoutes)
        .where(and(...conditions))
        .then(result => Number(result[0]?.count || 0))
    ]);

    return {
      items: routes,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  });

  // Get logistics route by ID
  fastify.get('/routes/:id', {
    preHandler: hasPermissions(['view_logistics']),
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
    
    const route = await db.select()
      .from(logisticsRoutes)
      .where(eq(logisticsRoutes.id, id))
      .limit(1);

    if (!route.length) {
      return reply.status(404).send({ error: 'Logistics route not found' });
    }

    return route[0];
  });

  // Create logistics route
  fastify.post('/routes', {
    preHandler: hasPermissions(['manage_logistics']),
    schema: {
      body: createLogisticsRouteSchema,
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const data = request.body as z.infer<typeof createLogisticsRouteSchema>;
    
    const [route] = await db.insert(logisticsRoutes)
      .values({
        ...data,
        tenantId: request.user.tenantId,
        createdBy: request.user.id,
      })
      .returning();

    return reply.status(201).send(route);
  });

  // Update logistics route
  fastify.put('/routes/:id', {
    preHandler: hasPermissions(['manage_logistics']),
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
        required: ['id'],
      },
      body: updateLogisticsRouteSchema,
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const data = request.body as z.infer<typeof updateLogisticsRouteSchema>;
    
    const [route] = await db.update(logisticsRoutes)
      .set({
        ...data,
        updatedBy: request.user.id,
        updatedAt: new Date(),
      })
      .where(eq(logisticsRoutes.id, id))
      .returning();

    if (!route) {
      return reply.status(404).send({ error: 'Logistics route not found' });
    }

    return route;
  });

  // Delete logistics route
  fastify.delete('/routes/:id', {
    preHandler: hasPermissions(['manage_logistics']),
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
    
    const [route] = await db.delete(logisticsRoutes)
      .where(eq(logisticsRoutes.id, id))
      .returning();

    if (!route) {
      return reply.status(404).send({ error: 'Logistics route not found' });
    }

    return { message: 'Logistics route deleted successfully' };
  });

  // Get all logistics equipment
  fastify.get('/equipment', {
    preHandler: hasPermissions(['view_logistics']),
    schema: {
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'number', default: 1 },
          pageSize: { type: 'number', default: 10 },
          type: { type: 'string', enum: ['FORKLIFT', 'PALLET_JACK', 'CONVEYOR', 'CRANE', 'TRUCK', 'TRAILER', 'CONTAINER', 'PALLET_RACK', 'SHELVING', 'OTHER'] },
          status: { type: 'string', enum: ['AVAILABLE', 'IN_USE', 'MAINTENANCE', 'OUT_OF_SERVICE', 'RETIRED'] },
          location: { type: 'string' },
          search: { type: 'string' },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { 
      page = 1, 
      pageSize = 10, 
      type, 
      status, 
      location, 
      search 
    } = request.query as any;

    const offset = (page - 1) * pageSize;
    const conditions = [];

    if (type) conditions.push(eq(logisticsEquipment.type, type));
    if (status) conditions.push(eq(logisticsEquipment.status, status));
    if (location) conditions.push(like(logisticsEquipment.location, `%${location}%`));
    if (search) {
      conditions.push(
        like(logisticsEquipment.name, `%${search}%`)
      );
    }

    const [equipment, total] = await Promise.all([
      db.select()
        .from(logisticsEquipment)
        .where(and(...conditions))
        .orderBy(desc(logisticsEquipment.createdAt))
        .limit(pageSize)
        .offset(offset),
      db.select({ count: sql`count(*)` })
        .from(logisticsEquipment)
        .where(and(...conditions))
        .then(result => Number(result[0]?.count || 0))
    ]);

    return {
      items: equipment,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  });

  // Get logistics equipment by ID
  fastify.get('/equipment/:id', {
    preHandler: hasPermissions(['view_logistics']),
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
    
    const equipment = await db.select()
      .from(logisticsEquipment)
      .where(eq(logisticsEquipment.id, id))
      .limit(1);

    if (!equipment.length) {
      return reply.status(404).send({ error: 'Logistics equipment not found' });
    }

    return equipment[0];
  });

  // Create logistics equipment
  fastify.post('/equipment', {
    preHandler: hasPermissions(['manage_logistics']),
    schema: {
      body: createLogisticsEquipmentSchema,
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const data = request.body as z.infer<typeof createLogisticsEquipmentSchema>;
    
    const [equipment] = await db.insert(logisticsEquipment)
      .values({
        ...data,
        tenantId: request.user.tenantId,
        createdBy: request.user.id,
      })
      .returning();

    return reply.status(201).send(equipment);
  });

  // Update logistics equipment
  fastify.put('/equipment/:id', {
    preHandler: hasPermissions(['manage_logistics']),
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
        required: ['id'],
      },
      body: updateLogisticsEquipmentSchema,
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const data = request.body as z.infer<typeof updateLogisticsEquipmentSchema>;
    
    const [equipment] = await db.update(logisticsEquipment)
      .set({
        ...data,
        updatedBy: request.user.id,
        updatedAt: new Date(),
      })
      .where(eq(logisticsEquipment.id, id))
      .returning();

    if (!equipment) {
      return reply.status(404).send({ error: 'Logistics equipment not found' });
    }

    return equipment;
  });

  // Delete logistics equipment
  fastify.delete('/equipment/:id', {
    preHandler: hasPermissions(['manage_logistics']),
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
    
    const [equipment] = await db.delete(logisticsEquipment)
      .where(eq(logisticsEquipment.id, id))
      .returning();

    if (!equipment) {
      return reply.status(404).send({ error: 'Logistics equipment not found' });
    }

    return { message: 'Logistics equipment deleted successfully' };
  });

  // Get logistics analytics
  fastify.get('/analytics', {
    preHandler: hasPermissions(['view_logistics']),
    schema: {
      querystring: {
        type: 'object',
        properties: {
          startDate: { type: 'string', format: 'date-time' },
          endDate: { type: 'string', format: 'date-time' },
          metricType: { type: 'string', enum: ['EFFICIENCY', 'PRODUCTIVITY', 'QUALITY', 'SAFETY', 'COST', 'DELIVERY_TIME', 'ACCURACY', 'UTILIZATION'] },
          location: { type: 'string' },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { startDate, endDate, metricType, location } = request.query as any;

    const conditions = [];
    if (startDate) conditions.push(gte(logisticsPerformance.startDate, new Date(startDate)));
    if (endDate) conditions.push(lte(logisticsPerformance.endDate, new Date(endDate)));
    if (metricType) conditions.push(eq(logisticsPerformance.metricType, metricType));
    if (location) conditions.push(eq(logisticsPerformance.location, location));

    const performance = await db.select()
      .from(logisticsPerformance)
      .where(and(...conditions))
      .orderBy(desc(logisticsPerformance.startDate));

    // Calculate summary metrics
    const summary = {
      totalTasks: 0,
      completedTasks: 0,
      averageEfficiency: 0,
      totalCost: 0,
      equipmentUtilization: 0,
    };

    return {
      performance,
      summary,
    };
  });

  // Get logistics dashboard
  fastify.get('/dashboard', {
    preHandler: hasPermissions(['view_logistics']),
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const [tasks, routes, equipment, performance] = await Promise.all([
      db.select({ count: sql`count(*)` })
        .from(logisticsTasks)
        .where(eq(logisticsTasks.tenantId, request.user.tenantId))
        .then(result => Number(result[0]?.count || 0)),
      db.select({ count: sql`count(*)` })
        .from(logisticsRoutes)
        .where(eq(logisticsRoutes.tenantId, request.user.tenantId))
        .then(result => Number(result[0]?.count || 0)),
      db.select({ count: sql`count(*)` })
        .from(logisticsEquipment)
        .where(eq(logisticsEquipment.tenantId, request.user.tenantId))
        .then(result => Number(result[0]?.count || 0)),
      db.select()
        .from(logisticsPerformance)
        .where(eq(logisticsPerformance.tenantId, request.user.tenantId))
        .orderBy(desc(logisticsPerformance.startDate))
        .limit(10),
    ]);

    return {
      metrics: {
        totalTasks: tasks,
        totalRoutes: routes,
        totalEquipment: equipment,
      },
      recentPerformance: performance,
    };
  });
} 