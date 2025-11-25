import {
  IntentAnalysis,
  PromptIntent,
  OptimizationMode,
  EnhancedIntentAnalysis,
  SecondaryIntent,
  IntentAmbiguity,
} from './types.js';

/**
 * Enhanced Intent Detector with weighted scoring and phrase-based detection
 * Target Accuracy: 95%+
 */
export class IntentDetector {
  // Strong indicators (20 points)
  private readonly STRONG_CODE_KEYWORDS = [
    'create function',
    'build component',
    'implement feature',
    'add endpoint',
    'write class',
    'develop api',
    'generate code',
  ];

  private readonly STRONG_PLANNING_KEYWORDS = [
    'how should i',
    "what's the best way",
    'pros and cons',
    'architecture for',
    'design pattern',
    'system design',
    'should i use',
    'help me choose',
    'design the database',
    'plan the',
    'requirements document',
    // v4.0: Spec-driven development keywords
    'write spec',
    'create spec',
    'spec document',
    'functional spec',
    'technical spec',
    'design spec',
    'specification for',
    'write specification',
  ];

  private readonly STRONG_DEBUGGING_KEYWORDS = [
    'fix error',
    'debug issue',
    "doesn't work",
    'throws error',
    'not working',
    'returns null',
    'undefined error',
    'stack trace',
    'error message',
    'causing this bug',
    'how do i fix',
    'fix this error',
    'resolve the',
    'memory leak',
    'not rendering',
    'why is my',
  ];

  private readonly STRONG_DOCUMENTATION_KEYWORDS = [
    'explain how',
    'walk me through',
    'how does this work',
    'show me how',
    'document this',
    'describe how',
    'what does this do',
    'write documentation',
    'create documentation',
    'add documentation',
    'api documentation',
    'add comments',
  ];

  private readonly STRONG_REFINEMENT_KEYWORDS = [
    'make it faster',
    'speed up',
    'reduce time',
    'optimize performance',
    'clean up code',
    'refactor this',
    'improve efficiency',
    'make this component',
    'make it more',
    'enhance the',
    'update the styling',
    'more reusable',
    'more modern',
  ];

  // v4.0: New intent - Testing
  private readonly STRONG_TESTING_KEYWORDS = [
    'write test',
    'unit test',
    'integration test',
    'test coverage',
    'add test',
    'create test',
    'write tests for',
    'add tests for',
    'test this',
    'e2e test',
    'end to end test',
    'snapshot test',
    'test suite',
  ];

  // v4.0: New intent - Migration
  private readonly STRONG_MIGRATION_KEYWORDS = [
    'migrate from',
    'migrate to',
    'upgrade from',
    'upgrade to',
    'port from',
    'port to',
    'convert from',
    'convert to',
    'transition from',
    'move from',
    'update from version',
    'upgrade version',
  ];

  // v4.0: New intent - Security Review
  private readonly STRONG_SECURITY_KEYWORDS = [
    'security audit',
    'find vulnerabilities',
    'check for injection',
    'security scan',
    'audit security',
    'review for security',
    'penetration test',
    'security review',
    'check for xss',
    'check for csrf',
    'vulnerability scan',
    'security assessment',
  ];

  // v4.0: New intent - Learning
  private readonly STRONG_LEARNING_KEYWORDS = [
    'teach me',
    'explain how',
    'help me understand',
    'what is the concept',
    'how does',
    'why does',
    'learn about',
    'understand how',
    'what are',
    'difference between',
    'when should i use',
    'best practices for',
  ];

  // Medium indicators (10 points)
  private readonly CODE_KEYWORDS = [
    'function',
    'class',
    'component',
    'api',
    'endpoint',
    'database',
    'implement',
    'build',
    'create',
    'write',
    'code',
    'develop',
  ];

  private readonly PLANNING_KEYWORDS = [
    'plan',
    'design',
    'architect',
    'strategy',
    'approach',
    'structure',
    'organize',
    'layout',
    'workflow',
    // v4.0: Spec-driven development keywords
    'spec',
    'specification',
    'requirements',
    'blueprint',
    'outline',
  ];

