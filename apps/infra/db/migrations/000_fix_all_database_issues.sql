-- ============================================================================
-- FIX ALL DATABASE ISSUES
-- Complete database setup and schema fixes
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. CREATE TENANTS TABLE (if not exists)
-- ============================================================================
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    display_name VARCHAR(255),
    sector VARCHAR(100),
    industry VARCHAR(100),
    country VARCHAR(100) DEFAULT 'Saudi Arabia',
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    subscription_tier VARCHAR(50) DEFAULT 'basic',
    max_users INTEGER DEFAULT 10,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 2. CREATE USERS TABLE (if not exists)
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100),
    password_hash VARCHAR(255),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(50) DEFAULT 'user',
    status VARCHAR(50) DEFAULT 'active',
    last_login TIMESTAMP,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 3. CREATE ORGANIZATIONS TABLE (if not exists)
-- ============================================================================
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    sector VARCHAR(100),
    industry VARCHAR(100),
    size_category VARCHAR(50),
    country VARCHAR(100) DEFAULT 'Saudi Arabia',
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 4. CREATE GRC FRAMEWORKS TABLE (if not exists)
-- ============================================================================
CREATE TABLE IF NOT EXISTS grc_frameworks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    version VARCHAR(50),
    description TEXT,
    sector_applicability TEXT[],
    complexity_level INTEGER DEFAULT 3,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 5. CREATE GRC CONTROLS TABLE (if not exists)
-- ============================================================================
CREATE TABLE IF NOT EXISTS grc_controls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    framework_id UUID REFERENCES grc_frameworks(id) ON DELETE CASCADE,
    control_id VARCHAR(50) NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    control_type VARCHAR(100),
    priority_level VARCHAR(50),
    implementation_guidance TEXT,
    testing_procedures TEXT,
    sector_specific_notes TEXT,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 6. CREATE ASSESSMENTS TABLE (if not exists)
-- ============================================================================
CREATE TABLE IF NOT EXISTS assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    assessment_type VARCHAR(100) DEFAULT 'compliance',
    priority VARCHAR(50) DEFAULT 'medium',
    status VARCHAR(50) DEFAULT 'draft',
    estimated_duration_hours INTEGER,
    complexity_level VARCHAR(50),
    ai_generated BOOLEAN DEFAULT false,
    ai_generation_metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- ============================================================================
-- 7. CREATE ASSESSMENT SECTIONS TABLE (if not exists)
-- ============================================================================
CREATE TABLE IF NOT EXISTS assessment_sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    order_index INTEGER DEFAULT 0,
    section_data JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 8. CREATE ASSESSMENT RESPONSES TABLE (if not exists)
-- ============================================================================
CREATE TABLE IF NOT EXISTS assessment_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
    control_id UUID REFERENCES grc_controls(id),
    question_text TEXT,
    response_type VARCHAR(50) DEFAULT 'text',
    response_value TEXT,
    compliance_score DECIMAL(5,2) DEFAULT 0.00,
    is_required BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    ai_generated_question BOOLEAN DEFAULT false,
    ai_predicted_score DECIMAL(5,2),
    ai_prediction_confidence DECIMAL(3,2),
    ai_prediction_metadata JSONB,
    estimated_completion_minutes INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 9. CREATE ASSESSMENT TEMPLATES TABLE (if not exists)
-- ============================================================================
CREATE TABLE IF NOT EXISTS assessment_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
    template_name VARCHAR(255),
    template_version VARCHAR(50),
    framework_id UUID REFERENCES grc_frameworks(id),
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 10. CREATE ASSESSMENT EVIDENCE TABLE (if not exists)
-- ============================================================================
CREATE TABLE IF NOT EXISTS assessment_evidence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
    response_id UUID REFERENCES assessment_responses(id) ON DELETE CASCADE,
    evidence_type VARCHAR(100),
    description TEXT,
    file_path VARCHAR(500),
    file_name VARCHAR(255),
    file_size BIGINT,
    mime_type VARCHAR(100),
    is_required BOOLEAN DEFAULT false,
    ai_generated BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 11. CREATE REGULATOR COMPLIANCE TABLE (Auto Assessment)
-- ============================================================================
CREATE TABLE IF NOT EXISTS regulator_compliance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    regulator_code VARCHAR(20) NOT NULL,
    regulator_name VARCHAR(200) NOT NULL,
    compliance_status VARCHAR(50) DEFAULT 'pending',
    priority_level VARCHAR(20) DEFAULT 'medium',
    compliance_score DECIMAL(5,2) DEFAULT 0.00,
    last_assessment_date TIMESTAMP,
    next_review_date TIMESTAMP,
    notes TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 12. CREATE SECTOR CONTROLS TABLE (if not exists)
-- ============================================================================
CREATE TABLE IF NOT EXISTS sector_controls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    control_id UUID REFERENCES grc_controls(id) ON DELETE CASCADE,
    sector VARCHAR(100) NOT NULL,
    applicability_score INTEGER DEFAULT 50,
    implementation_complexity VARCHAR(50) DEFAULT 'medium',
    sector_specific_guidance TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

-- Tenants indexes
CREATE INDEX IF NOT EXISTS idx_tenants_sector ON tenants(sector);
CREATE INDEX IF NOT EXISTS idx_tenants_active ON tenants(is_active);

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_tenant ON users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Organizations indexes
CREATE INDEX IF NOT EXISTS idx_organizations_tenant ON organizations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_organizations_sector ON organizations(sector);

