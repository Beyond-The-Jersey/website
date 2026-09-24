// After `next build`: give the Open Graph images a .png extension. Next's static export writes
// them as files named `opengraph-image`, and static hosts like GitHub Pages pick the content type
// from the extension, so without one crawlers get application/octet-stream.
import fs from 'node:fs';
import path from 'node:path';

const OUT = 'out';
let renamed = 0;
let rewritten = 0;

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p);
    else if (entry.name === 'opengraph-image') {
      fs.renameSync(p, `${p}.png`);
      renamed++;
    } else if (/\.(html|txt)$/.test(entry.name)) {
      const s = fs.readFileSync(p, 'utf8');
      const t = s.replace(/\/opengraph-image(?=[?"'\\])/g, '/opengraph-image.png');
      if (t !== s) {
        fs.writeFileSync(p, t);
        rewritten++;
      }
    }
  }
}

walk(OUT);
console.log(`postbuild: ${renamed} Open Graph images renamed to .png, ${rewritten} files updated`);
