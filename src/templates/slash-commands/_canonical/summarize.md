---
name: "Clavix: Summarize"
description: Extract and optimize requirements from conversation
---

# Clavix: Turn Our Chat Into Requirements

Time to capture what we discussed! I'll go through our conversation, pull out the key requirements, and create clear documentation you can use.

---

## What This Does

When you run `/clavix:summarize`, I:
1. **Read our conversation** - Everything we talked about
2. **Extract the requirements** - What you want to build
3. **Organize and improve them** - Make them clear and actionable
4. **Create documentation** - Mini-PRD and optimized prompt files
5. **Flag unclear areas** - Things we might need to discuss more

**I'm capturing what we discussed, not building anything yet.**

---

## CLAVIX MODE: Extraction Only

**I'm in extraction mode. Summarizing our conversation.**

**What I'll do:**
- ✓ Analyze everything we discussed
- ✓ Pull out the key requirements
- ✓ Organize them into a clear structure
- ✓ Create documentation files
- ✓ Tell you what's still unclear

**What I won't do:**
- ✗ Write code for the feature
- ✗ Start implementing anything
- ✗ Make up requirements we didn't discuss

**I'm documenting what we talked about, not building it.**

For complete mode documentation, see: `.clavix/instructions/core/clavix-mode.md`

---

## Self-Correction Protocol

**DETECT**: If you find yourself doing any of these 6 mistake types:

| Type | What It Looks Like |
|------|--------------------|
| 1. Implementation Code | Writing function/class definitions, creating components, generating API endpoints, test files, database schemas, or configuration files for the user's feature |
| 2. Skipping Pre-Validation | Not checking conversation completeness before extracting requirements |
| 3. Missing Confidence Indicators | Not annotating requirements with [HIGH], [MEDIUM], [LOW] confidence |
| 4. Not Creating Output Files | Not creating mini-prd.md, optimized-prompt.md, and quick-prd.md files |
| 5. No Optimization Applied | Not applying quality patterns to extracted requirements |
| 6. Capability Hallucination | Claiming features Clavix doesn't have, inventing workflows |

**STOP**: Immediately halt the incorrect action

**CORRECT**: Output:
"I apologize - I was [describe mistake]. Let me return to requirements extraction."

**RESUME**: Return to the requirements extraction workflow with validation and file creation.

---

## State Assertion (REQUIRED)

**Before starting extraction, output:**
```
**CLAVIX MODE: Requirements Extraction**
Mode: planning
Purpose: Extracting and optimizing requirements from conversation
Implementation: BLOCKED - I will extract requirements, not implement them
```

---

## Instructions

1. **Pre-Extraction Validation** - Check conversation completeness:

   **CHECKPOINT:** Pre-extraction validation started

   **Minimum viable requirements:**
   - **Objective/Goal**: Is there a clear problem or goal stated?
   - **Requirements**: Are there at least 2-3 concrete features or capabilities described?
   - **Context**: Is there enough context about who/what/why?

   **If missing critical elements:**
   - Identify what's missing (e.g., "No clear objective", "Requirements too vague")
   - Ask targeted questions to fill gaps:
     - Missing objective: "What problem are you trying to solve?"
     - Vague requirements: "Can you describe 2-3 specific things this should do?"
     - No context: "Who will use this and in what situation?"
   - **DO NOT** proceed to extraction until minimum viable requirements met

   **If requirements are present:**
   ```
   **CHECKPOINT:** Pre-extraction validation passed - minimum requirements present

   I'll now analyze our conversation and extract structured requirements.
   ```

   **Confidence indicators** (annotate extracted elements):
   - **[HIGH]**: Explicitly stated multiple times with details
   - **[MEDIUM]**: Mentioned once or inferred from context
   - **[LOW]**: Assumed based on limited information

2. **Extract Requirements** - Review the entire conversation and identify (with confidence indicators):
   - **Problem/Goal** [confidence]: What is the user trying to build or solve?
   - **Key Requirements** [confidence per requirement]: What features and functionality were discussed?
   - **Technical Constraints** [confidence]: Any technologies, integrations, or performance needs?
   - **User Needs** [confidence]: Who are the end users and what do they need?
   - **Success Criteria** [confidence]: How will success be measured?
   - **Context** [confidence]: Any important background or constraints?

   **Calculate Extraction Confidence:**
   - Start with 50% base (conversational content detected)
   - Add 20% if concrete requirements extracted
   - Add 15% if clear goals identified
   - Add 15% if constraints defined
   - Display: "*Extraction confidence: X%*"
   - If confidence < 80%, include verification prompt in output

   **CHECKPOINT:** Extracted [N] requirements, [M] constraints from conversation (confidence: X%)

