-- ==========================================
-- 🎯 ASSESSMENT MODULE DATABASE SCHEMA
-- ==========================================
-- Complete database schema for standalone Assessment Module
-- Compatible with PostgreSQL 12+

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 👥 USER MANAGEMENT TABLES
-- ==========================================

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(50) DEFAULT 'viewer',
    organization_id UUID,
    permissions JSONB DEFAULT '[]',
    status VARCHAR(20) DEFAULT 'active',
    -- Authentication tracking
    failed_login_attempts INTEGER DEFAULT 0,
    account_locked_until TIMESTAMP,
    last_login TIMESTAMP,
    -- MFA Support
    mfa_enabled BOOLEAN DEFAULT false,
    mfa_secret VARCHAR(32),
    mfa_backup_codes TEXT,
    -- Session Management
    session_token VARCHAR(255),
    session_expires_at TIMESTAMP,
    -- Audit fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Organizations table
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255),
    description TEXT,
    industry VARCHAR(100),
    country VARCHAR(100) DEFAULT 'Saudi Arabia',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add foreign key constraint for users
ALTER TABLE users ADD CONSTRAINT fk_users_organization 
    FOREIGN KEY (organization_id) REFERENCES organizations(id);

-- ==========================================
-- 🔐 AUTHENTICATION SUPPORT TABLES
-- ==========================================

-- Approved Users (for registration approval workflow)
CREATE TABLE approved_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(50) DEFAULT 'viewer',
    organization_id UUID,
    approved_by UUID,
    approved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'approved',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (approved_by) REFERENCES users(id)
);

-- User Sessions (for session management)
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    refresh_token VARCHAR(255),
    device_info JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_accessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Password Reset Tokens
CREATE TABLE password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Email Verification Codes
CREATE TABLE email_verification_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL,
    code VARCHAR(10) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    verified_at TIMESTAMP,
    attempts INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 🏛️ REGULATORY AUTHORITIES TABLES
-- ==========================================

-- Regulators / Regulatory Authorities
CREATE TABLE regulators (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255),
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    description_ar TEXT,
    jurisdiction VARCHAR(100) DEFAULT 'Saudi Arabia',
    sector VARCHAR(100),
    website VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    address_ar TEXT,
    type VARCHAR(50),
    level VARCHAR(50),
    status VARCHAR(50) DEFAULT 'active',
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}',
    created_by UUID,
    updated_by UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- ==========================================
-- 🏗️ GRC FRAMEWORK TABLES
-- ==========================================

-- GRC Frameworks
CREATE TABLE IF NOT EXISTS grc_frameworks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name_en VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255),
    description_en TEXT,
    description_ar TEXT,
    version VARCHAR(50),
    authority VARCHAR(255),
    country VARCHAR(100) DEFAULT 'Saudi Arabia',
    regulator_id UUID,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (regulator_id) REFERENCES regulators(id)
);

-- GRC Controls
CREATE TABLE IF NOT EXISTS grc_controls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    framework_id UUID NOT NULL,
    control_id VARCHAR(50) NOT NULL,
    title_en VARCHAR(500) NOT NULL,
    title_ar VARCHAR(500),
    description_en TEXT,
    description_ar TEXT,
    category VARCHAR(100),
    criticality_level VARCHAR(20) DEFAULT 'medium',
    control_type VARCHAR(50),
    implementation_guidance TEXT,
    testing_procedures TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (framework_id) REFERENCES grc_frameworks(id) ON DELETE CASCADE,
    UNIQUE(framework_id, control_id)
);

-- ==========================================
-- 📊 ASSESSMENT CORE TABLES
-- ==========================================

