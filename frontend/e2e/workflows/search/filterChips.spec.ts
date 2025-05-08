import { test } from '@playwright/test';
import { initHappo } from 'e2e/utils';
import { FilterChipsPOM, FilterPOM, SearchPOM, UtilsPOM } from 'e2e/poms';

initHappo();

test.describe('Filter chip workflows', () => {
  test('Toggle a filter using the filter menu and toggle it off using a filter chip', async ({
    page,
  }) => {
    const filter = new FilterPOM(page);
    const filterChips = new FilterChipsPOM(page);
    const searchPage = new SearchPOM(page);

    await searchPage.route();

    await filter.verifyInitialFilterMenu();

    await filter.toggleFilterOn(filter.districtFilters, 'Chilliwack');

    await filter.checkIsFilterToggledOn(filter.districtFilters, 'Chilliwack');

    await filterChips.verifyFilterChips(['Chilliwack']);

    await filterChips.removeFilterChip('Chilliwack');

    await filter.checkIsFilterToggledOff(filter.districtFilters, 'Chilliwack');

    await filterChips.verifyFilterChips([]);
  });

  test('Toggle multiple filters using the filter menu and toggle them off using filter chips', async ({
    page,
  }) => {
    const filter = new FilterPOM(page);
    const filterChips = new FilterChipsPOM(page);
    const searchPage = new SearchPOM(page);

    await searchPage.route();

    await filter.verifyInitialFilterMenu();

    await filter.toggleFilterOn(filter.districtFilters, 'Chilliwack');

    await filterChips.verifyFilterChips(['Chilliwack']);

    await filter.toggleFilterOn(filter.typeFilters, 'Recreation Site');

    await filterChips.verifyFilterChips(['Recreation Site']);

    await filter.toggleFilterOn(filter.accessTypeFilters, 'Boat-in Access');

    await filterChips.verifyFilterChips(['Boat-in Access']);

    await filter.checkIsFilterToggledOn(filter.districtFilters, 'Chilliwack');

    await filterChips.verifyFilterChips(['Chilliwack']);

    await filter.checkIsFilterToggledOn(filter.typeFilters, 'Recreation Site');

    await filterChips.verifyFilterChips(['Recreation Site']);

    await filter.checkIsFilterToggledOn(
      filter.accessTypeFilters,
      'Boat-in Access',
    );

    await filterChips.verifyFilterChips(['Boat-in Access']);

    await filterChips.removeFilterChip('Chilliwack');

    await filterChips.removeFilterChip('Recreation Site');

    await filterChips.removeFilterChip('Boat-in Access');

    await filter.checkIsFilterToggledOff(filter.districtFilters, 'Chilliwack');

    await filter.checkIsFilterToggledOff(filter.typeFilters, 'Recreation Site');

    await filter.checkIsFilterToggledOff(
      filter.accessTypeFilters,
      'Boat-in Access',
    );

    await filterChips.verifyFilterChips([]);
  });

  test('Toggle multiple filters on and off using the filter menu and verify filter chips get removed', async ({
    page,
  }) => {
    const filter = new FilterPOM(page);
    const filterChips = new FilterChipsPOM(page);
    const searchPage = new SearchPOM(page);

    const ACCESS_TYPE = 'Boat-in access';

    await searchPage.route();

    await filter.verifyInitialFilterMenu();

    await filter.toggleFilterOn(filter.districtFilters, '100 Mile-Chilcotin');

    await filterChips.verifyFilterChips(['100 Mile-Chilcotin']);

    await filter.toggleFilterOn(filter.typeFilters, 'Recreation Trail');

    await filterChips.verifyFilterChips(['Recreation Trail']);

    await filter.toggleFilterOn(filter.accessTypeFilters, ACCESS_TYPE);

    await filterChips.verifyFilterChips([ACCESS_TYPE]);

    await filter.checkIsFilterToggledOn(
      filter.districtFilters,
      '100 Mile-Chilcotin',
    );

    await filter.checkIsFilterToggledOn(filter.typeFilters, 'Recreation Trail');

    await filter.checkIsFilterToggledOn(filter.accessTypeFilters, ACCESS_TYPE);

    await filter.toggleFilterOff(filter.districtFilters, '100 Mile-Chilcotin');

    await filter.toggleFilterOff(filter.typeFilters, 'Recreation Trail');

    await filter.toggleFilterOff(filter.accessTypeFilters, ACCESS_TYPE);

    await filter.checkIsFilterToggledOff(
      filter.districtFilters,
      '100 Mile-Chilcotin',
    );

    await filter.checkIsFilterToggledOff(
      filter.typeFilters,
      'Recreation Trail',
    );

    await filter.checkIsFilterToggledOff(filter.accessTypeFilters, ACCESS_TYPE);

    await filterChips.verifyFilterChips([]);
  });

  test('Filter chips should display when search page is visited with filter params in the URL', async ({
    page,
  }) => {
    const filterChips = new FilterChipsPOM(page);
    const searchPage = new SearchPOM(page);
    const utils = new UtilsPOM(page);

    await searchPage.route(
      '?page=1&district=RDMH_RDCK_RDCO_RDKA&type=RTR_SIT_IF&access=B_F_R_T&facilities=toilet&activities=1',
    );

    await filterChips.verifyFilterChips([
      '100 Mile-Chilcotin',
      'Chilliwack',
      'Columbia-Shuswap',
      'Kamloops',
      'Recreation Trail',
      'Recreation Site',
      'Interpretive Forest',
      'Angling',
      'Toilets',
      'Boat-in Access',
      'Fly-in Access',
      'Road Access',
      'Trail Access',
    ]);

    await utils.screenshot('Search page with filter chips', 'default');

    await utils.accessibility();
  });
});
