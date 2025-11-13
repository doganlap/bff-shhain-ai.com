/**
 * Role-Based Access Control (RBAC) Configuration
 * Centralized RBAC definitions binding all system layers
 */

// ============================================
// ROLE DEFINITIONS
// ============================================
export const ROLES = {
  // Platform & System Roles
  SUPER_ADMIN: 'super_admin',
  SYSTEM_ADMIN: 'system_admin',
  TENANT_ADMIN: 'tenant_admin',
  ORG_ADMIN: 'org_admin',
  MANAGER: 'manager',
  AUDITOR: 'auditor',
  ANALYST: 'analyst',
  USER: 'user',
  VIEWER: 'viewer',
  GUEST: 'guest',
  
  // MSP Business Roles (Sales to Delivery Pipeline)
  OWNER: 'owner',              // Business owner - full access
  SALES: 'sales',              // Sales team - leads, opportunities, quotes
  SOLUTION: 'solution',        // Solution architects - proposals, design
  TENDERING: 'tendering',      // Tender managers - RFQs, bids
  PMO: 'pmo',                  // Project managers - delivery planning
  DELIVERY: 'delivery',        // Delivery team - implementation
  MAINTENANCE: 'maintenance',  // Support team - tickets, renewals
};

// Role hierarchy (lower number = higher privilege)
export const ROLE_HIERARCHY = {
  // Platform Roles
  [ROLES.SUPER_ADMIN]: 0,
  [ROLES.SYSTEM_ADMIN]: 1,
  [ROLES.TENANT_ADMIN]: 2,
  [ROLES.ORG_ADMIN]: 3,
  
  // MSP Business Roles (same level as org admin)
  [ROLES.OWNER]: 3,           // Business owner level
  [ROLES.SALES]: 5,           // Sales level
  [ROLES.SOLUTION]: 5,        // Solution level
  [ROLES.TENDERING]: 5,       // Tendering level
  [ROLES.PMO]: 5,             // PMO level
  [ROLES.DELIVERY]: 6,        // Delivery level
  [ROLES.MAINTENANCE]: 6,     // Maintenance level
  
  // GRC Roles
  [ROLES.MANAGER]: 4,
  [ROLES.AUDITOR]: 5,
  [ROLES.ANALYST]: 6,
  [ROLES.USER]: 7,
  [ROLES.VIEWER]: 8,
  [ROLES.GUEST]: 9,
};

