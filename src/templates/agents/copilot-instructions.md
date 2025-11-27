# Clavix Instructions for GitHub Copilot

These instructions enhance GitHub Copilot's understanding of Clavix prompt optimization workflows available in this project.

---

## ⛔ CLAVIX MODE ENFORCEMENT

**CRITICAL: Know which mode you're in and STOP at the right point.**

**OPTIMIZATION workflows** (NO CODE ALLOWED):
- Fast/deep optimization - Prompt improvement only
- Your role: Analyze, optimize, show improved prompt, **STOP**
- ❌ DO NOT implement the prompt's requirements
- ✅ After showing optimized prompt, tell user: "Run `/clavix:implement --latest` to implement"

**PLANNING workflows** (NO CODE ALLOWED):
- Conversational mode, requirement extraction, PRD generation
- Your role: Ask questions, create PRDs/prompts, extract requirements
- ❌ DO NOT implement features during these workflows

**IMPLEMENTATION workflows** (CODE ALLOWED):
- Only after user runs execute/implement commands
- Your role: Write code, execute tasks, implement features
- ✅ DO implement code during these workflows

**If unsure, ASK:** "Should I implement this now, or continue with planning?"

See `.clavix/instructions/core/clavix-mode.md` for complete mode documentation.

---

## 📁 Detailed Workflow Instructions

For complete step-by-step workflows, see `.clavix/instructions/`:

| Workflow | Instruction File | Purpose |
|----------|-----------------|---------|
| **Conversational Mode** | `workflows/start.md` | Natural requirements gathering through discussion |
| **Extract Requirements** | `workflows/summarize.md` | Analyze conversation → mini-PRD + optimized prompts |
| **Prompt Optimization** | `workflows/improve.md` | Intent detection + quality assessment + auto-depth selection |
| **PRD Generation** | `workflows/prd.md` | Socratic questions → full PRD + quick PRD |
| **Mode Boundaries** | `core/clavix-mode.md` | Planning vs implementation distinction |

**Troubleshooting:**
- `troubleshooting/jumped-to-implementation.md` - If you started coding during planning
- `troubleshooting/skipped-file-creation.md` - If files weren't created
- `troubleshooting/mode-confusion.md` - When unclear about planning vs implementation

**When detected:** Reference the corresponding `.clavix/instructions/workflows/{workflow}.md` file.

**⚠️ GitHub Copilot Limitation:** If Write tool unavailable, provide file content with clear "save to" instructions for user.

---

## 📋 Clavix Commands (v5)

### Setup Commands (CLI)
| Command | Purpose |
|---------|---------|
| `clavix init` | Initialize Clavix in a project |
| `clavix update` | Update templates after package update |
| `clavix config` | Manage configuration |
| `clavix version` | Show version |

### Workflow Commands (Slash Commands)
All workflows are executed via slash commands:

| Slash Command | Purpose |
|---------------|---------|
| `/clavix:improve` | Optimize prompts (auto-selects depth) |
| `/clavix:prd` | Generate PRD through guided questions |
| `/clavix:plan` | Create task breakdown from PRD |
| `/clavix:implement` | Execute tasks or prompts (auto-detects source) |
| `/clavix:start` | Begin conversational session |
| `/clavix:summarize` | Extract requirements from conversation |
| `/clavix:verify` | Verify implementation |
| `/clavix:archive` | Archive completed projects |

---

## 🔄 Prompt Lifecycle Workflow

**Prompt Lifecycle:**
1. **Optimize**: `/clavix:improve` → Analyzes and improves your prompt
2. **Review**: Agent reads `.clavix/outputs/prompts/*.md` to list saved prompts
3. **Execute**: `/clavix:implement --latest` → Implement when ready
4. **Cleanup**: Agent deletes old prompt files from `.clavix/outputs/prompts/`

---

## 🔄 Standard Workflow

**Clavix follows this progression:**

```
PRD Creation → Task Planning → Implementation → Archive
```

**Detailed steps:**

1. **Planning Phase** - `/clavix:prd` or `/clavix:start` → `/clavix:summarize`
2. **Task Preparation** - `/clavix:plan` transforms PRD into tasks.md
3. **Implementation Phase** - `/clavix:implement` executes tasks systematically
4. **Completion** - `/clavix:archive` archives completed work

**Key principle:** Planning workflows create documents. Implementation workflows write code.

---

## 🎯 Quality Dimensions

When analyzing prompts, consider these 5 dimensions:

- **Clarity**: Is the objective clear and unambiguous?
- **Efficiency**: Concise without losing critical information?
- **Structure**: Information organized logically (context → requirements → constraints → output)?
- **Completeness**: All specs provided (persona, format, tone, success criteria)?
- **Actionability**: Can AI take immediate action?

**Reference:** See `workflows/improve.md` for complete quality assessment patterns

---

## 💡 Best Practices for GitHub Copilot

1. **Suggest appropriate workflow** - `/clavix:improve` for prompts, `/clavix:prd` for strategic planning
2. **Reference instruction files** - Point to `.clavix/instructions/workflows/*.md` instead of recreating steps
3. **Respect mode boundaries** - Planning mode = no code, Implementation mode = write code
4. **Use quality dimensions** - Apply 5-dimension assessment principles in responses
5. **Guide users to slash commands** - Recommend appropriate `/clavix:*` commands for their needs

---

## ⚠️ Common Mistakes

### ❌ Jumping to implementation during planning
**Wrong:** User discusses feature → Copilot generates code immediately

**Right:** User discusses feature → Suggest `/clavix:prd` or `/clavix:start` → Create planning docs first

### ❌ Not suggesting Clavix workflows
**Wrong:** User asks "How should I phrase this?" → Copilot provides generic advice

**Right:** User asks "How should I phrase this?" → Suggest `/clavix:improve` for quality assessment

### ❌ Recreating workflow steps inline
**Wrong:** Copilot explains entire PRD generation process in chat

**Right:** Copilot references `.clavix/instructions/workflows/prd.md` and suggests running `/clavix:prd`

---

## 🔗 Integration with GitHub Copilot

When users ask for help with prompts or requirements:

1. **Detect need** - Identify if user needs planning, optimization, or implementation
2. **Suggest slash command** - Recommend appropriate `/clavix:*` command
3. **Explain benefit** - Describe expected output and value
4. **Help interpret** - Assist with understanding Clavix-generated outputs
5. **Apply principles** - Use quality dimensions in your responses

**Example flow:**
```
User: "I want to build a dashboard but I'm not sure how to phrase the requirements"
Copilot: "I suggest running `/clavix:start` to begin conversational requirements gathering.
This will help us explore your needs naturally, then we can extract structured requirements
with `/clavix:summarize`. Alternatively, if you have a rough idea, try:
`/clavix:improve 'Build a dashboard for...'` for quick optimization."
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
