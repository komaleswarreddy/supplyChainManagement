import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { db } from '../db';
import { requisitions, requisitionItems, purchaseOrders, purchaseOrderItems } from '../db/schema/procurement';
import { eq } from 'drizzle-orm';
import { AppError } from '../utils/app-error';
import { authenticate, hasPermissions } from '../middleware/auth';

// Define route schemas
const createRequisitionSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  department: z.string().min(1, 'Department is required'),
  costCenter: z.string().min(1, 'Cost Center is required'),
  projectCode: z.string().optional(),
  budgetCode: z.string().optional(),
  budgetYear: z.number().int().min(2024, 'Budget year must be 2024 or later'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  category: z.enum(['OFFICE_SUPPLIES', 'IT_EQUIPMENT', 'SOFTWARE_LICENSES', 'PROFESSIONAL_SERVICES', 'MAINTENANCE', 'TRAVEL', 'TRAINING', 'MARKETING', 'OTHER']),
  currency: z.string().min(1, 'Currency is required'),
  businessPurpose: z.string().min(1, 'Business purpose is required'),
  justification: z.string().optional(),
  procurementType: z.enum(['GOODS', 'SERVICES', 'WORKS']),
  procurementMethod: z.enum(['RFQ', 'TENDER', 'DIRECT', 'FRAMEWORK']),
  contractReference: z.string().optional(),
  paymentTerms: z.string().optional(),
  requiredByDate: z.string().datetime(),
  deliveryLocation: z.object({
    name: z.string().min(1, 'Location name is required'),
    address: z.string().min(1, 'Address is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().optional(),
    country: z.string().min(1, 'Country is required'),
    postalCode: z.string().min(1, 'Postal code is required'),
    contactPerson: z.string().min(1, 'Contact person is required'),
    contactNumber: z.string().min(1, 'Contact number is required'),
  }),
  items: z.array(z.object({
    itemCode: z.string().min(1, 'Item code is required'),
    description: z.string().min(1, 'Description is required'),
    quantity: z.number().int().min(1, 'Quantity must be greater than 0'),
    unitOfMeasure: z.string().min(1, 'Unit of measure is required'),
    unitPrice: z.number().min(0, 'Unit price must be greater than or equal to 0'),
    currency: z.string().min(1, 'Currency is required'),
    requestedDeliveryDate: z.string().datetime(),
    category: z.enum(['OFFICE_SUPPLIES', 'IT_EQUIPMENT', 'SOFTWARE_LICENSES', 'PROFESSIONAL_SERVICES', 'MAINTENANCE', 'TRAVEL', 'TRAINING', 'MARKETING', 'OTHER']),
    manufacturer: z.string().optional(),
    partNumber: z.string().optional(),
    preferredSupplier: z.string().optional(),
    alternativeSuppliers: z.array(z.string()).optional(),
    warrantyRequired: z.boolean(),
    warrantyDuration: z.string().optional(),
    technicalSpecifications: z.string().optional(),
    qualityRequirements: z.string().optional(),
    hsCode: z.string().optional(),
    budgetCode: z.string().optional(),
    notes: z.string().optional(),
  })).min(1, 'At least one item is required'),
  totalAmount: z.number().min(0),
});

