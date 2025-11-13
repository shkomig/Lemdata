# Lemdata System Running Guide

## 📋 Overview
This guide provides step-by-step instructions for running the Lemdata educational platform with proper port configuration.

**Date:** November 12, 2025  
**Backend Port:** 3001  
**Frontend Port:** 3000

---

## ⚙️ Port Configuration

### Backend Configuration
The backend runs on **port 3001** to avoid conflicts. Configuration is located in:

**File:** `/backend/.env`
```env
PORT=3001
HOST=0.0.0.0
CORS_ORIGIN=http://localhost:3000
```

### Frontend Configuration
The frontend runs on **port 3000** and connects to the backend on port 3001.

**File:** `/frontend/.env.local`
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME=Lemdata
```

**File:** `/frontend/package.json`
```json
{
  "scripts": {
    "dev": "next dev -p 3000",
    "start": "next start -p 3000"
  }
}
```

---

## 🐳 Prerequisites

### 1. Docker Desktop
Ensure Docker Desktop is running on Windows. The following services are required:
- **PostgreSQL** (port 5432)
- **Redis** (port 6379)
- **MinIO** (ports 9010, 9011)
- **pgAdmin** (port 8080)

### 2. Node.js
- Version: **>=18.0.0**
- Check with: `node --version`

### 3. npm
- Version: **>=9.0.0**
- Check with: `npm --version`

---

## 🚀 Starting the System

### Option 1: Start Everything at Once (Recommended)

```bash
# 1. Navigate to project root
cd /mnt/c/Vs-Pro/Lemdata

# 2. Start Docker services
docker-compose up -d

# 3. Wait for services to be healthy (30 seconds)
sleep 30

# 4. Start both frontend and backend
npm run dev
```

### Option 2: Start Services Individually

```bash
# Terminal 1: Start Docker services
cd /mnt/c/Vs-Pro/Lemdata
docker-compose up -d

# Terminal 2: Start Backend (Port 3001)
cd /mnt/c/Vs-Pro/Lemdata/backend
npm run dev

# Terminal 3: Start Frontend (Port 3000)
cd /mnt/c/Vs-Pro/Lemdata/frontend
npm run dev
```

---

## 🌐 Access Points

Once the system is running, access the following URLs:

### Main Application
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001
- **API Documentation (Swagger):** http://localhost:3001/docs

### Database & Storage Management
- **pgAdmin:** http://localhost:8080
  - Email: `admin@lemdata.com`
  - Password: `admin123`
- **MinIO Console:** http://localhost:9011
  - Username: `lemdata`
  - Password: `4rysgEhmyHOAXbCux8brvRiwibWCIH+3CPmT5KF22QA=`

### Database Connection (for pgAdmin)
- **Host:** `lemdata-postgres` (or `localhost`)
- **Port:** `5432`
- **Database:** `lemdata`
- **Username:** `lemdata`
- **Password:** `NUe8jP88Jh93JNMk97xN1ZUla7SsoynJEhIUhyURs9o=`

---

## ✅ Verification Checklist

### 1. Check Docker Services
```bash
docker ps
```
Expected output should show 4 containers running:
- `lemdata-postgres`
- `lemdata-redis`
- `lemdata-minio`
- `lemdata-pgadmin`

### 2. Check Backend
```bash
curl http://localhost:3001/health
```
Expected response: `{"status":"ok"}`

### 3. Check Frontend
Open browser and navigate to: http://localhost:3000

### 4. Check Port Usage
```bash
# Check what's running on each port
lsof -i :3000  # Frontend
lsof -i :3001  # Backend
lsof -i :5432  # PostgreSQL
lsof -i :6379  # Redis
```

---

## 🛠️ Troubleshooting

### Backend Won't Start - Port 3000 Conflict
**Problem:** Backend tries to use port 3000 which is already taken.

**Solution:** Already fixed! Backend is configured to use port 3001.
```bash
# Verify configuration
cat backend/.env | grep PORT
# Should show: PORT=3001
```

### Docker Services Not Running
**Problem:** "Cannot connect to Docker daemon"

**Solution:**
1. Open Docker Desktop on Windows
2. Wait for it to fully start
3. Verify with: `docker ps`
4. Restart services: `docker-compose up -d`

### tsx Command Not Found
**Problem:** `sh: 1: tsx: not found`

**Solution:** This has been fixed by using `npx tsx` in package.json scripts.
```bash
# If you still encounter issues, reinstall dependencies
cd backend
rm -rf node_modules package-lock.json
npm install
```

### Database Connection Failed
**Problem:** "Failed to connect to database"

**Solution:**
```bash
# 1. Check if PostgreSQL is running
docker ps | grep postgres

