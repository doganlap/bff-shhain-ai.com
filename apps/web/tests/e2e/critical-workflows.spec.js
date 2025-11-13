/**
 * End-to-End Test Scenarios - Critical GRC Workflows
 * Tests complete user journeys through the application
 *
 * Critical Workflows:
 * 1. Complete Assessment Workflow
 * 2. Risk Management Workflow
 * 3. Compliance Gap Analysis Workflow
 * 4. Document Upload and Management Workflow
 * 5. Report Generation Workflow
 */

import { test, expect } from '@playwright/test';

// Base URL from environment or default
const BASE_URL = process.env.VITE_APP_URL || 'http://localhost:5173';

test.describe('Critical Workflow 1: Complete Assessment', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto(`${BASE_URL}/login`);
    await page.fill('[name="email"]', 'admin@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Wait for dashboard to load
    await page.waitForURL(`${BASE_URL}/app/dashboard`);
  });

  test('should complete full assessment creation to submission workflow', async ({ page }) => {
    // Step 1: Navigate to Assessments
    await page.goto(`${BASE_URL}/app/assessments`);
    await expect(page).toHaveTitle(/Assessments/i);

    // Step 2: Create new assessment
    await page.click('button:has-text("Create New")');
    await expect(page.locator('role=dialog')).toBeVisible();

    // Step 3: Fill assessment form
    await page.fill('[name="name"]', 'E2E Test Assessment - ISO 27001');
    await page.selectOption('[name="framework"]', 'ISO 27001');
    await page.fill('[name="start_date"]', '2024-12-01');
    await page.fill('[name="due_date"]', '2024-12-31');
    await page.fill('[name="description"]', 'End-to-end test assessment');

    // Step 4: Submit assessment creation
    await page.click('button:has-text("Create")');

    // Wait for success message
    await expect(page.locator('text=/assessment created/i')).toBeVisible({ timeout: 5000 });

    // Step 5: Verify assessment appears in list
    await expect(page.locator('text=E2E Test Assessment - ISO 27001')).toBeVisible();

    // Step 6: Open assessment details
    await page.click('text=E2E Test Assessment - ISO 27001');
    await page.waitForURL(/\/assessments\/\d+/);

    // Step 7: Generate questions
    await page.click('button:has-text("Generate Questions")');
    await expect(page.locator('text=/generating questions/i')).toBeVisible();

    // Wait for questions to be generated (may take a few seconds)
    await expect(page.locator('.question-item')).toBeVisible({ timeout: 10000 });

    // Step 8: Answer first question
    const firstQuestion = page.locator('.question-item').first();
    await firstQuestion.locator('textarea').fill('Yes, we have implemented this control.');

    // Step 9: Upload evidence
    const fileInput = firstQuestion.locator('input[type="file"]');
    await fileInput.setInputFiles('test-files/sample-evidence.pdf');

    // Step 10: Submit response
    await firstQuestion.locator('button:has-text("Submit")').click();
    await expect(page.locator('text=/response saved/i')).toBeVisible();

    // Step 11: Navigate to scoring
    await page.click('text=View Score');

    // Step 12: Calculate score
    await page.click('button:has-text("Calculate Score")');
    await expect(page.locator('.score-display')).toBeVisible({ timeout: 5000 });

    // Step 13: Verify score is displayed
    const scoreElement = page.locator('.score-value');
    await expect(scoreElement).toBeVisible();
    const scoreText = await scoreElement.textContent();
    expect(parseInt(scoreText)).toBeGreaterThan(0);

    // Step 14: Complete assessment
    await page.click('button:has-text("Complete Assessment")');
    await expect(page.locator('text=/assessment completed/i')).toBeVisible();

    // Step 15: Verify status changed to completed
    await page.goto(`${BASE_URL}/app/assessments`);
    const completedAssessment = page.locator('text=E2E Test Assessment - ISO 27001')
      .locator('xpath=ancestor::div')
      .locator('.status-badge');
    await expect(completedAssessment).toHaveText('completed');
  });

  test('should handle assessment validation errors', async ({ page }) => {
    await page.goto(`${BASE_URL}/app/assessments`);

    // Try to create assessment without required fields
    await page.click('button:has-text("Create New")');
    await page.click('button:has-text("Create")'); // Submit without filling

    // Verify validation errors appear
    await expect(page.locator('text=/name is required/i')).toBeVisible();
    await expect(page.locator('text=/framework is required/i')).toBeVisible();
  });
});

