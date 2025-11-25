import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { AgentAdapter, CommandTemplate } from '../types/agent.js';
import { FileSystem } from './file-system.js';
import { TemplateAssembler } from '../core/template-assembler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// v4.0: Singleton assembler instance for caching
let assemblerInstance: TemplateAssembler | null = null;

function getAssembler(): TemplateAssembler {
  if (!assemblerInstance) {
    const templatesDir = path.join(__dirname, '..', 'templates');
    assemblerInstance = new TemplateAssembler(templatesDir);
  }
  return assemblerInstance;
}

export async function loadCommandTemplates(_adapter: AgentAdapter): Promise<CommandTemplate[]> {
  // Load from canonical template source (always .md files)
  const templatesDir = getCanonicalTemplatesDirectory();
  const files = await FileSystem.listFiles(templatesDir);
  if (files.length === 0) {
    return [];
  }

  // Canonical templates are always .md files
  const commandFiles = files.filter((file) => file.endsWith('.md'));
  const templates: CommandTemplate[] = [];
  const assembler = getAssembler();

  for (const file of commandFiles) {
    const templatePath = path.join(templatesDir, file);
    let content = await FileSystem.readFile(templatePath);
    const name = file.slice(0, -3); // Remove .md extension

    // Extract description before processing includes
    const description = extractDescription(content);

    // v4.0: Process {{INCLUDE:}} markers if present
    if (assembler.hasIncludes(content)) {
      try {
        const result = await assembler.assembleFromContent(content);
        content = result.content;
      } catch (error) {
        // If assembly fails, use original content
        console.warn(`Template assembly warning for ${file}:`, error);
      }
    }

    // Clean content from markdown
    const cleanContent = stripFrontmatter(content);

    templates.push({
      name,
      content: cleanContent,
      description,
    });
  }

  return templates;
}

function getCanonicalTemplatesDirectory(): string {
  return path.join(__dirname, '..', 'templates', 'slash-commands', '_canonical');
}

/**
 * Strip YAML frontmatter from markdown content
 * Returns clean content without the --- delimited frontmatter
 */
function stripFrontmatter(content: string): string {
  // Match YAML frontmatter pattern: ---\n...\n---
  const frontmatterRegex = /^---\r?\n[\s\S]*?\r?\n---\r?\n/;
  return content.replace(frontmatterRegex, '').trim();
}

function extractDescription(content: string): string {
  const yamlMatch = content.match(/description:\s*(.+)/);
  if (yamlMatch) {
    return yamlMatch[1].trim().replace(/^['"]|['"]$/g, '');
  }

  const tomlMatch = content.match(/description\s*=\s*['"]?(.+?)['"]?(?:\r?\n|$)/);
  if (tomlMatch) {
    return tomlMatch[1].trim().replace(/^['"]|['"]$/g, '');
  }

  return '';
}
