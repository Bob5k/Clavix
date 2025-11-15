import * as path from 'path';
import { AgentAdapter, CommandTemplate } from '../types/agent';
import { FileSystem } from './file-system';
import { parseTomlSlashCommand } from './toml-templates';

export async function loadCommandTemplates(adapter: AgentAdapter): Promise<CommandTemplate[]> {
  const templatesDir = getTemplatesDirectory(adapter.name);
  const files = await FileSystem.listFiles(templatesDir);
  if (files.length === 0) {
    return [];
  }

  const extension = adapter.fileExtension;
  const commandFiles = files.filter((file) => file.endsWith(extension));
  const templates: CommandTemplate[] = [];

  for (const file of commandFiles) {
    const templatePath = path.join(templatesDir, file);
    const content = await FileSystem.readFile(templatePath);
    const name = file.slice(0, -extension.length);

    if (extension === '.toml') {
      const parsed = parseTomlSlashCommand(content, name, adapter.name);
      templates.push({
        name,
        content: parsed.prompt,
        description: parsed.description,
      });
    } else {
      templates.push({
        name,
        content,
        description: extractDescription(content),
      });
    }
  }

  return templates;
}

function getTemplatesDirectory(adapterName: string): string {
  return path.join(__dirname, '..', 'templates', 'slash-commands', adapterName);
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
