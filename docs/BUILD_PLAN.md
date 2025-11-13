# 🏗️ **BUILD PLAN - Complete Multi-Service Ecosystem**

**Project:** Assessment-GRC  
**Goal:** Complete multi-tenant, multi-role, multi-service ecosystem with partner collaboration  
**Status:** Foundation Complete, Services Implementation Needed

---

## 📊 **CURRENT STATUS**

### ✅ **COMPLETED**
- ✅ Architecture documentation (11 ABI documents)
- ✅ Frontend application (7,801 files)
- ✅ GRC API service (64 files, 19 routes)
- ✅ Database migrations (17 files)
- ✅ Database schemas (14 files)
- ✅ Docker configurations
- ✅ Basic BFF structure
- ✅ UI components (layouts, navigation, pages)

### ⚠️ **IN PROGRESS / PARTIAL**
- ⚠️ BFF - Basic structure, needs service routing
- ⚠️ Partner Service - Documentation only

### 📋 **TO BUILD**
- 📋 Auth Service
- 📋 Document Service
- 📋 Partner Service (implementation)
- 📋 Notification Service
- 📋 BFF enhancements
- 📋 API contracts
- 📋 Event schemas
- 📋 Database updates
- 📋 Integration & testing

---

## 🎯 **PHASE 1: CORE SERVICES EXTRACTION** (Priority: HIGH)

### **1.1 Auth Service** 📋

**Location:** `apps/services/auth-service/`

**What to Build:**
```
apps/services/auth-service/
├── package.json
├── server.js
├── config/
│   ├── database.js
│   └── jwt.js
├── middleware/
│   ├── auth.js
│   └── rbac.js
├── routes/
│   ├── auth.js          # Login, register, refresh
│   ├── users.js         # User management
│   └── microsoft-auth.js # SSO
├── services/
│   ├── authService.js
│   ├── userService.js
│   └── microsoftAuth.js
└── __tests__/
```

**Extract from grc-api:**
- `routes/auth.js` → `auth-service/routes/auth.js`
- `routes/microsoft-auth.js` → `auth-service/routes/microsoft-auth.js`
- `routes/users.js` → `auth-service/routes/users.js`
- `middleware/auth.js` → `auth-service/middleware/auth.js`
- `middleware/rbac.js` → `auth-service/middleware/rbac.js`
- `services/auth/` → `auth-service/services/`
- `services/userService.js` → `auth-service/services/userService.js`
- `services/microsoftAuth.js` → `auth-service/services/microsoftAuth.js`
- `utils/jwt.js` → `auth-service/utils/jwt.js`

