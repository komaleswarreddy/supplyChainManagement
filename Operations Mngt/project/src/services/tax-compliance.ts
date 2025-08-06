import { api } from '@/lib/api';
import type { ApiResponse, PaginatedResponse, PaginationParams } from '@/types/common';

// Types for Tax Compliance service
export interface TaxDetermination {
  id: string;
  determinationNumber: string;
  transactionType: 'PURCHASE' | 'SALE' | 'IMPORT' | 'EXPORT' | 'SERVICE';
  status: 'DRAFT' | 'CALCULATED' | 'APPLIED' | 'FILED' | 'AMENDED';
  entityId: string;
  entityName: string;
  entityType: 'SUPPLIER' | 'CUSTOMER' | 'INTERNAL';
  transactionDate: string;
  taxJurisdictions: TaxJurisdiction[];
  lineItems: TaxLineItem[];
  addresses: {
    shipFrom: Address;
    shipTo: Address;
    billTo?: Address;
  };
  totalAmount: number;
  totalTaxableAmount: number;
  totalTaxAmount: number;
  currency: string;
  exchangeRate: number;
  calculationMethod: 'AUTOMATIC' | 'MANUAL' | 'OVERRIDE';
  overrideReason?: string;
  notes?: string;
  attachments?: DocumentAttachment[];
  createdAt: string;
  updatedAt: string;
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
}

export interface TaxJurisdiction {
  id: string;
  name: string;
  type: 'FEDERAL' | 'STATE' | 'LOCAL' | 'VAT' | 'GST';
  code: string;
  rate: number;
  amount: number;
  exemptionCode?: string;
  exemptionReason?: string;
}

