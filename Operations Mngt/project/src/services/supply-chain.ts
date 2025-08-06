import { api } from '@/lib/api';
import type { ApiResponse, PaginatedResponse, PaginationParams } from '@/types/common';
import type { 
  Forecast,
  ForecastFilters,
  ForecastAdjustment,
  PromotionImpact 
} from '@/types/supply-chain';

// Mock data for development
const MOCK_FORECASTS: Forecast[] = Array.from({ length: 10 }, (_, i) => ({
  id: `fc-${i + 1}`,
  itemId: `item-${i + 1}`,
  itemCode: `ITEM-${String(i + 1).padStart(4, '0')}`,
  itemName: `Product ${i + 1}`,
  locationId: 'loc-1',
  locationName: 'Main Warehouse',
  period: 'MONTHLY',
  startDate: new Date(2024, 0, 1).toISOString(),
  endDate: new Date(2024, 11, 31).toISOString(),
  baselineQuantity: Math.floor(Math.random() * 1000) + 500,
  adjustedQuantity: Math.floor(Math.random() * 1000) + 500,
  finalQuantity: Math.floor(Math.random() * 1000) + 500,
  confidenceInterval: {
    lower: Math.floor(Math.random() * 100),
    upper: Math.floor(Math.random() * 100) + 100,
  },
  algorithm: 'EXPONENTIAL_SMOOTHING',
  mape: Math.random() * 10,
  status: ['DRAFT', 'PENDING_APPROVAL', 'APPROVED'][Math.floor(Math.random() * 3)],
  adjustments: [],
  promotions: [],
  historicalData: Array.from({ length: 12 }, (_, j) => ({
    date: new Date(2023, j, 1).toISOString(),
    quantity: Math.floor(Math.random() * 1000),
  })),
  seasonalityFactors: Array.from({ length: 12 }, (_, j) => ({
    period: `${j + 1}`,
    factor: 1 + (Math.random() * 0.5 - 0.25),
  })),
  consensusInputs: [],
  metadata: {
    category: 'Electronics',
    productGroup: 'Laptops',
    salesChannel: 'Online',
    region: 'North America',
  },
  createdBy: {
    id: 'user-1',
    email: 'john.doe@example.com',
    firstName: 'John',
    lastName: 'Doe',
    name: 'John Doe',
    roles: ['demand_planner'],
    permissions: ['manage_forecasts'],
    status: 'active',
    mfaEnabled: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}));

export const supplyChainService = {
  getForecasts: async (
    params: PaginationParams & ForecastFilters
  ): Promise<PaginatedResponse<Forecast>> => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    let filteredData = [...MOCK_FORECASTS];

    if (params.status) {
      filteredData = filteredData.filter(forecast => forecast.status === params.status);
    }
    if (params.period) {
      filteredData = filteredData.filter(forecast => forecast.period === params.period);
    }
    if (params.item) {
      filteredData = filteredData.filter(forecast => 
        forecast.itemCode.toLowerCase().includes(params.item!.toLowerCase()) ||
        forecast.itemName.toLowerCase().includes(params.item!.toLowerCase())
      );
    }
    if (params.location) {
      filteredData = filteredData.filter(forecast => 
        forecast.locationName.toLowerCase().includes(params.location!.toLowerCase())
      );
    }
    if (params.dateRange) {
      const start = new Date(params.dateRange.start);
      const end = new Date(params.dateRange.end);
      filteredData = filteredData.filter(forecast => {
        const forecastStart = new Date(forecast.startDate);
        return forecastStart >= start && forecastStart <= end;
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

  getForecastById: async (id: string): Promise<ApiResponse<Forecast>> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const forecast = MOCK_FORECASTS.find(f => f.id === id);

    if (!forecast) {
      throw new Error('Forecast not found');
    }

    return {
      data: forecast,
      status: 200,
    };
  },

  createForecast: async (forecast: Omit<Forecast, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Forecast>> => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const newForecast: Forecast = {
      id: `fc-${MOCK_FORECASTS.length + 1}`,
      ...forecast,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    MOCK_FORECASTS.push(newForecast);

    return {
      data: newForecast,
      status: 201,
    };
  },

  updateForecast: async (id: string, forecast: Partial<Forecast>): Promise<ApiResponse<Forecast>> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const index = MOCK_FORECASTS.findIndex(f => f.id === id);
    if (index === -1) {
      throw new Error('Forecast not found');
    }

    MOCK_FORECASTS[index] = {
      ...MOCK_FORECASTS[index],
      ...forecast,
      updatedAt: new Date().toISOString(),
    };

    return {
      data: MOCK_FORECASTS[index],
      status: 200,
    };
  },

  addAdjustment: async (
    id: string,
    adjustment: Omit<ForecastAdjustment, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<ApiResponse<Forecast>> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const index = MOCK_FORECASTS.findIndex(f => f.id === id);
    if (index === -1) {
      throw new Error('Forecast not found');
    }

    const newAdjustment: ForecastAdjustment = {
      id: `adj-${Date.now()}`,
      ...adjustment,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    MOCK_FORECASTS[index].adjustments.push(newAdjustment);
    MOCK_FORECASTS[index].updatedAt = new Date().toISOString();

    return {
      data: MOCK_FORECASTS[index],
      status: 200,
    };
  },

  addPromotion: async (
    id: string,
    promotion: Omit<PromotionImpact, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<ApiResponse<Forecast>> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const index = MOCK_FORECASTS.findIndex(f => f.id === id);
    if (index === -1) {
      throw new Error('Forecast not found');
    }

    const newPromotion: PromotionImpact = {
      id: `promo-${Date.now()}`,
      ...promotion,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    MOCK_FORECASTS[index].promotions.push(newPromotion);
    MOCK_FORECASTS[index].updatedAt = new Date().toISOString();

    return {
      data: MOCK_FORECASTS[index],
      status: 200,
    };
  },

  submitForecast: async (id: string): Promise<ApiResponse<Forecast>> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const index = MOCK_FORECASTS.findIndex(f => f.id === id);
    if (index === -1) {
      throw new Error('Forecast not found');
    }

    MOCK_FORECASTS[index] = {
      ...MOCK_FORECASTS[index],
      status: 'PENDING_APPROVAL',
      updatedAt: new Date().toISOString(),
    };

    return {
      data: MOCK_FORECASTS[index],
      status: 200,
    };
  },

  approveForecast: async (id: string): Promise<ApiResponse<Forecast>> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const index = MOCK_FORECASTS.findIndex(f => f.id === id);
    if (index === -1) {
      throw new Error('Forecast not found');
    }

    MOCK_FORECASTS[index] = {
      ...MOCK_FORECASTS[index],
      status: 'APPROVED',
      approvedAt: new Date().toISOString(),
      approvedBy: {
        id: 'user-2',
        email: 'jane.smith@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        name: 'Jane Smith',
        roles: ['demand_manager'],
        permissions: ['approve_forecasts'],
        status: 'active',
        mfaEnabled: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      updatedAt: new Date().toISOString(),
    };

    return {
      data: MOCK_FORECASTS[index],
      status: 200,
    };
  },

  rejectForecast: async (id: string, reason: string): Promise<ApiResponse<Forecast>> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const index = MOCK_FORECASTS.findIndex(f => f.id === id);
    if (index === -1) {
      throw new Error('Forecast not found');
    }

    MOCK_FORECASTS[index] = {
      ...MOCK_FORECASTS[index],
      status: 'REJECTED',
      notes: reason,
      updatedAt: new Date().toISOString(),
    };

    return {
      data: MOCK_FORECASTS[index],
      status: 200,
    };
  },
};