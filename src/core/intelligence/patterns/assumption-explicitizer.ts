import { BasePattern } from './base-pattern.js';
import { PromptIntent, PatternContext, PatternResult } from '../types.js';

/**
 * v4.0 Deep Mode Pattern: Assumption Explicitizer
 *
 * Makes implicit assumptions explicit to prevent misunderstandings
 * and ensure comprehensive requirement coverage.
 */
export class AssumptionExplicitizer extends BasePattern {
  id = 'assumption-explicitizer';
  name = 'Assumption Explicitizer';
  description = 'Make implicit assumptions explicit to prevent misunderstandings';
  applicableIntents: PromptIntent[] = [
    'code-generation',
    'planning',
    'migration',
    'testing',
    'debugging',
    'prd-generation',
  ];
  mode = 'deep' as const;
  priority = 6;

  apply(prompt: string, context: PatternContext): PatternResult {
    const assumptions = this.identifyAssumptions(prompt, context.intent.primaryIntent);

    if (assumptions.length === 0) {
      return {
        enhancedPrompt: prompt,
        improvement: {
          dimension: 'clarity',
          description: 'No implicit assumptions detected',
          impact: 'low',
        },
        applied: false,
      };
    }

    // Append assumptions section to the prompt
    const assumptionsSection = this.formatAssumptionsSection(assumptions);
    const enhancedPrompt = `${prompt}\n\n${assumptionsSection}`;

    return {
      enhancedPrompt,
      improvement: {
        dimension: 'clarity',
        description: `Identified ${assumptions.length} implicit assumptions to clarify`,
        impact: 'high',
      },
      applied: true,
    };
  }

  private identifyAssumptions(prompt: string, intent: PromptIntent): Assumption[] {
    const assumptions: Assumption[] = [];
    const lowerPrompt = prompt.toLowerCase();

    // Check for missing context that leads to assumptions
    assumptions.push(...this.identifyMissingContext(lowerPrompt));

    // Intent-specific assumptions
    switch (intent) {
      case 'code-generation':
        assumptions.push(...this.getCodeAssumptions(lowerPrompt));
        break;
      case 'planning':
        assumptions.push(...this.getPlanningAssumptions(lowerPrompt));
        break;
      case 'migration':
        assumptions.push(...this.getMigrationAssumptions(lowerPrompt));
        break;
      case 'testing':
        assumptions.push(...this.getTestingAssumptions(lowerPrompt));
        break;
      case 'debugging':
        assumptions.push(...this.getDebuggingAssumptions(lowerPrompt));
        break;
    }

    // Domain-specific assumptions
    assumptions.push(...this.getDomainAssumptions(lowerPrompt));

    return this.deduplicateAssumptions(assumptions).slice(0, 8);
  }

  private identifyMissingContext(prompt: string): Assumption[] {
    const assumptions: Assumption[] = [];

    // Check for vague technology references
    if (!this.hasSection(prompt, ['react', 'vue', 'angular', 'svelte', 'next', 'nuxt'])) {
      if (this.hasSection(prompt, ['component', 'frontend', 'ui'])) {
        assumptions.push({
          assumption: 'Frontend framework is React',
          clarificationNeeded:
            'Which frontend framework should be used? (React, Vue, Angular, etc.)',
        });
      }
    }

    // Check for missing language specification
    if (!this.hasSection(prompt, ['typescript', 'javascript', 'python', 'java', 'go', 'rust'])) {
      if (this.hasSection(prompt, ['function', 'class', 'code', 'implement'])) {
        assumptions.push({
          assumption: 'Language is TypeScript/JavaScript',
          clarificationNeeded: 'Which programming language should be used?',
        });
      }
    }

    // Check for missing database type
    if (!this.hasSection(prompt, ['postgres', 'mysql', 'mongodb', 'sqlite', 'redis'])) {
      if (this.hasSection(prompt, ['database', 'store', 'persist', 'save'])) {
        assumptions.push({
          assumption: 'Database type is flexible',
          clarificationNeeded: 'Which database technology is being used?',
        });
      }
    }

    return assumptions;
  }

  private getCodeAssumptions(prompt: string): Assumption[] {
    const assumptions: Assumption[] = [];

    // Error handling assumption
    if (!this.hasSection(prompt, ['error', 'exception', 'catch', 'handle'])) {
      assumptions.push({
        assumption: 'Basic error handling is expected',
        clarificationNeeded:
          'What error handling strategy should be used? (throw, return null, default value, etc.)',
      });
    }

    // Async assumption
    if (this.hasSection(prompt, ['api', 'fetch', 'request', 'call'])) {
      if (!this.hasSection(prompt, ['async', 'await', 'promise', 'callback'])) {
        assumptions.push({
          assumption: 'Using async/await pattern',
          clarificationNeeded: 'Should this be synchronous or asynchronous?',
        });
      }
    }

    // State management assumption
    if (this.hasSection(prompt, ['state', 'store', 'context'])) {
      if (!this.hasSection(prompt, ['redux', 'zustand', 'mobx', 'context api'])) {
        assumptions.push({
          assumption: 'Using React Context or local state',
          clarificationNeeded: 'Which state management approach is preferred?',
        });
      }
    }

    return assumptions;
  }

