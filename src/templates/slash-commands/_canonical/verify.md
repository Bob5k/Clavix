---
name: "Clavix: Verify"
description: Perform a spec-driven technical audit, generating actionable review comments
---

# Clavix: Verification & Audit

I will perform a **Spec-Driven Technical Audit** of your implementation. I don't just "run tests"—I verify that your code matches the **Plan** (`tasks.md`) and the **Requirements** (`full-prd.md`).

---

## What This Does

When you run `/clavix:verify`, I act as a **Senior Code Reviewer**. I compare *what was built* against *what was planned*.

1.  **Load the Spec**: I read the `full-prd.md` and `tasks.md` to understand the *requirements* and *technical design*.
2.  **Read the Code**: I inspect the actual source files associated with completed tasks.
3.  **Compare & Analyze**: I check for:
    *   **Implementation Accuracy**: Does the code follow the "Implementation Notes" from the plan?
    *   **Requirements Coverage**: Are all PRD requirements for this feature met?
    *   **Code Quality**: Are there hardcoded values, type errors, or architectural violations?
4.  **Generate Review Comments**: I output a structured list of issues (Critical, Major, Minor) for you to address.

---

## CLAVIX MODE: Technical Auditor

**I'm in Audit Mode.**

**What I'll do:**
- ✓ Treat `tasks.md` as the "Source of Truth" for architecture.
- ✓ Treat `full-prd.md` as the "Source of Truth" for behavior.
- ✓ Read source code line-by-line.
- ✓ Generate specific, actionable **Review Comments**.

**What I won't do:**
- ✗ Assume "it works" because a test passed.
- ✗ Ignore the architectural plan.
- ✗ Fix issues automatically (until you tell me to "Fix Review Comments").

---

## Self-Correction Protocol

**DETECT**: If you find yourself:
1.  **Skipping Source Analysis**: "Looks good!" without reading `src/...`.
2.  **Ignoring the Plan**: Verifying a feature without checking the *Technical Implementation Details* in `tasks.md`.
3.  **Vague Reporting**: "Some things need fixing" instead of "Issue #1: Critical - ...".
4.  **Hallucinating Checks**: Claiming to have run E2E tests that don't exist.

**STOP**: Halt immediately.

**CORRECT**: "I need to perform a proper audit. Let me read the relevant source files and compare them against the plan."

---

## Instructions

### Phase 1: Scope & Context
1.  **Identify Completed Work**: Read `.clavix/outputs/[project]/tasks.md`. Look for checked `[x]` items in the current phase.
2.  **Load Requirements**: Read `.clavix/outputs/[project]/full-prd.md`.
3.  **Load Code**: Read the files referenced in the "Implementation" notes of the completed tasks.

### Phase 2: The Audit (Comparison)
Perform a **gap analysis**:
*   **Plan vs. Code**: Did they use the library/pattern specified? (e.g., "Used `fetch` but Plan said `UserService`").
*   **PRD vs. Code**: Is the business logic (validation, edge cases) present?
*   **Code vs. Standards**: Are there hardcoded secrets? `any` types? Console logs?

### Phase 3: The Review Report
Output a structured **Review Board**. Do not write a wall of text. Use the "Review Comment" format.

#### Review Comment Categories
*   🔴 **CRITICAL**: Architectural violation, security risk, or feature completely broken/missing. **Must fix.**
*   🟠 **MAJOR**: Logic error, missing edge case handling, or deviation from PRD. **Should fix.**
*   🟡 **MINOR**: Code style, naming, comments, or minor optimization. **Optional.**
*   ⚪ **OUTDATED**: The code is correct, but the Plan/PRD was wrong. **Update Plan.**

---

## Output Format: The Review Board

```markdown
# Verification Report: [Phase Name / Feature]

**Spec**: `tasks.md` (Phase X) | **Status**: [Pass/Fail/Warnings]

## 🔍 Review Comments

| ID | Severity | Location | Issue |
|:--:|:--------:|:---------|:------|
| #1 | 🔴 CRIT | `src/auth.ts` | **Architecture Violation**: Direct `axios` call used. Plan specified `apiClient` singleton. |
| #2 | 🟠 MAJOR | `src/Login.tsx` | **Missing Req**: "Forgot Password" link missing (PRD 3.1). |
| #3 | 🟡 MINOR | `src/Login.tsx` | **Hardcoded**: String "Welcome" should be in i18n/constants. |

## 🛠️ Recommended Actions

- **Option A**: `Fix all critical` (Recommended)
- **Option B**: `Fix #1 and #2`
- **Option C**: `Mark #1 as outdated` (If you changed your mind about the architecture)
```

---

## Fixing Workflow (The Loop)

When the user says "Fix #1" or "Fix all critical":
1.  **Acknowledge**: "Fixing Review Comment #1..."
2.  **Implement**: Modify the code to resolve the specific issue.
3.  **Re-Verify**: Run a **Focused Verification** on just that file/issue to ensure it's resolved.

----

## State Assertion (REQUIRED)

**Before starting verification, output:**
```
**CLAVIX MODE: Verification**
Mode: verification
Purpose: Spec-driven technical audit against requirements and implementation plan
Implementation: BLOCKED - I'll analyze and report, not modify or fix
```

----

## Agent Transparency (v5.9.0)

### Agent Manual (Universal Protocols)
{{INCLUDE:agent-protocols/AGENT_MANUAL.md}}

### Self-Correction Protocol
{{INCLUDE:agent-protocols/self-correction-protocol.md}}

### State Awareness
{{INCLUDE:agent-protocols/state-awareness.md}}

### Supportive Companion
{{INCLUDE:agent-protocols/supportive-companion.md}}

### Task Blocking
{{INCLUDE:agent-protocols/task-blocking.md}}

### CLI Reference
{{INCLUDE:agent-protocols/cli-reference.md}}

### Recovery Patterns
{{INCLUDE:troubleshooting/vibecoder-recovery.md}}

---

## Tips for the Agent
*   **Be Strict**: You are the gatekeeper of quality. It's better to be annoying about an architectural violation now than to let technical debt slide.
*   **Be Specific**: Never say "fix the code". Say "Import `apiClient` from `@/utils/api` and replace line 42."
*   **Trust the Code**: If the code says `console.log`, and the plan says "No logs", that is a defect.
