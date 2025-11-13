-- ==========================================
-- 🏢 ENTERPRISE TENANT ISOLATION SCHEMA
-- ==========================================
-- Advanced multi-tenant architecture for KSA market leadership
-- Implements true tenant isolation with PDPL/SAMA compliance

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==========================================
-- 🏛️ TENANT MANAGEMENT CORE
-- ==========================================

-- Tenants (Master tenant registry)
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Tenant Identity
    tenant_code VARCHAR(50) UNIQUE NOT NULL, -- e.g., 'ARAMCO', 'STC', 'SABIC'
    name VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255),
    display_name VARCHAR(255),
    
    -- Business Information
    industry VARCHAR(100),
    sector VARCHAR(100), -- Banking, Healthcare, Government, etc.
    cr_number VARCHAR(50), -- Commercial Registration Number (KSA)
    tax_number VARCHAR(50), -- VAT Number (KSA)
    
    -- Contact & Location
    primary_contact_email VARCHAR(255) NOT NULL,
    primary_contact_phone VARCHAR(50),
    headquarters_address TEXT,
    headquarters_address_ar TEXT,
    city VARCHAR(100) DEFAULT 'Riyadh',
    country VARCHAR(100) DEFAULT 'Saudi Arabia',
    
    -- Tenant Configuration
    tenant_type VARCHAR(50) DEFAULT 'enterprise', -- enterprise, government, sme
    subscription_tier VARCHAR(50) DEFAULT 'standard', -- basic, standard, premium, enterprise
    max_users INTEGER DEFAULT 100,
    max_assessments INTEGER DEFAULT 50,
    max_storage_gb INTEGER DEFAULT 10,
    
    -- Data Residency & Compliance (PDPL/SAMA)
    data_residency_region VARCHAR(50) DEFAULT 'saudi_arabia',
    data_classification VARCHAR(50) DEFAULT 'confidential',
    retention_policy_days INTEGER DEFAULT 2555, -- 7 years for SAMA
    encryption_required BOOLEAN DEFAULT true,
    audit_level VARCHAR(20) DEFAULT 'full', -- basic, standard, full
    
    -- Tenant Status & Lifecycle
    status VARCHAR(50) DEFAULT 'provisioning', -- provisioning, active, suspended, terminated
    provisioning_status VARCHAR(50) DEFAULT 'pending',
    activation_date DATE,
    suspension_date DATE,
    termination_date DATE,
    
    -- Billing & Commercial
    billing_contact_email VARCHAR(255),
    billing_address TEXT,
    payment_terms INTEGER DEFAULT 30, -- days
    currency VARCHAR(3) DEFAULT 'SAR',
    
    -- Technical Configuration
    subdomain VARCHAR(100) UNIQUE, -- e.g., 'aramco.grc-platform.sa'
    custom_domain VARCHAR(255), -- e.g., 'grc.aramco.com'
    database_schema VARCHAR(100), -- Dedicated schema name
    storage_path VARCHAR(500), -- Dedicated file storage path
    
    -- SSO Configuration
    sso_enabled BOOLEAN DEFAULT false,
    sso_provider VARCHAR(50), -- azure_ad, adfs, okta, etc.
    sso_metadata JSONB DEFAULT '{}',
    
    -- Branding & Customization
    logo_url VARCHAR(500),
    primary_color VARCHAR(7), -- Hex color
    secondary_color VARCHAR(7),
    custom_css TEXT,
    
    -- Compliance & Audit
    created_by UUID,
    approved_by UUID,
    approved_at TIMESTAMP,
    last_compliance_check TIMESTAMP,
    compliance_status VARCHAR(50) DEFAULT 'pending',
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT chk_tenant_type CHECK (tenant_type IN ('enterprise', 'government', 'sme', 'startup')),
    CONSTRAINT chk_subscription_tier CHECK (subscription_tier IN ('basic', 'standard', 'premium', 'enterprise', 'government')),
    CONSTRAINT chk_tenant_status CHECK (status IN ('provisioning', 'active', 'suspended', 'terminated', 'pending_approval')),
    CONSTRAINT chk_data_residency CHECK (data_residency_region IN ('saudi_arabia', 'gcc', 'mena')),
    CONSTRAINT chk_audit_level CHECK (audit_level IN ('basic', 'standard', 'full', 'regulatory'))
);

-- Tenant Schemas (Database schema isolation)
CREATE TABLE tenant_schemas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    schema_name VARCHAR(100) UNIQUE NOT NULL,
    schema_type VARCHAR(50) DEFAULT 'dedicated', -- shared, dedicated, hybrid
    database_name VARCHAR(100),
    connection_string_encrypted TEXT, -- Encrypted connection details
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_schema_type CHECK (schema_type IN ('shared', 'dedicated', 'hybrid'))
);

