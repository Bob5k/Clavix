---
name: "Clavix: Deep"
description: Comprehensive deep analysis for prompt improvement
---

# Clavix Deep Mode - Comprehensive Prompt Analysis

You are helping the user perform a comprehensive deep analysis of their prompt using Clavix's deep mode optimization system.

## Instructions

1. Take the user's prompt: `$ARGUMENTS`

2. **Perform ALL fast mode analysis first**:
   - Identify gaps, ambiguities, strengths, suggestions
   - Generate single structured improved prompt
   - Create "Changes Made" summary

3. **Add deep mode comprehensive features**:

   a. **Alternative Phrasings**: Generate 2-3 different ways to phrase key requirements
      - Explain when each phrasing might be more appropriate
      - Example: "User story format" vs "Job story format" vs "Structured sections"

   b. **Edge Cases in Requirements**: Identify potential edge cases
      - Focus on requirement-level edge cases, NOT system architecture
      - Example: "What happens when user is not authenticated?"
      - Example: "How to handle invalid input?"

   c. **Implementation Examples**:
      - Good implementation patterns (what makes them good)
      - Bad implementation patterns (what makes them bad)

   d. **Alternative Prompt Structures**:
      - Suggest 2-3 different ways to structure the prompt
      - Explain benefits of each approach
      - Example structures:
        * User Story Format: "As a [user], I want [goal] so that [benefit]"
        * Job Story Format: "When [situation], I want to [motivation], so I can [outcome]"
        * Structured Sections: Objective, Requirements, Constraints, Success Criteria

   e. **What Could Go Wrong**: Analyze potential issues
      - How the prompt could be misinterpreted
      - What assumptions might be wrong
      - How to make it clearer

   f. **More Thorough Clarifying Questions**:
      - Group by category (requirements, constraints, success criteria)
      - More detailed than fast mode

4. Present everything in a comprehensive, well-organized format.

## Deep Mode Features

✅ Include (everything from fast mode PLUS):
- Alternative phrasings of requirements
- Edge cases in requirements
- Good/bad implementation examples
- Multiple prompt structuring approaches
- "What could go wrong" analysis
- More thorough clarifying questions

❌ Do NOT include (these belong in `/clavix:prd`):
- System architecture recommendations
- Security best practices
- Scalability strategy
- Business impact analysis

## Example

If user provides: "Create a login page"

Output:
```
## Analysis
[All fast mode analysis: gaps, ambiguities, strengths, suggestions]

## Changes Made
- Added authentication context and user needs
- Specified technical stack and constraints
- Defined success criteria and expected output

## Alternative Phrasings
1. "Implement a user authentication interface that enables secure access to the platform"
2. "Design and build a login system that validates user credentials and manages sessions"
3. "Create an authentication flow that allows registered users to access their accounts"

## Edge Cases to Consider
- What happens when a user enters incorrect credentials 3+ times?
- How to handle users who've forgotten both email and password?
- What about users trying to log in from a new device?
- How to handle session expiration during active use?

## Implementation Examples
✅ Good:
- Prompt specifies authentication method, error handling, and accessibility requirements
- Includes context about existing auth system and integration points
- Defines measurable success criteria (load time, accessibility score)

❌ Bad:
- "Make a login page" - no context, constraints, or success criteria
- Missing technical stack and integration requirements
- No consideration of security or user experience

## Alternative Prompt Structures
1. **User Story**: "As a registered user, I want to log into my account so that I can access my personalized dashboard"
   → Focuses on user value and benefits

2. **Job Story**: "When I visit the app, I want to authenticate securely, so I can access my saved data"
   → Emphasizes context and motivation

3. **Structured Sections**: Objective, Requirements, Constraints, Success Criteria
   → Provides comprehensive organization

## What Could Go Wrong
- Without security requirements, implementation might miss OWASP best practices
- Vague "login page" could be interpreted as OAuth, email/password, or social login
- Missing error handling specification could lead to poor UX
- No accessibility requirements might exclude users with disabilities

## Improved Prompt
[Structured prompt with all sections]
```

## When to Use Deep vs Fast vs PRD

- **Fast mode** (`/clavix:fast`): Quick prompt cleanup, simple requirements
- **Deep mode** (`/clavix:deep`): Comprehensive prompt analysis, complex requirements, exploring alternatives
- **PRD mode** (`/clavix:prd`): Strategic planning, architecture decisions, business impact

## Tips

- Deep mode is for **prompt-level** analysis, not strategic planning
- Focus on making "good prompts great" with comprehensive coverage
- Explore alternative approaches and potential issues
- Help users think through edge cases in their requirements
- Recommend `/clavix:prd` for architecture, security, and scalability concerns
