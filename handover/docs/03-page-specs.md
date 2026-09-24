# 03. Page specs

All measurements are CSS px at the design width of **1440px**, with a content column of 1328px (56px side padding). The snapshots in `design/static/` are the visual reference, and the `.dc.html` files in `design/source/` hold every exact style. Where this document and a snapshot differ, the snapshot wins.

Fonts: **Display** = Big Shoulders Display 900, uppercase, tight line-height (0.8–0.9). **Body** = Schibsted Grotesk. **Mono** = IBM Plex Mono, usually uppercase with letter-spacing 0.06–0.14em. Colours are named as in `docs/04-design-system.md`.

---

## 1. Shared chrome

### Header (all pages)
- Height 72, horizontal padding 56, bottom border 1px `--line`.
- Left: the logo mark (34px, see the design system) and the wordmark "BEHIND THE JERSEY" (Display 25px, letter-spacing 0.05em). Links to `/`.
- Right: nav links "Sports" (→ `/soccer/premier-league`), "How we rate" (→ `/#how`) and "Contribute" (→ `/#contribute`), body 15px `--text-2`, gap 28. Then a pill link "Open data on GitHub" with a code icon (`</>`): height 36, radius 18, border 1px `--line-3`, 14px bold, linking to `NEXT_PUBLIC_REPO_URL`.
- Team pages add a breadcrumb in the header, after the logo: "ALL CLUBS / SOCCER / LA LIGA / ATLÉTICO DE MADRID" (mono 12px, uppercase, `--text-4`, with the current item in `--text`). "All clubs" links to the overview.
- Optional on overview and team pages: a compact search (440×44) in the header, which uses the same `SearchBox` as the landing page.

### Footer
- Top border 1px `--line`, mono 11px `--text-5`.
- Landing variant (height 88): on the left **"YOUR CHEST. THEIR AD."** in Display 22px, letter-spacing 0.04em, colour `#8a2a22` (a quiet dark red, deliberately understated). On the right, two right-aligned lines: "Deal values are reported estimates per year (SportsPro, The Athletic). Ratings are illustrative until the method is final." and "Club crests: football-data.org."
- Standard variant (height 72): "Shirt photos: footballkitarchive.com. Club crests: football-data.org. Both need permission before going public." on the left, "Ratings shown are illustrative until the method is final." on the right.

---

## 2. Landing page `/`

Snapshots: `landing.html` and `landing--search-open.html` (query "rwa").

### 2.1 Hero (centred)
- Padding 84 top, 64 bottom. A vertical stack with gap 22.
- Kicker (mono 12px/600, letter-spacing 0.12em, `--text-4`): "7 CLUBS RATED · 2 LEAGUES MAPPED · UPDATED 24 SEP 2026". **Compute these values from the data**: rated clubs, leagues with any rated club, and the latest change or data date.
- H1 (Display 104px, line-height 0.88, two lines): "WHO'S BUYING<br>YOUR **[WORD]**?" The word is `--accent` (`#ff3b30`) and rotates. See `docs/06-interactions.md` §2.
- Sub (body 20px/1.45, `--text-2`, max-width 700): "Type a club, a league, a sport or a sponsor. We trace every sponsor back to who really pays, and rate how much blood is on the money."
- Search box, hero size: 760×68, radius 34, background `--panel`, border 2px `--line-3`, shadow `0 12px 44px rgba(0,0,0,.5)`, magnifier icon 24px, input 19px, placeholder "Search a club, league, sport or sponsor". The dropdown is described in `docs/06-interactions.md` §1.
- Try row: "TRY" (mono 12px, `--text-5`) followed by chips "Arsenal", "Premier League", "Visit Rwanda", "Formula 1", "Real Madrid". Chips are 34px tall, radius 17, border 1px `--line-2`, 14px `--text-2`, and a brighter border on hover. Clicking one fills the search and focuses it.
- Level key row: "BLOOD LEVEL" (mono 11px, `--text-5`), then Clean, Spotted, Stained and Soaked, each as a mini meter (bars 4px wide, 6/9/12/16px tall) plus the word (Display 18px in its level text colour), then "How we rate →" (14px bold) linking to `#how`.

