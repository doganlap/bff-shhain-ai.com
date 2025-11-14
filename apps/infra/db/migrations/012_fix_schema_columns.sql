-- Migration 008: Fix Database Schema Column Naming Issues
-- Resolves column naming inconsistencies between schema and API routes

-- Fix GRC Frameworks table - add missing columns and aliases
DO $$ 
BEGIN
    -- Add framework_code column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'grc_frameworks' AND column_name = 'framework_code') THEN
        ALTER TABLE grc_frameworks ADD COLUMN framework_code VARCHAR(50);
        
        -- Update existing records to have framework_code based on name
        UPDATE grc_frameworks SET framework_code = 
            CASE 
                WHEN name_en ILIKE '%NCA%' THEN 'NCA_ECC'
                WHEN name_en ILIKE '%SAMA%' THEN 'SAMA_CSF'
                WHEN name_en ILIKE '%ISO%27001%' THEN 'ISO_27001'
                WHEN name_en ILIKE '%CITC%' THEN 'CITC_CCRF'
                WHEN name_en ILIKE '%PDPL%' THEN 'PDPL'
                ELSE UPPER(REPLACE(SUBSTRING(name_en, 1, 10), ' ', '_'))
            END
        WHERE framework_code IS NULL;
    END IF;
    
    -- Add name column as alias for name_en if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'grc_frameworks' AND column_name = 'name') THEN
        ALTER TABLE grc_frameworks ADD COLUMN name VARCHAR(255);
        UPDATE grc_frameworks SET name = name_en WHERE name IS NULL;
    END IF;
    
    -- Add description column as alias for description_en if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'grc_frameworks' AND column_name = 'description') THEN
        ALTER TABLE grc_frameworks ADD COLUMN description TEXT;
        UPDATE grc_frameworks SET description = description_en WHERE description IS NULL;
    END IF;
END $$;

-- Fix GRC Controls table - add missing columns
DO $$ 
BEGIN
    -- Add title column as alias for title_en if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'grc_controls' AND column_name = 'title') THEN
        ALTER TABLE grc_controls ADD COLUMN title VARCHAR(500);
        UPDATE grc_controls SET title = title_en WHERE title IS NULL;
    END IF;
    
    -- Add description column as alias for description_en if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'grc_controls' AND column_name = 'description') THEN
        ALTER TABLE grc_controls ADD COLUMN description TEXT;
        UPDATE grc_controls SET description = description_en WHERE description IS NULL;
    END IF;
    
    -- Add is_mandatory column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'grc_controls' AND column_name = 'is_mandatory') THEN
        ALTER TABLE grc_controls ADD COLUMN is_mandatory BOOLEAN DEFAULT false;
        
        -- Set mandatory based on criticality level
        UPDATE grc_controls SET is_mandatory = true 
        WHERE criticality_level IN ('high', 'critical');
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

