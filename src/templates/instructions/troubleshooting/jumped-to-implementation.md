# Troubleshooting: Agent Jumped to Implementation

## Problem Description

Agent started implementing the feature instead of staying in requirements/planning mode during Clavix workflows.

---

## Symptoms

- Agent generated application code during `/clavix:start` conversational mode
- Agent created functions, components, or classes for the feature being discussed
- Agent built implementation examples instead of asking clarifying questions
- Agent jumped from requirements gathering to coding without explicit user request

---

## Why This Happens

**Root causes:**

1. **Missing CLAVIX MODE boundary** - Agent didn't see or internalize the "DO NOT IMPLEMENT" instruction
2. **Default helpfulness** - Agents are trained to be helpful, which often means "solve the problem" = implement
3. **Implicit mode boundaries** - "Stay in conversational mode" is too subtle without explicit gates
4. **Premature optimization** - Agent thinks "I have enough info to implement" after 1-2 questions

---

## Immediate Fix

If an agent has already jumped to implementation:

### Step 1: Stop Implementation

Agent should:
1. **STOP** writing implementation code immediately
2. **Delete** or discard the implementation attempt
3. **Acknowledge** the mistake

### Step 2: Apologize and Correct

Agent should output:

```markdown
I apologize - I was jumping to implementation prematurely.

I'm in Clavix mode, which is for requirements gathering and planning, NOT for implementing features yet.

Let me return to asking clarifying questions about your requirements instead.
```

### Step 3: Return to Correct Mode

Agent should:
1. **Return** to asking clarifying questions (if in `/clavix:start`)
2. **Return** to extracting requirements (if in `/clavix:summarize`)
3. **Return** to analyzing prompts (if in `/clavix:improve`)
4. **Return** to generating PRD (if in `/clavix:prd`)

**NOT** continue with implementation.

---

## Prevention Strategies

### For Template Authors

**1. Add CLAVIX MODE Block at Top**

Every workflow template should start with:

```markdown
## CLAVIX MODE: Requirements & Planning Only

**You are in Clavix prompt/PRD development mode. You help create planning documents, NOT implement features.**

**YOUR ROLE:**
- ✓ [What you should do]

**DO NOT IMPLEMENT. DO NOT IMPLEMENT. DO NOT IMPLEMENT.**
- ✗ DO NOT write application code
- ✗ DO NOT implement the feature being discussed
- ✗ DO NOT generate component/function implementations

**ONLY implement if user explicitly says: "Now implement this"**
```

**2. Repeat Mode Boundaries**

Don't rely on seeing it once. Repeat critical boundaries:
- At workflow start
- Before agent might implement (e.g., after questions in conversational mode)
- In troubleshooting sections
- At least 3 times in different locations

**3. Add Self-Correction Triggers**

Include explicit checks:

```markdown
**Self-Check: Am I Implementing?**

If you catch yourself writing application code, STOP IMMEDIATELY.
1. Delete the implementation
2. Apologize
3. Return to requirements mode
```

**4. Use Explicit Imperative Language**

✓ "DO NOT write code"
✓ "DO NOT implement features"
✓ "Your role is requirements gathering, NOT execution"

✗ "Stay in conversational mode" (too subtle)
✗ "You are gathering requirements" (descriptive, not imperative)

---

### For Users

**1. Set Clear Expectations Upfront**

When starting a Clavix workflow, remind the agent:

```markdown
/clavix:start

Remember: We're just gathering requirements and planning. Don't implement anything yet - I'll ask you to build it later once we have a solid plan.
```

**2. Catch Early and Redirect**

If agent starts implementing:

```markdown
Hold on - I don't want implementation yet. I just want to plan and document requirements first.

Let's stay in planning mode. Ask me more questions about what I need.
```

**3. Explicit Implementation Request**

When you DO want implementation:

```markdown
Great PRD! Now implement this feature based on the PRD we created.
```

Be explicit. "Now implement" or "Build this" makes it clear.

---

## Testing for This Issue

### Test Scenario 1: Conversational Mode

**Setup:**
```markdown
User: /clavix:start
User: I want to build a todo app with authentication
```

**Expected behavior:**
- Agent asks clarifying questions
- Agent does NOT generate code
- Agent stays in requirements gathering mode

**Failure indicator:**
- Agent generates TodoApp component or authentication code

---

### Test Scenario 2: After Few Questions

**Setup:**
```markdown
User: /clavix:start
User: I want real-time notifications in my app
Agent: [Asks 2-3 questions]
User: [Answers questions]
```

**Expected behavior:**
- Agent asks more questions to deepen understanding
- Agent does NOT implement WebSockets or notification system

**Failure indicator:**
- Agent generates implementation after thinking "I have enough info"

---

## Related Issues

- **Mode Confusion**: See `mode-confusion.md` if agent is unclear which mode is active
- **Premature Completion**: Agent finishing workflows too early
- **Missing Checkpoints**: Agent skipping validation steps

---

## Success Indicators

Agent is working correctly when:
- ✓ Agent asks 5+ clarifying questions before considering summarization
- ✓ Agent never generates application code during Clavix workflows (unless explicitly requested)
- ✓ Agent explicitly states "I'm in planning mode" or similar acknowledgment
- ✓ Agent suggests `/clavix:summarize` instead of jumping to implementation
- ✓ Agent asks "Should I implement or continue planning?" when uncertain

---

## Quick Reference

**If agent implements during Clavix workflow:**

1. **Stop** - Agent stops generating code
2. **Apologize** - "I apologize, I was jumping to implementation..."
3. **Return** - Go back to requirements/planning mode
4. **Reference** - Point to CLAVIX MODE boundary in instructions

**Prevention checklist:**
- ✓ CLAVIX MODE block at top of workflow
- ✓ "DO NOT IMPLEMENT" repeated 3+ times
- ✓ Self-correction triggers included
- ✓ Explicit user request required for implementation
- ✓ Mode boundaries use imperative language

---

## See Also

- `.clavix/instructions/core/clavix-mode.md` - Complete mode boundary explanation
- `.clavix/instructions/workflows/start.md` - Conversational mode workflow
- `.clavix/instructions/troubleshooting/mode-confusion.md` - When agent is unclear about mode
