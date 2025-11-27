import * as path from 'path';
import { FileSystem } from '../utils/file-system.js';
import { DataError } from '../types/errors.js';

export interface ManagedBlockOptions {
  startMarker: string;
  endMarker: string;
  content: string;
  createIfMissing?: boolean;
  validateMarkdown?: boolean;
}

/**
 * DocInjector - manages injection and updating of managed blocks in documentation files
 */
export class DocInjector {
  private static readonly DEFAULT_START_MARKER = '<!-- CLAVIX:START -->';
  private static readonly DEFAULT_END_MARKER = '<!-- CLAVIX:END -->';

  /**
   * Inject or update managed block in a file
   */
  static async injectBlock(
    filePath: string,
    content: string,
    options?: Partial<ManagedBlockOptions>
  ): Promise<void> {
    const opts: ManagedBlockOptions = {
      startMarker: options?.startMarker || this.DEFAULT_START_MARKER,
      endMarker: options?.endMarker || this.DEFAULT_END_MARKER,
      content,
      createIfMissing: options?.createIfMissing ?? true,
      validateMarkdown: options?.validateMarkdown ?? true,
    };

    const fullPath = path.resolve(filePath);
    let fileContent = '';

    // Read existing file or create new
    if (await FileSystem.exists(fullPath)) {
      fileContent = await FileSystem.readFile(fullPath);
    } else if (!opts.createIfMissing) {
      throw new DataError(
        `File not found: ${filePath}`,
        'Set createIfMissing: true to create the file automatically'
      );
    }

    // Build the managed block
    const blockRegex = new RegExp(
      `${this.escapeRegex(opts.startMarker)}[\\s\\S]*?${this.escapeRegex(opts.endMarker)}`,
      'g'
    );

    const wrappedContent = this.wrapContent(opts.content, opts.startMarker, opts.endMarker);

    if (blockRegex.test(fileContent)) {
      // Replace existing block
      await FileSystem.backup(fullPath);
      fileContent = fileContent.replace(blockRegex, wrappedContent);
    } else {
      // Append new block
      if (fileContent && !fileContent.endsWith('\n\n')) {
        fileContent += '\n\n';
      }
      fileContent += wrappedContent + '\n';
    }

    // Validate markdown if requested
    if (opts.validateMarkdown) {
      this.validateMarkdown(fileContent);
    }

    try {
      // Ensure parent directory exists
      const dir = path.dirname(fullPath);
      await FileSystem.ensureDir(dir);

      await FileSystem.writeFileAtomic(fullPath, fileContent);
    } catch (error) {
      // Attempt to restore backup
      if (await FileSystem.exists(`${fullPath}.backup`)) {
        await FileSystem.restoreBackup(fullPath);
      }
      throw error;
    }
  }

  /**
   * Detect if file contains managed block
   */
  static async hasBlock(
    filePath: string,
    startMarker?: string,
    endMarker?: string
  ): Promise<boolean> {
    const start = startMarker || this.DEFAULT_START_MARKER;
    const end = endMarker || this.DEFAULT_END_MARKER;

    if (!(await FileSystem.exists(filePath))) {
      return false;
    }

    const content = await FileSystem.readFile(filePath);
    const blockRegex = new RegExp(
      `${this.escapeRegex(start)}[\\s\\S]*?${this.escapeRegex(end)}`,
      'g'
    );

    return blockRegex.test(content);
  }

  /**
   * Extract content from managed block
   */
  static async extractBlock(
    filePath: string,
    startMarker?: string,
    endMarker?: string
  ): Promise<string | null> {
    const start = startMarker || this.DEFAULT_START_MARKER;
    const end = endMarker || this.DEFAULT_END_MARKER;

    if (!(await FileSystem.exists(filePath))) {
      return null;
    }

    const content = await FileSystem.readFile(filePath);
    const blockRegex = new RegExp(
      `${this.escapeRegex(start)}([\\s\\S]*?)${this.escapeRegex(end)}`,
      'g'
    );

    const match = blockRegex.exec(content);
    return match ? match[1].trim() : null;
  }

  /**
   * Remove managed block from file
   */
  static async removeBlock(
    filePath: string,
    startMarker?: string,
    endMarker?: string
  ): Promise<void> {
    const start = startMarker || this.DEFAULT_START_MARKER;
    const end = endMarker || this.DEFAULT_END_MARKER;

    if (!(await FileSystem.exists(filePath))) {
      return;
    }

    const content = await FileSystem.readFile(filePath);
    const blockRegex = new RegExp(
      `${this.escapeRegex(start)}[\\s\\S]*?${this.escapeRegex(end)}\\n?`,
      'g'
    );

    if (blockRegex.test(content)) {
      await FileSystem.backup(filePath);
      const updated = content.replace(blockRegex, '');
      await FileSystem.writeFileAtomic(filePath, updated);
    }
  }

