-- =====================================================
-- UNIFIED GRC MASTER DATABASE SCHEMA
-- Complete schema for all services with tenant isolation
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =====================================================
-- CORE TENANT & USER MANAGEMENT
-- =====================================================

CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(255) UNIQUE NOT NULL,
    subscription_plan VARCHAR(50) DEFAULT 'basic',
    status VARCHAR(20) DEFAULT 'active',
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(50) DEFAULT 'user',
    permissions JSONB DEFAULT '[]',
    status VARCHAR(20) DEFAULT 'active',
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- REGULATORY INTELLIGENCE & SCRAPING
-- =====================================================

CREATE TABLE regulatory_authorities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(20) UNIQUE NOT NULL, -- SAMA, NCA, MOH, etc.
    name VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255),
    base_url VARCHAR(500),
    scraper_config JSONB DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'active',
    last_scraped TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE regulatory_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    authority_id UUID NOT NULL REFERENCES regulatory_authorities(id),
    title VARCHAR(500) NOT NULL,
    title_ar VARCHAR(500),
    document_type VARCHAR(100), -- regulation, circular, guideline
    document_number VARCHAR(100),
    url VARCHAR(1000),
    content TEXT,
    content_ar TEXT,
    effective_date DATE,
    status VARCHAR(50) DEFAULT 'active',
    impact_level VARCHAR(20) DEFAULT 'medium', -- low, medium, high, critical
    sectors JSONB DEFAULT '[]', -- applicable sectors
    keywords JSONB DEFAULT '[]',
    scraped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE regulatory_changes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    document_id UUID NOT NULL REFERENCES regulatory_documents(id),
    change_type VARCHAR(50), -- new, updated, amended, revoked
    change_summary TEXT,
    change_summary_ar TEXT,
    impact_assessment TEXT,
    compliance_deadline DATE,
    status VARCHAR(20) DEFAULT 'pending', -- pending, reviewed, implemented
    assigned_to UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE regulatory_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    document_id UUID REFERENCES regulatory_documents(id),
    alert_type VARCHAR(50), -- deadline, new_regulation, update
    title VARCHAR(255) NOT NULL,
    title_ar VARCHAR(255),
    message TEXT,
    message_ar TEXT,
    priority VARCHAR(20) DEFAULT 'medium',
    status VARCHAR(20) DEFAULT 'active',
    target_users JSONB DEFAULT '[]', -- user IDs or roles
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- SCRAPING ORCHESTRATION
-- =====================================================

CREATE TABLE scraping_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    authority_id UUID NOT NULL REFERENCES regulatory_authorities(id),
    job_type VARCHAR(50) DEFAULT 'scheduled', -- scheduled, manual, emergency
    status VARCHAR(20) DEFAULT 'pending', -- pending, running, completed, failed
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    documents_found INTEGER DEFAULT 0,
    documents_new INTEGER DEFAULT 0,
    documents_updated INTEGER DEFAULT 0,
    error_message TEXT,
    execution_time_ms INTEGER,
    next_run TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE scraping_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES scraping_jobs(id) ON DELETE CASCADE,
    level VARCHAR(20) DEFAULT 'info', -- debug, info, warn, error
    message TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- COMPLIANCE & ASSESSMENTS
-- =====================================================

