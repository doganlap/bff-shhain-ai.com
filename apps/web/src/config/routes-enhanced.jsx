/**
 * Enhanced Route Configuration with All Dashboard Variants
 * Complete registration of all 36+ pages with BFF data service integration
 */

import React from 'react';
import { Navigate } from 'react-router-dom';

// Layouts
import AppLayout from '../components/layout/AppLayout';
import AdvancedAppShell from '../components/layout/AdvancedAppShell';
import ProtectedRoute from '../components/auth/ProtectedRoute';

// Essential Pages
import SimpleLoginPage from '../pages/auth/SimpleLoginPage.jsx';
import NotFoundPage from '../pages/public/NotFoundPage';
import POCPage from '../pages/public/POCPage';
import PocRequest from '../pages/poc/PocRequest';
import PocLanding from '../pages/poc/PocLanding';

// ===== DASHBOARD VARIANTS (5 pages) =====
import AdvancedGRCDashboard from '../components/AdvancedGRCDashboard';
import EnhancedDashboardV2 from '../pages/dashboard/EnhancedDashboardV2';
import RegulatoryMarketDashboard from '../pages/dashboard/RegulatoryMarketDashboard';
import UsageDashboardPage from '../pages/dashboard/UsageDashboardPage';
import DBIDashboardPage from '../pages/dashboard/DBIDashboardPage';

// ===== ASSESSMENT PAGES (3 pages) =====
import AdvancedAssessmentManager from '../components/AdvancedAssessmentManager';
import AssessmentPage from '../pages/assessments/AssessmentPage';
import AssessmentDetailsCollaborative from '../pages/assessments/AssessmentDetailsCollaborative';

// ===== RISK MANAGEMENT (2 pages) =====
import RiskManagementModuleV2 from '../pages/risk/RiskManagementModuleV2';

// ===== SYSTEM MANAGEMENT (6 pages) =====
import AISchedulerPage from '../pages/system/AISchedulerPage';
import APIManagementPage from '../pages/system/APIManagementPage';
import PerformanceMonitorPage from '../pages/system/PerformanceMonitorPage';
import RAGServicePage from '../pages/system/RAGServicePage';
import SystemHealthDashboard from '../pages/system/SystemHealthDashboard';
import WorkflowManagementPage from '../pages/system/WorkflowManagementPage';

// ===== TASK MANAGEMENT (2 pages) =====
import TaskDashboard from '../pages/tasks/TaskDashboard';
import TaskManagementPage from '../pages/tasks/TaskManagementPage';

// ===== EVIDENCE & DOCUMENTS (2 pages) =====
import EvidenceUploadPage from '../pages/evidence/EvidenceUploadPage';
import DocumentManagementPage from '../pages/documents/DocumentManagementPage';

// ===== EXISTING REGISTERED PAGES =====
import ControlsModuleEnhanced from '../pages/grc-modules/ControlsModuleEnhanced';
import OrganizationsPage from '../pages/organizations/OrganizationsPage';
import OrganizationDetails from '../pages/organizations/OrganizationDetails';
import OrganizationForm from '../pages/organizations/OrganizationForm';
import SectorIntelligence from '../pages/regulatory/SectorIntelligence';
import RegulatorsPage from '../pages/regulatory/RegulatorsPage';
import ReportsPage from '../pages/reports/ReportsPage';
import DatabasePage from '../pages/system/DatabasePage';
import SettingsPage from '../pages/system/SettingsPage';
import UserManagementPage from '../pages/system/UserManagementPage';
import UniversalTableViewer from '../components/UniversalTableViewer';
import KSAGRCPage from '../pages/regulatory/KSAGRCPage';

/**
 * Enhanced Route Configuration
 * All 36+ pages properly registered with BFF data service integration
 */
