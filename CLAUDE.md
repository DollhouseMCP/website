# CLAUDE.md — DollhouseMCP Marketing Site

**This is a public repository.** Source for [dollhousemcp.com](https://dollhousemcp.com).

## Read first

Full operational guide (setup, repo layout, workflow, gotchas, code style): **[AGENTS.md](./AGENTS.md)** in this directory. Everything an agent needs to work effectively here lives there.

## Claude-specific notes

- **Personal overrides** go in `CLAUDE.local.md` (gitignored by Claude Code convention) — use that for your own shortcuts, not this file.
- **Org-level context:** `DollhouseMCP/CLAUDE.md` at the org root covers public-vs-private-repo policy across the whole organization. Respect those boundaries when working here.
- **Design system is locked down:** `assets/css/atelier.css` is canonical; 9 lane-logo SVGs in `assets/images/dollhouse-org-*.svg` are the source of truth for the sibling Research site and Collection as well. Don't recolor the house — only the chimney and windows carry lane identity. Full rules in `style-guide.html` and AGENTS.md.
- **Ruby 3.1.x required** for local builds — 3.4 breaks the GitHub-Pages-pinned Jekyll stack. See AGENTS.md "Gotchas."
- **Branch model:** feature/fix/docs/design branches → `develop` → `main`. Don't push directly to `main`. All new work branches off `develop`. (See AGENTS.md "Gotchas" for resync history if needed.)

## When in doubt

Read `AGENTS.md`. Ask the human before making cross-cutting changes to the design system, `_config.yml`, or CI workflows.
