# Behind the Jersey: handover package for Claude Code

This folder hands the finished designs over to Claude Code (or any developer) to build the real website. It contains:

- **5 designed pages**: the landing page, the soccer overview (club crests version), and the team pages for Atlético de Madrid, Arsenal and Aston Villa.
- **Static snapshots** of those pages and their key states, to open in a browser (`design/static/`).
- **The original design source** with exact styles and behaviour (`design/source/`).
- **All images** used, with sources and licensing notes (`assets/`).
- **All data** behind the designs, normalised, sourced and schema-validated (`data/`).
- **Docs**: the project brief, implementation plan, page specs, design system, data model, interactions and open questions (`docs/`).
- **`CLAUDE.md`**: the instructions Claude Code reads automatically.

## How to start Claude Code with it

1. **Put the folder in the project repository.** Either unzip it as the root of a new repo, or, if the team already has a repo with data, pipelines or agents, copy it in as `handover/` and move `CLAUDE.md` to the repo root (update the paths in it, or just tell Claude Code where the folder is).
2. Open Claude Code in that repository.
3. Paste this kickoff prompt:

> Read CLAUDE.md and every file in docs/ (start with docs/01-project-brief.md). Then do milestone M0 from docs/02-implementation-plan.md: look through this repo (and anything it references) for existing data, pipelines and agents, and tell me what you found and which stack you'll use before you write app code. After I confirm, work through M1 to M7 in order. Build the pages to match design/static/*.html at 1440px, load all content through the data layer, and never invent facts, sources or deal values.

4. If the team's open-data repository or API already exists, give Claude Code its URL and access so it can write the adapter (M1).

## Folder map

```
CLAUDE.md                     instructions for Claude Code
README.md                     this file
docs/
  01-project-brief.md         what, why, background, how it looks, decisions
  02-implementation-plan.md   milestones M0–M7 with acceptance criteria
  03-page-specs.md            exact layout, copy and states per page
  04-design-system.md         tokens, type, components, motion
  05-data-model.md            entities, rating rule, connecting real data
  06-interactions.md          search, rotating headline, cards, timeline, hover intent
  07-open-questions.md        caveats, placeholders, parked ideas
design/
  README.md                   how to read the design files
  static/                     11 static HTML snapshots (open in a browser)
  source/                     original .dc.html design components
assets/
  crests/                     24 club crests (PNG)
  shirts/<club>/              front and back photos per kit period (720×800)
  shirts/grid/                square 2026/27 home shirts (not used by the crest overview)
  manifest.json               design asset id → file, source, licence status
data/
  seed/                       12 JSON files: levels, tiers, sports, leagues, clubs, owners,
                              claims, sponsors, kits, deals, changes, dropped
  schema/                     JSON Schemas for each seed file
```

## Before anything goes public
- Shirt photos and crests aren't cleared for public use.
- Ratings are illustrative until the method is agreed.
- Some sources still need exact links (see `docs/07-open-questions.md`).
