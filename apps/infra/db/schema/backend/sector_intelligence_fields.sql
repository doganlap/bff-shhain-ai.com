-- ==========================================
-- GRC Template System - Sector Intelligence Enhancement
-- Adds sector-based auto-filtering capabilities to organizations
-- ==========================================

-- Add sector intelligence fields to organizations table
ALTER TABLE organizations 
-- Sector Information (for auto-filtering)
ADD COLUMN IF NOT EXISTS sector VARCHAR(100), -- Direct sector name (healthcare, finance, telecom, etc.)
ADD COLUMN IF NOT EXISTS sub_sector VARCHAR(100), -- More specific sector (hospitals, banks, mobile_operators, etc.)
ADD COLUMN IF NOT EXISTS business_activities TEXT[], -- Array of business activities
ADD COLUMN IF NOT EXISTS regulatory_scope VARCHAR(100), -- 'national', 'regional', 'international'

-- Organization Size & Scale
ADD COLUMN IF NOT EXISTS employee_count INTEGER,
ADD COLUMN IF NOT EXISTS annual_revenue DECIMAL(15,2),
ADD COLUMN IF NOT EXISTS market_cap DECIMAL(15,2),
ADD COLUMN IF NOT EXISTS geographic_presence TEXT[], -- Array of countries/regions

-- Data & Privacy Intelligence
ADD COLUMN IF NOT EXISTS processes_personal_data BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS personal_data_types TEXT[], -- Array: ['pii', 'phi', 'financial', 'biometric']
ADD COLUMN IF NOT EXISTS data_subjects_count INTEGER, -- Estimated number of data subjects
ADD COLUMN IF NOT EXISTS cross_border_transfers BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS data_retention_period_months INTEGER,
ADD COLUMN IF NOT EXISTS data_sensitivity_level VARCHAR(50) DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'

-- Technology & Infrastructure
ADD COLUMN IF NOT EXISTS it_infrastructure_type VARCHAR(100), -- 'cloud', 'hybrid', 'on_premise'
ADD COLUMN IF NOT EXISTS cloud_providers TEXT[], -- Array: ['aws', 'azure', 'gcp', 'local']
ADD COLUMN IF NOT EXISTS critical_systems TEXT[], -- Array of critical system types
ADD COLUMN IF NOT EXISTS internet_facing_services BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS mobile_applications BOOLEAN DEFAULT false,

-- Auto-Calculated Fields (system populates)
ADD COLUMN IF NOT EXISTS applicable_regulators TEXT[], -- Array: ['NCA', 'MOH', 'SAMA']
ADD COLUMN IF NOT EXISTS applicable_frameworks TEXT[], -- Array: ['NCA-ECC', 'MOH-PHI', 'SAMA-CB']
ADD COLUMN IF NOT EXISTS mandatory_framework_ids UUID[], -- Array of framework UUIDs
ADD COLUMN IF NOT EXISTS estimated_control_count INTEGER DEFAULT 0,

-- Assessment Intelligence
ADD COLUMN IF NOT EXISTS assessment_frequency VARCHAR(50) DEFAULT 'annual', -- 'continuous', 'quarterly', 'semi_annual', 'annual'
ADD COLUMN IF NOT EXISTS risk_appetite VARCHAR(50) DEFAULT 'medium', -- 'low', 'medium', 'high'
ADD COLUMN IF NOT EXISTS compliance_maturity_level VARCHAR(50) DEFAULT 'developing', -- 'initial', 'developing', 'defined', 'managed', 'optimized'
ADD COLUMN IF NOT EXISTS previous_assessment_results JSONB DEFAULT '{}',

-- Onboarding & Status
ADD COLUMN IF NOT EXISTS onboarding_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'in_progress', 'completed'
ADD COLUMN IF NOT EXISTS onboarding_completion_date DATE,
ADD COLUMN IF NOT EXISTS auto_config_applied BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS auto_config_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS sector_confidence_score INTEGER DEFAULT 0 CHECK (sector_confidence_score >= 0 AND sector_confidence_score <= 100),

-- Contact & Governance
ADD COLUMN IF NOT EXISTS dpo_name VARCHAR(255), -- Data Protection Officer
ADD COLUMN IF NOT EXISTS dpo_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS dpo_phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS ciso_name VARCHAR(255), -- Chief Information Security Officer
ADD COLUMN IF NOT EXISTS ciso_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS board_oversight BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS audit_committee BOOLEAN DEFAULT false,

