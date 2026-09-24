# 04. Design system

A dark, warm and serious look. Heavy condensed display type for verdicts, a quiet grotesk for reading, and mono for evidence and metadata. Red means blood, and teal means good news.

## 1. Tokens (CSS custom properties)

```css
:root {
  /* surfaces */
  --bg: #0f0d0c;          /* page */
  --panel: #1a1614;       /* cards, panels */
  --panel-2: #141110;     /* chart panels */
  --card-dark: #26201d;   /* sponsor cards on team page */
  --line: #2e2825;        /* hairlines, header border */
  --line-2: #3a3330;      /* chips */
  --line-3: #3d332f;      /* card borders */
  --line-4: #4a403b;      /* inputs, pills */

  /* text */
  --text: #f3ede6;
  --text-2: #d6cec5;
  --text-3: #b3aaa0;
  --text-4: #a39a91;
  --text-5: #8a8078;

  /* accents */
  --accent: #ff3b30;          /* rotating headline word, active tab underline */
  --accent-soft: #ff6b5e;     /* kickers, "add it" links */
  --good: #4fc3b0;            /* got better, they dropped it, say thanks */
  --cta-red: #c8191f;         /* "Tell the club" button */
  --chest: #8a2a22;           /* "Your chest. Their ad." footer line */

  /* blood levels: text / fill / band / band text / border */
  --soaked-text: #ff4a3d;  --soaked-fill: #e3121b;  --soaked-band: #c8121b;  --soaked-band-text: #ffffff;  --soaked-border: #e3121b;  --soaked-tint: rgba(227,18,27,.16);
  --stained-text: #e0705f; --stained-fill: #b0402f; --stained-band: #6e2820; --stained-band-text: #ffe3de; --stained-border: #b0402f; --stained-tint: rgba(176,64,47,.18);
  --spotted-text: #e6b3a8; --spotted-fill: #d9a399; --spotted-band: #d9a399; --spotted-band-text: #2a1512; --spotted-border: #d9a399; --spotted-tint: rgba(217,163,153,.12);
  --clean-text: #f3ede6;   --clean-fill: #e8e2da;   --clean-band: #e8e2da;   --clean-band-text: #0f0d0c;   --clean-border: #e8e2da;   --clean-tint: transparent;
  --unrated-text: #a39a91; --unrated-dash: #5a504a; --unrated-border: #6f665e;
  --meter-off: #3a3330;     /* unfilled meter bar on dark */

  /* sponsor tiers: label colour / fill */
  --tier-severe: #ff4a3d;  --tier-severe-fill: #e3121b;
  --tier-serious: #e0705f; --tier-serious-fill: #8a2a22;
  --tier-concern: #e6b3a8; --tier-concern-fill: #d9a399;
  --tier-none: #f3ede6;
  --tier-unrated: #b3aaa0;

  /* type */
  --font-display: 'Big Shoulders Display', Impact, sans-serif;  /* weight 900, uppercase */
  --font-body: 'Schibsted Grotesk', 'Helvetica Neue', sans-serif;
  --font-mono: 'IBM Plex Mono', monospace;

  /* layout */
  --page-w: 1440px; --gutter: 56px; --content-w: 1328px;
  --r-sm: 6px; --r-md: 10px; --r-card: 14px; --r-lg: 16px; --r-xl: 24px; --r-pill: 999px;
}
```

## 2. Type scale (as used)

| Role | Font | Size / line-height | Notes |
|---|---|---|---|
| Hero headline | Display | 104 / 0.88 | 2 lines, uppercase |
| Team level word and club name | Display | 64 / 0.9 | same size on the same baseline |
| Section H2 | Display | 56 / 0.9 | "HOW WE RATE" panel H2 is 60 |
| Overview H1 | Display | 72 / 0.9 | |
| Group level word | Display | 42 / 0.8 | overview groups |
| Band level word | Display | 30 / 0.8 | overview cards |
| Big numbers | Display | 34–40 | league "4 of 20", years |
| Card title | Body bold | 17–19 / 1.2–1.3 | |
| Body | Body | 14.5–17 / 1.45–1.5 | |
| Hero sub | Body | 20 / 1.45 | |
| Kicker / labels | Mono 600 | 11–12, letter-spacing .08–.14em, uppercase | |
| Sources, dates | Mono | 10.5–11.5 | `--text-5` or `--text-3` |

