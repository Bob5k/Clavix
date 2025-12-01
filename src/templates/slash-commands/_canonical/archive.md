---
name: "Clavix: Archive"
description: Archive completed PRD projects
---

# Clavix: Archive Your Completed Work

Done with a project? I'll move it to the archive to keep your workspace tidy. You can always restore it later if needed.

---

## What This Does

When you run `/clavix:archive`, I:
1. **Find your completed projects** - Look for 100% done PRDs
2. **Ask which to archive** - You pick, or I archive all completed ones
3. **Move to archive folder** - Out of the way but not deleted
4. **Track everything** - So you can restore later if needed

**Your work is never deleted, just organized.**

---

## CLAVIX MODE: Archival

**I'm in archival mode. Organizing your completed work.**

**What I'll do:**
- ✓ Find projects ready for archive
- ✓ Show you what's complete (100% tasks done)
- ✓ Move projects to archive when you confirm
- ✓ Track everything so you can restore later

**What I won't do:**
- ✗ Delete anything without explicit confirmation
- ✗ Archive projects you're still working on (unless you use --force)
- ✗ Make decisions for you - you pick what to archive

---

## Self-Correction Protocol

If you catch yourself doing any of these, STOP and correct:

1. **Deleting Without Confirmation** - Must get explicit user confirmation for deletes
2. **Archiving Incomplete Projects** - Should warn if tasks.md has unchecked items
3. **Wrong Directory Operations** - Operating on wrong project directory
4. **Skipping Safety Checks** - Not verifying project exists before operations
5. **Silent Failures** - Not reporting when operations fail
6. **Capability Hallucination** - Claiming Clavix can do things it cannot

**DETECT → STOP → CORRECT → RESUME**

---

## State Assertion (REQUIRED)

Before ANY action, output this confirmation:

```
**CLAVIX MODE: Archival**
Mode: management
Purpose: Organizing completed projects
Implementation: BLOCKED (file operations only)
```

---

## How I Archive Projects (v5 Agentic-First)

**I use my native tools directly - no CLI commands involved.**

**Tools I use:**
- **Read tool**: To read tasks.md and check completion status
- **Bash/Move**: To move directories (`mv source dest`)
- **Bash/Remove**: To delete directories (`rm -rf path`) - only with explicit confirmation
- **Glob/List**: To list projects and archive contents

### What I Do

| What You Want | How I Do It |
|---------------|-------------|
| Archive completed project | Move directory: `.clavix/outputs/<project>` → `.clavix/outputs/archive/<project>` |
| Archive incomplete work | Same, with your confirmation |
| Delete permanently | Remove directory: `rm -rf .clavix/outputs/<project>` |
| See what's archived | List files in `.clavix/outputs/archive/` |
| Restore from archive | Move back: `.clavix/outputs/archive/<project>` → `.clavix/outputs/<project>` |

### Before I Archive

I check:
- ✓ Projects exist in `.clavix/outputs/`
- ✓ Task completion status (read tasks.md)
- ✓ What you want to do (archive, delete, restore)
- ✓ Project name is correct

### After Archiving

I verify the operation completed and ask what you want to do next:

**Verification:**
- Confirm the project was moved/deleted
- Show the new location (for archive) or confirm removal (for delete)
- List any related files that may need cleanup

**I then ask:** "What would you like to do next?"
- Start a new project with `/clavix:prd`
- Archive another completed project
- Review archived projects
- Return to something else

### Part B: Understanding Archive Operations

**Archive Operations** (I perform these using my native tools):

1. **Interactive Archive**:
   - I list all PRD projects in `.clavix/outputs/`
   - I check which have 100% tasks completed
   - You select which to archive
   - I move the project to `.clavix/outputs/archive/`

2. **Archive Specific Project**:
   - I check task completion status in `tasks.md`
   - I warn if tasks are incomplete
   - You confirm
   - I move the project directory

3. **Force Archive (Incomplete Tasks)**:
   Use when:
   - Project scope changed and some tasks are no longer relevant
   - User wants to archive work-in-progress
   - Tasks are incomplete but project is done

4. **Delete Project (Permanent Removal)**: **DESTRUCTIVE ACTION**

   **WARNING**: This PERMANENTLY deletes the project. Cannot be restored.

   **When to delete vs archive:**
   - **DELETE**: Failed experiments, duplicate projects, test/demo data, abandoned prototypes with no value
   - **ARCHIVE**: Completed work, incomplete but potentially useful work, anything you might reference later

   **Delete decision tree:**
   ```
   Is this a failed experiment with no learning value? → DELETE
   Is this a duplicate/test project with no unique info? → DELETE
   Might you need to reference this code later? → ARCHIVE
   Could this be useful for learning/reference? → ARCHIVE
   Are you unsure? → ARCHIVE (safe default)
   ```

   **Safety confirmation required:**
   - I show project details and task status
   - I ask you to type project name to confirm
   - I warn about permanent deletion
   - I list what will be permanently deleted