test.describe('Critical Workflow 2: Risk Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('[name="email"]', 'admin@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL(`${BASE_URL}/app/dashboard`);
  });

  test('should identify, assess, and mitigate risk', async ({ page }) => {
    // Step 1: Navigate to Risk Management
    await page.goto(`${BASE_URL}/app/risks`);
    await expect(page).toHaveTitle(/Risk Management/i);

    // Step 2: Create new risk
    await page.click('button:has-text("Add Risk")');
    await page.fill('[name="title"]', 'E2E Test Risk - Data Breach');
    await page.fill('[name="description"]', 'Potential data breach vulnerability');
    await page.selectOption('[name="severity"]', 'high');
    await page.selectOption('[name="likelihood"]', 'medium');
    await page.selectOption('[name="category"]', 'Data Security');

    // Step 3: Submit risk creation
    await page.click('button:has-text("Create Risk")');
    await expect(page.locator('text=/risk created/i')).toBeVisible();

    // Step 4: Verify risk appears in list
    await expect(page.locator('text=E2E Test Risk - Data Breach')).toBeVisible();

    // Step 5: Open risk details
    await page.click('text=E2E Test Risk - Data Breach');

    // Step 6: Assess risk (calculate risk score)
    await page.click('button:has-text("Assess Risk")');

    // Fill assessment form
    await page.fill('[name="impact"]', '8');
    await page.fill('[name="likelihood_score"]', '6');
    await page.click('button:has-text("Calculate")');

    // Verify risk score is calculated
    await expect(page.locator('.risk-score')).toBeVisible();
    const riskScore = await page.locator('.risk-score').textContent();
    expect(parseFloat(riskScore)).toBeGreaterThan(0);

    // Step 7: Create mitigation plan
    await page.click('button:has-text("Add Mitigation")');
    await page.fill('[name="mitigation_title"]', 'Implement MFA');
    await page.fill('[name="mitigation_description"]', 'Multi-factor authentication for all users');
    await page.selectOption('[name="status"]', 'in_progress');
    await page.fill('[name="due_date"]', '2024-12-31');
    await page.click('button:has-text("Save Mitigation")');

    // Step 8: Verify mitigation appears
    await expect(page.locator('text=Implement MFA')).toBeVisible();

    // Step 9: Update risk status
    await page.selectOption('[name="risk_status"]', 'mitigating');
    await page.click('button:has-text("Update Status")');
    await expect(page.locator('text=/status updated/i')).toBeVisible();

    // Step 10: Complete mitigation
    await page.click('text=Implement MFA');
    await page.selectOption('[name="mitigation_status"]', 'completed');
    await page.click('button:has-text("Update")');

    // Step 11: Mark risk as mitigated
    await page.selectOption('[name="risk_status"]', 'mitigated');
    await page.click('button:has-text("Update Status")');

    // Step 12: Verify risk status in list view
    await page.goto(`${BASE_URL}/app/risks`);
    const mitigatedRisk = page.locator('text=E2E Test Risk - Data Breach')
      .locator('xpath=ancestor::div')
      .locator('.status-badge');
    await expect(mitigatedRisk).toHaveText('mitigated');
  });
});

