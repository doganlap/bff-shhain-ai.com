-- ==========================================
-- 🔧 DATABASE FUNCTIONS AND VIEWS
-- ==========================================
-- Additional database functions and views for GRC system

-- ==========================================
-- 📊 SECTOR INTELLIGENCE FUNCTIONS
-- ==========================================

/**
 * Function to estimate control count based on organization characteristics
 */
CREATE OR REPLACE FUNCTION estimate_control_count(
    p_sector VARCHAR(100),
    p_employee_count INTEGER DEFAULT 100,
    p_processes_personal_data BOOLEAN DEFAULT false,
    p_data_sensitivity_level VARCHAR(20) DEFAULT 'medium'
) RETURNS INTEGER AS $$
DECLARE
    base_count INTEGER := 0;
    multiplier DECIMAL := 1.0;
    sector_multiplier DECIMAL := 1.0;
    data_multiplier DECIMAL := 1.0;
    size_multiplier DECIMAL := 1.0;
BEGIN
    -- Get base control count for sector
    SELECT COUNT(DISTINCT c.id) INTO base_count
    FROM grc_controls c
    JOIN grc_frameworks f ON c.framework_id = f.id
    JOIN regulators r ON f.regulator_id = r.id
    WHERE (r.sector = p_sector OR r.sector = 'all' OR r.sector IS NULL)
      AND c.is_active = true
      AND f.is_active = true
      AND r.is_active = true;

    -- Apply sector-specific multipliers
    CASE p_sector
        WHEN 'finance' THEN sector_multiplier := 1.3;
        WHEN 'healthcare' THEN sector_multiplier := 1.2;
        WHEN 'government' THEN sector_multiplier := 1.4;
        WHEN 'education' THEN sector_multiplier := 1.1;
        WHEN 'energy' THEN sector_multiplier := 1.25;
        WHEN 'telecommunications' THEN sector_multiplier := 1.2;
        ELSE sector_multiplier := 1.0;
    END CASE;

    -- Apply data sensitivity multiplier
    IF p_processes_personal_data THEN
        CASE p_data_sensitivity_level
            WHEN 'critical' THEN data_multiplier := 1.5;
            WHEN 'high' THEN data_multiplier := 1.3;
            WHEN 'medium' THEN data_multiplier := 1.2;
            WHEN 'low' THEN data_multiplier := 1.1;
            ELSE data_multiplier := 1.2;
        END CASE;
    END IF;

    -- Apply organization size multiplier
    CASE
        WHEN p_employee_count >= 10000 THEN size_multiplier := 1.4;
        WHEN p_employee_count >= 1000 THEN size_multiplier := 1.3;
        WHEN p_employee_count >= 500 THEN size_multiplier := 1.2;
        WHEN p_employee_count >= 100 THEN size_multiplier := 1.1;
        ELSE size_multiplier := 1.0;
    END CASE;

    -- Calculate final estimate
    multiplier := sector_multiplier * data_multiplier * size_multiplier;
    
    RETURN ROUND(base_count * multiplier);
END;
$$ LANGUAGE plpgsql;

/**
 * Function to auto-assign regulators based on sector
 */
CREATE OR REPLACE FUNCTION auto_assign_regulators(
    p_sector VARCHAR(100),
    p_sub_sector VARCHAR(100) DEFAULT NULL
) RETURNS TEXT[] AS $$
DECLARE
    regulator_codes TEXT[];
BEGIN
    -- Get applicable regulators for the sector
    SELECT ARRAY_AGG(DISTINCT r.code) INTO regulator_codes
    FROM regulators r
    WHERE (r.sector = p_sector OR r.sector = 'all' OR r.sector IS NULL)
      AND r.is_active = true
    ORDER BY r.code;

    -- Add sector-specific regulators
    CASE p_sector
        WHEN 'finance' THEN
            regulator_codes := regulator_codes || ARRAY['SAMA', 'CMA'];
        WHEN 'healthcare' THEN
            regulator_codes := regulator_codes || ARRAY['MOH', 'SFDA'];
        WHEN 'government' THEN
            regulator_codes := regulator_codes || ARRAY['NCA', 'CITC'];
        WHEN 'telecommunications' THEN
            regulator_codes := regulator_codes || ARRAY['CITC'];
        WHEN 'energy' THEN
            regulator_codes := regulator_codes || ARRAY['ECRA'];
    END CASE;

    -- Always include common regulators
    regulator_codes := regulator_codes || ARRAY['NCA', 'SDAIA'];

    -- Remove duplicates and nulls
    SELECT ARRAY_AGG(DISTINCT code) INTO regulator_codes
    FROM UNNEST(regulator_codes) AS code
    WHERE code IS NOT NULL;

    RETURN COALESCE(regulator_codes, ARRAY[]::TEXT[]);
