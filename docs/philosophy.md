# What Clavix Actually Is

## Agent-First Architecture

**Clavix is an instruction injection system for AI coding agents.**

When you run `clavix init`, Clavix injects structured instructions, slash commands, and workflow guidelines into your AI agent's context. These injections guide the agent to follow disciplined workflows instead of jumping straight to implementation.

### Supported AI Agents

Clavix integrates with 20+ AI coding environments:

| Category | Agents |
|----------|--------|
| **IDE Extensions** | Cursor, Windsurf, Kilocode, Roocode, Cline |
| **CLI Agents** | Claude Code, Droid, CodeBuddy, OpenCode, Gemini CLI, Qwen, Amp, Codex, Augment |
| **Universal** | GitHub Copilot (instructions.md), AGENTS.md format, WARP.md, OCTO.md |

### How the Injection Works

1. **`clavix init`** detects which AI agents you use
2. **Generates agent-specific files** in the locations each agent reads:
   - `.claude/commands/` for Claude Code slash commands
   - `.cursor/rules/` for Cursor rules
   - `AGENTS.md` for generic agents
   - `.github/copilot-instructions.md` for GitHub Copilot
3. **Agent reads these files** and follows the embedded instructions
4. **User invokes workflows** via slash commands (`/clavix:improve`, `/clavix:prd`)
5. **Agent executes** following the structured workflow, not ad-hoc

### What Gets Injected

Each agent receives:
- **Mode enforcement rules**: Planning mode vs Implementation mode boundaries
- **Workflow templates**: Step-by-step instructions for each command
- **Self-correction protocols**: How to detect and fix common mistakes
- **File operation patterns**: Where to save outputs, how to verify
- **Checkpoint markers**: Progress tracking through workflows

The agent doesn't "use" Clavix as a service. The agent **becomes** Clavix-aware through these injected instructions.

---

## The Problem Clavix Solves

AI coding agents are eager to help. Too eager. When you say "I need a user authentication system," most agents immediately start writing code.

This is the wrong behavior for complex work because:
- Requirements aren't clear yet
- Architecture decisions haven't been made
- Edge cases haven't been considered
- The user might not know what they actually need

**Clavix injects discipline.** It teaches agents to:
1. **Ask questions first** (conversational mode)
2. **Document requirements** (PRD generation)
3. **Break down tasks** (planning)
4. **Only then implement** (with explicit permission)

---

## What Clavix Provides

### Workflow Structure

The core value is structured workflows, not individual features:

```
Explore → Document → Plan → Implement → Verify
```

Each stage has explicit boundaries. Agents cannot skip from "explore" to "implement" without going through documentation and planning.

### Slash Commands

Users invoke workflows through slash commands:

| Command | Stage | What It Does |
|---------|-------|--------------|
| `/clavix:start` | Explore | Conversational requirements gathering |
| `/clavix:summarize` | Document | Extract requirements from conversation |
| `/clavix:prd` | Document | Guided PRD generation |
| `/clavix:plan` | Plan | Transform PRD into task breakdown |
| `/clavix:improve` | Optimize | Structure and optimize a prompt |
| `/clavix:implement` | Implement | Execute tasks or prompts (auto-detects source) |
| `/clavix:verify` | Verify | Check implementation against checklist |

### Mode Enforcement

Every workflow is tagged as either:
- **Planning Mode**: Agent analyzes, documents, asks questions. **No code allowed.**
- **Implementation Mode**: Agent writes code. **Only after explicit transition.**

Agents output mode assertions so users can see what mode they're in:
```
**CLAVIX MODE: Improve**
Mode: planning
Purpose: Optimizing user prompt
Implementation: BLOCKED
```

---

## How the Technical Parts Work

### Prompt Optimization (Pattern-Based)

When you use `/clavix:improve`, the injected instructions tell the agent to:

1. **Detect intent** using keyword scoring across 11 categories
2. **Assess quality** using heuristic rules across 6 dimensions
3. **Apply patterns** that match the detected intent
4. **Save the result** to `.clavix/outputs/prompts/`

This is deterministic pattern matching, not AI. The same prompt always produces the same analysis.

### Quality Assessment Dimensions

- **Clarity**: Is the objective unambiguous?
- **Efficiency**: Is it concise without losing information?
- **Structure**: Is information organized logically?
- **Completeness**: Are necessary details provided?
- **Actionability**: Can an agent take immediate action?
- **Specificity**: Are there concrete identifiers, versions, paths?

### Optimization Patterns

Patterns transform prompts based on detected issues:
- **ConcisenessFilter**: Removes pleasantries and filler
- **ObjectiveClarifier**: Adds clear goal statements
- **StructureOrganizer**: Reorders information logically
- **AmbiguityDetector**: Identifies unclear terms
- **StepDecomposer**: Breaks complex requests into steps

---

## What Clavix Does NOT Do

### No AI/LLM Processing

Clavix itself makes no API calls. It runs locally and generates static files. The "intelligence" comes from the AI agent reading and following the injected instructions.

### No Semantic Understanding

Pattern matching cannot understand meaning. Clavix:
- Cannot know if your prompt will work
- Cannot evaluate technical correctness
- Cannot judge creative quality
- Cannot guarantee improvements help

### No Magic

Everything Clavix does is:
- **Local**: Files on your machine
- **Deterministic**: Same input = same output
- **Transparent**: All patterns documented

---

## Honest Tooling Philosophy

We believe in transparency:

- **We describe what the tool does**, not what you want to hear
- **We show limitations**, not just capabilities
- **We don't claim accuracy** we haven't validated
- **We prefer "designed to help"** over "guarantees success"

Clavix is a utility for injecting structure into AI agent workflows. It helps more often than not, but results depend on your input, your agent, and your use case.

Think of it as a linter for AI workflows: helpful for catching common issues and enforcing consistency, but not a substitute for understanding what you're building.

---

## Summary

**Clavix = Agent instruction injection + Workflow enforcement + Pattern-based optimization**

The value is in the structured workflows injected into your AI agent, not in any individual analysis or pattern. The agent follows the discipline because Clavix taught it to.
