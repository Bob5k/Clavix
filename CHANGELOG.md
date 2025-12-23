# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [5.9.0] - 2025-12-23

### Added

- **Architecture & Design Support** - Integrated architectural decision-making into core workflows:
  - `/clavix:start`: Added explicit probing for architectural patterns and design choices during conversation
  - `/clavix:summarize`: Added "Architecture & Design" section to requirements extraction and Mini-PRD template
  - `/clavix:prd`: Added dedicated Question 3.5 to structured Q&A for capturing design patterns (Monolith vs Microservices, Clean Architecture, etc.)
  - `/clavix:plan`: Added "Architecture First" principle to task generation, prioritizing structural setup tasks

### Changed

- **Agentic Template Improvements**:
  - Simplified optional questions in `/clavix:prd` by removing "Press Enter to skip" instructions (agents handle optionality natively)
  - Updated Plan template to enforce architectural setup before implementation tasks

## [5.8.2] - 2025-12-07

### Added

- **Clarifying Questions Protocol** - New systematic protocol for gathering critical information:
  - Added `clarifying-questions.md` component in `agent-protocols/`
  - Integrated into AGENT_MANUAL for universal access
  - Applied to planning/improvement commands: improve, prd, plan, start, summarize
  - 95% confidence threshold for when to ask questions
  - Structured format for multiple choice and custom input questions
  - Best practices and examples for effective questioning

- **Template Customization Documentation** - Comprehensive guide for customizing Clavix templates:
  - New `docs/template-customization.md` with full integration paths
  - Complete reference table showing where each integration generates templates
  - Step-by-step workflows for customizing canonical templates, integration-specific overrides, and components
  - Common customization examples (project context, security checklists, team standards)
  - Troubleshooting guide for template customization issues

### Changed

- **MANIFEST.md** - Updated component usage matrix:
  - Added clarifying-questions.md to agent protocols section
  - Updated usage matrix to show which commands include the new protocol
  - Clarified that clarifying-questions is included via AGENT_MANUAL

## [5.6.6] - 2025-11-28

### Added

- **Test Coverage Improvements** - 21 new tests for CLI commands:
  - 10 command behavior verification tests for `update.ts`
  - 11 reconfiguration flow tests for `init.ts`
  - Total test count: 1306 tests passing

- **Template Enhancements**:
  - Task dependency guidance in `plan.md` with explicit dependency markers
  - Scope creep detection and handling in `start.md`
  - Archive size management guidance in `archive.md`
  - Multi-topic handling in `refine.md` troubleshooting

- **Quality Dimension Documentation**:
  - Workflow-specific dimension usage table in `quality-dimensions.md`
  - Documented why `/clavix:summarize` excludes Specificity dimension
  - Added quality dimensions reference to `refine.md`

### Fixed

- **Documentation Consistency**:
  - Updated package.json description to list all 9 slash commands
  - Fixed "19+" to "20" AI tools count in README.md and docs
  - Standardized quality dimension terminology in `refine.md` (was using "Context/Constraints" instead of standard 6 dimensions)

- **MANIFEST.md** - Added `/clavix:refine` to usage matrix and updated quality-dimensions description

## [5.6.5] - 2025-11-28

### Fixed

- **UserConfigSchema Missing Fields** - Fixed Zod schema to match `ClavixConfig` interface

## [5.6.4] - 2025-11-28

### Fixed

- **UserConfigSchema Missing Fields** - Fixed Zod schema to match `ClavixConfig` interface:
  - Added `version`, `templates`, `outputs`, `preferences`, `experimental` fields
  - Eliminates false "Unknown fields" warnings during `clavix update`

## [5.6.3] - 2025-11-28

### Added

- **Zod Schema Validation** - Runtime validation for configuration files:
  - Added `zod` dependency for robust schema validation
  - Created `src/utils/schemas.ts` with validation schemas for `integrations.json` and user `config.json`
  - Integrated validation at adapter registry load time and in CLI commands
  - Contextual error messages for configuration issues

