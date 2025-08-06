import { z } from 'zod';
import { apiClient } from '@/lib/api-client';

// Zod Schemas
export const IntegrationSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  integrationNumber: z.string(),
  name: z.string(),
  description: z.string().optional(),
  type: z.enum(['API', 'WEBHOOK', 'DATABASE', 'FILE', 'MESSAGE_QUEUE', 'CUSTOM']),
  category: z.enum(['ERP', 'CRM', 'ACCOUNTING', 'SHIPPING', 'PAYMENT', 'CUSTOM']),
  status: z.enum(['DRAFT', 'ACTIVE', 'INACTIVE', 'ERROR']),
  version: z.string(),
  provider: z.string().optional(),
  connectionConfig: z.record(z.any()),
  authentication: z.record(z.any()).optional(),
  settings: z.record(z.any()).optional(),
  healthCheck: z.record(z.any()).optional(),
  lastHealthCheck: z.string().datetime().optional(),
  healthStatus: z.enum(['HEALTHY', 'WARNING', 'ERROR', 'UNKNOWN']).optional(),
  metadata: z.record(z.any()).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  createdBy: z.string().uuid(),
  updatedBy: z.string().uuid().optional(),
});

export const ApiEndpointSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  endpointNumber: z.string(),
  integrationId: z.string().uuid(),
  name: z.string(),
  description: z.string().optional(),
  path: z.string(),
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']),
  status: z.enum(['ACTIVE', 'INACTIVE', 'DEPRECATED']),
  version: z.string(),
  authentication: z.record(z.any()).optional(),
  rateLimit: z.record(z.any()).optional(),
  timeout: z.number().optional(),
  retryConfig: z.record(z.any()).optional(),
  requestSchema: z.record(z.any()).optional(),
  responseSchema: z.record(z.any()).optional(),
  headers: z.record(z.any()).optional(),
  parameters: z.record(z.any()).optional(),
  metadata: z.record(z.any()).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  createdBy: z.string().uuid(),
  updatedBy: z.string().uuid().optional(),
});

export const ApiKeySchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  keyNumber: z.string(),
  integrationId: z.string().uuid(),
  name: z.string(),
  description: z.string().optional(),
  keyType: z.enum(['API_KEY', 'JWT', 'OAUTH', 'BASIC']),
  keyValue: z.string(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'EXPIRED', 'REVOKED']),
  permissions: z.record(z.any()).optional(),
  rateLimit: z.record(z.any()).optional(),
  expiresAt: z.string().datetime().optional(),
  lastUsed: z.string().datetime().optional(),
  usageCount: z.number().optional(),
  metadata: z.record(z.any()).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  createdBy: z.string().uuid(),
  updatedBy: z.string().uuid().optional(),
});

export const WebhookSubscriptionSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  subscriptionNumber: z.string(),
  integrationId: z.string().uuid(),
  name: z.string(),
  description: z.string().optional(),
  url: z.string(),
  events: z.array(z.string()),
  status: z.enum(['ACTIVE', 'INACTIVE', 'ERROR']),
  authentication: z.record(z.any()).optional(),
  headers: z.record(z.any()).optional(),
  retryConfig: z.record(z.any()).optional(),
  timeout: z.number().optional(),
  lastDelivery: z.string().datetime().optional(),
  lastError: z.string().datetime().optional(),
  errorCount: z.number().optional(),
  successCount: z.number().optional(),
  metadata: z.record(z.any()).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  createdBy: z.string().uuid(),
  updatedBy: z.string().uuid().optional(),
});

export const DataMappingSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  mappingNumber: z.string(),
  integrationId: z.string().uuid(),
  name: z.string(),
  description: z.string().optional(),
  type: z.enum(['FIELD_MAPPING', 'TRANSFORMATION', 'VALIDATION', 'ENRICHMENT']),
  direction: z.enum(['INBOUND', 'OUTBOUND', 'BIDIRECTIONAL']),
  sourceSchema: z.record(z.any()),
  targetSchema: z.record(z.any()),
  mappingRules: z.record(z.any()),
  transformations: z.record(z.any()).optional(),
  validations: z.record(z.any()).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'DRAFT']),
  metadata: z.record(z.any()).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  createdBy: z.string().uuid(),
  updatedBy: z.string().uuid().optional(),
});

