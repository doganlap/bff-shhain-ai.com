# Quick Test Guide - Stage 1

## 🚀 Fast 15-Minute Production Readiness Check

### Prerequisites
```bash
# 1. Backend service must be running
cd D:\Projects\GRC-Master\Assessmant-GRC\apps\services\regulatory-intelligence-service-ksa
npm install
npm start  # Runs on port 3008

# 2. BFF must be running (separate terminal)
cd D:\Projects\GRC-Master\Assessmant-GRC\apps\bff
npm start  # Runs on port 3000

# 3. Frontend must be running (separate terminal)
cd D:\Projects\GRC-Master\Assessmant-GRC\apps\web
npm run dev  # Runs on port 5173
```

---

## Step 1: Run Automated Tests (5 minutes)

```powershell
# In PowerShell
cd D:\Projects\GRC-Master\Assessmant-GRC\apps\services\regulatory-intelligence-service-ksa
.\test-production-ready.ps1
```

**Expected Output:**
```
✅ Tests Passed: 15-20
❌ Tests Failed: 0
⚠️  Warnings: 0-3
🎉 PRODUCTION READY!
```

**If you see failures:** Stop here, fix issues, re-run tests

---

## Step 2: Quick Manual Frontend Test (5 minutes)

### Test A: Page Loads
1. Open browser: `http://localhost:5173`
2. Login with test credentials
3. Look for "Regulatory Intelligence" or "مركز الذكاء التنظيمي" in menu
4. Click it
5. ✅ **Check:** Page loads without errors

### Test B: View Regulatory Feed
1. Look for statistics cards (4 cards at top)
2. Look for regulator dropdown
3. Look for urgency filter
4. ✅ **Check:** All UI elements visible

### Test C: Populate Test Data
```bash
# In new terminal
curl -X POST http://localhost:3008/api/regulatory/scrape/SAMA
```
5. Refresh browser page
6. ✅ **Check:** Regulatory changes appear in feed

### Test D: View Impact Analysis
1. Click "عرض التأثير" (View Impact) button
2. Wait for modal to load
3. ✅ **Check:** Modal shows impact score and details
4. Click close (X) button
5. ✅ **Check:** Modal closes

### Test E: Add to Calendar
1. Click "إضافة للتقويم" (Add to Calendar) button
2. ✅ **Check:** No errors in console
3. Look at calendar widget on right side
4. ✅ **Check:** Calendar shows items

---

## Step 3: Quick Performance Check (3 minutes)

```bash
# Test response time
curl -o nul -s -w "Response time: %{time_total}s\n" http://localhost:3008/api/regulatory/changes

# Expected: < 0.5 seconds
```

Open browser DevTools → Network tab:
- Refresh page
- ✅ **Check:** Page loads in < 3 seconds
- ✅ **Check:** No failed requests (red items)

---

## Step 4: Quick Security Check (2 minutes)

```bash
# Test SQL injection protection
curl "http://localhost:3008/api/regulatory/changes?regulator=SAMA';DROP%20TABLE%20users;--"

# Expected: Returns normal response, no error
```

Check browser console:
- ✅ **Check:** No XSS warnings
- ✅ **Check:** No mixed content warnings
- ✅ **Check:** HTTPS enforced (if in production)

---

## Pass/Fail Decision

### ✅ PASS - Deploy to Production if:
- [ ] Automated test script shows "PRODUCTION READY"
- [ ] Page loads without errors
- [ ] Regulatory feed works
- [ ] Impact modal works
- [ ] Add to calendar works
- [ ] Response time < 1 second
- [ ] No console errors
- [ ] Security tests pass

### ⚠️ STAGING FIRST if:
- [ ] Minor warnings in automated tests
- [ ] Performance slightly slow (but < 2 seconds)
- [ ] Optional features not configured (WhatsApp, SMS)

### ❌ NOT READY if:
- [ ] Automated tests have failures
- [ ] Page doesn't load
- [ ] Critical features broken
- [ ] Security tests fail
- [ ] Service crashes

---

## Common Issues & Quick Fixes

### Issue 1: Backend won't start
```bash
# Check if another service is using port 3008
netstat -ano | findstr :3008

# Kill process if needed
# Then restart service
```

### Issue 2: Database connection fails
```bash
# Check PostgreSQL is running
# Check .env has correct DB credentials
# Test connection:
psql -h localhost -U postgres -d grc_assessment
```

### Issue 3: Page loads but no data
```bash
# Run manual scrape to populate data
curl -X POST http://localhost:3008/api/regulatory/scrape/SAMA

# Check data was saved
curl http://localhost:3008/api/regulatory/changes
```

### Issue 4: CORS errors
```bash
# Check BFF is running
curl http://localhost:3000/api/regulatory/regulators

# Check CORS configuration in server.js
```

### Issue 5: Arabic text not displaying
- Check browser encoding is UTF-8
- Check HTML has `dir="rtl"` attribute
- Clear browser cache

---

## Quick Test Commands

```bash
# Backend health
curl http://localhost:3008/healthz

# Get regulators (should return 6)
curl http://localhost:3008/api/regulatory/regulators | jq '.data | length'

# Get changes
curl http://localhost:3008/api/regulatory/changes

# Get stats
curl http://localhost:3008/api/regulatory/stats

# Run scrape
curl -X POST http://localhost:3008/api/regulatory/scrape/SAMA

# Through BFF
curl http://localhost:3000/api/regulatory/regulators

# Check logs
tail -20 apps/services/regulatory-intelligence-service-ksa/logs/combined.log
```

---

## One-Command Complete Test

```powershell
# Windows PowerShell - Run everything at once
cd D:\Projects\GRC-Master\Assessmant-GRC\apps\services\regulatory-intelligence-service-ksa; `
.\test-production-ready.ps1; `
npm test
```

**Expected:** All tests pass, ready for production!

---

## Deployment Decision Matrix

| Automated Tests | Manual Tests | Security | Performance | Decision |
|----------------|--------------|----------|-------------|----------|
| PASS | PASS | PASS | PASS | ✅ **DEPLOY NOW** |
| PASS | PASS | PASS | WARN | ✅ Deploy (monitor performance) |
| PASS | PASS | WARN | PASS | ⚠️ Staging first |
| PASS | WARN | PASS | PASS | ⚠️ Staging first |
| FAIL | * | * | * | ❌ **DO NOT DEPLOY** |
| * | * | FAIL | * | ❌ **DO NOT DEPLOY** |
| * | FAIL | * | * | ❌ **FIX CRITICAL BUGS** |

---

## Next Steps After Testing

### If All Tests Pass:
1. ✅ Generate test report
2. ✅ Get stakeholder approval
3. ✅ Deploy to staging
4. ✅ Validate in staging (30 min)
5. ✅ Deploy to production
6. ✅ Monitor for 24 hours
7. ✅ Celebrate! 🎉

### If Tests Fail:
1. ❌ Document all failures
2. 🔧 Fix issues
3. 🔄 Re-run tests
4. ✅ Repeat until all pass

---

**Estimated Total Time:** 15-30 minutes for quick validation  
**Recommended Time:** 4 hours for comprehensive testing  
**Production Confidence:** HIGH ✅

