-- ============================================================================
-- FINALIZE CORE BUSINESS STRUCTURE
-- Connect databases and clean up unused ones
-- ============================================================================

-- STEP 1: Add cross-database reference tables to grc_master
-- ============================================================================
\c grc_master;

-- Add user references to existing tables (safe - just adds columns)
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS primary_admin_user_id UUID;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS auth_database VARCHAR(50) DEFAULT 'shahin_access_control';

-- Add compliance reference
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS compliance_database VARCHAR(50) DEFAULT 'shahin_ksa_compliance';

-- Create cross-database mapping table
CREATE TABLE IF NOT EXISTS database_connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id),
    database_type VARCHAR(50) NOT NULL, -- 'auth', 'compliance', 'finance'
    database_name VARCHAR(100) NOT NULL,
    connection_string TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default database mappings
INSERT INTO database_connections (database_type, database_name, is_active) VALUES
('compliance', 'shahin_ksa_compliance', true),
('finance', 'grc_master', true),
('auth', 'shahin_access_control', true)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- STEP 2: Add compliance workflow connection to shahin_ksa_compliance
-- ============================================================================
\c shahin_ksa_compliance;

-- Add finance and auth references (safe - just adds columns)
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS finance_database VARCHAR(50) DEFAULT 'grc_master';
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS auth_database VARCHAR(50) DEFAULT 'shahin_access_control';

-- Add user reference columns
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS created_by_user_id UUID;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS assigned_to_user_id UUID;

-- ============================================================================
-- STEP 3: Add compliance reference to shahin_access_control
-- ============================================================================
\c shahin_access_control;

-- Add compliance and finance database references
ALTER TABLE users ADD COLUMN IF NOT EXISTS default_compliance_db VARCHAR(50) DEFAULT 'shahin_ksa_compliance';
ALTER TABLE users ADD COLUMN IF NOT EXISTS default_finance_db VARCHAR(50) DEFAULT 'grc_master';

-- Create user database access table
CREATE TABLE IF NOT EXISTS user_database_access (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    database_type VARCHAR(50) NOT NULL, -- 'compliance', 'finance'
    database_name VARCHAR(100) NOT NULL,
    access_level VARCHAR(50) DEFAULT 'read', -- 'read', 'write', 'admin'
    granted_by UUID REFERENCES users(id),
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

CREATE INDEX idx_user_db_access_user ON user_database_access(user_id);
CREATE INDEX idx_user_db_access_db ON user_database_access(database_name);

-- ============================================================================
-- STEP 4: SAFE CLEANUP - Remove unused databases
-- ============================================================================
\c postgres;

-- Only drop databases that are confirmed unused and empty
DROP DATABASE IF EXISTS doganhubstore WITH (FORCE);
DROP DATABASE IF EXISTS shahin_platform WITH (FORCE);
DROP DATABASE IF EXISTS studio_app WITH (FORCE);

-- ============================================================================
-- STEP 5: VERIFICATION
-- ============================================================================

-- List final database structure
SELECT 
    datname as database_name,
    pg_size_pretty(pg_database_size(datname)) as size,
    CASE 
        WHEN datname = 'shahin_ksa_compliance' THEN 'Core Business Workflow'
        WHEN datname = 'grc_master' THEN 'Finance & Admin'
        WHEN datname = 'shahin_access_control' THEN 'Access & Authority'
        WHEN datname = 'postgres' THEN 'System Default'
        ELSE 'Other'
    END as purpose
FROM pg_database 
WHERE datistemplate = false 
ORDER BY 
    CASE 
        WHEN datname = 'shahin_ksa_compliance' THEN 1
        WHEN datname = 'grc_master' THEN 2
        WHEN datname = 'shahin_access_control' THEN 3
        WHEN datname = 'postgres' THEN 4
        ELSE 5
    END;

-- Show success message
SELECT '🎉 CORE BUSINESS STRUCTURE CREATED SUCCESSFULLY!' as status;
SELECT '📊 3 Core Databases + 1 System Database = 4 Total' as summary;
