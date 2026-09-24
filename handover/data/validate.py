"""Quick check of the seed data: JSON Schema validation plus reference and file checks.
Usage: pip install jsonschema && python data/validate.py   (run from the handover root)"""
import json, glob, os, sys
import jsonschema
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
load = lambda n: json.load(open(os.path.join(root, 'data', 'seed', n + '.json')))
problems = []
for f in sorted(glob.glob(os.path.join(root, 'data', 'schema', '*.schema.json'))):
    name = os.path.basename(f).replace('.schema.json', '')
    for e in jsonschema.Draft202012Validator(json.load(open(f))).iter_errors(load(name)):
        problems.append(f'{name}: {list(e.path)} {e.message[:140]}')
ids = {n: {x['id'] for x in load(n)} for n in ['clubs', 'leagues', 'owners', 'claims', 'sponsors']}
def need(kind, v, where):
    if v and v not in ids[kind]: problems.append(f'{where}: unknown {kind} id "{v}"')
def file(p, where):
    if p and not os.path.exists(os.path.join(root, p)): problems.append(f'{where}: missing file {p}')
for c in load('clubs'): need('leagues', c['leagueId'], 'clubs/' + c['id']); file(c['crest'], 'clubs/' + c['id'])
for o in load('owners'): need('owners', o['parentId'], 'owners/' + o['id'])
for s in load('sponsors'):
    need('owners', s['ownerId'], 'sponsors/' + s['id'])
    for cl in s['claimIds']: need('claims', cl, 'sponsors/' + s['id'])
for c in load('claims'):
    for o in c['ownerIds']: need('owners', o, 'claims/' + c['id'])
    if not c['source'] or not c['source'].get('url'): print(f'warning: claims/{c["id"]} has no source URL yet')
for k in load('kits'):
    need('clubs', k['clubId'], 'kits/' + k['id'])
    for p in k['sponsors']: need('sponsors', p['sponsorId'], 'kits/' + k['id'])
    for v in k['photos'].values(): file(v, 'kits/' + k['id'])
for d in load('deals'): need('clubs', d['clubId'], 'deals/' + d['id']); need('sponsors', d['sponsorId'], 'deals/' + d['id'])
for n in ['changes', 'dropped']:
    for x in load(n):
        need('clubs', x.get('clubId'), f'{n}/{x["id"]}'); need('sponsors', x.get('sponsorId'), f'{n}/{x["id"]}')
        if not x.get('source'): print(f'warning: {n}/{x["id"]} has no source yet')
print('\n'.join(problems) if problems else 'OK: schemas and references valid')
sys.exit(1 if problems else 0)
