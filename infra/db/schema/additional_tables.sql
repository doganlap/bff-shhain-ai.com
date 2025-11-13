-- ==========================================
-- 🗄️ ADDITIONAL TABLES FOR ENHANCED FUNCTIONALITY
-- ==========================================
-- Additional database tables for workflow, compliance reports, and evidence library

-- ==========================================
-- 🔄 WORKFLOW MANAGEMENT TABLES
-- ==========================================

-- Assessment Workflow table
CREATE TABLE IF NOT EXISTS assessment_workflow (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    workflow_type VARCHAR(50) NOT NULL DEFAULT 'assessment_approval',
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    priority VARCHAR(20) DEFAULT 'medium',
    
    -- Assignment
    assigned_to UUID REFERENCES users(id),
    assigned_by UUID REFERENCES users(id),
    assigned_at TIMESTAMP,
    
    -- Approval workflow
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP,
    approval_comment TEXT,
    
    -- Rejection workflow
    rejected_by UUID REFERENCES users(id),
    rejected_at TIMESTAMP,
    rejection_reason TEXT,
    
    -- Change requests
    change_requested_by UUID REFERENCES users(id),
    change_requested_at TIMESTAMP,
    change_requests JSONB,
    
    -- Timing
    due_date TIMESTAMP,
    completed_at TIMESTAMP,
    
    -- Metadata
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT chk_workflow_type CHECK (workflow_type IN ('assessment_approval', 'evidence_review', 'compliance_review', 'remediation_approval')),
    CONSTRAINT chk_workflow_status CHECK (status IN ('pending', 'assigned', 'in_progress', 'approved', 'rejected', 'changes_requested', 'completed')),
    CONSTRAINT chk_priority CHECK (priority IN ('low', 'medium', 'high', 'critical'))
);

-- Workflow History table
CREATE TABLE IF NOT EXISTS assessment_workflow_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_id UUID NOT NULL REFERENCES assessment_workflow(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL,
    performed_by UUID REFERENCES users(id),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT chk_workflow_action CHECK (action IN ('created', 'assigned', 'approved', 'rejected', 'changes_requested', 'completed', 'cancelled'))
);

-- ==========================================
-- 📊 COMPLIANCE REPORTING TABLES
-- ==========================================

-- Compliance Reports table
CREATE TABLE IF NOT EXISTS compliance_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    
    -- Report details
    report_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'draft',
    format VARCHAR(20) DEFAULT 'pdf',
    
    -- Configuration
    include_evidence BOOLEAN DEFAULT false,
    include_recommendations BOOLEAN DEFAULT true,
    template_id UUID,
    custom_sections JSONB DEFAULT '[]',
    filters JSONB DEFAULT '{}',
    
    -- Generated content
    report_data JSONB,
    file_path VARCHAR(500),
    file_size BIGINT,
    
    -- Workflow
    generated_by UUID REFERENCES users(id),
    generated_at TIMESTAMP,
    submitted_by UUID REFERENCES users(id),
    submitted_at TIMESTAMP,
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP,
    approval_comment TEXT,
    
    -- Error handling
    error_message TEXT,
    
    -- Metadata
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT chk_report_type CHECK (report_type IN ('executive_summary', 'detailed', 'compliance_matrix', 'gap_analysis', 'remediation_plan')),
    CONSTRAINT chk_report_status CHECK (status IN ('draft', 'generating', 'generated', 'failed', 'submitted', 'approved', 'rejected')),
    CONSTRAINT chk_report_format CHECK (format IN ('pdf', 'html', 'excel', 'json'))
);

-- Report Templates table
CREATE TABLE IF NOT EXISTS report_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    report_type VARCHAR(50) NOT NULL,
    template_content JSONB NOT NULL,
    is_default BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 📁 EVIDENCE LIBRARY TABLES
-- ==========================================