-- Tenant Features (Feature flags per tenant)
CREATE TABLE tenant_features (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    feature_code VARCHAR(100) NOT NULL,
    is_enabled BOOLEAN DEFAULT false,
    configuration JSONB DEFAULT '{}',
    enabled_at TIMESTAMP,
    enabled_by UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(tenant_id, feature_code)
);

-- Tenant Quotas & Limits
CREATE TABLE tenant_quotas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    quota_type VARCHAR(50) NOT NULL,
    quota_limit INTEGER NOT NULL,
    current_usage INTEGER DEFAULT 0,
    last_reset_date DATE DEFAULT CURRENT_DATE,
    reset_frequency VARCHAR(20) DEFAULT 'monthly', -- daily, weekly, monthly, yearly
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(tenant_id, quota_type),
    CONSTRAINT chk_quota_type CHECK (quota_type IN ('users', 'assessments', 'storage_gb', 'api_calls', 'reports')),
    CONSTRAINT chk_reset_frequency CHECK (reset_frequency IN ('daily', 'weekly', 'monthly', 'yearly', 'never'))
);

-- ==========================================
-- 🔐 ENHANCED USER MANAGEMENT WITH TENANT ISOLATION
-- ==========================================

-- Enhanced Users table with tenant isolation
DROP TABLE IF EXISTS users CASCADE;
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Identity
    email VARCHAR(255) NOT NULL,
    username VARCHAR(100),
    employee_id VARCHAR(100), -- Company employee ID
    
    -- Authentication
    password_hash VARCHAR(255),
    auth_provider VARCHAR(50) DEFAULT 'local', -- local, azure_ad, adfs, okta
    external_id VARCHAR(255), -- ID from external auth provider
    
    -- Personal Information
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    first_name_ar VARCHAR(100),
    last_name_ar VARCHAR(100),
    phone VARCHAR(50),
    department VARCHAR(100),
    job_title VARCHAR(100),
    
    -- Authorization
    role VARCHAR(50) DEFAULT 'viewer',
    permissions JSONB DEFAULT '[]',
    tenant_permissions JSONB DEFAULT '{}', -- Tenant-specific permissions
    
    -- Status & Lifecycle
    status VARCHAR(20) DEFAULT 'active',
    is_tenant_admin BOOLEAN DEFAULT false,
    
    -- Authentication Security
    failed_login_attempts INTEGER DEFAULT 0,
    account_locked_until TIMESTAMP,
    last_login TIMESTAMP,
    password_expires_at TIMESTAMP,
    must_change_password BOOLEAN DEFAULT false,
    
    -- MFA Support
    mfa_enabled BOOLEAN DEFAULT false,
    mfa_secret VARCHAR(32),
    mfa_backup_codes TEXT,
    
    -- Session Management
    session_token VARCHAR(255),
    session_expires_at TIMESTAMP,
    max_concurrent_sessions INTEGER DEFAULT 3,
    
    -- PDPL Compliance
    data_processing_consent BOOLEAN DEFAULT false,
    consent_date TIMESTAMP,
    data_retention_consent BOOLEAN DEFAULT false,
    marketing_consent BOOLEAN DEFAULT false,
    
    -- Audit fields
    created_by UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_activity_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    UNIQUE(tenant_id, email),
    UNIQUE(tenant_id, username),
    CONSTRAINT chk_auth_provider CHECK (auth_provider IN ('local', 'azure_ad', 'adfs', 'okta', 'saml')),
    CONSTRAINT chk_user_status CHECK (status IN ('active', 'inactive', 'suspended', 'pending_activation', 'terminated'))
);

-- ==========================================
-- 🔍 COMPREHENSIVE AUDIT SYSTEM (PDPL/SAMA Compliance)
-- ==========================================

-- Audit Log (Comprehensive activity tracking)
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Event Information
    event_type VARCHAR(100) NOT NULL,
    event_category VARCHAR(50) NOT NULL, -- authentication, data_access, data_modification, system, compliance
    event_action VARCHAR(100) NOT NULL,
    event_description TEXT,
    
    -- Actor Information
    user_id UUID REFERENCES users(id),
    user_email VARCHAR(255),
    user_role VARCHAR(50),
    session_id VARCHAR(255),
    
    -- Target Information
    resource_type VARCHAR(100), -- user, assessment, organization, etc.
    resource_id UUID,
    resource_name VARCHAR(255),
    
    -- Technical Details
    ip_address INET,
    user_agent TEXT,
    request_method VARCHAR(10),
    request_url TEXT,
    response_status INTEGER,
    
    -- Data Changes (for PDPL compliance)
    old_values JSONB,
    new_values JSONB,
    sensitive_data_accessed BOOLEAN DEFAULT false,
    
    -- Compliance & Risk
    risk_level VARCHAR(20) DEFAULT 'low', -- low, medium, high, critical
    compliance_tags JSONB DEFAULT '[]', -- ['PDPL', 'SAMA', 'ISO27001']
    
    -- Geolocation & Context
    country VARCHAR(100),
    city VARCHAR(100),
    timezone VARCHAR(50),
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT chk_event_category CHECK (event_category IN ('authentication', 'data_access', 'data_modification', 'system', 'compliance', 'security')),
    CONSTRAINT chk_risk_level CHECK (risk_level IN ('low', 'medium', 'high', 'critical'))
);

