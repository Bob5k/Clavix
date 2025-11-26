import { Command, Flags } from '@oclif/core';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { PromptManager, PromptMetadata } from '../../core/prompt-manager.js';
import { VerificationManager } from '../../core/verification-manager.js';
import { ChecklistParser } from '../../core/checklist-parser.js';
import { BasicChecklistGenerator } from '../../core/basic-checklist-generator.js';
import { IntentDetector } from '../../core/intelligence/intent-detector.js';
import { VerificationReport, ChecklistItem, VerificationStatus } from '../../types/verification.js';

export default class Verify extends Command {
  static description = 'Verify implementation against checklist from deep/fast mode';

  static examples = [
    '<%= config.bin %> <%= command.id %> --latest',
    '<%= config.bin %> <%= command.id %> --latest --deep',
    '<%= config.bin %> <%= command.id %> --id deep-20250117-143022-a3f2',
    '<%= config.bin %> <%= command.id %> --status',
    '<%= config.bin %> <%= command.id %> --retry-failed',
  ];

  static flags = {
    latest: Flags.boolean({
      description: 'Verify latest executed prompt',
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
      description: 'Verify specific prompt by ID',
    }),
    status: Flags.boolean({
      description: 'Show verification status only',
      default: false,
    }),
    'retry-failed': Flags.boolean({
      description: 'Re-run only failed items',
      default: false,
    }),
    export: Flags.string({
      description: 'Export report format',
      options: ['markdown', 'json'],
    }),
    'run-hooks': Flags.boolean({
      description: 'Run automated hooks during verification',
      default: true,
    }),
  };

  private promptManager!: PromptManager;
  private verificationManager!: VerificationManager;
  private checklistParser!: ChecklistParser;
  private basicChecklistGenerator!: BasicChecklistGenerator;
  private intentDetector!: IntentDetector;

