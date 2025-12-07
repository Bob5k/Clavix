/**
 * Integration handling for Clavix initialization
 */

import { DocInjector } from '../../../core/doc-injector.js';
import { AgentsMdGenerator } from '../../../core/adapters/agents-md-generator.js';
import { OctoMdGenerator } from '../../../core/adapters/octo-md-generator.js';
import { WarpMdGenerator } from '../../../core/adapters/warp-md-generator.js';
import { CopilotInstructionsGenerator } from '../../../core/adapters/copilot-instructions-generator.js';
import { InstructionsGenerator } from '../../../core/adapters/instructions-generator.js';
import type { AgentManager } from '../../../core/agent-manager.js';

/**
 * Doc generator integrations (not regular adapters)
 */
export const DOC_GENERATOR_INTEGRATIONS = [
  'agents-md',
  'octo-md',
  'warp-md',
  'copilot-instructions',
] as const;

/**
 * Integrations that use colon separator (CLI tools)
 */
export const COLON_SEPARATOR_INTEGRATIONS = [
  'claude-code',
  'gemini',
  'qwen',
  'crush',
  'llxprt',
  'augment',
] as const;

/**
 * Check if an integration is a doc generator (not a regular adapter)
 */
export function isDocGeneratorIntegration(integrationName: string): boolean {
  return (DOC_GENERATOR_INTEGRATIONS as readonly string[]).includes(integrationName);
}

/**
 * Generate content for a doc generator integration
 */
export async function generateDocGeneratorContent(integrationName: string): Promise<void> {
  switch (integrationName) {
    case 'agents-md':
      await AgentsMdGenerator.generate();
      break;
    case 'octo-md':
      await OctoMdGenerator.generate();
      break;
    case 'warp-md':
      await WarpMdGenerator.generate();
      break;
    case 'copilot-instructions':
      await CopilotInstructionsGenerator.generate();
      break;
  }
}

/**
 * Clean up a doc generator integration
 */
export async function cleanupDocGeneratorIntegration(integrationName: string): Promise<void> {
  switch (integrationName) {
    case 'agents-md':
      await DocInjector.removeBlock('AGENTS.md');
      break;
    case 'octo-md':
      await DocInjector.removeBlock('OCTO.md');
      break;
    case 'warp-md':
      await DocInjector.removeBlock('WARP.md');
      break;
    case 'copilot-instructions':
      await DocInjector.removeBlock('.github/copilot-instructions.md');
      break;
  }
}

/**
 * Check if instructions folder generation is needed
 */
export function needsInstructionsGeneration(integrations: string[]): boolean {
  return InstructionsGenerator.needsGeneration(integrations);
}

/**
 * Generate the instructions folder
 */
export async function generateInstructionsFolder(): Promise<void> {
  await InstructionsGenerator.generate();
}

/**
 * Get display names for integrations
 */
export function getDisplayNames(agentManager: AgentManager, integrations: string[]): string[] {
  return integrations.map((name) => {
    const adapter = agentManager.getAdapter(name);
    return adapter?.displayName || name;
  });
}

/**
 * Determine the command separator based on selected integrations
 */
export function determineCommandSeparator(integrations: string[]): {
  primary: string;
  alternate?: string;
} {
  const colonList = COLON_SEPARATOR_INTEGRATIONS as readonly string[];
  const usesColon = integrations.some((i) => colonList.includes(i));
  const usesHyphen = integrations.some((i) => !colonList.includes(i));

  if (usesColon && !usesHyphen) {
    return { primary: ':' };
  }
  if (usesHyphen && !usesColon) {
    return { primary: '-' };
  }
  return { primary: ':', alternate: '-' };
}
