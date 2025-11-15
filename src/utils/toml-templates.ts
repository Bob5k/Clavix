export interface ParsedTomlTemplate {
  description: string;
  prompt: string;
}

/**
 * Parse TOML-based slash command templates (Gemini/Qwen) and extract metadata.
 * Ensures the resulting prompt body does not include duplicated frontmatter.
 */
export function parseTomlSlashCommand(
  content: string,
  templateName: string,
  providerName: string,
): ParsedTomlTemplate {
  let normalized = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  if (normalized.charCodeAt(0) === 0xfeff) {
    normalized = normalized.slice(1);
  }

  const descriptionMatch = normalized.match(/^\s*description\s*=\s*(['"])(.*?)\1\s*$/m);
  const promptHeaderMatch = normalized.match(/^\s*prompt\s*=\s*"""/m);

  if (!promptHeaderMatch || promptHeaderMatch.index === undefined) {
    throw new Error(`Template ${templateName}.toml for ${providerName} is missing a prompt = """ ... """ block.`);
  }

  const bodyStart = promptHeaderMatch.index + promptHeaderMatch[0].length;
  const bodyRemainder = normalized.slice(bodyStart);
  const closingIndex = bodyRemainder.indexOf('"""');

  if (closingIndex === -1) {
    throw new Error(`Template ${templateName}.toml for ${providerName} does not terminate its prompt = """ ... """ block.`);
  }

  let promptBody = bodyRemainder.slice(0, closingIndex);
  const promptLines = promptBody.split('\n');

  while (promptLines.length > 0 && /^\s*(description\s*=|prompt\s*=)/.test(promptLines[0])) {
    promptLines.shift();
  }

  promptBody = promptLines.join('\n').replace(/^\n+/, '').replace(/[\s]+$/, '');

  return {
    description: descriptionMatch ? descriptionMatch[2] : '',
    prompt: promptBody,
  };
}
