import axios from 'axios';
import { 
  SafetyStockCalculation,
  ReorderPointCalculation,
  ABCClassification,
  InventoryPolicy,
  OptimizationRecommendation
} from '@/types/inventory-optimization';

const API_BASE_URL = '/api/inventory/optimization';

export const inventoryOptimizationApi = {
  // Safety Stock Calculations
  async calculateSafetyStock(data: {
    itemId: string;
    locationId: string;
    serviceLevel: number; // 0.90, 0.95, 0.99
    demandVariability: number;
    leadTime: number;
    leadTimeVariability: number;
  }): Promise<SafetyStockCalculation> {
    const response = await axios.post(`${API_BASE_URL}/safety-stock`, data);
    return response.data;
  },

  async getSafetyStockCalculations(params?: {
    page?: number;
    limit?: number;
    itemId?: string;
    locationId?: string;
    serviceLevel?: number;
  }): Promise<{ data: SafetyStockCalculation[]; total: number; page: number; limit: number }> {
    const response = await axios.get(`${API_BASE_URL}/safety-stock`, { params });
    return response.data;
  },

  async updateSafetyStock(id: string, data: Partial<SafetyStockCalculation>): Promise<SafetyStockCalculation> {
    const response = await axios.put(`${API_BASE_URL}/safety-stock/${id}`, data);
    return response.data;
  },

  async deleteSafetyStock(id: string): Promise<void> {
    await axios.delete(`${API_BASE_URL}/safety-stock/${id}`);
  },

  // Reorder Point Calculations
  async calculateReorderPoint(data: {
    itemId: string;
    locationId: string;
    averageDailyDemand: number;
    leadTime: number;
    safetyStock: number;
  }): Promise<ReorderPointCalculation> {
    const response = await axios.post(`${API_BASE_URL}/reorder-point`, data);
    return response.data;
  },

  async getReorderPointCalculations(params?: {
    page?: number;
    limit?: number;
    itemId?: string;
    locationId?: string;
  }): Promise<{ data: ReorderPointCalculation[]; total: number; page: number; limit: number }> {
    const response = await axios.get(`${API_BASE_URL}/reorder-point`, { params });
    return response.data;
  },

  async updateReorderPoint(id: string, data: Partial<ReorderPointCalculation>): Promise<ReorderPointCalculation> {
    const response = await axios.put(`${API_BASE_URL}/reorder-point/${id}`, data);
    return response.data;
  },

  async deleteReorderPoint(id: string): Promise<void> {
    await axios.delete(`${API_BASE_URL}/reorder-point/${id}`);
  },

  // ABC Classification
  async performABCClassification(data: {
    items: Array<{
      itemId: string;
      locationId: string;
      annualConsumptionValue: number;
      consumptionVolatility: number;
    }>;
    abcThresholds?: {
      a: number;
      b: number;
    };
    xyzThresholds?: {
      x: number;
      y: number;
    };
  }): Promise<Array<ABCClassification>> {
    const response = await axios.post(`${API_BASE_URL}/abc-classification`, data);
    return response.data;
  },

  async getABCClassifications(params?: {
    page?: number;
    limit?: number;
    itemId?: string;
    locationId?: string;
    abcClass?: 'A' | 'B' | 'C';
    xyzClass?: 'X' | 'Y' | 'Z';
  }): Promise<{ data: ABCClassification[]; total: number; page: number; limit: number }> {
    const response = await axios.get(`${API_BASE_URL}/abc-classification`, { params });
    return response.data;
  },

  async updateABCClassification(id: string, data: Partial<ABCClassification>): Promise<ABCClassification> {
    const response = await axios.put(`${API_BASE_URL}/abc-classification/${id}`, data);
    return response.data;
  },

  // Inventory Policies
  async getInventoryPolicies(params?: {
    page?: number;
    limit?: number;
    itemId?: string;
    locationId?: string;
    policyType?: 'min-max' | 'reorder-point' | 'periodic-review';
  }): Promise<{ data: InventoryPolicy[]; total: number; page: number; limit: number }> {
    const response = await axios.get(`${API_BASE_URL}/policies`, { params });
    return response.data;
  },

  async getInventoryPolicy(id: string): Promise<InventoryPolicy> {
    const response = await axios.get(`${API_BASE_URL}/policies/${id}`);
    return response.data;
  },

  async createInventoryPolicy(data: {
    itemId: string;
    locationId: string;
    policyType: 'min-max' | 'reorder-point' | 'periodic-review';
    reviewPeriod?: number;
    minQuantity?: number;
    maxQuantity?: number;
    reorderPoint?: number;
    orderQuantity?: number;
  }): Promise<InventoryPolicy> {
    const response = await axios.post(`${API_BASE_URL}/policies`, data);
    return response.data;
  },

  async updateInventoryPolicy(id: string, data: Partial<InventoryPolicy>): Promise<InventoryPolicy> {
    const response = await axios.put(`${API_BASE_URL}/policies/${id}`, data);
    return response.data;
  },

  async deleteInventoryPolicy(id: string): Promise<void> {
    await axios.delete(`${API_BASE_URL}/policies/${id}`);
  },

  // Optimization Recommendations
  async generateOptimizationRecommendations(params?: {
    itemId?: string;
    locationId?: string;
    includeSafetyStock?: boolean;
    includeReorderPoints?: boolean;
    includePolicies?: boolean;
  }): Promise<Array<OptimizationRecommendation>> {
    const response = await axios.get(`${API_BASE_URL}/recommendations`, { params });
    return response.data;
  },

  async applyOptimizationRecommendation(id: string, applyData: {
    appliedBy: string;
    comments?: string;
  }): Promise<OptimizationRecommendation> {
    const response = await axios.post(`${API_BASE_URL}/recommendations/${id}/apply`, applyData);
    return response.data;
  },

  async rejectOptimizationRecommendation(id: string, rejectData: {
    rejectedBy: string;
    reason: string;
  }): Promise<OptimizationRecommendation> {
    const response = await axios.post(`${API_BASE_URL}/recommendations/${id}/reject`, rejectData);
    return response.data;
  },

  // Demand Forecasting Integration
  async integrateDemandForecast(data: {
    itemId: string;
    locationId: string;
    forecastData: Array<{
      period: string;
      forecastedDemand: number;
      confidenceInterval: {
        lower: number;
        upper: number;
      };
    }>;
  }): Promise<{
    updatedSafetyStock: number;
    updatedReorderPoint: number;
    recommendations: string[];
  }> {
    const response = await axios.post(`${API_BASE_URL}/integrate-forecast`, data);
    return response.data;
  },

  // What-If Analysis
  async performWhatIfAnalysis(data: {
    itemId: string;
    locationId: string;
    scenarios: Array<{
      name: string;
      serviceLevel?: number;
      leadTime?: number;
      demandVariability?: number;
    }>;
  }): Promise<Array<{
    scenarioName: string;
    safetyStock: number;
    reorderPoint: number;
    totalCost: number;
    serviceLevel: number;
  }>> {
    const response = await axios.post(`${API_BASE_URL}/what-if-analysis`, data);
    return response.data;
  },

  // Cost Optimization
  async optimizeCosts(data: {
    itemId: string;
    locationId: string;
    holdingCost: number;
    orderingCost: number;
    stockoutCost: number;
    currentPolicy: {
      type: 'min-max' | 'reorder-point' | 'periodic-review';
      parameters: Record<string, any>;
    };
  }): Promise<{
    optimalPolicy: {
      type: 'min-max' | 'reorder-point' | 'periodic-review';
      parameters: Record<string, any>;
    };
    expectedCost: number;
    costSavings: number;
    serviceLevel: number;
  }> {
    const response = await axios.post(`${API_BASE_URL}/cost-optimization`, data);
    return response.data;
  },

  // Performance Monitoring
  async getOptimizationPerformance(params?: {
    startDate?: string;
    endDate?: string;
    itemId?: string;
    locationId?: string;
  }): Promise<{
    overallPerformance: {
      serviceLevel: number;
      inventoryTurnover: number;
      stockoutRate: number;
      excessInventoryValue: number;
    };
    performanceByItem: Array<{
      itemId: string;
      itemName: string;
      serviceLevel: number;
      inventoryTurnover: number;
      stockoutRate: number;
      excessInventoryValue: number;
    }>;
    performanceTrends: Array<{
      month: string;
      serviceLevel: number;
      inventoryTurnover: number;
      stockoutRate: number;
    }>;
  }> {
    const response = await axios.get(`${API_BASE_URL}/performance`, { params });
    return response.data;
  },

  // Bulk Operations
  async bulkCalculateSafetyStock(data: Array<{
    itemId: string;
    locationId: string;
    serviceLevel: number;
    demandVariability: number;
    leadTime: number;
    leadTimeVariability: number;
  }>): Promise<SafetyStockCalculation[]> {
    const response = await axios.post(`${API_BASE_URL}/safety-stock/bulk`, data);
    return response.data;
  },

  async bulkCalculateReorderPoints(data: Array<{
    itemId: string;
    locationId: string;
    averageDailyDemand: number;
    leadTime: number;
    safetyStock: number;
  }>): Promise<ReorderPointCalculation[]> {
    const response = await axios.post(`${API_BASE_URL}/reorder-point/bulk`, data);
    return response.data;
  },

  async bulkApplyPolicies(data: Array<{
    itemId: string;
    locationId: string;
    policyType: 'min-max' | 'reorder-point' | 'periodic-review';
    parameters: Record<string, any>;
  }>): Promise<InventoryPolicy[]> {
    const response = await axios.post(`${API_BASE_URL}/policies/bulk`, data);
    return response.data;
  },

  // Export functionality
  async exportSafetyStockCalculations(params?: {
    format?: 'csv' | 'excel' | 'pdf';
    itemId?: string;
    locationId?: string;
  }): Promise<Blob> {
    const response = await axios.get(`${API_BASE_URL}/safety-stock/export`, { 
      params,
      responseType: 'blob'
    });
    return response.data;
  },

  async exportReorderPointCalculations(params?: {
    format?: 'csv' | 'excel' | 'pdf';
    itemId?: string;
    locationId?: string;
  }): Promise<Blob> {
    const response = await axios.get(`${API_BASE_URL}/reorder-point/export`, { 
      params,
      responseType: 'blob'
    });
    return response.data;
  },

  async exportABCClassifications(params?: {
    format?: 'csv' | 'excel' | 'pdf';
    itemId?: string;
    locationId?: string;
    abcClass?: 'A' | 'B' | 'C';
  }): Promise<Blob> {
    const response = await axios.get(`${API_BASE_URL}/abc-classification/export`, { 
      params,
      responseType: 'blob'
    });
    return response.data;
  },

  async exportInventoryPolicies(params?: {
    format?: 'csv' | 'excel' | 'pdf';
    itemId?: string;
    locationId?: string;
    policyType?: 'min-max' | 'reorder-point' | 'periodic-review';
  }): Promise<Blob> {
    const response = await axios.get(`${API_BASE_URL}/policies/export`, { 
      params,
      responseType: 'blob'
    });
    return response.data;
  },
};



