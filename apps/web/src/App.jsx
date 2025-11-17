import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ErrorBoundary from './components/common/ErrorBoundary';
import { useI18n } from './hooks/useI18n.jsx';
import { useTheme } from './components/theme/ThemeProvider';

// Import ALL pages from centralized index
import {
  // Enhanced Modules (New Implementation)
  EnhancedDashboard,
  AssessmentsModuleEnhanced,
  ComplianceTrackingModuleEnhanced,
  RiskManagementModuleEnhanced,
  FrameworksModuleEnhanced,
  ControlsModuleEnhanced,

  // Legacy Modules
  Dashboard,
  Assessments,
  ComplianceTrackingPage,
  RiskManagementPage,
  FrameworksPage,
  ControlsPage,
  Controls,
  Risks,
  Evidence,

  // Organizations
  OrganizationsPage,
  OrganizationDetails,
  OrganizationForm,

  // Reports & Documents
  ReportsPage,
  DocumentManagementPage,

  // Users & Access
  UserManagementPage,
  AuditLogsPage,

  // Workflows & Automation
  WorkflowManagementPage,
  AISchedulerPage,

  // Regulatory Intelligence
  RegulatoryIntelligencePage,
  RegulatorsPage,
  SectorIntelligence,

  // Partners & Vendors
  PartnerManagementPage,

  // Notifications
  NotificationManagementPage,

  // System Management
  SettingsPage,
  DatabasePage,
  APIManagementPage,
  PerformanceMonitorPage,

  // AI & RAG Services
  RAGServicePage,

  // MSP License & Renewal Pages
  LicensesManagementPage,
  RenewalsPipelinePage,
  UsageDashboardPage,
  UpgradePage,
  AutoAssessmentGeneratorPage,
  ModernAdvancedDashboard,

  // Auth & Public Pages
  LoginPage,
  StoryDrivenRegistration,
  NotFoundPage,
  LandingPage,
  // Public routed pages
  

  // Demo, Partner, POC Access Paths
  PartnerLanding,
  PartnerAppLayout,
  // PocLanding,
  // PocRequest,
  // PocAppLayout,

  // Special Pages
  KSAGRCPage,
  AssessmentDetailsCollaborative,
  TenantDashboard,
  RegulatoryMarketDashboard,
} from './pages';

// Onboarding & New Modules
import OnboardingPage from './pages/organizations/OnboardingPage';
import OrganizationDashboard from './pages/organizations/OrganizationDashboard';
import AssessmentPage from './pages/assessments/AssessmentPage';
import EvidenceUploadPage from './pages/evidence/EvidenceUploadPage';
import TaskManagementPage from './pages/tasks/TaskManagementPage';
import TaskDashboard from './pages/tasks/TaskDashboard';
import GapAnalysisPage from './pages/gaps/GapAnalysisPage';
import RemediationPlanPage from './pages/remediation/RemediationPlanPage';
// Public subpages linked from Landing
import PathSelection from './pages/public/PathSelection';

// Layouts
import AppLayout from './components/layout/AppLayout';
import AdvancedAppShell from './components/layout/AdvancedAppShell';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Dashboard & Main Pages
import AdvancedGRCDashboard from './components/AdvancedGRCDashboard';
import MissionControlPage from './pages/system/MissionControlPage.jsx';
import AdvancedAssessmentManager from './components/AdvancedAssessmentManager';
import AdvancedFrameworkManager from './components/AdvancedFrameworkManager';
import InvitationsAdmin from './pages/users/InvitationsAdmin.jsx';
import ReactLazy from 'react';

const isProd = import.meta.env.PROD;

const App = () => {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
};

