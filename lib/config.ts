// Site configuration. NEXT_PUBLIC_* values are inlined at build time.

/** Set when the site is served below a path, e.g. '/demo' for the copy built from the seed data. */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '';

/** URL of a file in public/, e.g. asset('assets/crests/arsenal.png'). */
export const asset = (p: string) => `${BASE_PATH}/${p.replace(/^\//, '')}`;

/** True for the demo copy of the site that keeps the design handover's sample data. */
export const IS_DEMO = process.env.NEXT_PUBLIC_DEMO === 'true';

/** The open data: Beyond-The-Jersey/data (public). Override with NEXT_PUBLIC_REPO_URL. */
export const REPO_URL = (process.env.NEXT_PUBLIC_REPO_URL || 'https://github.com/Beyond-The-Jersey/data').replace(
  /\/$/,
  '',
);

/** The research pipeline the agents run: Beyond-The-Jersey/pipeline (public). */
export const PIPELINE_URL = (
  process.env.NEXT_PUBLIC_PIPELINE_URL || 'https://github.com/Beyond-The-Jersey/pipeline'
).replace(/\/$/, '');

/** A page in the data repo: repoHref('/issues'), repoHref('#files'). */
export const repoHref = (path = '') => `${REPO_URL}${path}`;

/** A new issue in the data repo, asking to check a club (label: club). */
export const claimClubHref = (clubName: string) =>
  `${REPO_URL}/issues/new?title=${encodeURIComponent(`Check ${clubName}`)}&labels=club`;

/** The crest next to the club name on team pages is a test feature (handover/docs/03-page-specs.md §4.1). */
export const SHOW_TEAM_CREST = process.env.NEXT_PUBLIC_SHOW_TEAM_CREST !== 'false';

/** A new issue in the data repo, asking to check an unrated sponsor (label: research). */
export const sponsorCheckHref = (sponsorName: string) =>
  `${REPO_URL}/issues/new?labels=research&title=${encodeURIComponent(`Check sponsor: ${sponsorName}`)}`;

/** The "Follow {club}" row on team pages. Alerts aren't live yet, so it opens a dialog. */
export const FOLLOW_ROW = process.env.NEXT_PUBLIC_FOLLOW_ROW !== 'false';

/** Development-only markers (missing sources). */
export const IS_DEV = process.env.NODE_ENV !== 'production';
