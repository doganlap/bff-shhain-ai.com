# GRC Assessment System  
  
## ?? Arabic-English Bilingual GRC Platform  
  
A comprehensive Governance, Risk, and Compliance system with Enhanced Glass Sidebar featuring:  
  
### ? **Key Features**  
- **??? Glass Sidebar Enhanced** with active highlighting  
- **?? 6 AI Agents** with real API endpoints  
- **?? Command Palette** (Ctrl/?K) with keyboard shortcuts  
- **?? Arabic-English Bilingual** support with RTL layout  
- **?? Secure Authentication** with glassmorphic login  
- **?? Responsive Design** for all devices  
  
### ?? **Quick Start**  
```bash  
# Install dependencies  
cd apps/web  
npm install  
  
# Start development server  
npm run dev  
```  
  
### ?? **Access Points**  
- **Frontend**: http://localhost:5173  
- **Login**: Bilingual authentication page  
- **Dashboard**: Enhanced glass sidebar with AI agents  
  
### ?? **Deployment Ready**
This application is configured for deployment to:
- Vercel
- Netlify
- GitHub Pages 

## System Map & Status

| Area | Route/Path | File | Purpose | Status |
|------|------------|------|---------|--------|
| Landing + Login | `/` | `apps/web/src/App.jsx:172–176` | Entry page with login | Active |
| Login redirect | `/login` | `apps/web/src/App.jsx:198–201` | Forces login via `/` | Active |
| Canonical host guard | n/a | `apps/web/src/App.jsx:138–165` | Redirect non-canonical hosts to `https://www.shahin-ai.com` | Active (prod) |
| ProtectedRoute | n/a | `apps/web/src/components/auth/ProtectedRoute.jsx:71–73` | Gate unauthenticated users to `/` | Active |
| App layout | `/app/*` | `apps/web/src/App.jsx:218–223` | Authenticated application shell | Protected |
| Advanced shell | `/advanced/*` | `apps/web/src/App.jsx:207–216` | Advanced authenticated area | Protected |
| Tenant routes | `/tenant/:tenantId/*` | `apps/web/src/App.jsx:448–452` | Tenant-scoped app shell | Protected |
| Frontend API client | n/a | `apps/web/src/services/api.js:3` | Axios client using `VITE_BFF_URL` | Active |
| Endpoint definitions | n/a | `apps/web/src/services/apiEndpoints.js:15–25` | Consolidated REST endpoints | Active |
| WebSocket client | n/a | `apps/web/src/services/websocket.js` | Real-time updates channel | Active |
| Frontend CSP | n/a | `apps/web/index.html:12` | `connect-src` includes canonical/BFF domains | Active |
| Frontend preview server | `/api/*` | `apps/web/api/index.js:11` | Express server for preview/health | Active |
| Frontend vercel entry | n/a | `apps/web/vercel.js:1` | Exports Express app for Vercel | Active |
| BFF server | `/api/*` | `apps/bff/index.js` | Orchestration layer, CORS, security | Configured |
| BFF CORS origins | n/a | `apps/bff/config/env.js:12–24` | Centralized allowed origins | Configured |
| BFF routes | n/a | `apps/bff/routes/*` | Module endpoints (assessments, frameworks, etc.) | Active |
| Health (frontend) | `/api/health` | `apps/web/api/index.js:69–77` | Basic health check JSON | Active |
| Health (BFF) | `/health` | `apps/bff/routes/health.js` | BFF health endpoints | Active |
| Origin check (auth-service) | `/api/auth/login` | `apps/web/src/services/auth-service/routes/auth.js:193–200` | Only allow `Origin: https://www.shahin-ai.com` (prod) | Active |
| Origin check (grc-api) | `/login` | `apps/web/src/services/grc-api/routes/auth.js:9–15` | Only allow canonical origin (prod) | Active |
| Origin check (landing backend) | `/login` | `apps/web/www.shahin.com/backend/routes/auth.js:15–22` | Only allow canonical origin (prod) | Active |

## Discussion & Tracking Notes

- Domain rule: Login only via `https://www.shahin-ai.com` on `/`; deep links without session redirect to `/`.
- Centralized client usage: Prefer `apps/web/src/services/api.js` + `apiEndpoints.js` for all HTTP calls.
- CORS: Configure `FRONTEND_ORIGINS` in BFF env to `https://www.shahin-ai.com` for production; include localhost for dev.
- CSP: Keep `connect-src` aligned with BFF/backend domains to avoid violations.

## API Inventory Summary (Counts)

| BFF Module (file) | Endpoint count |
|-------------------|----------------|
| payments.js | 8 |
| auth.js | 2 |
| zakat.js | 7 |
| regulators.js | 14 |
| rag.js | 9 |
| scheduler.js | 11 |
| documents.js | 8 |
| controls.js | 6 |
| frameworks.js | 7 |
| notifications.js | 9 |
| organizations.js | 7 |
| workflows.js | 11 |
| vendors.js | 10 |
| strategic.js | 4 |
| compliance.js | 3 |
| assessments.js | 9 |
| risks.js | 10 |
| publicAccess.js | 3 |
| agents.js | 5 |
| reports.js | 4 |
| evidence.js | 10 |
| command_center.js | 2 |
| health.js | 7 |
| vercel.js | 2 |
| adminRoutes.js | 2 |
| Total (BFF) | 170 |

| Frontend SDK (apiEndpoints.js export) | Coverage |
|--------------------------------------|----------|
| dashboardAPI | ✅ |
| assessmentsAPI | ✅ |
| frameworksAPI | ✅ |
| complianceAPI | ✅ |
| controlsAPI | ✅ |
| organizationsAPI | ✅ |
| regulatorsAPI | ✅ |
| risksAPI | ✅ |
| reportsAPI | ✅ |
| documentsAPI | ✅ |
| evidenceAPI | ✅ |
| workflowsAPI | ✅ |
| vendorsAPI | ✅ |
| notificationsAPI | ✅ |
| regIntelAPI | ✅ |
| schedulerAPI | ✅ |
| ragAPI | ✅ |
| usersAPI | ✅ |
| auditAPI | ✅ |
| dbAPI | ✅ |
| settingsAPI | ✅ |
| translationAPI | ✅ |
| authAPI | ✅ |

Notes:
- GRC-API route layer contains ~259 endpoints across 43 files (`apps/web/src/services/grc-api/routes/*`). Use these SDKs via BFF where possible to keep the frontend decoupled.
- For maintainability, keep adding new endpoints to `apiEndpoints.js` so the UI references one consolidated client.
