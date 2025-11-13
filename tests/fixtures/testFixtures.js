const request = require('supertest');
const jwt = require('jsonwebtoken');
const { query } = require('../../apps/services/grc-api/config/database');

/**
 * Multi-Tenant RBAC Test Fixtures
 * Provides test data and utilities for testing tenant isolation and RBAC
 */

class TestFixtures {
  constructor() {
    this.testTenants = [
      {
        id: '550e8400-e29b-41d4-a716-446655440001',
        code: 'TESTA',
        name: 'Test Organization A'
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440002',
        code: 'TESTB',
        name: 'Test Organization B'
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440003',
        code: 'PARTNER',
        name: 'Partner Organization'
      }
    ];

    this.testUsers = [
      // Tenant A Users
      {
        id: '550e8400-e29b-41d4-a716-446655441001',
        email: 'admin@testa.com',
        firstName: 'Admin',
        lastName: 'UserA',
        tenantId: '550e8400-e29b-41d4-a716-446655440001',
        roles: ['org_admin'],
        permissions: ['org:admin', 'assessment:all', 'user:manage']
      },
      {
        id: '550e8400-e29b-41d4-a716-446655441002',
        email: 'manager@testa.com',
        firstName: 'Manager',
        lastName: 'UserA',
        tenantId: '550e8400-e29b-41d4-a716-446655440001',
        roles: ['org_manager'],
        permissions: ['assessment:create', 'assessment:edit', 'document:upload']
      },
      {
        id: '550e8400-e29b-41d4-a716-446655441003',
        email: 'member@testa.com',
        firstName: 'Member',
        lastName: 'UserA',
        tenantId: '550e8400-e29b-41d4-a716-446655440001',
        roles: ['project_member'],
        permissions: ['assessment:read', 'assessment:write']
      },

      // Tenant A Users
      {
        id: '550e8400-e29b-41d4-a716-446655441001',
        email: 'admin@testa.com',
        firstName: 'Admin',
        lastName: 'UserA',
        tenantId: '550e8400-e29b-41d4-a716-446655440001',
        roles: ['org_admin'],
        permissions: ['org:admin', 'assessment:all', 'user:manage']
      },
      {
        id: '550e8400-e29b-41d4-a716-446655441002',
        email: 'supervisor@testa.com',
        firstName: 'Supervisor',
        lastName: 'AdminA',
        tenantId: '550e8400-e29b-41d4-a716-446655440001',
        roles: ['supervisor_admin'],
        permissions: ['department:admin', 'assessment:supervise', 'user:manage:department']
      },
      {
        id: '550e8400-e29b-41d4-a716-446655441003',
        email: 'member@testa.com',
        firstName: 'Member',
        lastName: 'UserA',
        tenantId: '550e8400-e29b-41d4-a716-446655440001',
        roles: ['project_member'],
        permissions: ['assessment:read', 'assessment:write']
      },

      // Tenant B Users
      {
        id: '550e8400-e29b-41d4-a716-446655442001',
        email: 'admin@testb.com',
        firstName: 'Admin',
        lastName: 'UserB',
        tenantId: '550e8400-e29b-41d4-a716-446655440002',
        roles: ['org_admin'],
        permissions: ['org:admin', 'assessment:all', 'user:manage']
      },
      {
        id: '550e8400-e29b-41d4-a716-446655442002',
        email: 'platform@testb.com',
        firstName: 'Platform',
        lastName: 'AdminB',
        tenantId: '550e8400-e29b-41d4-a716-446655440002',
        roles: ['platform_admin'],
        permissions: ['system:monitor', 'tenant:view:all', 'performance:monitor']
      },
      {
        id: '550e8400-e29b-41d4-a716-446655442003',
        email: 'member@testb.com',
        firstName: 'Member',
        lastName: 'UserB',
        tenantId: '550e8400-e29b-41d4-a716-446655440002',
        roles: ['project_member'],
        permissions: ['assessment:read', 'assessment:write']
      },

      // Partner Users
      {
        id: '550e8400-e29b-41d4-a716-446655443001',
        email: 'partner@partner.com',
        firstName: 'Partner',
        lastName: 'User',
        tenantId: '550e8400-e29b-41d4-a716-446655440003',
        roles: ['partner_user'],
        permissions: ['assessment:read', 'document:shared:read']
      }
    ];

    this.testAssessments = [
      // Tenant A Assessments
      {
        id: '550e8400-e29b-41d4-a716-446655451001',
        tenantId: '550e8400-e29b-41d4-a716-446655440001',
        name: 'Assessment A1',
        status: 'active',
        createdBy: '550e8400-e29b-41d4-a716-446655441001'
      },
      {
        id: '550e8400-e29b-41d4-a716-446655451002',
        tenantId: '550e8400-e29b-41d4-a716-446655440001',
        name: 'Assessment A2',
        status: 'draft',
        createdBy: '550e8400-e29b-41d4-a716-446655441002'
      },

      // Tenant B Assessments
      {
        id: '550e8400-e29b-41d4-a716-446655452001',
        tenantId: '550e8400-e29b-41d4-a716-446655440002',
        name: 'Assessment B1',
        status: 'active',
        createdBy: '550e8400-e29b-41d4-a716-446655442001'
      }
    ];
  }

