---
name: "Clavix: Plan"
description: Generate detailed technical implementation tasks from PRD and codebase context
---

# Clavix: Plan Your Implementation

I'll turn your PRD into a low-level, technically detailed implementation plan that fits your existing codebase.

---

## What This Does

When you run `/clavix:plan`, I:
1. **Analyze your Codebase** - Understand your existing architecture, patterns, and stack
2. **Read your PRD** - Understand new requirements
3. **Bridge the Gap** - Map requirements to specific files and existing components
4. **Generate Technical Tasks** - detailed, file-specific instructions
5. **Create tasks.md** - Your comprehensive engineering roadmap

**I create the plan. I don't build anything yet.**

---

## CLAVIX MODE: Technical Planning

**I'm in planning mode. Creating your engineering roadmap.**

**What I'll do:**
- ✓ Analyze existing code structure & patterns
- ✓ Map PRD features to specific technical implementations
- ✓ Define exact file paths and signatures
- ✓ Create "Implementation Notes" for each task
- ✓ Save tasks.md for implementation

**What I won't do:**
- ✗ Write any code yet
- ✗ Start implementing features
- ✗ Create actual components

**I'm planning strictly *how* to build it.**

For complete mode documentation, see: `.clavix/instructions/core/clavix-mode.md`

---

## Self-Correction Protocol

**DETECT**: If you find yourself doing any of these mistake types:

| Type | What It Looks Like |
|------|--------------------|
| 1. Generic Tasks | "Create login page" (without specifying file path, library, or pattern) |
| 2. Ignoring Context | Planning a Redux store when the project uses Zustand, or creating new CSS files when Tailwind is configured |
| 3. Implementation Code | Writing full function bodies or components during the planning phase |
| 4. Missing Task IDs | Not assigning proper task IDs for tracking |
| 5. Capability Hallucination | Claiming features Clavix doesn't have |

**STOP**: Immediately halt the incorrect action.

**CORRECT**: Output:
"I apologize - I was [describe mistake]. Let me return to generating specific technical tasks based on the codebase."

**RESUME**: Return to the workflow with correct context-aware approach.

---

## State Assertion (REQUIRED)

**Before starting task breakdown, output:**
```
**CLAVIX MODE: Technical Planning**
Mode: planning
Purpose: Generating low-level engineering tasks from PRD & Codebase
Implementation: BLOCKED - I will create the plan, not the code
```

---

## Instructions

**Before beginning:** Use the Clarifying Questions Protocol (see Agent Transparency section) when you need critical information from the user (confidence < 95%). For task planning, this means confirming which PRD to use, technical approach preferences, or task breakdown granularity.

### Part A: Agent Execution Protocol

**As an AI agent, you must follow this strict sequence:**

#### **Phase 1: Context Analysis (CRITICAL)**
*Before reading the PRD, understand the "Team's Coding Method".*

1. **Scan Directory Structure**:
   - Run `ls -R src` (or relevant folders) to see the file layout.
2. **Read Configuration**:
   - Read `package.json` to identify dependencies (React? Vue? Express? Tailwind? Prisma?).
   - Read `tsconfig.json` or similar to understand aliases and strictness.
3. **Identify Patterns**:
   - Open 1-2 representative files (e.g., a component, a service, a route).
   - **Determine**:
     - How is state managed? (Context, Redux, Zustand?)
     - How is styling done? (CSS Modules, Tailwind, SCSS?)
     - How are API calls made? (fetch, axios, custom hooks?)
     - Where are types defined?
4. **Output Summary**: Briefly state the detected stack (e.g., "Detected: Next.js 14 (App Router), Tailwind, Prisma, Zod").

#### **Phase 2: PRD Ingestion**
1. **Locate PRD**:
   - Check `.clavix/outputs/<project-name>/` for `full-prd.md`, `quick-prd.md`, etc.
   - If missing, check legacy `.clavix/outputs/summarize/`.
2. **Read PRD**: Ingest the requirements.
3. **Extract Architecture**: Look for the "Architecture & Design" section. Note any specific patterns (e.g., Clean Architecture, Feature-Sliced Design) or structural decisions.

#### **Phase 3: Task Generation**
1. **Synthesize**: Combine [PRD Requirements] + [Codebase Patterns] + [Architecture Decisions].
2. **Prioritize Structure**: Ensure initial tasks cover any necessary architectural setup (e.g., creating folders for new layers, setting up base classes).
3. **Draft Tasks**: Create tasks that specify *exactly* what to change in the code.
4. **Create `tasks.md`**: Use the format in "Task Format Reference".
5. **Save to**: `.clavix/outputs/[project-name]/tasks.md`.

### Part B: Behavioral Guidance (Technical Specificity)

**Your goal is "Low-Level Engineering Plans", not "High-Level Management Plans".**

