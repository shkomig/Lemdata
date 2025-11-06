import { FastifyError, FastifyRequest, FastifyReply } from 'fastify'
import { ZodError } from 'zod'
import { logger } from '../utils/logger'

export async function errorHandler(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
) {
  // Log error
  logger.error('Request error:', {
    url: request.url,
    method: request.method,
    error: error.message,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
  })

  // Handle Zod validation errors
  if (error.validation || error instanceof ZodError) {
    return reply.status(400).send({
      error: 'Validation Error',
      message: error.message,
      details: error.validation || (error instanceof ZodError ? error.errors : []),
    })
  }

  // Handle JWT errors
  if (error.statusCode === 401) {
    return reply.status(401).send({
      error: 'Unauthorized',
      message: 'Invalid or expired token',
    })
  }

  // Handle Prisma errors
  if (error.name === 'PrismaClientKnownRequestError') {
    return reply.status(400).send({
      error: 'Database Error',
      message: 'An error occurred while processing your request',
    })
  }

  // Default error response
  const statusCode = error.statusCode || 500
  const message = statusCode === 500 && process.env.NODE_ENV === 'production'
    ? 'Internal Server Error'
    : error.message

  return reply.status(statusCode).send({
    error: error.name || 'Error',
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  })
}

