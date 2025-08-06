import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { db } from '../db';
import { eq, and, or, like, desc, asc, gte, lte } from 'drizzle-orm';
import { AppError } from '../utils/app-error';
import { authenticate, hasPermissions } from '../middleware/auth';

// Define route schemas
const createContractSchema = z.object({
  contractNumber: z.string().min(1, 'Contract number is required'),
  title: z.string().min(1, 'Contract title is required'),
  description: z.string().optional(),
  contractType: z.enum(['PURCHASE', 'SALES', 'SERVICE', 'FRAMEWORK', 'MASTER', 'AMENDMENT', 'NDA', 'SOW']),
  status: z.enum(['DRAFT', 'UNDER_REVIEW', 'APPROVED', 'EXECUTED', 'ACTIVE', 'EXPIRED', 'TERMINATED', 'CANCELLED']).default('DRAFT'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
  category: z.string().min(1, 'Category is required'),
  department: z.string().min(1, 'Department is required'),
  costCenter: z.string().optional(),
  projectCode: z.string().optional(),
  budgetCode: z.string().optional(),
  
  // Parties
  counterparty: z.object({
    id: z.string().uuid(),
    name: z.string().min(1),
    type: z.enum(['SUPPLIER', 'CUSTOMER', 'PARTNER', 'SUBCONTRACTOR']),
    contactPerson: z.string().min(1),
    contactEmail: z.string().email(),
    contactPhone: z.string().optional(),
    address: z.object({
      street: z.string(),
      city: z.string(),
      state: z.string().optional(),
      country: z.string(),
      postalCode: z.string(),
    }),
  }),
  
  // Financial terms
  financialTerms: z.object({
    currency: z.string().default('USD'),
    totalValue: z.number().min(0),
    paymentTerms: z.string(),
    paymentSchedule: z.array(z.object({
      milestone: z.string(),
      percentage: z.number().min(0).max(100),
      amount: z.number().min(0),
      dueDate: z.string().datetime(),
    })).optional(),
    penaltyClause: z.string().optional(),
    bonusClause: z.string().optional(),
    priceAdjustmentClause: z.string().optional(),
  }),
  
  // Timeline
  timeline: z.object({
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
    duration: z.number().positive(),
    durationUnit: z.enum(['DAYS', 'MONTHS', 'YEARS']),
    renewalOptions: z.array(z.object({
      type: z.enum(['AUTOMATIC', 'MANUAL', 'OPTION']),
      duration: z.number().positive(),
      durationUnit: z.enum(['DAYS', 'MONTHS', 'YEARS']),
      noticePeriod: z.number().positive(),
      conditions: z.string().optional(),
    })).optional(),
    keyDates: z.array(z.object({
      name: z.string(),
      date: z.string().datetime(),
      description: z.string().optional(),
    })).optional(),
  }),
  
  // Legal terms
  legalTerms: z.object({
    governingLaw: z.string(),
    jurisdiction: z.string(),
    disputeResolution: z.enum(['LITIGATION', 'ARBITRATION', 'MEDIATION']),
    confidentialityClause: z.boolean().default(false),
    indemnityClause: z.boolean().default(false),
    forceMarjeure: z.boolean().default(false),
    terminationClause: z.string().optional(),
    ipRights: z.string().optional(),
    dataProtection: z.string().optional(),
  }),
  
  // Performance metrics
  performanceMetrics: z.array(z.object({
    name: z.string(),
    description: z.string(),
    target: z.string(),
    measurement: z.string(),
    frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'ANNUALLY']),
    penalty: z.string().optional(),
    bonus: z.string().optional(),
  })).optional(),
  
  // Risk assessment
  riskAssessment: z.object({
    overallRiskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
    risks: z.array(z.object({
      type: z.enum(['FINANCIAL', 'OPERATIONAL', 'LEGAL', 'REPUTATIONAL', 'STRATEGIC']),
      description: z.string(),
      probability: z.enum(['LOW', 'MEDIUM', 'HIGH']),
      impact: z.enum(['LOW', 'MEDIUM', 'HIGH']),
      mitigation: z.string(),
    })),
    insuranceRequirements: z.array(z.object({
      type: z.string(),
      coverageAmount: z.number().min(0),
      provider: z.string().optional(),
      policyNumber: z.string().optional(),
      expiryDate: z.string().datetime().optional(),
    })).optional(),
  }).optional(),
  
  // Compliance
  complianceRequirements: z.array(z.object({
    requirement: z.string(),
    description: z.string(),
    mandatory: z.boolean(),
    evidence: z.string().optional(),
    dueDate: z.string().datetime().optional(),
    status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLIANT', 'NON_COMPLIANT']).default('PENDING'),
  })).optional(),
  
  // Attachments
  attachments: z.array(z.object({
    name: z.string(),
    url: z.string(),
    type: z.enum(['CONTRACT', 'AMENDMENT', 'SCHEDULE', 'SOW', 'NDA', 'CERTIFICATE', 'OTHER']),
    size: z.number(),
    version: z.string().optional(),
  })).optional(),
  
  // Workflow
  approvalWorkflow: z.array(z.object({
    level: z.number().int().positive(),
    approver: z.object({
      id: z.string().uuid(),
      name: z.string(),
      email: z.string().email(),
      role: z.string(),
    }),
    status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).default('PENDING'),
    comments: z.string().optional(),
    approvedAt: z.string().datetime().optional(),
  })).optional(),
  
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

