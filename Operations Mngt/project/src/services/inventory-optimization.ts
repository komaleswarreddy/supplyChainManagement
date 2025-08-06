import { api } from '@/lib/api';
import type { ApiResponse, PaginatedResponse, PaginationParams } from '@/types/common';
import type {
  SafetyStockCalculation,
  ReorderPoint,
  InventoryClassification,
  InventoryPolicy,
  OptimizationFilters,
  ServiceLevel,
  ABCClass,
  XYZClass,
  CombinedClass,
  InventoryPolicyType
} from '@/types/inventory-optimization';
import type { StockItem } from '@/types/inventory';

// Mock data for development
const MOCK_SAFETY_STOCK: SafetyStockCalculation[] = Array.from({ length: 10 }, (_, i) => ({
  id: `ss-${i + 1}`,
  itemId: `item-${i + 1}`,
  locationId: 'loc-1',
  item: {
    id: `item-${i + 1}`,
    itemCode: `ITEM-${String(i + 1).padStart(4, '0')}`,
    name: `Product ${i + 1}`,
  },
  location: {
    id: 'loc-1',
    name: 'Main Warehouse',
    type: 'WAREHOUSE',
  },
  serviceLevel: [0.9, 0.95, 0.99][Math.floor(Math.random() * 3)] as ServiceLevel,
  leadTime: Math.floor(Math.random() * 14) + 1, // 1-14 days
  leadTimeVariability: Math.random() * 2, // 0-2 days
  demandAverage: Math.floor(Math.random() * 100) + 10, // 10-110 units per day
  demandVariability: Math.random() * 20, // 0-20 units
  safetyStock: Math.floor(Math.random() * 500) + 50, // 50-550 units
  calculationMethod: ['NORMAL_APPROXIMATION', 'POISSON', 'EMPIRICAL'][Math.floor(Math.random() * 3)] as SafetyStockCalculation['calculationMethod'],
  reviewPeriod: 7, // weekly review
  lastCalculated: new Date().toISOString(),
  nextReview: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  createdBy: {
    id: 'user-1',
    email: 'john.doe@example.com',
    firstName: 'John',
    lastName: 'Doe',
    name: 'John Doe',
    roles: ['inventory_manager'],
    permissions: ['manage_inventory'],
    status: 'active',
    mfaEnabled: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}));

const MOCK_REORDER_POINTS: ReorderPoint[] = Array.from({ length: 10 }, (_, i) => ({
  id: `rop-${i + 1}`,
  itemId: `item-${i + 1}`,
  locationId: 'loc-1',
  item: {
    id: `item-${i + 1}`,
    itemCode: `ITEM-${String(i + 1).padStart(4, '0')}`,
    name: `Product ${i + 1}`,
  },
  location: {
    id: 'loc-1',
    name: 'Main Warehouse',
    type: 'WAREHOUSE',
  },
  averageDailyDemand: Math.floor(Math.random() * 100) + 10, // 10-110 units per day
  leadTime: Math.floor(Math.random() * 14) + 1, // 1-14 days
  safetyStock: Math.floor(Math.random() * 500) + 50, // 50-550 units
  reorderPoint: Math.floor(Math.random() * 1000) + 100, // 100-1100 units
  manualOverride: Math.random() > 0.8, // 20% chance of manual override
  manualValue: Math.floor(Math.random() * 1000) + 100, // 100-1100 units
  lastCalculated: new Date().toISOString(),
  nextReview: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  createdBy: {
    id: 'user-1',
    email: 'john.doe@example.com',
    firstName: 'John',
    lastName: 'Doe',
    name: 'John Doe',
    roles: ['inventory_manager'],
    permissions: ['manage_inventory'],
    status: 'active',
    mfaEnabled: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}));

const MOCK_CLASSIFICATIONS: InventoryClassification[] = Array.from({ length: 10 }, (_, i) => {
  const abcClass = ['A', 'B', 'C'][Math.floor(Math.random() * 3)] as ABCClass;
  const xyzClass = ['X', 'Y', 'Z'][Math.floor(Math.random() * 3)] as XYZClass;
  
  return {
    id: `cls-${i + 1}`,
    itemId: `item-${i + 1}`,
    locationId: 'loc-1',
    item: {
      id: `item-${i + 1}`,
      itemCode: `ITEM-${String(i + 1).padStart(4, '0')}`,
      name: `Product ${i + 1}`,
    },
    location: {
      id: 'loc-1',
      name: 'Main Warehouse',
      type: 'WAREHOUSE',
    },
    annualConsumptionValue: Math.floor(Math.random() * 1000000) + 10000, // $10K-$1.01M
    annualConsumptionQuantity: Math.floor(Math.random() * 10000) + 100, // 100-10100 units
    consumptionVariability: Math.random() * 1.5, // 0-1.5 coefficient of variation
    abcClass,
    xyzClass,
    combinedClass: `${abcClass}${xyzClass}` as CombinedClass,
    abcThresholds: {
      aThreshold: 0.8,
      bThreshold: 0.95,
    },
    xyzThresholds: {
      xThreshold: 0.5,
      yThreshold: 1.0,
    },
    manualOverride: false,
    lastCalculated: new Date().toISOString(),
    nextReview: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: {
      id: 'user-1',
      email: 'john.doe@example.com',
      firstName: 'John',
      lastName: 'Doe',
      name: 'John Doe',
      roles: ['inventory_manager'],
      permissions: ['manage_inventory'],
      status: 'active',
      mfaEnabled: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
});

const MOCK_POLICIES: InventoryPolicy[] = Array.from({ length: 10 }, (_, i) => {
  const abcClass = ['A', 'B', 'C'][Math.floor(Math.random() * 3)] as ABCClass;
  const xyzClass = ['X', 'Y', 'Z'][Math.floor(Math.random() * 3)] as XYZClass;
  const combinedClass = `${abcClass}${xyzClass}` as CombinedClass;
  
  return {
    id: `pol-${i + 1}`,
    itemId: `item-${i + 1}`,
    locationId: 'loc-1',
    item: {
      id: `item-${i + 1}`,
      itemCode: `ITEM-${String(i + 1).padStart(4, '0')}`,
      name: `Product ${i + 1}`,
    },
    location: {
      id: 'loc-1',
      name: 'Main Warehouse',
      type: 'WAREHOUSE',
    },
    policyType: ['MIN_MAX', 'REORDER_POINT', 'PERIODIC_REVIEW', 'KANBAN'][Math.floor(Math.random() * 4)] as InventoryPolicyType,
    minQuantity: Math.floor(Math.random() * 500) + 50, // 50-550 units
    maxQuantity: Math.floor(Math.random() * 1000) + 500, // 500-1500 units
    reorderPoint: Math.floor(Math.random() * 300) + 100, // 100-400 units
    targetStockLevel: Math.floor(Math.random() * 1000) + 500, // 500-1500 units
    orderQuantity: Math.floor(Math.random() * 500) + 100, // 100-600 units
    orderFrequency: [7, 14, 30][Math.floor(Math.random() * 3)], // weekly, bi-weekly, monthly
    leadTime: Math.floor(Math.random() * 14) + 1, // 1-14 days
    serviceLevel: [0.9, 0.95, 0.99][Math.floor(Math.random() * 3)] as ServiceLevel,
    reviewPeriod: [7, 14, 30][Math.floor(Math.random() * 3)], // weekly, bi-weekly, monthly
    abcxyzClass: combinedClass,
    lastReviewed: new Date().toISOString(),
    nextReview: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: {
      id: 'user-1',
      email: 'john.doe@example.com',
      firstName: 'John',
      lastName: 'Doe',
      name: 'John Doe',
      roles: ['inventory_manager'],
      permissions: ['manage_inventory'],
      status: 'active',
      mfaEnabled: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
});

export const inventoryOptimizationService = {
  // Safety Stock
  getSafetyStocks: async (
    params: PaginationParams & OptimizationFilters
  ): Promise<PaginatedResponse<SafetyStockCalculation>> => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    let filteredData = [...MOCK_SAFETY_STOCK];

    if (params.item) {
      filteredData = filteredData.filter(ss => 
        ss.item.itemCode.toLowerCase().includes(params.item!.toLowerCase()) ||
        ss.item.name.toLowerCase().includes(params.item!.toLowerCase())
      );
    }
    if (params.location) {
      filteredData = filteredData.filter(ss => 
        ss.location.name.toLowerCase().includes(params.location!.toLowerCase())
      );
    }
    if (params.serviceLevel) {
      filteredData = filteredData.filter(ss => ss.serviceLevel === params.serviceLevel);
    }
    if (params.dateRange) {
      const start = new Date(params.dateRange.start);
      const end = new Date(params.dateRange.end);
      filteredData = filteredData.filter(ss => {
        const lastCalculated = new Date(ss.lastCalculated);
        return lastCalculated >= start && lastCalculated <= end;
      });
    }

    // Apply sorting
    if (params.sortBy) {
      filteredData.sort((a: any, b: any) => {
        const aValue = a[params.sortBy!];
        const bValue = b[params.sortBy!];
        return params.sortOrder === 'desc' ? 
          (bValue > aValue ? 1 : -1) : 
          (aValue > bValue ? 1 : -1);
      });
    }

    const start = (params.page - 1) * params.pageSize;
    const end = start + params.pageSize;
    const paginatedData = filteredData.slice(start, end);

    return {
      items: paginatedData,
      total: filteredData.length,
      page: params.page,
      pageSize: params.pageSize,
      totalPages: Math.ceil(filteredData.length / params.pageSize),
    };
  },

  getSafetyStockById: async (id: string): Promise<ApiResponse<SafetyStockCalculation>> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const safetyStock = MOCK_SAFETY_STOCK.find(ss => ss.id === id);

    if (!safetyStock) {
      throw new Error('Safety stock calculation not found');
    }

    return {
      data: safetyStock,
      status: 200,
    };
  },

  calculateSafetyStock: async (
    data: Omit<SafetyStockCalculation, 'id' | 'safetyStock' | 'lastCalculated' | 'createdAt' | 'updatedAt'>
  ): Promise<ApiResponse<SafetyStockCalculation>> => {
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simple safety stock calculation: z * sqrt(LT) * stdDev
    // where z is the z-score for the service level
    const zScores: Record<ServiceLevel, number> = {
      0.9: 1.28,
      0.95: 1.65,
      0.99: 2.33,
    };

    const z = zScores[data.serviceLevel];
    const safetyStock = Math.round(
      z * Math.sqrt(data.leadTime) * data.demandVariability
    );

    const newSafetyStock: SafetyStockCalculation = {
      id: `ss-${MOCK_SAFETY_STOCK.length + 1}`,
      ...data,
      safetyStock,
      lastCalculated: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    MOCK_SAFETY_STOCK.push(newSafetyStock);

    return {
      data: newSafetyStock,
      status: 201,
    };
  },

  updateSafetyStock: async (
    id: string,
    data: Partial<SafetyStockCalculation>
  ): Promise<ApiResponse<SafetyStockCalculation>> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const index = MOCK_SAFETY_STOCK.findIndex(ss => ss.id === id);
    if (index === -1) {
      throw new Error('Safety stock calculation not found');
    }

    // Recalculate safety stock if relevant parameters changed
    let safetyStock = MOCK_SAFETY_STOCK[index].safetyStock;
    if (
      data.serviceLevel !== undefined ||
      data.leadTime !== undefined ||
      data.leadTimeVariability !== undefined ||
      data.demandVariability !== undefined
    ) {
      const zScores: Record<ServiceLevel, number> = {
        0.9: 1.28,
        0.95: 1.65,
        0.99: 2.33,
      };

      const serviceLevel = data.serviceLevel || MOCK_SAFETY_STOCK[index].serviceLevel;
      const leadTime = data.leadTime || MOCK_SAFETY_STOCK[index].leadTime;
      const demandVariability = data.demandVariability || MOCK_SAFETY_STOCK[index].demandVariability;

      const z = zScores[serviceLevel];
      safetyStock = Math.round(
        z * Math.sqrt(leadTime) * demandVariability
      );
    }

    MOCK_SAFETY_STOCK[index] = {
      ...MOCK_SAFETY_STOCK[index],
      ...data,
      safetyStock,
      lastCalculated: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return {
      data: MOCK_SAFETY_STOCK[index],
      status: 200,
    };
  },

  // Reorder Points
  getReorderPoints: async (
    params: PaginationParams & OptimizationFilters
  ): Promise<PaginatedResponse<ReorderPoint>> => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    let filteredData = [...MOCK_REORDER_POINTS];

    if (params.item) {
      filteredData = filteredData.filter(rp => 
        rp.item.itemCode.toLowerCase().includes(params.item!.toLowerCase()) ||
        rp.item.name.toLowerCase().includes(params.item!.toLowerCase())
      );
    }
    if (params.location) {
      filteredData = filteredData.filter(rp => 
        rp.location.name.toLowerCase().includes(params.location!.toLowerCase())
      );
    }
    if (params.dateRange) {
      const start = new Date(params.dateRange.start);
      const end = new Date(params.dateRange.end);
      filteredData = filteredData.filter(rp => {
        const lastCalculated = new Date(rp.lastCalculated);
        return lastCalculated >= start && lastCalculated <= end;
      });
    }

    // Apply sorting
    if (params.sortBy) {
      filteredData.sort((a: any, b: any) => {
        const aValue = a[params.sortBy!];
        const bValue = b[params.sortBy!];
        return params.sortOrder === 'desc' ? 
          (bValue > aValue ? 1 : -1) : 
          (aValue > bValue ? 1 : -1);
      });
    }

    const start = (params.page - 1) * params.pageSize;
    const end = start + params.pageSize;
    const paginatedData = filteredData.slice(start, end);

    return {
      items: paginatedData,
      total: filteredData.length,
      page: params.page,
      pageSize: params.pageSize,
      totalPages: Math.ceil(filteredData.length / params.pageSize),
    };
  },

  getReorderPointById: async (id: string): Promise<ApiResponse<ReorderPoint>> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const reorderPoint = MOCK_REORDER_POINTS.find(rp => rp.id === id);

    if (!reorderPoint) {
      throw new Error('Reorder point not found');
    }

    return {
      data: reorderPoint,
      status: 200,
    };
  },

  calculateReorderPoint: async (
    data: Omit<ReorderPoint, 'id' | 'reorderPoint' | 'lastCalculated' | 'createdAt' | 'updatedAt'>
  ): Promise<ApiResponse<ReorderPoint>> => {
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Calculate reorder point: average daily demand * lead time + safety stock
    const reorderPoint = Math.round(
      data.averageDailyDemand * data.leadTime + data.safetyStock
    );

    const newReorderPoint: ReorderPoint = {
      id: `rop-${MOCK_REORDER_POINTS.length + 1}`,
      ...data,
      reorderPoint: data.manualOverride && data.manualValue ? data.manualValue : reorderPoint,
      lastCalculated: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    MOCK_REORDER_POINTS.push(newReorderPoint);

    return {
      data: newReorderPoint,
      status: 201,
    };
  },

  updateReorderPoint: async (
    id: string,
    data: Partial<ReorderPoint>
  ): Promise<ApiResponse<ReorderPoint>> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const index = MOCK_REORDER_POINTS.findIndex(rp => rp.id === id);
    if (index === -1) {
      throw new Error('Reorder point not found');
    }

    // Recalculate reorder point if relevant parameters changed and not manual override
    let reorderPoint = MOCK_REORDER_POINTS[index].reorderPoint;
    if (
      !data.manualOverride &&
      (data.averageDailyDemand !== undefined ||
      data.leadTime !== undefined ||
      data.safetyStock !== undefined)
    ) {
      const averageDailyDemand = data.averageDailyDemand || MOCK_REORDER_POINTS[index].averageDailyDemand;
      const leadTime = data.leadTime || MOCK_REORDER_POINTS[index].leadTime;
      const safetyStock = data.safetyStock || MOCK_REORDER_POINTS[index].safetyStock;

      reorderPoint = Math.round(
        averageDailyDemand * leadTime + safetyStock
      );
    } else if (data.manualOverride && data.manualValue !== undefined) {
      reorderPoint = data.manualValue;
    }

    MOCK_REORDER_POINTS[index] = {
      ...MOCK_REORDER_POINTS[index],
      ...data,
      reorderPoint,
      lastCalculated: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return {
      data: MOCK_REORDER_POINTS[index],
      status: 200,
    };
  },

  // ABC/XYZ Classification
  getClassifications: async (
    params: PaginationParams & OptimizationFilters
  ): Promise<PaginatedResponse<InventoryClassification>> => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    let filteredData = [...MOCK_CLASSIFICATIONS];

    if (params.item) {
      filteredData = filteredData.filter(cls => 
        cls.item.itemCode.toLowerCase().includes(params.item!.toLowerCase()) ||
        cls.item.name.toLowerCase().includes(params.item!.toLowerCase())
      );
    }
    if (params.location) {
      filteredData = filteredData.filter(cls => 
        cls.location.name.toLowerCase().includes(params.location!.toLowerCase())
      );
    }
    if (params.abcClass) {
      filteredData = filteredData.filter(cls => cls.abcClass === params.abcClass);
    }
    if (params.xyzClass) {
      filteredData = filteredData.filter(cls => cls.xyzClass === params.xyzClass);
    }
    if (params.combinedClass) {
      filteredData = filteredData.filter(cls => cls.combinedClass === params.combinedClass);
    }
    if (params.dateRange) {
      const start = new Date(params.dateRange.start);
      const end = new Date(params.dateRange.end);
      filteredData = filteredData.filter(cls => {
        const lastCalculated = new Date(cls.lastCalculated);
        return lastCalculated >= start && lastCalculated <= end;
      });
    }

    // Apply sorting
    if (params.sortBy) {
      filteredData.sort((a: any, b: any) => {
        const aValue = a[params.sortBy!];
        const bValue = b[params.sortBy!];
        return params.sortOrder === 'desc' ? 
          (bValue > aValue ? 1 : -1) : 
          (aValue > bValue ? 1 : -1);
      });
    }

    const start = (params.page - 1) * params.pageSize;
    const end = start + params.pageSize;
    const paginatedData = filteredData.slice(start, end);

    return {
      items: paginatedData,
      total: filteredData.length,
      page: params.page,
      pageSize: params.pageSize,
      totalPages: Math.ceil(filteredData.length / params.pageSize),
    };
  },

  getClassificationById: async (id: string): Promise<ApiResponse<InventoryClassification>> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const classification = MOCK_CLASSIFICATIONS.find(cls => cls.id === id);

    if (!classification) {
      throw new Error('Classification not found');
    }

    return {
      data: classification,
      status: 200,
    };
  },

  calculateClassification: async (
    data: Omit<InventoryClassification, 'id' | 'abcClass' | 'xyzClass' | 'combinedClass' | 'lastCalculated' | 'createdAt' | 'updatedAt'>
  ): Promise<ApiResponse<InventoryClassification>> => {
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Determine ABC class based on annual consumption value
    let abcClass: ABCClass;
    if (data.annualConsumptionValue >= 100000) {
      abcClass = 'A';
    } else if (data.annualConsumptionValue >= 10000) {
      abcClass = 'B';
    } else {
      abcClass = 'C';
    }

    // Determine XYZ class based on consumption variability (coefficient of variation)
    let xyzClass: XYZClass;
    if (data.consumptionVariability <= data.xyzThresholds.xThreshold) {
      xyzClass = 'X';
    } else if (data.consumptionVariability <= data.xyzThresholds.yThreshold) {
      xyzClass = 'Y';
    } else {
      xyzClass = 'Z';
    }

    // Combined class
    const combinedClass = `${abcClass}${xyzClass}` as CombinedClass;

    const newClassification: InventoryClassification = {
      id: `cls-${MOCK_CLASSIFICATIONS.length + 1}`,
      ...data,
      abcClass: data.manualOverride && data.manualClass ? data.manualClass.charAt(0) as ABCClass : abcClass,
      xyzClass: data.manualOverride && data.manualClass ? data.manualClass.charAt(1) as XYZClass : xyzClass,
      combinedClass: data.manualOverride && data.manualClass ? data.manualClass : combinedClass,
      lastCalculated: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    MOCK_CLASSIFICATIONS.push(newClassification);

    return {
      data: newClassification,
      status: 201,
    };
  },

  updateClassification: async (
    id: string,
    data: Partial<InventoryClassification>
  ): Promise<ApiResponse<InventoryClassification>> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const index = MOCK_CLASSIFICATIONS.findIndex(cls => cls.id === id);
    if (index === -1) {
      throw new Error('Classification not found');
    }

    // Recalculate classification if relevant parameters changed and not manual override
    let abcClass = MOCK_CLASSIFICATIONS[index].abcClass;
    let xyzClass = MOCK_CLASSIFICATIONS[index].xyzClass;
    let combinedClass = MOCK_CLASSIFICATIONS[index].combinedClass;

    if (!data.manualOverride) {
      // Determine ABC class based on annual consumption value
      if (data.annualConsumptionValue !== undefined) {
        if (data.annualConsumptionValue >= 100000) {
          abcClass = 'A';
        } else if (data.annualConsumptionValue >= 10000) {
          abcClass = 'B';
        } else {
          abcClass = 'C';
        }
      }

      // Determine XYZ class based on consumption variability
      if (data.consumptionVariability !== undefined) {
        const xThreshold = data.xyzThresholds?.xThreshold || MOCK_CLASSIFICATIONS[index].xyzThresholds.xThreshold;
        const yThreshold = data.xyzThresholds?.yThreshold || MOCK_CLASSIFICATIONS[index].xyzThresholds.yThreshold;
        
        if (data.consumptionVariability <= xThreshold) {
          xyzClass = 'X';
        } else if (data.consumptionVariability <= yThreshold) {
          xyzClass = 'Y';
        } else {
          xyzClass = 'Z';
        }
      }

      combinedClass = `${abcClass}${xyzClass}` as CombinedClass;
    } else if (data.manualClass) {
      abcClass = data.manualClass.charAt(0) as ABCClass;
      xyzClass = data.manualClass.charAt(1) as XYZClass;
      combinedClass = data.manualClass;
    }

    MOCK_CLASSIFICATIONS[index] = {
      ...MOCK_CLASSIFICATIONS[index],
      ...data,
      abcClass,
      xyzClass,
      combinedClass,
      lastCalculated: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return {
      data: MOCK_CLASSIFICATIONS[index],
      status: 200,
    };
  },

  // Inventory Policies
  getInventoryPolicies: async (
    params: PaginationParams & OptimizationFilters
  ): Promise<PaginatedResponse<InventoryPolicy>> => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    let filteredData = [...MOCK_POLICIES];

    if (params.item) {
      filteredData = filteredData.filter(policy => 
        policy.item.itemCode.toLowerCase().includes(params.item!.toLowerCase()) ||
        policy.item.name.toLowerCase().includes(params.item!.toLowerCase())
      );
    }
    if (params.location) {
      filteredData = filteredData.filter(policy => 
        policy.location.name.toLowerCase().includes(params.location!.toLowerCase())
      );
    }
    if (params.policyType) {
      filteredData = filteredData.filter(policy => policy.policyType === params.policyType);
    }
    if (params.serviceLevel) {
      filteredData = filteredData.filter(policy => policy.serviceLevel === params.serviceLevel);
    }
    if (params.combinedClass) {
      filteredData = filteredData.filter(policy => policy.abcxyzClass === params.combinedClass);
    }
    if (params.dateRange) {
      const start = new Date(params.dateRange.start);
      const end = new Date(params.dateRange.end);
      filteredData = filteredData.filter(policy => {
        const lastReviewed = new Date(policy.lastReviewed);
        return lastReviewed >= start && lastReviewed <= end;
      });
    }

    // Apply sorting
    if (params.sortBy) {
      filteredData.sort((a: any, b: any) => {
        const aValue = a[params.sortBy!];
        const bValue = b[params.sortBy!];
        return params.sortOrder === 'desc' ? 
          (bValue > aValue ? 1 : -1) : 
          (aValue > bValue ? 1 : -1);
      });
    }

    const start = (params.page - 1) * params.pageSize;
    const end = start + params.pageSize;
    const paginatedData = filteredData.slice(start, end);

    return {
      items: paginatedData,
      total: filteredData.length,
      page: params.page,
      pageSize: params.pageSize,
      totalPages: Math.ceil(filteredData.length / params.pageSize),
    };
  },

  getInventoryPolicyById: async (id: string): Promise<ApiResponse<InventoryPolicy>> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const policy = MOCK_POLICIES.find(p => p.id === id);

    if (!policy) {
      throw new Error('Inventory policy not found');
    }

    return {
      data: policy,
      status: 200,
    };
  },

  createInventoryPolicy: async (
    data: Omit<InventoryPolicy, 'id' | 'lastReviewed' | 'createdAt' | 'updatedAt'>
  ): Promise<ApiResponse<InventoryPolicy>> => {
    await new Promise(resolve => setTimeout(resolve, 1500));

    const newPolicy: InventoryPolicy = {
      id: `pol-${MOCK_POLICIES.length + 1}`,
      ...data,
      lastReviewed: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    MOCK_POLICIES.push(newPolicy);

    return {
      data: newPolicy,
      status: 201,
    };
  },

  updateInventoryPolicy: async (
    id: string,
    data: Partial<InventoryPolicy>
  ): Promise<ApiResponse<InventoryPolicy>> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const index = MOCK_POLICIES.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error('Inventory policy not found');
    }

    MOCK_POLICIES[index] = {
      ...MOCK_POLICIES[index],
      ...data,
      lastReviewed: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return {
      data: MOCK_POLICIES[index],
      status: 200,
    };
  },

  // Bulk operations
  bulkCalculateSafetyStock: async (
    itemIds: string[]
  ): Promise<ApiResponse<{ processed: number; updated: number }>> => {
    await new Promise(resolve => setTimeout(resolve, 2000));

    return {
      data: {
        processed: itemIds.length,
        updated: itemIds.length,
      },
      status: 200,
    };
  },

  bulkCalculateReorderPoints: async (
    itemIds: string[]
  ): Promise<ApiResponse<{ processed: number; updated: number }>> => {
    await new Promise(resolve => setTimeout(resolve, 2000));

    return {
      data: {
        processed: itemIds.length,
        updated: itemIds.length,
      },
      status: 200,
    };
  },

  bulkClassifyInventory: async (
    itemIds: string[]
  ): Promise<ApiResponse<{ processed: number; updated: number }>> => {
    await new Promise(resolve => setTimeout(resolve, 2000));

    return {
      data: {
        processed: itemIds.length,
        updated: itemIds.length,
      },
      status: 200,
    };
  },

  bulkAssignPolicies: async (
    data: {
      combinedClass: CombinedClass;
      policyType: InventoryPolicyType;
      serviceLevel: ServiceLevel;
      minQuantity?: number;
      maxQuantity?: number;
      reviewPeriod?: number;
    }
  ): Promise<ApiResponse<{ processed: number; updated: number }>> => {
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Count how many items would be affected
    const affectedItems = MOCK_CLASSIFICATIONS.filter(
      cls => cls.combinedClass === data.combinedClass
    ).length;

    return {
      data: {
        processed: affectedItems,
        updated: affectedItems,
      },
      status: 200,
    };
  },
};