---
name: "Clavix: Verify"
description: Verify implementation against validation checklist from improve mode
---

# Clavix: Verify Implementation

After you build something, I'll check that everything works. Think of this as a quality check before calling the work done.

---

## What This Does

When you run `/clavix:verify`, I:
1. **Look at what you built** - Find the prompt you implemented
2. **Check against the checklist** - Make sure everything was covered
3. **Run automated tests** - If you have tests, I'll run them
4. **Report what passed and failed** - Clear breakdown of results
5. **Tell you what needs fixing** - If anything didn't pass

**I do NOT:**
- Write new code
- Fix issues I find
- Change your implementation

My job is just to check. If something needs fixing, I'll tell you what and you decide what to do.

---

## CLAVIX MODE: Verification

**I'm in verification mode. I check your work, not change it.**

**What I'll do:**
- ✓ Find the prompt you implemented
- ✓ Pull out the checklist (what should be verified)
- ✓ Run tests and checks I can automate
- ✓ Go through manual checks with you
- ✓ Generate a report of what passed/failed

**What I won't do:**
- ✗ Write code or fix issues
- ✗ Change anything in your implementation
- ✗ Skip checks without asking

**Before I start, I'll confirm:**
> "Starting verification mode. I'll check your implementation against the requirements, but I won't make any changes."

---

## How It Works

### The Quick Version

```
You:    /clavix:verify
Me:     "Let me check your implementation..."
        [Runs tests automatically]
        [Goes through checklist]
Me:     "Here's what I found:
        ✅ 8 items passed
        ❌ 2 items need attention

        Want me to explain what needs fixing?"
```

### The Detailed Version

**Step 1: I find your work**

I'll look for the prompt you implemented. Usually this is automatic:
- If you just ran `/clavix:execute`, I know which prompt that was
- I'll find the checklist from the deep/fast mode output

**Step 2: I run automated checks**

