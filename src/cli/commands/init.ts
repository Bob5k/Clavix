import { Command } from '@oclif/core';
import inquirer from 'inquirer';
import chalk from 'chalk';
import * as path from 'path';
import { AgentManager } from '../../core/agent-manager.js';
import { DocInjector } from '../../core/doc-injector.js';
import { AgentsMdGenerator } from '../../core/adapters/agents-md-generator.js';
import { OctoMdGenerator } from '../../core/adapters/octo-md-generator.js';
import { WarpMdGenerator } from '../../core/adapters/warp-md-generator.js';
import { CopilotInstructionsGenerator } from '../../core/adapters/copilot-instructions-generator.js';
import { InstructionsGenerator } from '../../core/adapters/instructions-generator.js';
import { FileSystem } from '../../utils/file-system.js';
import { ClavixConfig, DEFAULT_CONFIG } from '../../types/config.js';
import { CommandTemplate, AgentAdapter } from '../../types/agent.js';
import { GeminiAdapter } from '../../core/adapters/gemini-adapter.js';
import { QwenAdapter } from '../../core/adapters/qwen-adapter.js';
import { loadCommandTemplates } from '../../utils/template-loader.js';
import { collectLegacyCommandFiles } from '../../utils/legacy-command-cleanup.js';

export default class Init extends Command {
  static description = 'Initialize Clavix in the current project';

  static examples = ['<%= config.bin %> <%= command.id %>'];

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

      // Load existing config if re-initializing
      const agentManager = new AgentManager();
      let existingIntegrations: string[] = [];

      if (await FileSystem.exists('.clavix/config.json')) {
        try {
          const configContent = await FileSystem.readFile('.clavix/config.json');
          const config = JSON.parse(configContent);
          existingIntegrations = config.integrations || config.providers || [];
        } catch {
          // Ignore parse errors, will use empty array
        }
      }

      // Select integrations using shared utility
      console.log(chalk.gray('Select AI development tools to support:\n'));
      console.log(chalk.gray('(Space to select, Enter to confirm)\n'));

      const { selectIntegrations } = await import('../../utils/integration-selector.js');
      const selectedIntegrations = await selectIntegrations(agentManager, existingIntegrations);

      if (!selectedIntegrations || selectedIntegrations.length === 0) {
        console.log(chalk.red('\n✗ No integrations selected\n'));
        return;
      }

      // Handle deselected integrations (cleanup prompt)
      const deselectedIntegrations = existingIntegrations.filter(
        (p) => !selectedIntegrations.includes(p)
      );

      if (deselectedIntegrations.length > 0) {
        console.log(chalk.yellow('\n⚠ Previously configured but not selected:'));
        for (const integrationName of deselectedIntegrations) {
          const adapter = agentManager.getAdapter(integrationName);
          const displayName = adapter?.displayName || integrationName;
          const directory = adapter?.directory || 'unknown';
          console.log(chalk.gray(`  • ${displayName} (${directory})`));
        }

        const { cleanupAction } = await inquirer.prompt([
          {
            type: 'list',
            name: 'cleanupAction',
            message: 'What would you like to do with these integrations?',
            choices: [
              { name: 'Clean up (remove all command files)', value: 'cleanup' },
              { name: 'Keep (also update their commands)', value: 'update' },
              { name: 'Skip (leave as-is)', value: 'skip' },
            ],
          },
        ]);

        if (cleanupAction === 'cleanup') {
          console.log(chalk.gray('\n🗑️  Cleaning up deselected integrations...'));
          for (const integrationName of deselectedIntegrations) {
            const adapter = agentManager.getAdapter(integrationName);
            if (adapter) {
              const removed = await adapter.removeAllCommands();
              console.log(
                chalk.gray(`  ✓ Removed ${removed} command(s) from ${adapter.displayName}`)
              );
            }
          }
        } else if (cleanupAction === 'update') {
          // Add them back to selection
          selectedIntegrations.push(...deselectedIntegrations);
          console.log(chalk.gray('\n✓ Keeping all integrations\n'));
        }
        // If 'skip': do nothing
      }

      // Create .clavix directory structure
      console.log(chalk.cyan('\n📁 Creating directory structure...'));
      await this.createDirectoryStructure();

      // Generate config
      console.log(chalk.cyan('⚙️  Generating configuration...'));
      await this.generateConfig(selectedIntegrations);

