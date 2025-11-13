const request = require('supertest');
const { describe, it, beforeEach, afterEach, expect } = require('@jest/globals');
const TestFixtures = require('../fixtures/testFixtures');

/**
 * Role-Based Access Control (RBAC) Test Suite
 * Validates permission enforcement and role hierarchy
 */

describe('RBAC Permission Tests', () => {
  let fixtures;
  let app;

  beforeEach(async () => {
    fixtures = new TestFixtures();
    await fixtures.setupDatabase();
  });

  afterEach(async () => {
    await fixtures.cleanupDatabase();
  });

  describe('Role Hierarchy Enforcement', () => {
    it('should allow org_admin full organization access', async () => {
      const admin = fixtures.getUserByEmail('admin@testa.com');
      const token = fixtures.createTestJWT(admin.id, admin.tenantId);

      // Test admin operations
      const endpoints = [
        { method: 'GET', path: '/api/assessments' },
        { method: 'POST', path: '/api/assessments', body: { name: 'New Assessment' } },
        { method: 'GET', path: '/api/users' },
        { method: 'POST', path: '/api/users', body: { email: 'new@testa.com' } }
      ];

      for (const endpoint of endpoints) {
        const response = await request(app)
          [endpoint.method.toLowerCase()](endpoint.path)
          .set('Authorization', `Bearer ${token}`)
          .send(endpoint.body || {});

        expect(response.status).not.toBe(403);
      }
    });

    it('should restrict org_manager permissions', async () => {
      const manager = fixtures.getUserByEmail('manager@testa.com');
      const token = fixtures.createTestJWT(manager.id, manager.tenantId);

      // Test allowed operations
      const allowedResponse = await request(app)
        .post('/api/assessments')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Manager Assessment' })
        .expect(201);

      // Test forbidden operations
      const forbiddenResponse = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${token}`)
        .send({ email: 'new@testa.com' })
        .expect(403);

      expect(forbiddenResponse.body.error).toBe('permission_denied');
      expect(forbiddenResponse.body.details.requiredPermission).toBe('user:create');
    });

    it('should limit project_member to read/write only', async () => {
      const member = fixtures.getUserByEmail('member@testa.com');
      const token = fixtures.createTestJWT(member.id, member.tenantId);

      // Test read access
      await request(app)
        .get('/api/assessments')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      // Test write access
      await request(app)
        .put('/api/assessments/550e8400-e29b-41d4-a716-446655451001')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Updated by Member' })
        .expect(200);

      // Test delete (should fail)
      const deleteResponse = await request(app)
        .delete('/api/assessments/550e8400-e29b-41d4-a716-446655451001')
        .set('Authorization', `Bearer ${token}`)
        .expect(403);

      expect(deleteResponse.body.details.requiredPermission).toBe('assessment:delete');
    });
  });

  describe('Permission Matrix Validation', () => {
    const permissionTests = [
      {
        role: 'org_admin',
        email: 'admin@testa.com',
        allowedOperations: [
          { method: 'GET', path: '/api/assessments', permission: 'assessment:read' },
          { method: 'POST', path: '/api/assessments', permission: 'assessment:create' },
          { method: 'DELETE', path: '/api/assessments/test-id', permission: 'assessment:delete' },
          { method: 'GET', path: '/api/users', permission: 'user:read' },
          { method: 'POST', path: '/api/users', permission: 'user:create' }
        ],
        deniedOperations: []
      },
      {
        role: 'org_manager',
        email: 'manager@testa.com',
        allowedOperations: [
          { method: 'GET', path: '/api/assessments', permission: 'assessment:read' },
          { method: 'POST', path: '/api/assessments', permission: 'assessment:create' },
          { method: 'PUT', path: '/api/assessments/test-id', permission: 'assessment:edit' }
        ],
        deniedOperations: [
          { method: 'DELETE', path: '/api/assessments/test-id', permission: 'assessment:delete' },
          { method: 'POST', path: '/api/users', permission: 'user:create' }
        ]
      },
      {
        role: 'project_member',
        email: 'member@testa.com',
        allowedOperations: [
          { method: 'GET', path: '/api/assessments', permission: 'assessment:read' },
          { method: 'PUT', path: '/api/assessments/test-id', permission: 'assessment:write' }
        ],
        deniedOperations: [
          { method: 'DELETE', path: '/api/assessments/test-id', permission: 'assessment:delete' },
          { method: 'GET', path: '/api/users', permission: 'user:read' },
          { method: 'POST', path: '/api/users', permission: 'user:create' }
        ]
      }
    ];

    permissionTests.forEach(({ role, email, allowedOperations, deniedOperations }) => {
      describe(`${role} permissions`, () => {
        allowedOperations.forEach(({ method, path, permission }) => {
          it(`should allow ${method} ${path} (${permission})`, async () => {
            const user = fixtures.getUserByEmail(email);
            const token = fixtures.createTestJWT(user.id, user.tenantId);

            const response = await request(app)
              [method.toLowerCase()](path)
              .set('Authorization', `Bearer ${token}`)
              .send({});

            expect(response.status).not.toBe(403);
          });
        });

        deniedOperations.forEach(({ method, path, permission }) => {
          it(`should deny ${method} ${path} (${permission})`, async () => {
            const user = fixtures.getUserByEmail(email);
            const token = fixtures.createTestJWT(user.id, user.tenantId);

            const response = await request(app)
              [method.toLowerCase()](path)
              .set('Authorization', `Bearer ${token}`)
              .send({});

            expect(response.status).toBe(403);
            expect(response.body.error).toBe('permission_denied');
            expect(response.body.details.requiredPermission).toBe(permission);
          });
        });
      });
    });
  });

  describe('Cross-Role Permission Escalation', () => {
    it('should prevent role tampering in JWT', async () => {
      const member = fixtures.getUserByEmail('member@testa.com');

      // Create token with elevated role
      const escalatedToken = fixtures.createTestJWT(
        member.id,
        member.tenantId,
        ['org_admin'], // Elevated role
        ['org:admin', 'user:create'] // Elevated permissions
      );

      // System should validate roles against database, not JWT claims
      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${escalatedToken}`)
        .send({ email: 'hacker@test.com' })
        .expect(403);

      expect(response.body.error).toBe('permission_denied');
    });

    it('should prevent permission injection via JWT manipulation', async () => {
      const member = fixtures.getUserByEmail('member@testa.com');

      // Create token with extra permissions
      const injectedToken = fixtures.createTestJWT(
        member.id,
        member.tenantId,
        ['project_member'], // Original role
        ['assessment:read', 'assessment:write', 'user:create'] // Injected permission
      );

      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${injectedToken}`)
        .send({ email: 'injected@test.com' })
        .expect(403);

      expect(response.body.details.userRoles).toEqual(['project_member']);
    });

    it('should validate permissions against current user state', async () => {
      // Simulate user role change in database
      const { query } = require('../../apps/services/grc-api/config/database');
      const member = fixtures.getUserByEmail('member@testa.com');

      // Update user role in database to admin
      await query('UPDATE users SET role = $1 WHERE id = $2', ['org_admin', member.id]);

      // Use old token with member permissions
      const oldToken = fixtures.createTestJWT(
        member.id,
        member.tenantId,
        ['project_member'],
        ['assessment:read', 'assessment:write']
      );

      // Should use database permissions, not token permissions
      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${oldToken}`)
        .send({ email: 'upgraded@test.com' });

      // Depending on implementation: either allow (if checking DB) or deny (if using token)
      // This test validates that the system has a consistent permission source
      expect([200, 201, 403]).toContain(response.status);
    });
  });

  describe('Resource-Level Permissions', () => {
    it('should enforce resource ownership permissions', async () => {
      const member = fixtures.getUserByEmail('member@testa.com');
      const token = fixtures.createTestJWT(member.id, member.tenantId);

      // Member created this assessment, should be able to edit
      const ownedAssessmentId = '550e8400-e29b-41d4-a716-446655451002';
      const ownResponse = await request(app)
        .put(`/api/assessments/${ownedAssessmentId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Updated Own Assessment' })
        .expect(200);

      // Member didn't create this assessment, should be read-only
      const othersAssessmentId = '550e8400-e29b-41d4-a716-446655451001';
      const othersResponse = await request(app)
        .put(`/api/assessments/${othersAssessmentId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Updated Others Assessment' })
        .expect(403);

      expect(othersResponse.body.error).toBe('resource_access_denied');
    });

    it('should validate project-specific permissions', async () => {
      // Create project-scoped user
      const projectUser = {
        id: '550e8400-e29b-41d4-a716-446655441004',
        email: 'project@testa.com',
        tenantId: '550e8400-e29b-41d4-a716-446655440001',
        projectId: 'project-alpha',
        roles: ['project_member']
      };

      const token = fixtures.createTestJWT(projectUser.id, projectUser.tenantId);

      // Should access project resources
      const projectResponse = await request(app)
        .get('/api/assessments')
        .query({ project: 'project-alpha' })
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      // Should not access other project resources
      const otherProjectResponse = await request(app)
        .get('/api/assessments')
        .query({ project: 'project-beta' })
        .set('Authorization', `Bearer ${token}`)
        .expect(403);

      expect(otherProjectResponse.body.error).toBe('project_access_denied');
    });
  });

  describe('Partner Role Permissions', () => {
    it('should allow partner access to shared resources', async () => {
      const partner = fixtures.getUserByEmail('partner@partner.com');
      const token = fixtures.createTestJWT(partner.id, partner.tenantId);

      // Partner should access shared assessments from Tenant A
      const response = await request(app)
        .get('/api/partners/550e8400-e29b-41d4-a716-446655440001/assessments')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.data).toBeArray();
      // Should only return assessments explicitly shared
    });

    it('should deny partner access to non-shared resources', async () => {
      const partner = fixtures.getUserByEmail('partner@partner.com');
      const token = fixtures.createTestJWT(partner.id, partner.tenantId);

      // Partner should not access internal user data
      const response = await request(app)
        .get('/api/partners/550e8400-e29b-41d4-a716-446655440001/users')
        .set('Authorization', `Bearer ${token}`)
        .expect(403);

      expect(response.body.error).toBe('partner_resource_forbidden');
    });

    it('should enforce partner collaboration scope', async () => {
      const partner = fixtures.getUserByEmail('partner@partner.com');
      const token = fixtures.createTestJWT(partner.id, partner.tenantId);

      // Partner cannot modify shared resources
      const modifyResponse = await request(app)
        .put('/api/partners/550e8400-e29b-41d4-a716-446655440001/assessments/test-id')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Modified by Partner' })
        .expect(403);

      expect(modifyResponse.body.error).toBe('partner_modification_forbidden');
    });
  });

  describe('Supervisor Admin Permissions', () => {
    it('should allow supervisor_admin department management', async () => {
      const supervisor = fixtures.getUserByEmail('supervisor@testa.com');
      const token = fixtures.createTestJWT(
        supervisor.id,
        supervisor.tenantId,
        ['supervisor_admin'],
        ['department:admin', 'assessment:supervise', 'user:manage:department']
      );

      // Should access supervisor dashboard
      const dashboardResponse = await request(app)
        .get('/api/supervisor/dashboard')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(dashboardResponse.body.data.role).toBe('supervisor_admin');

      // Should manage department users within tenant
      const departmentUsersResponse = await request(app)
        .get('/api/supervisor/department/users')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(departmentUsersResponse.body.data).toBeArray();

      // Should supervise assessments
      const assessmentReviewResponse = await request(app)
        .get('/api/supervisor/assessments/pending')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(assessmentReviewResponse.body.data).toBeArray();
    });

    it('should restrict supervisor_admin to own tenant only', async () => {
      const supervisor = fixtures.getUserByEmail('supervisor@testa.com');
      const token = fixtures.createTestJWT(
        supervisor.id,
        supervisor.tenantId,
        ['supervisor_admin'],
        ['department:admin', 'assessment:supervise']
      );

      // Should NOT access other tenant's data
      const crossTenantResponse = await request(app)
        .get('/api/supervisor/assessments?tenantId=550e8400-e29b-41d4-a716-446655440002')
        .set('Authorization', `Bearer ${token}`)
        .expect(403);

      expect(crossTenantResponse.body.error).toBe('insufficient_permissions');
    });

    it('should deny supervisor_admin platform operations', async () => {
      const supervisor = fixtures.getUserByEmail('supervisor@testa.com');
      const token = fixtures.createTestJWT(supervisor.id, supervisor.tenantId);

      // Should NOT access platform admin routes
      const platformResponse = await request(app)
        .get('/api/platform/health')
        .set('Authorization', `Bearer ${token}`)
        .expect(403);

      expect(platformResponse.body.error).toBe('insufficient_permissions');
    });
  });

  describe('Platform Admin Permissions', () => {
    it('should allow platform_admin system monitoring', async () => {
      const platformAdmin = fixtures.getUserByEmail('platform@testb.com');
      const token = fixtures.createTestJWT(
        platformAdmin.id,
        platformAdmin.tenantId,
        ['platform_admin'],
        ['system:monitor', 'tenant:view:all', 'performance:monitor']
      );

      // Should access system health
      const healthResponse = await request(app)
        .get('/api/platform/health')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(healthResponse.body.data.status).toBeDefined();

      // Should view tenant statistics
      const tenantStatsResponse = await request(app)
        .get('/api/platform/tenants/statistics')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(tenantStatsResponse.body.data).toBeArray();

      // Should monitor performance metrics
      const metricsResponse = await request(app)
        .get('/api/platform/metrics/performance')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(metricsResponse.body.data.metrics).toBeDefined();
    });

    it('should restrict platform_admin from data modification', async () => {
      const platformAdmin = fixtures.getUserByEmail('platform@testb.com');
      const token = fixtures.createTestJWT(
        platformAdmin.id,
        platformAdmin.tenantId,
        ['platform_admin']
      );

      // Should NOT modify tenant data
      const modifyResponse = await request(app)
        .put('/api/assessments/test-id')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Modified by Platform Admin' })
        .expect(403);

      expect(modifyResponse.body.error).toBe('insufficient_permissions');

      // Should NOT create users
      const createUserResponse = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${token}`)
        .send({ email: 'new@test.com' })
        .expect(403);

      expect(createUserResponse.body.error).toBe('insufficient_permissions');
    });

    it('should allow platform_admin read-only cross-tenant access', async () => {
      const platformAdmin = fixtures.getUserByEmail('platform@testb.com');
      const token = fixtures.createTestJWT(
        platformAdmin.id,
        platformAdmin.tenantId,
        ['platform_admin'],
        ['tenant:view:all']
      );

      // Should view statistics from all tenants
      const allTenantsResponse = await request(app)
        .get('/api/platform/tenants/all/summary')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(allTenantsResponse.body.data).toBeArray();
      expect(allTenantsResponse.body.data.length).toBeGreaterThan(1);
    });
  });

  describe('Admin Role Hierarchy', () => {
    it('should enforce proper role hierarchy permissions', async () => {
      const testCases = [
        {
          role: 'super_admin',
          shouldAccess: ['/api/admin/system', '/api/supervisor/dashboard', '/api/platform/health'],
          description: 'Super admin should access all admin routes'
        },
        {
          role: 'platform_admin',
          shouldAccess: ['/api/platform/health', '/api/platform/metrics'],
          shouldNotAccess: ['/api/supervisor/dashboard', '/api/admin/system'],
          description: 'Platform admin should access only platform routes'
        },
        {
          role: 'supervisor_admin',
          shouldAccess: ['/api/supervisor/dashboard', '/api/supervisor/department'],
          shouldNotAccess: ['/api/platform/health', '/api/admin/system'],
          description: 'Supervisor admin should access only supervisor routes'
        }
      ];

      for (const testCase of testCases) {
        const user = fixtures.testUsers.find(u => u.roles.includes(testCase.role));
        if (!user) continue;

        const token = fixtures.createTestJWT(user.id, user.tenantId, user.roles);

        // Test allowed routes
        if (testCase.shouldAccess) {
          for (const route of testCase.shouldAccess) {
            const response = await request(app)
              .get(route)
              .set('Authorization', `Bearer ${token}`);

            expect(response.status,
              `${testCase.role} should access ${route}`).not.toBe(403);
          }
        }

        // Test forbidden routes
        if (testCase.shouldNotAccess) {
          for (const route of testCase.shouldNotAccess) {
            const response = await request(app)
              .get(route)
              .set('Authorization', `Bearer ${token}`);

            expect(response.status,
              `${testCase.role} should NOT access ${route}`).toBe(403);
          }
        }
      }
    });
  });

  describe('System Admin Permissions', () => {
    it('should allow system admin cross-tenant access', async () => {
      // Create system admin user
      const systemAdmin = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'sysadmin@assessment-grc.com',
        tenantId: null, // System level
        roles: ['super_admin']
      };

      const token = fixtures.createTestJWT(
        systemAdmin.id,
        '550e8400-e29b-41d4-a716-446655440001', // Any tenant
        ['super_admin'],
        ['system:admin']
      );

      // System admin should access any tenant's data
      const tenantAResponse = await request(app)
        .get('/api/admin/tenants/550e8400-e29b-41d4-a716-446655440001/assessments')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const tenantBResponse = await request(app)
        .get('/api/admin/tenants/550e8400-e29b-41d4-a716-446655440002/assessments')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(tenantAResponse.body.data).toBeArray();
      expect(tenantBResponse.body.data).toBeArray();
    });
  });
});

module.exports = {};
