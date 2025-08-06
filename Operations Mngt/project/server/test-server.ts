import fastify from 'fastify';
import { SERVER_CONFIG } from './config';

// Create a simple Fastify instance
const server = fastify({
  logger: {
    level: 'info',
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
      },
    },
  },
});

// Add a simple health check route
server.get('/health', async (request, reply) => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

// Start server function
const startServer = async () => {
  try {
    console.log('Starting test server...');
    
    // Start the server
    await server.listen({ port: SERVER_CONFIG.port, host: '0.0.0.0' });
    
    console.log(`Test server is running on port ${SERVER_CONFIG.port}`);
  } catch (error) {
    console.error('Error starting test server:', error);
    process.exit(1);
  }
};

// Handle unhandled rejections
process.on('unhandledRejection', (error) => {
  console.error('Unhandled rejection:', error);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  process.exit(1);
});

// Start the server
if (import.meta.url === `file://${process.argv[1]}`) {
  startServer();
}

export default server; 