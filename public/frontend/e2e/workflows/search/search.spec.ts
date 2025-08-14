import { test } from '@playwright/test';
import { initHappo } from '@shared/e2e/utils';
import {
  FilterPOM,
  RecreationResourcePOM,
  SearchPOM,
  UtilsPOM,
} from 'e2e/poms';
import { RecResourceType } from 'e2e/enum/recResource';

initHappo();

test.describe('Search for a recreation site or trail workflows', () => {
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

    await searchPage.searchFor('summer');

    await utils.checkExpectedUrlParams('filter=summer&page=1');

    await searchPage.verifySearchResults('summer');

    await utils.clickLinkByText('Agur Lake');

    await recResourcePage.verifyRecResourceHeaderContent({
      rec_resource_id: 'REC1621',
      rec_resource_name: 'Agur Lake',
      rec_resource_type: RecResourceType.SITE,
      closest_community: 'Summerland',
    });
    await recResourcePage.verifyRecResourceSections();
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

  test('Search for a rec resource, and then click the clear search button', async ({
    page,
  }) => {
    const filter = new FilterPOM(page);
    const searchPage = new SearchPOM(page);
    const utils = new UtilsPOM(page);

    await searchPage.route();

    await filter.verifyInitialFilterMenu();

    await searchPage.verifyInitialResults();

    await searchPage.searchFor('10k');

    await utils.checkExpectedUrlParams('filter=10k&page=1');

    await searchPage.clearSearchInput();

    await searchPage.verifyInitialResults();

    await utils.checkExpectedUrlParams('page=1');
  });
});
