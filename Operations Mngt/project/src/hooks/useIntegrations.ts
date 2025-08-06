import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  integrationAPI, 
  integrationAnalyticsAPI,
  type Integration, 
  type CreateIntegration, 
  type UpdateIntegration,
  type ApiEndpoint,
  type CreateApiEndpoint,
  type UpdateApiEndpoint,
  type ApiKey,
  type CreateApiKey,
  type UpdateApiKey,
  type WebhookSubscription,
  type CreateWebhookSubscription,
  type UpdateWebhookSubscription,
  type DataMapping,
  type CreateDataMapping,
  type UpdateDataMapping,
  type IntegrationTemplate,
  type CreateIntegrationTemplate,
  type UpdateIntegrationTemplate
} from '@/services/api/integrations';

// Integration Hooks
export const useIntegrations = (params?: { page?: number; limit?: number; search?: string; status?: string; type?: string; category?: string }) => {
  return useQuery({
    queryKey: ['integrations', params],
    queryFn: () => integrationAPI.getAll(params),
  });
};

export const useIntegration = (id: string) => {
  return useQuery({
    queryKey: ['integrations', id],
    queryFn: () => integrationAPI.getById(id),
    enabled: !!id,
  });
};

export const useCreateIntegration = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateIntegration) => integrationAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
    },
  });
};

export const useUpdateIntegration = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateIntegration }) => 
      integrationAPI.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      queryClient.invalidateQueries({ queryKey: ['integrations', id] });
    },
  });
};

export const useDeleteIntegration = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => integrationAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
    },
  });
};

export const useTestIntegrationConnection = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => integrationAPI.testConnection(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['integrations', id] });
    },
  });
};

// API Endpoints Hooks
export const useApiEndpoints = (integrationId: string) => {
  return useQuery({
    queryKey: ['integrations', integrationId, 'endpoints'],
    queryFn: () => integrationAPI.getEndpoints(integrationId),
    enabled: !!integrationId,
  });
};

export const useApiEndpoint = (integrationId: string, endpointId: string) => {
  return useQuery({
    queryKey: ['integrations', integrationId, 'endpoints', endpointId],
    queryFn: () => integrationAPI.getEndpointById(integrationId, endpointId),
    enabled: !!integrationId && !!endpointId,
  });
};

export const useCreateApiEndpoint = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ integrationId, data }: { integrationId: string; data: CreateApiEndpoint }) => 
      integrationAPI.createEndpoint(integrationId, data),
    onSuccess: (_, { integrationId }) => {
      queryClient.invalidateQueries({ queryKey: ['integrations', integrationId, 'endpoints'] });
    },
  });
};

export const useUpdateApiEndpoint = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      integrationId, 
      endpointId, 
      data 
    }: { 
      integrationId: string; 
      endpointId: string; 
      data: UpdateApiEndpoint 
    }) => integrationAPI.updateEndpoint(integrationId, endpointId, data),
    onSuccess: (_, { integrationId, endpointId }) => {
      queryClient.invalidateQueries({ queryKey: ['integrations', integrationId, 'endpoints'] });
      queryClient.invalidateQueries({ queryKey: ['integrations', integrationId, 'endpoints', endpointId] });
    },
  });
};

export const useDeleteApiEndpoint = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ integrationId, endpointId }: { integrationId: string; endpointId: string }) => 
      integrationAPI.deleteEndpoint(integrationId, endpointId),
    onSuccess: (_, { integrationId }) => {
      queryClient.invalidateQueries({ queryKey: ['integrations', integrationId, 'endpoints'] });
    },
  });
};

// API Keys Hooks
export const useApiKeys = (integrationId: string) => {
  return useQuery({
    queryKey: ['integrations', integrationId, 'keys'],
    queryFn: () => integrationAPI.getKeys(integrationId),
    enabled: !!integrationId,
  });
};

export const useApiKey = (integrationId: string, keyId: string) => {
  return useQuery({
    queryKey: ['integrations', integrationId, 'keys', keyId],
    queryFn: () => integrationAPI.getKeyById(integrationId, keyId),
    enabled: !!integrationId && !!keyId,
  });
};

