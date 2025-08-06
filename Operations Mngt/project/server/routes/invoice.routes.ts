import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { db } from '../db';
import { eq, and, or, like, desc, asc, gte, lte, sum } from 'drizzle-orm';
import { AppError } from '../utils/app-error';
import { authenticate, hasPermissions } from '../middleware/auth';

// Define route schemas
const createInvoiceSchema = z.object({
  invoiceNumber: z.string().min(1, 'Invoice number is required'),
  type: z.enum(['PURCHASE', 'SALES', 'CREDIT_NOTE', 'DEBIT_NOTE']),
  status: z.enum(['DRAFT', 'PENDING', 'APPROVED', 'PAID', 'OVERDUE', 'CANCELLED', 'DISPUTED']).default('DRAFT'),
  supplierId: z.string().uuid().optional(),
  customerId: z.string().uuid().optional(),
  purchaseOrderId: z.string().uuid().optional(),
  contractId: z.string().uuid().optional(),
  invoiceDate: z.string().datetime(),
  dueDate: z.string().datetime(),
  paymentTerms: z.string().optional(),
  currency: z.string().default('USD'),
  exchangeRate: z.number().positive().default(1),
  subtotal: z.number().min(0),
  taxAmount: z.number().min(0).default(0),
  discountAmount: z.number().min(0).default(0),
  shippingAmount: z.number().min(0).default(0),
  totalAmount: z.number().min(0),
  paidAmount: z.number().min(0).default(0),
  balanceAmount: z.number().min(0),
  lineItems: z.array(z.object({
    id: z.string().optional(),
    itemId: z.string().uuid().optional(),
    description: z.string().min(1),
    quantity: z.number().positive(),
    unitPrice: z.number().min(0),
    discount: z.number().min(0).default(0),
    taxRate: z.number().min(0).default(0),
    lineTotal: z.number().min(0),
    accountCode: z.string().optional(),
    costCenter: z.string().optional(),
    projectCode: z.string().optional(),
  })),
  taxDetails: z.array(z.object({
    taxType: z.string(),
    taxRate: z.number().min(0),
    taxableAmount: z.number().min(0),
    taxAmount: z.number().min(0),
  })).optional(),
  billingAddress: z.object({
    name: z.string(),
    street: z.string(),
    city: z.string(),
    state: z.string().optional(),
    country: z.string(),
    postalCode: z.string(),
  }),
  shippingAddress: z.object({
    name: z.string(),
    street: z.string(),
    city: z.string(),
    state: z.string().optional(),
    country: z.string(),
    postalCode: z.string(),
  }).optional(),
  notes: z.string().optional(),
  attachments: z.array(z.object({
    name: z.string(),
    url: z.string(),
    type: z.string(),
    size: z.number(),
  })).optional(),
});

const updateInvoiceSchema = createInvoiceSchema.partial().omit({ invoiceNumber: true });

const createPaymentSchema = z.object({
  invoiceId: z.string().uuid(),
  paymentNumber: z.string().min(1, 'Payment number is required'),
  paymentDate: z.string().datetime(),
  amount: z.number().positive(),
  currency: z.string().default('USD'),
  exchangeRate: z.number().positive().default(1),
  paymentMethod: z.enum(['BANK_TRANSFER', 'CHECK', 'CREDIT_CARD', 'CASH', 'ACH', 'WIRE', 'OTHER']),
  referenceNumber: z.string().optional(),
  bankAccount: z.string().optional(),
  notes: z.string().optional(),
  attachments: z.array(z.object({
    name: z.string(),
    url: z.string(),
    type: z.string(),
    size: z.number(),
  })).optional(),
});

