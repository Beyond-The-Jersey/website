import Link from 'next/link';
import { ClubStrip, DroppedCard, SectionHeading, SourceNote } from '@/components/Cards';
import { LevelMeter } from '@/components/Level';
import { SiteFooter, SiteHeader } from '@/components/SiteChrome';
import type { Dataset } from '@/lib/data';
import {
  droppedForLeague,
  featuredDropped,
  knownForSport,
  leagueHref,
  leagueSummary,
  leaguesForSport,
  sportHref,
  type ClubSummary,
  type LeagueSummary,
} from '@/lib/data/derive';
import type { LevelId } from '@/lib/data/schema';
import { buildSearchIndex } from '@/lib/data/search-index';
import { LEVELS } from '@/lib/levels';
import s from './Overview.module.css';

const RATED: LevelId[] = ['soaked', 'stained', 'spotted', 'clean'];

/** Titles for sports that aren't mapped yet (design copy). */
const SPORT_TITLES: Record<string, string> = {
  basketball: 'Basketball shirts are next',
  'american-football': 'NFL is next',
  motorsport: 'Motorsport: cars, not shirts',
  events: 'Tournaments and governing bodies',
};

function headline(l: LeagueSummary): string {
  const base = `${l.name}: ${l.bad} of ${l.total} home shirts carry a sponsor we rate as bad.`;
  if (!l.worst) return base;
  return `${base} ${l.worst.n} ${l.worst.n === 1 ? 'is' : 'are'} ${LEVELS[l.worst.level].word.toLowerCase()}.`;
}

function countLine(l: LeagueSummary): string {
  const parts = RATED.filter((lv) => l.counts[lv] > 0).map((lv) => `${l.counts[lv]} ${LEVELS[lv].word.toLowerCase()}`);
  if (l.counts['not-rated']) parts.push(`${l.counts['not-rated']} not rated yet`);
  return parts.join(' · ');
}

function ClubCard({ c }: { c: ClubSummary }) {
  const lv = LEVELS[c.level];
  const body = (
    <>
      <div className={s.media}>
        {c.crest ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={c.crest} alt={`${c.name} crest`} width={130} height={130} className={s.mediaCrest} />
        ) : (
          <span className={s.mediaInitials}>{c.initials}</span>
        )}
      </div>
      <div className={s.band} style={{ background: lv.band, color: lv.bandText }}>
        <LevelMeter level={c.level} size="m" on={lv.bandText} off={lv.bandOff} />
        <span className={s.bandWord}>{lv.word}</span>
        <span className={s.bandRank}>{lv.rank.toUpperCase()}</span>
      </div>
      <div className={s.details}>
        <span className={s.cardName}>{c.name}</span>
        <span className={s.sponsors} style={{ color: lv.text }}>
          {c.sponsorLine}
        </span>
        {c.payerLine && <span className={s.payer}>{c.payerLine}</span>}
      </div>
    </>
  );
  return (
    <Link href={c.href} className={`${s.card} ${s.cardLink}`} style={{ borderColor: lv.border }}>
      {body}
    </Link>
  );
}

/** Clubs nobody has rated yet: crest tiles, each linking to the club's page. */
function UnratedTiles({ league, clubs }: { league: LeagueSummary; clubs: LeagueSummary['clubs'] }) {
  const n = clubs.length + league.unknown;
  if (n === 0) return null;
  return (
    <section className={s.unrated} aria-label="Not rated yet">
      <div className={s.unratedHead}>
        <div className={s.groupTitle}>
          <LevelMeter level="not-rated" size="l" />
          <h2 className={s.unratedWord}>Not rated yet</h2>
          <span className={s.unratedCount}>
            {n} {n === 1 ? 'club' : 'clubs'}
          </span>
        </div>
        <span className={s.groupDesc}>We haven’t checked who is behind these sponsors yet.</span>
      </div>
      <div className={s.tiles}>
        {clubs.map((c) => (
          <Link key={c.id} href={c.href} className={`${s.tileItem} ${s.tileLink}`}>
            <span className={s.tile}>
              {c.crest ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={c.crest} alt="" width={76} height={76} />
              ) : (
                <span className={s.tileInitials}>{c.initials}</span>
              )}
            </span>
            <span className={s.tileName}>{c.name}</span>
          </Link>
        ))}
        {league.unknown > 0 && (
          <div className={s.more}>
            <span className={s.moreN}>+{league.unknown}</span>
            <span className={s.moreText}>more {league.name} clubs, not rated yet</span>
          </div>
        )}
      </div>
    </section>
  );
}

