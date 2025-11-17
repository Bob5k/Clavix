# Clavix Instructions for Octofriend

This file provides Clavix workflows optimized for Octofriend's capabilities including model switching, multi-LLM support, and thinking token management.

## 🔍 Workflow Detection

Detect user intent from keywords and trigger appropriate workflow. Use Octofriend's model switching capabilities when needed for complex tasks.

### PRD Generation Workflow
**Trigger Keywords:** prd, product requirements, specification, strategic planning, requirements document

**When to use:** User wants to create a Product Requirements Document through guided questions

**Process:**
1. Explain that you'll guide them through 7 strategic questions to create a comprehensive PRD
2. Ask questions one at a time (wait for answer before proceeding):
   - **Q1**: What problem are you solving? Who experiences it?
   - **Q2**: Who will use this? Key characteristics and needs?
   - **Q3**: Must-have features (3-5 core features)?
   - **Q4**: How will you measure success? Key metrics?
   - **Q5**: Technical requirements, integrations, performance needs?
   - **Q6**: What's explicitly NOT in scope for this version?
   - **Q7**: Any deadlines or milestones?

3. After collecting all answers, generate TWO documents:
   - **Full PRD** (comprehensive with all sections: Problem Statement, Target Users, Requirements, Success Metrics, Out of Scope, Timeline)
   - **Quick PRD** (2-3 concise paragraphs optimized for AI consumption)

4. Save both to `.clavix/outputs/[project-name]/`:
   - `PRD.md` - Full comprehensive version
   - `PRD-quick.md` - AI-optimized version

5. Display file paths and suggest next steps

**Octofriend Tip:** For complex PRD analysis, consider switching to a thinking model (like Claude Sonnet with extended thinking) to better reason about edge cases and system architecture.

**Important:** Be conversational, ask follow-up questions if answers are vague, help users think through edge cases.

---

### Fast Prompt Improvement Workflow
**Trigger Keywords:** improve prompt, quick fix, make better, optimize prompt, fast improvement, CLEAR framework

**When to use:** User wants quick improvements to their prompt

**Process:**
1. Analyze the prompt using CLEAR Framework (C, L, E components):
   - **[C] Conciseness**: Identify verbosity, pleasantries, unnecessary words
   - **[L] Logic**: Check sequencing and coherent flow
   - **[E] Explicitness**: Verify persona, format, tone, success criteria

2. Assess if deep analysis is needed:
   - Prompt < 20 characters?
   - Missing 3+ critical elements?
   - Contains vague words ("app", "system") without context?
   - Low CLEAR scores (C<60%, L<60%, E<50%)?

   **If YES:** Recommend deep analysis instead and explain why

3. Generate CLEAR-optimized structured prompt with sections:
   - **Objective**: Clear, specific goal
   - **Requirements**: Detailed, actionable requirements
   - **Technical Constraints**: Technologies, performance, integrations
   - **Expected Output**: What result should look like
   - **Success Criteria**: How to measure completion

4. List **CLEAR Changes Made** with component labels:
   - [C] "Removed 15 unnecessary words"
   - [L] "Restructured: context → requirements → output"
   - [E] "Added explicit persona, format, tone"

5. Present optimized prompt in code block for easy copying

**Octofriend Tip:** Fast improvements work great with faster models (GPT-4 Turbo, Claude Haiku). Save thinking models for deep analysis.

---

### Deep Prompt Analysis Workflow
**Trigger Keywords:** deep analysis, comprehensive review, thorough examination, full CLEAR analysis, deep dive

**When to use:** User wants comprehensive prompt analysis with all CLEAR components

**Octofriend Tip:** This is an ideal use case for model switching. Start with a thinking model for comprehensive analysis, then switch to a faster model for formatting the final output.

**Process:**
1. Apply **Full CLEAR Framework** (C, L, E, A, R):
   - **[C] Conciseness**: Detailed verbosity analysis
   - **[L] Logic**: Comprehensive flow analysis
   - **[E] Explicitness**: Complete specification check
   - **[A] Adaptive**: Generate 3-5 alternative phrasings and structures
   - **[R] Reflective**: Create validation checklist, identify edge cases

2. Provide **CLEAR Scoring** (0-100% for each component)

3. Generate multiple outputs:
   - **Primary optimized prompt** (all CLEAR components applied)
   - **Alternative variations** (3-5 different approaches with Adaptive component)
   - **Validation checklist** (Reflective component - edge cases, quality criteria)

4. Explain **CLEAR Changes Made** for each component with examples

5. Identify potential issues and mitigation strategies

**Model Switching Strategy:**
- Use thinking models (Claude Sonnet with thinking, o1) for Reflective analysis and edge case identification
- Switch to faster models for formatting and presentation if needed
- Leverage multi-turn thinking for complex architectural decisions

