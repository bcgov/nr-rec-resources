import { test } from '@playwright/test';
import { initHappo } from 'e2e/utils';
import { FilterPOM, LayoutPOM, SearchPOM } from 'e2e/poms';

initHappo();

test.describe('Search page', () => {
  test('Search Page renders correctly', async ({ page }) => {
    const filter = new FilterPOM(page);
    const layout = new LayoutPOM(page);
    const searchPage = new SearchPOM(page);

    await searchPage.route();

    await layout.verifyHeader();
    await layout.verifyFooter();

    await filter.verifyInitialFilterMenu();
    await searchPage.verifyInitialResults();

    await layout.screenshot('Search page', 'default');

    await layout.accessibility();
  });
});
