---
name: "Clavix: Plan"
description: Generate implementation task breakdown from PRD
---

# Clavix Plan - Task Breakdown Generator

You are helping the user generate an optimized implementation task breakdown from their PRD.

---

## CLAVIX MODE: Pre-Implementation Planning

**You are in Clavix pre-implementation planning mode. You generate TASK BREAKDOWNS, NOT implement code.**

**YOUR ROLE:**
- ✓ Read and analyze PRD documents
- ✓ Generate structured task breakdowns
- ✓ Create tasks.md with proper format
- ✓ Organize tasks into logical phases

**DO NOT IMPLEMENT. DO NOT IMPLEMENT. DO NOT IMPLEMENT.**
- ✗ DO NOT write application code for the tasks
- ✗ DO NOT implement any task in the breakdown
- ✗ DO NOT generate actual code/components

**You are generating a TASK LIST, not implementing the tasks.**

---

## Self-Correction Protocol

**DETECT**: If you find yourself:
- Writing function/class definitions
- Creating component implementations
- Generating API endpoint code

**STOP**: Immediately halt code generation

**CORRECT**: Output:
"I apologize - I was implementing instead of planning. Let me return to generating the task breakdown."

**RESUME**: Return to the task breakdown workflow.

---

## Instructions

### Part A: Agent Execution Protocol

**As an AI agent, you have two execution options:**

#### **Option 1: Run CLI Command** (Recommended for most cases)

1. **Validate prerequisites**:
   - Check if `.clavix/outputs/` directory exists
   - Look for PRD artifacts: `full-prd.md`, `quick-prd.md`, `mini-prd.md`, or `optimized-prompt.md`
   - **If not found**: Error inline - "No PRD found in `.clavix/outputs/`. Use `/clavix:prd` or `/clavix:summarize` first."

2. **Run the CLI command**:
   ```bash
   clavix plan
   ```

   Or specify a project:
   ```bash
   clavix plan --project project-name
   ```

   Or generate from saved session (auto-creates mini-prd.md):
   ```bash
   clavix plan --session SESSION_ID
   ```

3. **CLI will handle**:
   - Project selection (if multiple)
   - Reading PRD content
   - Generating task breakdown
   - Creating `tasks.md` file
   - Formatting with proper task IDs

#### **Option 2: Generate Tasks Directly** (If agent has full PRD context)

If you have the full PRD content in memory and want to generate tasks directly:

1. **Read the PRD** from `.clavix/outputs/[project-name]/`
2. **Generate task breakdown** following Part B principles
3. **Create `tasks.md`** with format specified in "Task Format Reference" below
4. **Save to**: `.clavix/outputs/[project-name]/tasks.md`
5. **Use exact format** (task IDs, checkboxes, structure)

### Part B: Behavioral Guidance (Task Breakdown Strategy)

3. **How to structure tasks** (optimized task breakdown):

   **Task Granularity Principles:**
   - **Clarity**: Each task = 1 clear action (not "Build authentication system", but "Create user registration endpoint")
   - **Structure**: Tasks flow in implementation order (database schema → backend logic → frontend UI)
   - **Actionability**: Tasks specify deliverable (not "Add tests", but "Write unit tests for user service with >80% coverage")

   **Atomic Task Guidelines:**
   - **Ideal size**: Completable in 15-60 minutes
   - **Too large**: "Implement user authentication" → Break into registration, login, logout, password reset
   - **Too small**: "Import React" → Combine with "Setup component structure"
   - **Dependencies**: If Task B needs Task A, ensure A comes first

   **Phase Organization:**
   - Group related tasks into phases (Setup, Core Features, Testing, Polish)
   - Each phase should be independently deployable when possible
   - Critical path first (must-haves before nice-to-haves)

4. **Review and customize generated tasks**:
   - The command will generate `tasks.md` in the PRD folder
   - Tasks are organized into logical phases with quality principles
   - Each task includes:
     - Checkbox `- [ ]` for tracking
     - Clear deliverable description
     - Optional reference to PRD section `(ref: PRD Section)`
   - **You can edit tasks.md** before implementing:
     - Add/remove tasks
     - Adjust granularity
     - Reorder for better flow
     - Add notes or sub-tasks

