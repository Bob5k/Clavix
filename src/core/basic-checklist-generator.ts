/**
 * Clavix v4.8: Basic Checklist Generator
 *
 * Generates basic verification checklists for fast mode prompts
 * that don't have comprehensive checklists from deep mode.
 */

import { PromptIntent } from './intelligence/types.js';
import { ChecklistItem, VerificationType, ParsedChecklist } from '../types/verification.js';

/**
 * Intent-specific checklist templates
 */
const INTENT_CHECKLISTS: Record<
  PromptIntent,
  Array<{
    content: string;
    group?: string;
    verificationType: VerificationType;
  }>
> = {
  'code-generation': [
    {
      content: 'Code compiles/runs without errors',
      group: 'Functionality',
      verificationType: 'automated',
    },
    {
      content: 'All requirements from prompt are implemented',
      group: 'Functionality',
      verificationType: 'manual',
    },
    {
      content: 'No console errors or warnings',
      group: 'Quality',
      verificationType: 'semi-automated',
    },
    {
      content: 'Code follows project conventions',
      group: 'Quality',
      verificationType: 'automated',
    },
  ],
  testing: [
    {
      content: 'All tests pass',
      group: 'Functionality',
      verificationType: 'automated',
    },
    {
      content: 'Test coverage is acceptable',
      group: 'Coverage',
      verificationType: 'automated',
    },
    {
      content: 'Edge cases are tested',
      group: 'Coverage',
      verificationType: 'manual',
    },
    {
      content: 'Tests are independent (no shared state)',
      group: 'Quality',
      verificationType: 'manual',
    },
  ],
  debugging: [
    {
      content: 'Bug is fixed',
      group: 'Functionality',
      verificationType: 'manual',
    },
    {
      content: 'No regression introduced',
      group: 'Regression',
      verificationType: 'automated',
    },
    {
      content: 'Root cause is addressed',
      group: 'Analysis',
      verificationType: 'manual',
    },
    {
      content: 'Related areas tested for side effects',
      group: 'Regression',
      verificationType: 'manual',
    },
  ],
  'security-review': [
    {
      content: 'Authentication is verified',
      group: 'Auth',
      verificationType: 'manual',
    },
    {
      content: 'Input is properly sanitized',
      group: 'Input',
      verificationType: 'manual',
    },
    {
      content: 'Sensitive data is protected',
      group: 'Data',
      verificationType: 'manual',
    },
    {
      content: 'No known vulnerabilities',
      group: 'Security',
      verificationType: 'manual',
    },
  ],
  refinement: [
    {
      content: 'Improvement is implemented',
      group: 'Functionality',
      verificationType: 'manual',
    },
    {
      content: 'No functionality regression',
      group: 'Regression',
      verificationType: 'automated',
    },
    {
      content: 'Performance is not degraded',
      group: 'Performance',
      verificationType: 'manual',
    },
    {
      content: 'Code quality is maintained',
      group: 'Quality',
      verificationType: 'automated',
    },
  ],
  planning: [
    {
      content: 'Plan is clear and actionable',
      group: 'Clarity',
      verificationType: 'manual',
    },
    {
      content: 'All requirements are addressed',
      group: 'Completeness',
      verificationType: 'manual',
    },
    {
      content: 'Risks are identified',
      group: 'Risk',
      verificationType: 'manual',
    },
  ],
  documentation: [
    {
      content: 'Documentation is accurate',
      group: 'Accuracy',
      verificationType: 'manual',
    },
    {
      content: 'Examples are correct and work',
      group: 'Accuracy',
      verificationType: 'manual',
    },
    {
      content: 'Documentation is complete',
      group: 'Completeness',
      verificationType: 'manual',
    },
  ],
  migration: [
    {
      content: 'Migration completes successfully',
      group: 'Functionality',
      verificationType: 'manual',
    },
    {
      content: 'Data integrity is preserved',
      group: 'Data',
      verificationType: 'manual',
    },
    {
      content: 'All features work post-migration',
      group: 'Functionality',
      verificationType: 'manual',
    },
    {
      content: 'Rollback plan is tested',
      group: 'Safety',
      verificationType: 'manual',
    },
  ],
  learning: [
    {
      content: 'Concept is understood',
      group: 'Understanding',
      verificationType: 'manual',
    },
    {
      content: 'Examples are working',
      group: 'Practice',
      verificationType: 'manual',
    },
  ],
  'prd-generation': [
    {
      content: 'PRD covers all requirements',
      group: 'Completeness',
      verificationType: 'manual',
    },
    {
      content: 'Success criteria are defined',
      group: 'Clarity',
      verificationType: 'manual',
    },
  ],
  summarization: [
    {
      content: 'Summary captures key points',
      group: 'Accuracy',
      verificationType: 'manual',
    },
    {
      content: 'No important details omitted',
      group: 'Completeness',
      verificationType: 'manual',
    },
  ],
};