END;
$$ LANGUAGE plpgsql;

/**
 * Function to auto-assign frameworks based on regulators
 */
CREATE OR REPLACE FUNCTION auto_assign_frameworks(
    p_regulator_codes TEXT[]
) RETURNS TEXT[] AS $$
DECLARE
    framework_codes TEXT[];
BEGIN
    -- Get frameworks for the specified regulators
    SELECT ARRAY_AGG(DISTINCT f.framework_code) INTO framework_codes
    FROM grc_frameworks f
    JOIN regulators r ON f.regulator_id = r.id
    WHERE r.code = ANY(p_regulator_codes)
      AND f.is_active = true
      AND r.is_active = true
    ORDER BY f.framework_code;

    RETURN COALESCE(framework_codes, ARRAY[]::TEXT[]);
END;
$$ LANGUAGE plpgsql;

/**
 * Function to calculate compliance score for an assessment
 */
CREATE OR REPLACE FUNCTION calculate_compliance_score(
    p_assessment_id UUID
) RETURNS DECIMAL AS $$
DECLARE
    total_controls INTEGER := 0;
    compliant_controls INTEGER := 0;
    partially_compliant_controls INTEGER := 0;
    score DECIMAL := 0;
BEGIN
    -- Count total controls and responses
    SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN ar.response_value = 'compliant' THEN 1 END) as compliant,
        COUNT(CASE WHEN ar.response_value = 'partially_compliant' THEN 1 END) as partial
    INTO total_controls, compliant_controls, partially_compliant_controls
    FROM assessment_responses ar
    WHERE ar.assessment_id = p_assessment_id
      AND ar.response_value != 'not_applicable';

    -- Calculate score (compliant = 100%, partially compliant = 50%)
    IF total_controls > 0 THEN
        score := (compliant_controls * 100.0 + partially_compliant_controls * 50.0) / total_controls;
    END IF;

    RETURN ROUND(score, 2);
END;
$$ LANGUAGE plpgsql;

/**
 * Function to get control criticality weight
 */
CREATE OR REPLACE FUNCTION get_criticality_weight(
    p_criticality_level VARCHAR(20)
) RETURNS DECIMAL AS $$
BEGIN
    RETURN CASE p_criticality_level
        WHEN 'critical' THEN 4.0
        WHEN 'high' THEN 3.0
        WHEN 'medium' THEN 2.0
        WHEN 'low' THEN 1.0
        ELSE 2.0
    END;
END;
$$ LANGUAGE plpgsql;

/**
 * Function to calculate weighted compliance score
 */
CREATE OR REPLACE FUNCTION calculate_weighted_compliance_score(
    p_assessment_id UUID
) RETURNS DECIMAL AS $$
DECLARE
    total_weight DECIMAL := 0;
    weighted_score DECIMAL := 0;
    score DECIMAL := 0;
BEGIN
    -- Calculate weighted score based on control criticality
    SELECT 
        SUM(get_criticality_weight(c.criticality_level)) as total_w,
        SUM(
            CASE ar.response_value
                WHEN 'compliant' THEN get_criticality_weight(c.criticality_level) * 100
                WHEN 'partially_compliant' THEN get_criticality_weight(c.criticality_level) * 50
                ELSE 0
            END
        ) as weighted_s
    INTO total_weight, weighted_score
    FROM assessment_responses ar
    JOIN grc_controls c ON ar.control_id = c.id
    WHERE ar.assessment_id = p_assessment_id
      AND ar.response_value != 'not_applicable';

    -- Calculate final score
    IF total_weight > 0 THEN
        score := weighted_score / total_weight;
    END IF;

    RETURN ROUND(score, 2);
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- 📋 USEFUL VIEWS
-- ==========================================

/**
 * View: Sector Controls Summary
 */
CREATE OR REPLACE VIEW sector_controls_view AS
SELECT 
    r.sector,
    COUNT(DISTINCT r.id) as regulator_count,
    COUNT(DISTINCT f.id) as framework_count,
    COUNT(DISTINCT c.id) as control_count,
    COUNT(DISTINCT CASE WHEN c.is_mandatory = true THEN c.id END) as mandatory_control_count,
    COUNT(DISTINCT CASE WHEN c.criticality_level = 'critical' THEN c.id END) as critical_control_count,
    COUNT(DISTINCT CASE WHEN c.criticality_level = 'high' THEN c.id END) as high_control_count
FROM regulators r
LEFT JOIN grc_frameworks f ON r.id = f.regulator_id AND f.is_active = true
LEFT JOIN grc_controls c ON f.id = c.framework_id AND c.is_active = true
WHERE r.is_active = true 
  AND r.sector IS NOT NULL 
  AND r.sector != 'all'
