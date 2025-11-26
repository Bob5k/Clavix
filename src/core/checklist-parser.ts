/**
 * Clavix v4.8: Checklist Parser
 *
 * Parses validation checklists, edge cases, and risk sections from
 * deep mode prompt output files.
 */

import { ChecklistItem, ParsedChecklist, VerificationType } from '../types/verification.js';

/**
 * Regex patterns for parsing checklist sections
 */
const PATTERNS = {
  // Section headers (support both ## and ### headers)
  validationSection: /#{2,3}\s*Validation\s+Checklist[\s\S]*?(?=#{2,3}|$)/i,
  edgeCaseSection: /#{2,3}\s*Edge\s+Cases?\s+to\s+Consider[\s\S]*?(?=#{2,3}|$)/i,
  riskSection: /#{2,3}\s*What\s+Could\s+Go\s+Wrong[\s\S]*?(?=#{2,3}|$)/i,

  // Item patterns
  checklistItem: /[☐□○●◯]\s*(.+)$/gm, // Various checkbox characters
  categoryHeader: /\*\*(.+?):\*\*/g,
  edgeCaseItem: /[•\-*]\s*\*\*(.+?)\*\*:?\s*(.+?)$/gm,
  riskItem: /[•\-*]\s*\*\*(.+?)\*\*:?\s*(.+?)$/gm,
  bulletItem: /[•\-*]\s+(.+?)$/gm,
};

/**
 * Keywords for determining verification type
 */
const VERIFICATION_TYPE_KEYWORDS = {
  automated: [
    'compiles',
    'builds',
    'tests pass',
    'all tests',
    'test coverage',
    'lint',
    'typecheck',
    'no errors',
    'exit code',
    'npm test',
    'npm run',
    'build succeeds',
    'build passes',
  ],
  semiAutomated: [
    'renders',
    'displays',
    'console errors',
    'console warnings',
    'no warnings',
    'ui renders',
    'responsive',
    'screen sizes',
    'visual',
    'layout',
  ],
  // Everything else defaults to manual
};

/**
 * Parse checklist items from prompt content
 */
export class ChecklistParser {
  /**
   * Parse all checklist sections from prompt content
   */
  parse(content: string): ParsedChecklist {
    const validationItems = this.parseValidationSection(content);
    const edgeCases = this.parseEdgeCaseSection(content);
    const risks = this.parseRiskSection(content);

    const totalItems = validationItems.length + edgeCases.length + risks.length;

    return {
      validationItems,
      edgeCases,
      risks,
      hasChecklist: totalItems > 0,
      totalItems,
    };
  }

  /**
   * Parse the Validation Checklist section
   */
  parseValidationSection(content: string): ChecklistItem[] {
    const sectionMatch = content.match(PATTERNS.validationSection);
    if (!sectionMatch) return [];

    const section = sectionMatch[0];
    const items: ChecklistItem[] = [];
    let currentGroup: string | undefined;
    let itemIndex = 0;

    // Split by lines and process
    const lines = section.split('\n');

    for (const line of lines) {
      // Check for category header
      const categoryMatch = line.match(/\*\*(.+?):\*\*/);
      if (categoryMatch) {
        currentGroup = categoryMatch[1].trim();
        continue;
      }

      // Check for checklist item (Unicode checkbox or markdown checkbox)
      const itemMatch = line.match(/(?:[☐□○●◯]|-\s*\[\s*\])\s*(.+)$/);
      if (itemMatch) {
        const itemContent = itemMatch[1].trim();
        const verificationType = this.detectVerificationType(itemContent);

        items.push({
          id: `validation-${++itemIndex}`,
          category: 'validation',
          content: itemContent,
          group: currentGroup,
          verificationType,
        });
      }
    }

    return items;
  }

