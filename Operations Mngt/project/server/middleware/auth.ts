import { FastifyRequest, FastifyReply } from 'fastify';
import { AUTH_CONFIG, SERVER_CONFIG } from '../config';
import { AppError } from '../utils/app-error';
import { logger } from '../utils/logger';
import { verifyToken, verifyKeycloakToken, createOrUpdateUserFromKeycloak } from '../utils/auth';

// Interface for the authenticated request
export interface AuthenticatedRequest extends FastifyRequest {
  user?: {
    id: string;
    email: string;
    name: string;
    roles: string[];
    permissions: string[];
    tenantRole?: string;
    isOwner?: boolean;
    currentTenantId?: string;
  };
}

// Middleware to verify JWT token
export const authenticate = async (
  request: AuthenticatedRequest,
  reply: FastifyReply
) => {
  try {
    // In development mode, allow requests without authentication for testing
    if (SERVER_CONFIG.environment === 'development') {
      // Set a default user for development
      request.user = {
        id: 'dev-user-1',
        email: 'dev@example.com',
        name: 'Development User',
        roles: ['admin'],
        permissions: ['manage_suppliers', 'view_suppliers', 'manage_users'],
        currentTenantId: '550e8400-e29b-41d4-a716-446655440001', // Use the tenant from sample data
      };
      return;
    }

    // Get the authorization header
    const authHeader = request.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Unauthorized - No token provided', 401);
    }
    
    // Extract the token
    const token = authHeader.split(' ')[1];
    
    // Check if we're using Keycloak or local JWT
    if (AUTH_CONFIG.keycloakUrl) {
      // Verify Keycloak token
      const decoded = await verifyKeycloakToken(token);
      
      // Create or update user from Keycloak token
      const user = await createOrUpdateUserFromKeycloak(decoded);
      
      // Set the user in the request object
      request.user = {
        id: user.id,
        email: user.email,
        name: user.name,
        roles: user.roles,
        permissions: user.permissions,
        currentTenantId: user.currentTenantId,
      };
    } else {
      // Verify local JWT token
      const decoded = await verifyToken(token);
      
      // Set the user in the request object
      request.user = {
        id: decoded.sub,
        email: decoded.email,
        name: decoded.name,
        roles: decoded.roles || [],
        permissions: decoded.permissions || [],
      };
    }
  } catch (error) {
    logger.error('Authentication error', { error });
    
    if (error instanceof AppError) {
      throw error;
    }
    
    throw new AppError('Unauthorized - Invalid token', 401);
  }
};

// Middleware to check if user has required roles
export const hasRoles = (roles: string[]) => {
  return async (request: AuthenticatedRequest, reply: FastifyReply) => {
    if (!request.user) {
      throw new AppError('Unauthorized - Authentication required', 401);
    }
    
    const hasRequiredRole = request.user.roles.some(role => roles.includes(role));
    
    if (!hasRequiredRole) {
      throw new AppError('Forbidden - Insufficient role permissions', 403);
    }
  };
};

// Middleware to check if user has required permissions
export const hasPermissions = (permissions: string[]) => {
  return async (request: AuthenticatedRequest, reply: FastifyReply) => {
    if (!request.user) {
      throw new AppError('Unauthorized - Authentication required', 401);
    }
    
    const hasRequiredPermission = request.user.permissions.some(permission => 
      permissions.includes(permission)
    );
    
    if (!hasRequiredPermission) {
      throw new AppError('Forbidden - Insufficient permissions', 403);
    }
  };
};

// Helper function to get current user from request
export const getCurrentUser = (request: AuthenticatedRequest) => {
  if (!request.user) {
    throw new AppError('Unauthorized - Authentication required', 401);
  }
  return request.user;
};

// Alias for backward compatibility
export const authenticateUser = authenticate;