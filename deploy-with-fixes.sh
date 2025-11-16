#!/bin/bash

# Quick Vercel Deployment Script for GRC Project
# This script updates environment variables and redeploys both applications

set -e

echo "🚀 Starting Vercel deployment for GRC project..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_step() {
    echo -e "${BLUE}$1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    log_error "Vercel CLI is not installed. Installing..."
    npm install -g vercel
fi

# Frontend origins for CORS
FRONTEND_ORIGINS="https://app-shahin-ai-com.vercel.app,https://app-shahin-ai-1uwk5615e-donganksa.vercel.app,https://grc-dashboard-ivory.vercel.app,https://shahin-ai.com,https://www.shahin-ai.com,https://dogan-ai.com,http://localhost:5173,http://localhost:3000"

# BFF URL
BFF_URL="https://bff-shahin-ai-com.vercel.app"

log_step "📋 Step 1: Updating BFF Environment Variables"
cd apps/bff

# Remove old environment variables if they exist
vercel env rm FRONTEND_ORIGINS production --yes 2>/dev/null || true
vercel env rm PUBLIC_BFF_URL production --yes 2>/dev/null || true

# Add new environment variables
vercel env add FRONTEND_ORIGINS production <<< "$FRONTEND_ORIGINS"
vercel env add PUBLIC_BFF_URL production <<< "$BFF_URL"

log_success "BFF environment variables updated"

log_step "📋 Step 2: Updating Web App Environment Variables"
cd ../web

# Remove old environment variables if they exist
vercel env rm VITE_BFF_URL production --yes 2>/dev/null || true
vercel env rm VITE_API_BASE_URL production --yes 2>/dev/null || true

# Add new environment variables
vercel env add VITE_BFF_URL production <<< "$BFF_URL"
vercel env add VITE_API_BASE_URL production <<< "$BFF_URL/api"

log_success "Web app environment variables updated"

log_step "📋 Step 3: Deploying BFF Application"
cd ../bff
vercel --prod --yes
log_success "BFF deployed successfully"

log_step "📋 Step 4: Deploying Web Application"
cd ../web
vercel --prod --yes
log_success "Web application deployed successfully"

log_step "📋 Step 5: Deployment Summary"
echo ""
echo "🎉 Deployment completed successfully!"
echo ""
echo "📊 Deployment URLs:"
echo "   BFF API: $BFF_URL"
echo "   Web App: https://app-shahin-ai-com.vercel.app"
echo ""
echo "🔧 CORS Origins Configured:"
echo "   ✅ https://app-shahin-ai-com.vercel.app"
echo "   ✅ https://app-shahin-ai-1uwk5615e-donganksa.vercel.app"
echo "   ✅ https://grc-dashboard-ivory.vercel.app"
echo "   ✅ https://shahin-ai.com"
echo "   ✅ https://www.shahin-ai.com"
echo "   ✅ https://dogan-ai.com"
echo "   ✅ http://localhost:5173 (development)"
echo "   ✅ http://localhost:3000 (development)"
echo ""
echo "🧪 Testing URLs:"
echo "   API Health: $BFF_URL/api/health"
echo "   Web App: https://app-shahin-ai-com.vercel.app"
echo ""
echo "✨ Your applications should now work without CORS errors!"
echo "   Wait 1-2 minutes for DNS propagation, then test your application."

cd ../../

log_success "Deployment script completed"