export const useCreateApiKey = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ integrationId, data }: { integrationId: string; data: CreateApiKey }) => 
      integrationAPI.createKey(integrationId, data),
    onSuccess: (_, { integrationId }) => {
      queryClient.invalidateQueries({ queryKey: ['integrations', integrationId, 'keys'] });
    },
  });
};

export const useUpdateApiKey = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      integrationId, 
      keyId, 
      data 
    }: { 
      integrationId: string; 
      keyId: string; 
      data: UpdateApiKey 
    }) => integrationAPI.updateKey(integrationId, keyId, data),
    onSuccess: (_, { integrationId, keyId }) => {
      queryClient.invalidateQueries({ queryKey: ['integrations', integrationId, 'keys'] });
      queryClient.invalidateQueries({ queryKey: ['integrations', integrationId, 'keys', keyId] });
    },
  });
};

export const useDeleteApiKey = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ integrationId, keyId }: { integrationId: string; keyId: string }) => 
      integrationAPI.deleteKey(integrationId, keyId),
    onSuccess: (_, { integrationId }) => {
      queryClient.invalidateQueries({ queryKey: ['integrations', integrationId, 'keys'] });
    },
  });
};

export const useRevokeApiKey = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ integrationId, keyId }: { integrationId: string; keyId: string }) => 
      integrationAPI.revokeKey(integrationId, keyId),
    onSuccess: (_, { integrationId, keyId }) => {
      queryClient.invalidateQueries({ queryKey: ['integrations', integrationId, 'keys'] });
      queryClient.invalidateQueries({ queryKey: ['integrations', integrationId, 'keys', keyId] });
    },
  });
};

// Webhook Subscriptions Hooks
export const useWebhooks = (integrationId: string) => {
  return useQuery({
    queryKey: ['integrations', integrationId, 'webhooks'],
    queryFn: () => integrationAPI.getWebhooks(integrationId),
    enabled: !!integrationId,
  });
};

export const useWebhook = (integrationId: string, webhookId: string) => {
  return useQuery({
    queryKey: ['integrations', integrationId, 'webhooks', webhookId],
    queryFn: () => integrationAPI.getWebhookById(integrationId, webhookId),
    enabled: !!integrationId && !!webhookId,
  });
};

export const useCreateWebhook = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ integrationId, data }: { integrationId: string; data: CreateWebhookSubscription }) => 
      integrationAPI.createWebhook(integrationId, data),
    onSuccess: (_, { integrationId }) => {
      queryClient.invalidateQueries({ queryKey: ['integrations', integrationId, 'webhooks'] });
    },
  });
};

export const useUpdateWebhook = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      integrationId, 
      webhookId, 
      data 
    }: { 
      integrationId: string; 
      webhookId: string; 
      data: UpdateWebhookSubscription 
    }) => integrationAPI.updateWebhook(integrationId, webhookId, data),
    onSuccess: (_, { integrationId, webhookId }) => {
      queryClient.invalidateQueries({ queryKey: ['integrations', integrationId, 'webhooks'] });
      queryClient.invalidateQueries({ queryKey: ['integrations', integrationId, 'webhooks', webhookId] });
    },
  });
};

export const useDeleteWebhook = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ integrationId, webhookId }: { integrationId: string; webhookId: string }) => 
      integrationAPI.deleteWebhook(integrationId, webhookId),
    onSuccess: (_, { integrationId }) => {
      queryClient.invalidateQueries({ queryKey: ['integrations', integrationId, 'webhooks'] });
    },
  });
};

export const useTestWebhook = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ integrationId, webhookId }: { integrationId: string; webhookId: string }) => 
      integrationAPI.testWebhook(integrationId, webhookId),
    onSuccess: (_, { integrationId, webhookId }) => {
      queryClient.invalidateQueries({ queryKey: ['integrations', integrationId, 'webhooks'] });
      queryClient.invalidateQueries({ queryKey: ['integrations', integrationId, 'webhooks', webhookId] });
    },
  });
};