  private getPlanningAssumptions(prompt: string): Assumption[] {
    const assumptions: Assumption[] = [];

    // Team size assumption
    if (!this.hasSection(prompt, ['team', 'developer', 'person'])) {
      assumptions.push({
        assumption: 'Small team (1-3 developers)',
        clarificationNeeded: 'How many people will work on this?',
      });
    }

    // Timeline assumption
    if (!this.hasSection(prompt, ['deadline', 'timeline', 'sprint', 'week', 'month'])) {
      assumptions.push({
        assumption: 'Flexible timeline',
        clarificationNeeded: 'What are the timeline constraints?',
      });
    }

    // Scale assumption
    if (!this.hasSection(prompt, ['users', 'traffic', 'scale', 'load'])) {
      assumptions.push({
        assumption: 'Starting with low-moderate scale',
        clarificationNeeded: 'What is the expected scale (users, requests/sec)?',
      });
    }

    return assumptions;
  }

  private getMigrationAssumptions(prompt: string): Assumption[] {
    const assumptions: Assumption[] = [];

    // Downtime assumption
    if (!this.hasSection(prompt, ['downtime', 'zero-downtime', 'maintenance'])) {
      assumptions.push({
        assumption: 'Some downtime is acceptable',
        clarificationNeeded: 'Is zero-downtime migration required?',
      });
    }

    // Rollback assumption
    if (!this.hasSection(prompt, ['rollback', 'revert', 'backup'])) {
      assumptions.push({
        assumption: 'Rollback capability is needed',
        clarificationNeeded: 'What is the rollback strategy if migration fails?',
      });
    }

    // Data preservation assumption
    assumptions.push({
      assumption: 'All existing data must be preserved',
      clarificationNeeded: 'Can any data be discarded or archived during migration?',
    });

    return assumptions;
  }

  private getTestingAssumptions(prompt: string): Assumption[] {
    const assumptions: Assumption[] = [];

    // Test framework assumption
    if (!this.hasSection(prompt, ['jest', 'vitest', 'mocha', 'pytest', 'junit'])) {
      assumptions.push({
        assumption: "Using project's existing test framework",
        clarificationNeeded: 'Which test framework should be used?',
      });
    }

    // Coverage assumption
    if (!this.hasSection(prompt, ['coverage', 'percent', '%'])) {
      assumptions.push({
        assumption: 'Standard coverage target (80%+)',
        clarificationNeeded: 'What is the target code coverage percentage?',
      });
    }

    // Mocking assumption
    if (!this.hasSection(prompt, ['mock', 'stub', 'fake', 'spy'])) {
      assumptions.push({
        assumption: 'External dependencies should be mocked',
        clarificationNeeded: 'Should tests use real dependencies or mocks?',
      });
    }

    return assumptions;
  }

  private getDebuggingAssumptions(prompt: string): Assumption[] {
    const assumptions: Assumption[] = [];

    // Environment assumption
    if (!this.hasSection(prompt, ['production', 'staging', 'development', 'local'])) {
      assumptions.push({
        assumption: 'Bug occurs in development environment',
        clarificationNeeded: 'In which environment does this bug occur?',
      });
    }

    // Reproducibility assumption
    if (!this.hasSection(prompt, ['always', 'sometimes', 'intermittent', 'random'])) {
      assumptions.push({
        assumption: 'Bug is consistently reproducible',
        clarificationNeeded: 'Does this bug occur every time or intermittently?',
      });
    }

    return assumptions;
  }

  private getDomainAssumptions(prompt: string): Assumption[] {
    const assumptions: Assumption[] = [];

    // Authentication assumption
    if (this.hasSection(prompt, ['user', 'login', 'auth'])) {
      if (!this.hasSection(prompt, ['jwt', 'session', 'oauth', 'cookie'])) {
        assumptions.push({
          assumption: 'Using JWT-based authentication',
          clarificationNeeded: 'Which authentication mechanism is in use?',
        });
      }
    }

    // API style assumption
    if (this.hasSection(prompt, ['api', 'endpoint'])) {
      if (!this.hasSection(prompt, ['rest', 'graphql', 'grpc', 'websocket'])) {
        assumptions.push({
          assumption: 'Building REST API',
          clarificationNeeded: 'Which API style? (REST, GraphQL, gRPC, etc.)',
        });
      }
    }

    return assumptions;
  }

  private deduplicateAssumptions(assumptions: Assumption[]): Assumption[] {
    const seen = new Set<string>();
    return assumptions.filter((a) => {
      const key = a.assumption.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  private formatAssumptionsSection(assumptions: Assumption[]): string {
    const lines = [
      '### Implicit Assumptions',
      '',
      'The following assumptions are being made. Please clarify if any are incorrect:',
      '',
    ];

    assumptions.forEach((a, index) => {
      lines.push(`**${index + 1}. ${a.assumption}**`);
      lines.push(`   → Clarify: ${a.clarificationNeeded}`);
      lines.push('');
    });

    return lines.join('\n');
  }
}

interface Assumption {
  assumption: string;
  clarificationNeeded: string;
}
