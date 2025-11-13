# 🔧 Backend Server Crash Troubleshooting Guide

**Created:** November 12, 2025  
**Status:** Diagnostic Guide for Server Crashes

---

## 🚨 Common Crash Causes

### 1. Database Connection Issues
**Symptom:** Server crashes immediately after startup
**Error Message:** "Failed to connect to database"

**Causes:**
- PostgreSQL container not running
- Wrong database credentials
- Database not ready when server starts

**Solution:**
```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Check database health
docker exec lemdata-postgres pg_isready -U lemdata

# Restart PostgreSQL if needed
docker-compose restart postgres

# Wait 10 seconds before starting backend
sleep 10
```

---

### 2. Redis Connection Issues
**Symptom:** Server crashes during startup
**Error Message:** "Failed to connect to Redis"

**Causes:**
- Redis container not running
- Wrong Redis connection URL

**Solution:**
```bash
# Check if Redis is running
docker ps | grep redis

# Test Redis connection
docker exec lemdata-redis redis-cli ping

# Should return: PONG

# Restart Redis if needed
docker-compose restart redis
```

---

### 3. Port Already in Use
**Symptom:** Server crashes with EADDRINUSE error
**Error Message:** "Address already in use :::3001"

**Causes:**
- Another process using port 3001
- Previous backend instance not properly closed

**Solution:**
```bash
# Find what's using port 3001
lsof -i :3001

# Kill the process
kill -9 $(lsof -t -i :3001)

# Or use the PID from lsof output
# kill -9 <PID>

# Then restart backend
npm run dev
```

---

### 4. Missing Environment Variables
**Symptom:** Server crashes during initialization
**Error Message:** Various, depending on missing variable

**Causes:**
- .env file missing
- Critical variables not set
- Wrong variable values

**Solution:**
```bash
# Check if .env exists
ls -la backend/.env

# Verify critical variables
cat backend/.env | grep -E "PORT|DATABASE_URL|JWT_SECRET|REDIS_URL"

# Make sure these are set:
# PORT=3001
# DATABASE_URL=postgresql://...
# JWT_SECRET=...
# REDIS_URL=redis://localhost:6379
```

---

### 5. Missing Dependencies
**Symptom:** Server crashes with module not found errors
**Error Message:** "Cannot find module 'xxx'"

**Causes:**
- node_modules not installed
- Package version conflicts
- Platform-specific binary issues (WSL)

**Solution:**
```bash
# Clean reinstall
cd backend
rm -rf node_modules package-lock.json
npm install

# Force reinstall a specific package
npm install <package-name> --force
```

---

### 6. Memory Issues
**Symptom:** Server crashes randomly during operation
**Error Message:** "JavaScript heap out of memory"

**Causes:**
- Memory leak in code
- Too many requests
- Large dataset processing

**Solution:**
```bash
# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"
npm run dev

# Or modify package.json:
"dev": "NODE_OPTIONS='--max-old-space-size=4096' npx tsx watch src/server.ts"
```

---

### 7. File Watch Issues (tsx/nodemon)
**Symptom:** Server crashes when files change
**Error Message:** Various watch-related errors

**Causes:**
- Too many files being watched
- File system issues in WSL
- tsx not properly installed

**Solution:**
```bash
# Use npx to ensure tsx is available
npm run dev  # Already configured to use npx tsx

# If still failing, increase watch limit (WSL/Linux)
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

---

## 🔍 Diagnostic Steps

### Step 1: Check Backend Logs
Look for the actual error message:

```bash
cd /mnt/c/Vs-Pro/Lemdata/backend
npm run dev 2>&1 | tee backend-error.log
```

The log will show exactly where it's failing.

### Step 2: Use the Diagnostic Script
```bash
cd /mnt/c/Vs-Pro/Lemdata/backend
./start-backend.sh
```

This script checks all prerequisites before starting.

### Step 3: Check Docker Services
```bash
# Check all services
docker ps

# Check logs
docker-compose logs -f postgres
docker-compose logs -f redis

# Restart all services
docker-compose restart
```

### Step 4: Verify Configuration
```bash
# Check port configuration
cat backend/.env | grep PORT

