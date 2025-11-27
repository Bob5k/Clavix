# Clavix Instructions for Octofriend

Clavix workflows optimized for Octofriend's capabilities: model switching, multi-turn thinking, and zero telemetry.

---

## ⛔ CLAVIX MODE ENFORCEMENT

**CRITICAL: Know which mode you're in and STOP at the right point.**

**OPTIMIZATION workflows** (NO CODE ALLOWED):
- `/clavix:improve` - Prompt optimization with smart depth auto-selection
- Your role: Analyze, optimize, show improved prompt, **STOP**
- ❌ DO NOT implement the prompt's requirements
- ✅ After showing optimized prompt, tell user: "Run `/clavix:implement --latest` to implement"

**PLANNING workflows** (NO CODE ALLOWED):
- `/clavix:start`, `/clavix:summarize`, `/clavix:prd`, `/clavix:plan`
- Your role: Ask questions, create PRDs/prompts, extract requirements
- ❌ DO NOT implement features during these workflows

**IMPLEMENTATION workflows** (CODE ALLOWED):
- `/clavix:implement`
- Your role: Write code, execute tasks, implement features
- ✅ DO implement code during these workflows
- Mark task completion by editing tasks.md directly (`- [ ]` → `- [x]`)

See `.clavix/instructions/core/clavix-mode.md` for complete mode documentation.

---

## 📁 Detailed Workflow Instructions

**Complete step-by-step workflows** in `.clavix/instructions/workflows/`:

| Workflow | File | Purpose |
|----------|------|---------|
| Conversational mode | `start.md` | Natural requirements gathering |
| Extract requirements | `summarize.md` | Convert conversation → PRD + prompts |
| Smart optimization | `improve.md` | Prompt optimization with auto-depth |
| PRD generation | `prd.md` | Strategic planning through questions |

**Core references:**
- `core/clavix-mode.md` - Mode boundaries (planning vs implementation)
- `core/file-operations.md` - Proven file creation patterns
- `core/verification.md` - Checkpoint patterns

**Troubleshooting:**
- `troubleshooting/jumped-to-implementation.md` - If you start implementing
- `troubleshooting/skipped-file-creation.md` - If files aren't created
- `troubleshooting/mode-confusion.md` - Planning vs implementation confusion

**For Octo/Kimi users:** These instruction files have explicit step-by-step guidance that works well with structured processing. Always reference them when executing workflows.

---

## 🔍 Workflow Detection Keywords

| Keywords | Workflow | Mode |
|----------|----------|------|
| prd, product requirements, specification | `prd` | Planning |
| improve, optimize, enhance prompt | `improve` | Planning |
| start, conversational, discuss | `start` | Planning |
| summarize, extract, requirements | `summarize` | Planning |
| implement, build, execute | `implement` | Implementation |

**When detected:** Reference the corresponding `.clavix/instructions/workflows/{workflow}.md` file.

---

## 🎯 Octofriend-Specific Guidance

### Model Switching Strategy

**Fast models** (Qwen-Max, etc.):
- Standard depth optimization (`improve` workflow)
- Formatting and structure
- Straightforward questions

**Thinking models** (DeepSeek-R1, etc.):
- Comprehensive depth optimization (`improve` workflow)
- Architectural decisions
- Complex problem-solving
- PRD generation (`prd` workflow)

**Switch models based on task complexity** - Octofriend makes this seamless.

### Multi-Turn Thinking

Enable multi-turn for:
- Architectural decisions
- Comprehensive analysis
- Strategic planning
- Complex problem decomposition

Multi-turn helps thinking models explore solution space thoroughly.

### Zero Telemetry Advantage

Users can share sensitive requirements safely:
- Proprietary business logic
- Confidential features
- Internal system details
- Competitive information

Octofriend's zero telemetry makes it ideal for planning confidential projects.

### Custom Autofix

Trust Octofriend's autofix for:
- Tool call failures
- Parameter corrections
- Retry logic

