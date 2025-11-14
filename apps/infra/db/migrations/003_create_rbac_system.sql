-- Migration 003: Create Role-Based Access Control System
-- Implements comprehensive RBAC with tenant isolation

-- Create roles table for role definitions
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    permissions JSONB DEFAULT '[]',
    is_system_role BOOLEAN DEFAULT false,
    tenant_id UUID REFERENCES tenants(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create permissions table for granular permissions
CREATE TABLE IF NOT EXISTS permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    display_name VARCHAR(150) NOT NULL,
    description TEXT,
    resource VARCHAR(50) NOT NULL, -- users, tenants, assessments, etc.
    action VARCHAR(50) NOT NULL,   -- create, read, update, delete, manage
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create user_roles junction table for many-to-many relationship
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES users(id),
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    UNIQUE(user_id, role_id)
);

-- Insert system roles
INSERT INTO roles (name, display_name, description, permissions, is_system_role) VALUES
('super_admin', 'Super Administrator', 'Full system access across all tenants', '["*"]', true),
('tenant_admin', 'Tenant Administrator', 'Full access within tenant', '["tenant:*"]', true),
('admin', 'Administrator', 'Administrative access within tenant', '["users:manage", "assessments:manage", "reports:manage"]', true),
('manager', 'Manager', 'Management access within tenant', '["assessments:create", "assessments:read", "assessments:update", "reports:read"]', true),
('user', 'User', 'Standard user access', '["assessments:read", "assessments:create", "reports:read"]', true),
('viewer', 'Viewer', 'Read-only access', '["assessments:read", "reports:read"]', true)
ON CONFLICT (name) DO NOTHING;

-- Insert system permissions
INSERT INTO permissions (name, display_name, description, resource, action) VALUES
-- User management
('users:create', 'Create Users', 'Create new users', 'users', 'create'),
('users:read', 'View Users', 'View user information', 'users', 'read'),
('users:update', 'Update Users', 'Update user information', 'users', 'update'),
('users:delete', 'Delete Users', 'Delete users', 'users', 'delete'),
('users:manage', 'Manage Users', 'Full user management', 'users', 'manage'),

-- Tenant management
('tenants:create', 'Create Tenants', 'Create new tenants', 'tenants', 'create'),
('tenants:read', 'View Tenants', 'View tenant information', 'tenants', 'read'),
('tenants:update', 'Update Tenants', 'Update tenant information', 'tenants', 'update'),
('tenants:delete', 'Delete Tenants', 'Delete tenants', 'tenants', 'delete'),
('tenants:manage', 'Manage Tenants', 'Full tenant management', 'tenants', 'manage'),

-- Assessment management
('assessments:create', 'Create Assessments', 'Create new assessments', 'assessments', 'create'),
('assessments:read', 'View Assessments', 'View assessments', 'assessments', 'read'),
('assessments:update', 'Update Assessments', 'Update assessments', 'assessments', 'update'),
('assessments:delete', 'Delete Assessments', 'Delete assessments', 'assessments', 'delete'),
('assessments:manage', 'Manage Assessments', 'Full assessment management', 'assessments', 'manage'),

-- Report management
('reports:create', 'Create Reports', 'Create new reports', 'reports', 'create'),
('reports:read', 'View Reports', 'View reports', 'reports', 'read'),
('reports:update', 'Update Reports', 'Update reports', 'reports', 'update'),
('reports:delete', 'Delete Reports', 'Delete reports', 'reports', 'delete'),
('reports:manage', 'Manage Reports', 'Full report management', 'reports', 'manage'),

-- System permissions
('system:admin', 'System Administration', 'System administration access', 'system', 'admin'),
('system:config', 'System Configuration', 'System configuration access', 'system', 'config')
ON CONFLICT (name) DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_roles_tenant_id ON roles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_roles_name ON roles(name);
CREATE INDEX IF NOT EXISTS idx_permissions_resource ON permissions(resource);
CREATE INDEX IF NOT EXISTS idx_permissions_action ON permissions(action);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON user_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_active ON user_roles(is_active);

-- Add triggers for updated_at
DROP TRIGGER IF EXISTS update_roles_updated_at ON roles;
CREATE TRIGGER update_roles_updated_at 
    BEFORE UPDATE ON roles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Assign default role to existing users
INSERT INTO user_roles (user_id, role_id, assigned_by)
SELECT 
    u.id,
    r.id,
    u.id -- self-assigned for existing users
FROM users u
CROSS JOIN roles r
WHERE r.name = 'super_admin' 
AND u.email = 'admin@example.com'
AND NOT EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = u.id AND ur.role_id = r.id
);

-- Update existing users with proper roles based on their current role field
UPDATE users SET role = 'super_admin' WHERE email = 'admin@example.com';

-- Create function to check user permissions
CREATE OR REPLACE FUNCTION user_has_permission(
    p_user_id UUID,
    p_permission VARCHAR(100)
) RETURNS BOOLEAN AS $$
DECLARE
    has_perm BOOLEAN := FALSE;
BEGIN
    -- Check if user has the specific permission through roles
    SELECT EXISTS(
        SELECT 1
        FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        WHERE ur.user_id = p_user_id
        AND ur.is_active = true
        AND (ur.expires_at IS NULL OR ur.expires_at > CURRENT_TIMESTAMP)
        AND (
            r.permissions ? p_permission
            OR r.permissions ? '*'
            OR r.name = 'super_admin'
        )
    ) INTO has_perm;
    
    RETURN has_perm;
END;
$$ LANGUAGE plpgsql;
