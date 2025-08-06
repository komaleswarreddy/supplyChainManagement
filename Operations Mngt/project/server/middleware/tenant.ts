import { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';
import { db } from '../db';
import { tenants, tenantUsers } from '../db/schema/tenants';
import { eq, and } from 'drizzle-orm';
import { AppError } from '../utils/app-error';
import { logger } from '../utils/logger';
import { users } from '../db/schema/users';

// Interface for the tenant request
export interface TenantRequest extends FastifyRequest {
  tenant?: {
    id: string;
    name: string;
    slug: string;
    settings?: Record<string, any>;
  };
}

// Middleware to resolve tenant from header or subdomain
export const resolveTenant = async (
  request: TenantRequest,
  reply: FastifyReply,
  next: () => void
) => {
  try {
    // Get tenant from header
    const tenantId = request.headers['x-tenant-id'] as string;
    const tenantSlug = request.headers['x-tenant-slug'] as string;
    
    // If no tenant info provided, check subdomain
    if (!tenantId && !tenantSlug) {
      const host = request.headers.host;
      if (host && host.includes('.')) {
        const subdomain = host.split('.')[0];
        if (subdomain !== 'www' && subdomain !== 'app') {
          // Look up tenant by subdomain
          const tenant = await db.select().from(tenants).where(eq(tenants.slug, subdomain)).limit(1);
          if (tenant.length) {
            request.tenant = {
              id: tenant[0].id,
              name: tenant[0].name,
              slug: tenant[0].slug,
              settings: tenant[0].settings,
            };
            return next();
          }
        }
      }
      
      // If user is authenticated, try to get their current tenant
      if (request.user) {
        const user = await db.select({ currentTenantId: users.currentTenantId })
          .from(users)
          .where(eq(users.id, request.user.id))
          .limit(1);
        
        if (user.length && user[0].currentTenantId) {
          const tenant = await db.select().from(tenants).where(eq(tenants.id, user[0].currentTenantId)).limit(1);
          if (tenant.length) {
            request.tenant = {
              id: tenant[0].id,
              name: tenant[0].name,
              slug: tenant[0].slug,
              settings: tenant[0].settings,
            };
            return next();
          }
        }
      }
      
      // No tenant found, but we'll allow the request to continue
      // This is useful for public routes or tenant creation
      return next();
    }
    
    // Look up tenant by ID or slug
    let tenant;
    if (tenantId) {
      tenant = await db.select().from(tenants).where(eq(tenants.id, tenantId)).limit(1);
    } else if (tenantSlug) {
      tenant = await db.select().from(tenants).where(eq(tenants.slug, tenantSlug)).limit(1);
    }
    
    if (!tenant || !tenant.length) {
      throw new AppError('Tenant not found', 404);
    }
    
    // Check if tenant is active
    if (tenant[0].status !== 'ACTIVE') {
      throw new AppError('Tenant is not active', 403);
    }
    
    // Set tenant in request
    request.tenant = {
      id: tenant[0].id,
      name: tenant[0].name,
      slug: tenant[0].slug,
      settings: tenant[0].settings,
    };
    
    next();
  } catch (error) {
    logger.error('Error resolving tenant', { error });
    
    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({ message: error.message });
    }
    
    return reply.status(500).send({ message: 'Error resolving tenant' });
  }
};

// Middleware to verify user has access to tenant
export const verifyTenantAccess = async (
  request: TenantRequest & { user?: any },
  reply: FastifyReply,
  next: () => void
) => {
  try {
    // Skip if no tenant or no user
    if (!request.tenant || !request.user) {
      return next();
    }
    
    // Check if user has access to tenant
    const tenantUser = await db.select()
      .from(tenantUsers)
      .where(
        and(
          eq(tenantUsers.tenantId, request.tenant.id),
          eq(tenantUsers.userId, request.user.id)
        )
      )
      .limit(1);
    
    if (!tenantUser.length) {
      throw new AppError('User does not have access to this tenant', 403);
    }
    
    // Add tenant user info to request
    request.user.tenantRole = tenantUser[0].role;
    request.user.isOwner = tenantUser[0].isOwner;
    
    // Update user's current tenant if it's different
    if (request.user.currentTenantId !== request.tenant.id) {
      await db.update(users)
        .set({ currentTenantId: request.tenant.id })
        .where(eq(users.id, request.user.id));
    }
    
    next();
  } catch (error) {
    logger.error('Error verifying tenant access', { error });
    
    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({ message: error.message });
    }
    
    return reply.status(500).send({ message: 'Error verifying tenant access' });
  }
};

// Helper function to get tenant ID from request
export const getTenantId = (request: TenantRequest): string => {
  if (!request.tenant) {
    throw new AppError('Tenant not found', 404);
  }
  return request.tenant.id;
};

// Register tenant middleware
export default async function tenantMiddleware(fastify: FastifyInstance) {
  // Add tenant middleware to all routes
  fastify.addHook('preHandler', resolveTenant);
  
  // Add tenant access middleware after authentication
  fastify.addHook('preHandler', verifyTenantAccess);
}