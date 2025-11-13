import { describe, it, expect } from 'vitest'
import {
  sanitizeString,
  sanitizeEmail,
  sanitizeHTML,
  sanitizeFilename,
  sanitizeInteger,
  sanitizeSearchQuery,
  checkProhibitedContent,
  validateUUID,
} from '../utils/sanitizer'

describe('Sanitizer Utilities', () => {
  describe('sanitizeString', () => {
    it('should remove HTML tags', () => {
      const input = '<script>alert("xss")</script>Hello'
      const result = sanitizeString(input)
      expect(result).not.toContain('<script>')
      expect(result).not.toContain('</script>')
    })

    it('should escape dangerous characters', () => {
      const input = '<img src=x onerror=alert(1)>'
      const result = sanitizeString(input)
      expect(result).not.toContain('onerror')
    })

    it('should preserve safe text', () => {
      const input = 'Hello World! שלום עולם'
      const result = sanitizeString(input)
      expect(result).toBe(input)
    })

    it('should handle Hebrew text correctly', () => {
      const input = 'שאלה במתמטיקה'
      const result = sanitizeString(input)
      expect(result).toBe(input)
    })
  })

  describe('sanitizeEmail', () => {
    it('should normalize valid email', () => {
      const input = '  User@Example.COM  '
      const result = sanitizeEmail(input)
      expect(result).toBe('user@example.com')
    })

    it('should throw error for invalid email', () => {
      expect(() => sanitizeEmail('not-an-email')).toThrow('Invalid email format')
    })

    it('should handle Gmail dot normalization', () => {
      const input = 'user.name@gmail.com'
      const result = sanitizeEmail(input)
      expect(result).toBeTruthy()
    })
  })

  describe('sanitizeHTML', () => {
    it('should allow whitelisted tags', () => {
      const input = '<p>Hello <strong>World</strong></p>'
      const result = sanitizeHTML(input, ['p', 'strong'])
      expect(result).toContain('<p>')
      expect(result).toContain('<strong>')
    })

    it('should remove non-whitelisted tags', () => {
      const input = '<p>Hello <script>alert(1)</script></p>'
      const result = sanitizeHTML(input, ['p'])
      expect(result).not.toContain('<script>')
      expect(result).toContain('<p>')
    })

    it('should remove all tags when whitelist is empty', () => {
      const input = '<p>Hello <strong>World</strong></p>'
      const result = sanitizeHTML(input, [])
      expect(result).not.toContain('<p>')
      expect(result).not.toContain('<strong>')
      expect(result).toContain('Hello')
      expect(result).toContain('World')
    })
  })

  describe('sanitizeFilename', () => {
    it('should remove path traversal attempts', () => {
      const input = '../../etc/passwd'
      const result = sanitizeFilename(input)
      expect(result).not.toContain('..')
      expect(result).not.toContain('/')
    })

    it('should allow safe filenames', () => {
      const input = 'document-2024.pdf'
      const result = sanitizeFilename(input)
      expect(result).toBe('document-2024.pdf')
    })

    it('should replace unsafe characters', () => {
      const input = 'my file with spaces.txt'
      const result = sanitizeFilename(input)
      expect(result).toBe('my_file_with_spaces.txt')
    })

    it('should handle Hebrew filenames', () => {
      const input = 'מסמך.pdf'
      const result = sanitizeFilename(input)
      expect(result).toBeTruthy()
    })
  })

  describe('sanitizeInteger', () => {
    it('should parse valid integers', () => {
      expect(sanitizeInteger('123')).toBe(123)
      expect(sanitizeInteger(456)).toBe(456)
    })

    it('should throw error for invalid integers', () => {
      expect(() => sanitizeInteger('abc')).toThrow('Invalid integer')
    })

    it('should enforce minimum value', () => {
      expect(() => sanitizeInteger(5, 10)).toThrow('Value must be at least 10')
    })

    it('should enforce maximum value', () => {
      expect(() => sanitizeInteger(100, 0, 50)).toThrow('Value must be at most 50')
    })

    it('should accept values within range', () => {
      expect(sanitizeInteger(25, 0, 100)).toBe(25)
    })
  })

  describe('sanitizeSearchQuery', () => {
    it('should allow alphanumeric and Hebrew', () => {
      const input = 'search query חיפוש'
      const result = sanitizeSearchQuery(input)
      expect(result).toContain('search')
      expect(result).toContain('חיפוש')
    })

    it('should remove special characters', () => {
      const input = 'search<script>alert(1)</script>'
      const result = sanitizeSearchQuery(input)
      expect(result).not.toContain('<script>')
      expect(result).toContain('search')
    })

    it('should enforce max length', () => {
      const input = 'a'.repeat(300)
      expect(() => sanitizeSearchQuery(input, 200)).toThrow('exceeds maximum length')
    })
  })

  describe('checkProhibitedContent', () => {
    it('should detect SQL injection attempts', () => {
      const input = "'; DROP TABLE users; --"
      const result = checkProhibitedContent(input)
      expect(result.safe).toBe(false)
      expect(result.reason).toContain('SQL injection')
    })

    it('should detect XSS attempts', () => {
      const input = '<script>alert("xss")</script>'
      const result = checkProhibitedContent(input)
      expect(result.safe).toBe(false)
      expect(result.reason).toContain('XSS')
    })

    it('should detect event handler injection', () => {
      const input = '<img src=x onerror=alert(1)>'
      const result = checkProhibitedContent(input)
      expect(result.safe).toBe(false)
    })

    it('should allow safe content', () => {
      const input = 'This is a normal question about math'
      const result = checkProhibitedContent(input)
      expect(result.safe).toBe(true)
    })

    it('should allow Hebrew content', () => {
      const input = 'שאלה רגילה במתמטיקה'
      const result = checkProhibitedContent(input)
      expect(result.safe).toBe(true)
    })
  })

  describe('validateUUID', () => {
    it('should validate correct UUIDs', () => {
      const uuid = '123e4567-e89b-12d3-a456-426614174000'
      expect(validateUUID(uuid)).toBe(true)
    })

    it('should reject invalid UUIDs', () => {
      expect(validateUUID('not-a-uuid')).toBe(false)
      expect(validateUUID('12345')).toBe(false)
    })

    it('should reject non-string input', () => {
      expect(validateUUID(123 as any)).toBe(false)
      expect(validateUUID(null as any)).toBe(false)
    })
  })
})
