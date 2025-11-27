# Understanding Clavix Modes

## Two Types of Clavix Workflows

Clavix has **two distinct modes** based on the command type:

### CLAVIX PLANNING MODE (Requirements & Documentation)

**Commands:** `/clavix:start`, `/clavix:summarize`, `/clavix:improve`, `/clavix:prd`

**Your role:**
- Ask questions about requirements
- Create PRDs (Product Requirements Documents)
- Generate optimized prompts
- Extract and structure requirements
- Analyze and improve prompt quality
- Document features, constraints, success criteria

**DO NOT implement features during these workflows.**

### CLAVIX IMPLEMENTATION MODE (Code Execution)

**Commands:** `/clavix:implement`

**Your role:**
- Write code and implement features
- Execute tasks from tasks.md
- Complete implementation work
- Mark tasks as completed

**DO implement code during these workflows.**

---

## Core Principle

**Know which mode you're in based on the command:**

| Command | Mode | Implement? |
|---------|------|------------|
| `/clavix:start` | Planning | ✗ NO |
| `/clavix:summarize` | Planning | ✗ NO |
| `/clavix:improve` | Planning | ✗ NO |
| `/clavix:prd` | Planning | ✗ NO |
| `/clavix:plan` | Planning (Pre-Implementation) | ✗ NO |
| `/clavix:implement` | Implementation | ✓ YES |

---

## What You Should Do

✓ **Ask questions** about what the user wants to build
✓ **Generate PRDs** that describe the requirements
✓ **Create optimized prompts** that can be used for implementation later
✓ **Extract and structure requirements** from conversations
✓ **Analyze and improve** prompt quality
✓ **Document** features, constraints, and success criteria

---

## What You Should NOT Do

**DO NOT IMPLEMENT. DO NOT IMPLEMENT. DO NOT IMPLEMENT.**

✗ **DO NOT write application code** for the feature being discussed
✗ **DO NOT implement** the feature or component
✗ **DO NOT generate** functions, classes, or modules for the actual application
✗ **DO NOT start building** the feature itself
✗ **DO NOT create example implementations** unless explicitly asked

---

## Standard Workflow: PRD → Plan → Implement → Archive

**The typical Clavix workflow:**

1. **Planning Phase** (`/clavix:prd`)
   - Creates PRD (full + quick versions)
   - Mode: PLANNING
   - Output: `.clavix/outputs/{project}/full-prd.md` + `quick-prd.md`

2. **Task Preparation** (`/clavix:plan`)
   - Transforms PRD into curated tasks.md
   - Mode: PLANNING (Pre-Implementation)
   - Output: `.clavix/outputs/{project}/tasks.md`

3. **Implementation Phase** (`/clavix:implement`)
   - Agent executes tasks or prompts systematically (auto-detects source)
   - Mode: IMPLEMENTATION
   - Agent edits tasks.md directly (`- [ ]` → `- [x]`) to mark progress

4. **Completion** (`/clavix:archive`)
   - Archives completed project
   - Mode: Management

**Key principle:** Planning workflows create documents. Implementation workflows write code.

---

## When to Switch Modes

**User says:** "Now implement this" or "Build this feature"
→ **Switch to IMPLEMENTATION MODE** if not already in implementation command

**User runs:** `/clavix:implement`
→ **You are in IMPLEMENTATION MODE** - write code

**User runs:** `/clavix:prd` or `/clavix:improve` or `/clavix:start`
→ **You are in PLANNING MODE** - gather requirements, don't implement

---

## When Unsure

If you're not sure whether the user wants planning or implementation, **ASK:**

> "Should I implement this feature now, or continue with requirements and planning?"

---

## Common Mistakes to Avoid

### ❌ Wrong: Jumping to Implementation

**User:** "I want to build a todo app with authentication"

**Wrong response:**
```typescript
// Creating TodoApp component
export function TodoApp() {
  const [todos, setTodos] = useState([]);
  // ... implementation
}
```

### ✓ Right: Gathering Requirements

**User:** "I want to build a todo app with authentication"

**Right response:**
> "Let me help you plan this todo app. A few clarifying questions:
>
> 1. What authentication method do you want? (OAuth, email/password, magic link?)
> 2. Should todos be per-user or shared across teams?
> 3. What todo features are essential? (priority levels, due dates, categories?)
> 4. Any specific technical constraints or framework preferences?
>
> Once we've gathered all requirements, I'll create a comprehensive PRD and optimized prompt for implementation."

---

## Mode Detection Examples

### Scenario 1: User Starts Conversational Mode

**Command:** `/clavix:start`

**Your mode:** CLAVIX PLANNING MODE

**Actions:**
- Enter conversational mode
- Ask clarifying questions
- Track requirements
- DO NOT implement anything
- Remind user to use `/clavix:summarize` when ready

---

### Scenario 2: User Asks for Summarization

**Command:** `/clavix:summarize`

**Your mode:** CLAVIX PLANNING MODE

**Actions:**
- Analyze conversation
- Extract requirements
- Create mini-PRD
- Create optimized prompts
- Save files
- DO NOT implement the feature

---

### Scenario 3: User Runs Implement Command

**Command:** `/clavix:implement`

**Your mode:** CLAVIX IMPLEMENTATION MODE

**Actions:**
- Read tasks.md from `.clavix/outputs/{project}/`
- Execute tasks systematically
- Write actual implementation code
- Use `/clavix:task-complete` to mark tasks done
- Continue until all tasks completed

---

### Scenario 4: Ambiguous Request During Planning

**User:** "What do you think about adding real-time updates?"

**Context:** Currently in conversational mode (`/clavix:start`)

**Your mode:** CLAVIX PLANNING MODE (clarify first)

**Response:**
> "Are you asking me to:
> 1. Discuss the requirements for real-time updates and add them to our planning? (I'll stay in planning mode)
> 2. Implement real-time updates now? (You'd need to run `/clavix:implement` for that)
>
> Since we're in planning mode, I'll assume option 1 unless you explicitly request implementation."

---

### Scenario 5: User Gives Direct Implementation Request

**User:** "Now implement this feature" or "Build the dashboard we discussed"

**Your mode:** Check context first

**If no `/clavix:implement` command was run:**
- Suggest: "To implement this, please run `/clavix:implement`. This ensures proper task tracking and file management."

**If `/clavix:implement` command was run:**
- You're already in CLAVIX IMPLEMENTATION MODE
- Proceed with implementation

---

## Self-Correction

If you catch yourself implementing during a Clavix workflow:

1. **STOP immediately**
2. **Delete** the implementation attempt
3. **Apologize**: "I apologize - I was jumping to implementation. Let me continue with requirements gathering instead."
4. **Return** to asking questions or documenting requirements
5. **Reference** this file for clarification

---

## Summary

**Two distinct Clavix modes:**

1. **CLAVIX PLANNING MODE** (`start`, `summarize`, `improve`, `prd`, `plan`)
   - Create PRDs, prompts, documentation
   - DO NOT implement features

2. **CLAVIX IMPLEMENTATION MODE** (`implement`)
   - Write code and build features
   - DO implement what's been planned
   - Auto-detects tasks.md or prompts/

**Standard workflow:** PRD → Plan → Implement → Archive

**When in doubt:** Check which command was run, or ask the user to clarify.
