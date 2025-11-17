## Priorities
- Restore real API functionality for: Dashboards, Assessments, Risks, Compliance, Documents/Evidence
- Bring online Partner, Notifications, RAG, and Regulatory services (non-demo)
- Keep demo mode disabled; use real DB-backed data with clear error handling

## Environment & Connectivity
- Confirm frontend proxy to BFF at `http://localhost:3005` and CORS accepts `http://localhost:5177`
- Run BFF at `3005`; start local services with health endpoints on fixed ports:
  - grc-api `3001`, auth-service `3002`, partner-service `3003`, notification-service `3004`, rag-service `3006`, ai-scheduler-service `3007`, regulatory-intelligence-ksa `3008`
- Verify `/health` and `/health/detailed` in BFF reflect accurate service status

## Database & Migrations
- Align Prisma schema to include minimal models required by target pages:
  - Framework, Control, Organization (present), plus Risk, Assessment, Evidence, Document, ComplianceSummary, DashboardStat
- Write and apply migrations to create missing tables (risk, assessment, evidence, documents, compliance summaries, dashboard stats)
- Seed minimal records to make pages non-empty:
  - Risks: 2 entries linked to `org-ksa-1`
  - Assessments: 2 entries linked to seeded controls and risks
  - Evidence: 1–2 entries per assessment (file metadata only)
  - ComplianceSummary: aggregated by framework for `org-ksa-1`
  - DashboardStat: KPIs, trends, usage counters

## BFF Routes: Implement Real Data
- Dashboards (`apps/bff/routes/dashboard.js`):
  - Implement handlers for KPIs, heatmaps, trends using `DashboardStat` and aggregated queries
  - Ensure tenant filtering and pagination
- Compliance (`apps/bff/routes/compliance.js`):
  - Implement summary and score endpoints from `ComplianceSummary` and controls coverage
- Assessments (`apps/bff/routes/assessments.js`):
  - List, detail, controls mapping
  - Implement evidence upload/list endpoints (`apps/bff/routes/evidence.js`) with local storage and DB metadata
- Risks (`apps/bff/routes/risks.js`):
  - List, detail, analytics (counts by status/category)
- Documents (`apps/bff/routes/documents.js`):
  - Implement list/upload/download metadata using `Document` table (store files locally in dev)

## Services Startup (Non-Demo)
- Partner-service `apps/web/src/services/partner-service/server.js`:
  - Start server with `/health`, `/api/partners` minimal routes querying DB or returning 200 with empty list
- Notification-service `apps/web/src/services/notification-service/server.js`:
  - Start server with `/health`, `/api/notifications` (queue stub, persist metadata in DB)
- RAG-service `apps/web/src/services/rag-service/server.js`:
  - Start server with `/health`, `/api/rag/query` returning deterministic mock from DB (no demo UI fallbacks)
- Regulatory-intelligence-ksa `apps/web/src/services/regulatory-intelligence-service-ksa/server.js`:
  - Start server with `/health`, expose `/api/regulatory/latest` (reads from DB seed)

## Frontend Pages: Data Wiring
- EnhancedDashboard/Tenant/Regulatory dashboards:
  - Wire to `/api/dashboard/*` endpoints; implement loading/error states (no mock)
- Assessments pages & evidence upload:
  - Use `/api/assessments` and `/api/evidence` endpoints; show empty state when no data
- Risks management views:
  - Use `/api/risks/*` endpoints; provide filters and empty-state handling
- Compliance tracking pages:
  - Use `/api/compliance/*` endpoints; render summary metrics and charts
- Documents/Evidence libraries:
  - Use `/api/documents` and `/api/evidence` endpoints; file metadata only in dev
- POC/Partner shells:
  - Ensure routes call partner/notification services; show empty state on 200 with empty data

## Verification & Acceptance
- API checks:
  - `GET /api/health` → 200; `/health/detailed` shows all services healthy
  - Dashboards: `GET /api/dashboard/stats`, `/api/dashboard/trends` → 200 JSON
  - Compliance: `GET /api/compliance/score`, `/api/compliance/summary` → 200 JSON
  - Assessments: `GET /api/assessments`, `GET /api/evidence?assessmentId=...` → 200 JSON
  - Risks: `GET /api/risks`, `/api/risks/analytics` → 200 JSON
  - Documents: `GET /api/documents` → 200 JSON
- UI checks:
  - Dashboards render KPIs and charts (from seeded stats)
  - Assessments list shows seeded items; evidence upload succeeds (stores metadata)
  - Risks list and analytics render
  - Compliance summary shows values for seeded frameworks
  - Documents library shows seeded document metadata

## Rollback & Safety
- No demo fallbacks; endpoints return 4xx/5xx on failure
- Keep seeds minimal and clearly labeled; local storage for files in dev only
- Use feature flags/env to guard non-essential services

## Timeline (Dev)
- Day 1: Migrations, seeds, start services, wire dashboards/compliance
- Day 2: Assessments/evidence, risks, documents
- Day 3: Partner/notifications/RAG/regulatory services, polish and verify all pages

## Deliverables
- Applied migrations and seeds
- Running services with health endpoints
- Pages backed by real APIs, passing smoke tests
- Verification report with endpoint responses and screenshots (optional)