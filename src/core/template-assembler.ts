import { promises as fs } from 'fs';
import * as path from 'path';

/**
 * Represents a component slot in a template
 */
export interface ComponentSlot {
  name: string;
  path: string;
  required: boolean;
  variables?: Record<string, string>;
}

/**
 * Result of template assembly
 */
export interface AssemblyResult {
  content: string;
  includedComponents: string[];
  missingComponents: string[];
  variablesUsed: string[];
}

/**
 * TemplateAssembler - v4.0 Template Modularity System
 *
 * Assembles templates from reusable components using {{INCLUDE:}} markers.
 * Supports variable interpolation with mustache-style syntax.
 *
 * Usage:
 * ```typescript
 * const assembler = new TemplateAssembler('/path/to/templates');
 * const result = await assembler.assembleTemplate('fast.md');
 * ```
 *
 * Include marker formats:
 * - Basic: {{INCLUDE:mode-headers/planning-mode.md}}
 * - With variables: {{INCLUDE:mode-headers/planning-mode.md MODE_TYPE="Requirements & Planning"}}
 */
export class TemplateAssembler {
  private componentCache: Map<string, string> = new Map();
  private templatesBasePath: string;
  private componentsPath: string;

  constructor(templatesBasePath: string) {
    this.templatesBasePath = templatesBasePath;
    this.componentsPath = path.join(templatesBasePath, 'slash-commands', '_components');
  }

  /**
   * Assemble a template by resolving all {{INCLUDE:}} markers
   */
  async assembleTemplate(templatePath: string): Promise<AssemblyResult> {
    const fullPath = path.join(
      this.templatesBasePath,
      'slash-commands',
      '_canonical',
      templatePath
    );
    const content = await this.loadFile(fullPath);

    return this.processIncludes(content);
  }

  /**
   * Assemble template from raw content string
   */
  async assembleFromContent(content: string): Promise<AssemblyResult> {
    return this.processIncludes(content);
  }

