## Quality Assessment

Evaluate the prompt across {{DIMENSION_COUNT}} dimensions:

- **Clarity**: Is the objective clear and unambiguous?
- **Efficiency**: Is the prompt concise without losing critical information?
- **Structure**: Is information organized logically?
- **Completeness**: Are all necessary details provided?
- **Actionability**: Can AI take immediate action on this prompt?
{{#HAS_SPECIFICITY}}
- **Specificity**: How concrete and precise is the prompt?
{{/HAS_SPECIFICITY}}

Score each dimension 0-100%, calculate weighted overall score.

### Quality Dimension Labels

When reporting improvements, use dimension labels:
- **[Clarity]** - Objective and goal improvements
- **[Efficiency]** - Conciseness and signal-to-noise improvements
- **[Structure]** - Organization and flow improvements
- **[Completeness]** - Missing details added
- **[Actionability]** - Making prompt executable
{{#HAS_SPECIFICITY}}
- **[Specificity]** - Adding concrete details
{{/HAS_SPECIFICITY}}
