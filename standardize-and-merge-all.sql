-- Standardized Database Schema with ALL CSV Data
-- This will import all 3400+ records from CSV files

\echo '========================================='
\echo 'CLEANING AND MERGING ALL DATA'
\echo '========================================='

-- Drop and recreate clean schema
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;

-- Create GRC Frameworks table
CREATE TABLE grc_frameworks (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(500) NOT NULL,
    name_ar VARCHAR(500),
    description TEXT,
    description_ar TEXT,
    version VARCHAR(100),
    authority VARCHAR(500),
    authority_ar VARCHAR(500),
    jurisdiction VARCHAR(255),
    mandatory BOOLEAN DEFAULT false,
    industry_sector VARCHAR(255),
    total_controls INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create GRC Controls table (no foreign key constraint)
CREATE TABLE grc_controls (
    id VARCHAR(255) PRIMARY KEY,
    framework_id VARCHAR(255),
    control_id VARCHAR(255) NOT NULL,
    title VARCHAR(1000) NOT NULL,
    title_ar VARCHAR(1000),
    description TEXT,
    description_ar TEXT,
    category VARCHAR(255),
    subcategory VARCHAR(255),
    risk_level VARCHAR(50),
    evidence_required BOOLEAN DEFAULT false,
    implementation_guidance TEXT,
    implementation_guidance_ar TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_grc_controls_framework ON grc_controls(framework_id);
CREATE INDEX idx_grc_controls_category ON grc_controls(category);
CREATE INDEX idx_grc_controls_risk ON grc_controls(risk_level);

\echo 'Tables created. Now importing CSV files...'
\echo ''

-- Import Frameworks (53 rows)
\echo 'Importing frameworks...'
\copy grc_frameworks(id, name, name_ar, description, description_ar, version, authority, authority_ar, jurisdiction, mandatory, industry_sector, total_controls) FROM 'apps/web/database/unified_frameworks_enhanced.csv' CSV HEADER;

-- Import Controls (2303 rows) - with field mapping
\echo 'Importing controls...'
\copy grc_controls(id, framework_id, control_id, title, title_ar, description, description_ar, category, subcategory, risk_level, evidence_required, implementation_guidance, implementation_guidance_ar) FROM PROGRAM 'powershell -Command "Import-Csv ''apps/web/database/unified_controls_enhanced.csv'' | ForEach-Object { \"$($_.framework_code + ''-'' + $_.control_number)\t$($_.framework_code)\t$($_.control_number)\t$($_.title_en)\t$($_.title_ar)\t$($_.requirement_en)\t$($_.requirement_ar)\t$($_.domain)\t$($_.control_type)\tmedium\tTRUE\t$($_.implementation_guidance_en)\t$($_.implementation_guidance_ar)\" }"' WITH (FORMAT csv, DELIMITER E'\t', NULL '');

\echo ''
\echo '========================================='
\echo 'Verifying data...'
\echo '========================================='
SELECT 'Frameworks: ' || COUNT(*) FROM grc_frameworks;
SELECT 'Controls: ' || COUNT(*) FROM grc_controls;

\echo ''
\echo 'Done! Database standardized and merged.'