  private readonly REFINEMENT_KEYWORDS = [
    'improve',
    'optimize',
    'refactor',
    'enhance',
    'better',
    'faster',
    'cleaner',
    'simplify',
    'reduce',
    'increase',
  ];

  private readonly DEBUGGING_KEYWORDS = [
    'fix',
    'debug',
    'error',
    'bug',
    'issue',
    'problem',
    'failing',
    'broken',
    'crash',
    'exception',
    'incorrect',
    'wrong',
  ];

  private readonly DOCUMENTATION_KEYWORDS = [
    'explain',
    'document',
    'describe',
    'understand',
    'clarify',
    'comment',
    'documentation',
    'guide',
    'tutorial',
  ];

  // v4.0: Medium keywords for new intents
  private readonly TESTING_KEYWORDS = [
    'test',
    'coverage',
    'jest',
    'pytest',
    'mocha',
    'vitest',
    'mock',
    'assertion',
    'expect',
    'describe',
    'spec',
    'fixture',
    'stub',
    'spy',
  ];

  private readonly MIGRATION_KEYWORDS = [
    'migrate',
    'migration',
    'upgrade',
    'port',
    'convert',
    'transition',
    'legacy',
    'deprecated',
    'version',
    'breaking change',
    'compatibility',
  ];

  private readonly SECURITY_KEYWORDS = [
    'security',
    'vulnerability',
    'xss',
    'csrf',
    'injection',
    'sanitize',
    'escape',
    'owasp',
    'cve',
    'exploit',
    'attack',
    'threat',
    'risk',
  ];

  private readonly LEARNING_KEYWORDS = [
    'understand',
    'learn',
    'concept',
    'basics',
    'fundamentals',
    'tutorial',
    'introduction',
    'beginner',
    'overview',
    'theory',
    'principle',
  ];

  // Weak indicators (5 points)
  private readonly WEAK_CODE_KEYWORDS = [
    'react',
    'vue',
    'angular',
    'python',
    'javascript',
    'typescript',
    'java',
    'rust',
    'go',
    'php',
    'ruby',
    'swift',
    'kotlin',
    'system',
    'feature',
  ];

  // Negation words (reduces score by 50%)
  private readonly NEGATION_WORDS = ["don't", 'dont', 'not', 'avoid', 'without', 'never', 'no'];

  analyze(prompt: string): IntentAnalysis {
    const lowerPrompt = prompt.toLowerCase();
    const words = lowerPrompt.split(/\s+/);

    // Calculate weighted scores for each intent
    const scores: Record<PromptIntent, number> = {
      'code-generation': this.calculateIntentScore(lowerPrompt, words, 'code-generation'),
      planning: this.calculateIntentScore(lowerPrompt, words, 'planning'),
      refinement: this.calculateIntentScore(lowerPrompt, words, 'refinement'),
      debugging: this.calculateIntentScore(lowerPrompt, words, 'debugging'),
      documentation: this.calculateIntentScore(lowerPrompt, words, 'documentation'),
      'prd-generation': 0, // PRD is explicit command, not inferred
      // v4.0: New intents
      testing: this.calculateIntentScore(lowerPrompt, words, 'testing'),
      migration: this.calculateIntentScore(lowerPrompt, words, 'migration'),
      'security-review': this.calculateIntentScore(lowerPrompt, words, 'security-review'),
      learning: this.calculateIntentScore(lowerPrompt, words, 'learning'),
    };

    // Apply intent priority rules
    const primaryIntent = this.selectPrimaryIntent(scores, lowerPrompt);

    // Calculate confidence
    const confidence = this.calculateConfidence(scores, primaryIntent);

    // Analyze characteristics
    const characteristics = {
      hasCodeContext: this.hasCodeContext(prompt),
      hasTechnicalTerms: this.hasTechnicalTerms(lowerPrompt),
      isOpenEnded: this.isOpenEnded(prompt),
      needsStructure: this.needsStructure(prompt, primaryIntent),
    };

    // Suggest mode
    const suggestedMode = this.suggestMode(
      primaryIntent,
      characteristics,
      prompt.length,
      confidence
    );

    return {
      primaryIntent,
      confidence,
      characteristics,
      suggestedMode,
    };
  }

