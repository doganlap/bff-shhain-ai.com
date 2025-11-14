---
description: Repository Information Overview
alwaysApply: true
---

# GRC Ecosystem - Repository Information

## Repository Summary

A comprehensive **Governance, Risk, and Compliance (GRC)** platform built with modern microservices architecture. This monorepo contains a React/Vite frontend dashboard, Express backend-for-frontend (BFF) gateway, multiple specialized services, and infrastructure configuration. The system includes assessment generation, workflow management, document processing, RAG-based intelligence, and multi-tenant support with enterprise-grade security.

## Repository Structure

### Main Directory Overview

- **apps/web**: React/Vite frontend dashboard (GRC Glass Dashboard) with integrated microservices
- **apps/bff**: Backend-for-Frontend API gateway using Express + Prisma
- **apps/infra**: Infrastructure setup (Docker, Kubernetes, nginx, monitoring)
- **apps/contracts**: API contract definitions and event schemas
- **apps/cli-bridge**: CLI bridge system for command-line operations
- **apps/ABI**: Architecture Business Insights with design guidelines
- **apps/services**: Notification and other specialized microservices
- **root**: Monorepo orchestration and shared utilities

### Main Repository Components

- **Frontend Dashboard**: React-based glassmorphism UI with 10+ pages, internationalization (AR/EN)
- **BFF API Gateway**: Express server with Prisma ORM, rate limiting, RBAC, tenant isolation
- **Microservices**: GRC API, Auth, Document Processing, Partner Integration, Notification, RAG, Regulatory Intelligence, WebSocket
- **Database**: PostgreSQL with Prisma migrations and schema management
- **Infrastructure**: Docker Compose, Kubernetes configs, nginx reverse proxy, Azure deployment
- **Integrations**: Azure AD, Microsoft SSO, OpenAI, Google Generative AI, Anthropic, Cohere

## Language & Runtime

**Languages**: JavaScript (Node.js), TypeScript, Python (FastAPI)  
**Node.js Version**: >=18.0.0  
**.NET SDK**: 8.0.415, 9.0.306 (for Azure integration)  
**Python**: 3.11+ (if Python services utilized)  
**Package Manager**: npm 8.x+  
**Build Tools**: Vite 5.x, Node.js native  

## Projects Overview

### 1. Frontend Dashboard (apps/web)

**Main File**: `apps/web/vite.config.js`  
**Entry Point**: `apps/web/index.html`  
**Language**: React 18 + TypeScript (JSX)  
**Build System**: Vite 5  
**Package Manager**: npm  

#### Dependencies

**Core**: React 18.2.0, React Router 6.30.1, React DOM 18.2.0  
**State & Data**: @tanstack/react-query 5.90.8, axios 1.13.2  
**UI Framework**: Tailwind CSS 3.3.5, lucide-react icons, framer-motion animations  
**Charts**: react-plotly.js 2.6.0, react-google-charts 5.2.1, recharts 3.4.1  
**Forms**: react-hook-form, @hookform/resolvers  
**Internationalization**: i18next 25.6.2, react-i18next 16.3.2  
**Auth**: @azure/msal-browser 4.26.1  
**WebSocket**: socket.io-client 4.8.1  
**AI**: OpenAI, @anthropic-ai/sdk, @google/generative-ai  

**Dev Dependencies**: Vitest 1.6.1, Playwright 1.56.1, Cypress, ESLint, Prettier, Tailwind CSS  

#### Build & Installation

```bash
cd apps/web
npm install
npm run build          # Production build
npm run dev            # Development server (port 5173)
npm run preview        # Preview production build
```

#### Testing

**Frameworks**: Vitest, Playwright, Cypress  
**Test Location**: `apps/web/src/**/*.test.js`, `apps/web/cypress/e2e/`, `apps/web/tests/`  
**Commands**:
```bash
npm run test           # Vitest unit tests
npm run test:ui        # Vitest UI
npm run test:coverage  # Coverage report
npm run test:e2e       # Playwright e2e tests
npm run test:e2e:ui    # Playwright UI mode
npm run test:comprehensive  # Full test suite
npm run test:crud-audit     # CRUD audit tests
```

#### Docker

**Dockerfile**: `apps/web/Dockerfile` (multi-stage nginx)  
**Dev Dockerfile**: `apps/web/Dockerfile.dev`  
**Base Image**: node:20-alpine (build), nginx:alpine (prod)  
**Port**: 80 (production), 5173 (dev)  

### 2. Backend-for-Frontend (apps/bff)

**Main File**: `apps/bff/index.js`  
**Language**: JavaScript (Node.js)  
**Framework**: Express 4.21.2  
**Package Manager**: npm  

#### Dependencies

**Core**: Express 4.21.2, cors 2.8.5, helmet 8.1.0, morgan 1.10.0  
**Database**: @prisma/client 6.19.0, pg 8.16.3  
**Auth & Security**: jsonwebtoken 9.0.2, express-rate-limit 8.2.1, validator 13.15.23  
**Data Processing**: multer 2.0.2, pdfkit 0.17.2  
**Caching**: ioredis 5.3.2, rate-limit-redis 4.2.0  
**API Proxy**: http-proxy-middleware 3.0.5  
**Monitoring**: @sentry/node 7.95.0  
**Utilities**: axios 1.13.2, dotenv 17.2.3  

