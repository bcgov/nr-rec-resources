import { test } from '@playwright/test';
import { initHappo } from 'e2e/utils';
import { LayoutPOM, RecreationResourcePOM } from 'e2e/poms';

initHappo();

test.describe('Recreation Resource page', () => {
  test('Recreation Resource Page', async ({ page }) => {
    const layout = new LayoutPOM(page);
    const recResourcePage = new RecreationResourcePOM(page);

    await recResourcePage.route();

    await layout.verifyHeader();
    await layout.verifyFooter();

    await recResourcePage.removeRecreationResourceFeatureMap();

    await recResourcePage.verifyPdfDocLinks();

    await layout.screenshot('Recreation Resource page', 'default');

    await layout.accessibility();
  });
});
