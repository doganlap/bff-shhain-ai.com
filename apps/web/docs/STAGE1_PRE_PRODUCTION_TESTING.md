# Stage 1 Pre-Production Testing Plan

## Overview

**Service:** Regulatory Intelligence Service - KSA  
**Testing Level:** Pre-Production  
**Must Pass:** All tests before production deployment

---

## 1. Backend API Testing

### 1.1 Health Check Tests

```bash
# Test 1: Basic health check
curl http://localhost:3008/healthz
# Expected: Status 200, { "status": "healthy", "service": "regulatory-intelligence-ksa" }

# Test 2: Readiness check
curl http://localhost:3008/readyz
# Expected: Status 200, { "status": "ready", "database": "connected", "redis": "connected" }

# Test 3: Invalid endpoint
curl http://localhost:3008/invalid
# Expected: Status 404
```

**Pass Criteria:**
- ✅ Health endpoint returns 200
- ✅ Readiness check confirms DB and Redis connection
- ✅ Invalid endpoints return proper 404

### 1.2 API Endpoint Tests

```bash
# Test 4: Get regulators list
curl http://localhost:3008/api/regulatory/regulators
# Expected: Array of 6 Saudi regulators (SAMA, NCA, MOH, ZATCA, SDAIA, CMA)

# Test 5: Get recent changes (empty DB)
curl http://localhost:3008/api/regulatory/changes
# Expected: Status 200, { "success": true, "count": 0, "data": [] }

# Test 6: Get statistics
curl http://localhost:3008/api/regulatory/stats
# Expected: Status 200, { "success": true, "data": { "total_changes": 0, ... } }

# Test 7: Manual scrape trigger
curl -X POST http://localhost:3008/api/regulatory/scrape/SAMA
# Expected: Status 200, starts scraping process

# Test 8: Invalid regulator scrape
curl -X POST http://localhost:3008/api/regulatory/scrape/INVALID
# Expected: Status 500, error message

# Test 9: Get change details (non-existent)
curl http://localhost:3008/api/regulatory/changes/999999
# Expected: Status 404, { "success": false, "error": "Regulatory change not found" }

# Test 10: Add to calendar (missing data)
curl -X POST http://localhost:3008/api/regulatory/calendar/add \
  -H "Content-Type: application/json" \
  -d '{}'
# Expected: Status 400, { "success": false, "error": "regulatoryChangeId and organizationId are required" }
```

**Pass Criteria:**
- ✅ All endpoints return correct status codes
- ✅ Error handling works properly
- ✅ Required parameters validation works
- ✅ Empty state returns valid responses

### 1.3 Database Connection Tests

```bash
# Test 11: Database tables exist
psql -U postgres -d grc_assessment -c "\dt regulatory*"
# Expected: Shows 3 tables (regulatory_changes, regulatory_impacts, regulatory_calendar)

# Test 12: Database indexes exist
psql -U postgres -d grc_assessment -c "\di regulatory*"
# Expected: Shows indexes on key columns

# Test 13: Insert test data
psql -U postgres -d grc_assessment -c "
INSERT INTO regulatory_changes (regulator_id, regulator_name, title, urgency_level) 
VALUES ('TEST', 'Test Regulator', 'Test Change', 'medium') 
RETURNING id;"
# Expected: Returns new ID

# Test 14: Query test data
curl http://localhost:3008/api/regulatory/changes
# Expected: Shows the test change in results

# Test 15: Clean up test data
psql -U postgres -d grc_assessment -c "DELETE FROM regulatory_changes WHERE regulator_id = 'TEST';"
# Expected: DELETE 1
```

**Pass Criteria:**
- ✅ All database tables created
- ✅ Indexes properly configured
- ✅ Data insertion works
- ✅ Data retrieval works
- ✅ Data deletion works

### 1.4 Redis Caching Tests

```bash
# Test 16: Redis connection
redis-cli PING
# Expected: PONG

# Test 17: Set cache key
redis-cli SET "test:regulatory" "test_value" EX 60
# Expected: OK

# Test 18: Get cache key
redis-cli GET "test:regulatory"
# Expected: "test_value"

# Test 19: Check scraper caching
curl http://localhost:3008/api/regulatory/changes?regulator=SAMA
# First call should cache results
redis-cli KEYS "*SAMA*"
# Expected: Shows cache key

# Test 20: Verify cache expiration
redis-cli TTL "SAMA:recent_changes"
# Expected: Shows TTL in seconds (should be < 3600)
```

