# Multi-Tenant MSP Platform Architecture

## Overview

This is a **Multi-Tenant Managed Service Provider (MSP)** platform with three distinct user levels and role-based access control.

---

## 🏢 Multi-Tenant Structure

### Three-Tier Architecture

```
┌─────────────────────────────────────────────────┐
│         PLATFORM LEVEL (MSP Company)             │
│  - Platform Admin manages all tenants            │
│  - Revenue tracking, billing, licensing          │
│  - System administration                         │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│        TENANT LEVEL (Client Organizations)       │
│  - Tenant Admin manages their organization       │
│  - GRC operations, compliance, risk              │
│  - Team management                               │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│         TEAM MEMBER LEVEL (Employees)            │
│  - Limited access to assigned tasks              │
│  - View-only access to reports                   │
│  - Personal dashboard                            │
└─────────────────────────────────────────────────┘
```

---

## 👥 User Roles & Access Levels

### 1. Platform Admin (MSP Level)

**Role:** `platform_admin`

**Who:** MSP company executives and administrators

**Access:** Full platform access across ALL tenants

**Dashboard:** `/platform`

**Capabilities:**
- ✅ Manage all client organizations (tenants)
- ✅ Onboard new clients
- ✅ View financial data (billing, revenue, subscriptions)
- ✅ Manage licenses across all tenants
- ✅ Platform-wide analytics and reporting
- ✅ System administration (database, API, health)
- ✅ Global regulatory engine configuration
- ✅ Platform automation workflows

**Navigation Sections:**
1. Platform Dashboard (MSP overview)
2. Tenant Management
   - All Tenants
   - Onboarding
   - Billing & Subscriptions
   - License Management
3. Platform Analytics
   - Revenue & Growth
   - Usage Analytics
   - Compliance Overview
4. Platform Automation
   - Regulatory Engine
   - Global Workflows
5. Platform Administration
   - Settings
   - Users
   - System Health
   - Database
   - API Management

**Special Features:**
- 🔄 Tenant Switcher (switch between tenant contexts)
- 📊 Multi-tenant aggregated dashboards
- 💰 Financial reporting per tenant
- 📈 Usage analytics per tenant

---

### 2. Tenant Admin (Client Level)

**Role:** `tenant_admin`

**Who:** Client organization administrators

**Access:** Full access within THEIR tenant only

**Dashboard:** `/tenant/{tenant_id}`

**Capabilities:**
- ✅ Manage their organization structure
- ✅ Full GRC operations (assessments, risks, compliance)
- ✅ Manage team members and assign work
- ✅ Configure frameworks and controls
- ✅ Generate reports for their organization
- ✅ View billing and subscription info (read-only)
- ✅ Tenant-specific automation

**Navigation Sections:**
1. Dashboard (Tenant-specific KPIs)
2. Governance Setup
   - Frameworks
   - Organization Structure
   - Users & Access
3. Risk Management
   - Risk Register
   - Risk Assessment
   - Controls
4. Compliance Operations
   - Assessments
   - Compliance Tracking
   - Evidence
   - Audit Trail
5. Reports & Intelligence
   - Reports
   - Regulatory Updates
6. Automation
   - Workflows
   - AI Assistant
7. Administration
   - Settings
   - Billing (view-only)
   - Notifications

**Special Features:**
- 📊 Tenant-specific compliance dashboards
- 👥 Team workload management
- 📋 Customized assessment templates
- 🔔 Tenant-specific notifications

---

### 3. Team Member (Employee Level)

**Role:** `team_member`

**Who:** Client organization employees

**Access:** Limited to assigned work items only

**Dashboard:** `/tenant/{tenant_id}/my-dashboard`

**Capabilities:**
- ✅ View personal dashboard with assigned tasks
- ✅ Complete assigned assessments
- ✅ Manage assigned risks
- ✅ Update assigned controls
- ✅ View compliance status (read-only)
- ✅ View reports (read-only)
- ✅ Use AI assistant for help

**Navigation Sections:**
1. My Dashboard (Personal workspace)
2. My Work
   - My Assessments
   - My Risks
   - My Controls
3. View & Reports
   - Compliance Status (read-only)
   - Reports (read-only)
4. Help & Resources
   - AI Assistant

**Special Features:**
- 📝 Personal task list
- 🎯 Focused view (only assigned items)
- 📊 Progress tracking
- 🤖 AI help for compliance questions

---

## 🗄️ Data Isolation