const createDisputeSchema = z.object({
  invoiceId: z.string().uuid(),
  disputeNumber: z.string().min(1, 'Dispute number is required'),
  type: z.enum(['PRICING', 'QUANTITY', 'QUALITY', 'DELIVERY', 'BILLING_ERROR', 'OTHER']),
  status: z.enum(['OPEN', 'UNDER_REVIEW', 'RESOLVED', 'ESCALATED', 'CLOSED']).default('OPEN'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
  description: z.string().min(1, 'Description is required'),
  disputedAmount: z.number().positive(),
  currency: z.string().default('USD'),
  reasonCode: z.string().optional(),
  expectedResolution: z.string().datetime().optional(),
  assignedTo: z.string().uuid().optional(),
  resolution: z.string().optional(),
  resolutionAmount: z.number().min(0).optional(),
  attachments: z.array(z.object({
    name: z.string(),
    url: z.string(),
    type: z.string(),
    size: z.number(),
  })).optional(),
});

// Invoice routes
export default async function invoiceRoutes(fastify: FastifyInstance) {
  // Apply authentication middleware to all routes
  fastify.addHook('preHandler', authenticate);
  
  // Get all invoices
  fastify.get('/invoices', {
    preHandler: hasPermissions(['view_invoices']),
    schema: {
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'number', default: 1 },
          pageSize: { type: 'number', default: 10 },
          type: { type: 'string', enum: ['PURCHASE', 'SALES', 'CREDIT_NOTE', 'DEBIT_NOTE'] },
          status: { type: 'string', enum: ['DRAFT', 'PENDING', 'APPROVED', 'PAID', 'OVERDUE', 'CANCELLED', 'DISPUTED'] },
          supplierId: { type: 'string' },
          customerId: { type: 'string' },
          invoiceDateFrom: { type: 'string', format: 'date-time' },
          invoiceDateTo: { type: 'string', format: 'date-time' },
          dueDateFrom: { type: 'string', format: 'date-time' },
          dueDateTo: { type: 'string', format: 'date-time' },
          minAmount: { type: 'number' },
          maxAmount: { type: 'number' },
          currency: { type: 'string' },
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
                  invoiceNumber: { type: 'string' },
                  type: { type: 'string' },
                  status: { type: 'string' },
                  supplierName: { type: 'string' },
                  customerName: { type: 'string' },
                  invoiceDate: { type: 'string', format: 'date-time' },
                  dueDate: { type: 'string', format: 'date-time' },
                  totalAmount: { type: 'number' },
                  paidAmount: { type: 'number' },
                  balanceAmount: { type: 'number' },
                  currency: { type: 'string' },
                  overdueDays: { type: 'number' },
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
                totalInvoices: { type: 'number' },
                totalAmount: { type: 'number' },
                paidAmount: { type: 'number' },
                outstandingAmount: { type: 'number' },
                overdueAmount: { type: 'number' },
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
      type, 
      status, 
      supplierId, 
      customerId,
      search 
    } = request.query as any;
    
    // Mock data for demonstration
    const mockInvoiceData = Array.from({ length: 100 }, (_, i) => {
      const invoiceDate = new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000);
      const dueDate = new Date(invoiceDate.getTime() + Math.random() * 60 * 24 * 60 * 60 * 1000);
      const totalAmount = Math.floor(Math.random() * 50000) + 1000;
      const paidAmount = Math.random() > 0.3 ? Math.floor(totalAmount * Math.random()) : 0;
      const balanceAmount = totalAmount - paidAmount;
      const overdueDays = dueDate < new Date() ? Math.floor((Date.now() - dueDate.getTime()) / (24 * 60 * 60 * 1000)) : 0;
      
      return {
        id: `invoice-${i + 1}`,
        invoiceNumber: `INV-${new Date().getFullYear()}-${String(i + 1).padStart(6, '0')}`,
        type: ['PURCHASE', 'SALES', 'CREDIT_NOTE', 'DEBIT_NOTE'][i % 4] as any,
        status: balanceAmount === 0 ? 'PAID' : overdueDays > 0 ? 'OVERDUE' : ['DRAFT', 'PENDING', 'APPROVED'][i % 3] as any,
        supplierId: `supplier-${(i % 10) + 1}`,
        supplierName: `Supplier ${(i % 10) + 1}`,
        customerId: `customer-${(i % 15) + 1}`,
        customerName: `Customer ${(i % 15) + 1}`,
        invoiceDate: invoiceDate.toISOString(),
        dueDate: dueDate.toISOString(),
        totalAmount,
        paidAmount,
        balanceAmount,
        currency: 'USD',
        overdueDays: Math.max(0, overdueDays),
        createdAt: invoiceDate.toISOString(),
      };
    });
    
    // Apply filters
    let filteredData = mockInvoiceData;
    
    if (type) {
      filteredData = filteredData.filter(item => item.type === type);
    }
    
    if (status) {
      filteredData = filteredData.filter(item => item.status === status);
    }
    
    if (supplierId) {
      filteredData = filteredData.filter(item => item.supplierId === supplierId);
    }
    
    if (customerId) {
      filteredData = filteredData.filter(item => item.customerId === customerId);
    }
    
    if (search) {
      filteredData = filteredData.filter(item => 
        item.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
        item.supplierName.toLowerCase().includes(search.toLowerCase()) ||
        item.customerName.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    const total = filteredData.length;
    const totalPages = Math.ceil(total / pageSize);
    const offset = (page - 1) * pageSize;
    const items = filteredData.slice(offset, offset + pageSize);
    
    // Calculate summary
    const summary = {
      totalInvoices: filteredData.length,
      totalAmount: filteredData.reduce((sum, item) => sum + item.totalAmount, 0),
      paidAmount: filteredData.reduce((sum, item) => sum + item.paidAmount, 0),
      outstandingAmount: filteredData.reduce((sum, item) => sum + item.balanceAmount, 0),
      overdueAmount: filteredData.filter(item => item.overdueDays > 0).reduce((sum, item) => sum + item.balanceAmount, 0),
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
  
  // Get invoice by ID
  fastify.get('/invoices/:id', {
    preHandler: hasPermissions(['view_invoices']),
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
    
    // Mock detailed invoice data
    const mockInvoice = {
      id,
      invoiceNumber: 'INV-2024-000001',
      type: 'PURCHASE',
      status: 'APPROVED',
      supplierId: 'supplier-1',
      supplierName: 'Tech Solutions Inc.',
      customerId: undefined,
      customerName: undefined,
      purchaseOrderId: 'po-001',
      contractId: 'contract-001',
      invoiceDate: new Date().toISOString(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      paymentTerms: 'Net 30',
      currency: 'USD',
      exchangeRate: 1,
      subtotal: 10000,
      taxAmount: 800,
      discountAmount: 200,
      shippingAmount: 150,
      totalAmount: 10750,
      paidAmount: 0,
      balanceAmount: 10750,
      lineItems: [
        {
          id: 'line-1',
          itemId: 'item-1',
          description: 'Laptop Computer - Dell XPS 13',
          quantity: 5,
          unitPrice: 1200,
          discount: 0,
          taxRate: 8,
          lineTotal: 6000,
          accountCode: '1200',
          costCenter: 'IT',
          projectCode: 'PRJ-001',
        },
        {
          id: 'line-2',
          itemId: 'item-2',
          description: 'Software License - Microsoft Office',
          quantity: 10,
          unitPrice: 400,
          discount: 200,
          taxRate: 8,
          lineTotal: 3800,
          accountCode: '1300',
          costCenter: 'IT',
          projectCode: 'PRJ-001',
        },
      ],
      taxDetails: [
        {
          taxType: 'Sales Tax',
          taxRate: 8,
          taxableAmount: 10000,
          taxAmount: 800,
        },
      ],
      billingAddress: {
        name: 'Our Company Ltd.',
        street: '123 Business Ave',
        city: 'Business City',
        state: 'BC',
        country: 'USA',
        postalCode: '12345',
      },
      shippingAddress: {
        name: 'Our Company Ltd. - Warehouse',
        street: '456 Warehouse St',
        city: 'Warehouse City',
        state: 'WC',
        country: 'USA',
        postalCode: '54321',
      },
      notes: 'Quarterly IT equipment procurement',
      attachments: [
        {
          name: 'invoice_001.pdf',
          url: '/attachments/invoice_001.pdf',
          type: 'application/pdf',
          size: 1024576,
        },
      ],
      payments: [
        // Will be populated by payment history
      ],
      disputes: [
        // Will be populated by dispute history
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: {
        id: 'user-1',
        name: 'John Doe',
        email: 'john.doe@example.com',
      },
    };
    
    return mockInvoice;
  });
  
  // Create invoice
  fastify.post('/invoices', {
    preHandler: hasPermissions(['create_invoices']),
    schema: {
      body: {
        type: 'object',
        required: ['invoiceNumber', 'type', 'invoiceDate', 'dueDate', 'subtotal', 'totalAmount', 'lineItems', 'billingAddress'],
        properties: {
          invoiceNumber: { type: 'string' },
          type: { type: 'string', enum: ['PURCHASE', 'SALES', 'CREDIT_NOTE', 'DEBIT_NOTE'] },
          status: { type: 'string', enum: ['DRAFT', 'PENDING', 'APPROVED', 'PAID', 'OVERDUE', 'CANCELLED', 'DISPUTED'] },
          supplierId: { type: 'string' },
          customerId: { type: 'string' },
          purchaseOrderId: { type: 'string' },
          contractId: { type: 'string' },
          invoiceDate: { type: 'string', format: 'date-time' },
          dueDate: { type: 'string', format: 'date-time' },
          paymentTerms: { type: 'string' },
          currency: { type: 'string' },
          exchangeRate: { type: 'number' },
          subtotal: { type: 'number' },
          taxAmount: { type: 'number' },
          discountAmount: { type: 'number' },
          shippingAmount: { type: 'number' },
          totalAmount: { type: 'number' },
          lineItems: { type: 'array' },
          taxDetails: { type: 'array' },
          billingAddress: { type: 'object' },
          shippingAddress: { type: 'object' },
          notes: { type: 'string' },
          attachments: { type: 'array' },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const data = createInvoiceSchema.parse(request.body);
    const user = request.user as any;
    
    // Mock creation
    const newInvoice = {
      id: `invoice-${Date.now()}`,
      ...data,
      paidAmount: 0,
      balanceAmount: data.totalAmount,
      tenantId: user.tenantId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: user.id,
    };
    
    reply.status(201);
    return {
      ...newInvoice,
      message: 'Invoice created successfully',
    };
  });
  
  // Update invoice
  fastify.put('/invoices/:id', {
    preHandler: hasPermissions(['edit_invoices']),
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
          type: { type: 'string', enum: ['PURCHASE', 'SALES', 'CREDIT_NOTE', 'DEBIT_NOTE'] },
          status: { type: 'string', enum: ['DRAFT', 'PENDING', 'APPROVED', 'PAID', 'OVERDUE', 'CANCELLED', 'DISPUTED'] },
          supplierId: { type: 'string' },
          customerId: { type: 'string' },
          purchaseOrderId: { type: 'string' },
          contractId: { type: 'string' },
          invoiceDate: { type: 'string', format: 'date-time' },
          dueDate: { type: 'string', format: 'date-time' },
          paymentTerms: { type: 'string' },
          currency: { type: 'string' },
          exchangeRate: { type: 'number' },
          subtotal: { type: 'number' },
          taxAmount: { type: 'number' },
          discountAmount: { type: 'number' },
          shippingAmount: { type: 'number' },
          totalAmount: { type: 'number' },
          lineItems: { type: 'array' },
          taxDetails: { type: 'array' },
          billingAddress: { type: 'object' },
          shippingAddress: { type: 'object' },
          notes: { type: 'string' },
          attachments: { type: 'array' },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const data = updateInvoiceSchema.parse(request.body);
    const user = request.user as any;
    
    // Mock update
    const updatedInvoice = {
      id,
      ...data,
      updatedAt: new Date().toISOString(),
      updatedBy: user.id,
    };
    
    return {
      ...updatedInvoice,
      message: 'Invoice updated successfully',
    };
  });
  
  // Delete invoice
  fastify.delete('/invoices/:id', {
    preHandler: hasPermissions(['delete_invoices']),
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
    
    return { message: 'Invoice deleted successfully' };
  });
  
  // Get invoice payments
  fastify.get('/invoices/:id/payments', {
    preHandler: hasPermissions(['view_invoices']),
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
    
    // Mock payment data
    const mockPayments = [
      {
        id: 'payment-1',
        invoiceId: id,
        paymentNumber: 'PAY-2024-000001',
        paymentDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        amount: 5000,
        currency: 'USD',
        exchangeRate: 1,
        paymentMethod: 'BANK_TRANSFER',
        referenceNumber: 'TXN-123456',
        bankAccount: 'ACC-001',
        notes: 'Partial payment',
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        createdBy: {
          id: 'user-1',
          name: 'John Doe',
          email: 'john.doe@example.com',
        },
      },
    ];
    
    return { items: mockPayments };
  });
  
  // Create payment
  fastify.post('/invoices/:id/payments', {
    preHandler: hasPermissions(['create_payments']),
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
        required: ['paymentNumber', 'paymentDate', 'amount', 'paymentMethod'],
        properties: {
          paymentNumber: { type: 'string' },
          paymentDate: { type: 'string', format: 'date-time' },
          amount: { type: 'number' },
          currency: { type: 'string' },
          exchangeRate: { type: 'number' },
          paymentMethod: { type: 'string', enum: ['BANK_TRANSFER', 'CHECK', 'CREDIT_CARD', 'CASH', 'ACH', 'WIRE', 'OTHER'] },
          referenceNumber: { type: 'string' },
          bankAccount: { type: 'string' },
          notes: { type: 'string' },
          attachments: { type: 'array' },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const data = createPaymentSchema.parse({ ...request.body, invoiceId: id });
    const user = request.user as any;
    
    // Mock creation
    const newPayment = {
      id: `payment-${Date.now()}`,
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: user.id,
    };
    
    reply.status(201);
    return {
      ...newPayment,
      message: 'Payment recorded successfully',
    };
  });
  
  // Get invoice disputes
  fastify.get('/invoices/:id/disputes', {
    preHandler: hasPermissions(['view_invoices']),
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
    
    // Mock dispute data
    const mockDisputes = [
      {
        id: 'dispute-1',
        invoiceId: id,
        disputeNumber: 'DISP-2024-000001',
        type: 'PRICING',
        status: 'UNDER_REVIEW',
        priority: 'HIGH',
        description: 'Unit price discrepancy on line item 2',
        disputedAmount: 500,
        currency: 'USD',
        reasonCode: 'PRICE_MISMATCH',
        expectedResolution: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        assignedTo: 'user-2',
        assignedToName: 'Jane Smith',
        resolution: null,
        resolutionAmount: null,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        createdBy: {
          id: 'user-1',
          name: 'John Doe',
          email: 'john.doe@example.com',
        },
      },
    ];
    
    return { items: mockDisputes };
  });
  
  // Create dispute
  fastify.post('/invoices/:id/disputes', {
    preHandler: hasPermissions(['create_disputes']),
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
        required: ['disputeNumber', 'type', 'description', 'disputedAmount'],
        properties: {
          disputeNumber: { type: 'string' },
          type: { type: 'string', enum: ['PRICING', 'QUANTITY', 'QUALITY', 'DELIVERY', 'BILLING_ERROR', 'OTHER'] },
          status: { type: 'string', enum: ['OPEN', 'UNDER_REVIEW', 'RESOLVED', 'ESCALATED', 'CLOSED'] },
          priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] },
          description: { type: 'string' },
          disputedAmount: { type: 'number' },
          currency: { type: 'string' },
          reasonCode: { type: 'string' },
          expectedResolution: { type: 'string', format: 'date-time' },
          assignedTo: { type: 'string' },
          resolution: { type: 'string' },
          resolutionAmount: { type: 'number' },
          attachments: { type: 'array' },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const data = createDisputeSchema.parse({ ...request.body, invoiceId: id });
    const user = request.user as any;
    
    // Mock creation
    const newDispute = {
      id: `dispute-${Date.now()}`,
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: user.id,
    };
    
    reply.status(201);
    return {
      ...newDispute,
      message: 'Dispute created successfully',
    };
  });
  
  // Get invoice analytics
  fastify.get('/invoices/analytics', {
    preHandler: hasPermissions(['view_reports']),
    schema: {
      querystring: {
        type: 'object',
        properties: {
          startDate: { type: 'string', format: 'date-time' },
          endDate: { type: 'string', format: 'date-time' },
          type: { type: 'string', enum: ['PURCHASE', 'SALES', 'CREDIT_NOTE', 'DEBIT_NOTE'] },
          currency: { type: 'string' },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    // Mock analytics data
    const analytics = {
      summary: {
        totalInvoices: 1250,
        totalAmount: 5420000,
        paidAmount: 4890000,
        outstandingAmount: 530000,
        overdueAmount: 125000,
        averagePaymentDays: 28.5,
        paymentSuccessRate: 94.2,
      },
      byType: [
        { type: 'PURCHASE', count: 650, amount: 2800000 },
        { type: 'SALES', count: 580, amount: 2500000 },
        { type: 'CREDIT_NOTE', count: 15, amount: -80000 },
        { type: 'DEBIT_NOTE', count: 5, amount: 200000 },
      ],
      byStatus: [
        { status: 'DRAFT', count: 25, amount: 125000 },
        { status: 'PENDING', count: 45, amount: 280000 },
        { status: 'APPROVED', count: 85, amount: 520000 },
        { status: 'PAID', count: 1050, amount: 4890000 },
        { status: 'OVERDUE', count: 35, amount: 125000 },
        { status: 'DISPUTED', count: 8, amount: 45000 },
        { status: 'CANCELLED', count: 2, amount: 15000 },
      ],
      agingAnalysis: [
        { range: '0-30 days', count: 180, amount: 405000 },
        { range: '31-60 days', count: 45, amount: 85000 },
        { range: '61-90 days', count: 20, amount: 32000 },
        { range: '90+ days', count: 15, amount: 28000 },
      ],
      timeline: Array.from({ length: 12 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - 11 + i);
        return {
          month: date.toISOString().slice(0, 7),
          invoices: Math.floor(Math.random() * 150) + 50,
          amount: Math.floor(Math.random() * 500000) + 200000,
          payments: Math.floor(Math.random() * 450000) + 180000,
        };
      }),
      topSuppliers: [
        { id: 'supplier-1', name: 'Tech Solutions Inc.', invoices: 45, amount: 450000 },
        { id: 'supplier-2', name: 'Office Supplies Co.', invoices: 38, amount: 280000 },
        { id: 'supplier-3', name: 'Manufacturing Ltd.', invoices: 32, amount: 520000 },
        { id: 'supplier-4', name: 'Service Provider Inc.', invoices: 28, amount: 180000 },
        { id: 'supplier-5', name: 'Equipment Rental Co.', invoices: 25, amount: 320000 },
      ],
    };
    
    return analytics;
  });
} 