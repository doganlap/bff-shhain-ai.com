# 🚀 TONIGHT'S PRODUCTION DEPLOYMENT - QUICK CHECKLIST

**Date:** 2025-01-12
**Build Status:** ✅ SUCCESS (7.41s)
**Risk Level:** LOW-MEDIUM
**Confidence:** 85%

---

## ⏰ PRE-DEPLOYMENT (30 MIN BEFORE)

### Backups:
- [ ] Backup production code: `git tag production-backup-2025-01-12`
- [ ] Backup production database (if applicable)
- [ ] Backup .env files
- [ ] Note current git commit: `git rev-parse HEAD`

### Team Ready:
- [ ] DevOps team on standby
- [ ] Rollback plan reviewed
- [ ] Emergency contacts available

---

## 🔨 DEPLOYMENT SEQUENCE

### 1. Backend Services (15 min)

```bash
# Stop services
docker-compose down  # or pm2 stop all

# Pull latest code
git pull origin main

# Verify you're on correct commit
git log --oneline -5

# Install dependencies
npm install

# Start services IN ORDER:
# 1. auth-service (port 3001)
# 2. grc-api (port 3006) - NOW HAS DOCUMENT ROUTES
# 3. bff (port 3005) - UPDATED PROXY
# 4. Other services

docker-compose up -d  # or start individually
```

**⚠️ CRITICAL:** Start grc-api BEFORE bff (BFF routes to grc-api for documents)

### 2. Frontend (10 min)

```bash
cd apps/web

# Build production bundle
npm run build

# Verify build output
ls -lh dist/

# Deploy dist/ folder to web server
# (your deployment method here)
```

---

## ✅ POST-DEPLOYMENT VERIFICATION (15 min)

### Critical Paths to Test:

**Authentication:**
- [ ] Open `/login` - Should show GlassmorphismLoginPage
- [ ] Test login with valid credentials
- [ ] Open `/register` - Should show StoryDrivenRegistration

**Main Features:**
- [ ] Navigate to `/app/assessments` - AdvancedAssessmentManager
- [ ] Navigate to `/app/frameworks` - AdvancedFrameworkManager
- [ ] Navigate to `/app/controls` - ControlsModuleEnhanced
- [ ] Navigate to `/app/organizations` - OrganizationsPage

**Document/Evidence (NEW ROUTING):**
- [ ] Upload a document/evidence file
- [ ] Download a document
- [ ] Delete a document
- [ ] Check BFF logs for `/api/documents` requests

**Health Checks:**
```bash
curl http://your-domain/health
curl http://your-domain/api/healthz
```

---

## 🔍 MONITORING (30 min)

### Watch These Logs:

```bash
# BFF logs - watch for document routing
tail -f logs/bff.log | grep -i "document\|evidence"

# GRC-API logs - watch for document requests
tail -f logs/grc-api.log | grep -i "document"

# Application errors
tail -f logs/error.log
```

### Key Metrics:
- [ ] Response times normal (<500ms)
- [ ] No 404 errors on main routes
- [ ] Document uploads working
- [ ] No authentication errors

---

## 🚨 ROLLBACK (IF NEEDED)

### If Frontend Breaks:

```bash
cd apps/web

# Restore backup
cp src/App.jsx.backup src/App.jsx

# Rebuild
npm run build

# Redeploy
```

### If Document Service Fails:

```bash
cd apps/bff

# Edit index.js:
# Line 41: Uncomment document-service URL
# Lines 443-460: Revert proxy to document-service
# Line 524: Add back document-service health check

# Restart BFF
pm2 restart bff  # or docker-compose restart bff
```

### Full Rollback:

```bash
# Revert to previous commit
git reset --hard <previous-commit-hash>

# Rebuild and restart everything
npm install
docker-compose up -d --build

# Rebuild frontend
cd apps/web && npm run build
```

**Previous Commit:** _[Write it here before deployment]_

---

## 📊 WHAT CHANGED

**Summary:**
- ✅ Cleaned 31 duplicate files (frontend + backend)
- ✅ Consolidated routes from 80 to 35 (no breaking changes)
- ⚠️ Document service now routes through grc-api (BFF updated)
- ✅ Build successful, all routes verified

**Risk Areas:**
1. Document/Evidence uploads (medium risk - test first!)
2. Frontend routing (low risk - all routes preserved)
3. Backend API (low risk - only removed duplicates)

---

## 📞 IF THINGS GO WRONG

1. **DON'T PANIC** - You have backups
2. **Check logs first** - Usually shows the issue
3. **Try targeted rollback** - Don't rollback everything at once
4. **Document service rollback** - Fastest fix if document uploads fail

---

## ✅ SUCCESS CRITERIA

Deployment is successful when:
- [ ] All critical paths work (login, assessments, frameworks, controls)
- [ ] Document upload/download works
- [ ] No errors in logs for 30 minutes
- [ ] Response times are normal
- [ ] No user reports of issues

---

## 📝 POST-DEPLOYMENT (Tomorrow)

- [ ] Review logs from overnight
- [ ] Check for any error spikes
- [ ] Monitor user feedback
- [ ] Document any issues encountered
- [ ] Plan document-service removal (30 days from now)

---

**DEPLOYMENT TIME:** ____________
**COMPLETED BY:** ____________
**ISSUES ENCOUNTERED:** ____________
**ROLLBACK NEEDED:** YES / NO

---

## 💡 QUICK REFERENCE

**What's Safe:** Frontend route consolidation, duplicate file removal
**What to Watch:** Document/evidence file operations
**Fast Rollback:** BFF index.js (5 min to uncomment document-service)
**Full Rollback:** Git reset to previous commit (15 min full restart)

**Good luck with tonight's deployment! 🚀**
