/**
 * Input Sanitization Utilities
 * 
 * Provides comprehensive input sanitization to prevent XSS, SQL injection,
 * and other injection attacks.
 * 
 * @module utils/sanitizer
 */

import validator from 'validator'
import xss from 'xss'

/**
 * Sanitize string input to prevent XSS attacks
 * Removes or escapes potentially dangerous HTML/JavaScript
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') {
    throw new Error('Input must be a string')
  }

  // Remove any HTML tags and escape special characters
  return xss(input, {
    whiteList: {}, // No HTML tags allowed
    stripIgnoreTag: true,
    stripIgnoreTagBody: ['script', 'style'],
  })
}

/**
 * Sanitize and validate email address
 */
export function sanitizeEmail(email: string): string {
  if (typeof email !== 'string') {
    throw new Error('Email must be a string')
  }

  // Normalize and validate email
  const normalized = validator.normalizeEmail(email.trim().toLowerCase()) || ''
  
  if (!validator.isEmail(normalized)) {
    throw new Error('Invalid email format')
  }

  return normalized
}

/**
 * Sanitize HTML content while allowing specific safe tags
 * Useful for rich text content
 */
export function sanitizeHTML(html: string, allowedTags: string[] = []): string {
  if (typeof html !== 'string') {
    throw new Error('HTML input must be a string')
  }

  const whiteList: Record<string, string[]> = {}
  
  // Build whitelist from allowed tags
  allowedTags.forEach(tag => {
    switch (tag) {
      case 'p':
      case 'br':
      case 'strong':
      case 'em':
      case 'u':
        whiteList[tag] = []
        break
      case 'a':
        whiteList[tag] = ['href', 'title']
        break
      case 'img':
        whiteList[tag] = ['src', 'alt']
        break
    }
  })

  return xss(html, {
    whiteList,
    stripIgnoreTag: true,
    stripIgnoreTagBody: ['script', 'style'],
  })
}

/**
 * Sanitize object by sanitizing all string values
 */
export function sanitizeObject(obj: Record<string, any>): Record<string, any> {
  const sanitized: Record<string, any> = {}

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value)
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      sanitized[key] = sanitizeObject(value)
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item => 
        typeof item === 'string' ? sanitizeString(item) : item
      )
    } else {
      sanitized[key] = value
    }
  }

  return sanitized
}

/**
 * Validate and sanitize URL
 */
export function sanitizeURL(url: string): string {
  if (typeof url !== 'string') {
    throw new Error('URL must be a string')
  }

  const trimmed = url.trim()

  // Validate URL format
  if (!validator.isURL(trimmed, {
    protocols: ['http', 'https'],
    require_protocol: true,
  })) {
    throw new Error('Invalid URL format')
  }

  return trimmed
}

/**
 * Sanitize filename to prevent path traversal attacks
 */
export function sanitizeFilename(filename: string): string {
  if (typeof filename !== 'string') {
    throw new Error('Filename must be a string')
  }

  // Remove path traversal attempts
  let safe = filename.replace(/\.\./g, '')
  
  // Remove path separators
  safe = safe.replace(/[\/\\]/g, '')
  
  // Remove null bytes
  safe = safe.replace(/\0/g, '')
  
  // Limit to alphanumeric, dots, dashes, and underscores
  safe = safe.replace(/[^a-zA-Z0-9._-]/g, '_')
  
  // Ensure it's not empty
  if (!safe || safe.length === 0) {
    throw new Error('Invalid filename')
  }

  return safe
}

/**
 * Validate UUID format
 */
export function validateUUID(uuid: string): boolean {
  if (typeof uuid !== 'string') {
    return false
  }

  return validator.isUUID(uuid)
}

/**
 * Sanitize integer input
 */
export function sanitizeInteger(input: any, min?: number, max?: number): number {
  const num = parseInt(input, 10)

  if (isNaN(num)) {
    throw new Error('Invalid integer')
  }

  if (min !== undefined && num < min) {
    throw new Error(`Value must be at least ${min}`)
  }

  if (max !== undefined && num > max) {
    throw new Error(`Value must be at most ${max}`)
  }

  return num
}

/**
 * Sanitize float input
 */
export function sanitizeFloat(input: any, min?: number, max?: number): number {
  const num = parseFloat(input)

  if (isNaN(num)) {
    throw new Error('Invalid number')
  }

  if (min !== undefined && num < min) {
    throw new Error(`Value must be at least ${min}`)
  }

  if (max !== undefined && num > max) {
    throw new Error(`Value must be at most ${max}`)
  }

  return num
}

/**
 * Sanitize boolean input
 */
export function sanitizeBoolean(input: any): boolean {
  if (typeof input === 'boolean') {
    return input
  }

  if (typeof input === 'string') {
    const lower = input.toLowerCase().trim()
    if (lower === 'true' || lower === '1' || lower === 'yes') {
      return true
    }
    if (lower === 'false' || lower === '0' || lower === 'no') {
      return false
    }
  }

  if (typeof input === 'number') {
    return input !== 0
  }

  throw new Error('Invalid boolean value')
}

/**
 * Rate limiting helper - check if string exceeds max length
 */
export function checkMaxLength(input: string, maxLength: number, fieldName: string = 'Input'): void {
  if (input.length > maxLength) {
    throw new Error(`${fieldName} exceeds maximum length of ${maxLength} characters`)
  }
}

/**
 * Sanitize search query
 */
export function sanitizeSearchQuery(query: string, maxLength: number = 200): string {
  if (typeof query !== 'string') {
    throw new Error('Search query must be a string')
  }

  checkMaxLength(query, maxLength, 'Search query')
  
  // Remove special characters that could be used for injection
  let safe = query.trim()
  
  // Allow only alphanumeric, spaces, and basic punctuation
  safe = safe.replace(/[^\w\s\u0590-\u05FF.,!?-]/g, '')
  
  return safe
}

/**
 * Content moderation - check for prohibited content
 */
export function checkProhibitedContent(text: string): { safe: boolean; reason?: string } {
  if (typeof text !== 'string') {
    return { safe: false, reason: 'Invalid input type' }
  }

  // Check for SQL injection patterns
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/gi,
    /(--|\*\/|\/\*)/g,
    /('|"|;|\\)/g,
  ]

  for (const pattern of sqlPatterns) {
    if (pattern.test(text)) {
      return { safe: false, reason: 'Potential SQL injection detected' }
    }
  }

  // Check for script injection
  const scriptPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi, // onclick, onload, etc.
  ]

  for (const pattern of scriptPatterns) {
    if (pattern.test(text)) {
      return { safe: false, reason: 'Potential XSS detected' }
    }
  }

  return { safe: true }
}

/**
 * Export all sanitization functions
 */
export const sanitizer = {
  sanitizeString,
  sanitizeEmail,
  sanitizeHTML,
  sanitizeObject,
  sanitizeURL,
  sanitizeFilename,
  validateUUID,
  sanitizeInteger,
  sanitizeFloat,
  sanitizeBoolean,
  checkMaxLength,
  sanitizeSearchQuery,
  checkProhibitedContent,
}
