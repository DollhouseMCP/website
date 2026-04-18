# AGENTS.md — DollhouseMCP Marketing Site

Canonical guide for any coding agent working on this repository. Follows the [agents.md](https://agents.md) convention.

## Project overview

This is the Jekyll source for **[dollhousemcp.com](https://dollhousemcp.com)** — the public marketing site for the DollhouseMCP project: landing pages, product narrative, blog, style guide, and press/onboarding surfaces. Published via GitHub Pages from `main`.

The repo is **public**. Everything here ships to the open internet.

Sibling sites with shared conventions:

- `DollhouseMCP/dollhouseresearch-website` — parent research org (`dollhouseresearch.com`)
- `DollhouseMCP/collection` — community catalog (`collection.dollhousemcp.com`, static `public/` tree)

All three share the **Atelier** design system (`atelier.css`) — this repo is the canonical source.

## Setup

Required:

- Ruby 3.1.x (not 3.4+ — see Gotchas)
- Bundler 2.3.x
- Docker (only for the Visidelta preview workflow)

```bash
# First-time setup
bundle install

# Local dev server with auto-reload
bundle exec jekyll serve

# One-shot production build
bundle exec jekyll build --trace
```

Homebrew Ruby (`/opt/homebrew/opt/ruby`) works but runs 3.4.x and breaks old Jekyll plugins. Use rbenv/chruby/rvm to pin 3.1.x locally.

## Repository layout

```text
.
├── _config.yml              # Jekyll config — baseurl, plugins, collections
├── _layouts/                # default.html, post.html
├── _includes/               # header.html and partials
├── _blog_posts/             # Collection: blog content (/blog/:name/)
├── _posts/                  # Legacy Jekyll posts
├── index.html               # Landing page
├── about.html, licensing.html, etc.   # Top-level marketing pages
├── style-guide.html         # Live Atelier component showcase — source of truth
├── assets/
│   ├── css/atelier.css      # Canonical design system CSS
│   ├── js/site.js           # Site script (theme toggle, scroll reveal)
│   └── images/              # Including all 9 dollhouse-org-*.svg lane marks
├── styles/                  # Modular CSS — tokens/base/components/house-icons/utilities
├── icons/                   # Brand SVG assets
├── content/                 # Additional long-form content
├── docs/                    # Strategic planning, evolution docs
├── mockups/                 # HTML prototypes (not shipped)
├── .github/
│   ├── workflows/           # CI: jekyll-build, visidelta-preview, claude-review
│   └── scripts/visidelta-build-site.sh   # Docker-wrapped Jekyll build for preview diffs
└── CNAME                    # dollhousemcp.com
```

## Design system

The Atelier design system is the locked-down visual language for all DollhouseMCP surfaces. Key rules (from `style-guide.html` and `atelier.css`):

- **Three fonts, strict**: Plus Jakarta Sans (headings), Manrope (body), IBM Plex Mono (eyebrows/code)
- **Lane colors drive topical identity**: Core (blue), Protocol (teal), Research (magenta), Tooling (green), Security (red), Education (yellow), Collection (bluetop+slate), Enterprise (slate+gold)
- **Neutrals are cool-blue tinted** (`--paper` #eef4ff, `--ink-950` #0a1020) — never pure black/white
- **Sentence case headings**, never Title Case
- **No emoji in product copy** — `🚧`/`✅` acceptable only in dev-facing READMEs
- **Lane SVGs are canonical**: 9 marks at `assets/images/dollhouse-org-*.svg` with baked-in 1px non-scaling stroke on chimney + 4 windows. Don't recolor the house; only chimney + windows carry lane identity.

Full voice/visual/component rules: open `style-guide.html` in a browser after `jekyll serve`.

## Workflow

### Branching

- `main` is the deployed branch (GitHub Pages).
- `develop` is the integration branch — PRs target here.
- Feature branches: `feature/*`, `fix/*`, `design/*`, `docs/*`, `chore/*`.
- Merge order: feature → develop → main via PR (no direct pushes to main).

### CI (current)

- **Jekyll Build** — smoke-builds the site on every PR
- **Visidelta Preview** — Docker-wrapped build that produces before/after screenshots for visual diffs (see tracker #24 for current Jekyll-cache quirk)
- **claude-review** — automated PR review
- **SonarCloud** — code analysis

Planned expansions tracked in #26 (markdown lint, lychee link check, cspell, HTML validation, a11y).

### Cache-busting

Asset refs in layouts use query params (`?v=YYYYMMDDx`) to force browsers to pick up updated files. Bump the param when you modify an asset — see `_layouts/default.html` and `_includes/header.html` for the pattern. The research site does the same (`?v=20260418a`).

## Gotchas

- **Ruby 3.4 breaks old Jekyll** — `String#tainted?` was removed in 3.2 and the GitHub-Pages-pinned `liquid 4.0.3` still uses it. Pin local Ruby at 3.1.x.
- **Gemfile.lock platform drift** — running `bundle install` on macOS can add `arm64-darwin` entries. Don't commit those; they break Linux CI. If the lock file drifts, `git restore Gemfile.lock` before committing.
- **Visidelta source mount is `:ro`** — `.github/scripts/visidelta-build-site.sh` mounts the repo read-only. Jekyll needs a writable cache path; the workflow uses a tmpfs overlay at `/app/.jekyll-cache` (see commit history / #25 for fix context).
- **`develop` was historically stale** — fully re-synced to `main` on 2026-04-18. All new work should branch off `develop`.
- **No unit tests** — this is a static site, Jekyll build is the contract. Visual regressions are caught by Visidelta screenshots.

## Code style

- **HTML/Liquid**: 2-space indent, kebab-case file names (`agent-runtime.html`, not `AgentRuntime.html`).
- **CSS**: modular under `styles/`, consume design tokens from `tokens.css`. Don't hardcode colors or step sizes — use `var(--signal)`, `var(--step-1)`, etc.
- **Markdown**: sentence-case headings, wrap at reasonable line length (80-100 is fine, not enforced).
- **Commit messages**: imperative ("Fix X", "Add Y"), reference issue numbers inline (`Closes #NN`). `Co-Authored-By` trailers welcome for agent-assisted work.

## Privacy boundary

This repo is public. The `DollhouseMCP` org also has **private repos** (experimental, business, catalog, tools-internal). Don't reference private-repo implementation details in marketing copy, commit messages, or docs here. If unsure whether something is public, check the org-level [CLAUDE.md](https://github.com/DollhouseMCP/) or ask.

## See also

- **Site:** <https://dollhousemcp.com>
- **Design system:** `style-guide.html`, `assets/css/atelier.css`
- **Org-level guidance:** `DollhouseMCP/CLAUDE.md` at the org root
- **Sibling sites:** `DollhouseMCP/dollhouseresearch-website`, `DollhouseMCP/collection`
