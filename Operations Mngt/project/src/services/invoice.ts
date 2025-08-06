import { api } from '@/lib/api';
import type { ApiResponse, PaginatedResponse, PaginationParams } from '@/types/common';

// Types for Invoice service
export interface Invoice {
  id: string;
  invoiceNumber: string;
  type: 'PURCHASE' | 'SALES' | 'CREDIT_NOTE' | 'DEBIT_NOTE';
  status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'PAID' | 'OVERDUE' | 'CANCELLED' | 'DISPUTED';
  supplierId?: string;
  supplierName?: string;
  customerId?: string;
  customerName?: string;
  purchaseOrderId?: string;
  contractId?: string;
  invoiceDate: string;
  dueDate: string;
  paymentTerms?: string;
  currency: string;
  exchangeRate: number;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  shippingAmount: number;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  overdueDays?: number;
  lineItems: InvoiceLineItem[];
  taxDetails?: TaxDetail[];
  billingAddress: Address;
  shippingAddress?: Address;
  notes?: string;
  attachments?: DocumentAttachment[];
  payments?: Payment[];
  disputes?: Dispute[];
  createdAt: string;
  updatedAt: string;
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
}

export interface InvoiceLineItem {
  id: string;
  itemId?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  taxRate: number;
  lineTotal: number;
  accountCode?: string;
  costCenter?: string;
  projectCode?: string;
}

export interface TaxDetail {
  taxType: string;
  taxRate: number;
  taxableAmount: number;
  taxAmount: number;
}

export interface Address {
  name: string;
  street: string;
  city: string;
  state?: string;
  country: string;
  postalCode: string;
}

export interface DocumentAttachment {
  name: string;
  url: string;
  type: string;
  size: number;
}

export interface Payment {
  id: string;
  paymentNumber: string;
  paymentDate: string;
  amount: number;
  currency: string;
  paymentMethod: 'BANK_TRANSFER' | 'CHECK' | 'CREDIT_CARD' | 'CASH' | 'ACH' | 'WIRE' | 'OTHER';
  referenceNumber?: string;
  bankAccount?: string;
  notes?: string;
  createdAt: string;
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
}

export interface Dispute {
  id: string;
  disputeNumber: string;
  type: 'PRICING' | 'QUANTITY' | 'QUALITY' | 'DELIVERY' | 'BILLING_ERROR' | 'OTHER';
  status: 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'ESCALATED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  disputedAmount: number;
  currency: string;
  reasonCode?: string;
  expectedResolution?: string;
  assignedTo?: string;
  assignedToName?: string;
  resolution?: string;
  resolutionAmount?: number;
  createdAt: string;
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
}

export interface InvoiceFilters {
  type?: string;
  status?: string;
  supplierId?: string;
  customerId?: string;
  invoiceDateFrom?: string;
  invoiceDateTo?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
  minAmount?: number;
  maxAmount?: number;
  currency?: string;
  search?: string;
}

export interface InvoiceFormData {
  invoiceNumber: string;
  type: 'PURCHASE' | 'SALES' | 'CREDIT_NOTE' | 'DEBIT_NOTE';
  status?: 'DRAFT' | 'PENDING' | 'APPROVED' | 'PAID' | 'OVERDUE' | 'CANCELLED' | 'DISPUTED';
  supplierId?: string;
  customerId?: string;
  purchaseOrderId?: string;
  contractId?: string;
  invoiceDate: string;
  dueDate: string;
  paymentTerms?: string;
  currency: string;
  exchangeRate?: number;
  subtotal: number;
  taxAmount?: number;
  discountAmount?: number;
  shippingAmount?: number;
  totalAmount: number;
  lineItems: Omit<InvoiceLineItem, 'id'>[];
  taxDetails?: TaxDetail[];
  billingAddress: Address;
  shippingAddress?: Address;
  notes?: string;
  attachments?: DocumentAttachment[];
}

