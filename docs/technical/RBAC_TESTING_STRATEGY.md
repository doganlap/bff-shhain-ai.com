# 🧪 **Multi-Tenant RBAC Testing Strategy**

**Project:** Assessment-GRC Platform
**Date:** November 10, 2025
**Version:** 1.0
**Status:** Test Design Phase

---

## 📋 **EXECUTIVE SUMMARY**

This document outlines the comprehensive testing strategy for validating multi-tenant RBAC implementation. The test suite covers security isolation, permission enforcement, edge cases, and performance validation.

### **Test Coverage Goals**
- ✅ **100% Security Boundary Validation**
- ✅ **Zero Cross-Tenant Data Leakage**
- ✅ **Complete Permission Matrix Testing**
- ✅ **Edge Case Scenario Coverage**
- ✅ **Performance Under Load**

---

## 🎯 **TEST CATEGORIES**

### **1. Unit Tests**
- JWT validation and manipulation
- Permission calculation algorithms
- Role hierarchy resolution
- Tenant context extraction

### **2. Integration Tests**
- Cross-service authentication flows
- Service-to-service communication
- Database RLS policy enforcement
- BFF routing with tenant context

### **3. Security Tests**
- Cross-tenant access attempts
- Privilege escalation attempts
- Token manipulation and replay
- SQL injection with tenant bypass

### **4. Performance Tests**
- Permission check latency
- Concurrent user scaling
- Database query performance
- Cache effectiveness

### **5. End-to-End Tests**
- Complete user workflows
- Multi-service operations
- Partner collaboration scenarios
- Audit trail validation

---

## 🔒 **SECURITY TEST SCENARIOS**

### **Tenant Isolation Tests**

| Test ID | Scenario | Expected Result |
|---------|----------|-----------------|
| **TI001** | User A (Tenant A) tries to access Tenant B assessments | ❌ 403 Forbidden |
| **TI002** | User A modifies JWT to include Tenant B ID | ❌ 401 Unauthorized |
| **TI003** | User A sends X-Tenant-ID header for Tenant B | ❌ 400 Bad Request |
| **TI004** | Service query without tenant context | ❌ No results returned |
| **TI005** | Direct database access bypassing RLS | ❌ Empty result set |

### **Permission Escalation Tests**

| Test ID | Scenario | Expected Result |
|---------|----------|-----------------|
| **PE001** | Member role attempts admin operation | ❌ 403 Forbidden |
| **PE002** | Project user tries organization-level access | ❌ 403 Forbidden |
| **PE003** | Partner user attempts internal operations | ❌ 403 Forbidden |
| **PE004** | Expired role still in JWT claims | ❌ 403 Forbidden |
| **PE005** | Role inheritance bypassing direct check | ❌ 403 Forbidden |

### **Token Security Tests**

| Test ID | Scenario | Expected Result |
|---------|----------|-----------------|
| **TS001** | Expired JWT token usage | ❌ 401 Unauthorized |
| **TS002** | Modified JWT signature | ❌ 401 Unauthorized |
| **TS003** | JWT with invalid tenant claim | ❌ 401 Unauthorized |
| **TS004** | Replay attack with old token | ❌ 401 Unauthorized |
| **TS005** | Service token used for user operations | ❌ 403 Forbidden |

---

## 📊 **PERMISSION MATRIX TESTS**

### **Role-Permission Validation Matrix**

```javascript
const ROLE_PERMISSION_TESTS = [
  // Super Admin Tests
  {
    role: 'super_admin',
    tenant: 'any',
    permissions: ['system:admin', 'org:admin', 'assessment:all'],
    expectedResult: 'ALLOW'
  },

  // Organization Admin Tests
  {
    role: 'org_admin',
    tenant: 'tenant_a',
    permissions: ['org:admin', 'assessment:all', 'user:manage'],
    expectedResult: 'ALLOW'
  },
  {
    role: 'org_admin',
    tenant: 'tenant_b',
    permissions: ['org:admin'],
    expectedResult: 'DENY' // Wrong tenant
  },

  // Project Member Tests
  {
    role: 'project_member',
    tenant: 'tenant_a',
    permissions: ['assessment:read', 'assessment:write'],
    expectedResult: 'ALLOW'
  },
  {
    role: 'project_member',
    tenant: 'tenant_a',
    permissions: ['assessment:delete', 'user:manage'],
    expectedResult: 'DENY'
  },

  // Partner Tests
  {
    role: 'partner_user',
    tenant: 'partner_tenant',
    permissions: ['assessment:read', 'document:shared:read'],
    expectedResult: 'ALLOW'
  },
  {
    role: 'partner_user',
    tenant: 'partner_tenant',
    permissions: ['assessment:write', 'user:read'],
    expectedResult: 'DENY'
  }
];
```

