# UPDATE: team page v3 (two columns)

**For Claude Code.** You already built Behind the Jersey from the first handover (`CLAUDE.md` and `docs/01`–`07`). This update replaces the **team page** (`/clubs/[slug]`) with a new two-column design. Everything else stays as it is.

Read this whole file before changing code. Then look at `design/screenshots/team-arsenal-v3.png`. That is the target.

---

## 0. Kickoff prompt (for the person handing this over)

Put this folder in the repo next to the first handover (for example `handover/update-v3/`), open Claude Code and paste:

> Read handover/update-v3/UPDATE.md fully, then open design/screenshots/team-arsenal-v3.png and the files in design/static/. The team page was built from the first handover; replace it with the v3 two-column design described in UPDATE.md, for all three clubs, from one template. Before you change anything, list the files you'll change, the code you'll delete and the data fields you'll add, then wait for my OK. Never invent facts, sources, contact addresses or deal values.

---

## 1. Why the page is changing

We tested the old team page with fans and a journalist. What we learned:

- People didn't know what the site was. They jumped straight into a club and got lost.
- **Stained** and **Soaked** meant nothing to them until someone explained the scale.
- The sponsor cards around the shirt looked like graphics. People didn't see that they could hover or open them.
- The "Over the years" timeline didn't look clickable.
- After people understood the problem, they asked "OK, and what do I do now?"
- The page felt empty below the shirt.

The new page does this, top to bottom: **what this site is → how bad this shirt is → why that's a problem → every sponsor, with the evidence → what you can do**. The shirt sits on the right, with numbers that match the list. "Travel back in time" is under the shirt.

**Not changing:** the landing page, the soccer overview, the header, the footer, the data layer, the rating rule, the colours and the fonts. We tried calmer colour schemes and decided to keep the current dark and red look.

---

## 2. What's in this folder

| Path | What it is |
|---|---|
| `UPDATE.md` | This file. The spec. |
| `design/screenshots/*.png` | Full-page screenshots at 1440px. **Use these as the visual target.** |
| `design/static/*.html` | The same states as static HTML. Open them in a browser to measure things. Images load from `../../assets/`. |
| `design/source/Club-2col-v3.dc.html` | The design source, with exact styles, copy and state logic. It's the same `.dc.html` format as the first handover (see its `design/README.md`). Arsenal only, with the data hard-coded. |
| `data/additions.json` | New data fields and all fixed copy for this page. Merge them into your data (§9). |
| `assets/` | The five images the snapshots use. They're already in your repo from the first handover, under the same paths. |

States in `design/static/` and `design/screenshots/`:

| File | State |
|---|---|
| `team-arsenal-v3` | Default. The Emirates row is open and Emirates is ticked in "Tell Arsenal". |
| `team-arsenal-v3--scale-tooltip-soaked` | Hovering "Soaked" on the rating scale |
| `team-arsenal-v3--hover-emirates` | Hovering the Emirates row. Marker 1 on the shirt grows and glows. |
| `team-arsenal-v3--all-rows-open` | All three sponsor rows open (static HTML only) |
| `team-arsenal-v3--nothing-ticked` | Emirates unticked. The draft message is empty and the button is grey. |

The mockup's header ("How we rate", "Sources") is simplified. **Keep the header you already built**, with its breadcrumb. Keep the standard footer too.

---

## 3. What to remove from the current team page

Delete this code. Don't hide it behind a flag.

- The **title-row level box**: the meter, the 64px level word and the line "BLOOD LEVEL · 3 OF 4".
- The **kit summary sentence** under the title. Keep `kit.summary` in the data because other pages may use it, but the team page no longer shows it.
- The **stage**: the white panel with front and back photos side by side, the sponsor cards placed around it (`cardSlot` L/R/T), the SVG lines, the rings and the line hit-strokes.
- The **hover-intent** logic (`useHoverIntent`, aim, pending). Nothing on the new page needs it.
- The **"Over the years" timeline**: the period blocks and sponsor lanes.
- The note card "Back of shirt: No sponsor on the back."

Keep `kit.sponsors[].hotspot`. The new markers use it. `cardSlot` is no longer used, but leave it in the data.

---

## 4. Layout (desktop, 1440px)

