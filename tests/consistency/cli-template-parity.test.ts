import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { describe, it, expect } from '@jest/globals';

// ESM module path resolution
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../..');

/**
 * CLI-Template Parity Tests (v4.11.2)
 *
 * These tests ensure that:
 * 1. All planning/workflow CLI commands have corresponding canonical templates
 * 2. All canonical templates have corresponding CLI implementations
 * 3. Commands documented as "agent-only" don't have public slash commands
 * 4. No legacy command references exist in current templates
 *
 * This prevents the "half-update" problem where commands are changed in CLI
 * but templates are forgotten (like the /clavix:fast → /clavix:improve migration).
 */

describe('CLI-Template Parity', () => {
  const cliCommandsDir = path.join(ROOT_DIR, 'src/cli/commands');
  const canonicalTemplatesDir = path.join(ROOT_DIR, 'src/templates/slash-commands/_canonical');

  /**
   * Commands that MUST have a corresponding canonical template
   * These are user-facing workflow commands that agents execute via slash commands
   */
  const COMMANDS_REQUIRING_TEMPLATE: string[] = [
    'archive',
    'execute',
    'implement',
    'improve',
    'plan',
    'prd',
    'start',
    'summarize',
    'verify',
  ];

  /**
   * Commands that are utility/helper commands (no template required)
   * These are either:
   * - CLI-only utilities (config, init, update, version)
   * - Sub-commands used within other workflows (task-complete)
   * - Agent-only commands not exposed as slash commands (analyze)
   */
  const UTILITY_COMMANDS: string[] = [
    'analyze', // Agent-only: Used internally by improve workflow
    'config', // CLI utility: Configuration management
    'init', // CLI utility: Project initialization
    'list', // CLI utility: List prompts/projects
    'show', // CLI utility: Show prompt details
    'task-complete', // Sub-command: Used within implement workflow
    'update', // CLI utility: Update Clavix
    'version', // CLI utility: Show version
  ];

  /**
   * Agent-only commands should NOT have public slash command templates
   * They are invoked by the agent, not by users
   */
  const AGENT_ONLY_COMMANDS: string[] = [
    'analyze', // Called by improve.md workflow, not directly by users
  ];

  /**
   * Legacy commands that should NOT exist anywhere
   * (removed in v4.11, replaced by /clavix:improve)
   */
  const DEPRECATED_COMMANDS: string[] = ['fast', 'deep', 'prompts'];

  describe('Template Coverage', () => {
    it('every planning/workflow CLI command has a corresponding template', async () => {
      const cliFiles = await fs.readdir(cliCommandsDir);
      const templateFiles = await fs.readdir(canonicalTemplatesDir);

      const cliCommands = cliFiles
        .filter((f) => f.endsWith('.ts') && !f.startsWith('index'))
        .map((f) => f.replace('.ts', ''));

      const templates = templateFiles
        .filter((f) => f.endsWith('.md'))
        .map((f) => f.replace('.md', ''));

      const missingTemplates: string[] = [];

      for (const cmd of COMMANDS_REQUIRING_TEMPLATE) {
        if (cliCommands.includes(cmd) && !templates.includes(cmd)) {
          missingTemplates.push(cmd);
        }
      }

      expect(missingTemplates).toEqual([]);
    });

    it('every canonical template has a corresponding CLI command', async () => {
      const cliFiles = await fs.readdir(cliCommandsDir);
      const templateFiles = await fs.readdir(canonicalTemplatesDir);

      const cliCommands = cliFiles
        .filter((f) => f.endsWith('.ts') && !f.startsWith('index'))
        .map((f) => f.replace('.ts', ''));

      const templates = templateFiles
        .filter((f) => f.endsWith('.md'))
        .map((f) => f.replace('.md', ''));

      const orphanedTemplates: string[] = [];

      for (const template of templates) {
        if (!cliCommands.includes(template)) {
          orphanedTemplates.push(template);
        }
      }

      expect(orphanedTemplates).toEqual([]);
    });

    it('all CLI commands are categorized (template-required OR utility)', async () => {
      const cliFiles = await fs.readdir(cliCommandsDir);
      const cliCommands = cliFiles
        .filter((f) => f.endsWith('.ts') && !f.startsWith('index'))
        .map((f) => f.replace('.ts', ''));

      // Filter out 'prompts' subdirectory if it exists
      const actualCommands = cliCommands.filter((c) => !c.includes('/'));

      const allCategorized = [...COMMANDS_REQUIRING_TEMPLATE, ...UTILITY_COMMANDS];

      const uncategorizedCommands = actualCommands.filter((cmd) => !allCategorized.includes(cmd));

      expect(uncategorizedCommands).toEqual([]);
    });
  });

  describe('Agent-Only Commands', () => {
    it('agent-only commands do NOT have public slash command templates', async () => {
      const templateFiles = await fs.readdir(canonicalTemplatesDir);
      const templates = templateFiles
        .filter((f) => f.endsWith('.md'))
        .map((f) => f.replace('.md', ''));

      const violatingCommands = AGENT_ONLY_COMMANDS.filter((cmd) => templates.includes(cmd));

      expect(violatingCommands).toEqual([]);
    });

    it('agent-only commands have CLI implementation', async () => {
      const cliFiles = await fs.readdir(cliCommandsDir);
      const cliCommands = cliFiles
        .filter((f) => f.endsWith('.ts') && !f.startsWith('index'))
        .map((f) => f.replace('.ts', ''));

      const missingImplementations = AGENT_ONLY_COMMANDS.filter(
        (cmd) => !cliCommands.includes(cmd)
      );

      expect(missingImplementations).toEqual([]);
    });

    it('analyze command exists in CLI but NOT in templates', async () => {
      const cliFiles = await fs.readdir(cliCommandsDir);
      const templateFiles = await fs.readdir(canonicalTemplatesDir);

      const hasCliCommand = cliFiles.includes('analyze.ts');
      const hasTemplate = templateFiles.includes('analyze.md');

      expect(hasCliCommand).toBe(true);
      expect(hasTemplate).toBe(false);
    });
  });

  describe('Deprecated Commands', () => {
    it('deprecated command templates do NOT exist', async () => {
      const templateFiles = await fs.readdir(canonicalTemplatesDir);
      const templates = templateFiles
        .filter((f) => f.endsWith('.md'))
        .map((f) => f.replace('.md', ''));

      const existingDeprecated = DEPRECATED_COMMANDS.filter((cmd) => templates.includes(cmd));

      expect(existingDeprecated).toEqual([]);
    });

    it('deprecated command CLI files do NOT exist', async () => {
      const cliFiles = await fs.readdir(cliCommandsDir);
      const cliCommands = cliFiles
        .filter((f) => f.endsWith('.ts') && !f.startsWith('index'))
        .map((f) => f.replace('.ts', ''));

      const existingDeprecated = DEPRECATED_COMMANDS.filter((cmd) => cliCommands.includes(cmd));

      expect(existingDeprecated).toEqual([]);
    });
  });

  describe('Legacy Command References', () => {
    it('canonical templates do not reference /clavix:fast', async () => {
      const templateFiles = await fs.readdir(canonicalTemplatesDir);
      const violations: string[] = [];

      for (const file of templateFiles.filter((f) => f.endsWith('.md'))) {
        const content = await fs.readFile(path.join(canonicalTemplatesDir, file), 'utf-8');
        if (content.includes('/clavix:fast')) {
          violations.push(file);
        }
      }

      expect(violations).toEqual([]);
    });

    it('canonical templates do not reference /clavix:deep', async () => {
      const templateFiles = await fs.readdir(canonicalTemplatesDir);
      const violations: string[] = [];

      for (const file of templateFiles.filter((f) => f.endsWith('.md'))) {
        const content = await fs.readFile(path.join(canonicalTemplatesDir, file), 'utf-8');
        if (content.includes('/clavix:deep')) {
          violations.push(file);
        }
      }

      expect(violations).toEqual([]);
    });

    it('canonical templates do not reference /clavix:prompts', async () => {
      const templateFiles = await fs.readdir(canonicalTemplatesDir);
      const violations: string[] = [];

      for (const file of templateFiles.filter((f) => f.endsWith('.md'))) {
        const content = await fs.readFile(path.join(canonicalTemplatesDir, file), 'utf-8');
        if (content.includes('/clavix:prompts')) {
          violations.push(file);
        }
      }

      expect(violations).toEqual([]);
    });
  });

  describe('Template-CLI Command Mapping', () => {
    it('improve.md template exists (v4.11 unified command)', async () => {
      const templatePath = path.join(canonicalTemplatesDir, 'improve.md');
      expect(await fs.pathExists(templatePath)).toBe(true);
    });

    it('improve CLI command exists', async () => {
      const cliPath = path.join(cliCommandsDir, 'improve.ts');
      expect(await fs.pathExists(cliPath)).toBe(true);
    });

    it('improve.md references correct depth terminology', async () => {
      const content = await fs.readFile(path.join(canonicalTemplatesDir, 'improve.md'), 'utf-8');

      // Should use new terminology
      expect(content).toContain('standard');
      expect(content).toContain('comprehensive');

      // Should not use old terminology (except in context of explaining migration)
      // Allow 'fast' and 'deep' in comments/explanations about the change
    });
  });
});
