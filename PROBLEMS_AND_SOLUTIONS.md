# 🔍 GRC Testing - Problem Identification & Solutions

## Current Situation

Based on the test files and configuration, here are the **problems preventing tests from running** and **how to fix them**:

---

## ❌ **PROBLEMS IDENTIFIED**

### Problem 1: Database Connection Not Configured ⚠️ **CRITICAL**

**Symptom:**
- Tests fail immediately with "DATABASE_URL is not set"
- Or connection refused/authentication errors

**Root Cause:**
The tests require access to PostgreSQL database(s) but environment variables are not set.

**What the tests need:**
```javascript
// From database.js configuration:
1. Compliance DB: shahin_ksa_compliance
2. Finance DB: grc_master  
3. Auth DB: shahin_access_control

// Connection details:
- Host: localhost
- Port: 5432
- User: postgres
- Password: (must be set)
```

**How to Fix:**

**Option A: Set Environment Variables (Windows PowerShell)**
```powershell
# Set these before running tests
$env:DB_HOST="localhost"
$env:DB_PORT="5432"
$env:DB_USER="postgres"
$env:DB_PASSWORD="your_actual_password"  # ← CRITICAL
$env:COMPLIANCE_DB="shahin_ksa_compliance"
$env:FINANCE_DB="grc_master"
$env:AUTH_DB="shahin_access_control"

# Then run tests
npm run test:features
```

**Option B: Create .env File**
```bash
# Create .env file in project root:
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
COMPLIANCE_DB=shahin_ksa_compliance
FINANCE_DB=grc_master
AUTH_DB=shahin_access_control
```

---

### Problem 2: PostgreSQL May Not Be Running 🔴 **BLOCKER**

**Symptom:**
- Error: ECONNREFUSED
- Cannot connect to localhost:5432

**How to Check:**
```powershell
# Windows - Check if PostgreSQL service is running
Get-Service -Name postgresql*

# Should show Status: Running
```

**How to Fix:**
```powershell
# Windows - Start PostgreSQL
# Method 1: Services app
services.msc  # Find PostgreSQL, click Start

# Method 2: PowerShell (if installed as service)
Start-Service postgresql-x64-14  # Adjust version number

# Method 3: pg_ctl (if installed standalone)
pg_ctl -D "C:\Program Files\PostgreSQL\14\data" start
```

---

### Problem 3: Databases Don't Exist 🟡 **LIKELY**

**Symptom:**
- Error: database "shahin_ksa_compliance" does not exist (code: 3D000)

**What's Expected:**
The tests expect these databases to exist:
1. `shahin_ksa_compliance` - Main compliance data
2. `grc_master` - Finance/admin data
3. `shahin_access_control` - Auth/permissions

**How to Check:**
```powershell
# List all databases
psql -U postgres -l

# Or check if specific database exists
psql -U postgres -d shahin_ksa_compliance -c "SELECT 1"
```

**How to Fix:**

**Option 1: Create All Three Databases**
```sql
-- Connect to postgres database first
psql -U postgres

-- Create databases
CREATE DATABASE shahin_ksa_compliance;
CREATE DATABASE grc_master;
CREATE DATABASE shahin_access_control;

-- Exit
\q
```

**Option 2: Use Existing Database**
If you already have a GRC database with a different name, update the environment:
```powershell
# If your database is called "grc_db" instead:
$env:COMPLIANCE_DB="grc_db"
$env:FINANCE_DB="grc_db"
$env:AUTH_DB="grc_db"
```

---

### Problem 4: Database Tables Missing 🟠 **PROBABLE**

**Symptom:**
- Error: relation "tenants" does not exist
- Error: relation "assessments" does not exist

**What's Expected:**
Tests need these tables:
- `tenants`, `organizations`, `users`
- `assessments`, `assessment_workflow`
- `workflows`, `workflow_steps`, `workflow_triggers`
- `grc_frameworks`, `grc_controls`, `sector_controls`
- `notifications`, `workflow_history`

**How to Check:**
```sql
-- Connect to database
psql -U postgres -d shahin_ksa_compliance

-- List tables
\dt

-- Should see tables listed above
```

**How to Fix:**

**Option 1: Run Migrations/Schema**
```bash
# If you have a schema file
psql -U postgres -d shahin_ksa_compliance -f database/schema.sql

# Or migrations
npm run migrate
```

**Option 2: Check Other Database**
```bash
# Maybe tables are in grc_master instead?
psql -U postgres -d grc_master -c "\dt"
```

---

### Problem 5: Wrong Password 🟢 **COMMON**

**Symptom:**
- Error: password authentication failed (code: 28P01)

**Root Cause:**
- Default password "postgres" doesn't match your actual password
- Or password not set in environment

**How to Fix:**
```powershell
# Set the CORRECT password
$env:DB_PASSWORD="your_actual_password"

# Test it
psql -U postgres -h localhost -d postgres
# Enter password when prompted - if this works, use that password
```

---

### Problem 6: npm Dependencies Missing 🔵 **POSSIBLE**

**Symptom:**
- Error: Cannot find module 'pg'
- Error: Cannot find module 'axios'

**How to Check:**
```bash
npm list pg axios lodash uuid joi
```

**How to Fix:**
```bash
npm install
```

---

