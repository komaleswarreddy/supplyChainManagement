import { z } from 'zod';
import { apiClient } from '@/lib/api-client';

// Zod Schemas
export const InvoiceSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  invoiceNumber: z.string(),
  type: z.enum(['PURCHASE', 'SALES', 'CREDIT_NOTE', 'DEBIT_NOTE']),
  status: z.enum(['DRAFT', 'PENDING', 'APPROVED', 'PAID', 'OVERDUE', 'CANCELLED', 'DISPUTED']),
  supplierId: z.string().uuid().optional(),
  customerId: z.string().uuid().optional(),
  purchaseOrderId: z.string().uuid().optional(),
  contractId: z.string().uuid().optional(),
  invoiceDate: z.string().datetime(),
  dueDate: z.string().datetime(),
  paymentTerms: z.string().optional(),
  currency: z.string(),
  exchangeRate: z.number(),
  subtotal: z.number(),
  taxAmount: z.number(),
  discountAmount: z.number(),
  shippingAmount: z.number(),
  totalAmount: z.number(),
  paidAmount: z.number(),
  balanceAmount: z.number(),
  billingAddress: z.record(z.any()),
  shippingAddress: z.record(z.any()).optional(),
  notes: z.string().optional(),
  attachments: z.array(z.record(z.any())).optional(),
  metadata: z.record(z.any()).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  createdBy: z.string().uuid(),
  updatedBy: z.string().uuid().optional(),
});

export const InvoiceItemSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  invoiceId: z.string().uuid(),
  lineNumber: z.number(),
  itemId: z.string().uuid().optional(),
  description: z.string(),
  quantity: z.number(),
  unitPrice: z.number(),
  discount: z.number(),
  taxRate: z.number(),
  lineTotal: z.number(),
  accountCode: z.string().optional(),
  costCenter: z.string().optional(),
  projectCode: z.string().optional(),
  metadata: z.record(z.any()).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const InvoicePaymentSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  invoiceId: z.string().uuid(),
  paymentNumber: z.string(),
  paymentDate: z.string().datetime(),
  amount: z.number(),
  currency: z.string(),
  exchangeRate: z.number(),
  paymentMethod: z.enum(['BANK_TRANSFER', 'CHECK', 'CREDIT_CARD', 'CASH', 'ACH', 'WIRE', 'OTHER']),
  referenceNumber: z.string().optional(),
  bankAccount: z.string().optional(),
  notes: z.string().optional(),
  attachments: z.array(z.record(z.any())).optional(),
  metadata: z.record(z.any()).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  createdBy: z.string().uuid(),
  updatedBy: z.string().uuid().optional(),
});

export const InvoiceDisputeSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  invoiceId: z.string().uuid(),
  disputeNumber: z.string(),
  type: z.enum(['PRICING', 'QUANTITY', 'QUALITY', 'DELIVERY', 'BILLING_ERROR', 'OTHER']),
  status: z.enum(['OPEN', 'UNDER_REVIEW', 'RESOLVED', 'ESCALATED', 'CLOSED']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  description: z.string(),
  disputedAmount: z.number().optional(),
  resolution: z.string().optional(),
  resolutionDate: z.string().datetime().optional(),
  attachments: z.array(z.record(z.any())).optional(),
  metadata: z.record(z.any()).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  createdBy: z.string().uuid(),
  updatedBy: z.string().uuid().optional(),
  assignedTo: z.string().uuid().optional(),
});

export const InvoiceTemplateSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  name: z.string(),
  description: z.string().optional(),
  type: z.enum(['PURCHASE', 'SALES', 'CREDIT_NOTE', 'DEBIT_NOTE']),
  template: z.record(z.any()),
  isDefault: z.boolean(),
  isActive: z.boolean(),
  metadata: z.record(z.any()).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  createdBy: z.string().uuid(),
  updatedBy: z.string().uuid().optional(),
});

// Create/Update Schemas
export const CreateInvoiceSchema = InvoiceSchema.omit({
  id: true,
  tenantId: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
  updatedBy: true,
});

export const UpdateInvoiceSchema = CreateInvoiceSchema.partial();

export const CreateInvoiceItemSchema = InvoiceItemSchema.omit({
  id: true,
  tenantId: true,
  createdAt: true,
  updatedAt: true,
});

export const CreateInvoicePaymentSchema = InvoicePaymentSchema.omit({
  id: true,
  tenantId: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
  updatedBy: true,
});

export const CreateInvoiceDisputeSchema = InvoiceDisputeSchema.omit({
  id: true,
  tenantId: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
  updatedBy: true,
});

export const CreateInvoiceTemplateSchema = InvoiceTemplateSchema.omit({
  id: true,
  tenantId: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
  updatedBy: true,
});

// Types
export type Invoice = z.infer<typeof InvoiceSchema>;
export type InvoiceItem = z.infer<typeof InvoiceItemSchema>;
export type InvoicePayment = z.infer<typeof InvoicePaymentSchema>;
export type InvoiceDispute = z.infer<typeof InvoiceDisputeSchema>;
export type InvoiceTemplate = z.infer<typeof InvoiceTemplateSchema>;
export type CreateInvoice = z.infer<typeof CreateInvoiceSchema>;
export type UpdateInvoice = z.infer<typeof UpdateInvoiceSchema>;
export type CreateInvoiceItem = z.infer<typeof CreateInvoiceItemSchema>;
export type CreateInvoicePayment = z.infer<typeof CreateInvoicePaymentSchema>;
export type CreateInvoiceDispute = z.infer<typeof CreateInvoiceDisputeSchema>;
export type CreateInvoiceTemplate = z.infer<typeof CreateInvoiceTemplateSchema>;

