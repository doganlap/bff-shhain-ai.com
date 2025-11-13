const request = require('supertest');
const { describe, it, beforeEach, afterEach, expect } = require('@jest/globals');
const TestFixtures = require('../fixtures/testFixtures');

/**
 * Integration Test Suite for Multi-Service RBAC
 * Tests cross-service authentication and BFF routing with tenant context
 */

describe('Multi-Service Integration Tests', () => {
  let fixtures;
  let bffApp, grcApp, docApp, partnerApp, notifyApp;

  beforeEach(async () => {
    fixtures = new TestFixtures();
    await fixtures.setupDatabase();

    // Initialize test apps (would import your actual apps)
    // bffApp = require('../../apps/bff/index');
    // grcApp = require('../../apps/services/grc-api/index');
    // docApp = require('../../apps/services/document-service/index');
    // partnerApp = require('../../apps/services/partner-service/index');
    // notifyApp = require('../../apps/services/notification-service/index');
  });

  afterEach(async () => {
    await fixtures.cleanupDatabase();
  });

  describe('BFF Service Routing', () => {
    it('should route requests with tenant context to all services', async () => {
      const admin = fixtures.getUserByEmail('admin@testa.com');
      const token = fixtures.createTestJWT(admin.id, admin.tenantId);

      const serviceEndpoints = [
        { service: 'GRC API', path: '/api/assessments' },
        { service: 'Document Service', path: '/api/documents' },
        { service: 'Partner Service', path: '/api/partners' },
        { service: 'Notification Service', path: '/api/notifications' }
      ];

      for (const endpoint of serviceEndpoints) {
        const response = await request(bffApp)
          .get(endpoint.path)
          .set('Authorization', `Bearer ${token}`)
          .expect((res) => {
            // Should not be 500 (routing error) or 404 (service not found)
            expect(res.status).not.toBe(500);
            expect(res.status).not.toBe(404);
          });

        // Verify tenant header was injected by BFF
        expect(response.request._headers['x-tenant-id']).toBe(admin.tenantId);
      }
    });

    it('should handle tenant context injection in BFF middleware', async () => {
      const member = fixtures.getUserByEmail('member@testa.com');
      const token = fixtures.createTestJWT(member.id, member.tenantId);

      // Mock the BFF middleware to capture injected headers
      let capturedHeaders = {};

      const response = await request(bffApp)
        .get('/api/assessments')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect((res) => {
          // Capture what headers were sent to downstream service
          capturedHeaders = res.request._headers;
        });

      // Verify BFF injected proper tenant context
      expect(capturedHeaders['x-tenant-id']).toBe(member.tenantId);
      expect(capturedHeaders['x-tenant-code']).toBe('TESTA');
      expect(capturedHeaders['x-user-id']).toBe(member.id);
    });

    it('should block client attempts to override tenant context', async () => {
      const userA = fixtures.getUserByEmail('admin@testa.com');
      const tenantB = fixtures.getTenantByCode('TESTB');
      const token = fixtures.createTestJWT(userA.id, userA.tenantId);

      // Client tries to set tenant header
      const response = await request(bffApp)
        .get('/api/assessments')
        .set('Authorization', `Bearer ${token}`)
        .set('X-Tenant-ID', tenantB.id)
        .set('X-Tenant-Code', tenantB.code)
        .expect(400);

      expect(response.body.error).toBe('tenant_override_forbidden');
      expect(response.body.message).toContain('Client cannot override tenant context');
    });

    it('should handle service authentication failures gracefully', async () => {
      // Invalid service token
      const invalidServiceToken = 'invalid.service.token';

      const response = await request(bffApp)
        .get('/api/internal/health')
        .set('Authorization', `Bearer ${invalidServiceToken}`)
        .expect(401);

      expect(response.body.error).toBe('service_authentication_failed');
    });

    it('should route service-to-service calls with proper tokens', async () => {
      const serviceToken = fixtures.createServiceJWT('document-service', [
        'system:read', 'notification:send'
      ]);

      // Service calls another service through BFF
      const response = await request(bffApp)
        .post('/api/internal/notifications/send')
        .set('Authorization', `Bearer ${serviceToken}`)
        .send({
          to: 'user@test.com',
          subject: 'Service Notification',
          body: 'Test message'
        })
        .expect(200);

      expect(response.body.status).toBe('sent');
    });
  });

  describe('Cross-Service Permission Validation', () => {
    it('should validate permissions across service boundaries', async () => {
      const member = fixtures.getUserByEmail('member@testa.com');
      const token = fixtures.createTestJWT(member.id, member.tenantId);

      // Member tries to access admin endpoint through BFF
      const response = await request(bffApp)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${token}`)
        .expect(403);

      expect(response.body.error).toBe('permission_denied');
      expect(response.body.details.requiredPermission).toBe('user:admin');
    });

    it('should maintain permission context across service hops', async () => {
      const manager = fixtures.getUserByEmail('manager@testa.com');
      const token = fixtures.createTestJWT(manager.id, manager.tenantId);

      // Manager creates document through workflow:
      // BFF -> Document Service -> Notification Service
      const response = await request(bffApp)
        .post('/api/documents/upload')
        .set('Authorization', `Bearer ${token}`)
        .attach('file', Buffer.from('test document'), 'test.pdf')
        .field('assessmentId', '550e8400-e29b-41d4-a716-446655451001')
        .expect(201);

      // Verify notification was sent (cross-service call)
      expect(response.body.data.notificationSent).toBe(true);

      // Verify all services respected tenant context
      expect(response.body.data.tenantId).toBe(manager.tenantId);
    });

    it('should handle permission caching across services', async () => {
      const admin = fixtures.getUserByEmail('admin@testa.com');
      const token = fixtures.createTestJWT(admin.id, admin.tenantId);

      // First request - permissions loaded
      const firstResponse = await request(bffApp)
        .get('/api/assessments')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      // Second request - permissions from cache
      const secondResponse = await request(bffApp)
        .get('/api/documents')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      // Verify cache headers indicate cached permission check
      expect(secondResponse.headers['x-permission-cache-hit']).toBe('true');
    });
  });

  describe('Partner Collaboration Workflow', () => {
    it('should handle partner access through complete workflow', async () => {
      // Setup partner relationship
      const tenantA = fixtures.getTenantByCode('TESTA');
      const partnerTenant = fixtures.getTenantByCode('PARTNER');

      const adminA = fixtures.getUserByEmail('admin@testa.com');
      const partner = fixtures.getUserByEmail('partner@partner.com');

      const adminToken = fixtures.createTestJWT(adminA.id, adminA.tenantId);
      const partnerToken = fixtures.createTestJWT(partner.id, partner.tenantId);

      // 1. Tenant A admin shares assessment with partner
      const shareResponse = await request(bffApp)
        .post('/api/partners/share')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          partnerTenantId: partnerTenant.id,
          resourceType: 'assessment',
          resourceId: '550e8400-e29b-41d4-a716-446655451001',
          permissions: ['assessment:read', 'document:shared:read']
        })
        .expect(200);

      // 2. Partner accesses shared assessment
      const accessResponse = await request(bffApp)
        .get(`/api/partners/${tenantA.id}/assessments`)
        .set('Authorization', `Bearer ${partnerToken}`)
        .expect(200);

      expect(accessResponse.body.data).toHaveLength(1);
      expect(accessResponse.body.data[0].shared).toBe(true);

      // 3. Partner tries to modify (should fail)
      const modifyResponse = await request(bffApp)
        .put(`/api/partners/${tenantA.id}/assessments/550e8400-e29b-41d4-a716-446655451001`)
        .set('Authorization', `Bearer ${partnerToken}`)
        .send({ name: 'Modified by Partner' })
        .expect(403);

      expect(modifyResponse.body.error).toBe('partner_modification_forbidden');
    });

    it('should audit partner access across services', async () => {
      const partner = fixtures.getUserByEmail('partner@partner.com');
      const token = fixtures.createTestJWT(partner.id, partner.tenantId);

      // Partner accesses shared resource
      await request(bffApp)
        .get('/api/partners/550e8400-e29b-41d4-a716-446655440001/assessments')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      // Verify audit log captures cross-tenant access
      const { query } = require('../../apps/services/grc-api/config/database');
      const auditResult = await query(`
        SELECT * FROM partner_access_logs
        WHERE partner_tenant_id = $1
        AND accessed_tenant_id = $2
        AND created_at > NOW() - INTERVAL '1 minute'
      `, [partner.tenantId, '550e8400-e29b-41d4-a716-446655440001']);

      expect(auditResult.rows).toHaveLength(1);
      expect(auditResult.rows[0].resource_type).toBe('assessment');
    });
  });

  describe('Performance and Scalability', () => {
    it('should handle concurrent multi-tenant requests', async () => {
      const users = [
        fixtures.getUserByEmail('admin@testa.com'),
        fixtures.getUserByEmail('member@testa.com'),
        fixtures.getUserByEmail('admin@testb.com')
      ];

      // Create concurrent requests from different tenants
      const requests = users.map(user => {
        const token = fixtures.createTestJWT(user.id, user.tenantId);
        return request(bffApp)
          .get('/api/assessments')
          .set('Authorization', `Bearer ${token}`);
      });

      const responses = await Promise.all(requests);

      // All requests should succeed
      responses.forEach((response, index) => {
        expect(response.status).toBe(200);

        // Each should only see their tenant's data
        const user = users[index];
        response.body.data.forEach(assessment => {
          expect(assessment.tenant_id).toBe(user.tenantId);
        });
      });
    });

    it('should maintain performance under load with permission caching', async () => {
      const admin = fixtures.getUserByEmail('admin@testa.com');
      const token = fixtures.createTestJWT(admin.id, admin.tenantId);

      // Multiple rapid requests to test caching
      const startTime = Date.now();

      const requests = Array(50).fill().map(() =>
        request(bffApp)
          .get('/api/assessments')
          .set('Authorization', `Bearer ${token}`)
      );

      const responses = await Promise.all(requests);
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // All requests successful
      expect(responses.every(r => r.status === 200)).toBe(true);

      // Performance should improve with caching (later requests faster)
      expect(totalTime).toBeLessThan(5000); // Under 5 seconds for 50 requests

      // Verify cache utilization
      const cacheHits = responses.filter(r =>
        r.headers['x-permission-cache-hit'] === 'true'
      ).length;

      expect(cacheHits).toBeGreaterThan(40); // Most requests should hit cache
    });
  });

  describe('Error Handling and Resilience', () => {
    it('should handle downstream service failures gracefully', async () => {
      const admin = fixtures.getUserByEmail('admin@testa.com');
      const token = fixtures.createTestJWT(admin.id, admin.tenantId);

      // Mock service failure (document service down)
      const response = await request(bffApp)
        .get('/api/documents')
        .set('Authorization', `Bearer ${token}`)
        .expect(503);

      expect(response.body.error).toBe('service_unavailable');
      expect(response.body.service).toBe('document-service');
      expect(response.body.retry_after).toBeDefined();
    });

    it('should implement circuit breaker for failing services', async () => {
      const admin = fixtures.getUserByEmail('admin@testa.com');
      const token = fixtures.createTestJWT(admin.id, admin.tenantId);

      // Simulate multiple failures to trigger circuit breaker
      const failRequests = Array(10).fill().map(() =>
        request(bffApp)
          .get('/api/failing-service/test')
          .set('Authorization', `Bearer ${token}`)
      );

      await Promise.all(failRequests);

      // Next request should be circuit breaker response
      const circuitResponse = await request(bffApp)
        .get('/api/failing-service/test')
        .set('Authorization', `Bearer ${token}`)
        .expect(503);

      expect(circuitResponse.body.error).toBe('circuit_breaker_open');
    });

    it('should maintain tenant isolation even during errors', async () => {
      const userA = fixtures.getUserByEmail('admin@testa.com');
      const userB = fixtures.getUserByEmail('admin@testb.com');

      const tokenA = fixtures.createTestJWT(userA.id, userA.tenantId);
      const tokenB = fixtures.createTestJWT(userB.id, userB.tenantId);

      // Force error condition
      const errorResponseA = await request(bffApp)
        .get('/api/error-endpoint')
        .set('Authorization', `Bearer ${tokenA}`)
        .expect(500);

      const errorResponseB = await request(bffApp)
        .get('/api/error-endpoint')
        .set('Authorization', `Bearer ${tokenB}`)
        .expect(500);

      // Error messages should not leak tenant information
      expect(errorResponseA.body.error_id).toBeDefined();
      expect(errorResponseA.body.tenant_id).toBeUndefined();

      expect(errorResponseB.body.error_id).toBeDefined();
      expect(errorResponseB.body.tenant_id).toBeUndefined();

      // Error IDs should be different (no cross-tenant pollution)
      expect(errorResponseA.body.error_id).not.toBe(errorResponseB.body.error_id);
    });
  });

  describe('Security Event Monitoring', () => {
    it('should detect and alert on suspicious cross-tenant attempts', async () => {
      const maliciousToken = fixtures.createMaliciousJWT(
        '550e8400-e29b-41d4-a716-446655441001', // User A
        '550e8400-e29b-41d4-a716-446655440001', // Tenant A
        '550e8400-e29b-41d4-a716-446655440002'  // Target Tenant B
      );

      // Multiple suspicious requests
      const suspiciousRequests = Array(5).fill().map(() =>
        request(bffApp)
          .get('/api/assessments')
          .set('Authorization', `Bearer ${maliciousToken}`)
      );

      await Promise.allSettled(suspiciousRequests);

      // Check security monitoring
      const { query } = require('../../apps/services/grc-api/config/database');
      const securityEvents = await query(`
        SELECT * FROM security_events
        WHERE event_type = 'suspicious_cross_tenant_attempt'
        AND created_at > NOW() - INTERVAL '1 minute'
      `);

      expect(securityEvents.rows).toHaveLength(1); // Aggregated event
      expect(securityEvents.rows[0].severity).toBe('high');
      expect(securityEvents.rows[0].details).toContain('token_tampering');
    });
  });
});

module.exports = {};
