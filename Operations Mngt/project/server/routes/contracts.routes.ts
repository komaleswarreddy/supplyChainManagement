import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { db } from '../db';
import { 
  contracts, 
  contractParties, 
  contractTerms, 
  contractAmendments,
  contractObligations,
  contractMilestones,
  contractCompliance,
  contractTemplates,
  contractHistory
} from '../db/schema';
import { eq, and, desc, asc, sql } from 'drizzle-orm';
import { authenticateUser } from '../middleware/auth';
import { AppError } from '../utils/app-error';

// Validation schemas
const ContractSchema = z.object({
  contractNumber: z.string().min(1, 'Contract number is required'),
  title: z.string().min(1, 'Contract title is required'),
  description: z.string().optional(),
  type: z.enum(['SUPPLIER', 'CUSTOMER', 'SERVICE', 'LEASE', 'EMPLOYMENT', 'PARTNERSHIP']),
  category: z.string().min(1, 'Contract category is required'),
  status: z.enum(['DRAFT', 'NEGOTIATION', 'PENDING_APPROVAL', 'ACTIVE', 'EXPIRED', 'TERMINATED']).default('DRAFT'),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'CRITICAL']).default('NORMAL'),
  value: z.number().positive().optional(),
  currency: z.string().default('USD'),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  renewalDate: z.string().datetime().optional(),
  autoRenewal: z.boolean().default(false),
  renewalTerms: z.record(z.any()).optional(),
  ownerId: z.string().uuid(),
  approverId: z.string().uuid().optional(),
  counterparty: z.object({
    name: z.string().min(1, 'Counterparty name is required'),
    type: z.enum(['INDIVIDUAL', 'COMPANY', 'GOVERNMENT']),
    contact: z.object({
      name: z.string(),
      email: z.string().email(),
      phone: z.string()
    }),
    address: z.object({
      street: z.string(),
      city: z.string(),
      state: z.string(),
      zipCode: z.string(),
      country: z.string()
    })
  }),
  terms: z.record(z.any()),
  attachments: z.array(z.object({
    name: z.string(),
    url: z.string().url(),
    type: z.string()
  })).optional(),
  riskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('LOW'),
  complianceStatus: z.enum(['COMPLIANT', 'NON_COMPLIANT', 'PENDING_REVIEW']).default('COMPLIANT'),
  notes: z.string().optional()
});

const ContractPartySchema = z.object({
  contractId: z.string().uuid(),
  partyType: z.enum(['PRIMARY', 'COUNTERPARTY', 'THIRD_PARTY', 'GUARANTOR']),
  name: z.string().min(1, 'Party name is required'),
  type: z.enum(['INDIVIDUAL', 'COMPANY', 'GOVERNMENT']),
  contactInfo: z.object({
    name: z.string(),
    email: z.string().email(),
    phone: z.string(),
    title: z.string().optional()
  }),
  address: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string(),
    country: z.string()
  }).optional(),
  taxId: z.string().optional(),
  registrationNumber: z.string().optional(),
  role: z.enum(['BUYER', 'SELLER', 'SERVICE_PROVIDER', 'GUARANTOR']),
  signature: z.object({
    signedBy: z.string(),
    signedAt: z.string().datetime(),
    signatureType: z.enum(['DIGITAL', 'ELECTRONIC', 'PHYSICAL'])
  }).optional()
});

const ContractTermSchema = z.object({
  contractId: z.string().uuid(),
  section: z.string().min(1, 'Section is required'),
  subsection: z.string().optional(),
  title: z.string().min(1, 'Term title is required'),
  content: z.string().min(1, 'Term content is required'),
  type: z.enum(['GENERAL', 'PAYMENT', 'DELIVERY', 'WARRANTY', 'TERMINATION', 'COMPLIANCE']),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'CRITICAL']).default('NORMAL'),
  isRequired: z.boolean().default(true),
  isCompliant: z.boolean().default(true),
  complianceNotes: z.string().optional(),
  effectiveDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  notes: z.string().optional()
});

