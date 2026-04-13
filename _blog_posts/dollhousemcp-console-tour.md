---
title: "A Tour of the DollhouseMCP Console"
date: 2026-04-02
author: "Mick Darling"
tags: ["dollhousemcp", "web-console", "mcp", "setup", "portfolio", "security"]
description: "A walkthrough of the local DollhouseMCP console: guided setup, portfolio browsing, live logs, metrics, and permissions."
keywords: "DollhouseMCP console, MCP setup wizard, portfolio browser, logs tab, metrics dashboard, permissions tab"
---

# A Tour of the DollhouseMCP Console

*The local web console is one of the fastest ways to understand what DollhouseMCP is doing on your machine, what is installed, and what your active elements are allowed to do.*

## TL;DR

Run this in a terminal:

```bash
npx @dollhousemcp/mcp-server@latest --web
```

That launches the local DollhouseMCP console at `http://dollhouse.localhost:3939` and gives you five major views:

- **Setup** for guided install across popular MCP clients
- **Portfolio** for browsing your local Dollhouse elements visually
- **Logs** for real-time operational visibility
- **Metrics** for server health, MCP-AQL usage, cache, and Gatekeeper trends
- **Permissions** for seeing the current policy state and live decisions

This post is a quick tour of those tabs and why they matter.

## Setup: Guided Install From One Place

The Setup tab is the first thing many people will want from the console. Instead of hunting through config files for each client, the setup wizard gives you one place to connect Claude Desktop, Claude Code, Cursor, VS Code, Codex, Gemini CLI, Windsurf, Cline, and LM Studio.

Based on the public quick-start docs, the setup flow supports:

- auto-updating installs using `npx @latest`
- pinned-version installs when you want reproducible setups
- one-click install where the platform supports it
- copyable manual config blocks when you want to wire it up yourself
- detection of existing installs so you can see what is already configured

![DollhouseMCP setup tab](/assets/images/blog/dollhouse-console-setup.png)

This is also why the new homepage install flow is now centered on the web launcher. It is the easiest on-ramp we have.

## Portfolio: Your Local Dollhouse, Rendered

DollhouseMCP elements live in your local portfolio at `~/.dollhouse/portfolio/`. The console turns that into a browsable interface so you can search, skim, and inspect what is available without asking the LLM to list everything back to you.

The portfolio browser is especially useful when you already have a meaningful library of elements. You can browse by type, search by name or description, and move between your local portfolio and collection-aware surfaces without leaving the console.

![DollhouseMCP portfolio tab](/assets/images/blog/dollhouse-console-portfolio.png)

For people new to DollhouseMCP, this tab makes the model of the system much easier to understand: elements are not abstract ideas floating around in a prompt. They are concrete, local building blocks you can browse and manage.

## Logs: Real-Time Operational Visibility

The Logs tab is the operational side of the console. According to the public logging guide, the console exposes a browser viewer backed by the same logging system that writes to `~/.dollhouse/logs/`.

The logging surface is designed for actual debugging work, not just decoration. The public docs call out capabilities such as:

- category, level, and source filtering
- text search
- pause and resume for streaming
- live updates over Server-Sent Events
- backfill on connect so you are not only seeing brand-new events

![DollhouseMCP logs tab](/assets/images/blog/dollhouse-console-logs.png)

At the moment, we are still tightening up the live data path in this view, so the screenshot here is more about the shape of the interface than a fully populated stream. Even so, it shows where operational visibility is headed inside the local console.

## Metrics: What the Server Is Doing Internally

The Metrics tab gives you a higher-level view than raw logs. Instead of individual events, it surfaces the health and behavior of the running server.

The public front-end and docs show metrics cards for things like:

- system health
- search performance
- MCP-AQL operations
- cache efficiency
- security
- Gatekeeper policy trends
- locks and I/O
- metrics system status

![DollhouseMCP metrics tab](/assets/images/blog/dollhouse-console-metrics.png)

Like the Logs tab, this view is still in the process of getting richer live data in our current build, so this screenshot is best read as a product surface preview rather than a finished telemetry dashboard. The important thing is that observability is part of the platform design, not an afterthought.

## Permissions: Making Gatekeeper Visible

The Permissions tab is one of my favorite additions because it makes the Gatekeeper model legible. DollhouseMCP does not treat permissions as an invisible implementation detail. Active elements can change what operations are allowed, denied, or require confirmation, and the console gives you a way to see that state directly.

The public README and docs describe Gatekeeper as a server-side enforcement layer that applies active element policies across MCP-AQL operations. In the console, that becomes tangible:

- current policy sources
- allow patterns
- deny patterns
- confirm patterns
- a live decision feed
- lightweight autonomy and decision counters

![DollhouseMCP permissions tab](/assets/images/blog/dollhouse-console-permissions.png)

That visibility matters. If your AI is being shaped by personas, skills, ensembles, and policy-driven workflows, you should be able to inspect the permission layer instead of trusting it blindly.

## Why the Console Matters

The console is not the product by itself, but it makes the rest of the platform much easier to understand and operate.

It gives new users a guided starting point, power users a visual portfolio browser, and developers a real debugging and observability surface. Just as importantly, it helps explain what is different about DollhouseMCP: local elements, platform-wide setup, server-side policy enforcement, and a runtime you can actually inspect.

If you have only interacted with DollhouseMCP through MCP tool calls so far, it is worth launching the console and clicking around for a few minutes. It makes the shape of the platform much more obvious.

## Try It

Copy this, paste it into a terminal, and run it:

```bash
npx @dollhousemcp/mcp-server@latest --web
```

Then open `http://dollhouse.localhost:3939` and take a look around.