```
header (unchanged, with breadcrumb)
main  padding 28px 56px 0
├─ "What is this?" bar                                              full width
└─ grid  margin-top 32 · columns minmax(0,1fr) 560px · gap 48 · align start
   ├─ LEFT (flex column, gap 16)                 ├─ RIGHT (flex column, gap 28)
   │  title row: crest + name ····· rating scale │  shirt panel (white)
   │  headline sentence                          │   └─ front photo 480×533 + numbered markers
   │  "Why is that a problem?" box               │   └─ back: thumbnail row, or full photo if the back has a sponsor
   │  change pill                                │  "Travel back in time" (list of seasons)
   │  "Every sponsor on the shirt" + rows        │
   │  "What you can do" box                      │
footer (unchanged, standard variant)
```

Tokens, fonts and chips are the same as `docs/04-design-system.md`. Display = Big Shoulders Display 900 uppercase, Body = Schibsted Grotesk, Mono = IBM Plex Mono. All the copy below is also in `data/additions.json → copy`.

**Right column:** don't make it sticky by default. It's often taller than the viewport, and a sticky column that's taller than the screen hides its bottom. If you want to try sticky, only turn it on when the whole right column fits in the viewport.

---

## 5. Components, top to bottom

### 5.1 "What is this?" bar (new, full width)
- Padding 16px 22px, radius 14, background `#1a1614`, border 1px `#3d332f`, flex, gap 18, centred vertically.
- The logo mark (36px), then the text (16px/1.5, `#d6cec5`): **"What is this?"** in bold `#f3ede6`, followed by the explainer copy. "Clean" is bold `#f3ede6` and "Soaked" is bold `#ff4a3d`.
- On the right, a pill link **"How we rate →"** to `/#how`: height 36, radius 18, border 1px `#4a403b`, 14px bold.

### 5.2 Title row: crest, name and rating scale
- A flex row, `justify-content: space-between`, gap 24.
- **Left:** the crest in a 72px white circle (crest 52px). Then the H1 club name (Display 64px, line-height 0.85), and under it the league and kit (mono 12.5px, `#a39a91`), e.g. "Premier League · Home shirt 2026/27". Keep the crest config flag from the first build.
- **Right: the rating scale (`RatingScale`, new component), 360px wide.**
  - A label above it: "RATING · HOVER A LEVEL" (mono 10.5px/600, letter-spacing 0.12em, `#8a8078`). On touch devices it says "tap a level".
  - Four cells in a grid (`repeat(4, 1fr)`, gap 4). Each cell is a `<button>`, 54px tall, padding 8px 9px, radius 8, its content pushed to the bottom (gap 7):
    - a bar in a 10px-tall slot, full width, radius 2, in the level's fill colour, with heights 4, 6, 8 and 10px for Clean, Spotted, Stained and Soaked (so the scale itself reads as the meter);
    - the level word (Display 17px, line-height 0.9, level text colour).
  - **The current level's cell:** a 2px border in the level's border colour, the level tint as background, opacity 1.
  - **Other cells:** a 1px `#3d332f` border, a transparent background, opacity 0.72. **When hovered or focused:** a 1px `#7a6f66` border, background `rgba(243,237,230,.06)`, opacity 1.
  - Under the cells, a 14px-tall row with "▲ ARSENAL" under the current cell (mono 10.5px/600, uppercase, level text colour, padding-left 9).
  - **There's no "1 of 4" and no description text on the page.** The team asked for this.
  - **Tooltip.** Hover or focus a cell to show it. It's positioned absolutely under the scale (`left: 0; right: 0; top: 100%; margin-top: 6px; z-index` above the rows), padding 14px 16px, radius 12, background `#26201d`, border 1px `#4a403b`, shadow `0 12px 28px rgba(0,0,0,.5)`, gap 6. It holds:
    - the level word (Display 22px, level text colour);
    - `levels[].plain` (14px/1.45, `#e8e2da`);
    - a note (mono 11px/600, uppercase, level text colour): "{Club} is here" for the level on screen, "{Club} was here in {periodLabel}" for a level the club had in another kit period (use the most recent one), and nothing otherwise.
  - **If the kit on screen is Not rated:** no cell is highlighted, the marker row is empty, and the label says "RATING · NOT RATED YET".

### 5.3 Headline sentence
- 24px/1.35 bold `#f3ede6`. The level word is in its level text colour.
- Text: `kit.headline`, with `{level}` replaced by the coloured level word. If a kit has no `headline`, build one (§8).