  /**
   * Wrap content with markers
   */
  private static wrapContent(content: string, startMarker: string, endMarker: string): string {
    return `${startMarker}\n${content}\n${endMarker}`;
  }

  /**
   * Escape special regex characters
   */
  private static escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Basic markdown validation
   */
  private static validateMarkdown(content: string): void {
    // Check for balanced code blocks
    const codeBlockMarkers = (content.match(/```/g) || []).length;
    if (codeBlockMarkers % 2 !== 0) {
      throw new DataError('Invalid markdown: Unbalanced code blocks');
    }

    // Check for balanced brackets
    const openBrackets = (content.match(/\[/g) || []).length;
    const closeBrackets = (content.match(/\]/g) || []).length;
    if (openBrackets !== closeBrackets) {
      console.warn('Warning: Unbalanced brackets in markdown');
    }
  }

  /**
   * Create default AGENTS.md content
   * v5.1: Updated for consolidated implement command
   */
  static getDefaultAgentsContent(): string {
    return `# AI Agent Instructions

This file contains instructions for AI agents working with this project.

<!-- CLAVIX:START -->
# Clavix - Prompt Improvement Assistant

Clavix is installed in this project. Use the following slash commands:

- \`/clavix:improve [prompt]\` - Optimize prompts with smart depth auto-selection
- \`/clavix:prd\` - Generate a PRD through guided questions
- \`/clavix:start\` - Start conversational mode for iterative refinement
- \`/clavix:summarize\` - Extract optimized prompt from conversation

**When to use:**
- **Standard depth**: Quick cleanup for simple, clear prompts
- **Comprehensive depth**: Thorough analysis for complex requirements
- **PRD mode**: Strategic planning with architecture and business impact

Clavix automatically selects the appropriate depth based on your prompt quality.

For more information, run \`clavix --help\` in your terminal.
<!-- CLAVIX:END -->
`;
  }

  /**
   * Create the CLAUDE.md block content (without file wrapper)
   * This is the single source of truth for Claude Code documentation
   * v5.1: Consolidated execute into implement, removed prompts command
   */
  static getClaudeBlockContent(): string {
    return `## Clavix Integration

This project uses Clavix for prompt improvement and PRD generation. The following slash commands are available:

### Prompt Optimization

#### /clavix:improve [prompt]
Optimize prompts with smart depth auto-selection. Clavix analyzes your prompt quality and automatically selects the appropriate depth (standard or comprehensive). Use for all prompt optimization needs.

### PRD & Planning

#### /clavix:prd
Launch the PRD generation workflow. Clavix will guide you through strategic questions and generate both a comprehensive PRD and a quick-reference version optimized for AI consumption.

#### /clavix:plan
Generate an optimized implementation task breakdown from your PRD. Creates a phased task plan with dependencies and priorities.

#### /clavix:implement
Execute tasks or prompts with AI assistance. Auto-detects source: tasks.md (from PRD workflow) or prompts/ (from improve workflow). Supports automatic git commits and progress tracking.

Use \`--latest\` to execute most recent prompt, \`--tasks\` to force task mode.

### Session Management

#### /clavix:start
Enter conversational mode for iterative prompt development. Discuss your requirements naturally, and later use \`/clavix:summarize\` to extract an optimized prompt.

#### /clavix:summarize
Analyze the current conversation and extract key requirements into a structured prompt and mini-PRD.

### Utility Commands

#### /clavix:verify
Verify implementation against checklist. Run automated checks and generate pass/fail reports.

#### /clavix:archive
Archive completed projects. Move finished PRDs and outputs to the archive for future reference.

**When to use which mode:**
- **Improve mode** (\`/clavix:improve\`): Smart prompt optimization with auto-depth selection
- **PRD mode** (\`/clavix:prd\`): Strategic planning with architecture and business impact

**Recommended Workflow:**
1. Start with \`/clavix:prd\` or \`/clavix:start\` for complex features
2. Generate tasks with \`/clavix:plan\`
3. Implement with \`/clavix:implement\`
4. Verify with \`/clavix:verify\`
5. Archive when complete with \`/clavix:archive\`

**Pro tip**: Start complex features with \`/clavix:prd\` or \`/clavix:start\` to ensure clear requirements before implementation.`;
  }

  /**
   * Create default CLAUDE.md content for Claude Code
   */
  static getDefaultClaudeContent(): string {
    return `# Claude Code Instructions

<!-- CLAVIX:START -->
${this.getClaudeBlockContent()}
<!-- CLAVIX:END -->
`;
  }
}
