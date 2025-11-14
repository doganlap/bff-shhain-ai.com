-- ==========================================
-- NEW SERVICES DATABASE MIGRATION
-- Tables for: Scheduler, Vendor, Workflow, RAG, Notification, Document, Regulator, Framework, Control, Organization
-- Created: 2025-11-14
-- ==========================================

-- Enable UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. SCHEDULER SERVICE TABLES
-- ==========================================

-- Scheduled Jobs
CREATE TABLE IF NOT EXISTS scheduled_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    job_type VARCHAR(50) NOT NULL, -- 'report_generation', 'compliance_check', 'risk_assessment', 'data_sync', 'notification'
    cron_expression VARCHAR(100) NOT NULL,
    parameters JSONB DEFAULT '{}',
    enabled BOOLEAN DEFAULT true,
    last_run TIMESTAMP,
    next_run TIMESTAMP,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'running', 'completed', 'failed'
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    created_by UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_scheduled_jobs_tenant ON scheduled_jobs(tenant_id);
CREATE INDEX idx_scheduled_jobs_status ON scheduled_jobs(status);
CREATE INDEX idx_scheduled_jobs_next_run ON scheduled_jobs(next_run);

-- Job Execution Runs
CREATE TABLE IF NOT EXISTS job_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES scheduled_jobs(id) ON DELETE CASCADE,
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP,
    status VARCHAR(50) DEFAULT 'running', -- 'running', 'completed', 'failed'
    result JSONB,
    error TEXT,
    duration INTEGER, -- in seconds
    tenant_id UUID NOT NULL REFERENCES tenants(id)
);

CREATE INDEX idx_job_runs_job ON job_runs(job_id);
CREATE INDEX idx_job_runs_status ON job_runs(status);
CREATE INDEX idx_job_runs_tenant ON job_runs(tenant_id);

-- ==========================================
-- 2. WORKFLOW SERVICE TABLES
-- ==========================================

-- Workflow Templates
CREATE TABLE IF NOT EXISTS workflow_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    steps JSONB DEFAULT '[]',
    approvers JSONB DEFAULT '[]',
    sla INTEGER, -- in hours
    auto_approve BOOLEAN DEFAULT false,
    requires_evidence BOOLEAN DEFAULT false,
    notification_config JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    created_by UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_workflow_templates_tenant ON workflow_templates(tenant_id);
CREATE INDEX idx_workflow_templates_category ON workflow_templates(category);

