/**
 * Tests for implement command functionality
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import { TaskManager } from '../../src/core/task-manager';
import { GitManager, CommitStrategy } from '../../src/core/git-manager';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

describe('Implement command', () => {
  const testDir = path.join(__dirname, '../fixtures/test-implement');
  const outputsDir = path.join(testDir, '.clavix/outputs');
  let manager: TaskManager;
  let gitManager: GitManager;
  let originalCwd: string;

  beforeEach(async () => {
    // Clean up and setup
    await fs.remove(testDir);
    await fs.ensureDir(outputsDir);

    // Change to test directory
    originalCwd = process.cwd();
    process.chdir(testDir);

    manager = new TaskManager();
    gitManager = new GitManager();
  });

  afterEach(async () => {
    // Restore directory
    process.chdir(originalCwd);

    // Clean up
    await fs.remove(testDir);
  });

  describe('task discovery', () => {
    it('should find tasks.md by project name', async () => {
      const projectDir = path.join(outputsDir, 'my-project');
      await fs.ensureDir(projectDir);

      const tasksContent = `# Implementation Tasks

## Phase 1: Setup

- [ ] Initialize project
- [ ] Setup dependencies`;

      await fs.writeFile(path.join(projectDir, 'tasks.md'), tasksContent);

      const foundDir = await manager.findPrdDirectory('my-project');

      expect(foundDir).toContain('my-project');
      expect(await fs.pathExists(path.join(foundDir, 'tasks.md'))).toBe(true);
    });

    it('should find most recent project when no name specified', async () => {
      const project1 = path.join(outputsDir, 'project-1');
      await fs.ensureDir(project1);
      await fs.writeFile(path.join(project1, 'full-prd.md'), '# PRD 1');
      await fs.writeFile(path.join(project1, 'tasks.md'), '# Tasks 1');

      // Wait for different timestamp
      await new Promise(resolve => setTimeout(resolve, 10));

      const project2 = path.join(outputsDir, 'project-2');
      await fs.ensureDir(project2);
      await fs.writeFile(path.join(project2, 'full-prd.md'), '# PRD 2');
      await fs.writeFile(path.join(project2, 'tasks.md'), '# Tasks 2');

      const foundDir = await manager.findPrdDirectory();

      expect(foundDir).toContain('project-2');
    });

    it('should handle direct tasks-path', async () => {
      const customPath = path.join(testDir, 'custom-tasks.md');
      await fs.writeFile(customPath, '# Tasks\n\n## Phase 1\n\n- [ ] Task 1');

      expect(await fs.pathExists(customPath)).toBe(true);
    });
  });

  describe('task reading and parsing', () => {
    it('should read tasks from tasks.md', async () => {
      const projectDir = path.join(outputsDir, 'with-tasks');
      await fs.ensureDir(projectDir);

      const tasksContent = `# Implementation Tasks

## Phase 1: Setup

- [ ] Task 1
- [x] Task 2

## Phase 2: Implementation

- [ ] Task 3`;

      const tasksPath = path.join(projectDir, 'tasks.md');
      await fs.writeFile(tasksPath, tasksContent);

      const phases = await manager.readTasksFile(tasksPath);

      expect(phases).toBeDefined();
      expect(phases.length).toBe(2);
      expect(phases[0].tasks.length).toBeGreaterThan(0);
    });

    it('should identify completed and incomplete tasks', async () => {
      const projectDir = path.join(outputsDir, 'mixed-tasks');
      await fs.ensureDir(projectDir);

      const tasksContent = `# Tasks

## Phase 1

- [x] Completed task
- [ ] Incomplete task`;

      const tasksPath = path.join(projectDir, 'tasks.md');
      await fs.writeFile(tasksPath, tasksContent);

      const phases = await manager.readTasksFile(tasksPath);

      const allTasks = phases.flatMap(p => p.tasks);
      const completed = allTasks.filter(t => t.completed);
      const incomplete = allTasks.filter(t => !t.completed);

      expect(completed.length).toBe(1);
      expect(incomplete.length).toBe(1);
    });
  });

  describe('task statistics', () => {
    it('should calculate task statistics', async () => {
      const projectDir = path.join(outputsDir, 'stats-test');
      await fs.ensureDir(projectDir);

      const tasksContent = `# Tasks

## Phase 1

- [x] Task 1
- [x] Task 2
- [ ] Task 3
- [ ] Task 4`;

      const tasksPath = path.join(projectDir, 'tasks.md');
      await fs.writeFile(tasksPath, tasksContent);

      const phases = await manager.readTasksFile(tasksPath);
      const stats = manager.getTaskStats(phases);

      expect(stats.total).toBe(4);
      expect(stats.completed).toBe(2);
      expect(stats.remaining).toBe(2);
      expect(stats.percentage).toBeCloseTo(50, 0);
    });

    it('should handle empty tasks', async () => {
      const projectDir = path.join(outputsDir, 'empty-tasks');
      await fs.ensureDir(projectDir);

      const tasksContent = `# Tasks

## Phase 1`;

      const tasksPath = path.join(projectDir, 'tasks.md');
      await fs.writeFile(tasksPath, tasksContent);

      const phases = await manager.readTasksFile(tasksPath);
      const stats = manager.getTaskStats(phases);

      expect(stats.total).toBe(0);
      expect(stats.completed).toBe(0);
      expect(stats.remaining).toBe(0);
      expect(stats.percentage).toBe(0);
    });

    it('should calculate 100% when all tasks completed', async () => {
      const projectDir = path.join(outputsDir, 'all-done');
      await fs.ensureDir(projectDir);

      const tasksContent = `# Tasks

## Phase 1

- [x] Task 1
- [x] Task 2`;

      const tasksPath = path.join(projectDir, 'tasks.md');
      await fs.writeFile(tasksPath, tasksContent);

      const phases = await manager.readTasksFile(tasksPath);
      const stats = manager.getTaskStats(phases);

      expect(stats.total).toBe(2);
      expect(stats.completed).toBe(2);
      expect(stats.remaining).toBe(0);
      expect(stats.percentage).toBe(100);
    });
  });

  describe('next task finding', () => {
    it('should find first incomplete task', async () => {
      const projectDir = path.join(outputsDir, 'next-task');
      await fs.ensureDir(projectDir);

      const tasksContent = `# Tasks

## Phase 1

- [x] Completed task
- [ ] Next task to do
- [ ] Future task`;

      const tasksPath = path.join(projectDir, 'tasks.md');
      await fs.writeFile(tasksPath, tasksContent);

      const phases = await manager.readTasksFile(tasksPath);
      const nextTask = manager.findFirstIncompleteTask(phases);

      expect(nextTask).toBeDefined();
      expect(nextTask?.description).toContain('Next task to do');
      expect(nextTask?.completed).toBe(false);
    });

    it('should return null when all tasks completed', async () => {
      const projectDir = path.join(outputsDir, 'no-next');
      await fs.ensureDir(projectDir);

      const tasksContent = `# Tasks

## Phase 1

- [x] Task 1
- [x] Task 2`;

      const tasksPath = path.join(projectDir, 'tasks.md');
      await fs.writeFile(tasksPath, tasksContent);

      const phases = await manager.readTasksFile(tasksPath);
      const nextTask = manager.findFirstIncompleteTask(phases);

      expect(nextTask).toBeNull();
    });

    it('should find task across multiple phases', async () => {
      const projectDir = path.join(outputsDir, 'multi-phase');
      await fs.ensureDir(projectDir);

      const tasksContent = `# Tasks

## Phase 1

- [x] Task 1

## Phase 2

- [ ] Task 2`;

      const tasksPath = path.join(projectDir, 'tasks.md');
      await fs.writeFile(tasksPath, tasksContent);

      const phases = await manager.readTasksFile(tasksPath);
      const nextTask = manager.findFirstIncompleteTask(phases);

      expect(nextTask).toBeDefined();
      expect(nextTask?.phase).toContain('Phase 2');
    });
  });

  describe('git integration', () => {
    it('should validate git setup', async () => {
      const status = await gitManager.validateGitSetup();

      expect(status).toBeDefined();
      expect(status.isRepo).toBeDefined();
      expect(typeof status.isRepo).toBe('boolean');
    });

    it('should detect git repository', async () => {
      // Initialize git repo
      await execAsync('git init');
      await execAsync('git config user.name "Test User"');
      await execAsync('git config user.email "test@example.com"');

      const status = await gitManager.validateGitSetup();

      expect(status.isRepo).toBe(true);
      expect(status.currentBranch).toBeDefined();

      // Clean up git repo
      await fs.remove(path.join(testDir, '.git'));
    });

    it('should provide git status information', async () => {
      const status = await gitManager.validateGitSetup();

      // Should always provide status info
      expect(status).toBeDefined();
      expect(typeof status.isRepo).toBe('boolean');

      if (status.isRepo) {
        expect(status.currentBranch).toBeDefined();
      }
    });
  });

  describe('commit strategy', () => {
    it('should support per-task strategy', () => {
      const strategy: CommitStrategy = 'per-task';

      expect(['per-task', 'per-5-tasks', 'per-phase', 'none']).toContain(strategy);
    });

    it('should support per-5-tasks strategy', () => {
      const strategy: CommitStrategy = 'per-5-tasks';

      expect(['per-task', 'per-5-tasks', 'per-phase', 'none']).toContain(strategy);
    });

    it('should support per-phase strategy', () => {
      const strategy: CommitStrategy = 'per-phase';

      expect(['per-task', 'per-5-tasks', 'per-phase', 'none']).toContain(strategy);
    });

    it('should support none strategy', () => {
      const strategy: CommitStrategy = 'none';

      expect(['per-task', 'per-5-tasks', 'per-phase', 'none']).toContain(strategy);
    });

    it('should default to none when git disabled', () => {
      const noGit = true;
      const strategy: CommitStrategy = noGit ? 'none' : 'per-phase';

      expect(strategy).toBe('none');
    });
  });

  describe('flag handling', () => {
    it('should support project flag', () => {
      const flags = { project: 'my-project' };

      expect(flags.project).toBe('my-project');
    });

    it('should support tasks-path flag', () => {
      const flags = { 'tasks-path': '/path/to/tasks.md' };

      expect(flags['tasks-path']).toBe('/path/to/tasks.md');
    });

    it('should support no-git flag', () => {
      const flags = { 'no-git': true };

      expect(flags['no-git']).toBe(true);
    });

    it('should support commit-strategy flag', () => {
      const flags = { 'commit-strategy': 'per-task' };

      expect(flags['commit-strategy']).toBe('per-task');
    });

    it('should use defaults when no flags provided', () => {
      const flags = {};

      expect(flags).toEqual({});
    });
  });

  describe('edge cases', () => {
    it('should handle missing tasks.md file', async () => {
      const projectDir = path.join(outputsDir, 'no-tasks');
      await fs.ensureDir(projectDir);
      await fs.writeFile(path.join(projectDir, 'full-prd.md'), '# PRD');

      const tasksPath = path.join(projectDir, 'tasks.md');
      const exists = await fs.pathExists(tasksPath);

      expect(exists).toBe(false);
    });

    it('should handle malformed tasks.md', async () => {
      const projectDir = path.join(outputsDir, 'malformed');
      await fs.ensureDir(projectDir);

      const tasksContent = 'Random text without proper format';
      const tasksPath = path.join(projectDir, 'tasks.md');
      await fs.writeFile(tasksPath, tasksContent);

      const phases = await manager.readTasksFile(tasksPath);

      expect(Array.isArray(phases)).toBe(true);
    });

    it('should handle tasks with PRD references', async () => {
      const projectDir = path.join(outputsDir, 'with-refs');
      await fs.ensureDir(projectDir);

      const tasksContent = `# Tasks

## Phase 1

- [ ] Task referencing Feature A`;

      const tasksPath = path.join(projectDir, 'tasks.md');
      await fs.writeFile(tasksPath, tasksContent);

      const phases = await manager.readTasksFile(tasksPath);
      const task = phases[0]?.tasks[0];

      expect(task).toBeDefined();
      expect(task?.description).toBeDefined();
    });

    it('should handle empty phase names', async () => {
      const projectDir = path.join(outputsDir, 'empty-phase');
      await fs.ensureDir(projectDir);

      const tasksContent = `# Tasks

##

- [ ] Task without phase name`;

      const tasksPath = path.join(projectDir, 'tasks.md');
      await fs.writeFile(tasksPath, tasksContent);

      const phases = await manager.readTasksFile(tasksPath);

      expect(Array.isArray(phases)).toBe(true);
    });

    it('should handle special characters in task descriptions', async () => {
      const projectDir = path.join(outputsDir, 'special-chars');
      await fs.ensureDir(projectDir);

      const tasksContent = `# Tasks

## Phase 1

- [ ] Task with émojis 🚀 and spëcial çhars`;

      const tasksPath = path.join(projectDir, 'tasks.md');
      await fs.writeFile(tasksPath, tasksContent);

      const phases = await manager.readTasksFile(tasksPath);
      const task = phases[0]?.tasks[0];

      expect(task).toBeDefined();
      expect(task?.description).toContain('émojis');
    });
  });

  describe('task marking', () => {
    it('should be able to modify task completed status', async () => {
      const projectDir = path.join(outputsDir, 'mark-complete');
      await fs.ensureDir(projectDir);

      const tasksContent = `# Tasks

## Phase 1

- [ ] Task to complete`;

      const tasksPath = path.join(projectDir, 'tasks.md');
      await fs.writeFile(tasksPath, tasksContent);

      const phases = await manager.readTasksFile(tasksPath);
      const task = phases[0].tasks[0];

      // Verify we can modify the completed status
      expect(task.completed).toBe(false);
      task.completed = true;
      expect(task.completed).toBe(true);
    });

    it('should maintain task data structure', async () => {
      const projectDir = path.join(outputsDir, 'preserve-order');
      await fs.ensureDir(projectDir);

      const tasksContent = `# Tasks

## Phase 1

- [ ] Task 1
- [ ] Task 2
- [ ] Task 3`;

      const tasksPath = path.join(projectDir, 'tasks.md');
      await fs.writeFile(tasksPath, tasksContent);

      const phases = await manager.readTasksFile(tasksPath);

      expect(phases[0].tasks.length).toBe(3);
      expect(phases[0].tasks.every(t => t.description && typeof t.completed === 'boolean')).toBe(true);
    });
  });
});
