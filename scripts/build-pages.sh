#!/usr/bin/env bash
# Builds what GitHub Pages serves:
#   /       the live site, from $BTJ_DATA_SOURCE (seed until the data repo passes validation)
#   /demo/  a copy that always uses the seed data from the design handover, for demos
set -euo pipefail
rm -rf out out-demo

BTJ_DATA_SOURCE=seed NEXT_PUBLIC_BASE_PATH=/demo NEXT_PUBLIC_DEMO=true npm run build
mv out out-demo

npm run build
mv out-demo out/demo
echo "Built out/ (live, data: ${BTJ_DATA_SOURCE:-seed}) and out/demo/ (seed)."