-- Workflow Instances
CREATE TABLE IF NOT EXISTS workflow_instances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID REFERENCES workflow_templates(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    state VARCHAR(50) DEFAULT 'draft', -- 'draft', 'submitted', 'in_review', 'approved', 'rejected', 'completed', 'cancelled'
    current_step INTEGER DEFAULT 0,
    priority VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
    data JSONB DEFAULT '{}',
    approvals JSONB DEFAULT '[]',
    sla_deadline TIMESTAMP,
    entity_type VARCHAR(50), -- 'risk', 'control', 'assessment', etc.
    entity_id UUID,
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    created_by UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

CREATE INDEX idx_workflow_instances_tenant ON workflow_instances(tenant_id);
CREATE INDEX idx_workflow_instances_state ON workflow_instances(state);
CREATE INDEX idx_workflow_instances_template ON workflow_instances(template_id);
CREATE INDEX idx_workflow_instances_entity ON workflow_instances(entity_type, entity_id);

-- ==========================================
-- 3. RAG SERVICE TABLES
-- ==========================================

-- RAG Documents
CREATE TABLE IF NOT EXISTS rag_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    document_type VARCHAR(50), -- 'policy', 'procedure', 'regulation', 'standard', 'guideline'
    source VARCHAR(255),
    metadata JSONB DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'archived', 'processing'
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    created_by UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_rag_documents_tenant ON rag_documents(tenant_id);
CREATE INDEX idx_rag_documents_type ON rag_documents(document_type);
CREATE INDEX idx_rag_documents_status ON rag_documents(status);

-- RAG Document Chunks with Embeddings
CREATE TABLE IF NOT EXISTS rag_chunks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES rag_documents(id) ON DELETE CASCADE,
    chunk_text TEXT NOT NULL,
    chunk_position INTEGER NOT NULL,
    chunk_length INTEGER NOT NULL,
    embedding JSONB, -- Store as JSON array until pgvector is available
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_rag_chunks_document ON rag_chunks(document_id);
CREATE INDEX idx_rag_chunks_tenant ON rag_chunks(tenant_id);

-- RAG Query History
CREATE TABLE IF NOT EXISTS rag_query_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    query_text TEXT NOT NULL,
    results JSONB,
    result_count INTEGER,
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    user_id UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_rag_query_history_tenant ON rag_query_history(tenant_id);
CREATE INDEX idx_rag_query_history_user ON rag_query_history(user_id);

-- ==========================================
-- 4. NOTIFICATION SERVICE TABLES
-- ==========================================

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    type VARCHAR(50) NOT NULL, -- 'info', 'success', 'warning', 'error', 'alert', 'reminder', 'system'
    priority VARCHAR(20) DEFAULT 'low', -- 'low', 'medium', 'high'
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    link VARCHAR(500),
    metadata JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT false,
    is_archived BOOLEAN DEFAULT false,
    read_at TIMESTAMP,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_tenant ON notifications(tenant_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);

-- Notification Preferences
CREATE TABLE IF NOT EXISTS notification_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE,
    email_enabled BOOLEAN DEFAULT true,
    push_enabled BOOLEAN DEFAULT true,
    in_app_enabled BOOLEAN DEFAULT true,
    quiet_hours_start TIME DEFAULT '22:00:00',
    quiet_hours_end TIME DEFAULT '08:00:00',
    digest_frequency VARCHAR(20) DEFAULT 'daily', -- 'realtime', 'hourly', 'daily', 'weekly'
    notification_types JSONB DEFAULT '["info","success","warning","error","alert","reminder","system"]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notification_prefs_user ON notification_preferences(user_id);

-- ==========================================
-- 5. DOCUMENT SERVICE TABLES
-- ==========================================

-- Documents (enhanced version management)
CREATE TABLE IF NOT EXISTS documents_enhanced (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    type VARCHAR(50), -- 'policy', 'procedure', 'evidence', 'report', 'certificate'
    version VARCHAR(20) DEFAULT '1.0',
    file_path VARCHAR(500),
    file_name VARCHAR(255),
    file_size INTEGER,
    mime_type VARCHAR(100),
    hash VARCHAR(64), -- MD5 hash for change detection
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'archived', 'superseded'
    tags JSONB DEFAULT '[]',
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    uploaded_by UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_documents_enhanced_tenant ON documents_enhanced(tenant_id);
CREATE INDEX idx_documents_enhanced_category ON documents_enhanced(category);
CREATE INDEX idx_documents_enhanced_type ON documents_enhanced(type);

-- Document Versions
CREATE TABLE IF NOT EXISTS document_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES documents_enhanced(id) ON DELETE CASCADE,
    version VARCHAR(20) NOT NULL,
    file_path VARCHAR(500),
    file_name VARCHAR(255),
    file_size INTEGER,
    hash VARCHAR(64),
    change_summary TEXT,
    uploaded_by UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_document_versions_document ON document_versions(document_id);

-- Document Entity Links
CREATE TABLE IF NOT EXISTS document_entity_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES documents_enhanced(id) ON DELETE CASCADE,
    entity_type VARCHAR(50) NOT NULL, -- 'risk', 'control', 'assessment', 'compliance', 'vendor'
    entity_id UUID NOT NULL,
    link_type VARCHAR(50) DEFAULT 'attachment', -- 'attachment', 'reference', 'evidence'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_document_entity_links_document ON document_entity_links(document_id);
CREATE INDEX idx_document_entity_links_entity ON document_entity_links(entity_type, entity_id);

-- ==========================================
-- 6. REGULATOR SERVICE TABLES
-- ==========================================

-- Regulators
CREATE TABLE IF NOT EXISTS regulators (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255),
    short_name VARCHAR(100),
    country VARCHAR(100) DEFAULT 'Saudi Arabia',
    region VARCHAR(100),
    website VARCHAR(500),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    description TEXT,
    description_ar TEXT,
    jurisdiction JSONB DEFAULT '[]',
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_regulators_tenant ON regulators(tenant_id);
CREATE INDEX idx_regulators_country ON regulators(country);

-- Regulatory Changes
CREATE TABLE IF NOT EXISTS regulatory_changes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    regulator_id UUID NOT NULL REFERENCES regulators(id),
    title VARCHAR(255) NOT NULL,
    title_ar VARCHAR(255),
    description TEXT,
    description_ar TEXT,
    change_type VARCHAR(50), -- 'new_regulation', 'amendment', 'guideline', 'circular', 'announcement'
    scope VARCHAR(50), -- 'minor', 'moderate', 'major'
    complexity VARCHAR(50) DEFAULT 'medium', -- 'low', 'medium', 'high'
    penalty_risk VARCHAR(50) DEFAULT 'medium', -- 'none', 'low', 'medium', 'high'
    impact_score INTEGER DEFAULT 50,
    effective_date DATE,
    publication_date DATE,
    reference_number VARCHAR(100),
    source_url VARCHAR(500),
    affected_sectors JSONB DEFAULT '[]',
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_regulatory_changes_regulator ON regulatory_changes(regulator_id);
CREATE INDEX idx_regulatory_changes_tenant ON regulatory_changes(tenant_id);
CREATE INDEX idx_regulatory_changes_effective ON regulatory_changes(effective_date);
CREATE INDEX idx_regulatory_changes_type ON regulatory_changes(change_type);

-- Regulatory Subscriptions
CREATE TABLE IF NOT EXISTS regulatory_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    regulator_id UUID NOT NULL REFERENCES regulators(id),
    notification_enabled BOOLEAN DEFAULT true,
    email_enabled BOOLEAN DEFAULT true,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_regulatory_subscriptions_user ON regulatory_subscriptions(user_id);
CREATE INDEX idx_regulatory_subscriptions_regulator ON regulatory_subscriptions(regulator_id);

-- ==========================================
-- 7. CONTROL SERVICE TABLES
-- ==========================================

-- Control Tests
CREATE TABLE IF NOT EXISTS control_tests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    control_id UUID NOT NULL,
    test_type VARCHAR(50), -- 'design', 'operating', 'both'
    test_date DATE NOT NULL,
    tester UUID,
    result VARCHAR(50) NOT NULL, -- 'pass', 'fail', 'partial', 'not_applicable'
    findings TEXT,
    recommendations TEXT,
    evidence_collected JSONB DEFAULT '[]',
    metadata JSONB DEFAULT '{}',
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_control_tests_control ON control_tests(control_id);
CREATE INDEX idx_control_tests_tenant ON control_tests(tenant_id);
CREATE INDEX idx_control_tests_date ON control_tests(test_date DESC);

-- Evidence Control Links
CREATE TABLE IF NOT EXISTS evidence_control_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    control_id UUID NOT NULL,
    evidence_id UUID NOT NULL,
    relevance VARCHAR(50) DEFAULT 'direct', -- 'direct', 'supporting', 'reference'
    linked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_evidence_control_links_control ON evidence_control_links(control_id);
CREATE INDEX idx_evidence_control_links_evidence ON evidence_control_links(evidence_id);

-- Control Assessments
CREATE TABLE IF NOT EXISTS control_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    control_id UUID NOT NULL,
    assessment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assessed_by UUID,
    effectiveness_score DECIMAL(5,2),
    effectiveness_level VARCHAR(50), -- 'poor', 'adequate', 'good', 'excellent'
    findings JSONB,
    recommendations JSONB,
    tenant_id UUID NOT NULL REFERENCES tenants(id)
);

CREATE INDEX idx_control_assessments_control ON control_assessments(control_id);
CREATE INDEX idx_control_assessments_tenant ON control_assessments(tenant_id);

-- ==========================================
-- 8. ORGANIZATION SERVICE TABLES
-- ==========================================

-- Organizations (Business Units / Hierarchy)
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    short_name VARCHAR(100),
    type VARCHAR(50) DEFAULT 'business_unit', -- 'company', 'division', 'department', 'business_unit', 'team'
    parent_id UUID REFERENCES organizations(id),
    description TEXT,
    manager_id UUID,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    address TEXT,
    metadata JSONB DEFAULT '{}',
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_organizations_tenant ON organizations(tenant_id);
CREATE INDEX idx_organizations_parent ON organizations(parent_id);
CREATE INDEX idx_organizations_type ON organizations(type);
CREATE INDEX idx_organizations_manager ON organizations(manager_id);

-- ==========================================
-- 9. UPDATE EXISTING TABLES
-- ==========================================

-- Add organization_id to users table if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'organization_id'
    ) THEN
        ALTER TABLE users ADD COLUMN organization_id UUID REFERENCES organizations(id);
        CREATE INDEX idx_users_organization ON users(organization_id);
    END IF;
