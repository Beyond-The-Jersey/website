import { expect, test } from '@playwright/test';

test.describe('landing', () => {
  test('renders every section from data', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1, name: 'Who’s buying your loyalty?' })).toBeVisible();
    await expect(
      page.getByText('7 clubs rated · 2 leagues mapped · updated 24 Sep 2026', { exact: false }),
    ).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Just changed' })).toBeVisible();
    await expect(page.locator('section[aria-labelledby="just-changed"] a')).toHaveCount(4 + 1);
    await expect(page.locator('section[aria-labelledby="dropped"] article')).toHaveCount(6);
    await expect(page.locator('section[aria-labelledby="leagues"] a[href^="/soccer/"]')).toHaveCount(6 + 1);
    await expect(page.getByText('4 of 20', { exact: true })).toBeVisible();
    await expect(page.getByText('Your chest. Their ad.')).toBeVisible();
    await expect(page.getByText('Ratings are illustrative until the method is final.', { exact: false })).toBeVisible();
  });

  test('headline rotates and lands on loyalty', async ({ page }) => {
    await page.goto('/');
    // The rotating word is aria-hidden (the h1 has the full label), so find it by its title.
    const word = page.locator('button[title="Play again"]');
    await expect(word).toHaveText('shirt', { timeout: 1000 });
    await expect(word).toHaveText('loyalty', { timeout: 10_000 });
    await word.click();
    await expect(word).toHaveText('shirt');
  });

  test('reduced motion shows loyalty and never rotates', async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    await page.goto('/');
    const word = page.locator('button[title="Play again"]');
    await expect(word).toHaveText('loyalty');
    await page.waitForTimeout(1500);
    await expect(word).toHaveText('loyalty');
    await ctx.close();
  });
});

test.describe('search', () => {
  test('finds a sponsor and the clubs it pays', async ({ page }) => {
    await page.goto('/');
    const box = page.getByRole('combobox');
    await box.fill('rwanda');
    const options = page.getByRole('option');
    await expect(options.first()).toContainText('Visit Rwanda');
    await expect(options.nth(1)).toContainText('Aston Villa');
    await expect(options.nth(1)).toContainText('Soaked');
  });

  test('keyboard: arrows move, Enter opens, Esc closes', async ({ page }) => {
    await page.goto('/');
    const box = page.getByRole('combobox');
    await box.fill('villa');
    await box.press('ArrowDown');
    await expect(page.getByRole('option').first()).toHaveAttribute('aria-selected', 'true');
    await box.press('Enter');
    await expect(page).toHaveURL(/\/clubs\/aston-villa\/$/);

    await page.goto('/');
    await page.getByRole('combobox').fill('arsenal');
    await expect(page.getByRole('listbox')).toBeVisible();
    await page.getByRole('combobox').press('Escape');
    await expect(page.getByRole('listbox')).toHaveCount(0);
  });

  test('shows popular results, try chips and the empty state', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('combobox').focus();
    await expect(page.getByText('Popular right now')).toBeVisible();
    await page.getByRole('combobox').press('Escape');
    await page.getByRole('button', { name: 'Formula 1' }).click();
    await expect(page.getByRole('combobox')).toHaveValue('Formula 1');
    await expect(page.getByRole('option').first()).toContainText('Formula 1');
    await page.getByRole('combobox').fill('xyz');
    await expect(page.getByText('Nothing on file for “xyz” yet.')).toBeVisible();
  });
});

test.describe('overview', () => {
  test('Premier League at a glance', async ({ page }) => {
    await page.goto('/soccer/premier-league/');
    await expect(
      page.getByText('Premier League: 4 of 20 home shirts carry a sponsor we rate as bad. 1 is soaked.'),
    ).toBeVisible();
    await expect(page.getByText('1 soaked · 2 stained · 1 spotted · 1 clean · 15 not rated yet')).toBeVisible();
    await expect(page.locator('section[aria-label="Every club at a glance"] a')).toHaveCount(20);
    await expect(page.getByRole('heading', { name: 'Soaked' })).toBeVisible();
    await expect(page.locator('section[aria-label="Soaked"] a')).toHaveAttribute('href', '/clubs/aston-villa/');
    // Clubs without a team page aren't links.
    await expect(page.locator('section[aria-label="Stained"] a')).toHaveCount(1);
  });

  test('group headers line up so every card starts at the same y', async ({ page }) => {
    await page.goto('/soccer/premier-league/');
    const tops = await page
      .locator(
        'section[aria-label="Soaked"], section[aria-label="Stained"], section[aria-label="Spotted"], section[aria-label="Clean"]',
      )
      .evaluateAll((groups) =>
        groups.map((g) => Math.round((g.children[1] as HTMLElement).getBoundingClientRect().top)),
      );
    expect(new Set(tops).size).toBe(1);
  });

  test('La Liga pads unknown clubs, other leagues and sports show a panel', async ({ page }) => {
    await page.goto('/soccer/la-liga/');
    await expect(page.getByText('+18')).toBeVisible();
    await page.getByRole('link', { name: 'Bundesliga' }).click();
    await expect(page.getByRole('heading', { name: 'Bundesliga is next' })).toBeVisible();
    await page.getByRole('link', { name: 'Basketball' }).click();
    await expect(page).toHaveURL(/\/basketball\/$/);
    await expect(page.getByText('LA Clippers', { exact: true })).toBeVisible();
  });
});

