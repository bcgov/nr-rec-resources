import { test, expect } from '@playwright/test';
import { initHappo } from 'e2e/utils';
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

    // Test selecting different topics
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

    // Use a sample resource ID - this tests the second route to ContactPage
    const sampleResourceId = 'REC203239';
    await contact.routeToResourceContact(sampleResourceId);

    await layout.verifyHeaderContent();
    await layout.verifyFooterContent();
    await contact.verifyContactPageContent();
    await contact.verifyTopicSelectOptions();

    // For resource contact, breadcrumbs will be different
    await contact.verifyBreadcrumbs(true);
    await contact.verifyPageWithScrollMenu();

    await utils.accessibility();

    await utils.screenshot('Contact page', 'resource-contact-route');
  });

  test('Popular topic links are functional', async ({ page }) => {
    const contact = new ContactPOM(page);
    const utils = new UtilsPOM(page);

    await contact.routeToContact();

    // Verify that popular topic links have correct href attributes
    // Use more specific selectors to avoid duplicate links
    const expectedLinks = [
      {
        text: 'Reservations, fees, and discounts',
        url: 'https://www2.gov.bc.ca/gov/content/sports-culture/recreation/camping-hiking/sites-trails/planning/fees',
      },
      {
        text: 'Rules and etiquette',
        url: 'https://www2.gov.bc.ca/gov/content/sports-culture/recreation/camping-hiking/sites-trails/planning/rules',
      },
      {
        text: 'Campfires',
        url: 'https://www2.gov.bc.ca/gov/content/safety/wildfire-status/prevention/fire-bans-and-restrictions',
      },
      {
        text: 'Planning your trip',
        url: 'https://www2.gov.bc.ca/gov/content/sports-culture/recreation/camping-hiking/sites-trails/planning',
      },
    ];

    // Get links specifically from the popular inquiries section
    const popularSection = page.locator('#popular-inquiries');

    for (const link of expectedLinks) {
      const linkElement = popularSection.getByRole('link', { name: link.text });
      await expect(linkElement).toBeVisible();
      const href = await linkElement.getAttribute('href');
      if (href !== link.url) {
        throw new Error(
          `Expected link "${link.text}" to have href "${link.url}" but got "${href}"`,
        );
      }
    }

    await utils.accessibility();

    await utils.screenshot('Contact page', 'popular-links');
  });
});
