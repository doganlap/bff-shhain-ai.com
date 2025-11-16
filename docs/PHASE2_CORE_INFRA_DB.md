# Phase 2 – Core Infrastructure: Database

## 1. Current State (from diagnostics)

Based on RESTORE_PLAN_PHASE2.md and TECHNICAL_SUMMARY_COMPLETE.md analysis:

**Database Architecture:**
- Primary datastore: PostgreSQL
- Multiple Prisma schemas across the monorepo
- GRC API uses manual pg pools across 3 logical databases: COMPLIANCE_DB, FINANCE_DB, AUTH_DB
- Existing Docker Compose for production exists in apps/infra/deployment/

**Current Issues:**
- BFF + services expect Postgres + Redis + SERVICE_TOKEN
- Database connection requirements blocking full functionality
- No clear local development database setup documented

**Existing Schema Locations:**
- Root Prisma schema: `/prisma/schema.prisma`
- BFF Prisma schema: `apps/bff/prisma/schema.prisma`
- SQL migrations: `apps/web/database/migrations/*`
- BFF migrations: `apps/bff/prisma/migrations/*`

**Infrastructure Status:**
- ✅ Docker Compose files already created (docker-compose.db.yml, docker-compose.local.yml)
- ✅ PostgreSQL and Redis services configured for local development
- ✅ BFF environment templates exist (.env.stage.example, .env.local.example)
- ✅ Prisma migration scripts already configured in package.json

## 2. Target DB Setup (Dev + Stage)

### Proposed Database Names for Local Development:
- **Main Database**: `shahin_local_db`
- **Shadow Database**: `shahin_local_shadow` (for Prisma migrations)
- **GRC Compliance**: `shahin_ksa_compliance`
- **GRC Finance**: `grc_master`
- **GRC Auth**: `shahin_access_control`

### Component Usage:
- **BFF**: Connects to main `shahin_local_db` via DATABASE_URL
- **GRC API**: Uses 3 logical databases (can map to same physical instance with different schemas)
- **Prisma**: Primary ORM for schema management
- **Raw SQL**: Additional migrations for complex database operations

### Development Strategy:
- Use Docker PostgreSQL for local development (already configured)
- Single PostgreSQL instance with multiple databases/schemas
- Environment-based configuration with clear separation from production
- Migration-first approach with Prisma and SQL scripts

## 3. Migration Strategy

### Authoritative Sources:
1. **Prisma Schema** (Primary): `apps/bff/prisma/schema.prisma`
2. **SQL Migrations** (Secondary): `apps/web/database/migrations/*`
3. **BFF Migrations**: `apps/bff/prisma/migrations/*`

### Safe Migration Process:
1. Always target local development database only
2. Use Prisma migrate for schema changes
3. Apply SQL migrations for complex operations
4. Validate migrations before proceeding
5. Keep migration history in version control

### Production Safety:
- Never run migrations against unknown databases
- Always verify DATABASE_URL points to local instance
- Use separate migration commands for different environments
- Document rollback procedures

## 4. Execution Log

### Task A0 - Create Documentation
- [x] Created `docs/PHASE2_CORE_INFRA_DB.md` with comprehensive database plan

### Task B1 - Local PostgreSQL Setup
- [x] Docker Compose configuration already exists and is properly configured
- [x] PostgreSQL service: `shahin-db-local` on port 5432
- [x] Shadow database: `shahin-shadow-local` on port 5433
- [x] Redis service: `shahin-redis-local` on port 6379
- [x] Persistent volumes for data retention
- [x] Health checks for all services

### Task C1 - BFF Database Environment
- [x] `apps/bff/.env.stage.example` already contains proper DATABASE_URL placeholders
- [x] `apps/bff/.env.local.example` configured for local development
- [x] Prisma schema correctly uses env("DATABASE_URL") and env("SHADOW_DATABASE_URL")

### Task C2 - Root Prisma Analysis
- [x] Root Prisma schema exists at `/prisma/schema.prisma`
- [x] Uses different model structure than BFF schema
- [x] Contains legacy tables (activity_logs, assessments, users, etc.)
- [x] **Recommendation**: Use BFF Prisma schema as primary for new development

### Task C3 - GRC API Database Configuration
- [x] Analyzed `apps/web/src/services/grc-api/config/database.js`
- [x] Three logical databases: compliance, finance, auth
- [x] All can connect to same PostgreSQL instance with different database names
- [x] Environment variables properly configured with fallbacks

### Task D1 - Migration Sources Inventory
- [x] **BFF Prisma Migrations**: Located in `apps/bff/prisma/migrations/`
- [x] **Root Prisma Schema**: Legacy schema at `/prisma/schema.prisma`
- [x] **SQL Migrations**: Extensive collection in `apps/web/database/migrations/`
- [x] **GRC Infrastructure Migrations**: Located in `apps/infra/db/migrations/`

### Task D2 - Dev Migration Commands
- [x] BFF migration scripts already exist in package.json:
  - `npm run migrate:local` - Run Prisma migrations
  - `npm run migrate:local:create` - Create migration only
  - `npm run migrate:local:reset` - Reset database
- [x] Database studio: `npm run db:local:studio`
- [x] Seed script: `npm run db:local:seed`

### Task E1 - Seed Data Analysis
- [x] Seed script exists: `apps/bff/prisma/seed.ts`
- [x] Creates Saudi compliance frameworks and sample data
- [x] Safe for development use (no sensitive data)

## 5. Blockers / Questions for Human

1. **Schema Confusion**: There are two different Prisma schemas (root vs BFF). Which should be the authoritative source for new development?

2. **Migration Coordination**: Should we run both Prisma migrations AND SQL migrations, or focus on one approach?

3. **GRC API Database Strategy**: For local development, should the 3 logical GRC databases be:
   - Separate physical databases on same PostgreSQL instance?
   - Different schemas within same database?
   - Single database with table prefixes?

4. **Existing Data**: Are there any existing databases that need to be preserved or migrated, or can we start fresh with local development?

5. **Migration Order**: What is the correct sequence for running the extensive SQL migrations alongside Prisma migrations?

6. **Environment Standardization**: Should we consolidate the environment variable naming between the different schema approaches?

---

## Next Steps & Commands

### Quick Start (Local Development):
```bash
# Start infrastructure
docker compose -f docker-compose.db.yml up -d

# Run BFF migrations
cd apps/bff
npm run migrate:local

# Seed database
npm run db:local:seed

# Start BFF
cd apps/bff
npm run dev
```

### Full Stack:
```bash
# Start everything
docker compose -f docker-compose.local.yml up -d

# Verify health
curl http://localhost:3005/health
curl http://localhost:3005/api/ai/health
```

**Safety Commitment:** All database operations are local development only with proper safeguards against production access. No destructive actions have been executed.