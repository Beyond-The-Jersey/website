# 05. Data model

The seed data in `data/seed/` holds every fact used by the designs, normalised and with sources. The schemas are in `data/schema/`. The live project will publish its data, pipelines and agents on GitHub. Treat the seed as the contract that the real data must be mapped onto.

## 1. Entities

```
sport 1─* league 1─* club 1─* kit (one per season or period) *─* sponsor (via kit.sponsors[] with placement + hotspot)
                                                                     sponsor *─1 owner *─0..1 owner (parent chain, e.g. fund → state)
                                                                     claim *─* owner (evidence, each with a source)
deal: club × sponsor × placement × period → value (money, with source)
change: dated event on a club (worse / better / renewed / being-rated)
dropped: positive precedent (a club or organisation ended a bad deal)
levels, tiers: display scales
```

| File | Key fields | Notes |
|---|---|---|
| `levels.json` | id (`not-rated`, `clean`, `spotted`, `stained`, `soaked`), meter 0–4, label, definition, colours | Display scale for clubs |
| `tiers.json` | id (`unrated`, `none`, `concern`, `serious`, `severe`), score null/0–3 | Per-sponsor severity |
| `sports.json` | id, label, status | soccer is active, the rest not mapped |
| `leagues.json` | id, sportId, name, country, clubCount, season, status, notes, optional `frontOfShirtTotal` | `clubCount` drives the dashed placeholders |
| `clubs.json` | id (slug), name, shortName, code, leagueId, crest path, aliases, hasTeamPageDesign | 27 clubs (all 20 PL clubs as used in the design) |
| `owners.json` | id, name, type (state, state-fund, listed-company…), country, via, parentId | e.g. `saudi-pif` → `government-of-saudi-arabia` |
| `claims.json` | id, ownerIds[], text, short, source {name, date, url}, reviewed | **Only sourced claims.** Several source URLs are still `null` with a note. Fill them in, never invent them. |
| `sponsors.json` | id, name, ownerId, ownership (owned / part-owned), tier, status, verdict, claimIds, aliases, note | Unrated sponsors have tier `unrated` |
| `kits.json` | id, clubId, season, periodLabel, periodFrom/To, photos {front, back, square}, sponsors[] {sponsorId, placement, side, hotspot {x,y,w,h}, cardSlot}, sponsorsComplete, summary, change, levelOverride? | See §3 for hotspots |
| `deals.json` | clubId or orgName, sponsorId, placement, from/to, value {amount, currency, unit "m", per, upTo, usdApprox}, source, note | Money is always "reported" |
| `changes.json` | date, datePrecision, clubId, sponsorId, kind, levelAfter, title, text, source | Landing "Just changed" |
| `dropped.json` | year, clubId or orgName, sponsorId, what, text, source, featured, todo | Landing "They dropped it" |

Seasons are written `YYYY-YY` (e.g. `2026-27`). Calendar-year leagues use `YYYY`.

## 2. Assets

`assets/manifest.json` lists each file with `designAssetId` (the ID used in the design source as `/_blob/<id>`), path, kind (crest, shirt-photo, shirt-square), club, season, side, source and licence status. Paths in the data are relative to the site root (`assets/...`). Serve `assets/` as `/assets/`.

Shirt photos are 720×800 on a white background, one front and one back per kit period. Square shirt images (520×520) exist for the 2026/27 home kits but aren't used by the crest overview. Crests are 200×200 PNG with transparency.

## 3. Logo hotspots (team page)

`kit.sponsors[].hotspot` = `{ x, y, w, h }` where:
- `x`, `y` are the **centre of the sponsor logo** as fractions of the photo width and height (0–1).
- `w`, `h` are the **logo's width and height** as fractions of the photo.
- `side` says which photo (`front` or `back`).
- `cardSlot` says where the card sits around the stage: `L` (left column), `R` (right column) or `T` (top row, used for sleeve sponsors).

To add a kit, measure the logo box on the 720×800 photo and divide by 720 and 800. Example: the Visit Rwanda box on the Villa 2026/27 front is centred at (369, 314) px and 266×104 px, which gives `{x:.513, y:.393, w:.37, h:.13}`.

## 4. Rating rule (draft, illustrative)

The method isn't final. Implement this rule in one pure function with unit tests, so it can be swapped later.

