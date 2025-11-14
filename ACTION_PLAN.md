# GRC Frontend - Action Plan

This document outlines the current state of the frontend application and the necessary steps to complete its development.

## Current State

Our analysis has revealed two critical issues:

1. **Incomplete UI:** Many pages are missing key features (like create, update, delete), and several modules have no UI at all.
2. **Empty Backend Database:** All data-driven pages are currently broken because the backend database has no data. The project is configured to only work with a real, populated database.

**We cannot fix the UI without data. Therefore, the data migration is the highest priority.**

## Action Plan

### Priority 1: Complete Data Migration (Blocked)

- **Action:** Migrate data from the four original databases into the new, single Vercel Postgres database.
- **Status:** **Blocked**. I need the connection details (host, port, user, password, database name) for the four original databases to proceed.

### Priority 2: Connect Pages to Real APIs

- **Action:** Connect all pages to the new centralized BFF APIs and remove mock data.
- **Status:** 5 of 30 pages are fully connected. 2 are in progress. 23 are pending.

**Completed Pages (5/30):**
- `EnhancedDashboard`
- `UserManagementPage`
- `AdvancedShell (Header/Sidebar)`
- `RiskManagementModuleEnhanced`
- `ComplianceTrackingModuleEnhanced`

**In Progress (2/30):**
- `OrganizationsPage`: API calls added, but has syntax errors.
- `ReportsPage`: API calls added, but has syntax errors.

**Next Priority Actions:**
1.  **Fix Broken Pages:**
    -   `OrganizationsPage`: Clean up syntax errors.
    -   `ReportsPage`: Clean up syntax errors.
2.  **Connect High-Priority Pages:**
    -   `AssessmentDetailsCollaborative`
    -   `ControlsModuleEnhanced`
    -   `Evidence`
3.  **Connect System Pages:**
    -   `SettingsPage`
    -   `WorkflowManagementPage`
    -   `NotificationManagementPage`
    -   `DocumentManagementPage`
    -   `AuditLogsPage`

### Priority 3: Implement Missing UI Features

- **Action:** Add the missing "create", "update", and "delete" functionality to existing pages. This will be done as part of connecting each page to the API.

### Priority 4: Build UI for Missing Modules

- **Action:** Create the frontend pages and components for modules that currently have no UI.
- **Modules to build:**
      - Documents
      - Vendors / Partners
      - Regulatory Intelligence
      - AI Scheduler
      - RAG Service
      - And others from the API report.

### Priority 5: Backend Cleanup

- **Action:** Remove all unused API endpoints from the BFF to clean up the codebase.
- **Example Endpoints:** `apiService.dashboard.getActivity`, `apiService.frameworks.import`, and many others identified in the report.

---

## New Backend Architecture

All backend logic has been consolidated into the BFF (Backend-for-Frontend) application, located at `apps/bff`.

The main file that controls all API route mapping is:
`apps/bff/index.js`

### Migrated Routes

The following routes have been migrated from the old `grc-api` microservice to the BFF:

- `/api/admin`
- `/api/vercel`
- `/api/command_center`
- `/api/frameworks`
- `/api/risks`
- `/api/assessments`
- `/api/compliance`
- `/api/controls`
- `/api/organizations`
- `/api/regulators`
- `/api/documents`
- `/api/evidence`
- `/api/workflows`
- `/api/vendors`
- `/api/notifications`
- `/api/reports`

---

### API Endpoint Usage Report

**Verification Summary (November 13, 2025):**
A comprehensive analysis of the frontend codebase (`apps/web/src`) was performed to verify the status of each API endpoint. The findings confirm that the report below is **accurate**. Endpoints marked as **"Not In Use"** have defined backend routes and corresponding functions in the frontend's `apiService`, but no user interface component currently calls them. The "Not In Use" status reflects missing or incomplete UI features.

Here is the complete analysis of all 45 API endpoints defined in
apiEndpoints.js
.

