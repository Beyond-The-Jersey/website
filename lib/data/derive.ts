// Derived data the pages need. Pure functions over a Dataset; every view model returned here is
// plain JSON so it can be handed to client components.
import {
  formatDate,
  formatMoney,
  initials,
  listJoin,
  placementLabel,
  placementPhrase,
  seasonEndYear,
  seasonLabel,
  seasonSpan,
  seasonStartYear,
  sourceLine,
  sourceLineShort,
} from '../format';
import type { Dataset } from './dataset';
import { kitEnd, kitStart } from './dataset';
import { compareLevels, isBad, isRated, levelForKit, TIER_SCORE } from './rating';
import type { Club, ContactChannel, Deal, Kit, KitSponsor, League, LevelId, Owner, Source, Sponsor, Sport, TierId } from './schema';

// ---------------------------------------------------------------- basics

export const tierOf = (ds: Dataset, sponsorId: string): TierId => ds.byId.sponsor.get(sponsorId)?.tier ?? 'unrated';

export const kitLevel = (ds: Dataset, kit: Kit): LevelId => levelForKit(kit, (id) => tierOf(ds, id));

/** Home kits of a club, oldest first. */
export const clubKits = (ds: Dataset, clubId: string): Kit[] => ds.kitsByClub.get(clubId) ?? [];

/** The kit with the latest period end. */
export function currentKit(ds: Dataset, clubId: string): Kit | null {
  const kits = clubKits(ds, clubId);
  return kits.reduce<Kit | null>((best, k) => (!best || kitEnd(k) >= kitEnd(best) ? k : best), null);
}

export function clubLevel(ds: Dataset, clubId: string): LevelId {
  const kit = currentKit(ds, clubId);
  return kit ? kitLevel(ds, kit) : 'not-rated';
}

/** A kit can be drawn on the team page when it has both photos and every logo has a hotspot. */
export const isTeamPageKit = (kit: Kit): boolean =>
  Boolean(kit.photos.front && kit.photos.back) && kit.sponsors.every((s) => s.hotspot && s.side && s.cardSlot);

export function hasTeamPage(ds: Dataset, clubId: string): boolean {
  const kit = currentKit(ds, clubId);
  return Boolean(kit && isTeamPageKit(kit));
}

export const DEFAULT_LEAGUE = 'premier-league';

export function leagueHref(league: Pick<League, 'id' | 'sportId'>): string {
  return league.sportId === 'soccer' ? `/soccer/${league.id}/` : `/${league.sportId}/`;
}

export function sportHref(sport: Pick<Sport, 'id'>): string {
  return sport.id === 'soccer' ? `/soccer/${DEFAULT_LEAGUE}/` : `/${sport.id}/`;
}

export function clubHref(ds: Dataset, club: Club): string {
  if (hasTeamPage(ds, club.id)) return `/clubs/${club.id}/`;
  const league = club.leagueId ? ds.byId.league.get(club.leagueId) : undefined;
  if (league) return leagueHref(league);
  return club.sportId === 'soccer' ? sportHref({ id: 'soccer' }) : `/${club.sportId}/`;
}

// ---------------------------------------------------------------- owners, claims, deals

export function ownerChain(ds: Dataset, ownerId: string | null): Owner[] {
  const out: Owner[] = [];
  let o = ownerId ? ds.byId.owner.get(ownerId) : undefined;
  while (o && !out.includes(o)) {
    out.push(o);
    o = o.parentId ? ds.byId.owner.get(o.parentId) : undefined;
  }
  return out;
}

/** The first state in the owner chain (Riyadh Air → Saudi PIF → Government of Saudi Arabia). */
export function stateOwner(ds: Dataset, sponsor: Sponsor): Owner | null {
  return ownerChain(ds, sponsor.ownerId).find((o) => o.type === 'state') ?? null;
}

