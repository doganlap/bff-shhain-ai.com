/**
 * Enterprise RBAC (Role-Based Access Control) System
 * Implements granular permissions with resource-level access control
 */

// ============================================
// PERMISSION DEFINITIONS
// ============================================

const PERMISSIONS = {
  // Assessment Permissions
  'assessments:view': 'View assessments',
  'assessments:create': 'Create new assessments',
  'assessments:edit': 'Edit existing assessments',
  'assessments:delete': 'Delete assessments',
  'assessments:submit': 'Submit assessments for review',
  'assessments:approve': 'Approve submitted assessments',
  'assessments:export': 'Export assessment data',
  
  // Framework Permissions
  'frameworks:view': 'View compliance frameworks',
  'frameworks:manage': 'Manage compliance frameworks',
  
  // Control Permissions
  'controls:view': 'View controls',
  'controls:assess': 'Assess controls',
  'controls:manage': 'Manage controls',
  
  // Evidence Permissions
  'evidence:view': 'View evidence',
  'evidence:upload': 'Upload evidence',
  'evidence:delete': 'Delete evidence',
  'evidence:approve': 'Approve evidence',
  
  // User Management
  'users:view': 'View users in tenant',
  'users:create': 'Create new users',
  'users:edit': 'Edit user details',
  'users:delete': 'Delete users',
  'users:assign-roles': 'Assign roles to users',
  
  // Organization Management
  'organizations:view': 'View organizations',
  'organizations:manage': 'Manage organizations',
  
  // Report Permissions
  'reports:view': 'View reports',
  'reports:generate': 'Generate reports',
  'reports:export': 'Export reports',
  
  // Audit Permissions
  'audit:view': 'View audit logs',
  'audit:export': 'Export audit logs',
  
  // Tenant Management (Platform Admin only)
  'tenants:view-all': 'View all tenants',
  'tenants:manage': 'Manage tenants',
  'tenants:delete': 'Delete tenants',
  
  // System Settings
  'settings:view': 'View system settings',
  'settings:manage': 'Manage system settings',
};

// ============================================
// ROLE DEFINITIONS WITH PERMISSIONS
// ============================================

const ROLES = {
  // Platform-Level Roles
  platform_admin: {
    name: 'Platform Administrator',
    description: 'Full system access across all tenants',
    level: 'platform',
    permissions: ['*'], // All permissions
  },
  
  supervisor_admin: {
    name: 'Supervisor Administrator',
    description: 'Cross-tenant read access, limited write',
    level: 'platform',
    permissions: [
      'tenants:view-all',
      'assessments:view',
      'users:view',
      'audit:view',
      'audit:export',
      'reports:view',
      'reports:export',
    ],
  },
  
  // Tenant-Level Roles
  tenant_admin: {
    name: 'Tenant Administrator',
    description: 'Full access within tenant',
    level: 'tenant',
    permissions: [
      'assessments:*',      // All assessment permissions
      'frameworks:*',       // All framework permissions
      'controls:*',         // All control permissions
      'evidence:*',         // All evidence permissions
      'users:*',            // All user management
      'organizations:*',    // All org management
      'reports:*',          // All report permissions
      'audit:*',            // All audit permissions
      'settings:*',         // All settings
    ],
  },
  
  compliance_manager: {
    name: 'Compliance Manager',
    description: 'Manage assessments and frameworks',
    level: 'tenant',
    permissions: [
      'assessments:view',
      'assessments:create',
      'assessments:edit',
      'assessments:submit',
      'assessments:approve',
      'assessments:export',
      'frameworks:view',
      'frameworks:manage',
      'controls:view',
      'controls:assess',
      'controls:manage',
      'evidence:view',
      'evidence:approve',
      'reports:view',
      'reports:generate',
      'reports:export',
      'audit:view',
    ],
  },
  
  auditor: {
    name: 'Auditor',
    description: 'Review and approve assessments',
    level: 'tenant',
    permissions: [
      'assessments:view',
      'assessments:approve',
      'frameworks:view',
      'controls:view',
      'controls:assess',
      'evidence:view',
      'evidence:approve',
      'reports:view',
      'reports:generate',
      'audit:view',
    ],
  },
  
  assessor: {
    name: 'Assessor',
    description: 'Conduct assessments and manage evidence',
    level: 'tenant',
    permissions: [
      'assessments:view',
      'assessments:create',
      'assessments:edit',
      'assessments:submit',
      'frameworks:view',
      'controls:view',
      'controls:assess',
      'evidence:view',
      'evidence:upload',
      'reports:view',
    ],
  },
  
  contributor: {
    name: 'Contributor',
    description: 'Upload evidence and view assessments',
    level: 'tenant',
    permissions: [
      'assessments:view',
      'frameworks:view',
      'controls:view',
      'evidence:view',
      'evidence:upload',
    ],
  },
  
  viewer: {
    name: 'Viewer',
    description: 'Read-only access',
    level: 'tenant',
    permissions: [
      'assessments:view',
      'frameworks:view',
      'controls:view',
      'evidence:view',
      'reports:view',
    ],
  },
};

