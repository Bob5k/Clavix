import { BasePattern } from './base-pattern.js';
import { PromptIntent, PatternContext, PatternResult } from '../types.js';

/**
 * v4.0 Deep Mode Pattern: PRD Structure Enforcer
 *
 * Ensures PRD prompts include all necessary sections
 * for comprehensive product requirement documentation.
 */
export class PRDStructureEnforcer extends BasePattern {
  id = 'prd-structure-enforcer';
  name = 'PRD Structure Enforcer';
  description = 'Ensure PRD prompts include all necessary sections';
  applicableIntents: PromptIntent[] = ['prd-generation'];
  mode = 'deep' as const;
  priority = 9;

  // Required PRD sections with their purposes
  private readonly PRD_SECTIONS: PRDSection[] = [
    {
      id: 'problem',
      name: 'Problem Statement',
      keywords: ['problem', 'issue', 'pain point', 'challenge', 'need'],
      prompt: 'What problem does this solve? What pain points are being addressed?',
    },
    {
      id: 'users',
      name: 'Target Users',
      keywords: ['user', 'audience', 'persona', 'customer', 'stakeholder', 'who'],
      prompt: 'Who are the target users? What are their characteristics and needs?',
    },
    {
      id: 'goals',
      name: 'Goals & Success Metrics',
      keywords: ['goal', 'objective', 'success', 'metric', 'kpi', 'measure', 'outcome'],
      prompt: 'What are the measurable goals? How will success be measured?',
    },
    {
      id: 'requirements',
      name: 'Functional Requirements',
      keywords: ['feature', 'requirement', 'must', 'should', 'functionality', 'capability'],
      prompt: 'What specific functionality is required? List the features.',
    },
    {
      id: 'scope',
      name: 'Scope & Boundaries',
      keywords: ['scope', 'boundary', 'included', 'excluded', 'out of scope', 'limitation'],
      prompt: 'What is in scope and out of scope? What are the boundaries?',
    },
    {
      id: 'constraints',
      name: 'Constraints & Dependencies',
      keywords: ['constraint', 'dependency', 'limitation', 'assumption', 'prerequisite'],
      prompt: 'What technical or business constraints exist? What dependencies are there?',
    },
    {
      id: 'timeline',
      name: 'Timeline & Milestones',
      keywords: ['timeline', 'deadline', 'milestone', 'phase', 'sprint', 'release'],
      prompt: 'What is the timeline? What are key milestones?',
    },
    {
      id: 'risks',
      name: 'Risks & Mitigations',
      keywords: ['risk', 'mitigation', 'concern', 'blocker', 'issue'],
      prompt: 'What are potential risks? How will they be mitigated?',
    },
  ];

  apply(prompt: string, _context: PatternContext): PatternResult {
    const analysis = this.analyzePRDCompleteness(prompt);

    if (analysis.missingSections.length === 0) {
      return {
        enhancedPrompt: prompt,
        improvement: {
          dimension: 'completeness',
          description: 'PRD prompt already includes key sections',
          impact: 'low',
        },
        applied: false,
      };
    }

    // Generate enhancement section
    const enhancementSection = this.formatEnhancementSection(analysis);
    const enhancedPrompt = `${prompt}\n\n${enhancementSection}`;

    return {
      enhancedPrompt,
      improvement: {
        dimension: 'completeness',
        description: `Added ${analysis.missingSections.length} PRD sections for consideration`,
        impact: 'high',
      },
      applied: true,
    };
  }

  private analyzePRDCompleteness(prompt: string): PRDAnalysis {
    const lowerPrompt = prompt.toLowerCase();
    const presentSections: PRDSection[] = [];
    const missingSections: PRDSection[] = [];
    const weakSections: PRDSection[] = [];

    for (const section of this.PRD_SECTIONS) {
      const matchedKeywords = section.keywords.filter((kw) =>
        lowerPrompt.includes(kw.toLowerCase())
      );

      if (matchedKeywords.length >= 2) {
        // Section is well-covered
        presentSections.push(section);
      } else if (matchedKeywords.length === 1) {
        // Section is mentioned but weak
        weakSections.push(section);
      } else {
        // Section is missing
        missingSections.push(section);
      }
    }

    // Calculate completeness score
    const totalSections = this.PRD_SECTIONS.length;
    const coveredCount = presentSections.length + weakSections.length * 0.5;
    const completenessScore = Math.round((coveredCount / totalSections) * 100);

    return {
      presentSections,
      missingSections,
      weakSections,
      completenessScore,
    };
  }

  private formatEnhancementSection(analysis: PRDAnalysis): string {
    const lines = [
      '### PRD Completeness Check',
      '',
      `**Current coverage:** ${analysis.completenessScore}%`,
      '',
    ];

    // Critical missing sections
    if (analysis.missingSections.length > 0) {
      lines.push('**Missing sections to consider:**');
      lines.push('');
      analysis.missingSections.forEach((section) => {
        lines.push(`#### ${section.name}`);
        lines.push(`_${section.prompt}_`);
        lines.push('');
      });
    }

    // Weak sections that need elaboration
    if (analysis.weakSections.length > 0) {
      lines.push('**Sections that could be expanded:**');
      lines.push('');
      analysis.weakSections.forEach((section) => {
        lines.push(`- **${section.name}**: ${section.prompt}`);
      });
      lines.push('');
    }

    // Add PRD best practices reminder
    lines.push('---');
    lines.push('');
    lines.push('**PRD Best Practices:**');
    lines.push('- Be specific about user personas and their needs');
    lines.push('- Include measurable success criteria');
    lines.push('- Clearly define what is NOT in scope');
    lines.push('- Prioritize requirements (must-have vs nice-to-have)');
    lines.push('- Consider edge cases and error scenarios');

    return lines.join('\n');
  }
}

interface PRDSection {
  id: string;
  name: string;
  keywords: string[];
  prompt: string;
}

interface PRDAnalysis {
  presentSections: PRDSection[];
  missingSections: PRDSection[];
  weakSections: PRDSection[];
  completenessScore: number;
}
