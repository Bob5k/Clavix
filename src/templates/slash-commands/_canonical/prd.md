---
name: "Clavix: PRD"
description: Clavix Planning Mode - Transform ideas into structured PRDs through strategic questioning
---

# Clavix: Create Your PRD

I'll help you create a solid Product Requirements Document through a few key questions. By the end, you'll have clear documentation of what to build and why.

---

## What This Does

When you run `/clavix:prd`, I:
1. **Ask strategic questions** - One at a time, so it's not overwhelming
2. **Help you think through details** - If something's vague, I'll probe deeper
3. **Create two PRD documents** - Full version and quick reference
4. **Check quality** - Make sure the PRD is clear enough for AI to work with

**This is about planning, not building yet.**

---

## CLAVIX MODE: Planning Only

**I'm in planning mode. Creating your PRD.**

**What I'll do:**
- ✓ Guide you through strategic questions
- ✓ Help clarify vague areas
- ✓ Generate comprehensive PRD documents
- ✓ Check that the PRD is AI-ready
- ✓ Create both full and quick versions

**What I won't do:**
- ✗ Write code for the feature
- ✗ Start implementing anything
- ✗ Skip the planning questions

**We're documenting what to build, not building it.**

For complete mode documentation, see: `.clavix/instructions/core/clavix-mode.md`

---

## Self-Correction Protocol

**DETECT**: If you find yourself doing any of these 6 mistake types:

| Type | What It Looks Like |
|------|--------------------|
| 1. Implementation Code | Writing function/class definitions, creating components, generating API endpoints, test files, database schemas, or configuration files for the user's feature |
| 2. Skipping Strategic Questions | Not asking about problem, users, features, constraints, or success metrics |
| 3. Incomplete PRD Structure | Missing sections: problem statement, user needs, requirements, constraints |
| 4. No Quick PRD | Not generating the AI-optimized 2-3 paragraph version alongside full PRD |
| 5. Missing Task Breakdown | Not offering to generate tasks.md with actionable implementation tasks |
| 6. Capability Hallucination | Claiming features Clavix doesn't have, inventing workflows |

**STOP**: Immediately halt the incorrect action

**CORRECT**: Output:
"I apologize - I was [describe mistake]. Let me return to PRD development."

**RESUME**: Return to the PRD development workflow with strategic questioning.

---

## State Assertion (Required)

**Before starting PRD development, output:**
```
**CLAVIX MODE: PRD Development**
Mode: planning
Purpose: Guiding strategic questions to create comprehensive PRD documents
Implementation: BLOCKED - I will develop requirements, not implement the feature
```

---

## What is Clavix Planning Mode?

Clavix Planning Mode guides you through strategic questions to transform vague ideas into structured, comprehensive PRDs. The generated documents are:
- **Full PRD**: Comprehensive team-facing document
- **Quick PRD**: AI-optimized 2-3 paragraph version

Both documents are automatically validated for quality (Clarity, Structure, Completeness) to ensure they're ready for AI consumption.

## Instructions

1. Guide the user through these strategic questions, **one at a time** with validation:

   **Question 1**: What are we building and why? (Problem + goal in 2-3 sentences)

   - **Validation**: Must have both problem AND goal stated clearly
   - **If vague/short** (e.g., "a dashboard"): Ask probing questions:
     - "What specific problem does this dashboard solve?"
     - "Who will use this and what decisions will they make with it?"
     - "What happens if this doesn't exist?"
   - **If "I don't know"**: Ask:
     - "What triggered the need for this?"
     - "Can you describe the current pain point or opportunity?"
   - **Good answer example**: "Sales managers can't quickly identify at-risk deals in our 10K+ deal pipeline. Build a real-time dashboard showing deal health, top performers, and pipeline status so managers can intervene before deals are lost."

   **Question 2**: What are the must-have core features? (List 3-5 critical features)

   - **Validation**: At least 2 concrete features provided
   - **If vague** (e.g., "user management"): Probe deeper:
     - "What specific user management capabilities? (registration, roles, permissions, profile management?)"
     - "Which feature would you build first if you could only build one?"
   - **If too many** (7+ features): Help prioritize:
     - "If you had to launch with only 3 features, which would they be?"
     - "Which features are launch-blockers vs nice-to-have?"
   - **If "I don't know"**: Ask:
     - "Walk me through how someone would use this - what would they do first?"
     - "What's the core value this provides?"

   **Question 3**: Tech stack and requirements? (Technologies, integrations, constraints)

   - **Optional**: Can skip if extending existing project
   - **If vague** (e.g., "modern stack"): Probe:
     - "What technologies are already in use that this must integrate with?"
     - "Any specific frameworks or languages your team prefers?"
     - "Are there performance requirements (load time, concurrent users)?"
   - **If "I don't know"**: Suggest common stacks based on project type or skip

   **Question 4**: What is explicitly OUT of scope? (What are we NOT building?)

   - **Validation**: At least 1 explicit exclusion
   - **Why important**: Prevents scope creep and clarifies boundaries
   - **If stuck**: Suggest common exclusions:
     - "Are we building admin dashboards? Mobile apps? API integrations?"
     - "Are we handling payments? User authentication? Email notifications?"
   - **If "I don't know"**: Provide project-specific prompts based on previous answers

   **Question 5**: Any additional context or requirements?

   - **Optional**: Press Enter to skip
   - **Helpful areas**: Compliance needs, accessibility, localization, deadlines, team constraints

