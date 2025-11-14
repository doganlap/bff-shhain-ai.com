-- ============================================================================
-- SHAHIN COMPLIANCE DATABASE SCHEMA
-- Enterprise GRC Compliance Database for Saudi Market
-- ============================================================================

-- Create database
CREATE DATABASE IF NOT EXISTS shahin_compliance
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE shahin_compliance;

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Organizations table with Saudi market focus
CREATE TABLE organizations (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255),
    sector ENUM('banking', 'healthcare', 'energy', 'technology', 'government', 'telecom', 'retail', 'manufacturing') NOT NULL,
    industry VARCHAR(100),
    country VARCHAR(100) DEFAULT 'Saudi Arabia',
    city VARCHAR(100),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    website VARCHAR(255),
    license_number VARCHAR(100),
    established_year YEAR,
    employee_count ENUM('1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'),
    status ENUM('active', 'inactive', 'suspended', 'pending') DEFAULT 'active',

    -- Saudi-specific fields
    cr_number VARCHAR(50), -- Commercial Registration
    tax_number VARCHAR(50),
    gosi_number VARCHAR(50),
    sdaia_license VARCHAR(50), -- SDAIA AI License
    nca_certification ENUM('none', 'pending', 'certified', 'expired') DEFAULT 'none',

    -- Compliance metadata
    compliance_score DECIMAL(5,2) DEFAULT 0.00,
    last_assessment_date DATE,
    next_assessment_date DATE,
    risk_level ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_sector (sector),
    INDEX idx_status (status),
    INDEX idx_cr_number (cr_number),
    INDEX idx_compliance_score (compliance_score),
    INDEX idx_risk_level (risk_level)
);

-- Users with enhanced Saudi market roles
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    organization_id VARCHAR(36),
    email VARCHAR(255) UNIQUE NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    password_hash VARCHAR(255),

    -- Personal info
    full_name VARCHAR(255) NOT NULL,
    full_name_ar VARCHAR(255),
    phone VARCHAR(50),
    national_id VARCHAR(20), -- Saudi National ID/Iqama
    job_title VARCHAR(100),
    job_title_ar VARCHAR(100),
    department VARCHAR(100),

    -- Roles and permissions (Saudi market focused)
    role ENUM(
        'super_admin', 'admin', 'compliance_officer', 'auditor',
        'risk_manager', 'it_security', 'legal_counsel', 'ciso',
        'data_protection_officer', 'board_member', 'viewer'
    ) DEFAULT 'viewer',

    -- Saudi-specific permissions
    can_access_sama_data BOOLEAN DEFAULT FALSE,
    can_access_health_data BOOLEAN DEFAULT FALSE,
    can_access_government_data BOOLEAN DEFAULT FALSE,

    -- Account status
    status ENUM('active', 'inactive', 'suspended', 'pending_verification') DEFAULT 'pending_verification',
    last_login_at TIMESTAMP NULL,
    login_attempts INT DEFAULT 0,
    locked_until TIMESTAMP NULL,

    -- Multi-factor authentication
    mfa_enabled BOOLEAN DEFAULT FALSE,
    mfa_secret VARCHAR(255),

    -- Audit fields
    created_by VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,

    INDEX idx_organization (organization_id),
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_status (status),
    INDEX idx_last_login (last_login_at)
);

-- ============================================================================
-- COMPLIANCE FRAMEWORKS & CONTROLS
-- ============================================================================

-- Compliance frameworks with Saudi market focus
CREATE TABLE compliance_frameworks (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255),
    code VARCHAR(50) UNIQUE NOT NULL, -- ISO27001, SOX, SAMA-CSF, NCA, etc.
    version VARCHAR(20),
    description TEXT,
    description_ar TEXT,

    -- Framework metadata
    authority VARCHAR(100), -- ISO, SOX, SAMA, NCA, etc.
    country VARCHAR(100) DEFAULT 'Saudi Arabia',
    category ENUM('security', 'privacy', 'financial', 'health', 'general') DEFAULT 'general',
    applicability TEXT, -- When to apply this framework

    -- Status and lifecycle
    status ENUM('active', 'deprecated', 'draft') DEFAULT 'active',
    effective_date DATE,
    review_date DATE,

    -- Scoring and risk
    default_risk_weight DECIMAL(3,2) DEFAULT 1.00,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_code (code),
    INDEX idx_category (category),
    INDEX idx_status (status),
    INDEX idx_authority (authority)
);

