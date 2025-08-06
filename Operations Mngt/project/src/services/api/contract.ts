import axios from 'axios';
import { Contract, CreateContractRequest, UpdateContractRequest, ContractStatus, ContractType } from '@/types/contract';

const API_BASE_URL = '/api/contracts';

export const contractApi = {
  // Get all contracts with filtering and pagination
  async getContracts(params?: {
    page?: number;
    limit?: number;
    status?: ContractStatus;
    type?: ContractType;
    supplierId?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
  }): Promise<{ data: Contract[]; total: number; page: number; limit: number }> {
    const response = await axios.get(API_BASE_URL, { params });
    return response.data;
  },

  // Get a single contract by ID
  async getContract(id: string): Promise<Contract> {
    const response = await axios.get(`${API_BASE_URL}/${id}`);
    return response.data;
  },

  // Create a new contract
  async createContract(data: CreateContractRequest): Promise<Contract> {
    const response = await axios.post(API_BASE_URL, data);
    return response.data;
  },

  // Update an existing contract
  async updateContract(id: string, data: UpdateContractRequest): Promise<Contract> {
    const response = await axios.put(`${API_BASE_URL}/${id}`, data);
    return response.data;
  },

  // Delete a contract
  async deleteContract(id: string): Promise<void> {
    await axios.delete(`${API_BASE_URL}/${id}`);
  },

  // Approve a contract
  async approveContract(id: string, approvalData: { approvedBy: string; comments?: string }): Promise<Contract> {
    const response = await axios.post(`${API_BASE_URL}/${id}/approve`, approvalData);
    return response.data;
  },

  // Reject a contract
  async rejectContract(id: string, rejectionData: { rejectedBy: string; reason: string }): Promise<Contract> {
    const response = await axios.post(`${API_BASE_URL}/${id}/reject`, rejectionData);
    return response.data;
  },

  // Activate a contract
  async activateContract(id: string): Promise<Contract> {
    const response = await axios.post(`${API_BASE_URL}/${id}/activate`);
    return response.data;
  },

  // Terminate a contract
  async terminateContract(id: string, terminationData: { 
    terminatedBy: string; 
    reason: string; 
    effectiveDate: string;
    settlementAmount?: number;
  }): Promise<Contract> {
    const response = await axios.post(`${API_BASE_URL}/${id}/terminate`, terminationData);
    return response.data;
  },

  // Renew a contract
  async renewContract(id: string, renewalData: {
    renewedBy: string;
    newEndDate: string;
    changes?: Array<{
      field: string;
      oldValue: any;
      newValue: any;
    }>;
  }): Promise<Contract> {
    const response = await axios.post(`${API_BASE_URL}/${id}/renew`, renewalData);
    return response.data;
  },

  // Create contract amendment
  async createAmendment(id: string, amendmentData: {
    amendmentType: 'minor' | 'major';
    description: string;
    changes: Array<{
      section: string;
      field: string;
      oldValue: any;
      newValue: any;
    }>;
    effectiveDate: string;
  }): Promise<Contract> {
    const response = await axios.post(`${API_BASE_URL}/${id}/amendments`, amendmentData);
    return response.data;
  },

  // Get contract amendments
  async getContractAmendments(id: string): Promise<Array<{
    id: string;
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
  }>> {
    const response = await axios.get(`${API_BASE_URL}/${id}/amendments`);
    return response.data;
  },

  // Get contract obligations
  async getContractObligations(id: string): Promise<Array<{
    id: string;
    type: 'delivery' | 'payment' | 'service' | 'compliance';
    description: string;
    dueDate: string;
    status: 'pending' | 'completed' | 'overdue';
    assignedTo: string;
    completionDate?: string;
  }>> {
    const response = await axios.get(`${API_BASE_URL}/${id}/obligations`);
    return response.data;
  },

  // Create contract obligation
  async createObligation(id: string, obligationData: {
    type: 'delivery' | 'payment' | 'service' | 'compliance';
    description: string;
    dueDate: string;
    assignedTo: string;
  }): Promise<{
    id: string;
    type: 'delivery' | 'payment' | 'service' | 'compliance';
    description: string;
    dueDate: string;
    status: 'pending' | 'completed' | 'overdue';
    assignedTo: string;
  }> {
    const response = await axios.post(`${API_BASE_URL}/${id}/obligations`, obligationData);
    return response.data;
  },

  // Get contract milestones
  async getContractMilestones(id: string): Promise<Array<{
    id: string;
    title: string;
    description: string;
    dueDate: string;
    status: 'pending' | 'completed' | 'overdue';
    completionDate?: string;
    completionNotes?: string;
  }>> {
    const response = await axios.get(`${API_BASE_URL}/${id}/milestones`);
    return response.data;
  },

  // Create contract milestone
  async createMilestone(id: string, milestoneData: {
    title: string;
    description: string;
    dueDate: string;
  }): Promise<{
    id: string;
    title: string;
    description: string;
    dueDate: string;
    status: 'pending' | 'completed' | 'overdue';
  }> {
    const response = await axios.post(`${API_BASE_URL}/${id}/milestones`, milestoneData);
    return response.data;
  },

  // Complete milestone
  async completeMilestone(id: string, milestoneId: string, completionData: {
    completionNotes?: string;
  }): Promise<{
    id: string;
    title: string;
    description: string;
    dueDate: string;
    status: 'pending' | 'completed' | 'overdue';
    completionDate: string;
    completionNotes?: string;
  }> {
    const response = await axios.post(`${API_BASE_URL}/${id}/milestones/${milestoneId}/complete`, completionData);
    return response.data;
  },

  // Get contract compliance status
  async getContractCompliance(id: string): Promise<{
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
  }> {
    const response = await axios.get(`${API_BASE_URL}/${id}/compliance`);
    return response.data;
  },

  // Get contract history
  async getContractHistory(id: string): Promise<Array<{
    id: string;
    action: string;
    performedBy: string;
    performedAt: string;
    details: any;
  }>> {
    const response = await axios.get(`${API_BASE_URL}/${id}/history`);
    return response.data;
  },

  // Get contract analytics
  async getContractAnalytics(params?: {
    startDate?: string;
    endDate?: string;
    type?: ContractType;
    supplierId?: string;
  }): Promise<{
    totalContracts: number;
    totalValue: number;
    averageContractValue: number;
    contractsByStatus: Record<ContractStatus, number>;
    contractsByType: Record<ContractType, number>;
    contractsByMonth: Array<{ month: string; count: number; value: number }>;
    expiringContracts: Array<{
      id: string;
      title: string;
      supplierName: string;
      endDate: string;
      daysUntilExpiry: number;
    }>;
  }> {
    const response = await axios.get(`${API_BASE_URL}/analytics`, { params });
    return response.data;
  },

  // Bulk operations
  async bulkApprove(ids: string[], approvalData: { approvedBy: string; comments?: string }): Promise<Contract[]> {
    const response = await axios.post(`${API_BASE_URL}/bulk/approve`, { ids, ...approvalData });
    return response.data;
  },

  async bulkActivate(ids: string[]): Promise<Contract[]> {
    const response = await axios.post(`${API_BASE_URL}/bulk/activate`, { ids });
    return response.data;
  },

  // Export contracts
  async exportContracts(params?: {
    format?: 'csv' | 'excel' | 'pdf';
    status?: ContractStatus;
    type?: ContractType;
    supplierId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<Blob> {
    const response = await axios.get(`${API_BASE_URL}/export`, { 
      params,
      responseType: 'blob'
    });
    return response.data;
  },
};