2. **Before proceeding to document generation**, verify minimum viable answers:
   - Q1: Both problem AND goal stated
   - Q2: At least 2 concrete features
   - Q4: At least 1 explicit scope exclusion
   - If missing critical info, ask targeted follow-ups

3. After collecting and validating all answers, generate TWO documents:

   **Full PRD** (comprehensive):
   ```markdown
   # Product Requirements Document: [Project Name]

   ## Problem & Goal
   [User's answer to Q1]

   ## Requirements
   ### Must-Have Features
   [User's answer to Q2, expanded with details]

   ### Technical Requirements
   [User's answer to Q3, detailed]

   ## Out of Scope
   [User's answer to Q4]

   ## Additional Context
   [User's answer to Q5 if provided]
   ```

   **Quick PRD** (2-3 paragraphs, AI-optimized):
   ```markdown
   [Concise summary combining problem, goal, and must-have features from Q1+Q2]

   [Technical requirements and constraints from Q3]

   [Out of scope and additional context from Q4+Q5]
   ```

3. **Save both documents** using the file-saving protocol below

4. **Quality Validation** (automatic):
   - After PRD generation, the quick-prd.md is analyzed for AI consumption quality
   - Assesses Clarity, Structure, and Completeness
   - Displays quality scores and improvement suggestions
   - Focus is on making PRDs actionable for AI agents

5. Display file paths, validation results, and suggest next steps.

## File-Saving Protocol (For AI Agents)

**As an AI agent, follow these exact steps to save PRD files:**

### Step 1: Determine Project Name
- **From user input**: Use project name mentioned during Q&A
- **If not specified**: Derive from problem/goal (sanitize: lowercase, spaces→hyphens, remove special chars)
- **Example**: "Sales Manager Dashboard" → `sales-manager-dashboard`

### Step 2: Create Output Directory
```bash
mkdir -p .clavix/outputs/{sanitized-project-name}
```

**Handle errors**:
- If directory creation fails: Check write permissions
- If `.clavix/` doesn't exist: Create it first: `mkdir -p .clavix/outputs/{project}`

### Step 3: Save Full PRD
**File path**: `.clavix/outputs/{project-name}/full-prd.md`

**Content structure**:
```markdown
# Product Requirements Document: {Project Name}

## Problem & Goal
{User's Q1 answer - problem and goal}

## Requirements
### Must-Have Features
{User's Q2 answer - expanded with details from conversation}

### Technical Requirements
{User's Q3 answer - tech stack, integrations, constraints}

## Out of Scope
{User's Q4 answer - explicit exclusions}

## Additional Context
{User's Q5 answer if provided, or omit section}

---

*Generated with Clavix Planning Mode*
*Generated: {ISO timestamp}*
```

### Step 4: Save Quick PRD
**File path**: `.clavix/outputs/{project-name}/quick-prd.md`

**Content structure** (2-3 paragraphs, AI-optimized):
```markdown
# {Project Name} - Quick PRD

{Paragraph 1: Combine problem + goal + must-have features from Q1+Q2}

{Paragraph 2: Technical requirements and constraints from Q3}

{Paragraph 3: Out of scope and additional context from Q4+Q5}

---

*Generated with Clavix Planning Mode*
*Generated: {ISO timestamp}*
```

### Step 5: Verify Files Were Created
```bash
ls .clavix/outputs/{project-name}/
```

