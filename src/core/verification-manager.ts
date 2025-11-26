/**
 * Clavix v4.8: Verification Manager
 *
 * Manages verification state, execution flow, and persistence.
 * Coordinates between checklist parsing, hook execution, and result storage.
 */

import fs from 'fs-extra';
import * as path from 'path';
import {
  VerificationReport,
  VerificationResult,
  VerificationSummary,
  ChecklistItem,
  ReportStatus,
  VerificationStatus,
  VerificationConfidence,
  VerificationMethod,
} from '../types/verification.js';
import { ChecklistParser } from './checklist-parser.js';
import { VerificationHooks } from './verification-hooks.js';
import { PromptManager } from './prompt-manager.js';

/**
 * Verification Manager
 */
export class VerificationManager {
  private readonly promptManager: PromptManager;
  private readonly checklistParser: ChecklistParser;
  private readonly verificationHooks: VerificationHooks;
  private readonly outputDir: string;

  constructor(baseDir?: string) {
    this.outputDir = baseDir || path.join(process.cwd(), '.clavix', 'outputs', 'prompts');
    this.promptManager = new PromptManager(this.outputDir);
    this.checklistParser = new ChecklistParser();
    this.verificationHooks = new VerificationHooks();
  }

  /**
   * Initialize verification for a prompt
   */
  async initializeVerification(promptId: string): Promise<VerificationReport> {
    // Load prompt
    const promptData = await this.promptManager.loadPrompt(promptId);
    if (!promptData) {
      throw new Error(`Prompt not found: ${promptId}`);
    }

    // Parse checklist from prompt content
    const checklist = this.checklistParser.parse(promptData.content);

    // Get all items
    const items = [...checklist.validationItems, ...checklist.edgeCases, ...checklist.risks];

    // Detect available hooks
    const detectedHooks = await this.verificationHooks.detectHooks();

    // Create initial report
    const report: VerificationReport = {
      version: '1.0',
      promptId,
      source: promptData.metadata.source,
      startedAt: new Date().toISOString(),
      status: items.length > 0 ? 'pending' : 'completed',
      items,
      results: items.map((item) => ({
        itemId: item.id,
        status: 'pending',
        method: item.verificationType === 'automated' ? 'automated' : 'manual',
        confidence: 'low',
        verifiedAt: '',
      })),
      summary: this.calculateSummary([]),
      detectedHooks,
    };

    // Save initial report
    await this.saveReport(report);

    return report;
  }

  /**
   * Get verification report path for a prompt
   */
  getReportPath(promptId: string, source: 'fast' | 'deep'): string {
    return path.join(this.outputDir, source, `${promptId}.verification.json`);
  }

  /**
   * Load verification report
   */
  async loadReport(promptId: string): Promise<VerificationReport | null> {
    // Try both sources
    for (const source of ['deep', 'fast'] as const) {
      const reportPath = this.getReportPath(promptId, source);
      if (await fs.pathExists(reportPath)) {
        try {
          return await fs.readJson(reportPath);
        } catch {
          // Corrupt file, ignore
        }
      }
    }

    return null;
  }

  /**
   * Save verification report
   */
  async saveReport(report: VerificationReport): Promise<void> {
    const reportPath = this.getReportPath(report.promptId, report.source);
    await fs.ensureDir(path.dirname(reportPath));
    await fs.writeJson(reportPath, report, { spaces: 2 });
  }

  /**
   * Mark a single item as verified
   */
  async markItemVerified(
    promptId: string,
    itemId: string,
    status: VerificationStatus,
    options: {
      evidence?: string;
      reason?: string;
      confidence?: VerificationConfidence;
      method?: VerificationMethod;
    } = {}
  ): Promise<VerificationReport> {
    let report = await this.loadReport(promptId);

    if (!report) {
      // Initialize if doesn't exist
      report = await this.initializeVerification(promptId);
    }

    // Find and update result
    const resultIndex = report.results.findIndex((r) => r.itemId === itemId);
    if (resultIndex === -1) {
      throw new Error(`Item not found: ${itemId}`);
    }

    const item = report.items.find((i) => i.id === itemId);

    report.results[resultIndex] = {
      itemId,
      status,
      method: options.method || (item?.verificationType === 'automated' ? 'automated' : 'manual'),
      confidence: options.confidence || 'medium',
      evidence: options.evidence,
      reason: options.reason,
      verifiedAt: new Date().toISOString(),
    };

    // Recalculate summary and status
    report.summary = this.calculateSummary(report.results);
    report.status = this.calculateReportStatus(report.results);

    if (report.status === 'completed') {
      report.completedAt = new Date().toISOString();
    }

    await this.saveReport(report);
    return report;
  }

