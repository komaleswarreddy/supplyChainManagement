import { pgTable, uuid, text, timestamp, numeric, integer, boolean, jsonb, index } from 'drizzle-orm/pg-core';
import { users } from './users';

// Warehouses
export const warehouses = pgTable('warehouses', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  code: text('code').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  type: text('type').notNull(), // DISTRIBUTION, FULFILLMENT, MANUFACTURING, COLD_STORAGE
  status: text('status').notNull().default('ACTIVE'), // ACTIVE, INACTIVE, MAINTENANCE, CLOSED
  address: jsonb('address').notNull(),
  contactInfo: jsonb('contact_info').notNull(),
  operatingHours: jsonb('operating_hours').notNull(),
  capacity: jsonb('capacity').notNull(), // { totalArea, usableArea, storageCapacity }
  equipment: jsonb('equipment'), // Available equipment
  restrictions: jsonb('restrictions'), // Special handling requirements
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  createdBy: uuid('created_by').notNull().references(() => users.id),
  updatedBy: uuid('updated_by').references(() => users.id),
}, (table) => ({
  warehouseCodeIdx: index('warehouse_code_idx').on(table.code),
  tenantWarehouseIdx: index('tenant_warehouse_idx').on(table.tenantId, table.code),
}));

// Warehouse Zones
export const warehouseZones = pgTable('warehouse_zones', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  warehouseId: uuid('warehouse_id').notNull().references(() => warehouses.id),
  code: text('code').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  type: text('type').notNull(), // PICKING, STORAGE, RECEIVING, SHIPPING, CROSS_DOCK
  status: text('status').notNull().default('ACTIVE'), // ACTIVE, INACTIVE, MAINTENANCE
  capacity: jsonb('capacity').notNull(), // { area, volume, weight }
  restrictions: jsonb('restrictions'), // Special handling requirements
  temperature: jsonb('temperature'), // Temperature requirements
  security: jsonb('security'), // Security requirements
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  createdBy: uuid('created_by').notNull().references(() => users.id),
  updatedBy: uuid('updated_by').references(() => users.id),
}, (table) => ({
  zoneCodeIdx: index('zone_code_idx').on(table.code),
  warehouseZoneIdx: index('warehouse_zone_idx').on(table.warehouseId, table.code),
}));

// Warehouse Aisles
export const warehouseAisles = pgTable('warehouse_aisles', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  warehouseId: uuid('warehouse_id').notNull().references(() => warehouses.id),
  zoneId: uuid('zone_id').notNull().references(() => warehouseZones.id),
  code: text('code').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  type: text('type').notNull(), // NARROW, WIDE, VERY_NARROW
  status: text('status').notNull().default('ACTIVE'), // ACTIVE, INACTIVE, MAINTENANCE
  dimensions: jsonb('dimensions').notNull(), // { length, width, height }
  capacity: jsonb('capacity').notNull(), // { maxWeight, maxVolume }
  equipment: jsonb('equipment'), // Required equipment
  restrictions: jsonb('restrictions'), // Access restrictions
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  createdBy: uuid('created_by').notNull().references(() => users.id),
  updatedBy: uuid('updated_by').references(() => users.id),
}, (table) => ({
  aisleCodeIdx: index('aisle_code_idx').on(table.code),
  zoneAisleIdx: index('zone_aisle_idx').on(table.zoneId, table.code),
}));

// Warehouse Racks
export const warehouseRacks = pgTable('warehouse_racks', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  warehouseId: uuid('warehouse_id').notNull().references(() => warehouses.id),
  zoneId: uuid('zone_id').notNull().references(() => warehouseZones.id),
  aisleId: uuid('aisle_id').notNull().references(() => warehouseAisles.id),
  code: text('code').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  type: text('type').notNull(), // PALLET_RACK, CARTON_FLOW, MEZZANINE, BULK_STORAGE
  status: text('status').notNull().default('ACTIVE'), // ACTIVE, INACTIVE, MAINTENANCE
  dimensions: jsonb('dimensions').notNull(), // { length, width, height, levels }
  capacity: jsonb('capacity').notNull(), // { maxWeight, maxVolume, palletPositions }
  equipment: jsonb('equipment'), // Required equipment
  restrictions: jsonb('restrictions'), // Access restrictions
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  createdBy: uuid('created_by').notNull().references(() => users.id),
  updatedBy: uuid('updated_by').references(() => users.id),
}, (table) => ({
  rackCodeIdx: index('rack_code_idx').on(table.code),
  aisleRackIdx: index('aisle_rack_idx').on(table.aisleId, table.code),
}));

// Warehouse Bins/Locations
export const warehouseBins = pgTable('warehouse_bins', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  warehouseId: uuid('warehouse_id').notNull().references(() => warehouses.id),
  zoneId: uuid('zone_id').notNull().references(() => warehouseZones.id),
  aisleId: uuid('aisle_id').notNull().references(() => warehouseAisles.id),
  rackId: uuid('rack_id').notNull().references(() => warehouseRacks.id),
  code: text('code').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  type: text('type').notNull(), // PALLET, CARTON, BULK, PICK_FACE
  status: text('status').notNull().default('AVAILABLE'), // AVAILABLE, OCCUPIED, RESERVED, MAINTENANCE
  dimensions: jsonb('dimensions').notNull(), // { length, width, height }
  capacity: jsonb('capacity').notNull(), // { maxWeight, maxVolume, maxQuantity }
  currentInventory: jsonb('current_inventory'), // Current inventory details
  restrictions: jsonb('restrictions'), // Special handling requirements
  coordinates: jsonb('coordinates'), // GPS coordinates
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  createdBy: uuid('created_by').notNull().references(() => users.id),
  updatedBy: uuid('updated_by').references(() => users.id),
}, (table) => ({
  binCodeIdx: index('bin_code_idx').on(table.code),
  rackBinIdx: index('rack_bin_idx').on(table.rackId, table.code),
}));