5. **List Archived Projects**:
   I read the contents of `.clavix/outputs/archive/` and show you all archived projects.

6. **Restore from Archive**:
   I move a project back: `.clavix/outputs/archive/<project>` → `.clavix/outputs/<project>`

## When to Archive

**Good times to archive:**
- All implementation tasks are completed (`tasks.md` shows 100%)
- Project has been deployed/shipped to production
- Feature is complete and no more work planned
- User explicitly requests archival
- Old/abandoned projects that won't be continued

**Don't archive when:**
- Tasks are still in progress (unless using --force)
- Project is actively being worked on
- Future enhancements are planned in current tasks

## Archive Behavior

**What gets archived:**
- The entire PRD project folder
- All files: PRD.md, PRD-quick.md, tasks.md, .clavix-implement-config.json
- Complete directory structure preserved

**Where it goes:**
- From: `.clavix/outputs/[project-name]/`
- To: `.clavix/outputs/archive/[project-name]/`

**What changes:**
- Archived projects won't show in `/clavix:plan` searches
- Archived projects won't show in `/clavix:implement` searches
- They're still accessible in archive directory
- Can be restored at any time

## Prompts Are Separate

Optimized prompts from `/clavix:improve` are stored separately in `.clavix/outputs/prompts/`.

**Prompts are NOT archived with PRD projects.**

**To manage prompts:**
- **View all prompts**: List `.clavix/outputs/prompts/*.md` files
- **View a prompt**: Read `.clavix/outputs/prompts/<id>.md`
- **Delete executed prompts**: Remove files where frontmatter has `executed: true`
- **Delete stale prompts**: Remove files older than 30 days (check timestamp in frontmatter)

**Prompts lifecycle:**
- Independent from PRD lifecycle
- Managed by reading/writing files directly
- Clean up manually when project complete

## Example Workflows

### Workflow 1: Complete Project
```
User: "I've finished implementing the user authentication feature"
You: "Great! Let me check the task status and help you archive it."

I read: .clavix/outputs/user-authentication-system/tasks.md
Result: All 15 tasks completed (100%)

You confirm: Yes, archive it

I execute: mv .clavix/outputs/user-authentication-system .clavix/outputs/archive/

Result: Project archived to .clavix/outputs/archive/user-authentication-system/
```

### Workflow 2: Force Archive WIP
```
User: "We're pivoting, I want to archive the old API design even though tasks aren't done"
You: "I'll check the status and archive it if you confirm."

I read: .clavix/outputs/old-api-design/tasks.md
Result: 8 incomplete tasks

User confirms: Yes, archive anyway

I execute: mv .clavix/outputs/old-api-design .clavix/outputs/archive/

Result: Project archived despite incomplete tasks
```

### Workflow 3: Restore Archived Project
```
User: "Actually, we need to revisit that authentication feature"
You: "I'll restore it from the archive."

I execute: mv .clavix/outputs/archive/user-authentication-system .clavix/outputs/

Result: Project restored to .clavix/outputs/user-authentication-system/
```

### Workflow 4: Delete Failed Experiment
```
User: "I have a test project 'api-experiment-1' that I don't need anymore"
You: "Is this something you might reference later, or can it be permanently deleted?"

User: "It was just a quick test, no value. Delete it."
You: "This will permanently delete the project. Please confirm by typing the project name."

I show:
  Project: api-experiment-1
  Tasks: 3/5 completed
  Files: full-prd.md, quick-prd.md, tasks.md

  WARNING: This action is PERMANENT and CANNOT be undone.

User types: api-experiment-1

I execute: rm -rf .clavix/outputs/api-experiment-1

Result: Project permanently deleted
```

---

## Agent Transparency (v5.7.1)

### Agent Manual (Universal Protocols)
{{INCLUDE:agent-protocols/AGENT_MANUAL.md}}

### CLI Reference
{{INCLUDE:agent-protocols/cli-reference.md}}

### Recovery Patterns
{{INCLUDE:troubleshooting/vibecoder-recovery.md}}

## Workflow Navigation

**You are here:** Archive (Project Cleanup)

**Common workflows:**
- **Complete workflow**: `/clavix:implement` → [all tasks done] → `/clavix:archive` → Clean workspace
- **Review and archive**: `/clavix:archive` → [select completed project] → Archive
- **Restore old work**: `/clavix:archive --list` → `/clavix:archive --restore [project]` → Resume

**Related commands:**
- `/clavix:implement` - Complete remaining tasks before archiving
- `/clavix:plan` - Review task completion status
- `/clavix:prd` - Start new project after archiving old one

