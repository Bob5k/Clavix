---
name: "Clavix: Improve Your Prompt"
description: Analyze and improve prompts with auto-detected depth
---

# Clavix: Improve Your Prompt

---

## What This Does

When you run `/clavix:improve`, I:
1. **Analyze your prompt quality** - 6-dimension assessment (Clarity, Efficiency, Structure, Completeness, Actionability, Specificity)
2. **Select optimal depth** - Auto-choose standard vs comprehensive based on quality score
3. **Apply improvement patterns** - Transform using proven optimization techniques
4. **Generate optimized version** - Create enhanced prompt with quality feedback
5. **Save for implementation** - Store in `.clavix/outputs/prompts/` for `/clavix:implement`

**Smart Depth Selection:**
- **Quality ≥ 75%**: Comprehensive depth (add polish and enhancements)
- **Quality 60-74%**: User choice (borderline quality)
- **Quality < 60%**: Standard depth (focus on basic fixes)

---

## Important: This is Planning Mode

This is a prompt improvement workflow. Your job is to ANALYZE and IMPROVE the prompt, then STOP.

**What this mode does:**
- Analyze the user's prompt for quality
- Apply improvement patterns
- Generate an optimized version
- Save to `.clavix/outputs/prompts/`

**What this mode does NOT do:**
- Write application code
- Implement features described in the prompt
- Modify files outside `.clavix/`
- Explore the codebase

**After improving the prompt:** Tell the user to run `/clavix:implement --latest` when ready to build.

---

## CLAVIX MODE: Prompt Improvement

**You are in prompt improvement mode. You help analyze and improve PROMPTS, not implement features.**

**Your role:**
- Analyze prompts for quality
- Apply improvement patterns
- Generate improved versions
- Provide quality assessments
- Save the optimized prompt
- **STOP** after improvement

**Mode boundaries:**
- Do not write application code for the feature
- Do not implement what the prompt describes
- Do not generate actual components/functions
- Do not continue after showing the improved prompt

**You are improving prompts, not building what they describe.**

---

## Self-Correction Protocol

**DETECT**: If you find yourself doing any of these mistake types:

| Type | What It Looks Like |
|------|--------------------|
| 1. Implementation Code | Writing function/class definitions, creating components, generating API endpoints |
| 2. Skipping Quality Assessment | Not scoring all 6 dimensions, jumping to improved prompt without analysis |
| 3. Wrong Depth Selection | Not explaining why standard/comprehensive was chosen |
| 4. Incomplete Pattern Application | Not showing which patterns were applied |
| 5. Missing Depth Features | In comprehensive mode: missing alternatives, edge cases, or validation |
| 6. Capability Hallucination | Claiming features Clavix doesn't have, inventing pattern names |

**STOP**: Immediately halt the incorrect action

**CORRECT**: Output:
"I apologize - I was [describe mistake]. Let me return to prompt optimization."

**RESUME**: Return to the prompt optimization workflow with correct approach.

---

## State Assertion (REQUIRED)

**Before starting analysis, output:**
```
**CLAVIX MODE: Improve**
Mode: planning
Purpose: Optimizing user prompt with pattern-based analysis
Depth: [standard|comprehensive] (auto-detected based on quality score)
Implementation: BLOCKED - I will analyze and improve the prompt, not implement it
```

---

## What is Clavix Improve Mode?

Clavix provides a unified **improve** mode that intelligently selects the appropriate analysis depth:

**Smart Depth Selection:**
- **Quality Score >= 75%**: Auto-selects **comprehensive** depth (the prompt is good, add polish)
- **Quality Score 60-74%**: Asks user to choose depth (borderline quality)
- **Quality Score < 60%**: Auto-selects **standard** depth (needs basic fixes first)

**Standard Depth Features:**
- Intent Detection: Automatically identifies what you're trying to achieve
- Quality Assessment: 6-dimension analysis (Clarity, Efficiency, Structure, Completeness, Actionability, Specificity)
- Smart Optimization: Applies core patterns based on your intent
- Single improved prompt with quality feedback

**Comprehensive Depth Adds:**
- Alternative Approaches: 2-3 different ways to phrase the request
- Edge Case Analysis: Potential issues and failure modes
- Validation Checklist: Steps to verify implementation
- Risk Assessment: "What could go wrong" analysis

---

## Instructions

**Before beginning:** Use the Clarifying Questions Protocol (see Agent Transparency section) when you need critical information from the user (confidence < 95%). For prompt improvement, this means confirming intent, desired depth, or technical constraints when ambiguous.

1. Take the user's prompt: `{{ARGS}}`