### 5.4 "Why is that a problem?" box (new)
- Padding 14px 18px, `border-left: 3px solid #b0402f`, radius `0 12px 12px 0`, background `rgba(176,64,47,.10)`.
- Text 16.5px/1.55 `#e8e2da`: **"Why is that a problem?"** in bold `#f3ede6`, then `sponsor.why.text`. The word "sportswashing" is bold `#f3ede6`. After it, the source of the first claim in `why.claimIds` (mono 11px `#a39a91`, `nowrap`, with "↗"), linking to the claim's `source.url` when there is one.
- Show one box for each sponsor on the kit rated **serious or severe** that has a `why`, in list order, with at most two boxes. Arsenal 2026/27 shows one (Emirates). Atlético shows two (Visit Rwanda, then Riyadh Air, following the list order in §5.6).
- If a sponsor rated serious or severe has no `why`, show no box for it. In development, log a visible TODO. Never generate this text.

### 5.5 Change pill
- Shown only when the kit has a `change`. Height 28, padding 0 12px, radius 14, 13.5px bold, with a 12px arrow icon.
- `better` = colour `#4fc3b0` with a down arrow. `worse` = `#ff4a3d` with an up arrow (the same icons as before).
- Text: `kit.change.text` (Arsenal 2026/27: "Better than last season: Visit Rwanda left in June 2026").

### 5.6 "Every sponsor on the shirt": rows that open (new)
- Heading block, 18px below the pill: an H2 "Every sponsor on the shirt" (Display 36px/0.9) and the sub line "Click a row for the money and the evidence. The numbers match the shirt." (15px `#b3aaa0`).
- The list has a top border 1px `#3d332f`. It has a header row and then one row per sponsor.
- **Grid for the header and every row:** `44px 170px minmax(0,1fr) 130px 28px`, gap 10, padding `10px 6px` for the header and `14px 6px` for rows.
  - Header cells: "#", "Sponsor", "Who really pays", "Rating", and an empty cell. Mono 10.5px/600, letter-spacing 0.1em, uppercase, `#8a8078`, border-bottom 1px `#3d332f`.
- **Row:** a wrapper with border-bottom 1px `#2e2825`. Its first child is a full-width `<button aria-expanded aria-controls>` with no border and a transparent background, containing:
  1. the **number marker**, 30px (the same style as the shirt markers, §5.8);
  2. the sponsor name (Display 26px/0.9 `#f3ede6`) with the placement under it (12.5px `#a39a91`): "Front of shirt", "Back of shirt", "Sleeve", "Shorts";
  3. who really pays (14px/1.4): the direct owner's name in bold `#f3ede6`, or "Not checked yet" in `#a39a91` for unrated sponsors;
  4. the tier chip (as before; it hugs its text, so use `justify-self: start`): Serious `#e0705f`, Severe `#ff4a3d`, Concern `#e6b3a8`, Nothing found `#f3ede6`, and "Not rated yet" `#b3aaa0` with a dashed `#8a8078` border;
  5. a chevron (16px `#f3ede6`) that rotates 180° when the row is open.
- **Detail panel** (under the button when open): margin `0 6px 16px 60px`, padding 16px 18px, radius 12, background `#1a1614`, border 1px `#3d332f`, a grid `180px 1fr` with gap 18.
  - **Left column, "facts":** each fact is a mono 10.5px label (uppercase, letter-spacing 0.08em, `#8a8078`), a value (14.5px/1.35 bold `#f3ede6`) and an optional sub line (12.5px `#a39a91`).
    - "Money (reported)": e.g. "Up to £70m a season", with the sub line "about $93m · SportsPro · deal runs to 2033". Build it from `deals`: "up to" when `upTo`, the currency symbol, `usdApprox`, `source.short` (falling back to `source.name`), and "deal runs to {end year of deal.to}" when `to` is in the future. Unknown value = "Value not disclosed".
    - "Owned through": `owner.via`, only if present.
  - **Right column:** "**Evidence:** {claim.text}" (14.5px/1.45 `#e8e2da`) with its source under it (mono 11px `#8a8078`, "Name, Mon YYYY ↗"), for the first two claims of the sponsor. Then a link "All sources for {Sponsor} →" (14px bold `#f3ede6`) to the fact sheet anchor `/clubs/[slug]/fact-sheet#{sponsorId}` (§7.6).
  - **Unrated sponsor:** one column with "We haven't traced who owns {Sponsor} yet, so there is no rating. A rating only goes up once every claim is sourced." and the link "Help check it →" (bold, `#ff6b5e`, §7.6).
