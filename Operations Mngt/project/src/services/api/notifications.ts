import { z } from 'zod';
import { apiClient } from '@/lib/api-client';

// Notification Schemas
export const NotificationSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1, 'Title is required'),
  message: z.string().min(1, 'Message is required'),
  type: z.enum(['INFO', 'SUCCESS', 'WARNING', 'ERROR', 'SYSTEM']),
  category: z.enum(['SYSTEM', 'ORDER', 'INVENTORY', 'PROCUREMENT', 'SUPPLIER', 'QUALITY', 'FINANCE', 'USER']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  status: z.enum(['UNREAD', 'READ', 'ARCHIVED']),
  recipient_id: z.string().uuid(),
  recipient_type: z.enum(['USER', 'ROLE', 'TENANT']),
  sender_id: z.string().uuid().optional(),
  sender_name: z.string().optional(),
  related_entity_type: z.string().optional(),
  related_entity_id: z.string().optional(),
  action_url: z.string().url().optional(),
  action_text: z.string().optional(),
  scheduled_at: z.string().datetime().optional(),
  sent_at: z.string().datetime().optional(),
  read_at: z.string().datetime().optional(),
  expires_at: z.string().datetime().optional(),
  metadata: z.record(z.any()).optional(),
  tenant_id: z.string().uuid(),
  created_by: z.string().uuid(),
  updated_by: z.string().uuid(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const CreateNotificationSchema = NotificationSchema.omit({
  id: true,
  sent_at: true,
  read_at: true,
  tenant_id: true,
  created_by: true,
  updated_by: true,
  created_at: true,
  updated_at: true,
});

export const UpdateNotificationSchema = CreateNotificationSchema.partial();

export const NotificationTemplateSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Template name is required'),
  description: z.string().optional(),
  type: z.enum(['EMAIL', 'SMS', 'PUSH', 'IN_APP']),
  subject: z.string().optional(),
  body: z.string().min(1, 'Template body is required'),
  variables: z.array(z.string()).optional(),
  is_active: z.boolean(),
  tenant_id: z.string().uuid(),
  created_by: z.string().uuid(),
  updated_by: z.string().uuid(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const CreateNotificationTemplateSchema = NotificationTemplateSchema.omit({
  id: true,
  tenant_id: true,
  created_by: true,
  updated_by: true,
  created_at: true,
  updated_at: true,
});

export const UpdateNotificationTemplateSchema = CreateNotificationTemplateSchema.partial();

export const NotificationPreferenceSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  category: z.enum(['SYSTEM', 'ORDER', 'INVENTORY', 'PROCUREMENT', 'SUPPLIER', 'QUALITY', 'FINANCE', 'USER']),
  type: z.enum(['EMAIL', 'SMS', 'PUSH', 'IN_APP']),
  is_enabled: z.boolean(),
  frequency: z.enum(['IMMEDIATE', 'DAILY', 'WEEKLY', 'NEVER']),
  quiet_hours_start: z.string().optional(),
  quiet_hours_end: z.string().optional(),
  tenant_id: z.string().uuid(),
  created_by: z.string().uuid(),
  updated_by: z.string().uuid(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const CreateNotificationPreferenceSchema = NotificationPreferenceSchema.omit({
  id: true,
  tenant_id: true,
  created_by: true,
  updated_by: true,
  created_at: true,
  updated_at: true,
});

export const UpdateNotificationPreferenceSchema = CreateNotificationPreferenceSchema.partial();

// Types
export type Notification = z.infer<typeof NotificationSchema>;
export type CreateNotification = z.infer<typeof CreateNotificationSchema>;
export type UpdateNotification = z.infer<typeof UpdateNotificationSchema>;
export type NotificationTemplate = z.infer<typeof NotificationTemplateSchema>;
export type CreateNotificationTemplate = z.infer<typeof CreateNotificationTemplateSchema>;
export type UpdateNotificationTemplate = z.infer<typeof UpdateNotificationTemplateSchema>;
export type NotificationPreference = z.infer<typeof NotificationPreferenceSchema>;
export type CreateNotificationPreference = z.infer<typeof CreateNotificationPreferenceSchema>;
export type UpdateNotificationPreference = z.infer<typeof UpdateNotificationPreferenceSchema>;

// API endpoints
const NOTIFICATIONS_API_BASE = '/api/notifications';

// Notifications API
export const notificationApi = {
  // Get all notifications
  getAll: async (params?: {
    search?: string;
    type?: string;
    category?: string;
    priority?: string;
    status?: string;
    recipient_id?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await apiClient.get(`${NOTIFICATIONS_API_BASE}`, { params });
    return response.data;
  },

  // Get notification by ID
  getById: async (id: string) => {
    const response = await apiClient.get(`${NOTIFICATIONS_API_BASE}/${id}`);
    return NotificationSchema.parse(response.data);
  },

  // Create new notification
  create: async (data: CreateNotification) => {
    const validatedData = CreateNotificationSchema.parse(data);
    const response = await apiClient.post(`${NOTIFICATIONS_API_BASE}`, validatedData);
    return NotificationSchema.parse(response.data);
  },

  // Update notification
  update: async (id: string, data: UpdateNotification) => {
    const validatedData = UpdateNotificationSchema.parse(data);
    const response = await apiClient.put(`${NOTIFICATIONS_API_BASE}/${id}`, validatedData);
    return NotificationSchema.parse(response.data);
  },

  // Delete notification
  delete: async (id: string) => {
    await apiClient.delete(`${NOTIFICATIONS_API_BASE}/${id}`);
  },

  // Mark notification as read
  markAsRead: async (id: string) => {
    const response = await apiClient.post(`${NOTIFICATIONS_API_BASE}/${id}/read`);
    return NotificationSchema.parse(response.data);
  },

  // Mark multiple notifications as read
  markMultipleAsRead: async (ids: string[]) => {
    const response = await apiClient.post(`${NOTIFICATIONS_API_BASE}/mark-read`, { ids });
    return response.data;
  },

  // Get unread count
  getUnreadCount: async () => {
    const response = await apiClient.get(`${NOTIFICATIONS_API_BASE}/unread-count`);
    return response.data;
  },

  // Send notification
  send: async (data: CreateNotification) => {
    const validatedData = CreateNotificationSchema.parse(data);
    const response = await apiClient.post(`${NOTIFICATIONS_API_BASE}/send`, validatedData);
    return NotificationSchema.parse(response.data);
  },

  // Bulk send notifications
  bulkSend: async (data: CreateNotification[]) => {
    const validatedData = z.array(CreateNotificationSchema).parse(data);
    const response = await apiClient.post(`${NOTIFICATIONS_API_BASE}/bulk-send`, validatedData);
    return response.data;
  },
};

// Notification Templates API
export const notificationTemplateApi = {
  // Get all templates
  getAll: async (params?: {
    search?: string;
    type?: string;
    is_active?: boolean;
    page?: number;
    limit?: number;
  }) => {
    const response = await apiClient.get(`${NOTIFICATIONS_API_BASE}/templates`, { params });
    return response.data;
  },

  // Get template by ID
  getById: async (id: string) => {
    const response = await apiClient.get(`${NOTIFICATIONS_API_BASE}/templates/${id}`);
    return NotificationTemplateSchema.parse(response.data);
  },

  // Create new template
  create: async (data: CreateNotificationTemplate) => {
    const validatedData = CreateNotificationTemplateSchema.parse(data);
    const response = await apiClient.post(`${NOTIFICATIONS_API_BASE}/templates`, validatedData);
    return NotificationTemplateSchema.parse(response.data);
  },

  // Update template
  update: async (id: string, data: UpdateNotificationTemplate) => {
    const validatedData = UpdateNotificationTemplateSchema.parse(data);
    const response = await apiClient.put(`${NOTIFICATIONS_API_BASE}/templates/${id}`, validatedData);
    return NotificationTemplateSchema.parse(response.data);
  },

  // Delete template
  delete: async (id: string) => {
    await apiClient.delete(`${NOTIFICATIONS_API_BASE}/templates/${id}`);
  },

  // Test template
  test: async (id: string, variables: Record<string, any>) => {
    const response = await apiClient.post(`${NOTIFICATIONS_API_BASE}/templates/${id}/test`, { variables });
    return response.data;
  },
};

// Notification Preferences API
export const notificationPreferenceApi = {
  // Get user preferences
  getUserPreferences: async (userId: string) => {
    const response = await apiClient.get(`${NOTIFICATIONS_API_BASE}/preferences/${userId}`);
    return response.data;
  },

  // Update user preferences
  updateUserPreferences: async (userId: string, data: UpdateNotificationPreference[]) => {
    const validatedData = z.array(UpdateNotificationPreferenceSchema).parse(data);
    const response = await apiClient.put(`${NOTIFICATIONS_API_BASE}/preferences/${userId}`, validatedData);
    return response.data;
  },

  // Get default preferences
  getDefaultPreferences: async () => {
    const response = await apiClient.get(`${NOTIFICATIONS_API_BASE}/preferences/defaults`);
    return response.data;
  },
}; 