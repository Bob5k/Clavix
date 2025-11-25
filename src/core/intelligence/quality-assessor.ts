import { IntentAnalysis, QualityMetrics, PromptIntent } from './types.js';

export class QualityAssessor {
  // v4.0: Intent-specific completeness requirements
  private readonly COMPLETENESS_REQUIREMENTS: Record<PromptIntent, string[]> = {
    'code-generation': ['objective', 'tech-stack', 'output-format', 'integration-points'],
    debugging: ['error-message', 'expected-behavior', 'actual-behavior', 'reproduction-steps'],
    testing: ['test-type', 'coverage-scope', 'edge-cases', 'mocking-needs'],
    migration: ['source-version', 'target-version', 'data-considerations', 'breaking-changes'],
    planning: ['problem-statement', 'goals', 'constraints', 'timeline'],
    refinement: ['current-state', 'desired-improvement', 'metrics', 'constraints'],
    documentation: ['audience', 'scope', 'format', 'examples-needed'],
    'security-review': ['scope', 'threat-model', 'compliance-requirements', 'known-issues'],
    learning: ['current-knowledge', 'learning-goal', 'preferred-depth', 'context'],
    'prd-generation': ['product-vision', 'user-personas', 'features', 'success-metrics'],
  };
  /**
   * Assess quality of a prompt (backward compatibility wrapper)
   * @deprecated Use assess() method instead for full quality metrics
   * v4.0: Now includes specificity in return type
   */
  assessQuality(
    prompt: string,
    intent: string
  ): {
    clarity: number;
    efficiency: number;
    structure: number;
    completeness: number;
    actionability: number;
    specificity: number;
    overall: number;
  } {
    // Create minimal IntentAnalysis from string intent
    const intentAnalysis: IntentAnalysis = {
      primaryIntent: intent as PromptIntent,
      confidence: 100,
      characteristics: {
        hasCodeContext: false,
        hasTechnicalTerms: false,
        isOpenEnded: false,
        needsStructure: false,
      },
    };

    // Call existing assess method with same prompt for both original and enhanced
    const result = this.assess(prompt, prompt, intentAnalysis);

    // Return only the numeric scores (exclude strengths and improvements arrays)
    return {
      clarity: result.clarity,
      efficiency: result.efficiency,
      structure: result.structure,
      completeness: result.completeness,
      actionability: result.actionability,
      specificity: result.specificity,
      overall: result.overall,
    };
  }

  /**
   * Assess quality of a prompt
   * v4.0: Now includes specificity as 6th quality dimension
   */
  assess(original: string, enhanced: string, intent: IntentAnalysis): QualityMetrics {
    const clarity = this.assessClarity(enhanced, intent);
    const efficiency = this.assessEfficiency(enhanced);
    const structure = this.assessStructure(enhanced, intent);
    const completeness = this.assessCompleteness(enhanced, intent);
    const actionability = this.assessActionability(enhanced, intent);
    const specificity = this.assessSpecificity(enhanced, intent);

    const overall = this.calculateOverall(
      { clarity, efficiency, structure, completeness, actionability, specificity },
      intent
    );

    const strengths = this.identifyStrengths(enhanced, {
      clarity,
      efficiency,
      structure,
      completeness,
      actionability,
      specificity,
    });
    const improvements = this.identifyImprovements(original, enhanced);

    return {
      clarity,
      efficiency,
      structure,
      completeness,
      actionability,
      specificity,
      overall,
      strengths,
      improvements,
    };
  }

  private assessClarity(prompt: string, intent: IntentAnalysis): number {
    let score = 100;
    const lowerPrompt = prompt.toLowerCase();

    // Check for objective statement
    if (!this.hasObjective(prompt)) {
      score -= 20;
    }

    // Check for technical specifications (for code generation)
    if (intent.primaryIntent === 'code-generation') {
      if (!this.hasTechStack(prompt)) {
        score -= 15;
      }
      if (!this.hasOutputFormat(prompt)) {
        score -= 15;
      }
    }

    // Check for success criteria
    if (!this.hasSuccessCriteria(prompt)) {
      score -= 10;
    }

    // Check for vague language
    const vagueTerms = ['something', 'somehow', 'maybe', 'kind of', 'sort of', 'stuff', 'things'];
    const vagueCount = vagueTerms.filter((term) => lowerPrompt.includes(term)).length;
    score -= vagueCount * 5;

    return Math.max(0, Math.min(100, score));
  }