**Pass Criteria:**
- ✅ Redis connection works
- ✅ Cache keys are set properly
- ✅ Cache retrieval works
- ✅ TTL is configured correctly

### 1.5 OpenAI Integration Tests

```bash
# Test 21: Verify OpenAI API key is set
echo $OPENAI_API_KEY
# Expected: Shows API key (not empty)

# Test 22: Test impact analysis with mock data
# Create a test regulatory change first, then:
curl http://localhost:3008/api/regulatory/changes/1
# Expected: Should return change with AI-generated impact analysis
# Check that impact.impactScore is between 1-10
# Check that impact.requiredActions is an array
```

**Pass Criteria:**
- ✅ OpenAI API key configured
- ✅ AI analysis returns valid data
- ✅ Fallback works if AI fails

---

## 2. Frontend Component Testing

### 2.1 Component Rendering Tests

**Test in Browser (Manual):**

```
URL: http://localhost:5173/app/regulatory
```

**Test 23: Page Loads**
- ✅ Page renders without errors
- ✅ No console errors
- ✅ All components visible
- ✅ Arabic text displays correctly (RTL)

**Test 24: Header Component**
- ✅ Title shows: "مركز الذكاء التنظيمي"
- ✅ Refresh button visible and clickable
- ✅ Loading spinner shows when refreshing

**Test 25: Statistics Cards**
- ✅ Four cards displayed
- ✅ Numbers show correctly
- ✅ Icons render properly
- ✅ Colors match urgency levels

**Test 26: Filters**
- ✅ Regulator dropdown shows 7 options (All + 6 regulators)
- ✅ Urgency dropdown shows 5 options
- ✅ Selecting filter updates results
- ✅ Arabic text in dropdowns displays correctly

**Test 27: Regulatory Feed Widget**
- ✅ Loads without errors
- ✅ Shows loading state initially
- ✅ Displays empty state when no data
- ✅ Shows regulatory changes when data exists
- ✅ Color-coded urgency badges work
- ✅ Dates format correctly (Arabic)
- ✅ Buttons are clickable

**Test 28: Compliance Calendar Widget**
- ✅ Loads without errors
- ✅ Shows loading state initially
- ✅ Displays empty state message
- ✅ Days filter buttons (30/60/90) work
- ✅ Deadline items display correctly
- ✅ Hijri dates show correctly

**Test 29: Impact Assessment Modal**
- ✅ Opens when "View Impact" clicked
- ✅ Shows loading state
- ✅ Displays impact data correctly
- ✅ Impact score shows with color coding
- ✅ Close button works
- ✅ "Add to Calendar" button works
- ✅ Modal closes on background click

### 2.2 User Interaction Tests

**Test 30: Filter by Regulator**
1. Open page
2. Select "SAMA" from regulator dropdown
3. Click away
- ✅ Feed updates to show only SAMA changes
- ✅ Statistics update accordingly

**Test 31: Filter by Urgency**
1. Select "Critical" from urgency dropdown
2. Click away
- ✅ Feed shows only critical changes
- ✅ Other urgency levels filtered out

**Test 32: View Impact Analysis**
1. Click "View Impact" button on any change
2. Wait for modal to load
- ✅ Modal opens
- ✅ Impact score displays
- ✅ Required actions list shows
- ✅ All sections render properly

**Test 33: Add to Calendar**
1. Click "Add to Calendar" button
2. Check console/network tab
- ✅ API call is made
- ✅ Success message shows (or error is handled)
- ✅ Calendar widget updates

**Test 34: Mark Deadline Complete**
1. In calendar widget, click "Mark Complete" button
2. Wait for response
- ✅ API call succeeds
- ✅ Item updates or disappears
- ✅ Visual feedback provided

**Test 35: Refresh Data**
1. Click refresh button in header
2. Observe behavior
- ✅ Loading spinner shows
- ✅ Data reloads
- ✅ Statistics update

### 2.3 Responsive Design Tests

**Test 36: Desktop (1920x1080)**
- ✅ Layout looks good
- ✅ All components visible
- ✅ No horizontal scroll
- ✅ Grid layout works (2 columns + 1 sidebar)