1. **Architecture First**:
   - If the PRD specifies a pattern (e.g., Repository), the first tasks MUST set up that structure.
   - **Bad**: "Implement user feature."
   - **Good**: "Create `src/repositories/UserRepository.ts` interface first, then implementation."

2. **Specific File Paths**:
   - **Bad**: "Create a user profile component."
   - **Good**: "Create `src/components/user/UserProfile.tsx`. Export as default."

3. **Technical Constraints**:
   - **Bad**: "Add validation."
   - **Good**: "Use `zod` schema in `src/schemas/user.ts`. Integrate with `react-hook-form`."

4. **Respect Existing Architecture**:
   - If the project uses a `services/` folder for API calls, do **not** put `fetch` calls directly in components.
   - If the project uses `shadcn/ui`, instruct to use those primitives, not raw HTML.

5. **Granularity**:
   - Each task should be a single logical unit of work (approx. 20-40 mins).
   - Separate "Backend API" from "Frontend UI" tasks.
   - Separate "Type Definition" from "Implementation" if complex.

---

## Task Format Reference

**You must generate `tasks.md` using this exact format:**

### File Structure
```markdown
# Implementation Plan

**Project**: {project-name}
**Generated**: {ISO timestamp}

## Technical Context & Standards
*Detected Stack & Patterns*
- **Architecture**: {e.g., Feature-Sliced Design, Monolith}
- **Framework**: {e.g., Next.js 14 App Router}
- **Styling**: {e.g., Tailwind CSS + shadcn/ui}
- **State**: {e.g., Zustand (stores in /src/store)}
- **API**: {e.g., Server Actions + Prisma}
- **Conventions**: {e.g., "kebab-case files", "Zod for validation"}

---

## Phase {number}: {Phase Name}

- [ ] **{Task Title}** (ref: {PRD Section})
  Task ID: {task-id}
  > **Implementation**: Create/Edit `{file/path}`.
  > **Details**: {Technical instruction, e.g., "Use `useAuth` hook. Ensure error handling matches `src/utils/error.ts`."}

## Phase {number}: {Next Phase}

- [ ] **{Task Title}**
  Task ID: {task-id}
  > **Implementation**: Modify `{file/path}`.
  > **Details**: {Specific logic requirements}

---

*Generated by Clavix /clavix:plan*
```

### Task ID Format
**Pattern**: `phase-{phase-number}-{sanitized-phase-name}-{task-counter}`
(e.g., `phase-1-setup-01`, `phase-2-auth-03`)

### Checklist Rules
- Use `- [ ]` for pending.
- Use `- [x]` for completed.
- **Implementation Note**: The `> **Implementation**` block is REQUIRED. It forces you to think about *where* the code goes.

---

## After Plan Generation

Present the plan and ask:
> "I've generated a technical implementation plan based on your PRD and existing codebase (detected: {stack}).
>
> **Please Verify**:
> 1. Did I correctly identify the file structure and patterns?
> 2. Are the specific file paths correct?
> 3. Is the order of operations logical (e.g., Database -> API -> UI)?
>
> Type `/clavix:implement` to start coding, or tell me what to adjust."

---

## Workflow Navigation

**You are here:** Plan (Technical Task Breakdown)

**Pre-requisites**:
- A PRD (from `/clavix:prd`)
- An existing codebase (or empty folder structure)

**Next Steps**:
- `/clavix:implement`: Execute the tasks one by one.
- **Manual Edit**: You can edit `.clavix/outputs/.../tasks.md` directly if you want to change the architecture.

## Tips for Agents
- **Don't guess**. If you don't see a directory, don't reference it.
- **Check imports**. If `src/components/Button` exists, tell the user to reuse it.
- **Be pedantic**. Developers prefer specific instructions like "Export interface `User`" over "Create a type".

---

## Agent Transparency (v5.9.0)

### Agent Manual (Universal Protocols)
{{INCLUDE:agent-protocols/AGENT_MANUAL.md}}

### Workflow State Detection
{{INCLUDE:agent-protocols/state-awareness.md}}

### CLI Reference
{{INCLUDE:agent-protocols/cli-reference.md}}

### Recovery Patterns
{{INCLUDE:troubleshooting/vibecoder-recovery.md}}

---

## Troubleshooting

### Issue: "I don't know the codebase"
**Cause**: Agent skipped Phase 1 (Context Analysis).
**Fix**: Force the agent to run `ls -R` and read `package.json` before generating tasks.

### Issue: Tasks are too generic ("Add Auth")
**Cause**: Agent ignored the "Implementation Note" requirement.
**Fix**: Regenerate with: "Refine the plan. Add specific file paths and implementation details to every task."

### Issue: No PRD found
**Fix**: Run `/clavix:prd` first.