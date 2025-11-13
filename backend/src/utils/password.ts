/**
 * Password Utilities
 * 
 * Provides password validation, strength checking, and security features.
 * 
 * @module utils/password
 */

export interface PasswordStrength {
  score: number // 0-4 (0=very weak, 4=very strong)
  feedback: string[]
  isValid: boolean
}

/**
 * Check password strength and provide feedback
 */
export function checkPasswordStrength(password: string): PasswordStrength {
  const feedback: string[] = []
  let score = 0

  // Length check
  if (password.length < 8) {
    feedback.push('Password is too short (minimum 12 characters recommended)')
  } else if (password.length < 12) {
    feedback.push('Password could be longer (12+ characters recommended)')
    score += 1
  } else if (password.length >= 12 && password.length < 16) {
    score += 2
  } else {
    score += 3
  }

  // Character variety checks
  const hasLowercase = /[a-z]/.test(password)
  const hasUppercase = /[A-Z]/.test(password)
  const hasNumbers = /[0-9]/.test(password)
  const hasSpecialChars = /[^a-zA-Z0-9]/.test(password)

  if (!hasLowercase) {
    feedback.push('Add lowercase letters')
  }
  if (!hasUppercase) {
    feedback.push('Add uppercase letters')
  }
  if (!hasNumbers) {
    feedback.push('Add numbers')
  }
  if (!hasSpecialChars) {
    feedback.push('Add special characters (!@#$%^&*)')
  }

  // Add points for character variety
  const varietyCount = [hasLowercase, hasUppercase, hasNumbers, hasSpecialChars].filter(Boolean).length
  score += varietyCount

  // Check for common patterns
  const commonPatterns = [
    /^123456/,
    /^password/i,
    /^qwerty/i,
    /^abc123/i,
    /^letmein/i,
    /^admin/i,
    /^welcome/i,
    /(.)\1{3,}/, // Repeated characters (aaaa, 1111)
    /^[0-9]+$/, // Only numbers
    /^[a-zA-Z]+$/, // Only letters
  ]

  for (const pattern of commonPatterns) {
    if (pattern.test(password)) {
      feedback.push('Avoid common patterns and repeated characters')
      score = Math.max(0, score - 2)
      break
    }
  }

  // Sequential characters check
  if (hasSequentialChars(password)) {
    feedback.push('Avoid sequential characters (abc, 123)')
    score = Math.max(0, score - 1)
  }

  // Normalize score to 0-4
  score = Math.min(4, Math.max(0, Math.floor(score / 2)))

  // Determine if valid (minimum requirements met)
  const isValid =
    password.length >= 12 &&
    hasLowercase &&
    hasUppercase &&
    hasNumbers &&
    hasSpecialChars

  // Add encouraging feedback for strong passwords
  if (score >= 3 && isValid) {
    feedback.unshift('Strong password!')
  } else if (score === 2 && isValid) {
    feedback.unshift('Good password')
  }

  return {
    score,
    feedback: feedback.length > 0 ? feedback : ['Password meets minimum requirements'],
    isValid,
  }
}

/**
 * Check for sequential characters
 */
function hasSequentialChars(password: string): boolean {
  const sequences = [
    'abcdefghijklmnopqrstuvwxyz',
    '0123456789',
    'qwertyuiop',
    'asdfghjkl',
    'zxcvbnm',
  ]

  const lowerPassword = password.toLowerCase()

  for (const sequence of sequences) {
    for (let i = 0; i < sequence.length - 2; i++) {
      const chunk = sequence.substring(i, i + 3)
      if (lowerPassword.includes(chunk)) {
        return true
      }
      // Check reverse too
      const reverseChunk = chunk.split('').reverse().join('')
      if (lowerPassword.includes(reverseChunk)) {
        return true
      }
    }
  }

  return false
}

/**
 * Validate password meets minimum security requirements
 */
export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (password.length < 12) {
    errors.push('Password must be at least 12 characters long')
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number')
  }

  if (!/[^a-zA-Z0-9]/.test(password)) {
    errors.push('Password must contain at least one special character')
  }

  // Check against common passwords
  if (isCommonPassword(password)) {
    errors.push('This password is too common. Please choose a more unique password')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Check if password is in common password list
 */
function isCommonPassword(password: string): boolean {
  const commonPasswords = [
    'password',
    'password123',
    '123456',
    '12345678',
    'qwerty',
    'abc123',
    'monkey',
    '1234567',
    'letmein',
    'trustno1',
    'dragon',
    'baseball',
    'iloveyou',
    'master',
    'sunshine',
    'ashley',
    'bailey',
    'shadow',
    '123123',
    '654321',
    'superman',
    'qazwsx',
    'michael',
    'football',
    'welcome',
    'jesus',
    'admin',
    'admin123',
    'root',
    'toor',
    'pass',
    'test',
    'guest',
    'info',
    'adm',
    'mysql',
    'user',
    'administrator',
    'oracle',
    'ftp',
    'pi',
    'puppet',
    'ansible',
    'ec2-user',
    'vagrant',
    'azureuser',
  ]

  const lowerPassword = password.toLowerCase()
  return commonPasswords.some(common => lowerPassword.includes(common))
}

/**
 * Generate password strength description
 */
export function getPasswordStrengthLabel(score: number): string {
  switch (score) {
    case 0:
      return 'Very Weak'
    case 1:
      return 'Weak'
    case 2:
      return 'Fair'
    case 3:
      return 'Strong'
    case 4:
      return 'Very Strong'
    default:
      return 'Unknown'
  }
}

/**
 * Get password strength color for UI
 */
export function getPasswordStrengthColor(score: number): string {
  switch (score) {
    case 0:
    case 1:
      return 'red'
    case 2:
      return 'orange'
    case 3:
      return 'yellow'
    case 4:
      return 'green'
    default:
      return 'gray'
  }
}

export const passwordUtils = {
  checkPasswordStrength,
  validatePassword,
  getPasswordStrengthLabel,
  getPasswordStrengthColor,
}
