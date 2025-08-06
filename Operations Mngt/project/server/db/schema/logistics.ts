import { pgTable, uuid, text, timestamp, numeric, boolean, jsonb, integer, index } from 'drizzle-orm/pg-core';
import { users } from './users';
import { warehouses } from './warehouse';
import { orders } from './orders';
import { shipments } from './transportation';

// Logistics Tasks
export const logisticsTasks = pgTable('logistics_tasks', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  taskNumber: text('task_number').notNull(),
  type: text('type').notNull(), // PICK, PACK, SHIP, RECEIVE, PUTAWAY, TRANSFER, CYCLE_COUNT
  status: text('status').notNull().default('PENDING'), // PENDING, ASSIGNED, IN_PROGRESS, COMPLETED, CANCELLED
  priority: text('priority').notNull().default('NORMAL'), // LOW, NORMAL, HIGH, URGENT
  warehouseId: uuid('warehouse_id').references(() => warehouses.id),
  assignedTo: uuid('assigned_to').references(() => users.id),
  orderId: uuid('order_id').references(() => orders.id),
  shipmentId: uuid('shipment_id').references(() => shipments.id),
  sourceLocation: jsonb('source_location'),
  destinationLocation: jsonb('destination_location'),
  items: jsonb('items').notNull(),
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
  taskNumberIdx: index('logistics_task_number_idx').on(table.taskNumber),
  tenantTaskIdx: index('tenant_logistics_task_idx').on(table.tenantId, table.status),
}));

// Logistics Routes
export const logisticsRoutes = pgTable('logistics_routes', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  routeNumber: text('route_number').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  type: text('type').notNull(), // PICKING, PUTAWAY, TRANSFER, DELIVERY
  status: text('status').notNull().default('PLANNED'), // PLANNED, IN_PROGRESS, COMPLETED, CANCELLED
  warehouseId: uuid('warehouse_id').references(() => warehouses.id),
  assignedTo: uuid('assigned_to').references(() => users.id),
  startLocation: jsonb('start_location').notNull(),
  endLocation: jsonb('end_location').notNull(),
  waypoints: jsonb('waypoints').notNull(),
  estimatedDistance: numeric('estimated_distance', { precision: 10, scale: 2 }), // in meters
  actualDistance: numeric('actual_distance', { precision: 10, scale: 2 }), // in meters
  estimatedDuration: integer('estimated_duration'), // in minutes
  actualDuration: integer('actual_duration'), // in minutes
  scheduledStart: timestamp('scheduled_start', { withTimezone: true }),
  scheduledEnd: timestamp('scheduled_end', { withTimezone: true }),
  startedAt: timestamp('started_at', { withTimezone: true }),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  completedBy: uuid('completed_by').references(() => users.id),
  optimizationData: jsonb('optimization_data'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  createdBy: uuid('created_by').notNull().references(() => users.id),
  updatedBy: uuid('updated_by').references(() => users.id),
}, (table) => ({
  routeNumberIdx: index('logistics_route_number_idx').on(table.routeNumber),
  tenantRouteIdx: index('tenant_logistics_route_idx').on(table.tenantId, table.status),
}));

// Logistics Equipment
export const logisticsEquipment = pgTable('logistics_equipment', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  equipmentNumber: text('equipment_number').notNull(),
  name: text('name').notNull(),
  type: text('type').notNull(), // FORKLIFT, PALLET_JACK, CONVEYOR, SCANNER, PRINTER, OTHER
  model: text('model'),
  manufacturer: text('manufacturer'),
  serialNumber: text('serial_number'),
  status: text('status').notNull().default('AVAILABLE'), // AVAILABLE, IN_USE, MAINTENANCE, OUT_OF_SERVICE
  warehouseId: uuid('warehouse_id').references(() => warehouses.id),
  assignedTo: uuid('assigned_to').references(() => users.id),
  location: jsonb('location'),
  specifications: jsonb('specifications'),
  maintenanceSchedule: jsonb('maintenance_schedule'),
  lastMaintenance: timestamp('last_maintenance', { withTimezone: true }),
  nextMaintenance: timestamp('next_maintenance', { withTimezone: true }),
  purchaseDate: timestamp('purchase_date', { withTimezone: true }),
  warrantyExpiry: timestamp('warranty_expiry', { withTimezone: true }),
  notes: text('notes'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  createdBy: uuid('created_by').notNull().references(() => users.id),
  updatedBy: uuid('updated_by').references(() => users.id),
}, (table) => ({
  equipmentNumberIdx: index('logistics_equipment_number_idx').on(table.equipmentNumber),
  tenantEquipmentIdx: index('tenant_logistics_equipment_idx').on(table.tenantId, table.status),
}));

