/**
 * useRBAC Hook
 * React hook for Role-Based Access Control
 * Provides permission checking and authorization utilities
 */

import { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import RBAC from '../config/rbac.config';

export const useRBAC = () => {
  const { state } = useApp();
  const { user, isAuthenticated } = state;

  // Memoize role and permissions
  const userRole = useMemo(() => user?.role || null, [user]);
  const userPermissions = useMemo(() => {
    if (!userRole) return [];
    return RBAC.getRolePermissions(userRole);
  }, [userRole]);

  /**
   * Check if user has a specific permission
   * @param {string} permission - Permission to check (e.g., 'users:create')
   * @returns {boolean}
   */
  const hasPermission = useMemo(() => {
    return (permission) => {
      if (!isAuthenticated || !userRole) return false;
      return RBAC.hasPermission(userRole, permission);
    };
  }, [isAuthenticated, userRole]);

  /**
   * Check if user has any of the specified permissions
   * @param {string[]} permissions - Array of permissions
   * @returns {boolean}
   */
  const hasAnyPermission = useMemo(() => {
    return (permissions) => {
      if (!isAuthenticated || !userRole || !Array.isArray(permissions)) return false;
      return permissions.some(permission => RBAC.hasPermission(userRole, permission));
    };
  }, [isAuthenticated, userRole]);

  /**
   * Check if user has all of the specified permissions
   * @param {string[]} permissions - Array of permissions
   * @returns {boolean}
   */
  const hasAllPermissions = useMemo(() => {
    return (permissions) => {
      if (!isAuthenticated || !userRole || !Array.isArray(permissions)) return false;
      return permissions.every(permission => RBAC.hasPermission(userRole, permission));
    };
  }, [isAuthenticated, userRole]);

  /**
   * Check if user can access a specific route
   * @param {string} route - Route path
   * @returns {boolean}
   */
  const canAccessRoute = useMemo(() => {
    return (route) => {
      if (!isAuthenticated || !userRole) return false;
      return RBAC.canAccessRoute(userRole, route);
    };
  }, [isAuthenticated, userRole]);

  /**
   * Check if user has access to a feature
   * @param {string} feature - Feature name
   * @returns {boolean}
   */
  const hasFeature = useMemo(() => {
    return (feature) => {
      if (!isAuthenticated || !userRole) return false;
      return RBAC.hasFeature(userRole, feature);
    };
  }, [isAuthenticated, userRole]);

  /**
   * Check if user can perform action on a resource
   * @param {string} resource - Resource type (e.g., 'users', 'organizations')
   * @param {string} action - Action type (e.g., 'create', 'update', 'delete')
   * @param {object} resourceData - Optional resource data for ownership checks
   * @returns {boolean}
   */
  const canPerformAction = useMemo(() => {
    return (resource, action, resourceData = null) => {
      if (!isAuthenticated || !userRole) return false;

      const permission = `${resource}:${action}`;
      const hasPermissionToPerform = RBAC.hasPermission(userRole, permission);

      // If no permission, return false
      if (!hasPermissionToPerform) {
        // Check ownership rules for own resources
        if (resourceData && resourceData.user_id === user?.id) {
          const ownershipRule = RBAC.OWNERSHIP_RULES[`OWN_${resource.toUpperCase()}`];
          if (ownershipRule && (ownershipRule.includes('*') || ownershipRule.includes(userRole))) {
            return true;
          }
        }
        return false;
      }

      return true;
    };
  }, [isAuthenticated, userRole, user]);

  /**
   * Check if user role has higher or equal privilege than target role
   * @param {string} targetRole - Target role to compare
   * @returns {boolean}
   */
  const hasHigherOrEqualRole = useMemo(() => {
    return (targetRole) => {
      if (!userRole) return false;
      return RBAC.hasHigherOrEqualRole(userRole, targetRole);
    };
  }, [userRole]);

  /**
   * Check if user is a super admin
   * @returns {boolean}
   */
  const isSuperAdmin = useMemo(() => {
    return userRole === RBAC.ROLES.SUPER_ADMIN;
  }, [userRole]);

  /**
   * Check if user is an admin (any admin level)
   * @returns {boolean}
   */
  const isAdmin = useMemo(() => {
    return [
      RBAC.ROLES.SUPER_ADMIN,
      RBAC.ROLES.SYSTEM_ADMIN,
      RBAC.ROLES.TENANT_ADMIN,
      RBAC.ROLES.ORG_ADMIN,
    ].includes(userRole);
  }, [userRole]);

  /**
   * Check if MFA is required for user's role
   * @returns {boolean}
   */
  const mfaRequired = useMemo(() => {
    if (!userRole) return false;
    return RBAC.isMFARequired(userRole);
  }, [userRole]);

  /**
   * Check if MFA is recommended for user's role
   * @returns {boolean}
   */
  const mfaRecommended = useMemo(() => {
    if (!userRole) return false;
    return RBAC.isMFARecommended(userRole);
  }, [userRole]);

  /**
   * Get session configuration for user's role
   * @returns {object}
   */
  const sessionConfig = useMemo(() => {
    if (!userRole) return null;
    return RBAC.getSessionConfig(userRole);
  }, [userRole]);

  /**
   * Get all permissions for user's role
   * @returns {string[]}
   */
  const getAllPermissions = useMemo(() => {
    return userPermissions;
  }, [userPermissions]);

  /**
   * Get all features for user's role
   * @returns {string[]}
   */
  const getAllFeatures = useMemo(() => {
    if (!userRole) return [];
    return RBAC.getRoleFeatures(userRole);
  }, [userRole]);

  /**
   * Get role hierarchy level
   * @returns {number}
   */
  const getRoleLevel = useMemo(() => {
    if (!userRole) return 999;
    return RBAC.ROLE_HIERARCHY[userRole] ?? 999;
  }, [userRole]);

  /**
   * Check if user can manage another user
   * @param {object} targetUser - Target user object
   * @returns {boolean}
   */
  const canManageUser = useMemo(() => {
    return (targetUser) => {
      if (!isAuthenticated || !userRole || !targetUser) return false;

      // Super admin can manage everyone
      if (isSuperAdmin) return true;

      // Can't manage users with higher or equal role
      const canManage = hasHigherOrEqualRole(targetUser.role);
      if (!canManage) return false;

      // Must have user management permission
      return hasPermission(RBAC.PERMISSIONS.USERS_UPDATE);
    };
  }, [isAuthenticated, userRole, isSuperAdmin, hasHigherOrEqualRole, hasPermission]);

  return {
    // User info
    userRole,
    userPermissions,
    isAuthenticated,
    user,

    // Permission checks
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canAccessRoute,
    hasFeature,
    canPerformAction,

    // Role checks
    hasHigherOrEqualRole,
    isSuperAdmin,
    isAdmin,
    getRoleLevel,

    // User management
    canManageUser,

    // MFA info
    mfaRequired,
    mfaRecommended,

    // Session info
    sessionConfig,

    // Utility getters
    getAllPermissions,
    getAllFeatures,

    // Constants for convenience
    ROLES: RBAC.ROLES,
    PERMISSIONS: RBAC.PERMISSIONS,
  };
};

export default useRBAC;
