import s from './Team.module.css';

/**
 * The numbered circle that links a sponsor row to its logo on the shirt. Rated: red with a white
 * ring. Unrated: dark with a dashed ring. The dark outer ring keeps it readable on red and on white.
 */
export function SponsorMarker({ n, rated, size }: { n: number; rated: boolean; size: string | number }) {
  const px = typeof size === 'number';
  return (
    <span
      className={`${s.marker} ${rated ? s.markerRated : s.markerUnrated}`}
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