Autofix handles edge cases gracefully - let it work.

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
| Slash Command | Purpose |
|---------------|---------|
| `/clavix:improve` | Optimize prompts (auto-selects depth) |
| `/clavix:prd` | Generate PRD through questions |
| `/clavix:plan` | Create task breakdown from PRD |
| `/clavix:implement` | Execute tasks or prompts (auto-detects source) |
| `/clavix:start` | Begin conversational session |
| `/clavix:summarize` | Extract requirements from conversation |
| `/clavix:verify` | Verify implementation |
| `/clavix:archive` | Archive completed projects |

---

## 🔄 Prompt Execution Workflow

**When you have a saved prompt to execute:**

1. **List available prompts**: List files in `.clavix/outputs/prompts/*.md`
2. **Execute prompt**: `/clavix:implement --latest` - implement saved prompt
3. **Implement**: Agent reads the optimized prompt and implements the feature

**Note:** Slash commands save prompts as `.md` files with frontmatter metadata.

---

## 🔄 Standard Workflow

**Complete project flow:**

1. **Planning** (`/clavix:prd`)
   - Creates PRD (full + quick versions)
   - Saves to `.clavix/outputs/{project}/`

2. **Task Preparation** (`/clavix:plan`)
   - Transforms PRD → curated tasks.md
   - Phase-based organization

3. **Implementation** (`/clavix:implement`)
   - Agent executes tasks systematically
   - Marks progress by editing tasks.md (`- [ ]` → `- [x]`)
   - Optional git commit strategies

4. **Completion** (`/clavix:archive`)
   - Archives completed project

**Alternative quick paths:**
- **Quick improvement**: `/clavix:improve` → `/clavix:implement --latest` → Done
- **Conversational**: `/clavix:start` → `/clavix:summarize` → `/clavix:implement` → Done

---

## 💡 Best Practices for Octofriend

1. **Use thinking models for planning** - DeepSeek-R1 excels at strategic thinking
2. **Switch to fast models for execution** - Qwen-Max handles implementation well
3. **Enable multi-turn for complex decisions** - Let the model think thoroughly
4. **Reference instruction files explicitly** - "See `.clavix/instructions/workflows/prd.md`"
5. **Trust file operations** - Octofriend's Write tool is reliable
6. **Leverage zero telemetry** - Share proprietary details safely
7. **Follow the standard workflow** - PRD → Plan → Implement → Archive

---

## ⚠️ Common Mistakes

### ❌ Implementing during planning workflows
**Wrong:** User runs `/clavix:prd`, you generate PRD then start building features

**Right:** User runs `/clavix:prd`, you generate PRD, save files, suggest `/clavix:plan` as next step

### ❌ Skipping file creation
**Wrong:** Display optimized prompt, stop there

**Right:** Display prompt, save to `.clavix/outputs/`, verify, show path

### ❌ Not referencing instruction files
**Wrong:** Trying to remember workflow details from this file

**Right:** "See `.clavix/instructions/workflows/improve.md` for complete workflow"

### ❌ Using wrong model for task
**Wrong:** Using fast model for complex architectural planning

**Right:** Switch to thinking model (DeepSeek-R1) for strategic decisions

---

## 🆘 When in Doubt

1. **Check which slash command was run** - Determines your mode (planning vs implementation)
2. **Reference instruction files** - They have complete step-by-step guidance
3. **Ask the user** - "Should I implement this (run `/clavix:implement`), or continue planning?"
4. **Switch models** - Use thinking models for complex planning tasks

---

**For complete workflows:** Always reference `.clavix/instructions/workflows/{workflow}.md`

**For troubleshooting:** Check `.clavix/instructions/troubleshooting/`

**For mode clarification:** See `.clavix/instructions/core/clavix-mode.md`

Octofriend + Clavix = Strategic planning with zero telemetry, perfect for confidential projects.
