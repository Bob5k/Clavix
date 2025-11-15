/**
 * Tests for CursorAdapter - Cursor IDE specific adapter
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import { CursorAdapter } from '../../src/core/adapters/cursor-adapter';
import { CommandTemplate } from '../../src/types/agent';

describe('CursorAdapter', () => {
  let adapter: CursorAdapter;
  const testDir = path.join(__dirname, '../fixtures/cursor-adapter');
  let originalCwd: string;

  beforeEach(async () => {
    // Clean up and setup
    await fs.remove(testDir);
    await fs.ensureDir(testDir);

    originalCwd = process.cwd();
    process.chdir(testDir);

    adapter = new CursorAdapter();
  });

  afterEach(async () => {
    process.chdir(originalCwd);
    await fs.remove(testDir);
  });

  describe('adapter properties', () => {
    it('should have Cursor specific properties', () => {
      expect(adapter.name).toBe('cursor');
      expect(adapter.displayName).toBe('Cursor');
      expect(adapter.directory).toBe('.cursor/commands');
      expect(adapter.fileExtension).toBe('.md');
    });

    it('should have correct feature flags', () => {
      expect(adapter.features).toEqual({
        supportsSubdirectories: false,
        supportsFrontmatter: false,
      });
    });

    it('should not support subdirectories', () => {
      expect(adapter.features.supportsSubdirectories).toBe(false);
    });

    it('should not support frontmatter', () => {
      expect(adapter.features.supportsFrontmatter).toBe(false);
    });

    it('should implement getCommandPath', () => {
      const commandPath = adapter.getCommandPath();
      expect(commandPath).toBe('.cursor/commands');
    });
  });

  describe('detectProject', () => {
    it('should detect when .cursor directory exists', async () => {
      await fs.ensureDir('.cursor');
      const detected = await adapter.detectProject();
      expect(detected).toBe(true);
    });

    it('should not detect when .cursor directory does not exist', async () => {
      const detected = await adapter.detectProject();
      expect(detected).toBe(false);
    });

    it('should detect .cursor with existing files', async () => {
      await fs.ensureDir('.cursor');
      await fs.writeFile('.cursor/.cursorrules', 'rules');

      const detected = await adapter.detectProject();
      expect(detected).toBe(true);
    });

    it('should detect .cursor with commands directory', async () => {
      await fs.ensureDir('.cursor/commands');

      const detected = await adapter.detectProject();
      expect(detected).toBe(true);
    });
  });

  describe('generateCommands', () => {
    it('should generate Cursor command files', async () => {
      const templates: CommandTemplate[] = [
        {
          name: 'fast',
          description: 'Fast improvements',
          content: '# Fast Mode\n\nQuick analysis',
        },
        {
          name: 'deep',
          description: 'Deep analysis',
          content: '# Deep Mode\n\nComprehensive',
        },
      ];

      await adapter.generateCommands(templates);

      const commandPath = adapter.getCommandPath();
      const file1 = await fs.readFile(
        path.join(commandPath, 'clavix-fast.md'),
        'utf-8'
      );
      const file2 = await fs.readFile(
        path.join(commandPath, 'clavix-deep.md'),
        'utf-8'
      );

      expect(file1).toBe('# Fast Mode\n\nQuick analysis');
      expect(file2).toBe('# Deep Mode\n\nComprehensive');
    });

    it('should create flat directory structure', async () => {
      const templates: CommandTemplate[] = [
        { name: 'test', description: 'Test command', content: 'Test content' },
      ];

      await adapter.generateCommands(templates);

      const commandPath = adapter.getCommandPath();
      expect(await fs.pathExists(commandPath)).toBe(true);

      // Verify it's a flat structure
      const files = await fs.readdir(commandPath);
      expect(files).toContain('clavix-test.md');
    });

    it('should create parent .cursor directory', async () => {
      const templates: CommandTemplate[] = [
        { name: 'cmd', description: 'Command', content: 'Content' },
      ];

      await adapter.generateCommands(templates);

      expect(await fs.pathExists('.cursor')).toBe(true);
      expect(await fs.pathExists('.cursor/commands')).toBe(true);
    });

    it('should use .md file extension', async () => {
      const templates: CommandTemplate[] = [
        { name: 'example', description: 'Example', content: 'Example content' },
      ];

      await adapter.generateCommands(templates);

      const filePath = path.join('.cursor/commands', 'clavix-example.md');
      expect(await fs.pathExists(filePath)).toBe(true);
    });

    it('should overwrite existing commands', async () => {
      await fs.ensureDir('.cursor/commands');
      await fs.writeFile(
        '.cursor/commands/clavix-test.md',
        'Old content'
      );

      const templates: CommandTemplate[] = [
        { name: 'test', description: 'Test', content: 'New content' },
      ];

      await adapter.generateCommands(templates);

      const content = await fs.readFile(
        '.cursor/commands/clavix-test.md',
        'utf-8'
      );
      expect(content).toBe('New content');
      expect(content).not.toContain('Old content');
    });

    it('should handle multiple commands', async () => {
      const templates: CommandTemplate[] = Array.from({ length: 5 }, (_, i) => ({
        name: `cmd-${i}`,
        description: `Description ${i}`,
        content: `Content ${i}`,
      }));

      await adapter.generateCommands(templates);

      const files = await fs.readdir('.cursor/commands');
      expect(files.length).toBe(5);
      expect(files).toContain('clavix-cmd-0.md');
      expect(files).toContain('clavix-cmd-4.md');
    });

    it('should preserve content format without frontmatter', async () => {
      const content = '# Title\n\nContent without frontmatter';
      const templates: CommandTemplate[] = [
        { name: 'test', description: 'Test', content },
      ];

      await adapter.generateCommands(templates);

      const fileContent = await fs.readFile(
        '.cursor/commands/clavix-test.md',
        'utf-8'
      );
      expect(fileContent).toBe(content);
      expect(fileContent).not.toContain('---');
    });
  });

  describe('flat structure enforcement', () => {
    it('should not create subdirectories in commands folder', async () => {
      const templates: CommandTemplate[] = [
        { name: 'cmd1', description: 'Cmd 1', content: 'Content 1' },
        { name: 'cmd2', description: 'Cmd 2', content: 'Content 2' },
      ];

      await adapter.generateCommands(templates);

      const commandPath = adapter.getCommandPath();
      const items = await fs.readdir(commandPath, { withFileTypes: true });

      // All items should be files, not directories
      const directories = items.filter(item => item.isDirectory());
      expect(directories.length).toBe(0);
    });

    it('should place all commands in root of commands directory', async () => {
      const templates: CommandTemplate[] = [
        { name: 'a', description: 'A', content: 'A' },
        { name: 'b', description: 'B', content: 'B' },
        { name: 'c', description: 'C', content: 'C' },
      ];

      await adapter.generateCommands(templates);

      const commandPath = adapter.getCommandPath();
      const files = await fs.readdir(commandPath);

      expect(files).toEqual(['clavix-a.md', 'clavix-b.md', 'clavix-c.md']);
    });
  });

  describe('edge cases', () => {
    it('should handle empty command list', async () => {
      await adapter.generateCommands([]);

      const commandPath = adapter.getCommandPath();
      expect(await fs.pathExists(commandPath)).toBe(true);
    });

    it('should handle commands with hyphens and underscores', async () => {
      const templates: CommandTemplate[] = [
        { name: 'my-command_v2', description: 'Test', content: 'content' },
      ];

      await adapter.generateCommands(templates);

      const filePath = path.join('.cursor/commands', 'clavix-my-command_v2.md');
      expect(await fs.pathExists(filePath)).toBe(true);
    });

    it('should handle long command content', async () => {
      const longContent = 'x'.repeat(10000);
      const templates: CommandTemplate[] = [
        { name: 'long', description: 'Long', content: longContent },
      ];

      await adapter.generateCommands(templates);

      const content = await fs.readFile(
        '.cursor/commands/clavix-long.md',
        'utf-8'
      );
      expect(content.length).toBe(10000);
    });

    it('should handle unicode in content', async () => {
      const templates: CommandTemplate[] = [
        {
          name: 'unicode',
          description: 'Unicode test',
          content: 'Test with émojis 🚀 and spëcial çhars'
        },
      ];

      await adapter.generateCommands(templates);

      const content = await fs.readFile(
        '.cursor/commands/clavix-unicode.md',
        'utf-8'
      );
      expect(content).toContain('émojis');
      expect(content).toContain('🚀');
    });

    it('should handle empty content', async () => {
      const templates: CommandTemplate[] = [
        { name: 'empty', description: 'Empty', content: '' },
      ];

      await adapter.generateCommands(templates);

      const content = await fs.readFile(
        '.cursor/commands/clavix-empty.md',
        'utf-8'
      );
      expect(content).toBe('');
    });

    it('should handle commands with newlines', async () => {
      const content = 'Line 1\n\nLine 2\n\n\nLine 3';
      const templates: CommandTemplate[] = [
        { name: 'newlines', description: 'Newlines', content },
      ];

      await adapter.generateCommands(templates);

      const fileContent = await fs.readFile(
        '.cursor/commands/clavix-newlines.md',
        'utf-8'
      );
      expect(fileContent).toBe(content);
    });
  });

  describe('validation', () => {
    it('should pass validation when .cursor directory exists', async () => {
      await fs.ensureDir('.cursor');

      const result = await adapter.validate();

      expect(result.valid).toBe(true);
      expect(result.errors).toBeUndefined();
    });

    it('should warn when .cursor directory will be created', async () => {
      const result = await adapter.validate();

      expect(result.valid).toBe(true);
      expect(result.warnings).toBeDefined();
    });

    it('should create commands directory during validation', async () => {
      await adapter.validate();

      const commandPath = adapter.getCommandPath();
      expect(await fs.pathExists(commandPath)).toBe(true);
    });
  });

  describe('integration with BaseAdapter', () => {
    it('should inherit formatCommand from BaseAdapter', () => {
      const template: CommandTemplate = {
        name: 'test',
        description: 'Test',
        content: '# Test\n\nContent',
      };

      // Access protected method through any
      const formatted = (adapter as any).formatCommand(template);

      expect(formatted).toBe(template.content);
    });

    it('should use default injectDocumentation (no-op)', async () => {
      // Should not throw
      await expect(adapter.injectDocumentation([])).resolves.toBeUndefined();
    });
  });
});
