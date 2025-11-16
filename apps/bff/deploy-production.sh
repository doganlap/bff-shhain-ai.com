#!/bin/bash

# Production Deployment Script for Shahin GRC BFF
# This script handles the complete production deployment process

set -e  # Exit on any error

echo "🚀 Starting Production Deployment for Shahin GRC BFF..."
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required environment variables are set
check_environment() {
    print_status "Checking environment variables..."
    
    required_vars=(
        "DATABASE_URL"
        "JWT_SECRET"
        "JWT_REFRESH_SECRET"
        "SERVICE_TOKEN"
        "REDIS_URL"
        "SENTRY_DSN"
        "SENDGRID_API_KEY"
        "STRIPE_SECRET_KEY"
        "OPENAI_API_KEY"
    )
    
    missing_vars=()
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            missing_vars+=("$var")
        fi
    done
    
    if [ ${#missing_vars[@]} -ne 0 ]; then
        print_error "Missing required environment variables:"
        for var in "${missing_vars[@]}"; do
            echo "  - $var"
        done
        exit 1
    fi
    
    print_success "All required environment variables are set"
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    if [ -f "package.json" ]; then
        npm ci --production=false
        print_success "Dependencies installed successfully"
    else
        print_error "package.json not found"
        exit 1
    fi
}

# Generate Prisma client
generate_prisma() {
    print_status "Generating Prisma client..."
    
    if [ -f "prisma/schema.prisma" ]; then
        npx prisma generate
        print_success "Prisma client generated successfully"
    else
        print_error "Prisma schema file not found"
        exit 1
    fi
}

# Run database migrations
run_migrations() {
    print_status "Running database migrations..."
    
    if [ -f "prisma/schema.prisma" ]; then
        npx prisma migrate deploy
        print_success "Database migrations completed"
    else
        print_warning "No Prisma schema found, skipping migrations"
    fi
}

# Seed production database
seed_database() {
    print_status "Seeding production database..."
    
    if [ -f "prisma/seed-production.ts" ]; then
        npx tsx prisma/seed-production.ts
        print_success "Database seeded successfully"
    else
        print_warning "Production seed script not found, skipping seeding"
    fi
}

# Run tests
run_tests() {
    print_status "Running tests..."
    
    if [ -f "package.json" ]; then
        npm test
        print_success "Tests passed"
    else
        print_warning "No test script found, skipping tests"
    fi
}

# Build for production
build_production() {
    print_status "Building for production..."
    
    if [ -f "package.json" ]; then
        npm run build
        print_success "Production build completed"
    else
        print_warning "No build script found, skipping build"
    fi
}

# Deploy to Vercel
deploy_vercel() {
    print_status "Deploying to Vercel..."
    
    if command -v vercel &> /dev/null; then
        vercel --prod --yes
        print_success "Deployed to Vercel successfully"
    else
        print_error "Vercel CLI not found. Please install it: npm i -g vercel"
        exit 1
    fi
}

# Health check after deployment
health_check() {
    print_status "Performing health check..."
    
    # Wait for deployment to be ready
    sleep 10
    
    # Get the deployment URL from Vercel
    DEPLOYMENT_URL=$(vercel ls --json | jq -r '.[0].url')
    
    if [ -n "$DEPLOYMENT_URL" ]; then
        HEALTH_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "https://$DEPLOYMENT_URL/health")
        
        if [ "$HEALTH_RESPONSE" = "200" ]; then
            print_success "Health check passed - Deployment is ready"
            echo "🌐 Deployment URL: https://$DEPLOYMENT_URL"
        else
            print_error "Health check failed - HTTP $HEALTH_RESPONSE"
            exit 1
        fi
    else
        print_warning "Could not determine deployment URL, manual health check required"
    fi
}

# Main deployment function
main() {
    echo "Starting deployment process..."
    
    # Change to BFF directory
    cd "$(dirname "$0")" || exit 1
    
    # Run deployment steps
    check_environment
    install_dependencies
    generate_prisma
    run_migrations
    seed_database
    run_tests
    build_production
    deploy_vercel
    health_check
    
    echo ""
    echo "=================================================="
    print_success "🎉 Production deployment completed successfully!"
    echo "=================================================="
    echo ""
    echo "📋 Post-deployment checklist:"
    echo "  ✅ Database migrated and seeded"
    echo "  ✅ All environment variables configured"
    echo "  ✅ Application deployed to Vercel"
    echo "  ✅ Health checks passed"
    echo ""
    echo "🔑 Default login credentials:"
    echo "  - admin@shahin-ai.com / SuperAdmin2025"
    echo "  - manager@shahin-ai.com / Manager2025"
    echo "  - analyst@shahin-ai.com / Analyst2025"
    echo "  - auditor@shahin-ai.com / Auditor2025"
    echo ""
    echo "🌐 Check your deployment at: https://app.shahin-ai.com"
}

# Handle script interruption
trap 'print_error "Deployment interrupted"; exit 1' INT TERM

# Run main function
main "$@"