  private assessEfficiency(prompt: string): number {
    let score = 100;

    // Check for pleasantries
    const pleasantries = ['please', 'thank you', 'thanks', 'could you', 'would you'];
    const lowerPrompt = prompt.toLowerCase();
    const pleasantryCount = pleasantries.filter((p) => lowerPrompt.includes(p)).length;
    score -= pleasantryCount * 5;

    // Check for fluff words
    const fluffWords = ['very', 'really', 'just', 'basically', 'simply', 'actually', 'literally'];
    const fluffCount = fluffWords.filter((w) => lowerPrompt.includes(w)).length;
    score -= fluffCount * 3;

    // Calculate signal-to-noise ratio
    const words = prompt.split(/\s+/);
    const signalWords = this.countSignalWords(prompt);
    const ratio = words.length > 0 ? signalWords / words.length : 0;

    if (ratio < 0.6) {
      score -= 30;
    } else if (ratio < 0.75) {
      score -= 15;
    }

    return Math.max(0, Math.min(100, score));
  }

  private assessStructure(prompt: string, intent: IntentAnalysis): number {
    let score = 100;

    // Check for logical flow: context → requirements → constraints → output
    const hasContext = this.hasSection(prompt, ['context', 'background', 'currently']);
    const hasRequirements = this.hasSection(prompt, ['requirement', 'need', 'should', 'must']);
    const hasOutput = this.hasSection(prompt, ['output', 'result', 'deliverable', 'expected']);

    // Penalize missing sections based on intent
    if (intent.primaryIntent !== 'refinement' && !hasContext) {
      score -= 20;
    }
    if (!hasRequirements) {
      score -= 25;
    }
    if (!hasOutput) {
      score -= 15;
    }

    // Check for markdown structure
    const hasHeaders = /^#+\s+/m.test(prompt);
    if (hasHeaders) {
      score += 10; // Bonus for using headers
    }

    return Math.max(0, Math.min(100, score));
  }

  private assessCompleteness(prompt: string, intent: IntentAnalysis): number {
    let score = 100;
    const lowerPrompt = prompt.toLowerCase();

    // Intent-specific completeness checks
    if (intent.primaryIntent === 'code-generation') {
      if (!this.hasTechStack(prompt)) score -= 20;
      if (!this.hasInputOutput(prompt)) score -= 20;
      if (!this.hasEdgeCases(prompt)) score -= 10;
    } else if (intent.primaryIntent === 'planning') {
      if (!this.hasProblemStatement(prompt)) score -= 25;
      if (!this.hasGoal(prompt)) score -= 25;
      if (!this.hasConstraints(prompt)) score -= 15;
    } else if (intent.primaryIntent === 'debugging') {
      if (!lowerPrompt.includes('error')) score -= 20;
      if (!this.hasExpectedBehavior(prompt)) score -= 15;
      if (!this.hasActualBehavior(prompt)) score -= 15;
    }

    return Math.max(0, Math.min(100, score));
  }