/** Who pays, for sentences: 'Government of Dubai, UAE' when the state sits inside another state. */
export function payerName(ds: Dataset, sponsor: Sponsor, withCountry = false): string | null {
  const state = stateOwner(ds, sponsor);
  const owner = state ?? ownerChain(ds, sponsor.ownerId)[0];
  if (!owner) return null;
  return withCountry && state?.parentId && state.country ? `${owner.name}, ${state.country}` : owner.name;
}

/** 'paid for by the Government of Rwanda' or 'part-owned by the Public Investment Fund (Saudi Arabia)'. */
export function payerPhrase(ds: Dataset, sponsor: Sponsor, withCountry = false): string | null {
  if (!sponsor.ownerId) return null;
  if (sponsor.ownership === 'part-owned') return `part-owned by the ${ds.byId.owner.get(sponsor.ownerId)?.name}`;
  const name = payerName(ds, sponsor, withCountry);
  return name ? `paid for by the ${name}` : null;
}

export interface SourceView {
  name: string;
  date: string;
  url: string | null;
  /** 'SportsPro (citing The Athletic) · Jul 2026' */
  line: string;
  /** 'SportsPro · Jul 2026' */
  short: string;
}

export const sourceView = (s: Source | null | undefined): SourceView | null =>
  s ? { name: s.name, date: s.date, url: s.url, line: sourceLine(s), short: sourceLineShort(s) } : null;

export interface ClaimView {
  id: string;
  text: string;
  source: SourceView | null;
  reviewed: boolean;
}

export function claimsForSponsor(ds: Dataset, sponsor: Sponsor): ClaimView[] {
  return sponsor.claimIds.flatMap((id) => {
    const c = ds.byId.claim.get(id);
    return c ? [{ id: c.id, text: c.text, source: sourceView(c.source), reviewed: c.reviewed }] : [];
  });
}

const inPeriod = (from: string | null, to: string | null, season: string) =>
  (!from || from <= season) && (!to || to >= season);

/** The deal behind a sponsor on a kit: same club, sponsor and placement, overlapping the kit's period. */
export function dealForKit(ds: Dataset, kit: Kit, ks: KitSponsor): Deal | null {
  const start = kitStart(kit);
  const end = kitEnd(kit);
  const matches = ds.deals.filter(
    (d) =>
      d.clubId === kit.clubId &&
      d.sponsorId === ks.sponsorId &&
      d.placement === ks.placement &&
      (inPeriod(d.from, d.to, end) || inPeriod(d.from, d.to, start)),
  );
  return matches[0] ?? null;
}

export const isDealOver = (ds: Dataset, d: Deal) => Boolean(d.to && d.to < ds.currentSeason);
export const isDealFuture = (ds: Dataset, d: Deal) => Boolean(d.from && d.from > ds.currentSeason);

export interface MoneyView {
  main: string;
  usd: string | null;
  source: SourceView | null;
}

export function moneyView(deal: Deal | null): MoneyView | null {
  if (!deal?.value) return null;
  return { ...formatMoney(deal.value), source: sourceView(deal.source) };
}

/** Clubs a sponsor pays now or has signed with: current kits first, then deals that haven't ended. */
export function clubsForSponsor(ds: Dataset, sponsorId: string): Club[] {
  const ids = new Set<string>();
  for (const c of ds.clubs) {
    if (currentKit(ds, c.id)?.sponsors.some((s) => s.sponsorId === sponsorId)) ids.add(c.id);
  }
  for (const d of ds.deals) if (d.sponsorId === sponsorId && d.clubId && !isDealOver(ds, d)) ids.add(d.clubId);
  return ds.clubs.filter((c) => ids.has(c.id));
}

// ---------------------------------------------------------------- club summaries

const ratedSponsorsOn = (ds: Dataset, kit: Kit) => kit.sponsors.filter((s) => tierOf(ds, s.sponsorId) !== 'unrated');

