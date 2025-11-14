# Installation Commands for New Dependencies

## BFF (Backend for Frontend)

```bash
cd apps/bff

# Error tracking
npm install @sentry/node @sentry/profiling-node

# Redis for rate limiting (optional but recommended)
npm install ioredis rate-limit-redis

# Additional utilities
npm install crypto  # (built-in Node.js module, no install needed)
```

## Complete Package.json for BFF

Add these to your `apps/bff/package.json`:

```json
{
  "dependencies": {
    "axios": "^1.13.2",
    "cors": "^2.8.5",
    "dotenv": "^17.2.3",
    "express": "^4.21.2",
    "express-rate-limit": "^8.2.1",
    "helmet": "^8.1.0",
    "http-proxy-middleware": "^3.0.5",
    "jsonwebtoken": "^9.0.2",
    "morgan": "^1.10.0",
    "validator": "^13.15.23",
    "@sentry/node": "^7.95.0",
    "@sentry/profiling-node": "^1.3.3",
    "ioredis": "^5.3.2",
    "rate-limit-redis": "^4.2.0"
  }
}
```

## Installation Instructions

### 1. Install all new dependencies

```bash
cd D:\Projects\GRC-Master\Assessmant-GRC\apps\bff
npm install @sentry/node@^7.95.0 @sentry/profiling-node@^1.3.3 ioredis@^5.3.2 rate-limit-redis@^4.2.0
```

### 2. Verify installation

```bash
npm list @sentry/node
npm list ioredis
```

### 3. Optional: Update all dependencies

```bash
npm update
npm audit fix
```

## Environment Variables to Add

Add these to your `.env` file:

```bash
# Sentry Error Tracking
SENTRY_DSN=https://your-sentry-dsn@sentry.io/your-project-id
SENTRY_ENVIRONMENT=production
SENTRY_ENABLED=true

# Redis (for rate limiting)
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=your-redis-password

# SSL/HTTPS
SSL_ENABLED=true
SSL_CERT_PATH=/etc/ssl/certs
SSL_KEY_PATH=/etc/ssl/private

# Backups
BACKUP_DIR=/var/backups/grc
RETENTION_DAYS=7
S3_BUCKET=your-backup-bucket
AWS_REGION=us-east-1

# Notifications
WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

## Sentry Setup

1. **Create Sentry Account** (if you don't have one)
   - Go to https://sentry.io
   - Sign up for free (50,000 events/month)
   - Create a new project (Node.js/Express)

2. **Get DSN**
   - Copy the DSN from project settings
   - Add to `.env` as `SENTRY_DSN`

3. **Test Integration**
   ```bash
   # Start server
   npm run dev
   
   # Trigger a test error
   curl http://localhost:3005/test-error
   
   # Check Sentry dashboard for error
   ```

## Redis Setup (Optional but Recommended)

### Using Docker:
```bash
docker run -d --name redis-grc \
  -p 6379:6379 \
  redis:7-alpine redis-server --requirepass your-redis-password
```

### Or install locally:
```bash
# Windows (using Chocolatey)
choco install redis-64

# Ubuntu/Debian
sudo apt-get install redis-server

# macOS
brew install redis
```

### Test Redis Connection:
```bash
redis-cli -h localhost -p 6379 -a your-redis-password ping
# Should respond: PONG
```

## Verification Checklist

After installation:

- [ ] All npm packages installed without errors
- [ ] No vulnerabilities in `npm audit`
- [ ] Sentry DSN configured
- [ ] Redis connection tested (if using)
- [ ] Environment variables set
- [ ] Server starts without errors
- [ ] Health endpoints responding
- [ ] Logs show structured JSON format
- [ ] Error tracking working (test with intentional error)
- [ ] Rate limiting working (test with multiple requests)

## Troubleshooting

### Issue: @sentry/profiling-node fails to install
**Solution:** This package requires Node.js 14+ and works on specific platforms
```bash
# If it fails, you can skip profiling (optional feature)
npm install @sentry/node --save
# Then edit integrations/sentry.js and remove ProfilingIntegration
```

### Issue: ioredis connection fails
**Solution:** Redis is optional - rate limiting will fall back to memory store
```bash
# Check if Redis is running
redis-cli ping

# Or disable Redis in code - it will auto-fallback
```

### Issue: Module not found errors
**Solution:** Ensure you're in the correct directory
```bash
cd apps/bff
npm install
```

## Production Deployment

Before deploying to production:

1. **Set Production Environment Variables**
```bash
NODE_ENV=production
SENTRY_ENABLED=true
REDIS_URL=redis://your-production-redis:6379
SSL_ENABLED=true
```

2. **Install Production Dependencies Only**
```bash
npm ci --only=production
```

3. **Build Docker Image**
```bash
docker build -t grc-bff:latest .
```

4. **Test in Staging First**
```bash
# Deploy to staging environment
# Run smoke tests
# Monitor for 24 hours
# Then deploy to production
```
