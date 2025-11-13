# Security Guide - Lemdata

**Last Updated:** November 11, 2025  
**Version:** 1.0

---

## 🔐 Secret Management

### Generating Secure Secrets

All secrets MUST be cryptographically secure random strings. Never use default or example values in production.

#### Generate JWT Secrets (Minimum 64 bytes)
```bash
# For JWT_SECRET
openssl rand -base64 64

# For JWT_REFRESH_SECRET
openssl rand -base64 64
```

#### Generate Database Passwords (Minimum 32 bytes)
```bash
# For POSTGRES_PASSWORD
openssl rand -base64 32
```

#### Generate MinIO Secrets (Minimum 32 bytes)
```bash
# For MINIO_SECRET_KEY
openssl rand -base64 32
```

### Secret Rotation Schedule

| Secret | Rotation Frequency | Priority |
|--------|-------------------|----------|
| JWT_SECRET | Every 90 days | CRITICAL |
| JWT_REFRESH_SECRET | Every 90 days | CRITICAL |
| POSTGRES_PASSWORD | Every 180 days | HIGH |
| MINIO_SECRET_KEY | Every 180 days | MEDIUM |
| API Keys | Per provider policy | HIGH |

### Environment-Specific Secrets

**NEVER** use the same secrets across different environments:

```bash
# Development
JWT_SECRET=<dev-specific-secret>

# Staging
JWT_SECRET=<staging-specific-secret>

# Production
JWT_SECRET=<production-specific-secret>
```

### Secret Storage Best Practices

#### Development
- Store in `.env` file (never commit to git)
- Use `.env.example` with placeholder values only
- Document how to generate secrets

#### Production
- Use environment variables
- Consider using secret management services:
  - AWS Secrets Manager
  - HashiCorp Vault
  - Azure Key Vault
  - Google Secret Manager

### Current Secrets Status

✅ **Completed (2025-11-11)**
- [x] JWT_SECRET - Generated 64-byte secure random string
- [x] JWT_REFRESH_SECRET - Generated 64-byte secure random string
- [x] POSTGRES_PASSWORD - Generated 32-byte secure random string
- [x] MINIO_SECRET_KEY - Generated 32-byte secure random string

⚠️ **Pending**
- [ ] GEMINI_API_KEY - To be added by developer
- [ ] HUGGINGFACE_API_KEY - To be added by developer

---

## 🛡️ Security Checklist

### Pre-Production
- [x] Generate all secure secrets
- [ ] Add input sanitization
- [ ] Implement CSRF protection
- [ ] Add security headers
- [ ] Enable HTTPS
- [ ] Setup rate limiting per endpoint
- [ ] Configure CORS properly
- [ ] Remove all debug/test code
- [ ] Disable verbose error messages

### Post-Deployment
- [ ] Setup monitoring alerts
- [ ] Enable audit logging
- [ ] Schedule security scans
- [ ] Plan secret rotation
- [ ] Review access logs regularly

---

## 🚨 Security Incident Response

### If Secrets Are Compromised

1. **Immediate Actions**
   - Rotate all affected secrets immediately
   - Invalidate all active JWT tokens
   - Force all users to re-login
   - Review access logs for suspicious activity

2. **Investigation**
   - Identify how the breach occurred
   - Document timeline of events
   - Assess impact on users and data

3. **Mitigation**
   - Fix the vulnerability
   - Deploy new secrets
   - Notify affected users if required
   - Update security documentation

4. **Post-Incident**
   - Conduct security audit
   - Implement additional safeguards
   - Update incident response plan

---

## 📝 Notes

- All secrets in this system have been generated using OpenSSL's cryptographically secure random number generator
- Secrets are base64 encoded for safe transmission and storage
- The actual secret values are stored ONLY in `.env` files which are git-ignored
- Production secrets MUST be different from development secrets
- Regular secret rotation is mandatory for production systems

---

**Document maintained by:** Security Team  
**Next Review Date:** February 11, 2026