**Test 37: Laptop (1366x768)**
- ✅ Layout adjusts properly
- ✅ All content visible
- ✅ No overlapping elements

**Test 38: Tablet (768x1024)**
- ✅ Switches to single column
- ✅ Calendar widget moves below feed
- ✅ All features accessible

**Test 39: Mobile (375x667)**
- ✅ Mobile layout active
- ✅ All buttons accessible
- ✅ Text readable
- ✅ No horizontal scroll

---

## 3. Integration Testing

### 3.1 BFF to Backend Tests

```bash
# Test 40: Through BFF
curl http://localhost:3000/api/regulatory/regulators
# Expected: Same response as direct backend call

# Test 41: BFF proxy working
curl http://localhost:3000/api/regulatory/changes
# Expected: Status 200, proxied response from backend

# Test 42: BFF error handling
# Stop regulatory service
curl http://localhost:3000/api/regulatory/changes
# Expected: Status 502, { "error": "Service unavailable", "service": "regulatory-intelligence-ksa" }
```

**Pass Criteria:**
- ✅ BFF routes requests correctly
- ✅ Headers are forwarded properly
- ✅ Error handling works
- ✅ Service unavailable returns 502

### 3.2 Frontend to BFF Tests

**Test 43: API Client**
- Open browser console
- Run: `await regulatoryAPI.getRegulators()`
- ✅ Returns array of regulators
- ✅ No CORS errors
- ✅ Response structure correct

**Test 44: End-to-End Flow**
1. Open: http://localhost:5173/app/regulatory
2. Open browser DevTools → Network tab
3. Observe API calls
- ✅ Calls go to http://localhost:3000/api/regulatory/*
- ✅ Responses are successful (200)
- ✅ Data renders in UI

### 3.3 Database to Backend Tests

**Test 45: Multi-Tenancy**
```bash
# Create test data for different tenants
psql -U postgres -d grc_assessment -c "
INSERT INTO regulatory_changes (regulator_id, regulator_name, title, tenant_id) 
VALUES ('TEST', 'Test', 'Tenant 1 Change', 1), 
       ('TEST', 'Test', 'Tenant 2 Change', 2);"

# Query with tenant context (would need to add tenant header in real test)
curl -H "X-Tenant-ID: 1" http://localhost:3008/api/regulatory/changes
# Expected: Shows only Tenant 1 changes (when RLS is enabled)
```

**Pass Criteria:**
- ✅ Tenant isolation works
- ✅ Cross-tenant data not visible
- ✅ Tenant context properly injected

---

## 4. Performance Testing

### 4.1 Response Time Tests

```bash
# Test 46: API response times
time curl http://localhost:3008/api/regulatory/changes
# Expected: < 200ms

# Test 47: With cached data
curl http://localhost:3008/api/regulatory/changes  # First call (cache miss)
time curl http://localhost:3008/api/regulatory/changes  # Second call (cache hit)
# Expected: Second call < 50ms

# Test 48: Impact analysis (AI call)
time curl http://localhost:3008/api/regulatory/changes/1
# Expected: < 5 seconds (includes OpenAI API call)
```

**Pass Criteria:**
- ✅ Regular API calls < 200ms
- ✅ Cached calls < 50ms
- ✅ AI analysis < 5 seconds
- ✅ No timeouts

### 4.2 Load Testing

**Test 49: Concurrent Requests**
```bash
# Install Apache Bench
# Test with 100 concurrent requests
ab -n 1000 -c 100 http://localhost:3008/api/regulatory/changes
```

**Expected Results:**
- ✅ All requests succeed (no 5xx errors)
- ✅ Average response time < 500ms
- ✅ No connection errors
- ✅ Server doesn't crash

**Test 50: Memory Usage**
```bash
# Monitor during load test
docker stats regulatory-intelligence-ksa
```

**Expected Results:**
- ✅ Memory usage < 512MB
- ✅ No memory leaks (stays stable)
- ✅ CPU usage acceptable

### 4.3 Database Performance

**Test 51: Query Performance**
```sql
EXPLAIN ANALYZE 
SELECT * FROM regulatory_changes 
WHERE urgency_level = 'critical' 
ORDER BY created_at DESC 
LIMIT 50;
```

**Pass Criteria:**
- ✅ Query uses index
- ✅ Execution time < 10ms
- ✅ No sequential scans

