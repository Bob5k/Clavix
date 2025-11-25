import { BasePattern } from './base-pattern.js';
import { PromptIntent, PatternContext, PatternResult } from '../types.js';

/**
 * v4.0 Deep Mode Pattern: Alternative Phrasing Generator
 *
 * Generates 2-3 alternative prompt structures to give users options
 * for different approaches to the same request.
 */
export class AlternativePhrasingGenerator extends BasePattern {
  id = 'alternative-phrasing-generator';
  name = 'Alternative Phrasing Generator';
  description = 'Generate alternative prompt structures for different approaches';
  applicableIntents: PromptIntent[] = [
    'code-generation',
    'planning',
    'debugging',
    'testing',
    'migration',
    'security-review',
    'documentation',
  ];
  mode = 'deep' as const;
  priority = 5;

  apply(prompt: string, context: PatternContext): PatternResult {
    const alternatives = this.generateAlternatives(prompt, context.intent.primaryIntent);

    if (alternatives.length === 0) {
      return {
        enhancedPrompt: prompt,
        improvement: {
          dimension: 'structure',
          description: 'No alternative phrasings needed',
          impact: 'low',
        },
        applied: false,
      };
    }

    // Append alternatives section to the prompt
    const alternativesSection = this.formatAlternativesSection(alternatives);
    const enhancedPrompt = `${prompt}\n\n${alternativesSection}`;

    return {
      enhancedPrompt,
      improvement: {
        dimension: 'structure',
        description: `Generated ${alternatives.length} alternative approaches`,
        impact: 'medium',
      },
      applied: true,
    };
  }

  private generateAlternatives(prompt: string, intent: PromptIntent): AlternativeApproach[] {
    const alternatives: AlternativeApproach[] = [];

    // Intent-specific alternative generation
    switch (intent) {
      case 'code-generation':
        alternatives.push(...this.generateCodeAlternatives(prompt));
        break;
      case 'planning':
        alternatives.push(...this.generatePlanningAlternatives(prompt));
        break;
      case 'debugging':
        alternatives.push(...this.generateDebuggingAlternatives(prompt));
        break;
      case 'testing':
        alternatives.push(...this.generateTestingAlternatives(prompt));
        break;
      case 'migration':
        alternatives.push(...this.generateMigrationAlternatives(prompt));
        break;
      case 'security-review':
        alternatives.push(...this.generateSecurityAlternatives(prompt));
        break;
      case 'documentation':
        alternatives.push(...this.generateDocumentationAlternatives(prompt));
        break;
    }

    return alternatives.slice(0, 3); // Max 3 alternatives
  }

  private generateCodeAlternatives(_prompt: string): AlternativeApproach[] {
    return [
      {
        title: 'Functional Decomposition',
        description: 'Break down into discrete functions with clear interfaces',
        bestFor: 'Step-by-step implementation, clarity on sequence',
      },
      {
        title: 'Test-Driven Approach',
        description: 'Define expected behavior through tests first',
        bestFor: 'When requirements are clear and testable',
      },
      {
        title: 'Example-Driven',
        description: 'Provide concrete input/output examples',
        bestFor: 'When you have reference implementations',
      },
    ];
  }

  private generatePlanningAlternatives(_prompt: string): AlternativeApproach[] {
    return [
      {
        title: 'Top-Down Design',
        description: 'Start with high-level architecture, then decompose',
        bestFor: 'Complex systems with clear boundaries',
      },
      {
        title: 'User Story Mapping',
        description: 'Organize around user journeys and value delivery',
        bestFor: 'User-facing features and workflows',
      },
      {
        title: 'Domain-Driven Approach',
        description: 'Model based on business domain concepts',
        bestFor: 'Business logic-heavy applications',
      },
    ];
  }

  private generateDebuggingAlternatives(_prompt: string): AlternativeApproach[] {
    return [
      {
        title: 'Binary Search',
        description: 'Isolate the problem by eliminating half the code at a time',
        bestFor: 'When the bug location is unknown',
      },
      {
        title: 'Trace Analysis',
        description: 'Follow data flow through the system step by step',
        bestFor: 'Data transformation or state issues',
      },
      {
        title: 'Hypothesis Testing',
        description: 'Form specific hypotheses and test each one',
        bestFor: 'Complex, intermittent, or hard-to-reproduce bugs',
      },
    ];
  }

  private generateTestingAlternatives(_prompt: string): AlternativeApproach[] {
    return [
      {
        title: 'Behavior-Driven',
        description: 'Write tests as specifications of expected behavior',
        bestFor: 'Feature validation and acceptance testing',
      },
      {
        title: 'Property-Based',
        description: 'Define properties that should hold for any input',
        bestFor: 'Edge cases and data validation',
      },
      {
        title: 'Snapshot Testing',
        description: 'Capture and compare output snapshots',
        bestFor: 'UI components and serializable outputs',
      },
    ];
  }

  private generateMigrationAlternatives(_prompt: string): AlternativeApproach[] {
    return [
      {
        title: 'Big Bang Migration',
        description: 'Complete migration in one release',
        bestFor: 'Small systems or when downtime is acceptable',
      },
      {
        title: 'Strangler Fig Pattern',
        description: 'Gradually replace old system piece by piece',
        bestFor: 'Large systems requiring zero downtime',
      },
      {
        title: 'Parallel Running',
        description: 'Run both systems simultaneously and compare',
        bestFor: 'Critical systems requiring validation',
      },
    ];
  }

  private generateSecurityAlternatives(_prompt: string): AlternativeApproach[] {
    return [
      {
        title: 'Threat Modeling',
        description: 'Identify attack surfaces and threat actors first',
        bestFor: 'Comprehensive security assessment',
      },
      {
        title: 'OWASP Checklist',
        description: 'Systematic check against common vulnerabilities',
        bestFor: 'Web application security review',
      },
      {
        title: 'Attack Simulation',
        description: 'Think like an attacker, test exploitability',
        bestFor: 'Penetration testing mindset',
      },
    ];
  }

  private generateDocumentationAlternatives(_prompt: string): AlternativeApproach[] {
    return [
      {
        title: 'Tutorial Style',
        description: 'Step-by-step guide with examples',
        bestFor: 'Onboarding and learning',
      },
      {
        title: 'Reference Format',
        description: 'Comprehensive API/function reference',
        bestFor: 'Quick lookup and experienced users',
      },
      {
        title: 'Conceptual Overview',
        description: 'Explain the "why" and mental models',
        bestFor: 'Understanding architecture and design decisions',
      },
    ];
  }

  private formatAlternativesSection(alternatives: AlternativeApproach[]): string {
    const lines = ['### Alternative Approaches', ''];

    alternatives.forEach((alt, index) => {
      lines.push(`**${index + 1}. ${alt.title}**`);
      lines.push(`   ${alt.description}`);
      lines.push(`   → Best for: ${alt.bestFor}`);
      lines.push('');
    });

    return lines.join('\n');
  }
}

interface AlternativeApproach {
  title: string;
  description: string;
  bestFor: string;
}
