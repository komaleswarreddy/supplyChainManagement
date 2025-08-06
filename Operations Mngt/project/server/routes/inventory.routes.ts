import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { db } from '../db';
import { inventoryItems, inventoryMovements, inventoryAdjustments } from '../db/schema/inventory';
import { eq } from 'drizzle-orm';
import { AppError } from '../utils/app-error';
import { authenticate, hasPermissions } from '../middleware/auth';

// Define route schemas
const createItemSchema = z.object({
  itemCode: z.string().min(1, 'Item code is required'),
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  category: z.string().min(1, 'Category is required'),
  status: z.enum(['IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK', 'DISCONTINUED']),
  minQuantity: z.number().int().min(0),
  maxQuantity: z.number().int().optional(),
  reorderPoint: z.number().int().optional(),
  currentQuantity: z.number().int().min(0),
  unitCost: z.number().min(0).optional(),
  currency: z.string().default('USD'),
  location: z.object({
    warehouse: z.string(),
    zone: z.string(),
    bin: z.string(),
  }),
  specifications: z.record(z.string(), z.any()).optional(),
  dimensions: z.object({
    length: z.number(),
    width: z.number(),
    height: z.number(),
    weight: z.number(),
    uom: z.string(),
  }).optional(),
  supplierId: z.string().uuid().optional(),
});

const createMovementSchema = z.object({
  type: z.enum(['RECEIPT', 'ISSUE', 'RETURN', 'ADJUSTMENT', 'TRANSFER']),
  referenceNumber: z.string().min(1, 'Reference number is required'),
  itemId: z.string().uuid(),
  quantity: z.number().int().positive(),
  fromLocation: z.object({
    warehouse: z.string(),
    zone: z.string(),
    bin: z.string(),
  }).optional(),
  toLocation: z.object({
    warehouse: z.string(),
    zone: z.string(),
    bin: z.string(),
  }).optional(),
  notes: z.string().optional(),
});

const createAdjustmentSchema = z.object({
  itemId: z.string().uuid(),
  type: z.enum(['INCREASE', 'DECREASE']),
  quantity: z.number().int().positive(),
  reason: z.string().min(1, 'Reason is required'),
  notes: z.string().optional(),
});

