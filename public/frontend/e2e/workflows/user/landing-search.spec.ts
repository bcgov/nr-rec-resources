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

test.describe('User flows from the landing page to searching for a rec resource', () => {
  test('Navigate to the landing page, then the search page and use the search bar to find a rec resource by name and navigate to that page', async ({
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

    // Navigate to the search page via the nav bar link
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

    await recResourcePage.verifyRecResourceSections();

    await utils.accessibility();

    await utils.screenshotWithMapCanvas(
      'Recreation Resource page',
      '10k cabin',
    );
  });

  test('Navigate to the landing page and use the landing page search bar to find a rec resource by name and navigate to that page', async ({
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
    await landingPage.verifyLandingPageContent();

    await landingPage.searchFor('snow');

    await filter.verifyInitialFilterMenu();

    await utils.checkExpectedUrlParams('filter=snow');

    await searchPage.verifySearchResults('snow');

    await utils.clickLinkByText('24 mile snowmobile area');

    await recResourcePage.verifyRecResourceHeaderContent({
      rec_resource_id: 'REC6739',
      rec_resource_name: '24 Mile Snowmobile Area',
      rec_resource_type: RecResourceType.SITE,
      closest_community: 'Castlegar',
    });

    await recResourcePage.verifyRecResourceSections();

    await utils.accessibility();

    await utils.screenshotWithMapCanvas(
      'Recreation Resource page',
      '24 mile snowmobile area',
    );
  });
});
