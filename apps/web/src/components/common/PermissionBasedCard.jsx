/**
 * Permission-Based Advanced Card Component
 * Integrates with RBAC system to show/hide content based on user permissions
 * Features advanced cards with role-based access control
 */

import React from 'react';
import { useRBAC } from '../../hooks/useRBAC';
import { AnimatedCard, CulturalLoadingSpinner, AnimatedButton } from '../Animation/InteractiveAnimationToolkit';
import { Shield } from 'lucide-react';
import { useI18n } from '../../hooks/useI18n';
import { useTheme } from '../theme/ThemeProvider';

/**
 * Permission-Based Advanced Card
 * Shows content only if user has required permissions
 */
export const PermissionBasedCard = ({
  children,
  requiredPermissions = [],
  requiredRole = null,
  requiredFeature = null,
  fallback = null,
  loading = false,
  className = '',
  title,
  description,
  icon,
  actions = [],
  showPermissionIndicator = true,
  culturalPattern = false,
  glowEffect = false,
  variant = 'default',
  requiredPermission, // Add this to filter it out
  ...cardProps
}) => {
  const { 
    hasAllPermissions,
    hasFeature,
    isSuperAdmin,
    userRole
  } = useRBAC();

  // Check permissions
  const hasRequiredPermissions = () => {
    if (loading) return false;
    
    // Super admin bypass
    if (isSuperAdmin) return true;

    // Check role requirement
    if (requiredRole && userRole !== requiredRole) return false;

    // Check feature requirement
    if (requiredFeature && !hasFeature(requiredFeature)) return false;

    // Handle both requiredPermission (single) and requiredPermissions (array)
    const permissionsToCheck = requiredPermission ? [requiredPermission] : requiredPermissions;
    
    // Check permissions
    if (permissionsToCheck.length === 0) return true;
    
    // Check if user has ALL required permissions
    return hasAllPermissions(permissionsToCheck);
  };

  const isAccessible = hasRequiredPermissions();

  // Show loading state
  if (loading) {
    return (
      <AnimatedCard 
        className={`p-6 ${className}`}
        culturalPattern={culturalPattern}
        glowEffect={glowEffect}
        {...cardProps}
      >
        <div className="flex items-center justify-center h-32">
          <CulturalLoadingSpinner className="h-8 w-8" />
        </div>
      </AnimatedCard>
    );
  }

  // Show fallback or nothing if no access
  if (!isAccessible) {
    if (fallback) {
      return <div className={className}>{fallback}</div>;
    }
    return null;
  }

  // Render the card with permission indicator
  return (
    <div className="relative">
      {showPermissionIndicator && variant !== 'minimal' && (
        <div className="absolute -top-2 -right-2 z-10">
          <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-1 rounded-full shadow-lg">
            <Shield className="h-4 w-4" />
          </div>
        </div>
      )}
      
      {variant === 'minimal' ? (
        <div className={`permission-card-minimal ${className}`} {...cardProps}>
          <div className="flex items-center gap-2">
            {icon && (
              <div className="text-blue-600 dark:text-blue-400 text-sm">
                {icon}
              </div>
            )}
            <div className="flex-1 min-w-0">
              {title && (
                <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {title}
                </h4>
              )}
              {description && (
                <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                  {description}
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <AnimatedCard 
          className={`permission-card ${className}`}
          culturalPattern={culturalPattern}
          glowEffect={glowEffect}
          {...cardProps}
        >
          {(title || description || icon) && (
            <div className="card-header mb-4">
              <div className="flex items-center gap-3">
                {icon && (
                  <div className="text-blue-600 dark:text-blue-400">
                    {icon}
                  </div>
                )}
                <div>
                  {title && (
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {title}
                    </h3>
                  )}
                  {description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
          
          <div className="card-content">
            {children}
          </div>
          
          {actions.length > 0 && (
            <div className="card-actions mt-4 flex gap-2">
              {actions.map((action, index) => (
                <PermissionBasedButton
                  key={index}
                  {...action}
                  size="sm"
                />
              ))}
            </div>
          )}
        </AnimatedCard>
      )}
    </div>
  );
};

/**
 * Permission-Based Button
 * Shows button only if user has required permissions
 */
export const PermissionBasedButton = ({
  children,
  requiredPermissions = [],
  requiredRole = null,
  requiredFeature = null,
  fallback = null,
  loading = false,
  variant = 'primary',
  size = 'medium',
  onClick,
  disabled = false,
  className = '',
  culturalStyle = 'modern',
  ...props
}) => {
  const { 
    hasAllPermissions,
    hasFeature,
    isSuperAdmin,
    userRole 
  } = useRBAC();

  // Check permissions
  const hasRequiredPermissions = () => {
    if (loading) return false;
    
    // Super admin bypass
    if (isSuperAdmin) return true;

    // Check role requirement
    if (requiredRole && userRole !== requiredRole) return false;

    // Check feature requirement
    if (requiredFeature && !hasFeature(requiredFeature)) return false;

    // Check permissions
    if (requiredPermissions.length === 0) return true;
    
    // Check if user has ALL required permissions
    return hasAllPermissions(requiredPermissions);
  };

  const isAccessible = hasRequiredPermissions();

  // Show fallback or nothing if no access
  if (!isAccessible) {
    if (fallback) {
      return <span className={className}>{fallback}</span>;
    }
    return null;
  }

  return (
    <AnimatedButton
      variant={variant}
      size={size}
      onClick={onClick}
      disabled={disabled || loading}
      className={className}
      culturalStyle={culturalStyle}
      loading={loading}
      {...props}
    >
      {children}
    </AnimatedButton>
  );
};

/**
 * Permission-Based Content Wrapper
 * Shows content only if user has required permissions
 */
export const PermissionContent = ({
  children,
  requiredPermissions = [],
  requiredRole = null,
  requiredFeature = null,
  fallback = null,
  loading = false,
  className = ''
}) => {
  const { 
    hasPermission, 
    hasAnyPermission, 
    hasAllPermissions,
    hasFeature,
    isSuperAdmin,
    userRole 
  } = useRBAC();

  // Check permissions
  const hasRequiredPermissions = () => {
    if (loading) return false;
    
    // Super admin bypass
    if (isSuperAdmin) return true;

    // Check role requirement
    if (requiredRole && userRole !== requiredRole) return false;

    // Check feature requirement
    if (requiredFeature && !hasFeature(requiredFeature)) return false;

    // Check permissions
    if (requiredPermissions.length === 0) return true;
    
    // Check if user has ALL required permissions
    return hasAllPermissions(requiredPermissions);
  };

  const isAccessible = hasRequiredPermissions();

  // Show fallback or nothing if no access
  if (!isAccessible) {
    if (fallback) {
      return <div className={className}>{fallback}</div>;
    }
    return null;
  }

  return <div className={className}>{children}</div>;
};

/**
 * Role-Based Card Visibility
 * Shows different cards based on user role
 */
export const RoleBasedCards = ({
  roleCards = {},
  defaultCard = null,
  className = ''
}) => {
  const { userRole } = useRBAC();

  // Find the appropriate card for the user's role
  const getRoleCard = () => {
    // Check for exact role match
    if (roleCards[userRole]) {
      return roleCards[userRole];
    }

    // Check for default card
    if (defaultCard) {
      return defaultCard;
    }

    // Return null if no matching card found
    return null;
  };

  const cardToRender = getRoleCard();

  if (!cardToRender) {
    return null;
  }

  return (
    <div className={className}>
      {cardToRender}
    </div>
  );
};

/**
 * Role-Based Dashboard Cards
 * Shows different card layouts based on user role
 */
export const RoleDashboardCards = ({ data, loading = false }) => {
  const { userRole } = useRBAC();
  const { t } = useI18n();
  const { isDark } = useTheme();

  if (loading) {
    return <CulturalLoadingSpinner />;
  }

  const renderKpiCard = (key, kpi, icon) => {
    const Icon = icon;
    return (
      <AnimatedCard
        key={key}
        className={`p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg border`}
      >
        <div className="flex items-center justify-between mb-4">
          <Icon className="w-8 h-8 text-blue-600" />
          <span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {kpi?.value || '0'}
          </span>
        </div>
        <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {t(`dashboard.${key}`)}
        </h3>
        <p className="text-sm text-gray-500 mt-2">
          {kpi?.trend === 'up' ? '↗️' : kpi?.trend === 'down' ? '↘️' : '➡️'} {kpi?.delta || '0%'}
        </p>
      </AnimatedCard>
    );
  };

  // Show different cards based on role
  const getCardsForRole = () => {
    const baseCards = [];
    
    if (data?.kpis) {
      baseCards.push(
        renderKpiCard('compliance', data.kpis.compliance, BarChart3),
        renderKpiCard('riskHotspots', data.kpis.riskHotspots, AlertTriangle)
      );
    }

    // Admin and Super Admin see all cards
    if (hasPermission('dashboard.view_all')) {
      if (data?.kpis) {
        baseCards.push(
          renderKpiCard('openGaps', data.kpis.openGaps, TrendingUp),
          renderKpiCard('activeAssessments', data.kpis.activeAssessments, Activity)
        );
      }
    }

    return baseCards;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {getCardsForRole()}
    </div>
  );
};

export default {
  PermissionBasedCard,
  PermissionBasedButton,
  PermissionContent,
  RoleBasedCards,
  RoleDashboardCards
};