// ============================================
// PERMISSION DEFINITIONS
// ============================================
export const PERMISSIONS = {
  // System Permissions
  SYSTEM_MANAGE: 'system:manage',
  SYSTEM_MONITOR: 'system:monitor',
  SYSTEM_CONFIG: 'system:config',
  SYSTEM_ALL: 'system:*',

  // Tenant Permissions
  TENANTS_CREATE: 'tenants:create',
  TENANTS_READ: 'tenants:read',
  TENANTS_UPDATE: 'tenants:update',
  TENANTS_DELETE: 'tenants:delete',
  TENANTS_ALL: 'tenants:*',

  // User Permissions
  USERS_CREATE: 'users:create',
  USERS_READ: 'users:read',
  USERS_UPDATE: 'users:update',
  USERS_DELETE: 'users:delete',
  USERS_INVITE: 'users:invite',
  USERS_ALL: 'users:*',

  // Organization Permissions
  ORGS_CREATE: 'organizations:create',
  ORGS_READ: 'organizations:read',
  ORGS_UPDATE: 'organizations:update',
  ORGS_DELETE: 'organizations:delete',
  ORGS_ALL: 'organizations:*',

  // Framework Permissions
  FRAMEWORKS_CREATE: 'frameworks:create',
  FRAMEWORKS_READ: 'frameworks:read',
  FRAMEWORKS_UPDATE: 'frameworks:update',
  FRAMEWORKS_DELETE: 'frameworks:delete',
  FRAMEWORKS_ASSIGN: 'frameworks:assign',
  FRAMEWORKS_IMPORT: 'frameworks:import',
  FRAMEWORKS_EXPORT: 'frameworks:export',
  FRAMEWORKS_ALL: 'frameworks:*',

  // Control Permissions
  CONTROLS_CREATE: 'controls:create',
  CONTROLS_READ: 'controls:read',
  CONTROLS_UPDATE: 'controls:update',
  CONTROLS_DELETE: 'controls:delete',
  CONTROLS_ASSIGN: 'controls:assign',
  CONTROLS_ALL: 'controls:*',

  // Assessment Permissions
  ASSESSMENTS_CREATE: 'assessments:create',
  ASSESSMENTS_READ: 'assessments:read',
  ASSESSMENTS_UPDATE: 'assessments:update',
  ASSESSMENTS_DELETE: 'assessments:delete',
  ASSESSMENTS_ASSIGN: 'assessments:assign',
  ASSESSMENTS_REVIEW: 'assessments:review',
  ASSESSMENTS_APPROVE: 'assessments:approve',
  ASSESSMENTS_CONTRIBUTE: 'assessments:contribute',
  ASSESSMENTS_ALL: 'assessments:*',

  // Report Permissions
  REPORTS_CREATE: 'reports:create',
  REPORTS_READ: 'reports:read',
  REPORTS_GENERATE: 'reports:generate',
  REPORTS_EXPORT: 'reports:export',
  REPORTS_SCHEDULE: 'reports:schedule',
  REPORTS_ALL: 'reports:*',

  // Evidence Permissions
  EVIDENCE_CREATE: 'evidence:create',
  EVIDENCE_READ: 'evidence:read',
  EVIDENCE_UPDATE: 'evidence:update',
  EVIDENCE_DELETE: 'evidence:delete',
  EVIDENCE_VERIFY: 'evidence:verify',
  EVIDENCE_APPROVE: 'evidence:approve',
  EVIDENCE_ALL: 'evidence:*',

  // Work Order Permissions
  WORKORDERS_CREATE: 'workorders:create',
  WORKORDERS_READ: 'workorders:read',
  WORKORDERS_UPDATE: 'workorders:update',
  WORKORDERS_DELETE: 'workorders:delete',
  WORKORDERS_ASSIGN: 'workorders:assign',
  WORKORDERS_ALL: 'workorders:*',

  // Audit Permissions
  AUDIT_READ: 'audit:read',
  AUDIT_EXPORT: 'audit:export',
  AUDIT_ALL: 'audit:*',

  // Settings Permissions
  SETTINGS_READ: 'settings:read',
  SETTINGS_UPDATE: 'settings:update',
  SETTINGS_ALL: 'settings:*',

  // Role & Permission Management
  ROLES_MANAGE: 'roles:*',
  PERMISSIONS_MANAGE: 'permissions:*',
  
  // ============================================
  // MSP BUSINESS MODULE PERMISSIONS
  // ============================================
  
  // Sales & CRM Permissions
  SALES_CREATE: 'sales:create',
  SALES_READ: 'sales:read',
  SALES_UPDATE: 'sales:update',
  SALES_DELETE: 'sales:delete',
  SALES_ASSIGN: 'sales:assign',
  SALES_ALL: 'sales:*',
  
  LEADS_CREATE: 'leads:create',
  LEADS_READ: 'leads:read',
  LEADS_UPDATE: 'leads:update',
  LEADS_DELETE: 'leads:delete',
  LEADS_ALL: 'leads:*',
  
  OPPORTUNITIES_CREATE: 'opportunities:create',
  OPPORTUNITIES_READ: 'opportunities:read',
  OPPORTUNITIES_UPDATE: 'opportunities:update',
  OPPORTUNITIES_DELETE: 'opportunities:delete',
  OPPORTUNITIES_ALL: 'opportunities:*',
  
  // Solution & Proposals Permissions
  SOLUTION_CREATE: 'solution:create',
  SOLUTION_READ: 'solution:read',
  SOLUTION_UPDATE: 'solution:update',
  SOLUTION_DELETE: 'solution:delete',
  SOLUTION_APPROVE: 'solution:approve',
  SOLUTION_ALL: 'solution:*',
  
  PROPOSALS_CREATE: 'proposals:create',
  PROPOSALS_READ: 'proposals:read',
  PROPOSALS_UPDATE: 'proposals:update',
  PROPOSALS_DELETE: 'proposals:delete',
  PROPOSALS_SUBMIT: 'proposals:submit',
  PROPOSALS_ALL: 'proposals:*',
  
  // Tendering & RFQ Permissions
  TENDERING_CREATE: 'tendering:create',
  TENDERING_READ: 'tendering:read',
  TENDERING_UPDATE: 'tendering:update',
  TENDERING_DELETE: 'tendering:delete',
  TENDERING_SUBMIT: 'tendering:submit',
  TENDERING_ALL: 'tendering:*',
  
  QUOTES_CREATE: 'quotes:create',
  QUOTES_READ: 'quotes:read',
  QUOTES_UPDATE: 'quotes:update',
  QUOTES_DELETE: 'quotes:delete',
  QUOTES_APPROVE: 'quotes:approve',
  QUOTES_ALL: 'quotes:*',
  
  // PMO & Projects Permissions
  PMO_CREATE: 'pmo:create',
  PMO_READ: 'pmo:read',
  PMO_UPDATE: 'pmo:update',
  PMO_DELETE: 'pmo:delete',
  PMO_ALL: 'pmo:*',
  
  PROJECTS_CREATE: 'projects:create',
  PROJECTS_READ: 'projects:read',
  PROJECTS_UPDATE: 'projects:update',
  PROJECTS_DELETE: 'projects:delete',
  PROJECTS_ASSIGN: 'projects:assign',
  PROJECTS_ALL: 'projects:*',
  
  // Delivery Permissions
  DELIVERY_CREATE: 'delivery:create',
  DELIVERY_READ: 'delivery:read',
  DELIVERY_UPDATE: 'delivery:update',
  DELIVERY_DELETE: 'delivery:delete',
  DELIVERY_EXECUTE: 'delivery:execute',
  DELIVERY_ALL: 'delivery:*',
  
  TASKS_CREATE: 'tasks:create',
  TASKS_READ: 'tasks:read',
  TASKS_UPDATE: 'tasks:update',
  TASKS_DELETE: 'tasks:delete',
  TASKS_ASSIGN: 'tasks:assign',
  TASKS_ALL: 'tasks:*',
  
  // Maintenance & Support Permissions
  MAINTENANCE_CREATE: 'maintenance:create',
  MAINTENANCE_READ: 'maintenance:read',
  MAINTENANCE_UPDATE: 'maintenance:update',
  MAINTENANCE_DELETE: 'maintenance:delete',
  MAINTENANCE_ALL: 'maintenance:*',
  
  TICKETS_CREATE: 'tickets:create',
  TICKETS_READ: 'tickets:read',
  TICKETS_UPDATE: 'tickets:update',
  TICKETS_DELETE: 'tickets:delete',
  TICKETS_ASSIGN: 'tickets:assign',
  TICKETS_RESOLVE: 'tickets:resolve',
  TICKETS_ALL: 'tickets:*',
  
  // License & Renewal Permissions
  LICENSES_CREATE: 'licenses:create',
  LICENSES_READ: 'licenses:read',
  LICENSES_UPDATE: 'licenses:update',
  LICENSES_DELETE: 'licenses:delete',
  LICENSES_ASSIGN: 'licenses:assign',
  LICENSES_RENEW: 'licenses:renew',
  LICENSES_SUSPEND: 'licenses:suspend',
  LICENSES_ALL: 'licenses:*',
  
  RENEWALS_CREATE: 'renewals:create',
  RENEWALS_READ: 'renewals:read',
  RENEWALS_UPDATE: 'renewals:update',
  RENEWALS_APPROVE: 'renewals:approve',
  RENEWALS_ALL: 'renewals:*',
  
  // Usage & Enforcement Permissions
  USAGE_READ: 'usage:read',
  USAGE_EXPORT: 'usage:export',
  USAGE_ALL: 'usage:*',
  
  BILLING_CREATE: 'billing:create',
  BILLING_READ: 'billing:read',
  BILLING_UPDATE: 'billing:update',
  BILLING_APPROVE: 'billing:approve',
  BILLING_ALL: 'billing:*',
};

