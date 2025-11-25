import { IntentDetector } from './intent-detector.js';
import { PatternLibrary } from './pattern-library.js';
import { QualityAssessor } from './quality-assessor.js';
import {
  OptimizationResult,
  OptimizationMode,
  Improvement,
  PatternSummary,
  PatternContext,
  EscalationAnalysis,
  EscalationReason,
} from './types.js';

export class UniversalOptimizer {
  private intentDetector: IntentDetector;
  private patternLibrary: PatternLibrary;
  private qualityAssessor: QualityAssessor;

  constructor(
    intentDetector?: IntentDetector,
    patternLibrary?: PatternLibrary,
    qualityAssessor?: QualityAssessor
  ) {
    this.intentDetector = intentDetector || new IntentDetector();
    this.patternLibrary = patternLibrary || new PatternLibrary();
    this.qualityAssessor = qualityAssessor || new QualityAssessor();
  }

  /**
   * Optimize a prompt using Clavix Intelligence
   */
  async optimize(prompt: string, mode: OptimizationMode): Promise<OptimizationResult> {
    const startTime = Date.now();

    // Step 1: Detect intent
    const intent = this.intentDetector.analyze(prompt);

    // Step 2: Select applicable patterns
    const patterns = this.patternLibrary.selectPatterns(intent, mode);

    // Step 3: Apply patterns sequentially
    let enhanced = prompt;
    const improvements: Improvement[] = [];
    const appliedPatterns: PatternSummary[] = [];

    const context: PatternContext = {
      intent,
      mode,
      originalPrompt: prompt,
    };

    for (const pattern of patterns) {
      try {
        const result = pattern.apply(enhanced, context);

        if (result.applied) {
          enhanced = result.enhancedPrompt;
          improvements.push(result.improvement);
          appliedPatterns.push({
            name: pattern.name,
            description: pattern.description,
            impact: result.improvement.impact,
          });
        }
      } catch (error) {
        // Log error but continue with other patterns
        console.error(`Error applying pattern ${pattern.id}:`, error);
      }
    }

    // Step 4: Assess quality
    const quality = this.qualityAssessor.assess(prompt, enhanced, intent);

    // Step 5: Calculate processing time
    const processingTimeMs = Date.now() - startTime;

    return {
      original: prompt,
      enhanced,
      intent,
      quality,
      improvements,
      appliedPatterns,
      mode,
      processingTimeMs,
    };
  }

  /**
   * Determine if deep mode should be recommended (for fast mode results)
   * @deprecated Use analyzeEscalation() for more detailed analysis
   */
  shouldRecommendDeepMode(result: OptimizationResult): boolean {
    const escalation = this.analyzeEscalation(result);
    return escalation.shouldEscalate;
  }

  /**
   * v4.0: Analyze whether to escalate from fast mode to deep mode
   * Uses multi-factor scoring for intelligent triage decisions
   *
   * IMPORTANT: Quality checks use the ORIGINAL prompt, not the enhanced one,
   * because triage decisions should be based on what the user wrote.
   */
  analyzeEscalation(result: OptimizationResult): EscalationAnalysis {
    const reasons: EscalationReason[] = [];
    let totalScore = 0;

    // Assess the ORIGINAL prompt's quality for triage decisions
    // (result.quality is for the enhanced prompt)
    const originalQuality = this.qualityAssessor.assessQuality(
      result.original,
      result.intent.primaryIntent
    );

    // Factor 1: Intent type (planning, prd-generation → +30 pts)
    const escalationIntents = ['planning', 'prd-generation'];
    if (escalationIntents.includes(result.intent.primaryIntent)) {
      const contribution = 30;
      totalScore += contribution;
      reasons.push({
        factor: 'intent-type',
        contribution,
        description: `${result.intent.primaryIntent} tasks benefit from comprehensive analysis`,
      });
    }

    // Factor 2: Low confidence (<60% → up to +20 pts)
    if (result.intent.confidence < 60) {
      const contribution = Math.round((60 - result.intent.confidence) / 3); // Max 20 pts
      totalScore += contribution;
      reasons.push({
        factor: 'low-confidence',
        contribution,
        description: `Intent detection confidence is low (${result.intent.confidence}%)`,
      });
    }

    // Factor 3: Overall quality score (<65 → up to +25 pts) - uses ORIGINAL quality
    if (originalQuality.overall < 65) {
      const contribution = Math.round((65 - originalQuality.overall) / 2.6); // Max ~25 pts
      totalScore += contribution;
      reasons.push({
        factor: 'low-quality',
        contribution,
        description: `Original prompt quality is below threshold (${Math.round(originalQuality.overall)}/100)`,
      });
    }

    // Factor 4: Low completeness (<60% → +15 pts) - uses ORIGINAL quality
    if (originalQuality.completeness < 60) {
      const contribution = 15;
      totalScore += contribution;
      reasons.push({
        factor: 'missing-completeness',
        contribution,
        description: `Missing required details (completeness: ${Math.round(originalQuality.completeness)}%)`,
      });
    }

    // Factor 5: Low specificity (<60% → +15 pts) - v4.0 new dimension, uses ORIGINAL quality
    if (originalQuality.specificity < 60) {
      const contribution = 15;
      totalScore += contribution;
      reasons.push({
        factor: 'low-specificity',
        contribution,
        description: `Prompt lacks concrete details (specificity: ${Math.round(originalQuality.specificity)}%)`,
      });
    }

    // Factor 6: High ambiguity (open-ended + needs structure → +20 pts)
    if (result.intent.characteristics.isOpenEnded && result.intent.characteristics.needsStructure) {
      const contribution = 20;
      totalScore += contribution;
      reasons.push({
        factor: 'high-ambiguity',
        contribution,
        description: 'Open-ended request without clear structure',
      });
    }

    // Factor 7: Length mismatch (short prompt + incomplete → +15 pts) - uses ORIGINAL quality
    if (result.original.length < 50 && originalQuality.completeness < 70) {
      const contribution = 15;
      totalScore += contribution;
      reasons.push({
        factor: 'length-mismatch',
        contribution,
        description: 'Very short prompt with incomplete requirements',
      });
    }

    // Factor 8: Complex intents that benefit from deep analysis
    const complexIntents = ['migration', 'security-review'];
    if (complexIntents.includes(result.intent.primaryIntent)) {
      const contribution = 20;
      totalScore += contribution;
      reasons.push({
        factor: 'complex-intent',
        contribution,
        description: `${result.intent.primaryIntent} requires thorough analysis`,
      });
    }

    // Determine escalation confidence
    // Thresholds: 45 for escalation, 60 for medium confidence, 75 for high confidence
    let escalationConfidence: 'high' | 'medium' | 'low';
    if (totalScore >= 75) {
      escalationConfidence = 'high';
    } else if (totalScore >= 60) {
      escalationConfidence = 'medium';
    } else {
      escalationConfidence = 'low';
    }

    // Generate deep mode value proposition
    const deepModeValue = this.generateDeepModeValue(result, reasons);

    return {
      // Threshold of 45 ensures planning prompts with missing completeness trigger escalation
      shouldEscalate: totalScore >= 45,
      escalationScore: Math.min(totalScore, 100),
      escalationConfidence,
      reasons,
      deepModeValue,
    };
  }

