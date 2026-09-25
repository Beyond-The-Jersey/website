'use client';

import { fill, TEAM_COPY } from '@/lib/copy/team-page';
import { markerPosition, type SponsorRowView, type TeamPeriodView } from '@/lib/data/team';
import { ShirtOutline } from '@/components/LogoMark';
import { SponsorMarker } from './SponsorMarker';
import s from './Team.module.css';

const C = TEAM_COPY.shirt;

/** Markers are laid out on a 480px-wide photo and scale with it (container query units). */
const W = 480;
const H = (W * 800) / 720;
const u = (px: number) => `${((px / W) * 100).toFixed(3)}cqw`;

interface Linked {
  highlight: string | null;
  onHighlight: (key: string | null) => void;
  onPick: (key: string) => void;
}

function Photo({
  src,
  alt,
  rows,
  highlight,
  onHighlight,
  onPick,
}: { src: string; alt: string; rows: SponsorRowView[] } & Linked) {
  const placed = rows.map((r) => ({ r, m: markerPosition(r.hotspot!, W, H, r.rated) }));
  return (
    <div className={s.photo}>
      {/* eslint-disable-next-line @next/next/no-img-element -- static export */}
      <img src={src} alt={alt} width={720} height={800} className={s.photoImg} />
      {placed.map(({ r, m }) => (
        <button
          key={r.key}
          type="button"
          className={s.hit}
          data-hotspot={r.key}
          style={{ left: u(m.hit.left), top: u(m.hit.top), width: u(m.hit.width), height: u(m.hit.height) }}
          aria-label={`${r.number}: ${r.name}, ${r.placementText.toLowerCase()}`}
          onPointerEnter={() => onHighlight(r.key)}
          onPointerLeave={() => onHighlight(null)}
          onFocus={() => onHighlight(r.key)}
          onBlur={() => onHighlight(null)}
          onClick={() => onPick(r.key)}
        />
      ))}
      {placed.map(({ r, m }) => (
        <span
          key={r.key}
          className={s.markerWrap}
          data-hl={highlight === r.key || undefined}
          data-marker={r.number}
          style={{ left: u(m.left), top: u(m.top), width: u(m.size), height: u(m.size) }}
        >
          <SponsorMarker n={r.number} tier={r.tier} size={u(m.size)} />
        </span>
      ))}
    </div>
  );
}

export function ShirtPanel({ club, period, ...linked }: { club: string; period: TeamPeriodView } & Linked) {
  const onShirt = period.rows.filter((r) => r.hotspot && r.side);
  const front = onShirt.filter((r) => r.side === 'front');
  const back = onShirt.filter((r) => r.side === 'back');
  const shirt = `${club} ${period.label} ${period.kitType.toLowerCase()} shirt`;
  const hint = (
    <span className={s.hint}>
      <span className={s.hintHover}>{C.hint}</span>
      <span className={s.hintTouch}>{C.hintTouch}</span>
    </span>
  );
  const head = (
    <div className={s.shirtHead}>
      <span className={s.shirtLabel}>
        {period.hasKit ? fill(C.header, { kitLabel: period.kitLabel }) : C.header.replace(' · {kitLabel}', '')}
      </span>
      {period.shirt !== 'none' && <span className={s.shirtSide}>{C.front}</span>}
    </div>
  );

  if (period.shirt === 'none')
    return (
      <aside aria-label="The shirt" className={s.shirt}>
        {head}
        <div className={s.noPhoto}>
          <ShirtOutline size={120} />
          <span>{period.hasKit ? C.noPhoto : C.noKit}</span>
        </div>
      </aside>
    );

  if (period.shirt === 'photo')
    return (
      <aside aria-label="The shirt" className={s.shirt}>
        {head}
        <Photo src={period.photos.front!} alt={`${shirt}, front`} rows={[]} {...linked} />
        <p className={`${s.hint} ${s.unmarked}`}>{C.unmarked}</p>
      </aside>
    );

  return (
    <aside aria-label="The shirt" className={s.shirt}>
      {head}
      <Photo src={period.photos.front!} alt={`${shirt}, front`} rows={front} {...linked} />
      {period.backHasSponsor ? (
        <>
          <div className={`${s.shirtHead} ${s.shirtHeadBack}`}>
            <span className={s.shirtLabel}>{C.back}</span>
          </div>
          <Photo src={period.photos.back!} alt={`${shirt}, back`} rows={back} {...linked} />
          {hint}
        </>
      ) : (
        <div className={s.backRow}>
          {/* eslint-disable-next-line @next/next/no-img-element -- static export */}
          <img src={period.photos.back!} alt={`${shirt}, back`} width={80} height={89} className={s.backThumb} />
          <div className={s.backText}>
            <span className={s.shirtLabel}>{C.backNone}</span>
            {hint}
          </div>
        </div>
      )}
    </aside>
  );
}
