import { Command, Args, Flags } from '@oclif/core';
import chalk from 'chalk';
import * as path from 'path';
import { SessionManager } from '../../core/session-manager';
import { ConversationAnalyzer, ConversationAnalysis } from '../../core/conversation-analyzer';
import { FileSystem } from '../../utils/file-system';
import { PromptOptimizer } from '../../core/prompt-optimizer';

export default class Summarize extends Command {
  static description = 'Analyze a conversation session and extract structured requirements';

  static examples = [
    '<%= config.bin %> <%= command.id %>',
    '<%= config.bin %> <%= command.id %> <session-id>',
    '<%= config.bin %> <%= command.id %> --active',
  ];

  static args = {
    sessionId: Args.string({
      description: 'Session ID to summarize',
      required: false,
    }),
  };

  static flags = {
    active: Flags.boolean({
      char: 'a',
      description: 'Summarize the most recent active session',
      default: false,
    }),
    output: Flags.string({
      char: 'o',
      description: 'Output directory (defaults to .clavix/outputs/[session-name])',
    }),
    'skip-clear': Flags.boolean({
      description: 'Skip CLEAR framework optimization of extracted prompt',
      default: false,
    }),
  };

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Summarize);

    console.log(chalk.bold.cyan('\nConversation Summarizer\n'));

    try {
      const manager = new SessionManager();
      const analyzer = new ConversationAnalyzer();

      // Load session
      let session;
      if (args.sessionId) {
        console.log(chalk.dim(`Loading session ${args.sessionId}...\n`));
        session = await manager.getSession(args.sessionId);

        if (!session) {
          this.error(chalk.red(`Error: Session not found: ${args.sessionId}`));
        }
      } else if (flags.active) {
        console.log(chalk.dim('Loading most recent active session...\n'));
        session = await manager.getActiveSession();

        if (!session) {
          this.error(
            chalk.red('Error: No active session found') +
            '\n\n' +
            chalk.gray('Hint: Use ') + chalk.cyan('clavix list') + chalk.gray(' to see all sessions')
          );
        }
      } else {
        // Try to get active session by default
        session = await manager.getActiveSession();

        if (!session) {
          this.error(
            chalk.yellow('Warning: No active session found') +
            '\n\n' +
            chalk.gray('Usage:') +
            '\n' + chalk.gray('  • ') + chalk.cyan('clavix summarize <session-id>') + chalk.gray(' - Summarize specific session') +
            '\n' + chalk.gray('  • ') + chalk.cyan('clavix summarize --active') + chalk.gray(' - Summarize most recent active session') +
            '\n' + chalk.gray('  • ') + chalk.cyan('clavix list') + chalk.gray(' - View all sessions')
          );
        }
      }

      // Display session info
      console.log(chalk.bold('Session Information:'));
      console.log(chalk.gray('  ID:'), chalk.cyan(session.id));
      console.log(chalk.gray('  Project:'), chalk.cyan(session.projectName));
      console.log(chalk.gray('  Messages:'), chalk.cyan(session.messages.length.toString()));
      console.log(chalk.gray('  Created:'), chalk.dim(session.created.toLocaleString()));
      console.log();

      // Check if session has messages
      if (session.messages.length === 0) {
        this.error(chalk.yellow('Warning: Session has no messages to analyze'));
      }

      // Analyze conversation
      console.log(chalk.dim('Analyzing conversation...\n'));
      const analysis = analyzer.analyze(session);

      // Display analysis summary
      this.displayAnalysisSummary(analysis);

      // Generate outputs
      console.log(chalk.dim('\nGenerating output files...\n'));

      const outputDir = flags.output ||
        path.join('.clavix/outputs', this.sanitizeProjectName(session.projectName));

      await FileSystem.ensureDir(outputDir);

      // Generate mini-PRD
      const miniPrdContent = analyzer.generateMiniPrd(session, analysis);
      const miniPrdPath = path.join(outputDir, 'mini-prd.md');
      await FileSystem.writeFileAtomic(miniPrdPath, miniPrdContent);

      // Generate optimized prompt
      const optimizedPromptContent = analyzer.generateOptimizedPrompt(session, analysis);
      const optimizedPromptPath = path.join(outputDir, 'optimized-prompt.md');
      await FileSystem.writeFileAtomic(optimizedPromptPath, optimizedPromptContent);

      // CLEAR optimization (unless skipped)
      if (!flags['skip-clear']) {
        await this.applyClearOptimization(optimizedPromptContent, outputDir);
      }

      // Display success
      console.log(chalk.bold.green('Analysis complete!\n'));
      console.log(chalk.bold('Generated files:'));
      console.log(chalk.gray('  • ') + chalk.cyan('mini-prd.md') + chalk.dim(' - Structured requirements document'));
      console.log(chalk.gray('  • ') + chalk.cyan('optimized-prompt.md') + chalk.dim(' - AI-ready development prompt'));
      if (!flags['skip-clear']) {
        console.log(chalk.gray('  • ') + chalk.cyan('clear-optimized-prompt.md') + chalk.dim(' - CLEAR-enhanced version (C, L, E)'));
      }
      console.log();
      console.log(chalk.bold('Output location:'));
      console.log(chalk.dim(`  ${outputDir}`));
      console.log();
      console.log(chalk.bold('Next steps:'));
      if (!flags['skip-clear']) {
        console.log(chalk.gray('  • Use ') + chalk.cyan('clear-optimized-prompt.md') + chalk.gray(' for best AI results (CLEAR-optimized)'));
        console.log(chalk.gray('  • Or use ') + chalk.cyan('optimized-prompt.md') + chalk.gray(' for the original extracted version'));
      } else {
        console.log(chalk.gray('  • Use ') + chalk.cyan('optimized-prompt.md') + chalk.gray(' as input for your AI agent'));
      }
      console.log(chalk.gray('  • Share ') + chalk.cyan('mini-prd.md') + chalk.gray(' with your team for alignment'));
      console.log();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      this.error(chalk.red(`Error: ${errorMessage}`));
    }
  }

  /**
   * Display analysis summary
   */
  private displayAnalysisSummary(analysis: ConversationAnalysis): void {
    console.log(chalk.bold('Analysis Summary:'));
    console.log();

    if (analysis.keyRequirements.length > 0) {
      console.log(chalk.bold.cyan('Key Requirements:'));
      analysis.keyRequirements.forEach((req: string) => {
        console.log(chalk.gray('  • ') + req);
      });
      console.log();
    }

    if (analysis.technicalConstraints.length > 0) {
      console.log(chalk.bold.cyan('Technical Constraints:'));
      analysis.technicalConstraints.forEach((constraint: string) => {
        console.log(chalk.gray('  • ') + constraint);
      });
      console.log();
    }

    if (analysis.successCriteria.length > 0) {
      console.log(chalk.bold.cyan('Success Criteria:'));
      analysis.successCriteria.forEach((criteria: string) => {
        console.log(chalk.gray('  • ') + criteria);
      });
      console.log();
    }

    if (analysis.outOfScope.length > 0) {
      console.log(chalk.bold.yellow('Out of Scope:'));
      analysis.outOfScope.forEach((item: string) => {
        console.log(chalk.gray('  • ') + item);
      });
      console.log();
    }
  }

  /**
   * Sanitize project name for directory name
   */
  private sanitizeProjectName(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 50);
  }

  /**
   * Apply CLEAR framework optimization to extracted prompt
   * Shows both raw extraction and CLEAR-enhanced version
   */
  private async applyClearOptimization(rawPrompt: string, outputDir: string): Promise<void> {
    try {
      console.log(chalk.bold.cyan('\n🎯 CLEAR Framework Optimization\n'));
      console.log(chalk.gray('Applying CLEAR framework to extracted prompt...\n'));

      const optimizer = new PromptOptimizer();
      const clearResult = optimizer.applyCLEARFramework(rawPrompt, 'fast');
      const clearScore = optimizer.calculateCLEARScore(clearResult);

      const getScoreColor = (score: number) => {
        if (score >= 80) return chalk.green;
        if (score >= 60) return chalk.yellow;
        return chalk.red;
      };

      // Display comparison
      console.log(chalk.bold('CLEAR Analysis of Extracted Prompt:\n'));

      // Conciseness
      const cColor = getScoreColor(clearScore.conciseness);
      console.log(cColor(`  [C] Concise: ${clearScore.conciseness.toFixed(0)}%`));
      if (clearResult.conciseness.suggestions.length > 0) {
        console.log(cColor(`      ${clearResult.conciseness.suggestions[0]}`));
      }
      console.log();

      // Logic
      const lColor = getScoreColor(clearScore.logic);
      console.log(lColor(`  [L] Logical: ${clearScore.logic.toFixed(0)}%`));
      if (clearResult.logic.suggestions.length > 0) {
        console.log(lColor(`      ${clearResult.logic.suggestions[0]}`));
      }
      console.log();

      // Explicitness
      const eColor = getScoreColor(clearScore.explicitness);
      console.log(eColor(`  [E] Explicit: ${clearScore.explicitness.toFixed(0)}%`));
      if (clearResult.explicitness.suggestions.length > 0) {
        console.log(eColor(`      ${clearResult.explicitness.suggestions[0]}`));
      }
      console.log();

      // Overall
      const overallColor = getScoreColor(clearScore.overall);
      console.log(overallColor(`  Overall: ${clearScore.overall.toFixed(0)}% (${clearScore.rating})\n`));

      // Display CLEAR changes made
      if (clearResult.changesSummary && clearResult.changesSummary.length > 0) {
        console.log(chalk.bold.magenta('CLEAR Improvements Applied:\n'));
        clearResult.changesSummary.slice(0, 3).forEach((change: { component: string; change: string }) => {
          console.log(chalk.magenta(`  [${change.component}] ${change.change}`));
        });
        console.log();
      }

      // Save CLEAR-optimized version
      const clearOptimizedPath = path.join(outputDir, 'clear-optimized-prompt.md');
      const clearOptimizedContent = `# CLEAR-Optimized Prompt

${clearResult.improvedPrompt}

---

## CLEAR Framework Assessment

- **[C] Concise**: ${clearScore.conciseness.toFixed(0)}% - ${clearResult.conciseness.suggestions[0] || 'Good'}
- **[L] Logical**: ${clearScore.logic.toFixed(0)}% - ${clearResult.logic.suggestions[0] || 'Good'}
- **[E] Explicit**: ${clearScore.explicitness.toFixed(0)}% - ${clearResult.explicitness.suggestions[0] || 'Good'}
- **Overall**: ${clearScore.overall.toFixed(0)}% (${clearScore.rating})

## Changes Applied

${clearResult.changesSummary.map((c: { component: string; change: string }) => `- **[${c.component}]** ${c.change}`).join('\n')}
`;

      await FileSystem.writeFileAtomic(clearOptimizedPath, clearOptimizedContent);

      console.log(chalk.green('✓ CLEAR-optimized version saved\n'));

    } catch {
      console.log(chalk.yellow('⚠ Could not apply CLEAR optimization\n'));
    }
  }
}
