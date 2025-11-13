-- ============================================================================
-- ENHANCE DATABASE RELATIONS AND INDEXES
-- Adds proper foreign keys, constraints, and performance indexes
-- ============================================================================

-- ============================================================================
-- 1. ENHANCE AUTH DATABASE (shahin_access_control)
-- ============================================================================
\c shahin_access_control;

-- Add missing columns and constraints
ALTER TABLE users ADD COLUMN IF NOT EXISTS tenant_id UUID;
ALTER TABLE users ADD COLUMN IF NOT EXISTS department VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS job_title VARCHAR(100);

-- Add foreign key constraints
ALTER TABLE user_roles ADD CONSTRAINT IF NOT EXISTS fk_user_roles_user 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE user_roles ADD CONSTRAINT IF NOT EXISTS fk_user_roles_role 
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE;

ALTER TABLE role_permissions ADD CONSTRAINT IF NOT EXISTS fk_role_permissions_role 
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE;
ALTER TABLE role_permissions ADD CONSTRAINT IF NOT EXISTS fk_role_permissions_permission 
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE;

ALTER TABLE user_sessions ADD CONSTRAINT IF NOT EXISTS fk_user_sessions_user 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE api_tokens ADD CONSTRAINT IF NOT EXISTS fk_api_tokens_user 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE audit_logs ADD CONSTRAINT IF NOT EXISTS fk_audit_logs_user 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;

-- Performance indexes for auth database
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_tenant_id ON users(tenant_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_department ON users(department);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_job_title ON users(job_title);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_last_login ON users(last_login);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_roles_active ON user_roles(is_active);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_sessions_expires ON user_sessions(expires_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_api_tokens_active ON api_tokens(is_active);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource_type);

-- ============================================================================
-- 2. ENHANCE FINANCE DATABASE (grc_master)
-- ============================================================================
\c grc_master;

-- Add missing status columns
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';

-- Add foreign key constraints
ALTER TABLE organizations ADD CONSTRAINT IF NOT EXISTS fk_organizations_tenant 
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

-- Add tenant_licenses table if not exists
CREATE TABLE IF NOT EXISTS tenant_licenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    license_id UUID NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    quantity INTEGER DEFAULT 1,
    usage_percentage DECIMAL(5,2) DEFAULT 0,
    assigned_date DATE DEFAULT CURRENT_DATE,
    expiry_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add licenses table if not exists
CREATE TABLE IF NOT EXISTS licenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100),
    description TEXT,
    monthly_cost DECIMAL(10,2),
    max_users INTEGER,
    features JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add subscriptions table if not exists
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    plan_id UUID,
    status VARCHAR(20) DEFAULT 'active',
    monthly_fee DECIMAL(10,2),
    usage_percentage DECIMAL(5,2) DEFAULT 0,
    start_date DATE DEFAULT CURRENT_DATE,
    end_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add subscription_plans table if not exists
