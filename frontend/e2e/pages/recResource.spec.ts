import { test } from '@playwright/test';
import { initHappo } from 'e2e/utils';
import { LayoutPOM, RecreationResourcePOM, UtilsPOM } from 'e2e/poms';

initHappo();

test.describe('Recreation Resource page', () => {
  test('Recreation Resource Page', async ({ page }) => {
    const layout = new LayoutPOM(page);
    const recResourcePage = new RecreationResourcePOM(page);
    const utils = new UtilsPOM(page);

    await recResourcePage.route();

    await layout.verifyHeaderContent();
    await layout.verifyFooterContent();

    await recResourcePage.removeRecreationResourceFeatureMap();

    await recResourcePage.verifyPdfDocLinks();

    await utils.screenshot('Recreation Resource page', 'default');

    await utils.accessibility();
  });
});
