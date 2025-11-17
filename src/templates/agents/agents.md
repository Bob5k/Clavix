# Clavix Workflows (Universal)

Use these instructions when your agent can only read documentation (no slash-command support).

## Quick start
- Install globally: `npm install -g clavix`
- Or run ad hoc: `npx clavix@latest init`
- Verify installation: `clavix version`

## Command reference

| Command | Purpose |
| --- | --- |
| `clavix init` | Interactive setup. Select providers and generate documentation/command files. |
| `clavix fast "<prompt>"` | CLEAR (C/L/E) analysis with improved prompt output. Auto-saves to `.clavix/outputs/prompts/fast/`. |
| `clavix deep "<prompt>"` | Full CLEAR (C/L/E/A/R) analysis, alternative variations, validation checklists. Auto-saves to `.clavix/outputs/prompts/deep/`. |
| `clavix execute [--latest]` | Execute saved prompts from fast/deep optimization. Interactive selection or `--latest` for most recent. |
| `clavix prompts list` | View all saved prompts with status (NEW, EXECUTED, OLD, STALE) and storage statistics. |
| `clavix prompts clear` | Manage prompt cleanup. Supports `--executed`, `--stale`, `--fast`, `--deep`, `--all` flags. |
| `clavix prd` | Guided Socratic questions that generate `full-prd.md` and `quick-prd.md`. |
| `clavix plan` | Transform PRDs or sessions into phase-based `tasks.md`. |
| `clavix implement [--commit-strategy=<type>]` | Start task execution. Git strategies: per-task, per-5-tasks, per-phase, none (default: none). |
| `clavix start` | Begin conversational capture session for requirements gathering. |
| `clavix summarize [session-id]` | Extract mini PRD and optimized prompts from saved sessions. |
| `clavix list` | List sessions and/or output projects (`--sessions`, `--outputs`, filters). |
| `clavix show [session-id]` | Inspect session details or use `--output <project>` to view outputs. |
| `clavix archive [project]` | Archive completed projects or restore them (`--restore`). |
| `clavix config [get|set|edit|reset]` | Manage `.clavix/config.json` preferences. |
| `clavix update` | Refresh managed docs and slash commands (supports `--docs-only`, `--commands-only`). |
| `clavix version` | Print installed version. |

## Typical workflows
- **Improve prompts quickly:** run `clavix fast` or `clavix deep` depending on complexity.
- **Create strategy:** run `clavix prd` then `clavix plan` for an implementation checklist.
- **Execute tasks:** use `clavix implement [--commit-strategy=<type>]`, commit work, repeat until tasks complete.
- **Capture conversations:** record with `clavix start`, extract with `clavix summarize`.
- **Stay organized:** inspect with `clavix list/show`, archive with `clavix archive`, refresh docs via `clavix update`.

## Implementation with Git Strategy (Agent Workflow)

When implementing tasks with `clavix implement`:

1. **Check task count**: Read `tasks.md` and count phases
2. **Ask user for git preferences** (optional, only if >3 phases):
   ```
   "I notice this implementation has [X] phases with [Y] tasks.

   Git auto-commit preferences?
   - per-task: Commit after each task (detailed history)
   - per-5-tasks: Commit every 5 tasks (balanced)
   - per-phase: Commit when phase completes (milestones)
   - none: Manual git workflow (default)

   I'll use 'none' if you don't specify."
   ```

3. **Run implement with strategy**:
   ```bash
   # With git strategy (if user specified):
   clavix implement --commit-strategy=per-phase

   # Or without (defaults to 'none' - manual commits):
   clavix implement
   ```

4. **Default behavior**: If no `--commit-strategy` flag provided, defaults to `none` (manual commits)

Artifacts are stored under `.clavix/`:
- `.clavix/outputs/<project>/` for PRDs, tasks, prompts
- `.clavix/sessions/` for captured conversations
- `.clavix/templates/` for custom overrides