export const IntegrationLogSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  integrationId: z.string().uuid(),
  endpointId: z.string().uuid().optional(),
  webhookId: z.string().uuid().optional(),
  requestId: z.string(),
  type: z.enum(['API_CALL', 'WEBHOOK_DELIVERY', 'DATA_SYNC', 'ERROR']),
  status: z.enum(['SUCCESS', 'FAILED', 'PENDING', 'TIMEOUT']),
  startTime: z.string().datetime(),
  endTime: z.string().datetime().optional(),
  duration: z.number().optional(),
  requestData: z.record(z.any()).optional(),
  responseData: z.record(z.any()).optional(),
  errorMessage: z.string().optional(),
  errorDetails: z.record(z.any()).optional(),
  metadata: z.record(z.any()).optional(),
  createdAt: z.string().datetime(),
  createdBy: z.string().uuid().optional(),
});

export const IntegrationTemplateSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  templateNumber: z.string(),
  name: z.string(),
  description: z.string().optional(),
  category: z.string(),
  type: z.enum(['INTEGRATION', 'ENDPOINT', 'WEBHOOK', 'MAPPING']),
  template: z.record(z.any()),
  parameters: z.record(z.any()).optional(),
  isDefault: z.boolean(),
  isActive: z.boolean(),
  version: z.string(),
  metadata: z.record(z.any()).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  createdBy: z.string().uuid(),
  updatedBy: z.string().uuid().optional(),
});

// Create/Update Schemas
export const CreateIntegrationSchema = IntegrationSchema.omit({
  id: true,
  tenantId: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
  updatedBy: true,
});

export const UpdateIntegrationSchema = CreateIntegrationSchema.partial();

export const CreateApiEndpointSchema = ApiEndpointSchema.omit({
  id: true,
  tenantId: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
  updatedBy: true,
});

export const UpdateApiEndpointSchema = CreateApiEndpointSchema.partial();

export const CreateApiKeySchema = ApiKeySchema.omit({
  id: true,
  tenantId: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
  updatedBy: true,
});

export const UpdateApiKeySchema = CreateApiKeySchema.partial();

export const CreateWebhookSubscriptionSchema = WebhookSubscriptionSchema.omit({
  id: true,
  tenantId: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
  updatedBy: true,
});

export const UpdateWebhookSubscriptionSchema = CreateWebhookSubscriptionSchema.partial();

export const CreateDataMappingSchema = DataMappingSchema.omit({
  id: true,
  tenantId: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
  updatedBy: true,
});

export const UpdateDataMappingSchema = CreateDataMappingSchema.partial();

export const CreateIntegrationTemplateSchema = IntegrationTemplateSchema.omit({
  id: true,
  tenantId: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
  updatedBy: true,
});

export const UpdateIntegrationTemplateSchema = CreateIntegrationTemplateSchema.partial();

// Types
export type Integration = z.infer<typeof IntegrationSchema>;
export type ApiEndpoint = z.infer<typeof ApiEndpointSchema>;
export type ApiKey = z.infer<typeof ApiKeySchema>;
export type WebhookSubscription = z.infer<typeof WebhookSubscriptionSchema>;
export type DataMapping = z.infer<typeof DataMappingSchema>;
export type IntegrationLog = z.infer<typeof IntegrationLogSchema>;
export type IntegrationTemplate = z.infer<typeof IntegrationTemplateSchema>;
export type CreateIntegration = z.infer<typeof CreateIntegrationSchema>;
export type UpdateIntegration = z.infer<typeof UpdateIntegrationSchema>;
export type CreateApiEndpoint = z.infer<typeof CreateApiEndpointSchema>;
export type UpdateApiEndpoint = z.infer<typeof UpdateApiEndpointSchema>;
export type CreateApiKey = z.infer<typeof CreateApiKeySchema>;
export type UpdateApiKey = z.infer<typeof UpdateApiKeySchema>;
export type CreateWebhookSubscription = z.infer<typeof CreateWebhookSubscriptionSchema>;
export type UpdateWebhookSubscription = z.infer<typeof UpdateWebhookSubscriptionSchema>;
export type CreateDataMapping = z.infer<typeof CreateDataMappingSchema>;
export type UpdateDataMapping = z.infer<typeof UpdateDataMappingSchema>;
export type CreateIntegrationTemplate = z.infer<typeof CreateIntegrationTemplateSchema>;
export type UpdateIntegrationTemplate = z.infer<typeof UpdateIntegrationTemplateSchema>;