// Logistics Performance
export const logisticsPerformance = pgTable('logistics_performance', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  date: timestamp('date', { withTimezone: true }).notNull(),
  warehouseId: uuid('warehouse_id').references(() => warehouses.id),
  userId: uuid('user_id').references(() => users.id),
  metricType: text('metric_type').notNull(), // TASK_COMPLETION, PICK_RATE, PUTAWAY_RATE, ACCURACY, EFFICIENCY
  metricValue: numeric('metric_value', { precision: 10, scale: 2 }).notNull(),
  targetValue: numeric('target_value', { precision: 10, scale: 2 }),
  unit: text('unit').notNull(), // PERCENTAGE, COUNT, TIME, DISTANCE
  period: text('period').notNull(), // HOURLY, DAILY, WEEKLY, MONTHLY
  context: jsonb('context'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  performanceDateIdx: index('logistics_performance_date_idx').on(table.date),
  tenantPerformanceIdx: index('tenant_logistics_performance_idx').on(table.tenantId, table.metricType),
}));

// Logistics Schedules
export const logisticsSchedules = pgTable('logistics_schedules', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  scheduleNumber: text('schedule_number').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  type: text('type').notNull(), // TASK_SCHEDULE, ROUTE_SCHEDULE, MAINTENANCE_SCHEDULE
  status: text('status').notNull().default('ACTIVE'), // ACTIVE, PAUSED, CANCELLED
  warehouseId: uuid('warehouse_id').references(() => warehouses.id),
  assignedTo: uuid('assigned_to').references(() => users.id),
  schedule: jsonb('schedule').notNull(), // Cron expression or schedule definition
  startDate: timestamp('start_date', { withTimezone: true }).notNull(),
  endDate: timestamp('end_date', { withTimezone: true }),
  lastRun: timestamp('last_run', { withTimezone: true }),
  nextRun: timestamp('next_run', { withTimezone: true }),
  isRecurring: boolean('is_recurring').notNull().default(false),
  recurrencePattern: jsonb('recurrence_pattern'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  createdBy: uuid('created_by').notNull().references(() => users.id),
  updatedBy: uuid('updated_by').references(() => users.id),
}, (table) => ({
  scheduleNumberIdx: index('logistics_schedule_number_idx').on(table.scheduleNumber),
  tenantScheduleIdx: index('tenant_logistics_schedule_idx').on(table.tenantId, table.status),
}));

// Logistics Zones
export const logisticsZones = pgTable('logistics_zones', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  zoneNumber: text('zone_number').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  type: text('type').notNull(), // PICKING, STORAGE, RECEIVING, SHIPPING, CROSS_DOCK
  warehouseId: uuid('warehouse_id').references(() => warehouses.id),
  managerId: uuid('manager_id').references(() => users.id),
  boundaries: jsonb('boundaries').notNull(),
  capacity: jsonb('capacity'),
  restrictions: jsonb('restrictions'),
  equipment: jsonb('equipment'),
  status: text('status').notNull().default('ACTIVE'), // ACTIVE, INACTIVE, MAINTENANCE
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  createdBy: uuid('created_by').notNull().references(() => users.id),
  updatedBy: uuid('updated_by').references(() => users.id),
}, (table) => ({
  zoneNumberIdx: index('logistics_zone_number_idx').on(table.zoneNumber),
  tenantZoneIdx: index('tenant_logistics_zone_idx').on(table.tenantId, table.type),
}));

// Logistics Workflows
export const logisticsWorkflows = pgTable('logistics_workflows', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  workflowNumber: text('workflow_number').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  type: text('type').notNull(), // ORDER_FULFILLMENT, RECEIVING, INVENTORY_MANAGEMENT
  status: text('status').notNull().default('ACTIVE'), // ACTIVE, INACTIVE, DRAFT
  steps: jsonb('steps').notNull(),
  conditions: jsonb('conditions'),
  actions: jsonb('actions'),
  triggers: jsonb('triggers'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  createdBy: uuid('created_by').notNull().references(() => users.id),
  updatedBy: uuid('updated_by').references(() => users.id),
}, (table) => ({
  workflowNumberIdx: index('logistics_workflow_number_idx').on(table.workflowNumber),
  tenantWorkflowIdx: index('tenant_logistics_workflow_idx').on(table.tenantId, table.type),
})); 