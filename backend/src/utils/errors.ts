/**
 * Custom Error Classes
 * 
 * Standardized error handling with correlation IDs and proper HTTP status codes
 * 
 * @module utils/errors
 */

import { randomUUID } from 'crypto'

export interface ErrorContext {
  correlationId: string
  timestamp: Date
  path?: string
  userId?: string
  details?: any
}

/**
 * Base Application Error
 */
export class AppError extends Error {
  public readonly statusCode: number
  public readonly isOperational: boolean
  public readonly context: ErrorContext

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    context?: Partial<ErrorContext>
  ) {
    super(message)
    
    Object.setPrototypeOf(this, new.target.prototype)
    
    this.statusCode = statusCode
    this.isOperational = isOperational
    this.context = {
      correlationId: context?.correlationId || randomUUID(),
      timestamp: new Date(),
      path: context?.path,
      userId: context?.userId,
      details: context?.details,
    }

    Error.captureStackTrace(this, this.constructor)
  }

  toJSON() {
    return {
      error: this.constructor.name,
      message: this.message,
      statusCode: this.statusCode,
      correlationId: this.context.correlationId,
      timestamp: this.context.timestamp,
    }
  }
}

/**
 * 400 - Bad Request
 */
export class BadRequestError extends AppError {
  constructor(message: string = 'Bad Request', context?: Partial<ErrorContext>) {
    super(message, 400, true, context)
  }
}

/**
 * 401 - Unauthorized
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized', context?: Partial<ErrorContext>) {
    super(message, 401, true, context)
  }
}

/**
 * 403 - Forbidden
 */
export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden', context?: Partial<ErrorContext>) {
    super(message, 403, true, context)
  }
}

/**
 * 404 - Not Found
 */
export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found', context?: Partial<ErrorContext>) {
    super(message, 404, true, context)
  }
}

/**
 * 409 - Conflict
 */
export class ConflictError extends AppError {
  constructor(message: string = 'Resource conflict', context?: Partial<ErrorContext>) {
    super(message, 409, true, context)
  }
}

/**
 * 422 - Unprocessable Entity
 */
export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed', context?: Partial<ErrorContext>) {
    super(message, 422, true, context)
  }
}

/**
 * 429 - Too Many Requests
 */
export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests', context?: Partial<ErrorContext>) {
    super(message, 429, true, context)
  }
}

/**
 * 500 - Internal Server Error
 */
export class InternalServerError extends AppError {
  constructor(message: string = 'Internal server error', context?: Partial<ErrorContext>) {
    super(message, 500, false, context)
  }
}

/**
 * 503 - Service Unavailable
 */
export class ServiceUnavailableError extends AppError {
  constructor(message: string = 'Service unavailable', context?: Partial<ErrorContext>) {
    super(message, 503, true, context)
  }
}

/**
 * Database Error
 */
export class DatabaseError extends AppError {
  constructor(message: string = 'Database error', context?: Partial<ErrorContext>) {
    super(message, 500, false, context)
  }
}

/**
 * External Service Error
 */
export class ExternalServiceError extends AppError {
  constructor(message: string = 'External service error', context?: Partial<ErrorContext>) {
    super(message, 502, true, context)
  }
}

/**
 * Check if error is operational (expected) vs programming error
 */
export function isOperationalError(error: Error): boolean {
  if (error instanceof AppError) {
    return error.isOperational
  }
  return false
}

/**
 * Sanitize error message for production
 */
export function sanitizeErrorMessage(error: Error, isProduction: boolean): string {
  if (!isProduction) {
    return error.message
  }

  // In production, return generic messages for non-operational errors
  if (error instanceof AppError && error.isOperational) {
    return error.message
  }

  return 'An unexpected error occurred. Please try again later.'
}

/**
 * Create error response object
 */
export function createErrorResponse(
  error: Error,
  isProduction: boolean = false,
  includeStack: boolean = false
) {
  const correlationId = error instanceof AppError 
    ? error.context.correlationId 
    : randomUUID()

  const statusCode = error instanceof AppError ? error.statusCode : 500

  const response: any = {
    error: error.constructor.name,
    message: sanitizeErrorMessage(error, isProduction),
    statusCode,
    correlationId,
    timestamp: new Date().toISOString(),
  }

  // Include additional details in development
  if (!isProduction) {
    if (error instanceof AppError && error.context.details) {
      response.details = error.context.details
    }

    if (includeStack && error.stack) {
      response.stack = error.stack.split('\n')
    }
  }

  return response
}

/**
 * Error utilities export
 */
export const errorUtils = {
  isOperationalError,
  sanitizeErrorMessage,
  createErrorResponse,
}
