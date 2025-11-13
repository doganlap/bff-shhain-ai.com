# 🚀 DEPLOY NOW - STEP BY STEP GUIDE
**Based on Experience - Avoiding Hiccups**

---

## ⚡ DEPLOYMENT ORDER (CRITICAL)

### **RULE #1: Backend FIRST, Frontend LAST**
**Why:** Frontend calls APIs, so APIs must be ready first

### **RULE #2: grc-api BEFORE bff**
**Why:** BFF routes to grc-api, so grc-api must be running first

### **RULE #3: Test IMMEDIATELY After Each Step**
**Why:** Catch problems early when they're easy to fix

---

## 📋 STEP-BY-STEP DEPLOYMENT

### **STEP 0: BACKUP (2 minutes)**

```bash
# In your project root
cd d:\Projects\GRC-Master\Assessmant-GRC

# Create backup tag
git tag production-backup-$(date +%Y-%m-%d-%H%M)

# Save current commit hash
git rev-parse HEAD > ROLLBACK_COMMIT.txt

# Backup current .env files
cp apps/bff/.env apps/bff/.env.backup
cp apps/services/grc-api/.env apps/services/grc-api/.env.backup
```

**✅ CHECKPOINT:** Backup tag created, commit hash saved

---

### **STEP 1: PULL LATEST CODE (1 minute)**

```bash
# Make sure you're on the right branch
git branch
# Should show: * main (or your deployment branch)

# Pull latest code
git pull origin main

# Verify you got the latest
git log --oneline -1
# Should show today's cleanup commit
```

**✅ CHECKPOINT:** Latest code pulled

---

### **STEP 2: INSTALL DEPENDENCIES (3 minutes)**

```bash
# Root dependencies
npm install

# Frontend dependencies
cd apps/web
npm install

# Backend dependencies
cd ../services/grc-api
npm install

cd ../bff
npm install
```

**✅ CHECKPOINT:** Dependencies installed

---

### **STEP 3: BUILD FRONTEND (2 minutes)**

```bash
cd d:\Projects\GRC-Master\Assessmant-GRC\apps\web

# Build production bundle
npm run build

# Check build succeeded
ls dist/
# Should see: index.html, assets folder

# Check for errors
# Output should end with: "✓ built in X.XXs"
```

**🚨 IF BUILD FAILS:**
```bash
# Check error message
# Most common: import path errors

# Quick fix: Check the error line number
# Compare with App.jsx.backup if needed

# Or rollback:
git checkout ROLLBACK_COMMIT.txt -- apps/web/src/
npm run build
```

**✅ CHECKPOINT:** Frontend built successfully

---

### **STEP 4: START BACKEND SERVICES (5 minutes)**

**4a. Start Database (if not running)**
```bash
# Check if PostgreSQL is running
# Windows:
net start postgresql-x64-14  # or your version

# Docker:
docker start postgres  # or your container name
```

**4b. Start auth-service (Port 3001)**
```bash
cd d:\Projects\GRC-Master\Assessmant-GRC\apps\services\auth-service

# Start service
npm start
# OR
pm2 start index.js --name auth-service
# OR
# In separate terminal window

# Test it's running:
curl http://localhost:3001/healthz
# Should return: 200 OK
```

**✅ CHECKPOINT:** auth-service running on port 3001

**4c. Start grc-api (Port 3006) - CRITICAL**
```bash
cd d:\Projects\GRC-Master\Assessmant-GRC\apps\services\grc-api

# Start service
npm start
# OR
pm2 start server.js --name grc-api
# OR
# In separate terminal window

# Test it's running:
curl http://localhost:3006/healthz
# Should return: 200 OK

# Test document routes (NEW):
curl http://localhost:3006/api/documents
# Should return: 200 (may return empty array if no data)
```

**✅ CHECKPOINT:** grc-api running on port 3006 with document routes

**4d. Start bff (Port 3005) - AFTER grc-api**
```bash
cd d:\Projects\GRC-Master\Assessmant-GRC\apps\bff

# CRITICAL: grc-api must be running first!
# Wait 10 seconds after starting grc-api

# Start service
npm start
# OR
pm2 start index.js --name bff
# OR
# In separate terminal window

# Test it's running:
curl http://localhost:3005/healthz
# Should return: 200 OK

# Test document routing (NEW):
curl http://localhost:3005/api/documents
# Should return: 200 (routes to grc-api)
```

