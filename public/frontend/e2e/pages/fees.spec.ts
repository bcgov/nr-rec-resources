import { test } from '@playwright/test';
import { initHappo } from '@shared/e2e/utils';
import { LayoutPOM, RecreationResourcePOM, UtilsPOM } from 'e2e/poms';

initHappo();

test.describe('Recreation Resource - Fees section', () => {
  test('renders fees content and is reachable from the page menu', async ({
    page,
  }) => {
    // REC203900 has fixture data with one overnight fee and one
    // additional fee, so we should see both sub-section headings.
    const layout = new LayoutPOM(page);
    const recResourcePage = new RecreationResourcePOM(page);
    const utils = new UtilsPOM(page);

    await recResourcePage.route('REC203900');

    await layout.verifyHeaderContent();
    await layout.verifyFooterContent();

    await recResourcePage.verifyFeesSection(['overnight', 'additional']);
    await recResourcePage.verifyFeesNavigation();

    await utils.accessibility();
    await utils.screenshot('Fees section', 'multiple-subsections');
  });

  test('renders only the additional fees sub-section when other fees are absent', async ({
    page,
  }) => {
    // REC203239 (default resource) only has a single additional fee in
    // the fixture data, so the Overnight and Trail headings must not
    // appear and there should be no bulk toggle button.
    const recResourcePage = new RecreationResourcePOM(page);
    const utils = new UtilsPOM(page);

    await recResourcePage.route('REC203239');

    await recResourcePage.verifyFeesSection(['additional']);
    await recResourcePage.verifyFeesNavigation();

    await utils.accessibility();
    await utils.screenshot('Fees section', 'single-additional');
  });
});
