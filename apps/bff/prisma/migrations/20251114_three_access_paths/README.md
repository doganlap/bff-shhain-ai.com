# Three Access Paths Migration

## Overview
This migration adds support for Demo, Partner, and POC access paths to the Shahin-AI GRC platform.

## SQL Dialect
This migration is written in **PostgreSQL 12+ syntax**, not DB2.

## ⚠️ Important: Linter False Positives

If you see SQL lint errors like:
- `"PROCEDURE" expected instead of this input`
- `"FIELDPROC" expected instead of this input`  
- `misplaced construct(s)`
- `"ERROR_TOKEN" unexpected token(s) ignored`

**These are FALSE POSITIVES!** 

### Why This Happens
Your IDE is using a DB2 SQL linter on PostgreSQL code. The SQL is 100% valid PostgreSQL syntax.

### How to Fix in VS Code/Cursor

#### Option 1: Disable DB2SqlService for this file
Add this to your VS Code settings (`.vscode/settings.json`):

```json
{
  "files.associations": {
    "migration.sql": "postgres"
  },
  "sql.linter.rules": {
    "no-db2-syntax": false
  }
}
```

#### Option 2: Configure SQL Tools Extension
If you're using the SQLTools extension:

1. Open Command Palette (Ctrl+Shift+P / Cmd+Shift+P)
2. Search for "SQLTools: Add New Connection"
3. Choose PostgreSQL
4. This will associate `.sql` files with PostgreSQL dialect

#### Option 3: Ignore the Warnings
The SQL will run perfectly fine on PostgreSQL. The linter warnings don't affect functionality.

## Tables Created

1. **tenants** - Multi-tenant support (demo/poc/partner/customer)
2. **users** - Multi-tenant users with partner flags
3. **demo_requests** - Demo registration tracking
4. **poc_requests** - POC request workflow management
5. **partner_invitations** - Partner invitation system

## Running the Migration

### Using psql:
```bash
cd d:\Projects\GRC-Master\Assessmant-GRC\apps\bff
psql -U postgres -d your_database_name < prisma/migrations/20251114_three_access_paths/migration.sql
```

### Using Prisma:
```bash
cd d:\Projects\GRC-Master\Assessmant-GRC\apps\bff
npx prisma migrate deploy
```

### Using Database Client:
Simply execute the entire `migration.sql` file in your PostgreSQL client (pgAdmin, DBeaver, etc.)

## Verification

After running the migration, verify tables were created:

```sql
-- Check tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('tenants', 'users', 'demo_requests', 'poc_requests', 'partner_invitations');

-- Check row counts
SELECT 
  'tenants' as table_name, COUNT(*) as row_count FROM tenants
UNION ALL
SELECT 'users', COUNT(*) FROM users
UNION ALL
SELECT 'demo_requests', COUNT(*) FROM demo_requests
UNION ALL
SELECT 'poc_requests', COUNT(*) FROM poc_requests
UNION ALL
SELECT 'partner_invitations', COUNT(*) FROM partner_invitations;
```

## Seed Data

The migration includes a test partner tenant:
- **Email**: `partner@test.com`
- **Password**: `test123` (hashed with bcrypt)
- **Tenant**: `test-partner`

## Rollback

If you need to rollback this migration:

```sql
DROP TABLE IF EXISTS partner_invitations CASCADE;
DROP TABLE IF EXISTS poc_requests CASCADE;
DROP TABLE IF EXISTS demo_requests CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS tenants CASCADE;
```

## Support

For issues or questions, contact the platform team or check the implementation report at:
`apps/web/src/components/landing/agentactioncontract.ini`
