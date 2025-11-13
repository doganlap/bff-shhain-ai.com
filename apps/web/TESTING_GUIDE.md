# Comprehensive Testing Guide - GRC Platform

## Overview

This document provides complete documentation for the testing infrastructure of the GRC platform, including unit tests, integration tests, E2E tests, and automated CI/CD testing.

## Table of Contents

1. [Testing Stack](#testing-stack)
2. [Running Tests](#running-tests)
3. [Writing Tests](#writing-tests)
4. [Test Coverage](#test-coverage)
5. [CI/CD Integration](#cicd-integration)
6. [Best Practices](#best-practices)

---

## Testing Stack

### Unit & Integration Tests
- **Framework**: Vitest
- **Testing Library**: @testing-library/react
- **Mocking**: MSW (Mock Service Worker)
- **Coverage**: @vitest/coverage-v8

### End-to-End Tests
- **Framework**: Playwright
- **Browsers**: Chromium, Firefox, WebKit
- **Reporters**: HTML, JSON, JUnit

### Additional Tools
- **Linting**: ESLint
- **Code Quality**: Lighthouse CI
- **Security**: npm audit, Snyk

---

## Running Tests

### Quick Start

```bash
# Install dependencies
cd apps/web
npm install

# Run all unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui
```

### Specific Test Suites

```bash
# Run API tests only
npm test -- src/__tests__/api/

# Run page integration tests only
npm test -- src/__tests__/pages/

# Run component tests only
npm test -- src/__tests__/components/

# Run specific test file
npm test -- EnhancedDashboard.test.jsx

# Run tests matching pattern
npm test -- --grep="Dashboard"
```

### Coverage Reports

```bash
# Generate coverage report
npm run test:coverage

# View coverage in browser
open coverage/index.html

# Coverage reports are generated in:
# - coverage/lcov.info (for CI/CD)
# - coverage/index.html (for viewing)
```

---

## Writing Tests

### Unit Test Example

```javascript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent title="Test" />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('should handle click events', async () => {
    const handleClick = vi.fn();
    render(<MyComponent onClick={handleClick} />);

    await userEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Integration Test Example

```javascript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import apiService from '../services/apiEndpoints';

vi.mock('../services/apiEndpoints');

describe('Dashboard Integration', () => {
  beforeEach(() => {
    apiService.dashboard.getKPIs.mockResolvedValue({
      data: { complianceScore: 85 }
    });
  });

  it('should load and display dashboard data', async () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('85%')).toBeInTheDocument();
    });
  });
});
```

### E2E Test Example

```javascript
import { test, expect } from '@playwright/test';

test('complete assessment workflow', async ({ page }) => {
  // Login
  await page.goto('/login');
  await page.fill('[name="email"]', 'admin@example.com');
  await page.fill('[name="password"]', 'password123');
  await page.click('button[type="submit"]');

  // Navigate to assessments
  await page.goto('/app/assessments');

  // Create new assessment
  await page.click('button:has-text("Create New")');
  await page.fill('[name="name"]', 'Test Assessment');
  await page.click('button:has-text("Create")');

  // Verify creation
  await expect(page.locator('text=Test Assessment')).toBeVisible();
});
```

### API Test Example

```javascript
import { describe, it, expect, vi } from 'vitest';
import apiService from '../services/apiEndpoints';
import axios from 'axios';

vi.mock('axios');

describe('API Endpoints', () => {
  it('should fetch dashboard KPIs', async () => {
    const mockData = { data: { complianceScore: 85 } };
    axios.create.mockReturnValue({
      get: vi.fn().mockResolvedValue(mockData)
    });

    const result = await apiService.dashboard.getKPIs();
    expect(result.data.complianceScore).toBe(85);
  });
});
```

---

## Test Coverage

### Current Coverage Goals

| Category | Target | Current |
|----------|--------|---------|
| **API Endpoints** | 90% | ✅ 95% |
| **Components** | 80% | 🔄 75% |
| **Pages** | 70% | 🔄 60% |
| **Utilities** | 90% | ✅ 92% |
| **Overall** | 75% | 🔄 70% |

### Coverage Reports Location

```
apps/web/
├── coverage/
│   ├── index.html          # Browse coverage
│   ├── lcov.info          # CI/CD format
│   └── coverage-summary.json
└── test-results/
    ├── unit-test-results.json
    ├── e2e-report/
    └── screenshots/
```

### Viewing Coverage

1. Generate coverage: `npm run test:coverage`
2. Open `coverage/index.html` in browser
3. Drill down to specific files/functions

---

## CI/CD Integration

### GitHub Actions Workflow

Tests run automatically on:
- **Push** to main or develop branches
- **Pull Requests**
- **Scheduled** daily at 2 AM UTC

### Workflow Jobs

1. **Unit Tests** (Node 18.x, 20.x)
   - Linting
   - Unit tests
   - Coverage generation
   - Artifact upload

2. **E2E Tests**
   - Build application
   - Run Playwright tests (all browsers)
   - Generate reports
   - Upload videos on failure

3. **API Tests**
   - Setup PostgreSQL
   - Run API endpoint tests
   - Verify database operations

4. **Performance Tests**
   - Lighthouse CI
   - Load time verification
   - Bundle size analysis

5. **Security Scans**
   - npm audit
   - Snyk vulnerability scan
   - Dependency checks

6. **Test Report**
   - Consolidate all results
   - Generate summary
   - Comment on PR

### Viewing CI Results

1. Go to **Actions** tab in GitHub
2. Click on workflow run
3. View job logs and artifacts
4. Download test reports

### Test Artifacts

Available for 30 days:
- Coverage reports
- E2E test videos
- Screenshots
- Test result JSON
- Performance reports

---

## Best Practices

### General Guidelines

1. **Test Naming**
   ```javascript
   // Good
   it('should create assessment when valid data provided', () => {});

   // Bad
   it('test1', () => {});
   ```

2. **Arrange-Act-Assert Pattern**
   ```javascript
   it('should do something', () => {
     // Arrange
     const input = { name: 'Test' };

     // Act
     const result = myFunction(input);

     // Assert
     expect(result).toBe(expected);
   });
   ```

3. **Avoid Test Interdependence**
   - Each test should be independent
   - Use `beforeEach` for setup
   - Clean up after tests

4. **Mock External Dependencies**
   - Mock API calls
   - Mock timers
   - Mock third-party libraries

5. **Test Edge Cases**
   - Empty data
   - Null/undefined
   - Error conditions
   - Boundary values

### Component Testing Best Practices

1. **Test User Behavior, Not Implementation**
   ```javascript
   // Good - tests behavior
   await userEvent.click(screen.getByRole('button', { name: /submit/i }));
   expect(mockFunction).toHaveBeenCalled();

   // Bad - tests implementation
   expect(component.state.count).toBe(1);
   ```

2. **Use Accessible Queries**
   - `getByRole` (preferred)
   - `getByLabelText`
   - `getByText`
   - Avoid `getByTestId` unless necessary

3. **Wait for Async Updates**
   ```javascript
   await waitFor(() => {
     expect(screen.getByText('Success')).toBeInTheDocument();
   });
   ```

### E2E Testing Best Practices

1. **Use Page Object Pattern**
   ```javascript
   class LoginPage {
     async login(email, password) {
       await this.page.fill('[name="email"]', email);
       await this.page.fill('[name="password"]', password);
       await this.page.click('button[type="submit"]');
     }
   }
   ```

2. **Use Data Attributes for Stability**
   ```html
   <button data-testid="submit-button">Submit</button>
   ```
   ```javascript
   await page.click('[data-testid="submit-button"]');
   ```

3. **Handle Async Operations**
   ```javascript
   await page.waitForSelector('.result', { timeout: 5000 });
   await page.waitForURL(/\/dashboard/);
   ```

### API Testing Best Practices

1. **Test All HTTP Methods**
   - GET, POST, PUT, DELETE, PATCH

2. **Test Error Scenarios**
   - 400, 401, 404, 500 errors
   - Network failures
   - Timeouts

3. **Verify Request Payloads**
   ```javascript
   expect(mockPost).toHaveBeenCalledWith('/api/endpoint', {
     name: 'Test',
     id: 123
   });
   ```

---

## Troubleshooting

### Common Issues

**Issue: Tests fail in CI but pass locally**
- Ensure consistent Node version
- Check for timezone issues
- Verify environment variables

**Issue: Flaky E2E tests**
- Add proper wait conditions
- Increase timeouts for slow operations
- Use `waitFor` instead of fixed delays

**Issue: Low coverage warnings**
- Run `npm run test:coverage` locally
- Identify untested files
- Add tests for critical paths

**Issue: Playwright installation fails**
- Run `npx playwright install --with-deps`
- Check system requirements
- Verify browser binaries

---

## Test Files Structure

```
apps/web/
├── src/
│   └── __tests__/
│       ├── api/
│       │   └── apiEndpoints.test.js         # API tests
│       ├── pages/
│       │   ├── EnhancedDashboard.test.jsx   # Page integration
│       │   └── AdvancedAssessmentManager.test.jsx
│       ├── components/
│       │   └── EnterprisePageLayout.test.jsx # Component units
│       └── setup.js                          # Test configuration
└── tests/
    └── e2e/
        └── critical-workflows.spec.js         # E2E scenarios
```

---

## Test Statistics

### Total Test Count
- **Unit Tests**: 150+
- **Integration Tests**: 50+
- **E2E Tests**: 25+
- **API Tests**: 100+
- **Total**: **325+ tests**

### Execution Time
- Unit Tests: ~15 seconds
- E2E Tests: ~3 minutes
- Full Suite: ~5 minutes

---

## Contributing

### Adding New Tests

1. Create test file next to source file or in `__tests__` directory
2. Follow naming convention: `*.test.jsx` or `*.spec.js`
3. Write descriptive test names
4. Ensure tests pass locally before PR
5. Maintain or improve coverage percentage

### Reviewing Test Code

- Verify tests actually test what they claim
- Check for proper mocking
- Ensure no hardcoded values
- Validate error handling
- Confirm accessibility checks

---

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Documentation](https://playwright.dev/)
- [Jest DOM Matchers](https://github.com/testing-library/jest-dom)

---

## Support

For testing questions or issues:
1. Check this guide
2. Review existing tests for examples
3. Consult team documentation
4. Ask in #testing Slack channel

---

**Last Updated**: 2024-11-13
**Version**: 1.0.0
**Maintainers**: GRC Platform Team
