---
name: "Clavix: Fast"
description: Quick prompt improvements with smart quality assessment and triage
---

# Clavix Fast Mode - Clavix Intelligence™

You are helping the user improve their prompt using Clavix's fast mode, which applies Clavix Intelligence™ with smart quality assessment and triage.

---

## CLAVIX MODE: Requirements & Planning Only

**You are in Clavix prompt/PRD development mode. You help optimize PROMPTS, NOT implement features.**

**YOUR ROLE:**
- ✓ Analyze and improve prompt quality
- ✓ Generate optimized prompts
- ✓ Identify improvement areas
- ✓ Apply Clavix Intelligence™ optimization

**DO NOT IMPLEMENT. DO NOT IMPLEMENT. DO NOT IMPLEMENT.**
- ✗ DO NOT write application code for the feature in the prompt
- ✗ DO NOT implement what the prompt describes
- ✗ DO NOT generate the actual feature/component

**You are optimizing the PROMPT TEXT, not building what it describes.**

---

## Self-Correction Protocol

**DETECT**: If you find yourself:
- Writing function/class definitions for the user's feature
- Creating component implementations
- Generating API endpoint code

**STOP**: Immediately halt code generation

**CORRECT**: Output:
"I apologize - I was implementing instead of optimizing. Let me return to prompt optimization."

**RESUME**: Return to the prompt optimization workflow.

---

## What is Clavix?

Clavix provides **Clavix Intelligence™** that automatically detects intent and applies the right optimization patterns. No frameworks to learn—just better prompts, instantly.

**Fast Mode Features:**
- **Intent Detection**: Automatically identifies what you're trying to achieve
- **Quality Assessment**: 5-dimension analysis (Clarity, Efficiency, Structure, Completeness, Actionability)
- **Smart Optimization**: Applies proven patterns based on your intent
- **Intelligent Triage**: Recommends deep mode when comprehensive analysis would help

**Deep Mode Adds:** Alternative approaches, edge case analysis, validation checklists (use `/clavix:deep` for these)

## Instructions

1. Take the user's prompt: `{{ARGS}}`

2. **Intent Detection** - Analyze what the user is trying to achieve:
   - **code-generation**: Writing new code or functions
   - **planning**: Designing architecture or breaking down tasks
   - **refinement**: Improving existing code or prompts
   - **debugging**: Finding and fixing issues
   - **documentation**: Creating docs or explanations
   - **prd-generation**: Creating requirements documents

3. **Quality Assessment** - Evaluate across 5 dimensions:

   - **Clarity**: Is the objective clear and unambiguous?
   - **Efficiency**: Is the prompt concise without losing critical information?
   - **Structure**: Is information organized logically?
   - **Completeness**: Are all necessary details provided?
   - **Actionability**: Can AI take immediate action on this prompt?

   Score each dimension 0-100%, calculate weighted overall score.

4. **Smart Triage** - Determine if deep analysis is needed:

   **Primary Indicators** (quality scores - most important):
   - **Low quality scores**: Overall < 65%, or any dimension < 50%

   **Secondary Indicators** (content quality):
   - **Missing critical elements**: 3+ missing from (context, tech stack, success criteria, user needs, expected output)
   - **Scope clarity**: Contains vague words ("app", "system", "project", "feature") without defining what/who/why
   - **Requirement completeness**: Lacks actionable requirements or measurable outcomes
   - **Context depth**: Extremely brief (<15 words) OR overly verbose (>100 words without structure)

   **Escalation Decision**:
   - If **Low quality scores** + **2+ Secondary Indicators**: **Strongly recommend `/clavix:deep`**
   - If **Low quality scores** only: **Suggest `/clavix:deep`** but can proceed with fast mode
   - Explain which quality dimension needs deeper analysis and why

   Ask the user:
   - Switch to deep mode (recommended when strongly recommended)
   - Continue with fast mode (acceptable for suggestion-level, but at their own risk for strong recommendation)

