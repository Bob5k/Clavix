import { Command, Flags } from '@oclif/core';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { PromptManager, PromptMetadata } from '../../core/prompt-manager.js';
import { ChecklistParser } from '../../core/checklist-parser.js';

export default class Execute extends Command {
  static description = 'Execute a saved prompt from fast/deep optimization';

  static examples = [
    '<%= config.bin %> <%= command.id %> --latest',
    '<%= config.bin %> <%= command.id %> --latest --fast',
    '<%= config.bin %> <%= command.id %> --latest --deep',
    '<%= config.bin %> <%= command.id %> --id fast-20250117-143022-a3f2',
    '<%= config.bin %> <%= command.id %>',
  ];

  static flags = {
    latest: Flags.boolean({
      description: 'Auto-select latest prompt (any type)',
      default: false,
    }),
    fast: Flags.boolean({
      description: 'Filter to fast prompts only (use with --latest)',
      default: false,
    }),
    deep: Flags.boolean({
      description: 'Filter to deep prompts only (use with --latest)',
      default: false,
    }),
    id: Flags.string({
      description: 'Execute specific prompt by ID',
    }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(Execute);
    const promptManager = new PromptManager();

    try {
      // Get all prompts
      const allPrompts = await promptManager.listPrompts();

      if (allPrompts.length === 0) {
        console.log(chalk.yellow('\n⚠️  No prompts found\n'));
        console.log(chalk.cyan('Generate an optimized prompt first:'));
        console.log(chalk.cyan('  /clavix:fast "your requirement"'));
        console.log(chalk.cyan('  /clavix:deep "your requirement"'));
        console.log();
        return;
      }

      let selectedPrompt: PromptMetadata | null = null;

      // Execute specific prompt by ID
      if (flags.id) {
        selectedPrompt = allPrompts.find((p) => p.id === flags.id) || null;

        if (!selectedPrompt) {
          console.log(chalk.red(`\n✗ Prompt not found: ${flags.id}\n`));
          console.log(chalk.cyan('Run clavix prompts list to see available prompts'));
          console.log();
          return;
        }
      }
      // Auto-select latest with optional filtering
      else if (flags.latest) {
        let filtered = allPrompts;

        // Apply source filter
        if (flags.fast && !flags.deep) {
          filtered = allPrompts.filter((p) => p.source === 'fast');
        } else if (flags.deep && !flags.fast) {
          filtered = allPrompts.filter((p) => p.source === 'deep');
        }

        if (filtered.length === 0) {
          const source = flags.fast ? 'fast' : flags.deep ? 'deep' : 'any';
          console.log(chalk.yellow(`\n⚠️  No ${source} prompts found\n`));
          console.log(chalk.cyan(`Generate a ${source} prompt first:`));
          console.log(
            chalk.cyan(`  /clavix:${source === 'any' ? 'fast' : source} "your requirement"`)
          );
          console.log();
          return;
        }

        // Latest is first (already sorted by timestamp desc)
        selectedPrompt = filtered[0];
      }
      // Interactive selection
      else {
        selectedPrompt = await this.selectPromptInteractively(allPrompts);
        if (!selectedPrompt) return;
      }

      // Load and display prompt
      await this.executePrompt(selectedPrompt, promptManager);
    } catch (error) {
      console.log(chalk.red(`\n✗ Error: ${error}\n`));
    }
  }

  private async selectPromptInteractively(
    prompts: PromptMetadata[]
  ): Promise<PromptMetadata | null> {
    console.log(chalk.bold.cyan('\n📋 Available Prompts\n'));

    const choices = prompts.map((p) => {
      const status = p.executed ? chalk.green('✓') : chalk.gray('○');
      const age = p.ageInDays === 0 ? 'today' : `${p.ageInDays}d ago`;
      const ageColor =
        (p.ageInDays || 0) > 30 ? chalk.red : (p.ageInDays || 0) > 7 ? chalk.yellow : chalk.gray;

      return {
        name: `${status} [${p.source}] ${p.originalPrompt.substring(0, 60)}... ${ageColor(`(${age})`)}`,
        value: p.id,
        short: p.id,
      };
    });

    const { promptId } = await inquirer.prompt([
      {
        type: 'list',
        name: 'promptId',
        message: 'Select a prompt to execute:',
        choices,
        pageSize: 15,
      },
    ]);

    return prompts.find((p) => p.id === promptId) || null;
  }

  private async executePrompt(prompt: PromptMetadata, manager: PromptManager): Promise<void> {
    const promptData = await manager.loadPrompt(prompt.id);

    if (!promptData) {
      console.log(chalk.red(`\n✗ Could not load prompt: ${prompt.id}\n`));
      return;
    }

    // Display prompt header
    console.log(chalk.bold.cyan(`\n🎯 Executing Prompt: ${prompt.id}\n`));
    console.log(chalk.gray(`Source: ${prompt.source}`));
    console.log(chalk.gray(`Created: ${new Date(prompt.timestamp).toLocaleDateString()}`));
    console.log(chalk.gray(`Age: ${prompt.ageInDays} days\n`));

    // Display full prompt content
    console.log(chalk.dim('─'.repeat(80)));
    console.log(promptData.content);
    console.log(chalk.dim('─'.repeat(80)));
    console.log();

    // Parse and display checklist summary
    const checklistParser = new ChecklistParser();
    const checklist = checklistParser.parse(promptData.content);

    if (checklist.hasChecklist) {
      const summary = checklistParser.getSummary(checklist);
      console.log(chalk.bold.cyan('📋 Checklist Summary:'));
      console.log(chalk.gray(`   Validation items: ${summary.validation}`));
      console.log(chalk.gray(`   Edge cases: ${summary.edgeCases}`));
      console.log(chalk.gray(`   Risks: ${summary.risks}`));
      console.log(chalk.gray(`   Total: ${checklist.totalItems} items to verify`));
      console.log();
    }

    // Mark as executed
    if (!prompt.executed) {
      await manager.markExecuted(prompt.id);
      console.log(chalk.green('✓ Prompt marked as executed\n'));
    }

    // Display REQUIRED verification notice
    console.log(chalk.bgYellow.black(' ⚠️  VERIFICATION REQUIRED '));
    console.log(chalk.yellow('After implementing, run verification:'));
    console.log(chalk.cyan(`   clavix verify --id ${prompt.id}`));
    console.log(chalk.cyan('   Or: /clavix:verify'));
    console.log();

    // Suggest cleanup
    const stats = await manager.getStorageStats();
    if (stats.executedPrompts >= 5) {
      console.log(chalk.gray(`💡 You have ${stats.executedPrompts} executed prompts.`));
      console.log(chalk.gray(`   Clean up after verification: clavix prompts clear --executed`));
      console.log();
    }

    console.log(chalk.cyan('💡 Next steps:'));
    console.log(chalk.cyan('   1. Implement the requirements described above'));
    console.log(chalk.cyan('   2. Run: clavix verify --latest'));
    console.log();
  }
}
