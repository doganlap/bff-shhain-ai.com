// Security test setup and global configurations
const TestFixtures = require('../fixtures/testFixtures');

// Global test configuration
global.testConfig = {
  timeout: 30000,
  retries: 3,
  securityMode: true
};

// Global fixtures instance
global.fixtures = new TestFixtures();

// Security test helpers
global.securityHelpers = {
  /**
   * Create authenticated request headers
   */
  createAuthHeaders: (token) => ({
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'X-Request-ID': `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }),

  /**
   * Create malicious headers for security testing
   */
  createMaliciousHeaders: (token, overrides = {}) => ({
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'X-Tenant-ID': overrides.tenantId || 'malicious-tenant',
    'X-User-ID': overrides.userId || 'malicious-user',
    'X-Forwarded-For': '127.0.0.1, 10.0.0.1', // IP spoofing attempt
    'User-Agent': 'SecurityTest/1.0',
    ...overrides
  }),

  /**
   * Validate security response structure
   */
  validateSecurityResponse: (response, expectedStatus = 403) => {
    expect(response.status).toBe(expectedStatus);
    expect(response.body).toHaveProperty('error');
    expect(response.body).toHaveProperty('message');

    // Ensure no sensitive data in error response
    expect(response.body.message).not.toMatch(/password|secret|key|token/i);
    expect(response.body).not.toHaveProperty('stack');
    expect(response.body).not.toHaveProperty('sql');

    return response.body;
  },

  /**
   * Validate audit log entry
   */
  validateAuditLog: async (userId, action, tenantId) => {
    const { query } = require('../../apps/services/grc-api/config/database');

    const result = await query(`
      SELECT * FROM audit_logs
      WHERE user_id = $1
      AND action = $2
      AND tenant_id = $3
      AND created_at > NOW() - INTERVAL '1 minute'
      ORDER BY created_at DESC
      LIMIT 1
    `, [userId, action, tenantId]);

    expect(result.rows).toHaveLength(1);

    const log = result.rows[0];
    expect(log.user_id).toBe(userId);
    expect(log.action).toBe(action);
    expect(log.tenant_id).toBe(tenantId);
    expect(log.ip_address).toBeDefined();
    expect(log.user_agent).toBeDefined();

    return log;
  },

  /**
   * Check for security event
   */
  checkSecurityEvent: async (eventType, severity = 'medium') => {
    const { query } = require('../../apps/services/grc-api/config/database');

    const result = await query(`
      SELECT * FROM security_events
      WHERE event_type = $1
      AND severity = $2
      AND created_at > NOW() - INTERVAL '1 minute'
      ORDER BY created_at DESC
      LIMIT 1
    `, [eventType, severity]);

    expect(result.rows).toHaveLength(1);

    return result.rows[0];
  },

  /**
   * Measure response time for performance security tests
   */
  measureResponseTime: async (testFunction) => {
    const startTime = process.hrtime.bigint();
    await testFunction();
    const endTime = process.hrtime.bigint();

    const durationMs = Number(endTime - startTime) / 1000000;
    return durationMs;
  },

  /**
   * Generate load test data
   */
  generateLoadTestUsers: (count = 100) => {
    const users = [];

    for (let i = 0; i < count; i++) {
      const tenantIndex = i % 3; // Distribute across 3 test tenants
      const tenant = global.fixtures.testTenants[tenantIndex];

      users.push({
        id: `load-user-${i}`,
        email: `load-user-${i}@${tenant.code.toLowerCase()}.com`,
        tenantId: tenant.id,
        token: global.fixtures.createTestJWT(
          `load-user-${i}`,
          tenant.id,
          ['project_member'],
          ['assessment:read', 'assessment:write']
        )
      });
    }

    return users;
  }
};

// Database setup and teardown
beforeAll(async () => {
  console.log('🔧 Setting up security test environment...');

  // Ensure test database is clean
  await global.fixtures.cleanupDatabase().catch(() => {
    // Ignore errors if tables don't exist yet
  });

  // Setup test data
  await global.fixtures.setupDatabase();

  console.log('✅ Security test environment ready');
});

afterAll(async () => {
  console.log('🧹 Cleaning up security test environment...');

  // Cleanup test data
  await global.fixtures.cleanupDatabase();

  console.log('✅ Security test cleanup complete');
});

// Security-specific Jest matchers
expect.extend({
  /**
   * Custom matcher for security responses
   */
  toBeSecurityError(received, expectedError) {
    const pass = received.status >= 400 &&
                 received.body &&
                 received.body.error === expectedError;

    if (pass) {
      return {
        message: () => `Expected response not to be security error "${expectedError}"`,
        pass: true
      };
    } else {
      return {
        message: () => `Expected response to be security error "${expectedError}", got ${received.body?.error}`,
        pass: false
      };
    }
  },

  /**
   * Custom matcher for tenant isolation
   */
  toBeTenantIsolated(received, expectedTenantId) {
    const pass = Array.isArray(received) &&
                 received.every(item => item.tenant_id === expectedTenantId);

    if (pass) {
      return {
        message: () => `Expected data not to be tenant isolated to "${expectedTenantId}"`,
        pass: true
      };
    } else {
      return {
        message: () => `Expected data to be tenant isolated to "${expectedTenantId}"`,
        pass: false
      };
    }
  },

  /**
   * Custom matcher for permission validation
   */
  toRequirePermission(received, expectedPermission) {
    const pass = received.status === 403 &&
                 received.body &&
                 received.body.details &&
                 received.body.details.requiredPermission === expectedPermission;

    if (pass) {
      return {
        message: () => `Expected response not to require permission "${expectedPermission}"`,
        pass: true
      };
    } else {
      return {
        message: () => `Expected response to require permission "${expectedPermission}"`,
        pass: false
      };
    }
  }
});

// Environment validation
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'test';
}

if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'test-secret-for-security-tests-only';
}

// Disable console.log during tests unless VERBOSE=true
if (!process.env.VERBOSE) {
  global.console = {
    ...console,
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  };
}

console.log('🛡️  Security test setup complete');