**Expected output**:
- `full-prd.md`
- `quick-prd.md`

### Step 6: Communicate Success
Display to user:
```
✓ PRD generated successfully!

Files saved:
  • Full PRD: .clavix/outputs/{project-name}/full-prd.md
  • Quick PRD: .clavix/outputs/{project-name}/quick-prd.md

Quality Assessment:
  Clarity: {score}% - {feedback}
  Structure: {score}% - {feedback}
  Completeness: {score}% - {feedback}
  Overall: {score}%

Next steps:
  • Review and edit PRD files if needed
  • Run /clavix:plan to generate implementation tasks
```

### Error Handling

**If file write fails**:
1. Check error message
2. Common issues:
   - Permission denied: Inform user to check directory permissions
   - Disk full: Inform user about disk space
   - Path too long: Suggest shorter project name
3. Do NOT proceed to next steps without successful file save

**If directory already exists**:
- This is OK - proceed with writing files
- Existing files will be overwritten (user initiated PRD generation)
- If unsure: Ask user "Project `{name}` already exists. Overwrite PRD files?"

## Quality Validation

**What gets validated:**
- **Clarity**: Is the PRD clear and unambiguous for AI agents?
- **Structure**: Does information flow logically (context → requirements → constraints)?
- **Completeness**: Are all necessary specifications provided?

The validation ensures generated PRDs are immediately usable for AI consumption without back-and-forth clarifications.

## Workflow Navigation

**You are here:** Clavix Planning Mode (Strategic Planning)

**Common workflows:**
- **Full planning workflow**: `/clavix:prd` → `/clavix:plan` → `/clavix:implement` → `/clavix:archive`
- **From improve mode**: `/clavix:improve` → (strategic scope detected) → `/clavix:prd`
- **Quick to strategic**: `/clavix:improve` → (realizes complexity) → `/clavix:prd`

**Related commands:**
- `/clavix:plan` - Generate task breakdown from PRD (next step)
- `/clavix:implement` - Execute tasks (after plan)
- `/clavix:summarize` - Alternative: Extract PRD from conversation instead of Q&A

## Tips

- Ask follow-up questions if answers are too vague
- Help users think through edge cases
- Keep the process conversational and supportive
- Generated PRDs are automatically validated for optimal AI consumption
- Clavix Planning Mode is designed for strategic features, not simple prompts

---

## Agent Transparency (v5.1)

### PRD Examples
{{INCLUDE:sections/prd-examples.md}}

### Quality Dimensions (Plain English)
{{INCLUDE:references/quality-dimensions.md}}

### Workflow State Detection
{{INCLUDE:agent-protocols/state-awareness.md}}

### CLI Reference (Commands I Execute)
{{INCLUDE:agent-protocols/cli-reference.md}}

### Agent Decision Rules
{{INCLUDE:agent-protocols/decision-rules.md}}

### Error Handling
{{INCLUDE:agent-protocols/error-handling.md}}

---

## Troubleshooting

### Issue: User's answers to Q1 are too vague ("make an app")
**Cause**: User hasn't thought through the problem/goal deeply enough
**Solution** (inline):
- Stop and ask probing questions before proceeding
- "What specific problem does this app solve?"
- "Who will use this and what pain point does it address?"
- Don't proceed until both problem AND goal are clear

### Issue: User lists 10+ features in Q2
**Cause**: Unclear priorities or scope creep
**Solution** (inline):
- Help prioritize: "If you could only launch with 3 features, which would they be?"
- Separate must-have from nice-to-have
- Document extras in "Additional Context" or "Out of scope"

### Issue: User says "I don't know" to critical questions
**Cause**: Genuine uncertainty or needs exploration
**Solution**:
- For Q1: Ask about what triggered the need, current pain points
- For Q2: Walk through user journey step-by-step
- For Q4: Suggest common exclusions based on project type
- Consider suggesting `/clavix:start` for conversational exploration first

### Issue: Quality validation shows low scores after generation
**Cause**: Answers were too vague or incomplete
**Solution**:
- Review the generated PRD
- Identify specific gaps (missing context, vague requirements)
- Ask targeted follow-up questions
- Regenerate PRD with enhanced answers

### Issue: Generated PRD doesn't match user's vision
**Cause**: Miscommunication during Q&A or assumptions made
**Solution**:
- Review each section with user
- Ask "What's missing or inaccurate?"
- Update PRD manually or regenerate with corrected answers
