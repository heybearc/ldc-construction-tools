import { Page } from '@playwright/test';

/**
 * Reusable test helper functions
 */

export async function login(page: Page, email?: string, password?: string) {
  const testEmail = email || process.env.TEST_USER_EMAIL || 'admin@ldctools.local';
  const testPassword = password || process.env.TEST_USER_PASSWORD || 'AdminPass123!';
  
  await page.goto('/auth/signin');
  await page.waitForLoadState('networkidle');
  await page.waitForSelector('input[name="email"]', { state: 'visible' });
  await page.fill('input[name="email"]', testEmail);
  await page.fill('input[name="password"]', testPassword);
  await Promise.all([
    page.waitForNavigation({ timeout: 15000 }),
    page.click('button[type="submit"]')
  ]);
  await page.waitForTimeout(1000);
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

export async function takeScreenshot(page: Page, testName: string) {
  await page.screenshot({ 
    path: `test-results/screenshots/${testName}-${Date.now()}.png`,
    fullPage: true 
  });
}

export async function takeScreenshotOnFailure(page: Page, testName: string) {
  await page.screenshot({ 
    path: `test-results/screenshots/${testName}-${Date.now()}.png`,
    fullPage: true 
  });
}

export async function navigateTo(page: Page, path: string) {
  await page.goto(path);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);
}

export async function waitForDataLoad(page: Page) {
  const loadingSelectors = ['text=Loading...', '[data-loading="true"]', '.loading'];
  for (const selector of loadingSelectors) {
    try {
      await page.waitForSelector(selector, { state: 'hidden', timeout: 2000 });
    } catch {
      // Continue if selector not found
    }
  }
  await page.waitForTimeout(500);
}

export async function isVisible(page: Page, selector: string): Promise<boolean> {
  try {
    await page.waitForSelector(selector, { state: 'visible', timeout: 3000 });
    return true;
  } catch {
    return false;
  }
}

export async function clickAndWait(page: Page, selector: string) {
  await page.click(selector);
  await page.waitForTimeout(500);
}

export async function fillAndWait(page: Page, selector: string, value: string) {
  await page.fill(selector, value);
  await page.waitForTimeout(300);
}
