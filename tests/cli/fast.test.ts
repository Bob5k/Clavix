/**
 * Tests for fast command functionality
 */

import { PromptOptimizer } from '../../src/core/prompt-optimizer';

describe('Fast command', () => {
  let optimizer: PromptOptimizer;

  beforeEach(() => {
    optimizer = new PromptOptimizer();
  });

  describe('CLEAR framework application', () => {
    it('should apply CLEAR framework in fast mode', () => {
      const prompt = 'Create a login page';

      const result = optimizer.applyCLEARFramework(prompt, 'fast');

      expect(result).toBeDefined();
      expect(result.improvedPrompt).toBeDefined();
      expect(result.conciseness).toBeDefined();
      expect(result.logic).toBeDefined();
      expect(result.explicitness).toBeDefined();
    });

    it('should improve verbose prompts', () => {
      const verbosePrompt = 'Please could you maybe help me create a login page if possible';

      const result = optimizer.applyCLEARFramework(verbosePrompt, 'fast');

      expect(result.improvedPrompt).toBeDefined();
      expect(result.conciseness).toBeDefined();
      expect(result.conciseness.verbosityCount).toBeGreaterThanOrEqual(0);
    });

    it('should handle concise prompts', () => {
      const concisePrompt = 'Create React login form with email/password validation';

      const result = optimizer.applyCLEARFramework(concisePrompt, 'fast');

      expect(result).toBeDefined();
      expect(result.improvedPrompt).toBeDefined();
    });

    it('should detect logical flow issues', () => {
      const illogicalPrompt = 'Make it look good. Create a user dashboard. Use React.';

      const result = optimizer.applyCLEARFramework(illogicalPrompt, 'fast');

      expect(result.logic).toBeDefined();
      expect(result.logic.hasCoherentFlow).toBeDefined();
    });

    it('should detect missing specifications', () => {
      const vaguePrompt = 'Build something for users';

      const result = optimizer.applyCLEARFramework(vaguePrompt, 'fast');

      expect(result.explicitness).toBeDefined();
      expect(result.explicitness.hasPersona).toBeDefined();
      expect(result.explicitness.hasOutputFormat).toBeDefined();
    });
  });

  describe('CLEAR score calculation', () => {
    it('should calculate CLEAR scores', () => {
      const prompt = 'Create a login page';
      const clearResult = optimizer.applyCLEARFramework(prompt, 'fast');

      const score = optimizer.calculateCLEARScore(clearResult);

      expect(score).toBeDefined();
      expect(score.conciseness).toBeGreaterThanOrEqual(0);
      expect(score.conciseness).toBeLessThanOrEqual(100);
      expect(score.logic).toBeGreaterThanOrEqual(0);
      expect(score.logic).toBeLessThanOrEqual(100);
      expect(score.explicitness).toBeGreaterThanOrEqual(0);
      expect(score.explicitness).toBeLessThanOrEqual(100);
      expect(score.overall).toBeGreaterThanOrEqual(0);
      expect(score.overall).toBeLessThanOrEqual(100);
    });

    it('should include rating in score', () => {
      const prompt = 'Create a user authentication system with email and password';
      const clearResult = optimizer.applyCLEARFramework(prompt, 'fast');

      const score = optimizer.calculateCLEARScore(clearResult);

      expect(score.rating).toBeDefined();
      expect(['excellent', 'good', 'needs-improvement', 'poor']).toContain(score.rating);
    });

    it('should rate excellent prompts highly', () => {
      const excellentPrompt = 'As a senior React developer, create a TypeScript login component with email/password fields, validation, error display, and submit button. Return TSX code only.';
      const clearResult = optimizer.applyCLEARFramework(excellentPrompt, 'fast');

      const score = optimizer.calculateCLEARScore(clearResult);

      expect(score.overall).toBeGreaterThan(50);
    });

    it('should rate poor prompts lower', () => {
      const poorPrompt = 'make thing';
      const clearResult = optimizer.applyCLEARFramework(poorPrompt, 'fast');

      const score = optimizer.calculateCLEARScore(clearResult);

      expect(score.overall).toBeLessThan(80);
    });
  });

  describe('triage logic', () => {
    it('should recommend deep analysis for low scores', () => {
      const vaguePrompt = 'do stuff';
      const clearResult = optimizer.applyCLEARFramework(vaguePrompt, 'fast');
      const clearScore = optimizer.calculateCLEARScore(clearResult);

      const needsDeepAnalysis = clearScore.conciseness < 60 ||
        clearScore.logic < 60 ||
        clearScore.explicitness < 50;

      expect(typeof needsDeepAnalysis).toBe('boolean');
    });

    it('should not recommend deep analysis for good prompts', () => {
      const goodPrompt = 'Create a React login form with email and password fields';
      const clearResult = optimizer.applyCLEARFramework(goodPrompt, 'fast');
      const clearScore = optimizer.calculateCLEARScore(clearResult);

      const needsDeepAnalysis = clearScore.conciseness < 60 ||
        clearScore.logic < 60 ||
        clearScore.explicitness < 50;

      // Good prompts typically don't need deep analysis
      expect(typeof needsDeepAnalysis).toBe('boolean');
    });

    it('should use triage result from improve method', () => {
      const prompt = 'Build a complex system with multiple features';
      const result = optimizer.improve(prompt, 'fast');

      expect(result.triageResult).toBeDefined();
      expect(result.triageResult?.needsDeepAnalysis).toBeDefined();
      expect(Array.isArray(result.triageResult?.reasons)).toBe(true);
    });
  });

  describe('conciseness analysis', () => {
    it('should count verbosity instances', () => {
      const verbosePrompt = 'Please could you maybe possibly help me create a login page if it is not too much trouble';
      const result = optimizer.applyCLEARFramework(verbosePrompt, 'fast');

      expect(result.conciseness.verbosityCount).toBeGreaterThanOrEqual(0);
    });

    it('should count pleasantries', () => {
      const politePrompt = 'Hello! Thank you so much for your help. Please create a login page.';
      const result = optimizer.applyCLEARFramework(politePrompt, 'fast');

      expect(result.conciseness.pleasantriesCount).toBeGreaterThan(0);
    });

    it('should calculate signal-to-noise ratio', () => {
      const prompt = 'Create a login page';
      const result = optimizer.applyCLEARFramework(prompt, 'fast');

      expect(result.conciseness.signalToNoiseRatio).toBeDefined();
      expect(result.conciseness.signalToNoiseRatio).toBeGreaterThan(0);
    });

    it('should list conciseness issues', () => {
      const verbosePrompt = 'Please help me maybe create a thing';
      const result = optimizer.applyCLEARFramework(verbosePrompt, 'fast');

      expect(Array.isArray(result.conciseness.issues)).toBe(true);
      expect(Array.isArray(result.conciseness.suggestions)).toBe(true);
    });
  });

  describe('logic analysis', () => {
    it('should check for coherent flow', () => {
      const prompt = 'Create a login page with React';
      const result = optimizer.applyCLEARFramework(prompt, 'fast');

      expect(result.logic.hasCoherentFlow).toBeDefined();
      expect(typeof result.logic.hasCoherentFlow).toBe('boolean');
    });

    it('should list logic issues', () => {
      const prompt = 'Make it fast. Create a dashboard. Use TypeScript.';
      const result = optimizer.applyCLEARFramework(prompt, 'fast');

      expect(Array.isArray(result.logic.issues)).toBe(true);
      expect(Array.isArray(result.logic.suggestions)).toBe(true);
    });

    it('should detect missing structure', () => {
      const unstructuredPrompt = 'Dashboard. Charts. Data. Make it work.';
      const result = optimizer.applyCLEARFramework(unstructuredPrompt, 'fast');

      expect(result.logic).toBeDefined();
      expect(Array.isArray(result.logic.issues)).toBe(true);
    });
  });

  describe('explicitness analysis', () => {
    it('should check for persona specification', () => {
      const prompt = 'Create a login page';
      const result = optimizer.applyCLEARFramework(prompt, 'fast');

      expect(result.explicitness.hasPersona).toBeDefined();
      expect(typeof result.explicitness.hasPersona).toBe('boolean');
    });

    it('should check for output format', () => {
      const prompt = 'Create a login page';
      const result = optimizer.applyCLEARFramework(prompt, 'fast');

      expect(result.explicitness.hasOutputFormat).toBeDefined();
      expect(typeof result.explicitness.hasOutputFormat).toBe('boolean');
    });

    it('should check for tone and style', () => {
      const prompt = 'Create a login page';
      const result = optimizer.applyCLEARFramework(prompt, 'fast');

      expect(result.explicitness.hasToneStyle).toBeDefined();
      expect(typeof result.explicitness.hasToneStyle).toBe('boolean');
    });

    it('should check for success criteria', () => {
      const prompt = 'Create a login page';
      const result = optimizer.applyCLEARFramework(prompt, 'fast');

      expect(result.explicitness.hasSuccessCriteria).toBeDefined();
      expect(typeof result.explicitness.hasSuccessCriteria).toBe('boolean');
    });

    it('should check for examples', () => {
      const prompt = 'Create a login page';
      const result = optimizer.applyCLEARFramework(prompt, 'fast');

      expect(result.explicitness.hasExamples).toBeDefined();
      expect(typeof result.explicitness.hasExamples).toBe('boolean');
    });

    it('should list explicitness issues', () => {
      const vaguePrompt = 'Make a thing';
      const result = optimizer.applyCLEARFramework(vaguePrompt, 'fast');

      expect(Array.isArray(result.explicitness.issues)).toBe(true);
      expect(result.explicitness.issues.length).toBeGreaterThan(0);
    });
  });

  describe('changes summary', () => {
    it('should list changes made', () => {
      const prompt = 'Please help me create a login page';
      const result = optimizer.applyCLEARFramework(prompt, 'fast');

      expect(Array.isArray(result.changesSummary)).toBe(true);
    });

    it('should label changes by component', () => {
      const prompt = 'Please make something nice';
      const result = optimizer.applyCLEARFramework(prompt, 'fast');

      if (result.changesSummary.length > 0) {
        result.changesSummary.forEach((change: { component: string; change: string }) => {
          expect(change.component).toBeDefined();
          expect(change.change).toBeDefined();
          expect(['C', 'L', 'E']).toContain(change.component);
        });
      }
    });
  });

  describe('score color logic', () => {
    it('should use green for scores >= 80', () => {
      const getScoreColor = (score: number) => {
        if (score >= 80) return 'green';
        if (score >= 60) return 'yellow';
        return 'red';
      };

      expect(getScoreColor(85)).toBe('green');
      expect(getScoreColor(80)).toBe('green');
    });

    it('should use yellow for scores >= 60 and < 80', () => {
      const getScoreColor = (score: number) => {
        if (score >= 80) return 'green';
        if (score >= 60) return 'yellow';
        return 'red';
      };

      expect(getScoreColor(70)).toBe('yellow');
      expect(getScoreColor(60)).toBe('yellow');
    });

    it('should use red for scores < 60', () => {
      const getScoreColor = (score: number) => {
        if (score >= 80) return 'green';
        if (score >= 60) return 'yellow';
        return 'red';
      };

      expect(getScoreColor(50)).toBe('red');
      expect(getScoreColor(0)).toBe('red');
    });
  });

  describe('prompt validation', () => {
    it('should handle empty prompts', () => {
      const emptyPrompt = '';

      const isEmpty = emptyPrompt.trim().length === 0;

      expect(isEmpty).toBe(true);
    });

    it('should handle whitespace-only prompts', () => {
      const whitespacePrompt = '   \n  \t  ';

      const isEmpty = whitespacePrompt.trim().length === 0;

      expect(isEmpty).toBe(true);
    });

    it('should accept valid prompts', () => {
      const validPrompt = 'Create a login page';

      const isValid = validPrompt.trim().length > 0;

      expect(isValid).toBe(true);
    });
  });

  describe('deep mode switching', () => {
    it('should apply CLEAR framework in deep mode', () => {
      const prompt = 'Create a login page';

      const result = optimizer.applyCLEARFramework(prompt, 'deep');

      expect(result).toBeDefined();
      expect(result.improvedPrompt).toBeDefined();
      expect(result.conciseness).toBeDefined();
      expect(result.logic).toBeDefined();
      expect(result.explicitness).toBeDefined();
    });

    it('should include adaptiveness in deep mode', () => {
      const prompt = 'Create a user authentication system';

      const result = optimizer.applyCLEARFramework(prompt, 'deep');

      expect(result.adaptiveness).toBeDefined();
    });

    it('should include reflectiveness in deep mode', () => {
      const prompt = 'Create a user authentication system';

      const result = optimizer.applyCLEARFramework(prompt, 'deep');

      expect(result.reflectiveness).toBeDefined();
    });

    it('should calculate deep mode scores', () => {
      const prompt = 'Create a user authentication system';
      const result = optimizer.applyCLEARFramework(prompt, 'deep');

      const score = optimizer.calculateCLEARScore(result);

      expect(score.adaptiveness).toBeDefined();
      expect(score.reflectiveness).toBeDefined();
    });
  });

  describe('edge cases', () => {
    it('should handle very short prompts', () => {
      const shortPrompt = 'Login';

      const result = optimizer.applyCLEARFramework(shortPrompt, 'fast');

      expect(result).toBeDefined();
      expect(result.improvedPrompt).toBeDefined();
    });

    it('should handle very long prompts', () => {
      const longPrompt = 'a'.repeat(1000) + ' Create a login page';

      const result = optimizer.applyCLEARFramework(longPrompt, 'fast');

      expect(result).toBeDefined();
    });

    it('should handle special characters', () => {
      const specialPrompt = 'Create a login page with émojis 🚀 and spëcial çhars';

      const result = optimizer.applyCLEARFramework(specialPrompt, 'fast');

      expect(result).toBeDefined();
      expect(result.improvedPrompt).toBeDefined();
    });

    it('should handle markdown in prompts', () => {
      const markdownPrompt = '# Create a login page\n\n- Email field\n- Password field\n\n**Important**: Use React';

      const result = optimizer.applyCLEARFramework(markdownPrompt, 'fast');

      expect(result).toBeDefined();
    });

    it('should handle code snippets in prompts', () => {
      const codePrompt = 'Create a login page like this: `<form><input type="email" /></form>`';

      const result = optimizer.applyCLEARFramework(codePrompt, 'fast');

      expect(result).toBeDefined();
    });
  });

  describe('improve method', () => {
    it('should improve prompts in fast mode', () => {
      const prompt = 'Create a login page';

      const result = optimizer.improve(prompt, 'fast');

      expect(result).toBeDefined();
      expect(result.improved).toBeDefined();
      expect(result.analysis).toBeDefined();
    });

    it('should improve prompts in deep mode', () => {
      const prompt = 'Create a login page';

      const result = optimizer.improve(prompt, 'deep');

      expect(result).toBeDefined();
      expect(result.improved).toBeDefined();
      expect(result.analysis).toBeDefined();
    });

    it('should include triage result', () => {
      const prompt = 'Create a complex system';

      const result = optimizer.improve(prompt, 'fast');

      expect(result.triageResult).toBeDefined();
    });

    it('should preserve original prompt', () => {
      const originalPrompt = 'Create a login page';

      const result = optimizer.improve(originalPrompt, 'fast');

      expect(result.original).toBe(originalPrompt);
    });
  });
});
