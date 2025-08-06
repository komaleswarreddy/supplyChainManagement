import { pgTable, uuid, text, timestamp, numeric, boolean, jsonb, integer, index } from 'drizzle-orm/pg-core';
import { users } from './users';

// Mobile Devices
export const mobileDevices = pgTable('mobile_devices', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  deviceNumber: text('device_number').notNull(),
  userId: uuid('user_id').notNull().references(() => users.id),
  deviceId: text('device_id').notNull(), // Unique device identifier
  deviceType: text('device_type').notNull(), // IOS, ANDROID, WEB
  deviceModel: text('device_model'),
  deviceManufacturer: text('device_manufacturer'),
  osVersion: text('os_version'),
  appVersion: text('app_version'),
  pushToken: text('push_token'),
  status: text('status').notNull().default('ACTIVE'), // ACTIVE, INACTIVE, BLOCKED
  lastSeen: timestamp('last_seen', { withTimezone: true }),
  registrationDate: timestamp('registration_date', { withTimezone: true }).notNull().defaultNow(),
  capabilities: jsonb('capabilities'),
  settings: jsonb('settings'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  createdBy: uuid('created_by').notNull().references(() => users.id),
  updatedBy: uuid('updated_by').references(() => users.id),
}, (table) => ({
  deviceNumberIdx: index('mobile_device_number_idx').on(table.deviceNumber),
  userDeviceIdx: index('user_device_idx').on(table.userId, table.deviceType),
}));

// Mobile Sessions
export const mobileSessions = pgTable('mobile_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  sessionNumber: text('session_number').notNull(),
  deviceId: uuid('device_id').notNull().references(() => mobileDevices.id),
  userId: uuid('user_id').notNull().references(() => users.id),
  sessionToken: text('session_token').notNull(),
  status: text('status').notNull().default('ACTIVE'), // ACTIVE, EXPIRED, TERMINATED
  startTime: timestamp('start_time', { withTimezone: true }).notNull().defaultNow(),
  endTime: timestamp('end_time', { withTimezone: true }),
  duration: integer('duration'), // in seconds
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  location: jsonb('location'),
  deviceInfo: jsonb('device_info'),
  appVersion: text('app_version'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  sessionNumberIdx: index('mobile_session_number_idx').on(table.sessionNumber),
  deviceSessionIdx: index('device_session_idx').on(table.deviceId, table.status),
}));

// Mobile Notifications
export const mobileNotifications = pgTable('mobile_notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  notificationNumber: text('notification_number').notNull(),
  deviceId: uuid('device_id').notNull().references(() => mobileDevices.id),
  userId: uuid('user_id').notNull().references(() => users.id),
  title: text('title').notNull(),
  body: text('body').notNull(),
  type: text('type').notNull(), // PUSH, IN_APP, SMS, EMAIL
  category: text('category').notNull(), // ORDER_UPDATE, INVENTORY_ALERT, SYSTEM, PROMOTION
  status: text('status').notNull().default('PENDING'), // PENDING, SENT, DELIVERED, READ, FAILED
  priority: text('priority').notNull().default('NORMAL'), // LOW, NORMAL, HIGH, URGENT
  scheduledFor: timestamp('scheduled_for', { withTimezone: true }),
  sentAt: timestamp('sent_at', { withTimezone: true }),
  deliveredAt: timestamp('delivered_at', { withTimezone: true }),
  readAt: timestamp('read_at', { withTimezone: true }),
  actionUrl: text('action_url'),
  actionData: jsonb('action_data'),
  badge: integer('badge'),
  sound: text('sound'),
  imageUrl: text('image_url'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  createdBy: uuid('created_by').notNull().references(() => users.id),
  updatedBy: uuid('updated_by').references(() => users.id),
}, (table) => ({
  notificationNumberIdx: index('mobile_notification_number_idx').on(table.notificationNumber),
  deviceNotificationIdx: index('device_notification_idx').on(table.deviceId, table.status),
}));

