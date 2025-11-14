# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.5.0] - 2025-11-14

### 🚀 Major Features

#### Vibecoding-Optimized PRD Generation
- **Streamlined Questions**: Reduced from 8 questions to 5 focused questions for faster workflow
- **Smart Tech Detection**: Auto-detects tech stack from project files (package.json, requirements.txt, Gemfile, go.mod, Cargo.toml, composer.json)
- **CLEAR Framework Integration**: Questions designed with CLEAR principles (Concise, Logical, Explicit)
- **Maintained Quality**: All essential information captured without ceremony

### 🎯 New PRD Question Structure

**5 Focused Questions:**
1. 🎯 **Problem & Goal** (Required) - What are we building and why?
2. ⚡ **Core Features** (Required) - Must-have functionality (3-5 features)
3. 🔧 **Tech Stack** (Smart/Optional) - Auto-detected or manual input
4. 🚫 **Out of Scope** (Required) - Explicit boundaries
5. 💡 **Additional Context** (Optional) - Bonus information

**Removed Questions:**
- ❌ Target users - Unnecessary for personal projects and vibecoding
- ❌ Success metrics - Too "corporate" for fast iteration
- ❌ Deadlines/milestones - Not applicable for AI-driven development

### ✨ Smart Tech Stack Detection

**Automatic Detection:**
- Scans common config files in project root
- Detects frameworks from package.json dependencies (React, Vue, Next.js, Astro, etc.)
- Supports Python (Django, Flask, FastAPI), Ruby (Rails), Go, Rust, PHP (Laravel, Symfony)
- Shows detected stack with option to press Enter to accept or type to override
- Gracefully skips if extending existing project

**User Experience:**
```
🔧 Tech stack and requirements?
  Detected: TypeScript, Astro, Tailwind CSS (press Enter to use, or type to override)
```

### 🔧 Technical Improvements

**PRD Generator:**
- Added `detectProjectTechStack()` method in `prd.ts` for intelligent stack detection
- Updated question mapping: q1 → problem, q2 → features, q3 → technical, q4 → outOfScope, q5 → additional
- Enhanced question flow with conditional smart detection for Q3
- Auto-populates Q3 with detected stack if user presses Enter

**Templates:**
- Updated `prd-questions.md` with 5 streamlined questions and emoji indicators
- Simplified `full-prd-template.hbs` - removed users, success, timeline sections
- Optimized `quick-prd-template.hbs` for vibecoding workflow
- Updated acceptance criteria to reflect new structure

**Documentation:**
- Updated `.claude/commands/clavix/prd.md` slash command description
- Enhanced `CLAUDE.md` with vibecoding-optimized workflow details
- Updated `README.md` features and command descriptions

### 📊 Impact

**Time Savings:**
- ~40% reduction in question count (8 → 5 questions)
- Smart defaults for tech stack reduce manual input
- Optional questions can be skipped entirely

**Quality Maintained:**
- CLEAR validation still applies (C, L, E components)
- All essential project context captured
- Out-of-scope boundaries remain required for clarity

### 🎨 UX Enhancements

- Emoji indicators for each question type
- Clear "(Required)" vs "(Optional)" labels
- Helpful inline hints (e.g., "press Enter to skip if extending existing project")
- Color-coded detected tech stack display

### 📝 Migration Notes

**No Breaking Changes:**
- Existing PRD templates continue to work
- Custom templates in `.clavix/templates/` still supported
- CLEAR validation unchanged (C, L, E only for PRDs)

**New Behavior:**
- Q3 (tech stack) now auto-detects from project files
- Users can press Enter to skip optional questions
- Generated PRDs have simpler section structure

---

## [1.4.1] - 2025-11-14

### 🐛 Bug Fixes

#### Missing Commands in New Providers
- **Fixed**: Added missing `plan.md` and `implement.md` commands to all providers
- **Affected**: Cursor, Droid CLI, OpenCode, Amp providers
- **Root cause**: Commands were added to deployed location instead of source templates in v1.3.0
- **Impact**: Users selecting new providers (cursor, droid, opencode, amp) now receive complete command set including `/clavix:plan` and `/clavix:implement`

### 📝 What Was Fixed
- Added `plan.md` to all 5 provider template directories
- Added `implement.md` to all 5 provider template directories
- Verified frontmatter compatibility with Droid and OpenCode YAML requirements
- All providers now have feature parity with Claude Code

### ✅ Complete Command List (All Providers)
- `/clavix:fast` - Quick prompt improvements
- `/clavix:deep` - Comprehensive analysis
- `/clavix:prd` - PRD generation
- `/clavix:plan` - Task breakdown ✨ NEW for cursor/droid/opencode/amp
- `/clavix:implement` - Task execution ✨ NEW for cursor/droid/opencode/amp
- `/clavix:start` - Conversational mode
- `/clavix:summarize` - Extract requirements

---

## [1.4.0] - 2025-11-14

### 🎉 Major Features

#### Multi-Provider Support
- **Breaking Change**: Config now uses `providers: string[]` instead of `agent: string`
- Interactive multi-select checkbox UI during `clavix init`
- Select multiple AI development tools simultaneously
- Automatic config migration from v1.3.0 → v1.4.0