// ============================================
// ROLE-PERMISSION MAPPING
// ============================================
export const ROLE_PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: [
    PERMISSIONS.SYSTEM_ALL,
    PERMISSIONS.TENANTS_ALL,
    PERMISSIONS.USERS_ALL,
    PERMISSIONS.ORGS_ALL,
    PERMISSIONS.FRAMEWORKS_ALL,
    PERMISSIONS.CONTROLS_ALL,
    PERMISSIONS.ASSESSMENTS_ALL,
    PERMISSIONS.REPORTS_ALL,
    PERMISSIONS.EVIDENCE_ALL,
    PERMISSIONS.WORKORDERS_ALL,
    PERMISSIONS.AUDIT_ALL,
    PERMISSIONS.SETTINGS_ALL,
    PERMISSIONS.ROLES_MANAGE,
    PERMISSIONS.PERMISSIONS_MANAGE,
  ],

  [ROLES.SYSTEM_ADMIN]: [
    PERMISSIONS.TENANTS_READ,
    PERMISSIONS.TENANTS_CREATE,
    PERMISSIONS.TENANTS_UPDATE,
    PERMISSIONS.USERS_ALL,
    PERMISSIONS.ORGS_READ,
    PERMISSIONS.FRAMEWORKS_ALL,
    PERMISSIONS.CONTROLS_ALL,
    PERMISSIONS.ASSESSMENTS_READ,
    PERMISSIONS.REPORTS_ALL,
    PERMISSIONS.AUDIT_READ,
    PERMISSIONS.SETTINGS_UPDATE,
  ],

  [ROLES.TENANT_ADMIN]: [
    PERMISSIONS.USERS_READ,
    PERMISSIONS.USERS_CREATE,
    PERMISSIONS.USERS_UPDATE,
    PERMISSIONS.ORGS_ALL,
    PERMISSIONS.FRAMEWORKS_READ,
    PERMISSIONS.FRAMEWORKS_ASSIGN,
    PERMISSIONS.CONTROLS_READ,
    PERMISSIONS.CONTROLS_ASSIGN,
    PERMISSIONS.ASSESSMENTS_ALL,
    PERMISSIONS.REPORTS_READ,
    PERMISSIONS.AUDIT_READ,
    PERMISSIONS.SETTINGS_UPDATE,
  ],

  [ROLES.ORG_ADMIN]: [
    PERMISSIONS.USERS_READ,
    PERMISSIONS.USERS_INVITE,
    PERMISSIONS.ORGS_READ,
    PERMISSIONS.ORGS_UPDATE,
    PERMISSIONS.FRAMEWORKS_READ,
    PERMISSIONS.CONTROLS_READ,
    PERMISSIONS.ASSESSMENTS_ALL,
    PERMISSIONS.REPORTS_READ,
    PERMISSIONS.EVIDENCE_ALL,
    PERMISSIONS.WORKORDERS_ALL,
  ],

  [ROLES.MANAGER]: [
    PERMISSIONS.USERS_READ,
    PERMISSIONS.ORGS_READ,
    PERMISSIONS.FRAMEWORKS_READ,
    PERMISSIONS.CONTROLS_READ,
    PERMISSIONS.ASSESSMENTS_CREATE,
    PERMISSIONS.ASSESSMENTS_UPDATE,
    PERMISSIONS.ASSESSMENTS_ASSIGN,
    PERMISSIONS.REPORTS_READ,
    PERMISSIONS.EVIDENCE_CREATE,
    PERMISSIONS.EVIDENCE_UPDATE,
    PERMISSIONS.WORKORDERS_ALL,
  ],

  [ROLES.AUDITOR]: [
    PERMISSIONS.ORGS_READ,
    PERMISSIONS.FRAMEWORKS_READ,
    PERMISSIONS.CONTROLS_READ,
    PERMISSIONS.ASSESSMENTS_READ,
    PERMISSIONS.ASSESSMENTS_REVIEW,
    PERMISSIONS.ASSESSMENTS_APPROVE,
    PERMISSIONS.REPORTS_READ,
    PERMISSIONS.REPORTS_GENERATE,
    PERMISSIONS.EVIDENCE_READ,
    PERMISSIONS.EVIDENCE_VERIFY,
    PERMISSIONS.AUDIT_READ,
  ],

  [ROLES.ANALYST]: [
    PERMISSIONS.ORGS_READ,
    PERMISSIONS.FRAMEWORKS_READ,
    PERMISSIONS.CONTROLS_READ,
    PERMISSIONS.ASSESSMENTS_READ,
    PERMISSIONS.REPORTS_READ,
    PERMISSIONS.REPORTS_GENERATE,
    PERMISSIONS.EVIDENCE_READ,
  ],

  [ROLES.USER]: [
    PERMISSIONS.ORGS_READ,
    PERMISSIONS.FRAMEWORKS_READ,
    PERMISSIONS.CONTROLS_READ,
    PERMISSIONS.ASSESSMENTS_READ,
    PERMISSIONS.ASSESSMENTS_CONTRIBUTE,
    PERMISSIONS.EVIDENCE_CREATE,
    PERMISSIONS.EVIDENCE_READ,
    PERMISSIONS.WORKORDERS_READ,
    PERMISSIONS.WORKORDERS_UPDATE,
  ],

  [ROLES.VIEWER]: [
    PERMISSIONS.ORGS_READ,
    PERMISSIONS.FRAMEWORKS_READ,
    PERMISSIONS.CONTROLS_READ,
    PERMISSIONS.ASSESSMENTS_READ,
    PERMISSIONS.REPORTS_READ,
    PERMISSIONS.EVIDENCE_READ,
  ],

  [ROLES.GUEST]: [
    PERMISSIONS.ORGS_READ,
    PERMISSIONS.FRAMEWORKS_READ,
  ],
  
  // ============================================
  // MSP BUSINESS ROLE PERMISSIONS
  // ============================================
  
  [ROLES.OWNER]: [
    // Owner has full access to all MSP business modules
    PERMISSIONS.SALES_ALL,
    PERMISSIONS.LEADS_ALL,
    PERMISSIONS.OPPORTUNITIES_ALL,
    PERMISSIONS.SOLUTION_ALL,
    PERMISSIONS.PROPOSALS_ALL,
    PERMISSIONS.TENDERING_ALL,
    PERMISSIONS.QUOTES_ALL,
    PERMISSIONS.PMO_ALL,
    PERMISSIONS.PROJECTS_ALL,
    PERMISSIONS.DELIVERY_ALL,
    PERMISSIONS.TASKS_ALL,
    PERMISSIONS.MAINTENANCE_ALL,
    PERMISSIONS.TICKETS_ALL,
    PERMISSIONS.LICENSES_ALL,
    PERMISSIONS.RENEWALS_ALL,
    PERMISSIONS.USAGE_ALL,
    PERMISSIONS.BILLING_ALL,
    PERMISSIONS.REPORTS_ALL,
    PERMISSIONS.USERS_READ,
    PERMISSIONS.USERS_CREATE,
    PERMISSIONS.ORGS_ALL,
  ],
  
  [ROLES.SALES]: [
    // Sales team - CRM, leads, opportunities, quotes
    PERMISSIONS.SALES_ALL,
    PERMISSIONS.LEADS_ALL,
    PERMISSIONS.OPPORTUNITIES_ALL,
    PERMISSIONS.QUOTES_CREATE,
    PERMISSIONS.QUOTES_READ,
    PERMISSIONS.QUOTES_UPDATE,
    PERMISSIONS.SOLUTION_READ,
    PERMISSIONS.PROPOSALS_READ,
    PERMISSIONS.TENDERING_READ,
    PERMISSIONS.LICENSES_READ,
    PERMISSIONS.RENEWALS_READ,
    PERMISSIONS.REPORTS_READ,
    PERMISSIONS.ORGS_READ,
  ],
  
  [ROLES.SOLUTION]: [
    // Solution architects - proposals, design, technical solutions
    PERMISSIONS.SOLUTION_ALL,
    PERMISSIONS.PROPOSALS_ALL,
    PERMISSIONS.OPPORTUNITIES_READ,
    PERMISSIONS.QUOTES_READ,
    PERMISSIONS.TENDERING_READ,
    PERMISSIONS.PMO_READ,
    PERMISSIONS.PROJECTS_READ,
    PERMISSIONS.DELIVERY_READ,
    PERMISSIONS.LICENSES_READ,
    PERMISSIONS.REPORTS_READ,
    PERMISSIONS.ORGS_READ,
  ],
  
  [ROLES.TENDERING]: [
    // Tender managers - RFQs, bids, quotes
    PERMISSIONS.TENDERING_ALL,
    PERMISSIONS.QUOTES_ALL,
    PERMISSIONS.PROPOSALS_READ,
    PERMISSIONS.PROPOSALS_UPDATE,
    PERMISSIONS.SOLUTION_READ,
    PERMISSIONS.OPPORTUNITIES_READ,
    PERMISSIONS.SALES_READ,
    PERMISSIONS.LICENSES_READ,
    PERMISSIONS.REPORTS_READ,
    PERMISSIONS.ORGS_READ,
  ],
  
  [ROLES.PMO]: [
    // Project managers - project planning, resource allocation
    PERMISSIONS.PMO_ALL,
    PERMISSIONS.PROJECTS_ALL,
    PERMISSIONS.TASKS_CREATE,
    PERMISSIONS.TASKS_READ,
    PERMISSIONS.TASKS_UPDATE,
    PERMISSIONS.TASKS_ASSIGN,
    PERMISSIONS.DELIVERY_READ,
    PERMISSIONS.DELIVERY_UPDATE,
    PERMISSIONS.OPPORTUNITIES_READ,
    PERMISSIONS.PROPOSALS_READ,
    PERMISSIONS.QUOTES_READ,
    PERMISSIONS.LICENSES_READ,
    PERMISSIONS.REPORTS_READ,
    PERMISSIONS.USERS_READ,
    PERMISSIONS.ORGS_READ,
  ],
  
  [ROLES.DELIVERY]: [
    // Delivery team - implementation, execution
    PERMISSIONS.DELIVERY_ALL,
    PERMISSIONS.TASKS_READ,
    PERMISSIONS.TASKS_UPDATE,
    PERMISSIONS.PROJECTS_READ,
    PERMISSIONS.PROJECTS_UPDATE,
    PERMISSIONS.SOLUTION_READ,
    PERMISSIONS.PROPOSALS_READ,
    PERMISSIONS.MAINTENANCE_CREATE,
    PERMISSIONS.MAINTENANCE_READ,
    PERMISSIONS.TICKETS_CREATE,
    PERMISSIONS.TICKETS_READ,
    PERMISSIONS.LICENSES_READ,
    PERMISSIONS.EVIDENCE_CREATE,
    PERMISSIONS.EVIDENCE_READ,
    PERMISSIONS.REPORTS_READ,
    PERMISSIONS.ORGS_READ,
  ],
  
  [ROLES.MAINTENANCE]: [
    // Support team - tickets, renewals, maintenance
    PERMISSIONS.MAINTENANCE_ALL,
    PERMISSIONS.TICKETS_ALL,
    PERMISSIONS.RENEWALS_READ,
    PERMISSIONS.RENEWALS_CREATE,
    PERMISSIONS.RENEWALS_UPDATE,
    PERMISSIONS.LICENSES_READ,
    PERMISSIONS.LICENSES_RENEW,
    PERMISSIONS.USAGE_READ,
    PERMISSIONS.DELIVERY_READ,
    PERMISSIONS.PROJECTS_READ,
    PERMISSIONS.TASKS_READ,
    PERMISSIONS.REPORTS_READ,
    PERMISSIONS.ORGS_READ,
  ],
};

