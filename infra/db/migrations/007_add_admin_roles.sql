-- Migration: Add Supervisor Admin and Platform Admin roles
-- File: infra/db/migrations/007_add_admin_roles.sql
-- Date: November 10, 2025

BEGIN;

-- ==========================================
-- 1. CREATE SUPERVISOR ADMIN ROLE
-- ==========================================

INSERT INTO roles (
  id,
  name,
  display_name,
  description,
  permissions,
  level,
  hierarchy_level,
  is_system_role,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'supervisor_admin',
  'Supervisor Administrator',
  'Departmental and regional supervision with elevated administrative privileges',
  '[
    "org:read",
    "org:settings:read",
    "department:admin",
    "department:create",
    "department:edit",
    "department:delete",
    "user:manage:department",
    "user:create:department",
    "user:edit:department",
    "user:delete:department",
    "assessment:supervise",
    "assessment:approve:department",
    "assessment:delete:department",
    "assessment:export:department",
    "document:manage:department",
    "document:approve:department",
    "workflow:manage:department",
    "workflow:approve:department",
    "audit:read:department",
    "report:generate:department",
    "report:export:department",
    "partner:view:department",
    "notification:send:department",
    "compliance:monitor:department"
  ]'::jsonb,
  'department',
  300,  -- Between org_admin (400) and manager (200)
  true,
  NOW(),
  NOW()
);

-- ==========================================
-- 2. CREATE PLATFORM ADMIN ROLE
-- ==========================================

INSERT INTO roles (
  id,
  name,
  display_name,
  description,
  permissions,
  level,
  hierarchy_level,
  is_system_role,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'platform_admin',
  'Platform Administrator',
  'System-level platform operations, monitoring, and maintenance',
  '[
    "system:monitor",
    "system:health:read",
    "system:metrics:read",
    "system:logs:read",
    "system:config:read",
    "system:config:write",
    "system:maintenance",
    "system:backup",
    "system:restore",
    "tenant:list",
    "tenant:view:all",
    "tenant:stats",
    "tenant:health",
    "performance:monitor",
    "performance:analyze",
    "performance:optimize",
    "security:monitor",
    "security:events:read",
    "security:incidents:manage",
    "audit:system:read",
    "audit:system:export",
    "service:monitor",
    "service:restart",
    "service:scale",
    "database:monitor",
    "database:maintain",
    "infrastructure:monitor",
    "infrastructure:scale"
  ]'::jsonb,
  'platform',
  450,  -- Higher than org_admin but lower than super_admin
  true,
  NOW(),
  NOW()
);

-- ==========================================
-- 3. UPDATE ROLE HIERARCHY CONSTRAINTS
-- ==========================================

-- Update the role check constraint to include new roles
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check
  CHECK (role IN (
    'super_admin',
    'platform_admin',
    'org_admin',
    'supervisor_admin',
    'admin',
    'manager',
    'user',
    'assessor',
    'auditor',
    'partner_admin',
    'partner_user'
  ));

-- ==========================================
-- 4. CREATE ROLE HIERARCHY RELATIONSHIPS
-- ==========================================

-- Create table for role hierarchy if it doesn't exist
CREATE TABLE IF NOT EXISTS role_hierarchy (
  parent_role VARCHAR(50) NOT NULL,
  child_role VARCHAR(50) NOT NULL,
  can_delegate BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (parent_role, child_role)
);

-- Define role hierarchy relationships
INSERT INTO role_hierarchy (parent_role, child_role, can_delegate) VALUES
-- Super admin can manage all roles
('super_admin', 'platform_admin', true),
('super_admin', 'org_admin', true),
('super_admin', 'supervisor_admin', true),
('super_admin', 'admin', true),
('super_admin', 'manager', true),
('super_admin', 'user', true),
('super_admin', 'assessor', true),
('super_admin', 'auditor', true),

-- Platform admin can manage system-level roles
('platform_admin', 'org_admin', false),
('platform_admin', 'supervisor_admin', false),

-- Org admin can manage organizational roles
('org_admin', 'supervisor_admin', true),
('org_admin', 'admin', true),
('org_admin', 'manager', true),
('org_admin', 'user', true),
('org_admin', 'assessor', true),

-- Supervisor admin can manage departmental roles
('supervisor_admin', 'manager', true),
('supervisor_admin', 'user', true),
('supervisor_admin', 'assessor', true),

-- Manager can manage basic users
('admin', 'manager', true),
('admin', 'user', true),
('admin', 'assessor', true),
('manager', 'user', true),
('manager', 'assessor', true)

ON CONFLICT (parent_role, child_role) DO NOTHING;

