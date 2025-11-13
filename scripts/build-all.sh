#!/bin/bash

# Build All Services Script
# Builds all services with dependencies

set -e

echo "🚀 Building GRC Ecosystem - All Services"
echo "=========================================="

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to build service
build_service() {
    local service_name=$1
    local service_path=$2
    
    echo -e "${BLUE}📦 Building ${service_name}...${NC}"
    cd "$service_path"
    
    if [ -f "package.json" ]; then
        echo "  Installing dependencies..."
        npm install
        echo -e "${GREEN}  ✅ ${service_name} dependencies installed${NC}"
    else
        echo -e "${YELLOW}  ⚠️  No package.json found, skipping${NC}"
    fi
    
    cd - > /dev/null
    echo ""
}

# Build all services
echo -e "${BLUE}Building Backend Services...${NC}"
echo ""

# BFF
build_service "BFF" "apps/bff"

# Auth Service
build_service "Auth Service" "apps/services/auth-service"

# Document Service
build_service "Document Service" "apps/services/document-service"

# Partner Service
build_service "Partner Service" "apps/services/partner-service"

# Notification Service
build_service "Notification Service" "apps/services/notification-service"

# GRC API
build_service "GRC API" "apps/services/grc-api"

# Frontend
echo -e "${BLUE}Building Frontend...${NC}"
build_service "Frontend Web" "apps/web"

echo -e "${GREEN}✅ All services built successfully!${NC}"
echo ""
echo "Next steps:"
echo "  1. Copy .env.example files to .env in each service"
echo "  2. Update environment variables"
echo "  3. Run: docker-compose -f infra/docker/docker-compose.ecosystem.yml up"

