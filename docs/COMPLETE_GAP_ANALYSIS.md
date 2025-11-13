# 🔍 **COMPLETE GAP ANALYSIS - Missing Components & Mocks**

**Date:** 2025-01-10  
**Goal:** Identify all missing components and replace mocks with real implementations

---

## 📊 **EXECUTIVE SUMMARY**

| Category | Missing | Mocks Found | Status |
|----------|---------|------------|--------|
| **Backend Services** | 4 services | 0 | 🔴 Critical |
| **BFF Routing** | Service routing | 0 | 🔴 Critical |
| **Frontend Components** | 2 placeholders | 3 mocks | 🟡 Medium |
| **API Integration** | Partial | Some | 🟡 Medium |
| **Database** | Partner tables | 0 | 🟡 Medium |

---

## 🔴 **CRITICAL GAPS - Backend Services**

### **1. Auth Service** ❌ **MISSING**

**Location:** `apps/services/auth-service/`  
**Status:** ❌ **NOT EXISTS**

**What's Missing:**
```
apps/services/auth-service/
├── package.json                    ❌ Missing
├── server.js                       ❌ Missing
├── config/
│   ├── database.js                 ❌ Missing
│   └── jwt.js                      ❌ Missing
├── middleware/
│   ├── auth.js                     ❌ Missing (extract from grc-api)
│   └── rbac.js                     ❌ Missing (extract from grc-api)
├── routes/
│   ├── auth.js                     ❌ Missing (extract from grc-api)
│   ├── users.js                    ❌ Missing (extract from grc-api)
│   └── microsoft-auth.js          ❌ Missing (extract from grc-api)
├── services/
│   ├── authService.js             ❌ Missing
│   ├── userService.js             ❌ Missing (extract from grc-api)
│   └── microsoftAuth.js           ❌ Missing (extract from grc-api)
└── utils/
    └── jwt.js                      ❌ Missing (extract from grc-api)
```

**Source Files (in grc-api):**
- ✅ `apps/services/grc-api/routes/auth.js` → Extract
- ✅ `apps/services/grc-api/routes/users.js` → Extract
- ✅ `apps/services/grc-api/routes/microsoft-auth.js` → Extract
- ✅ `apps/services/grc-api/middleware/auth.js` → Extract
- ✅ `apps/services/grc-api/middleware/rbac.js` → Extract
- ✅ `apps/services/grc-api/services/userService.js` → Extract
- ✅ `apps/services/grc-api/services/microsoftAuth.js` → Extract
- ✅ `apps/services/grc-api/utils/jwt.js` → Extract

**Priority:** 🔴 **CRITICAL** - Required for authentication

---

### **2. Document Service** ❌ **MISSING**

**Location:** `apps/services/document-service/`  
**Status:** ❌ **NOT EXISTS**

**What's Missing:**
```
apps/services/document-service/
├── package.json                    ❌ Missing
├── server.js                       ❌ Missing
├── config/
│   └── storage.js                  ❌ Missing
├── middleware/
│   └── upload.js                  ❌ Missing (extract from grc-api)
├── routes/
│   └── documents.js                ❌ Missing (extract from grc-api)
├── services/
│   ├── documentProcessor.js       ❌ Missing (extract from grc-api)
│   ├── ocrService.js              ❌ Missing
│   └── ragService.js              ❌ Missing
└── uploads/                        ❌ Missing
```

**Source Files (in grc-api):**
- ✅ `apps/services/grc-api/routes/documents.js` → Extract
- ✅ `apps/services/grc-api/middleware/upload.js` → Extract
- ✅ `apps/services/grc-api/services/documentProcessor.js` → Extract
- ✅ `apps/services/grc-api/services/document/` → Extract

**Priority:** 🔴 **CRITICAL** - Required for document management

---

### **3. Partner Service** ❌ **MISSING**

**Location:** `apps/services/partner-service/`  
**Status:** ⚠️ **ONLY README EXISTS**

