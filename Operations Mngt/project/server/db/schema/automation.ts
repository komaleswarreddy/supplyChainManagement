import { pgTable, uuid, text, timestamp, numeric, boolean, jsonb, integer, index } from 'drizzle-orm/pg-core';
import { users } from './users';

// Automation Workflows
export const automationWorkflows = pgTable('automation_workflows', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  workflowNumber: text('workflow_number').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  type: text('type').notNull(), // RPA, API_INTEGRATION, DATA_PROCESSING, NOTIFICATION, REPORTING
  status: text('status').notNull().default('DRAFT'), // DRAFT, ACTIVE, PAUSED, ARCHIVED
  version: text('version').notNull().default('1.0'),
  category: text('category').notNull(), // PROCUREMENT, INVENTORY, FINANCE, HR, CUSTOMER_SERVICE
  priority: text('priority').notNull().default('NORMAL'), // LOW, NORMAL, HIGH, CRITICAL
  ownerId: uuid('owner_id').references(() => users.id),
  steps: jsonb('steps').notNull(),
  variables: jsonb('variables'),
  conditions: jsonb('conditions'),
  actions: jsonb('actions'),
  errorHandling: jsonb('error_handling'),
  timeout: integer('timeout'), // in seconds
  retryCount: integer('retry_count').default(3),
  retryDelay: integer('retry_delay').default(300), // in seconds
  isRecurring: boolean('is_recurring').notNull().default(false),
  schedule: jsonb('schedule'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  createdBy: uuid('created_by').notNull().references(() => users.id),
  updatedBy: uuid('updated_by').references(() => users.id),
}, (table) => ({
  workflowNumberIdx: index('automation_workflow_number_idx').on(table.workflowNumber),
  tenantWorkflowIdx: index('tenant_automation_workflow_idx').on(table.tenantId, table.status),
}));

// Automation Tasks
export const automationTasks = pgTable('automation_tasks', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  taskNumber: text('task_number').notNull(),
  workflowId: uuid('workflow_id').notNull().references(() => automationWorkflows.id),
  name: text('name').notNull(),
  description: text('description'),
  type: text('type').notNull(), // CLICK, TYPE, SCREENSHOT, API_CALL, DATA_EXTRACTION, VALIDATION
  status: text('status').notNull().default('PENDING'), // PENDING, RUNNING, COMPLETED, FAILED, CANCELLED
  priority: text('priority').notNull().default('NORMAL'), // LOW, NORMAL, HIGH, CRITICAL
  sequence: integer('sequence').notNull(),
  parameters: jsonb('parameters'),
  conditions: jsonb('conditions'),
  actions: jsonb('actions'),
  errorHandling: jsonb('error_handling'),
  timeout: integer('timeout'), // in seconds
  retryCount: integer('retry_count').default(3),
  retryDelay: integer('retry_delay').default(300), // in seconds
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  createdBy: uuid('created_by').notNull().references(() => users.id),
  updatedBy: uuid('updated_by').references(() => users.id),
}, (table) => ({
  taskNumberIdx: index('automation_task_number_idx').on(table.taskNumber),
  workflowTaskIdx: index('workflow_task_idx').on(table.workflowId, table.sequence),
}));

// Automation Triggers
export const automationTriggers = pgTable('automation_triggers', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  triggerNumber: text('trigger_number').notNull(),
  workflowId: uuid('workflow_id').notNull().references(() => automationWorkflows.id),
  name: text('name').notNull(),
  description: text('description'),
  type: text('type').notNull(), // SCHEDULE, EVENT, MANUAL, API_WEBHOOK, CONDITION
  status: text('status').notNull().default('ACTIVE'), // ACTIVE, INACTIVE, PAUSED
  triggerConfig: jsonb('trigger_config').notNull(),
  conditions: jsonb('conditions'),
  filters: jsonb('filters'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  createdBy: uuid('created_by').notNull().references(() => users.id),
  updatedBy: uuid('updated_by').references(() => users.id),
}, (table) => ({
  triggerNumberIdx: index('automation_trigger_number_idx').on(table.triggerNumber),
  workflowTriggerIdx: index('workflow_trigger_idx').on(table.workflowId, table.status),
}));

