import { expect, test } from '@playwright/test';

test('landing has no horizontal scroll on a phone', async ({ page }) => {
  await page.goto('/');
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
});

test.describe('team page at 390px', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  for (const club of ['arsenal', 'atletico-de-madrid', 'aston-villa']) {
    test(`${club}: one column, no horizontal scroll`, async ({ page }) => {
      await page.goto(`/clubs/${club}/`);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }

  test('the shirt comes before the list; tapping a marker opens its row', async ({ page }) => {
    await page.goto('/clubs/arsenal/');
    await expect(page.getByText('Rating · tap a level', { exact: false })).toBeVisible();
    const top = async (sel: string) => (await page.locator(sel).first().boundingBox())!.y;
    const shirt = await top('aside[aria-label="The shirt"]');
    expect(shirt).toBeGreaterThan(await top('h1'));
    expect(shirt).toBeLessThan(await top('#sponsors-title'));
    expect(await top('#travel-title')).toBeGreaterThan(await top('#act-title'));
    await page.getByRole('button', { name: '2: Deel, sleeve' }).tap();
    const deel = page.locator('button[aria-controls="panel-deel-sleeve"]');
    await expect(deel).toHaveAttribute('aria-expanded', 'true');
    await expect(deel).toBeInViewport();
    // "Who really pays" moves into the open row.
    await expect(page.locator('#panel-emirates-front')).toContainText('Government of Dubai');
  });
});

test('overview stacks level groups', async ({ page }) => {
  await page.goto('/soccer/premier-league/');
  const lefts = await page
    .locator('section[aria-label="Soaked"], section[aria-label="Stained"]')
    .evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().left)));
  expect(lefts[0]).toBe(lefts[1]);
});