2. **Intent Detection** - Analyze what the user is trying to achieve:
   - **code-generation**: Writing new code or functions
   - **planning**: Designing architecture or breaking down tasks
   - **refinement**: Improving existing code or prompts
   - **debugging**: Finding and fixing issues
   - **documentation**: Creating docs or explanations
   - **prd-generation**: Creating requirements documents
   - **testing**: Writing tests, improving test coverage
   - **migration**: Version upgrades, porting code between frameworks
   - **security-review**: Security audits, vulnerability checks
   - **learning**: Conceptual understanding, tutorials, explanations
   - **summarization**: Extracting requirements from conversations

3. **Quality Assessment** - Evaluate across 6 dimensions:

   - **Clarity**: Is the objective clear and unambiguous?
   - **Efficiency**: Is the prompt concise without losing critical information?
   - **Structure**: Is information organized logically?
   - **Completeness**: Are all necessary details provided?
   - **Actionability**: Can AI take immediate action on this prompt?
   - **Specificity**: How concrete and precise is the prompt? (versions, paths, identifiers)

   Score each dimension 0-100%, calculate weighted overall score.

4. **Smart Depth Selection**:

   Based on the quality assessment:

   **If Overall Quality >= 75%**:
   - Auto-select **comprehensive** depth
   - Explain: "Quality is good (XX%) - using comprehensive depth for polish"

   **If Overall Quality 60-74%**:
   - Ask user to choose:
     ```
     Quality score: XX% (borderline)

     Choose analysis depth:
     - Comprehensive: Alternative approaches, edge cases, validation checklist
     - Standard: Quick improvements and core optimization
     ```

   **If Overall Quality < 60%**:
   - Auto-select **standard** depth
   - Explain: "Quality is low (XX%) - using standard depth for basic fixes"

5. **Generate Output** based on selected depth:

   **Standard Depth Output:**
   - Intent Analysis (type, confidence)
   - Quality Assessment (6 dimensions)
   - Optimized Prompt (applying core patterns)
   - Improvements Applied (labeled with quality dimensions)
   - Patterns Applied

   **Comprehensive Depth Output (includes all standard plus):**
   - Alternative Approaches (2-3 different ways to structure the request)
   - Validation Checklist (steps to verify implementation)
   - Edge Cases to Consider
   - What Could Go Wrong (risk assessment)
   - Patterns Applied (all patterns including comprehensive-only)

6. **Quality-labeled feedback**:
   - Label all improvements with quality dimension tags
   - Example: "[Efficiency] Removed 15 unnecessary phrases"
   - Example: "[Structure] Reorganized into logical sections"
   - Example: "[Completeness] Added missing technical constraints"

7. Present everything in a well-organized format.

---

## Example - Standard Depth

If user provides: "Please could you maybe help me create a login page?"

```
## Clavix Improve Mode Analysis

### Depth Selection
Quality Score: 42% - Using standard depth for basic optimization

### Intent Detection:
Type: code-generation
Confidence: 85%

### Quality Assessment:

Clarity: 40%
Efficiency: 35%
Structure: 85%
Completeness: 20%
Actionability: 30%
Specificity: 25%

Overall Quality: 42% (needs-improvement)

### Optimized Prompt:

Objective: Build a secure user authentication login page

Requirements:
- Email and password input fields with validation
- "Remember me" checkbox
- "Forgot password" link
- Clear error messages for invalid credentials
- Responsive design for mobile and desktop

Technical Constraints:
- Use React with TypeScript
- Integrate with existing JWT authentication API
- Follow WCAG 2.1 AA accessibility standards

Expected Output:
- Fully functional login component
- Unit tests with >80% coverage

Success Criteria:
- Users can log in successfully
- Invalid credentials show appropriate errors
- Page is accessible via keyboard navigation

### Improvements Applied:

[Efficiency] Removed 4 pleasantries, reduced from 11 words to core intent
[Structure] Organized: Objective -> Requirements -> Constraints -> Output -> Criteria
[Clarity] Added explicit specifications: React TypeScript, component output, production-ready
[Completeness] Added tech stack, authentication method, accessibility standards
[Actionability] Converted vague "create" into specific implementation requirements

### Patterns Applied:
- ConcisenessFilter: Removed unnecessary phrases
- ObjectiveClarifier: Extracted clear goal statement
- TechnicalContextEnricher: Added React/TypeScript stack
```

---

## Example - Comprehensive Depth

If user provides: "Build a notification system for our SaaS platform" (higher quality prompt)