  async run(): Promise<void> {
    const { flags } = await this.parse(Verify);

    this.promptManager = new PromptManager();
    this.verificationManager = new VerificationManager();
    this.checklistParser = new ChecklistParser();
    this.basicChecklistGenerator = new BasicChecklistGenerator();
    this.intentDetector = new IntentDetector();

    try {
      // Get all prompts
      const allPrompts = await this.promptManager.listPrompts();

      if (allPrompts.length === 0) {
        console.log(chalk.yellow('\n⚠️  No prompts found\n'));
        console.log(chalk.cyan('Generate an optimized prompt first:'));
        console.log(chalk.cyan('  /clavix:fast "your requirement"'));
        console.log(chalk.cyan('  /clavix:deep "your requirement"'));
        console.log();
        return;
      }

      let selectedPrompt: PromptMetadata | null = null;

      // Select prompt by ID
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

        // Filter by source
        if (flags.fast && !flags.deep) {
          filtered = allPrompts.filter((p) => p.source === 'fast');
        } else if (flags.deep && !flags.fast) {
          filtered = allPrompts.filter((p) => p.source === 'deep');
        }

        // Filter to executed prompts preferably
        const executedFiltered = filtered.filter((p) => p.executed);
        if (executedFiltered.length > 0) {
          filtered = executedFiltered;
        }

        if (filtered.length === 0) {
          const source = flags.fast ? 'fast' : flags.deep ? 'deep' : 'any';
          console.log(chalk.yellow(`\n⚠️  No ${source} prompts found\n`));
          return;
        }

        selectedPrompt = filtered[0];
      }
      // Interactive selection
      else {
        selectedPrompt = await this.selectPromptInteractively(allPrompts);
        if (!selectedPrompt) return;
      }

      // Handle status-only flag
      if (flags.status) {
        await this.showStatus(selectedPrompt);
        return;
      }

      // Handle export flag
      if (flags.export) {
        await this.exportReport(selectedPrompt, flags.export);
        return;
      }

      // Run verification
      await this.runVerification(selectedPrompt, {
        retryFailed: flags['retry-failed'],
        runHooks: flags['run-hooks'],
      });
    } catch (error) {
      console.log(chalk.red(`\n✗ Error: ${error}\n`));
    }
  }

  private async selectPromptInteractively(
    prompts: PromptMetadata[]
  ): Promise<PromptMetadata | null> {
    console.log(chalk.bold.cyan('\n📋 Select Prompt to Verify\n'));

    const choices = prompts.map((p) => {
      const executed = p.executed ? chalk.green('✓') : chalk.gray('○');
      const age = p.ageInDays === 0 ? 'today' : `${p.ageInDays}d ago`;
      const ageColor =
        (p.ageInDays || 0) > 30 ? chalk.red : (p.ageInDays || 0) > 7 ? chalk.yellow : chalk.gray;

      return {
        name: `${executed} [${p.source}] ${p.originalPrompt.substring(0, 50)}... ${ageColor(`(${age})`)}`,
        value: p.id,
        short: p.id,
      };
    });

    const { promptId } = await inquirer.prompt([
      {
        type: 'list',
        name: 'promptId',
        message: 'Select a prompt to verify:',
        choices,
        pageSize: 15,
      },
    ]);

    return prompts.find((p) => p.id === promptId) || null;
  }

  private async showStatus(prompt: PromptMetadata): Promise<void> {
    console.log(chalk.bold.cyan(`\n🔍 Verification Status: ${prompt.id}\n`));

    const status = await this.verificationManager.getVerificationStatus(prompt.id);

    if (!status.hasReport) {
      console.log(chalk.yellow('No verification report found.'));
      console.log(chalk.cyan('\nRun: clavix verify --latest'));
      console.log();
      return;
    }

    console.log(chalk.gray(`Status: ${this.formatStatus(status.status!)}`));
    console.log();

    if (status.summary) {
      console.log(chalk.bold('Summary:'));
      console.log(`  Total:    ${status.summary.total} items`);
      console.log(
        `  Passed:   ${chalk.green(status.summary.passed)} (${status.summary.coveragePercent}%)`
      );
      console.log(`  Failed:   ${chalk.red(status.summary.failed)}`);
      console.log(`  Skipped:  ${chalk.gray(status.summary.skipped)}`);
      console.log();
    }
  }

  private async exportReport(prompt: PromptMetadata, format: string): Promise<void> {
    const report = await this.verificationManager.loadReport(prompt.id);

    if (!report) {
      console.log(chalk.yellow('No verification report found.'));
      return;
    }

    if (format === 'json') {
      console.log(JSON.stringify(report, null, 2));
    } else if (format === 'markdown') {
      console.log(this.verificationManager.formatReportForDisplay(report));
    }
  }

  private async runVerification(
    prompt: PromptMetadata,
    options: { retryFailed: boolean; runHooks: boolean }
  ): Promise<void> {
    console.log(chalk.bold.cyan(`\n🔍 Verifying: ${prompt.id}\n`));
    console.log(chalk.gray(`Source: ${prompt.source}`));
    console.log(chalk.gray(`Created: ${new Date(prompt.timestamp).toLocaleDateString()}`));
    console.log();

    // Load prompt content
    const promptData = await this.promptManager.loadPrompt(prompt.id);
    if (!promptData) {
      console.log(chalk.red('Could not load prompt content.'));
      return;
    }

    // Parse checklist from prompt
    let checklist = this.checklistParser.parse(promptData.content);

    // Handle fast mode - generate basic checklist if none exists
    if (!checklist.hasChecklist && prompt.source === 'fast') {
      console.log(chalk.yellow('⚠️  No checklist found (fast mode prompt)'));
      console.log(chalk.cyan('Generating basic checklist based on intent...\n'));

      // Detect intent from original prompt
      const intent = this.intentDetector.analyze(prompt.originalPrompt);
      checklist = this.basicChecklistGenerator.generateFromPrompt(
        prompt.originalPrompt,
        intent.primaryIntent
      );

      console.log(chalk.gray(`Intent: ${intent.primaryIntent} (${intent.confidence}% confidence)`));
      console.log(chalk.gray(`Generated ${checklist.totalItems} checklist items\n`));
      console.log(chalk.yellow('💡 For comprehensive checklists, use /clavix:deep\n'));
    }

    if (!checklist.hasChecklist) {
      console.log(chalk.yellow('No checklist items to verify.'));
      return;
    }

    // Initialize or load existing report
    let report = await this.verificationManager.loadReport(prompt.id);

    if (!report) {
      report = await this.verificationManager.initializeVerification(prompt.id);
      // Update with parsed checklist if from fast mode
      if (prompt.source === 'fast') {
        report.items = [...checklist.validationItems, ...checklist.edgeCases, ...checklist.risks];
        report.results = report.items.map((item) => ({
          itemId: item.id,
          status: 'pending' as VerificationStatus,
          method:
            item.verificationType === 'automated' ? ('automated' as const) : ('manual' as const),
          confidence: 'low' as const,
          verifiedAt: '',
        }));
        await this.verificationManager.saveReport(report);
      }
    }

    // Run automated hooks if requested
    if (options.runHooks) {
      console.log(chalk.cyan('Running automated verification hooks...\n'));
      report = await this.verificationManager.runAutomatedVerification(prompt.id);

      // Display hook results
      const automatedResults = report.results.filter(
        (r) => r.method === 'automated' && r.status !== 'pending'
      );
      for (const result of automatedResults) {
        const item = report.items.find((i) => i.id === result.itemId);
        if (item) {
          const icon = result.status === 'passed' ? chalk.green('✓') : chalk.red('✗');
          console.log(`${icon} [automated] ${item.content}`);
          if (result.evidence) {
            console.log(chalk.gray(`  Evidence: ${result.evidence.substring(0, 60)}...`));
          }
        }
      }

      if (automatedResults.length > 0) {
        console.log();
      }
    }

    // Get pending items for manual verification
    const pendingItems = this.verificationManager.getPendingItems(report);

    if (pendingItems.length > 0) {
      console.log(chalk.cyan(`Manual verification needed for ${pendingItems.length} items:\n`));

      for (const item of pendingItems) {
        report = await this.verifyItemInteractively(report, item);
      }
    }

    // Show final report
    console.log();
    console.log(this.verificationManager.formatReportForDisplay(report));

    // Mark prompt as verified if complete
    if (this.verificationManager.isComplete(report)) {
      console.log(chalk.green('\n✓ Verification complete!\n'));
    } else if (this.verificationManager.requiresAttention(report)) {
      console.log(chalk.yellow('\n⚠️  Some items require attention.\n'));
      console.log(
        chalk.cyan('Fix issues and re-run: clavix verify --retry-failed --id ' + prompt.id)
      );
      console.log();
    }
  }

  private async verifyItemInteractively(
    report: VerificationReport,
    item: ChecklistItem
  ): Promise<VerificationReport> {
    console.log(chalk.bold(`\n📋 ${item.content}`));
    if (item.group) {
      console.log(chalk.gray(`   Category: ${item.group}`));
    }
    console.log();

    const { status } = await inquirer.prompt([
      {
        type: 'list',
        name: 'status',
        message: 'Verification status:',
        choices: [
          { name: '✓ Passed - Item is verified', value: 'passed' },
          { name: '✗ Failed - Item is not covered', value: 'failed' },
          { name: '⏭️  Skip - Will verify later', value: 'skipped' },
          { name: '➖ N/A - Does not apply', value: 'not-applicable' },
        ],
      },
    ]);

    let evidence: string | undefined;
    let reason: string | undefined;

    if (status === 'passed') {
      const { evidenceInput } = await inquirer.prompt([
        {
          type: 'input',
          name: 'evidenceInput',
          message: 'Evidence (optional):',
        },
      ]);
      evidence = evidenceInput || undefined;
    } else if (status === 'failed') {
      const { reasonInput } = await inquirer.prompt([
        {
          type: 'input',
          name: 'reasonInput',
          message: 'Why is it not covered?',
        },
      ]);
      reason = reasonInput || 'Not specified';
    } else if (status === 'skipped') {
      const { reasonInput } = await inquirer.prompt([
        {
          type: 'input',
          name: 'reasonInput',
          message: 'Reason for skipping:',
        },
      ]);
      reason = reasonInput || 'Will verify later';
    }

    return this.verificationManager.markItemVerified(report.promptId, item.id, status, {
      evidence,
      reason,
      confidence: 'medium',
      method: 'manual',
    });
  }

  private formatStatus(status: string): string {
    switch (status) {
      case 'completed':
        return chalk.green('Completed');
      case 'in-progress':
        return chalk.yellow('In Progress');
      case 'requires-attention':
        return chalk.red('Requires Attention');
      case 'pending':
      default:
        return chalk.gray('Pending');
    }
  }
}
