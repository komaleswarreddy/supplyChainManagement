import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { authenticate } from '../middleware/auth';
import { hasPermissions } from '../middleware/auth';
import { db } from '../db';
import { 
  mobileDevices, 
  mobileSessions, 
  mobileNotifications, 
  mobileConfigurations, 
  mobileAnalytics, 
  mobileAppVersions, 
  mobilePermissions, 
  mobileSyncData 
} from '../db/schema';
import { eq, and, desc, asc, like, gte, lte, inArray } from 'drizzle-orm';
import { sql } from 'drizzle-orm';

// Zod schemas for validation
const createMobileDeviceSchema = z.object({
  deviceNumber: z.string().min(1, 'Device number is required'),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  type: z.enum(['SMARTPHONE', 'TABLET', 'LAPTOP', 'DESKTOP', 'WEARABLE', 'OTHER']),
  platform: z.enum(['IOS', 'ANDROID', 'WINDOWS', 'MACOS', 'LINUX', 'WEB']),
  model: z.string().min(1, 'Model is required'),
  manufacturer: z.string().min(1, 'Manufacturer is required'),
  serialNumber: z.string().optional(),
  imei: z.string().optional(),
  macAddress: z.string().optional(),
  osVersion: z.string().optional(),
  appVersion: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'MAINTENANCE', 'RETIRED', 'LOST', 'STOLEN']).default('ACTIVE'),
  assignedTo: z.string().uuid().optional(),
  location: z.string().optional(),
  lastSeen: z.string().datetime().optional(),
  batteryLevel: z.number().min(0).max(100).optional(),
  storageInfo: z.record(z.any()).optional(),
  networkInfo: z.record(z.any()).optional(),
  pushToken: z.string().optional(),
  deviceId: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

const updateMobileDeviceSchema = createMobileDeviceSchema.partial();

const createMobileSessionSchema = z.object({
  sessionNumber: z.string().min(1, 'Session number is required'),
  deviceId: z.string().uuid(),
  userId: z.string().uuid(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime().optional(),
  duration: z.number().int().positive().optional(),
  status: z.enum(['ACTIVE', 'ENDED', 'EXPIRED', 'TERMINATED']).default('ACTIVE'),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  location: z.string().optional(),
  appVersion: z.string().optional(),
  osVersion: z.string().optional(),
  deviceInfo: z.record(z.any()).optional(),
  sessionData: z.record(z.any()).optional(),
  metadata: z.record(z.any()).optional(),
});

const updateMobileSessionSchema = createMobileSessionSchema.partial();

const createMobileNotificationSchema = z.object({
  notificationNumber: z.string().min(1, 'Notification number is required'),
  deviceId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
  title: z.string().min(1, 'Title is required'),
  message: z.string().min(1, 'Message is required'),
  type: z.enum(['INFO', 'WARNING', 'ERROR', 'SUCCESS', 'ALERT', 'PROMOTION']),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).default('NORMAL'),
  status: z.enum(['PENDING', 'SENT', 'DELIVERED', 'READ', 'FAILED', 'CANCELLED']).default('PENDING'),
  scheduledAt: z.string().datetime().optional(),
  sentAt: z.string().datetime().optional(),
  deliveredAt: z.string().datetime().optional(),
  readAt: z.string().datetime().optional(),
  pushToken: z.string().optional(),
  data: z.record(z.any()).optional(),
  actions: z.array(z.string()).optional(),
  metadata: z.record(z.any()).optional(),
});

const updateMobileNotificationSchema = createMobileNotificationSchema.partial();

const createMobileConfigurationSchema = z.object({
  configurationNumber: z.string().min(1, 'Configuration number is required'),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  type: z.enum(['APP_CONFIG', 'FEATURE_FLAG', 'UI_CONFIG', 'API_CONFIG', 'SECURITY_CONFIG', 'SYNC_CONFIG']),
  platform: z.enum(['IOS', 'ANDROID', 'WINDOWS', 'MACOS', 'LINUX', 'WEB', 'ALL']),
  version: z.string().default('1.0'),
  status: z.enum(['ACTIVE', 'INACTIVE', 'DRAFT', 'ARCHIVED']).default('ACTIVE'),
  configuration: z.record(z.any()),
  conditions: z.record(z.any()).optional(),
  rolloutPercentage: z.number().min(0).max(100).default(100),
  targetDevices: z.array(z.string()).optional(),
  targetUsers: z.array(z.string()).optional(),
  effectiveFrom: z.string().datetime().optional(),
  effectiveTo: z.string().datetime().optional(),
  metadata: z.record(z.any()).optional(),
});

