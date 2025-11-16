# Production Environment Configuration for Vercel Deployment
# Shahin GRC Platform - BFF Backend
# 
# CRITICAL: Replace these placeholder values with your actual production values
# before deploying to Vercel!

# =============================================================================
# DATABASE CONFIGURATION (REQUIRED)
# =============================================================================
# Get this from your Vercel Postgres dashboard or external PostgreSQL provider
DATABASE_URL=postgresql://username:password@your-host:5432/grc_production?sslmode=require

# =============================================================================
# SECURITY: JWT & AUTHENTICATION (REQUIRED)
# =============================================================================
# Generate strong random strings for production (use: openssl rand -base64 64)
JWT_SECRET=your-super-secure-jwt-secret-key-minimum-32-characters
JWT_REFRESH_SECRET=your-super-secure-jwt-refresh-secret-key-minimum-32-characters

# Service Token for internal service communication
SERVICE_TOKEN=your-secure-service-token-minimum-32-characters

# =============================================================================
# REDIS CONFIGURATION (REQUIRED for production rate limiting)
# =============================================================================
# Get this from Upstash Redis or similar service
REDIS_URL=redis://default:your-password@your-redis-host:6379
REDIS_TOKEN=your-redis-token-if-required

# =============================================================================
# FRONTEND & CORS CONFIGURATION
# =============================================================================
# Your production frontend URLs
FRONTEND_ORIGINS=https://app.shahin-ai.com,https://www.shahin-ai.com,https://shahin-ai.com

# Public BFF URL (your Vercel deployment URL)
PUBLIC_BFF_URL=https://your-bff-deployment.vercel.app

# =============================================================================
# THIRD-PARTY INTEGRATIONS (Optional but recommended)
# =============================================================================
# Sentry Error Monitoring (get from sentry.io)
SENTRY_DSN=https://your-sentry-dsn-here@sentry.io/project-id

# SendGrid Email Service (get from sendgrid.com)
SENDGRID_API_KEY=SG.your-sendgrid-api-key-here

# Stripe Payment Processing (get from stripe.com)
STRIPE_SECRET_KEY=sk_live_your-stripe-secret-key-here
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret-here

# OpenAI API for AI Features (get from platform.openai.com)
OPENAI_API_KEY=sk-your-openai-api-key-here

# =============================================================================
# PRODUCTION CONFIGURATION
# =============================================================================
NODE_ENV=production
PRODUCTION_MODE=true
SINGLE_TENANT_MODE=true

# Feature Flags
ENABLE_TRANSACTIONS=true
ENABLE_WORKFLOWS=true
ENABLE_AUDIT_LOGGING=true

# Security (NEVER set to true in production)
BYPASS_AUTH=false

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# SSL
SSL_ENABLED=true

# =============================================================================
# MONITORING & LOGGING
# =============================================================================
LOG_LEVEL=info
ENABLE_PERFORMANCE_MONITORING=true

# =============================================================================
# INSTRUCTIONS FOR VERCEL DEPLOYMENT
# =============================================================================
# 1. Copy these values to your Vercel dashboard:
#    - Go to https://vercel.com/dashboard
#    - Select your project (or create new one)
#    - Go to Settings → Environment Variables
#    - Add all the variables above with your actual values
#
# 2. Required variables that MUST be set:
#    - DATABASE_URL (PostgreSQL connection)
#    - JWT_SECRET (strong random string)
#    - JWT_REFRESH_SECRET (different strong random string)
#    - SERVICE_TOKEN (secure random string)
#    - REDIS_URL (Redis connection for rate limiting)
#
# 3. Optional but recommended:
#    - SENTRY_DSN (for error monitoring)
#    - SENDGRID_API_KEY (for email notifications)
#    - STRIPE_SECRET_KEY (for payments)
#    - OPENAI_API_KEY (for AI features)
#
# 4. Deploy using:
#    npm run vercel-build
#    vercel --prod