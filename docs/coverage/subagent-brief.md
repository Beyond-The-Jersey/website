# Subagent brief: research one target for Behind the Jersey

The orchestrator (see [`../agents/README.md`](../agents/README.md)) copies everything below the line into a subagent's prompt, replacing `{{TARGET_ID}}` with an id from [`targets.json`](targets.json) (e.g. `ligue-1`, `uci-worldtour-men`, `saudi-pro-league`). One subagent per target. The orchestrator claims the target's issue before starting you.

---

You are researching **{{TARGET_ID}}** for Behind the Jersey, a site that shows who really pays for the sponsors on sports jerseys and events, and rates how much human-rights abuse sits behind them. Your output is one research file; the orchestrator merges it into the data.

**Read first**
- Your target: the entry with `"id": "{{TARGET_ID}}"` in `/tmp/website/docs/coverage/targets.json`: the entities to cover, the official list, sourced leads to start from, data notes, the shape, and the `issue` URL. Read that issue and its comments too.
- The data contract: the JSON Schemas in `/tmp/website/data/schema/` and the examples in `/tmp/website/data/seed/`.
- What already exists: `/tmp/data/normalized/*.json`. Reuse existing ids for clubs, sponsors and owners (e.g. `saudi-pif`, `government-of-saudi-arabia`, `government-of-dubai`, `qatar-airways`); search before creating one.

**Do**
1. **Entities.** The league (with `clubCount`) and, if the sport is new, the sport (`status: "not-mapped"`). Every club or team for the current season from the official list: ASCII kebab-case `id`, `name`, `shortName`, `code`, `sportId`, `leagueId`, `country`, `crest: null`, `aliases`.
2. **Sponsors on the shirt.** One kit per club or team for the current season, listing every sponsor with its `placement` (front, back, sleeve, shorts) and a `source` `{name, date, url}` from the club's kit launch or announcement, or a named press article. `season`, `periodFrom` and `periodTo` are `YYYY-YY` (`2026-27`) for season leagues, `YYYY` only for calendar-year competitions. `sponsorsComplete: true` only when you've checked every placement.
3. **Organisation deals.** Sponsors of the league or competition itself (title sponsor, official partner) as deals with `clubId: null`, `orgName`, `leagueId` and `placement: "league-partner"`, each with a source.
4. **Owners.** For each sponsor, the owner chain up to a state or a fund where there is one (`parentId`), from company filings, annual reports or the sponsor's own site.
5. **Claims.** For state-linked owners only: sourced statements about the owner's human-rights record, each with the primary source's URL and `reviewed: false`. Reuse existing claims where they fit.
6. **Proposed tiers.** New sponsors stay `tier: "unrated"`. For each sponsor you think deserves a tier, add a `proposedRatings` entry: `{sponsorId, tier, ownerId, claimIds, reasoning}`. A person decides.
7. **Write** everything to `/tmp/data/research/{{TARGET_ID}}.json` in the format described in the agents brief (§5): `target`, `issue`, `sports`, `leagues`, `clubs`, `owners`, `sponsors`, `kits`, `deals`, `claims`, `proposedRatings`, `unsourced`. Every entry must match its schema.
8. **Report back** to the orchestrator: counts, the sponsors you propose to rate and why, anything you couldn't source, and anything that disagreed between sources.

**Don't**
- Don't invent anything: no facts, figures, dates, URLs, owners or contact details. Unknown is `null` with a note, or goes in `unsourced` as plain text.
- Don't cite Wikipedia or Wikidata as a source; use them only to find the primary document. Open every URL you cite.
- Don't edit `normalized/`, `pipeline_data.py`, `research_additions.json` or any builder, and don't commit or comment on issues: the orchestrator does that.
- Don't set a tier or `reviewed: true`, and don't write club levels.
- Races, fights and tournaments (shape `event-host`) and car liveries (`car-livery`) don't fit the schema yet. Record those facts in `unsourced` with their sources, and don't force them into kits.
