# Clavix Instructions Hierarchy

This directory contains the complete instruction set for AI agents consuming Clavix workflows. Understanding this hierarchy is critical for maintaining consistent, high-quality agent behavior.

---

## 📐 Documentation Architecture

```
Canonical Templates (SOURCE OF TRUTH)
  src/templates/slash-commands/_canonical/
  ├── fast.md, deep.md, prd.md
  ├── start.md, summarize.md
  ├── plan.md, implement.md, execute.md
  └── archive.md, prompts.md
    ↓ (inform)
Instruction Files (AGENT-CONSUMABLE)
  src/templates/instructions/
  ├── workflows/         - Complete step-by-step workflows
  ├── core/             - Foundational concepts and patterns
  └── troubleshooting/  - Common issues and solutions
    ↓ (reference)
Generic Connectors (THIN WRAPPERS + PLATFORM-SPECIFIC)
  src/templates/agents/
  ├── agents.md          - Generic agents (no slash command support)
  ├── octo.md           - Octofriend-specific guidance
  ├── copilot-instructions.md - GitHub Copilot integration
  └── warp.md           - Warp AI-specific guidance
    ↓ (integrated into)
Platform Files (.clavix/ directory in user projects)
  .clavix/instructions/
  └── [Same structure as src/templates/instructions/]
```

---

## 🎯 Core Principles

### 1. Single Source of Truth

**Canonical templates** (`src/templates/slash-commands/_canonical/`) are the definitive reference:
- Complete workflow descriptions
- Official command behavior
- Authoritative patterns and examples
- NEVER modified for size/brevity - they define the standard

**Rule:** When canonical and instruction files conflict, canonical wins.

### 2. Agent-Optimized Instructions

**Instruction files** (`src/templates/instructions/`) are derived from canonical templates but optimized for AI agent consumption:
- Must match canonical workflows 100% in substance
- Can reorganize for better agent comprehension
- Add explicit checkpoints, self-correction checks, troubleshooting
- Include "Common Mistakes" sections with wrong/right examples
- Expand on ambiguous points from canonical

**Rule:** Instruction files implement canonical, never contradict it.

### 3. Thin Generic Connectors

**Generic connector files** (`src/templates/agents/`) are minimal wrappers:
- Reference instruction files, don't duplicate them
- Platform-specific guidance ONLY (model switching, tool limitations, etc.)
- Brief workflow overview + standard workflow (PRD → Plan → Implement → Archive)
- Command quick reference table
- Common mistakes specific to platform

**Target sizes:**
- agents.md: 4-7K (generic, no platform features)
- octo.md: 7-10K (Octofriend has unique features)
- copilot-instructions.md: 5-7K (GitHub Copilot integration)
- warp.md: 5-7K (Warp AI-specific)

**Rule:** If it's in an instruction file, don't duplicate it in a connector file.

---

## 📂 Directory Structure

### `/workflows/` - Step-by-Step Workflows

Complete, executable workflows with explicit steps:

| File | Purpose | Key Sections |
|------|---------|--------------|
| `start.md` | Conversational mode entry | Questions, complexity tracking, mode transitions |
| `summarize.md` | Extract requirements from conversation | Pre-validation, extraction, file creation, optimization |
| `fast.md` | Quick prompt optimization | Intent detection, quality assessment, smart triage |
| `deep.md` | Comprehensive analysis | Strategic scope, alternatives, validation, edge cases, risks |
| `prd.md` | PRD generation via Socratic questions | 5-question sequence, validation criteria, file-saving protocol |

**Pattern:** Each workflow file includes:
- CLAVIX PLANNING MODE block (clarifies planning vs implementation)
- Complete workflow steps with checkpoints
- Self-correction checks
- Common mistakes (wrong/right examples)
- Troubleshooting references
- Integration with other workflows

### `/core/` - Foundational Concepts

Cross-workflow patterns and principles:

| File | Purpose | Key Content |
|------|---------|-------------|
| `clavix-mode.md` | Planning vs implementation distinction | Mode table, standard workflow, command categorization |
| `file-operations.md` | File creation patterns | Write tool usage, verification steps, error handling |
| `verification.md` | Checkpoint patterns | Self-correction triggers, validation approaches |

**Purpose:** Define concepts used across multiple workflows to avoid duplication.

### `/troubleshooting/` - Common Issues

Problem → Solution guides:

| File | Purpose | Symptoms & Solutions |
|------|---------|---------------------|
| `jumped-to-implementation.md` | Agent implemented during planning | Detect, stop, apologize, return to planning |
| `skipped-file-creation.md` | Files not created | Explicit Write tool steps, verification protocol |
| `mode-confusion.md` | Unclear planning vs implementation | Ask user to clarify, explain mode boundaries |

**Pattern:** Each troubleshooting file includes:
- Symptoms (how to detect the problem)
- Root cause (why it happened)
- Solution (step-by-step fix)
- Prevention (how to avoid in future)

---

## 🔄 Maintenance Workflow

### When Adding New Workflow

1. **Create canonical template** in `src/templates/slash-commands/_canonical/`
   - Complete workflow description
   - All steps, examples, edge cases
   - This is the official reference

2. **Create instruction file** in `src/templates/instructions/workflows/`
   - Match canonical 100% in substance
   - Reorganize for agent consumption
   - Add checkpoints, self-correction, common mistakes
   - Reference troubleshooting files

3. **Update generic connectors** in `src/templates/agents/`
   - Add brief mention + reference to instruction file
   - Update workflow detection keywords table
   - Update CLI quick reference if new command
   - DO NOT duplicate workflow steps

4. **Update this README** if new pattern/principle introduced

### When Modifying Existing Workflow

1. **Update canonical template first** - This is source of truth
2. **Update instruction file to match** - Ensure 100% alignment
3. **Update connector files** - Only if platform-specific guidance changes
4. **Test with `clavix update`** - Verify templates deployed correctly

### When Reporting Verbosity Issues

**Bloat checklist:**
1. Is canonical template duplicated in instruction file? → Remove from instruction, reference canonical
2. Is instruction file duplicated in connector file? → Remove from connector, reference instruction
3. Is workflow description inline in connector? → Remove, add table reference to instruction file
4. Are "Common Mistakes" duplicated across files? → Keep in instruction file only
5. Is command reference table too detailed? → Condense to single-line purpose

**Size targets:**
- Canonical templates: 10-20K (complete reference, no size limit)
- Instruction files: 10-18K (agent-optimized, comprehensive)
- Generic connectors: 4-10K (thin wrappers)

---

## 🧠 Design Philosophy

### Why Three Layers?

**Layer 1: Canonical Templates**
- **Audience:** CLI implementation, human developers, official documentation
- **Purpose:** Define authoritative behavior
- **Constraint:** Complete and accurate, no brevity requirement

**Layer 2: Instruction Files**
- **Audience:** AI agents (all platforms)
- **Purpose:** Executable guidance with self-correction
- **Constraint:** Must match canonical, optimized for agent comprehension

**Layer 3: Generic Connectors**
- **Audience:** Platform-specific agents (Copilot, Octofriend, Warp, generic)
- **Purpose:** Minimal platform-specific wrapper + references
- **Constraint:** Keep thin, reference instruction files, platform-unique guidance only

### Why Not Just One File?

**Problems with single-file approach:**
1. **Duplication:** Same workflow described 4+ times (canonical + 3 platforms)
2. **Maintenance burden:** Update one workflow = edit 4+ files
3. **Size bloat:** Each platform file becomes 15-20K
4. **Inconsistency:** Descriptions drift apart over time
5. **Confusion:** Agent sees multiple versions, unclear which is authoritative

**Benefits of three-layer hierarchy:**
1. **DRY principle:** Write workflow once (instruction file), reference everywhere
2. **Single source of truth:** Canonical → Instruction → Connector flow
3. **Platform focus:** Connector files focus on platform-specific value (model switching, tool limitations)
4. **Maintainability:** Fix bug in one instruction file, all platforms benefit
5. **Clarity:** Agent knows where to look - instruction file for workflow, connector for platform quirks

