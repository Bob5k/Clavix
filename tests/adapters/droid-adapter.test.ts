/**
 * Tests for DroidAdapter - Droid CLI (Factory.ai) specific adapter
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import { DroidAdapter } from '../../src/core/adapters/droid-adapter';
import { CommandTemplate } from '../../src/types/agent';

describe('DroidAdapter', () => {
  let adapter: DroidAdapter;
  const testDir = path.join(__dirname, '../fixtures/droid-adapter');
  let originalCwd: string;

  beforeEach(async () => {
    // Clean up and setup
    await fs.remove(testDir);
    await fs.ensureDir(testDir);

    originalCwd = process.cwd();
    process.chdir(testDir);

    adapter = new DroidAdapter();
  });

  afterEach(async () => {
    process.chdir(originalCwd);
    await fs.remove(testDir);
  });

  describe('adapter properties', () => {
    it('should have Droid specific properties', () => {
      expect(adapter.name).toBe('droid');
      expect(adapter.displayName).toBe('Droid CLI');
      expect(adapter.directory).toBe('.factory/commands');
      expect(adapter.fileExtension).toBe('.md');
    });

    it('should have correct feature flags', () => {
      expect(adapter.features).toEqual({
        supportsSubdirectories: false,
        supportsFrontmatter: true,
        frontmatterFields: ['description', 'argument-hint'],
        argumentPlaceholder: '$ARGUMENTS',
      });
    });

    it('should support frontmatter', () => {
      expect(adapter.features.supportsFrontmatter).toBe(true);
    });

    it('should have frontmatter fields defined', () => {
      expect(adapter.features.frontmatterFields).toContain('description');
      expect(adapter.features.frontmatterFields).toContain('argument-hint');
    });

    it('should use $ARGUMENTS placeholder', () => {
      expect(adapter.features.argumentPlaceholder).toBe('$ARGUMENTS');
    });

    it('should implement getCommandPath', () => {
      const commandPath = adapter.getCommandPath();
      expect(commandPath).toBe('.factory/commands');
    });
  });

  describe('detectProject', () => {
    it('should detect when .factory directory exists', async () => {
      await fs.ensureDir('.factory');
      const detected = await adapter.detectProject();
      expect(detected).toBe(true);
    });

    it('should not detect when .factory directory does not exist', async () => {
      const detected = await adapter.detectProject();
      expect(detected).toBe(false);
    });

    it('should detect .factory with config files', async () => {
      await fs.ensureDir('.factory');
      await fs.writeFile('.factory/config.yml', 'config');

      const detected = await adapter.detectProject();
      expect(detected).toBe(true);
    });
  });

  describe('formatCommand', () => {
    it('should add YAML frontmatter to commands', () => {
      const template: CommandTemplate = {
        name: 'test',
        description: 'Test command',
        content: '# Test\n\nCommand content',
      };

      const formatted = (adapter as any).formatCommand(template);

      expect(formatted).toContain('---');
      expect(formatted).toContain('description: Test command');
      expect(formatted).toContain('argument-hint: [prompt]');
      expect(formatted).toContain('# Test');
    });

    it('should include description in frontmatter', () => {
      const template: CommandTemplate = {
        name: 'example',
        description: 'Example description',
        content: 'Content',
      };

      const formatted = (adapter as any).formatCommand(template);

      expect(formatted).toMatch(/^---\ndescription: Example description/);
    });

    it('should include argument-hint in frontmatter', () => {
      const template: CommandTemplate = {
        name: 'test',
        description: 'Test',
        content: 'Content',
      };

      const formatted = (adapter as any).formatCommand(template);

      expect(formatted).toContain('argument-hint: [prompt]');
    });

    it('should separate frontmatter from content', () => {
      const template: CommandTemplate = {
        name: 'test',
        description: 'Test',
        content: 'Content',
      };

      const formatted = (adapter as any).formatCommand(template);

      // Frontmatter should be closed with ---
      const parts = formatted.split('---\n');
      expect(parts.length).toBeGreaterThanOrEqual(2);
    });

    it('should replace {{ARGS}} with $ARGUMENTS', () => {
      const template: CommandTemplate = {
        name: 'test',
        description: 'Test',
        content: 'Process {{ARGS}} and use {{ARGS}} again',
      };

      const formatted = (adapter as any).formatCommand(template);

      expect(formatted).toContain('$ARGUMENTS');
      expect(formatted).not.toContain('{{ARGS}}');
      expect(formatted).toContain('Process $ARGUMENTS and use $ARGUMENTS again');
    });

    it('should handle content without placeholders', () => {
      const template: CommandTemplate = {
        name: 'test',
        description: 'Test',
        content: 'Simple content without args',
      };

      const formatted = (adapter as any).formatCommand(template);

      expect(formatted).toContain('Simple content without args');
    });

    it('should handle multiple {{ARGS}} placeholders', () => {
      const template: CommandTemplate = {
        name: 'test',
        description: 'Test',
        content: '{{ARGS}} {{ARGS}} {{ARGS}}',
      };

      const formatted = (adapter as any).formatCommand(template);

      const matches = formatted.match(/\$ARGUMENTS/g);
      expect(matches).toHaveLength(3);
    });

    it('should preserve content structure', () => {
      const template: CommandTemplate = {
        name: 'test',
        description: 'Test',
        content: '# Title\n\nParagraph 1\n\nParagraph 2',
      };

      const formatted = (adapter as any).formatCommand(template);

      expect(formatted).toContain('# Title');
      expect(formatted).toContain('Paragraph 1');
      expect(formatted).toContain('Paragraph 2');
    });
  });

  describe('generateCommands', () => {
    it('should generate commands with frontmatter', async () => {
      const templates: CommandTemplate[] = [
        {
          name: 'fast',
          description: 'Fast improvements',
          content: '# Fast Mode',
        },
      ];

      await adapter.generateCommands(templates);

      const content = await fs.readFile(
        '.factory/commands/clavix-fast.md',
        'utf-8'
      );

      expect(content).toContain('---');
      expect(content).toContain('description: Fast improvements');
      expect(content).toContain('argument-hint: [prompt]');
      expect(content).toContain('# Fast Mode');
    });

    it('should create .factory directory structure', async () => {
      const templates: CommandTemplate[] = [
        { name: 'test', description: 'Test', content: 'Content' },
      ];

      await adapter.generateCommands(templates);

      expect(await fs.pathExists('.factory')).toBe(true);
      expect(await fs.pathExists('.factory/commands')).toBe(true);
    });

    it('should generate multiple commands', async () => {
      const templates: CommandTemplate[] = [
        { name: 'cmd1', description: 'Command 1', content: 'Content 1' },
        { name: 'cmd2', description: 'Command 2', content: 'Content 2' },
      ];

      await adapter.generateCommands(templates);

      const files = await fs.readdir('.factory/commands');
      expect(files).toContain('clavix-cmd1.md');
      expect(files).toContain('clavix-cmd2.md');
    });

    it('should replace placeholders in generated files', async () => {
      const templates: CommandTemplate[] = [
        {
          name: 'process',
          description: 'Process data',
          content: 'Process the following: {{ARGS}}',
        },
      ];

      await adapter.generateCommands(templates);

      const content = await fs.readFile(
        '.factory/commands/clavix-process.md',
        'utf-8'
      );

      expect(content).toContain('$ARGUMENTS');
      expect(content).not.toContain('{{ARGS}}');
    });

    it('should handle descriptions with special characters', async () => {
      const templates: CommandTemplate[] = [
        {
          name: 'test',
          description: "Test: with 'quotes' and \"double quotes\"",
          content: 'Content',
        },
      ];

      await adapter.generateCommands(templates);

      const content = await fs.readFile(
        '.factory/commands/clavix-test.md',
        'utf-8'
      );

      expect(content).toContain("Test: with 'quotes'");
    });
  });

  describe('edge cases', () => {
    it('should handle empty command list', async () => {
      await adapter.generateCommands([]);

      expect(await fs.pathExists('.factory/commands')).toBe(true);
    });

    it('should handle long descriptions', () => {
      const longDesc = 'A'.repeat(500);
      const template: CommandTemplate = {
        name: 'test',
        description: longDesc,
        content: 'Content',
      };

      const formatted = (adapter as any).formatCommand(template);

      expect(formatted).toContain(longDesc);
    });

    it('should handle multiline content', () => {
      const template: CommandTemplate = {
        name: 'test',
        description: 'Test',
        content: 'Line 1\n\nLine 2\n\nLine 3',
      };

      const formatted = (adapter as any).formatCommand(template);

      expect(formatted).toContain('Line 1\n\nLine 2\n\nLine 3');
    });

    it('should handle unicode in descriptions', async () => {
      const templates: CommandTemplate[] = [
        {
          name: 'unicode',
          description: 'Unicode test: 🚀 émojis',
          content: 'Content',
        },
      ];

      await adapter.generateCommands(templates);

      const content = await fs.readFile(
        '.factory/commands/clavix-unicode.md',
        'utf-8'
      );

      expect(content).toContain('🚀 émojis');
    });

    it('should handle empty content', () => {
      const template: CommandTemplate = {
        name: 'empty',
        description: 'Empty command',
        content: '',
      };

      const formatted = (adapter as any).formatCommand(template);

      expect(formatted).toContain('description: Empty command');
    });
  });

  describe('validation', () => {
    it('should pass validation when .factory exists', async () => {
      await fs.ensureDir('.factory');

      const result = await adapter.validate();

      expect(result.valid).toBe(true);
    });

    it('should create commands directory during validation', async () => {
      await adapter.validate();

      expect(await fs.pathExists('.factory/commands')).toBe(true);
    });
  });
});
