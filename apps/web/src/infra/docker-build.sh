#!/bin/bash

# GRC Assessment App Docker Build Script
# This script builds and runs the GRC Assessment application in Docker Desktop

set -e

echo "🚀 Starting GRC Assessment App Docker Build..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker Desktop and try again."
    exit 1
fi

# Check if Docker Compose is available
if ! docker-compose --version > /dev/null 2>&1; then
    print_error "Docker Compose is not installed. Please install Docker Compose and try again."
    exit 1
fi

print_status "Docker is running and ready!"

# Create necessary directories
print_status "Creating necessary directories..."
mkdir -p uploads logs ssl

# Set proper permissions
chmod 755 uploads logs

# Build the application
print_status "Building GRC Assessment application..."
docker-compose build --no-cache

# Start the services
print_status "Starting services..."
docker-compose up -d

# Wait for services to be ready
print_status "Waiting for services to be ready..."
sleep 30

# Check if services are running
print_status "Checking service health..."
if docker-compose ps | grep -q "Up"; then
    print_status "✅ Services are running successfully!"
else
    print_error "❌ Some services failed to start. Check logs with: docker-compose logs"
    exit 1
fi

# Test the application
print_status "Testing application endpoints..."
sleep 10

# Test health endpoint
if curl -f http://localhost:5001/api/health > /dev/null 2>&1; then
    print_status "✅ Backend API is responding!"
else
    print_warning "⚠️  Backend API health check failed. Check logs with: docker-compose logs grc-app"
fi

# Test frontend
if curl -f http://localhost > /dev/null 2>&1; then
    print_status "✅ Frontend is accessible!"
else
    print_warning "⚠️  Frontend is not responding. Check logs with: docker-compose logs nginx"
fi

# Display access information
echo ""
echo "═══════════════════════════════════════"
echo "🎉 GRC Assessment App is ready!"
echo "═══════════════════════════════════════"
echo ""
echo "📋 Access Information:"
echo "   • Frontend: http://localhost"
echo "   • Backend API: http://localhost:5001"
echo "   • Health Check: http://localhost:5001/api/health"
echo ""
echo "🔧 Management Commands:"
echo "   • View logs: docker-compose logs -f"
echo "   • Stop services: docker-compose down"
echo "   • Restart services: docker-compose restart"
echo "   • Rebuild: docker-compose build --no-cache"
echo ""
echo "📊 Database Information:"
echo "   • Database: grc_template"
echo "   • User: grc_user"
echo "   • Password: grc_secure_password_2024"
echo "   • Port: 5432 (internal only)"
echo ""
echo "📝 Useful Docker Commands:"
echo "   • View running containers: docker ps"
echo "   • View images: docker images"
echo "   • Clean up: docker system prune -f"
echo ""
echo "═══════════════════════════════════════"

# Keep services running
echo ""
print_status "Services are running in the background."
print_status "You can now open Docker Desktop to manage the containers."
print_status "Press Ctrl+C to stop this script (services will continue running)."

# Keep script running to show logs
docker-compose logs -f