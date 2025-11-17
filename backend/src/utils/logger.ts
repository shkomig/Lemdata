/**
 * Production-grade logger using Pino
 * 
 * Features:
 * - JSON structured logging
 * - Log levels (trace, debug, info, warn, error, fatal)
 * - Automatic redaction of sensitive data
 * - Pretty printing in development
 * - Performance optimized
 * 
 * @module utils/logger
 */

import pino from 'pino'
import { config } from '../config/config'

const isDevelopment = config.server.env === 'development'

/**
 * Create Pino logger instance
 */
export const logger = pino({
  level: process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info'),
  
  // Redact sensitive information
  redact: {
    paths: [
      'password',
      'token',
      'accessToken',
      'refreshToken',
      'authorization',
      'cookie',
      'req.headers.authorization',
      'req.headers.cookie',
      'res.headers["set-cookie"]',
      '*.password',
      '*.token',
      '*.secret',
    ],
    censor: '[REDACTED]',
  },

  // Base logger configuration
  base: {
    env: config.server.env,
    pid: process.pid,
  },

  // Timestamp format
  timestamp: () => `,"time":"${new Date().toISOString()}"`,

  // Serializers for common objects
  serializers: {
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res,
    err: pino.stdSerializers.err,
  },

  // Pretty print in development
  transport: isDevelopment
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'yyyy-mm-dd HH:MM:ss.l',
          ignore: 'pid,hostname',
          singleLine: false,
          messageFormat: '{levelLabel} - {msg}',
        },
      }
    : undefined,
})

/**
 * Create child logger with additional context
 */
export function createChildLogger(context: Record<string, any>) {
  return logger.child(context)
}

/**
 * Log request with correlation ID
 */
export function logRequest(
  method: string,
  url: string,
  statusCode: number,
  responseTime: number,
  correlationId?: string
) {
  logger.info({
    type: 'request',
    method,
    url,
    statusCode,
    responseTime,
    correlationId,
  }, `${method} ${url} ${statusCode} ${responseTime}ms`)
}

/**
 * Log error with full context
 */
export function logError(
  error: Error,
  context?: Record<string, any>
) {
  logger.error({
    type: 'error',
    err: error,
    ...context,
  }, error.message)
}

/**
 * Log security event
 */
export function logSecurityEvent(
  event: string,
  details: Record<string, any>
) {
  logger.warn({
    type: 'security',
    event,
    ...details,
  }, `Security event: ${event}`)
}

/**
 * Log performance metric
 */
export function logPerformance(
  operation: string,
  duration: number,
  metadata?: Record<string, any>
) {
  logger.info({
    type: 'performance',
    operation,
    duration,
    ...metadata,
  }, `${operation} took ${duration}ms`)
}

/**
 * Export logger utilities
 */
export const loggerUtils = {
  createChildLogger,
  logRequest,
  logError,
  logSecurityEvent,
  logPerformance,
}

export default logger




