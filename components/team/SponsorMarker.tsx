import type { TierId } from '@/lib/data/schema';
import s from './Team.module.css';

/**
 * The numbered circle that links a sponsor row to its logo on the shirt. Concern or worse: red with
 * a white ring. Nothing found: dark with a white ring. Not rated: dark with a dashed ring. The dark
 * outer ring keeps it readable on red and on white.
 */
export function SponsorMarker({ n, tier, size }: { n: number; tier: TierId; size: string | number }) {
  const px = typeof size === 'number';
  const tone = tier === 'unrated' ? s.markerUnrated : tier === 'none' ? s.markerClear : s.markerRated;
  return (
    <span
      className={`${s.marker} ${tone}`}
      style={{
        width: size,
        height: size,
        fontSize: px ? Math.round(size * 0.46) : `calc(${size} * 0.46)`,
      }}
      aria-hidden="true"
    >
      {n}
    </span>
  );
}
