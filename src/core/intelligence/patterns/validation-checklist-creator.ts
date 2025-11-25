import { BasePattern } from './base-pattern.js';
import { PromptIntent, PatternContext, PatternResult } from '../types.js';

/**
 * v4.0 Deep Mode Pattern: Validation Checklist Creator
 *
 * Creates implementation validation checklists to ensure
 * comprehensive verification of completed work.
 */
export class ValidationChecklistCreator extends BasePattern {
  id = 'validation-checklist-creator';
  name = 'Validation Checklist Creator';
  description = 'Create implementation validation checklist for verification';
  applicableIntents: PromptIntent[] = [
    'code-generation',
    'testing',
    'migration',
    'security-review',
    'debugging',
  ];
  mode = 'deep' as const;
  priority = 3;

  apply(prompt: string, context: PatternContext): PatternResult {
    const checklist = this.createChecklist(prompt, context.intent.primaryIntent);

    if (checklist.length === 0) {
      return {
        enhancedPrompt: prompt,
        improvement: {
          dimension: 'actionability',
          description: 'No validation checklist needed',
          impact: 'low',
        },
        applied: false,
      };
    }

    // Append checklist section to the prompt
    const checklistSection = this.formatChecklistSection(checklist);
    const enhancedPrompt = `${prompt}\n\n${checklistSection}`;

    return {
      enhancedPrompt,
      improvement: {
        dimension: 'actionability',
        description: `Created validation checklist with ${checklist.length} items`,
        impact: 'high',
      },
      applied: true,
    };
  }

  private createChecklist(prompt: string, intent: PromptIntent): ChecklistItem[] {
    const items: ChecklistItem[] = [];
    const lowerPrompt = prompt.toLowerCase();

    // Intent-specific checklist items
    switch (intent) {
      case 'code-generation':
        items.push(...this.getCodeGenerationChecklist(lowerPrompt));
        break;
      case 'testing':
        items.push(...this.getTestingChecklist(lowerPrompt));
        break;
      case 'migration':
        items.push(...this.getMigrationChecklist(lowerPrompt));
        break;
      case 'security-review':
        items.push(...this.getSecurityChecklist(lowerPrompt));
        break;
      case 'debugging':
        items.push(...this.getDebuggingChecklist(lowerPrompt));
        break;
    }

    // Domain-specific items
    items.push(...this.getDomainChecklist(lowerPrompt));

    // General quality items
    items.push(...this.getGeneralChecklist());

    return items.slice(0, 12); // Max 12 items
  }

  private getCodeGenerationChecklist(_prompt: string): ChecklistItem[] {
    const items: ChecklistItem[] = [
      { description: 'Code compiles/runs without errors', category: 'functionality' },
      { description: 'All requirements from prompt are implemented', category: 'functionality' },
      { description: 'Edge cases are handled gracefully', category: 'robustness' },
    ];

    if (this.hasSection(prompt, ['api', 'endpoint', 'route'])) {
      items.push({ description: 'API returns correct status codes', category: 'functionality' });
      items.push({
        description: 'API handles invalid requests gracefully',
        category: 'robustness',
      });
    }

    if (this.hasSection(prompt, ['ui', 'component', 'form', 'page'])) {
      items.push({ description: 'UI renders correctly on different screen sizes', category: 'ux' });
      items.push({ description: 'Keyboard navigation works correctly', category: 'accessibility' });
    }

    if (this.hasSection(prompt, ['test', 'coverage'])) {
      items.push({ description: 'Unit tests pass', category: 'testing' });
      items.push({ description: 'Test coverage meets requirements', category: 'testing' });
    }

    return items;
  }

  private getTestingChecklist(_prompt: string): ChecklistItem[] {
    return [
      { description: 'All test cases pass consistently', category: 'functionality' },
      { description: 'Tests are independent (no shared state)', category: 'quality' },
      { description: 'Edge cases have dedicated tests', category: 'coverage' },
      { description: 'Error scenarios are tested', category: 'coverage' },
      { description: 'Tests run in reasonable time', category: 'performance' },
      { description: 'Test names clearly describe what they test', category: 'maintainability' },
      { description: 'Mocks/stubs are appropriately scoped', category: 'quality' },
    ];
  }

