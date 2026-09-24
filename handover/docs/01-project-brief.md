# Behind the Jersey: project brief and design record

Last updated: 24 September 2026

This document covers everything the team has decided so far about **Behind the Jersey**. It is for people and AI agents who have not seen the conversations or the design prototype. It covers what we are building, why, the background research, the concepts behind the ratings, and a detailed, page-by-page description of what the website looks like and how it behaves.

The prototype lives in a private design canvas that other agents cannot open. Section 7 therefore describes every page in enough detail to rebuild it without seeing it.

---

## 1. Summary

- **What:** a fan-facing website that shows who really pays for the sponsors on sports jerseys, stadiums, races and events. It rates each club by how much human-rights abuse sits behind its sponsors. The scale is **Clean, Spotted, Stained, Soaked**.
- **Who it is for:** sports fans. They should understand in seconds what they are wearing and promoting, without reading a report.
- **Why:** states with poor human-rights records use sport sponsorship to polish their image ("sportswashing"). Fans become their free billboards. Deals *do* end when enough fans object, and we want to make that pressure easy.
- **Central case:** **Visit Rwanda**, the tourism brand of the Government of Rwanda. UN experts say Rwanda has 3,000–4,000 troops fighting alongside the M23 rebels in eastern Congo. The M23 profits from coltan mining, and coltan ends up in phones and laptops. Visit Rwanda is on the front of Aston Villa's shirt from 2026/27, on the back of Atlético de Madrid's, and sponsors PSG, the LA Clippers, the LA Rams and the Basketball Africa League.
- **Origin:** a hackathon project, started from interviews with a Rwandan activist.
- **Open by design:** all data, the pipelines that collect it and the AI agents that trace sponsors to their owners will be public on GitHub. People can contribute with our agents, with their own agents, or by hand. A person reviews every claim before it goes live.
- **Current headline:** "Who's buying your ___?" The last word rotates through *shirt, shoes, stadium, game, league, club* and lands on **loyalty**. A quieter secondary line, **"Your chest. Their ad."**, sits in the footer.

---

## 2. What we are building

A website with these parts. The core is designed and the rest is parked for later.

1. **Landing page.** Headline and a universal search: type a club, league, sport or sponsor. Below it: the latest sponsor changes, positive examples of clubs that dropped bad sponsors, every league shown as a strip of clubs, how a rating is made, and how to help. "Your chest. Their ad." sits quietly in the footer.
2. **Overview page per sport and league.** Soccer is the first sport. Every club in a league appears, grouped by blood level and shown by its club crest.
3. **Team page.** One page per club. The current home shirt is shown front and back as real photos. Every sponsor on it gets a card placed around the shirt and linked to the logo, and the card expands on hover with the evidence. Clubs with history get a compact timeline of seasons, so you can see a shirt getting better or worse.
4. **How we rate / method.** The five-step pipeline and the level definitions (on the landing page for now, later its own page).
5. **Open data and contributions.** A GitHub repository with data, evidence files, pipelines and agents, plus a contributor guide and a simple evidence format.

Later, beyond soccer: basketball (NBA, Basketball Africa League), American football (NFL), motorsport (Formula 1), cycling (for example the World Championships), and tournaments and governing bodies (UEFA, FIFA). Events have sponsors too, and the team wants to be able to ask "who is sponsoring the Cycling World Championships?" The design keeps the jersey as the visual anchor but widens the wording so events fit in later (see section 6).

Parked ideas that are designed but not on the current site are listed in section 9.

---

## 3. Why we are building it

### 3.1 Sportswashing, and the fan as billboard

Governments with serious human-rights problems buy visibility in sport. A shirt deal buys much more than a patch of fabric. It buys the love and attention of millions of fans who wear the name to every match and put it in every photo and every post. The logo is only the receipt. What the sponsor really buys is the fan's loyalty.

Example: Visit Rwanda is reported to pay Aston Villa **up to £20m (about $27m) a year**, including bonuses, for the front of the shirt from 2026/27 (The Athletic via SportsPro, July 2026). The shirt becomes the face of the country while the abuses stay out of frame.

### 3.2 Fans have real power

Deals end when enough people object. The team gave these precedents, and they are central to the site's hopeful tone:

| Year | Deal | What happened |
|---|---|---|
| 2026 | Arsenal × Visit Rwanda (sleeve, 2018–2026) | Ended in June 2026 after eight seasons and years of fan protest. Emirates stays on the front. |
| 2026 | Newcastle United × Sela (front) | Sela, owned by Saudi Arabia's Public Investment Fund, replaced on the front by KNOX Hydration for 2026/27 (The Mag, June 2026). |
| 2025 | Bayern Munich × Visit Rwanda | Moved away from the Visit Rwanda branding after criticism. |
| 2023 | Bayern Munich × Qatar Airways (sleeve) | Fans protested for years with banners, motions at the AGM and pressure on the board. Not renewed. |
| 2023 | Women's World Cup × Visit Saudi | Talks abandoned after players and the host federations objected. |
| 2022 | Schalke 04 × Gazprom (front, 2007–2022) | Logo removed, then the deal cancelled early after Russia invaded Ukraine. |
| 2022 | Manchester United × Aeroflot | Terminated early, citing Ukraine and fans' concerns. |
| 2022 | UEFA × Gazprom | Ended across the Champions League, national-team competitions and Euro 2024. |
| 2022 | Haas F1 × Uralkali | Title sponsorship with the Russian fertiliser company ended right after the invasion. |
| 2022 | Formula 1 × Russian Grand Prix | Race cancelled, promoter contract terminated. |

### 3.3 Tone we want

