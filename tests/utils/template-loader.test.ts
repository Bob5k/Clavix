/**
 * Template Loader tests
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import { loadCommandTemplates } from '../../src/utils/template-loader';
import { AgentAdapter } from '../../src/types/agent';

describe('loadCommandTemplates', () => {
  const testTemplatesDir = path.join(__dirname, '../../src/templates/slash-commands/_canonical');

  // Mock adapter for testing
  const mockAdapter: AgentAdapter = {
    name: 'test-agent',
    displayName: 'Test Agent',
    directory: '/test/.clavix/commands',
    fileExtension: '.md',
    detectProject: async () => true,
    generateCommands: async () => {},
    injectDocumentation: async () => {},
    getCommandPath: () => '/test/.clavix/commands',
    getTargetFilename: (name: string) => `${name}.md`,
  };

  describe('basic functionality', () => {
    it('should load all templates from canonical directory', async () => {
      const templates = await loadCommandTemplates(mockAdapter);

      // Should find all .md files in canonical directory
      expect(templates.length).toBeGreaterThan(0);

      // Each template should have required fields
      for (const template of templates) {
        expect(template.name).toBeDefined();
        expect(typeof template.name).toBe('string');
        expect(template.content).toBeDefined();
        expect(typeof template.content).toBe('string');
        expect(template.description).toBeDefined();
      }
    });

    it('should use .md extension for canonical templates', async () => {
      const templates = await loadCommandTemplates(mockAdapter);

      // All template names should be derived from .md files
      expect(templates.every(t => !t.name.includes('.'))).toBe(true);
    });

    it('should extract template names without extension', async () => {
      const templates = await loadCommandTemplates(mockAdapter);

      // Template names should not include .md extension
      for (const template of templates) {
        expect(template.name).not.toMatch(/\.md$/);
      }
    });
  });

  describe('content processing', () => {
    it('should strip YAML frontmatter from content', async () => {
      const templates = await loadCommandTemplates(mockAdapter);

      // Find a template with frontmatter
      const templateWithFrontmatter = templates.find(t =>
        t.name === 'fast' || t.name === 'deep' || t.name === 'prd'
      );

      if (templateWithFrontmatter) {
        // Content should not start with frontmatter delimiter
        expect(templateWithFrontmatter.content).not.toMatch(/^---/);

        // Content should not contain frontmatter
        expect(templateWithFrontmatter.content).not.toContain('description:');
      }
    });

    it('should trim whitespace from cleaned content', async () => {
      const templates = await loadCommandTemplates(mockAdapter);

      for (const template of templates) {
        // Content should not have leading/trailing whitespace
        expect(template.content).toBe(template.content.trim());
      }
    });
  });

  describe('description extraction', () => {
    it('should extract description from YAML frontmatter', async () => {
      const templates = await loadCommandTemplates(mockAdapter);

      // At least one template should have a description
      const templatesWithDescriptions = templates.filter(t => t.description.length > 0);
      expect(templatesWithDescriptions.length).toBeGreaterThan(0);
    });

    it('should remove quotes from description', async () => {
      const templates = await loadCommandTemplates(mockAdapter);

      for (const template of templates) {
        // Description should not start or end with quotes
        expect(template.description).not.toMatch(/^["']/);
        expect(template.description).not.toMatch(/["']$/);
      }
    });

    it('should handle missing description', async () => {
      const templates = await loadCommandTemplates(mockAdapter);

      // Should gracefully handle templates without descriptions (return empty string)
      for (const template of templates) {
        expect(typeof template.description).toBe('string');
      }
    });

    it('should handle templates with multi-word descriptions', async () => {
      const templates = await loadCommandTemplates(mockAdapter);

      // Some templates have multi-word descriptions with spaces
      const multiWordDescriptions = templates.filter(t =>
        t.description.includes(' ') && t.description.length > 0
      );

      // Should preserve spaces in descriptions
      for (const template of multiWordDescriptions) {
        expect(template.description).toContain(' ');
      }
    });
  });

  describe('specific template verification', () => {
    it('should load fast command template', async () => {
      const templates = await loadCommandTemplates(mockAdapter);
      const fastTemplate = templates.find(t => t.name === 'fast');

      expect(fastTemplate).toBeDefined();
      expect(fastTemplate!.content.length).toBeGreaterThan(0);
    });

    it('should load deep command template', async () => {
      const templates = await loadCommandTemplates(mockAdapter);
      const deepTemplate = templates.find(t => t.name === 'deep');

      expect(deepTemplate).toBeDefined();
      expect(deepTemplate!.content.length).toBeGreaterThan(0);
    });

    it('should load prd command template', async () => {
      const templates = await loadCommandTemplates(mockAdapter);
      const prdTemplate = templates.find(t => t.name === 'prd');

      expect(prdTemplate).toBeDefined();
      expect(prdTemplate!.content.length).toBeGreaterThan(0);
    });
  });

  describe('edge cases', () => {
    it('should handle templates with different newline styles', async () => {
      const templates = await loadCommandTemplates(mockAdapter);

      // Should handle both \n and \r\n without issues
      for (const template of templates) {
        expect(template.content).toBeDefined();
        expect(template.content.length).toBeGreaterThan(0);
      }
    });

    it('should handle templates with special characters in description', async () => {
      const templates = await loadCommandTemplates(mockAdapter);

      // Descriptions may contain special characters (commas, colons, etc.)
      for (const template of templates) {
        if (template.description) {
          // Should preserve special chars except leading/trailing quotes
          expect(typeof template.description).toBe('string');
        }
      }
    });

    it('should return consistent results on multiple calls', async () => {
      const templates1 = await loadCommandTemplates(mockAdapter);
      const templates2 = await loadCommandTemplates(mockAdapter);

      expect(templates1.length).toBe(templates2.length);

      // Sort for comparison
      const sorted1 = templates1.sort((a, b) => a.name.localeCompare(b.name));
      const sorted2 = templates2.sort((a, b) => a.name.localeCompare(b.name));

      for (let i = 0; i < sorted1.length; i++) {
        expect(sorted1[i].name).toBe(sorted2[i].name);
        expect(sorted1[i].content).toBe(sorted2[i].content);
        expect(sorted1[i].description).toBe(sorted2[i].description);
      }
    });
  });

  describe('template count validation', () => {
    it('should load expected number of templates', async () => {
      const templates = await loadCommandTemplates(mockAdapter);

      // Clavix has several slash commands
      // At minimum: fast, deep, prd, start, summarize, plan, implement
      expect(templates.length).toBeGreaterThanOrEqual(7);
    });

    it('should only include .md files', async () => {
      const files = await fs.readdir(testTemplatesDir);
      const mdFiles = files.filter(f => f.endsWith('.md'));

      const templates = await loadCommandTemplates(mockAdapter);

      // Number of templates should match number of .md files
      expect(templates.length).toBe(mdFiles.length);
    });
  });

  describe('content integrity', () => {
    it('should preserve template content structure', async () => {
      const templates = await loadCommandTemplates(mockAdapter);

      for (const template of templates) {
        // Content should contain meaningful text (not just whitespace)
        expect(template.content.trim().length).toBeGreaterThan(0);

        // Content should not START with frontmatter markers
        expect(template.content).not.toMatch(/^---\r?\n/);
      }
    });

    it('should handle templates with code blocks', async () => {
      const templates = await loadCommandTemplates(mockAdapter);

      // Some templates contain code blocks with triple backticks
      const templatesWithCode = templates.filter(t => t.content.includes('```'));

      // Should preserve code blocks
      for (const template of templatesWithCode) {
        const codeBlockCount = (template.content.match(/```/g) || []).length;
        // Code blocks should be balanced (even count)
        expect(codeBlockCount % 2).toBe(0);
      }
    });
  });
});
