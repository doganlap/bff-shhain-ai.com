-- Migration 007: Update Assessment Templates System
-- Updates existing tables and adds missing columns

-- Add missing columns to assessment_templates if they don't exist
DO $$ 
BEGIN
    -- Add assessment_type column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'assessment_templates' AND column_name = 'assessment_type') THEN
        ALTER TABLE assessment_templates ADD COLUMN assessment_type VARCHAR(50) DEFAULT 'compliance';
    END IF;
    
    -- Add estimated_duration column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'assessment_templates' AND column_name = 'estimated_duration') THEN
        ALTER TABLE assessment_templates ADD COLUMN estimated_duration VARCHAR(100);
    END IF;
    
    -- Add updated_by column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'assessment_templates' AND column_name = 'updated_by') THEN
        ALTER TABLE assessment_templates ADD COLUMN updated_by UUID;
    END IF;
    
    -- Add updated_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'assessment_templates' AND column_name = 'updated_at') THEN
        ALTER TABLE assessment_templates ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    END IF;
END $$;

-- Add missing columns to assessment_template_sections if they don't exist
DO $$ 
BEGIN
    -- Add updated_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'assessment_template_sections' AND column_name = 'updated_at') THEN
        ALTER TABLE assessment_template_sections ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    END IF;
END $$;

-- Create indexes for performance (IF NOT EXISTS)
CREATE INDEX IF NOT EXISTS idx_assessment_templates_framework ON assessment_templates(framework_id);
CREATE INDEX IF NOT EXISTS idx_assessment_templates_category ON assessment_templates(category);
CREATE INDEX IF NOT EXISTS idx_assessment_templates_active ON assessment_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_assessment_templates_created_by ON assessment_templates(created_by);
CREATE INDEX IF NOT EXISTS idx_assessment_templates_created_at ON assessment_templates(created_at);

CREATE INDEX IF NOT EXISTS idx_assessment_template_sections_template_id ON assessment_template_sections(template_id);
CREATE INDEX IF NOT EXISTS idx_assessment_template_sections_order ON assessment_template_sections(order_index);

-- Add triggers for updated_at
DROP TRIGGER IF EXISTS update_assessment_templates_updated_at ON assessment_templates;
CREATE TRIGGER update_assessment_templates_updated_at 
    BEFORE UPDATE ON assessment_templates 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_assessment_template_sections_updated_at ON assessment_template_sections;