- **Shock with facts, not insults.** Every claim is sourced and dated.
- **Don't shame clubs or fans.** The team said: "We want to encourage this change. We don't want to just shit on the clubs." Positive changes are celebrated, for example with "Say thanks" buttons.
- **Make the fan feel valuable, not stupid.** The message is "you are what they are buying", not "you've been fooled". Fans who feel accused get defensive, and fans who feel powerful act.
- **Fast.** A fan should understand a club's situation in a few seconds without clicking.

---

## 4. Background research

### 4.1 Origin

The idea came out of interviews with a Rwandan activist. The story that landed hardest with listeners was the **conflict-minerals chain**: coltan mined in eastern Congo, taxed by the M23 rebels, smuggled into Rwanda, and ending up in electronics, while the Rwandan government's tourism brand sits on football shirts. Visit Rwanda became the central case study. The site is built so it generalises to any sponsor and any state.

Reference sites the team likes for tone and structure:
- **pushtoleave.org**
- **surveillancewatch.io** (for example the entity pages)

### 4.2 The Visit Rwanda chain: "from a mine in Congo to the front of your shirt"

Each link is on the record:

1. **The mine.** Rubaya, eastern DR Congo, produces about **15% of the world's tantalum**, a metal used in phones and laptops (Global Witness, June 2026).
2. **The rebels.** The **M23** took control of the mines in 2024 and take about **$800,000 a month** in levies on coltan mining (UN Group of Experts, 2024).
3. **The state.** More than **120 tonnes of coltan a month** have been smuggled from Rubaya into Rwanda since April 2024 (Global Witness, June 2026). UN experts say **3,000–4,000 Rwandan troops** are fighting alongside M23 in eastern Congo (UN Group of Experts, 2024).
4. **The brand.** Visit Rwanda is run by the Rwanda Development Board, a government body.
5. **The club.** Aston Villa signed Visit Rwanda for the front of its men's, women's and academy shirts from 2026/27, up to £20m a year (SportsPro, July 2026).
6. **You.** Every time a fan wears it.

The same coltan ships from Rwanda to smelters in China, Kazakhstan and Thailand. Global Witness found this conflict coltan may have unwittingly reached global electronics brands, "and possibly the phone in your pocket."

Common pushback: "But it brings in tourists. Isn't that good for Rwanda?" Our answer: nobody is against progress in Rwanda. The problem is what the shirt hides. It becomes the face of the country while the abuses stay out of frame.

Where else Visit Rwanda appears: Aston Villa (front, from 2026/27), Atlético de Madrid (back of shirt), Paris Saint-Germain (renewed until 2028), LA Clippers (since 2025), LA Rams (since 2025, at the stadium rather than on the shirt), and the Basketball Africa League (league partner, reportedly $6–7m a year). Arsenal (sleeve, 2018–2026, about £10m a year) ended in June 2026, and Bayern Munich moved away in 2025.

### 4.3 Other sponsors in the prototype

| Sponsor | Who owns it | Where | Facts used (source) | Tier |
|---|---|---|---|---|
| Visit Rwanda | Government of Rwanda, via the Rwanda Development Board | Villa front, Atlético back, PSG, Clippers, Rams, BAL | See 4.2 | Severe |
| Emirates | Government of Dubai, via the Investment Corporation of Dubai | Arsenal front, Real Madrid front | 43 activists and dissidents given life sentences in a 2024 mass trial that rights groups called grossly unfair (Human Rights Watch, July 2024) | Serious |
| Etihad Airways | Government of Abu Dhabi | Manchester City front | (state-owned airline) | Serious |
| Riyadh Air | Saudi Arabia's Public Investment Fund, chaired by Crown Prince Mohammed bin Salman | Atlético front | Record 345 executions in 2024 (Amnesty International, 2025). US intelligence assessed the crown prince approved the 2018 operation that killed Jamal Khashoggi (US Office of the DNI, Feb 2021) | Serious |
| noon | Part-owned by Saudi Arabia's Public Investment Fund | Newcastle sleeve | | Concern |
| Sela | Saudi Arabia's Public Investment Fund | Newcastle front until 2025/26 (now gone) | | |
| Turkish Airlines | Part-owned by Türkiye's wealth fund | Liverpool front from 2027/28 (replacing Standard Chartered) | | Being rated |
| American Express | Listed US company, no state owner | Brighton front | | Nothing found (the Clean example) |
| Kraken, Deel, Betano, Trade Nation | not investigated yet | Atlético sleeve, Arsenal sleeve, Villa sleeves, Villa sleeve (2025/26) | | Not rated yet |

### 4.4 Money figures (reported estimates, per year, 2026/27)

These were researched on 24 September 2026. They are estimates from press reports, not club accounts. Conversion used: $1 = £0.75 = €0.87.

| Deal | Reported value | Source |
|---|---|---|
| Premier League front-of-shirt total | £444m (about $593m), up from £410m | Ampere, via Inside World Football, 22 Sep 2026 |
| Arsenal × Emirates (renewed to 2033, announced 6 Aug 2026) | up to £70m (about $93m) a season | SportsPro estimate |
| Manchester City × Etihad | £67.5m (about $90m) a year | older reports (All Football), check again |
| Aston Villa × Visit Rwanda | up to £20m (about $27m) a year, with bonuses | The Athletic via SportsPro, Jul 2026 |
| Real Madrid × Emirates (renewed to 2031, 10 Jun 2026) | €100m (about $115m) a year, a European record | SportsPro |
| Atlético × Riyadh Air (to 2035) | €40m (about $46m) a season | SportsPro |
| Arsenal × Visit Rwanda (sleeve, ended 2026) | about £10m (about $13m) a year | SportsPro |
| Newcastle × KNOX Hydration (replaced Sela) | about £60m over three years | The Mag, Jun 2026 |

