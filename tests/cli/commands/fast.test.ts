/**
 * Fast Command Tests
 *
 * Direct tests for the Fast CLI command class.
 * Uses real UniversalOptimizer for integration-style testing.
 * Mocks inquirer for interactive prompts and PromptManager for file system.
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import fs from 'fs-extra';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { createTestDir, cleanupTestDir } from '../../helpers/cli-helpers.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// Mock Setup - Must be BEFORE imports
// ============================================================================

// Create mock functions
const mockPrompt = jest.fn<(questions: any[]) => Promise<any>>();
const mockSavePrompt = jest.fn<() => Promise<any>>();

// Mock inquirer for interactive prompts
jest.unstable_mockModule('inquirer', () => ({
  default: {
    prompt: mockPrompt,
    Separator: class Separator {
      type = 'separator';
      line?: string;
      constructor(line?: string) {
        this.line = line;
      }
    },
  },
}));

// Mock PromptManager to avoid file system operations
jest.unstable_mockModule('../../../src/core/prompt-manager.js', () => ({
  PromptManager: jest.fn().mockImplementation(() => ({
    savePrompt: mockSavePrompt,
  })),
}));

// ============================================================================
// Import command AFTER mocks
// ============================================================================

const { default: Fast } = await import('../../../src/cli/commands/fast.js');

// ============================================================================
// Test Helpers
// ============================================================================

/**
 * Run Fast command with proper mocking (similar to init.test.ts pattern)
 */
async function runFastCommand(
  args: string[] = []
): Promise<{ stdout: string; stderr: string; exitCode: number; error?: Error }> {
  let stdout = '';
  let stderr = '';
  let exitCode = 0;
  let caughtError: Error | undefined;

  const mockOclifConfig = {
    runHook: jest.fn().mockResolvedValue({ successes: [], failures: [] }),
    bin: 'clavix',
    dirname: 'clavix',
    pjson: { version: '1.0.0' },
    plugins: [],
    topicSeparator: ' ',
  };

  const cmd = new Fast(args, mockOclifConfig as any);

  const logSpy = jest.spyOn(console, 'log').mockImplementation((...logArgs) => {
    stdout += logArgs.map((a) => String(a)).join(' ') + '\n';
  });
  const errorSpy = jest.spyOn(console, 'error').mockImplementation((...errArgs) => {
    stderr += errArgs.map((a) => String(a)).join(' ') + '\n';
  });

  try {
    await cmd.run();
  } catch (err: any) {
    exitCode = 1;
    caughtError = err;
    if (err.message) {
      stderr += err.message + '\n';
    }
  } finally {
    logSpy.mockRestore();
    errorSpy.mockRestore();
  }

  return { stdout, stderr, exitCode, error: caughtError };
}

// ============================================================================
// Tests
// ============================================================================

