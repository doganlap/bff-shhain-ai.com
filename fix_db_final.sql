-- Final database fix
DROP TABLE IF EXISTS grc_frameworks CASCADE;
DROP TABLE IF EXISTS grc_controls CASCADE;

-- Recreate frameworks table with all needed columns
CREATE TABLE grc_frameworks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    version VARCHAR(50) DEFAULT '1.0',
    description TEXT,
    sector_applicability TEXT[] DEFAULT ARRAY[]::text[],
    complexity_level INTEGER DEFAULT 3,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Recreate controls table
CREATE TABLE grc_controls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    framework_id UUID REFERENCES grc_frameworks(id) ON DELETE CASCADE,
    control_id VARCHAR(50) NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    control_type VARCHAR(100) DEFAULT 'policy',
    priority_level VARCHAR(50) DEFAULT 'medium',
    implementation_guidance TEXT,
    testing_procedures TEXT,
    sector_specific_notes TEXT,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample frameworks
INSERT INTO grc_frameworks (name, version, description, sector_applicability, complexity_level) VALUES
('SAMA Cybersecurity Framework', '2.0', 'Saudi Arabian Monetary Authority Cybersecurity Framework', ARRAY['finance', 'banking'], 4),
('NCA Cybersecurity Framework', '1.0', 'National Cybersecurity Authority Framework', ARRAY['government', 'finance', 'healthcare'], 5),
('ISO 27001', '2013', 'Information Security Management System', ARRAY['technology', 'finance', 'healthcare'], 4),
('NIST Cybersecurity Framework', '1.1', 'National Institute of Standards and Technology Framework', ARRAY['government', 'technology'], 4);

-- Insert sample controls
INSERT INTO grc_controls (framework_id, control_id, title, description, control_type, priority_level, implementation_guidance, testing_procedures)
SELECT 
    f.id,
    'AC-1',
    'Access Control Policy and Procedures',
    'Develop, document, and disseminate access control policy and procedures',
    'policy',
    'high',
    'Develop comprehensive access control policy covering all systems and users',
    'Review policy document, verify approval signatures, check implementation evidence'
FROM grc_frameworks f
WHERE f.name = 'SAMA Cybersecurity Framework';

-- Verify
SELECT 'grc_frameworks' as table_name, COUNT(*) as count FROM grc_frameworks
UNION ALL
SELECT 'grc_controls' as table_name, COUNT(*) as count FROM grc_controls;
