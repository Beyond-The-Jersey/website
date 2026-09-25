# Behind the Jersey: team page v3 update

A small handover for Claude Code. The site was already built from the first handover; this folder tells it how to **replace the team page** with the new two-column design (v3) the team picked after user testing.

**Start with `UPDATE.md`.** It has the kickoff prompt at the top.

```
UPDATE.md                          the spec: what to remove, what to build, rules for all clubs, data, mobile, done criteria
design/screenshots/*.png           the visual target (1440px, full page)
design/static/*.html               the same states as static HTML (images from ../../assets/)
design/source/Club-2col-v3.dc.html the design source (same .dc.html format as the first handover)
data/additions.json                new data fields + every fixed string on the page
assets/                            the 5 images the snapshots use (already in your repo from the first handover)
```

Where to put it: next to the first handover in the repo, e.g. `handover/update-v3/`.

Only the team page changes. The landing page, the overview, the header, the footer and the look stay the same.
