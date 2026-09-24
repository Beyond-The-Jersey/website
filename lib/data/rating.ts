// The draft rating rule from handover/docs/05-data-model.md §4. Illustrative until the method is
// agreed: keep it one pure function so it can be swapped without touching pages.
import type { Kit, LevelId, TierId } from './schema';

export const TIER_SCORE: Record<TierId, number | null> = { unrated: null, none: 0, concern: 1, serious: 2, severe: 3 };

/** Worst first. Used to sort clubs and groups. */
export const LEVEL_ORDER: LevelId[] = ['soaked', 'stained', 'spotted', 'clean', 'not-rated'];

export const LEVEL_METER: Record<LevelId, number> = { 'not-rated': 0, clean: 1, spotted: 2, stained: 3, soaked: 4 };

export function levelForKit(kit: Pick<Kit, 'sponsors' | 'sponsorsComplete' | 'levelOverride'>, tierOf: (sponsorId: string) => TierId): LevelId {
  if (kit.levelOverride) return kit.levelOverride;
  const s = kit.sponsors.map((p) => ({ placement: p.placement, score: TIER_SCORE[tierOf(p.sponsorId)] }));
  const rated = s.filter((x): x is { placement: typeof x.placement; score: number } => x.score !== null);
  if (rated.length === 0) return 'not-rated';
  const severeFront = rated.some((x) => x.score === 3 && x.placement === 'front');
  const seriousOrWorse = rated.filter((x) => x.score >= 2).length;
  if (severeFront || seriousOrWorse >= 2) return 'soaked';
  if (rated.some((x) => x.score === 2 && x.placement === 'front') || rated.some((x) => x.score === 3 && x.placement !== 'front'))
    return 'stained';
  if (rated.some((x) => x.score >= 1)) return 'spotted';
  if (rated.length === s.length && kit.sponsorsComplete) return 'clean';
  return 'not-rated';
}

/** "Bad" in headlines means Spotted or worse. */
export const isBad = (level: LevelId) => level === 'spotted' || level === 'stained' || level === 'soaked';
export const isRated = (level: LevelId) => level !== 'not-rated';
export const compareLevels = (a: LevelId, b: LevelId) => LEVEL_ORDER.indexOf(a) - LEVEL_ORDER.indexOf(b);
