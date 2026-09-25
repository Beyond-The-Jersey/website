// The team page view model (handover/update-v3/UPDATE.md §5–§8). Pure functions over a Dataset;
// everything returned is plain JSON for the client component.
import { fill, numberWord, TEAM_COPY } from '../copy/team-page';
import { asset, sponsorCheckHref } from '../config';
import {
  formatDate,
  formatMoney,
  listJoin,
  monthYear,
  placementLabel,
  seasonEndYear,
  seasonLabel,
  seasonSpan,
  seasonStartYear,
  sourceDate,
  stripCiting,
  usdApprox,
} from '../format';
import type { MessageSponsor } from '../messages';
import type { Dataset } from './dataset';
import { kitEnd, kitStart } from './dataset';
import {
  clubKits,
  currentKit,
  dealForKit,
  hasTeamPage,
  isTeamPageKit,
  kitLevel,
  leagueHref,
  sportHref,
} from './derive';
import { compareLevels, TIER_SCORE } from './rating';
import type { Club, Deal, Hotspot, Kit, KitSponsor, LevelId, Placement, Source, Sponsor, TierId } from './schema';

const C = TEAM_COPY;

/** The four levels on the rating scale, best first. */
export const SCALE_LEVELS = ['clean', 'spotted', 'stained', 'soaked'] as const;
export type ScaleLevel = (typeof SCALE_LEVELS)[number];

const PLACEMENT_ORDER: Placement[] = [
  'front',
  'back',
  'sleeve',
  'patch',
  'shorts',
  'training-kit',
  'stadium',
  'partner',
  'league-partner',
];

const score = (tier: TierId) => TIER_SCORE[tier];
/** Concern or worse: the sponsors that make a shirt Spotted or worse. */
export const isFlagged = (tier: TierId) => (score(tier) ?? 0) >= 1;

// ---------------------------------------------------------------- small pieces

export interface SourceRef {
  /** 'Human Rights Watch, Jul 2024' */
  label: string;
  url: string | null;
}

export const sourceRef = (s: Source | null | undefined): SourceRef | null =>
  s ? { label: `${stripCiting(s.name)}, ${sourceDate(s.date)}`, url: s.url } : null;

export interface MoneyFact {
  /** 'Up to £70m a year', or 'Value not disclosed'. */
  main: string;
  /** 'about $93m · SportsPro · deal runs to 2033' */
  sub: string | null;
}

export function moneyFact(ds: Dataset, deal: Deal | null): MoneyFact {
  if (!deal?.value) return { main: C.sponsors.valueUnknown, sub: null };
  const parts = [usdApprox(deal.value)];
  if (deal.source) parts.push(deal.source.short ?? stripCiting(deal.source.name));
  if (deal.to && deal.to > ds.currentSeason) parts.push(fill(C.sponsors.dealRunsTo, { year: seasonEndYear(deal.to) }));
  const sub = parts.filter(Boolean).join(' · ');
  return { main: formatMoney(deal.value).main, sub: sub || null };
}

const ownerName = (ds: Dataset, sponsor: Sponsor) =>
  sponsor.ownerId ? (ds.byId.owner.get(sponsor.ownerId)?.name ?? null) : null;

/** 'owned by', 'paid for by' or, for a sponsor a state only part-owns, 'part-owned by'. */
export const ownerVerb = (sponsor: Sponsor) =>
  sponsor.ownerVerb ?? (sponsor.ownership === 'part-owned' ? 'part-owned by' : 'owned by');

// ---------------------------------------------------------------- sponsor rows

export interface SponsorRowView {
  key: string;
  sponsorId: string;
  /** 1…n, matching the markers on the shirt. */
  number: number;
  name: string;
  tier: TierId;
  /** Anything but 'unrated'. Rated markers are solid, unrated ones dashed. */
  rated: boolean;
  placement: Placement;
  /** 'Front of shirt' */
  placementText: string;
  side: 'front' | 'back' | null;
  hotspot: Hotspot | null;
  /** The direct owner, e.g. 'Government of Dubai'. Null for unrated sponsors ('Not checked yet'). */
  payer: string | null;
  money: MoneyFact;
  ownedThrough: string | null;
  /** The first two claims. */
  evidence: { text: string; source: SourceRef | null }[];
  verdict: string | null;
}

