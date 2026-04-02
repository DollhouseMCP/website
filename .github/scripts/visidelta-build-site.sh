#!/usr/bin/env bash

set -euo pipefail

if [[ -z "${SRC_DIR:-}" || -z "${DEST_DIR:-}" ]]; then
  echo "SRC_DIR and DEST_DIR must be set" >&2
  exit 1
fi

mkdir -p "$DEST_DIR"

if [[ -f "$SRC_DIR/Gemfile" ]]; then
  docker run --rm \
    -e BASEURL="${BASEURL:-}" \
    -e JEKYLL_ENV=production \
    -e HOST_UID="$(id -u)" \
    -e HOST_GID="$(id -g)" \
    -v "$SRC_DIR":/app \
    -v "$DEST_DIR":/out \
    -w /app \
    ruby:3.1 \
    bash -lc 'bundle install && bundle exec jekyll build --source /app --destination /out --baseurl "$BASEURL" --trace && (chown -R "$HOST_UID:$HOST_GID" /out || true)'
  exit 0
fi

cp -R "$SRC_DIR"/. "$DEST_DIR"/

export DEST_DIR
export BASEURL="${BASEURL:-}"
python3 <<'PY'
import os
from pathlib import Path

dest_dir = Path(os.environ["DEST_DIR"])
baseurl = os.environ["BASEURL"].rstrip("/")

if not baseurl:
    raise SystemExit("BASEURL must be set for VisiDelta static builds")

replacements = {
    'href="/favicon-16x16.png"': f'href="{baseurl}/favicon-16x16.png"',
    'href="/favicon-32x32.png"': f'href="{baseurl}/favicon-32x32.png"',
    'href="/apple-touch-icon.png"': f'href="{baseurl}/apple-touch-icon.png"',
}

for html_file in dest_dir.rglob("*.html"):
    content = html_file.read_text(encoding="utf-8")
    updated = content
    for old, new in replacements.items():
        updated = updated.replace(old, new)
    if updated != content:
        html_file.write_text(updated, encoding="utf-8")
PY