// ============================================
// FEATURE FLAGS BY ROLE
// ============================================
export const ROLE_FEATURES = {
  [ROLES.SUPER_ADMIN]: ['dashboard', 'analytics', 'users', 'organizations', 'frameworks', 'controls', 'assessments', 'reports', 'evidence', 'workorders', 'audit', 'settings', 'system', 'api'],
  [ROLES.SYSTEM_ADMIN]: ['dashboard', 'analytics', 'users', 'organizations', 'frameworks', 'controls', 'assessments', 'reports', 'audit', 'settings'],
  [ROLES.TENANT_ADMIN]: ['dashboard', 'analytics', 'users', 'organizations', 'frameworks', 'controls', 'assessments', 'reports', 'settings'],
  [ROLES.ORG_ADMIN]: ['dashboard', 'users', 'frameworks', 'controls', 'assessments', 'reports', 'evidence', 'workorders'],
  [ROLES.MANAGER]: ['dashboard', 'assessments', 'reports', 'evidence', 'workorders'],
  [ROLES.AUDITOR]: ['dashboard', 'frameworks', 'controls', 'assessments', 'reports', 'evidence', 'audit'],
  [ROLES.ANALYST]: ['dashboard', 'analytics', 'frameworks', 'controls', 'assessments', 'reports'],
  [ROLES.USER]: ['dashboard', 'assessments', 'evidence', 'workorders'],
  [ROLES.VIEWER]: ['dashboard', 'reports'],
  [ROLES.GUEST]: ['dashboard'],
  
  // MSP Business Role Features
  [ROLES.OWNER]: ['dashboard', 'analytics', 'sales', 'crm', 'solution', 'proposals', 'tendering', 'quotes', 'pmo', 'projects', 'delivery', 'maintenance', 'tickets', 'licenses', 'renewals', 'billing', 'usage', 'reports'],
  [ROLES.SALES]: ['dashboard', 'sales', 'crm', 'leads', 'opportunities', 'quotes', 'reports', 'licenses', 'renewals'],
  [ROLES.SOLUTION]: ['dashboard', 'solution', 'proposals', 'projects', 'reports', 'licenses'],
  [ROLES.TENDERING]: ['dashboard', 'tendering', 'quotes', 'proposals', 'reports', 'licenses'],
  [ROLES.PMO]: ['dashboard', 'pmo', 'projects', 'tasks', 'delivery', 'reports', 'analytics', 'licenses'],
  [ROLES.DELIVERY]: ['dashboard', 'delivery', 'projects', 'tasks', 'maintenance', 'tickets', 'reports', 'licenses'],
  [ROLES.MAINTENANCE]: ['dashboard', 'maintenance', 'tickets', 'renewals', 'licenses', 'usage', 'reports'],
};

