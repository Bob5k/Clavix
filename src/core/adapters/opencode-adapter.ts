import { BaseAdapter } from './base-adapter';
import { CommandTemplate } from '../../types/agent';
import { FileSystem } from '../../utils/file-system';

/**
 * OpenCode adapter
 * Commands stored in .opencode/command/ with frontmatter
 * Uses $ARGUMENTS, $1, $2 placeholders
 */
export class OpenCodeAdapter extends BaseAdapter {
  readonly name = 'opencode';
  readonly displayName = 'OpenCode';
  readonly directory = '.opencode/command';
  readonly fileExtension = '.md';
  readonly features = {
    supportsSubdirectories: false,
    supportsFrontmatter: true,
    frontmatterFields: ['description', 'agent', 'model'],
    argumentPlaceholder: '$ARGUMENTS',
  };

  /**
   * Detect if OpenCode is available in the project
   */
  async detectProject(): Promise<boolean> {
    return await FileSystem.exists('.opencode');
  }

  /**
   * Get command path for OpenCode
   */
  getCommandPath(): string {
    return this.directory;
  }

  getTargetFilename(name: string): string {
    return `clavix-${name}${this.fileExtension}`;
  }

  /**
   * Format command with frontmatter for OpenCode
   */
  protected formatCommand(template: CommandTemplate): string {
    // Add frontmatter
    const frontmatter = `---
description: ${template.description}
---

`;

    // Replace generic argument placeholder with $ARGUMENTS
    const content = template.content.replace(/\{\{ARGS\}\}/g, '$ARGUMENTS');

    return frontmatter + content;
  }
}