Totals used in earlier designs: **$371m a year** flows onto the shirts we have rated from governments we rate Stained or Soaked (Emirates $208m, Etihad $90m, Riyadh Air $46m, Visit Rwanda $27m+). In the Premier League that is **$210m of $593m (about 35%)** of front-of-shirt money.

**Decision:** the team does **not** want to add up money per league on the landing page ("we don't like to collect all the money into a league"). Money stays at the level of individual deals and in the parked money-flow section.

---

## 5. Core concepts

### 5.1 Blood level (per club, per shirt)

Every club's current shirt gets one level, shown as a word plus a four-bar meter, like Wi‑Fi bars. The meter always sits next to the word.

| Level | Meter | Meaning | Colours |
|---|---|---|---|
| **Clean** | 1 of 4 | Every sponsor and its owner checked. Nothing found. | light bone `#e8e2da` |
| **Spotted** | 2 of 4 | A lesser link, like a sponsor part-owned by a state. | pale rose `#d9a399` / text `#e6b3a8` |
| **Stained** | 3 of 4 | A serious sponsor on the front, or a severe one elsewhere. | brick red `#b0402f` / text `#e0705f` |
| **Soaked** | 4 of 4 | A severe sponsor on the front, or two serious ones. | blood red `#e3121b` / text `#ff4a3d` |
| **Not rated yet** | dashed outline | Nobody has checked this club yet. | grey, dashed borders |

The team likes these four words and wants to keep them.

### 5.2 Sponsor tiers (per sponsor)

Each sponsor gets a tier: **Severe** (e.g. Visit Rwanda), **Serious** (e.g. Emirates, Etihad, Riyadh Air), **Concern** (e.g. noon), **Nothing found** (e.g. American Express), or **Not rated yet / Being rated**. A club's blood level comes from the tiers of its sponsors and where they sit on the shirt (front counts most).

### 5.3 Rating rules

- A rating only goes up once every claim behind it is sourced.
- A person reviews every claim before it goes live.
- Every change is logged publicly with a date.
- **All ratings in the prototype are illustrative.** The formal method is not agreed yet.

### 5.4 How a rating is made: five steps

This appears on the landing page as proof that the ratings come from a method, not a hunch.

1. **Collect** (agent): who is on every shirt this season, front, back and sleeve.
2. **Trace** (agent): who owns each sponsor, all the way up to a state or a fund (company registries, reports).
3. **Find evidence** (agent plus people): human-rights reports tied to that owner, from the UN, NGOs, courts and the press. Every claim gets a source.
4. **Review** (person): someone checks each claim and source before anything counts.
5. **Publish** (automatic): the rating goes live and the change is logged for everyone to see.

### 5.5 Open data and contributions

Everything goes on GitHub: the data (clubs, shirts, sponsors, owners), one evidence file per claim with its sources, the collection pipelines, and the agents that trace owners and find reports. Three ways to help:

1. **Run our agents:** point the pipeline at a club nobody has checked and open a pull request with what it finds.
2. **Bring your own agent:** any agent can help if it writes our evidence format: one claim, one source, one file.
3. **Check a club by hand:** no code needed. Pick a club, note who sponsors it and who owns them, and link your sources.

Draft evidence format, one file per claim:

```json
{
  "club": "aston-villa",
  "season": "2026/27",
  "sponsor": "Visit Rwanda",
  "placement": "front",
  "owner": "Government of Rwanda",
  "value": "up to £20m a year",
  "sources": ["sportspro.com/…"]
}
```

The GitHub organisation name is not decided yet and appears as `[org]` in designs. A command-line tool called `btj` appeared in one early mock-up. It is only a concept and does not exist.

---

## 6. Brand, voice and visual language

### 6.1 Name and logo

- Name: **Behind the Jersey**, set in heavy condensed capitals as "BEHIND THE JERSEY".
- Logo mark: a simple **jersey outline** (thin light stroke) with an irregular **red splat** on the chest and a single drip. An earlier blood-drop icon was dropped because it looked like a blood-donation logo. The same mark appears on sponsor cards, with the splat scaled by the sponsor's tier (bigger for Severe).

### 6.2 Headline and key lines (current)

- **Main headline:** "WHO'S BUYING YOUR ___?" on two lines in huge condensed capitals. The last word is red and rotates every 1.3 seconds: *shirt → shoes → stadium → game → league → club → loyalty*. It stops on **loyalty**, and clicking the word plays it again. The rotation shows the scope (not just shirts: shoes, stadiums, the game, whole leagues). The team liked the rotation. Don't use the word "race": it has strong other meanings, so "game" replaces it. The payoff says what sponsors really buy: the fan's loyalty.
- **"Your chest. Their ad."** The team likes the line but wants it understated. It appears only in the footer, small, in dark red, as a quiet sign-off. A full-width red statement band was tried and rejected as way too much. A supporting sentence that could be reused elsewhere: *"Visit Rwanda doesn't pay Aston Villa up to $27m a year for a patch of fabric. It pays for thousands of fans to wear its name to every match, in every photo, in every post. That's what a sponsor buys: you."*
- Supporting line under the headline: *"Type a club, a league, a sport or a sponsor. We trace every sponsor back to who really pays, and rate how much blood is on the money."*

Why the old headline "Who paid for your shirt?" was replaced:
- A fan's honest answer is "I did, £80". It reads like a question about merchandise price or sweatshop labour, not sponsorship.
- It asks about an object, not about the fan's role. The sponsor buys the fan, not the fabric.
- It is too narrow for stadiums, events and other sports.