- **Departed sponsor row** (for example Visit Rwanda on Arsenal 2026/27; see §8 for when to show it). Opacity 0.8.
  - Instead of a number: a 26px circle with background `rgba(79,195,176,.15)` and a "✓" in `#4fc3b0`.
  - The name is struck through (`text-decoration-color: #4fc3b0`) in `#d6cec5`. The placement line is "{Placement}, {startYear}–{endYear}", e.g. "Sleeve, 2018–2026".
  - Who pays: the owner name, not bold. Chip: "Left in {year}" in `#4fc3b0`.
  - Detail: "Money (reported)" on the left. On the right: "Gone since {Month YYYY}, after {n} seasons. That's why {Club} is {Level} now, not {Previous level}." Write n as a word up to ten. Add the second sentence only when the previous kit's level was worse.
- **Order and numbers:** sort the sponsors by tier score, highest first, with unrated last. Break ties by placement: front, back, sleeve, shorts. Number them 1…n. Departed sponsors come last and get no number.
- **Default:** the first row is open. Rows open and close on their own, so several can be open at once.

### 5.7 "What you can do" box (new)
- 24px below the sponsor list. A section with padding `26px 26px 12px`, radius 20, background `#1a1614`, border 1px `#4a403b`, flex column, gap 20.
- **Header:**
  - a kicker "NOW WHAT?" (mono 12px/600, letter-spacing 0.14em, `#4fc3b0`);
  - an H2 "What you can do" (Display 44px/0.9);
  - an intro (16.5px/1.5 `#d6cec5`): "You don't have to stop supporting {Club} or wearing the shirt. Sponsors do change, and fans speaking up is part of why: {examples}." Then the link "See who dropped a sponsor →" (bold `#f3ede6`) to `/#dropped`. Add `id="dropped"` to the landing page's "They dropped it" section if it doesn't have one.
  - `{examples}` comes from `dropped.json`. If this club has a featured entry, start with "{Sponsor} left {Club}'s {placement} in {year}". Then add up to three other featured clubs by short name: "and Bayern, Schalke and Manchester United have all dropped sponsors before". The mockup says "this summer". Use the year instead, so the text doesn't go stale.
- **The main card, "Tell {Club}":** a grid `minmax(0,1fr) 290px`, gap 22, padding 22, radius 16, background `#26201d`, border 1px `#6a3a31`.
  - **Left column (gap 14):**
    - an icon tile (44px, radius 12, background `#26201d`, border 1px `#3d332f`, with a 22px envelope icon, stroke `#f3ede6` 1.8) and "Tell {Club}" (Display 30px);
    - the text (14.5px/1.5 `#d6cec5`);
    - "WHAT TO RAISE" (mono 10.5px/600 `#8a8078`), then one checkbox per sponsor on the **current** kit (20px, `accent-color: #c8191f`, 14.5px). Rated sponsors (concern or worse) show **name** · tier in the tier colour, and are ticked by default. Unrated sponsors are disabled, in `#8a8078`, with "· not rated yet". Sponsors rated "nothing found" aren't listed;
    - the button (height 46, radius 23, 15px bold, white): "Write to {Club} about {Sponsor}" for one ticked sponsor, "Write to {Club} about {n} sponsors" for several, or "Tick a sponsor first" on `#4a403b`, disabled, for none. Otherwise its background is `#c8191f`.
  - **Right column:** "YOUR MESSAGE (DRAFT)" as a label, then a preview box: height 236, padding 14px 16px, radius 12, background `#0f0d0c`, border 1px `#3d332f`, 13.5px/1.55 `#d6cec5`, with a 60px fade to `#0f0d0c` at the bottom. It updates live from the ticked sponsors (§7.5). With nothing ticked it shows "Tick a sponsor to see your message." in `#8a8078`.