**Endpoints:**
- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/auth/profile`
- `GET /api/users`
- `POST /api/users`
- `GET /api/microsoft-auth/login`

**Dependencies:**
- Express.js
- jsonwebtoken
- bcryptjs
- @azure/msal-node
- pg (PostgreSQL)

---

### **1.2 Document Service** 📋

**Location:** `apps/services/document-service/`

**What to Build:**
```
apps/services/document-service/
├── package.json
├── server.js
├── config/
│   └── database.js
├── middleware/
│   ├── auth.js          # Service token validation
│   └── upload.js        # File upload (Multer)
├── routes/
│   ├── documents.js     # Upload, list, get, delete
│   └── search.js        # Document search
├── services/
│   ├── documentProcessor.js
│   ├── embeddingService.js
│   ├── searchService.js
│   └── ragService.js
└── __tests__/
```

**Extract from grc-api:**
- `routes/documents.js` → `document-service/routes/documents.js`
- `services/documentProcessor.js` → `document-service/services/documentProcessor.js`
- `services/document/` → `document-service/services/`
- `middleware/upload.js` → `document-service/middleware/upload.js`
- `config/aa.ini` → `document-service/config/aa.ini`

**Endpoints:**
- `POST /api/documents/upload`
- `GET /api/documents`
- `GET /api/documents/:id`
- `POST /api/documents/:id/process`
- `GET /api/documents/:id/search`
- `POST /api/documents/rag`
- `DELETE /api/documents/:id`

**Dependencies:**
- Express.js
- multer
- pdf-parse
- mammoth
- @azure/ai-form-recognizer
- @qdrant/js-client-rest

---

### **1.3 Partner Service** 📋

**Location:** `apps/services/partner-service/`

**What to Build:**
```
apps/services/partner-service/
├── package.json
├── server.js
├── config/
│   └── database.js
├── middleware/
│   ├── auth.js
│   └── partnerAccess.js  # Cross-tenant access control
├── routes/
│   ├── partners.js       # Partner CRUD
│   ├── collaborations.js # Collaboration management
│   └── resources.js     # Resource sharing
├── services/
│   ├── partnerService.js
│   ├── collaborationService.js
│   └── accessControlService.js
└── __tests__/
```

**New Implementation:**
- Partner relationship management
- Cross-tenant collaboration
- Resource sharing controls
- Partner invitations

**Endpoints:**
- `GET /api/partners`
- `POST /api/partners/invite`
- `GET /api/partners/:id`
- `PUT /api/partners/:id`
- `DELETE /api/partners/:id`
- `GET /api/collaborations`
- `POST /api/collaborations`
- `GET /api/partners/:partnerId/assessments`
- `POST /api/partners/:partnerId/share-resource`

**Dependencies:**
- Express.js
- pg
- axios (for calling other services)

---

### **1.4 Notification Service** 📋

**Location:** `apps/services/notification-service/`

**What to Build:**
```
apps/services/notification-service/
├── package.json
├── server.js
├── config/
│   ├── smtp.js
│   └── templates.js
├── routes/
│   └── notifications.js
├── services/
│   ├── emailService.js
│   ├── smsService.js
│   ├── pushService.js
│   └── templateService.js
└── __tests__/
```

**New Implementation:**
- Email notifications (SMTP)
- SMS notifications (optional)
- Push notifications (optional)
- Notification templates
- Notification queue

**Endpoints:**
- `POST /api/notifications/send`
- `POST /api/notifications/email`
- `GET /api/notifications`
- `GET /api/notifications/templates`
- `POST /api/notifications/templates`

**Dependencies:**
- Express.js
- nodemailer (email)
- twilio (SMS, optional)

---

## 🎯 **PHASE 2: BFF ENHANCEMENT** (Priority: HIGH)

### **2.1 Service Routing** 📋

**File:** `apps/bff/index.js`

**What to Build:**
- Service registry configuration
- Proxy middleware for each service
- Tenant context injection
- Service token management
- Response aggregation
- Error handling

**Implementation:**
```javascript
// Service registry
const services = {
  'grc-api': process.env.GRC_API_URL || 'http://grc-api:3000',
  'auth-service': process.env.AUTH_SERVICE_URL || 'http://auth-service:3001',
  'document-service': process.env.DOCUMENT_SERVICE_URL || 'http://document-service:3002',
  'partner-service': process.env.PARTNER_SERVICE_URL || 'http://partner-service:3003',
  'notification-service': process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:3004'
};

// Proxy routes
app.use('/api/grc', createServiceProxy(services['grc-api']));
app.use('/api/auth', createServiceProxy(services['auth-service']));
app.use('/api/documents', createServiceProxy(services['document-service']));
app.use('/api/partners', createServiceProxy(services['partner-service']));
app.use('/api/notifications', createServiceProxy(services['notification-service']));

