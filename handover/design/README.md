# Design files

## `static/`: visual reference (open in a browser)

Standalone HTML snapshots rendered from the design source. Images load from `../../assets/`, and fonts from Google Fonts, so you need an internet connection for the fonts. Interactions are removed, so each file shows one state:

| File | Page and state |
|---|---|
| `landing.html` | Landing page (headline resting on "loyalty") |
| `landing--search-open.html` | Landing page with the search dropdown open for "rwa" |
| `overview-premier-league.html` | Soccer overview, club crests, Premier League |
| `overview-la-liga.html` | Soccer overview, club crests, La Liga |
| `team-atletico.html` | Atlético de Madrid team page |
| `team-atletico--card-open.html` | Same, with the Visit Rwanda card expanded |
| `team-arsenal.html` | Arsenal, 2026/27 period selected |
| `team-arsenal--2018-2026.html` | Arsenal, 2018/19–2025/26 period (Soaked, Visit Rwanda on the sleeve) |
| `team-arsenal--2006-2018.html` | Arsenal, 2006/07–2017/18 period |
| `team-villa.html` | Aston Villa, 2026/27 (Soaked) |
| `team-villa--2024-2026.html` | Aston Villa, 2024/25–2025/26 (Not rated) |

The designs are 1440px wide. View at 100% zoom, full page.

## `source/`: the original design components (source of truth)

The prototype was built as "design components" (`.dc.html`). Each file has three parts:

1. **`<helmet>`**: fonts and a few global CSS rules.
2. **The template inside `<x-dc>`**: HTML with inline styles and these extras:
   - `{{path.to.value}}` inserts a value computed by the script (a dotted lookup only).
   - `<sc-for list="{{items}}" as="item">…</sc-for>` repeats for each item.
   - `<sc-if value="{{flag}}">…</sc-if>` renders only when the value is truthy.
   - Event attributes such as `onClick="{{fn}}"`, `onMouseEnter="{{fn}}"` and `onChange="{{fn}}"` bind to functions returned by the script.
   - `<dc-import name="X" prop="…">` mounts another component (the wrappers use this).
   - `/_blob/<id>` is an uploaded image. Map it to a file with `assets/manifest.json` (`designAssetId` → `file`).
3. **`<script type="text/x-dc">`**: `class Component extends DCLogic` with React-like `state` and `setState`. `renderVals()` returns everything the template uses, and it's where all the data and layout maths lives (for example, the team page's card placement and line coordinates). `data-props` declares the component's props.

| File | What it is |
|---|---|
| `Landing.dc.html` | Landing page. Search, feed data and the rotating headline logic are in the script. |
| `Overview.dc.html` | The soccer overview component. Prop `view` = `crests` (the chosen version), `jerseys` or `both`. **Build only `crests`.** |
| `Overview-crests.dc.html` | Wrapper that mounts `Overview` with `view="crests"`. |
| `TeamDetail.dc.html` | The team-page component. Prop `teamId` = `atletico`, `arsenal` or `villa`, and prop `showCrest`. Contains the per-club data, placement maths, hover intent and timeline. |
| `Team-arsenal.dc.html`, `Team-villa.dc.html` | Wrappers that mount `TeamDetail` for Arsenal and Villa. |
| `parked/MoneyFlow.dc.html` | Parked money-flow section. Don't build it now. |

The data in these scripts has been extracted and normalised into `data/seed/`. Build from `data/seed/`, not from the constants in the scripts.
