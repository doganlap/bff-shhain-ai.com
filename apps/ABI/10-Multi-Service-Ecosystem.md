# 10 — Multi‑Service Ecosystem Architecture — معمارية النظام متعدد الخدمات

> **هذه القواعد غير قابلة للتفاوض (Non‑Negotiable).** جميع الخدمات يجب أن تتبع هذا النموذج.

## 1) معمارية النظام (Ecosystem Architecture)

### **المكونات الأساسية:**

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Web App)                        │
│              apps/web/ (React/Vite)                          │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              BFF (Backend for Frontend)                     │
│              apps/bff/ (Express.js)                         │
│  - Tenant Context Injection                                 │
│  - Request Routing to Services                              │
│  - Response Aggregation                                     │
└──────┬──────────────┬──────────────┬──────────────┬─────────┘
       │              │              │              │
       ▼              ▼              ▼              ▼
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│ GRC API  │  │ Auth     │  │ Document │  │ Partner  │
│ Service  │  │ Service  │  │ Service  │  │ Service  │
└──────────┘  └──────────┘  └──────────┘  └──────────┘
       │              │              │              │
       └──────────────┴──────────────┴──────────────┘
                       │
                       ▼
              ┌─────────────────┐
              │  Shared Database │
              │  (PostgreSQL)    │
              │  - Multi-tenant  │
              │  - Row-Level     │
              │    Security      │
              └─────────────────┘
```

### **مبادئ التصميم:**

1. **Service Independence** - كل خدمة مستقلة وقابلة للنشر بشكل منفصل
2. **Database per Service Pattern** - كل خدمة لها schema منفصل (أو namespace)
3. **API Gateway Pattern** - BFF كبوابة موحدة
4. **Event-Driven Communication** - التواصل عبر الأحداث عند الحاجة
5. **Service Discovery** - تسجيل الخدمات واكتشافها تلقائياً

---

## 2) تعدد المستأجرين (Multi-Tenancy)

### **Row-Level Security (RLS):**

```sql
-- كل جدول يجب أن يحتوي على tenant_id
CREATE TABLE assessments (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    -- ... other columns
);

-- تفعيل RLS
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;

-- سياسة الوصول
CREATE POLICY tenant_isolation ON assessments
    FOR ALL
    USING (tenant_id = current_setting('app.tenant_id')::UUID);
```

### **Tenant Context Injection:**

```javascript
// BFF middleware
app.use((req, res, next) => {
    const tenantId = req.headers['x-tenant-id'] || 
                     req.user?.tenant_id;
    req.tenantId = tenantId;
    next();
});

// Service middleware
app.use((req, res, next) => {
    // Set tenant context for database queries
    req.db.query('SET app.tenant_id = $1', [req.tenantId]);
    next();
});
```

### **Tenant Isolation Rules:**

- ✅ **Mandatory:** كل query يجب أن يفلتر حسب `tenant_id`
- ✅ **Mandatory:** لا يمكن لخدمة الوصول لبيانات tenant آخر
- ✅ **Mandatory:** Cross-tenant operations تحتاج صلاحيات خاصة
- ✅ **Mandatory:** Audit logs يجب أن تسجل `tenant_id`

---

## 3) تعدد الأدوار (Multi-Role RBAC)

### **Role Hierarchy:**

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

### **Permission Model:**

```javascript
// Permissions are granular and service-specific
const permissions = {
    'grc-api:assessments:read',
    'grc-api:assessments:write',
    'grc-api:assessments:delete',
    'auth-service:users:manage',
    'document-service:documents:upload',
    'partner-service:partners:invite'
};

// Role-Permission Mapping
const roles = {
    'tenant-admin': [
        'grc-api:*',
        'auth-service:users:manage',
        'partner-service:partners:invite'
    ],
    'assessor': [
        'grc-api:assessments:read',
        'grc-api:assessments:write',
        'document-service:documents:upload'
    ]
};
```

### **RBAC Implementation:**

```javascript
// Middleware: requirePermission
const requirePermission = (permission) => {
    return async (req, res, next) => {
        const userPermissions = await getUserPermissions(req.user.id, req.tenantId);
        if (!userPermissions.includes(permission)) {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }
        next();
    };
};

