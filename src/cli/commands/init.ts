import { Command } from '@oclif/core';
import inquirer from 'inquirer';
import chalk from 'chalk';
import * as path from 'path';
import JSON5 from 'json5';
import { AgentManager } from '../../core/agent-manager';
import { DocInjector } from '../../core/doc-injector';
import { FileSystem } from '../../utils/file-system';
import { ClavixConfig, DEFAULT_CONFIG } from '../../types/config';
import { CommandTemplate } from '../../types/agent';

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

      // Select agent
      const agentManager = new AgentManager();
      const agents = agentManager.getAvailableAgents();

      console.log(chalk.gray('Select your AI agent:\n'));

      const { selectedAgent } = await inquirer.prompt([
        {
          type: 'list',
          name: 'selectedAgent',
          message: 'Which AI agent are you using?',
          choices: [
            {
              name: 'Claude Code - AI-powered CLI for Claude',
              value: 'claude-code',
            },
            {
              name: chalk.gray('Cursor (coming soon)'),
              value: null,
              disabled: true,
            },
            {
              name: chalk.gray('Windsurf (coming soon)'),
              value: null,
              disabled: true,
            },
          ],
        },
      ]);

      if (!selectedAgent) {
        console.log(chalk.red('\n✗ No agent selected\n'));
        return;
      }

      // Create .clavix directory structure
      console.log(chalk.cyan('\n📁 Creating directory structure...'));
      await this.createDirectoryStructure();

      // Generate config
      console.log(chalk.cyan('⚙️  Generating configuration...'));
      await this.generateConfig(selectedAgent);

      // Generate INSTRUCTIONS.md
      await this.generateInstructions();

      // Migrate from old command structure if needed
      const adapter = agentManager.requireAdapter(selectedAgent);
      await this.migrateOldCommands(adapter);

      // Generate slash commands
      console.log(chalk.cyan(`📝 Generating ${adapter.displayName} slash commands...`));
      await this.generateSlashCommands(adapter);

      // Inject documentation blocks
      console.log(chalk.cyan('📄 Injecting documentation blocks...'));
      await this.injectDocumentation(adapter);

      // Success message
      console.log(chalk.bold.green('\n✅ Clavix initialized successfully!\n'));
      console.log(chalk.gray('Next steps:'));
      console.log(chalk.gray('  • Slash commands are now available in your AI agent'));
      console.log(chalk.gray('  • Run'), chalk.cyan('clavix --help'), chalk.gray('to see all commands'));
      console.log(chalk.gray('  • Try'), chalk.cyan('/clavix:fast'), chalk.gray('for quick prompt improvements'));
      console.log(chalk.gray('  • Try'), chalk.cyan('/clavix:deep'), chalk.gray('for comprehensive prompt analysis'));
      console.log(chalk.gray('  • Use'), chalk.cyan('/clavix:prd'), chalk.gray('to generate a PRD\n'));
    } catch (error: any) {
      console.error(chalk.red('\n✗ Initialization failed:'), error.message);
      if (error.hint) {
        console.error(chalk.yellow('  Hint:'), error.hint);
      }
      throw error;
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

  private async generateConfig(agent: string): Promise<void> {
    const config: ClavixConfig = {
      ...DEFAULT_CONFIG,
      agent,
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

  private async generateSlashCommands(adapter: any): Promise<void> {
    const templateDir = path.join(__dirname, '../../../src/templates/slash-commands/claude-code');
    const commandFiles = await FileSystem.listFiles(templateDir, /\.md$/);

    const templates: CommandTemplate[] = [];

    for (const file of commandFiles) {
      const content = await FileSystem.readFile(path.join(templateDir, file));
      const name = file.replace('.md', '');

      templates.push({
        name,
        content,
        description: this.extractDescription(content),
      });
    }

    await adapter.generateCommands(templates);
  }

  private async injectDocumentation(adapter: any): Promise<void> {
    // Inject AGENTS.md
    const agentsContent = DocInjector.getDefaultAgentsContent();
    await DocInjector.injectBlock('AGENTS.md', this.extractClavixBlock(agentsContent));

    // Inject CLAUDE.md if Claude Code selected
    if (adapter.name === 'claude-code') {
      const claudeContent = DocInjector.getDefaultClaudeContent();
      await DocInjector.injectBlock('CLAUDE.md', this.extractClavixBlock(claudeContent));
    }
  }

  private async migrateOldCommands(adapter: any): Promise<void> {
    // Check for old command structure (.claude/commands/clavix:*.md)
    const oldCommandsPath = '.claude/commands';

    if (!await FileSystem.exists(oldCommandsPath)) {
      return;
    }

    try {
      const files = await FileSystem.listFiles(oldCommandsPath, /^clavix:.*\.md$/);

      if (files.length === 0) {
        return;
      }

      console.log(chalk.cyan('🔄 Migrating old command structure...'));

      let removed = 0;
      for (const file of files) {
        const filePath = path.join(oldCommandsPath, file);
        if (await FileSystem.exists(filePath)) {
          await FileSystem.remove(filePath);
          console.log(chalk.gray(`  ✓ Removed old command: ${file}`));
          removed++;
        }
      }

      if (removed > 0) {
        console.log(chalk.green(`  ✓ Migration complete: removed ${removed} old command file(s)`));
      }
    } catch (error) {
      // Non-fatal error - log but continue
      console.log(chalk.yellow('  ⚠ Could not migrate old commands (non-fatal)'));
    }
  }

  private extractDescription(content: string): string {
    const match = content.match(/description:\s*(.+)/);
    return match ? match[1] : '';
  }

  private extractClavixBlock(content: string): string {
    const match = content.match(/<!-- CLAVIX:START -->([\s\S]*?)<!-- CLAVIX:END -->/);
    return match ? match[1].trim() : content;
  }
}
