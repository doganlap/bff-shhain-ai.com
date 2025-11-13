# GRC Master - Routes Reference Guide

## Overview
All pages are now imported from centralized `'./pages'` index and routes are configured with enhanced modules as defaults.

---

## 🚀 Quick Access URLs

### Enhanced Modules (Default Routes)

| Module | URL | Description |
|--------|-----|-------------|
| **Dashboard** | `/app` or `/app/dashboard` | Enhanced dashboard with KPIs, heatmaps, trends |
| **Assessments** | `/app/assessments` | Enhanced assessments with RAG, questions, collaboration |
| **Frameworks** | `/app/frameworks` | Enhanced frameworks with import/export, coverage |
| **Controls** | `/app/controls` | Enhanced controls with evidence, testing |
| **Risk Management** | `/app/risks` or `/app/risk-management` | Enhanced with L×I matrix, heat maps, treatments |
| **Compliance Tracking** | `/app/compliance` or `/app/compliance-tracking` | Enhanced with gap analysis, scoring |

---

## 📋 Complete Route Structure

### Public Routes

```
/                           → Glassmorphic Login Page
/login                      → Glassmorphic Login Page
/login-glass                → Glassmorphic Login Page
/register                   → Story-Driven Registration
/landing                    → Redirect to https://shahin-ai.com
/home                       → Redirect to https://shahin-ai.com
/404                        → Not Found Page
```

### Advanced Routes (AdvancedAppShell)

```
/advanced                   → Advanced GRC Dashboard
/advanced/assessments       → Advanced Assessment Manager
/advanced/frameworks        → Advanced Framework Manager
```

### Main Application Routes (AppLayout)

#### Dashboard Routes

```
/app                        → Enhanced Dashboard (default)
/app/dashboard              → Enhanced Dashboard
/app/dashboard/legacy       → Legacy Dashboard
/app/dashboard/advanced     → Advanced GRC Dashboard
```

#### Assessment Routes

```
/app/assessments                      → Enhanced Assessments Module
/app/assessments/enhanced             → Enhanced Assessments Module
/app/assessments/legacy               → Legacy Assessments Page
/app/assessments/advanced             → Advanced Assessment Manager
/app/assessments/new                  → Create New Assessment (Advanced)
/app/assessments/:id                  → Assessment Details (Collaborative)
/app/assessments/:id/collaborative    → Collaborative Assessment Details
```

#### Framework Routes

```
/app/frameworks                 → Enhanced Frameworks Module
/app/frameworks/enhanced        → Enhanced Frameworks Module
/app/frameworks/legacy          → Legacy Frameworks Page
/app/frameworks/advanced        → Advanced Framework Manager
/app/frameworks/:id             → Framework Details (Advanced)
```

#### Controls Routes

```
/app/controls               → Enhanced Controls Module
/app/controls/enhanced      → Enhanced Controls Module
/app/controls/legacy        → Legacy Controls Page
/app/controls/list          → Controls List
/app/controls/:id           → Control Details
```

#### Evidence Routes

```
/app/evidence               → Evidence Management
```

#### Risk Management Routes

```
/app/risks                  → Enhanced Risk Management Module
/app/risk-management        → Enhanced Risk Management Module
/app/risks/enhanced         → Enhanced Risk Management Module
/app/risks/legacy           → Legacy Risk Management Page
/app/risks/list             → Risks List
```

#### Compliance Tracking Routes

```
/app/compliance             → Enhanced Compliance Tracking Module
/app/compliance-tracking    → Enhanced Compliance Tracking Module
/app/compliance/enhanced    → Enhanced Compliance Tracking Module
/app/compliance/legacy      → Legacy Compliance Tracking Page
```

#### Organization Management Routes

```
/app/organizations          → Organizations Page (requires: organizations.read)
/app/organizations/list     → Organizations List (requires: organizations.read)
/app/organizations/new      → Create New Organization (requires: organizations.write)
/app/organizations/:id      → Organization Details (requires: organizations.read)
/app/organizations/:id/edit → Edit Organization (requires: organizations.write)
```

#### User Management Routes

```
/app/users                  → User Management Page (requires: users.manage)
/app/partners               → Partner Management Page (requires: partners.manage)
```

#### Audit & Compliance Routes

```
/app/audit-logs             → Audit Logs Page (requires: audit.read)
/app/regulators             → Regulators Page
/app/sector-intelligence    → Sector Intelligence (requires: intelligence.read)
```

#### AI & Intelligence Routes

```
/app/ai-scheduler           → AI Scheduler Page (requires: ai.access)
/app/rag                    → RAG Service Page (requires: ai.access)
/app/rag-service            → RAG Service Page (requires: ai.access)
/app/regulatory-intelligence → Regulatory Intelligence (requires: intelligence.read)
/app/regulatory-engine      → Regulatory Intelligence Engine (requires: intelligence.admin)
```

#### System & Workflow Routes

```
/app/documents              → Document Management Page (requires: documents.manage)
/app/document-management    → Document Management Page (requires: documents.manage)
/app/workflows              → Workflow Management Page (requires: workflows.manage)
/app/workflow-management    → Workflow Management Page (requires: workflows.manage)
/app/notifications          → Notification Management Page
/app/notification-management → Notification Management Page
/app/performance            → Performance Monitor (requires: system.monitor)
/app/performance-monitor    → Performance Monitor (requires: system.monitor)
```

