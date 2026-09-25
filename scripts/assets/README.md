# Asset pipeline

Sourced club crests and 2026-27 kit images for every club in the dataset, rendered to
the exact sizes the site serves. Source: Wikimedia Commons / Wikipedia.

## Output

| path | size | count |
| --- | --- | --- |
| `public/assets/crests/<club>.png` | 200x200 PNG, white pad | 331 (every club) |
| `public/assets/shirts/<club>/2026-27-<home\|away\|third>-front.jpg` | 720x800 JPG | 216 |
| `public/assets/shirts/<club>/2026-27-<home\|away\|third>-back.jpg` | 720x800 JPG | 216 |
| `public/assets/shirts/grid/<club>-2026-27-<type>-front-square.jpg` | 520x520 JPG | 218 |
| `public/assets/manifest.json` | one entry per file, md5 `designAssetId` | 1627 |

## Files here

- `wikimedia-assets.csv` — the source of truth: one row per asset with the Commons
  `File:` title, direct upload URL, licence and the Wikipedia page it came from.
- `assets_process.py` — downloads each URL and renders it to the target size.
  Resumable and non-destructive: anything already on disk is kept, so a rerun never
  clobbers the design handover's own shirt images. `BTJ_OVERWRITE=1` forces a re-render.
- `fix_crests.py` — re-renders every crest with correct fit-and-centre and swaps the
  handful that landed on the wrong file. Run after a fresh `assets_process.py`.
- `build_manifest.py` — writes `public/assets/manifest.json` for **every file on disk**,
  in the exact shape the data builder reads. `kind` is `crest` / `shirt-photo` /
  `shirt-square` and every entry carries `file`, `club`, `clubName`, `season`, `side`,
  `source`, `license`, `designAssetId`. Get this shape wrong and `build_normalized.py`
  silently skips every kit image.

```bash
cd <repo root>
python3 scripts/assets/assets_process.py    # ~15 min, throttled
python3 scripts/assets/fix_crests.py        # ~9 min
python3 scripts/assets/build_manifest.py --orig /path/to/original/manifest.json
```

Both scripts throttle to roughly one request a second and back off on HTTP 429, because
`upload.wikimedia.org` rate-limits hard if you do not.

## Licences — read before shipping

**212 of the 331 crests are non-free.** 206 fair-use on en.wiki plus 6 on Commons. That is
unavoidable: the real club marks are copyrighted and the free redraws look wrong. Keep the
`wikimedia_file` value for attribution; treat crests as fair-use / nominative use.

Kit templates are the opposite — overwhelmingly CC0 and CC BY-SA, so shirts are clean.

Full per-file licence breakdown is in `manifest.json` (`license` field) and in the data
repo at `assets/README.md`.

## Note on kits

Kit images are Wikipedia's flat kit templates, upscaled with Lanczos onto a white canvas.
They carry no baked-in sponsor logos, so the site's sponsor overlays sit on them uniformly.
That means all 331 clubs look consistent, at the cost of the four clubs that previously had
photographic shirt assets.
