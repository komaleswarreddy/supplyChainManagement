import { FastifyRequest, FastifyReply } from 'fastify';
import { AUTH_CONFIG } from '../config';
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
    
    return;
  } catch (error) {
    logger.error('Authentication error', { error });
    
    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({ message: error.message });
    }
    
    return reply.status(401).send({ message: 'Unauthorized - Invalid token' });
  }
};

// Middleware to check if user has required roles
export const hasRoles = (roles: string[]) => {
  return (request: AuthenticatedRequest, reply: FastifyReply, done: () => void) => {
    if (!request.user) {
      return reply.status(401).send({ message: 'Unauthorized - Authentication required' });
    }
    
    const hasRequiredRole = request.user.roles.some(role => roles.includes(role));
    
    if (!hasRequiredRole) {
      return reply.status(403).send({ message: 'Forbidden - Insufficient role permissions' });
    }
    
    done();
  };
};

// Middleware to check if user has required permissions
export const hasPermissions = (permissions: string[]) => {
  return (request: AuthenticatedRequest, reply: FastifyReply, done: () => void) => {
    if (!request.user) {
      return reply.status(401).send({ message: 'Unauthorized - Authentication required' });
    }
    
    const hasRequiredPermission = request.user.permissions.some(permission => 
      permissions.includes(permission)
    );
    
    if (!hasRequiredPermission) {
      return reply.status(403).send({ message: 'Forbidden - Insufficient permissions' });
    }
    
    done();
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