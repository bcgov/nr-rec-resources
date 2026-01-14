import { test } from '@playwright/test';
import { initHappo } from '@shared/e2e/utils';
import { AuthPOM, LandingPOM, LayoutPOM, UtilsPOM } from 'e2e/poms';

initHappo();

test.describe('RecSpace landing page', () => {
  test('RecSpace landing page renders correctly', async ({ page }) => {
    const landing = new LandingPOM(page);
    const layout = new LayoutPOM(page);
    const auth = new AuthPOM(page);
    const utils = new UtilsPOM(page);

    await landing.route();

    await auth.loginAsAdmin();

    await layout.verifyHeaderContent();
    await landing.verifyLandingPageContent();

    await utils.accessibility();

    await utils.screenshot('RecSpace landing page', 'default');
  });
});
