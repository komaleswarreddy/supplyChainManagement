import { z } from 'zod';

// Base schemas
export const IntegrationSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  integrationNumber: z.string(),
  name: z.string(),
  description: z.string().optional(),
  type: z.enum(['ERP', 'CRM', 'WMS', 'TMS', 'ACCOUNTING', 'PAYMENT_GATEWAY', 'SHIPPING_CARRIER', 'SUPPLIER_PORTAL', 'CUSTOM']),
  category: z.enum(['BUSINESS_SYSTEM', 'PAYMENT', 'SHIPPING', 'COMMUNICATION', 'ANALYTICS', 'OTHER']),
  status: z.enum(['ACTIVE', 'INACTIVE', 'MAINTENANCE', 'ERROR', 'DISCONNECTED']),
  version: z.string(),
  provider: z.string(),
  providerUrl: z.string().url().optional(),
  apiVersion: z.string().optional(),
  authentication: z.object({
    type: z.enum(['API_KEY', 'OAUTH2', 'BASIC', 'BEARER', 'CUSTOM']),
    credentials: z.record(z.any()),
    config: z.record(z.any()).optional(),
  }),
  configuration: z.record(z.any()).optional(),
  capabilities: z.array(z.string()).optional(),
  rateLimit: z.object({
    requests: z.number().int().positive(),
    period: z.number().int().positive(),
  }).optional(),
  timeout: z.number().int().positive(),
  retryConfig: z.object({
    maxRetries: z.number().int().positive(),
    retryDelay: z.number().int().positive(),
    backoffMultiplier: z.number().positive(),
  }).optional(),
  healthCheck: z.object({
    endpoint: z.string().optional(),
    interval: z.number().int().positive(),
    timeout: z.number().int().positive(),
  }).optional(),
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
  timeout: z.number().int().positive(),
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
  keyType: z.enum(['API_KEY', 'ACCESS_TOKEN', 'REFRESH_TOKEN', 'JWT', 'CUSTOM']),
  keyValue: z.string(),
  isEncrypted: z.boolean(),
  permissions: z.array(z.string()).optional(),
  rateLimit: z.record(z.any()).optional(),
  expiresAt: z.string().datetime().optional(),
  lastUsed: z.string().datetime().optional(),
  usageCount: z.number().int().positive(),
  isActive: z.boolean(),
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
  eventType: z.string(),
  webhookUrl: z.string().url(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'ERROR', 'PAUSED']),
  authentication: z.record(z.any()).optional(),
  headers: z.record(z.any()).optional(),
  payloadTemplate: z.record(z.any()).optional(),
  retryConfig: z.record(z.any()).optional(),
  filters: z.record(z.any()).optional(),
  lastTriggered: z.string().datetime().optional(),
  triggerCount: z.number().int().positive(),
  successCount: z.number().int().positive(),
  failureCount: z.number().int().positive(),
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
  sourceEntity: z.string(),
  targetEntity: z.string(),
  direction: z.enum(['INBOUND', 'OUTBOUND', 'BIDIRECTIONAL']),
  status: z.enum(['ACTIVE', 'INACTIVE', 'DRAFT']),
  mappingRules: z.array(z.object({
    sourceField: z.string(),
    targetField: z.string(),
    transformation: z.string().optional(),
    defaultValue: z.any().optional(),
    isRequired: z.boolean(),
    validation: z.record(z.any()).optional(),
  })),
  transformationScript: z.string().optional(),
  validationRules: z.record(z.any()).optional(),
  lastSync: z.string().datetime().optional(),
  syncCount: z.number().int().positive(),
  successCount: z.number().int().positive(),
  failureCount: z.number().int().positive(),
  metadata: z.record(z.any()).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  createdBy: z.string().uuid(),
  updatedBy: z.string().uuid().optional(),
});

export const IntegrationLogSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  logNumber: z.string(),
  integrationId: z.string().uuid().optional(),
  endpointId: z.string().uuid().optional(),
  webhookId: z.string().uuid().optional(),
  level: z.enum(['INFO', 'WARN', 'ERROR', 'DEBUG']),
  message: z.string(),
  details: z.record(z.any()).optional(),
  requestData: z.record(z.any()).optional(),
  responseData: z.record(z.any()).optional(),
  statusCode: z.number().int().optional(),
  duration: z.number().int().positive().optional(),
  timestamp: z.string().datetime(),
  metadata: z.record(z.any()).optional(),
  createdAt: z.string().datetime(),
});

