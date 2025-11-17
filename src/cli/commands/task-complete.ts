import { Command, Flags, Args } from '@oclif/core';
import chalk from 'chalk';
import { TaskManager, Task } from '../../core/task-manager';
import { ConfigManager } from '../../core/config-manager';
import { GitManager, CommitStrategy } from '../../core/git-manager';
import * as path from 'path';
import * as fs from 'fs-extra';

export default class TaskComplete extends Command {
  static description = 'Mark a task as completed with validation and optional git commit';

  static examples = [
    '<%= config.bin %> <%= command.id %> phase-1-auth-1',
    '<%= config.bin %> <%= command.id %> phase-2-api-3 --no-git',
    '<%= config.bin %> <%= command.id %> setup-1 --force',
  ];

  static args = {
    taskId: Args.string({
      description: 'Task ID to mark as completed',
      required: true,
    }),
  };

  static flags = {
    'no-git': Flags.boolean({
      description: 'Skip git commit even if strategy is enabled',
      default: false,
    }),
    force: Flags.boolean({
      char: 'f',
      description: 'Force completion even if already marked complete',
      default: false,
    }),
    config: Flags.string({
      char: 'c',
      description: 'Path to config file (defaults to auto-discover)',
    }),
  };

  async run(): Promise<void> {
    const { args, flags } = await this.parse(TaskComplete);
    const taskId = args.taskId!;

    console.log(chalk.bold.cyan(`\nTask Completion: ${taskId}\n`));

    try {
      const taskManager = new TaskManager();
      const configManager = new ConfigManager();
      const gitManager = new GitManager();

      // Find config file
      const configPath = await this.findConfigFile(flags.config);
      console.log(chalk.dim(`Config: ${configPath}\n`));

      // Read config
      const config = await configManager.read(configPath);
      const tasksPath = config.tasksPath;

      // Read tasks
      const phases = await taskManager.readTasksFile(tasksPath);

      // Validate task exists
      const task = taskManager.validateTaskExists(phases, taskId);

      if (!task) {
        // Smart recovery: List available tasks
        console.log(chalk.red(`✗ Task ID "${taskId}" not found\n`));
        console.log(chalk.yellow('Available task IDs:\n'));

        phases.forEach(phase => {
          console.log(chalk.bold(`  ${phase.name}:`));
          phase.tasks.forEach(t => {
            const status = t.completed ? chalk.green('[x]') : chalk.gray('[ ]');
            console.log(`    ${status} ${chalk.cyan(t.id)} - ${t.description}`);
          });
          console.log();
        });

        this.error('Task not found. Please use one of the task IDs listed above.');
      }

      // Check if already completed
      if (task.completed && !flags.force) {
        console.log(chalk.yellow(`⚠ Task "${taskId}" is already marked as completed\n`));

        // Check if it's in config too
        const isInConfig = await configManager.isTaskCompleted(configPath, taskId);
        if (isInConfig) {
          console.log(chalk.dim('Task is tracked in config as completed.\n'));
        }

        console.log(chalk.gray('Use --force to re-mark this task as completed.\n'));

        // Show next task
        await this.showNextTask(taskManager, phases);
        return;
      }

      // Mark task as completed with validation
      console.log(chalk.dim('Marking task as completed...'));
      const result = await taskManager.markTaskCompletedWithValidation(tasksPath, taskId);

      if (!result.success) {
        // Smart recovery: Show error and suggestions
        console.log(chalk.red(`\n✗ Failed to mark task as completed\n`));
        console.log(chalk.yellow(`Error: ${result.error}\n`));

        if (result.warnings && result.warnings.length > 0) {
          console.log(chalk.yellow('Warnings:'));
          result.warnings.forEach(warning => console.log(chalk.yellow(`  • ${warning}`)));
          console.log();
        }

        // Provide recovery suggestions
        console.log(chalk.bold('Recovery Options:\n'));
        console.log(chalk.gray('  1. Check if tasks.md file is readable and writable'));
        console.log(chalk.gray('  2. Verify task ID matches exactly (run "clavix implement" to see current task)'));
        console.log(chalk.gray('  3. Try running with --force flag if task is already completed'));
        console.log(chalk.gray('  4. Check tasks.md.backup file if one was created\n'));

        this.error('Task completion failed');
      }

      // Display warnings if any
      if (result.warnings && result.warnings.length > 0) {
        console.log(chalk.yellow('\nWarnings:'));
        result.warnings.forEach(warning => console.log(chalk.yellow(`  • ${warning}`)));
        console.log();
      }

      // Success!
      if (result.alreadyCompleted) {
        console.log(chalk.green(`✓ Task was already completed (tracking updated)\n`));
      } else {
        console.log(chalk.green(`✓ Task marked as completed\n`));
      }

      // Track completion in config
      console.log(chalk.dim('Updating configuration...'));
      await configManager.trackCompletion(configPath, taskId);

      // Update stats
      const updatedStats = taskManager.getTaskStats(phases);
      await configManager.update(configPath, { stats: updatedStats });

      console.log(chalk.green('✓ Configuration updated\n'));

      // Show progress
      console.log(chalk.bold('Progress:'));
      console.log(chalk.cyan(`  Completed: ${updatedStats.completed}/${updatedStats.total} tasks (${updatedStats.percentage.toFixed(0)}%)`));
      console.log(chalk.cyan(`  Remaining: ${updatedStats.remaining} tasks\n`));

      // Create git commit if enabled
      if (!flags['no-git'] && config.commitStrategy !== 'none') {
        await this.handleGitCommit(
          gitManager,
          configManager,
          configPath,
          config.commitStrategy,
          task,
          phases
        );
      }

      // Show next task
      await this.showNextTask(taskManager, phases);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      console.log(chalk.red(`\n✗ Error: ${errorMessage}\n`));
      this.error(errorMessage);
    }
  }

