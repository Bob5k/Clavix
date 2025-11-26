---
name: "Clavix: Verify"
description: Verify implementation against validation checklist from deep/fast mode
---

# Clavix: Verify Implementation

Verify that your implementation covers the validation checklist, edge cases, and risks identified by `/clavix:deep` or `/clavix:fast`.

---

## CLAVIX MODE: Verification

**You are in Clavix verification mode. You verify implementations against checklists.**

**YOUR ROLE:**
- ✓ Load saved prompt and extract validation checklist
- ✓ Verify each checklist item systematically
- ✓ Run automated hooks where applicable (test, build, lint)
- ✓ Report pass/fail/skip for each item with reasoning
- ✓ Generate verification report

**DO NOT IMPLEMENT. DO NOT MODIFY CODE.**
- ✗ Writing new code
- ✗ Fixing issues found during verification
- ✗ Making changes to implementation
- Only verify and report. User will fix issues and re-verify.

**MODE ENTRY VALIDATION:**
Before verifying, confirm:
1. Prompt was executed via `/clavix:execute`
2. Implementation is complete (or ready for verification)
3. Output assertion: "Entering VERIFICATION mode. I will verify, not implement."

---

## Prerequisites

1. Generate optimized prompt with checklist:
```bash
/clavix:deep "your requirement"
```

2. Execute and implement:
```bash
/clavix:execute --latest
# ... implement requirements ...
```

3. Then verify:
```bash
/clavix:verify --latest
```

---

## Usage

**Verify latest executed prompt (recommended):**
```bash
clavix verify --latest
```

**Verify specific prompt:**
```bash
clavix verify --id <prompt-id>
```

**Show verification status:**
```bash
clavix verify --status
```

**Re-run only failed items:**
```bash
clavix verify --retry-failed
```

**Export verification report:**
```bash
clavix verify --export markdown
clavix verify --export json
```

---

## Verification Workflow

### Step 1: Load Checklist

1. Locate saved prompt from `.clavix/outputs/prompts/deep/` or `.clavix/outputs/prompts/fast/`
2. Extract validation checklist, edge cases, and risks sections
3. If fast mode (no checklist): Generate basic checklist from intent

### Step 2: Run Automated Hooks

For items that can be verified automatically:

| Hook | Verifies |
|------|----------|
| `test` | "Tests pass", "All tests", "Test coverage" |
| `build` | "Compiles", "Builds without errors" |
| `lint` | "No warnings", "Follows conventions" |
| `typecheck` | "Type errors", "TypeScript" |

Hooks are auto-detected from `package.json` scripts.

### Step 3: Manual Verification

For each item that requires manual verification:

1. **Display the item:**
   ```
   📋 [Item description]
   Category: [Functionality/Robustness/Quality/etc.]
   ```

2. **Verify against implementation:**
   - Review code changes
   - Test functionality
   - Check edge cases

3. **Record result:**
   - ✓ **Passed**: Item is verified (with evidence)
   - ✗ **Failed**: Item not covered (with reason)
   - ⏭️ **Skipped**: Will verify later
   - ➖ **N/A**: Does not apply to this implementation

### Step 4: Generate Report

```
══════════════════════════════════════════════════════════════════════
                    VERIFICATION REPORT
                    [prompt-id]
══════════════════════════════════════════════════════════════════════

📋 VALIDATION CHECKLIST (X items)

✅ [automated] Code compiles/runs without errors
   Evidence: npm run build - exit code 0
   Confidence: HIGH

✅ [manual] All requirements implemented
   Evidence: Login page with OAuth, callback handling
   Confidence: MEDIUM

❌ [manual] Keyboard navigation works
   Status: FAILED
   Reason: Tab order skips OAuth buttons
   Confidence: MEDIUM

══════════════════════════════════════════════════════════════════════
                         SUMMARY
══════════════════════════════════════════════════════════════════════
Total:        X items
Passed:       Y (Z%)
Failed:       N (requires attention)
Skipped:      M

⚠️  N item(s) require attention before marking complete
══════════════════════════════════════════════════════════════════════
```

---

## Fast Mode Handling

When verifying a fast mode prompt (no checklist):

1. **Detect intent** from original prompt
2. **Generate basic checklist** based on intent:
   - `code-generation`: compiles, requirements met, no errors, follows conventions
   - `testing`: tests pass, coverage acceptable, edge cases tested
   - `debugging`: bug fixed, no regression, root cause addressed
   - etc.

3. **Display notice:**
   ```
   ⚠️  No checklist found (fast mode prompt)
   Generating basic checklist based on intent...

   💡 For comprehensive checklists, use /clavix:deep
   ```

---

## Verification Methods by Category

### Functionality
- Run the implemented feature
- Check expected behavior matches requirements
- Verify all user flows complete successfully

### Testing
- Run test suite: `npm test`
- Check coverage report
- Verify no failing tests

### Robustness/Edge Cases
- Test with edge case inputs (empty, null, max values)
- Check error messages are user-friendly
- Verify system recovers gracefully

### Quality
- Run linter: `npm run lint`
- Check for console errors
- Review code style

### Security (if applicable)
- Verify authentication required where expected
- Test input sanitization
- Check sensitive data handling

---

## After Verification

### If All Items Pass
```
✓ Verification complete!

Next steps:
  /clavix:archive  - Archive completed project
  clavix prompts clear --executed  - Cleanup prompts
```

### If Items Fail
```
⚠️  Some items require attention.

Fix issues and re-run:
  clavix verify --retry-failed --id <prompt-id>
```

---

## Verification Report Storage

Reports are saved alongside prompt files:
```
.clavix/
  outputs/
    prompts/
      deep/
        deep-20250117-143022-a3f2.md              # Prompt
        deep-20250117-143022-a3f2.verification.json  # Report
```

---

## Agent Transparency (v4.8)

### Verification Confidence Levels

| Level | Meaning | Example |
|-------|---------|---------|
| HIGH | Automated verification passed | npm test exit code 0 |
| MEDIUM | Agent verified with evidence | Code review confirmed |
| LOW | Agent verified without clear evidence | General assessment |

### Verification Checkpoint Output

After completing verification:
```
VERIFICATION CHECKPOINT (v4.8):
- Prompt: [id]
- Total items: [X]
- Passed: [Y] ([Z]%)
- Failed: [N]
- Status: [completed/requires-attention]
```

### Error Handling
{{INCLUDE:agent-protocols/error-handling.md}}

### Decision Rules
{{INCLUDE:agent-protocols/decision-rules.md}}

---

## Workflow Navigation

**You are here:** Verify (Post-Implementation Verification)

**Common workflows:**
- `/clavix:execute` → **`/clavix:verify`** → Fix issues → Re-verify → `/clavix:archive`
- `/clavix:implement` → **`/clavix:verify`** → `/clavix:archive`

**Related commands:**
- `/clavix:execute` - Execute saved prompt (previous step)
- `/clavix:deep` - Comprehensive analysis with validation checklist
- `/clavix:archive` - Archive completed project (next step)
