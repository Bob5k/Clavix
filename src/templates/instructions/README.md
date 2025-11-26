# Clavix Instructions Hierarchy

This directory contains the complete instruction set for AI agents consuming Clavix workflows. Understanding this hierarchy is critical for maintaining consistent, high-quality agent behavior.

---

## 📐 Documentation Architecture (v4.11)

```
Canonical Templates (SOURCE OF TRUTH)
  src/templates/slash-commands/_canonical/
  ├── improve.md          - Unified prompt optimization (standard + comprehensive)
  ├── prd.md              - PRD generation via Socratic questions
  ├── start.md            - Conversational mode entry
  ├── summarize.md        - Extract requirements from conversation
  ├── plan.md             - Task breakdown from PRD
  ├── implement.md        - Execute tasks with progress tracking
  ├── execute.md          - Run saved prompts
  ├── verify.md           - Post-implementation verification
  └── archive.md          - Archive completed projects
    ↓ (referenced by)
Component Templates (REUSABLE BUILDING BLOCKS)
  src/templates/slash-commands/_components/
  ├── agent-protocols/    - Self-correction, state awareness, decision rules
  ├── sections/           - Quality dimensions, patterns, escalation factors
  └── troubleshooting/    - Mode confusion, triage escalation
    ↓ (copied during clavix init/update)
User Instructions
  .clavix/instructions/
  ├── core/              - Foundational concepts (clavix-mode, verification)
  └── troubleshooting/   - Common issues and fixes
    ↓ (referenced by)
Integration Adapters (THIN WRAPPERS)
  src/templates/integrations/
  ├── claude-code/       - Claude Code adapter
  ├── cursor/            - Cursor adapter
  ├── windsurf/          - Windsurf adapter
  └── ... (22 integrations total)
```

---

## 🎯 Core Principles

### 1. Canonical Templates = Single Source of Truth

**Canonical templates** (`src/templates/slash-commands/_canonical/`) define authoritative behavior:
- Complete workflow descriptions with all steps
- Official command behavior and output formats
- Patterns, examples, and edge cases
- NEVER modified for size/brevity - they define the standard

**Rule:** When in doubt, canonical templates are correct.

### 2. Component Templates = DRY Building Blocks

**Component templates** (`src/templates/slash-commands/_components/`) provide reusable sections:
- `agent-protocols/` - Self-correction, state detection, decision rules
- `sections/` - Quality dimensions, pattern visibility, escalation factors
- `troubleshooting/` - Error recovery and mode confusion handling

**Rule:** Shared content lives in components, not duplicated across canonicals.

### 3. Integration Adapters = Platform-Specific Wrappers

**Integration adapters** (`src/templates/integrations/`) provide minimal platform wrappers:
- Reference canonical templates, don't duplicate content
- Platform-specific formatting and tool usage
- Command format transformation (colon vs hyphen separators)
- Model-specific guidance (context limits, tool availability)

**Rule:** If it's in canonical, don't duplicate in adapter.

---

## 📂 Directory Structure

### `/core/` - Foundational Concepts

Cross-workflow patterns and principles:

| File | Purpose | Key Content |
|------|---------|-------------|
| `clavix-mode.md` | Planning vs implementation distinction | Mode table, command categorization, standard workflow |
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

## 📋 Quick Reference

### Standard Workflow

All workflows follow this progression:

```
PRD Creation → Task Planning → Implementation → Verification → Archive
```

| Phase | Command | Output | Mode |
|-------|---------|--------|------|
| **Planning** | `/clavix:prd` or `/clavix:start` | `full-prd.md` + `quick-prd.md` | PLANNING |
| **Task Prep** | `/clavix:plan` | `tasks.md` | PLANNING |
| **Implementation** | `/clavix:implement` | Executed code | IMPLEMENTATION |
| **Verification** | `/clavix:verify` | Verification report | VERIFICATION |
| **Completion** | `/clavix:archive` | Archived project | MANAGEMENT |

### Command Mode Mapping

| Command | Mode | Implement? |
|---------|------|------------|
| `/clavix:start` | Planning | ✗ NO |
| `/clavix:summarize` | Planning | ✗ NO |
| `/clavix:improve` | Planning | ✗ NO |
| `/clavix:prd` | Planning | ✗ NO |
| `/clavix:plan` | Planning | ✗ NO |
| `/clavix:implement` | Implementation | ✓ YES |
| `/clavix:execute` | Implementation | ✓ YES |
| `/clavix:verify` | Verification | Context-dependent |
| `/clavix:archive` | Management | ✗ NO |

