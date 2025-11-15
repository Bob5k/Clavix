/**
 * Roocode adapter tests
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import { RoocodeAdapter } from '../../src/core/adapters/roocode-adapter';
import { CommandTemplate } from '../../src/types/agent';

describe('RoocodeAdapter', () => {
  let adapter: RoocodeAdapter;
  const testDir = path.join(__dirname, '../tmp/roocode-test');

  beforeEach(async () => {
    adapter = new RoocodeAdapter();
    await fs.ensureDir(testDir);
    process.chdir(testDir);
  });

  afterEach(async () => {
    process.chdir(path.join(__dirname, '../..'));
    await fs.remove(testDir);
  });

  describe('adapter properties', () => {
    it('should have correct metadata', () => {
      expect(adapter.name).toBe('roocode');
      expect(adapter.displayName).toBe('Roocode');
      expect(adapter.directory).toBe('.roo/commands');
      expect(adapter.fileExtension).toBe('.md');
    });

    it('should not support subdirectories', () => {
      expect(adapter.features?.supportsSubdirectories).toBe(false);
    });

    it('should support frontmatter', () => {
      expect(adapter.features?.supportsFrontmatter).toBe(true);
    });
  });

  describe('detectProject', () => {
    it('should return true when .roo exists', async () => {
      await fs.ensureDir('.roo');
      const detected = await adapter.detectProject();
      expect(detected).toBe(true);
    });

    it('should return false when .roo does not exist', async () => {
      const detected = await adapter.detectProject();
      expect(detected).toBe(false);
    });
  });

  describe('getCommandPath', () => {
    it('should return correct command directory', () => {
      const path = adapter.getCommandPath();
      expect(path).toBe('.roo/commands');
    });
  });

  describe('formatCommand', () => {
    it('should add frontmatter when not present', () => {
      const template: CommandTemplate = {
        name: 'test',
        content: '# Test content',
        description: 'Test description',
      };

      // Access protected method through adapter instance
      const formatted = (adapter as any).formatCommand(template);

      expect(formatted).toContain('---');
      expect(formatted).toContain('description: Test description');
      expect(formatted).toContain('argument-hint: <prompt>');
      expect(formatted).toContain('# Test content');
    });

    it('should not modify content with existing frontmatter', () => {
      const template: CommandTemplate = {
        name: 'test',
        content: '---\nexisting: frontmatter\n---\n# Test',
        description: 'Test',
      };

      const formatted = (adapter as any).formatCommand(template);

      expect(formatted).toBe('---\nexisting: frontmatter\n---\n# Test');
    });

    it('should use command name as description fallback', () => {
      const template: CommandTemplate = {
        name: 'my-command',
        content: '# Test',
        description: '',
      };

      const formatted = (adapter as any).formatCommand(template);

      expect(formatted).toContain('description: Clavix my-command command');
    });
  });

  describe('generateCommands', () => {
    it('should generate command files with frontmatter', async () => {
      const templates: CommandTemplate[] = [
        {
          name: 'test',
          content: '# Test command',
          description: 'Test command description',
        },
      ];

      await adapter.generateCommands(templates);

      const commandPath = path.join(testDir, '.roo/commands/clavix-test.md');
      const exists = await fs.pathExists(commandPath);
      expect(exists).toBe(true);

      const content = await fs.readFile(commandPath, 'utf-8');
      expect(content).toContain('---');
      expect(content).toContain('description: Test command description');
      expect(content).toContain('argument-hint: <prompt>');
      expect(content).toContain('# Test command');
    });
  });
});
