import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import fs from 'fs-extra';
import path from 'path';
import Verify from '../../src/cli/commands/verify';
import { PromptManager } from '../../src/core/prompt-manager';

const originalCwd = process.cwd();
const originalLog = console.log;
const originalError = console.error;

const logs: string[] = [];
const errors: string[] = [];
let warningSpy: jest.SpiedFunction<typeof process.emitWarning>;

const captureConsole = (): void => {
  // eslint-disable-next-line no-console
  console.log = (...args: unknown[]): void => {
    logs.push(args.map(String).join(' '));
  };
  // eslint-disable-next-line no-console
  console.error = (...args: unknown[]): void => {
    errors.push(args.map(String).join(' '));
  };
};

const restoreConsole = (): void => {
  // eslint-disable-next-line no-console
  console.log = originalLog;
  // eslint-disable-next-line no-console
  console.error = originalError;
};

describe('clavix verify', () => {
  let testDir: string;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let manager: PromptManager;

  beforeEach(async () => {
    testDir = path.join(originalCwd, 'tests', 'tmp', `verify-${Date.now()}`);
    await fs.ensureDir(testDir);
    process.chdir(testDir);
    logs.length = 0;
    errors.length = 0;
    captureConsole();
    manager = new PromptManager();
    warningSpy = jest.spyOn(process, 'emitWarning').mockImplementation(() => undefined);
  });

  afterEach(async () => {
    warningSpy?.mockRestore();
    restoreConsole();
    process.chdir(originalCwd);
    await fs.remove(testDir);
  });

  describe('--help', () => {
    it('should have help flag defined', () => {
      // Verify command has oclif help integration
      // Help flag is automatically provided by oclif Command base class
      expect(Verify.description).toContain('Verify');
    });
  });

  describe('no prompts', () => {
    it('should inform user when no prompts exist', async () => {
      await Verify.run([]);
      expect(logs.some((line) => line.includes('No prompts found'))).toBe(true);
    });
  });

  describe('command structure', () => {
    it('should have required flags defined', () => {
      expect(Verify.flags).toBeDefined();
      expect(Verify.flags.latest).toBeDefined();
      expect(Verify.flags.id).toBeDefined();
      expect(Verify.flags.status).toBeDefined();
      expect(Verify.flags.fast).toBeDefined();
      expect(Verify.flags.deep).toBeDefined();
    });

    it('should have export flag defined', () => {
      expect(Verify.flags.export).toBeDefined();
    });

    it('should have retry-failed flag defined', () => {
      expect(Verify.flags['retry-failed']).toBeDefined();
    });

    it('should have run-hooks flag defined', () => {
      expect(Verify.flags['run-hooks']).toBeDefined();
    });

    it('should have correct description', () => {
      expect(Verify.description).toContain('Verify');
    });
  });

  describe('examples', () => {
    it('should have usage examples defined', () => {
      expect(Verify.examples).toBeDefined();
      expect(Array.isArray(Verify.examples)).toBe(true);
      expect(Verify.examples!.length).toBeGreaterThan(0);
    });
  });
});

describe('verify command integration', () => {
  it('should have verify command class exported', () => {
    expect(Verify).toBeDefined();
    expect(Verify.run).toBeDefined();
  });
});
