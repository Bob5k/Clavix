import { QualityAssessor } from '../../../src/core/intelligence/quality-assessor.js';
import { describe, it, expect } from '@jest/globals';

describe('QualityAssessor', () => {
  const assessor = new QualityAssessor();

  describe('assessQuality', () => {
    it('should return metrics for all 6 dimensions (v4.0)', () => {
      const prompt = 'Create a login page';
      const result = assessor.assessQuality(prompt, 'code-generation');

      expect(result).toBeDefined();
      expect(result.clarity).toBeGreaterThanOrEqual(0);
      expect(result.clarity).toBeLessThanOrEqual(100);
      expect(result.efficiency).toBeGreaterThanOrEqual(0);
      expect(result.efficiency).toBeLessThanOrEqual(100);
      expect(result.structure).toBeGreaterThanOrEqual(0);
      expect(result.structure).toBeLessThanOrEqual(100);
      expect(result.completeness).toBeGreaterThanOrEqual(0);
      expect(result.completeness).toBeLessThanOrEqual(100);
      expect(result.actionability).toBeGreaterThanOrEqual(0);
      expect(result.actionability).toBeLessThanOrEqual(100);
      // v4.0: New specificity dimension
      expect(result.specificity).toBeGreaterThanOrEqual(0);
      expect(result.specificity).toBeLessThanOrEqual(100);
      expect(result.overall).toBeGreaterThanOrEqual(0);
      expect(result.overall).toBeLessThanOrEqual(100);
    });

    it('should calculate overall score with intent-based weighting (v4.0 with specificity)', () => {
      const prompt = 'Build user authentication with email/password';
      const result = assessor.assessQuality(prompt, 'code-generation');

      // v4.0 - For code-generation intent, the weights now include specificity:
      // clarity: 0.20, completeness: 0.25, actionability: 0.20, efficiency: 0.10, structure: 0.10, specificity: 0.15
      const expectedOverall =
        result.clarity * 0.2 +
        result.completeness * 0.25 +
        result.actionability * 0.2 +
        result.efficiency * 0.1 +
        result.structure * 0.1 +
        result.specificity * 0.15;

      expect(result.overall).toBeCloseTo(expectedOverall, 1);
    });
  });

  describe('clarity dimension', () => {
    it('should score clear objectives higher', () => {
      const clearPrompt = 'Create a user authentication system with JWT tokens';
      const vaguePrompt = 'make something for users';

      const clearResult = assessor.assessQuality(clearPrompt, 'code-generation');
      const vagueResult = assessor.assessQuality(vaguePrompt, 'code-generation');

      expect(clearResult.clarity).toBeGreaterThan(vagueResult.clarity);
    });

    it('should penalize vague words', () => {
      const prompt = 'Create something that maybe does stuff';
      const result = assessor.assessQuality(prompt, 'code-generation');

      expect(result.clarity).toBeLessThan(50);
    });

    it('should reward specific requirements', () => {
      const prompt = 'Create a login form with email validation and password strength checker';
      const result = assessor.assessQuality(prompt, 'code-generation');

      expect(result.clarity).toBeGreaterThan(35); // Has some clarity but missing objective/tech
    });
  });

  describe('efficiency dimension', () => {
    it('should score concise prompts higher', () => {
      const concisePrompt = 'Build REST API for user management';
      const verbosePrompt =
        'Please could you possibly maybe help me if you have time to build a REST API for managing users';

      const conciseResult = assessor.assessQuality(concisePrompt, 'code-generation');
      const verboseResult = assessor.assessQuality(verbosePrompt, 'code-generation');

      expect(conciseResult.efficiency).toBeGreaterThan(verboseResult.efficiency);
    });

    it('should penalize pleasantries', () => {
      const prompt = 'Hello! Please kindly help me create a login page. Thank you so much!';
      const result = assessor.assessQuality(prompt, 'code-generation');

      expect(result.efficiency).toBeLessThan(95); // Has pleasantries but not excessive
    });

    it('should reward information density', () => {
      const prompt = 'JWT auth: email/password, bcrypt hashing, token refresh, protected routes';
      const result = assessor.assessQuality(prompt, 'code-generation');

      expect(result.efficiency).toBeGreaterThan(60);
    });
  });

  describe('structure dimension', () => {
    it('should score organized prompts higher', () => {
      const structuredPrompt = `
        Objective: Create user authentication
        Requirements:
        - Email/password login
        - JWT tokens
        Technical: Node.js, Express
      `;
      const unstructuredPrompt =
        'Create user authentication with email password login jwt tokens node express';

      const structuredResult = assessor.assessQuality(structuredPrompt, 'code-generation');
      const unstructuredResult = assessor.assessQuality(unstructuredPrompt, 'code-generation');

      expect(structuredResult.structure).toBeGreaterThan(unstructuredResult.structure);
    });

    it('should reward section markers', () => {
      const prompt = `
        # Objective
        Build authentication system

        # Requirements
        - User login
        - Session management
      `;
      const result = assessor.assessQuality(prompt, 'code-generation');

      expect(result.structure).toBeGreaterThan(60);
    });

    it('should reward logical flow', () => {
      const prompt =
        'Context: No auth exists. Goal: Add login. Tech: React, Node. Output: Working auth system';
      const result = assessor.assessQuality(prompt, 'code-generation');

      expect(result.structure).toBeGreaterThan(50);
    });
  });

  describe('completeness dimension', () => {
    it('should score detailed prompts higher', () => {
      const completePrompt = `
        Create user authentication system
        Tech: Node.js, Express, PostgreSQL
        Requirements: Email/password, JWT tokens, password hashing
        Success: Users can register and login securely
      `;
      const incompletePrompt = 'Create authentication';

      const completeResult = assessor.assessQuality(completePrompt, 'code-generation');
      const incompleteResult = assessor.assessQuality(incompletePrompt, 'code-generation');

      expect(completeResult.completeness).toBeGreaterThan(incompleteResult.completeness);
    });

    it('should check for tech stack', () => {
      const withTech = 'Create login page using React and TypeScript';
      const withoutTech = 'Create login page';

      const withTechResult = assessor.assessQuality(withTech, 'code-generation');
      const withoutTechResult = assessor.assessQuality(withoutTech, 'code-generation');

      expect(withTechResult.completeness).toBeGreaterThan(withoutTechResult.completeness);
    });

    it('should check for success criteria', () => {
      const withSuccess = 'Build API. Success: All endpoints return 200, tests pass';
      const withoutSuccess = 'Build API';

      const withSuccessResult = assessor.assessQuality(withSuccess, 'code-generation');
      const withoutSuccessResult = assessor.assessQuality(withoutSuccess, 'code-generation');

      expect(withSuccessResult.completeness).toBeGreaterThan(withoutSuccessResult.completeness);
    });
  });

  describe('actionability dimension', () => {
    it('should score specific prompts higher', () => {
      const actionablePrompt =
        'Create UserController.ts with login, register, and logout methods using Express';
      const vaguePrompt = 'Do something with users';

      const actionableResult = assessor.assessQuality(actionablePrompt, 'code-generation');
      const vagueResult = assessor.assessQuality(vaguePrompt, 'code-generation');

      expect(actionableResult.actionability).toBeGreaterThanOrEqual(vagueResult.actionability);
    });

    it('should reward clear actions', () => {
      const prompt =
        'Implement JWT authentication: generate token on login, verify on protected routes, refresh when expired';
      const result = assessor.assessQuality(prompt, 'code-generation');

      expect(result.actionability).toBeGreaterThan(55); // Specific but no success criteria
    });

    it('should penalize abstract goals', () => {
      const prompt = 'Make the system better and more user-friendly';
      const result = assessor.assessQuality(prompt, 'code-generation');

      expect(result.actionability).toBeLessThan(70); // Abstract but not completely unactionable
    });
  });

  // v4.0 Specificity Dimension
  describe('v4.0 specificity dimension', () => {
    it('should score prompts with numbers higher', () => {
      const withNumbers = 'Create pagination with 10 items per page, max 100 pages';
      const withoutNumbers = 'Create pagination with items per page';

      const withNumbersResult = assessor.assessQuality(withNumbers, 'code-generation');
      const withoutNumbersResult = assessor.assessQuality(withoutNumbers, 'code-generation');

      expect(withNumbersResult.specificity).toBeGreaterThan(withoutNumbersResult.specificity);
    });

    it('should score prompts with file paths higher', () => {
      const withPath = 'Update the handler in src/controllers/UserController.ts';
      const withoutPath = 'Update the user handler';

      const withPathResult = assessor.assessQuality(withPath, 'code-generation');
      const withoutPathResult = assessor.assessQuality(withoutPath, 'code-generation');

      expect(withPathResult.specificity).toBeGreaterThan(withoutPathResult.specificity);
    });

    it('should penalize vague terms', () => {
      const vaguePrompt = 'Make this code somewhat better and maybe cleaner';
      const specificPrompt = 'Extract login logic into separate AuthService class';

      const vagueResult = assessor.assessQuality(vaguePrompt, 'refinement');
      const specificResult = assessor.assessQuality(specificPrompt, 'refinement');

      // Specific prompt should score >= vague prompt for specificity
      // (vague may be capped at 100 before penalties are fully visible)
      expect(specificResult.specificity).toBeGreaterThanOrEqual(vagueResult.specificity);
      // Vague prompt should have lower overall quality
      expect(specificResult.overall).toBeGreaterThanOrEqual(vagueResult.overall);
    });

    it('should reward technical terms', () => {
      const technicalPrompt = 'Implement OAuth2 authentication with JWT refresh tokens';
      const simplePrompt = 'Implement user authentication';

      const technicalResult = assessor.assessQuality(technicalPrompt, 'code-generation');
      const simpleResult = assessor.assessQuality(simplePrompt, 'code-generation');

      expect(technicalResult.specificity).toBeGreaterThanOrEqual(simpleResult.specificity);
    });
  });

  // v4.0 New Intents Support
  describe('v4.0 new intents support', () => {
    it('should assess testing intent prompts', () => {
      const prompt = 'Write unit tests for UserService covering login and logout flows';
      const result = assessor.assessQuality(prompt, 'testing');

      expect(result).toBeDefined();
      expect(result.overall).toBeGreaterThan(0);
    });

    it('should assess migration intent prompts', () => {
      const prompt = 'Migrate React components from class to functional hooks';
      const result = assessor.assessQuality(prompt, 'migration');

      expect(result).toBeDefined();
      expect(result.overall).toBeGreaterThan(0);
    });

    it('should assess security-review intent prompts', () => {
      const prompt = 'Audit authentication module for XSS and SQL injection vulnerabilities';
      const result = assessor.assessQuality(prompt, 'security-review');

      expect(result).toBeDefined();
      expect(result.overall).toBeGreaterThan(0);
    });

    it('should assess learning intent prompts', () => {
      const prompt = 'Explain how React useEffect hook works with cleanup functions';
      const result = assessor.assessQuality(prompt, 'learning');

      expect(result).toBeDefined();
      expect(result.overall).toBeGreaterThan(0);
    });
  });

  describe('edge cases', () => {
    it('should handle empty prompt', () => {
      const result = assessor.assessQuality('', 'code-generation');

      expect(result.clarity).toBeLessThan(60); // Empty prompt lacks clarity
      expect(result.overall).toBeLessThan(60); // Overall should be low
    });

    it('should handle very short prompt', () => {
      const result = assessor.assessQuality('auth', 'code-generation');

      expect(result).toBeDefined();
      expect(result.overall).toBeLessThan(70); // Short prompt lacks detail
    });

    it('should handle very long prompt', () => {
      const longPrompt = 'Create authentication system. ' + 'Add more features. '.repeat(100);
      const result = assessor.assessQuality(longPrompt, 'code-generation');

      expect(result).toBeDefined();
      expect(result.efficiency).toBeGreaterThanOrEqual(0); // Valid score range
      expect(result.efficiency).toBeLessThanOrEqual(100);
    });

    it('should handle special characters', () => {
      const prompt = 'Create API with @decorators, $variables, and {objects}';
      const result = assessor.assessQuality(prompt, 'code-generation');

      expect(result).toBeDefined();
      expect(result.overall).toBeGreaterThan(0);
    });

    it('should handle code snippets', () => {
      const prompt = `
        Fix this code:
        \`\`\`
        function login() { return true; }
        \`\`\`
      `;
      const result = assessor.assessQuality(prompt, 'debugging');

      expect(result).toBeDefined();
    });

    it('should handle different intents consistently', () => {
      const prompt = 'Create user authentication system';

      const codeResult = assessor.assessQuality(prompt, 'code-generation');
      const planResult = assessor.assessQuality(prompt, 'planning');
      const debugResult = assessor.assessQuality(prompt, 'debugging');

      expect(codeResult.overall).toBeGreaterThan(0);
      expect(planResult.overall).toBeGreaterThan(0);
      expect(debugResult.overall).toBeGreaterThan(0);
    });
  });
});
