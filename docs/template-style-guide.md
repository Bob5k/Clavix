# Clavix Template Style Guide

## Overview

This guide defines the standards and patterns for Clavix slash command templates. All templates must follow these guidelines to maintain consistency, quality, and agent-first design principles.

**Target Audience:** Template developers, contributors, and maintainers
**Purpose:** Ensure consistent high-quality templates across all Clavix workflows

---

## Template Structure Standards

### 10-Section Template Architecture

Every canonical template must follow this exact structure:

1. **Frontmatter** - YML metadata with name and description
2. **Title** - `# Clavix: [Command Name]`
3. **What This Does** - Clear functionality explanation
4. **CLAVIX MODE** - Mode boundaries and capabilities
5. **Self-Correction Protocol** - 6 mistake types with DETECT → STOP → CORRECT → RESUME
6. **State Assertion (REQUIRED)** - Standardized mode declaration
7. **Main Instructions** - Workflow-specific content
8. **Agent Transparency** - Version section with component includes
9. **Workflow Navigation** - Related commands and guidance
10. **Troubleshooting** - Common issues and recovery patterns

### Section Heading Format

```markdown
# Main Title (Section 1)
## Subtitle (Section 2)
### Sub-subtitle (Section 3)
```

**Requirements:**
- Use title case for section headings
- Maintain consistent spacing (two newlines before headings)
- Include emoji or symbols only where specifically defined

---

## Frontmatter Standards

### Required Structure

```yaml
---
name: "Clavix: [Command Name]"
description: [Clear, concise explanation - max 80 characters]
---
```

**Examples:**
```yaml
---
name: "Clavix: Improve Your Prompt"
description: Analyze and improve prompts with auto-detected depth
---
```

```yaml
---
name: "Clavix: Verify Implementation"
description: Verify implementation against requirements with comprehensive quality assessment
---
```

**Rules:**
- Name must start with "Clavix: "
- Description must be actionable and specific
- Maximum 80 characters for description
- No additional frontmatter fields allowed

---

## Mode Boundaries Documentation

### Planning vs Implementation Separation

**Planning Mode Templates (PRD, Improve, Plan, Start):**
- **Purpose:** Analysis, documentation, and strategy
- **What they do:** Create documents, analyze requirements, generate plans
- **What they DON'T do:** Write application code, implement features, modify user files

**Implementation Mode Templates (Implement):**
- **Purpose:** Building and coding
- **What they do:** Write code, create files, execute tasks
- **What they DON'T do:** Change requirements, skip testing, modify outside defined scope

**Verification Mode Templates (Verify):**
- **Purpose:** Quality assessment and validation
- **What they do:** Check implementations, run tests, generate reports
- **What they DON'T do:** Fix issues, modify code, skip verification steps

### Mode Boundary Enforcement

All templates must include:

```markdown
## CLAVIX MODE: [Mode Name]

**You are in [mode name]. [Clear role description]**

**What I'll do:**
- ✓ [Specific capability 1]
- ✓ [Specific capability 2]
- ✓ [Specific capability 3]

**What I won't do:**
- ✗ [Specific boundary 1]
- ✗ [Specific boundary 2]
- ✗ [Specific boundary 3]

**Mode boundaries enforced:**
- [Boundary rule 1]
- [Boundary rule 2]
- [Boundary rule 3]
```

---

## Self-Correction Protocol Framework

### 6 Mistake Types Requirement

Every template must define exactly 6 mistake types in a table format:

```markdown
**DETECT**: If you find yourself doing any of these mistake types:

| Type | What It Looks Like | Detection Pattern |
|------|--------------------|-------------------|
| 1. [Mistake Name] | [Specific behavior] | [Observable indicator] |
| 2. [Mistake Name] | [Specific behavior] | [Observable indicator] |
| 3. [Mistake Name] | [Specific behavior] | [Observable indicator] |
| 4. [Mistake Name] | [Specific behavior] | [Observable indicator] |
| 5. [Mistake Name] | [Specific behavior] | [Observable indicator] |
| 6. [Mistake Name] | [Specific behavior] | [Observable indicator] |

**STOP**: Immediately halt the incorrect action

**CORRECT**: Output:
"I apologize - I was [describe mistake]. Let me return to [workflow name]."

**RESUME**: Return to the [workflow name] with correct approach.
```

