import { api } from '@/lib/api';
import type { ApiResponse, PaginatedResponse, PaginationParams } from '@/types/common';
import type {
  Warehouse,
  WarehouseZone,
  WarehouseAisle,
  WarehouseRack,
  WarehouseBin,
  PutawayRule,
  WarehouseTask,
  PickPath,
  CycleCount,
  LogisticsFilters
} from '@/types/logistics';

// Mock data for development
const MOCK_WAREHOUSES: Warehouse[] = Array.from({ length: 3 }, (_, i) => ({
  id: `wh-${i + 1}`,
  name: `Warehouse ${i + 1}`,
  code: `WH${i + 1}`,
  address: {
    street: `${123 + i} Main Street`,
    city: 'Chicago',
    state: 'IL',
    country: 'USA',
    postalCode: '60601',
  },
  status: 'ACTIVE',
  totalArea: 50000 + (i * 10000),
  areaUnit: 'SQ_FT',
  zones: [],
  manager: {
    id: 'user-1',
    name: 'John Smith',
    email: 'john.smith@example.com',
    phone: '+1-555-123-4567',
  },
  operatingHours: {
    monday: '08:00-17:00',
    tuesday: '08:00-17:00',
    wednesday: '08:00-17:00',
    thursday: '08:00-17:00',
    friday: '08:00-17:00',
    saturday: '09:00-13:00',
    sunday: 'Closed',
  },
  features: ['DOCK_DOORS', 'SECURITY_SYSTEM', 'CLIMATE_CONTROL'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}));

// Generate zones, aisles, racks, and bins for each warehouse
MOCK_WAREHOUSES.forEach(warehouse => {
  const zones = Array.from({ length: 3 }, (_, i) => {
    const zoneTypes: Array<WarehouseZoneType> = ['RECEIVING', 'STORAGE', 'PICKING'];
    return {
      id: `zone-${warehouse.id}-${i + 1}`,
      warehouseId: warehouse.id,
      name: `${zoneTypes[i]} Zone`,
      code: `${warehouse.code}-${zoneTypes[i].substring(0, 3)}`,
      type: zoneTypes[i],
      area: 10000 + (i * 5000),
      areaUnit: 'SQ_FT',
      aisles: [],
      restrictions: i === 2 ? ['TEMPERATURE_CONTROLLED'] : [],
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  });

  zones.forEach(zone => {
    const aisles = Array.from({ length: 3 }, (_, i) => {
      return {
        id: `aisle-${zone.id}-${i + 1}`,
        zoneId: zone.id,
        name: `Aisle ${String.fromCharCode(65 + i)}`,
        code: `${zone.code}-${String.fromCharCode(65 + i)}`,
        racks: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    });

    aisles.forEach(aisle => {
      const racks = Array.from({ length: 3 }, (_, i) => {
        return {
          id: `rack-${aisle.id}-${i + 1}`,
          aisleId: aisle.id,
          name: `Rack ${i + 1}`,
          code: `${aisle.code}-R${i + 1}`,
          bins: [],
          dimensions: {
            length: 10,
            width: 4,
            height: 8,
            unit: 'FT',
          },
          capacity: {
            weight: 5000,
            weightUnit: 'LB',
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      });

      racks.forEach(rack => {
        const bins = Array.from({ length: 4 }, (_, i) => {
          return {
            id: `bin-${rack.id}-${i + 1}`,
            rackId: rack.id,
            name: `Bin ${i + 1}`,
            code: `${rack.code}-B${i + 1}`,
            type: 'BIN',
            status: 'ACTIVE',
            dimensions: {
              length: 3,
              width: 3,
              height: 2,
              unit: 'FT',
            },
            capacity: {
              weight: 500,
              weightUnit: 'LB',
              volume: 18,
              volumeUnit: 'CUFT',
            },
            restrictions: [],
            currentItems: i % 2 === 0 ? [
              {
                itemId: `item-${i + 1}`,
                itemCode: `ITEM-${String(i + 1).padStart(4, '0')}`,
                itemName: `Product ${i + 1}`,
                quantity: 50 + (i * 10),
                reservedQuantity: 10,
              }
            ] : [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
        });

        rack.bins = bins;
      });

      aisle.racks = racks;
    });

    zone.aisles = aisles;
  });

  warehouse.zones = zones;
});

const MOCK_PUTAWAY_RULES: PutawayRule[] = Array.from({ length: 5 }, (_, i) => ({
  id: `rule-${i + 1}`,
  warehouseId: MOCK_WAREHOUSES[0].id,
  name: `Putaway Rule ${i + 1}`,
  description: `Description for putaway rule ${i + 1}`,
  priority: i + 1,
  conditions: [
    {
      field: 'item.category',
      operator: 'EQUALS',
      value: ['Electronics', 'Apparel', 'Food', 'Furniture', 'Toys'][i % 5],
    },
    {
      field: 'item.weight',
      operator: 'LESS_THAN',
      value: '50',
    },
  ],
  actions: [
    {
      type: 'ASSIGN_ZONE',
      value: MOCK_WAREHOUSES[0].zones[1].id, // Storage zone
    },
    {
      type: 'ASSIGN_AISLE',
      value: MOCK_WAREHOUSES[0].zones[1].aisles[0].id,
    },
  ],
  isActive: i < 4, // One rule is inactive
  createdBy: {
    id: 'user-1',
    email: 'john.doe@example.com',
    firstName: 'John',
    lastName: 'Doe',
    name: 'John Doe',
    roles: ['warehouse_manager'],
    permissions: ['manage_warehouse'],
    status: 'active',
    mfaEnabled: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}));

const MOCK_WAREHOUSE_TASKS: WarehouseTask[] = Array.from({ length: 10 }, (_, i) => {
  const taskTypes: TaskType[] = ['PUTAWAY', 'PICK', 'REPLENISHMENT', 'CYCLE_COUNT', 'TRANSFER'];
  const taskType = taskTypes[i % taskTypes.length];
  const statuses: TaskStatus[] = ['PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED'];
  const status = statuses[Math.floor(Math.random() * statuses.length)];
  const priorities: TaskPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
  const priority = priorities[Math.floor(Math.random() * priorities.length)];
  
  const warehouse = MOCK_WAREHOUSES[0];
  const sourceZone = warehouse.zones[0]; // Receiving
  const sourceAisle = sourceZone.aisles[0];
  const sourceRack = sourceAisle.racks[0];
  const sourceBin = sourceRack.bins[0];
  
  const destZone = warehouse.zones[1]; // Storage
  const destAisle = destZone.aisles[0];
  const destRack = destAisle.racks[0];
  const destBin = destRack.bins[0];

  return {
    id: `task-${i + 1}`,
    warehouseId: warehouse.id,
    type: taskType,
    status,
    priority,
    assignedTo: status !== 'PENDING' ? {
      id: 'user-2',
      email: 'jane.smith@example.com',
      firstName: 'Jane',
      lastName: 'Smith',
      name: 'Jane Smith',
      roles: ['warehouse_operator'],
      permissions: ['perform_tasks'],
      status: 'active',
      mfaEnabled: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } : undefined,
    assignedAt: status !== 'PENDING' ? new Date(Date.now() - 60 * 60 * 1000).toISOString() : undefined,
    startedAt: status === 'IN_PROGRESS' || status === 'COMPLETED' ? new Date(Date.now() - 30 * 60 * 1000).toISOString() : undefined,
    completedAt: status === 'COMPLETED' ? new Date().toISOString() : undefined,
    dueBy: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    estimatedDuration: 30, // 30 minutes
    actualDuration: status === 'COMPLETED' ? 25 + Math.floor(Math.random() * 10) : undefined,
    sourceLocation: {
      zoneId: sourceZone.id,
      zoneName: sourceZone.name,
      aisleId: sourceAisle.id,
      aisleName: sourceAisle.name,
      rackId: sourceRack.id,
      rackName: sourceRack.name,
      binId: sourceBin.id,
      binName: sourceBin.name,
    },
    destinationLocation: taskType !== 'CYCLE_COUNT' ? {
      zoneId: destZone.id,
      zoneName: destZone.name,
      aisleId: destAisle.id,
      aisleName: destAisle.name,
      rackId: destRack.id,
      rackName: destRack.name,
      binId: destBin.id,
      binName: destBin.name,
    } : undefined,
    items: [
      {
        itemId: `item-${i + 1}`,
        itemCode: `ITEM-${String(i + 1).padStart(4, '0')}`,
        itemName: `Product ${i + 1}`,
        quantity: 10 + (i * 5),
        uom: 'EA',
      }
    ],
    referenceNumber: `REF-${String(i + 1).padStart(4, '0')}`,
    referenceType: ['RECEIPT', 'ORDER', 'TRANSFER', 'RETURN'][Math.floor(Math.random() * 4)],
    createdBy: {
      id: 'user-1',
      email: 'john.doe@example.com',
      firstName: 'John',
      lastName: 'Doe',
      name: 'John Doe',
      roles: ['warehouse_manager'],
      permissions: ['manage_warehouse'],
      status: 'active',
      mfaEnabled: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  };
});

const MOCK_PICK_PATHS: PickPath[] = Array.from({ length: 5 }, (_, i) => {
  const warehouse = MOCK_WAREHOUSES[0];
  const pickingZone = warehouse.zones[2]; // Picking zone
  
  return {
    id: `path-${i + 1}`,
    warehouseId: warehouse.id,
    orderIds: [`order-${i * 2 + 1}`, `order-${i * 2 + 2}`],
    status: ['PENDING', 'IN_PROGRESS', 'COMPLETED'][Math.floor(Math.random() * 3)],
    assignedTo: i < 3 ? {
      id: 'user-2',
      email: 'jane.smith@example.com',
      firstName: 'Jane',
      lastName: 'Smith',
      name: 'Jane Smith',
      roles: ['warehouse_operator'],
      permissions: ['perform_tasks'],
      status: 'active',
      mfaEnabled: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } : undefined,
    startedAt: i < 3 ? new Date(Date.now() - 30 * 60 * 1000).toISOString() : undefined,
    completedAt: i === 0 ? new Date().toISOString() : undefined,
    estimatedTime: 45, // 45 minutes
    actualTime: i === 0 ? 40 : undefined,
    totalDistance: 500 + (i * 50),
    distanceUnit: 'FT',
    stops: Array.from({ length: 3 }, (_, j) => {
      const aisle = pickingZone.aisles[j % pickingZone.aisles.length];
      const rack = aisle.racks[j % aisle.racks.length];
      const bin = rack.bins[j % rack.bins.length];
      
      return {
        sequence: j + 1,
        location: {
          zoneId: pickingZone.id,
          zoneName: pickingZone.name,
          aisleId: aisle.id,
          aisleName: aisle.name,
          rackId: rack.id,
          rackName: rack.name,
          binId: bin.id,
          binName: bin.name,
        },
        items: [
          {
            itemId: `item-${j + 1}`,
            itemCode: `ITEM-${String(j + 1).padStart(4, '0')}`,
            itemName: `Product ${j + 1}`,
            quantity: 5 + j,
            orderId: `order-${i * 2 + 1}`,
            orderNumber: `ORD-${String(i * 2 + 1).padStart(4, '0')}`,
          }
        ],
      };
    }),
    createdBy: {
      id: 'user-1',
      email: 'john.doe@example.com',
      firstName: 'John',
      lastName: 'Doe',
      name: 'John Doe',
      roles: ['warehouse_manager'],
      permissions: ['manage_warehouse'],
      status: 'active',
      mfaEnabled: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  };
});

const MOCK_CYCLE_COUNTS: CycleCount[] = Array.from({ length: 5 }, (_, i) => {
  const warehouse = MOCK_WAREHOUSES[0];
  const storageZone = warehouse.zones[1]; // Storage zone
  const aisle = storageZone.aisles[0];
  const rack = aisle.racks[0];
  const bin = rack.bins[0];
  
  const countTypes: CountType[] = ['CYCLE', 'ANNUAL', 'BLIND', 'SPOT', 'DISCREPANCY'];
  const countType = countTypes[i % countTypes.length];
  
  const statuses: CountStatus[] = ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED'];
  const status = statuses[Math.floor(Math.random() * statuses.length)];
  
  return {
    id: `count-${i + 1}`,
    warehouseId: warehouse.id,
    countNumber: `CC-${String(i + 1).padStart(4, '0')}`,
    type: countType,
    status,
    scheduledDate: new Date(Date.now() + (i * 24 * 60 * 60 * 1000)).toISOString(),
    startedAt: status !== 'SCHEDULED' ? new Date(Date.now() - 60 * 60 * 1000).toISOString() : undefined,
    completedAt: status === 'COMPLETED' ? new Date().toISOString() : undefined,
    assignedTo: status !== 'SCHEDULED' ? {
      id: 'user-3',
      email: 'mike.johnson@example.com',
      firstName: 'Mike',
      lastName: 'Johnson',
      name: 'Mike Johnson',
      roles: ['inventory_controller'],
      permissions: ['manage_inventory'],
      status: 'active',
      mfaEnabled: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } : undefined,
    locations: [
      {
        zoneId: storageZone.id,
        zoneName: storageZone.name,
        aisleId: aisle.id,
        aisleName: aisle.name,
        rackId: rack.id,
        rackName: rack.name,
        binId: bin.id,
        binName: bin.name,
      }
    ],
    items: Array.from({ length: 3 }, (_, j) => {
      const expectedQty = 100 + (j * 10);
      const countedQty = status === 'COMPLETED' ? 
        (Math.random() > 0.7 ? expectedQty + Math.floor(Math.random() * 10) - 5 : expectedQty) : 
        undefined;
      const variance = countedQty !== undefined ? countedQty - expectedQty : undefined;
      const variancePercentage = variance !== undefined ? (variance / expectedQty) * 100 : undefined;
      
      return {
        itemId: `item-${j + 1}`,
        itemCode: `ITEM-${String(j + 1).padStart(4, '0')}`,
        itemName: `Product ${j + 1}`,
        expectedQuantity: expectedQty,
        countedQuantity: countedQty,
        variance,
        variancePercentage,
        status: countedQty !== undefined ? 
          (variance === 0 ? 'APPROVED' : 'VARIANCE') : 
          (status === 'IN_PROGRESS' ? 'COUNTED' : 'PENDING'),
      };
    }),
    abcClass: ['A', 'B', 'C'][Math.floor(Math.random() * 3)],
    reason: countType === 'DISCREPANCY' ? 'Inventory system showed discrepancy' : undefined,
    createdBy: {
      id: 'user-1',
      email: 'john.doe@example.com',
      firstName: 'John',
      lastName: 'Doe',
      name: 'John Doe',
      roles: ['warehouse_manager'],
      permissions: ['manage_warehouse'],
      status: 'active',
      mfaEnabled: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  };
});

export const logisticsService = {
  // Warehouses
  getWarehouses: async (
    params: PaginationParams & LogisticsFilters
  ): Promise<PaginatedResponse<Warehouse>> => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    let filteredData = [...MOCK_WAREHOUSES];

    if (params.warehouse) {
      filteredData = filteredData.filter(wh => 
        wh.name.toLowerCase().includes(params.warehouse!.toLowerCase()) ||
        wh.code.toLowerCase().includes(params.warehouse!.toLowerCase())
      );
    }
    if (params.status) {
      filteredData = filteredData.filter(wh => wh.status === params.status);
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

  getWarehouseById: async (id: string): Promise<ApiResponse<Warehouse>> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const warehouse = MOCK_WAREHOUSES.find(wh => wh.id === id);

    if (!warehouse) {
      throw new Error('Warehouse not found');
    }

    return {
      data: warehouse,
      status: 200,
    };
  },

  createWarehouse: async (warehouse: Omit<Warehouse, 'id' | 'zones' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Warehouse>> => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const newWarehouse: Warehouse = {
      id: `wh-${MOCK_WAREHOUSES.length + 1}`,
      ...warehouse,
      zones: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    MOCK_WAREHOUSES.push(newWarehouse);

    return {
      data: newWarehouse,
      status: 201,
    };
  },

  updateWarehouse: async (id: string, warehouse: Partial<Warehouse>): Promise<ApiResponse<Warehouse>> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const index = MOCK_WAREHOUSES.findIndex(wh => wh.id === id);
    if (index === -1) {
      throw new Error('Warehouse not found');
    }

    MOCK_WAREHOUSES[index] = {
      ...MOCK_WAREHOUSES[index],
      ...warehouse,
      updatedAt: new Date().toISOString(),
    };

    return {
      data: MOCK_WAREHOUSES[index],
      status: 200,
    };
  },

  // Zones
  getZones: async (
    warehouseId: string,
    params: PaginationParams & LogisticsFilters
  ): Promise<PaginatedResponse<WarehouseZone>> => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const warehouse = MOCK_WAREHOUSES.find(wh => wh.id === warehouseId);
    if (!warehouse) {
      throw new Error('Warehouse not found');
    }

    let filteredData = [...warehouse.zones];

    if (params.zone) {
      filteredData = filteredData.filter(zone => 
        zone.name.toLowerCase().includes(params.zone!.toLowerCase()) ||
        zone.code.toLowerCase().includes(params.zone!.toLowerCase())
      );
    }
    if (params.type) {
      filteredData = filteredData.filter(zone => zone.type === params.type);
    }
    if (params.status) {
      filteredData = filteredData.filter(zone => zone.status === params.status);
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

  getZoneById: async (id: string): Promise<ApiResponse<WarehouseZone>> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    let zone: WarehouseZone | undefined;
    
    for (const warehouse of MOCK_WAREHOUSES) {
      zone = warehouse.zones.find(z => z.id === id);
      if (zone) break;
    }

    if (!zone) {
      throw new Error('Zone not found');
    }

    return {
      data: zone,
      status: 200,
    };
  },

  createZone: async (
    warehouseId: string,
    zone: Omit<WarehouseZone, 'id' | 'warehouseId' | 'aisles' | 'createdAt' | 'updatedAt'>
  ): Promise<ApiResponse<WarehouseZone>> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const warehouse = MOCK_WAREHOUSES.find(wh => wh.id === warehouseId);
    if (!warehouse) {
      throw new Error('Warehouse not found');
    }

    const newZone: WarehouseZone = {
      id: `zone-${warehouseId}-${warehouse.zones.length + 1}`,
      warehouseId,
      ...zone,
      aisles: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    warehouse.zones.push(newZone);

    return {
      data: newZone,
      status: 201,
    };
  },

  // Bins
  getBins: async (
    warehouseId: string,
    params: PaginationParams & LogisticsFilters
  ): Promise<PaginatedResponse<WarehouseBin>> => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const warehouse = MOCK_WAREHOUSES.find(wh => wh.id === warehouseId);
    if (!warehouse) {
      throw new Error('Warehouse not found');
    }

    // Flatten all bins from all zones, aisles, and racks
    let allBins: WarehouseBin[] = [];
    warehouse.zones.forEach(zone => {
      zone.aisles.forEach(aisle => {
        aisle.racks.forEach(rack => {
          allBins = [...allBins, ...rack.bins];
        });
      });
    });

    let filteredData = [...allBins];

    if (params.status) {
      filteredData = filteredData.filter(bin => bin.status === params.status);
    }
    if (params.type) {
      filteredData = filteredData.filter(bin => bin.type === params.type);
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

  getBinById: async (id: string): Promise<ApiResponse<WarehouseBin>> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    let bin: WarehouseBin | undefined;
    
    for (const warehouse of MOCK_WAREHOUSES) {
      for (const zone of warehouse.zones) {
        for (const aisle of zone.aisles) {
          for (const rack of aisle.racks) {
            bin = rack.bins.find(b => b.id === id);
            if (bin) break;
          }
          if (bin) break;
        }
        if (bin) break;
      }
      if (bin) break;
    }

    if (!bin) {
      throw new Error('Bin not found');
    }

    return {
      data: bin,
      status: 200,
    };
  },

  // Putaway Rules
  getPutawayRules: async (
    warehouseId: string,
    params: PaginationParams & LogisticsFilters
  ): Promise<PaginatedResponse<PutawayRule>> => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    let filteredData = MOCK_PUTAWAY_RULES.filter(rule => rule.warehouseId === warehouseId);

    // Apply sorting
    if (params.sortBy) {
      filteredData.sort((a: any, b: any) => {
        const aValue = a[params.sortBy!];
        const bValue = b[params.sortBy!];
        return params.sortOrder === 'desc' ? 
          (bValue > aValue ? 1 : -1) : 
          (aValue > bValue ? 1 : -1);
      });
    } else {
      // Default sort by priority
      filteredData.sort((a, b) => a.priority - b.priority);
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

  getPutawayRuleById: async (id: string): Promise<ApiResponse<PutawayRule>> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const rule = MOCK_PUTAWAY_RULES.find(r => r.id === id);

    if (!rule) {
      throw new Error('Putaway rule not found');
    }

    return {
      data: rule,
      status: 200,
    };
  },

  createPutawayRule: async (rule: Omit<PutawayRule, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<PutawayRule>> => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const newRule: PutawayRule = {
      id: `rule-${MOCK_PUTAWAY_RULES.length + 1}`,
      ...rule,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    MOCK_PUTAWAY_RULES.push(newRule);

    return {
      data: newRule,
      status: 201,
    };
  },

  updatePutawayRule: async (id: string, rule: Partial<PutawayRule>): Promise<ApiResponse<PutawayRule>> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const index = MOCK_PUTAWAY_RULES.findIndex(r => r.id === id);
    if (index === -1) {
      throw new Error('Putaway rule not found');
    }

    MOCK_PUTAWAY_RULES[index] = {
      ...MOCK_PUTAWAY_RULES[index],
      ...rule,
      updatedAt: new Date().toISOString(),
    };

    return {
      data: MOCK_PUTAWAY_RULES[index],
      status: 200,
    };
  },

  // Warehouse Tasks
  getWarehouseTasks: async (
    params: PaginationParams & LogisticsFilters
  ): Promise<PaginatedResponse<WarehouseTask>> => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    let filteredData = [...MOCK_WAREHOUSE_TASKS];

    if (params.warehouse) {
      filteredData = filteredData.filter(task => task.warehouseId === params.warehouse);
    }
    if (params.status) {
      filteredData = filteredData.filter(task => task.status === params.status);
    }
    if (params.type) {
      filteredData = filteredData.filter(task => task.type === params.type);
    }
    if (params.priority) {
      filteredData = filteredData.filter(task => task.priority === params.priority);
    }
    if (params.assignedTo) {
      filteredData = filteredData.filter(task => 
        task.assignedTo?.name.toLowerCase().includes(params.assignedTo!.toLowerCase())
      );
    }
    if (params.dateRange) {
      const start = new Date(params.dateRange.start);
      const end = new Date(params.dateRange.end);
      filteredData = filteredData.filter(task => {
        const createdAt = new Date(task.createdAt);
        return createdAt >= start && createdAt <= end;
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

  getWarehouseTaskById: async (id: string): Promise<ApiResponse<WarehouseTask>> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const task = MOCK_WAREHOUSE_TASKS.find(t => t.id === id);

    if (!task) {
      throw new Error('Warehouse task not found');
    }

    return {
      data: task,
      status: 200,
    };
  },

  createWarehouseTask: async (task: Omit<WarehouseTask, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<WarehouseTask>> => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const newTask: WarehouseTask = {
      id: `task-${MOCK_WAREHOUSE_TASKS.length + 1}`,
      ...task,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    MOCK_WAREHOUSE_TASKS.push(newTask);

    return {
      data: newTask,
      status: 201,
    };
  },

  updateWarehouseTask: async (id: string, task: Partial<WarehouseTask>): Promise<ApiResponse<WarehouseTask>> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const index = MOCK_WAREHOUSE_TASKS.findIndex(t => t.id === id);
    if (index === -1) {
      throw new Error('Warehouse task not found');
    }

    MOCK_WAREHOUSE_TASKS[index] = {
      ...MOCK_WAREHOUSE_TASKS[index],
      ...task,
      updatedAt: new Date().toISOString(),
    };

    return {
      data: MOCK_WAREHOUSE_TASKS[index],
      status: 200,
    };
  },

  assignWarehouseTask: async (id: string, userId: string): Promise<ApiResponse<WarehouseTask>> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const index = MOCK_WAREHOUSE_TASKS.findIndex(t => t.id === id);
    if (index === -1) {
      throw new Error('Warehouse task not found');
    }

    MOCK_WAREHOUSE_TASKS[index] = {
      ...MOCK_WAREHOUSE_TASKS[index],
      status: 'ASSIGNED',
      assignedTo: {
        id: userId,
        email: 'jane.smith@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        name: 'Jane Smith',
        roles: ['warehouse_operator'],
        permissions: ['perform_tasks'],
        status: 'active',
        mfaEnabled: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      assignedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return {
      data: MOCK_WAREHOUSE_TASKS[index],
      status: 200,
    };
  },

  startWarehouseTask: async (id: string): Promise<ApiResponse<WarehouseTask>> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const index = MOCK_WAREHOUSE_TASKS.findIndex(t => t.id === id);
    if (index === -1) {
      throw new Error('Warehouse task not found');
    }

    MOCK_WAREHOUSE_TASKS[index] = {
      ...MOCK_WAREHOUSE_TASKS[index],
      status: 'IN_PROGRESS',
      startedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return {
      data: MOCK_WAREHOUSE_TASKS[index],
      status: 200,
    };
  },

  completeWarehouseTask: async (id: string, actualDuration: number): Promise<ApiResponse<WarehouseTask>> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const index = MOCK_WAREHOUSE_TASKS.findIndex(t => t.id === id);
    if (index === -1) {
      throw new Error('Warehouse task not found');
    }

    MOCK_WAREHOUSE_TASKS[index] = {
      ...MOCK_WAREHOUSE_TASKS[index],
      status: 'COMPLETED',
      completedAt: new Date().toISOString(),
      actualDuration,
      updatedAt: new Date().toISOString(),
    };

    return {
      data: MOCK_WAREHOUSE_TASKS[index],
      status: 200,
    };
  },

  // Pick Paths
  getPickPaths: async (
    params: PaginationParams & LogisticsFilters
  ): Promise<PaginatedResponse<PickPath>> => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    let filteredData = [...MOCK_PICK_PATHS];

    if (params.warehouse) {
      filteredData = filteredData.filter(path => path.warehouseId === params.warehouse);
    }
    if (params.status) {
      filteredData = filteredData.filter(path => path.status === params.status);
    }
    if (params.assignedTo) {
      filteredData = filteredData.filter(path => 
        path.assignedTo?.name.toLowerCase().includes(params.assignedTo!.toLowerCase())
      );
    }
    if (params.dateRange) {
      const start = new Date(params.dateRange.start);
      const end = new Date(params.dateRange.end);
      filteredData = filteredData.filter(path => {
        const createdAt = new Date(path.createdAt);
        return createdAt >= start && createdAt <= end;
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

  getPickPathById: async (id: string): Promise<ApiResponse<PickPath>> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const path = MOCK_PICK_PATHS.find(p => p.id === id);

    if (!path) {
      throw new Error('Pick path not found');
    }

    return {
      data: path,
      status: 200,
    };
  },

  createPickPath: async (
    orderIds: string[],
    warehouseId: string
  ): Promise<ApiResponse<PickPath>> => {
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simulate path optimization algorithm
    const warehouse = MOCK_WAREHOUSES.find(wh => wh.id === warehouseId);
    if (!warehouse) {
      throw new Error('Warehouse not found');
    }

    const pickingZone = warehouse.zones.find(z => z.type === 'PICKING');
    if (!pickingZone) {
      throw new Error('Picking zone not found');
    }

    // Generate optimized stops
    const stops = Array.from({ length: 3 }, (_, i) => {
      const aisle = pickingZone.aisles[i % pickingZone.aisles.length];
      const rack = aisle.racks[i % aisle.racks.length];
      const bin = rack.bins[i % rack.bins.length];
      
      return {
        sequence: i + 1,
        location: {
          zoneId: pickingZone.id,
          zoneName: pickingZone.name,
          aisleId: aisle.id,
          aisleName: aisle.name,
          rackId: rack.id,
          rackName: rack.name,
          binId: bin.id,
          binName: bin.name,
        },
        items: [
          {
            itemId: `item-${i + 1}`,
            itemCode: `ITEM-${String(i + 1).padStart(4, '0')}`,
            itemName: `Product ${i + 1}`,
            quantity: 5 + i,
            orderId: orderIds[0],
            orderNumber: `ORD-${orderIds[0].split('-')[1].padStart(4, '0')}`,
          }
        ],
      };
    });

    const newPickPath: PickPath = {
      id: `path-${MOCK_PICK_PATHS.length + 1}`,
      warehouseId,
      orderIds,
      status: 'PENDING',
      estimatedTime: 45, // 45 minutes
      totalDistance: 500, // 500 feet
      distanceUnit: 'FT',
      stops,
      createdBy: {
        id: 'user-1',
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        name: 'John Doe',
        roles: ['warehouse_manager'],
        permissions: ['manage_warehouse'],
        status: 'active',
        mfaEnabled: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    MOCK_PICK_PATHS.push(newPickPath);

    return {
      data: newPickPath,
      status: 201,
    };
  },

  assignPickPath: async (id: string, userId: string): Promise<ApiResponse<PickPath>> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const index = MOCK_PICK_PATHS.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error('Pick path not found');
    }

    MOCK_PICK_PATHS[index] = {
      ...MOCK_PICK_PATHS[index],
      status: 'IN_PROGRESS',
      assignedTo: {
        id: userId,
        email: 'jane.smith@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        name: 'Jane Smith',
        roles: ['warehouse_operator'],
        permissions: ['perform_tasks'],
        status: 'active',
        mfaEnabled: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      startedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return {
      data: MOCK_PICK_PATHS[index],
      status: 200,
    };
  },

  completePickPath: async (id: string, actualTime: number): Promise<ApiResponse<PickPath>> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const index = MOCK_PICK_PATHS.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error('Pick path not found');
    }

    MOCK_PICK_PATHS[index] = {
      ...MOCK_PICK_PATHS[index],
      status: 'COMPLETED',
      completedAt: new Date().toISOString(),
      actualTime,
      updatedAt: new Date().toISOString(),
    };

    return {
      data: MOCK_PICK_PATHS[index],
      status: 200,
    };
  },

  // Cycle Counts
  getCycleCounts: async (
    params: PaginationParams & LogisticsFilters
  ): Promise<PaginatedResponse<CycleCount>> => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    let filteredData = [...MOCK_CYCLE_COUNTS];

    if (params.warehouse) {
      filteredData = filteredData.filter(count => count.warehouseId === params.warehouse);
    }
    if (params.status) {
      filteredData = filteredData.filter(count => count.status === params.status);
    }
    if (params.type) {
      filteredData = filteredData.filter(count => count.type === params.type);
    }
    if (params.assignedTo) {
      filteredData = filteredData.filter(count => 
        count.assignedTo?.name.toLowerCase().includes(params.assignedTo!.toLowerCase())
      );
    }
    if (params.dateRange) {
      const start = new Date(params.dateRange.start);
      const end = new Date(params.dateRange.end);
      filteredData = filteredData.filter(count => {
        const scheduledDate = new Date(count.scheduledDate);
        return scheduledDate >= start && scheduledDate <= end;
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

  getCycleCountById: async (id: string): Promise<ApiResponse<CycleCount>> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const count = MOCK_CYCLE_COUNTS.find(c => c.id === id);

    if (!count) {
      throw new Error('Cycle count not found');
    }

    return {
      data: count,
      status: 200,
    };
  },

  createCycleCount: async (count: Omit<CycleCount, 'id' | 'countNumber' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<CycleCount>> => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const newCount: CycleCount = {
      id: `count-${MOCK_CYCLE_COUNTS.length + 1}`,
      countNumber: `CC-${String(MOCK_CYCLE_COUNTS.length + 1).padStart(4, '0')}`,
      ...count,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    MOCK_CYCLE_COUNTS.push(newCount);

    return {
      data: newCount,
      status: 201,
    };
  },

  updateCycleCount: async (id: string, count: Partial<CycleCount>): Promise<ApiResponse<CycleCount>> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const index = MOCK_CYCLE_COUNTS.findIndex(c => c.id === id);
    if (index === -1) {
      throw new Error('Cycle count not found');
    }

    MOCK_CYCLE_COUNTS[index] = {
      ...MOCK_CYCLE_COUNTS[index],
      ...count,
      updatedAt: new Date().toISOString(),
    };

    return {
      data: MOCK_CYCLE_COUNTS[index],
      status: 200,
    };
  },

  startCycleCount: async (id: string, userId: string): Promise<ApiResponse<CycleCount>> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const index = MOCK_CYCLE_COUNTS.findIndex(c => c.id === id);
    if (index === -1) {
      throw new Error('Cycle count not found');
    }

    MOCK_CYCLE_COUNTS[index] = {
      ...MOCK_CYCLE_COUNTS[index],
      status: 'IN_PROGRESS',
      startedAt: new Date().toISOString(),
      assignedTo: {
        id: userId,
        email: 'mike.johnson@example.com',
        firstName: 'Mike',
        lastName: 'Johnson',
        name: 'Mike Johnson',
        roles: ['inventory_controller'],
        permissions: ['manage_inventory'],
        status: 'active',
        mfaEnabled: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      updatedAt: new Date().toISOString(),
    };

    return {
      data: MOCK_CYCLE_COUNTS[index],
      status: 200,
    };
  },

  completeCycleCount: async (
    id: string, 
    items: Array<{
      itemId: string;
      countedQuantity: number;
      notes?: string;
    }>
  ): Promise<ApiResponse<CycleCount>> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const index = MOCK_CYCLE_COUNTS.findIndex(c => c.id === id);
    if (index === -1) {
      throw new Error('Cycle count not found');
    }

    // Update the counted quantities and calculate variances
    const updatedItems = MOCK_CYCLE_COUNTS[index].items.map(item => {
      const countedItem = items.find(i => i.itemId === item.itemId);
      if (!countedItem) return item;

      const countedQuantity = countedItem.countedQuantity;
      const variance = countedQuantity - item.expectedQuantity;
      const variancePercentage = (variance / item.expectedQuantity) * 100;
      
      return {
        ...item,
        countedQuantity,
        variance,
        variancePercentage,
        status: variance === 0 ? 'APPROVED' : 'VARIANCE',
        notes: countedItem.notes,
      };
    });

    MOCK_CYCLE_COUNTS[index] = {
      ...MOCK_CYCLE_COUNTS[index],
      status: 'COMPLETED',
      completedAt: new Date().toISOString(),
      items: updatedItems,
      updatedAt: new Date().toISOString(),
    };

    return {
      data: MOCK_CYCLE_COUNTS[index],
      status: 200,
    };
  },
};