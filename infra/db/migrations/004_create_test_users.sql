-- Migration 004: Create Test Users for Multi-Tenant System
-- Creates admin and test users with proper tenant assignments

-- First, ensure we have a default tenant
INSERT INTO tenants (tenant_code, name, display_name, sector, email) 
VALUES ('DEFAULT', 'Default Organization', 'Default Org', 'General', 'admin@example.com')
ON CONFLICT (tenant_code) DO NOTHING;

-- Create admin user with proper password hash for 'password123'
INSERT INTO users (
    id,
    email, 
    username, 
    password_hash, 
    first_name, 
    last_name, 
    role, 
    tenant_id,
    permissions,
    status
) VALUES (
    uuid_generate_v4(),
    'admin@example.com',
    'admin',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3bp.Txjyvq', -- 'password123'
    'System',
    'Administrator',
    'super_admin',
    (SELECT id FROM tenants WHERE tenant_code = 'DEFAULT' LIMIT 1),
    '["*"]',
    'active'
) ON CONFLICT (email) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    tenant_id = EXCLUDED.tenant_id,
    role = EXCLUDED.role,
    permissions = EXCLUDED.permissions,
    status = EXCLUDED.status;

-- Assign super_admin role to admin user
INSERT INTO user_roles (user_id, role_id, assigned_by, is_active)
SELECT 
    u.id,
    r.id,
    u.id,
    true
FROM users u
CROSS JOIN roles r
WHERE u.email = 'admin@example.com' 
AND r.name = 'super_admin'
ON CONFLICT (user_id, role_id) DO UPDATE SET
    is_active = true,
    assigned_at = CURRENT_TIMESTAMP;

-- Create a second tenant for testing
INSERT INTO tenants (
    tenant_code, 
    name, 
    display_name, 
    industry, 
    sector, 
    country, 
    email, 
    phone, 
    subscription_tier, 
    max_users
) VALUES (
    'ACME',
    'ACME Corporation',
    'ACME Corp',
    'Technology',
    'Software',
    'Saudi Arabia',
    'admin@acme.com',
    '+966-11-123-4567',
    'premium',
    50
) ON CONFLICT (tenant_code) DO NOTHING;

-- Create tenant admin for ACME
INSERT INTO users (
    id,
    email, 
    username, 
    password_hash, 
    first_name, 
    last_name, 
    role, 
    tenant_id,
    permissions,
    status
) VALUES (
    uuid_generate_v4(),
    'admin@acme.com',
    'acme_admin',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3bp.Txjyvq', -- 'password123'
    'ACME',
    'Administrator',
    'tenant_admin',
    (SELECT id FROM tenants WHERE tenant_code = 'ACME' LIMIT 1),
    '["tenant:*"]',
    'active'
) ON CONFLICT (email) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    tenant_id = EXCLUDED.tenant_id,
    role = EXCLUDED.role,
    permissions = EXCLUDED.permissions,
    status = EXCLUDED.status;

-- Assign tenant_admin role to ACME admin
INSERT INTO user_roles (user_id, role_id, assigned_by, is_active)
SELECT 
    u.id,
    r.id,
    u.id,
    true
FROM users u
CROSS JOIN roles r
WHERE u.email = 'admin@acme.com' 
AND r.name = 'tenant_admin'
ON CONFLICT (user_id, role_id) DO UPDATE SET
    is_active = true,
    assigned_at = CURRENT_TIMESTAMP;

-- Create regular user for ACME
INSERT INTO users (
    id,
    email, 
    username, 
    password_hash, 
    first_name, 
    last_name, 
    role, 
    tenant_id,
    permissions,
    status
) VALUES (
    uuid_generate_v4(),
    'user@acme.com',
    'acme_user',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3bp.Txjyvq', -- 'password123'
    'John',
    'Doe',
    'user',
    (SELECT id FROM tenants WHERE tenant_code = 'ACME' LIMIT 1),
    '["assessments:read", "assessments:create", "reports:read"]',
    'active'
) ON CONFLICT (email) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    tenant_id = EXCLUDED.tenant_id,
    role = EXCLUDED.role,
    permissions = EXCLUDED.permissions,
    status = EXCLUDED.status;

-- Assign user role to ACME user
INSERT INTO user_roles (user_id, role_id, assigned_by, is_active)
SELECT 
    u.id,
    r.id,
    (SELECT id FROM users WHERE email = 'admin@acme.com' LIMIT 1),
    true
FROM users u
CROSS JOIN roles r
WHERE u.email = 'user@acme.com' 
AND r.name = 'user'
ON CONFLICT (user_id, role_id) DO UPDATE SET
    is_active = true,
    assigned_at = CURRENT_TIMESTAMP;
