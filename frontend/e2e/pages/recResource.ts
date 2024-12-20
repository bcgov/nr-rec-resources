import { expect } from '@playwright/test';
import { baseURL } from 'e2e/utils';
import type { Page } from 'playwright';

export const recResourcePage = async (page: Page) => {
  const url = `${baseURL}/resource/REC5600/`;
  await page.goto(url);

  // Verify dyanmic content loads
  await expect(
    page.getByRole('heading', {
      name: 'A Walk In The Forest Trail (Lost Shoe)',
    }),
  ).toBeVisible();
};
