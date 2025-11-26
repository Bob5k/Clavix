# clavix analyze

Internal prompt analysis command used by the improve workflow. This is an agent-only command and should not be called directly by users.

## Description

The `analyze` command performs detailed prompt analysis including intent detection, quality assessment, and pattern identification. It is invoked internally by the `improve` command to power its optimization workflow.

## Agent-Only Command

This command is designed to be invoked by AI agents as part of the `/clavix:improve` workflow:

1. User runs `/clavix:improve [prompt]`
2. Agent detects it needs deeper analysis
3. Agent invokes `clavix analyze [prompt]` internally
4. Results feed back into the improve workflow

**Users should use `clavix improve` instead of calling `analyze` directly.**

## Syntax

```bash
clavix analyze [prompt] [options]
```

## Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| `prompt` | Yes | The prompt text to analyze |

## Options

| Flag | Description |
|------|-------------|
| `--json` | Output results as JSON (default for agent consumption) |
| `--depth` | Analysis depth: `standard` or `comprehensive` |

## Output Format

The command outputs structured JSON for agent consumption:

```json
{
  "intent": "code-generation",
  "intentConfidence": 0.85,
  "quality": {
    "clarity": 7,
    "efficiency": 6,
    "structure": 8,
    "completeness": 7,
    "actionability": 6,
    "specificity": 7,
    "overall": 6.83
  },
  "patterns": [
    { "name": "ConcisenessFilter", "applicable": true },
    { "name": "ContextPrecisionBooster", "applicable": true }
  ],
  "escalation": {
    "shouldEscalate": false,
    "confidence": "low",
    "factors": []
  }
}
```

## Why Agent-Only?

1. **Workflow Integration**: The analyze command is a building block within the improve workflow, not a standalone feature
2. **Output Format**: Raw JSON output is meant for agent parsing, not human readability
3. **No File Saving**: Unlike improve, analyze doesn't save results - that's the improve command's job
4. **Avoid Confusion**: Users might confuse analyze with improve; keeping it internal simplifies the CLI

## Related Commands

- `clavix improve` - User-facing prompt optimization (calls analyze internally)
- `clavix execute` - Run optimized prompts

## Technical Notes

The analyze command is powered by:
- `IntentDetector` - Classifies prompts into 11 intent types
- `QualityAssessor` - Scores prompts on 6 dimensions
- `PatternLibrary` - Identifies applicable optimization patterns
- `UniversalOptimizer` - Coordinates the analysis pipeline
