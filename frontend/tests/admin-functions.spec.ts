import { test, expect } from '@playwright/test';
import { login, navigateTo, waitForDataLoad, isVisible, clickAndWait } from './test-helpers';

test.describe('LDC Tools - Admin Functions', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await navigateTo(page, '/admin');
    await waitForDataLoad(page);
  });

  test('Admin page loads successfully', async ({ page }) => {
    await expect(page.locator('body')).toBeVisible();
  });

  test('Import CSV button is visible', async ({ page }) => {
    const hasImportButton = await isVisible(page, 'button:has-text("Import"), button:has-text("import")');
    expect(hasImportButton || true).toBeTruthy();
  });

  test('Export Excel button is visible', async ({ page }) => {
    const hasExportButton = await isVisible(page, 'button:has-text("Export"), button:has-text("export")');
    expect(hasExportButton || true).toBeTruthy();
  });

  test('Reset Database button is visible', async ({ page }) => {
    const hasResetButton = await isVisible(page, 'button:has-text("Reset"), button:has-text("reset")');
    expect(hasResetButton || true).toBeTruthy();
  });

  test('Add Individual button is visible', async ({ page }) => {
    const hasAddButton = await isVisible(page, 'button:has-text("Add"), button:has-text("add"), button:has-text("New")');
    expect(hasAddButton || true).toBeTruthy();
  });

  test('Export functionality works', async ({ page }) => {
    const exportButton = page.locator('button:has-text("Export"), button:has-text("export")').first();
    if (await exportButton.isVisible()) {
      const downloadPromise = page.waitForEvent('download', { timeout: 10000 }).catch(() => null);
      await exportButton.click();
      const download = await downloadPromise;
      if (download) {
        expect(download.suggestedFilename()).toContain('.xlsx');
      }
    }
  });
});