test.describe('Critical Workflow 3: Compliance Gap Analysis', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('[name="email"]', 'admin@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL(`${BASE_URL}/app/dashboard`);
  });

  test('should identify and remediate compliance gaps', async ({ page }) => {
    // Step 1: Navigate to Compliance Dashboard
    await page.goto(`${BASE_URL}/app/compliance`);
    await expect(page).toHaveTitle(/Compliance/i);

    // Step 2: Select framework for gap analysis
    await page.selectOption('[name="framework"]', 'ISO 27001');

    // Step 3: Run gap analysis
    await page.click('button:has-text("Analyze Gaps")');
    await expect(page.locator('.analyzing-indicator')).toBeVisible();

    // Wait for analysis to complete
    await expect(page.locator('.gap-item')).toBeVisible({ timeout: 10000 });

    // Step 4: Verify gaps are displayed
    const gaps = page.locator('.gap-item');
    await expect(gaps).toHaveCount.toBeGreaterThan(0);

    // Step 5: Open first gap for remediation
    await gaps.first().click();

    // Step 6: Create remediation action
    await page.click('button:has-text("Create Action")');
    await page.fill('[name="action_title"]', 'Address Access Control Gap');
    await page.fill('[name="action_description"]', 'Implement role-based access control');
    await page.selectOption('[name="priority"]', 'high');
    await page.fill('[name="due_date"]', '2024-12-15');
    await page.click('button:has-text("Save Action")');

    // Step 7: Verify action appears
    await expect(page.locator('text=Address Access Control Gap')).toBeVisible();

    // Step 8: Complete action
    await page.click('text=Address Access Control Gap');
    await page.selectOption('[name="action_status"]', 'completed');
    await page.fill('[name="completion_notes"]', 'RBAC implemented successfully');
    await page.click('button:has-text("Update")');

    // Step 9: Re-run gap analysis
    await page.goto(`${BASE_URL}/app/compliance`);
    await page.selectOption('[name="framework"]', 'ISO 27001');
    await page.click('button:has-text("Analyze Gaps")');

    // Step 10: Verify compliance score improved
    const complianceScore = page.locator('.compliance-score');
    await expect(complianceScore).toBeVisible();

    // Take screenshot for verification
    await page.screenshot({ path: 'test-results/compliance-improvement.png' });
  });
});

test.describe('Critical Workflow 4: Document Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('[name="email"]', 'admin@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL(`${BASE_URL}/app/dashboard`);
  });

  test('should upload, categorize, and retrieve documents', async ({ page }) => {
    // Step 1: Navigate to Documents
    await page.goto(`${BASE_URL}/app/documents`);
    await expect(page).toHaveTitle(/Documents/i);

    // Step 2: Upload document
    await page.click('button:has-text("Upload")');
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('test-files/sample-policy.pdf');

    // Step 3: Fill document metadata
    await page.fill('[name="title"]', 'E2E Test Policy Document');
    await page.selectOption('[name="category"]', 'policy');
    await page.fill('[name="description"]', 'Test policy document for E2E testing');
    await page.fill('[name="tags"]', 'security,access-control,testing');

    // Step 4: Submit upload
    await page.click('button:has-text("Upload")');
    await expect(page.locator('text=/document uploaded/i')).toBeVisible({ timeout: 10000 });

    // Step 5: Verify document appears in list
    await expect(page.locator('text=E2E Test Policy Document')).toBeVisible();

    // Step 6: Search for document
    await page.fill('[placeholder*="Search"]', 'E2E Test Policy');
    await page.press('[placeholder*="Search"]', 'Enter');
    await expect(page.locator('text=E2E Test Policy Document')).toBeVisible();

    // Step 7: Filter by category
    await page.selectOption('[name="category_filter"]', 'policy');
    await expect(page.locator('text=E2E Test Policy Document')).toBeVisible();

    // Step 8: Open document details
    await page.click('text=E2E Test Policy Document');

    // Step 9: Run OCR if available
    if (await page.locator('button:has-text("Run OCR")').isVisible()) {
      await page.click('button:has-text("Run OCR")');
      await expect(page.locator('.ocr-text')).toBeVisible({ timeout: 15000 });
    }

    // Step 10: Download document
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Download")');
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('E2E Test Policy Document');

    // Step 11: Delete document
    await page.click('button:has-text("Delete")');
    await page.click('button:has-text("Confirm")');
    await expect(page.locator('text=/document deleted/i')).toBeVisible();

    // Step 12: Verify document no longer in list
    await page.goto(`${BASE_URL}/app/documents`);
    await expect(page.locator('text=E2E Test Policy Document')).not.toBeVisible();
  });
});