// API Client Functions
export const invoiceAPI = {
  // Invoices
  getAll: async (params?: { page?: number; limit?: number; search?: string; status?: string; type?: string }) => {
    const response = await apiClient.get('/api/invoices', { params });
    return z.array(InvoiceSchema).parse(response.data);
  },

  getById: async (id: string) => {
    const response = await apiClient.get(`/api/invoices/${id}`);
    return InvoiceSchema.parse(response.data);
  },

  create: async (data: CreateInvoice) => {
    const response = await apiClient.post('/api/invoices', data);
    return InvoiceSchema.parse(response.data);
  },

  update: async (id: string, data: UpdateInvoice) => {
    const response = await apiClient.put(`/api/invoices/${id}`, data);
    return InvoiceSchema.parse(response.data);
  },

  delete: async (id: string) => {
    await apiClient.delete(`/api/invoices/${id}`);
  },

  approve: async (id: string) => {
    const response = await apiClient.post(`/api/invoices/${id}/approve`);
    return InvoiceSchema.parse(response.data);
  },

  // Invoice Items
  getItems: async (invoiceId: string) => {
    const response = await apiClient.get(`/api/invoices/${invoiceId}/items`);
    return z.array(InvoiceItemSchema).parse(response.data);
  },

  addItem: async (invoiceId: string, data: CreateInvoiceItem) => {
    const response = await apiClient.post(`/api/invoices/${invoiceId}/items`, data);
    return InvoiceItemSchema.parse(response.data);
  },

  updateItem: async (invoiceId: string, itemId: string, data: Partial<CreateInvoiceItem>) => {
    const response = await apiClient.put(`/api/invoices/${invoiceId}/items/${itemId}`, data);
    return InvoiceItemSchema.parse(response.data);
  },

  deleteItem: async (invoiceId: string, itemId: string) => {
    await apiClient.delete(`/api/invoices/${invoiceId}/items/${itemId}`);
  },

  // Invoice Payments
  getPayments: async (invoiceId: string) => {
    const response = await apiClient.get(`/api/invoices/${invoiceId}/payments`);
    return z.array(InvoicePaymentSchema).parse(response.data);
  },

  addPayment: async (invoiceId: string, data: CreateInvoicePayment) => {
    const response = await apiClient.post(`/api/invoices/${invoiceId}/payments`, data);
    return InvoicePaymentSchema.parse(response.data);
  },

  // Invoice Disputes
  getDisputes: async (invoiceId: string) => {
    const response = await apiClient.get(`/api/invoices/${invoiceId}/disputes`);
    return z.array(InvoiceDisputeSchema).parse(response.data);
  },

  createDispute: async (invoiceId: string, data: CreateInvoiceDispute) => {
    const response = await apiClient.post(`/api/invoices/${invoiceId}/disputes`, data);
    return InvoiceDisputeSchema.parse(response.data);
  },

  updateDispute: async (invoiceId: string, disputeId: string, data: Partial<CreateInvoiceDispute>) => {
    const response = await apiClient.put(`/api/invoices/${invoiceId}/disputes/${disputeId}`, data);
    return InvoiceDisputeSchema.parse(response.data);
  },

  // Invoice Templates
  getTemplates: async () => {
    const response = await apiClient.get('/api/invoices/templates');
    return z.array(InvoiceTemplateSchema).parse(response.data);
  },

  getTemplateById: async (id: string) => {
    const response = await apiClient.get(`/api/invoices/templates/${id}`);
    return InvoiceTemplateSchema.parse(response.data);
  },

  createTemplate: async (data: CreateInvoiceTemplate) => {
    const response = await apiClient.post('/api/invoices/templates', data);
    return InvoiceTemplateSchema.parse(response.data);
  },

  updateTemplate: async (id: string, data: Partial<CreateInvoiceTemplate>) => {
    const response = await apiClient.put(`/api/invoices/templates/${id}`, data);
    return InvoiceTemplateSchema.parse(response.data);
  },

  deleteTemplate: async (id: string) => {
    await apiClient.delete(`/api/invoices/templates/${id}`);
  },
};

export const invoiceAnalyticsAPI = {
  getDashboard: async (params?: { startDate?: string; endDate?: string }) => {
    const response = await apiClient.get('/api/invoices/analytics/dashboard', { params });
    return z.record(z.any()).parse(response.data);
  },

  getMetrics: async (params?: { startDate?: string; endDate?: string; groupBy?: string }) => {
    const response = await apiClient.get('/api/invoices/analytics/metrics', { params });
    return z.record(z.any()).parse(response.data);
  },

  getReports: async (params?: { startDate?: string; endDate?: string; type?: string }) => {
    const response = await apiClient.get('/api/invoices/analytics/reports', { params });
    return z.record(z.any()).parse(response.data);
  },
}; 