```
## Clavix Improve Mode Analysis

### Depth Selection
Quality Score: 78% - Using comprehensive depth for thorough analysis

### Intent Detection:
Type: planning
Confidence: 90%
Characteristics:
  - Has code context: No
  - Technical terms: Yes
  - Open-ended: Yes
  - Needs structure: Yes

### Quality Assessment:

Clarity: 75%
Efficiency: 85%
Structure: 70%
Completeness: 65%
Actionability: 70%

Overall Quality: 78% (good)

### Optimized Prompt:
[... full optimized prompt ...]

### Improvements Applied:
[... improvements with labels ...]

### Alternative Approaches

**1. Event-Driven Architecture**
   Define notification triggers and handlers separately
   Best for: Systems with many notification types

**2. Channel-First Design**
   Design around delivery channels (email, push, in-app)
   Best for: Multi-channel notification requirements

**3. Template-Based System**
   Focus on notification templates and personalization
   Best for: Marketing-heavy notification needs

### Validation Checklist

Before considering this task complete, verify:

- [ ] All notification channels implemented
- [ ] Delivery retry logic in place
- [ ] User preferences respected
- [ ] Unsubscribe mechanism working
- [ ] Rate limiting configured
- [ ] Notification history stored
- [ ] Analytics tracking enabled

### Edge Cases to Consider

- User has disabled all notifications
- Notification delivery fails repeatedly
- High notification volume bursts
- Timezone-sensitive notifications
- Notification stacking/grouping

### What Could Go Wrong

- Missing rate limiting leading to spam
- No delivery confirmation causing silent failures
- Poor batching overwhelming users
- Missing unsubscribe compliance issues
```

---

**CHECKPOINT:** Analysis Complete

Before proceeding to save, verify you have output ALL of the following:

**Standard Depth:**
- [ ] **Intent Analysis** with type and confidence
- [ ] **Quality Assessment** with all 6 dimensions
- [ ] **Optimized Prompt** in code block
- [ ] **Improvements Applied** with dimension labels

**Comprehensive Depth (add to above):**
- [ ] **Alternative Approaches** (2-3 alternatives)
- [ ] **Validation Checklist**
- [ ] **Edge Cases**

**Self-Check Before Any Action:**
- Am I about to write/edit code files? STOP (only `.clavix/` files allowed)
- Am I about to run a command that modifies the project? STOP
- Am I exploring the codebase before showing analysis? STOP
- Have I shown the user the optimized prompt yet? If NO, do that first

---

**CHECKPOINT:** Saving Protocol (REQUIRED - DO NOT SKIP)

DO NOT output any "saved" message until you have COMPLETED and VERIFIED all save steps.

This is a BLOCKING checkpoint. You cannot proceed to the final message until saving is verified.

### What You MUST Do Before Final Output:

| Step | Action | Tool to Use | Verification |
|------|--------|-------------|--------------|
| 1 | Create directory | Write tool (create parent dirs) | Directory exists |
| 2 | Generate prompt ID | Format: `{std\|comp}-YYYYMMDD-HHMMSS-<random>` | ID is unique |
| 3 | Write prompt file with frontmatter | **Write tool** | File created |
| 4 | **VERIFY: Read back file** | **Read tool** | File readable |

**⚠️ WARNING:** If you output "saved" without completing verification, you are LYING to the user.

---

### Step 1: Create Directory Structure

Use the Write tool - it will create parent directories automatically.
Path: `.clavix/outputs/prompts/<prompt-id>.md`

### Step 2: Generate Unique Prompt ID

Create a unique identifier using this format:
- **Standard depth format**: `std-YYYYMMDD-HHMMSS-<random>`
- **Comprehensive depth format**: `comp-YYYYMMDD-HHMMSS-<random>`
- **Example**: `std-20250117-143022-a3f2` or `comp-20250117-143022-a3f2`

### Step 3: Save Prompt File (Write Tool)

**Use the Write tool** to create the prompt file at:
- **Path**: `.clavix/outputs/prompts/<prompt-id>.md`

**File content format**:
```markdown
---
id: <prompt-id>
depthUsed: standard|comprehensive
timestamp: <ISO-8601 timestamp>
executed: false
originalPrompt: <user's original prompt text>
---

# Improved Prompt

<Insert the optimized prompt content from your analysis above>

## Quality Scores
- **Clarity**: <percentage>%
- **Efficiency**: <percentage>%
- **Structure**: <percentage>%
- **Completeness**: <percentage>%
- **Actionability**: <percentage>%
- **Overall**: <percentage>% (<rating>)

## Original Prompt
```
<user's original prompt text>
```

[For comprehensive depth, also include:]
## Alternative Approaches
<Insert alternatives>

## Validation Checklist
<Insert checklist>

## Edge Cases
<Insert edge cases>
```

---

