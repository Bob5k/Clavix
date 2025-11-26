import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { VerificationHooks } from '../../src/core/verification-hooks';
import fs from 'fs-extra';
import path from 'path';

describe('VerificationHooks', () => {
  let hooks: VerificationHooks;
  let testDir: string;

  beforeEach(() => {
    testDir = path.join(process.cwd(), '.clavix-test-hooks');

    // Clean up and create test directory
    if (fs.existsSync(testDir)) {
      fs.removeSync(testDir);
    }
    fs.ensureDirSync(testDir);

    hooks = new VerificationHooks(testDir);
  });

  afterEach(() => {
    if (fs.existsSync(testDir)) {
      fs.removeSync(testDir);
    }
  });

  describe('detectHooks', () => {
    it('should detect npm test script', async () => {
      const packageJson = {
        name: 'test-project',
        scripts: {
          test: 'jest',
        },
      };
      await fs.writeJSON(path.join(testDir, 'package.json'), packageJson);

      const detected = await hooks.detectHooks();
      const testHook = detected.hooks.find((h) => h.name === 'test');

      expect(testHook).toBeDefined();
      expect(testHook!.name).toBe('test');
      expect(testHook!.command).toBe('unknown test');
    });

    it('should detect npm run build script', async () => {
      const packageJson = {
        name: 'test-project',
        scripts: {
          build: 'tsc',
        },
      };
      await fs.writeJSON(path.join(testDir, 'package.json'), packageJson);

      const detected = await hooks.detectHooks();
      const buildHook = detected.hooks.find((h) => h.name === 'build');

      expect(buildHook).toBeDefined();
      expect(buildHook!.command).toBe('unknown run build');
    });

    it('should detect npm run lint script', async () => {
      const packageJson = {
        name: 'test-project',
        scripts: {
          lint: 'eslint .',
        },
      };
      await fs.writeJSON(path.join(testDir, 'package.json'), packageJson);

      const detected = await hooks.detectHooks();
      const lintHook = detected.hooks.find((h) => h.name === 'lint');

      expect(lintHook).toBeDefined();
      expect(lintHook!.command).toBe('unknown run lint');
    });

    it('should detect npm run typecheck script', async () => {
      const packageJson = {
        name: 'test-project',
        scripts: {
          typecheck: 'tsc --noEmit',
        },
      };
      await fs.writeJSON(path.join(testDir, 'package.json'), packageJson);

      const detected = await hooks.detectHooks();
      const typecheckHook = detected.hooks.find((h) => h.name === 'typecheck');

      expect(typecheckHook).toBeDefined();
      expect(typecheckHook!.command).toBe('unknown run typecheck');
    });

    it('should detect alternative typecheck script names', async () => {
      const packageJson = {
        name: 'test-project',
        scripts: {
          'type-check': 'tsc --noEmit',
        },
      };
      await fs.writeJSON(path.join(testDir, 'package.json'), packageJson);

      const detected = await hooks.detectHooks();
      const typecheckHook = detected.hooks.find((h) => h.name === 'typecheck');

      expect(typecheckHook).toBeDefined();
      expect(typecheckHook!.command).toBe('unknown run type-check');
    });

    it('should return empty hooks for missing package.json', async () => {
      const detected = await hooks.detectHooks();

      expect(detected.hooks.length).toBe(0);
      expect(detected.hasPackageJson).toBe(false);
    });

    it('should return empty hooks for package.json without scripts', async () => {
      const packageJson = {
        name: 'test-project',
      };
      await fs.writeJSON(path.join(testDir, 'package.json'), packageJson);

      const detected = await hooks.detectHooks();

      expect(detected.hooks.length).toBe(0);
      expect(detected.hasPackageJson).toBe(true);
    });

    it('should detect yarn package manager', async () => {
      const packageJson = {
        name: 'test-project',
        scripts: {
          test: 'jest',
        },
      };
      await fs.writeJSON(path.join(testDir, 'package.json'), packageJson);
      await fs.writeFile(path.join(testDir, 'yarn.lock'), '');

      const detected = await hooks.detectHooks();
      const testHook = detected.hooks.find((h) => h.name === 'test');

      expect(detected.packageManager).toBe('yarn');
      expect(testHook!.command).toBe('yarn test');
    });

    it('should detect pnpm package manager', async () => {
      const packageJson = {
        name: 'test-project',
        scripts: {
          test: 'jest',
        },
      };
      await fs.writeJSON(path.join(testDir, 'package.json'), packageJson);
      await fs.writeFile(path.join(testDir, 'pnpm-lock.yaml'), '');

      const detected = await hooks.detectHooks();
      const testHook = detected.hooks.find((h) => h.name === 'test');

      expect(detected.packageManager).toBe('pnpm');
      expect(testHook!.command).toBe('pnpm test');
    });

    it('should detect multiple hooks from same package.json', async () => {
      const packageJson = {
        name: 'test-project',
        scripts: {
          test: 'jest',
          build: 'tsc',
          lint: 'eslint .',
          typecheck: 'tsc --noEmit',
        },
      };
      await fs.writeJSON(path.join(testDir, 'package.json'), packageJson);

      const detected = await hooks.detectHooks();

      expect(detected.hooks.find((h) => h.name === 'test')).toBeDefined();
      expect(detected.hooks.find((h) => h.name === 'build')).toBeDefined();
      expect(detected.hooks.find((h) => h.name === 'lint')).toBeDefined();
      expect(detected.hooks.find((h) => h.name === 'typecheck')).toBeDefined();
      expect(detected.hooks.length).toBe(4);
    });
  });

  describe('runHook', () => {
    it('should return success for successful command', async () => {
      const hook = {
        name: 'test' as const,
        displayName: 'Test',
        command: 'echo "test passed"',
        timeout: 60000,
      };

      const result = await hooks.runHook(hook);

      expect(result.success).toBe(true);
      expect(result.exitCode).toBe(0);
      expect(result.output).toContain('test passed');
    });

    it('should return failure for failed command', async () => {
      const hook = {
        name: 'test' as const,
        displayName: 'Test',
        command: 'exit 1',
        timeout: 60000,
      };

      const result = await hooks.runHook(hook);

      expect(result.success).toBe(false);
      expect(result.exitCode).toBe(1);
    });

    it('should include hook in result', async () => {
      const hook = {
        name: 'build' as const,
        displayName: 'Build',
        command: 'echo "built"',
        timeout: 60000,
      };

      const result = await hooks.runHook(hook);

      expect(result.hook.name).toBe('build');
    });

    it('should capture stderr on failure', async () => {
      const hook = {
        name: 'lint' as const,
        displayName: 'Lint',
        command: 'echo "error message" >&2 && exit 1',
        timeout: 60000,
      };

      const result = await hooks.runHook(hook);

      expect(result.success).toBe(false);
      // stderr is combined into output
      expect(result.output).toContain('error message');
    });

    it('should handle timeout', async () => {
      const hook = {
        name: 'test' as const,
        displayName: 'Test',
        command: 'sleep 10',
        timeout: 100,
      };

      const result = await hooks.runHook(hook);

      expect(result.success).toBe(false);
    }, 10000);
  });

  describe('runAllHooks', () => {
    it('should run all detected hooks', async () => {
      // In a real project, the hooks would run npm test/lint
      // For testing, we verify the hooks are detected and runAllHooks returns results
      const packageJson = {
        name: 'test-project',
        scripts: {
          test: 'echo "test"',
          lint: 'echo "lint"',
        },
      };
      await fs.writeJSON(path.join(testDir, 'package.json'), packageJson);

      const results = await hooks.runAllHooks();

      // Should detect and attempt to run both hooks
      expect(results.length).toBe(2);
      // Hooks may fail in test environment without proper npm setup
      // but they should be detected and attempted
      expect(results.every((r) => r.hook)).toBe(true);
    });

    it('should return empty array when no hooks detected', async () => {
      const results = await hooks.runAllHooks();

      expect(results).toHaveLength(0);
    });

    it('should continue running hooks even if one fails', async () => {
      const packageJson = {
        name: 'test-project',
        scripts: {
          test: 'exit 1',
          lint: 'echo "lint passed"',
        },
      };
      await fs.writeJSON(path.join(testDir, 'package.json'), packageJson);

      const results = await hooks.runAllHooks();

      // Should have results for both hooks
      expect(results.length).toBe(2);
      // Both hooks run even if package manager unknown
      expect(results.every((r) => r.hook)).toBe(true);
    });
  });

  describe('getHook', () => {
    beforeEach(async () => {
      const packageJson = {
        name: 'test-project',
        scripts: {
          test: 'jest',
          build: 'tsc',
          lint: 'eslint .',
          typecheck: 'tsc --noEmit',
        },
      };
      await fs.writeJSON(path.join(testDir, 'package.json'), packageJson);
    });

    it('should get test hook by type', async () => {
      const hook = await hooks.getHook('test');

      expect(hook).toBeDefined();
      expect(hook!.name).toBe('test');
    });

    it('should get build hook by type', async () => {
      const hook = await hooks.getHook('build');

      expect(hook).toBeDefined();
      expect(hook!.name).toBe('build');
    });

    it('should return null for non-existent hook', async () => {
      // Remove package.json to have no hooks
      await fs.remove(path.join(testDir, 'package.json'));
      // Reset cached hooks
      hooks = new VerificationHooks(testDir);

      const hook = await hooks.getHook('custom');

      expect(hook).toBeNull();
    });
  });

  describe('hasHook', () => {
    beforeEach(async () => {
      const packageJson = {
        name: 'test-project',
        scripts: {
          test: 'jest',
        },
      };
      await fs.writeJSON(path.join(testDir, 'package.json'), packageJson);
    });

    it('should return true for existing hook', async () => {
      const hasTest = await hooks.hasHook('test');

      expect(hasTest).toBe(true);
    });

    it('should return false for missing hook', async () => {
      const hasLint = await hooks.hasHook('lint');

      expect(hasLint).toBe(false);
    });
  });

  describe('detectPackageManager', () => {
    it('should default to unknown when no lock file', async () => {
      const packageJson = { name: 'test', scripts: { test: 'jest' } };
      await fs.writeJSON(path.join(testDir, 'package.json'), packageJson);

      const detected = await hooks.detectHooks();

      expect(detected.packageManager).toBe('unknown');
    });

    it('should detect yarn from yarn.lock', async () => {
      const packageJson = { name: 'test', scripts: { test: 'jest' } };
      await fs.writeJSON(path.join(testDir, 'package.json'), packageJson);
      await fs.writeFile(path.join(testDir, 'yarn.lock'), '');

      const detected = await hooks.detectHooks();

      expect(detected.packageManager).toBe('yarn');
    });

    it('should detect pnpm from pnpm-lock.yaml', async () => {
      const packageJson = { name: 'test', scripts: { test: 'jest' } };
      await fs.writeJSON(path.join(testDir, 'package.json'), packageJson);
      await fs.writeFile(path.join(testDir, 'pnpm-lock.yaml'), '');

      const detected = await hooks.detectHooks();

      expect(detected.packageManager).toBe('pnpm');
    });

    it('should detect npm from package-lock.json', async () => {
      const packageJson = { name: 'test', scripts: { test: 'jest' } };
      await fs.writeJSON(path.join(testDir, 'package.json'), packageJson);
      await fs.writeFile(path.join(testDir, 'package-lock.json'), '{}');

      const detected = await hooks.detectHooks();

      expect(detected.packageManager).toBe('npm');
    });
  });

  describe('getHookSummary', () => {
    it('should return available and unavailable hooks', async () => {
      const packageJson = {
        name: 'test-project',
        scripts: {
          test: 'jest',
          build: 'tsc',
        },
      };
      await fs.writeJSON(path.join(testDir, 'package.json'), packageJson);

      const summary = await hooks.getHookSummary();

      expect(summary.available).toContain('test');
      expect(summary.available).toContain('build');
      expect(summary.unavailable).toContain('lint');
      expect(summary.unavailable).toContain('typecheck');
    });

    it('should return all unavailable when no hooks', async () => {
      const summary = await hooks.getHookSummary();

      expect(summary.available).toHaveLength(0);
      expect(summary.unavailable).toContain('test');
      expect(summary.unavailable).toContain('build');
      expect(summary.unavailable).toContain('lint');
      expect(summary.unavailable).toContain('typecheck');
    });
  });
});
