import { useState, useEffect, useContext } from 'react';
import AppContext from '../context/AppContext';
import { apiServices } from '../services/api';

/**
 * Role-Based Permission Hook
 * Manages CRUD and workflow action permissions based on user roles
 */
export const useRolePermissions = () => {
  const { user, tenant } = useContext(AppContext);
  const [permissions, setPermissions] = useState({});
  const [userRoles, setUserRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id && tenant?.id) {
      loadUserPermissions();
    }
  }, [user?.id, tenant?.id]);

  const loadUserPermissions = async () => {
    try {
      setLoading(true);
      
      // Get user's roles and permissions for current tenant
      const rolesResponse = await apiServices.auth.getUserRoles(user.id, tenant.id);
      const permissionsResponse = await apiServices.auth.getUserPermissions(user.id);
      
      setUserRoles(rolesResponse.data || []);
      setPermissions(permissionsResponse.data || {});
      
    } catch (error) {
      console.error('Error loading permissions:', error);
      setPermissions({});
      setUserRoles([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Check if user has specific permission
   */
  const hasPermission = (permission) => {
    if (!user || loading) return false;
    
    // Super admin has all permissions
    if (user.role === 'super_admin' || userRoles.some(role => role.name === 'super_admin')) {
      return true;
    }
    
    // Check direct permissions
    if (permissions[permission]) {
      return true;
    }
    
    // Check role-based permissions
    return userRoles.some(role => 
      role.permissions && role.permissions.includes(permission)
    );
  };

  /**
   * Check if user has any of the specified permissions
   */
  const hasAnyPermission = (permissionList) => {
    return permissionList.some(permission => hasPermission(permission));
  };

  /**
   * Check if user has specific role
   */
  const hasRole = (roleName) => {
    if (!user || loading) return false;
    
    return user.role === roleName || 
           userRoles.some(role => role.name === roleName);
  };

  /**
   * Check if user can perform CRUD operations on resource
   */
  const canCreate = (resource) => {
    return hasAnyPermission([
      `${resource}.create`,
      `${resource}.write`,
      `${resource}.admin`,
      'admin.all'
    ]);
  };

  const canRead = (resource) => {
    return hasAnyPermission([
      `${resource}.read`,
      `${resource}.write`,
      `${resource}.admin`,
      'admin.all'
    ]);
  };

  const canUpdate = (resource, resourceOwnerId = null) => {
    // Check if user owns the resource
    const isOwner = resourceOwnerId && resourceOwnerId === user.id;
    
    return isOwner || hasAnyPermission([
      `${resource}.update`,
      `${resource}.write`,
      `${resource}.admin`,
      'admin.all'
    ]);
  };

  const canDelete = (resource, resourceOwnerId = null) => {
    // Check if user owns the resource
    const isOwner = resourceOwnerId && resourceOwnerId === user.id;
    
    return isOwner || hasAnyPermission([
      `${resource}.delete`,
      `${resource}.admin`,
      'admin.all'
    ]);
  };

  /**
   * Check workflow action permissions
   */
  const canApprove = (workflowType = 'general') => {
    return hasAnyPermission([
      `workflow.approve`,
      `workflow.${workflowType}.approve`,
      'workflow.admin',
      'admin.all'
    ]);
  };

  const canReject = (workflowType = 'general') => {
    return hasAnyPermission([
      `workflow.reject`,
      `workflow.${workflowType}.reject`,
      'workflow.admin',
      'admin.all'
    ]);
  };

  const canDelegate = (workflowType = 'general') => {
    return hasAnyPermission([
      `workflow.delegate`,
      `workflow.${workflowType}.delegate`,
      'workflow.admin',
      'admin.all'
    ]);
  };

  const canReassign = (workflowType = 'general') => {
    return hasAnyPermission([
      `workflow.reassign`,
      `workflow.${workflowType}.reassign`,
      'workflow.admin',
      'admin.all'
    ]);
  };

  /**
   * Check tenant-level permissions
   */
  const canManageTenant = () => {
    return hasAnyPermission([
      'tenant.admin',
      'tenant.manage',
      'admin.all'
    ]);
  };

  const canViewTenantData = () => {
    return hasAnyPermission([
      'tenant.read',
      'tenant.admin',
      'admin.all'
    ]);
  };

  /**
   * Get filtered actions based on permissions
   */
  const getAvailableActions = (resource, resourceOwnerId = null) => {
    const actions = [];

    if (canRead(resource)) {
      actions.push({
        name: 'view',
        icon: 'Eye',
        label: 'View',
        labelAr: 'عرض',
        permission: true
      });
    }

    if (canUpdate(resource, resourceOwnerId)) {
      actions.push({
        name: 'edit',
        icon: 'Edit',
        label: 'Edit',
        labelAr: 'تعديل',
        permission: true
      });
    }

    if (canDelete(resource, resourceOwnerId)) {
      actions.push({
        name: 'delete',
        icon: 'Trash2',
        label: 'Delete',
        labelAr: 'حذف',
        permission: true,
        variant: 'danger'
      });
    }

    return actions;
  };

  /**
   * Get available workflow actions
   */
  const getWorkflowActions = (workflowType = 'general', workflowStatus = 'pending') => {
    const actions = [];

    if (workflowStatus === 'pending' && canApprove(workflowType)) {
      actions.push({
        name: 'approve',
        icon: 'CheckCircle',
        label: 'Approve',
        labelAr: 'موافقة',
        variant: 'success'
      });
    }

    if (workflowStatus === 'pending' && canReject(workflowType)) {
      actions.push({
        name: 'reject',
        icon: 'XCircle',
        label: 'Reject',
        labelAr: 'رفض',
        variant: 'danger'
      });
    }

    if (canDelegate(workflowType)) {
      actions.push({
        name: 'delegate',
        icon: 'UserPlus',
        label: 'Delegate',
        labelAr: 'تفويض',
        variant: 'secondary'
      });
    }

    if (canReassign(workflowType)) {
      actions.push({
        name: 'reassign',
        icon: 'RefreshCw',
        label: 'Reassign',
        labelAr: 'إعادة تعيين',
        variant: 'secondary'
      });
    }

    return actions;
  };

  /**
   * Check if user can access specific page/module
   */
  const canAccessModule = (moduleName) => {
    const modulePermissions = {
      'dashboard': ['dashboard.read', 'admin.all'],
      'assessments': ['assessments.read', 'assessments.admin', 'admin.all'],
      'compliance': ['compliance.read', 'compliance.admin', 'admin.all'],
      'risks': ['risks.read', 'risks.admin', 'admin.all'],
      'frameworks': ['frameworks.read', 'frameworks.admin', 'admin.all'],
      'controls': ['controls.read', 'controls.admin', 'admin.all'],
      'users': ['users.read', 'users.admin', 'admin.all'],
      'organizations': ['organizations.read', 'organizations.admin', 'admin.all'],
      'reports': ['reports.read', 'reports.admin', 'admin.all'],
      'workflows': ['workflows.read', 'workflows.admin', 'admin.all'],
      'settings': ['settings.read', 'settings.admin', 'admin.all'],
      'audit-logs': ['audit.read', 'audit.admin', 'admin.all']
    };

    const requiredPermissions = modulePermissions[moduleName] || [];
    return hasAnyPermission(requiredPermissions);
  };

  /**
   * Get user's approval level for amount-based approvals
   */
  const getApprovalLevel = () => {
    if (!userRoles.length) return 0;
    
    return Math.max(...userRoles.map(role => role.approval_level || 0));
  };

  const canApproveAmount = (amount) => {
    const maxApprovalAmount = Math.max(
      ...userRoles.map(role => role.can_approve_up_to_amount || 0)
    );
    
    return amount <= maxApprovalAmount;
  };

  return {
    // Permission checks
    hasPermission,
    hasAnyPermission,
    hasRole,
    
    // CRUD permissions
    canCreate,
    canRead,
    canUpdate,
    canDelete,
    
    // Workflow permissions
    canApprove,
    canReject,
    canDelegate,
    canReassign,
    
    // Tenant permissions
    canManageTenant,
    canViewTenantData,
    
    // Module access
    canAccessModule,
    
    // Action helpers
    getAvailableActions,
    getWorkflowActions,
    
    // Approval levels
    getApprovalLevel,
    canApproveAmount,
    
    // State
    permissions,
    userRoles,
    loading,
    user,
    tenant
  };
};
