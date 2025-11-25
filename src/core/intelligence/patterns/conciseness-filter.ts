import { BasePattern } from './base-pattern.js';
import { PatternContext, PatternResult, PromptIntent } from '../types.js';

export class ConcisenessFilter extends BasePattern {
  id = 'conciseness-filter';
  name = 'Conciseness Filter';
  description = 'Removes unnecessary pleasantries, fluff words, and redundancy';
  applicableIntents: PromptIntent[] = [
    'code-generation',
    'planning',
    'refinement',
    'debugging',
    'documentation',
  ];
  mode: 'fast' | 'deep' | 'both' = 'both';
  priority = 10; // High priority - run early

  apply(prompt: string, _context: PatternContext): PatternResult {
    let cleaned = prompt;
    let changesCount = 0;

    // Remove pleasantries at start
    const pleasantries = [
      /^(please|could you|would you mind|I would appreciate if you could|kindly)\s+/gi,
      /thank you/gi,
      /thanks in advance/gi,
      /I appreciate your help/gi,
    ];

    for (const pattern of pleasantries) {
      const before = cleaned;
      cleaned = cleaned.replace(pattern, '');
      if (before !== cleaned) changesCount++;
    }

    // Remove fluff words
    const fluffWords = ['very', 'really', 'just', 'basically', 'simply', 'actually', 'literally'];
    for (const word of fluffWords) {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      const before = cleaned;
      cleaned = cleaned.replace(regex, '');
      if (before !== cleaned) changesCount++;
    }

    // Remove redundant phrases
    cleaned = cleaned.replace(/in order to/gi, 'to');
    cleaned = cleaned.replace(/at this point in time/gi, 'now');
    cleaned = cleaned.replace(/due to the fact that/gi, 'because');
    cleaned = cleaned.replace(/for the purpose of/gi, 'for');
    cleaned = cleaned.replace(/in the event that/gi, 'if');

    // Clean up extra whitespace
    cleaned = this.cleanWhitespace(cleaned);

    const applied = changesCount > 0 || cleaned !== prompt;

    return {
      enhancedPrompt: cleaned,
      improvement: {
        dimension: 'efficiency',
        description: `Removed ${changesCount} unnecessary phrases for conciseness`,
        impact: changesCount > 3 ? 'high' : changesCount > 1 ? 'medium' : 'low',
      },
      applied,
    };
  }
}