**✅ CHECKPOINT:** bff running on port 3005, routing to grc-api

**4e. Start Other Services (Optional but recommended)**
```bash
# RAG service (if needed)
cd ../rag-service
npm start &

# Regulatory intelligence (if needed)
cd ../regulatory-intelligence-service-ksa
npm start &

# AI scheduler (if needed)
cd ../ai-scheduler-service
npm start &
```

**✅ CHECKPOINT:** All backend services running

---

### **STEP 5: DEPLOY FRONTEND (3 minutes)**

**Option A: Static File Server**
```bash
cd d:\Projects\GRC-Master\Assessmant-GRC\apps\web

# Copy dist folder to your web server
# Example (adjust for your setup):
cp -r dist/* /var/www/html/
# OR
xcopy /E /I dist C:\inetpub\wwwroot\
```

**Option B: Serve with Node**
```bash
# Install serve if not already
npm install -g serve

# Serve the built files
serve -s dist -l 3000

# Or with PM2
pm2 serve dist 3000 --name frontend --spa
```

**✅ CHECKPOINT:** Frontend deployed and accessible

---

### **STEP 6: IMMEDIATE VERIFICATION (10 minutes)**

**6a. Test Frontend Loads**
```
Open browser: http://your-domain.com
OR: http://localhost:3000

✅ Page loads without errors
✅ No 404 in browser console
✅ Login page appears
```

**6b. Test Authentication**
```
1. Enter credentials
2. Click Login
✅ Redirects to /app or /app/dashboard
✅ No console errors
✅ User logged in
```

**6c. Test Assessment Flow (CRITICAL FOR CONTRACT)**
```
1. Navigate to /app/assessments
   ✅ Page loads
   ✅ Assessments list appears (or empty state)

2. Click "Create Assessment" (or + button)
   ✅ Modal/form opens
   ✅ Framework dropdown works
   ✅ Organization dropdown works

3. Fill form and submit
   ✅ Assessment created
   ✅ Appears in list
   ✅ No console errors

4. Open the assessment
   ✅ Details page loads
   ✅ Can see questions
   ✅ Can answer questions
```

**6d. Test Document Upload (CHANGED TODAY)**
```
1. In an assessment, find evidence/document upload
2. Select a file
3. Click upload
✅ File uploads successfully
✅ No 500 errors
✅ File appears in list
✅ Can download file back

🚨 IF THIS FAILS: See "Emergency Fix" below
```

**6e. Test Export**
```
1. In an assessment, find Export button
2. Click Export to PDF
✅ PDF downloads
✅ Contains data

3. Click Export to Excel
✅ Excel downloads
✅ Contains data
```

**✅ CHECKPOINT:** All critical features working

---

### **STEP 7: MONITOR (30 minutes)**

**7a. Watch Backend Logs**
```bash
# Watch grc-api logs
tail -f logs/grc-api.log
# OR
pm2 logs grc-api

# Watch bff logs
tail -f logs/bff.log
# OR
pm2 logs bff

# Look for errors containing:
- "Error"
- "500"
- "undefined"
- "null"
```

**7b. Watch Browser Console**
```
Open Developer Tools (F12)
Go to Console tab
Look for:
✅ No red errors
✅ No 404 errors
✅ No CORS errors
```

**7c. Test User Flow**
```
Do a complete assessment from start to finish:
1. Login
2. Create assessment
3. Answer questions
4. Upload evidence
5. Complete assessment
6. View compliance score
7. Export report

✅ All steps work smoothly
```

**✅ CHECKPOINT:** System stable, no errors

---

## 🚨 EMERGENCY FIXES

### **Issue 1: Document Upload Fails**

**Symptom:** 500 error when uploading documents

**Quick Fix (5 minutes):**
```bash
# Edit apps/bff/index.js
cd d:\Projects\GRC-Master\Assessmant-GRC\apps\bff

# Line 41: Uncomment document-service
# FROM:
# // 'document-service': process.env.DOCUMENT_SERVICE_URL || 'http://document-service:3002',
# TO:
'document-service': process.env.DOCUMENT_SERVICE_URL || 'http://document-service:3002',

# Lines 447-448 and 455-456: Change target back
# FROM:
target: services['grc-api'],
pathRewrite: { '^/api/evidence': '/api/documents' },
# TO:
target: services['document-service'],
// pathRewrite removed

# Line 524: Add back health check
axios.get(`${services['document-service']}/healthz`, { timeout: 2000 }).catch(() => null),

# Restart bff
pm2 restart bff
# OR kill and restart npm process

# Test document upload again
✅ Should work now
```

