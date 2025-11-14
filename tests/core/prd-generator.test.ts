/**
 * PrdGenerator tests
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import { PrdGenerator, PrdGenerationOptions } from '../../src/core/prd-generator';

describe('PrdGenerator', () => {
  const testOutputDir = path.join(__dirname, '../fixtures/test-prd-output');
  const testTemplatesDir = path.join(__dirname, '../fixtures/test-templates');
  let generator: PrdGenerator;

  beforeEach(async () => {
    // Clean up test directories
    await fs.remove(testOutputDir);
    await fs.remove(testTemplatesDir);
    await fs.ensureDir(testOutputDir);
    await fs.ensureDir(testTemplatesDir);
    generator = new PrdGenerator();
  });

  afterEach(async () => {
    // Clean up after tests
    await fs.remove(testOutputDir);
    await fs.remove(testTemplatesDir);
  });

  describe('generate', () => {
    it('should generate PRD documents with default options', async () => {
      const answers = {
        q1: 'Build a task management application for teams',
        q2: 'Task creation, assignment, and tracking',
        q3: 'React, Node.js, PostgreSQL',
        q4: 'Email notifications',
        q5: 'Mobile app support',
      };

      const projectDir = await generator.generate(answers, { outputDir: testOutputDir });

      expect(projectDir).toBeDefined();
      expect(projectDir).toContain(testOutputDir);

      // Check if full PRD was created
      const fullPrdPath = path.join(projectDir, 'full-prd.md');
      expect(await fs.pathExists(fullPrdPath)).toBe(true);

      // Check if quick PRD was created
      const quickPrdPath = path.join(projectDir, 'quick-prd.md');
      expect(await fs.pathExists(quickPrdPath)).toBe(true);
    });

    it('should use custom project name when provided', async () => {
      const answers = { q1: 'Test project' };
      const options: PrdGenerationOptions = {
        projectName: 'custom-project',
        outputDir: testOutputDir,
      };

      const projectDir = await generator.generate(answers, options);

      expect(projectDir).toContain('custom-project');
    });

    it('should use custom output directory when provided', async () => {
      const customOutputDir = path.join(testOutputDir, 'custom-output');
      const answers = { q1: 'Test project' };
      const options: PrdGenerationOptions = {
        outputDir: customOutputDir,
      };

      const projectDir = await generator.generate(answers, options);

      expect(projectDir).toContain(customOutputDir);
      expect(await fs.pathExists(projectDir)).toBe(true);
    });

    it('should use custom timestamp when provided', async () => {
      const customTimestamp = new Date('2024-01-15T12:00:00Z');
      const answers = { q1: 'Test project' };
      const options: PrdGenerationOptions = {
        outputDir: testOutputDir,
        timestamp: customTimestamp,
      };

      const projectDir = await generator.generate(answers, options);
      const fullPrdPath = path.join(projectDir, 'full-prd.md');
      const content = await fs.readFile(fullPrdPath, 'utf-8');

      // Check if timestamp is in the content
      expect(content).toContain('2024');
    });

    it('should create project directory if it does not exist', async () => {
      const answers = { q1: 'New project' };
      const newOutputDir = path.join(testOutputDir, 'new-dir', 'nested');

      await generator.generate(answers, { outputDir: newOutputDir });

      expect(await fs.pathExists(newOutputDir)).toBe(true);
    });

    it('should handle empty answers gracefully', async () => {
      const answers = {};

      const projectDir = await generator.generate(answers, { outputDir: testOutputDir });

      expect(projectDir).toBeDefined();
      expect(await fs.pathExists(projectDir)).toBe(true);
    });
  });

  describe('extractProjectName', () => {
    it('should extract project name from q1 (problem statement)', () => {
      const answers = {
        q1: 'Build a task management system for teams',
      };

      const name = generator.extractProjectName(answers);

      expect(name).toBeDefined();
      expect(name).toMatch(/task-management/);
    });

    it('should extract project name from projectName field', () => {
      const answers = {
        projectName: 'My Awesome Project',
      };

      const name = generator.extractProjectName(answers);

      expect(name).toContain('awesome');
      expect(name).toContain('project');
    });

    it('should extract project name from name field', () => {
      const answers = {
        name: 'Customer Portal',
      };

      const name = generator.extractProjectName(answers);

      expect(name).toContain('customer');
      expect(name).toContain('portal');
    });

    it('should extract project name from title field', () => {
      const answers = {
        title: 'E-commerce Platform',
      };

      const name = generator.extractProjectName(answers);

      expect(name).toContain('commerce');
      expect(name).toContain('platform');
    });

    it('should return timestamp-based name if no suitable field found', () => {
      const answers = {
        someOtherField: 'value',
      };

      const name = generator.extractProjectName(answers);

      expect(name).toMatch(/^project-\d+$/);
    });

    it('should return timestamp-based name if text is too short', () => {
      const answers = {
        q1: 'a',
      };

      const name = generator.extractProjectName(answers);

      expect(name).toMatch(/^project-\d+$/);
    });

    it('should handle non-string values gracefully', () => {
      const answers = {
        q1: 123,
        q2: ['array', 'value'],
      };

      const name = generator.extractProjectName(answers);

      expect(name).toMatch(/^project-\d+$/);
    });
  });

  describe('sanitizeProjectName', () => {
    it('should convert to lowercase', () => {
      const generator = new PrdGenerator();
      // Access private method via any for testing
      const sanitize = (generator as any).sanitizeProjectName.bind(generator);

      expect(sanitize('MyProject')).toBe('myproject');
      expect(sanitize('UPPERCASE')).toBe('uppercase');
    });

    it('should replace spaces with hyphens', () => {
      const generator = new PrdGenerator();
      const sanitize = (generator as any).sanitizeProjectName.bind(generator);

      expect(sanitize('my project name')).toBe('my-project-name');
    });

    it('should remove special characters', () => {
      const generator = new PrdGenerator();
      const sanitize = (generator as any).sanitizeProjectName.bind(generator);

      expect(sanitize('project!@#$%name')).toBe('project-name');
      expect(sanitize('project&*()name')).toBe('project-name');
    });

    it('should collapse multiple hyphens', () => {
      const generator = new PrdGenerator();
      const sanitize = (generator as any).sanitizeProjectName.bind(generator);

      expect(sanitize('my---project---name')).toBe('my-project-name');
    });

    it('should trim leading and trailing hyphens', () => {
      const generator = new PrdGenerator();
      const sanitize = (generator as any).sanitizeProjectName.bind(generator);

      expect(sanitize('-project-name-')).toBe('project-name');
    });

    it('should truncate to 50 characters', () => {
      const generator = new PrdGenerator();
      const sanitize = (generator as any).sanitizeProjectName.bind(generator);

      const longName = 'a'.repeat(100);
      expect(sanitize(longName).length).toBe(50);
    });

    it('should handle empty strings', () => {
      const generator = new PrdGenerator();
      const sanitize = (generator as any).sanitizeProjectName.bind(generator);

      expect(sanitize('')).toBe('');
    });
  });

  describe('prepareAnswersForTemplate', () => {
    it('should map question IDs to friendly names', () => {
      const generator = new PrdGenerator();
      const prepare = (generator as any).prepareAnswersForTemplate.bind(generator);

      const answers = {
        q1: 'Problem statement',
        q2: 'Features list',
        q3: 'Tech stack',
        q4: 'Out of scope',
        q5: 'Additional context',
      };

      const prepared = prepare(answers);

      expect(prepared.problem).toBe('Problem statement');
      expect(prepared.features).toBe('Features list');
      expect(prepared.technical).toBe('Tech stack');
      expect(prepared.outOfScope).toBe('Out of scope');
      expect(prepared.additional).toBe('Additional context');
    });

    it('should preserve unknown fields as-is', () => {
      const generator = new PrdGenerator();
      const prepare = (generator as any).prepareAnswersForTemplate.bind(generator);

      const answers = {
        customField: 'Custom value',
        anotherField: 'Another value',
      };

      const prepared = prepare(answers);

      expect(prepared.customField).toBe('Custom value');
      expect(prepared.anotherField).toBe('Another value');
    });

    it('should handle empty answers', () => {
      const generator = new PrdGenerator();
      const prepare = (generator as any).prepareAnswersForTemplate.bind(generator);

      const prepared = prepare({});

      expect(prepared).toEqual({});
    });
  });

  describe('formatTimestamp', () => {
    it('should format timestamp correctly', () => {
      const generator = new PrdGenerator();
      const format = (generator as any).formatTimestamp.bind(generator);

      const date = new Date('2024-01-15T12:30:00Z');
      const formatted = format(date);

      expect(formatted).toContain('2024');
      expect(formatted).toContain('January');
      expect(formatted).toContain('15');
    });

    it('should include time in formatted output', () => {
      const generator = new PrdGenerator();
      const format = (generator as any).formatTimestamp.bind(generator);

      const date = new Date('2024-01-15T12:30:00Z');
      const formatted = format(date);

      // Should contain time components
      expect(formatted).toMatch(/\d{1,2}:\d{2}/);
    });
  });

  describe('extractNameFromText', () => {
    it('should extract name from text with multiple words', () => {
      const generator = new PrdGenerator();
      const extract = (generator as any).extractNameFromText.bind(generator);

      const name = extract('Build a task management system');

      expect(name).toBe('build-task-management');
    });

    it('should filter out short words', () => {
      const generator = new PrdGenerator();
      const extract = (generator as any).extractNameFromText.bind(generator);

      const name = extract('A task is to be done');

      expect(name).toBe('task');
    });

    it('should take only first 4 words', () => {
      const generator = new PrdGenerator();
      const extract = (generator as any).extractNameFromText.bind(generator);

      const name = extract('This is a very long project name with many words');
      const wordCount = name.split('-').length;

      expect(wordCount).toBeLessThanOrEqual(4);
    });

    it('should remove special characters', () => {
      const generator = new PrdGenerator();
      const extract = (generator as any).extractNameFromText.bind(generator);

      const name = extract('Build! a task@ management# system$');

      expect(name).toMatch(/^[a-z0-9-]+$/);
    });

    it('should return null for empty text', () => {
      const generator = new PrdGenerator();
      const extract = (generator as any).extractNameFromText.bind(generator);

      expect(extract('')).toBeNull();
    });

    it('should return null if all words are too short', () => {
      const generator = new PrdGenerator();
      const extract = (generator as any).extractNameFromText.bind(generator);

      expect(extract('a b c d e')).toBeNull();
    });

    it('should convert to lowercase', () => {
      const generator = new PrdGenerator();
      const extract = (generator as any).extractNameFromText.bind(generator);

      const name = extract('Build TASK Management SYSTEM');

      expect(name).toBe('build-task-management-system');
    });
  });

  describe('error handling', () => {
    it('should handle file write errors gracefully', async () => {
      const answers = { q1: 'Test project' };
      const invalidPath = '/invalid/path/that/does/not/exist';

      await expect(async () => {
        await generator.generate(answers, { outputDir: invalidPath });
      }).rejects.toThrow();
    });
  });

  describe('template selection', () => {
    it('should use custom template if it exists', async () => {
      // Create custom template directory
      const customTemplateDir = '.clavix/templates';
      await fs.ensureDir(customTemplateDir);

      const customFullTemplate = path.join(customTemplateDir, 'full-prd-template.hbs');
      const customQuickTemplate = path.join(customTemplateDir, 'quick-prd-template.hbs');

      await fs.writeFile(customFullTemplate, '# Custom Full PRD\n\n{{metadata.projectName}}');
      await fs.writeFile(customQuickTemplate, '# Custom Quick PRD\n\n{{metadata.projectName}}');

      const answers = { q1: 'Test project' };
      const projectDir = await generator.generate(answers, {
        outputDir: testOutputDir,
        projectName: 'test-custom-template'
      });

      const fullPrdPath = path.join(projectDir, 'full-prd.md');
      const quickPrdPath = path.join(projectDir, 'quick-prd.md');

      const fullContent = await fs.readFile(fullPrdPath, 'utf-8');
      const quickContent = await fs.readFile(quickPrdPath, 'utf-8');

      expect(fullContent).toContain('Custom Full PRD');
      expect(quickContent).toContain('Custom Quick PRD');

      // Clean up
      await fs.remove(customTemplateDir);
    });
  });

  describe('metadata generation', () => {
    it('should include correct metadata in generated PRDs', async () => {
      const answers = { q1: 'Test project' };
      const timestamp = new Date('2024-01-15T12:00:00Z');

      const projectDir = await generator.generate(answers, {
        outputDir: testOutputDir,
        projectName: 'test-metadata',
        timestamp,
      });

      const fullPrdPath = path.join(projectDir, 'full-prd.md');
      const content = await fs.readFile(fullPrdPath, 'utf-8');

      // Metadata should be in the file
      expect(content).toContain('test-metadata');
      expect(content).toContain('2024');
    });
  });
});
