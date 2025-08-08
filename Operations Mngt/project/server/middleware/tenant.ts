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
  reply: FastifyReply
) => {
  try {
    // Get tenant from header
    const tenantId = request.headers['x-tenant-id'] as string;
    const tenantSlug = request.headers['x-tenant-slug'] as string;
    
    console.log('Tenant resolution - Headers:', {
      tenantId,
      tenantSlug,
      allHeaders: request.headers
    });
    
    // If tenant ID is provided in header, use it directly
    if (tenantId) {
      console.log('Using tenant ID from header:', tenantId);
      // For development, we'll create a basic tenant object
      request.tenant = {
        id: tenantId,
        name: 'Demo Company',
        slug: 'demo-supplier-test',
        settings: { theme: 'light', timezone: 'UTC' },
      };
      return;
    }
    
    // If no tenant info provided, check subdomain
    if (!tenantSlug) {
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
            return;
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
            return;
          }
        }
      }
      
      // In development mode, set a default tenant if none found
      if (process.env.NODE_ENV === 'development') {
        console.log('Setting default tenant for development');
        request.tenant = {
          id: '550e8400-e29b-41d4-a716-446655440001',
          name: 'Demo Company',
          slug: 'demo-supplier-test',
          settings: { theme: 'light', timezone: 'UTC' },
        };
        return;
      }
      
      // No tenant found, but we'll allow the request to continue
      // This is useful for public routes or tenant creation
      console.log('No tenant found, allowing request to continue');
      return;
    }
    
    // Look up tenant by slug
    const tenant = await db.select().from(tenants).where(eq(tenants.slug, tenantSlug)).limit(1);
    
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
  } catch (error) {
    logger.error('Error resolving tenant', { error });
    
    if (error instanceof AppError) {
      throw error;
    }
    
    throw new AppError('Error resolving tenant', 500);
  }
};

// Middleware to verify user has access to tenant
export const verifyTenantAccess = async (
  request: TenantRequest & { user?: any },
  reply: FastifyReply
) => {
  try {
    // Skip if no tenant or no user
    if (!request.tenant || !request.user) {
      return;
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
  } catch (error) {
    logger.error('Error verifying tenant access', { error });
    
    if (error instanceof AppError) {
      throw error;
    }
    
    throw new AppError('Error verifying tenant access', 500);
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