**Dev Dependencies**: nodemon 3.1.10, dotenv-cli 11.0.0, prisma 6.19.0  

#### Build & Installation

```bash
cd apps/bff
npm install
npm run dev       # Development with nodemon
npm start         # Production mode
npm run prisma    # Prisma CLI commands
```

#### Database

**ORM**: Prisma 6.19.0  
**Database**: PostgreSQL 15+  
**Schema**: `apps/bff/prisma/schema.prisma`  
**Migrations**: `apps/bff/prisma/migrations/`  
**Connection**: Environment variables (DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD)  

#### Docker

**Dockerfile**: `apps/bff/Dockerfile` (Node 20-alpine)  
**Dev Dockerfile**: `apps/bff/Dockerfile.dev`  
**Port**: 5001 (default, configurable via PORT env)  
**Health Check**: GET /health endpoint  

### 3. Infrastructure (apps/infra)

**Docker Compose**: `apps/infra/docker/docker-compose.yml`  
**Services**: PostgreSQL 15, BFF backend, Redis 6, Notification Service, Frontend  
**Network**: grc-network-dev (bridge)  
**Volumes**: postgres_data_dev, notification_templates  

#### Main Services in Compose

- **postgres**: PostgreSQL 15-alpine (port 5433)
- **bff**: Express backend (port 5001)
- **redis**: Redis caching (port 6381)
- **notification-service**: Notification microservice (port 3004)
- **web**: Vite dev server (port 5173)

### 4. Microservices (apps/web/src/services)

**Services**: GRC API, Auth Service, Document Service, Notification, Partner, RAG, Regulatory Intelligence (KSA), WebSocket, ML Analytics, AI Scheduler

Each service has:
- Dedicated package.json with dependencies
- Dockerfile for containerization
- Service-specific environment variables
- Jest or Vitest test configuration

## Testing Framework

**Unit Tests**: Vitest 1.6.1 with jsdom environment  
**E2E Tests**: Playwright 1.56.1, Cypress  
**Test Reports**: HTML reports in `apps/web/tests/`, coverage in `apps/web/coverage/`  

**Root Test Command**:
```bash
npm run test:comprehensive
```

## Docker Configuration

**Main Dockerfiles**:
- `apps/web/Dockerfile` - React frontend with nginx
- `apps/bff/Dockerfile` - Node.js Express backend
- `apps/infra/docker/Dockerfile` - Infrastructure images
- Individual service Dockerfiles in `apps/web/src/services/*/Dockerfile`

**Docker Compose**: `apps/infra/docker/docker-compose.yml`  
**Base Images**: node:20-alpine, nginx:alpine, postgres:15-alpine, redis:6-alpine  

## Key Entry Points

- **Frontend**: `apps/web/src/main.jsx` or `apps/web/index.html`
- **Backend**: `apps/bff/index.js`
- **BFF Routes**: `apps/bff/routes/*.js` (assessments, risks, controls, workflows, etc.)
- **Frontend Routes**: `apps/web/src/pages/` and `apps/web/src/routes/`
- **Database Setup**: `apps/bff/prisma/schema.prisma` and migrations

## Build & Deployment

```bash
# Root installation
npm install

# Build frontend
cd apps/web && npm run build

# Build backend
cd apps/bff && npm start

# Docker deployment
docker-compose -f apps/infra/docker/docker-compose.yml up -d

# Production deployment
npm run build              # All apps
docker build -t grc-web:latest apps/web
docker build -t grc-bff:latest apps/bff
```

## Environment Configuration

**Example .env files**: `.env.example`, `.env.production.template`, `.env.unified`  
**Key Variables**: DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD, JWT_SECRET, VITE_API_URL, CORS_ORIGIN, Azure credentials, AI API keys  

## Validation & Quality

**Linting**: ESLint with React plugins  
**Code Quality**: Prettier for formatting  
**Testing**: Vitest unit tests, Playwright e2e, Cypress CRUD audit  
**Health Checks**: Docker health checks on containers  
**Pre-commit**: Git hooks with husky (if configured)  

**Commands**:
```bash
npm run lint            # Check code style
npm run lint:fix        # Auto-fix linting issues
npm run test:coverage   # Generate coverage reports
npm run verify-build    # Verify build integrity
```

## Key Technologies

**Frontend Stack**: React 18, Vite 5, Tailwind CSS, Framer Motion, React Query  
**Backend Stack**: Express 4, Prisma 6, PostgreSQL 15, Redis 6  
**Infrastructure**: Docker, Docker Compose, Kubernetes configs, Nginx  
**Authentication**: Azure AD, MSAL, JWT  
**Testing**: Vitest, Playwright, Cypress, Jest  
**AI/ML Integration**: OpenAI, Google Generative AI, Anthropic, Cohere  
**Observability**: Sentry, Winston logging  
**Database**: PostgreSQL with Prisma ORM  