export const enhancedRouteConfig = {
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
    {
      path: '/poc',
      element: <POCPage />,
      title: 'Proof of Concept',
      public: true
    },
    {
      path: '/poc/request',
      element: <PocRequest />,
      title: 'POC Request',
      public: true
    },
    {
      path: '/poc/landing',
      element: <PocLanding />,
      title: 'POC Landing',
      public: true
    },
  ],

  // Advanced Dashboard Routes - Modern shell layout
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
          title: 'Dashboard',
          permission: 'read',
          dataEndpoint: '/api/dashboard/stats'
        },
        {
          path: 'dashboard/enhanced',
          element: <EnhancedDashboardV2 />,
          title: 'Enhanced Dashboard',
          permission: 'read',
          dataEndpoint: '/api/dashboard/kpis'
        },
        {
          path: 'dashboard/regulatory',
          element: <RegulatoryMarketDashboard />,
          title: 'Regulatory Dashboard',
          permission: 'read',
          dataEndpoint: '/api/dashboard/regulatory'
        },
        {
          path: 'dashboard/usage',
          element: <UsageDashboardPage />,
          title: 'Usage Dashboard',
          permission: 'read',
          dataEndpoint: '/api/dashboard/usage'
        },
        {
          path: 'dashboard/dbi',
          element: <DBIDashboardPage />,
          title: 'DBI Dashboard',
          permission: 'read',
          dataEndpoint: '/api/dashboard/intelligence'
        }
      ]
    }
  ],

  // Main Application Routes - Standard app layout
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
        // Dashboard
        {
          path: '',
          element: <AdvancedGRCDashboard />,
          title: 'Dashboard',
          permission: 'read',
          dataEndpoint: '/api/dashboard/stats'
        },

        // Assessments Module
        {
          path: 'assessments',
          element: <AdvancedAssessmentManager />,
          title: 'Assessments',
          permission: 'read',
          dataEndpoint: '/api/assessments'
        },
        {
          path: 'assessments/new',
          element: <AdvancedAssessmentManager />,
          title: 'New Assessment',
          permission: 'write',
          dataEndpoint: '/api/assessments/create'
        },
        {
          path: 'assessments/classic',
          element: <AssessmentPage />,
          title: 'Classic Assessment',
          permission: 'read',
          dataEndpoint: '/api/assessments/list'
        },
        {
          path: 'assessments/collaborative/:id',
          element: <AssessmentDetailsCollaborative />,
          title: 'Collaborative Assessment',
          permission: 'read',
          dataEndpoint: '/api/assessments/details'
        },

        // Frameworks Module
        {
          path: 'frameworks',
          element: <AdvancedFrameworkManager />,
          title: 'Frameworks',
          permission: 'read',
          dataEndpoint: '/api/frameworks'
        },

        // Controls Module
        {
          path: 'controls',
          element: <ControlsModuleEnhanced />,
          title: 'Controls',
          permission: 'read',
          dataEndpoint: '/api/controls'
        },

        // Risk Management
        {
          path: 'risks',
          element: <RiskManagementModuleV2 />,
          title: 'Risk Management',
          permission: 'read',
          dataEndpoint: '/api/risks'
        },

        // Organizations
        {
          path: 'organizations',
          element: (
            <ProtectedRoute requiredPermission="write">
              <OrganizationsPage />
            </ProtectedRoute>
          ),
          title: 'Organizations',
          permission: 'write',
          dataEndpoint: '/api/organizations'
        },
        {
          path: 'organizations/new',
          element: (
            <ProtectedRoute requiredPermission="write">
              <OrganizationForm />
            </ProtectedRoute>
          ),
          title: 'New Organization',
          permission: 'write',
          dataEndpoint: '/api/organizations/create'
        },
        {
          path: 'organizations/:id',
          element: (
            <ProtectedRoute requiredPermission="read">
              <OrganizationDetails />
            </ProtectedRoute>
          ),
          title: 'Organization Details',
          permission: 'read',
          dataEndpoint: '/api/organizations/details'
        },
        {
          path: 'organizations/:id/edit',
          element: (
            <ProtectedRoute requiredPermission="write">
              <OrganizationForm />
            </ProtectedRoute>
          ),
          title: 'Edit Organization',
          permission: 'write',
          dataEndpoint: '/api/organizations/update'
        },

        // Sector Intelligence
        {
          path: 'sector-intelligence',
          element: (
            <ProtectedRoute requiredPermission="read">
              <SectorIntelligence />
            </ProtectedRoute>
          ),
          title: 'Sector Intelligence',
          permission: 'read',
          dataEndpoint: '/api/sector-intelligence'
        },

        // Regulators
        {
          path: 'regulators',
          element: <RegulatorsPage />,
          title: 'Regulators',
          permission: 'read',
          dataEndpoint: '/api/regulators'
        },

        // KSA GRC
        {
          path: 'ksa-grc',
          element: <KSAGRCPage />,
          title: 'KSA GRC',
          permission: 'read',
          dataEndpoint: '/api/ksa-grc'
        },

        // Reports
        {
          path: 'reports',
          element: (
            <ProtectedRoute requiredPermission="reports.export">
              <ReportsPage />
            </ProtectedRoute>
          ),
          title: 'Reports',
          permission: 'reports.export',
          dataEndpoint: '/api/reports'
        },

        // System Management
        {
          path: 'system/health',
          element: (
            <ProtectedRoute requiredPermission="admin">
              <SystemHealthDashboard />
            </ProtectedRoute>
          ),
          title: 'System Health',
          permission: 'admin',
          dataEndpoint: '/api/system/health'
        },
        {
          path: 'system/ai-scheduler',
          element: (
            <ProtectedRoute requiredPermission="admin">
              <AISchedulerPage />
            </ProtectedRoute>
          ),
          title: 'AI Scheduler',
          permission: 'admin',
          dataEndpoint: '/api/ai/scheduler'
        },
        {
          path: 'system/api-management',
          element: (
            <ProtectedRoute requiredPermission="admin">
              <APIManagementPage />
            </ProtectedRoute>
          ),
          title: 'API Management',
          permission: 'admin',
          dataEndpoint: '/api/system/api-management'
        },
        {
          path: 'system/performance',
          element: (
            <ProtectedRoute requiredPermission="admin">
              <PerformanceMonitorPage />
            </ProtectedRoute>
          ),
          title: 'Performance Monitor',
          permission: 'admin',
          dataEndpoint: '/api/system/performance'
        },
        {
          path: 'system/rag-service',
          element: (
            <ProtectedRoute requiredPermission="admin">
              <RAGServicePage />
            </ProtectedRoute>
          ),
          title: 'RAG Service',
          permission: 'admin',
          dataEndpoint: '/api/rag/service'
        },
        {
          path: 'system/workflows',
          element: (
            <ProtectedRoute requiredPermission="admin">
              <WorkflowManagementPage />
            </ProtectedRoute>
          ),
          title: 'Workflows',
          permission: 'admin',
          dataEndpoint: '/api/workflows'
        },

        // Task Management
        {
          path: 'tasks',
          element: (
            <ProtectedRoute requiredPermission="tasks:read">
              <TaskDashboard />
            </ProtectedRoute>
          ),
          title: 'Task Dashboard',
          permission: 'tasks:read',
          dataEndpoint: '/api/tasks/dashboard'
        },
        {
          path: 'tasks/management',
          element: (
            <ProtectedRoute requiredPermission="tasks:write">
              <TaskManagementPage />
            </ProtectedRoute>
          ),
          title: 'Task Management',
          permission: 'tasks:write',
          dataEndpoint: '/api/tasks'
        },

        // Evidence & Documents
        {
          path: 'evidence',
          element: (
            <ProtectedRoute requiredPermission="evidence:read">
              <EvidenceUploadPage />
            </ProtectedRoute>
          ),
          title: 'Evidence Upload',
          permission: 'evidence:read',
          dataEndpoint: '/api/evidence'
        },
        {
          path: 'documents',
          element: (
            <ProtectedRoute requiredPermission="documents:read">
              <DocumentManagementPage />
            </ProtectedRoute>
          ),
          title: 'Documents',
          permission: 'documents:read',
          dataEndpoint: '/api/documents'
        },

        // Users & Access Management
        {
          path: 'users',
          element: (
            <ProtectedRoute requiredPermission="users:read">
              <UserManagementPage />
            </ProtectedRoute>
          ),
          title: 'Users',
          permission: 'users:read',
          dataEndpoint: '/api/users'
        },

        // Database & System
        {
          path: 'database',
          element: (
            <ProtectedRoute requiredPermission="admin">
              <DatabasePage />
            </ProtectedRoute>
          ),
          title: 'Database',
          permission: 'admin',
          dataEndpoint: '/api/database'
        },
        {
          path: 'settings',
          element: (
            <ProtectedRoute requiredPermission="write">
              <SettingsPage />
            </ProtectedRoute>
          ),
          title: 'Settings',
          permission: 'write',
          dataEndpoint: '/api/settings'
        },

        // Table Viewer - Universal data access
        {
          path: 'tables/:tableName',
          element: (
            <ProtectedRoute requiredPermission="tables:view">
              <UniversalTableViewer />
            </ProtectedRoute>
          ),
          title: 'Table Viewer',
          permission: 'tables:view',
          dataEndpoint: '/api/tables/data'
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
 * Get all enhanced routes as flat array for React Router
 */
export const getEnhancedRoutes = () => {
  const routes = [];

  // Add public routes
  enhancedRouteConfig.public.forEach(route => {
    routes.push({
      path: route.path,
      element: route.element,
      title: route.title
    });
  });

  // Add advanced routes with children
  enhancedRouteConfig.advanced.forEach(route => {
    routes.push({
      path: route.path,
      element: route.element,
      title: route.title,
      children: route.children?.map(child => ({
        path: child.path,
        element: child.element,
        title: child.title,
        permission: child.permission,
        dataEndpoint: child.dataEndpoint
      }))
    });
  });

  // Add app routes with children
  enhancedRouteConfig.app.forEach(route => {
    routes.push({
      path: route.path,
      element: route.element,
      title: route.title,
      children: route.children?.map(child => ({
        path: child.path,
        element: child.element,
        title: child.title,
        permission: child.permission,
        dataEndpoint: child.dataEndpoint
      }))
    });
  });

  // Add fallback routes
  enhancedRouteConfig.fallback.forEach(route => {
    routes.push({
      path: route.path,
      element: route.element,
      title: route.title
    });
  });

  return routes;
};

/**
 * Get navigation items for menu generation with proper grouping
 */
export const getEnhancedNavigation = (userRole, userPermissions) => {
  const navigation = [];
  
  // Public navigation (for logged out users)
  if (!userRole) {
    return [
      { name: 'Login', path: '/login', icon: 'login' },
      { name: 'POC', path: '/poc', icon: 'experiment' }
    ];
  }
  
  // Dashboard Group
  const dashboardGroup = {
    name: 'Dashboard',
    icon: 'dashboard',
    items: [
      { name: 'Main Dashboard', path: '/app', icon: 'home', permission: 'read' },
      { name: 'Enhanced Dashboard', path: '/advanced/dashboard/enhanced', icon: 'chart-bar', permission: 'read' },
      { name: 'Regulatory Dashboard', path: '/advanced/dashboard/regulatory', icon: 'shield', permission: 'read' },
      { name: 'Usage Dashboard', path: '/advanced/dashboard/usage', icon: 'activity', permission: 'read' },
      { name: 'DBI Dashboard', path: '/advanced/dashboard/dbi', icon: 'brain', permission: 'read' }
    ].filter(item => hasPermission(userPermissions, item.permission))
  };
  
  // GRC Management Group
  const grcGroup = {
    name: 'GRC Management',
    icon: 'shield',
    items: [
      { name: 'Assessments', path: '/app/assessments', icon: 'clipboard-check', permission: 'read' },
      { name: 'Frameworks', path: '/app/frameworks', icon: 'layers', permission: 'read' },
      { name: 'Controls', path: '/app/controls', icon: 'toggle-left', permission: 'read' },
      { name: 'Risk Management', path: '/app/risks', icon: 'alert-triangle', permission: 'read' }
    ].filter(item => hasPermission(userPermissions, item.permission))
  };
  
  // Organization Management Group
  const orgGroup = {
    name: 'Organization',
    icon: 'building',
    items: [
      { name: 'Organizations', path: '/app/organizations', icon: 'building', permission: 'write' },
      { name: 'Sector Intelligence', path: '/app/sector-intelligence', icon: 'trending-up', permission: 'read' },
      { name: 'Regulators', path: '/app/regulators', icon: 'gavel', permission: 'read' },
      { name: 'KSA GRC', path: '/app/ksa-grc', icon: 'flag', permission: 'read' }
    ].filter(item => hasPermission(userPermissions, item.permission))
  };
  
  // Task & Evidence Group
  const taskGroup = {
    name: 'Tasks & Evidence',
    icon: 'check-square',
    items: [
      { name: 'Task Dashboard', path: '/app/tasks', icon: 'layout-dashboard', permission: 'tasks:read' },
      { name: 'Task Management', path: '/app/tasks/management', icon: 'list-check', permission: 'tasks:write' },
      { name: 'Evidence Upload', path: '/app/evidence', icon: 'upload', permission: 'evidence:read' },
      { name: 'Documents', path: '/app/documents', icon: 'file-text', permission: 'documents:read' }
    ].filter(item => hasPermission(userPermissions, item.permission))
  };
  
  // Reports Group
  const reportsGroup = {
    name: 'Reports',
    icon: 'file-bar-chart',
    items: [
      { name: 'Reports', path: '/app/reports', icon: 'file-text', permission: 'reports.export' }
    ].filter(item => hasPermission(userPermissions, item.permission))
  };
  
  // System Administration Group
  const adminGroup = {
    name: 'System Admin',
    icon: 'settings',
    items: [
      { name: 'Users', path: '/app/users', icon: 'users', permission: 'users:read' },
      { name: 'System Health', path: '/app/system/health', icon: 'heart-pulse', permission: 'admin' },
      { name: 'AI Scheduler', path: '/app/system/ai-scheduler', icon: 'brain', permission: 'admin' },
      { name: 'API Management', path: '/app/system/api-management', icon: 'api', permission: 'admin' },
      { name: 'Performance Monitor', path: '/app/system/performance', icon: 'activity', permission: 'admin' },
      { name: 'RAG Service', path: '/app/system/rag-service', icon: 'message-square', permission: 'admin' },
      { name: 'Workflows', path: '/app/system/workflows', icon: 'git-branch', permission: 'admin' },
      { name: 'Database', path: '/app/database', icon: 'database', permission: 'admin' },
      { name: 'Settings', path: '/app/settings', icon: 'settings', permission: 'write' },
      { name: 'Table Viewer', path: '/app/tables/users', icon: 'table', permission: 'tables:view' }
    ].filter(item => hasPermission(userPermissions, item.permission))
  };
  
  // Build navigation based on user permissions
  navigation.push(dashboardGroup);
  navigation.push(grcGroup);
  navigation.push(orgGroup);
  navigation.push(taskGroup);
  navigation.push(reportsGroup);
  navigation.push(adminGroup);
  
  return navigation.filter(group => group.items.length > 0);
};

/**
 * Helper function to check permissions
 */
function hasPermission(userPermissions, requiredPermission) {
  if (!requiredPermission) return true;
  if (!userPermissions) return false;
  
  // Handle wildcard permissions
  if (userPermissions.includes('*')) return true;
  
  // Check specific permission
  return userPermissions.includes(requiredPermission);
}