import { describe, it, expect, beforeEach } from '@jest/globals';
import { ChecklistParser } from '../../src/core/checklist-parser';

describe('ChecklistParser', () => {
  let parser: ChecklistParser;

  beforeEach(() => {
    parser = new ChecklistParser();
  });

  describe('parse', () => {
    it('should parse validation checklist section', () => {
      const content = `
# Optimized Prompt

## Validation Checklist
☐ Code compiles without errors
☐ All requirements are implemented
☐ Tests pass with npm test

## Some other section
Content here
`;
      const result = parser.parse(content);

      expect(result.hasChecklist).toBe(true);
      expect(result.validationItems).toHaveLength(3);
      expect(result.validationItems[0].content).toBe('Code compiles without errors');
      expect(result.validationItems[1].content).toBe('All requirements are implemented');
      expect(result.validationItems[2].content).toBe('Tests pass with npm test');
    });

    it('should parse edge cases section', () => {
      const content = `
## Edge Cases to Consider
• **Empty input**: Should show validation error
• **Large dataset**: Must handle 10,000+ records
• **Network failure**: Should retry gracefully
`;
      const result = parser.parse(content);

      expect(result.hasChecklist).toBe(true);
      expect(result.edgeCases).toHaveLength(3);
      expect(result.edgeCases[0].content).toContain('Empty input');
      expect(result.edgeCases[1].content).toContain('Large dataset');
      expect(result.edgeCases[2].content).toContain('Network failure');
    });

    it('should parse risks section', () => {
      const content = `
## What Could Go Wrong
• **Security**: XSS vulnerability if input not sanitized
• **Performance**: Slow response for large queries
`;
      const result = parser.parse(content);

      expect(result.hasChecklist).toBe(true);
      expect(result.risks).toHaveLength(2);
      expect(result.risks[0].content).toContain('Security');
      expect(result.risks[1].content).toContain('Performance');
    });

    it('should handle content without risks section', () => {
      const content = `
## Other Section
• **Memory leak**: Unclosed connections
`;
      const result = parser.parse(content);

      // Should not parse as risks because it's not a risk section header
      expect(result.risks).toHaveLength(0);
    });

    it('should assign unique IDs to items', () => {
      const content = `
## Validation Checklist
☐ Item one
☐ Item two

## Edge Cases to Consider
• **Case one**: Description
`;
      const result = parser.parse(content);

      const allIds = [
        ...result.validationItems.map((i) => i.id),
        ...result.edgeCases.map((i) => i.id),
      ];

      // Check all IDs are unique
      const uniqueIds = new Set(allIds);
      expect(uniqueIds.size).toBe(allIds.length);
    });

    it('should set correct categories for items', () => {
      const content = `
## Validation Checklist
☐ Item one

## Edge Cases to Consider
• **Case**: Description

## What Could Go Wrong
• **Risk**: Description
`;
      const result = parser.parse(content);

      expect(result.validationItems[0].category).toBe('validation');
      expect(result.edgeCases[0].category).toBe('edge-case');
      expect(result.risks[0].category).toBe('risk');
    });

    it('should return hasChecklist=false for empty content', () => {
      const result = parser.parse('');
      expect(result.hasChecklist).toBe(false);
      expect(result.totalItems).toBe(0);
    });

    it('should return hasChecklist=false for content without checklist sections', () => {
      const content = `
# Just a regular prompt

No checklist items here.

## Some Section
Regular content without checklist format.
`;
      const result = parser.parse(content);
      expect(result.hasChecklist).toBe(false);
    });

    it('should calculate totalItems correctly', () => {
      const content = `
## Validation Checklist
☐ Item one
☐ Item two
☐ Item three

## Edge Cases to Consider
• **Case one**: Description
• **Case two**: Description

## What Could Go Wrong
• **Risk one**: Description
`;
      const result = parser.parse(content);

      expect(result.totalItems).toBe(6);
      expect(result.validationItems.length + result.edgeCases.length + result.risks.length).toBe(6);
    });

    it('should handle grouped validation items', () => {
      const content = `
## Validation Checklist
**Functionality:**
☐ Feature works correctly
☐ All endpoints respond

**Testing:**
☐ Unit tests pass
☐ Integration tests pass
`;
      const result = parser.parse(content);

      expect(result.validationItems).toHaveLength(4);

      // Check groups are assigned
      const functionalityItems = result.validationItems.filter((i) => i.group === 'Functionality');
      const testingItems = result.validationItems.filter((i) => i.group === 'Testing');

      expect(functionalityItems.length).toBeGreaterThan(0);
      expect(testingItems.length).toBeGreaterThan(0);
    });
  });

  describe('detectVerificationType', () => {
    it('should detect automated verification for test-related items', () => {
      const type = parser.detectVerificationType('All tests pass with npm test');
      expect(type).toBe('automated');
    });

    it('should detect automated verification for build-related items', () => {
      const type = parser.detectVerificationType('Code compiles without errors');
      expect(type).toBe('automated');
    });

    it('should detect automated verification for lint-related items', () => {
      const type = parser.detectVerificationType('No linting errors or warnings');
      expect(type).toBe('automated');
    });

    it('should detect semi-automated verification for render-related items', () => {
      const type = parser.detectVerificationType('Component renders correctly');
      expect(type).toBe('semi-automated');
    });

    it('should detect semi-automated verification for console-related items', () => {
      const type = parser.detectVerificationType('No console errors in browser');
      expect(type).toBe('semi-automated');
    });

    it('should detect manual verification for requirement-related items', () => {
      const type = parser.detectVerificationType('All requirements are implemented');
      expect(type).toBe('manual');
    });

    it('should detect manual verification for edge case items', () => {
      const type = parser.detectVerificationType('Handles empty input correctly');
      expect(type).toBe('manual');
    });

    it('should default to manual for ambiguous items', () => {
      const type = parser.detectVerificationType('Some generic item description');
      expect(type).toBe('manual');
    });
  });

  describe('getSummary', () => {
    it('should return correct summary counts', () => {
      const content = `
## Validation Checklist
☐ Item one
☐ Item two
☐ Item three

## Edge Cases to Consider
• **Case one**: Description
• **Case two**: Description

## What Could Go Wrong
• **Risk one**: Description
`;
      const checklist = parser.parse(content);
      const summary = parser.getSummary(checklist);

      expect(summary.validation).toBe(3);
      expect(summary.edgeCases).toBe(2);
      expect(summary.risks).toBe(1);
      // Total is calculated from validation + edgeCases + risks
      expect(summary.validation + summary.edgeCases + summary.risks).toBe(6);
    });

    it('should return zero counts for empty checklist', () => {
      const checklist = parser.parse('');
      const summary = parser.getSummary(checklist);

      expect(summary.validation).toBe(0);
      expect(summary.edgeCases).toBe(0);
      expect(summary.risks).toBe(0);
    });

    it('should count verification types', () => {
      const content = `
## Validation Checklist
☐ Code compiles without errors
☐ Tests pass with npm test
☐ All requirements implemented
`;
      const checklist = parser.parse(content);
      const summary = parser.getSummary(checklist);

      expect(summary.automated).toBeGreaterThan(0);
      expect(summary.manual).toBeGreaterThan(0);
    });
  });

  describe('parseValidationSection', () => {
    it('should handle ☐ checkbox format', () => {
      const content = `
## Validation Checklist
☐ First item
☐ Second item
`;
      const items = parser.parseValidationSection(content);
      expect(items).toHaveLength(2);
    });

    it('should handle - checkbox format', () => {
      const content = `
## Validation Checklist
- [ ] First item
- [ ] Second item
`;
      const items = parser.parseValidationSection(content);
      expect(items).toHaveLength(2);
    });

    it('should handle mixed formats', () => {
      const content = `
## Validation Checklist
☐ Unicode checkbox
- [ ] Markdown checkbox
`;
      const items = parser.parseValidationSection(content);
      expect(items).toHaveLength(2);
    });
  });

  describe('parseEdgeCaseSection', () => {
    it('should parse bold scenario format', () => {
      const content = `
### Edge Cases to Consider
• **Empty input**: Should validate
• **Max length**: Should truncate
`;
      const items = parser.parseEdgeCaseSection(content);

      expect(items).toHaveLength(2);
      expect(items[0].content).toContain('Empty input');
      expect(items[1].content).toContain('Max length');
    });

    it('should handle bullet points without bold', () => {
      const content = `
### Edge Cases to Consider
• Empty input should validate
• Max length should truncate
`;
      const items = parser.parseEdgeCaseSection(content);

      expect(items).toHaveLength(2);
    });

    it('should return empty for missing section', () => {
      const content = `
### Other Section
Some content here
`;
      const items = parser.parseEdgeCaseSection(content);

      expect(items).toHaveLength(0);
    });
  });

  describe('parseRiskSection', () => {
    it('should parse What Could Go Wrong section', () => {
      const content = `
### What Could Go Wrong
• **Security**: XSS risk
• **Performance**: Slow queries
`;
      const items = parser.parseRiskSection(content);

      expect(items).toHaveLength(2);
      expect(items[0].category).toBe('risk');
    });

    it('should return empty for missing section', () => {
      const content = `
### Other Section
Some content
`;
      const items = parser.parseRiskSection(content);

      expect(items).toHaveLength(0);
    });
  });
});
