import { test } from '@playwright/test';
import { initHappo } from 'e2e/utils';
import { FilterChipsPOM, FilterPOM, SearchPOM, UtilsPOM } from 'e2e/poms';

initHappo();

const ACCESS_TYPE = 'Boat-in access';
const DISTRICT = 'Chilliwack';
const TYPE = 'Recreation site';

test.describe('Filter chip workflows', () => {
  test('Toggle a filter using the filter menu and toggle it off using a filter chip', async ({
    page,
  }) => {
    const filter = new FilterPOM(page);
    const filterChips = new FilterChipsPOM(page);
    const searchPage = new SearchPOM(page);

    await searchPage.route();

    await filter.verifyInitialFilterMenu();

    await filter.toggleFilterOn(filter.districtFilters, DISTRICT);

    await filter.checkIsFilterToggledOn(filter.districtFilters, DISTRICT);

    await filterChips.verifyFilterChips([DISTRICT]);

    await filterChips.removeFilterChip(DISTRICT);

    await filter.checkIsFilterToggledOff(filter.districtFilters, DISTRICT);

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

    await filter.toggleFilterOn(filter.districtFilters, DISTRICT);

    await filterChips.verifyFilterChips([DISTRICT]);

    await filter.toggleFilterOn(filter.typeFilters, TYPE);

    await filterChips.verifyFilterChips([TYPE]);

    await filter.toggleFilterOn(filter.accessTypeFilters, ACCESS_TYPE);

    await filterChips.verifyFilterChips([ACCESS_TYPE]);

    await filter.checkIsFilterToggledOn(filter.districtFilters, DISTRICT);

    await filterChips.verifyFilterChips([DISTRICT]);

    await filter.checkIsFilterToggledOn(filter.typeFilters, TYPE);

    await filterChips.verifyFilterChips([TYPE]);

    await filter.checkIsFilterToggledOn(filter.accessTypeFilters, ACCESS_TYPE);

    await filterChips.verifyFilterChips([ACCESS_TYPE]);

    await filterChips.removeFilterChip(DISTRICT);

    await filterChips.removeFilterChip(TYPE);

    await filterChips.removeFilterChip(ACCESS_TYPE);

    await filter.checkIsFilterToggledOff(filter.districtFilters, DISTRICT);

    await filter.checkIsFilterToggledOff(filter.typeFilters, TYPE);

    await filter.checkIsFilterToggledOff(filter.accessTypeFilters, ACCESS_TYPE);

    await filterChips.verifyFilterChips([]);
  });

  test('Toggle multiple filters on and off using the filter menu and verify filter chips get removed', async ({
    page,
  }) => {
    const filter = new FilterPOM(page);
    const filterChips = new FilterChipsPOM(page);
    const searchPage = new SearchPOM(page);

    await searchPage.route();

    await filter.verifyInitialFilterMenu();

    await filter.toggleFilterOn(filter.districtFilters, DISTRICT);

    await filterChips.verifyFilterChips([DISTRICT]);

    await filter.toggleFilterOn(filter.typeFilters, TYPE);

    await filterChips.verifyFilterChips([TYPE]);

    await filter.toggleFilterOn(filter.accessTypeFilters, ACCESS_TYPE);

    await filterChips.verifyFilterChips([ACCESS_TYPE]);

    await filter.checkIsFilterToggledOn(filter.districtFilters, DISTRICT);

    await filter.checkIsFilterToggledOn(filter.typeFilters, TYPE);

    await filter.checkIsFilterToggledOn(filter.accessTypeFilters, ACCESS_TYPE);

    await filter.toggleFilterOff(filter.districtFilters, DISTRICT);

    await filter.toggleFilterOff(filter.typeFilters, TYPE);

    await filter.toggleFilterOff(filter.accessTypeFilters, ACCESS_TYPE);

    await filter.checkIsFilterToggledOff(filter.districtFilters, DISTRICT);

    await filter.checkIsFilterToggledOff(filter.typeFilters, TYPE);

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
      DISTRICT,
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

    // The search map is in the DOM on the search page which causes Happo screenshots to fail
    await utils.removeVectorFeatureMap();
    await utils.screenshot('Search page with filter chips', 'default');

    await utils.accessibility();
  });
});
