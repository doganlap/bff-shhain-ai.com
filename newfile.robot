// grcFrontendTasks.ts
// Canonical backlog for GRC frontend agents.
// Each task is tied to specific modules, endpoints, and React pages/components.

// -------------------- Types --------------------

export type Priority = 1 | 2 | 3 | 4 | 5 | 6;

export type Status = 'todo' | 'in-progress' | 'blocked' | 'done';

export type TaskKind = 'feature' | 'bugfix' | 'refactor' | 'cleanup' | 'integration';

export interface EndpointRef {
  /** apiService group name (e.g. "assessments", "frameworks", "risks", "documents"...) */
  group:
    | 'dashboard'
    | 'assessments'
    | 'frameworks'
    | 'compliance'
    | 'controls'
    | 'organizations'
    | 'regulators'
    | 'risks'
    | 'reports'
    | 'documents'
    | 'evidence'
    | 'workflows'
    | 'vendors'
    | 'notifications'
    | 'regIntel'
    | 'scheduler'
    | 'rag'
    | 'users'
    | 'audit'
    | 'db'
    | 'settings'
    | 'translation'
    | 'auth'
    | 'monitoring'
    | 'vercel'
    | 'tables'
    | 'analytics';
  /** method name inside that group (e.g. "getAll", "create", "getControls", "exportAnalytics"...) */
  name: string;
}

export interface FrontendTask {
  /** Stable machine-friendly ID (use this in tools/orchestrators) */
  id: string;
  /** Short human title */
  title: string;
  /** 1–3 lines description (what the agent should do) */
  summary: string;
  /** Priority from ACTION_PLAN (1 highest). We only use 2–6 here (frontend scope). */
  priority: Priority;
  status: Status;
  kind: TaskKind;
  /** Logical module / domain (assessments, frameworks, risks, vendors, etc.) */
  module: string;
  /** apiService endpoints this task should touch */
  endpoints: EndpointRef[];
  /** React pages/components primarily affected */
  pages: string[];
  /** Optional links to other tasks or backend work items */
  blockedBy?: string[];
  /** Concrete acceptance criteria for auto-validation/manual QA */
  acceptanceCriteria: string[];
  /** Optional extra notes/instructions for agents */
  notes?: string;
}

// -------------------- Tasks --------------------

// Priority 2 – Fix broken pages
// --------------------------------

