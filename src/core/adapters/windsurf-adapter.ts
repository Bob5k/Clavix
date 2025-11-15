import { BaseAdapter } from './base-adapter';
import { FileSystem } from '../../utils/file-system';

/**
 * Windsurf adapter
 * Workflows stored in .windsurf/workflows/ (supports subdirectories)
 * Slash command format: /[name] (no .md extension)
 *
 * Features:
 * - Supports subdirectories for workflow organization
 * - 12,000 character limit per workflow file
 * - Auto-discovers from workspace, subdirectories, and parent dirs up to git root
 *
 * Reference: https://docs.windsurf.com/windsurf/cascade/workflows
 */
export class WindsurfAdapter extends BaseAdapter {
  readonly name = 'windsurf';
  readonly displayName = 'Windsurf';
  readonly directory = '.windsurf/workflows';
  readonly fileExtension = '.md';
  readonly features = {
    supportsSubdirectories: true,
    supportsFrontmatter: false,
  };

  /**
   * Detect if Windsurf is available in the project
   * Checks for .windsurf directory
   */
  async detectProject(): Promise<boolean> {
    return await FileSystem.exists('.windsurf');
  }

  /**
   * Get command path for Windsurf
   */
  getCommandPath(): string {
    return this.directory;
  }

  getTargetFilename(name: string): string {
    return `clavix-${name}${this.fileExtension}`;
  }

  // Uses default formatCommand and generateCommands from BaseAdapter
}
