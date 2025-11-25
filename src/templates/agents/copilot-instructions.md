# Clavix Instructions for GitHub Copilot

These instructions enhance GitHub Copilot's understanding of Clavix Intelligence™ workflows available in this project.

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

**Troubleshooting:**
- `troubleshooting/jumped-to-implementation.md` - If you started coding during planning
- `troubleshooting/skipped-file-creation.md` - If files weren't created
- `troubleshooting/mode-confusion.md` - When unclear about planning vs implementation

**When detected:** Reference the corresponding `.clavix/instructions/workflows/{workflow}.md` file.

**⚠️ GitHub Copilot Limitation:** If Write tool unavailable, provide file content with clear "save to" instructions for user.

---

## 📋 CLI Quick Reference

| Command | Purpose |
|---------|---------|
| `clavix fast "<prompt>"` | Quick optimization (CLI auto-saves; slash commands require manual saving per template instructions) |
| `clavix deep "<prompt>"` | Deep analysis (CLI auto-saves; slash commands require manual saving per template instructions) |
| `clavix execute [--latest]` | Execute saved prompts (--latest, --fast, --deep, --id supported) |
| `clavix prompts list` | View saved prompts with status (NEW, EXECUTED, OLD, STALE) |
| `clavix prompts clear` | Manage cleanup (--executed, --stale, --fast, --deep, --all, --force) |
| `clavix prd` | Guided PRD generation |
| `clavix plan` | Transform PRD → tasks |
| `clavix implement [--commit-strategy]` | Execute tasks |
| `clavix start` | Begin conversational session |
| `clavix summarize [session-id]` | Extract PRD from session |
| `clavix list` | List sessions/outputs |
| `clavix archive [project]` | Archive/restore projects |
| `clavix update` | Refresh documentation |

---

## 🔄 Prompt Lifecycle Management (v2.7+)

**Prompt Lifecycle Workflow:**
1. **Optimize**: `clavix fast/deep "<prompt>"` → CLI auto-saves; slash commands require manual saving per template instructions
2. **Review**: `clavix prompts list` → View all saved prompts with status
3. **Execute**: `clavix execute --latest` → Implement when ready
4. **Cleanup**: `clavix prompts clear --executed` → Remove completed prompts

---

## 🔄 Standard Workflow

**Clavix follows this progression:**

```
PRD Creation → Task Planning → Implementation → Archive
```

**Detailed steps:**

1. **Planning Phase** - User creates PRD (conversational or direct)
2. **Task Preparation** - `clavix plan` transforms PRD into tasks.md
3. **Implementation Phase** - `clavix implement` executes tasks systematically
4. **Completion** - `clavix archive` archives completed work

**Key principle:** Planning workflows create documents. Implementation workflows write code.

---

## 🎯 Quality Dimensions

When analyzing prompts, consider these 5 dimensions:

- **Clarity**: Is the objective clear and unambiguous?
- **Efficiency**: Concise without losing critical information?
- **Structure**: Information organized logically (context → requirements → constraints → output)?
- **Completeness**: All specs provided (persona, format, tone, success criteria)?
- **Actionability**: Can AI take immediate action?

**Reference:** See `workflows/fast.md` for complete quality assessment patterns

---

## 💡 Best Practices for GitHub Copilot

1. **Suggest appropriate workflow** - Fast for simple prompts, deep for complex, PRD for strategic
2. **Reference instruction files** - Point to `.clavix/instructions/workflows/*.md` instead of recreating steps
3. **Respect mode boundaries** - Planning mode = no code, Implementation mode = write code
4. **Use quality dimensions** - Apply 5-dimension assessment principles in responses
5. **Guide users to CLI** - Recommend appropriate `clavix` commands for their needs

---

## ⚠️ Common Mistakes

### ❌ Jumping to implementation during planning
**Wrong:** User discusses feature → Copilot generates code immediately

**Right:** User discusses feature → Suggest `clavix prd` or `clavix start` → Create planning docs first

### ❌ Not suggesting Clavix workflows
**Wrong:** User asks "How should I phrase this?" → Copilot provides generic advice

**Right:** User asks "How should I phrase this?" → Suggest `clavix fast "<prompt>"` for quality assessment

### ❌ Recreating workflow steps inline
**Wrong:** Copilot explains entire PRD generation process in chat

**Right:** Copilot references `.clavix/instructions/workflows/prd.md` and suggests running `clavix prd`

---

## 🔗 Integration with GitHub Copilot

When users ask for help with prompts or requirements:

1. **Detect need** - Identify if user needs planning, optimization, or implementation
2. **Suggest command** - Recommend appropriate `clavix` command
3. **Explain benefit** - Describe expected output and value
4. **Help interpret** - Assist with understanding Clavix-generated outputs
5. **Apply principles** - Use quality dimensions in your responses

**Example flow:**
```
User: "I want to build a dashboard but I'm not sure how to phrase the requirements"
Copilot: "I suggest running `clavix start` to begin conversational requirements gathering.
This will help us explore your needs naturally, then we can extract structured requirements
with `clavix summarize`. Alternatively, if you have a rough idea, try:
clavix fast 'Build a dashboard for...' for quick optimization."
```

---

**Artifacts stored under `.clavix/`:**
- `.clavix/outputs/<project>/` - PRDs, tasks, prompts
- `.clavix/sessions/` - Captured conversations
- `.clavix/config.json` - Project configuration

---

**For complete workflows:** Always reference `.clavix/instructions/workflows/{workflow}.md`

**For troubleshooting:** Check `.clavix/instructions/troubleshooting/`

**For mode clarification:** See `.clavix/instructions/core/clavix-mode.md`