/** 'Visit Rwanda · front of shirt' or 'Riyadh Air · front, Visit Rwanda · back'. Rated sponsors only. */
export function sponsorLine(ds: Dataset, kit: Kit): string {
  const list = ratedSponsorsOn(ds, kit);
  const one = list.length === 1;
  return list
    .map((s) => {
      const where = one && (s.placement === 'front' || s.placement === 'back') ? `${s.placement} of shirt` : placementLabel(s.placement, 'short');
      return `${ds.byId.sponsor.get(s.sponsorId)?.name} · ${where}`;
    })
    .join(', ');
}

/** 'Paid for by the Government of Rwanda', 'Paid for by the governments of Saudi Arabia and Rwanda'. */
export function payerLine(ds: Dataset, kit: Kit): string | null {
  // Shirt order, so 'Saudi Arabia and Rwanda' reads front first.
  const sponsors = kit.sponsors.map((s) => ds.byId.sponsor.get(s.sponsorId)).filter((s): s is Sponsor => Boolean(s));
  const bad = sponsors.filter((s) => (TIER_SCORE[s.tier] ?? 0) >= 1);
  if (bad.length === 0) {
    const clean = sponsors.find((s) => s.tier === 'none');
    return clean?.verdict ?? kit.summary;
  }
  const owned = [...new Set(bad.filter((s) => s.ownership !== 'part-owned').map((s) => payerName(ds, s)).filter(Boolean) as string[])];
  if (owned.length > 1 && owned.every((n) => n.startsWith('Government of ')))
    return `Paid for by the governments of ${listJoin(owned.map((n) => n.replace('Government of ', '')))}`;
  if (owned.length) return `Paid for by the ${listJoin(owned)}`;
  const worst = [...bad].sort((a, b) => (TIER_SCORE[b.tier] ?? 0) - (TIER_SCORE[a.tier] ?? 0))[0];
  const phrase = payerPhrase(ds, worst);
  return phrase ? phrase[0].toUpperCase() + phrase.slice(1) : null;
}

export interface ClubSummary {
  id: string;
  name: string;
  shortName: string;
  crest: string | null;
  initials: string;
  level: LevelId;
  href: string;
  hasTeamPage: boolean;
  sponsorLine: string;
  payerLine: string | null;
}

export function clubSummary(ds: Dataset, club: Club): ClubSummary {
  const kit = currentKit(ds, club.id);
  return {
    id: club.id,
    name: club.name,
    shortName: club.shortName,
    crest: club.crest ? `/${club.crest}` : null,
    initials: club.code || initials(club.name),
    level: clubLevel(ds, club.id),
    href: clubHref(ds, club),
    hasTeamPage: hasTeamPage(ds, club.id),
    sponsorLine: kit ? sponsorLine(ds, kit) : '',
    payerLine: kit ? payerLine(ds, kit) : null,
  };
}

// ---------------------------------------------------------------- leagues

export interface LeagueSummary {
  id: string;
  name: string;
  country: string | null;
  sportId: string;
  href: string;
  status: League['status'];
  notes: string[];
  /** Known clubs, worst first. */
  clubs: ClubSummary[];
  /** Slots for clubs that aren't in the data yet (clubCount minus known clubs). */
  unknown: number;
  total: number;
  counts: Record<LevelId, number>;
  rated: number;
  bad: number;
  worst: { level: LevelId; n: number } | null;
}

