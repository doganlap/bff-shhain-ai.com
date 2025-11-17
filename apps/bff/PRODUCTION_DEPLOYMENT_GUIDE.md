# 🚀 Production Deployment Guide - Shahin GRC BFF

This guide provides step-by-step instructions for deploying the Shahin GRC Platform BFF (Backend for Frontend) to production on Vercel with a fully seeded database.

## 📋 Prerequisites

Before starting the deployment, ensure you have:

1. **Node.js 18+** installed
2. **Vercel CLI** installed: `npm i -g vercel`
3. **PostgreSQL Database** (Vercel Postgres, Supabase, or similar)
4. **Redis Instance** (for rate limiting and session management)
5. **Required API Keys** for third-party services

## 🔑 Required Environment Variables

### Critical Variables (Must be configured)

```bash
# Database
DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require

# JWT Secrets (Generate strong random strings)
JWT_SECRET=your-super-secure-jwt-secret-key-here
JWT_REFRESH_SECRET=your-super-secure-jwt-refresh-secret-key-here

# Service Token
SERVICE_TOKEN=your-secure-service-token-here

# Redis
REDIS_URL=redis://default:password@redis-host:6379
```

### Third-Party Integrations (Optional but recommended)

```bash
# Sentry Error Monitoring
SENTRY_DSN=https://your-sentry-dsn-here@sentry.io/project-id

# SendGrid Email Service
SENDGRID_API_KEY=SG.your-sendgrid-api-key-here

# Stripe Payment Processing
STRIPE_SECRET_KEY=sk_live_your-stripe-secret-key-here

# OpenAI API
OPENAI_API_KEY=sk-your-openai-api-key-here
```

## 🚀 Quick Deployment (Recommended)

### 1. Clone and Setup

```bash
# Navigate to BFF directory
cd apps/bff

# Install dependencies
npm install

# Copy environment template
cp .env.production .env.local
```

### 2. Configure Environment Variables

Edit `.env.local` with your actual values:

```bash
# Database
DATABASE_URL=your-postgresql-connection-string

# Security
JWT_SECRET=generate-strong-random-string
JWT_REFRESH_SECRET=generate-different-strong-random-string
SERVICE_TOKEN=generate-service-token

# Redis
REDIS_URL=your-redis-connection-string
```

### 3. Run Production Deployment

```bash
# Make deployment script executable
chmod +x deploy-production.sh

# Run the complete deployment
./deploy-production.sh
```

The script will automatically:

- ✅ Check environment variables
- ✅ Install dependencies
- ✅ Generate Prisma client
- ✅ Run database migrations
- ✅ Seed production database
- ✅ Run tests
- ✅ Build for production
- ✅ Deploy to Vercel
- ✅ Perform health checks

## 🔧 Manual Deployment (Alternative)

If you prefer manual deployment, follow these steps:

### 1. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Seed database
npx tsx prisma/seed-production.ts
```

### 2. Build and Deploy

```bash
# Build for production
npm run build

# Deploy to Vercel
vercel --prod
```

## 📊 Database Seeding

The production seeding script creates:

### 🏢 Organizations

- **Master Organization**: Main platform organization
- **Partner Organization**: For partner access
- **Demo Organization**: For demonstration purposes

### 👥 Demo Users

| Email | Password | Role |

|-------|----------|------|
| admin@shahin-ai.com | SuperAdmin2025 | Admin |
| manager@shahin-ai.com | Manager2025 | Manager |
| analyst@shahin-ai.com | Analyst2025 | Analyst |
| auditor@shahin-ai.com | Auditor2025 | Auditor |

### 📋 Frameworks & Controls

- **ISO 27001:2022**: 3 sample controls
- **SOC 2 Type II**: 2 sample controls
- **ISO 27701:2019**: 1 sample control

### ⚠️ Risks & Assessments

- Sample risks with different categories and priorities
- Sample assessment for ISO 27001 gap analysis

## 🔍 Post-Deployment Verification

### 1. Health Check


```bash
# Check if deployment is healthy
curl https://your-deployment-url/health
```

### 2. API Endpoints Test


```bash
# Test authentication
curl -X POST https://your-deployment-url/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@shahin-ai.com","password":"SuperAdmin2025"}'
```

### 3. Database Connectivity

```bash
# Check database connection
curl https://your-deployment-url/api/ai/health
```

## 🛡️ Security Checklist

- [ ] JWT secrets are strong random strings
- [ ] Database connection uses SSL
- [ ] Redis connection is secured
- [ ] All third-party API keys are valid
- [ ] CORS origins are correctly configured
- [ ] Rate limiting is enabled
- [ ] Authentication bypass is disabled (`BYPASS_AUTH=false`)
- [ ] SSL is enabled
- [ ] Sentry monitoring is configured

## 🚨 Troubleshooting

### Common Issues

#### 1. Database Connection Errors
```bash
# Check database URL format
DATABASE_URL=postgresql://user:password@host:port/db?sslmode=require
```

#### 2. JWT Secret Issues
```bash
# Generate strong random secrets
openssl rand -base64 64
```

#### 3. Redis Connection Errors
```bash
# Ensure Redis URL includes authentication
REDIS_URL=redis://default:password@host:port
```

#### 4. Vercel Deployment Failures
```bash
# Check Vercel logs
vercel logs your-deployment-url

# Re-deploy with debug info
vercel --prod --debug
```

### Getting Help

If you encounter issues:

1. Check the deployment logs in Vercel dashboard
2. Review the health check endpoint: `/health`
3. Check database connectivity: `/api/ai/health`
4. Verify environment variables are set correctly

## 📈 Monitoring

### Health Endpoints
- `/health` - Basic health check
- `/api/ai/health` - Database connectivity check
- `/readyz` - Service readiness check

### Logs
- Vercel provides built-in log monitoring
- Sentry integration for error tracking
- Winston logger for application logs

## 🔄 Updates & Rollbacks

### Updating Deployment
```bash
# Pull latest changes
git pull origin main

# Re-run deployment
./deploy-production.sh
```

### Rollback
```bash
# Use Vercel CLI to rollback
vercel rollback [deployment-url]
```

## 📞 Support

For deployment support:
1. Check this guide first
2. Review the troubleshooting section
3. Check Vercel documentation
4. Review application logs

---

**🎉 Congratulations! Your Shahin GRC BFF is now deployed to production!**

The platform is ready for use with:
- ✅ Complete database with sample data
- ✅ Authentication system
- ✅ Multi-tenant architecture
- ✅ Comprehensive GRC frameworks
- ✅ Production-ready security
- ✅ Monitoring and error tracking