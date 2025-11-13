# Security Headers Configuration

**Last Updated:** November 11, 2025

This document explains all security headers implemented in Lemdata.

---

## Headers Implemented

### 1. X-Content-Type-Options: nosniff
**Purpose:** Prevents MIME type sniffing  
**Protection:** Stops browsers from interpreting files as a different MIME type  
**Impact:** Prevents drive-by download attacks

### 2. X-Frame-Options: DENY
**Purpose:** Prevents clickjacking  
**Protection:** Prevents the site from being embedded in iframes  
**Impact:** Protects against UI redressing attacks

### 3. X-XSS-Protection: 1; mode=block
**Purpose:** XSS filter (legacy browsers)  
**Protection:** Enables browser's built-in XSS filter  
**Impact:** Additional layer for older browsers (IE, old Safari)

### 4. Strict-Transport-Security (HSTS)
**Value:** max-age=63072000; includeSubDomains; preload  
**Purpose:** Force HTTPS connections  
**Protection:** Prevents downgrade attacks and cookie hijacking  
**Impact:** Ensures all connections use HTTPS  
**Note:** Only enabled in production

### 5. Content-Security-Policy (CSP)
**Purpose:** Control resource loading  
**Protection:** Prevents XSS, code injection, and other attacks  

**Current Policy:**
```
default-src 'self'
script-src 'self' 'unsafe-inline' 'unsafe-eval'
style-src 'self' 'unsafe-inline'
img-src 'self' data: https:
font-src 'self' data:
connect-src 'self' http://localhost:3001 https://generativelanguage.googleapis.com
frame-ancestors 'none'
base-uri 'self'
form-action 'self'
```

**Production Recommendations:**
- Remove 'unsafe-inline' from script-src
- Remove 'unsafe-eval' from script-src
- Use nonces or hashes for inline scripts
- Restrict connect-src to specific domains

### 6. Permissions-Policy
**Value:** geolocation=(), microphone=(), camera=(), payment=()  
**Purpose:** Control browser features  
**Protection:** Disables unnecessary browser APIs  
**Impact:** Reduces attack surface

### 7. Referrer-Policy
**Value:** strict-origin-when-cross-origin  
**Purpose:** Control referrer information  
**Protection:** Limits information leakage in HTTP headers  
**Impact:** Balances privacy and functionality

---

## CSRF Protection

### Implementation
- **Library:** @fastify/csrf-protection
- **Method:** Double-submit cookie pattern
- **Token Storage:** Signed HTTP-only cookie

### Configuration
```typescript
{
  cookieOpts: {
    httpOnly: true,      // Prevents JavaScript access
    sameSite: 'strict',  // Prevents cross-site sending
    signed: true,        // Cryptographic signing
    secure: true         // HTTPS only (production)
  }
}
```

### Usage

**1. Get CSRF Token:**
```typescript
GET /auth/csrf-token
Response: { "token": "..." }
```

**2. Include in Requests:**
```typescript
// Option 1: Header
headers: {
  'x-csrf-token': token
}

// Option 2: Body
body: {
  _csrf: token,
  ...data
}
```

### Protected Routes
All state-changing operations (POST, PUT, DELETE) require CSRF tokens:
- User registration
- User login
- Chat messages
- File uploads
- Settings updates

---

## Security Checklist

### Backend
- [x] CSRF protection enabled
- [x] CORS configured with specific origin
- [x] Rate limiting implemented
- [x] Input sanitization
- [x] SQL injection prevention (Prisma ORM)
- [x] XSS prevention
- [x] Secure password policy
- [x] JWT authentication
- [ ] Refresh token rotation
- [ ] 2FA support

### Frontend
- [x] Security headers implemented
- [x] CSP configured
- [x] HSTS enabled (production)
- [x] X-Frame-Options set
- [ ] CSRF token integration
- [ ] Secure cookie settings
- [ ] Input validation on client

### Infrastructure
- [x] Secure secrets generation
- [x] Environment-specific configuration
- [ ] HTTPS enforcement
- [ ] Security monitoring
- [ ] Regular security audits

---

## Testing Security Headers

### Using curl
```bash
# Test security headers
curl -I https://yourdomain.com

# Should see:
# x-content-type-options: nosniff
# x-frame-options: DENY
# x-xss-protection: 1; mode=block
# strict-transport-security: max-age=63072000; includeSubDomains; preload
# content-security-policy: ...
# permissions-policy: ...
# referrer-policy: strict-origin-when-cross-origin
```

### Using Online Tools
- **Mozilla Observatory:** https://observatory.mozilla.org
- **Security Headers:** https://securityheaders.com
- **SSL Labs:** https://www.ssllabs.com/ssltest/

### Expected Scores
- Mozilla Observatory: A+ or A
- Security Headers: A
- SSL Labs: A+

---

## Common Issues & Solutions

### Issue: CSP blocking resources
**Solution:** Adjust CSP directives to allow specific sources

### Issue: CORS errors in development
**Solution:** Configure CORS_ORIGIN in .env

### Issue: CSRF token mismatch
**Solution:** Ensure token is included in all state-changing requests

### Issue: Mixed content warnings
**Solution:** Ensure all resources loaded over HTTPS in production

---

## Production Hardening

Before going to production:

1. **Enable HTTPS:**
   - Get SSL certificate (Let's Encrypt)
   - Configure reverse proxy (Nginx/Caddy)
   - Set secure flag on cookies

2. **Tighten CSP:**
   - Remove 'unsafe-inline'
   - Remove 'unsafe-eval'
   - Use nonces for inline scripts

3. **Rate Limiting:**
   - Lower limits for production
   - Per-IP tracking
   - Implement CAPTCHA for repeated failures

4. **Monitoring:**
   - Setup CSP violation reporting
   - Monitor failed authentication attempts
   - Alert on suspicious patterns

5. **Updates:**
   - Keep all dependencies updated
   - Subscribe to security advisories
   - Regular security scans

---

**Document Version:** 1.0  
**Next Review:** December 11, 2025
