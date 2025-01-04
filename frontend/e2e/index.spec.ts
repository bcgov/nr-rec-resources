import { test } from '@playwright/test';
import happoPlaywright from 'happo-playwright';
import { searchPage } from 'e2e/pages/search';
import { recResourcePage } from 'e2e/pages/recResource';
import { analyzeAccessibility } from 'e2e/utils';

test.beforeAll(async () => {
  await happoPlaywright.init();
});

test.afterAll(async () => {
  await happoPlaywright.finish();
});

test.describe.parallel('RST', () => {
  test('Search Page', async ({ page }) => {
    await searchPage(page);

    const pageContent = page.locator('html');

    await happoPlaywright.screenshot(page, pageContent, {
      component: 'Search page',
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
