import { devices, test } from '@playwright/test';
import { initHappo } from '@shared/e2e/utils';
import { LandingPOM, UtilsPOM } from 'e2e/poms';

initHappo();

test.use({
  ...devices['iPhone 14'],
});

test.describe('RecSpace landing page (Mobile)', () => {
  test('RecSpace landing page renders correctly', async ({ page }) => {
    const landing = new LandingPOM(page);
    const utils = new UtilsPOM(page);

    await landing.route();

    await utils.accessibility();

    await utils.screenshotMobile('RecSpace landing page', 'mobile');
  });
});