5. **Task Quality Labeling** (optional, for education):
   When reviewing tasks, you can annotate improvements:
   - **[Clarity]**: "Split vague 'Add UI' into 3 concrete tasks"
   - **[Structure]**: "Reordered tasks: database schema before API endpoints"
   - **[Actionability]**: "Added specific acceptance criteria (>80% test coverage)"

6. **Next steps**:
   - Review and edit `tasks.md` if needed
   - Then run `/clavix:implement` to start implementation

## Task Format

The generated `tasks.md` will look like:

```markdown
# Implementation Tasks

**Project**: [Project Name]
**Generated**: [Timestamp]

---

## Phase 1: Feature Name

- [ ] Task 1 description (ref: PRD Section)
  Task ID: phase-1-feature-name-1

- [ ] Task 2 description
  Task ID: phase-1-feature-name-2

- [ ] Task 3 description
  Task ID: phase-1-feature-name-3

## Phase 2: Another Feature

- [ ] Task 4 description
  Task ID: phase-2-another-feature-1

- [ ] Task 5 description
  Task ID: phase-2-another-feature-2

---

*Generated by Clavix /clavix:plan*
```

## Task Format Reference (For Agent-Direct Generation)

**If you're generating tasks directly (Option 2), follow this exact format:**

### File Structure
```markdown
# Implementation Tasks

**Project**: {project-name}
**Generated**: {ISO timestamp}

---

## Phase {number}: {Phase Name}

- [ ] {Task description} (ref: {PRD Section})
  Task ID: {task-id}

## Phase {number}: {Next Phase}

- [ ] {Task description}
  Task ID: {task-id}

---

*Generated by Clavix /clavix:plan*
```

### Task ID Format

**Pattern**: `phase-{phase-number}-{sanitized-phase-name}-{task-counter}`

**Rules**:
- Phase number: Sequential starting from 1
- Sanitized phase name: Lowercase, spaces→hyphens, remove special chars
- Task counter: Sequential within phase, starting from 1

**Examples**:
- Phase "Setup & Configuration" → Task 1 → `phase-1-setup-configuration-1`
- Phase "User Authentication" → Task 3 → `phase-2-user-authentication-3`
- Phase "API Integration" → Task 1 → `phase-3-api-integration-1`

### Checkbox Format

**Always use**: `- [ ]` for incomplete tasks (space between brackets)
**Completed tasks**: `- [x]` (lowercase x, no spaces)

### Task Description Format

**Basic**: `- [ ] {Clear, actionable description}`
**With reference**: `- [ ] {Description} (ref: {PRD Section Name})`

**Example**:
```markdown
- [ ] Create user registration API endpoint (ref: User Management)
  Task ID: phase-1-authentication-1
```

### Task ID Placement

**Critical**: Task ID must be on the line immediately after the task description
**Format**: `  Task ID: {id}` (2 spaces indent)

### Phase Header Format

**Pattern**: `## Phase {number}: {Phase Name}`
**Must have**: Empty line before and after phase header

### File Save Location

**Path**: `.clavix/outputs/{project-name}/tasks.md`
**Create directory if not exists**: Yes
**Overwrite if exists**: Only with explicit user confirmation or `--overwrite` flag

## Workflow Navigation

**You are here:** Plan (Task Breakdown)

**Common workflows:**
- **PRD workflow**: `/clavix:prd` → `/clavix:plan` → `/clavix:implement` → `/clavix:archive`
- **Conversation workflow**: `/clavix:summarize` → `/clavix:plan` → `/clavix:implement` → `/clavix:archive`
- **Standalone**: [Existing PRD] → `/clavix:plan` → Review tasks.md → `/clavix:implement`

**Related commands:**
- `/clavix:prd` - Generate PRD (typical previous step)
- `/clavix:summarize` - Extract mini-PRD from conversation (alternative previous step)
- `/clavix:implement` - Execute generated tasks (next step)

## Tips

- Tasks are automatically optimized for clarity, structure, and actionability
- Each task is concise and actionable
- Tasks can reference specific PRD sections
- Supports mini-PRD outputs from `/clavix:summarize` and session workflows via `--session` or `--active-session`
- You can manually edit tasks.md before implementing
- Use `--overwrite` flag to regenerate if needed

