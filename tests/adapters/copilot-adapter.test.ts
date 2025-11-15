import * as fs from 'fs-extra';
import * as path from 'path';
import { CopilotAdapter } from '../../src/core/adapters/copilot-adapter';
import { CommandTemplate } from '../../src/types/agent';

describe('CopilotAdapter', () => {
  let adapter: CopilotAdapter;
  const testDir = path.join(__dirname, '../fixtures/copilot-adapter');
  let originalCwd: string;
  let originalHomeOverride: string | undefined;

  beforeEach(async () => {
    await fs.remove(testDir);
    await fs.ensureDir(testDir);

    originalCwd = process.cwd();
    process.chdir(testDir);

    originalHomeOverride = process.env.CLAVIX_HOME_OVERRIDE;
    process.env.CLAVIX_HOME_OVERRIDE = testDir;

    adapter = new CopilotAdapter();
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

  it('exposes Copilot metadata', () => {
    expect(adapter.name).toBe('copilot');
    expect(adapter.displayName).toBe('Copilot CLI');
    expect(adapter.directory).toBe('.github/agents');
    expect(adapter.fileExtension).toBe('.agent.md');
  });

  it('defines Copilot feature flags', () => {
    expect(adapter.features).toEqual({
      supportsSubdirectories: false,
      supportsFrontmatter: true,
      frontmatterFields: ['name', 'description', 'tools', 'target'],
    });
  });

  describe('detectProject', () => {
    it('detects local .github/agents directory', async () => {
      await fs.ensureDir(path.join('.github', 'agents'));
      await expect(adapter.detectProject()).resolves.toBe(true);
    });

    it('detects global ~/.copilot/agents directory', async () => {
      await fs.ensureDir(path.join(testDir, '.copilot', 'agents'));
      await expect(adapter.detectProject()).resolves.toBe(true);
    });

    it('returns false when Copilot directories are absent', async () => {
      await expect(adapter.detectProject()).resolves.toBe(false);
    });
  });

  describe('formatCommand', () => {
    it('adds Copilot agent frontmatter with title-cased name', () => {
      const template: CommandTemplate = {
        name: 'deep-insights',
        description: 'Full analysis',
        content: 'Process {{ARGS}}',
      };

      const formatted = (adapter as unknown as { formatCommand(t: CommandTemplate): string }).formatCommand(
        template
      );

      expect(formatted.startsWith('---\nname: Clavix: Deep Insights')).toBe(true);
      expect(formatted).toContain('description: Full analysis');
      expect(formatted).toContain('Process {{ARGS}}');
    });
  });

  describe('generateCommands', () => {
    it('writes agent profiles with .agent.md extension', async () => {
      const templates: CommandTemplate[] = [
        {
          name: 'fast',
          description: 'Fast improvements',
          content: 'Handle {{ARGS}} swiftly.',
        },
      ];

      await adapter.generateCommands(templates);

      const filePath = path.join('.github/agents', 'clavix-fast.agent.md');
      const content = await fs.readFile(filePath, 'utf8');

      expect(content).toContain('name: Clavix: Fast');
      expect(content).toContain('description: Fast improvements');
      expect(content).toContain('Handle {{ARGS}} swiftly.');
    });
  });

  describe('validate', () => {
    it('ensures agent directory exists', async () => {
      const result = await adapter.validate();

      expect(result.valid).toBe(true);
      expect(await fs.pathExists(path.join('.github', 'agents'))).toBe(true);
    });
  });
});
