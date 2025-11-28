/**
 * Consistency test for integration configurations
 *
 * Verifies that adapter-registry.ts correctly loads and transforms
 * configurations from integrations.json (single source of truth).
 *
 * @since v5.7.0
 */

import { describe, it, expect } from '@jest/globals';
import { ADAPTER_CONFIGS, getAdapterConfig } from '../../src/core/adapter-registry.js';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const integrations = require('../../src/config/integrations.json');

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

describe('Integration Configuration Consistency', () => {
  it('should have matching number of integrations', () => {
    expect(ADAPTER_CONFIGS.length).toBe(integrations.integrations.length);
  });

  it('should have all integration names from JSON', () => {
    const jsonNames = integrations.integrations.map((c: IntegrationConfig) => c.name);
    const adapterNames = ADAPTER_CONFIGS.map((c) => c.name);

    expect(adapterNames.sort()).toEqual(jsonNames.sort());
  });

  describe.each(integrations.integrations as IntegrationConfig[])(
    '$name configuration',
    (config) => {
      it('should exist in adapter registry', () => {
        const adapter = getAdapterConfig(config.name);
        expect(adapter).toBeDefined();
      });

      it('should have matching directory', () => {
        const adapter = getAdapterConfig(config.name);
        expect(adapter?.directory).toBe(config.directory);
      });

      it('should have matching file extension', () => {
        const adapter = getAdapterConfig(config.name);
        expect(adapter?.fileExtension).toBe(config.extension);
      });

      it('should have matching filename pattern', () => {
        const adapter = getAdapterConfig(config.name);
        expect(adapter?.filenamePattern).toBe(config.filenamePattern);
      });

      it('should have matching display name', () => {
        const adapter = getAdapterConfig(config.name);
        expect(adapter?.displayName).toBe(config.displayName);
      });

      it('should have correct command separator', () => {
        const adapter = getAdapterConfig(config.name);
        expect(adapter?.features.commandSeparator).toBe(config.separator);
      });

      it('should have matching detection path', () => {
        const adapter = getAdapterConfig(config.name);
        expect(adapter?.detection.path).toBe(config.detection);
      });

      if (config.specialAdapter) {
        it('should have matching special adapter type', () => {
          const adapter = getAdapterConfig(config.name);
          expect(adapter?.specialAdapter).toBe(config.specialAdapter);
        });
      }

      if (config.global) {
        it('should have global flag set', () => {
          const adapter = getAdapterConfig(config.name);
          expect(adapter?.global).toBe(true);
        });
      }

      if (config.placeholder) {
        it('should have matching placeholder', () => {
          const adapter = getAdapterConfig(config.name);
          expect(adapter?.features.argumentPlaceholder).toBe(config.placeholder);
        });
      }
    }
  );

  describe('Special adapters', () => {
    it('should identify TOML adapters correctly', () => {
      const tomlAdapters = ADAPTER_CONFIGS.filter((c) => c.specialAdapter === 'toml');
      const tomlFromJson = integrations.integrations.filter(
        (c: IntegrationConfig) => c.specialAdapter === 'toml'
      );

      expect(tomlAdapters.length).toBe(tomlFromJson.length);
      for (const jsonConfig of tomlFromJson) {
        expect(tomlAdapters.find((a) => a.name === jsonConfig.name)).toBeDefined();
      }
    });

    it('should identify doc-injection adapters correctly', () => {
      const docInjectionAdapters = ADAPTER_CONFIGS.filter(
        (c) => c.specialAdapter === 'doc-injection'
      );
      const docInjectionFromJson = integrations.integrations.filter(
        (c: IntegrationConfig) => c.specialAdapter === 'doc-injection'
      );

      expect(docInjectionAdapters.length).toBe(docInjectionFromJson.length);
    });
  });

  describe('Global adapters', () => {
    it('should identify global adapters correctly', () => {
      const globalAdapters = ADAPTER_CONFIGS.filter((c) => c.global === true);
      const globalFromJson = integrations.integrations.filter(
        (c: IntegrationConfig) => c.global === true
      );

      expect(globalAdapters.length).toBe(globalFromJson.length);

      for (const jsonConfig of globalFromJson) {
        const adapter = globalAdapters.find((a) => a.name === jsonConfig.name);
        expect(adapter).toBeDefined();
        expect(adapter?.directory.startsWith('~/')).toBe(true);
      }
    });
  });

  describe('Placeholder support', () => {
    it('should have placeholders for adapters that need them', () => {
      const adaptersWithPlaceholders = integrations.integrations.filter(
        (c: IntegrationConfig) => c.placeholder
      );

      for (const jsonConfig of adaptersWithPlaceholders) {
        const adapter = getAdapterConfig(jsonConfig.name);
        expect(adapter?.features.argumentPlaceholder).toBe(jsonConfig.placeholder);
      }
    });

    it('TOML adapters should have {{args}} placeholder by default', () => {
      const tomlAdapters = ADAPTER_CONFIGS.filter((c) => c.specialAdapter === 'toml');

      for (const adapter of tomlAdapters) {
        expect(adapter.features.argumentPlaceholder).toBe('{{args}}');
      }
    });
  });
});
