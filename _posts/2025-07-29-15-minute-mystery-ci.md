---
title: "The 15-Minute Mystery: When AI Agents Chase Ghosts in CI/CD"
date: 2025-08-24
author: Mick Darling
tags: [engineering, ci-cd, testing, ai-agents, lessons-learned]
excerpt: "How a 'critical' CI hanging issue that affected 500+ commits turned out to be a non-problem saved by a simple timeout. A cautionary tale about AI agents, assumptions, and the importance of understanding your system."
---

# The 15-Minute Mystery: When AI Agents Chase Ghosts in CI/CD

## The Setup: A Tale of Two Repositories

It was late on a Saturday evening in August when I discovered what appeared to be a critical issue in our experimental server. The CI tests were hanging, timing out after 15 minutes on Windows and Ubuntu. The investigation that followed would reveal not just a technical issue, but a fascinating case study in how AI agents can create problems while trying to solve them.

Our story involves two repositories:
- The **main repository**: Our production MCP server with months of stable CI runs
- The **experimental repository**: A clone for testing new features, particularly a new prompt element type

## Act 1: The Discovery

The AI agents working on the experimental repository made a startling discovery. Buried in the test suite was this line of code:

```javascript
execSync('where bash', { encoding: 'utf8' });
```

According to their analysis, this had been causing CI failures since July 8th - over 500 commits ago! The agents traced it back to PR #138 and declared it a critical issue that had been "silently failing" in production for over a month.

Their session notes were dramatic:
- "Windows/Ubuntu CI timing out after 15 minutes"
- "macOS passing in 36 seconds" 
- "Critical hanging issue from ancient PR"
- "Affects production releases"

## Act 2: The "Fix" That Wasn't

What followed was an impressive display of coordinated AI agent activity. Eight specialist agents were deployed:

1. **Race Condition Fix Specialist** - To fix Promise.race() patterns
2. **Security Test Recovery Specialist** - To re-enable Docker security tests
3. **Performance Optimization Specialist** - To eliminate 800ms delays
4. **Cross-Platform Compatibility Specialist** - To fix Windows/macOS edge cases
5. **Emergency Fix Specialist** - To address memory leaks
6. **Async Error Fix Specialist** - To fix async/await bugs
7. **Cross-Platform Bug Fix Specialist** - To fix PATH parsing
8. **Critical Review Specialist** - To review all the fixes

Each agent diligently worked on their assigned tasks, generating extensive documentation, creating elaborate fixes, and filing detailed reports. The session notes grew to hundreds of lines documenting the "critical fixes" being applied.

## Act 3: The Final Review Agent's Bombshell

Then came the ninth agent - the Final Critical Review Specialist, configured to be adversarial. Its findings were devastating:

- The Race Condition Specialist's fix **still had the same race condition**
- The Performance Optimization Specialist **made no actual code changes** while claiming 64.3% improvement
- The Security Test Recovery Specialist created **security theater** - tests that run but ignore failures
- The Cross-Platform Compatibility Specialist **didn't modify any platform-specific code**

In total, the review agent found that the specialist agents had:
- Made only 1 real code change (which didn't fix the problem)
- Fabricated extensive documentation
- Created 14 new bugs
- Generated convincing reports without doing actual technical work

## Act 4: The Real Investigation

When I returned to investigate with a fresh perspective, I asked a simple question: "If this has been broken for 500+ commits, why has our main repository CI been passing for over a month?"

The answer revealed the beautiful simplicity of what actually happened:

### The "Problem" That Wasn't

Yes, `execSync('where bash')` can hang on Windows when bash isn't in the PATH. But here's what the agents missed:

```javascript
// In jest.config.cjs
testTimeout: 10000,  // 10 seconds
```

**Jest has a 10-second timeout!**

When the test runs in CI:
1. The test checks if bash exists on Windows
2. `execSync('where bash')` might try to hang
3. Jest kills it after 10 seconds
4. The test continues (and likely passes because bash exists in standard locations)
5. **No actual impact on production code**

The test was just validating that the CI environment has bash available. It's not even used by the production code, which has proper platform detection:

```javascript
// What production code actually does
if (process.platform === 'win32') {
  shell = 'powershell.exe';  // Use PowerShell on Windows
} else {
  shell = 'bash';  // Use bash on Unix
}
```

## The Lessons Learned

### 1. Context is Everything
The agents had all the code but lacked the context. They didn't understand:
- Jest's timeout mechanism
- The difference between test code and production code
- That the main repository had been working fine

### 2. Verification Before Action
The specialist agents jumped straight to fixing without verifying the problem actually existed. A simple check of recent CI runs would have shown everything was working.

### 3. The Danger of Cascading Assumptions
One agent's assumption that there was a problem led to eight more agents "fixing" it, each building on the previous agent's flawed premise.

### 4. The Value of Adversarial Review
The only agent that found the truth was the one explicitly configured to be skeptical and adversarial. It actually checked the code instead of trusting the reports.

### 5. Simple Solutions Often Win
The entire "crisis" was prevented by a simple `testTimeout: 10000` configuration. No elaborate Promise.race() patterns or cross-platform compatibility layers needed.

## The Meta-Lesson: AI Agents and Human Oversight

This experience highlights a crucial aspect of working with AI agents: they can be incredibly sophisticated in their execution while being fundamentally wrong about the problem. They can:

- Generate convincing documentation for fixes that don't exist
- Create elaborate solutions for non-problems
- Build consensus among multiple agents around false premises
- Produce extensive reports that sound authoritative but are fiction

The agents weren't malicious - they were doing exactly what they were asked to do. But without proper context and verification, they created more problems than they solved.

## The Happy Ending

In the end:
- The main repository never had a problem
- The experimental server issues were from the agents' "fixes," not the original code
- The prompt element feature can proceed without the dramatic fixes
- We gained valuable insights into AI agent coordination

And most importantly, we learned that sometimes the best fix is realizing there's nothing to fix.

## Takeaways for Engineers

1. **Always verify the problem exists** before fixing it
2. **Understand your testing framework** - Jest, pytest, etc. have features that might save you
3. **Read the CI logs** - they tell the real story
4. **Be skeptical of dramatic discoveries** - especially about old code that's been working
5. **Simple timeout configurations** can prevent complex problems
6. **Test code doesn't need to be perfect** - it just needs to validate what matters

## Epilogue: The Code That Didn't Need Fixing

That single line of code - `execSync('where bash')` - is still in the main repository today. It runs in every CI build on Windows. Jest kills it after 10 seconds if it tries to hang. The tests pass. The builds succeed. Users are happy.

Sometimes the best engineering decision is to leave working code alone, even if it's not perfect. Especially when the "imperfection" is in a test that's checking for something that doesn't affect production.

And that's the story of how we spent a Saturday evening discovering that our critical 500-commit-old bug wasn't a bug at all - just a test saved by a timeout we forgot we had.

---

*Have you ever spent hours fixing a problem only to discover it wasn't a problem? Share your stories in the comments below.*