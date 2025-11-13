-- Migration 008: Fix Database Schema Column Naming Issues (Simple)
-- Resolves column naming inconsistencies between schema and API routes

-- Fix GRC Frameworks table - add missing columns and aliases
DO $$ 
BEGIN
    -- Add framework_code column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'grc_frameworks' AND column_name = 'framework_code') THEN
        ALTER TABLE grc_frameworks ADD COLUMN framework_code VARCHAR(50);
    END IF;
    
    -- Add name column as alias for name_en if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'grc_frameworks' AND column_name = 'name') THEN
        ALTER TABLE grc_frameworks ADD COLUMN name VARCHAR(255);
    END IF;
    
    -- Add description column as alias for description_en if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'grc_frameworks' AND column_name = 'description') THEN
        ALTER TABLE grc_frameworks ADD COLUMN description TEXT;
    END IF;
END $$;

-- Fix GRC Controls table - add missing columns
DO $$ 
BEGIN
    -- Add title column as alias for title_en if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'grc_controls' AND column_name = 'title') THEN
        ALTER TABLE grc_controls ADD COLUMN title VARCHAR(500);
    END IF;
    
    -- Add description column as alias for description_en if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'grc_controls' AND column_name = 'description') THEN
        ALTER TABLE grc_controls ADD COLUMN description TEXT;
    END IF;
    
    -- Add is_mandatory column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'grc_controls' AND column_name = 'is_mandatory') THEN
        ALTER TABLE grc_controls ADD COLUMN is_mandatory BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_grc_frameworks_code ON grc_frameworks(framework_code);
CREATE INDEX IF NOT EXISTS idx_grc_frameworks_name ON grc_frameworks(name);
CREATE INDEX IF NOT EXISTS idx_grc_frameworks_regulator ON grc_frameworks(regulator_id);
CREATE INDEX IF NOT EXISTS idx_grc_frameworks_active ON grc_frameworks(is_active);

CREATE INDEX IF NOT EXISTS idx_grc_controls_framework ON grc_controls(framework_id);
CREATE INDEX IF NOT EXISTS idx_grc_controls_control_id ON grc_controls(control_id);
CREATE INDEX IF NOT EXISTS idx_grc_controls_category ON grc_controls(category);
CREATE INDEX IF NOT EXISTS idx_grc_controls_mandatory ON grc_controls(is_mandatory);
CREATE INDEX IF NOT EXISTS idx_grc_controls_active ON grc_controls(is_active);

CREATE INDEX IF NOT EXISTS idx_regulators_code ON regulators(code);
CREATE INDEX IF NOT EXISTS idx_regulators_sector ON regulators(sector);
CREATE INDEX IF NOT EXISTS idx_regulators_active ON regulators(is_active);

