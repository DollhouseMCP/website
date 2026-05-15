---
title: "The Security Model Behind DollhouseMCP"
date: 2026-05-15
author: "Mick Darling"
tags: ["dollhousemcp", "security", "agentic-ai", "trust", "mcp"]
description: "Giving an AI more power means trusting it less, not more. Here is how DollhouseMCP is built so that a model being wrong, compromised, or manipulated is never enough to cause harm."
keywords: "DollhouseMCP security, agentic AI safety, prompt injection defense, MCP server security, AI permission enforcement"
---

# The security model behind DollhouseMCP

*Why I built DollhouseMCP to distrust its own AI — and what that means if you are deciding whether to run it.*

Here is the uncomfortable thing about agentic AI. The more useful you make it, the more dangerous it becomes. A model that can only chat is mostly harmless. A model that can read your files, run commands, pull in code from the internet, and act on its own for several steps in a row is genuinely powerful — and that same power is exactly what an attacker, or just a confused model, would use to do damage.

DollhouseMCP makes AI behavior programmable. Personas, skills, and ensembles change what the assistant knows, how it acts, and what it is allowed to do. That is the product. It is also, if you think about it for more than a minute, an attack surface. So the question I had to answer before I could ship any of it was simple: how do you give an AI this much capability without having to trust it?

The answer runs through the entire platform, and I want to walk through it the way I would explain it to someone deciding whether to put this on their machine or in front of their team.

## The one principle everything else hangs from

If you remember nothing else, remember this: in DollhouseMCP, the model's instructions are suggestions, and the server's policies are enforcement.

That distinction is the whole game. A large language model can be talked into almost anything. It can be prompt-injected by a file it reads. It can be socially engineered by content that looks innocent. It can simply be wrong. If your safety story depends on the model choosing to behave, you do not have a safety story.

So in DollhouseMCP the enforcement does not live in the prompt. It lives in the server, in code, after the model has already decided what it wants to do. Every privileged operation is checked by a server-side policy engine called the Gatekeeper. And here is the part that matters most for trust: this still applies even if your MCP client has "always allow" turned on. The client approving a tool call does not end the conversation. The server gets the final word, and the model cannot argue with it.

## Defense in depth, not a single wall

One check is a single point of failure. DollhouseMCP is built as a stack of independent layers, each defending a different class of threat, each able to stop an operation on its own. A few of the ones I am most confident about:

- **The Gatekeeper** decides, for every operation, whether it is auto-approved, needs confirmation, or is denied outright. Some operations — deleting elements, executing agents — can never be silently auto-approved by any policy. And if a restrictive element even removes the ability to confirm exceptions, the session quietly drops to read-only. There is no clever path back in.
- **Content validation** treats every persona, skill, and template as untrusted input. Before any of it reaches the model, it is scanned for prompt-injection patterns, normalized for Unicode tricks like invisible characters and look-alike letters, and parsed through a hardened YAML reader that rejects the classic "YAML bomb" denial-of-service attacks.
- **The autonomy evaluator** sits in the agent loop. Before every autonomous step, it decides: continue, pause for a human, or escalate. It looks at how many steps have run, whether the last one failed, how risky the next action is, and — crucially — whether the action is reversible.
- **Danger zone enforcement** is the layer past the point where a prompt is enough. When an agent crosses a hard line, it is blocked at the process level, and that block survives a restart. Clearing it requires a one-time code shown in a native OS dialog that never appears in the model's response — so a compromised model cannot read its own way out.

There is more underneath this — encrypted credential storage, path-traversal protection with symlink resolution, a command allowlist, rate limiting, per-session isolation — and I wrote it all up in detail on the new [security page](/security.html). If you are evaluating DollhouseMCP for anything sensitive, that page is the one to read.

## Risk is not the same as irreversibility

One design decision I am proud of is small and easy to miss. Most systems score a command by how "dangerous" it sounds. That is not enough. `git checkout -b feature` sounds risky and is trivially undone. `git stash drop` sounds routine and is gone forever. DollhouseMCP tracks risk and irreversibility as separate signals, so the operations you genuinely cannot take back get gated even when their raw risk score looks modest. The thing that hurts is not always the thing that looks scary.

## Trust the platform, then verify it

I do not expect anyone to take a security claim on faith — that would contradict the entire point of this post. So two things.

First, DollhouseMCP is built to be inspected, not believed. The local console has a Permissions tab that shows you the live policy state and the decisions the Gatekeeper is making as they happen. You can watch it work. [Dynamic permissioning](/dynamic-permissioning.html) explains how active elements reshape that surface in real time.

Second, the defenses are verified continuously, not shipped once and forgotten. Static analysis runs on every change. An automated security audit runs on every pull request and on a daily schedule. Dependency vulnerabilities block merges. A weekly job reconciles the dependency tree against public advisory databases. And there is a standing suite of security-specific tests covering injection, path traversal, Unicode attacks, token handling, and the OWASP Top 10. The whole project is public, and the [security policy](https://github.com/DollhouseMCP/mcp-server/blob/main/SECURITY.md) — including how to report a vulnerability — is in the repository.

## What this means for you

If you are deciding whether to run DollhouseMCP, the honest summary is this. The platform assumes the AI can be wrong, the content can be hostile, and the client can be too permissive. None of those is enough on its own to cause harm, because the enforcement is not a suggestion the model can override. It is the server, and it does not negotiate.

That is the trade I wanted: more capability, with less trust required to use it safely. The full technical breakdown of every layer is on the [security page](/security.html).
