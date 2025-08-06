import { apiClient } from '@/lib/api-client';
import { z } from 'zod';

// Zod schemas for validation
export const ContractSchema = z.object({
  id: z.string().optional(),
  contractNumber: z.string().min(1, 'Contract number is required'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  type: z.enum(['SUPPLIER', 'CUSTOMER', 'SERVICE', 'LEASE', 'EMPLOYMENT', 'PARTNERSHIP']),
  category: z.string().min(1, 'Category is required'),
  status: z.enum(['DRAFT', 'NEGOTIATION', 'PENDING_APPROVAL', 'ACTIVE', 'EXPIRED', 'TERMINATED']),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'CRITICAL']),
  value: z.number().min(0).optional(),
  currency: z.string().default('USD'),
  startDate: z.string(),
  endDate: z.string(),
  renewalDate: z.string().optional(),
  autoRenewal: z.boolean().default(false),
  renewalTerms: z.record(z.any()).optional(),
  ownerId: z.string().min(1, 'Owner is required'),
  approverId: z.string().optional(),
  approvedAt: z.string().optional(),
  counterparty: z.object({
    name: z.string(),
    type: z.enum(['INDIVIDUAL', 'COMPANY', 'GOVERNMENT']),
    contactInfo: z.object({
      email: z.string().email(),
      phone: z.string(),
      address: z.string()
    })
  }),
  terms: z.record(z.any()),
  attachments: z.array(z.object({
    id: z.string(),
    name: z.string(),
    url: z.string(),
    type: z.string()
  })).optional(),
  riskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  complianceStatus: z.enum(['COMPLIANT', 'NON_COMPLIANT', 'PENDING_REVIEW']),
  notes: z.string().optional()
});

export const ContractPartySchema = z.object({
  id: z.string().optional(),
  contractId: z.string().min(1, 'Contract is required'),
  partyType: z.enum(['PRIMARY', 'COUNTERPARTY', 'THIRD_PARTY', 'GUARANTOR']),
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['INDIVIDUAL', 'COMPANY', 'GOVERNMENT']),
  contactInfo: z.object({
    email: z.string().email(),
    phone: z.string(),
    address: z.string()
  }),
  address: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string(),
    country: z.string()
  }).optional(),
  taxId: z.string().optional(),
  registrationNumber: z.string().optional(),
  role: z.enum(['BUYER', 'SELLER', 'SERVICE_PROVIDER', 'GUARANTOR']),
  signature: z.object({
    signedBy: z.string(),
    signedAt: z.string(),
    signatureType: z.string()
  }).optional(),
  signedAt: z.string().optional(),
  notes: z.string().optional()
});

export const ContractTermSchema = z.object({
  id: z.string().optional(),
  contractId: z.string().min(1, 'Contract is required'),
  section: z.string().min(1, 'Section is required'),
  subsection: z.string().optional(),
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  type: z.enum(['GENERAL', 'PAYMENT', 'DELIVERY', 'WARRANTY', 'TERMINATION', 'COMPLIANCE']),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'CRITICAL']),
  isRequired: z.boolean().default(true),
  isCompliant: z.boolean().default(true),
  complianceNotes: z.string().optional(),
  effectiveDate: z.string(),
  endDate: z.string().optional(),
  notes: z.string().optional()
});

