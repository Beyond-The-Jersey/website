import Link from 'next/link';
import type { ReactNode } from 'react';
import { IS_DEV } from '@/lib/config';
import type { ChangeView, DroppedView, LeagueSummary, SourceView } from '@/lib/data/derive';
import { LEVELS } from '@/lib/levels';
import { CrestBadge } from './CrestBadge';
import { LevelChip } from './Level';
import { Arrow, ARROWS } from './LogoMark';
import s from './Cards.module.css';

export function SectionHeading({
  title,
  sub,
  kicker,
  link,
  id,
  size = 56,
  subWidth,
}: {
  title: string;
  sub?: string;
  kicker?: string;
  link?: { href: string; label: string; tone?: 'good' };
  id?: string;
  size?: number;
  subWidth?: number;
}) {
  return (
    <div className={s.heading}>
      <div className={s.headingText}>
        {kicker && <span className={s.kicker}>{kicker}</span>}
        <h2 id={id} className={s.h2} style={{ fontSize: size }}>
          {title}
        </h2>
        {sub && (
          <p className={s.sub} style={subWidth ? { maxWidth: subWidth } : undefined}>
            {sub}
          </p>
        )}
      </div>
      {link && (
        <a href={link.href} className={`${s.headingLink} ${link.tone === 'good' ? s.good : ''}`}>
          {link.label}
        </a>
      )}
    </div>
  );
}

/** "SportsPro · Jul 2026", linked when there's a URL. Missing sources show a TODO in development only. */
export function SourceNote({ source, todo, link = true, className }: { source: SourceView | null; todo?: string | null; link?: boolean; className?: string }) {
  if (!source) return IS_DEV ? <span className="dev-todo">TODO: {todo ?? 'add source'}</span> : null;
  const text = source.short;
  return (
    <span className={`${s.source} ${className ?? ''}`} title={source.line}>
      {link && source.url ? (
        <a href={source.url} rel="noopener noreferrer" target="_blank">
          {text}
        </a>
      ) : (
        text
      )}
      {IS_DEV && !source.url && <span className="dev-todo">TODO: link</span>}
    </span>
  );
}

const KIND = {
  worse: { label: 'Got worse', color: 'var(--soaked-text)', arrow: ARROWS.worse },
  better: { label: 'Got better', color: 'var(--good)', arrow: ARROWS.better },
  renewed: { label: 'Renewed', color: 'var(--text-2)', arrow: ARROWS.renewed },
  'being-rated': { label: 'Being rated', color: 'var(--text-4)', arrow: ARROWS.dash },
  new: { label: 'New', color: 'var(--text-2)', arrow: ARROWS.renewed },
} as const;

export function ChangeCard({ c }: { c: ChangeView }) {
  const k = KIND[c.kind];
  return (
    <Link href={c.href} className={s.change}>
      <div className={s.changeTop}>
        <span className={s.kind} style={{ color: k.color }}>
          <Arrow d={k.arrow} color={k.color} />
          {k.label}
        </span>
        <span className={s.date}>{c.date}</span>
      </div>
      <div className={s.club}>
        <CrestBadge crest={c.club.crest} initials={c.club.initials} size={48} />
        <span className={s.clubName}>{c.club.name}</span>
      </div>
      <div>
        <LevelChip level={c.levelAfter} />
      </div>
      <span className={s.changeTitle}>{c.title}</span>
      <span className={s.changeText}>{c.text}</span>
      <span className={s.pinBottom}>
        <SourceNote source={c.source} link={false} />
      </span>
    </Link>
  );
}

export function DroppedCard({ d }: { d: DroppedView }) {
  return (
    <article className={s.dropped}>
      <div className={s.droppedTop}>
        <CrestBadge crest={d.crest} initials={d.initials} size={56} alt={`${d.name} crest`} />
        <span className={s.droppedName}>
          <span className={s.clubName}>{d.href ? <Link href={d.href}>{d.name}</Link> : d.name}</span>
          <span className={s.what}>{d.what}</span>
        </span>
        <span className={s.year}>{d.year}</span>
      </div>
      <p className={s.droppedText}>{d.text}</p>
      <div className={s.droppedBottom}>
        <button type="button" className={s.thanks} title="Coming soon">
          Say thanks
        </button>
        <SourceNote source={d.source} todo={d.todo} />
      </div>
    </article>
  );
}

/** One slot per club, worst first: crest above a coloured bar. Unrated slots are dashed. */
export function ClubStrip({
  league,
  crest,
  bar,
  circle,
  linkSlots = false,
}: {
  league: LeagueSummary;
  crest: number;
  bar: number;
  circle: number;
  linkSlots?: boolean;
}) {
  const slots: ReactNode[] = league.clubs.map((c) => {
    const lv = LEVELS[c.level];
    const title = `${c.name}: ${lv.rated ? lv.word : 'not rated yet'}`;
    const inner = (
      <>
        {c.crest ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={c.crest} alt="" width={crest} height={crest} className={s.slotCrest} style={{ opacity: lv.rated ? 1 : linkSlots ? 0.55 : 0.5 }} />
        ) : (
          <span className={s.slotInitials} style={{ height: crest }}>
            {c.initials}
          </span>
        )}
        <span
          className={s.slotBar}
          style={{
            height: bar,
            background: lv.rated ? lv.fill : 'transparent',
            border: lv.rated ? 'none' : '1px dashed var(--unrated-dash)',
          }}
        />
      </>
    );
    return linkSlots ? (
      <Link key={c.id} href={c.href} title={title} aria-label={title} className={s.slot}>
        {inner}
      </Link>
    ) : (
      <span key={c.id} title={title} className={s.slot}>
        {inner}
      </span>
    );
  });
  for (let i = 0; i < league.unknown; i++) {
    slots.push(
      <span key={`unknown-${i}`} title="Not rated yet" className={s.slot}>
        <span className={s.slotCircle} style={{ width: circle, height: circle, margin: (crest - circle) / 2 }} />
        <span className={s.slotBar} style={{ height: bar, border: '1px dashed var(--unrated-dash)' }} />
      </span>,
    );
  }
  return (
    <div className={s.strip} style={{ ['--bar-radius' as string]: bar > 20 ? '4px' : '3px' }}>
      {slots}
    </div>
  );
}

export function LeagueRow({ league }: { league: LeagueSummary }) {
  const started = league.rated > 0;
  return (
    <Link href={league.href} className={s.leagueRow}>
      <span className={s.leagueName}>
        <span className={s.leagueTitle}>{league.name}</span>
        <span className={s.leagueSub}>
          {[league.country, `${league.rated} of ${league.total} rated`].filter(Boolean).join(' · ')}
        </span>
      </span>
      <ClubStrip league={league} crest={26} bar={18} circle={22} />
      <span className={s.leagueBig}>
        {started ? (
          <>
            <span className={s.big} style={{ color: 'var(--soaked-text)' }}>
              {league.bad} of {league.total}
            </span>
            <span className={s.small}>
              {league.unknown === 0 ? 'shirts carry a sponsor we rate as bad' : `bad so far, ${league.total - league.rated} clubs still to check`}
            </span>
          </>
        ) : (
          <>
            <span className={s.big} style={{ color: 'var(--text-6)' }}>
              Not started
            </span>
            <span className={s.small}>{league.notes[0] ?? 'Be the first to map it'}</span>
          </>
        )}
      </span>
    </Link>
  );
}
