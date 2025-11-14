# Clavix

> AI prompt improvement and PRD generation CLI tool for developers
>
> **Built on the CLEAR Framework** - Academically-validated prompt engineering methodology

Clavix helps developers create better prompts and structured Product Requirements Documents (PRDs) for AI-assisted development tools like Claude Code. Using the CLEAR Framework (Concise, Logical, Explicit, Adaptive, Reflective) and Socratic questioning, Clavix ensures your requirements are clear, complete, and actionable.

## Installation

```bash
npm install -g clavix
```

**Troubleshooting:**
- If you encounter permission errors, use `sudo npm install -g clavix` (macOS/Linux)
- On Windows, run your terminal as Administrator
- Verify installation with `clavix version`

## Supported Providers

Clavix integrates seamlessly with multiple AI development tools:

| Tool | Slash Commands | Directory | Status |
|------|----------------|-----------|--------|
| **Claude Code** | ✅ | `.claude/commands/clavix/` | Fully Supported |
| **Cursor** | ✅ | `.cursor/commands/` | Fully Supported |
| **Droid CLI** | ✅ | `.factory/commands/` | Fully Supported |
| **OpenCode** | ✅ | `.opencode/command/` | Fully Supported |
| **Amp** | ✅ | `.agents/commands/` | Fully Supported |
| **Crush CLI** | ✅ | `.crush/commands/clavix/` | Fully Supported |
| **Universal (agents.md)** | ⚡ No slash commands | `AGENTS.md` | Fully Supported |

**Key Features:**
- **Multi-Select Support** - Choose multiple tools during `clavix init`
- **Provider-Specific Formatting** - Commands generated in each tool's native format
- **Universal Fallback** - `agents.md` works with any tool
- **Managed Documentation** - Auto-inject and update instructions

## Why Clavix?

AI-assisted development tools produce better code when given better prompts. However, developers often struggle to write comprehensive, structured prompts that clearly communicate requirements, constraints, and success criteria. Clavix solves this by:

- **Analyzing prompts** to identify gaps, ambiguities, and missing details
- **Generating structured PRDs** through guided Socratic questioning
- **Integrating seamlessly** with your AI development workflow
- **Working offline** - no API calls, fully local operation

## Why CLEAR?

**CLEAR Framework** is an academically-validated methodology for prompt engineering developed by **Dr. Leo Lo**, Dean of Libraries at the University of New Mexico, and published in the *Journal of Academic Librarianship* (July 2023).

**The five CLEAR components:**
- **[C] Concise** - Eliminate verbosity, remove pleasantries, focus on essentials
- **[L] Logical** - Ensure coherent sequencing (context → requirements → constraints → output)
- **[E] Explicit** - Specify persona, output format, tone, and success criteria
- **[A] Adaptive** - Provide alternative approaches, flexibility, and customization
- **[R] Reflective** - Enable validation, edge case analysis, and quality checks

**Benefits:** Research-backed methodology, proven effectiveness, modern approach to AI interaction, educational feedback on prompt improvements.

