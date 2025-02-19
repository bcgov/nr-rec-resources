import { expect } from '@playwright/test';
import { baseURL, waitForImagesToLoad } from 'e2e/utils';
import type { Page } from 'playwright';

export const searchPage = async (page: Page) => {
  const url = `${baseURL}/search`;
  // Wait for network to idle to ensure images are loaded
  await page.goto(url, { waitUntil: 'networkidle' });
  await expect(page.getByRole('link', { name: 'Disclaimer' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Privacy' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Accessibility' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Copyright' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Contact us' })).toBeVisible();

  await waitForImagesToLoad(page);

  // Verify dynanmic content loads
  await expect(
    page.getByRole('heading', {
      name: '10 K Snowmobile Parking Lot',
    }),
  ).toBeVisible();

  await expect(
    page.getByRole('heading', {
      name: '10k Cabin',
    }),
  ).toBeVisible();
};