### Agent-Only Commands (No Slash Command)

| CLI Command | Purpose | Invoked By |
|-------------|---------|------------|
| `clavix analyze` | Internal prompt analysis | `improve` workflow |
| `clavix task-complete` | Mark task done | `implement` workflow |

---

## 🔄 Maintenance Workflow

### When Adding New Workflow

1. **Create canonical template** in `src/templates/slash-commands/_canonical/`
   - Complete workflow description
   - All steps, examples, edge cases
   - Include CLAVIX MODE header if planning-only

2. **Create CLI command** in `src/cli/commands/`
   - Implement the command behavior
   - Ensure template and CLI match

3. **Update tests** in `tests/consistency/`
   - Add command to `cli-template-parity.test.ts` categories
   - Update any affected consistency tests

4. **Run validation**: `npm run validate:consistency`

### When Modifying Existing Workflow

1. **Update canonical template** - This is the source of truth
2. **Update CLI if behavior changed**
3. **Run validation**: `npm run validate:consistency`
4. **Users run `clavix update`** - Refreshes their local instructions

### Preventing the "Half-Update" Problem

The v4.11.2 release introduced validation to catch incomplete updates:

```bash
# Run before committing
npm run validate:consistency

# Checks performed:
# - No legacy command references (fast, deep commands removed in v4.11)
# - All CLI commands have templates (if required)
# - All templates have CLI implementations
# - No deprecated version references
# - Mode enforcement headers present
```

---

## 🧠 Design Philosophy

### Why Canonical Templates?

**Canonical templates solve the documentation drift problem:**
- Single authoritative source for workflow behavior
- Agents can trust template instructions match CLI behavior
- Updates propagate through validation, not manual duplication
- Clear ownership: canonical defines, adapters reference

### Why Component Templates?

**Components prevent duplication:**
- Quality dimensions defined once, used in improve.md
- Agent protocols shared across all planning workflows
- Troubleshooting sections reusable across contexts
- Pattern visibility documented centrally

### Why Integration Adapters?

**Adapters handle platform differences:**
- Command format: `/clavix:improve` vs `/clavix-improve`
- Tool availability: Some platforms lack filesystem access
- Context limits: Different token limits per platform
- Model guidance: Platform-specific best practices

---

## 🔧 Troubleshooting

### "Agent jumped to implementation during planning"

**Root cause:** Agent didn't recognize planning mode boundary

**Fix:**
1. Check canonical template has CLAVIX MODE header at top
2. Verify "DO NOT IMPLEMENT" warnings present
3. Reference `troubleshooting/jumped-to-implementation.md`

### "Agent skipped file creation"

**Root cause:** File-saving protocol not explicit enough

**Fix:**
1. Add explicit step-by-step file creation section
2. Include verification step with file listing
3. Reference `troubleshooting/skipped-file-creation.md`

### "Legacy command references found"

**Root cause:** Template not updated during v4.11 migration

**Fix:**
1. Run `npm run validate:consistency` to find all occurrences
2. Replace legacy fast/deep commands with `clavix improve`
3. Replace "fast mode"/"deep mode" with "standard depth"/"comprehensive depth"
4. Update any navigation references

### "Template doesn't match CLI behavior"

**Root cause:** CLI changed without updating canonical template

**Fix:**
1. Read canonical template in `src/templates/slash-commands/_canonical/`
2. Compare with actual CLI behavior
3. Update canonical template to match CLI
4. Run `npm run validate:consistency`
5. Update `cli-template-parity.test.ts` if needed

---

## 📚 Key Files Reference

### Canonical Templates (Start Here)
- `improve.md` - Unified prompt optimization (v4.11)
- `prd.md` - PRD generation workflow
- `implement.md` - Task execution workflow

### Agent Protocols
- `_components/agent-protocols/self-correction.md` - Mistake detection
- `_components/agent-protocols/state-awareness.md` - Workflow state tracking
- `_components/agent-protocols/decision-rules.md` - Decision logic

### Validation
- `scripts/validate-consistency.ts` - TypeScript ↔ Template validator
- `tests/consistency/cli-template-parity.test.ts` - CLI-Template mapping tests

---

**Last updated:** v4.11.2 (November 2025)

**Validation:** Run `npm run validate:consistency` before committing changes.