// ============================================
// ROUTE ACCESS CONTROL
// ============================================
export const ROUTE_ACCESS = {
  '/advanced': [ROLES.SUPER_ADMIN, ROLES.SYSTEM_ADMIN, ROLES.TENANT_ADMIN, ROLES.ORG_ADMIN],
  '/advanced/assessments': [ROLES.SUPER_ADMIN, ROLES.SYSTEM_ADMIN, ROLES.TENANT_ADMIN, ROLES.ORG_ADMIN, ROLES.MANAGER, ROLES.AUDITOR],
  '/advanced/frameworks': [ROLES.SUPER_ADMIN, ROLES.SYSTEM_ADMIN, ROLES.TENANT_ADMIN, ROLES.ORG_ADMIN, ROLES.AUDITOR, ROLES.ANALYST],
  '/app/controls': [ROLES.SUPER_ADMIN, ROLES.SYSTEM_ADMIN, ROLES.TENANT_ADMIN, ROLES.ORG_ADMIN, ROLES.MANAGER, ROLES.AUDITOR, ROLES.ANALYST],
  '/app/organizations': [ROLES.SUPER_ADMIN, ROLES.SYSTEM_ADMIN, ROLES.TENANT_ADMIN, ROLES.ORG_ADMIN],
  '/app/regulators': [ROLES.SUPER_ADMIN, ROLES.SYSTEM_ADMIN, ROLES.TENANT_ADMIN],
  '/app/reports': '*', // All authenticated users
  '/app/database': [ROLES.SUPER_ADMIN, ROLES.SYSTEM_ADMIN],
  '/app/settings': [ROLES.SUPER_ADMIN, ROLES.SYSTEM_ADMIN, ROLES.TENANT_ADMIN, ROLES.ORG_ADMIN],
  '/app/users': [ROLES.SUPER_ADMIN, ROLES.SYSTEM_ADMIN, ROLES.TENANT_ADMIN, ROLES.ORG_ADMIN],
  '/app/audit': [ROLES.SUPER_ADMIN, ROLES.SYSTEM_ADMIN, ROLES.TENANT_ADMIN, ROLES.AUDITOR],
};

