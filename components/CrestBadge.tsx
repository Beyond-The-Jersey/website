import s from './CrestBadge.module.css';

/** A club crest on a white circle, or 2–3 letter initials when there is no crest. */
export function CrestBadge({
  crest,
  initials,
  size,
  alt = '',
  shadow = false,
  className,
}: {
  crest: string | null;
  initials: string;
  size: number;
  alt?: string;
  shadow?: boolean;
  className?: string;
}) {
  const img = Math.round(size * 0.72);
  return (
    <span
      className={`${s.badge} ${crest ? s.white : s.plain} ${shadow ? s.shadow : ''} ${className ?? ''}`}
      style={{ width: size, height: size }}
    >
      {crest ? (
        // eslint-disable-next-line @next/next/no-img-element -- static export, crests are 200×200 already
        <img src={crest} alt={alt} width={img} height={img} className={s.img} loading="lazy" />
      ) : (
        <span className={s.initials} style={{ fontSize: Math.max(9, Math.round(size * 0.27)) }}>
          {initials}
        </span>
      )}
    </span>
  );
}