-- Compliance controls (the actual requirements)
CREATE TABLE compliance_controls (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    framework_id VARCHAR(36) NOT NULL,
    control_id VARCHAR(100) NOT NULL, -- Unique within framework
    title VARCHAR(500) NOT NULL,
    title_ar VARCHAR(500),
    description TEXT,
    description_ar TEXT,

    -- Control classification
    category VARCHAR(100),
    subcategory VARCHAR(100),
    domain VARCHAR(100), -- Technical, Administrative, Physical

    -- Risk and priority
    risk_level ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    priority INT DEFAULT 3, -- 1=Critical, 5=Low

    -- Implementation guidance
    implementation_guidance TEXT,
    implementation_guidance_ar TEXT,
    testing_procedures TEXT,
    testing_procedures_ar TEXT,

    -- Evidence requirements
    evidence_required BOOLEAN DEFAULT TRUE,
    evidence_types JSON, -- Array of evidence types

    -- Control lifecycle
    status ENUM('active', 'deprecated', 'under_review') DEFAULT 'active',
    version VARCHAR(20) DEFAULT '1.0',

    -- Saudi market specific
    sama_relevant BOOLEAN DEFAULT FALSE,
    nca_relevant BOOLEAN DEFAULT FALSE,
    moh_relevant BOOLEAN DEFAULT FALSE,
    sfda_relevant BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (framework_id) REFERENCES compliance_frameworks(id) ON DELETE CASCADE,

    UNIQUE KEY unique_control (framework_id, control_id),
    INDEX idx_framework (framework_id),
    INDEX idx_risk_level (risk_level),
    INDEX idx_category (category),
    INDEX idx_status (status)
);

-- Control evidence requirements (detailed)
CREATE TABLE control_evidence_requirements (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    control_id VARCHAR(36) NOT NULL,
    evidence_type ENUM(
        'policy_document', 'procedure_document', 'audit_report',
        'configuration_screenshot', 'log_file', 'certificate',
        'training_record', 'assessment_report', 'incident_report'
    ) NOT NULL,
    evidence_name VARCHAR(255) NOT NULL,
    evidence_name_ar VARCHAR(255),
    description TEXT,
    description_ar TEXT,

    -- Evidence validation
    is_mandatory BOOLEAN DEFAULT TRUE,
    validation_criteria JSON,
    weight_percentage DECIMAL(5,2) DEFAULT 100.00,

    -- Document requirements
    max_file_size_mb DECIMAL(5,2),
    allowed_file_types JSON,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (control_id) REFERENCES compliance_controls(id) ON DELETE CASCADE,
    INDEX idx_control (control_id),
    INDEX idx_evidence_type (evidence_type)
);

-- ============================================================================
-- ASSESSMENTS & AUDITS
-- ============================================================================

