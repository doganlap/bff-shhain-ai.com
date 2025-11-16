# Shahin GRC Platform - Module Structure

## **9 Main Demo/Service Modules**

### **1. 🎯 Core GRC Module (Governance, Risk & Compliance)**
**Pages (8):**
- `grc-modules/RiskManagementPage.jsx` - Risk management dashboard
- `grc-modules/ComplianceTrackingPage.jsx` - Compliance monitoring
- `grc-modules/FrameworksManagementPage.jsx` - Regulatory frameworks
- `grc-modules/AssessmentDetailsCollaborative.jsx` - Collaborative assessments
- `grc-modules/EvidenceManagementPage.jsx` - Evidence documentation
- `grc-modules/ControlsModuleEnhanced.jsx` - Control management
- `grc-modules/RiskManagementModuleEnhanced.jsx` - Advanced risk tools
- `grc-modules/RiskManagementModuleV2.jsx` - Risk management v2

**Components (6):**
- `cards/AssessmentCards.jsx` - Assessment card components
- `analytics/AdvancedAnalyticsPanel.jsx` - Analytics dashboard
- `evidence/EvidenceUpload.jsx` - Evidence upload interface
- `common/PermissionBasedCard.jsx` - Permission-based UI cards
- `Regulatory/ImpactAssessmentModal.jsx` - Impact assessment modal
- `Regulatory/RegulatoryIntelligenceCenter.jsx` - Regulatory intelligence

---

### **2. 📊 Dashboard & Analytics Module**
**Pages (6):**
- `dashboard/EnhancedDashboard.jsx` - Main dashboard
- `dashboard/EnhancedDashboardV2.jsx` - Dashboard v2
- `dashboard/ModernAdvancedDashboard.jsx` - Modern dashboard
- `dashboard/RegulatoryMarketDashboard.jsx` - Regulatory market view
- `dashboard/TenantDashboard.jsx` - Multi-tenant dashboard
- `dashboard/UsageDashboardPage.jsx` - Usage analytics

**Components (8):**
- `dashboard/AdvancedAnalyticsPanel.jsx` - Advanced analytics
- `dashboard/RealTimeMonitor.jsx` - Real-time monitoring
- `dashboard/QuickActionsToolbar.jsx` - Quick action toolbar
- `dashboard/RoleDashboardCards.jsx` - Role-based cards
- `AdvancedGRCDashboard.jsx` - GRC-specific dashboard
- `DemoDashboard.jsx` - Demo dashboard
- `DashboardPreview.jsx` - Dashboard preview
- `AdvancedStats.jsx` - Advanced statistics

---

### **3. 🏛️ Regulatory Intelligence Module**
**Pages (5):**
- `regulatory/KSAGRCPage.jsx` - KSA GRC compliance
- `regulatory/RegulatorsPage.jsx` - Regulator management
- `regulatory/RegulatoryIntelligenceEnginePage.jsx` - Intelligence engine
- `regulatory/RegulatoryIntelligenceEnhancedPage.jsx` - Enhanced intelligence
- `regulatory/SectorIntelligence.jsx` - Sector-specific intelligence

**Components (4):**
- `Regulatory/RegulatoryDashboardWidget.jsx` - Regulatory widgets
- `Regulatory/ComplianceCalendarWidget.jsx` - Compliance calendar
- `Regulatory/RegulatoryFeedWidget.jsx` - Regulatory feed
- `SaudiFrameworks.jsx` - Saudi-specific frameworks

---

### **4. 🤖 AI & Automation Module**
**Pages (2):**
- `ai-services/SchedulerConsolePage.jsx` - AI scheduler console
- `platform/AutoAssessmentGeneratorPage.jsx` - Auto assessment generator

**Components (8):**
- `ai/AIStatusPanel.jsx` - AI status monitoring
- `agents/AIAgentsPanel.jsx` - AI agents management
- `AgentFactoryMonitor.jsx` - Agent factory monitoring
- `landing/AITeamShowcase.jsx` - AI team showcase
- `landing/FloatingAIAgent.jsx` - Floating AI assistant
- `system/AISchedulerPage.jsx` - AI scheduling (system page)
- `system/RAGServicePage.jsx` - RAG service integration
- `AdvancedAssessmentManager.jsx` - AI-powered assessment manager

---

### **5. 🏢 Organization & User Management Module**
**Pages (4):**
- `organizations/Organizations.jsx` - Organization management
- `organizations/OrganizationDetails.jsx` - Organization details
- `organizations/OrganizationForm.jsx` - Organization forms
- `organizations/OnboardingPage.jsx` - User onboarding

