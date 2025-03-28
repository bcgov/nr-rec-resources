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
import { RecResourceType, Status } from 'e2e/enum/recResource';

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

    await searchPage.searchFor('alpine');

    await searchPage.resultsCount(2);

    await utils.checkExpectedUrlParams('filter=alpine&page=1');

    await utils.clickLinkByText('Alpine Lake Trail');

    await recResourcePage.verifyRecResourceHeaderContent({
      rec_resource_id: 'REC1163',
      rec_resource_name: 'Alpine Lake Trail',
      rec_resource_type: RecResourceType.TRAIL,
      closest_community: 'Trout Creek',
      status: Status.OPEN,
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

    await searchPage.resultsCount(1);

    await utils.checkExpectedUrlParams('filter=summerland&page=1');

    await utils.clickLinkByText('Agur Lake');

    await recResourcePage.verifyRecResourceHeaderContent({
      rec_resource_id: 'REC1621',
      rec_resource_name: 'Agur Lake',
      rec_resource_type: RecResourceType.SITE,
      closest_community: 'Summerland',
      status: Status.CLOSED,
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

    await searchPage.resultsCount(0);
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
