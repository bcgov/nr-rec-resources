import { expect } from '@playwright/test';
import { baseURL } from 'e2e/utils';
import type { Page } from 'playwright';

export const recResourcePage = async (page: Page) => {
  const url = `${baseURL}/resource/REC1222/`;
  await page.goto(url);

  // Verify dyanamic content loads
  await expect(
    page.getByRole('heading', {
      name: '100 Road Bridge',
    }),
  ).toBeVisible();
};
