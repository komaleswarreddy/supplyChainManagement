import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { db } from '../db';
import { users, userGroups, roles } from '../db/schema/users';
import { eq } from 'drizzle-orm';
import { AppError } from '../utils/app-error';
import { authenticate, hasPermissions } from '../middleware/auth';
import bcrypt from 'bcrypt';

// Define route schemas
const createUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  title: z.string().optional(),
  department: z.string().min(1, 'Department is required'),
  employeeId: z.string().optional(),
  phoneNumber: z.string().optional(),
  roles: z.array(z.string()).min(1, 'At least one role is required'),
  status: z.enum(['active', 'inactive', 'pending']),
  mfaEnabled: z.boolean(),
  preferences: z.object({
    language: z.string(),
    timezone: z.string(),
    theme: z.enum(['light', 'dark', 'system']),
    notifications: z.object({
      email: z.boolean(),
      inApp: z.boolean(),
      desktop: z.boolean(),
    }),
  }),
  metadata: z.object({
    costCenter: z.string().optional(),
    location: z.string().optional(),
    division: z.string().optional(),
  }).optional(),
  supervisorId: z.string().uuid().optional(),
});

const updateUserSchema = createUserSchema.partial().omit({ password: true }).extend({
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
});

// User routes
export default async function userRoutes(fastify: FastifyInstance) {
  // Apply authentication middleware to all routes
  fastify.addHook('preHandler', authenticate);
  
  // Get all users
  fastify.get('/', {
    preHandler: hasPermissions(['manage_users']),
    schema: {
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'number', default: 1 },
          pageSize: { type: 'number', default: 10 },
          status: { type: 'string', enum: ['active', 'inactive', 'pending'] },
          role: { type: 'string' },
          department: { type: 'string' },
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
                  email: { type: 'string' },
                  firstName: { type: 'string' },
                  lastName: { type: 'string' },
                  name: { type: 'string' },
                  title: { type: 'string' },
                  department: { type: 'string' },
                  roles: { type: 'array', items: { type: 'string' } },
                  status: { type: 'string' },
                  createdAt: { type: 'string', format: 'date-time' },
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
    const { page = 1, pageSize = 10, status, role, department, search } = request.query as any;
    
    // Build query
    let query = db.select().from(users);
    
    // Apply filters
    if (status) {
      query = query.where(eq(users.status, status));
    }
    
    // Add more complex filtering for role, department, and search
    if (search) {
      conditions.push(
        or(
          like(users.firstName, `%${search}%`),
          like(users.lastName, `%${search}%`),
          like(users.email, `%${search}%`),
          like(users.username, `%${search}%`)
        )
      );
    }
    
    if (role) {
      conditions.push(eq(users.role, role));
    }
    
    if (department) {
      conditions.push(eq(users.department, department));
    }
    
    if (status) {
      conditions.push(eq(users.status, status));
    }
    
    // Get total count for pagination
    const totalQuery = db.select({ count: db.fn.count() }).from(users);
    const [{ count }] = await totalQuery.execute();
    const total = Number(count);
    
    // Apply pagination
    query = query.limit(pageSize).offset((page - 1) * pageSize);
    
    // Execute query
    const items = await query.execute();
    
    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  });
  
  // Get user by ID
  fastify.get('/:id', {
    preHandler: hasPermissions(['manage_users']),
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
            id: { type: 'string' },
            email: { type: 'string' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            name: { type: 'string' },
            title: { type: 'string' },
            department: { type: 'string' },
            employeeId: { type: 'string' },
            phoneNumber: { type: 'string' },
            roles: { type: 'array', items: { type: 'string' } },
            permissions: { type: 'array', items: { type: 'string' } },
            status: { type: 'string' },
            lastLogin: { type: 'string', format: 'date-time' },
            mfaEnabled: { type: 'boolean' },
            preferences: { type: 'object' },
            metadata: { type: 'object' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    
    const user = await db.select().from(users).where(eq(users.id, id)).limit(1);
    
    if (!user.length) {
      throw new AppError('User not found', 404);
    }
    
    return user[0];
  });
  
  // Create user
  fastify.post('/', {
    preHandler: hasPermissions(['manage_users']),
    schema: {
      body: {
        type: 'object',
        required: ['email', 'firstName', 'lastName', 'password', 'roles', 'status'],
        properties: {
          email: { type: 'string', format: 'email' },
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          password: { type: 'string', minLength: 6 },
          title: { type: 'string' },
          department: { type: 'string' },
          employeeId: { type: 'string' },
          phoneNumber: { type: 'string' },
          roles: { type: 'array', items: { type: 'string' } },
          status: { type: 'string', enum: ['active', 'inactive', 'pending'] },
          mfaEnabled: { type: 'boolean' },
          preferences: { type: 'object' },
          metadata: { type: 'object' },
          supervisorId: { type: 'string', format: 'uuid' },
        },
      },
      response: {
        201: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            name: { type: 'string' },
            message: { type: 'string' },
          },
        },
      },
    },
  }, async (request: any, reply: FastifyReply) => {
    try {
      const userData = createUserSchema.parse(request.body);
      
      // Check if email already exists
      const existingUser = await db.select({ id: users.id }).from(users).where(eq(users.email, userData.email)).limit(1);
      
      if (existingUser.length) {
        throw new AppError('User with this email already exists', 409);
      }
      
      // Hash password
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(userData.password, saltRounds);
      
      // Create user
      const [newUser] = await db.insert(users).values({
        ...userData,
        name: `${userData.firstName} ${userData.lastName}`,
        passwordHash,
        createdBy: request.user.id,
      }).returning({ id: users.id, email: users.email, name: users.name });
      
      reply.status(201);
      return {
        ...newUser,
        message: 'User created successfully',
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new AppError('Validation error', 400, error.errors);
      }
      throw error;
    }
  });
  
  // Update user
  fastify.put('/:id', {
    preHandler: hasPermissions(['manage_users']),
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
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          password: { type: 'string', minLength: 6 },
          title: { type: 'string' },
          department: { type: 'string' },
          employeeId: { type: 'string' },
          phoneNumber: { type: 'string' },
          roles: { type: 'array', items: { type: 'string' } },
          status: { type: 'string', enum: ['active', 'inactive', 'pending'] },
          mfaEnabled: { type: 'boolean' },
          preferences: { type: 'object' },
          metadata: { type: 'object' },
          supervisorId: { type: 'string', format: 'uuid' },
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
  }, async (request: any, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const userData = updateUserSchema.parse(request.body);
      
      // Check if user exists
      const existingUser = await db.select({ id: users.id }).from(users).where(eq(users.id, id)).limit(1);
      
      if (!existingUser.length) {
        throw new AppError('User not found', 404);
      }
      
      // Update object
      const updateData: any = { ...userData };
      
      // Update name if firstName or lastName is provided
      let name;
      if (userData.firstName || userData.lastName) {
        const currentUser = await db.select({
          firstName: users.firstName,
          lastName: users.lastName,
        }).from(users).where(eq(users.id, id)).limit(1);
        
        const firstName = userData.firstName || currentUser[0].firstName;
        const lastName = userData.lastName || currentUser[0].lastName;
        name = `${firstName} ${lastName}`;
        updateData.name = name;
      }
      
      // Hash password if provided
      if (userData.password) {
        const saltRounds = 10;
        updateData.passwordHash = await bcrypt.hash(userData.password, saltRounds);
        updateData.passwordLastChanged = new Date().toISOString();
        delete updateData.password;
      }
      
      // Update user
      await db.update(users).set({
        ...updateData,
        updatedBy: request.user.id,
        updatedAt: new Date().toISOString(),
      }).where(eq(users.id, id));
      
      return {
        id,
        message: 'User updated successfully',
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new AppError('Validation error', 400, error.errors);
      }
      throw error;
    }
  });
  
  // Delete user
  fastify.delete('/:id', {
    preHandler: hasPermissions(['manage_users']),
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
            message: { type: 'string' },
          },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    
    // Check if user exists
    const existingUser = await db.select({ id: users.id }).from(users).where(eq(users.id, id)).limit(1);
    
    if (!existingUser.length) {
      throw new AppError('User not found', 404);
    }
    
    // Delete user
    await db.delete(users).where(eq(users.id, id));
    
    return {
      message: 'User deleted successfully',
    };
  });
  
  // Get user groups
  fastify.get('/groups', {
    preHandler: hasPermissions(['manage_users']),
    schema: {
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              description: { type: 'string' },
              roles: { type: 'array', items: { type: 'string' } },
              permissions: { type: 'array', items: { type: 'string' } },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const groups = await db.select().from(userGroups);
    return groups;
  });
  
  // Get roles
  fastify.get('/roles', {
    preHandler: hasPermissions(['manage_users']),
    schema: {
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              description: { type: 'string' },
              permissions: { type: 'array', items: { type: 'string' } },
              isSystem: { type: 'boolean' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const allRoles = await db.select().from(roles);
    return allRoles;
  });
}