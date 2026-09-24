// Site configuration. NEXT_PUBLIC_* values are inlined at build time.

/** Set when the site is served below a path, e.g. '/demo' for the copy built from the seed data. */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '';

/** URL of a file in public/, e.g. asset('assets/crests/arsenal.png'). */
export const asset = (p: string) => `${BASE_PATH}/${p.replace(/^\//, '')}`;

/** True for the demo copy of the site that keeps the design handover's sample data. */
export const IS_DEMO = process.env.NEXT_PUBLIC_DEMO === 'true';

/** The public repo for data, pipelines and agents. Unset until the org name is decided. */
export const REPO_URL = process.env.NEXT_PUBLIC_REPO_URL || null;

/** Link target for "Open data on GitHub" and friends. Falls back to the contribute section. */
export const repoHref = (path = '') =>
  REPO_URL ? `${REPO_URL.replace(/\/$/, '')}${path}` : `${BASE_PATH}/#contribute`;

/** Where contributors claim an unrated club (an issue template once the repo exists). */
export const claimClubHref = (clubName: string) =>
  REPO_URL
    ? `${REPO_URL.replace(/\/$/, '')}/issues/new?title=${encodeURIComponent(`Check ${clubName}`)}&labels=claim-club`
    : `${BASE_PATH}/#contribute`;

/** The crest next to the club name on team pages is a test feature (handover/docs/03-page-specs.md §4.1). */
export const SHOW_TEAM_CREST = process.env.NEXT_PUBLIC_SHOW_TEAM_CREST !== 'false';

/** Development-only markers (missing sources, [org] placeholder). */
export const IS_DEV = process.env.NODE_ENV !== 'production';
