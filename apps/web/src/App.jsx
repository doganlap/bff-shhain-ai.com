import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, useLocation } from 'react-router-dom';
import { Shield, Eye, Settings, Users, Database, BarChart3, AlertTriangle, Building2, FileText } from 'lucide-react';

// Import all pages
import { 
  EnhancedDashboard,
  AssessmentDetailsCollaborative,
  ComplianceTrackingModuleEnhanced,
  RiskManagementModuleEnhanced,
  ControlsModuleEnhanced,
  Evidence,
  OrganizationsPage,
  OrganizationDetails,
  UserManagementPage,
  AuditLogsPage,
  WorkflowManagementPage,
  NotificationManagementPage,
  DocumentManagementPage,
  AISchedulerPage,
  RAGServicePage,
  SettingsPage,
  DatabasePage,
  APIManagementPage,
  PerformanceMonitorPage,
  LicensesManagementPage,
  RenewalsPipelinePage,
  UpgradePage,
  AutoAssessmentGeneratorPage,
  PartnerManagementPage,
  RegulatoryIntelligenceEnginePage,
  RegulatoryIntelligencePage,
  RegulatorsPage,
  SectorIntelligence,
  KSAGRCPage,
  ReportsPage,
  ModernAdvancedDashboard,
  TenantDashboard,
  RegulatoryMarketDashboard,
  UsageDashboardPage,
  SimpleLoginPage,
  StoryDrivenRegistration,
  LandingPage,
  DemoPage,
  ComponentsDemo,
  ModernComponentsDemo,
  SystemHealthDashboard,
  MissionControlPage
} from './pages';

import AdvancedShell from './components/layout/AdvancedShell';
import { AppProvider } from './context/AppContext';
import { I18nProvider } from './hooks/useI18n';
import { ThemeProvider } from './components/theme/ThemeProvider';
import { PermissionPageTemplate, RoleDashboardCards } from './components/common/PermissionPageTemplate';

