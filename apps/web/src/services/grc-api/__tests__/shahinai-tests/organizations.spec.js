import { test, expect } from '@playwright/test';

test.describe('Organizations Page', () => {
  test.beforeEach(async ({ page }) => {
    // Assuming the application is running on http://localhost:3000
    await page.goto('http://localhost:3000/organizations');
  });

  test('should display the organizations list', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('Organizations');
    await expect(page.locator('.organization-list-item')).toHaveCount(5); // Assuming 5 organizations are displayed initially
  });

  test('should allow searching for an organization', async ({ page }) => {
    await page.fill('input[placeholder="Search organizations..."]', 'Test Org');
    await page.press('input[placeholder="Search organizations..."]', 'Enter');
    await expect(page.locator('.organization-list-item')).toHaveCount(1);
    await expect(page.locator('.organization-list-item')).toContainText('Test Org');
  });

  test('should navigate to organization details page', async ({ page }) => {
    await page.locator('.organization-list-item').first().click();
    await expect(page).toHaveURL(/.*\/organizations\/.*/);
    await expect(page.locator('h1')).toContainText('Organization Details');
  });

  test('should navigate to organization creation form', async ({ page }) => {
    await page.locator('button:has-text("Add Organization")').click();
    await expect(page).toHaveURL(/.*\/organizations\/new/);
    await expect(page.locator('h1')).toHaveText('Create New Organization');
  });
});