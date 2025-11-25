// Core types for the Clavix Intelligence system

export type PromptIntent =
  | 'code-generation' // "Build a React component"
  | 'planning' // "Help me plan a feature"
  | 'refinement' // "Make this faster"
  | 'debugging' // "Fix this error"
  | 'documentation' // "Explain this code"
  | 'prd-generation' // PRD flow
  // v4.0 New Intents
  | 'testing' // "Write unit tests for UserService"
  | 'migration' // "Migrate from React 17 to 18"
  | 'security-review' // "Audit this code for XSS"
  | 'learning'; // "Teach me about closures"

export type QualityDimension =
  | 'clarity' // Was: Explicitness (E) - Is the objective unambiguous?
  | 'efficiency' // Was: Conciseness (C) - Concise signal without noise?
  | 'structure' // Was: Logic (L) - Logical context → requirements → output flow?
  | 'completeness' // New: All necessary constraints specified?
  | 'actionability' // New: Can AI execute immediately?
  | 'specificity'; // v4.0: How concrete and precise is the prompt?

export type ImpactLevel = 'low' | 'medium' | 'high';

export type OptimizationMode = 'fast' | 'deep';

export interface IntentAnalysis {
  primaryIntent: PromptIntent;
  confidence: number; // 0-100
  characteristics: {
    hasCodeContext: boolean;
    hasTechnicalTerms: boolean;
    isOpenEnded: boolean;
    needsStructure: boolean;
  };
  suggestedMode?: OptimizationMode;
}

// v4.0: Enhanced intent analysis with secondary intents
export interface SecondaryIntent {
  intent: PromptIntent;
  confidence: number; // 0-100
}

export type IntentAmbiguity = 'low' | 'medium' | 'high';

export interface EnhancedIntentAnalysis extends IntentAnalysis {
  secondaryIntents: SecondaryIntent[];
  intentAmbiguity: IntentAmbiguity;
}

// v4.0: Enhanced escalation analysis for smart triage
export interface EscalationReason {
  factor: string;
  contribution: number;
  description: string;
}

export interface EscalationAnalysis {
  shouldEscalate: boolean;
  escalationScore: number; // 0-100
  escalationConfidence: 'high' | 'medium' | 'low';
  reasons: EscalationReason[];
  deepModeValue: string;
}

export interface QualityMetrics {
  clarity: number; // 0-100
  efficiency: number; // 0-100
  structure: number; // 0-100
  completeness: number; // 0-100
  actionability: number; // 0-100
  specificity: number; // v4.0: 0-100 - How concrete and precise?

  overall: number; // Weighted average

  strengths: string[]; // What's already good
  improvements: string[]; // What was enhanced
  remainingIssues?: string[]; // What still needs work
}

export interface Improvement {
  dimension: QualityDimension;
  description: string;
  impact: ImpactLevel;
}

export interface PatternContext {
  intent: IntentAnalysis;
  mode: OptimizationMode;
  originalPrompt: string;
}

export interface PatternResult {
  enhancedPrompt: string;
  improvement: Improvement;
  applied: boolean;
}

export interface PatternSummary {
  name: string;
  description: string;
  impact: ImpactLevel;
}

export interface OptimizationResult {
  original: string;
  enhanced: string;
  intent: IntentAnalysis;
  quality: QualityMetrics;
  improvements: Improvement[];
  appliedPatterns: PatternSummary[];
  mode: OptimizationMode;
  processingTimeMs: number;
}

export interface AlternativeApproach {
  title: string;
  description: string;
  prompt: string;
}

export interface AlternativeStructure {
  type: 'step-by-step' | 'template-based' | 'example-driven';
  title: string;
  content: string;
}

export interface ValidationItem {
  description: string;
  checked: boolean;
}

export interface EdgeCase {
  scenario: string;
  consideration: string;
}

export interface DeepModeExtras {
  alternatives: AlternativeApproach[];
  structures: AlternativeStructure[];
  validation: ValidationItem[];
  edgeCases: EdgeCase[];
}