### Tenant Isolation Strategy

**Database Level:**
- Each tenant has isolated data schema
- Tenant ID in every record: `tenant_id`
- Row-Level Security (RLS) enforced
- Cross-tenant queries blocked

**API Level:**
- Middleware validates `tenant_id` from JWT
- All API calls scoped to tenant context
- Platform admin can override with special permission

**Storage Level:**
- Separate S3 buckets per tenant: `tenant-{id}-documents/`
- Evidence files isolated per tenant
- Backup and restore per tenant

---

## 🔐 Role-Based Access Control (RBAC)

### Permission Matrix

| Feature | Platform Admin | Tenant Admin | Team Member |
|---------|---------------|--------------|-------------|
| **Tenant Management** |  |  |  |
| Create/Delete Tenants | ✅ | ❌ | ❌ |
| View All Tenants | ✅ | ❌ | ❌ |
| View Own Tenant | ✅ | ✅ | ✅ |
| **User Management** |  |  |  |
| Manage Platform Users | ✅ | ❌ | ❌ |
| Manage Tenant Users | ✅ | ✅ | ❌ |
| View Team Members | ✅ | ✅ | ✅ |
| **Financial** |  |  |  |
| View All Revenue | ✅ | ❌ | ❌ |
| Manage Billing | ✅ | ❌ | ❌ |
| View Own Billing | ✅ | ✅ (read) | ❌ |
| **GRC Operations** |  |  |  |
| Create Assessments | ✅ | ✅ | ❌ |
| Complete Assessments | ✅ | ✅ | ✅ (assigned) |
| View All Assessments | ✅ | ✅ | ❌ |
| View Assigned Work | ✅ | ✅ | ✅ |
| **Compliance** |  |  |  |
| Configure Frameworks | ✅ | ✅ | ❌ |
| Track Compliance | ✅ | ✅ | ✅ (read) |
| Upload Evidence | ✅ | ✅ | ✅ (assigned) |
| **Reporting** |  |  |  |
| Platform Reports | ✅ | ❌ | ❌ |
| Tenant Reports | ✅ | ✅ | ✅ (read) |
| Export Data | ✅ | ✅ | ❌ |

---

## 📊 Dashboard KPIs Per Role

### Platform Admin Dashboard

**URL:** `/platform`

**KPIs:**
- Total Tenants
- Active Subscriptions
- Monthly Recurring Revenue (MRR)
- Platform Compliance Average
- Total Users Across All Tenants
- System Health Score
- API Usage Statistics
- Support Tickets

**Charts:**
- Revenue trend (last 12 months)
- Tenant growth rate
- Compliance score distribution
- Feature usage by tenant
- Regional distribution

---

### Tenant Admin Dashboard

**URL:** `/tenant/{tenant_id}`

**KPIs:**
- Overall Compliance Score
- Open Compliance Gaps
- High-Priority Risks
- Active Assessments
- Team Utilization
- Upcoming Deadlines
- Evidence Collection Rate
- Regulatory Updates

**Charts:**
- Compliance trend (last 90 days)
- Risk heat map
- Framework coverage
- Team workload distribution
- Control effectiveness

---

### Team Member Dashboard

**URL:** `/tenant/{tenant_id}/my-dashboard`

**KPIs:**
- My Pending Tasks
- My Completed This Week
- My Overdue Items
- My Compliance Score Contribution
- Next Deadline
- Recent Achievements

**Charts:**
- My task completion rate
- My assigned work timeline
- My contribution to compliance

---

## 🔄 Tenant Switching (Platform Admin Only)

Platform Admins can switch between tenant contexts:

```javascript
// Component: TenantSelector
<TenantSelector
  currentTenant={selectedTenant}
  tenants={allTenants}
  onTenantSwitch={(tenant) => {
    // Switch context
    setTenantContext(tenant);
    // Reload navigation
    navigate(`/tenant/${tenant.id}`);
  }}
/>
```

When switched to a tenant:
- Platform admin sees tenant-specific data
- Navigation shows tenant-level menus
- Dashboard shows tenant KPIs
- Can perform actions as tenant admin

---

## 🌐 URL Structure

### Platform Admin URLs
```
/platform                           → Platform Dashboard
/platform/tenants                   → All Tenants
/platform/tenants/:id               → Tenant Details
/platform/billing                   → Billing Management
/platform/analytics/revenue         → Revenue Analytics
/platform/settings                  → Platform Settings
```