-- External Relationships
ADD COLUMN IF NOT EXISTS third_party_vendors TEXT[], -- Array of vendor types
ADD COLUMN IF NOT EXISTS outsourced_functions TEXT[], -- Array of outsourced business functions
ADD COLUMN IF NOT EXISTS joint_ventures TEXT[], -- Array of joint venture partners
ADD COLUMN IF NOT EXISTS regulatory_relationships JSONB DEFAULT '{}'; -- Relationships with regulators

-- ==========================================
-- ADD CONSTRAINTS
-- ==========================================

-- Add check constraints for enum-like fields
ALTER TABLE organizations 
ADD CONSTRAINT chk_onboarding_status 
    CHECK (onboarding_status IN ('pending', 'in_progress', 'completed'));

ALTER TABLE organizations 
ADD CONSTRAINT chk_data_sensitivity_level 
    CHECK (data_sensitivity_level IN ('low', 'medium', 'high', 'critical'));

ALTER TABLE organizations 
ADD CONSTRAINT chk_assessment_frequency 
    CHECK (assessment_frequency IN ('continuous', 'monthly', 'quarterly', 'semi_annual', 'annual', 'biennial'));

ALTER TABLE organizations 
ADD CONSTRAINT chk_risk_appetite 
    CHECK (risk_appetite IN ('low', 'medium', 'high'));

ALTER TABLE organizations 
ADD CONSTRAINT chk_compliance_maturity 
    CHECK (compliance_maturity_level IN ('initial', 'developing', 'defined', 'managed', 'optimized'));

-- ==========================================
-- CREATE INDEXES FOR SECTOR-BASED QUERIES
-- ==========================================

-- Create indexes for sector-based queries
CREATE INDEX IF NOT EXISTS idx_organizations_sector ON organizations(sector);
CREATE INDEX IF NOT EXISTS idx_organizations_employee_count ON organizations(employee_count);
CREATE INDEX IF NOT EXISTS idx_organizations_processes_personal_data ON organizations(processes_personal_data);
CREATE INDEX IF NOT EXISTS idx_organizations_data_sensitivity ON organizations(data_sensitivity_level);
CREATE INDEX IF NOT EXISTS idx_organizations_onboarding_status ON organizations(onboarding_status);
CREATE INDEX IF NOT EXISTS idx_organizations_compliance_maturity ON organizations(compliance_maturity_level);

-- Create GIN index for array fields (for fast array searches)
CREATE INDEX IF NOT EXISTS idx_organizations_applicable_regulators ON organizations USING GIN (applicable_regulators);
CREATE INDEX IF NOT EXISTS idx_organizations_applicable_frameworks ON organizations USING GIN (applicable_frameworks);
CREATE INDEX IF NOT EXISTS idx_organizations_personal_data_types ON organizations USING GIN (personal_data_types);
CREATE INDEX IF NOT EXISTS idx_organizations_business_activities ON organizations USING GIN (business_activities);
CREATE INDEX IF NOT EXISTS idx_organizations_cloud_providers ON organizations USING GIN (cloud_providers);
CREATE INDEX IF NOT EXISTS idx_organizations_critical_systems ON organizations USING GIN (critical_systems);

-- ==========================================
-- CREATE SECTOR INTELLIGENCE VIEW
-- ==========================================

-- Create a view for organization intelligence summary
CREATE OR REPLACE VIEW organization_intelligence_summary AS
SELECT 
    o.id,
    o.name,
    o.sector,
    o.sub_sector,
    o.employee_count,
    CASE 
        WHEN o.employee_count < 50 THEN 'small'
        WHEN o.employee_count < 250 THEN 'medium'
        WHEN o.employee_count < 1000 THEN 'large'
        ELSE 'enterprise'
    END as size_category,
    o.processes_personal_data,
    o.data_sensitivity_level,
    o.compliance_maturity_level,
    o.applicable_regulators,
    o.applicable_frameworks,
    o.estimated_control_count,
    o.assessment_frequency,
    o.onboarding_status,
    o.auto_config_applied,
    o.sector_confidence_score,
    o.created_at,
    o.updated_at
FROM organizations o
WHERE o.is_active = true;

-- ==========================================
-- CREATE SECTOR MAPPING FUNCTIONS
-- ==========================================

-- Function to auto-assign regulators based on sector
CREATE OR REPLACE FUNCTION auto_assign_regulators(org_sector VARCHAR, org_sub_sector VARCHAR DEFAULT NULL)
RETURNS TEXT[] AS $$
DECLARE
    regulator_codes TEXT[] := '{}';