## Archive Size Management

**Proactive maintenance to prevent archive bloat:**

**When to clean up the archive:**
- Archive exceeds 50 projects (or 100MB)
- Projects older than 12 months that haven't been referenced
- Duplicate or superseded projects
- Failed experiments with no learning value

**Size check (run periodically):**
```bash
# Count archived projects
ls .clavix/outputs/archive/ | wc -l

# Check total archive size
du -sh .clavix/outputs/archive/
```

**Cleanup workflow:**
1. List all archived projects with dates: `ls -lt .clavix/outputs/archive/`
2. Identify candidates for deletion (failed experiments, duplicates, ancient projects)
3. For each candidate, confirm zero future value
4. Delete only with explicit confirmation

**Archive retention recommendations:**
| Project Type | Keep For | Then |
|--------------|----------|------|
| Completed features | Indefinitely | Archive forever (reference value) |
| Failed experiments | 30 days | Delete if no learning value |
| Superseded versions | 90 days | Delete if newer version exists |
| Test/demo projects | 7 days | Delete unless documenting patterns |

## Tips

- Archive keeps your active projects list clean and focused
- Archived projects maintain all their data (nothing is deleted)
- Archive is searchable - you can still `grep` or find files in archive/
- Regular archiving keeps `.clavix/outputs/` organized
- Check `.clavix/outputs/archive/` to see what's been archived
- Review archive size quarterly to avoid unbounded growth

## Troubleshooting

### Issue: No projects available to archive
**Cause**: No projects in `.clavix/outputs/` OR all already archived

**How I handle it**:
1. Read `.clavix/outputs/` directory
2. If directory doesn't exist: "No PRD projects found. Create one with `/clavix:prd`"
3. If empty: Check `.clavix/outputs/archive/` for archived projects
4. Communicate: "All projects are already archived" or "No projects exist yet"

### Issue: Trying to archive project with incomplete tasks
**Cause**: User wants to archive but tasks aren't 100% done

**How I handle it**:
1. I read tasks.md and count incomplete tasks
2. Ask user: "Project has X incomplete tasks. Do you want to:
   - Complete tasks first with `/clavix:implement`
   - Archive anyway (tasks remain incomplete but archived)
   - Cancel archival"
3. If user confirms: I move the directory
4. If scope changed: Explain force archive is appropriate

### Issue: Cannot restore archived project (name conflict)
**Cause**: Project with same name already exists in active outputs

**How I handle it**:
1. I detect the conflict when checking the target directory
2. Ask user which option:
   - Archive the active project first, then restore old one
   - Keep both (manual rename required)
   - Cancel restoration
3. Execute user's choice

### Issue: Unsure whether to delete or archive
**Cause**: User wants to clean up but uncertain about permanence

**How I handle it**:
1. Use decision tree to guide user:
   - "Is this a failed experiment with no learning value?"
   - "Might you need to reference this code later?"
   - "Are you unsure if it's valuable?"
2. Default recommendation: **ARCHIVE** (safer, reversible)
3. Only suggest DELETE for: duplicates, failed experiments, test data with zero value
4. Remind: "Archive is free, disk space is cheap, regret is expensive"

### Issue: File operation fails
**Cause**: File system permissions, missing directory, or process error

**How I handle it**:
1. Check error output
2. Common fixes:
   - Check `.clavix/outputs/` exists and is writable
   - Verify project name is correct (no typos)
   - Check if another process is accessing the files
3. Retry the operation or inform user about permissions

### Issue: Accidentally deleted project
**Cause**: User error

**How I handle it**:
1. Acknowledge: "Project was permanently deleted"
2. Check recovery options:
   - "If code was committed to git, we can recover from git history"
   - "Check if you have local backups"
   - "Check if IDE has local history (VS Code, JetBrains)"
3. Prevention: "Going forward, use ARCHIVE by default. Only DELETE when absolutely certain."

### Issue: Archive directory getting too large
**Cause**: Many archived projects accumulating

**How I handle it**:
1. Explain: "Archive is designed to grow - this is normal behavior"
2. Archived projects don't affect workflow performance
3. If user concerned:
   - List archive contents
   - Identify ancient/irrelevant projects
   - Delete only truly obsolete ones
   - Or suggest external backup for very old projects

### Issue: Archived project but forgot what it was about
**Cause**: No naming convention or time passed

**How I handle it**:
1. Read the PRD: `.clavix/outputs/archive/[project-name]/full-prd.md`
2. Summarize: Problem, Goal, Features from PRD
3. Suggest: Better naming conventions going forward
   - Example: `2024-01-user-auth` (date-feature format)
   - Example: `ecommerce-checkout-v2` (project-component format)