const ContractAmendmentSchema = z.object({
  contractId: z.string().uuid(),
  amendmentNumber: z.string().min(1, 'Amendment number is required'),
  title: z.string().min(1, 'Amendment title is required'),
  description: z.string().optional(),
  type: z.enum(['EXTENSION', 'MODIFICATION', 'TERMINATION', 'RENEWAL']),
  status: z.enum(['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED']).default('DRAFT'),
  effectiveDate: z.string().datetime(),
  changes: z.record(z.any()),
  reason: z.string().min(1, 'Amendment reason is required'),
  impact: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  approverId: z.string().uuid().optional(),
  attachments: z.array(z.object({
    name: z.string(),
    url: z.string().url(),
    type: z.string()
  })).optional(),
  notes: z.string().optional()
});

const ContractObligationSchema = z.object({
  contractId: z.string().uuid(),
  obligationNumber: z.string().min(1, 'Obligation number is required'),
  title: z.string().min(1, 'Obligation title is required'),
  description: z.string().optional(),
  type: z.enum(['DELIVERY', 'PAYMENT', 'REPORTING', 'COMPLIANCE', 'PERFORMANCE']),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE', 'CANCELLED']).default('PENDING'),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'CRITICAL']).default('NORMAL'),
  dueDate: z.string().datetime(),
  completedDate: z.string().datetime().optional(),
  assignedTo: z.string().uuid().optional(),
  responsibleParty: z.enum(['US', 'COUNTERPARTY', 'BOTH']),
  value: z.number().positive().optional(),
  currency: z.string().default('USD'),
  completionCriteria: z.record(z.any()),
  attachments: z.array(z.object({
    name: z.string(),
    url: z.string().url(),
    type: z.string()
  })).optional(),
  notes: z.string().optional()
});

const ContractMilestoneSchema = z.object({
  contractId: z.string().uuid(),
  milestoneNumber: z.string().min(1, 'Milestone number is required'),
  title: z.string().min(1, 'Milestone title is required'),
  description: z.string().optional(),
  type: z.enum(['DELIVERY', 'PAYMENT', 'REVIEW', 'APPROVAL', 'COMPLETION']),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'DELAYED', 'CANCELLED']).default('PENDING'),
  dueDate: z.string().datetime(),
  completedDate: z.string().datetime().optional(),
  assignedTo: z.string().uuid().optional(),
  completionCriteria: z.record(z.any()),
  deliverables: z.array(z.object({
    name: z.string(),
    description: z.string(),
    status: z.enum(['PENDING', 'COMPLETED', 'OVERDUE'])
  })).optional(),
  attachments: z.array(z.object({
    name: z.string(),
    url: z.string().url(),
    type: z.string()
  })).optional(),
  notes: z.string().optional()
});