  /**
   * Run automated verification for a prompt
   */
  async runAutomatedVerification(promptId: string): Promise<VerificationReport> {
    let report = await this.loadReport(promptId);

    if (!report) {
      report = await this.initializeVerification(promptId);
    }

    // Find automated items that are pending
    const automatedItems = report.items.filter(
      (item) =>
        item.verificationType === 'automated' &&
        report!.results.find((r) => r.itemId === item.id)?.status === 'pending'
    );

    if (automatedItems.length === 0) {
      return report;
    }

    // Detect hooks
    const detectedHooks = await this.verificationHooks.detectHooks();

    // Run relevant hooks
    const hookResults = await this.verificationHooks.runAllHooks();

    // Map hook results to checklist items
    for (const item of automatedItems) {
      const lowerContent = item.content.toLowerCase();

      // Match item to hook result
      let matched = false;

      for (const hookResult of hookResults) {
        if (this.matchItemToHook(lowerContent, hookResult.hook.name)) {
          const resultIndex = report.results.findIndex((r) => r.itemId === item.id);
          if (resultIndex !== -1) {
            report.results[resultIndex] = {
              itemId: item.id,
              status: hookResult.success ? 'passed' : 'failed',
              method: 'automated',
              confidence: hookResult.confidence,
              evidence: this.truncateOutput(hookResult.output),
              reason: hookResult.success ? undefined : 'Hook failed',
              verifiedAt: new Date().toISOString(),
            };
            matched = true;
            break;
          }
        }
      }

      // If no hook matched, mark as requiring manual verification
      if (!matched) {
        const resultIndex = report.results.findIndex((r) => r.itemId === item.id);
        if (resultIndex !== -1 && report.results[resultIndex].status === 'pending') {
          report.results[resultIndex].method = 'manual';
        }
      }
    }

    // Update summary and status
    report.summary = this.calculateSummary(report.results);
    report.status = this.calculateReportStatus(report.results);
    report.detectedHooks = detectedHooks;

    await this.saveReport(report);
    return report;
  }

  /**
   * Match checklist item content to hook type
   */
  private matchItemToHook(content: string, hookName: string): boolean {
    const hookKeywords: Record<string, string[]> = {
      test: ['tests pass', 'test pass', 'all tests', 'unit test', 'test coverage'],
      build: ['compiles', 'builds', 'build succeeds', 'no errors', 'runs without errors'],
      lint: ['lint', 'no warnings', 'style guide', 'conventions'],
      typecheck: ['typecheck', 'type check', 'type errors', 'typescript'],
    };

    const keywords = hookKeywords[hookName] || [];
    return keywords.some((kw) => content.includes(kw));
  }

  /**
   * Truncate output for storage
   */
  private truncateOutput(output: string, maxLength: number = 500): string {
    if (output.length <= maxLength) {
      return output;
    }
    return output.substring(0, maxLength) + '... (truncated)';
  }

  /**
   * Calculate summary from results
   */
  calculateSummary(results: VerificationResult[]): VerificationSummary {
    const total = results.length;
    const passed = results.filter((r) => r.status === 'passed').length;
    const failed = results.filter((r) => r.status === 'failed').length;
    const skipped = results.filter((r) => r.status === 'skipped').length;
    const notApplicable = results.filter((r) => r.status === 'not-applicable').length;
    const automatedChecks = results.filter((r) => r.method === 'automated').length;
    const manualChecks = results.filter(
      (r) => r.method === 'manual' || r.method === 'semi-automated'
    ).length;

    const denominator = total - skipped - notApplicable;
    const coveragePercent = denominator > 0 ? Math.round((passed / denominator) * 100) : 0;

    return {
      total,
      passed,
      failed,
      skipped,
      notApplicable,
      coveragePercent,
      automatedChecks,
      manualChecks,
    };
  }

  /**
   * Calculate overall report status
   */
  private calculateReportStatus(results: VerificationResult[]): ReportStatus {
    const pending = results.filter((r) => r.status === 'pending').length;
    const failed = results.filter((r) => r.status === 'failed').length;

    if (pending === results.length) {
      return 'pending';
    }

    if (pending > 0) {
      return 'in-progress';
    }

    if (failed > 0) {
      return 'requires-attention';
    }

    return 'completed';
  }

  /**
   * Get pending items from report
   */
  getPendingItems(report: VerificationReport): ChecklistItem[] {
    const pendingIds = new Set(
      report.results.filter((r) => r.status === 'pending').map((r) => r.itemId)
    );
    return report.items.filter((item) => pendingIds.has(item.id));
  }

  /**
   * Get failed items from report
   */
  getFailedItems(report: VerificationReport): Array<{
    item: ChecklistItem;
    result: VerificationResult;
  }> {
    return report.results
      .filter((r) => r.status === 'failed')
      .map((result) => ({
        item: report.items.find((i) => i.id === result.itemId)!,
        result,
      }))
      .filter((r) => r.item);
  }

