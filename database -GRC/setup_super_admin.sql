-- ============================================
-- GRC Master - Super Admin Setup Script
-- ============================================
-- This script creates the super admin user and global admin tenant
-- Run this script on your PostgreSQL database

-- Step 1: Create Global Admin Tenant
INSERT INTO tenants (
    id,
    name,
    slug,
    description,
    status,
    settings,
    created_at,
    updated_at
) VALUES (
    '00000000-0000-0000-0000-000000000001'::uuid,
    'Global Admin',
    'global-admin',
    'Global administrative tenant with full system access',
    'active',
    jsonb_build_object(
        'is_global', true,
        'max_users', 999999,
        'features', jsonb_build_array('all'),
        'permissions', jsonb_build_array('super_admin')
    ),
    NOW(),
    NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Step 2: Create Super Admin User
-- Password: Admin@2024!GRC
-- Note: You should hash this with bcrypt before inserting
INSERT INTO users (
    id,
    email,
    username,
    password_hash,
    first_name,
    last_name,
    role,
    status,
    email_verified,
    phone_verified,
    mfa_enabled,
    created_at,
    updated_at,
    last_login_at
) VALUES (
    gen_random_uuid(),
    'admin@grc-master.com',
    'superadmin',
    -- This is a placeholder - replace with actual bcrypt hash of: Admin@2024!GRC
    '$2b$10$XYZ...YourActualBcryptHashHere',
    'Super',
    'Admin',
    'super_admin',
    'active',
    true,
    false,
    false,
    NOW(),
    NOW(),
    NULL
)
ON CONFLICT (email) DO UPDATE SET
    username = EXCLUDED.username,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    role = EXCLUDED.role,
    status = EXCLUDED.status,
    updated_at = NOW();

-- Step 3: Link Super Admin to Global Tenant
INSERT INTO user_tenants (
    id,
    user_id,
    tenant_id,
    role,
    permissions,
    status,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    (SELECT id FROM users WHERE email = 'admin@grc-master.com'),
    '00000000-0000-0000-0000-000000000001'::uuid,
    'owner',
    jsonb_build_array(
        'users:*',
        'tenants:*',
        'organizations:*',
        'frameworks:*',
        'controls:*',
        'assessments:*',
        'reports:*',
        'settings:*',
        'audit:*',
        'system:*'
    ),
    'active',
    NOW(),
    NOW()
)
ON CONFLICT DO NOTHING;

-- Step 4: Create Alternative Admin User (Shahin AI)
INSERT INTO users (
    id,
    email,
    username,
    password_hash,
    first_name,
    last_name,
    role,
    status,
    email_verified,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'admin@shahin.ai',
    'admin',
    -- Password: Shahin@2024!Admin
    '$2b$10$XYZ...YourActualBcryptHashHere',
    'Shahin',
    'Admin',
    'admin',
    'active',
    true,
    NOW(),
    NOW()
)
ON CONFLICT (email) DO NOTHING;

-- Step 5: Create Demo Organization Admin
INSERT INTO users (
    id,
    email,
    username,
    password_hash,
    first_name,
    last_name,
    role,
    status,
    email_verified,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'demo@acme.com',
    'demoadmin',
    -- Password: Demo@2024!ACME
    '$2b$10$XYZ...YourActualBcryptHashHere',
    'Demo',
    'Admin',
    'org_admin',
    'active',
    true,
    NOW(),
    NOW()
)
ON CONFLICT (email) DO NOTHING;

-- Step 6: Link Demo Admin to ACME Tenant
INSERT INTO user_tenants (
    id,
    user_id,
    tenant_id,
    role,
    status,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    (SELECT id FROM users WHERE email = 'demo@acme.com'),
    '42c676e2-8d5e-4b1d-ae80-3986b82dd5c5'::uuid, -- ACME Corporation tenant
    'admin',
    'active',
    NOW(),
    NOW()
)
ON CONFLICT DO NOTHING;

-- Step 7: Create Test User for Development
INSERT INTO users (
    id,
    email,
    username,
    password_hash,
    first_name,
    last_name,
    role,
    status,
    email_verified,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'test@test.com',
    'testuser',
    -- Password: Test@2024
    '$2b$10$XYZ...YourActualBcryptHashHere',
    'Test',
    'User',
    'user',
    'active',
    true,
    NOW(),
    NOW()
)
ON CONFLICT (email) DO NOTHING;

-- ============================================
-- Verification Queries
-- ============================================

-- Check if super admin was created
SELECT 
    u.id,
    u.email,
    u.username,
    u.first_name,
    u.last_name,
    u.role,
    u.status,
    u.email_verified,
    t.name as tenant_name,
    ut.role as tenant_role
FROM users u
LEFT JOIN user_tenants ut ON u.id = ut.user_id
LEFT JOIN tenants t ON ut.tenant_id = t.id
WHERE u.email IN ('admin@grc-master.com', 'admin@shahin.ai', 'demo@acme.com', 'test@test.com')
ORDER BY u.created_at;

-- Check Global Admin Tenant
SELECT * FROM tenants WHERE slug = 'global-admin';

-- Count all users
SELECT 
    role,
    status,
    COUNT(*) as count
FROM users
GROUP BY role, status
ORDER BY role, status;

-- ============================================
-- Password Hashing Instructions
-- ============================================
-- 
-- To generate bcrypt hashes for the passwords, use one of these methods:
--
-- Method 1: Using Node.js (recommended)
-- ```javascript
-- const bcrypt = require('bcrypt');
-- const password = 'Admin@2024!GRC';
-- const hash = bcrypt.hashSync(password, 10);
-- console.log(hash);
-- ```
--
-- Method 2: Using Python
-- ```python
-- import bcrypt
-- password = b'Admin@2024!GRC'
-- hash = bcrypt.hashpw(password, bcrypt.gensalt())
-- print(hash.decode('utf-8'))
-- ```
--
-- Method 3: Online Tool (NOT recommended for production)
-- Visit: https://bcrypt-generator.com/
-- Enter password and use cost factor 10
--
-- Replace the placeholder hashes above with the actual bcrypt hashes
-- ============================================

-- ============================================
-- Post-Setup Actions
-- ============================================
-- 
-- 1. Update all password_hash fields with actual bcrypt hashes
-- 2. Test login with each admin account
-- 3. Enable MFA for super admin account
-- 4. Review and adjust permissions as needed
-- 5. Document any custom roles or permissions
-- 6. Set up audit logging for admin actions
-- 7. Configure session timeout policies
-- 8. Set up IP whitelisting if required
-- 
-- ============================================