// Configuration
const API_ENDPOINTS = {
  INVOICES: '/api/finance/invoices',
  INVOICE_PAYMENTS: (id: string) => `/api/finance/invoices/${id}/payments`,
  INVOICE_DISPUTES: (id: string) => `/api/finance/invoices/${id}/disputes`,
  INVOICE_ANALYTICS: '/api/finance/invoices/analytics',
} as const;

// Mock data for development/fallback
const MOCK_INVOICES: Invoice[] = Array.from({ length: 50 }, (_, i) => {
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
    supplierId: i % 2 === 0 ? `supplier-${(i % 10) + 1}` : undefined,
    supplierName: i % 2 === 0 ? `Supplier ${(i % 10) + 1}` : undefined,
    customerId: i % 2 === 1 ? `customer-${(i % 15) + 1}` : undefined,
    customerName: i % 2 === 1 ? `Customer ${(i % 15) + 1}` : undefined,
    purchaseOrderId: i % 3 === 0 ? `po-${i + 1}` : undefined,
    contractId: i % 4 === 0 ? `contract-${i + 1}` : undefined,
    invoiceDate: invoiceDate.toISOString(),
    dueDate: dueDate.toISOString(),
    paymentTerms: ['Net 30', 'Net 15', 'Net 60', 'Due on Receipt'][i % 4],
    currency: 'USD',
    exchangeRate: 1,
    subtotal: Math.floor(totalAmount * 0.9),
    taxAmount: Math.floor(totalAmount * 0.08),
    discountAmount: Math.floor(totalAmount * 0.02),
    shippingAmount: Math.floor(Math.random() * 200),
    totalAmount,
    paidAmount,
    balanceAmount,
    overdueDays: Math.max(0, overdueDays),
    lineItems: [
      {
        id: `line-${i}-1`,
        description: `Product ${i + 1}`,
        quantity: Math.floor(Math.random() * 10) + 1,
        unitPrice: Math.floor(Math.random() * 1000) + 100,
        discount: 0,
        taxRate: 8,
        lineTotal: Math.floor(totalAmount * 0.6),
        accountCode: '1200',
        costCenter: 'CC-001',
        projectCode: 'PRJ-001',
      },
      {
        id: `line-${i}-2`,
        description: `Service ${i + 1}`,
        quantity: 1,
        unitPrice: Math.floor(totalAmount * 0.3),
        discount: 0,
        taxRate: 8,
        lineTotal: Math.floor(totalAmount * 0.3),
        accountCode: '1300',
        costCenter: 'CC-002',
        projectCode: 'PRJ-001',
      },
    ],
    taxDetails: [
      {
        taxType: 'Sales Tax',
        taxRate: 8,
        taxableAmount: Math.floor(totalAmount * 0.9),
        taxAmount: Math.floor(totalAmount * 0.08),
      },
    ],
    billingAddress: {
      name: `Entity ${i + 1}`,
      street: `${100 + i} Business Street`,
      city: 'Business City',
      state: 'BC',
      country: 'USA',
      postalCode: String(10000 + i).padStart(5, '0'),
    },
    shippingAddress: {
      name: `Shipping ${i + 1}`,
      street: `${200 + i} Shipping Avenue`,
      city: 'Shipping City',
      state: 'SC',
      country: 'USA',
      postalCode: String(20000 + i).padStart(5, '0'),
    },
    notes: `Invoice notes for ${i + 1}`,
    attachments: [
      {
        name: `invoice_${i + 1}.pdf`,
        url: `/attachments/invoice_${i + 1}.pdf`,
        type: 'application/pdf',
        size: Math.floor(Math.random() * 2000000) + 500000,
      },
    ],
    payments: paidAmount > 0 ? [
      {
        id: `payment-${i}-1`,
        paymentNumber: `PAY-${new Date().getFullYear()}-${String(i + 1).padStart(6, '0')}`,
        paymentDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        amount: paidAmount,
        currency: 'USD',
        paymentMethod: ['BANK_TRANSFER', 'CHECK', 'CREDIT_CARD', 'ACH'][i % 4] as any,
        referenceNumber: `REF-${i + 1}`,
        bankAccount: 'ACC-001',
        notes: 'Payment received',
        createdAt: new Date().toISOString(),
        createdBy: {
          id: 'user-1',
          name: 'John Doe',
          email: 'john.doe@example.com',
        },
      },
    ] : [],
    disputes: i % 10 === 0 ? [
      {
        id: `dispute-${i}-1`,
        disputeNumber: `DISP-${new Date().getFullYear()}-${String(i + 1).padStart(6, '0')}`,
        type: ['PRICING', 'QUANTITY', 'QUALITY', 'DELIVERY', 'BILLING_ERROR'][i % 5] as any,
        status: ['OPEN', 'UNDER_REVIEW', 'RESOLVED'][i % 3] as any,
        priority: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'][i % 4] as any,
        description: `Dispute for invoice ${i + 1}`,
        disputedAmount: Math.floor(totalAmount * 0.2),
        currency: 'USD',
        reasonCode: 'PRICE_MISMATCH',
        expectedResolution: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        assignedTo: 'user-2',
        assignedToName: 'Jane Smith',
        createdAt: new Date().toISOString(),
        createdBy: {
          id: 'user-1',
          name: 'John Doe',
          email: 'john.doe@example.com',
        },
      },
    ] : [],
    createdAt: invoiceDate.toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: {
      id: 'user-1',
      name: 'John Doe',
      email: 'john.doe@example.com',
    },
  };
});

