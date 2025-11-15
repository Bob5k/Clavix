import { BaseAdapter } from './base-adapter';
import { CommandTemplate } from '../../types/agent';
import { FileSystem } from '../../utils/file-system';

/**
 * Droid CLI adapter (Factory.ai)
 * Commands stored in .factory/commands/ with YAML frontmatter
 * Uses $ARGUMENTS placeholder for command arguments
 */
export class DroidAdapter extends BaseAdapter {
  readonly name = 'droid';
  readonly displayName = 'Droid CLI';
  readonly directory = '.factory/commands';
  readonly fileExtension = '.md';
  readonly features = {
    supportsSubdirectories: false,
    supportsFrontmatter: true,
    frontmatterFields: ['description', 'argument-hint'],
    argumentPlaceholder: '$ARGUMENTS',
  };

  /**
   * Detect if Droid CLI is available in the project
   */
  async detectProject(): Promise<boolean> {
    return await FileSystem.exists('.factory');
  }

  /**
   * Get command path for Droid CLI
   */
  getCommandPath(): string {
    return this.directory;
  }

  getTargetFilename(name: string): string {
    return `clavix-${name}${this.fileExtension}`;
  }

  /**
   * Format command with YAML frontmatter for Droid CLI
   */
  protected formatCommand(template: CommandTemplate): string {
    // Add YAML frontmatter
    const frontmatter = `---
description: ${template.description}
argument-hint: [prompt]
---

`;

    // Replace generic argument placeholder with $ARGUMENTS
    const content = template.content.replace(/\{\{ARGS\}\}/g, '$ARGUMENTS');

    return frontmatter + content;
  }
}
