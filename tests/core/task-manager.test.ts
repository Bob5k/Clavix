/**
 * TaskManager tests
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import { TaskManager, Task, TaskPhase } from '../../src/core/task-manager';

describe('TaskManager', () => {
  const testOutputDir = path.join(__dirname, '../fixtures/test-task-manager');
  const testPrdDir = path.join(testOutputDir, 'test-prd');
  let manager: TaskManager;

  beforeEach(async () => {
    // Clean up test directories
    await fs.remove(testOutputDir);
    await fs.ensureDir(testOutputDir);
    await fs.ensureDir(testPrdDir);
    manager = new TaskManager();
  });

  afterEach(async () => {
    // Clean up after tests
    await fs.remove(testOutputDir);
  });

  describe('generateTasksFromPrd', () => {
    it('should generate tasks from a structured PRD', async () => {
      const prdContent = `# Test Project

## Requirements

### Must-Have Features

#### 1. User Authentication

**Behavior**:
- Users can register with email and password
- Users can log in with credentials
- Users can reset forgotten passwords

#### 2. Dashboard

**Behavior**:
- Display user statistics
- Show recent activity
`;

      const prdPath = path.join(testPrdDir, 'full-prd.md');
      await fs.writeFile(prdPath, prdContent);

      const result = await manager.generateTasksFromPrd(testPrdDir);

      expect(result.phases.length).toBeGreaterThan(0);
      expect(result.totalTasks).toBeGreaterThan(0);
      expect(result.outputPath).toContain('tasks.md');
      expect(await fs.pathExists(result.outputPath)).toBe(true);
    });

    it('should handle PRD with different filename variations', async () => {
      const prdContent = `# Test Project\n\n## Requirements\n\nBasic requirements`;
      const prdPath = path.join(testPrdDir, 'PRD.md');
      await fs.writeFile(prdPath, prdContent);

      const result = await manager.generateTasksFromPrd(testPrdDir);

      expect(result).toBeDefined();
      expect(result.phases.length).toBeGreaterThan(0);
    });

    it('should throw error when no PRD file found', async () => {
      await expect(async () => {
        await manager.generateTasksFromPrd(testPrdDir);
      }).rejects.toThrow('No PRD file found');
    });

    it('should generate default phases when no structure found', async () => {
      const prdContent = `# Simple Project

## Requirements

Just a simple description without structured features.`;
      const prdPath = path.join(testPrdDir, 'full-prd.md');
      await fs.writeFile(prdPath, prdContent);

      const result = await manager.generateTasksFromPrd(testPrdDir);

      expect(result.phases.length).toBeGreaterThan(0);
      expect(result.totalTasks).toBeGreaterThan(0);
    });
  });

  describe('readTasksFile', () => {
    it('should read and parse tasks.md file', async () => {
      const tasksContent = `# Implementation Tasks

## Phase 1: User Authentication

- [ ] Implement user registration
- [x] Implement user login
- [ ] Implement password reset (ref: User Auth)

## Phase 2: Dashboard

- [ ] Display user statistics
`;

      const tasksPath = path.join(testPrdDir, 'tasks.md');
      await fs.writeFile(tasksPath, tasksContent);

      const phases = await manager.readTasksFile(tasksPath);

      expect(phases.length).toBe(2);
      expect(phases[0].name).toBe('Phase 1: User Authentication');
      expect(phases[0].tasks.length).toBe(3);
      expect(phases[0].tasks[1].completed).toBe(true);
      expect(phases[0].tasks[2].prdReference).toBe('User Auth');
    });

    it('should throw error when tasks file not found', async () => {
      const nonExistentPath = path.join(testPrdDir, 'nonexistent-tasks.md');

      await expect(async () => {
        await manager.readTasksFile(nonExistentPath);
      }).rejects.toThrow('Tasks file not found');
    });

    it('should handle empty tasks file', async () => {
      const tasksPath = path.join(testPrdDir, 'tasks.md');
      await fs.writeFile(tasksPath, '# Implementation Tasks\n\n');

      const phases = await manager.readTasksFile(tasksPath);

      expect(phases.length).toBe(0);
    });

    it('should parse tasks with and without references', async () => {
      const tasksContent = `# Implementation Tasks

## Phase 1: Setup

- [ ] Task without reference
- [ ] Task with reference (ref: Feature X)
`;

      const tasksPath = path.join(testPrdDir, 'tasks.md');
      await fs.writeFile(tasksPath, tasksContent);

      const phases = await manager.readTasksFile(tasksPath);

      expect(phases[0].tasks[0].prdReference).toBeUndefined();
      expect(phases[0].tasks[1].prdReference).toBe('Feature X');
    });
  });

  describe('findFirstIncompleteTask', () => {
    it('should find the first incomplete task', () => {
      const phases: TaskPhase[] = [
        {
          name: 'Phase 1',
          tasks: [
            { id: 'task-1', description: 'Task 1', phase: 'Phase 1', completed: true },
            { id: 'task-2', description: 'Task 2', phase: 'Phase 1', completed: false },
            { id: 'task-3', description: 'Task 3', phase: 'Phase 1', completed: false },
          ],
        },
        {
          name: 'Phase 2',
          tasks: [
            { id: 'task-4', description: 'Task 4', phase: 'Phase 2', completed: false },
          ],
        },
      ];

      const firstIncomplete = manager.findFirstIncompleteTask(phases);

      expect(firstIncomplete).toBeDefined();
      expect(firstIncomplete?.id).toBe('task-2');
    });

    it('should return null when all tasks are completed', () => {
      const phases: TaskPhase[] = [
        {
          name: 'Phase 1',
          tasks: [
            { id: 'task-1', description: 'Task 1', phase: 'Phase 1', completed: true },
            { id: 'task-2', description: 'Task 2', phase: 'Phase 1', completed: true },
          ],
        },
      ];

      const firstIncomplete = manager.findFirstIncompleteTask(phases);

      expect(firstIncomplete).toBeNull();
    });

    it('should return null for empty phases', () => {
      const phases: TaskPhase[] = [];

      const firstIncomplete = manager.findFirstIncompleteTask(phases);

      expect(firstIncomplete).toBeNull();
    });
  });

  describe('markTaskCompleted', () => {
    it('should mark a task as completed in the file', async () => {
      const tasksContent = `# Implementation Tasks

## Phase 1: Setup

- [ ] Set up project structure
- [ ] Install dependencies
`;

      const tasksPath = path.join(testPrdDir, 'tasks.md');
      await fs.writeFile(tasksPath, tasksContent);

      // Read to get task IDs
      const phases = await manager.readTasksFile(tasksPath);
      const taskId = phases[0].tasks[0].id;

      await manager.markTaskCompleted(tasksPath, taskId);

      // Verify the file was updated
      const updatedContent = await fs.readFile(tasksPath, 'utf-8');
      expect(updatedContent).toContain('- [x] Set up project structure');
    });

    it('should throw error when task not found', async () => {
      const tasksContent = `# Implementation Tasks

## Phase 1: Setup

- [ ] Task 1
`;

      const tasksPath = path.join(testPrdDir, 'tasks.md');
      await fs.writeFile(tasksPath, tasksContent);

      await expect(async () => {
        await manager.markTaskCompleted(tasksPath, 'nonexistent-task-id');
      }).rejects.toThrow('Task not found');
    });

    it('should handle tasks with references', async () => {
      const tasksContent = `# Implementation Tasks

## Phase 1: Setup

- [ ] Set up authentication (ref: User Auth)
`;

      const tasksPath = path.join(testPrdDir, 'tasks.md');
      await fs.writeFile(tasksPath, tasksContent);

      const phases = await manager.readTasksFile(tasksPath);
      const taskId = phases[0].tasks[0].id;

      await manager.markTaskCompleted(tasksPath, taskId);

      const updatedContent = await fs.readFile(tasksPath, 'utf-8');
      expect(updatedContent).toContain('- [x] Set up authentication (ref: User Auth)');
    });
  });

  describe('getTaskStats', () => {
    it('should calculate task statistics correctly', () => {
      const phases: TaskPhase[] = [
        {
          name: 'Phase 1',
          tasks: [
            { id: 'task-1', description: 'Task 1', phase: 'Phase 1', completed: true },
            { id: 'task-2', description: 'Task 2', phase: 'Phase 1', completed: true },
            { id: 'task-3', description: 'Task 3', phase: 'Phase 1', completed: false },
          ],
        },
        {
          name: 'Phase 2',
          tasks: [
            { id: 'task-4', description: 'Task 4', phase: 'Phase 2', completed: false },
            { id: 'task-5', description: 'Task 5', phase: 'Phase 2', completed: false },
          ],
        },
      ];

      const stats = manager.getTaskStats(phases);

      expect(stats.total).toBe(5);
      expect(stats.completed).toBe(2);
      expect(stats.remaining).toBe(3);
      expect(stats.percentage).toBe(40);
    });

    it('should handle empty phases', () => {
      const phases: TaskPhase[] = [];

      const stats = manager.getTaskStats(phases);

      expect(stats.total).toBe(0);
      expect(stats.completed).toBe(0);
      expect(stats.remaining).toBe(0);
      expect(stats.percentage).toBe(0);
    });

    it('should handle all tasks completed', () => {
      const phases: TaskPhase[] = [
        {
          name: 'Phase 1',
          tasks: [
            { id: 'task-1', description: 'Task 1', phase: 'Phase 1', completed: true },
            { id: 'task-2', description: 'Task 2', phase: 'Phase 1', completed: true },
          ],
        },
      ];

      const stats = manager.getTaskStats(phases);

      expect(stats.total).toBe(2);
      expect(stats.completed).toBe(2);
      expect(stats.remaining).toBe(0);
      expect(stats.percentage).toBe(100);
    });
  });

  describe('findPrdDirectory', () => {
    it('should find PRD directory by project name', async () => {
      const outputsDir = path.join(testOutputDir, '.clavix/outputs');
      const projectDir = path.join(outputsDir, 'my-project');
      await fs.ensureDir(projectDir);
      await fs.writeFile(path.join(projectDir, 'full-prd.md'), '# My Project');

      // Change to test directory context
      const originalCwd = process.cwd();
      try {
        process.chdir(testOutputDir);
        const found = await manager.findPrdDirectory('my-project');
        expect(found).toContain('my-project');
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should find most recent PRD directory when no name specified', async () => {
      const outputsDir = path.join(testOutputDir, '.clavix/outputs');
      const project1 = path.join(outputsDir, 'project-1');
      const project2 = path.join(outputsDir, 'project-2');

      await fs.ensureDir(project1);
      await fs.writeFile(path.join(project1, 'full-prd.md'), '# Project 1');

      // Wait a bit to ensure different timestamps
      await new Promise((resolve) => setTimeout(resolve, 10));

      await fs.ensureDir(project2);
      await fs.writeFile(path.join(project2, 'full-prd.md'), '# Project 2');

      const originalCwd = process.cwd();
      try {
        process.chdir(testOutputDir);
        const found = await manager.findPrdDirectory();
        expect(found).toContain('project-2');
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should throw error when outputs directory does not exist', async () => {
      const originalCwd = process.cwd();
      try {
        process.chdir(testOutputDir);
        await expect(async () => {
          await manager.findPrdDirectory();
        }).rejects.toThrow('No .clavix/outputs directory found');
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should throw error when no PRD directories found', async () => {
      const outputsDir = path.join(testOutputDir, '.clavix/outputs');
      await fs.ensureDir(outputsDir);

      const originalCwd = process.cwd();
      try {
        process.chdir(testOutputDir);
        await expect(async () => {
          await manager.findPrdDirectory();
        }).rejects.toThrow('No PRD directories found');
      } finally {
        process.chdir(originalCwd);
      }
    });
  });

  describe('private methods (testing via public interface)', () => {
    it('should sanitize IDs correctly', async () => {
      const prdContent = `# Test Project

## Requirements

### Must-Have Features

#### 1. User Authentication & Authorization!!!

**Behavior**:
- Test behavior
`;

      const prdPath = path.join(testPrdDir, 'full-prd.md');
      await fs.writeFile(prdPath, prdContent);

      const result = await manager.generateTasksFromPrd(testPrdDir);
      const tasksPath = path.join(testPrdDir, 'tasks.md');
      const phases = await manager.readTasksFile(tasksPath);

      // Check that task IDs are sanitized (lowercase, no special chars)
      phases.forEach((phase) => {
        phase.tasks.forEach((task) => {
          expect(task.id).toMatch(/^[a-z0-9-]+$/);
          expect(task.id.length).toBeLessThanOrEqual(30);
        });
      });
    });

    it('should optimize task descriptions', async () => {
      const prdContent = `# Test Project

## Requirements

### Must-Have Features

#### 1. Feature Name

**Behavior**:
- user can do something
`;

      const prdPath = path.join(testPrdDir, 'full-prd.md');
      await fs.writeFile(prdPath, prdContent);

      const result = await manager.generateTasksFromPrd(testPrdDir);
      const phases = await manager.readTasksFile(result.outputPath);

      // Check that task descriptions start with action verbs
      phases.forEach((phase) => {
        phase.tasks.forEach((task) => {
          expect(task.description).toMatch(/^(Create|Add|Implement|Build|Generate|Read|Write|Parse|Analyze|Display|Update|Handle|Process|Execute|Mark|Track|Ensure|Validate|Configure|Set up|Fix|Refactor|Test)/i);
        });
      });
    });

    it('should parse PRD sections correctly', async () => {
      const prdContent = `# Test Project

## Requirements

Requirements content here

## Technical Stack

Tech stack details

## Out of Scope

Out of scope items
`;

      const prdPath = path.join(testPrdDir, 'full-prd.md');
      await fs.writeFile(prdPath, prdContent);

      const result = await manager.generateTasksFromPrd(testPrdDir);

      expect(result).toBeDefined();
      expect(result.phases.length).toBeGreaterThan(0);
    });
  });

  describe('edge cases', () => {
    it('should handle PRD with very long behavior descriptions', async () => {
      const longDescription = 'a'.repeat(250);
      const prdContent = `# Test Project

## Requirements

### Must-Have Features

#### 1. Feature

**Behavior**:
- ${longDescription}
- Short description
`;

      const prdPath = path.join(testPrdDir, 'full-prd.md');
      await fs.writeFile(prdPath, prdContent);

      const result = await manager.generateTasksFromPrd(testPrdDir);

      expect(result.phases.length).toBeGreaterThan(0);
      // Long descriptions should be skipped
      expect(result.totalTasks).toBeGreaterThan(0);
    });

    it('should handle special characters in task descriptions', async () => {
      const tasksContent = `# Implementation Tasks

## Phase 1: Setup

- [ ] Task with special chars: "quotes", 'apostrophes', (parentheses), [brackets]
`;

      const tasksPath = path.join(testPrdDir, 'tasks.md');
      await fs.writeFile(tasksPath, tasksContent);

      const phases = await manager.readTasksFile(tasksPath);
      const taskId = phases[0].tasks[0].id;

      await manager.markTaskCompleted(tasksPath, taskId);

      const updatedContent = await fs.readFile(tasksPath, 'utf-8');
      expect(updatedContent).toContain('[x]');
    });

    it('should handle empty behavior sections', async () => {
      const prdContent = `# Test Project

## Requirements

### Must-Have Features

#### 1. Feature Name

**Behavior**:
`;

      const prdPath = path.join(testPrdDir, 'full-prd.md');
      await fs.writeFile(prdPath, prdContent);

      const result = await manager.generateTasksFromPrd(testPrdDir);

      expect(result.phases.length).toBeGreaterThan(0);
      // Should generate default task when no behavior points
      expect(result.totalTasks).toBeGreaterThan(0);
    });

    it('should handle multiple phases with same name', async () => {
      const tasksContent = `# Implementation Tasks

## Phase 1: Setup

- [ ] Task 1

## Phase 1: Setup

- [ ] Task 2
`;

      const tasksPath = path.join(testPrdDir, 'tasks.md');
      await fs.writeFile(tasksPath, tasksContent);

      const phases = await manager.readTasksFile(tasksPath);

      expect(phases.length).toBe(2);
      expect(phases[0].tasks.length).toBe(1);
      expect(phases[1].tasks.length).toBe(1);
    });
  });
});
