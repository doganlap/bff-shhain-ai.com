# Authentication Testing Suite

Complete authentication path testing for the Shahin GRC Platform.

## 🚀 Quick Start

```bash
# Interactive guided testing (recommended)
npm run test:auth-paths:guide

# OR setup and run directly
npm run test:auth-paths:setup
npm run test:auth-paths
```

## 📁 Files in This Suite

### 1. Core Test Scripts
- **`auth-path-test.js`** - Main test execution script (runs all tests)
- **`setup-auth-tests.js`** - Environment setup and validation
- **`quick-start-auth-test.js`** - Interactive testing guide

### 2. Documentation
- **`AUTH_PATH_TESTING.md`** - Complete testing guide and reference
- **`AUTH_TEST_SUMMARY.md`** - Implementation summary and results
- **`README.md`** (this file) - Quick reference index

### 3. Generated Files
- **`auth-path-test-results.json`** - Test results (generated after running tests)
- **`results/`** - Directory for test results (created automatically)

## 📋 What Gets Tested

### Frontend Routes (8)
- Home, Login, Register, Partner Login
- Super Admin, Dashboards

### BFF Endpoints (7)
- Login, Register, Profile, Refresh Token
- Change Password, Partner Auth

### API Endpoints (3)
- Direct API Login, Register, Partner Login

### Health Checks (3)
- BFF, API, Admin API

### Full Flow (4 steps)
- Register → Login → Access Protected → Refresh Token

**Total: 22+ test scenarios**

## 🎯 Usage Scenarios

### Scenario 1: Local Development Testing
```bash
# Start services
npm run infra:up
npm run dev:bff
npm run dev:web

# In another terminal, run tests
npm run test:auth-paths
```

### Scenario 2: Docker Testing
```bash
npm run docker:up
# Wait 30 seconds for services to start
npm run test:auth-paths
```

### Scenario 3: Production/Staging Testing
```bash
WEB_URL=https://shahin-ai.com \
BFF_URL=https://api.shahin-ai.com \
API_URL=https://grc-api.shahin-ai.com \
npm run test:auth-paths
```

### Scenario 4: Interactive (Easiest)
```bash
npm run test:auth-paths:guide
# Follow the prompts
```

## 📊 NPM Scripts Available

| Script | Description |
|--------|-------------|
| `test:auth-paths` | Run all authentication path tests |
| `test:auth-paths:setup` | Setup environment and verify dependencies |
| `test:auth-paths:guide` | Interactive guided testing |
| `test:auth-paths:local` | Test with explicit local URLs |
| `test:auth-paths:docker` | Test Docker services |

## 📖 Reading Order

New to this suite? Read in this order:

1. **This file** (you're here!) - Get oriented
2. **`AUTH_TEST_SUMMARY.md`** - See what was built and results
3. **`AUTH_PATH_TESTING.md`** - Deep dive into testing details

## 🔍 Example Output

### Console Output
```
╔════════════════════════════════════════════════════════════════════════════╗
║           Shahin GRC Authentication System Path Testing                   ║
╚════════════════════════════════════════════════════════════════════════════╝

Configuration:
  Web Frontend: http://localhost:5173
  BFF Service:  http://localhost:3001
  API Service:  http://localhost:5001

================================================================================
Testing Service Health Checks
================================================================================

[PASS] BFF Health
  → Status: 200 - http://localhost:3001/health (45ms)
[PASS] API Health
  → Status: 200 - http://localhost:5001/health (38ms)

================================================================================
Test Results Summary
================================================================================

Total Tests:    22
Passed:         20
Failed:         0
Skipped:        2
Pass Rate:      90.91%
```

### JSON Report
```json
{
  "summary": {
    "total": 22,
    "passed": 20,
    "failed": 0,
    "skipped": 2,
    "passRate": "90.91%",
    "timestamp": "2024-01-15T10:30:00.000Z"
  },
  "tests": [...]
}
```

## 🛠️ Common Commands

```bash
# Setup and verify
npm run test:auth-paths:setup

# Run tests
npm run test:auth-paths

# View help/guide
npm run test:auth-paths:guide

# Test specific environment
WEB_URL=... BFF_URL=... API_URL=... npm run test:auth-paths

# View latest results
cat tests/auth-path-test-results.json
```

## ⚠️ Troubleshooting

### All tests skipped?
Services aren't running. Start them first:
```bash
npm run infra:up
npm run dev:bff
npm run dev:web
```

### Connection errors?
Check service ports and URLs in configuration.

### Test failures?
1. Check service logs for errors
2. Review `auth-path-test-results.json`
3. Ensure database is properly seeded

## 🎓 Best Practices

1. ✅ Run tests after authentication changes
2. ✅ Test in clean database state
3. ✅ Monitor response times
4. ✅ Review failed test details
5. ✅ Keep tests updated with API changes

## 📚 Related Documentation

- [Main Project README](../README.md)
- [BFF Service](../apps/bff/README.md)
- [Web Frontend](../apps/web/README.md)
- [Complete Testing Guide](./AUTH_PATH_TESTING.md)
- [Implementation Summary](./AUTH_TEST_SUMMARY.md)

## 🚦 CI/CD Integration

Tests are ready for CI/CD:
- ✅ Exit codes (0 = pass, 1 = fail)
- ✅ JSON report for parsing
- ✅ Skip unavailable services gracefully
- ✅ Environment variable support

Example GitHub Actions:
```yaml
- name: Run Auth Tests
  run: npm run test:auth-paths
```

## 📞 Need Help?

1. Read `AUTH_PATH_TESTING.md` for comprehensive guide
2. Check `auth-path-test-results.json` for details
3. Review service logs for errors
4. Consult main project documentation

---

**Ready to test?** Run: `npm run test:auth-paths:guide` 🚀
