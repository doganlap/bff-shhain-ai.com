# 🛡️ Security Testing Framework

## Quick Start

Run all security tests:
```bash
npm run test:security
```

Run specific security test suites:
```bash
# Tenant isolation tests
npm run test:security -- tests/security/tenantIsolation.test.js

# RBAC permission tests
npm run test:security -- tests/security/rbacPermissions.test.js

# Multi-service integration tests
npm run test:security -- tests/integration/multiService.test.js
```

## Security Test Categories

### 1. Tenant Isolation Tests
- **Purpose**: Validate complete tenant data isolation
- **Location**: `tests/security/tenantIsolation.test.js`
- **Coverage**: Database RLS, JWT validation, cross-tenant attack prevention

### 2. RBAC Permission Tests
- **Purpose**: Validate role-based access controls
- **Location**: `tests/security/rbacPermissions.test.js`
- **Coverage**: Role hierarchy, permission matrix, privilege escalation prevention

### 3. Multi-Service Integration Tests
- **Purpose**: Validate security across service boundaries
- **Location**: `tests/integration/multiService.test.js`
- **Coverage**: BFF routing, service-to-service auth, tenant context propagation

## Test Data Management

### Test Fixtures
- **Location**: `tests/fixtures/testFixtures.js`
- **Components**: 3 test tenants, 6 test users, JWT generators, malicious token creation
- **Usage**: Automatically loaded in all security tests

### Test Tenants
- **Alpha Corp** (`alpha-corp`): Enterprise tenant with full features
- **Beta Ltd** (`beta-ltd`): Standard tenant with basic features
- **Gamma Inc** (`gamma-inc`): Trial tenant with limited features

### Test Users
Each tenant has 2 users with different permission levels:
- **Admin**: Full permissions within tenant
- **Member**: Limited permissions within tenant

## Security Validation

### Automated Checks
- ✅ Tenant data isolation
- ✅ JWT token validation
- ✅ Permission enforcement
- ✅ Role hierarchy respect
- ✅ Audit trail creation
- ✅ Security event logging
- ✅ Cross-tenant attack prevention
- ✅ Token tampering detection

### Performance Security
- ✅ Authentication response time < 100ms
- ✅ Authorization response time < 50ms
- ✅ Load testing with 100+ concurrent users
- ✅ Rate limiting enforcement

### Security Event Monitoring
All tests validate that security events are properly logged:
- Failed authentication attempts
- Permission violations
- Cross-tenant access attempts
- Token tampering attempts
- Privilege escalation attempts

## Configuration Files

### Jest Security Config
- **File**: `tests/jest.security.config.js`
- **Requirements**: 100% coverage for security middleware
- **Features**: Security-focused test environment, custom matchers

### Package.json Scripts
- `test:security`: Run all security tests with coverage
- `test:security:watch`: Run security tests in watch mode
- `test:security:ci`: Run security tests for CI/CD pipeline
- `test:audit`: Run comprehensive audit validation

## Custom Test Matchers

### `.toBeSecurityError(errorType)`
Validates security error responses:
```javascript
expect(response).toBeSecurityError('INSUFFICIENT_PERMISSIONS');
```

### `.toBeTenantIsolated(tenantId)`
Validates tenant data isolation:
```javascript
expect(assessments).toBeTenantIsolated('alpha-corp');
```

### `.toRequirePermission(permission)`
Validates permission requirements:
```javascript
expect(response).toRequirePermission('assessment:write');
```

## Security Test Helpers

### Authentication Helpers
- `createAuthHeaders(token)`: Standard auth headers
- `createMaliciousHeaders(token, overrides)`: Headers for security testing
- `validateSecurityResponse(response)`: Security response validation

### Audit Helpers
- `validateAuditLog(userId, action, tenantId)`: Audit trail validation
- `checkSecurityEvent(eventType, severity)`: Security event validation
- `measureResponseTime(testFunction)`: Performance measurement

### Load Testing Helpers
- `generateLoadTestUsers(count)`: Generate test users for load testing

## Production Validation

Before deploying to production, ensure all security tests pass:

```bash
# Run complete security validation
npm run test:security:ci

# Validate production configuration
npm run test:audit

# Performance security testing
npm run test:performance
```

## Troubleshooting

### Common Issues

1. **Database connection errors**
   - Ensure PostgreSQL is running
   - Check test database credentials
   - Verify database schema is up to date

2. **JWT token errors**
   - Ensure JWT_SECRET is set in test environment
   - Check token expiration settings
   - Validate token structure

3. **Permission test failures**
   - Verify role hierarchy configuration
   - Check permission matrix mapping
   - Ensure test fixtures are current

### Debug Mode
Enable verbose logging:
```bash
VERBOSE=true npm run test:security
```

### Test Data Reset
Reset test database:
```bash
npm run test:reset-db
```

## Compliance Requirements

This security testing framework validates:
- ✅ **GDPR**: Tenant data isolation and user consent
- ✅ **SOC 2**: Access controls and audit trails
- ✅ **ISO 27001**: Information security management
- ✅ **PCI DSS**: Secure authentication and authorization

## Continuous Security

### CI/CD Integration
All security tests are automatically run in:
- Pull request validation
- Pre-deployment checks
- Nightly security scans
- Release validation

### Security Monitoring
Production security monitoring includes:
- Real-time security event detection
- Automated incident response
- Security metrics dashboard
- Compliance reporting

---

**⚠️ IMPORTANT**: All security tests must pass before any code reaches production. No exceptions.
