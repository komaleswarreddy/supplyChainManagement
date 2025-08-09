import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { AppError } from '../utils/app-error';
import { authenticate } from '../middleware/auth';
import { generateToken, verifyCredentials, verifyKeycloakToken, createOrUpdateUserFromKeycloak, createUser } from '../utils/auth';
import { AUTH_CONFIG } from '../config';
import axios from 'axios';
import { logger } from '../utils/logger';

// Define route schemas
const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  department: z.string().optional(),
  title: z.string().optional(),
  phoneNumber: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const refreshSchema = z.object({
  refreshToken: z.string(),
});

const keycloakLoginSchema = z.object({
  code: z.string(),
  redirectUri: z.string().url(),
});

// Auth routes
export default async function authRoutes(fastify: FastifyInstance) {
  // Register route
  fastify.post('/register', {
    schema: {
      body: {
        type: 'object',
        required: ['email', 'password', 'firstName', 'lastName'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 6 },
          firstName: { type: 'string', minLength: 1 },
          lastName: { type: 'string', minLength: 1 },
          department: { type: 'string' },
          title: { type: 'string' },
          phoneNumber: { type: 'string' },
        },
      },
      response: {
        201: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            user: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                email: { type: 'string' },
                firstName: { type: 'string' },
                lastName: { type: 'string' },
                name: { type: 'string' },
                department: { type: 'string' },
                title: { type: 'string' },
                roles: { type: 'array', items: { type: 'string' } },
                status: { type: 'string' },
                createdAt: { type: 'string', format: 'date-time' },
              },
            },
          },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userData = registerSchema.parse(request.body);
      
      // Create new user
      const newUser = await createUser(userData);
      
      // Return success response (exclude password hash)
      const { passwordHash, ...userResponse } = newUser;
      
      reply.code(201);
      return {
        message: 'User registered successfully',
        user: userResponse,
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new AppError('Validation error', 400, error.errors);
      }
      throw error;
    }
  });
  
  // Login route
  fastify.post('/login', {
    schema: {
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 6 },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            accessToken: { type: 'string' },
            refreshToken: { type: 'string' },
            user: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                email: { type: 'string' },
                name: { type: 'string' },
                roles: { type: 'array', items: { type: 'string' } },
              },
            },
          },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { email, password } = loginSchema.parse(request.body);
      
      // Verify credentials
      const user = await verifyCredentials(email, password);
      
      if (!user) {
        throw new AppError('Invalid email or password', 401);
      }
      
      // Generate tokens
      const accessToken = await generateToken(user);
      const refreshToken = await fastify.jwt.sign(
        { userId: user.id },
        { expiresIn: '7d' }
      );
      
      return {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          roles: user.roles,
        },
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new AppError('Validation error', 400, error.errors);
      }
      throw error;
    }
  });
  
  // Keycloak login route
  fastify.post('/keycloak/login', {
    schema: {
      body: {
        type: 'object',
        required: ['code', 'redirectUri'],
        properties: {
          code: { type: 'string' },
          redirectUri: { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            accessToken: { type: 'string' },
            refreshToken: { type: 'string' },
            user: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                email: { type: 'string' },
                name: { type: 'string' },
                roles: { type: 'array', items: { type: 'string' } },
              },
            },
          },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { code, redirectUri } = keycloakLoginSchema.parse(request.body);
      
      // Exchange authorization code for tokens
      const tokenEndpoint = `${AUTH_CONFIG.keycloakUrl}/realms/${AUTH_CONFIG.keycloakRealm}/protocol/openid-connect/token`;
      const tokenResponse = await axios.post(tokenEndpoint, new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: AUTH_CONFIG.keycloakClientId,
        client_secret: AUTH_CONFIG.keycloakClientSecret || '',
        code,
        redirect_uri: redirectUri,
      }), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      
      const { access_token, refresh_token, id_token } = tokenResponse.data;
      
      // Verify the token and get user info
      const decodedToken = await verifyKeycloakToken(access_token);
      
      // Create or update user in our database
      const user = await createOrUpdateUserFromKeycloak(decodedToken);
      
      return {
        accessToken: access_token,
        refreshToken: refresh_token,
        idToken: id_token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          roles: user.roles,
        },
      };
    } catch (error) {
      logger.error('Keycloak login error', { error });
      
      if (error instanceof z.ZodError) {
        throw new AppError('Validation error', 400, error.errors);
      }
      
      if (error.response) {
        throw new AppError(`Keycloak error: ${error.response.data.error_description || error.response.data.error}`, 401);
      }
      
      throw new AppError('Authentication failed', 500);
    }
  });
  
  // Refresh token route
  fastify.post('/refresh', {
    schema: {
      body: {
        type: 'object',
        required: ['refreshToken'],
        properties: {
          refreshToken: { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            accessToken: { type: 'string' },
          },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { refreshToken } = refreshSchema.parse(request.body);
      
      // Check if we're using Keycloak or local JWT
      if (AUTH_CONFIG.keycloakUrl) {
        // Refresh Keycloak token
        const tokenEndpoint = `${AUTH_CONFIG.keycloakUrl}/realms/${AUTH_CONFIG.keycloakRealm}/protocol/openid-connect/token`;
        const tokenResponse = await axios.post(tokenEndpoint, new URLSearchParams({
          grant_type: 'refresh_token',
          client_id: AUTH_CONFIG.keycloakClientId,
          client_secret: AUTH_CONFIG.keycloakClientSecret || '',
          refresh_token: refreshToken,
        }), {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        });
        
        const { access_token, refresh_token } = tokenResponse.data;
        
        return { 
          accessToken: access_token,
          refreshToken: refresh_token,
        };
      } else {
        // Verify refresh token
        const decoded = await fastify.jwt.verify(refreshToken);
        
        if (!decoded || !decoded.userId) {
          throw new AppError('Invalid refresh token', 401);
        }
        
        // Get user from database
        // In a real implementation, you would fetch the user from the database
        const user = {
          id: decoded.userId,
          email: 'user@example.com',
          name: 'User',
          roles: ['user'],
        };
        
        // Generate new access token
        const accessToken = await generateToken(user);
        
        return { accessToken };
      }
    } catch (error) {
      logger.error('Token refresh error', { error });
      
      if (error instanceof z.ZodError) {
        throw new AppError('Validation error', 400, error.errors);
      }
      
      if (error.response) {
        throw new AppError(`Refresh error: ${error.response.data.error_description || error.response.data.error}`, 401);
      }
      
      throw new AppError('Invalid or expired refresh token', 401);
    }
  });
  
  // Logout route
  fastify.post('/logout', {
    preHandler: authenticate,
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    // In a real implementation, you might want to invalidate the token
    // For JWT, this often involves maintaining a blacklist of tokens
    return { message: 'Logged out successfully' };
  });
  
  // Get current user route
  fastify.get('/me', {
    preHandler: authenticate,
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            name: { type: 'string' },
            roles: { type: 'array', items: { type: 'string' } },
            permissions: { type: 'array', items: { type: 'string' } },
            tenantRole: { type: 'string' },
            isOwner: { type: 'boolean' },
            currentTenantId: { type: 'string' },
          },
        },
      },
    },
  }, async (request: any, reply: FastifyReply) => {
    // The user is already set in the request by the authenticate middleware
    return {
      id: request.user.id,
      email: request.user.email,
      name: request.user.name,
      roles: request.user.roles,
      permissions: request.user.permissions,
      tenantRole: request.user.tenantRole,
      isOwner: request.user.isOwner,
      currentTenantId: request.user.currentTenantId,
    };
  });
}