/**
 * Integration test for multi-provider workflow
 * Tests integration across multiple AI provider adapters
 */

import * as path from 'path';
import * as fs from 'fs-extra';
import { AgentManager } from '../../src/core/agent-manager';
import { CommandTemplate } from '../../src/types/agent';

describe('Multi-Provider Workflow Integration', () => {
  const testDir = path.join(__dirname, '../tmp/multi-provider-test');
  let agentManager: AgentManager;
  let originalHomeOverride: string | undefined;
  let testHomeDir: string;

  beforeEach(async () => {
    await fs.ensureDir(testDir);
    process.chdir(testDir);
    testHomeDir = path.join(testDir, 'home');
    await fs.remove(testHomeDir);
    originalHomeOverride = process.env.CLAVIX_HOME_OVERRIDE;
    process.env.CLAVIX_HOME_OVERRIDE = testHomeDir;
    agentManager = new AgentManager();
  });

  afterEach(async () => {
    if (originalHomeOverride === undefined) {
      delete process.env.CLAVIX_HOME_OVERRIDE;
    } else {
      process.env.CLAVIX_HOME_OVERRIDE = originalHomeOverride;
    }
    process.chdir(path.join(__dirname, '../..'));
    await fs.remove(testDir);
  });

  describe('Adapter Registration', () => {
    it('should register all built-in adapters', () => {
      const adapters = agentManager.getAdapters();

      expect(adapters).toHaveLength(16);
      expect(agentManager.hasAgent('claude-code')).toBe(true);
      expect(agentManager.hasAgent('cursor')).toBe(true);
      expect(agentManager.hasAgent('droid')).toBe(true);
      expect(agentManager.hasAgent('opencode')).toBe(true);
      expect(agentManager.hasAgent('amp')).toBe(true);
      expect(agentManager.hasAgent('augment')).toBe(true);
      expect(agentManager.hasAgent('crush')).toBe(true);
      expect(agentManager.hasAgent('windsurf')).toBe(true);
      expect(agentManager.hasAgent('kilocode')).toBe(true);
      expect(agentManager.hasAgent('cline')).toBe(true);
      expect(agentManager.hasAgent('roocode')).toBe(true);
      expect(agentManager.hasAgent('copilot')).toBe(true);
      expect(agentManager.hasAgent('codebuddy')).toBe(true);
      expect(agentManager.hasAgent('gemini')).toBe(true);
      expect(agentManager.hasAgent('qwen')).toBe(true);
      expect(agentManager.hasAgent('codex')).toBe(true);
    });

    it('should provide list of available agents', () => {
      const available = agentManager.getAvailableAgents();

      expect(available).toContain('claude-code');
      expect(available).toContain('cursor');
      expect(available).toContain('droid');
      expect(available).toContain('opencode');
      expect(available).toContain('amp');
      expect(available).toContain('augment');
      expect(available).toContain('crush');
      expect(available).toContain('windsurf');
      expect(available).toContain('kilocode');
      expect(available).toContain('cline');
      expect(available).toContain('roocode');
      expect(available).toContain('copilot');
      expect(available).toContain('codebuddy');
      expect(available).toContain('gemini');
      expect(available).toContain('qwen');
      expect(available).toContain('codex');
    });

    it('should get adapter by name', () => {
      const adapter = agentManager.getAdapter('claude-code');

      expect(adapter).toBeDefined();
      expect(adapter?.name).toBe('claude-code');
      expect(adapter?.displayName).toBe('Claude Code');
    });

    it('should return undefined for non-existent adapter', () => {
      const adapter = agentManager.getAdapter('non-existent');
      expect(adapter).toBeUndefined();
    });

    it('should throw error when requiring non-existent adapter', () => {
      expect(() => agentManager.requireAdapter('non-existent')).toThrow();
    });
  });

  describe('Project Detection', () => {
    it('should detect no agents in empty project', async () => {
      const detected = await agentManager.detectAgents();
      expect(detected).toHaveLength(0);
    });

    it('should detect Claude Code project', async () => {
      await fs.ensureDir('.claude');

      const detected = await agentManager.detectAgents();

      expect(detected).toHaveLength(1);
      expect(detected[0].name).toBe('claude-code');
    });

    it('should detect Cursor project', async () => {
      await fs.ensureDir('.cursor');

      const detected = await agentManager.detectAgents();

      expect(detected).toHaveLength(1);
      expect(detected[0].name).toBe('cursor');
    });

    it('should detect multiple providers in same project', async () => {
      await fs.ensureDir('.claude');
      await fs.ensureDir('.cursor');
      await fs.ensureDir('.agents');

      const detected = await agentManager.detectAgents();

      expect(detected).toHaveLength(3);
      const names = detected.map((a) => a.name);
      expect(names).toContain('claude-code');
      expect(names).toContain('cursor');
      expect(names).toContain('amp');
    });

    it('should detect all providers when all markers present', async () => {
      await fs.ensureDir('.claude');
      await fs.ensureDir('.cursor');
      await fs.ensureDir('.factory');
      await fs.ensureDir('.opencode');
      await fs.ensureDir('.agents');
      await fs.ensureDir('.crush');
      await fs.ensureDir('.windsurf');
      await fs.ensureDir('.kilocode');
      await fs.ensureDir('.cline');
      await fs.ensureDir('.roo');
      await fs.ensureDir('.codebuddy');
      await fs.ensureDir('.gemini');
      await fs.ensureDir('.qwen');
      await fs.ensureDir(path.join(testHomeDir, '.codex'));

      const detected = await agentManager.detectAgents();
      const names = detected.map(a => a.name);

      expect(detected).toHaveLength(14);
      expect(names).toEqual(
        expect.arrayContaining([
          'claude-code',
          'cursor',
          'droid',
          'opencode',
          'amp',
          'crush',
          'windsurf',
          'kilocode',
          'cline',
          'roocode',
          'codebuddy',
          'gemini',
          'qwen',
          'codex',
        ]),
      );
    });
  });

  describe('Command Generation Across Providers', () => {
    const testTemplates: CommandTemplate[] = [
      {
        name: 'fast',
        description: 'Fast improvements',
        content: '# Fast Mode\n\nQuick CLEAR analysis',
      },
      {
        name: 'deep',
        description: 'Deep analysis',
        content: '# Deep Mode\n\nComprehensive CLEAR analysis',
      },
    ];

    it('should generate commands for Claude Code', async () => {
      const adapter = agentManager.requireAdapter('claude-code');
      await adapter.generateCommands(testTemplates);

      expect(await fs.pathExists('.claude/commands/clavix/fast.md')).toBe(true);
      expect(await fs.pathExists('.claude/commands/clavix/deep.md')).toBe(true);

      const content = await fs.readFile('.claude/commands/clavix/fast.md', 'utf-8');
      expect(content).toContain('Fast Mode');
    });

    it('should generate commands for Cursor', async () => {
      const adapter = agentManager.requireAdapter('cursor');
      await adapter.generateCommands(testTemplates);

      expect(await fs.pathExists('.cursor/commands/clavix-fast.md')).toBe(true);
      expect(await fs.pathExists('.cursor/commands/clavix-deep.md')).toBe(true);

      const content = await fs.readFile('.cursor/commands/clavix-fast.md', 'utf-8');
      expect(content).toContain('Fast Mode');
      expect(content).not.toContain('---'); // No frontmatter
    });

    it('should generate commands for Droid with frontmatter', async () => {
      const adapter = agentManager.requireAdapter('droid');
      await adapter.generateCommands(testTemplates);

      expect(await fs.pathExists('.factory/commands/clavix-fast.md')).toBe(true);

      const content = await fs.readFile('.factory/commands/clavix-fast.md', 'utf-8');
      expect(content).toContain('---');
      expect(content).toContain('description: Fast improvements');
      expect(content).toContain('argument-hint: [prompt]');
    });

    it('should generate commands for OpenCode with frontmatter', async () => {
      const adapter = agentManager.requireAdapter('opencode');
      await adapter.generateCommands(testTemplates);

      expect(await fs.pathExists('.opencode/command/clavix-fast.md')).toBe(true);

      const content = await fs.readFile('.opencode/command/clavix-fast.md', 'utf-8');
      expect(content).toContain('---');
      expect(content).toContain('description: Fast improvements');
    });

    it('should generate commands for Amp without frontmatter', async () => {
      const adapter = agentManager.requireAdapter('amp');
      await adapter.generateCommands(testTemplates);

      expect(await fs.pathExists('.agents/commands/clavix-fast.md')).toBe(true);

      const content = await fs.readFile('.agents/commands/clavix-fast.md', 'utf-8');
      expect(content).toContain('Fast Mode');
      expect(content).not.toContain('---'); // No frontmatter
    });

    it('should generate same content for all providers simultaneously', async () => {
      const adapters = [
        'claude-code',
        'cursor',
        'droid',
        'opencode',
        'amp',
      ];

      for (const name of adapters) {
        const adapter = agentManager.requireAdapter(name);
        await adapter.generateCommands(testTemplates);
      }

      // All should have the commands
      expect(await fs.pathExists('.claude/commands/clavix/fast.md')).toBe(true);
      expect(await fs.pathExists('.cursor/commands/clavix-fast.md')).toBe(true);
      expect(await fs.pathExists('.factory/commands/clavix-fast.md')).toBe(true);
      expect(await fs.pathExists('.opencode/command/clavix-fast.md')).toBe(true);
      expect(await fs.pathExists('.agents/commands/clavix-fast.md')).toBe(true);
    });
  });

  describe('Validation Across Providers', () => {
    it('should validate single adapter', async () => {
      await fs.ensureDir('.claude');

      const results = await agentManager.validateAdapters(['claude-code']);
      const result = results.get('claude-code');

      expect(result).toBeDefined();
      expect(result?.valid).toBe(true);
    });

    it('should validate multiple adapters', async () => {
      // Create root directories so validation can succeed
      await fs.ensureDir('.claude');
      await fs.ensureDir('.cursor');
      await fs.ensureDir('.agents');

      const adapters = ['claude-code', 'cursor', 'amp'];
      const results = await agentManager.validateAdapters(adapters);

      expect(results.size).toBe(3);
      for (const [name, result] of results) {
        expect(result.valid).toBe(true);
      }
    });

    it('should handle validation warnings', async () => {
      // Without creating directories, adapters should warn
      const results = await agentManager.validateAdapters(['cursor']);
      const result = results.get('cursor');

      expect(result?.valid).toBe(true);
      expect(result?.warnings).toBeDefined();
    });
  });

  describe('Directory Structure Differences', () => {
    it('should respect Claude Code subdirectory structure', async () => {
      const adapter = agentManager.requireAdapter('claude-code');
      const templates: CommandTemplate[] = [
        { name: 'test', description: 'Test', content: 'Test' },
      ];

      await adapter.generateCommands(templates);

      // Claude Code supports subdirectories
      expect(await fs.pathExists('.claude/commands/clavix')).toBe(true);
      expect(await fs.pathExists('.claude/commands/clavix/test.md')).toBe(true);
    });

    it('should use flat structure for Cursor', async () => {
      const adapter = agentManager.requireAdapter('cursor');
      const templates: CommandTemplate[] = [
        { name: 'test', description: 'Test', content: 'Test' },
      ];

      await adapter.generateCommands(templates);

      // Cursor uses flat structure
      const items = await fs.readdir('.cursor/commands', { withFileTypes: true });
      const dirs = items.filter((i) => i.isDirectory());
      expect(dirs).toHaveLength(0);
    });

    it('should use flat structure for all providers except Claude Code', async () => {
      const flatProviders = ['cursor', 'droid', 'opencode', 'amp', 'codebuddy', 'copilot', 'kilocode', 'cline', 'roocode'];
      const templates: CommandTemplate[] = [
        { name: 'test', description: 'Test', content: 'Test' },
      ];

      for (const name of flatProviders) {
        const adapter = agentManager.requireAdapter(name);
        await adapter.generateCommands(templates);
      }

      // Check all use flat structures
      const cursorItems = await fs.readdir('.cursor/commands', { withFileTypes: true });
      expect(cursorItems.filter((i) => i.isDirectory())).toHaveLength(0);

      const droidItems = await fs.readdir('.factory/commands', { withFileTypes: true });
      expect(droidItems.filter((i) => i.isDirectory())).toHaveLength(0);
    });
  });

  describe('Feature Flag Differences', () => {
    it('should identify frontmatter support differences', () => {
      const withFrontmatter = ['augment', 'droid', 'opencode', 'codebuddy', 'codex', 'roocode', 'copilot'];
      const withoutFrontmatter = ['claude-code', 'cursor', 'amp', 'crush', 'windsurf', 'kilocode', 'cline', 'gemini', 'qwen'];

      for (const name of withFrontmatter) {
        const adapter = agentManager.requireAdapter(name);
        expect(adapter.features?.supportsFrontmatter).toBe(true);
      }

      for (const name of withoutFrontmatter) {
        const adapter = agentManager.requireAdapter(name);
        expect(adapter.features?.supportsFrontmatter).toBeFalsy();
      }
    });

    it('should identify subdirectory support', () => {
      const claudeAdapter = agentManager.requireAdapter('claude-code');
      expect(claudeAdapter.features?.supportsSubdirectories).toBe(true);

      const otherAdapters = ['cursor', 'droid', 'opencode', 'amp', 'codebuddy', 'copilot', 'kilocode', 'cline', 'roocode', 'codex'];
      for (const name of otherAdapters) {
        const adapter = agentManager.requireAdapter(name);
        expect(adapter.features?.supportsSubdirectories).toBe(false);
      }
    });

    it('should identify executable commands support', () => {
      const ampAdapter = agentManager.requireAdapter('amp');
      expect(ampAdapter.features?.supportsExecutableCommands).toBe(true);
    });
  });

  describe('Adapter Choices for UI', () => {
    it('should provide formatted choices for prompts', () => {
      const choices = agentManager.getAdapterChoices();

      expect(choices).toHaveLength(16);
      expect(choices[0].name).toContain('Claude Code');
      expect(choices[0].value).toBe('claude-code');

      // Verify new providers are included
      expect(choices.find(c => c.value === 'windsurf')).toBeDefined();
      expect(choices.find(c => c.value === 'kilocode')).toBeDefined();
      expect(choices.find(c => c.value === 'cline')).toBeDefined();
      expect(choices.find(c => c.value === 'roocode')).toBeDefined();
      expect(choices.find(c => c.value === 'augment')).toBeDefined();
      expect(choices.find(c => c.value === 'copilot')).toBeDefined();
    });

    it('should pre-select Claude Code by default', () => {
      const choices = agentManager.getAdapterChoices();
      const claudeChoice = choices.find((c) => c.value === 'claude-code');

      expect(claudeChoice?.checked).toBe(true);
    });

    it('should include directory info in choice names', () => {
      const choices = agentManager.getAdapterChoices();

      expect(choices.find((c) => c.value === 'claude-code')?.name).toContain('.claude/commands/clavix');
      expect(choices.find((c) => c.value === 'cursor')?.name).toContain('.cursor/commands');
      expect(choices.find((c) => c.value === 'droid')?.name).toContain('.factory/commands');
    });
  });

  describe('Cross-Provider Command Sync', () => {
    it('should sync same commands across all providers', async () => {
      const templates: CommandTemplate[] = [
        {
          name: 'shared-cmd',
          description: 'Shared command',
          content: 'This command is shared across all providers',
        },
      ];

      // Generate for all providers
      for (const name of agentManager.getAvailableAgents()) {
        const adapter = agentManager.requireAdapter(name);
        await adapter.generateCommands(templates);
      }

      // Verify all have the command (checking core content)
      const claudeContent = await fs.readFile('.claude/commands/clavix/shared-cmd.md', 'utf-8');
      const cursorContent = await fs.readFile('.cursor/commands/clavix-shared-cmd.md', 'utf-8');
      const ampContent = await fs.readFile('.agents/commands/clavix-shared-cmd.md', 'utf-8');

      // Core content should be present in all (even if formatted differently)
      expect(claudeContent).toContain('shared across all providers');
      expect(cursorContent).toContain('shared across all providers');
      expect(ampContent).toContain('shared across all providers');
    });
  });

  describe('Provider Conflict Resolution', () => {
    it('should handle same command name across providers', async () => {
      const templates: CommandTemplate[] = [
        { name: 'duplicate', description: 'Duplicate', content: 'Content' },
      ];

      // Should not conflict - each provider has its own directory
      for (const name of agentManager.getAvailableAgents()) {
        const adapter = agentManager.requireAdapter(name);
        await adapter.generateCommands(templates);
      }

      expect(await fs.pathExists('.claude/commands/clavix/duplicate.md')).toBe(true);
      expect(await fs.pathExists('.cursor/commands/clavix-duplicate.md')).toBe(true);
      expect(await fs.pathExists('.factory/commands/clavix-duplicate.md')).toBe(true);
      expect(await fs.pathExists('.opencode/command/clavix-duplicate.md')).toBe(true);
      expect(await fs.pathExists('.agents/commands/clavix-duplicate.md')).toBe(true);
    });

    it('should handle provider directory conflicts gracefully', async () => {
      // Create a file where directory should be
      await fs.writeFile('.claude', 'This is a file, not a directory');

      const detected = await agentManager.detectAgents();
      const names = detected.map((a) => a.name);

      // Claude Code should still be detected (fs.pathExists returns true for files)
      expect(names).toContain('claude-code');
    });
  });
});