- **Universal Adapters in integrations.json** - 4 new documentation-only integrations:
  - `agents-md` - AGENTS.md universal agent guidance
  - `copilot-instructions` - GitHub Copilot instructions
  - `octo-md` - OCTO.md octopus format
  - `warp-md` - WARP.md format
  - Added `type` field ("standard" or "universal") to all integration entries

- **Template Documentation** - New `docs/templates.md` authoring guide:
  - Component include system (`{{INCLUDE:}}` markers)
  - Template anatomy and structure
  - Quality checklist for contributors

- **Schema Validation Tests** - 23 new tests covering:
  - `IntegrationEntrySchema`, `IntegrationsConfigSchema`, `UserConfigSchema`
  - Validation functions and error formatting

### Changed

- **Summarize→Plan Workflow** - Improved template coordination:
  - Added "Suggest + Confirm" pattern for project name in summarize template
  - Added fallback detection for `summarize/` directory in plan template
  - Added confirmation message with task count in implement template

- **Error Output Standardization** - Replaced `console.log`/`console.error` with Oclif methods:
  - All CLI commands now use `this.log()` and `this.error()` for consistent output
  - Contextual error hints for common configuration issues

- **Template Header Standardization** - All 9 slash command templates now use consistent format:
  - "## State Assertion (REQUIRED)" section header
  - Consistent structure across improve, prd, plan, implement, start, summarize, refine, verify, archive

- **README.md Reorganization** - Workflow-oriented documentation:
  - Added Mermaid workflow diagram showing command relationships
  - Organized commands by workflow: Quick Path, Full Planning, Exploratory, Refinement
  - All 9 slash commands prominently listed

- **CONTRIBUTING.md Updates** - Enhanced contributor guide:
  - Added "Quick Start for First-Time Contributors" decision table
  - Emphasized template-first architecture rules

### Fixed

- **JSON Parsing Crashes** - Wrapped all `JSON.parse` calls with try-catch:
  - `update.ts`, `init.ts`, `version.ts` now handle malformed JSON gracefully
  - User-friendly error messages instead of stack traces

- **Test Suite Updates** - Fixed tests for adapter count changes (16 → 20):
  - `agent-manager.test.ts` - Updated expected adapter count
  - `adapter-interface.test.ts` - Added special case for root directory adapters
  - `multi-integration-workflow.test.ts` - Added detection markers for universal adapters
  - `init.test.ts` - Fixed error output assertion

## [5.5.2] - 2025-11-28

### Added

- **`/clavix:refine` Command** - New slash command for refining existing PRDs and prompts:
  - Auto-detects available refinement targets (PRDs and saved prompts)
  - Change tracking with `[ADDED]`, `[MODIFIED]`, `[REMOVED]`, `[UNCHANGED]` markers
  - Before/after quality comparison for prompts
  - Refinement history tracking in PRD files
  - Integration guidance for next steps (plan regeneration, implementation)

- **Mandatory AGENTS.md Integration** - Universal agent guidance is now always enabled:
  - AGENTS.md automatically included in all installations
  - Removed from user selection (handled internally)
  - Added `ensureMandatoryIntegrations()` helper function
  - Users informed during init: "AGENTS.md is always enabled to provide universal agent guidance"

- **New AgentErrorMessages Methods** - Extended error messaging for better diagnostics:
  - `templateNotFound()` - When template files are missing
  - `adapterNotFound()` - When adapter lookup fails
  - `configLoadFailed()` - When configuration parsing fails
  - `updateFailed()` - When update command encounters issues
  - `diagnosticFailed()` - When diagnose command finds problems

### Changed

- **Error Handling Consistency** - Replaced generic `Error` throws with typed `DataError`:
  - `agents-md-generator.ts`, `octo-md-generator.ts`, `warp-md-generator.ts`
  - `copilot-instructions-generator.ts`, `instructions-generator.ts`
  - `toml-templates.ts`

- **Constants Consolidation** - Cleaned up `src/constants.ts`:
  - Removed 11 unused constants
  - Kept only `CLAVIX_BLOCK_START` and `CLAVIX_BLOCK_END`
  - Updated all imports to use constants instead of hardcoded values

- **CONTRIBUTING.md Updates** - Added explicit architecture boundaries:
  - "Explicitly Forbidden Features" section with 4 rejected proposals
  - Clear explanations for WHY certain features don't fit the architecture
  - Guidance on what TO do instead of forbidden patterns