-- Insert default regulators for Saudi Arabia (only if they don't exist)
INSERT INTO regulators (
    name, name_ar, code, description, description_ar, jurisdiction, sector, 
    website, type, level, status, is_active, created_by
) 
SELECT 
    reg_name, reg_name_ar, reg_code, reg_desc, reg_desc_ar, 
    'Saudi Arabia', reg_sector, reg_website, 'government', 'national', 'active', true,
    (SELECT id FROM users WHERE email = 'ahmet@doganconsult.com' LIMIT 1)
FROM (VALUES 
    ('National Cybersecurity Authority', 'الهيئة الوطنية للأمن السيبراني', 'NCA', 'The National Cybersecurity Authority is responsible for cybersecurity in Saudi Arabia', 'الهيئة الوطنية للأمن السيبراني مسؤولة عن الأمن السيبراني في المملكة العربية السعودية', 'cybersecurity', 'https://nca.gov.sa'),
    ('Saudi Central Bank (SAMA)', 'البنك المركزي السعودي', 'SAMA', 'Saudi Central Bank regulates banking and financial services', 'البنك المركزي السعودي ينظم الخدمات المصرفية والمالية', 'financial_services', 'https://sama.gov.sa'),
    ('Communications, Space & Technology Commission', 'هيئة الاتصالات والفضاء والتقنية', 'CITC', 'Regulates telecommunications and information technology sector', 'تنظم قطاع الاتصالات وتقنية المعلومات', 'telecommunications', 'https://citc.gov.sa'),
    ('Saudi Data & AI Authority', 'الهيئة السعودية للبيانات والذكاء الاصطناعي', 'SDAIA', 'Responsible for data governance and AI regulation', 'مسؤولة عن حوكمة البيانات وتنظيم الذكاء الاصطناعي', 'data_governance', 'https://sdaia.gov.sa'),
    ('Capital Market Authority', 'هيئة السوق المالية', 'CMA', 'Regulates capital markets and securities', 'تنظم أسواق رأس المال والأوراق المالية', 'capital_markets', 'https://cma.org.sa')
) AS regs(reg_name, reg_name_ar, reg_code, reg_desc, reg_desc_ar, reg_sector, reg_website)
WHERE NOT EXISTS (SELECT 1 FROM regulators WHERE code = reg_code);

-- Insert default GRC frameworks (only if they don't exist)
INSERT INTO grc_frameworks (
    name_en, name_ar, name, description_en, description_ar, description,
    framework_code, version, authority, country, regulator_id, is_active
) 
SELECT 
    fw_name_en, fw_name_ar, fw_name_en, fw_desc_en, fw_desc_ar, fw_desc_en,
    fw_code, fw_version, fw_authority, 'Saudi Arabia', 
    (SELECT id FROM regulators WHERE code = fw_regulator_code LIMIT 1), true
FROM (VALUES 
    ('NCA Essential Cybersecurity Controls', 'الضوابط الأساسية للأمن السيبراني - الهيئة الوطنية للأمن السيبراني', 'Essential Cybersecurity Controls framework by National Cybersecurity Authority', 'إطار الضوابط الأساسية للأمن السيبراني من الهيئة الوطنية للأمن السيبراني', 'NCA_ECC', '2.0', 'National Cybersecurity Authority', 'NCA'),
    ('SAMA Cybersecurity Framework', 'إطار الأمن السيبراني - البنك المركزي السعودي', 'Cybersecurity framework for financial institutions by Saudi Central Bank', 'إطار الأمن السيبراني للمؤسسات المالية من البنك المركزي السعودي', 'SAMA_CSF', '1.0', 'Saudi Central Bank', 'SAMA'),
    ('ISO 27001:2022 Information Security Management', 'إدارة أمن المعلومات - آيزو 27001:2022', 'International standard for information security management systems', 'المعيار الدولي لأنظمة إدارة أمن المعلومات', 'ISO_27001', '2022', 'International Organization for Standardization', NULL),
    ('Personal Data Protection Law (PDPL)', 'نظام حماية البيانات الشخصية', 'Saudi Arabia Personal Data Protection Law regulations', 'أنظمة حماية البيانات الشخصية في المملكة العربية السعودية', 'PDPL', '2023', 'Saudi Data & AI Authority', 'SDAIA')
) AS frameworks(fw_name_en, fw_name_ar, fw_desc_en, fw_desc_ar, fw_code, fw_version, fw_authority, fw_regulator_code)
WHERE NOT EXISTS (SELECT 1 FROM grc_frameworks WHERE framework_code = fw_code);

-- Update existing records to populate the new columns
UPDATE grc_frameworks SET 
    name = name_en,
    description = description_en,
    framework_code = CASE 
        WHEN name_en ILIKE '%NCA%' THEN 'NCA_ECC'
        WHEN name_en ILIKE '%SAMA%' THEN 'SAMA_CSF'
        WHEN name_en ILIKE '%ISO%27001%' THEN 'ISO_27001'
        WHEN name_en ILIKE '%CITC%' THEN 'CITC_CCRF'
        WHEN name_en ILIKE '%PDPL%' THEN 'PDPL'
        ELSE UPPER(REPLACE(SUBSTRING(name_en, 1, 10), ' ', '_'))
    END
WHERE name IS NULL OR description IS NULL OR framework_code IS NULL;

UPDATE grc_controls SET 
    title = title_en,
    description = description_en,
    is_mandatory = CASE WHEN criticality_level IN ('high', 'critical') THEN true ELSE false END
WHERE title IS NULL OR description IS NULL OR is_mandatory IS NULL;

-- Insert sample GRC controls for NCA ECC framework (only if framework exists and controls don't exist)
INSERT INTO grc_controls (
    framework_id, control_id, title_en, title_ar, title, 
    description_en, description_ar, description,
    category, criticality_level, is_mandatory, control_type, is_active
) 
SELECT 
    f.id,
    control_code,
    control_title_en,
    control_title_ar,
    control_title_en,
    control_desc_en,
    control_desc_ar,
    control_desc_en,
    control_cat,
    control_crit,
    CASE WHEN control_crit IN ('high', 'critical') THEN true ELSE false END,
    'technical',
    true
FROM grc_frameworks f,
(VALUES 
    ('NCA-1-1-1', 'Cybersecurity Governance Framework', 'إطار حوكمة الأمن السيبراني', 'Establish and maintain cybersecurity governance framework', 'إنشاء والحفاظ على إطار حوكمة الأمن السيبراني', 'governance', 'high'),
    ('NCA-1-1-2', 'Cybersecurity Strategy', 'استراتيجية الأمن السيبراني', 'Develop and implement cybersecurity strategy', 'تطوير وتنفيذ استراتيجية الأمن السيبراني', 'governance', 'high'),
    ('NCA-1-2-1', 'Risk Management Framework', 'إطار إدارة المخاطر', 'Establish cybersecurity risk management framework', 'إنشاء إطار إدارة مخاطر الأمن السيبراني', 'risk_management', 'high'),
    ('NCA-2-1-1', 'Asset Inventory', 'جرد الأصول', 'Maintain comprehensive asset inventory', 'الحفاظ على جرد شامل للأصول', 'asset_management', 'medium'),
    ('NCA-2-1-2', 'Asset Classification', 'تصنيف الأصول', 'Classify assets based on criticality and sensitivity', 'تصنيف الأصول حسب الأهمية والحساسية', 'asset_management', 'medium'),
    ('NCA-3-1-1', 'Access Control Policy', 'سياسة التحكم في الوصول', 'Implement access control policies and procedures', 'تنفيذ سياسات وإجراءات التحكم في الوصول', 'access_control', 'high'),
    ('NCA-3-2-1', 'User Access Management', 'إدارة وصول المستخدمين', 'Manage user access rights and privileges', 'إدارة حقوق وصول المستخدمين والامتيازات', 'access_control', 'high'),
    ('NCA-4-1-1', 'Encryption Standards', 'معايير التشفير', 'Implement encryption for data protection', 'تنفيذ التشفير لحماية البيانات', 'cryptography', 'high'),
    ('NCA-5-1-1', 'Physical Security Controls', 'ضوابط الأمن المادي', 'Implement physical security measures', 'تنفيذ تدابير الأمن المادي', 'physical_security', 'medium'),
    ('NCA-6-1-1', 'Security Operations Center', 'مركز عمليات الأمان', 'Establish security operations capabilities', 'إنشاء قدرات عمليات الأمان', 'operations', 'high')
) AS controls(control_code, control_title_en, control_title_ar, control_desc_en, control_desc_ar, control_cat, control_crit)
WHERE f.framework_code = 'NCA_ECC'
AND NOT EXISTS (
    SELECT 1 FROM grc_controls gc 
    WHERE gc.framework_id = f.id AND gc.control_id = control_code
);

-- Create function to get database statistics
CREATE OR REPLACE FUNCTION get_database_statistics()
RETURNS TABLE(
    regulators_count INTEGER,
    frameworks_count INTEGER,
    controls_count INTEGER,
    templates_count INTEGER,
    tenants_count INTEGER,
    users_count INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*)::INTEGER FROM regulators WHERE is_active = true),
        (SELECT COUNT(*)::INTEGER FROM grc_frameworks WHERE is_active = true),
        (SELECT COUNT(*)::INTEGER FROM grc_controls WHERE is_active = true),
        (SELECT COUNT(*)::INTEGER FROM assessment_templates WHERE is_active = true),
        (SELECT COUNT(*)::INTEGER FROM tenants WHERE is_active = true),
        (SELECT COUNT(*)::INTEGER FROM users WHERE status = 'active');
END;
$$ LANGUAGE plpgsql;