export const grcFrontendTasks: FrontendTask[] = [
  {
    id: 'P2-workflows-fix-management-page-crash',
    title: 'Fix Workflow Management page crash (workflowTemplates undefined)',
    summary:
      'Refactor WorkflowManagementPage.jsx so it never crashes when templates are missing; load workflow templates from BFF and render proper empty states.',
    priority: 2,
    status: 'todo',
    kind: 'bugfix',
    module: 'workflows',
    endpoints: [
      { group: 'workflows', name: 'getAll' },
      { group: 'workflows', name: 'create' },
      { group: 'workflows', name: 'getById' }
    ],
    pages: ['WorkflowManagementPage.jsx'],
    acceptanceCriteria: [
      'WorkflowManagementPage.jsx renders without runtime errors even when no workflow templates exist.',
      'Templates and existing workflows are loaded via apiService.workflows.* calls only (no mock data).',
      'Empty state UI is shown instead of crashing when arrays/objects are undefined.'
    ],
    notes:
      'Audit the component for any direct usage of workflowTemplates or similar props/state and add safe defaults + loading/error handling.'
  },

  // Priority 3 – Implement missing UI features for core modules
  // --------------------------------

  {
    id: 'P3-assessments-crud-ui',
    title: 'Full CRUD UI for Assessments (AdvancedAssessmentManager)',
    summary:
      'Use AdvancedAssessmentManager.jsx as the main assessments console with list, create, edit, delete, and control mapping, all wired to BFF assessments endpoints.',
    priority: 3,
    status: 'todo',
    kind: 'feature',
    module: 'assessments',
    endpoints: [
      { group: 'assessments', name: 'getAll' },
      { group: 'assessments', name: 'getById' },
      { group: 'assessments', name: 'create' },
      { group: 'assessments', name: 'update' },
      { group: 'assessments', name: 'delete' }
    ],
    pages: [
      'AdvancedAssessmentManager.jsx',
      'AssessmentDetailsCollaborative.jsx',
      'EnhancedDashboard.jsx',
      'EnhancedDashboardV2.jsx'
    ],
    acceptanceCriteria: [
      'Users can create new assessments via UI and see them immediately in the list without a full page reload.',
      'Users can edit and delete existing assessments; updates are persisted via apiService.assessments.* endpoints.',
      'No hardcoded assessment mock data remains; all data comes from the API; loading and error states are handled gracefully.'
    ],
    notes:
      'AdvancedAssessmentManager.jsx already calls apiService.assessments.create/update/delete – ensure this component is mounted from routing and replaces any older, partial assessments page.'
  },
  {
    id: 'P3-assessments-question-workflow',
    title: 'Question engine UI for Assessments (generate + respond + progress)',
    summary:
      'Expose assessment question lifecycle in the UI: generate questions, list them, submit responses, and show progress per assessment.',
    priority: 3,
    status: 'todo',
    kind: 'feature',
    module: 'assessments',
    endpoints: [
      { group: 'assessments', name: 'generateQuestions' },
      { group: 'assessments', name: 'getQuestions' },
      { group: 'assessments', name: 'submitResponse' },
      { group: 'assessments', name: 'getProgress' }
    ],
    pages: ['AssessmentDetailsCollaborative.jsx', 'AdvancedAssessmentManager.jsx'],
    acceptanceCriteria: [
      'From an assessment details page, user can trigger question generation and see generated questions in a structured list.',
      'User can submit responses for each question; responses are persisted via assessments.submitResponse.',
      'A progress indicator (e.g. answered/total) is visible and reflects assessments.getProgress results.'
    ],
    notes:
      'Design this as a stepper/accordion inside AssessmentDetailsCollaborative.jsx or a dedicated drawer/modal; follow existing visual language (lucide icons, cards).'
  },
  {
    id: 'P3-frameworks-crud-and-status-ui',
    title: 'Full CRUD + status management for Frameworks',
    summary:
      'Upgrade framework management to support creating, editing, deleting, and status updates for frameworks, using AdvancedFrameworkManager + FrameworksManagementPage.',
    priority: 3,
    status: 'todo',
    kind: 'feature',
    module: 'frameworks',
    endpoints: [
      { group: 'frameworks', name: 'getAll' },
      { group: 'frameworks', name: 'getById' },
      { group: 'frameworks', name: 'create' },
      { group: 'frameworks', name: 'update' },
      { group: 'frameworks', name: 'delete' },
      { group: 'frameworks', name: 'updateStatus' }
    ],
    pages: [
      'AdvancedFrameworkManager.jsx',
      'FrameworksManagementPage.jsx',
      'ComplianceTrackingModuleEnhanced.jsx',
      'ComplianceTrackingPage.jsx'
    ],
    acceptanceCriteria: [
      'Users can create, edit, and delete frameworks via a single, modern UI (modals or side-panel), persisted via apiService.frameworks.*.',
      'Framework status (active/inactive, etc.) is updated via updateStatus endpoint and correctly reflected by UI badges.',
      'All framework lists (dashboards, tracking modules) reuse a shared data hook or service; no duplicated fetching logic or mock data.'
    ],
    notes:
      'AdvancedFrameworkManager.jsx currently uses raw fetch("/api/grc-frameworks"). Refactor to use apiService.frameworks.* and align with BFF routes.'
  },
  {
    id: 'P3-frameworks-controls-and-coverage-ui',
    title: 'Controls browser + coverage analytics per Framework',
    summary:
      'Provide a deep-dive view for each framework with sections, controls, and coverage/analytics views, integrated into AdvancedFrameworkManager and controls pages.',
    priority: 3,
    status: 'todo',
    kind: 'feature',
    module: 'frameworks',
    endpoints: [
      { group: 'frameworks', name: 'getSections' },
      { group: 'frameworks', name: 'getControls' },
      { group: 'frameworks', name: 'getCoverage' },
      { group: 'frameworks', name: 'getAnalytics' }
    ],
    pages: ['AdvancedFrameworkManager.jsx', 'ControlsModuleEnhanced.jsx', 'ComplianceTrackingModuleEnhanced.jsx'],
    acceptanceCriteria: [
      'Clicking a framework row expands to show its sections and controls pulled from frameworks.getSections/getControls.',
      'Coverage metrics (e.g. implemented vs planned controls) are visualized via cards/charts using frameworks.getCoverage/getAnalytics.',
      'All control listings support search, filter by category/criticality, and link back to related assessments or risks.'
    ],
    notes:
      'Leverage existing card layout and criticality color helpers in AdvancedFrameworkManager.jsx; keep UX consistent with AdvancedAssessmentManager.'
  },
  {
    id: 'P3-risks-crud-assessment-heatmap',
    title: 'Full risk lifecycle UI (CRUD + assess + heatmap)',
    summary:
      'Extend RiskManagementPage.jsx to support creating, editing, deleting risks, running assessments, and rendering a proper risk heatmap using BFF risk endpoints.',
    priority: 3,
    status: 'todo',
    kind: 'feature',
    module: 'risks',
    endpoints: [
      { group: 'risks', name: 'getAll' },
      { group: 'risks', name: 'create' },
      { group: 'risks', name: 'update' },
      { group: 'risks', name: 'delete' },
      { group: 'risks', name: 'assess' },
      { group: 'risks', name: 'addTreatment' },
      { group: 'risks', name: 'getHeatmap' },
      { group: 'risks', name: 'getMetrics' },
      { group: 'risks', name: 'getRealTimeMetrics' },
      { group: 'risks', name: 'export' }
    ],
    pages: ['RiskManagementPage.jsx', 'EnhancedDashboard.jsx', 'EnhancedDashboardV2.jsx'],
    acceptanceCriteria: [
      'RiskManagementPage.jsx has UI for create/update/delete risks and links each risk to frameworks/controls when applicable.',
      'Running a risk assessment calls risks.assess and updates risk scores/heatmap; heatmap comes from risks.getHeatmap/getMetrics, not mock constants.',
      'Export button calls risks.export and downloads data (CSV/Excel) with correct filename and error handling.'
    ],
    notes:
      'Remove all mock arrays/placeholder heatmap data from RiskManagementPage.jsx and any dashboards; use loading skeletons instead of static sample charts.'
  },
  {
    id: 'P3-organizations-admin-and-units-ui',
    title: 'Organizations admin UI (update + units)',
    summary:
      'Upgrade OrganizationsPage.jsx to support editing organization details and browsing/maintaining org units (departments, branches, etc.).',
    priority: 3,
    status: 'todo',
    kind: 'feature',
    module: 'organizations',
    endpoints: [
      { group: 'organizations', name: 'getAll' },
      { group: 'organizations', name: 'getById' },
      { group: 'organizations', name: 'update' },
      { group: 'organizations', name: 'getUnits' }
    ],
    pages: ['OrganizationsPage.jsx'],
    acceptanceCriteria: [
      'OrganizationsPage.jsx shows a paginated/sortable table of organizations backed by organizations.getAll.',
      'Clicking an organization opens a details panel using getById with an editable form persisted via organizations.update.',
      'Org units (getUnits) are visible in a nested table/tree; users can at least view and filter them (editing can be a follow-up task).'
    ],
    notes:
      'Follow the same card/table styling used elsewhere (Tailwind + lucide icons). Keep the component multi-tenant ready by always scoping to tenant/org IDs.'
  },

  // Priority 4 – Build UI for missing modules (Documents, Vendors, RAG, Scheduler, RegIntel...)
  // --------------------------------

  {
    id: 'P4-documents-library-module-ui',
    title: 'Documents library (CRUD + versions + stats)',
    summary:
      'Create a full documents module UI with list, upload, version history, delete, and usage stats, wired to documents API.',
    priority: 4,
    status: 'todo',
    kind: 'feature',
    module: 'documents',
    endpoints: [
      { group: 'documents', name: 'getAll' },
      { group: 'documents', name: 'getById' },
      { group: 'documents', name: 'create' },
      { group: 'documents', name: 'upload' },
      { group: 'documents', name: 'uploadVersion' },
      { group: 'documents', name: 'delete' },
      { group: 'documents', name: 'getVersions' },
      { group: 'documents', name: 'getStats' }
    ],
    pages: ['DocumentsPage.jsx', 'Evidence.jsx', 'AdvancedGRCDashboard.jsx'],
    acceptanceCriteria: [
      'A new DocumentsPage.jsx route exists in navigation with table/cards of documents driven by documents.getAll.',
      'Users can upload a new document and new version of an existing document; actions call documents.upload/uploadVersion and show toasts on success/failure.',
      'Document stats (counts by type/status) are shown via cards or charts using documents.getStats and surface into AdvancedGRCDashboard.jsx.'
    ],
    notes:
      'Design this as a central library powering evidence and reports; re-use existing file upload patterns and avoid base64 in memory if backend already supports streaming.'
  },
  {
    id: 'P4-evidence-advanced-analytics-ui',
    title: 'Advanced evidence UI + analytics',
    summary:
      'Extend Evidence.jsx with CRUD, status updates, categories, and analytics charts using the full evidence API surface.',
    priority: 4,
    status: 'todo',
    kind: 'feature',
    module: 'evidence',
    endpoints: [
      { group: 'evidence', name: 'getAll' },
      { group: 'evidence', name: 'getById' },
      { group: 'evidence', name: 'create' },
      { group: 'evidence', name: 'update' },
      { group: 'evidence', name: 'delete' },
      { group: 'evidence', name: 'upload' },
      { group: 'evidence', name: 'updateStatus' },
      { group: 'evidence', name: 'getCategories' },
      { group: 'evidence', name: 'getStats' },
      { group: 'evidence', name: 'getAnalytics' }
    ],
    pages: ['Evidence.jsx', 'AdvancedGRCDashboard.jsx'],
    acceptanceCriteria: [
      'Evidence.jsx allows creating, editing, deleting, and uploading evidence items via evidence.* endpoints (no mock items).',
      'Evidence items can be filtered by status/category; categories come from evidence.getCategories.',
      'Evidence analytics (e.g. by framework/regulator/status) are shown using evidence.getAnalytics and surfaced in dashboard KPIs.'
    ],
    notes:
      'Align evidence statuses with compliance and risk modules; ensure evidence is linked to controls/assessments by IDs where possible.'
  },
  {
    id: 'P4-workflow-instances-ui',
    title: 'Workflow instances management UI',
    summary:
      'Add UI for creating workflow instances from templates, viewing instance state, and updating instance steps.',
    priority: 4,
    status: 'todo',
    kind: 'feature',
    module: 'workflows',
    endpoints: [
      { group: 'workflows', name: 'getById' },
      { group: 'workflows', name: 'createInstance' },
      { group: 'workflows', name: 'getInstance' },
      { group: 'workflows', name: 'updateInstance' }
    ],
    pages: ['WorkflowManagementPage.jsx'],
    acceptanceCriteria: [
      'From WorkflowManagementPage.jsx, user can create a workflow instance from a template via workflows.createInstance.',
      'An instance details view shows current status/steps using workflows.getInstance.',
      'Users can progress/update steps (approve/reject/complete) via workflows.updateInstance with clear visual feedback.'
    ],
    notes:
      'Use a timeline or stepper component to represent workflow steps. This is a foundation for PMO/delivery workflows in your platform.'
  },
  {
    id: 'P4-vendors-module-ui',
    title: 'Vendor / third-party risk module UI',
    summary:
      'Create a vendors module UI for listing vendors, running vendor assessments, and viewing vendor-specific risks.',
    priority: 4,
    status: 'todo',
    kind: 'feature',
    module: 'vendors',
    endpoints: [
      { group: 'vendors', name: 'getAll' },
      { group: 'vendors', name: 'getById' },
      { group: 'vendors', name: 'create' },
      { group: 'vendors', name: 'assess' },
      { group: 'vendors', name: 'getRisks' }
    ],
    pages: ['VendorsPage.jsx', 'RiskManagementPage.jsx'],
    acceptanceCriteria: [
      'A new VendorsPage.jsx route exists listing vendors from vendors.getAll with search/filter.',
      'User can trigger a vendor assessment via vendors.assess and view high-level results on the vendor details view.',
      'Vendor risks from vendors.getRisks are surfaced and linked to the central risk register.'
    ],
    notes:
      'Treat this as a thin layer over existing risk + assessment modules, but scoped to vendor_id; reuse shared components where possible.'
  },
  {
    id: 'P4-regintel-module-ui',
    title: 'Regulatory Intelligence center UI',
    summary:
      'Expose regulatory intelligence feeds, publications, and change logs via a dedicated UI module.',
    priority: 4,
    status: 'todo',
    kind: 'feature',
    module: 'regIntel',
    endpoints: [{ group: 'regIntel', name: '*' }],
    pages: ['RegIntelCenterPage.jsx', 'AdvancedGRCDashboard.jsx'],
    acceptanceCriteria: [
      'A new RegIntelCenterPage.jsx route exists showing latest regulatory updates grouped by regulator/framework.',
      'User can filter regulatory items by country, regulator, domain, and effective date.',
      'Key metrics (updates by regulator over time) are surfaced into dashboard charts from regIntel API.'
    ],
    notes:
      'Exact regIntel endpoint names can be filled by reading apiEndpoints.js; this task defines the UX structure and wiring to whatever regIntel.* endpoints exist.'
  },
  {
    id: 'P4-scheduler-module-ui',
    title: 'AI Scheduler / jobs UI',
    summary:
      'Build a scheduler console for viewing, creating, and managing background jobs (e.g., assessments, imports, regIntel sync).',
    priority: 4,
    status: 'todo',
    kind: 'feature',
    module: 'scheduler',
    endpoints: [{ group: 'scheduler', name: '*' }],
    pages: ['SchedulerConsolePage.jsx', 'AdvancedAnalyticsDashboard.jsx'],
    acceptanceCriteria: [
      'Scheduler console shows a list of jobs (past & future) with status, next run time, and last result.',
      'User can create or cancel jobs using scheduler.* endpoints where available.',
      'Scheduler stats (success/fail counts, queue depth) appear as KPIs/charts either here or on AdvancedAnalyticsDashboard.'
    ],
    notes:
      'Align naming with any BullMQ/queue semantics used in the BFF. Use color-coded status badges for queued/running/succeeded/failed.'
  },
  {
    id: 'P4-rag-service-ui',
    title: 'RAG (Retrieval-Augmented) service UI',
    summary:
      'Provide a simple RAG console where users can ask questions against ingested content (doc