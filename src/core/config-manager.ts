/**
 * ConfigManager - Manages .clavix-implement-config.json
 *
 * This class handles:
 * - Reading/writing implementation configuration
 * - Tracking task completion state
 * - Managing resume checkpoints
 * - Storing git commit strategy preferences
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import { Task } from './task-manager';
import { CommitStrategy } from './git-manager';

/**
 * Configuration for task implementation
 */
export interface ImplementConfig {
  /** Git commit strategy */
  commitStrategy: CommitStrategy;

  /** Path to tasks.md file */
  tasksPath: string;

  /** Current task being worked on */
  currentTask: Task;

  /** Overall task statistics */
  stats: {
    total: number;
    completed: number;
    remaining: number;
    percentage: number;
  };

  /** Timestamp when config was last updated */
  timestamp: string;

  /** ID of the last completed task */
  lastCompletedTaskId?: string;

  /** Array of all completed task IDs (for validation and resume) */
  completedTaskIds?: string[];

  /** Timestamps for each task completion (for tracking progress) */
  completionTimestamps?: Record<string, string>;

  /** Array of blocked task IDs with reasons */
  blockedTasks?: Array<{ taskId: string; reason: string; timestamp: string }>;

  /** Resume checkpoint for interrupted sessions */
  resumeCheckpoint?: {
    lastTaskId: string;
    phaseProgress: Record<string, number>;
    sessionStartTime: string;
  };
}

/**
 * Options for updating config
 */
export interface ConfigUpdateOptions {
  /** Merge with existing config (true) or overwrite (false) */
  merge?: boolean;

  /** Validate config structure before writing */
  validate?: boolean;
}

/**
 * ConfigManager class
 *
 * Manages implementation configuration and task tracking state
 */
