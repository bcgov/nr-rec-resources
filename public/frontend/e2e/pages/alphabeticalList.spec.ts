import { test } from '@playwright/test';
import { initHappo } from '@shared/e2e/utils';
import { AlphabeticalListPOM, LayoutPOM, UtilsPOM } from 'e2e/poms';

initHappo();

test.describe('A-Z list page', () => {
  test('A-Z list page renders correctly', async ({ page }) => {
    const alphabeticalList = new AlphabeticalListPOM(page);
    const layout = new LayoutPOM(page);
    const utils = new UtilsPOM(page);

    await alphabeticalList.route();

    await layout.verifyHeaderContent();
    await layout.verifyFooterContent();
    await alphabeticalList.verifyAlphabeticalListPageContent();
    await alphabeticalList.verifyAlphabeticalNavigation();

    await utils.screenshot('A-Z list page', 'default');
  });
});