const AppContent = () => {
  const [currentPage, setCurrentPage] = useState('login');
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname.substring(1) || 'login';
    setCurrentPage(path);
  }, [location]);

  const renderCurrentPage = () => {
    switch (currentPage) {
      // Dashboard pages with permission-based templates
      case 'dashboard':
        return (
          <PermissionPageTemplate
            pageTitle="GRC Dashboard"
            pageDescription="Comprehensive governance, risk, and compliance overview"
            showHeader={true}
            showStats={true}
            tools={[
              {
                title: 'Role-Based Dashboard Cards',
                description: 'Dynamic cards based on your role',
                icon: <Shield className="h-6 w-6" />,
                requiredPermissions: ['dashboard:read'],
                culturalPattern: true,
                glowEffect: true
              }
            ]}
          >
            <EnhancedDashboard />
            <RoleDashboardCards className="mt-6" />
          </PermissionPageTemplate>
        );
      case 'modern-dashboard':
        return (
          <PermissionPageTemplate
            pageTitle="Modern Dashboard"
            pageDescription="Advanced analytics and insights"
            requiredPermissions={['dashboard:read', 'analytics:read']}
          >
            <ModernAdvancedDashboard />
          </PermissionPageTemplate>
        );
      case 'tenant-dashboard':
        return (
          <PermissionPageTemplate
            pageTitle="Tenant Dashboard"
            pageDescription="Multi-tenant management overview"
            requiredRole="tenant_admin"
          >
            <TenantDashboard />
          </PermissionPageTemplate>
        );
      case 'regulatory-dashboard':
        return (
          <PermissionPageTemplate
            pageTitle="Regulatory Dashboard"
            pageDescription="Regulatory compliance monitoring"
            requiredPermissions={['regulatory:read']}
          >
            <RegulatoryMarketDashboard />
          </PermissionPageTemplate>
        );
      case 'usage-dashboard':
        return (
          <PermissionPageTemplate
            pageTitle="Usage Dashboard"
            pageDescription="System usage analytics"
            requiredPermissions={['usage:read']}
          >
            <UsageDashboardPage />
          </PermissionPageTemplate>
        );
      
      // Core GRC pages
      case 'assessments':
        return (
          <PermissionPageTemplate
            pageTitle="Assessments"
            pageDescription="Compliance assessments and evaluations"
            requiredPermissions={['assessments:read']}
            tools={[
              {
                title: 'Assessment Tools',
                description: 'Create and manage assessments',
                icon: <FileText className="h-6 w-6" />,
                requiredPermissions: ['assessments:create'],
                culturalPattern: true,
                glowEffect: true
              }
            ]}
          >
            <AssessmentDetailsCollaborative />
          </PermissionPageTemplate>
        );
      case 'frameworks':
        return (
          <PermissionPageTemplate
            pageTitle="Frameworks Management"
            pageDescription="Compliance frameworks and standards"
            requiredPermissions={['frameworks:read']}
            tools={[
              {
                title: 'Framework Library',
                description: 'Browse compliance frameworks',
                icon: <Shield className="h-6 w-6" />,
                requiredPermissions: ['frameworks:read'],
                culturalPattern: true,
                glowEffect: false
              }
            ]}
          >
            <div className="p-6"><h1 className="text-2xl font-bold">Frameworks Management</h1><p>Framework management page coming soon...</p></div>
          </PermissionPageTemplate>
        );
      case 'evidence':
        return (
          <PermissionPageTemplate
            pageTitle="Evidence Management"
            pageDescription="Compliance evidence and documentation"
            requiredPermissions={['evidence:read']}
            tools={[
              {
                title: 'Evidence Collection',
                description: 'Upload and manage evidence',
                icon: <Database className="h-6 w-6" />,
                requiredPermissions: ['evidence:create'],
                culturalPattern: false,
                glowEffect: true
              }
            ]}
          >
            <Evidence />
          </PermissionPageTemplate>
        );
      
      // Risk & Compliance pages
      case 'risks':
        return (
          <PermissionPageTemplate
            pageTitle="Risk Management"
            pageDescription="Enterprise risk management and mitigation"
            requiredPermissions={['risks:read']}
            tools={[
              {
                title: 'Risk Assessment',
                description: 'Identify and assess risks',
                icon: <AlertTriangle className="h-6 w-6" />,
                requiredPermissions: ['risks:create'],
                culturalPattern: true,
                glowEffect: true
              }
            ]}
          >
            <RiskManagementModuleEnhanced />
          </PermissionPageTemplate>
        );
      case 'compliance':
        return (
          <PermissionPageTemplate
            pageTitle="Compliance Tracking"
            pageDescription="Regulatory compliance monitoring and tracking"
            requiredPermissions={['compliance:read']}
            tools={[
              {
                title: 'Compliance Status',
                description: 'Monitor compliance status',
                icon: <Shield className="h-6 w-6" />,
                requiredPermissions: ['compliance:read'],
                culturalPattern: true,
                glowEffect: false
              }
            ]}
          >
            <ComplianceTrackingModuleEnhanced />
          </PermissionPageTemplate>
        );
      case 'controls':
        return (
          <PermissionPageTemplate
            pageTitle="Controls Management"
            pageDescription="Internal controls and procedures"
            requiredPermissions={['controls:read']}
            tools={[
              {
                title: 'Control Library',
                description: 'Manage control frameworks',
                icon: <Settings className="h-6 w-6" />,
                requiredPermissions: ['controls:read'],
                culturalPattern: false,
                glowEffect: true
              }
            ]}
          >
            <ControlsModuleEnhanced />
          </PermissionPageTemplate>
        );
      
      // Organization pages
      case 'organizations':
        return (
          <PermissionPageTemplate
            pageTitle="Organizations"
            pageDescription="Organization management and hierarchy"
            requiredPermissions={['organizations:read']}
            tools={[
              {
                title: 'Organization Tree',
                description: 'View organization structure',
                icon: <Building2 className="h-6 w-6" />,
                requiredPermissions: ['organizations:read'],
                culturalPattern: true,
                glowEffect: false
              }
            ]}
          >
            <OrganizationsPage />
          </PermissionPageTemplate>
        );
      case 'users':
        return (
          <PermissionPageTemplate
            pageTitle="User Management"
            pageDescription="System users and access management"
            requiredPermissions={['users:read']}
            tools={[
              {
                title: 'User Directory',
                description: 'Browse system users',
                icon: <Users className="h-6 w-6" />,
                requiredPermissions: ['users:read'],
                culturalPattern: true,
                glowEffect: true
              }
            ]}
          >
            <UserManagementPage />
          </PermissionPageTemplate>
        );
      case 'organization-details':
        return (
          <PermissionPageTemplate
            pageTitle="Organization Details"
            pageDescription="Detailed organization information"
            requiredPermissions={['organizations:read']}
          >
            <OrganizationDetails />
          </PermissionPageTemplate>
        );
      
      // System & Admin pages with permission-based templates
      case 'settings':
        return (
          <PermissionPageTemplate
            pageTitle="System Settings"
            pageDescription="Configure system parameters and preferences"
            requiredPermissions={['settings:read']}
            tools={[
              {
                title: 'Permission Settings',
                description: 'Manage role-based permissions',
                icon: <Shield className="h-6 w-6" />,
                requiredPermissions: ['permissions:manage'],
                culturalPattern: true,
                glowEffect: true
              },
              {
                title: 'System Configuration',
                description: 'Advanced system settings',
                icon: <Settings className="h-6 w-6" />,
                requiredPermissions: ['system:config'],
                culturalPattern: false,
                glowEffect: false
              }
            ]}
          >
            <SettingsPage />
          </PermissionPageTemplate>
        );
      case 'database':
        return (
          <PermissionPageTemplate
            pageTitle="Database Management"
            pageDescription="System database administration"
            requiredPermissions={['system:manage']}
            requiredRole="system_admin"
            tools={[
              {
                title: 'Database Health',
                description: 'Monitor database performance',
                icon: <Database className="h-6 w-6" />,
                requiredPermissions: ['system:monitor'],
                culturalPattern: true,
                glowEffect: true
              }
            ]}
          >
            <DatabasePage />
          </PermissionPageTemplate>
        );
      case 'api-management':
        return (
          <PermissionPageTemplate
            pageTitle="API Management"
            pageDescription="Manage system APIs and endpoints"
            requiredPermissions={['system:manage']}
            tools={[
              {
                title: 'API Health Check',
                description: 'Test API connectivity',
                icon: <Shield className="h-6 w-6" />,
                requiredPermissions: ['system:monitor'],
                culturalPattern: true,
                glowEffect: false
              }
            ]}
          >
            <APIManagementPage />
          </PermissionPageTemplate>
        );
      case 'performance':
        return (
          <PermissionPageTemplate
            pageTitle="Performance Monitor"
            pageDescription="System performance monitoring"
            requiredPermissions={['system:monitor']}
            tools={[
              {
                title: 'Real-time Metrics',
                description: 'Live system performance',
                icon: <BarChart3 className="h-6 w-6" />,
                requiredPermissions: ['system:monitor'],
                culturalPattern: false,
                glowEffect: false
              }
            ]}
          >
            <PerformanceMonitorPage />
          </PermissionPageTemplate>
        );
      case 'audit-logs':
        return (
          <PermissionPageTemplate
            pageTitle="Audit Logs"
            pageDescription="System audit trail and logs"
            requiredPermissions={['audit:read']}
            tools={[
              {
                title: 'Audit Trail',
                description: 'Complete audit history',
                icon: <Eye className="h-6 w-6" />,
                requiredPermissions: ['audit:read'],
                culturalPattern: true,
                glowEffect: false
              }
            ]}
          >
            <AuditLogsPage />
          </PermissionPageTemplate>
        );
      case 'workflows':
        return (
          <PermissionPageTemplate
            pageTitle="Workflow Management"
            pageDescription="Manage system workflows and processes"
            requiredPermissions={['workorders:read']}
            tools={[
              {
                title: 'Workflow Designer',
                description: 'Create custom workflows',
                icon: <Settings className="h-6 w-6" />,
                requiredPermissions: ['workorders:create'],
                culturalPattern: false,
                glowEffect: true
              }
            ]}
          >
            <WorkflowManagementPage />
          </PermissionPageTemplate>
        );
      case 'notifications':
        return (
          <PermissionPageTemplate
            pageTitle="Notification Management"
            pageDescription="System notifications and alerts"
            requiredPermissions={['notifications:read']}
          >
            <NotificationManagementPage />
          </PermissionPageTemplate>
        );
      case 'vercel-status':
        return (
          <PermissionPageTemplate
            pageTitle="360° System Health"
            pageDescription="Live monitoring of your cloud, local, and application status"
            requiredRole="super_admin" // Protect this page
            requiredPermissions={['system:monitor']}
          >
            <SystemHealthDashboard />
          </PermissionPageTemplate>
        );
      case 'mission-control':
        return (
          <PermissionPageTemplate
            pageTitle="AI Mission Control"
            pageDescription="A Multi-Project, Multi-Model AI Agent Command Center"
            requiredRole="super_admin"
          >
            <MissionControlPage />
          </PermissionPageTemplate>
        );

      case 'documents':
        return (
          <PermissionPageTemplate
            pageTitle="Document Management"
            pageDescription="System documents and files"
            requiredPermissions={['documents:read']}
          >
            <DocumentManagementPage />
          </PermissionPageTemplate>
        );
      case 'regulatory':
        return (
          <PermissionPageTemplate
            pageTitle="Regulatory Intelligence"
            pageDescription="Regulatory compliance monitoring"
            requiredPermissions={['regulatory:read']}
            tools={[
              {
                title: 'Regulatory Updates',
                description: 'Latest regulatory changes',
                icon: <Shield className="h-6 w-6" />,
                requiredPermissions: ['regulatory:read'],
                culturalPattern: true,
                glowEffect: false
              }
            ]}
          >
            <RegulatoryIntelligencePage />
          </PermissionPageTemplate>
        );
      
      // AI Services pages
      case 'ai-scheduler':
        return (
          <PermissionPageTemplate
            pageTitle="AI Scheduler"
            pageDescription="AI-powered scheduling and automation"
            requiredPermissions={['ai:read']}
            tools={[
              {
                title: 'AI Automation',
                description: 'AI-powered task scheduling',
                icon: <Settings className="h-6 w-6" />,
                requiredPermissions: ['ai:create'],
                culturalPattern: true,
                glowEffect: true
              }
            ]}
          >
            <AISchedulerPage />
          </PermissionPageTemplate>
        );
      case 'rag':
        return (
          <PermissionPageTemplate
            pageTitle="RAG Service"
            pageDescription="Retrieval-Augmented Generation service"
            requiredPermissions={['ai:read']}
            tools={[
              {
                title: 'RAG Engine',
                description: 'AI knowledge retrieval',
                icon: <Database className="h-6 w-6" />,
                requiredPermissions: ['ai:create'],
                culturalPattern: true,
                glowEffect: false
              }
            ]}
          >
            <RAGServicePage />
          </PermissionPageTemplate>
        );
      
      // Platform & Licensing pages
      case 'licenses':
        return (
          <PermissionPageTemplate
            pageTitle="License Management"
            pageDescription="Software license administration"
            requiredPermissions={['licenses:read']}
            tools={[
              {
                title: 'License Inventory',
                description: 'Manage software licenses',
                icon: <Shield className="h-6 w-6" />,
                requiredPermissions: ['licenses:read'],
                culturalPattern: false,
                glowEffect: false
              }
            ]}
          >
            <LicensesManagementPage />
          </PermissionPageTemplate>
        );
      case 'renewals':
        return (
          <PermissionPageTemplate
            pageTitle="Renewals Pipeline"
            pageDescription="License renewal management"
            requiredPermissions={['licenses:manage']}
            tools={[
              {
                title: 'Renewal Calendar',
                description: 'Track license renewals',
                icon: <Settings className="h-6 w-6" />,
                requiredPermissions: ['licenses:manage'],
                culturalPattern: true,
                glowEffect: true
              }
            ]}
          >
            <RenewalsPipelinePage />
          </PermissionPageTemplate>
        );
      case 'upgrade':
        return (
          <PermissionPageTemplate
            pageTitle="System Upgrade"
            pageDescription="System upgrade and migration"
            requiredPermissions={['system:upgrade']}
            tools={[
              {
                title: 'Upgrade Tools',
                description: 'System upgrade utilities',
                icon: <Settings className="h-6 w-6" />,
                requiredPermissions: ['system:upgrade'],
                culturalPattern: false,
                glowEffect: true
              }
            ]}
          >
            <UpgradePage />
          </PermissionPageTemplate>
        );
      case 'auto-assessment':
        return (
          <PermissionPageTemplate
            pageTitle="Auto Assessment Generator"
            pageDescription="Automated compliance assessment generation"
            requiredPermissions={['assessments:create']}
            tools={[
              {
                title: 'AI Assessment',
                description: 'Generate assessments automatically',
                icon: <FileText className="h-6 w-6" />,
                requiredPermissions: ['assessments:create'],
                culturalPattern: true,
                glowEffect: true
              }
            ]}
          >
            <AutoAssessmentGeneratorPage />
          </PermissionPageTemplate>
        );
      case 'partners':
        return (
          <PermissionPageTemplate
            pageTitle="Partner Management"
            pageDescription="Business partner and vendor management"
            requiredPermissions={['partners:read']}
            tools={[
              {
                title: 'Partner Directory',
                description: 'Manage business partners',
                icon: <Users className="h-6 w-6" />,
                requiredPermissions: ['partners:read'],
                culturalPattern: true,
                glowEffect: false
              }
            ]}
          >
            <PartnerManagementPage />
          </PermissionPageTemplate>
        );
      
      // Regulatory Intelligence pages
      case 'regulatory-engine':
        return (
          <PermissionPageTemplate
            pageTitle="Regulatory Intelligence Engine"
            pageDescription="AI-powered regulatory analysis"
            requiredPermissions={['regulatory:read']}
            tools={[
              {
                title: 'AI Regulatory Analysis',
                description: 'Automated regulatory insights',
                icon: <BarChart3 className="h-6 w-6" />,
                requiredPermissions: ['regulatory:read'],
                culturalPattern: true,
                glowEffect: true
              }
            ]}
          >
            <RegulatoryIntelligenceEnginePage />
          </PermissionPageTemplate>
        );
      case 'regulators':
        return (
          <PermissionPageTemplate
            pageTitle="Regulators"
            pageDescription="Regulatory authority management"
            requiredPermissions={['regulatory:read']}
            tools={[
              {
                title: 'Regulator Directory',
                description: 'Manage regulatory contacts',
                icon: <Shield className="h-6 w-6" />,
                requiredPermissions: ['regulatory:read'],
                culturalPattern: false,
                glowEffect: false
              }
            ]}
          >
            <RegulatorsPage />
          </PermissionPageTemplate>
        );
      case 'sector-intelligence':
        return (
          <PermissionPageTemplate
            pageTitle="Sector Intelligence"
            pageDescription="Industry-specific regulatory insights"
            requiredPermissions={['regulatory:read']}
            tools={[
              {
                title: 'Sector Analysis',
                description: 'Industry regulatory trends',
                icon: <BarChart3 className="h-6 w-6" />,
                requiredPermissions: ['regulatory:read'],
                culturalPattern: true,
                glowEffect: true
              }
            ]}
          >
            <SectorIntelligence />
          </PermissionPageTemplate>
        );
      case 'ksa-grc':
        return (
          <PermissionPageTemplate
            pageTitle="KSA GRC"
            pageDescription="Kingdom of Saudi Arabia GRC compliance"
            requiredPermissions={['regulatory:read']}
            tools={[
              {
                title: 'KSA Compliance',
                description: 'Saudi regulatory compliance',
                icon: <Shield className="h-6 w-6" />,
                requiredPermissions: ['regulatory:read'],
                culturalPattern: true,
                glowEffect: false
              }
            ]}
          >
            <KSAGRCPage />
          </PermissionPageTemplate>
        );
      
      // Authentication pages
      case 'login':
        return (
          <PermissionPageTemplate
            pageTitle="Login"
            pageDescription="Secure system access"
            showHeader={false}
            showStats={false}
          >
            <SimpleLoginPage />
          </PermissionPageTemplate>
        );
      case 'register':
        return (
          <PermissionPageTemplate
            pageTitle="Registration"
            pageDescription="Create new account"
            showHeader={false}
            showStats={false}
          >
            <StoryDrivenRegistration />
          </PermissionPageTemplate>
        );
      
      // Reports page
      case 'reports':
        return (
          <PermissionPageTemplate
            pageTitle="Reports"
            pageDescription="Compliance and analytics reports"
            requiredPermissions={['reports:read']}
            tools={[
              {
                title: 'Report Generator',
                description: 'Create custom reports',
                icon: <BarChart3 className="h-6 w-6" />,
                requiredPermissions: ['reports:create'],
                culturalPattern: true,
                glowEffect: true
              }
            ]}
          >
            <ReportsPage />
          </PermissionPageTemplate>
        );
      
      // Public pages (no permission required)
      case 'landing':
        return <LandingPage />;
      case 'demo':
        return (
          <PermissionPageTemplate
            pageTitle="Demo"
            pageDescription="System demonstration"
            showHeader={false}
            showStats={false}
          >
            <DemoPage />
          </PermissionPageTemplate>
        );
      case 'components-demo':
        return (
          <PermissionPageTemplate
            pageTitle="Components Demo"
            pageDescription="UI component showcase"
            showHeader={false}
            showStats={false}
          >
            <ComponentsDemo />
          </PermissionPageTemplate>
        );
      case 'modern-demo':
        return (
          <PermissionPageTemplate
            pageTitle="Modern Demo"
            pageDescription="Modern UI demonstration"
            showHeader={false}
            showStats={false}
          >
            <ModernComponentsDemo />
          </PermissionPageTemplate>
        );
      
      default:
        return <EnhancedDashboard />;
    }
  };

  return (
    <AdvancedShell 
      activeSection={currentPage}
      onNavigate={setCurrentPage}
    >
      {renderCurrentPage()}
    </AdvancedShell>
  );
};

const App = () => {
  return (
    <ThemeProvider defaultTheme="light">
      <I18nProvider defaultLanguage="ar">
        <AppProvider>
          <Router>
            <AppContent />
          </Router>
        </AppProvider>
      </I18nProvider>
    </ThemeProvider>
  );
};

export default App; 
