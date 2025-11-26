/**
 * Clavix v4.8: Verification Hooks
 *
 * Detects and executes CLI hooks for automated verification of checklist items.
 * Supports npm, yarn, and pnpm package managers.
 */

import { spawn } from 'child_process';
import fs from 'fs-extra';
import * as path from 'path';
import { VerificationHook, HookResult, HookType, DetectedHooks } from '../types/verification.js';

/**
 * Default timeout for hooks (60 seconds)
 */
const DEFAULT_TIMEOUT = 60000;

/**
 * Built-in hook definitions
 */
const HOOK_DEFINITIONS: Record<
  HookType,
  {
    displayName: string;
    commands: string[];
    successPatterns: RegExp[];
    failurePatterns: RegExp[];
  }
> = {
  test: {
    displayName: 'Tests',
    commands: ['npm test', 'npm run test', 'yarn test', 'pnpm test'],
    successPatterns: [
      /(\d+)\s+(passing|passed)/i,
      /tests?\s+passed/i,
      /all\s+tests?\s+passed/i,
      /0\s+failed/i,
      /test\s+suites?:\s+\d+\s+passed/i,
    ],
    failurePatterns: [/(\d+)\s+failed/i, /test\s+failed/i, /FAIL/i, /error/i],
  },
  build: {
    displayName: 'Build',
    commands: ['npm run build', 'yarn build', 'pnpm build', 'tsc'],
    successPatterns: [/successfully/i, /done/i, /built/i, /compiled/i],
    failurePatterns: [/error/i, /failed/i, /TS\d{4}:/],
  },
  lint: {
    displayName: 'Lint',
    commands: ['npm run lint', 'yarn lint', 'pnpm lint', 'eslint .'],
    successPatterns: [/0\s+errors?/i, /no\s+errors?/i, /all\s+files?\s+pass/i],
    failurePatterns: [/(\d+)\s+errors?/i, /error/i],
  },
  typecheck: {
    displayName: 'Type Check',
    commands: ['tsc --noEmit', 'npm run typecheck', 'yarn typecheck'],
    successPatterns: [/^$/], // Empty output means success for tsc
    failurePatterns: [/error\s+TS\d{4}/i, /Type\s+error/i],
  },
  custom: {
    displayName: 'Custom',
    commands: [],
    successPatterns: [],
    failurePatterns: [],
  },
};

/**
 * Verification Hooks Manager
 */
export class VerificationHooks {
  private readonly cwd: string;
  private detectedHooks: DetectedHooks | null = null;

  constructor(cwd?: string) {
    this.cwd = cwd || process.cwd();
  }

  /**
   * Detect available hooks in the project
   */
  async detectHooks(): Promise<DetectedHooks> {
    if (this.detectedHooks) {
      return this.detectedHooks;
    }

    const packageJsonPath = path.join(this.cwd, 'package.json');
    const hasPackageJson = await fs.pathExists(packageJsonPath);
    const packageManager = await this.detectPackageManager();

    const hooks: VerificationHook[] = [];

    if (hasPackageJson) {
      try {
        const packageJson = await fs.readJson(packageJsonPath);
        const scripts = packageJson.scripts || {};

        // Check for test script
        if (scripts.test) {
          hooks.push(this.createHook('test', `${packageManager} test`, packageManager));
        }

        // Check for build script
        if (scripts.build) {
          hooks.push(this.createHook('build', `${packageManager} run build`, packageManager));
        }

        // Check for lint script
        if (scripts.lint) {
          hooks.push(this.createHook('lint', `${packageManager} run lint`, packageManager));
        }

        // Check for typecheck script
        if (scripts.typecheck || scripts['type-check']) {
          const cmd = scripts.typecheck ? 'typecheck' : 'type-check';
          hooks.push(this.createHook('typecheck', `${packageManager} run ${cmd}`, packageManager));
        } else {
          // Check for TypeScript
          const hasTsConfig = await fs.pathExists(path.join(this.cwd, 'tsconfig.json'));
          if (hasTsConfig) {
            hooks.push(this.createHook('typecheck', 'npx tsc --noEmit', packageManager));
          }
        }
      } catch {
        // Ignore errors reading package.json
      }
    }

    this.detectedHooks = {
      hooks,
      packageManager,
      hasPackageJson,
    };

    return this.detectedHooks;
  }

  /**
   * Detect package manager used in the project
   */
  private async detectPackageManager(): Promise<'npm' | 'yarn' | 'pnpm' | 'unknown'> {
    // Check for lock files
    if (await fs.pathExists(path.join(this.cwd, 'pnpm-lock.yaml'))) {
      return 'pnpm';
    }
    if (await fs.pathExists(path.join(this.cwd, 'yarn.lock'))) {
      return 'yarn';
    }
    if (await fs.pathExists(path.join(this.cwd, 'package-lock.json'))) {
      return 'npm';
    }

    return 'unknown';
  }

