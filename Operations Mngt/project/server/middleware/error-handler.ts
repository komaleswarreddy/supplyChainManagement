import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';
import { AppError } from '../utils/app-error';
import { logger } from '../utils/logger';
import { SERVER_CONFIG } from '../config';

// Error handler middleware
export const errorHandler = (
  error: Error | FastifyError | AppError | ZodError,
  request: FastifyRequest,
  reply: FastifyReply
) => {
  // Log the error
  logger.error('Error occurred', { 
    error, 
    path: request.url, 
    method: request.method,
    params: request.params,
    query: request.query,
    // Don't log sensitive body data in production
    body: SERVER_CONFIG.environment === 'development' ? request.body : undefined
  });

  // Handle AppError (custom application errors)
  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      status: 'error',
      message: error.message,
      errors: error.errors,
    });
  }

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    const formattedErrors = error.errors.reduce((acc, curr) => {
      const path = curr.path.join('.');
      if (!acc[path]) {
        acc[path] = [];
      }
      acc[path].push(curr.message);
      return acc;
    }, {} as Record<string, string[]>);

    return reply.status(400).send({
      status: 'error',
      message: 'Validation error',
      errors: formattedErrors,
    });
  }

  // Handle Fastify errors
  if ('statusCode' in error && typeof error.statusCode === 'number') {
    return reply.status(error.statusCode).send({
      status: 'error',
      message: error.message,
    });
  }

  // Handle database errors
  if (error.message?.includes('duplicate key') || error.message?.includes('unique constraint')) {
    return reply.status(409).send({
      status: 'error',
      message: 'A record with this information already exists',
    });
  }

  // Handle unknown errors
  // In production, don't expose error details
  const message = SERVER_CONFIG.environment === 'production' 
    ? 'An unexpected error occurred' 
    : error.message || 'An unexpected error occurred';

  return reply.status(500).send({
    status: 'error',
    message,
    stack: SERVER_CONFIG.environment === 'development' ? error.stack : undefined,
  });
};