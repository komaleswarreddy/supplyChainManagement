import type { User } from './user';
import type { Supplier } from './supplier';

export type RfxType = 'RFI' | 'RFP' | 'RFQ';

export type RfxStatus = 
  | 'DRAFT'
  | 'PUBLISHED'
  | 'IN_PROGRESS'
  | 'CLOSED'
  | 'CANCELLED'
  | 'AWARDED';

export type ResponseFormat = 
  | 'TEXT'
  | 'NUMBER'
  | 'DATE'
  | 'BOOLEAN'
  | 'SINGLE_CHOICE'
  | 'MULTIPLE_CHOICE'
  | 'FILE'
  | 'TABLE';

export type QuestionSection = {
  id: string;
  title: string;
  description?: string;
  order: number;
  questions: Question[];
};

export type Question = {
  id: string;
  text: string;
  description?: string;
  required: boolean;
  format: ResponseFormat;
  options?: string[];
  weight?: number;
  maxScore?: number;
  minScore?: number;
  attachments?: string[];
};

export type SupplierResponse = {
  id: string;
  supplier: Supplier;
  submittedAt: string;
  submittedBy: {
    name: string;
    email: string;
    phone?: string;
  };
  status: 'DRAFT' | 'SUBMITTED' | 'WITHDRAWN';
  answers: {
    questionId: string;
    value: any;
    attachments?: string[];
    notes?: string;
  }[];
  score?: number;
  evaluationNotes?: string;
  evaluatedBy?: User;
  evaluatedAt?: string;
};

export type RfxDocument = {
  id: string;
  title: string;
  type: 'SPECIFICATION' | 'TEMPLATE' | 'ATTACHMENT' | 'RESPONSE';
  url: string;
  uploadedBy: User;
  uploadedAt: string;
  description?: string;
  version?: string;
};

export type Rfx = {
  id: string;
  number: string;
  title: string;
  description: string;
  type: RfxType;
  status: RfxStatus;
  publishDate: string;
  closeDate: string;
  currency: string;
  sections: QuestionSection[];
  selectedSuppliers: Supplier[];
  responses: SupplierResponse[];
  documents: RfxDocument[];
  scoringCriteria?: {
    technicalWeight: number;
    commercialWeight: number;
    criteria: Array<{
      name: string;
      weight: number;
      description?: string;
    }>;
  };
  settings: {
    allowLateSubmissions: boolean;
    allowSupplierQuestions: boolean;
    questionDeadline?: string;
    visibleToAllSuppliers: boolean;
    requireNda: boolean;
  };
  metadata?: {
    department?: string;
    category?: string;
    projectCode?: string;
    budgetCode?: string;
  };
  createdBy: User;
  createdAt: string;
  updatedBy?: User;
  updatedAt: string;
  publishedBy?: User;
  publishedAt?: string;
  closedBy?: User;
  closedAt?: string;
  cancelledBy?: User;
  cancelledAt?: string;
  cancellationReason?: string;
  audit: {
    statusHistory: Array<{
      status: RfxStatus;
      timestamp: string;
      user: {
        id: string;
        name: string;
      };
      comment?: string;
    }>;
  };
};

export type RfxFilters = {
  type?: RfxType;
  status?: RfxStatus;
  supplier?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  department?: string;
  category?: string;
};

export type RfxFormData = Omit<
  Rfx,
  | 'id'
  | 'number'
  | 'status'
  | 'responses'
  | 'createdAt'
  | 'updatedAt'
  | 'createdBy'
  | 'updatedBy'
  | 'publishedAt'
  | 'publishedBy'
  | 'closedAt'
  | 'closedBy'
  | 'cancelledAt'
  | 'cancelledBy'
  | 'audit'
>;