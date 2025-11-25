import { BasePattern } from './base-pattern.js';
import { PromptIntent, PatternContext, PatternResult } from '../types.js';

/**
 * v4.0 Both Mode Pattern: Context Precision Booster
 *
 * Adds precise context when missing to ensure
 * the AI has sufficient information for accurate responses.
 */
export class ContextPrecisionBooster extends BasePattern {
  id = 'context-precision';
  name = 'Context Precision Booster';
  description = 'Add precise context when missing';
  applicableIntents: PromptIntent[] = [
    'code-generation',
    'debugging',
    'refinement', // Includes code review and refactoring
    'documentation', // Includes explanations
    'testing',
    'migration',
    'security-review',
  ];
  mode = 'both' as const;
  priority = 8;

  apply(prompt: string, context: PatternContext): PatternResult {
    const missingContext = this.identifyMissingContext(prompt, context.intent.primaryIntent);

    if (missingContext.length === 0) {
      return {
        enhancedPrompt: prompt,
        improvement: {
          dimension: 'completeness',
          description: 'Context appears sufficient',
          impact: 'low',
        },
        applied: false,
      };
    }

    // Append context requirements section
    const contextSection = this.formatContextSection(missingContext);
    const enhancedPrompt = `${prompt}\n\n${contextSection}`;

    return {
      enhancedPrompt,
      improvement: {
        dimension: 'completeness',
        description: `Identified ${missingContext.length} areas needing context clarification`,
        impact: 'high',
      },
      applied: true,
    };
  }

  private identifyMissingContext(prompt: string, intent: PromptIntent): ContextGap[] {
    const gaps: ContextGap[] = [];
    const lowerPrompt = prompt.toLowerCase();

    // General context checks
    gaps.push(...this.checkGeneralContext(lowerPrompt));

    // Intent-specific context checks
    switch (intent) {
      case 'code-generation':
        gaps.push(...this.checkCodeGenerationContext(lowerPrompt));
        break;
      case 'debugging':
        gaps.push(...this.checkDebuggingContext(lowerPrompt));
        break;
      case 'refinement':
        // Refinement covers code review and refactoring
        gaps.push(...this.checkCodeReviewContext(lowerPrompt));
        gaps.push(...this.checkRefactoringContext(lowerPrompt));
        break;
      case 'documentation':
        // Documentation covers explanations
        break;
      case 'testing':
        gaps.push(...this.checkTestingContext(lowerPrompt));
        break;
      case 'migration':
        gaps.push(...this.checkMigrationContext(lowerPrompt));
        break;
      case 'security-review':
        gaps.push(...this.checkSecurityContext(lowerPrompt));
        break;
    }

    // Deduplicate and limit
    return this.deduplicateGaps(gaps).slice(0, 6);
  }

  private checkGeneralContext(prompt: string): ContextGap[] {
    const gaps: ContextGap[] = [];

    // Check for file/path references
    if (
      !this.hasSection(prompt, [
        '.ts',
        '.js',
        '.py',
        '.java',
        '.go',
        'file',
        'path',
        '/src',
        '/lib',
      ])
    ) {
      if (this.hasSection(prompt, ['code', 'function', 'class', 'module', 'component'])) {
        gaps.push({
          type: 'file-location',
          question: 'Which file(s) should this be implemented in?',
          suggestion: 'Specify the file path (e.g., src/utils/helpers.ts)',
        });
      }
    }

    // Check for version/technology specifics
    if (this.hasSection(prompt, ['version', 'upgrade', 'update', 'latest'])) {
      if (!this.hasVersionNumber(prompt)) {
        gaps.push({
          type: 'version',
          question: 'Which version are you targeting?',
          suggestion: 'Specify exact versions (e.g., React 18, Node 20, TypeScript 5.x)',
        });
      }
    }

    // Check for environment context
    if (!this.hasSection(prompt, ['production', 'development', 'staging', 'local', 'test', 'ci'])) {
      if (this.hasSection(prompt, ['deploy', 'config', 'env', 'environment'])) {
        gaps.push({
          type: 'environment',
          question: 'Which environment is this for?',
          suggestion: 'Specify environment (development, staging, production)',
        });
      }
    }

    return gaps;
  }

