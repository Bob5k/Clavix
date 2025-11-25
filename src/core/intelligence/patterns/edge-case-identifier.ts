import { BasePattern } from './base-pattern.js';
import { PromptIntent, PatternContext, PatternResult } from '../types.js';

/**
 * v4.0 Deep Mode Pattern: Edge Case Identifier
 *
 * Identifies potential edge cases by domain/intent to ensure
 * comprehensive requirement coverage.
 */
export class EdgeCaseIdentifier extends BasePattern {
  id = 'edge-case-identifier';
  name = 'Edge Case Identifier';
  description = 'Identify potential edge cases and failure modes by domain';
  applicableIntents: PromptIntent[] = [
    'code-generation',
    'debugging',
    'testing',
    'migration',
    'security-review',
  ];
  mode = 'deep' as const;
  priority = 4;

  apply(prompt: string, context: PatternContext): PatternResult {
    const edgeCases = this.identifyEdgeCases(prompt, context.intent.primaryIntent);

    if (edgeCases.length === 0) {
      return {
        enhancedPrompt: prompt,
        improvement: {
          dimension: 'completeness',
          description: 'No edge cases identified',
          impact: 'low',
        },
        applied: false,
      };
    }

    // Append edge cases section to the prompt
    const edgeCasesSection = this.formatEdgeCasesSection(edgeCases);
    const enhancedPrompt = `${prompt}\n\n${edgeCasesSection}`;

    return {
      enhancedPrompt,
      improvement: {
        dimension: 'completeness',
        description: `Identified ${edgeCases.length} potential edge cases`,
        impact: 'high',
      },
      applied: true,
    };
  }

  private identifyEdgeCases(prompt: string, intent: PromptIntent): EdgeCase[] {
    const edgeCases: EdgeCase[] = [];
    const lowerPrompt = prompt.toLowerCase();

    // General edge cases for any intent
    edgeCases.push(...this.getGeneralEdgeCases(lowerPrompt));

    // Intent-specific edge cases
    switch (intent) {
      case 'code-generation':
        edgeCases.push(...this.getCodeGenerationEdgeCases(lowerPrompt));
        break;
      case 'debugging':
        edgeCases.push(...this.getDebuggingEdgeCases(lowerPrompt));
        break;
      case 'testing':
        edgeCases.push(...this.getTestingEdgeCases(lowerPrompt));
        break;
      case 'migration':
        edgeCases.push(...this.getMigrationEdgeCases(lowerPrompt));
        break;
      case 'security-review':
        edgeCases.push(...this.getSecurityEdgeCases(lowerPrompt));
        break;
    }

    // Domain-specific edge cases based on keywords
    edgeCases.push(...this.getDomainEdgeCases(lowerPrompt));

    // Deduplicate and limit
    const uniqueEdgeCases = this.deduplicateEdgeCases(edgeCases);
    return uniqueEdgeCases.slice(0, 8); // Max 8 edge cases
  }

  private getGeneralEdgeCases(_prompt: string): EdgeCase[] {
    const cases: EdgeCase[] = [];

    // Input validation edge cases
    if (this.hasSection(prompt, ['input', 'data', 'form', 'field'])) {
      cases.push({
        scenario: 'Empty or null inputs',
        consideration: 'How should the system handle missing or undefined values?',
      });
      cases.push({
        scenario: 'Invalid input types',
        consideration: 'What happens if input is wrong type (string vs number)?',
      });
    }

    // Error handling
    if (this.hasSection(prompt, ['api', 'request', 'fetch', 'call'])) {
      cases.push({
        scenario: 'Network failures',
        consideration: 'How to handle timeouts, connection errors, and retries?',
      });
    }

    return cases;
  }

  private getCodeGenerationEdgeCases(_prompt: string): EdgeCase[] {
    const cases: EdgeCase[] = [];

    cases.push({
      scenario: 'Boundary conditions',
      consideration: 'What happens at min/max values, empty collections, or single items?',
    });

    if (this.hasSection(prompt, ['list', 'array', 'collection'])) {
      cases.push({
        scenario: 'Empty collections',
        consideration: 'How to handle arrays/lists with 0 or 1 elements?',
      });
    }

    if (this.hasSection(prompt, ['user', 'auth', 'login', 'session'])) {
      cases.push({
        scenario: 'Session expiration',
        consideration: 'What happens when user session expires mid-operation?',
      });
    }

    if (this.hasSection(prompt, ['concurrent', 'parallel', 'async'])) {
      cases.push({
        scenario: 'Race conditions',
        consideration: 'What if multiple operations access shared state simultaneously?',
      });
    }

    return cases;
  }