### 2.2 Just changed
- A 24px margin (the hero already has 64px bottom padding).
- Heading row: H2 "JUST CHANGED" (Display 56px) with the sub "Sponsors come and go every summer. This is what moved, and which way." (17px/1.45 `--text-2`). On the right, the link "Every change, with sources →" (15px bold).
- Four `ChangeCard`s in a 4-column grid (gap 20), the 4 newest from `changes.json`. Card: padding 20, radius 16, `--panel`, border 1px `--line-3`, vertical gap 14:
  1. A row with the kind tag (mono 11px/600 uppercase, 12px arrow icon, colour by kind: worse `--level-soaked-text` with up arrow, better `--good` with down arrow, renewed `--text-2` with a side arrow, being rated `--text-4` with a dash) and the date (mono 11px `--text-5`, "6 Aug 2026" or "Jun 2026" depending on precision).
  2. `CrestBadge` 48 and the club name (19px bold).
  3. `LevelChip` for `levelAfter`.
  4. Title (17px bold/1.3).
  5. Text (14.5px/1.45 `--text-2`).
  6. Source (mono 11px `--text-5`, pinned to the bottom).
- The whole card links to the club's team page, or its overview if there is no team page.

### 2.3 They dropped it (positive)
- Margin-top 96. H2 "THEY DROPPED IT", sub "Clubs can change, and these ones did. Say thanks, and ask your own club to be next." (max-width 720). Right-hand link in `--good`: "Know a club that changed? Tell us →" (goes to `#contribute`).
- Six `DroppedCard`s (`featured: true`, newest first) in a 3-column grid, gap 20, equal heights. Card: padding 22, radius 16, background `rgba(79,195,176,.07)`, border 1px `rgba(79,195,176,.3)`, gap 14:
  - Top row: `CrestBadge` 56, then club name (19px bold) above the `what` line (mono 11px/600 uppercase `--good`), and the year on the right (Display 40px `--good`).
  - Text (15px/1.5 `#e6dfd7`).
  - Bottom row: a "Say thanks" pill (34px, border 1px `--good`, text `--good`, 14px bold) and the source (mono 11px). A missing source shows nothing in production and a TODO marker in development.
- Tone: celebratory and grateful. No shaming language.

### 2.4 League by league
- Margin-top 96. H2 "LEAGUE BY LEAGUE", sub "Every club gets a slot, worst first. Dashed means nobody has checked it yet.", right link "All sports and leagues →".
- One row per soccer league (Premier League, La Liga, Bundesliga, Ligue 1, Serie A, MLS). Grid `220px | 1fr | 210px`, gap 32, padding 20px 0, bottom border `--line`. The whole row links to the league overview.
  - Left: league name (20px bold) and "Country · X of Y rated" (13px `--text-4`).
  - Middle: the strip, with `clubCount` slots, flex 1 each, gap 4. Each slot is a crest (26px; opacity 0.5 when unrated) above a bar (18px tall, radius 3, level fill). Unrated slots have a dashed 1px `#5a504a` bar, and slots for unknown clubs show a 22px dashed circle in place of a crest. Order: worst first, then unrated clubs, then unknown placeholders. The `title` attribute is "Club: Level".
  - Right: a big value (Display 34px) with a small line under it (13px `--text-3`). Rated leagues show "4 of 20" in `--level-soaked-text` with "shirts carry a sponsor we rate as bad" (La Liga: "2 of 20" / "bad so far, 18 clubs still to check"). Not-started leagues show "Not started" in `#6f665e` with the first `leagues.notes` entry or "Be the first to map it".
- **Don't show league money totals here.** The team rejected adding up money per league.

