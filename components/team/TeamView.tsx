'use client';

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { CrestBadge } from '@/components/CrestBadge';
import { LevelMeter } from '@/components/Level';
import { Arrow, ARROWS } from '@/components/LogoMark';
import type { TeamPage } from '@/lib/data/derive';
import { LEVELS, TIERS } from '@/lib/levels';
import { useHoverIntent } from './hoverIntent';
import { BACK_NOTE, laneRuns, PANEL, PHOTO, periodColumns, placeCards, STAGE, TIMELINE } from './layout';
import { SponsorCard, tierLabel } from './SponsorCard';
import { TellClubDialog } from './TellClubDialog';
import s from './Team.module.css';

const isMouse = (e: { pointerType: string }) => e.pointerType === 'mouse';

/** Period containing a season like '2018-19', for ?season= deep links. */
function periodFor(team: TeamPage, season: string | null): number | null {
  if (!season || !/^\d{4}(-\d{2})?$/.test(season)) return null;
  const i = team.periods.findIndex((p) => p.from <= season && season <= p.to);
  return i >= 0 ? i : null;
}

export function TeamView({ team, showCrest }: { team: TeamPage; showCrest: boolean }) {
  const [period, setPeriod] = useState(team.current);
  const [hover, setHoverState] = useState<string | null>(null);
  const [lane, setLane] = useState<string | null>(null);
  const [tell, setTell] = useState<string | null>(null);
  const [shared, setShared] = useState(false);
  const hoverRef = useRef<string | null>(null);
  const setHover = useCallback((h: string | null) => {
    hoverRef.current = h;
    setHoverState(h);
  }, []);
  const hi = useHoverIntent({
    current: () => hoverRef.current,
    close: () => {
      setHover(null);
      setLane(null);
    },
  });

  // ?season=2018-19 selects the period containing that season.
  useEffect(() => {
    const i = periodFor(team, new URLSearchParams(window.location.search).get('season'));
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reading the URL once after hydration
    if (i !== null) setPeriod(i);
  }, [team]);

  // Esc closes the open card.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && hoverRef.current && !tell) {
        hi.clearAim();
        setHover(null);
        setLane(null);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [hi, setHover, tell]);

  // Scale the 1328px stage down on narrower desktop windows.
  const wrapRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const fit = () => setZoom(Math.min(1, el.clientWidth / STAGE.W));
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const p = team.periods[period];
  const lv = LEVELS[p.level];
  const { cards, backEmpty } = useMemo(() => placeCards(p.sponsors), [p]);
  const cols = useMemo(() => periodColumns(team.periods), [team.periods]);
  const runs = useMemo(() => laneRuns(team.lanes, cols), [team.lanes, cols]);

  const open = (id: string) => hi.gated(id, () => setHover(id));
  const toggle = (id: string) => () => {
    hi.clearAim();
    setHover(hoverRef.current === id ? null : id);
  };
  const aimFrom = (id: string) => (e: React.PointerEvent) => isMouse(e) && hi.startAim(id, e);
  const pick = (i: number) => () => {
    hi.clearAim();
    setPeriod(i);
    setHover(null);
    setLane(null);
  };

  const shirt = `${p.kitLabel.split(' · ')[1] ?? ''} ${p.kitLabel.split(' · ')[0].toLowerCase()}`.trim();
  const share = async (sponsorName: string) => {
    const url = new URL(window.location.href);
    url.search = `?season=${p.to}`;
    const text = `${team.club.name}’s ${shirt}: ${sponsorName}. Who’s buying your loyalty?`;
    try {
      if (navigator.share)
        await navigator.share({ title: `${team.club.name} · Behind the Jersey`, text, url: url.toString() });
      else {
        await navigator.clipboard.writeText(`${text} ${url}`);
        setShared(true);
        setTimeout(() => setShared(false), 2000);
      }
    } catch {
      /* the fan cancelled the share sheet */
    }
  };
  const tellSponsor = tell ? (p.sponsors.find((sp) => sp.key === tell) ?? null) : null;
  const cardProps = (key: string, name: string) => ({
    onTell: () => setTell(key),
    onShare: () => share(name),
    shareLabel: shared ? 'Link copied' : 'Share',
  });

  return (
    <div className={s.view} onPointerMove={(e) => isMouse(e) && hi.moved(e)}>
      {/* Title row: level box and club name, same size on the same baseline. */}
      <section className={s.title} aria-label="Blood level">
        <div
          className={s.levelBox}
          aria-hidden="true"
          style={{ background: lv.tint, border: `2px ${lv.rated ? 'solid' : 'dashed'} ${lv.border}` }}
        />
        <div className={s.levelRow}>
          <LevelMeter
            level={p.level}
            size="xl"
            on={lv.text}
            off="rgba(255, 255, 255, 0.18)"
            dashColor="var(--text-5)"
          />
          <span className={s.levelWord} style={{ color: lv.text }}>
            {lv.short}
          </span>
        </div>
        <h1 className={s.clubName} style={{ paddingLeft: showCrest ? 94 : 0 }}>
          {showCrest && (
            <CrestBadge
              crest={team.club.crest}
              initials={team.club.initials}
              size={72}
              shadow
              alt={`${team.club.name} crest`}
              className={s.titleCrest}
            />
          )}
          {team.club.name}
        </h1>
        <div className={s.levelRank} style={{ color: lv.text }}>
          Blood level · {lv.rankLong}
        </div>
        <div className={s.titleMeta}>
          <div className={s.kitRow}>
            <span className={s.kitLabel}>{p.kitLabel}</span>
            {p.change && (
              <span
                className={s.changeBadge}
                style={{ color: p.change.kind === 'better' ? 'var(--good)' : 'var(--soaked-text)' }}
              >
                <Arrow d={p.change.kind === 'better' ? ARROWS.better : ARROWS.worse} color="currentColor" />
                {p.change.text}
              </span>
            )}
          </div>
          {p.summary && <p className={s.summary}>{p.summary}</p>}
        </div>
      </section>

      {/* Desktop stage: both photos, cards around them, lines to the logos. */}
      <div ref={wrapRef} className={s.stageWrap}>
        <section
          className={s.stage}
          aria-label="The shirt and its sponsors"
          style={{ zoom, width: STAGE.W, height: STAGE.H }}
        >
          <div className={s.panel} style={{ left: PANEL.X, top: PANEL.Y, width: PANEL.W, height: PANEL.H }} />
          {(['front', 'back'] as const).map((side) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={`${p.kitId}-${side}`}
              src={p.photos[side]}
              alt={`${team.club.name} ${p.kitLabel}, ${side}`}
              width={PHOTO.W}
              height={PHOTO.H}
              className={s.photo}
              style={{ left: side === 'front' ? PHOTO.FRONT_X : PHOTO.BACK_X, top: PHOTO.Y }}
            />
          ))}
          <span className={s.side} style={{ left: PHOTO.FRONT_X }}>
            FRONT
          </span>
          <span className={s.side} style={{ left: PHOTO.BACK_X }}>
            BACK
          </span>

          <svg
            className={s.lines}
            width={STAGE.W}
            height={STAGE.H}
            viewBox={`0 0 ${STAGE.W} ${STAGE.H}`}
            aria-hidden="true"
          >
            {cards.map((c) => {
              const id = c.sponsor.key;
              const active = hover === id;
              const color = TIERS[c.sponsor.tier].color;
              const dashed = c.sponsor.tier === 'unrated' || c.sponsor.tier === 'none';
              return (
                <g key={id} opacity={hover && !active ? 0.3 : 1}>
                  <line
                    x1={c.attachX}
                    y1={c.attachY}
                    x2={c.ax}
                    y2={c.ay}
                    stroke="#0f0d0c"
                    strokeOpacity="0.45"
                    strokeWidth={active ? 6 : 4.5}
                    strokeLinecap="round"
                  />
                  <line
                    x1={c.attachX}
                    y1={c.attachY}
                    x2={c.ax}
                    y2={c.ay}
                    stroke={color}
                    strokeWidth={active ? 3 : 1.8}
                    strokeDasharray={dashed ? '5 4' : undefined}
                    strokeLinecap="round"
                  />
                  <circle cx={c.ax} cy={c.ay} r="7" fill="none" stroke="#ffffff" strokeWidth="3.5" />
                  <circle cx={c.ax} cy={c.ay} r="7" fill="none" stroke={color} strokeWidth="2" />
                  <circle cx={c.attachX} cy={c.attachY} r="3" fill={color} />
                  <line
                    x1={c.attachX}
                    y1={c.attachY}
                    x2={c.ax}
                    y2={c.ay}
                    stroke="#000"
                    strokeOpacity="0"
                    strokeWidth="18"
                    className={s.lineHit}
                    onPointerEnter={(e) => isMouse(e) && open(id)()}
                    onPointerLeave={aimFrom(id)}
                  />
                  <circle
                    cx={c.ax}
                    cy={c.ay}
                    r="11"
                    fill="#000"
                    fillOpacity="0"
                    className={s.lineHit}
                    onPointerEnter={(e) => isMouse(e) && open(id)()}
                    onPointerLeave={aimFrom(id)}
                  />
                </g>
              );
            })}
          </svg>

          {cards.map((c) => (
            <button
              key={`hit-${c.sponsor.key}`}
              type="button"
              className={s.hit}
              style={{ left: c.hit.x, top: c.hit.y, width: c.hit.w, height: c.hit.h }}
              aria-label={`${c.sponsor.name}: show who pays`}
              onPointerEnter={(e) => isMouse(e) && open(c.sponsor.key)()}
              onPointerLeave={aimFrom(c.sponsor.key)}
              onFocus={() => {
                hi.clearAim();
                setHover(c.sponsor.key);
              }}
              onClick={toggle(c.sponsor.key)}
            />
          ))}

          {cards.map((c) => {
            const id = c.sponsor.key;
            return (
              <SponsorCard
                key={id}
                sp={c.sponsor}
                open={hover === id}
                style={{
                  position: 'absolute',
                  left: c.left,
                  top: c.top,
                  width: c.width,
                  zIndex: hover === id ? 20 : 4,
                }}
                onToggle={toggle(id)}
                onFocus={() => {
                  hi.clearAim();
                  setHover(id);
                  setLane(null);
                }}
                onEnter={() =>
                  hi.enterCard(id, () => {
                    setHover(id);
                    setLane(null);
                  })
                }
                onLeave={() => {
                  if (!hi.aiming()) setHover(null);
                }}
                {...cardProps(id, c.sponsor.name)}
              />
            );
          })}

          {backEmpty && (
            <div className={s.note} style={{ left: BACK_NOTE.left, top: BACK_NOTE.top, width: BACK_NOTE.width }}>
              <span className={s.noteLabel}>Back of shirt</span>
              <span className={s.noteText}>No sponsor on the back.</span>
            </div>
          )}
        </section>
      </div>

      {/* Mobile: photos with numbered markers, then the cards as a list. */}
      <section className={s.mobile} aria-label="The shirt and its sponsors">
        <div className={s.mobilePhotos}>
          {(['front', 'back'] as const).map((side) => (
            <figure key={side} className={s.mobilePhoto}>
              <div className={s.mobilePhotoInner}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.photos[side]} alt={`${team.club.name} ${p.kitLabel}, ${side}`} width={720} height={800} />
                {p.sponsors.map((sp, i) =>
                  sp.side === side ? (
                    <a
                      key={sp.key}
                      href={`#m-${sp.key.replace(/[^a-z0-9-]/g, '-')}`}
                      className={s.marker}
                      style={{
                        left: `${sp.hotspot.x * 100}%`,
                        top: `${sp.hotspot.y * 100}%`,
                        borderColor: TIERS[sp.tier].color,
                      }}
                      aria-label={`${i + 1}: ${sp.name}`}
                      onClick={() => setHover(sp.key)}
                    >
                      {i + 1}
                    </a>
                  ) : null,
                )}
              </div>
              <figcaption className={s.mobileSide}>{side.toUpperCase()}</figcaption>
            </figure>
          ))}
        </div>
        <ol className={s.mobileList}>
          {p.sponsors.map((sp, i) => (
            <li key={sp.key} id={`m-${sp.key.replace(/[^a-z0-9-]/g, '-')}`}>
              <SponsorCard
                variant="list"
                sp={sp}
                open={hover === sp.key}
                number={i + 1}
                onToggle={() => setHover(hover === sp.key ? null : sp.key)}
                {...cardProps(sp.key, sp.name)}
              />
            </li>
          ))}
          {backEmpty && (
            <li className={s.note}>
              <span className={s.noteLabel}>Back of shirt</span>
              <span className={s.noteText}>No sponsor on the back.</span>
            </li>
          )}
        </ol>
      </section>

      {team.periods.length > 1 && (
        <Timeline
          team={team}
          period={period}
          cols={cols}
          runs={runs}
          lane={lane}
          onPick={pick}
          onEnterBlock={(i) =>
            hi.gated(null, () => {
              setPeriod(i);
              setHover(null);
              setLane(null);
            })()
          }
          onEnterSeg={(laneId, i) =>
            hi.gated(`lane:${laneId}:${i}`, () => {
              const card = team.periods[i].sponsors.find((sp) => sp.sponsorId === laneId);
              setPeriod(i);
              setHover(card?.key ?? null);
              setLane(laneId);
            })()
          }
          onPickSeg={(laneId, i) => {
            hi.clearAim();
            const card = team.periods[i].sponsors.find((sp) => sp.sponsorId === laneId);
            setPeriod(i);
            setHover(card?.key ?? null);
            setLane(laneId);
          }}
          onLeaveSeg={(laneId, i, e) => {
            const card = team.periods[i].sponsors.find((sp) => sp.sponsorId === laneId);
            if (card && isMouse(e)) hi.startAim(card.key, e);
          }}
          onLeave={() => setLane(null)}
        />
      )}

      <TellClubDialog
        open={tell !== null}
        onClose={() => setTell(null)}
        club={team.club.name}
        shirt={shirt}
        sponsor={tellSponsor}
        channels={team.contacts}
        checked={team.contactsChecked}
      />
    </div>
  );
}