# Check database URL
cat backend/.env | grep DATABASE_URL

# Verify all required variables
cat backend/.env
```

---

## 🛠️ Quick Fixes

### Complete Reset (Nuclear Option)
```bash
# Stop everything
docker-compose down
cd backend
rm -rf node_modules package-lock.json

# Restart Docker services
cd ..
docker-compose up -d

# Wait for services to be ready
sleep 30

# Reinstall backend
cd backend
npm install

# Start backend
npm run dev
```

### Just Restart Backend
```bash
# Kill any existing process
kill -9 $(lsof -t -i :3001) 2>/dev/null || true

# Start fresh
cd /mnt/c/Vs-Pro/Lemdata/backend
npm run dev
```

### Check Service Health
```bash
# PostgreSQL
docker exec lemdata-postgres pg_isready -U lemdata

# Redis
docker exec lemdata-redis redis-cli ping

# MinIO
curl -I http://localhost:9010/minio/health/live
```

---

## 📊 Current Known Issues

### Issue: Backend crashes randomly
**Status:** ✅ Resolved - Using npx tsx in package.json

### Issue: Database connection refused
**Status:** ⚠️ Check if Docker is running

### Issue: Port 3001 in use
**Status:** ✅ Use start-backend.sh to auto-detect and fix

---

## 🧪 Testing Backend Stability

After starting the backend, test it:

```bash
# Test 1: Health endpoint
curl http://localhost:3001/health

# Test 2: Register endpoint (should get validation error)
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{}'

# Test 3: Load test (optional)
for i in {1..10}; do
  curl -s http://localhost:3001/health > /dev/null
  echo "Request $i completed"
done
```

---

## 📝 Error Log Analysis

### Common Error Patterns

**Pattern 1: Immediate crash**
```
Failed to connect to database
```
→ Docker services not running

**Pattern 2: Delayed crash**
```
Unexpected error occurred
TypeError: Cannot read property 'x' of undefined
```
→ Code error, check request data

**Pattern 3: Random crashes**
```
ECONNRESET
EPIPE
```
→ Database/Redis connection lost

**Pattern 4: Out of memory**
```
FATAL ERROR: Reached heap limit
```
→ Increase Node memory limit

---

## 🚀 Stable Startup Procedure

**Recommended startup sequence:**

1. **Start Docker services first**
   ```bash
   cd /mnt/c/Vs-Pro/Lemdata
   docker-compose up -d
   ```

2. **Wait for services to be healthy** (30 seconds)
   ```bash
   sleep 30
   ```

3. **Verify services**
   ```bash
   docker ps
   docker exec lemdata-postgres pg_isready -U lemdata
   docker exec lemdata-redis redis-cli ping
   ```

4. **Start backend with diagnostic script**
   ```bash
   cd backend
   ./start-backend.sh
   ```

5. **Monitor for 60 seconds**
   - Watch for any error messages
   - Test health endpoint
   - Check if port 3001 stays active

---

## 🔧 Production Stability Improvements

### Add Process Manager (PM2)
```bash
# Install PM2
npm install -g pm2

# Start backend with PM2
pm2 start "npm run dev" --name lemdata-backend

# Monitor
pm2 logs lemdata-backend

# Auto-restart on crash
pm2 startup
pm2 save
```

### Add Health Monitoring
```bash
# Create a monitoring script
watch -n 5 'curl -s http://localhost:3001/health || echo "Backend DOWN!"'
```

---

## 📞 If Nothing Works

1. **Capture full error log:**
   ```bash
   cd /mnt/c/Vs-Pro/Lemdata/backend
   npm run dev 2>&1 | tee full-crash-log.txt
   ```

2. **Check system resources:**
   ```bash
   free -h    # Memory
   df -h      # Disk space
   top        # CPU usage
   ```

3. **Verify Node.js version:**
   ```bash
   node --version  # Should be >= 18.0.0
   npm --version   # Should be >= 9.0.0
   ```

4. **Try production mode:**
   ```bash
   npm run build
   npm start
   ```

---

**Last Updated:** November 12, 2025  
**Current Status:** Backend running on port 3001  
**Process ID:** Check with `lsof -i :3001`
