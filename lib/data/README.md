# lib/data: the data layer

Pages never read JSON themselves. They call `getDataset()` from `lib/data` and the selectors in `derive.ts`.

```
source.ts        where the files come from (seed, repo checkout, HTTP)
schema.ts        zod schemas, mirroring data/schema/*.schema.json
checks.ts        cross-file checks: references, tiers need claims, hotspots need side and cardSlot
index.ts         loadDataset(): load → validate → check → Dataset with lookup maps (memoised per build)
dataset.ts       the Dataset type and lookup maps
rating.ts        levelForKit(): the draft rating rule (illustrative until the method is agreed)
derive.ts        selectors and view models: currentKit, clubLevel, leagueSummary, sponsorCards, teamPage…
search-index.ts  builds the search index at build time (matching lives in lib/search.ts)
```

## Choosing a source

| `BTJ_DATA_SOURCE` | Reads | Notes |
|---|---|---|
| `seed` (default) | `data/seed/*.json` | The facts the designs use. Also the test fixtures. |
| `repo` | `$BTJ_DATA_DIR` (default `.data-repo/normalized`) | Run `npm run data:pull` first. Needs read access to Beyond-The-Jersey/data. |
| `api` | `$BTJ_DATA_URL/<file>.json` | Sends `$BTJ_DATA_TOKEN` as a bearer token if set. Works with raw.githubusercontent.com. |

Every source must provide the same 14 files: `meta`, `levels`, `tiers`, `sports`, `leagues`, `clubs`, `owners`, `claims`, `sponsors`, `kits`, `deals`, `changes`, `dropped`, `contacts`. `contacts` and `meta` may be missing: contacts default to none, and `meta.updatedAt` falls back to the newest change date.

`npm run validate:data` validates whichever source is configured. `npm run build` runs it first, so broken data fails the build.

## The real data repo (Beyond-The-Jersey/data)

As of 24 Sep 2026 the data repo publishes one file per team (`data/<slug>.json`) in a different shape: A–F grades, no seasons, no placement on the shirt, no owner chains, sources as the word "Wikipedia". It can't drive these pages. Rather than a lossy adapter here, we asked the data agent to publish the normalised files next to its per-team files, in `normalized/`. The request, with a field-by-field mapping from the per-team format, is in [`docs/data-request/`](../../docs/data-request/README.md).

So the `repo` source has no field mapping: it reads the normalised files as they are. If the data repo's format ever drifts from `data/schema`, add a mapping step in `source.ts` (a `RawFiles → RawFiles` transform) rather than changing pages.

Field mapping from the current per-team files, for reference (the data agent does this):

| Per-team file | Normalised |
|---|---|
| `team`, file slug | `clubs[].name`, `clubs[].id` (ASCII kebab-case, seed ids kept) |
| `sport`, `league` | `clubs[].sportId` (`american_football` → `american-football`), `clubs[].leagueId` (`premier_league` → `premier-league`, `laliga_easports` → `la-liga`) |
| `sponsors[]` | `sponsors[]` (one per company) + `kits[].sponsors[]` (per season, with placement and source) |
| `sponsors[].flags` (`regime:UAE`) | `owners[]` chain + `sponsors[].ownerId` |
| `sponsors[].rating` (A–F) | not mapped; `sponsors[].tier` is assigned from reviewed claims |
| `sponsors[].deal_value` | `deals[].value` with a source |
| `sponsors[].verified` | `claims[].reviewed` |
| `contact`, `shame` | `contacts[]`, sourced channels only |

## Adding content

See the README at the repo root.
