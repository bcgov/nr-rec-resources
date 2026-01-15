import { test } from '@playwright/test';
import {
  getAdminStorageState,
  getViewerStorageState,
} from '@shared/config/playwright.base.config';
import { initHappo } from '@shared/e2e/utils';
import { AuthPOM, LandingPOM } from 'e2e/poms';

initHappo();

test.describe('Authentication', () => {
  test.describe('Admin', () => {
    test.use({ storageState: getAdminStorageState() });

    test('Admin user is logged in', async ({ page }) => {
      const landing = new LandingPOM(page);
      const auth = new AuthPOM(page);

      await landing.route();
      await auth.verifyLoggedIn();
    });
  });

  test.describe('Viewer', () => {
    test.use({ storageState: getViewerStorageState() });

    test('Viewer user is logged in', async ({ page }) => {
      const landing = new LandingPOM(page);
      const auth = new AuthPOM(page);

      await landing.route();
      await auth.verifyLoggedIn();
    });
  });
});
