import { z } from 'zod';

// Base schemas
export const MobileDeviceSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  deviceNumber: z.string(),
  name: z.string(),
  description: z.string().optional(),
  type: z.enum(['SMARTPHONE', 'TABLET', 'LAPTOP', 'DESKTOP', 'WEARABLE', 'OTHER']),
  platform: z.enum(['IOS', 'ANDROID', 'WINDOWS', 'MACOS', 'LINUX', 'WEB']),
  model: z.string(),
  manufacturer: z.string(),
  serialNumber: z.string().optional(),
  imei: z.string().optional(),
  macAddress: z.string().optional(),
  osVersion: z.string().optional(),
  appVersion: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'MAINTENANCE', 'RETIRED', 'LOST', 'STOLEN']),
  assignedTo: z.string().uuid().optional(),
  location: z.string().optional(),
  lastSeen: z.string().datetime().optional(),
  batteryLevel: z.number().min(0).max(100).optional(),
  storageInfo: z.record(z.any()).optional(),
  networkInfo: z.record(z.any()).optional(),
  pushToken: z.string().optional(),
  deviceId: z.string().optional(),
  metadata: z.record(z.any()).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  createdBy: z.string().uuid(),
  updatedBy: z.string().uuid().optional(),
});

export const MobileSessionSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  sessionNumber: z.string(),
  deviceId: z.string().uuid(),
  userId: z.string().uuid(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime().optional(),
  duration: z.number().int().positive().optional(),
  status: z.enum(['ACTIVE', 'ENDED', 'EXPIRED', 'TERMINATED']),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  location: z.string().optional(),
  appVersion: z.string().optional(),
  osVersion: z.string().optional(),
  deviceInfo: z.record(z.any()).optional(),
  sessionData: z.record(z.any()).optional(),
  metadata: z.record(z.any()).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  createdBy: z.string().uuid(),
  updatedBy: z.string().uuid().optional(),
});

export const MobileNotificationSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  notificationNumber: z.string(),
  deviceId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
  title: z.string(),
  message: z.string(),
  type: z.enum(['INFO', 'WARNING', 'ERROR', 'SUCCESS', 'ALERT', 'PROMOTION']),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']),
  status: z.enum(['PENDING', 'SENT', 'DELIVERED', 'READ', 'FAILED', 'CANCELLED']),
  scheduledAt: z.string().datetime().optional(),
  sentAt: z.string().datetime().optional(),
  deliveredAt: z.string().datetime().optional(),
  readAt: z.string().datetime().optional(),
  pushToken: z.string().optional(),
  data: z.record(z.any()).optional(),
  actions: z.array(z.string()).optional(),
  metadata: z.record(z.any()).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  createdBy: z.string().uuid(),
  updatedBy: z.string().uuid().optional(),
});

export const MobileConfigurationSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  configurationNumber: z.string(),
  name: z.string(),
  description: z.string().optional(),
  type: z.enum(['APP_CONFIG', 'FEATURE_FLAG', 'UI_CONFIG', 'API_CONFIG', 'SECURITY_CONFIG', 'SYNC_CONFIG']),
  platform: z.enum(['IOS', 'ANDROID', 'WINDOWS', 'MACOS', 'LINUX', 'WEB', 'ALL']),
  version: z.string(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'DRAFT', 'ARCHIVED']),
  configuration: z.record(z.any()),
  conditions: z.record(z.any()).optional(),
  rolloutPercentage: z.number().min(0).max(100),
  targetDevices: z.array(z.string()).optional(),
  targetUsers: z.array(z.string()).optional(),
  effectiveFrom: z.string().datetime().optional(),
  effectiveTo: z.string().datetime().optional(),
  metadata: z.record(z.any()).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  createdBy: z.string().uuid(),
  updatedBy: z.string().uuid().optional(),
});

export const MobileAnalyticsSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  analyticsNumber: z.string(),
  deviceId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
  sessionId: z.string().uuid().optional(),
  eventType: z.string(),
  eventName: z.string(),
  eventData: z.record(z.any()).optional(),
  timestamp: z.string().datetime(),
  duration: z.number().int().positive().optional(),
  location: z.string().optional(),
  networkType: z.string().optional(),
  batteryLevel: z.number().min(0).max(100).optional(),
  appVersion: z.string().optional(),
  osVersion: z.string().optional(),
  deviceInfo: z.record(z.any()).optional(),
  metadata: z.record(z.any()).optional(),
  createdAt: z.string().datetime(),
});

