console.log('Loading server modules...');

import fastify from 'fastify';
console.log('Fastify imported successfully');

import { SERVER_CONFIG } from './config';
console.log('Config imported successfully');

import { logger } from './utils/logger';
console.log('Logger imported successfully');

import { errorHandler } from './middleware/error-handler';
console.log('Error handler imported successfully');

import plugins from './plugins';
console.log('Plugins imported successfully');

import routes from './routes';
console.log('Routes imported successfully');

import { testConnection } from './db';
console.log('Database connection imported successfully');

import runMigrations from './db/migrate';
console.log('Migrations imported successfully');

import seedDatabase from './db/seed';
console.log('Seed database imported successfully');

import { initializeWebSocketService } from './utils/websocket';
console.log('WebSocket service imported successfully');

// Create Fastify instance
const server = fastify({
  logger: {
    level: SERVER_CONFIG.logLevel,
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
      },
    },
    base: {
      env: SERVER_CONFIG.environment,
    },
  },
  ajv: {
    customOptions: {
      allErrors: true,
      removeAdditional: 'all',
      coerceTypes: true,
    },
  },
});

// Register error handler
server.setErrorHandler(errorHandler);

// Start server function
const startServer = async () => {
  try {
    console.log('Starting server initialization...');
    logger.info('Starting server initialization...');
    
    // Test database connection
    console.log('Testing database connection...');
    logger.info('Testing database connection...');
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.log('Database connection failed, continuing without database for development...');
      logger.warn('Database connection failed, continuing without database for development...');
      // Don't exit in development mode, allow server to start
    }
    
    // Run migrations if in development mode and database is connected
    if (SERVER_CONFIG.environment === 'development' && dbConnected) {
      try {
        console.log('Running database migrations...');
        logger.info('Running database migrations...');
        await runMigrations();
        
        console.log('Seeding database...');
        logger.info('Seeding database...');
        // Seed database if in development mode and tables are empty
        await seedDatabase();
      } catch (error) {
        console.log('Failed to run migrations or seed data automatically:', error);
        logger.warn('Failed to run migrations or seed data automatically', { 
          error: error.message,
          stack: error.stack 
        });
        logger.info('You may need to run migrations manually');
      }
    } else if (SERVER_CONFIG.environment === 'development' && !dbConnected) {
      console.log('Skipping database operations due to connection failure');
      logger.info('Skipping database operations due to connection failure');
    }
    
    // Register plugins
    console.log('Registering plugins...');
    logger.info('Registering plugins...');
    await server.register(plugins);
    
    // Register routes
    console.log('Registering routes...');
    logger.info('Registering routes...');
    await server.register(routes);
    
    // Start the server
    console.log('Starting server...');
    logger.info('Starting server...');
    await server.listen({ port: SERVER_CONFIG.port, host: '0.0.0.0' });
    
    // Initialize WebSocket service after server is listening
    console.log('Initializing WebSocket service...');
    logger.info('Initializing WebSocket service...');
    initializeWebSocketService(server.server);
    logger.info('WebSocket service initialized');
    
    console.log(`Server is running on port ${SERVER_CONFIG.port}`);
    logger.info(`Server is running on port ${SERVER_CONFIG.port}`);
  } catch (error) {
    console.error('Error starting server:', error);
    logger.error('Error starting server', { 
      error: error.message,
      stack: error.stack,
      name: error.name 
    });
    process.exit(1);
  }
};

// Handle unhandled rejections
process.on('unhandledRejection', (error) => {
  logger.error('Unhandled rejection', { error });
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  logger.error('Uncaught exception', { 
    error: error.message,
    stack: error.stack,
    name: error.name 
  });
  process.exit(1);
});

// Start the server
console.log('Checking if server should start...');

// Check if this is the main module being executed
if (import.meta.url.endsWith('server/index.ts') || import.meta.url.includes('server/index.ts')) {
  console.log('Starting server...');
  startServer();
} else {
  console.log('Server not started - condition not met');
}

// Export server for testing
export default server;
