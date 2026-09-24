import type { CSSProperties } from 'react';
import type { LevelId } from '@/lib/data/schema';
import { LEVELS } from '@/lib/levels';
import s from './Level.module.css';

const SIZES = {
  xs: { w: 4, gap: 2, r: 1, h: [5, 8, 11, 14] },
  s: { w: 4, gap: 2, r: 1, h: [6, 9, 12, 15] },
  key: { w: 4, gap: 2, r: 1, h: [6, 9, 12, 16] },
  m: { w: 6, gap: 3, r: 1, h: [8, 13, 18, 24] },
  def: { w: 6, gap: 3, r: 1, h: [9, 14, 20, 26] },
  l: { w: 8, gap: 3, r: 2, h: [10, 16, 23, 30] },
  xl: { w: 13, gap: 5, r: 2, h: [14, 25, 37, 50] },
} as const;

export type MeterSize = keyof typeof SIZES;

/** Four bars like Wi‑Fi bars, filled up to the level. Not rated shows four dashed outlines. Always next to the level word. */
export function LevelMeter({
  level,
  size,
  on,
  off = 'var(--meter-off)',
  dashColor = 'var(--text-5)',
}: {
  level: LevelId;
  size: MeterSize;
  /** Filled bar colour. Defaults to the level fill. */
  on?: string;
  off?: string;
  dashColor?: string;
}) {
  const z = SIZES[size];
  const lv = LEVELS[level];
  const fill = on ?? lv.fill;
  return (
    <span className={s.meter} style={{ gap: z.gap, height: z.h[3] }} aria-hidden="true">
      {z.h.map((h, i) => {
        const style: CSSProperties = { width: z.w, height: h, borderRadius: z.r };
        if (!lv.rated) Object.assign(style, { border: `1px dashed ${dashColor}` });
        else style.background = i < lv.meter ? fill : off;
        return <span key={i} style={style} />;
      })}
    </span>
  );
}

/** Small coloured block with a meter and the level word (change cards). */
export function LevelChip({ level }: { level: LevelId }) {
  const lv = LEVELS[level];
  return (
    <span
      className={s.chip}
      style={
        lv.rated
          ? { background: lv.band, color: lv.bandText }
          : { background: 'transparent', color: 'var(--text-3)', border: '1px dashed var(--unrated-border)' }
      }
    >
      <LevelMeter level={level} size="xs" on={lv.bandText} off={lv.bandOff} dashColor="var(--text-5)" />
      <span className={s.chipWord}>{lv.word}</span>
    </span>
  );
}