GROUP BY r.sector;

/**
 * View: Organization Assessment Summary
 */
CREATE OR REPLACE VIEW organization_assessment_summary AS
SELECT 
    o.id as organization_id,
    o.name as organization_name,
    o.sector,
    COUNT(a.id) as total_assessments,
    COUNT(CASE WHEN a.status = 'completed' THEN 1 END) as completed_assessments,
    COUNT(CASE WHEN a.status = 'in_progress' THEN 1 END) as in_progress_assessments,
    AVG(CASE WHEN a.status = 'completed' THEN calculate_compliance_score(a.id) END) as avg_compliance_score,
    MAX(a.created_at) as last_assessment_date
FROM organizations o
LEFT JOIN assessments a ON o.id = a.organization_id
WHERE o.is_active = true
GROUP BY o.id, o.name, o.sector;

/**
 * View: Control Implementation Status
 */
CREATE OR REPLACE VIEW control_implementation_status AS
SELECT 
    c.id as control_id,
    c.control_code,
    c.title,
    c.criticality_level,
    f.name as framework_name,
    r.name as regulator_name,
    COUNT(ar.id) as total_responses,
    COUNT(CASE WHEN ar.response_value = 'compliant' THEN 1 END) as compliant_count,
    COUNT(CASE WHEN ar.response_value = 'partially_compliant' THEN 1 END) as partial_count,
    COUNT(CASE WHEN ar.response_value = 'non_compliant' THEN 1 END) as non_compliant_count,
    COUNT(CASE WHEN ar.response_value = 'not_applicable' THEN 1 END) as not_applicable_count,
    ROUND(
        COUNT(CASE WHEN ar.response_value = 'compliant' THEN 1 END) * 100.0 / 
        NULLIF(COUNT(CASE WHEN ar.response_value != 'not_applicable' THEN 1 END), 0), 2
    ) as compliance_percentage
FROM grc_controls c
JOIN grc_frameworks f ON c.framework_id = f.id
JOIN regulators r ON f.regulator_id = r.id
LEFT JOIN assessment_responses ar ON c.id = ar.control_id
WHERE c.is_active = true
GROUP BY c.id, c.control_code, c.title, c.criticality_level, f.name, r.name;

/**
 * View: Assessment Progress
 */
CREATE OR REPLACE VIEW assessment_progress AS
SELECT 
    a.id as assessment_id,
    a.name as assessment_name,
    a.status,
    o.name as organization_name,
    COUNT(ar.id) as total_responses,
    COUNT(CASE WHEN ar.response_value IS NOT NULL THEN 1 END) as completed_responses,
    ROUND(
        COUNT(CASE WHEN ar.response_value IS NOT NULL THEN 1 END) * 100.0 / 
        NULLIF(COUNT(ar.id), 0), 2
    ) as completion_percentage,
    calculate_compliance_score(a.id) as compliance_score,
    calculate_weighted_compliance_score(a.id) as weighted_compliance_score,
    a.start_date,
    a.target_completion_date,
    a.created_at
FROM assessments a
JOIN organizations o ON a.organization_id = o.id
LEFT JOIN assessment_responses ar ON a.id = ar.assessment_id
GROUP BY a.id, a.name, a.status, o.name, a.start_date, a.target_completion_date, a.created_at;

/**
 * View: Framework Control Count
 */
CREATE OR REPLACE VIEW framework_control_count AS
SELECT 
    f.id as framework_id,
    f.name as framework_name,
    f.framework_code,
    r.name as regulator_name,
    r.code as regulator_code,
    COUNT(c.id) as total_controls,
    COUNT(CASE WHEN c.is_mandatory = true THEN 1 END) as mandatory_controls,
    COUNT(CASE WHEN c.criticality_level = 'critical' THEN 1 END) as critical_controls,
    COUNT(CASE WHEN c.criticality_level = 'high' THEN 1 END) as high_controls,
    COUNT(CASE WHEN c.criticality_level = 'medium' THEN 1 END) as medium_controls,
    COUNT(CASE WHEN c.criticality_level = 'low' THEN 1 END) as low_controls
FROM grc_frameworks f
JOIN regulators r ON f.regulator_id = r.id
LEFT JOIN grc_controls c ON f.id = c.framework_id AND c.is_active = true
WHERE f.is_active = true AND r.is_active = true
GROUP BY f.id, f.name, f.framework_code, r.name, r.code;

/**
 * View: Evidence Summary
 */
