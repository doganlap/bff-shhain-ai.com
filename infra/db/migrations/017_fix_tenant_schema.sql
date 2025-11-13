-- ==========================================
-- FIX DATABASE SCHEMA TO MEET REQUIREMENTS
-- Purpose: Add tenant_id and standardize all tables
-- ==========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. ADD TENANT_ID TO ALL EXISTING TABLES
-- ==========================================

-- Add tenant_id to organizations
ALTER TABLE organizations
ADD COLUMN IF NOT EXISTS tenant_id UUID,
ADD COLUMN IF NOT EXISTS temp_id UUID DEFAULT uuid_generate_v4();

-- Add tenant_id to users
ALTER TABLE users
ADD COLUMN IF NOT EXISTS tenant_id UUID,
ADD COLUMN IF NOT EXISTS temp_id UUID DEFAULT uuid_generate_v4();

-- Add tenant_id to assessments
ALTER TABLE assessments
ADD COLUMN IF NOT EXISTS tenant_id UUID,
ADD COLUMN IF NOT EXISTS temp_id UUID DEFAULT uuid_generate_v4();

-- Add tenant_id to grc_frameworks
ALTER TABLE grc_frameworks
ADD COLUMN IF NOT EXISTS tenant_id UUID,
ADD COLUMN IF NOT EXISTS temp_id UUID DEFAULT uuid_generate_v4();

-- Add tenant_id to grc_controls
ALTER TABLE grc_controls
ADD COLUMN IF NOT EXISTS tenant_id UUID,
ADD COLUMN IF NOT EXISTS temp_id UUID DEFAULT uuid_generate_v4();

-- ==========================================
-- 2. CREATE TENANTS TABLE IF NOT EXISTS
-- ==========================================

CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255),
    status VARCHAR(50) DEFAULT 'active',

    -- Standard audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID,

    CONSTRAINT chk_tenant_status CHECK (status IN ('active', 'suspended', 'terminated'))
);

-- ==========================================
-- 3. POPULATE DEFAULT TENANT
-- ==========================================

INSERT INTO tenants (id, tenant_code, name, name_ar)
VALUES (
    '42c676e2-8d5e-4b1d-ae80-3986b82dd5c5',
    'DEFAULT',
    'Default Tenant',
    'المستأجر الافتراضي'
) ON CONFLICT (tenant_code) DO NOTHING;

-- ==========================================
-- 4. UPDATE EXISTING RECORDS WITH TENANT_ID
-- ==========================================

-- Update organizations with default tenant
UPDATE organizations
SET tenant_id = '42c676e2-8d5e-4b1d-ae80-3986b82dd5c5'
WHERE tenant_id IS NULL;

-- Update users with default tenant
UPDATE users
SET tenant_id = '42c676e2-8d5e-4b1d-ae80-3986b82dd5c5'
WHERE tenant_id IS NULL;

-- Update assessments with default tenant
UPDATE assessments
SET tenant_id = '42c676e2-8d5e-4b1d-ae80-3986b82dd5c5'
WHERE tenant_id IS NULL;

-- Update frameworks with default tenant
UPDATE grc_frameworks
SET tenant_id = '42c676e2-8d5e-4b1d-ae80-3986b82dd5c5'
WHERE tenant_id IS NULL;

-- Update controls with default tenant
UPDATE grc_controls
SET tenant_id = '42c676e2-8d5e-4b1d-ae80-3986b82dd5c5'
WHERE tenant_id IS NULL;

-- ==========================================
-- 5. ADD FOREIGN KEY CONSTRAINTS
-- ==========================================

-- Add foreign key constraints for tenant_id
ALTER TABLE organizations
ADD CONSTRAINT fk_organizations_tenant_id
FOREIGN KEY (tenant_id) REFERENCES tenants(id);

ALTER TABLE users
ADD CONSTRAINT fk_users_tenant_id
FOREIGN KEY (tenant_id) REFERENCES tenants(id);

ALTER TABLE assessments
ADD CONSTRAINT fk_assessments_tenant_id
FOREIGN KEY (tenant_id) REFERENCES tenants(id);

-- ==========================================
-- 6. STANDARD RELATIONSHIPS VALIDATION
-- ==========================================

-- Organizations ↔ Users (1:n)
-- Already handled via organization_id in users table

-- Frameworks ↔ Controls (m:n)
-- Should use framework_control_map table
CREATE TABLE IF NOT EXISTS framework_control_map (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    framework_id UUID NOT NULL,
    control_id UUID NOT NULL,

    -- Standard audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID,

    UNIQUE(tenant_id, framework_id, control_id)
);

-- Assessments → Questions → Responses → Evidence
-- assessment_questions and assessment_responses tables should exist

-- Controls → Implementation/Tests/Evidence
CREATE TABLE IF NOT EXISTS control_implementations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    control_id UUID NOT NULL,
    implementation_status VARCHAR(50) DEFAULT 'not_started',
    implementation_description TEXT,

    -- Standard audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID
);

CREATE TABLE IF NOT EXISTS control_tests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    control_id UUID NOT NULL,
    test_type VARCHAR(50),
    test_status VARCHAR(50) DEFAULT 'pending',
    test_results JSONB,

    -- Standard audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID
);

CREATE TABLE IF NOT EXISTS control_evidence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    control_id UUID NOT NULL,
    evidence_type VARCHAR(50),
    evidence_description TEXT,
    file_path VARCHAR(500),

    -- Standard audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID
);

-- Risks → Risk Assessments → Risk Treatments
CREATE TABLE IF NOT EXISTS risks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    risk_title VARCHAR(255) NOT NULL,
    risk_description TEXT,
    risk_category VARCHAR(100),
    inherent_risk_level VARCHAR(50),

    -- Standard audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID
);

CREATE TABLE IF NOT EXISTS risk_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    risk_id UUID NOT NULL REFERENCES risks(id),
    assessment_date DATE DEFAULT CURRENT_DATE,
    likelihood_score INTEGER,
    impact_score INTEGER,
    risk_score INTEGER,

    -- Standard audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID
);

CREATE TABLE IF NOT EXISTS risk_treatments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    risk_id UUID NOT NULL REFERENCES risks(id),
    treatment_type VARCHAR(50), -- accept, avoid, mitigate, transfer
    treatment_description TEXT,
    treatment_status VARCHAR(50) DEFAULT 'planned',

    -- Standard audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID
);

-- ==========================================
-- 7. CREATE INDEXES FOR PERFORMANCE
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_organizations_tenant_id ON organizations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_assessments_tenant_id ON assessments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_grc_frameworks_tenant_id ON grc_frameworks(tenant_id);
CREATE INDEX IF NOT EXISTS idx_grc_controls_tenant_id ON grc_controls(tenant_id);

-- ==========================================
-- 8. VALIDATION QUERIES
-- ==========================================

-- Verify all tables have tenant_id
SELECT
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE column_name = 'tenant_id'
AND table_schema = 'public'
ORDER BY table_name;

-- Verify all records have tenant_id populated
SELECT 'organizations' as table_name, COUNT(*) as total, COUNT(tenant_id) as with_tenant
FROM organizations
UNION ALL
SELECT 'users', COUNT(*), COUNT(tenant_id) FROM users
UNION ALL
SELECT 'assessments', COUNT(*), COUNT(tenant_id) FROM assessments;
