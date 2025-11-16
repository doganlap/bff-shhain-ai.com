const { test, expect } = require('@playwright/test');

test('login labels are associated', async ({ page }) => {
  await page.goto('http://localhost:4173/login');
  await expect(page.locator('label[for="email"]')).toHaveCount(1);
  await expect(page.locator('input#email')).toHaveCount(1);
  await expect(page.locator('label[for="password"]')).toHaveCount(1);
  await expect(page.locator('input#password')).toHaveCount(1);
});

test('partner login labels are associated', async ({ page }) => {
  await page.goto('http://localhost:4173/partner/login');
  await expect(page.locator('label[for="partner-email"]')).toHaveCount(1);
  await expect(page.locator('input#partner-email')).toHaveCount(1);
  await expect(page.locator('label[for="partner-password"]')).toHaveCount(1);
  await expect(page.locator('input#partner-password')).toHaveCount(1);
});