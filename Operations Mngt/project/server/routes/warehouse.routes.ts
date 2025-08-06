import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { db } from '../db';
import { 
  warehouses, 
  warehouseZones, 
  warehouseAisles, 
  warehouseRacks, 
  warehouseBins,
  warehouseTasks,
  cycleCounts,
  pickPaths,
  warehouseEquipment
} from '../db/schema';
import { eq, and, desc, asc, sql } from 'drizzle-orm';
import { authenticate, hasPermissions } from '../middleware/auth';
import { AppError } from '../utils/app-error';

// Validation schemas
const WarehouseSchema = z.object({
  code: z.string().min(1, 'Warehouse code is required'),
  name: z.string().min(1, 'Warehouse name is required'),
  description: z.string().optional(),
  type: z.enum(['DISTRIBUTION', 'FULFILLMENT', 'MANUFACTURING', 'COLD_STORAGE']),
  status: z.enum(['ACTIVE', 'INACTIVE', 'MAINTENANCE', 'CLOSED']).default('ACTIVE'),
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
    contactPerson: z.string()
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
    totalArea: z.number().positive(),
    usableArea: z.number().positive(),
    storageCapacity: z.number().positive()
  }),
  equipment: z.array(z.string()).optional(),
  restrictions: z.record(z.any()).optional()
});

const WarehouseZoneSchema = z.object({
  warehouseId: z.string().uuid(),
  code: z.string().min(1, 'Zone code is required'),
  name: z.string().min(1, 'Zone name is required'),
  description: z.string().optional(),
  type: z.enum(['PICKING', 'STORAGE', 'RECEIVING', 'SHIPPING', 'CROSS_DOCK']),
  status: z.enum(['ACTIVE', 'INACTIVE', 'MAINTENANCE']).default('ACTIVE'),
  capacity: z.object({
    area: z.number().positive(),
    volume: z.number().positive(),
    weight: z.number().positive()
  }),
  restrictions: z.record(z.any()).optional(),
  temperature: z.object({
    min: z.number(),
    max: z.number(),
    unit: z.enum(['CELSIUS', 'FAHRENHEIT'])
  }).optional(),
  security: z.record(z.any()).optional()
});

