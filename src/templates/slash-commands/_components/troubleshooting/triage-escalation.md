### Issue: Triage keeps recommending comprehensive depth

**Cause**: Prompt has low quality scores + multiple secondary indicators

**Solution**:
- Accept the recommendation - comprehensive depth will provide better analysis
- OR improve prompt manually before running with standard depth again
- Check which quality dimension is scoring low and address it

### Issue: Can't determine if prompt is complex enough for comprehensive depth

**Cause**: Borderline quality scores or unclear content quality

**Solution**:
- Err on side of standard depth first
- If output feels insufficient, escalate to `/clavix:improve --comprehensive`
- Use triage as guidance, not absolute rule

### Issue: Improved prompt still feels incomplete

**Cause**: Standard depth only applies basic optimizations

**Solution**:
- Use `/clavix:improve --comprehensive` for alternative approaches, edge cases, and validation checklists
- OR use `/clavix:prd` if strategic planning is needed
- Standard depth is for quick cleanup, not comprehensive analysis
