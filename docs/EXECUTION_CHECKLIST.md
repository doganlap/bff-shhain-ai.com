# ✅ IMPLEMENTATION EXECUTION CHECKLIST

**Run these commands step-by-step**

---

## ✅ PHASE 1: SECURITY (Completed Partially)

### Step 1.1: Verify Environment ✅
```powershell
# Already completed - .env updated with:
# - JWT_REFRESH_SECRET: Generated and added ✅
# - DATABASE_URL: postgresql://postgres:postgres@localhost:5432/grc_db ✅
```

### Step 1.2: Run RLS Migration ⏳
```powershell
# IMPORTANT: You need to create the grc_db database first

# Option A: Using pgAdmin
# 1. Open pgAdmin
# 2. Right-click Databases → Create → Database
# 3. Name: grc_db
# 4. Click Save

# Option B: Using psql command line
psql -U postgres -c "CREATE DATABASE grc_db;"

# Then run the migration:
psql -U postgres -d grc_db -f "D:\Projects\GRC-Master\Assessmant-GRC\migrations\001_enable_rls.sql"

# Verify RLS is enabled:
psql -U postgres -d grc_db -c "SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public';"
# Should return a number > 0
```

### Step 1.3: Install PostgreSQL Client ✅
```powershell
cd D:\Projects\GRC-Master\Assessmant-GRC\apps\bff
npm list pg
# Should show: pg@8.x.x or similar
```

---

## ⏳ PHASE 2: UI SYSTEM

### Step 2.1: Install UI Dependencies
```powershell
cd D:\Projects\GRC-Master\Assessmant-GRC\apps\web

# Install lucide-react
npm install lucide-react

# Install Tailwind plugins
npm install -D @tailwindcss/forms @tailwindcss/typography

# Verify installations
npm list lucide-react @tailwindcss/forms
```

### Step 2.2: Add Font to HTML
Open `D:\Projects\GRC-Master\Assessmant-GRC\apps\web\public\index.html`

Add this inside `<head>`:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap" rel="stylesheet">
```

---

## ⏳ PHASE 3: SERVICES

### Step 3.1: Start Backend Services

**Check if Docker is needed:**
```powershell
# Check what's in docker-compose
cd D:\Projects\GRC-Master\Assessmant-GRC\infra\docker
cat docker-compose.yml
```

**If Docker is required:**
```powershell
# Start Docker Desktop first, then:
docker-compose up -d

# Wait for services to start
Start-Sleep -Seconds 30

# Check status
docker-compose ps
```

**If using local services:**
```powershell
# PostgreSQL is already running ✅
Get-Service postgresql-x64-17
# Status should be: Running

# Start BFF (Backend for Frontend)
cd D:\Projects\GRC-Master\Assessmant-GRC\apps\bff
npm start
# Or: node index.js
```

### Step 3.2: Start Frontend
```powershell
# Open NEW terminal window
cd D:\Projects\GRC-Master\Assessmant-GRC\apps\web
npm run dev

# Should output: Local: http://localhost:5173
```

---

## ⏳ PHASE 4: TESTING

### Step 4.1: Run Security Tests
```powershell
cd D:\Projects\GRC-Master\Assessmant-GRC

# Run security test suite
node tests/security-tests.js

# Expected output:
# ✅ PASS: RLS Policies Exist
# ✅ PASS: RLS Enabled on Tables
# ✅ PASS: RLS Context Functions Work
# ✅ ALL TESTS PASSED!
```

### Step 4.2: Run Smoke Tests
```powershell
# Make sure BFF is running first
cd D:\Projects\GRC-Master\Assessmant-GRC

# Run smoke tests
.\tests\smoke-tests.ps1

# Expected output:
# ✅ PASS: Basic Health Check
# ✅ PASS: Detailed Health Check
# Success Rate: 100%
```

### Step 4.3: Manual Verification
```powershell
# Test health endpoints
curl http://localhost:3005/health
# Expected: {"status":"healthy"}

# Test authentication required
curl http://localhost:3005/api/assessments
# Expected: {"error":"Access token required"}

# Open frontend
Start-Process "http://localhost:5173"
# Should show application with primary green color (#0E7C66)
```

---

## 📊 CURRENT STATUS

| Phase | Step | Status |
|-------|------|--------|
| **Phase 1: Security** | | |
| └─ Generate secrets | ✅ Complete |
| └─ Update .env | ✅ Complete |
| └─ Install pg | ✅ Complete |
| └─ Run RLS migration | ⏳ **TODO** |
| | | |
| **Phase 2: UI** | | |
| └─ Tailwind config | ✅ Complete |
| └─ Components created | ✅ Complete |
| └─ Install dependencies | ⏳ **TODO** |
| └─ Add fonts | ⏳ **TODO** |
| | | |
| **Phase 3: Services** | | |
| └─ PostgreSQL | ✅ Running |
| └─ Start BFF | ⏳ **TODO** |
| └─ Start frontend | ⏳ **TODO** |
| | | |
| **Phase 4: Testing** | | |
| └─ Security tests | ⏳ **TODO** |
| └─ Smoke tests | ⏳ **TODO** |
| └─ Manual verification | ⏳ **TODO** |

---

## 🚨 IMPORTANT NOTES

### Database Setup
Before running RLS migration, you MUST create the `grc_db` database:
```sql
CREATE DATABASE grc_db;
```

### PostgreSQL Password
If psql asks for password, the default is often empty or "postgres". You can:
1. Use pgAdmin instead (GUI)
2. Set password in environment: `$env:PGPASSWORD = "your-password"`
3. Create .pgpass file in %APPDATA%\postgresql\

### Port Conflicts
- **3005**: BFF backend
- **5173**: Frontend (Vite)
- **5432**: PostgreSQL

Make sure these ports are free.

---

## ✅ NEXT ACTIONS (In Order)

1. **Create grc_db database** (5 min)
   - Use pgAdmin OR psql command above
   
2. **Run RLS migration** (10 min)
   - Execute the psql command above
   - Verify with SELECT COUNT(*) query
   
3. **Install UI dependencies** (5 min)
   - Run npm install commands for lucide-react
   
4. **Start services** (10 min)
   - Start BFF backend
   - Start frontend dev server
   
5. **Run tests** (15 min)
   - Security tests
   - Smoke tests
   - Manual verification

**Total time remaining:** ~45 minutes

---

## 📞 TROUBLESHOOTING

### Issue: "database grc_db does not exist"
**Solution:** Create it first (see Database Setup above)

### Issue: psql command not found
**Solution:**
```powershell
$env:Path += ';C:\Program Files\PostgreSQL\17\bin'
# Or restart terminal after PostgreSQL installation
```

### Issue: Port already in use
**Solution:**
```powershell
# Find what's using port 3005
netstat -ano | findstr :3005
# Kill the process
taskkill /PID <PID> /F
```

---

**Ready to continue? Start with creating grc_db database!** 🚀
