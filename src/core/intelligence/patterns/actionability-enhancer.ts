import { BasePattern } from './base-pattern.js';
import { PatternContext, PatternResult, PromptIntent } from '../types.js';

/**
 * Actionability Enhancer Pattern
 *
 * Converts vague goals into specific, actionable tasks.
 * Replaces abstract language with concrete requirements.
 *
 * Priority: HIGH (7)
 */
export class ActionabilityEnhancer extends BasePattern {
  id = 'actionability-enhancer';
  name = 'Actionability Enhancer';
  description = 'Converts vague goals into specific, actionable tasks';
  applicableIntents: PromptIntent[] = ['code-generation', 'planning', 'refinement', 'debugging'];
  mode: 'fast' | 'deep' | 'both' = 'both';
  priority = 7; // High priority

  private readonly VAGUE_WORDS: Record<string, string[]> = {
    better: ['faster', 'more efficient', 'more reliable', 'more maintainable'],
    improve: [
      'optimize performance',
      'enhance user experience',
      'increase reliability',
      'refactor for clarity',
    ],
    good: ['high-performing', 'user-friendly', 'maintainable', 'secure'],
    nice: ['polished', 'intuitive', 'responsive', 'accessible'],
    fast: ['< 100ms response time', '< 2s load time', 'under 500ms', 'high-performance'],
    slow: ['> 2s load time', 'laggy', 'delayed response', 'poor performance'],
    something: ['[specify what]', '[component/feature/function]', '[define requirement]'],
    somehow: ['[specify method]', '[define approach]', '[explain how]'],
    maybe: ['[decide: yes/no]', '[clarify requirement]', '[confirm if needed]'],
    enhance: ['add features to', 'improve functionality of', 'extend capabilities of'],
    fix: ['resolve bug in', 'correct error in', 'debug issue with'],
    update: ['modify', 'change', 'revise', 'upgrade'],
  };

  apply(prompt: string, _context: PatternContext): PatternResult {
    let enhanced = prompt;
    let changesCount = 0;

    // Replace vague words with specific alternatives
    const afterVague = this.replaceVagueWords(enhanced);
    if (afterVague !== enhanced) changesCount++;
    enhanced = afterVague;

    // Add measurable criteria where missing
    const afterMeasurable = this.addMeasurableCriteria(enhanced);
    if (afterMeasurable !== enhanced) changesCount++;
    enhanced = afterMeasurable;

    // Convert abstract goals to concrete tasks
    const afterConcrete = this.concretizeGoals(enhanced);
    if (afterConcrete !== enhanced) changesCount++;
    enhanced = afterConcrete;

    return {
      enhancedPrompt: enhanced,
      improvement: {
        dimension: 'actionability',
        description: `Made ${changesCount} improvements to increase specificity`,
        impact: changesCount >= 3 ? 'high' : changesCount >= 2 ? 'medium' : 'low',
      },
      applied: enhanced !== prompt,
    };
  }

  private detectVagueWords(prompt: string): string[] {
    const found: string[] = [];

    for (const vague of Object.keys(this.VAGUE_WORDS)) {
      // Match whole words only
      const regex = new RegExp(`\\b${vague}\\b`, 'gi');
      if (regex.test(prompt)) {
        found.push(vague);
      }
    }

    return found;
  }

  private hasAbstractGoals(prompt: string): boolean {
    const abstractPatterns = [
      /make\s+it\s+\w+/i, // "make it better"
      /should\s+be\s+\w+/i, // "should be nice"
      /want\s+it\s+to\s+be\s+\w+/i, // "want it to be good"
      /more\s+\w+/i, // "more efficient"
      /less\s+\w+/i, // "less complex"
    ];

    return abstractPatterns.some((pattern) => pattern.test(prompt));
  }

  private replaceVagueWords(prompt: string): string {
    let enhanced = prompt;

    for (const [vague, alternatives] of Object.entries(this.VAGUE_WORDS)) {
      const regex = new RegExp(`\\b${vague}\\b`, 'gi');

      if (regex.test(enhanced)) {
        // For user-facing vague words, add clarifying question
        if (['something', 'somehow', 'maybe'].includes(vague.toLowerCase())) {
          enhanced = enhanced.replace(regex, (match) => {
            return `${match} ${alternatives[0]}`;
          });
        } else {
          // For quality adjectives, suggest specific alternatives
          const suggestion = alternatives[0];
          enhanced = enhanced.replace(regex, (match) => {
            return `${match} (e.g., ${suggestion})`;
          });
        }
      }
    }

    return enhanced;
  }

  private addMeasurableCriteria(prompt: string): string {
    const needsMeasurement = [
      { pattern: /\bfast(?:er)?\b/gi, suggestion: ' (specify: < 100ms, < 1s, etc.)' },
      { pattern: /\bslow(?:er)?\b/gi, suggestion: ' (specify: > 2s, > 5s, etc.)' },
      { pattern: /\befficient\b/gi, suggestion: ' (specify metrics: time, memory, CPU)' },
      { pattern: /\bscalable\b/gi, suggestion: ' (specify: handle 1K, 10K, 100K users)' },
      { pattern: /\breliable\b/gi, suggestion: ' (specify: 99.9% uptime, < 0.1% error rate)' },
      { pattern: /\bsecure\b/gi, suggestion: ' (specify: HTTPS, auth required, encrypted)' },
    ];

    let enhanced = prompt;

    for (const { pattern, suggestion } of needsMeasurement) {
      if (pattern.test(enhanced)) {
        // Only add if not already specific
        if (!this.hasSpecificMetric(enhanced)) {
          enhanced = enhanced.replace(pattern, (match) => match + suggestion);
        }
      }
    }

    return enhanced;
  }

  private hasSpecificMetric(prompt: string): boolean {
    const metricPatterns = [
      /\d+\s*(?:ms|s|min|hours?)/i, // Time metrics
      /\d+\s*(?:kb|mb|gb)/i, // Size metrics
      /\d+\s*(?:%|percent)/i, // Percentage
      /<?>\s*\d+/i, // Comparison operators
      /\d+k?\s*(?:users?|requests?)/i, // Scale metrics
    ];

    return metricPatterns.some((pattern) => pattern.test(prompt));
  }

  private concretizeGoals(prompt: string): string {
    const abstractPatterns: Array<{ pattern: RegExp; replacement: string }> = [
      {
        pattern: /make\s+it\s+better/gi,
        replacement: 'improve by [specify: performance, UX, reliability, etc.]',
      },
      {
        pattern: /should\s+be\s+nice/gi,
        replacement: 'should have [specify: polished UI, intuitive UX, etc.]',
      },
      {
        pattern: /want\s+it\s+to\s+be\s+good/gi,
        replacement: 'should meet [specify: quality standards, performance targets, etc.]',
      },
      {
        pattern: /more\s+efficient/gi,
        replacement: 'more efficient (reduce time/memory/CPU by [X%])',
      },
      {
        pattern: /less\s+complex/gi,
        replacement: 'less complex (reduce from [X] to [Y] components/lines/dependencies)',
      },
    ];

    let enhanced = prompt;

    for (const { pattern, replacement } of abstractPatterns) {
      enhanced = enhanced.replace(pattern, replacement);
    }

    return enhanced;
  }
}
