-- Migration 007y: Create regulators table

CREATE TABLE regulators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL,
    country VARCHAR(100),
    description TEXT,
    name_ar VARCHAR(255),
    description_ar TEXT,
    jurisdiction VARCHAR(100),
    sector VARCHAR(100),
    website VARCHAR(255),
    type VARCHAR(100),
    level VARCHAR(100),
    status VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_by UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create grc_frameworks table
CREATE TABLE IF NOT EXISTS grc_frameworks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_en VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255),
    description_en TEXT,
    description_ar TEXT,
    version VARCHAR(50),
    authority VARCHAR(255),
    country VARCHAR(100),
    regulator_id UUID REFERENCES regulators(id) ON DELETE SET NULL,
    framework_code VARCHAR(50) UNIQUE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create grc_controls table
CREATE TABLE IF NOT EXISTS grc_controls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    framework_id UUID REFERENCES grc_frameworks(id) ON DELETE CASCADE,
    control_id VARCHAR(50) NOT NULL,
    title_en VARCHAR(500) NOT NULL,
    title_ar VARCHAR(500),
    description_en TEXT,
    description_ar TEXT,
    category VARCHAR(100),
    criticality_level VARCHAR(50),
    control_type VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (framework_id, control_id)
);