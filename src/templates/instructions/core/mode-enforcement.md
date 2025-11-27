# Clavix Mode Enforcement v5.1

This is the authoritative reference for mode enforcement in Clavix workflows. All templates MUST adhere to these patterns.

---

## Mode Declaration Patterns

### Planning Mode Declaration

Used in: `improve.md`, `prd.md`, `start.md`, `summarize.md`, `plan.md`

```markdown
## CLAVIX MODE: [Specific Planning Type]

**You are in Clavix [workflow type] mode. You help [action], NOT implement features.**

**YOUR ROLE:**
- ✓ [Specific allowed action 1]
- ✓ [Specific allowed action 2]
- ✓ [Specific allowed action 3]

**DO NOT IMPLEMENT. DO NOT IMPLEMENT. DO NOT IMPLEMENT.**
- ✗ DO NOT write application code for the feature
- ✗ DO NOT implement what the prompt/PRD describes
- ✗ DO NOT generate actual components/functions

**You are [doing planning action], not building what it describes.**

For complete mode documentation, see: `.clavix/instructions/core/clavix-mode.md`
```

### Implementation Mode Declaration

Used in: `implement.md`

```markdown
## CLAVIX MODE: Implementation

**You are in Clavix implementation mode. You ARE authorized to write code and implement features.**

**YOUR ROLE:**
- ✓ Read and understand requirements from [source]
- ✓ Write application code to implement features
- ✓ Create/modify files as needed
- ✓ Run tests to verify implementation

**IMPLEMENTATION AUTHORIZED:**
- ✓ Writing functions, classes, and components
- ✓ Creating new files and modifying existing ones
- ✓ Implementing features described in requirements
- ✓ Writing tests for implemented code

**MODE ENTRY VALIDATION:**
Before implementing, verify:
1. Source documents exist ([source type])
2. Output assertion: "Entering IMPLEMENTATION mode. I will implement [source]."

For complete mode documentation, see: `.clavix/instructions/core/clavix-mode.md`
```

---

## Mode Assertion Patterns

### Planning Mode Assertion

Output at workflow start:
```
Entering CLAVIX PLANNING MODE. I will [action] without implementing code.
```

### Implementation Mode Assertion

Output at workflow start:
```
Entering IMPLEMENTATION mode. I will implement [source description].
```

---

## Violation Indicators

### Planning Mode Violations

The AI is violating planning mode if it:

1. **Writes function definitions** for the user's actual feature
   ```typescript
   // VIOLATION: Creating actual implementation
   function authenticateUser(email: string, password: string) { ... }
   ```

2. **Creates component implementations** for the described feature
   ```jsx
   // VIOLATION: Building the actual component
   export function LoginForm() { ... }
   ```

3. **Generates API endpoint code** for the described feature
   ```typescript
   // VIOLATION: Implementing actual endpoints
   app.post('/api/login', (req, res) => { ... });
   ```

4. **Creates database models/schemas** for the described feature
   ```typescript
   // VIOLATION: Building actual data layer
   const UserSchema = new Schema({ email: String, ... });
   ```

### Implementation Mode Violations

The AI is violating implementation mode if it:

1. **Refuses to write code** when source documents exist
2. **Only provides documentation** when code implementation is expected
3. **Asks clarifying questions** instead of implementing from clear tasks

---

## Self-Correction Protocol

All planning templates MUST include this protocol:

```markdown
## Self-Correction Protocol

**DETECT**: If you find yourself:
- Writing function/class definitions for the user's feature
- Creating component implementations
- Generating API endpoint code

**STOP**: Immediately halt code generation

**CORRECT**: Output:
"I apologize - I was implementing instead of [planning action]. Let me return to [correct workflow action]."

**RESUME**: Return to the [workflow type] workflow.
```

---

## Transition Rules

### From Planning to Implementation

1. Planning workflow must complete first (files saved)
2. User must explicitly run implementation command
3. Do NOT switch modes based on verbal requests alone
4. Suggest correct command: "To implement, run `/clavix:implement`"

### From Implementation Back to Planning

1. Implementation can pause at any time
2. Running a planning command returns to planning mode
3. Any progress is preserved in tasks.md

---

## Checkpoint Patterns

### Standard Checkpoint Format

```
**CHECKPOINT [MODE]:** <description>
```

### Planning Mode Checkpoints

```
**CHECKPOINT [PLANNING]:** Intent analysis complete
**CHECKPOINT [PLANNING]:** Quality assessment done
**CHECKPOINT [PLANNING]:** Optimization applied
**CHECKPOINT [PLANNING]:** Ready to save
**CHECKPOINT [PLANNING]:** Files saved successfully
```

### Implementation Mode Checkpoints

```
**CHECKPOINT [IMPLEMENTATION]:** Task [ID] started
**CHECKPOINT [IMPLEMENTATION]:** Code written for [component]
**CHECKPOINT [IMPLEMENTATION]:** Tests passing
**CHECKPOINT [IMPLEMENTATION]:** Task [ID] completed
```

---

## Cross-Template Consistency Checklist

When updating templates, verify:

- [ ] Mode declaration block is present at top (after frontmatter)
- [ ] Mode declaration uses correct format (Planning vs Implementation)
- [ ] Self-correction protocol is included (planning templates only)
- [ ] Checkpoints use standardized format
- [ ] Transition protocols are documented
- [ ] Reference to clavix-mode.md is included
- [ ] DO NOT IMPLEMENT is emphasized 3x (planning templates)
- [ ] IMPLEMENTATION AUTHORIZED is emphasized (implementation templates)

---

## Template Categories

### Planning Templates (5 total)

| Template | Mode Type | Self-Correction | Primary Action |
|----------|-----------|-----------------|----------------|
| `improve.md` | Requirements & Planning | Required | Smart prompt optimization (auto-depth) |
| `prd.md` | Requirements & Planning | Required | PRD generation |
| `start.md` | Requirements & Planning | Required | Requirements gathering |
| `summarize.md` | Requirements & Planning | Required | Requirements extraction |
| `plan.md` | Pre-Implementation Planning | Required | Task breakdown |

### Implementation Templates (1 total)

| Template | Mode Type | Entry Validation | Primary Action |
|----------|-----------|------------------|----------------|
| `implement.md` | Implementation | Required | Task or prompt execution (auto-detects source) |

### Utility Templates (2 total)

| Template | Mode | Notes |
|----------|------|-------|
| `archive.md` | Management | Project archival |
| `verify.md` | Verification | Post-implementation verification |

---

## Version History

- **v5.1** (2025): Consolidated execute into implement with auto-detection, removed fast/deep in favor of unified improve
- **v4.0** (2024): Added self-correction protocol, standardized checkpoints, mode entry validation
- **v3.0** (2024): Initial mode separation between planning and implementation
