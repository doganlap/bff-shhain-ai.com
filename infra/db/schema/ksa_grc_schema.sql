-- ==========================================
-- 🇸🇦 KSA GRC EXTENSIONS SCHEMA
-- ==========================================
-- These tables extend the base GRC schema with KSA-specific requirements.

-- Regulator Rules
CREATE TABLE regulator_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    regulator_id UUID NOT NULL,
    rule_name VARCHAR(255) NOT NULL,
    rule_description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (regulator_id) REFERENCES regulators(id)
);

-- Framework Versions
CREATE TABLE framework_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    framework_id UUID NOT NULL,
    version_number VARCHAR(50) NOT NULL,
    release_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (framework_id) REFERENCES grc_frameworks(id)
);

-- Control Requirements
CREATE TABLE control_requirements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    control_id UUID NOT NULL,
    requirement_description TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (control_id) REFERENCES grc_controls(id)
);

-- Evidence
CREATE TABLE evidence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    requirement_id UUID NOT NULL,
    evidence_description TEXT NOT NULL,
    file_path VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (requirement_id) REFERENCES control_requirements(id)
);

-- Validation
CREATE TABLE validation (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    evidence_id UUID NOT NULL,
    is_valid BOOLEAN NOT NULL,
    validation_notes TEXT,
    validated_by UUID,
    validated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (evidence_id) REFERENCES evidence(id),
    FOREIGN KEY (validated_by) REFERENCES users(id)
);

-- Scope
CREATE TABLE scope (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID,
    sector VARCHAR(100),
    rule_id UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (rule_id) REFERENCES regulator_rules(id)
);