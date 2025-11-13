# 🔌 API & Database Connections for All Pages

**Date:** November 13, 2025 at 2:54 AM  
**Task:** Connect all 20+ pages to actual APIs and database

---

## 📊 Page Connection Status

### **✅ Already Connected:**
1. **EnhancedDashboard** - ✅ Connected to real APIs
2. **AdvancedShell** - ✅ Connected to compliance, risks, notifications APIs

### **🔄 Need API Connections:**

#### **Core Pages (3):**
- **AssessmentDetailsCollaborative** - Need assessment APIs
- **Frameworks** - Need framework management APIs

#### **Risk & Compliance (4):**
- **RiskManagementModuleEnhanced** - Need risk APIs
- **ComplianceTrackingModuleEnhanced** - Need compliance APIs  
- **ControlsModuleEnhanced** - Need controls APIs
- **Evidence** - Need evidence management APIs

#### **Organization (3):**
- **OrganizationsPage** - Need organization APIs
- **UserManagementPage** - Need user management APIs
- **ReportsPage** - Need reporting APIs

#### **System (9):**
- **SettingsPage** - Need system settings APIs
- **DatabasePage** - Need database management APIs
- **RegulatoryIntelligencePage** - Need regulatory APIs
- **APIManagementPage** - Need API management endpoints
- **PerformanceMonitorPage** - Need system metrics APIs
- **WorkflowManagementPage** - Need workflow APIs
- **NotificationManagementPage** - Need notification APIs
- **DocumentManagementPage** - Need document APIs
- **AuditLogsPage** - Need audit log APIs
- **AISchedulerPage** - Need AI service APIs
- **RAGServicePage** - Need RAG service APIs

#### **Platform (5):**
- **LicensesManagementPage** - Need license APIs
- **RenewalsPipelinePage** - Need renewal APIs
- **UpgradePage** - Need upgrade management APIs
- **AutoAssessmentGeneratorPage** - Need auto-assessment APIs
- **PartnerManagementPage** - Need partner APIs

#### **Regulatory (4):**
- **RegulatoryIntelligenceEnginePage** - Need regulatory engine APIs
- **RegulatorsPage** - Need regulator data APIs
- **SectorIntelligence** - Need sector analysis APIs
- **KSAGRCPage** - Need KSA-specific GRC APIs

---

## 🔧 Implementation Plan

### **Step 1: API Service Expansion**
Update `apiEndpoints.js` to include all required endpoints:

```javascript
// Add to apiService
export default {
  // Existing
  dashboard: { getKPIs, getMetrics },
  risks: { getAll, create, update, delete },
  
  // New additions
  assessments: {
    getAll: () => api.get('/assessments'),
    getById: (id) => api.get(`/assessments/${id}`),
    create: (data) => api.post('/assessments', data),
    update: (id, data) => api.put(`/assessments/${id}`, data),
    delete: (id) => api.delete(`/assessments/${id}`)
  },
  
  frameworks: {
    getAll: () => api.get('/frameworks'),
    getById: (id) => api.get(`/frameworks/${id}`),
    create: (data) => api.post('/frameworks', data)
  },
  
  controls: {
    getAll: () => api.get('/controls'),
    getByFramework: (fwId) => api.get(`/frameworks/${fwId}/controls`)
  },
  
  organizations: {
    getAll: () => api.get('/organizations'),
    create: (data) => api.post('/organizations', data)
  },
  
  users: {
    getAll: () => api.get('/users'),
    create: (data) => api.post('/users', data),
    updateRole: (id, role) => api.put(`/users/${id}/role`, { role })
  },
  
  reports: {
    getAll: () => api.get('/reports'),
    generate: (type, params) => api.post('/reports/generate', { type, params })
  },
  
  settings: {
    get: () => api.get('/settings'),
    update: (data) => api.put('/settings', data)
  },
  
  workflows: {
    getAll: () => api.get('/workflows'),
    create: (data) => api.post('/workflows', data)
  },
  
  notifications: {
    getAll: () => api.get('/notifications'),
    getUnread: () => api.get('/notifications/unread'),
    markRead: (id) => api.put(`/notifications/${id}/read`)
  },
  
  documents: {
    getAll: () => api.get('/documents'),
    upload: (file) => api.post('/documents/upload', file)
  },
  
  auditLogs: {
    getAll: () => api.get('/audit-logs'),
    getByUser: (userId) => api.get(`/audit-logs/user/${userId}`)
  },
  
  licenses: {
    getAll: () => api.get('/licenses'),
    update: (id, data) => api.put(`/licenses/${id}`, data)
  },
  
  regulatory: {
    getIntelligence: () => api.get('/regulatory/intelligence'),
    getRegulators: () => api.get('/regulatory/regulators'),
    getSectorData: () => api.get('/regulatory/sectors')
  }
};
```