### Fixed

- **Documentation Accuracy** - Fixed coverage claims and output paths:
  - Updated TESTING.md: Changed 100% to 70%+ (actual thresholds)
  - Updated getting-started.md: Added summarize outputs documentation
  - Updated docs/commands.md with full refine command documentation

## [5.5.1] - 2025-11-28

### Added

- **CONTRIBUTING.md** - Comprehensive contributor guide with architecture principles:
  - Documents agentic-first architecture and why it must remain so
  - Explains what CAN and CANNOT be changed (TypeScript won't help slash commands)
  - Full development setup, testing instructions, and PR process

- **Command Format Visibility** - Users now see their command format prominently:
  - `clavix init` output shows format at the TOP (e.g., "Your command format: /clavix:improve")
  - Generated `INSTRUCTIONS.md` includes command format table
  - All docs include format reference tables

### Changed

- **Documentation Consolidation** - Reduced 18+ scattered files to 5 focused documents:
  - `docs/README.md` - Single entry point with navigation
  - `docs/architecture.md` - Consolidated from how-it-works.md + philosophy.md
  - `docs/commands.md` - All 12 command docs in one file
  - `docs/getting-started.md` - Consolidated from 4 guide files
  - `docs/integrations.md` - Added Format column to integration tables

- **README.md** - Slimmed down with prominent command format section and links to consolidated docs

### Removed

- Deleted `docs/commands/` directory (12 individual command files)
- Deleted `docs/guides/` directory (4 guide files)
- Deleted `docs/how-it-works.md`, `docs/philosophy.md`, `docs/why-clavix.md` (merged into architecture.md)

## [5.5.0] - 2025-11-27

### Changed

- **Adapter Architecture Refactor** - Unified adapter system using config-driven factory pattern:
  - Migrated 12 simple adapters to `UniversalAdapter` class with `ADAPTER_CONFIGS` registry
  - Kept dedicated classes for special adapters: `ClaudeCodeAdapter` (doc injection), `GeminiAdapter`, `QwenAdapter`, `LlxprtAdapter` (TOML format)
  - Reduced code duplication significantly while maintaining all functionality

- **Error Handling Improvements**:
  - Template assembly failures now throw `DataError` instead of silent warnings
  - Standardized all `console.warn` calls to use `logger.warn` utility
  - Fixed deprecated `escapeRegex` wrapper in `base-adapter.ts`

### Removed

- **Code Consolidation**:
  - Deleted 12 redundant adapter source files (cursor, windsurf, kilocode, roocode, cline, droid, opencode, crush, codebuddy, amp, augment, codex)
  - Deleted corresponding 12 adapter test files
  - Removed deprecated archive documentation files

- **Documentation Cleanup**:
  - Removed v4-era configuration references from `docs/guides/configuration.md`
  - Removed outdated session references from command documentation
  - Deleted `docs/archive/` directory with obsolete files

### Fixed

- Updated test files to use dynamic adapter paths instead of hardcoded directories
- Fixed adapter contract tests to work with new factory pattern
- Fixed multi-integration workflow tests for correct adapter detection

## [5.4.0] - 2025-11-27

### Changed

- **Documentation cleanup** - Comprehensive review and update of all documentation:
  - Removed outdated `/docs/clavix-intelligence.md` (referenced removed pattern system)
  - Updated `/docs/guides/workflows.md` for v5 architecture (no more `clavix fast`/`clavix deep`)
  - Updated `/docs/how-it-works.md` to explain agentic-first architecture
  - Fixed `/src/templates/instructions/README.md` component references

- **Consistent terminology** - Standardized naming across all files:
  - "Optimize" → "Improve" in template naming and documentation
  - "provider" → "integration" in code comments and variables
  - "execute" → "implement" in agent templates

- **Template improvements** - Enhanced agent instruction quality:
  - Added Self-Correction Protocol to `implement.md`, `verify.md`, `archive.md`
  - Added State Assertion blocks for mode enforcement
  - Softened defensive tone in `improve.md` while maintaining mode boundaries

### Removed

- **Dead code cleanup**:
  - Removed `preserveSessions` from `PreferencesConfig` (sessions removed in v5.3.0)
  - Removed `sessionNotFound()` from `AgentErrorMessages`
  - Removed session directory references from error messages

- **Outdated documentation**:
  - Deleted `/docs/clavix-intelligence.md`
  - Removed broken links from `/docs/README.md`

### Fixed

- **Test factory alignment** - Updated `config-factory.ts` to match current `ClavixConfig` shape
- **Instructions README** - Fixed references to non-existent component files

---

## [5.3.1] - 2025-11-27

### Fixed

- **Cline integration cleanup bug** - When deselecting Cline during `clavix init` reconfiguration and choosing "Clean up", the `.clinerules/workflows/clavix/` subdirectory is now properly removed. Previously, `removeAllCommands()` only removed files, ignoring subdirectories.

---

## [5.3.0] - 2025-11-27

### BREAKING CHANGES

- **Session persistence removed** - The `.clavix/sessions/` directory is no longer created or used. Session-based workflows are now handled entirely by AI agent context.

### Added

- **Adapter registry infrastructure** - New config-driven adapter system (`adapter-registry.ts`, `universal-adapter.ts`) enables consistent adapter behavior through configuration rather than code duplication.

- **Init reconfiguration menu** - When running `clavix init` in an already-initialized project, a menu offers three options:
  - "Reconfigure integrations" - Change selected integrations
  - "Update existing" - Regenerate commands for current integrations
  - "Cancel" - Exit without changes

- **Removed commands consistency test** - New test suite (`removed-commands.test.ts`) verifies deprecated commands are properly removed from CLI, manifest, and documentation.

- **Template component manifest** - New `MANIFEST.md` documents all reusable components in the template system.

### Changed

- **Config command eliminated** - `clavix config` functionality has been merged into `clavix init`:
  - Use `clavix init` → "Reconfigure integrations" to change integrations
  - Use `clavix init` → "Update existing" to regenerate commands

- **Legacy cleanup utility deprecated** - `legacy-command-cleanup.ts` is now marked for removal in v6.0.0 as the transition period for old naming patterns completes.

### Removed

- **`clavix config` command** - Use `clavix init` instead (see Changed section)

- **Orphaned template components** - Removed unused `decision-rules.md` and `error-handling.md` from `_components/`

- **Session references in templates** - Removed session-related content from `agents.md`, `copilot-instructions.md`, `warp.md`, `plan.md`, and `file-operations.md`

### Fixed

- **Test suite improvements** - Added comprehensive tests for:
  - Update command flag behavior (docs-only, commands-only, force)
  - Init reconfiguration menu flows
  - v5.3 removed features (sessions directory, config command)

---

## [5.2.1] - 2025-11-27

### Fixed

- **Diagnose command false warnings** - Fixed 3 bugs where `clavix diagnose` showed incorrect warnings after successful `clavix init`:
  - No longer expects `.clavix/commands/` directory (commands go to adapter-specific directories)
  - Recognizes doc generator integrations (agents-md, octo-md, warp-md, copilot-instructions) as valid
  - Removed misleading "No slash commands installed" check

---

## [5.2.0] - 2025-11-27

### Added

- **New `clavix diagnose` command** - Full diagnostic report for troubleshooting installations
  - Version check
  - Directory structure validation
  - Config integrity verification
  - Integration status with command counts
  - Template integrity check
  - Summary with recommendations

- **Slash commands in `--help`** - Help output now shows available slash commands alongside CLI commands

- **Feature matrix in README** - Clear comparison of capabilities across integrations (Claude Code, Cursor, Gemini, etc.)

### Changed

- **DRY adapter architecture** - Created `TomlFormattingAdapter` base class eliminating ~140 lines of duplication across Gemini, Qwen, and LLXPRT adapters

- **DRY documentation generators** - Refactored `AgentsMdGenerator`, `OctoMdGenerator`, `WarpMdGenerator`, and `CopilotInstructionsGenerator` to use `DocInjector` utility

- **Verify/Archive reorganized** - Now clearly documented as "Agentic Utilities" separate from core workflow commands

### Removed

- **Global config flag** - Removed unimplemented `-g/--global` flag from `clavix config` command

- **Vestigial v4 config types** - Removed ~90 lines of unused `IntelligenceConfig`, `EscalationThresholdsConfig`, `QualityWeightsConfig`, and `PatternSettingsConfig` interfaces

### Fixed

- **Consistent documentation** - All agent templates (CLAUDE.md, AGENTS.md, OCTO.md, WARP.md, copilot-instructions.md) now have consistent verify/archive categorization

---

## [5.1.1] - 2025-11-27

### Changed

- Consolidated `execute` into `implement` command
- Removed standalone `prompts` command (now part of implement workflow)

---

## [5.0.0] - 2025-11-27

### BREAKING: Agentic-First Architecture

**Clavix v5 is a complete architectural rewrite.** The TypeScript intelligence layer has been removed in favor of a lean, agentic-first design where markdown templates are the product.

#### Why This Change?

Analysis revealed that **99% of Clavix usage was through slash commands** in AI IDEs (Claude Code, Cursor, etc.), where AI agents read markdown templates and execute them using their native tools. The TypeScript intelligence layer (~18,500 lines) only executed via rarely-used CLI commands.

v5 embraces reality: **templates instruct agents directly**, no TypeScript code runs during workflow execution.

#### What's Removed

| Component | Lines Removed |
|-----------|---------------|
| CLI commands (15) | ~5,800 |
| Intelligence layer | ~7,790 |
| Core managers (14) | ~5,200 |
| Tests for removed code | ~31,300 |
| **Total** | **~50,000 lines** |

##### Removed CLI Commands
- `clavix improve`, `clavix prd`, `clavix plan`, `clavix implement`
- `clavix start`, `clavix summarize`, `clavix execute`, `clavix verify`
- `clavix archive`, `clavix analyze`, `clavix task-complete`
- `clavix list`, `clavix show`, `clavix prompts list/clear`

##### Removed Core Modules
- `universal-optimizer.ts`, `quality-assessor.ts`, `pattern-library.ts`
- `intent-detector.ts`, `confidence-calculator.ts`
- 20 pattern files in `intelligence/patterns/`
- `prompt-manager.ts`, `session-manager.ts`, `task-manager.ts`
- `archive-manager.ts`, `git-manager.ts`, `prd-generator.ts`
- `verification-manager.ts`, `question-engine.ts`

#### What Remains

**4 CLI Commands (for setup only):**
| Command | Purpose |
|---------|---------|
| `clavix init` | Initialize Clavix in a project |
| `clavix update` | Update templates after package update |
| `clavix config` | Manage configuration |
| `clavix version` | Show version |

**8 Slash Commands (executed by AI agents):**
- `/clavix:improve` - Prompt optimization
- `/clavix:prd` - PRD generation
- `/clavix:plan` - Task breakdown
- `/clavix:implement` - Task/prompt execution (auto-detects source)
- `/clavix:start` - Conversational exploration
- `/clavix:summarize` - Extract requirements from conversation
- `/clavix:verify` - Verify implementation
- `/clavix:archive` - Archive completed projects

**22 Integration Adapters** - All adapters remain for multi-tool support.

#### How It Works Now

1. User runs `/clavix:improve "prompt"` in their AI IDE
2. AI agent reads the markdown template at `.clavix/commands/improve.md`
3. Agent follows instructions using native tools (Write, Read, Edit, etc.)
4. Output saved to `.clavix/outputs/`

No TypeScript code executes. Templates are self-contained instructions.

#### Template Updates

Templates updated for v5 agentic-first approach:
- Removed CLI command references (agents use native tools)
- Removed `.index.json` - prompts use frontmatter metadata
- Added explicit "How I Do It" sections for agent operations
- Updated file format documentation

#### Migration from v4

If you have v4 projects:
1. Run `npm install -g clavix@latest`
2. Run `clavix update` in your project
3. Old outputs in `.clavix/outputs/` are preserved
4. v4 CLI commands no longer exist - use slash commands instead

#### For v4 Documentation

See [docs/archive/v4-architecture.md](docs/archive/v4-architecture.md) for the previous architecture.

---
