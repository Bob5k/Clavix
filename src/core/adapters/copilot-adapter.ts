import * as os from 'os';
import * as path from 'path';
import { BaseAdapter } from './base-adapter';
import { CommandTemplate } from '../../types/agent';
import { FileSystem } from '../../utils/file-system';

/**
 * GitHub Copilot CLI adapter (custom agents)
 * Generates agent profiles under .github/agents
 */
export class CopilotAdapter extends BaseAdapter {
  readonly name = 'copilot';
  readonly displayName = 'Copilot CLI';
  readonly directory = '.github/agents';
  readonly fileExtension = '.agent.md';
  readonly features = {
    supportsSubdirectories: false,
    supportsFrontmatter: true,
    frontmatterFields: ['name', 'description', 'tools', 'target'],
  };

  async detectProject(): Promise<boolean> {
    if (await FileSystem.exists('.github/agents')) {
      return true;
    }

    const homeAgentsDir = path.join(this.getHomeDir(), '.copilot', 'agents');
    return FileSystem.exists(homeAgentsDir);
  }

  getCommandPath(): string {
    return this.directory;
  }

  getTargetFilename(name: string): string {
    return `clavix-${name}${this.fileExtension}`;
  }

  protected formatCommand(template: CommandTemplate): string {
    const displayName = `Clavix: ${this.toTitle(template.name)}`;
    const frontmatter = `---\nname: ${displayName}\ndescription: ${template.description}\n---\n\n`;
    return frontmatter + template.content;
  }

  private toTitle(value: string): string {
    return value
      .split(/[-_\s]+/)
      .filter(Boolean)
      .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
      .join(' ');
  }

  private getHomeDir(): string {
    return process.env.CLAVIX_HOME_OVERRIDE || os.homedir();
  }
}