## 3. Core components

### LevelMeter
Four bars of increasing height, 2–5px apart and aligned to the bottom, like Wi-Fi bars. Bars up to the level are filled, the rest are off. **It always sits next to the level word.**

| Size | Bar width | Heights | Used in |
|---|---|---|---|
| XS | 4 | 5 / 8 / 11 / 14 | change chips, timeline blocks |
| S | 4 | 6 / 9 / 12 / 15–16 | search results, hero key |
| M | 6 | 8 / 13 / 18 / 24 | overview card band |
| L | 8 | 10 / 16 / 23 / 30 | overview group header |
| XL | 13 | 14 / 25 / 37 / 50 | team page title |

Level fills: Clean 1 bar, Spotted 2, Stained 3, Soaked 4. Not rated has 4 dashed outline bars.

### LevelChip
Height 28, radius 6, padding 0 10, background = level band, text = band text (not rated: transparent with a dashed border). It holds an XS meter and the level word (Display 17px).

### LevelBand
The overview card band: height 54, padding 0 12, gap 10, with an M meter, the word (Display 30) and the rank on the right ("4 OF 4", mono 11/600).

### CrestBadge
The crest on a white circle. Crest size is about 72% of the circle. Sizes 26, 28, 30, 38, 40, 48, 56 and 72. When there's no crest, show 2–3 letter initials (mono 600) on white or on `--line`.

### LogoMark (brand and sponsor cards)
A jersey outline with a red splat on the chest. In the viewBox `0 0 24 24`:
- Jersey outline: `M8.5 3 Q12 5.6 15.5 3 L19.6 4.3 L23 8.6 L20.3 11.4 L18.2 9.9 L18.2 21.4 Q12 22.3 5.8 21.4 L5.8 9.9 L3.7 11.4 L1 8.6 L4.4 4.3 Z`, no fill, stroke `--text`, width 1.1–1.3.
- Splat and drip: copy the two paths and the two small circles exactly from the header logo in `design/source/Landing.dc.html` (fill `#d61f26`).
- On sponsor cards the splat is scaled around (12, 13.2) by tier: Severe 1.35 (colour `#e3121b`), Serious 0.95, Concern 0.55, and hidden for unrated (the outline becomes dashed `1.6 1.4` in `--text-5`).
- Don't go back to a blood-drop icon. The team rejected it because it looked like a blood-donation logo.

### Change kind icons (12×12 viewBox)
- Worse (up arrow): `M6 1 L11 8 L7.5 8 L7.5 11 L4.5 11 L4.5 8 L1 8 Z`
- Better (down arrow): `M6 11 L11 4 L7.5 4 L7.5 1 L4.5 1 L4.5 4 L1 4 Z`
- Renewed (right arrow): `M1 4.5 L8 4.5 L8 1.5 L11 6 L8 10.5 L8 7.5 L1 7.5 Z`
- Being rated (dash): `M2 5 L10 5 L10 7 L2 7 Z`

### Buttons and pills
- Pill link or button: 34–36px tall, radius 17–18, border 1px `--line-4`, 14px bold. Hover brightens the border (`#8a8078`) and the text.
- Primary large: 50–52px tall, radius 25–26, background `--text`, text `--bg`, 16px bold.
- Positive: border and text `--good`.
- Touch targets are at least 44px on mobile.

## 4. Motion
- Rotating headline word: each new word fades and slides in, `opacity 0 → 1` and `translateY(0.18em) → 0`, over 0.35s ease-out, every 1.3s. It stops on "loyalty".
- Sponsor cards: fine to add a short height and opacity transition (≤ 200ms) when opening.
- Respect `prefers-reduced-motion` everywhere.
- The team wants to discuss more animations later, so don't add any others yet.

## 5. Don'ts
- No blood splatter on the shirts or photos.
- No gradients or glows behind content. The only gradient is the fade at the bottom of a collapsed sponsor card.
- No emoji.
- No Inter, Roboto or Arial.
- Don't tell levels apart by hue alone. The meter bar count carries the meaning too.
