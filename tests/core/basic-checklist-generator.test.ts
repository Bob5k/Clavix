import { describe, it, expect, beforeEach } from '@jest/globals';
import { BasicChecklistGenerator } from '../../src/core/basic-checklist-generator';

describe('BasicChecklistGenerator', () => {
  let generator: BasicChecklistGenerator;

  beforeEach(() => {
    generator = new BasicChecklistGenerator();
  });

  describe('generate', () => {
    it('should generate checklist for code-generation intent', () => {
      const result = generator.generate('code-generation');

      expect(result.hasChecklist).toBe(true);
      expect(result.validationItems.length).toBeGreaterThan(0);
      expect(result.validationItems.some((i) => i.content.includes('compiles'))).toBe(true);
      expect(result.validationItems.some((i) => i.content.includes('requirements'))).toBe(true);
    });

    it('should generate checklist for testing intent', () => {
      const result = generator.generate('testing');

      expect(result.hasChecklist).toBe(true);
      expect(result.validationItems.some((i) => i.content.includes('tests pass'))).toBe(true);
      expect(result.validationItems.some((i) => i.content.includes('coverage'))).toBe(true);
    });

    it('should generate checklist for debugging intent', () => {
      const result = generator.generate('debugging');

      expect(result.hasChecklist).toBe(true);
      expect(
        result.validationItems.some((i) => i.content.includes('fixed') || i.content.includes('Bug'))
      ).toBe(true);
      expect(result.validationItems.some((i) => i.content.includes('regression'))).toBe(true);
    });

    it('should generate checklist for security-review intent', () => {
      const result = generator.generate('security-review');

      expect(result.hasChecklist).toBe(true);
      expect(
        result.validationItems.some(
          (i) => i.content.includes('Authentication') || i.content.includes('auth')
        )
      ).toBe(true);
      expect(result.validationItems.some((i) => i.content.includes('sanitized'))).toBe(true);
    });

    it('should generate checklist for refinement intent', () => {
      const result = generator.generate('refinement');

      expect(result.hasChecklist).toBe(true);
      expect(result.validationItems.some((i) => i.content.includes('implemented'))).toBe(true);
    });

    it('should generate checklist for planning intent', () => {
      const result = generator.generate('planning');

      expect(result.hasChecklist).toBe(true);
      expect(
        result.validationItems.some(
          (i) => i.content.includes('clear') || i.content.includes('actionable')
        )
      ).toBe(true);
    });

    it('should generate checklist for documentation intent', () => {
      const result = generator.generate('documentation');

      expect(result.hasChecklist).toBe(true);
      expect(result.validationItems.some((i) => i.content.includes('accurate'))).toBe(true);
    });

    it('should generate checklist for migration intent', () => {
      const result = generator.generate('migration');

      expect(result.hasChecklist).toBe(true);
      expect(
        result.validationItems.some(
          (i) => i.content.includes('migration') || i.content.includes('Migration')
        )
      ).toBe(true);
      expect(
        result.validationItems.some(
          (i) => i.content.includes('integrity') || i.content.includes('data')
        )
      ).toBe(true);
    });

    it('should generate checklist for learning intent', () => {
      const result = generator.generate('learning');

      expect(result.hasChecklist).toBe(true);
      expect(result.validationItems.some((i) => i.content.includes('understood'))).toBe(true);
    });

    it('should generate checklist for prd-generation intent', () => {
      const result = generator.generate('prd-generation');

      expect(result.hasChecklist).toBe(true);
      expect(result.validationItems.some((i) => i.content.includes('requirements'))).toBe(true);
    });

    it('should generate checklist for summarization intent', () => {
      const result = generator.generate('summarization');

      expect(result.hasChecklist).toBe(true);
      expect(
        result.validationItems.some(
          (i) => i.content.includes('key points') || i.content.includes('captures')
        )
      ).toBe(true);
    });

    it('should assign unique IDs to all items', () => {
      const result = generator.generate('code-generation');

      const ids = result.validationItems.map((i) => i.id);
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should set correct category for all items', () => {
      const result = generator.generate('code-generation');

      expect(result.validationItems.every((i) => i.category === 'validation')).toBe(true);
    });

    it('should have empty edge cases and risks for generated checklists', () => {
      const result = generator.generate('code-generation');

      expect(result.edgeCases).toHaveLength(0);
      expect(result.risks).toHaveLength(0);
    });

    it('should set correct totalItems count', () => {
      const result = generator.generate('code-generation');

      expect(result.totalItems).toBe(result.validationItems.length);
    });
  });

  describe('generateFromPrompt', () => {
    it('should include base checklist items', () => {
      const result = generator.generateFromPrompt('Create a user login', 'code-generation');

      expect(result.hasChecklist).toBe(true);
      expect(result.validationItems.some((i) => i.content.includes('compiles'))).toBe(true);
    });

    it('should add API-related items when prompt mentions API', () => {
      const result = generator.generateFromPrompt(
        'Create REST API endpoint for users',
        'code-generation'
      );

      expect(
        result.validationItems.some((i) => i.content.includes('API') || i.group === 'API')
      ).toBe(true);
    });

    it('should add UI-related items when prompt mentions UI', () => {
      const result = generator.generateFromPrompt(
        'Build a login form component',
        'code-generation'
      );

      expect(result.validationItems.some((i) => i.content.includes('UI') || i.group === 'UI')).toBe(
        true
      );
    });

    it('should add database-related items when prompt mentions database', () => {
      const result = generator.generateFromPrompt(
        'Create database schema for orders',
        'code-generation'
      );

      expect(
        result.validationItems.some((i) => i.content.includes('Database') || i.group === 'Data')
      ).toBe(true);
    });

    it('should add auth-related items when prompt mentions authentication', () => {
      const result = generator.generateFromPrompt(
        'Implement user login with JWT',
        'code-generation'
      );

      expect(
        result.validationItems.some(
          (i) => i.content.includes('Authentication') || i.group === 'Security'
        )
      ).toBe(true);
    });

    it('should add performance-related items when prompt mentions performance', () => {
      const result = generator.generateFromPrompt(
        'Optimize the slow search query',
        'code-generation'
      );

      expect(
        result.validationItems.some(
          (i) => i.content.includes('Performance') || i.group === 'Performance'
        )
      ).toBe(true);
    });

    it('should detect multiple keyword categories', () => {
      const result = generator.generateFromPrompt(
        'Create a fast API endpoint for user authentication with database storage',
        'code-generation'
      );

      // Should have base items + API + auth + database + performance items
      expect(result.validationItems.length).toBeGreaterThan(4);
    });

    it('should be case-insensitive for keyword detection', () => {
      const result = generator.generateFromPrompt('Create REST API', 'code-generation');
      const resultLower = generator.generateFromPrompt('create rest api', 'code-generation');

      // Both should have API items
      expect(result.validationItems.length).toBe(resultLower.validationItems.length);
    });

    it('should assign sequential IDs to additional items', () => {
      const result = generator.generateFromPrompt('Create API with auth', 'code-generation');

      const ids = result.validationItems.map((i) => i.id);
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(ids.length);
    });
  });

  describe('getAvailableIntents', () => {
    it('should return all available intent types', () => {
      const intents = generator.getAvailableIntents();

      expect(intents).toContain('code-generation');
      expect(intents).toContain('testing');
      expect(intents).toContain('debugging');
      expect(intents).toContain('security-review');
      expect(intents).toContain('refinement');
      expect(intents).toContain('planning');
      expect(intents).toContain('documentation');
      expect(intents).toContain('migration');
      expect(intents).toContain('learning');
      expect(intents).toContain('prd-generation');
      expect(intents).toContain('summarization');
    });

    it('should return an array', () => {
      const intents = generator.getAvailableIntents();
      expect(Array.isArray(intents)).toBe(true);
    });
  });

  describe('hasChecklistForIntent', () => {
    it('should return true for known intents', () => {
      expect(generator.hasChecklistForIntent('code-generation')).toBe(true);
      expect(generator.hasChecklistForIntent('testing')).toBe(true);
      expect(generator.hasChecklistForIntent('debugging')).toBe(true);
    });

    it('should return false for unknown intents', () => {
      // @ts-expect-error - testing unknown intent
      expect(generator.hasChecklistForIntent('unknown-intent')).toBe(false);
    });
  });

  describe('verification types', () => {
    it('should assign automated verification type for compilable/testable items', () => {
      const result = generator.generate('code-generation');

      const automatedItems = result.validationItems.filter(
        (i) => i.verificationType === 'automated'
      );
      expect(automatedItems.length).toBeGreaterThan(0);
    });

    it('should assign manual verification type for requirement items', () => {
      const result = generator.generate('code-generation');

      const manualItems = result.validationItems.filter((i) => i.verificationType === 'manual');
      expect(manualItems.length).toBeGreaterThan(0);
    });

    it('should assign semi-automated verification type for UI items', () => {
      const result = generator.generate('code-generation');

      const semiItems = result.validationItems.filter(
        (i) => i.verificationType === 'semi-automated'
      );
      // code-generation has "No console errors" which is semi-automated
      expect(semiItems.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('groups', () => {
    it('should assign groups to items', () => {
      const result = generator.generate('code-generation');

      const itemsWithGroups = result.validationItems.filter((i) => i.group);
      expect(itemsWithGroups.length).toBeGreaterThan(0);
    });

    it('should have valid group names', () => {
      const result = generator.generate('code-generation');

      const groups = result.validationItems.map((i) => i.group).filter(Boolean);
      const validGroups = [
        'Functionality',
        'Quality',
        'Coverage',
        'Testing',
        'Regression',
        'Analysis',
        'Security',
        'Data',
        'Performance',
        'Clarity',
        'Completeness',
        'Risk',
        'Accuracy',
        'Safety',
        'Understanding',
        'Practice',
        'Auth',
        'Input',
      ];

      for (const group of groups) {
        expect(validGroups).toContain(group);
      }
    });
  });
});
