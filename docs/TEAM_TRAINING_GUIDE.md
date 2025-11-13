# 👥 Team Training Guide - GRC Platform Enhancements

**Training Duration:** 1 hour  
**Target Audience:** Developers, DevOps, QA Engineers  
**Last Updated:** 2024

---

## 📋 Training Agenda

1. **Overview** (10 min) - What changed and why
2. **For Developers** (20 min) - New features and APIs
3. **For DevOps** (15 min) - Deployment and monitoring
4. **For QA** (10 min) - Testing strategies
5. **Q&A** (5 min)

---

## 🎯 PART 1: Overview (10 minutes)

### What Was Implemented?

We've enhanced the GRC platform with **enterprise-grade features**:

✅ **Security** - Multi-tenant isolation, rate limiting, authentication hardening  
✅ **Observability** - Health checks, structured logging, error tracking  
✅ **Reliability** - Automated backups, disaster recovery, graceful degradation  
✅ **Developer Experience** - Better error messages, request tracking, documentation  

### Why These Changes?

- 🎯 **Production Readiness** - Move from MVP to enterprise-grade
- 🔒 **Security Compliance** - Meet SOC 2 / ISO 27001 requirements
- 📊 **Operational Excellence** - Know what's happening in real-time
- 🚀 **Scalability** - Handle 1000+ concurrent users per tenant

---

## 💻 PART 2: For Developers (20 minutes)

### 2.1 New Health Check Endpoints

**What:** 4 new endpoints to monitor system health

```javascript
// Basic health check
GET /health
Response: { "status": "healthy", "uptime": 3600 }

// Detailed health (all services)
GET /health/detailed
Response: { 
  "status": "healthy",
  "services": {
    "grc-api": { "status": "healthy" },
    "auth-service": { "status": "healthy" }
  }
}

// Readiness probe (Kubernetes)
GET /health/ready
Response: { "status": "ready" }

// Liveness probe (Kubernetes)
GET /health/live
Response: { "status": "alive" }
```

**How to Use:**
```javascript
// In your code
const health = await fetch('http://localhost:3005/health');
const data = await health.json();
console.log(data.status); // "healthy"

// In monitoring (UptimeRobot, Pingdom)
URL: https://grc.yourcompany.com/health
Expected: 200 OK + "healthy"
```

---

### 2.2 Request ID Tracking

**What:** Every request gets a unique ID for tracing

**Headers Added:**
```
X-Request-ID: req_1704123456789_a1b2c3d4
X-Response-Time: 245ms
```

**How to Use in Frontend:**
```javascript
// Automatic in our enhanced apiService
import { apiService } from './services/apiService';

try {
  const data = await apiService.get('/assessments');
} catch (error) {
  // Error includes request ID for debugging
  console.error('Request failed:', error.code, error.requestId);
  // Show to user: "Error ID: req_xxx - Contact support"
}
```

**How to Debug:**
```javascript
// 1. User reports error with request ID
// 2. Search logs for that ID
docker-compose logs bff | grep "req_1704123456789"

// 3. See complete request lifecycle
{
  "timestamp": "2024-01-15T10:30:00Z",
  "level": "error",
  "message": "Database connection failed",
  "requestId": "req_1704123456789",
  "userId": "user-123",
  "tenantId": "tenant-456"
}
```

---

### 2.3 Structured Logging

**What:** JSON logs instead of plain text

**Before:**
```javascript
console.log('User logged in');
console.error('Error:', error);
```

**After:**
```javascript
const { logger } = require('./utils/logger');

logger.info('User logged in', {
  userId: user.id,
  tenantId: user.tenantId,
  email: user.email,
  action: 'login'
});

logger.error('Database query failed', error, {
  query: 'SELECT * FROM assessments',
  tenantId: req.tenantId,
  duration: 5000
});
```

**Output:**
```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "level": "info",
  "context": "BFF",
  "message": "User logged in",
  "userId": "user-123",
  "tenantId": "tenant-456",
  "email": "admin@acme.com",
  "action": "login"
}
```

**Benefits:**
- ✅ Easy to search: `| grep "tenantId=tenant-456"`
- ✅ Send to ELK/Splunk for analysis
- ✅ Create dashboards and alerts
- ✅ Track user actions for audit compliance

---

### 2.4 Enhanced API Client

**What:** Better error handling, automatic retry, progress tracking

**New Features:**
```javascript
import { apiService, cancelAllRequests } from './services/apiService';

// 1. Automatic retry (3 attempts with exponential backoff)
try {
  const data = await apiService.get('/assessments');
  // Automatically retries on network errors
} catch (error) {
  console.error('Failed after 3 retries:', error);
}

// 2. Upload with progress
await apiService.upload('/evidence', formData, (progress) => {
  setUploadProgress(progress); // 0-100
  console.log(`Uploading: ${progress}%`);
});

// 3. Download with progress
await apiService.download('/reports/123', 'report.pdf', (progress) => {
  setDownloadProgress(progress);
});

// 4. Request cancellation (important for cleanup)
useEffect(() => {
  // Component unmount - cancel all pending requests
  return () => cancelAllRequests('Component unmounted');
}, []);
```