const AppContent = () => {
  // Get i18n and theme context
  const { isRTL, language } = useI18n();
  const theme = useTheme();

  // Safely get isDark with fallback
  const isDark = theme?.isDark || false;

  // Apply direction to document root
  useEffect(() => {
    document.documentElement.dir = isRTL() ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [isRTL, language, isDark]);

  // Enforce canonical domain in production
  useEffect(() => {
    if (!import.meta.env.PROD) return;
    if (typeof window === 'undefined') return;

    const canonicalHost = 'app.shahin-ai.com';
    const currentHost = window.location.host;

    if (currentHost !== canonicalHost) {
      const url = new URL(window.location.href);
      url.host = canonicalHost;
      url.protocol = 'https:';
      window.location.href = url.toString();
    }
  }, []);

  return (
    <div
      className={`arabic-text-engine min-h-screen transition-colors duration-200 ${
        isDark ? 'bg-gray-900' : 'bg-gray-50'
      } ${isRTL() ? 'rtl' : 'ltr'}`}
    >
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Navigate to="/app" replace />} />
        <Route path="/welcome" element={<Navigate to="/" replace />} />
        <Route path="/paths" element={<Navigate to="/app" replace />} />
        
        {/* Dev-only auto routing removed from production build */}

        

        {/* ==================================================================
            PARTNER ACCESS PATH - /partner
            ================================================================== */}
        <Route path="/partner" element={<PartnerLanding />} />
        <Route path="/partner/login" element={<Navigate to="/" replace />} />
        <Route path="/partner/app/*" element={<PartnerAppLayout />} />

        {/* ==================================================================
            POC ACCESS PATH - /poc
            ================================================================== */}
        {/* <Route path="/poc" element={<PocLanding />} />
        <Route path="/poc/request" element={<PocRequest />} />
        <Route path="/poc/app/*" element={<PocAppLayout />} /> */}

        {/* Authentication Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/login-glass" element={<LoginPage />} />
        <Route path="/register" element={<StoryDrivenRegistration />} />

        {/* External Landing Page Redirect */}
        <Route path="/landing" element={<Navigate to="https://www.shahin-ai.com" replace />} />
        <Route path="/home" element={<Navigate to="https://www.shahin-ai.com" replace />} />

        {/* Advanced Dashboard Routes */}
        <Route path="/advanced" element={
          <ProtectedRoute>
            <AdvancedAppShell />
          </ProtectedRoute>
        }>
          <Route index element={<AdvancedGRCDashboard />} />
          <Route path="assessments" element={<AdvancedAssessmentManager />} />
          <Route path="frameworks" element={<AdvancedFrameworkManager />} />
        </Route>

        {/* Standard App Routes */}
        <Route path="/app" element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }>
              {/* Dashboard - Enhanced with KPIs, Heatmaps, Trends */}
              <Route index element={<EnhancedDashboard />} />
              <Route path="dashboard" element={<EnhancedDashboard />} />
              <Route path="dashboard/legacy" element={<Dashboard />} />
              <Route path="dashboard/advanced" element={<AdvancedGRCDashboard />} />
              <Route path="dashboard/tenant" element={<TenantDashboard />} />
              <Route path="dashboard/regulatory-market" element={<RegulatoryMarketDashboard />} />

              {/* Core GRC Management - Enhanced Modules */}

              {/* Assessments - Enhanced with RAG, Questions, Collaboration */}
              <Route path="assessments" element={<AssessmentsModuleEnhanced />} />
              <Route path="assessments/enhanced" element={<AssessmentsModuleEnhanced />} />
              <Route path="assessments/legacy" element={<Assessments />} />
              <Route path="assessments/new" element={<AssessmentsModuleEnhanced />} />
              <Route path="assessments/:id" element={<AssessmentPage />} />
              <Route path="assessments/:id/controls/:controlId/evidence" element={<EvidenceUploadPage />} />
              <Route path="assessments/:id/report" element={<AssessmentDetailsCollaborative />} />
              <Route path="assessments/:id/edit" element={<AssessmentsModuleEnhanced />} />

              {/* Frameworks - Enhanced with Templates, Automation */}
              <Route path="frameworks" element={<FrameworksModuleEnhanced />} />
              <Route path="frameworks/enhanced" element={<FrameworksModuleEnhanced />} />
              <Route path="frameworks/legacy" element={<FrameworksPage />} />
              <Route path="frameworks/new" element={<FrameworksModuleEnhanced />} />
              <Route path="frameworks/:id" element={<FrameworksModuleEnhanced />} />
              <Route path="frameworks/:id/edit" element={<FrameworksModuleEnhanced />} />

              {/* Controls - Enhanced with Mapping, Evidence, Testing */}
              <Route path="controls" element={<ControlsModuleEnhanced />} />
              <Route path="controls/enhanced" element={<ControlsModuleEnhanced />} />
              <Route path="controls/legacy" element={<ControlsPage />} />
              <Route path="controls/legacy-list" element={<Controls />} />
              <Route path="controls/new" element={<ControlsModuleEnhanced />} />
              <Route path="controls/:id" element={<ControlsModuleEnhanced />} />
              <Route path="controls/:id/edit" element={<ControlsModuleEnhanced />} />

              {/* Risk Management - Enhanced with AI, Analytics */}
              <Route path="risks" element={<RiskManagementModuleEnhanced />} />
              <Route path="risks/enhanced" element={<RiskManagementModuleEnhanced />} />
              <Route path="risks/legacy" element={<RiskManagementPage />} />
              <Route path="risks/legacy-list" element={<Risks />} />
              <Route path="risks/new" element={<RiskManagementModuleEnhanced />} />
              <Route path="risks/:id" element={<RiskManagementModuleEnhanced />} />
              <Route path="risks/:id/edit" element={<RiskManagementModuleEnhanced />} />

              {/* Compliance Tracking - Enhanced with Monitoring, Reporting */}
              <Route path="compliance" element={<ComplianceTrackingModuleEnhanced />} />
              <Route path="compliance/enhanced" element={<ComplianceTrackingModuleEnhanced />} />
              <Route path="compliance/legacy" element={<ComplianceTrackingPage />} />
              <Route path="compliance/new" element={<ComplianceTrackingModuleEnhanced />} />
              <Route path="compliance/:id" element={<ComplianceTrackingModuleEnhanced />} />
              <Route path="compliance/:id/edit" element={<ComplianceTrackingModuleEnhanced />} />

              {/* Evidence Management */}
              <Route path="evidence" element={<Evidence />} />
              <Route path="evidence/upload" element={<EvidenceUploadPage />} />
              <Route path="evidence/new" element={<Evidence />} />
              <Route path="evidence/:id" element={<Evidence />} />

              {/* Document Management */}
              <Route path="documents" element={<DocumentManagementPage />} />
              <Route path="documents/new" element={<DocumentManagementPage />} />
              <Route path="documents/:id" element={<DocumentManagementPage />} />

              {/* Organizations & Tenants */}
              <Route path="organizations" element={<OrganizationsPage />} />
              <Route path="organizations/new" element={<OrganizationForm />} />
              <Route path="organizations/:id" element={<OrganizationDetails />} />
              <Route path="organizations/:id/dashboard" element={<OrganizationDashboard />} />
              <Route path="organizations/:id/edit" element={<OrganizationForm />} />

              {/* Organization Onboarding */}
              <Route path="onboarding" element={<OnboardingPage />} />
              <Route path="onboarding/new" element={<OnboardingPage />} />

              {/* Users & Access Management */}
              <Route path="users" element={<UserManagementPage />} />
              <Route path="users/new" element={<UserManagementPage />} />
              <Route path="users/:id" element={<UserManagementPage />} />
              <Route path="users/:id/edit" element={<UserManagementPage />} />
              <Route path="users/invitations" element={<InvitationsAdmin />} />

              {/* Reports & Analytics */}
              <Route path="reports" element={<ReportsPage />} />
              <Route path="reports/compliance" element={<ComplianceTrackingModuleEnhanced />} />
              <Route path="reports/risk" element={<RiskManagementModuleEnhanced />} />
              <Route path="reports/frameworks" element={<FrameworksModuleEnhanced />} />
              <Route path="reports/assessments" element={<AssessmentsModuleEnhanced />} />

              {/* System Management */}
              <Route path="settings" element={<SettingsPage />} />
              <Route path="settings/general" element={<SettingsPage />} />
              <Route path="settings/security" element={<SettingsPage />} />
              <Route path="settings/notifications" element={<SettingsPage />} />
              <Route path="settings/integrations" element={<SettingsPage />} />

              {/* Database & System */}
              <Route path="database" element={<DatabasePage />} />
              <Route path="system" element={<DatabasePage />} />
              <Route path="system/health" element={<PerformanceMonitorPage />} />
              <Route path="system/api" element={<APIManagementPage />} />

              {/* Workflows & Automation */}
              <Route path="workflows" element={<WorkflowManagementPage />} />
              <Route path="workflows/new" element={<WorkflowManagementPage />} />
              <Route path="workflows/:id" element={<WorkflowManagementPage />} />

              {/* Task Management - GRC Execution Tasks */}
              <Route path="tasks" element={<TaskDashboard />} />
              <Route path="tasks/board" element={<TaskDashboard />} />
              <Route path="tasks/list" element={<TaskManagementPage />} />
              <Route path="tasks/create" element={<TaskManagementPage />} />
              <Route path="tasks/:id" element={<TaskManagementPage />} />

              {/* Gap Analysis & Remediation */}
              <Route path="gaps" element={<GapAnalysisPage />} />
              <Route path="gaps/:id" element={<GapAnalysisPage />} />
              <Route path="remediation" element={<RemediationPlanPage />} />
              <Route path="remediation/create" element={<RemediationPlanPage />} />
              <Route path="remediation/:id" element={<RemediationPlanPage />} />

              {/* AI & RAG Services */}
              <Route path="ai" element={<AISchedulerPage />} />
              <Route path="ai/scheduler" element={<AISchedulerPage />} />
              <Route path="ai/rag" element={<RAGServicePage />} />
              <Route path="rag" element={<RAGServicePage />} />

              {/* Notifications & Communications */}
              <Route path="notifications" element={<NotificationManagementPage />} />
              <Route path="notifications/settings" element={<NotificationManagementPage />} />
              <Route path="mission-control" element={<MissionControlPage />} />
              <Route path="chat" element={<MissionControlPage />} />

              {/* Regulatory Intelligence */}
              <Route path="regulatory" element={<RegulatoryIntelligencePage />} />
              <Route path="regulatory/ksa" element={<KSAGRCPage />} />
              <Route path="regulatory/sectors" element={<SectorIntelligence />} />
              <Route path="regulators" element={<RegulatorsPage />} />

              {/* Partners & Collaborations */}
              <Route path="partners" element={<PartnerManagementPage />} />
              <Route path="partners/new" element={<PartnerManagementPage />} />
              <Route path="partners/:id" element={<PartnerManagementPage />} />

              {/* Audit & Logs */}
              <Route path="audit" element={<AuditLogsPage />} />
              <Route path="logs" element={<AuditLogsPage />} />
              <Route path="audit-logs" element={<AuditLogsPage />} />

              {/* License & Renewal Management */}
              <Route path="licenses" element={<LicensesManagementPage />} />
              <Route path="licenses/new" element={<LicensesManagementPage />} />
              <Route path="licenses/:id" element={<LicensesManagementPage />} />
              <Route path="renewals" element={<RenewalsPipelinePage />} />
              <Route path="renewals/new" element={<RenewalsPipelinePage />} />
              <Route path="usage" element={<UsageDashboardPage />} />
              <Route path="upgrade" element={<UpgradePage />} />

              {/* Auto Assessment Generator */}
              <Route path="auto-assessment" element={<AutoAssessmentGeneratorPage />} />
              <Route path="assessment-generator" element={<AutoAssessmentGeneratorPage />} />

              {/* Advanced Dashboard */}
              <Route path="advanced" element={<ModernAdvancedDashboard />} />

              {/* System Health & Monitoring */}
              <Route path="health" element={<PerformanceMonitorPage />} />
              <Route path="monitor" element={<PerformanceMonitorPage />} />
              <Route path="status" element={<PerformanceMonitorPage />} />
            </Route>

            {/* Public API Documentation disabled */}
            <Route path="/api" element={<Navigate to="/app" replace />} />
            <Route path="/api/docs" element={<Navigate to="/app" replace />} />
            <Route path="/api/status" element={<Navigate to="/app" replace />} />

            {/* Public Integration Endpoints disabled */}
            <Route path="/integrations" element={<Navigate to="/app" replace />} />
            <Route path="/integrations/webhook" element={<Navigate to="/app" replace />} />
            <Route path="/integrations/sso" element={<Navigate to="/app" replace />} />

            {/* Public Regulatory Intelligence disabled */}
            <Route path="/regulatory" element={<Navigate to="/app" replace />} />
            <Route path="/regulatory/ksa" element={<Navigate to="/app" replace />} />
            <Route path="/regulatory/sectors" element={<Navigate to="/app" replace />} />

            {/* Public Reports & Analytics disabled */}
            <Route path="/reports" element={<Navigate to="/app" replace />} />
            <Route path="/reports/compliance" element={<Navigate to="/app" replace />} />
            <Route path="/reports/risk" element={<Navigate to="/app" replace />} />

            {/* Bridge & Transfer Endpoints disabled */}
            <Route path="/bridge" element={<Navigate to="/app" replace />} />
            <Route path="/bridge/status" element={<Navigate to="/app" replace />} />
            <Route path="/bridge/approval" element={<Navigate to="/app" replace />} />

            {/* External Web App Integration Points disabled */}
            <Route path="/external" element={<Navigate to="/app" replace />} />
            <Route path="/external/dashboard" element={<Navigate to="/app" replace />} />
            <Route path="/external/assessments" element={<Navigate to="/app" replace />} />
            <Route path="/external/compliance" element={<Navigate to="/app" replace />} />
            <Route path="/external/frameworks" element={<Navigate to="/app" replace />} />
            <Route path="/external/controls" element={<Navigate to="/app" replace />} />
            <Route path="/external/risks" element={<Navigate to="/app" replace />} />
            <Route path="/external/reports" element={<Navigate to="/app" replace />} />
            <Route path="/external/organizations" element={<Navigate to="/app" replace />} />

            {/* Microservices Public Endpoints disabled */}
            <Route path="/services" element={<Navigate to="/app" replace />} />
            <Route path="/services/license" element={<Navigate to="/app" replace />} />
            <Route path="/services/tenant" element={<Navigate to="/app" replace />} />
            <Route path="/services/analytics" element={<Navigate to="/app" replace />} />
            <Route path="/services/notification" element={<Navigate to="/app" replace />} />
            <Route path="/services/billing" element={<Navigate to="/app" replace />} />
            <Route path="/services/auth" element={<Navigate to="/app" replace />} />
            <Route path="/services/reporting" element={<Navigate to="/app" replace />} />
            <Route path="/services/workflow" element={<Navigate to="/app" replace />} />

            {/* Public Health & Monitoring disabled */}
            <Route path="/health" element={<Navigate to="/app" replace />} />
            <Route path="/status" element={<Navigate to="/app" replace />} />
            <Route path="/metrics" element={<Navigate to="/app" replace />} />

            {/* ========================================== */}
            {/* AUTHENTICATED ROUTES                      */}
            {/* ========================================== */}
            <Route path="/tenant/:tenantId" element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }>
              {/* Tenant Dashboard */}
              <Route index element={<EnhancedDashboard />} />
              <Route path="dashboard" element={<EnhancedDashboard />} />

              {/* Tenant License & Usage */}
              <Route path="licenses" element={<LicensesManagementPage />} />
              <Route path="usage" element={<UsageDashboardPage />} />
              <Route path="upgrade" element={<UpgradePage />} />
              <Route path="billing" element={<SettingsPage />} />

              {/* Tenant GRC Modules */}
              <Route path="assessments" element={<AssessmentsModuleEnhanced />} />
              <Route path="frameworks" element={<FrameworksModuleEnhanced />} />
              <Route path="controls" element={<ControlsModuleEnhanced />} />
              <Route path="risks" element={<RiskManagementModuleEnhanced />} />
              <Route path="compliance" element={<ComplianceTrackingModuleEnhanced />} />
              <Route path="organizations" element={<OrganizationsPage />} />
              <Route path="users" element={<UserManagementPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="notifications" element={<NotificationManagementPage />} />

              {/* Tenant AI & Automation */}
              <Route path="workflows" element={<WorkflowManagementPage />} />
              <Route path="rag" element={<RAGServicePage />} />
              <Route path="documents" element={<DocumentManagementPage />} />
              <Route path="regulatory-intelligence" element={<RegulatoryIntelligencePage />} />
            </Route>

            {/* Legacy Routes for backward compatibility */}
            <Route path="/dashboard" element={<Navigate to="/app" replace />} />
            <Route path="/admin" element={<Navigate to="/advanced" replace />} />

            {/* Error Pages */}
            <Route path="/404" element={<NotFoundPage />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </div>
  );
};

export default App;
