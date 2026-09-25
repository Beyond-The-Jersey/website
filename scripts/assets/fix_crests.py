#!/usr/bin/env python3
"""Re-render every crest correctly (fit + centre, white pad) and replace the
handful that landed on the wrong file."""
import csv, os, urllib.request, urllib.parse, urllib.error, time, subprocess
from pathlib import Path
from PIL import Image, ImageStat

BASE = Path('/tmp/website')
CREST_DIR = BASE / 'public' / 'assets' / 'crests'
TMP = BASE / 'tmp_crest_fix'
TMP.mkdir(exist_ok=True)
CREST_DIR.mkdir(parents=True, exist_ok=True)

UA = 'BehindTheJerseyBot/1.0 (https://github.com/Beyond-The-Jersey; okinent@protonmail.com)'

OVERRIDE = {
    'alpine': 'File:Alpine F1 Team Logo.svg',
    'haas': 'File:TGR Haas F1 Team Logo (2026).svg',
    'crystal-palace': 'File:Crystal Palace FC logo (2022).svg',
    'new-zealand': 'File:New Zealand Football logo.svg',
    'paraguay': 'File:Asociación Paraguaya de Fútbol logo.svg',
    'williams': 'File:Williams F1 Team 2026 Logo-1.webp',
    'qatar': 'File:Qatar Football Association logo.svg',
}


def fetch(url, dest, tries=6):
    for a in range(tries):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': UA})
            with urllib.request.urlopen(req, timeout=45) as r, open(dest, 'wb') as o:
                o.write(r.read())
            time.sleep(0.35)
            return True
        except urllib.error.HTTPError as e:
            if e.code in (429, 503):
                time.sleep(4 * (a + 1)); continue
            return False
        except Exception:
            time.sleep(2); continue
    return False


def url_for(wiki_file, tries=4):
    """Resolve a File: title to a direct upload URL."""
    t = wiki_file.replace('_', ' ')
    for a in range(tries):
        try:
            qs = urllib.parse.urlencode({'action': 'query', 'titles': t,
                                         'prop': 'imageinfo', 'iiprop': 'url',
                                         'format': 'json', 'formatversion': '2'}, safe='')
            req = urllib.request.Request('https://en.wikipedia.org/w/api.php?' + qs,
                                         headers={'User-Agent': UA})
            with urllib.request.urlopen(req, timeout=45) as r:
                import json as _j
                d = _j.load(r)
            for p in d.get('query', {}).get('pages', []):
                ii = p.get('imageinfo') or []
                if ii:
                    time.sleep(0.25)
                    return ii[0]['url']
            return None
        except urllib.error.HTTPError as e:
            if e.code in (429, 503):
                time.sleep(3 * (a + 1)); continue
            return None
        except Exception:
            time.sleep(1.5); continue
    return None


def nonwhite_frac(im):
    g = im.convert('L')
    h = g.histogram()
    return sum(h[:235]) / float(sum(h))


def render(src, dest):
    """Render src to a 200x200 white-padded PNG. Returns non-white fraction."""
    ext = src.suffix.lower()
    canvas = Image.new('RGBA', (200, 200), (255, 255, 255, 255))
    if ext == '.svg':
        tmp = TMP / (src.stem + '_r.png')
        subprocess.run(['rsvg-convert', '-w', '200', '-h', '200', str(src), '-o', str(tmp)], check=True)
        im = Image.open(tmp).convert('RGBA')
    else:
        im = Image.open(src)
        im = im.convert('RGBA') if im.mode in ('RGBA', 'LA', 'P') else im.convert('RGB').convert('RGBA')
    im.thumbnail((196, 196), Image.LANCZOS)
    canvas.paste(im, ((200 - im.width) // 2, (200 - im.height) // 2), im)
    canvas.convert('RGB').save(dest, 'PNG')
    return nonwhite_frac(Image.open(dest))


def main():
    rows = list(csv.DictReader(open(BASE / 'scripts' / 'assets' / 'wikimedia-assets.csv')))
    crests = [r for r in rows if r['asset'] == 'crest']
    print(f'rendering {len(crests)} crests; overrides: {len(OVERRIDE)}')

    bad = []
    for i, r in enumerate(crests, 1):
        club = r['club']
        wiki = OVERRIDE.get(club, r['wikimedia_file'])
        url = url_for(wiki) if club in OVERRIDE else r['direct_url']
        if not url:
            bad.append((club, 'no-url')); continue
        ext = os.path.splitext(urllib.parse.urlparse(url).path)[1].lower() or '.png'
        src = TMP / f'{club}{ext}'
        if not fetch(url, src):
            bad.append((club, 'download')); continue
        try:
            frac = render(src, CREST_DIR / f'{club}.png')
        except Exception as e:
            bad.append((club, f'render:{e}')); continue
        if frac < 0.01:
            bad.append((club, f'blank:{frac:.4f}'))
        if i % 40 == 0:
            print(f'  {i}/{len(crests)} (bad so far {len(bad)})', flush=True)

    print(f'\ndone. problems: {len(bad)}')
    for b in bad:
        print('  ', b)
    open('/tmp/crest_bad.txt', 'w').write('\n'.join(f'{c}\t{why}' for c, why in bad))


if __name__ == '__main__':
    main()
