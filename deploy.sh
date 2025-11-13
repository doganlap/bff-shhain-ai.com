#!/bin/bash

# GRC Platform - Production Deployment Script
# Version: 1.0.0
# Date: 2024-11-13

echo "=========================================="
echo "🚀 GRC Platform - Production Deployment"
echo "=========================================="
echo ""

# Check if we're in the right directory
if [ ! -d "apps/web" ]; then
    echo "❌ Error: Must run from project root directory"
    exit 1
fi

echo "📦 Step 1: Installing dependencies..."
cd apps/web
npm install
if [ $? -ne 0 ]; then
    echo "❌ Dependency installation failed"
    exit 1
fi
echo "✅ Dependencies installed"
echo ""

echo "🔨 Step 2: Building for production..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi
echo "✅ Build successful"
echo ""

echo "✨ Step 3: Build output summary..."
ls -lh dist/
echo ""

echo "=========================================="
echo "✅ DEPLOYMENT READY!"
echo "=========================================="
echo ""
echo "📁 Deploy the 'apps/web/dist' folder to your hosting:"
echo ""
echo "Option 1: Manual Upload"
echo "  - Upload dist/ folder to your web server"
echo ""
echo "Option 2: Vercel"
echo "  - Run: vercel --prod"
echo ""
echo "Option 3: Netlify"
echo "  - Run: netlify deploy --prod --dir=dist"
echo ""
echo "Option 4: AWS S3"
echo "  - Run: aws s3 sync dist/ s3://your-bucket/"
echo ""
echo "🎉 Your GRC Platform is ready for production!"
echo ""
