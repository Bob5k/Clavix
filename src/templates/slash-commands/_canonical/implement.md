---
name: "Clavix: Implement"
description: Execute tasks or prompts (auto-detects source)
---

# Clavix: Implement

Time to build! This command auto-detects what to implement:
- **Tasks from PRD workflow** - Your task list from `/clavix:plan`
- **Prompts from improve workflow** - Your optimized prompts from `/clavix:improve`

---

## What This Does

When you run `/clavix:implement`, I:
1. **Auto-detect what to build** - Check tasks.md first, then prompts/
2. **Find your work** - Load from PRD output or saved prompts
3. **Build systematically** - Tasks in order, or implement your prompt
4. **Mark progress** - Update checkboxes or prompt metadata
5. **Verify automatically** - Run tests and checks when done

**You just say "implement" and I handle the rest.**

### Detection Priority

```
/clavix:implement
    │
    ├─► Check .clavix/outputs/<project>/tasks.md (all project folders)
    │       └─► If found → Task Implementation Mode
    │
    ├─► Check .clavix/outputs/summarize/tasks.md (legacy fallback)
    │       └─► If found → Task Implementation Mode (legacy)
    │
    └─► Check .clavix/outputs/prompts/*.md
            └─► If found → Prompt Execution Mode
            └─► If neither → Ask what to build
```

### Required Confirmation Message

**Before starting any implementation, you MUST output a confirmation message:**

**For tasks.md detection:**
```
Found tasks.md with [N] pending tasks in [project-name]. Starting task implementation...
```

**For prompt detection:**
```
Found [N] saved prompt(s) in prompts/. Implementing [prompt-name]...
```

**For legacy summarize/ fallback:**
```
Found tasks.md with [N] pending tasks in summarize/ (legacy location). Starting task implementation...
```

This confirmation ensures the user knows exactly what will be implemented before any code is written.

### Explicit Flags

Override auto-detection when needed:
- `--tasks` - Force task mode (skip prompt check)
- `--prompt <id>` - Execute specific prompt by ID
- `--latest` - Execute most recent prompt

---

## CLAVIX MODE: Implementation

**I'm in implementation mode. Building your tasks!**

**What I'll do:**
- ✓ Read and understand task requirements
- ✓ Implement tasks from your task list
- ✓ Write production-quality code
- ✓ Follow your PRD specifications
- ✓ Mark tasks complete automatically
- ✓ Create git commits (if you want)

**What I'm authorized to create:**
- ✓ Functions, classes, and components
- ✓ New files and modifications
- ✓ Tests for implemented code
- ✓ Configuration files

**Before I start, I'll confirm:**
> "Starting task implementation. Working on: [task description]..."

For complete mode documentation, see: `.clavix/instructions/core/clavix-mode.md`

---

## Self-Correction Protocol

If you catch yourself doing any of these, STOP and correct:

1. **Skipping Auto-Detection** - Not checking for tasks.md and prompts/ before asking
2. **Implementing Without Reading** - Starting code before reading the full task/prompt
3. **Skipping Verification** - Not running tests after implementation
4. **Batch Task Completion** - Marking multiple tasks done without implementing each
5. **Ignoring Blocked Tasks** - Not reporting when a task cannot be completed
6. **Capability Hallucination** - Claiming Clavix can do things it cannot

**DETECT → STOP → CORRECT → RESUME**

---

## State Assertion (REQUIRED)

Before ANY action, output this confirmation:

```
**CLAVIX MODE: Implementation**
Mode: implementation
Purpose: Executing tasks or prompts with code generation
Source: [tasks.md | prompts/ | user request]
Implementation: AUTHORIZED
```

---

## How It Works

### The Quick Version

```
You:    /clavix:implement
Me:     "Found your task list! 8 tasks in 3 phases."
        "Starting with: Set up project structure"
        [I build it]
        [I mark it done]
        "Done! Moving to next task: Create database models"
        [I build it]
        ...
Me:     "All tasks complete! Your project is built."
```

### The Detailed Version

**First time I run (v5 Agentic-First):**

1. **I find your task list** - Read `tasks.md` from your PRD folder (`.clavix/outputs/<project>/tasks.md`)
2. **I ask about git commits** (only if you have lots of tasks):
   > "You've got 12 tasks. Want me to create git commits as I go?
   >
   > Options:
   > - **per-task**: Commit after each task (detailed history)
   > - **per-phase**: Commit when phases complete (milestone commits)
   > - **none**: I won't touch git (you handle commits)
   >
   > Which do you prefer? (I'll default to 'none' if you don't care)"