### 2.5 How we rate (`id="how"`)
- Margin-top 96. Kicker "HOW WE RATE" (mono 12px/600, `#ff6b5e`), H2 "NOT A HUNCH. THE SAME FIVE STEPS FOR EVERY SHIRT.", and the sub "Agents do the legwork, people check it, and every claim links to its source. Anyone can see every step on GitHub." (max-width 760).
- Five `StepCard`s in a 5-column grid, gap 14. Card: padding 18, radius 14, `--panel`, border `--line-3`. It holds the number (Display 34px `--level-soaked-text`), a "who" pill on the right (24px tall, radius 12, mono 10.5px uppercase, border and text in the who colour), the title (18px bold), text (14px/1.45 `--text-2`) and a foot note (mono 12px `--text-4`).
  1. Collect · Agent · "Who is on every shirt this season: front, back and sleeve." · "Every club, every season"
  2. Trace · Agent · "Who owns each sponsor, all the way up to a state or a fund." · "Company registries, reports"
  3. Find evidence · Agent + you (`#e6b3a8`) · "Human-rights reports tied to that owner. Every claim gets a source." · "UN, NGOs, courts, press"
  4. Review · Person (`--good`) · "A person checks each claim and source before anything counts." · "Nothing goes live unchecked"
  5. Publish · Automatic · "The rating goes live and the change is logged for everyone to see." · "Full history, public"
- Under the steps, the label "WHAT THE LEVELS MEAN" (mono 11px `--text-4`), then 4 cells (grid 4, gap 12). Cell: padding 16px 18px, radius 12, `--panel`, border `--line`. Each has a meter (bars 6px wide, 9/14/20/26px tall), the level word (Display 24px in the level text colour) and its definition (13px `--text-3`): Clean "Checked. Nothing found." · Spotted "A lesser link to a state." · Stained "A serious sponsor on the front." · Soaked "A severe sponsor, or two serious ones."

### 2.6 How to help (`id="contribute"`)
- Margin-top 96. A panel with padding 48, radius 24, `--panel`, border `--line-3`, in a grid `1fr | 500px` with gap 56.
- Left:
  - Kicker "OPEN DATA · OPEN PIPELINES · OPEN AGENTS" (`#ff6b5e`).
  - H2 "HELP US CHECK EVERY SHIRT" (Display 60px).
  - Paragraph (17px/1.5): "All the data, the pipelines and the agents are public on GitHub. Pick the way that suits you. A person reviews every claim before it goes live."
  - Three rows (grid `44px | 1fr | auto`, bottom borders) with the number (Display 34px red), title (18px bold), text (14.5px) and a CTA pill (36px, border `--line-3`):
    1. "Run our agents": "Point our pipeline at a club nobody has checked yet and open a pull request with what it finds." · Read the guide
    2. "Bring your own agent": "Any agent can help if it writes our evidence format: one claim, one source, one file." · See the format
    3. "Check a club by hand": "No code needed. Pick a club, note who sponsors it and who owns them, and link your sources." · Pick a club
- Right:
  - Label "NOBODY HAS CHECKED THESE YET · PICK ONE".
  - Chips for every unrated club in the Premier League: 36px tall, radius 18, background `--bg`, border `--line-3`, a 28px `CrestBadge` and the short name (13px bold). Each chip links to "claim this club" (the contribution issue template).
  - The line "Plus the Bundesliga, Ligue 1, Serie A and MLS: nobody has started those yet." (generated from leagues with status `not-started`).
  - Two 52px buttons: primary "Open the repo on GitHub" (background `--text`, text `--bg`, with the code icon) and secondary "Read the contributor guide" (border `--line-3`).
- **No repository file tree here.** The team removed it.

### 2.7 Footer
The landing footer with "Your chest. Their ad." (see §1).

---

## 3. Soccer overview `/soccer/[league]` (club crests version)

Snapshots: `overview-premier-league.html` and `overview-la-liga.html`. Source: `Overview.dc.html` with `view = "crests"`. The v1 (shirts) and v3 (crests + shirts) variants in the same source are **not** to be built.

### 3.1 Top
- Header, then **sport tabs** (height 56, bottom border): Soccer · Basketball · American football · Motorsport · Tournaments & governing bodies. Tab: padding 0 18, 15px bold. Active: `--text` with a 3px `--accent` underline. Inactive: `--text-4`. Routes: `/soccer/...`, `/basketball`, and so on. Sports that aren't mapped show a panel (§3.6).
- Main padding: 40px top, 56px sides.
- Hero: H1 "WHAT'S ON YOUR CLUB'S SHIRT?" (Display 72px, line-height 0.9, max-width 760) and the sub "Every sponsor, traced back to who really pays. The more blood behind the money, the higher the blood level." (18px/1.45 `--text-2`). *Open question: align this with the landing headline style. Keep it as is until the team decides.*
- League chips (margin-top 36): Premier League · La Liga · Bundesliga · Ligue 1 · Serie A · MLS. 40px tall, radius 20, border `--line-2`, 14px/500. Active: background `--text`, text `--bg`.