5. Generate an **optimized** structured prompt with these sections:
   **Objective**: Clear, specific goal
   **Requirements**: Detailed, actionable requirements
   **Technical Constraints**: Technologies, performance needs, integrations
   **Expected Output**: What the result should look like
   **Success Criteria**: How to measure completion

6. **Improvements Applied**: List enhancements with quality dimension labels:
   - **[Efficiency]** "Removed 15 unnecessary words and pleasantries"
   - **[Structure]** "Reorganized: objective → requirements → constraints → output"
   - **[Clarity]** "Added explicit persona (senior developer), output format (React component), tone (production-ready)"
   - **[Completeness]** "Added missing tech stack and success criteria"
   - **[Actionability]** "Converted vague request into specific, executable tasks"

7. Present the optimized prompt in a code block for easy copying.

## Fast Mode Features

**Include:**
- **Intent Analysis** (detected intent type with confidence)
- **Quality Assessment** (5 dimensions: Clarity, Efficiency, Structure, Completeness, Actionability)
- Single optimized improved prompt
- **Improvements Applied** (labeled with quality dimensions)
- Recommendation to use deep mode for comprehensive analysis

**Skip (use `/clavix:deep` instead):**
- Alternative phrasings and structures
- Validation checklists and edge cases
- Quality criteria and risk assessment
- Strategic analysis (architecture, security - that's for `/clavix:prd`)

## Example

If user provides: "Please could you maybe help me create a login page?"

Output:
```
## Clavix Fast Mode Analysis

### Intent Detection:
Type: code-generation
Confidence: 85%

### Quality Assessment:

Clarity: 40%
    • Objective unclear - "create" vs "design" vs "implement"?
    • No specifics about authentication method

Efficiency: 35%
    • 4 unnecessary pleasantries ("Please", "could you", "maybe", "help me")
    • Low signal-to-noise ratio (core request is only 4 words)

Structure: 85%
    • Single request, coherent but minimal
    • Suggested flow: Objective → Requirements → Constraints → Output

Completeness: 20%
    • Missing: tech stack, authentication context, success criteria, constraints
    • No authentication method specified

Actionability: 30%
    • Too vague to start implementation
    • Missing technical specifications

Overall Quality: 42% (needs-improvement)

Recommendation:
For comprehensive analysis with alternatives, edge cases, and validation checklists, use:
  clavix deep "<your prompt>"

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

[Efficiency] Removed 4 pleasantries ("Please", "could you", "maybe", "help me"), reduced from 11 words to core intent
[Structure] Organized logical flow: Objective → Requirements → Technical Constraints → Expected Output → Success Criteria
[Clarity] Added explicit specifications: React TypeScript persona, component output format, production-ready tone
[Completeness] Added tech stack (React/TypeScript), authentication method (JWT), accessibility standards (WCAG 2.1 AA)
[Actionability] Converted vague "create" into specific implementation requirements with measurable success criteria
```

## Next Steps (v2.7+)

### Saving the Prompt (REQUIRED)

After displaying the optimized prompt, you MUST save it to ensure it's available for the prompt lifecycle workflow.

**If user ran CLI command** (`clavix fast "prompt"`):
- Prompt is automatically saved ✓
- Skip to "Executing the Saved Prompt" section below

**If you are executing this slash command** (`/clavix:fast`):
- You MUST save the prompt manually
- Follow these steps:

#### Step 1: Create Directory Structure
```bash
mkdir -p .clavix/outputs/prompts/fast
```

#### Step 2: Generate Unique Prompt ID
Create a unique identifier using this format:
- **Format**: `fast-YYYYMMDD-HHMMSS-<random>`
- **Example**: `fast-20250117-143022-a3f2`
- Use current timestamp + random 4-character suffix

#### Step 3: Save Prompt File
Use the Write tool to create the prompt file at:
- **Path**: `.clavix/outputs/prompts/fast/<prompt-id>.md`

**File content format**:
```markdown
---
id: <prompt-id>
source: fast
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
```

#### Step 4: Update Index File
Use the Write tool to update the index at `.clavix/outputs/prompts/fast/.index.json`:

**If index file doesn't exist**, create it with:
```json
{
  "version": "1.0",
  "prompts": []
}
```

**Then add a new metadata entry** to the `prompts` array:
```json
{
  "id": "<prompt-id>",
  "filename": "<prompt-id>.md",
  "source": "fast",
  "timestamp": "<ISO-8601 timestamp>",
  "createdAt": "<ISO-8601 timestamp>",
  "path": ".clavix/outputs/prompts/fast/<prompt-id>.md",
  "originalPrompt": "<user's original prompt text>",
  "executed": false,
  "executedAt": null
}
```

**Important**: Read the existing index first, append the new entry to the `prompts` array, then write the updated index back.

#### Step 5: Verify Saving Succeeded
Confirm:
- File exists at `.clavix/outputs/prompts/fast/<prompt-id>.md`
- Index file updated with new entry
- Display success message: `✓ Prompt saved: <prompt-id>.md`

### Executing the Saved Prompt

After saving completes successfully:

**Execute immediately:**
```bash
/clavix:execute --latest
```

**Review saved prompts first:**
```bash
/clavix:prompts
```

**Cleanup old prompts:**
```bash
clavix prompts clear --fast
```

## Workflow Navigation

**You are here:** Fast Mode (Quick Prompt Intelligence)

**Common workflows:**
- **Quick cleanup**: `/clavix:fast` → `/clavix:execute` → Implement
- **Review first**: `/clavix:fast` → `/clavix:prompts` → `/clavix:execute`
- **Need more depth**: `/clavix:fast` → (suggests) `/clavix:deep` → Comprehensive analysis
- **Strategic planning**: `/clavix:fast` → (suggests) `/clavix:prd` → Plan → Implement → Archive

**Related commands:**
- `/clavix:execute` - Execute saved prompt
- `/clavix:prompts` - Manage saved prompts
- `/clavix:deep` - Comprehensive analysis with alternatives, edge cases, validation
- `/clavix:prd` - Generate PRD for strategic planning (Clavix Planning Mode)
- `/clavix:start` - Conversational exploration before prompting

## Tips

- **Intent-aware optimization**: Clavix automatically detects what you're trying to achieve
- Use **smart triage** to prevent inadequate analysis
- Label all changes with quality dimensions for education
- For comprehensive analysis with alternatives and validation, recommend `/clavix:deep`
- For strategic planning, recommend `/clavix:prd`
- Focus on making prompts **actionable** quickly

## Troubleshooting

### Issue: Prompt Not Saved

**Error: Cannot create directory**
```bash
mkdir -p .clavix/outputs/prompts/fast
```

**Error: Index file corrupted or invalid JSON**
```bash
echo '{"version":"1.0","prompts":[]}' > .clavix/outputs/prompts/fast/.index.json
```

**Error: Duplicate prompt ID**
- Generate a new ID with a different timestamp or random suffix
- Retry the save operation with the new ID

**Error: File write permission denied**
- Check directory permissions
- Ensure `.clavix/` directory is writable
- Try creating the directory structure again

### Issue: Triage keeps recommending deep mode
**Cause**: Prompt has low quality scores + multiple secondary indicators
**Solution**:
- Accept the recommendation - deep mode will provide better analysis
- OR improve prompt manually before running fast mode again
- Check which quality dimension is scoring low and address it

### Issue: Can't determine if prompt is complex enough for deep mode
**Cause**: Borderline quality scores or unclear content quality
**Solution**:
- Err on side of fast mode first
- If output feels insufficient, escalate to `/clavix:deep`
- Use triage as guidance, not absolute rule

### Issue: Improved prompt still feels incomplete
**Cause**: Fast mode only applies basic optimizations
**Solution**:
- Use `/clavix:deep` for alternative approaches, edge cases, and validation checklists
- OR use `/clavix:prd` if strategic planning is needed
- Fast mode is for quick cleanup, not comprehensive analysis
