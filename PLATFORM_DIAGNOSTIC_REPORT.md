# Shahin Platform – Deployment & Architecture Diagnostic (READ-ONLY)

**Report Generated:** November 16, 2025  
**Analyst:** DevOps Diagnostic Agent (READ-ONLY MODE)  
**Scope:** Comprehensive analysis of codebase, deployments, and infrastructure

---

## 1. Repo Overview

### Structure
- **Type:** Monorepo with pnpm workspaces
- **Main Language:** JavaScript/TypeScript (Node.js 18-22)
- **Architecture:** Microservices (BFF + multiple backend services) + React Frontend
- **VCS:** Git with multiple `.git` folders (main + nested repos)

### Main Apps and Services

| Component | Path | Purpose | Status |
|-----------|------|---------|--------|
| **Landing Page** | `apps/web/www.shahin.com/landing-page/` | Public-facing marketing site | ✅ Deployed on Vercel |
| **Main Dashboard** | `apps/web/` | GRC Assessment application (React + Vite) | ⚠️ Deployment issues |
| **BFF Service** | `apps/bff/` | Backend for Frontend (API Gateway) | ✅ Deployed on Vercel |
| **GRC API** | `apps/web/src/services/grc-api/` | Core GRC business logic service | ❌ Not deployed |
| **CLI Bridge** | `apps/cli-bridge/` | Data migration tool (POC → Production) | 🔨 Development |
| **Infrastructure** | `apps/infra/` | Docker Compose, K8s, monitoring | 📦 Local/On-prem ready |

---

## 2. Frontend Apps

### 2.1 Landing Page (Shahin GRC Marketing Site)

- **Folder:** `apps/web/www.shahin.com/landing-page/`
- **Framework:** React 18 + Vite 5
- **Build Scripts:**
  - `dev`: `vite` (port 5173)
  - `build`: `vite build`
  - `preview`: `vite preview`
- **Key Dependencies:**
  - `react-router-dom@^7.9.6`
  - `framer-motion@^10.16.16`
  - `lucide-react@^0.294.0`
  - `@supabase/supabase-js@^2.81.1` (for booking/contact forms)
- **Environment Variables Expected:**
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
  - `VITE_API_URL`
- **Deployment Target:** Vercel
  - **Vercel Project:** `shahin-landing`
  - **Latest URL:** `https://shahin-landing-e2fmgb7rk-donganksa.vercel.app`
  - **Status:** ✅ Deployed and working
  - **Config:** `vercel.json` present with proper headers

### 2.2 Main GRC Dashboard (Assessment Platform)

- **Folder:** `apps/web/`
- **Framework:** React 18 + Vite 7.2 + React Router 6.30
- **Build Scripts:**
  - `dev`: `vite` (proxies `/api` → `http://localhost:3005`)
  - `build`: `vite build` (outputs to `dist/`)
- **Key Dependencies:**
  - `react-router-dom@^6.30.1`
  - `axios@^1.13.2`
  - `@tanstack/react-query@^5.90.8`
  - `@azure/msal-browser@^4.26.1` (Microsoft SSO)
  - `plotly.js@^3.2.0`, `recharts@^3.4.1` (charting)
  - `i18next@^25.6.2` (Arabic/English i18n)
- **Environment Variables Expected:**
  - `VITE_BFF_URL` (API base URL)
  - `VITE_API_BASE_URL`
  - `VITE_API_URL`
  - `VITE_WS_URL` (WebSocket URL)
  - `VITE_NODE_ENV`
- **Deployment Target:** Vercel
  - **Vercel Project:** `grc-dashboard` or `assessmant-grc`
  - **Alias:** `app-shahin-ai-com.vercel.app`
  - **Latest URL:** Multiple deployment attempts, latest shows 404
  - **Status:** ❌ **BROKEN** - 404 errors, likely routing/build config issue
  - **Config:** `apps/web/vercel.json` exists, hardcoded API URL: `https://assessmant-grc.vercel.app/api`

