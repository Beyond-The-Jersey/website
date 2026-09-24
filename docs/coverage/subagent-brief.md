# Subagent brief: map one target for Behind the Jersey

Copy everything below the line into the subagent's prompt and replace `{{TARGET_ID}}` with an id from [`targets.json`](targets.json) (e.g. `ligue-1`, `uci-worldtour-men`, `saudi-pro-league`). One subagent per target.

---

You are mapping **{{TARGET_ID}}** for Behind the Jersey, a site that shows who really pays for the sponsors on sports jerseys and events, and rates how much human-rights abuse sits behind them.

**Read first**
- The target: the entry with `"id": "{{TARGET_ID}}"` in https://github.com/Beyond-The-Jersey/website/blob/main/docs/coverage/targets.json (entities to cover, the official team list, sourced leads to start from, data notes).
- The data contract: the JSON Schemas in https://github.com/Beyond-The-Jersey/website/tree/main/data/schema and the examples in https://github.com/Beyond-The-Jersey/website/tree/main/data/seed.
- The rules and field mapping: https://github.com/Beyond-The-Jersey/website/blob/main/docs/data-request/README.md.
- The pipeline: https://github.com/Beyond-The-Jersey/pipeline. New leagues go into `scripts/collect_data.py`: an official URL in `OFFICIAL_SOURCES`, a parser (`extract_teams_<league>`) or a fallback list in `KNOWN_TEAMS`.

**Do**
1. **Entities.** Add the league (`leagues.json`, with `clubCount`) and, if the sport is new, the sport (`sports.json`, `status: "not-mapped"`). List every club or team for the current season from the official team list, as `clubs.json` entries with ASCII kebab-case ids, `leagueId`, `country` and `aliases`. Keep existing ids.
2. **Sponsors on the shirt.** For each club or team, one kit for the current season (`kits.json`) listing every sponsor with its `placement` (front, back, sleeve, shorts) and a `source` `{name, date, url}`: the club's kit launch or announcement, or a named press article. Wikipedia is a lead, not a source.
3. **Organisation deals.** Sponsors of the league or competition itself (title sponsor, official partner) go in `deals.json` with `clubId: null`, `orgName`, `leagueId` and `placement: "league-partner"`, each with a source.
4. **Owners.** For each sponsor, trace the owner chain up to a state or a fund where there is one (`owners.json`, `parentId`), using company registries, annual reports or the sponsor's own site.
5. **Claims.** For state-linked owners only, add sourced statements about the owner's human-rights record (`claims.json`), each with the primary source's URL and `reviewed: false`. Reuse existing claims and owners where they exist (e.g. `saudi-pif`, `government-of-dubai`).
6. **Validate.** Put your files next to a copy of the current `normalized/` folder, merge, and run `python3 validate.py normalized/` from the website repo's `data/` folder. It must print `OK`.
7. **Deliver.** A pull request to Beyond-The-Jersey/data with the merged `normalized/` files, and one to Beyond-The-Jersey/pipeline with the collector changes. In the data PR description, list every sponsor with a **proposed** tier and why, and every fact you couldn't source.

**Don't**
- Don't invent anything: no facts, figures, dates, URLs or contact details. Unknown is `null` with a note, or left out.
- Don't set `tier` above `unrated` or `reviewed: true`. A person reviews every claim and decides the tier.
- Don't publish club blood levels; the site works them out.
- Don't change existing records unless a better, newer source says otherwise, and say so in the PR.
- Events, races and car liveries (targets with the shape `event-host` or `car-livery`) don't fit the schema yet. For those, collect the facts in the PR description and flag which placements you'd need.
