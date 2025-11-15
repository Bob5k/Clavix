import * as fs from 'fs-extra';
import * as path from 'path';
import { CodexAdapter } from '../../src/core/adapters/codex-adapter';
import { CommandTemplate } from '../../src/types/agent';

describe('CodexAdapter', () => {
  let adapter: CodexAdapter;
  const testDir = path.join(__dirname, '../fixtures/codex-adapter');
  let originalHomeOverride: string | undefined;

  beforeEach(async () => {
    await fs.remove(testDir);
    await fs.ensureDir(testDir);

    originalHomeOverride = process.env.CLAVIX_HOME_OVERRIDE;
    process.env.CLAVIX_HOME_OVERRIDE = testDir;

    adapter = new CodexAdapter();
  });

  afterEach(async () => {
    if (originalHomeOverride === undefined) {
      delete process.env.CLAVIX_HOME_OVERRIDE;
    } else {
      process.env.CLAVIX_HOME_OVERRIDE = originalHomeOverride;
    }
    await fs.remove(testDir);
  });

  it('should expose Codex metadata', () => {
    expect(adapter.name).toBe('codex');
    expect(adapter.displayName).toBe('Codex CLI');
    expect(adapter.directory).toBe('~/.codex/prompts');
    expect(adapter.fileExtension).toBe('.md');
  });

  it('returns absolute command path under user home', () => {
    expect(adapter.getCommandPath()).toBe(path.join(testDir, '.codex', 'prompts'));
  });

  describe('detectProject', () => {
    it('detects when ~/.codex exists', async () => {
      await fs.ensureDir(path.join(testDir, '.codex'));
      await expect(adapter.detectProject()).resolves.toBe(true);
    });

    it('returns false when directory missing', async () => {
      await expect(adapter.detectProject()).resolves.toBe(false);
    });
  });

  describe('formatCommand', () => {
    it('adds frontmatter and replaces argument placeholder', () => {
      const template: CommandTemplate = {
        name: 'test',
        description: 'Example description',
        content: 'Work with {{ARGS}}',
      };

      const formatted = (adapter as unknown as { formatCommand(t: CommandTemplate): string }).formatCommand(template);

      expect(formatted).toContain('description: Example description');
      expect(formatted).toContain('argument-hint: [prompt]');
      expect(formatted).toContain('Work with $ARGUMENTS');
    });
  });

  describe('generateCommands', () => {
    it('writes command files to the global prompts directory', async () => {
      const templates: CommandTemplate[] = [
        {
          name: 'plan',
          description: 'Planning command',
          content: 'Plan for {{ARGS}}',
        },
      ];

      await adapter.generateCommands(templates);

      const fileContent = await fs.readFile(path.join(testDir, '.codex', 'prompts', 'clavix-plan.md'), 'utf8');

      expect(fileContent).toContain('description: Planning command');
      expect(fileContent).toContain('Plan for $ARGUMENTS');
    });
  });
});