---

## 5. Security Testing

### 5.1 API Security Tests

**Test 52: SQL Injection**
```bash
curl "http://localhost:3008/api/regulatory/changes?regulator=SAMA';DROP TABLE regulatory_changes;--"
# Expected: Handled safely, no SQL injection

curl -X POST http://localhost:3008/api/regulatory/calendar/add \
  -H "Content-Type: application/json" \
  -d '{"regulatoryChangeId": "1; DROP TABLE regulatory_changes;--", "organizationId": 1}'
# Expected: Validation error or safe handling
```

**Pass Criteria:**
- ✅ SQL injection attempts blocked
- ✅ Input validation works
- ✅ Database not compromised

**Test 53: XSS Prevention**
```bash
curl -X POST http://localhost:3008/api/regulatory/scrape/TEST \
  -H "Content-Type: application/json" \
  -d '{"title": "<script>alert(\"XSS\")</script>"}'
# Expected: Script tags escaped or sanitized
```

**Pass Criteria:**
- ✅ XSS attempts sanitized
- ✅ Output is escaped
- ✅ No script execution in browser

**Test 54: Rate Limiting**
```bash
# Send 200 requests in quick succession
for i in {1..200}; do curl http://localhost:3008/api/regulatory/changes & done
```

**Pass Criteria:**
- ✅ Rate limiting activates after 100 requests
- ✅ Returns 429 Too Many Requests
- ✅ Service remains stable

### 5.2 Authentication & Authorization

**Test 55: Protected Endpoints** (if auth is enabled)
```bash
curl http://localhost:3008/api/regulatory/scrape/SAMA
# Without auth token
# Expected: 401 Unauthorized (if auth required)
```

**Test 56: Tenant Isolation**
```bash
# Try to access another tenant's data
curl -H "X-Tenant-ID: 1" http://localhost:3008/api/regulatory/calendar/999
# Where ID 999 belongs to tenant 2
# Expected: 403 Forbidden or 404 Not Found
```

**Pass Criteria:**
- ✅ Auth endpoints protected
- ✅ Tenant isolation enforced
- ✅ Unauthorized access blocked

### 5.3 Environment Variables

**Test 57: Sensitive Data**
```bash
# Check that secrets are not exposed
curl http://localhost:3008/api/regulatory/stats
# Response should NOT contain:
# - Database passwords
# - API keys
# - Service tokens
```

**Pass Criteria:**
- ✅ No secrets in API responses
- ✅ No secrets in error messages
- ✅ No secrets in logs (check logs/)

---

## 6. Error Handling & Recovery

### 6.1 Database Failure

**Test 58: Database Down**
```bash
# Stop PostgreSQL
docker stop postgres  # or equivalent

# Try API call
curl http://localhost:3008/api/regulatory/changes
# Expected: 500 error with graceful message

# Check health endpoint
curl http://localhost:3008/readyz
# Expected: 503 Service Unavailable

# Restart database
docker start postgres

# Verify recovery
curl http://localhost:3008/readyz
# Expected: 200 OK (service recovers)
```

**Pass Criteria:**
- ✅ Graceful error messages
- ✅ Service doesn't crash
- ✅ Automatic recovery when DB returns

### 6.2 Redis Failure

**Test 59: Redis Down**
```bash
# Stop Redis
docker stop redis  # or equivalent

# Try API call (should work, just without caching)
curl http://localhost:3008/api/regulatory/changes
# Expected: 200 OK (degraded but functional)

# Restart Redis
docker start redis

# Verify caching resumes
```

**Pass Criteria:**
- ✅ Service continues without Redis
- ✅ Warning logged but no crash
- ✅ Caching resumes when Redis returns

### 6.3 OpenAI API Failure

**Test 60: OpenAI Down/Invalid Key**
```bash
# Set invalid API key temporarily
export OPENAI_API_KEY="invalid_key"

# Restart service and try impact analysis
curl http://localhost:3008/api/regulatory/changes/1
# Expected: Returns fallback analysis, not crashes
```

**Pass Criteria:**
- ✅ Fallback analysis provided
- ✅ Service doesn't crash
- ✅ Error logged appropriately

### 6.4 Network Issues

