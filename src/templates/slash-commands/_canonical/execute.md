---
name: "Clavix: Execute"
description: Execute saved prompts from fast/deep optimization
---

# Clavix: Execute Saved Prompts

Implement optimized prompts from `/clavix:fast` or `/clavix:deep`.

Prompts are automatically saved to `.clavix/outputs/prompts/fast/` or `.clavix/outputs/prompts/deep/`.

---

## CLAVIX MODE: Implementation

**You are in Clavix implementation mode. You ARE authorized to write code and implement features.**

**YOUR ROLE:**
- ✓ Read and understand prompt requirements
- ✓ Implement the optimized prompt
- ✓ Write production-quality code
- ✓ Follow prompt specifications
- ✓ Execute saved prompts from fast/deep modes

**IMPLEMENTATION AUTHORIZED:**
- ✓ Writing functions, classes, and components
- ✓ Creating new files and modifying existing ones
- ✓ Implementing features described in saved prompts
- ✓ Writing tests for implemented code

**MODE ENTRY VALIDATION:**
Before implementing, verify:
1. Source documents exist (prompts in .clavix/outputs/prompts/)
2. Output assertion: "Entering IMPLEMENTATION mode. I will implement the saved prompt."

For complete mode documentation, see: `.clavix/instructions/core/clavix-mode.md`

---

## Prerequisites

Save a prompt first:
```bash
/clavix:fast "your prompt"
# or
/clavix:deep "your prompt"
```

## Usage

**Execute latest prompt (recommended):**
```bash
clavix execute --latest
```

**Execute latest fast/deep:**
```bash
clavix execute --latest --fast
clavix execute --latest --deep
```

**Interactive selection:**
```bash
clavix execute
```

**Execute specific prompt:**
```bash
clavix execute --id <prompt-id>
```

## Agent Workflow

1. Run `clavix execute --latest`
2. Read displayed prompt content
3. Implement requirements
4. **REQUIRED: Run verification**: `clavix verify --latest`
5. After verification passes, cleanup: `clavix prompts clear --executed`

---

## ⚠️ REQUIRED: Post-Implementation Verification

**Verification is a REQUIRED step after implementation.**

After implementing the prompt requirements, you MUST verify your implementation against the checklist:

```bash
clavix verify --latest
```

### What Verification Does

1. **Loads the checklist** from your executed prompt (validation items, edge cases, risks)
2. **Runs automated hooks** (test, build, lint) for items that can be verified programmatically
3. **Guides manual verification** for items requiring human judgment
4. **Generates a verification report** with pass/fail status for each item

### Verification Report

The verification report shows:
- ✅ **Passed items** - Implementation covers the requirement
- ❌ **Failed items** - Implementation does NOT cover (with reason why)
- ⏭️ **Skipped items** - To be verified later
- ➖ **N/A items** - Does not apply to this implementation

### Fast Mode Prompts

Fast mode prompts don't have comprehensive checklists. When verifying a fast mode prompt:
- A **basic checklist is generated** based on detected intent
- Covers essential items (compiles, requirements met, no errors)
- For comprehensive checklists, use `/clavix:deep` instead

### Verification Commands

```bash
# Verify latest executed prompt
clavix verify --latest

# Verify specific prompt
clavix verify --id <prompt-id>

# Show verification status
clavix verify --status

# Re-run failed items only
clavix verify --retry-failed

# Export verification report
clavix verify --export markdown
clavix verify --export json
```

### After Verification

**If all items pass:**
```bash
# Cleanup executed prompts
clavix prompts clear --executed

# Or archive the project
/clavix:archive
```

**If items fail:**
1. Review failed items and reasons
2. Fix implementation issues
3. Re-run verification: `clavix verify --retry-failed --id <prompt-id>`

---

## Prompt Management (CLI Commands)

Prompts saved from `/clavix:fast` and `/clavix:deep` are stored in:
- Fast prompts: `.clavix/outputs/prompts/fast/`
- Deep prompts: `.clavix/outputs/prompts/deep/`

### List All Saved Prompts
```bash
clavix prompts list
```

Shows:
- All saved prompts with age
- Execution status (✓ executed / ○ pending)
- Age warnings (OLD >7d, STALE >30d)
- Storage statistics

### Cleanup Workflows

**After executing prompts (recommended):**
```bash
clavix prompts clear --executed
```

**Remove stale prompts (>30 days):**
```bash
clavix prompts clear --stale
```

**Remove specific type:**
```bash
clavix prompts clear --fast
clavix prompts clear --deep
```

**Interactive cleanup:**
```bash
clavix prompts clear
```

**Remove all (with safety checks):**
```bash
clavix prompts clear --all
```

### Prompt Lifecycle

```
CREATE   → /clavix:fast or /clavix:deep
EXECUTE  → /clavix:execute (you are here)
CLEANUP  → clavix prompts clear --executed
```

### Best Practices

**Regular cleanup schedule:**
1. After executing prompts: Clear executed
2. Weekly: Review and clear stale
3. Before archiving PRD: Clear related prompts

**Storage hygiene:**
- Keep <20 active prompts for performance
- Clear executed prompts regularly
- Review prompts >7 days old

---

## Error Recovery

**No prompts found:**
```bash
/clavix:fast "your requirement"
```
Then retry `/clavix:execute`.

**Too many old prompts:**
```bash
clavix prompts clear --executed
```

---

## Agent Transparency (v4.7)

### File Format Reference
{{INCLUDE:agent-protocols/file-formats.md}}

### Error Handling
{{INCLUDE:agent-protocols/error-handling.md}}

### Agent Decision Rules
{{INCLUDE:agent-protocols/decision-rules.md}}
