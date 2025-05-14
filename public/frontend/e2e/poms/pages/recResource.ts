// https://playwright.dev/docs/pom

import { expect, Page } from '@playwright/test';
import { BASE_URL } from 'e2e/constants';
import { waitForImagesToLoad } from 'e2e/utils';
import { RecResource } from 'e2e/poms/pages/types';
import { SectionTitles } from '@/components/rec-resource/enum';

const MAP_CANVAS_SELECTOR = '#map-container';

export class RecreationResourcePOM {
  readonly page: Page;

  readonly baseUrl: string = `${BASE_URL}/resource`;

  constructor(page: Page) {
    this.page = page;
  }

  async route(resourceId: string = 'REC203239') {
    await this.page.goto(`${this.baseUrl}/${resourceId}`);
    await waitForImagesToLoad(this.page);
  }

  async verifyRecResourceHeaderContent({
    rec_resource_id,
    rec_resource_name,
    rec_resource_type,
    closest_community,
    status,
  }: RecResource) {
    const recResourceHeader = this.page
      .locator('h1')
      .locator('..')
      .locator('..');

    const headerTitle = recResourceHeader.locator('h1');
    await recResourceHeader.waitFor({ state: 'visible' });
    await headerTitle.waitFor({ state: 'visible' });
    await expect(headerTitle).toHaveText(rec_resource_name);
    await expect(recResourceHeader).toContainText(rec_resource_type);
    await expect(recResourceHeader).toContainText(
      closest_community.toLowerCase(),
    );
    await expect(recResourceHeader).toContainText(rec_resource_id);

    if (status) {
      await expect(recResourceHeader).toContainText(status);
    }
  }

  /**
   * Remove the map canvas element
   *
   * @remarks
   * Happo e2e automatically converts canvas elements to inline img elements
   * with a URL that looks like  "_inlined/...png" without actually creating
   * the file in the directory. When the tests are done, it then tries to
   * package every URL in the asset bundle for the test review page and tries to
   * resolve this non-existent url which ends up throwing the error.
   */
  async removeRecreationResourceFeatureMap() {
    try {
      await this.page
        .locator(MAP_CANVAS_SELECTOR)
        .waitFor({ state: 'visible', timeout: 5000 });
      await this.page.evaluate((selector) => {
        document.querySelector(selector)?.remove();
      }, MAP_CANVAS_SELECTOR);
    } catch (error) {
      console.warn(`Map element not found: ${error}`);
    }
  }

  async verifyPdfDocLinks() {
    const pdfLink = this.page.getByRole('link', { name: /\[PDF\]/ });
    await expect(pdfLink).toHaveAttribute('href', /.*\.pdf$/);
  }

  async verifyPageMenuItemSectionsAreVisible() {
    // Check if the section is in the page menu and verify that the section is visible on the page
    const pageMenu = this.page.locator('#section-navbar');

    for (const key in SectionTitles) {
      const sectionTitle = SectionTitles[key as keyof typeof SectionTitles];

      const navItem = pageMenu.getByRole('link', {
        name: sectionTitle,
      });
      const isNavItemVisible = await navItem.isVisible().catch(() => false);

      if (isNavItemVisible) {
        const heading = this.page.locator('h2', { hasText: sectionTitle });
        expect(heading).toBeVisible();
      }
    }
  }

  async verifySectionsExistInPageMenu() {
    // Check if the section is visible on the page and verify that the section is in the page menu
    const pageMenu = this.page.locator('#section-navbar');

    for (const key in SectionTitles) {
      const sectionTitle = SectionTitles[key as keyof typeof SectionTitles];

      const heading = this.page.locator('h2', { hasText: sectionTitle });
      const isSectionVisible = await heading.isVisible().catch(() => false);

      if (isSectionVisible) {
        const navItem = pageMenu.getByRole('link', {
          name: sectionTitle,
        });
        expect(navItem).toBeVisible();
      }
    }
  }

  async verifyRecResourceSections() {
    // verify the sections exist in the page menu and vice versa
    await this.verifySectionsExistInPageMenu();
    await this.verifyPageMenuItemSectionsAreVisible();
  }
}
