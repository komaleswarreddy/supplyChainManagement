import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { db } from '../db';
import { eq, and, or, like, desc, asc, gte, lte } from 'drizzle-orm';
import { AppError } from '../utils/app-error';
import { authenticate, hasPermissions } from '../middleware/auth';

// Define route schemas
const createTaxDeterminationSchema = z.object({
  determinationNumber: z.string().min(1, 'Determination number is required'),
  transactionType: z.enum(['PURCHASE', 'SALE', 'IMPORT', 'EXPORT', 'SERVICE']),
  status: z.enum(['DRAFT', 'CALCULATED', 'APPLIED', 'FILED', 'AMENDED']).default('DRAFT'),
  entityId: z.string().uuid(),
  entityType: z.enum(['SUPPLIER', 'CUSTOMER', 'INTERNAL']),
  transactionDate: z.string().datetime(),
  taxJurisdictions: z.array(z.object({
    id: z.string(),
    name: z.string(),
    type: z.enum(['FEDERAL', 'STATE', 'LOCAL', 'VAT', 'GST']),
    code: z.string(),
    rate: z.number().min(0).max(100),
    amount: z.number().min(0),
    exemptionCode: z.string().optional(),
    exemptionReason: z.string().optional(),
  })),
  lineItems: z.array(z.object({
    id: z.string(),
    description: z.string(),
    amount: z.number().min(0),
    taxableAmount: z.number().min(0),
    taxCategory: z.string(),
    taxCode: z.string().optional(),
    exemptionApplied: z.boolean().default(false),
    exemptionCode: z.string().optional(),
    exemptionCertificate: z.string().optional(),
  })),
  addresses: z.object({
    shipFrom: z.object({
      street: z.string(),
      city: z.string(),
      state: z.string(),
      country: z.string(),
      postalCode: z.string(),
    }),
    shipTo: z.object({
      street: z.string(),
      city: z.string(),
      state: z.string(),
      country: z.string(),
      postalCode: z.string(),
    }),
    billTo: z.object({
      street: z.string(),
      city: z.string(),
      state: z.string(),
      country: z.string(),
      postalCode: z.string(),
    }).optional(),
  }),
  totalAmount: z.number().min(0),
  totalTaxableAmount: z.number().min(0),
  totalTaxAmount: z.number().min(0),
  currency: z.string().default('USD'),
  exchangeRate: z.number().positive().default(1),
  calculationMethod: z.enum(['AUTOMATIC', 'MANUAL', 'OVERRIDE']).default('AUTOMATIC'),
  overrideReason: z.string().optional(),
  notes: z.string().optional(),
  attachments: z.array(z.object({
    name: z.string(),
    url: z.string(),
    type: z.string(),
    size: z.number(),
  })).optional(),
});

const createTaxDocumentSchema = z.object({
  documentNumber: z.string().min(1, 'Document number is required'),
  documentType: z.enum(['TAX_RETURN', 'TAX_CERTIFICATE', 'EXEMPTION_CERTIFICATE', 'COMPLIANCE_REPORT', 'AUDIT_REPORT']),
  status: z.enum(['DRAFT', 'PENDING_REVIEW', 'APPROVED', 'FILED', 'REJECTED', 'AMENDED']).default('DRAFT'),
  taxPeriod: z.object({
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
    frequency: z.enum(['MONTHLY', 'QUARTERLY', 'ANNUALLY']),
  }),
  jurisdiction: z.object({
    id: z.string(),
    name: z.string(),
    type: z.enum(['FEDERAL', 'STATE', 'LOCAL', 'VAT', 'GST']),
    code: z.string(),
  }),
  filingRequirements: z.object({
    dueDate: z.string().datetime(),
    filingMethod: z.enum(['ELECTRONIC', 'PAPER', 'BOTH']),
    requiredForms: z.array(z.string()),
    requiredAttachments: z.array(z.string()),
  }),
  taxData: z.object({
    grossSales: z.number().min(0).optional(),
    taxableAmount: z.number().min(0),
    exemptAmount: z.number().min(0).optional(),
    taxDue: z.number().min(0),
    taxPaid: z.number().min(0).optional(),
    penalties: z.number().min(0).optional(),
    interest: z.number().min(0).optional(),
    totalDue: z.number().min(0),
  }),
  filingDetails: z.object({
    filedDate: z.string().datetime().optional(),
    filedBy: z.string().uuid().optional(),
    confirmationNumber: z.string().optional(),
    paymentMethod: z.enum(['ACH', 'CHECK', 'WIRE', 'CREDIT_CARD', 'CASH']).optional(),
    paymentReference: z.string().optional(),
  }).optional(),
  notes: z.string().optional(),
  attachments: z.array(z.object({
    name: z.string(),
    url: z.string(),
    type: z.string(),
    size: z.number(),
  })).optional(),
});