CREATE TABLE frameworks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255),
    description TEXT,
    version VARCHAR(50),
    framework_type VARCHAR(100), -- ISO27001, SOX, GDPR, etc.
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE controls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    framework_id UUID NOT NULL REFERENCES frameworks(id) ON DELETE CASCADE,
    control_id VARCHAR(100) NOT NULL, -- A.5.1.1, etc.
    title VARCHAR(500) NOT NULL,
    title_ar VARCHAR(500),
    description TEXT,
    description_ar TEXT,
    control_type VARCHAR(100),
    maturity_level INTEGER DEFAULT 1,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    framework_id UUID NOT NULL REFERENCES frameworks(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'draft', -- draft, in_progress, completed, approved
    assigned_to UUID REFERENCES users(id),
    due_date DATE,
    completion_percentage DECIMAL(5,2) DEFAULT 0,
    overall_score DECIMAL(5,2),
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE assessment_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    control_id UUID NOT NULL REFERENCES controls(id),
    response_value VARCHAR(100), -- yes, no, partial, na
    evidence TEXT,
    comments TEXT,
    score DECIMAL(5,2),
    status VARCHAR(20) DEFAULT 'pending',
    responded_by UUID REFERENCES users(id),
    responded_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- RISK MANAGEMENT
-- =====================================================

CREATE TABLE risks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    likelihood INTEGER CHECK (likelihood BETWEEN 1 AND 5),
    impact INTEGER CHECK (impact BETWEEN 1 AND 5),
    risk_score INTEGER GENERATED ALWAYS AS (likelihood * impact) STORED,
    status VARCHAR(50) DEFAULT 'open',
    owner_id UUID REFERENCES users(id),
    mitigation_plan TEXT,
    target_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- WORKFLOW & APPROVALS
-- =====================================================

CREATE TABLE workflow_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    workflow_type VARCHAR(100), -- assessment, risk, document
    steps JSONB NOT NULL, -- workflow step definitions
    approval_matrix JSONB NOT NULL, -- role-based approvals
    auto_assign_rules JSONB DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'active',
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE workflows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    template_id UUID NOT NULL REFERENCES workflow_templates(id),
    entity_type VARCHAR(100), -- assessment, risk, document
    entity_id UUID NOT NULL,
    current_step INTEGER DEFAULT 1,
    current_assignee_id UUID REFERENCES users(id),
    status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected, completed
    data JSONB DEFAULT '{}',
    started_by UUID NOT NULL REFERENCES users(id),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE workflow_approvals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
    step_number INTEGER NOT NULL,
    approver_id UUID NOT NULL REFERENCES users(id),
    required_role VARCHAR(100),
    status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
    comments TEXT,
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- FINANCE & BILLING
-- =====================================================

CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    plan_name VARCHAR(100) NOT NULL,
    billing_cycle VARCHAR(20) DEFAULT 'monthly', -- monthly, yearly
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(20) DEFAULT 'active',
    current_period_start DATE NOT NULL,
    current_period_end DATE NOT NULL,
    auto_renew BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    subscription_id UUID NOT NULL REFERENCES subscriptions(id),
    invoice_number VARCHAR(100) UNIQUE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- pending, paid, overdue, cancelled
    due_date DATE NOT NULL,
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- SYSTEM MANAGEMENT
-- =====================================================

CREATE TABLE system_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    version VARCHAR(50) NOT NULL,
    release_date DATE NOT NULL,
    description TEXT,
    changelog TEXT,
    is_current BOOLEAN DEFAULT false,
    is_critical BOOLEAN DEFAULT false,
    download_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE tenant_system_status (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    current_version VARCHAR(50),
    latest_version VARCHAR(50),
    update_available BOOLEAN DEFAULT false,
    update_status VARCHAR(20) DEFAULT 'current', -- current, available, updating, failed
    last_update_check TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- LEGAL & COMPLIANCE NOTICES
-- =====================================================

CREATE TABLE legal_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_type VARCHAR(50) NOT NULL, -- terms, privacy, disclaimer, cookie
    title VARCHAR(255) NOT NULL,
    title_ar VARCHAR(255),
    content TEXT NOT NULL,
    content_ar TEXT,
    version VARCHAR(20) NOT NULL,
    effective_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE tenant_legal_acceptances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    document_id UUID NOT NULL REFERENCES legal_documents(id),
    accepted_version VARCHAR(20) NOT NULL,
    accepted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT
);

-- =====================================================
-- CACHING & PERFORMANCE
-- =====================================================

CREATE TABLE cache_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cache_key VARCHAR(255) UNIQUE NOT NULL,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    data JSONB NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- AUDIT & LOGGING
-- =====================================================

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100),
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Tenant isolation indexes
CREATE INDEX idx_users_tenant_id ON users(tenant_id);
CREATE INDEX idx_regulatory_documents_tenant_id ON regulatory_documents(tenant_id);
CREATE INDEX idx_assessments_tenant_id ON assessments(tenant_id);
CREATE INDEX idx_workflows_tenant_id ON workflows(tenant_id);
CREATE INDEX idx_audit_logs_tenant_id ON audit_logs(tenant_id);

