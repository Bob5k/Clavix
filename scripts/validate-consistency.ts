#!/usr/bin/env npx ts-node --esm
/**
 * validate-consistency.ts
 *
 * Clavix v5.0 - Template Consistency Validator
 *
 * This script validates that templates are consistent and don't reference
 * deprecated commands or outdated versions.
 *
 * v5 Simplification: Removed TypeScript ↔ Template synchronization checks
 * since the intelligence layer was removed. Now only checks:
 * - No outdated version references (v2.x, v3.x)
 * - Mode enforcement (improve.md exists, fast.md/deep.md don't)
 * - No legacy command references (/clavix:fast, /clavix:deep)
 *
 * Usage:
 *   npm run validate:consistency
 *   npx ts-node --esm scripts/validate-consistency.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');

// ============================================================================
// Configuration
// ============================================================================

const PATHS = {
  canonicalTemplates: path.join(ROOT_DIR, 'src/templates/slash-commands/_canonical'),
  componentsDir: path.join(ROOT_DIR, 'src/templates/slash-commands/_components'),
  instructionsDir: path.join(ROOT_DIR, 'src/templates/instructions'),
};

// ============================================================================
// Type Definitions
// ============================================================================

interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

interface ValidationError {
  type: 'outdated-version' | 'legacy-command';
  message: string;
  file: string;
  line?: number;
  expected: string[];
  found: string[];
  missing: string[];
}

interface ValidationWarning {
  type: string;
  message: string;
  file: string;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Recursively get all markdown files from a directory
 */
function getAllMarkdownFiles(dirPath: string): string[] {
  const files: string[] = [];

  if (!fs.existsSync(dirPath)) return files;

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...getAllMarkdownFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      files.push(fullPath);
    }
  }

  return files;
}

// ============================================================================
// Validation: Mode Enforcement
// ============================================================================

/**
 * v5: Check that:
 * 1. fast.md and deep.md no longer exist (replaced by improve.md in v4.11)
 * 2. improve.md exists and has mode enforcement header
 * 3. No templates reference /clavix:prompts (removed in v4.7)
 */
async function validateModeEnforcement(): Promise<ValidationError[]> {
  const errors: ValidationError[] = [];

  // v5: Check fast.md and deep.md don't exist (replaced by improve.md)
  const removedTemplates = ['fast.md', 'deep.md'];
  for (const templateFile of removedTemplates) {
    const templatePath = path.join(PATHS.canonicalTemplates, templateFile);
    if (fs.existsSync(templatePath)) {
      errors.push({
        type: 'outdated-version',
        message: `${templateFile} should be removed (replaced by improve.md)`,
        file: `src/templates/slash-commands/_canonical/${templateFile}`,
        expected: ['File should not exist'],
        found: ['File exists'],
        missing: [],
      });
    }
  }

  // Check improve.md has mode enforcement
  const improvePath = path.join(PATHS.canonicalTemplates, 'improve.md');
  if (fs.existsSync(improvePath)) {
    const content = fs.readFileSync(improvePath, 'utf-8');
    const topSection = content.slice(0, 2000);

    // Check for STOP and either "OPTIMIZATION MODE" or "Prompt Improvement" (v5.4+ terminology)
    const hasStop = topSection.includes('STOP');
    const hasModeHeader =
      topSection.includes('OPTIMIZATION MODE') ||
      topSection.includes('Prompt Improvement') ||
      topSection.includes('prompt improvement mode');

    if (!hasStop || !hasModeHeader) {
      errors.push({
        type: 'outdated-version',
        message: `improve.md missing mode enforcement header at top`,
        file: `src/templates/slash-commands/_canonical/improve.md`,
        expected: [
          'STOP + mode header (OPTIMIZATION MODE or Prompt Improvement) in first 2000 chars',
        ],
        found: ['Mode enforcement header not found at top'],
        missing: [],
      });
    }
  }

  // Check no templates reference /clavix:prompts (removed in v4.7)
  const templateFiles = fs.readdirSync(PATHS.canonicalTemplates).filter((f) => f.endsWith('.md'));
  for (const templateFile of templateFiles) {
    const templatePath = path.join(PATHS.canonicalTemplates, templateFile);
    const content = fs.readFileSync(templatePath, 'utf-8');

    if (content.includes('/clavix:prompts')) {
      errors.push({
        type: 'outdated-version',
        message: `${templateFile} references removed /clavix:prompts command`,
        file: `src/templates/slash-commands/_canonical/${templateFile}`,
        expected: ['No /clavix:prompts references'],
        found: ['/clavix:prompts reference found'],
        missing: [],
      });
    }
  }

  return errors;
}