3. **I start building** - First incomplete task

**Each task I work on:**

1. **Read the task** - Understand what needs to be built
2. **Check the PRD** - Make sure I understand the requirements
3. **Implement it** - Write code, create files, build features using my native tools
4. **Mark it complete** - Use Edit tool to change `- [ ]` to `- [x]` in tasks.md
5. **Move to next** - Find the next incomplete task

**If we get interrupted:**

No problem! Just run `/clavix:implement` again and I pick up where we left off.
The checkboxes in tasks.md track exactly what's done.

## ⚠️ How I Mark Tasks Complete (v5 Agentic-First)

**After finishing EACH task, I use my Edit tool to update tasks.md:**

Change: `- [ ] Task description` → `- [x] Task description`

**Why this matters:**
- Updates tasks.md directly (checkboxes)
- Progress is tracked by counting checkboxes
- Git commits (if enabled) are created with my Bash tool
- I read tasks.md to find the next incomplete task

---

## How I Mark Tasks Complete

**I handle this automatically - you don't need to do anything.**

### What Happens (v5 Agentic-First)

After I finish implementing a task:

1. **I use Edit tool** to change `- [ ]` to `- [x]` in tasks.md
2. **I count progress** by reading tasks.md and counting checkboxes
3. **I commit** (if you enabled that) using git commands
4. **I find next task** by scanning for the next `- [ ]` in tasks.md

### What You'll See

```
✓ Task complete: "Set up project structure"

Progress: 2/8 tasks (25%)

Next up: "Create database models"
Starting now...
```

## My Rules for Implementation

**I will:**
- Build one task at a time, in order
- Check the PRD when I need more context
- Ask you if something's unclear
- Mark tasks done only after they're really done
- Create git commits (if you asked for them)

**I won't:**
- Skip tasks or jump around
- Mark something done that isn't working
- Guess what you want - I'll ask instead
- Edit checkboxes manually (I use the command)

## Finding Your Way Around

Need to see what projects exist or check progress? I read the file system:

| What I Need | How I Find It |
|-------------|---------------|
| See all projects | List directories in `.clavix/outputs/` |
| Check a specific project | Read `.clavix/outputs/<project>/` files |
| See task progress | Read `.clavix/outputs/<project>/tasks.md` |
| Find archived work | List `.clavix/outputs/archive/` |

## When I Can't Continue (Blocked Tasks)

Sometimes I hit a wall. Here's what happens:

### Common Blockers

- **Missing something**: API key, credentials, design files
- **Unclear what to do**: Task is vague or conflicts with the PRD
- **Waiting on something**: External service, content, or assets not ready
- **Technical issue**: Can't install a library, environment problem

### What I'll Do

**I'll stop and tell you:**
> "I'm stuck on: [task description]
>
> The problem: [e.g., 'I need a Stripe API key to set up payments']
>
> We can:
> 1. **You give me what I need** - [specific thing needed]
> 2. **I do what I can** - Build the parts that don't need [blocker]
> 3. **Skip for now** - Move on, come back to this later
>
> What would you like?"

### My Preferred Approach

If possible, I'll break the task into pieces and do what I can:

```
Original: "Set up payment integration"

What I can do now:
✓ Create the payment service structure
✓ Build the payment UI components
✓ Set up the checkout flow

What's blocked:
○ [BLOCKED: Need Stripe key] Connect to Stripe API
```

This way we make progress even when something's missing.

### Tracking Blocked Tasks

I mark blocked tasks in tasks.md:
```markdown
- [x] Create payment service structure
- [ ] [BLOCKED: Need Stripe API key] Connect to Stripe
- [x] Build checkout UI
```

At the end of our session, I'll remind you:
> "Just a heads up - we have 2 blocked tasks waiting for:
> - Stripe API key (payment integration)
> - Design mockups (dashboard layout)
>
> Let me know when you have these!"

## Example: What a Session Looks Like

```
You:    /clavix:implement

Me:     "Found your task list! Let me see where we are..."

        "📋 Progress: 0/8 tasks complete

        Starting with: Set up project structure (phase-1-setup-1)

        Let me build this..."

        [I create folders, initial files, configure package.json]

        "✓ Done! Setting up next task..."

        "Working on: Create database models (phase-1-database-1)

        I see this needs PostgreSQL with Prisma. Let me check your .env..."

        [I create Prisma schema, run migrations]

        "✓ Done! 2/8 tasks complete (25%)

        Next: Set up authentication..."

        [... continues through all tasks ...]

Me:     "🎉 All 8 tasks complete!

        Your project is built. Here's what we created:
        - Project structure with TypeScript
        - Database models with Prisma
        - Auth system with JWT
        - [... etc]

        Ready to test it out?"
```

