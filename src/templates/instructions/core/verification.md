# Verification & Checkpoint Patterns

## Overview

Verification ensures that critical workflow steps actually completed successfully. This document provides patterns for adding checkpoints and validation to Clavix workflows.

---

## Checkpoint Markers

### What Are Checkpoints?

Checkpoints are standardized markers that agents output to confirm workflow step completion. They enable:
- Progress tracking
- Failure detection
- Workflow validation
- Debugging

### Checkpoint Format

```markdown
**CHECKPOINT:** [Brief description of what was completed]
```

### Examples

```markdown
**CHECKPOINT:** Entered conversational mode (gathering requirements only)
**CHECKPOINT:** Asked 5 clarifying questions about authentication system
**CHECKPOINT:** Extracted requirements from conversation
**CHECKPOINT:** Created 3 output files successfully
**CHECKPOINT:** Files verified - all exist at expected paths
```

---

## When to Add Checkpoints

### 1. Mode Transitions

**When entering a specific mode:**
```markdown
**CHECKPOINT:** Entered conversational mode for requirements gathering
**CHECKPOINT:** Started PRD generation workflow
**CHECKPOINT:** Beginning deep analysis of prompt
```

### 2. After File Operations

**After creating files:**
```markdown
**CHECKPOINT:** Files created successfully - verified existence
**CHECKPOINT:** Saved prompt to .clavix/outputs/prompts/fast/fast-20251124-1430.md
```

### 3. After Complex Operations

**After multi-step processes:**
```markdown
**CHECKPOINT:** Completed Clavix Intelligence™ optimization - 5 improvements applied
**CHECKPOINT:** Analyzed conversation - extracted 12 requirements, 3 constraints
```

### 4. At Decision Points

**When making workflow decisions:**
```markdown
**CHECKPOINT:** Conversation complexity threshold reached (15+ exchanges) - suggesting summarization
**CHECKPOINT:** Missing critical requirements - requesting more information before proceeding
```

---

## Verification Patterns

### Pattern 1: File Existence Verification

**After file creation, always verify:**

```markdown
**Step 5: Verify File Creation**

List the created files to confirm they exist:
```
Created files:
✓ .clavix/outputs/[project]/mini-prd.md
✓ .clavix/outputs/[project]/original-prompt.md
✓ .clavix/outputs/[project]/optimized-prompt.md
```

**CHECKPOINT:** All files created successfully.

If any file is missing:
- Review file creation steps
- See troubleshooting: `.clavix/instructions/troubleshooting/skipped-file-creation.md`
```

---

### Pattern 2: Content Validation

**Verify content meets requirements:**

```markdown
**Step 6: Validate Content**

Verify each file contains:
- ✓ mini-prd.md: Objective, Requirements, Constraints, Success Criteria sections
- ✓ original-prompt.md: At least 2 paragraphs of extracted requirements
- ✓ optimized-prompt.md: Improvements labeled with [ADDED], [CLARIFIED], etc.

**CHECKPOINT:** Content validation passed.
```

---

### Pattern 3: Mode Boundary Verification

**Verify agent stayed in correct mode:**

```markdown
**Step 7: Mode Compliance Check**

Confirm you stayed in CLAVIX MODE:
- ✓ Did NOT implement application code
- ✓ Did NOT generate feature implementations
- ✓ Only created planning documents and prompts

**CHECKPOINT:** Mode boundaries respected.
```

---

### Pattern 4: Requirement Completeness

**Verify minimum requirements gathered:**

```markdown
**Pre-Extraction Validation**

Before proceeding with summarization, verify conversation includes:
- ✓ Clear project objective (what are we building?)
- ✓ At least 3 core requirements
- ✓ Technical constraints or framework preferences (if applicable)

If ANY are missing:
- DO NOT proceed with summarization
- Ask clarifying questions to gather missing information
- Reference: `.clavix/instructions/troubleshooting/incomplete-requirements.md`

**CHECKPOINT:** Minimum requirements met - proceeding with extraction.
```

---

## Self-Correction Patterns

### Detecting Premature Implementation

```markdown
**Self-Check: Am I Implementing?**

If you catch yourself:
- Writing application code (functions, components, classes)
- Implementing features being discussed
- Generating code examples for the actual feature

**IMMEDIATE ACTION:**
1. STOP writing implementation code
2. Delete the implementation attempt
3. Output: "I apologize - I was jumping to implementation. Let me return to requirements gathering."
4. Return to asking clarifying questions
5. Reference: `.clavix/instructions/core/clavix-mode.md`

**CHECKPOINT:** Self-corrected - returned to requirements mode.
```

---

### Detecting Skipped Steps

