/**
 * Agent-First Execution Consistency Tests
 *
 * These tests ensure all canonical templates follow the agent-first CLI execution model:
 * - Slash commands are for users AND agents to invoke
 * - CLI commands are for AGENTS to execute automatically
 * - Agents should NEVER ask users to run terminal commands
 *
 * CI Failure: If agent-first patterns are violated, tests FAIL.
 */

import { describe, it, expect, beforeAll } from '@jest/globals';
import * as fs from 'fs';
import * as path from 'path';
import glob from 'glob';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '../..');

// Patterns that indicate asking user to run commands (VIOLATION)
const USER_DIRECTED_COMMAND_PATTERNS = [
  // Direct instructions to user
  /Run the following command:/i,
  /Execute this command:/i,
  /Type this in your terminal:/i,
  /Run this in your shell:/i,
  /User should execute:/i,
  /You need to run:/i,
  /Please run:/i,
  /First, run:/i,
  /Then run:/i,

  // Missing "I" or "agent" context
  /\bRun `clavix/i, // "Run `clavix..." without agent context
];

// Patterns that indicate proper agent-first language (GOOD)
const AGENT_FIRST_PATTERNS = [
  /I run/i,
  /I execute/i,
  /I handle/i,
  /I'll run/i,
  /I will run/i,
  /Commands I execute/i,
  /Commands I run/i,
  /I automatically/i,
  /automatically run/i,
  /agent runs/i,
  /agent executes/i,
  /What I'll do/i,
  /What I do/i,
  /I'll help/i,
  /I will help/i,
  /I save/i,
  /I create/i,
  /I verify/i,
  /I find/i,
  /I check/i,
  /I read/i,
  /I load/i,
];

// Exceptions where user-directed language is acceptable
const ACCEPTABLE_CONTEXTS = [
  'you can run', // Offering choice
  'if you want to run', // Optional
  'want me to', // Agent offering
  'you could also', // Offering alternative
  'Ready to', // Call to action
  "let's", // Collaborative
  '/clavix:', // Slash commands are user-invoked
  'Run one of these', // Multiple options
  'agent recovery', // Troubleshooting sections
  'I initialize', // Agent action
  'I run:', // Agent action with colon
  'run `clavix', // Lowercase run (usually "I run")
];

// Files to test
const CANONICAL_TEMPLATES_PATTERN = 'src/templates/slash-commands/_canonical/*.md';