// Mobile Configurations
export const mobileConfigurations = pgTable('mobile_configurations', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  configNumber: text('config_number').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  type: text('type').notNull(), // APP_CONFIG, FEATURE_FLAG, UI_CONFIG, API_CONFIG
  platform: text('platform'), // IOS, ANDROID, WEB, ALL
  version: text('version').notNull().default('1.0'),
  status: text('status').notNull().default('ACTIVE'), // ACTIVE, INACTIVE, DEPRECATED
  configuration: jsonb('configuration').notNull(),
  conditions: jsonb('conditions'),
  rollout: jsonb('rollout'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  createdBy: uuid('created_by').notNull().references(() => users.id),
  updatedBy: uuid('updated_by').references(() => users.id),
}, (table) => ({
  configNumberIdx: index('mobile_config_number_idx').on(table.configNumber),
  tenantConfigIdx: index('tenant_mobile_config_idx').on(table.tenantId, table.type),
}));

// Mobile Analytics
export const mobileAnalytics = pgTable('mobile_analytics', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  deviceId: uuid('device_id').notNull().references(() => mobileDevices.id),
  userId: uuid('user_id').notNull().references(() => users.id),
  eventType: text('event_type').notNull(), // APP_OPEN, FEATURE_USE, ERROR, PERFORMANCE
  eventName: text('event_name').notNull(),
  timestamp: timestamp('timestamp', { withTimezone: true }).notNull().defaultNow(),
  sessionId: uuid('session_id').references(() => mobileSessions.id),
  properties: jsonb('properties'),
  metrics: jsonb('metrics'),
  context: jsonb('context'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  deviceAnalyticsIdx: index('device_analytics_idx').on(table.deviceId, table.timestamp),
  userAnalyticsIdx: index('user_analytics_idx').on(table.userId, table.eventType),
}));

// Mobile App Versions
export const mobileAppVersions = pgTable('mobile_app_versions', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  versionNumber: text('version_number').notNull(),
  platform: text('platform').notNull(), // IOS, ANDROID, WEB
  buildNumber: text('build_number').notNull(),
  status: text('status').notNull().default('DRAFT'), // DRAFT, TESTING, RELEASED, DEPRECATED
  releaseDate: timestamp('release_date', { withTimezone: true }),
  minSupportedVersion: text('min_supported_version'),
  forceUpdate: boolean('force_update').notNull().default(false),
  changelog: text('changelog'),
  downloadUrl: text('download_url'),
  fileSize: integer('file_size'),
  checksum: text('checksum'),
  features: jsonb('features'),
  bugFixes: jsonb('bug_fixes'),
  knownIssues: jsonb('known_issues'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  createdBy: uuid('created_by').notNull().references(() => users.id),
  updatedBy: uuid('updated_by').references(() => users.id),
}, (table) => ({
  versionNumberIdx: index('mobile_version_number_idx').on(table.versionNumber),
  platformVersionIdx: index('platform_version_idx').on(table.platform, table.status),
}));

// Mobile Permissions
export const mobilePermissions = pgTable('mobile_permissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  deviceId: uuid('device_id').notNull().references(() => mobileDevices.id),
  userId: uuid('user_id').notNull().references(() => users.id),
  permission: text('permission').notNull(), // LOCATION, CAMERA, NOTIFICATIONS, STORAGE, CONTACTS
  status: text('status').notNull().default('GRANTED'), // GRANTED, DENIED, PROMPT
  grantedAt: timestamp('granted_at', { withTimezone: true }),
  revokedAt: timestamp('revoked_at', { withTimezone: true }),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  devicePermissionIdx: index('device_permission_idx').on(table.deviceId, table.permission),
}));

// Mobile Sync Data
export const mobileSyncData = pgTable('mobile_sync_data', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  deviceId: uuid('device_id').notNull().references(() => mobileDevices.id),
  userId: uuid('user_id').notNull().references(() => users.id),
  syncNumber: text('sync_number').notNull(),
  entityType: text('entity_type').notNull(), // ORDERS, INVENTORY, CUSTOMERS, PRODUCTS
  entityId: text('entity_id').notNull(),
  action: text('action').notNull(), // CREATE, UPDATE, DELETE, SYNC
  status: text('status').notNull().default('PENDING'), // PENDING, SYNCED, FAILED, CONFLICT
  data: jsonb('data'),
  conflictResolution: jsonb('conflict_resolution'),
  syncTimestamp: timestamp('sync_timestamp', { withTimezone: true }).notNull().defaultNow(),
  lastSyncAttempt: timestamp('last_sync_attempt', { withTimezone: true }),
  retryCount: integer('retry_count').default(0),
  errorMessage: text('error_message'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  syncNumberIdx: index('mobile_sync_number_idx').on(table.syncNumber),
  deviceSyncIdx: index('device_sync_idx').on(table.deviceId, table.status),
})); 