-- Assessments
CREATE TABLE IF NOT EXISTS assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL,
    framework_id UUID NOT NULL,
    template_id UUID,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) DEFAULT 'internal',
    status VARCHAR(50) DEFAULT 'not_started',
    start_date DATE,
    due_date DATE,
    completion_date DATE,
    completion_percentage INTEGER DEFAULT 0,
    compliance_score DECIMAL(5,2),
    assigned_to UUID,
    created_by UUID NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (framework_id) REFERENCES grc_frameworks(id),
    FOREIGN KEY (template_id) REFERENCES assessment_templates(id),
    FOREIGN KEY (assigned_to) REFERENCES users(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Assessment Templates
CREATE TABLE IF NOT EXISTS assessment_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    framework_id UUID,
    template_data JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_by UUID NOT NULL,
    updated_by UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (framework_id) REFERENCES grc_frameworks(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- Assessment Template Sections
CREATE TABLE IF NOT EXISTS assessment_template_sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL,
    section_data JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (template_id) REFERENCES assessment_templates(id) ON DELETE CASCADE
);

-- Assessment Responses
CREATE TABLE IF NOT EXISTS assessment_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assessment_id UUID NOT NULL,
    control_id UUID NOT NULL,
    response TEXT,
    compliance_status VARCHAR(50) DEFAULT 'not_assessed',
    evidence_provided BOOLEAN DEFAULT false,
    comments TEXT,
    risk_rating VARCHAR(20),
    mitigation_actions TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    assigned_to UUID,
    completed_by UUID,
    completed_at TIMESTAMP,
    due_date DATE,
    review_status VARCHAR(50),
    review_comments TEXT,
    reviewed_by UUID,
    reviewed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assessment_id) REFERENCES assessments(id) ON DELETE CASCADE,
    FOREIGN KEY (control_id) REFERENCES grc_controls(id),
    FOREIGN KEY (assigned_to) REFERENCES users(id),
    FOREIGN KEY (completed_by) REFERENCES users(id),
    FOREIGN KEY (reviewed_by) REFERENCES users(id),
    UNIQUE(assessment_id, control_id)
);

-- ==========================================
-- � ASSESSMENT FORMS AND SCHEDULING
-- ==========================================

-- Assessment Forms (Dynamic form generation for assessments)
CREATE TABLE IF NOT EXISTS assessment_forms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assessment_id UUID NOT NULL,
    form_title VARCHAR(255) NOT NULL,
    form_description TEXT,
    form_config JSONB DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'draft',
    version INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_by UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assessment_id) REFERENCES assessments(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Assessment Form Sections
CREATE TABLE IF NOT EXISTS assessment_form_sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assessment_id UUID NOT NULL,
    form_id UUID,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    section_order INTEGER DEFAULT 1,
    is_required BOOLEAN DEFAULT false,
    config JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assessment_id) REFERENCES assessments(id) ON DELETE CASCADE,
    FOREIGN KEY (form_id) REFERENCES assessment_forms(id) ON DELETE CASCADE
);

-- Assessment Form Questions
CREATE TABLE IF NOT EXISTS assessment_form_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    section_id UUID NOT NULL,
    question_text TEXT NOT NULL,
    question_type VARCHAR(50) DEFAULT 'text',
    options JSONB,
    is_required BOOLEAN DEFAULT false,
    question_order INTEGER DEFAULT 1,
    validation_rules JSONB DEFAULT '{}',
    help_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (section_id) REFERENCES assessment_form_sections(id) ON DELETE CASCADE
);

-- Assessment Schedules
CREATE TABLE IF NOT EXISTS assessment_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assessment_id UUID NOT NULL,
    start_date DATE,
    end_date DATE,
    due_date DATE,
    assigned_to UUID,
    priority VARCHAR(20) DEFAULT 'medium',
    reminder_frequency VARCHAR(50),
    next_reminder DATE,
    status VARCHAR(50) DEFAULT 'scheduled',
    notes TEXT,
    created_by UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assessment_id) REFERENCES assessments(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to) REFERENCES users(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- ==========================================
-- �📁 EVIDENCE MANAGEMENT TABLES
-- ==========================================

-- Assessment Evidence
CREATE TABLE IF NOT EXISTS assessment_evidence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assessment_id UUID,
    response_id UUID,
    control_id UUID,
    file_name VARCHAR(255),
    file_path VARCHAR(500),
    file_type VARCHAR(100),
    file_size INTEGER,
    description TEXT,
    evidence_type VARCHAR(50),
    uploaded_by UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assessment_id) REFERENCES assessments(id) ON DELETE CASCADE,
    FOREIGN KEY (response_id) REFERENCES assessment_responses(id) ON DELETE CASCADE,
    FOREIGN KEY (control_id) REFERENCES grc_controls(id),
    FOREIGN KEY (uploaded_by) REFERENCES users(id)
);

-- Evidence Library
CREATE TABLE IF NOT EXISTS evidence_library (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    file_name VARCHAR(255),
    file_path VARCHAR(500),
    file_type VARCHAR(100),
    file_size INTEGER,
    tags JSONB DEFAULT '[]',
    is_public BOOLEAN DEFAULT false,
    uploaded_by UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (uploaded_by) REFERENCES users(id)
);

