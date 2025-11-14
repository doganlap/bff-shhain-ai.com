-- ==========================================
-- 🎯 SECTOR-BASED INTELLIGENCE FIELDS
-- ==========================================
-- Migration: 013_add_sector_intelligence_fields.sql
-- Purpose: Add fields for automatic sector-based control filtering
-- Date: 2025-10-30

-- Add sector intelligence fields to organizations table
ALTER TABLE organizations 
-- Sector Information (for auto-filtering)
ADD COLUMN IF NOT EXISTS sector VARCHAR(100), -- Direct sector name (healthcare, manufacturing, etc.)
ADD COLUMN IF NOT EXISTS industry_subcategory VARCHAR(255),
ADD COLUMN IF NOT EXISTS organization_type VARCHAR(100), -- private, public, government, non-profit

-- Size & Scale (for control scaling)
ADD COLUMN IF NOT EXISTS employee_count INTEGER,
ADD COLUMN IF NOT EXISTS annual_revenue DECIMAL(15,2),
ADD COLUMN IF NOT EXISTS location_count INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS geographic_spread VARCHAR(100), -- local, national, regional, international
ADD COLUMN IF NOT EXISTS customer_base_size INTEGER,

-- Data Processing (triggers framework assignment)
ADD COLUMN IF NOT EXISTS processes_personal_data BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS personal_data_types TEXT[], -- Array: ['customer', 'employee', 'patient', etc.]
ADD COLUMN IF NOT EXISTS data_volume_estimate INTEGER,
ADD COLUMN IF NOT EXISTS data_sensitivity_level VARCHAR(50), -- public, internal, confidential, critical
ADD COLUMN IF NOT EXISTS processes_payment_data BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS provides_cloud_services BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_critical_infrastructure BOOLEAN DEFAULT false,

-- Location & Jurisdiction
ADD COLUMN IF NOT EXISTS operates_internationally BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS international_jurisdictions TEXT[], -- Array of countries

-- Auto-Calculated Fields (system populates)
ADD COLUMN IF NOT EXISTS applicable_regulators TEXT[], -- Array: ['NCA', 'MOH', 'SDAIA']
ADD COLUMN IF NOT EXISTS applicable_frameworks TEXT[], -- Array: ['NCA-ECC', 'HIS', 'PDPL']
ADD COLUMN IF NOT EXISTS mandatory_framework_ids UUID[], -- Array of framework UUIDs
ADD COLUMN IF NOT EXISTS optional_framework_ids UUID[], -- Array of framework UUIDs
ADD COLUMN IF NOT EXISTS estimated_control_count INTEGER,
ADD COLUMN IF NOT EXISTS mandatory_control_count INTEGER,
ADD COLUMN IF NOT EXISTS optional_control_count INTEGER,

-- Assessment Configuration
ADD COLUMN IF NOT EXISTS assessment_frequency VARCHAR(50), -- monthly, quarterly, semi-annual, annual
ADD COLUMN IF NOT EXISTS assessment_duration_weeks INTEGER,
ADD COLUMN IF NOT EXISTS next_assessment_due DATE,
ADD COLUMN IF NOT EXISTS last_assessment_date DATE,

-- Compliance Officer
ADD COLUMN IF NOT EXISTS ciso_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS ciso_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS ciso_phone VARCHAR(50),

-- Cost Estimation
ADD COLUMN IF NOT EXISTS estimated_assessment_cost DECIMAL(15,2),
ADD COLUMN IF NOT EXISTS estimated_annual_compliance_cost DECIMAL(15,2),

-- Onboarding Status
ADD COLUMN IF NOT EXISTS onboarding_status VARCHAR(50) DEFAULT 'pending', -- pending, configured, approved, active
ADD COLUMN IF NOT EXISTS configuration_approved_by UUID,
ADD COLUMN IF NOT EXISTS configuration_approved_at TIMESTAMP,

-- Metadata
ADD COLUMN IF NOT EXISTS auto_configuration_data JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS custom_requirements TEXT;