  private getMigrationChecklist(_prompt: string): ChecklistItem[] {
    return [
      { description: 'Data migrated correctly (spot check sample records)', category: 'data' },
      { description: 'All functionality works in new system', category: 'functionality' },
      { description: 'Performance is acceptable (equal or better)', category: 'performance' },
      { description: 'Rollback procedure tested and documented', category: 'safety' },
      { description: 'No data loss during migration', category: 'data' },
      { description: 'Integrations with other systems still work', category: 'integration' },
      { description: 'Users can perform all previous workflows', category: 'functionality' },
    ];
  }

  private getSecurityChecklist(_prompt: string): ChecklistItem[] {
    return [
      { description: 'Authentication required for protected resources', category: 'auth' },
      { description: 'Authorization checks prevent privilege escalation', category: 'auth' },
      { description: 'User input is sanitized (no injection vulnerabilities)', category: 'input' },
      { description: 'Sensitive data is encrypted in transit (HTTPS)', category: 'data' },
      { description: 'Sensitive data is encrypted at rest', category: 'data' },
      {
        description: "Error messages don't leak sensitive information",
        category: 'info-disclosure',
      },
      { description: 'Rate limiting prevents abuse', category: 'protection' },
      { description: 'Security headers are properly configured', category: 'headers' },
    ];
  }

  private getDebuggingChecklist(_prompt: string): ChecklistItem[] {
    return [
      { description: 'Root cause identified and documented', category: 'analysis' },
      { description: 'Bug is consistently reproducible before fix', category: 'verification' },
      { description: 'Fix resolves the original issue', category: 'functionality' },
      { description: "Fix doesn't introduce new bugs (regression)", category: 'regression' },
      { description: 'Related areas tested for side effects', category: 'regression' },
      { description: 'Test added to prevent recurrence', category: 'prevention' },
    ];
  }

  private getDomainChecklist(_prompt: string): ChecklistItem[] {
    const items: ChecklistItem[] = [];

    if (this.hasSection(prompt, ['payment', 'transaction', 'checkout'])) {
      items.push({ description: 'Payment processing works correctly', category: 'functionality' });
      items.push({ description: 'Duplicate transactions prevented', category: 'safety' });
    }

    if (this.hasSection(prompt, ['email', 'notification', 'message'])) {
      items.push({
        description: 'Notifications sent to correct recipients',
        category: 'functionality',
      });
      items.push({ description: 'Notification content is correct', category: 'content' });
    }

    if (this.hasSection(prompt, ['upload', 'file', 'image'])) {
      items.push({ description: 'File uploads work for valid files', category: 'functionality' });
      items.push({
        description: 'Invalid/large files are rejected gracefully',
        category: 'validation',
      });
    }

    if (this.hasSection(prompt, ['database', 'db', 'query', 'schema'])) {
      items.push({ description: 'Database queries perform well', category: 'performance' });
      items.push({ description: 'Database constraints are enforced', category: 'data' });
    }

    return items;
  }

  private getGeneralChecklist(): ChecklistItem[] {
    return [
      { description: 'Code follows project conventions/style guide', category: 'quality' },
      { description: 'No console errors or warnings', category: 'quality' },
      { description: 'Documentation updated if needed', category: 'documentation' },
    ];
  }

  private formatChecklistSection(items: ChecklistItem[]): string {
    const lines = [
      '### Validation Checklist',
      '',
      'Before considering this task complete, verify:',
    ];

    // Group by category
    const byCategory = new Map<string, ChecklistItem[]>();
    items.forEach((item) => {
      const existing = byCategory.get(item.category) || [];
      existing.push(item);
      byCategory.set(item.category, existing);
    });

    // Format grouped items
    if (byCategory.size > 3) {
      // If many categories, group them
      byCategory.forEach((categoryItems, category) => {
        lines.push('');
        lines.push(`**${this.formatCategory(category)}:**`);
        categoryItems.forEach((item) => {
          lines.push(`☐ ${item.description}`);
        });
      });
    } else {
      // Simple list for fewer categories
      lines.push('');
      items.forEach((item) => {
        lines.push(`☐ ${item.description}`);
      });
    }

    return lines.join('\n');
  }

  private formatCategory(category: string): string {
    return category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, ' ');
  }
}

interface ChecklistItem {
  description: string;
  category: string;
}
