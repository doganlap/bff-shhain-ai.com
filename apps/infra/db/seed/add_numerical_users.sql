-- ============================================================================
-- ADD NUMERICAL TEST ACCOUNTS FOR TRIAL/AUDIT
-- Creating test1, test2, test3, visitor1, visitor2, etc.
-- ============================================================================

-- ============================================================================
-- 1. NUMERICAL VISITOR ACCOUNTS (Read-Only Access)
-- ============================================================================

-- Visitor 1
INSERT INTO users (
    email, username, password_hash, first_name, last_name, 
    role, status
) VALUES (
    'visitor1@shahin-ai.com',
    'visitor1',
    '$2b$10$dummy.hash.for.demo.purposes.only',
    'Visitor',
    'One',
    'viewer',
    'active'
) ON CONFLICT (email) DO UPDATE SET
    role = 'viewer',
    status = 'active',
    updated_at = CURRENT_TIMESTAMP;

-- Visitor 2
INSERT INTO users (
    email, username, password_hash, first_name, last_name, 
    role, status
) VALUES (
    'visitor2@shahin-ai.com',
    'visitor2',
    '$2b$10$dummy.hash.for.demo.purposes.only',
    'Visitor',
    'Two',
    'viewer',
    'active'
) ON CONFLICT (email) DO UPDATE SET
    role = 'viewer',
    status = 'active',
    updated_at = CURRENT_TIMESTAMP;

-- Visitor 3
INSERT INTO users (
    email, username, password_hash, first_name, last_name, 
    role, status
) VALUES (
    'visitor3@shahin-ai.com',
    'visitor3',
    '$2b$10$dummy.hash.for.demo.purposes.only',
    'Visitor',
    'Three',
    'viewer',
    'active'
) ON CONFLICT (email) DO UPDATE SET
    role = 'viewer',
    status = 'active',
    updated_at = CURRENT_TIMESTAMP;

-- ============================================================================
-- 2. NUMERICAL TEST ACCOUNTS (Process Access)
-- ============================================================================

-- Test 1
INSERT INTO users (
    email, username, password_hash, first_name, last_name, 
    role, status
) VALUES (
    'test1@shahin-ai.com',
    'test1',
    '$2b$10$dummy.hash.for.demo.purposes.only',
    'Test',
    'One',
    'user',
    'active'
) ON CONFLICT (email) DO UPDATE SET
    role = 'user',
    status = 'active',
    updated_at = CURRENT_TIMESTAMP;

-- Test 2
INSERT INTO users (
    email, username, password_hash, first_name, last_name, 
    role, status
) VALUES (
    'test2@shahin-ai.com',
    'test2',
    '$2b$10$dummy.hash.for.demo.purposes.only',
    'Test',
    'Two',
    'user',
    'active'
) ON CONFLICT (email) DO UPDATE SET
    role = 'user',
    status = 'active',
    updated_at = CURRENT_TIMESTAMP;

-- Test 3
INSERT INTO users (
    email, username, password_hash, first_name, last_name, 
    role, status
) VALUES (
    'test3@shahin-ai.com',
    'test3',
    '$2b$10$dummy.hash.for.demo.purposes.only',
    'Test',
    'Three',
    'user',
    'active'
) ON CONFLICT (email) DO UPDATE SET
    role = 'user',
    status = 'active',
    updated_at = CURRENT_TIMESTAMP;

-- ============================================================================
-- 3. AUDIT ACCOUNTS (Special Audit Access)
-- ============================================================================

-- Audit 1
INSERT INTO users (
    email, username, password_hash, first_name, last_name, 
    role, status
) VALUES (
    'audit1@shahin-ai.com',
    'audit1',
    '$2b$10$dummy.hash.for.demo.purposes.only',
    'Audit',
    'One',
    'auditor',
    'active'
) ON CONFLICT (email) DO UPDATE SET
    role = 'auditor',
    status = 'active',
    updated_at = CURRENT_TIMESTAMP;

-- Audit 2
INSERT INTO users (
    email, username, password_hash, first_name, last_name, 
    role, status
) VALUES (
    'audit2@shahin-ai.com',
    'audit2',
    '$2b$10$dummy.hash.for.demo.purposes.only',
    'Audit',
    'Two',
    'auditor',
    'active'
) ON CONFLICT (email) DO UPDATE SET
    role = 'auditor',
    status = 'active',
    updated_at = CURRENT_TIMESTAMP;

-- ============================================================================
-- 4. TRIAL ACCOUNTS (Limited Time Access)
-- ============================================================================

-- Trial 1
INSERT INTO users (
    email, username, password_hash, first_name, last_name, 
    role, status
) VALUES (
    'trial1@shahin-ai.com',
    'trial1',
    '$2b$10$dummy.hash.for.demo.purposes.only',
    'Trial',
    'One',
    'guest',
    'active'
) ON CONFLICT (email) DO UPDATE SET
    role = 'guest',
    status = 'active',
    updated_at = CURRENT_TIMESTAMP;

-- Trial 2
INSERT INTO users (
    email, username, password_hash, first_name, last_name, 
    role, status
) VALUES (
    'trial2@shahin-ai.com',
    'trial2',
    '$2b$10$dummy.hash.for.demo.purposes.only',
    'Trial',
    'Two',
    'guest',
    'active'
) ON CONFLICT (email) DO UPDATE SET
    role = 'guest',
    status = 'active',
    updated_at = CURRENT_TIMESTAMP;

-- Trial 3
INSERT INTO users (
    email, username, password_hash, first_name, last_name, 
    role, status
) VALUES (
    'trial3@shahin-ai.com',
    'trial3',
    '$2b$10$dummy.hash.for.demo.purposes.only',
    'Trial',
    'Three',
    'guest',
    'active'
) ON CONFLICT (email) DO UPDATE SET
    role = 'guest',
    status = 'active',
    updated_at = CURRENT_TIMESTAMP;

-- ============================================================================
-- 5. ASSIGN ROLES TO NUMERICAL USERS
-- ============================================================================

-- Assign visitor roles
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u, roles r
WHERE u.email IN ('visitor1@shahin-ai.com', 'visitor2@shahin-ai.com', 'visitor3@shahin-ai.com')
  AND r.name = 'visitor'
ON CONFLICT (user_id, role_id) DO NOTHING;

-- Assign test user roles
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u, roles r
WHERE u.email IN ('test1@shahin-ai.com', 'test2@shahin-ai.com', 'test3@shahin-ai.com')
  AND r.name = 'test_user'
ON CONFLICT (user_id, role_id) DO NOTHING;

-- ============================================================================
-- 6. VERIFICATION - SHOW ALL NUMERICAL ACCOUNTS
-- ============================================================================

-- Show all numerical accounts
SELECT 
    u.email,
    u.username,
    u.first_name,
    u.last_name,
    u.role as system_role,
    u.status,
    'NUMERICAL ACCOUNT' as account_type,
    u.created_at
FROM users u
WHERE u.email LIKE '%1@shahin-ai.com' 
   OR u.email LIKE '%2@shahin-ai.com' 
   OR u.email LIKE '%3@shahin-ai.com'
ORDER BY u.email;

COMMIT;
