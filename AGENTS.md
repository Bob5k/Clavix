<!-- OPENSPEC:START -->
# OpenSpec Instructions

These instructions are for AI assistants working in this project.

Always open `@/openspec/AGENTS.md` when the request:
- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use `@/openspec/AGENTS.md` to learn:
- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Keep this managed block so 'openspec update' can refresh the instructions.

<!-- OPENSPEC:END -->

<!-- CLAVIX:START -->
## Clavix Integration

This project uses Clavix for prompt improvement and PRD generation.

### Available Commands
- `clavix prd` - Generate a comprehensive PRD through guided questions
- `clavix fast [prompt]` - Quick prompt improvements with smart triage
- `clavix deep [prompt]` - Comprehensive prompt analysis
- `clavix start` - Start a conversational session for iterative development
- `clavix summarize` - Extract requirements from conversation history
- `clavix list` - List all sessions and outputs
- `clavix show [session-id]` - Show detailed session information

### Quick Start
```bash
# Generate a PRD
clavix prd

# Quick prompt improvement
clavix fast "Build a user auth system"

# Deep prompt analysis
clavix deep "Build a user auth system"

# Start conversational mode
clavix start
```

Learn more: https://github.com/Bob5k/Clavix
<!-- CLAVIX:END -->
