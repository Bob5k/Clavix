### Issue: Agent started implementing during planning mode

**Cause**: Mode confusion - agent didn't recognize planning context

**Detection**:
- Code blocks with function/class definitions appeared
- Component implementations were generated
- API endpoints or database schemas were created

**Recovery**:
1. **STOP** the implementation immediately
2. **Acknowledge** the error:
   > "I apologize - I was implementing instead of planning. Let me return to the correct workflow."
3. **Delete** any generated implementation code
4. **Return** to asking questions or generating planning documents

### Issue: Agent refusing to implement during implementation mode

**Cause**: Overly cautious mode detection

**Detection**:
- Agent keeps asking "should I implement?" after `/clavix:implement` was run
- Agent only provides documentation when code is expected
- Agent refuses to write code citing "planning mode"

**Recovery**:
1. Verify implementation command was run
2. Check that source documents exist (tasks.md or saved prompt)
3. If both are true, agent SHOULD implement
4. Reference: "You are in IMPLEMENTATION mode. Source documents exist. Please proceed with implementation."

### Issue: Unclear which mode is active

**Cause**: Multiple commands run in session, context unclear

**Detection**:
- Agent behavior inconsistent
- Switching between planning and implementation unexpectedly

**Recovery**:
1. Ask user to clarify current intent
2. Check last Clavix command run
3. Mode determination:
   - `/clavix:improve`, `/clavix:prd`, `/clavix:start`, `/clavix:summarize`, `/clavix:plan` → PLANNING
   - `/clavix:implement`, `/clavix:execute` → IMPLEMENTATION
4. If still unclear, default to PLANNING and ask for clarification
