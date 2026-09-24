# 02. Implementation plan

Work through the milestones in order. Each has tasks and acceptance criteria. Snapshot names refer to `design/static/`.

---

## M0. Orientation and setup

**Tasks**
1. Read `docs/01-project-brief.md` completely, then skim the static snapshots in a browser at 1440px wide.
2. Look at the repository:
   - Is there an existing app or framework? If so, build inside it.
   - Is there existing data (`data/`, `datasets/`, CSV or JSON files), scraping pipelines (`pipelines/`) or agents (`agents/`)? List what you find with a one-line summary each.
   - Is there a separate data repository or API? Check the README, `.gitmodules`, package names and env files. If you find a reference but no access, ask the user.
3. If there is no app: create a Next.js App Router + TypeScript project. Add ESLint, Prettier, Vitest and Playwright. Scripts: `dev`, `build`, `test`, `test:e2e`, `validate:data`.
4. Copy `assets/` to `public/assets/`, keeping paths identical so data paths like `assets/crests/arsenal.png` resolve as `/assets/crests/arsenal.png`.
5. Set up the fonts (Big Shoulders Display 700/800/900, Schibsted Grotesk 400/500/700, IBM Plex Mono 400/600) and the tokens in `docs/04-design-system.md` as CSS custom properties in a global stylesheet.

**Done when:** the app runs, shows a dark page with the header and correct fonts, and you've written a short note (in the PR or README) on what existing data and pipelines you found.

---

## M1. Data layer ("connect to the data that is available")

**Tasks**
1. Recreate `data/schema/*.schema.json` as zod schemas in `lib/data/schema.ts`.
2. Define a `DataSource` interface in `lib/data/source.ts` that returns: sports, leagues, clubs, owners, claims, sponsors, kits, deals, changes, dropped, levels, tiers.
3. Implement `SeedSource`, which reads `data/seed/*.json` at build time.
4. If M0 found real data, implement a `RepoSource` or `ApiSource` adapter that maps it onto the same schema. Document the field mapping in `lib/data/README.md`. Keep the seed as a fallback and as test fixtures. Choose the source with an env var (`BTJ_DATA_SOURCE=seed|repo|api`).
5. Implement **derived selectors** in `lib/data/derive.ts`:
   - `levelForKit(kit)`, using the rule in `docs/05-data-model.md` §4 (`levelOverride` wins if present).
   - `currentKit(clubId)`, the latest season home kit.
   - `clubLevel(clubId)`, the level of the current kit.
   - `leagueSummary(leagueId)`: clubs sorted worst first, counts per level, the number of clubs with a bad sponsor (Spotted or worse), rated and total counts.
   - `sponsorsForClubKit(kitId)`: joins sponsor, owner, tier, claims (with sources) and deal value.
   - `clubsForSponsor(sponsorId)`, for search results and later sponsor pages.
6. Build a **search index** at build time (see `docs/06-interactions.md` §1): clubs, leagues, sports and sponsors, with label, description, aliases, type, rating and link.
7. Add `npm run validate:data`, which validates every file against the schemas and checks references (every `sponsorId`, `clubId`, `ownerId` and `claimId` exists, and every asset path exists).

**Tests (Vitest)**
- The rating rule gives exactly these levels for the seed kits: Atlético 2026/27 Soaked; Arsenal 2006–18 Stained, 2018–26 Soaked, 2026/27 Stained; Villa 2024–26 Not rated, 2026/27 Soaked; Man City Stained; Newcastle 2025/26 Stained, 2026/27 Spotted; Brighton Clean; Real Madrid Stained; every other club Not rated.
- The Premier League summary gives "4 of 20" bad (Spotted or worse), 1 Soaked, 2 Stained, 1 Spotted, 1 Clean and 15 not rated.
- The search examples in `docs/06-interactions.md` return the listed results.

**Done when:** pages can pull everything through `lib/data` and `validate:data` passes.

---

## M2. Shared components

Build them in isolation first. A simple `/dev/components` page is enough.

- `SiteHeader`: logo mark and wordmark (links to `/`), nav (Sports, How we rate, Contribute) and the "Open data on GitHub" pill.
- `SiteFooter`: the variant with "YOUR CHEST. THEIR AD." on the landing page, and the standard variant.
- `LevelMeter`: 4 bars of increasing height, filled up to the level, in sizes S/M/L/XL. Not rated uses dashed outlines.
- `LevelChip`: a small coloured block with a meter and the level word (used on change cards).
- `LevelBand`: the full-width coloured band on overview cards, with meter, word and "4 OF 4".
- `LevelWord`: the big condensed level word in the level colour.
- `TierLabel`: Severe, Serious, Concern, Nothing found or Not rated yet, in the tier colour.
- `CrestBadge`: the crest on a white circle (sizes 26/30/40/48/56/72), with initials as a fallback when there is no crest.
- `LogoMark`: the jersey outline with a red splat scaled by tier (see `docs/04-design-system.md`).
- `SearchBox`: input plus results dropdown (hero and compact sizes).
- `ChangeCard`, `DroppedCard`, `LeagueStripRow`, `ClubCard` (overview), `SponsorCard` (team page), `StepCard`, `SectionHeading`, `PillButton`.

