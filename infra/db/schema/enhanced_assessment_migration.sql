-- ================================================================
-- ENHANCED ASSESSMENT GENERATION MIGRATION
-- Extends existing GRC system with smart assessment capabilities
-- ================================================================

-- Add organization profiles for smart assessment generation
CREATE TABLE IF NOT EXISTS org_assessment_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations_consolidated(id) ON DELETE CASCADE,
    
    -- Core Business Context
    sector VARCHAR(100), -- Healthcare, BFSI, Government, Energy, etc.
    industry_classification VARCHAR(100),
    business_model VARCHAR(100), -- B2B, B2C, B2G
    
    -- Regulatory Context
    primary_regulators TEXT[] DEFAULT '{}', -- ['NCA', 'SAMA', 'MOH', 'SFDA']
    secondary_regulators TEXT[] DEFAULT '{}',
    regulatory_scope VARCHAR(100), -- National, Regional, International
    
    -- Data & Technology Context
    data_types TEXT[] DEFAULT '{}', -- ['PHI', 'PII', 'PCI', 'Financial', 'Biometric']
    data_sensitivity_levels TEXT[] DEFAULT '{}', -- ['Public', 'Internal', 'Confidential', 'Restricted']
    processing_purposes TEXT[] DEFAULT '{}', -- ['Healthcare', 'Marketing', 'Analytics', 'Research']
    
    -- Infrastructure Context
    deployment_model VARCHAR(50), -- 'cloud', 'onprem', 'hybrid', 'saas'
    cloud_providers TEXT[] DEFAULT '{}', -- ['AWS', 'Azure', 'GCP', 'Local']
    critical_systems TEXT[] DEFAULT '{}',
    integration_complexity VARCHAR(50), -- 'simple', 'moderate', 'complex'
    
    -- Organizational Context
    employee_count INTEGER,
    annual_revenue DECIMAL(15,2),
    geographic_presence TEXT[] DEFAULT '{}', -- ['KSA', 'GCC', 'EU', 'US']
    operational_locations TEXT[] DEFAULT '{}',
    
    -- Compliance Maturity
    current_certifications TEXT[] DEFAULT '{}', -- ['ISO27001', 'SOC2', 'HITRUST']
    target_certifications TEXT[] DEFAULT '{}',
    compliance_maturity_level INTEGER DEFAULT 1, -- 1-5 scale
    previous_audit_findings JSONB DEFAULT '{}',
    
    -- Risk Profile
    risk_appetite VARCHAR(50) DEFAULT 'moderate', -- conservative, moderate, aggressive
    risk_tolerance_score INTEGER DEFAULT 3, -- 1-5 scale
    business_criticality VARCHAR(50) DEFAULT 'medium', -- low, medium, high, critical
    
    -- Assessment Preferences
    assessment_frequency VARCHAR(50) DEFAULT 'annual', -- quarterly, semi-annual, annual
    preferred_language VARCHAR(10) DEFAULT 'en', -- en, ar, both
    assessment_depth VARCHAR(50) DEFAULT 'standard', -- basic, standard, comprehensive
    
    -- Metadata
    profile_version INTEGER DEFAULT 1,
    last_updated_by UUID,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enhanced contracts table for assessment context
CREATE TABLE IF NOT EXISTS assessment_contracts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations_consolidated(id) ON DELETE CASCADE,
    
    -- Contract Basics
    contract_name VARCHAR(255) NOT NULL,
    contract_type VARCHAR(100), -- 'service_agreement', 'dpa', 'baa', 'msa'
    effective_date DATE,
    expiry_date DATE,
    
    -- Compliance Clauses (JSONLogic compatible)
    clauses JSONB DEFAULT '{}', -- {"dpa": true, "xborder": true, "rto_hours": 4, "encryption_required": true}
    
    -- SLA Requirements
    availability_sla DECIMAL(5,2), -- 99.9%
    rto_hours INTEGER, -- Recovery Time Objective
    rpo_hours INTEGER, -- Recovery Point Objective
    
    -- Data Processing Context
    data_categories TEXT[] DEFAULT '{}',
    processing_activities TEXT[] DEFAULT '{}',
    cross_border_transfers BOOLEAN DEFAULT false,
    third_party_processors TEXT[] DEFAULT '{}',
    
    -- Security Requirements
    security_requirements JSONB DEFAULT '{}',
    encryption_requirements JSONB DEFAULT '{}',
    access_control_requirements JSONB DEFAULT '{}',
    
    -- Compliance Obligations
    regulatory_requirements TEXT[] DEFAULT '{}',
    audit_requirements JSONB DEFAULT '{}',
    reporting_obligations JSONB DEFAULT '{}',
    breach_notification_requirements JSONB DEFAULT '{}',
    
    -- Risk & Liability
    liability_caps JSONB DEFAULT '{}',
    insurance_requirements JSONB DEFAULT '{}',
    indemnification_clauses JSONB DEFAULT '{}',
    
    -- Metadata
    contract_status VARCHAR(50) DEFAULT 'active',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enhanced question variants for dynamic assessment
