import type { User } from './user';
import type { Supplier } from './supplier';

export type InvoiceStatus = 
  | 'DRAFT'
  | 'PENDING_MATCHING'
  | 'MATCHED'
  | 'EXCEPTION'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'DISPUTED'
  | 'SCHEDULED'
  | 'PAID'
  | 'CANCELLED';

export type InvoiceSource = 
  | 'EMAIL'
  | 'EDI'
  | 'PORTAL'
  | 'MANUAL'
  | 'OCR';

export type MatchStatus = 
  | 'NOT_MATCHED'
  | 'FULLY_MATCHED'
  | 'PARTIALLY_MATCHED'
  | 'EXCEPTION';

export type ExceptionType = 
  | 'PRICE_VARIANCE'
  | 'QUANTITY_VARIANCE'
  | 'MISSING_PO'
  | 'MISSING_GRN'
  | 'DUPLICATE_INVOICE'
  | 'TAX_ERROR'
  | 'OTHER';

export type DisputeReason = 
  | 'INCORRECT_PRICE'
  | 'INCORRECT_QUANTITY'
  | 'DAMAGED_GOODS'
  | 'GOODS_NOT_RECEIVED'
  | 'DUPLICATE_BILLING'
  | 'INCORRECT_TAX'
  | 'INCORRECT_TERMS'
  | 'OTHER';

export type DisputeStatus = 
  | 'OPEN'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'CANCELLED';

export type PaymentMethod = 
  | 'ACH'
  | 'CHECK'
  | 'WIRE'
  | 'CREDIT_CARD'
  | 'OTHER';

export type PaymentStatus = 
  | 'SCHEDULED'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'FAILED';

export type InvoiceLineItem = {
  id: string;
  lineNumber: number;
  description: string;
  quantity: number;
  unitPrice: number;
  unitOfMeasure: string;
  amount: number;
  taxAmount: number;
  totalAmount: number;
  poLineItem?: {
    poNumber: string;
    lineNumber: number;
    itemCode: string;
  };
  grnLineItem?: {
    grnNumber: string;
    lineNumber: number;
    receivedQuantity: number;
    receivedDate: string;
  };
  accountCode?: string;
  taxCode?: string;
  matchStatus: MatchStatus;
  exceptions?: ExceptionType[];
};

export type Invoice = {
  id: string;
  invoiceNumber: string;
  poNumbers?: string[];
  grnNumbers?: string[];
  supplier: Supplier;
  status: InvoiceStatus;
  source: InvoiceSource;
  invoiceDate: string;
  dueDate: string;
  amount: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  paymentTerms: string;
  description?: string;
  lineItems: InvoiceLineItem[];
  matchStatus: MatchStatus;
  matchDetails?: {
    poMatch: boolean;
    grnMatch: boolean;
    priceMatch: boolean;
    quantityMatch: boolean;
    exceptions: {
      type: ExceptionType;
      description: string;
      amount?: number;
      resolved: boolean;
      resolvedBy?: User;
      resolvedAt?: string;
      resolution?: string;
    }[];
  };
  approvalWorkflow?: {
    currentLevel: number;
    maxLevels: number;
    levels: Array<{
      level: number;
      approver: {
        id: string;
        name: string;
        position: string;
        department: string;
      };
      status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'DELEGATED';
      comment?: string;
      timestamp?: string;
      delegatedTo?: {
        id: string;
        name: string;
      };
    }>;
    dueDate?: string;
    overdue: boolean;
  };
  dispute?: {
    id: string;
    reason: DisputeReason;
    description: string;
    amount: number;
    status: DisputeStatus;
    createdBy: User;
    createdAt: string;
    assignedTo?: User;
    communications: {
      id: string;
      message: string;
      sender: {
        id: string;
        name: string;
        type: 'INTERNAL' | 'SUPPLIER';
      };
      timestamp: string;
      attachments?: string[];
    }[];
    resolution?: string;
    resolvedBy?: User;
    resolvedAt?: string;
  };
  payment?: {
    id: string;
    scheduledDate: string;
    method: PaymentMethod;
    status: PaymentStatus;
    amount: number;
    reference?: string;
    processedBy?: User;
    processedAt?: string;
    earlyPaymentDiscount?: {
      available: boolean;
      discountPercent: number;
      discountAmount: number;
      discountDate: string;
      applied: boolean;
    };
    batchId?: string;
  };
  attachments: {
    id: string;
    filename: string;
    fileType: string;
    url: string;
    uploadedBy: User;
    uploadedAt: string;
    isOriginal: boolean;
  }[];
  notes?: string;
  createdBy: User;
  createdAt: string;
  updatedBy?: User;
  updatedAt: string;
  audit: {
    statusHistory: Array<{
      status: InvoiceStatus;
      timestamp: string;
      user: {
        id: string;
        name: string;
      };
      comment?: string;
    }>;
  };
};

export type InvoiceFilters = {
  status?: InvoiceStatus;
  supplier?: string;
  invoiceNumber?: string;
  poNumber?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  minAmount?: number;
  maxAmount?: number;
  matchStatus?: MatchStatus;
  hasDispute?: boolean;
  paymentStatus?: PaymentStatus;
};

export type InvoiceFormData = {
  invoiceNumber: string;
  poNumbers?: string[];
  supplierId: string;
  invoiceDate: Date;
  dueDate: Date;
  amount: number;
  taxAmount: number;
  currency: string;
  paymentTerms: string;
  description?: string;
  lineItems: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    unitOfMeasure: string;
    taxAmount: number;
    poLineItem?: {
      poNumber: string;
      lineNumber: number;
      itemCode: string;
    };
    accountCode?: string;
    taxCode?: string;
  }>;
  notes?: string;
  attachments?: File[];
};

export type DisputeFormData = {
  reason: DisputeReason;
  description: string;
  amount: number;
  attachments?: File[];
};

export type PaymentScheduleFormData = {
  scheduledDate: Date;
  method: PaymentMethod;
  amount: number;
  reference?: string;
  applyEarlyPaymentDiscount?: boolean;
};