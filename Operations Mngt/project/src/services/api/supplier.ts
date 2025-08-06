import axios from 'axios';
import { 
  Supplier, 
  CreateSupplierRequest, 
  UpdateSupplierRequest, 
  SupplierPerformance,
  SupplierRiskAssessment,
  SupplierFinancialHealth,
  SupplierQualityMetrics
} from '@/types/supplier';

const API_BASE_URL = '/api/suppliers';

export const supplierApi = {
  // Supplier Management
  async getSuppliers(params?: {
    page?: number;
    limit?: number;
    category?: string;
    status?: 'active' | 'inactive' | 'suspended';
    search?: string;
  }): Promise<{ data: Supplier[]; total: number; page: number; limit: number }> {
    const response = await axios.get(API_BASE_URL, { params });
    return response.data;
  },

  async getSupplier(id: string): Promise<Supplier> {
    const response = await axios.get(`${API_BASE_URL}/${id}`);
    return response.data;
  },

  async createSupplier(data: CreateSupplierRequest): Promise<Supplier> {
    const response = await axios.post(API_BASE_URL, data);
    return response.data;
  },

  async updateSupplier(id: string, data: UpdateSupplierRequest): Promise<Supplier> {
    const response = await axios.put(`${API_BASE_URL}/${id}`, data);
    return response.data;
  },

  async deleteSupplier(id: string): Promise<void> {
    await axios.delete(`${API_BASE_URL}/${id}`);
  },

  async activateSupplier(id: string): Promise<Supplier> {
    const response = await axios.post(`${API_BASE_URL}/${id}/activate`);
    return response.data;
  },

  async deactivateSupplier(id: string, reason?: string): Promise<Supplier> {
    const response = await axios.post(`${API_BASE_URL}/${id}/deactivate`, { reason });
    return response.data;
  },

  // Supplier Performance
  async getSupplierPerformance(id: string, params?: {
    startDate?: string;
    endDate?: string;
    metrics?: string[];
  }): Promise<SupplierPerformance> {
    const response = await axios.get(`${API_BASE_URL}/${id}/performance`, { params });
    return response.data;
  },

  async updateSupplierPerformance(id: string, data: {
    onTimeDelivery: number;
    qualityScore: number;
    costCompetitiveness: number;
    communicationScore: number;
    notes?: string;
  }): Promise<SupplierPerformance> {
    const response = await axios.put(`${API_BASE_URL}/${id}/performance`, data);
    return response.data;
  },

  async getSupplierPerformanceHistory(id: string, params?: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
  }): Promise<{
    data: Array<{
      id: string;
      date: string;
      onTimeDelivery: number;
      qualityScore: number;
      costCompetitiveness: number;
      communicationScore: number;
      overallScore: number;
      notes?: string;
    }>;
    total: number;
  }> {
    const response = await axios.get(`${API_BASE_URL}/${id}/performance/history`, { params });
    return response.data;
  },

  // Supplier Risk Assessment
  async getSupplierRiskAssessment(id: string): Promise<SupplierRiskAssessment> {
    const response = await axios.get(`${API_BASE_URL}/${id}/risk-assessment`);
    return response.data;
  },

  async createRiskAssessment(id: string, data: {
    financialRisk: 'low' | 'medium' | 'high';
    operationalRisk: 'low' | 'medium' | 'high';
    complianceRisk: 'low' | 'medium' | 'high';
    geopoliticalRisk: 'low' | 'medium' | 'high';
    overallRisk: 'low' | 'medium' | 'high';
    riskFactors: string[];
    mitigationStrategies: string[];
    assessmentDate: string;
    nextReviewDate: string;
    notes?: string;
  }): Promise<SupplierRiskAssessment> {
    const response = await axios.post(`${API_BASE_URL}/${id}/risk-assessment`, data);
    return response.data;
  },

  async updateRiskAssessment(id: string, assessmentId: string, data: Partial<SupplierRiskAssessment>): Promise<SupplierRiskAssessment> {
    const response = await axios.put(`${API_BASE_URL}/${id}/risk-assessment/${assessmentId}`, data);
    return response.data;
  },

  async getRiskAssessmentHistory(id: string, params?: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
  }): Promise<{
    data: Array<{
      id: string;
      assessmentDate: string;
      overallRisk: 'low' | 'medium' | 'high';
      riskFactors: string[];
      assessedBy: string;
    }>;
    total: number;
  }> {
    const response = await axios.get(`${API_BASE_URL}/${id}/risk-assessment/history`, { params });
    return response.data;
  },

  // Supplier Financial Health
  async getSupplierFinancialHealth(id: string): Promise<SupplierFinancialHealth> {
    const response = await axios.get(`${API_BASE_URL}/${id}/financial-health`);
    return response.data;
  },

  async updateFinancialHealth(id: string, data: {
    creditRating: string;
    paymentTerms: number;
    outstandingBalance: number;
    paymentHistory: Array<{
      invoiceDate: string;
      dueDate: string;
      paidDate?: string;
      amount: number;
      status: 'paid' | 'overdue' | 'pending';
    }>;
    financialDocuments: Array<{
      type: string;
      documentUrl: string;
      uploadDate: string;
    }>;
    notes?: string;
  }): Promise<SupplierFinancialHealth> {
    const response = await axios.put(`${API_BASE_URL}/${id}/financial-health`, data);
    return response.data;
  },

  // Supplier Quality Management
  async getSupplierQualityMetrics(id: string, params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<SupplierQualityMetrics> {
    const response = await axios.get(`${API_BASE_URL}/${id}/quality-metrics`, { params });
    return response.data;
  },

  async updateQualityMetrics(id: string, data: {
    defectRate: number;
    returnRate: number;
    qualityIncidents: Array<{
      date: string;
      description: string;
      severity: 'low' | 'medium' | 'high';
      resolution: string;
    }>;
    certifications: Array<{
      type: string;
      issueDate: string;
      expiryDate: string;
      status: 'active' | 'expired' | 'pending';
    }>;
    auditResults: Array<{
      date: string;
      score: number;
      findings: string[];
      correctiveActions: string[];
    }>;
  }): Promise<SupplierQualityMetrics> {
    const response = await axios.put(`${API_BASE_URL}/${id}/quality-metrics`, data);
    return response.data;
  },

  // Supplier Sustainability
  async getSupplierSustainability(id: string): Promise<{
    sustainabilityScore: number;
    environmentalMetrics: {
      carbonFootprint: number;
      energyEfficiency: number;
      wasteReduction: number;
    };
    socialMetrics: {
      laborStandards: number;
      diversityScore: number;
      communityImpact: number;
    };
    governanceMetrics: {
      transparencyScore: number;
      complianceScore: number;
      ethicsScore: number;
    };
    sustainabilityCertifications: Array<{
      type: string;
      issueDate: string;
      expiryDate: string;
      status: 'active' | 'expired' | 'pending';
    }>;
  }> {
    const response = await axios.get(`${API_BASE_URL}/${id}/sustainability`);
    return response.data;
  },

  async updateSustainability(id: string, data: {
    sustainabilityScore: number;
    environmentalMetrics: {
      carbonFootprint: number;
      energyEfficiency: number;
      wasteReduction: number;
    };
    socialMetrics: {
      laborStandards: number;
      diversityScore: number;
      communityImpact: number;
    };
    governanceMetrics: {
      transparencyScore: number;
      complianceScore: number;
      ethicsScore: number;
    };
    sustainabilityCertifications: Array<{
      type: string;
      issueDate: string;
      expiryDate: string;
      status: 'active' | 'expired' | 'pending';
    }>;
  }): Promise<any> {
    const response = await axios.put(`${API_BASE_URL}/${id}/sustainability`, data);
    return response.data;
  },

  // Supplier Contracts
  async getSupplierContracts(id: string, params?: {
    page?: number;
    limit?: number;
    status?: 'active' | 'expired' | 'pending';
  }): Promise<{
    data: Array<{
      id: string;
      contractNumber: string;
      title: string;
      startDate: string;
      endDate: string;
      value: number;
      status: 'active' | 'expired' | 'pending';
      type: string;
    }>;
    total: number;
  }> {
    const response = await axios.get(`${API_BASE_URL}/${id}/contracts`, { params });
    return response.data;
  },

  // Supplier Orders
  async getSupplierOrders(id: string, params?: {
    page?: number;
    limit?: number;
    status?: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
    startDate?: string;
    endDate?: string;
  }): Promise<{
    data: Array<{
      id: string;
      orderNumber: string;
      orderDate: string;
      expectedDelivery: string;
      actualDelivery?: string;
      totalValue: number;
      status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
    }>;
    total: number;
  }> {
    const response = await axios.get(`${API_BASE_URL}/${id}/orders`, { params });
    return response.data;
  },

  // Supplier Analytics
  async getSupplierAnalytics(params?: {
    startDate?: string;
    endDate?: string;
    category?: string;
  }): Promise<{
    totalSuppliers: number;
    activeSuppliers: number;
    averagePerformanceScore: number;
    topPerformers: Array<{
      supplierId: string;
      supplierName: string;
      performanceScore: number;
      totalSpend: number;
    }>;
    riskDistribution: {
      low: number;
      medium: number;
      high: number;
    };
    spendByCategory: Array<{
      category: string;
      spend: number;
      supplierCount: number;
    }>;
    performanceTrends: Array<{
      month: string;
      averageScore: number;
      supplierCount: number;
    }>;
  }> {
    const response = await axios.get(`${API_BASE_URL}/analytics`, { params });
    return response.data;
  },

  // Bulk Operations
  async bulkUpdateStatus(ids: string[], status: 'active' | 'inactive' | 'suspended', reason?: string): Promise<Supplier[]> {
    const response = await axios.post(`${API_BASE_URL}/bulk/update-status`, { ids, status, reason });
    return response.data;
  },

  async bulkAssessRisk(ids: string[], assessmentData: {
    financialRisk: 'low' | 'medium' | 'high';
    operationalRisk: 'low' | 'medium' | 'high';
    complianceRisk: 'low' | 'medium' | 'high';
    geopoliticalRisk: 'low' | 'medium' | 'high';
    overallRisk: 'low' | 'medium' | 'high';
    riskFactors: string[];
    mitigationStrategies: string[];
  }): Promise<SupplierRiskAssessment[]> {
    const response = await axios.post(`${API_BASE_URL}/bulk/risk-assessment`, { ids, ...assessmentData });
    return response.data;
  },

  // Export functionality
  async exportSuppliers(params?: {
    format?: 'csv' | 'excel' | 'pdf';
    category?: string;
    status?: 'active' | 'inactive' | 'suspended';
  }): Promise<Blob> {
    const response = await axios.get(`${API_BASE_URL}/export`, { 
      params,
      responseType: 'blob'
    });
    return response.data;
  },

  async exportSupplierPerformance(id: string, params?: {
    format?: 'csv' | 'excel' | 'pdf';
    startDate?: string;
    endDate?: string;
  }): Promise<Blob> {
    const response = await axios.get(`${API_BASE_URL}/${id}/performance/export`, { 
      params,
      responseType: 'blob'
    });
    return response.data;
  },
};