const createTaxReportSchema = z.object({
  reportNumber: z.string().min(1, 'Report number is required'),
  reportType: z.enum(['SALES_TAX', 'USE_TAX', 'VAT', 'GST', 'INCOME_TAX', 'COMPLIANCE', 'AUDIT']),
  status: z.enum(['DRAFT', 'GENERATING', 'COMPLETED', 'ERROR']).default('DRAFT'),
  reportPeriod: z.object({
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
    frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'ANNUALLY']),
  }),
  filters: z.object({
    jurisdictions: z.array(z.string()).optional(),
    entityTypes: z.array(z.string()).optional(),
    transactionTypes: z.array(z.string()).optional(),
    taxCategories: z.array(z.string()).optional(),
    departments: z.array(z.string()).optional(),
    costCenters: z.array(z.string()).optional(),
  }).optional(),
  reportData: z.object({
    summary: z.object({
      totalTransactions: z.number().min(0),
      totalAmount: z.number().min(0),
      totalTaxableAmount: z.number().min(0),
      totalTaxAmount: z.number().min(0),
      totalExemptAmount: z.number().min(0),
    }),
    details: z.array(z.object({
      jurisdiction: z.string(),
      taxType: z.string(),
      taxRate: z.number(),
      taxableAmount: z.number(),
      taxAmount: z.number(),
      exemptAmount: z.number().optional(),
      transactionCount: z.number(),
    })),
  }).optional(),
  generatedDate: z.string().datetime().optional(),
  fileUrl: z.string().optional(),
  fileFormat: z.enum(['PDF', 'EXCEL', 'CSV', 'XML']).optional(),
  notes: z.string().optional(),
});