CREATE TABLE IF NOT EXISTS question_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    base_question_code VARCHAR(100) NOT NULL, -- References question_bank
    
    -- Conditional Logic
    condition_name VARCHAR(255) NOT NULL,
    when_json JSONB NOT NULL, -- JSONLogic condition
    priority INTEGER DEFAULT 100, -- Lower = higher priority
    
    -- Override Fields
    text_override_en TEXT,
    text_override_ar TEXT,
    evidence_hint_override TEXT,
    weight_override DECIMAL(5,2),
    criticality_override VARCHAR(20),
    
    -- Context-Specific Adjustments
    sector_specific BOOLEAN DEFAULT false,
    regulator_specific BOOLEAN DEFAULT false,
    size_specific BOOLEAN DEFAULT false,
    maturity_specific BOOLEAN DEFAULT false,
    
    -- Applicability
    applicable_sectors TEXT[] DEFAULT '{}',
    applicable_regulators TEXT[] DEFAULT '{}',
    min_employee_count INTEGER,
    max_employee_count INTEGER,
    
    -- Metadata
    variant_description TEXT,
    created_by UUID,
    status VARCHAR(50) DEFAULT 'active',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Assessment generation history and tracking
CREATE TABLE IF NOT EXISTS generated_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations_consolidated(id) ON DELETE CASCADE,
    contract_id UUID REFERENCES assessment_contracts(id),
    
    -- Generation Context
    rule_pack_used VARCHAR(100) NOT NULL,
    generation_trigger VARCHAR(100), -- 'onboarding', 'contract_change', 'periodic', 'manual'
    
    -- Input Facts (snapshot)
    input_facts JSONB NOT NULL, -- Complete facts used for generation
    
    -- Rule Evaluation Results
    matched_rules JSONB DEFAULT '[]', -- Rules that fired
    selected_question_sets TEXT[] DEFAULT '{}',
    selected_individual_questions TEXT[] DEFAULT '{}',
    applied_variants JSONB DEFAULT '[]',
    
    -- Generated Assessment
    assessment_snapshot JSONB NOT NULL, -- Complete questionnaire
    total_questions INTEGER,
    estimated_completion_time INTEGER, -- in minutes
    
    -- Scoring & Weighting
    total_possible_score DECIMAL(10,2),
    risk_weighted_score DECIMAL(10,2),
    framework_distribution JSONB DEFAULT '{}', -- Question count per framework
    
    -- Assessment Metadata
    assessment_language VARCHAR(10) DEFAULT 'en',
    assessment_depth VARCHAR(50) DEFAULT 'standard',
    due_date DATE,
    assigned_assessor UUID,
    
    -- Status Tracking
    status VARCHAR(50) DEFAULT 'generated', -- generated, assigned, in_progress, completed
    completion_percentage DECIMAL(5,2) DEFAULT 0,
    
    -- Audit Trail
    generated_by UUID,
    generation_method VARCHAR(100) DEFAULT 'automated',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enhanced rule packs with versioning
