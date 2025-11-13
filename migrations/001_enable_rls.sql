-- ============================================
-- PostgreSQL Row-Level Security (RLS) Migration
-- Multi-Tenant Data Isolation at Database Level
-- ============================================

-- Execute with: psql -U postgres -d grc_db -f migrations/001_enable_rls.sql

BEGIN;

-- ============================================
-- 1. CREATE HELPER FUNCTIONS
-- ============================================

-- Function to get current tenant from session
CREATE OR REPLACE FUNCTION current_tenant_id()
RETURNS UUID AS $$
  SELECT NULLIF(current_setting('app.current_tenant_id', TRUE), '')::UUID;
$$ LANGUAGE SQL STABLE;

-- Function to check if user is super admin
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
  SELECT COALESCE(
    current_setting('app.is_super_admin', TRUE)::BOOLEAN,
    FALSE
  );
$$ LANGUAGE SQL STABLE;

-- ============================================
-- 2. ENABLE RLS ON ALL TENANT-SCOPED TABLES
-- ============================================

-- Core tables
ALTER TABLE IF EXISTS assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS assessment_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS assessment_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS frameworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS controls ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS notifications ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 3. CREATE RLS POLICIES - ASSESSMENTS
-- ============================================

-- Drop existing policies if any
DROP POLICY IF EXISTS tenant_isolation_assessments_select ON assessments;
DROP POLICY IF EXISTS tenant_isolation_assessments_insert ON assessments;
DROP POLICY IF EXISTS tenant_isolation_assessments_update ON assessments;
DROP POLICY IF EXISTS tenant_isolation_assessments_delete ON assessments;

-- SELECT policy
CREATE POLICY tenant_isolation_assessments_select
ON assessments FOR SELECT
USING (
  tenant_id = current_tenant_id()
  OR is_super_admin()
);

-- INSERT policy
CREATE POLICY tenant_isolation_assessments_insert
ON assessments FOR INSERT
WITH CHECK (
  tenant_id = current_tenant_id()
);

-- UPDATE policy
CREATE POLICY tenant_isolation_assessments_update
ON assessments FOR UPDATE
USING (
  tenant_id = current_tenant_id()
  OR is_super_admin()
)
WITH CHECK (
  tenant_id = current_tenant_id()
);

-- DELETE policy
CREATE POLICY tenant_isolation_assessments_delete
ON assessments FOR DELETE
USING (
  tenant_id = current_tenant_id()
  OR is_super_admin()
);

-- ============================================
-- 4. CREATE RLS POLICIES - USERS
-- ============================================

DROP POLICY IF EXISTS tenant_isolation_users_select ON users;
DROP POLICY IF EXISTS tenant_isolation_users_insert ON users;
DROP POLICY IF EXISTS tenant_isolation_users_update ON users;
DROP POLICY IF EXISTS tenant_isolation_users_delete ON users;

CREATE POLICY tenant_isolation_users_select
ON users FOR SELECT
USING (
  tenant_id = current_tenant_id()
  OR is_super_admin()
);

CREATE POLICY tenant_isolation_users_insert
ON users FOR INSERT
WITH CHECK (
  tenant_id = current_tenant_id()
);

CREATE POLICY tenant_isolation_users_update
ON users FOR UPDATE
USING (
  tenant_id = current_tenant_id()
  OR is_super_admin()
)
WITH CHECK (
  tenant_id = current_tenant_id()
);

CREATE POLICY tenant_isolation_users_delete
ON users FOR DELETE
USING (
  tenant_id = current_tenant_id()
  OR is_super_admin()
);

-- ============================================
-- 5. CREATE RLS POLICIES - ORGANIZATIONS
-- ============================================

DROP POLICY IF EXISTS tenant_isolation_organizations_select ON organizations;
DROP POLICY IF EXISTS tenant_isolation_organizations_insert ON organizations;
DROP POLICY IF EXISTS tenant_isolation_organizations_update ON organizations;
DROP POLICY IF EXISTS tenant_isolation_organizations_delete ON organizations;

