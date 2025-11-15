import { Command } from '@oclif/core';
import inquirer from 'inquirer';
import chalk from 'chalk';
import * as path from 'path';
import JSON5 from 'json5';
import { AgentManager } from '../../core/agent-manager';
import { DocInjector } from '../../core/doc-injector';
import { AgentsMdGenerator } from '../../core/adapters/agents-md-generator';
import { OctoMdGenerator } from '../../core/adapters/octo-md-generator';
import { FileSystem } from '../../utils/file-system';
import { ClavixConfig, DEFAULT_CONFIG } from '../../types/config';
import { CommandTemplate, AgentAdapter } from '../../types/agent';
import { GeminiAdapter } from '../../core/adapters/gemini-adapter';
import { QwenAdapter } from '../../core/adapters/qwen-adapter';
import { loadCommandTemplates } from '../../utils/template-loader';
import { collectLegacyCommandFiles } from '../../utils/legacy-command-cleanup';

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
            // IDE & IDE Extensions
            {
              name: 'Claude Code (.claude/commands/clavix/)',
              value: 'claude-code',
            },
            {
              name: 'Cline (.clinerules/workflows/)',
              value: 'cline',
            },
            {
              name: 'Cursor (.cursor/commands/)',
              value: 'cursor',
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
              name: 'Windsurf (.windsurf/workflows/)',
              value: 'windsurf',
            },
            new inquirer.Separator(),
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
              name: 'Copilot CLI (.github/agents/)',
              value: 'copilot',
            },
            {
              name: 'Crush CLI (.crush/commands/clavix/)',
              value: 'crush',
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
              name: 'OpenCode (.opencode/command/)',
              value: 'opencode',
            },
            {
              name: 'Qwen Code (.qwen/commands/clavix/)',
              value: 'qwen',
            },
            new inquirer.Separator(),
            // Universal Adapters
            {
              name: 'agents.md (Universal - for tools without slash commands)',
              value: 'agents-md',
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

        // Handle octo-md separately (it's not an adapter)
        if (providerName === 'octo-md') {
          console.log(chalk.gray('  ✓ Generating OCTO.md...'));
          await OctoMdGenerator.generate();
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

- \`config.json\` - Your Clavix configuration
- \`sessions/\` - Conversational mode session files
- \`outputs/\` - Generated PRDs and optimized prompts
- \`templates/\` - Custom templates (optional)

## Available Commands

- \`clavix init\` - Initialize Clavix (you just ran this!)
- \`clavix fast <prompt>\` - Quick prompt improvements with smart triage
- \`clavix deep <prompt>\` - Comprehensive prompt analysis
- \`clavix prd\` - Generate a PRD through guided questions
- \`clavix start\` - Start conversational mode
- \`clavix summarize\` - Analyze conversation and extract prompt
- \`clavix list\` - List sessions and outputs
- \`clavix update\` - Update Clavix managed blocks

## Slash Commands (AI Agent)

If using Claude Code, the following slash commands are now available:

- \`/clavix:fast [prompt]\` - Quick prompt improvements
- \`/clavix:deep [prompt]\` - Comprehensive prompt analysis
- \`/clavix:prd\` - Generate a PRD
- \`/clavix:start\` - Start conversational mode
- \`/clavix:summarize\` - Summarize conversation

## When to Use Which Mode

- **Fast mode** (\`/clavix:fast\`): Quick cleanup for simple prompts
- **Deep mode** (\`/clavix:deep\`): Comprehensive analysis for complex requirements
- **PRD mode** (\`/clavix:prd\`): Strategic planning with architecture and business impact

## Customization

You can customize templates by adding files to the \`templates/\` directory.
See documentation for template format details.

## Need Help?

- Documentation: https://github.com/Bob5k/Clavix
- Issues: https://github.com/Bob5k/Clavix/issues
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