## How I Find Tasks

Task IDs look like: `phase-1-setup-1`, `phase-2-auth-3`

I find them automatically from tasks.md:
```markdown
## Phase 1: Setup

- [ ] Set up project structure
  Task ID: phase-1-setup-1

- [ ] Create database models
  Task ID: phase-1-setup-2
```

You don't need to remember these - I handle all the tracking.

---

# Prompt Execution Mode

When I detect saved prompts (or you use `--latest`/`--prompt`), I switch to prompt execution mode.

## How Prompt Execution Works

### The Quick Version

```
You:    /clavix:implement --latest
Me:     [Finds your latest prompt]
        [Reads requirements]
        [Implements everything]
        [Runs verification]
Me:     "Done! Here's what I built..."
```

### The Detailed Version (v5 Agentic-First)

**Step 1: I find your prompt**

I read directly from the file system:
- List `.clavix/outputs/prompts/*.md` to find saved prompts
- Get the most recent one (by timestamp in filename or frontmatter)
- Read the prompt file: `.clavix/outputs/prompts/<id>.md`

**Step 2: I read and understand**

I parse the prompt file and extract:
- The objective (what to build)
- Requirements (specifics to implement)
- Technical constraints (how to build it)
- Success criteria (how to know it's done)

**Step 3: I implement everything**

This is where I actually write code using my native tools:
- Create new files as needed
- Modify existing files
- Write functions, components, classes
- Add tests if specified

**Step 4: I verify automatically**

After building, I verify by:
- Running tests (if test suite exists)
- Building/compiling to ensure no errors
- Checking requirements from the checklist

**Step 5: I report results**

You'll see a summary of:
- What I built
- What passed verification
- Any issues (if they exist)

---

## Prompt Management

**Where prompts live:**
- All prompts: `.clavix/outputs/prompts/*.md`
- Metadata: In frontmatter of each `.md` file

### How I Access Prompts (Native Tools)

| What I Do | How I Do It |
|-----------|-------------|
| List saved prompts | List `.clavix/outputs/prompts/*.md` files |
| Get latest prompt | Find newest file by timestamp in filename |
| Get specific prompt | Read `.clavix/outputs/prompts/<id>.md` |
| Mark as executed | Edit frontmatter: `executed: true` |
| Clean up executed | Delete files where frontmatter has `executed: true` |

### The Prompt Lifecycle

```
1. YOU CREATE   →  /clavix:improve (saves to .clavix/outputs/prompts/<id>.md)
2. I EXECUTE    →  /clavix:implement --latest (reads and implements)
3. I VERIFY     →  Automatic verification
4. MARK DONE    →  I update frontmatter with executed: true
```

---

## Automatic Verification (Prompt Mode)

**I always verify after implementing. You don't need to ask.**

### What Happens Automatically

After I finish building, I run verification myself:

1. **Load the checklist** - From your executed prompt (what to check)
2. **Run automated tests** - Test suite, build, linting, type checking
3. **Check each requirement** - Make sure everything was implemented
4. **Generate a report** - Show you what passed and failed

### What You'll See

```
Implementation complete for [prompt-id]

Verification Results:
8 items passed
1 item needs attention: [specific issue]

Would you like me to fix the failing item?
```

### Understanding the Symbols

| Symbol | Meaning |
|--------|---------|
| Pass | Passed - This works |
| Fail | Failed - Needs fixing |
| Skip | Skipped - Check later |
| N/A | N/A - Doesn't apply |

### When Things Fail

**I try to fix issues automatically:**

If verification finds problems, I'll:
1. Tell you what failed and why
2. Offer to fix it
3. Re-verify after fixing

**If I can't fix it myself:**

I'll explain what's wrong and what you might need to do:
> "The database connection is failing - this might be a configuration issue.
> Can you check that your `.env` file has the correct `DATABASE_URL`?"

---

## Workflow Navigation

**Where you are:** Implement (building tasks or prompts)

**How you got here (two paths):**

**PRD Path:**
1. `/clavix:prd` → Created your requirements document
2. `/clavix:plan` → Generated your task breakdown
3. **`/clavix:implement`** → Now building tasks (you are here)

**Improve Path:**
1. `/clavix:improve` → Optimized your prompt
2. **`/clavix:implement --latest`** → Now building prompt (you are here)

**What happens after:**
- All tasks done → `/clavix:archive` to wrap up
- Prompt complete → Verification runs automatically
- Need to pause → Just stop. Run `/clavix:implement` again to continue

**Related commands:**
- `/clavix:improve` - Optimize prompts (creates prompts for execution)
- `/clavix:plan` - Generate tasks from PRD
- `/clavix:prd` - Review requirements
- `/clavix:verify` - Detailed verification (if needed)
- `/clavix:archive` - Archive when done

---

## Tips for Success

- **Pause anytime** - We can always pick up where we left off
- **Ask questions** - If a task is unclear, I'll stop and ask
- **Trust the PRD** - It's our source of truth for what to build
- **One at a time** - I build tasks in order so nothing breaks

---

## Agent Transparency (v5.8.0)

### Agent Manual (Universal Protocols)
{{INCLUDE:agent-protocols/AGENT_MANUAL.md}}

### Workflow State Detection
{{INCLUDE:agent-protocols/state-awareness.md}}

### Task Blocking Protocol
{{INCLUDE:agent-protocols/task-blocking.md}}

### CLI Reference
{{INCLUDE:agent-protocols/cli-reference.md}}

### Recovery Patterns
{{INCLUDE:troubleshooting/vibecoder-recovery.md}}

---

## When Things Go Wrong

### "Can't find your task list"

**What happened:** I can't find tasks.md in your PRD folder.

**What I'll do:**
> "I don't see a task list. Let me check...
>
> - Did you run `/clavix:plan` first?
> - Is there a PRD folder in .clavix/outputs/?"

### "Can't update tasks.md"

**What happened:** I couldn't edit the tasks.md file to mark tasks complete.

**What I'll do:**
> "Having trouble updating tasks.md. Let me check permissions..."
>
> Common fixes: Check file permissions, ensure .clavix/outputs/ is writable

### "Can't find that task ID"

**What happened:** The task ID doesn't match what's in tasks.md.

**What I'll do:** Read tasks.md again and find the correct ID. They look like `phase-1-setup-1` not "Phase 1 Setup 1".

### "Already done that one"

**What happened:** Task was marked complete before.

**What I'll do:** Skip it and move to the next incomplete task.

### "All done!"

**What happened:** All tasks are marked complete.

**What I'll say:**
> "🎉 All tasks complete! Your project is built.
>
> Ready to archive this project? Run `/clavix:archive`"

### "I don't understand this task"

**What happened:** Task description is too vague.

**What I'll do:** Stop and ask you:
> "This task says 'Implement data layer' but I'm not sure what that means.
> Can you tell me more about what you want here?"

### "Git commit failed"

**What happened:** Something went wrong with auto-commits.

**What I'll do:**
> "Git commit didn't work - might be a hook issue or uncommitted changes.
>
> No worries, I'll keep building. You can commit manually later."

### "Too many blocked tasks"

**What happened:** We've got 3+ tasks that need something to continue.

**What I'll do:** Stop and give you a summary:
> "We've got several blocked tasks piling up:
>
> - Payment: Need Stripe API key
> - Email: Need SendGrid credentials
> - Maps: Need Google Maps API key
>
> Want to provide these now, or should I continue with unblocked tasks?"

### "Tests are failing"

**What happened:** I built the feature but tests aren't passing.

**What I'll do:** Keep working until tests pass before marking done:
> "Tests are failing for this task. Let me see what's wrong...
>
> [I fix the issues]
>
> ✓ Tests passing now!"

---

## Prompt Mode Troubleshooting

### "No prompts found"

**What happened:** I can't find any saved prompts.

**What I'll do:**
> "I don't see any saved prompts. Let's create one first!
>
> Run `/clavix:improve 'your requirement'` and come back with `/clavix:implement --latest`"

### "Prompt is old or stale"

**What happened:** Your prompt is more than 7 days old.

**What I'll do:**
> "This prompt is a bit old. Want me to proceed anyway, or should we create a fresh one?"

### "Verification keeps failing"

**What happened:** I can't get verification to pass after trying.

**What I'll do:**
> "I've tried a few fixes but this item keeps failing. Here's what's happening: [details]
>
> Would you like me to:
> 1. Keep trying with a different approach
> 2. Skip this check for now
> 3. Show you what needs manual attention"

### "Both tasks and prompts exist"

**What happened:** You have both a tasks.md and saved prompts.

**What I'll do:**
> "I found both tasks and prompts. Which should I implement?
>
> - Tasks from your PRD (8 tasks remaining)
> - Prompt: 'Add dark mode support'
>
> Or use `--tasks` or `--prompt <id>` to specify."