### 3.2 Every club at a glance (the team's favourite part)
- A panel (margin-top 28): padding 20px 22px, radius 16, `--panel`, border `--line-3`, gap 12.
- Headline (20px bold): "{League}: {bad} of {clubCount} home shirts carry a sponsor we rate as bad. {n} is/are {worst level}." Example: "Premier League: 4 of 20 home shirts carry a sponsor we rate as bad. 1 is soaked."
- Count line (mono 12px `--text-3`, right-aligned on the same row): "1 soaked · 2 stained · 1 spotted · 1 clean · 15 not rated yet".
- Strip: one slot per club (gap 4), each a 30px crest (opacity 0.55 when unrated) above a 22px bar (radius 4) in the level colour, dashed when unrated. Unknown clubs get a 26px dashed circle and a dashed bar. Worst first. Each slot links to the club, with the `title` "Club: Level".

### 3.3 Level groups
- Groups sit side by side (flex-wrap, gap 40 vertical and 36 horizontal, `align-items: stretch`) in the order Soaked → Stained → Spotted → Clean. Only non-empty groups show. Each group is as wide as its cards: n × 236 + (n − 1) × 20.
- **Group header, fixed height 118px so every card's top lines up**, with a 3px bottom border in the level border colour:
  - A row (34px tall): meter (bars 8px wide, 10/16/23/30px tall) and the level word (Display 42px, level text colour).
  - Count line (mono 12px/600 uppercase, level text colour): "4 OF 4 · 1 CLUB".
  - Description (13px/1.4 `--text-3`, fixed 36px tall, overflow hidden). Soaked: "A severe sponsor on the front, or two serious ones." · Stained: "A serious sponsor on the front, or a severe one elsewhere." · Spotted: "A lesser link, like a sponsor part-owned by a state." · Clean: "Every sponsor and its owner checked. Nothing found."
- **Club card** (236px wide, equal heights in a row, radius 14, border 2px in the level border colour, `--panel`):
  - Media: 232×190, white, with the crest 130×130 at (51, 30), `object-fit: contain`.
  - Band: 54px tall, padding 0 12, gap 10, background `band` and text `bandText` from the level. It holds a meter (bars 6px wide, 8/13/18/24px tall; filled in `bandText`, unfilled at `rgba(255,255,255,.28)` on dark bands or `rgba(0,0,0,.2)` on light ones), the level word (Display 30px) and, right-aligned, the rank (mono 11px/600, "4 OF 4").
  - Details: padding 14px 14px 16px, gap 5. Club name (18px bold), sponsor line (mono 12px, level text colour, e.g. "Visit Rwanda · front of shirt"), payer line (13px `--text-2`, e.g. "Paid for by the Government of Rwanda").
  - Links to the team page.
- Data today: Premier League is Soaked Aston Villa · Stained Arsenal and Man City · Spotted Newcastle · **Clean Brighton** (American Express: "A listed US company with no state owner."). La Liga is Soaked Atlético (sponsor line "Riyadh Air · front, Visit Rwanda · back") and Stained Real Madrid.

### 3.4 Not rated yet
- Header with a dashed meter, "NOT RATED YET" (Display 44px `--text-3`), the count ("15 clubs") and "We haven't checked who is behind these sponsors yet." Bottom border 3px dashed `#4a403b`.
- An 8-column grid (gap 22 vertical, 18 horizontal) of tiles: a white tile (116px tall, radius 10, opacity 0.92) with a 76px crest in the middle and the club name below (14px bold `--text-2`).
- For a league with unknown clubs, add a dashed tile spanning 2 columns: "+18" (Display 38px) and "more La Liga clubs, not rated yet".

### 3.5 They dropped it (bottom of the overview)
- The snapshot shows the older version: three cards with a white crest tile and a rotated "DROPPED 2026" stamp, plus a list of six precedents on the right. **Recommendation: reuse the landing page's positive `DroppedCard` here, filtered to the current sport or league when possible.** This matches the team's latest direction. If you do, record it as an intentional difference.

