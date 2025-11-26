/**
 * Tests for InstructionsGenerator - .clavix/instructions/ generation
 * Verifies canonical workflow copying
 */

import fs from 'fs-extra';
import * as path from 'path';
import { InstructionsGenerator } from '../../src/core/adapters/instructions-generator';
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('InstructionsGenerator', () => {
  const testDir = path.join(__dirname, '../fixtures/instructions-generator');
  let originalCwd: string;

  beforeEach(async () => {
    await fs.remove(testDir);
    await fs.ensureDir(testDir);
    originalCwd = process.cwd();
    process.chdir(testDir);
  });

  afterEach(async () => {
    process.chdir(originalCwd);
    await fs.remove(testDir);
  });

  describe('generate', () => {
    it('should create .clavix/instructions directory', async () => {
      await InstructionsGenerator.generate();
      const exists = await fs.pathExists('.clavix/instructions');
      expect(exists).toBe(true);
    });

    it('should copy static instruction files (core/, troubleshooting/, README.md)', async () => {
      await InstructionsGenerator.generate();

      // Check core files
      expect(await fs.pathExists('.clavix/instructions/core/clavix-mode.md')).toBe(true);
      expect(await fs.pathExists('.clavix/instructions/core/file-operations.md')).toBe(true);
      expect(await fs.pathExists('.clavix/instructions/core/verification.md')).toBe(true);

      // Check troubleshooting files
      expect(
        await fs.pathExists('.clavix/instructions/troubleshooting/jumped-to-implementation.md')
      ).toBe(true);
      expect(
        await fs.pathExists('.clavix/instructions/troubleshooting/skipped-file-creation.md')
      ).toBe(true);
      expect(await fs.pathExists('.clavix/instructions/troubleshooting/mode-confusion.md')).toBe(
        true
      );

      // Check README
      expect(await fs.pathExists('.clavix/instructions/README.md')).toBe(true);
    });

    // v4.8: verify.md added - now 10 canonical workflows
    it('should copy ALL 10 canonical workflows to .clavix/instructions/workflows/', async () => {
      await InstructionsGenerator.generate();

      const workflowsDir = '.clavix/instructions/workflows';
      expect(await fs.pathExists(workflowsDir)).toBe(true);

      // Check all 10 canonical templates are copied (v4.8: verify.md added)
      const expectedFiles = [
        'archive.md',
        'deep.md',
        'execute.md',
        'fast.md',
        'implement.md',
        'plan.md',
        'prd.md',
        'start.md',
        'summarize.md',
        'verify.md',
      ];

      for (const file of expectedFiles) {
        expect(await fs.pathExists(path.join(workflowsDir, file))).toBe(true);
      }

      // Verify count (v4.8: 10 workflows, verify.md added)
      const files = await fs.readdir(workflowsDir);
      const mdFiles = files.filter((f) => f.endsWith('.md'));
      expect(mdFiles.length).toBe(10);
    });

    it('should copy canonical content correctly (verify fast.md sample)', async () => {
      await InstructionsGenerator.generate();

      const content = await fs.readFile('.clavix/instructions/workflows/fast.md', 'utf-8');
      expect(content).toContain('Clavix Fast Mode');
      expect(content).toContain('Clavix Intelligence™');
      expect(content.length).toBeGreaterThan(1000);
    });

    it('should copy canonical content correctly (verify deep.md sample)', async () => {
      await InstructionsGenerator.generate();

      const content = await fs.readFile('.clavix/instructions/workflows/deep.md', 'utf-8');
      expect(content).toContain('Clavix Deep Mode');
      expect(content).toContain('Clavix Intelligence™');
      expect(content.length).toBeGreaterThan(1000);
    });

    it('should copy canonical content correctly (verify prd.md sample)', async () => {
      await InstructionsGenerator.generate();

      const content = await fs.readFile('.clavix/instructions/workflows/prd.md', 'utf-8');
      expect(content).toContain('Clavix Planning Mode');
      expect(content).toContain('Product Requirements Document');
      expect(content.length).toBeGreaterThan(1000);
    });

    // v4.7: prompts.md removed - CLI-only commands now
    it('should copy new canonical workflows (plan, implement, execute, archive)', async () => {
      await InstructionsGenerator.generate();

      const workflowsDir = '.clavix/instructions/workflows';

      // These files were previously missing from instructions/
      expect(await fs.pathExists(path.join(workflowsDir, 'plan.md'))).toBe(true);
      expect(await fs.pathExists(path.join(workflowsDir, 'implement.md'))).toBe(true);
      expect(await fs.pathExists(path.join(workflowsDir, 'execute.md'))).toBe(true);
      expect(await fs.pathExists(path.join(workflowsDir, 'archive.md'))).toBe(true);
      // v4.7: prompts.md removed - CLI commands documented in execute.md
      expect(await fs.pathExists(path.join(workflowsDir, 'prompts.md'))).toBe(false);
    });

    it('should NOT copy workflows/ directory from src/templates/instructions/ (now empty)', async () => {
      await InstructionsGenerator.generate();

      // Verify workflows came from canonical, not from instructions template
      const content = await fs.readFile('.clavix/instructions/workflows/fast.md', 'utf-8');

      // Canonical fast.md has this header
      expect(content).toContain('Clavix Fast Mode');
      expect(content).toContain('Clavix Intelligence™');
    });
  });

  describe('needsGeneration', () => {
    it('should return true when generic integration selected', () => {
      expect(InstructionsGenerator.needsGeneration(['agents-md'])).toBe(true);
      expect(InstructionsGenerator.needsGeneration(['octo-md'])).toBe(true);
      expect(InstructionsGenerator.needsGeneration(['warp-md'])).toBe(true);
      expect(InstructionsGenerator.needsGeneration(['copilot-instructions'])).toBe(true);
    });

    it('should return false when no generic integrations selected', () => {
      expect(InstructionsGenerator.needsGeneration(['claude-code'])).toBe(false);
      expect(InstructionsGenerator.needsGeneration(['cursor'])).toBe(false);
      expect(InstructionsGenerator.needsGeneration(['windsurf'])).toBe(false);
    });

    it('should return true if ANY generic integration present', () => {
      expect(InstructionsGenerator.needsGeneration(['claude-code', 'agents-md'])).toBe(true);
      expect(InstructionsGenerator.needsGeneration(['cursor', 'octo-md', 'windsurf'])).toBe(true);
    });

    it('should return false when empty array', () => {
      expect(InstructionsGenerator.needsGeneration([])).toBe(false);
    });
  });

  describe('exists', () => {
    it('should return false when directory does not exist', async () => {
      expect(await InstructionsGenerator.exists()).toBe(false);
    });

    it('should return true when directory exists', async () => {
      await InstructionsGenerator.generate();
      expect(await InstructionsGenerator.exists()).toBe(true);
    });
  });

  describe('remove', () => {
    it('should remove .clavix/instructions directory', async () => {
      await InstructionsGenerator.generate();
      expect(await InstructionsGenerator.exists()).toBe(true);

      await InstructionsGenerator.remove();
      expect(await InstructionsGenerator.exists()).toBe(false);
    });

    it('should not error when directory does not exist', async () => {
      await expect(InstructionsGenerator.remove()).resolves.not.toThrow();
    });
  });

  describe('regeneration', () => {
    it('should update workflows when regenerated', async () => {
      // First generation
      await InstructionsGenerator.generate();
      const firstContent = await fs.readFile('.clavix/instructions/workflows/fast.md', 'utf-8');

      // Modify file
      await fs.writeFile('.clavix/instructions/workflows/fast.md', 'MODIFIED');

      // Regenerate
      await InstructionsGenerator.generate();
      const secondContent = await fs.readFile('.clavix/instructions/workflows/fast.md', 'utf-8');

      // Should restore original
      expect(secondContent).toBe(firstContent);
      expect(secondContent).not.toContain('MODIFIED');
    });

    // v4.8: Now 10 workflows (verify.md added)
    it('should maintain all 10 workflows after regeneration', async () => {
      // First generation
      await InstructionsGenerator.generate();

      // Delete a workflow
      await fs.remove('.clavix/instructions/workflows/plan.md');

      // Regenerate
      await InstructionsGenerator.generate();

      // Should restore deleted file
      expect(await fs.pathExists('.clavix/instructions/workflows/plan.md')).toBe(true);

      // Verify still have all 10 (v4.8: verify.md added)
      const files = await fs.readdir('.clavix/instructions/workflows');
      const mdFiles = files.filter((f) => f.endsWith('.md'));
      expect(mdFiles.length).toBe(10);
    });
  });

  describe('constants', () => {
    it('should have correct target directory', () => {
      expect(InstructionsGenerator.TARGET_DIR).toBe('.clavix/instructions');
    });

    it('should have correct generic integrations list', () => {
      expect(InstructionsGenerator.GENERIC_INTEGRATIONS).toEqual([
        'octo-md',
        'warp-md',
        'agents-md',
        'copilot-instructions',
      ]);
    });
  });

  describe('edge cases', () => {
    // v4.8: Now 10 workflows (verify.md added)
    it('should handle multiple generations in sequence', async () => {
      // First generation
      await InstructionsGenerator.generate();
      let files = await fs.readdir('.clavix/instructions/workflows');
      expect(files.filter((f) => f.endsWith('.md')).length).toBe(10);

      // Second generation (should not duplicate)
      await InstructionsGenerator.generate();
      files = await fs.readdir('.clavix/instructions/workflows');
      expect(files.filter((f) => f.endsWith('.md')).length).toBe(10);

      // Third generation
      await InstructionsGenerator.generate();
      files = await fs.readdir('.clavix/instructions/workflows');
      expect(files.filter((f) => f.endsWith('.md')).length).toBe(10);
    });

    it('should preserve core/ and troubleshooting/ files during regeneration', async () => {
      await InstructionsGenerator.generate();

      // Modify a core file
      await fs.appendFile('.clavix/instructions/core/clavix-mode.md', '\n\nMODIFIED');

      // Regenerate
      await InstructionsGenerator.generate();

      // Core file should be restored
      const content = await fs.readFile('.clavix/instructions/core/clavix-mode.md', 'utf-8');
      expect(content).not.toContain('MODIFIED');
    });
  });
});
