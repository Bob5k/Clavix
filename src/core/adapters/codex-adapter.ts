import * as os from 'os';
import * as path from 'path';
import { BaseAdapter } from './base-adapter';
import { CommandTemplate } from '../../types/agent';
import { FileSystem } from '../../utils/file-system';

/**
 * Codex CLI adapter
 * Commands stored globally under ~/.codex/prompts
 */
export class CodexAdapter extends BaseAdapter {
  readonly name = 'codex';
  readonly displayName = 'Codex CLI';
  readonly directory = '~/.codex/prompts';
  readonly fileExtension = '.md';
  readonly features = {
    supportsSubdirectories: false,
    supportsFrontmatter: true,
    argumentPlaceholder: '$ARGUMENTS',
    frontmatterFields: ['description', 'argument-hint'],
  };

  async detectProject(): Promise<boolean> {
    const codexDir = path.join(this.getHomeDir(), '.codex');
    return await FileSystem.exists(codexDir);
  }

  getCommandPath(): string {
    return path.join(this.getHomeDir(), '.codex', 'prompts');
  }

  getTargetFilename(name: string): string {
    return `clavix-${name}${this.fileExtension}`;
  }

  protected formatCommand(template: CommandTemplate): string {
    const frontmatter = `---\ndescription: ${template.description}\nargument-hint: [prompt]\n---\n\n`;
    const content = template.content.replace(/\{\{ARGS\}\}/g, '$ARGUMENTS');
    return frontmatter + content;
  }

  private getHomeDir(): string {
    return process.env.CLAVIX_HOME_OVERRIDE || os.homedir();
  }
}
