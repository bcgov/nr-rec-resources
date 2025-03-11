import { test } from '@playwright/test';
import { initHappo } from 'e2e/utils';
import { FilterPOM, LandingPOM, LayoutPOM, SearchPOM } from 'e2e/poms';

initHappo();

test.describe('Search for a recreation site or trail workflows', () => {
  test('Navigate to the search page and use the search bar to find a rec resource', async ({
    page,
  }) => {
    const filter = new FilterPOM(page);
    const landingPage = new LandingPOM(page);
    const layout = new LayoutPOM(page);
    const searchPage = new SearchPOM(page);

    await landingPage.route();

    await layout.verifyHeader();
    await layout.verifyFooter();

    await layout.clickFindARecreationSiteOrTrail();

    await filter.verifyInitialFilterMenu();
    await searchPage.verifyInitialResults();

    await searchPage.searchFor('Tofino');
  });
});
