import { FastifyError, FastifyRequest, FastifyReply } from 'fastify'
import { ZodError } from 'zod'
import { AppError, createErrorResponse } from '../utils/errors'
import { logger } from '../utils/logger'
import { config } from '../config/config'

export async function errorHandler(
  error: FastifyError | Error,
  request: FastifyRequest,
  reply: FastifyReply
) {
  const isProduction = config.server.env === 'production'
  
  // Log error with context
  const errorContext = {
    method: request.method,
    url: request.url,
    ip: request.ip,
    userAgent: request.headers['user-agent'],
    userId: (request as any).user?.userId,
  }

  // Determine log level based on error type
  if (error instanceof AppError) {
    if (error.isOperational) {
      logger.warn('Operational error occurred', {
        error: error.toJSON(),
        context: errorContext,
      })
    } else {
      logger.error('Non-operational error occurred', {
        error: error.toJSON(),
        context: errorContext,
        stack: error.stack,
      })
    }
  } else if (error instanceof ZodError) {
    logger.warn('Validation error occurred', {
      errors: error.errors,
      context: errorContext,
    })
  } else {
    logger.error('Unexpected error occurred', {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      context: errorContext,
    })
  }

  // Handle Zod validation errors
  if (error instanceof ZodError || (error as FastifyError).validation) {
    return reply.status(400).send({
      error: 'ValidationError',
      message: 'Request validation failed',
      statusCode: 400,
      details: isProduction ? undefined : (error instanceof ZodError ? error.errors : (error as FastifyError).validation),
      timestamp: new Date().toISOString(),
    })
  }

  // Handle JWT errors
  if ((error as FastifyError).statusCode === 401) {
    return reply.status(401).send({
      error: 'Unauthorized',
      message: 'Invalid or expired token',
      statusCode: 401,
      timestamp: new Date().toISOString(),
    })
  }

  // Handle Prisma errors
  if (error.name === 'PrismaClientKnownRequestError') {
    logger.error('Prisma error occurred', { error, context: errorContext })
    return reply.status(400).send({
      error: 'DatabaseError',
      message: 'An error occurred while processing your request',
      statusCode: 400,
      timestamp: new Date().toISOString(),
    })
  }

  // Handle custom app errors
  if (error instanceof AppError) {
    const response = createErrorResponse(error, isProduction, !isProduction)
    return reply.code(error.statusCode).send(response)
  }

  // Handle Fastify errors with status code
  if ('statusCode' in error && error.statusCode) {
    const message = isProduction && error.statusCode >= 500 
      ? 'Internal server error' 
      : error.message
      
    return reply.code(error.statusCode).send({
      error: error.name,
      message,
      statusCode: error.statusCode,
      timestamp: new Date().toISOString(),
    })
  }

  // Handle unknown errors
  const response = createErrorResponse(error, isProduction, !isProduction)
  return reply.code(500).send(response)
}

