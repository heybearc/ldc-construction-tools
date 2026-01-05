import { test, expect } from '@playwright/test';

/**
 * DEBUG TEST - Check what happens after login
 */

const TEST_USER = {
  email: process.env.TEST_USER_EMAIL || 'admin@ldctools.local',
  password: process.env.TEST_USER_PASSWORD || 'AdminPass123!',
};

test('Debug: Check login and landing page', async ({ page }) => {
  // Login
  await page.goto('/auth/signin');
  await page.waitForLoadState('networkidle');
  
  console.log('1. On signin page');
  
  await page.fill('input[name="email"]', TEST_USER.email);
  await page.fill('input[name="password"]', TEST_USER.password);
  
  await Promise.all([
    page.waitForNavigation({ timeout: 15000 }),
    page.click('button[type="submit"]')
  ]);
  
  await page.waitForTimeout(2000);
  
  console.log('2. After login, URL:', page.url());
  console.log('3. Page title:', await page.title());
  
  // Take screenshot
  await page.screenshot({ path: 'test-results/after-login.png', fullPage: true });
  
  // Check if we can access volunteers
  console.log('4. Trying to navigate to /volunteers');
  await page.goto('/volunteers');
  await page.waitForTimeout(3000);
  
  console.log('5. On volunteers page, URL:', page.url());
  console.log('6. Page title:', await page.title());
  
  // Take screenshot
  await page.screenshot({ path: 'test-results/volunteers-page.png', fullPage: true });
  
  // Check what's on the page
  const bodyText = await page.locator('body').textContent();
  console.log('7. Page contains "Volunteers":', bodyText?.includes('Volunteers'));
  console.log('8. Page contains "Unauthorized":', bodyText?.includes('Unauthorized'));
  console.log('9. Page contains "Permission":', bodyText?.includes('Permission'));
  console.log('10. Page contains "Access Denied":', bodyText?.includes('Access Denied'));
  
  // This test always passes - it's just for debugging
  expect(true).toBe(true);
});
