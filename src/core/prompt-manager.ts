import fs from 'fs-extra';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

export type PromptSource = 'fast' | 'deep';

export interface PromptMetadata {
  id: string;
  filename: string;
  source: PromptSource;
  timestamp: string;
  createdAt: Date;
  path: string;
  originalPrompt: string;
  executed: boolean;
  executedAt: string | null;
  ageInDays?: number;
  linkedProject?: string;
  // Verification tracking (v4.8)
  verificationRequired: boolean;
  verified: boolean;
  verifiedAt: string | null;
}

export interface PromptsIndex {
  version: string;
  prompts: PromptMetadata[];
}

export interface PromptData {
  metadata: PromptMetadata;
  content: string;
}

export interface PromptFilters {
  source?: PromptSource;
  executed?: boolean;
  stale?: boolean; // >30 days old
  old?: boolean; // >7 days old
}

export interface StorageStats {
  totalPrompts: number;
  fastPrompts: number;
  deepPrompts: number;
  executedPrompts: number;
  pendingPrompts: number;
  stalePrompts: number;
  oldPrompts: number;
  oldestPromptAge: number;
}

export class PromptManager {
  private readonly promptsDir: string;

  constructor(baseDir?: string) {
    // If baseDir ends with 'prompts', use it directly; otherwise append 'prompts'
    if (baseDir) {
      this.promptsDir = baseDir.endsWith('prompts') ? baseDir : path.join(baseDir, 'prompts');
    } else {
      this.promptsDir = path.join(process.cwd(), '.clavix', 'outputs', 'prompts');
    }
  }

  /**
   * Get index file path for a specific source
   */
  private getIndexPath(source: PromptSource): string {
    return path.join(this.promptsDir, source, '.index.json');
  }

  /**
   * Ensure prompts directory structure exists
   */
  async ensurePromptsDir(): Promise<void> {
    await fs.ensureDir(path.join(this.promptsDir, 'fast'));
    await fs.ensureDir(path.join(this.promptsDir, 'deep'));
  }

  /**
   * Generate unique prompt ID with timestamp and hash
   */
  generatePromptId(source: PromptSource, _originalPrompt: string): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T');
    const date = timestamp[0].replace(/-/g, '');
    const time = timestamp[1].split('-').slice(0, 3).join('');

    // Use UUID for uniqueness (mockable for tests - first 13 chars for readability)
    const hash = uuidv4().substring(0, 13);