test.describe('team page (click, the default)', () => {
  const expanded = (page: import('@playwright/test').Page, key: string) =>
    page.locator(`[data-card="${key}"] button[aria-expanded]`);

  test('hover only highlights; a click opens the card; Esc and outside clicks close it', async ({ page }) => {
    await page.goto('/clubs/atletico-de-madrid/');
    const hotspot = page.getByRole('button', { name: 'Visit Rwanda: show who pays' });
    await hotspot.hover();
    await page.waitForTimeout(300);
    await expect(expanded(page, 'visit-rwanda:back')).toHaveAttribute('aria-expanded', 'false');
    await hotspot.click();
    await expect(expanded(page, 'visit-rwanda:back')).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('[data-card="visit-rwanda:back"]')).toContainText('Value not disclosed');
    await expect(page.locator('[data-card="visit-rwanda:back"]')).toContainText('UN Group of Experts');
    // Moving the mouse away doesn't close it.
    await page.mouse.move(700, 880);
    await page.waitForTimeout(1200);
    await expect(expanded(page, 'visit-rwanda:back')).toHaveAttribute('aria-expanded', 'true');
    await page.keyboard.press('Escape');
    await expect(expanded(page, 'visit-rwanda:back')).toHaveAttribute('aria-expanded', 'false');
    await hotspot.click();
    await page.mouse.click(60, 60);
    await expect(expanded(page, 'visit-rwanda:back')).toHaveAttribute('aria-expanded', 'false');
  });

  test('keyboard: Enter on a logo opens its card', async ({ page }) => {
    await page.goto('/clubs/atletico-de-madrid/');
    const hotspot = page.getByRole('button', { name: 'Riyadh Air: show who pays' });
    await hotspot.focus();
    await expect(expanded(page, 'riyadh-air:front')).toHaveAttribute('aria-expanded', 'false');
    await page.keyboard.press('Enter');
    await expect(expanded(page, 'riyadh-air:front')).toHaveAttribute('aria-expanded', 'true');
  });

  test('an open card stays inside the stage and nothing reflows', async ({ page }) => {
    await page.goto('/clubs/atletico-de-madrid/');
    const docH = () => page.evaluate(() => document.documentElement.scrollHeight);
    const before = await docH();
    await page.getByRole('button', { name: 'Visit Rwanda: show who pays' }).click();
    const stage = (await page.locator('section[aria-label="The shirt and its sponsors"]').first().boundingBox())!;
    const card = (await page.locator('[data-card="visit-rwanda:back"]').boundingBox())!;
    expect(card.y + card.height).toBeLessThanOrEqual(stage.y + stage.height + 1);
    expect(await docH()).toBe(before);
  });

  test('timeline: hover does nothing, a click switches the shirt, level and sentence', async ({ page }) => {
    await page.goto('/clubs/arsenal/');
    const summary = page.locator('p:visible', { hasText: 'Rwanda is off the sleeve' });
    await expect(summary).toBeVisible();
    const block = page.getByRole('button', { name: /Show the 2018\/19 – 2025\/26 shirt/ });
    await block.hover();
    await page.waitForTimeout(300);
    await expect(block).toHaveAttribute('aria-pressed', 'false');
    await block.click();
    await expect(block).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByText('Worse from 2018: Visit Rwanda joined')).toBeVisible();
    await expect(page.locator('img[alt="Arsenal Home shirt · 2025/26, front"]').first()).toBeVisible();
    await expect(page).toHaveURL(/\?season=2018-19$/);
    // Arrow keys move between periods.
    await page.keyboard.press('ArrowLeft');
    await expect(page.getByText('Dubai’s government pays for the front of this shirt.')).toBeVisible();
  });

  test('switching periods never moves the page', async ({ page }) => {
    await page.goto('/clubs/arsenal/');
    const tops = async () =>
      page.evaluate(() =>
        ['section[aria-label="The shirt and its sponsors"]', 'section[aria-labelledby="over-the-years"]', 'h1'].map(
          (sel) => {
            const r = document.querySelector(sel)!.getBoundingClientRect();
            return [Math.round(r.top + window.scrollY), Math.round(r.left)];
          },
        ),
      );
    const first = await tops();
    for (const label of ['2006/07 – 2017/18', '2018/19 – 2025/26', '2026/27']) {
      await page.getByRole('button', { name: new RegExp(`Show the ${label.replace(/\//g, '\\/')} shirt`) }).click();
      expect(await tops()).toEqual(first);
    }
  });

  test('a click on a sponsor lane selects its period and opens the card', async ({ page }) => {
    await page.goto('/clubs/arsenal/');
    await page.getByRole('button', { name: 'Visit Rwanda, 2018/19 – 2025/26' }).click();
    await expect(expanded(page, 'visit-rwanda:sleeve')).toHaveAttribute('aria-expanded', 'true');
    await expect(page.getByText('Sleeve · 2018–2026', { exact: false }).first()).toBeVisible();
  });

  test('?season= deep links to a period', async ({ page }) => {
    await page.goto('/clubs/aston-villa/?season=2024-25');
    await expect(
      page.locator('p:visible', { hasText: 'Betano and Trade Nation haven’t been rated yet.' }),
    ).toBeVisible();
    await expect(page.getByRole('button', { name: /Show the 2024\/25 – 2025\/26 shirt/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  test('Tell the club opens a dialog', async ({ page }) => {
    await page.goto('/clubs/aston-villa/');
    await page.getByRole('button', { name: 'Visit Rwanda: show who pays' }).click();
    await page.locator('[data-card="visit-rwanda:front"]').getByRole('button', { name: 'Tell the club' }).click();
    await expect(page.getByRole('dialog', { name: 'Tell Aston Villa' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
  });

  test('clubs without a designed kit have no team page', async ({ page }) => {
    const res = await page.goto('/clubs/chelsea/');
    expect(res?.status()).toBe(404);
  });
});

test.describe('team page (?interaction=hover, the original design)', () => {
  test('hovering a logo opens its card; Esc closes it', async ({ page }) => {
    await page.goto('/clubs/atletico-de-madrid/?interaction=hover');
    const card = page.locator('[data-card="visit-rwanda:back"] button[aria-expanded]');
    await expect(card).toHaveAttribute('aria-expanded', 'false');
    await page.getByRole('button', { name: 'Visit Rwanda: show who pays' }).hover();
    await expect(card).toHaveAttribute('aria-expanded', 'true');
    await page.keyboard.press('Escape');
    await expect(card).toHaveAttribute('aria-expanded', 'false');
  });

  test('hover intent keeps the card open on the way to it', async ({ page }) => {
    await page.goto('/clubs/atletico-de-madrid/?interaction=hover');
    const hit = await page.getByRole('button', { name: 'Riyadh Air: show who pays' }).boundingBox();
    const card = page.locator('[data-card="riyadh-air:front"]');
    await page.mouse.move(hit!.x + 8, hit!.y + hit!.height / 2);
    await expect(card.locator('button[aria-expanded]')).toHaveAttribute('aria-expanded', 'true');
    const box = (await card.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + 30, { steps: 12 });
    await expect(card.locator('button[aria-expanded]')).toHaveAttribute('aria-expanded', 'true');
    await page.mouse.move(700, 150, { steps: 4 });
    await page.mouse.move(700, 880, { steps: 4 });
    await expect(card.locator('button[aria-expanded]')).toHaveAttribute('aria-expanded', 'false', { timeout: 2000 });
  });

  test('hovering a period switches the shirt', async ({ page }) => {
    await page.goto('/clubs/arsenal/?interaction=hover');
    await page.getByRole('button', { name: /Show the 2018\/19 – 2025\/26 shirt/ }).hover();
    await expect(page.getByText('Worse from 2018: Visit Rwanda joined')).toBeVisible();
  });
});
