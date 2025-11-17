/**
 * TaskManager - Manages PRD-based task generation and execution
 *
 * This class handles:
 * - Analyzing PRD documents
 * - Generating CLEAR-optimized task breakdowns
 * - Reading/writing tasks.md with checkbox format
 * - Tracking task completion state
 * - Managing session resume capability
 */

import fs from 'fs-extra';
import * as path from 'path';
import { PromptOptimizer } from './prompt-optimizer.js';
import { FileSystem } from '../utils/file-system.js';

export type PrdSourceType = 'auto' | 'full' | 'quick' | 'mini' | 'prompt';

const SOURCE_FILE_MAP: Record<Exclude<PrdSourceType, 'auto'>, string[]> = {
  full: ['full-prd.md', 'PRD.md', 'prd.md', 'Full-PRD.md', 'FULL_PRD.md', 'FULL-PRD.md'],
  quick: ['quick-prd.md', 'QUICK_PRD.md'],
  mini: ['mini-prd.md'],
  prompt: ['optimized-prompt.md'],
};

const SOURCE_ORDER_AUTO: Array<Exclude<PrdSourceType, 'auto'>> = ['full', 'quick', 'mini', 'prompt'];

const ALL_KNOWN_PRD_FILES = Array.from(
  new Set(Object.values(SOURCE_FILE_MAP).flat())
);

/**
 * Represents a single task in the implementation plan
 */
export interface Task {
  id: string;
  description: string;
  phase: string;
  completed: boolean;
  prdReference?: string;
}

/**
 * Represents a phase/section of tasks
 */
export interface TaskPhase {
  name: string;
  tasks: Task[];
}

/**
 * Options for task generation
 */
export interface TaskGenerationOptions {
  maxTasksPerPhase?: number;
  includeReferences?: boolean;
  clearMode?: 'fast' | 'deep';
  source?: PrdSourceType;
}

/**
 * Result of task generation
 */
export interface TaskGenerationResult {
  phases: TaskPhase[];
  totalTasks: number;
  outputPath: string;
  sourcePath: string;
  sourceType: Exclude<PrdSourceType, 'auto'>;
}

/**
 * TaskManager class
 *
 * Generates and manages implementation tasks from PRD documents
 */
export class TaskManager {
  private readonly optimizer: PromptOptimizer;

  constructor() {
    this.optimizer = new PromptOptimizer();
  }

  /**
   * Generate tasks.md from PRD
   *
   * @param prdPath - Path to the PRD directory
   * @param options - Generation options
   * @returns Task generation result
   */
  async generateTasksFromPrd(
    prdPath: string,
    options: TaskGenerationOptions = {}
  ): Promise<TaskGenerationResult> {
    // Read the full PRD
    const { path: fullPrdPath, sourceType } = await this.resolvePrdFile(
      prdPath,
      options.source ?? 'auto'
    );
    const prdContent = await fs.readFile(fullPrdPath, 'utf-8');

    // Analyze PRD and generate tasks
    const phases = await this.analyzePrdAndGenerateTasks(prdContent, options);

    // Write tasks.md
    const outputPath = path.join(prdPath, 'tasks.md');
    await this.writeTasksFile(outputPath, phases, prdContent);

    return {
      phases,
      totalTasks: phases.reduce((sum, phase) => sum + phase.tasks.length, 0),
      outputPath,
      sourcePath: fullPrdPath,
      sourceType,
    };
  }

  /**
   * Find the PRD file in a directory
   */
  private async resolvePrdFile(
    prdPath: string,
    preferredSource: PrdSourceType
  ): Promise<{ path: string; sourceType: Exclude<PrdSourceType, 'auto'> }> {
    const order = preferredSource === 'auto' ? SOURCE_ORDER_AUTO : [preferredSource];

    for (const source of order) {
      const filenames = SOURCE_FILE_MAP[source];
      for (const filename of filenames) {
        const filepath = path.join(prdPath, filename);
        if (await fs.pathExists(filepath)) {
          return { path: filepath, sourceType: source };
        }
      }
    }

    if (preferredSource !== 'auto') {
      throw new Error(
        `No PRD artifacts found for source "${preferredSource}" in ${prdPath}`
      );
    }

    throw new Error(`No PRD artifacts found in ${prdPath}`);
  }