---

## 🚀 **PERFORMANCE TEST SCENARIOS**

### **Load Test Specifications**

| Test Type | Users | Duration | Success Rate | Avg Response |
|-----------|-------|----------|--------------|--------------|
| **Permission Check** | 1000 | 5 min | >99% | <100ms |
| **Authentication** | 500 | 10 min | >99.5% | <200ms |
| **Cross-Service** | 200 | 15 min | >99% | <500ms |
| **Database RLS** | 1000 | 10 min | >99% | <50ms |

### **Stress Test Scenarios**

```javascript
const STRESS_TESTS = [
  {
    name: 'Concurrent Authentication',
    description: 'Multiple users logging in simultaneously',
    users: 2000,
    rampUp: '2 minutes',
    duration: '10 minutes',
    assertions: [
      'response_time < 500ms',
      'success_rate > 95%',
      'no_cross_tenant_data'
    ]
  },

  {
    name: 'Permission Check Storm',
    description: 'Rapid permission checks across tenants',
    requests: 10000,
    concurrency: 100,
    assertions: [
      'permission_accuracy = 100%',
      'avg_response_time < 50ms',
      'cache_hit_rate > 80%'
    ]
  }
];
```

---

## 🔧 **TEST IMPLEMENTATION**

### **Test Environment Setup**

```javascript
// Test Database Configuration
const testConfig = {
  database: {
    host: 'localhost',
    port: 5432,
    database: 'assessment_grc_test',
    username: 'test_user',
    password: 'test_pass'
  },

  tenants: [
    {
      id: 'tenant-a-uuid',
      code: 'TESTA',
      name: 'Test Organization A'
    },
    {
      id: 'tenant-b-uuid',
      code: 'TESTB',
      name: 'Test Organization B'
    }
  ],

  users: [
    {
      id: 'admin-a-uuid',
      email: 'admin@testa.com',
      tenantId: 'tenant-a-uuid',
      roles: ['org_admin']
    },
    {
      id: 'member-a-uuid',
      email: 'member@testa.com',
      tenantId: 'tenant-a-uuid',
      roles: ['project_member']
    },
    {
      id: 'admin-b-uuid',
      email: 'admin@testb.com',
      tenantId: 'tenant-b-uuid',
      roles: ['org_admin']
    }
  ]
};
```

### **Test Fixtures**

```javascript
class TestFixtures {
  async setupTenants() {
    // Create test tenants
    await db.query(`
      INSERT INTO tenants (id, name, tenant_code, created_at)
      VALUES
        ('tenant-a-uuid', 'Test Org A', 'TESTA', NOW()),
        ('tenant-b-uuid', 'Test Org B', 'TESTB', NOW())
    `);
  }

  async setupUsers() {
    // Create test users with roles
    const users = testConfig.users;
    for (const user of users) {
      await db.query(`
        INSERT INTO users (id, email, tenant_id, role, status)
        VALUES ($1, $2, $3, $4, 'active')
      `, [user.id, user.email, user.tenantId, user.roles[0]]);
    }
  }

  async setupTestData() {
    // Create tenant-specific test data
    await db.query(`
      INSERT INTO assessments (id, tenant_id, name, status)
      VALUES
        ('assess-a1-uuid', 'tenant-a-uuid', 'Assessment A1', 'active'),
        ('assess-a2-uuid', 'tenant-a-uuid', 'Assessment A2', 'draft'),
        ('assess-b1-uuid', 'tenant-b-uuid', 'Assessment B1', 'active')
    `);
  }

  async cleanup() {
    // Clean up test data
    await db.query('DELETE FROM assessments WHERE tenant_id IN ($1, $2)',
      ['tenant-a-uuid', 'tenant-b-uuid']);
    await db.query('DELETE FROM users WHERE tenant_id IN ($1, $2)',
      ['tenant-a-uuid', 'tenant-b-uuid']);
    await db.query('DELETE FROM tenants WHERE id IN ($1, $2)',
      ['tenant-a-uuid', 'tenant-b-uuid']);
  }
}
```

---

## 🧪 **AUTOMATED TEST SUITE**

### **Security Test Cases**