export interface DepartedRowView {
  key: string;
  sponsorId: string;
  name: string;
  /** 'Sleeve, 2018–2026' */
  placementText: string;
  payer: string | null;
  /** 'Left in 2026' */
  leftChip: string;
  money: MoneyFact;
  /** 'Gone since June 2026, after eight seasons.' */
  goneLine: string;
  /** 'That’s why Arsenal is Stained now, not Soaked.' Only when the shirt got better. */
  whyLine: string | null;
}

const byWorstThenPlacement = (a: { tier: TierId; placement: Placement }, b: typeof a) => {
  const sa = score(a.tier);
  const sb = score(b.tier);
  if (sa !== sb) return sa === null ? 1 : sb === null ? -1 : sb - sa;
  return PLACEMENT_ORDER.indexOf(a.placement) - PLACEMENT_ORDER.indexOf(b.placement);
};

function row(ds: Dataset, kit: Kit, ks: KitSponsor, number: number): SponsorRowView {
  const sponsor = ds.byId.sponsor.get(ks.sponsorId)!;
  const owner = sponsor.ownerId ? ds.byId.owner.get(sponsor.ownerId) : undefined;
  const rated = sponsor.tier !== 'unrated';
  return {
    key: `${ks.sponsorId}-${ks.placement}`,
    sponsorId: sponsor.id,
    number,
    name: sponsor.name,
    tier: sponsor.tier,
    rated,
    placement: ks.placement,
    placementText: placementLabel(ks.placement),
    side: ks.side ?? null,
    hotspot: ks.hotspot ?? null,
    payer: rated ? (owner?.name ?? null) : null,
    money: moneyFact(ds, dealForKit(ds, kit, ks)),
    ownedThrough: rated ? (owner?.via ?? null) : null,
    evidence: sponsor.claimIds.slice(0, 2).flatMap((id) => {
      const c = ds.byId.claim.get(id);
      return c ? [{ text: c.text, source: sourceRef(c.source) }] : [];
    }),
    verdict: sponsor.verdict,
  };
}

function seasonsText(n: number): string {
  return `${numberWord(n)} season${n === 1 ? '' : 's'}`;
}

function departedRow(
  ds: Dataset,
  prev: Kit,
  ks: KitSponsor,
  why: { club: string; level: LevelId; prevLevel: LevelId; isPast: boolean },
): DepartedRowView {
  const sponsor = ds.byId.sponsor.get(ks.sponsorId)!;
  const deal = dealForKit(ds, prev, ks);
  const from = deal?.from ?? kitStart(prev);
  const to = deal?.to ?? kitEnd(prev);
  const endYear = deal?.endedOn ? Number(deal.endedOn.slice(0, 4)) : seasonEndYear(to);
  const since = deal?.endedOn ? monthYear(deal.endedOn) : fill(C.sponsors.departedSince, { season: seasonLabel(to) });
  const better = compareLevels(why.prevLevel, why.level) < 0;
  const label = (l: LevelId) => ds.byId.level.get(l)?.label ?? l;
  return {
    key: `gone-${ks.sponsorId}`,
    sponsorId: sponsor.id,
    name: sponsor.name,
    placementText: `${placementLabel(ks.placement)}, ${seasonStartYear(from)}–${endYear}`,
    payer: ownerName(ds, sponsor),
    leftChip: fill(C.sponsors.leftChip, { year: endYear }),
    money: moneyFact(ds, deal),
    goneLine: fill(C.sponsors.departedLine, { monthYear: since, seasons: seasonsText(seasonSpan(from, to)) }),
    whyLine: better
      ? fill(why.isPast ? C.sponsors.departedWhyPast : C.sponsors.departedWhy, {
          club: why.club,
          level: label(why.level),
          prevLevel: label(why.prevLevel),
        })
      : null,
  };
}