**Error Handling:**
```javascript
try {
  await apiService.post('/assessments', data);
} catch (error) {
  switch (error.code) {
    case 'UNAUTHORIZED':
      // Redirect to login (automatic)
      break;
    case 'VALIDATION_ERROR':
      // Show validation errors
      setErrors(error.details);
      break;
    case 'RATE_LIMIT_EXCEEDED':
      // Show "Please wait" message
      showNotification('Too many requests');
      break;
    case 'NETWORK_ERROR':
      // Show offline message
      showOfflineNotification();
      break;
  }
}
```

---

### 2.5 Tenant Isolation

**What:** Automatic tenant data separation

**How It Works:**
```javascript
// Every request automatically includes tenant ID
const response = await fetch('/api/assessments', {
  headers: {
    'X-Tenant-ID': currentUser.tenantId, // Automatic
    'Authorization': `Bearer ${token}`
  }
});

// Backend automatically filters data
// User from tenant-A CANNOT access tenant-B data
// Even if they try to manipulate the request
```

**Cross-Tenant Access Prevention:**
```javascript
// Backend middleware checks:
1. Extract tenant ID from request
2. Verify user belongs to that tenant
3. If not, return 403 Forbidden
4. Log security event to Sentry

// Database queries auto-filtered:
WHERE tenant_id = 'current-user-tenant'
// No way to bypass this
```

---

### 2.6 Rate Limiting

**What:** Prevent abuse, ensure fair usage

**Tiers:**
```javascript
const tierLimits = {
  free: 100 requests / 15 minutes,
  starter: 500 requests / 15 minutes,
  professional: 2000 requests / 15 minutes,
  enterprise: 10000 requests / 15 minutes
};
```

**How to Handle:**
```javascript
// Frontend - catch rate limit errors
try {
  await apiService.post('/assessments', data);
} catch (error) {
  if (error.code === 'RATE_LIMIT_EXCEEDED') {
    showNotification({
      type: 'warning',
      message: 'Rate limit exceeded. Please wait before trying again.',
      retryAfter: error.details.retryAfter
    });
  }
}

// Response includes headers:
X-RateLimit-Limit: 2000
X-RateLimit-Remaining: 1543
X-RateLimit-Reset: 2024-01-15T11:00:00Z
```

---

### 2.7 Performance Monitoring

**What:** Track Web Vitals automatically

```javascript
import performanceMonitor from './utils/performanceMonitor';

// Automatic monitoring on page load
// Tracks:
// - LCP (Largest Contentful Paint) - should be < 2.5s
// - FID (First Input Delay) - should be < 100ms
// - CLS (Cumulative Layout Shift) - should be < 0.1
// - TTFB (Time to First Byte) - should be < 600ms

// Manual measurement
performanceMonitor.start('load-assessments');
const data = await fetchAssessments();
performanceMonitor.end('load-assessments', { count: data.length });

// View metrics
const metrics = performanceMonitor.getMetrics();
console.log(metrics);
// [
//   { label: 'load-assessments', duration: 234, count: 150 },
//   { label: 'render-dashboard', duration: 56 }
// ]

// Get averages
const avg = performanceMonitor.getAverageDuration('load-assessments');
console.log(`Average load time: ${avg}ms`);
```

---

## 🚀 PART 3: For DevOps (15 minutes)

### 3.1 Health Checks in Docker

**Updated Dockerfile:**
```dockerfile
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3005/health', ...)"
```

**Check health:**
```bash
docker-compose ps
# Should show (healthy) status

docker inspect grc-bff | grep Health
```

---

### 3.2 Automated Backups

**Scripts Created:**
- `scripts/backup-database.sh` (Linux/Mac)
- `scripts/backup-database.ps1` (Windows)

**Setup Cron Job:**
```bash
# Daily backup at 2 AM
crontab -e
0 2 * * * /path/to/scripts/backup-database.sh

# Verify backups
ls -lh /var/backups/grc/
```

**Restore from Backup:**
```bash
# Find backup
ls /var/backups/grc/

# Restore
gunzip -c grc_backup_20240115_020000.sql.gz | \
  psql -U postgres -d grc_db
```

---

### 3.3 Monitoring Setup

**Sentry (Error Tracking):**
```bash
# 1. Sign up at sentry.io
# 2. Create project
# 3. Get DSN
# 4. Update .env:
SENTRY_DSN=https://key@sentry.io/project
SENTRY_ENABLED=true

# 5. Restart
docker-compose restart bff

# 6. Test
curl http://localhost:3005/api/test-error
# Check Sentry dashboard
```

**New Relic (APM):**
```bash
# Install
npm install newrelic

# Configure apps/bff/index.js:
require('newrelic'); // First line

# Update .env:
NEW_RELIC_LICENSE_KEY=your-key
NEW_RELIC_ENABLED=true
```

---

### 3.4 Log Aggregation

**ELK Stack Setup:**
```yaml
# docker-compose.yml
elasticsearch:
  image: elasticsearch:8.11.0
  ports:
    - "9200:9200"

kibana:
  image: kibana:8.11.0
  ports:
    - "5601:5601"

logstash:
  image: logstash:8.11.0
  volumes:
    - ./logstash.conf:/config/logstash.conf
```

