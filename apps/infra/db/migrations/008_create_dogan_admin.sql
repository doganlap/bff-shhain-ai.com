-- Migration 008: Create DoganConsult Super Admin

-- Create DoganConsult tenant if it doesn't exist
INSERT INTO tenants (tenant_code, name, display_name, sector, email) 
VALUES ('DOGAN', 'DoganConsult', 'DoganConsult', 'Consulting', 'ahmet@doganconsult.com')
ON CONFLICT (tenant_code) DO NOTHING;

-- Create ahmet@doganconsult.com user with super_admin role
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
    'ahmet@doganconsult.com',
    'ahmet',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3bp.Txjyvq', -- 'password123'
    'Ahmet',
    'Dogan',
    'super_admin',
    (SELECT id FROM tenants WHERE tenant_code = 'DOGAN' LIMIT 1),
    '["*"]',
    'active'
) ON CONFLICT (email) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    tenant_id = EXCLUDED.tenant_id,
    role = EXCLUDED.role,
    permissions = EXCLUDED.permissions,
    status = EXCLUDED.status;

-- Assign super_admin role to ahmet@doganconsult.com user
INSERT INTO user_roles (user_id, role_id, assigned_by, is_active)
SELECT 
    u.id,
    r.id,
    u.id,
    true
FROM users u
CROSS JOIN roles r
WHERE u.email = 'ahmet@doganconsult.com' 
AND r.name = 'super_admin'
ON CONFLICT (user_id, role_id) DO UPDATE SET
    is_active = true,
    assigned_at = CURRENT_TIMESTAMP;