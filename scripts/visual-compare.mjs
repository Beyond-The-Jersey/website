// Visual check against the design snapshots (handover/design/static, handover/update-v3/design/static).
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

/** Each case: our route, the snapshot (a path in handover/), and an optional action to reach the state. */
const V3 = 'update-v3/design/static';
const CASES = [
  { name: 'landing', route: '/', design: 'design/static/landing.html', wait: 10000 },
  {
    name: 'landing--search-open',
    route: '/',
    design: 'design/static/landing--search-open.html',
    act: async (p) => {
      await p.getByRole('combobox').first().fill('rwa');
    },
  },
  {
    name: 'overview-premier-league',
    route: '/soccer/premier-league/',
    design: 'design/static/overview-premier-league.html',
  },
  { name: 'overview-la-liga', route: '/soccer/la-liga/', design: 'design/static/overview-la-liga.html' },
  // Team page v3 (handover/update-v3). The first handover's team snapshots are superseded.
  { name: 'team-arsenal-v3', route: '/clubs/arsenal/', design: `${V3}/team-arsenal-v3.html` },
  {
    name: 'team-arsenal-v3--scale-tooltip-soaked',
    route: '/clubs/arsenal/',
    design: `${V3}/team-arsenal-v3--scale-tooltip-soaked.html`,
    act: async (p) => {
      await p.getByRole('button', { name: /^Soaked, 4 of 4/ }).hover();
    },
  },
  {
    name: 'team-arsenal-v3--hover-emirates',
    route: '/clubs/arsenal/',
    design: `${V3}/team-arsenal-v3--hover-emirates.html`,
    act: async (p) => {
      await p.locator('button[aria-controls="panel-emirates-front"]').hover();
    },
  },
  {
    name: 'team-arsenal-v3--all-rows-open',
    route: '/clubs/arsenal/',
    design: `${V3}/team-arsenal-v3--all-rows-open.html`,
    act: async (p) => {
      await p.locator('button[aria-controls="panel-deel-sleeve"]').click();
      await p.locator('button[aria-controls="panel-gone-visit-rwanda"]').click();
      await p.mouse.move(0, 0);
    },
  },
  {
    name: 'team-arsenal-v3--nothing-ticked',
    route: '/clubs/arsenal/',
    design: `${V3}/team-arsenal-v3--nothing-ticked.html`,
    act: async (p) => {
      await p.getByRole('checkbox', { name: 'Include Emirates in the message to Arsenal' }).uncheck();
      await p.mouse.move(0, 0);
    },
  },
];

fs.mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });

for (const c of CASES.filter((c) => !only.length || only.includes(c.name))) {
  const page = await ctx.newPage();
  await page.goto(`${DESIGN}/${c.design}`, { waitUntil: 'networkidle' });
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