**Academic Citation:**
Lo, L. S. (2023). "The CLEAR Path: A Framework for Enhancing Information Literacy through Prompt Engineering." *Journal of Academic Librarianship*, 49(4). [Framework Guide](https://guides.library.tamucc.edu/prompt-engineering/clear)

## Features

### 🎯 CLEAR Framework Prompt Engineering

- **Fast Mode** - CLEAR-guided quick improvements (C, L, E components) with smart triage
- **Deep Mode** - Full CLEAR framework analysis (C, L, E, A, R) with comprehensive validation
- **CLEAR Assessment** - Score each component (0-100), overall rating, educational feedback with labeled improvements

### 📋 CLEAR-Validated PRD Generation

- **Vibecoding-Optimized** - 5 focused questions instead of lengthy requirement gathering
- **Smart Tech Detection** - Auto-detects stack from project files (package.json, requirements.txt, etc.)
- **CLEAR Validation** - Generated PRDs are analyzed for AI consumption quality (C, L, E components)
- **Dual Output Format** - Comprehensive team PRD (`full-prd.md`) + CLEAR-optimized AI-ready version (`quick-prd.md`)
- **Handlebars Templates** - Fully customizable PRD formats with template override support

### 🚀 PRD-to-Implementation Workflow

- **Task Planning** - Auto-generate implementation task breakdown from PRD with CLEAR-optimized atomic tasks
- **Session Resume** - Stateful task tracking via markdown checkboxes, resume from last incomplete task
- **Git Auto-Commit** - Optional automatic commits (per-task, per-5-tasks, per-phase) with descriptive messages
- **AI-Assisted Execution** - Seamless handoff from strategic planning (PRD) to tactical implementation

### 💬 CLEAR-Optimized Conversational Mode

- **Session Management** - Track conversations with UUID-based sessions, metadata, tags, and status tracking
- **Message History** - Complete conversation logs with user/assistant role tracking
- **CLEAR Extraction** - Extract and optimize prompts using CLEAR framework, display both raw and CLEAR-enhanced versions
- **Search & Filter** - Find sessions by project, agent, status, tags, keywords, or date range

### 🤖 Multi-Provider AI Agent Integration

Clavix works with all major AI development tools (see [Supported Providers](#supported-providers) above).

**Available Slash Commands:**
- `/clavix:fast` - Quick CLEAR improvements
- `/clavix:deep` - Full CLEAR analysis
- `/clavix:prd` - Generate PRD
- `/clavix:plan` - Generate task breakdown
- `/clavix:implement` - Execute tasks
- `/clavix:archive` - Archive completed projects
- `/clavix:start` - Start conversational mode
- `/clavix:summarize` - Extract optimized prompts

**Integration Features:**
- Provider-specific command formatting (e.g., Crush CLI uses `$PROMPT` placeholder)
- Interactive multi-select during `clavix init`
- Automatic documentation injection with managed blocks
- Extensible plugin-based architecture for adding new providers

### ⚙️ Configuration & Management

- **Project Configuration** - Customize templates, output paths, agent selection, and preferences via `.clavix/config.json`
- **Interactive CLI** - View current config, change settings, edit preferences, or reset to defaults
- **Template System** - Override built-in templates with custom versions in `.clavix/templates/`
- **Atomic File Operations** - Safe writes and updates prevent data corruption

### 📚 Documentation Management

- **Managed Blocks** - Auto-inject instructions with `<!-- CLAVIX:START -->` `<!-- CLAVIX:END -->` markers
- **Update Command** - Keep slash commands and documentation synchronized across updates
- **Safe Updates** - Preserve manual content while refreshing managed sections
- **Migration Support** - Automatic cleanup of old command structures

### 🔧 CLI Commands

- `clavix init` - Initialize Clavix in your project with multi-provider selection (checkbox UI)
- `clavix fast <prompt>` - CLEAR-guided quick improvements (C, L, E components)
  - `--clear-only` - Show only CLEAR scores without improved prompt
  - `--framework-info` - Display CLEAR framework information
- `clavix deep <prompt>` - Full CLEAR framework analysis (C, L, E, A, R)
  - `--clear-only` - Show only CLEAR scores without improved prompt
  - `--framework-info` - Display CLEAR framework information
- `clavix prd` - Generate CLEAR-validated PRD through Socratic questions
- `clavix plan` - Generate implementation task breakdown from PRD
- `clavix implement` - Execute tasks from the implementation plan with AI assistance
- `clavix archive` - Archive completed PRD projects (`--list`, `--restore <project>`)
- `clavix start` - Begin conversational session for iterative development
- `clavix summarize [session-id]` - Extract and CLEAR-optimize prompts from conversation
- `clavix list` - List sessions and outputs with filtering options
- `clavix show [session-id]` - View detailed session/output information
- `clavix config` - Manage configuration (get/set/edit/reset)
- `clavix update` - Update managed blocks and slash commands
- `clavix version` - Display version information

## Quick Start

### 1. Initialize in Your Project

```bash
cd your-project
clavix init
```

You'll be prompted to select which AI tools to support:
```
? Which AI tools are you using? (Space to select, Enter to confirm)
 ◉ Claude Code (.claude/commands/clavix/)
 ◉ Cursor (.cursor/commands/)
 ◯ Droid CLI (.factory/commands/)
 ◉ OpenCode (.opencode/command/)
 ◯ Amp (.agents/commands/)
 ◉ agents.md (Universal)
```

This will:
- Create `.clavix/` directory with configuration
- Generate slash commands for all selected providers
- Create universal `AGENTS.md` for tools without slash commands
- Inject managed blocks into documentation files

### 2. Improve a Prompt with CLEAR Framework

**Fast mode** (C, L, E components):
```bash
clavix fast "Create a login page"
```

**Deep mode** (full CLEAR - C, L, E, A, R):
```bash
clavix deep "Create a login page"
```

**Framework info:**
```bash
clavix fast --framework-info
```

Output:
- **CLEAR Assessment** - Component scores (Conciseness, Logic, Explicitness + Adaptive & Reflective in deep mode)
- **CLEAR-Optimized Prompt** - Improved version applying all CLEAR principles
- **CLEAR Changes Made** - Educational feedback labeled with [C], [L], [E], [A], [R] components
- **Smart Triage** - CLEAR-aware recommendations for when to use deep mode
- **Adaptive Variations** - Alternative phrasings and structures (deep mode)
- **Reflection Checklist** - Validation steps and edge cases (deep mode)

### 3. Use Slash Commands (All Providers)

After initialization, use these CLEAR-enhanced commands in your AI tool:

- `/clavix:fast [prompt]` - CLEAR-guided quick improvements (C, L, E)
- `/clavix:deep [prompt]` - Full CLEAR framework analysis (C, L, E, A, R)
- `/clavix:prd` - Generate CLEAR-validated PRD
- `/clavix:plan` - Generate task breakdown from PRD
- `/clavix:implement` - Execute tasks with AI assistance
- `/clavix:start` - Start conversational mode
- `/clavix:summarize` - Extract and CLEAR-optimize from conversation

## Commands

### `clavix init`

Initialize Clavix in the current project.

```bash
clavix init
```

Interactive prompts guide you through:
- Agent selection (Claude Code, more coming soon)
- Directory structure creation
- Slash command generation
- Documentation injection

### `clavix fast <prompt>`

Quick prompt improvements with smart triage.

```bash
clavix fast "Build an API for user management"
```

**Features:**
- Fast analysis of gaps, ambiguities, strengths
- Smart triage: recommends deep mode for complex prompts
- "Already good" assessment for quality prompts
- Changes made summary (educational)
- Single structured improved prompt

**Smart triage checks:**
- Prompts < 20 characters
- Missing 3+ critical elements
- Vague scope words without context

### `clavix deep <prompt>`

Comprehensive prompt analysis.

```bash
clavix deep "Build an API for user management"
```

**Everything from fast mode PLUS:**
- Alternative phrasings of requirements
- Edge cases in requirements
- Good/bad implementation examples
- Multiple prompt structuring approaches
- "What could go wrong" analysis
- More thorough clarifying questions

**Output:**
- Structured prompt with sections:
  - Objective
  - Requirements
  - Technical Constraints
  - Expected Output
  - Success Criteria
  - Plus all deep mode analysis sections

### `clavix prd`

Generate a comprehensive PRD through 5 focused questions (optimized for vibecoding).

```bash
clavix prd
```

Features:
- **5 streamlined questions** - Fast workflow without losing quality
- **Smart tech detection** - Auto-detects stack from package.json, requirements.txt, etc.
- **CLEAR validated** - Automatic quality analysis for AI consumption

Creates two files:
- `full-prd.md` - Comprehensive document for team alignment
- `quick-prd.md` - Condensed version for AI consumption

### `clavix plan`

Generate implementation task breakdown from PRD.

```bash
clavix plan
```

**Features:**
- Analyzes PRD and generates `tasks.md` with CLEAR-optimized tasks
- Organizes tasks into logical phases/sections
- Creates markdown checkbox format for progress tracking
- Each task is atomic and independently implementable
- Tasks reference specific PRD sections for context

**Options:**
```bash
clavix plan --project my-app           # Specify PRD project
clavix plan --prd-path .clavix/outputs/my-project  # Direct path
clavix plan --overwrite                 # Regenerate existing tasks.md
```

**Output format:**
```markdown
## Phase 1: Authentication
- [ ] Implement user registration endpoint
- [ ] Add password hashing with bcrypt
- [ ] Create JWT token generation

## Phase 2: Authorization
- [ ] Implement role-based access control
- [ ] Add middleware for protected routes
```

### `clavix implement`

Execute tasks from the implementation plan with AI assistance.

```bash
clavix implement
```

**Workflow:**
1. Reads `tasks.md` and finds first incomplete task
2. Shows current progress (completed/total)
3. Prompts for git auto-commit preferences
4. Creates configuration for AI agent
5. AI agent implements tasks sequentially
6. Marks completed tasks: `[ ]` → `[x]`
7. Creates commits based on strategy
8. Resumes from last checkpoint in new sessions

**Git Auto-Commit Strategies:**
- **Per phase** - Commit when all tasks in a phase complete
- **Per 5 tasks** - Commit after every 5 tasks
- **Per task** - Commit after each individual task
- **None** - Manual git management

**Options:**
```bash
clavix implement --project my-app       # Specify PRD project
clavix implement --no-git               # Skip git setup
clavix implement --commit-strategy per-task  # Set commit strategy
```

**Example commit message:**
```
clavix: Implement user authentication

Completed tasks:
- Implement user registration endpoint
- Add password hashing with bcrypt
- Create JWT token generation

Project: my-app
Generated by Clavix /clavix:implement
```

### `clavix archive`

Archive completed PRD projects to keep your workspace organized.

```bash
# Interactive mode - select projects to archive
clavix archive

# Archive specific project
clavix archive my-project

# List archived projects
clavix archive --list

# Restore archived project
clavix archive --restore my-project

# Force archive (skip incomplete task verification)
clavix archive my-project --force
```

**How it works:**
- Archives projects from `.clavix/outputs/` to `.clavix/outputs/archive/`
- Validates all tasks are completed before archiving (unless `--force` used)
- Preserves all PRD files, task files, and implementation plans
- List view shows completion status, task counts, and archive dates
- Supports multiple PRD naming conventions: `PRD.md`, `full-prd.md`, `FULL_PRD.md`, `QUICK_PRD.md`

**Slash Command:**
```
/clavix:archive
```
Available in: Claude Code, Cursor, Droid, OpenCode, Amp

### `clavix start`

Enter conversational mode for iterative requirement gathering.

```bash
clavix start
```

Start a natural conversation to develop requirements. Use `/clavix:summarize` later to extract structured output.

### `clavix summarize [session-id]`

Analyze a conversation and extract requirements.

```bash
# Summarize current session
clavix summarize

# Summarize specific session
clavix summarize abc-123-def
```

Generates:
- `mini-prd.md` - Concise requirements
- `optimized-prompt.md` - AI-ready prompt

### `clavix list`

List all sessions and outputs.

```bash
# List everything
clavix list

# List only sessions
clavix list --sessions

# Filter by project
clavix list --project auth
```

### `clavix show [session-id]`

Show detailed session information.

```bash
# Show most recent session
clavix show

# Show specific session with full history
clavix show abc-123-def --full

# Show output directory
clavix show --output project-name
```

### `clavix config`

Manage configuration.

```bash
# Interactive menu
clavix config

# Get/set values
clavix config get agent
clavix config set preferences.verboseLogging true
```

### `clavix update`

Update managed blocks and slash commands.

```bash
# Update everything
clavix update

# Update specific components
clavix update --docs-only
clavix update --commands-only
```

### `clavix version`

Display the current version of Clavix.

```bash
clavix version
```

### `clavix --help`

Display help information for all commands.

```bash
clavix --help
clavix fast --help
clavix deep --help
```

## Project Structure

After initialization, your project will have:

```
your-project/
├── .clavix/
│   ├── config.json         # Clavix configuration
│   ├── INSTRUCTIONS.md     # Usage guide
│   ├── sessions/           # Conversational mode sessions
│   ├── outputs/            # Generated PRDs and prompts
│   │   └── project-name/
│   │       ├── PRD.md      # Full PRD
│   │       ├── PRD-quick.md  # Quick PRD
│   │       ├── tasks.md    # Implementation tasks
│   │       └── .clavix-implement-config.json  # Implementation config
│   └── templates/          # Custom templates (optional)
├── AGENTS.md               # Updated with Clavix block
├── CLAUDE.md               # Updated with Clavix block (if Claude Code)
└── .claude/commands/       # Generated slash commands (if Claude Code)
    ├── clavix/
    │   ├── fast.md
    │   ├── deep.md
    │   ├── prd.md
    │   ├── plan.md
    │   ├── implement.md
    │   ├── start.md
    │   └── summarize.md
```

## Configuration

Clavix stores configuration in `.clavix/config.json`:

```json5
{
  version: "1.0.0",
  agent: "claude-code",
  templates: {
    prdQuestions: "default",
    fullPrd: "default",
    quickPrd: "default"
  },
  outputs: {
    path: ".clavix/outputs",
    format: "markdown"
  },
  preferences: {
    autoOpenOutputs: false,
    verboseLogging: false,
    preserveSessions: true
  }
}
```

## Customization

### Custom Templates

Override default templates by adding files to `.clavix/templates/`:

- `prd-questions.md` - Custom PRD questions
- `full-prd-template.hbs` - Full PRD format
- `quick-prd-template.hbs` - Quick PRD format

Templates use Handlebars syntax.

## Examples

### Example 1: Minimal to Comprehensive

**Original:**
```
Create a login page
```

**Improved:**
```markdown
# Objective
Build a secure user authentication login page

# Requirements
- Email and password input fields with validation
- "Remember me" checkbox
- "Forgot password" link
- Show clear error messages for invalid credentials
- Responsive design for mobile and desktop

# Technical Constraints
- Use React with TypeScript
- Integrate with existing JWT authentication API
- Follow WCAG 2.1 AA accessibility standards
- Support password managers

# Expected Output
- Fully functional login component
- Unit tests with >80% coverage
- Integration with auth context

# Success Criteria
- Users can log in successfully
- Invalid credentials show appropriate errors
- Page is accessible via keyboard navigation
- Loads in < 2 seconds
```

### Example 2: Slash Command Usage

In Claude Code:

```
/clavix:fast Create a dashboard for analytics
```

Claude will:
1. Analyze your prompt
2. Check if deep analysis is needed (smart triage)
3. Identify gaps, ambiguities, and strengths
4. Show changes made summary
5. Generate a structured, improved prompt
6. Display it ready for immediate use

For comprehensive analysis:

```
/clavix:deep Create a dashboard for analytics
```

Provides all fast mode features plus alternative phrasings, edge cases, implementation examples, and more.

### Example 3: When to Use Which Mode

**Use Fast Mode when:**
- You have a simple, straightforward prompt
- You need quick cleanup and structure
- Time is a priority

**Use Deep Mode when:**
- Requirements are complex or ambiguous
- You want to explore alternative approaches
- You need to think through edge cases
- You're planning a significant feature

**Use PRD Mode when:**
- You need strategic planning
- Architecture decisions are required
- Business impact and scalability matter

## Requirements

- Node.js >= 18.0.0
- npm or yarn

## License

MIT

## Links

- [GitHub Repository](https://github.com/Bob5k/Clavix)
- [Issue Tracker](https://github.com/Bob5k/Clavix/issues)
- [Changelog](CHANGELOG.md)

---

## Star History

<a href="https://www.star-history.com/#Bob5k/Clavix&type=date&legend=top-left">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=Bob5k/Clavix&type=date&theme=dark&legend=top-left" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=Bob5k/Clavix&type=date&legend=top-left" />
   <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=Bob5k/Clavix&type=date&legend=top-left" />
 </picture>
</a>
