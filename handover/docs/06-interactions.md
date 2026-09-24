# 06. Interactions

The prototype's logic is in the `<script type="text/x-dc">` block of each `design/source/*.dc.html` file. This document describes the behaviour, and the source shows exactly how the prototype did it.

---

## 1. Search (landing hero, optional compact header search)

### Index
Build it at build time from the data. Each entry has:

| Field | Club | League | Sport | Sponsor |
|---|---|---|---|---|
| label | club name | league name | sport label | sponsor name |
| description | league name plus the current kit's sponsors, e.g. "Premier League · Visit Rwanda on the front" (clubs without a kit use their deals, e.g. "Ligue 1 · Visit Rwanda until 2028") | "Soccer · 20 clubs · 5 rated" | e.g. "NBA, Basketball Africa League" | "Government of Rwanda · Aston Villa, Atlético, PSG, LA Clippers" (owner plus clubs) |
| aliases | `clubs.aliases` | `leagues.aliases` | `sports.aliases` | `sponsors.aliases` |
| right side | level word and meter (not rated: "Not rated yet") | status ("4 of 20 bad", "Not mapped yet") | status | tier ("Severe", "Serious", "Concern", "Nothing found", "Being rated") |
| icon | crest on white | initials (PL, LL, BL, L1, SA, MLS) on `--line` | initials | initials (VR, EK, EY, RX…) |
| link | team page if designed, else the league overview | `/soccer/[league]` | `/[sport]` | the overview for now, later `/sponsors/[slug]` |

### Matching (same as the prototype)
Normalise the query and the fields: NFD, strip accents, lowercase, trim. Then score each entry:

0. the label starts with the query
1. a word in the label or any alias starts with the query
2. the label contains the query
3. the query is 4 or more characters and the description contains it (this is how "rwanda" finds every club Visit Rwanda sponsors)

Drop non-matches, sort by score (stable, keeping index order: clubs, then leagues, sports, sponsors), and take 6.

With an **empty query and focus**, show "POPULAR RIGHT NOW": Arsenal, Premier League, Visit Rwanda, Atlético de Madrid, Motorsport.

**Expected results with the seed data** (descriptions built as in the table above; use these as unit tests):

| Query | Expected |
|---|---|
| `man` | Manchester City, Manchester United |
| `rwanda` | Visit Rwanda first, then the clubs it sponsors: Aston Villa, Atlético de Madrid, Paris Saint-Germain, LA Clippers, Los Angeles Rams |
| `emir` | Emirates, Arsenal, Real Madrid |
| `nba` | NBA (league), LA Clippers, Basketball |
| `f1` | Formula 1 (league), Motorsport |
| `spurs` | Tottenham Hotspur |
| `atletico` and `atlético` | Atlético de Madrid first, then its sponsors (Visit Rwanda, Riyadh Air, Kraken) |
| `villa` | Aston Villa first |
| `xyz` | no results → "Nothing on file" state |

### Dropdown UI
- It opens under the input (8px gap). Hero width is the input width (760). The compact header search uses a wider 620–660px dropdown. Panel: padding 8, radius 16, background `#1f1a18`, border `--line-4`, shadow `0 18px 48px rgba(0,0,0,.6)`.
- Header label: mono 11px uppercase `--text-5`. It reads "POPULAR RIGHT NOW" when the query is empty, and "CLUBS, LEAGUES, SPORTS AND SPONSORS" otherwise.
- Result row (link, padding 10px 12px, radius 10, hover and active background `#2c2522`):
  - a 38px round icon
  - the label (16px bold) with the description under it (13px `--text-3`, one line, ellipsis)
  - the type in a 64px column (mono 10.5px `--text-5`: CLUB, LEAGUE, SPORT or SPONSOR)
  - the rating on the right in a 138px column (meter plus Display 18px word in the level or tier colour)
- No results: "Nothing on file for "{query}" yet." with the link "Add it yourself: every club and sponsor lives on GitHub →" (`--accent-soft`) to `#contribute`.
- Keyboard: ↓/↑ move the active row (`aria-activedescendant`), Enter opens it, Esc closes. Use the ARIA combobox pattern (`role="combobox"` on the input, `role="listbox"` and `role="option"` for the rows).
- Close on blur with a short delay (about 180ms) so clicks on results still register. Clicking a "Try" chip fills the query and keeps the input focused.

---

## 2. Rotating headline (landing)

- Words in order: `shirt`, `shoes`, `stadium`, `game`, `league`, `club`, `loyalty`. **Don't use "race"**: the team rejected it because the word has strong other meanings.
- It starts on "shirt" on load and advances every **1.3s**. It stops on **"loyalty"** and stays there.
- Each word change animates in: opacity 0→1 and translateY 0.18em→0 over 0.35s ease-out. The prototype re-mounted the element to restart the CSS animation. Using a `key` does the same in React.
- Clicking the red word replays the sequence (make it a `<button>` styled as text, `aria-label="Play again"`).
- `prefers-reduced-motion`: show "loyalty" straight away and never rotate.
- Accessibility: the `<h1>` has `aria-label="Who's buying your loyalty?"` and the rotating span is `aria-hidden`, so screen readers don't get a stream of changes.
- Line 2 width changes as the word changes. Keep the headline centred and avoid layout shift below it by giving the line a fixed height.