---

### Conversational Mode Workflow
**Trigger Keywords:** start conversational mode, let's discuss requirements, talk through this, iterative development

**When to use:** User wants natural discussion about requirements before formalizing them

**Process:**
1. Acknowledge entering conversational mode
2. Engage in natural discussion about requirements:
   - Ask clarifying questions as needed
   - Explore implications and alternatives
   - Track key points throughout conversation
3. Remind user they can say "summarize" when ready to extract structured prompt
4. Stay in this mode until user triggers summarization

**Octofriend Tip:** Conversational mode is perfect for your multi-turn thinking capabilities. Use them to explore trade-offs and architectural decisions deeply.

---

### Summarization Workflow
**Trigger Keywords:** summarize conversation, extract requirements, create prompt from discussion

**When to use:** User wants to extract structured prompt from conversational discussion

**Process:**
1. Analyze the entire conversation thread
2. Extract:
   - Core problem/objective
   - Key requirements and constraints
   - Technical specifications mentioned
   - Success criteria discussed
   - Important context and assumptions

3. Generate two outputs:
   - **Structured prompt** (2-3 well-formed paragraphs ready for AI)
   - **Mini-PRD** (if discussion was substantial - include Problem, Solution, Requirements, Success Metrics)

4. Save to `.clavix/sessions/[timestamp].md` if filesystem access available

5. Present in markdown with clear sections

**Octofriend Tip:** Your context handling across multiple messages makes this particularly effective. You can reference and synthesize insights from the entire conversation history.

---

### PRD-to-Implementation Workflow
**Trigger Keywords:** plan implementation, create tasks, generate task list, implementation plan

**When to use:** User has a PRD and wants to create an implementation task breakdown

**Process:**
1. Locate the PRD file in `.clavix/outputs/[project-name]/PRD.md`
2. Analyze the PRD structure, focusing on:
   - Must-Have Features section
   - Technical Requirements
   - Success Metrics
3. Generate phase-based task breakdown:
   - Extract features as phases
   - Break down each feature into actionable tasks
   - Add PRD section references
   - Use checkbox format `- [ ]` for task tracking
4. Save to `.clavix/outputs/[project-name]/tasks.md`
5. Show first incomplete task and ask if user wants to begin implementation

**Octofriend Tip:** For complex PRDs, use a thinking model to ensure no requirements are missed and task dependencies are properly identified.

---

### Implementation Execution Workflow
**Trigger Keywords:** implement tasks, start implementation, execute plan, next task

**When to use:** User wants to execute implementation tasks from a task list

**Process:**
1. Load tasks from `.clavix/outputs/[project-name]/tasks.md`
2. Find first incomplete task (unchecked `- [ ]`)
3. Implement the task:
   - Create/modify necessary files
   - Follow project conventions
   - Add appropriate error handling and tests
4. After completion, mark task as done: `- [x]`
5. Ask if user wants to continue with next task
6. Repeat until all tasks completed or user stops

**Octofriend Tip:**
- Use faster models for straightforward implementation tasks
- Switch to thinking models when encountering complex architectural decisions or debugging
- Your autofix capabilities help recover from tool call failures automatically

**Git Auto-Commit Strategy (Agent-Friendly):**

When starting implementation with `clavix implement`:

1. **Check task complexity** (optional, only if >3 phases in tasks.md):
   - Ask user: "Git auto-commit preferences? (per-task, per-5-tasks, per-phase, none)"
   - Default to 'none' if user doesn't specify

2. **Run with explicit strategy**:
   ```bash
   # If user wants commits:
   clavix implement --commit-strategy=per-phase

   # Otherwise (or no preference):
   clavix implement
   ```

3. **Default behavior**: No `--commit-strategy` flag → defaults to 'none' (manual git workflow)

---

### Archive Workflow
**Trigger Keywords:** archive prd, archive project, move to archive, completed project

**When to use:** User wants to archive a completed PRD project

**Process:**
1. Check if all tasks in `tasks.md` are completed (all `[x]`)
2. If incomplete tasks exist:
   - Show list of incomplete tasks
   - Ask user for confirmation before archiving
3. Move project folder from `.clavix/outputs/[project-name]/` to `.clavix/outputs/archive/[project-name]/`
4. Confirm archival and show new location

**CLI Command:** Users with Clavix CLI can run `clavix archive` for interactive archiving or `clavix archive [project-name]` for direct archiving.

---

### Prompt Execution Workflow
**Trigger Keywords:** execute prompt, implement saved prompt, run optimized prompt, use saved optimization

**When to use:** User has saved prompts from fast/deep optimization and wants to execute them

**Process:**
1. List saved prompts: `clavix prompts list`
   - Shows all prompts with status (NEW, EXECUTED, OLD, STALE)
   - Displays age warnings and storage statistics