BEGIN
    -- Healthcare sector
    IF org_sector = 'healthcare' THEN
        regulator_codes := regulator_codes || ARRAY['MOH', 'SFDA'];
        IF org_sub_sector IN ('hospitals', 'clinics') THEN
            regulator_codes := regulator_codes || ARRAY['CBAHI'];
        END IF;
    END IF;
    
    -- Financial services sector
    IF org_sector = 'finance' THEN
        regulator_codes := regulator_codes || ARRAY['SAMA', 'CMA'];
        IF org_sub_sector IN ('banks', 'insurance') THEN
            regulator_codes := regulator_codes || ARRAY['SAMA'];
        END IF;
    END IF;
    
    -- Telecommunications sector
    IF org_sector = 'telecom' THEN
        regulator_codes := regulator_codes || ARRAY['CITC', 'NCA'];
    END IF;
    
    -- Energy sector
    IF org_sector = 'energy' THEN
        regulator_codes := regulator_codes || ARRAY['ECRA', 'NCA'];
    END IF;
    
    -- Government sector
    IF org_sector = 'government' THEN
        regulator_codes := regulator_codes || ARRAY['NCA', 'NCSC'];
    END IF;
    
    -- Education sector
    IF org_sector = 'education' THEN
        regulator_codes := regulator_codes || ARRAY['MOE', 'NCA'];
    END IF;
    
    -- All sectors with IT infrastructure get NCA
    regulator_codes := regulator_codes || ARRAY['NCA'];
    
    -- Remove duplicates and return
    SELECT array_agg(DISTINCT unnest) FROM unnest(regulator_codes) INTO regulator_codes;
    
    RETURN regulator_codes;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-assign frameworks based on regulators
CREATE OR REPLACE FUNCTION auto_assign_frameworks(regulator_codes TEXT[])
RETURNS TEXT[] AS $$
DECLARE
    framework_codes TEXT[] := '{}';
    reg_code TEXT;
BEGIN
    FOREACH reg_code IN ARRAY regulator_codes
    LOOP
        CASE reg_code
            WHEN 'NCA' THEN 
                framework_codes := framework_codes || ARRAY['NCA-ECC', 'NCA-SCSF'];
            WHEN 'MOH' THEN 
                framework_codes := framework_codes || ARRAY['MOH-PHI'];
            WHEN 'SAMA' THEN 
                framework_codes := framework_codes || ARRAY['SAMA-CB', 'SAMA-IT'];
            WHEN 'CITC' THEN 
                framework_codes := framework_codes || ARRAY['CITC-TR'];
            WHEN 'CMA' THEN 
                framework_codes := framework_codes || ARRAY['CMA-REG'];
            WHEN 'ECRA' THEN 
                framework_codes := framework_codes || ARRAY['ECRA-SEC'];
            WHEN 'SFDA' THEN 
                framework_codes := framework_codes || ARRAY['SFDA-QMS'];
            WHEN 'CBAHI' THEN 
                framework_codes := framework_codes || ARRAY['CBAHI-STD'];
            WHEN 'MOE' THEN 
                framework_codes := framework_codes || ARRAY['MOE-IS'];
            WHEN 'NCSC' THEN 
                framework_codes := framework_codes || ARRAY['NCSC-GOV'];
            ELSE
                -- Default case, no additional frameworks
                NULL;
        END CASE;
    END LOOP;
    
    -- Remove duplicates and return
    SELECT array_agg(DISTINCT unnest) FROM unnest(framework_codes) INTO framework_codes;
    
    RETURN framework_codes;
END;
$$ LANGUAGE plpgsql;

-- Function to estimate control count based on organization characteristics
CREATE OR REPLACE FUNCTION estimate_control_count(
    org_sector VARCHAR,
    employee_count INTEGER,
    processes_personal_data BOOLEAN,
    data_sensitivity VARCHAR
)
RETURNS INTEGER AS $$
DECLARE
    base_count INTEGER := 50; -- Base control count
    sector_multiplier DECIMAL := 1.0;
    size_multiplier DECIMAL := 1.0;
    data_multiplier DECIMAL := 1.0;
    sensitivity_multiplier DECIMAL := 1.0;
