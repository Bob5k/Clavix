import { Command, Flags, Config } from '@oclif/core';
import chalk from 'chalk';
import inquirer from 'inquirer';
import * as path from 'path';
import { SessionManager } from '../../core/session-manager';

export default class Start extends Command {
  static description = 'Start an interactive conversation session for iterative prompt development';

  static examples = [
    '<%= config.bin %> <%= command.id %>',
    '<%= config.bin %> <%= command.id %> --project my-app',
    '<%= config.bin %> <%= command.id %> --description "Planning new feature"',
  ];

  static flags = {
    project: Flags.string({
      char: 'p',
      description: 'Project name for this session',
    }),
    description: Flags.string({
      char: 'd',
      description: 'Session description',
    }),
    tags: Flags.string({
      char: 't',
      description: 'Comma-separated tags for this session',
      multiple: false,
    }),
  };

  private sessionManager: SessionManager;
  private sessionId: string | null = null;
  private isExiting = false;

  constructor(argv: string[], config: Config) {
    super(argv, config);
    this.sessionManager = new SessionManager();
  }

  async run(): Promise<void> {
    const { flags } = await this.parse(Start);

    try {
      // Initialize new session
      const tags = flags.tags ? flags.tags.split(',').map((t) => t.trim()) : undefined;

      const session = await this.sessionManager.createSession({
        projectName: flags.project,
        description: flags.description,
        tags,
      });

      this.sessionId = session.id;

      // Display introductory prompt
      this.displayIntroduction(session.projectName, session.id);

      // Set up graceful exit handler
      this.setupExitHandler();

      // Enter conversation loop
      await this.conversationLoop();

      // Display session info on exit
      if (!this.isExiting) {
        await this.displayExitInfo();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      this.error(chalk.red(`Error: ${errorMessage}`));
    }
  }

  /**
   * Display introduction and instructions
   */
  private displayIntroduction(projectName: string, sessionId: string): void {
    console.log(chalk.bold.cyan('\n💬 Conversational Session Started\n'));
    console.log(chalk.gray('━'.repeat(60)));
    console.log();
    console.log(chalk.bold('Project:'), chalk.cyan(projectName));
    console.log(chalk.bold('Session ID:'), chalk.dim(sessionId));
    console.log();
    console.log(chalk.gray('━'.repeat(60)));
    console.log();
    console.log(chalk.bold('How it works:'));
    console.log(chalk.gray('  • Share your ideas and requirements naturally'));
    console.log(chalk.gray('  • The conversation is tracked and saved'));
    console.log(chalk.gray('  • Use ') + chalk.cyan('/clavix:summarize') + chalk.gray(' later to extract structured requirements'));
    console.log();
    console.log(chalk.bold('Commands:'));
    console.log(chalk.gray('  • Type ') + chalk.yellow('exit') + chalk.gray(' or ') + chalk.yellow('quit') + chalk.gray(' to end the session'));
    console.log(chalk.gray('  • Press ') + chalk.yellow('Ctrl+C') + chalk.gray(' to exit'));
    console.log();
    console.log(chalk.gray('━'.repeat(60)));
    console.log();
  }

  /**
   * Main conversation loop
   */
  private async conversationLoop(): Promise<void> {
    let messageCount = 0;

    while (!this.isExiting) {
      try {
        // Get user input
        const response = await inquirer.prompt([
          {
            type: 'input',
            name: 'message',
            message: chalk.bold.cyan('You:'),
            prefix: '',
          },
        ]);

        const userMessage = response.message.trim();

        // Check for exit commands
        if (this.isExitCommand(userMessage)) {
          break;
        }

        // Skip empty messages
        if (!userMessage) {
          continue;
        }

        // Log user message to session
        if (this.sessionId) {
          await this.sessionManager.addMessage(
            this.sessionId,
            'user',
            userMessage
          );
          messageCount++;
        }

        // Display acknowledgment
        this.displayAcknowledgment(messageCount);

        console.log(); // Add spacing
      } catch (error) {
        // Handle Ctrl+C or other interrupts
        if ((error as { isTtyError?: boolean; message?: string }).isTtyError || (error as { isTtyError?: boolean; message?: string }).message?.includes('User force closed')) {
          break;
        }
        throw error;
      }
    }
  }

  /**
   * Display acknowledgment after user input
   */
  private displayAcknowledgment(messageCount: number): void {
    const acknowledgments = [
      'Got it! Continue sharing your thoughts.',
      'Thanks! What else should I know?',
      'Understood. Tell me more.',
      'Noted. What\'s next?',
      'Captured. Anything else?',
      'Recorded. Keep going!',
    ];

    const index = (messageCount - 1) % acknowledgments.length;
    const message = acknowledgments[index];

    console.log(chalk.dim('Assistant:'), chalk.gray(message));
  }

  /**
   * Check if message is an exit command
   */
  private isExitCommand(message: string): boolean {
    const exitCommands = ['exit', 'quit', 'bye', 'done'];
    const lower = message.toLowerCase();
    return exitCommands.includes(lower);
  }

  /**
   * Set up handler for Ctrl+C and other exit signals
   */
  private setupExitHandler(): void {
    const handler = async () => {
      if (!this.isExiting) {
        this.isExiting = true;
        console.log(); // New line after ^C
        await this.displayExitInfo();
        process.exit(0);
      }
    };

    process.on('SIGINT', handler);
    process.on('SIGTERM', handler);
  }

  /**
   * Display session information on exit
   */
  private async displayExitInfo(): Promise<void> {
    if (!this.sessionId) {
      return;
    }

    console.log();
    console.log(chalk.gray('━'.repeat(60)));
    console.log();

    const session = await this.sessionManager.getSession(this.sessionId);

    if (session) {
      console.log(chalk.bold.green('Session saved successfully!\n'));
      console.log(chalk.bold('Session Details:'));
      console.log(chalk.gray('  Session ID:'), chalk.cyan(session.id));
      console.log(chalk.gray('  Project:'), chalk.cyan(session.projectName));
      console.log(chalk.gray('  Messages:'), chalk.cyan(session.messages.length.toString()));
      console.log(chalk.gray('  Created:'), chalk.dim(session.created.toLocaleString()));

      if (session.tags && session.tags.length > 0) {
        console.log(chalk.gray('  Tags:'), chalk.cyan(session.tags.join(', ')));
      }

      if (session.description) {
        console.log(chalk.gray('  Description:'), chalk.dim(session.description));
      }

      const sessionPath = path.join('.clavix/sessions', `${session.id}.json`);
      console.log();
      console.log(chalk.bold('Session file:'));
      console.log(chalk.dim(`  ${sessionPath}`));
      console.log();
      console.log(chalk.bold('Next steps:'));
      console.log(chalk.gray('  • Resume: ') + chalk.cyan(`clavix start --resume ${session.id}`));
      console.log(chalk.gray('  • Summarize: ') + chalk.cyan(`clavix summarize ${session.id}`));
      console.log(chalk.gray('  • View: ') + chalk.cyan(`clavix show ${session.id}`));
      console.log();
    } else {
      console.log(chalk.yellow('Warning: Could not retrieve session information\n'));
    }

    console.log(chalk.gray('━'.repeat(60)));
    console.log();
  }
}