#### New Provider Support
- ✨ **Cursor** - `.cursor/commands/` (flat structure, no frontmatter)
- ✨ **Droid CLI** - `.factory/commands/` (YAML frontmatter, `$ARGUMENTS` placeholder)
- ✨ **OpenCode** - `.opencode/command/` (frontmatter with description, `$ARGUMENTS`)
- ✨ **Amp** - `.agents/commands/` (simple markdown, experimental executable support)
- ✨ **Universal agents.md** - Workflow instructions for tools without slash command support

### 🏗️ Architecture Improvements
- Introduced `BaseAdapter` abstract class for shared adapter logic
- Plugin-based provider system ensures backward compatibility
- Per-provider validation before command generation
- Template system with `{{ARGS}}` placeholder replaced by adapter-specific formats
- Isolated provider modules - adding new providers doesn't affect existing ones

### 🔧 Enhancements
- Enhanced `AgentAdapter` interface with `directory`, `fileExtension`, `features` properties
- Added `ProviderFeatures` interface for provider-specific capabilities
- Added `ValidationResult` interface for adapter validation
- Config migration utilities: `migrateConfig()`, `isLegacyConfig()`
- `AgentManager` now registers all 5 provider adapters
- Per-provider validation with error/warning reporting
- Improved init command UX with provider descriptions and checkbox validation

### 📝 Templates
- Created provider-specific template directories for all 5 providers
- Universal `agents.md` template with workflow detection and CLEAR framework integration
- Standardized `{{ARGS}}` placeholder across all base templates
- Provider adapters transform placeholders to tool-specific formats

### 🧪 Testing & Quality
- TypeScript compilation successful across all new code
- Backward compatibility maintained for v1.3.0 configurations
- BaseAdapter inheritance tested across all provider adapters

### 📚 Documentation
- Updated README with supported tools table
- Multi-provider selection example in Quick Start
- Updated "AI Agent Integration" section
- Comprehensive PRD and implementation plan in `.clavix/outputs/`
- Migration guide for v1.3.0 users

### ⚠️ Breaking Changes
- Config field `agent: string` replaced with `providers: string[]`
- Old configs automatically migrated on next `clavix init`
- No manual migration required - fully automated

### 📦 Migration Guide
If upgrading from v1.3.0:
1. Run `clavix init` in your project
2. Select desired providers (old provider pre-selected)
3. Config automatically migrated to v1.4.0 format
4. Slash commands regenerated for all selected providers

---

## [1.3.0] - 2025-11-14

### Added

- **PRD-to-Implementation Workflow** - Seamless transition from PRD to coded features
  - `clavix plan` command - Generates implementation task breakdown from PRD
  - `clavix implement` command - Executes tasks with AI assistance and session resume
  - Tasks organized into logical phases with CLEAR-optimized atomic descriptions
  - Markdown checkbox format (`- [ ]` / `- [x]`) for stateful progress tracking
  - Task references to PRD sections for context and traceability

- **Git Auto-Commit Integration** - Optional automatic commits during implementation
  - Four commit strategies: per-task, per-5-tasks, per-phase, or none
  - Interactive CLI prompt for commit preference selection
  - Descriptive commit messages with task lists and project context
  - `CommitScheduler` class for tracking commit timing
  - `GitManager` class for git operations and validation

- **Session Resume Capability** - Pick up where you left off
  - Stateful task tracking via markdown checkboxes
  - Automatic detection of first incomplete task
  - Progress statistics (completed/total/percentage)
  - Configuration file (`.clavix-implement-config.json`) for AI agent coordination

- **Core Classes**:
  - `TaskManager` - PRD parsing, task generation, file I/O, progress tracking
  - `GitManager` - Git operations, commit creation, repository validation
  - `CommitScheduler` - Strategy-based commit timing logic

- **Slash Commands**:
  - `/clavix:plan` - Generate task breakdown from PRD
  - `/clavix:implement` - Execute tasks with AI assistance

### Changed

- **Command Structure**: Updated slash command file organization
  - Commands now in `.claude/commands/clavix/` subdirectory
  - README.md updated with plan and implement command documentation
  - CLAUDE.md updated with new workflow commands

### Documentation

- **README.md**: New "PRD-to-Implementation Workflow" feature section
- **Slash Commands**: Detailed implementation guides for AI agents
- **Examples**: Git commit format and task tracking examples

## [1.2.0] - 2025-01-13

### Added

- **CLEAR Framework Integration** - Academically-validated prompt engineering methodology
  - Integrated Dr. Leo Lo's CLEAR Framework (Concise, Logical, Explicit, Adaptive, Reflective)
  - Fast mode now applies C, L, E components with enhanced triage
  - Deep mode now applies full CLEAR framework (C, L, E, A, R)
  - PRD mode now validates generated PRDs using CLEAR framework (C, L, E)
  - Summarize mode now optimizes extracted prompts using CLEAR framework (C, L, E)
  - Added `--framework-info` flag to all commands for CLEAR education
  - Added `--clear-only` flag to fast/deep modes for score-only display
  - Added `--skip-validation` flag to PRD mode
  - Added `--skip-clear` flag to summarize mode
  - Academic citation included: Lo, L. S. (2023). "The CLEAR Path: A Framework for Enhancing Information Literacy through Prompt Engineering"