**Test 61: Timeout Handling**
```bash
# Simulate slow network (would need network throttling)
# Or set very short timeout in code temporarily

# Expected: Proper timeout error
# Expected: No hanging requests
```

**Pass Criteria:**
- ✅ Timeouts handled gracefully
- ✅ No hanging connections
- ✅ Clear error messages

---

## 7. Data Integrity Tests

### 7.1 Scraper Tests

**Test 62: Duplicate Prevention**
```bash
# Run same scraper twice
curl -X POST http://localhost:3008/api/regulatory/scrape/SAMA
curl -X POST http://localhost:3008/api/regulatory/scrape/SAMA

# Check database
psql -U postgres -d grc_assessment -c "
SELECT title, COUNT(*) 
FROM regulatory_changes 
GROUP BY title 
HAVING COUNT(*) > 1;"
# Expected: No duplicates
```

**Pass Criteria:**
- ✅ No duplicate entries created
- ✅ Deduplication logic works

**Test 63: Data Validation**
```sql
-- Check for invalid data
SELECT * FROM regulatory_changes 
WHERE urgency_level NOT IN ('critical', 'high', 'medium', 'low');
-- Expected: 0 rows

SELECT * FROM regulatory_changes 
WHERE title IS NULL OR title = '';
-- Expected: 0 rows
```

**Pass Criteria:**
- ✅ All urgency levels valid
- ✅ No NULL required fields
- ✅ Data constraints enforced

---

## 8. Notification Tests

### 8.1 Email Notifications

**Test 64: Email Sending** (if SMTP configured)
```bash
# Trigger a notification
# Create a critical regulatory change
# Expected: Email sent to configured addresses

# Check logs
tail -f logs/combined.log | grep "Email"
# Expected: Shows email sent successfully
```

**Pass Criteria:**
- ✅ Email sending works (if configured)
- ✅ Graceful handling if not configured
- ✅ No crashes if SMTP fails

### 8.2 WhatsApp/SMS

**Test 65: WhatsApp** (if configured)
```bash
# Similar to email test
# Expected: WhatsApp message sent or gracefully skipped
```

**Pass Criteria:**
- ✅ WhatsApp works (if configured)
- ✅ Graceful skip if not configured
- ✅ No crashes

---

## 9. Logging & Monitoring

### 9.1 Log Files

**Test 66: Log Creation**
```bash
ls -la apps/services/regulatory-intelligence-service-ksa/logs/
# Expected: combined.log and error.log exist
```

**Test 67: Log Content**
```bash
tail -50 logs/combined.log
# Expected: Shows structured JSON logs
# Expected: Contains timestamps
# Expected: Contains log levels (info, warn, error)
```

**Pass Criteria:**
- ✅ Logs created automatically
- ✅ Structured JSON format
- ✅ Proper log levels
- ✅ No sensitive data in logs

### 9.2 Error Tracking

**Test 68: Error Logs**
```bash
# Trigger an error (e.g., invalid scraper)
curl -X POST http://localhost:3008/api/regulatory/scrape/INVALID

# Check error log
tail -10 logs/error.log
# Expected: Shows error details
```

**Pass Criteria:**
- ✅ Errors logged to error.log
- ✅ Stack traces included
- ✅ Helpful error messages

---

## 10. Deployment Tests

### 10.1 Docker Tests

**Test 69: Docker Build**
```bash
cd apps/services/regulatory-intelligence-service-ksa
docker build -t regulatory-intelligence-ksa:test .
# Expected: Build succeeds, no errors
```

**Test 70: Docker Run**
```bash
docker run -d --name reg-test \
  -p 3008:3008 \
  --env-file .env \
  regulatory-intelligence-ksa:test

# Wait 10 seconds for startup
sleep 10

# Test health
curl http://localhost:3008/healthz
# Expected: 200 OK

# Cleanup
docker stop reg-test && docker rm reg-test
```

**Pass Criteria:**
- ✅ Docker image builds successfully
- ✅ Container starts without errors
- ✅ Health checks pass
- ✅ Service functional in container

### 10.2 Environment Configuration

**Test 71: Environment Variables**
```bash
# Test with minimal env vars
docker run --rm \
  -e DB_HOST=localhost \
  -e DB_NAME=grc_assessment \
  -e DB_USER=postgres \
  -e DB_PASSWORD=test \
  regulatory-intelligence-ksa:test node -e "console.log(process.env.DB_HOST)"
# Expected: Shows "localhost"
```