/**
 * The rows for a kit: its sponsors worst first (unrated last, ties by placement: front, back,
 * sleeve, shorts), numbered 1…n. Then the sponsors of the previous kit that aren't on this one,
 * but only those rated concern or worse: leaving is good news only then.
 */
export function sponsorRows(
  ds: Dataset,
  kit: Kit,
  prevKit: Kit | null,
  opts: { club: string; isPast: boolean },
): { rows: SponsorRowView[]; departed: DepartedRowView[] } {
  const tierOf = (ks: KitSponsor) => ds.byId.sponsor.get(ks.sponsorId)?.tier ?? 'unrated';
  const sorted = [...kit.sponsors].sort((a, b) =>
    byWorstThenPlacement({ tier: tierOf(a), placement: a.placement }, { tier: tierOf(b), placement: b.placement }),
  );
  const rows = sorted.map((ks, i) => row(ds, kit, ks, i + 1));
  const onKit = new Set(kit.sponsors.map((s) => s.sponsorId));
  const departed = prevKit
    ? prevKit.sponsors
        .filter((ks) => !onKit.has(ks.sponsorId) && isFlagged(tierOf(ks)))
        .sort((a, b) =>
          byWorstThenPlacement(
            { tier: tierOf(a), placement: a.placement },
            { tier: tierOf(b), placement: b.placement },
          ),
        )
        .map((ks) =>
          departedRow(ds, prevKit, ks, {
            club: opts.club,
            level: kitLevel(ds, kit),
            prevLevel: kitLevel(ds, prevKit),
            isPast: opts.isPast,
          }),
        )
    : [];
  return { rows, departed };
}

// ---------------------------------------------------------------- headline and why boxes

export interface HeadlineView {
  /** Text before and after the level word; `level` is null when the sentence has no level word. */
  before: string;
  level: LevelId | null;
  after: string;
  /** The whole sentence as plain text (share text, page description). */
  text: string;
}

function splitLevel(ds: Dataset, template: string, level: LevelId): HeadlineView {
  const word = ds.byId.level.get(level)?.label ?? level;
  const i = template.indexOf('{level}');
  if (i < 0) return { before: template, level: null, after: '', text: template };
  const before = template.slice(0, i);
  const after = template.slice(i + '{level}'.length);
  return { before, level, after, text: `${before}${word}${after}` };
}

/**
 * kit.headline when the data has one. Otherwise built from the "driving" sponsor: the highest
 * tier, front winning ties (the first row). Past kits say "was".
 */
export function headlineFor(ds: Dataset, kit: Kit, rows: SponsorRowView[], isPast: boolean): HeadlineView {
  const level = kitLevel(ds, kit);
  if (kit.headline) return splitLevel(ds, kit.headline, level);
  const is = isPast ? 'was' : 'is';
  if (level === 'not-rated') {
    const n = rows.filter((r) => !r.rated).length;
    const text = n === 1 ? C.headline.notRatedOne : fill(C.headline.notRated, { n });
    return { before: text, level: null, after: '', text };
  }
  if (level === 'clean') return splitLevel(ds, fill(C.headline.clean, { is }), level);
  const lead = rows[0];
  const sponsor = ds.byId.sponsor.get(lead.sponsorId)!;
  const owner = ownerName(ds, sponsor);
  const template = owner ? C.headline.driven : C.headline.drivenNoOwner;
  return splitLevel(
    ds,
    fill(template, {
      is,
      placement: placementLabel(lead.placement, 'short'),
      sponsor: lead.name,
      ownerVerb: ownerVerb(sponsor),
      owner: owner ?? '',
    }),
    level,
  );
}

