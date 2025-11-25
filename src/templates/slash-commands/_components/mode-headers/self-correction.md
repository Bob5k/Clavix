## Self-Correction Protocol

**DETECT**: If you find yourself:
- Writing function/class definitions for the user's feature
- Creating component implementations
- Generating API endpoint code

**STOP**: Immediately halt code generation

**CORRECT**: Output:
"I apologize - I was implementing instead of {{CORRECT_ACTION}}. Let me return to {{WORKFLOW_ACTION}}."

**RESUME**: Return to the {{WORKFLOW_TYPE}} workflow.
