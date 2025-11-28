/**
 * Configuration schema for config-driven adapters
 * Enables creating adapters from configuration rather than individual classes
 */

/**
 * File extension types supported by adapters
 */
export type AdapterFileExtension = '.md' | '.toml';

/**
 * Command separator types
 */
export type CommandSeparator = ':' | '-';

/**
 * Filename pattern for generated command files
 * - '{name}' - Just the command name (e.g., 'improve.md')
 * - 'clavix-{name}' - Prefixed (e.g., 'clavix-improve.md')
 * - 'clavix/{name}' - In subdirectory (e.g., 'clavix/improve.md')
 *
 * The pattern should contain '{name}' which will be replaced with the command name.
 */
export type FilenamePattern = string;

/**
 * Detection method for project environment
 */
export interface DetectionConfig {
  type: 'directory' | 'file' | 'config';
  path: string;
}

/**
 * Feature flags for adapter capabilities
 */
export interface AdapterFeatures {
  /** Whether the adapter supports subdirectories in command path */
  supportsSubdirectories: boolean;
  /** Whether the adapter supports frontmatter in command files */
  supportsFrontmatter: boolean;
  /** Whether the adapter supports doc injection (CLAUDE.md, etc.) */
  supportsDocInjection: boolean;
  /** Command separator character */
  commandSeparator: CommandSeparator;
  /** Argument placeholder for TOML adapters */
  argumentPlaceholder?: string;
}

/**
 * Full adapter configuration
 */
export interface AdapterConfig {
  /** Internal adapter name (e.g., 'cursor') */
  name: string;
  /** Display name for UI (e.g., 'Cursor') */
  displayName: string;
  /** Command directory path (e.g., '.cursor/commands') */
  directory: string;
  /** File extension for command files */
  fileExtension: AdapterFileExtension;
  /** Pattern for generating filenames */
  filenamePattern: FilenamePattern;
  /** Feature flags */
  features: AdapterFeatures;
  /** Project detection configuration */
  detection: DetectionConfig;
  /** Whether this adapter requires special handling (TOML format, doc injection) */
  specialAdapter?: 'toml' | 'doc-injection';
  /** For TOML adapters: root directory (e.g., '.gemini') */
  rootDir?: string;
  /** Whether commands should be written to home directory (global installation) */
  global?: boolean;
}

/**
 * Default adapter features for markdown-based adapters
 */
export const DEFAULT_MD_FEATURES: AdapterFeatures = {
  supportsSubdirectories: false,
  supportsFrontmatter: false,
  supportsDocInjection: false,
  commandSeparator: '-',
};

/**
 * Default adapter features for TOML-based adapters
 */
export const DEFAULT_TOML_FEATURES: AdapterFeatures = {
  supportsSubdirectories: true,
  supportsFrontmatter: false,
  supportsDocInjection: false,
  commandSeparator: ':',
  argumentPlaceholder: '{{args}}',
};