// Data Mappings Hooks
export const useDataMappings = (integrationId: string) => {
  return useQuery({
    queryKey: ['integrations', integrationId, 'mappings'],
    queryFn: () => integrationAPI.getMappings(integrationId),
    enabled: !!integrationId,
  });
};

export const useDataMapping = (integrationId: string, mappingId: string) => {
  return useQuery({
    queryKey: ['integrations', integrationId, 'mappings', mappingId],
    queryFn: () => integrationAPI.getMappingById(integrationId, mappingId),
    enabled: !!integrationId && !!mappingId,
  });
};

export const useCreateDataMapping = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ integrationId, data }: { integrationId: string; data: CreateDataMapping }) => 
      integrationAPI.createMapping(integrationId, data),
    onSuccess: (_, { integrationId }) => {
      queryClient.invalidateQueries({ queryKey: ['integrations', integrationId, 'mappings'] });
    },
  });
};

export const useUpdateDataMapping = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      integrationId, 
      mappingId, 
      data 
    }: { 
      integrationId: string; 
      mappingId: string; 
      data: UpdateDataMapping 
    }) => integrationAPI.updateMapping(integrationId, mappingId, data),
    onSuccess: (_, { integrationId, mappingId }) => {
      queryClient.invalidateQueries({ queryKey: ['integrations', integrationId, 'mappings'] });
      queryClient.invalidateQueries({ queryKey: ['integrations', integrationId, 'mappings', mappingId] });
    },
  });
};

export const useDeleteDataMapping = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ integrationId, mappingId }: { integrationId: string; mappingId: string }) => 
      integrationAPI.deleteMapping(integrationId, mappingId),
    onSuccess: (_, { integrationId }) => {
      queryClient.invalidateQueries({ queryKey: ['integrations', integrationId, 'mappings'] });
    },
  });
};

// Integration Templates Hooks
export const useIntegrationTemplates = (params?: { page?: number; limit?: number; search?: string; category?: string; type?: string }) => {
  return useQuery({
    queryKey: ['integrations', 'templates', params],
    queryFn: () => integrationAPI.getTemplates(params),
  });
};

export const useIntegrationTemplate = (id: string) => {
  return useQuery({
    queryKey: ['integrations', 'templates', id],
    queryFn: () => integrationAPI.getTemplateById(id),
    enabled: !!id,
  });
};

export const useCreateIntegrationTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateIntegrationTemplate) => integrationAPI.createTemplate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations', 'templates'] });
    },
  });
};

export const useUpdateIntegrationTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateIntegrationTemplate }) => 
      integrationAPI.updateTemplate(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['integrations', 'templates'] });
      queryClient.invalidateQueries({ queryKey: ['integrations', 'templates', id] });
    },
  });
};

export const useDeleteIntegrationTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => integrationAPI.deleteTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations', 'templates'] });
    },
  });
};

// Integration Analytics Hooks
export const useIntegrationDashboard = (params?: { startDate?: string; endDate?: string }) => {
  return useQuery({
    queryKey: ['integrations', 'analytics', 'dashboard', params],
    queryFn: () => integrationAnalyticsAPI.getDashboard(params),
  });
};

export const useIntegrationLogs = (params?: { integrationId?: string; type?: string; status?: string; startDate?: string; endDate?: string; page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ['integrations', 'analytics', 'logs', params],
    queryFn: () => integrationAnalyticsAPI.getLogs(params),
  });
};

export const useIntegrationMetrics = (params?: { startDate?: string; endDate?: string; groupBy?: string }) => {
  return useQuery({
    queryKey: ['integrations', 'analytics', 'metrics', params],
    queryFn: () => integrationAnalyticsAPI.getMetrics(params),
  });
};

export const useIntegrationReports = (params?: { startDate?: string; endDate?: string; type?: string }) => {
  return useQuery({
    queryKey: ['integrations', 'analytics', 'reports', params],
    queryFn: () => integrationAnalyticsAPI.getReports(params),
  });
}; 