export interface TaxLineItem {
  id: string;
  description: string;
  amount: number;
  taxableAmount: number;
  taxCategory: string;
  taxCode?: string;
  exemptionApplied: boolean;
  exemptionCode?: string;
  exemptionCertificate?: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

export interface DocumentAttachment {
  name: string;
  url: string;
  type: string;
  size: number;
}

export interface TaxDocument {
  id: string;
  documentNumber: string;
  documentType: 'TAX_RETURN' | 'TAX_CERTIFICATE' | 'EXEMPTION_CERTIFICATE' | 'COMPLIANCE_REPORT' | 'AUDIT_REPORT';
  status: 'DRAFT' | 'PENDING_REVIEW' | 'APPROVED' | 'FILED' | 'REJECTED' | 'AMENDED';
  taxPeriod: {
    startDate: string;
    endDate: string;
    frequency: 'MONTHLY' | 'QUARTERLY' | 'ANNUALLY';
  };
  jurisdiction: {
    id: string;
    name: string;
    type: 'FEDERAL' | 'STATE' | 'LOCAL' | 'VAT' | 'GST';
    code: string;
  };
  filingRequirements: {
    dueDate: string;
    filingMethod: 'ELECTRONIC' | 'PAPER' | 'BOTH';
    requiredForms: string[];
    requiredAttachments: string[];
  };
  taxData: {
    grossSales?: number;
    taxableAmount: number;
    exemptAmount?: number;
    taxDue: number;
    taxPaid?: number;
    penalties?: number;
    interest?: number;
    totalDue: number;
  };
  filingDetails?: {
    filedDate?: string;
    filedBy?: string;
    confirmationNumber?: string;
    paymentMethod?: 'ACH' | 'CHECK' | 'WIRE' | 'CREDIT_CARD' | 'CASH';
    paymentReference?: string;
  };
  notes?: string;
  attachments?: DocumentAttachment[];
  createdAt: string;
  updatedAt: string;
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
}

export interface TaxReport {
  id: string;
  reportNumber: string;
  reportType: 'SALES_TAX' | 'USE_TAX' | 'VAT' | 'GST' | 'INCOME_TAX' | 'COMPLIANCE' | 'AUDIT';
  status: 'DRAFT' | 'GENERATING' | 'COMPLETED' | 'ERROR';
  reportPeriod: {
    startDate: string;
    endDate: string;
    frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'ANNUALLY';
  };
  filters?: {
    jurisdictions?: string[];
    entityTypes?: string[];
    transactionTypes?: string[];
    taxCategories?: string[];
    departments?: string[];
    costCenters?: string[];
  };
  reportData?: {
    summary: {
      totalTransactions: number;
      totalAmount: number;
      totalTaxableAmount: number;
      totalTaxAmount: number;
      totalExemptAmount: number;
    };
    details: {
      jurisdiction: string;
      taxType: string;
      taxRate: number;
      taxableAmount: number;
      taxAmount: number;
      exemptAmount?: number;
      transactionCount: number;
    }[];
  };
  generatedDate?: string;
  fileUrl?: string;
  fileFormat?: 'PDF' | 'EXCEL' | 'CSV' | 'XML';
  notes?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
}

export interface TaxDeterminationFilters {
  transactionType?: string;
  status?: string;
  entityType?: string;
  entityId?: string;
  transactionDateFrom?: string;
  transactionDateTo?: string;
  jurisdiction?: string;
  minAmount?: number;
  maxAmount?: number;
  search?: string;
}

export interface TaxDocumentFilters {
  documentType?: string;
  status?: string;
  jurisdiction?: string;
  periodStartDate?: string;
  periodEndDate?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
  search?: string;
}

export interface TaxReportFilters {
  reportType?: string;
  status?: string;
  periodStartDate?: string;
  periodEndDate?: string;
  search?: string;
}

// Configuration
const API_ENDPOINTS = {
  TAX_DETERMINATIONS: '/api/tax-compliance/tax-determinations',
  TAX_DOCUMENTS: '/api/tax-compliance/tax-documents',
  TAX_REPORTS: '/api/tax-compliance/tax-reports',
  TAX_ANALYTICS: '/api/tax-compliance/tax-compliance/analytics',
} as const;

// Mock data for development/fallback
const MOCK_TAX_DETERMINATIONS: TaxDetermination[] = Array.from({ length: 75 }, (_, i) => ({
  id: `tax-det-${i + 1}`,
  determinationNumber: `TD-${new Date().getFullYear()}-${String(i + 1).padStart(6, '0')}`,
  transactionType: ['PURCHASE', 'SALE', 'IMPORT', 'EXPORT', 'SERVICE'][i % 5] as any,
  status: ['DRAFT', 'CALCULATED', 'APPLIED', 'FILED', 'AMENDED'][i % 5] as any,
  entityId: `entity-${(i % 20) + 1}`,
  entityName: `Entity ${(i % 20) + 1}`,
  entityType: ['SUPPLIER', 'CUSTOMER', 'INTERNAL'][i % 3] as any,
  transactionDate: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
  taxJurisdictions: [
    {
      id: `fed-${i}`,
      name: 'Federal Tax',
      type: 'FEDERAL',
      code: 'US-FED',
      rate: 0,
      amount: 0,
    },
    {
      id: `state-${i}`,
      name: `State Tax ${(i % 5) + 1}`,
      type: 'STATE',
      code: `ST-${(i % 5) + 1}`,
      rate: Math.floor(Math.random() * 10) + 5,
      amount: Math.floor(Math.random() * 1000) + 100,
    },
  ],
  lineItems: [
    {
      id: `line-${i}-1`,
      description: `Product ${i + 1}`,
      amount: Math.floor(Math.random() * 5000) + 1000,
      taxableAmount: Math.floor(Math.random() * 4500) + 900,
      taxCategory: ['GOODS', 'SERVICES', 'SOFTWARE', 'DIGITAL'][i % 4],
      taxCode: `TC-${String((i % 10) + 1).padStart(3, '0')}`,
      exemptionApplied: Math.random() > 0.8,
      exemptionCode: Math.random() > 0.8 ? `EX-${(i % 5) + 1}` : undefined,
    },
  ],
  addresses: {
    shipFrom: {
      street: `${100 + i} Business St`,
      city: 'Business City',
      state: 'BC',
      country: 'US',
      postalCode: String(10000 + i).padStart(5, '0'),
    },
    shipTo: {
      street: `${200 + i} Customer Ave`,
      city: 'Customer City',
      state: 'CC',
      country: 'US',
      postalCode: String(20000 + i).padStart(5, '0'),
    },
  },
  totalAmount: Math.floor(Math.random() * 10000) + 2000,
  totalTaxableAmount: Math.floor(Math.random() * 9000) + 1800,
  totalTaxAmount: Math.floor(Math.random() * 800) + 100,
  currency: 'USD',
  exchangeRate: 1,
  calculationMethod: ['AUTOMATIC', 'MANUAL', 'OVERRIDE'][i % 3] as any,
  overrideReason: i % 10 === 0 ? 'Special exemption applied' : undefined,
  notes: `Tax determination notes for ${i + 1}`,
  createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
  updatedAt: new Date().toISOString(),
  createdBy: {
    id: 'user-1',
    name: 'John Doe',
    email: 'john.doe@example.com',
  },
}));

const MOCK_TAX_DOCUMENTS: TaxDocument[] = Array.from({ length: 60 }, (_, i) => ({
  id: `tax-doc-${i + 1}`,
  documentNumber: `DOC-${new Date().getFullYear()}-${String(i + 1).padStart(6, '0')}`,
  documentType: ['TAX_RETURN', 'TAX_CERTIFICATE', 'EXEMPTION_CERTIFICATE', 'COMPLIANCE_REPORT', 'AUDIT_REPORT'][i % 5] as any,
  status: ['DRAFT', 'PENDING_REVIEW', 'APPROVED', 'FILED', 'REJECTED', 'AMENDED'][i % 6] as any,
  taxPeriod: {
    startDate: new Date(2024, (i % 12), 1).toISOString(),
    endDate: new Date(2024, (i % 12) + 1, 0).toISOString(),
    frequency: ['MONTHLY', 'QUARTERLY', 'ANNUALLY'][i % 3] as any,
  },
  jurisdiction: {
    id: `jurisdiction-${(i % 5) + 1}`,
    name: ['Federal', 'California', 'New York', 'Texas', 'Florida'][i % 5],
    type: ['FEDERAL', 'STATE', 'STATE', 'STATE', 'STATE'][i % 5] as any,
    code: ['FED', 'CA', 'NY', 'TX', 'FL'][i % 5],
  },
  filingRequirements: {
    dueDate: new Date(Date.now() + Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
    filingMethod: ['ELECTRONIC', 'PAPER', 'BOTH'][i % 3] as any,
    requiredForms: [`Form ${(i % 10) + 1}`],
    requiredAttachments: ['Supporting Documentation'],
  },
  taxData: {
    grossSales: Math.floor(Math.random() * 100000) + 50000,
    taxableAmount: Math.floor(Math.random() * 90000) + 45000,
    exemptAmount: Math.floor(Math.random() * 10000),
    taxDue: Math.floor(Math.random() * 8000) + 2000,
    taxPaid: Math.floor(Math.random() * 7500) + 1800,
    penalties: Math.random() > 0.8 ? Math.floor(Math.random() * 500) : 0,
    interest: Math.random() > 0.8 ? Math.floor(Math.random() * 200) : 0,
    totalDue: Math.floor(Math.random() * 8500) + 2000,
  },
  filingDetails: i % 3 === 0 ? {
    filedDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    filedBy: 'user-1',
    confirmationNumber: `CONF-${i + 1}`,
    paymentMethod: ['ACH', 'CHECK', 'WIRE', 'CREDIT_CARD'][i % 4] as any,
    paymentReference: `PAY-${i + 1}`,
  } : undefined,
  notes: `Tax document notes for ${i + 1}`,
  attachments: [
    {
      name: `tax_document_${i + 1}.pdf`,
      url: `/attachments/tax_doc_${i + 1}.pdf`,
      type: 'application/pdf',
      size: Math.floor(Math.random() * 2000000) + 500000,
    },
  ],
  createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
  updatedAt: new Date().toISOString(),
  createdBy: {
    id: 'user-1',
    name: 'John Doe',
    email: 'john.doe@example.com',
  },
}));

const MOCK_TAX_REPORTS: TaxReport[] = Array.from({ length: 40 }, (_, i) => ({
  id: `tax-report-${i + 1}`,
  reportNumber: `REP-${new Date().getFullYear()}-${String(i + 1).padStart(6, '0')}`,
  reportType: ['SALES_TAX', 'USE_TAX', 'VAT', 'GST', 'INCOME_TAX', 'COMPLIANCE', 'AUDIT'][i % 7] as any,
  status: ['DRAFT', 'GENERATING', 'COMPLETED', 'ERROR'][i % 4] as any,
  reportPeriod: {
    startDate: new Date(2024, (i % 12), 1).toISOString(),
    endDate: new Date(2024, (i % 12) + 1, 0).toISOString(),
    frequency: ['MONTHLY', 'QUARTERLY', 'ANNUALLY'][i % 3] as any,
  },
  filters: {
    jurisdictions: [`jurisdiction-${(i % 3) + 1}`],
    entityTypes: ['SUPPLIER', 'CUSTOMER'],
    transactionTypes: ['SALE', 'PURCHASE'],
  },
  reportData: i % 2 === 0 ? {
    summary: {
      totalTransactions: Math.floor(Math.random() * 1000) + 100,
      totalAmount: Math.floor(Math.random() * 500000) + 50000,
      totalTaxableAmount: Math.floor(Math.random() * 450000) + 45000,
      totalTaxAmount: Math.floor(Math.random() * 40000) + 4000,
      totalExemptAmount: Math.floor(Math.random() * 50000),
    },
    details: [
      {
        jurisdiction: 'California',
        taxType: 'Sales Tax',
        taxRate: 7.25,
        taxableAmount: Math.floor(Math.random() * 200000) + 20000,
        taxAmount: Math.floor(Math.random() * 15000) + 1500,
        exemptAmount: Math.floor(Math.random() * 10000),
        transactionCount: Math.floor(Math.random() * 500) + 50,
      },
    ],
  } : undefined,
  generatedDate: i % 2 === 0 ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() : undefined,
  fileUrl: i % 2 === 0 ? `/reports/tax_report_${i + 1}.pdf` : undefined,
  fileFormat: i % 2 === 0 ? (['PDF', 'EXCEL', 'CSV', 'XML'][i % 4] as any) : undefined,
  notes: `Tax report notes for ${i + 1}`,
  createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
  updatedAt: new Date().toISOString(),
  createdBy: {
    id: 'user-1',
    name: 'John Doe',
    email: 'john.doe@example.com',
  },
}));

// Service class for Tax Compliance operations
export class TaxComplianceService {
  /**
   * Get all tax determinations with pagination and filters
   */
  static async getTaxDeterminationList(params: PaginationParams & TaxDeterminationFilters): Promise<PaginatedResponse<TaxDetermination>> {
    try {
      const response = await api.get<PaginatedResponse<TaxDetermination>>(API_ENDPOINTS.TAX_DETERMINATIONS, { params });
      return response.data;
    } catch (error) {
      console.warn('API call failed, using mock data:', error);
      
      // Apply filters to mock data
      let filteredData = [...MOCK_TAX_DETERMINATIONS];
      
      if (params.transactionType) {
        filteredData = filteredData.filter(item => item.transactionType === params.transactionType);
      }
      
      if (params.status) {
        filteredData = filteredData.filter(item => item.status === params.status);
      }
      
      if (params.entityType) {
        filteredData = filteredData.filter(item => item.entityType === params.entityType);
      }
      
      if (params.search) {
        const searchLower = params.search.toLowerCase();
        filteredData = filteredData.filter(item => 
          item.determinationNumber.toLowerCase().includes(searchLower) ||
          item.entityName.toLowerCase().includes(searchLower)
        );
      }
      
      // Apply pagination
      const page = params.page || 1;
      const pageSize = params.pageSize || 10;
      const offset = (page - 1) * pageSize;
      const items = filteredData.slice(offset, offset + pageSize);
      
      return {
        items,
        total: filteredData.length,
        page,
        pageSize,
        totalPages: Math.ceil(filteredData.length / pageSize),
      };
    }
  }

  /**
   * Get tax determination by ID
   */
  static async getTaxDeterminationById(id: string): Promise<TaxDetermination> {
    try {
      const response = await api.get<ApiResponse<TaxDetermination>>(`${API_ENDPOINTS.TAX_DETERMINATIONS}/${id}`);
      return response.data.data;
    } catch (error) {
      console.warn('API call failed, using mock data:', error);
      
      const determination = MOCK_TAX_DETERMINATIONS.find(d => d.id === id);
      if (!determination) {
        throw new Error(`Tax determination with ID ${id} not found`);
      }
      return determination;
    }
  }

  /**
   * Create new tax determination
   */
  static async createTaxDetermination(data: any): Promise<TaxDetermination> {
    try {
      const response = await api.post<ApiResponse<TaxDetermination>>(API_ENDPOINTS.TAX_DETERMINATIONS, data);
      return response.data.data;
    } catch (error) {
      console.warn('API call failed, using mock creation:', error);
      
      // Mock creation
      const newDetermination: TaxDetermination = {
        id: `tax-det-${Date.now()}`,
        determinationNumber: `TD-${new Date().getFullYear()}-${String(MOCK_TAX_DETERMINATIONS.length + 1).padStart(6, '0')}`,
        transactionType: data.transactionType,
        status: data.status || 'DRAFT',
        entityId: data.entityId,
        entityName: data.entityName || 'Entity Name',
        entityType: data.entityType,
        transactionDate: data.transactionDate,
        taxJurisdictions: data.taxJurisdictions || [],
        lineItems: data.lineItems || [],
        addresses: data.addresses,
        totalAmount: data.totalAmount,
        totalTaxableAmount: data.totalTaxableAmount,
        totalTaxAmount: data.totalTaxAmount,
        currency: data.currency || 'USD',
        exchangeRate: data.exchangeRate || 1,
        calculationMethod: data.calculationMethod || 'AUTOMATIC',
        overrideReason: data.overrideReason,
        notes: data.notes,
        attachments: data.attachments,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: {
          id: 'current-user',
          name: 'Current User',
          email: 'user@example.com',
        },
      };
      
      MOCK_TAX_DETERMINATIONS.unshift(newDetermination);
      return newDetermination;
    }
  }

  /**
   * Get all tax documents with pagination and filters
   */
  static async getTaxDocumentList(params: PaginationParams & TaxDocumentFilters): Promise<PaginatedResponse<TaxDocument>> {
    try {
      const response = await api.get<PaginatedResponse<TaxDocument>>(API_ENDPOINTS.TAX_DOCUMENTS, { params });
      return response.data;
    } catch (error) {
      console.warn('API call failed, using mock data:', error);
      
      // Apply filters to mock data
      let filteredData = [...MOCK_TAX_DOCUMENTS];
      
      if (params.documentType) {
        filteredData = filteredData.filter(item => item.documentType === params.documentType);
      }
      
      if (params.status) {
        filteredData = filteredData.filter(item => item.status === params.status);
      }
      
      if (params.jurisdiction) {
        filteredData = filteredData.filter(item => 
          item.jurisdiction.name.toLowerCase().includes(params.jurisdiction!.toLowerCase())
        );
      }
      
      if (params.search) {
        const searchLower = params.search.toLowerCase();
        filteredData = filteredData.filter(item => 
          item.documentNumber.toLowerCase().includes(searchLower) ||
          item.jurisdiction.name.toLowerCase().includes(searchLower)
        );
      }
      
      // Apply pagination
      const page = params.page || 1;
      const pageSize = params.pageSize || 10;
      const offset = (page - 1) * pageSize;
      const items = filteredData.slice(offset, offset + pageSize);
      
      return {
        items,
        total: filteredData.length,
        page,
        pageSize,
        totalPages: Math.ceil(filteredData.length / pageSize),
      };
    }
  }

  /**
   * Get tax document by ID
   */
  static async getTaxDocumentById(id: string): Promise<TaxDocument> {
    try {
      const response = await api.get<ApiResponse<TaxDocument>>(`${API_ENDPOINTS.TAX_DOCUMENTS}/${id}`);
      return response.data.data;
    } catch (error) {
      console.warn('API call failed, using mock data:', error);
      
      const document = MOCK_TAX_DOCUMENTS.find(d => d.id === id);
      if (!document) {
        throw new Error(`Tax document with ID ${id} not found`);
      }
      return document;
    }
  }

  /**
   * Create new tax document
   */
  static async createTaxDocument(data: any): Promise<TaxDocument> {
    try {
      const response = await api.post<ApiResponse<TaxDocument>>(API_ENDPOINTS.TAX_DOCUMENTS, data);
      return response.data.data;
    } catch (error) {
      console.warn('API call failed, using mock creation:', error);
      
      // Mock creation
      const newDocument: TaxDocument = {
        id: `tax-doc-${Date.now()}`,
        documentNumber: `DOC-${new Date().getFullYear()}-${String(MOCK_TAX_DOCUMENTS.length + 1).padStart(6, '0')}`,
        documentType: data.documentType,
        status: data.status || 'DRAFT',
        taxPeriod: data.taxPeriod,
        jurisdiction: data.jurisdiction,
        filingRequirements: data.filingRequirements,
        taxData: data.taxData,
        filingDetails: data.filingDetails,
        notes: data.notes,
        attachments: data.attachments,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: {
          id: 'current-user',
          name: 'Current User',
          email: 'user@example.com',
        },
      };
      
      MOCK_TAX_DOCUMENTS.unshift(newDocument);
      return newDocument;
    }
  }

  /**
   * Get all tax reports with pagination and filters
   */
  static async getTaxReportList(params: PaginationParams & TaxReportFilters): Promise<PaginatedResponse<TaxReport>> {
    try {
      const response = await api.get<PaginatedResponse<TaxReport>>(API_ENDPOINTS.TAX_REPORTS, { params });
      return response.data;
    } catch (error) {
      console.warn('API call failed, using mock data:', error);
      
      // Apply filters to mock data
      let filteredData = [...MOCK_TAX_REPORTS];
      
      if (params.reportType) {
        filteredData = filteredData.filter(item => item.reportType === params.reportType);
      }
      
      if (params.status) {
        filteredData = filteredData.filter(item => item.status === params.status);
      }
      
      if (params.search) {
        const searchLower = params.search.toLowerCase();
        filteredData = filteredData.filter(item => 
          item.reportNumber.toLowerCase().includes(searchLower)
        );
      }
      
      // Apply pagination
      const page = params.page || 1;
      const pageSize = params.pageSize || 10;
      const offset = (page - 1) * pageSize;
      const items = filteredData.slice(offset, offset + pageSize);
      
      return {
        items,
        total: filteredData.length,
        page,
        pageSize,
        totalPages: Math.ceil(filteredData.length / pageSize),
      };
    }
  }

  /**
   * Create new tax report
   */
  static async createTaxReport(data: any): Promise<TaxReport> {
    try {
      const response = await api.post<ApiResponse<TaxReport>>(API_ENDPOINTS.TAX_REPORTS, data);
      return response.data.data;
    } catch (error) {
      console.warn('API call failed, using mock creation:', error);
      
      // Mock creation
      const newReport: TaxReport = {
        id: `tax-report-${Date.now()}`,
        reportNumber: `REP-${new Date().getFullYear()}-${String(MOCK_TAX_REPORTS.length + 1).padStart(6, '0')}`,
        reportType: data.reportType,
        status: data.status || 'DRAFT',
        reportPeriod: data.reportPeriod,
        filters: data.filters,
        reportData: data.reportData,
        generatedDate: data.generatedDate,
        fileUrl: data.fileUrl,
        fileFormat: data.fileFormat,
        notes: data.notes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: {
          id: 'current-user',
          name: 'Current User',
          email: 'user@example.com',
        },
      };
      
      MOCK_TAX_REPORTS.unshift(newReport);
      return newReport;
    }
  }

  /**
   * Get tax compliance analytics
   */
  static async getTaxComplianceAnalytics(params?: { 
    startDate?: string; 
    endDate?: string; 
    jurisdiction?: string; 
    transactionType?: string; 
  }): Promise<any> {
    try {
      const response = await api.get(API_ENDPOINTS.TAX_ANALYTICS, { params });
      return response.data;
    } catch (error) {
      console.warn('API call failed, using mock analytics:', error);
      
      // Mock analytics data
      return {
        summary: {
          totalDeterminations: MOCK_TAX_DETERMINATIONS.length,
          totalTaxAmount: MOCK_TAX_DETERMINATIONS.reduce((sum, d) => sum + d.totalTaxAmount, 0),
          totalDocuments: MOCK_TAX_DOCUMENTS.length,
          totalReports: MOCK_TAX_REPORTS.length,
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
    }
  }
}

// Export individual functions for backward compatibility
export const getTaxDeterminationList = TaxComplianceService.getTaxDeterminationList;
export const getTaxDeterminationById = TaxComplianceService.getTaxDeterminationById;
export const createTaxDetermination = TaxComplianceService.createTaxDetermination;
export const getTaxDocumentList = TaxComplianceService.getTaxDocumentList;
export const getTaxDocumentById = TaxComplianceService.getTaxDocumentById;
export const createTaxDocument = TaxComplianceService.createTaxDocument;
export const getTaxReportList = TaxComplianceService.getTaxReportList;
export const createTaxReport = TaxComplianceService.createTaxReport;
export const getTaxComplianceAnalytics = TaxComplianceService.getTaxComplianceAnalytics;

export default TaxComplianceService;