// Warehouse Tasks
export const warehouseTasks = pgTable('warehouse_tasks', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  warehouseId: uuid('warehouse_id').notNull().references(() => warehouses.id),
  taskNumber: text('task_number').notNull(),
  type: text('type').notNull(), // PICK, PUTAWAY, CYCLE_COUNT, REPLENISHMENT, TRANSFER
  priority: text('priority').notNull().default('NORMAL'), // LOW, NORMAL, HIGH, URGENT
  status: text('status').notNull().default('PENDING'), // PENDING, ASSIGNED, IN_PROGRESS, COMPLETED, CANCELLED
  assignedTo: uuid('assigned_to').references(() => users.id),
  sourceLocation: jsonb('source_location'),
  destinationLocation: jsonb('destination_location'),
  items: jsonb('items').notNull(), // Task items
  estimatedDuration: integer('estimated_duration'), // in minutes
  actualDuration: integer('actual_duration'), // in minutes
  scheduledStart: timestamp('scheduled_start', { withTimezone: true }),
  scheduledEnd: timestamp('scheduled_end', { withTimezone: true }),
  startedAt: timestamp('started_at', { withTimezone: true }),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  completedBy: uuid('completed_by').references(() => users.id),
  notes: text('notes'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  createdBy: uuid('created_by').notNull().references(() => users.id),
  updatedBy: uuid('updated_by').references(() => users.id),
}, (table) => ({
  taskNumberIdx: index('task_number_idx').on(table.taskNumber),
  warehouseTaskIdx: index('warehouse_task_idx').on(table.warehouseId, table.status),
}));

// Cycle Counts
export const cycleCounts = pgTable('cycle_counts', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  warehouseId: uuid('warehouse_id').notNull().references(() => warehouses.id),
  countNumber: text('count_number').notNull(),
  type: text('type').notNull(), // ABC, RANDOM, LOCATION, ITEM
  status: text('status').notNull().default('PLANNED'), // PLANNED, IN_PROGRESS, COMPLETED, CANCELLED
  assignedTo: uuid('assigned_to').references(() => users.id),
  locations: jsonb('locations').notNull(), // Locations to count
  items: jsonb('items').notNull(), // Items to count
  scheduledDate: timestamp('scheduled_date', { withTimezone: true }).notNull(),
  startedAt: timestamp('started_at', { withTimezone: true }),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  completedBy: uuid('completed_by').references(() => users.id),
  variances: jsonb('variances'), // Count variances
  notes: text('notes'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  createdBy: uuid('created_by').notNull().references(() => users.id),
  updatedBy: uuid('updated_by').references(() => users.id),
}, (table) => ({
  countNumberIdx: index('count_number_idx').on(table.countNumber),
  warehouseCountIdx: index('warehouse_count_idx').on(table.warehouseId, table.status),
}));

// Pick Paths
export const pickPaths = pgTable('pick_paths', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  warehouseId: uuid('warehouse_id').notNull().references(() => warehouses.id),
  pathNumber: text('path_number').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  type: text('type').notNull(), // SINGLE_ORDER, BATCH, ZONE, WAVE
  status: text('status').notNull().default('PLANNED'), // PLANNED, IN_PROGRESS, COMPLETED, CANCELLED
  assignedTo: uuid('assigned_to').references(() => users.id),
  orders: jsonb('orders').notNull(), // Orders in this pick path
  locations: jsonb('locations').notNull(), // Pick locations in sequence
  estimatedDuration: integer('estimated_duration'), // in minutes
  actualDuration: integer('actual_duration'), // in minutes
  distance: numeric('distance', { precision: 10, scale: 2 }), // in meters
  scheduledStart: timestamp('scheduled_start', { withTimezone: true }),
  scheduledEnd: timestamp('scheduled_end', { withTimezone: true }),
  startedAt: timestamp('started_at', { withTimezone: true }),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  completedBy: uuid('completed_by').references(() => users.id),
  notes: text('notes'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  createdBy: uuid('created_by').notNull().references(() => users.id),
  updatedBy: uuid('updated_by').references(() => users.id),
}, (table) => ({
  pathNumberIdx: index('path_number_idx').on(table.pathNumber),
  warehousePathIdx: index('warehouse_path_idx').on(table.warehouseId, table.status),
}));

// Warehouse Equipment
export const warehouseEquipment = pgTable('warehouse_equipment', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  warehouseId: uuid('warehouse_id').notNull().references(() => warehouses.id),
  code: text('code').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  type: text('type').notNull(), // FORKLIFT, PALLET_JACK, CONVEYOR, SCANNER, PRINTER
  model: text('model'),
  manufacturer: text('manufacturer'),
  serialNumber: text('serial_number'),
  status: text('status').notNull().default('AVAILABLE'), // AVAILABLE, IN_USE, MAINTENANCE, OUT_OF_SERVICE
  location: jsonb('location'), // Current location
  specifications: jsonb('specifications'), // Equipment specifications
  maintenanceSchedule: jsonb('maintenance_schedule'), // Maintenance schedule
  lastMaintenance: timestamp('last_maintenance', { withTimezone: true }),
  nextMaintenance: timestamp('next_maintenance', { withTimezone: true }),
  assignedTo: uuid('assigned_to').references(() => users.id),
  notes: text('notes'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  createdBy: uuid('created_by').notNull().references(() => users.id),
  updatedBy: uuid('updated_by').references(() => users.id),
}, (table) => ({
  equipmentCodeIdx: index('equipment_code_idx').on(table.code),
  warehouseEquipmentIdx: index('warehouse_equipment_idx').on(table.warehouseId, table.status),
})); 