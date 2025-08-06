export type RequisitionStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export type RequisitionPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type BudgetStatus = 'WITHIN_BUDGET' | 'OVER_BUDGET' | 'NEEDS_REVIEW';

export type RequisitionCategory = 
  | 'OFFICE_SUPPLIES'
  | 'IT_EQUIPMENT'
  | 'SOFTWARE_LICENSES'
  | 'PROFESSIONAL_SERVICES'
  | 'MAINTENANCE'
  | 'TRAVEL'
  | 'TRAINING'
  | 'MARKETING'
  | 'OTHER';

export interface Requisition {
  id: string;
  requisitionNumber: string;
  requestorId: string;
  requestorName: string;
  department: string;
  costCenter: string;
  justification: string;
  items: RequisitionItem[];
  totalValue: number;
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'converted';
  attachments: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  approvedAt?: string;
  approvedBy?: string;
  rejectedAt?: string;
  rejectedBy?: string;
  rejectionReason?: string;
}

export interface RequisitionItem {
  id: string;
  itemId: string;
  itemName: string;
  quantity: number;
  unitOfMeasure: string;
  estimatedUnitPrice: number;
  description?: string;
}

export interface CreateRequisitionRequest {
  department: string;
  costCenter: string;
  justification: string;
  items: Array<{
    itemId: string;
    quantity: number;
    unitOfMeasure: string;
    estimatedUnitPrice: number;
    description?: string;
  }>;
  attachments?: string[];
  notes?: string;
}

export interface UpdateRequisitionRequest {
  department?: string;
  costCenter?: string;
  justification?: string;
  items?: Array<{
    itemId: string;
    quantity: number;
    unitOfMeasure: string;
    estimatedUnitPrice: number;
    description?: string;
  }>;
  attachments?: string[];
  notes?: string;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  requisitionId?: string;
  currency: string;
  paymentTerms: number;
  deliveryTerms: string;
  shippingMethod: string;
  items: PurchaseOrderItem[];
  totalAmount: number;
  status: 'draft' | 'pending' | 'approved' | 'sent' | 'acknowledged' | 'received' | 'closed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  approvedBy?: string;
  sentAt?: string;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  expectedDeliveryDate?: string;
  actualDeliveryDate?: string;
}

export interface PurchaseOrderItem {
  id: string;
  itemId: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  deliveryDate: string;
  receivedQuantity?: number;
}

export interface CreatePurchaseOrderRequest {
  supplierId: string;
  currency: string;
  paymentTerms: number;
  deliveryTerms: string;
  shippingMethod: string;
  items: Array<{
    itemId: string;
    quantity: number;
    unitPrice: number;
    deliveryDate: string;
  }>;
  requisitionId?: string;
}

export interface UpdatePurchaseOrderRequest {
  supplierId?: string;
  currency?: string;
  paymentTerms?: number;
  deliveryTerms?: string;
  shippingMethod?: string;
  items?: Array<{
    itemId: string;
    quantity: number;
    unitPrice: number;
    deliveryDate: string;
  }>;
}

export interface RFX {
  id: string;
  rfxNumber: string;
  type: 'rfi' | 'rfp' | 'rfq';
  title: string;
  description: string;
  category: string;
  items: RFXItem[];
  questionSections: RFXQuestionSection[];
  scoringCriteria: RFXScoringCriteria[];
  status: 'draft' | 'published' | 'closed' | 'evaluated' | 'awarded';
  publicationDate?: string;
  deadline: string;
  qaPeriod?: {
    startDate: string;
    endDate: string;
  };
  invitedSuppliers: string[];
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  closedAt?: string;
  awardedAt?: string;
  awardedTo?: string;
}

export interface RFXItem {
  id: string;
  itemId: string;
  itemName: string;
  quantity: number;
  unitOfMeasure: string;
  specifications?: string;
}

export interface RFXQuestionSection {
  id: string;
  title: string;
  description?: string;
  questions: RFXQuestion[];
}