describe('Agent-First Execution Model', () => {
  let templateFiles: string[] = [];
  let fileContents: Map<string, string> = new Map();

  beforeAll(() => {
    // Use project root for reliable file finding across test runs
    templateFiles = glob.sync(CANONICAL_TEMPLATES_PATTERN, { cwd: projectRoot });

    for (const file of templateFiles) {
      const fullPath = path.join(projectRoot, file);
      if (fs.existsSync(fullPath)) {
        fileContents.set(file, fs.readFileSync(fullPath, 'utf-8'));
      }
    }
  });

  describe('User-Directed Command Detection', () => {
    it('should find canonical templates to test', () => {
      expect(templateFiles.length).toBeGreaterThan(0);
    });

    it('should not ask users to run CLI commands directly', () => {
      const violations: string[] = [];

      for (const [file, content] of fileContents) {
        const lines = content.split('\n');
        let inCodeBlock = false;
        let inReferenceSection = false;

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];

          // Track code blocks
          if (line.trim().startsWith('```')) {
            inCodeBlock = !inCodeBlock;
            continue;
          }

          // Track reference sections (agent-facing, not user-facing)
          if (
            line.includes('Commands I Run') ||
            line.includes('Commands I Execute') ||
            line.includes('CLI Reference') ||
            line.includes('Internal Reference') ||
            line.includes('Agent Transparency') ||
            line.includes('Troubleshooting') ||
            line.includes('When Things Go Wrong') ||
            line.includes('Agent recovery')
          ) {
            inReferenceSection = true;
          }
          if (
            inReferenceSection &&
            line.startsWith('## ') &&
            !line.includes('Reference') &&
            !line.includes('Troubleshooting') &&
            !line.includes('When Things')
          ) {
            inReferenceSection = false;
          }

          // Skip code blocks and reference sections
          if (inCodeBlock || inReferenceSection) continue;

          // Check for violations
          for (const pattern of USER_DIRECTED_COMMAND_PATTERNS) {
            if (pattern.test(line)) {
              // Check if it's in acceptable context
              const isAcceptable = ACCEPTABLE_CONTEXTS.some((ctx) =>
                line.toLowerCase().includes(ctx.toLowerCase())
              );

              // Check if it's followed by agent-first language nearby
              const nearbyLines = lines
                .slice(Math.max(0, i - 2), Math.min(lines.length, i + 3))
                .join(' ');
              const hasAgentContext = AGENT_FIRST_PATTERNS.some((p) => p.test(nearbyLines));

              if (!isAcceptable && !hasAgentContext) {
                violations.push(`${file}:${i + 1}: ${line.trim()}`);
              }
            }
          }
        }
      }

      if (violations.length > 0) {
        console.error('\n=== AGENT-FIRST VIOLATION ===');
        console.error('The following lines ask users to run CLI commands directly.');
        console.error('CLI commands should be executed by the agent, not the user.\n');
        console.error(violations.join('\n'));
        console.error('\n=== FIX ===');
        console.error('Change "Run this command: `clavix xyz`" to "I run: `clavix xyz`"');
        console.error('Or move to "Commands I Execute" reference section.\n');
      }

      expect(violations).toHaveLength(0);
    });
  });

  describe('Agent-First Language Presence', () => {
    it('should have agent-first language in each canonical template', () => {
      const templatesWithoutAgentFirst: string[] = [];

      for (const [file, content] of fileContents) {
        const hasAgentFirstLanguage = AGENT_FIRST_PATTERNS.some((pattern) => pattern.test(content));

        if (!hasAgentFirstLanguage) {
          templatesWithoutAgentFirst.push(file);
        }
      }

      if (templatesWithoutAgentFirst.length > 0) {
        console.error('\n=== MISSING AGENT-FIRST LANGUAGE ===');
        console.error('These templates lack agent-first CLI execution patterns:');
        console.error(templatesWithoutAgentFirst.join('\n'));
        console.error('\n=== FIX ===');
        console.error('Add sections like "Commands I Execute" or "I handle this automatically"');
      }

      expect(templatesWithoutAgentFirst).toHaveLength(0);
    });
  });

  describe('CLI Reference Section', () => {
    // Templates that use CLI commands should have a reference section
    // v5.1: execute.md consolidated into implement.md
    const TEMPLATES_REQUIRING_CLI_REFERENCE = [
      'implement.md',
      'verify.md',
      'archive.md',
      'plan.md',
      'improve.md',
    ];

    it('should have CLI reference sections in execution-focused templates', () => {
      const missingCliReference: string[] = [];

      for (const [file, content] of fileContents) {
        const fileName = path.basename(file);

        if (TEMPLATES_REQUIRING_CLI_REFERENCE.includes(fileName)) {
          const hasCliReference =
            content.includes('CLI Reference') ||
            content.includes('Commands I Execute') ||
            content.includes('Commands I Run') ||
            content.includes('Prompt Management (Commands I Run)');

          if (!hasCliReference) {
            missingCliReference.push(file);
          }
        }
      }

      if (missingCliReference.length > 0) {
        console.error('\n=== MISSING CLI REFERENCE SECTION ===');
        console.error('These execution-focused templates lack CLI reference sections:');
        console.error(missingCliReference.join('\n'));
        console.error('\n=== FIX ===');
        console.error('Add: ### CLI Reference (Commands I Execute)');
        console.error('And include the cli-reference.md component.');
      }

      expect(missingCliReference).toHaveLength(0);
    });
  });

  describe('Stop Blocks Compliance', () => {
    // Templates with optimization modes should have stop blocks
    // v4.11: fast.md and deep.md merged into improve.md
    const OPTIMIZATION_TEMPLATES = ['improve.md'];

    it('should have stop blocks in optimization templates', () => {
      const missingStopBlock: string[] = [];

      for (const [file, content] of fileContents) {
        const fileName = path.basename(file);

        if (OPTIMIZATION_TEMPLATES.includes(fileName)) {
          const hasStopBlock =
            content.includes('STOP HERE') ||
            content.includes('My Work is Done') ||
            content.includes('workflow ends');

          if (!hasStopBlock) {
            missingStopBlock.push(file);
          }
        }
      }

      expect(missingStopBlock).toHaveLength(0);
    });
  });

  describe('Mode Enforcement', () => {
    it('should have clear mode assertions in all canonical templates', () => {
      const missingModeAssertion: string[] = [];

      for (const [file, content] of fileContents) {
        const hasModeAssertion =
          content.includes('CLAVIX MODE:') ||
          content.includes("I'm in") ||
          content.includes('I am in');

        if (!hasModeAssertion) {
          missingModeAssertion.push(file);
        }
      }

      expect(missingModeAssertion).toHaveLength(0);
    });
  });
});
