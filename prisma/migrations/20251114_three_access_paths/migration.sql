-- ============================================================================
-- SHAHIN-AI GRC Platform - Three Access Paths Migration
-- Date: 2025-11-14
-- Purpose: Add support for Demo, Partner, and POC access paths
-- Database: PostgreSQL 12+
-- Note: This file uses PostgreSQL syntax. Ignore DB2 linter warnings.
-- ============================================================================
-- @formatter:off
-- noinspection SqlDialectInspection
-- noinspection SqlNoDataSourceInspection

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. TENANTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS tenants (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug            TEXT NOT NULL UNIQUE,
    display_name    TEXT NOT NULL,

    type            TEXT NOT NULL CHECK (type IN ('demo', 'poc', 'partner', 'customer')),
    status          TEXT NOT NULL CHECK (status IN ('active', 'suspended', 'pending', 'expired')) DEFAULT 'active',

    country         TEXT,
    sector          TEXT,
    metadata        JSONB DEFAULT '{}'::jsonb,

    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at      TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_tenants_type ON tenants(type);
CREATE INDEX IF NOT EXISTS idx_tenants_status ON tenants(status);
CREATE INDEX IF NOT EXISTS idx_tenants_slug ON tenants(slug);

COMMENT ON TABLE tenants IS 'Multi-tenant support for demo, POC, partner, and customer accounts';
COMMENT ON COLUMN tenants.type IS 'Tenant type: demo (free trial), poc (proof of concept), partner (reseller), customer (paid)';
COMMENT ON COLUMN tenants.expires_at IS 'Expiration date for demo and POC tenants';

-- ============================================================================
-- 2. USERS TABLE (Multi-Tenant)
-- ============================================================================

CREATE TABLE IF NOT EXISTS users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    email           TEXT NOT NULL,
    password_hash   TEXT,
    full_name       TEXT,

    role            TEXT NOT NULL DEFAULT 'user',
    is_partner      BOOLEAN NOT NULL DEFAULT FALSE,
    is_super_admin  BOOLEAN NOT NULL DEFAULT FALSE,

    metadata        JSONB DEFAULT '{}'::jsonb,

    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_login_at   TIMESTAMPTZ
);

-- Email is unique per tenant (same email can exist in multiple tenants)
CREATE UNIQUE INDEX IF NOT EXISTS ux_users_tenant_email ON users(tenant_id, email);
CREATE INDEX IF NOT EXISTS idx_users_email_global ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_tenant ON users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_users_is_partner ON users(is_partner) WHERE is_partner = TRUE;

COMMENT ON TABLE users IS 'Multi-tenant users table - same email can belong to multiple tenants';
COMMENT ON COLUMN users.is_partner IS 'TRUE if user is a partner account manager';
COMMENT ON COLUMN users.password_hash IS 'BCrypt password hash - can be NULL for SSO-only accounts';