// Aggregated endpoints
app.get('/api/dashboard', aggregateDashboardData);
```

**Dependencies:**
- express
- axios
- http-proxy-middleware (optional)

---

### **2.2 Tenant Context Injection** 📋

**What to Build:**
- Middleware to extract tenant from JWT or header
- Inject tenant context to all service calls
- Service token generation/validation

---

### **2.3 Response Aggregation** 📋

**What to Build:**
- Dashboard endpoint that aggregates data from multiple services
- Parallel service calls
- Error handling for partial failures

---

## 🎯 **PHASE 3: API CONTRACTS** (Priority: MEDIUM)

### **3.1 OpenAPI Specifications** 📋

**Files to Create:**
- `contracts/api/grc-api.openapi.yaml`
- `contracts/api/auth-service.openapi.yaml`
- `contracts/api/document-service.openapi.yaml`
- `contracts/api/partner-service.openapi.yaml`
- `contracts/api/notification-service.openapi.yaml`

**What to Include:**
- All endpoints
- Request/response schemas
- Authentication requirements
- Error responses
- Examples

---

### **3.2 Event Schemas** 📋

**Files to Create:**
- `contracts/events/assessment.completed.schema.json`
- `contracts/events/partner.invited.schema.json`
- `contracts/events/document.processed.schema.json`
- `contracts/events/user.created.schema.json`
- `contracts/events/notification.sent.schema.json`

**What to Include:**
- Event type
- Event payload schema
- Required fields
- Optional fields
- Event versioning

---

## 🎯 **PHASE 4: DATABASE UPDATES** (Priority: MEDIUM)

### **4.1 Partner Tables** 📋

**Migration:** `infra/db/migrations/013_create_partner_tables.sql`

**Tables to Create:**
```sql
CREATE TABLE partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    partner_tenant_id UUID REFERENCES tenants(id),
    partner_type VARCHAR(50) NOT NULL, -- 'vendor', 'client', 'auditor', 'regulator', 'strategic'
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'active', 'suspended', 'rejected'
    partnership_level VARCHAR(20) NOT NULL DEFAULT 'basic', -- 'basic', 'premium', 'enterprise'
    invited_by UUID REFERENCES users(id),
    invited_at TIMESTAMP DEFAULT NOW(),
    accepted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE partner_collaborations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    partner_id UUID NOT NULL REFERENCES partners(id),
    collaboration_type VARCHAR(50) NOT NULL, -- 'assessment', 'audit', 'compliance', 'vendor'
    shared_resources JSONB, -- What resources are shared
    access_level VARCHAR(20) NOT NULL DEFAULT 'read', -- 'read', 'write', 'admin'
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Row-Level Security
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_collaborations ENABLE ROW LEVEL SECURITY;

CREATE POLICY partner_tenant_isolation ON partners
    FOR ALL USING (tenant_id = current_setting('app.tenant_id')::UUID);

CREATE POLICY collaboration_tenant_isolation ON partner_collaborations
    FOR ALL USING (tenant_id = current_setting('app.tenant_id')::UUID);
