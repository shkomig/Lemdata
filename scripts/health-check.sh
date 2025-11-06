#!/bin/bash

# Lemdata System Health Check Script
# This script checks the health of all system components

set -e

echo "🏥 Lemdata System Health Check"
echo "================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Node.js
echo -n "Checking Node.js... "
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✓${NC} $NODE_VERSION"
else
    echo -e "${RED}✗ Not installed${NC}"
    exit 1
fi

# Check npm
echo -n "Checking npm... "
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}✓${NC} $NPM_VERSION"
else
    echo -e "${RED}✗ Not installed${NC}"
    exit 1
fi

# Check Docker
echo -n "Checking Docker... "
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version | cut -d' ' -f3 | tr -d ',')
    echo -e "${GREEN}✓${NC} $DOCKER_VERSION"
else
    echo -e "${YELLOW}⚠${NC} Not installed (optional)"
fi

# Check dependencies
echo ""
echo "Checking Dependencies..."
echo "------------------------"

# Backend dependencies
echo -n "Backend node_modules... "
if [ -d "backend/node_modules" ]; then
    echo -e "${GREEN}✓ Installed${NC}"
else
    echo -e "${RED}✗ Not installed${NC}"
fi

# Frontend dependencies
echo -n "Frontend node_modules... "
if [ -d "frontend/node_modules" ]; then
    echo -e "${GREEN}✓ Installed${NC}"
else
    echo -e "${RED}✗ Not installed${NC}"
fi

# Check configuration files
echo ""
echo "Checking Configuration..."
echo "-------------------------"

# Backend .env
echo -n "Backend .env file... "
if [ -f "backend/.env" ]; then
    echo -e "${GREEN}✓ Exists${NC}"
else
    echo -e "${YELLOW}⚠ Missing (copy from .env.example)${NC}"
fi

# Frontend .env
echo -n "Frontend .env file... "
if [ -f "frontend/.env" ]; then
    echo -e "${GREEN}✓ Exists${NC}"
else
    echo -e "${YELLOW}⚠ Missing (copy from .env.example)${NC}"
fi

# Check TypeScript compilation
echo ""
echo "Checking TypeScript..."
echo "----------------------"

# Backend TypeScript
echo -n "Backend TypeScript... "
cd backend
if npm run type-check > /dev/null 2>&1; then
    echo -e "${GREEN}✓ No errors${NC}"
else
    echo -e "${RED}✗ Has errors${NC}"
fi
cd ..

# Frontend TypeScript
echo -n "Frontend TypeScript... "
cd frontend
if npm run type-check > /dev/null 2>&1; then
    echo -e "${GREEN}✓ No errors${NC}"
else
    echo -e "${RED}✗ Has errors${NC}"
fi
cd ..

# Check tests
echo ""
echo "Checking Tests..."
echo "-----------------"

# Backend tests
echo -n "Backend tests... "
cd backend
if npm test > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Passing${NC}"
else
    echo -e "${RED}✗ Failing${NC}"
fi
cd ..

# Frontend tests
echo -n "Frontend tests... "
cd frontend
if npm test > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Passing${NC}"
else
    echo -e "${RED}✗ Failing${NC}"
fi
cd ..

# Check Docker services
echo ""
echo "Checking Docker Services..."
echo "---------------------------"

if command -v docker &> /dev/null; then
    # Check if services are running
    echo -n "PostgreSQL container... "
    if docker ps | grep -q "lemdata-postgres"; then
        echo -e "${GREEN}✓ Running${NC}"
    else
        echo -e "${YELLOW}⚠ Not running${NC}"
    fi

    echo -n "Redis container... "
    if docker ps | grep -q "lemdata-redis"; then
        echo -e "${GREEN}✓ Running${NC}"
    else
        echo -e "${YELLOW}⚠ Not running${NC}"
    fi

    echo -n "MinIO container... "
    if docker ps | grep -q "lemdata-minio"; then
        echo -e "${GREEN}✓ Running${NC}"
    else
        echo -e "${YELLOW}⚠ Not running${NC}"
    fi

    echo -n "pgAdmin container... "
    if docker ps | grep -q "lemdata-pgadmin"; then
        echo -e "${GREEN}✓ Running${NC}"
    else
        echo -e "${YELLOW}⚠ Not running${NC}"
    fi
else
    echo -e "${YELLOW}⚠ Docker not available - skipping${NC}"
fi

echo ""
echo "================================"
echo -e "${GREEN}Health check complete!${NC}"