  /**
   * Analyze PRD content and generate task breakdown
   */
  private async analyzePrdAndGenerateTasks(
    prdContent: string,
    options: TaskGenerationOptions
  ): Promise<TaskPhase[]> {
    const phases: TaskPhase[] = [];

    // Parse PRD sections
    const sections = this.parsePrdSections(prdContent);

    const coreSection = this.getSectionByAliases(sections, [
      'requirements',
      'corefeatures',
      'features',
      'keyrequirements',
    ]);

    if (coreSection) {
      phases.push(...this.generatePhasesFromCoreFeatures(coreSection, options));
    }

    if (phases.length === 0 && sections.requirements) {
      phases.push(...this.generateTasksFromRequirements(sections.requirements, sections));
    }

    const technicalSection = this.getSectionByAliases(sections, [
      'technicalrequirements',
      'technicalconstraints',
    ]);
    if (technicalSection) {
      this.injectTechnicalConstraintsTask(phases, technicalSection, options);
    }

    const successSection = this.getSectionByAliases(sections, [
      'successcriteria',
      'acceptancecriteria',
    ]);
    if (successSection) {
      this.appendSuccessCriteriaPhase(phases, successSection, options);
    }

    if (phases.length === 0) {
      phases.push(this.generateDefaultPhases(prdContent));
    }

    // Ensure all tasks follow CLEAR principles (applied AFTER all tasks are added)
    phases.forEach((phase) => {
      phase.tasks = phase.tasks.map((task) => ({
        ...task,
        description: this.optimizeTaskDescription(task.description),
      }));
    });

    return phases;
  }

  private getSectionByAliases(
    sections: Record<string, string>,
    aliases: string[]
  ): string | null {
    for (const alias of aliases) {
      if (sections[alias]) {
        return sections[alias];
      }
    }
    return null;
  }

  /**
   * Generate phases from core features with intelligent grouping
   * CRITICAL FIX: Group related features instead of 1 phase per bullet
   */
  private generatePhasesFromCoreFeatures(
    coreContent: string,
    options: TaskGenerationOptions
  ): TaskPhase[] {
    const bullets = this.extractListItems(coreContent);

    if (bullets.length === 0) {
      return [];
    }

    // GRANULARITY CONTROL: Warn if too many bullets
    if (bullets.length > 50) {
      console.warn(`Warning: PRD contains ${bullets.length} top-level features. Consider grouping related items.`);
    }

    // Group features by type/category instead of creating separate phases
    const groupedFeatures = this.groupFeaturesByCategory(bullets);

    const phases: TaskPhase[] = [];
    let phaseNumber = 1;

    for (const [category, features] of Object.entries(groupedFeatures)) {
      const phaseName = `Phase ${phaseNumber}: ${category}`;
      const tasks: Task[] = [];

      // Generate tasks for each feature in this group
      features.forEach((feature) => {
        const taskDescriptions = this.buildFeatureTaskDescriptions(feature);

        taskDescriptions.forEach((description) => {
          tasks.push({
            id: `${this.sanitizeId(phaseName)}-${tasks.length + 1}`,
            description,
            phase: phaseName,
            completed: false,
            prdReference: feature,
          });
        });
      });

      // GRANULARITY CONTROL: Skip empty phases
      if (tasks.length > 0) {
        phases.push({
          name: phaseName,
          tasks,
        });
        phaseNumber++;
      }
    }

    // GRANULARITY CONTROL: Cap total tasks (merge if exceeding)
    const totalTasks = phases.reduce((sum, p) => sum + p.tasks.length, 0);
    if (totalTasks > 50) {
      console.warn(`Warning: Generated ${totalTasks} tasks. Consider merging related tasks or simplifying PRD.`);
    }

    return phases;
  }

  /**
   * Group features by category for logical phase organization
   * Replaces "1 bullet = 1 phase" with intelligent grouping
   */
  private groupFeaturesByCategory(features: string[]): Record<string, string[]> {
    const groups: Record<string, string[]> = {
      'Configuration & Setup': [],
      'Core Implementation': [],
      'Testing & Validation': [],
      'Documentation': [],
      'Integration & Release': [],
    };

    features.forEach((feature) => {
      const lower = feature.toLowerCase();

      // Config/setup phase
      if (
        /\b(config|configuration|setup|install|package|tsconfig|dependencies|environment)\b/i.test(feature)
      ) {
        groups['Configuration & Setup'].push(feature);
      }
      // Testing phase
      else if (/\b(test|testing|coverage|validation|verify|qa)\b/i.test(feature)) {
        groups['Testing & Validation'].push(feature);
      }
      // Documentation phase
      else if (/\b(document|documentation|readme|changelog|guide|comment)\b/i.test(feature)) {
        groups['Documentation'].push(feature);
      }
      // Integration/release phase
      else if (/\b(integrate|integration|release|deploy|publish|build|distribution)\b/i.test(feature)) {
        groups['Integration & Release'].push(feature);
      }
      // Default to core implementation
      else {
        groups['Core Implementation'].push(feature);
      }
    });

    // Remove empty groups
    return Object.fromEntries(
      Object.entries(groups).filter(([_, features]) => features.length > 0)
    );
  }