### Tenant Admin URLs
```
/tenant/:tenant_id                  → Tenant Dashboard
/tenant/:tenant_id/frameworks       → Frameworks
/tenant/:tenant_id/assessments      → Assessments
/tenant/:tenant_id/risks            → Risks
/tenant/:tenant_id/compliance       → Compliance
/tenant/:tenant_id/reports          → Reports
/tenant/:tenant_id/settings         → Tenant Settings
```

### Team Member URLs
```
/tenant/:tenant_id/my-dashboard     → Personal Dashboard
/tenant/:tenant_id/my-assessments   → My Assessments
/tenant/:tenant_id/my-risks         → My Risks
/tenant/:tenant_id/my-controls      → My Controls
```

---

## 🔧 Implementation Details

### JWT Token Structure

```json
{
  "user_id": "usr_123",
  "email": "admin@msp.com",
  "role": "platform_admin",
  "tenant_id": null,  // null for platform admin, specific ID for tenant users
  "permissions": [
    "platform:admin",
    "tenant:*:admin",
    "billing:manage"
  ],
  "current_tenant_context": "tenant_456"  // For platform admin viewing tenant
}
```

### API Request Headers

```
Authorization: Bearer {jwt_token}
X-Tenant-ID: tenant_456
X-User-Role: tenant_admin
```

### Middleware Validation

```javascript
// Tenant isolation middleware
function validateTenantAccess(req, res, next) {
  const userRole = req.user.role;
  const requestedTenant = req.params.tenant_id || req.headers['x-tenant-id'];
  const userTenant = req.user.tenant_id;
  
  // Platform admin can access any tenant
  if (userRole === 'platform_admin') {
    return next();
  }
  
  // Tenant users can only access their own tenant
  if (requestedTenant === userTenant) {
    return next();
  }
  
  // Unauthorized
  return res.status(403).json({ error: 'Access denied to this tenant' });
}
```

---

## 📈 Scalability

### Multi-Tenant Scaling Strategy

**Database:**
- PostgreSQL with Row-Level Security
- Connection pooling per tenant
- Partitioning by tenant_id for large tables

**Caching:**
- Redis with tenant-specific keys: `tenant:{id}:cache:{key}`
- Separate cache invalidation per tenant

**File Storage:**
- S3 with tenant-specific prefixes
- CloudFront distribution with tenant routing

**Compute:**
- Kubernetes pods with tenant-aware routing
- Auto-scaling based on tenant activity

---

## 🎯 MSP Financial Model

### Subscription Tiers

| Tier | Max Users | Max Frameworks | Support | Price/Month |
|------|-----------|----------------|---------|-------------|
| **Starter** | 10 | 3 | Email | $99 |
| **Professional** | 50 | 10 | Email + Chat | $499 |
| **Enterprise** | Unlimited | Unlimited | 24/7 Phone | Custom |

### Per-Tenant Billing

```javascript
{
  tenant_id: "tenant_123",
  subscription: {
    tier: "professional",
    status: "active",
    users: 35,
    mrr: 499,
    next_billing_date: "2025-12-01",
    payment_method: "card_ending_4242"
  },
  usage: {
    assessments_this_month: 45,
    storage_gb: 12.5,
    api_calls: 15000
  }
}
```

---

## ✅ Implementation Checklist

- [x] Multi-tenant navigation structure created
- [x] Role-based menu generation
- [x] Tenant selector component
- [x] Role badge component
- [ ] Update App.jsx routes for multi-tenant URLs
- [ ] Create Platform Admin dashboard
- [ ] Create Tenant Admin dashboard  
- [ ] Create Team Member dashboard
- [ ] Implement tenant switching
- [ ] Add JWT role validation middleware
- [ ] Implement Row-Level Security in database
- [ ] Create tenant onboarding flow
- [ ] Build billing management interface
- [ ] Add usage analytics per tenant

---

## 🚀 Next Steps

1. **Update Routing** - Add platform and tenant-specific routes
2. **Create Dashboards** - Build role-specific dashboard components
3. **Add Middleware** - Implement tenant isolation at API level
4. **Configure Database** - Set up multi-tenant schema with RLS
5. **Build Onboarding** - Create tenant registration flow
6. **Financial Integration** - Connect Stripe/payment processor
7. **Testing** - Test cross-tenant isolation

---

*Multi-Tenant MSP Platform - Secure, Scalable, Role-Based GRC Solution*
