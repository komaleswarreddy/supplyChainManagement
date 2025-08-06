import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { authenticate } from '../middleware/auth';
import { hasPermissions } from '../middleware/auth';
import { db } from '../db';
import { 
  integrations, 
  apiEndpoints, 
  apiKeys, 
  webhookSubscriptions, 
  dataMappings, 
  integrationLogs, 
  integrationTemplates,
  integrationPermissions
} from '../db/schema';
import { eq, and, desc, asc, like, gte, lte, inArray } from 'drizzle-orm';
import { sql } from 'drizzle-orm';

// Zod schemas for validation
const createIntegrationSchema = z.object({
  integrationNumber: z.string().min(1, 'Integration number is required'),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  type: z.enum(['ERP', 'CRM', 'WMS', 'TMS', 'ACCOUNTING', 'PAYMENT_GATEWAY', 'SHIPPING_CARRIER', 'SUPPLIER_PORTAL', 'CUSTOM']),
  category: z.enum(['BUSINESS_SYSTEM', 'PAYMENT', 'SHIPPING', 'COMMUNICATION', 'ANALYTICS', 'OTHER']),
  status: z.enum(['ACTIVE', 'INACTIVE', 'MAINTENANCE', 'ERROR', 'DISCONNECTED']).default('ACTIVE'),
  version: z.string().default('1.0'),
  provider: z.string().min(1, 'Provider is required'),
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
    period: z.number().int().positive(), // seconds
  }).optional(),
  timeout: z.number().int().positive().default(30000), // milliseconds
  retryConfig: z.object({
    maxRetries: z.number().int().positive().default(3),
    retryDelay: z.number().int().positive().default(1000), // milliseconds
    backoffMultiplier: z.number().positive().default(2),
  }).optional(),
  healthCheck: z.object({
    endpoint: z.string().optional(),
    interval: z.number().int().positive().default(300), // seconds
    timeout: z.number().int().positive().default(5000), // milliseconds
  }).optional(),
  metadata: z.record(z.any()).optional(),
});

const updateIntegrationSchema = createIntegrationSchema.partial();

const createApiEndpointSchema = z.object({
  endpointNumber: z.string().min(1, 'Endpoint number is required'),
  integrationId: z.string().uuid(),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  path: z.string().min(1, 'Path is required'),
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']),
  status: z.enum(['ACTIVE', 'INACTIVE', 'DEPRECATED']).default('ACTIVE'),
  version: z.string().default('v1'),
  authentication: z.record(z.any()).optional(),
  rateLimit: z.record(z.any()).optional(),
  timeout: z.number().int().positive().default(30000), // milliseconds
  retryConfig: z.record(z.any()).optional(),
  requestSchema: z.record(z.any()).optional(),
  responseSchema: z.record(z.any()).optional(),
  headers: z.record(z.any()).optional(),
  parameters: z.record(z.any()).optional(),
  metadata: z.record(z.any()).optional(),
});

const updateApiEndpointSchema = createApiEndpointSchema.partial();

const createApiKeySchema = z.object({
  keyNumber: z.string().min(1, 'Key number is required'),
  integrationId: z.string().uuid(),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  keyType: z.enum(['API_KEY', 'ACCESS_TOKEN', 'REFRESH_TOKEN', 'JWT', 'CUSTOM']),
  keyValue: z.string().min(1, 'Key value is required'),
  isEncrypted: z.boolean().default(true),
  permissions: z.array(z.string()).optional(),
  rateLimit: z.record(z.any()).optional(),
  expiresAt: z.string().datetime().optional(),
  lastUsed: z.string().datetime().optional(),
  usageCount: z.number().int().positive().default(0),
  isActive: z.boolean().default(true),
  metadata: z.record(z.any()).optional(),
});

const updateApiKeySchema = createApiKeySchema.partial();

const createWebhookSubscriptionSchema = z.object({
  subscriptionNumber: z.string().min(1, 'Subscription number is required'),
  integrationId: z.string().uuid(),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  eventType: z.string().min(1, 'Event type is required'),
  webhookUrl: z.string().url(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'ERROR', 'PAUSED']).default('ACTIVE'),
  authentication: z.record(z.any()).optional(),
  headers: z.record(z.any()).optional(),
  payloadTemplate: z.record(z.any()).optional(),
  retryConfig: z.record(z.any()).optional(),
  filters: z.record(z.any()).optional(),
  lastTriggered: z.string().datetime().optional(),
  triggerCount: z.number().int().positive().default(0),
  successCount: z.number().int().positive().default(0),
  failureCount: z.number().int().positive().default(0),
  metadata: z.record(z.any()).optional(),
});