---

## 3. Team page: opening sponsor cards

Each sponsor on the shirt has four hover targets that all open the same card:
1. the invisible **hotspot button** over the logo on the photo,
2. the **ring** at the end of the line,
3. the **line** itself (an invisible 18px-wide stroke),
4. the **card**.

Rules:
- Hover or focus opens the card. Only one card is open at a time.
- Click or tap toggles the card (the touch path).
- Leaving all targets closes the card, **unless the pointer is heading toward the open card** (hover intent, §5).
- When a card is open, the other cards and lines fade to 30% opacity, the active line thickens (1.8 → 3) and its halo grows (4.5 → 6).
- Esc closes the open card.
- Collapsed cards show a preview that fades out at the bottom, so it's obvious they open. The team doesn't want a "hover for evidence" label.

---

## 4. Team page: timeline

- Hovering (or focusing, or clicking) a **period block** sets the selected period. The title level, meter, change badge, summary, photos, cards and lines all switch to that kit. There is no pop-up.
- Hovering a **sponsor lane segment** (the part of a lane over one period) selects that period **and** opens that sponsor's card on the stage. Leaving the lane clears the lane highlight.
- The selected block gets the bright border. The lane that opened a card gets a white ring (`0 0 0 2px var(--bg), 0 0 0 3px var(--text)`).
- Timeline hovers go through the same hover-intent gate, so moving the pointer from a lane up to its card doesn't switch periods on the way.
- Default period: the current season (the latest kit). Deep link: `?season=YYYY-YY` selects the period containing that season.

---

## 5. Hover intent ("menu-aim" or safe triangle)

The team asked that "the box stays open while I move my mouse toward it". The prototype's algorithm:

1. When the pointer **leaves** a target (hotspot, line or lane) whose card is open, record the leave point `(x, y)` and the card's bounding rectangle. Call this the "aim". Start a 900ms timer.
2. On every **mouse move** while aiming:
   - If the pointer is inside the card, the aim succeeded. Clear it and keep the card open.
   - Else, if the pointer is inside the card rectangle grown by 16px, or inside any of the four triangles formed by the leave point and two adjacent corners of that grown rectangle, it is still heading there. Re-arm the timer to 500ms.
   - Otherwise it turned away. The aim fails.
3. While aiming, **other hovers are held back** (queued as "pending") instead of switching immediately. A hover on the same card is ignored.
4. When the aim **fails** (timer ran out or turned away), run the pending hover if there is one, or else close the card.

The reference implementation from `design/source/TeamDetail.dc.html`:

```js
startAim(id, e) {                       // call from onMouseLeave of hotspot / line / lane
  if (this.state.hover !== id || !e) return;
  const el = document.querySelector('[data-card="' + id + '"]');
  if (!el) { this.setState({ hover: null }); return; }
  const r = el.getBoundingClientRect();
  this.aim = { id, x: e.clientX, y: e.clientY, l: r.left, t: r.top, r: r.right, b: r.bottom };
  this.pending = null;
  this.armAim(900);
}
armAim(ms) { clearTimeout(this.aimTimer); this.aimTimer = setTimeout(() => this.failAim(), ms); }
clearAim() { clearTimeout(this.aimTimer); this.aim = null; this.pending = null; }
failAim() { const next = this.pending; this.clearAim(); if (next) next(); else this.setState({ hover: null, lane: null }); }
heading(a, x, y) {
  const pad = 16;
  const c = [[a.l - pad, a.t - pad], [a.r + pad, a.t - pad], [a.r + pad, a.b + pad], [a.l - pad, a.b + pad]];
  if (x >= c[0][0] && x <= c[1][0] && y >= c[0][1] && y <= c[2][1]) return true;
  const side = (p, q, r) => (q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0]);
  const inTri = (p, a1, b1, c1) => { const d1 = side(p, a1, b1), d2 = side(p, b1, c1), d3 = side(p, c1, a1);
    return !((d1 < 0 || d2 < 0 || d3 < 0) && (d1 > 0 || d2 > 0 || d3 > 0)); };
  const o = [a.x, a.y], p = [x, y];
  for (let i = 0; i < 4; i++) if (inTri(p, o, c[i], c[(i + 1) % 4])) return true;
  return false;
}
moved(e) {                              // onMouseMove on the page root
  const a = this.aim; if (!a) return;
  const x = e.clientX, y = e.clientY;
  if (x >= a.l && x <= a.r && y >= a.t && y <= a.b) { this.clearAim(); return; }
  if (this.heading(a, x, y)) { this.armAim(500); return; }
  this.failAim();
}
gated(targetId, fn) {                   // wrap every other hover handler
  return () => { if (this.aim) { if (targetId && targetId === this.aim.id) return; this.pending = fn; return; } fn(); };
}
```

In React, keep `aim`, `pending` and the timer in refs, put it in a `useHoverIntent()` hook, and clear the timer on unmount. Touch devices skip all of this (tap toggles).

---

## 6. Other small behaviours

- Overview strip slots and cards link to the club. The `title` attribute or a tooltip shows "Club: Level".
- League chips and sport tabs are links (URL-driven state), not local-only state.
- "Say thanks" (They dropped it) and "Tell the club" (sponsor card) have no destination yet. Wire them to a share or compose dialog later and keep them as visible buttons for now.