  private checkCodeGenerationContext(prompt: string): ContextGap[] {
    const gaps: ContextGap[] = [];

    // Check for input/output specification
    if (
      !this.hasSection(prompt, [
        'input',
        'output',
        'returns',
        'param',
        'argument',
        'takes',
        'accepts',
      ])
    ) {
      gaps.push({
        type: 'interface',
        question: 'What are the expected inputs and outputs?',
        suggestion: 'Define function signature: inputs, return type, and data structures',
      });
    }

    // Check for existing code context
    if (!this.hasSection(prompt, ['existing', 'current', 'already', 'codebase', 'project'])) {
      gaps.push({
        type: 'existing-code',
        question: 'Is there existing code this should integrate with?',
        suggestion: 'Reference existing patterns, imports, or dependencies in the project',
      });
    }

    // Check for error handling expectations
    if (!this.hasSection(prompt, ['error', 'exception', 'fail', 'invalid', 'null', 'undefined'])) {
      gaps.push({
        type: 'error-handling',
        question: 'How should errors be handled?',
        suggestion: 'Specify error handling strategy (throw, return null, default value)',
      });
    }

    return gaps;
  }

  private checkDebuggingContext(prompt: string): ContextGap[] {
    const gaps: ContextGap[] = [];

    // Check for error message/stack trace
    if (
      !this.hasSection(prompt, [
        'error:',
        'exception:',
        'stack',
        'trace',
        'at line',
        'typeerror',
        'referenceerror',
      ])
    ) {
      gaps.push({
        type: 'error-details',
        question: 'What is the exact error message or stack trace?',
        suggestion: 'Include the full error message and stack trace',
      });
    }

    // Check for reproduction steps
    if (!this.hasSection(prompt, ['steps', 'reproduce', 'when i', 'after', 'before', 'sequence'])) {
      gaps.push({
        type: 'reproduction',
        question: 'What are the steps to reproduce this issue?',
        suggestion: 'List the exact steps that trigger the bug',
      });
    }

    // Check for expected vs actual behavior
    if (!this.hasSection(prompt, ['expected', 'should', 'instead', 'actual', 'but'])) {
      gaps.push({
        type: 'expected-behavior',
        question: 'What is the expected behavior vs what actually happens?',
        suggestion: 'Describe what should happen and what actually happens',
      });
    }

    return gaps;
  }

  private checkCodeReviewContext(prompt: string): ContextGap[] {
    const gaps: ContextGap[] = [];

    // Check for review focus areas
    if (
      !this.hasSection(prompt, [
        'performance',
        'security',
        'maintainability',
        'readability',
        'bug',
        'best practice',
      ])
    ) {
      gaps.push({
        type: 'review-focus',
        question: 'What aspects should the review focus on?',
        suggestion: 'Specify: security, performance, readability, best practices, or all',
      });
    }

    // Check for context about the change
    if (
      !this.hasSection(prompt, ['pr', 'pull request', 'change', 'diff', 'commit', 'modification'])
    ) {
      gaps.push({
        type: 'change-context',
        question: 'What is the purpose of these changes?',
        suggestion: 'Explain what the code is meant to accomplish',
      });
    }

    return gaps;
  }

  private checkRefactoringContext(prompt: string): ContextGap[] {
    const gaps: ContextGap[] = [];

    // Check for refactoring goals
    if (
      !this.hasSection(prompt, ['goal', 'improve', 'simplify', 'extract', 'consolidate', 'split'])
    ) {
      gaps.push({
        type: 'refactoring-goal',
        question: 'What is the goal of this refactoring?',
        suggestion: 'Specify: improve readability, reduce duplication, improve testability, etc.',
      });
    }

    // Check for constraints
    if (
      !this.hasSection(prompt, [
        'constraint',
        'backward',
        'compatible',
        'api',
        'interface',
        'break',
      ])
    ) {
      gaps.push({
        type: 'constraints',
        question: 'Are there any constraints or backward compatibility requirements?',
        suggestion: 'Specify if public APIs must remain unchanged',
      });
    }

    return gaps;
  }

