/**
 * Jest Setup File
 * Global test configuration and environment setup
 */

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
process.env.DB_HOST = process.env.TEST_DB_HOST || 'localhost';
process.env.DB_PORT = process.env.TEST_DB_PORT || '5433';
process.env.DB_NAME = process.env.TEST_DB_NAME || 'grc_ecosystem';
process.env.DB_USER = process.env.TEST_DB_USER || 'grc_user';
process.env.DB_PASSWORD = process.env.TEST_DB_PASSWORD || 'grc_password';

// Extend Jest timeout for integration tests
jest.setTimeout(30000);

// Global test utilities
global.testUtils = {
  generateTestId: () => `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,

  sleep: (ms) => new Promise(resolve => setTimeout(resolve, ms)),

  cleanupTestData: async (db, tableName, testIds) => {
    if (db && tableName && testIds && testIds.length > 0) {
      try {
        await db.query(
          `DELETE FROM ${tableName} WHERE id = ANY($1)`,
          [testIds]
        );
      } catch (error) {
        console.warn(`Cleanup warning for ${tableName}:`, error.message);
      }
    }
  }
};

// Mock console methods in test environment to reduce noise
if (process.env.SILENT_TESTS === 'true') {
  global.console = {
    ...console,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };
}

// Setup and teardown hooks
beforeAll(() => {
  console.log('🧪 Starting test suite...');
});

afterAll(() => {
  console.log('✅ Test suite completed');
});
