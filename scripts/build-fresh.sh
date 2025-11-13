#!/bin/bash

# GRC Ecosystem Fresh Build Script
# This script ensures completely fresh Docker builds with no cached layers

set -e

echo "🚀 Starting Fresh Docker Build for GRC Ecosystem"
echo "================================================"

# Function to print colored output
print_status() {
    echo -e "\033[1;34m$1\033[0m"
}

print_success() {
    echo -e "\033[1;32m$1\033[0m"
}

print_warning() {
    echo -e "\033[1;33m$1\033[0m"
}

print_error() {
    echo -e "\033[1;31m$1\033[0m"
}

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

print_status "📋 Step 1: Stopping all running containers..."
docker-compose -f infra/deployment/docker-compose.production.yml down --remove-orphans || true
docker-compose -f docker-compose.ecosystem.yml down --remove-orphans || true

print_status "🧹 Step 2: Cleaning up Docker system..."
print_warning "This will remove all unused containers, networks, images, and build cache"
docker system prune -af --volumes
docker builder prune -af

print_status "📦 Step 3: Building frontend..."
cd apps/web
npm run build
cd ../..

print_status "🔨 Step 4: Building Docker images with no cache..."
docker-compose -f infra/deployment/docker-compose.production.yml build --no-cache --pull --parallel

print_status "🚀 Step 5: Starting services..."
docker-compose -f infra/deployment/docker-compose.production.yml up -d

print_status "⏳ Step 6: Waiting for services to be ready..."
sleep 30

print_status "🔍 Step 7: Checking service health..."
docker-compose -f infra/deployment/docker-compose.production.yml ps

print_success "✅ Fresh build completed successfully!"
print_success "🌐 Your GRC application should be available at:"
print_success "   - Frontend: https://localhost (or your configured domain)"
print_success "   - API: https://localhost/api"

echo ""
echo "📊 Service Status:"
docker-compose -f infra/deployment/docker-compose.production.yml ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "📝 To view logs:"
echo "   docker-compose -f infra/deployment/docker-compose.production.yml logs -f [service-name]"
echo ""
echo "🛑 To stop all services:"
echo "   docker-compose -f infra/deployment/docker-compose.production.yml down"