### 3.6 Leagues and sports without data
- A dashed panel (radius 14, padding 32, max-width 760) with a title (Display 34px, e.g. "BUNDESLIGA IS NEXT") and text built from `leagues.notes` (17px/1.5).
- Other sports: a title and rows (known deal, short description, status such as "Not rated yet" or "Dropped 2022"). Use the `notes` in `leagues.json` and `dropped.json` entries.

---

## 4. Team page `/clubs/[slug]`

Snapshots:
- `team-atletico.html` (current season only) and `team-atletico--card-open.html` (Visit Rwanda card open)
- `team-arsenal.html` (2026/27), `team-arsenal--2018-2026.html` and `team-arsenal--2006-2018.html`
- `team-villa.html` (2026/27) and `team-villa--2024-2026.html`

Main padding: 28px top, 56px sides. The page is 940px tall with no timeline and 1120px with one.

### 4.1 Title row
- A grid `auto | 1fr`, column-gap 30, aligned to the text baseline.
- Column 1 spans both rows and holds a box (radius 16) with the level tint background and a 2px border (Soaked `rgba(227,18,27,.16)` / `#e3121b` · Stained `rgba(176,64,47,.18)` / `#b0402f` · Spotted `rgba(217,163,153,.12)` / `#d9a399` · Clean transparent / `#e8e2da` · Not rated transparent / dashed `#6f665e`).
  - Row 1 (padding 18px 24px 0): a meter (bars 13px wide, 14/25/37/50px tall, filled in the level text colour, unfilled at `rgba(255,255,255,.18)`) and the **level word at 64px** (Display, level text colour).
  - Row 2 (padding 10px 24px 16px): "BLOOD LEVEL · 4 OF 4 · WORST" (mono 11.5px/600, letter-spacing 0.1em, level text colour). Other ranks: "3 of 4", "2 of 4", "1 of 4", "not checked yet".
- Column 2, row 1: **the club name at the same 64px on the same baseline** (H1, Display), with the club crest in a 72px white circle (crest 52px, shadow `0 2px 12px rgba(0,0,0,.35)`) placed to the left of the name (padding-left 94). The crest is a "test" feature, so keep it behind a config flag, on by default.
- Column 2, row 2 (padding-top 10, gap 8):
  - A row with the kit label (mono 13px `--text-2`, e.g. "Home shirt · 2026/27") and, when the kit has a `change`, a badge (26px tall, radius 13, border 1px and text in the colour, 13px bold, 12px arrow). Worse is `--level-soaked-text` with an up arrow, e.g. "Worse than last season: Visit Rwanda took the front". Better is `--good` with a down arrow, e.g. "Better than last season: Visit Rwanda is gone".
  - The kit summary sentence (17px/1.4 `--text`), e.g. "Saudi Arabia's state fund pays for the front of this shirt. Rwanda's government pays for the back."

### 4.2 Stage (1328×634, margin-top 24, position relative)
- A white panel at (300, 196), 728×438, radius 16.
- Front photo at (316, 212), 340×378. Back photo at (672, 212), 340×378. **Both are always visible, with no toggle, and nothing is drawn on the shirts.**
- Labels "FRONT" and "BACK" (mono 11px/600, letter-spacing 0.14em, `#5f584e`) centred under each photo at y 604.
- **Sponsor cards** (one per sponsor on the kit, placed by `cardSlot`):
  - `L`: left column at x 0, width 280. `R`: right column at x 1048, width 280. Each side stacks in order of anchor y: top = max(anchorY − 52, 196, previous bottom + 14), capped at 634 − 158.
  - `T`: centred above the photos at y 16, width 260, gap 16 between them.
  - If the back of the shirt has no sponsor, show a small note card at (1048, 330), 280 wide: "BACK OF SHIRT" / "No sponsor on the back."
