import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { AUTH_CONFIG } from '../config';
import { AppError } from './app-error';
import { logger } from './logger';
import { db } from '../db';
import { users } from '../db/schema/users';
import { eq } from 'drizzle-orm';
import axios from 'axios';

// Hash password
export const hashPassword = async (password: string): Promise<string> => {
  try {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  } catch (error) {
    logger.error('Error hashing password', { error });
    throw new AppError('Password hashing failed', 500);
  }
};

// Verify user credentials
export const verifyCredentials = async (email: string, password: string) => {
  try {
    // Fetch user from database
    const userResult = await db.select().from(users).where(eq(users.email, email)).limit(1);
    
    if (!userResult.length) {
      return null;
    }
    
    const user = userResult[0];
    
    // Verify password using bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    
    if (!isPasswordValid) {
      return null;
    }
    
    // Update last login timestamp
    await db.update(users).set({
      lastLogin: new Date(),
      updatedAt: new Date()
    }).where(eq(users.id, user.id));
    
    return user;
  } catch (error) {
    logger.error('Error verifying credentials', { error });
    throw new AppError('Authentication failed', 500);
  }
};

// Create new user
export const createUser = async (userData: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  department?: string;
  title?: string;
  phoneNumber?: string;
  roles?: string[];
  permissions?: string[];
}) => {
  try {
    // Check if user already exists
    const existingUser = await db.select().from(users).where(eq(users.email, userData.email)).limit(1);
    
    if (existingUser.length > 0) {
      throw new AppError('User with this email already exists', 409);
    }
    
    // Hash password
    const passwordHash = await hashPassword(userData.password);
    
    // Create user data
    const newUserData = {
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      name: `${userData.firstName} ${userData.lastName}`,
      passwordHash,
      department: userData.department || null,
      title: userData.title || null,
      phoneNumber: userData.phoneNumber || null,
      roles: userData.roles || ['user'],
      permissions: userData.permissions || ['create_requisition'],
      status: 'active' as const,
      passwordLastChanged: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    // Insert user into database
    const [newUser] = await db.insert(users).values(newUserData).returning();
    
    return newUser;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error('Error creating user', { error });
    throw new AppError('User creation failed', 500);
  }
};

// Generate JWT token
export const generateToken = async (user: any) => {
  try {
    const payload = {
      sub: user.id,
      email: user.email,
      name: user.name || `${user.firstName} ${user.lastName}`,
      roles: user.roles,
      permissions: user.permissions,
    };
    
    return jwt.sign(payload, AUTH_CONFIG.jwtSecret, {
      expiresIn: AUTH_CONFIG.jwtExpiresIn,
    });
  } catch (error) {
    logger.error('Error generating token', { error });
    throw new AppError('Token generation failed', 500);
  }
};

// Verify JWT token
export const verifyToken = async (token: string) => {
  try {
    return jwt.verify(token, AUTH_CONFIG.jwtSecret);
  } catch (error) {
    logger.error('Error verifying token', { error });
    throw new AppError('Invalid token', 401);
  }
};

// Verify Keycloak token
export const verifyKeycloakToken = async (token: string) => {
  try {
    // Get the Keycloak public key
    const keycloakUrl = AUTH_CONFIG.keycloakUrl;
    const realm = AUTH_CONFIG.keycloakRealm;
    const wellKnownUrl = `${keycloakUrl}/realms/${realm}/.well-known/openid-configuration`;
    
    // Get the well-known configuration
    const wellKnownResponse = await axios.get(wellKnownUrl);
    const jwksUri = wellKnownResponse.data.jwks_uri;
    
    // Get the JWKS (JSON Web Key Set)
    const jwksResponse = await axios.get(jwksUri);
    const keys = jwksResponse.data.keys;
    
    // Find the key that matches the token
    const decodedToken = jwt.decode(token, { complete: true });
    if (!decodedToken) {
      throw new Error('Invalid token');
    }
    
    const kid = decodedToken.header.kid;
    const key = keys.find((k: any) => k.kid === kid);
    
    if (!key) {
      throw new Error('Invalid token: Key not found');
    }
    
    // Convert the JWK to PEM format
    const publicKey = `-----BEGIN PUBLIC KEY-----\n${key.x5c[0]}\n-----END PUBLIC KEY-----`;
    
    // Verify the token
    const verified = jwt.verify(token, publicKey, {
      algorithms: ['RS256'],
      audience: AUTH_CONFIG.keycloakClientId,
      issuer: `${keycloakUrl}/realms/${realm}`,
    });
    
    return verified;
  } catch (error) {
    logger.error('Error verifying Keycloak token', { error });
    throw new AppError('Invalid token', 401);
  }
};

// Get user from database by ID
export const getUserById = async (id: string) => {
  try {
    const user = await db.select().from(users).where(eq(users.id, id)).limit(1);
    
    if (!user.length) {
      return null;
    }
    
    return user[0];
  } catch (error) {
    logger.error('Error getting user by ID', { error });
    throw new AppError('Failed to get user', 500);
  }
};

// Create or update user from Keycloak token
export const createOrUpdateUserFromKeycloak = async (token: any) => {
  try {
    // Check if user exists
    const existingUser = await getUserById(token.sub);
    
    // User data from token
    const userData = {
      id: token.sub,
      email: token.email,
      firstName: token.given_name,
      lastName: token.family_name,
      name: token.name,
      roles: token.realm_access?.roles || [],
      permissions: token.resource_access?.[AUTH_CONFIG.keycloakClientId]?.roles || [],
      status: 'active',
      lastLogin: new Date().toISOString(),
    };
    
    if (existingUser) {
      // Update existing user
      await db.update(users).set({
        ...userData,
        updatedAt: new Date().toISOString(),
      }).where(eq(users.id, token.sub));
      
      return { ...existingUser, ...userData };
    } else {
      // Create new user
      const [newUser] = await db.insert(users).values({
        ...userData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }).returning();
      
      return newUser;
    }
  } catch (error) {
    logger.error('Error creating or updating user from Keycloak', { error });
    throw new AppError('Failed to create or update user', 500);
  }
};