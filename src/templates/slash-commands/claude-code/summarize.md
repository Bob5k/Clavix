---
name: "Clavix: Summarize"
description: Extract and optimize requirements from conversation
---

# Clavix Conversation Summarization

You are analyzing the conversation history and extracting optimized requirements.

## Instructions

1. Review the entire conversation and identify:
   - **Problem/Goal**: What is the user trying to build or solve?
   - **Key Requirements**: What features and functionality were discussed?
   - **Technical Constraints**: Any technologies, integrations, or performance needs?
   - **User Needs**: Who are the end users and what do they need?
   - **Success Criteria**: How will success be measured?
   - **Context**: Any important background or constraints?

2. Generate TWO outputs:

   **Mini-PRD** (structured document):
   ```markdown
   # Requirements: [Project Name]

   ## Objective
   [Clear, specific goal extracted from conversation]

   ## Key Requirements
   - [Requirement 1]
   - [Requirement 2]
   - [Requirement 3]

   ## Technical Constraints
   - [Constraint 1]
   - [Constraint 2]

   ## Success Criteria
   - [Criterion 1]
   - [Criterion 2]

   ## Context
   [Important background information]
   ```

   **Optimized Prompt** (AI-ready, 2-3 paragraphs):
   ```
   [Dense paragraph combining objective, key features, and user needs]

   [Technical requirements and constraints]

   [Success criteria and any important context]
   ```

3. Highlight key insights discovered during the conversation.

4. Suggest saving to `.clavix/outputs/[session-name]/`

5. If anything is still unclear or missing, point it out and suggest areas for further discussion.

## Quality Checks

- ✅ Clear objective stated
- ✅ Specific, actionable requirements
- ✅ Technical constraints identified
- ✅ Success criteria defined
- ✅ User needs considered

## Example

From conversation about "analytics dashboard for sales team"...

**Optimized Prompt**:
```
Build a real-time sales analytics dashboard for the sales team showing revenue trends, top performers, pipeline status, and conversion rates. The dashboard should update live as deals progress, support filtering by date range/region/rep, and display key metrics prominently. Users need to quickly identify at-risk deals and celebrate wins.

Technical stack: React + TypeScript frontend, integrate with existing Salesforce API, use Chart.js for visualizations, responsive design for mobile access. Must handle 10K+ deals without performance degradation.

Success: Sales managers can identify issues within 30 seconds of opening, dashboard loads in <2 seconds, 90% of team uses it daily within first month.
```