// Automation Logs
export const automationLogs = pgTable('automation_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  workflowId: uuid('workflow_id').notNull().references(() => automationWorkflows.id),
  taskId: uuid('task_id').references(() => automationTasks.id),
  triggerId: uuid('trigger_id').references(() => automationTriggers.id),
  executionId: text('execution_id').notNull(),
  status: text('status').notNull(), // STARTED, RUNNING, COMPLETED, FAILED, CANCELLED
  startTime: timestamp('start_time', { withTimezone: true }).notNull(),
  endTime: timestamp('end_time', { withTimezone: true }),
  duration: integer('duration'), // in milliseconds
  errorMessage: text('error_message'),
  errorDetails: jsonb('error_details'),
  inputData: jsonb('input_data'),
  outputData: jsonb('output_data'),
  steps: jsonb('steps'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  createdBy: uuid('created_by').references(() => users.id),
}, (table) => ({
  executionIdx: index('automation_execution_idx').on(table.executionId),
  workflowLogIdx: index('workflow_log_idx').on(table.workflowId, table.startTime),
}));

// Automation Schedules
export const automationSchedules = pgTable('automation_schedules', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  scheduleNumber: text('schedule_number').notNull(),
  workflowId: uuid('workflow_id').notNull().references(() => automationWorkflows.id),
  name: text('name').notNull(),
  description: text('description'),
  type: text('type').notNull(), // CRON, INTERVAL, CALENDAR, EVENT_BASED
  status: text('status').notNull().default('ACTIVE'), // ACTIVE, PAUSED, CANCELLED
  scheduleConfig: jsonb('schedule_config').notNull(),
  timezone: text('timezone').default('UTC'),
  startDate: timestamp('start_date', { withTimezone: true }),
  endDate: timestamp('end_date', { withTimezone: true }),
  lastRun: timestamp('last_run', { withTimezone: true }),
  nextRun: timestamp('next_run', { withTimezone: true }),
  runCount: integer('run_count').default(0),
  maxRuns: integer('max_runs'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  createdBy: uuid('created_by').notNull().references(() => users.id),
  updatedBy: uuid('updated_by').references(() => users.id),
}, (table) => ({
  scheduleNumberIdx: index('automation_schedule_number_idx').on(table.scheduleNumber),
  workflowScheduleIdx: index('workflow_schedule_idx').on(table.workflowId, table.status),
}));

// Automation Variables
export const automationVariables = pgTable('automation_variables', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  workflowId: uuid('workflow_id').notNull().references(() => automationWorkflows.id),
  name: text('name').notNull(),
  description: text('description'),
  type: text('type').notNull(), // STRING, NUMBER, BOOLEAN, ARRAY, OBJECT
  value: jsonb('value'),
  defaultValue: jsonb('default_value'),
  isRequired: boolean('is_required').notNull().default(false),
  isSecret: boolean('is_secret').notNull().default(false),
  validation: jsonb('validation'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  createdBy: uuid('created_by').notNull().references(() => users.id),
  updatedBy: uuid('updated_by').references(() => users.id),
}, (table) => ({
  workflowVariableIdx: index('workflow_variable_idx').on(table.workflowId, table.name),
}));

// Automation Templates
export const automationTemplates = pgTable('automation_templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  templateNumber: text('template_number').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  category: text('category').notNull(),
  type: text('type').notNull(), // WORKFLOW, TASK, TRIGGER
  template: jsonb('template').notNull(),
  parameters: jsonb('parameters'),
  isDefault: boolean('is_default').notNull().default(false),
  isActive: boolean('is_active').notNull().default(true),
  version: text('version').notNull().default('1.0'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  createdBy: uuid('created_by').notNull().references(() => users.id),
  updatedBy: uuid('updated_by').references(() => users.id),
}, (table) => ({
  templateNumberIdx: index('automation_template_number_idx').on(table.templateNumber),
  tenantTemplateIdx: index('tenant_automation_template_idx').on(table.tenantId, table.category),
}));

// Automation Permissions
export const automationPermissions = pgTable('automation_permissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  workflowId: uuid('workflow_id').notNull().references(() => automationWorkflows.id),
  userId: uuid('user_id').references(() => users.id),
  roleId: uuid('role_id'),
  permission: text('permission').notNull(), // VIEW, EXECUTE, EDIT, DELETE, ADMIN
  grantedAt: timestamp('granted_at', { withTimezone: true }).notNull().defaultNow(),
  grantedBy: uuid('granted_by').notNull().references(() => users.id),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  workflowPermissionIdx: index('workflow_permission_idx').on(table.workflowId, table.permission),
})); 