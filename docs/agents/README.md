# Brief for data agents (OpenCode)

You coordinate agents that research sponsors for **Behind the Jersey** and add them to its open data. Read this whole file before you start. It covers what exists, where the code lives, how the data is built, and how the issues work.

## 1. The project in one minute

Behind the Jersey is a fan-facing website that shows who really pays for the sponsors on sports jerseys and events, and rates each club's shirt with a blood level: **Clean, Spotted, Stained, Soaked**. A club's level is derived from its sponsors' **tiers** (`unrated`, `none`, `concern`, `serious`, `severe`) and where they sit on the shirt. The site never stores a club level; it works it out.

The tone is factual: every claim is sourced and dated, clubs and fans aren't mocked, and a gap beats a guess.

## 2. What has been done so far (as of 24 Sep 2026)

- **Website**: built from a design handover and live at **https://behind-the-jersey.org** (HTTPS pending) from the public repo [Beyond-The-Jersey/website](https://github.com/Beyond-The-Jersey/website). It still shows the handover's sample data (the "seed"). A copy that always shows the seed is at `/demo/`. The switch to real data is one line in `.github/workflows/pages.yml` (`LIVE_DATA_SOURCE: repo`).
- **Data contract**: the site reads 14 JSON files (the "normalised" format). Schemas are in `website/data/schema/`, examples in `website/data/seed/`, a validator in `website/data/validate.py`. The request that defined it is [data#1](https://github.com/Beyond-The-Jersey/data/issues/1).
- **Data repo**: the data agent built `normalized/` in [Beyond-The-Jersey/data](https://github.com/Beyond-The-Jersey/data). It now passes the validator: 213 clubs (Premier League, La Liga, Bundesliga, Serie A, MLS, NBA, NFL, MLB, the F1 grid), 212 sponsors, 98 claims with source URLs.
- **Open question for the team**: 96 sponsors already have a tier, but none of the 98 claims is marked `reviewed`. The project's rule is that a person reviews every claim before a rating counts. Don't add more tiers until the team has decided (see §6).
- **Coverage research**: 46 targets (6 gaps in covered leagues, 40 new or unmapped leagues, tours and events) with official team lists and 162 sourced leads, in [`website/docs/coverage/targets.json`](../coverage/targets.json). Every target has an issue in the data repo (`issue` field).

## 3. Repos, access and where to clone

| Repo | Visibility | What's in it |
|---|---|---|
| [Beyond-The-Jersey/website](https://github.com/Beyond-The-Jersey/website) | public | the site; `data/schema`, `data/seed`, `data/validate.py`; `docs/coverage/` (targets); this brief |
| [Beyond-The-Jersey/data](https://github.com/Beyond-The-Jersey/data) | private, forking disabled | `normalized/` (canonical), `data/` (legacy per-club projection, generated), the **builders** at the repo root, the issues |
| [Beyond-The-Jersey/pipeline](https://github.com/Beyond-The-Jersey/pipeline) | public | `scripts/` (older collectors: official team lists, Wikipedia/Wikidata enrichment), `data_build/` (a mirror of the data repo's builders) |

The builders use fixed paths, so clone to exactly these locations:

```bash
gh auth status                                            # must be logged in
gh repo clone Beyond-The-Jersey/website  /tmp/website
gh repo clone Beyond-The-Jersey/data     /tmp/data
gh repo clone Beyond-The-Jersey/pipeline /tmp/pipeline
pip3 install requests jsonschema
```

**Access.** Pushing to the data repo and assigning issues need **write** (or triage) access; the data repo is private and can't be forked. An account with only read access can read, comment and open issues, but can't claim (assign) or push. Check with `gh api repos/Beyond-The-Jersey/data --jq .permissions`. If you can't assign, claim with a comment and ask a maintainer to assign you.

## 4. The data rules (non-negotiable)

1. **Never invent** a fact, figure, date, URL, owner, rating or contact detail. Unknown stays `null` with a note, or is left out. `unrated` is an honest answer.
2. **Sources are primary documents**: `{name, date, url}` of the club announcement, kit launch, company filing, official report or a named press article. **Wikipedia and Wikidata are leads, never sources.** Open every URL you cite.
3. **Ids are ASCII kebab-case** (`atletico-de-madrid`). Reuse existing ids for clubs, sponsors and owners; search `normalized/` before creating one (`government-of-saudi-arabia`, `saudi-pif`, `government-of-dubai`, `qatar-airways` already exist).
4. **Seasons**: `YYYY-YY` for season leagues (`2026-27`) in `season`, `periodFrom` and `periodTo`; `YYYY` only for calendar-year competitions (MLS, MLB, F1). Known problem: the 60 kits added from `research_additions.json` use `periodFrom: "2026"`, `periodTo: "2027"` for `2026-27`; fix that, don't copy it.
5. **Tiers are proposals, not decisions.** New sponsors are `tier: "unrated"`, `status: "unrated"`. Put your proposed tier and the reasoning in your research file (`proposedRatings`) and in the issue comment. Claims get `reviewed: false`. Only a person sets a tier. **State ownership alone is not a tier.** `serious` needs a sourced claim of serious abuses by a state in the owner chain, `severe` a sourced claim of ongoing severe abuses (armed conflict, conflict minerals). A public owner with no such record (a US state university, a county tourism board, an Italian region) is at most `none`; a minority state stake is `concern` at most. Claim texts say only what their source says: put the reasoning for a tier in `reasoning`, never in the claim. A claim must be about the sponsor it is cited for (see the data repo README, "Rating rule").
6. **No club levels** anywhere. The site derives them.
7. **Contacts** only with the URL of the club page that publishes them. No placeholders, no addresses built from a slug.

## 5. How the pipeline works

The site reads `normalized/`. **`normalized/` is generated: never edit it by hand**, because the next build overwrites it. New facts go into the build's inputs.

```
website/data/seed/*.json              the handover's facts (start point)
+ data/pipeline_data.py               curated additions (NEW_CLUBS, NEW_OWNERS, NEW_SPONSORS, FRONTS,
                                      NEW_DEALS, CLAIM_URLS, DROPPED_SOURCES, EXTRA_CHANGES, …)
+ data/research_additions.json        research output (clubs, owners, sponsors, kits, sleeves, ratings),
                                      written by convert_research.py
+ data/ratings_data.py                researched ratings, written by encode_ratings.py
+ data/contacts_build.json            written by build_contacts.py and enrich_contacts.py (network)
        │
        ▼
python3 build_normalized.py           writes normalized/ and data/, then runs website/data/validate.py
python3 verify_issue_1.py             must print N/N passed
```

Full rebuild, from `/tmp/data`:

```bash
python3 build_contacts.py        # network; only needed when clubs were added
python3 enrich_contacts.py       # network
python3 build_normalized.py      # must end with "OK: … matches the schemas and references are valid"
python3 verify_issue_1.py        # must pass every check
```

`BTJ_SEED` and `BTJ_VALIDATE` override the website paths if you didn't clone to `/tmp/website`. After changing a builder, copy it to `/tmp/pipeline/data_build/` so the two repos stay the same.

The older collectors in `pipeline/scripts/` (`collect_data.py` with `OFFICIAL_SOURCES` and `KNOWN_TEAMS`, `update_sponsors.py`, the Wikidata scripts) still work for getting team lists and sponsor **leads**. Their output is not a source.

### Per-target research files (how subagents deliver)

Many subagents editing `pipeline_data.py` or `research_additions.json` at once will collide. So each subagent writes **one file**: `/tmp/data/research/<target-id>.json`, and never touches the builders or `normalized/`:

```json
{
  "target": "saudi-pro-league",
  "issue": "https://github.com/Beyond-The-Jersey/data/issues/243",
  "sports":   [ { "id": "…", "label": "…", "status": "not-mapped", "aliases": [] } ],
  "leagues":  [ { "id": "saudi-pro-league", "sportId": "soccer", "name": "Saudi Pro League", "country": "Saudi Arabia", "clubCount": 18, "season": "2026-27", "status": "partial", "aliases": [], "notes": [] } ],
  "clubs":    [ /* clubs.json entries */ ],
  "owners":   [ /* owners.json entries, parentId up to the state or fund */ ],
  "sponsors": [ /* sponsors.json entries, tier "unrated" */ ],
  "kits":     [ /* kits.json entries, every sponsor with placement and source */ ],
  "deals":    [ /* deals.json entries; organisation deals use clubId null, orgName, leagueId, placement "league-partner" */ ],
  "claims":   [ /* claims.json entries, source with url, reviewed false */ ],
  "proposedRatings": [ { "sponsorId": "…", "tier": "serious", "ownerId": "…", "claimIds": ["…"], "reasoning": "…" } ],
  "unsourced": [ "facts found but not sourced yet, as plain text" ]
}
```

Every entry follows the matching schema in `website/data/schema/`.

**One-time setup (orchestrator, before the first merge):** teach `build_normalized.py` to load `research/*.json` after `research_additions.json`, add their `sports`, `leagues`, `clubs`, `owners`, `sponsors`, `kits`, `deals` and `claims` (existing ids win), and ignore `proposedRatings`. Coordinate this with the data agent on [data#181](https://github.com/Beyond-The-Jersey/data/issues/181) before changing a shared builder.

## 6. How the data issues work

Everything is tracked in [Beyond-The-Jersey/data issues](https://github.com/Beyond-The-Jersey/data/issues):

- **The index**: [#181](https://github.com/Beyond-The-Jersey/data/issues/181) lists every sport, league and club, with the claiming rules.
- **Sport issues** (label `sport`), **league issues** (`league`) and **club issues** (`club`, most with `research`): one per entity, generated from the data, each with a list of gaps.
- **Target issues #243–#275**: new leagues, tours and events from the website's research, each with the official list, sourced leads, and the **shape** (below). Research notes were also added to the existing league issues #16, #18, #20, #21, #23, #27 and #28.
- **Topic issues**: #2–#8 (ratings backlog, kit placements, assets, CI) and #276 (data problems).

**Claiming** (from #181):
1. Assign the issue to yourself (`gh issue edit <n> -R Beyond-The-Jersey/data --add-assignee @me`). Assigned means taken; unassigned is free.
2. Comment one line on what you'll do. If you'll touch shared records (sponsors, owners, claims), say which.
3. When done, comment what you added and what's still open, and **stay assigned**: that's the record.
4. One entity, one agent. Never work an issue someone else is assigned to.

**Acceptance for any change**: `build_normalized.py` ends with the validator printing `OK`, and `verify_issue_1.py` passes every check.

**Shapes.** Each target says what kind of thing is being rated:
- `club-shirt`: clubs or teams with sponsors on the shirt. **Fits the data now.**
- `org-partner`: sponsors of a league, tour or federation. **Fits now**, as organisation deals.
- `event-host`: races, fights and tournaments hosted or title-sponsored by a state. **Doesn't fit yet** (no event entity).
- `car-livery`: sponsors on cars. **Doesn't fit yet** (no "car" placement).

For the last two, collect the facts in `unsourced`/the issue comment and don't force them into kits.

## 7. The orchestrator's loop

1. **Set up**: clone (§3), check access, run a clean build to confirm `OK`, then do the one-time setup in §5.
2. **Pick targets**: read `website/docs/coverage/targets.json`. Start with `club-shirt` and `org-partner` targets, high priority first, whose `issue` is unassigned. Suggested first wave: `premier-league-complete`, `la-liga-complete`, `bundesliga`, `ligue-1`, `saudi-pro-league`, `uci-worldtour-men`, `fifa`, `uefa`, `euroleague`. (Serie A, MLS and F1 are assigned to the data agent.)
3. **Claim** each target's issue (§6) before starting its subagent.
4. **Run one subagent per target** with the prompt in [`../coverage/subagent-brief.md`](../coverage/subagent-brief.md). Give each its own target id; subagents only write `research/<target-id>.json`.
5. **Integrate**, one target at a time: check the file against the schemas, rebuild (§5), fix or send back anything that fails, run `verify_issue_1.py`.
6. **Deliver**: commit to the data repo (a branch and pull request if you're not the data agent), copy changed builders to the pipeline repo, and comment on each issue with what landed, the proposed tiers with reasoning, and what's still unsourced.
7. **Stop and ask** when a fact can't be sourced, when two sources disagree, or when a change would touch another agent's claimed scope.

## 8. Useful commands

```bash
gh issue list -R Beyond-The-Jersey/data --label league --state open            # league issues
gh issue view 243 -R Beyond-The-Jersey/data --comments                          # one issue in full
gh issue list -R Beyond-The-Jersey/data --search "no:assignee" --state open     # unclaimed
python3 /tmp/website/data/validate.py /tmp/data/normalized --assets /tmp/website/public
python3 -c "import json; print([t['id'] for t in json.load(open('/tmp/website/docs/coverage/targets.json'))['targets'] if t['priority']=='high'])"
```
