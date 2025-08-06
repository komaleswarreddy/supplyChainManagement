import { pgTable, uuid, text, timestamp, numeric, integer, boolean, jsonb } from 'drizzle-orm/pg-core';
import { users } from './users';
import { inventoryItems } from './inventory';
import { suppliers } from './suppliers';

// Quality Control Plans
export const qualityControlPlans = pgTable('quality_control_plans', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  planName: text('plan_name').notNull(),
  description: text('description'),
  planType: text('plan_type').notNull(), // INCOMING, IN_PROCESS, FINAL
  status: text('status').notNull().default('ACTIVE'),
  inspectionCriteria: jsonb('inspection_criteria').notNull(),
  samplingPlan: jsonb('sampling_plan').notNull(),
  acceptanceCriteria: jsonb('acceptance_criteria').notNull(),
  applicableItems: text('applicable_items').array(),
  applicableSuppliers: uuid('applicable_suppliers').array(),
  qualityStandards: text('quality_standards').array(),
  regulatoryRequirements: text('regulatory_requirements').array(),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  createdBy: uuid('created_by').notNull().references(() => users.id),
  updatedBy: uuid('updated_by').references(() => users.id),
});

// Inspections
export const inspections = pgTable('inspections', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  inspectionNumber: text('inspection_number').notNull(),
  planId: uuid('plan_id').references(() => qualityControlPlans.id),
  itemId: uuid('item_id').references(() => inventoryItems.id),
  supplierId: uuid('supplier_id').references(() => suppliers.id),
  inspectionType: text('inspection_type').notNull(), // INCOMING, IN_PROCESS, FINAL, ROUTINE, SPECIAL
  status: text('status').notNull().default('PENDING'),
  inspectorId: uuid('inspector_id').notNull().references(() => users.id),
  scheduledDate: timestamp('scheduled_date', { withTimezone: true }),
  startedAt: timestamp('started_at', { withTimezone: true }),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  result: text('result'), // PASS, FAIL, CONDITIONAL
  sampleSize: integer('sample_size'),
  defectsFound: integer('defects_found').default(0),
  defectRate: numeric('defect_rate', { precision: 5, scale: 4 }),
  notes: text('notes'),
  attachments: text('attachments').array(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  createdBy: uuid('created_by').notNull().references(() => users.id),
  updatedBy: uuid('updated_by').references(() => users.id),
});

// Inspection Results
export const inspectionResults = pgTable('inspection_results', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  inspectionId: uuid('inspection_id').notNull().references(() => inspections.id),
  criterionId: text('criterion_id').notNull(),
  criterionName: text('criterion_name').notNull(),
  criterionType: text('criterion_type').notNull(), // VISUAL, MEASUREMENT, FUNCTIONAL, DOCUMENTATION
  expectedValue: text('expected_value'),
  actualValue: text('actual_value'),
  tolerance: text('tolerance'),
  result: text('result').notNull(), // PASS, FAIL, N/A
  severity: text('severity'), // CRITICAL, MAJOR, MINOR
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  createdBy: uuid('created_by').notNull().references(() => users.id),
});

// Non-Conformances
export const nonConformances = pgTable('non_conformances', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  ncNumber: text('nc_number').notNull(),
  inspectionId: uuid('inspection_id').references(() => inspections.id),
  itemId: uuid('item_id').references(() => inventoryItems.id),
  supplierId: uuid('supplier_id').references(() => suppliers.id),
  type: text('type').notNull(), // SUPPLIER, INTERNAL, CUSTOMER
  category: text('category').notNull(), // QUALITY, SAFETY, REGULATORY, DOCUMENTATION
  severity: text('severity').notNull(), // CRITICAL, MAJOR, MINOR
  status: text('status').notNull().default('OPEN'),
  description: text('description').notNull(),
  rootCause: text('root_cause'),
  impact: text('impact'),
  quantityAffected: integer('quantity_affected'),
  costImpact: numeric('cost_impact', { precision: 15, scale: 2 }),
  assignedTo: uuid('assigned_to').references(() => users.id),
  dueDate: timestamp('due_date', { withTimezone: true }),
  closedAt: timestamp('closed_at', { withTimezone: true }),
  closedBy: uuid('closed_by').references(() => users.id),
  notes: text('notes'),
  attachments: text('attachments').array(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  createdBy: uuid('created_by').notNull().references(() => users.id),
  updatedBy: uuid('updated_by').references(() => users.id),
});

