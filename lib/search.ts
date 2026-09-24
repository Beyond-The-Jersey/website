// Search matching, shared by the build (index) and the browser (SearchBox). No data access here.
// Rules from handover/docs/06-interactions.md §1.
import type { LevelId, TierId } from './data/schema';

export type SearchType = 'club' | 'league' | 'sport' | 'sponsor';

export type SearchRating =
  { kind: 'level'; level: LevelId } | { kind: 'tier'; tier: TierId; label: string } | { kind: 'status'; text: string };

export interface SearchEntry {
  type: SearchType;
  label: string;
  description: string;
  aliases: string[];
  href: string;
  crest: string | null;
  initials: string;
  rating: SearchRating;
}

export const POPULAR = ['Arsenal', 'Premier League', 'Visit Rwanda', 'Atlético de Madrid', 'Motorsport'];

export const normalize = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

/**
 * 0: the label starts with the query
 * 1: a word in the label or any alias starts with the query
 * 2: the label contains the query
 * 3: the query has 4+ characters and the description contains it
 * Non-matches are dropped; the sort is stable, so index order breaks ties.
 */
export function scoreEntry(e: SearchEntry, q: string): number {
  const label = normalize(e.label);
  if (label.startsWith(q)) return 0;
  const words = label.split(/[\s&-]+/).concat(e.aliases.flatMap((a) => [normalize(a), ...normalize(a).split(/\s+/)]));
  if (words.some((w) => w && w.startsWith(q))) return 1;
  if (label.includes(q)) return 2;
  if (q.length >= 4 && normalize(e.description).includes(q)) return 3;
  return -1;
}

export function search(index: SearchEntry[], query: string, limit = 6): SearchEntry[] {
  const q = normalize(query);
  if (!q) return POPULAR.map((l) => index.find((e) => e.label === l)).filter((e): e is SearchEntry => Boolean(e));
  return index
    .map((e, i) => ({ e, i, s: scoreEntry(e, q) }))
    .filter((x) => x.s >= 0)
    .sort((a, b) => a.s - b.s || a.i - b.i)
    .slice(0, limit)
    .map((x) => x.e);
}
