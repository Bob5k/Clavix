### Issue: {{OUTPUT_TYPE}} Not Saved

**Error: Cannot create directory**
```bash
mkdir -p .clavix/outputs/prompts/{{OUTPUT_DIR}}
```

**Error: Index file corrupted or invalid JSON**
```bash
echo '{"version":"1.0","prompts":[]}' > .clavix/outputs/prompts/{{OUTPUT_DIR}}/.index.json
```

**Error: Duplicate {{OUTPUT_TYPE}} ID**
- Generate a new ID with a different timestamp or random suffix
- Retry the save operation with the new ID

**Error: File write permission denied**
- Check directory permissions
- Ensure `.clavix/` directory is writable
- Try creating the directory structure again
