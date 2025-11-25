import { BasePattern } from './base-pattern.js';
import { PatternContext, PatternResult, PromptIntent } from '../types.js';

/**
 * Completeness Validator Pattern
 *
 * Ensures all necessary requirements are present.
 * Adds placeholder sections for missing critical elements.
 *
 * Priority: MEDIUM (6)
 */
export class CompletenessValidator extends BasePattern {
  id = 'completeness-validator';
  name = 'Completeness Validator';
  description = 'Ensures all necessary requirements are present';
  applicableIntents: PromptIntent[] = ['code-generation', 'planning', 'refinement'];
  mode: 'fast' | 'deep' | 'both' = 'both';
  priority = 6; // Medium priority

  apply(prompt: string, _context: PatternContext): PatternResult {
    const missing = this.findMissingElements(prompt);

    if (missing.length === 0) {
      return {
        enhancedPrompt: prompt,
        improvement: {
          dimension: 'completeness',
          description: 'All required elements present',
          impact: 'low',
        },
        applied: false,
      };
    }

    // Calculate completeness score
    const totalElements = 5;
    const presentElements = totalElements - missing.length;
    const score = Math.round((presentElements / totalElements) * 100);

    let enhanced = prompt + '\n\n';

    // Add missing elements section
    enhanced += '---\n\n';
    enhanced += `**Completeness Check**: ${score}% (${presentElements}/${totalElements} elements present)\n\n`;
    enhanced += '**Missing Information** (please specify):\n\n';

    for (const element of missing) {
      enhanced += this.getMissingElementPrompt(element) + '\n';
    }

    const result = enhanced.trim();

    return {
      enhancedPrompt: result,
      improvement: {
        dimension: 'completeness',
        description: `Added ${missing.length} missing element prompts (${score}% complete)`,
        impact: missing.length >= 3 ? 'high' : missing.length >= 2 ? 'medium' : 'low',
      },
      applied: true,
    };
  }

  private findMissingElements(prompt: string): string[] {
    const missing: string[] = [];
    const lowerPrompt = prompt.toLowerCase();

    // Check for objective/goal
    if (!this.hasObjective(lowerPrompt)) {
      missing.push('objective');
    }

    // Check for tech stack
    if (!this.hasTechStack(lowerPrompt)) {
      missing.push('tech-stack');
    }

    // Check for success criteria
    if (!this.hasSuccessCriteria(lowerPrompt)) {
      missing.push('success-criteria');
    }

    // Check for constraints
    if (!this.hasConstraints(lowerPrompt)) {
      missing.push('constraints');
    }

    // Check for output format
    if (!this.hasOutputFormat(lowerPrompt)) {
      missing.push('output-format');
    }

    return missing;
  }

  private hasObjective(prompt: string): boolean {
    const objectivePatterns = [
      'objective',
      'goal',
      'purpose',
      'need to',
      'want to',
      'trying to',
      'aim',
      'intend',
    ];

    return objectivePatterns.some((pattern) => prompt.includes(pattern));
  }

  private hasTechStack(prompt: string): boolean {
    const techPatterns = [
      // Languages
      'javascript',
      'typescript',
      'python',
      'java',
      'rust',
      'go',
      'php',
      'ruby',
      'swift',
      'kotlin',
      'c++',
      'c#',
      // Frameworks
      'react',
      'vue',
      'angular',
      'svelte',
      'next',
      'nuxt',
      'express',
      'fastapi',
      'django',
      'flask',
      'spring',
      'rails',
      // Databases
      'postgres',
      'mysql',
      'mongodb',
      'redis',
      'sqlite',
      // Tools
      'docker',
      'kubernetes',
      'aws',
      'azure',
      'gcp',
      // Generic
      'tech stack',
      'technology',
      'framework',
      'library',
      'using',
      'built with',
    ];

    return techPatterns.some((pattern) => prompt.includes(pattern));
  }

  private hasSuccessCriteria(prompt: string): boolean {
    const successPatterns = [
      'success',
      'criteria',
      'measure',
      'metric',
      'kpi',
      'should work',
      'expected to',
      'result in',
      'achieve',
    ];

    return successPatterns.some((pattern) => prompt.includes(pattern));
  }

  private hasConstraints(prompt: string): boolean {
    const constraintPatterns = [
      'constraint',
      'limit',
      'limitation',
      'must not',
      'cannot',
      'should not',
      'avoid',
      'within',
      'budget',
      'time',
      'deadline',
    ];

    return constraintPatterns.some((pattern) => prompt.includes(pattern));
  }

  private hasOutputFormat(prompt: string): boolean {
    const outputPatterns = [
      'output',
      'format',
      'return',
      'result',
      'deliverable',
      'component',
      'function',
      'class',
      'api',
      'endpoint',
      'file',
      'document',
      'report',
    ];

    return outputPatterns.some((pattern) => prompt.includes(pattern));
  }

  private getMissingElementPrompt(element: string): string {
    const prompts: Record<string, string> = {
      objective: '- **Objective**: What is the primary goal? What problem are you solving?',
      'tech-stack':
        '- **Tech Stack**: Which technologies/frameworks? (e.g., React, Node.js, PostgreSQL)',
      'success-criteria':
        '- **Success Criteria**: How will you know it works? What metrics matter?',
      constraints: '- **Constraints**: Any limitations? (time, budget, performance, compatibility)',
      'output-format':
        '- **Expected Output**: What should the result look like? (component, API, file, etc.)',
    };

    return prompts[element] || `- **${element}**: Please specify`;
  }
}
