// Builds data/live/: the data the live site uses. Starts from the data repo's normalized/ (see
// scripts/pull-data.sh), fixes what the site can't show as is, merges data/live-overlay.json, and
// checks the result like any other source. Every change is listed in data/live/REPORT.md.
//
//   npm run data:pull && npm run data:live
//
// Fixes, all logged:
//  - kits for a YYYY-YY season with YYYY periods (2026 → 2027) get the season form (2026-27);
//  - claims with a placeholder source (example.com, "Inference based on …") are dropped, and a
//    sponsor rated only on those goes back to "not rated yet" (its owner came from the same guess);
//  - links that returned 404 (overlay deadUrls) are removed; the source stays, a dead contact goes;
//  - league status follows coverage (none rated: not-started, some: partial, all: complete).
// Nothing here sets a tier, a deal value or a source.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { loadDataset, parseFiles } from '../lib/data';
import { levelForKit } from '../lib/data/rating';
import type { RawDataset, Sponsor } from '../lib/data/schema';
import { DirectorySource } from '../lib/data/source';

type Json = Record<string, unknown>;

const REPO = path.resolve(process.env.BTJ_DATA_CHECKOUT ?? '.data-repo');
const IN = path.join(REPO, 'normalized');
const OUT = path.resolve('data', 'live');
const OVERLAY = path.resolve('data', 'live-overlay.json');

const read = (f: string) => JSON.parse(fs.readFileSync(f, 'utf8'));
const files = Object.fromEntries(
  fs
    .readdirSync(IN)
    .filter((f) => f.endsWith('.json'))
    .map((f) => [f.replace(/\.json$/, ''), read(path.join(IN, f))]),
) as Record<string, Json[]> & { meta: Json };
const overlay = read(OVERLAY) as Record<string, Json>;
const log: Record<string, string[]> = {};
const note = (section: string, line: string) => (log[section] ??= []).push(line);
const real = <T>(o: Record<string, T>) => Object.entries(o).filter(([k]) => !k.startsWith('_'));

// ---------------------------------------------------------------- seasons

const SEASON = /^(\d{4})-(\d{2})$/;
for (const k of files.kits as Json[]) {
  const m = SEASON.exec(String(k.season ?? ''));
  if (!m) continue;
  const start = m[1];
  const end = String(Number(start) + 1);
  const fixed: string[] = [];
  if (k.periodFrom === start) {
    k.periodFrom = k.season;
    fixed.push('periodFrom');
  }
  if (k.periodTo === end || k.periodTo === start) {
    k.periodTo = k.season;
    fixed.push('periodTo');
  }
  if (fixed.length) note('Seasons', `kits/${k.id}: ${fixed.join(' and ')} → ${k.season}`);
}

// ---------------------------------------------------------------- placeholder claims

const PLACEHOLDER_URL = /^https?:\/\/(www\.)?example\.(com|org|net)\b/i;
const GUESS = /^inference\b/i;
const claims = files.claims as Json[];
const guessed = new Set(
  claims
    .filter((c) => {
      const s = c.source as Json | null;
      return !s || PLACEHOLDER_URL.test(String(s.url ?? '')) || GUESS.test(String(s.name ?? ''));
    })
    .map((c) => String(c.id)),
);
files.claims = claims.filter((c) => !guessed.has(String(c.id)));
const droppedOwners = new Set<string>();
for (const s of files.sponsors as unknown as Sponsor[]) {
  const before = s.claimIds.length;
  s.claimIds = s.claimIds.filter((id) => !guessed.has(id));
  if (s.claimIds.length === before) continue;
  if (s.claimIds.length === 0 && s.tier !== 'unrated') {
    note(
      'Ratings resting on guessed claims',
      `sponsors/${s.id}: was "${s.tier}" (${s.verdict ?? ''}) → not rated yet; owner "${s.ownerId}" dropped`,
    );
    if (s.ownerId) droppedOwners.add(s.ownerId);
    Object.assign(s, { tier: 'unrated', status: 'unrated', verdict: null, ownerId: null, ownership: null });
  }
}
for (const id of guessed) note('Guessed claims removed', `claims/${id}`);
// Owners that only existed for those guesses.
const stillUsed = new Set([
  ...(files.sponsors as Json[]).map((s) => s.ownerId),
  ...(files.owners as Json[]).map((o) => o.parentId),
  ...(files.claims as Json[]).flatMap((c) => c.ownerIds as string[]),
]);
files.owners = (files.owners as Json[]).filter((o) => {
  const drop = droppedOwners.has(String(o.id)) && !stillUsed.has(o.id);
  if (drop) note('Guessed owners removed', `owners/${o.id} (${o.name})`);
  return !drop;
});

