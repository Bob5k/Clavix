---
name: "Clavix: Implement"
description: Execute tasks from the implementation plan
---

# Clavix Implement - AI-Assisted Task Execution

You are helping the user implement tasks from their task plan with AI assistance.

---

## CLAVIX MODE: Implementation

**You are in Clavix implementation mode. You ARE authorized to write code and implement features.**

**YOUR ROLE:**
- ✓ Read and understand task requirements from tasks.md
- ✓ Write application code to implement each task
- ✓ Create/modify files as needed
- ✓ Run tests to verify implementation
- ✓ Mark tasks complete using `clavix task-complete`

**IMPLEMENTATION AUTHORIZED:**
- ✓ Writing functions, classes, and components
- ✓ Creating new files and modifying existing ones
- ✓ Implementing features described in tasks
- ✓ Writing tests for implemented code

**MODE ENTRY VALIDATION:**
Before implementing, verify:
1. Source documents exist (tasks.md or PRD)
2. Output assertion: "Entering IMPLEMENTATION mode. I will implement tasks from [source]."

---

## Instructions

1. **First-time setup - Run CLI command with optional git strategy**:

   Check if `.clavix-implement-config.json` exists in the PRD output folder.

   **If config file does NOT exist** (first time running implement):

   a. **Check if user wants git auto-commits** (optional, only if tasks.md has >3 phases):
      ```
      "I notice this implementation has [X] phases with [Y] tasks total.

      Would you like me to create git commits automatically as I complete tasks?

      Options:
      - per-task: Commit after each task (frequent commits, detailed history)
      - per-5-tasks: Commit every 5 tasks (balanced approach)
      - per-phase: Commit when each phase completes (milestone commits)
      - none: Manual git workflow (I won't create commits)

      Please choose one, or I'll proceed with 'none' (manual commits)."
      ```

   b. **Run the CLI command to initialize**:
      ```bash
      # With git strategy (if user specified):
      clavix implement --commit-strategy=per-phase

      # Or without (defaults to 'none' - manual commits):
      clavix implement
      ```

   c. **This will**:
      - Show current progress
      - Display the next incomplete task
      - Create `.clavix-implement-config.json` file
      - Set git auto-commit strategy (or default to 'none')

   d. Wait for command to complete, then proceed with step 2

   **If config file already exists**:
   - Skip to step 2 (implementation loop)

2. **As the AI agent, you should**:

   a. **Read the configuration**:
      - Load `.clavix-implement-config.json` from the PRD folder
      - This contains: commit strategy, current task, and progress stats

   b. **Read the PRD for context**:
      - Open the full PRD to understand requirements
      - Reference specific sections mentioned in tasks

   c. **Read tasks.md**:
      - Find the first incomplete task (marked `- [ ]`)
      - This is your current task to implement

   d. **Implement the task**:
      - Write/modify code as needed
      - Follow quality principles (clarity, structure, actionability)
      - Use PRD requirements as your guide
      - Ask user for clarification if needed

   e. **Complete the task programmatically**:
      - IMPORTANT: NEVER manually edit checkboxes in tasks.md
      - Instead, run: `clavix task-complete {task-id}`
      - The task ID is found in tasks.md (e.g., `phase-1-authentication-1`)
      - This command automatically:
        • Validates the task exists
        • Updates the checkbox in tasks.md
        • Tracks completion in config file
        • Creates git commit (if strategy enabled)
        • Displays the next task
      - Example: `clavix task-complete phase-1-setup-1`

   f. **Move to next task**:
      - The task-complete command shows the next task automatically
      - Read it and repeat the process
      - If you get interrupted, just run `clavix implement` again to resume

3. **Session Resume**:
   - When user runs `clavix implement` again, it automatically picks up from the last incomplete task
   - No manual tracking needed - the checkboxes in tasks.md are the source of truth

## Task Completion Workflow

**CRITICAL: Always use the `clavix task-complete` command**

### Why task-complete is CLI-Only

The `clavix task-complete` command requires:
- State validation across config files
- Atomic checkbox updates in tasks.md
- Conditional git commit execution
- Progress tracking and next-task resolution

Therefore it's implemented as a **CLI command** (not a slash command) and called **automatically by the agent** during implementation workflow.

**Agent Responsibility:** Run `clavix task-complete {task-id}` after implementing each task.
**User Responsibility:** None - agent handles task completion automatically.

### Usage

```bash
# After implementing a task, agent runs:
clavix task-complete {task-id}

# Example
clavix task-complete phase-1-setup-1
```

