# Shahin Platform – Deployment & Architecture Diagnostic (READ-ONLY)

## 1. Repo Overview

- **Structure:** The repository is a large pnpm monorepo. Key directories include `apps` for applications, `prisma` for the database schema, and `scripts` for automation. A `pnpm-workspace.yaml` file at the root manages the workspace structure.
- **Main Apps and Services:**
  - **`apps/web`:** The main GRC dashboard application (React + Vite).
  - **`apps/web/www.shahin.com/landing-page`:** A separate landing page application (React + Vite).
  - **`apps/bff`:** A core "Backend-for-Frontend" API Gateway (Node.js + Express).
  - **`apps/services/notification-service`:** A microservice for handling notifications.
  - **Other Microservices (Missing):** The BFF is configured to proxy requests to several other microservices (`grc-api`, `auth-service`, `rag-service`, etc.) whose source code is not present in the `apps/services` directory.
  - **Infrastructure:** Configuration for Docker (`apps/infra/docker`), Vercel (`vercel.json`), and Prisma exists.

## 2. Frontend Apps

### GRC Dashboard

- **Name & Folder:** `grc-glass-dashboard` (`apps/web`)
- **Framework & Scripts:**
  - **Framework:** React + Vite
  - **Scripts:** `dev` (vite), `build` (vite build), `preview` (vite preview)
- **Required Env Vars:**
  - `VITE_APP_VERSION`: App version.
  - `VITE_API_URL`: URL for the main backend BFF.
  - `VITE_AZURE_OPENAI_ENDPOINT`: Azure OpenAI endpoint.
  - `VITE_AZURE_OPENAI_KEY`: Azure OpenAI API key.
  - `VITE_AZURE_COMPUTER_VISION_ENDPOINT`: Azure Vision endpoint.
  - `VITE_AZURE_SPEECH_ENDPOINT`: Azure Speech endpoint.
- **Intended Deployment Target:** Vercel. A `vercel.json` file exists in the app's root, and the BFF has a `vercel-build` script.

### Landing Page

- **Name & Folder:** `shahin-grc-landing-page` (`apps/web/www.shahin.com/landing-page`)
- **Framework & Scripts:**
  - **Framework:** React + Vite + Tailwind CSS
  - **Scripts:** `dev` (vite), `build` (vite build), `preview` (vite preview)
- **Required Env Vars:**
  - `VITE_API_URL`: Points to the production backend (`grc-backend-prod` on Azure Container Apps).
  - `VITE_FRONTEND_URL`: Points to the production frontend (`grc-frontend-prod` on Azure Container Apps).
  - `SUPABASE_URL`: URL for a Supabase project.
  - `SUPABASE_ANON_KEY`: Public key for a Supabase project.
- **Intended Deployment Target:** Docker. A `docker-compose.yml` is present in `apps/web/www.shahin.com` that builds and runs this application.

## 3. Backend / BFF / APIs

### Backend-for-Frontend (BFF)

- **Name & Folder:** `grc-bff` (`apps/bff`)
- **Tech Stack:** Node.js, Express, Prisma
- **How it is expected to run (dev/prod):**
  - **Dev:** Via `docker-compose` which runs the `Dockerfile.dev` using `nodemon` for hot-reloading.
  - **Prod:** Likely as a Vercel Serverless Function or a Docker container. The `vercel-build` script and presence of `index.js` as the main entry point support this.
- **Health Endpoints:** A health check is configured at the root (`/`) which returns the service status.
- **Required Env Vars:**
  - `DATABASE_URL`: PostgreSQL connection string.
  - `JWT_SECRET`: Secret key for token authentication.
  - `SERVICE_TOKEN`: For inter-service communication.
  - `GRC_API_URL`, `AUTH_SERVICE_URL`, `PARTNER_SERVICE_URL`, `NOTIFICATION_SERVICE_URL`, `AI_SCHEDULER_SERVICE_URL`, `RAG_SERVICE_URL`, `REGULATORY_SERVICE_URL`: URLs for downstream microservices.
  - `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`: For Stripe integration.
  - `OPENAI_API_KEY`: For OpenAI integration.
  - `REDIS_URL`: For connecting to the Redis cache.

### Notification Service