BEGIN
    -- Sector-based multipliers
    CASE org_sector
        WHEN 'finance' THEN sector_multiplier := 1.5;
        WHEN 'healthcare' THEN sector_multiplier := 1.4;
        WHEN 'government' THEN sector_multiplier := 1.6;
        WHEN 'energy' THEN sector_multiplier := 1.3;
        WHEN 'telecom' THEN sector_multiplier := 1.2;
        ELSE sector_multiplier := 1.0;
    END CASE;
    
    -- Size-based multipliers
    IF employee_count < 50 THEN
        size_multiplier := 0.7;
    ELSIF employee_count < 250 THEN
        size_multiplier := 1.0;
    ELSIF employee_count < 1000 THEN
        size_multiplier := 1.3;
    ELSE
        size_multiplier := 1.5;
    END IF;
    
    -- Data processing multiplier
    IF processes_personal_data THEN
        data_multiplier := 1.2;
    END IF;
    
    -- Data sensitivity multiplier
    CASE data_sensitivity
        WHEN 'critical' THEN sensitivity_multiplier := 1.4;
        WHEN 'high' THEN sensitivity_multiplier := 1.2;
        WHEN 'medium' THEN sensitivity_multiplier := 1.0;
        WHEN 'low' THEN sensitivity_multiplier := 0.8;
        ELSE sensitivity_multiplier := 1.0;
    END CASE;
    
    -- Calculate final estimate
    RETURN ROUND(base_count * sector_multiplier * size_multiplier * data_multiplier * sensitivity_multiplier);
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- CREATE TRIGGER FOR AUTO-CONFIGURATION
-- ==========================================

-- Trigger function to auto-populate sector intelligence fields
CREATE OR REPLACE FUNCTION trigger_auto_configure_organization()
RETURNS TRIGGER AS $$
BEGIN
    -- Only auto-configure if sector is provided and auto-config hasn't been applied
    IF NEW.sector IS NOT NULL AND (OLD.auto_config_applied IS NULL OR OLD.auto_config_applied = false) THEN
        
        -- Auto-assign regulators
        NEW.applicable_regulators := auto_assign_regulators(NEW.sector, NEW.sub_sector);
        
        -- Auto-assign frameworks
        NEW.applicable_frameworks := auto_assign_frameworks(NEW.applicable_regulators);
        
        -- Estimate control count
        NEW.estimated_control_count := estimate_control_count(
            NEW.sector,
            COALESCE(NEW.employee_count, 100),
            COALESCE(NEW.processes_personal_data, false),
            COALESCE(NEW.data_sensitivity_level, 'medium')
        );
        
        -- Set auto-config flags
        NEW.auto_config_applied := true;
        NEW.auto_config_date := CURRENT_TIMESTAMP;
        NEW.sector_confidence_score := 85; -- Default confidence score
        
        -- Set default assessment frequency based on sector
        IF NEW.assessment_frequency IS NULL THEN
            CASE NEW.sector
                WHEN 'finance' THEN NEW.assessment_frequency := 'quarterly';
                WHEN 'healthcare' THEN NEW.assessment_frequency := 'semi_annual';
                WHEN 'government' THEN NEW.assessment_frequency := 'annual';
                ELSE NEW.assessment_frequency := 'annual';
            END CASE;
        END IF;
        
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS trg_auto_configure_organization ON organizations;
CREATE TRIGGER trg_auto_configure_organization
    BEFORE INSERT OR UPDATE ON organizations
    FOR EACH ROW
    EXECUTE FUNCTION trigger_auto_configure_organization();

-- ==========================================
-- COMMENTS FOR SECTOR INTELLIGENCE
-- ==========================================

COMMENT ON COLUMN organizations.sector IS 'Primary business sector for regulatory auto-assignment';
COMMENT ON COLUMN organizations.applicable_regulators IS 'Auto-assigned regulatory authorities based on sector';
COMMENT ON COLUMN organizations.applicable_frameworks IS 'Auto-assigned compliance frameworks';
COMMENT ON COLUMN organizations.estimated_control_count IS 'System-calculated estimate of applicable controls';
COMMENT ON COLUMN organizations.sector_confidence_score IS 'Confidence level in sector-based auto-assignments';
COMMENT ON COLUMN organizations.auto_config_applied IS 'Flag indicating if auto-configuration has been applied';

COMMENT ON FUNCTION auto_assign_regulators(VARCHAR, VARCHAR) IS 'Auto-assigns regulatory authorities based on organization sector';
COMMENT ON FUNCTION auto_assign_frameworks(TEXT[]) IS 'Auto-assigns compliance frameworks based on applicable regulators';
COMMENT ON FUNCTION estimate_control_count(VARCHAR, INTEGER, BOOLEAN, VARCHAR) IS 'Estimates applicable control count based on organization characteristics';
