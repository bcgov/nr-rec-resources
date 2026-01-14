import { test } from '@playwright/test';
import { initHappo } from '@shared/e2e/utils';
import { AuthPOM, LandingPOM } from 'e2e/poms';

initHappo();

test.describe('Authentication', () => {
  test('Admin user can login successfully', async ({ page }) => {
    const landing = new LandingPOM(page);
    const auth = new AuthPOM(page);

    await landing.route();

    await auth.loginAsAdmin();
    await auth.verifyLoggedIn();
  });

  test('Viewer user can login successfully', async ({ page }) => {
    const landing = new LandingPOM(page);
    const auth = new AuthPOM(page);

    await landing.route();

    await auth.loginAsViewer();
    await auth.verifyLoggedIn();
  });
});
