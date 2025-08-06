import { z } from 'zod';
import { apiClient } from '@/lib/api-client';

// Zod Schemas
export const MobileDeviceSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  deviceNumber: z.string(),
  userId: z.string().uuid(),
  deviceId: z.string(),
  deviceType: z.enum(['IOS', 'ANDROID', 'WEB']),
  deviceModel: z.string().optional(),
  deviceManufacturer: z.string().optional(),
  osVersion: z.string().optional(),
  appVersion: z.string().optional(),
  pushToken: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'BLOCKED']),
  lastSeen: z.string().datetime().optional(),
  registrationDate: z.string().datetime(),
  capabilities: z.record(z.any()).optional(),
  settings: z.record(z.any()).optional(),
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
  sessionToken: z.string(),
  status: z.enum(['ACTIVE', 'EXPIRED', 'TERMINATED']),
  startTime: z.string().datetime(),
  endTime: z.string().datetime().optional(),
  duration: z.number().optional(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  location: z.record(z.any()).optional(),
  deviceInfo: z.record(z.any()).optional(),
  appVersion: z.string().optional(),
  metadata: z.record(z.any()).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const MobileNotificationSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  notificationNumber: z.string(),
  deviceId: z.string().uuid(),
  userId: z.string().uuid(),
  title: z.string(),
  body: z.string(),
  type: z.enum(['PUSH', 'IN_APP', 'SMS', 'EMAIL']),
  category: z.enum(['ORDER_UPDATE', 'INVENTORY_ALERT', 'SYSTEM', 'PROMOTION']),
  status: z.enum(['PENDING', 'SENT', 'DELIVERED', 'READ', 'FAILED']),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']),
  scheduledFor: z.string().datetime().optional(),
  sentAt: z.string().datetime().optional(),
  deliveredAt: z.string().datetime().optional(),
  readAt: z.string().datetime().optional(),
  actionUrl: z.string().optional(),
  actionData: z.record(z.any()).optional(),
  badge: z.number().optional(),
  sound: z.string().optional(),
  imageUrl: z.string().optional(),
  metadata: z.record(z.any()).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  createdBy: z.string().uuid(),
  updatedBy: z.string().uuid().optional(),
});

export const MobileConfigurationSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  configNumber: z.string(),
  name: z.string(),
  description: z.string().optional(),
  type: z.enum(['APP_CONFIG', 'FEATURE_FLAG', 'UI_CONFIG', 'API_CONFIG']),
  platform: z.enum(['IOS', 'ANDROID', 'WEB', 'ALL']).optional(),
  version: z.string(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'DEPRECATED']),
  configuration: z.record(z.any()),
  conditions: z.record(z.any()).optional(),
  rollout: z.record(z.any()).optional(),
  metadata: z.record(z.any()).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  createdBy: z.string().uuid(),
  updatedBy: z.string().uuid().optional(),
});

export const MobileAnalyticsSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  deviceId: z.string().uuid(),
  userId: z.string().uuid(),
  eventType: z.enum(['APP_OPEN', 'FEATURE_USE', 'ERROR', 'PERFORMANCE']),
  eventName: z.string(),
  timestamp: z.string().datetime(),
  sessionId: z.string().uuid().optional(),
  properties: z.record(z.any()).optional(),
  metrics: z.record(z.any()).optional(),
  context: z.record(z.any()).optional(),
  metadata: z.record(z.any()).optional(),
  createdAt: z.string().datetime(),
});

export const MobileAppVersionSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  versionNumber: z.string(),
  platform: z.enum(['IOS', 'ANDROID', 'WEB']),
  buildNumber: z.string(),
  status: z.enum(['DRAFT', 'TESTING', 'RELEASED', 'DEPRECATED']),
  releaseDate: z.string().datetime().optional(),
  minSupportedVersion: z.string().optional(),
  forceUpdate: z.boolean(),
  changelog: z.string().optional(),
  downloadUrl: z.string().optional(),
  fileSize: z.number().optional(),
  checksum: z.string().optional(),
  features: z.record(z.any()).optional(),
  bugFixes: z.record(z.any()).optional(),
  knownIssues: z.record(z.any()).optional(),
  metadata: z.record(z.any()).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  createdBy: z.string().uuid(),
  updatedBy: z.string().uuid().optional(),
});

export const MobilePermissionSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  deviceId: z.string().uuid(),
  userId: z.string().uuid(),
  permission: z.enum(['LOCATION', 'CAMERA', 'NOTIFICATIONS', 'STORAGE', 'CONTACTS']),
  status: z.enum(['GRANTED', 'DENIED', 'PROMPT']),
  grantedAt: z.string().datetime().optional(),
  revokedAt: z.string().datetime().optional(),
  metadata: z.record(z.any()).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const MobileSyncDataSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  deviceId: z.string().uuid(),
  userId: z.string().uuid(),
  syncNumber: z.string(),
  entityType: z.enum(['ORDERS', 'INVENTORY', 'CUSTOMERS', 'PRODUCTS']),
  entityId: z.string(),
  action: z.enum(['CREATE', 'UPDATE', 'DELETE', 'SYNC']),
  status: z.enum(['PENDING', 'SYNCED', 'FAILED', 'CONFLICT']),
  data: z.record(z.any()).optional(),
  conflictResolution: z.record(z.any()).optional(),
  syncTimestamp: z.string().datetime(),
  lastSyncAttempt: z.string().datetime().optional(),
  retryCount: z.number().optional(),
  errorMessage: z.string().optional(),
  metadata: z.record(z.any()).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// Create/Update Schemas
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
});

