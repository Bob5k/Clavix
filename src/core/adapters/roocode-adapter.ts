import { BaseAdapter } from './base-adapter';
import { CommandTemplate } from '../../types/agent';
import { FileSystem } from '../../utils/file-system';

/**
 * Roocode adapter
 * Commands stored in .roo/commands/ (flat structure, no subdirectories)
 * Slash command format: /[name] (no .md extension, auto-converts to lowercase/dashes)
 *
 * Features:
 * - Supports optional frontmatter (description, argument-hint)
 * - Command names automatically processed: lowercase, spaces→dashes, special chars removed
 * - Project commands override global commands
 *
 * Reference: https://docs.roocode.com/features/slash-commands
 */
export class RoocodeAdapter extends BaseAdapter {
  readonly name = 'roocode';
  readonly displayName = 'Roocode';
  readonly directory = '.roo/commands';
  readonly fileExtension = '.md';
  readonly features = {
    supportsSubdirectories: false,
    supportsFrontmatter: true,
  };

  /**
   * Detect if Roocode is available in the project
   * Checks for .roo directory
   */
  async detectProject(): Promise<boolean> {
    return await FileSystem.exists('.roo');
  }

  /**
   * Get command path for Roocode
   */
  getCommandPath(): string {
    return this.directory;
  }

  getTargetFilename(name: string): string {
    return `clavix-${name}${this.fileExtension}`;
  }

  /**
   * Format command content for Roocode
   * Adds frontmatter with description and argument-hint if not already present
   */
  protected formatCommand(template: CommandTemplate): string {
    const content = template.content;

    // Check if frontmatter already exists
    if (content.trim().startsWith('---')) {
      // Frontmatter already exists, use as-is
      return content;
    }

    // Add Roocode-specific frontmatter
    const frontmatter = `---
description: ${template.description || `Clavix ${template.name} command`}
argument-hint: <prompt>
---

`;

    return frontmatter + content;
  }
}