  /**
   * Check if a template contains include markers
   */
  hasIncludes(content: string): boolean {
    return /\{\{INCLUDE:[^}]+\}\}/.test(content);
  }

  /**
   * Process all include markers in content
   */
  private async processIncludes(content: string): Promise<AssemblyResult> {
    const includedComponents: string[] = [];
    const missingComponents: string[] = [];
    const variablesUsed: Set<string> = new Set();

    // Regex to match {{INCLUDE:path/to/component.md VAR1="value1" VAR2="value2"}}
    const includeRegex = /\{\{INCLUDE:([^\s}]+)(?:\s+([^}]*))?\}\}/g;

    let processedContent = content;
    let match;

    // Find all includes first to avoid regex state issues
    const includes: Array<{
      fullMatch: string;
      componentPath: string;
      variablesStr: string | undefined;
    }> = [];

    while ((match = includeRegex.exec(content)) !== null) {
      includes.push({
        fullMatch: match[0],
        componentPath: match[1],
        variablesStr: match[2],
      });
    }

    // Process each include
    for (const include of includes) {
      const { fullMatch, componentPath, variablesStr } = include;

      try {
        // Parse variables if present
        const variables = this.parseVariables(variablesStr);
        Object.keys(variables).forEach((v) => variablesUsed.add(v));

        // Load component
        let componentContent = await this.loadComponent(componentPath);

        // Interpolate variables
        componentContent = this.interpolateVariables(componentContent, variables);

        // Replace the include marker with component content
        processedContent = processedContent.replace(fullMatch, componentContent);
        includedComponents.push(componentPath);
      } catch {
        // Component not found or error loading
        missingComponents.push(componentPath);
        // Leave a comment in place of the missing component
        processedContent = processedContent.replace(
          fullMatch,
          `<!-- MISSING COMPONENT: ${componentPath} -->`
        );
      }
    }

    // Process nested includes (recursive)
    if (this.hasIncludes(processedContent)) {
      const nestedResult = await this.processIncludes(processedContent);
      processedContent = nestedResult.content;
      includedComponents.push(...nestedResult.includedComponents);
      missingComponents.push(...nestedResult.missingComponents);
      nestedResult.variablesUsed.forEach((v) => variablesUsed.add(v));
    }

    return {
      content: processedContent,
      includedComponents,
      missingComponents,
      variablesUsed: Array.from(variablesUsed),
    };
  }

  /**
   * Parse variable assignments from include marker
   * Format: VAR1="value1" VAR2="value2"
   */
  private parseVariables(variablesStr: string | undefined): Record<string, string> {
    const variables: Record<string, string> = {};

    if (!variablesStr) {
      return variables;
    }

    // Match KEY="value" or KEY='value' patterns
    const varRegex = /(\w+)=["']([^"']*)["']/g;
    let match;

    while ((match = varRegex.exec(variablesStr)) !== null) {
      variables[match[1]] = match[2];
    }

    return variables;
  }

  /**
   * Load a component file, using cache if available
   */
  private async loadComponent(componentPath: string): Promise<string> {
    // Check cache first
    if (this.componentCache.has(componentPath)) {
      return this.componentCache.get(componentPath)!;
    }

    const fullPath = path.join(this.componentsPath, componentPath);
    const content = await this.loadFile(fullPath);

    // Cache the component
    this.componentCache.set(componentPath, content);

    return content;
  }

  /**
   * Load a file from disk
   */
  private async loadFile(filePath: string): Promise<string> {
    return fs.readFile(filePath, 'utf-8');
  }

  /**
   * Interpolate variables in content using mustache-style syntax
   *
   * Supports:
   * - Simple variables: {{VAR_NAME}}
   * - Section blocks: {{#VAR_NAME}}content{{/VAR_NAME}}
   * - Array iteration: {{#ARRAY}}{{.}}{{/ARRAY}}
   */
  interpolateVariables(content: string, variables: Record<string, string | string[]>): string {
    let result = content;

    // Process section blocks first (for arrays and conditionals)
    // {{#VAR_NAME}}content{{/VAR_NAME}}
    const sectionRegex = /\{\{#(\w+)\}\}([\s\S]*?)\{\{\/\1\}\}/g;

    result = result.replace(sectionRegex, (match, varName, sectionContent) => {
      const value = variables[varName];

      if (value === undefined || value === null) {
        return ''; // Remove section if variable not set
      }

      if (Array.isArray(value)) {
        // Iterate over array
        return value
          .map((item) => {
            // Replace {{.}} with current item
            return sectionContent.replace(/\{\{\.\}\}/g, item);
          })
          .join('\n');
      }

      // For truthy non-array values, show the section content
      return sectionContent;
    });

    // Process simple variable replacements
    // {{VAR_NAME}}
    const simpleVarRegex = /\{\{(\w+)\}\}/g;

    result = result.replace(simpleVarRegex, (match, varName) => {
      const value = variables[varName];

      if (value === undefined || value === null) {
        return match; // Keep original if not found (might be a different kind of marker)
      }

      if (Array.isArray(value)) {
        return value.join(', ');
      }

      return String(value);
    });

    return result;
  }

  /**
   * Clear the component cache
   */
  clearCache(): void {
    this.componentCache.clear();
  }

  /**
   * Get list of cached components
   */
  getCachedComponents(): string[] {
    return Array.from(this.componentCache.keys());
  }

  /**
   * Preload all components into cache
   */
  async preloadComponents(): Promise<void> {
    const componentDirs = ['mode-headers', 'sections', 'troubleshooting'];

    for (const dir of componentDirs) {
      const dirPath = path.join(this.componentsPath, dir);

      try {
        const files = await fs.readdir(dirPath);

        for (const file of files) {
          if (file.endsWith('.md')) {
            const componentPath = path.join(dir, file);
            await this.loadComponent(componentPath);
          }
        }
      } catch {
        // Directory might not exist, skip
      }
    }
  }

  /**
   * Validate a template for include marker issues
   */
  async validateTemplate(templatePath: string): Promise<{
    valid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      const result = await this.assembleTemplate(templatePath);

      if (result.missingComponents.length > 0) {
        errors.push(`Missing components: ${result.missingComponents.join(', ')}`);
      }

      // Check for unresolved variables ({{VAR_NAME}} that weren't replaced)
      const unresolvedVars = result.content.match(/\{\{[A-Z_]+\}\}/g);
      if (unresolvedVars) {
        warnings.push(`Unresolved variables: ${unresolvedVars.join(', ')}`);
      }

      return {
        valid: errors.length === 0,
        errors,
        warnings,
      };
    } catch (error) {
      errors.push(`Failed to load template: ${error}`);
      return {
        valid: false,
        errors,
        warnings,
      };
    }
  }
}
