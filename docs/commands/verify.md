# clavix verify

Post-implementation verification command that validates completed work against the original requirements and checklist items. Introduced in v4.8.

## Description

The `verify` command helps ensure that implementation work meets the requirements defined in PRDs or optimized prompts. It parses checklists from planning documents and runs automated verification hooks where possible.

## Syntax

```bash
clavix verify [options]
```

## Options

| Flag | Alias | Description |
|------|-------|-------------|
| `--latest` | `-l` | Verify the latest executed prompt |
| `--id` | | Verify a specific prompt by ID |
| `--project` | `-p` | Verify a specific project's implementation |
| `--status` | `-s` | Show verification status without running checks |
| `--retry-failed` | | Re-run only failed verification items |
| `--export` | `-e` | Export verification report (markdown or json) |
| `--run-hooks` | | Run automated CLI hooks (default: true) |
| `--no-run-hooks` | | Skip automated hooks (manual verification only) |

## Verification Types

### Automated Verification

The command automatically detects and runs verification hooks for:
- **npm test** - Runs test suite
- **npm run build** - Verifies build passes
- **npm run lint** - Checks linting
- **npm run typecheck** - TypeScript validation

### Manual Verification

For checklist items that cannot be automated:
- Displays the checklist item
- Prompts for manual confirmation
- Records verification result

## Examples

### Verify Latest Work

```bash
# Verify the most recently executed prompt
clavix verify --latest
```

### Verify Specific Project

```bash
# Verify implementation for a specific project
clavix verify --project auth-feature
```

### Show Status Only

```bash
# See verification status without running checks
clavix verify --status
```

### Export Report

```bash
# Export verification report as markdown
clavix verify --latest --export markdown

# Export as JSON for automation
clavix verify --latest --export json
```

### Retry Failed Items

```bash
# Only re-run items that previously failed
clavix verify --retry-failed
```

## Output

### Verification Summary

```
📋 Verification Report
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Project: auth-feature
Source: .clavix/outputs/auth-feature/full-prd.md

Automated Checks:
✅ npm test - PASSED (42 tests, 0 failures)
✅ npm run build - PASSED
⚠️ npm run lint - SKIPPED (no lint script)

Manual Checklist:
✅ User registration form functional
✅ Login/logout flow complete
⏳ Password reset email configured
❌ OAuth integration tested

Summary: 4/6 items verified (66%)
```

### Verification Report File

Reports are saved to:
```
.clavix/outputs/[project]/.verification.json
```

## Integration with Workflows

### After `/clavix:execute`

When a saved prompt is executed, the execute workflow reminds you to verify:

```
⚠️ VERIFICATION REQUIRED
After implementation, run: /clavix:verify --latest
```

### After `/clavix:implement`

The implement workflow tracks task completion and suggests verification:

```
All tasks completed!
Next step: Run /clavix:verify --project [name] to validate implementation
```

## Checklist Sources

The verify command parses checklists from:

1. **PRD Files** - Success criteria and validation checklists
2. **Optimized Prompts** - Validation sections from comprehensive depth
3. **Task Files** - Completion criteria from tasks.md

## Related Commands

- `clavix implement` - Execute implementation tasks
- `clavix execute` - Run saved prompts
- `clavix archive` - Archive after verification passes
