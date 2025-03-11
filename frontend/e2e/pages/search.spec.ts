import { test } from '@playwright/test';
import { initHappo } from 'e2e/utils';
import { LayoutPOM, SearchPOM } from 'e2e/poms';

initHappo();

test.describe('Search page', () => {
  test('Search Page renders correctly', async ({ page }) => {
    const layout = new LayoutPOM(page);
    const searchPage = new SearchPOM(page);

    await searchPage.route();

    await layout.verifyHeader();
    await layout.verifyFooter();

    await searchPage.verifyInitialResults();

    await layout.screenshot('Search page', 'default');

    await layout.accessibility();
  });
});
