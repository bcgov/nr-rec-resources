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

    await searchPage.recResourceCardCount(10);
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

    await utils.checkExpectedUrlParams('type=RTR_SIT');

    await searchPage.recResourceCardCount(10);
  });

  test('Use the filter menu to filter by things to do', async ({ page }) => {
    const filter = new FilterPOM(page);
    const searchPage = new SearchPOM(page);
    const utils = new UtilsPOM(page);

    await searchPage.route();

    await filter.verifyInitialFilterMenu();

    await filter.toggleFilterOn(filter.thingsToDoFilters, 'Camping');

    await utils.checkExpectedUrlParams('activities=32');

    await searchPage.recResourceCardCount(10);
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
  });

  test('Use the filter menu to filter by Facilities', async ({ page }) => {
    const filter = new FilterPOM(page);
    const searchPage = new SearchPOM(page);
    const utils = new UtilsPOM(page);

    await searchPage.route();

    await filter.verifyInitialFilterMenu();

    await filter.toggleFilterOn(filter.facilitiesFilters, 'Toilets');

    await utils.checkExpectedUrlParams('facilities=toilet');

    await searchPage.recResourceCardCount(10);
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

    await searchPage.recResourceCardCount(10);

    await filter.toggleFilterOn(filter.accessTypeFilters, 'Road Access');

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

    await filter.clickClearFilters();

    await utils.checkExpectedUrlParams('page=1');

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

    await filter.clickClearFilters();

    await utils.checkExpectedUrlParams('');

    await searchPage.recResourceCardCount(10);
  });
});
