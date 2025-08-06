import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mobileAPI } from '@/services/api/mobile';
import type {
  MobileDevice,
  MobileSession,
  MobileNotification,
  MobileConfiguration,
  MobileAnalytics,
  MobileAppVersion,
  MobilePermission,
  MobileSyncData,
  CreateMobileDeviceRequest,
  UpdateMobileDeviceRequest,
  CreateMobileSessionRequest,
  UpdateMobileSessionRequest,
  CreateMobileNotificationRequest,
  UpdateMobileNotificationRequest,
  CreateMobileConfigurationRequest,
  UpdateMobileConfigurationRequest,
  CreateMobileAnalyticsRequest,
  UpdateMobileAnalyticsRequest,
  CreateMobileAppVersionRequest,
  UpdateMobileAppVersionRequest,
  CreateMobilePermissionRequest,
  UpdateMobilePermissionRequest,
  CreateMobileSyncDataRequest,
  UpdateMobileSyncDataRequest,
  MobileDashboardResponse,
  MobileLogsResponse,
  MobileMetricsResponse,
  MobileReportsResponse,
} from '@/types/mobile';

// Mobile Device Hooks
export const useMobileDevices = (tenantId: string) => {
  return useQuery({
    queryKey: ['mobile-devices', tenantId],
    queryFn: () => mobileAPI.getMobileDevices(tenantId),
  });
};

export const useMobileDevice = (id: string) => {
  return useQuery({
    queryKey: ['mobile-device', id],
    queryFn: () => mobileAPI.getMobileDevice(id),
    enabled: !!id,
  });
};

export const useCreateMobileDevice = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateMobileDeviceRequest) => mobileAPI.createMobileDevice(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['mobile-devices'] });
      queryClient.setQueryData(['mobile-device', data.id], data);
    },
  });
};

export const useUpdateMobileDevice = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMobileDeviceRequest }) =>
      mobileAPI.updateMobileDevice(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['mobile-devices'] });
      queryClient.setQueryData(['mobile-device', data.id], data);
    },
  });
};

export const useDeleteMobileDevice = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => mobileAPI.deleteMobileDevice(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['mobile-devices'] });
      queryClient.removeQueries({ queryKey: ['mobile-device', id] });
    },
  });
};

// Mobile Session Hooks
export const useMobileSessions = (tenantId: string) => {
  return useQuery({
    queryKey: ['mobile-sessions', tenantId],
    queryFn: () => mobileAPI.getMobileSessions(tenantId),
  });
};

export const useMobileSession = (id: string) => {
  return useQuery({
    queryKey: ['mobile-session', id],
    queryFn: () => mobileAPI.getMobileSession(id),
    enabled: !!id,
  });
};

export const useCreateMobileSession = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateMobileSessionRequest) => mobileAPI.createMobileSession(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['mobile-sessions'] });
      queryClient.setQueryData(['mobile-session', data.id], data);
    },
  });
};

export const useUpdateMobileSession = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMobileSessionRequest }) =>
      mobileAPI.updateMobileSession(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['mobile-sessions'] });
      queryClient.setQueryData(['mobile-session', data.id], data);
    },
  });
};

export const useDeleteMobileSession = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => mobileAPI.deleteMobileSession(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['mobile-sessions'] });
      queryClient.removeQueries({ queryKey: ['mobile-session', id] });
    },
  });
};

// Mobile Notification Hooks
export const useMobileNotifications = (tenantId: string) => {
  return useQuery({
    queryKey: ['mobile-notifications', tenantId],
    queryFn: () => mobileAPI.getMobileNotifications(tenantId),
  });
};

export const useMobileNotification = (id: string) => {
  return useQuery({
    queryKey: ['mobile-notification', id],
    queryFn: () => mobileAPI.getMobileNotification(id),
    enabled: !!id,
  });
};

export const useCreateMobileNotification = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateMobileNotificationRequest) => mobileAPI.createMobileNotification(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['mobile-notifications'] });
      queryClient.setQueryData(['mobile-notification', data.id], data);
    },
  });
};

export const useUpdateMobileNotification = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMobileNotificationRequest }) =>
      mobileAPI.updateMobileNotification(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['mobile-notifications'] });
      queryClient.setQueryData(['mobile-notification', data.id], data);
    },
  });
};

export const useDeleteMobileNotification = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => mobileAPI.deleteMobileNotification(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['mobile-notifications'] });
      queryClient.removeQueries({ queryKey: ['mobile-notification', id] });
    },
  });
};

// Mobile Configuration Hooks
export const useMobileConfigurations = (tenantId: string) => {
  return useQuery({
    queryKey: ['mobile-configurations', tenantId],
    queryFn: () => mobileAPI.getMobileConfigurations(tenantId),
  });
};

export const useMobileConfiguration = (id: string) => {
  return useQuery({
    queryKey: ['mobile-configuration', id],
    queryFn: () => mobileAPI.getMobileConfiguration(id),
    enabled: !!id,
  });
};

export const useCreateMobileConfiguration = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateMobileConfigurationRequest) => mobileAPI.createMobileConfiguration(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['mobile-configurations'] });
      queryClient.setQueryData(['mobile-configuration', data.id], data);
    },
  });
};

export const useUpdateMobileConfiguration = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMobileConfigurationRequest }) =>
      mobileAPI.updateMobileConfiguration(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['mobile-configurations'] });
      queryClient.setQueryData(['mobile-configuration', data.id], data);
    },
  });
};

export const useDeleteMobileConfiguration = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => mobileAPI.deleteMobileConfiguration(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['mobile-configurations'] });
      queryClient.removeQueries({ queryKey: ['mobile-configuration', id] });
    },
  });
};

