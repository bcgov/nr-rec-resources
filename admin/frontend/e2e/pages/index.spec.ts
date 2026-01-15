import { test } from '@playwright/test';
import { getAdminStorageState } from '@shared/config/playwright.base.config';
import { initHappo } from '@shared/e2e/utils';
import { LandingPOM, LayoutPOM, UtilsPOM } from 'e2e/poms';

initHappo();

test.use({ storageState: getAdminStorageState() });

test.describe('RecSpace landing page', () => {
  test('RecSpace landing page renders correctly', async ({ page }) => {
    const landing = new LandingPOM(page);
    const layout = new LayoutPOM(page);
    const utils = new UtilsPOM(page);

    await landing.route();

    await layout.verifyHeaderContent();
    await landing.verifyLandingPageContent();

    await utils.accessibility();

    await utils.screenshot('RecSpace landing page', 'default');
  });
});
