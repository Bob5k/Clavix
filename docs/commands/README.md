# Command reference

Each Clavix command is documented in its own file under this directory. Every entry covers description, syntax, arguments, flags, inputs, outputs, real-world examples, and notable messages you may encounter.

## CLI Commands (Setup)

- [clavix init](init.md) - Initialize Clavix in a project
- [clavix update](update.md) - Update templates after package update
- [clavix config](config.md) - Manage configuration
- [clavix version](version.md) - Show version

## Slash Commands (Workflow)

These commands are executed via slash commands that AI agents read and follow:

### Prompt Optimization
- [/clavix:improve](../guides/workflows.md) - Smart prompt optimization with auto-depth

### PRD & Planning
- [/clavix:prd](prd.md) - Generate PRD through guided questions
- [/clavix:plan](plan.md) - Create task breakdown from PRD
- [/clavix:implement](implement.md) - Execute tasks or prompts (auto-detects source)

### Conversational Mode
- [/clavix:start](start.md) - Begin conversational session
- [/clavix:summarize](summarize.md) - Extract requirements from conversation

### Verification & Cleanup
- /clavix:verify - Verify implementation
- [/clavix:archive](archive.md) - Archive completed projects

## Utility Commands

- [clavix list](list.md) - List projects or prompts
- [clavix show](show.md) - Show project details
- [clavix task-complete](task-complete.md) - Mark tasks complete

Use these documents alongside the guide section for deeper context on configuration and end-to-end workflows.
