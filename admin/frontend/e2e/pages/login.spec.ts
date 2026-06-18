import { test } from '@playwright/test';
import { initHappo } from '@shared/e2e/utils';
import { LandingPOM, LayoutPOM, UtilsPOM } from 'e2e/poms';

initHappo();

test.describe('RecSpace landing page', () => {
  test('RecSpace landing page renders correctly', async ({ page }) => {
    const landing = new LandingPOM(page);
    const layout = new LayoutPOM(page);
    const utils = new UtilsPOM(page);

    await landing.route();

    await layout.verifyHeaderContent();
    await landing.verifyLandingPageContent();

    // color-contrast: text-white-50 subtitle in LoginPanel is a known UX-accepted tradeoff
    await utils.accessibility(['color-contrast']);

    await utils.screenshot('RecSpace landing page', 'default');
  });
});
