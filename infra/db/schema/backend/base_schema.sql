-- ==========================================
-- GRC Template System - Base Database Schema
-- ==========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- USERS TABLE
-- ==========================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('admin', 'manager', 'user', 'auditor')),
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    organization_id UUID,
    phone VARCHAR(20),
    department VARCHAR(100),
    job_title VARCHAR(100),
    preferences JSONB DEFAULT '{}',
    avatar_url VARCHAR(500)
);

-- ==========================================
-- ORGANIZATIONS TABLE
-- ==========================================

-- Organizations table
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255),
    description TEXT,
    industry VARCHAR(100),
    country VARCHAR(100),
    city VARCHAR(100),
    address TEXT,
    postal_code VARCHAR(20),
    phone VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(255),
    cr_number VARCHAR(50) UNIQUE,
    vat_number VARCHAR(50) UNIQUE,
    license_number VARCHAR(100),
    established_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    logo_url VARCHAR(500),
    
    -- Contact Information
    primary_contact_name VARCHAR(255),
    primary_contact_email VARCHAR(255),
    primary_contact_phone VARCHAR(20),
    
    -- Business Details
    business_type VARCHAR(100),
    ownership_type VARCHAR(100),
    parent_company VARCHAR(255),
    subsidiaries TEXT[],
    
    -- Compliance Status
    compliance_officer_name VARCHAR(255),
    compliance_officer_email VARCHAR(255),
    last_assessment_date DATE,
    next_assessment_due DATE,
    overall_compliance_score INTEGER CHECK (overall_compliance_score >= 0 AND overall_compliance_score <= 100),
    
    -- Metadata
    notes TEXT,
    tags TEXT[],
    custom_fields JSONB DEFAULT '{}'
);

-- Add foreign key constraint
ALTER TABLE users ADD CONSTRAINT fk_users_organization 
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE SET NULL;

-- ==========================================
-- REGULATORS TABLE
-- ==========================================

-- Regulators / Regulatory Authorities
CREATE TABLE IF NOT EXISTS regulators (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255),
    code VARCHAR(50) UNIQUE NOT NULL, -- e.g., 'NCA', 'MOH', 'SAMA'
    description TEXT,
    country VARCHAR(100) DEFAULT 'Saudi Arabia',
    sector VARCHAR(100), -- e.g., 'healthcare', 'finance', 'telecom', 'all'
    jurisdiction VARCHAR(100), -- e.g., 'national', 'regional', 'international'
    website VARCHAR(255),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Regulatory Details
    authority_type VARCHAR(100), -- e.g., 'government', 'independent', 'industry'
    enforcement_powers TEXT[],
    penalty_types TEXT[],
    
    -- Metadata
    logo_url VARCHAR(500),
    notes TEXT,
    custom_fields JSONB DEFAULT '{}'
);

-- ==========================================
-- GRC FRAMEWORKS TABLE
-- ==========================================

-- GRC Frameworks
CREATE TABLE IF NOT EXISTS grc_frameworks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255),
    framework_code VARCHAR(50) UNIQUE NOT NULL, -- e.g., 'NCA-ECC', 'MOH-PHI'
    version VARCHAR(20) DEFAULT '1.0',
    description TEXT,
    regulator_id UUID NOT NULL,
    is_mandatory BOOLEAN DEFAULT true,
    effective_date DATE,
    review_cycle_months INTEGER DEFAULT 12,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Framework Details
    framework_type VARCHAR(100), -- e.g., 'cybersecurity', 'privacy', 'operational'
    scope TEXT,
    applicability_criteria TEXT,
    
    -- Metadata
    document_url VARCHAR(500),
    guidance_url VARCHAR(500),
    notes TEXT,
    custom_fields JSONB DEFAULT '{}'
);

-- Add foreign key constraint
ALTER TABLE grc_frameworks ADD CONSTRAINT fk_frameworks_regulator 
    FOREIGN KEY (regulator_id) REFERENCES regulators(id) ON DELETE CASCADE;

-- ==========================================
-- GRC CONTROLS TABLE
-- ==========================================

