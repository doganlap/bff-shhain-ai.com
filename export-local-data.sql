-- =====================================================
-- COMPLETE DATA MIGRATION TO PRISMA POSTGRES
-- Exports all data from local shahin_ksa_compliance
-- to Prisma Postgres production database
-- =====================================================

\echo '========================================='
\echo 'STEP 1: Exporting Local Database Data'
\echo '========================================='

-- Export all tables to CSV files for migration
\echo 'Exporting grc_controls (5500+ records)...'
\copy (SELECT * FROM grc_controls) TO 'export_grc_controls.csv' CSV HEADER;

\echo 'Exporting grc_frameworks...'
\copy (SELECT * FROM grc_frameworks) TO 'export_grc_frameworks.csv' CSV HEADER;

\echo 'Exporting framework_controls...'
\copy (SELECT * FROM framework_controls) TO 'export_framework_controls.csv' CSV HEADER;

\echo 'Exporting sector_controls...'
\copy (SELECT * FROM sector_controls) TO 'export_sector_controls.csv' CSV HEADER;

\echo 'Exporting control_evidence_requirements...'
\copy (SELECT * FROM control_evidence_requirements) TO 'export_control_evidence.csv' CSV HEADER;

\echo 'Exporting assessments...'
\copy (SELECT * FROM assessments) TO 'export_assessments.csv' CSV HEADER;

\echo 'Exporting assessment_controls...'
\copy (SELECT * FROM assessment_controls) TO 'export_assessment_controls.csv' CSV HEADER;

\echo 'Exporting organizations...'
\copy (SELECT * FROM organizations) TO 'export_organizations.csv' CSV HEADER;

\echo 'Exporting tenants...'
\copy (SELECT * FROM tenants) TO 'export_tenants.csv' CSV HEADER;

\echo 'Exporting users...'
\copy (SELECT * FROM users) TO 'export_users.csv' CSV HEADER;

\echo 'Exporting licenses...'
\copy (SELECT * FROM licenses) TO 'export_licenses.csv' CSV HEADER;

\echo 'Exporting subscriptions...'
\copy (SELECT * FROM subscriptions) TO 'export_subscriptions.csv' CSV HEADER;

\echo 'Exporting audit_logs...'
\copy (SELECT * FROM audit_logs) TO 'export_audit_logs.csv' CSV HEADER;

\echo 'Exporting activity_logs...'
\copy (SELECT * FROM activity_logs) TO 'export_activity_logs.csv' CSV HEADER;

\echo ''
\echo '========================================='
\echo 'Export Complete!'
\echo '========================================='
\echo 'CSV files created in current directory'
\echo 'Next: Run import-to-prisma.js to push to Prisma Postgres'
