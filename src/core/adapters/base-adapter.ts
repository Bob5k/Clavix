import * as path from 'path';
import {
  AgentAdapter,
  CommandTemplate,
  ManagedBlock,
  ProviderFeatures,
  ValidationResult,
} from '../../types/agent';
import { FileSystem } from '../../utils/file-system';
import { IntegrationError } from '../../types/errors';

/**
 * Base adapter class with shared logic for all providers
 * Ensures consistency and reduces code duplication
 */
export abstract class BaseAdapter implements AgentAdapter {
  abstract readonly name: string;
  abstract readonly displayName: string;
  abstract readonly directory: string;
  abstract readonly fileExtension: string;
  readonly features?: ProviderFeatures;

  abstract detectProject(): Promise<boolean>;
  abstract getCommandPath(): string;

  /**
   * Determine the target filename for a generated command
   * Providers can override to customize filename conventions
   */
  getTargetFilename(name: string): string {
    return `${name}${this.fileExtension}`;
  }

  /**
   * Default validation logic - can be overridden
   * Checks if directory can be created and is writable
   */
  async validate(): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    const commandPath = this.getCommandPath();

    // Check if parent directory exists
    const parentDir = path.dirname(commandPath);
    if (!(await FileSystem.exists(parentDir))) {
      // Check if we can create parent by finding first existing ancestor
      let ancestorDir = parentDir;
      let canCreate = false;

      // Walk up the directory tree until we find an existing directory
      while (ancestorDir !== '.' && ancestorDir !== '/' && ancestorDir.length > 0) {
        ancestorDir = path.dirname(ancestorDir);
        if (await FileSystem.exists(ancestorDir)) {
          canCreate = true;
          break;
        }
      }

      // If we reached '.' or '/', it means we can create the directory
      if (ancestorDir === '.' || ancestorDir === '/' || canCreate) {
        warnings.push(
          `Parent directory ${parentDir} will be created`
        );
      } else {
        errors.push(
          `Parent directory ${parentDir} does not exist and cannot be created`
        );
      }
    }

    // Try to ensure directory exists
    if (errors.length === 0) {
      try {
        await FileSystem.ensureDir(commandPath);
      } catch (error) {
        errors.push(`Cannot create command directory: ${error}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }

  /**
   * Generate commands - default implementation
   * Creates command files in the provider's directory
   */
  async generateCommands(templates: CommandTemplate[]): Promise<void> {
    const commandPath = this.getCommandPath();

    try {
      // Ensure directory exists
      await FileSystem.ensureDir(commandPath);

      // Generate each command file
      for (const template of templates) {
        const content = this.formatCommand(template);
        const filename = this.getTargetFilename(template.name);
        const filePath = path.join(commandPath, filename);
        await FileSystem.writeFileAtomic(filePath, content);
      }
    } catch (error) {
      throw new IntegrationError(
        `Failed to generate ${this.displayName} commands: ${error}`,
        `Ensure ${commandPath} is writable`
      );
    }
  }

  /**
   * Format command content for this provider
   * Default: return content as-is
   * Override for provider-specific formatting (frontmatter, placeholders, etc.)
   */
  protected formatCommand(template: CommandTemplate): string {
    return template.content;
  }

  /**
   * Default documentation injection - no-op
   * Override if provider needs doc injection (like Claude Code)
   */
  async injectDocumentation(_blocks: ManagedBlock[]): Promise<void> {
    // Default: no documentation injection
    // Override in subclasses if needed
  }

  /**
   * Escape special regex characters
   */
  protected escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
