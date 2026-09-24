# Data request from the website

**To:** the Behind the Jersey data agent (Beyond-The-Jersey/data and /pipeline)
**From:** the website build (Beyond-The-Jersey/website), 24 Sep 2026
**Machine-readable version:** [`request.json`](request.json) (field mapping, priorities, issues and examples)

## What the website needs

The website builds every page from **14 normalised JSON files**, each with a JSON Schema:

| File | What it holds |
|---|---|
| `meta.json` | schema version and the date of the latest data change |
| `sports.json`, `leagues.json` | sports and leagues, with `clubCount` so empty slots can be drawn |
| `clubs.json` | one entry per club: id, names, aliases, league, crest path |
| `kits.json` | **one per club per season or period**: which sponsors are on the shirt and **where** (front, back, sleeve), with a source |
| `sponsors.json` | one per company, shared across clubs: owner, **tier** (unrated, none, concern, serious, severe), verdict, claims |
| `owners.json` | owner chains up to a state, e.g. Riyadh Air → Saudi PIF → Government of Saudi Arabia |
| `claims.json` | one sourced statement about an owner each, with `reviewed` |
| `deals.json` | money per club × sponsor × placement × period, always with a source |
| `changes.json` | dated changes (got worse, got better, renewed, being rated) |
| `dropped.json` | clubs and organisations that ended a bad deal |
| `levels.json`, `tiers.json` | display scales (copy from the seed) |
| `contacts.json` | **new**: sourced public channels a fan can use to tell a club what they think |

- Schemas: [`data/schema/`](../../data/schema)
- Examples with every fact the designs use: [`data/seed/`](../../data/seed)
- Validator: [`data/validate.py`](../../data/validate.py). Run `python3 validate.py normalized/`; it must print `OK`.

The website works out each club's blood level itself from the sponsors' tiers and placements. **Don't publish club levels.**

## What we're asking for

Please publish these files in a new `normalized/` folder in Beyond-The-Jersey/data. Keep the per-team files if anything else uses them.

### Priority 1: needed for the five designed pages
1. **Start from the website seed** and merge your data into it. The seed has facts the per-team files don't: Aston Villa, Atlético de Madrid and Manchester City have no sponsors in the per-team files at all.
2. **Exact source URLs** for the 8 claims the ratings rest on (UN Group of Experts 2024, Global Witness June 2026, Amnesty 2025, US ODNI Feb 2021, HRW July 2024). Use the primary document.
3. **Sources for the "They dropped it" items**: Bayern × Visit Rwanda 2025, Bayern × Qatar Airways 2023, Schalke × Gazprom 2022 and Man Utd × Aeroflot 2022 are on the landing page, plus the four non-featured ones.
4. **A source for each sponsor on each 2026-27 kit** (`kits[].sponsors[].source`).
5. **Contacts for Arsenal, Aston Villa and Atlético de Madrid.** Their team pages have a "Tell the club" button that opens these channels.
6. **Double-check:** the Premier League 2026-27 club list, the Man City × Etihad value (older report), Liverpool/Man Utd/Spurs fronts from a secondary source, Newcastle × KNOX Hydration, and add Abu Dhabi-specific claims for Etihad.

### Priority 2: more coverage
La Liga's other 18 clubs and Bundesliga's 18 (club + 2026-27 kit + front sponsor as `unrated`), NBA/NFL/MLB clubs (club only), contacts for every club, owner research for unrated sponsors, and `changes.json` produced by the pipeline.

## Rules
- **Never invent** a fact, number, source, URL, rating, deal value or contact detail. Unknown means `null` with a note, or leave it out.
- **Wikipedia and Wikidata are leads, not sources.** Cite the primary document: `{name, date, url}`.
- **Tiers, not grades.** Don't map A–F onto tiers. A sponsor stays `unrated` until its owner chain and claims are sourced and a person has reviewed them.
- **ASCII kebab-case ids**, and keep the seed's ids (`atletico-de-madrid`, `afc-bournemouth`, `brighton-and-hove-albion`, `la-rams`).
- **Seasons** are `2026-27`, with one kit per season or per unchanged period.
- **Contacts:** each channel needs the URL of the club page that publishes it. No placeholders, and no addresses built from the slug.
- When your data and the seed disagree, keep the better and newer source and list the change in your PR.

## What we found in the current data

| Where | Problem |
|---|---|
| `aston-villa.json` | No sponsors. Missing Visit Rwanda (front 2026-27), Betano, Trade Nation. |
| `atlético-de-madrid.json` | No sponsors (Riyadh Air, Visit Rwanda on the back, Kraken). Non-ASCII id. |
| `manchester-city.json`, `liverpool.json` | No sponsors. |
| `newcastle-united.json` | Only Sela, which left after 2025-26. KNOX Hydration and noon missing. |
| `manutd.json` + `manchester-united.json` | Duplicate club; `manutd.json` has league `"Premier League"`. |
| Brighton, Athletic Club | "Sam Gillam" and "Donald Coles" listed as sponsors of both (Wikidata); they look like people. |
| Athletic Club | Owner "Roland Duchâtelet"; the club is member-owned. |
| Borussia Dortmund | A sponsor named `"\| Source\n"` (parser artefact). |
| New York Yankees | Sponsor is the club itself. |
| 8 Premier League clubs | The front sponsor differs from the 2026-27 seed and looks like an earlier season's (Bournemouth, Brentford, Palace, Everton, Fulham, Forest, Chelsea, Leeds). |
| Arsenal, Real Madrid | Emirates values from Wikipedia (£60m, €70m) vs up to £70m (SGI, Aug 2026) and €100m (SportsPro, Jun 2026). |
| All files | `country: "Unknown"` (150 of 151). Sources are the strings "Wikipedia" or "Wikidata". Emirates and American Express both get "C", but the design rates them Serious and Nothing found. |
| Contact / shame | 150 files have the placeholder phone `+44 800 XXX XXXX`. Shame emails are generated from the slug (`marketing@málaga-cf.com`) and differ from `contact.email` in 130 files. Twitter handles disagree in 94. Nothing is sourced. |
| `verified_data.json` | Covers 50 of 151 teams. Says Arsenal has 0 sponsors. |

## How the website reads it

The site runs `npm run data:pull` to clone Beyond-The-Jersey/data, then builds with `BTJ_DATA_SOURCE=repo`. The build validates the files against the same schemas and fails on broken references, so a failing `validate.py` means a failing site build. Until `normalized/` exists, the site builds from the seed.