// Mobile Analytics Hooks
export const useMobileAnalytics = (tenantId: string) => {
  return useQuery({
    queryKey: ['mobile-analytics', tenantId],
    queryFn: () => mobileAPI.getMobileAnalytics(tenantId),
  });
};

export const useMobileAnalyticsEntry = (id: string) => {
  return useQuery({
    queryKey: ['mobile-analytics-entry', id],
    queryFn: () => mobileAPI.getMobileAnalyticsEntry(id),
    enabled: !!id,
  });
};

export const useCreateMobileAnalytics = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateMobileAnalyticsRequest) => mobileAPI.createMobileAnalytics(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['mobile-analytics'] });
      queryClient.setQueryData(['mobile-analytics-entry', data.id], data);
    },
  });
};

export const useUpdateMobileAnalytics = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMobileAnalyticsRequest }) =>
      mobileAPI.updateMobileAnalytics(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['mobile-analytics'] });
      queryClient.setQueryData(['mobile-analytics-entry', data.id], data);
    },
  });
};

export const useDeleteMobileAnalytics = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => mobileAPI.deleteMobileAnalytics(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['mobile-analytics'] });
      queryClient.removeQueries({ queryKey: ['mobile-analytics-entry', id] });
    },
  });
};

// Mobile App Version Hooks
export const useMobileAppVersions = (tenantId: string) => {
  return useQuery({
    queryKey: ['mobile-app-versions', tenantId],
    queryFn: () => mobileAPI.getMobileAppVersions(tenantId),
  });
};

export const useMobileAppVersion = (id: string) => {
  return useQuery({
    queryKey: ['mobile-app-version', id],
    queryFn: () => mobileAPI.getMobileAppVersion(id),
    enabled: !!id,
  });
};

export const useCreateMobileAppVersion = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateMobileAppVersionRequest) => mobileAPI.createMobileAppVersion(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['mobile-app-versions'] });
      queryClient.setQueryData(['mobile-app-version', data.id], data);
    },
  });
};

export const useUpdateMobileAppVersion = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMobileAppVersionRequest }) =>
      mobileAPI.updateMobileAppVersion(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['mobile-app-versions'] });
      queryClient.setQueryData(['mobile-app-version', data.id], data);
    },
  });
};

export const useDeleteMobileAppVersion = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => mobileAPI.deleteMobileAppVersion(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['mobile-app-versions'] });
      queryClient.removeQueries({ queryKey: ['mobile-app-version', id] });
    },
  });
};

// Mobile Permission Hooks
export const useMobilePermissions = (tenantId: string) => {
  return useQuery({
    queryKey: ['mobile-permissions', tenantId],
    queryFn: () => mobileAPI.getMobilePermissions(tenantId),
  });
};

export const useMobilePermission = (id: string) => {
  return useQuery({
    queryKey: ['mobile-permission', id],
    queryFn: () => mobileAPI.getMobilePermission(id),
    enabled: !!id,
  });
};

export const useCreateMobilePermission = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateMobilePermissionRequest) => mobileAPI.createMobilePermission(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['mobile-permissions'] });
      queryClient.setQueryData(['mobile-permission', data.id], data);
    },
  });
};

export const useUpdateMobilePermission = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMobilePermissionRequest }) =>
      mobileAPI.updateMobilePermission(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['mobile-permissions'] });
      queryClient.setQueryData(['mobile-permission', data.id], data);
    },
  });
};

export const useDeleteMobilePermission = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => mobileAPI.deleteMobilePermission(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['mobile-permissions'] });
      queryClient.removeQueries({ queryKey: ['mobile-permission', id] });
    },
  });
};

// Mobile Sync Data Hooks
export const useMobileSyncData = (tenantId: string) => {
  return useQuery({
    queryKey: ['mobile-sync-data', tenantId],
    queryFn: () => mobileAPI.getMobileSyncData(tenantId),
  });
};

export const useMobileSyncDataEntry = (id: string) => {
  return useQuery({
    queryKey: ['mobile-sync-data-entry', id],
    queryFn: () => mobileAPI.getMobileSyncDataEntry(id),
    enabled: !!id,
  });
};

export const useCreateMobileSyncData = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateMobileSyncDataRequest) => mobileAPI.createMobileSyncData(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['mobile-sync-data'] });
      queryClient.setQueryData(['mobile-sync-data-entry', data.id], data);
    },
  });
};

export const useUpdateMobileSyncData = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMobileSyncDataRequest }) =>
      mobileAPI.updateMobileSyncData(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['mobile-sync-data'] });
      queryClient.setQueryData(['mobile-sync-data-entry', data.id], data);
    },
  });
};

export const useDeleteMobileSyncData = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => mobileAPI.deleteMobileSyncData(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['mobile-sync-data'] });
      queryClient.removeQueries({ queryKey: ['mobile-sync-data-entry', id] });
    },
  });
};

// Mobile Analytics Dashboard Hooks
export const useMobileDashboard = (tenantId: string) => {
  return useQuery({
    queryKey: ['mobile-dashboard', tenantId],
    queryFn: () => mobileAPI.getMobileDashboard(tenantId),
  });
};

export const useMobileLogs = (tenantId: string) => {
  return useQuery({
    queryKey: ['mobile-logs', tenantId],
    queryFn: () => mobileAPI.getMobileLogs(tenantId),
  });
};

export const useMobileMetrics = (tenantId: string) => {
  return useQuery({
    queryKey: ['mobile-metrics', tenantId],
    queryFn: () => mobileAPI.getMobileMetrics(tenantId),
  });
};

export const useMobileReports = (tenantId: string) => {
  return useQuery({
    queryKey: ['mobile-reports', tenantId],
    queryFn: () => mobileAPI.getMobileReports(tenantId),
  });
}; 