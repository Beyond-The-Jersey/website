"""Validate a Behind the Jersey dataset: JSON Schema, references between files, and data rules.

Usage (needs `pip install jsonschema`):
    python3 data/validate.py                      # validates data/seed
    python3 data/validate.py path/to/normalized   # validates another folder with the same files
    python3 data/validate.py path --assets public # also checks that asset paths exist under public/

Exit code 1 on errors. Warnings (missing source URLs, unsourced items) don't fail.
The website runs the same checks in TypeScript (`npm run validate:data`).
"""
import glob, json, os, re, sys

import jsonschema

here = os.path.dirname(os.path.abspath(__file__))
args = sys.argv[1:]
assets_root = None
if '--assets' in args:
    i = args.index('--assets')
    assets_root = args[i + 1]
    del args[i:i + 2]
data_dir = args[0] if args else os.path.join(here, 'seed')
schema_dir = os.path.join(here, 'schema')

errors, warnings = [], []
data = {}
for f in sorted(glob.glob(os.path.join(schema_dir, '*.schema.json'))):
    name = os.path.basename(f).replace('.schema.json', '')
    path = os.path.join(data_dir, name + '.json')
    if not os.path.exists(path):
        errors.append(f'{name}.json: file missing')
        continue
    data[name] = json.load(open(path, encoding='utf-8'))
    for e in jsonschema.Draft202012Validator(json.load(open(f, encoding='utf-8'))).iter_errors(data[name]):
        errors.append(f'{name}: {list(e.path)} {e.message[:160]}')

get = lambda n: data.get(n, []) if isinstance(data.get(n, []), list) else []
ids = {n: {x['id'] for x in get(n)} for n in ['sports', 'leagues', 'clubs', 'owners', 'claims', 'sponsors', 'kits']}
for n in ids:
    seen = set()
    for x in get(n):
        if x['id'] in seen:
            errors.append(f'{n}: duplicate id "{x["id"]}"')
        seen.add(x['id'])


def need(kind, v, where):
    if v and v not in ids[kind]:
        errors.append(f'{where}: unknown {kind} id "{v}"')


def asset(p, where):
    if assets_root and p and not os.path.exists(os.path.join(assets_root, p)):
        warnings.append(f'{where}: asset not found: {p}')


def sourced(s, where):
    if not s:
        warnings.append(f'{where}: no source yet')
    elif not s.get('url'):
        warnings.append(f'{where}: source "{s.get("name")}" has no URL yet')


for l in get('leagues'):
    need('sports', l['sportId'], 'leagues/' + l['id'])
    count = sum(1 for c in get('clubs') if c['leagueId'] == l['id'])
    if l.get('clubCount') is not None and count > l['clubCount']:
        errors.append(f'leagues/{l["id"]}: {count} clubs in clubs.json but clubCount is {l["clubCount"]}')
for c in get('clubs'):
    need('sports', c['sportId'], 'clubs/' + c['id'])
    need('leagues', c['leagueId'], 'clubs/' + c['id'])
    asset(c['crest'], 'clubs/' + c['id'])
for o in get('owners'):
    need('owners', o['parentId'], 'owners/' + o['id'])
for s in get('sponsors'):
    need('owners', s['ownerId'], 'sponsors/' + s['id'])
    for cl in s['claimIds']:
        need('claims', cl, 'sponsors/' + s['id'])
    if s['tier'] != 'unrated' and s['status'] != 'rated':
        errors.append(f'sponsors/{s["id"]}: tier "{s["tier"]}" needs status "rated"')
    if s['tier'] in ('concern', 'serious', 'severe') and not s['claimIds']:
        errors.append(f'sponsors/{s["id"]}: tier "{s["tier"]}" needs at least one claim')
for c in get('claims'):
    for o in c['ownerIds']:
        need('owners', o, 'claims/' + c['id'])
    sourced(c['source'], 'claims/' + c['id'])
for k in get('kits'):
    where = 'kits/' + k['id']
    need('clubs', k['clubId'], where)
    for v in k['photos'].values():
        asset(v, where)
    for p in k['sponsors']:
        need('sponsors', p['sponsorId'], where)
        if 'hotspot' in p and not ('side' in p and 'cardSlot' in p):
            errors.append(f'{where}: sponsor "{p["sponsorId"]}" has a hotspot but no side/cardSlot')
        h = p.get('hotspot')
        if h and not all(0 <= h[a] <= 1 for a in 'xywh'):
            errors.append(f'{where}: hotspot for "{p["sponsorId"]}" must use fractions between 0 and 1')
    if k['periodFrom'] and k['periodTo'] and k['periodFrom'] > k['periodTo']:
        errors.append(f'{where}: periodFrom is after periodTo')
for d in get('deals'):
    need('clubs', d['clubId'], 'deals/' + d['id'])
    need('sponsors', d['sponsorId'], 'deals/' + d['id'])
    if d['value'] is not None:
        sourced(d['source'], 'deals/' + d['id'])
for n in ['changes', 'dropped']:
    for x in get(n):
        need('clubs', x.get('clubId'), f'{n}/{x["id"]}')
        need('sponsors', x.get('sponsorId'), f'{n}/{x["id"]}')
        sourced(x.get('source'), f'{n}/{x["id"]}')
placeholder = re.compile(r'X{3,}|\.\.\.|example\.', re.I)
for c in get('contacts'):
    need('clubs', c['clubId'], 'contacts/' + c['clubId'])
    for ch in c['channels']:
        if placeholder.search(ch['value']):
            errors.append(f'contacts/{c["clubId"]}: placeholder value "{ch["value"]}"')
        if ch['type'] == 'email' and not re.fullmatch(r'[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}', ch['value']):
            errors.append(f'contacts/{c["clubId"]}: not a valid ASCII email address "{ch["value"]}"')

for w in warnings:
    print('warning:', w)
print('\n'.join('error: ' + e for e in errors) if errors else f'OK: {data_dir} matches the schemas and references are valid')
sys.exit(1 if errors else 0)
