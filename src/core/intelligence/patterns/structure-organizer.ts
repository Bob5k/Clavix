import { BasePattern } from './base-pattern.js';
import { PatternContext, PatternResult, PromptIntent } from '../types.js';

/**
 * Structure Organizer Pattern
 *
 * Reorders information logically following the flow:
 * Objective → Requirements → Technical Constraints → Expected Output → Success Criteria
 *
 * Priority: HIGH (8)
 */
export class StructureOrganizer extends BasePattern {
  id = 'structure-organizer';
  name = 'Structure Organizer';
  description = 'Reorders information into logical sections';
  applicableIntents: PromptIntent[] = [
    'code-generation',
    'planning',
    'refinement',
    'debugging',
    'documentation',
  ];
  mode: 'fast' | 'deep' | 'both' = 'both';
  priority = 8; // High priority

  apply(prompt: string, _context: PatternContext): PatternResult {
    // Detect existing sections
    const sections = this.detectSections(prompt);

    // If already well-structured, minimal changes
    if (sections.length === 0 || this.isWellOrdered(sections)) {
      const enhanced = this.addSectionHeaders(prompt);
      return {
        enhancedPrompt: enhanced,
        improvement: {
          dimension: 'structure',
          description: 'Added section headers for clarity',
          impact: 'low',
        },
        applied: enhanced !== prompt,
      };
    }

    // Extract content by type
    const objective = this.extractObjective(prompt);
    const requirements = this.extractRequirements(prompt);
    const technical = this.extractTechnical(prompt);
    const expectedOutput = this.extractExpectedOutput(prompt);
    const successCriteria = this.extractSuccessCriteria(prompt);
    const constraints = this.extractConstraints(prompt);
    const other = this.extractOther(prompt, [
      objective,
      requirements,
      technical,
      expectedOutput,
      successCriteria,
      constraints,
    ]);

    // Build structured output
    let structured = '';
    let sectionsCount = 0;

    if (objective) {
      structured += '## Objective\n\n' + objective + '\n\n';
      sectionsCount++;
    }

    if (requirements) {
      structured += '## Requirements\n\n' + requirements + '\n\n';
      sectionsCount++;
    }

    if (technical) {
      structured += '## Technical Constraints\n\n' + technical + '\n\n';
      sectionsCount++;
    }

    if (constraints) {
      structured += '## Constraints\n\n' + constraints + '\n\n';
      sectionsCount++;
    }

    if (expectedOutput) {
      structured += '## Expected Output\n\n' + expectedOutput + '\n\n';
      sectionsCount++;
    }

    if (successCriteria) {
      structured += '## Success Criteria\n\n' + successCriteria + '\n\n';
      sectionsCount++;
    }

    if (other) {
      structured += other + '\n';
    }

    const enhanced = structured.trim();

    return {
      enhancedPrompt: enhanced,
      improvement: {
        dimension: 'structure',
        description: `Reorganized content into ${sectionsCount} logical sections`,
        impact: sectionsCount >= 4 ? 'high' : sectionsCount >= 2 ? 'medium' : 'low',
      },
      applied: true,
    };
  }

  private detectSections(prompt: string): string[] {
    const sectionMarkers = [
      /^#+\s+.+$/gm, // Markdown headers
      /^[A-Z][^.!?]+:$/gm, // "Objective:", "Requirements:"
      /^\d+\.\s+[A-Z]/gm, // Numbered lists
      /^[-*]\s+/gm, // Bullet points
    ];

    const sections: string[] = [];
    for (const marker of sectionMarkers) {
      const matches = prompt.match(marker);
      if (matches) {
        sections.push(...matches);
      }
    }

    return sections;
  }

  private isWellOrdered(sections: string[]): boolean {
    const idealOrder = ['objective', 'requirement', 'technical', 'constraint', 'output', 'success'];

    let lastIndex = -1;
    for (const section of sections) {
      const sectionLower = section.toLowerCase();
      const currentIndex = idealOrder.findIndex((keyword) => sectionLower.includes(keyword));

      if (currentIndex !== -1) {
        if (currentIndex < lastIndex) {
          return false; // Out of order
        }
        lastIndex = currentIndex;
      }
    }

    return true;
  }

  private isDisorganized(prompt: string): boolean {
    // Check for requirements before objective
    const objectiveIndex = prompt.toLowerCase().indexOf('objective');
    const requirementIndex = prompt.toLowerCase().indexOf('requirement');

    if (objectiveIndex > 0 && requirementIndex > 0 && requirementIndex < objectiveIndex) {
      return true;
    }

    // Check for output before requirements
    const outputIndex = prompt.toLowerCase().indexOf('output');
    if (outputIndex > 0 && requirementIndex > 0 && outputIndex < requirementIndex) {
      return true;
    }

    return false;
  }

  private extractObjective(prompt: string): string {
    const patterns = [
      /(?:objective|goal|purpose|need to|want to)[:]\s*(.+?)(?:\n\n|$)/is,
      /^(.{20,100}?)(?:\n|$)/i, // First sentence if no explicit objective
    ];

    for (const pattern of patterns) {
      const match = prompt.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }

    return '';
  }

  private extractRequirements(prompt: string): string {
    const pattern = /(?:requirements?|must have|need|should)[:]\s*(.+?)(?:\n\n|##|$)/is;
    const match = prompt.match(pattern);
    return match ? match[1].trim() : '';
  }

  private extractTechnical(prompt: string): string {
    const pattern =
      /(?:technical|tech stack|technology|using|built? with)[:]\s*(.+?)(?:\n\n|##|$)/is;
    const match = prompt.match(pattern);
    return match ? match[1].trim() : '';
  }

  private extractExpectedOutput(prompt: string): string {
    const pattern = /(?:expected output|output|result|deliverable)[:]\s*(.+?)(?:\n\n|##|$)/is;
    const match = prompt.match(pattern);
    return match ? match[1].trim() : '';
  }

  private extractSuccessCriteria(prompt: string): string {
    const pattern = /(?:success criteria|success|criteria|measure)[:]\s*(.+?)(?:\n\n|##|$)/is;
    const match = prompt.match(pattern);
    return match ? match[1].trim() : '';
  }

  private extractConstraints(prompt: string): string {
    const pattern = /(?:constraints?|limitations?|must not|cannot)[:]\s*(.+?)(?:\n\n|##|$)/is;
    const match = prompt.match(pattern);
    return match ? match[1].trim() : '';
  }

  private extractOther(prompt: string, extracted: string[]): string {
    let remaining = prompt;

    for (const section of extracted) {
      if (section) {
        remaining = remaining.replace(section, '');
      }
    }

    remaining = remaining.replace(/#{1,6}\s*.+\n/g, ''); // Remove headers
    remaining = remaining.replace(/\n{3,}/g, '\n\n'); // Normalize newlines

    return remaining.trim();
  }

  private addSectionHeaders(prompt: string): string {
    // If prompt already has headers, return as-is
    if (prompt.match(/^#+\s+/m)) {
      return prompt;
    }

    // Add a simple objective header
    return '## Objective\n\n' + prompt;
  }
}
