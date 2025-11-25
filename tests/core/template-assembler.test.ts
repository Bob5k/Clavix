import { TemplateAssembler } from '../../src/core/template-assembler.js';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import * as path from 'path';

describe('TemplateAssembler', () => {
  // Use actual templates path for realistic tests
  const templatesPath = path.join(process.cwd(), 'src', 'templates');
  let assembler: TemplateAssembler;

  beforeEach(() => {
    assembler = new TemplateAssembler(templatesPath);
  });

  describe('hasIncludes', () => {
    it('should detect include markers', () => {
      const content = 'Hello {{INCLUDE:mode-headers/planning-mode.md}} World';
      expect(assembler.hasIncludes(content)).toBe(true);
    });

    it('should detect include markers with variables', () => {
      const content = '{{INCLUDE:sections/header.md TITLE="Test"}}';
      expect(assembler.hasIncludes(content)).toBe(true);
    });

    it('should return false for content without includes', () => {
      const content = 'Hello World, no includes here';
      expect(assembler.hasIncludes(content)).toBe(false);
    });

    it('should not match mustache variables as includes', () => {
      const content = 'Hello {{VAR_NAME}} World';
      expect(assembler.hasIncludes(content)).toBe(false);
    });
  });

  describe('interpolateVariables', () => {
    it('should replace simple variables', () => {
      const content = 'Hello {{NAME}}, welcome to {{PROJECT}}!';
      const variables = { NAME: 'User', PROJECT: 'Clavix' };

      const result = assembler.interpolateVariables(content, variables);

      expect(result).toBe('Hello User, welcome to Clavix!');
    });

    it('should handle undefined variables', () => {
      const content = 'Hello {{NAME}}, your ID is {{USER_ID}}';
      const variables = { NAME: 'User' };

      const result = assembler.interpolateVariables(content, variables);

      expect(result).toBe('Hello User, your ID is {{USER_ID}}');
    });

    it('should handle arrays as comma-separated values', () => {
      const content = 'Tags: {{TAGS}}';
      const variables = { TAGS: ['react', 'typescript', 'node'] };

      const result = assembler.interpolateVariables(content, variables);

      expect(result).toBe('Tags: react, typescript, node');
    });

    it('should process section blocks for conditionals', () => {
      const content = '{{#SHOW_HEADER}}Header Content{{/SHOW_HEADER}}Body';
      const variablesWithHeader = { SHOW_HEADER: 'true' };
      const variablesWithoutHeader = {};

      const resultWith = assembler.interpolateVariables(content, variablesWithHeader);
      const resultWithout = assembler.interpolateVariables(content, variablesWithoutHeader);

      expect(resultWith).toBe('Header ContentBody');
      expect(resultWithout).toBe('Body');
    });

    it('should iterate over arrays in section blocks', () => {
      const content = '{{#ITEMS}}Item: {{.}}\n{{/ITEMS}}';
      const variables = { ITEMS: ['one', 'two', 'three'] };

      const result = assembler.interpolateVariables(content, variables);

      expect(result).toContain('Item: one');
      expect(result).toContain('Item: two');
      expect(result).toContain('Item: three');
    });
  });

  describe('assembleFromContent', () => {
    it('should return content without includes unchanged', async () => {
      const content = 'Simple content without includes';

      const result = await assembler.assembleFromContent(content);

      expect(result.content).toBe(content);
      expect(result.includedComponents).toHaveLength(0);
      expect(result.missingComponents).toHaveLength(0);
    });

    it('should mark missing components', async () => {
      const content = '{{INCLUDE:nonexistent/component.md}}';

      const result = await assembler.assembleFromContent(content);

      expect(result.missingComponents).toContain('nonexistent/component.md');
      expect(result.content).toContain('<!-- MISSING COMPONENT: nonexistent/component.md -->');
    });

    it('should track included components', async () => {
      // Test with a component that exists
      const content = '{{INCLUDE:mode-headers/planning-mode.md}}';

      const result = await assembler.assembleFromContent(content);

      // Either component was found and included, or marked as missing
      const wasProcessed =
        result.includedComponents.length > 0 || result.missingComponents.length > 0;
      expect(wasProcessed).toBe(true);
    });
  });

  describe('cache management', () => {
    it('should start with empty cache', () => {
      const cached = assembler.getCachedComponents();
      expect(cached).toHaveLength(0);
    });

    it('should clear cache on request', async () => {
      // Try to load something first (may or may not succeed)
      try {
        await assembler.assembleFromContent('{{INCLUDE:mode-headers/planning-mode.md}}');
      } catch {
        // Ignore errors
      }

      assembler.clearCache();

      const cached = assembler.getCachedComponents();
      expect(cached).toHaveLength(0);
    });
  });

  describe('validateTemplate', () => {
    it('should report missing components as errors', async () => {
      // Create an assembler that we can test with known content
      const testAssembler = new TemplateAssembler(templatesPath);

      // Test with a non-existent template
      const result = await testAssembler.validateTemplate('nonexistent-template.md');

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('parseVariables (via include marker)', () => {
    it('should parse variables with double quotes', async () => {
      const content = '{{INCLUDE:missing.md TITLE="Test Title" MODE="Planning"}}';

      const result = await assembler.assembleFromContent(content);

      // Variables should be tracked even if component is missing
      expect(result.variablesUsed).toContain('TITLE');
      expect(result.variablesUsed).toContain('MODE');
    });

    it('should parse variables with single quotes', async () => {
      const content = "{{INCLUDE:missing.md NAME='Single Quoted'}}";

      const result = await assembler.assembleFromContent(content);

      expect(result.variablesUsed).toContain('NAME');
    });

    it('should handle multiple include markers', async () => {
      const content = `
        {{INCLUDE:header.md}}
        Content here
        {{INCLUDE:footer.md}}
      `;

      const result = await assembler.assembleFromContent(content);

      // Both should be marked as missing (or included if they exist)
      const totalProcessed = result.includedComponents.length + result.missingComponents.length;
      expect(totalProcessed).toBe(2);
    });
  });

  describe('v4.0 template structure', () => {
    it('should recognize include marker format', () => {
      // Test the regex pattern used for include detection
      const validIncludes = [
        '{{INCLUDE:mode-headers/planning-mode.md}}',
        '{{INCLUDE:sections/quality-assessment.md}}',
        '{{INCLUDE:troubleshooting/file-not-saved.md}}',
        '{{INCLUDE:mode-headers/header.md TITLE="Test"}}',
      ];

      validIncludes.forEach((include) => {
        expect(assembler.hasIncludes(include)).toBe(true);
      });
    });

    it('should not match invalid include formats', () => {
      const invalidIncludes = [
        '{{ INCLUDE:file.md }}', // Extra spaces
        '{INCLUDE:file.md}', // Single braces
        '{{include:file.md}}', // Lowercase
        '{{INCLUDES:file.md}}', // Typo
      ];

      invalidIncludes.forEach((invalid) => {
        expect(assembler.hasIncludes(invalid)).toBe(false);
      });
    });
  });
});
