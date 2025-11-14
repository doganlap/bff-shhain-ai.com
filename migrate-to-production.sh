#!/bin/bash

# =====================================================
# Shahin-AI Production Migration Script
# Migrate to Vercel with 4 Database Architecture
# =====================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="shahin-ai-grc"
VECTOR_DB_NAME="shahin-vector-db"
COMPLIANCE_DB_NAME="shahin-compliance-db"
MAIN_DB_NAME="shahin-main-db"
CONTROLS_DB_NAME="shahin-controls-db"

# Functions
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️ $1${NC}"
}

# Check prerequisites
check_prerequisites() {
    print_info "Checking prerequisites..."

    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed"
        exit 1
    fi

    # Check if npm is installed
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed"
        exit 1
    fi

    # Check if Vercel CLI is installed
    if ! command -v vercel &> /dev/null; then
        print_info "Installing Vercel CLI..."
        npm install -g vercel
    fi

    # Check if Prisma CLI is installed
    if ! command -v npx &> /dev/null; then
        print_error "npx is not available"
        exit 1
    fi

    print_status "Prerequisites check completed"
}

# Setup Vercel project
setup_vercel_project() {
    print_info "Setting up Vercel project..."

    # Check if already logged in
    if ! vercel whoami &> /dev/null; then
        print_warning "Please login to Vercel first:"
        echo "Run: vercel login"
        echo "Then visit the provided URL in your browser"
        read -p "Press Enter after logging in..."
    fi

    # Check if project exists
    if vercel ls | grep -q "$PROJECT_NAME"; then
        print_status "Vercel project exists"
    else
        print_info "Creating Vercel project..."
        vercel --yes

        # Set project name
        vercel --name "$PROJECT_NAME"
    fi

    print_status "Vercel project setup completed"
}

# Create databases (manual step guidance)
create_databases_guide() {
    print_info "Database Creation Guide"
    echo ""
    echo "Since Vercel CLI doesn't support automated database creation,"
    echo "please create the following databases manually:"
    echo ""
    echo "1. Go to: https://vercel.com/dashboard"
    echo "2. Select your project: $PROJECT_NAME"
    echo "3. Go to Storage tab"
    echo "4. Click 'Create Database' → Select 'Postgres'"
    echo "5. Create these 4 databases:"
    echo "   • $VECTOR_DB_NAME"
    echo "   • $COMPLIANCE_DB_NAME"
    echo "   • $MAIN_DB_NAME"
    echo "   • $CONTROLS_DB_NAME"
    echo ""
    echo "6. Copy the connection strings for each database"
    echo ""

    read -p "Have you created all 4 databases? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_warning "Please create the databases first, then run this script again"
        exit 0
    fi

    print_status "Database creation confirmed"
}

# Setup environment variables
setup_environment() {
    print_info "Setting up environment variables..."

    echo "Please provide the database connection strings:"
    echo ""

    read -p "Vector DB Connection String: " VECTOR_DB_URL
    read -p "Compliance DB Connection String: " COMPLIANCE_DB_URL
    read -p "Main DB Connection String: " MAIN_DB_URL
    read -p "Controls DB Connection String: " CONTROLS_DB_URL

    # Create .env.production file
    cat > .env.production << EOF
# Database Connections
DATABASE_URL="$MAIN_DB_URL"
VECTOR_DATABASE_URL="$VECTOR_DB_URL"
SHAHIN_COMPLIANCE_URL="$COMPLIANCE_DB_URL"
CONTROLS_DATABASE_URL="$CONTROLS_DB_URL"

# Security
JWT_SECRET="$(openssl rand -base64 32)"
BCRYPT_ROUNDS="12"
SERVICE_TOKEN="$(openssl rand -base64 32)"

# AI Services
OPENAI_API_KEY=""
AZURE_OPENAI_KEY=""
AZURE_COMPUTER_VISION_KEY=""

# App Config
NODE_ENV="production"
LOG_LEVEL="info"
FRONTEND_URL=""
EOF

    print_status "Environment variables configured"
    print_warning "Please edit .env.production to add your API keys"
}

# Run Prisma migrations
run_migrations() {
    print_info "Running Prisma migrations..."

    # Vector Database
    print_info "Migrating Vector Database..."
    cd apps/bff
    npx prisma generate --schema=prisma/schema_vector.prisma
    npx prisma db push --schema=prisma/schema_vector.prisma --accept-data-loss
    print_status "Vector database migrated"

    # Compliance Database
    print_info "Migrating Compliance Database..."
    npx prisma generate --schema=prisma/schema_shahin_compliance.prisma
    npx prisma db push --schema=prisma/schema_shahin_compliance.prisma --accept-data-loss
    print_status "Compliance database migrated"

    cd ../..
    print_status "Prisma migrations completed"
}

# Import data
import_data() {
    print_info "Importing initial data..."

    # Import seed data
    print_info "Importing seed data..."
    psql "$MAIN_DB_URL" < seed_grc_data.sql

    # Import enterprise controls
    print_info "Importing enterprise controls..."
    psql "$MAIN_DB_URL" < apps/web/src/enterprise/populate-complete-controls.sql

    print_status "Data import completed"
}

# Deploy to Vercel
deploy_to_vercel() {
    print_info "Deploying to Vercel..."

    # Build and deploy
    vercel --prod

    print_status "Deployment completed"
    print_info "Get your production URL:"
    vercel ls
}

# Verify deployment
verify_deployment() {
    print_info "Verifying deployment..."

    # Get production URL
    PRODUCTION_URL=$(vercel ls | grep -o 'https://[^[:space:]]*' | head -1)

    if [ -z "$PRODUCTION_URL" ]; then
        print_warning "Could not get production URL automatically"
        read -p "Please enter your Vercel production URL: " PRODUCTION_URL
    fi

    # Test health endpoint
    print_info "Testing health endpoint..."
    if curl -s "$PRODUCTION_URL/api/health" > /dev/null; then
        print_status "Health check passed"
    else
        print_warning "Health check failed - check Vercel function logs"
    fi

    # Test main app
    print_info "Testing main application..."
    if curl -s "$PRODUCTION_URL" > /dev/null; then
        print_status "Main app is accessible"
    else
        print_warning "Main app not accessible - check deployment"
    fi

    print_status "Verification completed"
    echo ""
    echo "🎉 Shahin-AI is now live at: $PRODUCTION_URL"
}

# Main execution
main() {
    echo -e "${BLUE}🚀 Shahin-AI Production Migration Script${NC}"
    echo "=========================================="
    echo ""

    check_prerequisites
    echo ""

    setup_vercel_project
    echo ""

    create_databases_guide
    echo ""

    setup_environment
    echo ""

    run_migrations
    echo ""

    import_data
    echo ""

    deploy_to_vercel
    echo ""

    verify_deployment
    echo ""

    echo -e "${GREEN}🎊 Migration completed successfully!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Update DNS records if using custom domain"
    echo "2. Configure monitoring and alerts"
    echo "3. Set up backup procedures"
    echo "4. Test all features thoroughly"
    echo ""
    echo -e "${YELLOW}Welcome to Production! 🚀${NC}"
}

# Handle script arguments
case "${1:-}" in
    "check")
        check_prerequisites
        ;;
    "databases")
        create_databases_guide
        ;;
    "migrate")
        run_migrations
        ;;
    "deploy")
        deploy_to_vercel
        ;;
    "verify")
        verify_deployment
        ;;
    *)
        main
        ;;
esac
