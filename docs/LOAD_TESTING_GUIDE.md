# ⚡ Load Testing Guide - GRC Platform

**Purpose:** Verify system performance under load  
**Tool:** Artillery (Node.js load testing toolkit)  
**Target:** 100+ concurrent users, <1s p95 response time

---

## 📦 Installation

```bash
# Install Artillery globally
npm install -g artillery@latest

# Verify installation
artillery --version
# Should show: 2.x.x
```

---

## 🎯 Load Test Scenarios

### Scenario 1: Health Check Load Test

**File:** `load-tests/health-check.yml`

```yaml
config:
  target: "http://localhost:3005"
  phases:
    - duration: 60
      arrivalRate: 5
      name: "Warm up"
    - duration: 120
      arrivalRate: 20
      name: "Sustained load"
    - duration: 60
      arrivalRate: 50
      name: "Peak load"
  plugins:
    expect: {}
  
scenarios:
  - name: "Basic Health Check"
    flow:
      - get:
          url: "/health"
          expect:
            - statusCode: 200
            - contentType: json
            - hasProperty: status
      - think: 2
      
  - name: "Detailed Health Check"
    weight: 3
    flow:
      - get:
          url: "/health/detailed"
          expect:
            - statusCode: 200
      - think: 5
```

**Run:**
```bash
artillery run load-tests/health-check.yml
```

---

### Scenario 2: API Load Test

**File:** `load-tests/api-load.yml`

```yaml
config:
  target: "http://localhost:3005"
  phases:
    - duration: 300  # 5 minutes
      arrivalRate: 50  # 50 users/second = 3000 req/min
      name: "Sustained load"
    - duration: 120  # 2 minutes
      arrivalRate: 100  # 100 users/second = 6000 req/min
      name: "Peak traffic"
  payload:
    path: "test-data/tenants.csv"
    fields:
      - tenantId
      - token
  defaults:
    headers:
      Content-Type: "application/json"
      X-Tenant-ID: "{{ tenantId }}"
      Authorization: "Bearer {{ token }}"

scenarios:
  # Scenario 1: View Assessments (60% of traffic)
  - name: "View Assessments"
    weight: 60
    flow:
      - get:
          url: "/api/assessments"
          expect:
            - statusCode: 200
            - contentType: json
          capture:
            - json: "$[0].id"
              as: "assessmentId"
      - think: 3
      - get:
          url: "/api/assessments/{{ assessmentId }}"
          expect:
            - statusCode: 200
      - think: 5

  # Scenario 2: Create Assessment (20% of traffic)
  - name: "Create Assessment"
    weight: 20
    flow:
      - post:
          url: "/api/assessments"
          json:
            name: "Load Test Assessment {{ $randomString() }}"
            frameworkId: "iso27001"
            organizationId: "org-123"
            status: "in_progress"
          expect:
            - statusCode: 201
          capture:
            - json: "$.id"
              as: "newAssessmentId"
      - think: 2
      - get:
          url: "/api/assessments/{{ newAssessmentId }}"
      - think: 3

  # Scenario 3: Search & Filter (15% of traffic)
  - name: "Search Assessments"
    weight: 15
    flow:
      - get:
          url: "/api/assessments?status=in_progress&limit=20"
          expect:
            - statusCode: 200
      - think: 4
      - get:
          url: "/api/frameworks"
          expect:
            - statusCode: 200
      - think: 3

  # Scenario 4: Update Assessment (5% of traffic)
  - name: "Update Assessment"
    weight: 5
    flow:
      - get:
          url: "/api/assessments"
          capture:
            - json: "$[0].id"
              as: "updateId"
      - think: 2
      - patch:
          url: "/api/assessments/{{ updateId }}"
          json:
            status: "completed"
            completedAt: "{{ $timestamp() }}"
          expect:
            - statusCode: 200
      - think: 3
```

**Test Data:** `test-data/tenants.csv`
```csv
tenantId,token
42c676e2-8d5e-4b1d-ae80-3986b82dd5c5,test-token-1
a1b2c3d4-e5f6-7890-abcd-ef1234567890,test-token-2
```

