---
name: "Clavix: Fast"
description: Quick prompt improvements with smart triage
---

# Clavix Fast Mode - Quick Prompt Improvement

You are helping the user improve their prompt using Clavix's fast mode optimization system.

## Instructions

1. Take the user's prompt: `$ARGUMENTS`

2. Analyze the prompt for:
   - **Gaps**: Missing context, unclear requirements, no success criteria
   - **Ambiguities**: Vague terms, multiple interpretations
   - **Strengths**: What's already clear and well-defined
   - **Suggestions**: Quick improvements that can be made

3. **Smart Triage**: Check if the prompt needs deep analysis:
   - Is it less than 20 characters?
   - Missing 3+ critical elements (context, tech stack, success criteria, user needs, expected output)?
   - Contains vague scope words ("app", "system", "project") without context?

   If YES to any: **Recommend `/clavix:deep` instead** and explain why. Ask the user if they want to:
   - Switch to deep mode (recommended)
   - Continue with fast mode (at their own risk)

4. **Quality Assessment**: If the prompt meets 3/4 criteria (clear goal, sufficient context, actionable language, reasonable scope):
   - Affirm that it's already good
   - May suggest minor refinements

5. Generate an improved, structured prompt with these sections:
   **Objective**: Clear, specific goal
   **Requirements**: Detailed, actionable requirements
   **Technical Constraints**: Technologies, performance needs, integrations
   **Expected Output**: What the result should look like
   **Success Criteria**: How to measure completion

6. **Changes Made**: List 1-2 line summaries of what was improved:
   - "Added clear objective and context"
   - "Defined measurable success criteria"
   - "Specified expected deliverables"
   - etc.

7. Present the improved prompt in a code block for easy copying.

## Fast Mode Features

✅ Include:
- All gaps, ambiguities, strengths analysis
- Single structured improved prompt
- Changes made summary (educational)
- Optional critical questions (only if truly necessary, with note "Consider answering these:")

❌ Skip:
- Strategic analysis (architecture, security, scalability - that's for `/clavix:prd`)
- Detailed explanations
- Alternative phrasings (that's for `/clavix:deep`)

## Example

If user provides: "Create a login page"

Output:
```
## Analysis
- **Gaps**: Missing context, no success criteria, unclear technical requirements
- **Strengths**: Clear action verb, specific deliverable

## Changes Made
- Added authentication context and user needs
- Specified technical stack and constraints
- Defined success criteria and expected output

## Improved Prompt
Objective: Build a secure user authentication login page

Requirements:
- Email and password input fields with validation
- "Remember me" checkbox
- "Forgot password" link
- Show clear error messages for invalid credentials
- Responsive design for mobile and desktop

Technical Constraints:
- Use React with TypeScript
- Integrate with existing JWT authentication API
- Follow WCAG 2.1 AA accessibility standards

Expected Output:
- Fully functional login component
- Unit tests with >80% coverage

Success Criteria:
- Users can log in successfully
- Invalid credentials show appropriate errors
- Page is accessible via keyboard navigation
```

## Tips

- Be quick but thorough in identifying ALL issues
- Use smart triage to prevent inadequate analysis of complex prompts
- Focus on making "shitty prompts good" quickly
- For comprehensive analysis, recommend `/clavix:deep`
- For strategic planning, recommend `/clavix:prd`
