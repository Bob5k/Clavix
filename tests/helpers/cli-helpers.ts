/**
 * CLI Test Helpers
 *
 * Shared utilities for testing CLI commands
 */

import * as fs from 'fs-extra';
import * as path from 'path';

/**
 * Mock inquirer responses for testing interactive prompts
 */
export interface MockInquirerResponses {
  [key: string]: any;
}

/**
 * Setup inquirer mock with predefined responses
 * Usage:
 *   jest.mock('inquirer', () => setupInquirerMock({
 *     provider: 'claude-code',
 *     confirm: true
 *   }));
 */
export function setupInquirerMock(responses: MockInquirerResponses = {}) {
  return {
    __esModule: true,
    default: {
      prompt: jest.fn().mockImplementation(async (questions: any[]) => {
        const answers: any = {};

        for (const q of questions) {
          const questionName = q.name;

          // Use provided response or default based on question type
          if (responses[questionName] !== undefined) {
            answers[questionName] = responses[questionName];
          } else {
            // Default responses based on question type
            switch (q.type) {
              case 'confirm':
                answers[questionName] = true;
                break;
              case 'checkbox':
                answers[questionName] = q.choices ? [q.choices[0]] : [];
                break;
              case 'list':
                answers[questionName] = q.choices ? q.choices[0].value || q.choices[0] : '';
                break;
              default:
                answers[questionName] = 'test-response';
            }
          }
        }

        return answers;
      }),
    },
  };
}

/**
 * Create a temporary test directory
 */
export async function createTestDir(name: string): Promise<string> {
  const testDir = path.join(__dirname, '../fixtures', name);
  await fs.remove(testDir);
  await fs.ensureDir(testDir);
  return testDir;
}

/**
 * Cleanup test directory
 */
export async function cleanupTestDir(dir: string): Promise<void> {
  await fs.remove(dir);
}

/**
 * Create a mock PRD structure for testing
 */
export interface MockPRDOptions {
  projectName: string;
  outputDir: string;
  includePRD?: boolean;
  includeTasks?: boolean;
  includeQuickRef?: boolean;
}

export async function createMockPRD(options: MockPRDOptions): Promise<string> {
  const { projectName, outputDir, includePRD = true, includeTasks = false, includeQuickRef = false } = options;

  const prdDir = path.join(outputDir, '.clavix', 'outputs', projectName);
  await fs.ensureDir(prdDir);

  if (includePRD) {
    const prdContent = `# Product Requirements Document

## Project: ${projectName}

### Overview
This is a test PRD for ${projectName}.

### Features
- Feature 1
- Feature 2

### Technical Requirements
- Requirement 1
- Requirement 2
`;
    await fs.writeFile(path.join(prdDir, 'prd.md'), prdContent);
  }

  if (includeTasks) {
    const tasksContent = `# Implementation Tasks: ${projectName}

## Phase 1: Setup

### Task 1.1: Initialize Project
- [ ] Setup description
- **ID**: phase-1-setup-1

### Task 1.2: Configure Dependencies
- [ ] Config description
- **ID**: phase-1-setup-2

## Phase 2: Implementation

### Task 2.1: Core Logic
- [ ] Implementation description
- **ID**: phase-2-impl-1
`;
    await fs.writeFile(path.join(prdDir, 'tasks.md'), tasksContent);
  }

  if (includeQuickRef) {
    const quickRefContent = `# ${projectName} - Quick Reference

## Key Points
- Point 1
- Point 2
`;
    await fs.writeFile(path.join(prdDir, 'prd-quick-ref.md'), quickRefContent);
  }

  return prdDir;
}

/**
 * Mock CLI command execution environment
 */
export interface CLITestEnvironment {
  testDir: string;
  originalCwd: string;
  cleanup: () => Promise<void>;
}

export async function setupCLITestEnvironment(name: string): Promise<CLITestEnvironment> {
  const testDir = await createTestDir(name);
  const originalCwd = process.cwd();

  // Change to test directory
  process.chdir(testDir);

  return {
    testDir,
    originalCwd,
    cleanup: async () => {
      process.chdir(originalCwd);
      await cleanupTestDir(testDir);
    },
  };
}

/**
 * Mock git repository for testing
 */
export async function createMockGitRepo(dir: string): Promise<void> {
  const gitDir = path.join(dir, '.git');
  await fs.ensureDir(gitDir);
  await fs.writeFile(path.join(gitDir, 'config'), '[core]\n\trepositoryformatversion = 0\n');
}

/**
 * Create mock config file for implement command
 */
export async function createMockImplementConfig(prdDir: string, overrides: any = {}): Promise<string> {
  const configPath = path.join(prdDir, '.clavix-implement-config.json');

  const defaultConfig = {
    commitStrategy: 'per-task',
    tasksPath: path.join(prdDir, 'tasks.md'),
    currentTask: {
      id: 'phase-1-setup-1',
      description: 'Initialize Project',
      phase: 'Phase 1: Setup',
      completed: false,
    },
    stats: {
      total: 3,
      completed: 0,
      remaining: 3,
      percentage: 0,
    },
    timestamp: new Date().toISOString(),
    completedTaskIds: [],
    completionTimestamps: {},
    blockedTasks: [],
    ...overrides,
  };

  await fs.writeJson(configPath, defaultConfig, { spaces: 2 });

  return configPath;
}

/**
 * Verify CLI command exit codes
 */
export const ExitCodes = {
  SUCCESS: 0,
  ERROR: 1,
  INVALID_INPUT: 2,
} as const;

/**
 * Mock session data for testing
 */
export async function createMockSession(outputDir: string, sessionId: string, data: any = {}): Promise<string> {
  const sessionsDir = path.join(outputDir, '.clavix', 'sessions');
  await fs.ensureDir(sessionsDir);

  const sessionFile = path.join(sessionsDir, `${sessionId}.json`);

  const defaultData = {
    id: sessionId,
    timestamp: new Date().toISOString(),
    mode: 'start',
    messages: [
      { role: 'user', content: 'Test message 1' },
      { role: 'assistant', content: 'Test response 1' },
    ],
    ...data,
  };

  await fs.writeJson(sessionFile, defaultData, { spaces: 2 });

  return sessionFile;
}
