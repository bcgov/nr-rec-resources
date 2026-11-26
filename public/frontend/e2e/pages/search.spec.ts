import { expect, test } from '@playwright/test';
import { initHappo } from '@shared/e2e/utils';
import { FilterPOM, LayoutPOM, SearchPOM, UtilsPOM } from 'e2e/poms';

initHappo();

// Generous timeout for the test env, which can be slow to render on CI
const PAGE_READY_TIMEOUT = 30_000;

test.describe('Search page', () => {
  test('Search Page renders correctly', async ({ page }) => {
    const filter = new FilterPOM(page);
    const layout = new LayoutPOM(page);
    const searchPage = new SearchPOM(page);
    const utils = new UtilsPOM(page);

    await searchPage.route();

    // Wait until the app has actually rendered before running assertions
    await page.waitForLoadState('networkidle');
    await expect(page.locator('header:not(main header)')).toBeVisible({
      timeout: PAGE_READY_TIMEOUT,
    });

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
    await page.waitForLoadState('networkidle');
    await searchPage.showMapView();
    await searchPage.closeMapDisclaimer();

    // Need to add screenshot test once that is supported for map views
  });
});
