-- Migration 001: Add Tenants Table for Multi-Tenant Support
-- This creates the foundation for multi-tenant architecture

-- Enable UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tenants table (organizations become tenants)
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Tenant Identity
    tenant_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    display_name VARCHAR(255),
    
    -- Business Information
    industry VARCHAR(100),
    sector VARCHAR(100),
    country VARCHAR(100) DEFAULT 'Saudi Arabia',
    
    -- Contact Information
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    
    -- Tenant Configuration
    subscription_tier VARCHAR(50) DEFAULT 'basic',
    max_users INTEGER DEFAULT 10,
    is_active BOOLEAN DEFAULT true,
    
    -- Audit fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_tenants_tenant_code ON tenants(tenant_code);
CREATE INDEX IF NOT EXISTS idx_tenants_active ON tenants(is_active);

-- Insert default tenant for existing data
INSERT INTO tenants (tenant_code, name, display_name, sector, email) 
VALUES ('DEFAULT', 'Default Organization', 'Default Org', 'General', 'admin@example.com')
ON CONFLICT (tenant_code) DO NOTHING;

-- Update organizations table to link to tenants (if exists)
DO $$ 
BEGIN
    -- Check if organizations table exists and add tenant_id if missing
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'organizations') THEN
        -- Add tenant_id column if it doesn't exist
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'organizations' AND column_name = 'tenant_id') THEN
            ALTER TABLE organizations ADD COLUMN tenant_id UUID REFERENCES tenants(id);
            
            -- Set default tenant for existing organizations
            UPDATE organizations SET tenant_id = (SELECT id FROM tenants WHERE tenant_code = 'DEFAULT' LIMIT 1) WHERE tenant_id IS NULL;
        END IF;
    END IF;
END $$;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger to tenants table
DROP TRIGGER IF EXISTS update_tenants_updated_at ON tenants;
CREATE TRIGGER update_tenants_updated_at 
    BEFORE UPDATE ON tenants 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