// API Client Functions
export const integrationAPI = {
  // Integrations
  getAll: async (params?: { page?: number; limit?: number; search?: string; status?: string; type?: string; category?: string }) => {
    const response = await apiClient.get('/api/integrations', { params });
    return z.array(IntegrationSchema).parse(response.data);
  },

  getById: async (id: string) => {
    const response = await apiClient.get(`/api/integrations/${id}`);
    return IntegrationSchema.parse(response.data);
  },

  create: async (data: CreateIntegration) => {
    const response = await apiClient.post('/api/integrations', data);
    return IntegrationSchema.parse(response.data);
  },

  update: async (id: string, data: UpdateIntegration) => {
    const response = await apiClient.put(`/api/integrations/${id}`, data);
    return IntegrationSchema.parse(response.data);
  },

  delete: async (id: string) => {
    await apiClient.delete(`/api/integrations/${id}`);
  },

  testConnection: async (id: string) => {
    const response = await apiClient.post(`/api/integrations/${id}/test`);
    return z.record(z.any()).parse(response.data);
  },

  // API Endpoints
  getEndpoints: async (integrationId: string) => {
    const response = await apiClient.get(`/api/integrations/${integrationId}/endpoints`);
    return z.array(ApiEndpointSchema).parse(response.data);
  },

  getEndpointById: async (integrationId: string, endpointId: string) => {
    const response = await apiClient.get(`/api/integrations/${integrationId}/endpoints/${endpointId}`);
    return ApiEndpointSchema.parse(response.data);
  },

  createEndpoint: async (integrationId: string, data: CreateApiEndpoint) => {
    const response = await apiClient.post(`/api/integrations/${integrationId}/endpoints`, data);
    return ApiEndpointSchema.parse(response.data);
  },

  updateEndpoint: async (integrationId: string, endpointId: string, data: UpdateApiEndpoint) => {
    const response = await apiClient.put(`/api/integrations/${integrationId}/endpoints/${endpointId}`, data);
    return ApiEndpointSchema.parse(response.data);
  },

  deleteEndpoint: async (integrationId: string, endpointId: string) => {
    await apiClient.delete(`/api/integrations/${integrationId}/endpoints/${endpointId}`);
  },

  // API Keys
  getKeys: async (integrationId: string) => {
    const response = await apiClient.get(`/api/integrations/${integrationId}/keys`);
    return z.array(ApiKeySchema).parse(response.data);
  },

  getKeyById: async (integrationId: string, keyId: string) => {
    const response = await apiClient.get(`/api/integrations/${integrationId}/keys/${keyId}`);
    return ApiKeySchema.parse(response.data);
  },

  createKey: async (integrationId: string, data: CreateApiKey) => {
    const response = await apiClient.post(`/api/integrations/${integrationId}/keys`, data);
    return ApiKeySchema.parse(response.data);
  },

  updateKey: async (integrationId: string, keyId: string, data: UpdateApiKey) => {
    const response = await apiClient.put(`/api/integrations/${integrationId}/keys/${keyId}`, data);
    return ApiKeySchema.parse(response.data);
  },

  deleteKey: async (integrationId: string, keyId: string) => {
    await apiClient.delete(`/api/integrations/${integrationId}/keys/${keyId}`);
  },

  revokeKey: async (integrationId: string, keyId: string) => {
    const response = await apiClient.post(`/api/integrations/${integrationId}/keys/${keyId}/revoke`);
    return ApiKeySchema.parse(response.data);
  },

  // Webhooks
  getWebhooks: async (integrationId: string) => {
    const response = await apiClient.get(`/api/integrations/${integrationId}/webhooks`);
    return z.array(WebhookSubscriptionSchema).parse(response.data);
  },

  getWebhookById: async (integrationId: string, webhookId: string) => {
    const response = await apiClient.get(`/api/integrations/${integrationId}/webhooks/${webhookId}`);
    return WebhookSubscriptionSchema.parse(response.data);
  },

  createWebhook: async (integrationId: string, data: CreateWebhookSubscription) => {
    const response = await apiClient.post(`/api/integrations/${integrationId}/webhooks`, data);
    return WebhookSubscriptionSchema.parse(response.data);
  },

  updateWebhook: async (integrationId: string, webhookId: string, data: UpdateWebhookSubscription) => {
    const response = await apiClient.put(`/api/integrations/${integrationId}/webhooks/${webhookId}`, data);
    return WebhookSubscriptionSchema.parse(response.data);
  },

  deleteWebhook: async (integrationId: string, webhookId: string) => {
    await apiClient.delete(`/api/integrations/${integrationId}/webhooks/${webhookId}`);
  },

  testWebhook: async (integrationId: string, webhookId: string) => {
    const response = await apiClient.post(`/api/integrations/${integrationId}/webhooks/${webhookId}/test`);
    return z.record(z.any()).parse(response.data);
  },

  // Data Mappings
  getMappings: async (integrationId: string) => {
    const response = await apiClient.get(`/api/integrations/${integrationId}/mappings`);
    return z.array(DataMappingSchema).parse(response.data);
  },

  getMappingById: async (integrationId: string, mappingId: string) => {
    const response = await apiClient.get(`/api/integrations/${integrationId}/mappings/${mappingId}`);
    return DataMappingSchema.parse(response.data);
  },

  createMapping: async (integrationId: string, data: CreateDataMapping) => {
    const response = await apiClient.post(`/api/integrations/${integrationId}/mappings`, data);
    return DataMappingSchema.parse(response.data);
  },

  updateMapping: async (integrationId: string, mappingId: string, data: UpdateDataMapping) => {
    const response = await apiClient.put(`/api/integrations/${integrationId}/mappings/${mappingId}`, data);
    return DataMappingSchema.parse(response.data);
  },

  deleteMapping: async (integrationId: string, mappingId: string) => {
    await apiClient.delete(`/api/integrations/${integrationId}/mappings/${mappingId}`);
  },

  // Templates
  getTemplates: async (params?: { page?: number; limit?: number; search?: string; category?: string; type?: string }) => {
    const response = await apiClient.get('/api/integrations/templates', { params });
    return z.array(IntegrationTemplateSchema).parse(response.data);
  },

  getTemplateById: async (id: string) => {
    const response = await apiClient.get(`/api/integrations/templates/${id}`);
    return IntegrationTemplateSchema.parse(response.data);
  },

  createTemplate: async (data: CreateIntegrationTemplate) => {
    const response = await apiClient.post('/api/integrations/templates', data);
    return IntegrationTemplateSchema.parse(response.data);
  },

  updateTemplate: async (id: string, data: UpdateIntegrationTemplate) => {
    const response = await apiClient.put(`/api/integrations/templates/${id}`, data);
    return IntegrationTemplateSchema.parse(response.data);
  },

  deleteTemplate: async (id: string) => {
    await apiClient.delete(`/api/integrations/templates/${id}`);
  },
};

export const integrationAnalyticsAPI = {
  getDashboard: async (params?: { startDate?: string; endDate?: string }) => {
    const response = await apiClient.get('/api/integrations/analytics/dashboard', { params });
    return z.record(z.any()).parse(response.data);
  },

  getLogs: async (params?: { integrationId?: string; type?: string; status?: string; startDate?: string; endDate?: string; page?: number; limit?: number }) => {
    const response = await apiClient.get('/api/integrations/analytics/logs', { params });
    return z.array(IntegrationLogSchema).parse(response.data);
  },

  getMetrics: async (params?: { startDate?: string; endDate?: string; groupBy?: string }) => {
    const response = await apiClient.get('/api/integrations/analytics/metrics', { params });
    return z.record(z.any()).parse(response.data);
  },

  getReports: async (params?: { startDate?: string; endDate?: string; type?: string }) => {
    const response = await apiClient.get('/api/integrations/analytics/reports', { params });
    return z.record(z.any()).parse(response.data);
  },
}; 