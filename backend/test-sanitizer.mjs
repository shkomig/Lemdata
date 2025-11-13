// Manual test for sanitizer
import {
  sanitizeString,
  sanitizeEmail,
  checkProhibitedContent,
  sanitizeFilename,
} from './utils/sanitizer.js'

console.log('🧪 Testing Sanitizer Functions...\n')

// Test 1: sanitizeString with XSS attempt
console.log('Test 1: XSS Prevention')
const xssInput = '<script>alert("xss")</script>Hello'
const xssResult = sanitizeString(xssInput)
console.log(`Input: ${xssInput}`)
console.log(`Output: ${xssResult}`)
console.log(`✅ Pass: ${!xssResult.includes('<script>')}\n`)

// Test 2: sanitizeEmail
console.log('Test 2: Email Sanitization')
try {
  const email = sanitizeEmail('  User@Example.COM  ')
  console.log(`Input: "  User@Example.COM  "`)
  console.log(`Output: ${email}`)
  console.log(`✅ Pass: ${email === 'user@example.com'}\n`)
} catch (e) {
  console.log(`❌ Fail: ${e.message}\n`)
}

// Test 3: Prohibited content detection
console.log('Test 3: SQL Injection Detection')
const sqlInput = "'; DROP TABLE users; --"
const sqlCheck = checkProhibitedContent(sqlInput)
console.log(`Input: ${sqlInput}`)
console.log(`Safe: ${sqlCheck.safe}`)
console.log(`Reason: ${sqlCheck.reason}`)
console.log(`✅ Pass: ${!sqlCheck.safe}\n`)

// Test 4: Safe Hebrew content
console.log('Test 4: Hebrew Content (Safe)')
const hebrewInput = 'שאלה במתמטיקה'
const hebrewResult = sanitizeString(hebrewInput)
const hebrewCheck = checkProhibitedContent(hebrewInput)
console.log(`Input: ${hebrewInput}`)
console.log(`Output: ${hebrewResult}`)
console.log(`Safe: ${hebrewCheck.safe}`)
console.log(`✅ Pass: ${hebrewResult === hebrewInput && hebrewCheck.safe}\n`)

// Test 5: Filename sanitization
console.log('Test 5: Path Traversal Prevention')
const fileInput = '../../etc/passwd'
const fileResult = sanitizeFilename(fileInput)
console.log(`Input: ${fileInput}`)
console.log(`Output: ${fileResult}`)
console.log(`✅ Pass: ${!fileResult.includes('..')}\n`)

console.log('✅ All manual tests completed!')