  private calculateIntentScore(prompt: string, words: string[], intent: PromptIntent): number {
    let score = 0;

    // Get keywords for this intent
    const { strong, medium, weak } = this.getKeywordsForIntent(intent);

    // Check strong indicators (phrases) - 20 points each
    for (const phrase of strong) {
      if (prompt.includes(phrase)) {
        score += this.applyNegation(phrase, prompt, 20);
      }
    }

    // Check medium indicators - 10 points each
    for (const keyword of medium) {
      if (words.includes(keyword) || prompt.includes(keyword)) {
        score += this.applyNegation(keyword, prompt, 10);
      }
    }

    // Check weak indicators - 5 points each
    for (const keyword of weak) {
      if (words.includes(keyword)) {
        score += 5;
      }
    }

    // Context bonus
    score += this.getContextBonus(prompt, intent);

    return score;
  }

  private getKeywordsForIntent(intent: PromptIntent): {
    strong: string[];
    medium: string[];
    weak: string[];
  } {
    switch (intent) {
      case 'code-generation':
        return {
          strong: this.STRONG_CODE_KEYWORDS,
          medium: this.CODE_KEYWORDS,
          weak: this.WEAK_CODE_KEYWORDS,
        };
      case 'planning':
        return {
          strong: this.STRONG_PLANNING_KEYWORDS,
          medium: this.PLANNING_KEYWORDS,
          weak: [],
        };
      case 'debugging':
        return {
          strong: this.STRONG_DEBUGGING_KEYWORDS,
          medium: this.DEBUGGING_KEYWORDS,
          weak: [],
        };
      case 'documentation':
        return {
          strong: this.STRONG_DOCUMENTATION_KEYWORDS,
          medium: this.DOCUMENTATION_KEYWORDS,
          weak: [],
        };
      case 'refinement':
        return {
          strong: this.STRONG_REFINEMENT_KEYWORDS,
          medium: this.REFINEMENT_KEYWORDS,
          weak: [],
        };
      // v4.0: New intents
      case 'testing':
        return {
          strong: this.STRONG_TESTING_KEYWORDS,
          medium: this.TESTING_KEYWORDS,
          weak: [],
        };
      case 'migration':
        return {
          strong: this.STRONG_MIGRATION_KEYWORDS,
          medium: this.MIGRATION_KEYWORDS,
          weak: [],
        };
      case 'security-review':
        return {
          strong: this.STRONG_SECURITY_KEYWORDS,
          medium: this.SECURITY_KEYWORDS,
          weak: [],
        };
      case 'learning':
        return {
          strong: this.STRONG_LEARNING_KEYWORDS,
          medium: this.LEARNING_KEYWORDS,
          weak: [],
        };
      default:
        return { strong: [], medium: [], weak: [] };
    }
  }

  private applyNegation(keyword: string, prompt: string, baseScore: number): number {
    // Find keyword position
    const keywordIndex = prompt.indexOf(keyword);
    if (keywordIndex === -1) return baseScore;

    // Check 2 words before keyword for negation
    const before = prompt.substring(Math.max(0, keywordIndex - 20), keywordIndex);

    for (const negation of this.NEGATION_WORDS) {
      if (before.includes(negation)) {
        return Math.round(baseScore * 0.5); // Reduce by 50%
      }
    }

    return baseScore;
  }