- **"MORE WAYS TO HELP"** (label, padding-bottom 6), then rows. Each row is a grid `44px 1fr auto` with gap 14, padding 14px 0 and a top border 1px `#2e2825`. It has an icon tile, a title (16.5px bold `#f3ede6`) above the text (14px/1.45 `#b3aaa0`), and an outline button (height 38, radius 19, border 1px `#7a6f66`, 14px bold, `nowrap`). The rows are:
  1. Share {Club}'s status → "Share the card"
  2. Bring it to your fan group → "Get the fact sheet"
  3. Help check {first unrated sponsor} → "Help check it". Show this row only if the current kit has an unrated sponsor.
  4. Follow {Club} → "Follow {Club}"
  - The icons are in `design/source/Club-2col-v3.dc.html` (`I_SHARE`, `I_PEOPLE`, `I_SEARCH`, `I_BELL`, `I_MAIL`): simple 24×24 stroke icons.

### 5.8 Right column: the shirt panel
- A white panel: padding 20, radius 20, flex column, gap 14, text `#0f0d0c`.
- Header row: "THE SHIRT · HOME 2026/27" (mono 11.5px/600, letter-spacing 0.14em, `#5f584e`) on the left, and "FRONT" (mono 11px `#8a8078`) on the right.
- The front photo is 480×533 (720×800 scaled), centred, `position: relative`.
- **No outline around the logos.** The team was explicit about this. The hit areas are invisible `<button>`s (`border: none; background: transparent`) that show an outline only on `:focus-visible`.
  - Wide logos (`hotspot.w ≥ 0.15`): the hit area is exactly the logo box.
  - Small logos: `max(38, w·W + 12)` × `max(38, h·H + 12)` px, centred on the logo.
  - `W`, `H` = the rendered photo size.
- **Numbered markers** (`SponsorMarker`, which the rows use too):
  - A circle with a white number (Body 800, 46% of the size) and `box-sizing: border-box`.
  - **Rated:** fill `#c8191f`, border `3px solid #ffffff`.
  - **Unrated:** fill `#0f0d0c`, border `3px dashed #ffffff`.
  - Both: `box-shadow: 0 0 0 2px #0f0d0c, 0 4px 12px rgba(0,0,0,.35)`. The white ring plus the dark outer ring keeps the number readable on a red shirt and on white.
  - Size on the photo: rated 0.10·W (48px), unrated 0.092·W (44px). In the rows: 30px.
  - `pointer-events: none` on the marker itself. The hit area underneath handles the pointer.
  - **Placement:**
    - Wide logo: vertically centred on the logo, overlapping its left edge. `left = (x − w/2)·W − 0.079·W` (38px), `top = y·H − size/2`.
    - Small logo: centred above the logo. `left = x·W − size/2`, `top = (y·H − hitH/2) − 40·(W/480)`.
    - Clamp the marker inside the photo.
  - **Highlighted** (§7.2): `transform: scale(1.2)` and `box-shadow: 0 0 0 6px rgba(255,255,255,.9), 0 0 22px 8px rgba(255,255,255,.55)` on a wrapper the same size as the marker, with a 0.15s transform transition (none under `prefers-reduced-motion`).
- **Back of the shirt:**
  - **No sponsor on the back** (Arsenal): a row under a 1px `#e6e0d8` top border (padding-top 14, gap 16) with the back photo at 80×89, "BACK · NO SPONSOR" (mono 11px/600 `#5f584e`) and "Hover a number to find it in the list." (14px/1.4 `#3d332f`).
  - **A sponsor on the back** (Atlético: Visit Rwanda): show the back photo at the same 480px size under the front, with its own header label "BACK" and its own markers. Keep the hint line under it.
- **Don't add "Open the interactive shirt".** The team removed it: this page is interactive enough.

### 5.9 Right column: "Travel back in time"
- Only shown when the club has more than one kit period. Atlético has one, so no section.
- A heading block: "TRAVEL BACK IN TIME" (mono 12px/600, letter-spacing 0.12em, `#f3ede6`) and "Click a season to see that shirt and its sponsors." (14px `#a39a91`). Gap 12 between the rows.
- **One row per kit period, newest first.** Each row is an `<a href="?season=YYYY-YY">`: a grid `64px 1fr auto 18px`, gap 14, padding `10px 14px 10px 10px`, radius 14. It holds:
  - a 64×64 white thumbnail (radius 10, `overflow: hidden`) with that period's front photo at 58×64, `object-fit: cover`;
  - the period label (mono 12px `#d6cec5`), with "2026/27 · now" for the current one, and `kit.shortLine` under it (14px/1.35 `#b3aaa0`);
  - a mini meter (bars 4px wide, 5/8/11/14px tall, gap 3, level text colour) and the level word (Display 22px, level text colour);
  - "→" (`#a39a91`).
