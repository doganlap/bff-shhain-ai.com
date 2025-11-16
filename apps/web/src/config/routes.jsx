/**
 * Unified Route Configuration
 * Single source of truth for all application routes
 */

import React from 'react';
import { Navigate } from 'react-router-dom';

// Layouts
import AppLayout from '../components/layout/AppLayout';
import AdvancedAppShell from '../components/layout/AdvancedAppShell';
import ProtectedRoute from '../components/auth/ProtectedRoute';

// Pages
 
import SimpleLoginPage from '../pages/auth/SimpleLoginPage.jsx';
import NotFoundPage from '../pages/public/NotFoundPage';

// Dashboard & Main Pages
import AdvancedGRCDashboard from '../components/AdvancedGRCDashboard';
import AdvancedAssessmentManager from '../components/AdvancedAssessmentManager';
import AdvancedFrameworkManager from '../components/AdvancedFrameworkManager';

// Feature Pages
import ControlsModuleEnhanced from '../pages/grc-modules/ControlsModuleEnhanced';
import OrganizationsPage from '../pages/organizations/OrganizationsPage';
import OrganizationDetails from '../pages/organizations/OrganizationDetails';
import OrganizationForm from '../pages/organizations/OrganizationForm';
import SectorIntelligence from '../pages/regulatory/SectorIntelligence';
import RegulatorsPage from '../pages/regulatory/RegulatorsPage';
import ReportsPage from '../pages/reports/ReportsPage';
import DatabasePage from '../pages/system/DatabasePage';
import SettingsPage from '../pages/system/SettingsPage';
 
import KSAGRCPage from '../pages/regulatory/KSAGRCPage';

/**
 * Route Configuration
 * Defines all routes with their paths, components, and protection requirements
 */
export const routeConfig = {
  // Public Routes
  public: [
    {
      path: '/',
      element: <Navigate to="/login" replace />,
      title: 'Home',
      public: true
    },
    {
      path: '/login',
      element: <SimpleLoginPage />,
      title: 'Login',
      public: true
    },
  ],

  // Protected Routes - Advanced Shell
  advanced: [
    {
      path: '/advanced',
      element: (
        <ProtectedRoute>
          <AdvancedAppShell />
        </ProtectedRoute>
      ),
      title: 'Advanced Dashboard',
      layout: 'advanced',
      children: [
        {
          path: '',
          element: <AdvancedGRCDashboard />,
          title: 'Dashboard'
        },
        {
          path: 'assessments',
          element: <AdvancedAssessmentManager />,
          title: 'Assessments'
        },
        {
          path: 'frameworks',
          element: <AdvancedFrameworkManager />,
          title: 'Frameworks'
        }
      ]
    }
  ],

  // Protected Routes - Standard App Layout
  app: [
    {
      path: '/app',
      element: (
        <ProtectedRoute>
          <AppLayout />
        </ProtectedRoute>
      ),
      title: 'Application',
      layout: 'app',
      children: [
        {
          path: '',
          element: <AdvancedGRCDashboard />,
          title: 'Dashboard',
          permission: 'read'
        },
        {
          path: 'assessments',
          element: <AdvancedAssessmentManager />,
          title: 'Assessments',
          permission: 'read'
        },
        {
          path: 'assessments/new',
          element: <AdvancedAssessmentManager />,
          title: 'New Assessment',
          permission: 'write'
        },
        {
          path: 'frameworks',
          element: <AdvancedFrameworkManager />,
          title: 'Frameworks',
          permission: 'read'
        },
        {
          path: 'controls',
          element: <ControlsModuleEnhanced />,
          title: 'Controls',
          permission: 'read'
        },
        {
          path: 'organizations',
          element: (
            <ProtectedRoute requiredPermission="write">
              <OrganizationsPage />
            </ProtectedRoute>
          ),
          title: 'Organizations',
          permission: 'write'
        },
        {
          path: 'organizations/new',
          element: (
            <ProtectedRoute requiredPermission="write">
              <OrganizationForm />
            </ProtectedRoute>
          ),
          title: 'New Organization',
          permission: 'write'
        },
        {
          path: 'organizations/:id',
          element: (
            <ProtectedRoute requiredPermission="read">
              <OrganizationDetails />
            </ProtectedRoute>
          ),
          title: 'Organization Details',
          permission: 'read'
        },
        {
          path: 'organizations/:id/edit',
          element: (
            <ProtectedRoute requiredPermission="write">
              <OrganizationForm />
            </ProtectedRoute>
          ),
          title: 'Edit Organization',
          permission: 'write'
        },
        {
          path: 'sector-intelligence',
          element: (
            <ProtectedRoute requiredPermission="read">
              <SectorIntelligence />
            </ProtectedRoute>
          ),
          title: 'Sector Intelligence',
          permission: 'read'
        },
        {
          path: 'regulators',
          element: <RegulatorsPage />,
          title: 'Regulators',
          permission: 'read'
        },
        {
          path: 'reports',
          element: (
            <ProtectedRoute requiredPermission="reports.export">
              <ReportsPage />
            </ProtectedRoute>
          ),
          title: 'Reports',
          permission: 'reports.export'
        },
        {
          path: 'database',
          element: (
            <ProtectedRoute requiredPermission="admin">
              <DatabasePage />
            </ProtectedRoute>
          ),
          title: 'Database',
          permission: 'admin'
        },
        {
          path: 'settings',
          element: (
            <ProtectedRoute requiredPermission="write">
              <SettingsPage />
            </ProtectedRoute>
          ),
          title: 'Settings',
          permission: 'write'
        },
        {
          path: 'components-demo',
          element: <div />,
          title: 'Components Demo',
          permission: 'read'
        },
        {
          path: 'ksa-grc',
          element: <KSAGRCPage />,
          title: 'KSA GRC',
          permission: 'read'
        }
      ]
    }
  ],

  // Fallback Routes
  fallback: [
    {
      path: '/404',
      element: <NotFoundPage />,
      title: 'Not Found'
    },
    {
      path: '*',
      element: <Navigate to="/404" replace />,
      title: 'Not Found'
    }
  ]
};

