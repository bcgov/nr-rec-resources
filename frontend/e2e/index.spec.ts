import { test } from '@playwright/test';
import { dashboard_page } from './pages/dashboard';
import happoPlaywright from 'happo-playwright';

test.beforeEach(async ({ context }) => {
  await happoPlaywright.init(context);
});

test.afterEach(async () => {
  await happoPlaywright.finish();
});

test.describe.parallel('RST', () => {
  test('Landing Page', async ({ page }) => {
    await dashboard_page(page);

    const pageContent = page.locator('html');

    await happoPlaywright.screenshot(page, pageContent, {
      component: 'Landing page',
      variant: 'default',
    });
  });
});