```markdown
**Self-Check: Did I Skip File Creation?**

Before completing the summarization workflow, verify:
- ✓ Created .clavix/outputs/[project]/ directory
- ✓ Wrote mini-prd.md
- ✓ Wrote original-prompt.md
- ✓ Wrote optimized-prompt.md
- ✓ Verified all files exist

If any step was skipped:
1. Go back and complete missing steps
2. Reference: `.clavix/instructions/core/file-operations.md`
3. Verify files exist before marking workflow complete

**CHECKPOINT:** All file creation steps completed.
```

---

## Troubleshooting Detection

### Pattern: Identify Common Failures

```markdown
**Troubleshooting Check**

If workflow isn't proceeding as expected, check:

1. **Files not created?**
   - See: `.clavix/instructions/troubleshooting/skipped-file-creation.md`
   - Common cause: Used "suggest saving" instead of explicit Write tool steps

2. **Jumped to implementation?**
   - See: `.clavix/instructions/troubleshooting/jumped-to-implementation.md`
   - Common cause: Didn't see CLAVIX MODE boundary or mode enforcement

3. **Conversation not progressing?**
   - See: `.clavix/instructions/troubleshooting/mode-confusion.md`
   - Common cause: Unclear which mode (planning vs implementation) is active

**CHECKPOINT:** Troubleshooting guidance provided if needed.
```

---

## Verification in Specific Workflows

### Conversational Mode (/clavix:start)

```markdown
**Checkpoints to include:**

1. After entering mode:
   **CHECKPOINT:** Entered conversational mode (gathering requirements only)

2. After asking questions:
   **CHECKPOINT:** Asked [N] clarifying questions about [topic]

3. At complexity threshold:
   **CHECKPOINT:** Complexity threshold reached - suggesting /clavix:summarize

4. Before any implementation attempt:
   **SELF-CHECK:** Am I about to implement? If yes, STOP and return to questions.

5. When user says "summarize":
   **CHECKPOINT:** Transitioning to summarization workflow
```

---

### Summarization (/clavix:summarize)

```markdown
**Checkpoints to include:**

1. Before extraction:
   **CHECKPOINT:** Pre-extraction validation passed - minimum requirements present

2. After extraction:
   **CHECKPOINT:** Extracted [N] requirements, [M] constraints from conversation

3. Before file creation:
   **CHECKPOINT:** Beginning file creation (3 files required)

4. After each file:
   **CHECKPOINT:** Created mini-prd.md successfully
   **CHECKPOINT:** Created original-prompt.md successfully
   **CHECKPOINT:** Created optimized-prompt.md successfully

5. After verification:
   **CHECKPOINT:** All files verified - exist at expected paths

6. After optimization:
   **CHECKPOINT:** Applied Clavix Intelligence™ - [N] improvements added

7. Workflow complete:
   **CHECKPOINT:** Summarization workflow complete - all outputs created
```

---

### Prompt Improvement (/clavix:improve)

```markdown
**Checkpoints to include:**

1. After triage:
   **CHECKPOINT:** Triage complete - [standard/comprehensive] depth selected

2. After analysis:
   **CHECKPOINT:** Analyzed prompt - identified [N] improvement areas

3. After optimization:
   **CHECKPOINT:** Generated optimized prompt with [N] enhancements

4. After file creation:
   **CHECKPOINT:** Saved prompt to .clavix/outputs/prompts/[id].md

5. After verification:
   **CHECKPOINT:** File verified - prompt saved successfully
```

**For Comprehensive Depth (`/clavix:improve --comprehensive`):**

```markdown
**Additional checkpoints:**

1. After alternative analysis:
   **CHECKPOINT:** Generated [N] alternative phrasings

2. After edge case analysis:
   **CHECKPOINT:** Identified [M] edge cases and potential issues

3. After validation checklist:
   **CHECKPOINT:** Created comprehensive analysis with validation checklist
```

---

## Integration with Runtime Validation (Future)

### Checkpoint Format for Parsing

Use consistent format to enable future automated validation:

```markdown
**CHECKPOINT:** <status> - <description>

Where:
- <status>: SUCCESS, WARNING, ERROR, INFO
- <description>: What was completed or detected

Examples:
**CHECKPOINT:** SUCCESS - Files created and verified
**CHECKPOINT:** WARNING - Complexity threshold reached
**CHECKPOINT:** ERROR - Missing required information
**CHECKPOINT:** INFO - Entered conversational mode
```

### Future Enhancements

- Parse checkpoint markers from agent output
- Detect missing expected checkpoints
- Validate workflow completion
- Generate workflow reports
- Identify common failure patterns

---

## Summary

**Always include:**
1. **Checkpoints** after major workflow steps
2. **Verification steps** for file operations
3. **Self-correction checks** at decision points
4. **Troubleshooting detection** for common failures

**Format:**
```markdown
**CHECKPOINT:** [Clear description of what completed]
```

**Use verification to:**
- Confirm files created
- Validate content structure
- Ensure mode boundaries respected
- Detect and correct failures

**Reference troubleshooting guides when:**
- Files not created
- Implementation occurred prematurely
- Mode confusion detected
- Requirements incomplete
