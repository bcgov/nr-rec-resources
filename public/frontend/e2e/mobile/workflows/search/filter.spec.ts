import { devices, test } from '@playwright/test';
import { initHappo } from '@shared/e2e/utils';
import { FilterPOM, SearchPOM, UtilsPOM } from 'e2e/poms';
import { FilterGroup } from 'e2e/enum/filter';
import { RecResourceType } from 'e2e/enum/recResource';

initHappo();

test.use({
  ...devices['iPhone 14'],
});

test.describe('Search page filter menu workflows (Mobile)', () => {
  test('Open and close the mobile filter menu', async ({ page }) => {
    const filter = new FilterPOM(page);
    const searchPage = new SearchPOM(page);

    await searchPage.route();

    await filter.openMobileFilterMenu();

    await filter.closeMobileFilterMenu();
  });

  test('Use the mobile filter menu to apply a filter', async ({ page }) => {
    const filter = new FilterPOM(page);
    const searchPage = new SearchPOM(page);
    const utils = new UtilsPOM(page);

    await searchPage.route();

    await filter.openMobileFilterMenu();

    await filter.toggleMobileFilterGroup(FilterGroup.DISTRICT);

    await filter.toggleMobileFilterOn('Chilliwack');

    await filter.closeMobileFilterMenu();

    await utils.checkExpectedUrlParams('district=RDCK');

    await searchPage.waitForResults();
  });

  test('Use the mobile filter menu to filter by multiple types', async ({
    page,
  }) => {
    const filter = new FilterPOM(page);
    const searchPage = new SearchPOM(page);
    const utils = new UtilsPOM(page);

    await searchPage.route();

    await filter.openMobileFilterMenu();

    await filter.toggleMobileFilterGroup(FilterGroup.DISTRICT);
    await filter.toggleMobileFilterOn('Chilliwack');
    await filter.toggleMobileFilterGroup(FilterGroup.DISTRICT);

    await filter.toggleMobileFilterGroup(FilterGroup.TYPE);
    await filter.toggleMobileFilterOn(RecResourceType.SITE);
    await filter.toggleMobileFilterGroup(FilterGroup.TYPE);

    await filter.closeMobileFilterMenu();

    await utils.checkExpectedUrlParams('district=RDCK&page=1&type=SIT');

    await searchPage.waitForResults();
  });
});
