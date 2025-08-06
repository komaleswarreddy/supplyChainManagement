import fastifyPlugin from 'fastify-plugin';
import fastifyCors from '@fastify/cors';
import fastifyJwt from '@fastify/jwt';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import { FastifyInstance } from 'fastify';
import { AUTH_CONFIG, SERVER_CONFIG } from '../config';

// Register all plugins
export default fastifyPlugin(async (fastify: FastifyInstance) => {
  // Register CORS
  await fastify.register(fastifyCors, {
    origin: SERVER_CONFIG.corsOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
  });

  // Register JWT
  await fastify.register(fastifyJwt, {
    secret: AUTH_CONFIG.jwtSecret,
    sign: {
      expiresIn: AUTH_CONFIG.jwtExpiresIn,
    },
  });

  // Register Swagger
  await fastify.register(fastifySwagger, {
    swagger: {
      info: {
        title: 'PLS-SCM API',
        description: 'API documentation for the PLS-SCM application',
        version: '1.0.0',
      },
      externalDocs: {
        url: 'https://swagger.io',
        description: 'Find more info here',
      },
      host: 'localhost:3000',
      schemes: ['http', 'https'],
      consumes: ['application/json'],
      produces: ['application/json'],
      securityDefinitions: {
        bearerAuth: {
          type: 'apiKey',
          name: 'Authorization',
          in: 'header',
        },
      },
    },
  });

  // Register Swagger UI
  await fastify.register(fastifySwaggerUi, {
    routePrefix: '/documentation',
    uiConfig: {
      docExpansion: 'full',
      deepLinking: false,
    },
    uiHooks: {
      onRequest: function (request, reply, next) {
        next();
      },
      preHandler: function (request, reply, next) {
        next();
      },
    },
    staticCSP: true,
    transformStaticCSP: (header) => header,
    transformSpecification: (swaggerObject, request, reply) => {
      return swaggerObject;
    },
    transformSpecificationClone: true,
  });
});