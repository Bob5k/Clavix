import { Command, Flags } from '@oclif/core';
import chalk from 'chalk';
import inquirer from 'inquirer';
import fs from 'fs-extra';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { DocInjector } from '../../core/doc-injector.js';
import { AgentManager } from '../../core/agent-manager.js';
import { AgentsMdGenerator } from '../../core/adapters/agents-md-generator.js';
import { OctoMdGenerator } from '../../core/adapters/octo-md-generator.js';
import { WarpMdGenerator } from '../../core/adapters/warp-md-generator.js';
import { InstructionsGenerator } from '../../core/adapters/instructions-generator.js';
import { AgentAdapter } from '../../types/agent.js';
import { collectLegacyCommandFiles } from '../../utils/legacy-command-cleanup.js';

const __filename = fileURLToPath(import.meta.url);
const _dirname = dirname(__filename); // eslint-disable-line @typescript-eslint/no-unused-vars

export default class Update extends Command {
  static description = 'Update managed blocks and slash commands';

  static examples = [
    '<%= config.bin %> <%= command.id %>',
    '<%= config.bin %> <%= command.id %> --docs-only',
    '<%= config.bin %> <%= command.id %> --commands-only',
  ];

  static flags = {
    'docs-only': Flags.boolean({
      description: 'Update only documentation blocks (AGENTS.md, CLAUDE.md, OCTO.md, WARP.md)',
      default: false,
    }),
    'commands-only': Flags.boolean({
      description: 'Update only slash command files',
      default: false,
    }),
    force: Flags.boolean({
      char: 'f',
      description: "Force update even if files haven't changed",
      default: false,
    }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(Update);

    const clavixDir = path.join(process.cwd(), '.clavix');
    const configPath = path.join(clavixDir, 'config.json');

    if (!fs.existsSync(clavixDir) || !fs.existsSync(configPath)) {
      this.error(
        chalk.red('No .clavix directory found.') +
          '\n' +
          chalk.yellow('Run ') +
          chalk.cyan('clavix init') +
          chalk.yellow(' to initialize Clavix in this project.')
      );
    }

    this.log(chalk.bold.cyan('🔄 Updating Clavix integration...\n'));

    // Load config to determine integrations
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    const integrations = config.integrations || config.providers || ['claude-code'];

    const agentManager = new AgentManager();

    const updateDocs = flags['docs-only'] || (!flags['docs-only'] && !flags['commands-only']);
    const updateCommands =
      flags['commands-only'] || (!flags['docs-only'] && !flags['commands-only']);

    let updatedCount = 0;

    // Update for each provider
    for (const integrationName of integrations) {
      // Handle AGENTS.md separately
      if (integrationName === 'agents-md') {
        if (updateDocs) {
          updatedCount += await this.updateAgentsMd(flags.force);
        }
        continue;
      }

      // Handle Warp separately
      if (integrationName === 'warp-md') {
        if (updateDocs) {
          updatedCount += await this.updateWarpMd(flags.force);
        }
        continue;
      }

      // Handle Octofriend separately
      if (integrationName === 'octo-md') {
        if (updateDocs) {
          updatedCount += await this.updateOctoMd(flags.force);
        }
        continue;
      }

      const adapter = agentManager.getAdapter(integrationName);

      if (!adapter) {
        this.log(chalk.yellow(`  ⚠ Unknown integration: ${integrationName}, skipping...`));
        continue;
      }

      // Update documentation blocks (Claude Code only)
      if (updateDocs && integrationName === 'claude-code') {
        updatedCount += await this.updateDocumentation(adapter, integrationName, flags.force);
      }

      // Update slash commands
      if (updateCommands) {
        updatedCount += await this.updateCommands(adapter, flags.force);
      }
    }

    // Update .clavix/instructions/ folder for generic integrations
    if (updateDocs && InstructionsGenerator.needsGeneration(integrations)) {
      this.log(chalk.gray('\n📁 Updating .clavix/instructions/ reference folder...'));
      await InstructionsGenerator.generate();
      this.log(chalk.gray('  ✓ Updated detailed workflow guides'));
      updatedCount++;
    }

    this.log('');
    if (updatedCount > 0) {
      this.log(chalk.green(`✅ Successfully updated ${updatedCount} file(s)`));
    } else {
      this.log(chalk.gray('✓ All files are up to date'));
    }
  }

  private async updateDocumentation(
    _adapter: AgentAdapter,
    agentType: string,
    force: boolean
  ): Promise<number> {
    this.log(chalk.cyan('📝 Updating documentation blocks...'));

    let updated = 0;

    // Update AGENTS.md
    const agentsPath = path.join(process.cwd(), 'AGENTS.md');
    if (fs.existsSync(agentsPath)) {
      const agentsContent = this.getAgentsContent();
      const currentContent = fs.readFileSync(agentsPath, 'utf-8');

      if (force || !this.hasUpToDateBlock(currentContent, agentsContent)) {
        await DocInjector.injectBlock(agentsPath, agentsContent);
        this.log(chalk.gray('  ✓ Updated AGENTS.md'));
        updated++;
      } else {
        this.log(chalk.gray('  • AGENTS.md already up to date'));
      }
    } else {
      this.log(chalk.yellow('  ⚠ AGENTS.md not found, skipping'));
    }

    // Update agent-specific docs (e.g., CLAUDE.md for Claude Code)
    if (agentType === 'claude-code') {
      const claudePath = path.join(process.cwd(), 'CLAUDE.md');
      if (fs.existsSync(claudePath)) {
        const claudeContent = this.getClaudeContent();
        const currentContent = fs.readFileSync(claudePath, 'utf-8');

        if (force || !this.hasUpToDateBlock(currentContent, claudeContent)) {
          await DocInjector.injectBlock(claudePath, claudeContent, {
            startMarker: '<!-- CLAVIX:START -->',
            endMarker: '<!-- CLAVIX:END -->',
          });
          this.log(chalk.gray('  ✓ Updated CLAUDE.md'));
          updated++;
        } else {
          this.log(chalk.gray('  • CLAUDE.md already up to date'));
        }
      } else {
        this.log(chalk.yellow('  ⚠ CLAUDE.md not found, skipping'));
      }
    }

    return updated;
  }

  private async updateCommands(adapter: AgentAdapter, force: boolean): Promise<number> {
    this.log(chalk.cyan(`\n🔧 Updating slash commands for ${adapter.displayName}...`));

    // Remove all existing commands first (force regeneration)
    const removed = await adapter.removeAllCommands();
    if (removed > 0) {
      this.log(chalk.gray(`  Removed ${removed} existing command(s)`));
    }

    // Load templates using the canonical template loader
    const { loadCommandTemplates } = await import('../../utils/template-loader.js');
    const templates = await loadCommandTemplates(adapter);

    if (templates.length === 0) {
      this.log(chalk.yellow('  ⚠ No command templates found'));
      return 0;
    }

    // Generate fresh commands from templates
    await adapter.generateCommands(templates);

    this.log(chalk.gray(`  ✓ Generated ${templates.length} command(s)`));

    // Handle legacy commands (cleanup old naming patterns)
    const commandNames = templates.map((t) => t.name);
    const legacyRemoved = await this.handleLegacyCommands(adapter, commandNames, force);

    return removed + templates.length + legacyRemoved;
  }

  private async handleLegacyCommands(
    adapter: AgentAdapter,
    commandNames: string[],
    force: boolean
  ): Promise<number> {
    if (commandNames.length === 0) {
      return 0;
    }

    const legacyFiles = await collectLegacyCommandFiles(adapter, commandNames);

    if (legacyFiles.length === 0) {
      return 0;
    }

    const relativePaths = legacyFiles
      .map((file) => path.relative(process.cwd(), file))
      .sort((a, b) => a.localeCompare(b));

    this.log(chalk.gray(`  ⚠ Found ${relativePaths.length} deprecated command file(s):`));
    for (const file of relativePaths) {
      this.log(chalk.gray(`    • ${file}`));
    }

    if (!force) {
      const { removeLegacy } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'removeLegacy',
          message: `Remove deprecated files for ${adapter.displayName}? Functionality is unchanged; filenames are being standardized.`,
          default: true,
        },
      ]);

