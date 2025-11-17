# Clavix Workflows for GitHub Copilot

These instructions enhance GitHub Copilot's understanding of the Clavix prompt engineering framework and workflow commands available in this project.

## About Clavix

Clavix is a CLEAR Framework-validated prompt engineering toolkit that helps improve prompts, generate PRDs, and manage implementation workflows. The CLEAR Framework (Concise, Logical, Explicit, Adaptive, Reflective) is an academically-validated approach developed by Dr. Leo Lo at the University of New Mexico.

## Available Commands

When working with this project, you can use the following Clavix commands:

### Prompt Improvement
- `clavix fast "<prompt>"` - Quick CLEAR analysis (C/L/E components) with improved prompt output
- `clavix deep "<prompt>"` - Comprehensive CLEAR analysis (all 5 components: C/L/E/A/R) with alternatives and validation

### Strategic Planning
- `clavix prd` - Interactive PRD generation through Socratic questioning
- `clavix plan` - Transform PRDs into phase-based implementation tasks
- `clavix implement [--commit-strategy=<type>]` - Execute tasks with progress tracking (git: per-task, per-5-tasks, per-phase, none [default])

### Conversational Workflows
- `clavix start` - Begin conversational session for requirements gathering
- `clavix summarize [session-id]` - Extract mini-PRD and optimized prompts from sessions

### Project Management
- `clavix list` - List sessions and output projects
- `clavix show [session-id]` - Inspect session or project details
- `clavix archive [project]` - Archive or restore completed projects
- `clavix update` - Refresh Clavix documentation and commands

### Prompt Lifecycle Management (v2.7+)
Clavix now automatically saves optimized prompts from fast/deep commands for later execution:

- `clavix execute [--latest]` - Execute saved prompts from fast/deep optimization
  - Interactive selection from saved prompts
  - `--latest` flag for most recent prompt
  - `--fast` / `--deep` filters with `--latest`
  - `--id <prompt-id>` for specific prompt execution

- `clavix prompts list` - View all saved prompts with lifecycle status
  - Status indicators: NEW, EXECUTED, OLD (>7 days), STALE (>30 days)
  - Storage statistics dashboard
  - Age warnings and hygiene recommendations

- `clavix prompts clear` - Manage prompt cleanup with safety checks
  - `--executed` - Clear executed prompts only (safe cleanup)
  - `--stale` - Clear prompts >30 days old
  - `--fast` - Clear fast mode prompts
  - `--deep` - Clear deep mode prompts
  - `--all` - Clear all prompts (with confirmation)
  - `--force` - Skip confirmation prompts

**Prompt Lifecycle Workflow:**
1. Optimize: `clavix fast/deep "<prompt>"` → Auto-saved to `.clavix/outputs/prompts/`
2. Review: `clavix prompts list` → View all saved prompts with status
3. Execute: `clavix execute --latest` → Implement when ready
4. Cleanup: `clavix prompts clear --executed` → Remove completed prompts

## Workflow Patterns

### Quick Prompt Improvement
1. User provides a rough prompt
2. Run `clavix fast "<prompt>"` for quick CLEAR-validated improvements
3. Use the optimized prompt for better results

### Comprehensive Prompt Analysis
1. User has a complex requirement
2. Run `clavix deep "<prompt>"` for full CLEAR analysis
3. Review alternative variations and validation checklists
4. Select the best approach

### Strategic Project Planning
1. Run `clavix prd` to generate a comprehensive PRD through guided questions
2. Run `clavix plan` to break down the PRD into implementation tasks
3. Run `clavix implement` to execute tasks systematically
4. Archive completed work with `clavix archive`

### Conversational Requirements Gathering
1. Run `clavix start` to begin capturing a conversation
2. Discuss requirements naturally with the user
3. Run `clavix summarize` to extract structured requirements and prompts

## CLEAR Framework Components

When analyzing or improving prompts, apply these CLEAR Framework principles:

- **[C] Concise**: Remove verbosity, pleasantries, unnecessary qualifiers
- **[L] Logical**: Ensure coherent sequencing (context → requirements → constraints → output)
- **[E] Explicit**: Add clear specifications for persona, format, tone, success criteria
- **[A] Adaptive**: Provide alternative phrasings and flexible structures
- **[R] Reflective**: Include validation checklists and quality criteria

## Output Locations

Clavix stores artifacts in the `.clavix/` directory:
- `.clavix/outputs/<project>/` - PRDs, tasks, and optimized prompts
- `.clavix/sessions/` - Captured conversational sessions
- `.clavix/templates/` - Custom template overrides
- `.clavix/config.json` - Project configuration

## Best Practices

1. **Start with the right mode**: Use fast mode for simple prompts, deep mode for complex requirements, and PRD mode for strategic planning
2. **Leverage CLEAR Framework**: Always consider the 5 CLEAR components when crafting prompts
3. **Document requirements**: Use PRD workflow for significant features to ensure clear requirements
4. **Track progress**: Use implement command to maintain structured task execution
5. **Archive completed work**: Keep project organized by archiving finished projects

## Integration with GitHub Copilot

When users ask for help with prompts or requirements:
1. Suggest running the appropriate Clavix command
2. Explain the expected output and benefits
3. Help interpret Clavix-generated outputs
4. Apply CLEAR Framework principles in your responses

This integration makes GitHub Copilot aware of Clavix workflows and can suggest using Clavix commands when appropriate.