**What's Missing:**
```
apps/services/partner-service/
├── package.json                    ❌ Missing
├── server.js                       ❌ Missing
├── config/
│   └── database.js                 ❌ Missing
├── middleware/
│   └── partnerAccess.js           ❌ Missing (NEW)
├── routes/
│   ├── partners.js                 ❌ Missing (NEW)
│   ├── collaborations.js           ❌ Missing (NEW)
│   └── resources.js                ❌ Missing (NEW)
├── services/
│   ├── partnerService.js          ❌ Missing (NEW)
│   ├── collaborationService.js    ❌ Missing (NEW)
│   └── accessControlService.js    ❌ Missing (NEW)
└── README.md                       ✅ Exists
```

**Priority:** 🔴 **CRITICAL** - Required for partner collaboration

---

### **4. Notification Service** ❌ **MISSING**

**Location:** `apps/services/notification-service/`  
**Status:** ❌ **NOT EXISTS**

**What's Missing:**
```
apps/services/notification-service/
├── package.json                    ❌ Missing
├── server.js                       ❌ Missing
├── config/
│   ├── smtp.js                     ❌ Missing
│   └── templates.js                ❌ Missing
├── routes/
│   └── notifications.js            ❌ Missing (NEW)
├── services/
│   ├── emailService.js            ❌ Missing (NEW)
│   ├── smsService.js              ❌ Missing (NEW - optional)
│   ├── pushService.js             ❌ Missing (NEW - optional)
│   └── templateService.js         ❌ Missing (NEW)
└── templates/                      ❌ Missing
```

**Priority:** 🔴 **CRITICAL** - Required for notifications

---

## 🔴 **CRITICAL GAPS - BFF (Backend for Frontend)**

### **BFF Service Routing** ❌ **MISSING**

**Location:** `apps/bff/index.js`  
**Current:** Only health checks  
**Status:** ❌ **NEEDS COMPLETE REWRITE**

**What's Missing:**
```javascript
// Current (apps/bff/index.js):
const express = require('express');
const app = express();
app.get('/healthz', (_,res)=>res.send('ok'));
app.get('/readyz', (_,res)=>res.send('ready'));
app.listen(3000, ()=>console.log('BFF on :3000'));

// NEEDS:
- Service registry configuration
- Proxy middleware for each service
- Tenant context injection
- Service token management
- Response aggregation
- Error handling & retries
- Request/response logging
- Rate limiting per service
```

**Required Implementation:**
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

**Priority:** 🔴 **CRITICAL** - Required for frontend to work

---

## 🟡 **MEDIUM GAPS - Frontend Components**

### **1. SectorIntelligence Page** ⚠️ **PLACEHOLDER**

**Location:** `apps/web/src/pages/SectorIntelligence.js`  
**Status:** ⚠️ **PLACEHOLDER ONLY**

**Current Code:**
```javascript
const SectorIntelligence = () => {
  return (
    <div className="px-4 py-6 sm:px-0">
      <h1 className="text-xl font-semibold text-gray-900 mb-6">Sector Intelligence</h1>
      <div className="bg-white shadow rounded-lg p-6">
        <p className="text-gray-600">Sector-based intelligence dashboard coming soon...</p>
      </div>
    </div>
  );
};
```

**What's Missing:**
- Real sector intelligence dashboard
- Sector-based analytics
- Framework mapping by sector
- Control recommendations by sector
- Integration with `/api/sector-controls` endpoint

**Priority:** 🟡 **MEDIUM** - Page exists but needs implementation

---

### **2. UniversalTableViewer Component** ⚠️ **PLACEHOLDER**

**Location:** `apps/web/src/components/UniversalTableViewer.js`  
**Status:** ⚠️ **PLACEHOLDER ONLY**

