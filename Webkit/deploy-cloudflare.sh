#!/bin/bash
set -e

echo "========================================"
echo "  Shahin GRC - Cloudflare Deployment"
echo "  Domain: www.shahin-ai.com"
echo "========================================"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed!"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js found: $(node --version)"
echo ""

# Check if Wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "⚠️  Wrangler CLI not found. Installing..."
    npm install -g wrangler
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install Wrangler"
        exit 1
    fi
fi

echo "✅ Wrangler CLI found: $(wrangler --version)"
echo ""

# Install frontend dependencies
echo "[1/4] Installing frontend dependencies..."
cd landing-page
if [ ! -d "node_modules" ]; then
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install dependencies"
        exit 1
    fi
fi
cd ..

# Build frontend
echo ""
echo "[2/4] Building frontend for production..."
cd landing-page
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi
cd ..

echo "✅ Build complete!"
echo ""

# Check if dist folder exists
if [ ! -d "landing-page/dist" ]; then
    echo "❌ Build output not found!"
    exit 1
fi

echo "✅ Build output found: landing-page/dist"
echo ""

# Test build locally
echo "[3/4] Testing build locally..."
cd landing-page
npm run preview &
PREVIEW_PID=$!
sleep 3
cd ..

echo ""
echo "[4/4] Deployment Options:"
echo ""
echo "Option 1: Deploy via Cloudflare Dashboard"
echo "  1. Go to https://dash.cloudflare.com"
echo "  2. Navigate to Pages"
echo "  3. Create new project or connect Git repository"
echo "  4. Upload landing-page/dist folder"
echo "  5. Set environment variables:"
echo "     - VITE_API_URL = https://api.shahin-ai.com/api"
echo "     - VITE_FRONTEND_URL = https://www.shahin-ai.com"
echo ""
echo "Option 2: Deploy via Wrangler CLI"
echo "  1. Run: wrangler login"
echo "  2. Run: wrangler pages deploy landing-page/dist --project-name=shahin-grc-landing"
echo ""
echo "Option 3: Deploy via Git (Recommended)"
echo "  1. Push code to Git repository"
echo "  2. Connect repository to Cloudflare Pages"
echo "  3. Configure build settings:"
echo "     - Build command: cd landing-page && npm install && npm run build"
echo "     - Output directory: landing-page/dist"
echo "     - Root directory: /"
echo ""
echo "========================================"
echo "  Build Complete - Ready for Deployment"
echo "========================================"
echo ""
echo "Build output: landing-page/dist"
echo "Preview running at: http://localhost:4173"
echo ""

# Kill preview server
kill $PREVIEW_PID 2>/dev/null || true

echo "Press Enter to open Cloudflare Dashboard..."
read

# Open Cloudflare dashboard
if command -v xdg-open &> /dev/null; then
    xdg-open https://dash.cloudflare.com
elif command -v open &> /dev/null; then
    open https://dash.cloudflare.com
fi

echo ""
echo "========================================"
echo "  Deployment Setup Complete!"
echo "========================================"
echo ""

