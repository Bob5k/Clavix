# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
