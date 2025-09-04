---
title: "The Story Behind DollhouseMCP: From Prompt Envy to Vibe Tooling"
date: 2025-09-04
author: Mick Darling
description: "A reintroduction and a project announcement - how a simple prompt catalog evolved into something much bigger"
tags: ["AI", "Open Source", "MCP", "Product Story", "Natural Language"]
featured: true
---

# The Story Behind DollhouseMCP: From Prompt Envy to Vibe Tooling

*A reintroduction and a project announcement from Mick Darling*

Hey everyone. Some of you might be wondering where I've been for the past few years. The short answer: deep in the AI rabbit hole, building things, breaking things, and eventually creating something I'm genuinely excited to share.

## It Started with Prompt Envy

We've all been there. Someone shares this incredible ChatGPT prompt that writes perfect unit tests, or reviews code like a senior architect, or transforms rambling notes into polished documentation. You copy it. You use it once. You lose it. You find it again but can't remember what you modified. You modify it again. The cycle continues.

I wanted a simple solution - just a catalog where I could store these prompts and find them when needed. When I discovered Claude Code and started playing with MCP (Model Context Protocol), I thought "perfect, I can build this in a day."

I was right about the day part. I had a working proof of concept in less than 24 hours.

I was completely wrong about the "simple" part.

## The Rabbit Hole

As soon as I had that first prototype working, I realized I'd been thinking too small. Way too small.

This wasn't just about storing prompts. This was about fundamentally changing how we interact with AI tools. Instead of "vibe coding" - where you hope the AI figures out what you want - this could enable what I call "vibe tooling."

Here's what I mean:

**Traditional AI interaction**: Every session starts fresh. You explain your context, your preferences, your standards. The AI responds. Next session? Start over.

**Vibe tooling**: You build tools using natural language that persist and evolve. You don't write code to create these tools - you just describe what you want. "Be a security-focused code reviewer who's harsh but constructive." Done. That tool now exists. 

Need to adjust it? "Be less harsh but maintain the security focus." Version 1.2 of your tool, created with one sentence.

## What DollhouseMCP Actually Does

Over the next two months, this evolved into something much more comprehensive:

### Personas with Personality
Not just saved prompts, but actual personas with consistent behavior, preferences, and capabilities. They remember who they are across sessions, across platforms.

### Skills that Extend Capabilities
A persona can have skills - analyze LinkedIn profiles, generate audio summaries, validate security patterns, write in specific styles. I built an audio summary skill in 5 minutes that actually works. I'm still surprised every time it talks back to me.

### Templates for Structure
Reusable document structures, code patterns, analysis frameworks. Build once, use forever, modify with natural language.

### Agents with Autonomy
They work independently toward goals. When they need a new capability, they can find or create DollhouseMCP elements to solve problems. It's remarkably self-improving.

### Memory that Persists
The context and improvements accumulate. Solve a problem once, and the solution is available forever. Each refinement makes the system more capable.

## Why I Could Build This

For those who remember Tomorrowish from a decade ago - yes, that was me. We were doing machine learning and neural networks back when mentioning "AI" to investors was a guaranteed way to kill a meeting. The natural language processing patents we developed there? They gave me a fundamentally different understanding of how modern transformer-based LLMs work.

I'm not a 100x developer. I'm not even sure I'm a 10x developer. But I've been playing in this space long enough to see patterns others might miss, and to understand what's actually novel versus what's just hype.

## The Surprise

What surprised me most wasn't that it worked - it was how naturally it evolved from a personal tool into something genuinely useful for teams. 

When you solve your own problem thoroughly enough, without cutting corners, without compromising on the experience, you sometimes create something others need too.

## Real Examples That Made Me Realize This Was Different

### The Code Review Persona
I created "Marcus" - a senior architect persona who reviews code. Not revolutionary, right? Except Marcus remembers our entire codebase structure, our specific error handling patterns, our API conventions. When I tweaked him to be "less pedantic about naming but more strict about error handling," that preference stuck. Forever.

### The Audio Feedback Loop
I was deep in a debugging session when I realized I'd been reading walls of text for hours. On a whim, I created a skill that summarizes progress in audio. Five minutes later, Claude was literally talking to me, summarizing what we'd found and what to try next. It sounds like a small thing, but it changed how I work.

### The Documentation Evolution
Started with a simple template for API documentation. Asked it to "make it more like Stripe's docs." It adapted. Then "add examples in Python and JavaScript." It evolved. Now it generates documentation that looks like we hired Stripe's documentation team. Each refinement built on the last.

## What's Next

DollhouseMCP is open source. It's on GitHub. It works today with Claude and any MCP-compatible system.

I built this for myself, but I'm sharing it because I think others might find it useful. The documentation is real. The code is clean. The community is already contributing improvements.

If you're tired of:
- Explaining your codebase to AI every morning
- Losing track of prompts that worked perfectly
- Inconsistent AI responses across your team
- Starting from zero with every new session

Then maybe this is for you.

## The Real Question

What would you teach an AI once if you knew it would remember forever?

For me, it was my code review preferences. Then my documentation style. Then my debugging approach. Now it's dozens of patterns and preferences that make AI actually useful instead of just impressive.

What would it be for you?

## Try It

The entire system is open source and available on [GitHub](https://github.com/DollhouseMCP/dollhousemcp-mcp-server). It takes about 5 minutes to set up if you're already using Claude Code.

Or just browse the [community collection](https://github.com/DollhouseMCP/collection) to see what personas and skills others have built. Everything from harsh code reviewers to empathetic user researchers to technical documentation specialists.

The best part? If you build something useful, you can share it back with the community. Your solution to a problem might be exactly what someone else needs.

## Get In Touch

I'm genuinely curious about how others might use this. If you build something interesting, let me know. If you hit a limitation, definitely let me know. If you think this is solving the wrong problem entirely, I want to hear that too.

Find me on [LinkedIn](https://linkedin.com/in/mickdarling) or just open an issue on GitHub.

---

*Mick Darling is the creator of DollhouseMCP and founder of Tomorrowish. He holds multiple patents in natural language processing and has been working with AI/ML since before it was cool (or funded).*