const WarehouseTaskSchema = z.object({
  warehouseId: z.string().uuid(),
  taskNumber: z.string().min(1, 'Task number is required'),
  type: z.enum(['PICK', 'PUTAWAY', 'CYCLE_COUNT', 'REPLENISHMENT', 'TRANSFER']),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).default('NORMAL'),
  status: z.enum(['PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).default('PENDING'),
  assignedTo: z.string().uuid().optional(),
  sourceLocation: z.object({
    zoneId: z.string().uuid().optional(),
    aisleId: z.string().uuid().optional(),
    rackId: z.string().uuid().optional(),
    binId: z.string().uuid().optional()
  }).optional(),
  destinationLocation: z.object({
    zoneId: z.string().uuid().optional(),
    aisleId: z.string().uuid().optional(),
    rackId: z.string().uuid().optional(),
    binId: z.string().uuid().optional()
  }).optional(),
  items: z.array(z.object({
    itemId: z.string().uuid(),
    quantity: z.number().positive(),
    unit: z.string()
  })),
  estimatedDuration: z.number().int().positive().optional(),
  scheduledStart: z.string().datetime().optional(),
  scheduledEnd: z.string().datetime().optional(),
  notes: z.string().optional()
});

const CycleCountSchema = z.object({
  warehouseId: z.string().uuid(),
  countNumber: z.string().min(1, 'Count number is required'),
  type: z.enum(['ABC', 'RANDOM', 'LOCATION', 'ITEM']),
  status: z.enum(['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).default('PLANNED'),
  assignedTo: z.string().uuid().optional(),
  locations: z.array(z.object({
    zoneId: z.string().uuid().optional(),
    aisleId: z.string().uuid().optional(),
    rackId: z.string().uuid().optional(),
    binId: z.string().uuid().optional()
  })),
  items: z.array(z.object({
    itemId: z.string().uuid(),
    expectedQuantity: z.number().positive()
  })),
  scheduledDate: z.string().datetime(),
  notes: z.string().optional()
});

const PickPathSchema = z.object({
  warehouseId: z.string().uuid(),
  pathNumber: z.string().min(1, 'Path number is required'),
  name: z.string().min(1, 'Path name is required'),
  description: z.string().optional(),
  type: z.enum(['SINGLE_ORDER', 'BATCH', 'ZONE', 'WAVE']),
  status: z.enum(['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).default('PLANNED'),
  assignedTo: z.string().uuid().optional(),
  orders: z.array(z.string().uuid()),
  locations: z.array(z.object({
    zoneId: z.string().uuid(),
    aisleId: z.string().uuid(),
    rackId: z.string().uuid(),
    binId: z.string().uuid(),
    sequence: z.number().int().positive()
  })),
  estimatedDuration: z.number().int().positive().optional(),
  distance: z.number().positive().optional(),
  scheduledStart: z.string().datetime().optional(),
  scheduledEnd: z.string().datetime().optional(),
  notes: z.string().optional()
});

export default async function warehouseRoutes(fastify: FastifyInstance) {
  // Warehouses
  fastify.get('/warehouses', {
    preHandler: authenticate,
    schema: {
      querystring: z.object({
        page: z.string().transform(Number).default('1'),
        limit: z.string().transform(Number).default('10'),
        search: z.string().optional(),
        type: z.enum(['DISTRIBUTION', 'FULFILLMENT', 'MANUFACTURING', 'COLD_STORAGE']).optional(),
        status: z.enum(['ACTIVE', 'INACTIVE', 'MAINTENANCE', 'CLOSED']).optional()
      })
    }
  }, async (request, reply) => {
    const { user } = request;
    const { page, limit, search, type, status } = request.query as any;
    const offset = (page - 1) * limit;

    let whereClause = eq(warehouses.tenantId, user.tenantId);
    const conditions = [whereClause];

    if (search) {
      conditions.push(
        sql`(${warehouses.name} ILIKE ${`%${search}%`} OR ${warehouses.code} ILIKE ${`%${search}%`})`
      );
    }

    if (type) {
      conditions.push(eq(warehouses.type, type));
    }

    if (status) {
      conditions.push(eq(warehouses.status, status));
    }

    const [warehousesList, total] = await Promise.all([
      db.select()
        .from(warehouses)
        .where(and(...conditions))
        .orderBy(desc(warehouses.createdAt))
        .limit(limit)
        .offset(offset),
      db.select({ count: sql<number>`count(*)` })
        .from(warehouses)
        .where(and(...conditions))
        .then(result => result[0]?.count || 0)
    ]);

    return {
      data: warehousesList,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  });

  fastify.get('/warehouses/:id', {
    preHandler: authenticate,
    schema: {
      params: z.object({
        id: z.string().uuid()
      })
    }
  }, async (request, reply) => {
    const { user } = request;
    const { id } = request.params as any;

    const warehouse = await db.select()
      .from(warehouses)
      .where(and(eq(warehouses.id, id), eq(warehouses.tenantId, user.tenantId)))
      .limit(1);

    if (!warehouse.length) {
      throw new AppError('Warehouse not found', 404);
    }

    return warehouse[0];
  });

  fastify.post('/warehouses', {
    preHandler: authenticate,
    schema: {
      body: WarehouseSchema
    }
  }, async (request, reply) => {
    const { user } = request;
    const warehouseData = request.body as any;

    // Check if code already exists
    const existingWarehouse = await db.select()
      .from(warehouses)
      .where(and(eq(warehouses.code, warehouseData.code), eq(warehouses.tenantId, user.tenantId)))
      .limit(1);

    if (existingWarehouse.length) {
      throw new AppError('Warehouse code already exists', 400);
    }

    const [warehouse] = await db.insert(warehouses)
      .values({
        ...warehouseData,
        tenantId: user.tenantId,
        createdBy: user.id,
        updatedBy: user.id
      })
      .returning();

    return warehouse;
  });

  fastify.put('/warehouses/:id', {
    preHandler: authenticate,
    schema: {
      params: z.object({
        id: z.string().uuid()
      }),
      body: WarehouseSchema.partial()
    }
  }, async (request, reply) => {
    const { user } = request;
    const { id } = request.params as any;
    const updateData = request.body as any;

    const [warehouse] = await db.update(warehouses)
      .set({
        ...updateData,
        updatedAt: new Date(),
        updatedBy: user.id
      })
      .where(and(eq(warehouses.id, id), eq(warehouses.tenantId, user.tenantId)))
      .returning();

    if (!warehouse) {
      throw new AppError('Warehouse not found', 404);
    }

    return warehouse;
  });

  // Warehouse Zones
  fastify.get('/warehouses/:warehouseId/zones', {
    preHandler: authenticate,
    schema: {
      params: z.object({
        warehouseId: z.string().uuid()
      }),
      querystring: z.object({
        type: z.enum(['PICKING', 'STORAGE', 'RECEIVING', 'SHIPPING', 'CROSS_DOCK']).optional(),
        status: z.enum(['ACTIVE', 'INACTIVE', 'MAINTENANCE']).optional()
      })
    }
  }, async (request, reply) => {
    const { user } = request;
    const { warehouseId } = request.params as any;
    const { type, status } = request.query as any;

    let whereClause = and(
      eq(warehouseZones.tenantId, user.tenantId),
      eq(warehouseZones.warehouseId, warehouseId)
    );
    const conditions = [whereClause];

    if (type) {
      conditions.push(eq(warehouseZones.type, type));
    }

    if (status) {
      conditions.push(eq(warehouseZones.status, status));
    }

    const zones = await db.select()
      .from(warehouseZones)
      .where(and(...conditions))
      .orderBy(asc(warehouseZones.code));

    return zones;
  });

  fastify.post('/warehouses/:warehouseId/zones', {
    preHandler: authenticate,
    schema: {
      params: z.object({
        warehouseId: z.string().uuid()
      }),
      body: WarehouseZoneSchema.omit({ warehouseId: true })
    }
  }, async (request, reply) => {
    const { user } = request;
    const { warehouseId } = request.params as any;
    const zoneData = request.body as any;

    // Check if zone code already exists in this warehouse
    const existingZone = await db.select()
      .from(warehouseZones)
      .where(and(
        eq(warehouseZones.code, zoneData.code),
        eq(warehouseZones.warehouseId, warehouseId),
        eq(warehouseZones.tenantId, user.tenantId)
      ))
      .limit(1);

    if (existingZone.length) {
      throw new AppError('Zone code already exists in this warehouse', 400);
    }

    const [zone] = await db.insert(warehouseZones)
      .values({
        ...zoneData,
        warehouseId,
        tenantId: user.tenantId,
        createdBy: user.id,
        updatedBy: user.id
      })
      .returning();

    return zone;
  });

  // Warehouse Tasks
  fastify.get('/warehouses/:warehouseId/tasks', {
    preHandler: authenticate,
    schema: {
      params: z.object({
        warehouseId: z.string().uuid()
      }),
      querystring: z.object({
        page: z.string().transform(Number).default('1'),
        limit: z.string().transform(Number).default('10'),
        type: z.enum(['PICK', 'PUTAWAY', 'CYCLE_COUNT', 'REPLENISHMENT', 'TRANSFER']).optional(),
        status: z.enum(['PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
        priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).optional(),
        assignedTo: z.string().uuid().optional()
      })
    }
  }, async (request, reply) => {
    const { user } = request;
    const { warehouseId } = request.params as any;
    const { page, limit, type, status, priority, assignedTo } = request.query as any;
    const offset = (page - 1) * limit;

    let whereClause = and(
      eq(warehouseTasks.tenantId, user.tenantId),
      eq(warehouseTasks.warehouseId, warehouseId)
    );
    const conditions = [whereClause];

    if (type) {
      conditions.push(eq(warehouseTasks.type, type));
    }

    if (status) {
      conditions.push(eq(warehouseTasks.status, status));
    }

    if (priority) {
      conditions.push(eq(warehouseTasks.priority, priority));
    }

    if (assignedTo) {
      conditions.push(eq(warehouseTasks.assignedTo, assignedTo));
    }

    const [tasks, total] = await Promise.all([
      db.select()
        .from(warehouseTasks)
        .where(and(...conditions))
        .orderBy(desc(warehouseTasks.createdAt))
        .limit(limit)
        .offset(offset),
      db.select({ count: sql<number>`count(*)` })
        .from(warehouseTasks)
        .where(and(...conditions))
        .then(result => result[0]?.count || 0)
    ]);

    return {
      data: tasks,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  });

  fastify.post('/warehouses/:warehouseId/tasks', {
    preHandler: authenticate,
    schema: {
      params: z.object({
        warehouseId: z.string().uuid()
      }),
      body: WarehouseTaskSchema.omit({ warehouseId: true })
    }
  }, async (request, reply) => {
    const { user } = request;
    const { warehouseId } = request.params as any;
    const taskData = request.body as any;

    // Generate task number if not provided
    if (!taskData.taskNumber) {
      taskData.taskNumber = `TASK-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    const [task] = await db.insert(warehouseTasks)
      .values({
        ...taskData,
        warehouseId,
        tenantId: user.tenantId,
        createdBy: user.id,
        updatedBy: user.id
      })
      .returning();

    return task;
  });

  fastify.put('/warehouses/tasks/:taskId/status', {
    preHandler: authenticate,
    schema: {
      params: z.object({
        taskId: z.string().uuid()
      }),
      body: z.object({
        status: z.enum(['PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']),
        assignedTo: z.string().uuid().optional(),
        notes: z.string().optional()
      })
    }
  }, async (request, reply) => {
    const { user } = request;
    const { taskId } = request.params as any;
    const { status, assignedTo, notes } = request.body as any;

    const updateData: any = {
      status,
      updatedAt: new Date(),
      updatedBy: user.id
    };

    if (assignedTo) {
      updateData.assignedTo = assignedTo;
    }

    if (status === 'IN_PROGRESS' && !updateData.startedAt) {
      updateData.startedAt = new Date();
    }

    if (status === 'COMPLETED') {
      updateData.completedAt = new Date();
      updateData.completedBy = user.id;
    }

    if (notes) {
      updateData.notes = notes;
    }

    const [task] = await db.update(warehouseTasks)
      .set(updateData)
      .where(and(eq(warehouseTasks.id, taskId), eq(warehouseTasks.tenantId, user.tenantId)))
      .returning();

    if (!task) {
      throw new AppError('Task not found', 404);
    }

    return task;
  });

  // Cycle Counts
  fastify.get('/warehouses/:warehouseId/cycle-counts', {
    preHandler: authenticate,
    schema: {
      params: z.object({
        warehouseId: z.string().uuid()
      }),
      querystring: z.object({
        page: z.string().transform(Number).default('1'),
        limit: z.string().transform(Number).default('10'),
        type: z.enum(['ABC', 'RANDOM', 'LOCATION', 'ITEM']).optional(),
        status: z.enum(['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional()
      })
    }
  }, async (request, reply) => {
    const { user } = request;
    const { warehouseId } = request.params as any;
    const { page, limit, type, status } = request.query as any;
    const offset = (page - 1) * limit;

    let whereClause = and(
      eq(cycleCounts.tenantId, user.tenantId),
      eq(cycleCounts.warehouseId, warehouseId)
    );
    const conditions = [whereClause];

    if (type) {
      conditions.push(eq(cycleCounts.type, type));
    }

    if (status) {
      conditions.push(eq(cycleCounts.status, status));
    }

    const [counts, total] = await Promise.all([
      db.select()
        .from(cycleCounts)
        .where(and(...conditions))
        .orderBy(desc(cycleCounts.createdAt))
        .limit(limit)
        .offset(offset),
      db.select({ count: sql<number>`count(*)` })
        .from(cycleCounts)
        .where(and(...conditions))
        .then(result => result[0]?.count || 0)
    ]);

    return {
      data: counts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  });

  fastify.post('/warehouses/:warehouseId/cycle-counts', {
    preHandler: authenticate,
    schema: {
      params: z.object({
        warehouseId: z.string().uuid()
      }),
      body: CycleCountSchema.omit({ warehouseId: true })
    }
  }, async (request, reply) => {
    const { user } = request;
    const { warehouseId } = request.params as any;
    const countData = request.body as any;

    // Generate count number if not provided
    if (!countData.countNumber) {
      countData.countNumber = `CC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    const [cycleCount] = await db.insert(cycleCounts)
      .values({
        ...countData,
        warehouseId,
        tenantId: user.tenantId,
        createdBy: user.id,
        updatedBy: user.id
      })
      .returning();

    return cycleCount;
  });

  // Pick Paths
  fastify.get('/warehouses/:warehouseId/pick-paths', {
    preHandler: authenticate,
    schema: {
      params: z.object({
        warehouseId: z.string().uuid()
      }),
      querystring: z.object({
        page: z.string().transform(Number).default('1'),
        limit: z.string().transform(Number).default('10'),
        type: z.enum(['SINGLE_ORDER', 'BATCH', 'ZONE', 'WAVE']).optional(),
        status: z.enum(['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional()
      })
    }
  }, async (request, reply) => {
    const { user } = request;
    const { warehouseId } = request.params as any;
    const { page, limit, type, status } = request.query as any;
    const offset = (page - 1) * limit;

    let whereClause = and(
      eq(pickPaths.tenantId, user.tenantId),
      eq(pickPaths.warehouseId, warehouseId)
    );
    const conditions = [whereClause];

    if (type) {
      conditions.push(eq(pickPaths.type, type));
    }

    if (status) {
      conditions.push(eq(pickPaths.status, status));
    }

    const [paths, total] = await Promise.all([
      db.select()
        .from(pickPaths)
        .where(and(...conditions))
        .orderBy(desc(pickPaths.createdAt))
        .limit(limit)
        .offset(offset),
      db.select({ count: sql<number>`count(*)` })
        .from(pickPaths)
        .where(and(...conditions))
        .then(result => result[0]?.count || 0)
    ]);

    return {
      data: paths,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  });

  fastify.post('/warehouses/:warehouseId/pick-paths', {
    preHandler: authenticate,
    schema: {
      params: z.object({
        warehouseId: z.string().uuid()
      }),
      body: PickPathSchema.omit({ warehouseId: true })
    }
  }, async (request, reply) => {
    const { user } = request;
    const { warehouseId } = request.params as any;
    const pathData = request.body as any;

    // Generate path number if not provided
    if (!pathData.pathNumber) {
      pathData.pathNumber = `PATH-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    const [pickPath] = await db.insert(pickPaths)
      .values({
        ...pathData,
        warehouseId,
        tenantId: user.tenantId,
        createdBy: user.id,
        updatedBy: user.id
      })
      .returning();

    return pickPath;
  });

  // Warehouse Analytics
  fastify.get('/warehouses/:warehouseId/analytics', {
    preHandler: authenticate,
    schema: {
      params: z.object({
        warehouseId: z.string().uuid()
      }),
      querystring: z.object({
        startDate: z.string().datetime().optional(),
        endDate: z.string().datetime().optional()
      })
    }
  }, async (request, reply) => {
    const { user } = request;
    const { warehouseId } = request.params as any;
    const { startDate, endDate } = request.query as any;

    let whereClause = and(
      eq(warehouseTasks.tenantId, user.tenantId),
      eq(warehouseTasks.warehouseId, warehouseId)
    );
    const conditions = [whereClause];

    if (startDate) {
      conditions.push(sql`${warehouseTasks.createdAt} >= ${startDate}`);
    }

    if (endDate) {
      conditions.push(sql`${warehouseTasks.createdAt} <= ${endDate}`);
    }

    const analytics = await db.select({
      totalTasks: sql<number>`count(*)`,
      completedTasks: sql<number>`count(*) filter (where ${warehouseTasks.status} = 'COMPLETED')`,
      pendingTasks: sql<number>`count(*) filter (where ${warehouseTasks.status} = 'PENDING')`,
      inProgressTasks: sql<number>`count(*) filter (where ${warehouseTasks.status} = 'IN_PROGRESS')`,
      averageCompletionTime: sql<number>`avg(${warehouseTasks.actualDuration})`
    })
    .from(warehouseTasks)
    .where(and(...conditions));

    return analytics[0];
  });
} 
