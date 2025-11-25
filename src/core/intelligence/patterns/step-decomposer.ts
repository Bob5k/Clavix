import { BasePattern } from './base-pattern.js';
import { PromptIntent, PatternContext, PatternResult } from '../types.js';

/**
 * v4.0 Both Mode Pattern: Step-by-Step Decomposer
 *
 * Breaks complex prompts into clear sequential steps.
 * Applicable in both fast and deep modes.
 */
export class StepDecomposer extends BasePattern {
  id = 'step-decomposer';
  name = 'Step-by-Step Decomposer';
  description = 'Break complex prompts into clear sequential steps';
  applicableIntents: PromptIntent[] = [
    'code-generation',
    'planning',
    'migration',
    'testing',
    'debugging',
    'documentation',
  ];
  mode = 'both' as const;
  priority = 7;

  apply(prompt: string, context: PatternContext): PatternResult {
    // Check if prompt is complex enough to benefit from decomposition
    if (!this.needsDecomposition(prompt)) {
      return {
        enhancedPrompt: prompt,
        improvement: {
          dimension: 'structure',
          description: 'Prompt is simple enough, no decomposition needed',
          impact: 'low',
        },
        applied: false,
      };
    }

    // Check if already has steps
    if (this.hasSteps(prompt)) {
      return {
        enhancedPrompt: prompt,
        improvement: {
          dimension: 'structure',
          description: 'Prompt already has step structure',
          impact: 'low',
        },
        applied: false,
      };
    }

    const steps = this.decompose(prompt, context.intent.primaryIntent);

    if (steps.length < 2) {
      return {
        enhancedPrompt: prompt,
        improvement: {
          dimension: 'structure',
          description: 'Could not identify multiple steps',
          impact: 'low',
        },
        applied: false,
      };
    }

    const stepsSection = this.formatStepsSection(steps);
    const enhancedPrompt = `${prompt}\n\n${stepsSection}`;

    return {
      enhancedPrompt,
      improvement: {
        dimension: 'structure',
        description: `Decomposed into ${steps.length} sequential steps`,
        impact: 'high',
      },
      applied: true,
    };
  }

  private needsDecomposition(prompt: string): boolean {
    // Complex if:
    // - Contains multiple actions (and, then, also, after)
    // - Has multiple requirements listed
    // - Is longer than 100 words
    const wordCount = this.countWords(prompt);
    const hasMultipleActions = /\b(and|then|also|after|next|finally|additionally)\b/gi.test(prompt);
    const hasMultipleRequirements = (prompt.match(/[-•*]\s+/g) || []).length >= 2;

    return wordCount > 100 || hasMultipleActions || hasMultipleRequirements;
  }

  private hasSteps(prompt: string): boolean {
    // Check for existing step indicators
    const stepPatterns = [
      /step\s*[1-9]/i,
      /^\s*[1-9]\.\s+/m,
      /first[\s,].*second[\s,]/i,
      /phase\s*[1-9]/i,
    ];
    return stepPatterns.some((pattern) => pattern.test(prompt));
  }

  private decompose(prompt: string, intent: PromptIntent): Step[] {
    const steps: Step[] = [];
    const lowerPrompt = prompt.toLowerCase();

    // Intent-specific decomposition
    switch (intent) {
      case 'code-generation':
        steps.push(...this.decomposeCodeGeneration(lowerPrompt));
        break;
      case 'planning':
        steps.push(...this.decomposePlanning(lowerPrompt));
        break;
      case 'migration':
        steps.push(...this.decomposeMigration(lowerPrompt));
        break;
      case 'testing':
        steps.push(...this.decomposeTesting(lowerPrompt));
        break;
      case 'debugging':
        steps.push(...this.decomposeDebugging(lowerPrompt));
        break;
      case 'documentation':
        steps.push(...this.decomposeDocumentation(lowerPrompt));
        break;
      default:
        steps.push(...this.decomposeGeneric(lowerPrompt));
    }

    return steps;
  }