// Service class for Invoice operations
export class InvoiceService {
  /**
   * Get all invoices with pagination and filters
   */
  static async getInvoiceList(params: PaginationParams & InvoiceFilters): Promise<PaginatedResponse<Invoice> & { summary?: any }> {
    try {
      const response = await api.get<PaginatedResponse<Invoice> & { summary?: any }>(API_ENDPOINTS.INVOICES, { params });
      return response.data;
    } catch (error) {
      console.warn('API call failed, using mock data:', error);
      
      // Apply filters to mock data
      let filteredData = [...MOCK_INVOICES];
      
      if (params.type) {
        filteredData = filteredData.filter(invoice => invoice.type === params.type);
      }
      
      if (params.status) {
        filteredData = filteredData.filter(invoice => invoice.status === params.status);
      }
      
      if (params.supplierId) {
        filteredData = filteredData.filter(invoice => invoice.supplierId === params.supplierId);
      }
      
      if (params.customerId) {
        filteredData = filteredData.filter(invoice => invoice.customerId === params.customerId);
      }
      
      if (params.search) {
        const searchLower = params.search.toLowerCase();
        filteredData = filteredData.filter(invoice => 
          invoice.invoiceNumber.toLowerCase().includes(searchLower) ||
          invoice.supplierName?.toLowerCase().includes(searchLower) ||
          invoice.customerName?.toLowerCase().includes(searchLower)
        );
      }
      
      // Apply pagination
      const page = params.page || 1;
      const pageSize = params.pageSize || 10;
      const offset = (page - 1) * pageSize;
      const items = filteredData.slice(offset, offset + pageSize);
      
      // Calculate summary
      const summary = {
        totalInvoices: filteredData.length,
        totalAmount: filteredData.reduce((sum, item) => sum + item.totalAmount, 0),
        paidAmount: filteredData.reduce((sum, item) => sum + item.paidAmount, 0),
        outstandingAmount: filteredData.reduce((sum, item) => sum + item.balanceAmount, 0),
        overdueAmount: filteredData.filter(item => (item.overdueDays || 0) > 0).reduce((sum, item) => sum + item.balanceAmount, 0),
      };
      
      return {
        items,
        total: filteredData.length,
        page,
        pageSize,
        totalPages: Math.ceil(filteredData.length / pageSize),
        summary,
      };
    }
  }

