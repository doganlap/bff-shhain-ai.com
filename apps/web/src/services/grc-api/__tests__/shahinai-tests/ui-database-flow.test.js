/**
 * End-to-End UI Database Integration Tests
 * Tests complete user flows that involve database interactions
 */

import { test, expect } from '@playwright/test';

// Test configuration
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';
const API_BASE_URL = process.env.TEST_API_URL || 'http://localhost:5001';

test.describe('UI Database Integration E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication if needed
    await page.goto(BASE_URL);
    
    // Wait for the app to load
    await page.waitForLoadState('networkidle');
  });

  test.describe('Organizations Management Flow', () => {
    test('should load and display organizations from database', async ({ page }) => {
      // Navigate to organizations page
      await page.goto(`${BASE_URL}/organizations`);
      
      // Wait for the page to load
      await page.waitForSelector('[data-testid="organizations-page"]', { timeout: 10000 });
      
      // Check if organizations are loaded from the database
      await expect(page.locator('h1')).toContainText('Organizations');
      
      // Wait for API call to complete
      await page.waitForResponse(response => 
        response.url().includes('/api/organizations') && response.status() === 200
      );
      
      // Check if organization cards are displayed
      const organizationCards = page.locator('[data-testid^="organization-"]');
      await expect(organizationCards.first()).toBeVisible({ timeout: 5000 });
    });

    test('should create new organization and save to database', async ({ page }) => {
      await page.goto(`${BASE_URL}/organizations`);
      
      // Click add organization button
      await page.click('button:has-text("Add Organization")');
      
      // Fill organization form
      await page.fill('input[name="name"]', 'Test Organization E2E');
      await page.fill('input[name="industry"]', 'Technology');
      await page.selectOption('select[name="country"]', 'KSA');
      await page.selectOption('select[name="sector"]', 'TEC');
      
      // Submit form
      await page.click('button[type="submit"]');
      
      // Wait for API call to complete
      await page.waitForResponse(response => 
        response.url().includes('/api/organizations') && 
        response.request().method() === 'POST' &&
        response.status() === 201
      );
      
      // Verify organization appears in the list
      await expect(page.locator('text=Test Organization E2E')).toBeVisible();
    });

    test('should update organization and persist changes to database', async ({ page }) => {
      await page.goto(`${BASE_URL}/organizations`);
      
      // Wait for organizations to load
      await page.waitForSelector('[data-testid^="organization-"]');
      
      // Click edit on first organization
      await page.click('[data-testid^="organization-"] button:has-text("Edit")');
      
      // Update organization name
      await page.fill('input[name="name"]', 'Updated Organization Name');
      
      // Save changes
      await page.click('button:has-text("Save")');
      
      // Wait for API call to complete
      await page.waitForResponse(response => 
        response.url().includes('/api/organizations/') && 
        response.request().method() === 'PUT' &&
        response.status() === 200
      );
      
      // Verify updated name appears
      await expect(page.locator('text=Updated Organization Name')).toBeVisible();
    });

    test('should delete organization from database', async ({ page }) => {
      await page.goto(`${BASE_URL}/organizations`);
      
      // Wait for organizations to load
      await page.waitForSelector('[data-testid^="organization-"]');
      
      // Get initial count of organizations
      const initialCount = await page.locator('[data-testid^="organization-"]').count();
      
      // Click delete on first organization
      await page.click('[data-testid^="organization-"] button:has-text("Delete")');
      
      // Confirm deletion
      await page.click('button:has-text("Confirm")');
      
      // Wait for API call to complete
      await page.waitForResponse(response => 
        response.url().includes('/api/organizations/') && 
        response.request().method() === 'DELETE' &&
        response.status() === 200
      );
      
      // Verify organization count decreased
      await expect(page.locator('[data-testid^="organization-"]')).toHaveCount(initialCount - 1);
    });
  });

  test.describe('Controls Management Flow', () => {
    test('should load controls with pagination from database', async ({ page }) => {
      await page.goto(`${BASE_URL}/controls`);
      
      // Wait for controls page to load
      await page.waitForSelector('[data-testid="controls-page"]');
      
      // Wait for API call to complete
      await page.waitForResponse(response => 
        response.url().includes('/api/grc-controls') && response.status() === 200
      );
      
      // Check if controls are displayed
      const controlRows = page.locator('[data-testid^="control-"]');
      await expect(controlRows.first()).toBeVisible();
      
      // Check pagination info
      const totalControls = page.locator('[data-testid="controls-total"]');
      await expect(totalControls).toBeVisible();
      
      // Test pagination
      if (await page.locator('button:has-text("Next")').isVisible()) {
        await page.click('button:has-text("Next")');
        
        // Wait for next page API call
        await page.waitForResponse(response => 
          response.url().includes('/api/grc-controls') && 
          response.url().includes('page=2') &&
          response.status() === 200
        );
      }
    });

    test('should filter controls by framework', async ({ page }) => {
      await page.goto(`${BASE_URL}/controls`);
      
      // Wait for page to load
      await page.waitForSelector('[data-testid="controls-page"]');
      
      // Select framework filter
      await page.selectOption('select[name="framework_id"]', { index: 1 });
      
      // Wait for filtered API call
      await page.waitForResponse(response => 
        response.url().includes('/api/grc-controls') && 
        response.url().includes('framework_id=') &&
        response.status() === 200
      );
      
      // Verify filtered results
      const controlRows = page.locator('[data-testid^="control-"]');
      await expect(controlRows.first()).toBeVisible();
    });

    test('should search controls by text', async ({ page }) => {
      await page.goto(`${BASE_URL}/controls`);
      
      // Wait for page to load
      await page.waitForSelector('[data-testid="controls-page"]');
      
      // Enter search term
      await page.fill('input[name="search"]', 'access control');
      
      // Wait for search API call
      await page.waitForResponse(response => 
        response.url().includes('/api/grc-controls') && 
        response.url().includes('search=access%20control') &&
        response.status() === 200
      );
      
      // Verify search results
      const controlRows = page.locator('[data-testid^="control-"]');
      await expect(controlRows.first()).toBeVisible();
    });
  });

  test.describe('Assessment Management Flow', () => {
    test('should create assessment and load related data from database', async ({ page }) => {
      await page.goto(`${BASE_URL}/assessments`);
      
      // Click create assessment
      await page.click('button:has-text("Create Assessment")');
      
      // Wait for form to load with data from database
      await Promise.all([
        page.waitForResponse(response => 
          response.url().includes('/api/grc-frameworks') && response.status() === 200
        ),
        page.waitForResponse(response => 
          response.url().includes('/api/organizations') && response.status() === 200
        ),
      ]);
      
      // Fill assessment form
      await page.fill('input[name="name"]', 'E2E Test Assessment');
      await page.selectOption('select[name="framework_id"]', { index: 1 });
      await page.selectOption('select[name="organization_id"]', { index: 1 });
      
      // Submit assessment
      await page.click('button:has-text("Create")');
      
      // Wait for assessment creation API call
      await page.waitForResponse(response => 
        response.url().includes('/api/assessments') && 
        response.request().method() === 'POST' &&
        response.status() === 201
      );
      
      // Verify assessment appears in list
      await expect(page.locator('text=E2E Test Assessment')).toBeVisible();
    });

    test('should load assessment responses from database', async ({ page }) => {
      await page.goto(`${BASE_URL}/assessments`);
      
      // Wait for assessments to load
      await page.waitForSelector('[data-testid^="assessment-"]');
      
      // Click on first assessment
      await page.click('[data-testid^="assessment-"] button:has-text("View")');
      
      // Wait for assessment details and responses to load
      await Promise.all([
        page.waitForResponse(response => 
          response.url().includes('/api/assessments/') && response.status() === 200
        ),
        page.waitForResponse(response => 
          response.url().includes('/api/assessment-responses') && response.status() === 200
        ),
      ]);
      
      // Verify assessment responses are displayed
      const responseRows = page.locator('[data-testid^="response-"]');
      await expect(responseRows.first()).toBeVisible();
    });

    test('should submit assessment responses to database', async ({ page }) => {
      await page.goto(`${BASE_URL}/assessments`);
      
      // Navigate to assessment details
      await page.waitForSelector('[data-testid^="assessment-"]');
      await page.click('[data-testid^="assessment-"] button:has-text("View")');
      
      // Wait for responses to load
      await page.waitForResponse(response => 
        response.url().includes('/api/assessment-responses') && response.status() === 200
      );
      
      // Fill first response
      await page.selectOption('[data-testid^="response-"] select[name="status"]', 'compliant');
      await page.fill('[data-testid^="response-"] textarea[name="comments"]', 'E2E test response');
      
      // Save response
      await page.click('[data-testid^="response-"] button:has-text("Save")');
      
      // Wait for response update API call
      await page.waitForResponse(response => 
        response.url().includes('/api/assessment-responses/') && 
        response.request().method() === 'PUT' &&
        response.status() === 200
      );
      
      // Verify response was saved
      await expect(page.locator('text=E2E test response')).toBeVisible();
    });
  });

  test.describe('Dashboard Data Integration', () => {
    test('should load dashboard statistics from database', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard`);
      
      // Wait for dashboard API calls to complete
      await Promise.all([
        page.waitForResponse(response => 
          response.url().includes('/api/dashboard/stats') && response.status() === 200
        ),
        page.waitForResponse(response => 
          response.url().includes('/api/regulators') && response.status() === 200
        ),
        page.waitForResponse(response => 
          response.url().includes('/api/grc-frameworks') && response.status() === 200
        ),
      ]);
      
      // Verify dashboard statistics are displayed
      await expect(page.locator('[data-testid="stats-regulators"]')).toBeVisible();
      await expect(page.locator('[data-testid="stats-frameworks"]')).toBeVisible();
      await expect(page.locator('[data-testid="stats-controls"]')).toBeVisible();
      
      // Verify numbers are loaded from database
      const regulatorsCount = await page.locator('[data-testid="stats-regulators"]').textContent();
      const frameworksCount = await page.locator('[data-testid="stats-frameworks"]').textContent();
      const controlsCount = await page.locator('[data-testid="stats-controls"]').textContent();
      
      expect(parseInt(regulatorsCount)).toBeGreaterThan(0);
      expect(parseInt(frameworksCount)).toBeGreaterThan(0);
      expect(parseInt(controlsCount)).toBeGreaterThan(0);
    });

    test('should display real-time compliance metrics from database', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard`);
      
      // Wait for compliance metrics API call
      await page.waitForResponse(response => 
        response.url().includes('/api/dashboard/compliance') && response.status() === 200
      );
      
      // Verify compliance score is displayed
      const complianceScore = page.locator('[data-testid="compliance-score"]');
      await expect(complianceScore).toBeVisible();
      
      // Verify score is a valid percentage
      const scoreText = await complianceScore.textContent();
      const score = parseFloat(scoreText.replace('%', ''));
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });
  });

  test.describe('Evidence Management Flow', () => {
    test('should upload evidence and save to database', async ({ page }) => {
      await page.goto(`${BASE_URL}/assessments`);
      
      // Navigate to assessment evidence section
      await page.waitForSelector('[data-testid^="assessment-"]');
      await page.click('[data-testid^="assessment-"] button:has-text("Evidence")');
      
      // Upload file
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles({
        name: 'test-evidence.pdf',
        mimeType: 'application/pdf',
        buffer: Buffer.from('Test evidence content'),
      });
      
      // Add evidence metadata
      await page.fill('input[name="title"]', 'E2E Test Evidence');
      await page.fill('textarea[name="description"]', 'Evidence uploaded via E2E test');
      
      // Submit evidence
      await page.click('button:has-text("Upload Evidence")');
      
      // Wait for evidence upload API call
      await page.waitForResponse(response => 
        response.url().includes('/api/assessment-evidence') && 
        response.request().method() === 'POST' &&
        response.status() === 201
      );
      
      // Verify evidence appears in list
      await expect(page.locator('text=E2E Test Evidence')).toBeVisible();
    });

    test('should download evidence from database', async ({ page }) => {
      await page.goto(`${BASE_URL}/assessments`);
      
      // Navigate to evidence section
      await page.waitForSelector('[data-testid^="assessment-"]');
      await page.click('[data-testid^="assessment-"] button:has-text("Evidence")');
      
      // Wait for evidence to load
      await page.waitForResponse(response => 
        response.url().includes('/api/assessment-evidence') && response.status() === 200
      );
      
      // Start download
      const downloadPromise = page.waitForEvent('download');
      await page.click('[data-testid^="evidence-"] button:has-text("Download")');
      
      // Wait for download API call
      await page.waitForResponse(response => 
        response.url().includes('/api/assessment-evidence/') && 
        response.url().includes('/download') &&
        response.status() === 200
      );
      
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toBeTruthy();
    });
  });

  test.describe('Error Handling and Edge Cases', () => {
    test('should handle database connection errors gracefully', async ({ page }) => {
      // Mock API to return 500 error
      await page.route('**/api/organizations', route => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Database connection error' }),
        });
      });
      
      await page.goto(`${BASE_URL}/organizations`);
      
      // Verify error message is displayed
      await expect(page.locator('text=Error loading organizations')).toBeVisible();
      
      // Verify retry functionality
      await page.click('button:has-text("Retry")');
    });

    test('should handle empty database responses', async ({ page }) => {
      // Mock API to return empty data
      await page.route('**/api/organizations', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: { data: [] } }),
        });
      });
      
      await page.goto(`${BASE_URL}/organizations`);
      
      // Verify empty state is displayed
      await expect(page.locator('text=No organizations found')).toBeVisible();
    });

    test('should handle network timeouts', async ({ page }) => {
      // Mock API to timeout
      await page.route('**/api/dashboard/stats', route => {
        // Don't fulfill the route to simulate timeout
      });
      
      await page.goto(`${BASE_URL}/dashboard`);
      
      // Wait for timeout and verify loading state
      await page.waitForTimeout(5000);
      await expect(page.locator('text=Loading dashboard...')).toBeVisible();
    });

    test('should handle authentication errors', async ({ page }) => {
      // Mock API to return 401 error
      await page.route('**/api/**', route => {
        route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Unauthorized' }),
        });
      });
      
      await page.goto(`${BASE_URL}/dashboard`);
      
      // Verify redirect to login page
      await expect(page).toHaveURL(/.*\/login/);
    });
  });

  test.describe('Performance and Load Testing', () => {
    test('should handle large datasets efficiently', async ({ page }) => {
      await page.goto(`${BASE_URL}/controls`);
      
      // Wait for initial load
      await page.waitForResponse(response => 
        response.url().includes('/api/grc-controls') && response.status() === 200
      );
      
      // Measure load time
      const startTime = Date.now();
      
      // Navigate through multiple pages quickly
      for (let i = 2; i <= 5; i++) {
        await page.click(`button:has-text("${i}")`);
        await page.waitForResponse(response => 
          response.url().includes(`page=${i}`) && response.status() === 200
        );
      }
      
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      
      // Verify reasonable performance (less than 10 seconds for 4 page loads)
      expect(totalTime).toBeLessThan(10000);
    });

    test('should handle concurrent API calls', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard`);
      
      // Verify multiple API calls complete successfully
      const responses = await Promise.all([
        page.waitForResponse(response => 
          response.url().includes('/api/dashboard/stats') && response.status() === 200
        ),
        page.waitForResponse(response => 
          response.url().includes('/api/regulators') && response.status() === 200
        ),
        page.waitForResponse(response => 
          response.url().includes('/api/grc-frameworks') && response.status() === 200
        ),
        page.waitForResponse(response => 
          response.url().includes('/api/dashboard/metrics') && response.status() === 200
        ),
      ]);
      
      // Verify all responses completed successfully
      responses.forEach(response => {
        expect(response.status()).toBe(200);
      });
    });
  });
});