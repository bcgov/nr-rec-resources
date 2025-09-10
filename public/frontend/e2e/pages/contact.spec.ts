import { test } from '@playwright/test';
import { initHappo } from '@shared/e2e/utils';
import { ContactPOM, LayoutPOM, UtilsPOM } from 'e2e/poms';

initHappo();

test.describe('Contact Page', () => {
  test('Contact Page renders correctly via direct route', async ({ page }) => {
    const contact = new ContactPOM(page);
    const layout = new LayoutPOM(page);
    const utils = new UtilsPOM(page);

    await contact.routeToContact();

    await layout.verifyHeaderContent();
    await layout.verifyFooterContent();
    await contact.verifyContactPageContent();
    await contact.verifyTopicSelectOptions();
    await contact.verifyBreadcrumbs(false);
    await contact.verifyPageWithScrollMenu();

    await utils.accessibility();
    await utils.screenshot('Contact page', 'direct-route');
  });

  test('Contact Page topic selection works correctly', async ({ page }) => {
    const contact = new ContactPOM(page);
    const utils = new UtilsPOM(page);

    await contact.routeToContact();

    await contact.selectTopic('Reservations, fees, and discounts');
    await contact.selectTopic('Site or Trail');
    await contact.selectTopic('Report All Poachers and Polluters');

    await utils.accessibility();

    await utils.screenshot('Contact page', 'topic-selection');
  });

  test('Contact Page renders correctly via resource contact route', async ({
    page,
  }) => {
    const contact = new ContactPOM(page);
    const layout = new LayoutPOM(page);
    const utils = new UtilsPOM(page);

    const sampleResourceId = 'REC203239';
    await contact.routeToResourceContact(sampleResourceId);

    await layout.verifyHeaderContent();
    await layout.verifyFooterContent();
    await contact.verifyContactPageContent();
    await contact.verifyTopicSelectOptions();

    await contact.verifyBreadcrumbs(true);
    await contact.verifyPageWithScrollMenu();

    await utils.accessibility();
    await utils.screenshot('Contact page', 'resource-contact-route');
  });

  test('Popular topic links are functional', async ({ page }) => {
    const contact = new ContactPOM(page);
    const utils = new UtilsPOM(page);

    await contact.routeToContact();

    await contact.verifyPopularTopicLinks();

    await utils.accessibility();
    await utils.screenshot('Contact page', 'popular-links');
  });
});