  private getDebuggingEdgeCases(_prompt: string): EdgeCase[] {
    return [
      {
        scenario: 'Intermittent failures',
        consideration: 'Can you reproduce the bug consistently? What conditions affect it?',
      },
      {
        scenario: 'Environment differences',
        consideration: 'Does it only happen in certain environments (dev/prod/test)?',
      },
      {
        scenario: 'Data-dependent bugs',
        consideration: 'Does specific data or data volume trigger the issue?',
      },
    ];
  }

  private getTestingEdgeCases(_prompt: string): EdgeCase[] {
    return [
      {
        scenario: 'Test isolation',
        consideration: 'Are tests independent or do they share state/data?',
      },
      {
        scenario: 'Flaky tests',
        consideration: 'Are there timing-dependent tests that may fail intermittently?',
      },
      {
        scenario: 'Mock boundaries',
        consideration: 'Are mocks accurately representing real dependencies?',
      },
    ];
  }

  private getMigrationEdgeCases(_prompt: string): EdgeCase[] {
    return [
      {
        scenario: 'Data incompatibility',
        consideration: 'Can all existing data be converted to new format?',
      },
      {
        scenario: 'Rollback strategy',
        consideration: 'How to revert if migration fails midway?',
      },
      {
        scenario: 'Feature parity gaps',
        consideration: 'Are there features in old system not supported in new?',
      },
      {
        scenario: 'Downtime requirements',
        consideration: 'What is acceptable downtime during migration?',
      },
    ];
  }

  private getSecurityEdgeCases(_prompt: string): EdgeCase[] {
    return [
      {
        scenario: 'Authentication bypass',
        consideration: 'Can attackers access resources without proper credentials?',
      },
      {
        scenario: 'Privilege escalation',
        consideration: "Can users gain access to resources they shouldn't have?",
      },
      {
        scenario: 'Input injection',
        consideration: 'Is user input properly sanitized before use (SQL, XSS, command)?',
      },
      {
        scenario: 'Sensitive data exposure',
        consideration: 'Is sensitive data encrypted in transit and at rest?',
      },
    ];
  }

  private getDomainEdgeCases(_prompt: string): EdgeCase[] {
    const cases: EdgeCase[] = [];

    // Payment/financial domain
    if (this.hasSection(prompt, ['payment', 'transaction', 'money', 'price', 'cart'])) {
      cases.push({
        scenario: 'Duplicate transactions',
        consideration: 'How to prevent accidental double charges?',
      });
      cases.push({
        scenario: 'Currency/rounding issues',
        consideration: 'How to handle different currencies and decimal precision?',
      });
    }

    // File handling domain
    if (this.hasSection(prompt, ['file', 'upload', 'download', 'image', 'document'])) {
      cases.push({
        scenario: 'Large files',
        consideration: 'What are size limits? How to handle files that exceed limits?',
      });
      cases.push({
        scenario: 'Malicious files',
        consideration: 'How to validate file types and scan for malware?',
      });
    }

    // Date/time domain
    if (this.hasSection(prompt, ['date', 'time', 'schedule', 'calendar', 'timezone'])) {
      cases.push({
        scenario: 'Timezone handling',
        consideration: 'How to handle users in different timezones?',
      });
      cases.push({
        scenario: 'Date boundaries',
        consideration: 'What about daylight saving, leap years, month boundaries?',
      });
    }

    return cases;
  }

  private deduplicateEdgeCases(cases: EdgeCase[]): EdgeCase[] {
    const seen = new Set<string>();
    return cases.filter((c) => {
      const key = c.scenario.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  private formatEdgeCasesSection(edgeCases: EdgeCase[]): string {
    const lines = ['### Edge Cases to Consider', ''];

    edgeCases.forEach((ec) => {
      lines.push(`• **${ec.scenario}**: ${ec.consideration}`);
    });

    return lines.join('\n');
  }
}

interface EdgeCase {
  scenario: string;
  consideration: string;
}