Other headline options considered, in case the team revisits it:
- "Who's advertising on your ___?" (ending on "you")
- "Whose name is on your ___?"
- "You're wearing their ad."
- "Your passion is their PR."
- "Who's cashing in on your cheers?"
- "They pay for your love. You decide what it's worth."
- "What's behind your jersey?"
- "How much blood is on your jersey?" (the most visceral; test on fans first)

The team debated whether being more accurate means giving up the jersey. The answer is no: **the jersey stays the visual anchor**. It is the most visible and recognisable thing in nearly every sport: football shirts, cycling jerseys, F1 race suits, NBA jerseys. The words widen the scope and the picture stays the jersey.

### 6.3 Colour

- Background: near-black warm brown `#0f0d0c`. Panels `#1a1614`. Borders `#2e2825` / `#3d332f`.
- Text: warm off-white `#f3ede6`. Secondary text `#d6cec5`, `#b3aaa0`, `#a39a91`.
- Level colours as in 5.1. Accent red `#ff3b30` for the rotating headline word and active tabs.
- **Teal `#4fc3b0` means good news:** "Got better", "They dropped it", "Say thanks".
- Positive cards use a subtle teal tint with a thin teal border.

### 6.4 Typography

- **Big Shoulders Display** (weight 900, uppercase) for headlines, level words (SOAKED, STAINED…) and big numbers.
- **Schibsted Grotesk** for body text and UI.
- **IBM Plex Mono** for small labels, dates, sources and meta text (uppercase with letter spacing).

### 6.5 Imagery

- **Real shirt photos**, front and back, shown on white. The prototype uses product images from footballkitarchive.com, plus footyheadlines.com for Manchester City. **These need permission or licensed images before going public.**
- **Club crests** from football-data.org. Same permission caveat.
- **No blood splatter on the shirts.** Early designs splattered the jerseys, which felt comic and cartoonish, and the team asked to remove it completely. The blood idea now lives only in the level names, the red colour scale and the logo mark.

---

## 7. The website, page by page

All pages are dark, 1440px wide on desktop, and share the same header:

- **Header** (72px tall, thin bottom border). Left: logo mark and "BEHIND THE JERSEY", linking to the landing page. Right: navigation links "Sports", "How we rate", "Contribute", and a pill button "Open data on GitHub" with a code icon.
- **Footer.** Small mono lines: deal values are reported estimates (with sources), ratings are illustrative until the method is final, and crest credits. On the landing page the footer's left side has **"YOUR CHEST. THEIR AD."** in small (22px) dark-red condensed capitals.

### 7.1 Landing page (current, combined version)

Sections from top to bottom:

**1. Hero** (centred)
- Small mono kicker: "7 CLUBS RATED · 2 LEAGUES MAPPED · UPDATED 24 SEP 2026".
- Headline "WHO'S BUYING / YOUR [LOYALTY]?" with the rotating red word (see 6.2), about 104px.
- One-sentence explainer (see 6.2).
- **Search box:** 760px wide, 68px tall, rounded pill with a magnifier icon and the placeholder "Search a club, league, sport or sponsor". It has a soft shadow.
- Under it: "TRY" plus chips *Arsenal, Premier League, Visit Rwanda, Formula 1, Real Madrid*. Clicking a chip fills the search and opens the results.
- A slim **blood-level key**: "BLOOD LEVEL" followed by four tiny meters with the words Clean, Spotted, Stained, Soaked in their colours, and a link "How we rate →". An earlier version had four large explainer boxes here. The team found them great but too much, so they moved down to the "How we rate" section.

**How search works** (the same on every page that has a search box)
- It opens a dropdown panel under the input. With an empty query it shows "POPULAR RIGHT NOW" (Arsenal, Premier League, Visit Rwanda, Atlético de Madrid, Motorsport).
- It searches four types of result: **Club, League, Sport, Sponsor**. It matches names, nicknames and aliases (e.g. "spurs" finds Tottenham, "gunners" finds Arsenal, "f1" finds Motorsport, "man" finds both Manchester clubs, accents are ignored). For longer queries it also matches the description, so "rwanda" finds Visit Rwanda plus every club it sponsors.
- Each result row shows: the crest in a white circle (or initials in a grey circle for leagues, sports and sponsors), the name in bold, a grey one-line description (e.g. "Premier League · Visit Rwanda on the front"), the type in small mono, and on the right the rating. Clubs show their level word in colour with a mini meter, sponsors show their tier (Severe, Serious…), leagues show a short status (e.g. "Not mapped yet").
- Clicking a result goes to the club's team page or the overview.
- With no results: "Nothing on file for "xyz" yet. Add it yourself: every club and sponsor lives on GitHub →".

**2. Just changed**
- Heading "JUST CHANGED", subline "Sponsors come and go every summer. This is what moved, and which way.", and a link on the right "Every change, with sources →".
- Four cards in a row. Each card has: a change tag with an arrow icon (red "GOT WORSE" up arrow, teal "GOT BETTER" down arrow, grey "RENEWED" side arrow, or "BEING RATED"), the date, the club crest with the club name, a small level badge (coloured block with a mini meter and the level word), a bold title, a two-to-three line description and a mono source line.
- Current cards:
  1. 6 Aug 2026 · Arsenal · Renewed · "Renews Emirates until 2033": reportedly up to $93m a season, from an airline owned by the Government of Dubai. (SportsPro)
  2. 15 Jul 2026 · Aston Villa · Got worse · Soaked · "Visit Rwanda goes on the front": up to $27m a year from the Government of Rwanda. It replaces a betting sponsor after the ban. (SportsPro)
  3. Jun 2026 · Arsenal · Got better · Stained · "Visit Rwanda comes off the sleeve": gone after eight seasons of fan protest. Emirates stays on the front, so still stained.
  4. 10 Jun 2026 · Real Madrid · Renewed · Stained · "Record Emirates renewal": until 2031, reportedly $115m a year, the biggest shirt deal in Europe.