export const UpdateMobilePermissionSchema = CreateMobilePermissionSchema.partial();

export const CreateMobileSyncDataSchema = MobileSyncDataSchema.omit({
  id: true,
  tenantId: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateMobileSyncDataSchema = CreateMobileSyncDataSchema.partial();

// Types
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
export type CreateMobileAppVersion = z.infer<typeof CreateMobileAppVersionSchema>;
export type UpdateMobileAppVersion = z.infer<typeof UpdateMobileAppVersionSchema>;
export type CreateMobilePermission = z.infer<typeof CreateMobilePermissionSchema>;
export type UpdateMobilePermission = z.infer<typeof UpdateMobilePermissionSchema>;
export type CreateMobileSyncData = z.infer<typeof CreateMobileSyncDataSchema>;
export type UpdateMobileSyncData = z.infer<typeof UpdateMobileSyncDataSchema>;

// API Client Functions
export const mobileAPI = {
  // Devices
  getDevices: async (params?: { page?: number; limit?: number; search?: string; status?: string; deviceType?: string }) => {
    const response = await apiClient.get('/api/mobile/devices', { params });
    return z.array(MobileDeviceSchema).parse(response.data);
  },

  getDeviceById: async (id: string) => {
    const response = await apiClient.get(`/api/mobile/devices/${id}`);
    return MobileDeviceSchema.parse(response.data);
  },

  createDevice: async (data: CreateMobileDevice) => {
    const response = await apiClient.post('/api/mobile/devices', data);
    return MobileDeviceSchema.parse(response.data);
  },

  updateDevice: async (id: string, data: UpdateMobileDevice) => {
    const response = await apiClient.put(`/api/mobile/devices/${id}`, data);
    return MobileDeviceSchema.parse(response.data);
  },

  deleteDevice: async (id: string) => {
    await apiClient.delete(`/api/mobile/devices/${id}`);
  },

  registerDevice: async (data: CreateMobileDevice) => {
    const response = await apiClient.post('/api/mobile/devices/register', data);
    return MobileDeviceSchema.parse(response.data);
  },

  updatePushToken: async (deviceId: string, pushToken: string) => {
    const response = await apiClient.put(`/api/mobile/devices/${deviceId}/push-token`, { pushToken });
    return MobileDeviceSchema.parse(response.data);
  },

  // Sessions
  getSessions: async (params?: { deviceId?: string; userId?: string; status?: string; page?: number; limit?: number }) => {
    const response = await apiClient.get('/api/mobile/sessions', { params });
    return z.array(MobileSessionSchema).parse(response.data);
  },

  getSessionById: async (id: string) => {
    const response = await apiClient.get(`/api/mobile/sessions/${id}`);
    return MobileSessionSchema.parse(response.data);
  },

  createSession: async (data: CreateMobileSession) => {
    const response = await apiClient.post('/api/mobile/sessions', data);
    return MobileSessionSchema.parse(response.data);
  },

  updateSession: async (id: string, data: UpdateMobileSession) => {
    const response = await apiClient.put(`/api/mobile/sessions/${id}`, data);
    return MobileSessionSchema.parse(response.data);
  },

  endSession: async (id: string) => {
    const response = await apiClient.post(`/api/mobile/sessions/${id}/end`);
    return MobileSessionSchema.parse(response.data);
  },

  // Notifications
  getNotifications: async (params?: { deviceId?: string; userId?: string; status?: string; type?: string; page?: number; limit?: number }) => {
    const response = await apiClient.get('/api/mobile/notifications', { params });
    return z.array(MobileNotificationSchema).parse(response.data);
  },

  getNotificationById: async (id: string) => {
    const response = await apiClient.get(`/api/mobile/notifications/${id}`);
    return MobileNotificationSchema.parse(response.data);
  },

  createNotification: async (data: CreateMobileNotification) => {
    const response = await apiClient.post('/api/mobile/notifications', data);
    return MobileNotificationSchema.parse(response.data);
  },

  updateNotification: async (id: string, data: UpdateMobileNotification) => {
    const response = await apiClient.put(`/api/mobile/notifications/${id}`, data);
    return MobileNotificationSchema.parse(response.data);
  },

  deleteNotification: async (id: string) => {
    await apiClient.delete(`/api/mobile/notifications/${id}`);
  },

  sendNotification: async (data: CreateMobileNotification) => {
    const response = await apiClient.post('/api/mobile/notifications/send', data);
    return MobileNotificationSchema.parse(response.data);
  },

  markAsRead: async (id: string) => {
    const response = await apiClient.post(`/api/mobile/notifications/${id}/read`);
    return MobileNotificationSchema.parse(response.data);
  },

  // Configurations
  getConfigurations: async (params?: { platform?: string; type?: string; status?: string; page?: number; limit?: number }) => {
    const response = await apiClient.get('/api/mobile/configurations', { params });
    return z.array(MobileConfigurationSchema).parse(response.data);
  },

  getConfigurationById: async (id: string) => {
    const response = await apiClient.get(`/api/mobile/configurations/${id}`);
    return MobileConfigurationSchema.parse(response.data);
  },

  createConfiguration: async (data: CreateMobileConfiguration) => {
    const response = await apiClient.post('/api/mobile/configurations', data);
    return MobileConfigurationSchema.parse(response.data);
  },

  updateConfiguration: async (id: string, data: UpdateMobileConfiguration) => {
    const response = await apiClient.put(`/api/mobile/configurations/${id}`, data);
    return MobileConfigurationSchema.parse(response.data);
  },

  deleteConfiguration: async (id: string) => {
    await apiClient.delete(`/api/mobile/configurations/${id}`);
  },

  // App Versions
  getAppVersions: async (params?: { platform?: string; status?: string; page?: number; limit?: number }) => {
    const response = await apiClient.get('/api/mobile/app-versions', { params });
    return z.array(MobileAppVersionSchema).parse(response.data);
  },

  getAppVersionById: async (id: string) => {
    const response = await apiClient.get(`/api/mobile/app-versions/${id}`);
    return MobileAppVersionSchema.parse(response.data);
  },

  createAppVersion: async (data: CreateMobileAppVersion) => {
    const response = await apiClient.post('/api/mobile/app-versions', data);
    return MobileAppVersionSchema.parse(response.data);
  },

  updateAppVersion: async (id: string, data: UpdateMobileAppVersion) => {
    const response = await apiClient.put(`/api/mobile/app-versions/${id}`, data);
    return MobileAppVersionSchema.parse(response.data);
  },

  deleteAppVersion: async (id: string) => {
    await apiClient.delete(`/api/mobile/app-versions/${id}`);
  },

  checkForUpdates: async (platform: string, currentVersion: string) => {
    const response = await apiClient.get('/api/mobile/app-versions/check-updates', { 
      params: { platform, currentVersion } 
    });
    return z.record(z.any()).parse(response.data);
  },

  // Permissions
  getPermissions: async (deviceId: string) => {
    const response = await apiClient.get(`/api/mobile/devices/${deviceId}/permissions`);
    return z.array(MobilePermissionSchema).parse(response.data);
  },

  updatePermission: async (deviceId: string, permission: string, data: UpdateMobilePermission) => {
    const response = await apiClient.put(`/api/mobile/devices/${deviceId}/permissions/${permission}`, data);
    return MobilePermissionSchema.parse(response.data);
  },

  // Sync Data
  getSyncData: async (params?: { deviceId?: string; entityType?: string; status?: string; page?: number; limit?: number }) => {
    const response = await apiClient.get('/api/mobile/sync-data', { params });
    return z.array(MobileSyncDataSchema).parse(response.data);
  },

  createSyncData: async (data: CreateMobileSyncData) => {
    const response = await apiClient.post('/api/mobile/sync-data', data);
    return MobileSyncDataSchema.parse(response.data);
  },

  updateSyncData: async (id: string, data: UpdateMobileSyncData) => {
    const response = await apiClient.put(`/api/mobile/sync-data/${id}`, data);
    return MobileSyncDataSchema.parse(response.data);
  },

  syncData: async (deviceId: string, syncData: CreateMobileSyncData[]) => {
    const response = await apiClient.post(`/api/mobile/devices/${deviceId}/sync`, { syncData });
    return z.array(MobileSyncDataSchema).parse(response.data);
  },
};

export const mobileAnalyticsAPI = {
  getDashboard: async (params?: { startDate?: string; endDate?: string; deviceId?: string }) => {
    const response = await apiClient.get('/api/mobile/analytics/dashboard', { params });
    return z.record(z.any()).parse(response.data);
  },

  getAnalytics: async (params?: { deviceId?: string; userId?: string; eventType?: string; startDate?: string; endDate?: string; page?: number; limit?: number }) => {
    const response = await apiClient.get('/api/mobile/analytics/events', { params });
    return z.array(MobileAnalyticsSchema).parse(response.data);
  },

  trackEvent: async (data: Omit<CreateMobileSyncData, 'syncNumber' | 'entityType' | 'entityId' | 'action' | 'status' | 'syncTimestamp' | 'lastSyncAttempt' | 'retryCount' | 'errorMessage'>) => {
    const response = await apiClient.post('/api/mobile/analytics/track', data);
    return MobileAnalyticsSchema.parse(response.data);
  },

  getMetrics: async (params?: { startDate?: string; endDate?: string; groupBy?: string }) => {
    const response = await apiClient.get('/api/mobile/analytics/metrics', { params });
    return z.record(z.any()).parse(response.data);
  },

  getReports: async (params?: { startDate?: string; endDate?: string; type?: string }) => {
    const response = await apiClient.get('/api/mobile/analytics/reports', { params });
    return z.record(z.any()).parse(response.data);
  },
}; 