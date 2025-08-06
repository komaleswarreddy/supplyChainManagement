import axios from 'axios';
import { 
  Forecast, 
  CreateForecastRequest, 
  UpdateForecastRequest, 
  InventoryPolicy,
  SafetyStockCalculation,
  ReorderPointCalculation,
  CPFRForecast,
  CapacityCommitment
} from '@/types/supply-chain';

const API_BASE_URL = '/api/supply-chain';

export const supplyChainApi = {
  // Demand Forecasting
  async getForecasts(params?: {
    page?: number;
    limit?: number;
    itemId?: string;
    locationId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<{ data: Forecast[]; total: number; page: number; limit: number }> {
    const response = await axios.get(`${API_BASE_URL}/forecasts`, { params });
    return response.data;
  },

  async getForecast(id: string): Promise<Forecast> {
    const response = await axios.get(`${API_BASE_URL}/forecasts/${id}`);
    return response.data;
  },

  async createForecast(data: CreateForecastRequest): Promise<Forecast> {
    const response = await axios.post(`${API_BASE_URL}/forecasts`, data);
    return response.data;
  },

  async updateForecast(id: string, data: UpdateForecastRequest): Promise<Forecast> {
    const response = await axios.put(`${API_BASE_URL}/forecasts/${id}`, data);
    return response.data;
  },

  async deleteForecast(id: string): Promise<void> {
    await axios.delete(`${API_BASE_URL}/forecasts/${id}`);
  },

  // Statistical Forecasting
  async generateStatisticalForecast(data: {
    itemId: string;
    locationId: string;
    historicalData: Array<{
      date: string;
      quantity: number;
    }>;
    algorithm?: 'moving-average' | 'exponential-smoothing' | 'linear-regression' | 'seasonal-decomposition';
    forecastPeriods: number;
  }): Promise<{
    forecast: Array<{
      date: string;
      quantity: number;
      confidenceInterval: {
        lower: number;
        upper: number;
      };
    }>;
    accuracy: {
      mape: number;
      mae: number;
      rmse: number;
    };
    algorithm: string;
  }> {
    const response = await axios.post(`${API_BASE_URL}/forecasts/statistical`, data);
    return response.data;
  },

  // Forecast Adjustment
  async adjustForecast(id: string, adjustmentData: {
    adjustments: Array<{
      period: string;
      adjustmentType: 'percentage' | 'absolute';
      adjustmentValue: number;
      reasonCode: string;
      notes?: string;
    }>;
  }): Promise<Forecast> {
    const response = await axios.post(`${API_BASE_URL}/forecasts/${id}/adjust`, adjustmentData);
    return response.data;
  },

  // Promotion Impact Modeling
  async modelPromotionImpact(data: {
    itemId: string;
    locationId: string;
    baselineForecast: Array<{
      date: string;
      quantity: number;
    }>;
    promotion: {
      type: string;
      startDate: string;
      endDate: string;
      expectedLift: number;
      affectedProducts: string[];
    };
  }): Promise<{
    adjustedForecast: Array<{
      date: string;
      quantity: number;
      liftFactor: number;
    }>;
    totalLift: number;
  }> {
    const response = await axios.post(`${API_BASE_URL}/forecasts/promotion-impact`, data);
    return response.data;
  },

  // Forecast Consensus
  async createConsensusForecast(data: {
    itemId: string;
    locationId: string;
    period: string;
    departmentForecasts: Array<{
      department: string;
      forecast: number;
      weight: number;
    }>;
  }): Promise<{
    consensusValue: number;
    weightedAverage: number;
    meetingNotes?: string;
  }> {
    const response = await axios.post(`${API_BASE_URL}/forecasts/consensus`, data);
    return response.data;
  },

  // Inventory Optimization
  async calculateSafetyStock(data: {
    itemId: string;
    locationId: string;
    serviceLevel: number; // 0.90, 0.95, 0.99
    demandVariability: number;
    leadTime: number;
    leadTimeVariability: number;
  }): Promise<SafetyStockCalculation> {
    const response = await axios.post(`${API_BASE_URL}/inventory/safety-stock`, data);
    return response.data;
  },

  async calculateReorderPoint(data: {
    itemId: string;
    locationId: string;
    averageDailyDemand: number;
    leadTime: number;
    safetyStock: number;
  }): Promise<ReorderPointCalculation> {
    const response = await axios.post(`${API_BASE_URL}/inventory/reorder-point`, data);
    return response.data;
  },

  async classifyInventory(data: {
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
  }): Promise<Array<{
    itemId: string;
    locationId: string;
    abcClass: 'A' | 'B' | 'C';
    xyzClass: 'X' | 'Y' | 'Z';
    combinedClassification: string;
  }>> {
    const response = await axios.post(`${API_BASE_URL}/inventory/classify`, data);
    return response.data;
  },

  // Inventory Policy Management
  async getInventoryPolicies(params?: {
    page?: number;
    limit?: number;
    itemId?: string;
    locationId?: string;
    policyType?: 'min-max' | 'reorder-point' | 'periodic-review';
  }): Promise<{ data: InventoryPolicy[]; total: number; page: number; limit: number }> {
    const response = await axios.get(`${API_BASE_URL}/inventory/policies`, { params });
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
    const response = await axios.post(`${API_BASE_URL}/inventory/policies`, data);
    return response.data;
  },

  async updateInventoryPolicy(id: string, data: Partial<InventoryPolicy>): Promise<InventoryPolicy> {
    const response = await axios.put(`${API_BASE_URL}/inventory/policies/${id}`, data);
    return response.data;
  },

  async deleteInventoryPolicy(id: string): Promise<void> {
    await axios.delete(`${API_BASE_URL}/inventory/policies/${id}`);
  },

  // CPFR (Collaborative Planning, Forecasting, and Replenishment)
  async shareCustomerForecast(data: {
    customerId: string;
    forecasts: Array<{
      productId: string;
      timeBucket: string;
      quantity: number;
      confidenceLevel: number;
    }>;
  }): Promise<CPFRForecast> {
    const response = await axios.post(`${API_BASE_URL}/cpfr/customer-forecast`, data);
    return response.data;
  },

  async shareSupplierForecast(data: {
    supplierId: string;
    forecasts: Array<{
      componentId: string;
      timeBucket: string;
      quantity: number;
      confidenceLevel: number;
      aggregationLevel: 'item' | 'category' | 'supplier';
    }>;
  }): Promise<CPFRForecast> {
    const response = await axios.post(`${API_BASE_URL}/cpfr/supplier-forecast`, data);
    return response.data;
  },

  async resolveForecastDiscrepancies(data: {
    internalForecast: Array<{
      timeBucket: string;
      quantity: number;
    }>;
    externalForecast: Array<{
      timeBucket: string;
      quantity: number;
    }>;
    varianceThreshold: number;
  }): Promise<{
    discrepancies: Array<{
      timeBucket: string;
      internalValue: number;
      externalValue: number;
      variance: number;
      variancePercentage: number;
      resolutionMethod: 'internal' | 'external' | 'average' | 'manual';
      finalValue: number;
    }>;
  }> {
    const response = await axios.post(`${API_BASE_URL}/cpfr/resolve-discrepancies`, data);
    return response.data;
  },

  async getCapacityCommitments(params?: {
    supplierId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<CapacityCommitment[]> {
    const response = await axios.get(`${API_BASE_URL}/cpfr/capacity-commitments`, { params });
    return response.data;
  },

  async createCapacityCommitment(data: {
    supplierId: string;
    forecastId: string;
    committedQuantity: number;
    confidenceLevel: number;
    riskAssessment: 'low' | 'medium' | 'high';
    notes?: string;
  }): Promise<CapacityCommitment> {
    const response = await axios.post(`${API_BASE_URL}/cpfr/capacity-commitments`, data);
    return response.data;
  },

  // Supply Chain Analytics
  async getSupplyChainAnalytics(params?: {
    startDate?: string;
    endDate?: string;
    itemId?: string;
    locationId?: string;
  }): Promise<{
    forecastAccuracy: {
      overallMape: number;
      accuracyByItem: Array<{
        itemId: string;
        itemName: string;
        mape: number;
      }>;
    };
    inventoryMetrics: {
      totalInventoryValue: number;
      averageInventoryTurnover: number;
      stockoutRate: number;
      excessInventoryValue: number;
    };
    supplyChainPerformance: {
      onTimeDelivery: number;
      leadTimeVariability: number;
      supplierPerformance: Array<{
        supplierId: string;
        supplierName: string;
        performanceScore: number;
      }>;
    };
  }> {
    const response = await axios.get(`${API_BASE_URL}/analytics`, { params });
    return response.data;
  },

  // Export functionality
  async exportForecasts(params?: {
    format?: 'csv' | 'excel' | 'pdf';
    itemId?: string;
    locationId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<Blob> {
    const response = await axios.get(`${API_BASE_URL}/forecasts/export`, { 
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
    const response = await axios.get(`${API_BASE_URL}/inventory/policies/export`, { 
      params,
      responseType: 'blob'
    });
    return response.data;
  },
};