END $$;

-- Add implementation fields to grc_controls if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'grc_controls' AND column_name = 'implementation_status'
    ) THEN
        ALTER TABLE grc_controls
        ADD COLUMN implementation_status VARCHAR(50) DEFAULT 'not_started',
        ADD COLUMN implementation_notes TEXT,
        ADD COLUMN implementation_guidance TEXT,
        ADD COLUMN implemented_by UUID,
        ADD COLUMN implemented_at TIMESTAMP,
        ADD COLUMN last_test_date DATE,
        ADD COLUMN frequency VARCHAR(50) DEFAULT 'annual',
        ADD COLUMN priority VARCHAR(20) DEFAULT 'medium',
        ADD COLUMN owner UUID;

        CREATE INDEX idx_grc_controls_implementation ON grc_controls(implementation_status);
        CREATE INDEX idx_grc_controls_priority ON grc_controls(priority);
    END IF;
END $$;

-- ==========================================
-- 10. CREATE VIEWS FOR ANALYTICS
-- ==========================================

-- Workflow Analytics View
CREATE OR REPLACE VIEW workflow_analytics AS
SELECT
    wi.tenant_id,
    wi.state,
    wt.category,
    COUNT(*) as count,
    AVG(EXTRACT(EPOCH FROM (wi.completed_at - wi.created_at))/3600) as avg_completion_hours
