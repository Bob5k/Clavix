/**
 * Tests for summarize command functionality
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import { SessionManager } from '../../src/core/session-manager';
import { ConversationAnalyzer } from '../../src/core/conversation-analyzer';
import { PromptOptimizer } from '../../src/core/prompt-optimizer';
import { FileSystem } from '../../src/utils/file-system';

describe('Summarize command', () => {
  const testDir = path.join(__dirname, '../fixtures/test-summarize');
  const sessionDir = path.join(testDir, '.clavix/sessions');
  const outputsDir = path.join(testDir, '.clavix/outputs');
  let manager: SessionManager;
  let analyzer: ConversationAnalyzer;
  let optimizer: PromptOptimizer;
  let originalCwd: string;

  beforeEach(async () => {
    // Clean up and setup
    await fs.remove(testDir);
    await fs.ensureDir(sessionDir);
    await fs.ensureDir(outputsDir);

    // Change to test directory
    originalCwd = process.cwd();
    process.chdir(testDir);

    manager = new SessionManager();
    analyzer = new ConversationAnalyzer();
    optimizer = new PromptOptimizer();
  });

  afterEach(async () => {
    // Restore directory
    process.chdir(originalCwd);

    // Clean up
    await fs.remove(testDir);
  });

  describe('session loading', () => {
    it('should load session by ID', async () => {
      const session = await manager.createSession({ projectName: 'test-project' });
      await manager.saveSession(session);

      const loaded = await manager.getSession(session.id);

      expect(loaded).toBeDefined();
      expect(loaded?.id).toBe(session.id);
      expect(loaded?.projectName).toBe('test-project');
    });

    it('should return null for non-existent session ID', async () => {
      const loaded = await manager.getSession('nonexistent');

      expect(loaded).toBeNull();
    });

    it('should load most recent active session', async () => {
      const session1 = await manager.createSession({ projectName: 'project-1' });
      await manager.saveSession(session1);

      // Wait to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 10));

      const session2 = await manager.createSession({ projectName: 'project-2' });
      await manager.saveSession(session2);

      const active = await manager.getActiveSession();

      expect(active).toBeDefined();
      expect(active?.id).toBe(session2.id);
    });

    it('should return null when no active session exists', async () => {
      const active = await manager.getActiveSession();

      expect(active).toBeNull();
    });
  });

  describe('conversation analysis', () => {
    it('should analyze session with messages', async () => {
      const session = await manager.createSession({ projectName: 'test-project' });
      session.messages = [
        { role: 'user', content: 'Create a user authentication system', timestamp: new Date() },
        { role: 'assistant', content: 'I will create the authentication system', timestamp: new Date() },
        { role: 'user', content: 'Add password reset functionality', timestamp: new Date() },
      ];

      const analysis = analyzer.analyze(session);

      expect(analysis).toBeDefined();
      expect(analysis.keyRequirements).toBeDefined();
      expect(Array.isArray(analysis.keyRequirements)).toBe(true);
    });

    it('should handle session with no messages', async () => {
      const session = await manager.createSession({ projectName: 'empty-project' });
      session.messages = [];

      const analysis = analyzer.analyze(session);

      expect(analysis).toBeDefined();
    });

    it('should extract technical constraints', async () => {
      const session = await manager.createSession({ projectName: 'constrained-project' });
      session.messages = [
        { role: 'user', content: 'Build using React and TypeScript only', timestamp: new Date() },
      ];

      const analysis = analyzer.analyze(session);

      expect(analysis.technicalConstraints).toBeDefined();
      expect(Array.isArray(analysis.technicalConstraints)).toBe(true);
    });
  });

  describe('output generation', () => {
    it('should generate mini-PRD', async () => {
      const session = await manager.createSession({ projectName: 'test-project' });
      session.messages = [
        { role: 'user', content: 'Create a task management app', timestamp: new Date() },
      ];

      const analysis = analyzer.analyze(session);
      const miniPrd = analyzer.generateMiniPrd(session, analysis);

      expect(miniPrd).toBeDefined();
      expect(typeof miniPrd).toBe('string');
      expect(miniPrd.length).toBeGreaterThan(0);
    });

    it('should generate optimized prompt', async () => {
      const session = await manager.createSession({ projectName: 'test-project' });
      session.messages = [
        { role: 'user', content: 'Create a task management app with user authentication', timestamp: new Date() },
      ];

      const analysis = analyzer.analyze(session);
      const optimizedPrompt = analyzer.generateOptimizedPrompt(session, analysis);

      expect(optimizedPrompt).toBeDefined();
      expect(typeof optimizedPrompt).toBe('string');
      expect(optimizedPrompt.length).toBeGreaterThan(0);
    });

    it('should create output directory', async () => {
      const outputPath = path.join(outputsDir, 'test-output');

      await FileSystem.ensureDir(outputPath);

      expect(await fs.pathExists(outputPath)).toBe(true);
    });

    it('should write mini-prd file', async () => {
      const session = await manager.createSession({ projectName: 'test-project' });
      session.messages = [
        { role: 'user', content: 'Build a todo app', timestamp: new Date() },
      ];

      const analysis = analyzer.analyze(session);
      const content = analyzer.generateMiniPrd(session, analysis);
      const outputPath = path.join(outputsDir, 'test-output');
      await FileSystem.ensureDir(outputPath);

      const filePath = path.join(outputPath, 'mini-prd.md');
      await FileSystem.writeFileAtomic(filePath, content);

      expect(await fs.pathExists(filePath)).toBe(true);
      const savedContent = await fs.readFile(filePath, 'utf-8');
      expect(savedContent).toBe(content);
    });

    it('should write optimized prompt file', async () => {
      const session = await manager.createSession({ projectName: 'test-project' });
      session.messages = [
        { role: 'user', content: 'Build a todo app', timestamp: new Date() },
      ];

      const analysis = analyzer.analyze(session);
      const content = analyzer.generateOptimizedPrompt(session, analysis);
      const outputPath = path.join(outputsDir, 'test-output');
      await FileSystem.ensureDir(outputPath);

      const filePath = path.join(outputPath, 'optimized-prompt.md');
      await FileSystem.writeFileAtomic(filePath, content);

      expect(await fs.pathExists(filePath)).toBe(true);
    });
  });

  describe('CLEAR optimization', () => {
    it('should apply CLEAR framework to prompt', () => {
      const prompt = 'Create a user authentication system';

      const result = optimizer.applyCLEARFramework(prompt, 'fast');

      expect(result).toBeDefined();
      expect(result.improvedPrompt).toBeDefined();
      expect(result.conciseness).toBeDefined();
      expect(result.logic).toBeDefined();
      expect(result.explicitness).toBeDefined();
    });

    it('should calculate CLEAR scores', () => {
      const prompt = 'Create a user authentication system';
      const result = optimizer.applyCLEARFramework(prompt, 'fast');

      const score = optimizer.calculateCLEARScore(result);

      expect(score).toBeDefined();
      expect(score.conciseness).toBeDefined();
      expect(score.logic).toBeDefined();
      expect(score.explicitness).toBeDefined();
      expect(score.overall).toBeDefined();
      expect(score.rating).toBeDefined();
    });

    it('should include suggestions in CLEAR result', () => {
      const prompt = 'make a thing that does stuff';
      const result = optimizer.applyCLEARFramework(prompt, 'fast');

      expect(result.conciseness.suggestions).toBeDefined();
      expect(Array.isArray(result.conciseness.suggestions)).toBe(true);
      expect(result.logic.suggestions).toBeDefined();
      expect(Array.isArray(result.logic.suggestions)).toBe(true);
      expect(result.explicitness.suggestions).toBeDefined();
      expect(Array.isArray(result.explicitness.suggestions)).toBe(true);
    });

    it('should generate changes summary', () => {
      const prompt = 'Create a user authentication system';
      const result = optimizer.applyCLEARFramework(prompt, 'fast');

      expect(result.changesSummary).toBeDefined();
      expect(Array.isArray(result.changesSummary)).toBe(true);
    });

    it('should write CLEAR-optimized file', async () => {
      const prompt = 'Create a user authentication system';
      const result = optimizer.applyCLEARFramework(prompt, 'fast');
      const score = optimizer.calculateCLEARScore(result);

      const outputPath = path.join(outputsDir, 'clear-test');
      await FileSystem.ensureDir(outputPath);

      const content = `# CLEAR-Optimized Prompt

${result.improvedPrompt}

---

## CLEAR Framework Assessment

- **[C] Concise**: ${score.conciseness.toFixed(0)}%
- **[L] Logical**: ${score.logic.toFixed(0)}%
- **[E] Explicit**: ${score.explicitness.toFixed(0)}%
- **Overall**: ${score.overall.toFixed(0)}% (${score.rating})
`;

      const filePath = path.join(outputPath, 'clear-optimized-prompt.md');
      await FileSystem.writeFileAtomic(filePath, content);

      expect(await fs.pathExists(filePath)).toBe(true);
      const savedContent = await fs.readFile(filePath, 'utf-8');
      expect(savedContent).toContain('CLEAR-Optimized Prompt');
      expect(savedContent).toContain('CLEAR Framework Assessment');
    });
  });

  describe('project name sanitization', () => {
    it('should sanitize project name for directory', () => {
      const sanitize = (name: string) => {
        return name
          .toLowerCase()
          .replace(/[^a-z0-9-]/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '')
          .substring(0, 50);
      };

      expect(sanitize('My Project')).toBe('my-project');
      expect(sanitize('Project@123')).toBe('project-123');
      expect(sanitize('--Test--')).toBe('test');
    });

    it('should handle long project names', () => {
      const longName = 'a'.repeat(100);
      const sanitize = (name: string) => {
        return name
          .toLowerCase()
          .replace(/[^a-z0-9-]/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '')
          .substring(0, 50);
      };

      const result = sanitize(longName);
      expect(result.length).toBe(50);
    });

    it('should handle special characters', () => {
      const sanitize = (name: string) => {
        return name
          .toLowerCase()
          .replace(/[^a-z0-9-]/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '')
          .substring(0, 50);
      };

      expect(sanitize('Project!@#$%Name')).toBe('project-name');
      expect(sanitize('café-résumé')).toBe('caf-r-sum');
    });
  });

  describe('analysis summary display', () => {
    it('should include key requirements in analysis', async () => {
      const session = await manager.createSession({ projectName: 'test-project' });
      session.messages = [
        { role: 'user', content: 'Create authentication with email and password', timestamp: new Date() },
        { role: 'user', content: 'Add password reset via email', timestamp: new Date() },
      ];

      const analysis = analyzer.analyze(session);

      expect(analysis.keyRequirements).toBeDefined();
      expect(Array.isArray(analysis.keyRequirements)).toBe(true);
    });

    it('should include technical constraints in analysis', async () => {
      const session = await manager.createSession({ projectName: 'test-project' });
      session.messages = [
        { role: 'user', content: 'Must use React 18+ and TypeScript', timestamp: new Date() },
      ];

      const analysis = analyzer.analyze(session);

      expect(analysis.technicalConstraints).toBeDefined();
      expect(Array.isArray(analysis.technicalConstraints)).toBe(true);
    });

    it('should include success criteria in analysis', async () => {
      const session = await manager.createSession({ projectName: 'test-project' });
      session.messages = [
        { role: 'user', content: 'Users should be able to login within 2 seconds', timestamp: new Date() },
      ];

      const analysis = analyzer.analyze(session);

      expect(analysis.successCriteria).toBeDefined();
      expect(Array.isArray(analysis.successCriteria)).toBe(true);
    });

    it('should include out of scope items in analysis', async () => {
      const session = await manager.createSession({ projectName: 'test-project' });
      session.messages = [
        { role: 'user', content: 'We will not support social login in v1', timestamp: new Date() },
      ];

      const analysis = analyzer.analyze(session);

      expect(analysis.outOfScope).toBeDefined();
      expect(Array.isArray(analysis.outOfScope)).toBe(true);
    });
  });

  describe('flag handling', () => {
    it('should support custom output directory', async () => {
      const customOutput = path.join(outputsDir, 'custom-location');

      await FileSystem.ensureDir(customOutput);

      expect(await fs.pathExists(customOutput)).toBe(true);
    });

    it('should use default output when no flag specified', () => {
      const projectName = 'test-project';
      const sanitized = projectName
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .substring(0, 50);

      const defaultOutput = path.join('.clavix/outputs', sanitized);

      expect(defaultOutput).toContain('test-project');
    });

    it('should handle skip-clear flag logic', () => {
      const skipClear = false;
      const shouldApplyClear = !skipClear;

      expect(shouldApplyClear).toBe(true);
    });

    it('should skip CLEAR when flag is true', () => {
      const skipClear = true;
      const shouldApplyClear = !skipClear;

      expect(shouldApplyClear).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle session with single message', async () => {
      const session = await manager.createSession({ projectName: 'single-message' });
      session.messages = [
        { role: 'user', content: 'Build a todo app', timestamp: new Date() },
      ];

      const analysis = analyzer.analyze(session);

      expect(analysis).toBeDefined();
    });

    it('should handle very long conversations', async () => {
      const session = await manager.createSession({ projectName: 'long-conversation' });
      session.messages = Array(100).fill(null).map((_, i) => ({
        role: i % 2 === 0 ? 'user' as const : 'assistant' as const,
        content: `Message ${i}`,
        timestamp: new Date(),
      }));

      const analysis = analyzer.analyze(session);

      expect(analysis).toBeDefined();
      expect(session.messages.length).toBe(100);
    });

    it('should handle empty message content gracefully', async () => {
      const session = await manager.createSession({ projectName: 'empty-messages' });
      session.messages = [
        { role: 'user', content: '', timestamp: new Date() },
        { role: 'assistant', content: 'Response', timestamp: new Date() },
      ];

      const analysis = analyzer.analyze(session);

      expect(analysis).toBeDefined();
    });

    it('should handle special characters in messages', async () => {
      const session = await manager.createSession({ projectName: 'special-chars' });
      session.messages = [
        { role: 'user', content: 'Create a system with émojis 🚀 and spëcial çhars', timestamp: new Date() },
      ];

      const analysis = analyzer.analyze(session);

      expect(analysis).toBeDefined();
    });

    it('should handle markdown in messages', async () => {
      const session = await manager.createSession({ projectName: 'markdown-content' });
      session.messages = [
        { role: 'user', content: '# Build a system\n\n- Feature 1\n- Feature 2\n\n**Important**: Use TypeScript', timestamp: new Date() },
      ];

      const analysis = analyzer.analyze(session);
      const miniPrd = analyzer.generateMiniPrd(session, analysis);

      expect(analysis).toBeDefined();
      expect(miniPrd).toBeDefined();
    });
  });

  describe('file system operations', () => {
    it('should create nested output directories', async () => {
      const nestedPath = path.join(outputsDir, 'level1', 'level2', 'level3');

      await FileSystem.ensureDir(nestedPath);

      expect(await fs.pathExists(nestedPath)).toBe(true);
    });

    it('should write files atomically', async () => {
      const testFile = path.join(outputsDir, 'atomic-test.md');
      const content = 'Test content for atomic write';

      await FileSystem.ensureDir(outputsDir);
      await FileSystem.writeFileAtomic(testFile, content);

      expect(await fs.pathExists(testFile)).toBe(true);
      const savedContent = await fs.readFile(testFile, 'utf-8');
      expect(savedContent).toBe(content);
    });

    it('should overwrite existing files', async () => {
      const testFile = path.join(outputsDir, 'overwrite-test.md');

      await FileSystem.ensureDir(outputsDir);
      await FileSystem.writeFileAtomic(testFile, 'Old content');
      await FileSystem.writeFileAtomic(testFile, 'New content');

      const savedContent = await fs.readFile(testFile, 'utf-8');
      expect(savedContent).toBe('New content');
    });
  });
});
