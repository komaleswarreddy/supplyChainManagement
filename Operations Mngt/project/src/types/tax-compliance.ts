import type { User } from './user';
import type { Supplier } from './supplier';

export type TaxJurisdiction = 
  | 'FEDERAL'
  | 'STATE'
  | 'COUNTY'
  | 'CITY'
  | 'SPECIAL_DISTRICT'
  | 'INTERNATIONAL';

export type TaxType = 
  | 'SALES'
  | 'USE'
  | 'VAT'
  | 'GST'
  | 'EXCISE'
  | 'WITHHOLDING'
  | 'PROPERTY'
  | 'CUSTOMS_DUTY'
  | 'OTHER';

export type ExemptionStatus = 
  | 'EXEMPT'
  | 'PARTIALLY_EXEMPT'
  | 'TAXABLE'
  | 'ZERO_RATED'
  | 'REDUCED_RATE';

export type TaxDocumentType = 
  | 'EXEMPTION_CERTIFICATE'
  | 'RESALE_CERTIFICATE'
  | 'VAT_REGISTRATION'
  | 'W9'
  | 'W8BEN'
  | 'W8BENE'
  | 'TAX_ID_VERIFICATION'
  | 'OTHER';

export type TaxDocumentStatus = 
  | 'VALID'
  | 'EXPIRED'
  | 'PENDING_VERIFICATION'
  | 'REJECTED'
  | 'REVOKED';

export type TaxReportType = 
  | 'SALES_TAX'
  | 'USE_TAX'
  | 'VAT'
  | 'GST'
  | 'WITHHOLDING_TAX'
  | 'INTRASTAT'
  | 'ANNUAL_SUMMARY'
  | 'CUSTOM';

export type TaxReportPeriod = 
  | 'MONTHLY'
  | 'QUARTERLY'
  | 'SEMI_ANNUAL'
  | 'ANNUAL';

export type TaxFilingStatus = 
  | 'PENDING'
  | 'FILED'
  | 'AMENDED'
  | 'EXTENDED'
  | 'LATE';

export type TaxRule = {
  id: string;
  name: string;
  description?: string;
  jurisdiction: TaxJurisdiction;
  taxType: TaxType;
  rate: number;
  effectiveDate: string;
  expirationDate?: string;
  isActive: boolean;
  conditions: {
    field: string;
    operator: 'EQUALS' | 'NOT_EQUALS' | 'CONTAINS' | 'GREATER_THAN' | 'LESS_THAN' | 'IN' | 'NOT_IN';
    value: string | string[] | number;
  }[];
  priority: number;
  createdBy: User;
  createdAt: string;
  updatedAt: string;
};

export type TaxCode = {
  id: string;
  code: string;
  description: string;
  taxType: TaxType;
  defaultRate: number;
  isActive: boolean;
  applicableJurisdictions: TaxJurisdiction[];
  createdAt: string;
  updatedAt: string;
};

export type TaxDetermination = {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  supplier: {
    id: string;
    name: string;
  };
  lineItems: {
    lineItemId: string;
    description: string;
    taxableAmount: number;
    taxCode: string;
    exemptionStatus: ExemptionStatus;
    exemptionReason?: string;
    taxes: {
      jurisdiction: TaxJurisdiction;
      taxType: TaxType;
      rate: number;
      amount: number;
      taxRuleId: string;
    }[];
  }[];
  totalTaxableAmount: number;
  totalTaxAmount: number;
  currency: string;
  determinationDate: string;
  createdBy: User;
  createdAt: string;
  updatedAt: string;
};

export type TaxDocument = {
  id: string;
  supplierId: string;
  supplierName: string;
  documentType: TaxDocumentType;
  documentNumber: string;
  issuedBy: string;
  issuedDate: string;
  expirationDate?: string;
  status: TaxDocumentStatus;
  validatedBy?: User;
  validatedAt?: string;
  rejectionReason?: string;
  documentUrl: string;
  notes?: string;
  createdBy: User;
  createdAt: string;
  updatedAt: string;
  lastReminderSent?: string;
  followUpActions?: {
    action: string;
    dueDate: string;
    assignedTo: User;
    status: 'PENDING' | 'COMPLETED' | 'OVERDUE';
    completedAt?: string;
    notes?: string;
  }[];
};

export type TaxReport = {
  id: string;
  reportType: TaxReportType;
  reportName: string;
  jurisdiction: TaxJurisdiction;
  period: TaxReportPeriod;
  startDate: string;
  endDate: string;
  dueDate: string;
  filingStatus: TaxFilingStatus;
  filedBy?: User;
  filedAt?: string;
  totalTaxAmount: number;
  currency: string;
  summary: {
    taxType: TaxType;
    taxableAmount: number;
    taxAmount: number;
  }[];
  detailData?: {
    invoiceId: string;
    invoiceNumber: string;
    invoiceDate: string;
    supplier: {
      id: string;
      name: string;
    };
    taxableAmount: number;
    taxAmount: number;
    taxType: TaxType;
  }[];
  reportUrl?: string;
  notes?: string;
  createdBy: User;
  createdAt: string;
  updatedAt: string;
};

export type TaxComplianceFilters = {
  jurisdiction?: TaxJurisdiction;
  taxType?: TaxType;
  reportType?: TaxReportType;
  period?: TaxReportPeriod;
  filingStatus?: TaxFilingStatus;
  documentType?: TaxDocumentType;
  documentStatus?: TaxDocumentStatus;
  supplier?: string;
  dateRange?: {
    start: string;
    end: string;
  };
};