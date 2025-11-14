/**
 * ArchiveManager tests
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import { ArchiveManager, PrdProject, TaskStatus } from '../../src/core/archive-manager';

describe('ArchiveManager', () => {
  const testDir = path.join(__dirname, '../fixtures/test-archive-manager');
  const outputsDir = path.join(testDir, '.clavix/outputs');
  const archiveDir = path.join(testDir, '.clavix/outputs/archive');
  let manager: ArchiveManager;
  let originalCwd: string;

  beforeEach(async () => {
    // Clean up test directories
    await fs.remove(testDir);
    await fs.ensureDir(outputsDir);

    // Change to test directory
    originalCwd = process.cwd();
    process.chdir(testDir);

    manager = new ArchiveManager();
  });

  afterEach(async () => {
    // Restore original directory
    process.chdir(originalCwd);

    // Clean up after tests
    await fs.remove(testDir);
  });

  describe('listPrdProjects', () => {
    it('should list all PRD projects in outputs directory', async () => {
      // Create test projects
      await createTestProject('project-1', outputsDir);
      await createTestProject('project-2', outputsDir);

      const projects = await manager.listPrdProjects();

      expect(projects.length).toBe(2);
      expect(projects.map(p => p.name)).toContain('project-1');
      expect(projects.map(p => p.name)).toContain('project-2');
    });

    it('should return empty array when no outputs directory exists', async () => {
      await fs.remove(outputsDir);

      const projects = await manager.listPrdProjects();

      expect(projects).toEqual([]);
    });

    it('should exclude archive directory from active projects', async () => {
      await createTestProject('active-project', outputsDir);
      await fs.ensureDir(archiveDir);
      await createTestProject('archived-project', archiveDir);

      const projects = await manager.listPrdProjects(false);

      expect(projects.length).toBe(1);
      expect(projects[0].name).toBe('active-project');
    });

    it('should include archived projects when requested', async () => {
      await createTestProject('active-project', outputsDir);
      await fs.ensureDir(archiveDir);
      await createTestProject('archived-project', archiveDir);

      const projects = await manager.listPrdProjects(true);

      expect(projects.length).toBe(2);
      const names = projects.map(p => p.name);
      expect(names).toContain('active-project');
      expect(names).toContain('archived-project');
    });

    it('should sort projects by modification time (most recent first)', async () => {
      await createTestProject('old-project', outputsDir);

      // Wait to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 10));

      await createTestProject('new-project', outputsDir);

      const projects = await manager.listPrdProjects();

      expect(projects[0].name).toBe('new-project');
      expect(projects[1].name).toBe('old-project');
    });

    it('should only include directories with PRD files', async () => {
      await createTestProject('with-prd', outputsDir);

      // Create directory without PRD
      const noPrdDir = path.join(outputsDir, 'no-prd');
      await fs.ensureDir(noPrdDir);

      const projects = await manager.listPrdProjects();

      expect(projects.length).toBe(1);
      expect(projects[0].name).toBe('with-prd');
    });
  });

  describe('listArchivedProjects', () => {
    it('should list archived projects', async () => {
      await fs.ensureDir(archiveDir);
      await createTestProject('archived-1', archiveDir);
      await createTestProject('archived-2', archiveDir);

      const projects = await manager.listArchivedProjects();

      expect(projects.length).toBe(2);
      expect(projects[0].isArchived).toBe(true);
      expect(projects[1].isArchived).toBe(true);
    });

    it('should return empty array when archive directory does not exist', async () => {
      const projects = await manager.listArchivedProjects();

      expect(projects).toEqual([]);
    });
  });

  describe('getArchivablePrds', () => {
    it('should return projects with all tasks completed', async () => {
      // Project with all tasks completed
      const completedProject = path.join(outputsDir, 'completed-project');
      await createTestProject('completed-project', outputsDir);
      await createTasksFile(completedProject, [
        { completed: true, description: 'Task 1' },
        { completed: true, description: 'Task 2' },
      ]);

      // Project with incomplete tasks
      const incompleteProject = path.join(outputsDir, 'incomplete-project');
      await createTestProject('incomplete-project', outputsDir);
      await createTasksFile(incompleteProject, [
        { completed: true, description: 'Task 1' },
        { completed: false, description: 'Task 2' },
      ]);

      const archivable = await manager.getArchivablePrds();

      expect(archivable.length).toBe(1);
      expect(archivable[0].name).toBe('completed-project');
    });

    it('should not return projects without tasks.md', async () => {
      await createTestProject('no-tasks', outputsDir);

      const archivable = await manager.getArchivablePrds();

      expect(archivable.length).toBe(0);
    });
  });

  describe('checkTasksStatus', () => {
    it('should return status when tasks.md exists', async () => {
      const project = path.join(outputsDir, 'test-project');
      await createTestProject('test-project', outputsDir);
      await createTasksFile(project, [
        { completed: true, description: 'Task 1' },
        { completed: false, description: 'Task 2' },
        { completed: false, description: 'Task 3' },
      ]);

      const status = await manager.checkTasksStatus(project);

      expect(status.hasTasksFile).toBe(true);
      expect(status.total).toBe(3);
      expect(status.completed).toBe(1);
      expect(status.remaining).toBe(2);
      expect(status.percentage).toBeCloseTo(33.33, 1);
      expect(status.allCompleted).toBe(false);
    });

    it('should detect when all tasks are completed', async () => {
      const project = path.join(outputsDir, 'completed-project');
      await createTestProject('completed-project', outputsDir);
      await createTasksFile(project, [
        { completed: true, description: 'Task 1' },
        { completed: true, description: 'Task 2' },
      ]);

      const status = await manager.checkTasksStatus(project);

      expect(status.allCompleted).toBe(true);
      expect(status.remaining).toBe(0);
    });

    it('should return no-tasks status when tasks.md does not exist', async () => {
      const project = path.join(outputsDir, 'no-tasks');
      await createTestProject('no-tasks', outputsDir);

      const status = await manager.checkTasksStatus(project);

      expect(status.hasTasksFile).toBe(false);
      expect(status.total).toBe(0);
      expect(status.allCompleted).toBe(false);
    });

    it('should handle corrupted tasks.md gracefully', async () => {
      const project = path.join(outputsDir, 'corrupted-project');
      await createTestProject('corrupted-project', outputsDir);
      await fs.writeFile(
        path.join(project, 'tasks.md'),
        'Invalid content that cannot be parsed'
      );

      const status = await manager.checkTasksStatus(project);

      expect(status.hasTasksFile).toBe(true);
      expect(status.total).toBe(0);
      expect(status.allCompleted).toBe(false);
    });
  });

  describe('archiveProject', () => {
    it('should archive project with all tasks completed', async () => {
      const project = path.join(outputsDir, 'completed-project');
      await createTestProject('completed-project', outputsDir);
      await createTasksFile(project, [
        { completed: true, description: 'Task 1' },
        { completed: true, description: 'Task 2' },
      ]);

      const result = await manager.archiveProject('completed-project');

      expect(result.success).toBe(true);
      expect(result.message).toContain('Successfully archived');
      expect(await fs.pathExists(project)).toBe(false);
      expect(await fs.pathExists(path.join(archiveDir, 'completed-project'))).toBe(true);
    });

    it('should not archive project with incomplete tasks without force', async () => {
      const project = path.join(outputsDir, 'incomplete-project');
      await createTestProject('incomplete-project', outputsDir);
      await createTasksFile(project, [
        { completed: true, description: 'Task 1' },
        { completed: false, description: 'Task 2' },
      ]);

      const result = await manager.archiveProject('incomplete-project');

      expect(result.success).toBe(false);
      expect(result.message).toContain('incomplete task');
      expect(await fs.pathExists(project)).toBe(true);
    });

    it('should archive project with incomplete tasks when forced', async () => {
      const project = path.join(outputsDir, 'incomplete-project');
      await createTestProject('incomplete-project', outputsDir);
      await createTasksFile(project, [
        { completed: false, description: 'Task 1' },
      ]);

      const result = await manager.archiveProject('incomplete-project', true);

      expect(result.success).toBe(true);
      expect(await fs.pathExists(project)).toBe(false);
      expect(await fs.pathExists(path.join(archiveDir, 'incomplete-project'))).toBe(true);
    });

    it('should not archive project without tasks.md without force', async () => {
      await createTestProject('no-tasks', outputsDir);

      const result = await manager.archiveProject('no-tasks');

      expect(result.success).toBe(false);
      expect(result.message).toContain('no tasks.md file');
    });

    it('should archive project without tasks.md when forced', async () => {
      await createTestProject('no-tasks', outputsDir);

      const result = await manager.archiveProject('no-tasks', true);

      expect(result.success).toBe(true);
    });

    it('should return error when project does not exist', async () => {
      const result = await manager.archiveProject('nonexistent-project');

      expect(result.success).toBe(false);
      expect(result.message).toContain('Project not found');
    });

    it('should return error when destination already exists', async () => {
      const project = path.join(outputsDir, 'test-project');
      await createTestProject('test-project', outputsDir);
      await createTasksFile(project, [{ completed: true, description: 'Task 1' }]);

      // Create existing archived project
      await fs.ensureDir(archiveDir);
      await createTestProject('test-project', archiveDir);

      const result = await manager.archiveProject('test-project');

      expect(result.success).toBe(false);
      expect(result.message).toContain('already contains');
    });

    it('should return error when trying to archive already archived project', async () => {
      await fs.ensureDir(archiveDir);
      await createTestProject('archived', archiveDir);

      const result = await manager.archiveProject('archive/archived');

      expect(result.success).toBe(false);
      expect(result.message).toContain('already archived');
    });
  });

  describe('restoreProject', () => {
    it('should restore archived project', async () => {
      await fs.ensureDir(archiveDir);
      await createTestProject('archived-project', archiveDir);

      const result = await manager.restoreProject('archived-project');

      expect(result.success).toBe(true);
      expect(result.message).toContain('Successfully restored');
      expect(await fs.pathExists(path.join(archiveDir, 'archived-project'))).toBe(false);
      expect(await fs.pathExists(path.join(outputsDir, 'archived-project'))).toBe(true);
    });

    it('should return error when archived project does not exist', async () => {
      const result = await manager.restoreProject('nonexistent-project');

      expect(result.success).toBe(false);
      expect(result.message).toContain('Archived project not found');
    });

    it('should return error when destination already exists', async () => {
      await fs.ensureDir(archiveDir);
      await createTestProject('duplicate-project', archiveDir);
      await createTestProject('duplicate-project', outputsDir);

      const result = await manager.restoreProject('duplicate-project');

      expect(result.success).toBe(false);
      expect(result.message).toContain('already contains');
    });
  });

  describe('getIncompleteTasks', () => {
    it('should return incomplete tasks with phase names', async () => {
      const project = path.join(outputsDir, 'test-project');
      await createTestProject('test-project', outputsDir);

      const tasksContent = `# Implementation Tasks

## Phase 1: Setup

- [x] Complete task
- [ ] Incomplete task 1

## Phase 2: Development

- [ ] Incomplete task 2
- [x] Another complete task
`;

      await fs.writeFile(path.join(project, 'tasks.md'), tasksContent);

      const incompleteTasks = await manager.getIncompleteTasks(project);

      expect(incompleteTasks.length).toBe(2);
      expect(incompleteTasks[0]).toContain('Phase 1: Setup');
      expect(incompleteTasks[0]).toContain('Incomplete task 1');
      expect(incompleteTasks[1]).toContain('Phase 2: Development');
      expect(incompleteTasks[1]).toContain('Incomplete task 2');
    });

    it('should return empty array when tasks.md does not exist', async () => {
      const project = path.join(outputsDir, 'no-tasks');
      await createTestProject('no-tasks', outputsDir);

      const incompleteTasks = await manager.getIncompleteTasks(project);

      expect(incompleteTasks).toEqual([]);
    });

    it('should return empty array when all tasks are completed', async () => {
      const project = path.join(outputsDir, 'completed-project');
      await createTestProject('completed-project', outputsDir);
      await createTasksFile(project, [
        { completed: true, description: 'Task 1' },
        { completed: true, description: 'Task 2' },
      ]);

      const incompleteTasks = await manager.getIncompleteTasks(project);

      expect(incompleteTasks).toEqual([]);
    });

    it('should handle corrupted tasks.md gracefully', async () => {
      const project = path.join(outputsDir, 'corrupted');
      await createTestProject('corrupted', outputsDir);
      await fs.writeFile(path.join(project, 'tasks.md'), 'Invalid content');

      const incompleteTasks = await manager.getIncompleteTasks(project);

      expect(incompleteTasks).toEqual([]);
    });
  });

  describe('PRD file detection', () => {
    it('should detect different PRD filename variations', async () => {
      const variations = [
        'PRD.md',
        'full-prd.md',
        'prd.md',
        'Full-PRD.md',
        'FULL_PRD.md',
        'FULL-PRD.md',
        'QUICK_PRD.md',
      ];

      for (const filename of variations) {
        const projectName = `project-${filename.replace(/[^a-z0-9]/gi, '-')}`;
        const projectDir = path.join(outputsDir, projectName);
        await fs.ensureDir(projectDir);
        await fs.writeFile(path.join(projectDir, filename), '# Test PRD');

        const projects = await manager.listPrdProjects();
        const found = projects.find(p => p.name === projectName);

        expect(found).toBeDefined();

        // Clean up for next iteration
        await fs.remove(projectDir);
      }
    });
  });

  describe('edge cases', () => {
    it('should handle empty outputs directory', async () => {
      const projects = await manager.listPrdProjects();

      expect(projects).toEqual([]);
    });

    it('should handle projects with empty tasks files', async () => {
      const project = path.join(outputsDir, 'empty-tasks');
      await createTestProject('empty-tasks', outputsDir);
      await fs.writeFile(path.join(project, 'tasks.md'), '');

      const status = await manager.checkTasksStatus(project);

      expect(status.hasTasksFile).toBe(true);
      expect(status.total).toBe(0);
    });

    it('should handle concurrent archive operations gracefully', async () => {
      const project1 = path.join(outputsDir, 'project-1');
      const project2 = path.join(outputsDir, 'project-2');

      await createTestProject('project-1', outputsDir);
      await createTasksFile(project1, [{ completed: true, description: 'Task 1' }]);

      await createTestProject('project-2', outputsDir);
      await createTasksFile(project2, [{ completed: true, description: 'Task 1' }]);

      const [result1, result2] = await Promise.all([
        manager.archiveProject('project-1'),
        manager.archiveProject('project-2'),
      ]);

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
    });
  });
});

/**
 * Helper function to create a test PRD project
 */
async function createTestProject(name: string, baseDir: string): Promise<void> {
  const projectDir = path.join(baseDir, name);
  await fs.ensureDir(projectDir);
  await fs.writeFile(
    path.join(projectDir, 'full-prd.md'),
    `# ${name}\n\nTest PRD content`
  );
}

/**
 * Helper function to create a tasks.md file
 */
async function createTasksFile(
  projectDir: string,
  tasks: Array<{ completed: boolean; description: string }>
): Promise<void> {
  let content = '# Implementation Tasks\n\n## Phase 1: Test\n\n';

  for (const task of tasks) {
    const checkbox = task.completed ? '[x]' : '[ ]';
    content += `- ${checkbox} ${task.description}\n`;
  }

  await fs.writeFile(path.join(projectDir, 'tasks.md'), content);
}
