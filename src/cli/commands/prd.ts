import { Command, Flags } from '@oclif/core';
import chalk from 'chalk';
import inquirer from 'inquirer';
import * as path from 'path';
import * as fs from 'fs-extra';
import { QuestionEngine } from '../../core/question-engine';
import { PrdGenerator } from '../../core/prd-generator';
import { PromptOptimizer } from '../../core/prompt-optimizer';

export default class Prd extends Command {
  static description = 'Generate a Product Requirements Document through Socratic questioning';

  static examples = [
    '<%= config.bin %> <%= command.id %>',
    '<%= config.bin %> <%= command.id %> --quick',
    '<%= config.bin %> <%= command.id %> --project my-app',
  ];

  static flags = {
    quick: Flags.boolean({
      char: 'q',
      description: 'Use quick mode with fewer questions',
      default: false,
    }),
    project: Flags.string({
      char: 'p',
      description: 'Project name for organizing outputs',
    }),
    template: Flags.string({
      char: 't',
      description: 'Path to custom question template',
    }),
    'skip-validation': Flags.boolean({
      description: 'Skip CLEAR framework validation of generated PRD',
      default: false,
    }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(Prd);

    console.log(chalk.bold.cyan('\nPRD Generator\n'));
    console.log(chalk.gray("Let's create a comprehensive Product Requirements Document through strategic questions.\n"));

    try {
      // Initialize QuestionEngine
      const engine = new QuestionEngine();

      // Determine template path
      const templatePath = flags.template ||
        path.join(__dirname, '../../templates/prd-questions.md');

      // Load question flow
      console.log(chalk.dim('Loading questions...\n'));
      const flow = await engine.loadFlow(templatePath);

      console.log(chalk.bold(`${flow.name}`));
      console.log(chalk.gray(flow.description));
      console.log();

      // Collect answers through Socratic questioning
      const answers: Record<string, unknown> = {};
      let question = engine.getNextQuestion();
      let detectedStack: string | null = null;
      let stackDetectionDone = false;

      while (question) {
        const progress = engine.getProgress();
        console.log(chalk.dim(`[${progress.current + 1}/${progress.total}]`));

        let answer;
        if (question.type === 'confirm') {
          const response = await inquirer.prompt([
            {
              type: 'confirm',
              name: 'answer',
              message: question.text,
              default: question.default as boolean,
            },
          ]);
          answer = response.answer;
        } else if (question.type === 'list' && question.choices) {
          const response = await inquirer.prompt([
            {
              type: 'list',
              name: 'answer',
              message: question.text,
              choices: question.choices,
            },
          ]);
          answer = response.answer;
        } else {
          // Text input
          // Capture question reference for closure
          const currentQuestion = question;
          let messageText = currentQuestion.text;

          // Smart tech stack detection for Q3
          if (currentQuestion.id === 'q3' && !stackDetectionDone) {
            detectedStack = await this.detectProjectTechStack();
            stackDetectionDone = true;

            if (detectedStack) {
              messageText = `${currentQuestion.text}\n  ${chalk.cyan('Detected:')} ${chalk.green(detectedStack)} ${chalk.dim('(press Enter to use, or type to override)')}`;
            }
          }

          const response = await inquirer.prompt([
            {
              type: 'input',
              name: 'answer',
              message: messageText,
              default: currentQuestion.default as string,
              validate: (input: string) => {
                // Check if required
                if (currentQuestion.required && !input.trim()) {
                  return 'This question is required';
                }

                // Run custom validation if exists
                if (currentQuestion.validate) {
                  const result = currentQuestion.validate(input);
                  if (result !== true) {
                    return result as string;
                  }
                }

                return true;
              },
            },
          ]);
          answer = response.answer;

          // If Q3 and answer is empty but we have detected stack, use it
          if (currentQuestion.id === 'q3' && !answer.trim() && detectedStack) {
            answer = detectedStack;
            console.log(chalk.dim(`  Using detected: ${detectedStack}`));
          }
        }

        // Submit answer (only if not empty or if it's a detected stack for Q3)
        if (answer && answer.toString().trim() && question) {
          const submitResult = engine.submitAnswer(question.id, answer);
          if (submitResult !== true) {
            console.log(chalk.red(`\n${submitResult}\n`));
            continue; // Ask again
          }
          answers[question.id] = answer;
        }

        console.log(); // Add spacing
        question = engine.getNextQuestion();
      }

      // All questions answered
      console.log(chalk.bold.green('\nAll questions answered!\n'));

      // Generate PRDs
      console.log(chalk.dim('Generating PRD documents...\n'));

      const generator = new PrdGenerator();
      const projectName = flags.project || generator.extractProjectName(answers);

      const outputPath = await generator.generate(answers, {
        projectName,
        outputDir: '.clavix/outputs',
      });

      // Display success message
      console.log(chalk.bold.green('PRD documents generated successfully!\n'));
      console.log(chalk.bold('Output location:'));
      console.log(chalk.cyan(`  ${outputPath}`));
      console.log();
      console.log(chalk.bold('Generated files:'));
      console.log(chalk.gray(`  • full-prd.md`) + chalk.dim(' - Comprehensive PRD for team alignment'));
      console.log(chalk.gray(`  • quick-prd.md`) + chalk.dim(' - Condensed prompt for AI agents'));
      console.log();

      // CLEAR validation of quick-prd.md (unless skipped)
      if (!flags['skip-validation']) {
        await this.validatePrdWithClear(outputPath);
      }

      console.log(chalk.gray('Tip: Use quick-prd.md as input for your AI agent to start development\n'));

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      this.error(chalk.red(errorMessage));
    }
  }

  /**
   * Detect project tech stack from common config files
   * Returns a string describing detected technologies or null if none found
   */
  private async detectProjectTechStack(): Promise<string | null> {
    const detectedTech: string[] = [];

    try {
      // Check package.json (Node.js/JavaScript)
      if (await fs.pathExists('package.json')) {
        const pkg = await fs.readJson('package.json');
        const deps = { ...pkg.dependencies, ...pkg.devDependencies };

        // Detect popular frameworks
        if (deps.react) detectedTech.push('React');
        if (deps.vue) detectedTech.push('Vue');
        if (deps.angular) detectedTech.push('Angular');
        if (deps.next) detectedTech.push('Next.js');
        if (deps.astro) detectedTech.push('Astro');
        if (deps.tailwindcss) detectedTech.push('Tailwind CSS');
        if (deps.typescript) detectedTech.push('TypeScript');
        if (deps.express) detectedTech.push('Express');
        if (deps.fastify) detectedTech.push('Fastify');

        if (detectedTech.length === 0) detectedTech.push('Node.js');
      }

      // Check requirements.txt (Python)
      if (await fs.pathExists('requirements.txt')) {
        const content = await fs.readFile('requirements.txt', 'utf-8');
        if (content.includes('django')) detectedTech.push('Django');
        if (content.includes('flask')) detectedTech.push('Flask');
        if (content.includes('fastapi')) detectedTech.push('FastAPI');
        if (detectedTech.length === 0) detectedTech.push('Python');
      }

      // Check Gemfile (Ruby)
      if (await fs.pathExists('Gemfile')) {
        const content = await fs.readFile('Gemfile', 'utf-8');
        if (content.includes('rails')) detectedTech.push('Rails');
        if (detectedTech.length === 0) detectedTech.push('Ruby');
      }

      // Check go.mod (Go)
      if (await fs.pathExists('go.mod')) {
        detectedTech.push('Go');
      }

      // Check Cargo.toml (Rust)
      if (await fs.pathExists('Cargo.toml')) {
        detectedTech.push('Rust');
      }

      // Check composer.json (PHP)
      if (await fs.pathExists('composer.json')) {
        const composer = await fs.readJson('composer.json');
        if (composer.require?.['laravel/framework']) detectedTech.push('Laravel');
        if (composer.require?.['symfony/symfony']) detectedTech.push('Symfony');
        if (detectedTech.length === 0) detectedTech.push('PHP');
      }

      if (detectedTech.length > 0) {
        return detectedTech.join(', ');
      }

      return null;
    } catch {
      return null;
    }
  }

  /**
   * Validate the generated quick-prd.md using CLEAR framework
   * Focuses on C, L, E components for AI consumption quality
   */
  private async validatePrdWithClear(outputPath: string): Promise<void> {
    try {
      const quickPrdPath = path.join(outputPath, 'quick-prd.md');

      // Read the generated quick-prd.md
      const prdContent = await fs.readFile(quickPrdPath, 'utf-8');

      console.log(chalk.bold.cyan('📊 CLEAR Framework Validation\n'));
      console.log(chalk.gray('Analyzing quick-prd.md for AI consumption quality...\n'));

      // Run CLEAR analysis (C, L, E only for PRDs)
      const optimizer = new PromptOptimizer();
      const clearResult = optimizer.applyCLEARFramework(prdContent, 'fast');
      const clearScore = optimizer.calculateCLEARScore(clearResult);

      const getScoreColor = (score: number) => {
        if (score >= 80) return chalk.green;
        if (score >= 60) return chalk.yellow;
        return chalk.red;
      };

      // Display CLEAR assessment for AI consumption
      console.log(chalk.bold('AI Consumption Quality Assessment:\n'));

      // Conciseness
      const cColor = getScoreColor(clearScore.conciseness);
      console.log(cColor.bold(`  [C] Concise: ${clearScore.conciseness.toFixed(0)}%`));
      if (clearResult.conciseness.suggestions.length > 0) {
        clearResult.conciseness.suggestions.slice(0, 2).forEach((s: string) => {
          console.log(cColor(`      ${s}`));
        });
      }
      console.log();

      // Logic
      const lColor = getScoreColor(clearScore.logic);
      console.log(lColor.bold(`  [L] Logical: ${clearScore.logic.toFixed(0)}%`));
      if (clearResult.logic.suggestions.length > 0) {
        clearResult.logic.suggestions.slice(0, 2).forEach((s: string) => {
          console.log(lColor(`      ${s}`));
        });
      }
      console.log();

      // Explicitness
      const eColor = getScoreColor(clearScore.explicitness);
      console.log(eColor.bold(`  [E] Explicit: ${clearScore.explicitness.toFixed(0)}%`));
      if (clearResult.explicitness.suggestions.length > 0) {
        clearResult.explicitness.suggestions.slice(0, 2).forEach((s: string) => {
          console.log(eColor(`      ${s}`));
        });
      }
      console.log();

      // Overall
      const overallColor = getScoreColor(clearScore.overall);
      console.log(overallColor.bold(`  Overall CLEAR Score: ${clearScore.overall.toFixed(0)}% (${clearScore.rating})\n`));

      // Recommendations
      if (clearScore.overall < 80) {
        console.log(chalk.yellow('💡 PRD Quality Tips:\n'));

        if (clearScore.conciseness < 80 && clearResult.conciseness.suggestions.length > 0) {
          console.log(chalk.yellow('  [C] Consider making the PRD more concise:'));
          clearResult.conciseness.suggestions.slice(0, 2).forEach((s: string) => {
            console.log(chalk.yellow(`      • ${s}`));
          });
          console.log();
        }

        if (clearScore.logic < 80 && clearResult.logic.suggestions.length > 0) {
          console.log(chalk.yellow('  [L] Improve logical structure:'));
          clearResult.logic.suggestions.slice(0, 2).forEach((s: string) => {
            console.log(chalk.yellow(`      • ${s}`));
          });
          console.log();
        }

        if (clearScore.explicitness < 80 && clearResult.explicitness.suggestions.length > 0) {
          console.log(chalk.yellow('  [E] Add more explicit details:'));
          clearResult.explicitness.suggestions.slice(0, 2).forEach((s: string) => {
            console.log(chalk.yellow(`      • ${s}`));
          });
          console.log();
        }
      } else {
        console.log(chalk.green('✨ Excellent! This PRD is well-optimized for AI consumption.\n'));
      }

    } catch {
      // Don't fail the whole command if validation fails
      console.log(chalk.yellow('⚠ Could not validate PRD with CLEAR framework\n'));
    }
  }
}