  /**
   * Get invoice by ID
   */
  static async getInvoiceById(id: string): Promise<Invoice> {
    try {
      const response = await api.get<ApiResponse<Invoice>>(`${API_ENDPOINTS.INVOICES}/${id}`);
      return response.data.data;
    } catch (error) {
      console.warn('API call failed, using mock data:', error);
      
      const invoice = MOCK_INVOICES.find(i => i.id === id);
      if (!invoice) {
        throw new Error(`Invoice with ID ${id} not found`);
      }
      return invoice;
    }
  }

  /**
   * Create new invoice
   */
  static async createInvoice(data: InvoiceFormData): Promise<Invoice> {
    try {
      const response = await api.post<ApiResponse<Invoice>>(API_ENDPOINTS.INVOICES, data);
      return response.data.data;
    } catch (error) {
      console.warn('API call failed, using mock creation:', error);
      
      // Mock creation
      const newInvoice: Invoice = {
        id: `invoice-${Date.now()}`,
        invoiceNumber: data.invoiceNumber,
        type: data.type,
        status: data.status || 'DRAFT',
        supplierId: data.supplierId,
        supplierName: data.supplierId ? `Supplier Name` : undefined,
        customerId: data.customerId,
        customerName: data.customerId ? `Customer Name` : undefined,
        purchaseOrderId: data.purchaseOrderId,
        contractId: data.contractId,
        invoiceDate: data.invoiceDate,
        dueDate: data.dueDate,
        paymentTerms: data.paymentTerms,
        currency: data.currency,
        exchangeRate: data.exchangeRate || 1,
        subtotal: data.subtotal,
        taxAmount: data.taxAmount || 0,
        discountAmount: data.discountAmount || 0,
        shippingAmount: data.shippingAmount || 0,
        totalAmount: data.totalAmount,
        paidAmount: 0,
        balanceAmount: data.totalAmount,
        lineItems: data.lineItems.map((item, index) => ({
          id: `line-${Date.now()}-${index}`,
          ...item,
        })),
        taxDetails: data.taxDetails,
        billingAddress: data.billingAddress,
        shippingAddress: data.shippingAddress,
        notes: data.notes,
        attachments: data.attachments,
        payments: [],
        disputes: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: {
          id: 'current-user',
          name: 'Current User',
          email: 'user@example.com',
        },
      };
      
      MOCK_INVOICES.unshift(newInvoice);
      return newInvoice;
    }
  }

