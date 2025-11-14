/**
 * Tests for deep command functionality (full CLEAR framework: C, L, E, A, R)
 */

import { PromptOptimizer } from '../../src/core/prompt-optimizer';

describe('Deep command', () => {
  let optimizer: PromptOptimizer;

  beforeEach(() => {
    optimizer = new PromptOptimizer();
  });

  describe('full CLEAR framework', () => {
    it('should apply all 5 components in deep mode', () => {
      const prompt = 'Create a user authentication system';

      const result = optimizer.applyCLEARFramework(prompt, 'deep');

      expect(result.conciseness).toBeDefined();
      expect(result.logic).toBeDefined();
      expect(result.explicitness).toBeDefined();
      expect(result.adaptiveness).toBeDefined();
      expect(result.reflectiveness).toBeDefined();
    });

    it('should calculate scores for all 5 components', () => {
      const prompt = 'Create a user authentication system';
      const result = optimizer.applyCLEARFramework(prompt, 'deep');

      const score = optimizer.calculateCLEARScore(result);

      expect(score.conciseness).toBeDefined();
      expect(score.logic).toBeDefined();
      expect(score.explicitness).toBeDefined();
      expect(score.adaptiveness).toBeDefined();
      expect(score.reflectiveness).toBeDefined();
      expect(score.overall).toBeDefined();
    });

    it('should generate improved prompt', () => {
      const prompt = 'Create a login page';
      const result = optimizer.applyCLEARFramework(prompt, 'deep');

      expect(result.improvedPrompt).toBeDefined();
      expect(result.improvedPrompt.length).toBeGreaterThan(0);
    });
  });

  describe('adaptive analysis (A component)', () => {
    it('should provide alternative phrasings', () => {
      const prompt = 'Create a user dashboard';
      const result = optimizer.applyCLEARFramework(prompt, 'deep');

      expect(result.adaptiveness).toBeDefined();
      expect(result.adaptiveness?.alternativePhrasings).toBeDefined();
      expect(Array.isArray(result.adaptiveness?.alternativePhrasings)).toBe(true);
    });

    it('should provide alternative structures', () => {
      const prompt = 'Build a task management system';
      const result = optimizer.applyCLEARFramework(prompt, 'deep');

      expect(result.adaptiveness).toBeDefined();
      expect(result.adaptiveness?.alternativeStructures).toBeDefined();
      expect(Array.isArray(result.adaptiveness?.alternativeStructures)).toBe(true);
    });

    it('should have temperature recommendation', () => {
      const prompt = 'Create a creative marketing copy';
      const result = optimizer.applyCLEARFramework(prompt, 'deep');

      expect(result.adaptiveness).toBeDefined();
      expect(result.adaptiveness?.temperatureRecommendation).toBeDefined();
      expect(typeof result.adaptiveness?.temperatureRecommendation).toBe('number');
    });

    it('should have issues and suggestions lists', () => {
      const prompt = 'Make something';
      const result = optimizer.applyCLEARFramework(prompt, 'deep');

      expect(result.adaptiveness).toBeDefined();
      expect(Array.isArray(result.adaptiveness?.issues)).toBe(true);
      expect(Array.isArray(result.adaptiveness?.suggestions)).toBe(true);
    });

    it('should calculate adaptiveness score', () => {
      const prompt = 'Create a dashboard';
      const result = optimizer.applyCLEARFramework(prompt, 'deep');

      expect(result.adaptiveness).toBeDefined();
      expect(result.adaptiveness?.score).toBeDefined();
      expect(result.adaptiveness?.score).toBeGreaterThanOrEqual(0);
      expect(result.adaptiveness?.score).toBeLessThanOrEqual(100);
    });
  });

  describe('reflective analysis (R component)', () => {
    it('should provide validation checklist', () => {
      const prompt = 'Create a payment processing system';
      const result = optimizer.applyCLEARFramework(prompt, 'deep');

      expect(result.reflectiveness).toBeDefined();
      expect(result.reflectiveness?.validationChecklist).toBeDefined();
      expect(Array.isArray(result.reflectiveness?.validationChecklist)).toBe(true);
    });

    it('should identify edge cases', () => {
      const prompt = 'Build a user registration form';
      const result = optimizer.applyCLEARFramework(prompt, 'deep');

      expect(result.reflectiveness).toBeDefined();
      expect(result.reflectiveness?.edgeCases).toBeDefined();
      expect(Array.isArray(result.reflectiveness?.edgeCases)).toBe(true);
    });

    it('should list potential issues', () => {
      const prompt = 'Create an email sender';
      const result = optimizer.applyCLEARFramework(prompt, 'deep');

      expect(result.reflectiveness).toBeDefined();
      expect(result.reflectiveness?.potentialIssues).toBeDefined();
      expect(Array.isArray(result.reflectiveness?.potentialIssues)).toBe(true);
    });

    it('should provide fact-checking steps', () => {
      const prompt = 'Generate a financial report';
      const result = optimizer.applyCLEARFramework(prompt, 'deep');

      expect(result.reflectiveness).toBeDefined();
      expect(result.reflectiveness?.factCheckingSteps).toBeDefined();
      expect(Array.isArray(result.reflectiveness?.factCheckingSteps)).toBe(true);
    });

    it('should include quality criteria', () => {
      const prompt = 'Build a data visualization';
      const result = optimizer.applyCLEARFramework(prompt, 'deep');

      expect(result.reflectiveness).toBeDefined();
      expect(result.reflectiveness?.qualityCriteria).toBeDefined();
      expect(Array.isArray(result.reflectiveness?.qualityCriteria)).toBe(true);
    });

    it('should have issues and suggestions lists', () => {
      const prompt = 'Make a system';
      const result = optimizer.applyCLEARFramework(prompt, 'deep');

      expect(result.reflectiveness).toBeDefined();
      expect(Array.isArray(result.reflectiveness?.issues)).toBe(true);
      expect(Array.isArray(result.reflectiveness?.suggestions)).toBe(true);
    });

    it('should calculate reflectiveness score', () => {
      const prompt = 'Create a system';
      const result = optimizer.applyCLEARFramework(prompt, 'deep');

      expect(result.reflectiveness).toBeDefined();
      expect(result.reflectiveness?.score).toBeDefined();
      expect(result.reflectiveness?.score).toBeGreaterThanOrEqual(0);
      expect(result.reflectiveness?.score).toBeLessThanOrEqual(100);
    });
  });

  describe('mode comparison', () => {
    it('should not include A/R in fast mode', () => {
      const prompt = 'Create a login page';
      const fastResult = optimizer.applyCLEARFramework(prompt, 'fast');

      expect(fastResult.adaptiveness).toBeUndefined();
      expect(fastResult.reflectiveness).toBeUndefined();
    });

    it('should include A/R in deep mode', () => {
      const prompt = 'Create a login page';
      const deepResult = optimizer.applyCLEARFramework(prompt, 'deep');

      expect(deepResult.adaptiveness).toBeDefined();
      expect(deepResult.reflectiveness).toBeDefined();
    });

    it('should maintain C/L/E across both modes', () => {
      const prompt = 'Create a login page';
      const fastResult = optimizer.applyCLEARFramework(prompt, 'fast');
      const deepResult = optimizer.applyCLEARFramework(prompt, 'deep');

      expect(fastResult.conciseness).toBeDefined();
      expect(fastResult.logic).toBeDefined();
      expect(fastResult.explicitness).toBeDefined();

      expect(deepResult.conciseness).toBeDefined();
      expect(deepResult.logic).toBeDefined();
      expect(deepResult.explicitness).toBeDefined();
    });
  });

  describe('changes summary', () => {
    it('should include changes from all components', () => {
      const prompt = 'Please help create something';
      const result = optimizer.applyCLEARFramework(prompt, 'deep');

      expect(Array.isArray(result.changesSummary)).toBe(true);
    });

    it('should label changes by all CLEAR components', () => {
      const prompt = 'Make a nice system';
      const result = optimizer.applyCLEARFramework(prompt, 'deep');

      if (result.changesSummary.length > 0) {
        result.changesSummary.forEach((change: { component: string; change: string }) => {
          expect(change.component).toBeDefined();
          expect(change.change).toBeDefined();
          expect(['C', 'L', 'E', 'A', 'R']).toContain(change.component);
        });
      }
    });
  });

  describe('overall score calculation', () => {
    it('should include all 5 components in deep mode overall score', () => {
      const prompt = 'Create a comprehensive user management system';
      const result = optimizer.applyCLEARFramework(prompt, 'deep');
      const score = optimizer.calculateCLEARScore(result);

      expect(score.overall).toBeDefined();
      expect(score.overall).toBeGreaterThanOrEqual(0);
      expect(score.overall).toBeLessThanOrEqual(100);
    });

    it('should have rating based on overall score', () => {
      const prompt = 'Build something';
      const result = optimizer.applyCLEARFramework(prompt, 'deep');
      const score = optimizer.calculateCLEARScore(result);

      expect(score.rating).toBeDefined();
      expect(['excellent', 'good', 'needs-improvement', 'poor']).toContain(score.rating);
    });
  });

  describe('edge cases', () => {
    it('should handle very simple prompts', () => {
      const simplePrompt = 'Login';
      const result = optimizer.applyCLEARFramework(simplePrompt, 'deep');

      expect(result).toBeDefined();
      expect(result.adaptiveness).toBeDefined();
      expect(result.reflectiveness).toBeDefined();
    });

    it('should handle complex prompts', () => {
      const complexPrompt = `As a senior developer, create a comprehensive user authentication and authorization system with JWT tokens, refresh tokens, role-based access control, email verification, password reset via email, social login (Google, GitHub), rate limiting, and audit logging. The system should be production-ready with proper error handling, security best practices, and comprehensive unit tests.`;
      const result = optimizer.applyCLEARFramework(complexPrompt, 'deep');

      expect(result).toBeDefined();
      expect(result.adaptiveness).toBeDefined();
      expect(result.reflectiveness).toBeDefined();
    });

    it('should handle technical prompts', () => {
      const technicalPrompt = 'Implement a binary search tree with insert, delete, and search operations in TypeScript';
      const result = optimizer.applyCLEARFramework(technicalPrompt, 'deep');

      expect(result).toBeDefined();
      expect(result.reflectiveness?.edgeCases).toBeDefined();
    });

    it('should handle creative prompts', () => {
      const creativePrompt = 'Generate engaging marketing copy for a new productivity app';
      const result = optimizer.applyCLEARFramework(creativePrompt, 'deep');

      expect(result).toBeDefined();
      expect(result.adaptiveness?.temperatureRecommendation).toBeGreaterThan(0.5);
    });
  });

  describe('improve method with deep mode', () => {
    it('should return full result with deep mode', () => {
      const prompt = 'Create a system';
      const result = optimizer.improve(prompt, 'deep');

      expect(result).toBeDefined();
      expect(result.original).toBe(prompt);
      expect(result.improved).toBeDefined();
      expect(result.analysis).toBeDefined();
    });

    it('should include alternative structures', () => {
      const prompt = 'Build a dashboard';
      const result = optimizer.improve(prompt, 'deep');

      expect(result.alternativeStructures).toBeDefined();
    });

    it('should include alternative phrasings', () => {
      const prompt = 'Create an API';
      const result = optimizer.improve(prompt, 'deep');

      expect(result.alternativePhrasings).toBeDefined();
    });

    it('should include edge cases', () => {
      const prompt = 'Build a user input form';
      const result = optimizer.improve(prompt, 'deep');

      expect(result.edgeCases).toBeDefined();
    });

    it('should include potential issues', () => {
      const prompt = 'Create a file upload system';
      const result = optimizer.improve(prompt, 'deep');

      expect(result.potentialIssues).toBeDefined();
    });

    it('should include implementation examples', () => {
      const prompt = 'Build a validation system';
      const result = optimizer.improve(prompt, 'deep');

      expect(result.implementationExamples).toBeDefined();
    });
  });
});