// ============================================
// PERMISSION CHECKING FUNCTIONS
// ============================================

/**
 * Check if user has a specific permission
 */
function hasPermission(user, permission) {
  if (!user || !user.roles) {
    return false;
  }

  const userRoles = Array.isArray(user.roles) ? user.roles : [user.roles];
  
  for (const roleName of userRoles) {
    const role = ROLES[roleName];
    if (!role) continue;
    
    // Platform admin has all permissions
    if (role.permissions.includes('*')) {
      return true;
    }
    
    // Check exact permission match
    if (role.permissions.includes(permission)) {
      return true;
    }
    
    // Check wildcard permissions (e.g., 'assessments:*')
    const [resource] = permission.split(':');
    if (role.permissions.includes(`${resource}:*`)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Check if user has any of the specified permissions
 */
function hasAnyPermission(user, permissions) {
  return permissions.some(permission => hasPermission(user, permission));
}

/**
 * Check if user has all of the specified permissions
 */
function hasAllPermissions(user, permissions) {
  return permissions.every(permission => hasPermission(user, permission));
}

/**
 * Get all permissions for a user
 */
function getUserPermissions(user) {
  if (!user || !user.roles) {
    return [];
  }

  const userRoles = Array.isArray(user.roles) ? user.roles : [user.roles];
  const permissions = new Set();
  
  for (const roleName of userRoles) {
    const role = ROLES[roleName];
    if (!role) continue;
    
    if (role.permissions.includes('*')) {
      // Add all permissions
      Object.keys(PERMISSIONS).forEach(p => permissions.add(p));
      return Array.from(permissions);
    }
    
    role.permissions.forEach(p => {
      if (p.endsWith(':*')) {
        // Expand wildcard
        const resource = p.split(':')[0];
        Object.keys(PERMISSIONS)
          .filter(perm => perm.startsWith(`${resource}:`))
          .forEach(perm => permissions.add(perm));
      } else {
        permissions.add(p);
      }
    });
  }
  
  return Array.from(permissions);
}

/**
 * Check resource-level permission (e.g., can user edit THIS assessment?)
 */
async function canAccessResource(user, permission, resource, resourceId) {
  // First check if user has the permission at all
  if (!hasPermission(user, permission)) {
    return false;
  }
  
  // Platform admins can access everything
  if (hasPermission(user, '*')) {
    return true;
  }
  
  // For tenant-level resources, check tenant ownership
  if (resource.tenant_id !== user.tenantId) {
    // Only supervisor/platform admins can access cross-tenant
    return hasPermission(user, 'tenants:view-all');
  }
  
  // Check resource-specific rules
  switch (resource.type) {
    case 'assessment':
      // Users can edit assessments they created or are assigned to
      if (permission.includes(':edit') || permission.includes(':delete')) {
        return resource.created_by === user.id || 
               resource.assigned_users?.includes(user.id) ||
               hasPermission(user, 'assessments:manage');
      }
      break;
      
    case 'user':
      // Users cannot edit users with higher privileges
      if (permission.includes(':edit') || permission.includes(':delete')) {
        const targetUserRole = ROLES[resource.role];
        const currentUserMaxRole = user.roles.map(r => ROLES[r])
          .reduce((max, role) => role.level === 'platform' ? role : max);
        
        if (targetUserRole.level === 'platform' && currentUserMaxRole.level !== 'platform') {
          return false;
        }
      }
      break;
  }
  
  return true;
}

// ============================================
// EXPRESS MIDDLEWARE
// ============================================

/**
 * Middleware to check permission
 * Usage: app.get('/api/assessments', requirePermission('assessments:view'), handler)
 */
function requirePermission(permission) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        code: 'UNAUTHORIZED'
      });
    }
    
    if (!hasPermission(req.user, permission)) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        message: `You do not have permission: ${permission}`,
        code: 'FORBIDDEN',
        required_permission: permission
      });
    }
    
    next();
  };
}