  /**
   * Create a hook definition
   */
  private createHook(type: HookType, command: string, _packageManager: string): VerificationHook {
    const def = HOOK_DEFINITIONS[type];
    return {
      name: type,
      displayName: def.displayName,
      command,
      successPattern: def.successPatterns[0],
      failurePattern: def.failurePatterns[0],
      timeout: DEFAULT_TIMEOUT,
    };
  }

  /**
   * Run a specific hook
   */
  async runHook(hook: VerificationHook): Promise<HookResult> {
    const startTime = Date.now();

    try {
      const { exitCode, output } = await this.executeCommand(hook.command, hook.timeout);
      const executionTimeMs = Date.now() - startTime;

      // Determine success based on exit code and patterns
      const success = this.determineSuccess(hook, exitCode, output);
      const confidence = this.determineConfidence(hook, exitCode, output, success);

      return {
        hook,
        success,
        exitCode,
        output,
        confidence,
        executionTimeMs,
      };
    } catch (error) {
      const executionTimeMs = Date.now() - startTime;
      return {
        hook,
        success: false,
        exitCode: -1,
        output: '',
        confidence: 'low',
        executionTimeMs,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Run all detected hooks
   */
  async runAllHooks(): Promise<HookResult[]> {
    const detected = await this.detectHooks();
    const results: HookResult[] = [];

    for (const hook of detected.hooks) {
      const result = await this.runHook(hook);
      results.push(result);
    }

    return results;
  }

  /**
   * Run a hook by type
   */
  async runHookByType(type: HookType): Promise<HookResult | null> {
    const detected = await this.detectHooks();
    const hook = detected.hooks.find((h) => h.name === type);

    if (!hook) {
      return null;
    }

    return this.runHook(hook);
  }

  /**
   * Execute a command and capture output
   */
  private executeCommand(
    command: string,
    timeout: number
  ): Promise<{ exitCode: number; output: string }> {
    return new Promise((resolve, reject) => {
      const [cmd, ...args] = command.split(' ');
      let output = '';

      const proc = spawn(cmd, args, {
        cwd: this.cwd,
        shell: true,
        env: { ...process.env, CI: 'true', FORCE_COLOR: '0' },
      });

      const timeoutId = setTimeout(() => {
        proc.kill('SIGTERM');
        reject(new Error(`Command timed out after ${timeout}ms`));
      }, timeout);

      proc.stdout?.on('data', (data) => {
        output += data.toString();
      });

      proc.stderr?.on('data', (data) => {
        output += data.toString();
      });

      proc.on('close', (code) => {
        clearTimeout(timeoutId);
        resolve({
          exitCode: code ?? 0,
          output: output.trim(),
        });
      });

      proc.on('error', (error) => {
        clearTimeout(timeoutId);
        reject(error);
      });
    });
  }

  /**
   * Determine if the hook succeeded
   */
  private determineSuccess(hook: VerificationHook, exitCode: number, output: string): boolean {
    // Exit code 0 is primary success indicator
    if (exitCode !== 0) {
      return false;
    }

    // Check for explicit failure patterns
    const def = HOOK_DEFINITIONS[hook.name];
    for (const pattern of def.failurePatterns) {
      if (pattern.test(output)) {
        // Check if it's a "0 errors" type match
        const match = output.match(pattern);
        if (match && match[1] === '0') {
          continue; // "0 errors" is success
        }
        return false;
      }
    }

    return true;
  }

  /**
   * Determine confidence level in the result
   */
  private determineConfidence(
    hook: VerificationHook,
    exitCode: number,
    output: string,
    success: boolean
  ): 'high' | 'medium' | 'low' {
    const def = HOOK_DEFINITIONS[hook.name];

    // Clear exit code with matching success patterns = high confidence
    if (exitCode === 0 && success) {
      for (const pattern of def.successPatterns) {
        if (pattern.test(output)) {
          return 'high';
        }
      }
      // Exit 0 but no explicit success pattern
      return 'medium';
    }

    // Clear failure indicators
    if (exitCode !== 0 || !success) {
      for (const pattern of def.failurePatterns) {
        if (pattern.test(output)) {
          return 'high';
        }
      }
      return 'medium';
    }

    return 'low';
  }

  /**
   * Get hook by type
   */
  async getHook(type: HookType): Promise<VerificationHook | null> {
    const detected = await this.detectHooks();
    return detected.hooks.find((h) => h.name === type) || null;
  }

  /**
   * Check if a hook type is available
   */
  async hasHook(type: HookType): Promise<boolean> {
    const detected = await this.detectHooks();
    return detected.hooks.some((h) => h.name === type);
  }

  /**
   * Get summary of available hooks
   */
  async getHookSummary(): Promise<{
    available: HookType[];
    unavailable: HookType[];
  }> {
    const detected = await this.detectHooks();
    const allTypes: HookType[] = ['test', 'build', 'lint', 'typecheck'];
    const available = detected.hooks.map((h) => h.name);
    const unavailable = allTypes.filter((t) => !available.includes(t));

    return { available, unavailable };
  }
}