**⚠️ Critical Issue:** Frontend expects BFF at `https://assessmant-grc.vercel.app/api` but actual BFF is at `https://bff-shahin-ai-com.vercel.app` or `https://bff-seven-beige.vercel.app`.

---

## 3. Backend / BFF / APIs

### 3.1 BFF (Backend for Frontend)

- **Folder:** `apps/bff/`
- **Framework:** Express.js (Node 18-22)
- **Tech Stack:**
  - Express + `http-proxy-middleware` (API Gateway)
  - Prisma ORM (PostgreSQL)
  - JWT authentication (`jsonwebtoken`)
  - Rate limiting (`express-rate-limit`, Redis optional)
  - Security: `helmet`, `cors`, `validator`
  - Monitoring: Sentry, Winston logger
- **Main File:** `index.js` (957 lines)
- **How to Run:**
  - Dev: `npm run dev` (nodemon)
  - Prod: `npm start` → `node index.js`
  - Port: `3005` (default)
- **Environment Variables Required:**
  - `DATABASE_URL` (Postgres connection string)
  - `SHADOW_DATABASE_URL` (for Prisma migrations)
  - `JWT_SECRET`, `JWT_REFRESH_SECRET`
  - `SERVICE_TOKEN` (inter-service auth)
  - `FRONTEND_ORIGINS` (CORS whitelist)
  - `REDIS_URL` (optional, falls back to in-memory)
  - `OPENAI_API_KEY`, `AZURE_OPENAI_*` (for AI features)
  - `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`
  - `SENDGRID_API_KEY` or SMTP credentials
  - `MICROSOFT_CLIENT_ID`, `MICROSOFT_CLIENT_SECRET` (Azure AD)
- **Health Endpoints:**
  - `/healthz` - Basic health check
  - `/readyz` - Readiness probe (checks downstream services)
  - `/api/health` - Same as `/healthz`
  - `/api/ai/health` - AI services health + DB connectivity
- **Deployment Target:** Vercel
  - **Vercel Project:** `bff`
  - **Custom Domain:** `bff-seven-beige.vercel.app` (mentioned in docs)
  - **Latest Working URL:** `https://bff-shahin-ai-hc6q9cm94-donganksa.vercel.app` (verified healthy)
  - **Production URL:** `https://bff-shahin-ai-com.vercel.app` (from `vercel.json`)
  - **Status:** ✅ **DEPLOYED AND HEALTHY** (as of 3 hours ago per status report)
  - **Config:** `apps/bff/vercel.json` exists, uses `@vercel/node` runtime

**⚠️ Critical Gap:** `vercel.json` env vars do NOT include `DATABASE_URL`, `JWT_SECRET`, etc. These must be set in Vercel UI.

### 3.2 GRC API Service (Core Business Logic)

- **Folder:** `apps/web/src/services/grc-api/`
- **Framework:** Express.js
- **Tech Stack:** Similar to BFF (Express + middleware)
- **Main File:** `server.js` (24,103 lines - **MASSIVE FILE**)
- **How to Run:**
  - Dev: `npm run dev`
  - Prod: `node server.js` or `node server-prod.js`
  - Port: `3000` (likely)
- **Environment Variables Required:**
  - Database connection (likely similar to BFF)
  - Service-specific config
- **Health Endpoints:** Likely `/healthz` (standard pattern)
- **Deployment Target:** NOT DEPLOYED
  - **Intended:** Docker (references in `docker-compose.yml` files)
  - **Current Status:** ❌ **NOT DEPLOYED** - Exists only in codebase
  - **Gap:** Frontend and BFF expect this service but it's not running anywhere

### 3.3 Other Microservices (Documented but Not Found)

The BFF `index.js` references these services in the "SERVICE REGISTRY":