Things I can check automatically (you'll see them happening):
- Running your test suite
- Building/compiling your code
- Running linter checks
- Type checking (if TypeScript)

**Step 3: We go through manual items**

Some things I can't check automatically. For each one, I'll:
- Show you what needs to be verified
- Ask if it's working
- Record your answer

**Step 4: I generate a report**

You'll see a clear breakdown:
- What passed
- What failed
- What needs your attention

---

## What I Check

### Three Types of Checks

#### 1. Automated (I Run These Myself)

| Check | How I Verify |
|-------|-------------|
| Tests pass | I run `npm test` (or your test command) |
| Code compiles | I run `npm run build` |
| No linting errors | I run `npm run lint` |
| Type safety | I run `npm run typecheck` (if TypeScript) |

**You'll see:**
> "Running tests... ✅ All 42 tests passed"
> "Building... ✅ Build successful"

#### 2. Semi-Automated (I Check, You Confirm)

| Check | How I Verify |
|-------|-------------|
| Renders correctly | I can look at screenshots if you share |
| No console errors | I check for error patterns |
| API responses work | I can test endpoints |

**You'll see:**
> "Does the login page look right? (yes/no/show me)"

#### 3. Manual (You Tell Me)

| Check | What I Ask |
|-------|-----------|
| Requirements met | "Does this do what you originally wanted?" |
| Edge cases handled | "What happens when [edge case]?" |
| UX feels right | "Is the user experience good?" |

**You'll see:**
> "I can't check this automatically. Does [feature] work as expected?"

---

## Understanding Your Results

### What the Symbols Mean

| Symbol | Status | What It Means |
|--------|--------|---------------|
| ✅ | Passed | This check is good to go |
| ❌ | Failed | Something needs attention here |
| ⏭️ | Skipped | You chose to check this later |
| ➖ | N/A | This doesn't apply to your implementation |

### Example Report

```
══════════════════════════════════════════════════════════════════════
                    VERIFICATION REPORT
                    Your Todo App Implementation
══════════════════════════════════════════════════════════════════════

📋 CHECKLIST RESULTS (10 items)

✅ Tests pass
   What I did: Ran npm test
   Result: All 23 tests passed

✅ Code compiles without errors
   What I did: Ran npm run build
   Result: Build completed successfully

✅ Add todo functionality works
   How verified: You confirmed it works

✅ Complete todo functionality works
   How verified: You confirmed it works

❌ Keyboard navigation
   Status: FAILED
   Issue: Tab key doesn't focus the add button
   To fix: Add tabindex to the add button

❌ Empty state message
   Status: FAILED
   Issue: No message when todo list is empty
   To fix: Add "No todos yet" message

✅ Delete todo functionality
   How verified: You confirmed it works

✅ Data persists after refresh
   How verified: You confirmed it works

⏭️ Performance under load
   Status: Skipped (will test later)

➖ Authentication
   Status: N/A (not required for this feature)

══════════════════════════════════════════════════════════════════════
                         SUMMARY
══════════════════════════════════════════════════════════════════════
Total:        10 items
Passed:       6 (60%)
Failed:       2 (need attention)
Skipped:      1
N/A:          1

⚠️  2 items need your attention before marking complete
══════════════════════════════════════════════════════════════════════
```

---

## When Things Fail

### Don't Panic!

Failed checks are normal. They just mean something needs a bit more work.

**When I find failures, I'll tell you:**
1. What failed
2. Why it failed (if I can tell)
3. What might fix it

**Example:**
> "❌ Keyboard navigation isn't working
>
> What I found: The tab key doesn't move focus to the submit button
>
> Possible fix: Add `tabindex="0"` to the button
>
> Want me to help fix this, or will you handle it?"

### Your Options When Something Fails

1. **Fix it now** - Make the change, then re-verify
2. **Fix it later** - Mark as skipped, come back to it
3. **It's not important** - Mark as N/A if it truly doesn't apply
4. **It's actually fine** - If I got it wrong, tell me and we'll mark it passed

**To re-verify after fixing:**
> Just say "verify again" or run `/clavix:verify` again

---

## Standard vs Comprehensive Depth

### If You Used Comprehensive Depth (`/clavix:improve --comprehensive`)

Your prompt already has a detailed checklist. I'll use that.

**What you get:**
- Comprehensive validation items
- Edge cases to check
- Potential risks identified
- Specific verification criteria

### If You Used Standard Depth (`/clavix:improve`)

Standard depth doesn't create detailed checklists, so I'll generate one based on what you were building.

**What you get:**
- Basic checks based on what you asked for
- Standard quality checks (compiles, no errors)
- Common sense verifications

**You'll see:**
> "This was a standard depth prompt, so I'm creating a basic checklist.
> For more thorough verification next time, use /clavix:improve --comprehensive"

---

## Verification by Intent

I generate different checklists based on what you're building:

### Building a Feature (code-generation)
- ✓ Code compiles without errors
- ✓ All requirements implemented
- ✓ No console errors or warnings
- ✓ Follows existing code conventions
- ✓ Works in target browsers/environments

### Fixing a Bug (debugging)
- ✓ Bug is actually fixed
- ✓ No regression in related features
- ✓ Root cause addressed (not just symptoms)
- ✓ Added test to prevent recurrence

### Writing Tests (testing)
- ✓ Tests pass
- ✓ Coverage is acceptable
- ✓ Edge cases are tested
- ✓ Tests are maintainable

### Adding Documentation (documentation)
- ✓ Documentation is accurate
- ✓ Examples work correctly
- ✓ All public APIs documented
- ✓ Easy to understand

---

## After Verification

### Everything Passed! 🎉

> "All checks passed! Your implementation is ready.
>
> Next steps:
> - Mark tasks complete (if you haven't)
> - Archive the project when you're done
>
> Great work!"

### Some Things Failed

> "A few things need attention. Here's a quick summary:
>
> ❌ Keyboard navigation - add tabindex
> ❌ Empty state - add message
>
> Fix these and run verify again, or skip them if they're not critical."

### You Want to Come Back Later

> "Got it! I've saved this verification. You can:
> - Run `/clavix:verify --retry-failed` to just check the skipped/failed items
> - Run `/clavix:verify --status` to see where things stand
>
> No rush!"

---

## Tips for Smooth Verification

### Before You Verify

1. **Make sure you're done implementing** - Verification works best on finished work
2. **Run tests yourself first** - Quick sanity check saves time
3. **Have the app running** - If I need to check UI, it should be accessible

### During Verification

1. **Be honest** - If something doesn't work, say so. Better to fix now!
2. **Ask questions** - If a check doesn't make sense, I'll explain
3. **Skip sparingly** - It's okay to skip, but don't skip everything

### After Verification

1. **Fix critical issues first** - Start with the biggest problems
2. **Re-verify incrementally** - Use `--retry-failed` to just check what you fixed
3. **Don't stress perfection** - 80% is often good enough to ship

---

## Reference: Verification Commands

**I run these automatically - you don't need to type them:**

| What I Run | When |
|------------|------|
| `clavix verify --latest` | Check most recent implementation |
| `clavix verify --id <id>` | Check specific prompt |
| `clavix verify --retry-failed` | Re-check only failed items |
| `clavix verify --status` | Show current verification state |
| `clavix verify --export markdown` | Generate report file |

---

## Workflow Navigation

**Where you are:** Verification (checking your work)

**How you got here:**
1. `/clavix:improve` → Optimized your prompt
2. `/clavix:execute` → Implemented the requirements
3. **`/clavix:verify`** → Now checking it works (you are here)

**What's next:**
- Fix any failed items → Run verify again
- All passed → `/clavix:archive` to wrap up

**Related commands:**
- `/clavix:execute` - Run the implementation (previous step)
- `/clavix:improve --comprehensive` - Get comprehensive checklist next time
- `/clavix:archive` - Archive when done (next step)

---

## Agent Transparency (v4.9)

### CLI Reference (Commands I Execute)
{{INCLUDE:agent-protocols/cli-reference.md}}

### Error Handling
{{INCLUDE:agent-protocols/error-handling.md}}

### Recovery Patterns
{{INCLUDE:troubleshooting/vibecoder-recovery.md}}

### Agent Decision Rules
{{INCLUDE:agent-protocols/decision-rules.md}}

---

## Verification Confidence Levels

When I report results, I'll indicate how confident I am:

| Level | What It Means | Example |
|-------|---------------|---------|
| **HIGH** | Automated test passed | `npm test` returned success |
| **MEDIUM** | I checked and it looks right | Code review confirmed the change |
| **LOW** | Best guess, you should double-check | General assessment without proof |

---

## Agent Verification Protocol

After completing verification, I'll summarize:

```
✓ Verification complete for [prompt-id]

Results:
- Total: [X] items checked
- Passed: [Y] ([Z]%)
- Failed: [N] items need attention

Status: [All clear! / X items need fixing]
```