/**
 * Default checklist for unknown intents
 */
const DEFAULT_CHECKLIST: Array<{
  content: string;
  group?: string;
  verificationType: VerificationType;
}> = [
  {
    content: 'Task is completed successfully',
    group: 'Functionality',
    verificationType: 'manual',
  },
  {
    content: 'No errors or warnings',
    group: 'Quality',
    verificationType: 'semi-automated',
  },
  {
    content: 'Output meets requirements',
    group: 'Functionality',
    verificationType: 'manual',
  },
];

/**
 * Basic Checklist Generator
 */
export class BasicChecklistGenerator {
  /**
   * Generate a basic checklist based on intent
   */
  generate(intent: PromptIntent): ParsedChecklist {
    const template = INTENT_CHECKLISTS[intent] || DEFAULT_CHECKLIST;

    const validationItems: ChecklistItem[] = template.map((item, index) => ({
      id: `generated-${index + 1}`,
      category: 'validation',
      content: item.content,
      group: item.group,
      verificationType: item.verificationType,
    }));

    return {
      validationItems,
      edgeCases: [],
      risks: [],
      hasChecklist: validationItems.length > 0,
      totalItems: validationItems.length,
    };
  }

  /**
   * Generate checklist for a specific prompt content
   * Detects additional items based on prompt keywords
   */
  generateFromPrompt(content: string, intent: PromptIntent): ParsedChecklist {
    const baseChecklist = this.generate(intent);
    const additionalItems: ChecklistItem[] = [];
    const lowerContent = content.toLowerCase();
    let itemIndex = baseChecklist.validationItems.length;

    // API-related checks
    if (this.hasKeywords(lowerContent, ['api', 'endpoint', 'route', 'rest', 'graphql'])) {
      additionalItems.push({
        id: `generated-${++itemIndex}`,
        category: 'validation',
        content: 'API endpoints return correct responses',
        group: 'API',
        verificationType: 'manual',
      });
    }

    // UI-related checks
    if (this.hasKeywords(lowerContent, ['ui', 'component', 'form', 'page', 'button'])) {
      additionalItems.push({
        id: `generated-${++itemIndex}`,
        category: 'validation',
        content: 'UI renders correctly',
        group: 'UI',
        verificationType: 'semi-automated',
      });
    }

    // Database-related checks
    if (this.hasKeywords(lowerContent, ['database', 'db', 'query', 'schema', 'migration'])) {
      additionalItems.push({
        id: `generated-${++itemIndex}`,
        category: 'validation',
        content: 'Database operations work correctly',
        group: 'Data',
        verificationType: 'manual',
      });
    }

    // Auth-related checks
    if (this.hasKeywords(lowerContent, ['auth', 'login', 'session', 'token', 'permission'])) {
      additionalItems.push({
        id: `generated-${++itemIndex}`,
        category: 'validation',
        content: 'Authentication/authorization works correctly',
        group: 'Security',
        verificationType: 'manual',
      });
    }

    // Performance-related checks
    if (this.hasKeywords(lowerContent, ['performance', 'optimize', 'speed', 'fast', 'slow'])) {
      additionalItems.push({
        id: `generated-${++itemIndex}`,
        category: 'validation',
        content: 'Performance is acceptable',
        group: 'Performance',
        verificationType: 'manual',
      });
    }

    return {
      validationItems: [...baseChecklist.validationItems, ...additionalItems],
      edgeCases: baseChecklist.edgeCases,
      risks: baseChecklist.risks,
      hasChecklist: true,
      totalItems: baseChecklist.validationItems.length + additionalItems.length,
    };
  }

  /**
   * Check if content contains any of the keywords
   */
  private hasKeywords(content: string, keywords: string[]): boolean {
    return keywords.some((kw) => content.includes(kw));
  }

  /**
   * Get available intents
   */
  getAvailableIntents(): PromptIntent[] {
    return Object.keys(INTENT_CHECKLISTS) as PromptIntent[];
  }

  /**
   * Check if intent has a specific checklist
   */
  hasChecklistForIntent(intent: PromptIntent): boolean {
    return intent in INTENT_CHECKLISTS;
  }
}
