/**
 * Adapter Registry - Config-driven adapter definitions
 *
 * This registry loads configuration from integrations.json and transforms
 * it into AdapterConfig objects used by the adapter system.
 *
 * The integrations.json file is the single source of truth for all
 * adapter configurations. See CONTRIBUTING.md for modification guidelines.
 *
 * NOTE: AGENTS.md is a mandatory integration that is always enabled by default.
 * It provides universal agent guidance that all AI tools can read. The AGENTS.md
 * adapter is handled separately via AgentsMdGenerator and is automatically
 * included by ensureMandatoryIntegrations() in integration-selector.ts.
 *
 * @since v5.3.0
 * @updated v5.7.0 - Refactored to use integrations.json as source of truth
 */

import { createRequire } from 'module';
import {
  AdapterConfig,
  AdapterFeatures,
  CommandSeparator,
  DEFAULT_MD_FEATURES,
  DEFAULT_TOML_FEATURES,
} from '../types/adapter-config.js';

// Use createRequire for JSON imports in ESM
const require = createRequire(import.meta.url);
const integrations = require('../config/integrations.json');

/**
 * Integration configuration from JSON
 */
interface IntegrationConfig {
  name: string;
  displayName: string;
  directory: string;
  filenamePattern: string;
  extension: '.md' | '.toml';
  separator: ':' | '-';
  detection: string;
  specialAdapter?: 'toml' | 'doc-injection';
  rootDir?: string;
  global?: boolean;
  placeholder?: string;
}

/**
 * Transform JSON config to AdapterConfig
 */
function transformConfig(config: IntegrationConfig): AdapterConfig {
  const isToml = config.extension === '.toml';

  // Build features based on adapter type
  const features: AdapterFeatures = isToml
    ? { ...DEFAULT_TOML_FEATURES }
    : {
        ...DEFAULT_MD_FEATURES,
        commandSeparator: config.separator as CommandSeparator,
      };

  // Add placeholder support if specified
  if (config.placeholder) {
    features.argumentPlaceholder = config.placeholder;
  }

  // Special handling for Claude Code (subdirectories + frontmatter + doc injection)
  if (config.specialAdapter === 'doc-injection') {
    features.supportsSubdirectories = true;
    features.supportsFrontmatter = true;
    features.supportsDocInjection = true;
    features.commandSeparator = ':';
  }

  return {
    name: config.name,
    displayName: config.displayName,
    directory: config.directory,
    fileExtension: config.extension,
    filenamePattern: config.filenamePattern,
    features,
    detection: { type: 'directory', path: config.detection },
    specialAdapter: config.specialAdapter,
    rootDir: config.rootDir,
    global: config.global,
  };
}

/**
 * Registry of all adapter configurations
 *
 * Loaded from src/config/integrations.json and transformed into AdapterConfig objects.
 * The JSON file is the single source of truth for integration paths, patterns, and features.
 */
export const ADAPTER_CONFIGS: AdapterConfig[] = (
  integrations.integrations as IntegrationConfig[]
).map(transformConfig);

/**
 * Get adapter configuration by name
 */
export function getAdapterConfig(name: string): AdapterConfig | undefined {
  return ADAPTER_CONFIGS.find((config) => config.name === name);
}

/**
 * Get all adapter configurations
 */
export function getAllAdapterConfigs(): AdapterConfig[] {
  return [...ADAPTER_CONFIGS];
}

/**
 * Get adapters that require special handling
 */
export function getSpecialAdapters(): AdapterConfig[] {
  return ADAPTER_CONFIGS.filter((config) => config.specialAdapter !== undefined);
}

/**
 * Get simple adapters (can use UniversalAdapter)
 */
export function getSimpleAdapters(): AdapterConfig[] {
  return ADAPTER_CONFIGS.filter((config) => config.specialAdapter === undefined);
}
