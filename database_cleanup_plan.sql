-- ============================================================================
-- DATABASE CLEANUP PLAN - REDUCE FROM 15 TO 3 DATABASES
-- ============================================================================

-- PHASE 1: BACKUP CRITICAL DATA (Run these first)
-- ============================================================================

-- Create backup of important tables from other GRC databases
-- (Run these commands one by one to backup data before deletion)

/*
-- Backup commands (run manually if needed):
pg_dump -U postgres -d grc_assessment -t assessments > backup_grc_assessment.sql
pg_dump -U postgres -d grc_template -t templates > backup_grc_template.sql
pg_dump -U postgres -d shahin_ksa_compliance -t compliance_data > backup_compliance.sql
*/

-- PHASE 2: SAFE TO DELETE IMMEDIATELY
-- ============================================================================

-- 1. Delete test database (confirmed safe)
DROP DATABASE IF EXISTS test_assessment_module;

-- 2. Delete small/unused databases (less than 8MB, no active connections)
DROP DATABASE IF EXISTS saudi_store;
DROP DATABASE IF EXISTS grc_db;
DROP DATABASE IF EXISTS appstore_db;

-- PHASE 3: CONSOLIDATE GRC DATABASES (After backing up data)
-- ============================================================================

-- These can be dropped after confirming data is backed up or not needed:
-- DROP DATABASE IF EXISTS grc_assessment;
-- DROP DATABASE IF EXISTS grc_template;
-- DROP DATABASE IF EXISTS assessment_db;
-- DROP DATABASE IF EXISTS assessment_module;
-- DROP DATABASE IF EXISTS grc_ecosystem;

-- PHASE 4: REVIEW LARGER DATABASES
-- ============================================================================

-- These need manual review before deletion:
-- DROP DATABASE IF EXISTS studio_app;           -- 29MB - Review contents first
-- DROP DATABASE IF EXISTS shahin_ksa_compliance; -- 18MB - May contain important compliance data
-- DROP DATABASE IF EXISTS doganhubstore;        -- 10MB - Review if still needed
-- DROP DATABASE IF EXISTS shahin_platform;      -- 9MB - Review if still needed

-- ============================================================================
-- FINAL TARGET STATE: 3 DATABASES
-- ============================================================================
-- 1. postgres (system default) - 7.8MB
-- 2. grc_master (current production) - 10MB  
-- 3. shahin_ksa_compliance (if contains unique compliance data) - 18MB
-- TOTAL: ~36MB (down from 164MB - 78% reduction)

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check remaining databases after cleanup
SELECT 
  datname as database_name, 
  pg_size_pretty(pg_database_size(datname)) as size
FROM pg_database 
WHERE datistemplate = false 
ORDER BY pg_database_size(datname) DESC;
