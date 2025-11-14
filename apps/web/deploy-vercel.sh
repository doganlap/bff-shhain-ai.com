#!/bin/bash

echo "🚀 Deploying Shahin AI GRC to Vercel..."

# Build the frontend
echo "📦 Building frontend..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Frontend build failed"
    exit 1
fi

echo "✅ Frontend build successful"

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."

# Use Vercel CLI with specific configuration
npx vercel deploy \
  --prod \
  --name="shahin-ai-grc" \
  --regions="iad1" \
  --build-env="NODE_ENV=production" \
  --env="VITE_API_URL=https://grc-backend.shahin-ai.com/api" \
  --env="VITE_API_BASE_URL=https://grc-backend.shahin-ai.com/api" \
  --env="VITE_WS_URL=wss://grc-backend.shahin-ai.com" \
  --env="NODE_ENV=production" \
  --confirm

if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    echo "🌐 Your GRC platform is now live on Vercel"
else
    echo "❌ Deployment failed"
    exit 1
fi