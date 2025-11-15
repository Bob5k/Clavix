import { BaseAdapter } from './base-adapter';
import { FileSystem } from '../../utils/file-system';

/**
 * Kilocode adapter
 * Workflows stored in .kilocode/workflows/ (flat structure, no subdirectories)
 * Slash command format: /[name.md] (includes .md extension)
 *
 * Features:
 * - Simple markdown with step-by-step instructions
 * - Supports built-in tools and MCP integrations
 * - Project-specific workflows only
 *
 * Reference: https://kilocode.ai/docs/features/slash-commands/workflows
 */
export class KilocodeAdapter extends BaseAdapter {
  readonly name = 'kilocode';
  readonly displayName = 'Kilocode';
  readonly directory = '.kilocode/workflows';
  readonly fileExtension = '.md';
  readonly features = {
    supportsSubdirectories: false,
    supportsFrontmatter: false,
  };

  /**
   * Detect if Kilocode is available in the project
   * Checks for .kilocode directory
   */
  async detectProject(): Promise<boolean> {
    return await FileSystem.exists('.kilocode');
  }

  /**
   * Get command path for Kilocode
   */
  getCommandPath(): string {
    return this.directory;
  }

  getTargetFilename(name: string): string {
    return `clavix-${name}${this.fileExtension}`;
  }

  // Uses default formatCommand and generateCommands from BaseAdapter
}