CREATE TABLE IF NOT EXISTS subscription_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    billing_cycle VARCHAR(20) DEFAULT 'monthly',
    price DECIMAL(10,2),
    features JSONB DEFAULT '[]',
    max_users INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Performance indexes for finance database
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tenants_status ON tenants(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_organizations_status ON organizations(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_organizations_tenant ON organizations(tenant_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tenant_licenses_status ON tenant_licenses(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tenant_licenses_tenant ON tenant_licenses(tenant_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tenant_licenses_expiry ON tenant_licenses(expiry_date);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_subscriptions_tenant ON subscriptions(tenant_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_subscriptions_dates ON subscriptions(start_date, end_date);

-- ============================================================================
-- 3. ENHANCE COMPLIANCE DATABASE (shahin_ksa_compliance)
-- ============================================================================
\c shahin_ksa_compliance;

-- Add missing columns for cross-database relations
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS tenant_id UUID;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS created_by_user_id UUID;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS assigned_to_user_id UUID;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS auth_database VARCHAR(50) DEFAULT 'shahin_access_control';
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS finance_database VARCHAR(50) DEFAULT 'grc_master';

-- Add framework_controls table if not exists
CREATE TABLE IF NOT EXISTS framework_controls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    framework_id UUID NOT NULL,
    control_id UUID NOT NULL,
    category VARCHAR(100),
    subcategory VARCHAR(100),
    is_mandatory BOOLEAN DEFAULT true,
    weight DECIMAL(3,2) DEFAULT 1.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(framework_id, control_id)
);

-- Add assessment_responses table if not exists
CREATE TABLE IF NOT EXISTS assessment_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assessment_id UUID NOT NULL,
    control_id UUID NOT NULL,
    compliance_score DECIMAL(5,2),
    status VARCHAR(20) DEFAULT 'pending',
    response_text TEXT,
    evidence_files JSONB DEFAULT '[]',
    reviewed_by UUID,
    reviewed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Performance indexes for compliance database
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_assessments_tenant ON assessments(tenant_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_assessments_creator ON assessments(created_by_user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_assessments_assignee ON assessments(assigned_to_user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_assessments_status ON assessments(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_framework_controls_framework ON framework_controls(framework_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_framework_controls_control ON framework_controls(control_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_assessment_responses_assessment ON assessment_responses(assessment_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_assessment_responses_control ON assessment_responses(control_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_assessment_responses_score ON assessment_responses(compliance_score);

-- ============================================================================
-- 4. CREATE CROSS-DATABASE REFERENCE TABLES
-- ============================================================================

-- In Auth Database - Create cross-database reference tracking
\c shahin_access_control;

CREATE TABLE IF NOT EXISTS cross_db_references (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_db VARCHAR(50) NOT NULL,
    source_table VARCHAR(100) NOT NULL,
    source_id UUID NOT NULL,
    target_db VARCHAR(50) NOT NULL,
    target_table VARCHAR(100) NOT NULL,
    target_id UUID NOT NULL,
    relationship_type VARCHAR(50), -- 'owns', 'created_by', 'assigned_to', etc.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(source_db, source_table, source_id, target_db, target_table, target_id)
);

CREATE INDEX IF NOT EXISTS idx_cross_db_refs_source ON cross_db_references(source_db, source_table, source_id);
CREATE INDEX IF NOT EXISTS idx_cross_db_refs_target ON cross_db_references(target_db, target_table, target_id);
CREATE INDEX IF NOT EXISTS idx_cross_db_refs_type ON cross_db_references(relationship_type);

-- ============================================================================
-- 5. INSERT SAMPLE DATA FOR TESTING
-- ============================================================================

-- Sample users in auth database
\c shahin_access_control;

INSERT INTO users (email, username, password_hash, first_name, last_name, is_active, tenant_id)
VALUES 
    ('admin@shahin.ai', 'admin', 'hashed_password_1', 'System', 'Administrator', true, '550e8400-e29b-41d4-a716-446655440000'),
    ('manager@shahin.ai', 'manager', 'hashed_password_2', 'Compliance', 'Manager', true, '550e8400-e29b-41d4-a716-446655440000'),
    ('auditor@shahin.ai', 'auditor', 'hashed_password_3', 'Internal', 'Auditor', true, '550e8400-e29b-41d4-a716-446655440000')
ON CONFLICT (email) DO NOTHING;

-- Assign roles to users
INSERT INTO user_roles (user_id, role_id, is_active)
SELECT u.id, r.id, true
FROM users u, roles r
WHERE (u.email = 'admin@shahin.ai' AND r.name = 'platform_admin')
   OR (u.email = 'manager@shahin.ai' AND r.name = 'compliance_manager')
   OR (u.email = 'auditor@shahin.ai' AND r.name = 'auditor')
ON CONFLICT (user_id, role_id) DO NOTHING;

-- Sample data in finance database
\c grc_master;

-- Ensure tenants have proper status
UPDATE tenants SET status = 'active' WHERE status IS NULL;

-- Sample licenses
INSERT INTO licenses (name, type, monthly_cost, max_users, is_active)
VALUES 
    ('GRC Professional', 'compliance', 299.99, 50, true),
    ('Enterprise Suite', 'full', 999.99, 500, true),
    ('Audit Module', 'audit', 199.99, 25, true)
ON CONFLICT DO NOTHING;

-- Sample tenant licenses
INSERT INTO tenant_licenses (tenant_id, license_id, status, quantity, usage_percentage)
SELECT t.id, l.id, 'active', 1, 75.5
FROM tenants t, licenses l
WHERE t.status = 'active' AND l.is_active = true
LIMIT 3
ON CONFLICT DO NOTHING;

-- Sample data in compliance database
\c shahin_ksa_compliance;

-- Update assessments with proper user references
UPDATE assessments 
SET tenant_id = '550e8400-e29b-41d4-a716-446655440000',
    created_by_user_id = (SELECT id FROM shahin_access_control.users WHERE email = 'admin@shahin.ai' LIMIT 1)
WHERE tenant_id IS NULL;

-- ============================================================================
-- 6. CREATE PERFORMANCE MONITORING VIEWS
-- ============================================================================

-- Auth database performance view
\c shahin_access_control;

CREATE OR REPLACE VIEW v_auth_performance AS
SELECT 
    'users' as table_name,
    COUNT(*) as total_records,
    COUNT(CASE WHEN is_active = true THEN 1 END) as active_records,
    pg_size_pretty(pg_total_relation_size('users')) as table_size
FROM users
UNION ALL
SELECT 
    'user_sessions' as table_name,
    COUNT(*) as total_records,
    COUNT(CASE WHEN expires_at > NOW() THEN 1 END) as active_records,
    pg_size_pretty(pg_total_relation_size('user_sessions')) as table_size
FROM user_sessions
UNION ALL
SELECT 
    'audit_logs' as table_name,
    COUNT(*) as total_records,
    COUNT(CASE WHEN created_at > NOW() - INTERVAL '24 hours' THEN 1 END) as active_records,
    pg_size_pretty(pg_total_relation_size('audit_logs')) as table_size
FROM audit_logs;

-- Finance database performance view
\c grc_master;

CREATE OR REPLACE VIEW v_finance_performance AS
SELECT 
    'tenants' as table_name,
    COUNT(*) as total_records,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_records,
    pg_size_pretty(pg_total_relation_size('tenants')) as table_size
FROM tenants
UNION ALL
SELECT 
    'tenant_licenses' as table_name,
    COUNT(*) as total_records,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_records,
    pg_size_pretty(pg_total_relation_size('tenant_licenses')) as table_size
FROM tenant_licenses
UNION ALL
SELECT 
    'subscriptions' as table_name,
    COUNT(*) as total_records,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_records,
    pg_size_pretty(pg_total_relation_size('subscriptions')) as table_size
FROM subscriptions;

-- Compliance database performance view
\c shahin_ksa_compliance;

CREATE OR REPLACE VIEW v_compliance_performance AS
SELECT 
    'assessments' as table_name,
    COUNT(*) as total_records,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as active_records,
    pg_size_pretty(pg_total_relation_size('assessments')) as table_size
FROM assessments
UNION ALL
SELECT 
    'frameworks' as table_name,
    COUNT(*) as total_records,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_records,
    pg_size_pretty(pg_total_relation_size('frameworks')) as table_size
FROM frameworks
UNION ALL
SELECT 
    'assessment_responses' as table_name,
    COUNT(*) as total_records,
    COUNT(CASE WHEN compliance_score >= 80 THEN 1 END) as active_records,
    pg_size_pretty(pg_total_relation_size('assessment_responses')) as table_size
FROM assessment_responses;

-- ============================================================================
-- 7. VERIFICATION QUERIES
-- ============================================================================

\c shahin_access_control;
SELECT 'AUTH DB - Enhanced successfully' as status;
SELECT COUNT(*) as total_indexes FROM pg_indexes WHERE schemaname = 'public';

\c grc_master;
SELECT 'FINANCE DB - Enhanced successfully' as status;
SELECT COUNT(*) as total_indexes FROM pg_indexes WHERE schemaname = 'public';

\c shahin_ksa_compliance;
SELECT 'COMPLIANCE DB - Enhanced successfully' as status;
SELECT COUNT(*) as total_indexes FROM pg_indexes WHERE schemaname = 'public';