CREATE TRIGGER update_assessment_template_sections_updated_at 
    BEFORE UPDATE ON assessment_template_sections 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert some default assessment templates (only if they don't exist)
INSERT INTO assessment_templates (
    name, description, category, assessment_type, estimated_duration, 
    template_data, is_default, created_by
) 
SELECT 
    template_name,
    template_desc,
    template_cat,
    template_type,
    template_duration,
    template_json::jsonb,
    template_default,
    (SELECT id FROM users WHERE email = 'ahmet@doganconsult.com' LIMIT 1)
FROM (VALUES 
    ('NCA Essential Cybersecurity Controls Assessment', 'Comprehensive assessment template for NCA ECC compliance covering all 114 essential controls', 'cybersecurity', 'compliance', '3-4 weeks', '{"framework": "NCA_ECC", "controls_count": 114, "industry": "all_sectors", "priority": "high"}', true),
    ('SAMA Cybersecurity Framework Assessment', 'Banking sector cybersecurity assessment based on SAMA CSF requirements', 'financial_services', 'compliance', '4-5 weeks', '{"framework": "SAMA_CSF", "controls_count": 167, "industry": "banking", "priority": "high"}', true),
    ('ISO 27001:2022 Internal Audit Template', 'Internal audit template based on ISO 27001:2022 Annex A controls', 'information_security', 'audit', '2-3 weeks', '{"framework": "ISO_27001", "controls_count": 93, "industry": "technology", "priority": "medium"}', false),
    ('PDPL Data Protection Assessment', 'Personal Data Protection Law compliance assessment for Saudi Arabia', 'data_protection', 'compliance', '1-2 weeks', '{"framework": "PDPL", "controls_count": 56, "industry": "data_processing", "priority": "high"}', true)
) AS templates(template_name, template_desc, template_cat, template_type, template_duration, template_json, template_default)
WHERE NOT EXISTS (
    SELECT 1 FROM assessment_templates WHERE name = template_name
);

-- Insert template sections for NCA ECC template (only if template exists and sections don't exist)
INSERT INTO assessment_template_sections (
    template_id, title, description, order_index, section_data
)
SELECT 
    at.id,
    section_title,
    section_desc,
    section_ord,
    section_json::jsonb
FROM assessment_templates at,
(VALUES 
    ('Governance and Risk Management', 'Organizational governance, risk management, and compliance oversight', 1, '{"controls": ["governance_framework", "risk_assessment", "compliance_monitoring"], "priority": "high", "estimated_hours": 40}'),
    ('Asset Management', 'Identification, classification, and protection of information assets', 2, '{"controls": ["asset_inventory", "asset_classification", "asset_handling"], "priority": "high", "estimated_hours": 32}'),
    ('Access Control', 'User access management, authentication, and authorization controls', 3, '{"controls": ["access_policy", "user_management", "privileged_access"], "priority": "high", "estimated_hours": 48}'),
    ('Cryptography', 'Encryption, key management, and cryptographic controls', 4, '{"controls": ["encryption_policy", "key_management", "crypto_implementation"], "priority": "medium", "estimated_hours": 24}'),
    ('Physical and Environmental Security', 'Physical security controls and environmental protection', 5, '{"controls": ["physical_access", "environmental_monitoring", "equipment_protection"], "priority": "medium", "estimated_hours": 20}'),
    ('Operations Security', 'Operational procedures, change management, and system monitoring', 6, '{"controls": ["operational_procedures", "change_management", "monitoring"], "priority": "high", "estimated_hours": 36}'),
    ('Communications Security', 'Network security, data transmission, and communication protection', 7, '{"controls": ["network_security", "data_transmission", "communication_protocols"], "priority": "high", "estimated_hours": 32}'),
    ('System Acquisition and Development', 'Secure development lifecycle and system security', 8, '{"controls": ["secure_development", "system_testing", "security_requirements"], "priority": "medium", "estimated_hours": 28}'),
    ('Supplier Relationships', 'Third-party risk management and supplier security', 9, '{"controls": ["supplier_assessment", "contract_security", "third_party_monitoring"], "priority": "medium", "estimated_hours": 24}'),
    ('Incident Management', 'Security incident response and management procedures', 10, '{"controls": ["incident_response", "incident_reporting", "forensics"], "priority": "high", "estimated_hours": 32}'),
    ('Business Continuity', 'Business continuity planning and disaster recovery', 11, '{"controls": ["bcp_planning", "disaster_recovery", "backup_procedures"], "priority": "high", "estimated_hours": 36}'),
    ('Compliance', 'Legal compliance, regulatory requirements, and audit management', 12, '{"controls": ["legal_compliance", "regulatory_monitoring", "audit_management"], "priority": "high", "estimated_hours": 28}')
) AS sections(section_title, section_desc, section_ord, section_json)
WHERE at.name = 'NCA Essential Cybersecurity Controls Assessment'
AND NOT EXISTS (
    SELECT 1 FROM assessment_template_sections ats 
    WHERE ats.template_id = at.id AND ats.title = section_title
);

-- Create function to get template statistics
CREATE OR REPLACE FUNCTION get_template_statistics()
RETURNS TABLE(
    total_templates INTEGER,
    active_templates INTEGER,
    default_templates INTEGER,
    categories_count INTEGER,
    avg_sections_per_template DECIMAL(5,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER as total_templates,
        COUNT(CASE WHEN is_active = true THEN 1 END)::INTEGER as active_templates,
        COUNT(CASE WHEN is_default = true THEN 1 END)::INTEGER as default_templates,
        COUNT(DISTINCT category)::INTEGER as categories_count,
        COALESCE(ROUND(AVG(section_count), 2), 0) as avg_sections_per_template
    FROM assessment_templates at
    LEFT JOIN (
        SELECT template_id, COUNT(*) as section_count
        FROM assessment_template_sections
        GROUP BY template_id
    ) sections ON at.id = sections.template_id;
END;
$$ LANGUAGE plpgsql;