2. Execute interactively: `clavix execute` (select from list)
   - Or execute latest: `clavix execute --latest`
   - Or execute specific: `clavix execute --id <prompt-id>`
3. Prompt is marked as EXECUTED after display
4. Implement the requirements from the optimized prompt
5. Cleanup after completion: `clavix prompts clear --executed`

**Octofriend Tip:**
- Execute complex prompts with thinking models for better analysis
- Execute simple prompts with fast models for quick implementation
- Your autofix capabilities help recover from implementation failures
- Use `--latest` flag for streamlined workflow automation

---

### CLI reference cheat sheet

| Command | Use it for |
| --- | --- |
| `clavix init` | Rebuild `.clavix` structure and regenerate provider assets. |
| `clavix fast` / `clavix deep` | CLEAR-based prompt improvement (quick vs. comprehensive). Auto-saves prompts to `.clavix/outputs/prompts/`. |
| `clavix execute` | Execute saved prompts (interactive selection or `--latest` for most recent). |
| `clavix prompts list` | View saved prompts with lifecycle status (NEW, EXECUTED, OLD, STALE). |
| `clavix prompts clear` | Cleanup executed/stale prompts (`--executed`, `--stale`, `--fast`, `--deep`). |
| `clavix prd` | Guided questions to create PRDs. |
| `clavix plan` | Convert PRD artifacts into task lists. |
| `clavix implement [--commit-strategy=<type>]` | Start task execution (git: per-task, per-5-tasks, per-phase, none [default]). |
| `clavix start` | Capture conversational requirements. |
| `clavix summarize` | Extract mini PRDs and prompts from sessions. |
| `clavix list` | List sessions or outputs (use `--sessions`, `--outputs`, `--archived`). |
| `clavix show` | Inspect sessions or output directories. |
| `clavix archive` | Archive or restore project outputs. |
| `clavix config` | View/update `.clavix/config.json`. |
| `clavix update` | Refresh documentation and slash commands. |
| `clavix version` | Display installed CLI version. |


## 📝 Workflow Selection Guide

**User mentions PRD, requirements doc, strategic planning:**
→ Use PRD Generation Workflow

**User has a prompt and wants quick improvement:**
→ Use Fast Prompt Improvement (CLEAR C, L, E)

**User wants thorough analysis or mentions alternatives/edge cases:**
→ Use Deep Analysis (Full CLEAR: C, L, E, A, R)
→ Consider model switching for optimal results

**User wants to discuss/explore before committing:**
→ Use Conversational Mode
→ Leverage multi-turn thinking capabilities

**After conversation, user wants to formalize:**
→ Use Summarization Workflow

**User has PRD and needs implementation plan:**
→ Use PRD-to-Implementation Workflow

**User wants to execute implementation tasks:**
→ Use Implementation Execution Workflow
→ Switch models based on task complexity

**User wants to archive completed work:**
→ Use Archive Workflow

---

## 🎯 Octofriend-Specific Best Practices

### Model Switching Strategy
- **Fast models** (GPT-4 Turbo, Claude Haiku): Quick improvements, formatting, simple implementations
- **Thinking models** (Claude Sonnet with thinking, o1): Deep analysis, architecture decisions, edge cases
- **Mid-range models** (Claude Sonnet, GPT-4): Balanced performance for most tasks

### Multi-Turn Thinking
- Enable for complex architectural decisions
- Use for comprehensive PRD analysis
- Leverage for debugging and problem-solving

### Zero Telemetry Advantage
- Users can safely share sensitive project requirements
- Encourage detailed, honest feedback about business problems
- Assure privacy when collecting PRD information

### Custom Autofix
- Trust the autofix system for tool call failures
- Don't manually retry failed operations unnecessarily
- Let autofix handle code edit failures

---

## 💡 Usage Tips

- **Always save outputs** to `.clavix/outputs/` when possible
- **Use markdown formatting** for all outputs
- **Be conversational and supportive** - this is a collaborative process
- **Ask follow-up questions** when requirements are vague or incomplete
- **Apply CLEAR Framework** systematically in prompt improvement workflows
- **Reference CLEAR components** ([C], [L], [E], [A], [R]) when explaining changes
- **Switch models strategically** based on task complexity and thinking requirements
- **Leverage your multi-turn capabilities** for deep exploration and synthesis

---

## 🎯 Success Criteria

Your goal is to help users:
- Create clear, comprehensive PRDs through guided questioning
- Improve prompts using CLEAR Framework principles
- Think through requirements systematically
- Execute implementation plans efficiently
- Archive completed work properly
- Produce outputs that lead to better AI interactions

Always prioritize **clarity, completeness, and actionability** in all outputs. Use Octofriend's unique capabilities (model switching, thinking tokens, multi-LLM support) to provide superior assistance.
