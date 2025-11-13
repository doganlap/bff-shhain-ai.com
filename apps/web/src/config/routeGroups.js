/**
 * Route Groups Configuration
 *
 * Organizes 39+ pages into logical groups:
 * 1. Authentication & Public
 * 2. Administration & System
 * 3. Main GRC Features
 */

export const ROUTE_GROUPS = {
  // ============================================================================
  // GROUP 1: AUTHENTICATION & PUBLIC (Priority 1)
  // ============================================================================
  AUTH: {
    id: 'auth',
    name: 'Authentication',
    order: 1,
    routes: [
      { path: '/login', name: 'Login', component: 'GlassmorphismLoginPage' },
      { path: '/register', name: 'Register', component: 'StoryDrivenRegistration' },
      { path: '/landing', name: 'Landing', component: 'LandingPage' },
      { path: '/demo', name: 'Demo', component: 'DemoPage' },
    ]
  },

  // ============================================================================
  // GROUP 2: ADMINISTRATION & SYSTEM MANAGEMENT (Priority 2)
  // ============================================================================
  ADMIN: {
    id: 'admin',
    name: 'Administration',
    order: 2,
    routes: [
      // User & Access Management
      { path: '/app/users', name: 'Users', component: 'UsersPage', permission: 'users:read' },
      { path: '/app/organizations', name: 'Organizations', component: 'OrganizationsPage', permission: 'organizations:read' },
      { path: '/app/organizations/:id', name: 'Organization Details', component: 'OrganizationDetailsPage' },
      { path: '/app/organizations/new', name: 'New Organization', component: 'OrganizationFormPage' },
      { path: '/app/organizations/list', name: 'Organizations List', component: 'OrganizationsListPage' },

      // System Configuration
      { path: '/app/settings', name: 'Settings', component: 'SettingsPage', permission: 'settings:read' },
      { path: '/app/database', name: 'Database', component: 'DatabasePage', permission: 'database:read' },
      { path: '/app/performance', name: 'Performance', component: 'PerformancePage', permission: 'performance:read' },
      { path: '/app/api-management', name: 'API Management', component: 'APIManagementPage', permission: 'api:read' },

      // System Monitoring
      { path: '/app/audit-logs', name: 'Audit Logs', component: 'AuditLogsPage', permission: 'audit:read' },
      { path: '/app/notifications', name: 'Notifications', component: 'NotificationManagementPage', permission: 'notifications:read' },

      // Platform & MSP
      { path: '/platform/licenses', name: 'Licenses', component: 'LicensePage', permission: 'licenses:read' },
      { path: '/platform/renewals', name: 'Renewals', component: 'RenewalsPipelinePage', permission: 'renewals:read' },
      { path: '/platform/usage', name: 'Usage', component: 'UsageDashboardPage', permission: 'usage:read' },
      { path: '/platform/upgrade', name: 'Upgrade', component: 'UpgradePage', permission: 'upgrade:read' },
    ]
  },

  // ============================================================================
  // GROUP 3: MAIN GRC FEATURES (Priority 3)
  // ============================================================================
  GRC_CORE: {
    id: 'grc-core',
    name: 'GRC Core Features',
    order: 3,
    subGroups: {
      // 3.1: Dashboards
      DASHBOARDS: {
        id: 'dashboards',
        name: 'Dashboards',
        routes: [
          { path: '/app/dashboard/legacy', name: 'Legacy Dashboard', component: 'Dashboard' },
          { path: '/app/dashboard', name: 'Enhanced Dashboard', component: 'EnhancedDashboard' },
          { path: '/app/dashboard/advanced', name: 'Advanced Dashboard', component: 'AdvancedDashboardPage' },
          { path: '/app/dashboard/tenant', name: 'Tenant Dashboard', component: 'TenantDashboardPage' },
          { path: '/app/dashboard/regulatory-market', name: 'Regulatory Market', component: 'RegulatoryMarketDashboard' },
          { path: '/platform/advanced-dashboard', name: 'Modern Dashboard', component: 'ModernAdvancedDashboard' },
        ]
      },

      // 3.2: Governance
      GOVERNANCE: {
        id: 'governance',
        name: 'Governance',
        routes: [
          { path: '/app/frameworks', name: 'Frameworks', component: 'AdvancedFrameworkManager', permission: 'frameworks:read' },
          { path: '/advanced/frameworks', name: 'Advanced Frameworks', component: 'AdvancedFrameworkManager' },
          { path: '/app/regulators', name: 'Regulators', component: 'RegulatorsPage', permission: 'regulators:read' },
        ]
      },

      // 3.3: Risk Management
      RISK: {
        id: 'risk',
        name: 'Risk Management',
        routes: [
          { path: '/app/risks', name: 'Risks', component: 'RiskManagementModuleEnhanced', permission: 'risks:read' },
          { path: '/app/risks/legacy', name: 'Legacy Risks', component: 'RiskManagementModule' },
          { path: '/app/risks/list', name: 'Risks List', component: 'RisksListPage' },
          { path: '/app/risks/enhanced', name: 'Risk Analytics', component: 'EnhancedRiskPage', permission: 'risks:read' },
          { path: '/app/risk-management', name: 'Risk Assessment', component: 'RiskManagementPage', permission: 'risks:read' },
        ]
      },

      // 3.4: Compliance & Assessments
      COMPLIANCE: {
        id: 'compliance',
        name: 'Compliance',
        routes: [
          { path: '/app/assessments', name: 'Assessments', component: 'AdvancedAssessmentManager', permission: 'assessments:read' },
          { path: '/advanced/assessments', name: 'Advanced Assessments', component: 'AdvancedAssessmentManager' },
          { path: '/app/assessments/:id', name: 'Assessment Details', component: 'AssessmentDetailsPage' },
          { path: '/app/assessments/:id/collaborative', name: 'Collaborative Assessment', component: 'AssessmentDetailsCollaborative' },
          { path: '/platform/auto-assessment', name: 'Auto Assessment', component: 'AutoAssessmentGeneratorPage', permission: 'assessments:create' },

          { path: '/app/compliance', name: 'Compliance Tracking', component: 'ComplianceTrackingModuleEnhanced', permission: 'compliance:read' },
          { path: '/app/compliance/legacy', name: 'Legacy Compliance', component: 'ComplianceTrackingModule' },

          { path: '/app/controls', name: 'Controls', component: 'ControlsModuleEnhanced', permission: 'controls:read' },
          { path: '/app/evidence', name: 'Evidence', component: 'EvidencePage', permission: 'evidence:read' },
        ]
      },

      // 3.5: Documents & Reports
      DOCUMENTS: {
        id: 'documents',
        name: 'Documents & Reports',
        routes: [
          { path: '/app/documents', name: 'Documents', component: 'DocumentManagementPage', permission: 'documents:read' },
          { path: '/app/reports', name: 'Reports', component: 'ReportsPage', permission: 'reports:read' },
        ]
      },

      // 3.6: Intelligence & Automation
      AUTOMATION: {
        id: 'automation',
        name: 'AI & Automation',
        routes: [
          { path: '/app/regulatory-intelligence', name: 'Regulatory Intelligence', component: 'RegulatoryIntelligencePage', permission: 'regintel:read' },
          { path: '/app/sector-intelligence', name: 'Sector Intelligence', component: 'SectorIntelligencePage', permission: 'regintel:read' },
          { path: '/app/regulatory-engine', name: 'Regulatory Engine', component: 'RegulatoryEnginePage', permission: 'regintel:read' },

          { path: '/app/workflows', name: 'Workflows', component: 'WorkflowsPage', permission: 'workflows:read' },
          { path: '/app/ai-scheduler', name: 'AI Scheduler', component: 'AISchedulerPage', permission: 'scheduler:read' },
          { path: '/app/rag', name: 'RAG AI', component: 'RAGServicePage', permission: 'rag:read' },
        ]
      },

      // 3.7: Partners & External
      EXTERNAL: {
        id: 'external',
        name: 'Partners & External',
        routes: [
          { path: '/app/partners', name: 'Partners', component: 'PartnersPage', permission: 'partners:read' },
        ]
      },

      // 3.8: Specialized & Regional
      SPECIALIZED: {
        id: 'specialized',
        name: 'Specialized',
        routes: [
          { path: '/app/ksa-grc', name: 'KSA GRC', component: 'KSAGRCPage' },
          { path: '/app/components-demo', name: 'Components Demo', component: 'ComponentsDemoPage' },
          { path: '/demo/modern-components', name: 'Modern Components', component: 'ModernComponentsDemo' },
        ]
      },
    }
  },
};

/**
 * Get all routes in order
 */
export const getAllRoutesOrdered = () => {
  const routes = [];

  // Add auth routes
  routes.push(...ROUTE_GROUPS.AUTH.routes);

  // Add admin routes
  routes.push(...ROUTE_GROUPS.ADMIN.routes);

  // Add GRC routes from subgroups
  Object.values(ROUTE_GROUPS.GRC_CORE.subGroups).forEach(subGroup => {
    routes.push(...subGroup.routes);
  });

  return routes;
};

/**
 * Get routes by group
 */
export const getRoutesByGroup = (groupId) => {
  if (groupId === 'auth') return ROUTE_GROUPS.AUTH.routes;
  if (groupId === 'admin') return ROUTE_GROUPS.ADMIN.routes;

  // Check GRC subgroups
  const subGroup = Object.values(ROUTE_GROUPS.GRC_CORE.subGroups).find(
    sg => sg.id === groupId
  );
  return subGroup?.routes || [];
};

/**
 * Get route metadata
 */
export const getRouteMetadata = (path) => {
  const allRoutes = getAllRoutesOrdered();
  return allRoutes.find(route => route.path === path);
};

export default ROUTE_GROUPS;
