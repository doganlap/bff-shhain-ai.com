# Shahin GRC Platform - Production Deployment Guide

## 🚀 Complete Production Deployment Strategy

This guide covers the complete production deployment process including database setup, Docker services, and infrastructure orchestration for the Shahin GRC platform.

## 📋 Prerequisites

### Required Services
- **Vercel Account** with custom domain (shahin-ai.com)
- **PostgreSQL Database** (Vercel Postgres or external provider)
- **Redis Instance** (Upstash or external provider)
- **Docker Hub** account for image registry
- **GitHub Repository** with proper access

### Environment Requirements
- Node.js 20.x
- Docker & Docker Compose
- Git CLI
- Vercel CLI (`npm i -g vercel`)

## 🔧 Architecture Overview

```
Production Architecture:
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Vercel CDN    │    │   Vercel Edge   │    │   PostgreSQL    │
│  (Global CDN)   │───▶│  Functions/API  │───▶│   Database      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │     Redis       │
                       │   Cache/Session   │
                       └─────────────────┘
```

## 🗃️ Database Deployment & Seeding

### Step 1: Production Database Setup

#### Create Production Database
```bash
# Using Vercel CLI (recommended)
vercel postgres create shahin-grc-prod-db

# Or using external PostgreSQL provider
# Set up your preferred PostgreSQL instance
```

#### Database Environment Variables
```bash
# Add to Vercel Environment (Production)
DATABASE_URL=postgresql://username:password@host:port/shahin_prod_db
SHADOW_DATABASE_URL=postgresql://username:password@host:port/shahin_prod_shadow
REDIS_URL=redis://username:password@host:port
```

### Step 2: Schema Migration & Seeding

#### Deploy Database Schema
```bash
# Navigate to BFF directory
cd apps/bff

# Install dependencies
npm install

# Generate Prisma client
npm run build

# Deploy migrations to production
npx prisma migrate deploy

# Seed production data (Saudi compliance frameworks)
npm run db:seed
```

#### Verify Database Deployment
```bash
# Check database connection
npx prisma db pull

# Open Prisma Studio (local verification)
npx prisma studio

# Test database health
curl https://shahin-ai.com/api/health/database
```

## 🐳 Docker Services Deployment

### Step 3: Build Production Docker Images

#### BFF Docker Image
```dockerfile
# apps/bff/Dockerfile (Production)
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
RUN npm run build
EXPOSE 3005
CMD ["node", "index.js"]
```

#### Build and Push Images
```bash
# Build BFF image
docker build -t shahin-grc-bff:latest ./apps/bff

# Tag for registry
docker tag shahin-grc-bff:latest your-dockerhub/shahin-grc-bff:latest

# Push to registry
docker push your-dockerhub/shahin-grc-bff:latest
```

### Step 4: Docker Compose Production Stack

#### Production Docker Compose
```yaml
# docker-compose.production.yml
version: '3.8'

services:
  # BFF Service
  bff:
    image: your-dockerhub/shahin-grc-bff:latest
    ports:
      - "3005:3005"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
      - JWT_SECRET=${JWT_SECRET}
      - SERVICE_TOKEN=${SERVICE_TOKEN}
    depends_on:
      - postgres
      - redis
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3005/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # PostgreSQL Database
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: shahin_prod_db
      POSTGRES_USER: shahin_prod
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init-scripts:/docker-entrypoint-initdb.d
    ports:
      - "5432:5432"
    restart: unless-stopped

  # Redis Cache
  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"
    restart: unless-stopped

  # Nginx Reverse Proxy
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - bff
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

### Step 5: Deploy Docker Stack

#### Deploy Services
```bash
# Set environment variables
export DATABASE_URL=your-production-db-url
export REDIS_URL=your-production-redis-url
export JWT_SECRET=your-jwt-secret
export SERVICE_TOKEN=your-service-token
export POSTGRES_PASSWORD=your-postgres-password

# Deploy stack
docker-compose -f docker-compose.production.yml up -d

# Check service status
docker-compose -f docker-compose.production.yml ps

# View logs
docker-compose -f docker-compose.production.yml logs -f
```

## 🌐 Vercel Production Deployment

### Step 6: Vercel Configuration

#### Production Vercel Configuration
```json
{
  "version": 2,
  "buildCommand": "cd apps/web && npm run build",
  "outputDirectory": "apps/web/dist",
  "installCommand": "npm install",
  "framework": "vite",
  "functions": {
    "apps/bff/index.js": {
      "runtime": "nodejs20.x",
      "maxDuration": 30
    }
  },
  "env": {
    "DATABASE_URL": "@production-database-url",
    "REDIS_URL": "@production-redis-url",
    "JWT_SECRET": "@production-jwt-secret",
    "SERVICE_TOKEN": "@production-service-token"
  },
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/apps/bff/index.js"
    },
    {
      "source": "/(.*)",
      "destination": "/apps/web/dist/index.html"
    }
  ],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-cache, no-store, must-revalidate"
        },
        {
          "key": "Pragma",
          "value": "no-cache"
        }
      ]
    },
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### Step 7: Deploy to Vercel