-- GRC Controls
CREATE TABLE IF NOT EXISTS grc_controls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    framework_id UUID NOT NULL,
    control_code VARCHAR(100) NOT NULL, -- e.g., 'NCA-ECC-1.1.1'
    title VARCHAR(500) NOT NULL,
    title_ar VARCHAR(500),
    description TEXT,
    description_ar TEXT,
    control_type VARCHAR(100), -- e.g., 'preventive', 'detective', 'corrective'
    criticality_level VARCHAR(20) DEFAULT 'medium' CHECK (criticality_level IN ('critical', 'high', 'medium', 'low')),
    is_mandatory BOOLEAN DEFAULT true,
    implementation_guidance TEXT,
    implementation_guidance_ar TEXT,
    evidence_requirements TEXT[],
    testing_procedures TEXT,
    
    -- Control Hierarchy
    parent_control_id UUID,
    control_category VARCHAR(100),
    control_subcategory VARCHAR(100),
    control_order INTEGER,
    
    -- Assessment Details
    assessment_frequency VARCHAR(50) DEFAULT 'annual', -- 'continuous', 'quarterly', 'annual'
    assessment_method VARCHAR(100), -- e.g., 'document_review', 'interview', 'technical_test'
    pass_criteria TEXT,
    
    -- Compliance Tracking
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Metadata
    references TEXT[],
    related_controls UUID[],
    tags TEXT[],
    custom_fields JSONB DEFAULT '{}'
);

-- Add foreign key constraints
ALTER TABLE grc_controls ADD CONSTRAINT fk_controls_framework 
    FOREIGN KEY (framework_id) REFERENCES grc_frameworks(id) ON DELETE CASCADE;

ALTER TABLE grc_controls ADD CONSTRAINT fk_controls_parent 
    FOREIGN KEY (parent_control_id) REFERENCES grc_controls(id) ON DELETE SET NULL;

-- Add unique constraint for control codes within frameworks
ALTER TABLE grc_controls ADD CONSTRAINT uk_control_code_framework 
    UNIQUE (framework_id, control_code);

-- ==========================================
-- ASSESSMENT TEMPLATES TABLE
-- ==========================================

-- Assessment Templates
CREATE TABLE IF NOT EXISTS assessment_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255),
    description TEXT,
    framework_id UUID NOT NULL,
    template_type VARCHAR(100) DEFAULT 'standard', -- 'standard', 'quick', 'comprehensive'
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    
    -- Template Configuration
    included_controls UUID[],
    assessment_duration_days INTEGER DEFAULT 30,
    required_roles TEXT[],
    instructions TEXT,
    instructions_ar TEXT,
    
    -- Metadata
    version VARCHAR(20) DEFAULT '1.0',
    tags TEXT[],
    custom_fields JSONB DEFAULT '{}'
);

-- Add foreign key constraints
ALTER TABLE assessment_templates ADD CONSTRAINT fk_templates_framework 
    FOREIGN KEY (framework_id) REFERENCES grc_frameworks(id) ON DELETE CASCADE;

ALTER TABLE assessment_templates ADD CONSTRAINT fk_templates_creator 
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;

-- ==========================================
-- ASSESSMENTS TABLE
-- ==========================================

-- Assessments
CREATE TABLE IF NOT EXISTS assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL,
    template_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'under_review', 'completed', 'cancelled')),
    
    -- Assessment Timeline
    start_date DATE,
    due_date DATE,
    completion_date DATE,
    
    -- Assessment Team
    lead_assessor_id UUID,
    assessors UUID[],
    reviewers UUID[],
    
    -- Progress Tracking
    total_controls INTEGER DEFAULT 0,
    completed_controls INTEGER DEFAULT 0,
    passed_controls INTEGER DEFAULT 0,
    failed_controls INTEGER DEFAULT 0,
    not_applicable_controls INTEGER DEFAULT 0,
    overall_score INTEGER CHECK (overall_score >= 0 AND overall_score <= 100),
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    notes TEXT,
    tags TEXT[],
    custom_fields JSONB DEFAULT '{}'
);

-- Add foreign key constraints
ALTER TABLE assessments ADD CONSTRAINT fk_assessments_organization 
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE;

ALTER TABLE assessments ADD CONSTRAINT fk_assessments_template 
    FOREIGN KEY (template_id) REFERENCES assessment_templates(id) ON DELETE RESTRICT;

ALTER TABLE assessments ADD CONSTRAINT fk_assessments_lead_assessor 
    FOREIGN KEY (lead_assessor_id) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE assessments ADD CONSTRAINT fk_assessments_creator 
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;

-- ==========================================
-- ASSESSMENT RESPONSES TABLE
-- ==========================================

