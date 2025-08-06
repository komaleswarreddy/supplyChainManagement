import pino from 'pino';
import { SERVER_CONFIG } from '../config';

// Create a logger instance
export const logger = pino({
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
});