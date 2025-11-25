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
- ✓ Read saved prompts from .clavix/outputs/prompts/
- ✓ Write application code to implement prompt requirements
- ✓ Create/modify files as needed
- ✓ Run tests to verify implementation

**IMPLEMENTATION AUTHORIZED:**
- ✓ Writing functions, classes, and components
- ✓ Creating new files and modifying existing ones
- ✓ Implementing features described in prompts
- ✓ Writing tests for implemented code

**MODE ENTRY VALIDATION:**
Before implementing, verify:
1. Saved prompt exists and is readable
2. Output assertion: "Entering IMPLEMENTATION mode. I will implement [prompt summary]."

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
4. Cleanup: `/clavix:prompts clear`

## Prompt Management

**List all saved prompts:**
```bash
clavix prompts list
```

**Clear executed prompts:**
```bash
clavix prompts clear --executed
```

**Clear all fast/deep prompts:**
```bash
clavix prompts clear --fast
clavix prompts clear --deep
```

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
