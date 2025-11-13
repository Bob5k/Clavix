---
name: "Clavix: PRD"
description: Generate a PRD through guided Socratic questioning
---

# Clavix PRD Generation

You are helping the user create a Product Requirements Document (PRD) using Clavix's Socratic questioning approach.

## Instructions

1. Guide the user through these strategic questions, one at a time:

   **Question 1**: What problem are you solving? Who experiences this problem?

   **Question 2**: Who will use this? What are their key characteristics and needs?

   **Question 3**: What are the must-have features? List 3-5 core features.

   **Question 4**: How will you measure success? What are the key metrics?

   **Question 5**: Any specific technologies, performance requirements, or integrations required?

   **Question 6**: What are you explicitly NOT building in this version?

   **Question 7**: Any deadlines or milestones to be aware of?

2. After collecting all answers, generate TWO documents:

   **Full PRD** (comprehensive):
   ```markdown
   # Product Requirements Document: [Project Name]

   ## Problem Statement
   [User's answer to Q1]

   ## Target Users
   [User's answer to Q2]

   ## Requirements
   ### Must-Have Features
   [User's answer to Q3, expanded]

   ### Technical Requirements
   [User's answer to Q5, detailed]

   ## Success Metrics
   [User's answer to Q4]

   ## Out of Scope
   [User's answer to Q6]

   ## Timeline
   [User's answer to Q7]
   ```

   **Quick PRD** (2-3 paragraphs, AI-optimized):
   ```markdown
   [Concise summary combining problem, solution, and must-have features]

   [Technical requirements and constraints in one paragraph]

   [Success criteria and timeline]
   ```

3. Save both documents to `.clavix/outputs/[project-name]/`

4. Display file paths and suggest next steps.

## Tips

- Ask follow-up questions if answers are too vague
- Help users think through edge cases
- Keep the process conversational and supportive