  private getContextBonus(prompt: string, intent: PromptIntent): number {
    let bonus = 0;

    // Code snippet bonus for debugging/refinement/testing
    if (
      (intent === 'debugging' || intent === 'refinement' || intent === 'testing') &&
      this.hasCodeContext(prompt)
    ) {
      bonus += 15;
    }

    // Question mark bonus for planning/documentation/learning
    if (
      (intent === 'planning' || intent === 'documentation' || intent === 'learning') &&
      prompt.includes('?')
    ) {
      bonus += 10;
    }

    // Technical terms bonus for code-generation
    if (intent === 'code-generation' && this.hasTechnicalTerms(prompt)) {
      bonus += 5;
    }

    // Performance terms bonus for refinement
    if (intent === 'refinement' && this.hasPerformanceTerms(prompt)) {
      bonus += 10;
    }

    // v4.0: Context bonuses for new intents
    // Testing framework mentions bonus
    if (intent === 'testing' && this.hasTestingFrameworkTerms(prompt)) {
      bonus += 10;
    }

    // Security terms bonus for security-review
    if (intent === 'security-review' && this.hasSecurityTerms(prompt)) {
      bonus += 15;
    }

    // Migration version patterns bonus
    if (intent === 'migration' && this.hasMigrationPatterns(prompt)) {
      bonus += 15;
    }

    return bonus;
  }

  // v4.0: Helper methods for new intent bonuses
  private hasTestingFrameworkTerms(prompt: string): boolean {
    const terms = ['jest', 'mocha', 'pytest', 'vitest', 'cypress', 'playwright', 'testing-library'];
    return terms.some((term) => prompt.includes(term));
  }

  private hasSecurityTerms(prompt: string): boolean {
    const terms = ['owasp', 'cve', 'vulnerability', 'exploit', 'injection', 'xss', 'csrf'];
    return terms.some((term) => prompt.includes(term));
  }

  private hasMigrationPatterns(prompt: string): boolean {
    // Check for version patterns like "v1 to v2", "17 to 18", "2.x to 3.x"
    const versionPattern = /\d+\.?\d*\s*(to|->|=>)\s*\d+\.?\d*/i;
    const versionWords = /from\s+version|to\s+version|upgrade.*\d/i;
    return versionPattern.test(prompt) || versionWords.test(prompt);
  }

  private selectPrimaryIntent(scores: Record<PromptIntent, number>, prompt: string): PromptIntent {
    // Priority 1: Debugging (if strong indicators present)
    if (
      scores.debugging >= 20 &&
      (prompt.includes('error') ||
        prompt.includes('bug') ||
        prompt.includes('fix') ||
        prompt.includes('debug') ||
        prompt.includes('issue') ||
        prompt.includes('resolve'))
    ) {
      return 'debugging';
    }

    // Priority 2: Security Review (if security audit explicitly requested)
    if (
      scores['security-review'] >= 20 &&
      (prompt.includes('security') ||
        prompt.includes('vulnerability') ||
        prompt.includes('audit') ||
        prompt.includes('owasp'))
    ) {
      return 'security-review';
    }

    // Priority 3: Testing (if test creation explicitly requested)
    if (
      scores.testing >= 20 &&
      (prompt.includes('test') ||
        prompt.includes('coverage') ||
        (prompt.includes('spec') && !prompt.includes('specification')))
    ) {
      return 'testing';
    }

    // Priority 4: Migration (if version upgrade explicitly requested)
    if (
      scores.migration >= 20 &&
      (prompt.includes('migrate') ||
        prompt.includes('upgrade') ||
        prompt.includes('port') ||
        this.hasMigrationPatterns(prompt))
    ) {
      return 'migration';
    }

    // Priority 5: Documentation (if explanation requested or write documentation)
    if (
      scores.documentation >= 20 &&
      (prompt.includes('explain') ||
        prompt.includes('how does') ||
        prompt.includes('documentation') ||
        (prompt.includes('write') && prompt.includes('document')))
    ) {
      return 'documentation';
    }

    // Priority 6: Learning (if conceptual understanding requested)
    if (
      scores.learning >= 20 &&
      (prompt.includes('teach') ||
        prompt.includes('learn') ||
        prompt.includes('understand') ||
        prompt.includes('concept'))
    ) {
      return 'learning';
    }

    // Priority 7: Planning (if architecture/design question or spec-driven)
    if (
      scores.planning >= 20 &&
      (prompt.includes('how should') ||
        prompt.includes('architecture') ||
        prompt.includes('what is the best') ||
        prompt.includes('specification') ||
        (prompt.includes('spec') && !prompt.includes('test')))
    ) {
      return 'planning';
    }

    // Priority 8: Refinement (if improvement requested)
    if (
      scores.refinement >= 15 &&
      (prompt.includes('improve') ||
        prompt.includes('optimize') ||
        prompt.includes('enhance') ||
        prompt.includes('make') ||
        prompt.includes('refactor'))
    ) {
      return 'refinement';
    }

    // Default: Highest score
    const entries = Object.entries(scores) as [PromptIntent, number][];
    const [primaryIntent] = entries.reduce((max, current) => (current[1] > max[1] ? current : max));

    return primaryIntent;
  }