-- Data Processing Log (PDPL Article 22 compliance)
CREATE TABLE data_processing_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Processing Details
    processing_purpose VARCHAR(255) NOT NULL,
    legal_basis VARCHAR(100) NOT NULL, -- consent, contract, legal_obligation, etc.
    data_categories JSONB NOT NULL, -- ['personal_identifiers', 'financial_data', etc.]
    data_subjects_count INTEGER,
    
    -- Data Controller/Processor
    controller_name VARCHAR(255),
    processor_name VARCHAR(255),
    dpo_contact VARCHAR(255),
    
    -- Processing Period
    processing_start_date DATE NOT NULL,
    processing_end_date DATE,
    retention_period_days INTEGER,
    
    -- Data Transfers
    third_country_transfers BOOLEAN DEFAULT false,
    transfer_safeguards TEXT,
    
    -- Security Measures
    technical_measures JSONB DEFAULT '[]',
    organizational_measures JSONB DEFAULT '[]',
    
    -- Compliance
    impact_assessment_required BOOLEAN DEFAULT false,
    impact_assessment_date DATE,
    
    -- Metadata
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_legal_basis CHECK (legal_basis IN ('consent', 'contract', 'legal_obligation', 'vital_interests', 'public_task', 'legitimate_interests'))
);

-- ==========================================
-- 🔒 TENANT-AWARE ORGANIZATIONS (Updated)
-- ==========================================

-- Enhanced Organizations with tenant isolation
DROP TABLE IF EXISTS organizations CASCADE;
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Organization Identity
    name VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255),
    description TEXT,
    description_ar TEXT,
    
    -- Business Information
    industry VARCHAR(100),
    sector VARCHAR(100),
    organization_type VARCHAR(50) DEFAULT 'department', -- department, subsidiary, division, external
    
    -- Hierarchy
    parent_organization_id UUID REFERENCES organizations(id),
    organization_level INTEGER DEFAULT 1,
    organization_path TEXT, -- Materialized path for hierarchy
    
    -- Location
    country VARCHAR(100) DEFAULT 'Saudi Arabia',
    city VARCHAR(100),
    address TEXT,
    address_ar TEXT,
    
    -- Contact Information
    primary_contact_email VARCHAR(255),
    primary_contact_phone VARCHAR(50),
    website VARCHAR(255),
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    status VARCHAR(50) DEFAULT 'active',
    
    -- Compliance
    compliance_requirements JSONB DEFAULT '[]', -- ['SAMA', 'PDPL', 'ISO27001']
    risk_classification VARCHAR(50) DEFAULT 'medium',
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    UNIQUE(tenant_id, name),
    CONSTRAINT chk_org_type CHECK (organization_type IN ('department', 'subsidiary', 'division', 'external', 'vendor')),
    CONSTRAINT chk_org_status CHECK (status IN ('active', 'inactive', 'suspended', 'archived')),
    CONSTRAINT chk_risk_classification CHECK (risk_classification IN ('low', 'medium', 'high', 'critical'))
);

-- ==========================================
-- 📊 TENANT-AWARE ASSESSMENTS (Updated)
-- ==========================================

