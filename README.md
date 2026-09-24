# Behind the Jersey

A fan-facing website that shows who really pays for the sponsors on sports jerseys, and rates each club's shirt with a blood level: **Clean, Spotted, Stained, Soaked**.

> **Preview.** The shirt photos and crests aren't cleared for public use yet (see [`public/assets/manifest.json`](public/assets/manifest.json)), and all ratings are illustrative until the method is agreed. The site is public at https://behind-the-jersey.org but asks search engines not to index it.

Built from the design handover in [`handover/`](handover/README.md): Next.js (App Router) + TypeScript, statically exported, CSS Modules with the design tokens as CSS custom properties, data validated with zod.

## Run it

Needs Node 22.12+ (24 LTS recommended, see `.nvmrc`).

```bash
npm install
npm run dev          # http://localhost:3000
```

| Script | What it does |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Validates the data, then writes the static site to `out/` |
| `npm run preview` | Serves `out/` on http://localhost:4173 |
| `npm test` | Unit tests (Vitest): rating rule, league summaries, search, data checks, hover intent |
| `npm run test:e2e` | Builds, serves `out/` and runs the Playwright tests (desktop 1440×900 and a phone) |
| `npm run validate:data` | Validates the configured data source against the schemas and checks references and assets |
| `npm run data:pull` | Clones or updates Beyond-The-Jersey/data into `.data-repo/` |
| `npm run lint` / `npm run typecheck` | ESLint / TypeScript |
| `node scripts/visual-compare.mjs` | Side-by-side screenshots of each route and its design snapshot in `test-results/visual/` (site must be running, `--site <url>`) |

## Where the data comes from

Every page reads its content through [`lib/data`](lib/data/README.md), which loads 14 JSON files, validates them against [`data/schema`](data/schema) and derives everything else (club levels, league summaries, the search index). Choose the source with `BTJ_DATA_SOURCE`:

| Source | Reads |
|---|---|
| `seed` (default) | [`data/seed/`](data/seed): every fact the designs use, with sources |
| `repo` | a checkout of Beyond-The-Jersey/data, folder `normalized/` (run `npm run data:pull` first; override with `BTJ_DATA_DIR`) |
| `api` | `$BTJ_DATA_URL/<file>.json` over HTTP, with `$BTJ_DATA_TOKEN` as a bearer token |

The data repo doesn't publish the normalised files yet: its per-team files have no seasons, placements, owner chains or sourced claims. What we asked the data agent for, with a field-by-field mapping, is in [`docs/data-request/`](docs/data-request/README.md). Until it lands, the site builds from the seed.

Club levels are never stored: they're derived from the sponsors' tiers and where they sit on the shirt ([`lib/data/rating.ts`](lib/data/rating.ts), the draft rule from the handover). `kits[].levelOverride` exists for exceptions.

## Adding content

All in `data/seed/` (or the same files in the data repo). Run `npm run validate:data` after each change.

- **Club:** add it to `clubs.json` with an ASCII kebab-case `id`, `leagueId` and `aliases` (what fans type: "spurs", "gunners"). Put the crest at `public/assets/crests/<id>.png` (200×200 PNG) and set `crest: "assets/crests/<id>.png"`, or `null` to show initials.
- **Kit:** one entry per club per season, or per period when nothing changed (`periodFrom`/`periodTo`, `periodLabel` "2006/07 – 2017/18"). List each sponsor with its `placement` and a `source`. For a team page, add front and back photos (720×800 on white) under `public/assets/shirts/<club>/<season>-home-{front,back}.jpg` and give every sponsor `side`, `cardSlot` (`L`, `R` or `T` for sleeves) and a `hotspot`: the logo's centre and size as fractions of the photo. Measure the logo box in pixels and divide by 720 and 800; a logo centred at (369, 314) and 266×104 px is `{ "x": 0.513, "y": 0.393, "w": 0.37, "h": 0.13 }`. A club gets a team page as soon as its latest kit has both photos and every hotspot.
- **Sponsor:** add it to `sponsors.json` with `tier: "unrated"` and `status: "unrated"` until it's been researched. A tier of concern or worse needs `ownerId` and at least one claim.
- **Owner:** `owners.json`, with `parentId` up to the state (e.g. Riyadh Air → `saudi-pif` → `government-of-saudi-arabia`).
- **Claim:** `claims.json`: one sourced statement about an owner, `source: { name, date, url }`. Link it from the sponsor's `claimIds`. Set `reviewed: true` only once a person checked it.
- **Deal (money):** `deals.json`, always "reported" with a source; `value: null` shows "Value not disclosed".
- **Change:** `changes.json`. The landing page shows the newest four (by month; within a month, file order).
- **Dropped:** `dropped.json` with `featured: true` to show it on the landing page. Items about an organisation rather than a club use `orgName` and `leagueId`.
- **Contacts:** `contacts.json`: public channels a club publishes, each with the URL of the page it's on. They power the "Tell the club" button. No placeholders or guessed addresses: validation rejects them.