- Two more items exist in the data: Newcastle (Jun 2026, got better, Spotted: "Saudi-owned Sela is off the front", noon stays on the sleeve) and Liverpool (Apr 2026, being rated: Turkish Airlines from 2027/28).

**3. They dropped it** (the positive section)
- Heading "THEY DROPPED IT", subline "Clubs can change, and these ones did. Say thanks, and ask your own club to be next.", and a teal link "Know a club that changed? Tell us →".
- Six cards in a 3 × 2 grid with a subtle teal tint. Each card has the club crest in a white circle, the club name, a teal mono label of what they dropped, the year in large teal numbers, one or two positive sentences, and a teal "Say thanks" button.
  1. Arsenal · Dropped Visit Rwanda · 2026: "Off the sleeve after eight seasons. Fans had spoken up about it for years."
  2. Newcastle United · Dropped Sela · 2026: "The Saudi state-owned events company is off the front of the shirt. A drinks brand replaces it."
  3. Bayern Munich · Stepped back from Visit Rwanda · 2025
  4. Bayern Munich · Dropped Qatar Airways · 2023: "Members raised it at meetings and in the stands for years. The deal was not renewed."
  5. Schalke 04 · Dropped Gazprom · 2022: "Took the logo off the shirt within days, then ended a 15-year deal early."
  6. Manchester United · Dropped Aeroflot · 2022: "Ended the deal early and said it shared fans' concerns."
- Only the Arsenal and Newcastle cards cite a source so far. The other four need sources before launch.

**4. League by league**
- Heading "LEAGUE BY LEAGUE", subline "Every club gets a slot, worst first. Dashed means nobody has checked it yet.", and a link "All sports and leagues →".
- One row per league. Left: the league name and "Country · X of Y rated". Middle: a strip with one slot per club, worst first. Each slot has the club crest above a small coloured bar in its level colour. Unrated clubs get a faded crest and a dashed empty bar, and leagues without crests get dashed empty circles. Right: a big number and a note, counting clubs rather than money.
  - Premier League: 20 slots (Villa, Arsenal, Man City, Newcastle, Brighton, then 15 unrated). "4 of 20: shirts carry a sponsor we rate as bad."
  - La Liga: Atlético, Real Madrid, then 18 dashed. "2 of 20: bad so far, 18 clubs still to check."
  - Bundesliga (18), Ligue 1 (18), Serie A (20), MLS (30): all dashed, "Not started". Notes: "Bayern dropped Qatar Airways in 2023", "PSG has Visit Rwanda until 2028", "Be the first to map it".
- The team liked this "whole league at a glance" view most, and it replaced an earlier chart that added up money per league.

**5. How we rate** (anchor `#how`)
- Red mono kicker "HOW WE RATE", heading "NOT A HUNCH. THE SAME FIVE STEPS FOR EVERY SHIRT.", and a line about agents doing the legwork, people checking it, every claim linked to its source, and every step on GitHub.
- Five cards in a row, one per step (see 5.4). Each has a big red number, a small pill saying who does it (Agent / Agent + you / Person / Automatic, where "Person" is teal), the step title, a description and a small mono note (e.g. "Nothing goes live unchecked").
- Below: "WHAT THE LEVELS MEAN", four boxes with meter, level word in colour and a one-line definition (Clean: checked, nothing found. Spotted: a lesser link to a state. Stained: a serious sponsor on the front. Soaked: a severe sponsor, or two serious ones).

**6. How to help** (anchor `#contribute`; a large rounded panel)
- Left: red mono kicker "OPEN DATA · OPEN PIPELINES · OPEN AGENTS", heading "HELP US CHECK EVERY SHIRT", an explainer, and the three ways to help (5.5) as numbered rows, each with a button (Read the guide / See the format / Pick a club).
- Right: "NOBODY HAS CHECKED THESE YET · PICK ONE", a wrap of pill chips with the crest and short name of each unrated Premier League club, the line "Plus the Bundesliga, Ligue 1, Serie A and MLS: nobody has started those yet.", and two big buttons "Open the repo on GitHub" and "Read the contributor guide".
- The team explicitly did **not** want a repository file tree (data/, evidence/, pipelines/…) here.

### 7.2 Soccer overview page (crest version, the team's favourite)

Three versions were designed: v1 with shirt photos, v2 with club crests and v3 with both. **The team prefers v2 (crests).**

- **Header** as above, then **sport tabs**: Soccer · Basketball · American football · Motorsport · Tournaments & governing bodies. The active tab is underlined in red.
- **Hero:** "WHAT'S ON YOUR CLUB'S SHIRT?" with the line "Every sponsor, traced back to who really pays. The more blood behind the money, the higher the blood level." This headline predates the new "Who's buying your ___?" and should probably be aligned with it.
- **League chips:** Premier League · La Liga · Bundesliga · Ligue 1 · Serie A · MLS. The selected chip is solid light.
- **"Every club at a glance" strip:** a panel with a headline sentence, e.g. "Premier League: 4 of 20 home shirts carry a sponsor we rate as bad. 1 is soaked.", a count line "1 soaked · 2 stained · 1 spotted · 1 clean · 15 not rated yet", and one slot per club (crest above a 22px coloured bar, dashed for unrated), worst first. Hovering shows "Club: level". The team called this "really good, showing the whole league".
- **Rating groups side by side, worst first:** Soaked, Stained, Spotted, Clean. Each group header has a four-bar meter, the level word in 42px capitals and colour, "4 OF 4 · 1 CLUB" in mono, a two-line description, and a 3px underline in the level colour. All group headers are the same height, so every card top lines up. This was fixed after the team noticed Aston Villa sitting lower than Arsenal.
- **Club cards** (236px wide, equal heights). The top is a white tile with the club crest centred (in v1 the shirt photo, in v3 the shirt photo with a crest badge in the corner; Atlético also shows a small "BACK" inset of the back of the shirt). Below it is a 54px coloured band in the level colour with a meter, the level word (e.g. SOAKED) and "4 OF 4" at the right. Then the club name, the sponsor line in mono (e.g. "Visit Rwanda · front of shirt") and the payer line (e.g. "Paid for by the Government of Rwanda"). Cards link to team pages where they exist.
  - Premier League: **Soaked**: Aston Villa. **Stained**: Arsenal, Manchester City. **Spotted**: Newcastle United. **Clean**: Brighton & Hove Albion (American Express, "A listed US company with no state owner"). The Clean example was added so people can see what a good club looks like.
  - La Liga: **Soaked**: Atlético de Madrid (Riyadh Air on the front, Visit Rwanda on the back). **Stained**: Real Madrid (Emirates).
