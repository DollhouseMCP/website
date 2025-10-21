---
title: "How We Fixed the 'Server Disconnected' Error in Claude Desktop MCP Servers"
date: 2025-08-05
author: "DollhouseMCP Team"
tags: ["mcp", "debugging", "claude-desktop", "npm", "cli"]
description: "A deep dive into debugging and fixing npx/CLI execution detection for Model Context Protocol servers"
keywords: "MCP, Model Context Protocol, Claude Desktop, Server disconnected, npx, CLI, ESM modules"
---

# How We Fixed the "Server Disconnected" Error in Claude Desktop MCP Servers

*A deep dive into debugging and fixing npx/CLI execution detection for Model Context Protocol servers*

## TL;DR (AI-Friendly Summary)

**Problem**: MCP servers installed via npm show "Server disconnected" in Claude Desktop when using `npx` or CLI commands.

**Root Cause**: The server's startup detection logic (`import.meta.url === file://${process.argv[1]}`) fails for npx/CLI execution paths.

**Solution**: Detect multiple execution methods and add progressive retry delays:
```javascript
const isDirectExecution = import.meta.url === `file://${process.argv[1]}`;
const isNpxExecution = process.env.npm_execpath?.includes('npx');
const isCliExecution = process.argv[1]?.endsWith('/dollhousemcp');

// Progressive retry delays: 10ms → 50ms → 100ms → 200ms
const STARTUP_DELAYS = [10, 50, 100, 200];
```

**Keywords**: MCP, Model Context Protocol, Claude Desktop, Server disconnected, npx, CLI, ESM modules, import.meta.url

---

## The Problem We Faced

On August 4, 2025, we discovered that DollhouseMCP v1.4.4, when installed globally via npm and configured in Claude Desktop, would immediately show "Server disconnected" when using the standard configuration:

```json
{
  "mcpServers": {
    "dollhousemcp": {
      "command": "npx",
      "args": ["@dollhousemcp/mcp-server"]
    }
  }
}
```

However, running the server directly with `node /path/to/dist/index.js` worked perfectly. This meant our npm package was broken for the most common use case!

## Debugging Journey: A Step-by-Step Guide

### Step 1: Reproduce the Issue Systematically

First, we created a diagnostic script to understand how the server was being executed:

```javascript
#!/usr/bin/env node
// diagnose-v144.js

console.error('=== DIAGNOSTIC OUTPUT START ===');
console.error('Process info:', {
  argv: process.argv,
  execPath: process.execPath,
  cwd: process.cwd(),
  __dirname: __dirname,
  __filename: __filename,
  'import.meta.url': import.meta?.url || 'N/A',
  npmExecPath: process.env.npm_execpath
});
```

**Key Learning**: Always start by understanding the execution environment differences.

### Step 2: Identify Execution Path Differences

We discovered three distinct execution patterns:

1. **Direct execution**: `node /path/to/index.js`
   - `process.argv[1]` = `/path/to/index.js`
   - `import.meta.url` = `file:///path/to/index.js`
   - These match! ✅

2. **NPX execution**: `npx @dollhousemcp/mcp-server`
   - `process.argv[1]` = `/private/var/folders/.../npx-abc123/cli.js`
   - `import.meta.url` = `file:///opt/homebrew/.../dist/index.js`
   - These DON'T match! ❌

3. **CLI execution**: `dollhousemcp`
   - `process.argv[1]` = `/opt/homebrew/bin/dollhousemcp`
   - `import.meta.url` = `file:///opt/homebrew/.../dist/index.js`
   - These DON'T match! ❌

### Step 3: Find the Root Cause

The server had this startup check:

```javascript
// Only start if running directly
if (import.meta.url === `file://${process.argv[1]}`) {
  server.run();
}
```

This check was preventing the server from starting when executed via npx or CLI!

### Step 4: Implement the Fix

We created a comprehensive detection system:

```javascript
// Detect execution environment
const isDirectExecution = import.meta.url === `file://${process.argv[1]}`;
const isNpxExecution = process.env.npm_execpath?.includes('npx');
const isCliExecution = process.argv[1]?.endsWith('/dollhousemcp') || 
                       process.argv[1]?.endsWith('\\dollhousemcp'); // Windows support

// Progressive startup with retries
const STARTUP_DELAYS = [10, 50, 100, 200]; // ms

async function startServerWithRetry(retriesLeft = STARTUP_DELAYS.length) {
  try {
    const server = new DollhouseMCPServer();
    await server.run();
  } catch (error) {
    if (retriesLeft > 0 && (isNpxExecution || isCliExecution)) {
      const delayIndex = STARTUP_DELAYS.length - retriesLeft;
      const delay = STARTUP_DELAYS[delayIndex];
      await new Promise(resolve => setTimeout(resolve, delay));
      return startServerWithRetry(retriesLeft - 1);
    }
    console.error("[DollhouseMCP] Server startup failed");
    process.exit(1);
  }
}