-- Assessments indexes
CREATE INDEX IF NOT EXISTS idx_assessments_tenant ON assessments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_assessments_organization ON assessments(organization_id);
CREATE INDEX IF NOT EXISTS idx_assessments_status ON assessments(status);

-- Assessment responses indexes
CREATE INDEX IF NOT EXISTS idx_assessment_responses_assessment ON assessment_responses(assessment_id);
CREATE INDEX IF NOT EXISTS idx_assessment_responses_control ON assessment_responses(control_id);

-- GRC Controls indexes
CREATE INDEX IF NOT EXISTS idx_grc_controls_framework ON grc_controls(framework_id);
CREATE INDEX IF NOT EXISTS idx_grc_controls_type ON grc_controls(control_type);

-- Regulator compliance indexes
CREATE INDEX IF NOT EXISTS idx_regulator_compliance_assessment ON regulator_compliance(assessment_id);
CREATE INDEX IF NOT EXISTS idx_regulator_compliance_tenant ON regulator_compliance(tenant_id);
CREATE INDEX IF NOT EXISTS idx_regulator_compliance_regulator ON regulator_compliance(regulator_code);
CREATE INDEX IF NOT EXISTS idx_regulator_compliance_status ON regulator_compliance(compliance_status);

-- Sector controls indexes
CREATE INDEX IF NOT EXISTS idx_sector_controls_control ON sector_controls(control_id);
CREATE INDEX IF NOT EXISTS idx_sector_controls_sector ON sector_controls(sector);

-- ============================================================================
-- CREATE UPDATE TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to tables with updated_at columns
DROP TRIGGER IF EXISTS update_tenants_updated_at ON tenants;
CREATE TRIGGER update_tenants_updated_at
    BEFORE UPDATE ON tenants
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_organizations_updated_at ON organizations;
CREATE TRIGGER update_organizations_updated_at
    BEFORE UPDATE ON organizations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_assessments_updated_at ON assessments;
CREATE TRIGGER update_assessments_updated_at
    BEFORE UPDATE ON assessments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_assessment_sections_updated_at ON assessment_sections;
CREATE TRIGGER update_assessment_sections_updated_at
    BEFORE UPDATE ON assessment_sections
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_assessment_responses_updated_at ON assessment_responses;
CREATE TRIGGER update_assessment_responses_updated_at
    BEFORE UPDATE ON assessment_responses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_regulator_compliance_updated_at ON regulator_compliance;
CREATE TRIGGER update_regulator_compliance_updated_at
    BEFORE UPDATE ON regulator_compliance
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- INSERT SAMPLE DATA
-- ============================================================================

-- Sample tenants
INSERT INTO tenants (tenant_code, name, sector, industry, email) VALUES
('acme-corp', 'Acme Corporation', 'finance', 'banking', 'info@acmecorp.com'),
('techstart', 'TechStart Inc', 'technology', 'software', 'contact@techstart.io'),
('global-health', 'Global Health Solutions', 'healthcare', 'hospital', 'admin@globalhealth.com')
ON CONFLICT (tenant_code) DO NOTHING;

-- Sample organizations
INSERT INTO organizations (tenant_id, name, sector, industry, size_category)
SELECT t.id, t.name, t.sector, t.industry, 'medium'
FROM tenants t
WHERE NOT EXISTS (
    SELECT 1 FROM organizations o WHERE o.tenant_id = t.id
);

-- Sample GRC frameworks
INSERT INTO grc_frameworks (name, version, description, sector_applicability) VALUES
('SAMA Cybersecurity Framework', '2.0', 'Saudi Arabian Monetary Authority Cybersecurity Framework', ARRAY['finance', 'banking']),
('NCA Cybersecurity Framework', '1.0', 'National Cybersecurity Authority Framework', ARRAY['government', 'finance', 'healthcare']),
('ISO 27001', '2013', 'Information Security Management System', ARRAY['technology', 'finance', 'healthcare']),
('NIST Cybersecurity Framework', '1.1', 'National Institute of Standards and Technology Framework', ARRAY['government', 'technology'])
ON CONFLICT DO NOTHING;

-- Sample GRC controls
INSERT INTO grc_controls (framework_id, control_id, title, description, control_type, priority_level)
SELECT 
    f.id,
    'AC-1',
    'Access Control Policy and Procedures',
    'Develop, document, and disseminate access control policy and procedures',
    'policy',
    'high'
FROM grc_frameworks f
WHERE f.name = 'SAMA Cybersecurity Framework'
AND NOT EXISTS (
    SELECT 1 FROM grc_controls c 
    WHERE c.framework_id = f.id AND c.control_id = 'AC-1'
);

-- ============================================================================
-- VERIFY SETUP
-- ============================================================================

-- Check table counts
SELECT 
    'tenants' as table_name, COUNT(*) as record_count FROM tenants
UNION ALL
SELECT 
    'organizations' as table_name, COUNT(*) as record_count FROM organizations
UNION ALL
SELECT 
    'grc_frameworks' as table_name, COUNT(*) as record_count FROM grc_frameworks
UNION ALL
SELECT 
    'grc_controls' as table_name, COUNT(*) as record_count FROM grc_controls
ORDER BY table_name;

COMMIT;
