/**
 * Permission-Based Page Template
 * Ensures all pages have proper role-based elements, tools, and advanced cards
 * Follows permission rules for different user roles
 */

import React from 'react';
import { useRBAC } from '../../hooks/useRBAC.jsx';
import { PermissionBasedCard, PermissionBasedButton } from './PermissionBasedCard';
import { AnimatedCard, CulturalLoadingSpinner } from '../Animation/InteractiveAnimationToolkit';
import { Shield, Lock, Eye, Settings, Users, Database, BarChart3, AlertTriangle, Building2, FileText } from 'lucide-react';

/**
 * Permission-Based Page Template
 * Wraps page content with proper permission-based components
 */
export const PermissionPageTemplate = ({
  children,
  pagePermissions = [],
  requiredRole = null,
  pageTitle,
  pageDescription,
  loading = false,
  error = null,
  actions = [],
  tools = [],
  showHeader = true,
  showStats = true,
  className = ''
}) => {
  const { 
    hasPermission, 
    hasAllPermissions,
    isSuperAdmin,
    userRole,
    user,
    getAllPermissions = () => [],
    getAllFeatures = () => []
  } = useRBAC();

  // Check page-level permissions
  const hasPageAccess = () => {
    if (loading) return false;
    
    // Super admin bypass
    if (isSuperAdmin) return true;

    // Check role requirement
    if (requiredRole && userRole !== requiredRole) return false;

    // Check page permissions
    if (pagePermissions.length === 0) return true;
    
    return hasAllPermissions(pagePermissions);
  };

  const canAccessPage = hasPageAccess();

  // Show loading state
  if (loading) {
    return (
      <div className={`min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:bg-gray-900 p-6 ${className}`}>
        <div className="max-w-7xl mx-auto">
          <AnimatedCard className="p-8">
            <div className="flex items-center justify-center h-64">
              <CulturalLoadingSpinner className="h-12 w-12" />
            </div>
          </AnimatedCard>
        </div>
      </div>
    );
  }

  // Show access denied if no permissions
  if (!canAccessPage) {
    return (
      <div className={`min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:bg-gray-900 p-6 ${className}`}>
        <div className="max-w-7xl mx-auto">
          <AnimatedCard className="p-8 text-center">
            <div className="flex items-center justify-center mb-4">
              <Lock className="h-16 w-16 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Access Denied
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              You don't have the required permissions to access this page.
            </p>
            <div className="text-sm text-gray-500 dark:text-gray-500">
              <p>Your role: <span className="font-medium">{userRole || 'None'}</span></p>
              <p>Required permissions: <span className="font-medium">{pagePermissions.join(', ')}</span></p>
            </div>
          </AnimatedCard>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className={`min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:bg-gray-900 p-6 ${className}`}>
        <div className="max-w-7xl mx-auto">
          <AnimatedCard className="p-8 text-center">
            <div className="flex items-center justify-center mb-4">
              <AlertTriangle className="h-16 w-16 text-yellow-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Error Loading Page
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {error}
            </p>
          </AnimatedCard>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:bg-gray-900 p-6 ${className}`}>
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Page Header with Permissions */}
        {showHeader && (
          <PermissionBasedCard
            title={pageTitle}
            description={pageDescription}
            icon={<Shield className="h-6 w-6" />}
            actions={actions}
            className="page-header-card"
            culturalPattern={true}
            glowEffect={true}
          >
            {/* User Info & Permissions Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                <div className="text-sm text-blue-600 dark:text-blue-400">Current Role</div>
                <div className="font-semibold text-blue-900 dark:text-blue-100">{userRole || 'None'}</div>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                <div className="text-sm text-green-600 dark:text-green-400">Permissions</div>
                <div className="font-semibold text-green-900 dark:text-green-100">{getAllPermissions && typeof getAllPermissions === 'function' ? getAllPermissions().length : 0}</div>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                <div className="text-sm text-purple-600 dark:text-purple-400">Features</div>
                <div className="font-semibold text-purple-900 dark:text-purple-100">{getAllFeatures && typeof getAllFeatures === 'function' ? getAllFeatures().length : 0}</div>
              </div>
            </div>
          </PermissionBasedCard>
        )}

        {/* Permission-Based Tools Section */}
        {tools.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {tools.map((tool, index) => (
              <PermissionBasedCard
                key={index}
                {...tool}
                className="tool-card"
                culturalPattern={tool.culturalPattern || false}
                glowEffect={tool.glowEffect || false}
              />
            ))}
          </div>
        )}

        {/* Main Page Content */}
        <div className="page-content">
          {children}
        </div>

        {/* Permission-Based Actions Footer */}
        {actions.length > 0 && (
          <div className="flex flex-wrap gap-3 justify-center">
            {actions.map((action, index) => (
              <PermissionBasedButton
                key={index}
                {...action}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Role-Based Dashboard Cards
 * Shows different dashboard cards based on user role
 */
export const RoleDashboardCards = ({ className = '' }) => {
  const { userRole, isSuperAdmin } = useRBAC();

  const dashboardCards = {
    super_admin: [
      {
        title: 'System Overview',
        description: 'Complete system statistics and health',
        icon: <Database className="h-8 w-8" />,
        requiredPermissions: ['system:monitor'],
        culturalPattern: true,
        glowEffect: true
      },
      {
        title: 'User Management',
        description: 'Manage all system users',
        icon: <Users className="h-8 w-8" />,
        requiredPermissions: ['users:*'],
        culturalPattern: true,
        glowEffect: true
      },
      {
        title: 'System Settings',
        description: 'Configure system parameters',
        icon: <Settings className="h-8 w-8" />,
        requiredPermissions: ['system:config'],
        culturalPattern: true,
        glowEffect: true
      }
    ],
    system_admin: [
      {
        title: 'Tenant Management',
        description: 'Manage tenant organizations',
        icon: <Building2 className="h-8 w-8" />,
        requiredPermissions: ['tenants:*'],
        culturalPattern: true,
        glowEffect: false
      },
      {
        title: 'Framework Administration',
        description: 'Manage compliance frameworks',
        icon: <BarChart3 className="h-8 w-8" />,
        requiredPermissions: ['frameworks:*'],
        culturalPattern: false,
        glowEffect: false
      }
    ],
    tenant_admin: [
      {
        title: 'Organization Dashboard',
        description: 'Organization overview and metrics',
        icon: <BarChart3 className="h-8 w-8" />,
        requiredPermissions: ['organizations:*'],
        culturalPattern: false,
        glowEffect: false
      },
      {
        title: 'Assessment Management',
        description: 'Manage compliance assessments',
        icon: <FileText className="h-8 w-8" />,
        requiredPermissions: ['assessments:*'],
        culturalPattern: false,
        glowEffect: false
      }
    ],
    manager: [
      {
        title: 'Team Dashboard',
        description: 'Team performance and tasks',
        icon: <Users className="h-8 w-8" />,
        requiredPermissions: ['assessments:read'],
        culturalPattern: false,
        glowEffect: false
      },
      {
        title: 'Risk Overview',
        description: 'Risk management dashboard',
        icon: <AlertTriangle className="h-8 w-8" />,
        requiredPermissions: ['assessments:read'],
        culturalPattern: false,
        glowEffect: false
      }
    ],
    auditor: [
      {
        title: 'Audit Dashboard',
        description: 'Audit findings and reports',
        icon: <Eye className="h-8 w-8" />,
        requiredPermissions: ['audit:read'],
        culturalPattern: false,
        glowEffect: false
      },
      {
        title: 'Evidence Review',
        description: 'Review compliance evidence',
        icon: <Shield className="h-8 w-8" />,
        requiredPermissions: ['evidence:verify'],
        culturalPattern: false,
        glowEffect: false
      }
    ],
    analyst: [
      {
        title: 'Analytics Dashboard',
        description: 'Data analysis and insights',
        icon: <BarChart3 className="h-8 w-8" />,
        requiredPermissions: ['reports:read'],
        culturalPattern: false,
        glowEffect: false
      }
    ],
    user: [
      {
        title: 'My Dashboard',
        description: 'Personal tasks and assignments',
        icon: <Users className="h-8 w-8" />,
        requiredPermissions: ['assessments:read'],
        culturalPattern: false,
        glowEffect: false
      }
    ],
    viewer: [
      {
        title: 'Read-Only Dashboard',
        description: 'View reports and data',
        icon: <Eye className="h-8 w-8" />,
        requiredPermissions: ['reports:read'],
        culturalPattern: false,
        glowEffect: false
      }
    ]
  };

  // Get cards for current role
  const getRoleCards = () => {
    if (isSuperAdmin) {
      return dashboardCards.super_admin;
    }
    
    return dashboardCards[userRole] || dashboardCards.viewer;
  };

  const cards = getRoleCards();

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
      {cards.map((card, index) => (
        <PermissionBasedCard
          key={index}
          title={card.title}
          description={card.description}
          icon={card.icon}
          requiredPermissions={card.requiredPermissions}
          culturalPattern={card.culturalPattern}
          glowEffect={card.glowEffect}
          className="role-dashboard-card"
        />
      ))}
    </div>
  );
};

export default {
  PermissionPageTemplate,
  RoleDashboardCards
};