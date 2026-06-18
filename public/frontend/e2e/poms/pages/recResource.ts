// https://playwright.dev/docs/pom

import { expect, Locator, Page } from '@playwright/test';
import { BASE_URL } from 'e2e/constants';
import { waitForImagesToLoad } from '@shared/e2e/utils';
import { RecResource } from 'e2e/poms/pages/types';
import { SectionIds, SectionTitles } from '@/components/rec-resource/enum';

/** Fee sub-section labels  */
export type FeeSubSection = 'overnight' | 'trail' | 'additional';

const FEE_SUBSECTION_HEADINGS: Record<FeeSubSection, string> = {
  overnight: 'Overnight fees',
  trail: 'Trail fees',
  additional: 'Additional fees',
};

export class RecreationResourcePOM {
  readonly page: Page;

  readonly baseUrl: string = `${BASE_URL}/resource`;

  constructor(page: Page) {
    this.page = page;
  }

  feesSection(): Locator {
    return this.page.locator(`#${SectionIds.FEES}`);
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

  /**
   * Verify the top-level Fees section: heading, info link with the
   * gov.bc.ca URL, and the expected sub-section headings. The
   * `subSections` argument lists the sub-sections the resource is
   * expected to render (others are asserted to be absent).
   */
  async verifyFeesSection(subSections: FeeSubSection[]) {
    const feesSection = this.feesSection();
    await expect(feesSection).toBeVisible();

    await expect(
      feesSection.getByRole('heading', {
        level: 2,
        name: SectionTitles.FEES,
      }),
    ).toBeVisible();

    const infoLink = feesSection.getByRole('link', {
      name: /fees, discounts and reservations/i,
    });
    await expect(infoLink).toBeVisible();
    await expect(infoLink).toHaveAttribute(
      'href',
      'https://www2.gov.bc.ca/gov/content/sports-culture/recreation/camping-hiking/sites-trails/planning/fees',
    );
    await expect(infoLink).toHaveAttribute('target', '_blank');
    await expect(infoLink).toHaveAttribute('rel', 'noopener noreferrer');

    const expected = new Set(subSections);
    for (const key of Object.keys(FEE_SUBSECTION_HEADINGS) as FeeSubSection[]) {
      const heading = feesSection.getByRole('heading', {
        level: 3,
        name: FEE_SUBSECTION_HEADINGS[key],
      });
      if (expected.has(key)) {
        await expect(heading).toBeVisible();
      } else {
        await expect(heading).toHaveCount(0);
      }
    }
  }

  /**
   * Verify clicking the "Fees" entry in the page menu scrolls the
   * Fees section into view.
   */
  async verifyFeesNavigation() {
    const navLink = this.page
      .locator('#section-navbar')
      .getByRole('link', { name: SectionTitles.FEES });
    await expect(navLink).toBeVisible();
    await navLink.click();

    const feesSection = this.feesSection();
    await expect(feesSection).toBeInViewport();
  }

  /**
   * Verify the bulk "Expand all / Collapse all" toggle for a fee
   * sub-section behaves correctly. Only call when the sub-section has
   * more than one fee (so the button is actually rendered).
   */
  async verifyFeesBulkToggle(subSection: FeeSubSection) {
    const heading = this.feesSection().getByRole('heading', {
      level: 3,
      name: FEE_SUBSECTION_HEADINGS[subSection],
    });
    await expect(heading).toBeVisible();

    // The bulk toggle lives in the wrapper immediately following the
    // sub-section heading.
    const wrapper = heading.locator(
      'xpath=following-sibling::div[contains(@class, "fee-section-wrapper")][1]',
    );

    const label = `${subSection} fees`;
    const expandButton = wrapper.getByRole('button', {
      name: new RegExp(`expand ${label}`, 'i'),
    });
    const collapseButton = wrapper.getByRole('button', {
      name: new RegExp(`collapse ${label}`, 'i'),
    });

    // Initial state: collapsed.
    await expect(expandButton).toBeVisible();
    await expect(expandButton).toHaveText(
      new RegExp(`Expand all ${label}`, 'i'),
    );

    // Click -> should switch to collapse state.
    await expandButton.click();
    await expect(collapseButton).toBeVisible();
    await expect(collapseButton).toHaveText(
      new RegExp(`Collapse all ${label}`, 'i'),
    );

    // Click again -> back to expand state.
    await collapseButton.click();
    await expect(
      wrapper.getByRole('button', {
        name: new RegExp(`expand ${label}`, 'i'),
      }),
    ).toBeVisible();
  }
}
