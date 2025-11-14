-- Migration 005: Add Microsoft Authentication Support for Tenants
-- Enables tenant-level Microsoft SSO configuration

-- Add Microsoft authentication fields to tenants table
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS microsoft_auth_enabled BOOLEAN DEFAULT false;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS microsoft_tenant_id VARCHAR(255);
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS microsoft_client_id VARCHAR(255);
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS microsoft_client_secret TEXT;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS microsoft_domain VARCHAR(255);
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS microsoft_auto_provision BOOLEAN DEFAULT true;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS microsoft_default_role VARCHAR(50) DEFAULT 'user';

-- Add Microsoft authentication fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS microsoft_id VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS microsoft_email VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_provider VARCHAR(50) DEFAULT 'local';
ALTER TABLE users ADD COLUMN IF NOT EXISTS external_id VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_microsoft_sync TIMESTAMP;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tenants_microsoft_auth ON tenants(microsoft_auth_enabled);
CREATE INDEX IF NOT EXISTS idx_tenants_microsoft_domain ON tenants(microsoft_domain);
CREATE INDEX IF NOT EXISTS idx_users_microsoft_id ON users(microsoft_id);
CREATE INDEX IF NOT EXISTS idx_users_auth_provider ON users(auth_provider);
CREATE INDEX IF NOT EXISTS idx_users_external_id ON users(external_id);

-- Add constraints
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_auth_provider_check;
ALTER TABLE users ADD CONSTRAINT users_auth_provider_check 
    CHECK (auth_provider IN ('local', 'microsoft', 'google', 'saml'));

-- Create table for storing Microsoft auth tokens (for refresh tokens, etc.)
CREATE TABLE IF NOT EXISTS user_auth_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL,
    access_token TEXT,
    refresh_token TEXT,
    token_type VARCHAR(50) DEFAULT 'Bearer',
    expires_at TIMESTAMP,
    scope TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, provider)
);

-- Add trigger for updated_at
DROP TRIGGER IF EXISTS update_user_auth_tokens_updated_at ON user_auth_tokens;
CREATE TRIGGER update_user_auth_tokens_updated_at 
    BEFORE UPDATE ON user_auth_tokens 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for auth tokens
CREATE INDEX IF NOT EXISTS idx_user_auth_tokens_user_id ON user_auth_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_user_auth_tokens_provider ON user_auth_tokens(provider);
CREATE INDEX IF NOT EXISTS idx_user_auth_tokens_expires_at ON user_auth_tokens(expires_at);

-- Create function to check if tenant requires Microsoft auth
CREATE OR REPLACE FUNCTION tenant_requires_microsoft_auth(p_tenant_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    requires_microsoft BOOLEAN := FALSE;
BEGIN
    SELECT microsoft_auth_enabled INTO requires_microsoft
    FROM tenants 
    WHERE id = p_tenant_id;
    
    RETURN COALESCE(requires_microsoft, FALSE);
END;
$$ LANGUAGE plpgsql;

-- Create function to get tenant Microsoft config
CREATE OR REPLACE FUNCTION get_tenant_microsoft_config(p_tenant_id UUID)
RETURNS TABLE(
    tenant_id UUID,
    microsoft_tenant_id VARCHAR(255),
    microsoft_client_id VARCHAR(255),
    microsoft_domain VARCHAR(255),
    microsoft_auto_provision BOOLEAN,
    microsoft_default_role VARCHAR(50)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.id,
        t.microsoft_tenant_id,
        t.microsoft_client_id,
        t.microsoft_domain,
        t.microsoft_auto_provision,
        t.microsoft_default_role
    FROM tenants t
    WHERE t.id = p_tenant_id 
    AND t.microsoft_auth_enabled = true;
END;
$$ LANGUAGE plpgsql;

-- Update existing DEFAULT tenant to support Microsoft auth (optional)
UPDATE tenants 
SET 
    microsoft_auth_enabled = false,
    microsoft_auto_provision = true,
    microsoft_default_role = 'user'
WHERE tenant_code = 'DEFAULT';