```

---

### **4.2 Service-Specific Schemas** 📋

**Auth Service Schema:**
- User sessions (if separate)
- Token blacklist (if needed)

**Document Service Schema:**
- Document chunks (already in grc-api, may need to move)
- Embedding models
- Processing jobs

**Notification Service Schema:**
- Notification queue
- Notification templates
- Notification history

---

## 🎯 **PHASE 5: EVENT BUS** (Priority: LOW)

### **5.1 Event Bus Setup** 📋

**What to Build:**
- RabbitMQ/Kafka integration
- Event publisher service
- Event subscriber service
- Event routing

**Services:**
- Event bus client library
- Event handlers in each service
- Dead letter queue handling

---

## 🎯 **PHASE 6: TESTING** (Priority: HIGH)

### **6.1 Integration Tests** 📋

**What to Build:**
- Service-to-service communication tests
- Multi-tenant isolation tests
- Partner collaboration tests
- End-to-end workflow tests

**Files:**
- `apps/services/grc-api/__tests__/integration/service-communication.test.js`
- `apps/services/grc-api/__tests__/integration/multi-tenant.test.js`
- `apps/services/partner-service/__tests__/integration/collaboration.test.js`

---

### **6.2 Contract Tests** 📋

**What to Build:**
- OpenAPI contract validation
- Request/response schema validation
- API versioning tests

---

### **6.3 Multi-Tenant Isolation Tests** 📋

**What to Build:**
- RLS policy tests
- Cross-tenant access prevention tests
- Partner cross-tenant access tests

---

## 🎯 **PHASE 7: MONITORING & OBSERVABILITY** (Priority: MEDIUM)

### **7.1 Logging** 📋

**What to Build:**
- Structured JSON logging
- Correlation IDs
- Tenant ID in all logs
- Service name in logs

---

### **7.2 Metrics** 📋

**What to Build:**
- Service health metrics
- Request/response metrics
- Error rate metrics
- Performance metrics

---

### **7.3 Tracing** 📋

**What to Build:**
- OpenTelemetry integration
- Distributed tracing
- Service dependency mapping

---

## 📋 **DETAILED BUILD CHECKLIST**

### **Service 1: Auth Service** 📋

- [ ] Create `apps/services/auth-service/` directory
- [ ] Create `package.json` with dependencies
- [ ] Create `server.js` with Express setup
- [ ] Extract `config/database.js` from grc-api
- [ ] Extract `config/jwt.js` or create new
- [ ] Extract `middleware/auth.js`
- [ ] Extract `middleware/rbac.js`
- [ ] Extract `routes/auth.js`
- [ ] Extract `routes/microsoft-auth.js`
- [ ] Extract `routes/users.js`
- [ ] Extract `services/authService.js`
- [ ] Extract `services/userService.js`
- [ ] Extract `services/microsoftAuth.js`
- [ ] Extract `utils/jwt.js`
- [ ] Update database queries to use service-specific connection
- [ ] Add health check endpoints (`/healthz`, `/readyz`)
- [ ] Add service token validation middleware
- [ ] Create Dockerfile
- [ ] Update docker-compose.ecosystem.yml
- [ ] Write tests
- [ ] Create OpenAPI contract

---

### **Service 2: Document Service** 📋

- [ ] Create `apps/services/document-service/` directory
- [ ] Create `package.json` with dependencies
- [ ] Create `server.js` with Express setup
- [ ] Extract `config/database.js` from grc-api
- [ ] Extract `config/aa.ini` from grc-api
- [ ] Extract `middleware/upload.js`
- [ ] Extract `routes/documents.js`
- [ ] Extract `services/documentProcessor.js`
- [ ] Extract document-related services
- [ ] Add health check endpoints
- [ ] Add service token validation
- [ ] Create storage volume configuration
- [ ] Create Dockerfile
- [ ] Update docker-compose.ecosystem.yml
- [ ] Write tests
- [ ] Create OpenAPI contract

---

### **Service 3: Partner Service** 📋

- [ ] Create `apps/services/partner-service/` directory structure
- [ ] Create `package.json` with dependencies
- [ ] Create `server.js` with Express setup
- [ ] Create `config/database.js`
- [ ] Create `middleware/auth.js` (service token validation)
- [ ] Create `middleware/partnerAccess.js` (cross-tenant access control)
- [ ] Create `routes/partners.js` (CRUD operations)
- [ ] Create `routes/collaborations.js` (collaboration management)
- [ ] Create `routes/resources.js` (resource sharing)
- [ ] Create `services/partnerService.js`
- [ ] Create `services/collaborationService.js`
- [ ] Create `services/accessControlService.js`
- [ ] Implement partner invitation logic
- [ ] Implement cross-tenant access controls
- [ ] Add health check endpoints
- [ ] Create Dockerfile
- [ ] Update docker-compose.ecosystem.yml
- [ ] Write tests
- [ ] Create OpenAPI contract
- [ ] Create database migration for partner tables

---

### **Service 4: Notification Service** 📋

- [ ] Create `apps/services/notification-service/` directory
- [ ] Create `package.json` with dependencies
- [ ] Create `server.js` with Express setup
- [ ] Create `config/smtp.js` (SMTP configuration)
- [ ] Create `config/templates.js` (notification templates)
- [ ] Create `routes/notifications.js`
- [ ] Create `services/emailService.js` (nodemailer)
- [ ] Create `services/smsService.js` (optional, Twilio)
- [ ] Create `services/pushService.js` (optional)
- [ ] Create `services/templateService.js`
- [ ] Implement notification queue
- [ ] Add health check endpoints
- [ ] Add service token validation
- [ ] Create Dockerfile
- [ ] Update docker-compose.ecosystem.yml
- [ ] Write tests
- [ ] Create OpenAPI contract

---

### **BFF Enhancements** 📋

- [ ] Update `apps/bff/package.json` (add axios, http-proxy-middleware)
- [ ] Update `apps/bff/index.js`:
  - [ ] Add service registry
  - [ ] Add tenant context middleware
  - [ ] Add service proxy middleware
  - [ ] Add aggregated endpoints (dashboard)
  - [ ] Add error handling
  - [ ] Add service discovery (optional)
- [ ] Add caching layer (Redis, optional)
- [ ] Add rate limiting per service
- [ ] Add request/response logging
- [ ] Update docker-compose.ecosystem.yml

---

### **API Contracts** 📋

- [ ] Generate OpenAPI spec from grc-api routes
- [ ] Create `contracts/api/grc-api.openapi.yaml`
- [ ] Create `contracts/api/auth-service.openapi.yaml`
- [ ] Create `contracts/api/document-service.openapi.yaml`
- [ ] Create `contracts/api/partner-service.openapi.yaml`
- [ ] Create `contracts/api/notification-service.openapi.yaml`
- [ ] Validate all contracts
- [ ] Generate TypeScript types from contracts (optional)

---

### **Event Schemas** 📋

- [ ] Create `contracts/events/assessment.completed.schema.json`
- [ ] Create `contracts/events/partner.invited.schema.json`
- [ ] Create `contracts/events/document.processed.schema.json`
- [ ] Create `contracts/events/user.created.schema.json`
- [ ] Create `contracts/events/notification.sent.schema.json`
- [ ] Validate all schemas

---

### **Database Updates** 📋

- [ ] Create migration `013_create_partner_tables.sql`
- [ ] Create migration `014_create_notification_tables.sql` (if needed)
- [ ] Update RLS policies for new tables
- [ ] Add indexes for performance
- [ ] Test migrations (up and down)

---

### **Testing** 📋

- [ ] Integration tests for service communication
- [ ] Contract tests for all services
- [ ] Multi-tenant isolation tests
- [ ] Partner collaboration tests
- [ ] End-to-end tests
- [ ] Performance tests
- [ ] Load tests

---

### **Documentation** 📋

- [ ] Update README.md with new service structure
- [ ] Create service-specific READMEs
- [ ] Update API documentation
- [ ] Create deployment guide
- [ ] Create troubleshooting guide

---

## 🚀 **BUILD ORDER (Recommended)**

### **Week 1: Core Service Extraction**
1. Day 1-2: Extract Auth Service
2. Day 3-4: Extract Document Service
3. Day 5: Test both services

### **Week 2: New Services**
4. Day 1-3: Build Partner Service
5. Day 4-5: Build Notification Service

### **Week 3: Integration**
6. Day 1-2: Enhance BFF with service routing
7. Day 3: Create API contracts
8. Day 4: Create event schemas
9. Day 5: Database migrations

### **Week 4: Testing & Polish**
10. Day 1-2: Integration tests
11. Day 3: Contract tests
12. Day 4: Multi-tenant tests
13. Day 5: Documentation and cleanup

---

## 📊 **ESTIMATED EFFORT**

| Task | Estimated Time | Priority |
|------|----------------|----------|
| Auth Service | 2-3 days | HIGH |
| Document Service | 2-3 days | HIGH |
| Partner Service | 3-4 days | HIGH |
| Notification Service | 2-3 days | MEDIUM |
| BFF Enhancements | 2-3 days | HIGH |
| API Contracts | 1-2 days | MEDIUM |
| Event Schemas | 1 day | LOW |
| Database Updates | 1-2 days | MEDIUM |
| Testing | 3-5 days | HIGH |
| **Total** | **17-26 days** | |

---

## ✅ **SUCCESS CRITERIA**

### **Phase 1 Complete When:**
- ✅ All 4 services (auth, document, partner, notification) are running
- ✅ BFF routes requests to all services
- ✅ Services can communicate with each other
- ✅ Multi-tenant isolation works across all services

### **Phase 2 Complete When:**
- ✅ API contracts for all services
- ✅ Event schemas defined
- ✅ Database migrations complete
- ✅ Integration tests passing

### **Phase 3 Complete When:**
- ✅ End-to-end tests passing
- ✅ Multi-tenant isolation verified
- ✅ Partner collaboration working
- ✅ Documentation complete

---

## 🎯 **QUICK START BUILD**

### **Start with Auth Service:**
```bash
# 1. Create service directory
mkdir -p apps/services/auth-service/{config,middleware,routes,services,__tests__}

# 2. Copy from grc-api
cp apps/services/grc-api/routes/auth.js apps/services/auth-service/routes/
cp apps/services/grc-api/middleware/auth.js apps/services/auth-service/middleware/
# ... etc

# 3. Create package.json
cd apps/services/auth-service
npm init -y
npm install express pg jsonwebtoken bcryptjs @azure/msal-node

# 4. Create server.js
# 5. Update imports and paths
# 6. Test service
npm start
```

---

**Status:** Ready to build  
**Next Action:** Start with Auth Service extraction