export const IntegrationTemplateSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  templateNumber: z.string(),
  name: z.string(),
  description: z.string().optional(),
  category: z.enum(['ERP', 'CRM', 'WMS', 'TMS', 'ACCOUNTING', 'PAYMENT_GATEWAY', 'SHIPPING_CARRIER', 'SUPPLIER_PORTAL', 'CUSTOM']),
  type: z.enum(['INTEGRATION', 'ENDPOINT', 'WEBHOOK', 'MAPPING']),
  version: z.string(),
  isDefault: z.boolean(),
  isActive: z.boolean(),
  template: z.record(z.any()),
  parameters: z.array(z.object({
    name: z.string(),
    type: z.string(),
    required: z.boolean(),
    defaultValue: z.any().optional(),
    description: z.string().optional(),
  })).optional(),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.any()).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  createdBy: z.string().uuid(),
  updatedBy: z.string().uuid().optional(),
});

export const IntegrationPermissionSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  permissionNumber: z.string(),
  name: z.string(),
  description: z.string().optional(),
  type: z.enum(['INTEGRATION', 'ENDPOINT', 'API_KEY', 'WEBHOOK', 'MAPPING']),
  resourceId: z.string().uuid(),
  userId: z.string().uuid().optional(),
  roleId: z.string().uuid().optional(),
  permissions: z.array(z.string()),
  conditions: z.record(z.any()).optional(),
  metadata: z.record(z.any()).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  createdBy: z.string().uuid(),
  updatedBy: z.string().uuid().optional(),
});

// Request/Response schemas
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
  usageCount: true,
});

export const UpdateApiKeySchema = CreateApiKeySchema.partial();

export const CreateWebhookSubscriptionSchema = WebhookSubscriptionSchema.omit({
  id: true,
  tenantId: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
  updatedBy: true,
  triggerCount: true,
  successCount: true,
  failureCount: true,
});

export const UpdateWebhookSubscriptionSchema = CreateWebhookSubscriptionSchema.partial();

export const CreateDataMappingSchema = DataMappingSchema.omit({
  id: true,
  tenantId: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
  updatedBy: true,
  syncCount: true,
  successCount: true,
  failureCount: true,
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

export const CreateIntegrationPermissionSchema = IntegrationPermissionSchema.omit({
  id: true,
  tenantId: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
  updatedBy: true,
});

export const UpdateIntegrationPermissionSchema = CreateIntegrationPermissionSchema.partial();

// Analytics schemas
export const IntegrationDashboardSchema = z.object({
  metrics: z.object({
    totalIntegrations: z.number(),
    activeIntegrations: z.number(),
    totalEndpoints: z.number(),
    totalApiKeys: z.number(),
    totalWebhooks: z.number(),
    totalMappings: z.number(),
  }),
  recentLogs: z.array(IntegrationLogSchema),
  topIntegrations: z.array(z.object({
    id: z.string().uuid(),
    name: z.string(),
    status: z.string(),
    lastActivity: z.string().datetime(),
  })),
});

export const IntegrationAnalyticsSchema = z.object({
  logs: z.array(IntegrationLogSchema),
  summary: z.object({
    totalIntegrations: z.number(),
    activeIntegrations: z.number(),
    totalEndpoints: z.number(),
    totalApiKeys: z.number(),
    totalWebhooks: z.number(),
    totalMappings: z.number(),
  }),
});

// Type exports
export type Integration = z.infer<typeof IntegrationSchema>;
export type ApiEndpoint = z.infer<typeof ApiEndpointSchema>;
export type ApiKey = z.infer<typeof ApiKeySchema>;
export type WebhookSubscription = z.infer<typeof WebhookSubscriptionSchema>;
export type DataMapping = z.infer<typeof DataMappingSchema>;
export type IntegrationLog = z.infer<typeof IntegrationLogSchema>;
export type IntegrationTemplate = z.infer<typeof IntegrationTemplateSchema>;
export type IntegrationPermission = z.infer<typeof IntegrationPermissionSchema>;

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
export type CreateIntegrationPermission = z.infer<typeof CreateIntegrationPermissionSchema>;
export type UpdateIntegrationPermission = z.infer<typeof UpdateIntegrationPermissionSchema>;

export type IntegrationDashboard = z.infer<typeof IntegrationDashboardSchema>;
export type IntegrationAnalytics = z.infer<typeof IntegrationAnalyticsSchema>; 