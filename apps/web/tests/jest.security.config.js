// jest.security.config.js
module.exports = {
  displayName: '🔒 Security Tests',
  testMatch: [
    '**/tests/security/**/*.test.js',
    '**/tests/integration/**/*.test.js'
  ],
  setupFilesAfterEnv: [
    '<rootDir>/tests/setup/jest.setup.js',
    '<rootDir>/tests/setup/securitySetup.js'
  ],
  testTimeout: 30000,
  maxWorkers: 1, // Run security tests sequentially for consistency
  collectCoverageFrom: [
    'apps/*/middleware/**/*.js',
    'apps/*/routes/**/*.js',
    'apps/bff/**/*.js',
    '!**/node_modules/**',
    '!**/tests/**'
  ],
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 95,
      lines: 95,
      statements: 95
    },
    './apps/*/middleware/': {
      branches: 100, // Security middleware must have 100% test coverage
      functions: 100,
      lines: 100,
      statements: 100
    }
  },
  testEnvironment: 'node',
  verbose: true,
  collectCoverage: true,
  coverageDirectory: 'coverage/security',
  coverageReporters: ['text', 'lcov', 'html', 'json-summary'],
  reporters: [
    'default',
    ['jest-html-reporters', {
      'publicPath': './coverage/security',
      'filename': 'security-test-report.html',
      'expand': true
    }]
  ]
};
