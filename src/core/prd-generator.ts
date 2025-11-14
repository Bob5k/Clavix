/**
 * PrdGenerator - Generates Product Requirements Documents from collected answers
 *
 * This class handles:
 * - Template loading and rendering with Handlebars
 * - Project name extraction
 * - File generation (full PRD and quick PRD)
 * - Output organization and timestamps
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import Handlebars from 'handlebars';
import { FileSystem } from '../utils/file-system';

/**
 * Options for PRD generation
 */
export interface PrdGenerationOptions {
  projectName?: string;
  outputDir?: string;
  timestamp?: Date;
}

/**
 * Metadata added to generated PRD files
 */
export interface PrdMetadata {
  generatedAt: string;
  generatedBy: string;
  projectName: string;
  version: string;
}

/**
 * PrdGenerator class
 *
 * Generates comprehensive and quick-reference PRD documents
 * from collected question answers
 */
export class PrdGenerator {
  private readonly templatesDir: string;
  private readonly defaultOutputDir = '.clavix/outputs';

  constructor() {
    // Templates are in src/templates (or dist/templates when built)
    this.templatesDir = path.join(__dirname, '../templates');
  }

  /**
   * Generate PRD documents from answers
   *
   * @param answers - Collected answers from QuestionEngine
   * @param options - Generation options
   * @returns Path to the output directory
   */
  async generate(
    answers: Record<string, any>,
    options: PrdGenerationOptions = {}
  ): Promise<string> {
    const projectName = options.projectName || this.extractProjectName(answers);
    const outputDir = options.outputDir || this.defaultOutputDir;
    const timestamp = options.timestamp || new Date();

    // Create output directory
    const projectDir = path.join(outputDir, this.sanitizeProjectName(projectName));
    await FileSystem.ensureDir(projectDir);

    // Prepare template data
    const metadata: PrdMetadata = {
      generatedAt: timestamp.toISOString(),
      generatedBy: 'Clavix PRD Generator',
      projectName,
      version: '1.0.0',
    };

    const templateData = {
      ...this.prepareAnswersForTemplate(answers),
      metadata,
      timestamp: this.formatTimestamp(timestamp),
    };

    // Generate full PRD
    const fullPrdPath = path.join(projectDir, 'full-prd.md');
    await this.generateFullPrd(templateData, fullPrdPath);

    // Generate quick PRD
    const quickPrdPath = path.join(projectDir, 'quick-prd.md');
    await this.generateQuickPrd(templateData, quickPrdPath);

    return projectDir;
  }

  /**
   * Extract project name from answers
   *
   * Tries to infer a project name from the problem statement or user responses
   */
  extractProjectName(answers: Record<string, any>): string {
    // Try to find a project name in the answers
    // Look in common question answers like "problem", "name", "title"
    const possibleNameFields = ['projectName', 'name', 'title', 'q1', 'problem'];

    for (const field of possibleNameFields) {
      if (answers[field] && typeof answers[field] === 'string') {
        const extracted = this.extractNameFromText(answers[field]);
        if (extracted) {
          return extracted;
        }
      }
    }

    // Default to timestamp-based name
    return `project-${Date.now()}`;
  }

  /**
   * Extract a concise name from text (e.g., from problem statement)
   */
  private extractNameFromText(text: string): string | null {
    // Take first few words, clean up, and create a name
    const words = text
      .split(/\s+/)
      .slice(0, 4)
      .map((w) => w.toLowerCase())
      .filter((w) => w.length > 2);

    if (words.length === 0) {
      return null;
    }

    return words.join('-').replace(/[^a-z0-9-]/g, '');
  }

  /**
   * Sanitize project name for use as directory name
   */
  private sanitizeProjectName(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 50);
  }

  /**
   * Prepare answers for template rendering
   */
  private prepareAnswersForTemplate(answers: Record<string, any>): Record<string, any> {
    const prepared: Record<string, any> = {};

    // Map question IDs to friendly names (updated for CLEAR-optimized 5-question flow)
    const questionMap: Record<string, string> = {
      q1: 'problem',      // What are we building and why?
      q2: 'features',     // Core features
      q3: 'technical',    // Tech stack (optional, smart-detected)
      q4: 'outOfScope',   // Out of scope
      q5: 'additional',   // Additional context (optional)
    };

    for (const [questionId, value] of Object.entries(answers)) {
      const friendlyName = questionMap[questionId] || questionId;
      prepared[friendlyName] = value;
    }

    return prepared;
  }

  /**
   * Generate full PRD document
   */
  private async generateFullPrd(data: any, outputPath: string): Promise<void> {
    const templatePath = path.join(this.templatesDir, 'full-prd-template.hbs');

    // Check if custom template exists
    const customTemplatePath = '.clavix/templates/full-prd-template.hbs';
    const templateToUse = await fs.pathExists(customTemplatePath)
      ? customTemplatePath
      : templatePath;

    const template = await fs.readFile(templateToUse, 'utf-8');
    const compiled = Handlebars.compile(template);
    const rendered = compiled(data);

    await FileSystem.writeFileAtomic(outputPath, rendered);
  }

  /**
   * Generate quick PRD document
   */
  private async generateQuickPrd(data: any, outputPath: string): Promise<void> {
    const templatePath = path.join(this.templatesDir, 'quick-prd-template.hbs');

    // Check if custom template exists
    const customTemplatePath = '.clavix/templates/quick-prd-template.hbs';
    const templateToUse = await fs.pathExists(customTemplatePath)
      ? customTemplatePath
      : templatePath;

    const template = await fs.readFile(templateToUse, 'utf-8');
    const compiled = Handlebars.compile(template);
    const rendered = compiled(data);

    await FileSystem.writeFileAtomic(outputPath, rendered);
  }

  /**
   * Format timestamp for display
   */
  private formatTimestamp(date: Date): string {
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
