import { devices, test } from '@playwright/test';
import { initHappo } from '@shared/e2e/utils';
import { AlphabeticalListPOM, LayoutPOM, UtilsPOM } from 'e2e/poms';

initHappo();

test.use({
  ...devices['iPhone 14'],
});

test.describe('A-Z list page (Mobile)', () => {
  test('Mobile A-Z list page renders correctly', async ({ page }) => {
    const alphabeticalList = new AlphabeticalListPOM(page);
    const layout = new LayoutPOM(page);
    const utils = new UtilsPOM(page);

    await alphabeticalList.route();

    await layout.verifyHeaderContent();
    await layout.verifyFooterContent();
    await alphabeticalList.verifyAlphabeticalListPageContent();
    await alphabeticalList.verifyAlphabeticalNavigation();

    await utils.screenshotMobile('A-Z list page', 'mobile');
  });
});
