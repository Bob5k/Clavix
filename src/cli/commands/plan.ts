import { Command, Flags } from '@oclif/core';
import chalk from 'chalk';
import inquirer from 'inquirer';
import * as fs from 'fs-extra';
import * as path from 'path';
import { TaskManager, PrdSourceType } from '../../core/task-manager';
import { SessionManager } from '../../core/session-manager';
import { ConversationAnalyzer } from '../../core/conversation-analyzer';
import { FileSystem } from '../../utils/file-system';

export default class Plan extends Command {
  static description = 'Generate implementation task breakdown from PRD';

  static examples = [
    '<%= config.bin %> <%= command.id %>',
    '<%= config.bin %> <%= command.id %> --project my-app',
    '<%= config.bin %> <%= command.id %> --prd-path .clavix/outputs/my-project',
    '<%= config.bin %> <%= command.id %> --session 1234-5678',
  ];

  static flags = {
    project: Flags.string({
      char: 'p',
      description: 'PRD project name (defaults to most recent)',
    }),
    'prd-path': Flags.string({
      description: 'Direct path to PRD directory',
    }),
    session: Flags.string({
      description: 'Session ID to plan from (generates mini-prd.md automatically)',
    }),
    'active-session': Flags.boolean({
      description: 'Use the most recent active session as input',
      default: false,
    }),
    source: Flags.string({
      description: 'Preferred PRD source (auto|full|quick|mini|prompt)',
      options: ['auto', 'full', 'quick', 'mini', 'prompt'],
      default: 'auto',
    }),
    'max-tasks': Flags.integer({
      description: 'Maximum tasks per phase',
      default: 20,
    }),
    overwrite: Flags.boolean({
      char: 'o',
      description: 'Overwrite existing tasks.md file',
      default: false,
    }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(Plan);

    console.log(chalk.bold.cyan('\nTask Plan Generator\n'));
    console.log(chalk.gray('Analyzing PRD and generating implementation tasks...\n'));

    try {
      this.validateSessionFlags(flags.session, flags['active-session']);

      const manager = new TaskManager();
      const sourcePreference = (flags.source ?? 'auto') as PrdSourceType;

      let projectName: string | null = null;
      let prdPath: string | null = flags['prd-path'] ? path.resolve(flags['prd-path']) : null;
      let generatedFromSession = false;
      const generatedArtifacts: string[] = [];

      if (flags.session || flags['active-session']) {
        const sessionResult = await this.prepareArtifactsFromSession(
          flags.session,
          flags['active-session']
        );

        prdPath = sessionResult.prdPath;
        projectName = sessionResult.projectName;
        generatedFromSession = true;
        generatedArtifacts.push(...sessionResult.generatedArtifacts);
      }

      let selectedProject:
        | { path: string; name: string; sources: Array<Exclude<PrdSourceType, 'auto'>>; hasTasks: boolean }
        | null = null;

      if (!prdPath) {
        selectedProject = await this.resolveProjectDirectory(manager, flags.project);

        if (!selectedProject) {
          this.error(
            chalk.red('No PRD projects found in .clavix/outputs/') +
            '\n\n' +
            chalk.gray(
              "Hint: Run 'clavix prd' to generate a PRD, 'clavix summarize' to create a mini-PRD, or use 'clavix plan --session <id>'"
            )
          );
        }

        prdPath = selectedProject.path;
        projectName = selectedProject.name;
      }

      if (!prdPath) {
        throw new Error('Unable to resolve PRD directory.');
      }

      const resolvedProjectName = projectName ?? path.basename(prdPath);

      // Check if tasks.md already exists
      const tasksPath = path.join(prdPath, 'tasks.md');

      if (await fs.pathExists(tasksPath) && !flags.overwrite) {
        console.log(chalk.yellow('Warning: tasks.md already exists.'));
        console.log(chalk.gray(`Location: ${tasksPath}`));
        console.log(chalk.gray('Use --overwrite to regenerate tasks.md.\n'));
        return;
      }

      console.log(chalk.dim('Looking for PRD artifacts...'));
      const availableSources = await manager.detectAvailableSources(prdPath);

      if (availableSources.length === 0) {
        this.error(
          chalk.red('No PRD artifacts found in this directory') +
          '\n\n' +
          chalk.gray(
            'Hint: Generate a PRD with clavix prd, run clavix summarize, or supply a session via --session'
          )
        );
      }

      if (sourcePreference !== 'auto' && !availableSources.includes(sourcePreference)) {
        this.error(
          chalk.red(`Preferred source "${sourcePreference}" not found in ${prdPath}`) +
          '\n\n' +
          chalk.gray(
            `Hint: Available sources: ${availableSources.join(', ') || 'none'}. Override with --source`
          )
        );
      }

      if (availableSources.length > 1 && sourcePreference === 'auto') {
        console.log(
          chalk.dim(
            `Found multiple sources (${availableSources.join(', ')}). Selecting best match...`
          )
        );
      }

      // Generate tasks
      console.log(chalk.dim('Analyzing PRD content...'));
      const result = await manager.generateTasksFromPrd(prdPath, {
        maxTasksPerPhase: flags['max-tasks'],
        includeReferences: true,
        clearMode: 'fast',
        source: sourcePreference,
      });

      const chosenSourceFile = path.basename(result.sourcePath);
      const usingOverride = sourcePreference !== 'auto';

      if (usingOverride) {
        console.log(chalk.dim(`Using source: ${chosenSourceFile}`));
      } else {
        console.log(
          chalk.dim(
            `Using source: ${chosenSourceFile} (override with --source to pick a different artifact).`
          )
        );
      }

      // Display results
      console.log(chalk.bold.green('\nTask plan generated successfully!\n'));

      if (generatedFromSession) {
        console.log(chalk.bold('Generated artifacts:'));
        generatedArtifacts.forEach((artifact) => {
          console.log(chalk.gray(`  • ${artifact}`));
        });
        console.log();
      }

      console.log(chalk.bold('Summary:'));
      console.log(chalk.cyan(`  Project: ${resolvedProjectName}`));
      console.log(chalk.cyan(`  Source: ${chosenSourceFile}`));
      console.log(chalk.cyan(`  Total Phases: ${result.phases.length}`));
      console.log(chalk.cyan(`  Total Tasks: ${result.totalTasks}`));
      console.log();

      console.log(chalk.bold('Task Breakdown:\n'));
      for (const phase of result.phases) {
        console.log(chalk.bold(`  ${phase.name}`));
        console.log(chalk.gray(`    ${phase.tasks.length} tasks`));

        const preview = phase.tasks.slice(0, 3);
        preview.forEach((task) => {
          console.log(chalk.dim(`    • ${task.description}`));
        });

        if (phase.tasks.length > 3) {
          console.log(chalk.dim(`    ... and ${phase.tasks.length - 3} more`));
        }

        console.log();
      }

      console.log(chalk.bold('Output:'));
      console.log(chalk.cyan(`  ${result.outputPath}`));
      console.log();

      console.log(chalk.bold.green('Next Steps:\n'));
      console.log(chalk.gray('  1. Review the generated tasks in tasks.md'));
      console.log(chalk.gray('  2. Edit if needed (add/remove/modify tasks)'));
      console.log(chalk.gray('  3. Run'), chalk.cyan('clavix implement'), chalk.gray('to start implementation'));
      console.log();

      console.log(chalk.dim('Tip: Tasks follow CLEAR framework principles for optimal AI execution\n'));

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      this.error(chalk.red(errorMessage));
    }
  }

  private validateSessionFlags(session?: string, activeSession?: boolean): void {
    if (session && activeSession) {
      throw new Error('Use either --session or --active-session, not both.');
    }
  }

  private async prepareArtifactsFromSession(
    sessionId: string | undefined,
    useActive: boolean
  ): Promise<{
    prdPath: string;
    projectName: string;
    generatedArtifacts: string[];
  }> {
    const sessionManager = new SessionManager();
    const analyzer = new ConversationAnalyzer();

    let session = null;

    if (sessionId) {
      session = await sessionManager.getSession(sessionId);
      if (!session) {
        throw new Error(`Session not found: ${sessionId}`);
      }
    } else if (useActive) {
      session = await sessionManager.getActiveSession();
      if (!session) {
        throw new Error('No active session found.');
      }
    }

    if (!session) {
      throw new Error('Session resolution failed.');
    }

    if (session.messages.length === 0) {
      throw new Error('Session has no messages to analyze.');
    }

    console.log(chalk.dim(`Generating mini-PRD from session ${session.id}...`));

    const analysis = analyzer.analyze(session);
    const projectDirName = this.sanitizeProjectName(session.projectName);
    const outputsDir = path.join('.clavix', 'outputs', projectDirName);

    await FileSystem.ensureDir(outputsDir);

    const miniPrdPath = path.join(outputsDir, 'mini-prd.md');
    const promptPath = path.join(outputsDir, 'optimized-prompt.md');

    const miniPrdContent = analyzer.generateMiniPrd(session, analysis);
    const promptContent = analyzer.generateOptimizedPrompt(session, analysis);

    await FileSystem.writeFileAtomic(miniPrdPath, miniPrdContent);
    await FileSystem.writeFileAtomic(promptPath, promptContent);

    console.log(chalk.dim(`Saved mini-prd.md and optimized-prompt.md to ${outputsDir}.\n`));

    return {
      prdPath: outputsDir,
      projectName: projectDirName,
      generatedArtifacts: [miniPrdPath, promptPath],
    };
  }

  private async resolveProjectDirectory(
    manager: TaskManager,
    projectName?: string
  ): Promise<{
    path: string;
    name: string;
    sources: Array<Exclude<PrdSourceType, 'auto'>>;
    hasTasks: boolean;
  } | null> {
    const outputsDir = path.join(process.cwd(), '.clavix', 'outputs');

    if (!(await fs.pathExists(outputsDir))) {
      return null;
    }

    const entries = await fs.readdir(outputsDir, { withFileTypes: true });
    const projects: Array<{
      name: string;
      path: string;
      sources: Array<Exclude<PrdSourceType, 'auto'>>;
      hasTasks: boolean;
      mtime: Date;
    }> = [];

    for (const entry of entries) {
      if (!entry.isDirectory()) {
        continue;
      }

      if (entry.name === 'archive') {
        continue;
      }

      const projectPath = path.join(outputsDir, entry.name);
      const sources = await manager.detectAvailableSources(projectPath);

      if (sources.length === 0) {
        continue;
      }

      const hasTasks = await fs.pathExists(path.join(projectPath, 'tasks.md'));
      const stats = await fs.stat(projectPath);

      projects.push({
        name: entry.name,
        path: projectPath,
        sources,
        hasTasks,
        mtime: stats.mtime,
      });
    }

    if (projectName) {
      const match = projects.find((project) => project.name === projectName);
      if (!match) {
        throw new Error(`PRD project not found: ${projectName}`);
      }
      console.log(chalk.dim(`Selected project: ${match.name}`));
      return match;
    }

    if (projects.length === 0) {
      return null;
    }

    if (projects.length === 1) {
      const [project] = projects;
      console.log(chalk.dim(`Auto-selected project: ${project.name}`));
      return project;
    }

    if (this.isInteractive()) {
      console.log(chalk.bold('Select a PRD project to generate a task plan:\n'));

      const choices = projects.map((project) => {
        const sourceLabel = project.sources.join('/') || 'prompt';
        const taskLabel = project.hasTasks ? 'tasks present' : 'no tasks yet';
        return {
          name: `${project.name} — sources: ${sourceLabel}; ${taskLabel}`,
          value: project.name,
        };
      });

      const response = await inquirer.prompt([
        {
          type: 'list',
          name: 'project',
          message: 'Project:',
          choices,
        },
      ]);

      const selected = projects.find((project) => project.name === response.project);
      if (!selected) {
        throw new Error('Project selection failed.');
      }

      return selected;
    }

    projects.sort((a, b) => b.mtime.getTime() - a.mtime.getTime());
    const chosen = projects[0];
    console.log(
      chalk.dim(
        `Multiple PRD projects found; selected most recent: ${chosen.name}. Use --project to choose explicitly.`
      )
    );
    return chosen;
  }

  private sanitizeProjectName(name: string): string {
    const fallback = 'session-project';

    if (!name) {
      return fallback;
    }

    const sanitized = name
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 50);

    return sanitized || fallback;
  }

  private isInteractive(): boolean {
    return Boolean(process.stdin.isTTY && process.stdout.isTTY);
  }
}
