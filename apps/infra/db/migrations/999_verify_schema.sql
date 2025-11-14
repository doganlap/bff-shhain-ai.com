-- Verify and fix schema issues

-- Check grc_frameworks columns
\d grc_frameworks;

-- Add missing columns if needed
ALTER TABLE grc_frameworks ADD COLUMN IF NOT EXISTS sector_applicability TEXT[];
ALTER TABLE grc_frameworks ADD COLUMN IF NOT EXISTS complexity_level INTEGER DEFAULT 3;

-- Check grc_controls columns  
\d grc_controls;

-- Add missing columns if needed
ALTER TABLE grc_controls ADD COLUMN IF NOT EXISTS control_type VARCHAR(100);
ALTER TABLE grc_controls ADD COLUMN IF NOT EXISTS priority_level VARCHAR(50);
ALTER TABLE grc_controls ADD COLUMN IF NOT EXISTS implementation_guidance TEXT;
ALTER TABLE grc_controls ADD COLUMN IF NOT EXISTS testing_procedures TEXT;
ALTER TABLE grc_controls ADD COLUMN IF NOT EXISTS sector_specific_notes TEXT;

-- Update sample data
UPDATE grc_frameworks SET 
    sector_applicability = ARRAY['finance', 'banking'],
    complexity_level = 4
WHERE name = 'SAMA Cybersecurity Framework';

UPDATE grc_frameworks SET 
    sector_applicability = ARRAY['government', 'finance', 'healthcare'],
    complexity_level = 5
WHERE name = 'NCA Cybersecurity Framework';

UPDATE grc_frameworks SET 
    sector_applicability = ARRAY['technology', 'finance', 'healthcare'],
    complexity_level = 4
WHERE name = 'ISO 27001';

UPDATE grc_frameworks SET 
    sector_applicability = ARRAY['government', 'technology'],
    complexity_level = 4
WHERE name = 'NIST Cybersecurity Framework';

-- Update controls
UPDATE grc_controls SET 
    control_type = 'policy',
    priority_level = 'high',
    implementation_guidance = 'Develop comprehensive access control policy covering all systems and users',
    testing_procedures = 'Review policy document, verify approval signatures, check implementation evidence'
WHERE control_id = 'AC-1';

-- Show final counts
SELECT 'grc_frameworks' as table_name, COUNT(*) as count FROM grc_frameworks
UNION ALL
SELECT 'grc_controls' as table_name, COUNT(*) as count FROM grc_controls
UNION ALL  
SELECT 'tenants' as table_name, COUNT(*) as count FROM tenants
UNION ALL
SELECT 'organizations' as table_name, COUNT(*) as count FROM organizations;
