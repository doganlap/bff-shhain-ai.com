-- Add missing columns to existing grc_frameworks table
ALTER TABLE grc_frameworks ADD COLUMN IF NOT EXISTS sector_applicability TEXT[] DEFAULT ARRAY[]::text[];
ALTER TABLE grc_frameworks ADD COLUMN IF NOT EXISTS complexity_level INTEGER DEFAULT 3;

-- Update existing frameworks with sector applicability
UPDATE grc_frameworks SET 
    sector_applicability = ARRAY['finance', 'banking'],
    complexity_level = 4
WHERE name ILIKE '%SAMA%' OR name ILIKE '%monetary%';

UPDATE grc_frameworks SET 
    sector_applicability = ARRAY['government', 'finance', 'healthcare'],
    complexity_level = 5
WHERE name ILIKE '%NCA%' OR name ILIKE '%cybersecurity%';

UPDATE grc_frameworks SET 
    sector_applicability = ARRAY['technology', 'finance', 'healthcare'],
    complexity_level = 4
WHERE name ILIKE '%ISO%';

UPDATE grc_frameworks SET 
    sector_applicability = ARRAY['government', 'technology'],
    complexity_level = 4
WHERE name ILIKE '%NIST%';

-- Add missing columns to grc_controls if they don't exist
ALTER TABLE grc_controls ADD COLUMN IF NOT EXISTS control_type VARCHAR(100) DEFAULT 'policy';
ALTER TABLE grc_controls ADD COLUMN IF NOT EXISTS priority_level VARCHAR(50) DEFAULT 'medium';
ALTER TABLE grc_controls ADD COLUMN IF NOT EXISTS implementation_guidance TEXT;
ALTER TABLE grc_controls ADD COLUMN IF NOT EXISTS testing_procedures TEXT;
ALTER TABLE grc_controls ADD COLUMN IF NOT EXISTS sector_specific_notes TEXT;

-- Insert sample frameworks if none exist
INSERT INTO grc_frameworks (name, version, description, sector_applicability, complexity_level, status, is_active)
SELECT 'SAMA Cybersecurity Framework', '2.0', 'Saudi Arabian Monetary Authority Cybersecurity Framework', ARRAY['finance', 'banking'], 4, 'active', true
WHERE NOT EXISTS (SELECT 1 FROM grc_frameworks WHERE name ILIKE '%SAMA%');

INSERT INTO grc_frameworks (name, version, description, sector_applicability, complexity_level, status, is_active)
SELECT 'NCA Cybersecurity Framework', '1.0', 'National Cybersecurity Authority Framework', ARRAY['government', 'finance', 'healthcare'], 5, 'active', true
WHERE NOT EXISTS (SELECT 1 FROM grc_frameworks WHERE name ILIKE '%NCA%');

INSERT INTO grc_frameworks (name, version, description, sector_applicability, complexity_level, status, is_active)
SELECT 'ISO 27001', '2013', 'Information Security Management System', ARRAY['technology', 'finance', 'healthcare'], 4, 'active', true
WHERE NOT EXISTS (SELECT 1 FROM grc_frameworks WHERE name ILIKE '%ISO%');

-- Insert sample controls
INSERT INTO grc_controls (framework_id, control_id, title, description, control_type, priority_level, implementation_guidance, testing_procedures, status)
SELECT 
    f.id,
    'AC-1',
    'Access Control Policy and Procedures',
    'Develop, document, and disseminate access control policy and procedures',
    'policy',
    'high',
    'Develop comprehensive access control policy covering all systems and users',
    'Review policy document, verify approval signatures, check implementation evidence',
    'active'
FROM grc_frameworks f
WHERE f.name ILIKE '%SAMA%'
AND NOT EXISTS (
    SELECT 1 FROM grc_controls c 
    WHERE c.framework_id = f.id AND c.control_id = 'AC-1'
);

-- Verify the changes
SELECT 'Updated frameworks count' as info, COUNT(*) as count FROM grc_frameworks WHERE sector_applicability IS NOT NULL;
SELECT 'Updated controls count' as info, COUNT(*) as count FROM grc_controls WHERE control_type IS NOT NULL;