  /**
   * Generate a user-friendly explanation of what deep mode would provide
   */
  private generateDeepModeValue(result: OptimizationResult, reasons: EscalationReason[]): string {
    const benefits: string[] = [];

    // Based on primary issues, suggest specific deep mode benefits
    const hasLowQuality = reasons.some((r) => r.factor === 'low-quality');
    const hasLowCompleteness = reasons.some((r) => r.factor === 'missing-completeness');
    const hasHighAmbiguity = reasons.some((r) => r.factor === 'high-ambiguity');
    const hasLowSpecificity = reasons.some((r) => r.factor === 'low-specificity');
    const isPlanningIntent =
      result.intent.primaryIntent === 'planning' ||
      result.intent.primaryIntent === 'prd-generation';

    if (isPlanningIntent) {
      benefits.push('structured implementation plan');
    }

    if (hasLowQuality || hasLowCompleteness) {
      benefits.push('comprehensive requirements extraction');
    }

    if (hasHighAmbiguity) {
      benefits.push('alternative approaches and trade-offs');
    }

    if (hasLowSpecificity) {
      benefits.push('concrete examples and specifications');
    }

    if (result.intent.primaryIntent === 'migration') {
      benefits.push('migration checklist and risk assessment');
    }

    if (result.intent.primaryIntent === 'security-review') {
      benefits.push('security checklist and threat analysis');
    }

    // Always include validation checklist for deep mode
    benefits.push('validation checklist');

    if (benefits.length === 0) {
      return 'Deep mode provides comprehensive analysis with alternative approaches.';
    }

    return `Deep mode would provide: ${benefits.join(', ')}.`;
  }

  /**
   * Get recommendation message for user
   * v4.0: Enhanced with escalation analysis details
   */
  getRecommendation(result: OptimizationResult): string | null {
    if (result.mode === 'fast') {
      const escalation = this.analyzeEscalation(result);
      if (escalation.shouldEscalate) {
        return `${escalation.deepModeValue} Run: /clavix:deep`;
      }
    }

    if (result.quality.overall >= 90) {
      return 'Excellent! Your prompt is AI-ready.';
    }

    if (result.quality.overall >= 80) {
      return 'Good quality. Ready to use!';
    }

    if (result.quality.overall >= 70) {
      return 'Decent quality. Consider the improvements listed above.';
    }

    return null;
  }

  /**
   * v4.0: Get detailed escalation recommendation with all reasons
   * Useful for verbose output or debugging
   */
  getDetailedRecommendation(result: OptimizationResult): {
    message: string;
    escalation?: EscalationAnalysis;
    qualityLevel: 'excellent' | 'good' | 'decent' | 'needs-work';
  } {
    const escalation = result.mode === 'fast' ? this.analyzeEscalation(result) : undefined;

    let qualityLevel: 'excellent' | 'good' | 'decent' | 'needs-work';
    let message: string;

    if (result.quality.overall >= 90) {
      qualityLevel = 'excellent';
      message = 'Excellent! Your prompt is AI-ready.';
    } else if (result.quality.overall >= 80) {
      qualityLevel = 'good';
      message = 'Good quality. Ready to use!';
    } else if (result.quality.overall >= 70) {
      qualityLevel = 'decent';
      message = 'Decent quality. Consider the improvements listed above.';
    } else {
      qualityLevel = 'needs-work';
      message = 'This prompt needs improvement for best results.';
    }

    if (escalation?.shouldEscalate) {
      message = `${escalation.deepModeValue} Run: /clavix:deep`;
    }

    return {
      message,
      escalation,
      qualityLevel,
    };
  }

  /**
   * Get statistics about the optimizer
   */
  getStatistics(): {
    totalPatterns: number;
    fastModePatterns: number;
    deepModePatterns: number;
  } {
    const totalPatterns = this.patternLibrary.getPatternCount();
    const fastModePatterns = this.patternLibrary.getPatternsByMode('fast').length;
    const deepModePatterns = this.patternLibrary.getPatternsByMode('deep').length;

    return {
      totalPatterns,
      fastModePatterns,
      deepModePatterns,
    };
  }
}
