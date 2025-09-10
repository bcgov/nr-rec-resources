import { test } from '@playwright/test';
import { initHappo } from '@shared/e2e/utils';
import { LandingPOM, LayoutPOM, UtilsPOM } from 'e2e/poms';

initHappo();

test.describe('Recreation Sites and Trails landing page', () => {
  test('Landing page renders correctly', async ({ page }) => {
    const landing = new LandingPOM(page);
    const layout = new LayoutPOM(page);
    const utils = new UtilsPOM(page);

    await landing.route();

    await layout.verifyHeaderContent();
    await layout.verifyFooterContent();
    await landing.verifyLandingPageContent();

    await utils.accessibility();

    await utils.screenshot(
      'Recreation Sites and Trails landing page',
      'default',
    );
  });
});