const createAmendmentSchema = z.object({
  contractId: z.string().uuid(),
  amendmentNumber: z.string().min(1, 'Amendment number is required'),
  title: z.string().min(1, 'Amendment title is required'),
  description: z.string().min(1, 'Description is required'),
  amendmentType: z.enum(['FINANCIAL', 'TIMELINE', 'SCOPE', 'TERMS', 'OTHER']),
  effectiveDate: z.string().datetime(),
  changes: z.array(z.object({
    section: z.string(),
    field: z.string(),
    oldValue: z.string(),
    newValue: z.string(),
    reason: z.string(),
  })),
  financialImpact: z.object({
    originalValue: z.number(),
    newValue: z.number(),
    variance: z.number(),
    currency: z.string(),
  }).optional(),
  approvalRequired: z.boolean().default(true),
  attachments: z.array(z.object({
    name: z.string(),
    url: z.string(),
    type: z.string(),
    size: z.number(),
  })).optional(),
  notes: z.string().optional(),
});

const createRenewalSchema = z.object({
  contractId: z.string().uuid(),
  renewalType: z.enum(['AUTOMATIC', 'MANUAL', 'OPTION']),
  newStartDate: z.string().datetime(),
  newEndDate: z.string().datetime(),
  duration: z.number().positive(),
  durationUnit: z.enum(['DAYS', 'MONTHS', 'YEARS']),
  financialChanges: z.object({
    priceIncrease: z.number().optional(),
    newTotalValue: z.number().min(0),
    adjustmentReason: z.string().optional(),
  }).optional(),
  termsChanges: z.array(z.object({
    section: z.string(),
    change: z.string(),
    reason: z.string(),
  })).optional(),
  approvalRequired: z.boolean().default(true),
  notes: z.string().optional(),
});