**Current Code:**
```javascript
const UniversalTableViewer = ({ tableName }) => {
  return (
    <div className="p-4">
      <p className="text-gray-600">Universal table viewer for {tableName} coming soon...</p>
    </div>
  );
};
```

**What's Missing:**
- Generic table viewer component
- Dynamic column mapping
- Filtering and sorting
- Pagination
- Export functionality
- Integration with `/api/tables` endpoint

**Priority:** 🟡 **MEDIUM** - Component exists but needs implementation

---

## 🟡 **MEDIUM GAPS - Mock Data in Components**

### **1. AdvancedGRCDashboard - Mock Recent Activity** ⚠️

**Location:** `apps/web/src/components/AdvancedGRCDashboard.jsx`  
**Line 59:** Mock recent activity

**Current Code:**
```javascript
useEffect(() => {
  // Mock recent activity - replace with real audit log data
  setRecentActivity([
    { id: 1, action: 'Assessment Created', entity: 'NCA Cybersecurity Assessment', time: '2 hours ago', type: 'create' },
    { id: 2, action: 'Control Updated', entity: 'SAMA-CSF-001', time: '4 hours ago', type: 'update' },
    // ... more mock data
  ]);
}, []);
```

**What's Missing:**
- Real audit log API endpoint
- Integration with `/api/audit-logs` or similar
- Real-time activity updates

**Fix Required:**
```javascript
useEffect(() => {
  // Replace with real API call
  api.get('/audit-logs', { params: { limit: 10 } })
    .then(res => setRecentActivity(res.data))
    .catch(err => console.error('Error fetching activity:', err));
}, []);
```

**Priority:** 🟡 **MEDIUM** - Component works but uses mock data

---

### **2. AdvancedAppShell - Mock Feature Flags** ⚠️

**Location:** `apps/web/src/components/layout/AdvancedAppShell.jsx`  
**Line 252:** Mock feature flags

**Current Code:**
```javascript
// Feature flags (mock)
const flags = {
  'risk.matrix': true,
  'evidence.ocr': true,
  'workflow.builder': true,
  'ai.agents': can('agents.use'),
  'billing': false,
  'notifications.realtime': true,
  'hijri.calendar': true,
  'export.excel': can('reports.export')
};
```

**What's Missing:**
- Real feature flag service
- Integration with backend feature flags API
- Dynamic feature flag management

**Priority:** 🟡 **LOW** - Works but should use real service

---

### **3. AdvancedAssessmentManager - Real API Calls** ✅

**Location:** `apps/web/src/components/AdvancedAssessmentManager.jsx`  
**Status:** ✅ **USES REAL API CALLS**

**Current Code:**
```javascript
const fetchData = async () => {
  try {
    setLoading(true);
    
    const [assessmentsRes, frameworksRes, organizationsRes] = await Promise.all([
      fetch('/api/assessments'),           // ✅ Real API
      fetch('/api/grc-frameworks'),        // ✅ Real API
      fetch('/api/organizations')         // ✅ Real API
    ]);
    // ... processes real data
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};
```

**Status:** ✅ **GOOD** - Already uses real API calls

---

## 🟡 **MEDIUM GAPS - Database**

### **Partner Tables Migration** ❌ **MISSING**

**Location:** `infra/db/migrations/`  
**Status:** ❌ **NOT EXISTS**

**What's Missing:**
```sql
-- 013_create_partner_tables.sql
CREATE TABLE partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    partner_tenant_id UUID REFERENCES tenants(id),
    partner_type VARCHAR(50), -- 'vendor', 'client', 'auditor', 'regulator', 'strategic'
    status VARCHAR(20), -- 'pending', 'active', 'suspended', 'rejected'
    partnership_level VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE partner_collaborations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    partner_id UUID NOT NULL REFERENCES partners(id),
    collaboration_type VARCHAR(50),
    shared_resources JSONB,
    access_level VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_collaborations ENABLE ROW LEVEL SECURITY;
```

