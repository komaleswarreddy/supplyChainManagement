import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { db } from '../db';
import { eq, and, or, like, desc, asc, gte, lte } from 'drizzle-orm';
import { AppError } from '../utils/app-error';
import { authenticate, hasPermissions } from '../middleware/auth';

// Define route schemas
const createRfxSchema = z.object({
  rfxNumber: z.string().min(1, 'RFX number is required'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  type: z.enum(['RFQ', 'RFP', 'RFI']),
  status: z.enum(['DRAFT', 'PUBLISHED', 'CLOSED', 'AWARDED', 'CANCELLED']).default('DRAFT'),
  category: z.string().min(1, 'Category is required'),
  department: z.string().min(1, 'Department is required'),
  costCenter: z.string().optional(),
  projectCode: z.string().optional(),
  budgetCode: z.string().optional(),
  estimatedValue: z.number().positive().optional(),
  currency: z.string().default('USD'),
  publishDate: z.string().datetime(),
  submissionDeadline: z.string().datetime(),
  evaluationCriteria: z.array(z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    weight: z.number().min(0).max(100),
    type: z.enum(['TECHNICAL', 'COMMERCIAL', 'DELIVERY', 'QUALITY']),
  })),
  requirements: z.array(z.object({
    id: z.string(),
    category: z.string(),
    description: z.string(),
    mandatory: z.boolean(),
    specifications: z.record(z.any()).optional(),
  })),
  terms: z.object({
    paymentTerms: z.string().optional(),
    deliveryTerms: z.string().optional(),
    warrantyTerms: z.string().optional(),
    penaltyClause: z.string().optional(),
    contractDuration: z.string().optional(),
  }).optional(),
  attachments: z.array(z.object({
    name: z.string(),
    url: z.string(),
    type: z.string(),
    size: z.number(),
  })).optional(),
  invitedSuppliers: z.array(z.string().uuid()).optional(),
  evaluationTeam: z.array(z.string().uuid()).optional(),
  notes: z.string().optional(),
});

const updateRfxSchema = createRfxSchema.partial().omit({ rfxNumber: true });