export default async function contractRoutes(fastify: FastifyInstance) {
  // Contracts
  fastify.get('/contracts', {
    preHandler: authenticateUser,
    schema: {
      querystring: z.object({
        page: z.string().transform(Number).default('1'),
        limit: z.string().transform(Number).default('10'),
        search: z.string().optional(),
        type: z.enum(['SUPPLIER', 'CUSTOMER', 'SERVICE', 'LEASE', 'EMPLOYMENT', 'PARTNERSHIP']).optional(),
        status: z.enum(['DRAFT', 'NEGOTIATION', 'PENDING_APPROVAL', 'ACTIVE', 'EXPIRED', 'TERMINATED']).optional(),
        priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'CRITICAL']).optional(),
        riskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional()
      })
    }
  }, async (request, reply) => {
    const { user } = request;
    const { page, limit, search, type, status, priority, riskLevel } = request.query as any;
    const offset = (page - 1) * limit;

    let whereClause = eq(contracts.tenantId, user.tenantId);
    const conditions = [whereClause];

    if (search) {
      conditions.push(
        sql`(${contracts.title} ILIKE ${`%${search}%`} OR ${contracts.contractNumber} ILIKE ${`%${search}%`})`
      );
    }

    if (type) {
      conditions.push(eq(contracts.type, type));
    }

    if (status) {
      conditions.push(eq(contracts.status, status));
    }

    if (priority) {
      conditions.push(eq(contracts.priority, priority));
    }

    if (riskLevel) {
      conditions.push(eq(contracts.riskLevel, riskLevel));
    }

    const [contractsList, total] = await Promise.all([
      db.select()
        .from(contracts)
        .where(and(...conditions))
        .orderBy(desc(contracts.createdAt))
        .limit(limit)
        .offset(offset),
      db.select({ count: sql<number>`count(*)` })
        .from(contracts)
        .where(and(...conditions))
        .then(result => result[0]?.count || 0)
    ]);

    return {
      data: contractsList,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  });

  fastify.get('/contracts/:id', {
    preHandler: authenticateUser,
    schema: {
      params: z.object({
        id: z.string().uuid()
      })
    }
  }, async (request, reply) => {
    const { user } = request;
    const { id } = request.params as any;

    const contract = await db.select()
      .from(contracts)
      .where(and(eq(contracts.id, id), eq(contracts.tenantId, user.tenantId)))
      .limit(1);

    if (!contract.length) {
      throw new AppError('Contract not found', 404);
    }

    return contract[0];
  });

  fastify.post('/contracts', {
    preHandler: authenticateUser,
    schema: {
      body: ContractSchema
    }
  }, async (request, reply) => {
    const { user } = request;
    const contractData = request.body as any;

    // Check if contract number already exists
    const existingContract = await db.select()
      .from(contracts)
      .where(and(eq(contracts.contractNumber, contractData.contractNumber), eq(contracts.tenantId, user.tenantId)))
      .limit(1);

    if (existingContract.length) {
      throw new AppError('Contract number already exists', 400);
    }

    const [contract] = await db.insert(contracts)
      .values({
        ...contractData,
        tenantId: user.tenantId,
        createdBy: user.id,
        updatedBy: user.id
      })
      .returning();

    // Log contract creation
    await db.insert(contractHistory)
      .values({
        contractId: contract.id,
        tenantId: user.tenantId,
        action: 'CREATED',
        description: 'Contract created',
        performedBy: user.id
      });

    return contract;
  });

  fastify.put('/contracts/:id', {
    preHandler: authenticateUser,
    schema: {
      params: z.object({
        id: z.string().uuid()
      }),
      body: ContractSchema.partial()
    }
  }, async (request, reply) => {
    const { user } = request;
    const { id } = request.params as any;
    const updateData = request.body as any;

    const [contract] = await db.update(contracts)
      .set({
        ...updateData,
        updatedAt: new Date(),
        updatedBy: user.id
      })
      .where(and(eq(contracts.id, id), eq(contracts.tenantId, user.tenantId)))
      .returning();

    if (!contract) {
      throw new AppError('Contract not found', 404);
    }

    // Log contract update
    await db.insert(contractHistory)
      .values({
        contractId: contract.id,
        tenantId: user.tenantId,
        action: 'UPDATED',
        description: 'Contract updated',
        performedBy: user.id
      });

    return contract;
  });

  fastify.put('/contracts/:id/approve', {
    preHandler: authenticateUser,
    schema: {
      params: z.object({
        id: z.string().uuid()
      })
    }
  }, async (request, reply) => {
    const { user } = request;
    const { id } = request.params as any;

    const [contract] = await db.update(contracts)
      .set({
        status: 'ACTIVE',
        approverId: user.id,
        approvedAt: new Date(),
        updatedAt: new Date(),
        updatedBy: user.id
      })
      .where(and(eq(contracts.id, id), eq(contracts.tenantId, user.tenantId)))
      .returning();

    if (!contract) {
      throw new AppError('Contract not found', 404);
    }

    // Log contract approval
    await db.insert(contractHistory)
      .values({
        contractId: contract.id,
        tenantId: user.tenantId,
        action: 'APPROVED',
        description: 'Contract approved',
        performedBy: user.id
      });

    return contract;
  });

  // Contract Parties
  fastify.get('/contracts/:contractId/parties', {
    preHandler: authenticateUser,
    schema: {
      params: z.object({
        contractId: z.string().uuid()
      })
    }
  }, async (request, reply) => {
    const { user } = request;
    const { contractId } = request.params as any;

    const parties = await db.select()
      .from(contractParties)
      .where(and(
        eq(contractParties.tenantId, user.tenantId),
        eq(contractParties.contractId, contractId)
      ))
      .orderBy(asc(contractParties.partyType));

    return parties;
  });

  fastify.post('/contracts/:contractId/parties', {
    preHandler: authenticateUser,
    schema: {
      params: z.object({
        contractId: z.string().uuid()
      }),
      body: ContractPartySchema.omit({ contractId: true })
    }
  }, async (request, reply) => {
    const { user } = request;
    const { contractId } = request.params as any;
    const partyData = request.body as any;

    const [party] = await db.insert(contractParties)
      .values({
        ...partyData,
        contractId,
        tenantId: user.tenantId,
        createdBy: user.id,
        updatedBy: user.id
      })
      .returning();

    return party;
  });

  // Contract Terms
  fastify.get('/contracts/:contractId/terms', {
    preHandler: authenticateUser,
    schema: {
      params: z.object({
        contractId: z.string().uuid()
      }),
      querystring: z.object({
        type: z.enum(['GENERAL', 'PAYMENT', 'DELIVERY', 'WARRANTY', 'TERMINATION', 'COMPLIANCE']).optional(),
        priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'CRITICAL']).optional()
      })
    }
  }, async (request, reply) => {
    const { user } = request;
    const { contractId } = request.params as any;
    const { type, priority } = request.query as any;

    let whereClause = and(
      eq(contractTerms.tenantId, user.tenantId),
      eq(contractTerms.contractId, contractId)
    );
    const conditions = [whereClause];

    if (type) {
      conditions.push(eq(contractTerms.type, type));
    }

    if (priority) {
      conditions.push(eq(contractTerms.priority, priority));
    }

    const terms = await db.select()
      .from(contractTerms)
      .where(and(...conditions))
      .orderBy(asc(contractTerms.section), asc(contractTerms.subsection));

    return terms;
  });

  fastify.post('/contracts/:contractId/terms', {
    preHandler: authenticateUser,
    schema: {
      params: z.object({
        contractId: z.string().uuid()
      }),
      body: ContractTermSchema.omit({ contractId: true })
    }
  }, async (request, reply) => {
    const { user } = request;
    const { contractId } = request.params as any;
    const termData = request.body as any;

    const [term] = await db.insert(contractTerms)
      .values({
        ...termData,
        contractId,
        tenantId: user.tenantId,
        createdBy: user.id,
        updatedBy: user.id
      })
      .returning();

    return term;
  });

  // Contract Amendments
  fastify.get('/contracts/:contractId/amendments', {
    preHandler: authenticateUser,
    schema: {
      params: z.object({
        contractId: z.string().uuid()
      }),
      querystring: z.object({
        type: z.enum(['EXTENSION', 'MODIFICATION', 'TERMINATION', 'RENEWAL']).optional(),
        status: z.enum(['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED']).optional()
      })
    }
  }, async (request, reply) => {
    const { user } = request;
    const { contractId } = request.params as any;
    const { type, status } = request.query as any;

    let whereClause = and(
      eq(contractAmendments.tenantId, user.tenantId),
      eq(contractAmendments.contractId, contractId)
    );
    const conditions = [whereClause];

    if (type) {
      conditions.push(eq(contractAmendments.type, type));
    }

    if (status) {
      conditions.push(eq(contractAmendments.status, status));
    }

    const amendments = await db.select()
      .from(contractAmendments)
      .where(and(...conditions))
      .orderBy(desc(contractAmendments.createdAt));

    return amendments;
  });

  fastify.post('/contracts/:contractId/amendments', {
    preHandler: authenticateUser,
    schema: {
      params: z.object({
        contractId: z.string().uuid()
      }),
      body: ContractAmendmentSchema.omit({ contractId: true })
    }
  }, async (request, reply) => {
    const { user } = request;
    const { contractId } = request.params as any;
    const amendmentData = request.body as any;

    const [amendment] = await db.insert(contractAmendments)
      .values({
        ...amendmentData,
        contractId,
        tenantId: user.tenantId,
        createdBy: user.id,
        updatedBy: user.id
      })
      .returning();

    // Log amendment creation
    await db.insert(contractHistory)
      .values({
        contractId,
        tenantId: user.tenantId,
        action: 'AMENDED',
        description: `Amendment ${amendment.amendmentNumber} created`,
        performedBy: user.id
      });

    return amendment;
  });

  // Contract Obligations
  fastify.get('/contracts/:contractId/obligations', {
    preHandler: authenticateUser,
    schema: {
      params: z.object({
        contractId: z.string().uuid()
      }),
      querystring: z.object({
        type: z.enum(['DELIVERY', 'PAYMENT', 'REPORTING', 'COMPLIANCE', 'PERFORMANCE']).optional(),
        status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE', 'CANCELLED']).optional(),
        priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'CRITICAL']).optional()
      })
    }
  }, async (request, reply) => {
    const { user } = request;
    const { contractId } = request.params as any;
    const { type, status, priority } = request.query as any;

    let whereClause = and(
      eq(contractObligations.tenantId, user.tenantId),
      eq(contractObligations.contractId, contractId)
    );
    const conditions = [whereClause];

    if (type) {
      conditions.push(eq(contractObligations.type, type));
    }

    if (status) {
      conditions.push(eq(contractObligations.status, status));
    }

    if (priority) {
      conditions.push(eq(contractObligations.priority, priority));
    }

    const obligations = await db.select()
      .from(contractObligations)
      .where(and(...conditions))
      .orderBy(asc(contractObligations.dueDate));

    return obligations;
  });

  fastify.post('/contracts/:contractId/obligations', {
    preHandler: authenticateUser,
    schema: {
      params: z.object({
        contractId: z.string().uuid()
      }),
      body: ContractObligationSchema.omit({ contractId: true })
    }
  }, async (request, reply) => {
    const { user } = request;
    const { contractId } = request.params as any;
    const obligationData = request.body as any;

    const [obligation] = await db.insert(contractObligations)
      .values({
        ...obligationData,
        contractId,
        tenantId: user.tenantId,
        createdBy: user.id,
        updatedBy: user.id
      })
      .returning();

    return obligation;
  });

  // Contract Milestones
  fastify.get('/contracts/:contractId/milestones', {
    preHandler: authenticateUser,
    schema: {
      params: z.object({
        contractId: z.string().uuid()
      }),
      querystring: z.object({
        type: z.enum(['DELIVERY', 'PAYMENT', 'REVIEW', 'APPROVAL', 'COMPLETION']).optional(),
        status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'DELAYED', 'CANCELLED']).optional()
      })
    }
  }, async (request, reply) => {
    const { user } = request;
    const { contractId } = request.params as any;
    const { type, status } = request.query as any;

    let whereClause = and(
      eq(contractMilestones.tenantId, user.tenantId),
      eq(contractMilestones.contractId, contractId)
    );
    const conditions = [whereClause];

    if (type) {
      conditions.push(eq(contractMilestones.type, type));
    }

    if (status) {
      conditions.push(eq(contractMilestones.status, status));
    }

    const milestones = await db.select()
      .from(contractMilestones)
      .where(and(...conditions))
      .orderBy(asc(contractMilestones.dueDate));

    return milestones;
  });

  fastify.post('/contracts/:contractId/milestones', {
    preHandler: authenticateUser,
    schema: {
      params: z.object({
        contractId: z.string().uuid()
      }),
      body: ContractMilestoneSchema.omit({ contractId: true })
    }
  }, async (request, reply) => {
    const { user } = request;
    const { contractId } = request.params as any;
    const milestoneData = request.body as any;

    const [milestone] = await db.insert(contractMilestones)
      .values({
        ...milestoneData,
        contractId,
        tenantId: user.tenantId,
        createdBy: user.id,
        updatedBy: user.id
      })
      .returning();

    return milestone;
  });

  // Contract Compliance
  fastify.get('/contracts/:contractId/compliance', {
    preHandler: authenticateUser,
    schema: {
      params: z.object({
        contractId: z.string().uuid()
      }),
      querystring: z.object({
        type: z.enum(['REGULATORY', 'CONTRACTUAL', 'INTERNAL', 'INDUSTRY']).optional(),
        status: z.enum(['PENDING', 'COMPLIANT', 'NON_COMPLIANT', 'EXEMPT']).optional(),
        priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'CRITICAL']).optional()
      })
    }
  }, async (request, reply) => {
    const { user } = request;
    const { contractId } = request.params as any;
    const { type, status, priority } = request.query as any;

    let whereClause = and(
      eq(contractCompliance.tenantId, user.tenantId),
      eq(contractCompliance.contractId, contractId)
    );
    const conditions = [whereClause];

    if (type) {
      conditions.push(eq(contractCompliance.type, type));
    }

    if (status) {
      conditions.push(eq(contractCompliance.status, status));
    }

    if (priority) {
      conditions.push(eq(contractCompliance.priority, priority));
    }

    const compliance = await db.select()
      .from(contractCompliance)
      .where(and(...conditions))
      .orderBy(asc(contractCompliance.dueDate));

    return compliance;
  });

  // Contract Templates
  fastify.get('/contract-templates', {
    preHandler: authenticateUser,
    schema: {
      querystring: z.object({
        type: z.enum(['SUPPLIER', 'CUSTOMER', 'SERVICE', 'LEASE', 'EMPLOYMENT']).optional(),
        isActive: z.string().transform(val => val === 'true').optional()
      })
    }
  }, async (request, reply) => {
    const { user } = request;
    const { type, isActive } = request.query as any;

    let whereClause = eq(contractTemplates.tenantId, user.tenantId);
    const conditions = [whereClause];

    if (type) {
      conditions.push(eq(contractTemplates.type, type));
    }

    if (isActive !== undefined) {
      conditions.push(eq(contractTemplates.isActive, isActive));
    }

    const templates = await db.select()
      .from(contractTemplates)
      .where(and(...conditions))
      .orderBy(desc(contractTemplates.createdAt));

    return templates;
  });

  // Contract Analytics
  fastify.get('/contracts/analytics', {
    preHandler: authenticateUser,
    schema: {
      querystring: z.object({
        startDate: z.string().datetime().optional(),
        endDate: z.string().datetime().optional()
      })
    }
  }, async (request, reply) => {
    const { user } = request;
    const { startDate, endDate } = request.query as any;

    let whereClause = eq(contracts.tenantId, user.tenantId);
    const conditions = [whereClause];

    if (startDate) {
      conditions.push(sql`${contracts.createdAt} >= ${startDate}`);
    }

    if (endDate) {
      conditions.push(sql`${contracts.createdAt} <= ${endDate}`);
    }

    const analytics = await db.select({
      totalContracts: sql<number>`count(*)`,
      activeContracts: sql<number>`count(*) filter (where ${contracts.status} = 'ACTIVE')`,
      expiredContracts: sql<number>`count(*) filter (where ${contracts.status} = 'EXPIRED')`,
      draftContracts: sql<number>`count(*) filter (where ${contracts.status} = 'DRAFT')`,
      totalValue: sql<number>`sum(${contracts.value})`,
      averageValue: sql<number>`avg(${contracts.value})`,
      highRiskContracts: sql<number>`count(*) filter (where ${contracts.riskLevel} = 'HIGH' or ${contracts.riskLevel} = 'CRITICAL')`,
      nonCompliantContracts: sql<number>`count(*) filter (where ${contracts.complianceStatus} = 'NON_COMPLIANT')`
    })
    .from(contracts)
    .where(and(...conditions));

    return analytics[0];
  });

  // Contract History
  fastify.get('/contracts/:contractId/history', {
    preHandler: authenticateUser,
    schema: {
      params: z.object({
        contractId: z.string().uuid()
      }),
      querystring: z.object({
        page: z.string().transform(Number).default('1'),
        limit: z.string().transform(Number).default('10')
      })
    }
  }, async (request, reply) => {
    const { user } = request;
    const { contractId } = request.params as any;
    const { page, limit } = request.query as any;
    const offset = (page - 1) * limit;

    const [history, total] = await Promise.all([
      db.select()
        .from(contractHistory)
        .where(and(
          eq(contractHistory.tenantId, user.tenantId),
          eq(contractHistory.contractId, contractId)
        ))
        .orderBy(desc(contractHistory.performedAt))
        .limit(limit)
        .offset(offset),
      db.select({ count: sql<number>`count(*)` })
        .from(contractHistory)
        .where(and(
          eq(contractHistory.tenantId, user.tenantId),
          eq(contractHistory.contractId, contractId)
        ))
        .then(result => result[0]?.count || 0)
    ]);

    return {
      data: history,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  });
} 