-- Add constraints
ALTER TABLE organizations 
ADD CONSTRAINT chk_org_onboarding_status 
CHECK (onboarding_status IN ('pending', 'configured', 'approved', 'active', 'suspended'));

ALTER TABLE organizations 
ADD CONSTRAINT chk_org_data_sensitivity 
CHECK (data_sensitivity_level IN ('public', 'internal', 'confidential', 'highly_confidential', 'critical'));

ALTER TABLE organizations 
ADD CONSTRAINT chk_org_assessment_frequency 
CHECK (assessment_frequency IN ('monthly', 'quarterly', 'semi_annual', 'annual'));

ALTER TABLE organizations 
ADD CONSTRAINT chk_org_geographic_spread 
CHECK (geographic_spread IN ('local', 'regional', 'national', 'gcc', 'international'));

-- Create indexes for sector-based queries
CREATE INDEX IF NOT EXISTS idx_organizations_sector ON organizations(sector);
CREATE INDEX IF NOT EXISTS idx_organizations_employee_count ON organizations(employee_count);
CREATE INDEX IF NOT EXISTS idx_organizations_processes_personal_data ON organizations(processes_personal_data);
CREATE INDEX IF NOT EXISTS idx_organizations_is_critical ON organizations(is_critical_infrastructure);
CREATE INDEX IF NOT EXISTS idx_organizations_onboarding_status ON organizations(onboarding_status);
CREATE INDEX IF NOT EXISTS idx_organizations_assessment_frequency ON organizations(assessment_frequency);

-- Create GIN index for array fields (for fast array searches)
CREATE INDEX IF NOT EXISTS idx_organizations_applicable_regulators ON organizations USING GIN(applicable_regulators);
CREATE INDEX IF NOT EXISTS idx_organizations_applicable_frameworks ON organizations USING GIN(applicable_frameworks);
CREATE INDEX IF NOT EXISTS idx_organizations_personal_data_types ON organizations USING GIN(personal_data_types);

-- Create updated view with sector intelligence
CREATE OR REPLACE VIEW organization_intelligence_summary AS
SELECT 
    o.id,
    o.name,
    o.name_ar,
    o.sector,
    o.industry_subcategory,
    o.employee_count,
    CASE 
        WHEN o.employee_count > 1000 THEN 'enterprise'
        WHEN o.employee_count > 250 THEN 'large'
        WHEN o.employee_count > 50 THEN 'medium'
        ELSE 'small'
    END as size_category,
    o.processes_personal_data,
    o.is_critical_infrastructure,
    o.country,
    o.city,
    o.applicable_regulators,
    o.applicable_frameworks,
    o.estimated_control_count,
    o.mandatory_control_count,
    o.assessment_frequency,
    o.estimated_annual_compliance_cost,
    o.onboarding_status,
    o.created_at,
    o.updated_at
FROM organizations o;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON organizations TO postgres;
GRANT SELECT ON organization_intelligence_summary TO postgres;

-- Add helpful comments
COMMENT ON COLUMN organizations.sector IS 'Business sector - triggers automatic regulator and framework assignment';
COMMENT ON COLUMN organizations.employee_count IS 'Number of employees - determines control scaling';
COMMENT ON COLUMN organizations.processes_personal_data IS 'Triggers PDPL framework if true';
COMMENT ON COLUMN organizations.applicable_regulators IS 'Auto-calculated array of regulator codes';
COMMENT ON COLUMN organizations.applicable_frameworks IS 'Auto-calculated array of framework codes';
COMMENT ON COLUMN organizations.estimated_control_count IS 'Auto-calculated total control count';

-- Success message
SELECT 
    'Sector intelligence fields added successfully!' as status,
    COUNT(*) as new_columns_added
FROM information_schema.columns
WHERE table_name = 'organizations'
AND column_name IN (
    'sector', 'employee_count', 'processes_personal_data',
    'applicable_regulators', 'applicable_frameworks',
    'estimated_control_count', 'assessment_frequency'
);

