const request = require('supertest');
const { describe, it, beforeEach, afterEach, expect } = require('@jest/globals');
const TestFixtures = require('../fixtures/testFixtures');

/**
 * Multi-Tenant Security Test Suite
 * Validates tenant isolation and cross-tenant access prevention
 */

describe('Multi-Tenant Security Tests', () => {
  let fixtures;
  let app;

  beforeEach(async () => {
    fixtures = new TestFixtures();
    await fixtures.setupDatabase();

    // Initialize test app (would import your actual app)
    // app = require('../../apps/services/grc-api/index');
  });

  afterEach(async () => {
    await fixtures.cleanupDatabase();
  });

  describe('Tenant Isolation', () => {
    it('should prevent cross-tenant data access via API', async () => {
      // Setup: User from Tenant A
      const userA = fixtures.getUserByEmail('admin@testa.com');
      const tokenA = fixtures.createTestJWT(userA.id, userA.tenantId);

      // Test: Try to access Tenant B assessments
      const response = await request(app)
        .get('/api/assessments')
        .set('Authorization', `Bearer ${tokenA}`)
        .expect(200);

      // Assert: Only Tenant A assessments returned
      expect(response.body.data).toBeArray();
      response.body.data.forEach(assessment => {
        expect(assessment.tenant_id).toBe(userA.tenantId);
      });
    });

    it('should reject client-controlled tenant headers', async () => {
      const userA = fixtures.getUserByEmail('admin@testa.com');
      const tenantB = fixtures.getTenantByCode('TESTB');
      const tokenA = fixtures.createTestJWT(userA.id, userA.tenantId);

      // Test: Try to override tenant via header
      const response = await request(app)
        .get('/api/assessments')
        .set('Authorization', `Bearer ${tokenA}`)
        .set('X-Tenant-ID', tenantB.id)
        .expect(400);

      // Assert: Tenant override forbidden
      expect(response.body.error).toBe('tenant_override_forbidden');
      expect(response.body.message).toContain('Client cannot override tenant context');
    });

    it('should enforce Row-Level Security at database level', async () => {
      // Setup: Direct database query with Tenant A context
      const tenantA = fixtures.getTenantByCode('TESTA');

      // Set RLS context for Tenant A
      const { query } = require('../../apps/services/grc-api/config/database');
      await query('SET rls.tenant_id = $1', [tenantA.id]);

      // Test: Query assessments (should only return Tenant A)
      const result = await query('SELECT * FROM assessments');

      // Assert: Only Tenant A assessments
      expect(result.rows.length).toBeGreaterThan(0);
      result.rows.forEach(row => {
        expect(row.tenant_id).toBe(tenantA.id);
      });
    });

    it('should handle cross-tenant resource references gracefully', async () => {
      const userA = fixtures.getUserByEmail('admin@testa.com');
      const tokenA = fixtures.createTestJWT(userA.id, userA.tenantId);

      // Test: Try to access assessment from Tenant B using direct ID
      const tenantBAssessmentId = '550e8400-e29b-41d4-a716-446655452001';

      const response = await request(app)
        .get(`/api/assessments/${tenantBAssessmentId}`)
        .set('Authorization', `Bearer ${tokenA}`)
        .expect(404);

      // Assert: Resource not found (due to tenant isolation)
      expect(response.body.error).toBe('resource_not_found');
    });
  });

  describe('JWT Token Security', () => {
    it('should reject tampered JWT tokens', async () => {
      const userA = fixtures.getUserByEmail('admin@testa.com');
      const tenantB = fixtures.getTenantByCode('TESTB');

      // Create malicious token with modified tenant
      const maliciousToken = fixtures.createMaliciousJWT(
        userA.id,
        userA.tenantId,
        tenantB.id
      );

      // Test: Use malicious token
      const response = await request(app)
        .get('/api/assessments')
        .set('Authorization', `Bearer ${maliciousToken}`)
        .expect(401);

      // Assert: Token validation failed
      expect(response.body.error).toBe('invalid_token');
    });

    it('should reject expired JWT tokens', async () => {
      const userA = fixtures.getUserByEmail('admin@testa.com');
      const expiredToken = fixtures.createExpiredJWT(userA.id, userA.tenantId);

      // Test: Use expired token
      const response = await request(app)
        .get('/api/assessments')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);

      // Assert: Token expired
      expect(response.body.error).toBe('token_expired');
    });

    it('should validate JWT token structure and claims', async () => {
      // Test: Malformed token
      const malformedToken = 'invalid.jwt.token';

      const response = await request(app)
        .get('/api/assessments')
        .set('Authorization', `Bearer ${malformedToken}`)
        .expect(401);

      expect(response.body.error).toBe('invalid_token');
    });

    it('should reject tokens with missing required claims', async () => {
      // Create token missing tenant claim
      const jwt = require('jsonwebtoken');
      const incompletePayload = {
        userId: '550e8400-e29b-41d4-a716-446655441001',
        // Missing tenantId, roles, etc.
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600
      };

      const incompleteToken = jwt.sign(incompletePayload, 'test-secret');

      const response = await request(app)
        .get('/api/assessments')
        .set('Authorization', `Bearer ${incompleteToken}`)
        .expect(401);

      expect(response.body.error).toBe('invalid_token_claims');
    });
  });

  describe('Cross-Tenant Attack Scenarios', () => {
    it('should prevent tenant enumeration through error messages', async () => {
      const userA = fixtures.getUserByEmail('member@testa.com');
      const tokenA = fixtures.createTestJWT(userA.id, userA.tenantId);

      // Test: Access non-existent resource
      const response = await request(app)
        .get('/api/assessments/non-existent-id')
        .set('Authorization', `Bearer ${tokenA}`)
        .expect(404);

      // Assert: Generic error message (no tenant info leaked)
      expect(response.body.message).not.toContain('tenant');
      expect(response.body.message).not.toContain('TESTA');
      expect(response.body.message).not.toContain('TESTB');
    });

    it('should prevent user enumeration across tenants', async () => {
      const userA = fixtures.getUserByEmail('admin@testa.com');
      const tokenA = fixtures.createTestJWT(userA.id, userA.tenantId);

      // Test: Try to get user from different tenant
      const userBId = '550e8400-e29b-41d4-a716-446655442001';

      const response = await request(app)
        .get(`/api/users/${userBId}`)
        .set('Authorization', `Bearer ${tokenA}`)
        .expect(404);

      expect(response.body.error).toBe('user_not_found');
    });

    it('should handle bulk operations with tenant isolation', async () => {
      const userA = fixtures.getUserByEmail('admin@testa.com');
      const tokenA = fixtures.createTestJWT(userA.id, userA.tenantId);

      // Test: Bulk update with mixed tenant IDs
      const mixedAssessmentIds = [
        '550e8400-e29b-41d4-a716-446655451001', // Tenant A
        '550e8400-e29b-41d4-a716-446655452001'  // Tenant B
      ];

      const response = await request(app)
        .patch('/api/assessments/bulk')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          assessmentIds: mixedAssessmentIds,
          updates: { status: 'completed' }
        })
        .expect(200);

      // Assert: Only Tenant A assessment updated
      expect(response.body.updated).toBe(1);
      expect(response.body.skipped).toBe(1);
    });
  });

  describe('Service-to-Service Authentication', () => {
    it('should allow valid service tokens', async () => {
      const serviceToken = fixtures.createServiceJWT('document-service', [
        'system:read', 'document:process'
      ]);

      const response = await request(app)
        .get('/api/internal/health')
        .set('Authorization', `Bearer ${serviceToken}`)
        .expect(200);

      expect(response.body.status).toBe('healthy');
    });

    it('should reject service tokens for user endpoints', async () => {
      const serviceToken = fixtures.createServiceJWT('document-service');

      const response = await request(app)
        .get('/api/assessments')
        .set('Authorization', `Bearer ${serviceToken}`)
        .expect(403);

      expect(response.body.error).toBe('service_token_not_allowed');
    });

    it('should validate service token permissions', async () => {
      const limitedServiceToken = fixtures.createServiceJWT('notification-service', [
        'notification:send' // Missing system:read
      ]);

      const response = await request(app)
        .get('/api/internal/users')
        .set('Authorization', `Bearer ${limitedServiceToken}`)
        .expect(403);

      expect(response.body.error).toBe('insufficient_service_permissions');
    });
  });

  describe('Audit and Compliance', () => {
    it('should log all authentication attempts', async () => {
      const userA = fixtures.getUserByEmail('admin@testa.com');
      const tokenA = fixtures.createTestJWT(userA.id, userA.tenantId);

      // Make authenticated request
      await request(app)
        .get('/api/assessments')
        .set('Authorization', `Bearer ${tokenA}`)
        .expect(200);

      // Check audit log
      const { query } = require('../../apps/services/grc-api/config/database');
      const auditResult = await query(`
        SELECT * FROM audit_logs
        WHERE user_id = $1 AND action = 'authentication'
        AND created_at > NOW() - INTERVAL '1 minute'
      `, [userA.id]);

      expect(auditResult.rows).toHaveLength(1);
      expect(auditResult.rows[0].tenant_id).toBe(userA.tenantId);
    });

    it('should log failed authorization attempts', async () => {
      const maliciousToken = fixtures.createMaliciousJWT(
        '550e8400-e29b-41d4-a716-446655441003', // member
        '550e8400-e29b-41d4-a716-446655440001', // tenant A
        '550e8400-e29b-41d4-a716-446655440002'  // tenant B
      );

      // Attempt unauthorized access
      await request(app)
        .get('/api/assessments')
        .set('Authorization', `Bearer ${maliciousToken}`)
        .expect(401);

      // Check security event log
      const { query } = require('../../apps/services/grc-api/config/database');
      const securityResult = await query(`
        SELECT * FROM security_events
        WHERE event_type = 'token_tampering_attempt'
        AND created_at > NOW() - INTERVAL '1 minute'
      `);

      expect(securityResult.rows).toHaveLength(1);
      expect(securityResult.rows[0].details).toContain('JWT signature verification failed');
    });

    it('should maintain audit trail for data access', async () => {
      const userA = fixtures.getUserByEmail('manager@testa.com');
      const tokenA = fixtures.createTestJWT(userA.id, userA.tenantId);

      // Access specific assessment
      const assessmentId = '550e8400-e29b-41d4-a716-446655451001';
      await request(app)
        .get(`/api/assessments/${assessmentId}`)
        .set('Authorization', `Bearer ${tokenA}`)
        .expect(200);

      // Verify audit trail
      const { query } = require('../../apps/services/grc-api/config/database');
      const accessResult = await query(`
        SELECT * FROM data_access_logs
        WHERE user_id = $1 AND resource_type = 'assessment'
        AND resource_id = $2
        AND created_at > NOW() - INTERVAL '1 minute'
      `, [userA.id, assessmentId]);

      expect(accessResult.rows).toHaveLength(1);
      expect(accessResult.rows[0].tenant_id).toBe(userA.tenantId);
      expect(accessResult.rows[0].action).toBe('read');
    });
  });
});

module.exports = {};