const createResponseSchema = z.object({
  rfxId: z.string().uuid(),
  supplierId: z.string().uuid(),
  submissionDate: z.string().datetime(),
  status: z.enum(['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'ACCEPTED', 'REJECTED']).default('DRAFT'),
  commercialProposal: z.object({
    totalValue: z.number().positive(),
    currency: z.string(),
    paymentTerms: z.string().optional(),
    deliveryTerms: z.string().optional(),
    validityPeriod: z.string().optional(),
    breakdown: z.array(z.object({
      item: z.string(),
      quantity: z.number(),
      unitPrice: z.number(),
      totalPrice: z.number(),
    })).optional(),
  }),
  technicalProposal: z.object({
    methodology: z.string().optional(),
    timeline: z.string().optional(),
    resources: z.string().optional(),
    qualifications: z.string().optional(),
    references: z.array(z.object({
      client: z.string(),
      project: z.string(),
      value: z.number().optional(),
      duration: z.string().optional(),
    })).optional(),
  }).optional(),
  attachments: z.array(z.object({
    name: z.string(),
    url: z.string(),
    type: z.string(),
    size: z.number(),
  })).optional(),
  notes: z.string().optional(),
});

const createEvaluationSchema = z.object({
  rfxId: z.string().uuid(),
  responseId: z.string().uuid(),
  evaluatorId: z.string().uuid(),
  scores: z.array(z.object({
    criteriaId: z.string(),
    score: z.number().min(0).max(100),
    comments: z.string().optional(),
  })),
  overallScore: z.number().min(0).max(100),
  recommendation: z.enum(['ACCEPT', 'REJECT', 'CONDITIONAL']),
  comments: z.string().optional(),
});

// RFX routes
export default async function rfxRoutes(fastify: FastifyInstance) {
  // Apply authentication middleware to all routes
  fastify.addHook('preHandler', authenticate);
  
  // Get all RFX documents
  fastify.get('/rfx', {
    preHandler: hasPermissions(['view_procurement']),
    schema: {
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'number', default: 1 },
          pageSize: { type: 'number', default: 10 },
          type: { type: 'string', enum: ['RFQ', 'RFP', 'RFI'] },
          status: { type: 'string', enum: ['DRAFT', 'PUBLISHED', 'CLOSED', 'AWARDED', 'CANCELLED'] },
          category: { type: 'string' },
          department: { type: 'string' },
          costCenter: { type: 'string' },
          projectCode: { type: 'string' },
          budgetCode: { type: 'string' },
          minValue: { type: 'number' },
          maxValue: { type: 'number' },
          publishDateFrom: { type: 'string', format: 'date-time' },
          publishDateTo: { type: 'string', format: 'date-time' },
          deadlineFrom: { type: 'string', format: 'date-time' },
          deadlineTo: { type: 'string', format: 'date-time' },
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
                  rfxNumber: { type: 'string' },
                  title: { type: 'string' },
                  type: { type: 'string' },
                  status: { type: 'string' },
                  category: { type: 'string' },
                  department: { type: 'string' },
                  estimatedValue: { type: 'number' },
                  currency: { type: 'string' },
                  publishDate: { type: 'string', format: 'date-time' },
                  submissionDeadline: { type: 'string', format: 'date-time' },
                  responsesCount: { type: 'number' },
                  createdAt: { type: 'string', format: 'date-time' },
                  createdBy: { type: 'object' },
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
      category, 
      department,
      search 
    } = request.query as any;
    
    // Mock data for demonstration
    const mockRfxData = Array.from({ length: 50 }, (_, i) => ({
      id: `rfx-${i + 1}`,
      rfxNumber: `RFX-${new Date().getFullYear()}-${String(i + 1).padStart(4, '0')}`,
      title: `RFX Title ${i + 1}`,
      description: `Description for RFX ${i + 1}`,
      type: ['RFQ', 'RFP', 'RFI'][i % 3] as 'RFQ' | 'RFP' | 'RFI',
      status: ['DRAFT', 'PUBLISHED', 'CLOSED', 'AWARDED', 'CANCELLED'][i % 5] as any,
      category: ['IT_EQUIPMENT', 'PROFESSIONAL_SERVICES', 'OFFICE_SUPPLIES', 'MAINTENANCE'][i % 4],
      department: ['IT', 'HR', 'Finance', 'Operations'][i % 4],
      costCenter: `CC-${String(i % 10 + 1).padStart(3, '0')}`,
      projectCode: `PRJ-${String(i % 5 + 1).padStart(3, '0')}`,
      budgetCode: `BUD-${String(i % 8 + 1).padStart(3, '0')}`,
      estimatedValue: Math.floor(Math.random() * 1000000) + 10000,
      currency: 'USD',
      publishDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      submissionDeadline: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      responsesCount: Math.floor(Math.random() * 10),
      createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
      createdBy: {
        id: 'user-1',
        name: 'John Doe',
        email: 'john.doe@example.com',
      },
    }));
    
    // Apply filters
    let filteredData = mockRfxData;
    
    if (type) {
      filteredData = filteredData.filter(item => item.type === type);
    }
    
    if (status) {
      filteredData = filteredData.filter(item => item.status === status);
    }
    
    if (category) {
      filteredData = filteredData.filter(item => item.category === category);
    }
    
    if (department) {
      filteredData = filteredData.filter(item => item.department === department);
    }
    
    if (search) {
      filteredData = filteredData.filter(item => 
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.rfxNumber.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    const total = filteredData.length;
    const totalPages = Math.ceil(total / pageSize);
    const offset = (page - 1) * pageSize;
    const items = filteredData.slice(offset, offset + pageSize);
    
    return {
      items,
      total,
      page,
      pageSize,
      totalPages,
    };
  });
  
  // Get RFX by ID
  fastify.get('/rfx/:id', {
    preHandler: hasPermissions(['view_procurement']),
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
    
    // Mock detailed RFX data
    const mockRfx = {
      id,
      rfxNumber: `RFX-${new Date().getFullYear()}-0001`,
      title: 'IT Equipment Procurement',
      description: 'Procurement of laptops, desktops, and accessories for new office setup',
      type: 'RFQ',
      status: 'PUBLISHED',
      category: 'IT_EQUIPMENT',
      department: 'IT',
      costCenter: 'CC-001',
      projectCode: 'PRJ-001',
      budgetCode: 'BUD-001',
      estimatedValue: 150000,
      currency: 'USD',
      publishDate: new Date().toISOString(),
      submissionDeadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      evaluationCriteria: [
        {
          id: 'crit-1',
          name: 'Technical Specifications',
          description: 'Compliance with technical requirements',
          weight: 40,
          type: 'TECHNICAL',
        },
        {
          id: 'crit-2',
          name: 'Price Competitiveness',
          description: 'Overall cost-effectiveness',
          weight: 35,
          type: 'COMMERCIAL',
        },
        {
          id: 'crit-3',
          name: 'Delivery Timeline',
          description: 'Ability to meet delivery schedule',
          weight: 15,
          type: 'DELIVERY',
        },
        {
          id: 'crit-4',
          name: 'Quality Assurance',
          description: 'Quality standards and warranty',
          weight: 10,
          type: 'QUALITY',
        },
      ],
      requirements: [
        {
          id: 'req-1',
          category: 'Hardware',
          description: 'Laptops with minimum 16GB RAM, 512GB SSD',
          mandatory: true,
          specifications: {
            quantity: 50,
            processor: 'Intel i7 or AMD Ryzen 7',
            ram: '16GB DDR4',
            storage: '512GB NVMe SSD',
            warranty: '3 years',
          },
        },
        {
          id: 'req-2',
          category: 'Software',
          description: 'Pre-installed Windows 11 Pro',
          mandatory: true,
        },
      ],
      terms: {
        paymentTerms: 'Net 30',
        deliveryTerms: 'DDP Office Location',
        warrantyTerms: '3 years manufacturer warranty',
        penaltyClause: '1% per week for delayed delivery',
        contractDuration: '12 months',
      },
      attachments: [
        {
          name: 'Technical_Specifications.pdf',
          url: '/attachments/tech-specs.pdf',
          type: 'application/pdf',
          size: 2048576,
        },
      ],
      invitedSuppliers: ['supplier-1', 'supplier-2', 'supplier-3'],
      evaluationTeam: ['user-1', 'user-2', 'user-3'],
      notes: 'Priority procurement for Q1 office expansion',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: {
        id: 'user-1',
        name: 'John Doe',
        email: 'john.doe@example.com',
      },
    };
    
    return mockRfx;
  });
  
  // Create RFX
  fastify.post('/rfx', {
    preHandler: hasPermissions(['create_procurement']),
    schema: {
      body: {
        type: 'object',
        required: ['rfxNumber', 'title', 'description', 'type', 'category', 'department', 'publishDate', 'submissionDeadline'],
        properties: {
          rfxNumber: { type: 'string' },
          title: { type: 'string' },
          description: { type: 'string' },
          type: { type: 'string', enum: ['RFQ', 'RFP', 'RFI'] },
          status: { type: 'string', enum: ['DRAFT', 'PUBLISHED', 'CLOSED', 'AWARDED', 'CANCELLED'] },
          category: { type: 'string' },
          department: { type: 'string' },
          costCenter: { type: 'string' },
          projectCode: { type: 'string' },
          budgetCode: { type: 'string' },
          estimatedValue: { type: 'number' },
          currency: { type: 'string' },
          publishDate: { type: 'string', format: 'date-time' },
          submissionDeadline: { type: 'string', format: 'date-time' },
          evaluationCriteria: { type: 'array' },
          requirements: { type: 'array' },
          terms: { type: 'object' },
          attachments: { type: 'array' },
          invitedSuppliers: { type: 'array' },
          evaluationTeam: { type: 'array' },
          notes: { type: 'string' },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const data = createRfxSchema.parse(request.body);
    const user = request.user as any;
    
    // Mock creation
    const newRfx = {
      id: `rfx-${Date.now()}`,
      ...data,
      tenantId: user.tenantId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: user.id,
    };
    
    reply.status(201);
    return {
      ...newRfx,
      message: 'RFX created successfully',
    };
  });
  
  // Update RFX
  fastify.put('/rfx/:id', {
    preHandler: hasPermissions(['edit_procurement']),
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
          status: { type: 'string', enum: ['DRAFT', 'PUBLISHED', 'CLOSED', 'AWARDED', 'CANCELLED'] },
          category: { type: 'string' },
          department: { type: 'string' },
          costCenter: { type: 'string' },
          projectCode: { type: 'string' },
          budgetCode: { type: 'string' },
          estimatedValue: { type: 'number' },
          currency: { type: 'string' },
          publishDate: { type: 'string', format: 'date-time' },
          submissionDeadline: { type: 'string', format: 'date-time' },
          evaluationCriteria: { type: 'array' },
          requirements: { type: 'array' },
          terms: { type: 'object' },
          attachments: { type: 'array' },
          invitedSuppliers: { type: 'array' },
          evaluationTeam: { type: 'array' },
          notes: { type: 'string' },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const data = updateRfxSchema.parse(request.body);
    const user = request.user as any;
    
    // Mock update
    const updatedRfx = {
      id,
      ...data,
      updatedAt: new Date().toISOString(),
      updatedBy: user.id,
    };
    
    return {
      ...updatedRfx,
      message: 'RFX updated successfully',
    };
  });
  
  // Delete RFX
  fastify.delete('/rfx/:id', {
    preHandler: hasPermissions(['delete_procurement']),
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
    
    return { message: 'RFX deleted successfully' };
  });
  
  // Get RFX responses
  fastify.get('/rfx/:id/responses', {
    preHandler: hasPermissions(['view_procurement']),
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' },
        },
      },
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'number', default: 1 },
          pageSize: { type: 'number', default: 10 },
          status: { type: 'string', enum: ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'ACCEPTED', 'REJECTED'] },
          supplierId: { type: 'string' },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const { page = 1, pageSize = 10, status, supplierId } = request.query as any;
    
    // Mock responses data
    const mockResponses = Array.from({ length: 5 }, (_, i) => ({
      id: `response-${i + 1}`,
      rfxId: id,
      supplierId: `supplier-${i + 1}`,
      supplierName: `Supplier ${i + 1}`,
      submissionDate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'ACCEPTED', 'REJECTED'][i % 5],
      commercialProposal: {
        totalValue: Math.floor(Math.random() * 100000) + 50000,
        currency: 'USD',
        paymentTerms: 'Net 30',
        deliveryTerms: 'DDP',
        validityPeriod: '30 days',
      },
      technicalProposal: {
        methodology: 'Agile delivery approach',
        timeline: '8-10 weeks',
        resources: '5 engineers, 2 project managers',
        qualifications: 'ISO 9001, ISO 27001 certified',
      },
      overallScore: Math.floor(Math.random() * 40) + 60,
      createdAt: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000).toISOString(),
    }));
    
    let filteredResponses = mockResponses;
    
    if (status) {
      filteredResponses = filteredResponses.filter(r => r.status === status);
    }
    
    if (supplierId) {
      filteredResponses = filteredResponses.filter(r => r.supplierId === supplierId);
    }
    
    const total = filteredResponses.length;
    const totalPages = Math.ceil(total / pageSize);
    const offset = (page - 1) * pageSize;
    const items = filteredResponses.slice(offset, offset + pageSize);
    
    return {
      items,
      total,
      page,
      pageSize,
      totalPages,
    };
  });
  
  // Create RFX response
  fastify.post('/rfx/:id/responses', {
    preHandler: hasPermissions(['submit_rfx_response']),
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
        required: ['supplierId', 'commercialProposal'],
        properties: {
          supplierId: { type: 'string' },
          submissionDate: { type: 'string', format: 'date-time' },
          status: { type: 'string', enum: ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'ACCEPTED', 'REJECTED'] },
          commercialProposal: { type: 'object' },
          technicalProposal: { type: 'object' },
          attachments: { type: 'array' },
          notes: { type: 'string' },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const data = createResponseSchema.parse({ ...request.body, rfxId: id });
    const user = request.user as any;
    
    // Mock creation
    const newResponse = {
      id: `response-${Date.now()}`,
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: user.id,
    };
    
    reply.status(201);
    return {
      ...newResponse,
      message: 'RFX response submitted successfully',
    };
  });
  
  // Get RFX analytics
  fastify.get('/rfx/analytics', {
    preHandler: hasPermissions(['view_procurement']),
    schema: {
      querystring: {
        type: 'object',
        properties: {
          startDate: { type: 'string', format: 'date-time' },
          endDate: { type: 'string', format: 'date-time' },
          type: { type: 'string', enum: ['RFQ', 'RFP', 'RFI'] },
          department: { type: 'string' },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    // Mock analytics data
    const analytics = {
      summary: {
        totalRfx: 125,
        activeRfx: 23,
        completedRfx: 89,
        totalValue: 2450000,
        averageResponseTime: 5.2,
        averageResponsesPerRfx: 4.3,
      },
      byType: [
        { type: 'RFQ', count: 65, value: 1200000 },
        { type: 'RFP', count: 45, value: 1100000 },
        { type: 'RFI', count: 15, value: 150000 },
      ],
      byStatus: [
        { status: 'DRAFT', count: 8 },
        { status: 'PUBLISHED', count: 15 },
        { status: 'CLOSED', count: 67 },
        { status: 'AWARDED', count: 32 },
        { status: 'CANCELLED', count: 3 },
      ],
      byDepartment: [
        { department: 'IT', count: 45, value: 980000 },
        { department: 'Operations', count: 35, value: 750000 },
        { department: 'HR', count: 25, value: 420000 },
        { department: 'Finance', count: 20, value: 300000 },
      ],
      timeline: Array.from({ length: 12 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - 11 + i);
        return {
          month: date.toISOString().slice(0, 7),
          count: Math.floor(Math.random() * 20) + 5,
          value: Math.floor(Math.random() * 300000) + 100000,
        };
      }),
    };
    
    return analytics;
  });
} 