---

## 📋 Quick Reference Tables

### Standard Workflow

All workflows follow this progression:

```
PRD Creation → Task Planning → Implementation → Archive
```

| Phase | Command | Output | Mode |
|-------|---------|--------|------|
| **Planning** | `clavix prd` or conversational | `full-prd.md` + `quick-prd.md` | PLANNING |
| **Task Prep** | `clavix plan` | `tasks.md` | PLANNING (Pre-Implementation) |
| **Implementation** | `clavix implement` | Executed code | IMPLEMENTATION |
| **Completion** | `clavix archive` | Archived project | Management |

### Mode Distinction

| Command | Mode | Implement? |
|---------|------|------------|
| `/clavix:start` | Planning | ✗ NO |
| `/clavix:summarize` | Planning | ✗ NO |
| `/clavix:fast` | Planning | ✗ NO |
| `/clavix:deep` | Planning | ✗ NO |
| `/clavix:prd` | Planning | ✗ NO |
| `/clavix:plan` | Planning (Pre-Implementation) | ✗ NO |
| `/clavix:implement` | Implementation | ✓ YES |
| `/clavix:execute` | Implementation | ✓ YES |
| `/clavix:task-complete` | Implementation | ✓ YES |

### File Size Expectations

| File Type | Size Range | Line Range | Purpose |
|-----------|-----------|------------|---------|
| Canonical Template | 10-20K | 300-600 lines | Complete reference (no limit) |
| Instruction File | 10-18K | 350-650 lines | Agent-executable workflows |
| Generic Connector | 4-10K | 150-300 lines | Thin wrapper + platform-specific |

---

## 🔧 Troubleshooting

### "Agent jumped to implementation during planning"

**Root cause:** Agent didn't recognize planning mode boundary

**Fix:**
1. Check instruction file has CLAVIX PLANNING MODE block at top
2. Verify "DO NOT IMPLEMENT" warnings present and clear
3. Add self-correction check: "Check 1: Am I Implementing?"
4. Reference `troubleshooting/jumped-to-implementation.md`

### "Agent skipped file creation"

**Root cause:** File-saving protocol not explicit enough

**Fix:**
1. Add explicit step-by-step file creation section
2. Include "Step N: Verify Files Were Created" with ls command
3. Add common mistake: "Skipping file creation"
4. Reference `troubleshooting/skipped-file-creation.md`

### "Generic connector file too large (>10K)"

**Root cause:** Duplicating instruction file content

**Fix:**
1. Identify duplicated workflow descriptions
2. Replace with table reference to instruction file
3. Keep only platform-specific guidance (model switching, tool limitations, etc.)
4. Condense CLI reference table (one line per command)
5. Remove detailed workflow explanations (link to instruction file instead)

### "Instruction file doesn't match canonical"

**Root cause:** Manual edit to instruction file without checking canonical

**Fix:**
1. Read canonical template: `src/templates/slash-commands/_canonical/<workflow>.md`
2. Compare with instruction file: `src/templates/instructions/workflows/<workflow>.md`
3. Ensure substance matches 100%
4. Reorganization for agent clarity is OK, contradicting canonical is NOT

---

## 📚 Additional Resources

**Related documentation:**
- `src/templates/slash-commands/_canonical/README.md` - Canonical template guidelines
- `src/templates/agents/README.md` - Generic connector patterns (if exists)
- `CONTRIBUTING.md` - General contribution guidelines
- `ARCHITECTURE.md` - Overall Clavix architecture

**Key files to read first:**
- `core/clavix-mode.md` - Understand planning vs implementation
- `workflows/fast.md` - See complete workflow pattern
- `../agents/octo.md` - See thin connector example (post-v3.6.1)

---

**Last updated:** v3.6.1 (November 2025)

**Maintainers:** Ensure this README stays synchronized with actual instruction hierarchy.
