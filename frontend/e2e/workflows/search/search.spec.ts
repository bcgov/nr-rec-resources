import { test } from '@playwright/test';
import { initHappo } from 'e2e/utils';
import {
  FilterPOM,
  LandingPOM,
  LayoutPOM,
  RecreationResourcePOM,
  SearchPOM,
  UtilsPOM,
} from 'e2e/poms';
import { RecResourceType } from 'e2e/enum/recResource';

initHappo();

test.describe('Search for a recreation site or trail workflows', () => {
  test('Navigate to the search page, use the search bar to find a rec resource by name and navigate to that page', async ({
    page,
  }) => {
    const filter = new FilterPOM(page);
    const landingPage = new LandingPOM(page);
    const layout = new LayoutPOM(page);
    const recResourcePage = new RecreationResourcePOM(page);
    const searchPage = new SearchPOM(page);
    const utils = new UtilsPOM(page);

    await landingPage.route();

    await layout.verifyHeaderContent();
    await layout.verifyFooterContent();

    await layout.clickFindARecreationSiteOrTrail();

    await filter.verifyInitialFilterMenu();

    await searchPage.verifyInitialResults();

    await searchPage.searchFor('10k');

    await utils.checkExpectedUrlParams('filter=10k&page=1');

    await searchPage.verifySearchResults('10k');

    await utils.clickLinkByText('10k cabin');

    await recResourcePage.verifyRecResourceHeaderContent({
      rec_resource_id: 'REC160773',
      rec_resource_name: '10k Cabin',
      rec_resource_type: RecResourceType.SITE,
      closest_community: 'Merritt',
    });
  });

  test('Use the search bar to find a rec resource by closest community and navigate to that page', async ({
    page,
  }) => {
    const filter = new FilterPOM(page);
    const recResourcePage = new RecreationResourcePOM(page);
    const searchPage = new SearchPOM(page);
    const utils = new UtilsPOM(page);

    await searchPage.route();

    await filter.verifyInitialFilterMenu();

    await searchPage.verifyInitialResults();

    await searchPage.searchFor('summerland');

    await utils.checkExpectedUrlParams('filter=summerland&page=1');

    await searchPage.verifySearchResults('summerland');

    await utils.clickLinkByText('Agur Lake');

    await recResourcePage.verifyRecResourceHeaderContent({
      rec_resource_id: 'REC1621',
      rec_resource_name: 'Agur Lake',
      rec_resource_type: RecResourceType.SITE,
      closest_community: 'Summerland',
    });
  });

  test("Use the search bar to search for a rec resource that doesn't exist", async ({
    page,
  }) => {
    const filter = new FilterPOM(page);
    const searchPage = new SearchPOM(page);

    await searchPage.route();

    await filter.verifyInitialFilterMenu();

    await searchPage.verifyInitialResults();

    await searchPage.searchFor('not a real place', false);

    await searchPage.waitForNoResults();
  });

  test('Use the load more button to view more results', async ({ page }) => {
    const filter = new FilterPOM(page);
    const searchPage = new SearchPOM(page);
    const utils = new UtilsPOM(page);

    await searchPage.route();

    await filter.verifyInitialFilterMenu();
    await searchPage.verifyInitialResults();

    await searchPage.recResourceCardCount(10);

    await searchPage.clickLoadMore();

    await searchPage.recResourceCardCount(20);

    await utils.checkExpectedUrlParams('page=2');

    await searchPage.clickLoadMore();

    await utils.checkExpectedUrlParams('page=3');

    await searchPage.recResourceCardCount(30);
  });

  test('Use the load previous button to view previous results', async ({
    page,
  }) => {
    const filter = new FilterPOM(page);
    const searchPage = new SearchPOM(page);
    const utils = new UtilsPOM(page);

    await searchPage.route('?page=2');

    await filter.verifyInitialFilterMenu();

    await searchPage.recResourceCardCount(10);

    await searchPage.clickLoadPrevious();

    await utils.checkExpectedUrlParams('page=2');

    await searchPage.recResourceCardCount(20);
  });
});