      if (!removeLegacy) {
        this.log(chalk.gray('  ⊗ Kept legacy files (deprecated naming retained)'));
        return 0;
      }
    }

    let removed = 0;
    for (const file of legacyFiles) {
      await fs.remove(file);
      this.log(chalk.gray(`  ✓ Removed ${path.relative(process.cwd(), file)}`));
      removed++;
    }

    return removed;
  }

  private getAgentsContent(): string {
    return `## Clavix Integration

This project uses Clavix for prompt improvement and PRD generation.

### Setup Commands (CLI)
| Command | Purpose |
|---------|---------|
| \`clavix init\` | Initialize Clavix in a project |
| \`clavix update\` | Update templates after package update |
| \`clavix config\` | Manage configuration |
| \`clavix version\` | Show version |

### Workflow Commands (Slash Commands)
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

Learn more: https://github.com/clavixdev/clavix`;
  }

  private getClaudeContent(): string {
    // Use DocInjector as single source of truth for CLAUDE.md content
    return DocInjector.getClaudeBlockContent();
  }

  private hasUpToDateBlock(currentContent: string, newContent: string): boolean {
    // Check if the managed block contains the new content
    return currentContent.includes(newContent.trim());
  }

  private async updateAgentsMd(_force: boolean): Promise<number> {
    this.log(chalk.cyan('📝 Updating AGENTS.md...'));

    try {
      await AgentsMdGenerator.generate();
      this.log(chalk.gray('  ✓ Updated AGENTS.md'));
      return 1;
    } catch (error: unknown) {
      const { getErrorMessage } = await import('../../utils/error-utils.js');
      this.log(chalk.yellow(`  ⚠ Failed to update AGENTS.md: ${getErrorMessage(error)}`));
      return 0;
    }
  }

  private async updateOctoMd(_force: boolean): Promise<number> {
    this.log(chalk.cyan('📝 Updating OCTO.md...'));

    try {
      await OctoMdGenerator.generate();
      this.log(chalk.gray('  ✓ Updated OCTO.md'));
      return 1;
    } catch (error: unknown) {
      const { getErrorMessage } = await import('../../utils/error-utils.js');
      this.log(chalk.yellow(`  ⚠ Failed to update OCTO.md: ${getErrorMessage(error)}`));
      return 0;
    }
  }

  private async updateWarpMd(_force: boolean): Promise<number> {
    this.log(chalk.cyan('📝 Updating WARP.md...'));

    try {
      await WarpMdGenerator.generate();
      this.log(chalk.gray('  ✓ Updated WARP.md'));
      return 1;
    } catch (error: unknown) {
      const { getErrorMessage } = await import('../../utils/error-utils.js');
      this.log(chalk.yellow(`  ⚠ Failed to update WARP.md: ${getErrorMessage(error)}`));
      return 0;
    }
  }
}
