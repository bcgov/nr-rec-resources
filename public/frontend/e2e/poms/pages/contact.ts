// https://playwright.dev/docs/pom

import { expect, Locator, Page } from '@playwright/test';
import { BASE_URL } from 'e2e/constants';
import { waitForImagesToLoad } from '@shared/e2e/utils';

export class ContactPOM {
  readonly page: Page;

  readonly contactUrl: string = `${BASE_URL}/contact`;

  readonly pageTitle: Locator;
  readonly popularInquiriesSection: Locator;
  readonly contactUsSection: Locator;
  readonly topicSelect: Locator;
  readonly popularTopicLinks: Locator;

  constructor(page: Page) {
    this.page = page;

    this.pageTitle = page.getByRole('heading', {
      name: 'Contact Recreation Sites and Trails',
      level: 1,
    });
    this.popularInquiriesSection = page.locator('#popular-inquiries');
    this.contactUsSection = page.locator('#contact-us');
    this.topicSelect = page.locator('select[id="topic"]');
    this.popularTopicLinks = page.locator('.contact-page__topics-list a');
  }

  async routeToContact() {
    await this.page.goto(this.contactUrl);
    await waitForImagesToLoad(this.page);
  }

  async routeToResourceContact(resourceId: string) {
    const resourceContactUrl = `${BASE_URL}/resource/${resourceId}/contact`;
    await this.page.goto(resourceContactUrl);
    await waitForImagesToLoad(this.page);
  }

  async verifyContactPageContent() {
    // Verify main page title
    await expect(this.pageTitle).toBeVisible();

    // Verify Popular inquiries section
    await expect(this.popularInquiriesSection).toBeVisible();
    await expect(
      this.page.getByRole('heading', { name: 'Popular inquiries' }),
    ).toBeVisible();
    await expect(
      this.page.getByText(
        'If you have a quick question, these links might provide your answer.',
      ),
    ).toBeVisible();
    await expect(
      this.page.getByRole('heading', { name: 'Popular topics' }),
    ).toBeVisible();

    // Verify popular topic links are present - use more specific selectors to avoid duplicates
    await expect(this.popularTopicLinks).toHaveCount(4);

    // Verify each link exists within the popular topics section specifically
    const popularSection = this.popularInquiriesSection;
    await expect(
      popularSection.getByRole('link', {
        name: 'Reservations, fees, and discounts',
      }),
    ).toBeVisible();
    await expect(
      popularSection.getByRole('link', { name: 'Rules and etiquette' }),
    ).toBeVisible();
    await expect(
      popularSection.getByRole('link', { name: 'Campfires' }),
    ).toBeVisible();
    await expect(
      popularSection.getByRole('link', { name: 'Planning your trip' }),
    ).toBeVisible();

    // Verify Contact us section
    await expect(this.contactUsSection).toBeVisible();
    await expect(
      this.page.getByRole('heading', { name: 'Contact us' }),
    ).toBeVisible();
    await expect(
      this.page.getByText(
        "If you're unable to find the answer to your questions",
      ),
    ).toBeVisible();

    // Verify form elements
    await expect(this.topicSelect).toBeVisible();
    await expect(this.page.getByText('Topic', { exact: true })).toBeVisible();
  }

  async verifyTopicSelectOptions() {
    // Verify the topic select exists and has options
    await expect(this.topicSelect).toBeVisible();

    // For select options, we check the select has the expected values rather than visibility
    const selectOptions = await this.topicSelect.locator('option').all();
    expect(selectOptions.length).toBe(6);

    // Verify the select contains the expected option values
    const expectedValues = [
      'reservations',
      'site-trail',
      'cannot-find',
      'wildfires',
      'rapp',
      'resource-violation',
    ];

    for (const value of expectedValues) {
      await expect(
        this.topicSelect.locator(`option[value="${value}"]`),
      ).toHaveCount(1);
    }

    // Verify optgroups exist
    await expect(
      this.topicSelect.locator('optgroup[label="General"]'),
    ).toHaveCount(1);
    await expect(
      this.topicSelect.locator('optgroup[label="Report a violation"]'),
    ).toHaveCount(1);
  }

  async selectTopic(topic: string) {
    await this.topicSelect.selectOption({ label: topic });
  }

  async verifyBreadcrumbs(isResourceContact = false, resourceName?: string) {
    const breadcrumbsContainer = this.page.getByTestId('breadcrumbs');
    await expect(breadcrumbsContainer).toBeVisible();

    // Verify Home breadcrumb
    await expect(
      breadcrumbsContainer.getByRole('link', { name: 'Home' }),
    ).toBeVisible();

    if (isResourceContact) {
      // For resource contact page, verify search and resource breadcrumbs
      await expect(
        breadcrumbsContainer.getByRole('link', {
          name: 'Find a site or trail',
        }),
      ).toBeVisible();

      if (resourceName) {
        await expect(
          breadcrumbsContainer.getByRole('link', { name: resourceName }),
        ).toBeVisible();
      }
    }

    // Verify Contact breadcrumb (current page)
    await expect(breadcrumbsContainer.getByText('Contact')).toBeVisible();
  }

  async verifyPageWithScrollMenu() {
    // Verify the page has scroll menu sections
    await expect(
      this.page.locator('a[href="#popular-inquiries"]'),
    ).toBeVisible();
    await expect(this.page.locator('a[href="#contact-us"]')).toBeVisible();
  }
}