```javascript
const services = {
  'grc-api': process.env.GRC_API_URL || 'http://grc-api:3000',
  'auth-service': process.env.AUTH_SERVICE_URL || 'http://auth-service:3001',
  'partner-service': process.env.PARTNER_SERVICE_URL || 'http://partner-service:3003',
  'notification-service': process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:3004',
  'ai-scheduler-service': process.env.AI_SCHEDULER_SERVICE_URL || 'http://ai-scheduler-service:3005',
  'rag-service': process.env.RAG_SERVICE_URL || 'http://rag-service:3006',
  'regulatory-intelligence-ksa': process.env.REGULATORY_SERVICE_URL || 'http://regulatory-intelligence-ksa:3008'
};
```

**Status:** ❌ **NONE OF THESE SERVICES ARE DEPLOYED**
- Default URLs use Docker DNS names (`http://service-name:port`)
- These would only work in a Docker Compose environment
- No evidence of Azure Container Apps, AWS ECS, or other container deployments

**⚠️ Critical Architecture Issue:** The BFF acts as an API Gateway but all downstream services are missing. The BFF likely has consolidated routes that directly handle requests, but any proxy calls will fail.

---

## 4. Database & Storage

### 4.1 Database Type

- **Type:** PostgreSQL
- **ORM:** Prisma 6.19.0
- **Schema Location:** `apps/bff/prisma/schema.prisma` (1,128 lines)
- **Key Models:**
  - `User`, `Organization`, `Tenant`
  - `Assessment`, `Control`, `Framework`, `Evidence`
  - `Risk`, `AuditLog`, `Session`
  - Multi-tenant architecture with `tenant_id` indexing
  - RLS (Row-Level Security) support via `rlsContext.js` middleware

### 4.2 Migrations

- **Location:** `apps/bff/prisma/migrations/`
- **Migrations Found:**
  - `20251113062242_init/migration.sql` - Initial schema
  - `20251114_three_access_paths/migration.sql` - Multi-access paths (Demo, Partner, POC)
  - `migration_lock.toml` - Lock file
- **How to Run:**
  - `npx prisma migrate deploy` (in production)
  - `npx prisma migrate dev` (in development)

### 4.3 Database Connection

- **Production DB:** NOT VISIBLE IN CODE
  - `DATABASE_URL` is required but not hardcoded (security: ✅ good)
  - Must be set in Vercel environment variables
- **Local/Dev DB:** References to `localhost:5432` in Docker configs
- **Shadow DB:** `SHADOW_DATABASE_URL` required for Prisma migrations

**⚠️ Critical Gap:** No evidence that `DATABASE_URL` is configured in Vercel deployment. BFF might be running without a database, or using an old/test DB.

### 4.4 Seed Scripts

- **Location:** Multiple `seed-*.js` files in repo root and `apps/bff/`
- **Examples:**
  - `seed_grc_data.sql`
  - `apps/bff/seed-database.js`
  - Various CSV import scripts
- **How to Run:** `node seed-database.js` or `npx prisma db seed`

---

## 5. AI & External Integrations

### 5.1 OpenAI Integration

- **Usage:** RAG embeddings, AI-powered GRC recommendations
- **Environment Variables:**
  - `OPENAI_API_KEY`
  - `OPENAI_ORG_ID`
  - `OPENAI_MODEL` (default: `text-embedding-ada-002`)
- **Files:** References in `apps/bff/.env.example`, root `.env` files
- **Status:** ⚠️ **PARTIALLY CONFIGURED** - Keys exist in .env examples but unknown if set in production

### 5.2 Azure OpenAI

- **Usage:** Alternative to OpenAI (likely for Saudi/KSA compliance)
- **Environment Variables:**
  - `AZURE_OPENAI_ENDPOINT` (e.g., `https://shahin-openai.openai.azure.com/`)
  - `AZURE_OPENAI_KEY`
  - `AZURE_OPENAI_DEPLOYMENT`
  - `AZURE_OPENAI_API_VERSION`
- **Status:** ⚠️ **CONFIGURED BUT NOT VERIFIED** - Examples show proper naming convention but no evidence of active keys

### 5.3 Anthropic Claude

- **Package:** `@anthropic-ai/sdk@^0.68.0` in root `package.json`
- **Usage:** Likely for AI analysis features
- **Environment Variables:** Expected `ANTHROPIC_API_KEY` (not found explicitly but package is installed)
- **Status:** ❓ **UNKNOWN** - Package installed but no clear usage pattern found

