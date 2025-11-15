/**
 * Windsurf adapter tests
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import { WindsurfAdapter } from '../../src/core/adapters/windsurf-adapter';
import { CommandTemplate } from '../../src/types/agent';

describe('WindsurfAdapter', () => {
  let adapter: WindsurfAdapter;
  const testDir = path.join(__dirname, '../tmp/windsurf-test');

  beforeEach(async () => {
    adapter = new WindsurfAdapter();
    await fs.ensureDir(testDir);
    process.chdir(testDir);
  });

  afterEach(async () => {
    process.chdir(path.join(__dirname, '../..'));
    await fs.remove(testDir);
  });

  describe('adapter properties', () => {
    it('should have correct metadata', () => {
      expect(adapter.name).toBe('windsurf');
      expect(adapter.displayName).toBe('Windsurf');
      expect(adapter.directory).toBe('.windsurf/workflows');
      expect(adapter.fileExtension).toBe('.md');
    });

    it('should support subdirectories', () => {
      expect(adapter.features?.supportsSubdirectories).toBe(true);
    });

    it('should not support frontmatter', () => {
      expect(adapter.features?.supportsFrontmatter).toBe(false);
    });
  });

  describe('detectProject', () => {
    it('should return true when .windsurf exists', async () => {
      await fs.ensureDir('.windsurf');
      const detected = await adapter.detectProject();
      expect(detected).toBe(true);
    });

    it('should return false when .windsurf does not exist', async () => {
      const detected = await adapter.detectProject();
      expect(detected).toBe(false);
    });
  });

  describe('getCommandPath', () => {
    it('should return correct command directory', () => {
      const path = adapter.getCommandPath();
      expect(path).toBe('.windsurf/workflows');
    });
  });

  describe('generateCommands', () => {
    it('should generate command files successfully', async () => {
      const templates: CommandTemplate[] = [
        {
          name: 'fast',
          content: '# Test command',
          description: 'Test command',
        },
      ];

      await adapter.generateCommands(templates);

      const commandPath = path.join(testDir, '.windsurf/workflows/clavix-fast.md');
      const exists = await fs.pathExists(commandPath);
      expect(exists).toBe(true);

      const content = await fs.readFile(commandPath, 'utf-8');
      expect(content).toBe('# Test command');
    });
  });
});
