'use client';

import { LevelMeter } from '@/components/Level';
import { ShirtOutline } from '@/components/LogoMark';
import { TEAM_COPY } from '@/lib/copy/team-page';
import type { TeamPeriodView } from '@/lib/data/team';
import { LEVELS } from '@/lib/levels';
import s from './Team.module.css';

const C = TEAM_COPY.travel;

/** The href for a period: the page itself for today's shirt, ?season= for older ones. */
export const seasonHref = (p: Pick<TeamPeriodView, 'key' | 'isCurrent'>) => (p.isCurrent ? './' : `?season=${p.key}`);

/** One row per kit period, newest first. Only shown when the club has more than one. */
export function TravelBack({
  periods,
  shown,
  onSelect,
}: {
  periods: TeamPeriodView[];
  shown: number;
  onSelect: (i: number) => void;
}) {
  return (
    <section aria-labelledby="travel-title" className={s.travel}>
      <div className={s.travelHead}>
        <h2 id="travel-title" className={s.travelTitle}>
          {C.title}
        </h2>
        <span className={s.travelSub}>{C.sub}</span>
      </div>
      {periods
        .map((p, i) => ({ p, i }))
        .reverse()
        .map(({ p, i }) => {
          const lv = LEVELS[p.level];
          const here = i === shown;
          return (
            <a
              key={p.kitId}
              href={seasonHref(p)}
              className={s.season}
              aria-current={here ? 'true' : undefined}
              onClick={(e) => {
                if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
                e.preventDefault();
                onSelect(i);
              }}
            >
              <span className={s.thumb}>
                {p.photos.front ? (
                  // eslint-disable-next-line @next/next/no-img-element -- static export
                  <img src={p.photos.front} alt="" width={58} height={64} loading="lazy" />
                ) : (
                  <ShirtOutline size={44} />
                )}
              </span>
              <span className={s.seasonText}>
                <span className={s.seasonLabelRow}>
                  <span className={s.seasonLabel}>
                    {p.label}
                    {p.isCurrent && ` · ${C.now}`}
                  </span>
                  {here && <span className={s.here}>{C.here}</span>}
                </span>
                <span className={s.seasonLine}>{p.shortLine}</span>
              </span>
              <span className={s.seasonLevel}>
                <LevelMeter level={p.level} size="travel" on={lv.text} />
                <span className={s.seasonWord} style={{ color: lv.text }}>
                  {lv.short}
                </span>
              </span>
              <span className={s.seasonArrow} aria-hidden="true">
                →
              </span>
            </a>
          );
        })}
    </section>
  );
}