### 5.4 HuggingFace

- **Usage:** Local LLM inference (mentioned in docs)
- **Environment Variables:** Expected but not found
- **Status:** ❓ **UNKNOWN** - No clear integration code found

### 5.5 Azure Cognitive Services

- **Vision API:** `https://shahin-vision.cognitiveservices.azure.com`
- **Speech API:** `https://shahin-speech.cognitiveservices.azure.com`
- **Status:** ⚠️ **MENTIONED IN CSP HEADERS** - URLs are whitelisted in Content Security Policy but no actual integration code found

### 5.6 Other Integrations

| Service | Purpose | Env Vars | Status |
|---------|---------|----------|--------|
| **Stripe** | Payments | `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY` | ⚠️ Documented |
| **SendGrid** | Emails | `SENDGRID_API_KEY`, `SENDGRID_FROM_EMAIL` | ⚠️ Documented |
| **Microsoft Azure AD** | SSO | `MICROSOFT_CLIENT_ID`, `MICROSOFT_CLIENT_SECRET` | ⚠️ Configured in BFF |
| **Zakat.ie** | Islamic charity | `ZAKAT_API_KEY`, `ZAKAT_API_URL` | ❓ Documented but unused |
| **Supabase** | Landing page forms | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` | ✅ Used in landing page |

---

## 6. Vercel / Azure / Docker Deployment Notes

### 6.1 Vercel Deployments

#### Currently on Vercel:

1. **Landing Page** ✅
   - Project: `shahin-landing`
   - Folder: `apps/web/www.shahin.com/landing-page/`
   - Config: `vercel.json` exists
   - Status: **LIVE AND WORKING**

2. **BFF Service** ✅
   - Project: `bff`
   - Folder: `apps/bff/`
   - Config: `vercel.json` exists
   - Latest URL: `https://bff-shahin-ai-hc6q9cm94-donganksa.vercel.app`
   - Production URL: `https://bff-shahin-ai-com.vercel.app`
   - Status: **DEPLOYED AND HEALTHY**
   - **Gap:** Environment variables (DATABASE_URL, JWT_SECRET, etc.) likely not set or using old values

3. **Main Dashboard** ❌
   - Project: `grc-dashboard` or `assessmant-grc`
   - Folder: `apps/web/`
   - Config: `vercel.json` exists (root and `apps/web/`)
   - Latest URL: Multiple attempts, all showing 404
   - Status: **BROKEN** - Deployment succeeds but serves 404
   - **Root Cause:** Likely mismatch between `vercel.json` output directory and actual build output

#### Root `vercel.json` (d:\Projects\GRC-Master\Assessmant-GRC\vercel.json):
```json
{
  "buildCommand": "cd apps/web && pnpm run build",
  "outputDirectory": "apps/web/dist",
  "functions": {
    "apps/bff/index.js": { "runtime": "nodejs20.x" }
  }
}
```

**Issue:** This tries to deploy BOTH frontend and BFF together, but BFF has its own separate Vercel project.

### 6.2 Docker / Container Deployment

#### Docker Compose Files Found:

1. **Production:** `apps/infra/deployment/docker-compose.production.yml`
   - Services: nginx (reverse proxy), certbot (SSL), web (frontend), bff, grc-api, auth-service, partner-service, notification-service
   - Network: `grc-network`
   - Volumes: SSL certs, persistent data
   - **Status:** ❌ **NOT DEPLOYED** - Config exists but not running anywhere

2. **Development:** `apps/infra/docker/docker-compose.dev.yml`
   - Similar services, dev configuration
   - **Status:** 🔧 For local development only

3. **Ecosystem:** `apps/infra/docker/docker-compose.ecosystem.yml`
   - Full microservices stack
   - **Status:** 🔧 For local development only