/**
 * Middleware to check any of multiple permissions
 */
function requireAnyPermission(...permissions) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        code: 'UNAUTHORIZED'
      });
    }
    
    if (!hasAnyPermission(req.user, permissions)) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        message: `You need one of: ${permissions.join(', ')}`,
        code: 'FORBIDDEN',
        required_permissions: permissions
      });
    }
    
    next();
  };
}

/**
 * Middleware to check resource-level permission
 */
function requireResourcePermission(permission, resourceGetter) {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        code: 'UNAUTHORIZED'
      });
    }
    
    try {
      // Get the resource (from database, cache, etc.)
      const resource = await resourceGetter(req);
      
      if (!resource) {
        return res.status(404).json({
          error: 'Resource not found',
          code: 'NOT_FOUND'
        });
      }
      
      const canAccess = await canAccessResource(
        req.user,
        permission,
        resource,
        req.params.id
      );
      
      if (!canAccess) {
        return res.status(403).json({
          error: 'Access denied',
          message: 'You do not have permission to access this resource',
          code: 'RESOURCE_ACCESS_DENIED'
        });
      }
      
      // Attach resource to request for use in handler
      req.resource = resource;
      next();
      
    } catch (error) {
      console.error('Error checking resource permission:', error);
      return res.status(500).json({
        error: 'Permission check failed',
        code: 'PERMISSION_CHECK_ERROR'
      });
    }
  };
}

// ============================================
// USAGE EXAMPLES
// ============================================

/*

// Example 1: Simple permission check
app.get('/api/assessments', 
  authenticateToken,
  requirePermission('assessments:view'),
  async (req, res) => {
    // Handler code
  }
);

// Example 2: Multiple permissions (user needs any one)
app.post('/api/assessments/:id/submit',
  authenticateToken,
  requireAnyPermission('assessments:submit', 'assessments:approve'),
  async (req, res) => {
    // Handler code
  }
);

// Example 3: Resource-level permission
app.put('/api/assessments/:id',
  authenticateToken,
  requireResourcePermission(
    'assessments:edit',
    async (req) => {
      return await db.query('SELECT * FROM assessments WHERE id = ?', [req.params.id]);
    }
  ),
  async (req, res) => {
    // req.resource contains the assessment
    // Handler code
  }
);

// Example 4: Check permission in code
if (hasPermission(req.user, 'users:delete')) {
  // Allow deletion
} else {
  // Show error
}

// Example 5: Get user's permissions (for frontend)
app.get('/api/auth/permissions', authenticateToken, (req, res) => {
  const permissions = getUserPermissions(req.user);
  res.json({ permissions });
});

*/

module.exports = {
  PERMISSIONS,
  ROLES,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  getUserPermissions,
  canAccessResource,
  requirePermission,
  requireAnyPermission,
  requireResourcePermission,
};