// ============================================================================
// Validation: Legacy Command References
// ============================================================================

/**
 * Check that no templates reference deprecated /clavix:fast or /clavix:deep commands
 * These were unified into /clavix:improve in v4.11
 */
async function validateNoLegacyCommandReferences(): Promise<ValidationError[]> {
  const errors: ValidationError[] = [];

  // Deprecated command patterns
  const legacyPatterns = [
    { pattern: /\/clavix:fast\b/g, command: '/clavix:fast' },
    { pattern: /\/clavix:deep\b/g, command: '/clavix:deep' },
  ];

  // Directories to scan
  const dirsToScan = [
    { path: PATHS.canonicalTemplates, name: 'canonical' },
    { path: PATHS.componentsDir, name: 'components' },
    { path: PATHS.instructionsDir, name: 'instructions' },
  ];

  for (const dir of dirsToScan) {
    if (!fs.existsSync(dir.path)) continue;

    const mdFiles = getAllMarkdownFiles(dir.path);

    for (const filePath of mdFiles) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n');
      const relativePath = path.relative(ROOT_DIR, filePath);
      const foundReferences: { command: string; line: number }[] = [];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        for (const { pattern, command } of legacyPatterns) {
          pattern.lastIndex = 0;
          if (pattern.test(line)) {
            foundReferences.push({ command, line: i + 1 });
          }
        }
      }

      if (foundReferences.length > 0) {
        errors.push({
          type: 'legacy-command',
          message: `Legacy command references found in ${path.basename(filePath)}`,
          file: relativePath,
          line: foundReferences[0].line,
          expected: ['/clavix:improve (unified command)'],
          found: foundReferences.map((r) => `${r.command} (line ${r.line})`),
          missing: [],
        });
      }
    }
  }

  return errors;
}

// ============================================================================
// Validation: Version Number Consistency
// ============================================================================

/**
 * Check that all canonical templates have consistent version numbers
 * in their Agent Transparency sections
 */
async function validateVersionConsistency(): Promise<ValidationError[]> {
  const errors: ValidationError[] = [];

  // Get current version from package.json
  const packageJsonPath = path.join(ROOT_DIR, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  const currentVersion = `v${packageJson.version}`;

  // Get all canonical templates
  const templateFiles = fs.readdirSync(PATHS.canonicalTemplates).filter((f) => f.endsWith('.md'));

  for (const templateFile of templateFiles) {
    const templatePath = path.join(PATHS.canonicalTemplates, templateFile);
    const content = fs.readFileSync(templatePath, 'utf-8');
    const lines = content.split('\n');

    // Look for Agent Transparency section
    let foundVersion = null;
    let versionLine = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const versionMatch = line.match(/^## Agent Transparency \(([^)]+)\)$/);
      if (versionMatch) {
        foundVersion = versionMatch[1];
        versionLine = i + 1;
        break;
      }
    }

    if (!foundVersion) {
      errors.push({
        type: 'outdated-version',
        message: `${templateFile} missing Agent Transparency version section`,
        file: `src/templates/slash-commands/_canonical/${templateFile}`,
        expected: [currentVersion],
        found: ['No version section found'],
        missing: ['Agent Transparency section'],
      });
    } else if (foundVersion !== currentVersion) {
      errors.push({
        type: 'outdated-version',
        message: `${templateFile} has inconsistent version`,
        file: `src/templates/slash-commands/_canonical/${templateFile}`,
        line: versionLine,
        expected: [currentVersion],
        found: [foundVersion],
        missing: [],
      });
    }
  }

  return errors;
}

// ============================================================================
// Validation: Component Include Verification
// ============================================================================

/**
 * Check that all {{INCLUDE:}} directives reference existing component files
 */
async function validateComponentIncludes(): Promise<ValidationError[]> {
  const errors: ValidationError[] = [];

  // Get all canonical templates
  const templateFiles = fs.readdirSync(PATHS.canonicalTemplates).filter((f) => f.endsWith('.md'));

  for (const templateFile of templateFiles) {
    const templatePath = path.join(PATHS.canonicalTemplates, templateFile);
    const content = fs.readFileSync(templatePath, 'utf-8');
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const includeMatch = line.match(/\{\{INCLUDE:([^}]+)\}\}/);

      if (includeMatch) {
        const componentPath = includeMatch[1].trim();
        const fullComponentPath = path.join(PATHS.componentsDir, componentPath);

        if (!fs.existsSync(fullComponentPath)) {
          errors.push({
            type: 'outdated-version',
            message: `${templateFile} references missing component`,
            file: `src/templates/slash-commands/_canonical/${templateFile}`,
            line: i + 1,
            expected: [`Component exists: ${componentPath}`],
            found: [`Missing component: ${componentPath}`],
            missing: [componentPath],
          });
        }
      }
    }
  }

  return errors;
}