#### Docker Images:
- `apps/web/Dockerfile.prod` - Frontend production build
- `apps/bff/Dockerfile` - BFF production build
- Multiple service Dockerfiles in `apps/web/src/services/`

**⚠️ Critical Gap:** Full microservices architecture is designed for Docker/K8s but NO CONTAINER RUNTIME IS DEPLOYED. All services except BFF and landing page are missing.

### 6.3 Azure Deployment

- **Evidence:** Multiple `.md` files mention Azure (AZURE_DEPLOYMENT.md, AZURE_STATUS_REPORT.md)
- **Config:** No active Azure Container Apps or App Service configs found
- **Status:** ❌ **NOT CURRENTLY DEPLOYED** - Docs exist but no active deployment

### 6.4 Kubernetes (K8s)

- **Folder:** `apps/infra/k8s/`
- **Status:** 📦 **CONFIGS EXIST** but not deployed

---

## 7. Risks & Gaps (NO FIXES, JUST NOTES)

### 🔴 Critical Risks

1. **Frontend 404 Issue**
   - Main GRC Dashboard app is not accessible
   - Multiple deployment attempts all fail with 404
   - **Impact:** Users cannot access the primary application
   - **Likely Cause:** Mismatch between Vercel routing config and Vite build output

2. **Missing Backend Services**
   - BFF expects 7+ microservices but NONE are deployed
   - Services: grc-api, auth-service, partner-service, notification-service, ai-scheduler, rag-service, regulatory-intelligence
   - **Impact:** Any BFF API calls that proxy to these services will fail with 502 Bad Gateway
   - **Likely Mitigation:** BFF has consolidated some functionality directly (not using proxies), but this is not documented

3. **Database Connection Unknown**
   - No evidence that `DATABASE_URL` is set in Vercel BFF project
   - BFF health check might pass but any DB-dependent endpoints will fail
   - **Impact:** User authentication, data persistence likely broken or using wrong database

4. **Environment Variables Gap**
   - `.env` files exist locally with placeholder values
   - No clear documentation of what's actually set in Vercel production
   - Critical vars like `JWT_SECRET`, `DATABASE_URL`, `STRIPE_SECRET_KEY` status unknown
   - **Impact:** Security risk if defaults are used; functionality broken if not set

5. **Frontend-Backend URL Mismatch**
   - Frontend hardcoded to `https://assessmant-grc.vercel.app/api`
   - BFF is actually at `https://bff-shahin-ai-com.vercel.app` or `https://bff-seven-beige.vercel.app`
   - **Impact:** All API calls from frontend will fail (CORS errors, 404s)

### 🟡 Medium Risks

6. **AI Services Not Configured**
   - OpenAI, Azure OpenAI keys exist in examples but unknown if set in production
   - AI features (RAG, embeddings, recommendations) likely non-functional
   - **Impact:** Advanced AI features broken, but core GRC functionality may still work

7. **Missing Monitoring**
   - Sentry DSN is empty in config
   - Winston logs go to console only (ephemeral in serverless)
   - **Impact:** No visibility into production errors or performance

8. **Redis Optional but Not Configured**
   - BFF uses Redis for rate limiting and token blacklist
   - Falls back to in-memory, which won't work across multiple Vercel serverless instances
   - **Impact:** Rate limiting ineffective, logout/token revocation won't work properly

9. **Multiple Git Repos**
   - `.git` folders found in multiple nested paths
   - Could lead to version control conflicts or lost changes
   - **Impact:** Development workflow complexity, risk of code loss

10. **Dead Microservices References**
    - Code has extensive integration for services that don't exist
    - Maintenance burden: dead code paths, confusing for new developers
    - **Impact:** Code complexity, potential bugs if someone tries to use these features

### 🟢 Low Risks / Observations

11. **Landing Page Isolated**
    - Landing page is working and isolated from broken dashboard
    - Uses separate Supabase for forms
    - **Good:** Marketing site still functional even if app is down

12. **Docker/K8s Ready**
    - Comprehensive Docker Compose and K8s configs exist
    - Migration path available if you want to move off Vercel
    - **Good:** Not locked into Vercel serverless

