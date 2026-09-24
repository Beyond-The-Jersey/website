import { expect, test } from '@playwright/test';

test('landing has no horizontal scroll on a phone', async ({ page }) => {
  await page.goto('/');
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
});

test('team page shows photos with numbered markers, then the cards', async ({ page }) => {
  await page.goto('/clubs/atletico-de-madrid/');
  const mobile = page.locator('section[aria-label="The shirt and its sponsors"]:visible');
  await expect(mobile).toHaveCount(1);
  await mobile.getByRole('link', { name: '3: Visit Rwanda' }).click();
  await expect(mobile.locator('[data-list-card="visit-rwanda:back"] button[aria-expanded]')).toHaveAttribute(
    'aria-expanded',
    'true',
  );
});

test('overview stacks level groups', async ({ page }) => {
  await page.goto('/soccer/premier-league/');
  const lefts = await page
    .locator('section[aria-label="Soaked"], section[aria-label="Stained"]')
    .evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().left)));
  expect(lefts[0]).toBe(lefts[1]);
});
