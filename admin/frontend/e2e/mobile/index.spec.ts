import { devices, test } from '@playwright/test';
import { getAdminStorageState } from '@shared/config/playwright.base.config';
import { initHappo } from '@shared/e2e/utils';
import { LandingPOM, UtilsPOM } from 'e2e/poms';

initHappo();

test.use({
  ...devices['iPhone 14'],
  storageState: getAdminStorageState(),
});

test.describe('RecSpace landing page (Mobile)', () => {
  test('RecSpace landing page renders correctly', async ({ page }) => {
    const landing = new LandingPOM(page);
    const utils = new UtilsPOM(page);

    await landing.route();

    await landing.verifyLandingPageContentMobile();

    await utils.accessibility();

    await utils.screenshotMobile('RecSpace landing page', 'mobile');
  });
});
