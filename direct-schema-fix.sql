-- DIRECT SCHEMA FIXES FOR API COMPATIBILITY
-- Run this to fix column issues

-- Add missing columns to organizations
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS industry VARCHAR(100);
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS description TEXT;

-- Add missing columns to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Add missing columns to assessments
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Add missing columns to grc_frameworks
ALTER TABLE grc_frameworks ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Add missing columns to grc_controls
ALTER TABLE grc_controls ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Update existing records with default values
UPDATE organizations SET is_active = true WHERE is_active IS NULL;
UPDATE organizations SET industry = COALESCE(sector, 'Technology') WHERE industry IS NULL;
UPDATE organizations SET description = name WHERE description IS NULL;

UPDATE users SET is_active = true WHERE is_active IS NULL;
UPDATE assessments SET is_active = true WHERE is_active IS NULL;
UPDATE grc_frameworks SET is_active = true WHERE is_active IS NULL;
UPDATE grc_controls SET is_active = true WHERE is_active IS NULL;

-- Create activities table for dashboard
CREATE TABLE IF NOT EXISTS activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    activity_type VARCHAR(50),
    entity_type VARCHAR(50),
    entity_id UUID,
    user_id UUID,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID
);

-- Insert sample activity
INSERT INTO activities (tenant_id, title, description, activity_type)
SELECT
    '42c676e2-8d5e-4b1d-ae80-3986b82dd5c5',
    'Schema Updated',
    'Database schema has been updated for API compatibility',
    'system'
WHERE NOT EXISTS (SELECT 1 FROM activities LIMIT 1);

-- Add sample organization if none exists
INSERT INTO organizations (
    tenant_id, name, name_ar, code, type, sector, industry,
    country, city, is_active, description
)
SELECT
    '42c676e2-8d5e-4b1d-ae80-3986b82dd5c5',
    'Sample Organization',
    'منظمة نموذجية',
    'SAMPLE-001',
    'Private',
    'Technology',
    'Technology',
    'Saudi Arabia',
    'Riyadh',
    true,
    'Sample organization for testing'
WHERE NOT EXISTS (SELECT 1 FROM organizations LIMIT 1);

-- Show final status
SELECT
    'organizations' as table_name,
    COUNT(*) as total_records,
    COUNT(CASE WHEN is_active = true THEN 1 END) as active_records
FROM organizations
UNION ALL
SELECT
    'users',
    COUNT(*),
    COUNT(CASE WHEN is_active = true THEN 1 END)
FROM users
UNION ALL
SELECT
    'assessments',
    COUNT(*),
    COUNT(CASE WHEN is_active = true THEN 1 END)
FROM assessments;
