# Authentication System Path Testing Guide

## Overview
This testing suite validates all authentication endpoints and flows for the Shahin GRC platform, including:
- Frontend routes and page accessibility
- BFF (Backend-for-Frontend) authentication endpoints
- Direct API authentication endpoints
- Full authentication flows (register → login → access protected resources)
- Service health checks

## Prerequisites

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Required Services

You have several options depending on what you want to test:

#### Option A: Full System (Recommended)
```bash
# Start infrastructure (databases, redis, etc.)
npm run infra:up

# Start BFF service
npm run dev:bff

# Start Web frontend (in another terminal)
npm run dev:web

# Start API service (in another terminal)
npm run start:grc-api
```

#### Option B: BFF Only
```bash
npm run infra:up
npm run dev:bff
```

#### Option C: Docker Compose (All services)
```bash
npm run docker:up
```

## Running the Tests

### Quick Start
```bash
# Run all authentication path tests
node tests/auth-path-test.js
```

### With Custom URLs
```bash
# Set custom service URLs
WEB_URL=http://localhost:5173 \
BFF_URL=http://localhost:3001 \
API_URL=http://localhost:5001 \
node tests/auth-path-test.js
```

### Production/Staging Testing
```bash
# Test against deployed services
WEB_URL=https://shahin-ai.com \
BFF_URL=https://api.shahin-ai.com \
API_URL=https://grc-api.shahin-ai.com \
node tests/auth-path-test.js
```

## Test Coverage

### 1. Frontend Routes
Tests accessibility of all authentication-related frontend pages:
- ✅ Root/Home page (`/`)
- ✅ Standard login page (`/login`)
- ✅ Registration page (`/register`)
- ✅ Partner login page (`/partner/login`)
- ✅ Alternative login route (`/auth/login`)
- ✅ Super admin login (`/super-admin`)
- ✅ Main dashboard (`/dashboard`) - Protected
- ✅ Partner dashboard (`/partner/dashboard`) - Protected

### 2. BFF Authentication Endpoints
Tests all BFF authentication API endpoints:
- ✅ `POST /auth/login` - User login
- ✅ `POST /auth/register` - User registration
- ✅ `GET /auth/profile` - User profile retrieval
- ✅ `POST /auth/refresh-token` - Token refresh
- ✅ `POST /auth/change-password` - Password change
- ✅ `POST /partner/auth/login` - Partner login
- ✅ `POST /partner/auth/register` - Partner registration

### 3. Direct API Endpoints
Tests direct API access (bypassing BFF):
- ✅ `POST /api/auth/login` - Direct API login
- ✅ `POST /api/auth/register` - Direct API registration
- ✅ `POST /api/partner/auth/login` - Direct partner API login

### 4. Health Checks
Validates service availability:
- ✅ BFF health endpoint
- ✅ API health endpoint
- ✅ Admin API health endpoint

### 5. Full Authentication Flow
End-to-end test of complete authentication workflow:
1. ✅ User registration
2. ✅ User login with credentials
3. ✅ Access protected resource with token
4. ✅ Token refresh

## Test Results

### Console Output
The test script provides real-time colored console output:
- 🟢 **PASS** - Test succeeded with expected status
- 🔴 **FAIL** - Test failed with unexpected status
- 🟡 **SKIP** - Test skipped (service not available)

### JSON Report
After running tests, a detailed JSON report is generated at:
```
tests/auth-path-test-results.json
```

The report includes:
- Summary statistics (total, passed, failed, skipped, pass rate)
- Configuration used
- Individual test results with:
  - Test name and description
  - Pass/fail status
  - Expected vs actual HTTP status codes
  - Response time (duration in ms)
  - Timestamp

### Example Report Structure
```json
{
  "summary": {
    "total": 25,
    "passed": 20,
    "failed": 2,
    "skipped": 3,
    "passRate": "80.00%",
    "timestamp": "2024-01-15T10:30:00.000Z"
  },
  "configuration": {
    "web": "http://localhost:5173",
    "bff": "http://localhost:3001",
    "api": "http://localhost:5001"
  },
  "tests": [...]
}
```

## Troubleshooting

### Services Not Running
If you see "SKIP" messages, ensure services are running:
```bash
# Check service status
docker ps

# Or check individual services
curl http://localhost:3001/health  # BFF
curl http://localhost:5001/health  # API
```

### Connection Errors
If you get `ECONNREFUSED` errors:
1. Verify the service URLs are correct
2. Check if services are listening on expected ports
3. Verify firewall/network settings
4. Check service logs for startup errors

### Authentication Failures
Expected behavior for authentication endpoints:
- `401` - Invalid credentials (PASS)
- `400` - Bad request/validation error (PASS)
- `404` - Endpoint not found (FAIL - check routes)
- `500` - Server error (FAIL - check logs)

### Database Errors
If tests fail due to database issues:
```bash
# Reset local database
npm run migrate:local:reset

# Or restart infrastructure
npm run infra:down
npm run infra:up
```

## Integration with CI/CD

### Add to package.json
```json
{
  "scripts": {
    "test:auth-paths": "node tests/auth-path-test.js",
    "test:auth-paths:ci": "WEB_URL=$WEB_URL BFF_URL=$BFF_URL API_URL=$API_URL node tests/auth-path-test.js"
  }
}
```

### GitHub Actions Example
```yaml
- name: Run Authentication Path Tests
  env:
    WEB_URL: http://localhost:5173
    BFF_URL: http://localhost:3001
    API_URL: http://localhost:5001
  run: npm run test:auth-paths
```

### Exit Codes
- `0` - All tests passed
- `1` - One or more tests failed

## Extending the Tests

### Adding New Test Cases
Edit `tests/auth-path-test.js` and add to the appropriate test suite:

```javascript
// Example: Add new endpoint test
async bffAuthEndpoints() {
  const endpoints = [
    // ...existing endpoints
    {
      method: 'POST',
      path: '/auth/forgot-password',
      description: 'Password reset request',
      data: { email: 'test@example.com' },
      expectedStatuses: [200, 400, 404]
    }
  ];
  // ...rest of test logic
}
```

### Creating Custom Test Suites
```javascript
// Add to testSuites object
async customSuite() {
  logSection('Testing Custom Features');
  // Your test logic here
}

// Add to runTests() function
await testSuites.customSuite();
```

## Best Practices

1. **Run tests regularly** - After any authentication-related changes
2. **Test in isolation** - Run with clean database state
3. **Check all services** - Ensure all required services are running
4. **Review failures** - Check logs and response data for failed tests
5. **Update tests** - Keep tests in sync with API changes

## Support

For issues or questions:
1. Check service logs in `apps/bff/logs` and `apps/web/logs`
2. Review the JSON test report for detailed failure information
3. Consult the main project documentation
4. Check individual service README files

## Related Documentation

- [BFF Service Documentation](../apps/bff/README.md)
- [Web Frontend Documentation](../apps/web/README.md)
- [API Documentation](../apps/services/grc-api/README.md)
- [Authentication Flow Diagrams](../docs/authentication.md)