- **"Not rated yet" group:** dashed header, then an eight-column grid of smaller crest tiles with club names. La Liga adds a dashed "+18 more La Liga clubs, not rated yet" tile.
- Leagues without data show a dashed panel, e.g. "Bundesliga is next" with the known facts (Bayern and Qatar Airways, Schalke and Gazprom). Other sports show a short list of known deals (e.g. LA Clippers × Visit Rwanda; Haas × Uralkali, dropped 2022).
- **"They dropped it"** at the bottom: three large cards (Arsenal × Visit Rwanda, Bayern × Qatar Airways, Schalke × Gazprom) with a rotated "DROPPED 2026" stamp, plus a list of six more precedents.

### 7.3 Team page

Three examples exist: **Atlético de Madrid** (current season only), **Arsenal** (with history) and **Aston Villa** (got worse).

**Title row** (top left, no clutter on the shirt)
- On the left, a softly tinted box in the level colour holds the four-bar meter and the level word, e.g. **SOAKED**, in 64px capitals. Right next to it, at the **same size and on the same baseline**, is the club name, e.g. **ATLÉTICO DE MADRID**, preceded by the club crest in a white circle. The crest is a test and can be switched off.
- Below the level: "BLOOD LEVEL · 4 OF 4 · WORST". Below the name: the kit label ("Home shirt · 2026/27"), a change badge when relevant ("Worse than last season: Visit Rwanda took the front" in red with an up arrow, or "Better than last season: Visit Rwanda is gone" in teal with a down arrow), and one plain sentence, e.g. "Saudi Arabia's state fund pays for the front of this shirt. Rwanda's government pays for the back."
- Breadcrumb in the header: "All clubs / Soccer / La Liga / Atlético de Madrid".

**The stage**
- A white panel in the middle shows the **front and back of the real shirt side by side, both at once** (no toggle), labelled FRONT and BACK. Nothing is drawn on top of the shirts.
- **One card per sponsor** sits around the shirts (left, right or top), each connected by a thin line with a small ring that ends exactly on that sponsor's logo on the photo. Hovering the logo, the ring, the line or the card itself opens the card. Logo hover areas are invisible, with no outline.
- **Collapsed cards** show a preview: the logo mark (jersey with splat sized by tier), the tier in colour (Severe, Serious, Not rated yet), the sponsor name, the placement ("Front of shirt"), and the start of the details fading out. This makes it obvious the card can open.
- **Expanded card** (dark `#26201d`, strong border): verdict sentence (e.g. "Paid for by a government that UN experts say has 3,000–4,000 troops fighting alongside M23 rebels in eastern Congo."), the money ("Up to £20m a year" or a `[DEAL VALUE]` placeholder), a list of facts tied to the owner with sources, and buttons.
- **Hover intent:** the card stays open while the mouse moves diagonally toward it (a "safe triangle", like good dropdown menus), so it doesn't close on the way.
- If the back of a shirt has no sponsor, a small note card says so.

**Timeline** (clubs with history, e.g. Arsenal and Villa)
- It sits under the stage and is compact and neutral. One small block per period with no background colour; the selected block gets a light border. Each block shows the season range, the mini meter and level word in the level colour, and a note badge where something changed ("+ Visit Rwanda" in red, "Rwanda gone" in teal).
- Below the blocks are **sponsor lanes**: coloured pills (colour by tier) spanning the periods each sponsor was on the shirt, e.g. Emirates across all of Arsenal's periods, Visit Rwanda for 2018/19–2025/26 only, Deel from 2026/27. Hovering a pill opens that sponsor's card on the stage.
- **Hovering a period swaps the shirt, level and sentence** to that season. There are no separate season buttons and no pop-ups from the timeline itself.
- Arsenal periods: 2006/07–2017/18 **Stained** (Emirates) → 2018/19–2025/26 **Soaked** (+ Visit Rwanda sleeve, about £10m a year) → 2026/27 **Stained** (Rwanda gone, Emirates stays; Deel on the sleeve, not rated). This shows a shirt getting better but still stained.
- Aston Villa periods: 2024/25–2025/26 **Not rated** (Betano front, Trade Nation sleeve) → 2026/27 **Soaked** (Visit Rwanda front, up to £20m a year; Betano moves to the sleeves).
- Atlético 2026/27: Riyadh Air front (Serious), Kraken sleeve (not rated), Visit Rwanda back (Severe) → **Soaked**.

### 7.4 Money-flow section (parked for later)

This is a reusable section for a future page, e.g. "by country" or "by company". It is not on the current landing page.

