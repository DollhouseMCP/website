#!/usr/bin/env bash

set -euo pipefail

readonly RUBY_IMAGE="ruby:3.1.4"

if [[ -z "${SRC_DIR:-}" || -z "${DEST_DIR:-}" ]]; then
  echo "SRC_DIR and DEST_DIR must be set" >&2
  exit 1
fi

mkdir -p "$DEST_DIR"
export BASEURL="${BASEURL:-}"

if [[ -z "$BASEURL" ]]; then
  echo "BASEURL must be set for VisiDelta builds" >&2
  exit 1
fi

if [[ -f "$SRC_DIR/Gemfile" ]]; then
  if ! docker run --rm \
    -e BASEURL="$BASEURL" \
    -e JEKYLL_ENV=production \
    -e HOST_UID="$(id -u)" \
    -e HOST_GID="$(id -g)" \
    -v "$SRC_DIR":/app:ro \
    -v "$DEST_DIR":/out \
    --tmpfs /app/.jekyll-cache:rw,mode=1777 \
    -w /app \
    "$RUBY_IMAGE" \
    bash -lc 'bundle install && bundle exec jekyll build --source /app --destination /out --baseurl "$BASEURL" --trace && (chown -R "$HOST_UID:$HOST_GID" /out || true)'; then
    echo "Dockerized Jekyll build failed" >&2
    exit 1
  fi
  exit 0
fi

cp -R "$SRC_DIR"/. "$DEST_DIR"/

export DEST_DIR
python3 <<'PY'
import os
from html import escape
from html.parser import HTMLParser
from pathlib import Path

dest_dir = Path(os.environ["DEST_DIR"])
baseurl = os.environ["BASEURL"].rstrip("/")

target_hrefs = {
    "/favicon-16x16.png": f"{baseurl}/favicon-16x16.png",
    "/favicon-32x32.png": f"{baseurl}/favicon-32x32.png",
    "/apple-touch-icon.png": f"{baseurl}/apple-touch-icon.png",
}


class LinkHrefRewriter(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=False)
        self.parts = []

    def handle_decl(self, decl):
        self.parts.append(f"<!{decl}>")

    def handle_starttag(self, tag, attrs):
        self.parts.append(self._render_tag(tag, attrs, closing=">"))

    def handle_startendtag(self, tag, attrs):
        self.parts.append(self._render_tag(tag, attrs, closing=" />"))

    def handle_endtag(self, tag):
        self.parts.append(f"</{tag}>")

    def handle_data(self, data):
        self.parts.append(data)

    def handle_comment(self, data):
        self.parts.append(f"<!--{data}-->")

    def handle_entityref(self, name):
        self.parts.append(f"&{name};")

    def handle_charref(self, name):
        self.parts.append(f"&#{name};")

    def handle_pi(self, data):
        self.parts.append(f"<?{data}>")

    def unknown_decl(self, data):
        self.parts.append(f"<![{data}]>")

    def _render_tag(self, tag, attrs, closing):
        updated_attrs = []
        for key, value in attrs:
          if key == "href" and value in target_hrefs:
              value = target_hrefs[value]
          if value is None:
              updated_attrs.append(key)
          else:
              updated_attrs.append(f'{key}="{escape(value, quote=True)}"')
        attr_block = f" {' '.join(updated_attrs)}" if updated_attrs else ""
        return f"<{tag}{attr_block}{closing}"


for html_file in dest_dir.rglob("*.html"):
    content = html_file.read_text(encoding="utf-8")
    parser = LinkHrefRewriter()
    parser.feed(content)
    parser.close()
    updated = "".join(parser.parts)
    if updated != content:
        html_file.write_text(updated, encoding="utf-8")
PY
