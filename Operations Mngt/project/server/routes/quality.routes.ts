import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { db } from '../db';
import { 
  qualityControlPlans, 
  inspections, 
  inspectionResults, 
  nonConformances, 
  correctiveActions,
  qualityStandards,
  qualityMetrics,
  qualityAudits
} from '../db/schema/quality';
import { eq, and, gte, lte, like } from 'drizzle-orm';
import { AppError } from '../utils/app-error';
import { authenticate, hasPermissions } from '../middleware/auth';

// Define route schemas
const createQualityControlPlanSchema = z.object({
  planName: z.string().min(1, 'Plan name is required'),
  description: z.string().optional(),
  planType: z.enum(['INCOMING', 'IN_PROCESS', 'FINAL']),
  inspectionCriteria: z.array(z.object({
    id: z.string(),
    name: z.string(),
    type: z.enum(['VISUAL', 'MEASUREMENT', 'FUNCTIONAL', 'DOCUMENTATION']),
    description: z.string(),
    expectedValue: z.string().optional(),
    tolerance: z.string().optional(),
    severity: z.enum(['CRITICAL', 'MAJOR', 'MINOR']),
    required: z.boolean(),
  })),
  samplingPlan: z.object({
    type: z.enum(['AQL', 'RQL', 'CUSTOM']),
    sampleSize: z.number().int().min(1),
    acceptanceNumber: z.number().int().min(0),
    rejectionNumber: z.number().int().min(0),
    lotSize: z.number().int().min(1),
  }),
  acceptanceCriteria: z.object({
    defectRate: z.number().min(0),
    firstPassYield: z.number().min(0).max(100),
    customerComplaints: z.number().min(0),
  }),
  applicableItems: z.array(z.string()).optional(),
  applicableSuppliers: z.array(z.string()).optional(),
  qualityStandards: z.array(z.string()).optional(),
  regulatoryRequirements: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

const createInspectionSchema = z.object({
  inspectionNumber: z.string().min(1, 'Inspection number is required'),
  planId: z.string().uuid().optional(),
  itemId: z.string().uuid().optional(),
  supplierId: z.string().uuid().optional(),
  inspectionType: z.enum(['INCOMING', 'IN_PROCESS', 'FINAL', 'ROUTINE', 'SPECIAL']),
  inspectorId: z.string().uuid(),
  scheduledDate: z.string().datetime().optional(),
  sampleSize: z.number().int().min(1).optional(),
  notes: z.string().optional(),
});

const createNonConformanceSchema = z.object({
  ncNumber: z.string().min(1, 'NC number is required'),
  inspectionId: z.string().uuid().optional(),
  itemId: z.string().uuid().optional(),
  supplierId: z.string().uuid().optional(),
  type: z.enum(['SUPPLIER', 'INTERNAL', 'CUSTOMER']),
  category: z.enum(['QUALITY', 'SAFETY', 'REGULATORY', 'DOCUMENTATION']),
  severity: z.enum(['CRITICAL', 'MAJOR', 'MINOR']),
  description: z.string().min(1, 'Description is required'),
  rootCause: z.string().optional(),
  impact: z.string().optional(),
  quantityAffected: z.number().int().min(0).optional(),
  costImpact: z.number().min(0).optional(),
  assignedTo: z.string().uuid().optional(),
  dueDate: z.string().datetime().optional(),
  notes: z.string().optional(),
});

// Quality Management routes
export default async function qualityRoutes(fastify: FastifyInstance) {
  // Apply authentication middleware to all routes
  fastify.addHook('preHandler', authenticate);
  
  // Get all quality control plans
  fastify.get('/quality-control-plans', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'number', default: 1 },
          pageSize: { type: 'number', default: 10 },
          planType: { type: 'string', enum: ['INCOMING', 'IN_PROCESS', 'FINAL'] },
          status: { type: 'string', enum: ['ACTIVE', 'INACTIVE', 'DRAFT'] },
          createdBy: { type: 'string' },
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
                  planName: { type: 'string' },
                  planType: { type: 'string' },
                  status: { type: 'string' },
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
    const { page = 1, pageSize = 10, planType, status, createdBy } = request.query as any;
    
    // Build query
    let query = db.select().from(qualityControlPlans);
    
    // Apply filters
    if (planType) {
      query = query.where(eq(qualityControlPlans.planType, planType));
    }
    if (status) {
      query = query.where(eq(qualityControlPlans.status, status));
    }
    
    // Get total count for pagination
    const totalQuery = db.select({ count: db.fn.count() }).from(qualityControlPlans);
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
  
  // Get quality control plan by ID
  fastify.get('/quality-control-plans/:id', {
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    
    const plan = await db.select().from(qualityControlPlans).where(eq(qualityControlPlans.id, id)).limit(1);
    
    if (!plan.length) {
      throw new AppError('Quality control plan not found', 404);
    }
    
    return plan[0];
  });
  
  // Create quality control plan
  fastify.post('/quality-control-plans', {
    preHandler: hasPermissions(['create_quality_plan']),
    schema: {
      body: {
        type: 'object',
        required: ['planName', 'planType', 'inspectionCriteria', 'samplingPlan', 'acceptanceCriteria'],
        properties: {
          planName: { type: 'string' },
          description: { type: 'string' },
          planType: { type: 'string', enum: ['INCOMING', 'IN_PROCESS', 'FINAL'] },
          inspectionCriteria: { type: 'array' },
          samplingPlan: { type: 'object' },
          acceptanceCriteria: { type: 'object' },
          applicableItems: { type: 'array' },
          applicableSuppliers: { type: 'array' },
          qualityStandards: { type: 'array' },
          regulatoryRequirements: { type: 'array' },
          notes: { type: 'string' },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const data = createQualityControlPlanSchema.parse(request.body);
    const user = request.user as any;
    
    const [plan] = await db.insert(qualityControlPlans).values({
      ...data,
      tenantId: user.tenantId,
      createdBy: user.id,
    }).returning();
    
    return plan;
  });
  
  // Get all inspections
  fastify.get('/inspections', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'number', default: 1 },
          pageSize: { type: 'number', default: 10 },
          inspectionType: { type: 'string', enum: ['INCOMING', 'IN_PROCESS', 'FINAL', 'ROUTINE', 'SPECIAL'] },
          status: { type: 'string', enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] },
          result: { type: 'string', enum: ['PASS', 'FAIL', 'CONDITIONAL'] },
          inspectorId: { type: 'string' },
          supplierId: { type: 'string' },
          itemId: { type: 'string' },
          startDate: { type: 'string', format: 'date-time' },
          endDate: { type: 'string', format: 'date-time' },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { 
      page = 1, 
      pageSize = 10, 
      inspectionType, 
      status, 
      result, 
      inspectorId, 
      supplierId, 
      itemId,
      startDate,
      endDate
    } = request.query as any;
    
    // Build query
    let query = db.select().from(inspections);
    
    // Apply filters
    if (inspectionType) {
      query = query.where(eq(inspections.inspectionType, inspectionType));
    }
    if (status) {
      query = query.where(eq(inspections.status, status));
    }
    if (result) {
      query = query.where(eq(inspections.result, result));
    }
    if (inspectorId) {
      query = query.where(eq(inspections.inspectorId, inspectorId));
    }
    if (supplierId) {
      query = query.where(eq(inspections.supplierId, supplierId));
    }
    if (itemId) {
      query = query.where(eq(inspections.itemId, itemId));
    }
    if (startDate) {
      query = query.where(gte(inspections.createdAt, startDate));
    }
    if (endDate) {
      query = query.where(lte(inspections.createdAt, endDate));
    }
    
    // Get total count for pagination
    const totalQuery = db.select({ count: db.fn.count() }).from(inspections);
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
  
  // Get inspection by ID
  fastify.get('/inspections/:id', {
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    
    const inspection = await db.select().from(inspections).where(eq(inspections.id, id)).limit(1);
    
    if (!inspection.length) {
      throw new AppError('Inspection not found', 404);
    }
    
    // Get inspection results
    const results = await db.select().from(inspectionResults).where(eq(inspectionResults.inspectionId, id));
    
    return {
      ...inspection[0],
      results,
    };
  });
  
  // Create inspection
  fastify.post('/inspections', {
    preHandler: hasPermissions(['create_inspection']),
    schema: {
      body: {
        type: 'object',
        required: ['inspectionNumber', 'inspectionType', 'inspectorId'],
        properties: {
          inspectionNumber: { type: 'string' },
          planId: { type: 'string', format: 'uuid' },
          itemId: { type: 'string', format: 'uuid' },
          supplierId: { type: 'string', format: 'uuid' },
          inspectionType: { type: 'string', enum: ['INCOMING', 'IN_PROCESS', 'FINAL', 'ROUTINE', 'SPECIAL'] },
          inspectorId: { type: 'string', format: 'uuid' },
          scheduledDate: { type: 'string', format: 'date-time' },
          sampleSize: { type: 'number' },
          notes: { type: 'string' },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const data = createInspectionSchema.parse(request.body);
    const user = request.user as any;
    
    const [inspection] = await db.insert(inspections).values({
      ...data,
      tenantId: user.tenantId,
      createdBy: user.id,
    }).returning();
    
    return inspection;
  });
  
  // Update inspection status
  fastify.patch('/inspections/:id/status', {
    preHandler: hasPermissions(['update_inspection']),
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
        required: ['status'],
        properties: {
          status: { type: 'string', enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] },
          result: { type: 'string', enum: ['PASS', 'FAIL', 'CONDITIONAL'] },
          defectsFound: { type: 'number' },
          notes: { type: 'string' },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const { status, result, defectsFound, notes } = request.body as any;
    const user = request.user as any;
    
    const updateData: any = { 
      status, 
      updatedBy: user.id,
      updatedAt: new Date(),
    };
    
    if (status === 'IN_PROGRESS') {
      updateData.startedAt = new Date();
    }
    
    if (status === 'COMPLETED') {
      updateData.completedAt = new Date();
      if (result) updateData.result = result;
      if (defectsFound !== undefined) updateData.defectsFound = defectsFound;
    }
    
    if (notes) updateData.notes = notes;
    
    const [inspection] = await db.update(inspections)
      .set(updateData)
      .where(eq(inspections.id, id))
      .returning();
    
    if (!inspection) {
      throw new AppError('Inspection not found', 404);
    }
    
    return inspection;
  });
  
  // Get all non-conformances
  fastify.get('/non-conformances', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'number', default: 1 },
          pageSize: { type: 'number', default: 10 },
          type: { type: 'string', enum: ['SUPPLIER', 'INTERNAL', 'CUSTOMER'] },
          category: { type: 'string', enum: ['QUALITY', 'SAFETY', 'REGULATORY', 'DOCUMENTATION'] },
          severity: { type: 'string', enum: ['CRITICAL', 'MAJOR', 'MINOR'] },
          status: { type: 'string', enum: ['OPEN', 'IN_PROGRESS', 'CLOSED', 'CANCELLED'] },
          assignedTo: { type: 'string' },
          supplierId: { type: 'string' },
          itemId: { type: 'string' },
          startDate: { type: 'string', format: 'date-time' },
          endDate: { type: 'string', format: 'date-time' },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { 
      page = 1, 
      pageSize = 10, 
      type, 
      category, 
      severity, 
      status, 
      assignedTo, 
      supplierId, 
      itemId,
      startDate,
      endDate
    } = request.query as any;
    
    // Build query
    let query = db.select().from(nonConformances);
    
    // Apply filters
    if (type) {
      query = query.where(eq(nonConformances.type, type));
    }
    if (category) {
      query = query.where(eq(nonConformances.category, category));
    }
    if (severity) {
      query = query.where(eq(nonConformances.severity, severity));
    }
    if (status) {
      query = query.where(eq(nonConformances.status, status));
    }
    if (assignedTo) {
      query = query.where(eq(nonConformances.assignedTo, assignedTo));
    }
    if (supplierId) {
      query = query.where(eq(nonConformances.supplierId, supplierId));
    }
    if (itemId) {
      query = query.where(eq(nonConformances.itemId, itemId));
    }
    if (startDate) {
      query = query.where(gte(nonConformances.createdAt, startDate));
    }
    if (endDate) {
      query = query.where(lte(nonConformances.createdAt, endDate));
    }
    
    // Get total count for pagination
    const totalQuery = db.select({ count: db.fn.count() }).from(nonConformances);
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
  
  // Create non-conformance
  fastify.post('/non-conformances', {
    preHandler: hasPermissions(['create_non_conformance']),
    schema: {
      body: {
        type: 'object',
        required: ['ncNumber', 'type', 'category', 'severity', 'description'],
        properties: {
          ncNumber: { type: 'string' },
          inspectionId: { type: 'string', format: 'uuid' },
          itemId: { type: 'string', format: 'uuid' },
          supplierId: { type: 'string', format: 'uuid' },
          type: { type: 'string', enum: ['SUPPLIER', 'INTERNAL', 'CUSTOMER'] },
          category: { type: 'string', enum: ['QUALITY', 'SAFETY', 'REGULATORY', 'DOCUMENTATION'] },
          severity: { type: 'string', enum: ['CRITICAL', 'MAJOR', 'MINOR'] },
          description: { type: 'string' },
          rootCause: { type: 'string' },
          impact: { type: 'string' },
          quantityAffected: { type: 'number' },
          costImpact: { type: 'number' },
          assignedTo: { type: 'string', format: 'uuid' },
          dueDate: { type: 'string', format: 'date-time' },
          notes: { type: 'string' },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const data = createNonConformanceSchema.parse(request.body);
    const user = request.user as any;
    
    const [nonConformance] = await db.insert(nonConformances).values({
      ...data,
      tenantId: user.tenantId,
      createdBy: user.id,
    }).returning();
    
    return nonConformance;
  });
  
  // Get quality metrics
  fastify.get('/quality-metrics', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          metricType: { type: 'string', enum: ['DEFECT_RATE', 'FIRST_PASS_YIELD', 'CUSTOMER_COMPLAINTS'] },
          period: { type: 'string', enum: ['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY'] },
          itemId: { type: 'string' },
          supplierId: { type: 'string' },
          location: { type: 'string' },
          startDate: { type: 'string', format: 'date-time' },
          endDate: { type: 'string', format: 'date-time' },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { 
      metricType, 
      period, 
      itemId, 
      supplierId, 
      location,
      startDate,
      endDate
    } = request.query as any;
    
    // Build query
    let query = db.select().from(qualityMetrics);
    
    // Apply filters
    if (metricType) {
      query = query.where(eq(qualityMetrics.metricType, metricType));
    }
    if (period) {
      query = query.where(eq(qualityMetrics.period, period));
    }
    if (itemId) {
      query = query.where(eq(qualityMetrics.itemId, itemId));
    }
    if (supplierId) {
      query = query.where(eq(qualityMetrics.supplierId, supplierId));
    }
    if (location) {
      query = query.where(eq(qualityMetrics.location, location));
    }
    if (startDate) {
      query = query.where(gte(qualityMetrics.periodStart, startDate));
    }
    if (endDate) {
      query = query.where(lte(qualityMetrics.periodEnd, endDate));
    }
    
    const metrics = await query.execute();
    
    return {
      metrics,
    };
  });

  // Create quality metric
  fastify.post('/quality-metrics', {
    preHandler: hasPermissions(['create_quality_metric']),
    schema: {
      body: {
        type: 'object',
        required: ['metricName', 'metricType', 'period', 'periodStart', 'periodEnd', 'actual', 'unit'],
        properties: {
          metricName: { type: 'string' },
          metricType: { type: 'string', enum: ['DEFECT_RATE', 'FIRST_PASS_YIELD', 'CUSTOMER_COMPLAINTS'] },
          period: { type: 'string', enum: ['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY'] },
          periodStart: { type: 'string', format: 'date-time' },
          periodEnd: { type: 'string', format: 'date-time' },
          target: { type: 'number' },
          actual: { type: 'number' },
          unit: { type: 'string', enum: ['PERCENTAGE', 'PPM', 'COUNT'] },
          itemId: { type: 'string' },
          supplierId: { type: 'string' },
          location: { type: 'string' },
          notes: { type: 'string' },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const data = request.body as any;
    const user = request.user as any;
    const [metric] = await db.insert(qualityMetrics).values({
      ...data,
      tenantId: user.tenantId,
      createdBy: user.id,
    }).returning();
    return metric;
  });

  // Update quality metric
  fastify.patch('/quality-metrics/:id', {
    preHandler: hasPermissions(['update_quality_metric']),
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string', format: 'uuid' } },
      },
      body: {
        type: 'object',
        properties: {
          metricName: { type: 'string' },
          metricType: { type: 'string', enum: ['DEFECT_RATE', 'FIRST_PASS_YIELD', 'CUSTOMER_COMPLAINTS'] },
          period: { type: 'string', enum: ['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY'] },
          periodStart: { type: 'string', format: 'date-time' },
          periodEnd: { type: 'string', format: 'date-time' },
          target: { type: 'number' },
          actual: { type: 'number' },
          unit: { type: 'string', enum: ['PERCENTAGE', 'PPM', 'COUNT'] },
          itemId: { type: 'string' },
          supplierId: { type: 'string' },
          location: { type: 'string' },
          notes: { type: 'string' },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const data = request.body as any;
    const [metric] = await db.update(qualityMetrics).set({ ...data, updatedAt: new Date() }).where(eq(qualityMetrics.id, id)).returning();
    if (!metric) throw new AppError('Quality metric not found', 404);
    return metric;
  });

  // Delete quality metric
  fastify.delete('/quality-metrics/:id', {
    preHandler: hasPermissions(['delete_quality_metric']),
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string', format: 'uuid' } },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const [metric] = await db.delete(qualityMetrics).where(eq(qualityMetrics.id, id)).returning();
    if (!metric) throw new AppError('Quality metric not found', 404);
    return { message: 'Quality metric deleted', id };
  });

  // --- Quality Audits CRUD ---
  // Get all quality audits
  fastify.get('/quality-audits', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          auditType: { type: 'string' },
          status: { type: 'string' },
          auditorId: { type: 'string' },
          supplierId: { type: 'string' },
          startDate: { type: 'string', format: 'date-time' },
          endDate: { type: 'string', format: 'date-time' },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { auditType, status, auditorId, supplierId, startDate, endDate } = request.query as any;
    let query = db.select().from(qualityAudits);
    if (auditType) query = query.where(eq(qualityAudits.auditType, auditType));
    if (status) query = query.where(eq(qualityAudits.status, status));
    if (auditorId) query = query.where(eq(qualityAudits.auditorId, auditorId));
    if (supplierId) query = query.where(eq(qualityAudits.supplierId, supplierId));
    if (startDate) query = query.where(gte(qualityAudits.plannedDate, startDate));
    if (endDate) query = query.where(lte(qualityAudits.plannedDate, endDate));
    const audits = await query.execute();
    return { audits };
  });

  // Get quality audit by ID
  fastify.get('/quality-audits/:id', {
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string', format: 'uuid' } },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const audit = await db.select().from(qualityAudits).where(eq(qualityAudits.id, id)).limit(1);
    if (!audit.length) throw new AppError('Quality audit not found', 404);
    return audit[0];
  });

  // Create quality audit
  fastify.post('/quality-audits', {
    preHandler: hasPermissions(['create_quality_audit']),
    schema: {
      body: {
        type: 'object',
        required: ['auditNumber', 'auditType', 'scope', 'status', 'auditorId', 'plannedDate'],
        properties: {
          auditNumber: { type: 'string' },
          auditType: { type: 'string' },
          scope: { type: 'string' },
          status: { type: 'string' },
          auditorId: { type: 'string' },
          auditeeId: { type: 'string' },
          supplierId: { type: 'string' },
          plannedDate: { type: 'string', format: 'date-time' },
          startedAt: { type: 'string', format: 'date-time' },
          completedAt: { type: 'string', format: 'date-time' },
          result: { type: 'string' },
          findings: { type: 'array' },
          recommendations: { type: 'array' },
          followUpRequired: { type: 'boolean' },
          followUpDate: { type: 'string', format: 'date-time' },
          notes: { type: 'string' },
          attachments: { type: 'array' },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const data = request.body as any;
    const user = request.user as any;
    const [audit] = await db.insert(qualityAudits).values({
      ...data,
      tenantId: user.tenantId,
      createdBy: user.id,
    }).returning();
    return audit;
  });

  // Update quality audit
  fastify.patch('/quality-audits/:id', {
    preHandler: hasPermissions(['update_quality_audit']),
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string', format: 'uuid' } },
      },
      body: {
        type: 'object',
        properties: {
          auditNumber: { type: 'string' },
          auditType: { type: 'string' },
          scope: { type: 'string' },
          status: { type: 'string' },
          auditorId: { type: 'string' },
          auditeeId: { type: 'string' },
          supplierId: { type: 'string' },
          plannedDate: { type: 'string', format: 'date-time' },
          startedAt: { type: 'string', format: 'date-time' },
          completedAt: { type: 'string', format: 'date-time' },
          result: { type: 'string' },
          findings: { type: 'array' },
          recommendations: { type: 'array' },
          followUpRequired: { type: 'boolean' },
          followUpDate: { type: 'string', format: 'date-time' },
          notes: { type: 'string' },
          attachments: { type: 'array' },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const data = request.body as any;
    const [audit] = await db.update(qualityAudits).set({ ...data, updatedAt: new Date() }).where(eq(qualityAudits.id, id)).returning();
    if (!audit) throw new AppError('Quality audit not found', 404);
    return audit;
  });

  // Delete quality audit
  fastify.delete('/quality-audits/:id', {
    preHandler: hasPermissions(['delete_quality_audit']),
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string', format: 'uuid' } },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const [audit] = await db.delete(qualityAudits).where(eq(qualityAudits.id, id)).returning();
    if (!audit) throw new AppError('Quality audit not found', 404);
    return { message: 'Quality audit deleted', id };
  });
} 