3. **CREATE OUTPUT FILES (REQUIRED)** - You MUST create three files. This is not optional.

   **Step 3.1: Determine project name (Suggest + Confirm)**

   Before creating files, derive a project name from the conversation:

   1. **Analyze conversation** to extract a meaningful name:
      - Look for explicit project names mentioned
      - Identify the main topic/feature being discussed
      - Use key nouns (e.g., "auth", "dashboard", "todo")

   2. **Generate suggested name**:
      - Format: lowercase, hyphen-separated (e.g., "user-auth", "sales-dashboard")
      - Keep it short (2-4 words max)
      - Make it descriptive but concise

   3. **Ask user to confirm**:
      ```
      I'll save these requirements as project "[suggested-name]".

      Is this name okay? (y/n/custom name)
      ```

   4. **Handle response**:
      - "y" or "yes" → use suggested name
      - "n" or "no" → ask for custom name
      - Any other text → use that as the project name (sanitize to lowercase-hyphenated)

   **Step 3.2: Create directory structure**
   ```bash
   mkdir -p .clavix/outputs/[project-name]
   ```

   **Note (Backwards Compatibility):** Legacy workflows may have used `.clavix/outputs/summarize/` as output. The `/clavix:plan` and `/clavix:implement` commands check both project directories and the legacy `summarize/` location.

   **Step 3.3: Write mini-prd.md**

   Use the Write tool to create `.clavix/outputs/[project-name]/mini-prd.md` with this content:

   **Mini-PRD template:**
   ```markdown
   # Requirements: [Project Name]

   *Generated from conversation on [date]*

   ## Objective
   [Clear, specific goal extracted from conversation]

   ## Core Requirements

   ### Must Have (High Priority)
   - [HIGH] Requirement 1 with specific details
   - [HIGH] Requirement 2 with specific details

   ### Should Have (Medium Priority)
   - [MEDIUM] Requirement 3
   - [MEDIUM] Requirement 4

   ### Could Have (Low Priority / Inferred)
   - [LOW] Requirement 5

   ## Technical Constraints
   - **Framework/Stack:** [If specified]
   - **Performance:** [Any performance requirements]
   - **Scale:** [Expected load/users]
   - **Integrations:** [External systems]
   - **Other:** [Any other technical constraints]

   ## User Context
   **Target Users:** [Who will use this?]
   **Primary Use Case:** [Main problem being solved]
   **User Flow:** [High-level description]

   ## Edge Cases & Considerations
   - [Edge case 1 and how it should be handled]
   - [Open question 1 - needs clarification]

   ## Implicit Requirements
   *Inferred from conversation context - please verify:*
   - [Category] [Requirement inferred from discussion]
   - [Category] [Another requirement]
   > **Note:** These requirements were surfaced by analyzing conversation patterns.

   ## Success Criteria
   How we know this is complete and working:
   - ✓ [Specific success criterion 1]
   - ✓ [Specific success criterion 2]

   ## Next Steps
   1. Review this PRD for accuracy and completeness
   2. If anything is missing or unclear, continue the conversation
   3. When ready, use the optimized prompt for implementation

   ---
   *This PRD was generated by Clavix from conversational requirements gathering.*
   ```

   **CHECKPOINT:** Created mini-prd.md successfully

   **Step 3.4: Write original-prompt.md**

   Use the Write tool to create `.clavix/outputs/[project-name]/original-prompt.md`

   **Content:** Raw extraction in paragraph form (2-4 paragraphs describing what to build)

   This is the UNOPTIMIZED version - direct extraction from conversation without enhancements.

   **Format:**
   ```markdown
   # Original Prompt (Extracted from Conversation)

   [Paragraph 1: Project objective and core functionality]

   [Paragraph 2: Key features and requirements]

   [Paragraph 3: Technical constraints and context]

   [Paragraph 4: Success criteria and additional considerations]

   ---
   *Extracted by Clavix on [date]. See optimized-prompt.md for enhanced version.*
   ```

   **CHECKPOINT:** Created original-prompt.md successfully

   **Step 3.5: Write optimized-prompt.md**

   Use the Write tool to create `.clavix/outputs/[project-name]/optimized-prompt.md`

   **Content:** Enhanced version with pattern-based optimization (see step 4 below for optimization)

   **Format:**
   ```markdown
   # Optimized Prompt (Clavix Enhanced)

   [Enhanced paragraph 1 with improvements applied]

   [Enhanced paragraph 2...]

   [Enhanced paragraph 3...]

   ---

   ## Optimization Improvements Applied

   1. **[ADDED]** - [Description of what was added and why]
   2. **[CLARIFIED]** - [What was ambiguous and how it was clarified]
   3. **[STRUCTURED]** - [How information was reorganized]
   4. **[EXPANDED]** - [What detail was added]
   5. **[SCOPED]** - [What boundaries were defined]

   ---
   *Optimized by Clavix on [date]. This version is ready for implementation.*
   ```

   **CHECKPOINT:** Created optimized-prompt.md successfully

   **Step 3.6: Verify file creation**

   List the created files to confirm they exist:
   ```
   Created files in .clavix/outputs/[project-name]/:
   ✓ mini-prd.md
   ✓ original-prompt.md
   ✓ optimized-prompt.md
   ```

   **CHECKPOINT:** All files created and verified successfully

   **If any file is missing:**
   - Something went wrong with file creation
   - Retry the Write tool for the missing file

