import { expect } from '@playwright/test';
import { baseURL } from 'e2e/utils';
import type { Page } from 'playwright';

export const dashboard_page = async (page: Page) => {
  await page.goto(baseURL);
  await expect(page.getByText('Recreation Sites and Trails BC')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Home' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Disclaimer' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Privacy' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Accessibility' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Copyright' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Contact us' })).toBeVisible();

  // Verify dyanmic content loads
  await expect(
    page.getByRole('heading', {
      name: 'A Walk In The Forest Trail (Lost Shoe)',
    }),
  ).toBeVisible();

  await expect(
    page.getByRole('heading', {
      name: 'Aberdeen Lake',
    }),
  ).toBeVisible();
};
