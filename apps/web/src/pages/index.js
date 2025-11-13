/**
 * Enhanced GRC Modules Export - ORGANIZED STRUCTURE
 * Centralized export for all comprehensive GRC modules and pages
 * 
 * 📁 FOLDER STRUCTURE:
 * ├── 📊 dashboard/     - All dashboard variants
 * ├── 🛡️ grc-modules/   - Core GRC functionality  
 * ├── 🏢 organizations/ - Organization management
 * ├── ⚙️ system/        - System & admin pages
 * ├── 🏗️ platform/      - MSP & platform management
 * ├── 📋 regulatory/    - Regulatory intelligence
 * ├── 📊 reports/       - Reports & analytics
 * ├── 🔐 auth/          - Authentication pages
 * └── 🌐 public/        - Public & demo pages
 */

// ============================================================================
// 📊 DASHBOARD MODULES
// ============================================================================

// Enhanced Dashboard with KPIs, Heatmaps, Trends
export { default as EnhancedDashboard } from './dashboard/EnhancedDashboard.jsx';

// Legacy Dashboard (Backward Compatibility)
export { default as Dashboard } from './dashboard/Dashboard.jsx';

// Advanced Dashboard Variants
export { default as ModernAdvancedDashboard } from './dashboard/ModernAdvancedDashboard.jsx';
export { default as TenantDashboard } from './dashboard/TenantDashboard.jsx';
export { default as RegulatoryMarketDashboard } from './dashboard/RegulatoryMarketDashboard.jsx';
export { default as UsageDashboardPage } from './dashboard/UsageDashboardPage.jsx';

// ============================================================================
// 🛡️ GRC CORE MODULES
// ============================================================================

// Enhanced Assessments with RAG, Questions Generation, Collaboration
export { default as AssessmentDetailsCollaborative } from './grc-modules/AssessmentDetailsCollaborative.jsx';

// Enhanced Compliance Tracking with Gap Analysis, Scoring
export { default as ComplianceTrackingModuleEnhanced } from './grc-modules/ComplianceTrackingModuleEnhanced.jsx';
export { default as ComplianceTrackingPage } from './grc-modules/ComplianceTrackingPage.jsx';

// Enhanced Risk Management with L×I Matrix, Heat Maps, Treatments
export { default as RiskManagementModuleEnhanced } from './grc-modules/RiskManagementModuleEnhanced.jsx';
export { default as RiskManagementPage } from './grc-modules/RiskManagementPage.jsx';
export { default as Risks } from './grc-modules/Risks.jsx';

// Enhanced Frameworks Management with Import/Export, Coverage
// (Now using AdvancedFrameworkManager from components)

// Enhanced Controls Management with Evidence, Testing
export { default as ControlsModuleEnhanced } from './grc-modules/ControlsModuleEnhanced.jsx';
export { default as Evidence } from './grc-modules/Evidence.jsx';

// ============================================================================
// 🏢 ORGANIZATION MANAGEMENT
// ============================================================================

export { default as OrganizationsPage } from './organizations/OrganizationsPage.jsx';
export { default as Organizations } from './organizations/Organizations.jsx';
export { default as OrganizationDetails } from './organizations/OrganizationDetails.jsx';
export { default as OrganizationForm } from './organizations/OrganizationForm.jsx';

// ============================================================================
// ⚙️ SYSTEM & ADMINISTRATION
// ============================================================================

// System Management
export { default as SettingsPage } from './system/SettingsPage.jsx';
export { default as DatabasePage } from './system/DatabasePage.jsx';
export { default as APIManagementPage } from './system/APIManagementPage.jsx';
export { default as PerformanceMonitorPage } from './system/PerformanceMonitorPage.jsx';

// Users & Access Control
export { default as UserManagementPage } from './system/UserManagementPage.jsx';
export { default as AuditLogsPage } from './system/AuditLogsPage.jsx';

// Workflows & Automation
export { default as WorkflowManagementPage } from './system/WorkflowManagementPage.jsx';
export { default as NotificationManagementPage } from './system/NotificationManagementPage.jsx';
export { default as DocumentManagementPage } from './system/DocumentManagementPage.jsx';

// AI & RAG Services
export { default as AISchedulerPage } from './system/AISchedulerPage.jsx';
export { default as RAGServicePage } from './system/RAGServicePage.jsx';
export { default as SystemHealthDashboard } from './system/SystemHealthDashboard.jsx';
export { default as MissionControlPage } from './system/MissionControlPage.jsx';

// ============================================================================
// 🏗️ PLATFORM & MSP MANAGEMENT
// ============================================================================

// License Management (Platform Admin)
export { default as LicensesManagementPage } from './platform/LicensesManagementPage.jsx';

// Renewals Pipeline (Sales/Maintenance)
export { default as RenewalsPipelinePage } from './platform/RenewalsPipelinePage.jsx';

// Upgrade & Upsell Page
export { default as UpgradePage } from './platform/UpgradePage.jsx';

// Auto Assessment Generator Page
export { default as AutoAssessmentGeneratorPage } from './platform/AutoAssessmentGeneratorPage.jsx';

// Partners & Vendors
export { default as PartnerManagementPage } from './platform/PartnerManagementPage.jsx';

// ============================================================================
// 📋 REGULATORY INTELLIGENCE
// ============================================================================

export { default as RegulatoryIntelligenceEnginePage } from './regulatory/RegulatoryIntelligenceEnginePage.jsx';
export { default as RegulatoryIntelligencePage } from './regulatory/RegulatoryIntelligencePage.jsx';
export { default as RegulatorsPage } from './regulatory/RegulatorsPage.jsx';
export { default as SectorIntelligence } from './regulatory/SectorIntelligence.jsx';
export { default as KSAGRCPage } from './regulatory/KSAGRCPage.jsx';

// ============================================================================
// 📊 REPORTS & ANALYTICS
// ============================================================================

export { default as ReportsPage } from './reports/ReportsPage.jsx';

// ============================================================================
// 🔐 AUTHENTICATION & ACCESS
// ============================================================================

export { default as SimpleLoginPage } from './auth/SimpleLoginPage.jsx';
export { default as StoryDrivenRegistration } from './auth/StoryDrivenRegistration.jsx';

// ============================================================================
// 🌐 PUBLIC & DEMO PAGES
// ============================================================================

export { default as LandingPage } from './public/LandingPage.jsx';
export { default as NotFoundPage } from './public/NotFoundPage.jsx';
export { default as ComponentsDemo } from './public/ComponentsDemo.jsx';
export { default as ModernComponentsDemo } from './public/ModernComponentsDemo.jsx';
export { default as DemoPage } from './public/Demo.jsx';
