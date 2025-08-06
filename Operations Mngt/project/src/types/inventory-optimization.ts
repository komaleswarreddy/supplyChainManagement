import type { User } from './user';
import type { StockItem } from './inventory';

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
  formula: string;
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
  formula: string;
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
  classificationDate: string;
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
  orderQuantityRules?: {
    type: 'fixed' | 'economic' | 'lot-for-lot';
    value?: number;
  };
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
    workingCapitalReduction?: number;
  };
  confidence: number;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'applied' | 'rejected';
  appliedAt?: string;
  appliedBy?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DemandForecastIntegration {
  itemId: string;
  locationId: string;
  updatedSafetyStock: number;
  updatedReorderPoint: number;
  recommendations: string[];
  forecastAccuracy: number;
  confidenceLevel: number;
}

export interface WhatIfScenario {
  scenarioName: string;
  parameters: {
    serviceLevel?: number;
    leadTime?: number;
    demandVariability?: number;
    holdingCost?: number;
    orderingCost?: number;
    stockoutCost?: number;
  };
  results: {
    safetyStock: number;
    reorderPoint: number;
    totalCost: number;
    serviceLevel: number;
    inventoryTurnover: number;
  };
}

export interface CostOptimizationResult {
  itemId: string;
  locationId: string;
  optimalPolicy: {
    type: 'min-max' | 'reorder-point' | 'periodic-review';
    parameters: Record<string, any>;
  };
  expectedCost: number;
  costSavings: number;
  serviceLevel: number;
  breakEvenAnalysis: {
    breakEvenPoint: number;
    sensitivityAnalysis: Array<{
      parameter: string;
      change: number;
      costImpact: number;
    }>;
  };
}

export interface InventoryOptimizationAnalytics {
  overallPerformance: {
    serviceLevel: number;
    inventoryTurnover: number;
    stockoutRate: number;
    excessInventoryValue: number;
    workingCapitalEfficiency: number;
  };
  performanceByItem: Array<{
    itemId: string;
    itemName: string;
    serviceLevel: number;
    inventoryTurnover: number;
    stockoutRate: number;
    excessInventoryValue: number;
    optimizationPotential: number;
  }>;
  performanceTrends: Array<{
    month: string;
    serviceLevel: number;
    inventoryTurnover: number;
    stockoutRate: number;
    totalCost: number;
  }>;
  optimizationImpact: {
    totalCostSavings: number;
    serviceLevelImprovement: number;
    inventoryReduction: number;
    recommendationsApplied: number;
    recommendationsPending: number;
  };
}

export interface OptimizationSettings {
  serviceLevelTarget: number;
  costOptimizationEnabled: boolean;
  automaticRecommendations: boolean;
  approvalRequired: boolean;
  notificationSettings: {
    email: boolean;
    dashboard: boolean;
    thresholdAlerts: boolean;
  };
  calculationParameters: {
    defaultLeadTime: number;
    defaultDemandVariability: number;
    defaultHoldingCost: number;
    defaultOrderingCost: number;
    defaultStockoutCost: number;
  };
}

export interface InventoryOptimizationReport {
  reportId: string;
  reportType: 'safety-stock' | 'reorder-point' | 'abc-analysis' | 'cost-optimization' | 'comprehensive';
  generatedAt: string;
  generatedBy: string;
  parameters: Record<string, any>;
  summary: {
    totalItems: number;
    itemsOptimized: number;
    totalSavings: number;
    averageServiceLevel: number;
  };
  details: Array<{
    itemId: string;
    itemName: string;
    locationId: string;
    locationName: string;
    currentMetrics: Record<string, any>;
    recommendedMetrics: Record<string, any>;
    expectedImpact: Record<string, any>;
  }>;
}