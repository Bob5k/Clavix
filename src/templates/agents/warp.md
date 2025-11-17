## Clavix Integration for Warp

Clavix helps Warp developers turn rough ideas into CLEAR, AI-ready prompts and Product Requirements Documents without leaving the terminal.

### Quick start
- Install globally: `npm install -g clavix`
- Or run ad hoc: `npx clavix@latest init`
- Verify setup: `clavix version`

### Common commands
- `clavix init` – interactive provider setup (regenerates docs & commands)
- `clavix fast "<prompt>"` – quick CLEAR (C/L/E) analysis and improved prompt. Auto-saves to `.clavix/outputs/prompts/fast/`.
- `clavix deep "<prompt>"` – full CLEAR (C/L/E/A/R) analysis with alternatives & checklists. Auto-saves to `.clavix/outputs/prompts/deep/`.
- `clavix execute [--latest]` – execute saved prompts from fast/deep. Interactive selection or `--latest` for most recent.
- `clavix prompts list` – view all saved prompts with age/status (NEW, EXECUTED, OLD, STALE)
- `clavix prompts clear [--executed|--stale|--fast|--deep]` – cleanup executed or old prompts
- `clavix prd` – answer focused questions to create full/quick PRDs
- `clavix plan` – transform PRDs or sessions into task lists
- `clavix implement [--commit-strategy=<type>]` – execute tasks (git: per-task, per-5-tasks, per-phase, none [default])
- `clavix start` – capture requirement conversations in Warp
- `clavix summarize [session-id]` – extract mini PRDs and optimized prompts
- `clavix list` – list sessions/outputs (`--sessions`, `--outputs`, `--archived`)
- `clavix show [session-id]` – inspect sessions or use `--output <project>`
- `clavix archive [project]` – archive projects (or `--restore` to bring them back)
- `clavix config get|set|edit|reset` – manage `.clavix/config.json`
- `clavix update` – refresh documentation/commands (`--docs-only`, `--commands-only`)
- `clavix version` – print installed CLI version

### Outputs
- Project artifacts live under `.clavix/outputs/<project>/`
- Sessions are stored in `.clavix/sessions/`
- Update generated docs/commands any time with `clavix update`

For full documentation, open `docs/index.md` in your project or visit the repository README.