// Corrective Actions
export const correctiveActions = pgTable('corrective_actions', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  actionNumber: text('action_number').notNull(),
  nonConformanceId: uuid('non_conformance_id').notNull().references(() => nonConformances.id),
  type: text('type').notNull(), // CORRECTIVE, PREVENTIVE
  status: text('status').notNull().default('OPEN'),
  description: text('description').notNull(),
  actionPlan: text('action_plan').notNull(),
  assignedTo: uuid('assigned_to').notNull().references(() => users.id),
  dueDate: timestamp('due_date', { withTimezone: true }).notNull(),
  startedAt: timestamp('started_at', { withTimezone: true }),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  completedBy: uuid('completed_by').references(() => users.id),
  effectiveness: text('effectiveness'), // EFFECTIVE, PARTIALLY_EFFECTIVE, INEFFECTIVE
  verificationMethod: text('verification_method'),
  verificationDate: timestamp('verification_date', { withTimezone: true }),
  verifiedBy: uuid('verified_by').references(() => users.id),
  notes: text('notes'),
  attachments: text('attachments').array(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  createdBy: uuid('created_by').notNull().references(() => users.id),
  updatedBy: uuid('updated_by').references(() => users.id),
});

// Quality Standards
export const qualityStandards = pgTable('quality_standards', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  standardCode: text('standard_code').notNull(),
  standardName: text('standard_name').notNull(),
  version: text('version').notNull(),
  type: text('type').notNull(), // ISO, FDA, ASTM, CUSTOM
  status: text('status').notNull().default('ACTIVE'),
  description: text('description'),
  requirements: jsonb('requirements').notNull(),
  effectiveDate: timestamp('effective_date', { withTimezone: true }).notNull(),
  expiryDate: timestamp('expiry_date', { withTimezone: true }),
  applicableItems: text('applicable_items').array(),
  applicableSuppliers: uuid('applicable_suppliers').array(),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  createdBy: uuid('created_by').notNull().references(() => users.id),
  updatedBy: uuid('updated_by').references(() => users.id),
});

// Quality Metrics
export const qualityMetrics = pgTable('quality_metrics', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  metricName: text('metric_name').notNull(),
  metricType: text('metric_type').notNull(), // DEFECT_RATE, FIRST_PASS_YIELD, CUSTOMER_COMPLAINTS
  period: text('period').notNull(), // DAILY, WEEKLY, MONTHLY, QUARTERLY
  periodStart: timestamp('period_start', { withTimezone: true }).notNull(),
  periodEnd: timestamp('period_end', { withTimezone: true }).notNull(),
  target: numeric('target', { precision: 10, scale: 4 }),
  actual: numeric('actual', { precision: 10, scale: 4 }).notNull(),
  unit: text('unit').notNull(), // PERCENTAGE, PPM, COUNT
  itemId: uuid('item_id').references(() => inventoryItems.id),
  supplierId: uuid('supplier_id').references(() => suppliers.id),
  location: text('location'),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  createdBy: uuid('created_by').notNull().references(() => users.id),
});

// Audit Management
export const qualityAudits = pgTable('quality_audits', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  auditNumber: text('audit_number').notNull(),
  auditType: text('audit_type').notNull(), // INTERNAL, EXTERNAL, SUPPLIER, CERTIFICATION
  scope: text('scope').notNull(),
  status: text('status').notNull().default('PLANNED'),
  auditorId: uuid('auditor_id').notNull().references(() => users.id),
  auditeeId: uuid('auditee_id').references(() => users.id),
  supplierId: uuid('supplier_id').references(() => suppliers.id),
  plannedDate: timestamp('planned_date', { withTimezone: true }).notNull(),
  startedAt: timestamp('started_at', { withTimezone: true }),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  result: text('result'), // PASS, FAIL, CONDITIONAL
  findings: jsonb('findings'),
  recommendations: jsonb('recommendations'),
  followUpRequired: boolean('follow_up_required').default(false),
  followUpDate: timestamp('follow_up_date', { withTimezone: true }),
  notes: text('notes'),
  attachments: text('attachments').array(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  createdBy: uuid('created_by').notNull().references(() => users.id),
  updatedBy: uuid('updated_by').references(() => users.id),
}); 