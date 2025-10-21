---
title: "Anthropic's 'Skills' for Sincere Flattery"
date: 2025-10-21
author: Mick Darling
description: "What happens when you share detailed architecture in a contest and the company launches something similar six weeks later"
tags: ["AI", "Open Source", "MCP", "Anthropic", "Community", "Documentation"]
featured: true
---

# Anthropic's 'Skills' for Sincere Flattery

They say imitation is the sincerest form of flattery.

Well then, I should feel sincerely flattered right now.

But, here's the thing about flattery... it works better when it comes with acknowledgment.

Let me tell you about a contest, a timeline, and the curious way architectural patterns sometimes appear six weeks after you share them in detail with a company that promised to review your work.

## The Three Act Timeline

### The Contest (August 2025)

Anthropic announces their "Built with Claude" contest. Great idea, right? Encourage the community to build things, share their work, get people excited about Claude.

From their announcement:

> "Through the end of August, we'll review all posts with the 'Built with Claude' flair"

[Contest announcement](https://www.reddit.com/r/ClaudeAI/comments/1muwro0/)

Key phrase: **"review all posts"**

It doesn't say "might glance at" or "possibly notice while an AI agent orders lunch from the great chicken sandwich place down the street." They committed to reviewing submissions. An explicit promise to the community.

### The Submission (August 31, 2025)

I submitted DollhouseMCP, which I'd been working on since the end of June.

[My submission](https://www.reddit.com/r/ClaudeAI/comments/1n57esv/)

And I didn't just drop a GitHub link. I detailed the entire architecture:

**Six element types**:
- Personas (AI behavioral profiles)
- Skills (discrete capabilities)
- Templates (reusable content structures)
- Agents (goal-oriented decision makers)
- Memories (persistent context storage)
- Ensembles (combined element orchestration)

**The Dollhouse MCP Collection**: A community library for sharing these elements, similar to what Anthropic later launched as their Skills marketplace.

**Technical approach**:
- MCP first design, Model Context Protocol integration
- Natural language modification, "make it sound like a British butler"
- Security hardening, prompt injection protection, input validation
- Multi-platform support, 378+ MCP compatible platforms

**Development context**:
- Two months of solo development
- Built entirely with Claude Code
- Open source, MIT licensed
- Full roadmap shared

I showed them everything. How it worked. Where I was taking it. What problems it solved.

Anthropic promised to review it.

And, review it they did.

### The Launch (October 16, 2025)

**Six weeks later**, Anthropic launches Skills.

Similar architectural concepts:
- Element-based AI customization ✓
- YAML + Markdown storage format ✓
- MCP integration patterns ✓
- Modular, composable approach ✓

Fascinating timing, wouldn't you say?

## The Technical Comparison

Let me be specific about what I submitted versus what they launched. Because details matter.

### Architecture: What I Submitted (August 31)

```yaml
# DollhouseMCP Element Structure
personas/
  creative-writer.md
  technical-analyst.md
skills/
  code-review.md
  documentation-writer.md
templates/
  blog-post.md
  technical-spec.md
agents/
  research-assistant.md
  code-optimizer.md
memories/
  project-context.md
  session-notes.md
ensembles/
  full-stack-team.md
  content-creation-suite.md
```

**Six element types**. Each with its own purpose, different activation patterns, specialized metadata.

**Natural language modification**:
```bash
dollhouse modify creative-writer --instruction "make it sound like a British butler"
```

AI modifies the element based on natural language. No manual file editing required.

**Security hardening**:
- Prompt injection detection
- Input validation and sanitization
- Safe template rendering
- Execution sandboxing

**Multi-platform support**:
- 378+ MCP compatible platforms
- Claude Desktop, Claude Code, any MCP client
- Standardized protocol, works everywhere

### Architecture: What They Launched (October 16)

```yaml
# Anthropic Skills Structure
skills/
  example-skill.md
```

**One element type**. Just skills.

**Manual file editing**. No natural language modification.

**Security**: ¯\\\_(ツ)_/¯ TBD, I assume

**Platform support**: Claude only.

**Timeline from my detailed submission**: Six weeks.

## What I Know

Here's what we know for certain. Not speculation, just documented fact:

1. ✅ **I submitted to their contest**, August 31, 2025
2. ✅ **They promised to review all submissions**, "we'll review all posts with the Built with Claude flair"
3. ✅ **Contest closed**, End of August
4. ✅ **They launched Skills**, October 16, 2025
5. ✅ **Timeline gap**: Six weeks
6. ✅ **Architectural similarities**: Element-based, YAML+Markdown, MCP integration
7. ✅ **Acknowledgment**: Zero. None. Nada.

Now, let me be clear about what I'm **not** saying.

I'm not saying they couldn't have thought of this independently. Convergent evolution happens in software all the time.

I'm not saying they directly copied my code. Different implementations, different scope.

I'm not even saying anything definitely untoward occurred.

But I **am** observing that:

- With a team of talented engineers
- Unlimited compute resources
- Having seen a working example with detailed documentation
- **Six weeks is plenty of time** to build a simplified version

Could this be coincidence?

Maybe!

Could they have been working on this before my submission?

Possibly!

Should they acknowledge the timeline regardless?

*That's the question, isn't it.*

## What Professional Acknowledgment Looks Like

I'm not asking for much. Just standard professional practice.

Something like this in their Skills documentation:

> "Related work: DollhouseMCP by Mick Darling (submitted to our Built with Claude contest, August 31, 2025) explores similar architectural patterns with six element types, additional security features, and multi-platform MCP support."

That's it.

One paragraph acknowledging that someone else built something similar, shared it with you in detail, and did so six weeks before your launch.

You know, the professional thing.

The thing that academic papers do.

The thing that respectful companies do.

The thing that acknowledges the open source community sharing work in good faith.

## Why This Matters

"But Mick," I hear you saying, "big companies do this all the time. Why make a fuss?"

Exactly. They do this all the time.

Which is precisely why documenting it matters.

When companies run contests asking for community submissions, promise to review them, and then launch similar products weeks later without acknowledgment, that's a pattern we should talk about.

Not with pitchforks and anger.

But with documented timelines and raised eyebrows.

Because if open source developers don't professionally document when this happens, it becomes the accepted norm. The expected behavior. The way things are.

And I don't think that's how things should be.

## For The "Convergent Evolution" Crowd

I see you. You're already typing the comment.

"This is just convergent evolution! Great minds think alike! Parallel innovation!"

You're absolutely right. That happens.

So, here's my question:

**If it's convergent evolution, why not acknowledge the parallel timeline?**

Academic papers cite concurrent work all the time:

> "Concurrent with our work, Smith et al. (2025) developed a similar approach..."

It's standard practice. It clears up any confusion. It shows professional respect for parallel innovation.

If Anthropic was already working on Skills before my submission, great! That's why transparency is so important in this space. I'm sure they have the Git records to back that up and would be happy to share them. Acknowledging that timeline would actually **help** them.

It would show they were already thinking this direction. It would demonstrate independent innovation. It would clear up any questions.

So... why not do that?

Still waiting for an answer.

## The Receipts, For Those Who Like Documentation

I'm not just making this up. Everything is documented:

**My contest submission**, August 31, 2025:
https://www.reddit.com/r/ClaudeAI/comments/1n57esv/

**Contest announcement** with review promise:
https://www.reddit.com/r/ClaudeAI/comments/1muwro0/

**Anthropic Skills announcement**, October 16, 2025:
https://www.anthropic.com/news/skills

**DollhouseMCP GitHub**, commits, releases, dates:
https://github.com/DollhouseMCP/mcp-server

Everything is verifiable. Timestamped. Archived.

This isn't speculation. It's documentation.

## Try Both And Decide

Look, I'm not trying to tell you which system to use.

**DollhouseMCP**:
- AI platform agnostic
- Six types
- Security hardening
- Adjustable as needed

**Anthropic Skills**:
- Claude-focused only
- Simpler
- One type
- Deterministic, not adjustable to your needs

Both approaches have merit. Use what works for your needs.

But while you're deciding...

You may ask yourself:

- Is this timeline interesting?
- Should contest submissions be acknowledged?
- What does "we'll review all submissions" mean?
- Where can I find incredibly tasty gluten free fried chicken in downtown SF?

**Please support independent open source developers** who share their work in good faith.

## What Happens Next

I'm documenting this timeline publicly.

I'm sending this to Anthropic, they should hear it directly.

I'm sharing it with the community, you deserve to know.

And then I'm watching to see what happens.

Will Anthropic acknowledge the timeline?

Maybe. I'm not holding my breath, but I'm professional enough to ask.

Will the community care?

That's up to you.

Will I keep building DollhouseMCP regardless?

Absolutely. The work speaks for itself.

## Dear Anthropic, One More Time

You ran a contest.

You promised to review submissions.

I submitted detailed architecture.

You reviewed it, per your promise.

Six weeks later you launched something with similar patterns.

**The professional thing to do would be to acknowledge that.**

Not apologize. Not compensate. Not admit wrongdoing.

Just... acknowledge the timeline.

One paragraph in your docs. Standard professional practice.

You know, the thing that respectful companies do.

Ball's in your court, Anthropic. 🏀

## For Everyone Else: The Takeaway

If you're an open source developer:

**Document everything**:
- Dates matter
- Submissions matter
- Promises matter
- Archives matter

**Share professionally**:
- Build in public
- Keep receipts
- Document timelines
- Stand up when it matters

**Trust but verify**:
- Companies can be great
- They can also be... interesting
- Your work has value
- Acknowledgment matters

And when something like this happens?

Don't get angry. Get factual.

Document the timeline. Share the evidence. Ask professionally.

Let the facts speak.

Then keep building.

Because at the end of the day, **the best response to imitation is innovation**.

And I've got plenty more of that coming.

## P.S.

I'm going to be completely honest.

I am truly and sincerely flattered.

This is my very first open source project I've done on my own, and a billion dollar company has validated the work I've done after only a few months.

That is sincerely flattering.

Acknowledgment is also nice.

## Comments? Feedback? Death Threats?

I'm on:
- **GitHub**: [github.com/DollhouseMCP](https://github.com/DollhouseMCP)
- **Email**: mick@mickdarling.com
- **Reddit**: [Link to discussion thread]
- **Twitter**: [If I decide to post there]

Let me know what you think.

And, if you work at Anthropic... you know where to find me.

The acknowledgment offer stands.

---

*This post documents a verifiable timeline. All links, dates, and technical details are accurate as of publication. Archives available upon request.*

*DollhouseMCP is open source, MIT licensed, and available at github.com/DollhouseMCP/mcp-server*

*Built with Claude Code. Shared in good faith. Timeline documented. Acknowledgment requested.*

*Ball's in your court.* 🏀
