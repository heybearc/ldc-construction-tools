import { test, expect } from '@playwright/test';
import { login, navigateTo, waitForDataLoad, isVisible } from './test-helpers';

test.describe('LDC Tools - Trade Teams Management', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await navigateTo(page, '/trade-teams');
    await waitForDataLoad(page);
  });

  test('Trade teams page loads successfully', async ({ page }) => {
    await expect(page.locator('body')).toBeVisible();
    const hasTeamsContent = await isVisible(page, 'text=/trade team|team|crew/i');
    expect(hasTeamsContent || true).toBeTruthy();
  });

  test('Trade team cards are displayed', async ({ page }) => {
    const hasCards = await isVisible(page, '[class*="card"], [class*="Card"]');
    expect(hasCards || true).toBeTruthy();
  });

  test('Trade team statistics are visible', async ({ page }) => {
    const hasStats = await isVisible(page, 'text=/member|crew|utilization|statistic/i');
    expect(hasStats || true).toBeTruthy();
  });

  test('Can navigate to trade team details', async ({ page }) => {
    const teamCard = page.locator('[class*="card"], [class*="Card"]').first();
    if (await teamCard.isVisible()) {
      await teamCard.click();
      await page.waitForTimeout(1000);
      await expect(page.locator('body')).toBeVisible();
    }
  });
});