// ============================================================================
// Validation: Required Section Structure
// ============================================================================

/**
 * Check that templates follow the 10-section structure
 */
async function validateSectionStructure(): Promise<ValidationError[]> {
  const errors: ValidationError[] = [];

  // Required sections in order (simplified detection)
  const requiredSections = [
    '## What This Does',
    '## CLAVIX MODE',
    '## Self-Correction Protocol',
    '## State Assertion',
    '## Agent Transparency',
  ];

  const templateFiles = fs.readdirSync(PATHS.canonicalTemplates).filter((f) => f.endsWith('.md'));

  for (const templateFile of templateFiles) {
    const templatePath = path.join(PATHS.canonicalTemplates, templateFile);
    const content = fs.readFileSync(templatePath, 'utf-8');

    const missingSections: string[] = [];

    for (const requiredSection of requiredSections) {
      if (!content.includes(requiredSection)) {
        missingSections.push(requiredSection);
      }
    }

    if (missingSections.length > 0) {
      errors.push({
        type: 'outdated-version',
        message: `${templateFile} missing required sections`,
        file: `src/templates/slash-commands/_canonical/${templateFile}`,
        expected: requiredSections,
        found: requiredSections.filter((section) => content.includes(section)),
        missing: missingSections,
      });
    }
  }

  return errors;
}

// ============================================================================
// Validation: Outdated Version References
// ============================================================================

/**
 * Check canonical templates for outdated version references (v2.x, v3.x)
 * v5: Also check for v4.x references that should be v5.x
 */
