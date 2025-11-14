/**
 * AgentManager tests
 */

import { AgentManager } from '../../src/core/agent-manager';
import { AgentAdapter, ValidationResult, CommandTemplate, ManagedBlock } from '../../src/types/agent';
import { IntegrationError } from '../../src/types/errors';

describe('AgentManager', () => {
  let manager: AgentManager;

  beforeEach(() => {
    manager = new AgentManager();
  });

  describe('constructor', () => {
    it('should register all built-in adapters', () => {
      const adapters = manager.getAdapters();

      expect(adapters.length).toBeGreaterThan(0);

      const adapterNames = adapters.map(a => a.name);
      expect(adapterNames).toContain('claude-code');
      expect(adapterNames).toContain('cursor');
      expect(adapterNames).toContain('droid');
      expect(adapterNames).toContain('opencode');
      expect(adapterNames).toContain('amp');
    });

    it('should have exactly 5 built-in adapters', () => {
      const adapters = manager.getAdapters();

      expect(adapters.length).toBe(5);
    });
  });

  describe('registerAdapter', () => {
    it('should register a new adapter', () => {
      const mockAdapter = createMockAdapter('test-adapter');

      manager.registerAdapter(mockAdapter);

      expect(manager.hasAgent('test-adapter')).toBe(true);
      expect(manager.getAdapter('test-adapter')).toBe(mockAdapter);
    });

    it('should allow registering multiple adapters', () => {
      const adapter1 = createMockAdapter('adapter-1');
      const adapter2 = createMockAdapter('adapter-2');

      manager.registerAdapter(adapter1);
      manager.registerAdapter(adapter2);

      expect(manager.hasAgent('adapter-1')).toBe(true);
      expect(manager.hasAgent('adapter-2')).toBe(true);
    });

    it('should override existing adapter with same name', () => {
      const adapter1 = createMockAdapter('test', 'Test 1');
      const adapter2 = createMockAdapter('test', 'Test 2');

      manager.registerAdapter(adapter1);
      manager.registerAdapter(adapter2);

      const retrieved = manager.getAdapter('test');
      expect(retrieved?.displayName).toBe('Test 2');
    });
  });

  describe('getAdapters', () => {
    it('should return all registered adapters', () => {
      const adapters = manager.getAdapters();

      expect(adapters).toBeInstanceOf(Array);
      expect(adapters.length).toBeGreaterThan(0);
    });

    it('should include custom adapters', () => {
      const customAdapter = createMockAdapter('custom');
      manager.registerAdapter(customAdapter);

      const adapters = manager.getAdapters();

      expect(adapters).toContain(customAdapter);
    });
  });

  describe('getAdapter', () => {
    it('should return adapter by name', () => {
      const adapter = manager.getAdapter('claude-code');

      expect(adapter).toBeDefined();
      expect(adapter?.name).toBe('claude-code');
    });

    it('should return undefined for non-existent adapter', () => {
      const adapter = manager.getAdapter('nonexistent-adapter');

      expect(adapter).toBeUndefined();
    });

    it('should be case-sensitive', () => {
      const adapter = manager.getAdapter('Claude-Code');

      expect(adapter).toBeUndefined();
    });
  });

  describe('detectAgents', () => {
    it('should detect available agents', async () => {
      // The actual adapters will return false in test environment
      // since they check for specific files/directories
      const detected = await manager.detectAgents();

      expect(detected).toBeInstanceOf(Array);
      // In test environment, likely no agents detected
      expect(detected.length).toBeGreaterThanOrEqual(0);
    });

    it('should only return adapters that detect successfully', async () => {
      const detectableAdapter = createMockAdapter('detectable');
      detectableAdapter.detectProject = jest.fn().mockResolvedValue(true);

      const nonDetectableAdapter = createMockAdapter('non-detectable');
      nonDetectableAdapter.detectProject = jest.fn().mockResolvedValue(false);

      manager.registerAdapter(detectableAdapter);
      manager.registerAdapter(nonDetectableAdapter);

      const detected = await manager.detectAgents();

      const detectedNames = detected.map(a => a.name);
      expect(detectedNames).toContain('detectable');
      expect(detectedNames).not.toContain('non-detectable');
    });

    it('should handle detection errors gracefully', async () => {
      const errorAdapter = createMockAdapter('error-adapter');
      errorAdapter.detectProject = jest.fn().mockRejectedValue(new Error('Detection failed'));

      manager.registerAdapter(errorAdapter);

      await expect(async () => {
        await manager.detectAgents();
      }).rejects.toThrow('Detection failed');
    });
  });

  describe('requireAdapter', () => {
    it('should return adapter when it exists', () => {
      const adapter = manager.requireAdapter('claude-code');

      expect(adapter).toBeDefined();
      expect(adapter.name).toBe('claude-code');
    });

    it('should throw IntegrationError when adapter does not exist', () => {
      expect(() => {
        manager.requireAdapter('nonexistent');
      }).toThrow(IntegrationError);
    });

    it('should include available agents in error message', () => {
      try {
        manager.requireAdapter('nonexistent');
        fail('Should have thrown error');
      } catch (error) {
        expect(error).toBeInstanceOf(IntegrationError);
        expect((error as IntegrationError).message).toContain('not registered');
        expect((error as IntegrationError).hint).toContain('Available agents');
      }
    });
  });

  describe('hasAgent', () => {
    it('should return true for registered adapters', () => {
      expect(manager.hasAgent('claude-code')).toBe(true);
      expect(manager.hasAgent('cursor')).toBe(true);
    });

    it('should return false for unregistered adapters', () => {
      expect(manager.hasAgent('nonexistent')).toBe(false);
    });

    it('should return true for custom registered adapters', () => {
      const customAdapter = createMockAdapter('custom');
      manager.registerAdapter(customAdapter);

      expect(manager.hasAgent('custom')).toBe(true);
    });
  });

  describe('getAvailableAgents', () => {
    it('should return list of all agent names', () => {
      const names = manager.getAvailableAgents();

      expect(names).toBeInstanceOf(Array);
      expect(names).toContain('claude-code');
      expect(names).toContain('cursor');
      expect(names).toContain('droid');
      expect(names).toContain('opencode');
      expect(names).toContain('amp');
    });

    it('should include custom adapters', () => {
      const customAdapter = createMockAdapter('custom');
      manager.registerAdapter(customAdapter);

      const names = manager.getAvailableAgents();

      expect(names).toContain('custom');
    });
  });

  describe('validateAdapters', () => {
    it('should validate all specified adapters', async () => {
      const validAdapter = createMockAdapter('valid-adapter');
      validAdapter.validate = jest.fn().mockResolvedValue({ valid: true });

      const invalidAdapter = createMockAdapter('invalid-adapter');
      invalidAdapter.validate = jest.fn().mockResolvedValue({
        valid: false,
        errors: ['Test error'],
      });

      manager.registerAdapter(validAdapter);
      manager.registerAdapter(invalidAdapter);

      const results = await manager.validateAdapters(['valid-adapter', 'invalid-adapter']);

      expect(results.size).toBe(2);
      expect(results.get('valid-adapter')).toEqual({ valid: true });
      expect(results.get('invalid-adapter')).toEqual({
        valid: false,
        errors: ['Test error'],
      });
    });

    it('should assume valid for adapters without validate method', async () => {
      const adapterWithoutValidate = createMockAdapter('no-validate');
      // Don't set validate method

      manager.registerAdapter(adapterWithoutValidate);

      const results = await manager.validateAdapters(['no-validate']);

      expect(results.get('no-validate')).toEqual({ valid: true });
    });

    it('should throw error for non-existent adapters', async () => {
      await expect(async () => {
        await manager.validateAdapters(['nonexistent']);
      }).rejects.toThrow(IntegrationError);
    });

    it('should handle empty adapter list', async () => {
      const results = await manager.validateAdapters([]);

      expect(results.size).toBe(0);
    });

    it('should call validate method on each adapter', async () => {
      const adapter1 = createMockAdapter('adapter-1');
      const validateMock1 = jest.fn().mockResolvedValue({ valid: true });
      adapter1.validate = validateMock1;

      const adapter2 = createMockAdapter('adapter-2');
      const validateMock2 = jest.fn().mockResolvedValue({ valid: true });
      adapter2.validate = validateMock2;

      manager.registerAdapter(adapter1);
      manager.registerAdapter(adapter2);

      await manager.validateAdapters(['adapter-1', 'adapter-2']);

      expect(validateMock1).toHaveBeenCalledTimes(1);
      expect(validateMock2).toHaveBeenCalledTimes(1);
    });

    it('should include validation warnings', async () => {
      const warnAdapter = createMockAdapter('warn-adapter');
      warnAdapter.validate = jest.fn().mockResolvedValue({
        valid: true,
        warnings: ['Warning message'],
      });

      manager.registerAdapter(warnAdapter);

      const results = await manager.validateAdapters(['warn-adapter']);

      expect(results.get('warn-adapter')).toEqual({
        valid: true,
        warnings: ['Warning message'],
      });
    });
  });

  describe('getAdapterChoices', () => {
    it('should return adapter choices for CLI prompts', () => {
      const choices = manager.getAdapterChoices();

      expect(choices).toBeInstanceOf(Array);
      expect(choices.length).toBeGreaterThan(0);

      // Check structure
      choices.forEach(choice => {
        expect(choice).toHaveProperty('name');
        expect(choice).toHaveProperty('value');
        expect(choice.name).toContain('(');
        expect(choice.name).toContain(')');
      });
    });

    it('should pre-select Claude Code by default', () => {
      const choices = manager.getAdapterChoices();

      const claudeCodeChoice = choices.find(c => c.value === 'claude-code');

      expect(claudeCodeChoice).toBeDefined();
      expect(claudeCodeChoice?.checked).toBe(true);
    });

    it('should not pre-select other adapters', () => {
      const choices = manager.getAdapterChoices();

      const otherChoices = choices.filter(c => c.value !== 'claude-code');

      otherChoices.forEach(choice => {
        expect(choice.checked).toBeFalsy();
      });
    });

    it('should include display name and directory in choice name', () => {
      const customAdapter = createMockAdapter('custom', 'Custom Agent', '.custom');
      manager.registerAdapter(customAdapter);

      const choices = manager.getAdapterChoices();
      const customChoice = choices.find(c => c.value === 'custom');

      expect(customChoice?.name).toContain('Custom Agent');
      expect(customChoice?.name).toContain('.custom');
    });
  });

  describe('integration tests', () => {
    it('should handle full adapter lifecycle', async () => {
      // Register
      const adapter = createMockAdapter('lifecycle-test');
      adapter.detectProject = jest.fn().mockResolvedValue(true);
      adapter.validate = jest.fn().mockResolvedValue({ valid: true });

      manager.registerAdapter(adapter);

      // Verify registration
      expect(manager.hasAgent('lifecycle-test')).toBe(true);

      // Detect
      const detected = await manager.detectAgents();
      expect(detected.map(a => a.name)).toContain('lifecycle-test');

      // Validate
      const results = await manager.validateAdapters(['lifecycle-test']);
      expect(results.get('lifecycle-test')?.valid).toBe(true);

      // Get for use
      const retrieved = manager.requireAdapter('lifecycle-test');
      expect(retrieved).toBe(adapter);
    });

    it('should work with multiple concurrent operations', async () => {
      const adapter1 = createMockAdapter('concurrent-1');
      adapter1.validate = jest.fn().mockResolvedValue({ valid: true });

      const adapter2 = createMockAdapter('concurrent-2');
      adapter2.validate = jest.fn().mockResolvedValue({ valid: true });

      manager.registerAdapter(adapter1);
      manager.registerAdapter(adapter2);

      // Run operations concurrently
      const [detected, validated, choices] = await Promise.all([
        manager.detectAgents(),
        manager.validateAdapters(['concurrent-1', 'concurrent-2']),
        Promise.resolve(manager.getAdapterChoices()),
      ]);

      expect(detected).toBeDefined();
      expect(validated.size).toBe(2);
      expect(choices.length).toBeGreaterThan(0);
    });
  });
});

/**
 * Helper function to create a mock adapter
 */
function createMockAdapter(
  name: string,
  displayName?: string,
  directory?: string
): AgentAdapter {
  return {
    name,
    displayName: displayName || `Mock ${name}`,
    directory: directory || `.${name}`,
    fileExtension: '.md',
    detectProject: jest.fn().mockResolvedValue(false),
    generateCommands: jest.fn().mockResolvedValue(undefined),
    injectDocumentation: jest.fn().mockResolvedValue(undefined),
    getCommandPath: jest.fn().mockReturnValue(`.${name}/commands`),
  };
}