export function leagueSummary(ds: Dataset, leagueId: string): LeagueSummary {
  const league = ds.byId.league.get(leagueId);
  if (!league) throw new Error(`Unknown league "${leagueId}"`);
  const clubs = ds.clubs
    .filter((c) => c.leagueId === leagueId)
    .map((c) => clubSummary(ds, c))
    .sort((a, b) => compareLevels(a.level, b.level));
  const total = Math.max(league.clubCount ?? clubs.length, clubs.length);
  const counts = { soaked: 0, stained: 0, spotted: 0, clean: 0, 'not-rated': 0 } as Record<LevelId, number>;
  for (const c of clubs) counts[c.level]++;
  counts['not-rated'] += total - clubs.length;
  const worstLevel = (['soaked', 'stained', 'spotted', 'clean'] as LevelId[]).find((l) => counts[l] > 0);
  return {
    id: league.id,
    name: league.name,
    country: league.country ?? null,
    sportId: league.sportId,
    href: leagueHref(league),
    status: league.status,
    notes: league.notes,
    clubs,
    unknown: total - clubs.length,
    total,
    counts,
    rated: clubs.filter((c) => isRated(c.level)).length,
    bad: clubs.filter((c) => isBad(c.level)).length,
    worst: worstLevel ? { level: worstLevel, n: counts[worstLevel] } : null,
  };
}

export const leaguesForSport = (ds: Dataset, sportId: string) => ds.leagues.filter((l) => l.sportId === sportId);

/** Clubs with a rated current kit, and leagues with at least one of them. For the landing kicker. */
export function coverage(ds: Dataset) {
  const ratedClubs = ds.clubs.filter((c) => isRated(clubLevel(ds, c.id)));
  const leagues = new Set(ratedClubs.map((c) => c.leagueId).filter(Boolean));
  return { ratedClubs: ratedClubs.length, mappedLeagues: leagues.size, updated: formatDate(ds.meta.updatedAt, 'day') };
}

// ---------------------------------------------------------------- feeds

export interface ChangeView {
  id: string;
  date: string;
  kind: Dataset['changes'][number]['kind'];
  levelAfter: LevelId;
  title: string;
  text: string;
  source: SourceView | null;
  club: { name: string; crest: string | null; initials: string };
  href: string;
}

/** Newest first. Items are compared by month; within a month the file order decides. */
export function latestChanges(ds: Dataset, n = 4): ChangeView[] {
  return ds.changes
    .map((c, i) => ({ c, i }))
    .sort((a, b) => b.c.date.slice(0, 7).localeCompare(a.c.date.slice(0, 7)) || a.i - b.i)
    .slice(0, n)
    .map(({ c }) => {
      const club = ds.byId.club.get(c.clubId)!;
      return {
        id: c.id,
        date: formatDate(c.date, c.datePrecision),
        kind: c.kind,
        levelAfter: c.levelAfter,
        title: c.title,
        text: c.text,
        source: sourceView(c.source),
        club: { name: club.name, crest: club.crest ? `/${club.crest}` : null, initials: club.code },
        href: clubHref(ds, club),
      };
    });
}

export interface DroppedView {
  id: string;
  year: number;
  name: string;
  crest: string | null;
  initials: string;
  what: string;
  text: string;
  source: SourceView | null;
  todo: string | null;
  href: string | null;
}

export function droppedView(ds: Dataset, d: Dataset['dropped'][number]): DroppedView {
  const club = d.clubId ? ds.byId.club.get(d.clubId) : undefined;
  const name = club?.name ?? d.orgName ?? '';
  return {
    id: d.id,
    year: d.year,
    name,
    crest: club?.crest ? `/${club.crest}` : null,
    initials: club?.code ?? initials(name),
    what: d.what,
    text: d.text,
    source: sourceView(d.source),
    todo: d.todo ?? null,
    href: club ? clubHref(ds, club) : null,
  };
}

/** Featured "They dropped it" items, newest first. */
export function featuredDropped(ds: Dataset): DroppedView[] {
  return ds.dropped
    .filter((d) => d.featured)
    .sort((a, b) => b.year - a.year)
    .map((d) => droppedView(ds, d));
}

