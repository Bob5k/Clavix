# Troubleshooting: Agent Skipped File Creation

## Problem Description

Agent completed a Clavix workflow but didn't create the expected output files. Content was displayed in chat but not saved to disk.

---

## Symptoms

- Agent says "files created" but they don't exist in `.clavix/outputs/`
- Agent provides content in chat instead of using Write tool
- Agent completes `/clavix:summarize` but no mini-prd.md, original-prompt.md, or optimized-prompt.md files
- Agent finishes `/clavix:improve` but no saved prompt file
- Agent generates PRD content but no PRD.md or PRD-quick.md files

---

## Why This Happens

**Root causes:**

1. **Suggestive language** - Instructions say "suggest saving" instead of "you MUST save"
2. **Missing Write tool instructions** - No explicit "Use the Write tool to create..." steps
3. **Optional phrasing** - "If filesystem access available" makes file creation optional
4. **No verification step** - Agent can't detect that files weren't created
5. **Wrong instruction ordering** - File creation buried at step 5 or 6 instead of step 3
6. **Agent assumes limited access** - Some agents think they can't write files

---

## Immediate Fix

If files weren't created:

### Step 1: Verify Files Don't Exist

Check the expected location:

```bash
ls -la .clavix/outputs/[project-name]/
```

If directory or files missing, proceed with fix.

---

### Step 2: Request Explicit File Creation

Tell the agent:

```markdown
The files weren't created. Please create them now using these exact steps:

**Step 1: Create directory**
```bash
mkdir -p .clavix/outputs/[project-name]
```

**Step 2: Write mini-prd.md**
Use the Write tool to create `.clavix/outputs/[project-name]/mini-prd.md` with the content you showed me earlier.

**Step 3: Write original-prompt.md**
Use the Write tool to create `.clavix/outputs/[project-name]/original-prompt.md`

**Step 4: Write optimized-prompt.md**
Use the Write tool to create `.clavix/outputs/[project-name]/optimized-prompt.md`

**Step 5: Confirm files exist**
List the created files so I can verify.
```

---

### Step 3: Verify Creation

After agent claims files are created, verify:

```bash
ls -la .clavix/outputs/[project-name]/
cat .clavix/outputs/[project-name]/mini-prd.md
```

Files should exist and contain the expected content.

---

## Prevention Strategies

### For Template Authors

**1. Use Proven File Creation Pattern**

Copy the explicit pattern from `fast.md` or `.clavix/instructions/core/file-operations.md`:

```markdown
**CREATE OUTPUT FILES (REQUIRED)**

You MUST create [N] files. This is not optional.

**Step 1: Create directory structure**
```bash
mkdir -p .clavix/outputs/[project-name]
```

**Step 2: Write [filename]**
Use the Write tool to create `.clavix/outputs/[project-name]/[filename]`

Content:
[Template or exact content]

**Step 3: Write [another-filename]**
Use the Write tool to create `.clavix/outputs/[project-name]/[another-filename]`

**Step N: Verify files exist**
List created files:
```
✓ .clavix/outputs/[project-name]/file1.md
✓ .clavix/outputs/[project-name]/file2.md
```

**CHECKPOINT:** All files created successfully
```

**2. Use Imperative Language**

✓ "You MUST create files"
✓ "Use the Write tool to..."
✓ "This is REQUIRED"
✓ "Create [specific file] now"

✗ "Suggest saving to..."
✗ "If filesystem access available..."
✗ "You could save..."
✗ "Consider creating..."

---

**3. Name the Tool Explicitly**

✓ "Use the Write tool to create..."
✓ "Call the Write tool with..."

✗ "Save to..." (vague - how?)
✗ "Create..." (vague - with what tool?)
✗ "Output to..." (unclear method)

---

**4. Add Verification Step**

Always include a step to verify files exist:

```markdown
**Step N: Verify File Creation**

List the created files to confirm they exist:
```
✓ file1.md
✓ file2.md
✓ file3.md
```

If any file is missing, something went wrong. Review and retry file creation steps.
```

---

**5. Correct Step Ordering**

File creation should be step 3 or 4, NOT step 5 or 6.

**Good order:**
1. Validate requirements
2. Extract/analyze
3. **CREATE FILES** ← Early in process
4. Apply optimizations
5. Highlight insights
6. Present summary