- **Name & Folder:** `notification-service-enhanced` (`apps/services/notification-service`)
- **Tech Stack:** Node.js (assumed, based on Docker setup).
- **How it is expected to run (dev/prod):**
  - **Dev:** Via `docker-compose` which builds its `Dockerfile.dev`.
  - **Prod:** Likely as a Docker container on a platform like Azure Container Apps.
- **Health Endpoints:** Not immediately visible, but expected.
- **Required Env Vars:**
  - `DATABASE_URL`: PostgreSQL connection string.
  - `REDIS_URL`: Redis connection string.
  - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`: For email sending (e.g., SendGrid).
  - `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`: For SMS via Twilio.

## 4. Database & Storage

- **DB Type and Tools:** PostgreSQL is the primary database, managed by the Prisma ORM.
- **Existing Migration/Seed Scripts:**
  - Prisma handles migrations (inferred from `prisma` directory and scripts).
  - A manual SQL seed script exists: `seed_grc_data.sql`.
  - Numerous other `.sql` files exist for backups, merges, and fixes.
- **Production vs. Local DBs:**
  - The `docker-compose.yml` for development sets up a local `grc-postgres-dev` container.
  - The `DATABASE_URL` in a `.js` file in the `bff` app points to a `db.prisma.io` hosted database, likely used for staging or a previous development setup.

## 5. AI & External Integrations

- **List of AI Providers:**
  - OpenAI (Official)
  - Azure OpenAI
  - Azure Cognitive Services (Vision, Speech)
  - Hugging Face (Inference API)
- **Integration Details:**
  - **OpenAI:** Used in the `bff` via the `openai` package and called directly from the frontend. Requires `OPENAI_API_KEY`.
  - **Azure AI:** Used in the `web` app. Requires `VITE_AZURE_OPENAI_ENDPOINT`, `VITE_AZURE_OPENAI_KEY`, `VITE_AZURE_COMPUTER_VISION_ENDPOINT`, `VITE_AZURE_SPEECH_ENDPOINT`.
  - **Hugging Face:** The URL `api-inference.huggingface.co` is whitelisted in the frontend's security policy, indicating usage.
  - **Stripe:** Integrated into the `bff` for payments. Requires `STRIPE_SECRET_KEY`.
  - **Supabase:** Used by the `landing-page` app. Requires `SUPABASE_URL` and `SUPABASE_ANON_KEY`.
  - **SendGrid/Twilio:** Used by the `notification-service` for emails and SMS.

## 6. Vercel / Azure / Docker Deployment Notes

- **Vercel:**
  - The `web` (GRC Dashboard) and `bff` apps appear designed for Vercel deployment, evidenced by `vercel.json` files and `vercel-build` scripts.
- **Docker/Azure:**
  - The `landing-page` and `notification-service` are explicitly defined in `docker-compose.yml` files.
  - The `landing-page`'s Docker configuration contains a default `VITE_API_URL` pointing to an Azure Container App URL (`grc-backend-prod.delightfulwave-81a84bdf.eastus.azurecontainerapps.io`), strongly suggesting the production environment for the backend is intended for Azure.

## 7. Risks & Gaps (NO FIXES, JUST NOTES)

- **Missing Microservices:** The largest gap is the absence of source code for critical backend services (`grc-api`, `auth-service`, `partner-service`, `ai-scheduler-service`, `rag-service`, `regulatory-service`). The `bff` cannot function without them. They are likely expected to be deployed from separate repositories or pre-built Docker images.
- **Inconsistent Deployment Targets:** The GRC dashboard (`web`) and `bff` seem targeted for Vercel, while the `landing-page` and backend services (based on the URL hint) are targeted for Docker/Azure Container Apps. This hybrid approach can be complex to manage.
- **Separated Landing Page Backend:** The `landing-page` uses Supabase, which is different from the main application's PostgreSQL/Prisma stack. This creates a separate data silo.
- **Hardcoded Production URL:** The `landing-page`'s `docker-compose.yml` contains a hardcoded URL to a specific Azure Container App environment. If this environment is down or has been deleted, the landing page will fail to connect to the backend.
- **Incomplete Service Directory:** The `apps/services/notification-service` directory appears incomplete, lacking a `package.json` or source files, though it is defined in the Docker Compose file. The code is likely copied into the image during the build process.
