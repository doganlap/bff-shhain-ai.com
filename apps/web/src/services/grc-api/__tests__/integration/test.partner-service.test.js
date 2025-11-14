/**
 * Partner Service Integration Tests
 */

const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

const PARTNER_SERVICE_URL = process.env.PARTNER_SERVICE_URL || 'http://localhost:3003';
const SERVICE_TOKEN = process.env.SERVICE_TOKEN || 'default-token';

describe('Partner Service Integration Tests', () => {
  let testTenantId;
  let testPartnerId;
  let testCollaborationId;

  beforeAll(() => {
    testTenantId = uuidv4();
  });

  describe('Partner Management', () => {
    test('Create partner', async () => {
      const response = await axios.post(
        `${PARTNER_SERVICE_URL}/api/partners`,
        {
          partner_tenant_id: uuidv4(),
          partner_type: 'vendor',
          partnership_level: 'standard',
          notes: 'Test partner'
        },
        {
          headers: {
            'X-Tenant-ID': testTenantId,
            'X-Service-Token': SERVICE_TOKEN
          }
        }
      );

      expect(response.status).toBe(201);
      expect(response.data.success).toBe(true);
      expect(response.data.data).toHaveProperty('id');
      testPartnerId = response.data.data.id;
    });

    test('Get partners', async () => {
      const response = await axios.get(`${PARTNER_SERVICE_URL}/api/partners`, {
        headers: {
          'X-Tenant-ID': testTenantId,
          'X-Service-Token': SERVICE_TOKEN
        }
      });

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(Array.isArray(response.data.data)).toBe(true);
    });

    test('Get partner by ID', async () => {
      if (!testPartnerId) return;

      const response = await axios.get(
        `${PARTNER_SERVICE_URL}/api/partners/${testPartnerId}`,
        {
          headers: {
            'X-Tenant-ID': testTenantId,
            'X-Service-Token': SERVICE_TOKEN
          }
        }
      );

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.data.id).toBe(testPartnerId);
    });

    test('Update partner', async () => {
      if (!testPartnerId) return;

      const response = await axios.put(
        `${PARTNER_SERVICE_URL}/api/partners/${testPartnerId}`,
        {
          status: 'active',
          partnership_level: 'premium'
        },
        {
          headers: {
            'X-Tenant-ID': testTenantId,
            'X-Service-Token': SERVICE_TOKEN
          }
        }
      );

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
    });
  });

  describe('Collaboration Management', () => {
    test('Create collaboration', async () => {
      if (!testPartnerId) return;

      const response = await axios.post(
        `${PARTNER_SERVICE_URL}/api/collaborations`,
        {
          partner_id: testPartnerId,
          collaboration_type: 'resource_sharing',
          shared_resources: {
            assessments: [uuidv4()],
            frameworks: [uuidv4()]
          },
          access_level: 'read'
        },
        {
          headers: {
            'X-Tenant-ID': testTenantId,
            'X-Service-Token': SERVICE_TOKEN
          }
        }
      );

      expect(response.status).toBe(201);
      expect(response.data.success).toBe(true);
      expect(response.data.data).toHaveProperty('id');
      testCollaborationId = response.data.data.id;
    });

    test('Get collaborations', async () => {
      const response = await axios.get(
        `${PARTNER_SERVICE_URL}/api/collaborations`,
        {
          headers: {
            'X-Tenant-ID': testTenantId,
            'X-Service-Token': SERVICE_TOKEN
          }
        }
      );

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(Array.isArray(response.data.data)).toBe(true);
    });
  });

  describe('Multi-Tenant Isolation', () => {
    test('Partners isolated by tenant', async () => {
      const otherTenantId = uuidv4();
      
      const response = await axios.get(
        `${PARTNER_SERVICE_URL}/api/partners`,
        {
          headers: {
            'X-Tenant-ID': otherTenantId,
            'X-Service-Token': SERVICE_TOKEN
          }
        }
      );

      expect(response.status).toBe(200);
      // Should not see partners from other tenant
      expect(response.data.data.length).toBe(0);
    });
  });
});

