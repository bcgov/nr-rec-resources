import { devices, test } from '@playwright/test';
import { initHappo } from '@shared/e2e/utils';
import { LayoutPOM, RecreationResourcePOM, UtilsPOM } from 'e2e/poms';

initHappo();

test.use({
  ...devices['iPhone 14'],
});

test.describe('Recreation Resource page (Mobile)', () => {
  test('Recreation Resource Page renders correctly', async ({ page }) => {
    const layout = new LayoutPOM(page);
    const recResourcePage = new RecreationResourcePOM(page);
    const utils = new UtilsPOM(page);

    await recResourcePage.route();

    await layout.verifyHeaderContent();
    await layout.verifyFooterContent();
    await recResourcePage.verifySectionsExistInPageMenu();
    await recResourcePage.verifyPdfDocLinks();
    await utils.accessibility();
    await utils.screenshot('Recreation Resource page', 'mobile');
  });
});