### **Step 2: Database Schema Requirements**

#### **Core Tables:**
```sql
-- Assessments
CREATE TABLE assessments (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  framework_id UUID REFERENCES frameworks(id),
  status VARCHAR(50) DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Frameworks  
CREATE TABLE frameworks (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  version VARCHAR(50),
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Controls
CREATE TABLE controls (
  id UUID PRIMARY KEY,
  framework_id UUID REFERENCES frameworks(id),
  control_id VARCHAR(100) NOT NULL,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'active'
);

-- Organizations
CREATE TABLE organizations (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100),
  parent_id UUID REFERENCES organizations(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(100) DEFAULT 'user',
  organization_id UUID REFERENCES organizations(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Workflows
CREATE TABLE workflows (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100),
  status VARCHAR(50) DEFAULT 'active',
  config JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  message TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Documents
CREATE TABLE documents (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500),
  mime_type VARCHAR(100),
  size INTEGER,
  uploaded_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Audit Logs
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  action VARCHAR(255) NOT NULL,
  resource_type VARCHAR(100),
  resource_id UUID,
  details JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Licenses
CREATE TABLE licenses (
  id UUID PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id),
  type VARCHAR(100) NOT NULL,
  status VARCHAR(50) DEFAULT 'active',
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### **Step 3: Page Updates**

Each page needs to be updated to:
1. Import `apiService`
2. Add `useEffect` to fetch data
3. Add loading states
4. Handle errors gracefully
5. Remove mock data

---

## 🎯 Priority Implementation Order

### **High Priority (Core Business):**
1. **AssessmentDetailsCollaborative** - Core GRC functionality
2. **RiskManagementModuleEnhanced** - Risk analysis
3. **ComplianceTrackingModuleEnhanced** - Compliance tracking
4. **OrganizationsPage** - Organization management
5. **UserManagementPage** - User administration

### **Medium Priority (System):**
6. **ControlsModuleEnhanced** - Control management
7. **ReportsPage** - Reporting system
8. **WorkflowManagementPage** - Process automation
9. **NotificationManagementPage** - Communication
10. **DocumentManagementPage** - Document handling

### **Lower Priority (Advanced):**
11. **RegulatoryIntelligencePage** - Regulatory data
12. **AISchedulerPage** - AI services
13. **RAGServicePage** - RAG functionality
14. **LicensesManagementPage** - License tracking
15. **PartnerManagementPage** - Partner relations

---

## ✅ Implementation Checklist

### **For Each Page:**
- [ ] Remove mock data imports
- [ ] Add API service imports
- [ ] Implement data fetching
- [ ] Add loading states
- [ ] Add error handling
- [ ] Test CRUD operations
- [ ] Verify real-time updates

### **Backend Requirements:**
- [ ] Create database tables
- [ ] Implement API endpoints
- [ ] Add authentication/authorization
- [ ] Set up data validation
- [ ] Add audit logging
- [ ] Test API responses

---

**Status:** Ready to implement API connections for all pages  
**Estimated Time:** 2-3 hours for all pages  
**Dependencies:** Backend APIs and database schema