  /**
   * Generate test JWT token
   */
  createTestJWT(userId, tenantId, roles = [], permissions = []) {
    const user = this.testUsers.find(u => u.id === userId);
    const tenant = this.testTenants.find(t => t.id === tenantId);

    if (!user || !tenant) {
      throw new Error('Invalid user or tenant ID');
    }

    const payload = {
      userId: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,

      tenantId: tenant.id,
      tenantCode: tenant.code,
      tenantName: tenant.name,
      tenantType: 'organization',

      roles: roles.length ? roles : user.roles,
      permissions: permissions.length ? permissions : user.permissions,

      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (60 * 60), // 1 hour
      iss: 'assessment-grc-auth',
      aud: 'assessment-grc-services'
    };

    return jwt.sign(payload, process.env.JWT_SECRET || 'test-secret');
  }

  /**
   * Create service-to-service JWT token
   */
  createServiceJWT(serviceId, permissions = []) {
    const payload = {
      serviceId,
      serviceName: `${serviceId} Service`,
      serviceVersion: '1.0.0',

      scope: 'service:internal',
      permissions,
      tokenType: 'service',

      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
      iss: 'assessment-grc-auth',
      aud: 'assessment-grc-services'
    };

    return jwt.sign(payload, process.env.JWT_SECRET || 'test-secret');
  }

  /**
   * Create supervisor admin test token
   */
  createSupervisorAdminToken(tenantId) {
    const supervisor = this.testUsers.find(u =>
      u.roles.includes('supervisor_admin') && u.tenantId === tenantId
    );

    if (!supervisor) {
      throw new Error(`No supervisor admin found for tenant ${tenantId}`);
    }

    return this.createTestJWT(
      supervisor.id,
      supervisor.tenantId,
      ['supervisor_admin'],
      ['department:admin', 'assessment:supervise', 'user:manage:department']
    );
  }

  /**
   * Create platform admin test token
   */
  createPlatformAdminToken(tenantId) {
    const platformAdmin = this.testUsers.find(u =>
      u.roles.includes('platform_admin') && u.tenantId === tenantId
    );

    if (!platformAdmin) {
      throw new Error(`No platform admin found for tenant ${tenantId}`);
    }

    return this.createTestJWT(
      platformAdmin.id,
      platformAdmin.tenantId,
      ['platform_admin'],
      ['system:monitor', 'tenant:view:all', 'performance:monitor']
    );
  }

  /**
   * Create super admin test token
   */
  createSuperAdminToken() {
    return this.createTestJWT(
      '550e8400-e29b-41d4-a716-446655440000', // System admin ID
      '550e8400-e29b-41d4-a716-446655440001', // Any tenant for context
      ['super_admin'],
      ['system:admin', 'tenant:all', 'user:all', 'assessment:all', 'global:admin']
    );
  }