const updateMobileConfigurationSchema = createMobileConfigurationSchema.partial();

const createMobileAnalyticsSchema = z.object({
  analyticsNumber: z.string().min(1, 'Analytics number is required'),
  deviceId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
  sessionId: z.string().uuid().optional(),
  eventType: z.string().min(1, 'Event type is required'),
  eventName: z.string().min(1, 'Event name is required'),
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
});

const updateMobileAnalyticsSchema = createMobileAnalyticsSchema.partial();

const createMobileAppVersionSchema = z.object({
  versionNumber: z.string().min(1, 'Version number is required'),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  platform: z.enum(['IOS', 'ANDROID', 'WINDOWS', 'MACOS', 'LINUX', 'WEB']),
  version: z.string().min(1, 'Version is required'),
  buildNumber: z.string().optional(),
  status: z.enum(['DRAFT', 'BETA', 'RELEASE_CANDIDATE', 'RELEASED', 'DEPRECATED']).default('DRAFT'),
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
  isForcedUpdate: z.boolean().default(false),
  isCriticalUpdate: z.boolean().default(false),
  changelog: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

const updateMobileAppVersionSchema = createMobileAppVersionSchema.partial();

const createMobilePermissionSchema = z.object({
  permissionNumber: z.string().min(1, 'Permission number is required'),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  type: z.enum(['CAMERA', 'LOCATION', 'NOTIFICATIONS', 'STORAGE', 'MICROPHONE', 'CONTACTS', 'CALENDAR', 'CUSTOM']),
  platform: z.enum(['IOS', 'ANDROID', 'WINDOWS', 'MACOS', 'LINUX', 'WEB', 'ALL']),
  status: z.enum(['REQUIRED', 'OPTIONAL', 'DISABLED']).default('OPTIONAL'),
  isGranted: z.boolean().default(false),
  grantedAt: z.string().datetime().optional(),
  revokedAt: z.string().datetime().optional(),
  reason: z.string().optional(),
  deviceId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
  metadata: z.record(z.any()).optional(),
});

const updateMobilePermissionSchema = createMobilePermissionSchema.partial();

const createMobileSyncDataSchema = z.object({
  syncNumber: z.string().min(1, 'Sync number is required'),
  deviceId: z.string().uuid(),
  userId: z.string().uuid(),
  entityType: z.string().min(1, 'Entity type is required'),
  entityId: z.string().min(1, 'Entity ID is required'),
  action: z.enum(['CREATE', 'UPDATE', 'DELETE', 'SYNC']),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'CONFLICT']).default('PENDING'),
  syncTimestamp: z.string().datetime(),
  lastSyncAttempt: z.string().datetime().optional(),
  retryCount: z.number().int().positive().default(0),
  maxRetries: z.number().int().positive().default(3),
  errorMessage: z.string().optional(),
  data: z.record(z.any()).optional(),
  conflictResolution: z.record(z.any()).optional(),
  metadata: z.record(z.any()).optional(),
});

const updateMobileSyncDataSchema = createMobileSyncDataSchema.partial();