      // Generate INSTRUCTIONS.md
      await this.generateInstructions();

      // Generate commands for each selected integration
      console.log(
        chalk.cyan(
          `\n📝 Generating commands for ${selectedIntegrations.length} integration(s)...\n`
        )
      );

      for (const integrationName of selectedIntegrations) {
        // Handle agents-md separately (it's not an adapter)
        if (integrationName === 'agents-md') {
          console.log(chalk.gray('  ✓ Generating AGENTS.md...'));
          await AgentsMdGenerator.generate();
          continue;
        }

        // Handle copilot-instructions separately (it's not an adapter)
        if (integrationName === 'copilot-instructions') {
          console.log(chalk.gray('  ✓ Generating .github/copilot-instructions.md...'));
          await CopilotInstructionsGenerator.generate();
          continue;
        }

        // Handle octo-md separately (it's not an adapter)
        if (integrationName === 'octo-md') {
          console.log(chalk.gray('  ✓ Generating OCTO.md...'));
          await OctoMdGenerator.generate();
          continue;
        }

        if (integrationName === 'warp-md') {
          console.log(chalk.gray('  ✓ Generating WARP.md...'));
          await WarpMdGenerator.generate();
          continue;
        }

        let adapter: AgentAdapter = agentManager.requireAdapter(integrationName);

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
            adapter =
              adapter.name === 'gemini'
                ? new GeminiAdapter({ useNamespace: false })
                : new QwenAdapter({ useNamespace: false });
            console.log(chalk.gray(`    → Using ${adapter.getCommandPath()} (no namespacing)`));
          }
        }

        // Validate before generating
        if (adapter.validate) {
          const validation = await adapter.validate();
          if (!validation.valid) {
            console.log(chalk.yellow(`    ⚠ Validation warnings for ${adapter.displayName}:`));
            validation.errors?.forEach((err) => console.log(chalk.yellow(`      - ${err}`)));

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

        // Remove all existing commands before regenerating (ensures clean state)
        const removed = await adapter.removeAllCommands();
        if (removed > 0) {
          console.log(chalk.gray(`    Removed ${removed} existing command(s)`));
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
          console.log(
            chalk.gray('    Tip: reopen the CLI or run /help to refresh the command list.')
          );
        }

        // Inject documentation blocks (Claude Code only)
        if (integrationName === 'claude-code') {
          console.log(chalk.gray('  ✓ Injecting CLAUDE.md documentation...'));
          await this.injectDocumentation(adapter);
        }
      }

      // Generate .clavix/instructions/ folder for generic integrations
      if (InstructionsGenerator.needsGeneration(selectedIntegrations)) {
        console.log(chalk.gray('\n📁 Generating .clavix/instructions/ reference folder...'));
        await InstructionsGenerator.generate();
        console.log(chalk.gray('  ✓ Created detailed workflow guides for generic integrations'));
      }

      // Success message
      // v4.11: Use generic command names - format varies by integration
      // (claude-code uses colon like /clavix:improve, droid uses hyphen like /clavix-improve)
      console.log(chalk.bold.green('\n✅ Clavix initialized successfully!\n'));
      console.log(chalk.gray('Next steps:'));
      console.log(chalk.gray('  • Slash commands are now available in your AI agent'));
      console.log(
        chalk.gray('  • Run'),
        chalk.cyan('clavix --help'),
        chalk.gray('to see all CLI commands')
      );
      console.log(chalk.gray('  • Available slash commands:'));
      console.log(
        chalk.gray('    ◦'),
        chalk.cyan('improve'),
        chalk.gray('- Smart prompt optimization with auto depth selection')
      );
      console.log(
        chalk.gray('    ◦'),
        chalk.cyan('prd'),
        chalk.gray('- Generate PRD through guided questions')
      );
      console.log(chalk.gray('    ◦'), chalk.cyan('execute'), chalk.gray('- Run saved prompts'));
      console.log(chalk.gray('\n  Command format varies by integration (colon vs hyphen)\n'));
    } catch (error: unknown) {
      const { getErrorMessage, toError } = await import('../../utils/error-utils.js');
      console.error(chalk.red('\n✗ Initialization failed:'), getErrorMessage(error));
      if (
        error &&
        typeof error === 'object' &&
        'hint' in error &&
        typeof (error as { hint: unknown }).hint === 'string'
      ) {
        console.error(chalk.yellow('  Hint:'), (error as { hint: string }).hint);
      }
      throw toError(error);
    }
  }

  private async createDirectoryStructure(): Promise<void> {
    const dirs = ['.clavix', '.clavix/sessions', '.clavix/outputs', '.clavix/templates'];

    for (const dir of dirs) {
      await FileSystem.ensureDir(dir);
    }
  }

  private async generateConfig(integrations: string[]): Promise<void> {
    const config: ClavixConfig = {
      ...DEFAULT_CONFIG,
      integrations,
    };

    const configPath = '.clavix/config.json';
    const configContent = JSON.stringify(config, null, 2);
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
├── instructions/         # Workflow instruction files for AI agents
├── sessions/             # Conversational mode session files
├── outputs/
│   ├── <project-name>/  # Per-project outputs
│   │   ├── full-prd.md
│   │   ├── quick-prd.md
│   │   └── tasks.md
│   ├── prompts/         # Saved prompts for re-execution
│   └── archive/         # Archived completed projects
└── templates/           # Custom template overrides (optional)
\`\`\`

## Clavix Commands (v5)

### Setup Commands (CLI)

| Command | Purpose |
|---------|---------|
| \`clavix init\` | Initialize Clavix in a project |
| \`clavix update\` | Update templates after package update |
| \`clavix config\` | Manage configuration |
| \`clavix version\` | Show version |

### Workflow Commands (Slash Commands)

All workflows are executed via slash commands that AI agents read and follow:

| Slash Command | Purpose |
|---------------|---------|
| \`/clavix:improve\` | Optimize prompts (auto-selects depth) |
| \`/clavix:prd\` | Generate PRD through guided questions |
| \`/clavix:plan\` | Create task breakdown from PRD |
| \`/clavix:implement\` | Execute tasks or prompts (auto-detects source) |
| \`/clavix:start\` | Begin conversational session |
| \`/clavix:summarize\` | Extract requirements from conversation |
| \`/clavix:verify\` | Verify implementation |
| \`/clavix:archive\` | Archive completed projects |

**Note:** Running \`clavix init\` or \`clavix update\` will regenerate all slash commands from templates. Any manual edits to generated commands will be lost. If you need custom commands, create new command files instead of modifying generated ones.

**Command format varies by integration:**
- Claude Code, Gemini, Qwen: \`/clavix:improve\` (colon format)
- Cursor, Droid, Windsurf, etc.: \`/clavix-improve\` (hyphen format)

## Standard Workflow

**Clavix follows this progression:**

\`\`\`
PRD Creation → Task Planning → Implementation → Archive
\`\`\`

**Detailed steps:**

1. **Planning Phase**
   - Run: \`/clavix:prd\` or \`/clavix:start\` → \`/clavix:summarize\`
   - Output: \`.clavix/outputs/{project}/full-prd.md\` + \`quick-prd.md\`

2. **Task Preparation**
   - Run: \`/clavix:plan\` transforms PRD into curated task list
   - Output: \`.clavix/outputs/{project}/tasks.md\`

3. **Implementation Phase**
   - Run: \`/clavix:implement\`
   - Agent executes tasks systematically
   - Agent edits tasks.md directly to mark progress (\`- [ ]\` → \`- [x]\`)

4. **Completion**
   - Run: \`/clavix:archive\`
   - Archives completed work

**Key principle:** Planning workflows create documents. Implementation workflows write code.

## Prompt Lifecycle

1. **Optimize prompt**: \`/clavix:improve\` - Analyzes and improves your prompt
2. **Review**: Agent lists saved prompts from \`.clavix/outputs/prompts/\`
3. **Execute**: \`/clavix:implement --latest\` - Implement when ready
4. **Cleanup**: Agent deletes old prompt files from \`.clavix/outputs/prompts/\`

## When to Use Which Mode

- **Improve mode** (\`/clavix:improve\`): Smart prompt optimization with auto-depth selection
- **PRD mode** (\`/clavix:prd\`): Strategic planning with architecture and business impact
- **Conversational mode** (\`/clavix:start\` → \`/clavix:summarize\`): Natural discussion → extract structured requirements

## Customization

Create custom templates in \`.clavix/templates/\` to override defaults.

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

  private async handleLegacyCommands(
    adapter: AgentAdapter,
    templates: CommandTemplate[]
  ): Promise<void> {
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