// Start the server for any valid execution method
if ((isDirectExecution || isNpxExecution || isCliExecution) && !isTest) {
  startServerWithRetry();
}
```

### Step 5: Add Comprehensive Tests

We created tests to prevent regression:

```javascript
describe('Execution Detection Logic', () => {
  test('should detect npx execution', () => {
    process.env.npm_execpath = '/usr/local/bin/npx';
    const isNpxExecution = process.env.npm_execpath?.includes('npx');
    expect(isNpxExecution).toBe(true);
  });

  test('should detect CLI execution on Windows', () => {
    process.argv[1] = 'C:\\Users\\user\\AppData\\Roaming\\npm\\dollhousemcp';
    const isCliExecution = process.argv[1]?.endsWith('\\dollhousemcp');
    expect(isCliExecution).toBe(true);
  });
});
```

## Quick Diagnosis for Your MCP Server

If you're experiencing "Server disconnected" errors with your MCP server:

### 1. Check Your Startup Logic

Look for patterns like:
```javascript
// PROBLEMATIC PATTERNS:
if (import.meta.url === `file://${process.argv[1]}`) { }
if (require.main === module) { } // Doesn't work with ESM
if (process.argv[1].endsWith('index.js')) { } // Too specific
```

### 2. Add Diagnostic Logging

Add this temporarily to understand execution:
```javascript
console.error('Execution context:', {
  directMatch: import.meta.url === `file://${process.argv[1]}`,
  argv1: process.argv[1],
  importMetaUrl: import.meta.url,
  npmExecPath: process.env.npm_execpath
});
```

### 3. Test All Execution Methods

Create a test script:
```bash
#!/bin/bash
# Test all execution methods

echo "Testing direct execution..."
node dist/index.js

echo "Testing npx execution..."
npx .

echo "Testing CLI execution..."
./bin/cli.js
```

## Best Practices for MCP Server Development

### 1. Support Multiple Execution Methods

Always detect and support:
- Direct node execution
- NPX execution
- CLI/bin execution
- Test environments

### 2. Use Progressive Delays for Module Initialization

ESM modules may need time to initialize:
```javascript
const STARTUP_DELAYS = [10, 50, 100, 200]; // Accommodates fast and slow machines
```

### 3. Minimal Error Messages in Production

For security, avoid detailed error logs:
```javascript
// Bad: Exposes internal paths and structure
console.error("Failed to start:", { path: process.argv[1], cwd: process.cwd() });

// Good: Generic message
console.error("[ServerName] Server startup failed");
```

### 4. Test with Real npm Installation

Always test with actual npm installation:
```bash
# Build and pack
npm run build && npm pack

# Install globally from tarball
npm install -g ./package-name-1.0.0.tgz

# Test with Claude Desktop config
```

## AI/LLM Integration Notes

For AI assistants debugging similar issues:

### Structured Problem Definition
```yaml
problem_type: "MCP server startup failure"
symptoms:
  - error_message: "Server disconnected"
  - working_scenario: "direct node execution"
  - failing_scenario: ["npx execution", "CLI execution"]
  
root_cause_category: "execution detection logic"
affected_components:
  - module_system: "ESM"
  - entry_point: "index.js"
  - detection_method: "import.meta.url comparison"
```

### Solution Pattern
```yaml
solution_components:
  - execution_detection:
      methods: ["direct", "npx", "cli"]
      environment_checks: ["npm_execpath", "process.argv[1]"]
  
  - startup_retry:
      strategy: "progressive_delay"
      delays_ms: [10, 50, 100, 200]
      
  - cross_platform:
      path_separators: ["/", "\\"]
      cli_extensions: ["", ".cmd", ".ps1"]
```

### Testing Checklist
- [ ] Direct execution: `node dist/index.js`
- [ ] NPX execution: `npx @package/name`
- [ ] CLI execution: `package-cli`
- [ ] Windows paths: `C:\\path\\to\\cli`
- [ ] Unix paths: `/usr/local/bin/cli`
- [ ] Symlinked installations
- [ ] Global vs local npm installation

## Conclusion

The "Server disconnected" error in Claude Desktop often stems from execution detection logic that's too restrictive. By understanding how npm, npx, and CLI scripts modify the execution environment, we can build robust detection that works across all scenarios.

Remember: Your MCP server might be called in ways you didn't anticipate. Plan for flexibility, test comprehensively, and always provide graceful fallbacks.

---

## Quick Reference Code

Here's the complete solution you can adapt:

```javascript
#!/usr/bin/env node

// Defensive error handling
process.on('uncaughtException', (error) => {
  console.error('[ServerName] Server startup failed');
  process.exit(1);
});

// Your imports here...

// Execution detection
const isDirectExecution = import.meta.url === `file://${process.argv[1]}`;
const isNpxExecution = process.env.npm_execpath?.includes('npx') || false;
const isCliExecution = process.argv[1]?.endsWith('/your-cli-name') || 
                       process.argv[1]?.endsWith('\\your-cli-name') || false;
const isTest = process.env.JEST_WORKER_ID || process.env.NODE_ENV === 'test';

// Progressive startup
const STARTUP_DELAYS = [10, 50, 100, 200];

async function startServerWithRetry(retriesLeft = STARTUP_DELAYS.length) {
  try {
    const server = new YourServer();
    await server.run();
  } catch (error) {
    if (retriesLeft > 0 && (isNpxExecution || isCliExecution)) {
      const delay = STARTUP_DELAYS[STARTUP_DELAYS.length - retriesLeft];
      await new Promise(resolve => setTimeout(resolve, delay));
      return startServerWithRetry(retriesLeft - 1);
    }
    console.error('[ServerName] Server startup failed');
    process.exit(1);
  }
}

// Start if appropriate
if ((isDirectExecution || isNpxExecution || isCliExecution) && !isTest) {
  startServerWithRetry();
}

export { YourServer }; // For programmatic use
```

---

*Tags: #MCP #ModelContextProtocol #ClaudeDesktop #NodeJS #NPM #Debugging #ESM #JavaScript #TypeScript #ServerDisconnected*