**Run:**
```bash
artillery run load-tests/api-load.yml
```

---

### Scenario 3: Spike Test

**File:** `load-tests/spike-test.yml`

```yaml
config:
  target: "http://localhost:3005"
  phases:
    - duration: 60
      arrivalRate: 10
      name: "Normal load"
    - duration: 30
      arrivalRate: 200  # Sudden spike!
      name: "Traffic spike"
    - duration: 60
      arrivalRate: 10
      name: "Recovery"

scenarios:
  - flow:
      - get:
          url: "/api/assessments"
      - think: 1
```

---

### Scenario 4: Endurance Test

**File:** `load-tests/endurance-test.yml`

```yaml
config:
  target: "http://localhost:3005"
  phases:
    - duration: 3600  # 1 hour
      arrivalRate: 30
      name: "Sustained load - 1 hour"

scenarios:
  - flow:
      - get:
          url: "/health"
      - think: 5
      - get:
          url: "/api/assessments"
      - think: 10
```

---

## 📊 Running Load Tests

### Basic Run
```bash
artillery run load-tests/health-check.yml
```

### Save Report
```bash
artillery run load-tests/api-load.yml \
  --output report.json
```

### Generate HTML Report
```bash
artillery run load-tests/api-load.yml \
  --output report.json

artillery report report.json \
  --output report.html

# Open in browser
Start-Process report.html  # Windows
open report.html            # Mac
xdg-open report.html       # Linux
```

### Real-time Monitoring
```bash
# Terminal 1: Run load test
artillery run load-tests/api-load.yml

# Terminal 2: Monitor server
docker-compose logs -f bff

# Terminal 3: Monitor resources
docker stats
```

---

## 🎯 Performance Targets

### Response Times
```
p50 (median):  < 200ms
p95:           < 1000ms
p99:           < 3000ms
```

### Throughput
```
Requests/second:  > 500
Error rate:       < 0.1%
```

### Resource Usage
```
CPU:     < 70%
Memory:  < 80%
Disk:    < 80%
```

---

## 📈 Interpreting Results

### Good Performance Example:
```
Summary report @ 10:30:15(+0000)
  Scenarios launched:  15000
  Scenarios completed: 15000
  Requests completed:  45000
  Mean response/sec: 150
  Response time (msec):
    min: 45
    max: 1250
    median: 180
    p95: 450
    p99: 890
  Scenario counts:
    View Assessments: 9000 (60%)
    Create Assessment: 3000 (20%)
  Codes:
    200: 42000
    201: 3000
  Errors: 0
```

**Analysis:** ✅ Excellent performance
- p95 < 500ms (target: <1000ms)
- Error rate: 0% (target: <0.1%)
- All scenarios completed successfully

---

### Poor Performance Example:
```
Summary report @ 10:35:20(+0000)
  Scenarios launched:  10000
  Scenarios completed: 8500
  Requests completed:  25500
  Mean response/sec: 85
  Response time (msec):
    min: 120
    max: 15000
    median: 3200
    p95: 8500
    p99: 12000
  Codes:
    200: 20000
    500: 3000
    504: 2500
  Errors: 1500
```

**Analysis:** ❌ Performance issues detected
- p95 8500ms (target: <1000ms) - 8.5x over target!
- Error rate: 5.9% (target: <0.1%) - 59x over target!
- 15% scenarios failed to complete

**Action Required:**
1. Check database connection pool
2. Review slow queries
3. Check memory usage
4. Review application logs
5. Consider scaling

---

## 🔍 Troubleshooting Performance Issues

### Issue: High Response Times

**Diagnosis:**
```bash
# Check database
docker-compose exec postgres psql -U postgres -d grc_db
\x
SELECT query, mean_exec_time, calls 
FROM pg_stat_statements 
ORDER BY mean_exec_time DESC 
LIMIT 10;

# Check slow queries
docker-compose logs postgres | grep "duration:"
```

**Solution:**
- Add database indexes
- Optimize queries
- Implement caching
- Increase connection pool

### Issue: High Error Rate

