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
import { Status, RecResourceType } from 'e2e/enum/recResource';

initHappo();

test.describe('Search for a recreation site or trail workflows', () => {
  test('Navigate to the search page, use the search bar to find a rec resource and navigate to that page', async ({
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

    await searchPage.resultsCount(1);

    await utils.clickLinkByText('Alpine Lake Trail');

    await recResourcePage.verifyRecResourceHeaderContent({
      rec_resource_id: 'REC1163',
      rec_resource_name: 'Alpine Lake Trail',
      rec_resource_type: RecResourceType.TRAIL,
      closest_community: 'Trout Creek',
      status: Status.OPEN,
    });
  });

  test('Navigate to the search page, use the load more button to view more results', async ({
    page,
  }) => {
    const filter = new FilterPOM(page);
    const searchPage = new SearchPOM(page);

    await searchPage.route();

    await filter.verifyInitialFilterMenu();
    await searchPage.verifyInitialResults();

    await searchPage.verifyRecResourceCardCount(10);

    await searchPage.clickLoadMore();

    await searchPage.verifyRecResourceCardCount(20);

    await searchPage.verifyRecResourceCardContent({
      rec_resource_id: 'REC4519',
      rec_resource_name: 'Aileen Lake',
      rec_resource_type: RecResourceType.TRAIL,
      closest_community: 'Winfield',
      status: Status.OPEN,
    });

    await searchPage.clickLoadMore();

    await searchPage.verifyRecResourceCardCount(30);

    await searchPage.verifyRecResourceCardContent({
      rec_resource_id: 'REC265901',
      rec_resource_name: 'Aberdeen Columns Trail',
      rec_resource_type: RecResourceType.INTERPRETIVE,
      closest_community: 'Lavington',
      status: Status.OPEN,
    });
  });

  test('Navigate to the search page, use the load previous button to view previous results', async ({
    page,
  }) => {
    const filter = new FilterPOM(page);
    const searchPage = new SearchPOM(page);

    await searchPage.route('?page=2');

    await filter.verifyInitialFilterMenu();

    await searchPage.verifyRecResourceCardCount(10);

    await searchPage.clickLoadPrevious();

    await searchPage.verifyRecResourceCardContent({
      rec_resource_id: 'REC204117',
      rec_resource_name: '0 k snowmobile parking lot',
      rec_resource_type: RecResourceType.INTERPRETIVE,
      closest_community: 'Merritt',
      status: Status.OPEN,
    });
  });
});
