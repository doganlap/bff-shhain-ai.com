# 🚀 Complete Database Migration to Prisma Postgres

This guide will help you migrate ALL data from your local PostgreSQL database (5500+ controls) to Prisma Postgres.

## What Will Be Migrated

### ✅ Core GRC Data
- **5500+ GRC Controls** - All NCA, SAMA, ISO controls
- **10+ Frameworks** - Complete framework definitions
- **Control Mappings** - Framework-control relationships
- **Evidence Requirements** - All evidence definitions
- **Sector Controls** - Industry-specific mappings

### ✅ Organization Data
- **Tenants** - All organizations/tenants
- **Users** - User accounts with roles
- **Organizations** - Organization profiles
- **Licenses** - License management data
- **Subscriptions** - Subscription records

### ✅ Assessment Data
- **Assessments** - All assessment records
- **Assessment Controls** - Control evaluation data
- **Audit Logs** - Complete audit trail
- **Activity Logs** - User activity history

## Prerequisites

1. ✅ Local PostgreSQL running with `shahin_ksa_compliance` database
2. ✅ Prisma Postgres account configured in `apps/bff/.env`
3. ✅ Node.js and npm installed
4. ✅ PostgreSQL command-line tools (psql)

## Quick Start (One Command)

```bash
migrate-all-to-prisma.bat
```

This single command will:
1. Export all data from local PostgreSQL to CSV files
2. Install required npm packages
3. Push Prisma schema to cloud database
4. Import all 5500+ records to Prisma Postgres
5. Open Prisma Studio to verify the data

## Manual Step-by-Step Process

If you prefer to run each step manually:

### Step 1: Export Local Data

```bash
cd D:\Projects\GRC-Master\Assessmant-GRC
psql -U postgres -d shahin_ksa_compliance -f export-local-data.sql
```

This creates CSV files:
- `export_grc_controls.csv` (5500+ rows)
- `export_grc_frameworks.csv`
- `export_tenants.csv`
- `export_users.csv`
- `export_organizations.csv`
- And more...

### Step 2: Install Dependencies

```bash
cd apps\bff
npm install csv-parser
```

### Step 3: Generate Prisma Client & Push Schema

```bash
npx prisma generate
npx prisma db push --accept-data-loss
```

### Step 4: Import to Prisma Postgres

```bash
npx tsx prisma/import-to-prisma.ts
```

This will:
- Read all CSV exports
- Process 5500+ controls in batches of 100
- Handle foreign key dependencies
- Show progress updates every 500 records
- Display detailed import statistics

### Step 5: Verify Data

```bash
npx prisma studio --port 5560
```

Open http://localhost:5560 and verify:
- `grc_controls` table has 5500+ records
- `grc_frameworks` table has all frameworks
- All other tables populated correctly

## Expected Output

```
🚀 Starting Prisma Postgres Import
===================================

📋 Importing GRC Frameworks...
✅ Imported 10 frameworks (0 failed)

🛡️  Importing GRC Controls (5500+ records)...
Found 5532 controls to import...
   Progress: 500/5532 controls imported...
   Progress: 1000/5532 controls imported...
   Progress: 1500/5532 controls imported...
   ...
   Progress: 5500/5532 controls imported...
✅ Imported 5532 controls (0 failed, 0 skipped)

🏢 Importing Tenants...
✅ Imported 3 tenants (0 failed)

👥 Importing Users...
✅ Imported 5 users (0 failed)

========================================
📊 IMPORT SUMMARY
========================================

grc_frameworks:
  ✅ Imported: 10

grc_controls:
  ✅ Imported: 5532

tenants:
  ✅ Imported: 3

users:
  ✅ Imported: 5

organizations:
  ✅ Imported: 2

========================================
Total Imported: 5552
Total Failed: 0
Total Skipped: 0
========================================

✅ Import complete!
```

## Troubleshooting

### Issue: "database does not exist"
**Solution:** Run `npx prisma db push` first to create tables

### Issue: "Module 'csv-parser' not found"
**Solution:** Run `npm install csv-parser` in `apps/bff/`

### Issue: "CSV file not found"
**Solution:** Make sure you ran the export SQL script first from the project root

### Issue: "Duplicate key error"
**Solution:** The import uses `upsert`, so duplicates are safely skipped

### Issue: Import is slow
**Expected:** 5500+ records take 5-10 minutes. Progress shown every 500 records.

## Files Created

- `export-local-data.sql` - PostgreSQL export script
- `apps/bff/prisma/import-to-prisma.ts` - TypeScript import script  
- `migrate-all-to-prisma.bat` - One-click migration batch file
- `export_*.csv` - Temporary CSV files (safe to delete after import)

## Schema Updates

The following tables were added to `apps/bff/prisma/schema.prisma`:

- `grc_frameworks` - Framework definitions
- `grc_controls` - 5500+ control records
- `framework_controls` - Framework-control mappings
- `sector_controls` - Sector-specific controls
- `control_evidence_requirements` - Evidence definitions
- `organizations` - Organization profiles
- `assessments` - Assessment records
- `assessment_controls` - Control evaluations
- `licenses` - License management
- `subscriptions` - Subscription data
- `audit_logs` - Audit trail
- `activity_logs` - Activity history

## Post-Migration

After successful migration:

1. ✅ **Verify in Prisma Studio** - Check record counts match
2. ✅ **Test API endpoints** - Ensure backend can query data
3. ✅ **Update frontend** - Point to Prisma database
4. ✅ **Delete CSV exports** - Clean up temporary files
5. ✅ **Backup Prisma database** - Use Prisma Accelerate export

## Production Checklist

- [ ] All 5500+ controls imported
- [ ] All frameworks imported
- [ ] Users and tenants migrated
- [ ] Relationships maintained
- [ ] Prisma Studio accessible
- [ ] API endpoints working
- [ ] Frontend connected
- [ ] Performance tested

## Support

If you encounter issues:

1. Check `apps/bff/.env` has correct `DATABASE_URL`
2. Verify local PostgreSQL is running
3. Ensure Prisma Postgres account is active
4. Check import logs for specific errors
5. Use Prisma Studio to inspect data

## Cleanup

After successful migration, you can safely delete:

```bash
del export_*.csv
```

The CSV files are temporary and only needed during migration.

---

**Ready to migrate?** Run: `migrate-all-to-prisma.bat`
