// npm run validate:data: validates the configured data source (BTJ_DATA_SOURCE) against the schemas,
// checks references and asset files, and prints warnings for missing sources.
import { DataError, loadDataset } from '../lib/data';
import { sourceFromEnv } from '../lib/data/source';

async function main() {
  const source = sourceFromEnv();
  try {
    const { dataset, warnings } = await loadDataset({ source });
    for (const w of warnings) console.warn(`warning: ${w}`);
    console.log(
      `OK: ${source.name} data (${source.location}) is valid. ${dataset.clubs.length} clubs, ${dataset.kits.length} kits, ` +
        `${dataset.sponsors.length} sponsors, ${dataset.claims.length} claims, ${warnings.length} warnings.`,
    );
  } catch (e) {
    console.error(e instanceof DataError ? e.message : e);
    process.exit(1);
  }
}

main();