-- ==========================================
-- 🎯 RISK ASSESSMENT TABLES
-- ==========================================

-- Risk Assessments
CREATE TABLE IF NOT EXISTS risk_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assessment_id UUID,
    organization_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    risk_category VARCHAR(100),
    probability_score INTEGER CHECK (probability_score >= 1 AND probability_score <= 5),
    impact_score INTEGER CHECK (impact_score >= 1 AND impact_score <= 5),
    risk_score DECIMAL(3,2),
    risk_level VARCHAR(20),
    mitigation_strategy TEXT,
    owner_id UUID,
    status VARCHAR(50) DEFAULT 'identified',
    created_by UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assessment_id) REFERENCES assessments(id),
    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (owner_id) REFERENCES users(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Risk Controls Mapping
CREATE TABLE IF NOT EXISTS risk_controls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    risk_id UUID NOT NULL,
    control_id UUID NOT NULL,
    effectiveness VARCHAR(20) DEFAULT 'medium',
    implementation_status VARCHAR(50) DEFAULT 'planned',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (risk_id) REFERENCES risk_assessments(id) ON DELETE CASCADE,
    FOREIGN KEY (control_id) REFERENCES grc_controls(id),
    UNIQUE(risk_id, control_id)
);

-- ==========================================
-- 📋 WORKFLOW MANAGEMENT TABLES
-- ==========================================

-- Assessment Workflow
CREATE TABLE IF NOT EXISTS assessment_workflow (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assessment_id UUID NOT NULL,
    action VARCHAR(100) NOT NULL,
    performed_by UUID NOT NULL,
    performed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    comments TEXT,
    metadata JSONB DEFAULT '{}',
    FOREIGN KEY (assessment_id) REFERENCES assessments(id) ON DELETE CASCADE,
    FOREIGN KEY (performed_by) REFERENCES users(id)
);

-- Approval Workflows
CREATE TABLE IF NOT EXISTS approval_workflows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    workflow_name VARCHAR(255) NOT NULL,
    current_step INTEGER DEFAULT 1,
    total_steps INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    initiated_by UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (initiated_by) REFERENCES users(id)
);

-- Approval Steps
CREATE TABLE IF NOT EXISTS approval_steps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_id UUID NOT NULL,
    step_number INTEGER NOT NULL,
    approver_id UUID NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    comments TEXT,
    approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (workflow_id) REFERENCES approval_workflows(id) ON DELETE CASCADE,
    FOREIGN KEY (approver_id) REFERENCES users(id),
    UNIQUE(workflow_id, step_number)
);

-- ==========================================
-- 📊 REPORTING AND ANALYTICS TABLES
-- ==========================================

-- Assessment Reports
CREATE TABLE IF NOT EXISTS assessment_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assessment_id UUID,
    organization_id UUID NOT NULL,
    report_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    report_data JSONB DEFAULT '{}',
    file_path VARCHAR(500),
    generated_by UUID NOT NULL,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assessment_id) REFERENCES assessments(id),
    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (generated_by) REFERENCES users(id)
);

-- Compliance Metrics
CREATE TABLE IF NOT EXISTS compliance_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL,
    framework_id UUID,
    metric_name VARCHAR(255) NOT NULL,
    metric_value DECIMAL(10,2),
    metric_type VARCHAR(50),
    measurement_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (framework_id) REFERENCES grc_frameworks(id)
);

-- ==========================================
-- 🔍 AUDIT AND LOGGING TABLES
-- ==========================================

-- Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

COMMENT ON TABLE audit_logs IS 'System audit trail for compliance tracking';

-- System Logs
CREATE TABLE IF NOT EXISTS system_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    level VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    context JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 🔧 CONFIGURATION TABLES
-- ==========================================

-- System Settings
CREATE TABLE IF NOT EXISTS system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(255) UNIQUE NOT NULL,
    value JSONB,
    description TEXT,
    category VARCHAR(100),
    is_public BOOLEAN DEFAULT false,
    updated_by UUID,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- Notification Settings
CREATE TABLE IF NOT EXISTS notification_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    notification_type VARCHAR(100) NOT NULL,
    enabled BOOLEAN DEFAULT true,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE(user_id, notification_type)
);