-- ==========================================
-- 5. CREATE PERMISSION VALIDATION FUNCTIONS
-- ==========================================

-- Function to check if a role has a specific permission
CREATE OR REPLACE FUNCTION role_has_permission(
  role_name VARCHAR(50),
  permission VARCHAR(100)
) RETURNS BOOLEAN AS $$
DECLARE
  role_permissions JSONB;
BEGIN
  SELECT permissions INTO role_permissions
  FROM roles
  WHERE name = role_name;

  IF role_permissions IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Super admin has all permissions
  IF role_name = 'super_admin' THEN
    RETURN TRUE;
  END IF;

  -- Check if permission exists in role's permissions array
  RETURN role_permissions ? permission;
END;
$$ LANGUAGE plpgsql;

-- Function to check if user can manage another user based on role hierarchy
CREATE OR REPLACE FUNCTION can_manage_user(
  manager_role VARCHAR(50),
  target_role VARCHAR(50)
) RETURNS BOOLEAN AS $$
BEGIN
  -- Super admin can manage anyone
  IF manager_role = 'super_admin' THEN
    RETURN TRUE;
  END IF;

  -- Check if there's a hierarchy relationship
  RETURN EXISTS (
    SELECT 1 FROM role_hierarchy
    WHERE parent_role = manager_role
    AND child_role = target_role
    AND can_delegate = true
  );
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- 6. UPDATE ROW LEVEL SECURITY POLICIES
-- ==========================================

-- Update existing RLS policies to include new admin roles

-- Example: Update assessments policy for supervisor admin
DROP POLICY IF EXISTS assessments_supervisor_admin_policy ON assessments;
CREATE POLICY assessments_supervisor_admin_policy ON assessments
  FOR ALL TO authenticated_users
  USING (
    current_setting('app.user_role') = 'supervisor_admin' AND
    (
      tenant_id = current_setting('app.tenant_id')::UUID OR
      department_id = current_setting('app.department_id')::UUID
    )
  )
  WITH CHECK (
    current_setting('app.user_role') = 'supervisor_admin' AND
    tenant_id = current_setting('app.tenant_id')::UUID
  );

-- Platform admin read-only access to all data for monitoring
DROP POLICY IF EXISTS assessments_platform_admin_policy ON assessments;
CREATE POLICY assessments_platform_admin_policy ON assessments
  FOR SELECT TO authenticated_users
  USING (current_setting('app.user_role') = 'platform_admin');

-- ==========================================
-- 7. CREATE AUDIT TRIGGERS
-- ==========================================

-- Trigger to log admin role assignments
CREATE OR REPLACE FUNCTION log_admin_role_assignment() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role IN ('supervisor_admin', 'platform_admin', 'super_admin') THEN
    INSERT INTO audit_logs (
      user_id,
      action,
      resource_type,
      resource_id,
      details,
      ip_address,
      user_agent,
      created_at
    ) VALUES (
      COALESCE(current_setting('app.user_id', true)::UUID, NEW.id),
      'ADMIN_ROLE_ASSIGNED',
      'user',
      NEW.id,
      jsonb_build_object(
        'new_role', NEW.role,
        'old_role', COALESCE(OLD.role, 'none'),
        'tenant_id', NEW.tenant_id
      ),
      current_setting('app.ip_address', true),
      current_setting('app.user_agent', true),
      NOW()
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS admin_role_assignment_audit ON users;
CREATE TRIGGER admin_role_assignment_audit
  AFTER UPDATE OF role ON users
  FOR EACH ROW
  EXECUTE FUNCTION log_admin_role_assignment();

-- ==========================================
-- 8. CREATE INDEXES FOR PERFORMANCE
-- ==========================================

-- Index for role-based queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_role_tenant
  ON users (role, tenant_id) WHERE role IN ('supervisor_admin', 'platform_admin');

-- Index for role hierarchy lookups
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_role_hierarchy_parent
  ON role_hierarchy (parent_role);

-- Index for permission-based queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_roles_permissions_gin
  ON roles USING GIN (permissions);

COMMIT;

-- ==========================================
-- 9. VERIFICATION QUERIES
-- ==========================================

-- Verify new roles were created
SELECT name, display_name, hierarchy_level,
       jsonb_array_length(permissions) as permission_count
FROM roles
WHERE name IN ('supervisor_admin', 'platform_admin')
ORDER BY hierarchy_level DESC;

-- Verify role hierarchy
SELECT parent_role, child_role, can_delegate
FROM role_hierarchy
WHERE parent_role IN ('supervisor_admin', 'platform_admin')
   OR child_role IN ('supervisor_admin', 'platform_admin')
ORDER BY parent_role, child_role;
