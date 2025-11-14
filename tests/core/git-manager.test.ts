/**
 * GitManager and CommitScheduler tests
 */

import { GitManager, CommitScheduler, CommitOptions, CommitStrategy } from '../../src/core/git-manager';
import { exec } from 'child_process';
import { promisify } from 'util';

// Mock child_process
jest.mock('child_process', () => ({
  exec: jest.fn(),
}));

const execAsync = promisify(exec);

describe('GitManager', () => {
  let manager: GitManager;
  let mockExec: jest.MockedFunction<typeof exec>;

  beforeEach(() => {
    manager = new GitManager();
    mockExec = exec as jest.MockedFunction<typeof exec>;
    jest.clearAllMocks();
  });

  describe('isGitRepository', () => {
    it('should return true when in a git repository', async () => {
      mockExec.mockImplementation(((cmd: string, callback: Function) => {
        callback(null, { stdout: '.git\n', stderr: '' });
      }) as any);

      const result = await manager.isGitRepository();

      expect(result).toBe(true);
      expect(mockExec).toHaveBeenCalledWith('git rev-parse --git-dir', expect.any(Function));
    });

    it('should return false when not in a git repository', async () => {
      mockExec.mockImplementation(((cmd: string, callback: Function) => {
        callback(new Error('not a git repository'), null);
      }) as any);

      const result = await manager.isGitRepository();

      expect(result).toBe(false);
    });
  });

  describe('hasUncommittedChanges', () => {
    it('should return true when there are uncommitted changes', async () => {
      mockExec.mockImplementation(((cmd: string, callback: Function) => {
        callback(null, { stdout: ' M file.txt\n', stderr: '' });
      }) as any);

      const result = await manager.hasUncommittedChanges();

      expect(result).toBe(true);
      expect(mockExec).toHaveBeenCalledWith('git status --porcelain', expect.any(Function));
    });

    it('should return false when there are no uncommitted changes', async () => {
      mockExec.mockImplementation(((cmd: string, callback: Function) => {
        callback(null, { stdout: '', stderr: '' });
      }) as any);

      const result = await manager.hasUncommittedChanges();

      expect(result).toBe(false);
    });

    it('should return false on git error', async () => {
      mockExec.mockImplementation(((cmd: string, callback: Function) => {
        callback(new Error('git error'), null);
      }) as any);

      const result = await manager.hasUncommittedChanges();

      expect(result).toBe(false);
    });
  });

  describe('createCommit', () => {
    it('should create a commit with task descriptions', async () => {
      // Mock git status --porcelain (has changes)
      // Mock git add .
      // Mock git commit
      let callCount = 0;
      mockExec.mockImplementation(((cmd: string, callback: Function) => {
        callCount++;
        if (callCount === 1) {
          // git status --porcelain
          callback(null, { stdout: ' M file.txt\n', stderr: '' });
        } else if (callCount === 2) {
          // git add .
          callback(null, { stdout: '', stderr: '' });
        } else if (callCount === 3) {
          // git commit
          callback(null, { stdout: '[main abc123] commit message\n', stderr: '' });
        }
      }) as any);

      const options: CommitOptions = {
        tasks: ['Implement feature X', 'Fix bug Y'],
      };

      const result = await manager.createCommit(options);

      expect(result).toBe(true);
      expect(mockExec).toHaveBeenCalledTimes(3);
      expect(mockExec).toHaveBeenNthCalledWith(2, 'git add .', expect.any(Function));
    });

    it('should not commit when there are no changes', async () => {
      mockExec.mockImplementation(((cmd: string, callback: Function) => {
        callback(null, { stdout: '', stderr: '' });
      }) as any);

      const options: CommitOptions = {
        tasks: ['Task 1'],
      };

      const result = await manager.createCommit(options);

      expect(result).toBe(false);
      expect(mockExec).toHaveBeenCalledTimes(1); // Only status check
    });

    it('should include phase in commit message', async () => {
      let callCount = 0;
      let commitMessage = '';
      mockExec.mockImplementation(((cmd: string, callback: Function) => {
        callCount++;
        if (callCount === 1) {
          callback(null, { stdout: ' M file.txt\n', stderr: '' });
        } else if (callCount === 2) {
          callback(null, { stdout: '', stderr: '' });
        } else if (callCount === 3) {
          commitMessage = cmd;
          callback(null, { stdout: '[main abc123] commit\n', stderr: '' });
        }
      }) as any);

      const options: CommitOptions = {
        tasks: ['Task 1'],
        phase: 'Phase 1: Setup',
      };

      await manager.createCommit(options);

      expect(commitMessage).toContain('Phase 1: Setup');
    });

    it('should include project name in commit message', async () => {
      let callCount = 0;
      let commitMessage = '';
      mockExec.mockImplementation(((cmd: string, callback: Function) => {
        callCount++;
        if (callCount === 1) {
          callback(null, { stdout: ' M file.txt\n', stderr: '' });
        } else if (callCount === 2) {
          callback(null, { stdout: '', stderr: '' });
        } else if (callCount === 3) {
          commitMessage = cmd;
          callback(null, { stdout: '[main abc123] commit\n', stderr: '' });
        }
      }) as any);

      const options: CommitOptions = {
        tasks: ['Task 1'],
        projectName: 'My Project',
      };

      await manager.createCommit(options);

      expect(commitMessage).toContain('My Project');
    });

    it('should handle commit failures gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      let callCount = 0;
      mockExec.mockImplementation(((cmd: string, callback: Function) => {
        callCount++;
        if (callCount === 1) {
          callback(null, { stdout: ' M file.txt\n', stderr: '' });
        } else if (callCount === 2) {
          callback(null, { stdout: '', stderr: '' });
        } else if (callCount === 3) {
          callback(new Error('Commit failed'), null);
        }
      }) as any);

      const options: CommitOptions = {
        tasks: ['Task 1'],
      };

      const result = await manager.createCommit(options);

      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Git commit failed:', expect.any(Error));

      consoleErrorSpy.mockRestore();
    });

    it('should escape special characters in commit message', async () => {
      let callCount = 0;
      let commitCommand = '';
      mockExec.mockImplementation(((cmd: string, callback: Function) => {
        callCount++;
        if (callCount === 1) {
          callback(null, { stdout: ' M file.txt\n', stderr: '' });
        } else if (callCount === 2) {
          callback(null, { stdout: '', stderr: '' });
        } else if (callCount === 3) {
          commitCommand = cmd;
          callback(null, { stdout: '[main abc123] commit\n', stderr: '' });
        }
      }) as any);

      const options: CommitOptions = {
        tasks: ['Task with "quotes"'],
      };

      await manager.createCommit(options);

      // Check that quotes are escaped
      expect(commitCommand).toContain('\\"');
    });
  });

  describe('getCurrentBranch', () => {
    it('should return current branch name', async () => {
      mockExec.mockImplementation(((cmd: string, callback: Function) => {
        callback(null, { stdout: 'main\n', stderr: '' });
      }) as any);

      const branch = await manager.getCurrentBranch();

      expect(branch).toBe('main');
      expect(mockExec).toHaveBeenCalledWith('git rev-parse --abbrev-ref HEAD', expect.any(Function));
    });

    it('should return "unknown" on error', async () => {
      mockExec.mockImplementation(((cmd: string, callback: Function) => {
        callback(new Error('git error'), null);
      }) as any);

      const branch = await manager.getCurrentBranch();

      expect(branch).toBe('unknown');
    });

    it('should trim whitespace from branch name', async () => {
      mockExec.mockImplementation(((cmd: string, callback: Function) => {
        callback(null, { stdout: '  feature-branch  \n', stderr: '' });
      }) as any);

      const branch = await manager.getCurrentBranch();

      expect(branch).toBe('feature-branch');
    });
  });

  describe('isWorkingDirectoryClean', () => {
    it('should return true when directory is clean', async () => {
      mockExec.mockImplementation(((cmd: string, callback: Function) => {
        callback(null, { stdout: '', stderr: '' });
      }) as any);

      const isClean = await manager.isWorkingDirectoryClean();

      expect(isClean).toBe(true);
    });

    it('should return false when there are uncommitted changes', async () => {
      mockExec.mockImplementation(((cmd: string, callback: Function) => {
        callback(null, { stdout: ' M file.txt\n', stderr: '' });
      }) as any);

      const isClean = await manager.isWorkingDirectoryClean();

      expect(isClean).toBe(false);
    });
  });

  describe('getStatus', () => {
    it('should return git status output', async () => {
      mockExec.mockImplementation(((cmd: string, callback: Function) => {
        callback(null, { stdout: ' M file.txt\n?? new-file.txt\n', stderr: '' });
      }) as any);

      const status = await manager.getStatus();

      expect(status).toBe('M file.txt\n?? new-file.txt');
      expect(mockExec).toHaveBeenCalledWith('git status --short', expect.any(Function));
    });

    it('should return error message on failure', async () => {
      mockExec.mockImplementation(((cmd: string, callback: Function) => {
        callback(new Error('git error'), null);
      }) as any);

      const status = await manager.getStatus();

      expect(status).toBe('Unable to get git status');
    });
  });

  describe('validateGitSetup', () => {
    it('should return complete git setup information', async () => {
      let callCount = 0;
      mockExec.mockImplementation(((cmd: string, callback: Function) => {
        callCount++;
        if (callCount === 1) {
          // git rev-parse --git-dir
          callback(null, { stdout: '.git\n', stderr: '' });
        } else if (callCount === 2) {
          // git status --porcelain
          callback(null, { stdout: ' M file.txt\n', stderr: '' });
        } else if (callCount === 3) {
          // git rev-parse --abbrev-ref HEAD
          callback(null, { stdout: 'main\n', stderr: '' });
        }
      }) as any);

      const setup = await manager.validateGitSetup();

      expect(setup).toEqual({
        isRepo: true,
        hasChanges: true,
        currentBranch: 'main',
      });
    });

    it('should handle non-git directory', async () => {
      mockExec.mockImplementation(((cmd: string, callback: Function) => {
        callback(new Error('not a git repository'), null);
      }) as any);

      const setup = await manager.validateGitSetup();

      expect(setup.isRepo).toBe(false);
      expect(setup.currentBranch).toBe('');
    });
  });
});

