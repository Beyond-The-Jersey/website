// Site configuration. NEXT_PUBLIC_* values are inlined at build time.

/** The public repo for data, pipelines and agents. Unset until the org name is decided. */
export const REPO_URL = process.env.NEXT_PUBLIC_REPO_URL || null;

/** Link target for "Open data on GitHub" and friends. Falls back to the contribute section. */
export const repoHref = (path = '') => (REPO_URL ? `${REPO_URL.replace(/\/$/, '')}${path}` : '/#contribute');

/** Where contributors claim an unrated club (an issue template once the repo exists). */
export const claimClubHref = (clubName: string) =>
  REPO_URL
    ? `${REPO_URL.replace(/\/$/, '')}/issues/new?title=${encodeURIComponent(`Check ${clubName}`)}&labels=claim-club`
    : '/#contribute';

/** The crest next to the club name on team pages is a test feature (handover/docs/03-page-specs.md §4.1). */
export const SHOW_TEAM_CREST = process.env.NEXT_PUBLIC_SHOW_TEAM_CREST !== 'false';

/** Development-only markers (missing sources, [org] placeholder). */
export const IS_DEV = process.env.NODE_ENV !== 'production';