  private calculateConfidence(
    scores: Record<PromptIntent, number>,
    primaryIntent: PromptIntent
  ): number {
    const primaryScore = scores[primaryIntent];
    const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);

    if (totalScore === 0) {
      return 50; // Low confidence if no keywords matched
    }

    // Calculate confidence as percentage of primary vs total
    let confidence = Math.min(100, Math.round((primaryScore / totalScore) * 100));

    // Check if secondary intent is close
    const sortedScores = Object.entries(scores)
      .filter(([intent]) => intent !== primaryIntent)
      .sort(([, a], [, b]) => b - a);

    if (sortedScores.length > 0) {
      const secondaryScore = sortedScores[0][1];
      const difference = primaryScore - secondaryScore;

      // If top 2 are within 15%, reduce confidence
      if (difference < primaryScore * 0.15) {
        confidence = Math.max(60, confidence - 15);
      }
    }

    return confidence;
  }

  private hasCodeContext(prompt: string): boolean {
    // Check for code blocks
    if (prompt.includes('```') || prompt.includes('`')) {
      return true;
    }

    // Check for code patterns
    const codePatterns = [
      /function\s+\w+\s*\(/,
      /class\s+\w+/,
      /const\s+\w+\s*=/,
      /let\s+\w+\s*=/,
      /var\s+\w+\s*=/,
      /def\s+\w+\s*\(/,
      /import\s+/,
      /<\w+>/,
      /\w+\.\w+\(/,
    ];

    return codePatterns.some((pattern) => pattern.test(prompt));
  }

  private hasTechnicalTerms(prompt: string): boolean {
    const terms = [
      'api',
      'database',
      'sql',
      'rest',
      'graphql',
      'jwt',
      'authentication',
      'middleware',
      'framework',
      'library',
      'npm',
      'docker',
      'aws',
      'frontend',
      'backend',
      'microservice',
    ];

    return terms.some((term) => prompt.includes(term));
  }

  private hasPerformanceTerms(prompt: string): boolean {
    const terms = [
      'performance',
      'speed',
      'fast',
      'slow',
      'optimize',
      'latency',
      'throughput',
      'memory',
      'cpu',
      'load time',
      'response time',
    ];

    return terms.some((term) => prompt.includes(term));
  }

  private isOpenEnded(prompt: string): boolean {
    const questionWords = ['how', 'what', 'why', 'when', 'where', 'which', 'should'];
    const lowerPrompt = prompt.toLowerCase();
    const hasQuestionWord = questionWords.some((word) => lowerPrompt.startsWith(word));
    const hasQuestionMark = prompt.includes('?');
    const vaguePatterns = ['help me', 'i need', 'not sure', 'maybe', 'somehow'];
    const hasVague = vaguePatterns.some((pattern) => lowerPrompt.includes(pattern));

    return hasQuestionWord || hasQuestionMark || hasVague;
  }

  private needsStructure(prompt: string, intent: PromptIntent): boolean {
    if (intent === 'planning') return true;

    const hasObjective = /objective|goal|purpose|need to|want to/i.test(prompt);
    const hasRequirements = /requirement|must|should|need|expect/i.test(prompt);
    const hasConstraints = /constraint|limit|within|must not|cannot/i.test(prompt);

    const structureScore = [hasObjective, hasRequirements, hasConstraints].filter(Boolean).length;

    return structureScore < 2;
  }

  private suggestMode(
    intent: PromptIntent,
    characteristics: IntentAnalysis['characteristics'],
    promptLength: number,
    confidence: number
  ): OptimizationMode {
    // Low confidence suggests deep mode
    if (confidence < 60) {
      return 'deep';
    }

    // Planning always benefits from deep mode
    if (intent === 'planning') {
      return 'deep';
    }

    // Open-ended without code context suggests deep mode
    if (characteristics.isOpenEnded && !characteristics.hasCodeContext) {
      return 'deep';
    }

    // Very short prompts needing structure suggest deep mode
    if (promptLength < 50 && characteristics.needsStructure) {
      return 'deep';
    }

    return 'fast';
  }

  /**
   * v4.0: Enhanced analysis with secondary intents and ambiguity detection
   */
  analyzeEnhanced(prompt: string): EnhancedIntentAnalysis {
    const basicAnalysis = this.analyze(prompt);
    const lowerPrompt = prompt.toLowerCase();
    const words = lowerPrompt.split(/\s+/);

    // Calculate all scores for secondary intent detection
    const scores: Record<PromptIntent, number> = {
      'code-generation': this.calculateIntentScore(lowerPrompt, words, 'code-generation'),
      planning: this.calculateIntentScore(lowerPrompt, words, 'planning'),
      refinement: this.calculateIntentScore(lowerPrompt, words, 'refinement'),
      debugging: this.calculateIntentScore(lowerPrompt, words, 'debugging'),
      documentation: this.calculateIntentScore(lowerPrompt, words, 'documentation'),
      'prd-generation': 0,
      testing: this.calculateIntentScore(lowerPrompt, words, 'testing'),
      migration: this.calculateIntentScore(lowerPrompt, words, 'migration'),
      'security-review': this.calculateIntentScore(lowerPrompt, words, 'security-review'),
      learning: this.calculateIntentScore(lowerPrompt, words, 'learning'),
    };

    // Get secondary intents (top 2-3 after primary, with score > 10)
    const secondaryIntents = this.getSecondaryIntents(scores, basicAnalysis.primaryIntent);

    // Calculate intent ambiguity
    const intentAmbiguity = this.calculateAmbiguity(scores, basicAnalysis.primaryIntent);

    return {
      ...basicAnalysis,
      secondaryIntents,
      intentAmbiguity,
    };
  }

  private getSecondaryIntents(
    scores: Record<PromptIntent, number>,
    primaryIntent: PromptIntent
  ): SecondaryIntent[] {
    const totalScore = Object.values(scores).reduce((sum, s) => sum + s, 0);

    if (totalScore === 0) return [];

    return Object.entries(scores)
      .filter(([intent, score]) => intent !== primaryIntent && score > 10)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 2)
      .map(([intent, score]) => ({
        intent: intent as PromptIntent,
        confidence: Math.round((score / totalScore) * 100),
      }));
  }

  private calculateAmbiguity(
    scores: Record<PromptIntent, number>,
    _primaryIntent: PromptIntent
  ): IntentAmbiguity {
    const sortedScores = Object.entries(scores).sort(([, a], [, b]) => b - a);

    if (sortedScores.length < 2) return 'low';

    const primaryScore = sortedScores[0][1];
    const secondaryScore = sortedScores[1][1];

    if (primaryScore === 0) return 'high';

    const ratio = secondaryScore / primaryScore;

    if (ratio > 0.8) return 'high'; // Secondary is 80%+ of primary
    if (ratio > 0.5) return 'medium'; // Secondary is 50-80% of primary
    return 'low'; // Clear primary intent
  }
}
