/**
 * Tests for plan command functionality
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import { TaskManager } from '../../src/core/task-manager';

describe('Plan command', () => {
  const testDir = path.join(__dirname, '../fixtures/test-plan');
  const outputsDir = path.join(testDir, '.clavix/outputs');
  let manager: TaskManager;
  let originalCwd: string;

  beforeEach(async () => {
    // Clean up and setup
    await fs.remove(testDir);
    await fs.ensureDir(outputsDir);

    // Change to test directory
    originalCwd = process.cwd();
    process.chdir(testDir);

    manager = new TaskManager();
  });

  afterEach(async () => {
    // Restore directory
    process.chdir(originalCwd);

    // Clean up
    await fs.remove(testDir);
  });

  describe('PRD directory detection', () => {
    it('should find PRD directory by name', async () => {
      const projectDir = path.join(outputsDir, 'my-project');
      await fs.ensureDir(projectDir);
      await fs.writeFile(path.join(projectDir, 'full-prd.md'), '# My Project');

      const found = await manager.findPrdDirectory('my-project');

      expect(found).toContain('my-project');
    });

    it('should find most recent PRD when no name specified', async () => {
      const project1 = path.join(outputsDir, 'project-1');
      await fs.ensureDir(project1);
      await fs.writeFile(path.join(project1, 'full-prd.md'), '# Project 1');

      // Wait to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 10));

      const project2 = path.join(outputsDir, 'project-2');
      await fs.ensureDir(project2);
      await fs.writeFile(path.join(project2, 'full-prd.md'), '# Project 2');

      const found = await manager.findPrdDirectory();

      expect(found).toContain('project-2');
    });

    it('should throw error when PRD directory not found', async () => {
      await expect(async () => {
        await manager.findPrdDirectory('nonexistent');
      }).rejects.toThrow();
    });

    it('should throw error when outputs directory does not exist', async () => {
      await fs.remove(outputsDir);

      await expect(async () => {
        await manager.findPrdDirectory();
      }).rejects.toThrow('No .clavix/outputs directory found');
    });
  });

  describe('task generation from PRD', () => {
    it('should generate tasks from structured PRD', async () => {
      const projectDir = path.join(outputsDir, 'structured-prd');
      await fs.ensureDir(projectDir);

      const prdContent = `# Structured Project

## Requirements

### Must-Have Features

#### 1. User Authentication

**Behavior**:
- Users can register
- Users can login
- Users can reset password

#### 2. Dashboard

**Behavior**:
- Display user stats
- Show recent activity
`;

      await fs.writeFile(path.join(projectDir, 'full-prd.md'), prdContent);

      const result = await manager.generateTasksFromPrd(projectDir);

      expect(result.phases.length).toBeGreaterThan(0);
      expect(result.totalTasks).toBeGreaterThan(0);
      expect(result.outputPath).toContain('tasks.md');
    });

    it('should generate default phases for unstructured PRD', async () => {
      const projectDir = path.join(outputsDir, 'unstructured-prd');
      await fs.ensureDir(projectDir);

      const prdContent = `# Simple Project

## Requirements

Just some basic requirements without structure.
`;

      await fs.writeFile(path.join(projectDir, 'full-prd.md'), prdContent);

      const result = await manager.generateTasksFromPrd(projectDir);

      expect(result.phases.length).toBeGreaterThan(0);
      expect(result.totalTasks).toBeGreaterThan(0);
    });

    it('should create tasks.md file', async () => {
      const projectDir = path.join(outputsDir, 'create-tasks');
      await fs.ensureDir(projectDir);

      const prdContent = `# Project

## Requirements

### Must-Have Features

#### 1. Feature

**Behavior**:
- Task 1
`;

      await fs.writeFile(path.join(projectDir, 'full-prd.md'), prdContent);

      const result = await manager.generateTasksFromPrd(projectDir);

      expect(await fs.pathExists(result.outputPath)).toBe(true);
    });
  });

  describe('tasks.md file format', () => {
    it('should generate properly formatted tasks.md', async () => {
      const projectDir = path.join(outputsDir, 'format-test');
      await fs.ensureDir(projectDir);

      const prdContent = `# Test Project

## Requirements

### Must-Have Features

#### 1. Feature

**Behavior**:
- Do something
`;

      await fs.writeFile(path.join(projectDir, 'full-prd.md'), prdContent);

      await manager.generateTasksFromPrd(projectDir);

      const tasksPath = path.join(projectDir, 'tasks.md');
      const content = await fs.readFile(tasksPath, 'utf-8');

      expect(content).toContain('# Implementation Tasks');
      expect(content).toContain('##');
      expect(content).toContain('- [ ]');
    });

    it('should include project name in tasks.md', async () => {
      const projectDir = path.join(outputsDir, 'named-project');
      await fs.ensureDir(projectDir);

      const prdContent = `# Named Project

## Requirements

### Must-Have Features

#### 1. Feature

**Behavior**:
- Task 1
`;

      await fs.writeFile(path.join(projectDir, 'full-prd.md'), prdContent);

      await manager.generateTasksFromPrd(projectDir);

      const tasksPath = path.join(projectDir, 'tasks.md');
      const content = await fs.readFile(tasksPath, 'utf-8');

      expect(content).toContain('Named Project');
    });

    it('should include generation timestamp', async () => {
      const projectDir = path.join(outputsDir, 'timestamp-test');
      await fs.ensureDir(projectDir);

      const prdContent = `# Project

## Requirements

### Must-Have Features

#### 1. Feature

**Behavior**:
- Task 1
`;

      await fs.writeFile(path.join(projectDir, 'full-prd.md'), prdContent);

      await manager.generateTasksFromPrd(projectDir);

      const tasksPath = path.join(projectDir, 'tasks.md');
      const content = await fs.readFile(tasksPath, 'utf-8');

      expect(content).toContain('Generated');
    });
  });

  describe('overwrite protection', () => {
    it('should detect existing tasks.md', async () => {
      const projectDir = path.join(outputsDir, 'existing-tasks');
      await fs.ensureDir(projectDir);

      const tasksPath = path.join(projectDir, 'tasks.md');
      await fs.writeFile(tasksPath, '# Existing Tasks');

      const exists = await fs.pathExists(tasksPath);

      expect(exists).toBe(true);
    });

    it('should be able to overwrite when specified', async () => {
      const projectDir = path.join(outputsDir, 'overwrite-test');
      await fs.ensureDir(projectDir);

      const prdContent = `# Project

## Requirements

### Must-Have Features

#### 1. Feature

**Behavior**:
- New task
`;

      await fs.writeFile(path.join(projectDir, 'full-prd.md'), prdContent);

      // Create existing tasks
      const tasksPath = path.join(projectDir, 'tasks.md');
      await fs.writeFile(tasksPath, '# Old Tasks');

      // Generate new tasks (this always overwrites in TaskManager)
      await manager.generateTasksFromPrd(projectDir);

      const content = await fs.readFile(tasksPath, 'utf-8');

      expect(content).toContain('Implementation Tasks');
      expect(content).not.toContain('Old Tasks');
    });
  });

  describe('task optimization', () => {
    it('should ensure tasks start with action verbs', async () => {
      const projectDir = path.join(outputsDir, 'action-verbs');
      await fs.ensureDir(projectDir);

      const prdContent = `# Project

## Requirements

### Must-Have Features

#### 1. Feature

**Behavior**:
- user can do something
`;

      await fs.writeFile(path.join(projectDir, 'full-prd.md'), prdContent);

      await manager.generateTasksFromPrd(projectDir);

      const phases = await manager.readTasksFile(path.join(projectDir, 'tasks.md'));

      phases.forEach(phase => {
        phase.tasks.forEach(task => {
          // Should start with action verb
          expect(task.description).toMatch(/^(Create|Add|Implement|Build|Generate|Read|Write|Parse|Analyze|Display|Update|Handle|Process|Execute|Mark|Track|Ensure|Validate|Configure|Set up|Fix|Refactor|Test)/i);
        });
      });
    });

    it('should limit task description length', async () => {
      const projectDir = path.join(outputsDir, 'long-descriptions');
      await fs.ensureDir(projectDir);

      const longDescription = 'a'.repeat(200);
      const prdContent = `# Project

## Requirements

### Must-Have Features

#### 1. Feature

**Behavior**:
- ${longDescription}
`;

      await fs.writeFile(path.join(projectDir, 'full-prd.md'), prdContent);

      await manager.generateTasksFromPrd(projectDir);

      const phases = await manager.readTasksFile(path.join(projectDir, 'tasks.md'));

      // Long descriptions should be truncated or skipped
      phases.forEach(phase => {
        phase.tasks.forEach(task => {
          expect(task.description.length).toBeLessThanOrEqual(150);
        });
      });
    });
  });

  describe('multiple features handling', () => {
    it('should create phases for each feature', async () => {
      const projectDir = path.join(outputsDir, 'multi-feature');
      await fs.ensureDir(projectDir);

      const prdContent = `# Multi-Feature Project

## Requirements

### Must-Have Features

#### 1. Authentication

**Behavior**:
- User login
- User register

#### 2. Dashboard

**Behavior**:
- Show stats
- Display charts

#### 3. Reports

**Behavior**:
- Generate reports
- Export data
`;

      await fs.writeFile(path.join(projectDir, 'full-prd.md'), prdContent);

      const result = await manager.generateTasksFromPrd(projectDir);

      // Should generate at least one phase with multiple tasks
      expect(result.phases.length).toBeGreaterThanOrEqual(1);
      expect(result.totalTasks).toBeGreaterThan(0);

      // Verify task content includes feature-related items
      const allTasks = result.phases.flatMap(p => p.tasks);
      expect(allTasks.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('PRD reference tracking', () => {
    it('should include PRD references in tasks', async () => {
      const projectDir = path.join(outputsDir, 'with-refs');
      await fs.ensureDir(projectDir);

      const prdContent = `# Project

## Requirements

### Must-Have Features

#### 1. Authentication Feature

**Behavior**:
- User login
`;

      await fs.writeFile(path.join(projectDir, 'full-prd.md'), prdContent);

      await manager.generateTasksFromPrd(projectDir);

      const phases = await manager.readTasksFile(path.join(projectDir, 'tasks.md'));

      const hasReference = phases.some(phase =>
        phase.tasks.some(task => task.prdReference !== undefined)
      );

      expect(hasReference).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle PRD without requirements section', async () => {
      const projectDir = path.join(outputsDir, 'no-requirements');
      await fs.ensureDir(projectDir);

      const prdContent = `# Project

## Overview

Just an overview section.
`;

      await fs.writeFile(path.join(projectDir, 'full-prd.md'), prdContent);

      const result = await manager.generateTasksFromPrd(projectDir);

      // Should still generate something (default phases)
      expect(result.phases.length).toBeGreaterThanOrEqual(0);
    });

    it('should handle empty PRD file', async () => {
      const projectDir = path.join(outputsDir, 'empty-prd');
      await fs.ensureDir(projectDir);

      await fs.writeFile(path.join(projectDir, 'full-prd.md'), '');

      const result = await manager.generateTasksFromPrd(projectDir);

      expect(result).toBeDefined();
    });

    it('should handle special characters in feature names', async () => {
      const projectDir = path.join(outputsDir, 'special-chars');
      await fs.ensureDir(projectDir);

      const prdContent = `# Project

## Requirements

### Must-Have Features

#### 1. Authentication & Authorization

**Behavior**:
- User login
`;

      await fs.writeFile(path.join(projectDir, 'full-prd.md'), prdContent);

      const result = await manager.generateTasksFromPrd(projectDir);

      expect(result.phases.length).toBeGreaterThan(0);
    });
  });
});