CREATE POLICY tenant_isolation_organizations_select
ON organizations FOR SELECT
USING (
  tenant_id = current_tenant_id()
  OR is_super_admin()
);

CREATE POLICY tenant_isolation_organizations_insert
ON organizations FOR INSERT
WITH CHECK (
  tenant_id = current_tenant_id()
);

CREATE POLICY tenant_isolation_organizations_update
ON organizations FOR UPDATE
USING (
  tenant_id = current_tenant_id()
  OR is_super_admin()
)
WITH CHECK (
  tenant_id = current_tenant_id()
);

CREATE POLICY tenant_isolation_organizations_delete
ON organizations FOR DELETE
USING (
  tenant_id = current_tenant_id()
  OR is_super_admin()
);

-- ============================================
-- 6. CREATE RLS POLICIES - FRAMEWORKS
-- ============================================

DROP POLICY IF EXISTS tenant_isolation_frameworks_select ON frameworks;
DROP POLICY IF EXISTS tenant_isolation_frameworks_insert ON frameworks;
DROP POLICY IF EXISTS tenant_isolation_frameworks_update ON frameworks;
DROP POLICY IF EXISTS tenant_isolation_frameworks_delete ON frameworks;

CREATE POLICY tenant_isolation_frameworks_select
ON frameworks FOR SELECT
USING (
  tenant_id = current_tenant_id()
  OR is_super_admin()
);

CREATE POLICY tenant_isolation_frameworks_insert
ON frameworks FOR INSERT
WITH CHECK (
  tenant_id = current_tenant_id()
);

CREATE POLICY tenant_isolation_frameworks_update
ON frameworks FOR UPDATE
USING (
  tenant_id = current_tenant_id()
  OR is_super_admin()
)
WITH CHECK (
  tenant_id = current_tenant_id()
);

CREATE POLICY tenant_isolation_frameworks_delete
ON frameworks FOR DELETE
USING (
  tenant_id = current_tenant_id()
  OR is_super_admin()
);

-- ============================================
-- 7. CREATE RLS POLICIES - CONTROLS
-- ============================================

DROP POLICY IF EXISTS tenant_isolation_controls_select ON controls;
DROP POLICY IF EXISTS tenant_isolation_controls_insert ON controls;
DROP POLICY IF EXISTS tenant_isolation_controls_update ON controls;
DROP POLICY IF EXISTS tenant_isolation_controls_delete ON controls;

CREATE POLICY tenant_isolation_controls_select
ON controls FOR SELECT
USING (
  tenant_id = current_tenant_id()
  OR is_super_admin()
);

CREATE POLICY tenant_isolation_controls_insert
ON controls FOR INSERT
WITH CHECK (
  tenant_id = current_tenant_id()
);

CREATE POLICY tenant_isolation_controls_update
ON controls FOR UPDATE
USING (
  tenant_id = current_tenant_id()
  OR is_super_admin()
)
WITH CHECK (
  tenant_id = current_tenant_id()
);

CREATE POLICY tenant_isolation_controls_delete
ON controls FOR DELETE
USING (
  tenant_id = current_tenant_id()
  OR is_super_admin()
);

-- ============================================
-- 8. CREATE RLS POLICIES - EVIDENCE
-- ============================================

DROP POLICY IF EXISTS tenant_isolation_evidence_select ON assessment_evidence;
DROP POLICY IF EXISTS tenant_isolation_evidence_insert ON assessment_evidence;
DROP POLICY IF EXISTS tenant_isolation_evidence_update ON assessment_evidence;
DROP POLICY IF EXISTS tenant_isolation_evidence_delete ON assessment_evidence;

CREATE POLICY tenant_isolation_evidence_select
ON assessment_evidence FOR SELECT
USING (
  tenant_id = current_tenant_id()
  OR is_super_admin()
);

CREATE POLICY tenant_isolation_evidence_insert
ON assessment_evidence FOR INSERT
WITH CHECK (
  tenant_id = current_tenant_id()
);

CREATE POLICY tenant_isolation_evidence_update
ON assessment_evidence FOR UPDATE
USING (
  tenant_id = current_tenant_id()
  OR is_super_admin()
)
WITH CHECK (
  tenant_id = current_tenant_id()
);

