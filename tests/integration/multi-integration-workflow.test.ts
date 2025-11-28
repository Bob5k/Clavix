/**
 * Integration test for multi-integration workflow
 * Tests integration across multiple AI provider adapters
 */

import * as path from 'path';
import fs from 'fs-extra';
import { AgentManager } from '../../src/core/agent-manager';
import { CommandTemplate } from '../../src/types/agent';
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Multi-Integration Workflow Integration', () => {
  const testDir = path.join(__dirname, '../tmp/multi-integration-test');
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

      // Note: Copilot is now handled via CopilotInstructionsGenerator, not as an adapter
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
      expect(agentManager.hasAgent('llxprt')).toBe(true);
      expect(agentManager.hasAgent('cline')).toBe(true);
      expect(agentManager.hasAgent('roocode')).toBe(true);
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
      // Note: copilot is now handled via CopilotInstructionsGenerator, not as an adapter
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

    it('should detect multiple integrations in same project', async () => {
      await fs.ensureDir('.claude');
      await fs.ensureDir('.cursor');
      await fs.ensureDir('.agents'); // amp detection directory

      const detected = await agentManager.detectAgents();

      expect(detected).toHaveLength(3);
      const names = detected.map((a) => a.name);
      expect(names).toContain('claude-code');
      expect(names).toContain('cursor');
      expect(names).toContain('amp');
    });

    it('should detect all integrations when all markers present', async () => {
      // Create directories for all 16 adapters (using correct detection paths)
      await fs.ensureDir('.claude'); // claude-code
      await fs.ensureDir('.cursor'); // cursor
      await fs.ensureDir('.factory'); // droid (detection: .factory)
      await fs.ensureDir('.opencode'); // opencode
      await fs.ensureDir('.agents'); // amp (detection: .agents)
      await fs.ensureDir('.crush'); // crush
      await fs.ensureDir('.windsurf'); // windsurf
      await fs.ensureDir('.kilocode'); // kilocode
      await fs.ensureDir('.clinerules'); // cline (detection: .clinerules)
      await fs.ensureDir('.roo'); // roocode
      await fs.ensureDir('.codebuddy'); // codebuddy
      await fs.ensureDir('.gemini'); // gemini
      await fs.ensureDir('.qwen'); // qwen
      await fs.ensureDir('.llxprt'); // llxprt
      await fs.ensureDir('.augment'); // augment
      await fs.ensureDir('.codex'); // codex (project dir)

      const detected = await agentManager.detectAgents();
      const names = detected.map((a) => a.name);

      expect(detected).toHaveLength(16);
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
          'llxprt',
          'augment',
          'codex',
        ])
      );
    });
  });

  describe('Command Generation Across Integrations', () => {
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

      const commandPath = adapter.getCommandPath();
      const fastPath = path.join(commandPath, adapter.getTargetFilename('fast'));
      const deepPath = path.join(commandPath, adapter.getTargetFilename('deep'));

      expect(await fs.pathExists(fastPath)).toBe(true);
      expect(await fs.pathExists(deepPath)).toBe(true);

      const content = await fs.readFile(fastPath, 'utf-8');
      expect(content).toContain('Fast Mode');
    });

    it('should generate commands for Droid', async () => {
      const adapter = agentManager.requireAdapter('droid');
      await adapter.generateCommands(testTemplates);

      const commandPath = adapter.getCommandPath();
      const fastPath = path.join(commandPath, adapter.getTargetFilename('fast'));

      expect(await fs.pathExists(fastPath)).toBe(true);

      const content = await fs.readFile(fastPath, 'utf-8');
      expect(content).toContain('Fast Mode');
    });

    it('should generate commands for Amp', async () => {
      const adapter = agentManager.requireAdapter('amp');
      await adapter.generateCommands(testTemplates);

      const commandPath = adapter.getCommandPath();
      const fastPath = path.join(commandPath, adapter.getTargetFilename('fast'));

      expect(await fs.pathExists(fastPath)).toBe(true);

      const content = await fs.readFile(fastPath, 'utf-8');
      expect(content).toContain('Fast Mode');
    });

    it('should generate same content for all integrations simultaneously', async () => {
      const adapterNames = ['claude-code', 'cursor', 'windsurf', 'amp'];

      for (const name of adapterNames) {
        const adapter = agentManager.requireAdapter(name);
        await adapter.generateCommands(testTemplates);
      }

      // Check all have their commands using dynamic paths
      for (const name of adapterNames) {
        const adapter = agentManager.requireAdapter(name);
        const commandPath = adapter.getCommandPath();
        const fastPath = path.join(commandPath, adapter.getTargetFilename('fast'));
        expect(await fs.pathExists(fastPath)).toBe(true);
      }
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
      const templates: CommandTemplate[] = [{ name: 'test', description: 'Test', content: 'Test' }];

      await adapter.generateCommands(templates);

      // Claude Code supports subdirectories
      expect(await fs.pathExists('.claude/commands/clavix')).toBe(true);
      expect(await fs.pathExists('.claude/commands/clavix/test.md')).toBe(true);
    });

    it('should use flat structure for Cursor', async () => {
      const adapter = agentManager.requireAdapter('cursor');
      const templates: CommandTemplate[] = [{ name: 'test', description: 'Test', content: 'Test' }];

      await adapter.generateCommands(templates);

      // Cursor uses flat structure - use adapter's actual directory
      const commandPath = adapter.getCommandPath();
      const items = await fs.readdir(commandPath, { withFileTypes: true });
      const dirs = items.filter((i) => i.isDirectory());
      expect(dirs).toHaveLength(0);
    });

    it('should use flat structure for simple integrations', async () => {
      // Simple adapters that use flat file structure
      const flatProviders = ['cursor', 'windsurf', 'cline', 'amp'];
      const templates: CommandTemplate[] = [{ name: 'test', description: 'Test', content: 'Test' }];

      for (const name of flatProviders) {
        const adapter = agentManager.requireAdapter(name);
        await adapter.generateCommands(templates);

        // Check each uses flat structure
        const commandPath = adapter.getCommandPath();
        const items = await fs.readdir(commandPath, { withFileTypes: true });
        const dirs = items.filter((i) => i.isDirectory());
        expect(dirs).toHaveLength(0);
      }
    });
  });

  describe('Feature Flag Differences', () => {
    it('should have features on all adapters', () => {
      // All adapters should expose a features object
      for (const adapter of agentManager.getAdapters()) {
        expect(adapter.features).toBeDefined();
        expect(typeof adapter.features?.supportsFrontmatter).toBe('boolean');
        expect(typeof adapter.features?.supportsSubdirectories).toBe('boolean');
      }
    });

    it('should identify subdirectory support', () => {
      // Claude Code and TOML adapters support subdirectories
      const claudeAdapter = agentManager.requireAdapter('claude-code');
      expect(claudeAdapter.features?.supportsSubdirectories).toBe(true);

      // TOML adapters (gemini, qwen, llxprt) also support subdirectories
      const tomlAdapters = ['gemini', 'qwen', 'llxprt'];
      for (const name of tomlAdapters) {
        const adapter = agentManager.requireAdapter(name);
        expect(adapter.features?.supportsSubdirectories).toBe(true);
      }

      // Other adapters don't support subdirectories
      const flatAdapters = ['cursor', 'windsurf', 'cline', 'amp'];
      for (const name of flatAdapters) {
        const adapter = agentManager.requireAdapter(name);
        expect(adapter.features?.supportsSubdirectories).toBe(false);
      }
    });

    it('should identify frontmatter support', () => {
      // Currently no adapters use frontmatter by default
      for (const adapter of agentManager.getAdapters()) {
        expect(adapter.features?.supportsFrontmatter).toBe(false);
      }
    });
  });

  describe('Adapter Choices for UI', () => {
    it('should provide formatted choices for prompts', () => {
      const choices = agentManager.getAdapterChoices();

      // Note: Copilot is now handled via CopilotInstructionsGenerator, not as an adapter
      expect(choices).toHaveLength(16);
      expect(choices[0].name).toContain('Claude Code');
      expect(choices[0].value).toBe('claude-code');

      // Verify new providers are included
      expect(choices.find((c) => c.value === 'windsurf')).toBeDefined();
      expect(choices.find((c) => c.value === 'kilocode')).toBeDefined();
      expect(choices.find((c) => c.value === 'llxprt')).toBeDefined();
      expect(choices.find((c) => c.value === 'cline')).toBeDefined();
      expect(choices.find((c) => c.value === 'roocode')).toBeDefined();
      expect(choices.find((c) => c.value === 'augment')).toBeDefined();
      // copilot is no longer an adapter
    });

    it('should pre-select Claude Code by default', () => {
      const choices = agentManager.getAdapterChoices();
      const claudeChoice = choices.find((c) => c.value === 'claude-code');

      expect(claudeChoice?.checked).toBe(true);
    });

    it('should include directory info in choice names', () => {
      const choices = agentManager.getAdapterChoices();

      // Verify choices include the adapter directory in the name
      const claudeChoice = choices.find((c) => c.value === 'claude-code');
      const cursorChoice = choices.find((c) => c.value === 'cursor');
      const droidChoice = choices.find((c) => c.value === 'droid');

      expect(claudeChoice?.name).toContain('.claude/commands/clavix');
      expect(cursorChoice?.name).toContain('.cursor/rules');
      expect(droidChoice?.name).toContain('.factory/commands');
    });
  });

  describe('Cross-Provider Command Sync', () => {
    it('should sync same commands across all integrations', async () => {
      const templates: CommandTemplate[] = [
        {
          name: 'shared-cmd',
          description: 'Shared command',
          content: 'This command is shared across all integrations',
        },
      ];

      // Generate for all integrations
      for (const name of agentManager.getAvailableAgents()) {
        const adapter = agentManager.requireAdapter(name);
        await adapter.generateCommands(templates);
      }

      // Verify all have the command (checking core content)
      const claudeAdapter = agentManager.requireAdapter('claude-code');
      const cursorAdapter = agentManager.requireAdapter('cursor');
      const ampAdapter = agentManager.requireAdapter('amp');

      const claudePath = path.join(
        claudeAdapter.getCommandPath(),
        claudeAdapter.getTargetFilename('shared-cmd')
      );
      const cursorPath = path.join(
        cursorAdapter.getCommandPath(),
        cursorAdapter.getTargetFilename('shared-cmd')
      );
      const ampPath = path.join(
        ampAdapter.getCommandPath(),
        ampAdapter.getTargetFilename('shared-cmd')
      );

      const claudeContent = await fs.readFile(claudePath, 'utf-8');
      const cursorContent = await fs.readFile(cursorPath, 'utf-8');
      const ampContent = await fs.readFile(ampPath, 'utf-8');

      // Core content should be present in all (even if formatted differently)
      expect(claudeContent).toContain('shared across all integrations');
      expect(cursorContent).toContain('shared across all integrations');
      expect(ampContent).toContain('shared across all integrations');
    });
  });

  describe('Provider Conflict Resolution', () => {
    it('should handle same command name across providers', async () => {
      const templates: CommandTemplate[] = [
        { name: 'duplicate', description: 'Duplicate', content: 'Content' },
      ];

      // Should not conflict - each integration has its own directory
      // Generate for a few representative adapters
      const testAdapters = ['claude-code', 'cursor', 'windsurf', 'cline'];
      for (const name of testAdapters) {
        const adapter = agentManager.requireAdapter(name);
        await adapter.generateCommands(templates);
      }

      // Check that each adapter generated its command file in its own directory
      const claudeAdapter = agentManager.requireAdapter('claude-code');
      const cursorAdapter = agentManager.requireAdapter('cursor');
      const windsurfAdapter = agentManager.requireAdapter('windsurf');
      const clineAdapter = agentManager.requireAdapter('cline');

      const claudePath = path.join(
        claudeAdapter.getCommandPath(),
        claudeAdapter.getTargetFilename('duplicate')
      );
      const cursorPath = path.join(
        cursorAdapter.getCommandPath(),
        cursorAdapter.getTargetFilename('duplicate')
      );
      const windsurfPath = path.join(
        windsurfAdapter.getCommandPath(),
        windsurfAdapter.getTargetFilename('duplicate')
      );
      const clinePath = path.join(
        clineAdapter.getCommandPath(),
        clineAdapter.getTargetFilename('duplicate')
      );

      expect(await fs.pathExists(claudePath)).toBe(true);
      expect(await fs.pathExists(cursorPath)).toBe(true);
      expect(await fs.pathExists(windsurfPath)).toBe(true);
      expect(await fs.pathExists(clinePath)).toBe(true);
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
