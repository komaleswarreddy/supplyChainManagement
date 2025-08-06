import type { User } from './user';

export type ForecastAlgorithm = 
  | 'MOVING_AVERAGE'
  | 'EXPONENTIAL_SMOOTHING'
  | 'HOLT_WINTERS'
  | 'LINEAR_REGRESSION'
  | 'ARIMA';

export type ForecastPeriod = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';

export type AdjustmentType = 'ABSOLUTE' | 'PERCENTAGE';

export type ReasonCode = 
  | 'MARKET_INTELLIGENCE'
  | 'PROMOTION'
  | 'SEASONALITY'
  | 'COMPETITION'
  | 'WEATHER'
  | 'EVENT'
  | 'OTHER';

export type ForecastStatus = 
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'FINALIZED';

export type PromotionType = 
  | 'DISCOUNT'
  | 'BOGO'
  | 'BUNDLE'
  | 'DISPLAY'
  | 'SEASONAL'
  | 'EVENT';

export interface Forecast {
  id: string;
  itemId: string;
  itemName: string;
  locationId: string;
  locationName: string;
  algorithm: 'moving-average' | 'exponential-smoothing' | 'linear-regression' | 'seasonal-decomposition';
  forecastPeriods: number;
  historicalData?: Array<{
    date: string;
    quantity: number;
  }>;
  forecastData?: Array<{
    period: string;
    forecastedDemand: number;
    confidenceInterval: {
      lower: number;
      upper: number;
    };
  }>;
  accuracy?: {
    mape: number;
    mae: number;
    rmse: number;
  };
  status: 'active' | 'inactive' | 'expired';
  createdAt: string;
  updatedAt: string;
}

export interface CreateForecastRequest {
  itemId: string;
  locationId: string;
  algorithm: 'moving-average' | 'exponential-smoothing' | 'linear-regression' | 'seasonal-decomposition';
  forecastPeriods: number;
  historicalData: Array<{
    date: string;
    quantity: number;
  }>;
}

export interface UpdateForecastRequest {
  algorithm?: 'moving-average' | 'exponential-smoothing' | 'linear-regression' | 'seasonal-decomposition';
  forecastPeriods?: number;
  historicalData?: Array<{
    date: string;
    quantity: number;
  }>;
  status?: 'active' | 'inactive' | 'expired';
}

export interface SafetyStockCalculation {
  id: string;
  itemId: string;
  itemName: string;
  locationId: string;
  locationName: string;
  serviceLevel: number;
  demandVariability: number;
  leadTime: number;
  leadTimeVariability: number;
  safetyStockQuantity: number;
  calculationMethod: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReorderPointCalculation {
  id: string;
  itemId: string;
  itemName: string;
  locationId: string;
  locationName: string;
  averageDailyDemand: number;
  leadTime: number;
  safetyStock: number;
  reorderPoint: number;
  calculationMethod: string;
  createdAt: string;
  updatedAt: string;
}

export interface ABCClassification {
  id: string;
  itemId: string;
  itemName: string;
  locationId: string;
  locationName: string;
  annualConsumptionValue: number;
  consumptionVolatility: number;
  abcClass: 'A' | 'B' | 'C';
  xyzClass: 'X' | 'Y' | 'Z';
  combinedClassification: string;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryPolicy {
  id: string;
  itemId: string;
  itemName: string;
  locationId: string;
  locationName: string;
  policyType: 'min-max' | 'reorder-point' | 'periodic-review';
  reviewPeriod?: number;
  minQuantity?: number;
  maxQuantity?: number;
  reorderPoint?: number;
  orderQuantity?: number;
  createdAt: string;
  updatedAt: string;
}

export interface OptimizationRecommendation {
  id: string;
  itemId: string;
  itemName: string;
  locationId: string;
  locationName: string;
  type: 'safety-stock' | 'reorder-point' | 'policy-change' | 'cost-optimization';
  currentValue: any;
  recommendedValue: any;
  expectedImpact: {
    costSavings?: number;
    serviceLevelImprovement?: number;
    inventoryReduction?: number;
  };
  confidence: number;
  status: 'pending' | 'applied' | 'rejected';
  appliedAt?: string;
  appliedBy?: string;
  createdAt: string;
}

export interface CPFRForecast {
  id: string;
  partnerId: string;
  partnerName: string;
  partnerType: 'customer' | 'supplier';
  forecasts: Array<{
    productId: string;
    productName: string;
    timeBucket: string;
    quantity: number;
    confidenceLevel: number;
  }>;
  status: 'shared' | 'acknowledged' | 'consensus-reached';
  sharedAt: string;
  acknowledgedAt?: string;
  createdAt: string;
}

export interface CapacityCommitment {
  id: string;
  supplierId: string;
  supplierName: string;
  forecastId: string;
  committedQuantity: number;
  confidenceLevel: number;
  riskAssessment: 'low' | 'medium' | 'high';
  notes?: string;
  commitmentDate: string;
  createdAt: string;
}

export interface SupplyChainAnalytics {
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
}

export interface OptimizationPerformance {
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
}

export interface WhatIfScenario {
  scenarioName: string;
  safetyStock: number;
  reorderPoint: number;
  totalCost: number;
  serviceLevel: number;
}

export interface CostOptimizationResult {
  optimalPolicy: {
    type: 'min-max' | 'reorder-point' | 'periodic-review';
    parameters: Record<string, any>;
  };
  expectedCost: number;
  costSavings: number;
  serviceLevel: number;
}

export interface DemandForecastIntegration {
  updatedSafetyStock: number;
  updatedReorderPoint: number;
  recommendations: string[];
}

export interface PromotionImpactResult {
  adjustedForecast: Array<{
    date: string;
    quantity: number;
    liftFactor: number;
  }>;
  totalLift: number;
}

export interface ConsensusForecastResult {
  consensusValue: number;
  weightedAverage: number;
  meetingNotes?: string;
}

export interface StatisticalForecastResult {
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
}

export type ForecastAdjustment = {
  id: string;
  type: AdjustmentType;
  value: number;
  reasonCode: ReasonCode;
  description?: string;
  startDate: string;
  endDate: string;
  createdBy: User;
  createdAt: string;
  updatedAt: string;
};

export type PromotionImpact = {
  id: string;
  type: PromotionType;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  expectedLift: number;
  actualLift?: number;
  budget?: number;
  currency?: string;
  affectedItems: string[];
  historicalLifts: {
    promotionId: string;
    startDate: string;
    endDate: string;
    lift: number;
  }[];
  status: 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  createdBy: User;
  createdAt: string;
  updatedAt: string;
};

export type ForecastFilters = {
  status?: ForecastStatus;
  period?: ForecastPeriod;
  item?: string;
  location?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  category?: string;
  productGroup?: string;
  salesChannel?: string;
  region?: string;
};