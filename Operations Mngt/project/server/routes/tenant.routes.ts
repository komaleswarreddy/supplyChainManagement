import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { db } from '../db';
import { tenants, tenantUsers, tenantInvitations } from '../db/schema/tenants';
import { users } from '../db/schema/users';
import { eq, and } from 'drizzle-orm';
import { AppError } from '../utils/app-error';
import { authenticate, hasPermissions } from '../middleware/auth';
import { TenantRequest } from '../middleware/tenant';
import { randomUUID } from 'crypto';

// Define route schemas
const createTenantSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  domain: z.string().url('Must be a valid URL').optional(),
  plan: z.enum(['BASIC', 'PROFESSIONAL', 'ENTERPRISE']).default('BASIC'),
  settings: z.record(z.any()).optional(),
});

const updateTenantSchema = createTenantSchema.partial();

const inviteUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  role: z.enum(['ADMIN', 'USER', 'MANAGER']).default('USER'),
});

// Tenant routes
export default async function tenantRoutes(fastify: FastifyInstance) {
  // Get current tenant
  fastify.get('/current', {
    preHandler: authenticate,
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            slug: { type: 'string' },
            domain: { type: 'string' },
            plan: { type: 'string' },
            settings: { type: 'object' },
            userRole: { type: 'string' },
            isOwner: { type: 'boolean' },
          },
        },
      },
    },
  }, async (request: TenantRequest & { user?: any }, reply: FastifyReply) => {
    if (!request.tenant) {
      throw new AppError('No tenant selected', 404);
    }
    
    // Get tenant user info
    const tenantUser = await db.select()
      .from(tenantUsers)
      .where(
        and(
          eq(tenantUsers.tenantId, request.tenant.id),
          eq(tenantUsers.userId, request.user.id)
        )
      )
      .limit(1);
    
    return {
      ...request.tenant,
      userRole: tenantUser[0]?.role || 'USER',
      isOwner: tenantUser[0]?.isOwner || false,
    };
  });
  
  // Create tenant
  fastify.post('/', {
    preHandler: authenticate,
    schema: {
      body: {
        type: 'object',
        required: ['name', 'slug'],
        properties: {
          name: { type: 'string' },
          slug: { type: 'string' },
          domain: { type: 'string' },
          plan: { type: 'string', enum: ['BASIC', 'PROFESSIONAL', 'ENTERPRISE'] },
          settings: { type: 'object' },
        },
      },
      response: {
        201: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            slug: { type: 'string' },
            message: { type: 'string' },
          },
        },
      },
    },
  }, async (request: any, reply: FastifyReply) => {
    try {
      const tenantData = createTenantSchema.parse(request.body);
      
      // Check if slug already exists
      const existingTenant = await db.select({ id: tenants.id }).from(tenants).where(eq(tenants.slug, tenantData.slug)).limit(1);
      
      if (existingTenant.length) {
        throw new AppError('Tenant with this slug already exists', 409);
      }
      
      // Start a transaction
      const result = await db.transaction(async (tx) => {
        // Create tenant
        const [newTenant] = await tx.insert(tenants).values({
          ...tenantData,
          createdBy: request.user.id,
        }).returning({ id: tenants.id, name: tenants.name, slug: tenants.slug });
        
        // Add current user as tenant owner
        await tx.insert(tenantUsers).values({
          tenantId: newTenant.id,
          userId: request.user.id,
          role: 'ADMIN',
          isOwner: true,
        });
        
        return newTenant;
      });
      
      reply.status(201);
      return {
        ...result,
        message: 'Tenant created successfully',
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new AppError('Validation error', 400, error.errors);
      }
      throw error;
    }
  });
  
  // Update tenant
  fastify.put('/:id', {
    preHandler: [authenticate, hasPermissions(['manage_settings'])],
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
      },
      body: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          slug: { type: 'string' },
          domain: { type: 'string' },
          plan: { type: 'string', enum: ['BASIC', 'PROFESSIONAL', 'ENTERPRISE'] },
          settings: { type: 'object' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            message: { type: 'string' },
          },
        },
      },
    },
  }, async (request: TenantRequest & { user?: any }, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const tenantData = updateTenantSchema.parse(request.body);
      
      // Check if tenant exists
      const existingTenant = await db.select({ id: tenants.id }).from(tenants).where(eq(tenants.id, id)).limit(1);
      
      if (!existingTenant.length) {
        throw new AppError('Tenant not found', 404);
      }
      
      // Check if user has access to tenant
      const tenantUser = await db.select()
        .from(tenantUsers)
        .where(
          and(
            eq(tenantUsers.tenantId, id),
            eq(tenantUsers.userId, request.user.id)
          )
        )
        .limit(1);
      
      if (!tenantUser.length || (!tenantUser[0].isOwner && tenantUser[0].role !== 'ADMIN')) {
        throw new AppError('You do not have permission to update this tenant', 403);
      }
      
      // Check if slug is being changed and if it already exists
      if (tenantData.slug && tenantData.slug !== request.tenant?.slug) {
        const existingSlug = await db.select({ id: tenants.id }).from(tenants).where(eq(tenants.slug, tenantData.slug)).limit(1);
        
        if (existingSlug.length) {
          throw new AppError('Tenant with this slug already exists', 409);
        }
      }
      
      // Update tenant
      await db.update(tenants).set({
        ...tenantData,
        updatedAt: new Date().toISOString(),
      }).where(eq(tenants.id, id));
      
      return {
        id,
        message: 'Tenant updated successfully',
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new AppError('Validation error', 400, error.errors);
      }
      throw error;
    }
  });
  
  // Get tenant users
  fastify.get('/:id/users', {
    preHandler: [authenticate, hasPermissions(['manage_users'])],
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
      },
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              userId: { type: 'string' },
              email: { type: 'string' },
              name: { type: 'string' },
              role: { type: 'string' },
              isOwner: { type: 'boolean' },
              status: { type: 'string' },
              createdAt: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
    },
  }, async (request: TenantRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    
    // Check if tenant exists
    const existingTenant = await db.select({ id: tenants.id }).from(tenants).where(eq(tenants.id, id)).limit(1);
    
    if (!existingTenant.length) {
      throw new AppError('Tenant not found', 404);
    }
    
    // Get tenant users with user info
    const tenantUsersList = await db.select({
      id: tenantUsers.id,
      userId: tenantUsers.userId,
      email: users.email,
      name: users.name,
      role: tenantUsers.role,
      isOwner: tenantUsers.isOwner,
      status: tenantUsers.status,
      createdAt: tenantUsers.createdAt,
    })
    .from(tenantUsers)
    .innerJoin(users, eq(tenantUsers.userId, users.id))
    .where(eq(tenantUsers.tenantId, id));
    
    return tenantUsersList;
  });
  
  // Invite user to tenant
  fastify.post('/:id/invitations', {
    preHandler: [authenticate, hasPermissions(['manage_users'])],
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
      },
      body: {
        type: 'object',
        required: ['email'],
        properties: {
          email: { type: 'string', format: 'email' },
          role: { type: 'string', enum: ['ADMIN', 'USER', 'MANAGER'] },
        },
      },
      response: {
        201: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            message: { type: 'string' },
          },
        },
      },
    },
  }, async (request: any, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const inviteData = inviteUserSchema.parse(request.body);
      
      // Check if tenant exists
      const existingTenant = await db.select({ id: tenants.id }).from(tenants).where(eq(tenants.id, id)).limit(1);
      
      if (!existingTenant.length) {
        throw new AppError('Tenant not found', 404);
      }
      
      // Check if user already exists
      const existingUser = await db.select({ id: users.id }).from(users).where(eq(users.email, inviteData.email)).limit(1);
      
      // If user exists, check if they're already in the tenant
      if (existingUser.length) {
        const existingTenantUser = await db.select({ id: tenantUsers.id })
          .from(tenantUsers)
          .where(
            and(
              eq(tenantUsers.tenantId, id),
              eq(tenantUsers.userId, existingUser[0].id)
            )
          )
          .limit(1);
        
        if (existingTenantUser.length) {
          throw new AppError('User is already a member of this tenant', 409);
        }
      }
      
      // Generate invitation token
      const token = randomUUID();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry
      
      // Create invitation
      const [invitation] = await db.insert(tenantInvitations).values({
        tenantId: id,
        email: inviteData.email,
        role: inviteData.role,
        token,
        expiresAt: expiresAt.toISOString(),
        createdBy: request.user.id,
      }).returning({ id: tenantInvitations.id, email: tenantInvitations.email });
      
      // Send invitation email
    try {
      const { NotificationService } = await import('../utils/notifications.js');
      const notificationService = new NotificationService();
      
      await notificationService.sendNotification([{
        userId: user.id,
        tenantId: tenant.id,
        channels: ['email']
      }], {
        title: 'Welcome to PLS-SCM Operations Management',
        message: `You have been invited to join ${tenant.name}. Please complete your account setup to get started.`,
        type: 'info',
        category: 'invitation',
        priority: 'medium',
        actionUrl: `${process.env.FRONTEND_URL}/setup-account?token=${invitationToken}`
      });
    } catch (error) {
      logger.error('Failed to send invitation email:', error);
      // Don't fail the user creation if email fails
    }
      
      reply.status(201);
      return {
        ...invitation,
        message: 'Invitation sent successfully',
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new AppError('Validation error', 400, error.errors);
      }
      throw error;
    }
  });
  
  // Accept invitation
  fastify.post('/invitations/:token/accept', {
    preHandler: authenticate,
    schema: {
      params: {
        type: 'object',
        required: ['token'],
        properties: {
          token: { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            tenantId: { type: 'string' },
            tenantName: { type: 'string' },
            message: { type: 'string' },
          },
        },
      },
    },
  }, async (request: any, reply: FastifyReply) => {
    const { token } = request.params as { token: string };
    
    // Get invitation
    const invitation = await db.select()
      .from(tenantInvitations)
      .innerJoin(tenants, eq(tenantInvitations.tenantId, tenants.id))
      .where(eq(tenantInvitations.token, token))
      .limit(1);
    
    if (!invitation.length) {
      throw new AppError('Invitation not found or has expired', 404);
    }
    
    const [{ tenant_invitations: inviteData, tenants: tenantData }] = invitation;
    
    // Check if invitation has expired
    if (new Date(inviteData.expiresAt) < new Date()) {
      throw new AppError('Invitation has expired', 400);
    }
    
    // Check if invitation is pending
    if (inviteData.status !== 'PENDING') {
      throw new AppError('Invitation has already been used', 400);
    }
    
    // Check if email matches
    if (inviteData.email !== request.user.email) {
      throw new AppError('Invitation email does not match your account', 400);
    }
    
    // Start a transaction
    await db.transaction(async (tx) => {
      // Add user to tenant
      await tx.insert(tenantUsers).values({
        tenantId: inviteData.tenantId,
        userId: request.user.id,
        role: inviteData.role,
        isOwner: false,
      });
      
      // Update invitation status
      await tx.update(tenantInvitations)
        .set({
          status: 'ACCEPTED',
          updatedAt: new Date().toISOString(),
        })
        .where(eq(tenantInvitations.id, inviteData.id));
    });
    
    return {
      tenantId: tenantData.id,
      tenantName: tenantData.name,
      message: 'Invitation accepted successfully',
    };
  });
  
  // Switch tenant
  fastify.post('/switch/:id', {
    preHandler: authenticate,
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            tenantId: { type: 'string' },
            tenantName: { type: 'string' },
            message: { type: 'string' },
          },
        },
      },
    },
  }, async (request: any, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    
    // Check if tenant exists
    const tenant = await db.select().from(tenants).where(eq(tenants.id, id)).limit(1);
    
    if (!tenant.length) {
      throw new AppError('Tenant not found', 404);
    }
    
    // Check if user has access to tenant
    const tenantUser = await db.select()
      .from(tenantUsers)
      .where(
        and(
          eq(tenantUsers.tenantId, id),
          eq(tenantUsers.userId, request.user.id)
        )
      )
      .limit(1);
    
    if (!tenantUser.length) {
      throw new AppError('You do not have access to this tenant', 403);
    }
    
    // Update user's current tenant
    await db.update(users)
      .set({
        currentTenantId: id,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(users.id, request.user.id));
    
    return {
      tenantId: tenant[0].id,
      tenantName: tenant[0].name,
      message: 'Tenant switched successfully',
    };
  });
  
  // Get user's tenants
  fastify.get('/user/tenants', {
    preHandler: authenticate,
    schema: {
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              slug: { type: 'string' },
              role: { type: 'string' },
              isOwner: { type: 'boolean' },
              isCurrent: { type: 'boolean' },
            },
          },
        },
      },
    },
  }, async (request: any, reply: FastifyReply) => {
    // Get user's tenants
    const userTenants = await db.select({
      id: tenants.id,
      name: tenants.name,
      slug: tenants.slug,
      role: tenantUsers.role,
      isOwner: tenantUsers.isOwner,
    })
    .from(tenantUsers)
    .innerJoin(tenants, eq(tenantUsers.tenantId, tenants.id))
    .where(eq(tenantUsers.userId, request.user.id));
    
    // Get user's current tenant
    const user = await db.select({ currentTenantId: users.currentTenantId })
      .from(users)
      .where(eq(users.id, request.user.id))
      .limit(1);
    
    // Add isCurrent flag
    const tenantsWithCurrent = userTenants.map(tenant => ({
      ...tenant,
      isCurrent: tenant.id === user[0].currentTenantId,
    }));
    
    return tenantsWithCurrent;
  });
}