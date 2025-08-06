import { pgTable, uuid, text, timestamp, numeric, boolean, jsonb, integer, index } from 'drizzle-orm/pg-core';
import { users } from './users';

// Integrations
export const integrations = pgTable('integrations', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  integrationNumber: text('integration_number').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  type: text('type').notNull(), // API, WEBHOOK, DATABASE, FILE, MESSAGE_QUEUE, CUSTOM
  category: text('category').notNull(), // ERP, CRM, ACCOUNTING, SHIPPING, PAYMENT, CUSTOM
  status: text('status').notNull().default('DRAFT'), // DRAFT, ACTIVE, INACTIVE, ERROR
  version: text('version').notNull().default('1.0'),
  provider: text('provider'),
  connectionConfig: jsonb('connection_config').notNull(),
  authentication: jsonb('authentication'),
  settings: jsonb('settings'),
  healthCheck: jsonb('health_check'),
  lastHealthCheck: timestamp('last_health_check', { withTimezone: true }),
  healthStatus: text('health_status').default('UNKNOWN'), // HEALTHY, WARNING, ERROR, UNKNOWN
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  createdBy: uuid('created_by').notNull().references(() => users.id),
  updatedBy: uuid('updated_by').references(() => users.id),
}, (table) => ({
  integrationNumberIdx: index('integration_number_idx').on(table.integrationNumber),
  tenantIntegrationIdx: index('tenant_integration_idx').on(table.tenantId, table.status),
}));

// API Endpoints
export const apiEndpoints = pgTable('api_endpoints', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  endpointNumber: text('endpoint_number').notNull(),
  integrationId: uuid('integration_id').notNull().references(() => integrations.id),
  name: text('name').notNull(),
  description: text('description'),
  path: text('path').notNull(),
  method: text('method').notNull(), // GET, POST, PUT, DELETE, PATCH
  status: text('status').notNull().default('ACTIVE'), // ACTIVE, INACTIVE, DEPRECATED
  version: text('version').notNull().default('v1'),
  authentication: jsonb('authentication'),
  rateLimit: jsonb('rate_limit'),
  timeout: integer('timeout').default(30000), // in milliseconds
  retryConfig: jsonb('retry_config'),
  requestSchema: jsonb('request_schema'),
  responseSchema: jsonb('response_schema'),
  headers: jsonb('headers'),
  parameters: jsonb('parameters'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  createdBy: uuid('created_by').notNull().references(() => users.id),
  updatedBy: uuid('updated_by').references(() => users.id),
}, (table) => ({
  endpointNumberIdx: index('api_endpoint_number_idx').on(table.endpointNumber),
  integrationEndpointIdx: index('integration_endpoint_idx').on(table.integrationId, table.method),
}));

// API Keys
export const apiKeys = pgTable('api_keys', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  keyNumber: text('key_number').notNull(),
  integrationId: uuid('integration_id').notNull().references(() => integrations.id),
  name: text('name').notNull(),
  description: text('description'),
  keyType: text('key_type').notNull(), // API_KEY, JWT, OAUTH, BASIC
  keyValue: text('key_value').notNull(),
  status: text('status').notNull().default('ACTIVE'), // ACTIVE, INACTIVE, EXPIRED, REVOKED
  permissions: jsonb('permissions'),
  rateLimit: jsonb('rate_limit'),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  lastUsed: timestamp('last_used', { withTimezone: true }),
  usageCount: integer('usage_count').default(0),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  createdBy: uuid('created_by').notNull().references(() => users.id),
  updatedBy: uuid('updated_by').references(() => users.id),
}, (table) => ({
  keyNumberIdx: index('api_key_number_idx').on(table.keyNumber),
  integrationKeyIdx: index('integration_key_idx').on(table.integrationId, table.status),
}));

