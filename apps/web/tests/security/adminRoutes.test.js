const request = require('supertest');
const { describe, it, beforeEach, afterEach, expect } = require('@jest/globals');
const TestFixtures = require('../fixtures/testFixtures');

/**
 * Admin Routes Security Test Suite
 * Validates admin route functionality and security enforcement
 */

describe('Admin Routes Security Tests', () => {
  let fixtures;
  let app;

  beforeEach(async () => {
    fixtures = new TestFixtures();
    await fixtures.setupDatabase();
  });

  afterEach(async () => {
    await fixtures.cleanupDatabase();
  });

  describe('Supervisor Admin Routes', () => {
    it('should access supervisor dashboard with proper authentication', async () => {
      const token = fixtures.createSupervisorAdminToken('550e8400-e29b-41d4-a716-446655440001');

      const response = await request(app)
        .get('/api/supervisor/dashboard')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.role).toBe('supervisor_admin');
      expect(response.body.data.tenantId).toBe('550e8400-e29b-41d4-a716-446655440001');
    });

    it('should manage department users', async () => {
      const token = fixtures.createSupervisorAdminToken('550e8400-e29b-41d4-a716-446655440001');

      // Get department users
      const getUsersResponse = await request(app)
        .get('/api/supervisor/department/users')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(getUsersResponse.body.data).toBeArray();

      // Create department user
      const createUserResponse = await request(app)
        .post('/api/supervisor/department/users')
        .set('Authorization', `Bearer ${token}`)
        .send({
          email: 'dept-user@testa.com',
          firstName: 'Department',
          lastName: 'User',
          departmentId: 'dept-001'
        })
        .expect(201);

      expect(createUserResponse.body.data.user.email).toBe('dept-user@testa.com');
      expect(createUserResponse.body.data.user.departmentId).toBe('dept-001');
    });

    it('should supervise assessment approvals', async () => {
      const token = fixtures.createSupervisorAdminToken('550e8400-e29b-41d4-a716-446655440001');

      // Get pending assessments
      const pendingResponse = await request(app)
        .get('/api/supervisor/assessments/pending')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(pendingResponse.body.data).toBeArray();

      // Approve an assessment
      const assessmentId = '550e8400-e29b-41d4-a716-446655451001';
      const approveResponse = await request(app)
        .post(`/api/supervisor/assessments/${assessmentId}/approve`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          comments: 'Approved by supervisor',
          conditions: []
        })
        .expect(200);

      expect(approveResponse.body.data.status).toBe('supervisor_approved');
      expect(approveResponse.body.data.approvedBy).toBeDefined();
    });

    it('should reject cross-tenant access', async () => {
      const token = fixtures.createSupervisorAdminToken('550e8400-e29b-41d4-a716-446655440001');

      // Try to access another tenant's data
      const crossTenantResponse = await request(app)
        .get('/api/supervisor/assessments?tenantId=550e8400-e29b-41d4-a716-446655440002')
        .set('Authorization', `Bearer ${token}`)
        .expect(403);

      expect(crossTenantResponse.body.error).toBe('insufficient_permissions');
    });
  });

  describe('Platform Admin Routes', () => {
    it('should access platform health monitoring', async () => {
      const token = fixtures.createPlatformAdminToken('550e8400-e29b-41d4-a716-446655440002');

      const healthResponse = await request(app)
        .get('/api/platform/health')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(healthResponse.body.data.status).toBe('healthy');
      expect(healthResponse.body.data.services).toBeObject();
      expect(healthResponse.body.data.uptime).toBeNumber();
    });

    it('should monitor system performance', async () => {
      const token = fixtures.createPlatformAdminToken('550e8400-e29b-41d4-a716-446655440002');

      const metricsResponse = await request(app)
        .get('/api/platform/metrics/performance')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(metricsResponse.body.data.metrics).toBeObject();
      expect(metricsResponse.body.data.metrics.cpu).toBeDefined();
      expect(metricsResponse.body.data.metrics.memory).toBeDefined();
      expect(metricsResponse.body.data.metrics.database).toBeDefined();
    });

    it('should view tenant statistics', async () => {
      const token = fixtures.createPlatformAdminToken('550e8400-e29b-41d4-a716-446655440002');

      const statsResponse = await request(app)
        .get('/api/platform/tenants/statistics')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(statsResponse.body.data).toBeArray();
      expect(statsResponse.body.data[0]).toMatchObject({
        tenantId: expect.any(String),
        userCount: expect.any(Number),
        assessmentCount: expect.any(Number),
        storageUsed: expect.any(Number)
      });
    });

    it('should manage security events', async () => {
      const token = fixtures.createPlatformAdminToken('550e8400-e29b-41d4-a716-446655440002');

      // Get security events
      const eventsResponse = await request(app)
        .get('/api/platform/security/events')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(eventsResponse.body.data).toBeArray();

      // Acknowledge security event
      const eventId = 'evt-001';
      const ackResponse = await request(app)
        .post(`/api/platform/security/events/${eventId}/acknowledge`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          comments: 'Event reviewed and acknowledged'
        })
        .expect(200);

      expect(ackResponse.body.data.acknowledged).toBe(true);
      expect(ackResponse.body.data.acknowledgedBy).toBeDefined();
    });

    it('should deny data modification attempts', async () => {
      const token = fixtures.createPlatformAdminToken('550e8400-e29b-41d4-a716-446655440002');

      // Try to modify assessment data
      const modifyResponse = await request(app)
        .put('/api/assessments/550e8400-e29b-41d4-a716-446655451001')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Modified by Platform Admin' })
        .expect(403);

      expect(modifyResponse.body.error).toBe('insufficient_permissions');

      // Try to create user
      const createResponse = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${token}`)
        .send({ email: 'new@test.com', firstName: 'New', lastName: 'User' })
        .expect(403);

      expect(createResponse.body.error).toBe('insufficient_permissions');
    });
  });

  describe('Admin Route Authentication', () => {
    it('should reject unauthenticated requests to admin routes', async () => {
      const adminRoutes = [
        '/api/admin/organization/settings',
        '/api/supervisor/dashboard',
        '/api/platform/health'
      ];

      for (const route of adminRoutes) {
        const response = await request(app)
          .get(route)
          .expect(401);

        expect(response.body.error).toBe('authentication_required');
      }
    });

    it('should reject invalid tokens on admin routes', async () => {
      const invalidToken = 'invalid.jwt.token';

      const response = await request(app)
        .get('/api/supervisor/dashboard')
        .set('Authorization', `Bearer ${invalidToken}`)
        .expect(401);

      expect(response.body.error).toBe('invalid_token');
    });

    it('should reject insufficient role access to admin routes', async () => {
      // Regular user trying to access admin routes
      const regularUser = fixtures.getUserByEmail('member@testa.com');
      const token = fixtures.createTestJWT(regularUser.id, regularUser.tenantId);

      const adminRoutes = [
        '/api/admin/organization/settings',
        '/api/supervisor/dashboard',
        '/api/platform/health'
      ];

      for (const route of adminRoutes) {
        const response = await request(app)
          .get(route)
          .set('Authorization', `Bearer ${token}`)
          .expect(403);

        expect(response.body.error).toBe('insufficient_permissions');
      }
    });
  });

  describe('Admin Route Authorization', () => {
    it('should enforce role-based route access', async () => {
      const testCases = [
        {
          role: 'supervisor_admin',
          allowedRoutes: ['/api/supervisor/dashboard', '/api/supervisor/department/users'],
          deniedRoutes: ['/api/platform/health', '/api/admin/system']
        },
        {
          role: 'platform_admin',
          allowedRoutes: ['/api/platform/health', '/api/platform/metrics/performance'],
          deniedRoutes: ['/api/supervisor/dashboard', '/api/admin/system']
        }
      ];

      for (const testCase of testCases) {
        const user = fixtures.testUsers.find(u => u.roles.includes(testCase.role));
        if (!user) continue;

        const token = fixtures.createTestJWT(user.id, user.tenantId, user.roles, user.permissions);

        // Test allowed routes
        for (const route of testCase.allowedRoutes) {
          const response = await request(app)
            .get(route)
            .set('Authorization', `Bearer ${token}`);

          expect(response.status,
            `${testCase.role} should access ${route}`).not.toBe(403);
        }

        // Test denied routes
        for (const route of testCase.deniedRoutes) {
          const response = await request(app)
            .get(route)
            .set('Authorization', `Bearer ${token}`);

          expect(response.status,
            `${testCase.role} should NOT access ${route}`).toBe(403);
        }
      }
    });

    it('should validate admin context in requests', async () => {
      const token = fixtures.createSupervisorAdminToken('550e8400-e29b-41d4-a716-446655440001');

      const response = await request(app)
        .get('/api/supervisor/dashboard')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      // Admin context should be injected
      expect(response.body.context).toMatchObject({
        adminRole: 'supervisor_admin',
        tenantId: '550e8400-e29b-41d4-a716-446655440001',
        permissions: expect.arrayContaining(['department:admin'])
      });
    });
  });

  describe('Admin Route Error Handling', () => {
    it('should handle service errors gracefully', async () => {
      const token = fixtures.createPlatformAdminToken('550e8400-e29b-41d4-a716-446655440002');

      // Simulate service unavailable scenario
      const response = await request(app)
        .get('/api/platform/metrics/unavailable')
        .set('Authorization', `Bearer ${token}`)
        .expect(503);

      expect(response.body.error).toBe('service_unavailable');
      expect(response.body.message).toContain('temporarily unavailable');
    });

    it('should validate admin request parameters', async () => {
      const token = fixtures.createSupervisorAdminToken('550e8400-e29b-41d4-a716-446655440001');

      // Invalid department ID
      const response = await request(app)
        .post('/api/supervisor/department/users')
        .set('Authorization', `Bearer ${token}`)
        .send({
          email: 'invalid-email',
          firstName: '',
          lastName: 'User'
        })
        .expect(400);

      expect(response.body.error).toBe('validation_failed');
      expect(response.body.details).toBeArray();
    });
  });
});

module.exports = {};