/** Dropped items for a soccer league: its own clubs first, then other soccer clubs. */
export function droppedForLeague(ds: Dataset, leagueId: string, n = 3): DroppedView[] {
  const soccer = ds.dropped.filter((d) => d.clubId && ds.byId.club.get(d.clubId)?.sportId === 'soccer');
  const own = soccer.filter((d) => ds.byId.club.get(d.clubId!)?.leagueId === leagueId);
  const rest = soccer.filter((d) => !own.includes(d));
  const byYear = (a: { year: number }, b: { year: number }) => b.year - a.year;
  return [...own.sort(byYear), ...rest.sort(byYear)].slice(0, n).map((d) => droppedView(ds, d));
}

// ---------------------------------------------------------------- other sports

export interface KnownDealRow {
  title: string;
  text: string;
  status: string;
  source: SourceView | null;
}

const sportOfItem = (ds: Dataset, clubId: string | null | undefined, leagueId: string | null | undefined) =>
  (clubId && ds.byId.club.get(clubId)?.sportId) || (leagueId && ds.byId.league.get(leagueId)?.sportId) || null;

/** Known deals and dropped deals for a sport that isn't mapped yet. */
export function knownForSport(ds: Dataset, sportId: string): KnownDealRow[] {
  const rows: KnownDealRow[] = [];
  for (const d of ds.deals) {
    if (sportOfItem(ds, d.clubId, d.leagueId) !== sportId) continue;
    const sponsor = ds.byId.sponsor.get(d.sponsorId)!;
    const club = d.clubId ? ds.byId.club.get(d.clubId) : undefined;
    const since = d.from ? ` since ${seasonStartYear(d.from)}` : '';
    const until = d.to ? ` until ${seasonEndYear(d.to)}` : '';
    const what = d.placement === 'partner' || d.placement === 'league-partner' ? `${sponsor.name} partner` : `${sponsor.name} ${placementPhrase(d.placement)}`;
    rows.push({
      title: club?.name ?? d.orgName ?? '',
      text: `${what}${since || until}.${d.value && d.note ? ` ${d.note}` : ''}`,
      status: club ? ds.byId.level.get(clubLevel(ds, club.id))!.label : 'Not rated yet',
      source: sourceView(d.source),
    });
  }
  for (const x of ds.dropped) {
    if (sportOfItem(ds, x.clubId, x.leagueId) !== sportId) continue;
    const org = x.clubId ? ds.byId.club.get(x.clubId)!.name : (x.orgName ?? '');
    const sponsor = x.sponsorId ? ds.byId.sponsor.get(x.sponsorId) : undefined;
    rows.push({
      title: sponsor ? `${org} × ${sponsor.name}` : `${org}: ${x.what}`,
      text: x.text,
      status: `Dropped ${x.year}`,
      source: sourceView(x.source),
    });
  }
  return rows;
}

// ---------------------------------------------------------------- team page

export interface SponsorCardView {
  key: string;
  sponsorId: string;
  name: string;
  tier: TierId;
  status: Sponsor['status'];
  placement: KitSponsor['placement'];
  /** 'Front of shirt', 'Sleeve · 2018–2026', 'Front of shirt · from 2026/27'. */
  placementText: string;
  /** 'paid for by the Government of Rwanda', or null when unrated / nothing found. */
  payer: string | null;
  verdict: string | null;
  claims: ClaimView[];
  money: MoneyView | null;
  side: 'front' | 'back';
  slot: 'L' | 'R' | 'T';
  hotspot: { x: number; y: number; w: number; h: number };
  source: SourceView | null;
}

function placementText(ds: Dataset, kit: Kit, ks: KitSponsor, deal: Deal | null): string {
  const base = placementLabel(ks.placement);
  if (!deal) return base;
  if (deal.from && deal.to && deal.to < ds.currentSeason) return `${base} · ${seasonStartYear(deal.from)}–${seasonEndYear(deal.to)}`;
  if (deal.from && deal.from === ds.currentSeason && kitEnd(kit) === ds.currentSeason) return `${base} · from ${seasonLabel(deal.from)}`;
  return base;
}

