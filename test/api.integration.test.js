/**
 * API Integration Tests
 * Tests all API endpoints for functionality and response times
 */

const { describe, test, expect } = require('@jest/globals');

// Test configuration
const API_BASE = process.env.TEST_API_BASE || 'http://localhost:3005';
const TEST_TIMEOUT = 30000;

describe('API Health Tests', () => {
  test('Health endpoint should respond', async () => {
    const response = await fetch(`${API_BASE}/health`);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe('healthy');
    expect(data.service).toBe('BFF');
  }, TEST_TIMEOUT);
});

describe('Task API Tests', () => {
  test('GET /api/tasks should return task list', async () => {
    const response = await fetch(`${API_BASE}/api/tasks?limit=10`);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBe(true);
  }, TEST_TIMEOUT);

  test('GET /api/tasks/stats should return statistics', async () => {
    const response = await fetch(`${API_BASE}/api/tasks/stats`);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.stats).toBeDefined();
    expect(data.stats.total).toBeGreaterThanOrEqual(0);
  }, TEST_TIMEOUT);
});

describe('Agent API Tests', () => {
  test('GET /api/agents should return agent list', async () => {
    const response = await fetch(`${API_BASE}/api/agents`);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBe(true);
    expect(data.data.length).toBeGreaterThan(0);
  }, TEST_TIMEOUT);

  test('GET /api/agents/:id should return specific agent', async () => {
    const response = await fetch(`${API_BASE}/api/agents/compliance-scanner`);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.id).toBe('compliance-scanner');
  }, TEST_TIMEOUT);
});

describe('Strategic API Tests', () => {
  test('GET /api/strategic/overview should return dashboard', async () => {
    const response = await fetch(`${API_BASE}/api/strategic/overview`);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.overview).toBeDefined();
    expect(data.kpis).toBeDefined();
  }, TEST_TIMEOUT);

  test('GET /api/strategic/priorities should return priority items', async () => {
    const response = await fetch(`${API_BASE}/api/strategic/priorities`);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toBeDefined();
  }, TEST_TIMEOUT);
});

describe('GRC Core API Tests', () => {
  test('GET /api/frameworks should return gracefully', async () => {
    const response = await fetch(`${API_BASE}/api/frameworks?limit=5`);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBe(true);
  }, TEST_TIMEOUT);

  test('GET /api/risks should return gracefully', async () => {
    const response = await fetch(`${API_BASE}/api/risks?limit=5`);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBe(true);
  }, TEST_TIMEOUT);

  test('GET /api/assessments should return gracefully', async () => {
    const response = await fetch(`${API_BASE}/api/assessments?limit=5`);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBe(true);
  }, TEST_TIMEOUT);

  test('GET /api/compliance should return gracefully', async () => {
    const response = await fetch(`${API_BASE}/api/compliance?limit=5`);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBe(true);
  }, TEST_TIMEOUT);
});

describe('Performance Tests', () => {
  test('Cached requests should be fast (<50ms)', async () => {
    // First request (cache miss)
    await fetch(`${API_BASE}/api/agents`);

    // Second request (cache hit)
    const start = Date.now();
    const response = await fetch(`${API_BASE}/api/agents`);
    const duration = Date.now() - start;

    expect(response.status).toBe(200);
    expect(duration).toBeLessThan(50);
  }, TEST_TIMEOUT);

  test('Health check should be fast (<20ms)', async () => {
    const start = Date.now();
    const response = await fetch(`${API_BASE}/health`);
    const duration = Date.now() - start;

    expect(response.status).toBe(200);
    expect(duration).toBeLessThan(20);
  }, TEST_TIMEOUT);
});

describe('Error Handling Tests', () => {
  test('Non-existent endpoint should return 404', async () => {
    const response = await fetch(`${API_BASE}/api/nonexistent`);
    expect(response.status).toBe(404);
  }, TEST_TIMEOUT);

  test('Invalid agent ID should return error', async () => {
    const response = await fetch(`${API_BASE}/api/agents/invalid-agent-id`);
    const data = await response.json();

    expect(data.success).toBe(false);
    expect(data.error).toBeDefined();
  }, TEST_TIMEOUT);
});

console.log('✅ All API integration tests configured');