The command handles:
- Checkbox updates in tasks.md
- Config file tracking
- Git commits (per strategy)
- Progress display
- Next task retrieval

**NEVER manually edit tasks.md checkboxes** - the command ensures proper tracking and prevents state inconsistencies.

## Important Rules

**DO**:
- Read tasks.md to find the current task and its ID
- Implement ONE task at a time
- Use `clavix task-complete {task-id}` after completing each task
- Reference the PRD for detailed requirements
- Ask for clarification when tasks are ambiguous
- Run `clavix implement` again if interrupted to resume

**DON'T**:
- NEVER manually edit checkboxes in tasks.md
- Skip tasks or implement out of order
- Mark tasks complete before actually implementing them
- Assume what code to write - use PRD as source of truth
- Try to track task completion manually

## Task Blocking Protocol

**When a task is blocked** (cannot be completed), follow this protocol:

### Step 1: Detect Blocking Issues

Common blocking scenarios:
- **Missing dependencies**: API keys, credentials, external services not available
- **Unclear requirements**: Task description too vague or conflicts with PRD
- **External blockers**: Need design assets, content, or third-party integration not ready
- **Technical blockers**: Required library incompatible, environment issue, access problem
- **Resource blockers**: Need database, server, or infrastructure not yet set up

### Step 2: Immediate User Communication

**Stop implementation and ask user immediately:**
```
"Task blocked: [Task description]

Blocking issue: [Specific blocker, e.g., 'Missing Stripe API key for payment integration']

Options to proceed:
1. **Provide missing resource** - [What user needs to provide]
2. **Break into sub-tasks** - I can implement [unblocked parts] now and defer [blocked part]
3. **Skip for now** - Mark as [BLOCKED], continue with next task, return later

Which option would you like?"
```

### Step 3: Resolution Strategies

**Option A: User Provides Resource**
- Wait for user to provide (API key, design, clarification)
- Once provided, continue with task implementation

**Option B: Create Sub-Tasks** (preferred when possible)
- Identify what CAN be done without the blocker
- Break task into unblocked sub-tasks
- Example: "Implement payment integration" →
  - [x] Create payment service interface (can do now)
  - [ ] [BLOCKED: Need Stripe API key] Integrate Stripe SDK
  - [ ] Add payment UI components (can do now)
- Implement unblocked sub-tasks, mark blocked ones with [BLOCKED] tag

**Option C: Skip and Mark Blocked**
- Add [BLOCKED] tag to task in tasks.md: `- [ ] [BLOCKED: Missing API key] Task description`
- Note the blocker reason
- Move to next task
- Return to blocked tasks when unblocked

### Step 4: Track Blocked Tasks

**In tasks.md, use [BLOCKED] notation:**
```markdown
## Phase 2: Integration
- [x] Create API client structure
- [ ] [BLOCKED: Waiting for API endpoint spec] Implement data sync
- [ ] Add error handling for API calls
```

**At end of implement session:**
- List all blocked tasks
- Remind user what's needed to unblock each one
- Suggest next steps

### Common Blocking Scenarios & Resolutions

| Blocker Type | Detection | Resolution |
|--------------|-----------|------------|
| Missing API key/credentials | Code requires authentication | Ask user for credentials OR stub with mock for now |
| Vague requirements | Unclear what to implement | Ask specific questions OR propose implementation for approval |
| External dependency | Service/API not available | Create interface/mock OR skip and defer |
| Environment issue | Can't run/test code | Ask user to fix environment OR implement without testing (note risk) |
| Design/content missing | Need specific assets | Create placeholder OR wait for actual assets |

## Example Workflow

**CRITICAL WORKFLOW RULE:**
- Agent implements task → Agent runs `clavix task-complete` → Agent proceeds to next task
- User NEVER manually runs task-complete
- User NEVER manually edits tasks.md checkboxes
- This is an automated workflow, not a manual checklist

```
1. User runs: clavix implement
2. Command shows: "Next task (ID: phase-1-auth-1): Implement user authentication"
3. You (AI agent):
   - Read PRD authentication requirements
   - Implement auth logic
   - Write tests
   - Run: clavix task-complete phase-1-auth-1
   - Command automatically:
     • Marks task complete in tasks.md
     • Updates config tracking
     • Creates git commit (if enabled)
     • Shows next task
   - Continue with next task or wait for user
```

## Finding Task IDs