  /**
   * Check if verification is complete
   */
  isComplete(report: VerificationReport): boolean {
    return report.status === 'completed';
  }

  /**
   * Check if verification requires attention (has failures)
   */
  requiresAttention(report: VerificationReport): boolean {
    return report.status === 'requires-attention';
  }

  /**
   * Delete verification report
   */
  async deleteReport(promptId: string): Promise<boolean> {
    for (const source of ['deep', 'fast'] as const) {
      const reportPath = this.getReportPath(promptId, source);
      if (await fs.pathExists(reportPath)) {
        await fs.remove(reportPath);
        return true;
      }
    }
    return false;
  }

  /**
   * Get all verification reports
   */
  async listReports(): Promise<VerificationReport[]> {
    const reports: VerificationReport[] = [];

    for (const source of ['deep', 'fast'] as const) {
      const sourceDir = path.join(this.outputDir, source);
      if (await fs.pathExists(sourceDir)) {
        const files = await fs.readdir(sourceDir);
        for (const file of files) {
          if (file.endsWith('.verification.json')) {
            try {
              const report = await fs.readJson(path.join(sourceDir, file));
              reports.push(report);
            } catch {
              // Ignore corrupt files
            }
          }
        }
      }
    }

    return reports;
  }

  /**
   * Get verification status for a prompt
   */
  async getVerificationStatus(promptId: string): Promise<{
    hasReport: boolean;
    status: ReportStatus | null;
    summary: VerificationSummary | null;
  }> {
    const report = await this.loadReport(promptId);

    if (!report) {
      return {
        hasReport: false,
        status: null,
        summary: null,
      };
    }

    return {
      hasReport: true,
      status: report.status,
      summary: report.summary,
    };
  }

  /**
   * Format verification report for display
   */
  formatReportForDisplay(report: VerificationReport): string {
    const lines: string[] = [];
    const sep = '═'.repeat(70);

    lines.push(sep);
    lines.push('                    VERIFICATION REPORT');
    lines.push(`                    ${report.promptId}`);
    lines.push(sep);
    lines.push('');

    // Group results by category
    const byCategory = new Map<
      string,
      Array<{ item: ChecklistItem; result: VerificationResult }>
    >();

    for (const item of report.items) {
      const result = report.results.find((r) => r.itemId === item.id);
      if (!result) continue;

      const category = item.category;
      if (!byCategory.has(category)) {
        byCategory.set(category, []);
      }
      byCategory.get(category)!.push({ item, result });
    }

    // Display each category
    for (const [category, items] of byCategory.entries()) {
      const categoryName =
        category === 'validation'
          ? 'VALIDATION CHECKLIST'
          : category === 'edge-case'
            ? 'EDGE CASES'
            : 'RISKS';
      lines.push(`📋 ${categoryName} (${items.length} items)`);
      lines.push('');

      for (const { item, result } of items) {
        const statusIcon = this.getStatusIcon(result.status);
        const method =
          result.method === 'automated'
            ? '[automated]'
            : result.method === 'semi-automated'
              ? '[semi-auto]'
              : '[manual]';

        lines.push(`${statusIcon} ${method} ${item.content}`);

        if (result.evidence) {
          lines.push(`   Evidence: ${result.evidence.substring(0, 80)}`);
        }

        if (result.status === 'failed' && result.reason) {
          lines.push(`   Reason: ${result.reason}`);
        }

        if (result.confidence) {
          lines.push(`   Confidence: ${result.confidence.toUpperCase()}`);
        }

        lines.push('');
      }
    }

    // Summary
    lines.push(sep);
    lines.push('                         SUMMARY');
    lines.push(sep);
    lines.push(`Total:        ${report.summary.total} items`);
    lines.push(`Passed:       ${report.summary.passed} (${report.summary.coveragePercent}%)`);
    lines.push(
      `Failed:       ${report.summary.failed}${report.summary.failed > 0 ? ' (requires attention)' : ''}`
    );
    lines.push(`Skipped:      ${report.summary.skipped}`);
    lines.push('');
    lines.push(`Automated:    ${report.summary.automatedChecks} checks`);
    lines.push(`Manual:       ${report.summary.manualChecks} checks`);

    if (report.summary.failed > 0) {
      lines.push('');
      lines.push(`⚠️  ${report.summary.failed} item(s) require attention before marking complete`);
    }

    lines.push(sep);

    return lines.join('\n');
  }

  /**
   * Get status icon for display
   */
  private getStatusIcon(status: VerificationStatus): string {
    switch (status) {
      case 'passed':
        return '✅';
      case 'failed':
        return '❌';
      case 'skipped':
        return '⏭️';
      case 'not-applicable':
        return '➖';
      case 'pending':
      default:
        return '⏳';
    }
  }
}