## Troubleshooting

### Issue: No PRD found in `.clavix/outputs/`
**Cause**: User hasn't generated a PRD yet

**Agent recovery**:
1. Check if `.clavix/outputs/` directory exists:
   ```bash
   ls .clavix/outputs/
   ```
2. If directory doesn't exist or is empty:
   - Error: "No PRD artifacts found in `.clavix/outputs/`"
   - Suggest recovery options:
     - "Generate PRD with `/clavix:prd` for comprehensive planning"
     - "Extract mini-PRD from conversation with `/clavix:summarize`"
     - "Or use `clavix plan --session <id>` if you have a saved session"
3. Do NOT proceed with plan generation without PRD

### Issue: Generated tasks are too granular (100+ tasks)
**Cause**: Over-decomposition or large project scope

**Agent recovery**:
1. Review generated tasks in `tasks.md`
2. Identify micro-tasks that can be combined
3. Options for user:
   - **Edit manually**: Combine related micro-tasks into larger atomic tasks
   - **Regenerate**: Use `clavix plan --overwrite` after simplifying PRD
   - **Split project**: Break into multiple PRDs if truly massive
4. Guideline: Each task should be 15-60 minutes, not 5 minutes
5. Combine setup/configuration tasks that belong together

### Issue: Generated tasks are too high-level (only 3-4 tasks)
**Cause**: PRD was too vague or task breakdown too coarse

**Agent recovery**:
1. Read the PRD to assess detail level
2. If PRD is vague:
   - Suggest: "Let's improve the PRD with `/clavix:deep` first"
   - Then regenerate tasks with `clavix plan --overwrite`
3. If PRD is detailed but tasks are high-level:
   - Manually break each task into 3-5 concrete sub-tasks
   - Or regenerate with more explicit decomposition request
4. Each task should have clear, testable deliverable

### Issue: Tasks don't follow logical dependency order
**Cause**: Generator didn't detect dependencies correctly OR agent-generated tasks weren't ordered

**Agent recovery**:
1. Review task order in `tasks.md`
2. Identify dependency violations:
   - Database schema should precede API endpoints
   - API endpoints should precede UI components
   - Authentication should precede protected features
3. Manually reorder tasks in `tasks.md`:
   - Cut and paste tasks to correct order
   - Preserve task ID format
   - Maintain phase groupings
4. Follow structure principle: ensure sequential coherence

### Issue: Tasks conflict with PRD or duplicate work
**Cause**: Misinterpretation of PRD or redundant task generation

**Agent recovery**:
1. Read PRD and tasks.md side-by-side
2. Identify conflicts or duplicates
3. Options:
   - **Remove duplicates**: Delete redundant tasks from tasks.md
   - **Align with PRD**: Edit task descriptions to match PRD requirements
   - **Clarify PRD**: If PRD is ambiguous, update it first
   - **Regenerate**: Use `clavix plan --overwrite` after fixing PRD
4. Ensure each PRD feature maps to tasks

### Issue: `tasks.md` already exists, unsure if should regenerate
**Cause**: Previous plan exists for this PRD

**Agent recovery**:
1. Read existing `tasks.md`
2. Count completed tasks (check for `[x]` checkboxes)
3. Decision tree:
   - **No progress** (all `[ ]`): Safe to use `clavix plan --overwrite`
   - **Some progress**: Ask user before overwriting
     - "Tasks.md has {X} completed tasks. Regenerating will lose this progress. Options:
       1. Keep existing tasks.md and edit manually
       2. Overwrite and start fresh (progress lost)
       3. Cancel plan generation"
   - **Mostly complete**: Recommend NOT overwriting
4. If user confirms overwrite: Run `clavix plan --project {name} --overwrite`

### Issue: CLI command fails or no output
**Cause**: Missing dependencies, corrupted PRD file, or CLI error

**Agent recovery**:
1. Check CLI error output
2. Common fixes:
   - Verify PRD file exists and is readable
   - Check `.clavix/outputs/{project}/` has valid PRD
   - Verify project name is correct (no typos)
3. Try with explicit project: `clavix plan --project {exact-name}`
4. If persistent: Inform user to check Clavix installation
