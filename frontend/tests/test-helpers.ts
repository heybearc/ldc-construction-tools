import { Page } from '@playwright/test';

/**
 * Reusable test helper functions
 */

export async function login(page: Page, email?: string, password?: string) {
  const testEmail = email || process.env.TEST_USER_EMAIL || 'admin@test.com';
  const testPassword = password || process.env.TEST_USER_PASSWORD || 'admin123';
  
  await page.goto('/login');
  await page.fill('input[name="email"]', testEmail);
  await page.fill('input[name="password"]', testPassword);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/(volunteers|dashboard)/, { timeout: 10000 });
}

export async function navigateToVolunteers(page: Page) {
  if (!page.url().includes('/volunteers')) {
    await page.goto('/volunteers');
  }
  await page.waitForSelector('h1:has-text("Volunteers")', { timeout: 5000 });
}

export async function selectVolunteers(page: Page, count: number = 1) {
  for (let i = 1; i <= count; i++) {
    const checkbox = page.locator('input[type="checkbox"]').nth(i);
    if (await checkbox.isVisible()) {
      await checkbox.click();
      await page.waitForTimeout(200);
    }
  }
}

export async function clearAllFilters(page: Page) {
  const clearButton = page.locator('button:has-text("Clear All")');
  if (await clearButton.isVisible()) {
    await clearButton.click();
    await page.waitForTimeout(300);
  }
}

export async function takeScreenshotOnFailure(page: Page, testName: string) {
  await page.screenshot({ 
    path: `test-results/screenshots/${testName}-${Date.now()}.png`,
    fullPage: true 
  });
}