13. **Prisma Migrations Exist**
    - Database schema is version-controlled
    - Migrations can be replayed
    - **Good:** Database state is reproducible

14. **CLI Bridge Tool**
    - Sophisticated POC-to-production data migration tool exists
    - Security-focused with admin approval workflow
    - **Status:** In development, not deployed

15. **I18n Support**
    - Arabic/English bilingual support throughout
    - **Good:** Ready for KSA/GCC market

---

## 8. Deployment Readiness Summary

### What Works Right Now ✅

- **Landing Page:** Fully functional, deployed on Vercel
- **BFF Health Check:** Returns 200 OK with valid JSON
- **BFF Core Routes:** Some routes likely working (those not requiring DB or downstream services)

### What's Broken ❌

- **Main GRC Dashboard:** 404 on all deployment URLs
- **Database-Dependent Features:** Unknown if connected
- **All Backend Microservices:** Not deployed (grc-api, auth-service, etc.)
- **AI Features:** Likely not working (no API keys visible)
- **Inter-Service Communication:** BFF→Microservices proxying will fail

### What's Required to Fully Restore Platform 🔧

1. **Immediate (Critical Path):**
   - Fix frontend 404 issue (likely `vercel.json` routing config)
   - Set `DATABASE_URL` in Vercel BFF environment variables
   - Set `JWT_SECRET` and `JWT_REFRESH_SECRET` in BFF
   - Update frontend `VITE_BFF_URL` to match actual BFF URL
   - Re-deploy frontend with correct BFF URL

2. **High Priority (Full Functionality):**
   - Deploy GRC API service (the 24K line `server.js`)
   - Set all AI provider keys (OpenAI or Azure OpenAI)
   - Configure Redis for proper session/rate limit management
   - Set up Sentry for production monitoring
   - Verify all Prisma migrations have run on production DB

3. **Medium Priority (Enhanced Features):**
   - Deploy remaining microservices (auth, partner, notification, etc.) OR remove dead code
   - Configure Stripe for payments
   - Configure SendGrid or SMTP for emails
   - Set up Microsoft Azure AD SSO

4. **Nice to Have:**
   - Custom domain mapping (currently using Vercel auto-generated URLs)
   - SSL certificate automation
   - Monitoring dashboards
   - CI/CD pipelines (workflows exist but may not be configured)

---

## 9. Recommended Deployment Strategy (NOT IMPLEMENTATION, JUST PLAN)

### Option A: Vercel-Only (Simplest)

**Pros:** Already partially deployed, serverless scalability  
**Cons:** Database connection limits, cold starts, can't run microservices  

**Steps:**
1. Fix frontend routing in `apps/web/vercel.json`
2. Set all environment variables in Vercel UI for BFF project
3. Deploy single GRC API as separate Vercel project
4. Update BFF to point to new GRC API URL
5. Re-deploy frontend with correct BFF URL

### Option B: Hybrid (Vercel Frontend + Docker Backend)

**Pros:** Full microservices, better control, existing Docker configs  
**Cons:** Need container hosting (Azure Container Apps, AWS ECS, etc.)  

**Steps:**
1. Deploy Docker Compose stack to Azure Container Apps / AWS ECS
2. Get public URLs for all services
3. Update BFF service registry with new URLs
4. Update frontend to point to Azure/AWS-hosted BFF
5. Keep landing page on Vercel (it's working)

### Option C: All Docker (Most Complete)

**Pros:** Matches existing architecture, full feature set  
**Cons:** Most complex, need SSL/domain management, higher cost  

**Steps:**
1. Deploy full `docker-compose.production.yml` stack
2. Configure nginx reverse proxy with SSL
3. Point domain DNS to Docker host
4. Run Prisma migrations in production
5. Configure all environment variables

---

**END OF DIAGNOSTIC REPORT**

This report is READ-ONLY. No files were modified, no deployments were changed, no commands were executed beyond information gathering. Next steps require human decision-making on deployment strategy and access to Vercel/hosting credentials.
