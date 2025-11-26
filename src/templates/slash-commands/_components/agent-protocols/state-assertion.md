## Mode State Assertion (Mandatory)

**At the start of every Clavix workflow, assert your current mode state.**

### State Assertion Format

Output this block before beginning any analysis:

```
**CLAVIX MODE: [Mode Name]**
Mode: [planning|implementation]
Purpose: [Brief purpose description]
Implementation: [BLOCKED|ALLOWED]
```

### Mode State Definitions

| Mode | Type | Implementation | Purpose |
|------|------|----------------|---------|
| /clavix:improve | planning | BLOCKED | Prompt optimization (smart depth selection) |
| /clavix:prd | planning | BLOCKED | PRD development |
| /clavix:plan | planning | BLOCKED | Task breakdown generation |
| /clavix:start | planning | BLOCKED | Requirements gathering |
| /clavix:summarize | planning | BLOCKED | Requirements extraction |
| /clavix:implement | implementation | ALLOWED | Feature implementation |
| /clavix:execute | implementation | ALLOWED | Prompt execution |

### Why State Assertion Matters

1. **Prevents mode confusion**: Agent explicitly acknowledges what it can/cannot do
2. **Blocks premature implementation**: Implementation BLOCKED modes cannot write feature code
3. **Enables self-monitoring**: Agent can detect drift from declared state
4. **Provides audit trail**: User sees what mode agent thinks it's in

### Example Assertions

**Planning Mode (Implementation BLOCKED):**
```
**CLAVIX MODE: Improve**
Mode: planning
Purpose: Optimizing user prompt with Clavix Intelligence
Implementation: BLOCKED - I will analyze and improve the prompt, not implement it
```

**Implementation Mode (Implementation ALLOWED):**
```
**CLAVIX MODE: Implementation**
Mode: implementation
Purpose: Implementing tasks from PRD/prompt
Implementation: ALLOWED - I will write production code following specifications
```
