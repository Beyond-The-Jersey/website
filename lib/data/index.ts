// The one entry point pages use: `const ds = await getDataset()`.
// Loads the configured source, validates it with zod, checks references and asset files, and
// returns the data with lookup maps. Runs at build time only (it reads files).
import fs from 'node:fs';
import path from 'node:path';
import { assetPaths, checkDataset } from './checks';
import { buildDataset, type Dataset } from './dataset';
import { rawDataset, type RawDataset } from './schema';
import { DataError, sourceFromEnv, type DataSource, type RawFiles } from './source';

export type { Dataset } from './dataset';
export { DataError };

export function parseFiles(files: RawFiles, sourceName: string): RawDataset {
  const withDefaults = {
    ...files,
    contacts: files.contacts ?? [],
    meta: files.meta ?? { schemaVersion: 1, updatedAt: latestChangeDate(files.changes) },
  };
  const parsed = rawDataset.safeParse(withDefaults);
  if (!parsed.success) {
    const lines = parsed.error.issues.slice(0, 30).map((i) => `  ${i.path.join('.')}: ${i.message}`);
    throw new DataError(`${sourceName} data doesn't match the schema:\n${lines.join('\n')}`);
  }
  return parsed.data;
}

function latestChangeDate(changes: unknown): string {
  const dates = Array.isArray(changes) ? changes.map((c) => String((c as { date?: string }).date ?? '')) : [];
  const latest = dates.sort().at(-1) ?? '1970-01-01';
  return latest.length === 7 ? `${latest}-01` : latest.length === 4 ? `${latest}-01-01` : latest;
}

export interface LoadOptions {
  source?: DataSource;
  /** Folder that asset paths are relative to. Pass null to skip the file check. */
  publicDir?: string | null;
}

export async function loadDataset(opts: LoadOptions = {}): Promise<{ dataset: Dataset; warnings: string[] }> {
  const source = opts.source ?? sourceFromEnv();
  const raw = parseFiles(await source.load(), source.name);
  const { errors, warnings } = checkDataset(raw);
  const publicDir = opts.publicDir === undefined ? path.join(process.cwd(), 'public') : opts.publicDir;
  if (publicDir) {
    for (const a of assetPaths(raw)) {
      if (!fs.existsSync(path.join(publicDir, a.path))) errors.push(`${a.where}: asset not found: ${a.path}`);
    }
  }
  if (errors.length)
    throw new DataError(`${source.name} data (${source.location}) has errors:\n  ${errors.join('\n  ')}`);
  return { dataset: buildDataset(raw, source.name), warnings };
}

let cached: Promise<Dataset> | null = null;

/** Memoised for the whole build. */
export function getDataset(): Promise<Dataset> {
  cached ??= loadDataset().then((r) => r.dataset);
  return cached;
}