## Configuration

Copy `.env.example` to `.env.local`.

| Variable | Default | Purpose |
|---|---|---|
| `NEXT_PUBLIC_REPO_URL` | unset | The public GitHub repo. Until it's set, repo links go to `/#contribute` and the page shows a `github.com/[org]` placeholder. |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` | Absolute URLs for Open Graph images |
| `NEXT_PUBLIC_SHOW_TEAM_CREST` | `true` | The crest next to the club name on team pages (a test feature) |
| `BTJ_DATA_SOURCE`, `BTJ_DATA_DIR`, `BTJ_DATA_URL`, `BTJ_DATA_TOKEN` | `seed` | See above |

## Deploying

The site is on GitHub Pages at **https://behind-the-jersey.org**. [`.github/workflows/pages.yml`](.github/workflows/pages.yml) builds and deploys `main` after CI passes (or on demand from the Actions tab). The custom domain is set in the repo's Pages settings; DNS is at Gandi (apex `A`/`AAAA` records to GitHub Pages, `www` as a `CNAME` to `beyond-the-jersey.github.io`).

`npm run build` writes a fully static site to `out/`, so any static host works. Routes end in `/` (`trailingSlash`), and a post-build step gives the Open Graph images a `.png` extension so static hosts serve them as images.

Pages are still marked `noindex` (see `app/layout.tsx`) until the team clears the image rights and the rating method.

## Layout

```
app/                 routes: / · /soccer/[league] · /[sport] · /clubs/[slug] (+ opengraph-image)
components/          shared components; overview/ and team/ for the two big pages
lib/data/            data layer (see its README)
lib/search.ts        search matching (runs in the browser)
lib/og/              share-card rendering and the TTF it needs (SIL OFL)
data/seed, schema    seed data and JSON Schemas; data/validate.py is the same check in Python for the data agent
docs/data-request/   what the website needs from Beyond-The-Jersey/data
e2e/, tests/         Playwright and Vitest
handover/            the design handover as received (docs, snapshots, design source, assets)
public/assets/       crests and shirt photos from the handover (not cleared for public use)
public/fonts/        Big Shoulders Display, self-hosted (SIL OFL; licence in OFL.txt)
```

## Differences from the design we chose to keep

Compared with `handover/design/static/*` at 1440px:

- **Data over design copy.** Where the data says something different, the page follows the data: source lines name the actual source (the Arsenal renewal cites Inside World Football), club short names come from `clubs.json` ("Palace", "Forest"), league notes are the full sentences from `leagues.json`, PSG shows up in the Ligue 1 strip, the Visit Rwanda card lists all five sourced claims, and placements show dates from the deals ("Sleeve · 2018–2026", "from 2026/27").
- **"[DEAL VALUE]"** is shown as "Value not disclosed". Known values show the reported amount, the USD approximation and the source.
- **Overview "They dropped it"** uses the landing page's teal cards, filtered to the league, as the handover recommends, instead of the older stamp style.
- **Team pages have the standard footer** with the photo licensing note. The design source has no footer there.
- **Header links without a destination** ("Sources", "About") point to the repo and the contribute section. "About" is dropped.
- **Other cards don't fade** when a sponsor card is open, only the other lines, as in the design source (the page spec says cards fade too).
- **Search icons** use generic initials (EA, RA) rather than the hand-picked codes (EY, RX).
- **"Say thanks"** has no destination yet, as the handover says. **"Share"** uses the phone's share sheet or copies a link. **"Tell the club"** opens the club's sourced contacts (none in the seed yet).
- **Page heights** are natural. The design artboards have fixed heights with extra space before the footer.

## Open questions for the team

See [`handover/docs/07-open-questions.md`](handover/docs/07-open-questions.md), plus:

- "Your chest. Their ad." uses the design's dark red `#8a2a22`, about 2.3:1 on the background. That's below the 4.5:1 contrast rule; it's deliberately quiet. Keep it or lighten it?
- The "Tell the club" dialog and its draft message are new copy that needs a review.
- The GitHub org is `Beyond-The-Jersey` while the site is "Behind the Jersey". Is that the final name for `NEXT_PUBLIC_REPO_URL`?