-- Insert default regulators for Saudi Arabia
INSERT INTO regulators (
    name, name_ar, code, description, description_ar, jurisdiction, sector, 
    website, type, level, status, is_active, created_by
) VALUES 
(
    'National Cybersecurity Authority',
    'الهيئة الوطنية للأمن السيبراني',
    'NCA',
    'The National Cybersecurity Authority is responsible for cybersecurity in Saudi Arabia',
    'الهيئة الوطنية للأمن السيبراني مسؤولة عن الأمن السيبراني في المملكة العربية السعودية',
    'Saudi Arabia',
    'cybersecurity',
    'https://nca.gov.sa',
    'government',
    'national',
    'active',
    true,
    (SELECT id FROM users WHERE email = 'admin@example.com' LIMIT 1)
),
(
    'Saudi Central Bank (SAMA)',
    'البنك المركزي السعودي',
    'SAMA',
    'Saudi Central Bank regulates banking and financial services',
    'البنك المركزي السعودي ينظم الخدمات المصرفية والمالية',
    'Saudi Arabia',
    'financial_services',
    'https://sama.gov.sa',
    'government',
    'national',
    'active',
    true,
    (SELECT id FROM users WHERE email = 'admin@example.com' LIMIT 1)
),
(
    'Communications, Space & Technology Commission',
    'هيئة الاتصالات والفضاء والتقنية',
    'CITC',
    'Regulates telecommunications and information technology sector',
    'تنظم قطاع الاتصالات وتقنية المعلومات',
    'Saudi Arabia',
    'telecommunications',
    'https://citc.gov.sa',
    'government',
    'national',
    'active',
    true,
    (SELECT id FROM users WHERE email = 'admin@example.com' LIMIT 1)
),
(
    'Saudi Data & AI Authority',
    'الهيئة السعودية للبيانات والذكاء الاصطناعي',
    'SDAIA',
    'Responsible for data governance and AI regulation',
    'مسؤولة عن حوكمة البيانات وتنظيم الذكاء الاصطناعي',
    'Saudi Arabia',
    'data_governance',
    'https://sdaia.gov.sa',
    'government',
    'national',
    'active',
    true,
    (SELECT id FROM users WHERE email = 'admin@example.com' LIMIT 1)
),
(
    'Capital Market Authority',
    'هيئة السوق المالية',
    'CMA',
    'Regulates capital markets and securities',
    'تنظم أسواق رأس المال والأوراق المالية',
    'Saudi Arabia',
    'capital_markets',
    'https://cma.org.sa',
    'government',
    'national',
    'active',
    true,
    (SELECT id FROM users WHERE email = 'admin@example.com' LIMIT 1)
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    name_ar = EXCLUDED.name_ar,
    description = EXCLUDED.description,
    description_ar = EXCLUDED.description_ar,
    website = EXCLUDED.website,
    updated_at = CURRENT_TIMESTAMP;

-- Insert default GRC frameworks
INSERT INTO grc_frameworks (
    name_en, name_ar, name, description_en, description_ar, description,
    framework_code, version, authority, country, regulator_id, is_active
) VALUES 
(
    'NCA Essential Cybersecurity Controls',
    'الضوابط الأساسية للأمن السيبراني - الهيئة الوطنية للأمن السيبراني',
    'NCA Essential Cybersecurity Controls',
    'Essential Cybersecurity Controls framework by National Cybersecurity Authority',
    'إطار الضوابط الأساسية للأمن السيبراني من الهيئة الوطنية للأمن السيبراني',
    'Essential Cybersecurity Controls framework by National Cybersecurity Authority',
    'NCA_ECC',
    '2.0',
    'National Cybersecurity Authority',
    'Saudi Arabia',
    (SELECT id FROM regulators WHERE code = 'NCA' LIMIT 1),
    true
),
(
    'SAMA Cybersecurity Framework',
    'إطار الأمن السيبراني - البنك المركزي السعودي',
    'SAMA Cybersecurity Framework',
    'Cybersecurity framework for financial institutions by Saudi Central Bank',
    'إطار الأمن السيبراني للمؤسسات المالية من البنك المركزي السعودي',
    'Cybersecurity framework for financial institutions by Saudi Central Bank',
    'SAMA_CSF',
    '1.0',
    'Saudi Central Bank',
    'Saudi Arabia',
    (SELECT id FROM regulators WHERE code = 'SAMA' LIMIT 1),
    true
),
(
    'ISO 27001:2022 Information Security Management',
    'إدارة أمن المعلومات - آيزو 27001:2022',
    'ISO 27001:2022 Information Security Management',
    'International standard for information security management systems',
    'المعيار الدولي لأنظمة إدارة أمن المعلومات',
    'International standard for information security management systems',
    'ISO_27001',
    '2022',
    'International Organization for Standardization',
    'International',
    NULL,
    true
),
(
    'Personal Data Protection Law (PDPL)',
    'نظام حماية البيانات الشخصية',
    'Personal Data Protection Law (PDPL)',
    'Saudi Arabia Personal Data Protection Law regulations',
    'أنظمة حماية البيانات الشخصية في المملكة العربية السعودية',
    'Saudi Arabia Personal Data Protection Law regulations',
    'PDPL',
    '2023',
    'Saudi Data & AI Authority',
    'Saudi Arabia',
    (SELECT id FROM regulators WHERE code = 'SDAIA' LIMIT 1),
    true
)
ON CONFLICT (framework_code) DO UPDATE SET
    name_en = EXCLUDED.name_en,
    name = EXCLUDED.name,
    description_en = EXCLUDED.description_en,
    description = EXCLUDED.description,
    version = EXCLUDED.version,
    updated_at = CURRENT_TIMESTAMP;

-- Insert sample GRC controls for NCA ECC framework
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
ON CONFLICT (framework_id, control_id) DO UPDATE SET
    title_en = EXCLUDED.title_en,
    title = EXCLUDED.title,
    description_en = EXCLUDED.description_en,
    description = EXCLUDED.description,
    updated_at = CURRENT_TIMESTAMP;

-- Create views for easier querying with backward compatibility
CREATE OR REPLACE VIEW v_grc_frameworks AS
SELECT 
    id,
    COALESCE(name, name_en) as name,
    name_en,
    name_ar,
    COALESCE(description, description_en) as description,
    description_en,
    description_ar,
    framework_code,
    version,
    authority,
    country,
    regulator_id,
    is_active,
    created_at,
    updated_at
FROM grc_frameworks;

CREATE OR REPLACE VIEW v_grc_controls AS
SELECT 
    c.id,
    c.framework_id,
    c.control_id,
    COALESCE(c.title, c.title_en) as title,
    c.title_en,
    c.title_ar,
    COALESCE(c.description, c.description_en) as description,
    c.description_en,
    c.description_ar,
    c.category,
    c.criticality_level,
    c.is_mandatory,
    c.control_type,
    c.is_active,
    f.name as framework_name,
    f.framework_code,
    r.name as regulator_name,
    c.created_at,
    c.updated_at
FROM grc_controls c
LEFT JOIN grc_frameworks f ON c.framework_id = f.id
LEFT JOIN regulators r ON f.regulator_id = r.id;

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
