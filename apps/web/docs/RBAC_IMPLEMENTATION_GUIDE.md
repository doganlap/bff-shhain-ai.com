# 🔐 Role-Based Access Control (RBAC) Implementation Guide

## Overview

This document provides comprehensive guidance on implementing and using the Role-Based Access Control (RBAC) system in GRC Master. The RBAC system is binding across all layers of the application (Frontend, Backend, Database).

---

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Role Hierarchy](#role-hierarchy)
3. [Permission Structure](#permission-structure)
4. [Frontend Implementation](#frontend-implementation)
5. [Backend Implementation](#backend-implementation)
6. [Database Implementation](#database-implementation)
7. [Usage Examples](#usage-examples)
8. [Best Practices](#best-practices)

---

## System Architecture

### Layers

```
┌─────────────────────────────────────────┐
│         Frontend Layer (React)          │
│  - Route Protection                     │
│  - Component Visibility                 │
│  - UI Element Disabling                 │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│       Backend Layer (Node.js/API)       │
│  - API Endpoint Protection              │
│  - Request Validation                   │
│  - Resource Authorization               │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│      Database Layer (PostgreSQL)        │
│  - Row-Level Security (RLS)             │
│  - Stored Procedure Permissions         │
│  - Data Access Control                  │
└─────────────────────────────────────────┘
```

---

## Role Hierarchy

### Role Levels (0 = Highest, 9 = Lowest)

| Level | Role           | Description                          |
|-------|----------------|--------------------------------------|
| 0     | Super Admin    | Full system access                   |
| 1     | System Admin   | System-wide management               |
| 2     | Tenant Admin   | Tenant-level management              |
| 3     | Org Admin      | Organization-level management        |
| 4     | Manager        | Team and project management          |
| 5     | Auditor        | Audit and compliance activities      |
| 6     | Analyst        | Analysis and reporting               |
| 7     | User           | Standard user operations             |
| 8     | Viewer         | Read-only access                     |
| 9     | Guest          | Limited public access                |

---

## Permission Structure

### Permission Format

```
resource:action
```

### Examples

- `users:create` - Create users
- `assessments:update` - Update assessments
- `reports:read` - Read reports
- `frameworks:*` - All framework operations

### Permission Categories

#### System Permissions
- `system:manage`
- `system:monitor`
- `system:config`

#### User Permissions
- `users:create`
- `users:read`
- `users:update`
- `users:delete`
- `users:invite`

#### Organization Permissions
- `organizations:create`
- `organizations:read`
- `organizations:update`
- `organizations:delete`

#### Framework Permissions
- `frameworks:create`
- `frameworks:read`
- `frameworks:update`
- `frameworks:delete`
- `frameworks:assign`

#### Assessment Permissions
- `assessments:create`
- `assessments:read`
- `assessments:update`
- `assessments:delete`
- `assessments:assign`
- `assessments:review`
- `assessments:approve`

---

## Frontend Implementation

### 1. Setup Environment Variables

Copy `.env.rbac` to `.env` and configure:

```env
VITE_RBAC_ENABLED=true
VITE_RBAC_STRICT_MODE=true
```

### 2. Use RBAC Hook

```javascript
import { useRBAC } from '@/hooks/useRBAC';

function MyComponent() {
  const { 
    hasPermission, 
    userRole, 
    canAccessRoute,
    isSuperAdmin 
  } = useRBAC();

  if (!hasPermission('users:create')) {
    return <div>Access Denied</div>;
  }

  return <div>User Management</div>;
}
```

### 3. Protect Routes

```javascript
import { ProtectedRoute } from '@/components/rbac';

<Route 
  path="/admin/users" 
  element={
    <ProtectedRoute 
      requiredPermission="users:read"
      fallbackPath="/unauthorized"
    >
      <UserManagement />
    </ProtectedRoute>
  } 
/>
```

### 4. Conditional Rendering

```javascript
import { Can } from '@/components/rbac';

function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      
      <Can permission="users:create">
        <button>Create User</button>
      </Can>

      <Can permissions={['reports:read', 'reports:generate']} requireAll>
        <ReportGenerator />
      </Can>

      <Can role="super_admin">
        <SystemSettings />
      </Can>
    </div>
  );
}
```

### 5. Multiple Permission Checks

```javascript
import { Can } from '@/components/rbac';

// Require ANY of the permissions
<Can permissions={['users:read', 'users:create']}>
  <UserList />
</Can>

// Require ALL of the permissions
<Can permissions={['reports:read', 'reports:export']} requireAll>
  <ExportButton />
</Can>
```

### 6. Role-Based Rendering

```javascript
import { RoleSwitch } from '@/components/rbac';

function Navigation() {
  return (
    <nav>
      <RoleSwitch role="super_admin">
        <AdminMenu />
      </RoleSwitch>

      <RoleSwitch role="user">
        <UserMenu />
      </RoleSwitch>
    </nav>
  );
}
```

### 7. Higher-Order Components

```javascript
import { withPermission, withRole } from '@/components/rbac';

// Wrap component with permission check
const ProtectedComponent = withPermission(
  MyComponent, 
  'users:create'
);

// Wrap component with role check
const AdminComponent = withRole(
  MyComponent,
  'super_admin'
);
```

---

## Backend Implementation

### 1. Middleware Setup

Create middleware for API routes:

```javascript
// middleware/rbac.js
import RBAC from '../config/rbac.config';

export const requirePermission = (permission) => {
  return (req, res, next) => {
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!RBAC.hasPermission(user.role, permission)) {
      return res.status(403).json({ 
        error: 'Forbidden',
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};

export const requireRole = (roles) => {
  return (req, res, next) => {
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    
    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({ 
        error: 'Forbidden',
        message: 'Insufficient role privileges'
      });
    }

    next();
  };
};
```

### 2. Protect API Endpoints

```javascript
import { requirePermission, requireRole } from './middleware/rbac';

// Single permission
router.post('/users', 
  requirePermission('users:create'),
  createUser
);

// Multiple permissions (middleware chain)
router.delete('/users/:id',
  requirePermission('users:delete'),
  requireRole(['super_admin', 'system_admin']),
  deleteUser
);

// Role-based protection
router.get('/admin/settings',
  requireRole('super_admin'),
  getSettings
);
```

### 3. Resource Ownership Checks

```javascript
export const canModifyResource = async (req, res, next) => {
  const { id } = req.params;
  const user = req.user;
  
  const resource = await Resource.findById(id);
  
  if (!resource) {
    return res.status(404).json({ error: 'Resource not found' });
  }

  // Check if user owns the resource
  const isOwner = resource.user_id === user.id;
  
  // Check if user has permission to modify any resource
  const hasPermission = RBAC.hasPermission(user.role, 'resources:update');
  
  if (!isOwner && !hasPermission) {
    return res.status(403).json({ 
      error: 'Forbidden',
      message: 'You can only modify your own resources'
    });
  }

  req.resource = resource;
  next();
};
```

---

## Database Implementation

### 1. Row-Level Security (PostgreSQL)

```sql
-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Super admins can see all users
CREATE POLICY super_admin_all_users ON users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = current_user_id()
      AND u.role = 'super_admin'
    )
  );

-- Users can see users in their organization
CREATE POLICY org_users ON users
  FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM users
      WHERE id = current_user_id()
    )
  );

-- Users can only update their own profile
CREATE POLICY own_profile_update ON users
  FOR UPDATE
  TO authenticated
  USING (id = current_user_id());
```

### 2. Stored Procedure Permissions

```sql
-- Function to check if user has permission
CREATE OR REPLACE FUNCTION has_permission(
  p_user_id UUID,
  p_permission TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  v_role TEXT;
  v_permissions TEXT[];
BEGIN
  -- Get user role
  SELECT role INTO v_role
  FROM users
  WHERE id = p_user_id;

  -- Get role permissions
  SELECT array_agg(permission) INTO v_permissions
  FROM role_permissions
  WHERE role = v_role;

  -- Check if permission exists
  RETURN p_permission = ANY(v_permissions);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Use in queries
SELECT * FROM sensitive_data
WHERE has_permission(current_user_id(), 'sensitive_data:read');
```

### 3. Audit Logging

```sql
-- Audit function
CREATE OR REPLACE FUNCTION audit_rbac_action()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (
    user_id,
    action,
    resource_type,
    resource_id,
    old_value,
    new_value,
    timestamp
  ) VALUES (
    current_user_id(),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    row_to_json(OLD),
    row_to_json(NEW),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to sensitive tables
CREATE TRIGGER audit_users
AFTER INSERT OR UPDATE OR DELETE ON users
FOR EACH ROW EXECUTE FUNCTION audit_rbac_action();
```

---

## Usage Examples

### Example 1: User Management Page

```javascript
import { useRBAC } from '@/hooks/useRBAC';
import { Can } from '@/components/rbac';

function UserManagement() {
  const { hasPermission, canManageUser, PERMISSIONS } = useRBAC();

  const handleCreateUser = () => {
    if (!hasPermission(PERMISSIONS.USERS_CREATE)) {
      alert('You do not have permission to create users');
      return;
    }
    // Create user logic
  };

  const handleEditUser = (user) => {
    if (!canManageUser(user)) {
      alert('You cannot manage this user');
      return;
    }
    // Edit user logic
  };

  return (
    <div>
      <h1>User Management</h1>

      <Can permission="users:create">
        <button onClick={handleCreateUser}>
          Create User
        </button>
      </Can>

      <Can permission="users:read">
        <UserList onEdit={handleEditUser} />
      </Can>
    </div>
  );
}
```

### Example 2: Dynamic Navigation

```javascript
import { useRBAC } from '@/hooks/useRBAC';

function Navigation() {
  const { hasFeature, userRole } = useRBAC();

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', feature: 'dashboard' },
    { path: '/users', label: 'Users', feature: 'users' },
    { path: '/settings', label: 'Settings', feature: 'settings' },
    { path: '/audit', label: 'Audit', feature: 'audit' },
  ];

  return (
    <nav>
      {menuItems.map(item => (
        hasFeature(item.feature) && (
          <Link key={item.path} to={item.path}>
            {item.label}
          </Link>
        )
      ))}
    </nav>
  );
}
```

### Example 3: Form with Conditional Fields

```javascript
import { Can } from '@/components/rbac';

function UserForm() {
  return (
    <form>
      <input name="firstName" placeholder="First Name" />
      <input name="lastName" placeholder="Last Name" />
      <input name="email" placeholder="Email" />

      <Can permission="users:assign_role">
        <select name="role">
          <option value="user">User</option>
          <option value="manager">Manager</option>
          <option value="admin">Admin</option>
        </select>
      </Can>

      <Can role="super_admin">
        <input 
          type="checkbox" 
          name="isSuperAdmin" 
          label="Grant Super Admin Access" 
        />
      </Can>

      <button type="submit">Save</button>
    </form>
  );
}
```

---

## Best Practices

### 1. **Always Check Permissions on Both Frontend and Backend**

❌ **Bad**: Only frontend check
```javascript
// Frontend only
if (hasPermission('users:delete')) {
  await deleteUser(id);
}
```

✅ **Good**: Frontend + Backend check
```javascript
// Frontend
if (hasPermission('users:delete')) {
  await deleteUser(id); // API will also check permission
}

// Backend
router.delete('/users/:id',
  requirePermission('users:delete'),
  deleteUser
);
```

### 2. **Use Specific Permissions, Not Role Checks**

❌ **Bad**: Checking role directly
```javascript
if (userRole === 'admin') {
  // Show admin panel
}
```

✅ **Good**: Checking permission
```javascript
if (hasPermission('admin:access')) {
  // Show admin panel
}
```

### 3. **Fail Securely**

Default to denying access:
```javascript
const hasAccess = user && hasPermission(permission) ? true : false;
```

### 4. **Log Security Events**

Always log:
- Failed permission checks
- Role changes
- Permission grants/revokes
- Unauthorized access attempts

### 5. **Use Environment Variables**

Don't hardcode permissions or roles:
```javascript
// ❌ Bad
const ADMIN_ROLE = 'super_admin';

// ✅ Good
import { ROLES } from '@/config/rbac.config';
const ADMIN_ROLE = ROLES.SUPER_ADMIN;
```

### 6. **Test RBAC Thoroughly**

Write tests for:
- Permission checks
- Role hierarchies
- Route protection
- API endpoint authorization

### 7. **Document Custom Roles**

If you add custom roles, document:
- Role purpose
- Permission list
- Use cases
- Hierarchy level

---

## Testing

### Frontend Tests

```javascript
import { renderWithProviders } from '@/test-utils';
import { useRBAC } from '@/hooks/useRBAC';

describe('RBAC', () => {
  it('should deny access without permission', () => {
    const { result } = renderHook(() => useRBAC(), {
      wrapper: ({ children }) => (
        <AppProvider initialUser={{ role: 'viewer' }}>
          {children}
        </AppProvider>
      ),
    });

    expect(result.current.hasPermission('users:delete')).toBe(false);
  });

  it('should allow access with permission', () => {
    const { result } = renderHook(() => useRBAC(), {
      wrapper: ({ children }) => (
        <AppProvider initialUser={{ role: 'super_admin' }}>
          {children}
        </AppProvider>
      ),
    });

    expect(result.current.hasPermission('users:delete')).toBe(true);
  });
});
```

### Backend Tests

```javascript
describe('RBAC Middleware', () => {
  it('should deny access without permission', async () => {
    const res = await request(app)
      .delete('/api/users/123')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(403);

    expect(res.body.error).toBe('Forbidden');
  });

  it('should allow access with permission', async () => {
    const res = await request(app)
      .delete('/api/users/123')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
  });
});
```

---

## Troubleshooting

### Issue: Permission check always returns false

**Solution**: Verify:
1. User is authenticated
2. User role is set correctly
3. Permission is spelled correctly
4. RBAC configuration is loaded

### Issue: Route protection not working

**Solution**: Ensure:
1. ProtectedRoute wrapper is used
2. App is wrapped with AppProvider
3. User session is active
4. Route path matches exactly

### Issue: Backend allows forbidden actions

**Solution**: Check:
1. Middleware is applied to route
2. JWT token is valid
3. User role is extracted correctly
4. Permission exists in RBAC config

---

## Support

For RBAC-related issues:
1. Check this documentation
2. Review RBAC configuration in `/src/config/rbac.config.js`
3. Check environment variables in `.env.rbac`
4. Review audit logs for permission denials

---

Last Updated: November 12, 2025  
Version: 1.0.0