-- Search and filtering indexes
CREATE INDEX idx_regulatory_documents_title_gin ON regulatory_documents USING gin(to_tsvector('english', title));
CREATE INDEX idx_regulatory_documents_keywords_gin ON regulatory_documents USING gin(keywords);
CREATE INDEX idx_regulatory_documents_sectors_gin ON regulatory_documents USING gin(sectors);
CREATE INDEX idx_regulatory_documents_effective_date ON regulatory_documents(effective_date);
CREATE INDEX idx_regulatory_documents_status ON regulatory_documents(status);

-- Performance indexes
CREATE INDEX idx_scraping_jobs_authority_status ON scraping_jobs(authority_id, status);
CREATE INDEX idx_workflow_approvals_workflow_status ON workflow_approvals(workflow_id, status);
CREATE INDEX idx_cache_entries_expires_at ON cache_entries(expires_at);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on tenant-specific tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE regulatory_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE regulatory_changes ENABLE ROW LEVEL SECURITY;
ALTER TABLE regulatory_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE frameworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE controls ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE risks ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY tenant_isolation_users ON users
    FOR ALL TO authenticated
    USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

CREATE POLICY tenant_isolation_regulatory_documents ON regulatory_documents
    FOR ALL TO authenticated
    USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

CREATE POLICY tenant_isolation_assessments ON assessments
    FOR ALL TO authenticated
    USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

-- =====================================================
-- INITIAL DATA
-- =====================================================

-- Insert regulatory authorities
INSERT INTO regulatory_authorities (code, name, name_ar, base_url, scraper_config) VALUES
('SAMA', 'Saudi Central Bank', 'البنك المركزي السعودي', 'https://www.sama.gov.sa', '{"schedule": "0 */6 * * *", "enabled": true}'),
('NCA', 'National Cybersecurity Authority', 'الهيئة الوطنية للأمن السيبراني', 'https://nca.gov.sa', '{"schedule": "0 */4 * * *", "enabled": true}'),
('MOH', 'Ministry of Health', 'وزارة الصحة', 'https://www.moh.gov.sa', '{"schedule": "0 */6 * * *", "enabled": true}'),
('ZATCA', 'Zakat, Tax and Customs Authority', 'هيئة الزكاة والضريبة والجمارك', 'https://zatca.gov.sa', '{"schedule": "0 */6 * * *", "enabled": true}'),
('SDAIA', 'Saudi Data & AI Authority', 'الهيئة السعودية للبيانات والذكاء الاصطناعي', 'https://sdaia.gov.sa', '{"schedule": "0 */6 * * *", "enabled": true}'),
('CMA', 'Capital Market Authority', 'هيئة السوق المالية', 'https://cma.org.sa', '{"schedule": "0 */6 * * *", "enabled": true}');

-- Insert current system version
INSERT INTO system_versions (version, release_date, description, is_current) VALUES
('1.0.0', CURRENT_DATE, 'Initial GRC Master Platform Release', true);

-- Insert legal documents
INSERT INTO legal_documents (document_type, title, title_ar, content, content_ar, version, effective_date) VALUES
('terms', 'Terms of Service', 'شروط الخدمة', 'Terms of Service content...', 'محتوى شروط الخدمة...', '1.0', CURRENT_DATE),
('privacy', 'Privacy Policy', 'سياسة الخصوصية', 'Privacy Policy content...', 'محتوى سياسة الخصوصية...', '1.0', CURRENT_DATE),
('disclaimer', 'Legal Disclaimer', 'إخلاء المسؤولية القانونية', 'Legal Disclaimer content...', 'محتوى إخلاء المسؤولية...', '1.0', CURRENT_DATE);

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_regulatory_documents_updated_at BEFORE UPDATE ON regulatory_documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assessments_updated_at BEFORE UPDATE ON assessments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_risks_updated_at BEFORE UPDATE ON risks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to set tenant context
CREATE OR REPLACE FUNCTION set_tenant_context(tenant_uuid UUID)
RETURNS void AS $$
BEGIN
    PERFORM set_config('app.current_tenant_id', tenant_uuid::text, true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
