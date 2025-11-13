#!/bin/bash
# Backend Server Diagnostic and Startup Script
# Location: /mnt/c/Vs-Pro/Lemdata/backend/start-backend.sh

set -e  # Exit on error

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║         Lemdata Backend Server Diagnostic Startup            ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print status
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
        return 1
    fi
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

echo "🔍 Running Pre-flight Checks..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check 1: Docker Services
echo "📦 Checking Docker Services..."
if docker ps | grep -q "lemdata-postgres"; then
    print_status 0 "PostgreSQL container running"
else
    print_status 1 "PostgreSQL container NOT running"
    echo "   Run: docker-compose up -d"
    exit 1
fi

if docker ps | grep -q "lemdata-redis"; then
    print_status 0 "Redis container running"
else
    print_status 1 "Redis container NOT running"
    echo "   Run: docker-compose up -d"
    exit 1
fi

if docker ps | grep -q "lemdata-minio"; then
    print_status 0 "MinIO container running"
else
    print_status 1 "MinIO container NOT running"
    echo "   Run: docker-compose up -d"
    exit 1
fi

echo ""

# Check 2: Port Availability
echo "🔌 Checking Port Availability..."
if lsof -i :3001 > /dev/null 2>&1; then
    print_warning "Port 3001 is already in use"
    echo "   Current process:"
    lsof -i :3001 | grep -v COMMAND
    read -p "   Kill existing process and continue? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        PID=$(lsof -t -i :3001)
        kill -9 $PID 2>/dev/null || true
        sleep 2
        print_status 0 "Killed process on port 3001"
    else
        echo "   Exiting..."
        exit 1
    fi
else
    print_status 0 "Port 3001 is available"
fi

echo ""

# Check 3: Database Connectivity
echo "🗄️  Checking Database Connectivity..."
if docker exec lemdata-postgres pg_isready -U lemdata > /dev/null 2>&1; then
    print_status 0 "PostgreSQL is ready"
else
    print_status 1 "PostgreSQL is not ready"
    echo "   Wait a few seconds and try again"
    exit 1
fi

echo ""

# Check 4: Redis Connectivity
echo "💾 Checking Redis Connectivity..."
if docker exec lemdata-redis redis-cli ping 2>/dev/null | grep -q "PONG"; then
    print_status 0 "Redis is responding"
else
    print_status 1 "Redis is not responding"
    exit 1
fi

echo ""

# Check 5: Environment Variables
echo "🔧 Checking Environment Variables..."
if [ -f ".env" ]; then
    print_status 0 ".env file exists"
    
    # Check critical variables
    if grep -q "PORT=3001" .env; then
        print_status 0 "PORT is set to 3001"
    else
        print_warning "PORT is not set to 3001"
    fi
    
    if grep -q "DATABASE_URL" .env; then
        print_status 0 "DATABASE_URL is configured"
    else
        print_status 1 "DATABASE_URL is missing"
        exit 1
    fi
    
    if grep -q "JWT_SECRET" .env; then
        print_status 0 "JWT_SECRET is configured"
    else
        print_status 1 "JWT_SECRET is missing"
        exit 1
    fi
else
    print_status 1 ".env file not found"
    exit 1
fi

echo ""

# Check 6: Node Modules
echo "📚 Checking Dependencies..."
if [ -d "node_modules" ]; then
    print_status 0 "node_modules directory exists"
else
    print_status 1 "node_modules not found - installing..."
    npm install
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ All pre-flight checks passed!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🚀 Starting Backend Server..."
echo ""

# Start the server
npm run dev
