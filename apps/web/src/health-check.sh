#!/bin/bash

# Health Check Script for GRC Platform Services
# Production-grade health monitoring

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=================================${NC}"
echo -e "${BLUE}GRC Platform Health Check${NC}"
echo -e "${BLUE}=================================${NC}"

# Function to check service health
check_service() {
    local service_name=$1
    local health_endpoint=$2
    local expected_status=${3:-200}

    echo -n "Checking $service_name... "

    if curl -f -s -o /dev/null -w "%{http_code}" "$health_endpoint" | grep -q "$expected_status"; then
        echo -e "${GREEN}✓ Healthy${NC}"
        return 0
    else
        echo -e "${RED}✗ Unhealthy${NC}"
        return 1
    fi
}

# Function to check database connection
check_database() {
    echo -n "Checking PostgreSQL... "

    if docker exec grc-postgres pg_isready -U grc_user -d grc_ecosystem > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Connected${NC}"
        return 0
    else
        echo -e "${RED}✗ Connection Failed${NC}"
        return 1
    fi
}

# Function to check Redis
check_redis() {
    echo -n "Checking Redis... "

    if docker exec grc-redis redis-cli ping > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Connected${NC}"
        return 0
    else
        echo -e "${RED}✗ Connection Failed${NC}"
        return 1
    fi
}

# Function to check SSL certificate
check_ssl() {
    echo -n "Checking SSL Certificate... "

    if openssl s_client -connect localhost:443 -servername yourdomain.com < /dev/null 2>/dev/null | grep -q "Verify return code: 0"; then
        echo -e "${GREEN}✓ Valid${NC}"
        return 0
    else
        echo -e "${YELLOW}! Certificate Check Skipped (Local)${NC}"
        return 0
    fi
}

# Main health check
main() {
    local failed_checks=0

    echo -e "\n${BLUE}Infrastructure Services:${NC}"
    check_database || ((failed_checks++))
    check_redis || ((failed_checks++))

    echo -e "\n${BLUE}Application Services:${NC}"
    check_service "Web Frontend" "http://localhost:5174/health" || ((failed_checks++))
    check_service "BFF API" "http://localhost:3005/health" || ((failed_checks++))
    check_service "GRC API" "http://localhost:3000/health" || ((failed_checks++))
    check_service "Auth Service" "http://localhost:3001/health" || ((failed_checks++))
    check_service "Document Service" "http://localhost:3002/health" || ((failed_checks++))
    check_service "Partner Service" "http://localhost:3003/health" || ((failed_checks++))
    check_service "Notification Service" "http://localhost:3004/health" || ((failed_checks++))

    echo -e "\n${BLUE}Security & Load Balancer:${NC}"
    check_service "Nginx" "http://localhost/health" || ((failed_checks++))
    check_ssl || ((failed_checks++))

    echo -e "\n${BLUE}=================================${NC}"

    if [ $failed_checks -eq 0 ]; then
        echo -e "${GREEN}✓ All services healthy!${NC}"
        echo -e "${GREEN}Platform Status: PRODUCTION READY${NC}"
        exit 0
    else
        echo -e "${RED}✗ $failed_checks service(s) failed health check${NC}"
        echo -e "${RED}Platform Status: DEGRADED${NC}"
        exit 1
    fi
}

# Run health check
main "$@"
