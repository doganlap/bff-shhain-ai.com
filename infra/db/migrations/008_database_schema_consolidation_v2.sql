-- Migration 008: Simplified Database Schema Consolidation
-- Adds missing status column and partner_collaborations table

BEGIN;

-- Add status column to tenants table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'tenants' AND column_name = 'status') THEN
        ALTER TABLE tenants ADD COLUMN status VARCHAR(20) DEFAULT 'active';
    END IF;
END $$;

-- Update existing tenants to have active status
UPDATE tenants SET status = 'active' WHERE status IS NULL;

-- Create partner_collaborations table if it doesn't exist
CREATE TABLE IF NOT EXISTS partner_collaborations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    partner_tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    collaboration_type VARCHAR(50) NOT NULL DEFAULT 'standard',
    status VARCHAR(20) DEFAULT 'active',
    permissions JSONB DEFAULT '{}',
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, partner_tenant_id)
);

-- Create indexes for partner_collaborations
CREATE INDEX IF NOT EXISTS idx_partner_collaborations_tenant_id
    ON partner_collaborations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_partner_collaborations_partner_tenant_id
    ON partner_collaborations(partner_tenant_id);
CREATE INDEX IF NOT EXISTS idx_partner_collaborations_status
    ON partner_collaborations(status);

-- Add trigger for partner_collaborations updated_at
CREATE OR REPLACE FUNCTION update_partner_collaborations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_partner_collaborations_updated_at
    BEFORE UPDATE ON partner_collaborations
    FOR EACH ROW
    EXECUTE FUNCTION update_partner_collaborations_updated_at();

-- Add new indexes for performance
CREATE INDEX IF NOT EXISTS idx_tenants_status ON tenants(status);
CREATE INDEX IF NOT EXISTS idx_tenants_active_status ON tenants(is_active, status);

-- Ensure all users have tenant_id (create default tenant if needed)
INSERT INTO tenants (
    tenant_code, name, display_name, industry, country,
    email, phone, is_active, status, created_at, updated_at
)
SELECT
    'DEFAULT', 'Default Organization', 'Default Organization', 'Technology',
    'Saudi Arabia', 'admin@default.com', '+966-XXX-XXXX',
    true, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM tenants WHERE tenant_code = 'DEFAULT');

-- Update users without tenant_id to use default tenant
UPDATE users SET tenant_id = (
    SELECT id FROM tenants WHERE tenant_code = 'DEFAULT' LIMIT 1
) WHERE tenant_id IS NULL;

COMMIT;

-- Verification queries (outside transaction)
SELECT 'Tenants with status column' as check_name,
    COUNT(*) FILTER (WHERE status IS NOT NULL) as with_status,
    COUNT(*) as total_tenants
FROM tenants;

SELECT 'Users with tenant_id' as check_name, COUNT(*) as count
FROM users WHERE tenant_id IS NOT NULL;

SELECT 'Partner collaborations table created' as check_name,
    COUNT(*) as initial_count
FROM partner_collaborations;
