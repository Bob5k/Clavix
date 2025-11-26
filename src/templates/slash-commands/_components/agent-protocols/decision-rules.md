## Agent Decision Rules

These rules define deterministic agent behavior. Follow exactly - no interpretation needed.

### Rule 1: Quality-Based Mode Decision

```
IF quality < 60%:
  IF (completeness < 50%) OR (clarity < 50%) OR (actionability < 50%):
    → ACTION: Strongly recommend comprehensive depth
    → SAY: "Quality is [X]%. Comprehensive depth strongly recommended for: [low dimensions]"
  ELSE:
    → ACTION: Suggest comprehensive depth
    → SAY: "Quality is [X]%. Consider comprehensive depth for better results."

IF quality >= 60% AND quality < 80%:
  → ACTION: Proceed with optimization
  → SHOW: Improvement suggestions

IF quality >= 80%:
  → ACTION: Prompt is ready
  → SAY: "Prompt quality is good ([X]%). Ready to execute."
```

### Rule 2: Intent Confidence Decision

```
IF confidence >= 85%:
  → ACTION: Proceed with detected intent
  → NO secondary intent shown

IF confidence 70-84%:
  → ACTION: Proceed, note secondary if >25%
  → SHOW: "Primary: [intent] ([X]%). Also detected: [secondary] ([Y]%)"

IF confidence 50-69%:
  → ACTION: Ask user to confirm
  → ASK: "Detected [intent] with [X]% confidence. Is this correct?"

IF confidence < 50%:
  → ACTION: Cannot proceed autonomously
  → ASK: "I'm unclear on intent. Is this: [option A] | [option B] | [option C]?"
```

### Rule 3: Escalation Decision

```
IF escalation_score >= 75:
  → ACTION: Strongly recommend comprehensive depth
  → SHOW: Top 3 contributing factors

IF escalation_score 60-74:
  → ACTION: Recommend comprehensive depth
  → SHOW: Primary contributing factor

IF escalation_score 45-59:
  → ACTION: Suggest comprehensive depth as option
  → SAY: "Comprehensive depth available for more thorough analysis"

IF escalation_score < 45:
  → ACTION: Standard depth sufficient
  → NO escalation mention
```

### Rule 4: Task Completion (Implementation Mode)

```
AFTER implementing task:
  → RUN: clavix task-complete {task-id}
  → NEVER manually edit tasks.md checkboxes

IF task-complete succeeds:
  → SHOW: Next task automatically
  → CONTINUE with next task

IF task-complete fails:
  → SHOW error to user
  → ASK: "Task completion failed: [error]. How to proceed?"
```

### Rule 5: Workflow State Check

```
BEFORE starting /clavix:implement:
  → CHECK: .clavix-implement-config.json exists?

  IF exists AND stats.remaining > 0:
    → SAY: "Resuming implementation. Progress: [X]/[Y] tasks."
    → CONTINUE from currentTask

  IF exists AND stats.remaining == 0:
    → SAY: "All tasks complete. Consider /clavix:archive"

  IF not exists:
    → RUN: clavix implement (to initialize)
```

### Rule 6: File Operations

```
BEFORE writing files:
  → CHECK: Target directory exists
  → IF not exists: Create directory first

AFTER writing files:
  → VERIFY: File was created successfully
  → IF failed: Report error, suggest manual action
```

### Rule 7: Pattern Application Decision

```
WHEN applying patterns:
  → ALWAYS show which patterns were applied
  → LIST each pattern with its effect

IF pattern not applicable to intent:
  → SKIP silently (no output)

IF pattern applicable but skipped:
  → EXPLAIN: "Skipped [pattern] because [reason]"

COMPREHENSIVE DEPTH ONLY:
  → MUST include alternatives (2-3)
  → MUST include validation checklist
  → MUST include edge cases
```

### Rule 8: Mode Transition Decision

```
IF user requests standard depth but quality < 50%:
  → ACTION: Warn and suggest comprehensive
  → SAY: "Quality is [X]%. Standard depth may be insufficient."
  → ALLOW: User can override and proceed

IF user requests comprehensive depth but prompt is simple (quality > 85%):
  → ACTION: Note efficiency
  → SAY: "Prompt is already high quality. Standard depth would suffice."
  → CONTINUE: With comprehensive analysis anyway

IF strategic keywords detected (3+ architecture/security/scalability):
  → ACTION: Suggest PRD mode
  → SAY: "Detected strategic scope. Consider /clavix:prd for comprehensive planning."
```

### Rule 9: Output Validation Decision

```
BEFORE presenting optimized prompt:
  → VERIFY: All 6 quality dimensions scored
  → VERIFY: Intent detected with confidence shown
  → VERIFY: Patterns applied are listed

IF any verification fails:
  → HALT: Do not present incomplete output
  → ACTION: Complete missing analysis first

AFTER optimization complete:
  → MUST save prompt to .clavix/outputs/prompts/
  → MUST update index file
  → SHOW: "✓ Prompt saved: [filename]"
```

### Rule 10: Error Recovery Decision

```
IF pattern application fails:
  → LOG: Which pattern failed
  → CONTINUE: With remaining patterns
  → REPORT: "Pattern [X] skipped due to error"

IF file write fails:
  → RETRY: Once with alternative path
  → IF still fails: Report error with manual steps

IF CLI command fails:
  → SHOW: Command output and error
  → SUGGEST: Alternative action
  → NEVER: Silently ignore failures

IF user prompt is empty/invalid:
  → ASK: For valid input
  → NEVER: Proceed with assumption
```

### Rule 11: Execution Verification (v4.6)

```
BEFORE completing response:
  → INCLUDE verification block at end
  → VERIFY all checkpoints met for current mode

  IF any checkpoint failed:
    → REPORT which checkpoint failed
    → EXPLAIN why it failed
    → SUGGEST recovery action

  IF all checkpoints passed:
    → SHOW verification block with all items checked
```

**Verification Block Template:**
```
## Clavix Execution Verification
- [x] Intent detected: {type} ({confidence}%)
- [x] Quality assessed: {overall}%
- [x] {N} patterns applied
- [x] Prompt saved: {filename}
- [x] Mode: {fast|deep|prd|plan}
```

---

### Rule Summary Table

| Condition | Action | User Communication |
|-----------|--------|-------------------|
| quality < 60% + critical dim < 50% | Recommend deep | "[X]%. Deep mode recommended" |
| quality 60-79% | Proceed | Show improvements |
| quality >= 80% | Ready | "[X]%. Ready to execute" |
| confidence >= 85% | Proceed | Primary intent only |
| confidence 70-84% | Proceed | Show secondary if >25% |
| confidence 50-69% | Confirm | Ask user to verify |
| confidence < 50% | Cannot proceed | Ask for clarification |
| escalation >= 75 | Strong recommend | Show top 3 factors |
| escalation 45-74 | Suggest | Show primary factor |
| escalation < 45 | No action | Silent |
| fast requested + quality < 50% | Warn | "Quality low, consider deep" |
| 3+ strategic keywords | Suggest PRD | "Strategic scope detected" |
| pattern fails | Skip + report | "Pattern [X] skipped" |
| file write fails | Retry then report | "Error: [details]" |
| response complete | Include verification | Show checkpoint status |
