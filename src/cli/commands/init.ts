import { Command } from '@oclif/core';
import inquirer from 'inquirer';
import chalk from 'chalk';
import * as path from 'path';
import JSON5 from 'json5';
import { AgentManager } from '../../core/agent-manager.js';
import { DocInjector } from '../../core/doc-injector.js';
import { AgentsMdGenerator } from '../../core/adapters/agents-md-generator.js';
import { OctoMdGenerator } from '../../core/adapters/octo-md-generator.js';
import { WarpMdGenerator } from '../../core/adapters/warp-md-generator.js';
import { CopilotInstructionsGenerator } from '../../core/adapters/copilot-instructions-generator.js';
import { FileSystem } from '../../utils/file-system.js';
import { ClavixConfig, DEFAULT_CONFIG } from '../../types/config.js';
import { CommandTemplate, AgentAdapter } from '../../types/agent.js';
import { GeminiAdapter } from '../../core/adapters/gemini-adapter.js';
import { QwenAdapter } from '../../core/adapters/qwen-adapter.js';
import { loadCommandTemplates } from '../../utils/template-loader.js';
import { collectLegacyCommandFiles } from '../../utils/legacy-command-cleanup.js';

export default class Init extends Command {
  static description = 'Initialize Clavix in the current project';

  static examples = [
    '<%= config.bin %> <%= command.id %>',
  ];

  async run(): Promise<void> {
    console.log(chalk.bold.cyan('\n🚀 Clavix Initialization\n'));

    try {
      // Check if already initialized
      if (await FileSystem.exists('.clavix')) {
        const { reinit } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'reinit',
            message: 'Clavix is already initialized. Reinitialize?',
            default: false,
          },
        ]);

