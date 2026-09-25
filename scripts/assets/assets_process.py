#!/usr/bin/env python3
"""
Process Wikimedia-sourced assets for Behind The Jersey site:
- Download crests and kit templates
- Convert crests to 200x200 PNG
- Upscale kit templates to 720x800 (front/back) and 520x520 (grid)
- Generate manifest entries with hashes and correct metadata
"""
import json, os, hashlib, csv, urllib.request, urllib.parse, urllib.error, sys, time
from pathlib import Path
from PIL import Image

# Configuration
BASE = Path('/tmp/website')
PUBLIC_ASSETS = BASE / 'public' / 'assets'
CREST_DIR = PUBLIC_ASSETS / 'crests'
SHIRT_DIR = PUBLIC_ASSETS / 'shirts'
GRID_DIR = PUBLIC_ASSETS / 'shirts' / 'grid'
MANIFEST_FILE = PUBLIC_ASSETS / 'manifest.json'
CSV_FILE = BASE / 'scripts' / 'assets' / 'wikimedia-assets.csv'

# Ensure directories exist
CREST_DIR.mkdir(parents=True, exist_ok=True)
SHIRT_DIR.mkdir(parents=True, exist_ok=True)
GRID_DIR.mkdir(parents=True, exist_ok=True)

def md5_file(path):
    h = hashlib.md5()
    with open(path, 'rb') as f:
        for chunk in iter(lambda: f.read(8192), b''):
            h.update(chunk)
    return h.hexdigest()

def download(url, dest):
    """Download URL to dest, retrying hard on Wikimedia rate limits."""
    import time as _t
    for attempt in range(6):
        try:
            req = urllib.request.Request(
                url,
                headers={'User-Agent': 'BehindTheJerseyBot/1.0 (https://github.com/Beyond-The-Jersey; okinent@protonmail.com)'}
            )
            with urllib.request.urlopen(req, timeout=45) as resp, open(dest, 'wb') as out:
                out.write(resp.read())
            _t.sleep(0.6)
            return True
        except urllib.error.HTTPError as e:
            if e.code in (429, 503):
                wait = 4 * (attempt + 1)
                _t.sleep(wait)
                continue
            return False
        except Exception:
            _t.sleep(2)
            continue
    return False