- **The period on screen:** a 2px `#f3ede6` border, background `rgba(243,237,230,.05)`, and the tag "YOU ARE HERE" (mono 10.5px/600, letter-spacing 0.08em) after its label. **Other periods:** a 1px `#3d332f` border.

---

## 6. Hover, focus and touch at a glance

| Target | Hover / focus | Click / tap |
|---|---|---|
| Rating-scale cell | Shows the tooltip | Touch: toggles the tooltip. Tap outside or Esc closes it. |
| Sponsor row | Row background `rgba(243,237,230,.07)` + its shirt marker highlighted | Opens or closes the row |
| Logo hit area on the shirt | Its marker highlighted + its row background | Opens its row, scrolls the row into view (`block: 'nearest'`) and focuses the row button |
| Season row | Border `#7a6f66` | Switches the page to that season (§7.3) |
| Checkbox in "Tell {Club}" | none | Updates the button label and the draft |

---

## 7. Behaviour

### 7.1 State
The page needs: the kit on screen (from `?season=`, defaulting to the current kit), the set of open rows (by sponsor id; the first row open by default), the highlighted sponsor (from hover or focus on a row or a hit area), the hovered scale level, and the ticked sponsors for the message (all rated sponsors of the **current** kit by default).

### 7.2 Linking rows and markers
The same sponsor id highlights both sides. Highlighting also happens on `:focus-within` for the row and on focus for the hit area, so keyboard users get the same link.

### 7.3 Switching seasons
- A season row is a real link (`?season=2018-19`). Update the URL, and don't scroll the page on desktop.
- These switch to the chosen kit: the scale's current cell and marker, the headline, the why boxes, the change pill, the sponsor rows (including departed rows relative to *that* kit's predecessor), the shirt photos and markers, and the shirt panel header ("THE SHIRT · HOME 2018/19 – 2025/26").
- **"What you can do" always stays about the current kit.** You can only write to the club about today's sponsors.
- **On a past season** (not designed, so keep it minimal), show a notice between the title row and the headline: "You're looking at an old shirt ({periodLabel})." plus the link "Back to today's shirt →". Height 36, radius 18, border 1px `#4a403b`, 14px `#d6cec5`, with the link bold `#f3ede6`.

### 7.4 Rating scale
- The cells are buttons. Tie the tooltip to the cell with `aria-describedby`. Each cell's `aria-label` is "{Level}, {n} of 4. {plain}" plus " {Club} is here." on the current cell. The "of 4" is for screen readers only.
- Esc closes the tooltip. Don't use the `title` attribute.

