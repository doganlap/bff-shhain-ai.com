/**
 * Notification Service Integration Tests
 */

const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

const NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3004';
const SERVICE_TOKEN = process.env.SERVICE_TOKEN || 'default-token';

describe('Notification Service Integration Tests', () => {
  let testTenantId;

  beforeAll(() => {
    testTenantId = uuidv4();
  });

  describe('Notification Sending', () => {
    test('Send notification', async () => {
      const response = await axios.post(
        `${NOTIFICATION_SERVICE_URL}/api/notifications/send`,
        {
          to: 'test@example.com',
          type: 'welcome',
          subject: 'Welcome to GRC System',
          content: 'Welcome message',
          data: {
            userName: 'Test User'
          }
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
      expect(response.data.data).toHaveProperty('notificationId');
    });

    test('Send email directly', async () => {
      const response = await axios.post(
        `${NOTIFICATION_SERVICE_URL}/api/notifications/email`,
        {
          to: 'test@example.com',
          subject: 'Test Email',
          content: 'This is a test email'
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

  describe('Notification Management', () => {
    test('Get notifications', async () => {
      const response = await axios.get(
        `${NOTIFICATION_SERVICE_URL}/api/notifications`,
        {
          headers: {
            'X-Tenant-ID': testTenantId,
            'X-Service-Token': SERVICE_TOKEN
          },
          params: {
            limit: 10
          }
        }
      );

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(Array.isArray(response.data.data)).toBe(true);
    });

    test('Get available templates', async () => {
      const response = await axios.get(
        `${NOTIFICATION_SERVICE_URL}/api/notifications/templates`,
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
});

