import { Command, Flags } from '@oclif/core';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { TaskManager } from '../../core/task-manager.js';
import { GitManager, CommitStrategy } from '../../core/git-manager.js';
import { AgentErrorMessages } from '../../utils/agent-error-messages.js';
import * as path from 'path';
import fs from 'fs-extra';

export default class Implement extends Command {
  static description = 'Start implementing tasks from the task plan';

  static examples = [
    '<%= config.bin %> <%= command.id %>',
    '<%= config.bin %> <%= command.id %> --project my-app',
    '<%= config.bin %> <%= command.id %> --no-git',
  ];

  static flags = {
    project: Flags.string({
      char: 'p',
      description: 'PRD project name (defaults to most recent)',
    }),
    'tasks-path': Flags.string({
      description: 'Direct path to tasks.md file',
    }),
    'no-git': Flags.boolean({
      description: 'Skip git auto-commit setup',
      default: false,
    }),
    'commit-strategy': Flags.string({
      description: 'Auto-commit strategy: per-task, per-5-tasks, per-phase, none (default: none)',
      options: ['per-task', 'per-5-tasks', 'per-phase', 'none'],
    }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(Implement);

    console.log(chalk.bold.cyan('\nTask Implementation\n'));

    try {
      const manager = new TaskManager();
      const gitManager = new GitManager();

      // Interactive PRD selection (if no project specified)
      if (!flags['tasks-path'] && !flags.project) {
        const selectedProject = await this.selectPrdProject(manager);
        if (selectedProject) {
          flags.project = selectedProject;
        }
      }

      // Find tasks.md file
      let tasksPath: string;

      if (flags['tasks-path']) {
        tasksPath = flags['tasks-path'];
      } else {
        console.log(chalk.dim('Looking for task plan...'));
        const prdPath = await manager.findPrdDirectory(flags.project);
        tasksPath = path.join(prdPath, 'tasks.md');

        if (!(await fs.pathExists(tasksPath))) {
          const projectName = flags.project || path.basename(path.dirname(tasksPath));
          this.error(AgentErrorMessages.noTasksFound(projectName));
        }

        console.log(chalk.dim(`Found: ${tasksPath}\n`));
      }

      // Read tasks
      const phases = await manager.readTasksFile(tasksPath);
      const stats = manager.getTaskStats(phases);

      // Display progress
      console.log(chalk.bold('Progress:'));
      console.log(chalk.cyan(`  Completed: ${stats.completed}/${stats.total} tasks (${stats.percentage.toFixed(0)}%)`));
      console.log(chalk.cyan(`  Remaining: ${stats.remaining} tasks`));
      console.log();

      // Check if all tasks are done
      if (stats.remaining === 0) {
        console.log(chalk.bold.green('All tasks completed!\n'));
        console.log(chalk.gray('Great work! All implementation tasks are done.\n'));
        return;
      }

      // Find next task
      const nextTask = manager.findFirstIncompleteTask(phases);

      if (!nextTask) {
        console.log(chalk.yellow('Warning: No incomplete tasks found\n'));
        return;
      }

      // Display next task
      console.log(chalk.bold('Next Task:'));
      console.log(chalk.bold.white(`  ${nextTask.description}`));
      if (nextTask.prdReference) {
        console.log(chalk.dim(`  Reference: ${nextTask.prdReference}`));
      }
      console.log(chalk.dim(`  Phase: ${nextTask.phase}`));
      console.log();

      // Git auto-commit setup (if not skipped)
      let commitStrategy: CommitStrategy = 'none';

      if (!flags['no-git']) {
        const gitStatus = await gitManager.validateGitSetup();

        if (gitStatus.isRepo) {
          console.log(chalk.dim(`Git repository detected (branch: ${gitStatus.currentBranch})`));
          console.log();

          // Use commit strategy from flag, or default to 'none' (agent-friendly)
          if (flags['commit-strategy']) {
            commitStrategy = flags['commit-strategy'] as CommitStrategy;
          } else {
            commitStrategy = 'none';
            console.log(chalk.dim('ℹ  No git strategy specified. Use --commit-strategy flag to enable auto-commits.'));
          }

          if (commitStrategy !== 'none') {
            console.log(chalk.green(`✓ Auto-commit enabled: ${commitStrategy}\n`));
          } else {
            console.log(chalk.dim('  Auto-commits disabled (manual git workflow)\n'));
          }
        } else {
          console.log(chalk.yellow('⚠ Warning: Not a git repository - auto-commits disabled\n'));
        }
      }

      // Display implementation instructions
      console.log(chalk.bold.cyan('Implementation Instructions:\n'));

      console.log(chalk.gray('The AI agent will now:'));
      console.log(chalk.gray(`  1. Implement: ${nextTask.description}`));
      console.log(chalk.gray('  2. Mark the task as completed in tasks.md'));
      if (commitStrategy !== 'none') {
        console.log(chalk.gray(`  3. Create git commits (strategy: ${commitStrategy})`));
      }
      console.log(chalk.gray('  4. Proceed to the next task'));
      console.log();

      // Save commit strategy to a config file for the AI agent to read
      const configPath = path.join(path.dirname(tasksPath), '.clavix-implement-config.json');
      await fs.writeJson(configPath, {
        commitStrategy,
        tasksPath,
        currentTask: nextTask,
        stats,
        timestamp: new Date().toISOString(),
      }, { spaces: 2 });

      console.log(chalk.bold.green('Ready to implement!\n'));

      console.log(chalk.dim('Configuration saved to:'));
      console.log(chalk.dim(`  ${configPath}\n`));

      console.log(chalk.yellow('Important Notes for AI Agent:\n'));
      console.log(chalk.gray('  • Follow the tasks in order from tasks.md'));
      console.log(chalk.gray('  • Mark each completed task: change [ ] to [x]'));
      console.log(chalk.gray(`  • Current task: ${nextTask.description}`));
      if (commitStrategy !== 'none') {
        console.log(chalk.gray(`  • Create git commits per strategy: ${commitStrategy}`));
      }
      console.log(chalk.gray('  • Use PRD as reference for implementation details'));
      console.log();

      console.log(chalk.dim('Tip: The AI agent can run "clavix implement" again to resume progress\n'));

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      this.error(errorMessage);
    }
  }

  /**
   * Scans for PRD projects and shows interactive selection menu
   * @param manager TaskManager instance
   * @returns Selected project name or null
   */
  private async selectPrdProject(manager: TaskManager): Promise<string | null> {
    const outputsDir = path.join(process.cwd(), '.clavix', 'outputs');

    if (!(await fs.pathExists(outputsDir))) {
      return null; // No PRDs exist
    }

    // Scan for PRD projects (exclude 'archive' directory)
    const entries = await fs.readdir(outputsDir, { withFileTypes: true });
    const prdProjects: Array<{ name: string; hasTasks: boolean; stats?: { total: number; completed: number; remaining: number; percentage: number } }> = [];

    for (const entry of entries) {
      if (!entry.isDirectory() || entry.name === 'archive') {
        continue;
      }

      const projectPath = path.join(outputsDir, entry.name);
      const tasksPath = path.join(projectPath, 'tasks.md');

      // Check if this directory has a PRD file
      const hasPrd = await manager.hasPrdFile(projectPath);
      if (!hasPrd) {
        continue; // Not a PRD project
      }

      // Check if tasks.md exists
      const hasTasks = await fs.pathExists(tasksPath);

      let stats: { total: number; completed: number; remaining: number; percentage: number } | undefined;
      if (hasTasks) {
        try {
          const phases = await manager.readTasksFile(tasksPath);
          stats = manager.getTaskStats(phases);
        } catch {
          // Ignore read errors, treat as no stats
        }
      }

      prdProjects.push({
        name: entry.name,
        hasTasks,
        stats,
      });
    }

    // No PRD projects found
    if (prdProjects.length === 0) {
      this.error(AgentErrorMessages.noPrdFound());
    }

    // Only one PRD - auto-select
    if (prdProjects.length === 1) {
      const project = prdProjects[0];
      console.log(chalk.dim(`Auto-selected project: ${project.name}\n`));

      // Check if it has tasks
      if (!project.hasTasks) {
        await this.handleNoTasks(project.name);
        return null;
      }

      return project.name;
    }

    // Multiple PRDs - show selection menu
    console.log(chalk.bold('Select a PRD project to implement:\n'));

    const choices = prdProjects.map((project, index) => {
      let label = `${index + 1}. ${project.name}`;

      if (project.hasTasks && project.stats) {
        const percentage = project.stats.percentage.toFixed(0);
        label += chalk.dim(` - ${project.stats.completed}/${project.stats.total} tasks (${percentage}%)`);
      } else {
        label += chalk.dim(' - No tasks generated');
      }

      return {
        name: label,
        value: project.name,
        hasTasks: project.hasTasks,
      };
    });

    const response = await inquirer.prompt([
      {
        type: 'list',
        name: 'project',
        message: 'Select project:',
        choices: choices.map(c => ({ name: c.name, value: c.value })),
      },
    ]);

    const selectedProject = response.project as string;
    const selected = choices.find(c => c.value === selectedProject);

    // Handle "no tasks" scenario
    if (selected && !selected.hasTasks) {
      await this.handleNoTasks(selectedProject);
      return null;
    }

    console.log(); // Add spacing
    return selectedProject;
  }

  /**
   * Handles the scenario when selected PRD has no tasks
   * @param projectName Name of the PRD project
   */
  private async handleNoTasks(projectName: string): Promise<void> {
    console.log(chalk.yellow(`\nWarning: Project "${projectName}" has no tasks generated yet.\n`));

    const response = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'runPlan',
        message: 'Would you like to run "clavix plan" to generate tasks first?',
        default: true,
      },
    ]);

    if (response.runPlan) {
      console.log(chalk.cyan(`\nRunning: clavix plan --project ${projectName}\n`));

      // Execute clavix plan command
      const { exec } = await import('child_process');
      const { promisify } = await import('util');
      const execAsync = promisify(exec);

      try {
        const { stdout, stderr } = await execAsync(`clavix plan --project ${projectName}`, {
          cwd: process.cwd(),
        });

        if (stdout) {
          console.log(stdout);
        }
        if (stderr) {
          console.error(chalk.yellow(stderr));
        }

        // After plan completes, continue with implementation
        console.log(chalk.green('\nTasks generated! Continuing with implementation...\n'));
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        this.error(`Running clavix plan failed: ${errorMessage}`);
      }
    } else {
      console.log(chalk.dim('\nExiting. Run "clavix plan" when ready to generate tasks.\n'));
      this.exit(0);
    }
  }
}
