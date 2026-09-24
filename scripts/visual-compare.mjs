// Visual check against the design snapshots (handover/design/static).
// Screenshots each route and its snapshot full page at 1440 wide, and writes a side-by-side
// image per route to test-results/visual/. Serves handover/ itself; the site must be running:
//
//   npm run build && npm run preview &        (or npm run dev, then --site http://localhost:3000)
//   node scripts/visual-compare.mjs [--site http://localhost:4173] [name…]
import { chromium } from '@playwright/test';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';

const TYPES = {
  '.html': 'text/html',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.json': 'application/json',
  '.css': 'text/css',
  '.js': 'text/javascript',
};
/** A tiny static server for the handover folder. */
function serveDir(dir) {
  const server = http.createServer((req, res) => {
    const p = path.join(dir, decodeURIComponent(new URL(req.url, 'http://x').pathname));
    if (!p.startsWith(path.resolve(dir)) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) {
      res.writeHead(404).end();
      return;
    }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(p)] ?? 'application/octet-stream' });
    fs.createReadStream(p).pipe(res);
  });
  return new Promise((resolve) => server.listen(0, () => resolve(server)));
}

const arg = (name, fallback) => {
  const i = process.argv.indexOf(name);
  return i > 0 ? process.argv[i + 1] : fallback;
};
const SITE = arg('--site', 'http://localhost:4173');
const designServer = await serveDir(path.resolve('handover'));
const DESIGN = `http://localhost:${designServer.address().port}`;
const only = process.argv.slice(2).filter((a, i, all) => !a.startsWith('--') && !all[i - 1]?.startsWith('--'));
const OUT = path.join('test-results', 'visual');

/** Each case: our route, the snapshot, and an optional action to reach the state. */
const CASES = [
  { name: 'landing', route: '/', design: 'landing.html', wait: 10000 },
  {
    name: 'landing--search-open',
    route: '/',
    design: 'landing--search-open.html',
    act: async (p) => {
      await p.getByRole('combobox').first().fill('rwa');
    },
  },
  { name: 'overview-premier-league', route: '/soccer/premier-league/', design: 'overview-premier-league.html' },
  { name: 'overview-la-liga', route: '/soccer/la-liga/', design: 'overview-la-liga.html' },
  { name: 'team-atletico', route: '/clubs/atletico-de-madrid/', design: 'team-atletico.html' },
  {
    name: 'team-atletico--card-open',
    route: '/clubs/atletico-de-madrid/',
    design: 'team-atletico--card-open.html',
    act: async (p) => {
      await p.getByRole('button', { name: 'Visit Rwanda: show who pays' }).hover();
    },
  },
  { name: 'team-arsenal', route: '/clubs/arsenal/', design: 'team-arsenal.html' },
  { name: 'team-arsenal--2018-2026', route: '/clubs/arsenal/?season=2018-19', design: 'team-arsenal--2018-2026.html' },
  { name: 'team-arsenal--2006-2018', route: '/clubs/arsenal/?season=2006-07', design: 'team-arsenal--2006-2018.html' },
  { name: 'team-villa', route: '/clubs/aston-villa/', design: 'team-villa.html' },
  { name: 'team-villa--2024-2026', route: '/clubs/aston-villa/?season=2024-25', design: 'team-villa--2024-2026.html' },
];

fs.mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });

for (const c of CASES.filter((c) => !only.length || only.includes(c.name))) {
  const page = await ctx.newPage();
  await page.goto(`${DESIGN}/design/static/${c.design}`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  const design = await page.screenshot({ fullPage: true });
  await page.goto(`${SITE}${c.route}`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  if (c.act) await c.act(page);
  await page.waitForTimeout(400);
  const site = await page.screenshot({ fullPage: true });
  fs.writeFileSync(path.join(OUT, `${c.name}.design.png`), design);
  fs.writeFileSync(path.join(OUT, `${c.name}.site.png`), site);

  // Side by side, design on the left.
  const b64 = (buf) => `data:image/png;base64,${buf.toString('base64')}`;
  await page.setViewportSize({ width: 2900, height: 900 });
  await page.setContent(
    `<body style="margin:0;background:#555;display:flex;gap:20px;align-items:flex-start">
       <img src="${b64(design)}" style="width:1440px"><img src="${b64(site)}" style="width:1440px"></body>`,
  );
  await page.screenshot({ path: path.join(OUT, `${c.name}.side-by-side.png`), fullPage: true });
  await page.close();
  console.log(`${c.name}: ${OUT}/${c.name}.side-by-side.png`);
}
await browser.close();
designServer.close();