export interface WhyBoxView {
  sponsorId: string;
  text: string;
  source: SourceRef | null;
  status: 'draft' | 'reviewed';
}

/**
 * One "Why is that a problem?" box per sponsor rated serious or severe that has a why text, in
 * list order, at most two. Never generated: `missing` lists the sponsors that need one.
 */
export function whyBoxes(ds: Dataset, rows: SponsorRowView[]): { boxes: WhyBoxView[]; missing: string[] } {
  const serious = rows.filter((r) => (score(r.tier) ?? 0) >= 2);
  const boxes: WhyBoxView[] = [];
  const missing: string[] = [];
  for (const r of serious) {
    const why = ds.byId.sponsor.get(r.sponsorId)?.why;
    if (!why) {
      missing.push(r.name);
      continue;
    }
    const claim = ds.byId.claim.get(why.claimIds[0]);
    boxes.push({ sponsorId: r.sponsorId, text: why.text, source: sourceRef(claim?.source), status: why.status });
  }
  return { boxes: boxes.slice(0, 2), missing };
}

// ---------------------------------------------------------------- rating scale

export interface ScalePeriod {
  level: LevelId;
  label: string;
  isCurrent: boolean;
}

/**
 * The note under a level in the scale tooltip: '{club} is here' for the kit on screen, '{club} was
 * here in {period}' for a level the club had in another period (the most recent one), else null.
 * On an old shirt, the level of today's shirt reads '{club} is here now'.
 */
export function scaleNote(club: string, level: LevelId, periods: ScalePeriod[], onScreen: number): string | null {
  const shown = periods[onScreen];
  if (shown.level === level)
    return shown.isCurrent ? fill(C.scale.noteHere, { club }) : fill(C.scale.noteWas, { club, period: shown.label });
  for (let i = periods.length - 1; i >= 0; i--) {
    if (i === onScreen || periods[i].level !== level) continue;
    return periods[i].isCurrent
      ? fill(C.scale.noteNow, { club })
      : fill(C.scale.noteWas, { club, period: periods[i].label });
  }
  return null;
}

// ---------------------------------------------------------------- markers on the shirt

export interface Box {
  left: number;
  top: number;
  width: number;
  height: number;
}

/**
 * Where a numbered marker and its invisible hit area go on a photo W×H px (UPDATE.md §5.8).
 * Wide logos (w ≥ 0.15): the hit area is the logo box and the marker overlaps its left edge.
 * Small logos: a hit area of at least 38px, and the marker centred above the logo.
 */
export function markerPosition(
  h: Hotspot,
  W: number,
  H: number,
  rated: boolean,
): { size: number; left: number; top: number; hit: Box } {
  const size = (rated ? 0.1 : 0.092) * W;
  const wide = h.w >= 0.15;
  let hit: Box;
  let left: number;
  let top: number;
  if (wide) {
    hit = { left: (h.x - h.w / 2) * W, top: (h.y - h.h / 2) * H, width: h.w * W, height: h.h * H };
    left = (h.x - h.w / 2) * W - 0.079 * W;
    top = h.y * H - size / 2;
  } else {
    const width = Math.max(38, h.w * W + 12);
    const height = Math.max(38, h.h * H + 12);
    hit = { left: h.x * W - width / 2, top: h.y * H - height / 2, width, height };
    left = h.x * W - size / 2;
    top = h.y * H - height / 2 - 40 * (W / 480);
  }
  const clamp = (v: number, max: number) => Math.min(Math.max(v, 0), max);
  return { size, left: clamp(left, W - size), top: clamp(top, H - size), hit };
}

// ---------------------------------------------------------------- "What you can do"

/**
 * '{Sponsor} left {Club}’s {placement} in {year}, and Bayern Munich, Schalke 04 and Man Utd have
 * all dropped sponsors before', from the featured "They dropped it" items. Other clubs only count
 * when their drop was in an earlier year than the current season. Null when there are none.
 */