-- Assessment Responses (Control Evaluations)
CREATE TABLE IF NOT EXISTS assessment_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assessment_id UUID NOT NULL,
    control_id UUID NOT NULL,
    response_status VARCHAR(50) DEFAULT 'pending' CHECK (response_status IN ('pending', 'compliant', 'non_compliant', 'partially_compliant', 'not_applicable')),
    
    -- Response Details
    assessor_id UUID,
    assessment_date DATE DEFAULT CURRENT_DATE,
    response_notes TEXT,
    assessor_comments TEXT,
    reviewer_comments TEXT,
    
    -- Scoring
    control_score INTEGER CHECK (control_score >= 0 AND control_score <= 100),
    weight DECIMAL(5,2) DEFAULT 1.0,
    
    -- Evidence Tracking
    evidence_provided BOOLEAN DEFAULT false,
    evidence_adequate BOOLEAN DEFAULT false,
    evidence_notes TEXT,
    
    -- Remediation
    requires_remediation BOOLEAN DEFAULT false,
    remediation_priority VARCHAR(20) CHECK (remediation_priority IN ('critical', 'high', 'medium', 'low')),
    remediation_due_date DATE,
    remediation_notes TEXT,
    remediation_status VARCHAR(50) DEFAULT 'not_started' CHECK (remediation_status IN ('not_started', 'in_progress', 'completed', 'deferred')),
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP,
    reviewed_by UUID,
    
    -- Additional Fields
    testing_method VARCHAR(100),
    testing_results TEXT,
    recommendations TEXT,
    custom_fields JSONB DEFAULT '{}'
);

-- Add foreign key constraints
ALTER TABLE assessment_responses ADD CONSTRAINT fk_responses_assessment 
    FOREIGN KEY (assessment_id) REFERENCES assessments(id) ON DELETE CASCADE;

ALTER TABLE assessment_responses ADD CONSTRAINT fk_responses_control 
    FOREIGN KEY (control_id) REFERENCES grc_controls(id) ON DELETE CASCADE;

ALTER TABLE assessment_responses ADD CONSTRAINT fk_responses_assessor 
    FOREIGN KEY (assessor_id) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE assessment_responses ADD CONSTRAINT fk_responses_reviewer 
    FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL;

-- Add unique constraint to prevent duplicate responses
ALTER TABLE assessment_responses ADD CONSTRAINT uk_assessment_control_response 
    UNIQUE (assessment_id, control_id);

-- ==========================================
-- ASSESSMENT EVIDENCE TABLE
-- ==========================================

-- Assessment Evidence (File Attachments)
CREATE TABLE IF NOT EXISTS assessment_evidence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    response_id UUID NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER,
    file_type VARCHAR(100),
    mime_type VARCHAR(100),
    
    -- Evidence Details
    evidence_type VARCHAR(100), -- e.g., 'policy', 'procedure', 'screenshot', 'report'
    description TEXT,
    uploaded_by UUID,
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Validation
    is_validated BOOLEAN DEFAULT false,
    validated_by UUID,
    validated_at TIMESTAMP,
    validation_notes TEXT,
    
    -- Metadata
    tags TEXT[],
    custom_fields JSONB DEFAULT '{}'
);

-- Add foreign key constraints
ALTER TABLE assessment_evidence ADD CONSTRAINT fk_evidence_response 
    FOREIGN KEY (response_id) REFERENCES assessment_responses(id) ON DELETE CASCADE;

ALTER TABLE assessment_evidence ADD CONSTRAINT fk_evidence_uploader 
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE assessment_evidence ADD CONSTRAINT fk_evidence_validator 
    FOREIGN KEY (validated_by) REFERENCES users(id) ON DELETE SET NULL;

-- ==========================================
-- AUDIT LOG TABLE
-- ==========================================

-- Audit Log for tracking all system changes
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    action VARCHAR(20) NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    old_values JSONB,
    new_values JSONB,
    changed_by UUID,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(255)
);

-- Add foreign key constraint
ALTER TABLE audit_logs ADD CONSTRAINT fk_audit_user 
    FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE SET NULL;

-- ==========================================
-- INDEXES FOR PERFORMANCE
-- ==========================================

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_organization ON users(organization_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);