- **Anchor point on the logo:** hotspot centre `(x, y)` as fractions of the photo. For `L` use the logo's left edge (x − w/2, never below 0.04), for `R` its right edge (x + w/2, never above 0.96), for `T` its top edge (y − h/2). Convert with photo left (316 front or 672 back) + x × 340 and 212 + y × 378.
- **Lines** (an SVG overlay the size of the stage, with no pointer events except the hit stroke):
  - From the card attach point to the anchor. L cards attach at (280, top + 52), R cards at (1048, top + 52), T cards at the bottom centre.
  - A dark halo line (opacity 0.45, width 4.5, or 6 when active), then the tier-coloured line (1.8, or 3 when active; dashed `5 4` for unrated sponsors).
  - At the anchor, a ring of radius 7 (white stroke 3.5 under a tier-colour stroke 2). At the card end, a 3px dot.
  - An invisible 18px-wide stroke along the line is a hover target.
  - When a card is open, other lines and cards drop to opacity 0.3.
- **Logo hotspot buttons:** invisible buttons centred on the logo, width max(34, w × 340 + 10) and height max(34, h × 378 + 10), with no outline (the team asked for none). Hover or focus opens the card and click toggles it. `aria-label` "{Sponsor}: show who pays".
- **Sponsor card:**
  - Background `#26201d`, radius 14, border 1px (open: tier colour; rated: `#6a3a31`; unrated: `#463c37`).
  - Shadow when open: `0 18px 40px rgba(0,0,0,.6)`. Open cards sit on a higher z-index.
  - Header button (padding 14px 16px 10px): the `LogoMark` (46px, splat scaled by tier: Severe 1.35, Serious 0.95, Concern 0.55, none/unrated 0 with a dashed outline). Next to it: the tier label (mono 11px/600 uppercase, tier colour), the sponsor name (Display 28px) and the sub line (13px `#e8e2da`). The sub is "{placement} · paid for by the {owner}" when rated, or "{placement} · not investigated yet".
  - Body, collapsed: max-height 48px with a 40px fade to `#26201d` at the bottom. This preview makes it obvious the card can open.
  - Body, expanded: top border `--line-3`, gap 12. It holds the verdict (14.5px/1.45), a "HOW MUCH" row with the value (Display 22px; "[DEAL VALUE]" in the prototype, "value not disclosed" in production when unknown), and each claim (13.5px) with its source (mono 10.5px `--text-3`).
  - Buttons: rated sponsors get "Tell the club" (primary, `#c8191f`) and "Share" (outline). Unrated sponsors get "Help rate this sponsor" (outline).
  - The card header is a real `<button aria-expanded>`.

### 4.3 Timeline "Over the years" (only when the club has more than one kit period)
- Margin-top 28. Label "OVER THE YEARS" (mono 12px/600 `--text`) and the hint "Hover a period or a sponsor to put that shirt on the page." (13px `--text-4`).
- Track 1328px wide. One block per period, 54px tall, gap 8. Width = 250 + (spare width × the period's share of seasons).
- Block: no background colour (the team asked for none). The selected block gets a 2px `--text` border and `rgba(243,237,230,.06)` fill. Others get a 1px `--line-3` border, or dashed for not rated. Contents: the period label (mono 11px), a mini meter (bars 4px, 5/8/11/14px) and the level word (Display 19px). When the period has a change, a note badge sits on the right: an 18px round icon in red (up arrow) or teal (down arrow) with the text "+ Visit Rwanda" or "Rwanda gone" (12.5px bold).
- **Sponsor lanes** below the blocks, starting 64px from the top, one row of 24px per sponsor. Each is a pill 18px tall, radius 9, spanning the periods the sponsor was on the shirt, filled with the tier fill (or transparent with a dashed border when unrated), with the text "{Sponsor} · {tier}" (12px bold, tier foreground). Invisible per-period hit areas sit on each lane.
- Interactions are in `docs/06-interactions.md` §4.
- Data today: Arsenal has 2006/07–2017/18 Stained (Emirates) · 2018/19–2025/26 Soaked (+ Visit Rwanda) · 2026/27 Stained ("Rwanda gone"; Deel on the sleeve, unrated). Villa has 2024/25–2025/26 Not rated (Betano, Trade Nation) · 2026/27 Soaked (+ Visit Rwanda; Betano on the sleeves).

### 4.4 Mobile
- Title: the level box goes above the club name (both 44–48px). Keep the meter and word together.
- Stage: a front/back photo carousel with numbered circular markers on the logo hotspots, and below it the sponsor cards in a list numbered to match. Tapping a marker scrolls to and opens its card.
- Timeline: blocks scroll horizontally; lanes are hidden behind a "Show sponsors by year" toggle.