dashboardAPI
getKPIs
: In Use (EnhancedDashboard.jsx, EnhancedDashboardV2.jsx, ModernAdvancedDashboard.jsx)
getHeatmap
: In Use (EnhancedDashboardV2.jsx)
getTrends
: In Use (EnhancedDashboard.jsx, EnhancedDashboardV2.jsx, RegulatoryMarketDashboard.jsx)
getActivity
: Not In Use
assessmentsAPI
getAll
: In Use (EnhancedDashboard.jsx, EnhancedDashboardV2.jsx)
getById
: In Use (
AssessmentDetailsCollaborative.jsx
)
create
: Not In Use
update
: In Use (
AssessmentDetailsCollaborative.jsx
)
delete
: Not In Use
generateQuestions
: Not In Use
getQuestions
: Not In Use
submitResponse
: Not In Use
getProgress
: Not In Use
frameworksAPI
getAll
: In Use (EnhancedDashboard.jsx, ComplianceTrackingModuleEnhanced.jsx, ComplianceTrackingPage.jsx, ControlsModuleEnhanced.jsx, FrameworksManagementPage.jsx)
getById
: In Use (
FrameworksManagementPage.jsx
)
import
: Not In Use
getCoverage
: Not In Use
getSections
: Not In Use
getControls
: Not In Use
getAnalytics
: In Use (
FrameworksManagementPage.jsx
)
create
: Not In Use
update
: Not In Use
delete
: Not In Use
updateStatus
: Not In Use
complianceAPI
getGaps
: In Use (
ComplianceTrackingModuleEnhanced.jsx
)
getScore
: In Use (EnhancedDashboard.jsx,
ComplianceTrackingModuleEnhanced.jsx
)
createTask
: In Use (
ComplianceTrackingModuleEnhanced.jsx
)
getTasks
: In Use (
ComplianceTrackingModuleEnhanced.jsx
, ComplianceTrackingPage.jsx)
updateTask
: In Use (
ComplianceTrackingModuleEnhanced.jsx
)
controlsAPI
getById
: In Use (
ControlsModuleEnhanced.jsx
)
getAll
: In Use (EnhancedDashboard.jsx,
ControlsModuleEnhanced.jsx
)
createTest
: In Use (
ControlsModuleEnhanced.jsx
)
addEvidence
: In Use (
ControlsModuleEnhanced.jsx
)
getImplementation
: In Use (
ControlsModuleEnhanced.jsx
)
updateImplementation
: In Use (
ControlsModuleEnhanced.jsx
)
organizationsAPI
update
: Not In Use
getAll
: In Use (
OrganizationsPage.jsx
)
getById
: Not In Use
getUnits
: Not In Use
regulatorsAPI
getById
: Not In Use
getAll
: In Use (
RegulatorsPage.jsx
)
getPublications
: Not In Use
risksAPI
create
: Not In Use
getAll
: In Use (EnhancedDashboard.jsx,
RiskManagementPage.jsx
)
getById
: Not In Use
update
: Not In Use
delete
: Not In Use
assess
: In Use (
RiskManagementPage.jsx
)
addTreatment
: Not In Use
getHeatmap
: Not In Use
getMetrics
: In Use (
RiskManagementPage.jsx
)
getRealTimeMetrics
: In Use (
RiskManagementPage.jsx
)
export
: In Use (
RiskManagementPage.jsx
)
reportsAPI
run
: Not In Use
getTemplates
: In Use (
ReportsPage.jsx
)
getRuns
: In Use (
ReportsPage.jsx
)
download
: Not In Use
documentsAPI
create
: Not In Use
getAll
: Not In Use
getById
: Not In Use
upload
: Not In Use
uploadVersion
: Not In Use
delete
: Not In Use
getStats
: Not In Use
getVersions
: Not In Use
evidenceAPI
getAll
: In Use (
Evidence.jsx
)
getById
: Not In Use
create
: Not In Use
update
: Not In Use
delete
: In Use (
Evidence.jsx
)
upload
: In Use (
Evidence.jsx
)
getAnalytics
: Not In Use
updateStatus
: Not In Use
getCategories
: Not In Use
getStats
: Not In Use
workflowsAPI
create
: In Use (
WorkflowManagementPage.jsx
)
getAll
: In Use (
WorkflowManagementPage.jsx
)
getById
: Not In Use
createInstance
: Not In Use
getInstance
: Not In Use
updateInstance
: Not In Use
vendorsAPI
create
: Not In Use
getAll
: Not In Use
getById
: Not In Use
assess
: Not In Use
getRisks
: Not In Use
notificationsAPI
send
: Not In Use
getAll
: In Use (
NotificationManagementPage.jsx
)
markAsRead
: In Use (
NotificationManagementPage.jsx
)
markAsUnread
: In Use (
NotificationManagementPage.jsx
)
archive
: In Use (
NotificationManagementPage.jsx
)
delete
: In Use (
NotificationManagementPage.jsx
)
getStats
: In Use (
NotificationManagementPage.jsx
)
getPreferences
: Not In Use
updatePreferences
: Not In Use
regIntelAPI
All endpoints Not In Use
schedulerAPI
All endpoints Not In Use
ragAPI
All endpoints Not In Use
usersAPI
invite
: Not In Use
getAll
: In Use (
UserManagementPage.jsx
)
getById
: Not In Use
update
: Not In Use
assignRoles
: Not In Use
delete
: Not In Use
auditAPI
getLogs
: In Use (
AuditLogsPage.jsx
)
export
: In Use (
AuditLogsPage.jsx
)
dbAPI
All endpoints Not In Use
settingsAPI
All endpoints Not In Use
translationAPI
All endpoints Not In Use
authAPI
All endpoints Not In Use (Note: These are likely used in a different part of the application, not directly in the pages)
monitoringAPI
All endpoints Not In Use
vercelAPI
All endpoints Not In Use
Summary of Findings
Core Modules Partially Implemented: The main GRC modules like Frameworks, Risks, and Assessments are only partially implemented in the UI. They are missing key features like create, update, and delete.
Many Modules Not Implemented at All: A large number of modules, including Documents, Vendors, Regulatory Intelligence, AI Scheduler, and RAG Service, have no UI at all.
Blocked by Lack of Data: All the pages that are connected to the API are currently broken because the backend database is empty.
Recommendation
We have two major problems:

The UI is incomplete.

**Next Step:** Please provide the connection details for your four original databases.