  /**
   * Setup test database with fixtures
   */
  async setupDatabase() {
    // Create test tenants
    for (const tenant of this.testTenants) {
      await query(`
        INSERT INTO tenants (id, name, tenant_code, subscription_tier, status, created_at)
        VALUES ($1, $2, $3, 'enterprise', 'active', NOW())
        ON CONFLICT (id) DO NOTHING
      `, [tenant.id, tenant.name, tenant.code]);
    }

    // Create test users
    for (const user of this.testUsers) {
      await query(`
        INSERT INTO users (
          id, email, first_name, last_name, tenant_id,
          role, permissions, status, created_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, 'active', NOW())
        ON CONFLICT (id) DO NOTHING
      `, [
        user.id, user.email, user.firstName, user.lastName,
        user.tenantId, user.roles[0], JSON.stringify(user.permissions)
      ]);
    }

    // Create test assessments
    for (const assessment of this.testAssessments) {
      await query(`
        INSERT INTO assessments (
          id, tenant_id, name, status, created_by, created_at
        )
        VALUES ($1, $2, $3, $4, $5, NOW())
        ON CONFLICT (id) DO NOTHING
      `, [
        assessment.id, assessment.tenantId, assessment.name,
        assessment.status, assessment.createdBy
      ]);
    }

    // Create partner relationships for testing
    await query(`
      INSERT INTO partner_collaborations (
        id, tenant_id, partner_tenant_id, collaboration_type,
        permissions, status, created_at
      )
      VALUES (
        '550e8400-e29b-41d4-a716-446655460001',
        '550e8400-e29b-41d4-a716-446655440001',
        '550e8400-e29b-41d4-a716-446655440003',
        'assessment_sharing',
        '["assessment:read", "document:shared:read"]',
        'active',
        NOW()
      )
      ON CONFLICT (id) DO NOTHING
    `);
  }

  /**
   * Clean up test data
   */
  async cleanupDatabase() {
    // Delete in reverse dependency order
    await query('DELETE FROM partner_collaborations WHERE tenant_id IN ($1, $2, $3)',
      [this.testTenants[0].id, this.testTenants[1].id, this.testTenants[2].id]);

    await query('DELETE FROM assessments WHERE tenant_id IN ($1, $2, $3)',
      [this.testTenants[0].id, this.testTenants[1].id, this.testTenants[2].id]);

    await query('DELETE FROM users WHERE tenant_id IN ($1, $2, $3)',
      [this.testTenants[0].id, this.testTenants[1].id, this.testTenants[2].id]);

    await query('DELETE FROM tenants WHERE id IN ($1, $2, $3)',
      [this.testTenants[0].id, this.testTenants[1].id, this.testTenants[2].id]);
  }

  /**
   * Get test user by email
   */
  getUserByEmail(email) {
    return this.testUsers.find(user => user.email === email);
  }

  /**
   * Get test tenant by code
   */
  getTenantByCode(code) {
    return this.testTenants.find(tenant => tenant.code === code);
  }

  /**
   * Create malicious JWT with tampered payload
   */
  createMaliciousJWT(userId, originalTenantId, targetTenantId) {
    const validToken = this.createTestJWT(userId, originalTenantId);
    const [header, payload, signature] = validToken.split('.');

    // Modify payload to target different tenant
    const decodedPayload = JSON.parse(Buffer.from(payload, 'base64').toString());
    decodedPayload.tenantId = targetTenantId;

    const modifiedPayload = Buffer.from(JSON.stringify(decodedPayload)).toString('base64');

    // Return token with modified payload but original signature (should fail validation)
    return `${header}.${modifiedPayload}.${signature}`;
  }

  /**
   * Create expired JWT token
   */
  createExpiredJWT(userId, tenantId) {
    const user = this.testUsers.find(u => u.id === userId);
    const tenant = this.testTenants.find(t => t.id === tenantId);

    const payload = {
      userId: user.id,
      tenantId: tenant.id,
      roles: user.roles,
      iat: Math.floor(Date.now() / 1000) - 7200, // 2 hours ago
      exp: Math.floor(Date.now() / 1000) - 3600, // Expired 1 hour ago
      iss: 'assessment-grc-auth',
      aud: 'assessment-grc-services'
    };

    return jwt.sign(payload, process.env.JWT_SECRET || 'test-secret');
  }
}

module.exports = TestFixtures;
