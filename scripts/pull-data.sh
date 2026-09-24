#!/usr/bin/env bash
# Clone or update Beyond-The-Jersey/data into .data-repo/ so the site can build from it with
#   BTJ_DATA_SOURCE=repo npm run build
# The repo is private: this uses your git credentials (or GH_TOKEN in CI).
set -euo pipefail
REPO="${BTJ_DATA_REPO:-Beyond-The-Jersey/data}"
REF="${BTJ_DATA_REF:-main}"
DIR="${BTJ_DATA_CHECKOUT:-.data-repo}"

if [ -n "${GH_TOKEN:-}" ]; then URL="https://x-access-token:${GH_TOKEN}@github.com/${REPO}.git"; else URL="git@github.com:${REPO}.git"; fi

if [ -d "$DIR/.git" ]; then
  git -C "$DIR" fetch --depth 1 origin "$REF" && git -C "$DIR" checkout -q FETCH_HEAD
else
  git clone --depth 1 --branch "$REF" "$URL" "$DIR"
fi
echo "Data repo at $DIR ($(git -C "$DIR" rev-parse --short HEAD))."
if [ ! -d "$DIR/normalized" ]; then
  echo "Note: $DIR/normalized/ doesn't exist yet. See docs/data-request/ for what the data repo needs to publish." >&2
fi
