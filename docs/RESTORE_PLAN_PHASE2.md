# Shahin Platform – Phase 2 FOUNDATION (Trae)

## 1. Current State (short summary)

The Shahin GRC platform is a monorepo with multiple applications:
- `apps/web` - Main React/Vite dashboard (currently not running locally)
- `apps/bff` - Backend-for-Frontend Express gateway (needs local setup)
- `apps/web/www.shahin.com/landing-page` - Marketing site (currently live at shahin-ai.com)
- Multiple microservices under `apps/web/src/services/*`

Current issues:
- Only landing page is deployed and working
- Main backend/BFF endpoints are dead (assessmant-grc.vercel.app)
- Frontend env defaults point to dead endpoints
- BFF + services expect Postgres + Redis + SERVICE_TOKEN
- AI integrations exist but may have missing keys

## 2. Target Minimum Stack (BFF + web + Postgres)

Goal: Establish local development foundation with:
- BFF running locally on port 3005
- Dashboard running locally on Vite port 5173
- Dashboard talks to BFF via env-based URLs
- Health endpoints working without crashes
- AI health check that doesn't crash when keys are missing

## 3. Changes Planned (Bullets)

- Fix BFF package.json dev script
- Create BFF .env.stage.example with placeholders
- Add/verify BFF health endpoint
- Create frontend .env.stage.example
- Replace hard-coded backend URLs with env variables
- Add Foundation Test page for health checks
- Implement /api/ai/health endpoint (non-crashing)
- Document staging deployment configuration

## 4. Execution Log

- [x] apps/bff/package.json → Dev script confirmed working (nodemon index.js)
- [x] apps/bff/.env.stage.example → Created with placeholder environment variables
- [x] apps/bff/routes/health.js → Health endpoint exists and comprehensive (/, /detailed, /ready, /live, /git, /database, /vercel/status)
- [x] apps/web/package.json → Dev script confirmed working (vite)
- [x] apps/web/.env.stage.example → Created with frontend environment variables
- [x] apps/web/src/services/api.js → Fixed hard-coded fallback URL to localhost:3005/api
- [x] apps/web/src/components/landing/FloatingAIAgent.jsx → Updated hard-coded API URLs to localhost:3005
- [x] apps/web/vercel.json → Updated CORS headers and environment variables for staging
- [x] apps/web/src/pages/FoundationTest.jsx → Created comprehensive test page for BFF/AI health checks
- [x] apps/web/src/config/routes.jsx → Added FoundationTest route at /foundation-test
- [x] apps/bff/routes/agents.js → Added /api/ai/health endpoint (non-crashing)
- [x] apps/bff/routes/ai.js → Created dedicated AI routes file with health endpoint
- [x] apps/bff/index.js → Mounted AI router at /api/ai path

## 5. Vercel Configuration Analysis

**Frontend Vercel Setup (apps/web/vercel.json):**
- Build: pnpm run build with dist output directory
- Framework: Vite with Node.js 20.x runtime
- Regions: iad1 (US East)
- CORS: Configured for localhost:5173, shahin-ai.com domains
- Environment Variables: Using Vercel placeholders (@vite_bff_url, @vite_api_url, etc.)
- Security Headers: Comprehensive CSP, HSTS, X-Content-Type-Options
- Rewrites: API routes to /api/index.js, SPA fallback to /index.html

**Staging Deployment Notes:**
- Frontend can be deployed to Vercel with environment variables configured in Vercel dashboard
- BFF requires separate deployment (not Vercel-ready due to database/Redis dependencies)
- Local development uses localhost:3005 for BFF, localhost:5173 for frontend
- Production domains: shahin-ai.com, grc.shahin-ai.com

## 6. Local Development Setup

**To start local development:**
```bash
# Terminal 1 - BFF
cd apps/bff
cp .env.stage.example .env  # Fill in required values
pnpm install
pnpm dev  # Runs on http://localhost:3005

# Terminal 2 - Frontend
cd apps/web
cp .env.stage.example .env  # Optional, defaults work for local
pnpm install
pnpm dev  # Runs on http://localhost:5173
```

**Test the foundation:**
- Visit http://localhost:5173/foundation-test
- Check BFF health: http://localhost:3005/api/health
- Check AI health: http://localhost:3005/api/ai/health

## 7. Blockers / Open Questions

- Database connection requirements for full functionality (PostgreSQL)
- Redis dependency for production features (caching, sessions)
- SERVICE_TOKEN configuration needs (32+ character secret)
- AI key management strategy (OpenAI, Azure, HuggingFace)
- BFF deployment strategy (needs containerization or separate hosting)