**Pass Criteria:**
- ✅ Environment variables loaded
- ✅ Defaults work for optional vars
- ✅ Service fails gracefully if required vars missing

---

## 11. Browser Compatibility Tests

### Test 72: Chrome/Edge
- ✅ Page loads correctly
- ✅ All features work
- ✅ No console errors

### Test 73: Firefox
- ✅ Page loads correctly
- ✅ All features work
- ✅ No console errors

### Test 74: Safari
- ✅ Page loads correctly
- ✅ All features work
- ✅ Date formatting works

---

## Final Pre-Production Checklist

### Must Pass Before Production:

#### Backend
- [ ] All API endpoints return correct responses
- [ ] Database tables created and indexed
- [ ] Error handling works properly
- [ ] Response times acceptable (<200ms)
- [ ] Security tests pass
- [ ] Docker deployment works
- [ ] Logs are being created
- [ ] Health checks functional

#### Frontend
- [ ] All components render without errors
- [ ] User interactions work correctly
- [ ] Responsive design works on all devices
- [ ] No console errors
- [ ] API integration working
- [ ] Loading states implemented
- [ ] Error states handled

#### Integration
- [ ] BFF routing works
- [ ] Frontend to Backend communication successful
- [ ] Multi-tenancy isolation works
- [ ] Authentication/Authorization working (if enabled)

#### Performance
- [ ] Load testing passes (100+ concurrent users)
- [ ] Memory usage acceptable
- [ ] No memory leaks
- [ ] Response times under targets

#### Security
- [ ] SQL injection tests pass
- [ ] XSS prevention works
- [ ] Rate limiting functional
- [ ] No secrets exposed
- [ ] Tenant isolation enforced

#### Operational
- [ ] Documentation complete
- [ ] Deployment guide tested
- [ ] Logs are readable
- [ ] Error recovery works
- [ ] Monitoring configured

---

## Testing Tools Required

```bash
# Install testing tools
npm install -g artillery        # Load testing
npm install -g newman          # API testing
npm install -g lighthouse      # Performance testing

# Apache Bench for load testing
apt-get install apache2-utils  # Linux
brew install ab                # Mac
```

---

## Automated Test Script

```bash
#!/bin/bash
# test-stage1.sh - Automated pre-production tests

echo "🧪 Starting Stage 1 Pre-Production Tests..."

# Backend Tests
echo "📡 Testing Backend API..."
curl -sf http://localhost:3008/healthz || { echo "❌ Health check failed"; exit 1; }
curl -sf http://localhost:3008/api/regulatory/regulators || { echo "❌ Regulators API failed"; exit 1; }
echo "✅ Backend tests passed"

# BFF Tests
echo "🔄 Testing BFF Proxy..."
curl -sf http://localhost:3000/api/regulatory/regulators || { echo "❌ BFF proxy failed"; exit 1; }
echo "✅ BFF tests passed"

# Performance Tests
echo "⚡ Testing Performance..."
RESPONSE_TIME=$(curl -o /dev/null -s -w '%{time_total}\n' http://localhost:3008/api/regulatory/changes)
if (( $(echo "$RESPONSE_TIME < 0.2" | bc -l) )); then
    echo "✅ Performance test passed ($RESPONSE_TIME seconds)"
else
    echo "⚠️  Performance warning: $RESPONSE_TIME seconds (target: < 0.2s)"
fi

echo "🎉 All automated tests passed!"
```

---

## Report Template

After testing, fill out:

```
STAGE 1 PRE-PRODUCTION TEST REPORT

Date: _______________
Tester: _______________

BACKEND TESTS: ____ / 40 passed
FRONTEND TESTS: ____ / 20 passed
INTEGRATION TESTS: ____ / 15 passed
PERFORMANCE TESTS: ____ / 5 passed
SECURITY TESTS: ____ / 10 passed

TOTAL: ____ / 90 passed

CRITICAL FAILURES (must fix):
1. _______________
2. _______________

WARNINGS (should fix):
1. _______________
2. _______________

PRODUCTION READY: YES / NO

Approved by: _______________
Date: _______________
```

---

**Status:** Ready for systematic pre-production testing  
**Estimated Testing Time:** 4-6 hours  
**Pass Threshold:** 90% of tests must pass