-- Evidence Library table
CREATE TABLE IF NOT EXISTS evidence_library (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Evidence details
    title VARCHAR(255) NOT NULL,
    description TEXT,
    evidence_type VARCHAR(50) NOT NULL,
    category VARCHAR(100),
    subcategory VARCHAR(100),
    
    -- File information
    file_name VARCHAR(255),
    file_path VARCHAR(500),
    file_size BIGINT,
    file_type VARCHAR(100),
    file_hash VARCHAR(64), -- SHA-256 hash for integrity
    
    -- External links
    external_url TEXT,
    
    -- Metadata
    tags JSONB DEFAULT '[]',
    is_confidential BOOLEAN DEFAULT false,
    retention_period INTEGER, -- in days
    
    -- Status and workflow
    status VARCHAR(20) DEFAULT 'active',
    uploaded_by UUID REFERENCES users(id),
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Audit fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT chk_evidence_type CHECK (evidence_type IN ('document', 'screenshot', 'video', 'link', 'other')),
    CONSTRAINT chk_evidence_status CHECK (status IN ('active', 'archived', 'deleted')),
    CONSTRAINT chk_evidence_file_or_url CHECK (
        (evidence_type = 'link' AND external_url IS NOT NULL) OR 
        (evidence_type != 'link' AND file_path IS NOT NULL)
    )
);

-- Evidence Assessment Relations table (many-to-many)
CREATE TABLE IF NOT EXISTS evidence_assessment_relations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    evidence_id UUID NOT NULL REFERENCES evidence_library(id) ON DELETE CASCADE,
    response_id UUID REFERENCES assessment_responses(id) ON DELETE CASCADE,
    assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
    control_id UUID REFERENCES grc_controls(id) ON DELETE CASCADE,
    
    -- Relationship metadata
    relationship_type VARCHAR(50) DEFAULT 'supporting_evidence',
    added_by UUID REFERENCES users(id),
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT chk_relationship_type CHECK (relationship_type IN ('supporting_evidence', 'remediation_evidence', 'testing_evidence', 'documentation')),
    CONSTRAINT evidence_assessment_unique UNIQUE (evidence_id, response_id)
);

-- Evidence Download Log table
CREATE TABLE IF NOT EXISTS evidence_download_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    evidence_id UUID NOT NULL REFERENCES evidence_library(id) ON DELETE CASCADE,
    downloaded_by UUID REFERENCES users(id),
    download_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address INET,
    user_agent TEXT
);

-- ==========================================
-- 🔍 AUDIT AND LOGGING TABLES
-- ==========================================

-- Audit Logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Action details
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID,
    
    -- User and session
    user_id UUID REFERENCES users(id),
    session_id VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    
    -- Change details
    old_values JSONB,
    new_values JSONB,
    changes JSONB,
    
    -- Context
    organization_id UUID REFERENCES organizations(id),
    assessment_id UUID REFERENCES assessments(id),
    
    -- Metadata
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    severity VARCHAR(20) DEFAULT 'info',
    
    -- Constraints
    CONSTRAINT chk_audit_severity CHECK (severity IN ('debug', 'info', 'warning', 'error', 'critical'))
);

-- System Events table
CREATE TABLE IF NOT EXISTS system_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(50) NOT NULL,
    event_name VARCHAR(100) NOT NULL,
    description TEXT,
    
    -- Event data
    event_data JSONB,
    
    -- Context
    user_id UUID REFERENCES users(id),
    organization_id UUID REFERENCES organizations(id),
    
    -- Metadata
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    severity VARCHAR(20) DEFAULT 'info',
    
    -- Constraints
    CONSTRAINT chk_event_severity CHECK (severity IN ('debug', 'info', 'warning', 'error', 'critical'))
);

-- ==========================================
-- 🏢 VENDOR MANAGEMENT TABLES
-- ==========================================

