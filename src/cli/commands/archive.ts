import { Command, Flags, Args } from '@oclif/core';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { ArchiveManager, PrdProject } from '../../core/archive-manager.js';

export default class Archive extends Command {
  static description = 'Archive completed PRD projects';

  static examples = [
    '<%= config.bin %> <%= command.id %> # Interactive selection',
    '<%= config.bin %> <%= command.id %> my-project # Archive specific project',
    '<%= config.bin %> <%= command.id %> --list # List archived projects',
    '<%= config.bin %> <%= command.id %> my-project --force # Force archive',
    '<%= config.bin %> <%= command.id %> --restore my-project # Restore from archive',
  ];

  static args = {
    project: Args.string({
      description: 'Name of the project to archive',
      required: false,
    }),
  };

  static flags = {
    list: Flags.boolean({
      char: 'l',
      description: 'List archived projects',
      default: false,
    }),
    force: Flags.boolean({
      char: 'f',
      description: 'Force archive even if tasks are incomplete',
      default: false,
    }),
    yes: Flags.boolean({
      char: 'y',
      description: 'Skip all confirmation prompts (agent-friendly)',
      default: false,
    }),
    restore: Flags.string({
      char: 'r',
      description: 'Restore an archived project',
    }),
  };

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Archive);
    const archiveManager = new ArchiveManager();

    try {
      // Handle restore flag
      if (flags.restore) {
        await this.restoreProject(flags.restore, archiveManager, flags.yes);
        return;
      }

      // Handle list flag
      if (flags.list) {
        await this.listArchivedProjects(archiveManager);
        return;
      }

      // Handle direct project archival
      if (args.project) {
        await this.archiveSpecificProject(args.project, flags.force, flags.yes, archiveManager);
        return;
      }

      // Interactive mode
      await this.interactiveArchive(archiveManager, flags.yes);
    } catch (error: unknown) {
      const { getErrorMessage } = await import('../../utils/error-utils.js');
      this.error(chalk.red(`Archive failed: ${getErrorMessage(error)}`));
    }
  }

  /**
   * Interactive archive mode - show list of archivable projects
   */
  private async interactiveArchive(archiveManager: ArchiveManager, yes: boolean): Promise<void> {
    this.log(chalk.bold.cyan('\n📦 Archive PRD Projects\n'));

    // Get all archivable projects (100% tasks completed)
    const archivableProjects = await archiveManager.getArchivablePrds();

    if (archivableProjects.length === 0) {
      this.log(chalk.gray('No projects ready to archive.'));
      this.log(chalk.gray('\nProjects can be archived when all tasks are completed.'));
      this.log(chalk.gray('Use ') + chalk.cyan('clavix list --outputs') + chalk.gray(' to see all projects.'));
      return;
    }

    // Show archivable projects
    this.log(chalk.green(`Found ${archivableProjects.length} project(s) ready to archive:\n`));

    // Inquirer choices can be mixed types (choices + separators)
    const choices: unknown[] = archivableProjects.map((project) => ({
      name: `${project.name} (${project.taskStatus.completed} tasks completed)`,
      value: project.name,
      short: project.name,
    }));

    choices.push(new inquirer.Separator());
    choices.push({
      name: chalk.gray('Cancel'),
      value: '__cancel__',
      short: 'Cancel',
    });

    const { selectedProject } = await inquirer.prompt([
      {
        type: 'list',
        name: 'selectedProject',
        message: 'Which project would you like to archive?',
        choices,
        pageSize: 15,
      },
    ]);

    if (selectedProject === '__cancel__') {
      this.log(chalk.yellow('\n✗ Archive cancelled\n'));
      return;
    }

    // Confirm archival (unless --yes)
    if (!yes) {
      const { confirm } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirm',
          message: `Archive "${selectedProject}"? (This will move it to .clavix/outputs/archive/)`,
          default: false,
        },
      ]);

      if (!confirm) {
        this.log(chalk.yellow('\n✗ Archive cancelled\n'));
        return;
      }
    }

    // Archive the project
    const result = await archiveManager.archiveProject(selectedProject);

    if (result.success) {
      this.log(chalk.green(`\n✓ ${result.message}\n`));
    } else {
      this.error(chalk.red(`\n✗ ${result.message}\n`));
    }
  }

  /**
   * Archive a specific project by name
   */
  private async archiveSpecificProject(
    projectName: string,
    force: boolean,
    yes: boolean,
    archiveManager: ArchiveManager
  ): Promise<void> {
    this.log(chalk.cyan(`\nArchiving project: ${chalk.bold(projectName)}\n`));

    // Check task status
    const projectPath = `.clavix/outputs/${projectName}`;
    const taskStatus = await archiveManager.checkTasksStatus(projectPath);

    // If not forcing and tasks are incomplete, ask for confirmation (unless --yes)
    if (!force && !taskStatus.allCompleted) {
      if (!taskStatus.hasTasksFile) {
        this.log(chalk.yellow(`⚠ Project has no tasks.md file\n`));

        if (!yes) {
          const { proceed } = await inquirer.prompt([
            {
              type: 'confirm',
              name: 'proceed',
              message: 'Archive anyway?',
              default: false,
            },
          ]);

          if (!proceed) {
            this.log(chalk.yellow('\n✗ Archive cancelled\n'));
            return;
          }
        }
      } else if (taskStatus.remaining > 0) {
        this.log(chalk.yellow(`⚠ Project has ${taskStatus.remaining} incomplete task(s):\n`));

        // Show incomplete tasks
        const incompleteTasks = await archiveManager.getIncompleteTasks(projectPath);
        incompleteTasks.slice(0, 5).forEach((task) => {
          this.log(chalk.gray(`  • ${task}`));
        });

        if (incompleteTasks.length > 5) {
          this.log(chalk.gray(`  ... and ${incompleteTasks.length - 5} more\n`));
        } else {
          this.log('');
        }

        if (!yes) {
          const { proceed } = await inquirer.prompt([
            {
              type: 'confirm',
              name: 'proceed',
              message: 'Archive anyway?',
              default: false,
            },
          ]);

          if (!proceed) {
            this.log(chalk.yellow('\n✗ Archive cancelled\n'));
            return;
          }
        }
      }
    }

    // Archive the project
    const result = await archiveManager.archiveProject(projectName, true);

    if (result.success) {
      this.log(chalk.green(`✓ ${result.message}\n`));
    } else {
      this.error(chalk.red(`✗ ${result.message}\n`));
    }
  }

  /**
   * List all archived projects
   */
  private async listArchivedProjects(archiveManager: ArchiveManager): Promise<void> {
    this.log(chalk.bold.cyan('\n📦 Archived Projects\n'));

    const archivedProjects = await archiveManager.listArchivedProjects();

    if (archivedProjects.length === 0) {
      this.log(chalk.gray('No archived projects found.'));
      this.log(chalk.gray('\nUse ') + chalk.cyan('clavix archive') + chalk.gray(' to archive completed projects.\n'));
      return;
    }

    // Display archived projects
    archivedProjects.forEach((project, index) => {
      const statusIcon = project.taskStatus.allCompleted ? '✓' : '○';
      const taskInfo = project.taskStatus.hasTasksFile
        ? `${project.taskStatus.completed}/${project.taskStatus.total} tasks`
        : 'no tasks';

      const modified = project.modifiedTime.toLocaleDateString();

      this.log(
        `  ${statusIcon} ${chalk.bold(project.name)}` +
        `\n     ${chalk.gray('Tasks:')} ${taskInfo} ${chalk.gray('│')} ` +
        `${chalk.gray('Archived:')} ${modified}` +
        `\n     ${chalk.gray('Path:')} ${chalk.dim(project.path)}` +
        (index < archivedProjects.length - 1 ? '\n' : '')
      );
    });

    this.log('');
    this.log(chalk.gray(`  Total: ${archivedProjects.length} archived project(s)`));
    this.log(chalk.gray(`  Use ${chalk.cyan('clavix archive --restore <project>')} to restore a project\n`));
  }

  /**
   * Restore an archived project
   */
  private async restoreProject(
    projectName: string,
    archiveManager: ArchiveManager,
    yes: boolean
  ): Promise<void> {
    this.log(chalk.cyan(`\nRestoring project: ${chalk.bold(projectName)}\n`));

    // Confirm restoration (unless --yes)
    if (!yes) {
      const { confirm } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirm',
          message: `Restore "${projectName}" from archive?`,
          default: false,
        },
      ]);

      if (!confirm) {
        this.log(chalk.yellow('\n✗ Restore cancelled\n'));
        return;
      }
    }

    const result = await archiveManager.restoreProject(projectName);

    if (result.success) {
      this.log(chalk.green(`✓ ${result.message}\n`));
    } else {
      this.error(chalk.red(`✗ ${result.message}\n`));
    }
  }

  /**
   * Display project details (helper for formatting)
   */
  private displayProjectInfo(project: PrdProject): void {
    const statusIcon = project.taskStatus.allCompleted ? '✓' : '○';
    const taskInfo = project.taskStatus.hasTasksFile
      ? `${project.taskStatus.completed}/${project.taskStatus.total} tasks (${Math.round(project.taskStatus.percentage)}%)`
      : 'no tasks';

    this.log(
      `  ${statusIcon} ${chalk.bold(project.name)}` +
      `\n     ${chalk.gray('Tasks:')} ${taskInfo}` +
      `\n     ${chalk.gray('Modified:')} ${project.modifiedTime.toLocaleDateString()}`
    );
  }
}