# 2. Check database health
docker exec lemdata-postgres pg_isready -U lemdata

# 3. Restart PostgreSQL if needed
docker-compose restart postgres

# 4. Wait 10 seconds and try again
```

### CORS Errors in Browser
**Problem:** Frontend can't connect to backend due to CORS.

**Solution:** Verify CORS_ORIGIN in backend/.env matches frontend port:
```bash
# Should be set to frontend URL
CORS_ORIGIN=http://localhost:3000
```

### Port Already in Use
**Problem:** "Address already in use"

**Solution:**
```bash
# Find what's using the port (example for 3001)
lsof -i :3001

# Kill the process
kill -9 <PID>

# Or restart the service
```

---

## 🔄 Stopping the System

### Stop All Services
```bash
cd /mnt/c/Vs-Pro/Lemdata

# Stop Docker services
docker-compose down

# Stop frontend/backend (Ctrl+C in their terminals)
```

### Stop Docker Services Only (Keep Data)
```bash
docker-compose stop
```

### Stop and Remove All Data (⚠️ Careful!)
```bash
docker-compose down -v  # Removes volumes/data too
```

---

## 📊 Database Management

### Initialize Database (First Time)
```bash
cd backend

# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed initial data (optional)
npm run db:seed
```

### Open Prisma Studio
```bash
cd backend
npm run db:studio
```
Access at: http://localhost:5555

---

## 🧪 Testing

### Run Backend Tests
```bash
cd backend
npm run test           # Run once
npm run test:watch     # Watch mode
npm run test:coverage  # With coverage
```

### Run Frontend Tests
```bash
cd frontend
npm run test           # Run once
npm run test:watch     # Watch mode
npm run test:ui        # UI mode
```

---

## 📝 Development Scripts

### Root Directory
```bash
npm run dev              # Start both frontend & backend
npm run dev:backend      # Start backend only
npm run dev:frontend     # Start frontend only
npm run build            # Build both
npm run start            # Start production mode
npm run setup            # Install all dependencies
npm run lint             # Lint all code
```

### Backend Directory
```bash
npm run dev              # Development mode with watch
npm run build            # Compile TypeScript
npm run start            # Production mode
npm run db:generate      # Generate Prisma client
npm run db:push          # Push schema to DB
npm run db:studio        # Open Prisma Studio
npm run db:seed          # Seed database
npm run lint             # Run ESLint
npm run test             # Run tests
```

### Frontend Directory
```bash
npm run dev              # Development mode
npm run build            # Production build
npm run start            # Production mode
npm run lint             # Run ESLint
npm run type-check       # TypeScript check
npm run test             # Run tests
```

---

## 🔐 Security Notes

1. **Environment Variables:** Never commit `.env` files to git
2. **API Keys:** Add your Gemini API key to `backend/.env`:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```
3. **Production:** Change all default passwords before deploying
4. **CORS:** Update CORS_ORIGIN in production to match your domain

---

## 📖 Additional Resources

- **Main README:** `/README.md`
- **API Documentation:** http://localhost:3001/docs (when backend is running)
- **Architecture Review:** `/ARCHITECTURE_REVIEW.md`
- **Setup Instructions:** `/SETUP_INSTRUCTIONS.md`
- **Security Guide:** `/SECURITY.md`

---

## 🆘 Getting Help

If you encounter issues not covered in this guide:

1. Check the logs:
   ```bash
   # Backend logs
   cd backend && npm run dev
   
   # Docker logs
   docker-compose logs -f
   
   # Specific service logs
   docker logs lemdata-postgres
   docker logs lemdata-redis
   ```

2. Review existing documentation in the project root
3. Check the GitHub issues (if applicable)

---

## ✨ System Status

### Current Configuration
- ✅ Backend port changed from 3000 to 3001
- ✅ Frontend configured to connect to port 3001
- ✅ CORS properly configured
- ✅ Docker services defined and ready
- ✅ Development scripts updated with npx

### What's Working
- ✅ Frontend runs on port 3000
- ✅ Backend configured for port 3001
- ✅ All configuration files updated
- ✅ Package.json scripts fixed

### Next Steps
1. Start Docker Desktop on Windows
2. Run `docker-compose up -d` to start services
3. Run `npm run dev` to start the application
4. Access the application at http://localhost:3000

---

**Last Updated:** November 12, 2025  
**Version:** 1.0.0
