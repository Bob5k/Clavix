import { BaseAdapter } from './base-adapter';
import { FileSystem } from '../../utils/file-system';

/**
 * Cursor IDE adapter
 * Commands are stored in .cursor/commands/ (flat structure, no subdirectories)
 */
export class CursorAdapter extends BaseAdapter {
  readonly name = 'cursor';
  readonly displayName = 'Cursor';
  readonly directory = '.cursor/commands';
  readonly fileExtension = '.md';
  readonly features = {
    supportsSubdirectories: false,
    supportsFrontmatter: false,
  };

  /**
   * Detect if Cursor is available in the project
   */
  async detectProject(): Promise<boolean> {
    return await FileSystem.exists('.cursor');
  }

  /**
   * Get command path for Cursor
   */
  getCommandPath(): string {
    return this.directory;
  }

  getTargetFilename(name: string): string {
    return `clavix-${name}${this.fileExtension}`;
  }

  // Uses default formatCommand and generateCommands from BaseAdapter
}
