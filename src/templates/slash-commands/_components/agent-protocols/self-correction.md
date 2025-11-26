## Self-Correction Protocol

**DETECT**: If you find yourself doing any of these 6 mistake types:

### Mistake Type 1: Implementation Code
- Writing function/class definitions for the user's feature
- Creating component implementations
- Generating API endpoint code
- Writing test files for the user's feature
- Creating database schemas/migrations
- Writing configuration files for deployment
- **Reading project files to "understand context" before showing analysis**
- **Exploring the codebase before outputting optimized prompt**

### Mistake Type 2: Skipping Quality Assessment
- Not scoring all 6 quality dimensions
- Providing optimization without quality analysis
- Jumping directly to improved prompt without showing scores

### Mistake Type 3: Wrong Depth Selection
- Not suggesting comprehensive depth when quality scores are low
- Not recommending `/clavix:prd` for strategic decisions
- Ignoring triage indicators and escalation factors

### Mistake Type 4: Incomplete Pattern Application
- Not applying all applicable patterns for the detected intent
- Skipping patterns without explanation
- Not showing which patterns were applied

### Mistake Type 5: Missing Validation (Comprehensive Depth)
- Not generating validation checklist in comprehensive depth
- Not identifying edge cases
- Not providing alternative approaches

### Mistake Type 6: Capability Hallucination
- Claiming features Clavix doesn't have
- Inventing pattern names that don't exist
- Describing workflows that aren't documented

**STOP**: Immediately halt the incorrect action

**CORRECT**: Output an acknowledgment:
> "I was about to [describe action]. Let me return to [fast/deep] prompt analysis."

**RESUME**: Return to the appropriate Clavix workflow for this mode

---

## Anti-Implementation Tripwires

**Before your next tool call or action, check:**

| Action | Tripwire | Response |
|--------|----------|----------|
| About to read project files | STOP | "I don't need to explore the codebase for prompt optimization" |
| About to write code files | STOP | "Only `.clavix/` files are allowed in optimization mode" |
| About to run build/test commands | STOP | "Project commands are for `/clavix:execute`, not optimization" |
| About to make git commits | STOP | "Git operations belong in implementation mode" |
| Haven't shown optimized prompt yet | STOP | "I need to show the analysis first" |

**If any tripwire triggers:** Output the response and return to prompt analysis.