### 7.5 "Tell {Club}": the draft message and sending it
- Build the draft in a pure function (`lib/messages.ts`, with unit tests) from `copy.message`:
  - `greeting`, then a blank line;
  - `opening`, then the first sponsor's `sponsorParagraph` (the following sponsors use `sponsorParagraphNext`, one paragraph each);
  - `ask`;
  - `signoff`.
  - Fill in `{placement}` (lowercase: front, back, sleeve), `{ownerVerb}` (`sponsor.ownerVerb`, default "owned by"), `{owner}` (the direct owner's name) and `{messageLine}` (`sponsor.why.messageLine`).
  - If a ticked sponsor has no `messageLine`, leave that sentence out.
- **The button:**
  - If `club.contact.email` exists, open `mailto:` with `copy.message.subject` and the draft as the body.
  - Otherwise, open a dialog with the draft in an editable textarea, a "Copy message" button, and, if `club.contact.url` exists, "Open {Club}'s contact page".
  - **All contacts are `null` today. Never guess an address.**

### 7.6 "More ways to help"
- **Share:** `navigator.share({ title: "{Club} is {Level}", text: headline as plain text, url })`. If that isn't available, copy the URL and show a small toast, "Link copied".
- **Get the fact sheet:** add a new route, `/clubs/[slug]/fact-sheet`. It's a plain, print-friendly page (black on white, the site fonts, A4 print CSS) with:
  - the club, the level and the date checked;
  - the headline and the why text;
  - every sponsor with its facts;
  - **every claim with its source name, date and URL**;
  - the "ratings are illustrative" line;
  - a "Print or save as PDF" button that calls `window.print()`;
  - an `id` on each sponsor section (used by "All sources for {Sponsor} →").
  - This page isn't designed. Keep it simple.
- **Help check {Sponsor}:** link to `${NEXT_PUBLIC_REPO_URL}/issues/new?labels=sponsor-check&title=Check%20sponsor%3A%20{Sponsor}`, or to `/#contribute` if there's no repo URL. The "Help check it →" link in unrated rows goes to the same place.
- **Follow {Club}:** email alerts are still parked. The button opens a small dialog: "Alerts aren't live yet. For now you can watch the open data on GitHub, where every change is recorded." with a link to the repo. Put the whole row behind a flag (`FOLLOW_ROW`, default on).

---

## 8. One template for all clubs

The design shows Arsenal. Build Atlético and Villa from the same template with these rules.

| Case | Rule |
|---|---|
| Headline | Use `kit.headline` (with `{level}`). Otherwise build one from the "driving" sponsor: the highest tier score, front winning ties. The pattern is "The shirt is {level}: the {placement} sponsor, {Sponsor}, is {ownerVerb} the {Owner}." For past kits, use "was". Not rated: "We haven't rated this shirt yet: {n} sponsors still need checking." Clean: "The shirt is {level}: we checked every sponsor and found nothing." |
| Why boxes | Only from `sponsor.why` (§5.4), never generated. |
| Change pill | From `kit.change`. No change, no pill. |
| Departed rows | Sponsors in the **immediately previous** kit period that aren't on the kit on screen, **only if they were rated concern or worse**. Leaving is good news only then. So Villa 2026/27 doesn't show Trade Nation (unrated). |
| Month and seasons in the departed line | `deal.endedOn` for the month. Otherwise write "Gone since the end of {YYYY/YY}". Count seasons from `deal.from` to `deal.to`. |
| Back sponsor | Show the full back photo with its markers (§5.8). |
| One kit period | No "Travel back in time" section. The scale tooltip never shows "was here". |
| "Help check" row | Only when the current kit has an unrated sponsor. Use the first one in list order. |
| Intro examples | See §5.7. Leave out this club's own drop when there isn't one. |

What you should see:
- **Arsenal 2026/27:** Stained. One why box (Emirates). Rows: 1 Emirates, 2 Deel, then Visit Rwanda (departed). The "Help check" row names Deel.
- **Arsenal 2018/19–2025/26:** Soaked. Two why boxes (Visit Rwanda, then Emirates). Rows: 1 Visit Rwanda (severe), 2 Emirates. No departed rows. The change pill is red: "Worse from 2018: Visit Rwanda joined".
- **Atlético 2026/27:** Soaked. Two why boxes (Visit Rwanda, then Riyadh Air). Rows: 1 Visit Rwanda (severe, back), 2 Riyadh Air (serious, front), 3 Kraken (unrated, sleeve). The back photo is shown full size with marker 1. No travel section.
- **Villa 2026/27:** Soaked. One why box (Visit Rwanda). Rows: 1 Visit Rwanda, 2 Betano (unrated). No departed rows. Red pill: "Worse than last season: Visit Rwanda took the front".
- **Villa 2024/25–2025/26:** Not rated. No why box, no highlighted scale cell. Rows: Betano and Trade Nation, both unrated.

---

## 9. Data changes

Merge `data/additions.json` into your data by id, and extend the zod schemas and `data/schema/*.schema.json`:

| File | New field | Type | Notes |
|---|---|---|---|
| `levels.json` | `plain` | string | The tooltip text |
| `sponsors.json` | `ownerVerb` | `"owned by" \| "paid for by"`, optional | Defaults to "owned by" |
| `sponsors.json` | `why` | `{ text, claimIds[], messageLine, status: "draft" \| "reviewed" }`, optional | Every `claimIds` entry must exist and share an owner with the sponsor's owner chain. Validate this. |
| `kits.json` | `headline` | string with `{level}`, optional | |
| `kits.json` | `shortLine` | string, optional | Fallback: "{Sponsor} on the {placement}" joined with commas |
| `kits.json` | `change.text` | (existing) | Arsenal 2026/27 gets new wording |
| `deals.json` | `endedOn` | `YYYY-MM`, optional | |
| `deals.json` | `source.short` | string, optional | |
| `clubs.json` | `contact` | `{ kind, email?, url?, source }` or `null` | Nothing is filled in yet |
| (new) | `copy` block | | Put it in `lib/copy/team-page.ts` or a JSON file. It's all the fixed strings. |

Add pure, unit-tested helpers in `lib/data`:
- `sponsorRows(kit, prevKit)`: the sorted, numbered rows plus the departed rows;
- `headlineFor(kit)`;
- `whyBoxes(kit)`;
- `scaleNote(club, level, kitOnScreen)`;
- `markerPosition(hotspot, W, H, rated)`;
- `actionIntroExamples(club)`;
- `buildMessage(club, sponsors)`.

---

## 10. Mobile (under 900px; not designed, follow these rules)

Everything stacks in one column, in this order:
1. The "What is this?" bar (14px text). The button goes under the text.
2. The title: crest 48, name 44px. **The scale goes under the name at full width**, with the label "RATING · TAP A LEVEL". The tooltip toggles on tap.
3. The headline (20px), the why box(es), the change pill.
4. **The shirt panel comes before the sponsor list on mobile**, so people see the numbers first. The photo is full width (max 480), and the markers scale with it. Tapping a marker opens its row and scrolls to it.
5. The sponsor rows. The grid becomes `36px 1fr auto 24px`. "Who really pays" moves into the detail panel as its first fact, and the detail panel has no left margin and one column.
6. "What you can do". The main card stacks: the draft preview goes under the checkboxes, collapsed to 120px with a "Show the whole message" toggle, and the button is full width. In "More ways to help", the button drops under the text.
7. "Travel back in time".

Between 900 and 1200px, keep two columns but narrow the right column to 420px (the photo scales).

---

## 11. Update CLAUDE.md

In the repo's `CLAUDE.md`:
- In "Pages to build", change item 3 to: "Team pages `/clubs/[slug]`: **v3 two-column layout**, see `handover/update-v3/UPDATE.md`. The old stage, cards, lines, hover intent and timeline were removed on purpose."
- In "Definition of done", replace the team-page line with: "Team pages match `update-v3/design/screenshots/` for Arsenal, and follow UPDATE.md §8 for Atlético and Villa."
- Remove the rule that says "focus opens sponsor cards". Keep the rest of the accessibility rules.

---

## 12. Done when

- `/clubs/arsenal` matches `design/screenshots/team-arsenal-v3.png` at 1440px (same layout, type, colours and copy, with only small differences). The four other states can be reproduced.
- Atlético and Villa render from the same template, following §8, including Atlético's back photo with its marker.
- None of the removed pieces (§3) remain in the code, and there's no hover-intent code.
- Hovering or focusing a row highlights its shirt marker and the other way round. Clicking a marker opens and scrolls to its row. `?season=` works and "What you can do" stays on the current kit.
- The draft message updates live, and the button never uses an invented address.
- The fact sheet route exists, and every claim on it shows its source.
- The unit tests for the helpers in §9 pass.
- The Playwright visual test for the team page is updated to the v3 screenshots, plus a mobile smoke test at 390px.
- `npm run build`, `npm test` and `npm run test:e2e` pass.

---

## 13. Open questions (don't solve these by inventing things)

1. **Club contacts.** "Tell {Club}" mentions the supporter liaison officer, but we have no checked address for any club. Leave `contact: null` and use the copy dialog until the team adds real ones.
2. **"Fans speaking up is part of why"** is a claim about cause. The team needs a source for each club it names, or softer wording. Keep the copy but list it in your summary.
3. **The Human Rights Watch link** for `uae-mass-trial-2024` is still `null` in `claims.json`. The why box shows the source without a link until it's filled.
4. **The why texts and message lines are drafts** (`status: "draft"`), written only from existing claims. The team reviews them before launch.
5. **The past-season notice, the fact sheet page and the mobile layout aren't designed.** Keep them minimal and list anything you had to decide.
6. **Follow alerts** aren't live, so the row opens the dialog from §7.6.
7. Everything in the first handover's `docs/07-open-questions.md` still applies: image licences, and ratings being illustrative.
