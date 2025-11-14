/**
 * Tests for archive command functionality
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import { ArchiveManager } from '../../src/core/archive-manager';

describe('Archive command', () => {
  const testDir = path.join(__dirname, '../fixtures/test-archive-cli');
  const outputsDir = path.join(testDir, '.clavix/outputs');
  const archiveDir = path.join(testDir, '.clavix/outputs/archive');
  let manager: ArchiveManager;
  let originalCwd: string;

  beforeEach(async () => {
    // Clean up and setup
    await fs.remove(testDir);
    await fs.ensureDir(outputsDir);

    // Change to test directory
    originalCwd = process.cwd();
    process.chdir(testDir);

    manager = new ArchiveManager();
  });

  afterEach(async () => {
    // Restore directory
    process.chdir(originalCwd);

    // Clean up
    await fs.remove(testDir);
  });

  describe('archivable projects detection', () => {
    it('should detect projects with completed tasks', async () => {
      const projectDir = path.join(outputsDir, 'completed-project');
      await fs.ensureDir(projectDir);
      await fs.writeFile(path.join(projectDir, 'full-prd.md'), '# Test PRD');
      await fs.writeFile(
        path.join(projectDir, 'tasks.md'),
        '# Tasks\n\n## Phase 1\n\n- [x] Task 1\n- [x] Task 2'
      );

      const archivable = await manager.getArchivablePrds();

      expect(archivable.length).toBeGreaterThan(0);
      expect(archivable[0].taskStatus.allCompleted).toBe(true);
    });

    it('should not include projects with incomplete tasks', async () => {
      const projectDir = path.join(outputsDir, 'incomplete-project');
      await fs.ensureDir(projectDir);
      await fs.writeFile(path.join(projectDir, 'full-prd.md'), '# Test PRD');
      await fs.writeFile(
        path.join(projectDir, 'tasks.md'),
        '# Tasks\n\n## Phase 1\n\n- [x] Task 1\n- [ ] Task 2'
      );

      const archivable = await manager.getArchivablePrds();

      const incomplete = archivable.find(p => p.name === 'incomplete-project');
      expect(incomplete).toBeUndefined();
    });

    it('should not include projects without tasks.md', async () => {
      const projectDir = path.join(outputsDir, 'no-tasks-project');
      await fs.ensureDir(projectDir);
      await fs.writeFile(path.join(projectDir, 'full-prd.md'), '# Test PRD');

      const archivable = await manager.getArchivablePrds();

      const noTasks = archivable.find(p => p.name === 'no-tasks-project');
      expect(noTasks).toBeUndefined();
    });
  });

  describe('archive operations', () => {
    it('should archive a completed project', async () => {
      const projectDir = path.join(outputsDir, 'archive-me');
      await fs.ensureDir(projectDir);
      await fs.writeFile(path.join(projectDir, 'full-prd.md'), '# Test PRD');
      await fs.writeFile(
        path.join(projectDir, 'tasks.md'),
        '# Tasks\n\n## Phase 1\n\n- [x] Task 1'
      );

      const result = await manager.archiveProject('archive-me');

      expect(result.success).toBe(true);
      expect(await fs.pathExists(projectDir)).toBe(false);
      expect(await fs.pathExists(path.join(archiveDir, 'archive-me'))).toBe(true);
    });

    it('should force archive incomplete projects when forced', async () => {
      const projectDir = path.join(outputsDir, 'force-archive');
      await fs.ensureDir(projectDir);
      await fs.writeFile(path.join(projectDir, 'full-prd.md'), '# Test PRD');
      await fs.writeFile(
        path.join(projectDir, 'tasks.md'),
        '# Tasks\n\n## Phase 1\n\n- [ ] Task 1'
      );

      const result = await manager.archiveProject('force-archive', true);

      expect(result.success).toBe(true);
    });

    it('should reject archiving incomplete projects without force', async () => {
      const projectDir = path.join(outputsDir, 'incomplete');
      await fs.ensureDir(projectDir);
      await fs.writeFile(path.join(projectDir, 'full-prd.md'), '# Test PRD');
      await fs.writeFile(
        path.join(projectDir, 'tasks.md'),
        '# Tasks\n\n## Phase 1\n\n- [ ] Task 1'
      );

      const result = await manager.archiveProject('incomplete', false);

      expect(result.success).toBe(false);
      expect(result.message).toContain('incomplete');
    });
  });

  describe('restore operations', () => {
    it('should restore archived project', async () => {
      // Create and archive a project first
      const projectDir = path.join(outputsDir, 'restore-me');
      await fs.ensureDir(projectDir);
      await fs.writeFile(path.join(projectDir, 'full-prd.md'), '# Test PRD');
      await fs.writeFile(
        path.join(projectDir, 'tasks.md'),
        '# Tasks\n\n## Phase 1\n\n- [x] Task 1'
      );

      await manager.archiveProject('restore-me');

      // Now restore it
      const result = await manager.restoreProject('restore-me');

      expect(result.success).toBe(true);
      expect(await fs.pathExists(projectDir)).toBe(true);
      expect(await fs.pathExists(path.join(archiveDir, 'restore-me'))).toBe(false);
    });

    it('should fail to restore non-existent archived project', async () => {
      const result = await manager.restoreProject('nonexistent');

      expect(result.success).toBe(false);
      expect(result.message).toContain('not found');
    });

    it('should fail to restore if active project exists', async () => {
      // Create archived project
      await fs.ensureDir(archiveDir);
      const archivedProjectDir = path.join(archiveDir, 'duplicate');
      await fs.ensureDir(archivedProjectDir);
      await fs.writeFile(path.join(archivedProjectDir, 'full-prd.md'), '# Archived');

      // Create active project with same name
      const activeProjectDir = path.join(outputsDir, 'duplicate');
      await fs.ensureDir(activeProjectDir);
      await fs.writeFile(path.join(activeProjectDir, 'full-prd.md'), '# Active');

      const result = await manager.restoreProject('duplicate');

      expect(result.success).toBe(false);
      expect(result.message).toContain('already contains');
    });
  });

  describe('list operations', () => {
    it('should list archived projects', async () => {
      // Create and archive a project
      await fs.ensureDir(archiveDir);
      const archivedProjectDir = path.join(archiveDir, 'archived-1');
      await fs.ensureDir(archivedProjectDir);
      await fs.writeFile(path.join(archivedProjectDir, 'full-prd.md'), '# Archived');

      const archivedProjects = await manager.listArchivedProjects();

      expect(archivedProjects.length).toBeGreaterThan(0);
      expect(archivedProjects[0].isArchived).toBe(true);
    });

    it('should return empty list when no archives exist', async () => {
      const archivedProjects = await manager.listArchivedProjects();

      expect(archivedProjects).toEqual([]);
    });

    it('should list both active and archived when requested', async () => {
      // Create active project
      const activeProject = path.join(outputsDir, 'active');
      await fs.ensureDir(activeProject);
      await fs.writeFile(path.join(activeProject, 'full-prd.md'), '# Active');

      // Create archived project
      await fs.ensureDir(archiveDir);
      const archivedProject = path.join(archiveDir, 'archived');
      await fs.ensureDir(archivedProject);
      await fs.writeFile(path.join(archivedProject, 'full-prd.md'), '# Archived');

      const allProjects = await manager.listPrdProjects(true);

      expect(allProjects.length).toBe(2);
      const hasActive = allProjects.some(p => p.name === 'active' && !p.isArchived);
      const hasArchived = allProjects.some(p => p.name === 'archived' && p.isArchived);

      expect(hasActive).toBe(true);
      expect(hasArchived).toBe(true);
    });
  });

  describe('task status reporting', () => {
    it('should report task completion status', async () => {
      const projectDir = path.join(outputsDir, 'status-check');
      await fs.ensureDir(projectDir);
      await fs.writeFile(path.join(projectDir, 'full-prd.md'), '# Test PRD');
      await fs.writeFile(
        path.join(projectDir, 'tasks.md'),
        '# Tasks\n\n## Phase 1\n\n- [x] Task 1\n- [x] Task 2\n- [ ] Task 3'
      );

      const status = await manager.checkTasksStatus(projectDir);

      expect(status.hasTasksFile).toBe(true);
      expect(status.total).toBe(3);
      expect(status.completed).toBe(2);
      expect(status.remaining).toBe(1);
      expect(status.percentage).toBeCloseTo(66.67, 1);
      expect(status.allCompleted).toBe(false);
    });

    it('should handle projects without tasks.md', async () => {
      const projectDir = path.join(outputsDir, 'no-tasks');
      await fs.ensureDir(projectDir);
      await fs.writeFile(path.join(projectDir, 'full-prd.md'), '# Test PRD');

      const status = await manager.checkTasksStatus(projectDir);

      expect(status.hasTasksFile).toBe(false);
      expect(status.total).toBe(0);
      expect(status.allCompleted).toBe(false);
    });
  });

  describe('incomplete tasks reporting', () => {
    it('should list incomplete tasks', async () => {
      const projectDir = path.join(outputsDir, 'with-incomplete');
      await fs.ensureDir(projectDir);
      await fs.writeFile(path.join(projectDir, 'full-prd.md'), '# Test PRD');
      await fs.writeFile(
        path.join(projectDir, 'tasks.md'),
        '# Tasks\n\n## Phase 1\n\n- [x] Done task\n- [ ] Todo task 1\n- [ ] Todo task 2'
      );

      const incompleteTasks = await manager.getIncompleteTasks(projectDir);

      expect(incompleteTasks.length).toBe(2);
      expect(incompleteTasks[0]).toContain('Todo task 1');
      expect(incompleteTasks[1]).toContain('Todo task 2');
    });

    it('should return empty array for completed projects', async () => {
      const projectDir = path.join(outputsDir, 'all-done');
      await fs.ensureDir(projectDir);
      await fs.writeFile(path.join(projectDir, 'full-prd.md'), '# Test PRD');
      await fs.writeFile(
        path.join(projectDir, 'tasks.md'),
        '# Tasks\n\n## Phase 1\n\n- [x] Task 1\n- [x] Task 2'
      );

      const incompleteTasks = await manager.getIncompleteTasks(projectDir);

      expect(incompleteTasks).toEqual([]);
    });
  });

  describe('error handling', () => {
    it('should handle non-existent project gracefully', async () => {
      const result = await manager.archiveProject('does-not-exist');

      expect(result.success).toBe(false);
      expect(result.message).toContain('not found');
    });

    it('should detect already archived projects', async () => {
      // Create and archive a project
      const projectDir = path.join(outputsDir, 'already-archived');
      await fs.ensureDir(projectDir);
      await fs.writeFile(path.join(projectDir, 'full-prd.md'), '# Test PRD');
      await fs.writeFile(
        path.join(projectDir, 'tasks.md'),
        '# Tasks\n\n## Phase 1\n\n- [x] Task 1'
      );

      await manager.archiveProject('already-archived');

      // Try to archive again
      const result = await manager.archiveProject('already-archived');

      expect(result.success).toBe(false);
    });

    it('should prevent duplicate archives', async () => {
      // Create and archive a project
      const projectDir = path.join(outputsDir, 'duplicate-archive');
      await fs.ensureDir(projectDir);
      await fs.writeFile(path.join(projectDir, 'full-prd.md'), '# Test PRD');
      await fs.writeFile(
        path.join(projectDir, 'tasks.md'),
        '# Tasks\n\n## Phase 1\n\n- [x] Task 1'
      );

      await manager.archiveProject('duplicate-archive');

      // Create another project with the same name
      const newProjectDir = path.join(outputsDir, 'duplicate-archive');
      await fs.ensureDir(newProjectDir);
      await fs.writeFile(path.join(newProjectDir, 'full-prd.md'), '# New PRD');
      await fs.writeFile(
        path.join(newProjectDir, 'tasks.md'),
        '# Tasks\n\n## Phase 1\n\n- [x] Task 1'
      );

      // Try to archive again
      const result = await manager.archiveProject('duplicate-archive');

      expect(result.success).toBe(false);
      expect(result.message).toContain('already contains');
    });
  });

  describe('project sorting', () => {
    it('should sort projects by modification time', async () => {
      // Create multiple projects
      const project1 = path.join(outputsDir, 'project-1');
      await fs.ensureDir(project1);
      await fs.writeFile(path.join(project1, 'full-prd.md'), '# PRD 1');

      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 10));

      const project2 = path.join(outputsDir, 'project-2');
      await fs.ensureDir(project2);
      await fs.writeFile(path.join(project2, 'full-prd.md'), '# PRD 2');

      const projects = await manager.listPrdProjects();

      // Most recent should be first
      expect(projects[0].name).toBe('project-2');
      expect(projects[1].name).toBe('project-1');
    });
  });
});