// Inventory routes
export default async function inventoryRoutes(fastify: FastifyInstance) {
  // Apply authentication middleware to all routes
  fastify.addHook('preHandler', authenticate);
  
  // Get all inventory items
  fastify.get('/items', {
    preHandler: hasPermissions(['manage_inventory']),
    schema: {
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'number', default: 1 },
          pageSize: { type: 'number', default: 10 },
          status: { type: 'string', enum: ['IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK', 'DISCONTINUED'] },
          category: { type: 'string' },
          warehouse: { type: 'string' },
          supplier: { type: 'string' },
          minQuantity: { type: 'number' },
          maxQuantity: { type: 'number' },
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
                  itemCode: { type: 'string' },
                  name: { type: 'string' },
                  description: { type: 'string' },
                  category: { type: 'string' },
                  status: { type: 'string' },
                  currentQuantity: { type: 'number' },
                  unitCost: { type: 'number' },
                  location: { type: 'object' },
                  createdAt: { type: 'string', format: 'date-time' },
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
    const { page = 1, pageSize = 10, status, category, warehouse, supplier, minQuantity, maxQuantity } = request.query as any;
    
    // Build query
    let query = db.select().from(inventoryItems);
    
    // Apply filters
    if (status) {
      query = query.where(eq(inventoryItems.status, status));
    }
    
    // Add more complex filtering for category, warehouse, supplier, etc.
    if (search) {
      conditions.push(
        or(
          like(inventoryItems.name, `%${search}%`),
          like(inventoryItems.sku, `%${search}%`),
          like(inventoryItems.description, `%${search}%`)
        )
      );
    }
    
    if (category) {
      conditions.push(eq(inventoryItems.category, category));
    }
    
    if (warehouse) {
      conditions.push(eq(inventoryItems.warehouseId, warehouse));
    }
    
    if (supplier) {
      conditions.push(eq(inventoryItems.supplierId, supplier));
    }
    
    if (status) {
      conditions.push(eq(inventoryItems.status, status));
    }
    
    // Get total count for pagination
    const totalQuery = db.select({ count: db.fn.count() }).from(inventoryItems);
    const [{ count }] = await totalQuery.execute();
    const total = Number(count);
    
    // Apply pagination
    query = query.limit(pageSize).offset((page - 1) * pageSize);
    
    // Execute query
    const items = await query.execute();
    
    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  });
  
  // Get inventory item by ID
  fastify.get('/items/:id', {
    preHandler: hasPermissions(['manage_inventory']),
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            itemCode: { type: 'string' },
            name: { type: 'string' },
            description: { type: 'string' },
            category: { type: 'string' },
            status: { type: 'string' },
            minQuantity: { type: 'number' },
            maxQuantity: { type: 'number' },
            reorderPoint: { type: 'number' },
            currentQuantity: { type: 'number' },
            unitCost: { type: 'number' },
            currency: { type: 'string' },
            location: { type: 'object' },
            specifications: { type: 'object' },
            dimensions: { type: 'object' },
            supplierId: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    
    const item = await db.select().from(inventoryItems).where(eq(inventoryItems.id, id)).limit(1);
    
    if (!item.length) {
      throw new AppError('Inventory item not found', 404);
    }
    
    return item[0];
  });
  
  // Create inventory item
  fastify.post('/items', {
    preHandler: hasPermissions(['manage_inventory']),
    schema: {
      body: {
        type: 'object',
        required: ['itemCode', 'name', 'description', 'category', 'status', 'currentQuantity'],
        properties: {
          itemCode: { type: 'string' },
          name: { type: 'string' },
          description: { type: 'string' },
          category: { type: 'string' },
          status: { type: 'string', enum: ['IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK', 'DISCONTINUED'] },
          minQuantity: { type: 'number' },
          maxQuantity: { type: 'number' },
          reorderPoint: { type: 'number' },
          currentQuantity: { type: 'number' },
          unitCost: { type: 'number' },
          currency: { type: 'string' },
          location: { type: 'object' },
          specifications: { type: 'object' },
          dimensions: { type: 'object' },
          supplierId: { type: 'string', format: 'uuid' },
        },
      },
      response: {
        201: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            itemCode: { type: 'string' },
            message: { type: 'string' },
          },
        },
      },
    },
  }, async (request: any, reply: FastifyReply) => {
    try {
      const itemData = createItemSchema.parse(request.body);
      
      // Check if item code already exists
      const existingItem = await db.select({ id: inventoryItems.id }).from(inventoryItems).where(eq(inventoryItems.itemCode, itemData.itemCode)).limit(1);
      
      if (existingItem.length) {
        throw new AppError('Item with this code already exists', 409);
      }
      
      // Create item
      const [newItem] = await db.insert(inventoryItems).values({
        ...itemData,
        createdBy: request.user.id,
      }).returning({ id: inventoryItems.id, itemCode: inventoryItems.itemCode });
      
      reply.status(201);
      return {
        ...newItem,
        message: 'Inventory item created successfully',
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new AppError('Validation error', 400, error.errors);
      }
      throw error;
    }
  });
  
  // Update inventory item
  fastify.put('/items/:id', {
    preHandler: hasPermissions(['manage_inventory']),
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
      },
      body: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          description: { type: 'string' },
          category: { type: 'string' },
          status: { type: 'string', enum: ['IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK', 'DISCONTINUED'] },
          minQuantity: { type: 'number' },
          maxQuantity: { type: 'number' },
          reorderPoint: { type: 'number' },
          unitCost: { type: 'number' },
          currency: { type: 'string' },
          location: { type: 'object' },
          specifications: { type: 'object' },
          dimensions: { type: 'object' },
          supplierId: { type: 'string', format: 'uuid' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            message: { type: 'string' },
          },
        },
      },
    },
  }, async (request: any, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const itemData = createItemSchema.partial().parse(request.body);
      
      // Check if item exists
      const existingItem = await db.select({ id: inventoryItems.id }).from(inventoryItems).where(eq(inventoryItems.id, id)).limit(1);
      
      if (!existingItem.length) {
        throw new AppError('Inventory item not found', 404);
      }
      
      // Update item
      await db.update(inventoryItems).set({
        ...itemData,
        updatedBy: request.user.id,
        updatedAt: new Date().toISOString(),
      }).where(eq(inventoryItems.id, id));
      
      return {
        id,
        message: 'Inventory item updated successfully',
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new AppError('Validation error', 400, error.errors);
      }
      throw error;
    }
  });
  
  // Create inventory movement
  fastify.post('/movements', {
    preHandler: hasPermissions(['manage_inventory']),
    schema: {
      body: {
        type: 'object',
        required: ['type', 'referenceNumber', 'itemId', 'quantity'],
        properties: {
          type: { type: 'string', enum: ['RECEIPT', 'ISSUE', 'RETURN', 'ADJUSTMENT', 'TRANSFER'] },
          referenceNumber: { type: 'string' },
          itemId: { type: 'string', format: 'uuid' },
          quantity: { type: 'number' },
          fromLocation: { type: 'object' },
          toLocation: { type: 'object' },
          notes: { type: 'string' },
        },
      },
      response: {
        201: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            message: { type: 'string' },
          },
        },
      },
    },
  }, async (request: any, reply: FastifyReply) => {
    try {
      const movementData = createMovementSchema.parse(request.body);
      
      // Check if item exists
      const existingItem = await db.select({ id: inventoryItems.id, currentQuantity: inventoryItems.currentQuantity }).from(inventoryItems).where(eq(inventoryItems.id, movementData.itemId)).limit(1);
      
      if (!existingItem.length) {
        throw new AppError('Inventory item not found', 404);
      }
      
      // Create movement
      const [newMovement] = await db.insert(inventoryMovements).values({
        ...movementData,
        status: 'PENDING',
        createdBy: request.user.id,
      }).returning({ id: inventoryMovements.id });
      
      reply.status(201);
      return {
        ...newMovement,
        message: 'Inventory movement created successfully',
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new AppError('Validation error', 400, error.errors);
      }
      throw error;
    }
  });
  
  // Create inventory adjustment
  fastify.post('/adjustments', {
    preHandler: hasPermissions(['manage_inventory']),
    schema: {
      body: {
        type: 'object',
        required: ['itemId', 'type', 'quantity', 'reason'],
        properties: {
          itemId: { type: 'string', format: 'uuid' },
          type: { type: 'string', enum: ['INCREASE', 'DECREASE'] },
          quantity: { type: 'number' },
          reason: { type: 'string' },
          notes: { type: 'string' },
        },
      },
      response: {
        201: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            adjustmentNumber: { type: 'string' },
            message: { type: 'string' },
          },
        },
      },
    },
  }, async (request: any, reply: FastifyReply) => {
    try {
      const adjustmentData = createAdjustmentSchema.parse(request.body);
      
      // Check if item exists
      const existingItem = await db.select({ id: inventoryItems.id }).from(inventoryItems).where(eq(inventoryItems.id, adjustmentData.itemId)).limit(1);
      
      if (!existingItem.length) {
        throw new AppError('Inventory item not found', 404);
      }
      
      // Generate adjustment number
      const adjustmentNumber = `ADJ-${Date.now().toString().substring(0, 10)}`;
      
      // Create adjustment
      const [newAdjustment] = await db.insert(inventoryAdjustments).values({
        ...adjustmentData,
        adjustmentNumber,
        status: 'PENDING',
        createdBy: request.user.id,
      }).returning({ id: inventoryAdjustments.id, adjustmentNumber: inventoryAdjustments.adjustmentNumber });
      
      reply.status(201);
      return {
        ...newAdjustment,
        message: 'Inventory adjustment created successfully',
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new AppError('Validation error', 400, error.errors);
      }
      throw error;
    }
  });
  
  // Approve inventory adjustment
  fastify.put('/adjustments/:id/approve', {
    preHandler: hasPermissions(['manage_inventory']),
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            message: { type: 'string' },
          },
        },
      },
    },
  }, async (request: any, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    
    // Check if adjustment exists
    const adjustment = await db.select().from(inventoryAdjustments).where(eq(inventoryAdjustments.id, id)).limit(1);
    
    if (!adjustment.length) {
      throw new AppError('Adjustment not found', 404);
    }
    
    if (adjustment[0].status !== 'PENDING') {
      throw new AppError('Adjustment is not in pending status', 400);
    }
    
    // Start a transaction
    await db.transaction(async (tx) => {
      // Update adjustment status
      await tx.update(inventoryAdjustments).set({
        status: 'COMPLETED',
        approverId: request.user.id,
        approvedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }).where(eq(inventoryAdjustments.id, id));
      
      // Update inventory quantity
      const item = await tx.select({ id: inventoryItems.id, currentQuantity: inventoryItems.currentQuantity }).from(inventoryItems).where(eq(inventoryItems.id, adjustment[0].itemId)).limit(1);
      
      if (!item.length) {
        throw new AppError('Inventory item not found', 404);
      }
      
      const newQuantity = adjustment[0].type === 'INCREASE'
        ? item[0].currentQuantity + adjustment[0].quantity
        : item[0].currentQuantity - adjustment[0].quantity;
      
      if (newQuantity < 0) {
        throw new AppError('Adjustment would result in negative inventory', 400);
      }
      
      await tx.update(inventoryItems).set({
        currentQuantity: newQuantity,
        updatedBy: request.user.id,
        updatedAt: new Date().toISOString(),
      }).where(eq(inventoryItems.id, adjustment[0].itemId));
    });
    
    return {
      id,
      message: 'Adjustment approved and inventory updated successfully',
    };
  });
}