// ============================================
// RESOURCE OWNERSHIP RULES
// ============================================
export const OWNERSHIP_RULES = {
  // Can modify own resources
  OWN_PROFILE: ['*'], // All roles
  OWN_ASSESSMENTS: [ROLES.SUPER_ADMIN, ROLES.SYSTEM_ADMIN, ROLES.TENANT_ADMIN, ROLES.ORG_ADMIN, ROLES.MANAGER, ROLES.USER],
  OWN_EVIDENCE: [ROLES.SUPER_ADMIN, ROLES.SYSTEM_ADMIN, ROLES.TENANT_ADMIN, ROLES.ORG_ADMIN, ROLES.MANAGER, ROLES.USER],
  OWN_WORKORDERS: [ROLES.SUPER_ADMIN, ROLES.SYSTEM_ADMIN, ROLES.TENANT_ADMIN, ROLES.ORG_ADMIN, ROLES.MANAGER, ROLES.USER],

  // Can modify organization resources
  ORG_RESOURCES: [ROLES.SUPER_ADMIN, ROLES.SYSTEM_ADMIN, ROLES.TENANT_ADMIN, ROLES.ORG_ADMIN],

  // Can modify tenant resources
  TENANT_RESOURCES: [ROLES.SUPER_ADMIN, ROLES.SYSTEM_ADMIN, ROLES.TENANT_ADMIN],

  // Can modify system resources
  SYSTEM_RESOURCES: [ROLES.SUPER_ADMIN, ROLES.SYSTEM_ADMIN],
};

