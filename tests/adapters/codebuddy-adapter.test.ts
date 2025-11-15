import * as fs from 'fs-extra';
import * as path from 'path';
import { CodeBuddyAdapter } from '../../src/core/adapters/codebuddy-adapter';
import { CommandTemplate } from '../../src/types/agent';

describe('CodeBuddyAdapter', () => {
  let adapter: CodeBuddyAdapter;
  const testDir = path.join(__dirname, '../fixtures/codebuddy-adapter');
  let originalCwd: string;
  let originalHomeOverride: string | undefined;

  beforeEach(async () => {
    await fs.remove(testDir);
    await fs.ensureDir(testDir);

    originalCwd = process.cwd();
    process.chdir(testDir);

    originalHomeOverride = process.env.CLAVIX_HOME_OVERRIDE;
    process.env.CLAVIX_HOME_OVERRIDE = testDir;

    adapter = new CodeBuddyAdapter();
  });

  afterEach(async () => {
    process.chdir(originalCwd);
    if (originalHomeOverride === undefined) {
      delete process.env.CLAVIX_HOME_OVERRIDE;
    } else {
      process.env.CLAVIX_HOME_OVERRIDE = originalHomeOverride;
    }
    await fs.remove(testDir);
  });

  it('should expose CodeBuddy metadata', () => {
    expect(adapter.name).toBe('codebuddy');
    expect(adapter.displayName).toBe('CodeBuddy');
    expect(adapter.directory).toBe('.codebuddy/commands');
    expect(adapter.fileExtension).toBe('.md');
  });

  describe('detectProject', () => {
    it('detects local .codebuddy directory', async () => {
      await fs.ensureDir('.codebuddy');
      await expect(adapter.detectProject()).resolves.toBe(true);
    });

    it('detects global ~/.codebuddy directory', async () => {
      await fs.ensureDir(path.join(testDir, '.codebuddy'));
      await expect(adapter.detectProject()).resolves.toBe(true);
    });

    it('returns false when no directories exist', async () => {
      await expect(adapter.detectProject()).resolves.toBe(false);
    });
  });

  describe('formatCommand', () => {
    it('wraps content with frontmatter and replaces arguments', () => {
      const template: CommandTemplate = {
        name: 'test',
        description: 'Example description',
        content: 'Use {{ARGS}} in the command',
      };

      const formatted = (adapter as unknown as { formatCommand(t: CommandTemplate): string }).formatCommand(template);

      expect(formatted).toContain('description: Example description');
      expect(formatted).toContain('argument-hint: [prompt]');
      expect(formatted).toContain('Use $1 in the command');
      expect(formatted).not.toContain('{{ARGS}}');
    });
  });

  describe('generateCommands', () => {
    it('creates command files with CodeBuddy formatting', async () => {
      const templates: CommandTemplate[] = [
        {
          name: 'fast',
          description: 'Fast improvements',
          content: '# Fast\n\nHandle {{ARGS}} quickly.',
        },
      ];

      await adapter.generateCommands(templates);

      const fileContent = await fs.readFile(path.join('.codebuddy/commands', 'clavix-fast.md'), 'utf8');

      expect(fileContent).toContain('description: Fast improvements');
      expect(fileContent).toContain('argument-hint: [prompt]');
      expect(fileContent).toContain('Handle $1 quickly.');
    });
  });
});
