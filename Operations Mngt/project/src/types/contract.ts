import type { User } from './user';
import type { Supplier } from './supplier';

export interface Contract {
  id: string;
  contractNumber: string;
  title: string;
  type: ContractType;
  supplierId: string;
  supplierName: string;
  startDate: string;
  endDate: string;
  value: number;
  currency: string;
  status: ContractStatus;
  ownerId: string;
  ownerName: string;
  category: string;
  documents: ContractDocument[];
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  activatedAt?: string;
  terminatedAt?: string;
}

export type ContractType = 'purchase' | 'service' | 'license' | 'partnership' | 'nda' | 'msa';
export type ContractStatus = 'draft' | 'pending' | 'approved' | 'active' | 'expired' | 'terminated' | 'renewed';

export interface ContractDocument {
  id: string;
  name: string;
  type: string;
  url: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface CreateContractRequest {
  title: string;
  type: ContractType;
  supplierId: string;
  startDate: string;
  endDate: string;
  value: number;
  currency: string;
  category: string;
  documents?: Array<{
    name: string;
    type: string;
    url: string;
  }>;
}

export interface UpdateContractRequest {
  title?: string;
  type?: ContractType;
  supplierId?: string;
  startDate?: string;
  endDate?: string;
  value?: number;
  currency?: string;
  category?: string;
  documents?: Array<{
    name: string;
    type: string;
    url: string;
  }>;
}

export interface ContractAmendment {
  id: string;
  contractId: string;
  amendmentType: 'minor' | 'major';
  description: string;
  changes: Array<{
    section: string;
    field: string;
    oldValue: any;
    newValue: any;
  }>;
  effectiveDate: string;
  createdBy: string;
  createdAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface ContractObligation {
  id: string;
  contractId: string;
  type: 'delivery' | 'payment' | 'service' | 'compliance';
  description: string;
  dueDate: string;
  status: 'pending' | 'completed' | 'overdue';
  assignedTo: string;
  completionDate?: string;
}

export interface ContractMilestone {
  id: string;
  contractId: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'pending' | 'completed' | 'overdue';
  completionDate?: string;
  completionNotes?: string;
}

export interface ContractCompliance {
  overallCompliance: 'compliant' | 'non-compliant' | 'at-risk';
  complianceScore: number;
  areas: Array<{
    area: string;
    status: 'compliant' | 'non-compliant' | 'at-risk';
    score: number;
    issues: Array<{
      id: string;
      description: string;
      severity: 'low' | 'medium' | 'high';
      dueDate: string;
    }>;
  }>;
}

export interface ContractHistory {
  id: string;
  action: string;
  performedBy: string;
  performedAt: string;
  details: any;
}

export interface ContractAnalytics {
  totalContracts: number;
  totalValue: number;
  averageContractValue: number;
  contractsByStatus: Record<ContractStatus, number>;
  contractsByType: Record<ContractType, number>;
  contractsByMonth: Array<{
    month: string;
    count: number;
    value: number;
  }>;
  expiringContracts: Array<{
    id: string;
    title: string;
    supplierName: string;
    endDate: string;
    daysUntilExpiry: number;
  }>;
}

export interface ContractClause {
  id: string;
  category: string;
  text: string;
  riskLevel: 'low' | 'medium' | 'high';
  applicability: string[];
  version: string;
  lastUpdated: string;
}

export interface ContractTemplate {
  id: string;
  name: string;
  type: ContractType;
  category: string;
  clauses: string[];
  variables: Array<{
    name: string;
    type: string;
    required: boolean;
    defaultValue?: any;
  }>;
  createdAt: string;
  updatedAt: string;
}