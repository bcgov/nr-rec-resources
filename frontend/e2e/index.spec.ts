import { test } from '@playwright/test';
import happoPlaywright from 'happo-playwright';
import { dashboardPage } from 'e2e/pages/dashboard';
import { recResourcePage } from 'e2e/pages/recResource';
import { analyzeAccessibility } from 'e2e/utils';

test.beforeEach(async ({ context }) => {
  await happoPlaywright.init(context);
});

test.afterEach(async () => {
  await happoPlaywright.finish();
});

test.describe.parallel('RST', () => {
  test('Landing Page', async ({ page }) => {
    await dashboardPage(page);

    const pageContent = page.locator('html');

    await happoPlaywright.screenshot(page, pageContent, {
      component: 'Landing page',
      variant: 'default',
    });

    await analyzeAccessibility(page);
  });

  test('Recreation Resource Page', async ({ page }) => {
    await recResourcePage(page);

    const pageContent = page.locator('html');

    await happoPlaywright.screenshot(page, pageContent, {
      component: 'Recreation Resource page',
      variant: 'default',
    });

    await analyzeAccessibility(page);
  });
});