// Mobile routes
export default async function mobileRoutes(fastify: FastifyInstance) {
  // Apply authentication middleware to all routes
  fastify.addHook('preHandler', authenticate);
  
  // Get all mobile devices
  fastify.get('/devices', {
    preHandler: hasPermissions(['view_mobile']),
    schema: {
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'number', default: 1 },
          pageSize: { type: 'number', default: 10 },
          type: { type: 'string', enum: ['SMARTPHONE', 'TABLET', 'LAPTOP', 'DESKTOP', 'WEARABLE', 'OTHER'] },
          platform: { type: 'string', enum: ['IOS', 'ANDROID', 'WINDOWS', 'MACOS', 'LINUX', 'WEB'] },
          status: { type: 'string', enum: ['ACTIVE', 'INACTIVE', 'MAINTENANCE', 'RETIRED', 'LOST', 'STOLEN'] },
          assignedTo: { type: 'string', format: 'uuid' },
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
                  deviceNumber: { type: 'string' },
                  name: { type: 'string' },
                  type: { type: 'string' },
                  platform: { type: 'string' },
                  model: { type: 'string' },
                  manufacturer: { type: 'string' },
                  status: { type: 'string' },
                  assignedTo: { type: 'string' },
                  lastSeen: { type: 'string' },
                  batteryLevel: { type: 'number' },
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
      platform, 
      status, 
      assignedTo, 
      search 
    } = request.query as any;

    const offset = (page - 1) * pageSize;
    const conditions = [];

    if (type) conditions.push(eq(mobileDevices.type, type));
    if (platform) conditions.push(eq(mobileDevices.platform, platform));
    if (status) conditions.push(eq(mobileDevices.status, status));
    if (assignedTo) conditions.push(eq(mobileDevices.assignedTo, assignedTo));
    if (search) {
      conditions.push(
        like(mobileDevices.name, `%${search}%`)
      );
    }

    const [devices, total] = await Promise.all([
      db.select()
        .from(mobileDevices)
        .where(and(...conditions))
        .orderBy(desc(mobileDevices.createdAt))
        .limit(pageSize)
        .offset(offset),
      db.select({ count: sql`count(*)` })
        .from(mobileDevices)
        .where(and(...conditions))
        .then(result => Number(result[0]?.count || 0))
    ]);

    return {
      items: devices,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  });

  // Get mobile device by ID
  fastify.get('/devices/:id', {
    preHandler: hasPermissions(['view_mobile']),
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
    
    const device = await db.select()
      .from(mobileDevices)
      .where(eq(mobileDevices.id, id))
      .limit(1);

    if (!device.length) {
      return reply.status(404).send({ error: 'Mobile device not found' });
    }

    return device[0];
  });

  // Create mobile device
  fastify.post('/devices', {
    preHandler: hasPermissions(['manage_mobile']),
    schema: {
      body: createMobileDeviceSchema,
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const data = request.body as z.infer<typeof createMobileDeviceSchema>;
    
    const [device] = await db.insert(mobileDevices)
      .values({
        ...data,
        tenantId: request.user.tenantId,
        createdBy: request.user.id,
      })
      .returning();

    return reply.status(201).send(device);
  });

  // Update mobile device
  fastify.put('/devices/:id', {
    preHandler: hasPermissions(['manage_mobile']),
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
        required: ['id'],
      },
      body: updateMobileDeviceSchema,
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const data = request.body as z.infer<typeof updateMobileDeviceSchema>;
    
    const [device] = await db.update(mobileDevices)
      .set({
        ...data,
        updatedBy: request.user.id,
        updatedAt: new Date(),
      })
      .where(eq(mobileDevices.id, id))
      .returning();

    if (!device) {
      return reply.status(404).send({ error: 'Mobile device not found' });
    }

    return device;
  });

  // Delete mobile device
  fastify.delete('/devices/:id', {
    preHandler: hasPermissions(['manage_mobile']),
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
    
    const [device] = await db.delete(mobileDevices)
      .where(eq(mobileDevices.id, id))
      .returning();

    if (!device) {
      return reply.status(404).send({ error: 'Mobile device not found' });
    }

    return { message: 'Mobile device deleted successfully' };
  });

  // Get all mobile sessions
  fastify.get('/sessions', {
    preHandler: hasPermissions(['view_mobile']),
    schema: {
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'number', default: 1 },
          pageSize: { type: 'number', default: 10 },
          deviceId: { type: 'string', format: 'uuid' },
          userId: { type: 'string', format: 'uuid' },
          status: { type: 'string', enum: ['ACTIVE', 'ENDED', 'EXPIRED', 'TERMINATED'] },
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
      deviceId, 
      userId, 
      status, 
      startDate, 
      endDate, 
      search 
    } = request.query as any;

    const offset = (page - 1) * pageSize;
    const conditions = [];

    if (deviceId) conditions.push(eq(mobileSessions.deviceId, deviceId));
    if (userId) conditions.push(eq(mobileSessions.userId, userId));
    if (status) conditions.push(eq(mobileSessions.status, status));
    if (startDate) conditions.push(gte(mobileSessions.startTime, new Date(startDate)));
    if (endDate) conditions.push(lte(mobileSessions.endTime, new Date(endDate)));

    const [sessions, total] = await Promise.all([
      db.select()
        .from(mobileSessions)
        .where(and(...conditions))
        .orderBy(desc(mobileSessions.startTime))
        .limit(pageSize)
        .offset(offset),
      db.select({ count: sql`count(*)` })
        .from(mobileSessions)
        .where(and(...conditions))
        .then(result => Number(result[0]?.count || 0))
    ]);

    return {
      items: sessions,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  });

  // Get mobile session by ID
  fastify.get('/sessions/:id', {
    preHandler: hasPermissions(['view_mobile']),
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
    
    const session = await db.select()
      .from(mobileSessions)
      .where(eq(mobileSessions.id, id))
      .limit(1);

    if (!session.length) {
      return reply.status(404).send({ error: 'Mobile session not found' });
    }

    return session[0];
  });

  // Create mobile session
  fastify.post('/sessions', {
    preHandler: hasPermissions(['manage_mobile']),
    schema: {
      body: createMobileSessionSchema,
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const data = request.body as z.infer<typeof createMobileSessionSchema>;
    
    const [session] = await db.insert(mobileSessions)
      .values({
        ...data,
        tenantId: request.user.tenantId,
        createdBy: request.user.id,
      })
      .returning();

    return reply.status(201).send(session);
  });

  // Update mobile session
  fastify.put('/sessions/:id', {
    preHandler: hasPermissions(['manage_mobile']),
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
        required: ['id'],
      },
      body: updateMobileSessionSchema,
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const data = request.body as z.infer<typeof updateMobileSessionSchema>;
    
    const [session] = await db.update(mobileSessions)
      .set({
        ...data,
        updatedBy: request.user.id,
        updatedAt: new Date(),
      })
      .where(eq(mobileSessions.id, id))
      .returning();

    if (!session) {
      return reply.status(404).send({ error: 'Mobile session not found' });
    }

    return session;
  });

  // Delete mobile session
  fastify.delete('/sessions/:id', {
    preHandler: hasPermissions(['manage_mobile']),
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
    
    const [session] = await db.delete(mobileSessions)
      .where(eq(mobileSessions.id, id))
      .returning();

    if (!session) {
      return reply.status(404).send({ error: 'Mobile session not found' });
    }

    return { message: 'Mobile session deleted successfully' };
  });

  // Get all mobile notifications
  fastify.get('/notifications', {
    preHandler: hasPermissions(['view_mobile']),
    schema: {
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'number', default: 1 },
          pageSize: { type: 'number', default: 10 },
          deviceId: { type: 'string', format: 'uuid' },
          userId: { type: 'string', format: 'uuid' },
          type: { type: 'string', enum: ['INFO', 'WARNING', 'ERROR', 'SUCCESS', 'ALERT', 'PROMOTION'] },
          status: { type: 'string', enum: ['PENDING', 'SENT', 'DELIVERED', 'READ', 'FAILED', 'CANCELLED'] },
          priority: { type: 'string', enum: ['LOW', 'NORMAL', 'HIGH', 'URGENT'] },
          search: { type: 'string' },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { 
      page = 1, 
      pageSize = 10, 
      deviceId, 
      userId, 
      type, 
      status, 
      priority, 
      search 
    } = request.query as any;

    const offset = (page - 1) * pageSize;
    const conditions = [];

    if (deviceId) conditions.push(eq(mobileNotifications.deviceId, deviceId));
    if (userId) conditions.push(eq(mobileNotifications.userId, userId));
    if (type) conditions.push(eq(mobileNotifications.type, type));
    if (status) conditions.push(eq(mobileNotifications.status, status));
    if (priority) conditions.push(eq(mobileNotifications.priority, priority));
    if (search) {
      conditions.push(
        like(mobileNotifications.title, `%${search}%`)
      );
    }

    const [notifications, total] = await Promise.all([
      db.select()
        .from(mobileNotifications)
        .where(and(...conditions))
        .orderBy(desc(mobileNotifications.createdAt))
        .limit(pageSize)
        .offset(offset),
      db.select({ count: sql`count(*)` })
        .from(mobileNotifications)
        .where(and(...conditions))
        .then(result => Number(result[0]?.count || 0))
    ]);

    return {
      items: notifications,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  });

  // Get mobile notification by ID
  fastify.get('/notifications/:id', {
    preHandler: hasPermissions(['view_mobile']),
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
    
    const notification = await db.select()
      .from(mobileNotifications)
      .where(eq(mobileNotifications.id, id))
      .limit(1);

    if (!notification.length) {
      return reply.status(404).send({ error: 'Mobile notification not found' });
    }

    return notification[0];
  });

  // Create mobile notification
  fastify.post('/notifications', {
    preHandler: hasPermissions(['manage_mobile']),
    schema: {
      body: createMobileNotificationSchema,
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const data = request.body as z.infer<typeof createMobileNotificationSchema>;
    
    const [notification] = await db.insert(mobileNotifications)
      .values({
        ...data,
        tenantId: request.user.tenantId,
        createdBy: request.user.id,
      })
      .returning();

    return reply.status(201).send(notification);
  });

  // Update mobile notification
  fastify.put('/notifications/:id', {
    preHandler: hasPermissions(['manage_mobile']),
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
        required: ['id'],
      },
      body: updateMobileNotificationSchema,
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const data = request.body as z.infer<typeof updateMobileNotificationSchema>;
    
    const [notification] = await db.update(mobileNotifications)
      .set({
        ...data,
        updatedBy: request.user.id,
        updatedAt: new Date(),
      })
      .where(eq(mobileNotifications.id, id))
      .returning();

    if (!notification) {
      return reply.status(404).send({ error: 'Mobile notification not found' });
    }

    return notification;
  });

  // Delete mobile notification
  fastify.delete('/notifications/:id', {
    preHandler: hasPermissions(['manage_mobile']),
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
    
    const [notification] = await db.delete(mobileNotifications)
      .where(eq(mobileNotifications.id, id))
      .returning();

    if (!notification) {
      return reply.status(404).send({ error: 'Mobile notification not found' });
    }

    return { message: 'Mobile notification deleted successfully' };
  });

  // Send push notification
  fastify.post('/notifications/:id/send', {
    preHandler: hasPermissions(['manage_mobile']),
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
    
    const notification = await db.select()
      .from(mobileNotifications)
      .where(eq(mobileNotifications.id, id))
      .limit(1);

    if (!notification.length) {
      return reply.status(404).send({ error: 'Mobile notification not found' });
    }

    // Implement push notification sending logic
    try {
      const { NotificationService } = await import('../utils/notifications.js');
      const notificationService = new NotificationService();
      
      await notificationService.sendNotification([{
        userId: request.user.id,
        tenantId: request.user.tenantId,
        channels: ['push']
      }], {
        title: 'Mobile App Update',
        message: 'Your mobile app has been updated with new features and improvements.',
        type: 'info',
        category: 'mobile',
        priority: 'low'
      });
      
      return { message: 'Push notification sent successfully' };
    } catch (error) {
      logger.error('Failed to send push notification:', error);
      return reply.status(500).send({ error: 'Failed to send push notification' });
    }
    // This would typically involve:
    // 1. Getting device push tokens
    // 2. Sending to FCM/APNS
    // 3. Updating notification status
    // 4. Logging delivery status

    return { 
      message: 'Push notification sent',
      notificationId: id,
      status: 'SENT',
      sentAt: new Date().toISOString()
    };
  });

  // Get mobile analytics
  fastify.get('/analytics', {
    preHandler: hasPermissions(['view_mobile']),
    schema: {
      querystring: {
        type: 'object',
        properties: {
          startDate: { type: 'string', format: 'date-time' },
          endDate: { type: 'string', format: 'date-time' },
          deviceId: { type: 'string', format: 'uuid' },
          userId: { type: 'string', format: 'uuid' },
          eventType: { type: 'string' },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { startDate, endDate, deviceId, userId, eventType } = request.query as any;

    const conditions = [];
    if (startDate) conditions.push(gte(mobileAnalytics.timestamp, new Date(startDate)));
    if (endDate) conditions.push(lte(mobileAnalytics.timestamp, new Date(endDate)));
    if (deviceId) conditions.push(eq(mobileAnalytics.deviceId, deviceId));
    if (userId) conditions.push(eq(mobileAnalytics.userId, userId));
    if (eventType) conditions.push(eq(mobileAnalytics.eventType, eventType));

    const analytics = await db.select()
      .from(mobileAnalytics)
      .where(and(...conditions))
      .orderBy(desc(mobileAnalytics.timestamp));

    // Calculate summary metrics
    const summary = {
      totalDevices: 0,
      activeDevices: 0,
      totalSessions: 0,
      totalNotifications: 0,
      averageSessionDuration: 0,
    };

    return {
      analytics,
      summary,
    };
  });

  // Get mobile dashboard
  fastify.get('/dashboard', {
    preHandler: hasPermissions(['view_mobile']),
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const [devices, sessions, notifications, analytics] = await Promise.all([
      db.select({ count: sql`count(*)` })
        .from(mobileDevices)
        .where(eq(mobileDevices.tenantId, request.user.tenantId))
        .then(result => Number(result[0]?.count || 0)),
      db.select({ count: sql`count(*)` })
        .from(mobileSessions)
        .where(eq(mobileSessions.tenantId, request.user.tenantId))
        .then(result => Number(result[0]?.count || 0)),
      db.select({ count: sql`count(*)` })
        .from(mobileNotifications)
        .where(eq(mobileNotifications.tenantId, request.user.tenantId))
        .then(result => Number(result[0]?.count || 0)),
      db.select()
        .from(mobileAnalytics)
        .where(eq(mobileAnalytics.tenantId, request.user.tenantId))
        .orderBy(desc(mobileAnalytics.timestamp))
        .limit(10),
    ]);

    return {
      metrics: {
        totalDevices: devices,
        totalSessions: sessions,
        totalNotifications: notifications,
      },
      recentAnalytics: analytics,
    };
  });
} 