  /**
   * Find config file (auto-discover or use provided path)
   */
  private async findConfigFile(providedPath?: string): Promise<string> {
    if (providedPath) {
      if (await fs.pathExists(providedPath)) {
        return providedPath;
      }
      throw new Error(`Config file not found: ${providedPath}`);
    }

    // Auto-discover: Look for .clavix/outputs/*/.clavix-implement-config.json
    const outputsDir = path.join(process.cwd(), '.clavix', 'outputs');

    if (!(await fs.pathExists(outputsDir))) {
      throw new Error('No .clavix/outputs directory found.\n\nHint: Run "clavix implement" first to initialize');
    }

    // Search for config files
    const entries = await fs.readdir(outputsDir, { withFileTypes: true });
    const configFiles: string[] = [];

    for (const entry of entries) {
      if (!entry.isDirectory() || entry.name === 'archive') {
        continue;
      }

      const configPath = path.join(outputsDir, entry.name, '.clavix-implement-config.json');
      if (await fs.pathExists(configPath)) {
        configFiles.push(configPath);
      }
    }

    if (configFiles.length === 0) {
      throw new Error('No config files found.\n\nHint: Run "clavix implement" first to initialize');
    }

    // Use most recent config
    const configsWithStats = await Promise.all(
      configFiles.map(async (filePath) => {
        const stat = await fs.stat(filePath);
        return { path: filePath, mtime: stat.mtime };
      })
    );

    configsWithStats.sort((a, b) => b.mtime.getTime() - a.mtime.getTime());
    return configsWithStats[0].path;
  }

  /**
   * Handle git commit based on strategy
   */
  private async handleGitCommit(
    gitManager: GitManager,
    configManager: ConfigManager,
    configPath: string,
    strategy: CommitStrategy,
    completedTask: Task,
    phases: any[]
  ): Promise<void> {
    console.log(chalk.dim(`Checking git commit strategy (${strategy})...`));

    const config = await configManager.read(configPath);
    const completedCount = config.completedTaskIds?.length ?? 0;

    let shouldCommit = false;
    let commitMessage = '';

    switch (strategy) {
      case 'per-task':
        shouldCommit = true;
        commitMessage = `clavix: ${completedTask.description}`;
        break;

      case 'per-5-tasks':
        shouldCommit = completedCount % 5 === 0;
        if (shouldCommit) {
          const last5 = config.completedTaskIds?.slice(-5) ?? [];
          const taskDescriptions = phases
            .flatMap(p => p.tasks)
            .filter((t: Task) => last5.includes(t.id))
            .map((t: Task) => t.description);
          commitMessage = `clavix: Completed ${last5.length} tasks\n\nCompleted tasks:\n${taskDescriptions.map(d => `- ${d}`).join('\n')}`;
        }
        break;

      case 'per-phase':
        // Check if current phase is complete
        const currentPhase = phases.find(p => p.name === completedTask.phase);
        if (currentPhase) {
          const phaseComplete = currentPhase.tasks.every((t: Task) => t.completed);
          shouldCommit = phaseComplete;
          if (shouldCommit) {
            commitMessage = `clavix: Completed ${currentPhase.name}\n\nCompleted tasks:\n${currentPhase.tasks.map((t: Task) => `- ${t.description}`).join('\n')}`;
          }
        }
        break;

      case 'none':
      default:
        shouldCommit = false;
        break;
    }

    if (!shouldCommit) {
      console.log(chalk.dim('No commit needed (strategy criteria not met)\n'));
      return;
    }

    // Check git status
    const gitStatus = await gitManager.validateGitSetup();

    if (!gitStatus.isRepo) {
      console.log(chalk.yellow('⚠ Not a git repository - skipping commit\n'));
      return;
    }

    if (!gitStatus.hasChanges) {
      console.log(chalk.dim('No git changes to commit\n'));
      return;
    }

    // Create commit
    console.log(chalk.dim('Creating git commit...'));

    const fullMessage = `${commitMessage}\n\nGenerated by Clavix task-complete`;
    const success = await gitManager.createCommit({
      message: fullMessage,
      description: completedTask.description,
      projectName: path.basename(path.dirname(configPath)),
    });

    if (success) {
      console.log(chalk.green('✓ Git commit created\n'));
    } else {
      console.log(chalk.yellow('⚠ Git commit failed (non-critical)\n'));
    }
  }

  /**
   * Show next incomplete task
   */
  private async showNextTask(taskManager: TaskManager, phases: any[]): Promise<void> {
    const nextTask = taskManager.findFirstIncompleteTask(phases);

    if (!nextTask) {
      console.log(chalk.bold.green('🎉 All tasks completed!\n'));
      console.log(chalk.gray('Great work! All implementation tasks are done.\n'));
      console.log(chalk.dim('Hint: Run "clavix archive" to archive this project\n'));
      return;
    }

    console.log(chalk.bold('Next Task:'));
    console.log(chalk.bold.white(`  ID: ${chalk.cyan(nextTask.id)}`));
    console.log(chalk.bold.white(`  ${nextTask.description}`));
    if (nextTask.prdReference) {
      console.log(chalk.dim(`  Reference: ${nextTask.prdReference}`));
    }
    console.log(chalk.dim(`  Phase: ${nextTask.phase}\n`));
  }
}