// Contract routes
export default async function contractRoutes(fastify: FastifyInstance) {
  // Apply authentication middleware to all routes
  fastify.addHook('preHandler', authenticate);
  
  // Get all contracts
  fastify.get('/contracts', {
    preHandler: hasPermissions(['view_contracts']),
    schema: {
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'number', default: 1 },
          pageSize: { type: 'number', default: 10 },
          contractType: { type: 'string', enum: ['PURCHASE', 'SALES', 'SERVICE', 'FRAMEWORK', 'MASTER', 'AMENDMENT', 'NDA', 'SOW'] },
          status: { type: 'string', enum: ['DRAFT', 'UNDER_REVIEW', 'APPROVED', 'EXECUTED', 'ACTIVE', 'EXPIRED', 'TERMINATED', 'CANCELLED'] },
          priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] },
          category: { type: 'string' },
          department: { type: 'string' },
          counterpartyId: { type: 'string' },
          startDateFrom: { type: 'string', format: 'date-time' },
          startDateTo: { type: 'string', format: 'date-time' },
          endDateFrom: { type: 'string', format: 'date-time' },
          endDateTo: { type: 'string', format: 'date-time' },
          minValue: { type: 'number' },
          maxValue: { type: 'number' },
          currency: { type: 'string' },
          expiringWithin: { type: 'number' },
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
                  contractNumber: { type: 'string' },
                  title: { type: 'string' },
                  contractType: { type: 'string' },
                  status: { type: 'string' },
                  priority: { type: 'string' },
                  counterpartyName: { type: 'string' },
                  totalValue: { type: 'number' },
                  currency: { type: 'string' },
                  startDate: { type: 'string', format: 'date-time' },
                  endDate: { type: 'string', format: 'date-time' },
                  daysToExpiry: { type: 'number' },
                  riskLevel: { type: 'string' },
                  createdAt: { type: 'string', format: 'date-time' },
                },
              },
            },
            total: { type: 'number' },
            page: { type: 'number' },
            pageSize: { type: 'number' },
            totalPages: { type: 'number' },
            summary: {
              type: 'object',
              properties: {
                totalContracts: { type: 'number' },
                totalValue: { type: 'number' },
                activeContracts: { type: 'number' },
                expiringContracts: { type: 'number' },
                draftContracts: { type: 'number' },
              },
            },
          },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { 
      page = 1, 
      pageSize = 10, 
      contractType, 
      status, 
      priority,
      category,
      department,
      counterpartyId,
      expiringWithin,
      search 
    } = request.query as any;
    
    // Mock data for demonstration
    const mockContracts = Array.from({ length: 60 }, (_, i) => {
      const startDate = new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000);
      const endDate = new Date(startDate.getTime() + (Math.random() * 730 + 365) * 24 * 60 * 60 * 1000);
      const daysToExpiry = Math.floor((endDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000));
      
      return {
        id: `contract-${i + 1}`,
        contractNumber: `CT-${new Date().getFullYear()}-${String(i + 1).padStart(4, '0')}`,
        title: `${['Software License Agreement', 'Service Contract', 'Purchase Agreement', 'Framework Agreement', 'Master Service Agreement'][i % 5]} ${i + 1}`,
        contractType: ['PURCHASE', 'SALES', 'SERVICE', 'FRAMEWORK', 'MASTER'][i % 5] as any,
        status: daysToExpiry < 0 ? 'EXPIRED' : daysToExpiry < 30 ? 'ACTIVE' : ['DRAFT', 'UNDER_REVIEW', 'APPROVED', 'EXECUTED', 'ACTIVE'][i % 5] as any,
        priority: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'][i % 4] as any,
        category: ['IT Services', 'Professional Services', 'Equipment', 'Software', 'Consulting'][i % 5],
        department: ['IT', 'HR', 'Finance', 'Operations', 'Legal'][i % 5],
        counterpartyId: `counterparty-${(i % 20) + 1}`,
        counterpartyName: `${['Acme Corp', 'Global Tech', 'Service Pro', 'Solutions Inc', 'Enterprise Ltd'][i % 5]}`,
        counterpartyType: ['SUPPLIER', 'CUSTOMER', 'PARTNER', 'SUBCONTRACTOR'][i % 4] as any,
        totalValue: Math.floor(Math.random() * 500000) + 10000,
        currency: 'USD',
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        daysToExpiry: Math.max(0, daysToExpiry),
        riskLevel: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'][i % 4] as any,
        createdAt: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: {
          id: 'user-1',
          name: 'John Doe',
          email: 'john.doe@example.com',
        },
      };
    });
    
    // Apply filters
    let filteredData = mockContracts;
    
    if (contractType) {
      filteredData = filteredData.filter(item => item.contractType === contractType);
    }
    
    if (status) {
      filteredData = filteredData.filter(item => item.status === status);
    }
    
    if (priority) {
      filteredData = filteredData.filter(item => item.priority === priority);
    }
    
    if (category) {
      filteredData = filteredData.filter(item => item.category.toLowerCase().includes(category.toLowerCase()));
    }
    
    if (department) {
      filteredData = filteredData.filter(item => item.department === department);
    }
    
    if (counterpartyId) {
      filteredData = filteredData.filter(item => item.counterpartyId === counterpartyId);
    }
    
    if (expiringWithin) {
      filteredData = filteredData.filter(item => item.daysToExpiry <= expiringWithin && item.daysToExpiry > 0);
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      filteredData = filteredData.filter(item => 
        item.contractNumber.toLowerCase().includes(searchLower) ||
        item.title.toLowerCase().includes(searchLower) ||
        item.counterpartyName.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply pagination
    const total = filteredData.length;
    const totalPages = Math.ceil(total / pageSize);
    const offset = (page - 1) * pageSize;
    const items = filteredData.slice(offset, offset + pageSize);
    
    // Calculate summary
    const summary = {
      totalContracts: filteredData.length,
      totalValue: filteredData.reduce((sum, item) => sum + item.totalValue, 0),
      activeContracts: filteredData.filter(item => item.status === 'ACTIVE').length,
      expiringContracts: filteredData.filter(item => item.daysToExpiry <= 90 && item.daysToExpiry > 0).length,
      draftContracts: filteredData.filter(item => item.status === 'DRAFT').length,
    };
    
    return {
      items,
      total,
      page,
      pageSize,
      totalPages,
      summary,
    };
  });
  
  // Get contract by ID
  fastify.get('/contracts/:id', {
    preHandler: hasPermissions(['view_contracts']),
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    
    // Mock detailed contract data
    const mockContract = {
      id,
      contractNumber: 'CT-2024-0001',
      title: 'Software License Agreement with TechCorp',
      description: 'Comprehensive software licensing agreement for enterprise solutions',
      contractType: 'SERVICE',
      status: 'ACTIVE',
      priority: 'HIGH',
      category: 'Software',
      department: 'IT',
      costCenter: 'CC-IT-001',
      projectCode: 'PRJ-2024-001',
      budgetCode: 'BDG-IT-2024',
      
      counterparty: {
        id: 'counterparty-1',
        name: 'TechCorp Solutions Inc.',
        type: 'SUPPLIER',
        contactPerson: 'Jane Smith',
        contactEmail: 'jane.smith@techcorp.com',
        contactPhone: '+1-555-123-4567',
        address: {
          street: '123 Tech Street',
          city: 'San Francisco',
          state: 'CA',
          country: 'USA',
          postalCode: '94105',
        },
      },
      
      financialTerms: {
        currency: 'USD',
        totalValue: 250000,
        paymentTerms: 'Net 30',
        paymentSchedule: [
          {
            milestone: 'Contract Execution',
            percentage: 25,
            amount: 62500,
            dueDate: new Date().toISOString(),
          },
          {
            milestone: 'Quarterly Payment',
            percentage: 25,
            amount: 62500,
            dueDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ],
        penaltyClause: '2% per month for late payments',
        bonusClause: '5% discount for early completion',
        priceAdjustmentClause: 'Annual CPI adjustment',
      },
      
      timeline: {
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(Date.now() + 335 * 24 * 60 * 60 * 1000).toISOString(),
        duration: 12,
        durationUnit: 'MONTHS',
        renewalOptions: [
          {
            type: 'AUTOMATIC',
            duration: 12,
            durationUnit: 'MONTHS',
            noticePeriod: 90,
            conditions: 'Subject to satisfactory performance',
          },
        ],
        keyDates: [
          {
            name: 'First Milestone Review',
            date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
            description: 'Review of initial implementation',
          },
          {
            name: 'Mid-term Review',
            date: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
            description: 'Mid-contract performance assessment',
          },
        ],
      },
      
      legalTerms: {
        governingLaw: 'California State Law',
        jurisdiction: 'California, USA',
        disputeResolution: 'ARBITRATION',
        confidentialityClause: true,
        indemnityClause: true,
        forceMarjeure: true,
        terminationClause: '30 days written notice for convenience',
        ipRights: 'All IP remains with respective parties',
        dataProtection: 'GDPR and CCPA compliant',
      },
      
      performanceMetrics: [
        {
          name: 'System Uptime',
          description: 'Minimum system availability',
          target: '99.9%',
          measurement: 'Monthly average',
          frequency: 'MONTHLY',
          penalty: '1% credit for each 0.1% below target',
          bonus: '0.5% bonus for 99.99% uptime',
        },
        {
          name: 'Response Time',
          description: 'Support ticket response time',
          target: '4 hours',
          measurement: 'Average response time',
          frequency: 'WEEKLY',
          penalty: 'Escalation to management',
        },
      ],
      
      riskAssessment: {
        overallRiskLevel: 'MEDIUM',
        risks: [
          {
            type: 'OPERATIONAL',
            description: 'Dependency on third-party systems',
            probability: 'MEDIUM',
            impact: 'HIGH',
            mitigation: 'Backup systems and redundancy',
          },
          {
            type: 'FINANCIAL',
            description: 'Currency fluctuation exposure',
            probability: 'LOW',
            impact: 'MEDIUM',
            mitigation: 'Fixed pricing in USD',
          },
        ],
        insuranceRequirements: [
          {
            type: 'Professional Liability',
            coverageAmount: 1000000,
            provider: 'Insurance Corp',
            policyNumber: 'POL-123456',
            expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ],
      },
      
      complianceRequirements: [
        {
          requirement: 'ISO 27001 Certification',
          description: 'Information security management certification',
          mandatory: true,
          evidence: 'Certificate provided',
          dueDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'COMPLIANT',
        },
        {
          requirement: 'SOC 2 Type II Report',
          description: 'Security and availability audit report',
          mandatory: true,
          evidence: 'Pending submission',
          dueDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'IN_PROGRESS',
        },
      ],
      
      attachments: [
        {
          name: 'Master_Agreement.pdf',
          url: '/attachments/master_agreement.pdf',
          type: 'CONTRACT',
          size: 2500000,
          version: '1.0',
        },
        {
          name: 'SOW_Phase1.pdf',
          url: '/attachments/sow_phase1.pdf',
          type: 'SOW',
          size: 1200000,
          version: '1.0',
        },
      ],
      
      approvalWorkflow: [
        {
          level: 1,
          approver: {
            id: 'user-2',
            name: 'Legal Manager',
            email: 'legal@company.com',
            role: 'Legal Review',
          },
          status: 'APPROVED',
          comments: 'Legal terms reviewed and approved',
          approvedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          level: 2,
          approver: {
            id: 'user-3',
            name: 'CFO',
            email: 'cfo@company.com',
            role: 'Financial Approval',
          },
          status: 'APPROVED',
          comments: 'Budget approved',
          approvedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ],
      
      amendments: [
        {
          id: 'amendment-1',
          amendmentNumber: 'AMD-001',
          title: 'Scope Extension',
          effectiveDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'EXECUTED',
        },
      ],
      
      renewals: [],
      
      performanceHistory: [
        {
          period: '2024-01',
          uptime: 99.95,
          responseTime: 3.2,
          customerSatisfaction: 4.8,
          slaCompliance: 100,
        },
        {
          period: '2024-02',
          uptime: 99.87,
          responseTime: 4.1,
          customerSatisfaction: 4.6,
          slaCompliance: 98,
        },
      ],
      
      notes: 'Critical contract for core business operations',
      tags: ['critical', 'software', 'recurring'],
      
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: {
        id: 'user-1',
        name: 'John Doe',
        email: 'john.doe@example.com',
      },
    };
    
    return mockContract;
  });
  
  // Create contract
  fastify.post('/contracts', {
    preHandler: hasPermissions(['create_contracts']),
    schema: {
      body: {
        type: 'object',
        required: ['contractNumber', 'title', 'contractType', 'counterparty', 'financialTerms', 'timeline', 'legalTerms'],
        properties: {
          contractNumber: { type: 'string' },
          title: { type: 'string' },
          description: { type: 'string' },
          contractType: { type: 'string', enum: ['PURCHASE', 'SALES', 'SERVICE', 'FRAMEWORK', 'MASTER', 'AMENDMENT', 'NDA', 'SOW'] },
          status: { type: 'string', enum: ['DRAFT', 'UNDER_REVIEW', 'APPROVED', 'EXECUTED', 'ACTIVE', 'EXPIRED', 'TERMINATED', 'CANCELLED'] },
          priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] },
          category: { type: 'string' },
          department: { type: 'string' },
          counterparty: { type: 'object' },
          financialTerms: { type: 'object' },
          timeline: { type: 'object' },
          legalTerms: { type: 'object' },
          performanceMetrics: { type: 'array' },
          riskAssessment: { type: 'object' },
          complianceRequirements: { type: 'array' },
          attachments: { type: 'array' },
          approvalWorkflow: { type: 'array' },
          notes: { type: 'string' },
          tags: { type: 'array' },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const data = createContractSchema.parse(request.body);
    const user = request.user as any;
    
    // Mock creation
    const newContract = {
      id: `contract-${Date.now()}`,
      ...data,
      tenantId: user.tenantId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: user.id,
    };
    
    reply.status(201);
    return {
      ...newContract,
      message: 'Contract created successfully',
    };
  });
  
  // Update contract
  fastify.put('/contracts/:id', {
    preHandler: hasPermissions(['update_contracts']),
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' },
        },
      },
      body: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          status: { type: 'string', enum: ['DRAFT', 'UNDER_REVIEW', 'APPROVED', 'EXECUTED', 'ACTIVE', 'EXPIRED', 'TERMINATED', 'CANCELLED'] },
          priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] },
          financialTerms: { type: 'object' },
          timeline: { type: 'object' },
          legalTerms: { type: 'object' },
          performanceMetrics: { type: 'array' },
          riskAssessment: { type: 'object' },
          complianceRequirements: { type: 'array' },
          notes: { type: 'string' },
          tags: { type: 'array' },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const data = request.body as any;
    const user = request.user as any;
    
    // Mock update
    const updatedContract = {
      id,
      ...data,
      updatedAt: new Date().toISOString(),
      updatedBy: user.id,
    };
    
    return {
      ...updatedContract,
      message: 'Contract updated successfully',
    };
  });
  
  // Delete contract
  fastify.delete('/contracts/:id', {
    preHandler: hasPermissions(['delete_contracts']),
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    
    return {
      message: 'Contract deleted successfully',
    };
  });
  
  // Create amendment
  fastify.post('/contracts/:id/amendments', {
    preHandler: hasPermissions(['create_amendments']),
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' },
        },
      },
      body: {
        type: 'object',
        required: ['amendmentNumber', 'title', 'description', 'amendmentType', 'effectiveDate', 'changes'],
        properties: {
          amendmentNumber: { type: 'string' },
          title: { type: 'string' },
          description: { type: 'string' },
          amendmentType: { type: 'string', enum: ['FINANCIAL', 'TIMELINE', 'SCOPE', 'TERMS', 'OTHER'] },
          effectiveDate: { type: 'string', format: 'date-time' },
          changes: { type: 'array' },
          financialImpact: { type: 'object' },
          approvalRequired: { type: 'boolean' },
          attachments: { type: 'array' },
          notes: { type: 'string' },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const data = createAmendmentSchema.parse({ ...request.body, contractId: id });
    const user = request.user as any;
    
    // Mock creation
    const newAmendment = {
      id: `amendment-${Date.now()}`,
      ...data,
      status: 'DRAFT',
      tenantId: user.tenantId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: user.id,
    };
    
    reply.status(201);
    return {
      ...newAmendment,
      message: 'Amendment created successfully',
    };
  });
  
  // Create renewal
  fastify.post('/contracts/:id/renewals', {
    preHandler: hasPermissions(['create_renewals']),
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' },
        },
      },
      body: {
        type: 'object',
        required: ['renewalType', 'newStartDate', 'newEndDate', 'duration', 'durationUnit'],
        properties: {
          renewalType: { type: 'string', enum: ['AUTOMATIC', 'MANUAL', 'OPTION'] },
          newStartDate: { type: 'string', format: 'date-time' },
          newEndDate: { type: 'string', format: 'date-time' },
          duration: { type: 'number' },
          durationUnit: { type: 'string', enum: ['DAYS', 'MONTHS', 'YEARS'] },
          financialChanges: { type: 'object' },
          termsChanges: { type: 'array' },
          approvalRequired: { type: 'boolean' },
          notes: { type: 'string' },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const data = createRenewalSchema.parse({ ...request.body, contractId: id });
    const user = request.user as any;
    
    // Mock creation
    const newRenewal = {
      id: `renewal-${Date.now()}`,
      ...data,
      status: 'DRAFT',
      tenantId: user.tenantId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: user.id,
    };
    
    reply.status(201);
    return {
      ...newRenewal,
      message: 'Renewal created successfully',
    };
  });
  
  // Get contract analytics
  fastify.get('/contracts/analytics', {
    preHandler: hasPermissions(['view_reports']),
    schema: {
      querystring: {
        type: 'object',
        properties: {
          startDate: { type: 'string', format: 'date-time' },
          endDate: { type: 'string', format: 'date-time' },
          contractType: { type: 'string' },
          department: { type: 'string' },
          status: { type: 'string' },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    // Mock analytics data
    const analytics = {
      summary: {
        totalContracts: 156,
        totalValue: 12500000,
        activeContracts: 89,
        expiringContracts: 23,
        draftContracts: 12,
        averageContractValue: 80128,
        renewalRate: 87.5,
        complianceRate: 94.2,
      },
      byType: [
        { type: 'SERVICE', count: 45, value: 5500000, percentage: 44 },
        { type: 'PURCHASE', count: 38, value: 3200000, percentage: 25.6 },
        { type: 'FRAMEWORK', count: 28, value: 2100000, percentage: 16.8 },
        { type: 'SALES', count: 25, value: 1200000, percentage: 9.6 },
        { type: 'MASTER', count: 20, value: 500000, percentage: 4 },
      ],
      byStatus: [
        { status: 'ACTIVE', count: 89, percentage: 57 },
        { status: 'DRAFT', count: 12, percentage: 8 },
        { status: 'UNDER_REVIEW', count: 18, percentage: 11 },
        { status: 'APPROVED', count: 15, percentage: 10 },
        { status: 'EXPIRED', count: 22, percentage: 14 },
      ],
      byRisk: [
        { level: 'LOW', count: 68, percentage: 44 },
        { level: 'MEDIUM', count: 52, percentage: 33 },
        { level: 'HIGH', count: 28, percentage: 18 },
        { level: 'CRITICAL', count: 8, percentage: 5 },
      ],
      expiringContracts: [
        {
          id: 'contract-1',
          contractNumber: 'CT-2024-0123',
          title: 'Software License Agreement',
          counterpartyName: 'TechCorp',
          endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
          daysToExpiry: 15,
          value: 150000,
          renewalOption: true,
        },
        {
          id: 'contract-2',
          contractNumber: 'CT-2024-0089',
          title: 'Maintenance Service Contract',
          counterpartyName: 'ServicePro',
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          daysToExpiry: 30,
          value: 75000,
          renewalOption: true,
        },
      ],
      performanceTrends: {
        contractCreation: Array.from({ length: 12 }, (_, i) => {
          const date = new Date();
          date.setMonth(date.getMonth() - 11 + i);
          return {
            month: date.toISOString().slice(0, 7),
            count: Math.floor(Math.random() * 20) + 8,
            value: Math.floor(Math.random() * 1000000) + 500000,
          };
        }),
        renewalRate: Array.from({ length: 12 }, (_, i) => {
          const date = new Date();
          date.setMonth(date.getMonth() - 11 + i);
          return {
            month: date.toISOString().slice(0, 7),
            rate: Math.floor(Math.random() * 20) + 80,
          };
        }),
      },
      complianceMetrics: {
        overallScore: 94.2,
        byRequirement: [
          { requirement: 'ISO 27001', compliance: 98, total: 45 },
          { requirement: 'SOC 2', compliance: 92, total: 38 },
          { requirement: 'GDPR', compliance: 96, total: 52 },
          { requirement: 'Insurance', compliance: 89, total: 67 },
        ],
      },
    };
    
    return analytics;
  });
} 