export const MobileAppVersionSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  versionNumber: z.string(),
  name: z.string(),
  description: z.string().optional(),
  platform: z.enum(['IOS', 'ANDROID', 'WINDOWS', 'MACOS', 'LINUX', 'WEB']),
  version: z.string(),
  buildNumber: z.string().optional(),
  status: z.enum(['DRAFT', 'BETA', 'RELEASE_CANDIDATE', 'RELEASED', 'DEPRECATED']),
  releaseDate: z.string().datetime().optional(),
  minOsVersion: z.string().optional(),
  maxOsVersion: z.string().optional(),
  supportedDevices: z.array(z.string()).optional(),
  features: z.array(z.string()).optional(),
  bugFixes: z.array(z.string()).optional(),
  knownIssues: z.array(z.string()).optional(),
  downloadUrl: z.string().url().optional(),
  fileSize: z.number().int().positive().optional(),
  checksum: z.string().optional(),
  isForcedUpdate: z.boolean(),
  isCriticalUpdate: z.boolean(),
  changelog: z.string().optional(),
  metadata: z.record(z.any()).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  createdBy: z.string().uuid(),
  updatedBy: z.string().uuid().optional(),
});

export const MobilePermissionSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  permissionNumber: z.string(),
  name: z.string(),
  description: z.string().optional(),
  type: z.enum(['CAMERA', 'LOCATION', 'NOTIFICATIONS', 'STORAGE', 'MICROPHONE', 'CONTACTS', 'CALENDAR', 'CUSTOM']),
  platform: z.enum(['IOS', 'ANDROID', 'WINDOWS', 'MACOS', 'LINUX', 'WEB', 'ALL']),
  status: z.enum(['REQUIRED', 'OPTIONAL', 'DISABLED']),
  isGranted: z.boolean(),
  grantedAt: z.string().datetime().optional(),
  revokedAt: z.string().datetime().optional(),
  reason: z.string().optional(),
  deviceId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
  metadata: z.record(z.any()).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  createdBy: z.string().uuid(),
  updatedBy: z.string().uuid().optional(),
});

export const MobileSyncDataSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  syncNumber: z.string(),
  deviceId: z.string().uuid(),
  userId: z.string().uuid(),
  entityType: z.string(),
  entityId: z.string(),
  action: z.enum(['CREATE', 'UPDATE', 'DELETE', 'SYNC']),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'CONFLICT']),
  syncTimestamp: z.string().datetime(),
  lastSyncAttempt: z.string().datetime().optional(),
  retryCount: z.number().int().positive(),
  maxRetries: z.number().int().positive(),
  errorMessage: z.string().optional(),
  data: z.record(z.any()).optional(),
  conflictResolution: z.record(z.any()).optional(),
  metadata: z.record(z.any()).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  createdBy: z.string().uuid(),
  updatedBy: z.string().uuid().optional(),
});

// Request/Response schemas
export const CreateMobileDeviceSchema = MobileDeviceSchema.omit({
  id: true,
  tenantId: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
  updatedBy: true,
});

export const UpdateMobileDeviceSchema = CreateMobileDeviceSchema.partial();

export const CreateMobileSessionSchema = MobileSessionSchema.omit({
  id: true,
  tenantId: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
  updatedBy: true,
});

export const UpdateMobileSessionSchema = CreateMobileSessionSchema.partial();

export const CreateMobileNotificationSchema = MobileNotificationSchema.omit({
  id: true,
  tenantId: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
  updatedBy: true,
});

export const UpdateMobileNotificationSchema = CreateMobileNotificationSchema.partial();

export const CreateMobileConfigurationSchema = MobileConfigurationSchema.omit({
  id: true,
  tenantId: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
  updatedBy: true,
});

export const UpdateMobileConfigurationSchema = CreateMobileConfigurationSchema.partial();

