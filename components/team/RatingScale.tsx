'use client';

import { useEffect, useId, useRef, useState, type CSSProperties } from 'react';
import { fill, TEAM_COPY } from '@/lib/copy/team-page';
import type { ScaleLevel } from '@/lib/data/team';
import { SCALE_LEVELS } from '@/lib/data/team';
import type { LevelId } from '@/lib/data/schema';
import { LEVELS } from '@/lib/levels';
import s from './Scale.module.css';

const C = TEAM_COPY.scale;
const BAR = [4, 6, 8, 10];

/**
 * The four levels as the meter itself, with the kit on screen marked. Hovering or focusing a cell
 * shows what the level means; a click or tap pins it. Esc or a click elsewhere closes it.
 */
export function RatingScale({
  level,
  club,
  plain,
  notes,
}: {
  level: LevelId;
  club: string;
  plain: Record<ScaleLevel, string>;
  notes: Record<ScaleLevel, string | null>;
}) {
  const [hover, setHover] = useState<ScaleLevel | null>(null);
  const [focused, setFocused] = useState<ScaleLevel | null>(null);
  const [pinned, setPinned] = useState<ScaleLevel | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const tipId = useId();
  const active = hover ?? focused ?? pinned;
  const rated = level !== 'not-rated';

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setPinned(null);
      setFocused(null);
      setHover(null);
    };
    const onDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setPinned(null);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onDown);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onDown);
    };
  }, []);

  return (
    <div ref={ref} className={s.scale}>
      <span className={s.label}>
        {rated ? (
          <>
            <span className={s.labelHover}>{C.label}</span>
            <span className={s.labelTouch}>{C.labelTouch}</span>
          </>
        ) : (
          C.labelNotRated
        )}
      </span>
      <div role="group" aria-label="Rating scale" className={s.cells}>
        {SCALE_LEVELS.map((l, i) => {
          const lv = LEVELS[l];
          const current = l === level;
          return (
            <button
              key={l}
              type="button"
              className={s.cell}
              data-current={current || undefined}
              data-active={active === l || undefined}
              style={{ '--lv-border': lv.border, '--lv-tint': lv.tint } as CSSProperties}
              aria-label={`${lv.word}, ${i + 1} of 4. ${plain[l]}${current ? ` ${fill(C.noteHere, { club })}.` : ''}`}
              aria-describedby={active === l ? tipId : undefined}
              onPointerEnter={(e) => e.pointerType === 'mouse' && setHover(l)}
              onPointerLeave={(e) => e.pointerType === 'mouse' && setHover(null)}
              onFocus={(e) => e.currentTarget.matches(':focus-visible') && setFocused(l)}
              onBlur={() => setFocused(null)}
              onClick={() => setPinned((p) => (p === l ? null : l))}
            >
              <span className={s.barSlot}>
                <span className={s.bar} style={{ height: BAR[i], background: lv.fill }} />
              </span>
              <span className={s.word} style={{ color: lv.text }}>
                {lv.word}
              </span>
            </button>
          );
        })}
      </div>
      <div className={s.marks} aria-hidden="true">
        {SCALE_LEVELS.map((l, i) => (
          <span
            key={l}
            className={`${s.mark} ${i === SCALE_LEVELS.length - 1 ? s.markEnd : ''}`}
            style={{ color: LEVELS[l].text }}
          >
            {l === level &&
              fill(C.marker, { club })
                .split('▲')
                .map((part, j) =>
                  j
                    ? [
                        <span key={j} className={s.tri}>
                          ▲{'\u00a0'}
                        </span>,
                        part.trimStart(),
                      ]
                    : part,
                )}
          </span>
        ))}
      </div>
      {active && (
        <div id={tipId} role="tooltip" className={s.tip}>
          <span className={s.tipWord} style={{ color: LEVELS[active].text }}>
            {LEVELS[active].word}
          </span>
          <span className={s.tipText}>{plain[active]}</span>
          {notes[active] && (
            <span className={s.tipNote} style={{ color: LEVELS[active].text }}>
              {notes[active]}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
