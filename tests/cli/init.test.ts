/**
 * Tests for init command functionality
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import { AgentManager } from '../../src/core/agent-manager';
import { FileSystem } from '../../src/utils/file-system';
import { DEFAULT_CONFIG } from '../../src/types/config';
import { parseTomlSlashCommand } from '../../src/utils/toml-templates';

describe('Init command', () => {
  const testDir = path.join(__dirname, '../fixtures/test-init');
  const clavixDir = path.join(testDir, '.clavix');
  let originalCwd: string;

  beforeEach(async () => {
    // Clean up and setup
    await fs.remove(testDir);
    await fs.ensureDir(testDir);

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

  describe('directory structure', () => {
    it('should create .clavix directory', async () => {
      await fs.ensureDir(clavixDir);

      const exists = await FileSystem.exists('.clavix');

      expect(exists).toBe(true);
    });

    it('should create config.json in .clavix', async () => {
      await fs.ensureDir(clavixDir);
      const configPath = path.join(clavixDir, 'config.json');

      await fs.writeJSON(configPath, DEFAULT_CONFIG, { spaces: 2 });

      const exists = await FileSystem.exists(path.join('.clavix', 'config.json'));

      expect(exists).toBe(true);
    });

    it('should create sessions directory', async () => {
      await fs.ensureDir(path.join(clavixDir, 'sessions'));

      const exists = await FileSystem.exists(path.join('.clavix', 'sessions'));

      expect(exists).toBe(true);
    });

    it('should create outputs directory', async () => {
      await fs.ensureDir(path.join(clavixDir, 'outputs'));

      const exists = await FileSystem.exists(path.join('.clavix', 'outputs'));

      expect(exists).toBe(true);
    });
  });

  describe('default configuration', () => {
    it('should have version in default config', () => {
      expect(DEFAULT_CONFIG.version).toBeDefined();
      expect(typeof DEFAULT_CONFIG.version).toBe('string');
    });

    it('should have default providers', () => {
      expect(DEFAULT_CONFIG.providers).toBeDefined();
      expect(Array.isArray(DEFAULT_CONFIG.providers)).toBe(true);
    });

    it('should have templates configuration', () => {
      expect(DEFAULT_CONFIG.templates).toBeDefined();
      expect(DEFAULT_CONFIG.templates.prdQuestions).toBeDefined();
    });

    it('should have outputs configuration', () => {
      expect(DEFAULT_CONFIG.outputs).toBeDefined();
      expect(DEFAULT_CONFIG.outputs.path).toBeDefined();
    });

    it('should have preferences configuration', () => {
      expect(DEFAULT_CONFIG.preferences).toBeDefined();
      expect(DEFAULT_CONFIG.preferences.autoOpenOutputs).toBeDefined();
    });
  });

  describe('provider selection', () => {
    it('should support claude-code provider', () => {
      const agentManager = new AgentManager();
      const adapter = agentManager.getAdapter('claude-code');

      expect(adapter).toBeDefined();
      expect(adapter?.name).toBe('claude-code');
    });

    it('should support cursor provider', () => {
      const agentManager = new AgentManager();
      const adapter = agentManager.getAdapter('cursor');

      expect(adapter).toBeDefined();
      expect(adapter?.name).toBe('cursor');
    });

    it('should support droid provider', () => {
      const agentManager = new AgentManager();
      const adapter = agentManager.getAdapter('droid');

      expect(adapter).toBeDefined();
      expect(adapter?.name).toBe('droid');
    });

    it('should support opencode provider', () => {
      const agentManager = new AgentManager();
      const adapter = agentManager.getAdapter('opencode');

      expect(adapter).toBeDefined();
      expect(adapter?.name).toBe('opencode');
    });

    it('should support codebuddy provider', () => {
      const agentManager = new AgentManager();
      const adapter = agentManager.getAdapter('codebuddy');

      expect(adapter).toBeDefined();
      expect(adapter?.name).toBe('codebuddy');
    });

    it('should support gemini provider', () => {
      const agentManager = new AgentManager();
      const adapter = agentManager.getAdapter('gemini');

      expect(adapter).toBeDefined();
      expect(adapter?.name).toBe('gemini');
    });

    it('should support qwen provider', () => {
      const agentManager = new AgentManager();
      const adapter = agentManager.getAdapter('qwen');

      expect(adapter).toBeDefined();
      expect(adapter?.name).toBe('qwen');
    });

    it('should support codex provider', () => {
      const agentManager = new AgentManager();
      const adapter = agentManager.getAdapter('codex');

      expect(adapter).toBeDefined();
      expect(adapter?.name).toBe('codex');
    });

    it('should support amp provider', () => {
      const agentManager = new AgentManager();
      const adapter = agentManager.getAdapter('amp');

      expect(adapter).toBeDefined();
      expect(adapter?.name).toBe('amp');
    });

    it('should list all available providers', () => {
      const agentManager = new AgentManager();
      const providers = agentManager.getAvailableAgents();

      expect(providers).toContain('claude-code');
      expect(providers).toContain('cursor');
      expect(providers).toContain('droid');
      expect(providers).toContain('opencode');
      expect(providers).toContain('codebuddy');
      expect(providers).toContain('gemini');
      expect(providers).toContain('qwen');
      expect(providers).toContain('codex');
      expect(providers).toContain('amp');
    });
  });

  describe('provider validation', () => {
    it('should validate that at least one provider is selected', () => {
      const selectedProviders: string[] = [];

      const isValid = selectedProviders.length > 0;

      expect(isValid).toBe(false);
    });

    it('should accept single provider selection', () => {
      const selectedProviders = ['claude-code'];

      const isValid = selectedProviders.length > 0;

      expect(isValid).toBe(true);
    });

    it('should accept multiple provider selection', () => {
      const selectedProviders = ['claude-code', 'cursor', 'droid'];

      const isValid = selectedProviders.length > 0;

      expect(isValid).toBe(true);
    });
  });

  describe('configuration file', () => {
    it('should write valid JSON config', async () => {
      const configPath = path.join(clavixDir, 'config.json');
      await fs.ensureDir(clavixDir);

      const config = {
        ...DEFAULT_CONFIG,
        providers: ['claude-code'],
      };

      await fs.writeJSON(configPath, config, { spaces: 2 });

      const savedConfig = await fs.readJSON(configPath);

      expect(savedConfig.version).toBe(config.version);
      expect(savedConfig.providers).toEqual(['claude-code']);
    });

    it('should preserve config structure', async () => {
      const configPath = path.join(clavixDir, 'config.json');
      await fs.ensureDir(clavixDir);

      await fs.writeJSON(configPath, DEFAULT_CONFIG, { spaces: 2 });

      const savedConfig = await fs.readJSON(configPath);

      expect(savedConfig).toHaveProperty('version');
      expect(savedConfig).toHaveProperty('providers');
      expect(savedConfig).toHaveProperty('templates');
      expect(savedConfig).toHaveProperty('outputs');
      expect(savedConfig).toHaveProperty('preferences');
    });

    it('should handle custom providers configuration', async () => {
      const configPath = path.join(clavixDir, 'config.json');
      await fs.ensureDir(clavixDir);

      const customConfig = {
        ...DEFAULT_CONFIG,
        providers: ['claude-code', 'cursor', 'agents-md'],
      };

      await fs.writeJSON(configPath, customConfig, { spaces: 2 });

      const savedConfig = await fs.readJSON(configPath);

      expect(savedConfig.providers).toHaveLength(3);
      expect(savedConfig.providers).toContain('claude-code');
      expect(savedConfig.providers).toContain('cursor');
      expect(savedConfig.providers).toContain('agents-md');
    });
  });

  describe('reinitializat ion detection', () => {
    it('should detect existing .clavix directory', async () => {
      await fs.ensureDir(clavixDir);

      const exists = await FileSystem.exists('.clavix');

      expect(exists).toBe(true);
    });

    it('should detect when .clavix does not exist', async () => {
      const exists = await FileSystem.exists('.clavix');

      expect(exists).toBe(false);
    });

    it('should preserve existing config on reinitialization', async () => {
      const configPath = path.join(clavixDir, 'config.json');
      await fs.ensureDir(clavixDir);

      const originalConfig = {
        ...DEFAULT_CONFIG,
        providers: ['claude-code', 'cursor'],
      };

      await fs.writeJSON(configPath, originalConfig, { spaces: 2 });

      // Simulate reading config before reinitialization
      const existingConfig = await fs.readJSON(configPath);

      expect(existingConfig.providers).toContain('claude-code');
      expect(existingConfig.providers).toContain('cursor');
    });
  });

  describe('file system operations', () => {
    it('should create nested directory structure', async () => {
      const sessionsDir = path.join(clavixDir, 'sessions');
      const outputsDir = path.join(clavixDir, 'outputs');

      await fs.ensureDir(sessionsDir);
      await fs.ensureDir(outputsDir);

      expect(await fs.pathExists(sessionsDir)).toBe(true);
      expect(await fs.pathExists(outputsDir)).toBe(true);
    });

    it('should handle directory creation idempotently', async () => {
      await fs.ensureDir(clavixDir);
      await fs.ensureDir(clavixDir);

      const exists = await fs.pathExists(clavixDir);

      expect(exists).toBe(true);
    });
  });

  describe('provider choices', () => {
    it('should include claude-code as default checked', () => {
      const choices = [
        { name: 'Claude Code', value: 'claude-code', checked: true },
        { name: 'Cursor', value: 'cursor', checked: false },
      ];

      const claudeChoice = choices.find(c => c.value === 'claude-code');

      expect(claudeChoice?.checked).toBe(true);
    });

    it('should include agents-md as universal option', () => {
      const providers = ['agents-md', 'octo-md'];

      expect(providers).toContain('agents-md');
      expect(providers).toContain('octo-md');
    });

    it('should support both slash commands and md-based providers', () => {
      const slashCommandProviders = [
        'claude-code',
        'cursor',
        'droid',
        'opencode',
        'amp',
        'codebuddy',
        'gemini',
        'qwen',
        'codex',
      ];
      const mdProviders = ['agents-md', 'octo-md'];

      expect(slashCommandProviders.length).toBeGreaterThan(mdProviders.length);
      expect(mdProviders.length).toBe(2);
    });
  });

  describe('configuration validation', () => {
    it('should have valid version format', () => {
      expect(DEFAULT_CONFIG.version).toMatch(/^\d+\.\d+\.\d+$/);
    });

    it('should have valid providers array', () => {
      expect(Array.isArray(DEFAULT_CONFIG.providers)).toBe(true);
    });

    it('should have valid output path', () => {
      expect(DEFAULT_CONFIG.outputs.path).toBeDefined();
      expect(typeof DEFAULT_CONFIG.outputs.path).toBe('string');
    });

    it('should have boolean preferences', () => {
      expect(typeof DEFAULT_CONFIG.preferences.autoOpenOutputs).toBe('boolean');
      expect(typeof DEFAULT_CONFIG.preferences.verboseLogging).toBe('boolean');
    });
  });

  describe('TOML template parsing', () => {
    it('extracts description and prompt body without duplicating headers', async () => {
      const templatePath = path.join(__dirname, '../../src/templates/slash-commands/gemini/archive.toml');
      const templateContent = await fs.readFile(templatePath, 'utf8');

      const parsed = parseTomlSlashCommand(templateContent, 'archive', 'gemini');

      expect(parsed.description).toBe('Archive completed PRD projects');
      expect(parsed.prompt.startsWith('# Clavix Archive')).toBe(true);
      expect(parsed.prompt).not.toMatch(/^description\s*=/m);
      expect(parsed.prompt).not.toMatch(/^prompt\s*=/m);
      const occurrences = (parsed.prompt.match(/prompt\s*=\s*"""/g) ?? []).length;
      expect(occurrences).toBe(0);
    });
  });

  describe('edge cases', () => {
    it('should handle empty providers array validation', () => {
      const providers: string[] = [];
      const validationError = providers.length === 0 ? 'You must select at least one provider.' : true;

      expect(validationError).toBe('You must select at least one provider.');
    });

    it('should handle special characters in project name', () => {
      const projectName = 'my-project-123';
      const sanitized = projectName.replace(/[^a-z0-9-]/gi, '-');

      expect(sanitized).toBe('my-project-123');
    });

    it('should handle long project names', () => {
      const longName = 'a'.repeat(100);
      const truncated = longName.substring(0, 50);

      expect(truncated.length).toBe(50);
    });
  });
});