/**
 * Get all routes as flat array for React Router
 */
export const getAllRoutes = () => {
  const routes = [];

  // Add public routes
  routeConfig.public.forEach(route => {
    routes.push({
      path: route.path,
      element: route.element,
      title: route.title
    });
  });

  // Add advanced routes
  routeConfig.advanced.forEach(route => {
    routes.push({
      path: route.path,
      element: route.element,
      title: route.title
    });
  });

  // Add app routes with children
  routeConfig.app.forEach(route => {
    routes.push({
      path: route.path,
      element: route.element,
      title: route.title,
      children: route.children?.map(child => ({
        path: child.path,
        element: child.element,
        title: child.title,
        permission: child.permission
      }))
    });
  });

  // Add fallback routes
  routeConfig.fallback.forEach(route => {
    routes.push({
      path: route.path,
      element: route.element,
      title: route.title
    });
  });

  return routes;
};

/**
 * Get routes by layout type
 */
export const getRoutesByLayout = (layoutType) => {
  switch (layoutType) {
    case 'public':
      return routeConfig.public;
    case 'advanced':
      return routeConfig.advanced;
    case 'app':
      return routeConfig.app;
    default:
      return [];
  }
};

/**
 * Get route by path
 */
export const getRouteByPath = (path) => {
  const allRoutes = [
    ...routeConfig.public,
    ...routeConfig.advanced,
    ...routeConfig.app,
    ...routeConfig.fallback
  ];

  return allRoutes.find(route => route.path === path);
};

/**
 * Check if route requires authentication
 */
export const isRouteProtected = (path) => {
  const route = getRouteByPath(path);
  return route && !route.public;
};

/**
 * Get required permission for route
 */
export const getRoutePermission = (path) => {
  const route = getRouteByPath(path);
  if (route?.children) {
    const childRoute = route.children.find(child => 
      path.includes(child.path)
    );
    return childRoute?.permission;
  }
  return route?.permission;
};