  /**
   * Parse the Edge Cases to Consider section
   */
  parseEdgeCaseSection(content: string): ChecklistItem[] {
    const sectionMatch = content.match(PATTERNS.edgeCaseSection);
    if (!sectionMatch) return [];

    const section = sectionMatch[0];
    const items: ChecklistItem[] = [];
    let itemIndex = 0;

    // Match edge case items with scenario and consideration
    const regex = /[•\-*]\s*\*\*(.+?)\*\*:?\s*(.+?)$/gm;
    let match;

    while ((match = regex.exec(section)) !== null) {
      const scenario = match[1].trim();
      const consideration = match[2].trim();
      const itemContent = `${scenario}: ${consideration}`;

      items.push({
        id: `edge-case-${++itemIndex}`,
        category: 'edge-case',
        content: itemContent,
        group: scenario,
        verificationType: 'manual', // Edge cases are typically manual
      });
    }

    // Also try to match simple bullet items without bold scenario
    if (items.length === 0) {
      const simpleRegex = /[•\-*]\s+([^*\n]+)$/gm;
      while ((match = simpleRegex.exec(section)) !== null) {
        const itemContent = match[1].trim();
        if (itemContent && !itemContent.startsWith('#')) {
          items.push({
            id: `edge-case-${++itemIndex}`,
            category: 'edge-case',
            content: itemContent,
            verificationType: 'manual',
          });
        }
      }
    }

    return items;
  }

  /**
   * Parse the What Could Go Wrong section
   */
  parseRiskSection(content: string): ChecklistItem[] {
    const sectionMatch = content.match(PATTERNS.riskSection);
    if (!sectionMatch) return [];

    const section = sectionMatch[0];
    const items: ChecklistItem[] = [];
    let itemIndex = 0;

    // Match risk items with bold titles
    const regex = /[•\-*]\s*\*\*(.+?)\*\*:?\s*(.*)$/gm;
    let match;

    while ((match = regex.exec(section)) !== null) {
      const risk = match[1].trim();
      const details = match[2]?.trim() || '';
      const itemContent = details ? `${risk}: ${details}` : risk;

      items.push({
        id: `risk-${++itemIndex}`,
        category: 'risk',
        content: itemContent,
        group: risk,
        verificationType: 'manual', // Risks are typically manual verification
      });
    }

    // Also try to match simple bullet items
    if (items.length === 0) {
      const simpleRegex = /[•\-*]\s+([^*\n]+)$/gm;
      while ((match = simpleRegex.exec(section)) !== null) {
        const itemContent = match[1].trim();
        if (itemContent && !itemContent.startsWith('#')) {
          items.push({
            id: `risk-${++itemIndex}`,
            category: 'risk',
            content: itemContent,
            verificationType: 'manual',
          });
        }
      }
    }

    return items;
  }

  /**
   * Detect verification type based on item content
   */
  detectVerificationType(content: string): VerificationType {
    const lowerContent = content.toLowerCase();

    // Check for automated keywords
    for (const keyword of VERIFICATION_TYPE_KEYWORDS.automated) {
      if (lowerContent.includes(keyword)) {
        return 'automated';
      }
    }

    // Check for semi-automated keywords
    for (const keyword of VERIFICATION_TYPE_KEYWORDS.semiAutomated) {
      if (lowerContent.includes(keyword)) {
        return 'semi-automated';
      }
    }

    // Default to manual
    return 'manual';
  }

  /**
   * Get a summary of the parsed checklist
   */
  getSummary(checklist: ParsedChecklist): {
    validation: number;
    edgeCases: number;
    risks: number;
    automated: number;
    semiAutomated: number;
    manual: number;
  } {
    const allItems = [...checklist.validationItems, ...checklist.edgeCases, ...checklist.risks];

    return {
      validation: checklist.validationItems.length,
      edgeCases: checklist.edgeCases.length,
      risks: checklist.risks.length,
      automated: allItems.filter((i) => i.verificationType === 'automated').length,
      semiAutomated: allItems.filter((i) => i.verificationType === 'semi-automated').length,
      manual: allItems.filter((i) => i.verificationType === 'manual').length,
    };
  }

  /**
   * Check if content has any checklist sections
   */
  hasChecklist(content: string): boolean {
    return (
      PATTERNS.validationSection.test(content) ||
      PATTERNS.edgeCaseSection.test(content) ||
      PATTERNS.riskSection.test(content)
    );
  }
}