  private decomposeCodeGeneration(prompt: string): Step[] {
    const steps: Step[] = [];

    // Standard code generation workflow
    if (this.hasSection(prompt, ['component', 'ui', 'interface'])) {
      steps.push({ description: 'Define component interface and props' });
      steps.push({ description: 'Implement core component logic' });
      steps.push({ description: 'Add styling and responsive design' });
      steps.push({ description: 'Add error handling and edge cases' });
      steps.push({ description: 'Write unit tests' });
    } else if (this.hasSection(prompt, ['api', 'endpoint', 'route'])) {
      steps.push({ description: 'Define API contract (request/response)' });
      steps.push({ description: 'Implement endpoint handler' });
      steps.push({ description: 'Add input validation' });
      steps.push({ description: 'Implement error handling' });
      steps.push({ description: 'Add authentication/authorization if needed' });
      steps.push({ description: 'Write tests' });
    } else if (this.hasSection(prompt, ['function', 'utility', 'helper'])) {
      steps.push({ description: 'Define function signature and types' });
      steps.push({ description: 'Implement core logic' });
      steps.push({ description: 'Handle edge cases' });
      steps.push({ description: 'Add documentation' });
      steps.push({ description: 'Write tests' });
    } else {
      steps.push({ description: 'Understand requirements and define interface' });
      steps.push({ description: 'Implement core functionality' });
      steps.push({ description: 'Add error handling' });
      steps.push({ description: 'Test and validate' });
    }

    return steps;
  }

  private decomposePlanning(_prompt: string): Step[] {
    return [
      { description: 'Clarify goals and success criteria' },
      { description: 'Identify key components and dependencies' },
      { description: 'Define architecture and data flow' },
      { description: 'Break down into implementable tasks' },
      { description: 'Identify risks and mitigation strategies' },
      { description: 'Create timeline and milestones' },
    ];
  }

  private decomposeMigration(_prompt: string): Step[] {
    return [
      { description: 'Assess current state and document existing behavior' },
      { description: 'Define target state and requirements' },
      { description: 'Create migration plan with rollback strategy' },
      { description: 'Set up parallel environment for testing' },
      { description: 'Migrate data in stages' },
      { description: 'Validate functionality and performance' },
      { description: 'Switch traffic and monitor' },
      { description: 'Decommission old system after stabilization' },
    ];
  }

  private decomposeTesting(_prompt: string): Step[] {
    return [
      { description: 'Identify test cases from requirements' },
      { description: 'Set up test environment and fixtures' },
      { description: 'Write happy path tests' },
      { description: 'Write edge case tests' },
      { description: 'Write error scenario tests' },
      { description: 'Verify coverage meets requirements' },
      { description: 'Review and refactor tests for maintainability' },
    ];
  }

  private decomposeDebugging(_prompt: string): Step[] {
    return [
      { description: 'Reproduce the bug consistently' },
      { description: 'Gather error logs and stack traces' },
      { description: 'Isolate the problem area' },
      { description: 'Form hypothesis about root cause' },
      { description: 'Test hypothesis with targeted changes' },
      { description: 'Implement fix' },
      { description: 'Verify fix resolves issue without regression' },
      { description: 'Add test to prevent recurrence' },
    ];
  }

  private decomposeDocumentation(_prompt: string): Step[] {
    return [
      { description: 'Identify target audience and their needs' },
      { description: 'Outline document structure' },
      { description: 'Write introduction and overview' },
      { description: 'Document main content with examples' },
      { description: 'Add troubleshooting/FAQ section' },
      { description: 'Review for accuracy and clarity' },
    ];
  }

  private decomposeGeneric(_prompt: string): Step[] {
    return [
      { description: 'Understand and clarify requirements' },
      { description: 'Plan approach and identify dependencies' },
      { description: 'Execute main task' },
      { description: 'Validate results' },
      { description: 'Document and finalize' },
    ];
  }

  private formatStepsSection(steps: Step[]): string {
    const lines = ['### Implementation Steps', ''];

    steps.forEach((step, index) => {
      lines.push(`${index + 1}. ${step.description}`);
    });

    return lines.join('\n');
  }
}

interface Step {
  description: string;
}