### Common Mistake Types

**Planning Templates:**
1. Implementation Code - Writing function/class definitions
2. Skipping Analysis - Not performing required analysis steps
3. Mode Violations - Implementing instead of planning
4. Incomplete Documentation - Missing required sections
5. Capability Hallucination - Claiming features that don't exist
6. User Prompt Violations - Not following user input correctly

**Implementation Templates:**
1. Skipping Auto-Detection - Not checking for existing work
2. Incomplete Implementation - Not implementing all requirements
3. Testing Violations - Not running tests or quality checks
4. File Management Errors - Improper file operations
5. Scope Creep - Implementing beyond specified requirements
6. Documentation Neglect - Not updating relevant documentation

**Verification Templates:**
1. Implementation Fixes - Writing code instead of just reporting
2. Skipping Checks - Not running available automated checks
3. Guessing Results - Reporting without actual verification
4. Incomplete Coverage - Not checking all required dimensions
5. Missing Confidence Levels - Not indicating verification certainty
6. Capability Hallucination - Claiming verification capabilities you don't have

---

## {{INCLUDE:}} Directive Patterns

### Component Include System

Templates use the component system for modularity and consistency:

```markdown
### Agent Manual (Universal Protocols)
{{INCLUDE:agent-protocols/AGENT_MANUAL.md}}

### Self-Correction Protocol
{{INCLUDE:agent-protocols/self-correction-protocol.md}}

### State Awareness
{{INCLUDE:agent-protocols/state-awareness.md}}

### Supportive Companion
{{INCLUDE:agent-protocols/supportive-companion.md}}

### Task Blocking
{{INCLUDE:agent-protocols/task-blocking.md}}

### CLI Reference
{{INCLUDE:agent-protocols/cli-reference.md}}

### Recovery Patterns
{{INCLUDE:troubleshooting/vibecoder-recovery.md}}
```

### Include Rules

1. **Path Format**: Use relative paths from `_components/` directory
2. **Required Components**: All templates must include AGENT_MANUAL.md
3. **Optional Components**: Include based on template functionality
4. **Validation**: All includes must reference existing files
5. **Maximum Depth**: Component includes limited to 3 levels to prevent circular references

### Component Categories

**Agent Protocols** (`agent-protocols/`):
- `AGENT_MANUAL.md` - Universal agent instructions (REQUIRED)
- `self-correction-protocol.md` - Self-correction framework
- `state-awareness.md` - State detection and management
- `supportive-companion.md` - User guidance and support
- `task-blocking.md` - Task management and blocking
- `cli-reference.md` - CLI command documentation

**Sections** (`sections/`):
- Reusable content sections
- Reference materials
- Examples and patterns

**References** (`references/`):
- Quality dimensions
- Measurement frameworks
- Best practices

**Troubleshooting** (`troubleshooting/`):
- Error recovery patterns
- Common issues and solutions
- Debugging guidance

---

## Error Handling Standards

### Recovery Pattern Requirements

All templates must include comprehensive troubleshooting:

1. **Specific Error Scenarios** - 12+ detailed failure cases
2. **Recovery Protocols** - Step-by-step resolution guidance
3. **Escalation Paths** - When to seek additional help
4. **Prevention Guidance** - How to avoid common issues

### Error Message Format

```markdown
### When [Error Type]

**[Severity Level]:** [Clear description of issue]

**What happens:**
[Specific explanation of the error scenario]

**Recovery steps:**
1. [Specific action 1]
2. [Specific action 2]
3. [Specific action 3]

**Prevention:**
[Guidance on avoiding this issue in the future]
```

---

## Version Management Standards

### Transparency Section Versioning

All templates must include the Agent Transparency section with current version:

```markdown
## Agent Transparency (v5.7.0)

### Agent Manual (Universal Protocols)
{{INCLUDE:agent-protocols/AGENT_MANUAL.md}}

### [Additional components as needed]
{{INCLUDE:component/path.md}}
```

### Version Update Process