// Webhook Subscriptions
export const webhookSubscriptions = pgTable('webhook_subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  subscriptionNumber: text('subscription_number').notNull(),
  integrationId: uuid('integration_id').notNull().references(() => integrations.id),
  name: text('name').notNull(),
  description: text('description'),
  url: text('url').notNull(),
  events: jsonb('events').notNull(),
  status: text('status').notNull().default('ACTIVE'), // ACTIVE, INACTIVE, ERROR
  authentication: jsonb('authentication'),
  headers: jsonb('headers'),
  retryConfig: jsonb('retry_config'),
  timeout: integer('timeout').default(30000), // in milliseconds
  lastDelivery: timestamp('last_delivery', { withTimezone: true }),
  lastError: timestamp('last_error', { withTimezone: true }),
  errorCount: integer('error_count').default(0),
  successCount: integer('success_count').default(0),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  createdBy: uuid('created_by').notNull().references(() => users.id),
  updatedBy: uuid('updated_by').references(() => users.id),
}, (table) => ({
  subscriptionNumberIdx: index('webhook_subscription_number_idx').on(table.subscriptionNumber),
  integrationWebhookIdx: index('integration_webhook_idx').on(table.integrationId, table.status),
}));

// Data Mappings
export const dataMappings = pgTable('data_mappings', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  mappingNumber: text('mapping_number').notNull(),
  integrationId: uuid('integration_id').notNull().references(() => integrations.id),
  name: text('name').notNull(),
  description: text('description'),
  type: text('type').notNull(), // FIELD_MAPPING, TRANSFORMATION, VALIDATION, ENRICHMENT
  direction: text('direction').notNull(), // INBOUND, OUTBOUND, BIDIRECTIONAL
  sourceSchema: jsonb('source_schema').notNull(),
  targetSchema: jsonb('target_schema').notNull(),
  mappingRules: jsonb('mapping_rules').notNull(),
  transformations: jsonb('transformations'),
  validations: jsonb('validations'),
  status: text('status').notNull().default('ACTIVE'), // ACTIVE, INACTIVE, DRAFT
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  createdBy: uuid('created_by').notNull().references(() => users.id),
  updatedBy: uuid('updated_by').references(() => users.id),
}, (table) => ({
  mappingNumberIdx: index('data_mapping_number_idx').on(table.mappingNumber),
  integrationMappingIdx: index('integration_mapping_idx').on(table.integrationId, table.type),
}));

// Integration Logs
export const integrationLogs = pgTable('integration_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  integrationId: uuid('integration_id').notNull().references(() => integrations.id),
  endpointId: uuid('endpoint_id').references(() => apiEndpoints.id),
  webhookId: uuid('webhook_id').references(() => webhookSubscriptions.id),
  requestId: text('request_id').notNull(),
  type: text('type').notNull(), // API_CALL, WEBHOOK_DELIVERY, DATA_SYNC, ERROR
  status: text('status').notNull(), // SUCCESS, FAILED, PENDING, TIMEOUT
  startTime: timestamp('start_time', { withTimezone: true }).notNull(),
  endTime: timestamp('end_time', { withTimezone: true }),
  duration: integer('duration'), // in milliseconds
  requestData: jsonb('request_data'),
  responseData: jsonb('response_data'),
  errorMessage: text('error_message'),
  errorDetails: jsonb('error_details'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  createdBy: uuid('created_by').references(() => users.id),
}, (table) => ({
  requestIdx: index('integration_request_idx').on(table.requestId),
  integrationLogIdx: index('integration_log_idx').on(table.integrationId, table.startTime),
}));

// Integration Templates
export const integrationTemplates = pgTable('integration_templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  templateNumber: text('template_number').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  category: text('category').notNull(),
  type: text('type').notNull(), // INTEGRATION, ENDPOINT, WEBHOOK, MAPPING
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
  templateNumberIdx: index('integration_template_number_idx').on(table.templateNumber),
  tenantTemplateIdx: index('tenant_integration_template_idx').on(table.tenantId, table.category),
}));

// Integration Permissions
export const integrationPermissions = pgTable('integration_permissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  integrationId: uuid('integration_id').notNull().references(() => integrations.id),
  userId: uuid('user_id').references(() => users.id),
  roleId: uuid('role_id'),
  permission: text('permission').notNull(), // VIEW, EXECUTE, CONFIGURE, ADMIN
  grantedAt: timestamp('granted_at', { withTimezone: true }).notNull().defaultNow(),
  grantedBy: uuid('granted_by').notNull().references(() => users.id),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  integrationPermissionIdx: index('integration_permission_idx').on(table.integrationId, table.permission),
})); 