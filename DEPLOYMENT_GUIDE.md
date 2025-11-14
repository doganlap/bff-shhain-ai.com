# Shahin-AI Three Access Paths - Production Deployment Guide

**Version:** 1.0.0  
**Date:** November 14, 2025  
**Author:** Shahin-AI Platform Team

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Pre-Deployment Checklist](#pre-deployment-checklist)
3. [Database Setup](#database-setup)
4. [Backend Deployment](#backend-deployment)
5. [Frontend Deployment](#frontend-deployment)
6. [Post-Deployment Verification](#post-deployment-verification)
7. [Monitoring & Maintenance](#monitoring--maintenance)
8. [Rollback Procedures](#rollback-procedures)
9. [Security Considerations](#security-considerations)

---

## 🔧 Prerequisites

### Infrastructure Requirements

- **Database:** PostgreSQL 12+ with SSL support
- **Node.js:** v18.x or higher
- **Memory:** Minimum 2GB RAM per service
- **Storage:** Minimum 20GB available space
- **SSL Certificates:** Valid SSL/TLS certificates
- **Domain:** Configured DNS records

### Required Accounts & Access

- Database admin credentials
- SMTP server for email notifications
- Sentry account for error tracking (optional)
- Redis instance for caching (optional)

---

## ✅ Pre-Deployment Checklist

### 1. Environment Configuration

```bash
# Copy production template
cp apps/bff/.env.production.template apps/bff/.env.production

# Generate secure secrets
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))" # JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))" # SERVICE_TOKEN
```

###  2. Update Environment Variables

Edit `apps/bff/.env.production`:

```ini
# Database
DATABASE_URL=postgresql://username:password@host:5432/shahin_grc_prod?sslmode=require

# JWT Secret (use generated value)
JWT_SECRET=your_generated_64_char_hex_string

# Frontend URL
FRONTEND_URL=https://app.shahin-ai.com
CORS_ORIGIN=https://app.shahin-ai.com

# Service Token
SERVICE_TOKEN=your_generated_32_char_hex_string

# Email
SMTP_HOST=smtp.sendgrid.net
SMTP_USER=apikey
SMTP_PASSWORD=your_sendgrid_api_key
```

### 3. Security Audit

- [ ] All secrets are unique and generated securely
- [ ] No hardcoded credentials in code
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] HTTPS enforcement enabled
- [ ] JWT expiration configured appropriately

---

## 🗄️ Database Setup

### 1. Create Production Database

```bash
# Connect to PostgreSQL
psql -U postgres -h your-db-host.com

# Create database
CREATE DATABASE shahin_grc_prod;

# Create application user
CREATE USER grc_app_user WITH ENCRYPTED PASSWORD 'secure_password_here';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE shahin_grc_prod TO grc_app_user;
```

### 2. Run Migrations

```bash
cd apps/bff

# Set production database URL
export DATABASE_URL="postgresql://grc_app_user:password@host:5432/shahin_grc_prod"

# Run Prisma migrations
npx prisma migrate deploy

# Run Three Access Paths migration
psql -U grc_app_user -d shahin_grc_prod -h host \
  -f prisma/migrations/20251114_three_access_paths/migration.sql
```

### 3. Verify Database

```sql
-- Check tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Verify migration
SELECT * FROM tenants;
SELECT * FROM users;
SELECT COUNT(*) FROM demo_requests;
SELECT COUNT(*) FROM poc_requests;
SELECT COUNT(*) FROM partner_invitations;
```

### 4. Create Initial Partner Account

```sql
-- Insert partner tenant
INSERT INTO tenants (slug, display_name, type, status)
VALUES ('production-partner', 'Production Partner', 'partner', 'active');

-- Insert partner user (get tenant_id from previous insert)
INSERT INTO users (tenant_id, email, password_hash, full_name, role, is_partner)
VALUES (
  '[tenant_id_from_above]',
  'partner@yourdomain.com',
  '$2a$10$[bcrypt_hash_here]', -- Generate with: npx bcrypt-cli 'password' 10
  'Partner Admin',
  'partner-admin',
  TRUE
);
```

---

## 🚀 Backend Deployment

### Option 1: Docker Deployment

```bash
cd apps/bff

# Build Docker image
docker build -t shahin-grc-bff:1.0.0 -f Dockerfile .

# Run container
docker run -d \
  --name shahin-grc-bff \
  --env-file .env.production \
  -p 8001:8001 \
  --restart unless-stopped \
  shahin-grc-bff:1.0.0
```

### Option 2: PM2 Deployment

```bash
cd apps/bff

# Install dependencies
npm ci --production

# Generate Prisma Client
npx prisma generate

# Start with PM2
pm2 start index.js \
  --name shahin-grc-bff \
  --instances 4 \
  --exec-mode cluster \
  --env production

# Save PM2 configuration
pm2 save
pm2 startup
```

### Option 3: Kubernetes Deployment

```bash
# Apply Kubernetes manifests
kubectl apply -f k8s/bff-deployment.yaml
kubectl apply -f k8s/bff-service.yaml
kubectl apply -f k8s/bff-ingress.yaml

# Verify deployment
kubectl get pods -l app=shahin-grc-bff
kubectl logs -f deployment/shahin-grc-bff
```

---

## 🌐 Frontend Deployment

### Build Production Bundle

```bash
cd apps/web

# Install dependencies
npm ci

# Build for production
npm run build

# Output in: dist/
```

### Deploy to CDN/Static Hosting

#### Vercel

```bash
vercel --prod
```

#### Netlify

```bash
netlify deploy --prod --dir=dist
```

#### AWS S3 + CloudFront

```bash
# Upload to S3
aws s3 sync dist/ s3://your-bucket-name/ --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id YOUR_DIST_ID \
  --paths "/*"
```

---

## ✅ Post-Deployment Verification

### 1. Health Checks

```bash
# BFF Health
curl https://api.shahin-ai.com/health

# Expected response:
# {"status":"healthy","service":"BFF","timestamp":"..."}
```

### 2. Test Demo Registration

```bash
curl -X POST https://api.shahin-ai.com/api/public/demo/request \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "email": "test@example.com",
    "companyName": "Test Company"
  }'

# Should return tenant, user, and JWT token
```

### 3. Test Partner Login

```bash
curl -X POST https://api.shahin-ai.com/api/partner/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "partner@yourdomain.com",
    "password": "your_password"
  }'

# Should return user, tenant, and JWT token
```

### 4. Test POC Request

```bash
curl -X POST https://api.shahin-ai.com/api/public/poc/request \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "POC Manager",
    "email": "poc@bigcorp.com",
    "companyName": "Big Corporation",
    "useCases": ["enterprise-grc"]
  }'

# Should return requestId and pending_review status
```

### 5. Frontend Verification

```bash
# Visit these URLs and verify:
1. https://app.shahin-ai.com/demo
2. https://app.shahin-ai.com/partner
3. https://app.shahin-ai.com/poc
```

---

## 📊 Monitoring & Maintenance

### Application Monitoring

```bash
# PM2 Monitoring
pm2 monit

# Check logs
pm2 logs shahin-grc-bff

# View metrics
curl https://api.shahin-ai.com:9090/metrics
```

### Database Monitoring

```sql
-- Active connections
SELECT COUNT(*) FROM pg_stat_activity WHERE datname = 'shahin_grc_prod';

-- Table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Recent demo registrations
SELECT COUNT(*), DATE(created_at) 
FROM demo_requests 
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at);
```

### Log Rotation

```bash
# PM2 log rotation
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
```

---

## 🔄 Rollback Procedures

### Emergency Rollback

```bash
# Option 1: PM2 Rollback
pm2 stop shahin-grc-bff
git checkout previous-stable-tag
npm ci --production
npx prisma generate
pm2 restart shahin-grc-bff

# Option 2: Docker Rollback
docker stop shahin-grc-bff
docker rm shahin-grc-bff
docker run -d shahin-grc-bff:previous-version
```

### Database Rollback

```bash
# Restore from backup
pg_restore -U grc_app_user -d shahin_grc_prod backup_file.dump

# Or use point-in-time recovery if available
```

---

## 🔒 Security Considerations

### 1. Secrets Management

- Use environment variables, never commit secrets
- Rotate JWT_SECRET and SERVICE_TOKEN regularly (quarterly)
- Use secret management services (AWS Secrets Manager, Azure Key Vault)

### 2. Database Security

- Enable SSL/TLS for database connections
- Use separate read-only replicas for reporting
- Regular security patches and updates
- Implement row-level security (RLS) for tenant isolation

### 3. API Security

- Rate limiting configured per endpoint
- CORS restricted to known domains
- JWT token validation on all protected routes
- Request size limits enforced

### 4. Compliance

- GDPR: Data retention policies configured
- Audit logging enabled for all tenant operations
- Regular security audits
- Data encryption at rest and in transit

---

## 📞 Support & Troubleshooting

### Common Issues

**Issue:** Database connection refused
```bash
# Check connection string format
# Verify SSL mode matches database config
# Test connection: psql -U user -h host -d database
```

**Issue:** JWT token validation fails
```bash
# Verify JWT_SECRET matches across all services
# Check token expiration settings
# Verify clock synchronization (NTP)
```

**Issue:** CORS errors
```bash
# Verify CORS_ORIGIN matches frontend URL exactly
# Check for trailing slashes
# Verify HTTPS vs HTTP
```

### Emergency Contacts

- **Platform Team:** platform@shahin-ai.com
- **DevOps:** devops@shahin-ai.com
- **Security:** security@shahin-ai.com

---

## 📝 Changelog

### v1.0.0 (2025-11-14)
- ✅ Initial production deployment
- ✅ Three access paths implemented (Demo, Partner, POC)
- ✅ Multi-tenant architecture
- ✅ JWT authentication
- ✅ Database migration completed
- ✅ All integration tests passed

---

**Document Status:** Production Ready ✅  
**Last Updated:** November 14, 2025  
**Next Review:** December 14, 2025
