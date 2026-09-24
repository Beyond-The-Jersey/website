# 07. Open questions, caveats and placeholders

## Must not ship publicly until resolved
1. **Image rights.** The shirt photos come from footballkitarchive.com (Man City from footyheadlines.com) and the club crests from football-data.org. They're fine for a hackathon prototype but need permission or licensed images before a public launch. Each file's source and status are in `assets/manifest.json`.
2. **The rating method** isn't agreed. All levels are illustrative. The draft rule is in `05-data-model.md` §4. Keep the footer disclaimer.
3. **Missing sources.** Claims in `claims.json` name their source (UN Group of Experts 2024, Global Witness Jun 2026, Amnesty 2025, US ODNI Feb 2021, HRW Jul 2024), but the exact URLs are `null`. Four "They dropped it" items have no source (`todo: "Add source"`). Fill these in from primary documents. Don't guess URLs.

## Data to double-check
- The Premier League 2026/27 club list in `clubs.json` comes from earlier research. Verify promotion and relegation.
- The Man City × Etihad value (£67.5m) is from older reports.
- The front sponsors for Liverpool (Standard Chartered in 2026/27), Man Utd (Snapdragon) and Tottenham (AIA) come from a secondary source (LeadMonitor). They're only used as unrated sponsors.
- The Newcastle 2026/27 front sponsor (KNOX Hydration) is based on The Mag, June 2026.
- The Etihad and Abu Dhabi evidence currently reuses the UAE-wide HRW mass-trial claim. Add Abu Dhabi-specific sources.

## Placeholders in the designs
- `[org]`: the GitHub organisation or repo URL. Make it config (`NEXT_PUBLIC_REPO_URL`).
- `[DEAL VALUE]` on team-page sponsor cards means unknown. In production show "value not disclosed".
- `btj` appears in one earlier mock-up as a command-line tool name. It's only a concept and doesn't exist.
- "Say thanks", "Tell the club", "Share", "Remind me" and "Follow" have no destination yet.

## Design decisions still open
- The overview hero still says "What's on your club's shirt?". Should it follow the new landing voice ("Who's buying your ___?")?
- The overview "They dropped it" block: the snapshot has the older stamp style. The recommendation is the landing page's positive teal card.
- Mobile layouts weren't designed. `03-page-specs.md` gives guidance, so check with the team after a first pass.
- Animations beyond the rotating headline are for a later discussion.

## Parked (don't build now)
- The money-flow section "by country / by company" (`design/source/parked/MoneyFlow.dc.html`): a flow chart from government to sponsor to shirt, with widths by reported money.
- "Next chance to drop it": deal end dates with reminders. Needs contract-end data.
- "Follow your club" email alerts, sponsor pages, country and company pages, kit-launch alerts, a share card for your club ("The Label" mobile idea), fan campaign links, an embed widget and API, confidence and "last checked" per rating, and more languages (French, Spanish, Arabic, Kinyarwanda).
- Events and other sports (F1 races, the Cycling World Championships, FIFA and UEFA): the data model supports them through `orgName` on deals and dropped items. Pages come later.