#### Initial Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# Or link existing project
vercel link
vercel --prod
```

#### Set Production Environment Variables
```bash
# Add production secrets
vercel env add DATABASE_URL production
vercel env add REDIS_URL production
vercel env add JWT_SECRET production
vercel env add SERVICE_TOKEN production

# Add frontend environment variables
vercel env add VITE_BFF_URL production
vercel env add VITE_API_URL production
```

## 🔄 Complete Deployment Workflow

### Step 8: Automated Deployment Script

#### Production Deployment Script
```bash
#!/bin/bash
# deploy-production.sh

echo "🚀 Starting Shahin GRC Production Deployment..."

# 1. Database Deployment
echo "📊 Deploying database schema..."
cd apps/bff
npm install
npm run build
npx prisma migrate deploy
npm run db:seed

# 2. Docker Services
echo "🐳 Building Docker images..."
docker build -t shahin-grc-bff:latest ./apps/bff
docker push your-dockerhub/shahin-grc-bff:latest

# 3. Deploy Docker Stack
echo "🚀 Deploying Docker services..."
docker-compose -f docker-compose.production.yml up -d

# 4. Vercel Deployment
echo "🌐 Deploying to Vercel..."
cd ../../
vercel --prod

# 5. Health Checks
echo "🏥 Running health checks..."
sleep 30
curl -f https://shahin-ai.com/health || exit 1
curl -f https://shahin-ai.com/api/health || exit 1

echo "✅ Production deployment completed successfully!"
```

### Step 9: Health Monitoring & Verification

#### Health Check Endpoints
```bash
# Main application health
curl https://shahin-ai.com/health

# API health
curl https://shahin-ai.com/api/health

# Database health
curl https://shahin-ai.com/api/health/database

# Service health
curl https://shahin-ai.com/api/health/services
```

#### Monitoring Dashboard
Access the monitoring dashboard at:
- **Main Dashboard**: https://shahin-ai.com
- **Health Status**: https://shahin-ai.com/foundation-test
- **API Documentation**: https://shahin-ai.com/api/docs

## 🔄 Rollback Procedures

### Database Rollback
```bash
# Rollback to previous migration
npx prisma migrate resolve --rolled-back "migration_name"

# Restore from backup (if available)
pg_restore -d shahin_prod_db backup.sql
```

### Docker Rollback
```bash
# Rollback to previous image
docker service update --image shahin-grc-bff:previous shahin-grc-bff

# Or redeploy previous stack
docker-compose -f docker-compose.previous.yml up -d
```

### Vercel Rollback
```bash
# Rollback to previous deployment
vercel rollback [deployment-url]
```

## 📊 Post-Deployment Verification

### 1. Database Verification
```bash
# Check table creation
npx prisma db execute --stdin < sql/tables-verification.sql

# Verify seed data
npx prisma db execute --stdin < sql/seed-verification.sql
```

### 2. API Verification
```bash
# Test authentication endpoints
curl -X POST https://shahin-ai.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'

# Test login endpoint
curl -X POST https://shahin-ai.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

### 3. Frontend Verification
```bash
# Test main pages
curl https://shahin-ai.com/
curl https://shahin-ai.com/login
curl https://shahin-ai.com/register
```

## 🚨 Troubleshooting

### Common Issues

#### Database Connection Issues
```bash
# Check database connectivity
npx prisma db execute --stdin <<< "SELECT 1"

# Verify connection string
npx prisma db pull --force
```

#### Docker Service Issues
```bash
# Check service logs
docker-compose logs -f bff
docker-compose logs -f postgres
docker-compose logs -f redis

# Restart services
docker-compose restart bff
```

#### Vercel Deployment Issues
```bash
# Check deployment logs
vercel logs [deployment-url]

# Rebuild and redeploy
vercel --force
```

## 📈 Performance Monitoring

### Key Metrics to Monitor
- **Response Time**: < 500ms for API endpoints
- **Database Queries**: < 100ms for standard queries
- **Error Rate**: < 1% for production traffic
- **Uptime**: > 99.9% availability

### Monitoring Tools
- **Vercel Analytics**: Built-in performance monitoring
- **Database Monitoring**: PostgreSQL performance metrics
- **Docker Health Checks**: Service availability monitoring

## ✅ Deployment Checklist

### Pre-Deployment
- [ ] Database credentials configured
- [ ] Environment variables set
- [ ] Docker images built and tested
- [ ] Health checks passing
- [ ] Backup procedures in place

### During Deployment
- [ ] Database schema deployed successfully
- [ ] Seed data loaded correctly
- [ ] Docker services started properly
- [ ] Vercel deployment completed
- [ ] Health checks passing

### Post-Deployment
- [ ] All services responding correctly
- [ ] Database queries working
- [ ] Authentication flow functional
- [ ] Frontend pages loading
- [ ] Monitoring alerts configured

## 🎯 Next Steps

After successful deployment:
1. **Set up monitoring alerts**
2. **Configure automated backups**
3. **Implement CI/CD pipeline**
4. **Set up staging environment**
5. **Configure SSL certificates**
6. **Set up domain routing**

---

**🎉 Your Shahin GRC platform is now ready for production!**

For support or issues, refer to the troubleshooting section or check the deployment logs.