**Bad order:**
1. Validate requirements
2. Extract/analyze
3. Apply optimizations
4. Highlight insights
5. **Suggest saving** ← Too late, often skipped
6. Present summary

---

**6. Make File Creation Non-Optional**

Remove any language that makes it optional:

✗ "If filesystem access available..."
✗ "Try to save..."
✗ "Optionally create..."
✗ "You can save..."

✓ "You MUST create..."
✓ "This step is REQUIRED"
✓ "Create these files (not optional)"

---

### For Platform-Specific Adaptations

Some platforms have limited file access. Add fallback:

```markdown
**Step 2: Write file (with fallback)**

**Primary:** Use the Write tool to create `.clavix/outputs/[project]/file.md`

**Fallback (if Write tool unavailable):**
If file creation fails, display content and instruct user:

⚠️ File creation unavailable. Please save this manually:

**Path:** `.clavix/outputs/[project]/file.md`

**Content:**
```
[Content here]
```

Copy the content above and save to the specified path.
```

---

## Testing for This Issue

### Test Scenario 1: Summarization Workflow

**Setup:**
```markdown
User: /clavix:start
[Conversation happens]
User: /clavix:summarize
```

**Expected behavior:**
- Agent creates .clavix/outputs/[project]/ directory
- Agent writes mini-prd.md
- Agent writes original-prompt.md
- Agent writes optimized-prompt.md
- Agent lists files to verify
- **CHECKPOINT:** All files created successfully

**Test:**
```bash
ls -la .clavix/outputs/[project]/
```

Should show all three files.

**Failure indicator:**
- Directory doesn't exist
- Files missing
- Agent showed content in chat but didn't write files

---

### Test Scenario 2: Prompt Improvement

**Setup:**
```markdown
User: /clavix:improve [prompt]
```

**Expected behavior:**
- Agent analyzes prompt with triage
- Agent generates optimized version
- Agent creates .clavix/outputs/prompts/ directory
- Agent writes prompt file with timestamp ID
- Agent verifies file created

**Test:**
```bash
ls -la .clavix/outputs/prompts/
```

Should show saved prompt file.

---

## Common Patterns That Fail

### ❌ Pattern 1: Vague Suggestion

```markdown
5. Suggest saving to `.clavix/outputs/[project]/`
```

**Why it fails:** "Suggest" is passive, no Write tool instruction, no steps.

---

### ❌ Pattern 2: Optional Language

```markdown
4. Save to `.clavix/outputs/` if filesystem access available
```

**Why it fails:** "If available" makes it optional. Agent skips if uncertain.

---

### ❌ Pattern 3: No Tool Specified

```markdown
3. Save the following files:
   - mini-prd.md
   - optimized-prompt.md
```

**Why it fails:** Doesn't say HOW to save. No Write tool instruction.

---

### ❌ Pattern 4: No Verification

```markdown
3. Use Write tool to create files in .clavix/outputs/
4. Display summary
```

**Why it fails:** No verification step. Can't detect if files weren't created.

---

## Working Patterns

### ✅ Pattern: Explicit Numbered Steps

```markdown
**CREATE FILES (REQUIRED)**

**Step 1:** Create directory
```bash
mkdir -p .clavix/outputs/project
```

**Step 2:** Use Write tool to create file1.md
**Step 3:** Use Write tool to create file2.md
**Step 4:** Verify all files exist
**CHECKPOINT:** Files created successfully
```

**Why it works:** Imperative, explicit tool, verification, checkpoint.

---

## Quick Diagnosis

**Agent says files created but they don't exist?**

Check template for:
- ✗ "Suggest saving" language?
- ✗ "If available" conditional?
- ✗ No Write tool instruction?
- ✗ No verification step?
- ✗ File creation at step 5+?

**Fix:** Replace with proven pattern from `.clavix/instructions/core/file-operations.md`

---

## Success Indicators

File creation is working when:
- ✓ Files physically exist in .clavix/outputs/
- ✓ Files contain expected content structure
- ✓ Agent displays verification message with file paths
- ✓ Checkpoint marker confirms file creation
- ✓ User can open and read the files

---

## See Also

- `.clavix/instructions/core/file-operations.md` - Complete file creation patterns
- `.clavix/instructions/workflows/summarize.md` - Corrected summarization with file creation
- `.clavix/instructions/core/verification.md` - Verification patterns