// ---------------------------------------------------------------- dead links

const dead = new Map(real(overlay.deadUrls as Record<string, string>));
const unlink = (o: unknown, where: string): void => {
  if (Array.isArray(o)) return o.forEach((x) => unlink(x, where));
  if (!o || typeof o !== 'object') return;
  const x = o as Json;
  if (typeof x.url === 'string' && dead.has(x.url)) {
    note('Dead links removed', `${where}: ${x.url}`);
    x.note = [x.note, `Link removed (${dead.get(x.url)}): ${x.url}`].filter(Boolean).join(' ');
    x.url = null;
  }
  for (const v of Object.values(x)) unlink(v, where);
};
for (const f of ['claims', 'deals', 'kits', 'changes', 'dropped', 'leagues'] as const)
  for (const x of files[f] as Json[]) unlink(x, `${f}/${x.id}`);
for (const c of files.contacts as Json[]) {
  const channels = c.channels as Json[];
  c.channels = channels.filter((ch) => {
    const src = ch.source as Json;
    const bad = dead.has(String(ch.value)) || dead.has(String(src?.url));
    if (bad) note('Dead links removed', `contacts/${c.clubId}: ${ch.type} ${ch.value}`);
    return !bad;
  });
}
// A source without its link keeps its name and date: the site shows it without "↗".

// ---------------------------------------------------------------- overlay

function merge(target: Json, patch: Json) {
  for (const [k, v] of Object.entries(patch)) {
    if (v && typeof v === 'object' && !Array.isArray(v) && target[k] && typeof target[k] === 'object')
      merge(target[k] as Json, v as Json);
    else target[k] = v;
  }
}
for (const file of ['levels', 'sponsors', 'kits', 'deals', 'clubs'] as const) {
  const patches = overlay[file] as Record<string, Json> | undefined;
  if (!patches) continue;
  const byId = new Map((files[file] as Json[]).map((x) => [x.id, x]));
  for (const [id, patch] of real(patches)) {
    const target = byId.get(id);
    if (!target) {
      note('Overlay entries without a record', `${file}/${id}`);
      continue;
    }
    merge(target, patch);
    note('Overlay', `${file}/${id}: ${Object.keys(patch).join(', ')}`);
  }
}

// ---------------------------------------------------------------- rating holds and claim edits

// Sponsors rated on state ownership alone go back to "not rated yet" (status being-rated) with
// their owner and claims kept, so the page still shows what we know.
for (const [id, reason] of real(overlay.ratingHolds as Record<string, string>)) {
  const sp = (files.sponsors as Json[]).find((s) => s.id === id);
  if (!sp) {
    note('Overlay entries without a record', `ratingHolds/${id}`);
    continue;
  }
  if (sp.tier === 'unrated') continue;
  note('Ratings on hold (shown as not rated yet, data kept)', `sponsors/${id}: was "${sp.tier}". ${reason}`);
  sp.tier = 'unrated';
  sp.status = 'being-rated';
}
for (const [id, pairs] of real(overlay.claimEdits as Record<string, [string, string][]>)) {
  const claim = (files.claims as Json[]).find((c) => c.id === id);
  for (const [from, to] of pairs) {
    if (claim && typeof claim.text === 'string' && claim.text.includes(from)) {
      claim.text = claim.text.replace(from, to);
      note('Rating commentary removed from claims', `claims/${id}: "${from.trim()}"`);
    } else note('Claim edits not applied (text changed upstream)', `claims/${id}: "${from.trim().slice(0, 60)}…"`);
  }
}

// ---------------------------------------------------------------- stale headlines

// A headline with {level} works for any rated shirt; one without it is a "not rated yet" sentence.
// When the rating has moved on (Villa 2024/25 was unrated in the design, it is Clean now), drop the
// headline and let the site build one from the sponsors.
{
  const tiers = new Map((files.sponsors as unknown as Sponsor[]).map((s) => [s.id, s.tier]));
  for (const k of files.kits as Json[]) {
    if (typeof k.headline !== 'string') continue;
    const level = levelForKit(k as unknown as RawDataset['kits'][number], (id) => tiers.get(id) ?? 'unrated');
    const saysLevel = k.headline.includes('{level}');
    if (saysLevel === (level !== 'not-rated')) continue;
    note('Stale headlines removed', `kits/${k.id}: "${k.headline}" no longer fits (${level})`);
    delete k.headline;
  }
}