**Done when:** every component matches its look in the snapshots and has keyboard focus styles.

---

## M3. Landing page `/`

Spec: `docs/03-page-specs.md` §2. Snapshots: `landing.html`, `landing--search-open.html`.

Sections: hero (rotating headline, search, try-chips, level key) → Just changed (4 latest changes) → They dropped it (6 featured, positive) → League by league (6 soccer leagues) → How we rate (5 steps plus level definitions) → How to help (3 ways plus unrated-club chips plus buttons) → footer with "Your chest. Their ad."

**Acceptance**
- The headline rotates through 7 words at 1.3s each, stops on "loyalty", and replays when the word is clicked. With reduced motion it shows "loyalty" and doesn't animate. Screen readers get "Who's buying your loyalty?".
- All lists come from data: changes sorted newest first, dropped with `featured: true`, the league strips from `leagueSummary`, and the unrated chips from the Premier League clubs that aren't rated.
- The "Know a club that changed? Tell us" and "How to help" buttons link to the contribute anchor or the repo URL from config (`NEXT_PUBLIC_REPO_URL`; leave a visible `[org]` placeholder until it is set).

---

## M4. Soccer overview `/soccer/[league]`

Spec: `docs/03-page-specs.md` §3. Snapshots: `overview-premier-league.html`, `overview-la-liga.html`.

**Acceptance**
- The sport tabs and league chips are links (`/soccer/premier-league`, `/soccer/la-liga`, …). Other sports show their "not mapped yet" panel.
- The "every club at a glance" strip shows one slot per club, worst first, and pads with dashed slots up to `clubCount` when clubs aren't in the data yet (La Liga shows 2 real plus 18 dashed).
- Level groups appear side by side with **equal header heights, so every card starts at the same y**, and cards in a row have equal heights. This was a specific piece of feedback.
- Club cards link to `/clubs/[slug]` when a team page can be rendered (the club has a kit with photos). Otherwise they aren't links, or they link to a "coming soon" state.
- The "They dropped it" block at the bottom comes from data.

---

## M5. Team page `/clubs/[slug]`

Spec: `docs/03-page-specs.md` §4 and `docs/06-interactions.md` §3–§5. Snapshots: `team-atletico*.html`, `team-arsenal*.html`, `team-villa*.html`.

**Acceptance**
- One template renders Atlético, Arsenal and Villa purely from `kits.json` plus the joins.
- Title row: the level box (meter plus level word) and the club name with crest are **the same size on the same baseline**. Below them: "Blood level · 4 of 4 · worst", the season label, the change badge and the summary sentence.
- The stage shows front and back photos side by side, both at once. There is one card per sponsor, placed by `cardSlot` (L, R or T). A line runs from each card to the logo hotspot and ends in a ring. The hover areas are invisible, with no outline.
- Hovering or focusing a logo hotspot, line, ring or card opens that card. Moving the pointer toward an open card keeps it open (hover intent). Clicking toggles it, for touch.
- Collapsed cards show the preview with a fade. Expanded cards show the verdict, money (or "value not disclosed"), claims with sources, and buttons ("Tell the club", "Share" for rated sponsors, "Help rate this sponsor" for unrated ones).
- Timeline, only when a club has more than one period: hovering or focusing a period swaps shirt, level, badge and sentence. Hovering a sponsor lane selects that period and opens that sponsor's card. There are no pop-ups from the timeline.
- `?season=2018-19` (any season inside a period) deep-links to that period.

---

## M6. Responsive, accessibility, performance, SEO

- Mobile: keep the order and hierarchy. The overview level groups stack vertically, each keeping its header and cards. On the team page the stage becomes photos first (front and back swipeable or stacked), then the sponsor cards as a list with numbered markers on the photo in place of lines. The timeline scrolls horizontally.
- Keyboard: tab through search results (arrow keys move, Enter opens), timeline periods, logo hotspots and cards. Esc closes an open card or dropdown.
- `prefers-reduced-motion`: no headline rotation or card animations.
- Metadata: a title and description per page, plus Open Graph images (for now a simple generated card: club crest, level word and meter).
- Performance: images through `next/image` with fixed sizes. The static export must work without a server.

---

## M7. Tests, visual check, docs, preview deploy

- Playwright: each page loads, search returns results, a sponsor card opens on hover and on focus, and timeline periods switch.
- Visual comparison: screenshot each route at 1440×900 full page and compare it side by side with the matching `design/static/*.html` screenshot. Write down any intentional differences.
- README: setup, data sources, how to add a club, a kit (with hotspots), a sponsor, a claim and a change, and the licensing caveat for images.
- Deploy a **password-protected or private preview** only. No public launch until the image rights and rating method are cleared.