-- Enhanced Assessments with tenant isolation
DROP TABLE IF EXISTS assessments CASCADE;
CREATE TABLE assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    framework_id UUID NOT NULL,
    template_id UUID,
    
    -- Assessment Identity
    name VARCHAR(255) NOT NULL,
    description TEXT,
    assessment_code VARCHAR(100), -- Tenant-specific assessment code
    
    -- Assessment Configuration
    type VARCHAR(50) DEFAULT 'internal',
    methodology VARCHAR(50) DEFAULT 'self_assessment',
    scope TEXT,
    
    -- Status & Lifecycle
    status VARCHAR(50) DEFAULT 'not_started',
    priority VARCHAR(20) DEFAULT 'medium',
    
    -- Scheduling
    start_date DATE,
    due_date DATE,
    completion_date DATE,
    
    -- Progress & Scoring
    completion_percentage INTEGER DEFAULT 0,
    compliance_score DECIMAL(5,2),
    risk_score DECIMAL(5,2),
    maturity_level INTEGER,
    
    -- Assignment
    assigned_to UUID REFERENCES users(id),
    assessment_team JSONB DEFAULT '[]', -- Array of user IDs
    
    -- Approval Workflow
    requires_approval BOOLEAN DEFAULT false,
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP,
    approval_comments TEXT,
    
    -- Compliance & Regulatory
    regulatory_requirements JSONB DEFAULT '[]', -- ['SAMA', 'PDPL', etc.]
    compliance_deadline DATE,
    regulatory_submission_required BOOLEAN DEFAULT false,
    
    -- Data Classification (PDPL)
    data_classification VARCHAR(50) DEFAULT 'internal',
    contains_personal_data BOOLEAN DEFAULT false,
    personal_data_categories JSONB DEFAULT '[]',
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    UNIQUE(tenant_id, assessment_code),
    CONSTRAINT chk_assessment_type CHECK (type IN ('internal', 'external', 'regulatory', 'vendor', 'third_party')),
    CONSTRAINT chk_assessment_methodology CHECK (methodology IN ('self_assessment', 'external_audit', 'penetration_test', 'compliance_review')),
    CONSTRAINT chk_assessment_status CHECK (status IN ('not_started', 'in_progress', 'under_review', 'completed', 'approved', 'rejected', 'archived')),
    CONSTRAINT chk_assessment_priority CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    CONSTRAINT chk_data_classification CHECK (data_classification IN ('public', 'internal', 'confidential', 'restricted'))
);

-- ==========================================
-- 🔍 INDEXES FOR PERFORMANCE
-- ==========================================

-- Tenant isolation indexes
CREATE INDEX idx_users_tenant_email ON users(tenant_id, email);
CREATE INDEX idx_users_tenant_status ON users(tenant_id, status) WHERE status = 'active';
CREATE INDEX idx_organizations_tenant ON organizations(tenant_id) WHERE is_active = true;
CREATE INDEX idx_assessments_tenant_status ON assessments(tenant_id, status);
CREATE INDEX idx_audit_log_tenant_date ON audit_log(tenant_id, created_at DESC);
CREATE INDEX idx_audit_log_user_date ON audit_log(user_id, created_at DESC) WHERE user_id IS NOT NULL;

-- Compliance indexes
CREATE INDEX idx_audit_log_compliance ON audit_log USING GIN(compliance_tags);
CREATE INDEX idx_audit_log_sensitive_data ON audit_log(tenant_id, created_at DESC) WHERE sensitive_data_accessed = true;
CREATE INDEX idx_data_processing_tenant ON data_processing_log(tenant_id, processing_start_date DESC);

-- Performance indexes
CREATE INDEX idx_tenants_status ON tenants(status) WHERE status = 'active';
CREATE INDEX idx_tenants_subdomain ON tenants(subdomain) WHERE subdomain IS NOT NULL;
CREATE INDEX idx_tenant_quotas_usage ON tenant_quotas(tenant_id, quota_type, current_usage);

-- ==========================================
-- 🔒 ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Enable RLS on all tenant-aware tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies (to be implemented with application-level tenant context)
-- These will be activated when the application sets the tenant context

-- Example policy for users table
CREATE POLICY tenant_isolation_users ON users
    FOR ALL
    TO application_role
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- Example policy for organizations table
CREATE POLICY tenant_isolation_organizations ON organizations
    FOR ALL
    TO application_role
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- ==========================================
-- 🎯 TENANT CONTEXT FUNCTIONS
-- ==========================================

-- Function to set tenant context
CREATE OR REPLACE FUNCTION set_tenant_context(p_tenant_id UUID)
RETURNS void AS $$
BEGIN
    PERFORM set_config('app.current_tenant_id', p_tenant_id::text, true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get current tenant context
CREATE OR REPLACE FUNCTION get_current_tenant_id()
RETURNS UUID AS $$
BEGIN
    RETURN current_setting('app.current_tenant_id', true)::UUID;
EXCEPTION
    WHEN OTHERS THEN
        RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- 📝 COMMENTS FOR DOCUMENTATION
-- ==========================================

COMMENT ON TABLE tenants IS 'Master tenant registry with enterprise-grade isolation and compliance features';
COMMENT ON TABLE users IS 'Enhanced user management with tenant isolation and PDPL compliance';
COMMENT ON TABLE audit_log IS 'Comprehensive audit trail for PDPL/SAMA compliance';
COMMENT ON TABLE data_processing_log IS 'PDPL Article 22 compliance - record of processing activities';
COMMENT ON TABLE tenant_quotas IS 'Tenant resource quotas and usage tracking';
COMMENT ON TABLE tenant_features IS 'Feature flags and configuration per tenant';