CREATE OR REPLACE VIEW evidence_summary AS
SELECT 
    a.id as assessment_id,
    a.name as assessment_name,
    COUNT(ae.id) as total_evidence,
    COUNT(CASE WHEN ae.evidence_type = 'document' THEN 1 END) as document_count,
    COUNT(CASE WHEN ae.evidence_type = 'screenshot' THEN 1 END) as screenshot_count,
    COUNT(CASE WHEN ae.evidence_type = 'video' THEN 1 END) as video_count,
    COUNT(CASE WHEN ae.evidence_type = 'link' THEN 1 END) as link_count,
    SUM(ae.file_size) as total_file_size,
    COUNT(CASE WHEN ae.is_confidential = true THEN 1 END) as confidential_count
FROM assessments a
LEFT JOIN assessment_responses ar ON a.id = ar.assessment_id
LEFT JOIN assessment_evidence ae ON ar.id = ae.response_id
GROUP BY a.id, a.name;

-- ==========================================
-- 🔍 INDEXES FOR PERFORMANCE
-- ==========================================

-- Sector-based queries
CREATE INDEX IF NOT EXISTS idx_regulators_sector ON regulators(sector) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_organizations_sector ON organizations(sector) WHERE is_active = true;

-- Assessment queries
CREATE INDEX IF NOT EXISTS idx_assessments_status ON assessments(status);
CREATE INDEX IF NOT EXISTS idx_assessments_org_status ON assessments(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_assessment_responses_assessment ON assessment_responses(assessment_id);
CREATE INDEX IF NOT EXISTS idx_assessment_responses_control ON assessment_responses(control_id);

-- Control queries
CREATE INDEX IF NOT EXISTS idx_controls_criticality ON grc_controls(criticality_level) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_controls_mandatory ON grc_controls(is_mandatory) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_controls_framework ON grc_controls(framework_id) WHERE is_active = true;

-- Evidence queries
CREATE INDEX IF NOT EXISTS idx_evidence_response ON assessment_evidence(response_id);
CREATE INDEX IF NOT EXISTS idx_evidence_type ON assessment_evidence(evidence_type);
CREATE INDEX IF NOT EXISTS idx_evidence_confidential ON assessment_evidence(is_confidential);

-- User queries
CREATE INDEX IF NOT EXISTS idx_users_organization ON users(organization_id) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email) WHERE status = 'active';

-- Framework queries
CREATE INDEX IF NOT EXISTS idx_frameworks_regulator ON grc_frameworks(regulator_id) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_frameworks_code ON grc_frameworks(framework_code) WHERE is_active = true;

-- ==========================================
-- 🔧 UTILITY FUNCTIONS
-- ==========================================

/**
 * Function to clean up old session tokens
 */
CREATE OR REPLACE FUNCTION cleanup_expired_sessions() RETURNS INTEGER AS $$
DECLARE
    cleaned_count INTEGER;
BEGIN
    UPDATE users 
    SET session_token = NULL, session_expires_at = NULL
    WHERE session_expires_at < NOW();
    
    GET DIAGNOSTICS cleaned_count = ROW_COUNT;
    RETURN cleaned_count;
END;
$$ LANGUAGE plpgsql;

/**
 * Function to get assessment statistics
 */
CREATE OR REPLACE FUNCTION get_assessment_statistics(p_assessment_id UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_controls', COUNT(*),
        'completed_responses', COUNT(CASE WHEN response_value IS NOT NULL THEN 1 END),
        'compliant', COUNT(CASE WHEN response_value = 'compliant' THEN 1 END),
        'partially_compliant', COUNT(CASE WHEN response_value = 'partially_compliant' THEN 1 END),
        'non_compliant', COUNT(CASE WHEN response_value = 'non_compliant' THEN 1 END),
        'not_applicable', COUNT(CASE WHEN response_value = 'not_applicable' THEN 1 END),
        'completion_percentage', ROUND(
            COUNT(CASE WHEN response_value IS NOT NULL THEN 1 END) * 100.0 / COUNT(*), 2
        ),
        'compliance_score', calculate_compliance_score(p_assessment_id),
        'weighted_score', calculate_weighted_compliance_score(p_assessment_id)
    ) INTO result
    FROM assessment_responses
    WHERE assessment_id = p_assessment_id;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- 📅 SCHEDULED MAINTENANCE
-- ==========================================

/**
 * Function to archive old assessments
 */
CREATE OR REPLACE FUNCTION archive_old_assessments(p_days_old INTEGER DEFAULT 365)
RETURNS INTEGER AS $$
DECLARE
    archived_count INTEGER;
BEGIN
    UPDATE assessments 
    SET status = 'archived'
    WHERE status = 'completed' 
      AND updated_at < NOW() - INTERVAL '1 day' * p_days_old;
    
    GET DIAGNOSTICS archived_count = ROW_COUNT;
    RETURN archived_count;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO grc_user;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO grc_user;