        if (!reinit) {
          console.log(chalk.yellow('\n✓ Initialization cancelled\n'));
          return;
        }
      }

      // Select providers (multi-select)
      const agentManager = new AgentManager();

      console.log(chalk.gray('Select AI development tools to support:\n'));
      console.log(chalk.gray('(Space to select, Enter to confirm)\n'));

      const { selectedProviders } = await inquirer.prompt([
        {
          type: 'checkbox',
          name: 'selectedProviders',
          message: 'Which AI tools are you using?',
          choices: [
            // CLI Tools
            {
              name: 'Amp (.agents/commands/)',
              value: 'amp',
            },
            {
              name: 'Augment CLI (.augment/commands/clavix/)',
              value: 'augment',
            },
            {
              name: 'Codex CLI (~/.codex/prompts)',
              value: 'codex',
            },
            {
              name: 'CodeBuddy (.codebuddy/commands/)',
              value: 'codebuddy',
            },
            {
              name: 'Crush CLI (.crush/commands/clavix/)',
              value: 'crush',
            },
            {
              name: 'Claude Code (.claude/commands/clavix/)',
              value: 'claude-code',
            },
            {
              name: 'Droid CLI (.factory/commands/)',
              value: 'droid',
            },
            {
              name: 'Gemini CLI (.gemini/commands/clavix/)',
              value: 'gemini',
            },
            {
              name: 'LLXPRT (.llxprt/commands/clavix/)',
              value: 'llxprt',
            },
            {
              name: 'OpenCode (.opencode/command/)',
              value: 'opencode',
            },
            {
              name: 'Qwen Code (.qwen/commands/clavix/)',
              value: 'qwen',
            },
            new inquirer.Separator(),
            // IDE & IDE Extensions
            {
              name: 'Cursor (.cursor/commands/)',
              value: 'cursor',
            },
            {
              name: 'Windsurf (.windsurf/workflows/)',
              value: 'windsurf',
            },
            {
              name: 'Kilocode (.kilocode/workflows/)',
              value: 'kilocode',
            },
            {
              name: 'Roocode (.roo/commands/)',
              value: 'roocode',
            },
            {
              name: 'Cline (.clinerules/workflows/)',
              value: 'cline',
            },
            new inquirer.Separator(),
            // Universal Adapters
            {
              name: 'Agents (AGENTS.md - Universal - for tools without slash commands)',
              value: 'agents-md',
            },
            {
              name: 'GitHub Copilot (.github/copilot-instructions.md)',
              value: 'copilot-instructions',
            },
            {
              name: 'Warp (WARP.md - optimized for Warp)',
              value: 'warp-md',
            },
            {
              name: 'Octofriend (OCTO.md - optimized for Octofriend)',
              value: 'octo-md',
            },
            new inquirer.Separator(),
          ],
          validate: (answer: string[]) => {
            if (answer.length === 0) {
              return 'You must select at least one provider.';
            }
            return true;
          },
        },
      ]);

      if (!selectedProviders || selectedProviders.length === 0) {
        console.log(chalk.red('\n✗ No providers selected\n'));
        return;
      }

      // Create .clavix directory structure
      console.log(chalk.cyan('\n📁 Creating directory structure...'));
      await this.createDirectoryStructure();

      // Generate config
      console.log(chalk.cyan('⚙️  Generating configuration...'));
      await this.generateConfig(selectedProviders);

      // Generate INSTRUCTIONS.md
      await this.generateInstructions();

      // Generate commands for each selected provider
      console.log(
        chalk.cyan(
          `\n📝 Generating commands for ${selectedProviders.length} provider(s)...\n`
        )
      );

      for (const providerName of selectedProviders) {
        // Handle agents-md separately (it's not an adapter)
        if (providerName === 'agents-md') {
          console.log(chalk.gray('  ✓ Generating AGENTS.md...'));
          await AgentsMdGenerator.generate();
          continue;
        }

        // Handle copilot-instructions separately (it's not an adapter)
        if (providerName === 'copilot-instructions') {
          console.log(chalk.gray('  ✓ Generating .github/copilot-instructions.md...'));
          await CopilotInstructionsGenerator.generate();
          continue;
        }

        // Handle octo-md separately (it's not an adapter)
        if (providerName === 'octo-md') {
          console.log(chalk.gray('  ✓ Generating OCTO.md...'));
          await OctoMdGenerator.generate();
          continue;
        }

        if (providerName === 'warp-md') {
          console.log(chalk.gray('  ✓ Generating WARP.md...'));
          await WarpMdGenerator.generate();
          continue;
        }

        let adapter: AgentAdapter = agentManager.requireAdapter(providerName);

        console.log(chalk.gray(`  ✓ Generating ${adapter.displayName} commands...`));

        if (adapter.name === 'codex') {
          const codexPath = adapter.getCommandPath();
          const { confirmCodex } = await inquirer.prompt([
            {
              type: 'confirm',
              name: 'confirmCodex',
              message: `Codex commands will be generated at ${codexPath}. Continue?`,
              default: true,
            },
          ]);

          if (!confirmCodex) {
            console.log(chalk.yellow('    ⊗ Skipped Codex CLI'));
            continue;
          }
        }

        if (adapter.name === 'gemini' || adapter.name === 'qwen') {
          const defaultNamespacePath = path.join(`.${adapter.name}`, 'commands', 'clavix');
          const { useNamespace } = await inquirer.prompt([
            {
              type: 'confirm',
              name: 'useNamespace',
              message: `Store ${adapter.displayName} commands under ${defaultNamespacePath}? (Produces /clavix:<command> shortcuts)`,
              default: true,
            },
          ]);

          if (!useNamespace) {
            adapter = adapter.name === 'gemini'
              ? new GeminiAdapter({ useNamespace: false })
              : new QwenAdapter({ useNamespace: false });
            console.log(chalk.gray(`    → Using ${adapter.getCommandPath()} (no namespacing)`));
          }
        }

        // Validate before generating
        if (adapter.validate) {
          const validation = await adapter.validate();
          if (!validation.valid) {
            console.log(
              chalk.yellow(`    ⚠ Validation warnings for ${adapter.displayName}:`)
            );
            validation.errors?.forEach((err) =>
              console.log(chalk.yellow(`      - ${err}`))
            );

            const { continueAnyway } = await inquirer.prompt([
              {
                type: 'confirm',
                name: 'continueAnyway',
                message: 'Continue anyway?',
                default: false,
              },
            ]);

            if (!continueAnyway) {
              console.log(chalk.yellow(`    ⊗ Skipped ${adapter.displayName}`));
              continue;
            }
          }
        }

        // Generate slash commands
        const generatedTemplates = await this.generateSlashCommands(adapter);

        await this.handleLegacyCommands(adapter, generatedTemplates);

        if (adapter.name === 'gemini' || adapter.name === 'qwen') {
          const commandPath = adapter.getCommandPath();
          const isNamespaced = commandPath.endsWith(path.join('commands', 'clavix'));
          const namespace = isNamespaced ? path.basename(commandPath) : undefined;
          const commandNames = generatedTemplates.map((template) => {
            if (isNamespaced) {
              return `/${namespace}:${template.name}`;
            }

            const filename = adapter.getTargetFilename(template.name);
            const slashName = filename.slice(0, -adapter.fileExtension.length);
            return `/${slashName}`;
          });

          console.log(chalk.green(`    → Registered ${commandNames.join(', ')}`));
          console.log(chalk.gray(`    Commands saved to ${commandPath}`));
          console.log(chalk.gray('    Tip: reopen the CLI or run /help to refresh the command list.'));
        }

        // Inject documentation blocks (Claude Code only)
        if (providerName === 'claude-code') {
          console.log(chalk.gray('  ✓ Injecting CLAUDE.md documentation...'));
          await this.injectDocumentation(adapter);
        }
      }

      // Success message
      console.log(chalk.bold.green('\n✅ Clavix initialized successfully!\n'));
      console.log(chalk.gray('Next steps:'));
      console.log(chalk.gray('  • Slash commands are now available in your AI agent'));
      console.log(chalk.gray('  • Run'), chalk.cyan('clavix --help'), chalk.gray('to see all commands'));
      console.log(chalk.gray('  • Try'), chalk.cyan('/clavix:fast'), chalk.gray('for quick prompt improvements'));
      console.log(chalk.gray('  • Try'), chalk.cyan('/clavix:deep'), chalk.gray('for comprehensive prompt analysis'));
      console.log(chalk.gray('  • Use'), chalk.cyan('/clavix:prd'), chalk.gray('to generate a PRD\n'));
    } catch (error: unknown) {
      const { getErrorMessage, toError } = await import('../../utils/error-utils.js');
      console.error(chalk.red('\n✗ Initialization failed:'), getErrorMessage(error));
      if (error && typeof error === 'object' && 'hint' in error && typeof (error as { hint: unknown }).hint === 'string') {
        console.error(chalk.yellow('  Hint:'), (error as { hint: string }).hint);
      }
      throw toError(error);
    }
  }

  private async createDirectoryStructure(): Promise<void> {
    const dirs = [
      '.clavix',
      '.clavix/sessions',
      '.clavix/outputs',
      '.clavix/templates',
    ];

    for (const dir of dirs) {
      await FileSystem.ensureDir(dir);
    }
  }

  private async generateConfig(providers: string[]): Promise<void> {
    const config: ClavixConfig = {
      ...DEFAULT_CONFIG,
      providers,
    };

    const configPath = '.clavix/config.json';
    const configContent = JSON5.stringify(config, null, 2);
    await FileSystem.writeFileAtomic(configPath, configContent);
  }

  private async generateInstructions(): Promise<void> {
    const instructions = `# Clavix Instructions

Welcome to Clavix! This directory contains your local Clavix configuration and data.

## Directory Structure

\`\`\`
.clavix/
├── config.json           # Your Clavix configuration
├── INSTRUCTIONS.md       # This file
├── sessions/             # Conversational mode session files
├── outputs/
│   ├── <project-name>/  # Per-project outputs
│   │   ├── full-prd.md
│   │   ├── quick-prd.md
│   │   ├── tasks.md
│   │   └── .clavix-implement-config.json
│   ├── prompts/         # Saved prompts for re-execution
│   │   ├── fast/        # Fast mode prompts
│   │   └── deep/        # Deep mode prompts
│   └── archive/         # Archived completed projects
└── templates/           # Custom template overrides (optional)
\`\`\`

## CLI Commands Reference

### Prompt Improvement
- \`clavix fast "<prompt>"\` - Quick CLEAR (C/L/E) improvements with smart triage
- \`clavix deep "<prompt>"\` - Comprehensive CLEAR (C/L/E/A/R) analysis with alternatives
- \`clavix execute [--latest]\` - Execute saved prompts from fast/deep optimization
- \`clavix prompts list\` - View all saved prompts with status (NEW/EXECUTED/OLD/STALE)
- \`clavix prompts clear\` - Cleanup prompts (\`--executed\`, \`--stale\`, \`--fast\`, \`--deep\`, \`--all\`)

### PRD & Planning
- \`clavix prd\` - Generate PRD through guided Socratic questions
- \`clavix plan\` - Transform PRD or session into phase-based \`tasks.md\`
- \`clavix start\` - Start conversational mode for requirements gathering
- \`clavix summarize [session-id]\` - Extract mini-PRD and prompts from conversation

### Implementation
- \`clavix implement [--commit-strategy=<type>]\` - Execute tasks with optional git auto-commits
- \`clavix task-complete <taskId>\` - Mark task complete with validation, auto-show next task

### Project Management
- \`clavix list [--sessions|--outputs]\` - List sessions and/or output projects
- \`clavix show [session-id|--output <project>]\` - Inspect session or project details
- \`clavix archive [project] [--restore]\` - Archive completed projects or restore them

### Configuration
- \`clavix init\` - Initialize Clavix (you just ran this!)
- \`clavix config [get|set|edit|reset]\` - Manage configuration preferences
- \`clavix update [--docs-only|--commands-only]\` - Refresh managed docs and slash commands
- \`clavix version\` - Print installed version

## Slash Commands (AI Agents)

If using Claude Code, Cursor, or Windsurf, the following slash commands are available:

### Prompt Improvement
- \`/clavix:fast [prompt]\` - Quick prompt improvements
- \`/clavix:deep [prompt]\` - Comprehensive prompt analysis
- \`/clavix:execute\` - Execute saved prompts
- \`/clavix:prompts\` - Manage prompt lifecycle

### PRD & Planning
- \`/clavix:prd\` - Generate PRD through guided questions
- \`/clavix:plan\` - Generate task breakdown from PRD
- \`/clavix:start\` - Start conversational mode
- \`/clavix:summarize\` - Summarize conversation

### Implementation
- \`/clavix:implement\` - Execute task workflow with git integration

### Project Management
- \`/clavix:archive\` - Archive completed projects

## Workflows

### Prompt Lifecycle (v2.7+)

1. **Create improved prompt**:
   \`\`\`bash
   clavix fast "your prompt here"
   # or
   clavix deep "your prompt here"
   \`\`\`
   - CLI auto-saves to \`.clavix/outputs/prompts/fast/\` or \`deep/\`
   - Slash commands require manual save per template instructions

2. **Execute saved prompt**:
   \`\`\`bash
   clavix execute --latest  # Most recent prompt
   clavix execute           # Interactive selection
   \`\`\`

3. **Manage prompts**:
   \`\`\`bash
   clavix prompts list              # View all with status
   clavix prompts clear --executed  # Remove executed prompts
   clavix prompts clear --stale     # Remove stale (30+ days)
   \`\`\`

**Prompt Status**:
- \`NEW\` - Just created, never executed
- \`EXECUTED\` - Successfully executed at least once
- \`OLD\` - 7+ days old, not executed
- \`STALE\` - 30+ days old, not executed

### Implementation Workflow (v1.3+)

1. **Generate PRD**:
   \`\`\`bash
   clavix prd
   # Creates: .clavix/outputs/<project>/full-prd.md + quick-prd.md
   \`\`\`

2. **Create task breakdown**:
   \`\`\`bash
   clavix plan
   # Creates: .clavix/outputs/<project>/tasks.md
   \`\`\`

3. **Execute tasks with git integration**:
   \`\`\`bash
   # Manual commits (default):
   clavix implement

   # Or with auto-commit strategy:
   clavix implement --commit-strategy=per-phase
   \`\`\`

4. **Mark tasks complete**:
   \`\`\`bash
   clavix task-complete <taskId>
   # Validates completion, optionally commits, shows next task
   \`\`\`

5. **Archive when done**:
   \`\`\`bash
   clavix archive my-project
   \`\`\`

### Git Auto-Commit Strategies (v2.8.1)

When using \`clavix implement --commit-strategy=<type>\`:

- \`none\` (default) - Manual git workflow, full control
- \`per-task\` - Commit after each completed task (detailed history)
- \`per-5-tasks\` - Commit every 5 tasks (balanced)
- \`per-phase\` - Commit when phase completes (milestone-based)

**Recommendation**: Use \`none\` for most projects. Only enable auto-commits for large implementations with clear phases.

## When to Use Which Mode

- **Fast mode**: Quick cleanup for simple prompts (1-2 iterations)
- **Deep mode**: Complex requirements needing comprehensive analysis (3-5 alternatives)
- **PRD mode**: Strategic planning with architecture, risks, and business impact
- **Conversational mode** (\`start\`/\`summarize\`): Natural discussion → extract structured requirements

## Typical Workflows

**Improve a prompt quickly**:
\`\`\`bash
clavix fast "Add user authentication"
clavix execute --latest
\`\`\`

**Create and execute strategy**:
\`\`\`bash
clavix prd              # Generate PRD
clavix plan             # Create tasks.md
clavix implement        # Execute with manual commits
\`\`\`

**Capture conversation**:
\`\`\`bash
clavix start            # Record conversation
# ... discuss requirements ...
clavix summarize        # Extract mini-PRD + prompt
\`\`\`

**Stay organized**:
\`\`\`bash
clavix list             # See all projects
clavix show --output my-project
clavix archive my-project
\`\`\`

## Customization

Create custom templates in \`.clavix/templates/\` to override defaults:
- \`fast.txt\` - Custom fast mode template
- \`deep.txt\` - Custom deep mode template
- \`prd-questions.txt\` - Custom PRD questions

Edit configuration:
\`\`\`bash
clavix config edit      # Opens config.json in $EDITOR
clavix config set key=value
\`\`\`

## Need Help?

- **Documentation**: https://github.com/ClavixDev/Clavix
- **Issues**: https://github.com/ClavixDev/Clavix/issues
- **Version**: Run \`clavix version\` to check your installed version
- **Update managed blocks**: Run \`clavix update\` to refresh documentation
`;

    await FileSystem.writeFileAtomic('.clavix/INSTRUCTIONS.md', instructions);
  }

  private async generateSlashCommands(adapter: AgentAdapter): Promise<CommandTemplate[]> {
    const templates = await loadCommandTemplates(adapter);

    await adapter.generateCommands(templates);
    return templates;
  }

  private async handleLegacyCommands(adapter: AgentAdapter, templates: CommandTemplate[]): Promise<void> {
    const commandNames = templates.map((template) => template.name);
    const legacyFiles = await collectLegacyCommandFiles(adapter, commandNames);

    if (legacyFiles.length === 0) {
      return;
    }

    const relativePaths = legacyFiles
      .map((file) => path.relative(process.cwd(), file))
      .sort((a, b) => a.localeCompare(b));

    console.log(chalk.gray(`    ⚠ Found ${relativePaths.length} deprecated command file(s):`));
    for (const file of relativePaths) {
      console.log(chalk.gray(`      • ${file}`));
    }

    const { removeLegacy } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'removeLegacy',
        message: `Remove deprecated files for ${adapter.displayName}? Functionality is unchanged; filenames are being standardized.`,
        default: true,
      },
    ]);

    if (!removeLegacy) {
      console.log(chalk.gray('    ⊗ Kept legacy files (deprecated naming retained)'));
      return;
    }

    for (const file of legacyFiles) {
      await FileSystem.remove(file);
      console.log(chalk.gray(`    ✓ Removed ${path.relative(process.cwd(), file)}`));
    }
  }

  private async injectDocumentation(adapter: AgentAdapter): Promise<void> {
    // Inject AGENTS.md
    const agentsContent = DocInjector.getDefaultAgentsContent();
    await DocInjector.injectBlock('AGENTS.md', this.extractClavixBlock(agentsContent));

    // Inject CLAUDE.md if Claude Code selected
    if (adapter.name === 'claude-code') {
      const claudeContent = DocInjector.getDefaultClaudeContent();
      await DocInjector.injectBlock('CLAUDE.md', this.extractClavixBlock(claudeContent));
    }
  }


  private extractClavixBlock(content: string): string {
    const match = content.match(/<!-- CLAVIX:START -->([\s\S]*?)<!-- CLAVIX:END -->/);
    return match ? match[1].trim() : content;
  }
}
