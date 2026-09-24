import s from './DemoBanner.module.css';

// The live site is served from the domain root; this banner only shows on the /demo copy.
const LIVE_SITE = '/';

export function DemoBanner() {
  return (
    <div className={s.banner} role="note">
      <span>Demo: this copy keeps the sample data from the design handover.</span>
      <a href={LIVE_SITE} className={s.link}>
        Go to the live site →
      </a>
    </div>
  );
}