**Components (3):**
- `system/UserManagementPage.jsx` - User management (system)
- `auth/SimpleLoginPage.jsx` - Authentication
- `auth/StoryDrivenRegistration.jsx` - Story-driven registration
- `auth/ProtectedRoute.jsx` - Route protection
- `MultiTenancy/MultiTenancyGuide.jsx` - Multi-tenancy guide

---

### **6. 📋 Platform Management Module**
**Pages (4):**
- `platform/PartnerManagementPage.jsx` - Partner management
- `platform/LicensesManagementPage.jsx` - License management
- `platform/RenewalsPipelinePage.jsx` - Renewal pipeline
- `platform/UpgradePage.jsx` - Platform upgrades

**Components (4):**
- `Subscription/SubscriptionManager.jsx` - Subscription management
- `Subscription/AdvancedFeatureExamples.jsx` - Feature examples
- `Examples/SubscriptionUsageExample.jsx` - Usage examples
- `UserFlow/UserFlowGuide.jsx` - User flow guidance

---

### **7. 📊 Reports & Analytics Module**
**Pages (1):**
- `reports/ReportsPage.jsx` - Main reports page
- `dashboards/DBIDashboardPage.jsx` - DBI-specific dashboard

**Components (2):**
- `analytics/AdvancedAnalyticsDashboard.jsx` - Advanced analytics
- `analytics/AdvancedAnalyticsPanel.jsx` - Analytics panels

---

### **8. ⚙️ System Administration Module**
**Pages (11):**
- `system/SystemHealthDashboard.jsx` - System health
- `system/MissionControlPage.jsx` - Mission control
- `system/PerformanceMonitorPage.jsx` - Performance monitoring
- `system/WorkflowManagementPage.jsx` - Workflow management
- `system/SettingsPage.jsx` - System settings
- `system/NotificationManagementPage.jsx` - Notifications
- `system/DocumentManagementPage.jsx` - Document management
- `system/AuditLogsPage.jsx` - Audit logs
- `system/APIManagementPage.jsx` - API management
- `system/DatabasePage.jsx` - Database management
- `system/RAGServicePage.jsx` - RAG service

**Components (8):**
- `monitoring/RealTimeMonitor.jsx` - Real-time monitoring
- `monitoring/PerformanceMonitor.jsx` - Performance monitoring
- `notifications/NotificationCenter.jsx` - Notification center
- `common/DataTable.jsx` - Data tables
- `common/ErrorBoundary.jsx` - Error boundaries
- `common/CommandPalette.jsx` - Command palette
- `common/ErrorHandler.jsx` - Error handling
- `common/LoadingSpinner.jsx` - Loading indicators

---

### **9. 💰 Finance & Business Management Module**
**Pages (4):**
- `platform/RenewalsPipelinePage.jsx` - 120-day renewal pipeline
- `landing/PricingPage.jsx` - Pricing tiers and plans
- `subscription/BillingPage.jsx` - Billing management
- `subscription/InvoiceManagementPage.jsx` - Invoice tracking

**Components (12):**
- `landing/Pricing.jsx` - 3-tier pricing structure (Starter/Professional/Enterprise)
- `Subscription/SubscriptionManager.jsx` - Subscription context and feature gating
- `Subscription/AdvancedFeatureExamples.jsx` - Feature demonstration
- `Examples/SubscriptionUsageExample.jsx` - Usage examples
- `billing/BillingDashboard.jsx` - Billing analytics
- `billing/PaymentMethods.jsx` - Payment method management
- `billing/InvoiceGenerator.jsx` - Invoice generation
- `billing/RevenueAnalytics.jsx` - Revenue tracking
- `subscription/PlanComparison.jsx` - Plan comparison tool
- `subscription/FeatureLimits.jsx` - Feature limit tracking
- `subscription/TrialManager.jsx` - Trial period management
- `subscription/ChurnPrevention.jsx` - Churn prevention tools

---

## **Demo/Service Module Presentation Summary**

### **Module Sizes (for Demo Prioritization):**
1. **System Administration**: 19 files (11 pages + 8 components) - **LARGEST**
2. **Core GRC Module**: 14 files (8 pages + 6 components)
3. **Dashboard & Analytics**: 14 files (6 pages + 8 components)
4. **Finance & Business Management**: 16 files (4 pages + 12 components)
5. **AI & Automation**: 10 files (2 pages + 8 components)
6. **Organization Management**: 9 files (4 pages + 5 components)
7. **Regulatory Intelligence**: 9 files (5 pages + 4 components)
8. **Platform Management**: 8 files (4 pages + 4 components)
9. **Reports & Analytics**: 3 files (1 page + 2 components) - **SMALLEST**

