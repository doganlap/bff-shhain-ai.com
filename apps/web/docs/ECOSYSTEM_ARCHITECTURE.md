# 🌐 Multi-Service Ecosystem Architecture

## Overview

This document describes the **multi-tenant, multi-role, multi-service ecosystem** architecture of the GRC Assessment Platform.

## Architecture Principles

1. **Service Independence** - Each service can be developed, deployed, and scaled independently
2. **Database per Service** - Each service has its own database schema (shared database with namespaces)
3. **API Gateway Pattern** - BFF acts as single entry point
4. **Event-Driven Communication** - Services communicate asynchronously via events
5. **Multi-Tenancy** - Row-Level Security ensures complete tenant isolation
6. **Multi-Role RBAC** - Hierarchical role system with granular permissions
7. **Multi-Partner** - Support for partner relationships and cross-tenant collaboration

## Service Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Web)                        │
│              React/Vite Application                      │
│              apps/web/                                   │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│              BFF (Backend for Frontend)                 │
│              API Gateway & Aggregation                  │
│              apps/bff/                                   │
│  - Tenant Context Injection                             │
│  - Service Routing                                      │
│  - Response Aggregation                                 │
└──────┬──────────┬──────────┬──────────┬──────────┬──────┘
       │          │          │          │          │
       ▼          ▼          ▼          ▼          ▼
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│ GRC API  │ │   Auth   │ │ Document │ │ Partner  │ │Notify   │
│ Service  │ │ Service  │ │ Service  │ │ Service  │ │ Service │
└──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘
       │          │          │          │          │
       └──────────┴──────────┴──────────┴──────────┴──────────┘
                       │
                       ▼
              ┌─────────────────┐
              │  PostgreSQL      │
              │  (Shared DB)     │
              │  - Multi-tenant  │
              │  - RLS Enabled   │
              └─────────────────┘
```

## Services

### 1. GRC API Service (`apps/services/grc-api/`)
**Purpose:** Core GRC functionality
- Assessments management
- Controls and frameworks
- Compliance tracking
- Organizations management

**Port:** 3000  
**Endpoints:** `/api/grc/*`

### 2. Auth Service (`apps/services/auth-service/`)
**Purpose:** Authentication & Authorization
- User authentication (JWT)
- Role-based access control (RBAC)
- Microsoft SSO integration
- Token management

**Port:** 3001  
**Endpoints:** `/api/auth/*`

### 3. Document Service (`apps/services/document-service/`)
**Purpose:** Document processing
- Document upload and storage
- OCR and text extraction
- RAG (Retrieval Augmented Generation)
- Document search

**Port:** 3002  
**Endpoints:** `/api/documents/*`

### 4. Partner Service (`apps/services/partner-service/`)
**Purpose:** Partner management and collaboration
- Partner relationship management
- Cross-tenant collaboration
- Partner invitations
- Resource sharing

**Port:** 3003  
**Endpoints:** `/api/partners/*`

### 5. Notification Service (`apps/services/notification-service/`)
**Purpose:** Notifications
- Email notifications
- SMS notifications
- Push notifications
- Notification templates

**Port:** 3004  
**Endpoints:** `/api/notifications/*`

## Multi-Tenancy

### Row-Level Security (RLS)

Every table must have `tenant_id` and RLS enabled:

```sql
CREATE TABLE assessments (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    -- ... other columns
);

ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON assessments
    FOR ALL
    USING (tenant_id = current_setting('app.tenant_id')::UUID);
```

### Tenant Context Injection

```javascript
// BFF middleware
app.use((req, res, next) => {
    const tenantId = req.headers['x-tenant-id'] || req.user?.tenant_id;
    req.tenantId = tenantId;
    req.serviceHeaders = {
        'x-tenant-id': tenantId,
        'x-user-id': req.user?.id,
        'x-service-token': process.env.SERVICE_TOKEN
    };
    next();
});
```

## Multi-Role RBAC

### Role Hierarchy

```
Super Admin (System Level)
    ├── Tenant Admin (Tenant Level)
    │   ├── Manager
    │   │   ├── Assessor
    │   │   └── Reviewer
    │   └── Auditor
    └── Partner Admin (Partner Level)
        └── Partner User
```

### Permission Format

`service:resource:action`

Examples:
- `grc-api:assessments:read`
- `grc-api:assessments:write`
- `auth-service:users:manage`
- `partner-service:partners:invite`

## Multi-Partner Ecosystem

### Partner Types

1. **Vendor** - Third-party vendor
2. **Client** - Customer organization
3. **Auditor** - External auditor
4. **Regulator** - Regulatory body
5. **Strategic Partner** - Strategic partner

### Partner Relationships

```sql
CREATE TABLE partners (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,
    partner_tenant_id UUID REFERENCES tenants(id),
    partner_type VARCHAR(50),
    status VARCHAR(20),
    partnership_level VARCHAR(20)
);

CREATE TABLE partner_collaborations (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,
    partner_id UUID NOT NULL,
    collaboration_type VARCHAR(50),
    shared_resources JSONB,
    access_level VARCHAR(20)
);
```

## Service Communication

### Synchronous (HTTP/REST)

Services communicate via HTTP through BFF or directly:

```javascript
// Via BFF
const response = await axios.get('/api/partners', {
    headers: { 'x-tenant-id': tenantId }
});

// Direct service-to-service
const response = await axios.get('http://auth-service:3001/api/users', {
    headers: {
        'x-tenant-id': tenantId,
        'x-service-token': serviceToken
    }
});
```

### Asynchronous (Events)

Services publish and subscribe to events:

```javascript
// Publish event
await eventBus.publish('assessment.completed', {
    assessmentId,
    tenantId,
    userId
});

// Subscribe to event
eventBus.subscribe('assessment.completed', async (event) => {
    await notificationService.sendCompletionNotification(event);
});
```

## Deployment

### Docker Compose

```bash
# Start entire ecosystem
docker-compose -f infra/docker/docker-compose.ecosystem.yml up -d

# Start specific services
docker-compose -f infra/docker/docker-compose.ecosystem.yml up -d grc-api auth-service
```

### Environment Variables

Each service requires:
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
- `SERVICE_TOKEN` (for service-to-service auth)
- Service-specific URLs (for inter-service communication)

## Health Checks

All services must implement:
- `GET /healthz` - Liveness probe
- `GET /readyz` - Readiness probe

## Monitoring

- Service health monitoring
- Request tracing (OpenTelemetry)
- Log aggregation
- Performance metrics

## Security

- JWT authentication for users
- Service tokens for service-to-service communication
- Row-Level Security for tenant isolation
- RBAC for authorization
- Secrets management via Key Vault

## References

- `ABI/10-Multi-Service-Ecosystem.md` - Detailed architecture
- `ABI/08-MultiTenancy-and-RBAC.md` - Multi-tenancy and RBAC
- `docs/adr/0004-multi-service-ecosystem.md` - Architecture decision
- `infra/docker/docker-compose.ecosystem.yml` - Deployment config

---

**Last Updated:** 2025-01-10  
**Status:** Active

