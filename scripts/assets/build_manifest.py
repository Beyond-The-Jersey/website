#!/usr/bin/env python3
"""Write public/assets/manifest.json in the exact shape the data builder reads.

Entry schema (must not drift — `build_normalized.py` matches on `kind`, `club`,
`season` and `side`):
    designAssetId, file, kind, club, clubName, season, side, source, license
`kind` is one of: crest | shirt-photo | shirt-square.

Every file on disk gets an entry, so nothing on disk is invisible to the builder and
`assets: UNREFERENCED shirt images` stays empty.

Metadata for a file comes from, in order: the pre-existing manifest entry (design
handover assets), the Wikimedia source CSV, otherwise a documented fallback.

Usage:  python3 scripts/assets/build_manifest.py [--orig /tmp/orig_manifest.json]
"""
import csv, hashlib, json, os, re, sys
from pathlib import Path

BASE = Path(__file__).resolve().parents[2]          # repo root
PUBLIC = BASE / 'public'
ASSETS = PUBLIC / 'assets'
CSV_FILE = BASE / 'scripts' / 'assets' / 'wikimedia-assets.csv'
OUT = ASSETS / 'manifest.json'

HANDOVER_LICENSE = ('NOT CLEARED: hackathon mock only. Get permission or licensed '
                    'images before going public.')


def md5(path):
    h = hashlib.md5()
    with open(path, 'rb') as f:
        for chunk in iter(lambda: f.read(1 << 20), b''):
            h.update(chunk)
    return h.hexdigest()


def club_names():
    names = {}
    for cand in ('/tmp/btd-data/normalized/clubs.json', '/tmp/data/normalized/clubs.json'):
        if os.path.exists(cand):
            for c in json.load(open(cand, encoding='utf-8')):
                names[c['id']] = c.get('name') or c.get('shortName') or c['id']
            break
    return names


def classify(rel):
    """(kind, club, season, side) from a repo-relative path, or None."""
    p = Path(rel)
    if p.parts[:2] == ('assets', 'crests'):
        return 'crest', p.stem, None, None
    if p.parts[:2] == ('assets', 'shirts') and p.parts[2] != 'grid':
        # assets/shirts/<club>/<season>-<type>-<side>.jpg — club is the directory
        m = re.match(r'^(\d{4}(?:-\d{2})?)-(home|away|third)-(front|back)$', p.stem)
        if m:
            return 'shirt-photo', p.parts[2], m.group(1), m.group(3)
    if p.parts[:3] == ('assets', 'shirts', 'grid'):
        # assets/shirts/grid/<club>-<season>-<type>-front-square.jpg
        m = re.match(r'(.+?)-(\d{4}(?:-\d{2})?)-(home|away|third)-front-square$', p.stem)
        if m:
            return 'shirt-square', m.group(1), m.group(2), 'front'
    return None


def main():
    orig = {}
    orig_path = None
    for i, a in enumerate(sys.argv):
        if a == '--orig' and i + 1 < len(sys.argv):
            orig_path = sys.argv[i + 1]
    if orig_path and os.path.exists(orig_path):
        for e in json.load(open(orig_path, encoding='utf-8')):
            orig[e['file']] = e
    print(f'handover entries loaded: {len(orig)}')

    csvmeta = {}
    for r in csv.DictReader(open(CSV_FILE, encoding='utf-8')):
        cid, asset = r['club'], r['asset']
        if asset == 'crest':
            key = f'assets/crests/{cid}.png'
        else:
            kind = asset.replace('kit-', '')
            key = f'assets/shirts/{cid}/2026-27-{kind}-front.jpg'
        csvmeta[key] = r
        if asset.startswith('kit'):
            csvmeta[f'assets/shirts/{cid}/2026-27-{asset.replace("kit-","")}-back.jpg'] = r
            csvmeta[f'assets/shirts/grid/{cid}-2026-27-{asset.replace("kit-","")}-front-square.jpg'] = r
    print(f'wikimedia csv entries: {len(csvmeta)}')

    names = club_names()
    entries, unknown = [], []
    for path in sorted(ASSETS.rglob('*')):
        if not path.is_file() or path.name == 'manifest.json':
            continue
        rel = str(path.relative_to(PUBLIC))
        if '@' in path.name or path.name == '.DS_Store':
            continue
        cls = classify(rel)
        if not cls:
            unknown.append(rel)
            continue
        kind, club, season, side = cls
        if kind == 'crest' and path.suffix.lower() not in ('.png', '.jpg', '.jpeg', '.svg'):
            unknown.append(rel)
            continue
        if rel in orig:
            src, lic = orig[rel].get('source'), orig[rel].get('license')
        elif rel in csvmeta:
            r = csvmeta[rel]
            src = f"Wikimedia Commons — {r['wikimedia_file']} ({r['direct_url']})"
            lic = r['license']
        else:
            src, lic = 'unknown', 'unknown'
        entries.append({
            'designAssetId': md5(path),
            'file': rel,
            'kind': kind,
            'club': club,
            'clubName': names.get(club, club),
            'season': season,
            'side': side,
            'source': src,
            'license': lic,
        })

    entries.sort(key=lambda e: (e['kind'], e['club'], e['season'] or '', e['side'] or ''))
    OUT.write_text(json.dumps(entries, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')

    from collections import Counter
    print('wrote', len(entries), 'entries')
    print('by kind:', dict(Counter(e['kind'] for e in entries)))
    print('with a real source:', sum(1 for e in entries if e['source'] not in (None, 'unknown')))
    if unknown:
        print('NOT CLASSIFIED (%d):' % len(unknown), unknown[:10])


if __name__ == '__main__':
    main()
