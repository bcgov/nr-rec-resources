import { devices, test } from '@playwright/test';
import { initHappo } from '@shared/e2e/utils';
import { ContactPOM, LayoutPOM, UtilsPOM } from 'e2e/poms';

initHappo();

test.use({
  ...devices['iPhone 14'],
});

test.describe('Contact Page (Mobile)', () => {
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
    await utils.screenshotMobile(
      'Contact page direct-route',
      'direct-route mobile',
    );
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
    await utils.screenshotMobile(
      'Contact page',
      'resource-contact-route mobile',
    );
  });
});
