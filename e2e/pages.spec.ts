import { expect, test, type Page } from '@playwright/test';

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
    // Every club is a link, whether or not its shirt photo is marked up.
    await expect(page.locator('section[aria-label="Stained"] a')).toHaveCount(2);
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
    // The club as a tile in its league, and its deal in the list, both link to its page.
    await expect(page.locator('a[href="/clubs/la-clippers/"]')).toHaveCount(2);
  });
});

test.describe('team page (v3)', () => {
  const row = (page: Page, key: string) => page.locator(`button[aria-controls="panel-${key}"]`);
  const marker = (page: Page, n: number) => page.locator(`[data-marker="${n}"]`);

  test('Arsenal reads top to bottom: what this is, the rating, why, every sponsor, what to do', async ({ page }) => {
    await page.goto('/clubs/arsenal/');
    await expect(page.getByText('What is this?')).toBeVisible();
    await expect(page.getByRole('heading', { level: 1, name: 'Arsenal' })).toBeVisible();
    await expect(page.getByRole('button', { name: /^Stained, 3 of 4\. .* Arsenal is here\.$/ })).toHaveAttribute(
      'data-current',
      'true',
    );
    await expect(
      page.getByText('The shirt is Stained: the front sponsor, Emirates, is owned by the Government of Dubai.'),
    ).toBeVisible();
    await expect(page.getByText('Why is that a problem?')).toHaveCount(1);
    await expect(page.getByText('Better than last season: Visit Rwanda left in June 2026')).toBeVisible();
    await expect(row(page, 'emirates-front')).toHaveAttribute('aria-expanded', 'true');
    await expect(row(page, 'deel-sleeve')).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('#panel-emirates-front')).toContainText('Up to £70m a year');
    await expect(page.locator('#panel-emirates-front')).toContainText('about $93m · SportsPro · deal runs to 2033');
    await row(page, 'gone-visit-rwanda').click();
    await expect(page.locator('#panel-gone-visit-rwanda')).toContainText(
      'Gone since June 2026, after eight seasons. That’s why Arsenal is Stained now, not Soaked.',
    );
    await expect(page.getByText('Help check Deel', { exact: true })).toBeVisible();
    await expect(page.locator('a[aria-current="true"]')).toContainText('2026/27 · now');
    // The old stage, cards, lines and timeline are gone.
    await expect(page.locator('[data-card], [data-seg]')).toHaveCount(0);
    await expect(page.getByText('Over the years')).toHaveCount(0);
  });

  test('rows and markers highlight each other; a marker opens its row and moves focus to it', async ({ page }) => {
    await page.goto('/clubs/arsenal/');
    await row(page, 'emirates-front').hover();
    await expect(marker(page, 1)).toHaveAttribute('data-hl', 'true');
    await expect(marker(page, 2)).not.toHaveAttribute('data-hl', 'true');
    const deelHit = page.getByRole('button', { name: '2: Deel, sleeve' });
    await deelHit.hover();
    await expect(marker(page, 2)).toHaveAttribute('data-hl', 'true');
    await expect(page.locator('[data-hl]').filter({ has: row(page, 'deel-sleeve') })).toHaveCount(1);
    await deelHit.click();
    await expect(row(page, 'deel-sleeve')).toHaveAttribute('aria-expanded', 'true');
    await expect(row(page, 'deel-sleeve')).toBeFocused();
    await expect(page.locator('#panel-deel-sleeve')).toContainText('We haven’t traced who owns Deel yet');
    // Rows open on their own: Emirates stays open.
    await expect(row(page, 'emirates-front')).toHaveAttribute('aria-expanded', 'true');
  });

  test('the number itself is part of the target: hover highlights, a click opens the row', async ({ page }) => {
    await page.goto('/clubs/arsenal/');
    // Deel's number sits above its logo, outside the logo area.
    const two = marker(page, 2);
    const box = (await two.boundingBox())!;
    const logo = (await page.getByRole('button', { name: '2: Deel, sleeve' }).boundingBox())!;
    // Its centre (where we hover and click) is outside the logo area.
    expect(box.y + box.height / 2).toBeLessThan(logo.y);
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await expect(two).toHaveAttribute('data-hl', 'true');
    await expect(page.locator('[data-hl]').filter({ has: row(page, 'deel-sleeve') })).toHaveCount(1);
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    await expect(row(page, 'deel-sleeve')).toHaveAttribute('aria-expanded', 'true');
    // Emirates' number overlaps the logo's left edge: its far left point counts too.
    const one = (await marker(page, 1).boundingBox())!;
    await page.mouse.move(one.x + 4, one.y + one.height / 2);
    await expect(marker(page, 1)).toHaveAttribute('data-hl', 'true');
  });

  test('keyboard: focusing a logo highlights its marker, Enter opens the row', async ({ page }) => {
    await page.goto('/clubs/atletico-de-madrid/');
    const hit = page.getByRole('button', { name: '1: Visit Rwanda, back of shirt' });
    await hit.focus();
    await expect(marker(page, 1)).toHaveAttribute('data-hl', 'true');
    await row(page, 'visit-rwanda-back').click();
    await expect(row(page, 'visit-rwanda-back')).toHaveAttribute('aria-expanded', 'false');
    await hit.focus();
    await page.keyboard.press('Enter');
    await expect(row(page, 'visit-rwanda-back')).toHaveAttribute('aria-expanded', 'true');
  });

  test('rating scale: hover explains a level, Esc closes it, a click pins it', async ({ page }) => {
    await page.goto('/clubs/arsenal/');
    const soaked = page.getByRole('button', { name: /^Soaked, 4 of 4/ });
    await soaked.hover();
    const tip = page.getByRole('tooltip');
    await expect(tip).toContainText('A sponsor with a severe record on the front, or two serious ones.');
    await expect(tip).toContainText('Arsenal was here in 2018/19 – 2025/26');
    await page.mouse.move(700, 880);
    await expect(tip).toHaveCount(0);
    await soaked.click();
    await page.mouse.move(700, 880);
    await expect(tip).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(tip).toHaveCount(0);
  });

  test('seasons: a click switches the shirt without moving the page; "What you can do" stays on today', async ({
    page,
  }) => {
    await page.goto('/clubs/arsenal/');
    const season = page.getByRole('link', { name: /2018\/19 – 2025\/26/ });
    await season.scrollIntoViewIfNeeded();
    const y = await page.evaluate(() => window.scrollY);
    await season.click();
    await expect(page).toHaveURL(/\?season=2018-19$/);
    expect(await page.evaluate(() => window.scrollY)).toBe(y);
    await expect(season).toHaveAttribute('aria-current', 'true');
    await expect(page.getByText('You’re looking at an old shirt (2018/19 – 2025/26).')).toBeVisible();
    await expect(page.getByText(/^The shirt was Soaked: Emirates on the front/)).toBeVisible();
    await expect(page.getByText('Worse from 2018: Visit Rwanda joined')).toBeVisible();
    await expect(page.getByText('Why is that a problem?')).toHaveCount(2);
    await expect(row(page, 'visit-rwanda-sleeve')).toHaveAttribute('aria-expanded', 'true');
    await expect(page.getByText('THE SHIRT · HOME 2018/19 – 2025/26', { exact: false })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Write to Arsenal about Emirates' })).toBeVisible();
    await page.goBack();
    await expect(page.getByText('You’re looking at an old shirt', { exact: false })).toHaveCount(0);
    await page.goForward();
    await page.getByRole('link', { name: 'Back to today’s shirt →' }).click();
    await expect(page).toHaveURL(/\/clubs\/arsenal\/$/);
    await expect(page.getByText(/^The shirt is Stained/)).toBeVisible();
  });

  test('?season= deep links to a period; a not-rated shirt highlights no level', async ({ page }) => {
    await page.goto('/clubs/aston-villa/?season=2024-25');
    await expect(
      page.getByText('We haven’t rated this shirt yet: nobody has traced who owns Betano or Trade Nation.'),
    ).toBeVisible();
    await expect(page.getByText('Rating · not rated yet', { exact: false })).toBeVisible();
    await expect(page.locator('button[data-current]')).toHaveCount(0);
    await expect(page.getByText('Why is that a problem?')).toHaveCount(0);
  });

  test('Tell the club: the draft follows the ticks and never uses an invented address', async ({ page }) => {
    await page.goto('/clubs/arsenal/');
    const draft = page.locator('[data-draft]');
    await expect(draft).toContainText('Dear Arsenal,');
    await expect(draft).toContainText('But our front sponsor, Emirates, is owned by the Government of Dubai.');
    await expect(page.getByRole('checkbox', { name: 'Deel can’t be included until it is rated' })).toBeDisabled();
    await page.getByRole('checkbox', { name: 'Include Emirates in the message to Arsenal' }).uncheck();
    await expect(draft).toHaveText('Tick a sponsor to see your message.');
    await expect(page.getByRole('button', { name: 'Tick a sponsor first' })).toBeDisabled();
    await page.getByRole('checkbox', { name: 'Include Emirates in the message to Arsenal' }).check();
    await page.getByRole('button', { name: 'Write to Arsenal about Emirates' }).click();
    const dialog = page.getByRole('dialog', { name: 'Your message to Arsenal' });
    await expect(dialog).toBeVisible();
    await expect(dialog.locator('textarea')).toHaveValue(/^Dear Arsenal,/);
    await expect(dialog.locator('a[href^="mailto:"]')).toHaveCount(0);
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
  });

  test('Atlético: the back sponsor gets the full back photo and marker 1; no seasons', async ({ page }) => {
    await page.goto('/clubs/atletico-de-madrid/');
    await expect(page.getByText('Why is that a problem?')).toHaveCount(2);
    await expect(page.getByRole('img', { name: /back$/ })).toHaveJSProperty('width', 480);
    await expect(page.getByRole('button', { name: '1: Visit Rwanda, back of shirt' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Write to Atlético about 2 sponsors' })).toBeVisible();
    await expect(page.getByText('Travel back in time')).toHaveCount(0);
  });

  test('Follow opens a dialog, since alerts aren’t live', async ({ page }) => {
    await page.goto('/clubs/aston-villa/');
    await page.getByRole('button', { name: 'Follow Aston Villa' }).click();
    await expect(page.getByRole('dialog', { name: 'Follow Aston Villa' })).toContainText('Alerts aren’t live yet.');
  });

  test('the fact sheet lists every claim with its source', async ({ page }) => {
    await page.goto('/clubs/arsenal/');
    await page.getByRole('link', { name: 'All sources for Emirates →' }).click();
    await expect(page).toHaveURL(/\/clubs\/arsenal\/fact-sheet\/#emirates$/);
    await expect(page.getByRole('button', { name: 'Print or save as PDF' })).toBeVisible();
    for (const id of ['emirates', 'deel', 'visit-rwanda']) await expect(page.locator(`section#${id}`)).toHaveCount(1);
    const claims = page.locator('ol li');
    await expect(claims).toHaveCount(6);
    for (const li of await claims.all()) await expect(li).toContainText(/, (\w{3} )?\d{4}\./);
    await expect(page.getByText('Ratings are illustrative until the method is final.')).toBeVisible();
  });

  test('every club on a league page links to its own page', async ({ page }) => {
    await page.goto('/soccer/premier-league/');
    const cards = page.locator('main section[aria-label] a[href^="/clubs/"]');
    const clubs = await cards.evaluateAll((as) => [...new Set(as.map((a) => a.getAttribute('href')))]);
    // 20 clubs: 6 rated cards and 14 "not rated yet" tiles in the seed.
    expect(clubs.length).toBe(20);
    await page.getByRole('link', { name: 'Newcastle United' }).first().click();
    await expect(page).toHaveURL(/\/clubs\/newcastle-united\/$/);
    await expect(page.getByRole('heading', { level: 1, name: 'Newcastle United' })).toBeVisible();
  });

  test('a club without a marked-up shirt still has a full page', async ({ page }) => {
    await page.goto('/clubs/newcastle-united/');
    // A square photo, no markers, and every sponsor in the list.
    await expect(page.getByText('The logos on this photo aren’t marked yet.', { exact: false })).toBeVisible();
    await expect(page.getByText('Click a row for the money and the evidence.', { exact: true })).toBeVisible();
    await expect(page.locator('[data-marker]')).toHaveCount(0);
    await expect(page.locator('button[aria-controls="panel-noon-sleeve"]')).toBeVisible();
    await expect(page.getByRole('link', { name: /2025\/26/ })).toBeVisible();
    // A club with no shirt on file says so, and offers to help check it.
    await page.goto('/clubs/bayern-munich/');
    await expect(page.getByText('We haven’t recorded the sponsors on Bayern Munich’s shirt yet.')).toBeVisible();
    await expect(page.getByText('No shirt on file yet.')).toBeVisible();
    await expect(page.getByText('Help check Bayern Munich', { exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Tell Bayern Munich' })).toHaveCount(0);
  });

  test('clubs that aren’t in the data have no page', async ({ page }) => {
    const res = await page.goto('/clubs/not-a-club/');
    expect(res?.status()).toBe(404);
  });
});