export function actionIntroExamples(ds: Dataset, club: Club): string | null {
  const featured = ds.dropped.filter((d) => d.featured && d.clubId).sort((a, b) => b.year - a.year);
  const own = featured.find((d) => d.clubId === club.id && d.sponsorId);
  const thisYear = seasonStartYear(ds.currentSeason);
  const others: string[] = [];
  for (const d of featured) {
    if (d.clubId === club.id || d.year >= thisYear) continue;
    const name = ds.byId.club.get(d.clubId!)?.shortName;
    if (name && !others.includes(name)) others.push(name);
    if (others.length === 3) break;
  }
  let ownText: string | null = null;
  if (own) {
    const sponsor = ds.byId.sponsor.get(own.sponsorId!)!.name;
    const deal = ds.deals
      .filter((x) => x.clubId === club.id && x.sponsorId === own.sponsorId)
      .sort((a, b) => (b.to ?? '9999').localeCompare(a.to ?? '9999'))[0];
    ownText = deal
      ? `${sponsor} left ${club.shortName}’s ${placementLabel(deal.placement, 'short')} in ${own.year}`
      : `${sponsor} left ${club.shortName} in ${own.year}`;
  }
  const othersText = others.length
    ? `${listJoin(others)} ${others.length === 1 ? 'has dropped a sponsor' : 'have all dropped sponsors'} before`
    : null;
  if (ownText && othersText) return `${ownText}, and ${othersText}`;
  return ownText ?? othersText;
}

export interface ClubContactView {
  email: string | null;
  url: string | null;
}

/** A checked address for "Tell {club}": clubs.json → contact, else the sourced channels in contacts.json. */
export function contactFor(ds: Dataset, club: Club): ClubContactView {
  if (club.contact) return { email: club.contact.email ?? null, url: club.contact.url ?? null };
  const channels = ds.byId.contact.get(club.id)?.channels ?? [];
  return {
    email: channels.find((c) => c.type === 'email')?.value ?? null,
    url: channels.find((c) => c.type === 'contact-form' || c.type === 'website')?.value ?? null,
  };
}

export interface RaiseItem {
  sponsorId: string;
  name: string;
  tier: TierId;
  /** Concern or worse: can be ticked, and is by default. Unrated sponsors are shown disabled. */
  flagged: boolean;
  message: MessageSponsor;
}

export interface ActView {
  examples: string | null;
  raise: RaiseItem[];
  contact: ClubContactView;
  /** The first unrated sponsor on today's shirt, for "Help check {sponsor}". */
  check: { name: string; href: string } | null;
  share: { title: string; text: string };
}

// ---------------------------------------------------------------- the page

export interface TeamPeriodView {
  kitId: string;
  /** The ?season= value: the period's first season, e.g. '2018-19'. */
  key: string;
  from: string;
  to: string;
  /** '2018/19 – 2025/26' */
  label: string;
  /** 'Home 2018/19 – 2025/26' */
  kitLabel: string;
  /** 'Home' */
  kitType: string;
  isCurrent: boolean;
  level: LevelId;
  headline: HeadlineView;
  why: WhyBoxView[];
  /** Sponsors rated serious or severe without a why text (shown as a TODO in development). */
  whyMissing: string[];
  change: Kit['change'];
  shortLine: string;
  photos: { front: string; back: string };
  rows: SponsorRowView[];
  departed: DepartedRowView[];
  backHasSponsor: boolean;
  /** Tooltip notes on the rating scale while this period is on screen. */
  notes: Record<ScaleLevel, string | null>;
}

export interface TeamPageView {
  club: { id: string; name: string; shortName: string; crest: string | null; initials: string; league: string | null };
  crumbs: { label: string; href: string | null }[];
  /** Oldest first. */
  periods: TeamPeriodView[];
  current: number;
  /** The tooltip text per level. */
  levelPlain: Record<ScaleLevel, string>;
  act: ActView;
  factSheetHref: string;
}