Task IDs are visible in several places:
1. When you read `tasks.md` - they're in the format `phase-X-name-Y`
2. In the config file (`.clavix-implement-config.json`) under `currentTask.id`
3. When running `clavix implement` - shown next to task description

Example tasks.md structure:
```markdown
## Phase 1: Authentication

- [ ] Implement user registration (ref: User Management)
  Task ID: phase-1-authentication-1

- [ ] Add JWT token generation (ref: User Management)
  Task ID: phase-1-authentication-2
```

To find the task ID programmatically, read tasks.md and look for the pattern `phase-{number}-{sanitized-phase-name}-{counter}`.

## Workflow Navigation

**You are here:** Implement (Task Execution)

**Common workflows:**
- **Full workflow**: `/clavix:plan` → `/clavix:implement` → [execute all tasks] → `/clavix:archive`
- **Resume work**: `/clavix:implement` → Continue from last incomplete task
- **Iterative**: `/clavix:implement` → [complete task] → [pause] → `/clavix:implement` → [continue]

**Related commands:**
- `/clavix:plan` - Generate/regenerate task breakdown (previous step)
- `/clavix:archive` - Archive completed project (final step)
- `/clavix:prd` - Review PRD for context during implementation

## Tips

- The implementation is meant to be iterative and collaborative
- User can pause/resume at any time
- Tasks are designed to be atomic and independently implementable
- Use the PRD as the authoritative source for "what to build"
- Use tasks.md as the guide for "in what order"

## Troubleshooting

### Issue: `.clavix-implement-config.json` not found
**Cause**: User hasn't run `clavix implement` CLI command first
**Solution** (inline):
- Error: "Config file not found. Run `clavix implement` first to initialize"
- CLI creates config and shows first task
- AI agent should wait for config before proceeding

### Issue: `clavix task-complete` command not found
**Cause**: Clavix version doesn't have task-complete command OR not in PATH
**Solution**:
- Check Clavix version: `clavix --version`
- Ensure Clavix is up to date: `npm install -g clavix@latest`
- If issue persists, report bug to Clavix maintainers

### Issue: Task ID not found by task-complete
**Cause**: Task ID doesn't match what's in tasks.md
**Solution**:
- Read tasks.md to see actual task IDs
- Task IDs follow pattern: `{sanitized-phase-name}-{counter}`
- Run `clavix task-complete` without arguments to see available tasks
- Example: `phase-1-authentication-1` not `Phase 1 Authentication 1`

### Issue: Task already marked complete
**Cause**: Task was completed in previous session or manually
**Solution**:
- Use `--force` flag: `clavix task-complete {task-id} --force`
- Or skip to next task shown by `clavix implement`
- Config will be updated to track the completion

### Issue: Cannot find next incomplete task in tasks.md
**Cause**: All tasks completed OR tasks.md corrupted
**Solution**:
- Check if all tasks are `[x]` - if yes, congratulate completion!
- Suggest `/clavix:archive` for completed project
- If tasks.md corrupted, ask user to review/regenerate

### Issue: Task description unclear or conflicts with PRD
**Cause**: Task breakdown was too vague or PRD changed
**Solution** (inline - covered by Task Blocking Protocol):
- Stop and ask user for clarification
- Reference PRD section if mentioned
- Propose interpretation for user approval
- Update task description in tasks.md after clarification

### Issue: Git commit fails (wrong strategy, hook error, etc.)
**Cause**: Git configuration issue or commit hook failure
**Solution**:
- Show error to user
- Suggest checking git status manually
- Ask if should continue without commit or fix issue first
- Note: Commits are convenience, not blocker - can proceed without

### Issue: Multiple [BLOCKED] tasks accumulating
**Cause**: Dependencies or blockers not being resolved
**Solution**:
- After 3+ blocked tasks, pause and report to user
- List all blockers and what's needed to resolve
- Ask user to prioritize: unblock tasks OR continue with unblocked ones
- Consider if project should be paused until blockers cleared

### Issue: Task completed but tests failing
**Cause**: Implementation doesn't meet requirements
**Solution**:
- Do NOT mark task as complete if tests fail
- Fix failing tests before marking [x]
- If tests are incorrectly written, fix tests first
- Task isn't done until tests pass

### Issue: Implementing in wrong order (skipped dependencies)
**Cause**: AI agent or user jumped ahead
**Solution**:
- Stop and review tasks.md order
- Check if skipped task was a dependency
- Implement missed dependency first
- Follow sequential order unless explicitly instructed otherwise
