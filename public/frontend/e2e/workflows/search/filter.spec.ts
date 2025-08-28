import { test } from '@playwright/test';
import { initHappo } from 'e2e/utils';
import { FilterPOM, SearchPOM, UtilsPOM } from 'e2e/poms';
import { RecResourceType } from 'e2e/enum/recResource';

initHappo();

test.describe('Search page filter menu workflows', () => {
  test('Use the filter menu to filter results by district', async ({
    page,
  }) => {
    const filter = new FilterPOM(page);
    const searchPage = new SearchPOM(page);
    const utils = new UtilsPOM(page);

    await searchPage.route();

    await filter.verifyInitialFilterMenu();

    await filter.toggleFilterOn(filter.districtFilters, 'Chilliwack');

    await utils.checkExpectedUrlParams('district=RDCK');

    await searchPage.waitForResults();
  });

  test('Use the filter menu to filter by multiple districts', async ({
    page,
  }) => {
    const filter = new FilterPOM(page);
    const searchPage = new SearchPOM(page);
    const utils = new UtilsPOM(page);

    await searchPage.route();

    await filter.verifyInitialFilterMenu();

    await filter.toggleFilterOn(filter.districtFilters, 'Chilliwack');

    await filter.clickShowAllFilters(filter.districtFilters);

    await filter.toggleFilterOn(filter.districtFilters, 'Kamloops');

    await filter.toggleFilterOn(filter.districtFilters, 'Okanagan');

    await filter.toggleFilterOn(filter.districtFilters, 'Squamish');

    await utils.checkExpectedUrlParams('district=RDCK_RDKA_RDOS_RDSQ');

    await searchPage.waitForResults();
  });

  test('Use the filter menu to filter by rec resource type', async ({
    page,
  }) => {
    const filter = new FilterPOM(page);
    const searchPage = new SearchPOM(page);
    const utils = new UtilsPOM(page);

    await searchPage.route();

    await filter.verifyInitialFilterMenu();

    await filter.verifyFilterResultsListener({ type: ['Recreation trail'] });

    await filter.toggleFilterOn(filter.typeFilters, RecResourceType.TRAIL);

    await utils.checkExpectedUrlParams('type=RTR');

    await searchPage.waitForResults();
  });

  test('Use the filter menu to filter by multiple rec resource types', async ({
    page,
  }) => {
    const filter = new FilterPOM(page);
    const searchPage = new SearchPOM(page);
    const utils = new UtilsPOM(page);

    await searchPage.route();

    await filter.verifyInitialFilterMenu();

    await filter.verifyFilterResultsListener({ type: ['Recreation trail'] });

    await filter.toggleFilterOn(filter.typeFilters, RecResourceType.TRAIL);

    await searchPage.waitForResults();

    await filter.verifyFilterResultsListener({
      type: ['Recreation trail', 'Recreation site'],
    });

    await filter.toggleFilterOn(filter.typeFilters, RecResourceType.SITE);

    await utils.checkExpectedUrlParams('type=RTR_SIT');

    await searchPage.waitForResults();
  });

  test('Use the filter menu to filter by things to do', async ({ page }) => {
    const filter = new FilterPOM(page);
    const searchPage = new SearchPOM(page);
    const utils = new UtilsPOM(page);

    await searchPage.route();

    await filter.verifyInitialFilterMenu();

    await filter.verifyFilterResultsListener({ activities: ['Camping'] });

    await filter.toggleFilterOn(filter.thingsToDoFilters, 'Camping');

    await utils.checkExpectedUrlParams('activities=32');

    await searchPage.waitForResults();
  });

  test('Use the filter menu to filter by multiple things to do', async ({
    page,
  }) => {
    const filter = new FilterPOM(page);
    const searchPage = new SearchPOM(page);
    const utils = new UtilsPOM(page);

    await searchPage.route();

    await filter.verifyInitialFilterMenu();

    await filter.toggleFilterOn(filter.thingsToDoFilters, 'Angling');

    await filter.toggleFilterOn(filter.thingsToDoFilters, 'Camping');

    await filter.clickShowAllFilters(filter.thingsToDoFilters);

    await filter.verifyFilterResultsListener({
      activities: ['Angling', 'Camping', 'Canoeing'],
    });

    await filter.toggleFilterOn(filter.thingsToDoFilters, 'Canoeing');

    await utils.checkExpectedUrlParams('activities=1_32_3');

    await searchPage.waitForResults();
  });

  test('Use the filter menu to filter by Facilities', async ({ page }) => {
    const filter = new FilterPOM(page);
    const searchPage = new SearchPOM(page);
    const utils = new UtilsPOM(page);

    await searchPage.route();

    await filter.verifyInitialFilterMenu();

    await filter.toggleFilterOn(filter.facilitiesFilters, 'Toilets');

    await utils.checkExpectedUrlParams('facilities=toilet');

    await searchPage.waitForResults();
  });

  test('Use the filter menu to filter by multiple Facilities', async ({
    page,
  }) => {
    const filter = new FilterPOM(page);
    const searchPage = new SearchPOM(page);
    const utils = new UtilsPOM(page);

    await searchPage.route();

    await filter.verifyInitialFilterMenu();

    await filter.toggleFilterOn(filter.facilitiesFilters, 'Toilets');

    await filter.toggleFilterOn(filter.facilitiesFilters, 'Tables');

    await utils.checkExpectedUrlParams('facilities=toilet_table');

    await searchPage.waitForResults();
  });

  test('Use the filter menu to filter by Access Type', async ({ page }) => {
    const filter = new FilterPOM(page);
    const searchPage = new SearchPOM(page);
    const utils = new UtilsPOM(page);

    await searchPage.route();

    await filter.verifyInitialFilterMenu();

    await filter.toggleFilterOn(filter.accessTypeFilters, 'Road access');

    await utils.checkExpectedUrlParams('access=R');

    await searchPage.waitForResults();
  });

  test('Use the filter menu to filter by multiple Access Types', async ({
    page,
  }) => {
    const filter = new FilterPOM(page);
    const searchPage = new SearchPOM(page);
    const utils = new UtilsPOM(page);

    await searchPage.route();

    await filter.verifyInitialFilterMenu();

    await filter.toggleFilterOn(filter.accessTypeFilters, 'Boat-in access');

    await filter.toggleFilterOn(filter.accessTypeFilters, 'Fly-in access');

    await searchPage.waitForResults();

    await filter.toggleFilterOn(filter.accessTypeFilters, 'Road access');

    await searchPage.waitForResults();

    await filter.toggleFilterOn(filter.accessTypeFilters, 'Trail access');

    await utils.checkExpectedUrlParams('access=B_F_R_T');

    await searchPage.waitForResults();
  });

  test('Use the filter menu to filter by multiple filter types', async ({
    page,
  }) => {
    const filter = new FilterPOM(page);
    const searchPage = new SearchPOM(page);
    const utils = new UtilsPOM(page);

    await searchPage.route();

    await filter.verifyInitialFilterMenu();

    await filter.toggleFilterOn(filter.districtFilters, 'Chilliwack');

    await filter.clickShowAllFilters(filter.districtFilters);

    await filter.toggleFilterOn(filter.districtFilters, 'Kamloops');

    await filter.toggleFilterOn(filter.districtFilters, 'Okanagan');

    await filter.toggleFilterOn(filter.typeFilters, RecResourceType.SITE);

    await filter.toggleFilterOn(filter.facilitiesFilters, 'Toilets');

    await filter.verifyFilterResultsListener({
      type: ['Recreation site'],
    });

    await filter.toggleFilterOn(filter.accessTypeFilters, 'Road access');

    await searchPage.waitForResults();

    await utils.checkExpectedUrlParams(
      'district=RDCK_RDKA_RDOS&page=1&type=SIT&facilities=toilet&access=R',
    );

    await utils.removeVectorFeatureMap();
    await utils.screenshot(
      'Search page with multiple filters applied',
      'default',
    );

    await utils.accessibility();
  });

  test('Use the Clear Filters button to clear a single filter', async ({
    page,
  }) => {
    const filter = new FilterPOM(page);
    const searchPage = new SearchPOM(page);
    const utils = new UtilsPOM(page);

    await searchPage.route();

    await filter.verifyInitialFilterMenu();

    await filter.toggleFilterOn(filter.districtFilters, 'Chilliwack');

    await utils.checkExpectedUrlParams('district=RDCK');

    await searchPage.waitForResults();

    await filter.clickClearFilters();

    await utils.checkExpectedUrlParams('page=1');

    await searchPage.waitForResults();
  });

  test('Use the Clear Filters button to clear all filters', async ({
    page,
  }) => {
    const filter = new FilterPOM(page);
    const searchPage = new SearchPOM(page);
    const utils = new UtilsPOM(page);

    await searchPage.route();

    await filter.verifyInitialFilterMenu();

    await filter.clickShowAllFilters(filter.districtFilters);

    await filter.toggleFilterOn(filter.districtFilters, 'Kamloops');

    await filter.toggleFilterOn(filter.typeFilters, RecResourceType.SITE);

    await filter.toggleFilterOn(filter.accessTypeFilters, 'Road access');

    await utils.checkExpectedUrlParams(
      'district=RDKA&page=1&type=SIT&access=R',
    );

    await filter.clickClearFilters();

    await utils.checkExpectedUrlParams('');

    await searchPage.waitForResults();
  });
});
