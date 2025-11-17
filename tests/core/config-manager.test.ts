/**
 * ConfigManager tests
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import { ConfigManager, ImplementConfig } from '../../src/core/config-manager';
import { Task } from '../../src/core/task-manager';

describe('ConfigManager', () => {
  const testOutputDir = path.join(__dirname, '../fixtures/test-config-manager');
  const testConfigPath = path.join(testOutputDir, '.clavix-implement-config.json');
  let manager: ConfigManager;

  const mockTask: Task = {
    id: 'phase-1-setup-1',
    description: 'Initialize project',
    phase: 'Phase 1: Setup',
    completed: false,
  };

  const mockConfig: ImplementConfig = {
    commitStrategy: 'per-task',
    tasksPath: '/test/tasks.md',
    currentTask: mockTask,
    stats: {
      total: 10,
      completed: 0,
      remaining: 10,
      percentage: 0,
    },
    timestamp: new Date().toISOString(),
  };

  beforeEach(async () => {
    await fs.remove(testOutputDir);
    await fs.ensureDir(testOutputDir);
    manager = new ConfigManager();
  });

  afterEach(async () => {
    await fs.remove(testOutputDir);
  });

  describe('write', () => {
    it('should write config to file', async () => {
      await manager.write(testConfigPath, mockConfig);

      expect(await fs.pathExists(testConfigPath)).toBe(true);

      const written = await fs.readJson(testConfigPath);
      expect(written.commitStrategy).toBe('per-task');
      expect(written.tasksPath).toBe('/test/tasks.md');
      expect(written.currentTask.id).toBe('phase-1-setup-1');
    });

    it('should format JSON with 2 spaces', async () => {
      await manager.write(testConfigPath, mockConfig);

      const content = await fs.readFile(testConfigPath, 'utf-8');
      // Check for proper indentation (2 spaces)
      expect(content).toContain('  "commitStrategy"');
    });

    it('should validate config before writing when enabled', async () => {
      const invalidConfig = { ...mockConfig, commitStrategy: undefined as any };

      await expect(async () => {
        await manager.write(testConfigPath, invalidConfig, { validate: true });
      }).rejects.toThrow('commitStrategy is required');
    });

    it('should skip validation when disabled', async () => {
      const invalidConfig = { ...mockConfig, commitStrategy: undefined as any };

      // Should not throw
      await manager.write(testConfigPath, invalidConfig, { validate: false });

      expect(await fs.pathExists(testConfigPath)).toBe(true);
    });
  });

  describe('read', () => {
    it('should read config from file', async () => {
      await fs.writeJson(testConfigPath, mockConfig);

      const config = await manager.read(testConfigPath);

      expect(config.commitStrategy).toBe('per-task');
      expect(config.tasksPath).toBe('/test/tasks.md');
      expect(config.currentTask.id).toBe('phase-1-setup-1');
    });

    it('should throw error if file does not exist', async () => {
      await expect(async () => {
        await manager.read(testConfigPath);
      }).rejects.toThrow('Config file not found');
    });

    it('should migrate old config format', async () => {
      const oldConfig = {
        commitStrategy: 'per-phase',
        tasksPath: '/test/tasks.md',
        currentTask: mockTask,
        stats: mockConfig.stats,
        timestamp: mockConfig.timestamp,
        // No new fields: completedTaskIds, completionTimestamps, blockedTasks
      };

      await fs.writeJson(testConfigPath, oldConfig);

      const config = await manager.read(testConfigPath);

      // Should have migrated fields
      expect(config.completedTaskIds).toEqual([]);
      expect(config.completionTimestamps).toEqual({});
      expect(config.blockedTasks).toEqual([]);
    });

    it('should preserve new format if already present', async () => {
      const newConfig: ImplementConfig = {
        ...mockConfig,
        completedTaskIds: ['phase-1-setup-1'],
        completionTimestamps: { 'phase-1-setup-1': '2025-01-01T00:00:00.000Z' },
        blockedTasks: [],
      };

      await fs.writeJson(testConfigPath, newConfig);

      const config = await manager.read(testConfigPath);

      expect(config.completedTaskIds).toEqual(['phase-1-setup-1']);
      expect(config.completionTimestamps).toEqual({ 'phase-1-setup-1': '2025-01-01T00:00:00.000Z' });
    });
  });

  describe('update', () => {
    it('should update specific fields in config', async () => {
      await fs.writeJson(testConfigPath, mockConfig);

      await manager.update(testConfigPath, {
        commitStrategy: 'per-5-tasks',
      });

      const config = await manager.read(testConfigPath);

      expect(config.commitStrategy).toBe('per-5-tasks');
      expect(config.tasksPath).toBe('/test/tasks.md'); // Unchanged
    });

    it('should update timestamp on update', async () => {
      const oldTimestamp = '2020-01-01T00:00:00.000Z';
      await fs.writeJson(testConfigPath, { ...mockConfig, timestamp: oldTimestamp });

      await manager.update(testConfigPath, { commitStrategy: 'per-phase' });

      const config = await manager.read(testConfigPath);

      expect(config.timestamp).not.toBe(oldTimestamp);
    });
  });

  describe('trackCompletion', () => {
    it('should track task completion', async () => {
      await fs.writeJson(testConfigPath, mockConfig);

      await manager.trackCompletion(testConfigPath, 'phase-1-setup-1');

      const config = await manager.read(testConfigPath);

      expect(config.lastCompletedTaskId).toBe('phase-1-setup-1');
      expect(config.completedTaskIds).toContain('phase-1-setup-1');
      expect(config.completionTimestamps!['phase-1-setup-1']).toBeDefined();
    });

    it('should not add duplicate task IDs', async () => {
      await fs.writeJson(testConfigPath, mockConfig);

      await manager.trackCompletion(testConfigPath, 'phase-1-setup-1');
      await manager.trackCompletion(testConfigPath, 'phase-1-setup-1');

      const config = await manager.read(testConfigPath);

      expect(config.completedTaskIds!.filter(id => id === 'phase-1-setup-1').length).toBe(1);
    });

    it('should track multiple completions', async () => {
      await fs.writeJson(testConfigPath, mockConfig);

      await manager.trackCompletion(testConfigPath, 'phase-1-setup-1');
      await manager.trackCompletion(testConfigPath, 'phase-1-setup-2');
      await manager.trackCompletion(testConfigPath, 'phase-1-setup-3');

      const config = await manager.read(testConfigPath);

      expect(config.completedTaskIds).toEqual([
        'phase-1-setup-1',
        'phase-1-setup-2',
        'phase-1-setup-3',
      ]);
      expect(config.lastCompletedTaskId).toBe('phase-1-setup-3');
    });

    it('should initialize arrays if not present', async () => {
      const minimalConfig = {
        commitStrategy: 'per-task' as const,
        tasksPath: '/test/tasks.md',
        currentTask: mockTask,
        stats: mockConfig.stats,
        timestamp: new Date().toISOString(),
      };

      await fs.writeJson(testConfigPath, minimalConfig);

      await manager.trackCompletion(testConfigPath, 'phase-1-setup-1');

      const config = await manager.read(testConfigPath);

      expect(config.completedTaskIds).toBeDefined();
      expect(config.completionTimestamps).toBeDefined();
    });
  });

  describe('addBlockedTask', () => {
    it('should add blocked task', async () => {
      await fs.writeJson(testConfigPath, mockConfig);

      await manager.addBlockedTask(testConfigPath, 'phase-2-api-1', 'Missing API credentials');

      const config = await manager.read(testConfigPath);

      expect(config.blockedTasks).toHaveLength(1);
      expect(config.blockedTasks![0].taskId).toBe('phase-2-api-1');
      expect(config.blockedTasks![0].reason).toBe('Missing API credentials');
      expect(config.blockedTasks![0].timestamp).toBeDefined();
    });

    it('should replace existing blocked task entry', async () => {
      await fs.writeJson(testConfigPath, mockConfig);

      await manager.addBlockedTask(testConfigPath, 'phase-2-api-1', 'Missing credentials');
      await manager.addBlockedTask(testConfigPath, 'phase-2-api-1', 'Updated reason');

      const config = await manager.read(testConfigPath);

      expect(config.blockedTasks).toHaveLength(1);
      expect(config.blockedTasks![0].reason).toBe('Updated reason');
    });

    it('should track multiple blocked tasks', async () => {
      await fs.writeJson(testConfigPath, mockConfig);

      await manager.addBlockedTask(testConfigPath, 'phase-2-api-1', 'Missing credentials');
      await manager.addBlockedTask(testConfigPath, 'phase-3-ui-1', 'Waiting for design');

      const config = await manager.read(testConfigPath);

      expect(config.blockedTasks).toHaveLength(2);
    });
  });

  describe('removeBlockedTask', () => {
    it('should remove blocked task', async () => {
      await fs.writeJson(testConfigPath, {
        ...mockConfig,
        blockedTasks: [
          { taskId: 'phase-2-api-1', reason: 'Missing credentials', timestamp: new Date().toISOString() },
        ],
      });

      await manager.removeBlockedTask(testConfigPath, 'phase-2-api-1');

      const config = await manager.read(testConfigPath);

      expect(config.blockedTasks).toHaveLength(0);
    });

    it('should handle removing non-existent blocked task', async () => {
      await fs.writeJson(testConfigPath, mockConfig);

      // Should not throw
      await manager.removeBlockedTask(testConfigPath, 'non-existent');

      const config = await manager.read(testConfigPath);

      expect(config.blockedTasks || []).toHaveLength(0);
    });
  });

  describe('getState', () => {
    it('should return current state summary', async () => {
      await fs.writeJson(testConfigPath, {
        ...mockConfig,
        completedTaskIds: ['phase-1-setup-1', 'phase-1-setup-2'],
        completionTimestamps: {
          'phase-1-setup-1': '2025-01-01T00:00:00.000Z',
          'phase-1-setup-2': '2025-01-02T00:00:00.000Z',
        },
        lastCompletedTaskId: 'phase-1-setup-2',
        blockedTasks: [
          { taskId: 'phase-2-api-1', reason: 'Missing credentials', timestamp: new Date().toISOString() },
        ],
        stats: {
          total: 10,
          completed: 2,
          remaining: 8,
          percentage: 20,
        },
      });

      const state = await manager.getState(testConfigPath);

      expect(state.currentTaskId).toBe('phase-1-setup-1');
      expect(state.completedCount).toBe(2);
      expect(state.remainingCount).toBe(8);
      expect(state.blockedCount).toBe(1);
      expect(state.lastCompletedTaskId).toBe('phase-1-setup-2');
      expect(state.lastCompletionTime).toBe('2025-01-02T00:00:00.000Z');
    });
  });

  describe('isTaskCompleted', () => {
    it('should return true if task is completed', async () => {
      await fs.writeJson(testConfigPath, {
        ...mockConfig,
        completedTaskIds: ['phase-1-setup-1'],
      });

      const result = await manager.isTaskCompleted(testConfigPath, 'phase-1-setup-1');

      expect(result).toBe(true);
    });

    it('should return false if task is not completed', async () => {
      await fs.writeJson(testConfigPath, {
        ...mockConfig,
        completedTaskIds: ['phase-1-setup-1'],
      });

      const result = await manager.isTaskCompleted(testConfigPath, 'phase-1-setup-2');

      expect(result).toBe(false);
    });

    it('should return false if completedTaskIds is not present', async () => {
      await fs.writeJson(testConfigPath, mockConfig);

      const result = await manager.isTaskCompleted(testConfigPath, 'phase-1-setup-1');

      expect(result).toBe(false);
    });
  });

  describe('createResumeCheckpoint', () => {
    it('should create resume checkpoint', async () => {
      await fs.writeJson(testConfigPath, mockConfig);

      const phaseProgress = {
        'Phase 1: Setup': 2,
        'Phase 2: Implementation': 0,
      };

      await manager.createResumeCheckpoint(testConfigPath, 'phase-2-impl-1', phaseProgress);

      const config = await manager.read(testConfigPath);

      expect(config.resumeCheckpoint).toBeDefined();
      expect(config.resumeCheckpoint!.lastTaskId).toBe('phase-2-impl-1');
      expect(config.resumeCheckpoint!.phaseProgress).toEqual(phaseProgress);
      expect(config.resumeCheckpoint!.sessionStartTime).toBeDefined();
    });
  });

  describe('getConfigPath', () => {
    it('should return correct config path', () => {
      const prdPath = '/path/to/prd';
      const configPath = ConfigManager.getConfigPath(prdPath);

      expect(configPath).toBe('/path/to/prd/.clavix-implement-config.json');
    });
  });

  describe('validation', () => {
    it('should validate commitStrategy is required', async () => {
      const invalidConfig = { ...mockConfig };
      delete (invalidConfig as any).commitStrategy;

      await expect(async () => {
        await manager.write(testConfigPath, invalidConfig, { validate: true });
      }).rejects.toThrow('commitStrategy is required');
    });

    it('should validate tasksPath is required', async () => {
      const invalidConfig = { ...mockConfig };
      delete (invalidConfig as any).tasksPath;

      await expect(async () => {
        await manager.write(testConfigPath, invalidConfig, { validate: true });
      }).rejects.toThrow('tasksPath is required');
    });

    it('should validate currentTask is required', async () => {
      const invalidConfig = { ...mockConfig };
      delete (invalidConfig as any).currentTask;

      await expect(async () => {
        await manager.write(testConfigPath, invalidConfig, { validate: true });
      }).rejects.toThrow('currentTask is required');
    });

    it('should validate stats is required', async () => {
      const invalidConfig = { ...mockConfig };
      delete (invalidConfig as any).stats;

      await expect(async () => {
        await manager.write(testConfigPath, invalidConfig, { validate: true });
      }).rejects.toThrow('stats is required');
    });

    it('should validate commitStrategy values', async () => {
      const invalidConfig = { ...mockConfig, commitStrategy: 'invalid' as any };

      await expect(async () => {
        await manager.write(testConfigPath, invalidConfig, { validate: true });
      }).rejects.toThrow('invalid commitStrategy');
    });

    it('should allow all valid commitStrategy values', async () => {
      const strategies: Array<'per-task' | 'per-5-tasks' | 'per-phase' | 'none'> = [
        'per-task',
        'per-5-tasks',
        'per-phase',
        'none',
      ];

      for (const strategy of strategies) {
        const config = { ...mockConfig, commitStrategy: strategy };

        // Should not throw
        await manager.write(testConfigPath, config, { validate: true });

        expect(await fs.pathExists(testConfigPath)).toBe(true);
      }
    });
  });

  describe('error handling', () => {
    it('should throw error on read failure', async () => {
      const invalidPath = path.join(testOutputDir, 'non-existent', 'config.json');

      await expect(async () => {
        await manager.read(invalidPath);
      }).rejects.toThrow();
    });

    it('should throw error on write failure to invalid directory', async () => {
      const invalidPath = path.join('/invalid/directory/that/does/not/exist', 'config.json');

      await expect(async () => {
        await manager.write(invalidPath, mockConfig);
      }).rejects.toThrow();
    });
  });
});