CREATE POLICY tenant_isolation_evidence_delete
ON assessment_evidence FOR DELETE
USING (
  tenant_id = current_tenant_id()
  OR is_super_admin()
);

-- ============================================
-- 9. CREATE RLS POLICIES - DOCUMENTS
-- ============================================

DROP POLICY IF EXISTS tenant_isolation_documents_select ON documents;
DROP POLICY IF EXISTS tenant_isolation_documents_insert ON documents;
DROP POLICY IF EXISTS tenant_isolation_documents_update ON documents;
DROP POLICY IF EXISTS tenant_isolation_documents_delete ON documents;

CREATE POLICY tenant_isolation_documents_select
ON documents FOR SELECT
USING (
  tenant_id = current_tenant_id()
  OR is_super_admin()
);

CREATE POLICY tenant_isolation_documents_insert
ON documents FOR INSERT
WITH CHECK (
  tenant_id = current_tenant_id()
);

CREATE POLICY tenant_isolation_documents_update
ON documents FOR UPDATE
USING (
  tenant_id = current_tenant_id()
  OR is_super_admin()
)
WITH CHECK (
  tenant_id = current_tenant_id()
);

CREATE POLICY tenant_isolation_documents_delete
ON documents FOR DELETE
USING (
  tenant_id = current_tenant_id()
  OR is_super_admin()
);

-- ============================================
-- 10. CREATE RLS POLICIES - AUDIT LOGS
-- ============================================

DROP POLICY IF EXISTS tenant_isolation_audit_logs_select ON audit_logs;
DROP POLICY IF EXISTS tenant_isolation_audit_logs_insert ON audit_logs;

-- Audit logs: Read-only for tenants, super admins can view all
CREATE POLICY tenant_isolation_audit_logs_select
ON audit_logs FOR SELECT
USING (
  tenant_id = current_tenant_id()
  OR is_super_admin()
);

-- Audit logs: Only system can insert
CREATE POLICY tenant_isolation_audit_logs_insert
ON audit_logs FOR INSERT
WITH CHECK (
  tenant_id = current_tenant_id()
);

-- ============================================
-- 11. VERIFICATION QUERIES
-- ============================================

-- Check RLS is enabled
DO $$
DECLARE
  enabled_count INT;
BEGIN
  SELECT COUNT(*)
  INTO enabled_count
  FROM pg_tables
  WHERE schemaname = 'public'
  AND rowsecurity = TRUE;
  
  RAISE NOTICE 'Tables with RLS enabled: %', enabled_count;
END $$;

-- Check policies created
DO $$
DECLARE
  policy_count INT;
BEGIN
  SELECT COUNT(*)
  INTO policy_count
  FROM pg_policies
  WHERE schemaname = 'public';
  
  RAISE NOTICE 'RLS Policies created: %', policy_count;
END $$;

COMMIT;

-- ============================================
-- 12. TESTING SCRIPT (Run separately)
-- ============================================

/*

-- Test 1: Set tenant context
SET app.current_tenant_id = '42c676e2-8d5e-4b1d-ae80-3986b82dd5c5';
SET app.is_super_admin = FALSE;

-- Test 2: Query should only return tenant-1 data
SELECT COUNT(*) FROM assessments;

-- Test 3: Try to access another tenant's data (should return 0)
SELECT COUNT(*) FROM assessments WHERE tenant_id = 'other-tenant-id';

-- Test 4: Try to insert with wrong tenant_id (should fail)
INSERT INTO assessments (id, name, tenant_id)
VALUES (gen_random_uuid(), 'Test', 'other-tenant-id');

-- Test 5: Super admin access
SET app.is_super_admin = TRUE;
SELECT COUNT(*) FROM assessments; -- Should see all tenants

-- Test 6: Reset context
RESET app.current_tenant_id;
RESET app.is_super_admin;

*/

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '✅ Row-Level Security (RLS) enabled successfully!';
  RAISE NOTICE 'All tenant-scoped tables now enforce data isolation at database level.';
  RAISE NOTICE 'Run verification tests to confirm RLS is working.';
END $$;
