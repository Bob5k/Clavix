# Supported Integrations

Clavix can generate slash commands and documentation snippets for a wide range of IDEs and CLI agents. The tables below summarize where command files are written, the command format used, and which argument placeholders apply.

## Command Format Quick Reference

**Your command format depends on your AI tool:**

| Tool Type | Separator | Example |
|-----------|-----------|---------|
| **TOML-based CLI agents** (Claude Code, Gemini, Qwen, LLXPRT) | Colon (`:`) | `/clavix:improve` |
| **Markdown-based tools** (Cursor, Windsurf, Cline, Kilocode, Roocode, Amp, Crush, Droid, etc.) | Hyphen (`-`) | `/clavix-improve` |

**Rule of thumb:** TOML/folderized tools use colon, flat markdown tools use hyphen.

## Template architecture

Starting with v2.4.0, Clavix uses **canonical templates** that are automatically formatted for each integration at runtime. This architecture ensures:

- **Consistency**: All integrations receive identical template content and logic
- **Maintainability**: Single source of truth in `src/templates/slash-commands/_canonical/`
- **Efficiency**: 67% smaller package size (1.5MB → 830KB unpacked)
- **Quality**: Updates and bug fixes apply automatically to all integrations

Integration-specific formatting is handled by each adapter's `formatCommand()` method:
- **Markdown integrations**: Use canonical content as-is or with minimal formatting
- **TOML integrations** (Gemini, Qwen): Convert to TOML with `prompt = """..."""` wrapper
- **Special integrations** (Crush): Apply custom placeholder transformations

For detailed information on template customization and override options, see [Getting Started](getting-started.md#template-customization).

## IDEs and editor extensions

| Integration | Format | Command location | Subdirectories | Placeholder |
| --- | --- | --- | --- | --- |
| Cursor | `-` | `.cursor/rules/` | No | *(implicit)* |
| Windsurf | `-` | `.windsurf/rules/` | No | *(implicit)* |
| Kilocode | `-` | `.kilocode/rules/` | No | *(implicit)* |
| Roo-Code | `-` | `.roo/rules/` | No | *(implicit)* |
| Cline | `-` | `.clinerules/` | No | *(implicit)* |

## CLI agents and toolchains

| Integration | Format | Command location | Subdirectories | Placeholder |
| --- | --- | --- | --- | --- |
| Claude Code | `:` | `.claude/commands/clavix/` | Yes | *(implicit)* |
| Droid (Factory AI) | `-` | `.factory/commands/` | No | `$ARGUMENTS` |
| CodeBuddy | `-` | `.codebuddy/rules/` | No | *(implicit)* |
| OpenCode | `-` | `.opencode/command/` | No | `$ARGUMENTS` |
| Gemini CLI | `:` | `.gemini/commands/clavix/` | Yes | `{{args}}` |
| Qwen CLI | `:` | `.qwen/commands/clavix/` | Yes | `{{args}}` |
| LLXpert | `:` | `.llxprt/commands/clavix/` | Yes | `{{args}}` |
| Amp | `-` | `.agents/commands/` | No | *(implicit)* |
| Crush | `-` | `.crush/commands/` | No | *(implicit)* |
| Codex CLI | `-` | `~/.codex/prompts/` (global) | No | `$ARGUMENTS` |
| Augment Code | `-` | `.augment/rules/` | No | *(implicit)* |

## Universal adapters

- **AGENTS.md** *(mandatory, always enabled)* – Adds a managed block to `AGENTS.md` for tooling that ingests long-form documentation instead of slash commands. This integration is **always enabled by default** to ensure all AI tools receive universal agent guidance, regardless of which other integrations you select.
- **GitHub Copilot** – Generates `.github/copilot-instructions.md` with natural language Clavix workflow instructions per [official GitHub documentation](https://docs.github.com/en/copilot/how-tos/configure-custom-instructions/add-repository-instructions).
- **OCTO.md** – Generates content tailored for Octofriend's markdown interface.
- **WARP.md** – Provides Clavix quick-start guidance optimized for Warp users.

> **Note:** AGENTS.md is not shown in the integration selection prompt because it's always included automatically. This ensures consistent agent guidance across all projects.

### Multi-select during `clavix init`

`clavix init` uses an interactive checkbox list so you can enable multiple integrations at once. Clavix remembers the integrations in `.clavix/config.json` and `clavix update` regenerates the corresponding commands on demand.

For a complete walkthrough of the initialization flow, see [Commands Reference](commands.md#clavix-init).