4. **Pattern-Based Optimization** (automatic with labeled improvements):
   - After extracting the prompt, analyze using pattern-based optimization
   - Apply optimizations for Clarity, Efficiency, Structure, Completeness, and Actionability
   - **Label all improvements** with quality dimension tags:
     - **[Efficiency]**: "Removed 12 conversational words, reduced from 45 to 28 words"
     - **[Structure]**: "Reorganized flow: context → requirements → constraints → success criteria"
     - **[Clarity]**: "Added explicit output format (React component), persona (senior dev)"
     - **[Completeness]**: "Added missing success metrics (load time < 2s, user adoption rate)"
     - **[Actionability]**: "Converted vague goals into specific, measurable requirements"
   - Display both raw extraction and optimized version
   - Show quality scores (before/after) and labeled improvements
   - These improvements were already applied when creating optimized-prompt.md in step 3.4

   **CHECKPOINT:** Applied pattern-based optimization - [N] improvements added

5. **Highlight Key Insights** discovered during the conversation:
   ```markdown
   ## Key Insights from Conversation

   1. **[Insight category]**: [What was discovered]
      - Implication: [Why this matters for implementation]

   2. **[Insight category]**: [What was discovered]
      - Implication: [Why this matters]
   ```

6. **Point Out Unclear Areas** - If anything is still unclear or missing:
   ```markdown
   ## Areas for Further Discussion

   The following points could use clarification:

   1. **[Topic]**: [What's unclear and why it matters]
      - Suggested question: "[Specific question to ask]"

   If you'd like to clarify any of these, let's continue the conversation before implementation.
   ```

7. **Present Summary to User** - After all files are created and verified:
   ```markdown
   ## ✅ Requirements Extracted and Documented

   I've analyzed our conversation and created structured outputs:

   **📄 Files Created:**
   - **mini-prd.md** - Comprehensive requirements document with priorities
   - **original-prompt.md** - Raw extraction from our conversation
   - **optimized-prompt.md** - Enhanced version ready for implementation

   **📁 Location:** `.clavix/outputs/[project-name]/`

   **🎯 Optimizations Applied:**
   Applied [N] improvements:
   - [Brief summary of improvements]

   **🔍 Key Insights:**
   - [Top 2-3 insights in one line each]

   **⚠️ Unclear Areas:**
   [If any, list briefly, otherwise omit this section]

   ---

   **Next Steps:**
   1. Review the mini-PRD for accuracy
   2. If anything needs adjustment, let me know and we can refine
   3. When ready for implementation, use the optimized prompt as your specification

   Would you like me to clarify or expand on anything?
   ```

   **CHECKPOINT:** Summarization workflow complete - all outputs created

## Quality Enhancement

**What gets optimized (5 dimensions):**
- **Clarity**: Remove ambiguity from extracted requirements
- **Efficiency**: Remove verbosity and conversational fluff
- **Structure**: Ensure logical flow (context → requirements → constraints → output)
- **Completeness**: Add missing specifications, formats, success criteria
- **Actionability**: Make requirements specific and executable

**Why Specificity is excluded:**
The `/clavix:summarize` command extracts requirements from exploratory conversations. Users in discovery mode often haven't determined concrete specifics yet (exact versions, file paths, numeric thresholds). Penalizing for missing specifics would unfairly score valid exploratory outputs. If specific details are needed, use `/clavix:improve` on the extracted prompt or proceed to `/clavix:prd` for full specification.

**Output files:**
- `original-prompt.md` - Raw extraction from conversation
- `optimized-prompt.md` - Enhanced version (recommended for AI agents)
- `mini-prd.md` - Structured requirements document

## Quality Checks

- Clear objective stated
- Specific, actionable requirements
- Technical constraints identified
- Success criteria defined
- User needs considered
- Universal prompt intelligence applied for AI consumption

---

## Agent Transparency (v5.8.0)

### Agent Manual (Universal Protocols)
{{INCLUDE:agent-protocols/AGENT_MANUAL.md}}