function shortLineFor(ds: Dataset, kit: Kit): string {
  if (kit.shortLine) return kit.shortLine;
  return kit.sponsors
    .map((s) => `${ds.byId.sponsor.get(s.sponsorId)?.name} on the ${placementLabel(s.placement, 'short')}`)
    .join(', ');
}

const capitalise = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function teamPage(ds: Dataset, clubId: string): TeamPageView | null {
  const club = ds.byId.club.get(clubId);
  if (!club || !hasTeamPage(ds, clubId)) return null;
  const all = clubKits(ds, clubId);
  const now = currentKit(ds, clubId)!;
  const kits = all.filter(isTeamPageKit);
  const scalePeriods: ScalePeriod[] = kits.map((k) => ({
    level: kitLevel(ds, k),
    label: k.periodLabel,
    isCurrent: k === now,
  }));
  const periods: TeamPeriodView[] = kits.map((k, i) => {
    const isPast = k !== now;
    const prev = all[all.indexOf(k) - 1] ?? null;
    const { rows, departed } = sponsorRows(ds, k, prev, { club: club.shortName, isPast });
    const why = whyBoxes(ds, rows);
    const from = kitStart(k);
    return {
      kitId: k.id,
      key: from,
      from,
      to: kitEnd(k),
      label: k.periodLabel,
      kitLabel: `${capitalise(k.kitType)} ${k.periodLabel}`,
      kitType: capitalise(k.kitType),
      isCurrent: !isPast,
      level: scalePeriods[i].level,
      headline: headlineFor(ds, k, rows, isPast),
      why: why.boxes,
      whyMissing: why.missing,
      change: k.change,
      shortLine: shortLineFor(ds, k),
      photos: { front: asset(k.photos.front!), back: asset(k.photos.back!) },
      rows,
      departed,
      backHasSponsor: rows.some((r) => r.side === 'back' && r.hotspot),
      notes: Object.fromEntries(SCALE_LEVELS.map((l) => [l, scaleNote(club.shortName, l, scalePeriods, i)])) as Record<
        ScaleLevel,
        string | null
      >,
    };
  });
  const current = periods.length - 1;
  const today = periods[current];
  const raise: RaiseItem[] = today.rows
    .filter((r) => r.tier !== 'none')
    .map((r) => {
      const sponsor = ds.byId.sponsor.get(r.sponsorId)!;
      return {
        sponsorId: r.sponsorId,
        name: r.name,
        tier: r.tier,
        flagged: isFlagged(r.tier),
        message: {
          name: r.name,
          placement: placementLabel(r.placement, 'short'),
          ownerVerb: ownerVerb(sponsor),
          owner: ownerName(ds, sponsor),
          messageLine: sponsor.why?.messageLine ?? null,
        },
      };
    });
  const unrated = today.rows.find((r) => !r.rated);
  const league = club.leagueId ? ds.byId.league.get(club.leagueId) : undefined;
  const sport = ds.byId.sport.get(club.sportId);
  return {
    club: {
      id: club.id,
      name: club.name,
      shortName: club.shortName,
      crest: club.crest ? asset(club.crest) : null,
      initials: club.code,
      league: league?.name ?? null,
    },
    crumbs: [
      ...(sport ? [{ label: sport.label, href: sportHref(sport) }] : []),
      ...(league ? [{ label: league.name, href: leagueHref(league) }] : []),
    ],
    periods,
    current,
    levelPlain: Object.fromEntries(
      SCALE_LEVELS.map((l) => {
        const lv = ds.byId.level.get(l);
        return [l, lv?.plain ?? lv?.definition ?? ''];
      }),
    ) as Record<ScaleLevel, string>,
    act: {
      examples: actionIntroExamples(ds, club),
      raise,
      contact: contactFor(ds, club),
      check: unrated ? { name: unrated.name, href: sponsorCheckHref(unrated.name) } : null,
      share: {
        title: fill(C.act.shareTitle, {
          club: club.shortName,
          level: ds.byId.level.get(today.level)?.label ?? today.level,
        }),
        text: today.headline.text,
      },
    },
    factSheetHref: `/clubs/${club.id}/fact-sheet/`,
  };
}

