-- ============================================================================
-- ADD SPECIFIC USERS TO DATABASE
-- Adding CFO, Visitor, and Test users with appropriate roles
-- ============================================================================

-- First, let's create a users table if it doesn't exist
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100),
    password_hash VARCHAR(255),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(50) DEFAULT 'user',
    tenant_id UUID,
    status VARCHAR(20) DEFAULT 'active',
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create roles table if it doesn't exist
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    display_name VARCHAR(255),
    description TEXT,
    permissions JSONB DEFAULT '[]'::jsonb,
    tenant_id UUID,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create user_roles mapping table
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    assigned_by UUID,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    UNIQUE(user_id, role_id)
);

-- ============================================================================
-- 1. ADD CFO USER (Full Access - Like You)
-- ============================================================================

-- Insert CFO user
INSERT INTO users (
    email, username, password_hash, first_name, last_name, 
    role, status
) VALUES (
    'CFO@shahin-ai.com',
    'CFO',
    '$2b$10$dummy.hash.for.demo.purposes.only', -- Demo hash
    'Chief Financial',
    'Officer',
    'super_admin',
    'active'
) ON CONFLICT (email) DO UPDATE SET
    role = 'super_admin',
    status = 'active',
    updated_at = CURRENT_TIMESTAMP;

-- ============================================================================
-- 2. ADD VISITOR USER (View All Access)
-- ============================================================================

-- Insert Visitor user
INSERT INTO users (
    email, username, password_hash, first_name, last_name, 
    role, status
) VALUES (
    'Visit@Shahin-ai.com',
    'Visitor',
    '$2b$10$dummy.hash.for.demo.purposes.only', -- Demo hash
    'Visitor',
    'User',
    'viewer',
    'active'
) ON CONFLICT (email) DO UPDATE SET
    role = 'viewer',
    status = 'active',
    updated_at = CURRENT_TIMESTAMP;

-- ============================================================================
-- 3. ADD TEST USER (Limited Process Access)
-- ============================================================================

-- Insert Test user
INSERT INTO users (
    email, username, password_hash, first_name, last_name, 
    role, status
) VALUES (
    'Test@shahin-ai.com',
    'Test',
    '$2b$10$dummy.hash.for.demo.purposes.only', -- Demo hash
    'Test',
    'User',
    'user',
    'active'
) ON CONFLICT (email) DO UPDATE SET
    role = 'user',
    status = 'active',
    updated_at = CURRENT_TIMESTAMP;

-- ============================================================================
-- CREATE CUSTOM ROLES IF NEEDED
-- ============================================================================

-- CFO Role (Full Access)
INSERT INTO roles (
    name, display_name, description, permissions
) VALUES (
    'cfo',
    'Chief Financial Officer',
    'Full financial and administrative access',
    '["*"]'::jsonb
) ON CONFLICT (name) DO NOTHING;

-- Visitor Role (View All)
INSERT INTO roles (
    name, display_name, description, permissions
) VALUES (
    'visitor',
    'Visitor',
    'Read-only access to all modules',
    '[
        "assessments:read", "frameworks:read", "controls:read",
        "risks:read", "compliance:read", "reports:read",
        "organizations:read", "users:read", "licenses:read",
        "renewals:read", "usage:read", "dashboard:read"
    ]'::jsonb
) ON CONFLICT (name) DO NOTHING;

-- Test User Role (Process Only)
INSERT INTO roles (
    name, display_name, description, permissions
) VALUES (
    'test_user',
    'Test User',
    'Limited access for testing processes',
    '[
        "assessments:create", "assessments:read", "assessments:update",
        "evidence:create", "evidence:read", "reports:read",
        "dashboard:read"
    ]'::jsonb
) ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- ASSIGN ROLES TO USERS
-- ============================================================================

-- Assign CFO role
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u, roles r
WHERE u.email = 'CFO@shahin-ai.com' 
  AND r.name = 'cfo'
ON CONFLICT (user_id, role_id) DO NOTHING;

-- Assign Visitor role
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u, roles r
WHERE u.email = 'Visit@Shahin-ai.com' 
  AND r.name = 'visitor'
ON CONFLICT (user_id, role_id) DO NOTHING;

-- Assign Test User role
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u, roles r
WHERE u.email = 'Test@shahin-ai.com' 
  AND r.name = 'test_user'
ON CONFLICT (user_id, role_id) DO NOTHING;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Show all users with their roles
SELECT 
    u.email,
    u.username,
    u.first_name,
    u.last_name,
    u.role as system_role,
    r.display_name as custom_role,
    u.status,
    u.created_at
FROM users u
LEFT JOIN user_roles ur ON u.id = ur.user_id AND ur.is_active = true
LEFT JOIN roles r ON ur.role_id = r.id
WHERE u.email IN ('CFO@shahin-ai.com', 'Visit@Shahin-ai.com', 'Test@shahin-ai.com')
ORDER BY u.created_at;

-- Show role permissions
SELECT 
    r.name,
    r.display_name,
    r.permissions
FROM roles r
WHERE r.name IN ('cfo', 'visitor', 'test_user');

COMMIT;