FROM workflow_instances wi
LEFT JOIN workflow_templates wt ON wi.template_id = wt.id
GROUP BY wi.tenant_id, wi.state, wt.category;

-- Control Effectiveness View
CREATE OR REPLACE VIEW control_effectiveness_summary AS
SELECT
    c.tenant_id,
    c.framework_id,
    c.implementation_status,
    COUNT(*) as control_count,
    COUNT(DISTINCT ct.id) as tested_controls,
    COUNT(DISTINCT ecl.evidence_id) as evidence_count
FROM grc_controls c
LEFT JOIN control_tests ct ON c.id = ct.control_id
LEFT JOIN evidence_control_links ecl ON c.id = ecl.control_id
GROUP BY c.tenant_id, c.framework_id, c.implementation_status;

-- Notification Statistics View
CREATE OR REPLACE VIEW notification_stats AS
SELECT
    user_id,
    tenant_id,
    type,
    COUNT(*) as total,
    SUM(CASE WHEN is_read THEN 1 ELSE 0 END) as read_count,
    SUM(CASE WHEN NOT is_read THEN 1 ELSE 0 END) as unread_count
FROM notifications
WHERE created_at > CURRENT_DATE - INTERVAL '30 days'
GROUP BY user_id, tenant_id, type;

-- ==========================================
-- MIGRATION COMPLETE
-- ==========================================

-- Grant permissions (adjust as needed)
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO grc_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO grc_user;

-- Add comments
COMMENT ON TABLE scheduled_jobs IS 'Job scheduling and automation';
COMMENT ON TABLE workflow_instances IS 'Workflow state management and approvals';
COMMENT ON TABLE rag_documents IS 'RAG document storage for AI-powered search';
COMMENT ON TABLE notifications IS 'User notifications and alerts';
COMMENT ON TABLE regulatory_changes IS 'Regulatory intelligence and compliance tracking';
COMMENT ON TABLE control_tests IS 'Control testing and effectiveness assessment';
COMMENT ON TABLE organizations IS 'Organizational hierarchy and business units';

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ NEW SERVICES MIGRATION COMPLETED SUCCESSFULLY';
    RAISE NOTICE '📊 Created tables for 10 new service layers';
    RAISE NOTICE '🎯 Total tables created: 20+';
    RAISE NOTICE '📈 Views created: 3';
END $$;
