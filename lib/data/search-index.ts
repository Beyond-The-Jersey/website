// Builds the search index at build time. Order matters: clubs, then leagues, sports, sponsors.
import { initials, placementPhrase, seasonEndYear, seasonLabel, seasonStartYear } from '../format';
import type { SearchEntry } from '../search';
import type { Dataset } from './dataset';
import {
  clubHref,
  clubLevel,
  clubsForSponsor,
  coverage,
  currentKit,
  isDealFuture,
  isDealOver,
  leagueHref,
  leagueSummary,
  leaguesForSport,
  sportHref,
  stateOwner,
  tierOf,
} from './derive';
import type { Club, Sponsor } from './schema';

/** 'Premier League · Visit Rwanda on the front'. Clubs without rated sponsors on their kit use their deals. */
function clubDescription(ds: Dataset, club: Club): string {
  const where = (club.leagueId && ds.byId.league.get(club.leagueId)?.name) || club.country || '';
  const parts: string[] = [];
  const kit = currentKit(ds, club.id);
  const rated = kit?.sponsors.filter((s) => tierOf(ds, s.sponsorId) !== 'unrated') ?? [];
  if (rated.length) {
    parts.push(
      rated.map((s) => `${ds.byId.sponsor.get(s.sponsorId)!.name} ${placementPhrase(s.placement)}`).join(', '),
    );
  } else {
    const deals = ds.deals.filter((d) => d.clubId === club.id && !isDealOver(ds, d));
    const future = deals.find((d) => isDealFuture(ds, d));
    const partner = deals.find((d) => !isDealFuture(ds, d) && !kit?.sponsors.some((s) => s.sponsorId === d.sponsorId));
    if (future) parts.push(`${ds.byId.sponsor.get(future.sponsorId)!.name} from ${seasonLabel(future.from!)}`);
    else if (partner)
      parts.push(
        `${ds.byId.sponsor.get(partner.sponsorId)!.name}${partner.to ? ` until ${seasonEndYear(partner.to)}` : partner.from ? ` since ${seasonStartYear(partner.from)}` : ''}`,
      );
  }
  return [where, ...parts].filter(Boolean).join(' · ');
}

/** 'Government of Rwanda · Aston Villa, Atlético, PSG, LA Clippers'. */
function sponsorDescription(ds: Dataset, sponsor: Sponsor): string {
  const owner = sponsor.ownerId ? ds.byId.owner.get(sponsor.ownerId) : undefined;
  const who = !owner
    ? 'Owner not traced yet'
    : sponsor.ownership === 'part-owned'
      ? `Part-owned by ${owner.name}`
      : (stateOwner(ds, sponsor)?.name ?? owner.name);
  const clubs = clubsForSponsor(ds, sponsor.id).map((c) => c.shortName);
  return [who, clubs.join(', ')].filter(Boolean).join(' · ');
}

export function buildSearchIndex(ds: Dataset): SearchEntry[] {
  const out: SearchEntry[] = [];
  for (const club of ds.clubs) {
    out.push({
      type: 'club',
      label: club.name,
      description: clubDescription(ds, club),
      aliases: club.aliases,
      href: clubHref(ds, club),
      crest: club.crest ? `/${club.crest}` : null,
      initials: club.code || initials(club.name),
      rating: { kind: 'level', level: clubLevel(ds, club.id) },
    });
  }
  for (const league of ds.leagues) {
    const sport = ds.byId.sport.get(league.sportId);
    const s = leagueSummary(ds, league.id);
    const mapped = s.rated > 0;
    out.push({
      type: 'league',
      label: league.name,
      description: mapped
        ? `${sport?.label} · ${s.total} clubs · ${s.rated} rated`
        : [sport?.label, league.country].filter(Boolean).join(' · '),
      aliases: league.aliases,
      href: leagueHref(league),
      crest: null,
      initials: initials(league.name),
      rating: { kind: 'status', text: mapped ? `${s.bad} of ${s.total} bad` : 'Not mapped yet' },
    });
  }
  const cov = coverage(ds);
  for (const sport of ds.sports) {
    const active = sport.status === 'active';
    out.push({
      type: 'sport',
      label: sport.label,
      description: active
        ? `${cov.ratedClubs} clubs rated in ${cov.mappedLeagues} leagues`
        : leaguesForSport(ds, sport.id)
            .map((l) => l.name)
            .join(', '),
      aliases: sport.aliases,
      href: sportHref(sport),
      crest: null,
      initials: initials(sport.label),
      rating: { kind: 'status', text: active ? `${cov.ratedClubs} rated` : 'Not mapped yet' },
    });
  }
  for (const sponsor of ds.sponsors) {
    const clubs = clubsForSponsor(ds, sponsor.id);
    const firstLeague = clubs.map((c) => c.leagueId && ds.byId.league.get(c.leagueId)).find(Boolean);
    const tier = ds.byId.tier.get(sponsor.tier)!;
    out.push({
      type: 'sponsor',
      label: sponsor.name,
      description: sponsorDescription(ds, sponsor),
      aliases: sponsor.aliases,
      href: firstLeague ? leagueHref(firstLeague) : sportHref({ id: 'soccer' }),
      crest: null,
      initials: initials(sponsor.name),
      rating: {
        kind: 'tier',
        tier: sponsor.tier,
        label: sponsor.tier === 'unrated' && sponsor.status === 'being-rated' ? 'Being rated' : tier.label,
      },
    });
  }
  return out;
}