**View Logs:**
```bash
# Kibana UI: http://localhost:5601
# Create index pattern: grc-logs-*
# Query: tenantId:"tenant-123" AND level:"error"
```

---

## 🧪 PART 4: For QA (10 minutes)

### 4.1 Running Smoke Tests

```powershell
# Run full test suite
.\tests\smoke-tests.ps1

# Expected output:
# ✅ Basic Health Check - PASSED
# ✅ Detailed Health Check - PASSED
# ✅ Request ID Tracking - PASSED
# ✅ Frontend Availability - PASSED
# Success Rate: 100%
```

---

### 4.2 Testing Tenant Isolation

```javascript
// Test Plan:
// 1. Login as User A (Tenant 1)
// 2. Create Assessment X
// 3. Logout
// 4. Login as User B (Tenant 2)
// 5. Try to access Assessment X
// Expected: 403 Forbidden or 404 Not Found

// Test with cURL:
curl -H "X-Tenant-ID: tenant-1" \
     -H "Authorization: Bearer token-user-a" \
     http://localhost:3005/api/assessments/123
# Should succeed

curl -H "X-Tenant-ID: tenant-2" \
     -H "Authorization: Bearer token-user-b" \
     http://localhost:3005/api/assessments/123
# Should fail with 403
```

---

### 4.3 Testing Rate Limiting

```bash
# Bash
for i in {1..150}; do
  curl http://localhost:3005/api/assessments
done
# Should get 429 after ~100 requests

# PowerShell
1..150 | ForEach-Object {
  Invoke-RestMethod http://localhost:3005/api/assessments
}
```

---

### 4.4 Testing Error Scenarios

```javascript
// 1. Network Error
// - Disconnect internet
// - Try to fetch data
// - Should show "Network error" message
// - Should retry automatically

// 2. Rate Limit
// - Make 100+ requests quickly
// - Should show "Too many requests" message

// 3. Unauthorized
// - Clear auth token
// - Try to access protected resource
// - Should redirect to login

// 4. Validation Error
// - Submit form with invalid data
// - Should show field-specific errors
```

---

## 📚 Key Documentation

### Must Read (In Order):
1. **GET_STARTED.md** - Quick start (20 min)
2. **IMPROVEMENTS.md** - Technical details (1 hour)
3. **DISASTER_RECOVERY.md** - Emergency procedures (30 min)

### Reference:
- **INSTALLATION_GUIDE.md** - Setup help
- **PRODUCTION_DEPLOYMENT_CHECKLIST.md** - Pre-deploy checklist
- **apps/bff/.env.example** - Configuration reference

---

## 🎯 Practice Exercises

### Exercise 1: Debug with Request ID
1. Make an API call from frontend
2. Check Network tab for X-Request-ID
3. Find that request in backend logs
4. Trace the complete request lifecycle

### Exercise 2: Trigger Rate Limit
1. Write a script to make 150 requests
2. Observe when rate limit triggers
3. Check response headers
4. Wait for window reset

### Exercise 3: Test Tenant Isolation
1. Create two test users in different tenants
2. Try to access other tenant's data
3. Verify 403 Forbidden response
4. Check security logs

---

## ❓ Common Questions

**Q: Do I need to change my existing code?**  
A: Mostly no. New features are additive. Only if you want to use new features like `apiService` or `performanceMonitor`.

**Q: Will this affect performance?**  
A: Minimal impact. Request tracking adds ~1ms. Logging is async. Monitoring samples at 10%.

**Q: What if Redis is down?**  
A: System auto-falls back to memory-based rate limiting. No downtime.

**Q: How do I know if monitoring is working?**  
A: Check Sentry dashboard for events. Check New Relic for traces. Both should show data within minutes.

**Q: What happens during a disaster?**  
A: Follow DISASTER_RECOVERY.md. Recovery time < 4 hours. Data loss < 1 hour.

---

## 📞 Support

### During Training:
- Ask questions anytime
- We'll do live demos
- Hands-on exercises available

### After Training:
- Slack: #grc-platform-support
- Email: devops@yourcompany.com
- Docs: See files listed above
- On-call: Check PagerDuty schedule

---

## ✅ Training Completion Checklist

After this training, you should be able to:

**Developers:**
- [ ] Use new health check endpoints
- [ ] Understand request ID tracking
- [ ] Use structured logging
- [ ] Handle API errors properly
- [ ] Implement tenant-aware code

**DevOps:**
- [ ] Configure health checks
- [ ] Set up automated backups
- [ ] Configure Sentry
- [ ] Set up log aggregation
- [ ] Run smoke tests

**QA:**
- [ ] Run smoke test suite
- [ ] Test tenant isolation
- [ ] Test rate limiting
- [ ] Test error scenarios
- [ ] Verify monitoring

---

**Next Steps:**
1. Review documentation
2. Try practice exercises
3. Ask questions in Slack
4. Schedule 1-on-1 if needed

**Training Complete!** 🎉