export const ContractAmendmentSchema = z.object({
  id: z.string().optional(),
  contractId: z.string().min(1, 'Contract is required'),
  amendmentNumber: z.string().min(1, 'Amendment number is required'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  type: z.enum(['EXTENSION', 'MODIFICATION', 'TERMINATION', 'RENEWAL']),
  status: z.enum(['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED']),
  effectiveDate: z.string(),
  changes: z.record(z.any()),
  reason: z.string().min(1, 'Reason is required'),
  impact: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  approverId: z.string().optional(),
  approvedAt: z.string().optional(),
  attachments: z.array(z.object({
    id: z.string(),
    name: z.string(),
    url: z.string(),
    type: z.string()
  })).optional(),
  notes: z.string().optional()
});

export const ContractObligationSchema = z.object({
  id: z.string().optional(),
  contractId: z.string().min(1, 'Contract is required'),
  obligationNumber: z.string().min(1, 'Obligation number is required'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  type: z.enum(['DELIVERY', 'PAYMENT', 'REPORTING', 'COMPLIANCE', 'PERFORMANCE']),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE', 'CANCELLED']),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'CRITICAL']),
  dueDate: z.string(),
  completedDate: z.string().optional(),
  assignedTo: z.string().optional(),
  responsibleParty: z.enum(['US', 'COUNTERPARTY', 'BOTH']),
  value: z.number().min(0).optional(),
  currency: z.string().default('USD'),
  completionCriteria: z.record(z.any()),
  attachments: z.array(z.object({
    id: z.string(),
    name: z.string(),
    url: z.string(),
    type: z.string()
  })).optional(),
  notes: z.string().optional()
});

export const ContractMilestoneSchema = z.object({
  id: z.string().optional(),
  contractId: z.string().min(1, 'Contract is required'),
  milestoneNumber: z.string().min(1, 'Milestone number is required'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  type: z.enum(['DELIVERY', 'PAYMENT', 'REVIEW', 'APPROVAL', 'COMPLETION']),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'DELAYED', 'CANCELLED']),
  dueDate: z.string(),
  completedDate: z.string().optional(),
  assignedTo: z.string().optional(),
  completionCriteria: z.record(z.any()),
  deliverables: z.array(z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    status: z.string()
  })).optional(),
  attachments: z.array(z.object({
    id: z.string(),
    name: z.string(),
    url: z.string(),
    type: z.string()
  })).optional(),
  notes: z.string().optional()
});

export const ContractComplianceSchema = z.object({
  id: z.string().optional(),
  contractId: z.string().min(1, 'Contract is required'),
  complianceNumber: z.string().min(1, 'Compliance number is required'),
  requirement: z.string().min(1, 'Requirement is required'),
  description: z.string().optional(),
  type: z.enum(['REGULATORY', 'CONTRACTUAL', 'INTERNAL', 'INDUSTRY']),
  category: z.string().min(1, 'Category is required'),
  status: z.enum(['PENDING', 'COMPLIANT', 'NON_COMPLIANT', 'EXEMPT']),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'CRITICAL']),
  dueDate: z.string(),
  reviewDate: z.string().optional(),
  reviewedBy: z.string().optional(),
  complianceEvidence: z.record(z.any()).optional(),
  riskAssessment: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  correctiveActions: z.array(z.object({
    action: z.string(),
    assignedTo: z.string(),
    dueDate: z.string(),
    status: z.string()
  })).optional(),
  attachments: z.array(z.object({
    id: z.string(),
    name: z.string(),
    url: z.string(),
    type: z.string()
  })).optional(),
  notes: z.string().optional()
});

export const ContractTemplateSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  type: z.enum(['SUPPLIER', 'CUSTOMER', 'SERVICE', 'LEASE', 'EMPLOYMENT']),
  category: z.string().min(1, 'Category is required'),
  template: z.record(z.any()),
  terms: z.record(z.any()),
  isDefault: z.boolean().default(false),
  isActive: z.boolean().default(true),
  version: z.string().default('1.0'),
  createdBy: z.string().min(1, 'Creator is required')
});

// Types
export type Contract = z.infer<typeof ContractSchema>;
export type ContractParty = z.infer<typeof ContractPartySchema>;
export type ContractTerm = z.infer<typeof ContractTermSchema>;
export type ContractAmendment = z.infer<typeof ContractAmendmentSchema>;
export type ContractObligation = z.infer<typeof ContractObligationSchema>;
export type ContractMilestone = z.infer<typeof ContractMilestoneSchema>;
export type ContractCompliance = z.infer<typeof ContractComplianceSchema>;
export type ContractTemplate = z.infer<typeof ContractTemplateSchema>;

// API endpoints
const CONTRACTS_API_BASE = '/api/contracts';