export const CreateMobileAnalyticsSchema = MobileAnalyticsSchema.omit({
  id: true,
  tenantId: true,
  createdAt: true,
});

export const UpdateMobileAnalyticsSchema = CreateMobileAnalyticsSchema.partial();

export const CreateMobileAppVersionSchema = MobileAppVersionSchema.omit({
  id: true,
  tenantId: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
  updatedBy: true,
});

export const UpdateMobileAppVersionSchema = CreateMobileAppVersionSchema.partial();

export const CreateMobilePermissionSchema = MobilePermissionSchema.omit({
  id: true,
  tenantId: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
  updatedBy: true,
});

export const UpdateMobilePermissionSchema = CreateMobilePermissionSchema.partial();

export const CreateMobileSyncDataSchema = MobileSyncDataSchema.omit({
  id: true,
  tenantId: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
  updatedBy: true,
});

export const UpdateMobileSyncDataSchema = CreateMobileSyncDataSchema.partial();

// Analytics schemas
export const MobileDashboardSchema = z.object({
  metrics: z.object({
    totalDevices: z.number(),
    activeDevices: z.number(),
    totalSessions: z.number(),
    totalNotifications: z.number(),
    averageSessionDuration: z.number(),
  }),
  recentAnalytics: z.array(MobileAnalyticsSchema),
  deviceStats: z.object({
    byPlatform: z.record(z.number()),
    byType: z.record(z.number()),
    byStatus: z.record(z.number()),
  }),
});

export const MobileAnalyticsResponseSchema = z.object({
  analytics: z.array(MobileAnalyticsSchema),
  summary: z.object({
    totalDevices: z.number(),
    activeDevices: z.number(),
    totalSessions: z.number(),
    totalNotifications: z.number(),
    averageSessionDuration: z.number(),
  }),
});

// Type exports
export type MobileDevice = z.infer<typeof MobileDeviceSchema>;
export type MobileSession = z.infer<typeof MobileSessionSchema>;
export type MobileNotification = z.infer<typeof MobileNotificationSchema>;
export type MobileConfiguration = z.infer<typeof MobileConfigurationSchema>;
export type MobileAnalytics = z.infer<typeof MobileAnalyticsSchema>;
export type MobileAppVersion = z.infer<typeof MobileAppVersionSchema>;
export type MobilePermission = z.infer<typeof MobilePermissionSchema>;
export type MobileSyncData = z.infer<typeof MobileSyncDataSchema>;

export type CreateMobileDevice = z.infer<typeof CreateMobileDeviceSchema>;
export type UpdateMobileDevice = z.infer<typeof UpdateMobileDeviceSchema>;
export type CreateMobileSession = z.infer<typeof CreateMobileSessionSchema>;
export type UpdateMobileSession = z.infer<typeof UpdateMobileSessionSchema>;
export type CreateMobileNotification = z.infer<typeof CreateMobileNotificationSchema>;
export type UpdateMobileNotification = z.infer<typeof UpdateMobileNotificationSchema>;
export type CreateMobileConfiguration = z.infer<typeof CreateMobileConfigurationSchema>;
export type UpdateMobileConfiguration = z.infer<typeof UpdateMobileConfigurationSchema>;
export type CreateMobileAnalytics = z.infer<typeof CreateMobileAnalyticsSchema>;
export type UpdateMobileAnalytics = z.infer<typeof UpdateMobileAnalyticsSchema>;
export type CreateMobileAppVersion = z.infer<typeof CreateMobileAppVersionSchema>;
export type UpdateMobileAppVersion = z.infer<typeof UpdateMobileAppVersionSchema>;
export type CreateMobilePermission = z.infer<typeof CreateMobilePermissionSchema>;
export type UpdateMobilePermission = z.infer<typeof UpdateMobilePermissionSchema>;
export type CreateMobileSyncData = z.infer<typeof CreateMobileSyncDataSchema>;
export type UpdateMobileSyncData = z.infer<typeof UpdateMobileSyncDataSchema>;

export type MobileDashboard = z.infer<typeof MobileDashboardSchema>;
export type MobileAnalyticsResponse = z.infer<typeof MobileAnalyticsResponseSchema>; 