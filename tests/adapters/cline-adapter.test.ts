/**
 * Cline adapter tests
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import { ClineAdapter } from '../../src/core/adapters/cline-adapter';
import { CommandTemplate } from '../../src/types/agent';

describe('ClineAdapter', () => {
  let adapter: ClineAdapter;
  const testDir = path.join(__dirname, '../tmp/cline-test');

  beforeEach(async () => {
    adapter = new ClineAdapter();
    await fs.ensureDir(testDir);
    process.chdir(testDir);
  });

  afterEach(async () => {
    process.chdir(path.join(__dirname, '../..'));
    await fs.remove(testDir);
  });

  describe('adapter properties', () => {
    it('should have correct metadata', () => {
      expect(adapter.name).toBe('cline');
      expect(adapter.displayName).toBe('Cline');
      expect(adapter.directory).toBe('.clinerules/workflows');
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
    it('should return true when .cline exists', async () => {
      await fs.ensureDir('.cline');
      const detected = await adapter.detectProject();
      expect(detected).toBe(true);
    });

    it('should return true when .clinerules exists', async () => {
      await fs.ensureDir('.clinerules');
      const detected = await adapter.detectProject();
      expect(detected).toBe(true);
    });

    it('should return false when .cline does not exist', async () => {
      const detected = await adapter.detectProject();
      expect(detected).toBe(false);
    });
  });

  describe('getCommandPath', () => {
    it('should return correct command directory', () => {
      const path = adapter.getCommandPath();
      expect(path).toBe('.clinerules/workflows');
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

      const commandPath = path.join(testDir, '.clinerules/workflows/clavix-test.md');
      const exists = await fs.pathExists(commandPath);
      expect(exists).toBe(true);

      const content = await fs.readFile(commandPath, 'utf-8');
      expect(content).toBe('# Test workflow');
    });
  });
});