// Procurement routes
export default async function procurementRoutes(fastify: FastifyInstance) {
  // Apply authentication middleware to all routes
  fastify.addHook('preHandler', authenticate);
  
  // Get all requisitions
  fastify.get('/requisitions', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'number', default: 1 },
          pageSize: { type: 'number', default: 10 },
          status: { type: 'string', enum: ['DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'] },
          department: { type: 'string' },
          requestor: { type: 'string' },
          costCenter: { type: 'string' },
          minAmount: { type: 'number' },
          maxAmount: { type: 'number' },
          priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] },
          category: { type: 'string' },
          budgetYear: { type: 'number' },
          procurementType: { type: 'string', enum: ['GOODS', 'SERVICES', 'WORKS'] },
          procurementMethod: { type: 'string', enum: ['RFQ', 'TENDER', 'DIRECT', 'FRAMEWORK'] },
          approver: { type: 'string' },
          projectCode: { type: 'string' },
          budgetCode: { type: 'string' },
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
                  requisitionNumber: { type: 'string' },
                  title: { type: 'string' },
                  status: { type: 'string' },
                  requestorId: { type: 'string' },
                  department: { type: 'string' },
                  totalAmount: { type: 'number' },
                  currency: { type: 'string' },
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
    const { page = 1, pageSize = 10, status, department, requestor, costCenter, minAmount, maxAmount, priority, category, budgetYear, procurementType, procurementMethod, approver, projectCode, budgetCode } = request.query as any;
    
    // Build query
    let query = db.select().from(requisitions);
    
    // Apply filters
    if (status) {
      query = query.where(eq(requisitions.status, status));
    }
    
    // Add more complex filtering for other parameters
    if (search) {
      conditions.push(
        or(
          like(purchaseRequisitions.title, `%${search}%`),
          like(purchaseRequisitions.description, `%${search}%`),
          like(purchaseRequisitions.requisitionNumber, `%${search}%`)
        )
      );
    }
    
    if (status) {
      conditions.push(eq(purchaseRequisitions.status, status));
    }
    
    if (priority) {
      conditions.push(eq(purchaseRequisitions.priority, priority));
    }
    
    if (department) {
      conditions.push(eq(purchaseRequisitions.department, department));
    }
    
    if (requestedBy) {
      conditions.push(eq(purchaseRequisitions.requestedBy, requestedBy));
    }
    
    // Get total count for pagination
    const totalQuery = db.select({ count: db.fn.count() }).from(requisitions);
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
  
  // Get requisition by ID
  fastify.get('/requisitions/:id', {
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
            requisitionNumber: { type: 'string' },
            title: { type: 'string' },
            description: { type: 'string' },
            status: { type: 'string' },
            requestorId: { type: 'string' },
            department: { type: 'string' },
            costCenter: { type: 'string' },
            totalAmount: { type: 'number' },
            currency: { type: 'string' },
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  itemCode: { type: 'string' },
                  description: { type: 'string' },
                  quantity: { type: 'number' },
                  unitPrice: { type: 'number' },
                  currency: { type: 'string' },
                },
              },
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    
    // Get requisition
    const requisition = await db.select().from(requisitions).where(eq(requisitions.id, id)).limit(1);
    
    if (!requisition.length) {
      throw new AppError('Requisition not found', 404);
    }
    
    // Get requisition items
    const items = await db.select().from(requisitionItems).where(eq(requisitionItems.requisitionId, id));
    
    return {
      ...requisition[0],
      items,
    };
  });
  
  // Create requisition
  fastify.post('/requisitions', {
    preHandler: hasPermissions(['create_requisition']),
    schema: {
      body: {
        type: 'object',
        required: ['title', 'department', 'costCenter', 'priority', 'category', 'currency', 'businessPurpose', 'procurementType', 'procurementMethod', 'requiredByDate', 'deliveryLocation', 'items', 'totalAmount'],
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          department: { type: 'string' },
          costCenter: { type: 'string' },
          projectCode: { type: 'string' },
          budgetCode: { type: 'string' },
          budgetYear: { type: 'number' },
          priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] },
          category: { type: 'string' },
          currency: { type: 'string' },
          businessPurpose: { type: 'string' },
          justification: { type: 'string' },
          procurementType: { type: 'string', enum: ['GOODS', 'SERVICES', 'WORKS'] },
          procurementMethod: { type: 'string', enum: ['RFQ', 'TENDER', 'DIRECT', 'FRAMEWORK'] },
          contractReference: { type: 'string' },
          paymentTerms: { type: 'string' },
          requiredByDate: { type: 'string', format: 'date-time' },
          deliveryLocation: { type: 'object' },
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                itemCode: { type: 'string' },
                description: { type: 'string' },
                quantity: { type: 'number' },
                unitOfMeasure: { type: 'string' },
                unitPrice: { type: 'number' },
                currency: { type: 'string' },
                requestedDeliveryDate: { type: 'string', format: 'date-time' },
                category: { type: 'string' },
                manufacturer: { type: 'string' },
                partNumber: { type: 'string' },
                preferredSupplier: { type: 'string' },
                alternativeSuppliers: { type: 'array', items: { type: 'string' } },
                warrantyRequired: { type: 'boolean' },
                warrantyDuration: { type: 'string' },
                technicalSpecifications: { type: 'string' },
                qualityRequirements: { type: 'string' },
                hsCode: { type: 'string' },
                budgetCode: { type: 'string' },
                notes: { type: 'string' },
              },
            },
          },
          totalAmount: { type: 'number' },
        },
      },
      response: {
        201: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            requisitionNumber: { type: 'string' },
            message: { type: 'string' },
          },
        },
      },
    },
  }, async (request: any, reply: FastifyReply) => {
    try {
      const requisitionData = createRequisitionSchema.parse(request.body);
      
      // Generate requisition number
      const requisitionNumber = `REQ-${new Date().getFullYear()}-${String(Date.now()).substring(7, 10)}`;
      
      // Start a transaction
      const result = await db.transaction(async (tx) => {
        // Create requisition
        const [newRequisition] = await tx.insert(requisitions).values({
          requisitionNumber,
          ...requisitionData,
          requestorId: request.user.id,
          status: 'DRAFT',
          budgetStatus: 'WITHIN_BUDGET', // This would be calculated based on budget checks
          createdBy: request.user.id,
        }).returning({ id: requisitions.id, requisitionNumber: requisitions.requisitionNumber });
        
        // Create requisition items
        const itemsToInsert = requisitionData.items.map(item => ({
          requisitionId: newRequisition.id,
          ...item,
        }));
        
        await tx.insert(requisitionItems).values(itemsToInsert);
        
        return newRequisition;
      });
      
      reply.status(201);
      return {
        ...result,
        message: 'Requisition created successfully',
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new AppError('Validation error', 400, error.errors);
      }
      throw error;
    }
  });
  
  // Submit requisition for approval
  fastify.post('/requisitions/:id/submit', {
    preHandler: hasPermissions(['create_requisition']),
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
    
    // Check if requisition exists
    const requisition = await db.select().from(requisitions).where(eq(requisitions.id, id)).limit(1);
    
    if (!requisition.length) {
      throw new AppError('Requisition not found', 404);
    }
    
    if (requisition[0].status !== 'DRAFT') {
      throw new AppError('Requisition is not in draft status', 400);
    }
    
    // Update requisition status
    await db.update(requisitions).set({
      status: 'PENDING',
      submittedAt: new Date().toISOString(),
      updatedBy: request.user.id,
      updatedAt: new Date().toISOString(),
    }).where(eq(requisitions.id, id));
    
    return {
      id,
      message: 'Requisition submitted for approval successfully',
    };
  });
  
  // Approve requisition
  fastify.post('/requisitions/:id/approve', {
    preHandler: hasPermissions(['approve_requisition']),
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
          comment: { type: 'string' },
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
    const { comment } = request.body as { comment?: string };
    
    // Check if requisition exists
    const requisition = await db.select().from(requisitions).where(eq(requisitions.id, id)).limit(1);
    
    if (!requisition.length) {
      throw new AppError('Requisition not found', 404);
    }
    
    if (requisition[0].status !== 'PENDING') {
      throw new AppError('Requisition is not in pending status', 400);
    }
    
    // Update requisition status
    await db.update(requisitions).set({
      status: 'APPROVED',
      approvedAt: new Date().toISOString(),
      approverId: request.user.id,
      updatedBy: request.user.id,
      updatedAt: new Date().toISOString(),
    }).where(eq(requisitions.id, id));
    
    return {
      id,
      message: 'Requisition approved successfully',
    };
  });
  
  // Reject requisition
  fastify.post('/requisitions/:id/reject', {
    preHandler: hasPermissions(['approve_requisition']),
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
        required: ['comment'],
        properties: {
          comment: { type: 'string' },
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
    const { comment } = request.body as { comment: string };
    
    // Check if requisition exists
    const requisition = await db.select().from(requisitions).where(eq(requisitions.id, id)).limit(1);
    
    if (!requisition.length) {
      throw new AppError('Requisition not found', 404);
    }
    
    if (requisition[0].status !== 'PENDING') {
      throw new AppError('Requisition is not in pending status', 400);
    }
    
    // Update requisition status
    await db.update(requisitions).set({
      status: 'REJECTED',
      updatedBy: request.user.id,
      updatedAt: new Date().toISOString(),
    }).where(eq(requisitions.id, id));
    
    return {
      id,
      message: 'Requisition rejected successfully',
    };
  });
  
  // Get all purchase orders
  fastify.get('/purchase-orders', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'number', default: 1 },
          pageSize: { type: 'number', default: 10 },
          status: { type: 'string' },
          supplier: { type: 'string' },
          dateRange: { type: 'object' },
          minAmount: { type: 'number' },
          maxAmount: { type: 'number' },
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
                  poNumber: { type: 'string' },
                  type: { type: 'string' },
                  status: { type: 'string' },
                  supplierId: { type: 'string' },
                  orderDate: { type: 'string', format: 'date-time' },
                  totalAmount: { type: 'number' },
                  currency: { type: 'string' },
                  deliveryStatus: { type: 'string' },
                  paymentStatus: { type: 'string' },
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
    const { page = 1, pageSize = 10, status, supplier } = request.query as any;
    
    // Build query
    let query = db.select().from(purchaseOrders);
    
    // Apply filters
    if (status) {
      query = query.where(eq(purchaseOrders.status, status));
    }
    
    // Add more complex filtering for supplier, date range, amount, etc.
    if (search) {
      conditions.push(
        or(
          like(purchaseOrders.poNumber, `%${search}%`),
          like(purchaseOrders.title, `%${search}%`),
          like(purchaseOrders.description, `%${search}%`)
        )
      );
    }
    
    if (supplier) {
      conditions.push(eq(purchaseOrders.supplierId, supplier));
    }
    
    if (status) {
      conditions.push(eq(purchaseOrders.status, status));
    }
    
    if (dateFrom) {
      conditions.push(sql`${purchaseOrders.createdAt} >= ${new Date(dateFrom)}`);
    }
    
    if (dateTo) {
      conditions.push(sql`${purchaseOrders.createdAt} <= ${new Date(dateTo)}`);
    }
    
    if (minAmount) {
      conditions.push(sql`${purchaseOrders.totalAmount} >= ${minAmount}`);
    }
    
    if (maxAmount) {
      conditions.push(sql`${purchaseOrders.totalAmount} <= ${maxAmount}`);
    }
    
    // Get total count for pagination
    const totalQuery = db.select({ count: db.fn.count() }).from(purchaseOrders);
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
  
  // Get purchase order by ID
  fastify.get('/purchase-orders/:id', {
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
            poNumber: { type: 'string' },
            type: { type: 'string' },
            status: { type: 'string' },
            supplierId: { type: 'string' },
            orderDate: { type: 'string', format: 'date-time' },
            requiredByDate: { type: 'string', format: 'date-time' },
            currency: { type: 'string' },
            subtotal: { type: 'number' },
            taxTotal: { type: 'number' },
            shippingCost: { type: 'number' },
            otherCharges: { type: 'number' },
            totalAmount: { type: 'number' },
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  lineNumber: { type: 'number' },
                  itemCode: { type: 'string' },
                  description: { type: 'string' },
                  quantity: { type: 'number' },
                  unitPrice: { type: 'number' },
                  totalAmount: { type: 'number' },
                },
              },
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    
    // Get purchase order
    const po = await db.select().from(purchaseOrders).where(eq(purchaseOrders.id, id)).limit(1);
    
    if (!po.length) {
      throw new AppError('Purchase order not found', 404);
    }
    
    // Get purchase order items
    const items = await db.select().from(purchaseOrderItems).where(eq(purchaseOrderItems.purchaseOrderId, id));
    
    return {
      ...po[0],
      items,
    };
  });
}