**Priority:** 🟡 **MEDIUM** - Required for partner service

---

## 📋 **COMPLETE MISSING LIST**

### **Backend Services (4 services)**
1. ❌ **Auth Service** - Extract from grc-api
2. ❌ **Document Service** - Extract from grc-api
3. ❌ **Partner Service** - New implementation
4. ❌ **Notification Service** - New implementation

### **BFF (1 component)**
5. ❌ **BFF Service Routing** - Complete rewrite needed

### **Frontend Components (2 components)**
6. ⚠️ **SectorIntelligence** - Replace placeholder
7. ⚠️ **UniversalTableViewer** - Replace placeholder

### **Frontend Mock Data (2 locations)**
8. ⚠️ **AdvancedGRCDashboard** - Replace mock activity
9. ⚠️ **AdvancedAppShell** - Replace mock feature flags

### **Database (1 migration)**
10. ❌ **Partner Tables Migration** - Create new migration

---

## 🎯 **PRIORITY ORDER**

### **Phase 1: Critical Backend (Week 1-2)**
1. 🔴 **BFF Service Routing** - Must work first
2. 🔴 **Auth Service** - Extract from grc-api
3. 🔴 **Document Service** - Extract from grc-api

### **Phase 2: New Services (Week 3)**
4. 🔴 **Partner Service** - New implementation
5. 🔴 **Notification Service** - New implementation

### **Phase 3: Database (Week 3)**
6. 🟡 **Partner Tables Migration** - Create migration

### **Phase 4: Frontend Fixes (Week 4)**
7. 🟡 **SectorIntelligence** - Replace placeholder
8. 🟡 **UniversalTableViewer** - Replace placeholder
9. 🟡 **AdvancedGRCDashboard** - Replace mock activity
10. 🟡 **AdvancedAppShell** - Replace mock feature flags

---

## ✅ **WHAT'S ALREADY WORKING**

### **Frontend Components Using Real APIs** ✅
- ✅ **AdvancedAssessmentManager** - Uses real `/api/assessments`, `/api/grc-frameworks`, `/api/organizations`
- ✅ **AdvancedFrameworkManager** - Uses real API calls
- ✅ **OrganizationsPage** - Uses real API calls
- ✅ **ControlsPage** - Uses real API calls
- ✅ **RegulatorsPage** - Uses real API calls
- ✅ **ReportsPage** - Uses real API calls

### **Backend Services** ✅
- ✅ **GRC API** - Fully functional with 19 routes
- ✅ **Database** - 17 migrations, 14 schemas

### **API Client** ✅
- ✅ **api.js** - Complete API client with all endpoints defined

---

## 📊 **STATUS SUMMARY**

| Component | Status | Action Required |
|-----------|--------|-----------------|
| **Auth Service** | ❌ Missing | Extract from grc-api |
| **Document Service** | ❌ Missing | Extract from grc-api |
| **Partner Service** | ❌ Missing | New implementation |
| **Notification Service** | ❌ Missing | New implementation |
| **BFF Routing** | ❌ Missing | Complete rewrite |
| **SectorIntelligence** | ⚠️ Placeholder | Implement dashboard |
| **UniversalTableViewer** | ⚠️ Placeholder | Implement component |
| **Mock Activity** | ⚠️ Mock data | Replace with API |
| **Mock Feature Flags** | ⚠️ Mock data | Replace with API |
| **Partner Tables** | ❌ Missing | Create migration |

---

## 🚀 **NEXT STEPS**

1. **Start with BFF** - Must work first for frontend to connect
2. **Extract Auth Service** - Most critical service
3. **Extract Document Service** - Second critical service
4. **Build Partner Service** - New functionality
5. **Build Notification Service** - New functionality
6. **Fix Frontend Placeholders** - Replace with real components
7. **Replace Mock Data** - Connect to real APIs

**Total Missing:** 10 components  
**Critical:** 5 components  
**Medium:** 5 components