---

### **Issue 2: Frontend 404 Errors**

**Symptom:** Routes show 404, pages don't load

**Quick Fix:**
```bash
# If using static server, check server config
# Needs to route all requests to index.html

# For nginx:
location / {
  try_files $uri $uri/ /index.html;
}

# For Apache (.htaccess):
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^ index.html [QSA,L]

# Restart web server
```

---

### **Issue 3: API Connection Refused**

**Symptom:** Frontend can't connect to backend

**Quick Fix:**
```bash
# Check services are running
pm2 status
# OR
netstat -ano | findstr :3006  # grc-api
netstat -ano | findstr :3005  # bff
netstat -ano | findstr :3001  # auth-service

# Check .env files have correct URLs
cat apps/web/.env
# Should have:
VITE_API_BASE_URL=http://localhost:3005
# OR your production URL

# Restart frontend with correct env
cd apps/web
npm run build
```

---

### **Issue 4: Database Connection Errors**

**Symptom:** "Cannot connect to database"

**Quick Fix:**
```bash
# Check PostgreSQL is running
# Windows:
sc query postgresql-x64-14

# Check connection from grc-api
cd apps/services/grc-api
node -e "const db = require('./config/database'); db.query('SELECT NOW()');"

# Should print current timestamp
# If error, check .env database settings:
DB_HOST=localhost
DB_PORT=5432
DB_NAME=grc_ecosystem
DB_USER=postgres
DB_PASSWORD=your_password
```

---

## 🔄 FULL ROLLBACK (15 minutes)

**If multiple things are broken:**

```bash
cd d:\Projects\GRC-Master\Assessmant-GRC

# Stop all services
pm2 stop all
# OR manually kill all npm processes

# Rollback code
git reset --hard $(cat ROLLBACK_COMMIT.txt)

# Reinstall dependencies
npm install
cd apps/web && npm install
cd ../services/grc-api && npm install
cd ../bff && npm install

# Rebuild frontend
cd apps/web
npm run build

# Restart services in order:
# 1. Database
# 2. auth-service
# 3. grc-api
# 4. bff
# 5. Other services
# 6. Frontend

# Restore .env files if needed
cp apps/bff/.env.backup apps/bff/.env
cp apps/services/grc-api/.env.backup apps/services/grc-api/.env
```

---

## ✅ SUCCESS CHECKLIST

**Deployment is successful when:**

- [ ] All services started without errors
- [ ] Frontend loads in browser
- [ ] Can log in
- [ ] Can see assessments list
- [ ] Can create new assessment
- [ ] Can answer questions
- [ ] Can upload documents ⚠️ (watch this)
- [ ] Can export reports
- [ ] No errors in console
- [ ] No errors in logs
- [ ] Response times < 2 seconds

**If all checked:** ✅ **DEPLOYMENT SUCCESSFUL**

---

## 📞 HELP DURING DEPLOYMENT

**If stuck, check in this order:**

1. **Browser Console** (F12) - Shows frontend errors
2. **grc-api logs** - Shows API errors
3. **bff logs** - Shows routing errors
4. **Database logs** - Shows DB errors
5. **This document** - Emergency fixes

**Most common issues:**
- Document upload (5 min fix - see above)
- Services started in wrong order (restart in correct order)
- .env file wrong (check URLs)

---

## 🎯 ESTIMATED TIMELINE

| Step | Time | Total |
|------|------|-------|
| Backup | 2 min | 2 min |
| Pull code | 1 min | 3 min |
| Install deps | 3 min | 6 min |
| Build frontend | 2 min | 8 min |
| Start backend | 5 min | 13 min |
| Deploy frontend | 3 min | 16 min |
| Verify | 10 min | 26 min |
| Monitor | 30 min | 56 min |

**Total:** ~1 hour from start to stable

---

**Good luck! Follow these steps and you'll avoid hiccups.** 🚀

**I'm here if you need help during deployment!**