  private checkTestingContext(prompt: string): ContextGap[] {
    const gaps: ContextGap[] = [];

    // Check for test framework
    if (
      !this.hasSection(prompt, ['jest', 'vitest', 'mocha', 'pytest', 'junit', 'rspec', 'framework'])
    ) {
      gaps.push({
        type: 'test-framework',
        question: 'Which test framework should be used?',
        suggestion: 'Specify: Jest, Vitest, Mocha, pytest, etc.',
      });
    }

    // Check for test type
    if (
      !this.hasSection(prompt, ['unit', 'integration', 'e2e', 'end-to-end', 'component', 'smoke'])
    ) {
      gaps.push({
        type: 'test-type',
        question: 'What type of tests are needed?',
        suggestion: 'Specify: unit tests, integration tests, e2e tests',
      });
    }

    // Check for coverage requirements
    if (!this.hasSection(prompt, ['coverage', 'percent', '%', 'all cases', 'edge case'])) {
      gaps.push({
        type: 'coverage',
        question: 'What test coverage is required?',
        suggestion: 'Specify coverage target or specific scenarios to cover',
      });
    }

    return gaps;
  }

  private checkMigrationContext(prompt: string): ContextGap[] {
    const gaps: ContextGap[] = [];

    // Check for source and target
    if (!this.hasSection(prompt, ['from', 'to', 'source', 'target', 'current', 'new'])) {
      gaps.push({
        type: 'migration-endpoints',
        question: 'What is the source and target of this migration?',
        suggestion: 'Specify: from [current system/version] to [target system/version]',
      });
    }

    // Check for data considerations
    if (!this.hasSection(prompt, ['data', 'records', 'users', 'content', 'preserve'])) {
      gaps.push({
        type: 'data-handling',
        question: 'How should existing data be handled?',
        suggestion: 'Specify data migration strategy and what must be preserved',
      });
    }

    // Check for downtime requirements
    if (!this.hasSection(prompt, ['downtime', 'zero-downtime', 'maintenance', 'window'])) {
      gaps.push({
        type: 'downtime',
        question: 'What are the downtime requirements?',
        suggestion: 'Specify: zero-downtime required, or acceptable maintenance window',
      });
    }

    return gaps;
  }

  private checkSecurityContext(prompt: string): ContextGap[] {
    const gaps: ContextGap[] = [];

    // Check for threat model
    if (!this.hasSection(prompt, ['threat', 'attack', 'vulnerability', 'owasp', 'risk'])) {
      gaps.push({
        type: 'threat-model',
        question: 'What are the main security concerns or threats?',
        suggestion: 'Specify threat model or specific vulnerabilities to check',
      });
    }

    // Check for compliance requirements
    if (!this.hasSection(prompt, ['compliance', 'gdpr', 'hipaa', 'pci', 'soc2', 'regulation'])) {
      gaps.push({
        type: 'compliance',
        question: 'Are there specific compliance requirements?',
        suggestion: 'Specify: GDPR, HIPAA, PCI-DSS, SOC2, or internal policies',
      });
    }

    // Check for scope of review
    if (
      !this.hasSection(prompt, ['authentication', 'authorization', 'input', 'encryption', 'all'])
    ) {
      gaps.push({
        type: 'security-scope',
        question: 'What aspects of security should be reviewed?',
        suggestion: 'Specify: auth, input validation, encryption, or comprehensive review',
      });
    }

    return gaps;
  }

  private hasVersionNumber(prompt: string): boolean {
    // Check for version patterns like v1.0, 1.2.3, React 18, Node 20
    const versionPatterns = [/v?\d+\.\d+(\.\d+)?/, /\b(react|vue|angular|node|python|java)\s*\d+/i];
    return versionPatterns.some((pattern) => pattern.test(prompt));
  }

  private deduplicateGaps(gaps: ContextGap[]): ContextGap[] {
    const seen = new Set<string>();
    return gaps.filter((gap) => {
      if (seen.has(gap.type)) return false;
      seen.add(gap.type);
      return true;
    });
  }

  private formatContextSection(gaps: ContextGap[]): string {
    const lines = [
      '### Context Needed',
      '',
      'Please provide additional context for better results:',
      '',
    ];

    gaps.forEach((gap, index) => {
      lines.push(`**${index + 1}. ${gap.question}**`);
      lines.push(`   _Suggestion: ${gap.suggestion}_`);
      lines.push('');
    });

    return lines.join('\n');
  }
}

interface ContextGap {
  type: string;
  question: string;
  suggestion: string;
}
