## Clavix Integration for Warp

Clavix helps Warp developers turn rough ideas into quality, AI-ready prompts and Product Requirements Documents without leaving the terminal.

---

### ⛔ CLAVIX MODE ENFORCEMENT

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

See `.clavix/instructions/core/clavix-mode.md` for complete mode documentation.

---

### 📁 Detailed Workflow Instructions

For complete step-by-step workflows, see `.clavix/instructions/`:
- `.clavix/instructions/workflows/start.md` - Conversational mode
- `.clavix/instructions/workflows/summarize.md` - Extract requirements
- `.clavix/instructions/workflows/improve.md` - Prompt optimization (auto-depth)
- `.clavix/instructions/workflows/prd.md` - PRD generation
- `.clavix/instructions/troubleshooting/` - Common issues

**When detected:** Reference the corresponding `.clavix/instructions/workflows/{workflow}.md` file.

---

### Quick start
- Install globally: `npm install -g clavix`
- Or run ad hoc: `npx clavix@latest init`
- Verify setup: `clavix version`

### CLI Commands (v5)
| Command | Purpose |
|---------|---------|
| `clavix init` | Initialize Clavix in a project |
| `clavix update` | Update templates after package update |
| `clavix config` | Manage configuration |
| `clavix version` | Show version |

### Slash Commands (Workflows)
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
**Wrong:** User runs `/clavix:prd`, you generate PRD then start building features

**Right:** User runs `/clavix:prd`, you generate PRD, save files, suggest `/clavix:plan` as next step

#### ❌ Not referencing instruction files
**Wrong:** Trying to remember workflow details from this file

**Right:** "See `.clavix/instructions/workflows/improve.md` for complete workflow"

---

**For complete workflows:** Always reference `.clavix/instructions/workflows/{workflow}.md`

**For troubleshooting:** Check `.clavix/instructions/troubleshooting/`

**For mode clarification:** See `.clavix/instructions/core/clavix-mode.md`
