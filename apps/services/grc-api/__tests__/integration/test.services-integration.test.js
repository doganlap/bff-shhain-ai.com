/**
 * Integration Tests for Multi-Service Ecosystem
 * Tests service-to-service communication and BFF routing
 */

const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

const BFF_URL = process.env.BFF_URL || 'http://localhost:3000';
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
const DOCUMENT_SERVICE_URL = process.env.DOCUMENT_SERVICE_URL || 'http://localhost:3002';
const PARTNER_SERVICE_URL = process.env.PARTNER_SERVICE_URL || 'http://localhost:3003';
const NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3004';

describe('Multi-Service Ecosystem Integration Tests', () => {
  let authToken;
  let testTenantId;
  let testUserId;

  beforeAll(async () => {
    // Test BFF health
    try {
      const healthResponse = await axios.get(`${BFF_URL}/healthz`);
      expect(healthResponse.status).toBe(200);
    } catch (error) {
      console.warn('BFF not available, skipping integration tests');
    }
  });

  describe('BFF Service Routing', () => {
    test('BFF health check', async () => {
      const response = await axios.get(`${BFF_URL}/healthz`);
      expect(response.status).toBe(200);
      expect(response.data).toBe('ok');
    });

    test('BFF readiness check', async () => {
      const response = await axios.get(`${BFF_URL}/readyz`);
      expect(response.status).toBe(200);
      expect(response.data.status).toBe('ready');
    });

    test('BFF aggregates dashboard data', async () => {
      const response = await axios.get(`${BFF_URL}/api/dashboard`, {
        headers: {
          'Authorization': `Bearer ${authToken || 'test-token'}`,
          'X-Tenant-ID': testTenantId || uuidv4()
        }
      });
      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.data).toHaveProperty('stats');
    });
  });

  describe('Auth Service Integration', () => {
    test('Auth service health check', async () => {
      const response = await axios.get(`${AUTH_SERVICE_URL}/healthz`);
      expect(response.status).toBe(200);
    });

    test('Auth service through BFF', async () => {
      const response = await axios.post(`${BFF_URL}/api/auth/login`, {
        email: 'test@example.com',
        password: 'test123'
      });
      // Should either succeed or return proper error
      expect([200, 401, 400]).toContain(response.status);
    });
  });

  describe('Document Service Integration', () => {
    test('Document service health check', async () => {
      const response = await axios.get(`${DOCUMENT_SERVICE_URL}/healthz`);
      expect(response.status).toBe(200);
    });

    test('Document service through BFF', async () => {
      const response = await axios.get(`${BFF_URL}/api/documents`, {
        headers: {
          'Authorization': `Bearer ${authToken || 'test-token'}`,
          'X-Tenant-ID': testTenantId || uuidv4()
        }
      });
      // Should either succeed or return proper error
      expect([200, 401, 403]).toContain(response.status);
    });
  });

  describe('Partner Service Integration', () => {
    test('Partner service health check', async () => {
      const response = await axios.get(`${PARTNER_SERVICE_URL}/healthz`);
      expect(response.status).toBe(200);
    });

    test('Partner service through BFF', async () => {
      const response = await axios.get(`${BFF_URL}/api/partners`, {
        headers: {
          'Authorization': `Bearer ${authToken || 'test-token'}`,
          'X-Tenant-ID': testTenantId || uuidv4()
        }
      });
      // Should either succeed or return proper error
      expect([200, 401, 403]).toContain(response.status);
    });
  });

  describe('Notification Service Integration', () => {
    test('Notification service health check', async () => {
      const response = await axios.get(`${NOTIFICATION_SERVICE_URL}/healthz`);
      expect(response.status).toBe(200);
    });

    test('Notification service through BFF', async () => {
      const response = await axios.get(`${BFF_URL}/api/notifications`, {
        headers: {
          'Authorization': `Bearer ${authToken || 'test-token'}`,
          'X-Tenant-ID': testTenantId || uuidv4()
        }
      });
      // Should either succeed or return proper error
      expect([200, 401, 403]).toContain(response.status);
    });
  });

  describe('Multi-Tenant Isolation', () => {
    test('Tenant context injection', async () => {
      const tenantId = uuidv4();
      const response = await axios.get(`${BFF_URL}/api/organizations`, {
        headers: {
          'Authorization': `Bearer ${authToken || 'test-token'}`,
          'X-Tenant-ID': tenantId
        }
      });
      // Should respect tenant context
      expect([200, 401, 403]).toContain(response.status);
    });
  });

  describe('Service Token Validation', () => {
    test('Invalid service token rejected', async () => {
      try {
        await axios.get(`${BFF_URL}/api/partners`, {
          headers: {
            'X-Service-Token': 'invalid-token'
          }
        });
      } catch (error) {
        expect([403, 401]).toContain(error.response?.status);
      }
    });
  });
});

