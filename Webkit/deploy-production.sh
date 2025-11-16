#!/bin/bash

# Shahin AI Production Deployment Script
# Deploy to www.shahin-ai.com

echo "🚀 Starting Shahin AI Production Deployment..."

# Set production environment
export NODE_ENV=production
export VITE_API_URL=https://www.shahin-ai.com

# Build frontend for production
echo "📦 Building frontend for production..."
cd landing-page
npm run build:prod

# Copy backend files for deployment
echo "🔧 Preparing backend for deployment..."
cd ../backend
cp .env.production .env

# Install production dependencies
echo "📥 Installing production dependencies..."
npm ci --only=production

echo "✅ Deployment preparation complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Upload 'landing-page/dist' to your web server"  
echo "2. Deploy backend to https://www.shahin-ai.com"
echo "3. Set up SSL certificate for HTTPS"
echo "4. Configure domain DNS to point to your server"
echo ""
echo "🔗 Production URLs:"
echo "   Frontend: https://www.shahin-ai.com"
echo "   Backend API: https://www.shahin-ai.com/api/"
echo "   Health Check: https://www.shahin-ai.com/api/ai/health"
echo ""
echo "🎯 AI Services Configured:"
echo "   ✅ OpenAI API Integration"
echo "   ⏳ Azure OpenAI (ready for keys)" 
echo "   ✅ Multi-modal capabilities"
echo "   ✅ Smart routing & fallbacks"