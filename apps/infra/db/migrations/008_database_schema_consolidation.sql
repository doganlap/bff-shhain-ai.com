-- Migration 008: Database Schema Consolidation
-- Consolidates tenants/organizations and adds missing tables
-- Adds status column to tenants and creates partner_collaborations table

BEGIN;

-- Add status column to tenants table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'tenants' AND column_name = 'status') THEN
        ALTER TABLE tenants ADD COLUMN status VARCHAR(20) DEFAULT 'active';
    END IF;
END $$;

-- Create partner_collaborations table if it doesn't exist
CREATE TABLE IF NOT EXISTS partner_collaborations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    partner_tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    collaboration_type VARCHAR(50) NOT NULL DEFAULT 'standard',
    status VARCHAR(20) DEFAULT 'active',
    permissions JSONB DEFAULT '{}',
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, partner_tenant_id)
);

-- Create indexes for partner_collaborations
CREATE INDEX IF NOT EXISTS idx_partner_collaborations_tenant_id
    ON partner_collaborations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_partner_collaborations_partner_tenant_id
    ON partner_collaborations(partner_tenant_id);
CREATE INDEX IF NOT EXISTS idx_partner_collaborations_status
    ON partner_collaborations(status);

-- Update existing tenants to have active status
UPDATE tenants SET status = 'active' WHERE status IS NULL;

-- Ensure all tenants have proper data
UPDATE tenants SET
    is_active = true,
    created_at = COALESCE(created_at, CURRENT_TIMESTAMP),
    updated_at = CURRENT_TIMESTAMP
WHERE is_active IS NULL OR created_at IS NULL;

-- Consolidate organizations data into tenants if organizations table exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'organizations') THEN

        -- Insert organizations data into tenants (avoiding duplicates)
        INSERT INTO tenants (
            tenant_code, name, display_name, industry,
            country, email, phone, address, is_active, status
        )
        SELECT
            COALESCE(o.code, UPPER(REPLACE(o.name, ' ', '_'))),
            o.name,
            COALESCE(o.display_name, o.name),
            o.industry,
            COALESCE(o.country, 'Saudi Arabia'),
            o.contact_email,
            o.contact_phone,
            o.address,
            COALESCE(o.is_active, true),
            'active'
        FROM organizations o
        WHERE NOT EXISTS (
            SELECT 1 FROM tenants t
            WHERE t.tenant_code = COALESCE(o.code, UPPER(REPLACE(o.name, ' ', '_')))
               OR t.name = o.name
        );

        -- Update users to reference tenants instead of organizations
        UPDATE users SET tenant_id = (
            SELECT t.id FROM tenants t
            JOIN organizations o ON (
                t.tenant_code = COALESCE(o.code, UPPER(REPLACE(o.name, ' ', '_')))
                OR t.name = o.name
            )
            WHERE o.id = users.organization_id
        ) WHERE organization_id IS NOT NULL AND tenant_id IS NULL;

        -- Update assessments to have tenant_id
        UPDATE assessments SET tenant_id = (
            SELECT u.tenant_id FROM users u WHERE u.id = assessments.created_by
        ) WHERE tenant_id IS NULL AND created_by IS NOT NULL;

        -- Update other tables with organization_id to use tenant_id
        -- Add similar updates for other tables as needed

    END IF;
END $$;

-- Ensure all users have tenant_id
UPDATE users SET tenant_id = (
    SELECT id FROM tenants WHERE tenant_code = 'DEFAULT' LIMIT 1
) WHERE tenant_id IS NULL AND EXISTS (
    SELECT 1 FROM tenants WHERE tenant_code = 'DEFAULT'
);

-- Create a default tenant if none exists
INSERT INTO tenants (
    tenant_code, name, display_name, industry, country,
    email, phone, is_active, status, created_at, updated_at
)
SELECT
    'DEFAULT', 'Default Organization', 'Default Organization', 'Technology',
    'Saudi Arabia', 'admin@default.com', '+966-XXX-XXXX',
    true, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM tenants WHERE tenant_code = 'DEFAULT');

-- Add constraints and indexes
CREATE INDEX IF NOT EXISTS idx_tenants_status ON tenants(status);
CREATE INDEX IF NOT EXISTS idx_tenants_active_status ON tenants(is_active, status);
CREATE INDEX IF NOT EXISTS idx_users_tenant_status ON users(tenant_id, is_active);

-- Update schema version
INSERT INTO schema_migrations (version, applied_at)
VALUES ('008_database_schema_consolidation', CURRENT_TIMESTAMP)
ON CONFLICT (version) DO NOTHING;

COMMIT;

-- Verification queries
SELECT 'Tenants with status' as check_name, COUNT(*) as count
FROM tenants WHERE status IS NOT NULL;

SELECT 'Users with tenant_id' as check_name, COUNT(*) as count
FROM users WHERE tenant_id IS NOT NULL;

SELECT 'Partner collaborations table' as check_name, COUNT(*) as count
FROM partner_collaborations;

SELECT 'Schema migration applied' as check_name, applied_at
FROM schema_migrations WHERE version = '008_database_schema_consolidation';
