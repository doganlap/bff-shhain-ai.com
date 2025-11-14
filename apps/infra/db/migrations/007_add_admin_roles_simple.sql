-- Migration: Add Supervisor Admin and Platform Admin roles (Compatible Version)
-- File: infra/db/migrations/007_add_admin_roles_simple.sql

BEGIN;

-- Add supervisor_admin role
INSERT INTO roles (
  name,
  display_name,
  description,
  permissions,
  is_system_role
) VALUES (
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
  true
) ON CONFLICT (name) DO NOTHING;

-- Add platform_admin role
INSERT INTO roles (
  name,
  display_name,
  description,
  permissions,
  is_system_role
) VALUES (
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
  true
) ON CONFLICT (name) DO NOTHING;

COMMIT;

-- Verify the roles were created
SELECT name, display_name,
       jsonb_array_length(permissions) as permission_count,
       is_system_role
FROM roles
WHERE name IN ('supervisor_admin', 'platform_admin')
ORDER BY name;