-- Compliance assessments
CREATE TABLE assessments (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    organization_id VARCHAR(36) NOT NULL,
    framework_id VARCHAR(36) NOT NULL,
    assessor_id VARCHAR(36),

    -- Assessment details
    title VARCHAR(255) NOT NULL,
    description TEXT,
    assessment_type ENUM('gap_analysis', 'compliance_audit', 'risk_assessment', 'certification_prep') DEFAULT 'gap_analysis',

    -- Dates and status
    planned_start_date DATE,
    actual_start_date DATE,
    planned_end_date DATE,
    actual_end_date DATE,
    status ENUM('planned', 'in_progress', 'completed', 'cancelled', 'on_hold') DEFAULT 'planned',

    -- Scoring and results
    overall_score DECIMAL(5,2),
    max_possible_score DECIMAL(5,2) DEFAULT 100.00,
    compliance_percentage DECIMAL(5,2),
    risk_level ENUM('low', 'medium', 'high', 'critical'),

    -- Metadata
    scope TEXT,
    methodology TEXT,
    recommendations TEXT,

    -- Audit trail
    created_by VARCHAR(36) NOT NULL,
    approved_by VARCHAR(36),
    approved_at TIMESTAMP NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    FOREIGN KEY (framework_id) REFERENCES compliance_frameworks(id),
    FOREIGN KEY (assessor_id) REFERENCES users(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (approved_by) REFERENCES users(id),

    INDEX idx_organization (organization_id),
    INDEX idx_framework (framework_id),
    INDEX idx_assessor (assessor_id),
    INDEX idx_status (status),
    INDEX idx_planned_start (planned_start_date)
);

-- Assessment control results
CREATE TABLE assessment_control_results (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    assessment_id VARCHAR(36) NOT NULL,
    control_id VARCHAR(36) NOT NULL,

    -- Evaluation
    status ENUM('not_applicable', 'not_implemented', 'partially_implemented', 'implemented', 'exceeds_requirements') DEFAULT 'not_implemented',
    score DECIMAL(5,2), -- 0-100
    evidence_provided BOOLEAN DEFAULT FALSE,

    -- Assessment details
    findings TEXT,
    recommendations TEXT,
    remediation_plan TEXT,
    remediation_due_date DATE,

    -- Risk assessment
    inherent_risk ENUM('low', 'medium', 'high', 'critical'),
    residual_risk ENUM('low', 'medium', 'high', 'critical'),
    risk_reduction_percentage DECIMAL(5,2),

    -- Reviewer feedback
    reviewer_id VARCHAR(36),
    review_notes TEXT,
    reviewed_at TIMESTAMP NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (assessment_id) REFERENCES assessments(id) ON DELETE CASCADE,
    FOREIGN KEY (control_id) REFERENCES compliance_controls(id),
    FOREIGN KEY (reviewer_id) REFERENCES users(id),

    UNIQUE KEY unique_assessment_control (assessment_id, control_id),
    INDEX idx_assessment (assessment_id),
    INDEX idx_control (control_id),
    INDEX idx_status (status),
    INDEX idx_score (score)
);

-- ============================================================================
-- EVIDENCE MANAGEMENT
-- ============================================================================

-- Evidence repository
CREATE TABLE evidence (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    organization_id VARCHAR(36) NOT NULL,
    assessment_id VARCHAR(36),
    control_id VARCHAR(36),

    -- File metadata
    original_filename VARCHAR(255) NOT NULL,
    stored_filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size_bytes BIGINT,
    mime_type VARCHAR(100),
    file_hash VARCHAR(128), -- SHA-256

    -- Evidence details
    title VARCHAR(255) NOT NULL,
    description TEXT,
    evidence_type ENUM(
        'policy', 'procedure', 'screenshot', 'log', 'certificate',
        'audit_report', 'training_record', 'configuration', 'other'
    ) DEFAULT 'other',

    -- Compliance mapping
    framework_id VARCHAR(36),
    control_reference VARCHAR(100),

    -- Validation and approval
    status ENUM('draft', 'submitted', 'under_review', 'approved', 'rejected') DEFAULT 'draft',
    submitted_by VARCHAR(36),
    submitted_at TIMESTAMP NULL,
    reviewed_by VARCHAR(36),
    reviewed_at TIMESTAMP NULL,
    review_notes TEXT,

    -- Retention and archival
    retention_period_years INT DEFAULT 7,
    archival_date DATE NULL,
    destruction_date DATE NULL,

    -- Audit trail
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    FOREIGN KEY (assessment_id) REFERENCES assessments(id),
    FOREIGN KEY (control_id) REFERENCES compliance_controls(id),
    FOREIGN KEY (framework_id) REFERENCES compliance_frameworks(id),
    FOREIGN KEY (submitted_by) REFERENCES users(id),
    FOREIGN KEY (reviewed_by) REFERENCES users(id),

    INDEX idx_organization (organization_id),
    INDEX idx_assessment (assessment_id),
    INDEX idx_control (control_id),
    INDEX idx_status (status),
    INDEX idx_evidence_type (evidence_type),
    INDEX idx_file_hash (file_hash)
);

-- ============================================================================
-- RISK MANAGEMENT
-- ============================================================================

-- Risk register
CREATE TABLE risks (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    organization_id VARCHAR(36) NOT NULL,
    assessment_id VARCHAR(36),

    -- Risk identification
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category ENUM(
        'strategic', 'operational', 'financial', 'compliance',
        'reputational', 'cyber_security', 'data_privacy', 'legal',
        'supply_chain', 'human_resources', 'technology', 'other'
    ) DEFAULT 'other',

    -- Risk assessment (NIST-based)
    likelihood ENUM('very_low', 'low', 'moderate', 'high', 'very_high') DEFAULT 'moderate',
    impact ENUM('very_low', 'low', 'moderate', 'high', 'very_high') DEFAULT 'moderate',
    inherent_risk_score INT GENERATED ALWAYS AS (
        CASE
            WHEN likelihood = 'very_low' AND impact = 'very_low' THEN 1
            WHEN likelihood = 'very_low' AND impact = 'low' THEN 2
            WHEN likelihood = 'very_low' AND impact = 'moderate' THEN 3
            WHEN likelihood = 'very_low' AND impact = 'high' THEN 4
            WHEN likelihood = 'very_low' AND impact = 'very_high' THEN 5
            WHEN likelihood = 'low' AND impact = 'very_low' THEN 2
            WHEN likelihood = 'low' AND impact = 'low' THEN 4
            WHEN likelihood = 'low' AND impact = 'moderate' THEN 6
            WHEN likelihood = 'low' AND impact = 'high' THEN 8
            WHEN likelihood = 'low' AND impact = 'very_high' THEN 10
            WHEN likelihood = 'moderate' AND impact = 'very_low' THEN 3
            WHEN likelihood = 'moderate' AND impact = 'low' THEN 6
            WHEN likelihood = 'moderate' AND impact = 'moderate' THEN 9
            WHEN likelihood = 'moderate' AND impact = 'high' THEN 12
            WHEN likelihood = 'moderate' AND impact = 'very_high' THEN 15
            WHEN likelihood = 'high' AND impact = 'very_low' THEN 4
            WHEN likelihood = 'high' AND impact = 'low' THEN 8
            WHEN likelihood = 'high' AND impact = 'moderate' THEN 12
            WHEN likelihood = 'high' AND impact = 'high' THEN 16
            WHEN likelihood = 'high' AND impact = 'very_high' THEN 20
            WHEN likelihood = 'very_high' AND impact = 'very_low' THEN 5
            WHEN likelihood = 'very_high' AND impact = 'low' THEN 10
            WHEN likelihood = 'very_high' AND impact = 'moderate' THEN 15
            WHEN likelihood = 'very_high' AND impact = 'high' THEN 20
            WHEN likelihood = 'very_high' AND impact = 'very_high' THEN 25
            ELSE 9
        END
    ) STORED,

    -- Risk treatment
    status ENUM('identified', 'assessed', 'mitigated', 'accepted', 'transferred', 'avoided', 'closed') DEFAULT 'identified',
    treatment_strategy ENUM('accept', 'avoid', 'mitigate', 'transfer') DEFAULT 'mitigate',
    treatment_plan TEXT,
    responsible_person VARCHAR(36), -- User ID

    -- Controls and mitigation
    mitigation_controls JSON, -- Array of control IDs
    mitigation_cost DECIMAL(15,2),
    mitigation_timeline_months INT,

    -- Monitoring and review
    review_frequency ENUM('monthly', 'quarterly', 'annually', 'as_needed') DEFAULT 'quarterly',
    next_review_date DATE,
    last_reviewed_at TIMESTAMP NULL,
    last_reviewed_by VARCHAR(36),

    -- Saudi market specific
    sama_relevant BOOLEAN DEFAULT FALSE,
    regulatory_authority ENUM('SAMA', 'NCA', 'MOH', 'SFDA', 'CMA', 'CSD', 'other') DEFAULT 'other',

    created_by VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    FOREIGN KEY (assessment_id) REFERENCES assessments(id),
    FOREIGN KEY (responsible_person) REFERENCES users(id),
    FOREIGN KEY (last_reviewed_by) REFERENCES users(id),
    FOREIGN KEY (created_by) REFERENCES users(id),

    INDEX idx_organization (organization_id),
    INDEX idx_category (category),
    INDEX idx_status (status),
    INDEX idx_inherent_risk (inherent_risk_score),
    INDEX idx_likelihood (likelihood),
    INDEX idx_impact (impact),
    INDEX idx_next_review (next_review_date)
);

-- ============================================================================
-- AUDIT & MONITORING
-- ============================================================================

-- Audit logs
CREATE TABLE audit_logs (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    organization_id VARCHAR(36),
    user_id VARCHAR(36),

    -- Audit details
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id VARCHAR(36),
    action_details JSON,

    -- Context
    ip_address VARCHAR(45),
    user_agent TEXT,
    session_id VARCHAR(255),

    -- Risk assessment
    risk_level ENUM('low', 'medium', 'high', 'critical') DEFAULT 'low',
    anomaly_detected BOOLEAN DEFAULT FALSE,

    -- Compliance mapping
    compliance_framework VARCHAR(50),
    control_reference VARCHAR(100),

    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (user_id) REFERENCES users(id),

    INDEX idx_organization (organization_id),
    INDEX idx_user (user_id),
    INDEX idx_action (action),
    INDEX idx_resource_type (resource_type),
    INDEX idx_timestamp (timestamp),
    INDEX idx_risk_level (risk_level)
);

-- System monitoring
CREATE TABLE system_monitoring (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(15,6),
    metric_unit VARCHAR(20),

    -- Context
    component VARCHAR(50), -- frontend, backend, database, etc.
    environment ENUM('development', 'staging', 'production') DEFAULT 'production',
    host_name VARCHAR(100),

    -- Thresholds
    warning_threshold DECIMAL(15,6),
    critical_threshold DECIMAL(15,6),

    -- Status
    status ENUM('normal', 'warning', 'critical') DEFAULT 'normal',

    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_metric (metric_name),
    INDEX idx_component (component),
    INDEX idx_status (status),
    INDEX idx_timestamp (timestamp)
);

-- ============================================================================
-- SAUDI MARKET SPECIFIC TABLES
-- ============================================================================

-- SAMA compliance tracking
CREATE TABLE sama_compliance (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    organization_id VARCHAR(36) NOT NULL,
    sama_framework_version VARCHAR(20) DEFAULT '2021',

    -- Compliance status
    overall_compliance_score DECIMAL(5,2),
    critical_controls_compliant INT DEFAULT 0,
    total_critical_controls INT DEFAULT 0,

    -- Regulatory deadlines
    last_sama_audit DATE,
    next_sama_audit DATE,
    regulatory_deadlines JSON,

    -- SAMA-specific requirements
    cybersecurity_maturity_level ENUM('1', '2', '3', '4', '5'),
    incident_reporting_compliance BOOLEAN DEFAULT FALSE,
    data_protection_compliance BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    INDEX idx_organization (organization_id),
    INDEX idx_maturity_level (cybersecurity_maturity_level)
);

-- NCA cybersecurity controls tracking
CREATE TABLE nca_compliance (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    organization_id VARCHAR(36) NOT NULL,

    -- NCA domains compliance
    governance_compliance DECIMAL(5,2),
    protection_compliance DECIMAL(5,2),
    defense_compliance DECIMAL(5,2),
    response_compliance DECIMAL(5,2),
    recovery_compliance DECIMAL(5,2),

    -- Maturity levels
    overall_maturity_level ENUM('initial', 'developing', 'defined', 'managed', 'optimizing'),
    target_maturity_level ENUM('initial', 'developing', 'defined', 'managed', 'optimizing'),

    -- Certification status
    nca_certified BOOLEAN DEFAULT FALSE,
    certification_date DATE NULL,
    certification_expiry DATE NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    INDEX idx_organization (organization_id),
    INDEX idx_maturity (overall_maturity_level),
    INDEX idx_certified (nca_certified)
);

-- ============================================================================
-- VIEWS FOR REPORTING
-- ============================================================================

-- Compliance dashboard view
CREATE VIEW compliance_dashboard AS
SELECT
    o.id as organization_id,
    o.name as organization_name,
    o.sector,
    COUNT(DISTINCT f.id) as frameworks_count,
    COUNT(DISTINCT a.id) as assessments_count,
    AVG(a.compliance_percentage) as avg_compliance_score,
    COUNT(DISTINCT CASE WHEN a.status = 'completed' THEN a.id END) as completed_assessments,
    COUNT(DISTINCT r.id) as active_risks,
    AVG(CASE WHEN r.inherent_risk_score IS NOT NULL THEN r.inherent_risk_score ELSE 0 END) as avg_risk_score
FROM organizations o
LEFT JOIN assessments a ON o.id = a.organization_id
LEFT JOIN compliance_frameworks f ON f.country = 'Saudi Arabia'
LEFT JOIN risks r ON o.id = r.organization_id AND r.status IN ('identified', 'assessed', 'mitigated')
GROUP BY o.id, o.name, o.sector;

-- Risk heatmap view
CREATE VIEW risk_heatmap AS
SELECT
    organization_id,
    category,
    COUNT(*) as risk_count,
    AVG(inherent_risk_score) as avg_risk_score,
    MAX(inherent_risk_score) as max_risk_score,
    GROUP_CONCAT(DISTINCT status) as risk_statuses
FROM risks
WHERE status IN ('identified', 'assessed', 'mitigated', 'accepted')
GROUP BY organization_id, category;

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Composite indexes for common queries
CREATE INDEX idx_assessments_org_date ON assessments(organization_id, planned_start_date);
CREATE INDEX idx_evidence_org_status ON evidence(organization_id, status);
CREATE INDEX idx_audit_org_timestamp ON audit_logs(organization_id, timestamp);
CREATE INDEX idx_risks_org_status ON risks(organization_id, status);

-- Full-text search indexes
CREATE FULLTEXT INDEX ft_idx_frameworks ON compliance_frameworks(name, description);
CREATE FULLTEXT INDEX ft_idx_controls ON compliance_controls(title, description, implementation_guidance);
CREATE FULLTEXT INDEX ft_idx_risks ON risks(title, description);

-- ============================================================================
-- DATA POPULATION (SAMPLE DATA)
-- ============================================================================

-- Insert sample compliance frameworks
INSERT INTO compliance_frameworks (name, name_ar, code, version, authority, category, description) VALUES
('NCA Essential Cybersecurity Controls', 'متطلبات الأمن السيبراني الأساسية - الهيئة الوطنية للأمن السيبراني', 'NCA-ESSENTIAL', '2022', 'NCA', 'security', 'المتطلبات الأساسية للأمن السيبراني في المملكة العربية السعودية'),
('SAMA Cybersecurity Framework', 'إطار الأمن السيبراني - البنك المركزي السعودي', 'SAMA-CSF', '2021', 'SAMA', 'security', 'إطار الأمن السيبراني للمؤسسات المالية في المملكة العربية السعودية'),
('ISO 27001 Information Security', 'أيزو 27001 أمن المعلومات', 'ISO27001', '2022', 'ISO', 'security', 'المعيار الدولي لإدارة أمن المعلومات'),
('Saudi Data Protection Law', 'قانون حماية البيانات السعودي', 'SDPL', '2023', 'Government', 'privacy', 'قانون حماية البيانات الشخصية في المملكة العربية السعودية');

-- Insert sample organization
INSERT INTO organizations (name, name_ar, sector, industry, city, contact_email, cr_number, employee_count, compliance_score) VALUES
('Saudi Advanced Technology Company', 'شركة التقنية المتقدمة السعودية', 'technology', 'Software Development', 'Riyadh', 'contact@satc.sa', '1234567890', '201-500', 85.50);

COMMIT;

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
