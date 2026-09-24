'use client';

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { CrestBadge } from '@/components/CrestBadge';
import { LevelMeter } from '@/components/Level';
import { Arrow, ARROWS } from '@/components/LogoMark';
import { TEAM_INTERACTION } from '@/lib/config';
import type { TeamPage } from '@/lib/data/derive';
import { LEVELS, TIERS } from '@/lib/levels';
import { useHoverIntent } from './hoverIntent';
import { BACK_NOTE, laneRuns, openPlacement, PANEL, PHOTO, periodColumns, placeCards, STAGE, TIMELINE } from './layout';
import { SponsorCard, tierLabel } from './SponsorCard';
import { TellClubDialog } from './TellClubDialog';
import s from './Team.module.css';

type Mode = 'click' | 'hover';

const isMouse = (e: { pointerType: string }) => e.pointerType === 'mouse';

/** Period containing a season like '2018-19', for ?season= deep links. */
function periodFor(team: TeamPage, season: string | null): number | null {
  if (!season || !/^\d{4}(-\d{2})?$/.test(season)) return null;
  const i = team.periods.findIndex((p) => p.from <= season && season <= p.to);
  return i >= 0 ? i : null;
}

/**
 * The team page stage and timeline. In 'click' mode (the default) hovering only highlights and a
 * click opens a card or selects a period. In 'hover' mode (?interaction=hover) it behaves like the
 * original design: hover opens cards and switches periods, with hover intent.
 */
