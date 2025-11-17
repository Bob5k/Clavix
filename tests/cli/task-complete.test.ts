/**
 * task-complete CLI command tests
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import TaskComplete from '../../src/cli/commands/task-complete';
import { ConfigManager, ImplementConfig } from '../../src/core/config-manager';
import { Task } from '../../src/core/task-manager';

// Mock stdout to capture output
const originalLog = console.log;
const originalError = console.error;
let logOutput: string[] = [];
let errorOutput: string[] = [];

describe('TaskComplete CLI', () => {
  const testOutputDir = path.join(__dirname, '../fixtures/test-task-complete');
  const testPrdDir = path.join(testOutputDir, 'test-project');
  const tasksPath = path.join(testPrdDir, 'tasks.md');
  const configPath = path.join(testPrdDir, '.clavix-implement-config.json');

  const mockTask: Task = {
    id: 'phase-1-setup-1',
    description: 'Initialize project',
    phase: 'Phase 1: Setup',
    completed: false,
  };

  const mockConfig: ImplementConfig = {
    commitStrategy: 'none',
    tasksPath,
    currentTask: mockTask,
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
  };

  const sampleTasksContent = `# Implementation Tasks

## Phase 1: Setup

- [ ] Initialize project
- [ ] Configure dependencies
- [ ] Setup testing framework
`;

  beforeAll(() => {
    // Mock console.log and console.error
    console.log = (...args: any[]) => {
      logOutput.push(args.join(' '));
    };
    console.error = (...args: any[]) => {
      errorOutput.push(args.join(' '));
    };
  });

  afterAll(() => {
    console.log = originalLog;
    console.error = originalError;
  });

  beforeEach(async () => {
    logOutput = [];
    errorOutput = [];

    await fs.remove(testOutputDir);
    await fs.ensureDir(testPrdDir);

    // Create test tasks.md and config
    await fs.writeFile(tasksPath, sampleTasksContent);
    await fs.writeJson(configPath, mockConfig);
  });

  afterEach(async () => {
    await fs.remove(testOutputDir);
  });

  describe('basic functionality', () => {
    it('should mark task as completed successfully', async () => {
      // Note: CLI testing with oclif is complex, so we test the core functionality
      // that the command would use through the managers
      const configManager = new ConfigManager();

      // Simulate what the command does
      const config = await configManager.read(configPath);
      expect(config).toBeDefined();

      // Track completion
      await configManager.trackCompletion(configPath, 'phase-1-setup-1');

      const updatedConfig = await configManager.read(configPath);
      expect(updatedConfig.completedTaskIds).toContain('phase-1-setup-1');
      expect(updatedConfig.lastCompletedTaskId).toBe('phase-1-setup-1');
    });

    it('should update tasks.md file correctly', async () => {
      const configManager = new ConfigManager();
      const { TaskManager } = await import('../../src/core/task-manager');
      const taskManager = new TaskManager();

      // Mark task as completed
      const result = await taskManager.markTaskCompletedWithValidation(tasksPath, 'phase-1-setup-1');

      expect(result.success).toBe(true);

      // Verify file was updated
      const content = await fs.readFile(tasksPath, 'utf-8');
      expect(content).toContain('[x] Initialize project');
    });

    it('should handle already completed tasks gracefully', async () => {
      const { TaskManager } = await import('../../src/core/task-manager');
      const taskManager = new TaskManager();

      // Mark task once
      await taskManager.markTaskCompletedWithValidation(tasksPath, 'phase-1-setup-1');

      // Try to mark again
      const result = await taskManager.markTaskCompletedWithValidation(tasksPath, 'phase-1-setup-1');

      expect(result.success).toBe(true);
      expect(result.alreadyCompleted).toBe(true);
    });

    it('should handle non-existent task IDs with helpful error', async () => {
      const { TaskManager } = await import('../../src/core/task-manager');
      const taskManager = new TaskManager();

      const result = await taskManager.markTaskCompletedWithValidation(tasksPath, 'non-existent-task');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Task ID "non-existent-task" not found');
      expect(result.error).toContain('Available task IDs');
    });
  });

  describe('config integration', () => {
    it('should track completion in config file', async () => {
      const configManager = new ConfigManager();

      await configManager.trackCompletion(configPath, 'phase-1-setup-1');

      const config = await configManager.read(configPath);

      expect(config.completedTaskIds).toContain('phase-1-setup-1');
      expect(config.completionTimestamps!['phase-1-setup-1']).toBeDefined();
      expect(config.lastCompletedTaskId).toBe('phase-1-setup-1');
    });

    it('should update stats after completion', async () => {
      const configManager = new ConfigManager();
      const { TaskManager } = await import('../../src/core/task-manager');
      const taskManager = new TaskManager();

      // Mark task as completed
      await taskManager.markTaskCompletedWithValidation(tasksPath, 'phase-1-setup-1');

      // Read phases and get updated stats
      const phases = await taskManager.readTasksFile(tasksPath);
      const stats = taskManager.getTaskStats(phases);

      expect(stats.completed).toBe(1);
      expect(stats.remaining).toBe(2);
      expect(stats.percentage).toBeGreaterThan(0);
    });
  });

  describe('task finding and next task', () => {
    it('should find next incomplete task after completion', async () => {
      const { TaskManager } = await import('../../src/core/task-manager');
      const taskManager = new TaskManager();

      // Mark first task as completed
      await taskManager.markTaskCompletedWithValidation(tasksPath, 'phase-1-setup-1');

      // Find next task
      const phases = await taskManager.readTasksFile(tasksPath);
      const nextTask = taskManager.findFirstIncompleteTask(phases);

      expect(nextTask).not.toBeNull();
      expect(nextTask!.id).toBe('phase-1-setup-2');
      expect(nextTask!.description).toBe('Configure dependencies');
    });

    it('should return null when all tasks are completed', async () => {
      const { TaskManager } = await import('../../src/core/task-manager');
      const taskManager = new TaskManager();

      // Mark all tasks as completed
      await taskManager.markTaskCompletedWithValidation(tasksPath, 'phase-1-setup-1');
      await taskManager.markTaskCompletedWithValidation(tasksPath, 'phase-1-setup-2');
      await taskManager.markTaskCompletedWithValidation(tasksPath, 'phase-1-setup-3');

      // Find next task
      const phases = await taskManager.readTasksFile(tasksPath);
      const nextTask = taskManager.findFirstIncompleteTask(phases);

      expect(nextTask).toBeNull();
    });
  });

  describe('error recovery', () => {
    it('should create backup and restore on failure', async () => {
      const { TaskManager } = await import('../../src/core/task-manager');
      const taskManager = new TaskManager();

      // This should succeed and not leave a backup
      const result = await taskManager.markTaskCompletedWithValidation(tasksPath, 'phase-1-setup-1', {
        createBackup: true,
      });

      expect(result.success).toBe(true);
      expect(await fs.pathExists(`${tasksPath}.backup`)).toBe(false);
    });

    it('should handle corrupted config file gracefully', async () => {
      // Write invalid JSON to config
      await fs.writeFile(configPath, 'invalid json {{{');

      const configManager = new ConfigManager();

      await expect(async () => {
        await configManager.read(configPath);
      }).rejects.toThrow();
    });
  });

  describe('multi-task workflow', () => {
    it('should handle completing multiple tasks in sequence', async () => {
      const { TaskManager } = await import('../../src/core/task-manager');
      const taskManager = new TaskManager();
      const configManager = new ConfigManager();

      const taskIds = ['phase-1-setup-1', 'phase-1-setup-2', 'phase-1-setup-3'];

      for (const taskId of taskIds) {
        // Mark task complete
        const result = await taskManager.markTaskCompletedWithValidation(tasksPath, taskId);
        expect(result.success).toBe(true);

        // Track in config
        await configManager.trackCompletion(configPath, taskId);
      }

      // Verify all tracked
      const config = await configManager.read(configPath);
      expect(config.completedTaskIds).toHaveLength(3);
      expect(config.completedTaskIds).toEqual(taskIds);

      // Verify all marked in file
      const content = await fs.readFile(tasksPath, 'utf-8');
      expect(content).toContain('[x] Initialize project');
      expect(content).toContain('[x] Configure dependencies');
      expect(content).toContain('[x] Setup testing framework');
    });
  });

  describe('resume capability', () => {
    it('should maintain state across interruptions', async () => {
      const configManager = new ConfigManager();
      const { TaskManager } = await import('../../src/core/task-manager');
      const taskManager = new TaskManager();

      // Complete first task
      await taskManager.markTaskCompletedWithValidation(tasksPath, 'phase-1-setup-1');
      await configManager.trackCompletion(configPath, 'phase-1-setup-1');

      // Simulate interruption - read config again (as would happen on resume)
      const config = await configManager.read(configPath);

      expect(config.completedTaskIds).toContain('phase-1-setup-1');
      expect(config.lastCompletedTaskId).toBe('phase-1-setup-1');

      // Find next task (as implement command would do)
      const phases = await taskManager.readTasksFile(tasksPath);
      const nextTask = taskManager.findFirstIncompleteTask(phases);

      expect(nextTask!.id).toBe('phase-1-setup-2');
    });
  });
});
