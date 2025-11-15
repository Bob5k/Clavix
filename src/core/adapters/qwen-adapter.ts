import * as os from 'os';
import * as path from 'path';
import { BaseAdapter } from './base-adapter';
import { CommandTemplate } from '../../types/agent';
import { FileSystem } from '../../utils/file-system';

/**
 * Qwen Code CLI adapter
 * Commands stored as TOML files under .qwen/commands/clavix by default
 */
export class QwenAdapter extends BaseAdapter {
  readonly name = 'qwen';
  readonly displayName = 'Qwen Code';
  readonly fileExtension = '.toml';
  readonly features = {
    supportsSubdirectories: true,
    supportsFrontmatter: false,
    argumentPlaceholder: '{{args}}',
  };

  constructor(private readonly options: { useNamespace?: boolean } = {}) {
    super();
  }

  get directory(): string {
    const useNamespace = this.options.useNamespace ?? true;
    return useNamespace ? path.join('.qwen', 'commands', 'clavix') : path.join('.qwen', 'commands');
  }

  async detectProject(): Promise<boolean> {
    if (await FileSystem.exists('.qwen')) {
      return true;
    }

    const homePath = path.join(this.getHomeDir(), '.qwen');
    return await FileSystem.exists(homePath);
  }

  getCommandPath(): string {
    return this.directory;
  }

  getTargetFilename(name: string): string {
    const commandPath = this.getCommandPath();
    const namespaced = commandPath.endsWith(path.join('commands', 'clavix'));
    const baseName = namespaced ? name : `clavix-${name}`;
    return `${baseName}${this.fileExtension}`;
  }

  protected formatCommand(template: CommandTemplate): string {
    const description = template.description.trim().length > 0
      ? `description = ${JSON.stringify(template.description)}\n\n`
      : '';

    const content = template.content.replace(/\{\{ARGS\}\}/g, '{{args}}');

    return `${description}prompt = """\n${content}\n"""\n`;
  }

  private getHomeDir(): string {
    return process.env.CLAVIX_HOME_OVERRIDE || os.homedir();
  }
}
