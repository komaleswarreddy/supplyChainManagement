import { api } from '@/lib/api';
import type { ApiResponse, PaginatedResponse, PaginationParams } from '@/types/common';
import type {
  StockItem,
  StockMovement,
  StockAdjustment,
  StockFilters,
  MovementFilters,
  AdjustmentFilters,
} from '@/types/inventory';

// Mock data for development
const MOCK_STOCK_ITEMS: StockItem[] = Array.from({ length: 10 }, (_, i) => ({
  id: `stock-${i + 1}`,
  itemCode: `ITEM-${String(i + 1).padStart(4, '0')}`,
  name: `Test Item ${i + 1}`,
  description: 'Sample item description',
  category: 'Electronics',
  unit: 'EA',
  minQuantity: 10,
  maxQuantity: 100,
  reorderPoint: 20,
  currentQuantity: Math.floor(Math.random() * 100),
  status: ['IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK'][Math.floor(Math.random() * 3)],
  location: {
    warehouse: 'Main Warehouse',
    zone: 'Zone A',
    bin: `BIN-${String(i + 1).padStart(3, '0')}`,
  },
  supplier: {
    id: 'sup-1',
    name: 'Test Supplier',
    leadTime: 7,
  },
  cost: {
    unitCost: 99.99,
    currency: 'USD',
    lastPurchaseDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  quality: {
    batchNumber: `BATCH-${String(i + 1).padStart(4, '0')}`,
    expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
    inspectionRequired: true,
    inspectionStatus: 'PASSED',
  },
  createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  updatedAt: new Date().toISOString(),
}));

const MOCK_MOVEMENTS: StockMovement[] = Array.from({ length: 10 }, (_, i) => ({
  id: `mov-${i + 1}`,
  type: ['RECEIPT', 'ISSUE', 'RETURN', 'ADJUSTMENT', 'TRANSFER'][Math.floor(Math.random() * 5)],
  referenceNumber: `MOV-${String(i + 1).padStart(4, '0')}`,
  item: {
    id: MOCK_STOCK_ITEMS[0].id,
    itemCode: MOCK_STOCK_ITEMS[0].itemCode,
    name: MOCK_STOCK_ITEMS[0].name,
  },
  quantity: Math.floor(Math.random() * 50) + 1,
  fromLocation: {
    warehouse: 'Main Warehouse',
    zone: 'Zone A',
    bin: 'BIN-001',
  },
  toLocation: {
    warehouse: 'Main Warehouse',
    zone: 'Zone B',
    bin: 'BIN-002',
  },
  status: ['PENDING', 'COMPLETED', 'CANCELLED'][Math.floor(Math.random() * 3)],
  processedBy: {
    id: 'user-1',
    email: 'john.doe@example.com',
    firstName: 'John',
    lastName: 'Doe',
    name: 'John Doe',
    roles: ['inventory_manager'],
    permissions: ['manage_inventory'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  processedAt: new Date().toISOString(),
  createdBy: {
    id: 'user-1',
    email: 'john.doe@example.com',
    firstName: 'John',
    lastName: 'Doe',
    name: 'John Doe',
    roles: ['inventory_manager'],
    permissions: ['manage_inventory'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  notes: 'Sample movement notes',
}));

const MOCK_ADJUSTMENTS: StockAdjustment[] = Array.from({ length: 10 }, (_, i) => ({
  id: `adj-${i + 1}`,
  adjustmentNumber: `ADJ-${String(i + 1).padStart(4, '0')}`,
  item: {
    id: MOCK_STOCK_ITEMS[0].id,
    itemCode: MOCK_STOCK_ITEMS[0].itemCode,
    name: MOCK_STOCK_ITEMS[0].name,
  },
  type: ['INCREASE', 'DECREASE'][Math.floor(Math.random() * 2)],
  quantity: Math.floor(Math.random() * 20) + 1,
  reason: 'Stock count discrepancy',
  status: ['PENDING', 'APPROVED', 'REJECTED', 'COMPLETED'][Math.floor(Math.random() * 4)],
  createdBy: {
    id: 'user-1',
    email: 'john.doe@example.com',
    firstName: 'John',
    lastName: 'Doe',
    name: 'John Doe',
    roles: ['inventory_manager'],
    permissions: ['manage_inventory'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  notes: 'Sample adjustment notes',
}));

export const inventoryService = {
  // Stock Items
  getStockItems: async (
    params: PaginationParams & StockFilters
  ): Promise<PaginatedResponse<StockItem>> => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    let filteredData = [...MOCK_STOCK_ITEMS];

    if (params.status) {
      filteredData = filteredData.filter(item => item.status === params.status);
    }
    if (params.category) {
      filteredData = filteredData.filter(item => 
        item.category.toLowerCase().includes(params.category!.toLowerCase())
      );
    }
    if (params.warehouse) {
      filteredData = filteredData.filter(item => 
        item.location.warehouse.toLowerCase().includes(params.warehouse!.toLowerCase())
      );
    }
    if (params.supplier) {
      filteredData = filteredData.filter(item => 
        item.supplier.name.toLowerCase().includes(params.supplier!.toLowerCase())
      );
    }
    if (params.minQuantity !== undefined) {
      filteredData = filteredData.filter(item => item.currentQuantity >= params.minQuantity!);
    }
    if (params.maxQuantity !== undefined) {
      filteredData = filteredData.filter(item => item.currentQuantity <= params.maxQuantity!);
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

  getStockItemById: async (id: string): Promise<ApiResponse<StockItem>> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const item = MOCK_STOCK_ITEMS.find(item => item.id === id);

    if (!item) {
      throw new Error('Stock item not found');
    }

    return {
      data: item,
      status: 200,
    };
  },

  // Stock Movements
  getStockMovements: async (
    params: PaginationParams & MovementFilters
  ): Promise<PaginatedResponse<StockMovement>> => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    let filteredData = [...MOCK_MOVEMENTS];

    if (params.type) {
      filteredData = filteredData.filter(movement => movement.type === params.type);
    }
    if (params.item) {
      filteredData = filteredData.filter(movement => 
        movement.item.name.toLowerCase().includes(params.item!.toLowerCase()) ||
        movement.item.itemCode.toLowerCase().includes(params.item!.toLowerCase())
      );
    }
    if (params.warehouse) {
      filteredData = filteredData.filter(movement => 
        movement.fromLocation?.warehouse.toLowerCase().includes(params.warehouse!.toLowerCase()) ||
        movement.toLocation?.warehouse.toLowerCase().includes(params.warehouse!.toLowerCase())
      );
    }
    if (params.status) {
      filteredData = filteredData.filter(movement => movement.status === params.status);
    }
    if (params.dateRange) {
      const start = new Date(params.dateRange.start);
      const end = new Date(params.dateRange.end);
      filteredData = filteredData.filter(movement => {
        const date = new Date(movement.createdAt);
        return date >= start && date <= end;
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

  getStockMovementById: async (id: string): Promise<ApiResponse<StockMovement>> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const movement = MOCK_MOVEMENTS.find(movement => movement.id === id);

    if (!movement) {
      throw new Error('Stock movement not found');
    }

    return {
      data: movement,
      status: 200,
    };
  },

  createStockMovement: async (movement: Omit<StockMovement, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<StockMovement>> => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const newMovement: StockMovement = {
      id: `mov-${MOCK_MOVEMENTS.length + 1}`,
      ...movement,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    MOCK_MOVEMENTS.push(newMovement);

    return {
      data: newMovement,
      status: 201,
    };
  },

  // Stock Adjustments
  getStockAdjustments: async (
    params: PaginationParams & AdjustmentFilters
  ): Promise<PaginatedResponse<StockAdjustment>> => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    let filteredData = [...MOCK_ADJUSTMENTS];

    if (params.type) {
      filteredData = filteredData.filter(adjustment => adjustment.type === params.type);
    }
    if (params.item) {
      filteredData = filteredData.filter(adjustment => 
        adjustment.item.name.toLowerCase().includes(params.item!.toLowerCase()) ||
        adjustment.item.itemCode.toLowerCase().includes(params.item!.toLowerCase())
      );
    }
    if (params.status) {
      filteredData = filteredData.filter(adjustment => adjustment.status === params.status);
    }
    if (params.dateRange) {
      const start = new Date(params.dateRange.start);
      const end = new Date(params.dateRange.end);
      filteredData = filteredData.filter(adjustment => {
        const date = new Date(adjustment.createdAt);
        return date >= start && date <= end;
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

  getStockAdjustmentById: async (id: string): Promise<ApiResponse<StockAdjustment>> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const adjustment = MOCK_ADJUSTMENTS.find(adj => adj.id === id);

    if (!adjustment) {
      throw new Error('Adjustment not found');
    }

    return {
      data: adjustment,
      status: 200,
    };
  },

  createStockAdjustment: async (adjustment: Omit<StockAdjustment, 'id' | 'adjustmentNumber' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<StockAdjustment>> => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const newAdjustment: StockAdjustment = {
      id: `adj-${MOCK_ADJUSTMENTS.length + 1}`,
      adjustmentNumber: `ADJ-${String(MOCK_ADJUSTMENTS.length + 1).padStart(4, '0')}`,
      ...adjustment,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    MOCK_ADJUSTMENTS.push(newAdjustment);

    return {
      data: newAdjustment,
      status: 201,
    };
  },

  approveAdjustment: async (id: string, approver: User): Promise<ApiResponse<StockAdjustment>> => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const index = MOCK_ADJUSTMENTS.findIndex(adj => adj.id === id);
    if (index === -1) {
      throw new Error('Adjustment not found');
    }

    MOCK_ADJUSTMENTS[index] = {
      ...MOCK_ADJUSTMENTS[index],
      status: 'APPROVED',
      approver,
      approvedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return {
      data: MOCK_ADJUSTMENTS[index],
      status: 200,
    };
  },

  rejectAdjustment: async (id: string): Promise<ApiResponse<StockAdjustment>> => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const index = MOCK_ADJUSTMENTS.findIndex(adj => adj.id === id);
    if (index === -1) {
      throw new Error('Adjustment not found');
    }

    MOCK_ADJUSTMENTS[index] = {
      ...MOCK_ADJUSTMENTS[index],
      status: 'REJECTED',
      updatedAt: new Date().toISOString(),
    };

    return {
      data: MOCK_ADJUSTMENTS[index],
      status: 200,
    };
  },
};