```javascript
describe('Multi-Tenant Security Tests', () => {

  describe('Tenant Isolation', () => {
    it('should prevent cross-tenant data access', async () => {
      // Setup
      const userA = await createTestJWT('admin-a-uuid', 'tenant-a-uuid');
      const userB = await createTestJWT('admin-b-uuid', 'tenant-b-uuid');

      // Test: User A tries to access Tenant B assessments
      const response = await request(app)
        .get('/api/assessments')
        .set('Authorization', `Bearer ${userA}`)
        .set('X-Tenant-ID', 'tenant-b-uuid'); // Malicious header

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('tenant_override_forbidden');
    });

    it('should enforce RLS at database level', async () => {
      // Setup: Direct database query with wrong tenant context
      await db.query('SET rls.tenant_id = $1', ['tenant-a-uuid']);

      // Test: Query should only return Tenant A data
      const result = await db.query('SELECT * FROM assessments');

      // Assert
      expect(result.rows).toHaveLength(2);
      expect(result.rows.every(row => row.tenant_id === 'tenant-a-uuid')).toBe(true);
    });
  });

  describe('Permission Enforcement', () => {
    it('should enforce role-based permissions', async () => {
      // Setup
      const memberToken = await createTestJWT('member-a-uuid', 'tenant-a-uuid', ['project_member']);

      // Test: Member tries admin operation
      const response = await request(app)
        .delete('/api/assessments/assess-a1-uuid')
        .set('Authorization', `Bearer ${memberToken}`);

      // Assert
      expect(response.status).toBe(403);
      expect(response.body.error).toBe('permission_denied');
      expect(response.body.details.requiredPermission).toBe('assessment:delete');
    });

    it('should validate JWT token integrity', async () => {
      // Setup: Create token with modified payload
      const validToken = await createTestJWT('admin-a-uuid', 'tenant-a-uuid');
      const [header, payload, signature] = validToken.split('.');
      const modifiedPayload = Buffer.from(
        JSON.stringify({...JSON.parse(atob(payload)), tenantId: 'tenant-b-uuid'})
      ).toString('base64');
      const maliciousToken = `${header}.${modifiedPayload}.${signature}`;

      // Test
      const response = await request(app)
        .get('/api/assessments')
        .set('Authorization', `Bearer ${maliciousToken}`);

      // Assert
      expect(response.status).toBe(401);
      expect(response.body.error).toBe('invalid_token');
    });
  });
});
```

### **Integration Test Cases**

```javascript
describe('Multi-Service Integration Tests', () => {

  describe('BFF Service Routing', () => {
    it('should route with tenant context to all services', async () => {
      // Setup
      const token = await createTestJWT('admin-a-uuid', 'tenant-a-uuid');

      // Test: BFF routes to each service
      const services = [
        '/api/assessments',      // GRC API
        '/api/documents',        // Document Service
        '/api/partners',         // Partner Service
        '/api/notifications'     // Notification Service
      ];

      for (const endpoint of services) {
        const response = await request(bffApp)
          .get(endpoint)
          .set('Authorization', `Bearer ${token}`);

        // Assert: Each service receives tenant context
        expect(response.status).not.toBe(500);
        // Verify tenant was injected in downstream request
      }
    });

    it('should handle service authentication failures gracefully', async () => {
      // Test: Invalid service token
      const response = await request(bffApp)
        .get('/api/internal/health')
        .set('Authorization', 'Bearer invalid-service-token');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Cross-Tenant Collaboration', () => {
    it('should allow authorized partner access', async () => {
      // Setup: Create partner relationship
      await createPartnerRelationship('tenant-a-uuid', 'tenant-b-uuid', 'assessments');
      const partnerToken = await createTestJWT('partner-user-uuid', 'tenant-b-uuid', ['partner_user']);

      // Test: Partner accesses shared assessment
      const response = await request(app)
        .get('/api/partners/tenant-a-uuid/assessments')
        .set('Authorization', `Bearer ${partnerToken}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.data).toBeArray();
    });

    it('should deny unauthorized partner access', async () => {
      // Test: Partner tries to access non-shared resource
      const partnerToken = await createTestJWT('partner-user-uuid', 'tenant-b-uuid', ['partner_user']);

      const response = await request(app)
        .get('/api/partners/tenant-a-uuid/users')
        .set('Authorization', `Bearer ${partnerToken}`);

      expect(response.status).toBe(403);
    });
  });
});
```

---

## 📈 **PERFORMANCE TESTING**

### **Load Testing Script**

```javascript
// k6 Load Testing Script
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '2m', target: 100 },  // Ramp up
    { duration: '5m', target: 200 },  // Stay at 200 users
    { duration: '2m', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests under 500ms
    errors: ['rate<0.01'],            // Error rate under 1%
  },
};