const updateWebhookSubscriptionSchema = createWebhookSubscriptionSchema.partial();

const createDataMappingSchema = z.object({
  mappingNumber: z.string().min(1, 'Mapping number is required'),
  integrationId: z.string().uuid(),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  sourceEntity: z.string().min(1, 'Source entity is required'),
  targetEntity: z.string().min(1, 'Target entity is required'),
  direction: z.enum(['INBOUND', 'OUTBOUND', 'BIDIRECTIONAL']),
  status: z.enum(['ACTIVE', 'INACTIVE', 'DRAFT']).default('ACTIVE'),
  mappingRules: z.array(z.object({
    sourceField: z.string(),
    targetField: z.string(),
    transformation: z.string().optional(),
    defaultValue: z.any().optional(),
    isRequired: z.boolean().default(false),
    validation: z.record(z.any()).optional(),
  })),
  transformationScript: z.string().optional(),
  validationRules: z.record(z.any()).optional(),
  lastSync: z.string().datetime().optional(),
  syncCount: z.number().int().positive().default(0),
  successCount: z.number().int().positive().default(0),
  failureCount: z.number().int().positive().default(0),
  metadata: z.record(z.any()).optional(),
});

const updateDataMappingSchema = createDataMappingSchema.partial();

const createIntegrationTemplateSchema = z.object({
  templateNumber: z.string().min(1, 'Template number is required'),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  category: z.enum(['ERP', 'CRM', 'WMS', 'TMS', 'ACCOUNTING', 'PAYMENT_GATEWAY', 'SHIPPING_CARRIER', 'SUPPLIER_PORTAL', 'CUSTOM']),
  type: z.enum(['INTEGRATION', 'ENDPOINT', 'WEBHOOK', 'MAPPING']),
  version: z.string().default('1.0'),
  isDefault: z.boolean().default(false),
  isActive: z.boolean().default(true),
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
});

const updateIntegrationTemplateSchema = createIntegrationTemplateSchema.partial();