-- Vendors table
CREATE TABLE IF NOT EXISTS vendors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Vendor details
    name VARCHAR(255) NOT NULL,
    legal_name VARCHAR(255),
    vendor_type VARCHAR(50),
    industry VARCHAR(100),
    
    -- Contact information
    primary_contact_name VARCHAR(200),
    primary_contact_email VARCHAR(255),
    primary_contact_phone VARCHAR(20),
    website VARCHAR(255),
    
    -- Address
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'Saudi Arabia',
    postal_code VARCHAR(20),
    
    -- Business details
    registration_number VARCHAR(100),
    tax_id VARCHAR(100),
    annual_revenue DECIMAL(15,2),
    employee_count INTEGER,
    
    -- Risk assessment
    risk_level VARCHAR(20) DEFAULT 'medium',
    risk_score INTEGER,
    last_risk_assessment DATE,
    next_risk_assessment DATE,
    
    -- Contract details
    contract_start_date DATE,
    contract_end_date DATE,
    contract_value DECIMAL(15,2),
    contract_currency VARCHAR(3) DEFAULT 'SAR',
    
    -- Status
    status VARCHAR(20) DEFAULT 'active',
    onboarding_status VARCHAR(50) DEFAULT 'pending',
    
    -- Metadata
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT chk_vendor_risk_level CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
    CONSTRAINT chk_vendor_status CHECK (status IN ('active', 'inactive', 'suspended', 'terminated')),
    CONSTRAINT chk_onboarding_status CHECK (onboarding_status IN ('pending', 'in_progress', 'completed', 'rejected'))
);

-- Vendor Risk Assessments table
CREATE TABLE IF NOT EXISTS vendor_risk_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    
    -- Assessment details
    assessment_type VARCHAR(50) DEFAULT 'periodic',
    assessment_date DATE NOT NULL,
    assessor_id UUID REFERENCES users(id),
    
    -- Risk scores
    overall_risk_score INTEGER,
    security_risk_score INTEGER,
    operational_risk_score INTEGER,
    financial_risk_score INTEGER,
    compliance_risk_score INTEGER,
    
    -- Risk factors
    risk_factors JSONB,
    mitigation_measures JSONB,
    
    -- Status
    status VARCHAR(20) DEFAULT 'draft',
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT chk_assessment_type CHECK (assessment_type IN ('initial', 'periodic', 'triggered', 'renewal')),
    CONSTRAINT chk_risk_assessment_status CHECK (status IN ('draft', 'completed', 'approved', 'rejected'))
);

-- ==========================================
-- 🎯 RISK MANAGEMENT TABLES
-- ==========================================

-- Risk Assessments table
CREATE TABLE IF NOT EXISTS risk_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Risk details
    risk_name VARCHAR(255) NOT NULL,
    risk_description TEXT,
    risk_category VARCHAR(100),
    risk_type VARCHAR(50),
    
    -- Risk scoring
    likelihood INTEGER, -- 1-5 scale
    impact INTEGER, -- 1-5 scale
    inherent_risk_score INTEGER, -- likelihood * impact
    residual_risk_score INTEGER, -- after controls
    
    -- Risk owner
    risk_owner_id UUID REFERENCES users(id),
    risk_manager_id UUID REFERENCES users(id),
    
    -- Status and dates
    status VARCHAR(20) DEFAULT 'identified',
    identification_date DATE,
    last_review_date DATE,
    next_review_date DATE,
    
    -- Treatment
    treatment_strategy VARCHAR(50),
    treatment_plan TEXT,
    treatment_due_date DATE,
    
    -- Metadata
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT chk_likelihood CHECK (likelihood BETWEEN 1 AND 5),
    CONSTRAINT chk_impact CHECK (impact BETWEEN 1 AND 5),
    CONSTRAINT chk_risk_status CHECK (status IN ('identified', 'assessed', 'treated', 'monitored', 'closed')),
    CONSTRAINT chk_treatment_strategy CHECK (treatment_strategy IN ('accept', 'mitigate', 'transfer', 'avoid'))
);

-- Risk Controls Mapping table
CREATE TABLE IF NOT EXISTS risk_control_mappings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    risk_id UUID NOT NULL REFERENCES risk_assessments(id) ON DELETE CASCADE,
    control_id UUID NOT NULL REFERENCES grc_controls(id) ON DELETE CASCADE,
    
    -- Mapping details
    control_effectiveness VARCHAR(20) DEFAULT 'medium',
    implementation_status VARCHAR(50) DEFAULT 'planned',
    
    -- Metadata
    mapped_by UUID REFERENCES users(id),
    mapped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT chk_control_effectiveness CHECK (control_effectiveness IN ('low', 'medium', 'high')),
    CONSTRAINT chk_implementation_status CHECK (implementation_status IN ('planned', 'in_progress', 'implemented', 'tested', 'optimized')),
    CONSTRAINT risk_control_unique UNIQUE (risk_id, control_id)
);