CREATE TABLE IF NOT EXISTS enhanced_rule_packs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Pack Identity
    pack_name VARCHAR(100) UNIQUE NOT NULL,
    display_name VARCHAR(255),
    description TEXT,
    
    -- Versioning
    version VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    is_default BOOLEAN DEFAULT false,
    
    -- Applicability
    target_sectors TEXT[] DEFAULT '{}',
    target_regulators TEXT[] DEFAULT '{}',
    geographic_scope TEXT[] DEFAULT '{}',
    
    -- Pack Configuration
    base_question_count INTEGER DEFAULT 0,
    max_additional_questions INTEGER DEFAULT 100,
    default_assessment_depth VARCHAR(50) DEFAULT 'standard',
    
    -- Metadata
    author VARCHAR(255),
    approval_status VARCHAR(50) DEFAULT 'draft',
    approved_by UUID,
    approval_date DATE,
    
    -- Lifecycle
    effective_date DATE DEFAULT CURRENT_DATE,
    expiry_date DATE,
    superseded_by UUID REFERENCES enhanced_rule_packs(id),
    
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enhanced rules with better organization
CREATE TABLE IF NOT EXISTS enhanced_assessment_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rule_pack_id UUID REFERENCES enhanced_rule_packs(id) ON DELETE CASCADE,
    
    -- Rule Identity
    rule_name VARCHAR(255) NOT NULL,
    rule_code VARCHAR(100), -- For referencing
    description TEXT,
    
    -- Rule Logic
    priority INTEGER DEFAULT 100, -- Lower = higher priority
    when_json JSONB NOT NULL, -- JSONLogic condition
    emit JSONB NOT NULL, -- What to add/modify
    
    -- Rule Categories
    rule_category VARCHAR(100), -- 'baseline', 'sector_specific', 'regulator_specific', 'risk_based'
    rule_type VARCHAR(50), -- 'additive', 'subtractive', 'modifier'
    
    -- Conditions Context
    condition_description TEXT,
    example_scenarios TEXT[],
    
    -- Impact Assessment
    typical_question_addition INTEGER DEFAULT 0,
    impact_on_assessment_time INTEGER DEFAULT 0, -- in minutes
    
    -- Rule Metadata
    rule_author VARCHAR(255),
    last_tested_date DATE,
    test_scenarios JSONB DEFAULT '[]',
    
    -- Status
    status VARCHAR(50) DEFAULT 'active',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ================================================================
-- INDEXES FOR PERFORMANCE
-- ================================================================

-- Organization profiles indexes
CREATE INDEX idx_org_profiles_org_id ON org_assessment_profiles(organization_id);
CREATE INDEX idx_org_profiles_sector ON org_assessment_profiles(sector);
CREATE INDEX idx_org_profiles_regulators ON org_assessment_profiles USING gin(primary_regulators);
CREATE INDEX idx_org_profiles_data_types ON org_assessment_profiles USING gin(data_types);

-- Contracts indexes
CREATE INDEX idx_assessment_contracts_org_id ON assessment_contracts(organization_id);
CREATE INDEX idx_assessment_contracts_type ON assessment_contracts(contract_type);
CREATE INDEX idx_assessment_contracts_status ON assessment_contracts(contract_status);

-- Question variants indexes
CREATE INDEX idx_question_variants_base_code ON question_variants(base_question_code);
CREATE INDEX idx_question_variants_priority ON question_variants(priority);
CREATE INDEX idx_question_variants_status ON question_variants(status);

-- Generated assessments indexes
CREATE INDEX idx_generated_assessments_org_id ON generated_assessments(organization_id);
CREATE INDEX idx_generated_assessments_status ON generated_assessments(status);
CREATE INDEX idx_generated_assessments_created ON generated_assessments(created_at DESC);

-- Rule packs indexes
CREATE INDEX idx_enhanced_rule_packs_name ON enhanced_rule_packs(pack_name);
CREATE INDEX idx_enhanced_rule_packs_active ON enhanced_rule_packs(is_active);
CREATE INDEX idx_enhanced_rule_packs_sectors ON enhanced_rule_packs USING gin(target_sectors);

-- Rules indexes
CREATE INDEX idx_enhanced_rules_pack_id ON enhanced_assessment_rules(rule_pack_id);
CREATE INDEX idx_enhanced_rules_priority ON enhanced_assessment_rules(priority);
CREATE INDEX idx_enhanced_rules_category ON enhanced_assessment_rules(rule_category);

-- ================================================================
-- TRIGGERS
-- ================================================================

-- Update triggers for timestamp management
CREATE TRIGGER update_org_profiles_updated_at 
    BEFORE UPDATE ON org_assessment_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assessment_contracts_updated_at 
    BEFORE UPDATE ON assessment_contracts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_question_variants_updated_at 
    BEFORE UPDATE ON question_variants 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_generated_assessments_updated_at 
    BEFORE UPDATE ON generated_assessments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_enhanced_rule_packs_updated_at 
    BEFORE UPDATE ON enhanced_rule_packs 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_enhanced_rules_updated_at 
    BEFORE UPDATE ON enhanced_assessment_rules 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================================================
-- SUCCESS MESSAGE
-- ================================================================

\echo '✅ Enhanced Assessment Generation Schema Created Successfully!'
\echo ''
\echo '📊 New Tables Created:'
\echo '   • org_assessment_profiles - Smart organization profiling'
\echo '   • assessment_contracts - Contract-driven assessment context'
\echo '   • question_variants - Dynamic question modifications'
\echo '   • generated_assessments - Assessment generation tracking'
\echo '   • enhanced_rule_packs - Versioned rule management'
\echo '   • enhanced_assessment_rules - Advanced rule engine'
\echo ''
\echo '🚀 Ready for smart assessment generation implementation!'