export default function() {
  // Simulate different tenant users
  const tenants = ['tenant-a-uuid', 'tenant-b-uuid'];
  const tenant = tenants[Math.floor(Math.random() * tenants.length)];

  const token = generateTestToken(tenant);

  const params = {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };

  // Test permission-heavy endpoints
  const endpoints = [
    '/api/assessments',
    '/api/documents',
    '/api/users',
    '/api/organizations'
  ];

  endpoints.forEach(endpoint => {
    const response = http.get(`${__ENV.BASE_URL}${endpoint}`, params);

    const success = check(response, {
      'status is 200 or 403': (r) => r.status === 200 || r.status === 403,
      'response time < 500ms': (r) => r.timings.duration < 500,
      'tenant isolation maintained': (r) => {
        if (r.status === 200) {
          const data = JSON.parse(r.body);
          return data.every(item => item.tenant_id === tenant);
        }
        return true;
      }
    });

    if (!success) {
      errorRate.add(1);
    }
  });

  sleep(1);
}

function generateTestToken(tenantId) {
  // Generate JWT token for load testing
  const payload = {
    userId: `user-${tenantId}`,
    tenantId: tenantId,
    roles: ['project_member'],
    iat: Date.now() / 1000,
    exp: (Date.now() / 1000) + 3600
  };

  return jwt.sign(payload, 'test-secret');
}
```

---

## 🔍 **AUDIT & COMPLIANCE TESTING**

### **Audit Trail Validation**

```javascript
describe('Audit Trail Tests', () => {
  it('should log all permission checks', async () => {
    // Setup
    const token = await createTestJWT('admin-a-uuid', 'tenant-a-uuid');

    // Test: Perform various operations
    await request(app)
      .get('/api/assessments')
      .set('Authorization', `Bearer ${token}`);

    await request(app)
      .post('/api/assessments')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Test Assessment' });

    // Assert: Check audit logs
    const auditLogs = await db.query(`
      SELECT * FROM audit_logs
      WHERE user_id = 'admin-a-uuid'
      AND tenant_id = 'tenant-a-uuid'
      AND created_at > NOW() - INTERVAL '1 minute'
    `);

    expect(auditLogs.rows).toHaveLength(2);
    expect(auditLogs.rows[0]).toMatchObject({
      action: 'permission_check',
      resource: 'assessment:read',
      granted: true
    });
  });

  it('should track failed authorization attempts', async () => {
    // Test: Unauthorized access attempt
    const memberToken = await createTestJWT('member-a-uuid', 'tenant-a-uuid', ['project_member']);

    await request(app)
      .delete('/api/users/other-user-uuid')
      .set('Authorization', `Bearer ${memberToken}`);

    // Assert: Security event logged
    const securityLogs = await db.query(`
      SELECT * FROM security_events
      WHERE user_id = 'member-a-uuid'
      AND event_type = 'unauthorized_access_attempt'
    `);

    expect(securityLogs.rows).toHaveLength(1);
    expect(securityLogs.rows[0].details).toContain('user:delete');
  });
});
```

---

## 🚀 **TEST EXECUTION PLAN**

### **Test Phases**

| Phase | Duration | Focus | Success Criteria |
|-------|----------|-------|------------------|
| **Unit Testing** | 2 days | Individual components | 100% code coverage |
| **Integration Testing** | 3 days | Service interactions | All flows working |
| **Security Testing** | 2 days | Penetration testing | Zero security failures |
| **Performance Testing** | 2 days | Load and stress | Meet SLA requirements |
| **E2E Testing** | 1 day | User workflows | Complete scenarios |

### **Test Automation Pipeline**

```yaml
# GitHub Actions Workflow
name: Multi-Tenant RBAC Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  security-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_DB: assessment_grc_test
          POSTGRES_PASSWORD: test

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run database migrations
        run: npm run migrate:test

      - name: Run security tests
        run: npm run test:security

      - name: Run integration tests
        run: npm run test:integration

      - name: Run performance tests
        run: npm run test:performance

      - name: Generate security report
        run: npm run security:report

      - name: Upload results
        uses: actions/upload-artifact@v3
        with:
          name: test-results
          path: test-results/
```

---

## ✅ **SUCCESS CRITERIA**

### **Security Requirements**
- ✅ Zero cross-tenant data leakage
- ✅ 100% permission enforcement accuracy
- ✅ All authorization failures properly logged
- ✅ JWT token integrity maintained
- ✅ Service-to-service authentication secure

### **Performance Requirements**
- ✅ Permission checks < 100ms average
- ✅ Authentication < 200ms average
- ✅ Support 1000+ concurrent users
- ✅ 99.9% uptime under load
- ✅ Cache hit rate > 80%

### **Compliance Requirements**
- ✅ Complete audit trail
- ✅ GDPR data isolation compliance
- ✅ SOC 2 Type II security controls
- ✅ Penetration testing passed
- ✅ Code security scan clean

---

**Test Strategy Status:** ✅ Complete
**Next Step:** Implement automated test suite
**Review Required:** Security team validation
