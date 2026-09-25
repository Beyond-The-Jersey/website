// Formatting helpers shared by pages and client components. No data access here.
import type { Money, Placement, Source } from './data/schema';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** '2026-27' → '2026/27'; '2026' stays '2026'. */
export function seasonLabel(season: string): string {
  return season.replace('-', '/');
}

export function seasonStartYear(season: string): number {
  return Number(season.slice(0, 4));
}

/** '2025-26' → 2026; '2025' → 2025. */
export function seasonEndYear(season: string): number {
  const start = seasonStartYear(season);
  return season.length === 7 ? start + 1 : start;
}

/** Number of seasons from `from` to `to`, inclusive. */
export function seasonSpan(from: string, to: string): number {
  return seasonStartYear(to) - seasonStartYear(from) + 1;
}

/** '2026-08-06' → '6 Aug 2026', '2026-06' → 'Jun 2026', '2024' → '2024'. Anything else is returned as is. */
export function formatDate(date: string, precision?: 'day' | 'month' | 'year'): string {
  const m = /^(\d{4})(?:-(\d{2}))?(?:-(\d{2}))?$/.exec(date);
  if (!m) return date;
  const [, y, mo, d] = m;
  const p = precision ?? (d ? 'day' : mo ? 'month' : 'year');
  if (p === 'year' || !mo) return y;
  const month = MONTHS[Number(mo) - 1];
  if (p === 'month' || !d) return `${month} ${y}`;
  return `${Number(d)} ${month} ${y}`;
}

/** Month precision for source lines: '2026-07-15' → 'Jul 2026'. */
export function sourceDate(date: string): string {
  return /^\d{4}-\d{2}/.test(date) ? formatDate(date, 'month') : date;
}

/** 'SportsPro (citing The Athletic) · Jul 2026'. */
export function sourceLine(source: Pick<Source, 'name' | 'date'>): string {
  return `${source.name} · ${sourceDate(source.date)}`;
}

/** 'SportsPro · Jul 2026': without the '(citing …)' part, for small source lines on cards. */
export function sourceLineShort(source: Pick<Source, 'name' | 'date'>): string {
  return `${stripCiting(source.name)} · ${sourceDate(source.date)}`;
}

const SYMBOL: Record<Money['currency'], string> = { GBP: '£', EUR: '€', USD: '$' };

const amount = (n: number) => (Number.isInteger(n) ? String(n) : String(Math.round(n * 10) / 10));

function perText(per: string): string {
  if (per === 'year') return 'a year';
  if (per === 'season') return 'a season';
  if (/^\d+ years?$/.test(per)) return `over ${per}`;
  return `per ${per}`;
}

/** { main: 'Up to £20m a year', usd: 'about $27m a year' }. Values are always reported estimates. */
export function formatMoney(v: Money): { main: string; usd: string | null } {
  const value = `${SYMBOL[v.currency]}${amount(v.amount)}${v.unit}`;
  const main = `${v.upTo ? 'Up to ' : ''}${value} ${perText(v.per)}`;
  const usd =
    v.currency !== 'USD' && v.usdApprox !== null ? `about $${amount(v.usdApprox)}${v.unit} ${perText(v.per)}` : null;
  return { main, usd };
}

/** 'about $93m' (no period), or null for USD values and unknown conversions. */
export function usdApprox(v: Money): string | null {
  return v.currency !== 'USD' && v.usdApprox !== null ? `about $${amount(v.usdApprox)}${v.unit}` : null;
}

/** 'SportsPro (citing The Athletic)' → 'SportsPro'. */
export const stripCiting = (name: string) => name.replace(/\s*\(.*?\)\s*/g, ' ').trim();

const MONTHS_LONG = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

/** '2026-06' → 'June 2026'. */
export function monthYear(ym: string): string {
  const m = /^(\d{4})-(\d{2})/.exec(ym);
  return m ? `${MONTHS_LONG[Number(m[2]) - 1]} ${m[1]}` : ym;
}

const PLACEMENT: Record<Placement, [long: string, short: string]> = {
  front: ['Front of shirt', 'front'],
  back: ['Back of shirt', 'back'],
  sleeve: ['Sleeve', 'sleeve'],
  patch: ['Patch', 'patch'],
  shorts: ['Shorts', 'shorts'],
  stadium: ['Stadium', 'stadium'],
  partner: ['Partner', 'partner'],
  'league-partner': ['League partner', 'league partner'],
  'training-kit': ['Training kit', 'training kit'],
};

/** 'Front of shirt' (long) or 'front' (short). */
export function placementLabel(p: Placement, form: 'long' | 'short' = 'long'): string {
  return PLACEMENT[p][form === 'long' ? 0 : 1];
}

/** 'on the front', 'on the sleeve', 'as a partner'. For search descriptions. */
export function placementPhrase(p: Placement): string {
  if (p === 'partner' || p === 'league-partner') return 'as a partner';
  if (p === 'stadium') return 'at the stadium';
  return `on the ${PLACEMENT[p][1]}`;
}

/** Monogram for things without a crest: 'Premier League' → 'PL', 'Visit Rwanda' → 'VR', 'Bundesliga' → 'BUN'. */
export function initials(name: string): string {
  const clean = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z0-9 &]/g, ' ');
  const words = clean.split(/[\s&]+/).filter(Boolean);
  if (words.length === 1) return /^[A-Z0-9]{2,4}$/.test(words[0]) ? words[0] : words[0].slice(0, 3).toUpperCase();
  return words
    .slice(0, 3)
    .map((w) => (/^\d+$/.test(w) ? w : w[0]))
    .join('')
    .toUpperCase();
}

/** Join with commas and a final "and". */
export function listJoin(items: string[]): string {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} and ${items.at(-1)}`;
}
