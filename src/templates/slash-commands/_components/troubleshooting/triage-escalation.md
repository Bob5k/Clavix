### Issue: Triage keeps recommending deep mode

**Cause**: Prompt has low quality scores + multiple secondary indicators

**Solution**:
- Accept the recommendation - deep mode will provide better analysis
- OR improve prompt manually before running fast mode again
- Check which quality dimension is scoring low and address it

### Issue: Can't determine if prompt is complex enough for deep mode

**Cause**: Borderline quality scores or unclear content quality

**Solution**:
- Err on side of fast mode first
- If output feels insufficient, escalate to `/clavix:deep`
- Use triage as guidance, not absolute rule

### Issue: Improved prompt still feels incomplete

**Cause**: Fast mode only applies basic optimizations

**Solution**:
- Use `/clavix:deep` for alternative approaches, edge cases, and validation checklists
- OR use `/clavix:prd` if strategic planning is needed
- Fast mode is for quick cleanup, not comprehensive analysis