-- ==========================================
-- 📋 INDEXES FOR PERFORMANCE
-- ==========================================

-- Workflow indexes
CREATE INDEX IF NOT EXISTS idx_workflow_assessment ON assessment_workflow(assessment_id);
CREATE INDEX IF NOT EXISTS idx_workflow_assigned_to ON assessment_workflow(assigned_to) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_workflow_status ON assessment_workflow(status) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_workflow_due_date ON assessment_workflow(due_date) WHERE is_active = true;

-- Compliance reports indexes
CREATE INDEX IF NOT EXISTS idx_reports_assessment ON compliance_reports(assessment_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON compliance_reports(status) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_reports_type ON compliance_reports(report_type) WHERE is_active = true;

-- Evidence library indexes
CREATE INDEX IF NOT EXISTS idx_evidence_organization ON evidence_library(organization_id) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_evidence_type ON evidence_library(evidence_type) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_evidence_category ON evidence_library(category) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_evidence_confidential ON evidence_library(is_confidential) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_evidence_tags ON evidence_library USING GIN(tags);

-- Audit logs indexes
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_organization ON audit_logs(organization_id);

-- Vendor indexes
CREATE INDEX IF NOT EXISTS idx_vendors_organization ON vendors(organization_id) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_vendors_risk_level ON vendors(risk_level) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_vendors_next_assessment ON vendors(next_risk_assessment) WHERE status = 'active';

-- Risk assessment indexes
CREATE INDEX IF NOT EXISTS idx_risks_organization ON risk_assessments(organization_id);
CREATE INDEX IF NOT EXISTS idx_risks_owner ON risk_assessments(risk_owner_id);
CREATE INDEX IF NOT EXISTS idx_risks_status ON risk_assessments(status);
CREATE INDEX IF NOT EXISTS idx_risks_next_review ON risk_assessments(next_review_date);

-- ==========================================
-- 🔧 ADDITIONAL FUNCTIONS
-- ==========================================

/**
 * Function to calculate vendor risk score
 */
CREATE OR REPLACE FUNCTION calculate_vendor_risk_score(
    p_vendor_id UUID
) RETURNS INTEGER AS $$
DECLARE
    avg_score INTEGER := 0;
BEGIN
    SELECT 
        ROUND(AVG(
            COALESCE(security_risk_score, 0) + 
            COALESCE(operational_risk_score, 0) + 
            COALESCE(financial_risk_score, 0) + 
            COALESCE(compliance_risk_score, 0)
        ) / 4.0)
    INTO avg_score
    FROM vendor_risk_assessments
    WHERE vendor_id = p_vendor_id 
      AND status = 'approved'
      AND assessment_date >= NOW() - INTERVAL '1 year';
    
    RETURN COALESCE(avg_score, 0);
END;
$$ LANGUAGE plpgsql;

/**
 * Function to get overdue workflow items
 */
CREATE OR REPLACE FUNCTION get_overdue_workflow_items()
RETURNS TABLE (
    workflow_id UUID,
    assessment_name VARCHAR,
    organization_name VARCHAR,
    assigned_to_name VARCHAR,
    days_overdue INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        aw.id,
        a.name,
        o.name,
        u.first_name || ' ' || u.last_name,
        EXTRACT(DAY FROM NOW() - aw.due_date)::INTEGER
    FROM assessment_workflow aw
    JOIN assessments a ON aw.assessment_id = a.id
    JOIN organizations o ON a.organization_id = o.id
    LEFT JOIN users u ON aw.assigned_to = u.id
    WHERE aw.due_date < NOW()
      AND aw.status NOT IN ('completed', 'approved', 'rejected')
      AND aw.is_active = true
    ORDER BY aw.due_date ASC;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO grc_user;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO grc_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO grc_user;