export function sponsorCards(ds: Dataset, kit: Kit): SponsorCardView[] {
  return kit.sponsors.map((ks) => {
    const sponsor = ds.byId.sponsor.get(ks.sponsorId)!;
    const deal = dealForKit(ds, kit, ks);
    const scored = (TIER_SCORE[sponsor.tier] ?? 0) >= 1;
    return {
      key: `${ks.sponsorId}:${ks.placement}`,
      sponsorId: sponsor.id,
      name: sponsor.name,
      tier: sponsor.tier,
      status: sponsor.status,
      placement: ks.placement,
      placementText: placementText(ds, kit, ks, deal),
      payer: scored ? payerPhrase(ds, sponsor, true) : null,
      verdict: sponsor.verdict,
      claims: claimsForSponsor(ds, sponsor),
      money: moneyView(deal),
      side: ks.side!,
      slot: ks.cardSlot!,
      hotspot: ks.hotspot!,
      source: sourceView(ks.source),
    };
  });
}

export interface TeamPeriod {
  kitId: string;
  label: string;
  kitLabel: string;
  from: string;
  to: string;
  seasons: number;
  level: LevelId;
  change: Kit['change'];
  summary: string | null;
  photos: { front: string; back: string };
  sponsors: SponsorCardView[];
}

export interface TimelineLane {
  sponsorId: string;
  name: string;
  tier: TierId;
  /** Contiguous runs of period indexes. */
  runs: { from: number; to: number }[];
}

export interface TeamPage {
  club: { id: string; name: string; crest: string | null; initials: string };
  crumbs: { label: string; href: string | null }[];
  leagueHref: string;
  periods: TeamPeriod[];
  current: number;
  lanes: TimelineLane[];
  contacts: ContactChannel[];
  contactsChecked: string | null;
}

export function teamPage(ds: Dataset, clubId: string): TeamPage | null {
  const club = ds.byId.club.get(clubId);
  if (!club || !hasTeamPage(ds, clubId)) return null;
  const kits = clubKits(ds, clubId).filter(isTeamPageKit);
  const periods: TeamPeriod[] = kits.map((k) => {
    const from = kitStart(k);
    const to = kitEnd(k);
    return {
      kitId: k.id,
      label: k.periodLabel,
      kitLabel: `${k.kitType[0].toUpperCase()}${k.kitType.slice(1)} shirt · ${seasonLabel(k.season ?? to)}`,
      from,
      to,
      seasons: seasonSpan(from, to),
      level: kitLevel(ds, k),
      change: k.change,
      summary: k.summary,
      photos: { front: `/${k.photos.front}`, back: `/${k.photos.back}` },
      sponsors: sponsorCards(ds, k),
    };
  });
  const lanes: TimelineLane[] = [];
  periods.forEach((p, i) => {
    for (const s of p.sponsors) {
      let lane = lanes.find((l) => l.sponsorId === s.sponsorId);
      if (!lane) {
        lane = { sponsorId: s.sponsorId, name: s.name, tier: s.tier, runs: [] };
        lanes.push(lane);
      }
      const last = lane.runs.at(-1);
      if (last && last.to === i) continue;
      if (last && last.to === i - 1) last.to = i;
      else lane.runs.push({ from: i, to: i });
    }
  });
  const league = club.leagueId ? ds.byId.league.get(club.leagueId) : undefined;
  const sport = ds.byId.sport.get(club.sportId);
  const contact = ds.byId.contact.get(clubId);
  return {
    club: { id: club.id, name: club.name, crest: club.crest ? `/${club.crest}` : null, initials: club.code },
    crumbs: [
      ...(sport ? [{ label: sport.label, href: sportHref(sport) }] : []),
      ...(league ? [{ label: league.name, href: leagueHref(league) }] : []),
    ],
    leagueHref: league ? leagueHref(league) : sportHref({ id: club.sportId }),
    periods,
    current: periods.length - 1,
    lanes,
    contacts: contact?.channels ?? [],
    contactsChecked: contact?.lastChecked ?? null,
  };
}
