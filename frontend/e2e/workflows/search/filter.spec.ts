import { test } from '@playwright/test';
import { initHappo } from 'e2e/utils';
import { FilterPOM, SearchPOM, UtilsPOM } from 'e2e/poms';
import { RecResourceType, Status } from 'e2e/enum/recResource';

const TOTAL_RESULTS = 51;

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

    await searchPage.resultsCount(2);

    await searchPage.recResourceCardCount(2);

    await searchPage.verifyRecResourceCardContent({
      rec_resource_id: 'REC265446',
      rec_resource_name: 'Airy Area',
      rec_resource_type: RecResourceType.RESERVE,
      closest_community: 'Slocan',
      status: Status.CLOSED,
    });
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

    await searchPage.resultsCount(26);

    await searchPage.recResourceCardCount(10);
  });

  test('Use the filter menu to filter by rec resource type', async ({
    page,
  }) => {
    const filter = new FilterPOM(page);
    const searchPage = new SearchPOM(page);
    const utils = new UtilsPOM(page);

    await searchPage.route();

    await filter.verifyInitialFilterMenu();

    await filter.toggleFilterOn(filter.typeFilters, RecResourceType.TRAIL);

    await utils.checkExpectedUrlParams('type=RTR');

    await searchPage.resultsCount(18);

    await searchPage.recResourceCardCount(10);

    await searchPage.verifyRecResourceCardContent({
      rec_resource_id: 'REC6866',
      rec_resource_name: '1861 goldrush pack trail',
      rec_resource_type: RecResourceType.TRAIL,
      closest_community: 'Wells',
      status: Status.OPEN,
    });
  });

  test('Use the filter menu to filter by multiple rec resource types', async ({
    page,
  }) => {
    const filter = new FilterPOM(page);
    const searchPage = new SearchPOM(page);
    const utils = new UtilsPOM(page);

    await searchPage.route();

    await filter.verifyInitialFilterMenu();

    await filter.toggleFilterOn(filter.typeFilters, RecResourceType.TRAIL);

    await filter.toggleFilterOn(filter.typeFilters, RecResourceType.SITE);

    await searchPage.resultsCount(44);

    await searchPage.recResourceCardCount(10);

    await utils.checkExpectedUrlParams('type=RTR_SIT');
  });

  test('Use the filter menu to filter by things to do', async ({ page }) => {
    const filter = new FilterPOM(page);
    const searchPage = new SearchPOM(page);
    const utils = new UtilsPOM(page);

    await searchPage.route();

    await filter.verifyInitialFilterMenu();

    await filter.toggleFilterOn(filter.thingsToDoFilters, 'Camping');

    await utils.checkExpectedUrlParams('activities=32');

    await searchPage.resultsCount(14);

    await searchPage.recResourceCardCount(10);

    await searchPage.verifyRecResourceCardContent({
      rec_resource_id: 'REC2206',
      rec_resource_name: '7 Mile Lake',
      rec_resource_type: RecResourceType.SITE,
      closest_community: 'Cranbrook',
      status: Status.CLOSED,
    });
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

    await filter.toggleFilterOn(filter.thingsToDoFilters, 'Hunting');

    await utils.checkExpectedUrlParams('activities=1_32_10');

    await searchPage.resultsCount(5);

    await searchPage.recResourceCardCount(5);
  });

  test('Use the filter menu to filter by Facilities', async ({ page }) => {
    const filter = new FilterPOM(page);
    const searchPage = new SearchPOM(page);
    const utils = new UtilsPOM(page);

    await searchPage.route();

    await filter.verifyInitialFilterMenu();

    await filter.toggleFilterOn(filter.facilitiesFilters, 'Toilets');

    await utils.checkExpectedUrlParams('facilities=toilet');

    await searchPage.resultsCount(13);

    await searchPage.recResourceCardCount(10);

    await searchPage.verifyRecResourceCardContent({
      rec_resource_id: 'REC203239',
      rec_resource_name: '10 k snowmobile parking lot',
      rec_resource_type: RecResourceType.SITE,
      closest_community: 'Merritt',
      status: Status.CLOSED,
    });
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

    await searchPage.resultsCount(22);

    await searchPage.recResourceCardCount(10);
  });

  test('Use the filter menu to filter by Access Type', async ({ page }) => {
    const filter = new FilterPOM(page);
    const searchPage = new SearchPOM(page);
    const utils = new UtilsPOM(page);

    await searchPage.route();

    await filter.verifyInitialFilterMenu();

    await filter.toggleFilterOn(filter.accessTypeFilters, 'Road Access');

    await utils.checkExpectedUrlParams('access=R');

    await searchPage.resultsCount(9);

    await searchPage.recResourceCardCount(9);

    await searchPage.verifyRecResourceCardContent({
      rec_resource_id: 'REC6866',
      rec_resource_name: '1861 Goldrush Pack Trail',
      rec_resource_type: RecResourceType.TRAIL,
      closest_community: 'Wells',
      status: Status.OPEN,
    });
  });

  test('Use the filter menu to filter by multiple Access Types', async ({
    page,
  }) => {
    const filter = new FilterPOM(page);
    const searchPage = new SearchPOM(page);
    const utils = new UtilsPOM(page);

    await searchPage.route();

    await filter.verifyInitialFilterMenu();

    await filter.toggleFilterOn(filter.accessTypeFilters, 'Boat-in Access');

    await filter.toggleFilterOn(filter.accessTypeFilters, 'Fly-in Access');

    await searchPage.resultsCount(26);

    await searchPage.recResourceCardCount(10);

    await filter.toggleFilterOn(filter.accessTypeFilters, 'Road Access');

    await searchPage.resultsCount(35);

    await searchPage.recResourceCardCount(10);

    await filter.toggleFilterOn(filter.accessTypeFilters, 'Trail Access');

    await utils.checkExpectedUrlParams('access=B_F_R_T');
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

    await filter.toggleFilterOn(filter.accessTypeFilters, 'Road Access');

    await utils.checkExpectedUrlParams(
      'district=RDCK_RDKA_RDOS&page=1&type=SIT&facilities=toilet&access=R',
    );

    await searchPage.resultsCount(1);

    await searchPage.recResourceCardCount(1);

    await searchPage.verifyRecResourceCardContent({
      rec_resource_id: 'REC205035',
      rec_resource_name: '99 mile xc keene road parking',
      rec_resource_type: RecResourceType.SITE,
      closest_community: '100 Mile House',
      status: Status.CLOSED,
    });

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

    await searchPage.resultsCount(2);

    await searchPage.recResourceCardCount(2);

    await filter.clickClearFilters();

    await utils.checkExpectedUrlParams('page=1');

    await searchPage.resultsCount(TOTAL_RESULTS);

    await searchPage.recResourceCardCount(10);
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

    await filter.toggleFilterOn(filter.facilitiesFilters, 'Tables');

    await filter.toggleFilterOn(filter.accessTypeFilters, 'Boat-in Access');

    await utils.checkExpectedUrlParams(
      'district=RDKA&page=1&type=SIT&facilities=table&access=B',
    );

    await searchPage.resultsCount(1);

    await searchPage.recResourceCardCount(1);

    await filter.clickClearFilters();

    await utils.checkExpectedUrlParams('');

    await searchPage.resultsCount(TOTAL_RESULTS);

    await searchPage.recResourceCardCount(10);
  });
});