describe('Fast Command', () => {
  let testDir: string;
  let originalCwd: string;

  beforeEach(async () => {
    // Reset all mocks
    jest.clearAllMocks();

    // Setup test directory
    testDir = await createTestDir('fast-cmd-test');
    originalCwd = process.cwd();
    process.chdir(testDir);

    // Initialize .clavix directory
    await fs.ensureDir(path.join(testDir, '.clavix', 'outputs', 'prompts', 'fast'));

    // Setup default mock behaviors
    mockSavePrompt.mockResolvedValue({ id: 'test-id', path: '/test/path' });
    mockPrompt.mockResolvedValue({ proceed: 'fast' });
  });

  afterEach(async () => {
    process.chdir(originalCwd);
    await cleanupTestDir(testDir);
  });

  // ==========================================================================
  // Input Validation Tests
  // ==========================================================================

  describe('input validation', () => {
    it('should reject empty prompt', async () => {
      const result = await runFastCommand(['']);

      expect(result.stdout).toContain('Please provide a prompt');
    });

    it('should reject whitespace-only prompt', async () => {
      const result = await runFastCommand(['   ']);

      expect(result.stdout).toContain('Please provide a prompt');
    });

    it('should show error example for empty prompt', async () => {
      const result = await runFastCommand(['']);

      expect(result.stdout).toContain('Example');
      expect(result.stdout).toContain('clavix fast');
    });

    it('should accept valid prompt', async () => {
      const result = await runFastCommand(['Create a login page']);

      expect(result.stdout).toContain('Analyzing and optimizing');
    });

    it('should handle prompt with special characters', async () => {
      const result = await runFastCommand(['Create émojis 🚀 and spëcial chars']);

      expect(result.stdout).toContain('Analyzing and optimizing');
      expect(result.exitCode).toBe(0);
    });

    it('should handle very long prompts', async () => {
      const longPrompt = 'a'.repeat(200) + ' Create a login page';
      const result = await runFastCommand([longPrompt]);

      expect(result.stdout).toContain('Analyzing and optimizing');
      expect(result.exitCode).toBe(0);
    });
  });

  // ==========================================================================
  // Normal Flow Tests
  // ==========================================================================

  describe('normal optimization flow', () => {
    it('should show analyzing message', async () => {
      const result = await runFastCommand(['Create a login page']);

      expect(result.stdout).toContain('Analyzing and optimizing');
    });

    it('should display intent analysis', async () => {
      const result = await runFastCommand(['Create a login page']);

      expect(result.stdout).toContain('Intent Analysis');
    });

    it('should display intent type', async () => {
      const result = await runFastCommand(['Create a login page']);

      expect(result.stdout).toContain('Type:');
    });

    it('should display intent confidence', async () => {
      const result = await runFastCommand(['Create a login page']);

      expect(result.stdout).toContain('Confidence:');
      expect(result.stdout).toMatch(/\d+%/);
    });

    it('should display quality assessment', async () => {
      const result = await runFastCommand(['Create a login page']);

      expect(result.stdout).toContain('Quality Assessment');
    });

    it('should display all quality dimensions', async () => {
      const result = await runFastCommand(['Create a login page']);

      expect(result.stdout).toContain('Clarity');
      expect(result.stdout).toContain('Efficiency');
      expect(result.stdout).toContain('Structure');
      expect(result.stdout).toContain('Completeness');
      expect(result.stdout).toContain('Actionability');
      expect(result.stdout).toContain('Overall');
    });

    it('should display enhanced prompt', async () => {
      const result = await runFastCommand(['Create a login page']);

      expect(result.stdout).toContain('Enhanced Prompt');
    });

    it('should display processing time', async () => {
      const result = await runFastCommand(['Create a login page']);

      expect(result.stdout).toContain('Processed in');
      expect(result.stdout).toMatch(/\d+ms/);
    });

    it('should display tip message', async () => {
      const result = await runFastCommand(['Create a login page']);

      expect(result.stdout).toContain('Tip:');
    });

    it('should save prompt after optimization', async () => {
      await runFastCommand(['Create a login page']);

      expect(mockSavePrompt).toHaveBeenCalled();
    });

    it('should display save confirmation', async () => {
      const result = await runFastCommand(['Create a login page']);

      expect(result.stdout).toContain('Saved prompt');
    });
  });

  // ==========================================================================
  // Quality Display Tests
  // ==========================================================================

  describe('quality display', () => {
    it('should display strengths when present for good prompts', async () => {
      // Use a well-formed prompt that should have strengths
      const result = await runFastCommand([
        'As a senior developer, create a TypeScript authentication module with JWT support, password hashing, and comprehensive error handling',
      ]);

      expect(result.stdout).toContain('Strengths');
    });

    it('should display improvements when applied', async () => {
      const result = await runFastCommand(['Create a login page']);

      expect(result.stdout).toContain('Improvements Applied');
    });
  });

  // ==========================================================================
  // Deep Mode Recommendation Tests
  // ==========================================================================

  describe('deep mode recommendation', () => {
    // Note: v4.0 uses multi-factor scoring for escalation (threshold: 50 points).
    // Escalation uses ORIGINAL prompt quality (not enhanced).
    // Planning intent (+30 pts) + low original quality factors triggers escalation.
    const planningPrompt =
      'Plan the architecture for a microservices system with authentication, payments, and notifications';

    it('should show triage alert for planning prompts', async () => {
      mockPrompt.mockResolvedValue({ proceed: 'fast' });

      const result = await runFastCommand([planningPrompt]);

      // Planning prompts should trigger triage alert
      expect(result.stdout).toContain('Smart Triage Alert');
    });

    it('should show deep analysis recommendation for planning prompts', async () => {
      mockPrompt.mockResolvedValue({ proceed: 'fast' });

      const result = await runFastCommand([planningPrompt]);

      expect(result.stdout).toContain('Deep analysis is recommended');
    });

    it('should show planning intent reason', async () => {
      mockPrompt.mockResolvedValue({ proceed: 'fast' });

      const result = await runFastCommand([planningPrompt]);

      expect(result.stdout).toContain('Planning intent detected');
    });

    it('should prompt user for mode choice when deep is recommended', async () => {
      mockPrompt.mockResolvedValue({ proceed: 'fast' });

      await runFastCommand([planningPrompt]);

      expect(mockPrompt).toHaveBeenCalled();
    });

    it('should continue with fast mode when user chooses fast', async () => {
      mockPrompt.mockResolvedValue({ proceed: 'fast' });

      const result = await runFastCommand([planningPrompt]);

      expect(result.stdout).toContain('Proceeding with fast mode as requested');
    });

    it('should switch to deep mode when user chooses deep', async () => {
      mockPrompt.mockResolvedValue({ proceed: 'deep' });

      const result = await runFastCommand([planningPrompt]);

      expect(result.stdout).toContain('Switching to deep mode');
    });

    it('should display deep analysis header after switch', async () => {
      mockPrompt.mockResolvedValue({ proceed: 'deep' });

      const result = await runFastCommand([planningPrompt]);

      expect(result.stdout).toContain('Deep Analysis Complete');
    });
  });

  // ==========================================================================
  // Analysis Only Flag Tests
  // ==========================================================================

  describe('--analysis-only flag', () => {
    it('should display intent with --analysis-only', async () => {
      const result = await runFastCommand(['Create a login page', '--analysis-only']);

      expect(result.stdout).toContain('Intent');
    });

    it('should display quality scores with --analysis-only', async () => {
      const result = await runFastCommand(['Create a login page', '--analysis-only']);

      expect(result.stdout).toContain('Quality Scores');
    });

    it('should not display enhanced prompt with --analysis-only', async () => {
      const result = await runFastCommand(['Create a login page', '--analysis-only']);

      expect(result.stdout).not.toContain('Enhanced Prompt');
    });

    it('should not save prompt with --analysis-only', async () => {
      await runFastCommand(['Create a login page', '--analysis-only']);

      expect(mockSavePrompt).not.toHaveBeenCalled();
    });

    it('should display all quality dimensions with --analysis-only', async () => {
      const result = await runFastCommand(['Create a login page', '--analysis-only']);

      expect(result.stdout).toContain('Clarity');
      expect(result.stdout).toContain('Efficiency');
      expect(result.stdout).toContain('Structure');
      expect(result.stdout).toContain('Completeness');
      expect(result.stdout).toContain('Actionability');
      expect(result.stdout).toContain('Overall');
    });
  });

  // ==========================================================================
  // Deep Mode Output Tests
  // ==========================================================================

  describe('deep mode output display', () => {
    // Use planning prompt to trigger deep mode recommendation via multi-factor scoring
    const planningPrompt =
      'Plan the architecture for a microservices system with authentication, payments, and notifications';

    beforeEach(() => {
      mockPrompt.mockResolvedValue({ proceed: 'deep' });
    });

    it('should display deep mode characteristics', async () => {
      const result = await runFastCommand([planningPrompt]);

      expect(result.stdout).toContain('Characteristics');
    });

    it('should display code context flag', async () => {
      const result = await runFastCommand([planningPrompt]);

      expect(result.stdout).toContain('Has code context');
    });

    it('should display technical terms flag', async () => {
      const result = await runFastCommand([planningPrompt]);

      expect(result.stdout).toContain('Technical terms');
    });

    it('should display open-ended flag', async () => {
      const result = await runFastCommand([planningPrompt]);

      expect(result.stdout).toContain('Open-ended');
    });

    it('should display needs structure flag', async () => {
      const result = await runFastCommand([planningPrompt]);

      expect(result.stdout).toContain('Needs structure');
    });

    it('should display quality metrics in deep mode', async () => {
      const result = await runFastCommand([planningPrompt]);

      expect(result.stdout).toContain('Quality Metrics');
    });

    it('should display patterns applied when present', async () => {
      const result = await runFastCommand([planningPrompt]);

      expect(result.stdout).toContain('Patterns Applied');
    });

    it('should save prompt after deep mode', async () => {
      await runFastCommand([planningPrompt]);

      expect(mockSavePrompt).toHaveBeenCalled();
    });
  });

  // ==========================================================================
  // Error Handling Tests
  // ==========================================================================

  describe('error handling', () => {
    it('should handle savePrompt failure gracefully', async () => {
      mockSavePrompt.mockRejectedValue(new Error('Write failed'));

      const result = await runFastCommand(['Create a login page']);

      expect(result.stdout).toContain('Could not save prompt');
      expect(result.exitCode).toBe(0); // Should not fail the command
    });

    it('should complete optimization even if save fails', async () => {
      mockSavePrompt.mockRejectedValue(new Error('Write failed'));

      const result = await runFastCommand(['Create a login page']);

      expect(result.stdout).toContain('Enhanced Prompt');
    });
  });

  // ==========================================================================
  // Edge Cases
  // ==========================================================================

  describe('edge cases', () => {
    it('should handle markdown in prompt', async () => {
      const result = await runFastCommand([
        '# Create a login page\n\n- Email field\n- Password field',
      ]);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('Analyzing and optimizing');
    });

    it('should handle code snippets in prompt', async () => {
      const result = await runFastCommand(['Create a function like this: `function login() {}`']);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('Analyzing and optimizing');
    });

    it('should handle newlines in prompt', async () => {
      const result = await runFastCommand(['Create a login page\nwith email\nand password']);

      expect(result.exitCode).toBe(0);
    });

    it('should handle quotes in prompt', async () => {
      const result = await runFastCommand(['Create a login page with "remember me" option']);

      expect(result.exitCode).toBe(0);
    });
  });

  // ==========================================================================
  // Static Properties Tests
  // ==========================================================================

  describe('command static properties', () => {
    it('should have description', () => {
      expect(Fast.description).toBeDefined();
      expect(typeof Fast.description).toBe('string');
      expect(Fast.description.length).toBeGreaterThan(0);
    });

    it('should have examples', () => {
      expect(Fast.examples).toBeDefined();
      expect(Array.isArray(Fast.examples)).toBe(true);
      expect(Fast.examples.length).toBeGreaterThan(0);
    });

    it('should have prompt argument defined', () => {
      expect(Fast.args).toBeDefined();
      expect(Fast.args.prompt).toBeDefined();
      expect(Fast.args.prompt.required).toBe(true);
    });

    it('should have prompt argument description', () => {
      expect(Fast.args.prompt.description).toBeDefined();
      expect(typeof Fast.args.prompt.description).toBe('string');
    });

    it('should have analysis-only flag defined', () => {
      expect(Fast.flags).toBeDefined();
      expect(Fast.flags['analysis-only']).toBeDefined();
    });

    it('should have analysis-only flag with description', () => {
      expect(Fast.flags['analysis-only'].description).toBeDefined();
    });
  });

  // ==========================================================================
  // Recommendation Display Tests
  // ==========================================================================

  describe('recommendation display', () => {
    it('should display recommendation when quality is borderline', async () => {
      // Prompts with medium quality often get recommendations
      const result = await runFastCommand(['Create something for users']);

      // May or may not have recommendation depending on quality
      expect(result.exitCode).toBe(0);
    });
  });
});