// Integration routes
export default async function integrationRoutes(fastify: FastifyInstance) {
  // Apply authentication middleware to all routes
  fastify.addHook('preHandler', authenticate);
  
  // Get all integrations
  fastify.get('/integrations', {
    preHandler: hasPermissions(['view_integrations']),
    schema: {
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'number', default: 1 },
          pageSize: { type: 'number', default: 10 },
          type: { type: 'string', enum: ['ERP', 'CRM', 'WMS', 'TMS', 'ACCOUNTING', 'PAYMENT_GATEWAY', 'SHIPPING_CARRIER', 'SUPPLIER_PORTAL', 'CUSTOM'] },
          category: { type: 'string', enum: ['BUSINESS_SYSTEM', 'PAYMENT', 'SHIPPING', 'COMMUNICATION', 'ANALYTICS', 'OTHER'] },
          status: { type: 'string', enum: ['ACTIVE', 'INACTIVE', 'MAINTENANCE', 'ERROR', 'DISCONNECTED'] },
          provider: { type: 'string' },
          search: { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  integrationNumber: { type: 'string' },
                  name: { type: 'string' },
                  type: { type: 'string' },
                  category: { type: 'string' },
                  status: { type: 'string' },
                  provider: { type: 'string' },
                  version: { type: 'string' },
                  createdAt: { type: 'string' },
                },
              },
            },
            total: { type: 'number' },
            page: { type: 'number' },
            pageSize: { type: 'number' },
            totalPages: { type: 'number' },
          },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { 
      page = 1, 
      pageSize = 10, 
      type, 
      category, 
      status, 
      provider, 
      search 
    } = request.query as any;

    const offset = (page - 1) * pageSize;
    const conditions = [];

    if (type) conditions.push(eq(integrations.type, type));
    if (category) conditions.push(eq(integrations.category, category));
    if (status) conditions.push(eq(integrations.status, status));
    if (provider) conditions.push(like(integrations.provider, `%${provider}%`));
    if (search) {
      conditions.push(
        like(integrations.name, `%${search}%`)
      );
    }

    const [integrationList, total] = await Promise.all([
      db.select()
        .from(integrations)
        .where(and(...conditions))
        .orderBy(desc(integrations.createdAt))
        .limit(pageSize)
        .offset(offset),
      db.select({ count: sql`count(*)` })
        .from(integrations)
        .where(and(...conditions))
        .then(result => Number(result[0]?.count || 0))
    ]);

    return {
      items: integrationList,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  });

  // Get integration by ID
  fastify.get('/integrations/:id', {
    preHandler: hasPermissions(['view_integrations']),
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
        required: ['id'],
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    
    const integration = await db.select()
      .from(integrations)
      .where(eq(integrations.id, id))
      .limit(1);

    if (!integration.length) {
      return reply.status(404).send({ error: 'Integration not found' });
    }

    return integration[0];
  });

  // Create integration
  fastify.post('/integrations', {
    preHandler: hasPermissions(['manage_integrations']),
    schema: {
      body: createIntegrationSchema,
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const data = request.body as z.infer<typeof createIntegrationSchema>;
    
    const [integration] = await db.insert(integrations)
      .values({
        ...data,
        tenantId: request.user.tenantId,
        createdBy: request.user.id,
      })
      .returning();

    return reply.status(201).send(integration);
  });

  // Update integration
  fastify.put('/integrations/:id', {
    preHandler: hasPermissions(['manage_integrations']),
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
        required: ['id'],
      },
      body: updateIntegrationSchema,
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const data = request.body as z.infer<typeof updateIntegrationSchema>;
    
    const [integration] = await db.update(integrations)
      .set({
        ...data,
        updatedBy: request.user.id,
        updatedAt: new Date(),
      })
      .where(eq(integrations.id, id))
      .returning();

    if (!integration) {
      return reply.status(404).send({ error: 'Integration not found' });
    }

    return integration;
  });

  // Delete integration
  fastify.delete('/integrations/:id', {
    preHandler: hasPermissions(['manage_integrations']),
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
        required: ['id'],
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    
    const [integration] = await db.delete(integrations)
      .where(eq(integrations.id, id))
      .returning();

    if (!integration) {
      return reply.status(404).send({ error: 'Integration not found' });
    }

    return { message: 'Integration deleted successfully' };
  });

  // Test integration connection
  fastify.post('/integrations/:id/test', {
    preHandler: hasPermissions(['manage_integrations']),
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
        required: ['id'],
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    
    const integration = await db.select()
      .from(integrations)
      .where(eq(integrations.id, id))
      .limit(1);

    if (!integration.length) {
      return reply.status(404).send({ error: 'Integration not found' });
    }

    try {
      const startTime = Date.now();
      
      // Validate integration configuration
      if (!integration[0].config || !integration[0].config.endpoint) {
        throw new Error('Integration configuration is incomplete');
      }

      // Make test API call
      const response = await fetch(integration[0].config.endpoint, {
        method: integration[0].config.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...integration[0].config.headers
        },
        body: integration[0].config.body ? JSON.stringify(integration[0].config.body) : undefined
      });

      const responseTime = Date.now() - startTime;
      const responseData = await response.text();

      // Check response
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Update integration status
      await db.update(integrations)
        .set({ 
          status: 'ACTIVE',
          lastTestedAt: new Date(),
          lastTestResult: 'SUCCESS'
        })
        .where(eq(integrations.id, id));

      return { 
        message: 'Connection test completed successfully',
        status: 'SUCCESS',
        responseTime,
        details: {
          endpoint: integration[0].config.endpoint,
          statusCode: response.status,
          responseTime: `${responseTime}ms`,
          message: 'Connection successful'
        }
      };
    } catch (error) {
      // Update integration status on failure
      await db.update(integrations)
        .set({ 
          status: 'ERROR',
          lastTestedAt: new Date(),
          lastTestResult: 'FAILED'
        })
        .where(eq(integrations.id, id));

      return reply.status(500).send({ 
        message: 'Connection test failed',
        status: 'FAILED',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      });
    }
  });

  // Get API endpoints for an integration
  fastify.get('/integrations/:id/endpoints', {
    preHandler: hasPermissions(['view_integrations']),
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
        required: ['id'],
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    
    const endpoints = await db.select()
      .from(apiEndpoints)
      .where(eq(apiEndpoints.integrationId, id))
      .orderBy(asc(apiEndpoints.path));

    return endpoints;
  });

  // Get API endpoint by ID
  fastify.get('/endpoints/:id', {
    preHandler: hasPermissions(['view_integrations']),
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
        required: ['id'],
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    
    const endpoint = await db.select()
      .from(apiEndpoints)
      .where(eq(apiEndpoints.id, id))
      .limit(1);

    if (!endpoint.length) {
      return reply.status(404).send({ error: 'API endpoint not found' });
    }

    return endpoint[0];
  });

  // Create API endpoint
  fastify.post('/endpoints', {
    preHandler: hasPermissions(['manage_integrations']),
    schema: {
      body: createApiEndpointSchema,
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const data = request.body as z.infer<typeof createApiEndpointSchema>;
    
    const [endpoint] = await db.insert(apiEndpoints)
      .values({
        ...data,
        tenantId: request.user.tenantId,
        createdBy: request.user.id,
      })
      .returning();

    return reply.status(201).send(endpoint);
  });

  // Update API endpoint
  fastify.put('/endpoints/:id', {
    preHandler: hasPermissions(['manage_integrations']),
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
        required: ['id'],
      },
      body: updateApiEndpointSchema,
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const data = request.body as z.infer<typeof updateApiEndpointSchema>;
    
    const [endpoint] = await db.update(apiEndpoints)
      .set({
        ...data,
        updatedBy: request.user.id,
        updatedAt: new Date(),
      })
      .where(eq(apiEndpoints.id, id))
      .returning();

    if (!endpoint) {
      return reply.status(404).send({ error: 'API endpoint not found' });
    }

    return endpoint;
  });

  // Delete API endpoint
  fastify.delete('/endpoints/:id', {
    preHandler: hasPermissions(['manage_integrations']),
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
        required: ['id'],
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    
    const [endpoint] = await db.delete(apiEndpoints)
      .where(eq(apiEndpoints.id, id))
      .returning();

    if (!endpoint) {
      return reply.status(404).send({ error: 'API endpoint not found' });
    }

    return { message: 'API endpoint deleted successfully' };
  });

  // Get all API keys
  fastify.get('/api-keys', {
    preHandler: hasPermissions(['view_integrations']),
    schema: {
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'number', default: 1 },
          pageSize: { type: 'number', default: 10 },
          integrationId: { type: 'string', format: 'uuid' },
          keyType: { type: 'string', enum: ['API_KEY', 'ACCESS_TOKEN', 'REFRESH_TOKEN', 'JWT', 'CUSTOM'] },
          isActive: { type: 'boolean' },
          search: { type: 'string' },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { 
      page = 1, 
      pageSize = 10, 
      integrationId, 
      keyType, 
      isActive, 
      search 
    } = request.query as any;

    const offset = (page - 1) * pageSize;
    const conditions = [];

    if (integrationId) conditions.push(eq(apiKeys.integrationId, integrationId));
    if (keyType) conditions.push(eq(apiKeys.keyType, keyType));
    if (isActive !== undefined) conditions.push(eq(apiKeys.isActive, isActive));
    if (search) {
      conditions.push(
        like(apiKeys.name, `%${search}%`)
      );
    }

    const [keys, total] = await Promise.all([
      db.select()
        .from(apiKeys)
        .where(and(...conditions))
        .orderBy(desc(apiKeys.createdAt))
        .limit(pageSize)
        .offset(offset),
      db.select({ count: sql`count(*)` })
        .from(apiKeys)
        .where(and(...conditions))
        .then(result => Number(result[0]?.count || 0))
    ]);

    return {
      items: keys,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  });

  // Get API key by ID
  fastify.get('/api-keys/:id', {
    preHandler: hasPermissions(['view_integrations']),
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
        required: ['id'],
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    
    const key = await db.select()
      .from(apiKeys)
      .where(eq(apiKeys.id, id))
      .limit(1);

    if (!key.length) {
      return reply.status(404).send({ error: 'API key not found' });
    }

    return key[0];
  });

  // Create API key
  fastify.post('/api-keys', {
    preHandler: hasPermissions(['manage_integrations']),
    schema: {
      body: createApiKeySchema,
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const data = request.body as z.infer<typeof createApiKeySchema>;
    
    const [key] = await db.insert(apiKeys)
      .values({
        ...data,
        tenantId: request.user.tenantId,
        createdBy: request.user.id,
      })
      .returning();

    return reply.status(201).send(key);
  });

  // Update API key
  fastify.put('/api-keys/:id', {
    preHandler: hasPermissions(['manage_integrations']),
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
        required: ['id'],
      },
      body: updateApiKeySchema,
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const data = request.body as z.infer<typeof updateApiKeySchema>;
    
    const [key] = await db.update(apiKeys)
      .set({
        ...data,
        updatedBy: request.user.id,
        updatedAt: new Date(),
      })
      .where(eq(apiKeys.id, id))
      .returning();

    if (!key) {
      return reply.status(404).send({ error: 'API key not found' });
    }

    return key;
  });

  // Delete API key
  fastify.delete('/api-keys/:id', {
    preHandler: hasPermissions(['manage_integrations']),
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
        required: ['id'],
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    
    const [key] = await db.delete(apiKeys)
      .where(eq(apiKeys.id, id))
      .returning();

    if (!key) {
      return reply.status(404).send({ error: 'API key not found' });
    }

    return { message: 'API key deleted successfully' };
  });

  // Get integration logs
  fastify.get('/logs', {
    preHandler: hasPermissions(['view_integrations']),
    schema: {
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'number', default: 1 },
          pageSize: { type: 'number', default: 10 },
          integrationId: { type: 'string', format: 'uuid' },
          level: { type: 'string', enum: ['INFO', 'WARN', 'ERROR', 'DEBUG'] },
          startDate: { type: 'string', format: 'date-time' },
          endDate: { type: 'string', format: 'date-time' },
          search: { type: 'string' },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { 
      page = 1, 
      pageSize = 10, 
      integrationId, 
      level, 
      startDate, 
      endDate, 
      search 
    } = request.query as any;

    const offset = (page - 1) * pageSize;
    const conditions = [];

    if (integrationId) conditions.push(eq(integrationLogs.integrationId, integrationId));
    if (level) conditions.push(eq(integrationLogs.level, level));
    if (startDate) conditions.push(gte(integrationLogs.timestamp, new Date(startDate)));
    if (endDate) conditions.push(lte(integrationLogs.timestamp, new Date(endDate)));
    if (search) {
      conditions.push(
        like(integrationLogs.message, `%${search}%`)
      );
    }

    const [logs, total] = await Promise.all([
      db.select()
        .from(integrationLogs)
        .where(and(...conditions))
        .orderBy(desc(integrationLogs.timestamp))
        .limit(pageSize)
        .offset(offset),
      db.select({ count: sql`count(*)` })
        .from(integrationLogs)
        .where(and(...conditions))
        .then(result => Number(result[0]?.count || 0))
    ]);

    return {
      items: logs,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  });

  // Get integration analytics
  fastify.get('/analytics', {
    preHandler: hasPermissions(['view_integrations']),
    schema: {
      querystring: {
        type: 'object',
        properties: {
          startDate: { type: 'string', format: 'date-time' },
          endDate: { type: 'string', format: 'date-time' },
          integrationId: { type: 'string', format: 'uuid' },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { startDate, endDate, integrationId } = request.query as any;

    const conditions = [];
    if (startDate) conditions.push(gte(integrationLogs.timestamp, new Date(startDate)));
    if (endDate) conditions.push(lte(integrationLogs.timestamp, new Date(endDate)));
    if (integrationId) conditions.push(eq(integrationLogs.integrationId, integrationId));

    const logs = await db.select()
      .from(integrationLogs)
      .where(and(...conditions))
      .orderBy(desc(integrationLogs.timestamp));

    // Calculate summary metrics
    const summary = {
      totalIntegrations: 0,
      activeIntegrations: 0,
      totalEndpoints: 0,
      totalApiKeys: 0,
      totalWebhooks: 0,
      totalMappings: 0,
    };

    return {
      logs,
      summary,
    };
  });

  // Get integration dashboard
  fastify.get('/dashboard', {
    preHandler: hasPermissions(['view_integrations']),
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const [integrationList, endpoints, keys, logs, templates] = await Promise.all([
      db.select({ count: sql`count(*)` })
        .from(integrations)
        .where(eq(integrations.tenantId, request.user.tenantId))
        .then(result => Number(result[0]?.count || 0)),
      db.select({ count: sql`count(*)` })
        .from(apiEndpoints)
        .where(eq(apiEndpoints.tenantId, request.user.tenantId))
        .then(result => Number(result[0]?.count || 0)),
      db.select({ count: sql`count(*)` })
        .from(apiKeys)
        .where(eq(apiKeys.tenantId, request.user.tenantId))
        .then(result => Number(result[0]?.count || 0)),
      db.select()
        .from(integrationLogs)
        .where(eq(integrationLogs.tenantId, request.user.tenantId))
        .orderBy(desc(integrationLogs.timestamp))
        .limit(10),
      db.select({ count: sql`count(*)` })
        .from(integrationTemplates)
        .where(eq(integrationTemplates.tenantId, request.user.tenantId))
        .then(result => Number(result[0]?.count || 0)),
    ]);

    return {
      metrics: {
        totalIntegrations: integrationList,
        totalEndpoints: endpoints,
        totalApiKeys: keys,
        totalTemplates: templates,
      },
      recentLogs: logs,
    };
  });
} 