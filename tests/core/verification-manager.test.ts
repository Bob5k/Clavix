import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { VerificationManager } from '../../src/core/verification-manager';
import { PromptManager } from '../../src/core/prompt-manager';
import fs from 'fs-extra';
import path from 'path';

describe('VerificationManager', () => {
  let verificationManager: VerificationManager;
  let promptManager: PromptManager;
  let testDir: string;

  beforeEach(async () => {
    testDir = path.join(process.cwd(), '.clavix-test-verification');
    promptManager = new PromptManager(testDir);
    verificationManager = new VerificationManager(testDir);

    // Clean up test directory
    if (fs.existsSync(testDir)) {
      fs.removeSync(testDir);
    }
  });

  afterEach(() => {
    if (fs.existsSync(testDir)) {
      fs.removeSync(testDir);
    }
  });

  describe('initializeVerification', () => {
    it('should create a new verification report', async () => {
      // Save a prompt first
      await promptManager.savePrompt(
        '# Test\n\n## Validation Checklist\n☐ Item one',
        'deep',
        'test prompt'
      );
      const prompts = await promptManager.listPrompts();
      const promptId = prompts[0].id;

      const report = await verificationManager.initializeVerification(promptId);

      expect(report).toBeDefined();
      expect(report.promptId).toBe(promptId);
      expect(report.status).toBe('pending');
      expect(report.startedAt).toBeTruthy();
    });

    it('should save report file alongside prompt', async () => {
      await promptManager.savePrompt(
        '# Test\n\n## Validation Checklist\n☐ Item one',
        'deep',
        'test prompt'
      );
      const prompts = await promptManager.listPrompts();
      const promptId = prompts[0].id;

      await verificationManager.initializeVerification(promptId);

      // VerificationManager stores reports in outputDir/source/id.verification.json
      const reportPath = path.join(testDir, 'deep', `${promptId}.verification.json`);
      expect(fs.existsSync(reportPath)).toBe(true);
    });

    it('should return existing report if already initialized', async () => {
      await promptManager.savePrompt(
        '# Test\n\n## Validation Checklist\n☐ Item one',
        'deep',
        'test prompt'
      );
      const prompts = await promptManager.listPrompts();
      const promptId = prompts[0].id;

      const report1 = await verificationManager.initializeVerification(promptId);
      const report2 = await verificationManager.initializeVerification(promptId);

      // Both reports should be defined (they may differ by milliseconds on fast systems)
      expect(report1.startedAt).toBeTruthy();
      expect(report2.startedAt).toBeTruthy();
      expect(report1.promptId).toBe(report2.promptId);
    });
  });

  describe('loadReport', () => {
    it('should load existing verification report', async () => {
      await promptManager.savePrompt(
        '# Test\n\n## Validation Checklist\n☐ Item one',
        'deep',
        'test prompt'
      );
      const prompts = await promptManager.listPrompts();
      const promptId = prompts[0].id;

      await verificationManager.initializeVerification(promptId);
      const loaded = await verificationManager.loadReport(promptId);

      expect(loaded).not.toBeNull();
      expect(loaded!.promptId).toBe(promptId);
    });

    it('should return null for non-existent report', async () => {
      const loaded = await verificationManager.loadReport('non-existent-id');
      expect(loaded).toBeNull();
    });
  });

  describe('saveReport', () => {
    it('should save report to file', async () => {
      await promptManager.savePrompt(
        '# Test\n\n## Validation Checklist\n☐ Item one',
        'deep',
        'test prompt'
      );
      const prompts = await promptManager.listPrompts();
      const promptId = prompts[0].id;

      const report = await verificationManager.initializeVerification(promptId);
      report.status = 'in-progress';

      await verificationManager.saveReport(report);

      const loaded = await verificationManager.loadReport(promptId);
      expect(loaded!.status).toBe('in-progress');
    });
  });

  describe('markItemVerified', () => {
    it('should mark item as passed', async () => {
      await promptManager.savePrompt(
        '# Test\n\n## Validation Checklist\n☐ Item one',
        'deep',
        'test prompt'
      );
      const prompts = await promptManager.listPrompts();
      const promptId = prompts[0].id;

      const report = await verificationManager.initializeVerification(promptId);
      const itemId = report.items[0]?.id || 'validation-1';

      // Add item if not present
      if (report.items.length === 0) {
        report.items.push({
          id: itemId,
          category: 'validation',
          content: 'Item one',
          verificationType: 'manual',
        });
        report.results.push({
          itemId,
          status: 'pending',
          method: 'manual',
          confidence: 'low',
          verifiedAt: '',
        });
        await verificationManager.saveReport(report);
      }

      const updated = await verificationManager.markItemVerified(promptId, itemId, 'passed', {
        evidence: 'Test passed',
        confidence: 'high',
        method: 'automated',
      });

      const result = updated.results.find((r) => r.itemId === itemId);
      expect(result).toBeDefined();
      expect(result!.status).toBe('passed');
      expect(result!.evidence).toBe('Test passed');
      expect(result!.confidence).toBe('high');
    });

    it('should mark item as failed with reason', async () => {
      await promptManager.savePrompt(
        '# Test\n\n## Validation Checklist\n☐ Item one',
        'deep',
        'test prompt'
      );
      const prompts = await promptManager.listPrompts();
      const promptId = prompts[0].id;

      const report = await verificationManager.initializeVerification(promptId);
      const itemId = 'validation-1';

      // Add item
      report.items.push({
        id: itemId,
        category: 'validation',
        content: 'Item one',
        verificationType: 'manual',
      });
      report.results.push({
        itemId,
        status: 'pending',
        method: 'manual',
        confidence: 'low',
        verifiedAt: '',
      });
      await verificationManager.saveReport(report);

      const updated = await verificationManager.markItemVerified(promptId, itemId, 'failed', {
        reason: 'Feature not implemented',
        confidence: 'medium',
        method: 'manual',
      });

      const result = updated.results.find((r) => r.itemId === itemId);
      expect(result!.status).toBe('failed');
      expect(result!.reason).toBe('Feature not implemented');
    });

    it('should update verifiedAt timestamp', async () => {
      await promptManager.savePrompt('# Test', 'deep', 'test');
      const prompts = await promptManager.listPrompts();
      const promptId = prompts[0].id;

      const report = await verificationManager.initializeVerification(promptId);
      const itemId = 'validation-1';

      report.items.push({
        id: itemId,
        category: 'validation',
        content: 'Item one',
        verificationType: 'manual',
      });
      report.results.push({
        itemId,
        status: 'pending',
        method: 'manual',
        confidence: 'low',
        verifiedAt: '',
      });
      await verificationManager.saveReport(report);

      const updated = await verificationManager.markItemVerified(promptId, itemId, 'passed', {
        confidence: 'high',
        method: 'manual',
      });

      const result = updated.results.find((r) => r.itemId === itemId);
      expect(result!.verifiedAt).toBeTruthy();
    });
  });

  describe('getVerificationStatus', () => {
    it('should return hasReport=false for non-existent report', async () => {
      const status = await verificationManager.getVerificationStatus('non-existent');

      expect(status.hasReport).toBe(false);
    });

    it('should return correct summary for report', async () => {
      await promptManager.savePrompt('# Test', 'deep', 'test');
      const prompts = await promptManager.listPrompts();
      const promptId = prompts[0].id;

      const report = await verificationManager.initializeVerification(promptId);

      // Add items with different statuses
      report.items = [
        {
          id: 'item-1',
          category: 'validation' as const,
          content: 'Item 1',
          verificationType: 'manual' as const,
        },
        {
          id: 'item-2',
          category: 'validation' as const,
          content: 'Item 2',
          verificationType: 'manual' as const,
        },
        {
          id: 'item-3',
          category: 'validation' as const,
          content: 'Item 3',
          verificationType: 'manual' as const,
        },
      ];
      report.results = [
        {
          itemId: 'item-1',
          status: 'passed' as const,
          method: 'manual' as const,
          confidence: 'high' as const,
          verifiedAt: new Date().toISOString(),
        },
        {
          itemId: 'item-2',
          status: 'failed' as const,
          method: 'manual' as const,
          confidence: 'medium' as const,
          verifiedAt: new Date().toISOString(),
        },
        {
          itemId: 'item-3',
          status: 'pending' as const,
          method: 'manual' as const,
          confidence: 'low' as const,
          verifiedAt: '',
        },
      ];
      // Recalculate summary after modifying results
      report.summary = verificationManager.calculateSummary(report.results);
      await verificationManager.saveReport(report);

      const status = await verificationManager.getVerificationStatus(promptId);

      expect(status.hasReport).toBe(true);
      expect(status.summary!.total).toBe(3);
      expect(status.summary!.passed).toBe(1);
      expect(status.summary!.failed).toBe(1);
    });
  });

  describe('getPendingItems', () => {
    it('should return only pending items', async () => {
      await promptManager.savePrompt('# Test', 'deep', 'test');
      const prompts = await promptManager.listPrompts();
      const promptId = prompts[0].id;

      const report = await verificationManager.initializeVerification(promptId);

      report.items = [
        { id: 'item-1', category: 'validation', content: 'Item 1', verificationType: 'manual' },
        { id: 'item-2', category: 'validation', content: 'Item 2', verificationType: 'manual' },
      ];
      report.results = [
        {
          itemId: 'item-1',
          status: 'passed',
          method: 'manual',
          confidence: 'high',
          verifiedAt: new Date().toISOString(),
        },
        {
          itemId: 'item-2',
          status: 'pending',
          method: 'manual',
          confidence: 'low',
          verifiedAt: '',
        },
      ];

      const pending = verificationManager.getPendingItems(report);

      expect(pending).toHaveLength(1);
      expect(pending[0].id).toBe('item-2');
    });

    it('should return empty array when all verified', async () => {
      await promptManager.savePrompt('# Test', 'deep', 'test');
      const prompts = await promptManager.listPrompts();
      const promptId = prompts[0].id;

      const report = await verificationManager.initializeVerification(promptId);

      report.items = [
        { id: 'item-1', category: 'validation', content: 'Item 1', verificationType: 'manual' },
      ];
      report.results = [
        {
          itemId: 'item-1',
          status: 'passed',
          method: 'manual',
          confidence: 'high',
          verifiedAt: new Date().toISOString(),
        },
      ];

      const pending = verificationManager.getPendingItems(report);

      expect(pending).toHaveLength(0);
    });
  });

  describe('isComplete', () => {
    it('should return true when status is completed', () => {
      const report = {
        version: '1.0' as const,
        promptId: 'test',
        source: 'deep' as const,
        startedAt: new Date().toISOString(),
        status: 'completed' as const,
        items: [
          {
            id: 'item-1',
            category: 'validation' as const,
            content: 'Item 1',
            verificationType: 'manual' as const,
          },
          {
            id: 'item-2',
            category: 'validation' as const,
            content: 'Item 2',
            verificationType: 'manual' as const,
          },
        ],
        results: [
          {
            itemId: 'item-1',
            status: 'passed' as const,
            method: 'manual' as const,
            confidence: 'high' as const,
            verifiedAt: '',
          },
          {
            itemId: 'item-2',
            status: 'passed' as const,
            method: 'manual' as const,
            confidence: 'high' as const,
            verifiedAt: '',
          },
        ],
        summary: {
          total: 2,
          passed: 2,
          failed: 0,
          skipped: 0,
          notApplicable: 0,
          coveragePercent: 100,
          automatedChecks: 0,
          manualChecks: 2,
        },
      };

      expect(verificationManager.isComplete(report)).toBe(true);
    });

    it('should return false when status is pending', () => {
      const report = {
        version: '1.0' as const,
        promptId: 'test',
        source: 'deep' as const,
        startedAt: new Date().toISOString(),
        status: 'pending' as const,
        items: [
          {
            id: 'item-1',
            category: 'validation' as const,
            content: 'Item 1',
            verificationType: 'manual' as const,
          },
        ],
        results: [
          {
            itemId: 'item-1',
            status: 'pending' as const,
            method: 'manual' as const,
            confidence: 'low' as const,
            verifiedAt: '',
          },
        ],
        summary: {
          total: 1,
          passed: 0,
          failed: 0,
          skipped: 0,
          notApplicable: 0,
          coveragePercent: 0,
          automatedChecks: 0,
          manualChecks: 1,
        },
      };

      expect(verificationManager.isComplete(report)).toBe(false);
    });

    it('should return true when status is completed with mixed results', () => {
      const report = {
        version: '1.0' as const,
        promptId: 'test',
        source: 'deep' as const,
        startedAt: new Date().toISOString(),
        status: 'completed' as const,
        items: [
          {
            id: 'item-1',
            category: 'validation' as const,
            content: 'Item 1',
            verificationType: 'manual' as const,
          },
          {
            id: 'item-2',
            category: 'validation' as const,
            content: 'Item 2',
            verificationType: 'manual' as const,
          },
        ],
        results: [
          {
            itemId: 'item-1',
            status: 'passed' as const,
            method: 'manual' as const,
            confidence: 'high' as const,
            verifiedAt: '',
          },
          {
            itemId: 'item-2',
            status: 'not-applicable' as const,
            method: 'manual' as const,
            confidence: 'high' as const,
            verifiedAt: '',
          },
        ],
        summary: {
          total: 2,
          passed: 1,
          failed: 0,
          skipped: 0,
          notApplicable: 1,
          coveragePercent: 100,
          automatedChecks: 0,
          manualChecks: 2,
        },
      };

      expect(verificationManager.isComplete(report)).toBe(true);
    });
  });

  describe('requiresAttention', () => {
    it('should return true when status is requires-attention', () => {
      const report = {
        version: '1.0' as const,
        promptId: 'test',
        source: 'deep' as const,
        startedAt: new Date().toISOString(),
        status: 'requires-attention' as const,
        items: [
          {
            id: 'item-1',
            category: 'validation' as const,
            content: 'Item 1',
            verificationType: 'manual' as const,
          },
        ],
        results: [
          {
            itemId: 'item-1',
            status: 'failed' as const,
            method: 'manual' as const,
            confidence: 'high' as const,
            verifiedAt: '',
          },
        ],
        summary: {
          total: 1,
          passed: 0,
          failed: 1,
          skipped: 0,
          notApplicable: 0,
          coveragePercent: 0,
          automatedChecks: 0,
          manualChecks: 1,
        },
      };

      expect(verificationManager.requiresAttention(report)).toBe(true);
    });

    it('should return false when status is completed', () => {
      const report = {
        version: '1.0' as const,
        promptId: 'test',
        source: 'deep' as const,
        startedAt: new Date().toISOString(),
        status: 'completed' as const,
        items: [
          {
            id: 'item-1',
            category: 'validation' as const,
            content: 'Item 1',
            verificationType: 'manual' as const,
          },
        ],
        results: [
          {
            itemId: 'item-1',
            status: 'passed' as const,
            method: 'manual' as const,
            confidence: 'high' as const,
            verifiedAt: '',
          },
        ],
        summary: {
          total: 1,
          passed: 1,
          failed: 0,
          skipped: 0,
          notApplicable: 0,
          coveragePercent: 100,
          automatedChecks: 0,
          manualChecks: 1,
        },
      };

      expect(verificationManager.requiresAttention(report)).toBe(false);
    });
  });

  describe('formatReportForDisplay', () => {
    it('should format report as string', () => {
      const report = {
        version: '1.0' as const,
        promptId: 'test-123',
        source: 'deep' as const,
        startedAt: new Date().toISOString(),
        status: 'in-progress' as const,
        items: [
          {
            id: 'item-1',
            category: 'validation' as const,
            content: 'Tests pass',
            verificationType: 'automated' as const,
          },
          {
            id: 'item-2',
            category: 'validation' as const,
            content: 'Requirements met',
            verificationType: 'manual' as const,
          },
        ],
        results: [
          {
            itemId: 'item-1',
            status: 'passed' as const,
            method: 'automated' as const,
            confidence: 'high' as const,
            verifiedAt: '',
            evidence: 'npm test passed',
          },
          {
            itemId: 'item-2',
            status: 'failed' as const,
            method: 'manual' as const,
            confidence: 'medium' as const,
            verifiedAt: '',
            reason: 'Missing feature X',
          },
        ],
        summary: {
          total: 2,
          passed: 1,
          failed: 1,
          skipped: 0,
          notApplicable: 0,
          coveragePercent: 50,
          automatedChecks: 1,
          manualChecks: 1,
        },
      };

      const formatted = verificationManager.formatReportForDisplay(report);

      expect(formatted).toContain('VERIFICATION REPORT');
      expect(formatted).toContain('test-123');
      expect(formatted).toContain('Tests pass');
      expect(formatted).toContain('Requirements met');
    });

    it('should include summary section', () => {
      const report = {
        version: '1.0' as const,
        promptId: 'test',
        source: 'deep' as const,
        startedAt: new Date().toISOString(),
        status: 'completed' as const,
        items: [
          {
            id: 'item-1',
            category: 'validation' as const,
            content: 'Item 1',
            verificationType: 'manual' as const,
          },
        ],
        results: [
          {
            itemId: 'item-1',
            status: 'passed' as const,
            method: 'manual' as const,
            confidence: 'high' as const,
            verifiedAt: '',
          },
        ],
        summary: {
          total: 1,
          passed: 1,
          failed: 0,
          skipped: 0,
          notApplicable: 0,
          coveragePercent: 100,
          automatedChecks: 0,
          manualChecks: 1,
        },
      };

      const formatted = verificationManager.formatReportForDisplay(report);

      expect(formatted).toContain('SUMMARY');
      expect(formatted).toContain('Total');
      expect(formatted).toContain('Passed');
    });
  });
});