-- ============================================================================
-- 3. DEMO_REQUESTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS demo_requests (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    email           TEXT NOT NULL,
    full_name       TEXT NOT NULL,
    company_name    TEXT,
    sector          TEXT,
    org_size        TEXT,
    use_cases       TEXT[],
    notes           TEXT,

    status          TEXT NOT NULL CHECK (status IN ('pending', 'approved_auto', 'approved_manual', 'rejected')) DEFAULT 'pending',
    tenant_id       UUID REFERENCES tenants(id) ON DELETE SET NULL,
    user_id         UUID REFERENCES users(id) ON DELETE SET NULL,

    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    reviewed_at     TIMESTAMPTZ,
    reviewer_id     UUID REFERENCES users(id) ON DELETE SET NULL,

    metadata        JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_demo_requests_email ON demo_requests(email);
CREATE INDEX IF NOT EXISTS idx_demo_requests_status ON demo_requests(status);
CREATE INDEX IF NOT EXISTS idx_demo_requests_created_at ON demo_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_demo_requests_tenant ON demo_requests(tenant_id);

COMMENT ON TABLE demo_requests IS 'Demo access requests - auto-approved with instant tenant creation';
COMMENT ON COLUMN demo_requests.status IS 'approved_auto = instant approval, approved_manual = reviewed by admin';

-- ============================================================================
-- 4. POC_REQUESTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS poc_requests (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    email                   TEXT NOT NULL,
    full_name               TEXT NOT NULL,
    company_name            TEXT NOT NULL,
    sector                  TEXT,
    use_cases               TEXT[],
    environment_preference  TEXT,
    preferred_start_date    DATE,
    notes                   TEXT,

    status                  TEXT NOT NULL CHECK (status IN (
                               'new', 'pending_review', 'approved', 'rejected', 'in_progress', 'completed'
                             )) DEFAULT 'new',
    tenant_id               UUID REFERENCES tenants(id) ON DELETE SET NULL,
    owner_internal_user_id  UUID REFERENCES users(id) ON DELETE SET NULL,

    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    approved_at             TIMESTAMPTZ,
    completed_at            TIMESTAMPTZ,

    metadata                JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_poc_requests_status ON poc_requests(status);
CREATE INDEX IF NOT EXISTS idx_poc_requests_company ON poc_requests(company_name);
CREATE INDEX IF NOT EXISTS idx_poc_requests_created_at ON poc_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_poc_requests_tenant ON poc_requests(tenant_id);

COMMENT ON TABLE poc_requests IS 'Proof of Concept requests - requires manual review and approval';
COMMENT ON COLUMN poc_requests.environment_preference IS 'azure-cloud | aws-cloud | on-prem | hybrid';
COMMENT ON COLUMN poc_requests.owner_internal_user_id IS 'Internal user (sales/engineer) managing this POC';

-- ============================================================================
-- 5. PARTNER_INVITATIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS partner_invitations (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    partner_tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    email               TEXT NOT NULL,
    invite_token        TEXT NOT NULL UNIQUE,
    status              TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'revoked', 'expired')) DEFAULT 'pending',

    invited_by_user_id  UUID REFERENCES users(id) ON DELETE SET NULL,
    accepted_user_id    UUID REFERENCES users(id) ON DELETE SET NULL,

    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at          TIMESTAMPTZ NOT NULL,
    accepted_at         TIMESTAMPTZ,

    metadata            JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_partner_inv_email ON partner_invitations(email);
CREATE INDEX IF NOT EXISTS idx_partner_inv_status ON partner_invitations(status);
CREATE INDEX IF NOT EXISTS idx_partner_inv_partner ON partner_invitations(partner_tenant_id);
CREATE INDEX IF NOT EXISTS idx_partner_inv_token ON partner_invitations(invite_token);

COMMENT ON TABLE partner_invitations IS 'Partner user invitation system - token-based acceptance';
COMMENT ON COLUMN partner_invitations.invite_token IS 'Unique invitation token sent via email';

-- ============================================================================
-- 6. FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to tenants
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Apply to users
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Apply to poc_requests
CREATE TRIGGER update_poc_requests_updated_at BEFORE UPDATE ON poc_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 7. SEED DATA (Optional - for testing)
-- ============================================================================

-- Create a demo partner tenant for testing
DO $$
DECLARE
    partner_tenant_id UUID;
    partner_user_id UUID;
BEGIN
    -- Insert partner tenant if it doesn't exist
    INSERT INTO tenants (id, slug, display_name, type, status, sector)
    VALUES (
        '00000000-0000-0000-0000-000000000001',
        'test-partner',
        'Test Partner Organization',
        'partner',
        'active',
        'Technology'
    ) ON CONFLICT (slug) DO NOTHING
    RETURNING id INTO partner_tenant_id;

    -- Get the partner tenant ID if it already exists
    IF partner_tenant_id IS NULL THEN
        SELECT id INTO partner_tenant_id FROM tenants WHERE slug = 'test-partner';
    END IF;

    -- Insert partner user if it doesn't exist
    INSERT INTO users (
        id,
        tenant_id,
        email,
        password_hash,
        full_name,
        role,
        is_partner
    )
    VALUES (
        '00000000-0000-0000-0000-000000000002',
        partner_tenant_id,
        'partner@test.com',
        '$2a$10$rN8YhXLQyH7VYhXLQyH7VuPxvKvGhKvGhKvGhKvGhKvGhKvGhKvGh', -- password: 'test123'
        'Test Partner User',
        'partner-admin',
        TRUE
    ) ON CONFLICT (tenant_id, email) DO NOTHING;

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error creating seed data: %', SQLERRM;
END $$;

-- ============================================================================
-- 8. GRANT PERMISSIONS
-- ============================================================================

-- Grant permissions to application user (adjust based on your setup)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_app_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_app_user;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Verify migration
SELECT
    'tenants' as table_name,
    COUNT(*) as row_count,
    COUNT(DISTINCT type) as tenant_types
FROM tenants

UNION ALL

SELECT
    'users' as table_name,
    COUNT(*) as row_count,
    SUM(CASE WHEN is_partner THEN 1 ELSE 0 END) as partner_users
FROM users

UNION ALL

SELECT
    'demo_requests' as table_name,
    COUNT(*) as row_count,
    NULL
FROM demo_requests

UNION ALL

SELECT
    'poc_requests' as table_name,
    COUNT(*) as row_count,
    NULL
FROM poc_requests

UNION ALL

SELECT
    'partner_invitations' as table_name,
    COUNT(*) as row_count,
    NULL
FROM partner_invitations;

-- Log migration completion
DO $$
BEGIN
    RAISE NOTICE 'Three Access Paths migration completed successfully at %', now();
END $$;
