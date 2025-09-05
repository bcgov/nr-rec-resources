import { devices, test } from '@playwright/test';
import { initHappo } from '@shared/e2e/utils';
import { LandingPOM, UtilsPOM } from 'e2e/poms';

initHappo();

test.use({
  ...devices['iPhone 14'],
});

test.describe('RST admin tool landing page (Mobile)', () => {
  test('RST admin tool landing page renders correctly', async ({ page }) => {
    const landing = new LandingPOM(page);
    const utils = new UtilsPOM(page);

    await landing.route();

    await utils.accessibility();

    await utils.screenshotMobile('RST Admin tool landing page', 'mobile');
  });
});
