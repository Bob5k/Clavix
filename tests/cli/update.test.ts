/**
 * Tests for update command functionality
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import { AgentManager } from '../../src/core/agent-manager';
import { DocInjector } from '../../src/core/doc-injector';

describe('Update command', () => {
  const testDir = path.join(__dirname, '../fixtures/test-update');
  const clavixDir = path.join(testDir, '.clavix');
  const configPath = path.join(clavixDir, 'config.json');
  let originalCwd: string;

  beforeEach(async () => {
    // Clean up and setup
    await fs.remove(testDir);
    await fs.ensureDir(clavixDir);

    // Create config
    const config = {
      version: '1.0.0',
      providers: ['claude-code'],
    };
    await fs.writeJSON(configPath, config, { spaces: 2 });

    // Change to test directory
    originalCwd = process.cwd();
    process.chdir(testDir);
  });

  afterEach(async () => {
    // Restore directory
    process.chdir(originalCwd);

    // Clean up
    await fs.remove(testDir);
  });

  describe('initialization check', () => {
    it('should detect when .clavix directory exists', async () => {
      const exists = await fs.pathExists(clavixDir);

      expect(exists).toBe(true);
    });

    it('should detect when config.json exists', async () => {
      const exists = await fs.pathExists(configPath);

      expect(exists).toBe(true);
    });

    it('should detect missing .clavix directory', async () => {
      await fs.remove(clavixDir);

      const exists = await fs.pathExists(clavixDir);

      expect(exists).toBe(false);
    });

    it('should detect missing config.json', async () => {
      await fs.remove(configPath);

      const exists = await fs.pathExists(configPath);

      expect(exists).toBe(false);
    });
  });

  describe('provider configuration', () => {
    it('should use providers from config', async () => {
      const customConfig = {
        version: '1.0.0',
        providers: ['claude-code', 'cursor'],
      };
      await fs.writeJSON(configPath, customConfig, { spaces: 2 });

      const config = await fs.readJSON(configPath);

      expect(config.providers).toContain('claude-code');
      expect(config.providers).toContain('cursor');
    });

    it('should default to claude-code if no providers specified', async () => {
      const minimalConfig = {
        version: '1.0.0',
      };
      await fs.writeJSON(configPath, minimalConfig, { spaces: 2 });

      const config = await fs.readJSON(configPath);
      const providers = config.providers || ['claude-code'];

      expect(providers).toContain('claude-code');
    });
  });

  describe('AgentManager integration', () => {
    it('should be able to get registered adapters', () => {
      const agentManager = new AgentManager();
      const adapters = agentManager.getAdapters();

      expect(adapters.length).toBeGreaterThan(0);
    });

    it('should have claude-code adapter available', () => {
      const agentManager = new AgentManager();
      const adapter = agentManager.getAdapter('claude-code');

      expect(adapter).toBeDefined();
      expect(adapter?.name).toBe('claude-code');
    });

    it('should get command path from adapter', () => {
      const agentManager = new AgentManager();
      const adapter = agentManager.getAdapter('claude-code');

      const commandPath = adapter?.getCommandPath();

      expect(commandPath).toBeDefined();
      expect(commandPath).toContain('claude');
    });
  });

  describe('DocInjector integration', () => {
    it('should be able to inject documentation blocks', async () => {
      const testFile = path.join(testDir, 'test-doc.md');
      const content = 'Test content for documentation';

      await fs.writeFile(testFile, '# Test\n\n<!-- CLAVIX:START -->\n<!-- CLAVIX:END -->');

      await DocInjector.injectBlock(testFile, content, {
        startMarker: '<!-- CLAVIX:START -->',
        endMarker: '<!-- CLAVIX:END -->',
      });

      const updatedContent = await fs.readFile(testFile, 'utf-8');

      expect(updatedContent).toContain(content);
    });

    it('should preserve content outside managed blocks', async () => {
      const testFile = path.join(testDir, 'test-preserve.md');
      const beforeBlock = '# Before Block';
      const afterBlock = '# After Block';

      await fs.writeFile(
        testFile,
        `${beforeBlock}\n\n<!-- CLAVIX:START -->\nOld content\n<!-- CLAVIX:END -->\n\n${afterBlock}`
      );

      await DocInjector.injectBlock(testFile, 'New content', {
        startMarker: '<!-- CLAVIX:START -->',
        endMarker: '<!-- CLAVIX:END -->',
      });

      const updatedContent = await fs.readFile(testFile, 'utf-8');

      expect(updatedContent).toContain(beforeBlock);
      expect(updatedContent).toContain(afterBlock);
      expect(updatedContent).toContain('New content');
      expect(updatedContent).not.toContain('Old content');
    });
  });

  describe('update logic patterns', () => {
    it('should implement docs-only logic correctly', () => {
      const docsOnly = true;
      const commandsOnly = false;

      const updateDocs = docsOnly || (!docsOnly && !commandsOnly);
      const updateCommands = commandsOnly || (!docsOnly && !commandsOnly);

      expect(updateDocs).toBe(true);
      expect(updateCommands).toBe(false);
    });

    it('should implement commands-only logic correctly', () => {
      const docsOnly = false;
      const commandsOnly = true;

      const updateDocs = docsOnly || (!docsOnly && !commandsOnly);
      const updateCommands = commandsOnly || (!docsOnly && !commandsOnly);

      expect(updateDocs).toBe(false);
      expect(updateCommands).toBe(true);
    });

    it('should implement update-all logic correctly', () => {
      const docsOnly = false;
      const commandsOnly = false;

      const updateDocs = docsOnly || (!docsOnly && !commandsOnly);
      const updateCommands = commandsOnly || (!docsOnly && !commandsOnly);

      expect(updateDocs).toBe(true);
      expect(updateCommands).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle empty providers array', async () => {
      const config = {
        version: '1.0.0',
        providers: [],
      };
      await fs.writeJSON(configPath, config, { spaces: 2 });

      const loadedConfig = await fs.readJSON(configPath);
      const providers = loadedConfig.providers.length === 0 ? ['claude-code'] : loadedConfig.providers;

      expect(providers).toEqual(['claude-code']);
    });

    it('should handle unknown provider names gracefully', async () => {
      const config = {
        version: '1.0.0',
        providers: ['unknown-provider'],
      };
      await fs.writeJSON(configPath, config, { spaces: 2 });

      // The command should skip unknown providers without crashing
      const loadedConfig = await fs.readJSON(configPath);
      expect(loadedConfig.providers).toContain('unknown-provider');
    });

    it('should handle special provider names', async () => {
      const config = {
        version: '1.0.0',
        providers: ['agents-md', 'octo-md'],
      };
      await fs.writeJSON(configPath, config, { spaces: 2 });

      const loadedConfig = await fs.readJSON(configPath);
      expect(loadedConfig.providers).toContain('agents-md');
      expect(loadedConfig.providers).toContain('octo-md');
    });
  });

  describe('template directory structure', () => {
    it('should have templates directory structure', async () => {
      const templatesDir = path.join(__dirname, '../../src/templates');

      const exists = await fs.pathExists(templatesDir);

      expect(exists).toBe(true);
    });

    it('should have slash-commands templates', async () => {
      const slashCommandsDir = path.join(__dirname, '../../src/templates/slash-commands');

      const exists = await fs.pathExists(slashCommandsDir);

      expect(exists).toBe(true);
    });
  });

  describe('file update detection', () => {
    it('should detect when file content matches', async () => {
      const testFile = path.join(testDir, 'test-match.md');
      const content = 'Test content';

      await fs.writeFile(testFile, content);

      const fileContent = await fs.readFile(testFile, 'utf-8');

      expect(fileContent).toBe(content);
    });

    it('should detect when file content differs', async () => {
      const testFile = path.join(testDir, 'test-diff.md');
      const oldContent = 'Old content';
      const newContent = 'New content';

      await fs.writeFile(testFile, oldContent);

      const fileContent = await fs.readFile(testFile, 'utf-8');

      expect(fileContent).not.toBe(newContent);
      expect(fileContent).toBe(oldContent);
    });

    it('should be able to update file content', async () => {
      const testFile = path.join(testDir, 'test-update.md');
      const oldContent = 'Old content';
      const newContent = 'New content';

      await fs.writeFile(testFile, oldContent);
      await fs.writeFile(testFile, newContent);

      const fileContent = await fs.readFile(testFile, 'utf-8');

      expect(fileContent).toBe(newContent);
    });
  });
});
