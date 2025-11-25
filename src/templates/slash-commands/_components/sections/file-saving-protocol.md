## Saving the {{OUTPUT_TYPE}} (REQUIRED)

After displaying the {{OUTPUT_DESC}}, you MUST save it to ensure it's available for the prompt lifecycle workflow.

**If user ran CLI command** (`clavix {{CLI_COMMAND}} "prompt"`):
- {{OUTPUT_TYPE}} is automatically saved ✓
- Skip to "Executing the Saved {{OUTPUT_TYPE}}" section below

**If you are executing this slash command** (`/clavix:{{SLASH_COMMAND}}`):
- You MUST save the {{OUTPUT_TYPE}} manually
- Follow these steps:

### Step 1: Create Directory Structure
```bash
mkdir -p .clavix/outputs/prompts/{{OUTPUT_DIR}}
```

### Step 2: Generate Unique {{OUTPUT_TYPE}} ID
Create a unique identifier using this format:
- **Format**: `{{OUTPUT_DIR}}-YYYYMMDD-HHMMSS-<random>`
- **Example**: `{{OUTPUT_DIR}}-20250117-143022-a3f2`
- Use current timestamp + random 4-character suffix

### Step 3: Save {{OUTPUT_TYPE}} File
Use the Write tool to create the {{OUTPUT_TYPE}} file at:
- **Path**: `.clavix/outputs/prompts/{{OUTPUT_DIR}}/<{{OUTPUT_TYPE}}-id>.md`

### Step 4: Update Index File
Use the Write tool to update the index at `.clavix/outputs/prompts/{{OUTPUT_DIR}}/.index.json`:

**If index file doesn't exist**, create it with:
```json
{
  "version": "1.0",
  "prompts": []
}
```

**Then add a new metadata entry** to the `prompts` array.

**Important**: Read the existing index first, append the new entry to the `prompts` array, then write the updated index back.

### Step 5: Verify Saving Succeeded
Confirm:
- File exists at `.clavix/outputs/prompts/{{OUTPUT_DIR}}/<{{OUTPUT_TYPE}}-id>.md`
- Index file updated with new entry
- Display success message: `✓ {{OUTPUT_TYPE}} saved: <{{OUTPUT_TYPE}}-id>.md`
