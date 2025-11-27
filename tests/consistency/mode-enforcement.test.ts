import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { describe, it, expect, beforeAll } from '@jest/globals';

// ESM module path resolution
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../..');

/**
 * Mode Enforcement Consistency Tests (v5 Agentic-First)
 *
 * These tests verify that:
 * 1. Unified improve.md template has strong "STOP" instructions
 * 2. No references to the removed /clavix:prompts slash command exist
 * 3. Agent connectors have consistent mode enforcement sections
 * 4. No references to removed CLI commands (clavix execute, clavix prompts)
 */

describe('Mode Enforcement Consistency', () => {
  const templatesDir = path.join(ROOT_DIR, 'src/templates/slash-commands/_canonical');
  const agentsDir = path.join(ROOT_DIR, 'src/templates/agents');

  describe('Unified Improve Template (improve.md)', () => {
    let improveTemplate: string;

    beforeAll(async () => {
      improveTemplate = await fs.readFile(path.join(templatesDir, 'improve.md'), 'utf-8');
    });

    it('improve.md has STOP instruction at top', () => {
      // Should have the stop header near the beginning (within first 2000 chars)
      const topSection = improveTemplate.slice(0, 2000);
      expect(topSection).toContain('STOP');
      expect(topSection).toContain('OPTIMIZATION MODE');
      expect(topSection).toContain('NOT IMPLEMENTATION');
    });

    it('improve.md has explicit forbidden actions section', () => {
      expect(improveTemplate).toContain('ALL FORBIDDEN');
      expect(improveTemplate).toContain('Writing any code files');
      expect(improveTemplate).toContain('Exploring the codebase');
    });

    it('improve.md tells agent to run /clavix:implement for implementation', () => {
      expect(improveTemplate).toContain('/clavix:implement');
      expect(improveTemplate).toContain('--latest');
    });

    it('improve.md has verification requirements (v5)', () => {
      // v5: Uses Read tool verification, not CLI
      expect(improveTemplate).toContain('VERIFICATION (REQUIRED');
      // v5: Uses Read tool to verify file exists, not CLI
      expect(improveTemplate).toMatch(/Read tool|verify.*file|file exists/i);
    });

    it('improve.md has required response ending instruction', () => {
      expect(improveTemplate).toContain('Your response MUST end with');
      expect(improveTemplate).toContain('Prompt saved to:');
    });

    it('improve.md supports both standard and comprehensive depth', () => {
      expect(improveTemplate).toContain('Standard Depth');
      expect(improveTemplate).toContain('Comprehensive Depth');
    });

    it('improve.md has smart depth selection logic', () => {
      expect(improveTemplate).toContain('Quality Score >= 75%');
      expect(improveTemplate).toContain('Quality Score 60-74%');
      expect(improveTemplate).toContain('Quality Score < 60%');
    });
  });

  describe('Removed /clavix:prompts References', () => {
    it('prompts.md no longer exists in _canonical/', async () => {
      const promptsPath = path.join(templatesDir, 'prompts.md');
      const exists = await fs.pathExists(promptsPath);
      expect(exists).toBe(false);
    });

    it('no templates reference /clavix:prompts as slash command', async () => {
      const templateFiles = await fs.readdir(templatesDir);
      const mdFiles = templateFiles.filter((f) => f.endsWith('.md'));

      for (const file of mdFiles) {
        const content = await fs.readFile(path.join(templatesDir, file), 'utf-8');
        // Should not reference /clavix:prompts (the removed slash command)
        expect(content).not.toContain('/clavix:prompts');
      }
    });

    it('v5.1: No CLI command references for prompts (agentic-first)', async () => {
      const implementTemplate = await fs.readFile(path.join(templatesDir, 'implement.md'), 'utf-8');

      // v5.1: prompts CLI commands were removed - agents use tools directly
      // The templates should reference agent tools (Read, Write, Glob), not CLI
      expect(implementTemplate).not.toContain('clavix prompts list');
      expect(implementTemplate).not.toContain('clavix prompts clear');
    });
  });

  describe('Agent Connector Mode Enforcement', () => {
    const connectorFiles = ['octo.md', 'agents.md', 'copilot-instructions.md', 'warp.md'];

    it.each(connectorFiles)('%s has mode enforcement section', async (file) => {
      const filePath = path.join(agentsDir, file);
      if (await fs.pathExists(filePath)) {
        const content = await fs.readFile(filePath, 'utf-8');

        // Should have v5 mode enforcement
        expect(content).toContain('MODE ENFORCEMENT');
        expect(content).toContain('OPTIMIZATION workflows');
        expect(content).toContain('PLANNING workflows');
        expect(content).toContain('IMPLEMENTATION workflows');
      }
    });

    it.each(connectorFiles)('%s has STOP instruction for optimization mode', async (file) => {
      const filePath = path.join(agentsDir, file);
      if (await fs.pathExists(filePath)) {
        const content = await fs.readFile(filePath, 'utf-8');

        // Optimization workflows should mention STOP
        expect(content).toContain('STOP');
        expect(content).toContain('/clavix:implement');
      }
    });
  });

  describe('Navigation Consistency', () => {
    const workflowTemplates = [
      'improve.md',
      'prd.md',
      'plan.md',
      'implement.md',
      'start.md',
      'summarize.md',
      'archive.md',
      'verify.md',
    ];

    it.each(workflowTemplates)('%s does not list /clavix:prompts in navigation', async (file) => {
      const content = await fs.readFile(path.join(templatesDir, file), 'utf-8');

      // Navigation sections should not reference the removed command
      if (content.includes('Related commands') || content.includes('Workflow Navigation')) {
        expect(content).not.toContain('/clavix:prompts');
      }
    });
  });

  describe('v5: No .index.json References', () => {
    const workflowTemplates = ['improve.md', 'implement.md'];

    it.each(workflowTemplates)('%s does not reference .index.json', async (file) => {
      const content = await fs.readFile(path.join(templatesDir, file), 'utf-8');

      // v5: .index.json was removed, prompts use frontmatter metadata
      expect(content).not.toContain('.index.json');
    });
  });
});