// Usage
router.get('/assessments', 
    authenticateToken,
    requirePermission('grc-api:assessments:read'),
    getAssessments
);
```

---

## 4) تعدد الخدمات (Multi-Service Architecture)

### **Service Structure:**

```
apps/services/
├── grc-api/              # GRC Core Service
│   ├── routes/           # Assessment, Controls, Frameworks
│   ├── services/         # Business logic
│   └── models/           # Data models
├── auth-service/         # Authentication & Authorization
│   ├── routes/           # Login, Register, Token
│   └── services/         # JWT, RBAC, SSO
├── document-service/    # Document Processing
│   ├── routes/           # Upload, Process, Search
│   └── services/         # OCR, RAG, Embeddings
├── partner-service/      # Partner Management
│   ├── routes/           # Partners, Invitations, Collaboration
│   └── services/         # Partner relationships
└── notification-service/ # Notifications
    ├── routes/           # Send, Templates
    └── services/         # Email, SMS, Push
```

### **Service Communication:**

#### **Synchronous (HTTP/REST):**
```javascript
// Service-to-Service call via BFF or direct
const response = await axios.get(
    `http://auth-service:3001/api/users/${userId}`,
    {
        headers: {
            'x-tenant-id': tenantId,
            'x-service-token': serviceToken
        }
    }
);
```

#### **Asynchronous (Events):**
```javascript
// Event publishing
await eventBus.publish('assessment.completed', {
    assessmentId,
    tenantId,
    userId,
    timestamp: new Date()
});

// Event subscription
eventBus.subscribe('assessment.completed', async (event) => {
    await notificationService.sendCompletionNotification(event);
});
```

### **Service Discovery:**

```yaml
# docker-compose.yml
services:
  grc-api:
    environment:
      - SERVICE_NAME=grc-api
      - SERVICE_PORT=3000
      - DISCOVERY_URL=http://service-registry:8500
  
  auth-service:
    environment:
      - SERVICE_NAME=auth-service
      - SERVICE_PORT=3001
      - DISCOVERY_URL=http://service-registry:8500