// ============================================
// MFA REQUIREMENTS
// ============================================
export const MFA_REQUIRED_ROLES = [
  ROLES.SUPER_ADMIN,
  ROLES.SYSTEM_ADMIN,
  ROLES.TENANT_ADMIN,
];

export const MFA_RECOMMENDED_ROLES = [
  ROLES.ORG_ADMIN,
  ROLES.MANAGER,
  ROLES.AUDITOR,
];

// ============================================
// SESSION CONFIGURATION
// ============================================
export const SESSION_CONFIG = {
  [ROLES.SUPER_ADMIN]: {
    timeout: 3600, // 1 hour
    maxConcurrent: 2,
    requireMFA: true,
  },
  [ROLES.SYSTEM_ADMIN]: {
    timeout: 3600,
    maxConcurrent: 3,
    requireMFA: true,
  },
  [ROLES.TENANT_ADMIN]: {
    timeout: 7200, // 2 hours
    maxConcurrent: 3,
    requireMFA: true,
  },
  [ROLES.ORG_ADMIN]: {
    timeout: 7200,
    maxConcurrent: 5,
    requireMFA: false,
  },
  [ROLES.MANAGER]: {
    timeout: 7200,
    maxConcurrent: 5,
    requireMFA: false,
  },
  [ROLES.AUDITOR]: {
    timeout: 7200,
    maxConcurrent: 3,
    requireMFA: false,
  },
  [ROLES.ANALYST]: {
    timeout: 14400, // 4 hours
    maxConcurrent: 5,
    requireMFA: false,
  },
  [ROLES.USER]: {
    timeout: 14400,
    maxConcurrent: 5,
    requireMFA: false,
  },
  [ROLES.VIEWER]: {
    timeout: 28800, // 8 hours
    maxConcurrent: 10,
    requireMFA: false,
  },
  [ROLES.GUEST]: {
    timeout: 1800, // 30 minutes
    maxConcurrent: 1,
    requireMFA: false,
  },
};

