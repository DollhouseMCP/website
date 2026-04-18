# CLAUDE.md — DollhouseMCP Marketing Site

**This is a public repository.** Source for [dollhousemcp.com](https://dollhousemcp.com).

## Read first

Full operational guide (setup, repo layout, workflow, gotchas, code style): **[AGENTS.md](./AGENTS.md)** in this directory. Everything an agent needs to work effectively here lives there.

## Claude-specific notes

- **Personal overrides** go in `CLAUDE.local.md` (gitignored) — use that for your own shortcuts, not this file.
- **Org-level context:** `DollhouseMCP/CLAUDE.md` at the org root covers public-vs-private-repo policy across the whole organization. Respect those boundaries when working here.
- **Design-system warning:** the 9 canonical lane-logo SVGs (`assets/images/dollhouse-org-*.svg`) are the source of truth for sibling sites too. Don't recolor the house — only the chimney and windows carry lane identity. Full rules in [AGENTS.md § Design system](./AGENTS.md#design-system).

For setup, repo layout, workflow, gotchas, and code style: see [AGENTS.md](./AGENTS.md).

## When in doubt

Ask the human before making cross-cutting changes to the design system, `_config.yml`, or CI workflows.
