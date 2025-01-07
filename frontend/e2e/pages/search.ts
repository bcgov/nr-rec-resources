import { expect } from '@playwright/test';
import { baseURL } from 'e2e/utils';
import type { Page } from 'playwright';

export const searchPage = async (page: Page) => {
  const url = `${baseURL}/search`;
  await page.goto(url);
  await expect(page.getByRole('link', { name: 'Disclaimer' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Privacy' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Accessibility' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Copyright' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Contact us' })).toBeVisible();

  // Verify dyanmic content loads
  await expect(
    page.getByRole('heading', {
      name: 'Allison Pool',
    }),
  ).toBeVisible();

  await expect(
    page.getByRole('heading', {
      name: 'Appleton Creek Site & Trail',
    }),
  ).toBeVisible();
};