def process_crest(row):
    club = row['club']
    url = row['direct_url']
    if not url:
        return None
    # Resume: already produced this crest in an earlier run
    existing = CREST_DIR / f"{club}.png"
    if existing.exists() and existing.stat().st_size > 0:
        return {
            'designAssetId': md5_file(existing),
            'file': f"assets/crests/{club}.png",
            'kind': 'crest', 'club': club,
            'clubName': row.get('wikipedia_page', club.replace('-', ' ').title()),
            'season': None, 'side': None,
            'source': 'Wikimedia Commons', 'license': row['license'],
        }
    # Determine extension
    ext = os.path.splitext(urllib.parse.urlparse(url).path)[1].lower()
    if ext not in ('.svg', '.png', '.jpg', '.jpeg'):
        ext = '.png'
    tmp_dir = BASE / 'tmp_crest'
    tmp_dir.mkdir(exist_ok=True)
    orig = tmp_dir / f"{club}{ext}"
    if not download(url, orig):
        return None
    # Determine final PNG path
    final_png = CREST_DIR / f"{club}.png"
    if ext == '.svg':
        # Use rsvg-convert to convert SVG to PNG 200x200
        import subprocess
        try:
            subprocess.run(['rsvg-convert', '-w', '200', '-h', '200', orig, '-o', final_png], check=True)
        except Exception as e:
            print(f"  rsvg-convert failed: {e}")
            return None
    else:
        # Convert image to PNG 200x200 with white background, preserving aspect ratio
        im = Image.open(orig)
        if im.mode in ('RGBA', 'LA', 'P'):
            im = im.convert('RGBA')
        else:
            im = im.convert('RGB')
        background = Image.new('RGB', (200, 200), (255, 255, 255))
        if im.mode == 'RGBA':
            background.paste(im, mask=im.split()[3])  # paste using alpha channel
        else:
            background.paste(im, ((200 - im.width)//2, (200 - im.height)//2))
        background.save(final_png, 'PNG')
    # Clean up temp
    try:
        os.remove(orig)
        tmp_dir.rmdir()
    except:
        pass
    # Compute hash
    hash_val = md5_file(final_png)
    rel_path = f"assets/crests/{club}.png"
    return {
        'designAssetId': hash_val,
        'file': rel_path,
        'kind': 'crest',
        'club': club,
        'clubName': row.get('wikipedia_page', club.replace('-', ' ').title()),
        'season': None,
        'side': None,
        'source': 'Wikimedia Commons',
        'license': row['license']
    }

def process_kit(row):
    club = row['club']
    asset = row['asset']  # kit-home, kit-away, kit-third
    url = row['direct_url']
    if not url:
        return []
    # Determine kit type suffix
    if asset == 'kit-home':
        suffix = 'home'
    elif asset == 'kit-away':
        suffix = 'away'
    elif asset == 'kit-third':
        suffix = 'third'
    else:
        return []
    # Resume: already produced these files
    outs = [(SHIRT_DIR / club / f"2026-27-{suffix}-front.jpg", 'front'),
            (SHIRT_DIR / club / f"2026-27-{suffix}-back.jpg", 'back'),
            (GRID_DIR / f"{club}-2026-27-{suffix}-front-square.jpg", 'front-square')]
    if all(p.exists() and p.stat().st_size > 0 for p, _ in outs):
        res = []
        for p, typ in outs:
            res.append({
                'designAssetId': md5_file(p),
                'file': f"assets/shirts/{club}/2026-27-{suffix}-{typ}.jpg" if typ != 'front-square'
                        else f"assets/shirts/grid/{club}-2026-27-{suffix}-front-square.jpg",
                'kind': 'kit-' + suffix, 'club': club,
                'clubName': row.get('wikipedia_page', club.replace('-', ' ').title()),
                'season': '2026-27', 'side': typ if typ != 'front-square' else None,
                'source': 'Wikimedia Commons', 'license': row['license'],
            })
        return res
    # Download the template (likely small PNG)
    ext = os.path.splitext(urllib.parse.urlparse(url).path)[1].lower()
    if ext not in ('.png', '.jpg', '.jpeg'):
        ext = '.png'
    tmp_dir = BASE / 'tmp_kits'
    tmp_dir.mkdir(exist_ok=True)
    tmp_file = tmp_dir / f"{club}_{suffix}{ext}"
    if not download(url, tmp_file):
        return []
    # Open image
    im = Image.open(tmp_file)
    # Convert to RGBA for consistency
    if im.mode in ('RGBA', 'LA', 'P'):
        im = im.convert('RGBA')
    else:
        im = im.convert('RGB')
    # Target sizes
    results = []
    for size, typ in [((720, 800), 'front'), ((720, 800), 'back'), ((520, 520), 'front-square')]:
        # Create white background
        if typ == 'front-square':
            bg = Image.new('RGB', size, (255, 255, 255))
        else:
            bg = Image.new('RGB', size, (255, 255, 255))
        # Compute scaling factor to fit within size while preserving aspect ratio
        scale = min(size[0] / im.width, size[1] / im.height)
        new_w = int(im.width * scale)
        new_h = int(im.height * scale)
        if new_w == 0 or new_h == 0:
            new_w, new_h = 1, 1
        resized = im.resize((new_w, new_h), Image.LANCZOS)
        # Paste centered
        if typ == 'front-square':
            bg.paste(resized, ((size[0] - new_w)//2, (size[1] - new_h)//2), resized if resized.mode == 'RGBA' else None)
        else:
            bg.paste(resized, ((size[0] - new_w)//2, (size[1] - new_h)//2), resized if resized.mode == 'RGBA' else None)
        # Determine output path
        if typ == 'front':
            out_dir = SHIRT_DIR / club
            out_dir.mkdir(exist_ok=True)
            out_file = out_dir / f"2026-27-{suffix}-front.jpg"
        elif typ == 'back':
            out_dir = SHIRT_DIR / club
            out_dir.mkdir(exist_ok=True)
            out_file = out_dir / f"2026-27-{suffix}-back.jpg"
        else:  # front-square
            out_file = GRID_DIR / f"{club}-2026-27-{suffix}-front-square.jpg"
        # Save as JPEG quality 90
        bg.convert('RGB').save(out_file, 'JPEG', quality=90)
        # Compute hash
        hash_val = md5_file(out_file)
        rel_path = f"assets/shirts/{club}/2026-27-{suffix}-front.jpg" if typ == 'front' else \
                   f"assets/shirts/{club}/2026-27-{suffix}-back.jpg" if typ == 'back' else \
                   f"assets/shirts/grid/{club}-2026-27-{suffix}-front-square.jpg"
        results.append({
            'designAssetId': hash_val,
            'file': rel_path,
            'kind': 'kit-' + suffix,
            'club': club,
            'clubName': row.get('wikipedia_page', club.replace('-', ' ').title()),
            'season': '2026-27',
            'side': typ if typ in ('front', 'back') else None,
            'source': 'Wikimedia Commons',
            'license': row['license']
        })
    # Clean up tmp
    try:
        os.remove(tmp_file)
        tmp_dir.rmdir()
    except:
        pass
    return results

def main():
    if not CSV_FILE.exists():
        print(f"CSV not found: {CSV_FILE}")
        return 1
    rows = list(csv.DictReader(open(CSV_FILE)))
    print(f"Loaded {len(rows)} asset rows")
    manifest_entries = []
    # Process crests
    crest_rows = [r for r in rows if r['asset'] == 'crest']
    print(f"Processing {len(crest_rows)} crests...")
    done = 0
    for r in crest_rows:
        entry = process_crest(r)
        if entry:
            manifest_entries.append(entry)
        else:
            print(f"  CREST FAILED: {r['club']}")
        done += 1
        if done % 25 == 0:
            print(f"  crests {done}/{len(crest_rows)}", flush=True)
    # Process kits
    kit_rows = [r for r in rows if r['asset'].startswith('kit')]
    print(f"Processing {len(kit_rows)} kit rows...")
    kdone = 0
    for r in kit_rows:
        entries = process_kit(r)
        if entries:
            manifest_entries.extend(entries)
        else:
            print(f"  KIT FAILED: {r['club']} {r['asset']}")
        kdone += 1
        if kdone % 25 == 0:
            print(f"  kits {kdone}/{len(kit_rows)}", flush=True)
    # Write manifest
    with open(MANIFEST_FILE, 'w') as f:
        json.dump(manifest_entries, f, indent=2)
    print(f"Wrote {len(manifest_entries)} manifest entries to {MANIFEST_FILE}")
    # Also output counts
    from collections import Counter
    cnt = Counter(e['kind'] for e in manifest_entries)
    print("Manifest breakdown:", dict(cnt))
    return 0

if __name__ == '__main__':
    sys.exit(main())