describe('CommitScheduler', () => {
  describe('per-task strategy', () => {
    it('should commit after every task', () => {
      const scheduler = new CommitScheduler('per-task');

      expect(scheduler.taskCompleted('Phase 1')).toBe(true);
      scheduler.resetCommitCounter();

      expect(scheduler.taskCompleted('Phase 1')).toBe(true);
      scheduler.resetCommitCounter();

      expect(scheduler.taskCompleted('Phase 2')).toBe(true);
    });
  });

  describe('per-5-tasks strategy', () => {
    it('should commit after every 5 tasks', () => {
      const scheduler = new CommitScheduler('per-5-tasks');

      expect(scheduler.taskCompleted('Phase 1')).toBe(false);
      expect(scheduler.taskCompleted('Phase 1')).toBe(false);
      expect(scheduler.taskCompleted('Phase 1')).toBe(false);
      expect(scheduler.taskCompleted('Phase 1')).toBe(false);
      expect(scheduler.taskCompleted('Phase 1')).toBe(true);

      scheduler.resetCommitCounter();

      expect(scheduler.taskCompleted('Phase 2')).toBe(false);
      expect(scheduler.taskCompleted('Phase 2')).toBe(false);
      expect(scheduler.taskCompleted('Phase 2')).toBe(false);
      expect(scheduler.taskCompleted('Phase 2')).toBe(false);
      expect(scheduler.taskCompleted('Phase 2')).toBe(true);
    });

    it('should track task count correctly', () => {
      const scheduler = new CommitScheduler('per-5-tasks');

      scheduler.taskCompleted('Phase 1');
      expect(scheduler.getTaskCountSinceLastCommit()).toBe(1);

      scheduler.taskCompleted('Phase 1');
      expect(scheduler.getTaskCountSinceLastCommit()).toBe(2);

      scheduler.taskCompleted('Phase 1');
      scheduler.taskCompleted('Phase 1');
      scheduler.taskCompleted('Phase 1');
      expect(scheduler.getTaskCountSinceLastCommit()).toBe(5);

      scheduler.resetCommitCounter();
      expect(scheduler.getTaskCountSinceLastCommit()).toBe(0);
    });
  });

  describe('per-phase strategy', () => {
    it('should not commit on task completion', () => {
      const scheduler = new CommitScheduler('per-phase');

      expect(scheduler.taskCompleted('Phase 1')).toBe(false);
      expect(scheduler.taskCompleted('Phase 1')).toBe(false);
      expect(scheduler.taskCompleted('Phase 1')).toBe(false);
    });

    it('should commit when phase is completed', () => {
      const scheduler = new CommitScheduler('per-phase');

      scheduler.taskCompleted('Phase 1');
      scheduler.taskCompleted('Phase 1');
      scheduler.taskCompleted('Phase 1');

      expect(scheduler.phaseCompleted()).toBe(true);
    });

    it('should not commit for phase completion with other strategies', () => {
      const schedulerTask = new CommitScheduler('per-task');
      const scheduler5 = new CommitScheduler('per-5-tasks');
      const schedulerNone = new CommitScheduler('none');

      expect(schedulerTask.phaseCompleted()).toBe(false);
      expect(scheduler5.phaseCompleted()).toBe(false);
      expect(schedulerNone.phaseCompleted()).toBe(false);
    });
  });

  describe('none strategy', () => {
    it('should never commit on task completion', () => {
      const scheduler = new CommitScheduler('none');

      expect(scheduler.taskCompleted('Phase 1')).toBe(false);
      expect(scheduler.taskCompleted('Phase 1')).toBe(false);
      expect(scheduler.taskCompleted('Phase 2')).toBe(false);
    });

    it('should not commit on phase completion', () => {
      const scheduler = new CommitScheduler('none');

      scheduler.taskCompleted('Phase 1');
      expect(scheduler.phaseCompleted()).toBe(false);
    });
  });

  describe('phase tracking', () => {
    it('should track current phase correctly', () => {
      const scheduler = new CommitScheduler('per-5-tasks');

      scheduler.taskCompleted('Phase 1');
      scheduler.taskCompleted('Phase 1');

      // Switch to Phase 2
      scheduler.taskCompleted('Phase 2');

      // Should still work correctly
      expect(scheduler.taskCompleted('Phase 2')).toBe(false);
    });

    it('should reset phase counter when phase changes', () => {
      const scheduler = new CommitScheduler('per-phase');

      scheduler.taskCompleted('Phase 1');
      scheduler.taskCompleted('Phase 1');

      // Switch phase
      scheduler.taskCompleted('Phase 2');
      scheduler.taskCompleted('Phase 2');

      // Phase completion should work
      expect(scheduler.phaseCompleted()).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle rapid commits in per-task mode', () => {
      const scheduler = new CommitScheduler('per-task');

      for (let i = 0; i < 100; i++) {
        expect(scheduler.taskCompleted('Phase 1')).toBe(true);
        scheduler.resetCommitCounter();
      }
    });

    it('should handle many tasks in per-5-tasks mode', () => {
      const scheduler = new CommitScheduler('per-5-tasks');

      for (let i = 1; i <= 23; i++) {
        const shouldCommit = i % 5 === 0;
        expect(scheduler.taskCompleted('Phase 1')).toBe(shouldCommit);
        if (shouldCommit) {
          scheduler.resetCommitCounter();
        }
      }
    });

    it('should track total tasks across multiple phases', () => {
      const scheduler = new CommitScheduler('per-task');

      scheduler.taskCompleted('Phase 1');
      scheduler.resetCommitCounter();

      scheduler.taskCompleted('Phase 1');
      scheduler.resetCommitCounter();

      scheduler.taskCompleted('Phase 2');
      scheduler.resetCommitCounter();

      scheduler.taskCompleted('Phase 3');

      // Total should be tracked internally
      expect(scheduler.getTaskCountSinceLastCommit()).toBe(1);
    });
  });

  describe('commit counter management', () => {
    it('should reset counter correctly', () => {
      const scheduler = new CommitScheduler('per-5-tasks');

      scheduler.taskCompleted('Phase 1');
      scheduler.taskCompleted('Phase 1');
      scheduler.taskCompleted('Phase 1');

      expect(scheduler.getTaskCountSinceLastCommit()).toBe(3);

      scheduler.resetCommitCounter();

      expect(scheduler.getTaskCountSinceLastCommit()).toBe(0);
    });

    it('should accumulate correctly after reset', () => {
      const scheduler = new CommitScheduler('per-5-tasks');

      scheduler.taskCompleted('Phase 1');
      scheduler.taskCompleted('Phase 1');
      scheduler.resetCommitCounter();

      scheduler.taskCompleted('Phase 1');
      scheduler.taskCompleted('Phase 1');

      expect(scheduler.getTaskCountSinceLastCommit()).toBe(2);
    });
  });
});
