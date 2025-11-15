import * as os from 'os';
import * as path from 'path';
import { BaseAdapter } from './base-adapter';
import { CommandTemplate } from '../../types/agent';
import { FileSystem } from '../../utils/file-system';

/**
 * CodeBuddy CLI adapter
 * Commands stored in .codebuddy/commands with YAML frontmatter
 */
export class CodeBuddyAdapter extends BaseAdapter {
  readonly name = 'codebuddy';
  readonly displayName = 'CodeBuddy';
  readonly directory = '.codebuddy/commands';
  readonly fileExtension = '.md';
  readonly features = {
    supportsSubdirectories: false,
    supportsFrontmatter: true,
    argumentPlaceholder: '$1',
    frontmatterFields: ['description', 'argument-hint'],
  };

  async detectProject(): Promise<boolean> {
    if (await FileSystem.exists('.codebuddy')) {
      return true;
    }

    const homePath = path.join(this.getHomeDir(), '.codebuddy');
    return await FileSystem.exists(homePath);
  }

  getCommandPath(): string {
    return this.directory;
  }

  getTargetFilename(name: string): string {
    return `clavix-${name}${this.fileExtension}`;
  }

  protected formatCommand(template: CommandTemplate): string {
    const frontmatter = `---\ndescription: ${template.description}\nargument-hint: [prompt]\n---\n\n`;
    const content = template.content.replace(/\{\{ARGS\}\}/g, '$1');
    return frontmatter + content;
  }

  private getHomeDir(): string {
    return process.env.CLAVIX_HOME_OVERRIDE || os.homedir();
  }
}
