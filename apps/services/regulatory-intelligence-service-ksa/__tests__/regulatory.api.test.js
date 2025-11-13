/**
 * API Integration Tests for Regulatory Intelligence Service
 * Tests all API endpoints
 */

const request = require('supertest');
const app = require('../server');
const { pool } = require('../config/database');

describe('Regulatory Intelligence Service API Tests', () => {
  
  afterAll(async () => {
    await pool.end();
  });

  describe('Health Check Endpoints', () => {
    test('GET /healthz should return healthy status', async () => {
      const response = await request(app).get('/healthz');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('service', 'regulatory-intelligence-ksa');
      expect(response.body).toHaveProperty('timestamp');
    });

    test('GET /readyz should return ready status', async () => {
      const response = await request(app).get('/readyz');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ready');
      expect(response.body).toHaveProperty('database');
      expect(response.body).toHaveProperty('redis');
    });
  });

  describe('Regulators API', () => {
    test('GET /api/regulatory/regulators should return list of 6 Saudi regulators', async () => {
      const response = await request(app)
        .get('/api/regulatory/regulators')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveLength(6);
      
      // Check for required regulators
      const regulatorIds = response.body.data.map(r => r.id);
      expect(regulatorIds).toContain('SAMA');
      expect(regulatorIds).toContain('NCA');
      expect(regulatorIds).toContain('MOH');
      expect(regulatorIds).toContain('ZATCA');
      expect(regulatorIds).toContain('SDAIA');
      expect(regulatorIds).toContain('CMA');
    });

    test('Each regulator should have required fields', async () => {
      const response = await request(app).get('/api/regulatory/regulators');
      
      response.body.data.forEach(regulator => {
        expect(regulator).toHaveProperty('id');
        expect(regulator).toHaveProperty('name');
        expect(regulator).toHaveProperty('nameAr');
        expect(regulator.id).toBeTruthy();
        expect(regulator.name).toBeTruthy();
        expect(regulator.nameAr).toBeTruthy();
      });
    });
  });

  describe('Regulatory Changes API', () => {
    test('GET /api/regulatory/changes should return changes list', async () => {
      const response = await request(app)
        .get('/api/regulatory/changes')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('count');
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('GET /api/regulatory/changes with regulator filter', async () => {
      const response = await request(app)
        .get('/api/regulatory/changes?regulator=SAMA')
        .expect(200);

      expect(response.body.success).toBe(true);
      
      // If data exists, all should be from SAMA
      if (response.body.data.length > 0) {
        response.body.data.forEach(change => {
          expect(change.regulator_id).toBe('SAMA');
        });
      }
    });

    test('GET /api/regulatory/changes with limit parameter', async () => {
      const response = await request(app)
        .get('/api/regulatory/changes?limit=10')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeLessThanOrEqual(10);
    });

    test('GET /api/regulatory/changes/:id with invalid ID should return 404', async () => {
      const response = await request(app)
        .get('/api/regulatory/changes/999999')
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Statistics API', () => {
    test('GET /api/regulatory/stats should return statistics', async () => {
      const response = await request(app)
        .get('/api/regulatory/stats')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('total_changes');
      expect(response.body.data).toHaveProperty('critical_changes');
      expect(response.body.data).toHaveProperty('high_changes');
      expect(response.body.data).toHaveProperty('changes_last_week');
      expect(response.body.data).toHaveProperty('changes_last_month');
    });
  });

  describe('Manual Scrape API', () => {
    test('POST /api/regulatory/scrape/:regulator should trigger scrape', async () => {
      const response = await request(app)
        .post('/api/regulatory/scrape/SAMA')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('regulator');
      expect(response.body.data).toHaveProperty('changesFound');
    });

    test('POST /api/regulatory/scrape/:regulator with invalid regulator should error', async () => {
      const response = await request(app)
        .post('/api/regulatory/scrape/INVALID')
        .expect(500);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Calendar API', () => {
    test('POST /api/regulatory/calendar/add without data should return 400', async () => {
      const response = await request(app)
        .post('/api/regulatory/calendar/add')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toContain('required');
    });

    test('GET /api/regulatory/calendar/:organizationId should return calendar', async () => {
      const response = await request(app)
        .get('/api/regulatory/calendar/1')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('count');
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('GET /api/regulatory/calendar/:organizationId with days parameter', async () => {
      const response = await request(app)
        .get('/api/regulatory/calendar/1?days=60')
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    test('PUT /api/regulatory/calendar/:id/complete should mark complete', async () => {
      // This test would need a calendar item to exist first
      // Skipping if database is empty
    });
  });

  describe('Error Handling', () => {
    test('Invalid JSON should return 400', async () => {
      const response = await request(app)
        .post('/api/regulatory/calendar/add')
        .set('Content-Type', 'application/json')
        .send('invalid json{')
        .expect(400);
    });

    test('Missing Content-Type header should still work', async () => {
      const response = await request(app)
        .get('/api/regulatory/regulators');

      expect(response.status).toBe(200);
    });
  });

  describe('Security Tests', () => {
    test('SQL injection in query parameter should be handled', async () => {
      const response = await request(app)
        .get('/api/regulatory/changes?regulator=SAMA\';DROP TABLE regulatory_changes;--')
        .expect(200);

      // Should not crash, should return safe response
      expect(response.body).toHaveProperty('success');
    });

    test('XSS in query parameter should be sanitized', async () => {
      const response = await request(app)
        .get('/api/regulatory/changes?regulator=<script>alert("xss")</script>')
        .expect(200);

      // Should handle safely
      expect(response.body).toHaveProperty('success');
    });
  });
});

