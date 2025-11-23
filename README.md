# Clavix
> **Clavix Intelligence™** for AI coding. Transform rough ideas into production-ready prompts with automatic quality optimization—no framework to learn.

## Table of contents
- [Why Clavix?](#why-clavix)
- [How It Works](#how-it-works)
- [Providers](#providers)
- [Quickstart](#quickstart)
- [Full documentation](#full-documentation)

## Release Notes

| Version | Highlights | Details |
| --- | --- | --- |
| **v3.4.0** (Latest) | Provider categorization fixes | [Changelog](CHANGELOG.md#340---2025-11-24) |
| **v3.3.1** | JSON5/JSON config bug fix | [Changelog](CHANGELOG.md#331---2025-11-23) |
| **v3.3.0** | Provider management & interactive config | [Changelog](CHANGELOG.md#330---2025-11-23) |
| **v3.1.0** | Clavix Intelligence™ brand evolution | [Changelog](CHANGELOG.md#310---2025-11-23) |

**Requirements:** Node.js ≥ 16.0.0 (ESM support required)

## Why Clavix?
Better prompts lead to better code. Clavix automatically detects what you're trying to do and applies the right optimization patterns—no framework to learn, no methodology to master. Just describe what you want, and Clavix makes it AI-ready.

**What makes Clavix v3.0 unique:**
- **95%+ Intent Detection Accuracy** - Weighted keyword scoring, phrase-based detection, and negation handling
- **6 Production-Ready Optimization Patterns** - Automatically applied based on intent and quality assessment
- **Zero Learning Curve** - Works with your natural language, adapts to your style
- **Universal Integration** - Supports 20+ AI coding assistants with native slash commands

Learn more in [docs/why-clavix.md](docs/why-clavix.md).

## How It Works
Clavix uses **Clavix Intelligence™** (v3.0+) to automatically:
- **Detect intent** - 95%+ accuracy with weighted scoring, phrase detection, and context analysis
- **Assess quality** - Evaluates across 5 dimensions: Clarity, Efficiency, Structure, Completeness, Actionability
- **Apply patterns** - 6 optimization patterns automatically selected and prioritized for your specific need
- **Generate output** - Production-ready prompts optimized for AI coding assistants

**The magic happens automatically**—no frameworks to learn, no manual analysis required. Just describe what you want in plain language, and Clavix transforms it into an AI-ready prompt using battle-tested optimization patterns.

## Providers

| Category | Providers |
| --- | --- |
| IDE & editor extensions | Cursor · Windsurf · Kilocode · Roocode · Cline |
| CLI agents | Claude Code · Droid CLI · CodeBuddy CLI · OpenCode · Gemini CLI · Qwen Code · LLXPRT · Amp · Crush CLI · Codex CLI · Augment CLI |
| Universal adapters | AGENTS.md · GitHub Copilot · OCTO.md · WARP.md |

Provider paths and argument placeholders are listed in [docs/providers.md](docs/providers.md).

## Quickstart

### For AI Agents (Recommended)

Most Clavix users work through AI coding assistants:

> **💡 Choosing Your Mode:**
> - **Fast/Deep** – Modifying or improving existing features
> - **PRD** – Developing something completely new
>
> See [Choosing the Right Mode](docs/guides/workflows.md#choosing-the-right-mode) for detailed guidance.

```bash
# 1. Initialize in your project
npm install -g clavix
clavix init

# 2. Use slash commands in your AI agent
/clavix:fast "Create a login page"
/clavix:deep "Build an API for user management"
/clavix:prd  # Full PRD workflow

# 3. Manage saved prompts
/clavix:execute  # Execute saved prompts
/clavix:prompts  # Manage prompt lifecycle

# 4. Implement with task tracking
clavix plan              # Generate tasks from PRD
clavix implement         # Start implementation workflow
clavix task-complete <taskId>  # Mark tasks done with auto-commit
```

**Supported agents**: Claude Code, Cursor, Windsurf, and [17+ more providers](docs/providers.md)

Learn more: [Complete prompt lifecycle documentation](docs/commands/execute.md)

### Direct CLI Usage (Alternative)

You can also use Clavix directly from the terminal:

```bash
clavix init
clavix fast "Create a login page"
clavix deep "Build an API for user management"
clavix prd
```

## Full documentation
- Overview & navigation: [docs/README.md](docs/README.md)
- Command reference: [docs/commands/](docs/commands/README.md)
- Providers: [docs/providers.md](docs/providers.md)
- Clavix Intelligence: [docs/clavix-intelligence.md](docs/clavix-intelligence.md)
- Guides: [docs/guides/](docs/guides/workflows.md)

## Requirements

### For End Users
- **Node.js ≥ 16.0.0** (ESM support required)
- npm or yarn package manager

### For Contributors
- **Node.js ≥ 16.0.0**
- Run tests: `npm test`
- Lint: `npm run lint`
- Build: `npm run build`

## License
MIT

## Star History

<a href="https://www.star-history.com/#ClavixDev/Clavix&type=date&legend=top-left">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=ClavixDev/Clavix&type=date&theme=dark&legend=top-left" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=ClavixDev/Clavix&type=date&legend=top-left" />
   <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=ClavixDev/Clavix&type=date&legend=top-left" />
 </picture>
</a>