**Diagnosis:**
```bash
# Check application logs
docker-compose logs bff | grep ERROR

# Check error tracking (Sentry)
# Visit: https://sentry.io/your-org/grc-bff
```

**Common Causes:**
- Database connection timeout
- Rate limiting triggered
- Insufficient resources
- Application bugs

### Issue: Memory Leaks

**Diagnosis:**
```bash
# Monitor memory over time
while true; do
  docker stats --no-stream bff | tail -n 1
  sleep 10
done

# Check for memory leaks in Node.js
node --inspect server.js
# Use Chrome DevTools Memory Profiler
```

**Solution:**
- Fix memory leaks in code
- Increase memory limits
- Implement connection pooling
- Review event listeners

---

## 🚀 Performance Optimization Tips

### 1. Database Optimization
```sql
-- Add indexes
CREATE INDEX idx_assessments_tenant_id ON assessments(tenant_id);
CREATE INDEX idx_assessments_status ON assessments(status);

-- Analyze queries
EXPLAIN ANALYZE SELECT * FROM assessments WHERE tenant_id = 'xxx';
```

### 2. Caching Strategy
```javascript
// Implement Redis caching
const cache = require('./cache');

async function getAssessments(tenantId) {
  const cacheKey = `assessments:${tenantId}`;
  
  // Check cache
  let data = await cache.get(cacheKey);
  if (data) return data;
  
  // Query database
  data = await db.query('SELECT * FROM assessments WHERE tenant_id = ?', [tenantId]);
  
  // Cache for 5 minutes
  await cache.set(cacheKey, data, 300);
  
  return data;
}
```

### 3. Connection Pooling
```javascript
// config/database.js
const pool = new Pool({
  max: 20,  // Maximum connections
  min: 5,   // Minimum connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

### 4. Rate Limiting Adjustment
```javascript
// For load testing, temporarily increase limits
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10000  // Increased for load testing
});
```

---

## 📋 Load Test Checklist

**Before Testing:**
- [ ] Test environment matches production specs
- [ ] Database populated with realistic data
- [ ] Rate limiting configured appropriately
- [ ] Monitoring tools ready (Grafana, New Relic)
- [ ] Backup recent data
- [ ] Team notified of testing schedule

**During Testing:**
- [ ] Monitor response times
- [ ] Monitor error rates
- [ ] Monitor resource usage (CPU, memory, disk)
- [ ] Monitor database performance
- [ ] Check application logs
- [ ] Verify tenant isolation still works

**After Testing:**
- [ ] Review all metrics
- [ ] Document issues found
- [ ] Create performance improvement tasks
- [ ] Update capacity planning
- [ ] Share results with team

---

## 🎓 Advanced Load Testing

### Custom Scenarios with Artillery
```javascript
// custom-functions.js
module.exports = {
  generateRandomAssessment: function(context, events, done) {
    context.vars.assessmentName = `Test-${Math.random().toString(36).substring(7)}`;
    context.vars.frameworkId = ['iso27001', 'nist', 'pci-dss'][Math.floor(Math.random() * 3)];
    return done();
  }
};
```

```yaml
# In load test config
config:
  processor: "./custom-functions.js"

scenarios:
  - flow:
      - function: "generateRandomAssessment"
      - post:
          url: "/api/assessments"
          json:
            name: "{{ assessmentName }}"
            frameworkId: "{{ frameworkId }}"
```

### Distributed Load Testing
```bash
# Run from multiple machines
# Machine 1:
artillery run --target "https://grc.yourcompany.com" api-load.yml

# Machine 2:
artillery run --target "https://grc.yourcompany.com" api-load.yml

# Machine 3:
artillery run --target "https://grc.yourcompany.com" api-load.yml
```

---

## 📞 Resources

- **Artillery Docs:** https://www.artillery.io/docs
- **Load Testing Best Practices:** https://www.artillery.io/blog
- **Performance Testing Guide:** https://developer.mozilla.org/en-US/docs/Web/Performance

---

**Load Testing Complete!** ⚡

You now have comprehensive load tests to verify your GRC platform can handle production traffic.
