#!/bin/bash

# Docker Deployment Script
# Deploys the entire GRC Ecosystem to Docker

set -e

ENVIRONMENT=${1:-dev}
BUILD=${2:-false}

echo "🐳 GRC Ecosystem - Docker Deployment"
echo "====================================="
echo ""

# Determine compose file
if [ "$ENVIRONMENT" = "production" ]; then
    COMPOSE_FILE="infra/docker/docker-compose.production.yml"
    echo "Environment: PRODUCTION"
else
    COMPOSE_FILE="infra/docker/docker-compose.ecosystem.yml"
    echo "Environment: DEVELOPMENT"
fi

echo "Compose File: $COMPOSE_FILE"
echo ""

# Check if Docker is running
echo "Checking Docker..."
if ! docker ps > /dev/null 2>&1; then
    echo "  ❌ Docker is not running. Please start Docker."
    exit 1
fi
echo "  ✅ Docker is running"

# Check if compose file exists
if [ ! -f "$COMPOSE_FILE" ]; then
    echo "  ❌ Compose file not found: $COMPOSE_FILE"
    exit 1
fi

# Check for .env file
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found"
    echo "   Creating from .env.example..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo "   ✅ Created .env file. Please update with your values!"
        echo ""
    else
        echo "   ❌ .env.example not found. Please create .env manually."
        exit 1
    fi
fi

# Build images if requested
if [ "$BUILD" = "true" ]; then
    echo "Building Docker images..."
    docker-compose -f "$COMPOSE_FILE" build --no-cache
    echo "  ✅ Images built successfully"
    echo ""
fi

# Start services
echo "Starting services..."
docker-compose -f "$COMPOSE_FILE" up -d

echo "  ✅ Services started"
echo ""

# Wait for services to be healthy
echo "Waiting for services to be healthy..."
sleep 10

# Check service status
echo ""
echo "Service Status:"
docker-compose -f "$COMPOSE_FILE" ps

echo ""
echo "====================================="
echo "✅ Deployment Complete!"
echo ""
echo "Access Services:"
if [ "$ENVIRONMENT" = "production" ]; then
    echo "  Frontend:    http://localhost"
else
    echo "  Frontend:    http://localhost:5173"
fi
echo "  BFF API:     http://localhost:3000"
echo "  Consul UI:   http://localhost:8500"
echo "  RabbitMQ UI: http://localhost:15672"
echo ""
echo "View Logs:"
echo "  docker-compose -f $COMPOSE_FILE logs -f"
echo ""