### **Demo Flow Recommendation:**
1. **Start with Dashboard Module** (visual impact)
2. **Show Core GRC** (main value proposition)
3. **Demonstrate AI Features** (differentiator)
4. **Present Regulatory Intelligence** (compliance focus)
5. **Show Finance & Business Management** (revenue model)
6. **Display Organization Management** (scalability)
7. **Present Reports & Analytics** (insights)
8. **Show Platform Management** (enterprise features)
9. **System Administration** (technical depth)

**Total: 223 React files organized into 9 logical modules**

---

## LLM Demo Kit (from `D:\LLM`) — mappings and planned additions (no impact to counts)

This section maps common LLM workspace assets to concrete UI surfaces in the platform, so they can be showcased in the demo without altering the existing module totals above. Files listed here are planned additions and can be scaffolded as needed.

### Asset-to-UI mapping
- Prompt Library (templates, versions, approvals) → `ai/PromptLibrary.jsx`
- Knowledge Bases (doc upload, chunking, embeddings) → `rag/KnowledgeBaseManager.jsx`
- Retrieval & RAG pipelines (collections, re-index) → `system/RAGServicePage.jsx` (existing) + `rag/RAGPipelines.jsx`
- Agents & Tools (multi-step workflows) → `agents/AgentStudio.jsx`
- Jobs & Scheduling (batch runs, re-embeddings) → `ai-services/SchedulerConsolePage.jsx` (existing)
- Evals & Test Suites (accuracy, hallucination, safety) → `ai/EvalsDashboard.jsx`
- Safety Guardrails (PII redaction, jailbreak filters) → `ai/GuardrailsManager.jsx`
- Monitoring & Cost (latency, tokens, spend) → `analytics/LLMCostAnalytics.jsx`
- Model Router (fallbacks, A/B, provider switching) → `ai/ModelRouter.jsx`
- Chat/Playground (tools, citations) → `ai/Playground.jsx`

### Planned pages (for demo routing)
- `ai/PlaygroundPage.jsx` — Unified chat playground with tools and citations
- `ai/PromptLibraryPage.jsx` — Curated prompt templates and versions
- `rag/KnowledgeBasePage.jsx` — KB management (sources, indexing status)
- `ai/EvalsPage.jsx` — Run eval suites, compare models
- `ai/GuardrailsPage.jsx` — Configure and test safety policies
- `ai/ModelRouterPage.jsx` — Routing rules, A/B tests, fallbacks
- `agents/AgentStudioPage.jsx` — Visual builder for agent workflows

### Planned components (composable building blocks)
- `ai/PromptEditor.jsx` — Template editor with variables and previews
- `rag/DocumentUploader.jsx` — PDF/Doc ingest with parsing feedback
- `rag/CollectionSelector.jsx` — Choose KB/collection for RAG
- `ai/TraceViewer.jsx` — Step-by-step call traces with tokens/cost
- `ai/LatencySpendChart.jsx` — Charts for latency and spend
- `ai/GuardrailTester.jsx` — Input sandbox for redaction/jailbreak tests
- `ai/ABTestConfigurator.jsx` — Define and monitor A/B experiments

### High-value demo scenarios (LLM-powered)
- Regulatory Q&A with citations (RAG over uploaded frameworks) via `ai/PlaygroundPage.jsx`
- AI-generated assessment draft from KB + prompt template via `ai/PromptLibraryPage.jsx`
- Evidence summarization for a control (PDF to structured evidence) via `rag/KnowledgeBasePage.jsx`
- Safety policy demo (redact PII, block jailbreak) via `ai/GuardrailsPage.jsx`
- Model routing tradeoff (quality vs cost) via `ai/ModelRouterPage.jsx` and `ai/EvalsPage.jsx`
- Agent workflow (intake → classify → map to controls → notify) via `agents/AgentStudioPage.jsx`

### Integration touchpoints with existing modules
- Use `system/RAGServicePage.jsx` for indexing status and pipeline health
- Surface LLM usage/cost in `analytics/AdvancedAnalyticsPanel.jsx` and `monitoring/PerformanceMonitor.jsx`
- Gate LLM features with `Subscription/SubscriptionManager.jsx` (Enterprise)
- Respect multi-tenancy by scoping KBs and prompts per organization

Note: These entries are planned for the demo kit and do not change the current module counts or totals above. Once we scaffold these files, we can fold them into the relevant modules’ lists and update counts accordingly.