export interface RFXQuestion {
  id: string;
  question: string;
  type: 'text' | 'number' | 'boolean' | 'multiple-choice' | 'file';
  required: boolean;
  options?: string[];
  weight?: number;
}

export interface RFXScoringCriteria {
  id: string;
  criteria: string;
  weight: number;
  maxScore: number;
}

export interface CreateRFXRequest {
  type: 'rfi' | 'rfp' | 'rfq';
  title: string;
  description: string;
  category: string;
  items: Array<{
    itemId: string;
    quantity: number;
    unitOfMeasure: string;
    specifications?: string;
  }>;
  questionSections: Array<{
    title: string;
    description?: string;
    questions: Array<{
      question: string;
      type: 'text' | 'number' | 'boolean' | 'multiple-choice' | 'file';
      required: boolean;
      options?: string[];
      weight?: number;
    }>;
  }>;
  scoringCriteria: Array<{
    criteria: string;
    weight: number;
    maxScore: number;
  }>;
  deadline: string;
  qaPeriod?: {
    startDate: string;
    endDate: string;
  };
  invitedSuppliers: string[];
}

export interface UpdateRFXRequest {
  title?: string;
  description?: string;
  category?: string;
  items?: Array<{
    itemId: string;
    quantity: number;
    unitOfMeasure: string;
    specifications?: string;
  }>;
  questionSections?: Array<{
    title: string;
    description?: string;
    questions: Array<{
      question: string;
      type: 'text' | 'number' | 'boolean' | 'multiple-choice' | 'file';
      required: boolean;
      options?: string[];
      weight?: number;
    }>;
  }>;
  scoringCriteria?: Array<{
    criteria: string;
    weight: number;
    maxScore: number;
  }>;
  deadline?: string;
  qaPeriod?: {
    startDate: string;
    endDate: string;
  };
  invitedSuppliers?: string[];
}

export interface RFXResponse {
  id: string;
  rfxId: string;
  supplierId: string;
  supplierName: string;
  submittedAt: string;
  status: 'draft' | 'submitted' | 'under-review' | 'shortlisted' | 'rejected';
  answers: RFXAnswer[];
  pricing: RFXPricing[];
  score?: number;
  totalValue?: number;
  evaluatorComments?: string;
}

export interface RFXAnswer {
  id: string;
  questionId: string;
  question: string;
  answer: string;
  attachments?: string[];
}

export interface RFXPricing {
  id: string;
  itemId: string;
  itemName: string;
  unitPrice: number;
  totalPrice: number;
  deliveryTime: number;
  notes?: string;
}

export interface ProcurementAnalytics {
  totalRequisitions: number;
  totalPurchaseOrders: number;
  totalSpend: number;
  averageProcessingTime: number;
  requisitionsByStatus: Record<string, number>;
  purchaseOrdersByStatus: Record<string, number>;
  spendByCategory: Array<{
    category: string;
    spend: number;
    percentage: number;
  }>;
  spendBySupplier: Array<{
    supplierId: string;
    supplierName: string;
    spend: number;
    orderCount: number;
  }>;
  processingTimeTrends: Array<{
    month: string;
    averageDays: number;
    requisitionCount: number;
  }>;
}

export type RequisitionFormData = Omit<
  Requisition,
  'id' | 'requisitionNumber' | 'status' | 'createdAt' | 'updatedAt' | 'submittedAt' | 'approvedAt' | 'audit'
>;

export type RequisitionFilters = {
  status?: RequisitionStatus;
  dateRange?: {
    start: string;
    end: string;
  };
  department?: string;
  requestor?: string;
  costCenter?: string;
  minAmount?: number;
  maxAmount?: number;
  priority?: RequisitionPriority;
  category?: RequisitionCategory;
  budgetYear?: number;
  procurementType?: Requisition['procurementType'];
  procurementMethod?: Requisition['procurementMethod'];
  approver?: string;
  projectCode?: string;
  budgetCode?: string;
};