// ============================================
// AUDIT CONFIGURATION
// ============================================
export const AUDIT_CONFIG = {
  // Roles that trigger audit logging for all actions
  AUDIT_ALL_ACTIONS: [
    ROLES.SUPER_ADMIN,
    ROLES.SYSTEM_ADMIN,
    ROLES.TENANT_ADMIN,
  ],

  // Sensitive operations that always trigger audit
  SENSITIVE_OPERATIONS: [
    'user:delete',
    'org:delete',
    'role:change',
    'permission:change',
    'setting:update',
    'audit:export',
  ],
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role, permission) {
  if (!role || !permission) return false;
  
  const rolePermissions = ROLE_PERMISSIONS[role] || [];
  
  // Check for exact match
  if (rolePermissions.includes(permission)) return true;
  
  // Check for wildcard permissions
  const [resource, action] = permission.split(':');
  const wildcardPermission = `${resource}:*`;
  
  return rolePermissions.includes(wildcardPermission);
}

/**
 * Check if a role can access a route
 */
export function canAccessRoute(role, route) {
  if (!role || !route) return false;
  
  const allowedRoles = ROUTE_ACCESS[route];
  
  // If route allows all authenticated users
  if (allowedRoles === '*') return true;
  
  // If route has specific role requirements
  if (Array.isArray(allowedRoles)) {
    return allowedRoles.includes(role);
  }
  
  return false;
}

/**
 * Check if a role can access a feature
 */
export function hasFeature(role, feature) {
  if (!role || !feature) return false;
  
  const roleFeatures = ROLE_FEATURES[role] || [];
  return roleFeatures.includes(feature);
}

/**
 * Check if user role has higher or equal privilege than target role
 */
export function hasHigherOrEqualRole(userRole, targetRole) {
  const userLevel = ROLE_HIERARCHY[userRole] ?? 999;
  const targetLevel = ROLE_HIERARCHY[targetRole] ?? 999;
  
  return userLevel <= targetLevel;
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role) {
  return ROLE_PERMISSIONS[role] || [];
}

/**
 * Get all features for a role
 */
export function getRoleFeatures(role) {
  return ROLE_FEATURES[role] || [];
}

/**
 * Check if MFA is required for role
 */
export function isMFARequired(role) {
  return MFA_REQUIRED_ROLES.includes(role);
}

/**
 * Check if MFA is recommended for role
 */
export function isMFARecommended(role) {
  return MFA_RECOMMENDED_ROLES.includes(role);
}

/**
 * Get session configuration for role
 */
export function getSessionConfig(role) {
  return SESSION_CONFIG[role] || SESSION_CONFIG[ROLES.USER];
}

export default {
  ROLES,
  ROLE_HIERARCHY,
  PERMISSIONS,
  ROLE_PERMISSIONS,
  ROLE_FEATURES,
  ROUTE_ACCESS,
  OWNERSHIP_RULES,
  MFA_REQUIRED_ROLES,
  MFA_RECOMMENDED_ROLES,
  SESSION_CONFIG,
  AUDIT_CONFIG,
  hasPermission,
  canAccessRoute,
  hasFeature,
  hasHigherOrEqualRole,
  getRolePermissions,
  getRoleFeatures,
  isMFARequired,
  isMFARecommended,
  getSessionConfig,
};
