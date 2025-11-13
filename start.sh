#!/bin/bash

# GRC Assessment System - Quick Start Script
# This script helps you get started with the improved GRC system

set -e  # Exit on error

echo "🚀 GRC Assessment System - Quick Start"
echo "======================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env exists
check_env_file() {
    echo "📋 Checking environment configuration..."
    
    if [ ! -f "apps/bff/.env" ]; then
        echo -e "${YELLOW}⚠️  .env file not found in apps/bff/${NC}"
        echo "Creating from template..."
        
        if [ -f "apps/bff/.env.example" ]; then
            cp apps/bff/.env.example apps/bff/.env
            echo -e "${GREEN}✅ Created .env file${NC}"
            echo -e "${YELLOW}⚠️  IMPORTANT: Edit apps/bff/.env and set your secrets!${NC}"
            echo ""
            echo "Generate secrets with:"
            echo "  node -e \"console.log(require('crypto').randomBytes(64).toString('hex'))\""
            echo ""
            read -p "Press enter when you've configured .env..."
        else
            echo -e "${RED}❌ .env.example not found!${NC}"
            exit 1
        fi
    else
        echo -e "${GREEN}✅ .env file found${NC}"
    fi
    
    # Check if JWT_SECRET is set
    if grep -q "your-secure-jwt-secret-here" apps/bff/.env 2>/dev/null; then
        echo -e "${YELLOW}⚠️  Default JWT_SECRET detected! Please update your .env file.${NC}"
        exit 1
    fi
}

# Check Docker
check_docker() {
    echo ""
    echo "🐳 Checking Docker..."
    
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}❌ Docker not found! Please install Docker first.${NC}"
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        echo -e "${RED}❌ Docker daemon not running! Please start Docker.${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Docker is running${NC}"
}

# Check Node.js
check_node() {
    echo ""
    echo "📦 Checking Node.js..."
    
    if ! command -v node &> /dev/null; then
        echo -e "${RED}❌ Node.js not found! Please install Node.js 18+${NC}"
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        echo -e "${YELLOW}⚠️  Node.js version $NODE_VERSION detected. Version 18+ recommended.${NC}"
    else
        echo -e "${GREEN}✅ Node.js $(node -v) installed${NC}"
    fi
}

# Install dependencies
install_dependencies() {
    echo ""
    echo "📥 Installing dependencies..."
    
    # Root dependencies
    if [ -f "package.json" ]; then
        echo "Installing root dependencies..."
        npm install
    fi
    
    # BFF dependencies
    if [ -f "apps/bff/package.json" ]; then
        echo "Installing BFF dependencies..."
        cd apps/bff
        npm install
        cd ../..
    fi
    
    # Web dependencies
    if [ -f "apps/web/package.json" ]; then
        echo "Installing Web dependencies..."
        cd apps/web
        npm install
        cd ../..
    fi
    
    echo -e "${GREEN}✅ Dependencies installed${NC}"
}

# Health check
health_check() {
    echo ""
    echo "🏥 Running health check..."
    
    # Wait for services to start
    sleep 5
    
    if curl -f http://localhost:3005/health &> /dev/null; then
        echo -e "${GREEN}✅ BFF is healthy${NC}"
    else
        echo -e "${YELLOW}⚠️  BFF health check failed (might still be starting...)${NC}"
    fi
}

# Main menu
main_menu() {
    echo ""
    echo "Choose an option:"
    echo "1) Start with Docker (recommended)"
    echo "2) Start development servers locally"
    echo "3) Run health checks only"
    echo "4) View documentation"
    echo "5) Exit"
    echo ""
    read -p "Enter your choice [1-5]: " choice
    
    case $choice in
        1)
            start_docker
            ;;
        2)
            start_local
            ;;
        3)
            health_check_only
            ;;
        4)
            view_docs
            ;;
        5)
            echo "Goodbye! 👋"
            exit 0
            ;;
        *)
            echo -e "${RED}Invalid option!${NC}"
            main_menu
            ;;
    esac
}

