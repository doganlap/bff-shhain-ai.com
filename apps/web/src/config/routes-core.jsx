/**
 * Core Route Configuration - Simplified Version
 * Only essential pages for login, POC, and basic functionality
 */

import React from 'react';
import { Navigate } from 'react-router-dom';

// Layouts
import AppLayout from '../components/layout/AppLayout';
import ProtectedRoute from '../components/auth/ProtectedRoute';

// Essential Pages
import SimpleLoginPage from '../pages/auth/SimpleLoginPage.jsx';
import NotFoundPage from '../pages/public/NotFoundPage';
 

// Core Dashboard
import AdvancedGRCDashboard from '../components/AdvancedGRCDashboard';

// Basic User Management
import UserManagementPage from '../pages/system/UserManagementPage';

// Table Viewer (already integrated)
import UniversalTableViewer from '../components/UniversalTableViewer';

/**
 * Core Route Configuration
 * Minimal set of routes for essential functionality
 */
export const coreRouteConfig = {
  // Public Routes - No authentication required
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

  // Protected Routes - Require authentication
  protected: [
    {
      path: '/app',
      element: (
        <ProtectedRoute>
          <AppLayout />
        </ProtectedRoute>
      ),
      title: 'Application',
      children: [
        // Dashboard - Default page after login
        {
          path: '',
          element: <AdvancedGRCDashboard />,
          title: 'Dashboard',
          permission: 'read'
        },
        
        // User Management
        {
          path: 'users',
          element: (
            <ProtectedRoute requiredPermission="users:read">
              <UserManagementPage />
            </ProtectedRoute>
          ),
          title: 'Users',
          permission: 'users:read'
        },
        
        // Table Viewer - For admin access to data
        {
          path: 'tables/:tableName',
          element: (
            <ProtectedRoute requiredPermission="tables:view">
              <UniversalTableViewer />
            </ProtectedRoute>
          ),
          title: 'Table Viewer',
          permission: 'tables:view'
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
 * Get all core routes as flat array for React Router
 */
export const getCoreRoutes = () => {
  const routes = [];

  // Add public routes
  coreRouteConfig.public.forEach(route => {
    routes.push({
      path: route.path,
      element: route.element,
      title: route.title
    });
  });

  // Add protected routes with children
  coreRouteConfig.protected.forEach(route => {
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
  coreRouteConfig.fallback.forEach(route => {
    routes.push({
      path: route.path,
      element: route.element,
      title: route.title
    });
  });

  return routes;
};

/**
 * Get navigation items for menu generation
 */
export const getCoreNavigation = (userRole) => {
  const navigation = [];
  
  // Add public navigation items (for logged out users)
  if (!userRole) {
    return [
      { name: 'Login', path: '/login', icon: 'login' }
    ];
  }
  
  // Add protected navigation items (for logged in users)
  coreRouteConfig.protected.forEach(route => {
    if (route.children) {
      route.children.forEach(child => {
        if (child.path) { // Skip the default route
          navigation.push({
            name: child.title,
            path: `/app/${child.path}`,
            icon: getIconForPage(child.title),
            permission: child.permission
          });
        }
      });
    }
  });
  
  return navigation;
};

/**
 * Helper function to get icons for pages
 */
function getIconForPage(title) {
  const iconMap = {
    'Dashboard': 'dashboard',
    'Users': 'users',
    'Table Viewer': 'table'
  };
  return iconMap[title] || 'file-text';
}