### Changed

- **Core Engine**: `PromptOptimizer` now uses CLEAR framework methods
  - `applyCLEARFramework(prompt, mode)` orchestrator for all modes
  - Individual component analyzers: `analyzeConciseness()`, `analyzeLogic()`, `analyzeExplicitness()`, `analyzeAdaptiveness()`, `analyzeReflectiveness()`
  - `calculateCLEARScore()` for comprehensive scoring
  - Backward compatibility preserved via `mapCLEARToLegacy()` helper

- **Documentation**: Comprehensive CLEAR framework documentation
  - README.md now prominently features CLEAR Framework with academic citation
  - CLAUDE.md updated with CLEAR-aware slash command descriptions
  - All slash command templates updated to reference CLEAR components
  - Added "Why CLEAR?" section explaining the framework benefits

- **Output Format**: Enhanced user-facing output
  - Color-coded CLEAR scores (green ≥80, yellow ≥60, red <60)
  - Component-labeled improvements ([C], [L], [E], [A], [R])
  - Educational "Changes Made" section references CLEAR components
  - PRD validation shows AI consumption quality scores
  - Summarize generates both raw and CLEAR-optimized versions

### Fixed

- Lint errors: Removed unused error variables in catch blocks

## [1.1.2] - 2025-11-13

### Fixed

- **Template Path Resolution**
  - Fix template path resolution in globally installed package
  - Add copyfiles to build process for template distribution
  - Update template paths from `src/templates/` to `dist/templates/` for production
  - Ensure templates are included in npm package
  - Fix `clavix init` and `clavix update` failures when installed via `npm install -g`

## [1.1.1] - 2025-11-13

### Fixed

- **Command Structure**
  - Adopt OpenSpec directory structure for Claude commands (`.claude/commands/clavix/*.md`)
  - Remove colons from command filenames for cross-platform compatibility
  - Fix `clavix update` to dynamically scan template directory (no hardcoded lists)
  - Fix JSON5 config parsing in update command
  - Add automatic migration from old command structure
  - Commands now properly update during re-initialization

### Changed

- **Command Organization**
  - Move commands to `.claude/commands/clavix/` subdirectory
  - Update template filenames (removed colons)
  - Add `name:` field to command frontmatter

- **Documentation**
  - Update command references from `clavix:improve` to `clavix:fast` and `clavix:deep`
  - Add usage guidance for fast vs deep vs PRD modes
  - Update AGENTS.md and CLAUDE.md with new command paths

## [1.1.0] - 2025-11-13

### Added

- **Dual-Mode Prompt Improvement System**
  - `clavix fast` command for quick prompt improvements with smart triage
  - `clavix deep` command for comprehensive prompt analysis
  - Smart triage system that detects when prompts need deep analysis based on:
    - Prompt length < 20 characters
    - Missing 3+ critical elements (context, tech stack, success criteria, user needs, expected output)
    - Vague scope words without sufficient context
  - Quality assessment feature that identifies already-good prompts (meeting 3/4 quality criteria)
  - "Changes Made" educational summary in both modes
  - Deep mode exclusive features:
    - Alternative phrasings of requirements
    - Edge case identification for requirements
    - Good/bad implementation examples
    - Alternative prompt structures
    - "What could go wrong" analysis

- **Colon Notation for Slash Commands**
  - Migrated all slash commands from dash to colon notation
  - `/clavix:fast` - Quick prompt improvements
  - `/clavix:deep` - Comprehensive analysis
  - `/clavix:prd` - PRD generation (renamed from `/clavix-prd`)
  - `/clavix:start` - Conversational mode (renamed from `/clavix-start`)
  - `/clavix:summarize` - Conversation analysis (renamed from `/clavix-summarize`)

### Changed

- Enhanced `PromptOptimizer` class with dual-mode support
- Updated all documentation to reflect new command structure
- Updated managed documentation blocks (AGENTS.md, CLAUDE.md)
- Improved initialization workflow to generate colon-based slash commands

### Removed

- `clavix improve` command (replaced by `fast` and `deep` commands)
- `/clavix:improve` slash command (replaced by `/clavix:fast` and `/clavix:deep`)

### Fixed

- Test suite updated to reflect new command structure (153/153 tests passing)

## [1.0.0] - 2025-11-13

### Added

- Initial release
- Global CLI tool for prompt improvement and PRD generation
- Claude Code integration with slash commands
- Prompt improvement with gap and ambiguity analysis
- PRD generation through guided Socratic questioning
- Conversational mode for iterative requirement gathering
- Session management for tracking conversations
- Managed documentation injection (AGENTS.md, CLAUDE.md)
- Template system for customization
- Configuration management (`clavix config`)
- List and show commands for session inspection
- Update command for managed blocks

---

**Made for vibecoders, by vibecoders** 🚀
