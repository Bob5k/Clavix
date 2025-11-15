import { BaseAdapter } from './base-adapter';
import { FileSystem } from '../../utils/file-system';

/**
 * Amp adapter
 * Commands stored in .agents/commands/ (simple markdown, no frontmatter)
 * Supports executable commands (experimental)
 */
export class AmpAdapter extends BaseAdapter {
  readonly name = 'amp';
  readonly displayName = 'Amp';
  readonly directory = '.agents/commands';
  readonly fileExtension = '.md';
  readonly features = {
    supportsSubdirectories: false,
    supportsFrontmatter: false,
    supportsExecutableCommands: true,
  };

  /**
   * Detect if Amp is available in the project
   */
  async detectProject(): Promise<boolean> {
    return await FileSystem.exists('.agents');
  }

  /**
   * Get command path for Amp
   */
  getCommandPath(): string {
    return this.directory;
  }

  getTargetFilename(name: string): string {
    return `clavix-${name}${this.fileExtension}`;
  }

  // Uses default formatCommand from BaseAdapter (no special formatting)
}
