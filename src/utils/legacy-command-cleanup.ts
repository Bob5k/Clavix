import * as path from 'path';
import { AgentAdapter } from '../types/agent';
import { FileSystem } from './file-system';

export async function collectLegacyCommandFiles(
  adapter: AgentAdapter,
  commandNames: string[],
): Promise<string[]> {
  const legacyPaths = new Set<string>();
  const extension = adapter.fileExtension;
  const commandDir = path.resolve(adapter.getCommandPath());

  for (const name of commandNames) {
    const newFilePath = path.resolve(commandDir, adapter.getTargetFilename(name));
    const defaultFilePath = path.resolve(commandDir, `${name}${extension}`);

    if (adapter.name === 'cline') {
      const oldDir = path.resolve('.cline', 'workflows');
      const oldCandidates = [
        path.join(oldDir, `${name}${extension}`),
        path.join(oldDir, `clavix-${name}${extension}`),
      ];

      for (const candidate of oldCandidates) {
        const resolvedCandidate = path.resolve(candidate);
        if (resolvedCandidate !== newFilePath && await FileSystem.exists(resolvedCandidate)) {
          legacyPaths.add(resolvedCandidate);
        }
      }

      if (defaultFilePath !== newFilePath && await FileSystem.exists(defaultFilePath)) {
        legacyPaths.add(defaultFilePath);
      }
      continue;
    }

    if (adapter.name === 'gemini' || adapter.name === 'qwen') {
      const namespaced = commandDir.endsWith(path.join('commands', 'clavix'));
      if (!namespaced && defaultFilePath !== newFilePath && await FileSystem.exists(defaultFilePath)) {
        legacyPaths.add(defaultFilePath);
      }
    } else if (defaultFilePath !== newFilePath && await FileSystem.exists(defaultFilePath)) {
      legacyPaths.add(defaultFilePath);
    }
  }

  if (adapter.name === 'claude-code') {
    const commandsDir = path.resolve('.claude', 'commands');
    const colonFiles = await FileSystem.listFiles(commandsDir, /^clavix:.*\.md$/);
    for (const file of colonFiles) {
      legacyPaths.add(path.resolve(path.join(commandsDir, file)));
    }

    const clavixDir = path.resolve(commandsDir, 'clavix');
    const hyphenFiles = await FileSystem.listFiles(clavixDir, /^clavix-.*\.md$/);
    for (const file of hyphenFiles) {
      legacyPaths.add(path.resolve(path.join(clavixDir, file)));
    }
  }

  return Array.from(legacyPaths);
}