  /**
   * Update invoice
   */
  static async updateInvoice(id: string, data: Partial<InvoiceFormData>): Promise<Invoice> {
    try {
      const response = await api.put<ApiResponse<Invoice>>(`${API_ENDPOINTS.INVOICES}/${id}`, data);
      return response.data.data;
    } catch (error) {
      console.warn('API call failed, using mock update:', error);
      
      const index = MOCK_INVOICES.findIndex(i => i.id === id);
      if (index === -1) {
        throw new Error(`Invoice with ID ${id} not found`);
      }
      
      MOCK_INVOICES[index] = {
        ...MOCK_INVOICES[index],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      
      return MOCK_INVOICES[index];
    }
  }

  /**
   * Delete invoice
   */
  static async deleteInvoice(id: string): Promise<void> {
    try {
      await api.delete(`${API_ENDPOINTS.INVOICES}/${id}`);
    } catch (error) {
      console.warn('API call failed, using mock deletion:', error);
      
      const index = MOCK_INVOICES.findIndex(i => i.id === id);
      if (index === -1) {
        throw new Error(`Invoice with ID ${id} not found`);
      }
      
      MOCK_INVOICES.splice(index, 1);
    }
  }

  /**
   * Get invoice payments
   */
  static async getInvoicePayments(invoiceId: string): Promise<Payment[]> {
    try {
      const response = await api.get<{ items: Payment[] }>(API_ENDPOINTS.INVOICE_PAYMENTS(invoiceId));
      return response.data.items;
    } catch (error) {
      console.warn('API call failed, using mock data:', error);
      
      const invoice = MOCK_INVOICES.find(i => i.id === invoiceId);
      return invoice?.payments || [];
    }
  }

  /**
   * Create payment for invoice
   */
  static async createPayment(invoiceId: string, paymentData: any): Promise<Payment> {
    try {
      const response = await api.post<ApiResponse<Payment>>(API_ENDPOINTS.INVOICE_PAYMENTS(invoiceId), paymentData);
      return response.data.data;
    } catch (error) {
      console.warn('API call failed, using mock creation:', error);
      
      // Mock payment creation
      const newPayment: Payment = {
        id: `payment-${Date.now()}`,
        paymentNumber: paymentData.paymentNumber,
        paymentDate: paymentData.paymentDate,
        amount: paymentData.amount,
        currency: paymentData.currency || 'USD',
        paymentMethod: paymentData.paymentMethod,
        referenceNumber: paymentData.referenceNumber,
        bankAccount: paymentData.bankAccount,
        notes: paymentData.notes,
        createdAt: new Date().toISOString(),
        createdBy: {
          id: 'current-user',
          name: 'Current User',
          email: 'user@example.com',
        },
      };
      
      // Update mock invoice
      const invoice = MOCK_INVOICES.find(i => i.id === invoiceId);
      if (invoice) {
        if (!invoice.payments) invoice.payments = [];
        invoice.payments.push(newPayment);
        invoice.paidAmount += paymentData.amount;
        invoice.balanceAmount = invoice.totalAmount - invoice.paidAmount;
        if (invoice.balanceAmount <= 0) {
          invoice.status = 'PAID';
        }
      }
      
      return newPayment;
    }
  }

  /**
   * Get invoice disputes
   */
  static async getInvoiceDisputes(invoiceId: string): Promise<Dispute[]> {
    try {
      const response = await api.get<{ items: Dispute[] }>(API_ENDPOINTS.INVOICE_DISPUTES(invoiceId));
      return response.data.items;
    } catch (error) {
      console.warn('API call failed, using mock data:', error);
      
      const invoice = MOCK_INVOICES.find(i => i.id === invoiceId);
      return invoice?.disputes || [];
    }
  }

  /**
   * Create dispute for invoice
   */
  static async createDispute(invoiceId: string, disputeData: any): Promise<Dispute> {
    try {
      const response = await api.post<ApiResponse<Dispute>>(API_ENDPOINTS.INVOICE_DISPUTES(invoiceId), disputeData);
      return response.data.data;
    } catch (error) {
      console.warn('API call failed, using mock creation:', error);
      
      // Mock dispute creation
      const newDispute: Dispute = {
        id: `dispute-${Date.now()}`,
        disputeNumber: disputeData.disputeNumber,
        type: disputeData.type,
        status: disputeData.status || 'OPEN',
        priority: disputeData.priority || 'MEDIUM',
        description: disputeData.description,
        disputedAmount: disputeData.disputedAmount,
        currency: disputeData.currency || 'USD',
        reasonCode: disputeData.reasonCode,
        expectedResolution: disputeData.expectedResolution,
        assignedTo: disputeData.assignedTo,
        assignedToName: disputeData.assignedToName,
        resolution: disputeData.resolution,
        resolutionAmount: disputeData.resolutionAmount,
        createdAt: new Date().toISOString(),
        createdBy: {
          id: 'current-user',
          name: 'Current User',
          email: 'user@example.com',
        },
      };
      
      // Update mock invoice
      const invoice = MOCK_INVOICES.find(i => i.id === invoiceId);
      if (invoice) {
        if (!invoice.disputes) invoice.disputes = [];
        invoice.disputes.push(newDispute);
        invoice.status = 'DISPUTED';
      }
      
      return newDispute;
    }
  }

  /**
   * Get invoice analytics
   */
  static async getInvoiceAnalytics(params?: { 
    startDate?: string; 
    endDate?: string; 
    type?: string; 
    currency?: string; 
  }): Promise<any> {
    try {
      const response = await api.get(API_ENDPOINTS.INVOICE_ANALYTICS, { params });
      return response.data;
    } catch (error) {
      console.warn('API call failed, using mock analytics:', error);
      
      // Mock analytics data
      return {
        summary: {
          totalInvoices: MOCK_INVOICES.length,
          totalAmount: MOCK_INVOICES.reduce((sum, i) => sum + i.totalAmount, 0),
          paidAmount: MOCK_INVOICES.reduce((sum, i) => sum + i.paidAmount, 0),
          outstandingAmount: MOCK_INVOICES.reduce((sum, i) => sum + i.balanceAmount, 0),
          overdueAmount: MOCK_INVOICES.filter(i => (i.overdueDays || 0) > 0).reduce((sum, i) => sum + i.balanceAmount, 0),
          averagePaymentDays: 28.5,
          paymentSuccessRate: 94.2,
        },
        byType: [
          { type: 'PURCHASE', count: MOCK_INVOICES.filter(i => i.type === 'PURCHASE').length, amount: MOCK_INVOICES.filter(i => i.type === 'PURCHASE').reduce((sum, i) => sum + i.totalAmount, 0) },
          { type: 'SALES', count: MOCK_INVOICES.filter(i => i.type === 'SALES').length, amount: MOCK_INVOICES.filter(i => i.type === 'SALES').reduce((sum, i) => sum + i.totalAmount, 0) },
          { type: 'CREDIT_NOTE', count: MOCK_INVOICES.filter(i => i.type === 'CREDIT_NOTE').length, amount: MOCK_INVOICES.filter(i => i.type === 'CREDIT_NOTE').reduce((sum, i) => sum + i.totalAmount, 0) },
          { type: 'DEBIT_NOTE', count: MOCK_INVOICES.filter(i => i.type === 'DEBIT_NOTE').length, amount: MOCK_INVOICES.filter(i => i.type === 'DEBIT_NOTE').reduce((sum, i) => sum + i.totalAmount, 0) },
        ],
        byStatus: [
          { status: 'DRAFT', count: MOCK_INVOICES.filter(i => i.status === 'DRAFT').length },
          { status: 'PENDING', count: MOCK_INVOICES.filter(i => i.status === 'PENDING').length },
          { status: 'APPROVED', count: MOCK_INVOICES.filter(i => i.status === 'APPROVED').length },
          { status: 'PAID', count: MOCK_INVOICES.filter(i => i.status === 'PAID').length },
          { status: 'OVERDUE', count: MOCK_INVOICES.filter(i => i.status === 'OVERDUE').length },
          { status: 'DISPUTED', count: MOCK_INVOICES.filter(i => i.status === 'DISPUTED').length },
          { status: 'CANCELLED', count: MOCK_INVOICES.filter(i => i.status === 'CANCELLED').length },
        ],
        timeline: Array.from({ length: 12 }, (_, i) => {
          const date = new Date();
          date.setMonth(date.getMonth() - 11 + i);
          return {
            month: date.toISOString().slice(0, 7),
            invoices: Math.floor(Math.random() * 50) + 20,
            amount: Math.floor(Math.random() * 500000) + 200000,
            payments: Math.floor(Math.random() * 450000) + 180000,
          };
        }),
      };
    }
  }
}

// Export individual functions for backward compatibility
export const getInvoiceList = InvoiceService.getInvoiceList;
export const getInvoiceById = InvoiceService.getInvoiceById;
export const createInvoice = InvoiceService.createInvoice;
export const updateInvoice = InvoiceService.updateInvoice;
export const deleteInvoice = InvoiceService.deleteInvoice;
export const getInvoicePayments = InvoiceService.getInvoicePayments;
export const createPayment = InvoiceService.createPayment;
export const getInvoiceDisputes = InvoiceService.getInvoiceDisputes;
export const createDispute = InvoiceService.createDispute;
export const getInvoiceAnalytics = InvoiceService.getInvoiceAnalytics;

export default InvoiceService;