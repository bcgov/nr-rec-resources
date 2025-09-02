import { devices, test } from '@playwright/test';
import { initHappo } from '@shared/e2e/utils';
import { LayoutPOM, SearchPOM, UtilsPOM } from 'e2e/poms';

initHappo();

test.use({
  ...devices['iPhone 14'],
});

test.describe('Search page (Mobile)', () => {
  test('Search Page renders correctly', async ({ page }) => {
    const layout = new LayoutPOM(page);
    const searchPage = new SearchPOM(page);
    const utils = new UtilsPOM(page);

    await searchPage.route();

    await layout.verifyHeaderContent();
    await layout.verifyFooterContent();

    await searchPage.verifyInitialResults();

    await utils.accessibility();

    await utils.screenshot('Search page', 'mobile');
  });
});