```

---

## 5) نظام الشركاء (Multi-Partner Ecosystem)

### **Partner Model:**

```sql
CREATE TABLE partners (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    partner_tenant_id UUID REFERENCES tenants(id),
    partner_type VARCHAR(50), -- 'vendor', 'client', 'auditor', 'regulator'
    status VARCHAR(20), -- 'pending', 'active', 'suspended'
    partnership_level VARCHAR(20), -- 'basic', 'premium', 'enterprise'
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE partner_collaborations (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,
    partner_id UUID NOT NULL REFERENCES partners(id),
    collaboration_type VARCHAR(50), -- 'assessment', 'audit', 'compliance'
    shared_resources JSONB, -- What resources are shared
    access_level VARCHAR(20), -- 'read', 'write', 'admin'
    expires_at TIMESTAMP
);
```

### **Partner Service:**

```javascript
// apps/services/partner-service/routes/partners.js
router.post('/partners/invite', 
    authenticateToken,
    requirePermission('partner-service:partners:invite'),
    async (req, res) => {
        const { partnerEmail, partnerType, collaborationType } = req.body;
        
        // Create partner relationship
        const partner = await createPartner({
            tenantId: req.tenantId,
            partnerEmail,
            partnerType,
            collaborationType
        });
        
        // Send invitation
        await notificationService.sendPartnerInvitation({
            partnerEmail,
            tenantId: req.tenantId,
            collaborationType
        });
        
        res.json({ success: true, partner });
    }
);

// Cross-tenant access
router.get('/partners/:partnerId/assessments',
    authenticateToken,
    requirePermission('partner-service:collaborations:read'),
    async (req, res) => {
        // Verify partnership
        const partnership = await verifyPartnership(
            req.tenantId,
            req.params.partnerId
        );
        
        if (!partnership) {
            return res.status(403).json({ error: 'Partnership not found' });
        }
        
        // Access partner's assessments (with restrictions)
        const assessments = await getPartnerAssessments(
            partnership.partnerTenantId,
            partnership.accessLevel
        );
        
        res.json({ assessments });
    }
);
```

### **Partner Types:**

1. **Vendor** - مورد خارجي (Third-party vendor)
2. **Client** - عميل (Customer organization)
3. **Auditor** - مدقق خارجي (External auditor)
4. **Regulator** - جهة تنظيمية (Regulatory body)
5. **Partner** - شريك استراتيجي (Strategic partner)

---

## 6) BFF (Backend for Frontend) Pattern

### **BFF Responsibilities:**

```javascript
// apps/bff/index.js
const express = require('express');
const axios = require('axios');

const app = express();

// Service registry
const services = {
    'grc-api': process.env.GRC_API_URL || 'http://grc-api:3000',
    'auth-service': process.env.AUTH_SERVICE_URL || 'http://auth-service:3001',
    'document-service': process.env.DOCUMENT_SERVICE_URL || 'http://document-service:3002',
    'partner-service': process.env.PARTNER_SERVICE_URL || 'http://partner-service:3003'
};

// Tenant context middleware
app.use((req, res, next) => {
    const tenantId = req.headers['x-tenant-id'] || 
                     req.user?.tenant_id;
    req.tenantId = tenantId;
    req.serviceHeaders = {
        'x-tenant-id': tenantId,
        'x-user-id': req.user?.id,
        'x-service-token': process.env.SERVICE_TOKEN
    };
    next();
});

// Proxy to services
app.use('/api/grc', createServiceProxy(services['grc-api']));
app.use('/api/auth', createServiceProxy(services['auth-service']));
app.use('/api/documents', createServiceProxy(services['document-service']));
app.use('/api/partners', createServiceProxy(services['partner-service']));

// Aggregated endpoints
app.get('/api/dashboard', async (req, res) => {
    const [assessments, partners, documents] = await Promise.all([
        axios.get(`${services['grc-api']}/api/assessments`, {
            headers: req.serviceHeaders
        }),
        axios.get(`${services['partner-service']}/api/partners`, {
            headers: req.serviceHeaders
        }),
        axios.get(`${services['document-service']}/api/documents/count`, {
            headers: req.serviceHeaders
        })
    ]);
    
    res.json({
        assessments: assessments.data,
        partners: partners.data,
        documentCount: documents.data.count
    });
});

function createServiceProxy(serviceUrl) {
    return async (req, res) => {
        try {
            const response = await axios({
                method: req.method,
                url: `${serviceUrl}${req.path}`,
                headers: req.serviceHeaders,
                data: req.body
            });
            res.json(response.data);
        } catch (error) {
            res.status(error.response?.status || 500)
               .json({ error: error.message });
        }
    };
}
```

---

## 7) Service Contracts (OpenAPI)

### **Service-Specific Contracts:**

```
contracts/api/
├── grc-api.openapi.yaml      # GRC Service API
├── auth-service.openapi.yaml  # Auth Service API
├── document-service.openapi.yaml
├── partner-service.openapi.yaml
└── notification-service.openapi.yaml
```

### **Event Contracts:**

```
contracts/events/
├── assessment.completed.schema.json
├── partner.invited.schema.json
├── document.processed.schema.json
└── user.created.schema.json
```

---

## 8) Quality Gates for Services

| Gate | Requirement | Tool |
|------|-------------|------|
| **Service Health** | `/healthz` and `/readyz` endpoints | curl |
| **Tenant Isolation** | RLS policies tested | Integration tests |
| **RBAC** | Permission checks enforced | Unit tests |
| **Service Contracts** | OpenAPI spec updated | Contract tests |
| **Inter-Service Auth** | Service tokens validated | Security tests |
| **Partner Access** | Cross-tenant access controlled | Integration tests |

---

## 9) Deployment Architecture

### **Docker Compose Structure:**

```yaml
# infra/docker/docker-compose.ecosystem.yml
services:
  # Frontend
  web:
    build: ../../apps/web
    ports: ["5173:5173"]
  
  # BFF
  bff:
    build: ../../apps/bff
    ports: ["3000:3000"]
    environment:
      - GRC_API_URL=http://grc-api:3000
      - AUTH_SERVICE_URL=http://auth-service:3001
      - PARTNER_SERVICE_URL=http://partner-service:3003
  
  # Services
  grc-api:
    build: ../../apps/services/grc-api
    ports: ["3000:3000"]
    environment:
      - DB_HOST=postgres
      - TENANT_ISOLATION_ENABLED=true
  
  auth-service:
    build: ../../apps/services/auth-service
    ports: ["3001:3001"]
  
  partner-service:
    build: ../../apps/services/partner-service
    ports: ["3003:3003"]
  
  # Shared Database
  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=grc_ecosystem
    volumes:
      - postgres_data:/var/lib/postgresql/data
  
  # Service Registry (Optional)
  consul:
    image: consul:latest
    ports: ["8500:8500"]
```

---

## 10) Migration Path

### **Phase 1: Monolith to Services**
1. Extract auth logic → `auth-service`
2. Extract document processing → `document-service`
3. Keep GRC core → `grc-api`

### **Phase 2: Add Partner Service**
1. Create `partner-service`
2. Implement partner relationships
3. Add cross-tenant access controls

### **Phase 3: Enhance BFF**
1. Add service routing
2. Implement aggregation
3. Add caching layer

### **Phase 4: Event-Driven**
1. Add event bus (RabbitMQ/Kafka)
2. Implement async communication
3. Add event sourcing where needed

---

> **ملاحظة:** هذا النموذج يدعم نظام متعدد المستأجرين، متعدد الأدوار، متعدد الخدمات، مع دعم كامل للشركاء والتعاون بين المنظمات.