export function TeamView({ team, showCrest }: { team: TeamPage; showCrest: boolean }) {
  const [mode, setMode] = useState<Mode>(TEAM_INTERACTION);
  const [period, setPeriod] = useState(team.current);
  /** The expanded card. */
  const [open, setOpenState] = useState<string | null>(null);
  /** The highlighted card in click mode (hover or focus): no change in size. */
  const [peek, setPeek] = useState<string | null>(null);
  /** The timeline lane that opened the card, and the lane under the pointer. */
  const [lane, setLane] = useState<string | null>(null);
  const [laneHover, setLaneHover] = useState<string | null>(null);
  const [tell, setTell] = useState<string | null>(null);
  const [shared, setShared] = useState(false);
  const openRef = useRef<string | null>(null);
  const setOpen = useCallback((h: string | null) => {
    openRef.current = h;
    setOpenState(h);
  }, []);
  const hi = useHoverIntent({
    current: () => openRef.current,
    close: () => {
      setOpen(null);
      setLane(null);
    },
  });
  const hover = mode === 'hover';

  // ?season=2018-19 selects the period containing that season; ?interaction=hover|click picks the mode.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const i = periodFor(team, q.get('season'));
    /* eslint-disable react-hooks/set-state-in-effect -- reading the URL once after hydration */
    if (i !== null) setPeriod(i);
    const m = q.get('interaction');
    if (m === 'hover' || m === 'click') setMode(m);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [team]);

  // Esc closes the open card.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && openRef.current && !tell) {
        hi.clearAim();
        setOpen(null);
        setLane(null);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [hi, setOpen, tell]);

  // Click mode: a click anywhere else closes the open card.
  useEffect(() => {
    if (hover) return;
    const onDown = (e: PointerEvent) => {
      if (!openRef.current) return;
      const t = e.target as Element | null;
      if (t?.closest('[data-card], [data-list-card], [data-hotspot], [data-seg], dialog')) return;
      setOpen(null);
      setLane(null);
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [hover, setOpen]);

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
  const { cards: placed, backEmpty } = useMemo(() => placeCards(p.sponsors), [p]);
  // An open card moves inside the stage; its line follows it.
  const cards = placed.map((c) => {
    if (c.sponsor.key !== open) return { ...c, maxHeight: undefined };
    const o = openPlacement(c);
    return c.sponsor.slot === 'T'
      ? { ...c, top: o.top, maxHeight: o.maxHeight }
      : { ...c, top: o.top, attachY: o.top + (c.attachY - c.top), maxHeight: o.maxHeight };
  });
  const cols = useMemo(() => periodColumns(team.periods), [team.periods]);
  const runs = useMemo(() => laneRuns(team.lanes, cols), [team.lanes, cols]);

  const toggle = (id: string) => () => {
    hi.clearAim();
    setOpen(openRef.current === id ? null : id);
    setLane(null);
  };
  // Hover mode only: open on hover, gated by hover intent.
  const hoverOpen = (id: string) => hi.gated(id, () => setOpen(id));
  const aimFrom = (id: string) => (e: React.PointerEvent) => isMouse(e) && hi.startAim(id, e);

  /** Select a period on purpose (click, Enter, arrow keys) and keep it in the URL. */
  const select = (i: number, card: string | null = null, fromLane: string | null = null) => {
    hi.clearAim();
    setPeriod(i);
    setOpen(card);
    setLane(fromLane);
    const url = new URL(window.location.href);
    if (i === team.current) url.searchParams.delete('season');
    else url.searchParams.set('season', team.periods[i].from);
    window.history.replaceState(null, '', url);
  };
  const cardFor = (i: number, laneId: string) => team.periods[i].sponsors.find((sp) => sp.sponsorId === laneId);

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
    <div className={s.view} onPointerMove={hover ? (e) => isMouse(e) && hi.moved(e) : undefined}>
      {/* Title row: level box and club name, same size on the same baseline. Every period's
          variant is stacked in place so switching periods can't move anything. */}
      <section className={s.title} aria-label="Blood level">
        <div
          className={s.levelBox}
          aria-hidden="true"
          style={{ background: lv.tint, border: `2px ${lv.rated ? 'solid' : 'dashed'} ${lv.border}` }}
        />
        <div className={`${s.levelRow} ${s.stack}`}>
          {team.periods.map((per, i) => {
            const L = LEVELS[per.level];
            return (
              <span key={per.kitId} className={s.levelRow} style={{ padding: 0 }} aria-hidden={i !== period}>
                <LevelMeter
                  level={per.level}
                  size="xl"
                  on={L.text}
                  off="rgba(255, 255, 255, 0.18)"
                  dashColor="var(--text-5)"
                />
                <span className={s.levelWord} style={{ color: L.text }}>
                  {L.short}
                </span>
              </span>
            );
          })}
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
        <div className={`${s.levelRank} ${s.stack}`}>
          {team.periods.map((per, i) => (
            <span key={per.kitId} style={{ color: LEVELS[per.level].text }} aria-hidden={i !== period}>
              Blood level · {LEVELS[per.level].rankLong}
            </span>
          ))}
        </div>
        <div className={`${s.titleMeta} ${s.stack}`}>
          {team.periods.map((per, i) => (
            <div key={per.kitId} className={s.titleMetaInner} aria-hidden={i !== period}>
              <div className={s.kitRow}>
                <span className={s.kitLabel}>{per.kitLabel}</span>
                {per.change && (
                  <span
                    className={s.changeBadge}
                    style={{ color: per.change.kind === 'better' ? 'var(--good)' : 'var(--soaked-text)' }}
                  >
                    <Arrow d={per.change.kind === 'better' ? ARROWS.better : ARROWS.worse} color="currentColor" />
                    {per.change.text}
                  </span>
                )}
              </div>
              {per.summary && <p className={s.summary}>{per.summary}</p>}
            </div>
          ))}
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
              const active = open === id || (!hover && peek === id);
              const color = TIERS[c.sponsor.tier].color;
              const dashed = c.sponsor.tier === 'unrated' || c.sponsor.tier === 'none';
              return (
                <g key={id} opacity={open && open !== id ? 0.3 : 1}>
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
                  {hover && (
                    <>
                      <line
                        x1={c.attachX}
                        y1={c.attachY}
                        x2={c.ax}
                        y2={c.ay}
                        stroke="#000"
                        strokeOpacity="0"
                        strokeWidth="18"
                        className={s.lineHit}
                        onPointerEnter={(e) => isMouse(e) && hoverOpen(id)()}
                        onPointerLeave={aimFrom(id)}
                      />
                      <circle
                        cx={c.ax}
                        cy={c.ay}
                        r="11"
                        fill="#000"
                        fillOpacity="0"
                        className={s.lineHit}
                        onPointerEnter={(e) => isMouse(e) && hoverOpen(id)()}
                        onPointerLeave={aimFrom(id)}
                      />
                    </>
                  )}
                </g>
              );
            })}
          </svg>

          {cards.map((c) => {
            const id = c.sponsor.key;
            return (
              <button
                key={`hit-${id}`}
                type="button"
                data-hotspot={id}
                className={s.hit}
                style={{ left: c.hit.x, top: c.hit.y, width: c.hit.w, height: c.hit.h }}
                aria-label={`${c.sponsor.name}: show who pays`}
                aria-expanded={open === id}
                onPointerEnter={(e) => isMouse(e) && (hover ? hoverOpen(id)() : setPeek(id))}
                onPointerLeave={(e) => (hover ? aimFrom(id)(e) : setPeek(null))}
                onFocus={() => {
                  if (hover) {
                    hi.clearAim();
                    setOpen(id);
                  } else setPeek(id);
                }}
                onBlur={() => !hover && setPeek(null)}
                onClick={toggle(id)}
              />
            );
          })}

          {cards.map((c) => {
            const id = c.sponsor.key;
            return (
              <SponsorCard
                key={id}
                sp={c.sponsor}
                open={open === id}
                highlight={!hover && peek === id}
                maxHeight={c.maxHeight}
                style={{
                  position: 'absolute',
                  left: c.left,
                  top: c.top,
                  width: c.width,
                  zIndex: open === id ? 20 : 4,
                }}
                onToggle={toggle(id)}
                onFocus={
                  hover
                    ? () => {
                        hi.clearAim();
                        setOpen(id);
                        setLane(null);
                      }
                    : undefined
                }
                onEnter={
                  hover
                    ? () =>
                        hi.enterCard(id, () => {
                          setOpen(id);
                          setLane(null);
                        })
                    : () => setPeek(id)
                }
                onLeave={
                  hover
                    ? () => {
                        if (!hi.aiming()) setOpen(null);
                      }
                    : () => setPeek(null)
                }
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
                      onClick={() => setOpen(sp.key)}
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
                open={open === sp.key}
                number={i + 1}
                onToggle={() => setOpen(open === sp.key ? null : sp.key)}
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
          mode={mode}
          period={period}
          cols={cols}
          runs={runs}
          lane={lane}
          laneHover={laneHover}
          onSelect={(i) => select(i)}
          onSelectSeg={(laneId, i) => select(i, cardFor(i, laneId)?.key ?? null, laneId)}
          onEnterBlock={(i) =>
            hi.gated(null, () => {
              setPeriod(i);
              setOpen(null);
              setLane(null);
            })()
          }
          onEnterSeg={(laneId, i) => {
            if (!hover) {
              setLaneHover(laneId);
              return;
            }
            hi.gated(`lane:${laneId}:${i}`, () => {
              setPeriod(i);
              setOpen(cardFor(i, laneId)?.key ?? null);
              setLane(laneId);
            })();
          }}
          onLeaveSeg={(laneId, i, e) => {
            if (!hover) {
              setLaneHover(null);
              return;
            }
            const card = cardFor(i, laneId);
            if (card && isMouse(e)) hi.startAim(card.key, e);
          }}
          onLeave={() => {
            setLaneHover(null);
            if (hover) setLane(null);
          }}
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
  mode,
  period,
  cols,
  runs,
  lane,
  laneHover,
  onSelect,
  onSelectSeg,
  onEnterBlock,
  onEnterSeg,
  onLeaveSeg,
  onLeave,
}: {
  team: TeamPage;
  mode: Mode;
  period: number;
  cols: { x: number; w: number }[];
  runs: ReturnType<typeof laneRuns>;
  lane: string | null;
  laneHover: string | null;
  onSelect: (i: number) => void;
  onSelectSeg: (laneId: string, i: number) => void;
  onEnterBlock: (i: number) => void;
  onEnterSeg: (laneId: string, i: number) => void;
  onLeaveSeg: (laneId: string, i: number, e: React.PointerEvent) => void;
  onLeave: () => void;
}) {
  const [showLanes, setShowLanes] = useState(false);
  const blocks = useRef<(HTMLButtonElement | null)[]>([]);
  const hover = mode === 'hover';
  const height = TIMELINE.PILLS_Y + team.lanes.length * TIMELINE.PILL_H;
  // Arrow keys move between periods (click mode).
  const onKeyDown = (i: number) => (e: React.KeyboardEvent) => {
    const next = e.key === 'ArrowRight' ? i + 1 : e.key === 'ArrowLeft' ? i - 1 : -1;
    if (next < 0 || next >= team.periods.length) return;
    e.preventDefault();
    onSelect(next);
    blocks.current[next]?.focus();
  };
  return (
    <section className={s.timeline} aria-labelledby="over-the-years">
      <div className={s.tlHead}>
        <h2 id="over-the-years" className={s.tlLabel}>
          Over the years
        </h2>
        <span className={s.tlHint}>
          {hover
            ? 'Hover a period or a sponsor to put that shirt on the page.'
            : 'Click a period or a sponsor to put that shirt on the page.'}
        </span>
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
                ref={(el) => {
                  blocks.current[i] = el;
                }}
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
                onPointerEnter={hover ? (e) => isMouse(e) && onEnterBlock(i) : undefined}
                onFocus={hover ? () => onSelect(i) : undefined}
                onKeyDown={hover ? undefined : onKeyDown(i)}
                onClick={() => onSelect(i)}
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
            const ringed = lane === r.lane.sponsorId || laneHover === r.lane.sponsorId;
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
                  boxShadow: ringed ? '0 0 0 2px var(--bg), 0 0 0 3px var(--text)' : 'none',
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
                data-seg
                className={s.seg}
                style={{ left: cols[i].x, top: r.y - 3, width: cols[i].w }}
                aria-label={`${r.lane.name}, ${team.periods[i].label}`}
                onPointerEnter={(e) => isMouse(e) && onEnterSeg(r.lane.sponsorId, i)}
                onPointerLeave={(e) => onLeaveSeg(r.lane.sponsorId, i, e)}
                onFocus={hover ? () => onSelectSeg(r.lane.sponsorId, i) : undefined}
                onClick={() => onSelectSeg(r.lane.sponsorId, i)}
              />
            )),
          )}
        </div>
      </div>
    </section>
  );
}
