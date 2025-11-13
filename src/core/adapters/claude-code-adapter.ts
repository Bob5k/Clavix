import * as path from 'path';
import { AgentAdapter, CommandTemplate, ManagedBlock } from '../../types/agent';
import { FileSystem } from '../../utils/file-system';
import { IntegrationError } from '../../types/errors';

/**
 * Claude Code agent adapter
 */
export class ClaudeCodeAdapter implements AgentAdapter {
  readonly name = 'claude-code';
  readonly displayName = 'Claude Code';

  /**
   * Detect if Claude Code is available in the project
   */
  async detectProject(): Promise<boolean> {
    // Check if .claude directory exists
    return await FileSystem.exists('.claude');
  }

  /**
   * Get command path for Claude Code
   */
  getCommandPath(): string {
    return '.claude/commands/clavix';
  }

  /**
   * Generate slash command files for Claude Code
   */
  async generateCommands(templates: CommandTemplate[]): Promise<void> {
    const commandPath = this.getCommandPath();

    try {
      // Ensure commands directory exists
      await FileSystem.ensureDir(commandPath);

      // Generate each command file
      for (const template of templates) {
        const filePath = path.join(commandPath, `${template.name}.md`);
        await FileSystem.writeFileAtomic(filePath, template.content);
      }
    } catch (error) {
      throw new IntegrationError(
        `Failed to generate Claude Code commands: ${error}`,
        'Ensure .claude/commands/ directory is writable'
      );
    }
  }

  /**
   * Inject documentation blocks into CLAUDE.md
   */
  async injectDocumentation(blocks: ManagedBlock[]): Promise<void> {
    try {
      for (const block of blocks) {
        await this.injectManagedBlock(
          block.targetFile,
          block.content,
          block.startMarker,
          block.endMarker
        );
      }
    } catch (error) {
      throw new IntegrationError(
        `Failed to inject documentation: ${error}`,
        'Ensure target files are writable'
      );
    }
  }

  /**
   * Inject or update a managed block in a file
   */
  private async injectManagedBlock(
    filePath: string,
    content: string,
    startMarker: string,
    endMarker: string
  ): Promise<void> {
    const fullPath = path.resolve(filePath);
    let fileContent = '';

    // Read existing file or create new
    if (await FileSystem.exists(fullPath)) {
      fileContent = await FileSystem.readFile(fullPath);
    } else {
      // Create parent directory if needed
      const dir = path.dirname(fullPath);
      await FileSystem.ensureDir(dir);
    }

    const blockRegex = new RegExp(
      `${this.escapeRegex(startMarker)}[\\s\\S]*?${this.escapeRegex(endMarker)}`,
      'g'
    );

    const wrappedContent = `${startMarker}\n${content}\n${endMarker}`;

    if (blockRegex.test(fileContent)) {
      // Replace existing block
      fileContent = fileContent.replace(blockRegex, wrappedContent);
    } else {
      // Append new block
      if (fileContent && !fileContent.endsWith('\n\n')) {
        fileContent += '\n\n';
      }
      fileContent += wrappedContent + '\n';
    }

    await FileSystem.writeFileAtomic(fullPath, fileContent);
  }

  /**
   * Escape special regex characters
   */
  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