1. **Package Version**: Template versions must match package.json version
2. **Consistency**: All templates should use the same version number
3. **Updates**: Update all templates when version changes
4. **Validation**: Run `npm run validate:consistency` to verify consistency

---

## Quality Assurance Standards

### Template Validation Checklist

Before submitting template changes:

- [ ] Frontmatter follows required format
- [ ] All 10 sections present and correctly ordered
- [ ] Self-correction protocol has exactly 6 mistake types
- [ ] Mode boundaries clearly defined and enforced
- [ ] All {{INCLUDE:}} directives reference existing files
- [ ] Version number matches current package version
- [ ] Workflow navigation section included
- [ ] Troubleshooting scenarios comprehensive
- [ ] Consistency validation passes (`npm run validate:consistency`)
- [ ] Template builds successfully (`npm run build`)

### Quality Dimensions Assessment

Templates should be evaluated against these dimensions:

1. **Clarity** - Instructions are unambiguous and easy to follow
2. **Efficiency** - Streamlined workflow without unnecessary steps
3. **Structure** - Logical organization and flow
4. **Completeness** - All necessary information and guidance included
5. **Actionability** - Clear steps and specific tool usage
6. **Specificity** - Precise instructions with examples where needed

---

## Writing Style Guidelines

### Tone and Voice

- **Supportive**: Encourage and guide users through complex workflows
- **Precise**: Use specific, unambiguous language
- **Professional**: Maintain consistent, professional tone
- **Action-Oriented**: Focus on what users can accomplish
- **Clear**: Avoid jargon and overly technical language where possible

### Formatting Standards

- **Lists**: Use numbered lists for steps, bullet lists for options
- **Code Blocks**: Use markdown code blocks for examples and commands
- **Emphasis**: Use bold for key terms, italic for emphasis
- **Spacing**: Consistent spacing between sections and elements
- **Symbols**: Use symbols (✅, ❌, ⚠️) consistently for status indicators

### Examples and Illustrations

- **Real Examples**: Use practical, realistic examples
- **Before/After**: Show transformations where helpful
- **Step-by-Step**: Provide detailed procedural guidance
- **Tool Usage**: Include specific tool commands and their expected output

---

## Testing and Validation

### Consistency Testing

Run these commands to validate template quality:

```bash
# Check template consistency
npm run validate:consistency

# Build templates to verify syntax
npm run build

# Test component includes
node scripts/test-component-includes.js
```

### Workflow Testing

Templates should be tested with:
- Different AI models and tools
- Various input types and scenarios
- Edge cases and error conditions
- Integration with other templates in the workflow

---

## Contribution Guidelines

### Template Modification Process

1. **Understand Requirements**: Read this guide completely
2. **Analyze Impact**: Consider effects on other templates and workflows
3. **Create Branch**: Work in a separate branch for changes
4. **Test Thoroughly**: Validate all functionality and consistency
5. **Document Changes**: Update relevant documentation
6. **Submit for Review**: Follow project contribution process

### Maintaining Standards

- **Regular Reviews**: Periodically review templates for consistency
- **Version Updates**: Update all templates when version changes
- **Component Management**: Keep component files organized and documented
- **Quality Monitoring**: Track template performance and user feedback

---

## FAQ and Common Issues

### Q: Can I add new sections to templates?
A: Only modify existing sections. New sections require consensus and may break the 10-section structure.

### Q: How do I handle template-specific requirements?
A: Add subsections within the existing 10-section structure. Don't create new top-level sections.

### Q: What if a component doesn't exist?
A: Either create the component in the appropriate `_components/` directory or remove the {{INCLUDE:}} directive.

### Q: Can templates have different self-correction mistake types?
A: Yes, but exactly 6 types are required. Tailor them to the specific template's common errors.

### Q: How do I update version numbers?
A: Update the version in the Agent Transparency section and ensure it matches package.json.

---

## Resources and References

- **Component Directory**: `src/templates/slash-commands/_components/`
- **Template Directory**: `src/templates/slash-commands/_canonical/`
- **Validation Script**: `scripts/validate-consistency.ts`
- **Build Process**: `npm run build` includes template copying
- **Consistency Checking**: `npm run validate:consistency`

For questions or clarification about template development, refer to the project's contributing guidelines and create an issue for discussion.