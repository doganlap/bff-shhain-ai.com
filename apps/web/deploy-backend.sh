# Deploy GRC Backend to Production
# This script deploys the GRC backend API to a production environment

echo "🚀 Starting GRC Backend Production Deployment..."

# Set production environment variables
export NODE_ENV=production
export PORT=3005
export PRISMA_DATABASE_URL="postgres://3a38414caf532ad9c7c62582f78126f965d25a9f095a4d812f9f07eb9eb8d012:sk_W9GasVBo1IETypryTQEFJ@db.prisma.io:5432/postgres?sslmode=require"
export JWT_SECRET="grc_jwt_secret_key_shahin_ai_2024_secure_production"
export JWT_EXPIRES_IN="24h"
export RATE_LIMIT_WINDOW_MS=900000
export RATE_LIMIT_MAX_REQUESTS=100
export CORS_ORIGIN="https://www.shahin-ai.com,https://grc.shahin-ai.com"

echo "📦 Installing dependencies..."
cd src/services/grc-api
npm ci --only=production --no-optional

echo "🔧 Building Docker image..."
docker build -f Dockerfile.prod -t grc-backend:latest .

echo "🚀 Starting production container..."
docker run -d \
  --name grc-backend-prod \
  --restart unless-stopped \
  -p 3005:3005 \
  -e NODE_ENV=production \
  -e PORT=3005 \
  -e PRISMA_DATABASE_URL="$PRISMA_DATABASE_URL" \
  -e JWT_SECRET="$JWT_SECRET" \
  -e JWT_EXPIRES_IN="$JWT_EXPIRES_IN" \
  -e RATE_LIMIT_WINDOW_MS=900000 \
  -e RATE_LIMIT_MAX_REQUESTS=100 \
  -e CORS_ORIGIN="$CORS_ORIGIN" \
  grc-backend:latest

echo "⏳ Waiting for service to start..."
sleep 10

echo "🧪 Testing health endpoint..."
curl -f http://localhost:3005/health || {
  echo "❌ Health check failed"
  docker logs grc-backend-prod
  exit 1
}

echo "✅ GRC Backend deployed successfully!"
echo "🌐 Service running on: http://localhost:3005"
echo "🔍 Health check: http://localhost:3005/health"