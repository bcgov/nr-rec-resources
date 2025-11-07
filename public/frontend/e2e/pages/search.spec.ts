import { test } from '@playwright/test';
import { initHappo } from '@shared/e2e/utils';
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

    await utils.screenshot('Search page', 'default');
  });

  test('Search map view renders correctly', async ({ page }) => {
    const searchPage = new SearchPOM(page);

    await searchPage.route();
    await searchPage.showMapView();
    await searchPage.closeMapDisclaimer();

    // Need to add screenshot test once that is supported for map views
  });
});
