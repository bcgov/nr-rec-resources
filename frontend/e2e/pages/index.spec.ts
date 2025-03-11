import { test } from '@playwright/test';
import { initHappo } from 'e2e/utils';
import { LandingPOM, LayoutPOM } from 'e2e/poms';

initHappo();

test.describe('Recreation Sites and Trails landing page', () => {
  test('Recreation Sites and Trails landing page renders correctly', async ({
    page,
  }) => {
    const landing = new LandingPOM(page);
    const layout = new LayoutPOM(page);

    await landing.route();

    await layout.verifyHeader();
    await layout.verifyFooter();

    await layout.screenshot(
      'Recreation Sites and Trails landing page',
      'default',
    );

    await layout.accessibility();
  });
});