## ✅ VERIFICATION (REQUIRED - Must Pass Before Final Output)

**After completing Steps 1-3, you MUST verify the save succeeded.**

### Verification: Read the Prompt File

Use the **Read tool** to read the file you just created:
- Path: `.clavix/outputs/prompts/<your-prompt-id>.md`

**If Read fails:** ⛔ STOP - Saving failed. Retry Step 3.

### Verification Checklist

Before outputting final message, confirm ALL of these:

- [ ] I used the **Write tool** to create `.clavix/outputs/prompts/<id>.md`
- [ ] I used the **Read tool** to verify the prompt file exists and has content
- [ ] The file has valid frontmatter with id, timestamp, and executed: false
- [ ] I know the **exact file path** I created (not a placeholder)

**If ANY checkbox is unchecked: ⛔ STOP and complete the missing step.**

---

## Final Output (ONLY After Verification Passes)

**Your workflow ends here. ONLY output the final message after verification passes.**

### Required Response Ending

**Your response MUST end with the ACTUAL file path you created:**

```
✅ Prompt saved to: `.clavix/outputs/prompts/<actual-prompt-id>.md`

Ready to build this? Just say "let's implement" or run:
/clavix:implement --latest
```

**Replace `<actual-prompt-id>` with the real ID you generated (e.g., `std-20250126-143022-a3f2`).**

**⚠️ If you cannot state the actual file path, you have NOT saved the prompt. Go back and complete saving.**

**IMPORTANT: Don't start implementing. Don't write code. Your job is done.**
Wait for the user to decide what to do next.

---

## Workflow Navigation

**You are here:** Improve Mode (Unified Prompt Intelligence)

**State markers for workflow continuity:**
- If user came from `/clavix:start`: They explored conversationally, now want optimization
- If user came from `/clavix:summarize`: They have a mini-PRD, want to refine the prompt further
- If prompt is complex (score < 60%): Suggest `/clavix:prd` for comprehensive planning instead

**Common workflows:**
- **Quick cleanup**: `/clavix:improve` → `/clavix:implement --latest` → Build
- **Force comprehensive**: `/clavix:improve --comprehensive` → Full analysis with alternatives
- **Strategic planning**: `/clavix:improve` → (suggests) `/clavix:prd` → Plan → Implement → Archive

**After completion, guide user to:**
- `/clavix:implement --latest` - Build what the prompt describes
- `/clavix:prd` - If the task is larger than expected
- `/clavix:refine` - If they want to iterate on the improved prompt

**Related commands:**
- `/clavix:implement` - Execute saved prompt or tasks (IMPLEMENTATION starts here)
- `/clavix:prd` - Generate PRD for strategic planning
- `/clavix:start` - Conversational exploration before prompting
- `/clavix:verify` - Verify implementation against checklist

**Managing saved prompts:**
- List prompts: `ls .clavix/outputs/prompts/*.md`
- Prompt files: `.clavix/outputs/prompts/<id>.md` (metadata in frontmatter)

---

## Agent Transparency (v5.10.1)

### Agent Manual (Universal Protocols)
{{INCLUDE:agent-protocols/AGENT_MANUAL.md}}

### CLI Reference
{{INCLUDE:agent-protocols/cli-reference.md}}

### How to Explain Improvements
{{INCLUDE:sections/improvement-explanations.md}}

### Quality Dimensions (Plain English)
{{INCLUDE:references/quality-dimensions.md}}

### When to Recommend PRD Mode
{{INCLUDE:sections/escalation-factors.md}}

### What Made the Biggest Difference
{{INCLUDE:sections/pattern-impact.md}}

---

## Tips

- **Smart depth selection**: Let the quality score guide depth choice
- **Override when needed**: Use `--comprehensive` or `--standard` flags to force depth
- Label all changes with quality dimensions for education
- For strategic planning with architecture decisions, recommend `/clavix:prd`
- Focus on making prompts **actionable** quickly

## Troubleshooting

### Issue: Prompt Not Saved

**Error: Cannot create directory**
```bash
mkdir -p .clavix/outputs/prompts
```

**Error: Prompt file has invalid frontmatter**
- Re-save the prompt file with valid YAML frontmatter
- Ensure id, timestamp, and executed fields are present

### Issue: Wrong depth auto-selected
**Cause**: Borderline quality score
**Solution**:
- User can override with `--comprehensive` or `--standard` flags
- Or re-run with explicit depth choice

### Issue: Improved prompt still feels incomplete
**Cause**: Standard depth was used but comprehensive needed
**Solution**:
- Re-run with `/clavix:improve --comprehensive`
- Or use `/clavix:prd` if strategic planning is needed
