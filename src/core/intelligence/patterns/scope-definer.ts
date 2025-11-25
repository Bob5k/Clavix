import { BasePattern } from './base-pattern.js';
import { PromptIntent, PatternContext, PatternResult } from '../types.js';

/**
 * v4.0 Deep Mode Pattern: Scope Definer
 *
 * Adds explicit scope boundaries to prevent scope creep
 * and clarify what is/isn't included.
 */
export class ScopeDefiner extends BasePattern {
  id = 'scope-definer';
  name = 'Scope Definer';
  description = 'Add explicit scope boundaries to prevent scope creep';
  applicableIntents: PromptIntent[] = [
    'code-generation',
    'planning',
    'prd-generation',
    'migration',
    'documentation',
  ];
  mode = 'deep' as const;
  priority = 5;

  apply(prompt: string, context: PatternContext): PatternResult {
    // Check if prompt already has scope definition
    if (this.hasExistingScope(prompt)) {
      return {
        enhancedPrompt: prompt,
        improvement: {
          dimension: 'completeness',
          description: 'Scope already defined',
          impact: 'low',
        },
        applied: false,
      };
    }

    const scope = this.defineScope(prompt, context.intent.primaryIntent);
    const scopeSection = this.formatScopeSection(scope);
    const enhancedPrompt = `${prompt}\n\n${scopeSection}`;

    return {
      enhancedPrompt,
      improvement: {
        dimension: 'completeness',
        description: 'Added explicit scope boundaries',
        impact: 'medium',
      },
      applied: true,
    };
  }

  private hasExistingScope(prompt: string): boolean {
    const scopeIndicators = [
      'out of scope',
      'not included',
      'scope:',
      'in scope',
      'excluded',
      'will not',
      "won't include",
      'not part of',
    ];
    const lowerPrompt = prompt.toLowerCase();
    return scopeIndicators.some((indicator) => lowerPrompt.includes(indicator));
  }

  private defineScope(prompt: string, intent: PromptIntent): ScopeDefinition {
    const lowerPrompt = prompt.toLowerCase();

    // Extract what's explicitly requested
    const inScope = this.extractInScope(lowerPrompt, intent);

    // Identify common out-of-scope items based on context
    const outOfScope = this.identifyOutOfScope(lowerPrompt, intent);

    // Identify boundaries
    const boundaries = this.identifyBoundaries(lowerPrompt, intent);

    return { inScope, outOfScope, boundaries };
  }

  private extractInScope(prompt: string, intent: PromptIntent): string[] {
    const inScope: string[] = [];

    // Look for explicit requirements
    const requirementPatterns = [
      /(?:need|want|require|should have|must have)\s+(.+?)(?:\.|,|$)/gi,
      /(?:create|build|implement|add)\s+(?:a\s+)?(.+?)(?:\.|,|$)/gi,
    ];

    requirementPatterns.forEach((pattern) => {
      let match;
      while ((match = pattern.exec(prompt)) !== null) {
        const requirement = match[1].trim();
        if (requirement.length > 3 && requirement.length < 100) {
          inScope.push(requirement);
        }
      }
    });

    // Intent-specific in-scope items
    switch (intent) {
      case 'code-generation':
        if (this.hasSection(prompt, ['component', 'ui'])) {
          inScope.push('Component implementation with specified functionality');
        }
        if (this.hasSection(prompt, ['api', 'endpoint'])) {
          inScope.push('API endpoint implementation');
        }
        break;
      case 'planning':
        inScope.push('High-level architecture design');
        inScope.push('Task breakdown and sequencing');
        break;
      case 'migration':
        inScope.push('Data migration from source to target');
        inScope.push('Functionality preservation');
        break;
    }

    return [...new Set(inScope)].slice(0, 5);
  }

  private identifyOutOfScope(prompt: string, intent: PromptIntent): string[] {
    const outOfScope: string[] = [];

    // Common out-of-scope items by intent
    switch (intent) {
      case 'code-generation':
        outOfScope.push('Deployment and CI/CD configuration');
        outOfScope.push('Production infrastructure setup');
        if (!this.hasSection(prompt, ['test'])) {
          outOfScope.push('Comprehensive test suite (basic tests only)');
        }
        if (!this.hasSection(prompt, ['doc', 'readme'])) {
          outOfScope.push('Extensive documentation');
        }
        break;

      case 'planning':
        outOfScope.push('Actual implementation code');
        outOfScope.push('Detailed technical specifications');
        outOfScope.push('Resource allocation and team assignments');
        break;

      case 'migration':
        outOfScope.push('New feature development');
        outOfScope.push('Performance optimization beyond parity');
        outOfScope.push('Refactoring unrelated code');
        break;

      case 'documentation':
        outOfScope.push('Code implementation changes');
        outOfScope.push('Architectural modifications');
        break;

      case 'prd-generation':
        outOfScope.push('Technical implementation details');
        outOfScope.push('Code or pseudocode');
        outOfScope.push('Database schema design');
        break;
    }

    // Domain-specific exclusions
    if (this.hasSection(prompt, ['frontend', 'ui', 'component'])) {
      if (!this.hasSection(prompt, ['backend', 'api', 'server'])) {
        outOfScope.push('Backend/API implementation');
      }
    }

    if (this.hasSection(prompt, ['backend', 'api', 'server'])) {
      if (!this.hasSection(prompt, ['frontend', 'ui'])) {
        outOfScope.push('Frontend/UI implementation');
      }
    }

    return [...new Set(outOfScope)].slice(0, 5);
  }

  private identifyBoundaries(prompt: string, intent: PromptIntent): string[] {
    const boundaries: string[] = [];

    // Technical boundaries
    if (this.hasSection(prompt, ['component', 'module', 'service'])) {
      boundaries.push('Limited to specified component/module boundaries');
    }

    // Integration boundaries
    if (this.hasSection(prompt, ['integration', 'third-party', 'external'])) {
      boundaries.push('External integrations assumed to be available and configured');
    }

    // Data boundaries
    if (this.hasSection(prompt, ['database', 'data', 'storage'])) {
      boundaries.push('Database schema assumed to exist or specified separately');
    }

    // Auth boundaries
    if (this.hasSection(prompt, ['auth', 'user', 'login'])) {
      boundaries.push('Authentication system assumed to be in place');
    }

    // Intent-specific boundaries
    switch (intent) {
      case 'code-generation':
        boundaries.push('Following existing project conventions and patterns');
        break;
      case 'migration':
        boundaries.push('Maintaining backward compatibility where specified');
        break;
      case 'testing':
        boundaries.push('Testing within unit/integration test scope');
        break;
    }

    return [...new Set(boundaries)].slice(0, 4);
  }

  private formatScopeSection(scope: ScopeDefinition): string {
    const lines = ['### Scope Definition', ''];

    if (scope.inScope.length > 0) {
      lines.push('**In Scope:**');
      scope.inScope.forEach((item) => {
        lines.push(`✓ ${item}`);
      });
      lines.push('');
    }

    if (scope.outOfScope.length > 0) {
      lines.push('**Out of Scope:**');
      scope.outOfScope.forEach((item) => {
        lines.push(`✗ ${item}`);
      });
      lines.push('');
    }

    if (scope.boundaries.length > 0) {
      lines.push('**Boundaries & Assumptions:**');
      scope.boundaries.forEach((item) => {
        lines.push(`• ${item}`);
      });
    }

    return lines.join('\n');
  }
}

interface ScopeDefinition {
  inScope: string[];
  outOfScope: string[];
  boundaries: string[];
}
