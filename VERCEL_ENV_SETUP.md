# Production Environment Configuration for Vercel Deployment

## Shahin GRC Platform – BFF Backend

CRITICAL: Replace these placeholder values with your actual production values before deploying to Vercel.

### Database Configuration (required)

Get this from your Vercel Postgres dashboard or external PostgreSQL provider.

```env
DATABASE_URL=postgresql://username:password@your-host:5432/grc_production?sslmode=require
```

### Security: JWT & Authentication (required)

Generate strong random strings for production (use: `openssl rand -base64 64`).

```env
JWT_SECRET=your-super-secure-jwt-secret-key-minimum-32-characters
JWT_REFRESH_SECRET=your-super-secure-jwt-refresh-secret-key-minimum-32-characters
SERVICE_TOKEN=your-secure-service-token-minimum-32-characters
```

### Redis Configuration (required for production rate limiting)

Get this from Upstash Redis or similar service.

```env
REDIS_URL=redis://default:your-password@your-redis-host:6379
REDIS_TOKEN=your-redis-token-if-required
```

### Frontend & CORS Configuration

Your production frontend URLs and public BFF URL.

```env
FRONTEND_ORIGINS=https://app.shahin-ai.com,https://www.shahin-ai.com,https://shahin-ai.com
PUBLIC_BFF_URL=https://your-bff-deployment.vercel.app
```

### Third-Party Integrations (optional but recommended)

```env
SENTRY_DSN=https://your-sentry-dsn-here@sentry.io/project-id
SENDGRID_API_KEY=SG.your-sendgrid-api-key-here
STRIPE_SECRET_KEY=sk_live_your-stripe-secret-key-here
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret-here
OPENAI_API_KEY=sk-your-openai-api-key-here
```

### Production Configuration

```env
NODE_ENV=production
PRODUCTION_MODE=true
SINGLE_TENANT_MODE=true

ENABLE_TRANSACTIONS=true
ENABLE_WORKFLOWS=true
ENABLE_AUDIT_LOGGING=true

BYPASS_AUTH=false

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

SSL_ENABLED=true
```

### Monitoring & Logging

```env
LOG_LEVEL=info
ENABLE_PERFORMANCE_MONITORING=true
```

### Instructions for Vercel Deployment

1. Copy these values to your Vercel dashboard:
   - Go to <https://vercel.com/dashboard>
   - Select your project (or create new one)
   - Go to Settings → Environment Variables
   - Add all the variables above with your actual values

2. Required variables that MUST be set:
   - `DATABASE_URL` (PostgreSQL connection)
   - `JWT_SECRET` (strong random string)
   - `JWT_REFRESH_SECRET` (different strong random string)
   - `SERVICE_TOKEN` (secure random string)
   - `REDIS_URL` (Redis connection for rate limiting)

3. Optional but recommended:
   - `SENTRY_DSN` (for error monitoring)
   - `SENDGRID_API_KEY` (for email notifications)
   - `STRIPE_SECRET_KEY` (for payments)
   - `OPENAI_API_KEY` (for AI features)

4. Deploy using:
   - `npm run vercel-build`
   - `vercel --prod`