```ts
type Tier = 'unrated' | 'none' | 'concern' | 'serious' | 'severe';
const SCORE = { unrated: null, none: 0, concern: 1, serious: 2, severe: 3 } as const;

function levelForKit(kit): Level {
  if (kit.levelOverride) return kit.levelOverride;
  const s = kit.sponsors.map(p => ({ placement: p.placement, score: SCORE[sponsor(p.sponsorId).tier] }));
  const rated = s.filter(x => x.score !== null);
  if (rated.length === 0) return 'not-rated';
  const severeFront = rated.some(x => x.score === 3 && x.placement === 'front');
  const seriousOrWorse = rated.filter(x => x.score >= 2).length;
  if (severeFront || seriousOrWorse >= 2) return 'soaked';
  if (rated.some(x => x.score === 2 && x.placement === 'front') ||
      rated.some(x => x.score === 3 && x.placement !== 'front')) return 'stained';
  if (rated.some(x => x.score >= 1)) return 'spotted';
  if (rated.length === s.length && kit.sponsorsComplete) return 'clean';
  return 'not-rated';
}
```

Expected results on the seed: Atlético 2026/27 **Soaked** (Riyadh Air serious front + Visit Rwanda severe back). Arsenal 2006–18 **Stained**, 2018–26 **Soaked**, 2026/27 **Stained**. Villa 2024–26 **Not rated**, 2026/27 **Soaked**. Man City **Stained**. Newcastle 2025/26 **Stained**, 2026/27 **Spotted**. Brighton **Clean**. Real Madrid **Stained**. Every other club **Not rated**.

"Bad" in headlines means Spotted or worse. For the Premier League that is 4 of 20.

## 5. Derived data the pages need

- `currentKit(club)`: the kit with the latest `periodTo`.
- `clubLevel(club)`: `levelForKit(currentKit)`.
- `leagueSummary(league)`: clubs sorted by level (soaked → clean → not rated), padded to `clubCount`; counts per level; `bad` = spotted+; `rated` = not `not-rated`.
- `sponsorCard(kit, sponsorId)`: sponsor, tier, owner chain, placement text, verdict, the claims (with sources) for the owner and its parents, and the deal value for that club, sponsor and season.
- `timeline(club)`: kits sorted by `periodFrom`, plus lanes per sponsor, where each lane is the list of periods whose kit includes that sponsor.
- The search index (see `docs/06-interactions.md`).

## 6. Money conventions

- Always "reported" or "up to". Keep the currency in the data and show USD approximately (`usdApprox`) with a footnote (current conversion $1 = £0.75 = €0.87).
- Unknown value: `value: null`, shown as "value not disclosed". The design uses the placeholder "[DEAL VALUE]", and production must not show brackets.
- Don't add up money per league on the landing page (team decision). League totals exist in the data for later use.

## 7. Connecting real data, pipelines and agents

The team plans a public GitHub repository with:
- **data**: clubs, shirts, sponsors, owners, deals (like `data/seed`)
- **evidence**: one file per claim, with sources
- **pipelines**: collect kits and sponsors each season
- **agents**: trace owners, find reports, draft ratings
- **reviews**: who checked what, and when

What to do:
1. If you find such a repo or folder, write an adapter that maps it onto these schemas. Don't change the page code to fit a new shape.
2. Validate on every build. Fail the build on broken references or missing required fields, and warn on claims without a URL.
3. Draft evidence format for contributors and agents (one claim per file). It maps to `claims.json` plus a deal or kit reference:

```json
{
  "club": "aston-villa",
  "season": "2026/27",
  "sponsor": "Visit Rwanda",
  "placement": "front",
  "owner": "Government of Rwanda",
  "value": "up to £20m a year",
  "sources": ["https://www.sportspro.com/news/sponsorship-marketing/aston-villa-visit-rwanda-shirt-principal-sponsorship-july-2026/"]
}
```

4. Only claims with `reviewed: true` should count toward a live rating once the method is final. Until then, show everything but keep the "illustrative" footer.

## 8. Adding content (put this in the README)

- **Club:** add it to `clubs.json`, put the crest in `assets/crests/<slug>.png`, and set `leagueId`.
- **Kit:** add front and back photos under `assets/shirts/<slug>/<season>-home-{front,back}.jpg`, then add an entry in `kits.json` with the sponsors, hotspots and cardSlot.
- **Sponsor:** add it to `sponsors.json` with `tier: "unrated"` until it has been researched.
- **Claim:** add it to `claims.json` with a source URL, and link it from the owner through `ownerIds`.
- **Change:** add it to `changes.json`. The landing page shows the newest 4.
- **Dropped:** add it to `dropped.json` with `featured: true` to show it on the landing page.
