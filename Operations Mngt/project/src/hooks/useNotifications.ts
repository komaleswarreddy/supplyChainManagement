import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationApi, notificationTemplateApi, notificationPreferenceApi } from '@/services/api/notifications';
import { useToast } from '@/hooks/useToast';
import type { 
  Notification, 
  CreateNotification, 
  UpdateNotification,
  NotificationTemplate,
  CreateNotificationTemplate,
  UpdateNotificationTemplate,
  NotificationPreference,
  UpdateNotificationPreference
} from '@/services/api/notifications';

// Notification Hooks
export const useNotifications = (params?: {
  search?: string;
  type?: string;
  category?: string;
  priority?: string;
  status?: string;
  recipient_id?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ['notifications', params],
    queryFn: () => notificationApi.getAll(params),
  });
};

export const useNotification = (id: string) => {
  return useQuery({
    queryKey: ['notifications', id],
    queryFn: () => notificationApi.getById(id),
    enabled: !!id,
  });
};

export const useCreateNotification = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: notificationApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Notification created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create notification');
    },
  });
};

export const useUpdateNotification = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateNotification }) => 
      notificationApi.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', data.id] });
      toast.success('Notification updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update notification');
    },
  });
};

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: notificationApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Notification deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete notification');
    },
  });
};

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: notificationApi.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    },
  });
};

export const useMarkMultipleNotificationsAsRead = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: notificationApi.markMultipleAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
      toast.success('Notifications marked as read');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to mark notifications as read');
    },
  });
};

export const useUnreadNotificationCount = () => {
  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: notificationApi.getUnreadCount,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

export const useSendNotification = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: notificationApi.send,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Notification sent successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to send notification');
    },
  });
};

export const useBulkSendNotifications = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: notificationApi.bulkSend,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Notifications sent successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to send notifications');
    },
  });
};

// Notification Templates Hooks
export const useNotificationTemplates = (params?: {
  search?: string;
  type?: string;
  is_active?: boolean;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ['notification-templates', params],
    queryFn: () => notificationTemplateApi.getAll(params),
  });
};

export const useNotificationTemplate = (id: string) => {
  return useQuery({
    queryKey: ['notification-templates', id],
    queryFn: () => notificationTemplateApi.getById(id),
    enabled: !!id,
  });
};

export const useCreateNotificationTemplate = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: notificationTemplateApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-templates'] });
      toast.success('Notification template created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create notification template');
    },
  });
};

export const useUpdateNotificationTemplate = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateNotificationTemplate }) => 
      notificationTemplateApi.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['notification-templates'] });
      queryClient.invalidateQueries({ queryKey: ['notification-templates', data.id] });
      toast.success('Notification template updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update notification template');
    },
  });
};

export const useDeleteNotificationTemplate = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: notificationTemplateApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-templates'] });
      toast.success('Notification template deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete notification template');
    },
  });
};

export const useTestNotificationTemplate = () => {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: ({ id, variables }: { id: string; variables: Record<string, any> }) => 
      notificationTemplateApi.test(id, variables),
    onSuccess: () => {
      toast.success('Test notification sent successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to send test notification');
    },
  });
};

// Notification Preferences Hooks
export const useNotificationPreferences = (userId: string) => {
  return useQuery({
    queryKey: ['notification-preferences', userId],
    queryFn: () => notificationPreferenceApi.getUserPreferences(userId),
    enabled: !!userId,
  });
};

export const useUpdateNotificationPreferences = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: UpdateNotificationPreference[] }) => 
      notificationPreferenceApi.updateUserPreferences(userId, data),
    onSuccess: (data, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences', userId] });
      toast.success('Notification preferences updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update notification preferences');
    },
  });
};

export const useDefaultNotificationPreferences = () => {
  return useQuery({
    queryKey: ['notification-preferences', 'defaults'],
    queryFn: notificationPreferenceApi.getDefaultPreferences,
  });
}; 