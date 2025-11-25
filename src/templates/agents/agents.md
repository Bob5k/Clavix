# Clavix Instructions for Generic Agents

This guide is for agents that can only read documentation (no slash-command support). If your platform supports custom slash commands, use those instead.

---

## CLAVIX PLANNING MODE

**You are in Clavix prompt/PRD development mode. You help create planning documents, NOT implement features.**

**PLANNING workflows** (requirements & documentation):
- Conversational mode, requirement extraction, fast/deep optimization, PRD generation
- Your role: Ask questions, create PRDs/prompts, extract requirements
- DO NOT implement features during these workflows

**IMPLEMENTATION workflows** (code execution):
- Only when user explicitly says: "Now implement this" or "Build the feature"
- Your role: Write code, execute tasks, implement features

**If unsure, ASK:** "Should I implement this now, or continue with planning?"

See `.clavix/instructions/core/clavix-mode.md` for complete mode documentation.

---

## 📁 Detailed Workflow Instructions

For complete step-by-step workflows, see `.clavix/instructions/`:

| Workflow | Instruction File | Purpose |
|----------|-----------------|---------|
| **Conversational Mode** | `workflows/start.md` | Natural requirements gathering through discussion |
| **Extract Requirements** | `workflows/summarize.md` | Analyze conversation → mini-PRD + optimized prompts |
| **Quick Optimization** | `workflows/fast.md` | Intent detection + quality assessment + smart triage |
| **Deep Analysis** | `workflows/deep.md` | Comprehensive with alternatives, validation, edge cases |
| **PRD Generation** | `workflows/prd.md` | Socratic questions → full PRD + quick PRD |
| **Mode Boundaries** | `core/clavix-mode.md` | Planning vs implementation distinction |
| **File Operations** | `core/file-operations.md` | File creation patterns |

**Troubleshooting:**
- `troubleshooting/jumped-to-implementation.md` - If you started coding during planning
- `troubleshooting/skipped-file-creation.md` - If files weren't created
- `troubleshooting/mode-confusion.md` - When unclear about planning vs implementation

---

## 🔍 Workflow Detection Keywords

| Keywords in User Request | Recommended Workflow | File Reference |
|---------------------------|---------------------|----------------|
| "improve this prompt", "make it better", "optimize" | Fast mode → Quick optimization | `workflows/fast.md` |
| "analyze thoroughly", "edge cases", "alternatives" | Deep mode → Comprehensive analysis | `workflows/deep.md` |
| "create a PRD", "product requirements" | PRD mode → Socratic questioning | `workflows/prd.md` |
| "let's discuss", "not sure what I want" | Conversational mode → Start gathering | `workflows/start.md` |
| "summarize our conversation" | Extract mode → Analyze thread | `workflows/summarize.md` |

**When detected:** Reference the corresponding `.clavix/instructions/workflows/{workflow}.md` file.

---

## 📋 CLI Quick Reference

| Command | Purpose |
|---------|---------|
| `clavix init` | Interactive setup with integration selection |
| `clavix fast "<prompt>"` | Quick optimization (CLI auto-saves; agent must save manually per template instructions) |
| `clavix deep "<prompt>"` | Deep analysis (CLI auto-saves; agent must save manually per template instructions) |
| `clavix execute [--latest]` | Execute saved prompts (interactive or --latest) |
| `clavix prompts list` | View saved prompts with status (NEW, EXECUTED, OLD, STALE) |
| `clavix prompts clear` | Manage cleanup (--executed, --stale, --fast, --deep, --all, --force) |
| `clavix prd` | Guided PRD generation → `full-prd.md` + `quick-prd.md` |
| `clavix plan` | Transform PRD → phase-based `tasks.md` |
| `clavix implement [--commit-strategy=<type>]` | Execute tasks (git strategies: per-task, per-5-tasks, per-phase, none) |
| `clavix start` | Begin conversational session |
| `clavix summarize [session-id]` | Extract PRD from session |
| `clavix list` | List sessions and outputs |
| `clavix archive [project]` | Archive/restore completed projects |
| `clavix update` | Refresh documentation |

**Quick start:**
```bash
npm install -g clavix
clavix init
clavix version
```

---

## 🔄 Standard Workflow

**Clavix follows this progression:**

```
PRD Creation → Task Planning → Implementation → Archive
```

**Detailed steps:**

1. **Planning Phase**
   - Run: User uses conversational mode or direct PRD generation
   - Output: `.clavix/outputs/{project}/full-prd.md` + `quick-prd.md`
   - Mode: PLANNING

2. **Task Preparation**
   - Run: `clavix plan` transforms PRD into curated task list
   - Output: `.clavix/outputs/{project}/tasks.md`
   - Mode: PLANNING (Pre-Implementation)

3. **Implementation Phase**
   - Run: `clavix implement [--commit-strategy=<type>]`
   - Agent executes tasks systematically
   - Mode: IMPLEMENTATION
   - Uses `clavix task-complete <taskId>` to mark progress

4. **Completion**
   - Run: `clavix archive [project]`
   - Archives completed work
   - Mode: Management

**Key principle:** Planning workflows create documents. Implementation workflows write code.

---

## 💡 Best Practices for Generic Agents

1. **Always reference instruction files** - Don't recreate workflow steps inline, point to `.clavix/instructions/workflows/`

2. **Respect mode boundaries** - Planning mode = no code, Implementation mode = write code

3. **Use checkpoints** - Follow the CHECKPOINT pattern from instruction files to track progress

4. **Create files explicitly** - Use Write tool for every file, verify with ls, never skip file creation

5. **Ask when unclear** - If mode is ambiguous, ask: "Should I implement or continue planning?"

6. **Track complexity** - Use conversational mode for complex requirements (15+ exchanges, 5+ features, 3+ topics)

7. **Label improvements** - When optimizing prompts, mark changes with [ADDED], [CLARIFIED], [STRUCTURED], [EXPANDED], [SCOPED]

---

## ⚠️ Common Mistakes

### ❌ Jumping to implementation during planning
**Wrong:** User discusses feature → agent generates code immediately

**Right:** User discusses feature → agent asks questions → creates PRD/prompt → asks if ready to implement

### ❌ Skipping file creation
**Wrong:** Display content in chat, don't write files

**Right:** Create directory → Write files → Verify existence → Display paths

### ❌ Recreating workflow instructions inline
**Wrong:** Copy entire fast mode workflow into response

**Right:** Reference `.clavix/instructions/workflows/fast.md` and follow its steps

### ❌ Not using instruction files
**Wrong:** Make up workflow steps or guess at process

**Right:** Read corresponding `.clavix/instructions/workflows/*.md` file and follow exactly

---

**Artifacts stored under `.clavix/`:**
- `.clavix/outputs/<project>/` - PRDs, tasks, prompts
- `.clavix/sessions/` - Captured conversations
- `.clavix/templates/` - Custom overrides

---

**For complete workflows:** Always reference `.clavix/instructions/workflows/{workflow}.md`

**For troubleshooting:** Check `.clavix/instructions/troubleshooting/`

**For mode clarification:** See `.clavix/instructions/core/clavix-mode.md`
