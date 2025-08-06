import type { User } from './user';

// Warehouse Management Types
export type WarehouseZoneType = 
  | 'RECEIVING'
  | 'STORAGE'
  | 'PICKING'
  | 'PACKING'
  | 'SHIPPING'
  | 'RETURNS'
  | 'QUARANTINE'
  | 'BULK'
  | 'HAZARDOUS'
  | 'REFRIGERATED'
  | 'FROZEN';

export type LocationType =
  | 'FLOOR'
  | 'RACK'
  | 'SHELF'
  | 'BIN'
  | 'PALLET'
  | 'DRAWER'
  | 'CAGE'
  | 'VAULT';

export type LocationStatus =
  | 'ACTIVE'
  | 'INACTIVE'
  | 'MAINTENANCE'
  | 'RESERVED'
  | 'BLOCKED';

export type TaskStatus =
  | 'PENDING'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

export type TaskPriority =
  | 'LOW'
  | 'MEDIUM'
  | 'HIGH'
  | 'URGENT';

export type TaskType =
  | 'PUTAWAY'
  | 'PICK'
  | 'REPLENISHMENT'
  | 'CYCLE_COUNT'
  | 'TRANSFER'
  | 'CONSOLIDATION'
  | 'CLEANUP';

export type CountType =
  | 'CYCLE'
  | 'ANNUAL'
  | 'BLIND'
  | 'SPOT'
  | 'DISCREPANCY';

export type CountStatus =
  | 'SCHEDULED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

export type Warehouse = {
  id: string;
  name: string;
  code: string;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';
  totalArea: number; // in square feet/meters
  areaUnit: 'SQ_FT' | 'SQ_M';
  zones: WarehouseZone[];
  manager: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  operatingHours: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  };
  features: string[]; // e.g., ['DOCK_DOORS', 'COLD_STORAGE', 'HAZMAT']
  createdAt: string;
  updatedAt: string;
};

export type WarehouseZone = {
  id: string;
  warehouseId: string;
  name: string;
  code: string;
  type: WarehouseZoneType;
  area: number;
  areaUnit: 'SQ_FT' | 'SQ_M';
  aisles: WarehouseAisle[];
  restrictions: string[]; // e.g., ['HAZMAT', 'TEMPERATURE_CONTROLLED']
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';
  createdAt: string;
  updatedAt: string;
};

export type WarehouseAisle = {
  id: string;
  zoneId: string;
  name: string;
  code: string;
  racks: WarehouseRack[];
  createdAt: string;
  updatedAt: string;
};

export type WarehouseRack = {
  id: string;
  aisleId: string;
  name: string;
  code: string;
  bins: WarehouseBin[];
  dimensions: {
    length: number;
    width: number;
    height: number;
    unit: 'FT' | 'M' | 'IN' | 'CM';
  };
  capacity: {
    weight: number;
    weightUnit: 'LB' | 'KG';
  };
  createdAt: string;
  updatedAt: string;
};

export type WarehouseBin = {
  id: string;
  rackId: string;
  name: string;
  code: string;
  type: LocationType;
  status: LocationStatus;
  dimensions: {
    length: number;
    width: number;
    height: number;
    unit: 'FT' | 'M' | 'IN' | 'CM';
  };
  capacity: {
    weight: number;
    weightUnit: 'LB' | 'KG';
    volume: number;
    volumeUnit: 'CUFT' | 'CBM';
  };
  restrictions: string[];
  currentItems: {
    itemId: string;
    itemCode: string;
    itemName: string;
    quantity: number;
    reservedQuantity: number;
  }[];
  createdAt: string;
  updatedAt: string;
};

export type PutawayRule = {
  id: string;
  warehouseId: string;
  name: string;
  description: string;
  priority: number;
  conditions: {
    field: string;
    operator: 'EQUALS' | 'NOT_EQUALS' | 'GREATER_THAN' | 'LESS_THAN' | 'CONTAINS' | 'NOT_CONTAINS';
    value: string;
  }[];
  actions: {
    type: 'ASSIGN_ZONE' | 'ASSIGN_AISLE' | 'ASSIGN_RACK' | 'ASSIGN_BIN';
    value: string;
  }[];
  isActive: boolean;
  createdBy: User;
  createdAt: string;
  updatedAt: string;
};

export type WarehouseTask = {
  id: string;
  warehouseId: string;
  type: TaskType;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo?: User;
  assignedAt?: string;
  startedAt?: string;
  completedAt?: string;
  dueBy?: string;
  estimatedDuration: number; // in minutes
  actualDuration?: number; // in minutes
  sourceLocation?: {
    zoneId: string;
    zoneName: string;
    aisleId: string;
    aisleName: string;
    rackId: string;
    rackName: string;
    binId: string;
    binName: string;
  };
  destinationLocation?: {
    zoneId: string;
    zoneName: string;
    aisleId: string;
    aisleName: string;
    rackId: string;
    rackName: string;
    binId: string;
    binName: string;
  };
  items: {
    itemId: string;
    itemCode: string;
    itemName: string;
    quantity: number;
    uom: string;
  }[];
  referenceNumber?: string;
  referenceType?: 'RECEIPT' | 'ORDER' | 'TRANSFER' | 'RETURN';
  notes?: string;
  createdBy: User;
  createdAt: string;
  updatedAt: string;
};

export type PickPath = {
  id: string;
  warehouseId: string;
  orderIds: string[];
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  assignedTo?: User;
  startedAt?: string;
  completedAt?: string;
  estimatedTime: number; // in minutes
  actualTime?: number; // in minutes
  totalDistance: number; // in feet/meters
  distanceUnit: 'FT' | 'M';
  stops: {
    sequence: number;
    location: {
      zoneId: string;
      zoneName: string;
      aisleId: string;
      aisleName: string;
      rackId: string;
      rackName: string;
      binId: string;
      binName: string;
    };
    items: {
      itemId: string;
      itemCode: string;
      itemName: string;
      quantity: number;
      orderId: string;
      orderNumber: string;
    }[];
  }[];
  createdBy: User;
  createdAt: string;
  updatedAt: string;
};

export type CycleCount = {
  id: string;
  warehouseId: string;
  countNumber: string;
  type: CountType;
  status: CountStatus;
  scheduledDate: string;
  startedAt?: string;
  completedAt?: string;
  assignedTo?: User;
  locations: {
    zoneId: string;
    zoneName: string;
    aisleId?: string;
    aisleName?: string;
    rackId?: string;
    rackName?: string;
    binId?: string;
    binName?: string;
  }[];
  items: {
    itemId: string;
    itemCode: string;
    itemName: string;
    expectedQuantity: number;
    countedQuantity?: number;
    variance?: number;
    variancePercentage?: number;
    status?: 'PENDING' | 'COUNTED' | 'VARIANCE' | 'APPROVED';
    notes?: string;
  }[];
  abcClass?: 'A' | 'B' | 'C';
  reason?: string;
  notes?: string;
  createdBy: User;
  createdAt: string;
  updatedAt: string;
};

export type LogisticsFilters = {
  warehouse?: string;
  zone?: string;
  status?: string;
  type?: string;
  assignedTo?: string;
  priority?: TaskPriority;
  dateRange?: {
    start: string;
    end: string;
  };
};