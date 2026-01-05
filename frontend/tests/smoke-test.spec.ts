import { test, expect } from '@playwright/test';

/**
 * QUICK SMOKE TESTS - Run these before every deployment
 * These tests verify critical functionality is working
 * Should complete in under 2 minutes
 */

const TEST_USER = {
  email: process.env.TEST_USER_EMAIL || 'admin@test.com',
  password: process.env.TEST_USER_PASSWORD || 'admin123',
};

test.describe('Quick Smoke Tests', () => {
  test('Critical Path: Login → Volunteers → View Data', async ({ page }) => {
    // 1. Login
    await page.goto('/login');
    await page.fill('input[name="email"]', TEST_USER.email);
    await page.fill('input[name="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/(volunteers|dashboard)/, { timeout: 10000 });
    
    // 2. Navigate to volunteers
    if (!page.url().includes('/volunteers')) {
      await page.goto('/volunteers');
    }
    
    // 3. Verify page loaded
    await expect(page.locator('h1:has-text("Volunteers")')).toBeVisible({ timeout: 5000 });
    
    // 4. Verify search box
    await expect(page.locator('input[placeholder*="Search"]')).toBeVisible();
    
    // 5. Verify at least one volunteer card or table row
    const hasGridView = await page.locator('.bg-white.rounded-lg.shadow').first().isVisible().catch(() => false);
    const hasTableView = await page.locator('table tbody tr').first().isVisible().catch(() => false);
    expect(hasGridView || hasTableView).toBeTruthy();
  });

  test('Search functionality works', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', TEST_USER.email);
    await page.fill('input[name="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('/volunteers', { timeout: 10000 });
    
    // Type in search
    await page.fill('input[placeholder*="Search"]', 'test');
    await page.waitForTimeout(500);
    
    // Page should still be functional
    await expect(page.locator('h1:has-text("Volunteers")')).toBeVisible();
  });

  test('Bulk operations UI appears when selecting volunteers', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', TEST_USER.email);
    await page.fill('input[name="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('/volunteers', { timeout: 10000 });
    
    // Select a volunteer
    const checkbox = page.locator('input[type="checkbox"]').nth(1);
    if (await checkbox.isVisible()) {
      await checkbox.click();
      
      // Bulk action buttons should appear
      const hasStatusBtn = await page.locator('button:has-text("Status")').isVisible().catch(() => false);
      const hasReassignBtn = await page.locator('button:has-text("Reassign")').isVisible().catch(() => false);
      const hasEditBtn = await page.locator('button:has-text("Edit")').isVisible().catch(() => false);
      
      expect(hasStatusBtn || hasReassignBtn || hasEditBtn).toBeTruthy();
    }
  });

  test('No critical JavaScript errors on page load', async ({ page }) => {
    const errors: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.goto('/login');
    await page.fill('input[name="email"]', TEST_USER.email);
    await page.fill('input[name="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('/volunteers', { timeout: 10000 });
    
    await page.waitForTimeout(2000);
    
    // Filter out non-critical errors
    const criticalErrors = errors.filter(e => 
      !e.includes('favicon') && 
      !e.includes('404') &&
      !e.includes('net::ERR_') &&
      !e.includes('Failed to load resource')
    );
    
    expect(criticalErrors.length).toBe(0);
  });
});