function LeagueContent({ league, desc }: { league: LeagueSummary; desc: Record<LevelId, string> }) {
  const unrated = league.clubs.filter((c) => !LEVELS[c.level].rated);
  if (league.rated === 0) {
    const text = league.notes.length
      ? `Already on file: ${league.notes.join(' ')}`
      : `We haven’t mapped ${league.name} shirts yet. Tell us which club to start with.`;
    return (
      <div className={s.content}>
        <div className={s.panel}>
          <h2 className={s.panelTitle}>
            {league.name} is {league.notes.length ? 'next' : 'coming'}
          </h2>
          <p className={s.panelText}>{text}</p>
          <Link href="/#contribute" className={s.panelLink}>
            Help map it →
          </Link>
        </div>
        <UnratedTiles league={league} clubs={unrated} />
      </div>
    );
  }
  const groups = RATED.map((lv) => ({ lv, clubs: league.clubs.filter((c) => c.level === lv) })).filter(
    (g) => g.clubs.length,
  );
  return (
    <div className={s.content}>
      <section aria-label="Every club at a glance" className={s.glance}>
        <div className={s.glanceTop}>
          <span className={s.glanceHead}>{headline(league)}</span>
          <span className={s.glanceCounts}>{countLine(league)}</span>
        </div>
        <ClubStrip league={league} crest={30} bar={22} circle={26} linkSlots />
      </section>

      <div className={s.groups}>
        {groups.map(({ lv, clubs }) => {
          const ui = LEVELS[lv];
          return (
            <section key={lv} className={s.group} style={{ ['--n' as string]: clubs.length }} aria-label={ui.word}>
              <div className={s.groupHead} style={{ borderColor: ui.border }}>
                <div className={s.groupTitle}>
                  <LevelMeter level={lv} size="l" on={ui.text} />
                  <h2 className={s.groupWord} style={{ color: ui.text }}>
                    {ui.word}
                  </h2>
                </div>
                <span className={s.groupCount} style={{ color: ui.text }}>
                  {ui.rank} · {clubs.length} {clubs.length === 1 ? 'club' : 'clubs'}
                </span>
                <span className={s.groupDesc}>{desc[lv]}</span>
              </div>
              <div className={s.cards}>
                {clubs.map((c) => (
                  <ClubCard key={c.id} c={c} />
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <UnratedTiles league={league} clubs={unrated} />
    </div>
  );
}

export function OverviewPage({ ds, sportId, leagueId }: { ds: Dataset; sportId: string; leagueId?: string }) {
  // Group descriptions come from levels.json definitions.
  const desc = Object.fromEntries(ds.levels.map((l) => [l.id, l.definition])) as Record<LevelId, string>;
  const index = buildSearchIndex(ds);
  const sport = ds.byId.sport.get(sportId)!;
  const leagues = leaguesForSport(ds, sportId);
  const league = leagueId ? leagueSummary(ds, leagueId) : null;
  const dropped = league ? droppedForLeague(ds, league.id, 3) : featuredDropped(ds).slice(0, 3);
  const rows = sportId === 'soccer' ? [] : knownForSport(ds, sportId);
  // Other sports: every league with clubs gets the same view as a soccer league, so every club is one click away.
  const sportLeagues =
    sportId === 'soccer'
      ? []
      : leagues.filter((l) => ds.clubs.some((c) => c.leagueId === l.id)).map((l) => leagueSummary(ds, l.id));

  return (
    <>
      <SiteHeader variant="overview" searchIndex={index} />
      <nav aria-label="Sports" className={s.tabs}>
        <div className={s.tabsInner}>
          {ds.sports.map((sp) => (
            <Link
              key={sp.id}
              href={sportHref(sp)}
              className={`${s.tab} ${sp.id === sportId ? s.tabOn : ''}`}
              aria-current={sp.id === sportId ? 'page' : undefined}
            >
              {sp.label}
            </Link>
          ))}
        </div>
      </nav>
      <main className={s.main}>
        <section className={s.hero}>
          <h1 className={s.h1}>What’s on your club’s shirt?</h1>
          <p className={s.lede}>
            Every sponsor, traced back to who really pays. The more blood behind the money, the higher the blood level.
          </p>
        </section>

        {sportId === 'soccer' && league ? (
          <>
            <nav aria-label="League" className={s.chips}>
              {leagues.map((l) => (
                <Link
                  key={l.id}
                  href={leagueHref(l)}
                  className={`${s.chip} ${l.id === league.id ? s.chipOn : ''}`}
                  aria-current={l.id === league.id ? 'page' : undefined}
                >
                  {l.name}
                </Link>
              ))}
            </nav>
            <LeagueContent league={league} desc={desc} />
          </>
        ) : (
          <>
            {sportLeagues.map((l) => (
              <section key={l.id} className={s.sportLeague} aria-labelledby={`league-${l.id}`}>
                <h2 id={`league-${l.id}`} className={s.sportLeagueTitle}>
                  {l.name}
                </h2>
                <LeagueContent league={l} desc={desc} />
              </section>
            ))}
            <div className={s.sport}>
              <h2 className={s.panelTitle}>
                {sportLeagues.length ? 'Deals we know about' : (SPORT_TITLES[sport.id] ?? `${sport.label} is next`)}
              </h2>
              <div className={s.rows}>
                {rows.map((r) => (
                  <div key={r.key} className={s.row}>
                    <span className={s.rowTitle}>
                      {r.href ? (
                        <Link href={r.href} className={s.rowLink}>
                          {r.title}
                        </Link>
                      ) : (
                        r.title
                      )}
                    </span>
                    <span className={s.rowText}>
                      {r.text} <SourceNote source={r.source} />
                    </span>
                    <span className={s.rowStatus}>{r.status}</span>
                  </div>
                ))}
                {rows.length === 0 && (
                  <div className={s.row}>
                    <span className={s.rowText}>Nothing on file yet. Tell us where to start.</span>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {dropped.length > 0 && (
          <section className={s.dropped} aria-labelledby="overview-dropped">
            <SectionHeading id="overview-dropped" title="They dropped it" sub="When fans find out, deals end." />
            <div className={s.droppedGrid}>
              {dropped.map((d) => (
                <DroppedCard key={d.id} d={d} />
              ))}
            </div>
          </section>
        )}
      </main>
      <SiteFooter variant="standard" />
    </>
  );
}