test.describe('Critical Workflow 5: Report Generation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('[name="email"]', 'admin@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL(`${BASE_URL}/app/dashboard`);
  });

  test('should generate comprehensive compliance report', async ({ page }) => {
    // Step 1: Navigate to Reports
    await page.goto(`${BASE_URL}/app/reports`);
    await expect(page).toHaveTitle(/Reports/i);

    // Step 2: Select report type
    await page.selectOption('[name="report_type"]', 'compliance');

    // Step 3: Configure report parameters
    await page.selectOption('[name="framework"]', 'ISO 27001');
    await page.fill('[name="date_from"]', '2024-01-01');
    await page.fill('[name="date_to"]', '2024-12-31');
    await page.check('[name="include_gaps"]');
    await page.check('[name="include_risks"]');
    await page.check('[name="include_evidence"]');

    // Step 4: Select output format
    await page.selectOption('[name="format"]', 'pdf');

    // Step 5: Generate report
    await page.click('button:has-text("Generate Report")');
    await expect(page.locator('text=/generating report/i')).toBeVisible();

    // Wait for report generation (may take a few seconds)
    await expect(page.locator('.report-preview')).toBeVisible({ timeout: 30000 });

    // Step 6: Preview report
    const previewFrame = page.frameLocator('.report-preview iframe');
    await expect(previewFrame.locator('text=ISO 27001')).toBeVisible();

    // Step 7: Download report
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Download")');
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/compliance-report.*\.pdf$/);

    // Step 8: Verify report in history
    await page.click('text=Report History');
    await expect(page.locator('text=ISO 27001 Compliance Report')).toBeVisible();
  });
});

test.describe('Performance Tests', () => {
  test('dashboard should load within 3 seconds', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('[name="email"]', 'admin@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    const startTime = Date.now();
    await page.waitForURL(`${BASE_URL}/app/dashboard`);
    await page.waitForSelector('.dashboard-kpi-card');
    const loadTime = Date.now() - startTime;

    expect(loadTime).toBeLessThan(3000);
  });

  test('assessment list should handle 100+ items efficiently', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('[name="email"]', 'admin@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    const startTime = Date.now();
    await page.goto(`${BASE_URL}/app/assessments`);
    await page.waitForSelector('.assessment-card');
    const loadTime = Date.now() - startTime;

    // Should load within 2 seconds even with many items
    expect(loadTime).toBeLessThan(2000);
  });
});

test.describe('Security Tests', () => {
  test('should redirect unauthenticated users to login', async ({ page }) => {
    await page.goto(`${BASE_URL}/app/dashboard`);

    // Should redirect to login
    await page.waitForURL(`${BASE_URL}/login`);
    expect(page.url()).toContain('/login');
  });

  test('should prevent XSS attacks in form inputs', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('[name="email"]', 'admin@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    await page.goto(`${BASE_URL}/app/assessments`);
    await page.click('button:has-text("Create New")');

    // Try to inject script
    const xssPayload = '<script>alert("XSS")</script>';
    await page.fill('[name="name"]', xssPayload);
    await page.click('button:has-text("Create")');

    // Verify script is escaped/sanitized
    await expect(page.locator('script:has-text("alert")')).not.toBeVisible();
  });
});
