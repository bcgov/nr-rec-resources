import { test } from '@playwright/test';
import { initHappo } from 'e2e/utils';
import { FilterPOM, LayoutPOM, SearchPOM, UtilsPOM } from 'e2e/poms';

initHappo();

test.describe('Search page', () => {
  test('Search Page renders correctly', async ({ page }) => {
    const filter = new FilterPOM(page);
    const layout = new LayoutPOM(page);
    const searchPage = new SearchPOM(page);
    const utils = new UtilsPOM(page);

    await searchPage.route();

    await layout.verifyHeaderContent();
    await layout.verifyFooterContent();

    await filter.verifyInitialFilterMenu();
    await searchPage.verifyInitialResults();

    await utils.accessibility();

    // The search map is in the DOM on the search page which causes Happo screenshots to fail
    await utils.removeVectorFeatureMap();
    await utils.screenshot('Search page', 'default');
  });
});