// Tax Compliance routes
export default async function taxComplianceRoutes(fastify: FastifyInstance) {
  // Apply authentication middleware to all routes
  fastify.addHook('preHandler', authenticate);
  
  // Get all tax determinations
  fastify.get('/tax-determinations', {
    preHandler: hasPermissions(['view_tax_compliance']),
    schema: {
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'number', default: 1 },
          pageSize: { type: 'number', default: 10 },
          transactionType: { type: 'string', enum: ['PURCHASE', 'SALE', 'IMPORT', 'EXPORT', 'SERVICE'] },
          status: { type: 'string', enum: ['DRAFT', 'CALCULATED', 'APPLIED', 'FILED', 'AMENDED'] },
          entityId: { type: 'string' },
          entityType: { type: 'string', enum: ['SUPPLIER', 'CUSTOMER', 'INTERNAL'] },
          transactionDateFrom: { type: 'string', format: 'date-time' },
          transactionDateTo: { type: 'string', format: 'date-time' },
          jurisdiction: { type: 'string' },
          minAmount: { type: 'number' },
          maxAmount: { type: 'number' },
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
                  determinationNumber: { type: 'string' },
                  transactionType: { type: 'string' },
                  status: { type: 'string' },
                  entityName: { type: 'string' },
                  entityType: { type: 'string' },
                  transactionDate: { type: 'string', format: 'date-time' },
                  totalAmount: { type: 'number' },
                  totalTaxAmount: { type: 'number' },
                  currency: { type: 'string' },
                  jurisdictionsCount: { type: 'number' },
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
    const { 
      page = 1, 
      pageSize = 10, 
      transactionType, 
      status, 
      entityType,
      search 
    } = request.query as any;
    
    // Mock data for demonstration
    const mockTaxDeterminations = Array.from({ length: 75 }, (_, i) => ({
      id: `tax-det-${i + 1}`,
      determinationNumber: `TD-${new Date().getFullYear()}-${String(i + 1).padStart(6, '0')}`,
      transactionType: ['PURCHASE', 'SALE', 'IMPORT', 'EXPORT', 'SERVICE'][i % 5] as any,
      status: ['DRAFT', 'CALCULATED', 'APPLIED', 'FILED', 'AMENDED'][i % 5] as any,
      entityId: `entity-${(i % 20) + 1}`,
      entityName: `Entity ${(i % 20) + 1}`,
      entityType: ['SUPPLIER', 'CUSTOMER', 'INTERNAL'][i % 3] as any,
      transactionDate: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
      totalAmount: Math.floor(Math.random() * 100000) + 1000,
      totalTaxAmount: Math.floor(Math.random() * 8000) + 100,
      currency: 'USD',
      jurisdictionsCount: Math.floor(Math.random() * 3) + 1,
      createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
    }));
    
    // Apply filters
    let filteredData = mockTaxDeterminations;
    
    if (transactionType) {
      filteredData = filteredData.filter(item => item.transactionType === transactionType);
    }
    
    if (status) {
      filteredData = filteredData.filter(item => item.status === status);
    }
    
    if (entityType) {
      filteredData = filteredData.filter(item => item.entityType === entityType);
    }
    
    if (search) {
      filteredData = filteredData.filter(item => 
        item.determinationNumber.toLowerCase().includes(search.toLowerCase()) ||
        item.entityName.toLowerCase().includes(search.toLowerCase())
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
  
  // Get tax determination by ID
  fastify.get('/tax-determinations/:id', {
    preHandler: hasPermissions(['view_tax_compliance']),
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
    
    // Mock detailed tax determination data
    const mockTaxDetermination = {
      id,
      determinationNumber: 'TD-2024-000001',
      transactionType: 'SALE',
      status: 'CALCULATED',
      entityId: 'customer-1',
      entityName: 'ABC Corporation',
      entityType: 'CUSTOMER',
      transactionDate: new Date().toISOString(),
      taxJurisdictions: [
        {
          id: 'fed-1',
          name: 'Federal Sales Tax',
          type: 'FEDERAL',
          code: 'US-FED',
          rate: 0,
          amount: 0,
        },
        {
          id: 'state-1',
          name: 'California State Tax',
          type: 'STATE',
          code: 'CA-STATE',
          rate: 7.25,
          amount: 725,
        },
        {
          id: 'local-1',
          name: 'Los Angeles County Tax',
          type: 'LOCAL',
          code: 'LA-COUNTY',
          rate: 1.75,
          amount: 175,
        },
      ],
      lineItems: [
        {
          id: 'line-1',
          description: 'Software License',
          amount: 10000,
          taxableAmount: 10000,
          taxCategory: 'SOFTWARE',
          taxCode: 'SW-001',
          exemptionApplied: false,
        },
      ],
      addresses: {
        shipFrom: {
          street: '123 Business St',
          city: 'San Francisco',
          state: 'CA',
          country: 'US',
          postalCode: '94105',
        },
        shipTo: {
          street: '456 Customer Ave',
          city: 'Los Angeles',
          state: 'CA',
          country: 'US',
          postalCode: '90210',
        },
      },
      totalAmount: 10000,
      totalTaxableAmount: 10000,
      totalTaxAmount: 900,
      currency: 'USD',
      exchangeRate: 1,
      calculationMethod: 'AUTOMATIC',
      notes: 'Standard sales tax calculation',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: {
        id: 'user-1',
        name: 'John Doe',
        email: 'john.doe@example.com',
      },
    };
    
    return mockTaxDetermination;
  });
  
  // Create tax determination
  fastify.post('/tax-determinations', {
    preHandler: hasPermissions(['create_tax_compliance']),
    schema: {
      body: {
        type: 'object',
        required: ['determinationNumber', 'transactionType', 'entityId', 'entityType', 'transactionDate', 'taxJurisdictions', 'lineItems', 'addresses', 'totalAmount', 'totalTaxableAmount', 'totalTaxAmount'],
        properties: {
          determinationNumber: { type: 'string' },
          transactionType: { type: 'string', enum: ['PURCHASE', 'SALE', 'IMPORT', 'EXPORT', 'SERVICE'] },
          status: { type: 'string', enum: ['DRAFT', 'CALCULATED', 'APPLIED', 'FILED', 'AMENDED'] },
          entityId: { type: 'string' },
          entityType: { type: 'string', enum: ['SUPPLIER', 'CUSTOMER', 'INTERNAL'] },
          transactionDate: { type: 'string', format: 'date-time' },
          taxJurisdictions: { type: 'array' },
          lineItems: { type: 'array' },
          addresses: { type: 'object' },
          totalAmount: { type: 'number' },
          totalTaxableAmount: { type: 'number' },
          totalTaxAmount: { type: 'number' },
          currency: { type: 'string' },
          exchangeRate: { type: 'number' },
          calculationMethod: { type: 'string', enum: ['AUTOMATIC', 'MANUAL', 'OVERRIDE'] },
          overrideReason: { type: 'string' },
          notes: { type: 'string' },
          attachments: { type: 'array' },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const data = createTaxDeterminationSchema.parse(request.body);
    const user = request.user as any;
    
    // Mock creation
    const newTaxDetermination = {
      id: `tax-det-${Date.now()}`,
      ...data,
      tenantId: user.tenantId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: user.id,
    };
    
    reply.status(201);
    return {
      ...newTaxDetermination,
      message: 'Tax determination created successfully',
    };
  });
  
  // Get all tax documents
  fastify.get('/tax-documents', {
    preHandler: hasPermissions(['view_tax_compliance']),
    schema: {
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'number', default: 1 },
          pageSize: { type: 'number', default: 10 },
          documentType: { type: 'string', enum: ['TAX_RETURN', 'TAX_CERTIFICATE', 'EXEMPTION_CERTIFICATE', 'COMPLIANCE_REPORT', 'AUDIT_REPORT'] },
          status: { type: 'string', enum: ['DRAFT', 'PENDING_REVIEW', 'APPROVED', 'FILED', 'REJECTED', 'AMENDED'] },
          jurisdiction: { type: 'string' },
          periodStartDate: { type: 'string', format: 'date-time' },
          periodEndDate: { type: 'string', format: 'date-time' },
          dueDateFrom: { type: 'string', format: 'date-time' },
          dueDateTo: { type: 'string', format: 'date-time' },
          search: { type: 'string' },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { 
      page = 1, 
      pageSize = 10, 
      documentType, 
      status, 
      jurisdiction,
      search 
    } = request.query as any;
    
    // Mock data for demonstration
    const mockTaxDocuments = Array.from({ length: 60 }, (_, i) => ({
      id: `tax-doc-${i + 1}`,
      documentNumber: `DOC-${new Date().getFullYear()}-${String(i + 1).padStart(6, '0')}`,
      documentType: ['TAX_RETURN', 'TAX_CERTIFICATE', 'EXEMPTION_CERTIFICATE', 'COMPLIANCE_REPORT', 'AUDIT_REPORT'][i % 5] as any,
      status: ['DRAFT', 'PENDING_REVIEW', 'APPROVED', 'FILED', 'REJECTED', 'AMENDED'][i % 6] as any,
      jurisdiction: ['Federal', 'California', 'New York', 'Texas', 'Florida'][i % 5],
      taxPeriod: {
        startDate: new Date(2024, (i % 12), 1).toISOString(),
        endDate: new Date(2024, (i % 12) + 1, 0).toISOString(),
        frequency: ['MONTHLY', 'QUARTERLY', 'ANNUALLY'][i % 3] as any,
      },
      dueDate: new Date(Date.now() + Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
      taxDue: Math.floor(Math.random() * 50000) + 1000,
      totalDue: Math.floor(Math.random() * 55000) + 1000,
      createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
    }));
    
    // Apply filters
    let filteredData = mockTaxDocuments;
    
    if (documentType) {
      filteredData = filteredData.filter(item => item.documentType === documentType);
    }
    
    if (status) {
      filteredData = filteredData.filter(item => item.status === status);
    }
    
    if (jurisdiction) {
      filteredData = filteredData.filter(item => item.jurisdiction.toLowerCase().includes(jurisdiction.toLowerCase()));
    }
    
    if (search) {
      filteredData = filteredData.filter(item => 
        item.documentNumber.toLowerCase().includes(search.toLowerCase()) ||
        item.jurisdiction.toLowerCase().includes(search.toLowerCase())
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
  
  // Get tax document by ID
  fastify.get('/tax-documents/:id', {
    preHandler: hasPermissions(['view_tax_compliance']),
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
    
    // Mock detailed tax document data
    const mockTaxDocument = {
      id,
      documentNumber: 'DOC-2024-000001',
      documentType: 'TAX_RETURN',
      status: 'FILED',
      taxPeriod: {
        startDate: '2024-01-01T00:00:00Z',
        endDate: '2024-03-31T23:59:59Z',
        frequency: 'QUARTERLY',
      },
      jurisdiction: {
        id: 'ca-state',
        name: 'California State',
        type: 'STATE',
        code: 'CA',
      },
      filingRequirements: {
        dueDate: '2024-04-30T23:59:59Z',
        filingMethod: 'ELECTRONIC',
        requiredForms: ['Form 401', 'Schedule A'],
        requiredAttachments: ['Sales Summary', 'Exemption Certificates'],
      },
      taxData: {
        grossSales: 1000000,
        taxableAmount: 950000,
        exemptAmount: 50000,
        taxDue: 68750,
        taxPaid: 68750,
        penalties: 0,
        interest: 0,
        totalDue: 68750,
      },
      filingDetails: {
        filedDate: '2024-04-25T10:30:00Z',
        filedBy: 'user-1',
        confirmationNumber: 'CA-2024-Q1-123456',
        paymentMethod: 'ACH',
        paymentReference: 'ACH-789012',
      },
      notes: 'Q1 2024 California sales tax return',
      attachments: [
        {
          name: 'CA_Q1_2024_Return.pdf',
          url: '/attachments/ca-q1-2024.pdf',
          type: 'application/pdf',
          size: 512000,
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: {
        id: 'user-1',
        name: 'John Doe',
        email: 'john.doe@example.com',
      },
    };
    
    return mockTaxDocument;
  });
  
  // Create tax document
  fastify.post('/tax-documents', {
    preHandler: hasPermissions(['create_tax_compliance']),
    schema: {
      body: {
        type: 'object',
        required: ['documentNumber', 'documentType', 'taxPeriod', 'jurisdiction', 'filingRequirements', 'taxData'],
        properties: {
          documentNumber: { type: 'string' },
          documentType: { type: 'string', enum: ['TAX_RETURN', 'TAX_CERTIFICATE', 'EXEMPTION_CERTIFICATE', 'COMPLIANCE_REPORT', 'AUDIT_REPORT'] },
          status: { type: 'string', enum: ['DRAFT', 'PENDING_REVIEW', 'APPROVED', 'FILED', 'REJECTED', 'AMENDED'] },
          taxPeriod: { type: 'object' },
          jurisdiction: { type: 'object' },
          filingRequirements: { type: 'object' },
          taxData: { type: 'object' },
          filingDetails: { type: 'object' },
          notes: { type: 'string' },
          attachments: { type: 'array' },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const data = createTaxDocumentSchema.parse(request.body);
    const user = request.user as any;
    
    // Mock creation
    const newTaxDocument = {
      id: `tax-doc-${Date.now()}`,
      ...data,
      tenantId: user.tenantId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: user.id,
    };
    
    reply.status(201);
    return {
      ...newTaxDocument,
      message: 'Tax document created successfully',
    };
  });
  
  // Get all tax reports
  fastify.get('/tax-reports', {
    preHandler: hasPermissions(['view_tax_compliance']),
    schema: {
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'number', default: 1 },
          pageSize: { type: 'number', default: 10 },
          reportType: { type: 'string', enum: ['SALES_TAX', 'USE_TAX', 'VAT', 'GST', 'INCOME_TAX', 'COMPLIANCE', 'AUDIT'] },
          status: { type: 'string', enum: ['DRAFT', 'GENERATING', 'COMPLETED', 'ERROR'] },
          periodStartDate: { type: 'string', format: 'date-time' },
          periodEndDate: { type: 'string', format: 'date-time' },
          search: { type: 'string' },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { 
      page = 1, 
      pageSize = 10, 
      reportType, 
      status,
      search 
    } = request.query as any;
    
    // Mock data for demonstration
    const mockTaxReports = Array.from({ length: 40 }, (_, i) => ({
      id: `tax-report-${i + 1}`,
      reportNumber: `REP-${new Date().getFullYear()}-${String(i + 1).padStart(6, '0')}`,
      reportType: ['SALES_TAX', 'USE_TAX', 'VAT', 'GST', 'INCOME_TAX', 'COMPLIANCE', 'AUDIT'][i % 7] as any,
      status: ['DRAFT', 'GENERATING', 'COMPLETED', 'ERROR'][i % 4] as any,
      reportPeriod: {
        startDate: new Date(2024, (i % 12), 1).toISOString(),
        endDate: new Date(2024, (i % 12) + 1, 0).toISOString(),
        frequency: ['MONTHLY', 'QUARTERLY', 'ANNUALLY'][i % 3] as any,
      },
      generatedDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      fileFormat: ['PDF', 'EXCEL', 'CSV', 'XML'][i % 4] as any,
      totalTransactions: Math.floor(Math.random() * 1000) + 100,
      totalAmount: Math.floor(Math.random() * 500000) + 50000,
      totalTaxAmount: Math.floor(Math.random() * 40000) + 4000,
      createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
    }));
    
    // Apply filters
    let filteredData = mockTaxReports;
    
    if (reportType) {
      filteredData = filteredData.filter(item => item.reportType === reportType);
    }
    
    if (status) {
      filteredData = filteredData.filter(item => item.status === status);
    }
    
    if (search) {
      filteredData = filteredData.filter(item => 
        item.reportNumber.toLowerCase().includes(search.toLowerCase())
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
  
  // Create tax report
  fastify.post('/tax-reports', {
    preHandler: hasPermissions(['create_tax_compliance']),
    schema: {
      body: {
        type: 'object',
        required: ['reportNumber', 'reportType', 'reportPeriod'],
        properties: {
          reportNumber: { type: 'string' },
          reportType: { type: 'string', enum: ['SALES_TAX', 'USE_TAX', 'VAT', 'GST', 'INCOME_TAX', 'COMPLIANCE', 'AUDIT'] },
          status: { type: 'string', enum: ['DRAFT', 'GENERATING', 'COMPLETED', 'ERROR'] },
          reportPeriod: { type: 'object' },
          filters: { type: 'object' },
          reportData: { type: 'object' },
          generatedDate: { type: 'string', format: 'date-time' },
          fileUrl: { type: 'string' },
          fileFormat: { type: 'string', enum: ['PDF', 'EXCEL', 'CSV', 'XML'] },
          notes: { type: 'string' },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const data = createTaxReportSchema.parse(request.body);
    const user = request.user as any;
    
    // Mock creation
    const newTaxReport = {
      id: `tax-report-${Date.now()}`,
      ...data,
      tenantId: user.tenantId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: user.id,
    };
    
    reply.status(201);
    return {
      ...newTaxReport,
      message: 'Tax report created successfully',
    };
  });
  
  // Get tax compliance analytics
  fastify.get('/tax-compliance/analytics', {
    preHandler: hasPermissions(['view_reports']),
    schema: {
      querystring: {
        type: 'object',
        properties: {
          startDate: { type: 'string', format: 'date-time' },
          endDate: { type: 'string', format: 'date-time' },
          jurisdiction: { type: 'string' },
          transactionType: { type: 'string' },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    // Mock analytics data
    const analytics = {
      summary: {
        totalDeterminations: 1250,
        totalTaxAmount: 485000,
        totalDocuments: 156,
        totalReports: 45,
        complianceRate: 96.8,
        averageTaxRate: 8.2,
      },
      byJurisdiction: [
        { jurisdiction: 'Federal', determinations: 450, taxAmount: 125000, rate: 0 },
        { jurisdiction: 'California', determinations: 350, taxAmount: 185000, rate: 7.25 },
        { jurisdiction: 'New York', determinations: 280, taxAmount: 125000, rate: 8.0 },
        { jurisdiction: 'Texas', determinations: 170, taxAmount: 50000, rate: 6.25 },
      ],
      byTransactionType: [
        { type: 'SALE', count: 680, taxAmount: 285000 },
        { type: 'PURCHASE', count: 420, taxAmount: 145000 },
        { type: 'SERVICE', count: 150, taxAmount: 55000 },
      ],
      complianceStatus: [
        { status: 'COMPLIANT', count: 1210 },
        { status: 'PENDING', count: 35 },
        { status: 'NON_COMPLIANT', count: 5 },
      ],
      timeline: Array.from({ length: 12 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - 11 + i);
        return {
          month: date.toISOString().slice(0, 7),
          determinations: Math.floor(Math.random() * 150) + 50,
          taxAmount: Math.floor(Math.random() * 50000) + 20000,
          documents: Math.floor(Math.random() * 20) + 5,
        };
      }),
      upcomingDeadlines: [
        {
          documentId: 'doc-1',
          documentNumber: 'DOC-2024-000123',
          type: 'TAX_RETURN',
          jurisdiction: 'California',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'PENDING_REVIEW',
        },
        {
          documentId: 'doc-2',
          documentNumber: 'DOC-2024-000124',
          type: 'TAX_RETURN',
          jurisdiction: 'New York',
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'DRAFT',
        },
      ],
    };
    
    return analytics;
  });
} 