export class ConfigManager {
  /**
   * Read implementation config from file
   * @param configPath - Path to config file (.clavix-implement-config.json)
   * @returns Implementation configuration
   */
  async read(configPath: string): Promise<ImplementConfig> {
    if (!(await fs.pathExists(configPath))) {
      throw new Error(`Config file not found: ${configPath}\n\nHint: Run "clavix implement" first to initialize configuration`);
    }

    try {
      const config = await fs.readJson(configPath);

      // Migrate old config format if needed
      return this.migrateConfig(config);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to read config file: ${errorMessage}`);
    }
  }

  /**
   * Write implementation config to file
   * @param configPath - Path to config file
   * @param config - Configuration to write
   * @param options - Update options
   */
  async write(
    configPath: string,
    config: ImplementConfig,
    options: ConfigUpdateOptions = {}
  ): Promise<void> {
    const { validate = true } = options;

    if (validate) {
      this.validateConfig(config);
    }

    try {
      await fs.writeJson(configPath, config, { spaces: 2 });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to write config file: ${errorMessage}`);
    }
  }

  /**
   * Update specific fields in config
   * @param configPath - Path to config file
   * @param updates - Partial config updates
   */
  async update(
    configPath: string,
    updates: Partial<ImplementConfig>
  ): Promise<void> {
    const existing = await this.read(configPath);
    const updated = {
      ...existing,
      ...updates,
      timestamp: new Date().toISOString(),
    };

    await this.write(configPath, updated);
  }

  /**
   * Track a task completion
   * @param configPath - Path to config file
   * @param taskId - ID of completed task
   */
  async trackCompletion(configPath: string, taskId: string): Promise<void> {
    const config = await this.read(configPath);

    // Initialize tracking arrays if not present
    if (!config.completedTaskIds) {
      config.completedTaskIds = [];
    }
    if (!config.completionTimestamps) {
      config.completionTimestamps = {};
    }

    // Add to completed tasks (avoid duplicates)
    if (!config.completedTaskIds.includes(taskId)) {
      config.completedTaskIds.push(taskId);
    }

    // Record completion timestamp
    config.completionTimestamps[taskId] = new Date().toISOString();

    // Update last completed task
    config.lastCompletedTaskId = taskId;

    // Update timestamp
    config.timestamp = new Date().toISOString();

    await this.write(configPath, config);
  }

  /**
   * Add a blocked task
   * @param configPath - Path to config file
   * @param taskId - ID of blocked task
   * @param reason - Reason for blocking
   */
  async addBlockedTask(
    configPath: string,
    taskId: string,
    reason: string
  ): Promise<void> {
    const config = await this.read(configPath);

    if (!config.blockedTasks) {
      config.blockedTasks = [];
    }

    // Remove existing entry for this task if present
    config.blockedTasks = config.blockedTasks.filter(b => b.taskId !== taskId);

    // Add new blocked task
    config.blockedTasks.push({
      taskId,
      reason,
      timestamp: new Date().toISOString(),
    });

    config.timestamp = new Date().toISOString();

    await this.write(configPath, config);
  }

  /**
   * Remove a blocked task (unblock)
   * @param configPath - Path to config file
   * @param taskId - ID of task to unblock
   */
  async removeBlockedTask(configPath: string, taskId: string): Promise<void> {
    const config = await this.read(configPath);

    if (config.blockedTasks) {
      config.blockedTasks = config.blockedTasks.filter(b => b.taskId !== taskId);
      config.timestamp = new Date().toISOString();
      await this.write(configPath, config);
    }
  }

  /**
   * Get current implementation state
   * @param configPath - Path to config file
   * @returns State summary
   */
  async getState(configPath: string): Promise<{
    currentTaskId: string;
    completedCount: number;
    remainingCount: number;
    blockedCount: number;
    lastCompletedTaskId?: string;
    lastCompletionTime?: string;
  }> {
    const config = await this.read(configPath);

    return {
      currentTaskId: config.currentTask.id,
      completedCount: config.completedTaskIds?.length ?? 0,
      remainingCount: config.stats.remaining,
      blockedCount: config.blockedTasks?.length ?? 0,
      lastCompletedTaskId: config.lastCompletedTaskId,
      lastCompletionTime: config.lastCompletedTaskId
        ? config.completionTimestamps?.[config.lastCompletedTaskId]
        : undefined,
    };
  }

  /**
   * Check if a task has been completed
   * @param configPath - Path to config file
   * @param taskId - Task ID to check
   * @returns true if task is in completed list
   */
  async isTaskCompleted(configPath: string, taskId: string): Promise<boolean> {
    const config = await this.read(configPath);
    return config.completedTaskIds?.includes(taskId) ?? false;
  }

  /**
   * Validate config structure
   * @param config - Configuration to validate
   * @throws Error if config is invalid
   */
  private validateConfig(config: ImplementConfig): void {
    if (!config.commitStrategy) {
      throw new Error('Config validation failed: commitStrategy is required');
    }

    if (!config.tasksPath) {
      throw new Error('Config validation failed: tasksPath is required');
    }

    if (!config.currentTask) {
      throw new Error('Config validation failed: currentTask is required');
    }

    if (!config.stats) {
      throw new Error('Config validation failed: stats is required');
    }

    const validStrategies: CommitStrategy[] = ['per-task', 'per-5-tasks', 'per-phase', 'none'];
    if (!validStrategies.includes(config.commitStrategy)) {
      throw new Error(`Config validation failed: invalid commitStrategy "${config.commitStrategy}"`);
    }
  }

  /**
   * Migrate old config format to new format
   * @param config - Old config format
   * @returns Migrated config
   */
  private migrateConfig(config: any): ImplementConfig {
    // If already has new fields, return as-is
    if (config.completedTaskIds !== undefined) {
      return config as ImplementConfig;
    }

    // Migrate from old format
    const migrated: ImplementConfig = {
      commitStrategy: config.commitStrategy,
      tasksPath: config.tasksPath,
      currentTask: config.currentTask,
      stats: config.stats,
      timestamp: config.timestamp ?? new Date().toISOString(),
      completedTaskIds: [],
      completionTimestamps: {},
      blockedTasks: [],
    };

    return migrated;
  }

  /**
   * Create a resume checkpoint
   * @param configPath - Path to config file
   * @param currentTaskId - Current task being worked on
   * @param phaseProgress - Progress by phase (phase name -> completed count)
   */
  async createResumeCheckpoint(
    configPath: string,
    currentTaskId: string,
    phaseProgress: Record<string, number>
  ): Promise<void> {
    const config = await this.read(configPath);

    config.resumeCheckpoint = {
      lastTaskId: currentTaskId,
      phaseProgress,
      sessionStartTime: new Date().toISOString(),
    };

    config.timestamp = new Date().toISOString();

    await this.write(configPath, config);
  }

  /**
   * Get the config file path for a PRD directory
   * @param prdPath - Path to PRD directory
   * @returns Path to config file
   */
  static getConfigPath(prdPath: string): string {
    return path.join(prdPath, '.clavix-implement-config.json');
  }
}
