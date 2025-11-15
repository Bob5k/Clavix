/**
 * Kilocode adapter tests
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import { KilocodeAdapter } from '../../src/core/adapters/kilocode-adapter';
import { CommandTemplate } from '../../src/types/agent';

describe('KilocodeAdapter', () => {
  let adapter: KilocodeAdapter;
  const testDir = path.join(__dirname, '../tmp/kilocode-test');

  beforeEach(async () => {
    adapter = new KilocodeAdapter();
    await fs.ensureDir(testDir);
    process.chdir(testDir);
  });

  afterEach(async () => {
    process.chdir(path.join(__dirname, '../..'));
    await fs.remove(testDir);
  });

  describe('adapter properties', () => {
    it('should have correct metadata', () => {
      expect(adapter.name).toBe('kilocode');
      expect(adapter.displayName).toBe('Kilocode');
      expect(adapter.directory).toBe('.kilocode/workflows');
      expect(adapter.fileExtension).toBe('.md');
    });

    it('should not support subdirectories', () => {
      expect(adapter.features?.supportsSubdirectories).toBe(false);
    });

    it('should not support frontmatter', () => {
      expect(adapter.features?.supportsFrontmatter).toBe(false);
    });
  });

  describe('detectProject', () => {
    it('should return true when .kilocode exists', async () => {
      await fs.ensureDir('.kilocode');
      const detected = await adapter.detectProject();
      expect(detected).toBe(true);
    });

    it('should return false when .kilocode does not exist', async () => {
      const detected = await adapter.detectProject();
      expect(detected).toBe(false);
    });
  });

  describe('getCommandPath', () => {
    it('should return correct command directory', () => {
      const path = adapter.getCommandPath();
      expect(path).toBe('.kilocode/workflows');
    });
  });

  describe('generateCommands', () => {
    it('should generate command files successfully', async () => {
      const templates: CommandTemplate[] = [
        {
          name: 'test',
          content: '# Test workflow',
          description: 'Test workflow',
        },
      ];

      await adapter.generateCommands(templates);

      const commandPath = path.join(testDir, '.kilocode/workflows/clavix-test.md');
      const exists = await fs.pathExists(commandPath);
      expect(exists).toBe(true);

      const content = await fs.readFile(commandPath, 'utf-8');
      expect(content).toBe('# Test workflow');
    });
  });
});