// Contracts API
export const contractAPI = {
  // Get all contracts
  getAll: async (params?: {
    search?: string;
    type?: string;
    status?: string;
    priority?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await apiClient.get(`${CONTRACTS_API_BASE}/contracts`, { params });
    return response.data;
  },

  // Get contract by ID
  getById: async (id: string) => {
    const response = await apiClient.get(`${CONTRACTS_API_BASE}/contracts/${id}`);
    return response.data;
  },

  // Create new contract
  create: async (data: Omit<Contract, 'id'>) => {
    const validatedData = ContractSchema.parse(data);
    const response = await apiClient.post(`${CONTRACTS_API_BASE}/contracts`, validatedData);
    return response.data;
  },

  // Update contract
  update: async (id: string, data: Partial<Contract>) => {
    const validatedData = ContractSchema.partial().parse(data);
    const response = await apiClient.put(`${CONTRACTS_API_BASE}/contracts/${id}`, validatedData);
    return response.data;
  },

  // Delete contract
  delete: async (id: string) => {
    const response = await apiClient.delete(`${CONTRACTS_API_BASE}/contracts/${id}`);
    return response.data;
  },

  // Approve contract
  approve: async (id: string) => {
    const response = await apiClient.post(`${CONTRACTS_API_BASE}/contracts/${id}/approve`);
    return response.data;
  },

  // Get contract analytics
  getAnalytics: async (id: string) => {
    const response = await apiClient.get(`${CONTRACTS_API_BASE}/contracts/${id}/analytics`);
    return response.data;
  }
};

// Contract Parties API
export const contractPartyAPI = {
  // Get all parties for a contract
  getAll: async (contractId: string) => {
    const response = await apiClient.get(`${CONTRACTS_API_BASE}/contracts/${contractId}/parties`);
    return response.data;
  },

  // Get party by ID
  getById: async (contractId: string, partyId: string) => {
    const response = await apiClient.get(`${CONTRACTS_API_BASE}/contracts/${contractId}/parties/${partyId}`);
    return response.data;
  },

  // Create new party
  create: async (contractId: string, data: Omit<ContractParty, 'id' | 'contractId'>) => {
    const validatedData = ContractPartySchema.omit({ id: true, contractId: true }).parse(data);
    const response = await apiClient.post(`${CONTRACTS_API_BASE}/contracts/${contractId}/parties`, validatedData);
    return response.data;
  },

  // Update party
  update: async (contractId: string, partyId: string, data: Partial<ContractParty>) => {
    const validatedData = ContractPartySchema.partial().parse(data);
    const response = await apiClient.put(`${CONTRACTS_API_BASE}/contracts/${contractId}/parties/${partyId}`, validatedData);
    return response.data;
  },

  // Delete party
  delete: async (contractId: string, partyId: string) => {
    const response = await apiClient.delete(`${CONTRACTS_API_BASE}/contracts/${contractId}/parties/${partyId}`);
    return response.data;
  }
};

// Contract Terms API
export const contractTermAPI = {
  // Get all terms for a contract
  getAll: async (contractId: string) => {
    const response = await apiClient.get(`${CONTRACTS_API_BASE}/contracts/${contractId}/terms`);
    return response.data;
  },

  // Get term by ID
  getById: async (contractId: string, termId: string) => {
    const response = await apiClient.get(`${CONTRACTS_API_BASE}/contracts/${contractId}/terms/${termId}`);
    return response.data;
  },

  // Create new term
  create: async (contractId: string, data: Omit<ContractTerm, 'id' | 'contractId'>) => {
    const validatedData = ContractTermSchema.omit({ id: true, contractId: true }).parse(data);
    const response = await apiClient.post(`${CONTRACTS_API_BASE}/contracts/${contractId}/terms`, validatedData);
    return response.data;
  },

  // Update term
  update: async (contractId: string, termId: string, data: Partial<ContractTerm>) => {
    const validatedData = ContractTermSchema.partial().parse(data);
    const response = await apiClient.put(`${CONTRACTS_API_BASE}/contracts/${contractId}/terms/${termId}`, validatedData);
    return response.data;
  },

  // Delete term
  delete: async (contractId: string, termId: string) => {
    const response = await apiClient.delete(`${CONTRACTS_API_BASE}/contracts/${contractId}/terms/${termId}`);
    return response.data;
  }
};

// Contract Amendments API
export const contractAmendmentAPI = {
  // Get all amendments for a contract
  getAll: async (contractId: string) => {
    const response = await apiClient.get(`${CONTRACTS_API_BASE}/contracts/${contractId}/amendments`);
    return response.data;
  },

  // Get amendment by ID
  getById: async (contractId: string, amendmentId: string) => {
    const response = await apiClient.get(`${CONTRACTS_API_BASE}/contracts/${contractId}/amendments/${amendmentId}`);
    return response.data;
  },

  // Create new amendment
  create: async (contractId: string, data: Omit<ContractAmendment, 'id' | 'contractId'>) => {
    const validatedData = ContractAmendmentSchema.omit({ id: true, contractId: true }).parse(data);
    const response = await apiClient.post(`${CONTRACTS_API_BASE}/contracts/${contractId}/amendments`, validatedData);
    return response.data;
  },

  // Update amendment
  update: async (contractId: string, amendmentId: string, data: Partial<ContractAmendment>) => {
    const validatedData = ContractAmendmentSchema.partial().parse(data);
    const response = await apiClient.put(`${CONTRACTS_API_BASE}/contracts/${contractId}/amendments/${amendmentId}`, validatedData);
    return response.data;
  },

  // Delete amendment
  delete: async (contractId: string, amendmentId: string) => {
    const response = await apiClient.delete(`${CONTRACTS_API_BASE}/contracts/${contractId}/amendments/${amendmentId}`);
    return response.data;
  },

  // Approve amendment
  approve: async (contractId: string, amendmentId: string) => {
    const response = await apiClient.post(`${CONTRACTS_API_BASE}/contracts/${contractId}/amendments/${amendmentId}/approve`);
    return response.data;
  }
};

// Contract Obligations API
export const contractObligationAPI = {
  // Get all obligations for a contract
  getAll: async (contractId: string) => {
    const response = await apiClient.get(`${CONTRACTS_API_BASE}/contracts/${contractId}/obligations`);
    return response.data;
  },

  // Get obligation by ID
  getById: async (contractId: string, obligationId: string) => {
    const response = await apiClient.get(`${CONTRACTS_API_BASE}/contracts/${contractId}/obligations/${obligationId}`);
    return response.data;
  },

  // Create new obligation
  create: async (contractId: string, data: Omit<ContractObligation, 'id' | 'contractId'>) => {
    const validatedData = ContractObligationSchema.omit({ id: true, contractId: true }).parse(data);
    const response = await apiClient.post(`${CONTRACTS_API_BASE}/contracts/${contractId}/obligations`, validatedData);
    return response.data;
  },

  // Update obligation
  update: async (contractId: string, obligationId: string, data: Partial<ContractObligation>) => {
    const validatedData = ContractObligationSchema.partial().parse(data);
    const response = await apiClient.put(`${CONTRACTS_API_BASE}/contracts/${contractId}/obligations/${obligationId}`, validatedData);
    return response.data;
  },

  // Delete obligation
  delete: async (contractId: string, obligationId: string) => {
    const response = await apiClient.delete(`${CONTRACTS_API_BASE}/contracts/${contractId}/obligations/${obligationId}`);
    return response.data;
  },

  // Complete obligation
  complete: async (contractId: string, obligationId: string, data?: { notes?: string }) => {
    const response = await apiClient.post(`${CONTRACTS_API_BASE}/contracts/${contractId}/obligations/${obligationId}/complete`, data);
    return response.data;
  }
};

// Contract Milestones API
export const contractMilestoneAPI = {
  // Get all milestones for a contract
  getAll: async (contractId: string) => {
    const response = await apiClient.get(`${CONTRACTS_API_BASE}/contracts/${contractId}/milestones`);
    return response.data;
  },

  // Get milestone by ID
  getById: async (contractId: string, milestoneId: string) => {
    const response = await apiClient.get(`${CONTRACTS_API_BASE}/contracts/${contractId}/milestones/${milestoneId}`);
    return response.data;
  },

  // Create new milestone
  create: async (contractId: string, data: Omit<ContractMilestone, 'id' | 'contractId'>) => {
    const validatedData = ContractMilestoneSchema.omit({ id: true, contractId: true }).parse(data);
    const response = await apiClient.post(`${CONTRACTS_API_BASE}/contracts/${contractId}/milestones`, validatedData);
    return response.data;
  },

  // Update milestone
  update: async (contractId: string, milestoneId: string, data: Partial<ContractMilestone>) => {
    const validatedData = ContractMilestoneSchema.partial().parse(data);
    const response = await apiClient.put(`${CONTRACTS_API_BASE}/contracts/${contractId}/milestones/${milestoneId}`, validatedData);
    return response.data;
  },

  // Delete milestone
  delete: async (contractId: string, milestoneId: string) => {
    const response = await apiClient.delete(`${CONTRACTS_API_BASE}/contracts/${contractId}/milestones/${milestoneId}`);
    return response.data;
  },

  // Complete milestone
  complete: async (contractId: string, milestoneId: string, data?: { notes?: string }) => {
    const response = await apiClient.post(`${CONTRACTS_API_BASE}/contracts/${contractId}/milestones/${milestoneId}/complete`, data);
    return response.data;
  }
};

// Contract Compliance API
export const contractComplianceAPI = {
  // Get all compliance requirements for a contract
  getAll: async (contractId: string) => {
    const response = await apiClient.get(`${CONTRACTS_API_BASE}/contracts/${contractId}/compliance`);
    return response.data;
  },

  // Get compliance requirement by ID
  getById: async (contractId: string, complianceId: string) => {
    const response = await apiClient.get(`${CONTRACTS_API_BASE}/contracts/${contractId}/compliance/${complianceId}`);
    return response.data;
  },

  // Create new compliance requirement
  create: async (contractId: string, data: Omit<ContractCompliance, 'id' | 'contractId'>) => {
    const validatedData = ContractComplianceSchema.omit({ id: true, contractId: true }).parse(data);
    const response = await apiClient.post(`${CONTRACTS_API_BASE}/contracts/${contractId}/compliance`, validatedData);
    return response.data;
  },

  // Update compliance requirement
  update: async (contractId: string, complianceId: string, data: Partial<ContractCompliance>) => {
    const validatedData = ContractComplianceSchema.partial().parse(data);
    const response = await apiClient.put(`${CONTRACTS_API_BASE}/contracts/${contractId}/compliance/${complianceId}`, validatedData);
    return response.data;
  },

  // Delete compliance requirement
  delete: async (contractId: string, complianceId: string) => {
    const response = await apiClient.delete(`${CONTRACTS_API_BASE}/contracts/${contractId}/compliance/${complianceId}`);
    return response.data;
  },

  // Review compliance
  review: async (contractId: string, complianceId: string, data: { status: string; notes?: string }) => {
    const response = await apiClient.post(`${CONTRACTS_API_BASE}/contracts/${contractId}/compliance/${complianceId}/review`, data);
    return response.data;
  }
};

// Contract Templates API
export const contractTemplateAPI = {
  // Get all templates
  getAll: async (params?: {
    search?: string;
    type?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
  }) => {
    const response = await apiClient.get(`${CONTRACTS_API_BASE}/templates`, { params });
    return response.data;
  },

  // Get template by ID
  getById: async (id: string) => {
    const response = await apiClient.get(`${CONTRACTS_API_BASE}/templates/${id}`);
    return response.data;
  },

  // Create new template
  create: async (data: Omit<ContractTemplate, 'id'>) => {
    const validatedData = ContractTemplateSchema.parse(data);
    const response = await apiClient.post(`${CONTRACTS_API_BASE}/templates`, validatedData);
    return response.data;
  },

  // Update template
  update: async (id: string, data: Partial<ContractTemplate>) => {
    const validatedData = ContractTemplateSchema.partial().parse(data);
    const response = await apiClient.put(`${CONTRACTS_API_BASE}/templates/${id}`, validatedData);
    return response.data;
  },

  // Delete template
  delete: async (id: string) => {
    const response = await apiClient.delete(`${CONTRACTS_API_BASE}/templates/${id}`);
    return response.data;
  }
};

// Contract Analytics API
export const contractAnalyticsAPI = {
  // Get dashboard metrics
  getDashboardMetrics: async () => {
    const response = await apiClient.get(`${CONTRACTS_API_BASE}/analytics/dashboard`);
    return response.data;
  },

  // Get contract value analysis
  getContractValue: async (params?: {
    startDate?: string;
    endDate?: string;
    type?: string;
  }) => {
    const response = await apiClient.get(`${CONTRACTS_API_BASE}/analytics/contract-value`, { params });
    return response.data;
  },

  // Get compliance analysis
  getComplianceAnalysis: async (params?: {
    startDate?: string;
    endDate?: string;
    type?: string;
  }) => {
    const response = await apiClient.get(`${CONTRACTS_API_BASE}/analytics/compliance`, { params });
    return response.data;
  },

  // Get risk analysis
  getRiskAnalysis: async (params?: {
    startDate?: string;
    endDate?: string;
  }) => {
    const response = await apiClient.get(`${CONTRACTS_API_BASE}/analytics/risk`, { params });
    return response.data;
  }
}; 