function Timeline({
  team,
  period,
  cols,
  runs,
  lane,
  onPick,
  onEnterBlock,
  onEnterSeg,
  onPickSeg,
  onLeaveSeg,
  onLeave,
}: {
  team: TeamPage;
  period: number;
  cols: { x: number; w: number }[];
  runs: ReturnType<typeof laneRuns>;
  lane: string | null;
  onPick: (i: number) => () => void;
  onEnterBlock: (i: number) => void;
  onEnterSeg: (laneId: string, i: number) => void;
  onPickSeg: (laneId: string, i: number) => void;
  onLeaveSeg: (laneId: string, i: number, e: React.PointerEvent) => void;
  onLeave: () => void;
}) {
  const [showLanes, setShowLanes] = useState(false);
  const height = TIMELINE.PILLS_Y + team.lanes.length * TIMELINE.PILL_H;
  return (
    <section className={s.timeline} aria-labelledby="over-the-years">
      <div className={s.tlHead}>
        <h2 id="over-the-years" className={s.tlLabel}>
          Over the years
        </h2>
        <span className={s.tlHint}>Hover a period or a sponsor to put that shirt on the page.</span>
        <button type="button" className={s.tlToggle} aria-expanded={showLanes} onClick={() => setShowLanes((v) => !v)}>
          {showLanes ? 'Hide sponsors by year' : 'Show sponsors by year'}
        </button>
      </div>
      <div className={s.tlScroll}>
        <div
          className={`${s.track} ${showLanes ? s.lanesOn : ''}`}
          style={{ width: TIMELINE.TRACK, height }}
          onPointerLeave={onLeave}
        >
          {team.periods.map((per, i) => {
            const L = LEVELS[per.level];
            const on = i === period;
            return (
              <button
                key={per.kitId}
                type="button"
                className={s.block}
                aria-pressed={on}
                aria-label={`Show the ${per.label} shirt, ${L.short}`}
                style={{
                  left: cols[i].x,
                  width: cols[i].w,
                  height: TIMELINE.BLOCK_H,
                  background: on ? 'rgba(243, 237, 230, 0.06)' : 'transparent',
                  border: on
                    ? '2px solid var(--text)'
                    : `1px ${L.rated ? 'solid' : 'dashed'} ${L.rated ? 'var(--line-3)' : 'var(--unrated-border)'}`,
                  color: on ? 'var(--text)' : 'var(--text-3)',
                }}
                onPointerEnter={(e) => isMouse(e) && onEnterBlock(i)}
                onFocus={onPick(i)}
                onClick={onPick(i)}
              >
                <span className={s.blockText}>
                  <span className={s.blockLabel}>{per.label}</span>
                  <span className={s.blockLevel}>
                    <LevelMeter
                      level={per.level}
                      size="xs"
                      on={L.text}
                      off="rgba(255, 255, 255, 0.18)"
                      dashColor="var(--text-5)"
                    />
                    <span className={s.blockWord} style={{ color: on ? 'var(--text)' : 'var(--text-2)' }}>
                      {L.short}
                    </span>
                  </span>
                </span>
                {per.change && (
                  <span className={s.blockNote}>
                    <span
                      className={s.noteDot}
                      style={{ background: per.change.kind === 'better' ? 'var(--good)' : 'var(--soaked-text)' }}
                    >
                      <Arrow
                        d={per.change.kind === 'better' ? ARROWS.better : ARROWS.worse}
                        color="#0f0d0c"
                        size={10}
                      />
                    </span>
                    {per.change.badge}
                  </span>
                )}
              </button>
            );
          })}
          {runs.map((r) => {
            const t = TIERS[r.lane.tier];
            const unrated = r.lane.tier === 'unrated' || r.lane.tier === 'none';
            return (
              <div
                key={`${r.lane.sponsorId}-${r.run.from}`}
                className={s.pill}
                aria-hidden="true"
                style={{
                  left: r.x,
                  top: r.y,
                  width: r.w,
                  background: unrated ? 'transparent' : t.fill,
                  border: unrated ? '1px dashed #7a6f66' : 'none',
                  color: t.fg,
                  boxShadow: lane === r.lane.sponsorId ? '0 0 0 2px var(--bg), 0 0 0 3px var(--text)' : 'none',
                }}
              >
                {r.lane.name} · {tierLabel({ tier: r.lane.tier, status: 'rated' })}
              </div>
            );
          })}
          {runs.flatMap((r) =>
            Array.from({ length: r.run.to - r.run.from + 1 }, (_, n) => r.run.from + n).map((i) => (
              <button
                key={`seg-${r.lane.sponsorId}-${i}`}
                type="button"
                className={s.seg}
                style={{ left: cols[i].x, top: r.y - 3, width: cols[i].w }}
                aria-label={`${r.lane.name}, ${team.periods[i].label}`}
                onPointerEnter={(e) => isMouse(e) && onEnterSeg(r.lane.sponsorId, i)}
                onPointerLeave={(e) => onLeaveSeg(r.lane.sponsorId, i, e)}
                onFocus={() => onPickSeg(r.lane.sponsorId, i)}
                onClick={() => onPickSeg(r.lane.sponsorId, i)}
              />
            )),
          )}
        </div>
      </div>
    </section>
  );
}