// ---------------------------------------------------------------- league status

const tierOf = new Map((files.sponsors as unknown as Sponsor[]).map((s) => [s.id, s.tier]));
const kitsByClub = new Map<string, Json[]>();
for (const k of files.kits as Json[]) {
  if (k.kitType !== 'home') continue;
  kitsByClub.set(String(k.clubId), [...(kitsByClub.get(String(k.clubId)) ?? []), k]);
}
const end = (k: Json) => String(k.periodTo ?? k.season ?? k.periodFrom ?? '');
const rated = (clubId: string) => {
  const kits = kitsByClub.get(clubId) ?? [];
  const now = kits.reduce<Json | null>((b, k) => (!b || end(k) >= end(b) ? k : b), null);
  return Boolean(
    now &&
    levelForKit(now as unknown as RawDataset['kits'][number], (id) => tierOf.get(id) ?? 'unrated') !== 'not-rated',
  );
};
for (const l of files.leagues as Json[]) {
  const clubs = (files.clubs as Json[]).filter((c) => c.leagueId === l.id);
  const n = clubs.filter((c) => rated(String(c.id))).length;
  const total = Number(l.clubCount ?? clubs.length);
  const status = n === 0 ? 'not-started' : n >= total ? 'complete' : 'partial';
  if (status !== l.status)
    note('League status', `leagues/${l.id}: "${l.status}" → "${status}" (${n} of ${total} rated)`);
  l.status = status;
}

// ---------------------------------------------------------------- meta, write, check

let commit = String(files.meta.sourceCommit ?? '');
try {
  commit = execFileSync('git', ['-C', REPO, 'rev-parse', '--short', 'HEAD'], { encoding: 'utf8' }).trim();
} catch {
  // Not a git checkout: keep the commit the data repo stamped.
}
files.meta = {
  ...files.meta,
  generatedBy: `${files.meta.generatedBy ?? 'Beyond-The-Jersey/data'}; fixed and extended by the website (scripts/build-live-data.ts, data/live-overlay.json)`,
  sourceCommit: commit,
};

async function main() {
  const raw = parseFiles(files, 'live'); // throws with the schema errors, before anything is written
  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(OUT, { recursive: true });
  // Written in the data repo's own key order, so the files diff cleanly against normalized/.
  for (const name of Object.keys(raw)) {
    fs.writeFileSync(path.join(OUT, `${name}.json`), `${JSON.stringify(files[name], null, 2)}\n`);
  }
  const { dataset, warnings } = await loadDataset({ source: new DirectorySource('live', OUT) });
  // Serious and severe mean documented abuses by the owner. Without a why text there is no sourced
  // claim of that on file, so a person should check the rating (it may be state ownership alone).
  const onShirts = new Map<string, string[]>();
  for (const k of dataset.kits)
    for (const ks of k.sponsors) {
      const club = dataset.byId.club.get(k.clubId)?.shortName ?? k.clubId;
      onShirts.set(ks.sponsorId, [...new Set([...(onShirts.get(ks.sponsorId) ?? []), club])]);
    }
  for (const sp of dataset.sponsors)
    if ((sp.tier === 'serious' || sp.tier === 'severe') && !sp.why)
      note(
        'Ratings to review (serious or severe, no sourced abuse claim to write a why text from)',
        `sponsors/${sp.id} (${sp.tier}, owner ${sp.ownerId}): on ${onShirts.get(sp.id)?.join(', ') || 'no current kit'}`,
      );
  const lines = [
    '# data/live',
    '',
    `Built by \`npm run data:live\` from Beyond-The-Jersey/data \`${commit}\` (\`normalized/\`, updated ${raw.meta.updatedAt}) and \`data/live-overlay.json\`. Don't edit these files by hand: change the data repo or the overlay and rebuild.`,
    '',
    `${dataset.clubs.length} clubs, ${dataset.kits.length} kits, ${dataset.sponsors.length} sponsors, ${dataset.claims.length} claims. ${warnings.length} warnings.`,
    '',
    ...Object.entries(log).flatMap(([section, items]) => [
      `## ${section} (${items.length})`,
      '',
      ...items.map((i) => `- ${i}`),
      '',
    ]),
  ];
  fs.writeFileSync(path.join(OUT, 'REPORT.md'), lines.join('\n'));
  console.log(
    `data/live: ${Object.entries(log)
      .map(([s, i]) => `${i.length} ${s.toLowerCase()}`)
      .join(', ')}. See data/live/REPORT.md.`,
  );
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
