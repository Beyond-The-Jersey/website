// A validated dataset plus lookup maps. Built once per build by lib/data/index.ts.
import type {
  Claim,
  Club,
  Contact,
  Kit,
  League,
  Level,
  LevelId,
  Owner,
  RawDataset,
  Sponsor,
  Sport,
  Tier,
  TierId,
} from './schema';

export interface Dataset extends RawDataset {
  sourceName: string;
  byId: {
    sport: Map<string, Sport>;
    league: Map<string, League>;
    club: Map<string, Club>;
    owner: Map<string, Owner>;
    claim: Map<string, Claim>;
    sponsor: Map<string, Sponsor>;
    level: Map<LevelId, Level>;
    tier: Map<TierId, Tier>;
    contact: Map<string, Contact>;
  };
  /** Home kits per club, oldest first. */
  kitsByClub: Map<string, Kit[]>;
  /** The latest season any kit covers, e.g. '2026-27'. Deals ending before it are over. */
  currentSeason: string;
}

const byKey = <T, K>(list: T[], key: (x: T) => K) => new Map(list.map((x) => [key(x), x]));

/** Sort key for a kit's end: periodTo, else season, else periodFrom. */
export const kitEnd = (k: Kit) => k.periodTo ?? k.season ?? k.periodFrom ?? '';
export const kitStart = (k: Kit) => k.periodFrom ?? k.season ?? k.periodTo ?? '';

export function buildDataset(raw: RawDataset, sourceName: string): Dataset {
  const kitsByClub = new Map<string, Kit[]>();
  for (const k of raw.kits) {
    if (k.kitType !== 'home') continue;
    const list = kitsByClub.get(k.clubId) ?? [];
    list.push(k);
    kitsByClub.set(k.clubId, list);
  }
  for (const list of kitsByClub.values()) list.sort((a, b) => kitStart(a).localeCompare(kitStart(b)));
  const ends = raw.kits.map(kitEnd).filter((s) => /^\d{4}-\d{2}$/.test(s));
  const currentSeason = ends.sort().at(-1) ?? raw.meta.updatedAt.slice(0, 4);

  return {
    ...raw,
    sourceName,
    byId: {
      sport: byKey(raw.sports, (x) => x.id),
      league: byKey(raw.leagues, (x) => x.id),
      club: byKey(raw.clubs, (x) => x.id),
      owner: byKey(raw.owners, (x) => x.id),
      claim: byKey(raw.claims, (x) => x.id),
      sponsor: byKey(raw.sponsors, (x) => x.id),
      level: byKey(raw.levels, (x) => x.id),
      tier: byKey(raw.tiers, (x) => x.id),
      contact: byKey(raw.contacts, (x) => x.clubId),
    },
    kitsByClub,
    currentSeason,
  };
}