-- ==========================================
-- 📈 INDEXES FOR PERFORMANCE
-- ==========================================

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_organization ON users(organization_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

-- Organizations indexes
CREATE INDEX IF NOT EXISTS idx_organizations_active ON organizations(is_active);
CREATE INDEX IF NOT EXISTS idx_organizations_country ON organizations(country);

-- Regulators indexes
CREATE INDEX IF NOT EXISTS idx_regulators_code ON regulators(code);
CREATE INDEX IF NOT EXISTS idx_regulators_jurisdiction ON regulators(jurisdiction);
CREATE INDEX IF NOT EXISTS idx_regulators_sector ON regulators(sector);
CREATE INDEX IF NOT EXISTS idx_regulators_status ON regulators(status);
CREATE INDEX IF NOT EXISTS idx_regulators_active ON regulators(is_active);

-- GRC Frameworks indexes
CREATE INDEX IF NOT EXISTS idx_grc_frameworks_active ON grc_frameworks(is_active);
CREATE INDEX IF NOT EXISTS idx_grc_frameworks_country ON grc_frameworks(country);
CREATE INDEX IF NOT EXISTS idx_grc_frameworks_regulator_id ON grc_frameworks(regulator_id);

-- GRC Controls indexes
CREATE INDEX IF NOT EXISTS idx_grc_controls_framework_id ON grc_controls(framework_id);
CREATE INDEX IF NOT EXISTS idx_grc_controls_active ON grc_controls(is_active);
CREATE INDEX IF NOT EXISTS idx_grc_controls_category ON grc_controls(category);
CREATE INDEX IF NOT EXISTS idx_grc_controls_criticality ON grc_controls(criticality_level);

-- Assessments indexes
CREATE INDEX IF NOT EXISTS idx_assessments_organization_id ON assessments(organization_id);
CREATE INDEX IF NOT EXISTS idx_assessments_framework_id ON assessments(framework_id);
CREATE INDEX IF NOT EXISTS idx_assessments_status ON assessments(status);
CREATE INDEX IF NOT EXISTS idx_assessments_created_at ON assessments(created_at);
CREATE INDEX IF NOT EXISTS idx_assessments_due_date ON assessments(due_date);
CREATE INDEX IF NOT EXISTS idx_assessments_assigned_to ON assessments(assigned_to);
CREATE INDEX IF NOT EXISTS idx_assessments_created_by ON assessments(created_by);

-- Assessment Templates indexes
CREATE INDEX IF NOT EXISTS idx_assessment_templates_framework ON assessment_templates(framework_id);
CREATE INDEX IF NOT EXISTS idx_assessment_templates_category ON assessment_templates(category);
CREATE INDEX IF NOT EXISTS idx_assessment_templates_active ON assessment_templates(is_active);

-- Assessment Responses indexes
CREATE INDEX IF NOT EXISTS idx_assessment_responses_assessment_id ON assessment_responses(assessment_id);
CREATE INDEX IF NOT EXISTS idx_assessment_responses_control_id ON assessment_responses(control_id);
CREATE INDEX IF NOT EXISTS idx_assessment_responses_status ON assessment_responses(status);
CREATE INDEX IF NOT EXISTS idx_assessment_responses_compliance_status ON assessment_responses(compliance_status);
CREATE INDEX IF NOT EXISTS idx_assessment_responses_created_at ON assessment_responses(created_at);

-- Evidence indexes
CREATE INDEX IF NOT EXISTS idx_assessment_evidence_assessment_id ON assessment_evidence(assessment_id);
CREATE INDEX IF NOT EXISTS idx_assessment_evidence_control_id ON assessment_evidence(control_id);
CREATE INDEX IF NOT EXISTS idx_assessment_evidence_created_at ON assessment_evidence(created_at);
CREATE INDEX IF NOT EXISTS idx_assessment_evidence_response ON assessment_evidence(response_id);
CREATE INDEX IF NOT EXISTS idx_assessment_evidence_control ON assessment_evidence(control_id);
CREATE INDEX IF NOT EXISTS idx_evidence_library_organization ON evidence_library(organization_id);
CREATE INDEX IF NOT EXISTS idx_evidence_library_category ON evidence_library(category);

-- Risk Assessments indexes
CREATE INDEX IF NOT EXISTS idx_risk_assessments_assessment ON risk_assessments(assessment_id);
CREATE INDEX IF NOT EXISTS idx_risk_assessments_organization ON risk_assessments(organization_id);
CREATE INDEX IF NOT EXISTS idx_risk_assessments_status ON risk_assessments(status);
CREATE INDEX IF NOT EXISTS idx_risk_assessments_level ON risk_assessments(risk_level);

-- Workflow indexes
CREATE INDEX IF NOT EXISTS idx_assessment_workflow_assessment ON assessment_workflow(assessment_id);
CREATE INDEX IF NOT EXISTS idx_assessment_workflow_performed_by ON assessment_workflow(performed_by);
CREATE INDEX IF NOT EXISTS idx_approval_workflows_entity ON approval_workflows(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_approval_workflows_status ON approval_workflows(status);

-- Audit indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_system_logs_level ON system_logs(level);
CREATE INDEX IF NOT EXISTS idx_system_logs_created_at ON system_logs(created_at);

-- ==========================================
-- 🎯 INITIAL DATA SEEDING
-- ==========================================

-- Insert default organization
INSERT INTO organizations (id, name, name_ar, description, industry, country) 
VALUES (
    uuid_generate_v4(),
    'Default Organization',
    'المنظمة الافتراضية',
    'Default organization for assessment module',
    'Technology',
    'Saudi Arabia'
) ON CONFLICT DO NOTHING;

-- Insert default admin user
INSERT INTO users (id, email, password_hash, first_name, last_name, role, organization_id, permissions, status)
VALUES (
    uuid_generate_v4(),
    'admin@assessment.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.Qf.2HI', -- password: admin123
    'Admin',
    'User',
    'super_admin',
    (SELECT id FROM organizations LIMIT 1),
    '["*"]',
    'active'
) ON CONFLICT (email) DO NOTHING;

-- Insert sample GRC framework (ISO 27001)
INSERT INTO grc_frameworks (id, name_en, name_ar, description_en, description_ar, version, authority, country)
VALUES (
    uuid_generate_v4(),
    'ISO 27001:2013',
    'آيزو 27001:2013',
    'Information security management systems - Requirements',
    'أنظمة إدارة أمن المعلومات - المتطلبات',
    '2013',
    'ISO',
    'International'
) ON CONFLICT DO NOTHING;

-- Insert sample controls for ISO 27001
INSERT INTO grc_controls (framework_id, control_id, title_en, title_ar, description_en, category, criticality_level)
SELECT 
    f.id,
    'A.5.1.1',
    'Information security policy',
    'سياسة أمن المعلومات',
    'An information security policy shall be defined, approved by management, published and communicated to employees and relevant external parties.',
    'Information Security Policies',
    'high'
FROM grc_frameworks f 
WHERE f.name_en = 'ISO 27001:2013'
ON CONFLICT (framework_id, control_id) DO NOTHING;

INSERT INTO grc_controls (framework_id, control_id, title_en, title_ar, description_en, category, criticality_level)
SELECT 
    f.id,
    'A.6.1.1',
    'Information security roles and responsibilities',
    'أدوار ومسؤوليات أمن المعلومات',
    'All information security responsibilities shall be defined and allocated.',
    'Organization of Information Security',
    'high'
FROM grc_frameworks f 
WHERE f.name_en = 'ISO 27001:2013'
ON CONFLICT (framework_id, control_id) DO NOTHING;

-- Insert system settings
INSERT INTO system_settings (key, value, description, category, is_public)
VALUES 
    ('assessment_auto_save_interval', '30000', 'Auto-save interval for assessments in milliseconds', 'assessment', true),
    ('max_evidence_file_size', '10485760', 'Maximum evidence file size in bytes (10MB)', 'evidence', true),
    ('default_assessment_due_days', '30', 'Default number of days for assessment due date', 'assessment', true),
    ('enable_email_notifications', 'true', 'Enable email notifications for assessments', 'notifications', true)
ON CONFLICT (key) DO NOTHING;

-- ==========================================
-- 🔄 TRIGGERS AND FUNCTIONS
-- ==========================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_grc_frameworks_updated_at BEFORE UPDATE ON grc_frameworks 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_grc_controls_updated_at BEFORE UPDATE ON grc_controls 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assessments_updated_at BEFORE UPDATE ON assessments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assessment_templates_updated_at BEFORE UPDATE ON assessment_templates 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assessment_responses_updated_at BEFORE UPDATE ON assessment_responses 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_evidence_library_updated_at BEFORE UPDATE ON evidence_library 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_risk_assessments_updated_at BEFORE UPDATE ON risk_assessments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_approval_workflows_updated_at BEFORE UPDATE ON approval_workflows 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON system_settings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_settings_updated_at BEFORE UPDATE ON notification_settings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate risk score
CREATE OR REPLACE FUNCTION calculate_risk_score()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.probability_score IS NOT NULL AND NEW.impact_score IS NOT NULL THEN
        NEW.risk_score = (NEW.probability_score * NEW.impact_score) / 5.0;
        
        -- Determine risk level based on score
        IF NEW.risk_score >= 4.0 THEN
            NEW.risk_level = 'critical';
        ELSIF NEW.risk_score >= 3.0 THEN
            NEW.risk_level = 'high';
        ELSIF NEW.risk_score >= 2.0 THEN
            NEW.risk_level = 'medium';
        ELSE
            NEW.risk_level = 'low';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply risk calculation trigger
CREATE TRIGGER calculate_risk_score_trigger 
    BEFORE INSERT OR UPDATE ON risk_assessments
    FOR EACH ROW EXECUTE FUNCTION calculate_risk_score();

-- ==========================================
-- 🎯 VIEWS FOR REPORTING
-- ==========================================

-- Assessment overview view
CREATE OR REPLACE VIEW v_assessment_overview AS
SELECT 
    a.id,
    a.name,
    a.status,
    a.completion_percentage,
    a.compliance_score,
    a.due_date,
    o.name as organization_name,
    f.name_en as framework_name,
    u1.email as assigned_to_email,
    u2.email as created_by_email,
    COUNT(ar.id) as total_responses,
    COUNT(CASE WHEN ar.status = 'completed' THEN 1 END) as completed_responses
FROM assessments a
LEFT JOIN organizations o ON a.organization_id = o.id
LEFT JOIN grc_frameworks f ON a.framework_id = f.id
LEFT JOIN users u1 ON a.assigned_to = u1.id
LEFT JOIN users u2 ON a.created_by = u2.id
LEFT JOIN assessment_responses ar ON a.id = ar.assessment_id
GROUP BY a.id, o.name, f.name_en, u1.email, u2.email;

-- Compliance dashboard view
CREATE OR REPLACE VIEW v_compliance_dashboard AS
SELECT 
    o.id as organization_id,
    o.name as organization_name,
    COUNT(DISTINCT a.id) as total_assessments,
    COUNT(DISTINCT CASE WHEN a.status = 'completed' THEN a.id END) as completed_assessments,
    AVG(a.compliance_score) as avg_compliance_score,
    COUNT(DISTINCT ar.id) as total_responses,
    COUNT(DISTINCT CASE WHEN ar.compliance_status = 'compliant' THEN ar.id END) as compliant_responses
FROM organizations o
LEFT JOIN assessments a ON o.id = a.organization_id
LEFT JOIN assessment_responses ar ON a.id = ar.assessment_id
GROUP BY o.id, o.name;

-- Risk assessment summary view
CREATE OR REPLACE VIEW v_risk_summary AS
SELECT 
    o.id as organization_id,
    o.name as organization_name,
    COUNT(r.id) as total_risks,
    COUNT(CASE WHEN r.risk_level = 'critical' THEN 1 END) as critical_risks,
    COUNT(CASE WHEN r.risk_level = 'high' THEN 1 END) as high_risks,
    COUNT(CASE WHEN r.risk_level = 'medium' THEN 1 END) as medium_risks,
    COUNT(CASE WHEN r.risk_level = 'low' THEN 1 END) as low_risks,
    AVG(r.risk_score) as avg_risk_score
FROM organizations o
LEFT JOIN risk_assessments r ON o.id = r.organization_id
GROUP BY o.id, o.name;

-- ==========================================
-- 🏁 SCHEMA COMPLETION
-- ==========================================

-- Grant permissions to assessment module user (if exists)
-- DO $$
-- BEGIN
--     IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'assessment_user') THEN
--         GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO assessment_user;
--         GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO assessment_user;
--         GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO assessment_user;
--     END IF;
-- END
-- $$;

-- Log schema creation
INSERT INTO system_logs (level, message, context)
VALUES (
    'INFO',
    'Assessment Module database schema initialized successfully',
    '{"version": "1.0.0", "tables_created": 25, "indexes_created": 35, "views_created": 3}'
);

COMMIT;
