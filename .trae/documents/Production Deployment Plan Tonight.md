## Goals

* Deploy backend and frontend to production with minimal risk

* Verify assessment features end-to-end and document/evidence operations

* Keep a fast rollback path available for 30–60 minutes post-deploy

## Prerequisites

* Backups: code tag, database snapshot, `.env` copies

* Current commit recorded for rollback

* Team on standby and logs accessible

## Environment & Config

* Database: PostgreSQL reachable with correct `DB_*` vars

* Auth: JWT secret configured

* BFF base URL used by frontend (e.g., `VITE_API_BASE_URL=http://<bff-host>:3005`)

* Optional (Phase 3 future): SMTP and Redis not required tonight

## Deployment Order

1. Backup

   * `git tag production-backup-<date>`

   * `git rev-parse HEAD > ROLLBACK_COMMIT.txt`

   * Copy `.env` for `apps/bff` and `apps/services/grc-api`
2. Pull and install

   * At repo root: `git pull origin main`

   * Install deps in root, `apps/web`, `apps/services/grc-api`, `apps/bff`
3. Backend start (in order)

   * Start `auth-service` (port 3001) and verify `/healthz`

   * Start `grc-api` (port 3006) and verify `/healthz` and `/api/documents`

   * Start `bff` (port 3005) and verify `/healthz` and `/api/documents`
4. Frontend build & deploy

   * `cd apps/web && npm run build`

   * Deploy `dist/` to your web server or serve via Node/PM2

## Verification (Immediate)

* Authentication: `/login`, `/register`

* Assessments: `/app/assessments` list, create, view, answer

* Evidence: upload, list, download, delete via BFF → grc-api

* Exports: PDF and Excel

* Health: app `/health`, API `/api/healthz`

## Monitoring (First 30–60 min)

* Watch BFF and grc-api logs for "Error", "500", routing issues

* Browser console: no 404/CORS/red errors

* Metrics: response time under acceptable threshold, main routes healthy

## Fast Rollback Paths

* Frontend: restore backup or prior commit; rebuild and redeploy

* Document routing: in `apps/bff/index.js`, re-enable `document-service` and proxy back; restart BFF

* Full rollback: stop services, `git reset --hard $(cat ROLLBACK_COMMIT.txt)`, reinstall, rebuild, restart in correct order

## Risk Focus

* Medium: document/evidence upload (BFF → grc-api proxy). Test first; rollback is 5 minutes

* Low: frontend route consolidation/import fixes (build verified)

* None: database schema changes (no changes tonight)

## Success Criteria

* Users can log in and complete an assessment end-to-end

* Document upload/download works without errors

* No critical errors in logs for 30 minutes

* Performance within target thresholds

## Timeline (≈1 hour)

* Backup: 2–5 min

* Pull & install: 5–10 min

* Backend start: 10–15 min

* Frontend build & deploy: 5–10 min

* Verify: 15–20 min

* Monitor: 30 min

## Post-Deploy

* Review overnight logs and performance

* Keep document-service fallback available for 30 days

* Plan partner/notification consolidation in future phases

## Staging (If Available)

* Run full flow on staging before production; then proceed with same order and checks