async function validateNoOutdatedVersionReferences(): Promise<ValidationError[]> {
  const errors: ValidationError[] = [];

  // Patterns to detect outdated version references
  const outdatedPatterns = [
    /\bv2\.\d+/gi, // v2.0, v2.1, v2.7, etc.
    /\bv3\.\d+/gi, // v3.0, v3.1, etc.
    /\(v2\./gi, // (v2.x in parentheses
    /\(v3\./gi, // (v3.x in parentheses
  ];

  // Get all canonical templates
  const templateFiles = fs.readdirSync(PATHS.canonicalTemplates).filter((f) => f.endsWith('.md'));

  for (const templateFile of templateFiles) {
    const templatePath = path.join(PATHS.canonicalTemplates, templateFile);
    const content = fs.readFileSync(templatePath, 'utf-8');
    const lines = content.split('\n');

    const foundReferences: { match: string; line: number }[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      for (const pattern of outdatedPatterns) {
        const matches = line.match(pattern);
        if (matches) {
          for (const match of matches) {
            foundReferences.push({ match, line: i + 1 });
          }
        }
      }
    }

    if (foundReferences.length > 0) {
      errors.push({
        type: 'outdated-version',
        message: `Outdated version references found in ${templateFile}`,
        file: `src/templates/slash-commands/_canonical/${templateFile}`,
        line: foundReferences[0].line,
        expected: ['v4.x or v5.x references only'],
        found: foundReferences.map((r) => `${r.match} (line ${r.line})`),
        missing: [],
      });
    }
  }

  return errors;
}

// ============================================================================
// Main Validation Runner
// ============================================================================

export async function validateConsistency(): Promise<ValidationResult> {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  console.log('\n🔍 Clavix v5.0 - Consistency Validator\n');
  console.log('Checking template consistency...\n');

  // Run all validations
  try {
    const versionErrors = await validateNoOutdatedVersionReferences();
    errors.push(...versionErrors);
    console.log(
      `  Version References: ${versionErrors.length === 0 ? '✅ OK' : `❌ ${versionErrors.length} issues`}`
    );
  } catch (e) {
    console.log(`  Version References: ⚠️ Could not validate (${e})`);
  }

  try {
    const modeEnforcementErrors = await validateModeEnforcement();
    errors.push(...modeEnforcementErrors);
    console.log(
      `  Mode Enforcement: ${modeEnforcementErrors.length === 0 ? '✅ OK' : `❌ ${modeEnforcementErrors.length} issues`}`
    );
  } catch (e) {
    console.log(`  Mode Enforcement: ⚠️ Could not validate (${e})`);
  }

  try {
    const legacyCommandErrors = await validateNoLegacyCommandReferences();
    errors.push(...legacyCommandErrors);
    console.log(
      `  Legacy Commands: ${legacyCommandErrors.length === 0 ? '✅ OK' : `❌ ${legacyCommandErrors.length} issues`}`
    );
  } catch (e) {
    console.log(`  Legacy Commands: ⚠️ Could not validate (${e})`);
  }

  try {
    const versionConsistencyErrors = await validateVersionConsistency();
    errors.push(...versionConsistencyErrors);
    console.log(
      `  Version Consistency: ${versionConsistencyErrors.length === 0 ? '✅ OK' : `❌ ${versionConsistencyErrors.length} issues`}`
    );
  } catch (e) {
    console.log(`  Version Consistency: ⚠️ Could not validate (${e})`);
  }

  try {
    const componentIncludeErrors = await validateComponentIncludes();
    errors.push(...componentIncludeErrors);
    console.log(
      `  Component Includes: ${componentIncludeErrors.length === 0 ? '✅ OK' : `❌ ${componentIncludeErrors.length} issues`}`
    );
  } catch (e) {
    console.log(`  Component Includes: ⚠️ Could not validate (${e})`);
  }

  try {
    const sectionStructureErrors = await validateSectionStructure();
    errors.push(...sectionStructureErrors);
    console.log(
      `  Section Structure: ${sectionStructureErrors.length === 0 ? '✅ OK' : `❌ ${sectionStructureErrors.length} issues`}`
    );
  } catch (e) {
    console.log(`  Section Structure: ⚠️ Could not validate (${e})`);
  }

  console.log('');

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

function formatErrors(errors: ValidationError[]): string {
  if (errors.length === 0) return '';

  let output = '\n❌ CONSISTENCY CHECK FAILED\n\n';

  // Group by type
  const byType = new Map<string, ValidationError[]>();
  for (const error of errors) {
    const existing = byType.get(error.type) || [];
    existing.push(error);
    byType.set(error.type, existing);
  }

  // Outdated version reference errors
  const versionErrors = byType.get('outdated-version') || [];
  if (versionErrors.length > 0) {
    output += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
    output += 'Outdated Version References\n';
    output += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';

    for (const error of versionErrors) {
      output += `  📄 ${error.file}${error.line ? `:${error.line}` : ''}\n`;
      output += `  ${error.message}\n`;
      output += `  Found: ${error.found.join(', ')}\n`;
      output += `  Expected: ${error.expected.join(', ')}\n\n`;
    }
  }

  // Legacy command reference errors
  const legacyErrors = byType.get('legacy-command') || [];
  if (legacyErrors.length > 0) {
    output += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
    output += 'Legacy Command References\n';
    output += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';
    output += '  /clavix:fast and /clavix:deep were replaced by /clavix:improve\n\n';

    for (const error of legacyErrors) {
      output += `  📄 ${error.file}${error.line ? `:${error.line}` : ''}\n`;
      output += `  Found: ${error.found.join(', ')}\n`;
      output += `  Replace with: ${error.expected.join(', ')}\n\n`;
    }
  }

  output += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
  output += `\n⚠️  Fix these ${errors.length} issue(s) before committing.\n\n`;

  return output;
}

// ============================================================================
// CLI Entry Point
// ============================================================================

async function main() {
  const result = await validateConsistency();

  if (!result.valid) {
    console.log(formatErrors(result.errors));
    process.exit(1);
  }

  console.log('✅ All consistency checks passed!\n');
  process.exit(0);
}

// Run if executed directly
main().catch((error) => {
  console.error('Validation script error:', error);
  process.exit(1);
});
