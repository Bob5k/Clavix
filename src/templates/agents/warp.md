## Clavix Integration for Warp

Clavix helps Warp developers turn rough ideas into quality, AI-ready prompts and Product Requirements Documents without leaving the terminal.

---

### ⚠️ CLAVIX MODE: Requirements & Planning Only

**When using Clavix workflows, you are in PLANNING mode, NOT implementation mode.**

**YOUR ROLE:**
- ✓ Generate PRDs and prompts
- ✓ Extract requirements
- ✓ Optimize prompt quality

**DO NOT IMPLEMENT. DO NOT IMPLEMENT. DO NOT IMPLEMENT.**
- ✗ DO NOT write application code during Clavix workflows
- ✗ DO NOT implement features being planned

**ONLY implement if user explicitly says: "Now implement this"**

See `.clavix/instructions/core/clavix-mode.md` for complete mode documentation.

---

### 📁 Detailed Workflow Instructions

For complete step-by-step workflows, see `.clavix/instructions/`:
- `.clavix/instructions/workflows/start.md` - Conversational mode
- `.clavix/instructions/workflows/summarize.md` - Extract requirements
- `.clavix/instructions/workflows/fast.md` - Quick prompt optimization
- `.clavix/instructions/workflows/deep.md` - Comprehensive analysis
- `.clavix/instructions/workflows/prd.md` - PRD generation
- `.clavix/instructions/troubleshooting/` - Common issues

**When detected:** Reference the corresponding `.clavix/instructions/workflows/{workflow}.md` file.

---

### Quick start
- Install globally: `npm install -g clavix`
- Or run ad hoc: `npx clavix@latest init`
- Verify setup: `clavix version`

### Common commands
- `clavix init` – interactive integration setup (regenerates docs & commands)
- `clavix fast "<prompt>"` – quick quality assessment (5 dimensions) and improved prompt. CLI auto-saves; slash commands need manual saving per template instructions.
- `clavix deep "<prompt>"` – comprehensive analysis with alternatives, edge cases, and validation checklists. CLI auto-saves; slash commands need manual saving per template instructions.
- `clavix execute [--latest]` – execute saved prompts from fast/deep. Interactive selection or `--latest` for most recent.
- `clavix prompts list` – view all saved prompts with age/status (NEW, EXECUTED, OLD, STALE)
- `clavix prompts clear [--executed|--stale|--fast|--deep]` – cleanup executed or old prompts
- `clavix prd` – answer focused questions to create full/quick PRDs
- `clavix plan` – transform PRDs or sessions into task lists
- `clavix implement [--commit-strategy=<type>]` – execute tasks (git: per-task, per-5-tasks, per-phase, none [default])
- `clavix task-complete <taskId>` – mark task completed with validation and optional git commit
- `clavix start` – capture requirement conversations in Warp
- `clavix summarize [session-id]` – extract mini PRDs and optimized prompts
- `clavix list` – list sessions/outputs (`--sessions`, `--outputs`, `--archived`)
- `clavix show [session-id]` – inspect sessions or use `--output <project>`
- `clavix archive [project]` – archive projects (or `--restore` to bring them back)
- `clavix config get|set|edit|reset` – manage `.clavix/config.json`
- `clavix update` – refresh documentation/commands (`--docs-only`, `--commands-only`)
- `clavix version` – print installed CLI version

### Outputs
- Project artifacts live under `.clavix/outputs/<project>/`
- Sessions are stored in `.clavix/sessions/`
- Update generated docs/commands any time with `clavix update`

---

### 💡 Best Practices for Warp

1. **Always reference instruction files** - Don't recreate workflow steps inline, point to `.clavix/instructions/workflows/`
2. **Respect mode boundaries** - Planning mode = no code, Implementation mode = write code
3. **Create files explicitly** - Use Write tool for every file, verify, never skip file creation
4. **Ask when unclear** - If mode is ambiguous, ask: "Should I implement or continue planning?"

---

### ⚠️ Common Mistakes

#### ❌ Jumping to implementation during planning
**Wrong:** User runs `clavix prd`, you generate PRD then start building features

**Right:** User runs `clavix prd`, you generate PRD, save files, suggest `clavix plan` as next step

#### ❌ Not referencing instruction files
**Wrong:** Trying to remember workflow details from this file

**Right:** "See `.clavix/instructions/workflows/fast.md` for complete workflow"

---

**For complete workflows:** Always reference `.clavix/instructions/workflows/{workflow}.md`

**For troubleshooting:** Check `.clavix/instructions/troubleshooting/`

**For mode clarification:** See `.clavix/instructions/core/clavix-mode.md`