// ---------------------------------------------------------------- fact sheet

export interface FactSheetSponsor {
  sponsorId: string;
  name: string;
  tierLabel: string;
  tier: TierId;
  /** 'Front of shirt, 2026/27' or 'Sleeve, 2018/19 – 2025/26' */
  where: string;
  onTodaysShirt: boolean;
  ownerChain: string[];
  ownedThrough: string | null;
  verdict: string | null;
  money: MoneyFact;
  moneySource: { name: string; date: string; url: string | null } | null;
  claims: { id: string; text: string; source: { name: string; date: string; url: string | null } | null }[];
  why: string | null;
}

export interface FactSheetView {
  club: { id: string; name: string; league: string | null };
  level: LevelId;
  checked: string;
  kitLabel: string;
  headline: string;
  why: string[];
  sponsors: FactSheetSponsor[];
  pageHref: string;
}

/** Every sponsor on any of the club's team-page shirts, today's first, with every claim and source. */
export function factSheet(ds: Dataset, clubId: string): FactSheetView | null {
  const page = teamPage(ds, clubId);
  if (!page) return null;
  const kits = clubKits(ds, clubId).filter(isTeamPageKit);
  const today = page.periods[page.current];
  const seen = new Set<string>();
  const sponsors: FactSheetSponsor[] = [];
  for (const k of [...kits].reverse()) {
    // In list order (worst first), like the numbered rows on the page.
    const order = sponsorRows(ds, k, null, { club: '', isPast: false }).rows.map((r) => r.key);
    const sorted = [...k.sponsors].sort(
      (a, b) => order.indexOf(`${a.sponsorId}-${a.placement}`) - order.indexOf(`${b.sponsorId}-${b.placement}`),
    );
    for (const ks of sorted) {
      if (seen.has(ks.sponsorId)) continue;
      seen.add(ks.sponsorId);
      const sp = ds.byId.sponsor.get(ks.sponsorId)!;
      const chain: string[] = [];
      for (let o = sp.ownerId ? ds.byId.owner.get(sp.ownerId) : undefined; o && !chain.includes(o.name);) {
        chain.push(o.name);
        o = o.parentId ? ds.byId.owner.get(o.parentId) : undefined;
      }
      const deal = dealForKit(ds, k, ks);
      sponsors.push({
        sponsorId: sp.id,
        name: sp.name,
        tier: sp.tier,
        tierLabel: ds.byId.tier.get(sp.tier)?.label ?? sp.tier,
        where: `${placementLabel(ks.placement)}, ${k.periodLabel}`,
        onTodaysShirt: k.id === today.kitId,
        ownerChain: chain,
        ownedThrough: sp.ownerId ? (ds.byId.owner.get(sp.ownerId)?.via ?? null) : null,
        verdict: sp.verdict,
        money: moneyFact(ds, deal),
        moneySource:
          deal?.value && deal.source ? { name: deal.source.name, date: deal.source.date, url: deal.source.url } : null,
        claims: sp.claimIds.flatMap((id) => {
          const c = ds.byId.claim.get(id);
          return c
            ? [
                {
                  id: c.id,
                  text: c.text,
                  source: c.source ? { name: c.source.name, date: c.source.date, url: c.source.url } : null,
                },
              ]
            : [];
        }),
        why: sp.why?.text ?? null,
      });
    }
  }
  const club = ds.byId.club.get(clubId)!;
  return {
    club: { id: club.id, name: club.name, league: page.club.league },
    level: today.level,
    checked: formatDate(ds.meta.updatedAt, 'day'),
    kitLabel: today.kitLabel,
    headline: today.headline.text,
    why: today.why.map((w) => w.text),
    sponsors,
    pageHref: `/clubs/${club.id}/`,
  };
}