- A toggle at the top switches between **By country** and **By company**, with the hint "Hover a country to follow its money".
- A large dark panel holds a flow diagram. Bands flow from left to right and their width matches the reported money per year. Solid bands are disclosed values, and dashed thin lines are deals whose value is not disclosed.
  - **By country** has three columns, COUNTRY → SPONSOR → SHIRT: Dubai ($208m) → Emirates → Real Madrid ($115m), Arsenal ($93m). Abu Dhabi ($90m) → Etihad Airways → Manchester City. Saudi Arabia ($46m) → Riyadh Air → Atlético de Madrid. Rwanda ($27m+) → Visit Rwanda → Aston Villa ($27m), plus dashed lines to Atlético (back), PSG and LA Clippers.
  - **By company** has two columns, COMPANY → SHIRT, with each company's owner under its name.
- Club labels on the right show the crest, name and amount. Hovering a country or company highlights its flows and fades the rest.
- Legend: Severe sponsor (red), Serious sponsor (brick), value not disclosed (dashed).
- An earlier version showed no names or numbers because of a rendering problem. It is fixed.

### 7.5 Earlier landing-page ideas and what happened to them

Three directions were designed before the combined page:

1. **"Search first":** calm, with the search box as the hero. Kept: headline area, search, "Just changed". Dropped: a chart adding up bad money per league (the team doesn't want league money totals). Parked: **"Next chance to drop it"**, a timeline of when big deals end (PSG × Visit Rwanda 2028, Real Madrid × Emirates 2031, Arsenal × Emirates 2033, Atlético × Riyadh Air 2035) with "Remind me" buttons. Liked, but too much for version one and we lack contract-end data.
2. **"The number":** opened with a giant "$371M" and a "Who is paying" box ranking governments. Kept: **League by league**. Also had a summer timeline of changes, a red contribute band with a mock terminal, and a "Follow your club" email signup (now an idea).
3. **"Follow the money":** a red "LATEST" news ticker at the top, search in the header, the money-flow chart, tiles for every sport and league, and the rating pipeline. Kept: **How a rating is made**. The chart was fixed and parked (7.4).

### 7.6 Idea B: "The Label" (future feature, for the pitch)

A mobile flow (390 × 844):
- **Scan screen:** "What's on your shirt? Point your camera at a sponsor. We'll show you who's really paying for it." A camera view detects "VISIT RWANDA" and shows a "SPONSOR FOUND" tag, a "Scan my shirt" button, and a fallback "or pick your club" list (Aston Villa, Soaked; PSG; Atlético; LA Clippers).
- **Result screen:** a garment care-label style card "WHAT'S IN YOUR SHIRT". Aston Villa, Home shirt 2026/27. "Front of shirt paid for by: Government of Rwanda, via Visit Rwanda, up to £20m a year." "Contains: 3,000–4,000 Rwandan troops fighting in eastern Congo · $800k/mo coltan levies taken by M23 rebels · 120+ t/mo coltan smuggled from Congo into Rwanda." Rating: Severe, "This stain doesn't wash out." Footnoted sources, and buttons "Share my label" and "Tell Aston Villa".
- Status: parked. Show it in the hackathon pitch as a future feature. Later the label can become the share card for a team page.

### 7.7 Idea C: "Follow the Money" (story page)

A long page for one shirt: "From a mine in Congo to the front of your shirt. Six links, each one on the record." A vertical chain of six numbered links (THE MINE → THE REBELS → THE STATE → THE BRAND → THE CLUB → YOU), each with a big number and source (see 4.2). It ends with "It's on you. You paid for the shirt. Rwanda's government paid for the front of it." It also has a "pushback" box, a branch "THE SAME COLTAN" to smelters and electronics ("…and possibly the phone in your pocket"), "Same sponsor, other teams" (PSG, Atlético, Clippers, Rams), "Dropped the branding" (Bayern 2025, Arsenal 2026), and buttons "Share this chain" and "Send it to Aston Villa". The team called this idea extremely good. It is kept in mind for later, probably as the deep-dive linked from a Soaked club.

---

## 8. Decision log

In order:

1. Three directions explored: **A** jersey with rated sponsors (chosen as the main product), **B** "The Label" scan (future, for the pitch), **C** "Follow the Money" chain (very good, keep for later).
2. Blood-drop logo replaced by the jersey-with-splat mark. The four level words kept. Comic splatter toned down, then **removed from the shirts entirely**.
3. One page per club with season switching (Arsenal as the example). Real photos, front and back. Examples with several bad sponsors (Atlético: two).
4. Timeline colours made more distinct. Show sponsors being added (bad) and removed (good, but the club can stay stained).
5. Team page layout: shirt in the middle with nothing on top, one card per sponsor around it with lines to the logos, hover to expand, front and back shown at the same time. Hover the timeline instead of season buttons.
6. Blood level moved to the left, same size and baseline as the club name. Meter always next to the level word. Cards visibly expandable. Timeline sponsors connected to cards.
7. Hovering a line, ring or logo opens its card. Stronger card contrast. Timeline much smaller with no pop-ups. Removed a separate "Visit Rwanda removed" card.
8. Invisible hover areas. Neutral timeline blocks. Hover intent so cards stay open while moving toward them.
9. Overview: crest version preferred. Whole-league strip loved. Rating made much more obvious. Clean example added. Card tops aligned. Crest added to team pages as a test.
10. Landing page: three directions, then combined. No league money totals. League by league kept. "Next chance to drop it" parked. "How a rating is made" kept. No repo file tree. Positive "They dropped it" with crests added below "Just changed". Money-flow chart fixed and parked for a "by country / by company" section.
11. Headline: "Who's buying your ___?" rotating, ending on **loyalty**. The rotation is liked. "Race" replaced by "game". "Your chest. Their ad." was tried as a full-width red band, judged way too much, and moved to the footer as a quiet line.

---

## 9. Parked ideas and open questions

**Parked ideas**
- Next chance to drop it: deal end dates with reminders. Needs contract-end data.
- Money flow by country or company (designed, see 7.4).
- Follow your club: an email when its shirt changes.
- Sponsor pages: everything one sponsor pays for, e.g. Visit Rwanda across four sports.
- Country and company pages (where the money-flow section could live).
- Events and other sports: F1 races, the Cycling World Championships, tournaments. Who sponsors the event itself.
- Kit-launch alerts: new shirts rated on release day.
- Share card for your club (idea B, the label).
- Fan campaigns: supporters' groups already pushing against a sponsor, and how to join them.
- Embed widget and open API for fan sites and journalists.
- Confidence level and "last checked" date on every rating.
- Other languages: French, Spanish, Arabic, Kinyarwanda.
- Animations (the team wants to discuss them later; so far only the rotating headline word is animated).

**Open questions**
- The formal rating method: exact rules from sponsor tiers and placement to club level, and who reviews.
- The GitHub organisation name, the contributor guide and the final evidence format.
- Image rights for shirt photos and crests.
- Whether the overview hero "What's on your club's shirt?" should switch to the new headline style.
- Sources for the Bayern (2025 and 2023), Schalke and Man Utd "They dropped it" cards.
- The Premier League 2026/27 club list in the prototype comes from earlier research and should be checked again.
- The Etihad value (£67.5m) is from older reports.

---

## 10. Caveats for anyone reusing this material

- **Ratings are illustrative** until the method is agreed.
- **Deal values are press estimates**, per year, converted at $1 = £0.75 = €0.87. `[DEAL VALUE]` marks unknown values in the team-page designs.
- **Images:** shirt photos (footballkitarchive.com, footyheadlines.com) and crests (football-data.org) are for the hackathon mock only.
- **Placeholders:** `[org]` for the GitHub organisation. `btj` is only a concept name for a command-line tool.
- Wording about fan protest describes timing ("after years of protest"). Don't claim protest caused a decision unless a source says so.

---

## 11. About the prototype (for agents who will continue the design work)

The prototype is a set of interactive artboards in a Claude design canvas, private to the team. Each artboard is a self-contained HTML-like component with its own state. Artboards link to each other, and hover and click behaviour works. Current artboards:

| Artboard | What it is |
|---|---|
| Landing (combined) | The current home page (7.1), about 4,260px tall |
| Landing 1 / 2 / 3 | The three earlier directions (7.5), kept for reference |
| MoneyFlow | The parked money-flow section (7.4), 1328 × 720 |
| Overview v2 (crests) | The favoured soccer overview (7.2) |
| Overview v1 (shirts), v3 (both) | Alternative overview versions |
| TeamDetail (Atlético), Team-arsenal, Team-villa | Team pages (7.3) |
| LabelScan, LabelResult | Idea B (7.6) |
| FollowMoney | Idea C (7.7) |

Sticky notes on the canvas hold the rating caveats, the source list and the ideas list.

---

## 12. Sources

- UN Group of Experts on the DR Congo, final report, 2024 (Rwandan troops alongside M23; M23 coltan levies)
- Global Witness, June 2026 (Rubaya coltan smuggling into Rwanda; share of world tantalum; smelters and electronics supply chain)
- Amnesty International, 2025 (Saudi Arabia: 345 executions in 2024)
- US Office of the Director of National Intelligence, February 2021 (Khashoggi assessment)
- Human Rights Watch, July 2024 (UAE mass trial, 43 life sentences)
- SportsPro: Aston Villa × Visit Rwanda (Jul 2026): https://www.sportspro.com/news/sponsorship-marketing/aston-villa-visit-rwanda-shirt-principal-sponsorship-july-2026/
- SportsPro: Real Madrid × Emirates, €100m (Jun 2026): https://www.sportspro.com/news/sponsorship-marketing/real-madrid-emirates-record-sponsorship-june-2026/
- SportsPro: Atlético × Riyadh Air: https://www.sportspro.com/news/atletico-madrid-riyadh-air-saudi-new-shirt-sponsor/
- SportsPro: the business of the 2026/27 Premier League season: https://www.sportspro.com/analysis/finance-investment/premier-league-2026-27-season-tv-rights-sponsors-finances-valuations/
- Sporting Goods Intelligence: Arsenal × Emirates to 2033: https://www.sgieurope.com/marketing/emirates-and-arsenal-extend-shirt-deal-to-2033/122576.article
- Inside World Football: Arsenal renewal (6 Aug 2026): https://www.insideworldfootball.com/2026/08/06/arsenal-announce-emirates-renewal-to-2033
- Inside World Football: Ampere study, Premier League front-of-shirt value (22 Sep 2026): https://www.insideworldfootball.com/2026/09/22/ampere-study-showcases-front-of-shirt-sponsor-worth-in-english-premier-league
- All Football: Manchester City × Etihad £67.5m: https://m.allfootballapp.com/news/EPL/Manchester-City-set-to-keep-up-%C2%A367.5million-a-year-deal-with-Abu-Dhabi-airline-Etihad/2424047
- The Mag: Newcastle replaces Sela (Jun 2026): https://www.themag.co.uk/2026/06/newcastle-united-have-agreed-new-main-sponsor-front-of-shirt-three-year-deal-to-replace-sela/
- Footy Headlines: Liverpool × Turkish Airlines from 2027/28 (Apr 2026): https://www.footyheadlines.com/2026/04/lfc-new-sponsor.html
- Reference sites: https://www.pushtoleave.org/ and https://www.surveillancewatch.io/