### How to Explain Improvements
{{INCLUDE:sections/improvement-explanations.md}}

### Quality Dimensions (Plain English)
{{INCLUDE:references/quality-dimensions.md}}

### Workflow State Detection
{{INCLUDE:agent-protocols/state-awareness.md}}

### Recovery Patterns
{{INCLUDE:troubleshooting/vibecoder-recovery.md}}

---

## Workflow Navigation

**You are here:** Summarize (Conversation Extraction)

**State markers for workflow continuity:**
- If user came from `/clavix:start`: There's conversation context to extract
- If user invoked directly: Look for any recent conversation in context
- If conversation was technical: Focus on implementation details in extraction
- If conversation was exploratory: Focus on requirements and goals

**Common workflows:**
- **Standard flow**: `/clavix:start` → [conversation] → `/clavix:summarize` → Use optimized prompt
- **To implementation**: `/clavix:summarize` → `/clavix:plan` → `/clavix:implement` → `/clavix:archive`
- **Standalone use**: [Any conversation] → `/clavix:summarize` → Extract and optimize

**After completion, guide user to:**
- `/clavix:plan` - Generate tasks from the mini-PRD (if strategic)
- `/clavix:implement --latest` - Build directly (if simple)
- `/clavix:improve` - Polish the extracted prompt further

**Related commands:**
- `/clavix:start` - Begin conversational exploration (typical previous step)
- `/clavix:plan` - Generate tasks from extracted mini-PRD (next step)
- `/clavix:improve` - Further optimize the extracted prompt

## Example

From conversation about "analytics dashboard for sales team"...

**Original Extraction**:
```
We discussed building a dashboard for the sales team that shows analytics. They want to see revenue trends and who's performing well. It should update in real-time and help managers spot problems. We talked about using React and connecting to Salesforce.
```

**Optimized Prompt**:
```
Build a real-time sales analytics dashboard for the sales team showing revenue trends, top performers, pipeline status, and conversion rates. The dashboard should update live as deals progress, support filtering by date range/region/rep, and display key metrics prominently. Users need to quickly identify at-risk deals and celebrate wins.

Technical stack: React + TypeScript frontend, integrate with existing Salesforce API, use Chart.js for visualizations, responsive design for mobile access. Must handle 10K+ deals without performance degradation.

Success: Sales managers can identify issues within 30 seconds of opening, dashboard loads in <2 seconds, 90% of team uses it daily within first month.
```

**Improvements Applied**:
- **[Efficiency]**: Removed 8 conversational phrases, increased information density
- **[Structure]**: Organized into objective → requirements → technical → success
- **[Clarity]**: Specified exact features (filtering, metrics display) instead of vague "shows analytics"
- **[Completeness]**: Added performance requirements (10K+ deals, <2s load), success metrics (30s to identify issues, 90% adoption)
- **[Actionability]**: Converted "help managers spot problems" into specific, measurable outcome

## Troubleshooting

### Issue: Files not created or verification fails
**Cause**: Skipped file creation steps or Write tool not used
**Solution**:
- Review step 3 file creation instructions
- Ensure each file has explicit Write tool step
- Verify all files exist before continuing
- Retry the Write tool for any missing files

### Issue: Pre-extraction validation fails (missing objective/requirements)
**Cause**: Conversation didn't cover enough detail
**Solution** (inline - DO NOT extract):
- List what's missing specifically
- Ask targeted questions to fill gaps
- Only proceed to extraction after minimum viable requirements met
- Show confidence indicators for what WAS discussed

### Issue: Conversation covered multiple unrelated topics
**Cause**: Exploratory discussion without focus
**Solution**:
- Ask user which topic to extract/focus on
- Or extract all topics separately into different sections
- Mark multi-topic extraction with [MULTI-TOPIC] indicator
- Suggest breaking into separate PRDs for each topic

### Issue: Optimization doesn't significantly improve extracted prompt
**Cause**: Conversation was already well-structured and detailed
**Solution**:
- Minor improvements are normal for good conversations
- Show quality scores (should be high: >80%)
- Still provide both versions but note that original extraction was already high quality

### Issue: Low confidence indicators across all extracted elements
**Cause**: Conversation was too vague or high-level
**Solution** (inline):
- Don't just extract with [LOW] markers everywhere
- Ask follow-up questions to increase confidence
- Or inform user: "Our conversation was exploratory. I recommend `/clavix:start` to go deeper, or `/clavix:prd` for structured planning"

### Issue: Extracted prompt contradicts earlier conversation
**Cause**: Requirements evolved during conversation
**Solution**:
- Use latest/final version of requirements
- Note that requirements evolved
- Ask user to confirm which version is correct
- Suggest starting fresh with `/clavix:prd` if major contradictions exist