# Start with Docker
start_docker() {
    echo ""
    echo "🐳 Starting with Docker..."
    
    # Check if docker-compose file exists
    if [ ! -f "docker-compose.yml" ] && [ ! -f "infra/docker/docker-compose.yml" ]; then
        echo -e "${RED}❌ docker-compose.yml not found!${NC}"
        exit 1
    fi
    
    # Use the appropriate docker-compose file
    if [ -f "infra/docker/docker-compose.yml" ]; then
        COMPOSE_FILE="infra/docker/docker-compose.yml"
    else
        COMPOSE_FILE="docker-compose.yml"
    fi
    
    echo "Using compose file: $COMPOSE_FILE"
    echo ""
    
    # Start services
    docker-compose -f "$COMPOSE_FILE" up -d
    
    echo ""
    echo -e "${GREEN}✅ Services started!${NC}"
    echo ""
    echo "Access points:"
    echo "  📱 Frontend:    http://localhost:5173"
    echo "  🔧 BFF API:     http://localhost:3005"
    echo "  🏥 Health:      http://localhost:3005/health"
    echo "  📊 Monitoring:  http://localhost:3005/health/detailed"
    echo ""
    echo "To view logs:"
    echo "  docker-compose -f $COMPOSE_FILE logs -f"
    echo ""
    echo "To stop services:"
    echo "  docker-compose -f $COMPOSE_FILE down"
    
    health_check
}

# Start locally
start_local() {
    echo ""
    echo "💻 Starting development servers locally..."
    echo ""
    echo "This will start:"
    echo "  - BFF (Backend for Frontend) on port 3005"
    echo "  - Web frontend on port 5173"
    echo ""
    echo "Make sure PostgreSQL is running and configured!"
    echo ""
    
    # Start BFF in background
    echo "Starting BFF..."
    cd apps/bff
    npm run dev &
    BFF_PID=$!
    cd ../..
    
    # Start Web in background
    echo "Starting Web..."
    cd apps/web
    npm run dev &
    WEB_PID=$!
    cd ../..
    
    echo ""
    echo -e "${GREEN}✅ Services starting...${NC}"
    echo ""
    echo "PIDs: BFF=$BFF_PID, WEB=$WEB_PID"
    echo ""
    echo "Press Ctrl+C to stop all services"
    
    # Wait for user interrupt
    trap "kill $BFF_PID $WEB_PID; echo 'Services stopped'; exit" INT
    wait
}

# Health check only
health_check_only() {
    echo ""
    echo "🏥 Running comprehensive health checks..."
    echo ""
    
    # Check BFF
    echo "Checking BFF..."
    if curl -s http://localhost:3005/health | jq .; then
        echo -e "${GREEN}✅ BFF is healthy${NC}"
    else
        echo -e "${RED}❌ BFF is not responding${NC}"
    fi
    
    echo ""
    echo "Checking all services..."
    if curl -s http://localhost:3005/health/detailed | jq .; then
        echo -e "${GREEN}✅ Detailed health check complete${NC}"
    else
        echo -e "${YELLOW}⚠️  Some services may be unavailable${NC}"
    fi
    
    echo ""
    main_menu
}

# View documentation
view_docs() {
    echo ""
    echo "📚 Documentation"
    echo "================"
    echo ""
    echo "Available documentation:"
    echo "  1) README.md - General overview"
    echo "  2) IMPROVEMENTS.md - Recent improvements"
    echo "  3) PRODUCTION_READINESS_CHECKLIST.md - Production checklist"
    echo ""
    
    if command -v cat &> /dev/null; then
        read -p "Enter number to view (or press Enter to skip): " doc_choice
        
        case $doc_choice in
            1)
                cat README.md | less
                ;;
            2)
                cat IMPROVEMENTS.md | less
                ;;
            3)
                cat PRODUCTION_READINESS_CHECKLIST.md | less
                ;;
        esac
    fi
    
    echo ""
    main_menu
}

# Main execution
echo "Running pre-flight checks..."
check_env_file
check_docker
check_node

echo ""
echo -e "${GREEN}✅ All pre-flight checks passed!${NC}"

main_menu