-- Organizations indexes
CREATE INDEX IF NOT EXISTS idx_organizations_industry ON organizations(industry);
CREATE INDEX IF NOT EXISTS idx_organizations_country ON organizations(country);
CREATE INDEX IF NOT EXISTS idx_organizations_active ON organizations(is_active);
CREATE INDEX IF NOT EXISTS idx_organizations_cr_number ON organizations(cr_number);
CREATE INDEX IF NOT EXISTS idx_organizations_vat_number ON organizations(vat_number);

-- Regulators indexes
CREATE INDEX IF NOT EXISTS idx_regulators_code ON regulators(code);
CREATE INDEX IF NOT EXISTS idx_regulators_sector ON regulators(sector);
CREATE INDEX IF NOT EXISTS idx_regulators_active ON regulators(is_active);

-- Frameworks indexes
CREATE INDEX IF NOT EXISTS idx_frameworks_code ON grc_frameworks(framework_code);
CREATE INDEX IF NOT EXISTS idx_frameworks_regulator ON grc_frameworks(regulator_id);
CREATE INDEX IF NOT EXISTS idx_frameworks_active ON grc_frameworks(is_active);

-- Controls indexes
CREATE INDEX IF NOT EXISTS idx_controls_framework ON grc_controls(framework_id);
CREATE INDEX IF NOT EXISTS idx_controls_code ON grc_controls(control_code);
CREATE INDEX IF NOT EXISTS idx_controls_criticality ON grc_controls(criticality_level);
CREATE INDEX IF NOT EXISTS idx_controls_mandatory ON grc_controls(is_mandatory);
CREATE INDEX IF NOT EXISTS idx_controls_active ON grc_controls(is_active);
CREATE INDEX IF NOT EXISTS idx_controls_parent ON grc_controls(parent_control_id);

-- Assessment templates indexes
CREATE INDEX IF NOT EXISTS idx_templates_framework ON assessment_templates(framework_id);
CREATE INDEX IF NOT EXISTS idx_templates_active ON assessment_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_templates_creator ON assessment_templates(created_by);

-- Assessments indexes
CREATE INDEX IF NOT EXISTS idx_assessments_organization ON assessments(organization_id);
CREATE INDEX IF NOT EXISTS idx_assessments_template ON assessments(template_id);
CREATE INDEX IF NOT EXISTS idx_assessments_status ON assessments(status);
CREATE INDEX IF NOT EXISTS idx_assessments_lead_assessor ON assessments(lead_assessor_id);
CREATE INDEX IF NOT EXISTS idx_assessments_dates ON assessments(start_date, due_date);

-- Assessment responses indexes
CREATE INDEX IF NOT EXISTS idx_responses_assessment ON assessment_responses(assessment_id);
CREATE INDEX IF NOT EXISTS idx_responses_control ON assessment_responses(control_id);
CREATE INDEX IF NOT EXISTS idx_responses_status ON assessment_responses(response_status);
CREATE INDEX IF NOT EXISTS idx_responses_assessor ON assessment_responses(assessor_id);
CREATE INDEX IF NOT EXISTS idx_responses_remediation ON assessment_responses(requires_remediation, remediation_priority);

-- Assessment evidence indexes
CREATE INDEX IF NOT EXISTS idx_evidence_response ON assessment_evidence(response_id);
CREATE INDEX IF NOT EXISTS idx_evidence_uploader ON assessment_evidence(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_evidence_type ON assessment_evidence(evidence_type);

-- Audit logs indexes
CREATE INDEX IF NOT EXISTS idx_audit_table_record ON audit_logs(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(changed_by);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_logs(changed_at);
CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_logs(action);

-- ==========================================
-- COMMENTS
-- ==========================================

COMMENT ON TABLE users IS 'System users with role-based access control';
COMMENT ON TABLE organizations IS 'Organizations being assessed for GRC compliance';
COMMENT ON TABLE regulators IS 'Regulatory authorities and their jurisdictions';
COMMENT ON TABLE grc_frameworks IS 'Compliance frameworks from various regulators';
COMMENT ON TABLE grc_controls IS 'Individual controls within frameworks';
COMMENT ON TABLE assessment_templates IS 'Reusable assessment templates';
COMMENT ON TABLE assessments IS 'Assessment instances for organizations';
COMMENT ON TABLE assessment_responses IS 'Control evaluation responses';
COMMENT ON TABLE assessment_evidence IS 'Supporting evidence files';
COMMENT ON TABLE audit_logs IS 'System audit trail for compliance tracking';