  private assessActionability(prompt: string, intent: IntentAnalysis): number {
    let score = 100;
    const lowerPrompt = prompt.toLowerCase();

    // Check for ambiguous terms
    const ambiguousTerms = ['etc', 'and so on', 'or something', 'whatever', 'anything'];
    const ambiguousCount = ambiguousTerms.filter((term) => lowerPrompt.includes(term)).length;
    score -= ambiguousCount * 10;

    // Check for concrete examples
    const hasExamples = this.hasExamples(prompt);
    if (!hasExamples && intent.primaryIntent === 'code-generation') {
      score -= 15;
    }

    // Check for clear success criteria
    if (!this.hasSuccessCriteria(prompt)) {
      score -= 20;
    }

    // Check for too many questions (makes it un-actionable)
    const questionCount = (prompt.match(/\?/g) || []).length;
    if (questionCount > 3) {
      score -= questionCount * 5;
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * v4.0: Assess specificity - How concrete and precise is the prompt?
   * Penalizes vague language, rewards concrete indicators
   */
  private assessSpecificity(prompt: string, intent: IntentAnalysis): number {
    let score = 100;
    const lowerPrompt = prompt.toLowerCase();
    const words = prompt.split(/\s+/);

    // Penalize vague terms heavily (-15 each)
    const vagueTerms = ['something', 'stuff', 'things', 'whatever', 'somehow', 'somewhere'];
    const vagueCount = vagueTerms.filter((term) => lowerPrompt.includes(term)).length;
    score -= vagueCount * 15;

    // Penalize undefined pronouns in short prompts (-5 each)
    // Only apply for shorter prompts where pronouns likely lack antecedents
    if (words.length < 50) {
      const undefinedPronouns = ['it', 'this', 'that', 'they', 'them'];
      // Check if pronouns appear without clear referents (simplified check)
      const pronounCount = undefinedPronouns.filter((pronoun) => {
        const regex = new RegExp(`\\b${pronoun}\\b`, 'gi');
        return regex.test(prompt);
      }).length;
      // Only penalize if there are multiple pronouns in a short prompt
      if (pronounCount > 2) {
        score -= (pronounCount - 2) * 5;
      }
    }

    // Reward concrete indicators
    // Numbers (+10) - versions, counts, sizes, etc.
    const hasNumbers = /\b\d+(\.\d+)?\b/.test(prompt);
    if (hasNumbers) {
      score += 10;
    }

    // File paths (+10)
    const hasFilePaths = /[/\\][\w.-]+[/\\]?|\.\w{2,4}\b|\.\/|\.\.\//.test(prompt);
    if (hasFilePaths) {
      score += 10;
    }

    // Technical terms (+5) - specific technologies, frameworks, concepts
    const technicalTerms = [
      'api',
      'endpoint',
      'database',
      'schema',
      'component',
      'function',
      'class',
      'interface',
      'module',
      'service',
      'controller',
      'model',
      'view',
      'route',
      'middleware',
      'hook',
      'state',
      'props',
      'query',
      'mutation',
      'resolver',
    ];
    const techTermCount = technicalTerms.filter((term) => lowerPrompt.includes(term)).length;
    if (techTermCount > 0) {
      score += Math.min(techTermCount * 5, 15); // Cap bonus at +15
    }

    // Code blocks indicate specificity (+10)
    if (prompt.includes('```')) {
      score += 10;
    }

    // Specific identifiers (camelCase, PascalCase, snake_case) (+5)
    const hasIdentifiers =
      /\b[a-z]+[A-Z][a-zA-Z]*\b|\b[A-Z][a-z]+[A-Z][a-zA-Z]*\b|\b[a-z]+_[a-z]+\b/.test(prompt);
    if (hasIdentifiers) {
      score += 5;
    }

    // Intent-specific specificity requirements
    if (intent.primaryIntent === 'code-generation' || intent.primaryIntent === 'debugging') {
      // These intents require high specificity
      if (!hasFilePaths && !prompt.includes('```')) {
        score -= 10;
      }
    } else if (intent.primaryIntent === 'migration') {
      // Migration needs version numbers
      const hasVersions = /v?\d+\.\d+(\.\d+)?|version\s*\d+/i.test(prompt);
      if (!hasVersions) {
        score -= 15;
      }
    }

    return Math.max(0, Math.min(100, score));
  }

  private calculateOverall(
    scores: {
      clarity: number;
      efficiency: number;
      structure: number;
      completeness: number;
      actionability: number;
      specificity: number;
    },
    intent: IntentAnalysis
  ): number {
    // v4.0: Intent-specific weights including specificity
    if (intent.primaryIntent === 'code-generation') {
      // Code generation benefits most from specificity
      return (
        scores.clarity * 0.2 +
        scores.completeness * 0.25 +
        scores.actionability * 0.2 +
        scores.specificity * 0.15 +
        scores.efficiency * 0.1 +
        scores.structure * 0.1
      );
    } else if (intent.primaryIntent === 'planning') {
      // Planning needs structure and completeness, less specificity
      return (
        scores.structure * 0.25 +
        scores.completeness * 0.25 +
        scores.clarity * 0.2 +
        scores.specificity * 0.1 +
        scores.efficiency * 0.1 +
        scores.actionability * 0.1
      );
    } else if (intent.primaryIntent === 'debugging') {
      // Debugging requires high specificity and actionability
      return (
        scores.actionability * 0.25 +
        scores.completeness * 0.25 +
        scores.specificity * 0.2 +
        scores.clarity * 0.15 +
        scores.structure * 0.1 +
        scores.efficiency * 0.05
      );
    } else if (intent.primaryIntent === 'migration') {
      // Migration needs high specificity (versions, paths)
      return (
        scores.specificity * 0.25 +
        scores.completeness * 0.25 +
        scores.clarity * 0.2 +
        scores.actionability * 0.15 +
        scores.structure * 0.1 +
        scores.efficiency * 0.05
      );
    } else if (intent.primaryIntent === 'testing') {
      // Testing needs specificity and completeness
      return (
        scores.completeness * 0.25 +
        scores.specificity * 0.2 +
        scores.actionability * 0.2 +
        scores.clarity * 0.15 +
        scores.structure * 0.1 +
        scores.efficiency * 0.1
      );
    } else if (intent.primaryIntent === 'security-review') {
      // Security review needs completeness and specificity
      return (
        scores.completeness * 0.25 +
        scores.specificity * 0.2 +
        scores.clarity * 0.2 +
        scores.actionability * 0.15 +
        scores.structure * 0.1 +
        scores.efficiency * 0.1
      );
    } else if (intent.primaryIntent === 'learning') {
      // Learning is less about specificity, more about clarity
      return (
        scores.clarity * 0.3 +
        scores.structure * 0.2 +
        scores.completeness * 0.2 +
        scores.specificity * 0.1 +
        scores.actionability * 0.1 +
        scores.efficiency * 0.1
      );
    }

    // Default weights (refinement, documentation, prd-generation)
    return (
      scores.clarity * 0.18 +
      scores.efficiency * 0.12 +
      scores.structure * 0.18 +
      scores.completeness * 0.22 +
      scores.actionability * 0.18 +
      scores.specificity * 0.12
    );
  }

  private identifyStrengths(
    prompt: string,
    scores: {
      clarity: number;
      efficiency: number;
      structure: number;
      completeness: number;
      actionability: number;
      specificity: number;
    }
  ): string[] {
    const strengths: string[] = [];

    if (scores.clarity >= 85) strengths.push('Clear objective and goals');
    if (scores.efficiency >= 85) strengths.push('Concise and focused');
    if (scores.structure >= 85) strengths.push('Well-structured with logical flow');
    if (scores.completeness >= 85) strengths.push('Comprehensive with all necessary details');
    if (scores.actionability >= 85) strengths.push('Immediately actionable');
    if (scores.specificity >= 85) strengths.push('Highly specific with concrete details');

    return strengths;
  }

  private identifyImprovements(original: string, enhanced: string): string[] {
    const improvements: string[] = [];

    // This is a simplified version - in real implementation,
    // we'd track what changed between original and enhanced
    if (enhanced.length > original.length * 1.2) {
      improvements.push('Added missing context and specifications');
    }

    if (enhanced.includes('# Objective') && !original.includes('# Objective')) {
      improvements.push('Added clear objective statement');
    }

    if (
      enhanced.includes('# Technical Constraints') &&
      !original.includes('# Technical Constraints')
    ) {
      improvements.push('Added technical context');
    }

    return improvements;
  }

  // Helper methods
  private hasObjective(prompt: string): boolean {
    return /objective|goal|purpose|need to|want to|^#+\s*objective/im.test(prompt);
  }

  private hasTechStack(prompt: string): boolean {
    const techTerms = [
      'python',
      'javascript',
      'typescript',
      'java',
      'rust',
      'go',
      'php',
      'react',
      'vue',
      'angular',
      'django',
      'flask',
      'express',
      'spring',
    ];
    const lowerPrompt = prompt.toLowerCase();
    return techTerms.some((term) => lowerPrompt.includes(term));
  }

  private hasOutputFormat(prompt: string): boolean {
    return /output|return|result|format|structure|response/i.test(prompt);
  }

  private hasSuccessCriteria(prompt: string): boolean {
    return /success|criteria|metric|measure|test|verify|validate/i.test(prompt);
  }

  private hasSection(prompt: string, keywords: string[]): boolean {
    const lowerPrompt = prompt.toLowerCase();
    return keywords.some((keyword) => lowerPrompt.includes(keyword));
  }

  private countSignalWords(prompt: string): number {
    // Count words that carry meaning (not stop words)
    const stopWords = new Set([
      'the',
      'a',
      'an',
      'and',
      'or',
      'but',
      'in',
      'on',
      'at',
      'to',
      'for',
      'of',
      'with',
      'by',
      'from',
      'as',
      'is',
      'was',
      'are',
      'were',
      'been',
      'be',
      'have',
      'has',
      'had',
      'do',
      'does',
      'did',
      'will',
      'would',
      'could',
      'should',
      'may',
      'might',
      'can',
      'this',
      'that',
      'these',
      'those',
    ]);

    const words = prompt.toLowerCase().split(/\s+/);
    return words.filter((word) => !stopWords.has(word) && word.length > 2).length;
  }

  private hasInputOutput(prompt: string): boolean {
    return /input|output|parameter|argument|return/i.test(prompt);
  }

  private hasEdgeCases(prompt: string): boolean {
    return /edge case|empty|null|zero|negative|invalid|error/i.test(prompt);
  }

  private hasProblemStatement(prompt: string): boolean {
    return /problem|issue|challenge|currently|pain point/i.test(prompt);
  }

  private hasGoal(prompt: string): boolean {
    return /goal|objective|aim|purpose|achieve|accomplish/i.test(prompt);
  }

  private hasConstraints(prompt: string): boolean {
    return /constraint|limit|must not|cannot|within|maximum|minimum/i.test(prompt);
  }

  private hasExpectedBehavior(prompt: string): boolean {
    return /expected|should|supposed to|intended/i.test(prompt);
  }

  private hasActualBehavior(prompt: string): boolean {
    return /actual|currently|instead|but|however|getting/i.test(prompt);
  }

  private hasExamples(prompt: string): boolean {
    return /example|for instance|such as|like|e\.g\.|```/i.test(prompt);
  }
}