    return `${source}-${date}-${time}-${hash}`;
  }

  /**
   * Save optimized prompt to file system
   */
  async savePrompt(
    content: string,
    source: PromptSource,
    originalPrompt: string,
    linkedProject?: string
  ): Promise<PromptMetadata> {
    await this.ensurePromptsDir();

    const id = this.generatePromptId(source, originalPrompt);
    const filename = `${id}.md`;
    const filePath = path.join(this.promptsDir, source, filename);
    const now = new Date();

    const metadata: PromptMetadata = {
      id,
      filename,
      source,
      timestamp: now.toISOString(),
      createdAt: now,
      path: filePath,
      originalPrompt,
      executed: false,
      executedAt: null,
      linkedProject,
      // Verification tracking (v4.8)
      verificationRequired: true,
      verified: false,
      verifiedAt: null,
    };

    // Create file with frontmatter
    const frontmatter = [
      '---',
      `id: ${id}`,
      `source: ${source}`,
      `timestamp: ${metadata.timestamp}`,
      `executed: ${metadata.executed}`,
      `originalPrompt: ${originalPrompt}`,
      linkedProject ? `linkedProject: ${linkedProject}` : '',
      `verificationRequired: ${metadata.verificationRequired}`,
      `verified: ${metadata.verified}`,
      '---',
      '',
    ]
      .filter(Boolean)
      .join('\n');

    const fileContent = frontmatter + content;
    await fs.writeFile(filePath, fileContent, 'utf-8');

    // Update index
    await this.addToIndex(metadata);

    return metadata;
  }

  /**
   * Load prompt by ID
   */
  async loadPrompt(id: string): Promise<PromptData | null> {
    const index = await this.loadIndex();
    const metadata = index.prompts.find((p) => p.id === id);

    if (!metadata) {
      return null;
    }

    const filePath = path.join(this.promptsDir, metadata.source, metadata.filename);

    if (!(await fs.pathExists(filePath))) {
      return null;
    }

    const content = await fs.readFile(filePath, 'utf-8');

    // Strip frontmatter for clean content
    const contentWithoutFrontmatter = content.replace(/^---\n[\s\S]*?\n---\n*/, '');

    return {
      metadata,
      content: contentWithoutFrontmatter,
    };
  }

  /**
   * List prompts with optional filtering
   */
  async listPrompts(filters?: PromptFilters): Promise<PromptMetadata[]> {
    const index = await this.loadIndex(filters?.source);
    let prompts = index.prompts;

    // Ensure index exists when filtering by source (for corruption recovery tests)
    if (filters?.source) {
      const indexPath = this.getIndexPath(filters.source);
      if (!(await fs.pathExists(indexPath))) {
        await this.saveIndex({ version: '1.0', prompts: [] }, filters.source);
      }
    }

    // Apply filters
    if (filters) {
      if (filters.executed !== undefined) {
        prompts = prompts.filter((p) => p.executed === filters.executed);
      }
      if (filters.stale) {
        prompts = prompts.filter((p) => this.getPromptAge(p) > 30);
      }
      if (filters.old) {
        prompts = prompts.filter((p) => this.getPromptAge(p) > 7);
      }
    }

    // Add age calculation
    prompts = prompts.map((p) => ({
      ...p,
      createdAt: new Date(p.timestamp),
      ageInDays: this.getPromptAge(p),
    }));

    // Sort by timestamp (newest first)
    prompts.sort((a, b) => {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

    return prompts;
  }

  /**
   * Mark prompt as executed
   */
  async markExecuted(id: string): Promise<void> {
    // Load all indexes to find the prompt
    const allPrompts = await this.listPrompts();
    const prompt = allPrompts.find((p) => p.id === id);

    if (!prompt) {
      throw new Error(`Prompt not found: ${id}`);
    }

    // Load source-specific index
    const index = await this.loadIndex(prompt.source);
    const indexPrompt = index.prompts.find((p) => p.id === id);

    if (indexPrompt) {
      indexPrompt.executed = true;
      indexPrompt.executedAt = new Date().toISOString();
      await this.saveIndex(index, prompt.source);
    }
  }

  /**
   * Mark prompt as verified (v4.8)
   */
  async markVerified(id: string): Promise<void> {
    // Load all indexes to find the prompt
    const allPrompts = await this.listPrompts();
    const prompt = allPrompts.find((p) => p.id === id);

    if (!prompt) {
      throw new Error(`Prompt not found: ${id}`);
    }

    // Load source-specific index
    const index = await this.loadIndex(prompt.source);
    const indexPrompt = index.prompts.find((p) => p.id === id);

    if (indexPrompt) {
      indexPrompt.verified = true;
      indexPrompt.verifiedAt = new Date().toISOString();
      await this.saveIndex(index, prompt.source);
    }
  }

  /**
   * Delete prompts by filter
   */
  async deletePrompts(filters: PromptFilters): Promise<number> {
    const toDelete = await this.listPrompts(filters);
    let deleteCount = 0;

    // Group by source for index updates
    const bySource = new Map<PromptSource, Set<string>>();

    for (const prompt of toDelete) {
      const filePath = path.join(this.promptsDir, prompt.source, prompt.filename);

      if (await fs.pathExists(filePath)) {
        await fs.remove(filePath);
        deleteCount++;

        if (!bySource.has(prompt.source)) {
          bySource.set(prompt.source, new Set());
        }
        bySource.get(prompt.source)!.add(prompt.id);
      }
    }

    // Update each source index
    for (const [source, deletedIds] of bySource.entries()) {
      const index = await this.loadIndex(source);
      index.prompts = index.prompts.filter((p) => !deletedIds.has(p.id));
      await this.saveIndex(index, source);
    }

    return deleteCount;
  }

  /**
   * Get age of prompt in days
   */
  getPromptAge(prompt: PromptMetadata): number {
    const created = new Date(prompt.timestamp);
    const now = new Date();
    const diffMs = now.getTime() - created.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  }

  /**
   * Get stale prompts (>30 days old)
   */
  async getStalePrompts(_daysOld: number = 30): Promise<PromptMetadata[]> {
    return this.listPrompts({ stale: true });
  }

  /**
   * Get storage statistics
   */
  async getStorageStats(): Promise<StorageStats> {
    const allPrompts = await this.listPrompts();

    const stats: StorageStats = {
      totalPrompts: allPrompts.length,
      fastPrompts: allPrompts.filter((p) => p.source === 'fast').length,
      deepPrompts: allPrompts.filter((p) => p.source === 'deep').length,
      executedPrompts: allPrompts.filter((p) => p.executed).length,
      pendingPrompts: allPrompts.filter((p) => !p.executed).length,
      stalePrompts: allPrompts.filter((p) => (p.ageInDays || 0) > 30).length,
      oldPrompts: allPrompts.filter((p) => (p.ageInDays || 0) > 7).length,
      oldestPromptAge:
        allPrompts.length > 0 ? Math.max(...allPrompts.map((p) => p.ageInDays || 0)) : 0,
    };

    return stats;
  }

  /**
   * Load index from file
   * If source is specified, loads that source's index only
   * If source is undefined, loads and merges all source indexes
   */
  private async loadIndex(source?: PromptSource): Promise<PromptsIndex> {
    // If no source specified, load all indexes and merge
    if (!source) {
      const fastIndex = await this.loadIndex('fast');
      const deepIndex = await this.loadIndex('deep');
      return {
        version: '1.0',
        prompts: [...(fastIndex.prompts || []), ...(deepIndex.prompts || [])],
      };
    }

    // Load specific source index
    const indexPath = this.getIndexPath(source);
    if (!(await fs.pathExists(indexPath))) {
      return {
        version: '1.0',
        prompts: [],
      };
    }

    try {
      const content = await fs.readFile(indexPath, 'utf-8');
      const parsed = JSON.parse(content);
      // Ensure prompts array exists
      return {
        version: parsed.version || '1.0',
        prompts: Array.isArray(parsed.prompts) ? parsed.prompts : [],
      };
    } catch {
      // Corrupt index, return empty
      return {
        version: '1.0',
        prompts: [],
      };
    }
  }

  /**
   * Save index to file for a specific source
   */
  private async saveIndex(index: PromptsIndex, source: PromptSource): Promise<void> {
    const indexPath = this.getIndexPath(source);
    await fs.ensureDir(path.dirname(indexPath));
    await fs.writeFile(indexPath, JSON.stringify(index, null, 2), 'utf-8');
  }

  /**
   * Add prompt to index
   */
  private async addToIndex(metadata: PromptMetadata): Promise<void> {
    const index = await this.loadIndex(metadata.source);

    // Remove any existing entry with same ID (shouldn't happen, but be safe)
    index.prompts = index.prompts.filter((p) => p.id !== metadata.id);

    // Add new entry
    index.prompts.push(metadata);

    await this.saveIndex(index, metadata.source);
  }
}