## ✅ **STEP-BY-STEP SOLUTION**

### Step 1: Verify PostgreSQL is Running
```powershell
# Check service
Get-Service postgresql*

# If not running, start it
Start-Service postgresql-x64-14  # Adjust version
```

### Step 2: Check What Databases Exist
```bash
psql -U postgres -l
```

### Step 3: Set Environment Variables
```powershell
$env:DB_PASSWORD="your_password"
$env:COMPLIANCE_DB="shahin_ksa_compliance"  # Or whatever database you have
```

### Step 4: Run Simple Diagnostic
```bash
node tests/simple_diagnostic.js
```

This will tell you:
- ✅ Can connect to PostgreSQL
- ✅ What databases exist
- ❌ What's missing

### Step 5: Fix What's Missing

**If databases don't exist:**
```sql
createdb -U postgres shahin_ksa_compliance
```

**If tables don't exist:**
```bash
psql -U postgres -d shahin_ksa_compliance -f database/schema.sql
```

### Step 6: Run Tests
```bash
npm run test:features
```

---

## 🎯 **QUICK FIXES FOR COMMON SCENARIOS**

### Scenario A: "I have PostgreSQL but no GRC databases"
```bash
# Create main database
createdb -U postgres grc_test

# Use it for all three
$env:COMPLIANCE_DB="grc_test"
$env:FINANCE_DB="grc_test"
$env:AUTH_DB="grc_test"
$env:DB_PASSWORD="postgres"

# Run tests
npm run test:features
```

### Scenario B: "I have a GRC database with tables already"
```bash
# Find your database name
psql -U postgres -l | Select-String "grc"

# Use that database
$env:COMPLIANCE_DB="your_database_name"
$env:FINANCE_DB="your_database_name"
$env:AUTH_DB="your_database_name"
$env:DB_PASSWORD="your_password"

# Run tests
npm run test:features
```

### Scenario C: "I just want to see what the tests do"
```bash
# No database needed - just review the test code
cat tests/test_auto_assessment_generator.js
cat tests/test_workflow_engine.js

# Read documentation
cat START_HERE.md
cat tests/TESTING_DOCUMENTATION.md
```

---

## 📊 **DIAGNOSTIC COMMANDS**

Run these to identify problems:

```powershell
# 1. Check PostgreSQL service
Get-Service postgresql*

# 2. Test connection
psql -U postgres -d postgres -c "SELECT version()"

# 3. List databases
psql -U postgres -l

# 4. Check specific database
psql -U postgres -d shahin_ksa_compliance -c "\dt"

# 5. Run our diagnostic
node tests/simple_diagnostic.js

# 6. Check npm modules
npm list pg axios
```

---

## 🔧 **TEST FILE REQUIREMENTS**

Each test file needs:

1. **Database Connection** ✅
   - Working PostgreSQL instance
   - Valid credentials
   - At least one database

2. **Required Tables** ✅
   - tenants, organizations, users
   - assessments, workflows
   - grc_frameworks, grc_controls

3. **npm Dependencies** ✅
   - pg, axios, lodash, uuid, joi

4. **Environment Variables** ✅
   - DB_PASSWORD (minimum)
   - Database names (or use defaults)

---

## 📝 **WHAT EACH TEST FILE DOES**

### test_auto_assessment_generator.js
Tests automatic assessment creation:
1. Creates test tenant (sector: finance)
2. Generates assessment with KSA regulators
3. Tests regulator mapping (SAMA, MOH, CITC, ECRA)
4. Validates control generation (100-200 controls)
5. Cleans up test data

**Requires:** tenants, organizations, users, assessments, grc_frameworks, grc_controls tables

### test_workflow_engine.js
Tests approval workflows:
1. Creates test users (assessor, manager, admin)
2. Creates test assessment
3. Creates and executes workflows
4. Tests approvals, rejections, delegations
5. Validates notifications and analytics
6. Cleans up test data

**Requires:** users, assessments, workflows, assessment_workflow, workflow_history, notifications tables

---

## 💡 **RECOMMENDATIONS**

### For Development/Testing:
1. Use single database for all three (simplest)
2. Start with minimal schema (just tables tests need)
3. Run diagnostics first before tests

### For Production:
1. Use separate databases as designed
2. Full schema with all tables
3. Proper credentials and permissions

---

## 📞 **STILL STUCK?**

Run this diagnostic sequence:

```powershell
# 1. Check PostgreSQL
Get-Service postgresql*

# 2. Test basic connection
psql -U postgres -c "SELECT 1"

# 3. List databases
psql -U postgres -l

# 4. Run our diagnostic
node tests/simple_diagnostic.js

# 5. Check the output
cat tests/diagnostic_output.txt
```

The diagnostic will tell you exactly what's wrong and how to fix it.

---

## ✅ **SUCCESS CHECKLIST**

Before running tests, verify:

- [ ] PostgreSQL service is running
- [ ] Can connect: `psql -U postgres`
- [ ] At least one database exists
- [ ] Database has required tables (or tests will create them)
- [ ] Environment variable DB_PASSWORD is set
- [ ] npm dependencies installed: `npm install`
- [ ] Test files exist in tests/ directory

If all checked, run:
```bash
npm run test:features
```

---

**Last Updated:** December 2024  
**Status:** Diagnostic Complete
