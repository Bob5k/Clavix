# clavix improve

Unified prompt optimization command that combines quick improvements with comprehensive analysis capabilities. Introduced in v4.11 to replace the separate `fast` and `deep` commands.

## Description

The `improve` command analyzes prompts and applies Clavix Intelligence patterns to optimize them for AI agent consumption. It uses smart triage to determine whether standard depth (quick optimization) or comprehensive depth (thorough analysis) is appropriate.

## Syntax

```bash
clavix improve [prompt] [options]
```

## Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| `prompt` | No | The prompt text to optimize. If omitted, enters interactive mode. |

## Options

| Flag | Alias | Description |
|------|-------|-------------|
| `--comprehensive` | `-c` | Force comprehensive depth analysis |
| `--standard` | `-s` | Force standard depth optimization |
| `--save` | | Save the optimized prompt to disk |
| `--no-save` | | Skip saving (display only) |
| `--project` | `-p` | Project name for organization |
| `--json` | | Output results as JSON |

## Depth Selection

### Automatic (Default)

When neither `--comprehensive` nor `--standard` is specified, the command uses smart triage:

- **Quality Score >= 75%**: Automatically uses standard depth
- **Quality Score 60-74%**: Asks user to choose depth
- **Quality Score < 60%**: Recommends comprehensive depth

### Standard Depth

Quick optimization focusing on:
- Intent detection (11 types)
- Quality assessment (6 dimensions)
- Pattern application (12 standard patterns)
- Optimized prompt generation

### Comprehensive Depth

Thorough analysis including everything in standard plus:
- Alternative phrasings (3-5 variants)
- Edge case identification
- Implementation considerations
- Validation checklist
- Risk analysis
- All 27 patterns applied

## Examples

### Basic Usage

```bash
# Optimize a prompt with automatic depth selection
clavix improve "Create a user authentication system"

# Force comprehensive analysis
clavix improve "Build a payment processing module" --comprehensive

# Quick optimization only
clavix improve "Add a search feature" --standard
```

### Interactive Mode

```bash
# Enter interactive mode (prompts for input)
clavix improve
```

### With Project Organization

```bash
# Save under a specific project
clavix improve "Implement caching layer" --project my-app --save
```

## Output

### Standard Depth Output

```
📊 Quality Assessment:
- Clarity: 7/10
- Efficiency: 6/10
- Structure: 8/10
- Completeness: 7/10
- Actionability: 6/10
- Specificity: 7/10

🎯 Detected Intent: code-generation

✨ Optimized Prompt:
[Improved prompt text with [ADDED], [CLARIFIED] annotations]

💾 Saved to: .clavix/outputs/prompts/improve-20251126-1430.md
```

### Comprehensive Depth Output

Includes everything above plus:

```
🔄 Alternative Approaches:
1. [Alternative phrasing 1]
2. [Alternative phrasing 2]
3. [Alternative phrasing 3]

⚠️ Edge Cases:
- [Edge case 1]
- [Edge case 2]

✅ Validation Checklist:
- [ ] Check 1
- [ ] Check 2
- [ ] Check 3
```

## Saved File Location

Prompts are saved to:
```
.clavix/outputs/prompts/improve-YYYYMMDD-HHMM.md
```

## Related Commands

- `clavix execute` - Run a saved optimized prompt
- `clavix list` - List saved prompts
- `clavix show` - View prompt details
- `clavix analyze` - Internal analysis (agent-only)

## Migration from v4.10

In v4.11, the `fast` and `deep` commands were unified into `improve`:

| Old Command | New Equivalent |
|-------------|----------------|
| `clavix fast` | `clavix improve --standard` |
| `clavix deep` | `clavix improve --comprehensive` |
| `clavix fast` (auto) | `clavix improve` (auto-selects depth) |

The old commands are no longer available. Use `clavix improve` for all prompt optimization.