  /**
   * Extract top-level list items only (ignore nested bullets)
   * This prevents sub-bullets from being treated as separate tasks
   */
  private extractListItems(sectionContent: string): string[] {
    const items: string[] = [];
    const lines = sectionContent.split('\n');

    let inCodeBlock = false;

    for (const line of lines) {
      // Track code blocks to ignore bullets inside them
      if (line.trim().startsWith('```')) {
        inCodeBlock = !inCodeBlock;
        continue;
      }

      if (inCodeBlock) {
        continue;
      }

      // Match ONLY top-level bullets (no indentation at all)
      // Nested bullets (2+ spaces) are implementation details, not separate tasks
      const topLevelMatch = line.match(/^(?:[-*]|\d+[.)])\s+(.+)$/);

      if (topLevelMatch) {
        const value = topLevelMatch[1].trim();

        // Skip items that look like code examples, file paths, or implementation details
        if (value && !this.looksLikeCodeOrPath(value) && !this.looksLikeImplementationDetail(value)) {
          items.push(value.replace(/\s+/g, ' ').replace(/\.$/, ''));
        }
      }
    }

    return items;
  }

  /**
   * Detect if a line looks like code or a file path (not a task)
   */
  private looksLikeCodeOrPath(text: string): boolean {
    // File paths with extensions
    if (/\.(ts|js|json|md|tsx|jsx|mjs|cjs)/.test(text)) {
      return true;
    }

    // Code-like patterns
    if (text.includes('import ') || text.includes('export ') || text.includes('require(')) {
      return true;
    }

    // JSON-like
    if (text.trim().startsWith('{') || text.trim().startsWith('[')) {
      return true;
    }

    // Very short technical commands
    if (text.length < 15 && /^[a-z-]+:[a-z-]+$/i.test(text)) {
      return true;
    }

    return false;
  }

  /**
   * Detect if text is an implementation detail rather than a feature
   * Implementation details are constraints, requirements, or sub-steps
   */
  private looksLikeImplementationDetail(text: string): boolean {
    const lower = text.toLowerCase();

    // Constraints and requirements (not tasks)
    if (lower.includes(' must ') || lower.includes(' should ') || lower.includes(' required')) {
      return true;
    }

    // Very short items (< 25 chars) are likely details, not features
    if (text.length < 25 && !lower.startsWith('implement') && !lower.startsWith('create')) {
      return true;
    }

    // Specific technical constraints
    if (/^(password|email|session|token|rate|https)/i.test(text)) {
      return true;
    }

    return false;
  }

  /**
   * Build context-aware task descriptions based on feature type and complexity
   * Replaces the old 5-task boilerplate with intelligent task generation
   */
  private buildFeatureTaskDescriptions(feature: string): string[] {
    const formattedFeature = this.formatInlineText(feature);
    const featureLower = feature.toLowerCase();

    // Detect task type
    const isConfig = /\b(config|configuration|setup|install|update.*json|tsconfig|package\.json)\b/i.test(feature);
    const isTest = /\b(test|testing|coverage|validation|verify)\b/i.test(feature);
    const isDocumentation = /\b(document|documentation|readme|changelog|guide)\b/i.test(feature);
    const isConversion = /\b(convert|migrate|refactor|replace|update.*code)\b/i.test(feature);

    // Simple tasks (config, documentation) - Single task only
    if (isConfig) {
      return [this.convertBehaviorToTask(feature)];
    }

    if (isDocumentation) {
      return [this.convertBehaviorToTask(feature)];
    }

    // Testing tasks - Implementation + validation
    if (isTest) {
      return [
        this.convertBehaviorToTask(feature),
        `Verify ${formattedFeature} passes successfully`,
      ];
    }

    // Conversion/migration tasks - Convert + test
    if (isConversion) {
      return [
        this.convertBehaviorToTask(feature),
        `Test ${formattedFeature} works correctly`,
      ];
    }

    // Default for complex features - Implementation + testing only
    // (No more "integrate into end-to-end" boilerplate)
    return [
      this.convertBehaviorToTask(feature),
      `Add tests covering ${formattedFeature}`,
    ];
  }

  private formatInlineText(text: string): string {
    if (!text) {
      return text;
    }

    const trimmed = text.replace(/\.$/, '').trim();
    if (!trimmed) {
      return trimmed;
    }

    return trimmed.charAt(0).toLowerCase() + trimmed.slice(1);
  }

  private toTitleCase(text: string): string {
    const cleaned = text.replace(/\.$/, '').trim();
    if (!cleaned) {
      return 'Feature';
    }

    return cleaned
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
      .substring(0, 60);
  }

  private injectTechnicalConstraintsTask(
    phases: TaskPhase[],
    technicalContent: string,
    _options: TaskGenerationOptions
  ): void {
    const constraints = this.extractListItems(technicalContent);
    if (constraints.length === 0) {
      return;
    }

    const summary = constraints.slice(0, 3).join('; ');
    const description = `Ensure technical constraints are satisfied: ${summary}`;

    if (phases.length === 0) {
      phases.push({
        name: 'Phase 1: Technical Foundations',
        tasks: [
          {
            id: 'technical-1',
            description,
            phase: 'Phase 1: Technical Foundations',
            completed: false,
            prdReference: 'Technical Constraints',
          },
        ],
      });
      return;
    }

    const firstPhase = phases[0];
    firstPhase.tasks.unshift({
      id: `${this.sanitizeId(firstPhase.name)}-constraints`,
      description,
      phase: firstPhase.name,
      completed: false,
      prdReference: 'Technical Constraints',
    });
  }

  private appendSuccessCriteriaPhase(
    phases: TaskPhase[],
    successContent: string,
    _options: TaskGenerationOptions
  ): void {
    const criteria = this.extractListItems(successContent);
    if (criteria.length === 0) {
      return;
    }

    const selected = criteria.slice(0, 2);

    const phaseName = 'Phase QA: Validation & Success';
    const tasks = selected.map((criterion, index) => ({
      id: `${this.sanitizeId(phaseName)}-${index + 1}`,
      description: `Validate success criterion: ${this.formatInlineText(criterion)}`,
      phase: phaseName,
      completed: false,
      prdReference: 'Success Criteria',
    }));

    phases.push({
      name: phaseName,
      tasks,
    });
  }

  /**
   * Parse PRD into sections
   */
  private parsePrdSections(prdContent: string): Record<string, string> {
    const sections: Record<string, string> = {};
    const lines = prdContent.split('\n');

    let currentSection = '';
    let currentContent: string[] = [];

    for (const line of lines) {
      // Check for section headers (## or ###)
      if (line.match(/^##\s+(.+)/)) {
        // Save previous section
        if (currentSection) {
          sections[this.normalizeSectionName(currentSection)] = currentContent.join('\n').trim();
        }

        // Start new section
        currentSection = line.replace(/^##\s+/, '').trim();
        currentContent = [];
      } else {
        currentContent.push(line);
      }
    }

    // Save last section
    if (currentSection) {
      sections[this.normalizeSectionName(currentSection)] = currentContent.join('\n').trim();
    }

    return sections;
  }

  /**
   * Normalize section name for consistent lookup
   */
  private normalizeSectionName(name: string): string {
    return name.toLowerCase().replace(/[^a-z0-9]/g, '');
  }

  /**
   * Generate tasks from requirements section
   */
  private generateTasksFromRequirements(
    requirementsContent: string,
    _allSections: Record<string, string>
  ): TaskPhase[] {
    const phases: TaskPhase[] = [];

    // Extract must-have features section (stop at next ### or ##)
    const mustHaveMatch = requirementsContent.match(/### Must-Have Features([\s\S]*?)(?=###|##|$)/);
    if (mustHaveMatch) {
      const featuresContent = mustHaveMatch[1];

      // Split by feature headers (#### Number. Feature Name)
      const featureHeaders = [...featuresContent.matchAll(/####\s+(\d+)\.\s+(.+)/g)];

      // Collect all top-level behaviors from all features
      const allBehaviors: string[] = [];

      for (let i = 0; i < featureHeaders.length; i++) {
        const featureName = featureHeaders[i][2].trim();

        // Extract content between this header and the next one
        const startIndex = featureHeaders[i].index!;
        const endIndex = i < featureHeaders.length - 1
          ? featureHeaders[i + 1].index!
          : featuresContent.length;

        const featureContent = featuresContent.substring(startIndex, endIndex);

        // Extract behavior points using hierarchical parsing
        const behaviorMatch = featureContent.match(/\*\*Behavior\*\*:([\s\S]*?)(?=\*\*|####|$)/);
        if (behaviorMatch) {
          const behaviors = behaviorMatch[1];
          const bulletPoints = this.extractListItems(behaviors);

          // Add all top-level behaviors to the list
          allBehaviors.push(...bulletPoints);
        } else {
          // If no Behavior section, add the feature name itself
          allBehaviors.push(featureName);
        }
      }

      // Now group all behaviors by category (instead of 1 phase per feature)
      if (allBehaviors.length > 0) {
        const groupedFeatures = this.groupFeaturesByCategory(allBehaviors);

        let phaseNumber = 1;
        for (const [category, features] of Object.entries(groupedFeatures)) {
          const phaseName = `Phase ${phaseNumber}: ${category}`;
          const tasks: Task[] = [];

          features.forEach((feature) => {
            const taskDescriptions = this.buildFeatureTaskDescriptions(feature);

            taskDescriptions.forEach((description) => {
              tasks.push({
                id: `${this.sanitizeId(phaseName)}-${tasks.length + 1}`,
                description,
                phase: phaseName,
                completed: false,
                prdReference: feature,
              });
            });
          });

          if (tasks.length > 0) {
            phases.push({
              name: phaseName,
              tasks,
            });
            phaseNumber++;
          }
        }
      }
    }

    // If no structured features found, create a general implementation phase
    if (phases.length === 0) {
      phases.push(this.generateDefaultPhases(requirementsContent));
    }

    return phases;
  }

  /**
   * Generate a phase from a feature description
   */
  private generatePhaseFromFeature(
    featureName: string,
    featureContent: string,
    phasePrefix: string
  ): TaskPhase | null {
    const tasks: Task[] = [];

    // Extract behavior points using hierarchical parsing
    const behaviorMatch = featureContent.match(/\*\*Behavior\*\*:([\s\S]*?)(?=\*\*|####|$)/);
    if (behaviorMatch) {
      const behaviors = behaviorMatch[1];

      // Use the same hierarchical parsing as extractListItems()
      const bulletPoints = this.extractListItems(behaviors);

      bulletPoints.forEach((description, index) => {
        // Skip overly long bullets (likely multi-line descriptions)
        if (description.length < 200) {
          tasks.push({
            id: `${this.sanitizeId(featureName)}-${index + 1}`,
            description: this.convertBehaviorToTask(description),
            phase: phasePrefix,
            completed: false,
            prdReference: featureName,
          });
        }
      });
    }

    // If no behavior points, try to extract from feature description
    if (tasks.length === 0) {
      tasks.push({
        id: this.sanitizeId(featureName),
        description: `Implement ${featureName.toLowerCase()}`,
        phase: phasePrefix,
        completed: false,
        prdReference: featureName,
      });
    }

    return {
      name: `${phasePrefix}: ${featureName}`,
      tasks,
    };
  }

  /**
   * Convert behavior description to task description
   */
  private convertBehaviorToTask(behavior: string): string {
    // Remove ** bold markers
    let task = behavior.replace(/\*\*/g, '');

    // If starts with action verb, keep as is
    // Otherwise, prepend "Implement"
    const actionVerbs = /^(Create|Add|Implement|Build|Generate|Read|Write|Parse|Analyze|Display|Update|Handle|Process|Execute|Mark|Track|Ensure|Validate|Configure)/i;

    if (!actionVerbs.test(task)) {
      task = `Implement ${task.charAt(0).toLowerCase() + task.slice(1)}`;
    }

    return task;
  }

  /**
   * Generate default phases when no structure found
   */
  private generateDefaultPhases(_requirementsContent: string): TaskPhase {
    return {
      name: 'Phase 1: Implementation',
      tasks: [
        {
          id: 'setup-1',
          description: 'Set up project structure and dependencies',
          phase: 'Phase 1',
          completed: false,
        },
        {
          id: 'implement-1',
          description: 'Implement core functionality as described in requirements',
          phase: 'Phase 1',
          completed: false,
          prdReference: 'Requirements',
        },
        {
          id: 'test-1',
          description: 'Add tests and validation',
          phase: 'Phase 1',
          completed: false,
        },
      ],
    };
  }

  /**
   * Sanitize ID for use in task IDs
   */
  private sanitizeId(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 30);
  }

  /**
   * Optimize task description using CLEAR principles
   */
  private optimizeTaskDescription(description: string): string {
    // Ensure starts with action verb first
    const actionVerbs = /^(Create|Add|Implement|Build|Generate|Read|Write|Parse|Analyze|Display|Update|Handle|Process|Execute|Mark|Track|Ensure|Validate|Configure|Set up|Fix|Refactor|Test)/i;

    if (!actionVerbs.test(description)) {
      description = `Implement ${description}`;
    }

    // Ensure conciseness: limit to reasonable length (after adding action verb)
    if (description.length > 150) {
      description = description.substring(0, 147) + '...';
    }

    return description;
  }

  /**
   * Write tasks to tasks.md file
   */
  private async writeTasksFile(
    outputPath: string,
    phases: TaskPhase[],
    prdContent: string
  ): Promise<void> {
    let content = '# Implementation Tasks\n\n';

    // Extract project name from PRD
    const projectMatch = prdContent.match(/^#\s+(.+?)$/m);
    if (projectMatch) {
      content += `**Project**: ${projectMatch[1]}\n\n`;
    }

    content += `**Generated**: ${new Date().toLocaleString()}\n\n`;
    content += '---\n\n';

    // Add phases and tasks
    for (const phase of phases) {
      content += `## ${phase.name}\n\n`;

      for (const task of phase.tasks) {
        const checkbox = task.completed ? '[x]' : '[ ]';
        const reference = task.prdReference ? ` (ref: ${task.prdReference})` : '';
        content += `- ${checkbox} ${task.description}${reference}\n`;
        content += `  Task ID: ${task.id}\n`;
      }

      content += '\n';
    }

    // Add footer
    content += '---\n\n';
    content += '*Generated by Clavix /clavix:plan*\n';

    await FileSystem.writeFileAtomic(outputPath, content);
  }

  /**
   * Read tasks from tasks.md file
   */
  async readTasksFile(tasksPath: string): Promise<TaskPhase[]> {
    if (!(await fs.pathExists(tasksPath))) {
      throw new Error(`Tasks file not found: ${tasksPath}`);
    }

    const content = await fs.readFile(tasksPath, 'utf-8');
    return this.parseTasksFile(content);
  }

  /**
   * Parse tasks.md content into TaskPhase objects
   */
  private parseTasksFile(content: string): TaskPhase[] {
    const phases: TaskPhase[] = [];
    const lines = content.split('\n');

    let currentPhase: TaskPhase | null = null;
    let taskCounter = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Check for phase header (## Phase Name)
      const phaseMatch = line.match(/^##\s+(.+)$/);
      if (phaseMatch) {
        if (currentPhase) {
          phases.push(currentPhase);
        }

        currentPhase = {
          name: phaseMatch[1].trim(),
          tasks: [],
        };
        taskCounter = 0;
        continue;
      }

      // Check for task (- [ ] or - [x] Task description)
      const taskMatch = line.match(/^-\s+\[([ x])\]\s+(.+?)(?:\s+\(ref:\s+(.+?)\))?$/);
      if (taskMatch && currentPhase) {
        const completed = taskMatch[1] === 'x';
        const description = taskMatch[2].trim();
        const reference = taskMatch[3]?.trim();

        taskCounter++;

        // Check next line for Task ID
        let taskId: string;
        const nextLine = i + 1 < lines.length ? lines[i + 1] : null;
        const taskIdMatch = nextLine?.trim().match(/^Task ID:\s+(.+)$/);

        if (taskIdMatch) {
          // Use Task ID from file (preferred)
          taskId = taskIdMatch[1].trim();
          i++; // Skip the Task ID line in next iteration
        } else {
          // Fallback: regenerate ID from phase name (backward compatibility)
          taskId = `${this.sanitizeId(currentPhase.name)}-${taskCounter}`;
        }

        currentPhase.tasks.push({
          id: taskId,
          description,
          phase: currentPhase.name,
          completed,
          prdReference: reference,
        });
      }
    }

    // Add last phase
    if (currentPhase) {
      phases.push(currentPhase);
    }

    return phases;
  }

  /**
   * Find the first incomplete task
   */
  findFirstIncompleteTask(phases: TaskPhase[]): Task | null {
    for (const phase of phases) {
      for (const task of phase.tasks) {
        if (!task.completed) {
          return task;
        }
      }
    }
    return null;
  }

  /**
   * Mark a task as completed in the tasks.md file
   */
  async markTaskCompleted(tasksPath: string, taskId: string): Promise<void> {
    const phases = await this.readTasksFile(tasksPath);

    // Find and mark the task
    let found = false;
    for (const phase of phases) {
      for (const task of phase.tasks) {
        if (task.id === taskId) {
          task.completed = true;
          found = true;
          break;
        }
      }
      if (found) break;
    }

    if (!found) {
      throw new Error(`Task not found: ${taskId}`);
    }

    // Read original content to preserve formatting
    const content = await fs.readFile(tasksPath, 'utf-8');

    // Find the task line and replace [ ] with [x]
    // We need to find the exact task by description
    const targetTask = phases
      .flatMap((p) => p.tasks)
      .find((t) => t.id === taskId);

    if (!targetTask) {
      throw new Error(`Task not found: ${taskId}`);
    }

    // Replace - [ ] with - [x] for this specific task description
    const taskDescPattern = this.escapeRegex(targetTask.description);
    const refPattern = targetTask.prdReference
      ? `\\s+\\(ref:\\s+${this.escapeRegex(targetTask.prdReference)}\\)`
      : '';

    const regex = new RegExp(
      `^(-\\s+\\[)( )(\\]\\s+${taskDescPattern}${refPattern})$`,
      'm'
    );

    const updatedContent = content.replace(regex, '$1x$3');

    await FileSystem.writeFileAtomic(tasksPath, updatedContent);
  }

  /**
   * Escape special regex characters
   */
  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Validate that a task exists in the phases
   * @param phases - Array of task phases
   * @param taskId - Task ID to validate
   * @returns The task if found, null otherwise
   */
  validateTaskExists(phases: TaskPhase[], taskId: string): Task | null {
    for (const phase of phases) {
      const task = phase.tasks.find(t => t.id === taskId);
      if (task) {
        return task;
      }
    }
    return null;
  }

  /**
   * Verify that a task was successfully marked as completed in the file
   * @param tasksPath - Path to tasks.md file
   * @param taskId - Task ID to verify
   * @returns true if task is marked completed, false otherwise
   */
  async verifyTaskMarked(tasksPath: string, taskId: string): Promise<boolean> {
    try {
      const phases = await this.readTasksFile(tasksPath);
      const task = this.validateTaskExists(phases, taskId);
      return task ? task.completed : false;
    } catch {
      // If we can't read the file, verification failed
      return false;
    }
  }

  /**
   * Mark a task as completed with validation and error recovery
   * Enhanced version with pre/post validation
   * @param tasksPath - Path to tasks.md file
   * @param taskId - Task ID to mark as completed
   * @param options - Optional configuration for error recovery
   * @returns Object with success status and any warnings/errors
   */
  async markTaskCompletedWithValidation(
    tasksPath: string,
    taskId: string,
    options: { retryOnFailure?: boolean; createBackup?: boolean } = {}
  ): Promise<{ success: boolean; alreadyCompleted?: boolean; error?: string; warnings?: string[] }> {
    const { retryOnFailure = true, createBackup = true } = options;
    const warnings: string[] = [];

    // Pre-validation: Check if file exists
    if (!(await fs.pathExists(tasksPath))) {
      return {
        success: false,
        error: `Tasks file not found: ${tasksPath}`,
      };
    }

    // Create backup if requested
    let backupPath: string | null = null;
    if (createBackup) {
      backupPath = `${tasksPath}.backup`;
      try {
        await fs.copyFile(tasksPath, backupPath);
      } catch {
        warnings.push('Failed to create backup file');
      }
    }

    try {
      // Read and validate task exists
      const phases = await this.readTasksFile(tasksPath);
      const task = this.validateTaskExists(phases, taskId);

      if (!task) {
        // Task not found - provide helpful error
        const allTaskIds = phases.flatMap(p => p.tasks.map(t => t.id));
        return {
          success: false,
          error: `Task ID "${taskId}" not found. Available task IDs:\n${allTaskIds.join('\n')}`,
        };
      }

      // Check if already completed
      if (task.completed) {
        return {
          success: true,
          alreadyCompleted: true,
          warnings: [`Task "${taskId}" was already marked as completed`],
        };
      }

      // Attempt to mark task completed
      await this.markTaskCompleted(tasksPath, taskId);

      // Post-validation: Verify the checkbox was actually changed
      const verified = await this.verifyTaskMarked(tasksPath, taskId);

      if (!verified) {
        // Verification failed - attempt recovery if enabled
        if (retryOnFailure && backupPath) {
          warnings.push('First attempt failed verification, retrying...');

          // Restore from backup and try again
          await fs.copyFile(backupPath, tasksPath);
          await this.markTaskCompleted(tasksPath, taskId);

          // Verify again
          const secondVerification = await this.verifyTaskMarked(tasksPath, taskId);

          if (!secondVerification) {
            // Still failed - restore backup and return error
            await fs.copyFile(backupPath, tasksPath);
            return {
              success: false,
              error: 'Failed to mark task as completed even after retry. File has been restored from backup.',
              warnings,
            };
          }

          warnings.push('Task marked successfully on retry');
        } else {
          // No retry - just fail
          return {
            success: false,
            error: 'Task completion verification failed',
            warnings,
          };
        }
      }

      // Clean up backup on success
      if (backupPath && await fs.pathExists(backupPath)) {
        await fs.remove(backupPath);
      }

      return {
        success: true,
        warnings: warnings.length > 0 ? warnings : undefined,
      };

    } catch (error) {
      // Restore from backup if available
      if (backupPath && await fs.pathExists(backupPath)) {
        try {
          await fs.copyFile(backupPath, tasksPath);
          warnings.push('Restored tasks.md from backup due to error');
        } catch {
          warnings.push('Failed to restore from backup');
        }
      }

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        error: `Error marking task as completed: ${errorMessage}`,
        warnings: warnings.length > 0 ? warnings : undefined,
      };
    }
  }

  /**
   * Get task completion statistics
   */
  getTaskStats(phases: TaskPhase[]): {
    total: number;
    completed: number;
    remaining: number;
    percentage: number;
  } {
    const allTasks = phases.flatMap((p) => p.tasks);
    const total = allTasks.length;
    const completed = allTasks.filter((t) => t.completed).length;
    const remaining = total - completed;
    const percentage = total > 0 ? (completed / total) * 100 : 0;

    return { total, completed, remaining, percentage };
  }

  /**
   * Find PRD directory from current working directory
   */
  async findPrdDirectory(projectName?: string): Promise<string> {
    const baseDir = '.clavix/outputs';

    if (!await fs.pathExists(baseDir)) {
      throw new Error('No .clavix/outputs directory found. Have you generated a PRD yet?');
    }

    // If project name specified, look for it
    if (projectName) {
      const projectPath = path.join(baseDir, projectName);
      if (await fs.pathExists(projectPath)) {
        return projectPath;
      }
      throw new Error(`PRD project not found: ${projectName}`);
    }

    // Otherwise, find most recent PRD directory
    const dirs = await fs.readdir(baseDir);
    const prdDirs = [];

    for (const dir of dirs) {
      const fullPath = path.join(baseDir, dir);
      const stat = await fs.stat(fullPath);

      if (stat.isDirectory()) {
        // Check if it has a PRD file
        const hasPrd = await this.hasPrdFile(fullPath);
        if (hasPrd) {
          prdDirs.push({
            path: fullPath,
            mtime: stat.mtime,
          });
        }
      }
    }

    if (prdDirs.length === 0) {
      throw new Error('No PRD directories found in .clavix/outputs');
    }

    // Return most recent
    prdDirs.sort((a, b) => b.mtime.getTime() - a.mtime.getTime());
    return prdDirs[0].path;
  }

  /**
   * Check if directory has a PRD file
   */
  public async hasPrdFile(dirPath: string): Promise<boolean> {
    for (const filename of ALL_KNOWN_PRD_FILES) {
      if (await fs.pathExists(path.join(dirPath, filename))) {
        return true;
      }
    }

    // Prompt-only projects
    if (await fs.pathExists(path.join(dirPath, 'optimized-prompt.md'))) {
      return true;
    }

    return false;
  }

  public async detectAvailableSources(
    dirPath: string
  ): Promise<Array<Exclude<PrdSourceType, 'auto'>>> {
    const available: Array<Exclude<PrdSourceType, 'auto'>> = [];

    for (const source of SOURCE_ORDER_AUTO) {
      const filenames = SOURCE_FILE_MAP[source];
      for (const filename of filenames) {
        if (await fs.pathExists(path.join(dirPath, filename))) {
          available.push(source);
          break;
        }
      }
    }

    return available;
  }
}