#### Administration & System Routes

```
/app/database               → Database Page (requires: system.admin)
/app/api-management         → API Management Page (requires: system.admin)
/app/reports                → Reports Page (requires: reports.export)
/app/settings               → Settings Page (requires: system.configure)
```

#### Demo & Special Routes

```
/app/components-demo        → Components Demo
/app/ksa-grc                → KSA GRC Page
```

---

## 🔐 Permission Requirements

Routes are protected with the following permission checks:

| Permission | Routes |
|------------|--------|
| `organizations.read` | Organizations list, details |
| `organizations.write` | Create/edit organizations |
| `users.manage` | User management |
| `partners.manage` | Partner management |
| `audit.read` | Audit logs |
| `intelligence.read` | Sector intelligence, regulatory intelligence |
| `intelligence.admin` | Regulatory engine |
| `ai.access` | AI scheduler, RAG service |
| `documents.manage` | Document management |
| `workflows.manage` | Workflow management |
| `system.monitor` | Performance monitoring |
| `system.admin` | Database, API management |
| `reports.export` | Reports |
| `system.configure` | Settings |

---

## 📦 Import Structure

All pages are now imported from a centralized index:

```javascript
import {
  // Enhanced Modules
  EnhancedDashboard,
  AssessmentsModuleEnhanced,
  ComplianceTrackingModuleEnhanced,
  RiskManagementModuleEnhanced,
  FrameworksModuleEnhanced,
  ControlsModuleEnhanced,
  
  // Legacy Modules
  Dashboard,
  Assessments,
  // ... all other pages
} from './pages';
```

---

## 🎯 Default Behavior

### Enhanced Modules are Now Default

When users navigate to these routes, they get the enhanced modules by default:

- `/app` → EnhancedDashboard
- `/app/dashboard` → EnhancedDashboard
- `/app/assessments` → AssessmentsModuleEnhanced
- `/app/frameworks` → FrameworksModuleEnhanced
- `/app/controls` → ControlsModuleEnhanced
- `/app/risks` → RiskManagementModuleEnhanced
- `/app/compliance` → ComplianceTrackingModuleEnhanced

### Legacy Routes Available

Legacy versions are still accessible via `/legacy` suffix:

- `/app/dashboard/legacy` → Dashboard (old)
- `/app/assessments/legacy` → Assessments (old)
- `/app/frameworks/legacy` → FrameworksPage (old)
- `/app/controls/legacy` → ControlsPage (old)
- `/app/risks/legacy` → RiskManagementPage (old)
- `/app/compliance/legacy` → ComplianceTrackingPage (old)

---

## 🔄 Redirect Routes

For backward compatibility:

```
/dashboard → /app
/admin → /advanced
* → /404
```

---

## 🚀 Getting Started

1. **Login**: Navigate to `/` or `/login`
2. **Main App**: After login, you'll land on `/app` (Enhanced Dashboard)
3. **Navigate**: Use sidebar or direct URLs to access modules
4. **Enhanced Features**: All core modules now use enhanced versions by default
5. **Legacy Access**: Use `/legacy` suffix if needed for old versions

---

## 📝 Example Navigation Flow

```
User visits: https://app.shahin-ai.com/
    ↓
Redirected to: /login (GlassmorphismLoginPage)
    ↓
After authentication
    ↓
Lands on: /app (EnhancedDashboard with KPIs, heatmaps)
    ↓
Clicks "Assessments" in sidebar
    ↓
Navigates to: /app/assessments (AssessmentsModuleEnhanced)
    ↓
Views comprehensive assessments with RAG features
```

---

## 🎨 Module Features

### EnhancedDashboard (`/app/dashboard`)
- Real-time KPIs (compliance, gaps, risks, assessments)
- Interactive heatmaps (controls × status, risks × score)
- 30/90-day trend charts
- Recent activity feed
- Framework summary
- Gap details

### AssessmentsModuleEnhanced (`/app/assessments`)
- Full CRUD operations
- RAG-powered question generation
- Collaborative responses
- Progress tracking
- Status badges
- Pagination

### ComplianceTrackingModuleEnhanced (`/app/compliance`)
- Real-time compliance scoring
- Gap identification
- Framework score cards
- Remediation task management
- Overdue tracking

### RiskManagementModuleEnhanced (`/app/risks`)
- L×I matrix (1-25 scale)
- Interactive heat map (5×5)
- Heat band classification
- Treatment planning
- Residual risk tracking

### FrameworksModuleEnhanced (`/app/frameworks`)
- Framework library
- Import/Export functionality
- Coverage analysis
- Control mapping
- Version tracking

### ControlsModuleEnhanced (`/app/controls`)
- Control lifecycle management
- Evidence management
- Testing & validation
- Effectiveness assessment
- Multi-framework mapping

---

## ✅ All Routes Active

All 60+ pages are now loaded and accessible via centralized imports from `'./pages'`.

---

*Last Updated: 2025-11-12*
*GRC Master - Shahin-AI Platform*
