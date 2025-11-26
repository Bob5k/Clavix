# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [4.8.0] - 2025-11-26

### Checklist Verification System Release

**Post-implementation verification system ensuring prompts from deep/fast modes are validated against their checklists. Verification is now a REQUIRED step after implementation.**

#### New Feature: `/clavix:verify` Command
Complete verification workflow for validating implementations against checklists:

| Flag | Description |
|------|-------------|
| `--latest` | Verify latest executed prompt |
| `--fast` | Filter to fast prompts only |
| `--deep` | Filter to deep prompts only |
| `--id <id>` | Verify specific prompt by ID |
| `--status` | Show verification status only |
| `--retry-failed` | Re-run only failed items |
| `--export markdown\|json` | Export verification report |
| `--run-hooks` | Run automated hooks (default: true) |

#### Verification System Architecture

**New Core Modules:**
- `src/types/verification.ts` - Type definitions for verification system
- `src/core/checklist-parser.ts` - Parse validation checklists from deep mode output
- `src/core/verification-hooks.ts` - CLI hook detection (npm/yarn/pnpm) and execution
- `src/core/verification-manager.ts` - Verification state management and persistence
- `src/core/basic-checklist-generator.ts` - Generate basic checklists for fast mode prompts

**Verification Types:**
| Type | Detection | Examples |
|------|-----------|----------|
| `automated` | CLI hooks | "tests pass", "compiles", "lint", "typecheck" |
| `semi-automated` | Browser/visual | "renders correctly", "no console errors" |
| `manual` | Human judgment | "requirements met", "edge cases handled" |

**CLI Hook Auto-Detection:**
- Detects package manager (npm, yarn, pnpm) from lock files
- Maps checklist items to appropriate hooks (test, build, lint, typecheck)
- Runs hooks automatically during verification
- Falls back to manual verification for items without hooks

#### Fast Mode Checklist Generation
Fast mode prompts don't have comprehensive checklists. The verification system now:
1. Detects prompt intent (11 types: code-generation, testing, debugging, etc.)
2. Generates basic checklist based on detected intent
3. Adds context-specific items based on keywords (API, UI, database, auth, performance)

#### Verification Report Format
```
══════════════════════════════════════════════════════════════════════
                    VERIFICATION REPORT
                    [prompt-id]
══════════════════════════════════════════════════════════════════════

📋 VALIDATION CHECKLIST (X items)

✅ [automated] Code compiles/runs without errors
   Evidence: npm run build - exit code 0
   Confidence: HIGH

❌ [manual] All requirements implemented
   Status: FAILED
   Reason: Missing feature X
   Confidence: MEDIUM

══════════════════════════════════════════════════════════════════════
                         SUMMARY
══════════════════════════════════════════════════════════════════════
Total:        X items
Passed:       Y (Z%)
Failed:       N (requires attention)
Skipped:      M
══════════════════════════════════════════════════════════════════════
```

#### Verification Storage
Reports saved alongside prompt files:
```
.clavix/
  outputs/
    prompts/
      deep/
        deep-20250117-143022-a3f2.md              # Prompt
        deep-20250117-143022-a3f2.verification.json  # Report
```

#### Execute Integration (REQUIRED Verification)
Updated `/clavix:execute` workflow:
1. Execute displays checklist summary
2. Shows **⚠️ VERIFICATION REQUIRED** notice
3. Prompts user to run `clavix verify --latest` after implementation
4. Verification is tracked in prompt metadata

**PromptMetadata Extensions:**
- `verificationRequired: boolean` - Always true for new prompts
- `verified: boolean` - Set when verification completes successfully
- `verifiedAt: string | null` - Timestamp of verification completion

#### New Slash Command Template
- `src/templates/slash-commands/_canonical/verify.md` - Complete verification workflow documentation
- `src/templates/slash-commands/_components/agent-protocols/verification-methods.md` - Verification methods by category

#### New Tests
| Test File | Coverage |
|-----------|----------|
| `tests/core/checklist-parser.test.ts` | Parsing validation, edge cases, risks from markdown |
| `tests/core/verification-manager.test.ts` | Report lifecycle, item verification, status tracking |
| `tests/core/verification-hooks.test.ts` | Hook detection, execution, package manager detection |
| `tests/core/basic-checklist-generator.test.ts` | Intent-based checklist generation |
| `tests/cli/verify.test.ts` | CLI command flags and help |

#### Files Added
- `src/types/verification.ts`
- `src/core/checklist-parser.ts`
- `src/core/verification-hooks.ts`
- `src/core/verification-manager.ts`
- `src/core/basic-checklist-generator.ts`
- `src/cli/commands/verify.ts`
- `src/templates/slash-commands/_canonical/verify.md`
- `src/templates/slash-commands/_components/agent-protocols/verification-methods.md`
- `tests/core/checklist-parser.test.ts`
- `tests/core/verification-manager.test.ts`
- `tests/core/verification-hooks.test.ts`
- `tests/core/basic-checklist-generator.test.ts`
- `tests/cli/verify.test.ts`

#### Files Modified
- `src/core/prompt-manager.ts` - Added verification tracking fields
- `src/cli/commands/execute.ts` - Added checklist summary and verification notice
- `src/templates/slash-commands/_canonical/execute.md` - Added REQUIRED verification section

---

## [4.7.0] - 2025-11-26

### Mode Enforcement & Command Taxonomy Release

**Strengthened mode boundaries to prevent agents from implementing during optimization workflows, removed confusing `/clavix:prompts` slash command, and improved CLI command documentation.**

#### Removed `/clavix:prompts` Slash Command
- **Deleted** `src/templates/slash-commands/_canonical/prompts.md`
- CLI commands (`clavix prompts list`, `clavix prompts clear`) remain unchanged
- Prompt management documentation moved to `execute.md`
- Removes command taxonomy confusion (action commands vs reference-only commands)

#### Strengthened Mode Enforcement (Critical Fix)
Problem: Agents using `/clavix:fast` or `/clavix:deep` sometimes jumped straight to implementation instead of stopping after optimization.

Solution:
- Added **⛔ STOP: OPTIMIZATION MODE** header at top of `fast.md` and `deep.md`
- Explicit "YOU MUST NOT" section listing prohibited actions
- "STOP HERE" instruction after optimization workflow
- Required response ending: "Run `/clavix:execute --latest` to implement"
- CLI verification block: Run `clavix prompts list` to verify save

#### CLI Verification Blocks
New pattern in templates where agents must verify their CLI commands ran:
```markdown
## Agent Verification (Run This Command)
```bash
clavix prompts list
```
Verify your prompt appears in the list.
```

#### Updated Agent Connector Templates
All agent connectors (octo.md, agents.md, copilot-instructions.md, warp.md) updated with:
- v4.7 mode enforcement section with emoji indicators
- Clear separation of OPTIMIZATION (no code), PLANNING (no code), IMPLEMENTATION (code allowed)
- Explicit STOP instruction for optimization workflows

#### New Consistency Tests
- `tests/consistency/mode-enforcement.test.ts` - Validates:
  - `prompts.md` no longer exists
  - `fast.md` and `deep.md` have mode enforcement headers
  - No templates reference `/clavix:prompts`
  - Agent connectors have consistent mode enforcement

#### Updated Validation Script
- `scripts/validate-consistency.ts` updated to v4.7
- New validation: `validateModeEnforcement()` checks:
  - `prompts.md` does not exist
  - Mode enforcement headers in fast/deep templates
  - No `/clavix:prompts` references in any template

#### Files Deleted
- `src/templates/slash-commands/_canonical/prompts.md`

#### Files Modified
- `src/templates/slash-commands/_canonical/fast.md` - Mode enforcement header + CLI verification
- `src/templates/slash-commands/_canonical/deep.md` - Mode enforcement header + CLI verification
- `src/templates/slash-commands/_canonical/execute.md` - Comprehensive prompt management section
- `src/templates/slash-commands/_canonical/archive.md` - Removed `/clavix:prompts` references
- `src/templates/agents/octo.md` - v4.7 mode enforcement
- `src/templates/agents/agents.md` - v4.7 mode enforcement
- `src/templates/agents/copilot-instructions.md` - v4.7 mode enforcement
- `src/templates/agents/warp.md` - v4.7 mode enforcement
- `scripts/validate-consistency.ts` - v4.7 with mode enforcement validation

#### Files Added
- `tests/consistency/mode-enforcement.test.ts`

---

## [4.6.0] - 2025-11-25

### Agent Validation & Consistency Release

**Enhanced agent self-verification, template-code consistency validation, and documentation cleanup.**

#### Template-Code Consistency Tests (Part 1)
New `tests/consistency/` test suite:
| Test File | Purpose |
|-----------|---------|
| `template-code-mapping.test.ts` | Validates templates describe correct file paths, 6 quality dimensions, 11 intent types, decision rules |
| `pattern-counts.test.ts` | Validates pattern counts in documentation match PatternLibrary reality |

#### Agent Assertion Checkpoints (Part 2)
New `assertion-checkpoints.md` component for agent self-verification:
- **Fast/Deep Mode**: Verify quality assessment shown, all 6 dimensions scored, patterns applied listed
- **PRD Mode**: Verify all 5 questions asked, both documents generated, quality validation shown
- **Implementation Mode**: Verify task breakdown created, progress tracking active, git commits offered

Added **Rule 11: Execution Verification** to decision-rules.md:
```
BEFORE completing response:
  → INCLUDE verification block at end
  → VERIFY all checkpoints met for current mode
```

#### Documentation Cleanup (Part 3)
- Removed all outdated v2.x/v3.x version references from canonical templates
- Updated fast.md example to include all 6 quality dimensions (added Specificity)
- Updated pattern-visibility.md with correct counts (Deep: 27 patterns)
- Updated Agent Transparency sections to v4.6 in fast.md, deep.md, prd.md

#### Validate-Consistency Script (Part 4)
Enhanced `scripts/validate-consistency.ts`:
- Updated version to v4.6
- Added new validation: **Outdated Version References** (detects v2.x, v3.x in canonical templates)
- All 7 validation checks now automated

#### Files Added
- `tests/consistency/template-code-mapping.test.ts`
- `tests/consistency/pattern-counts.test.ts`
- `src/templates/slash-commands/_components/agent-protocols/assertion-checkpoints.md`

#### Files Modified
- `src/templates/slash-commands/_canonical/fast.md` - v4.6 Agent Transparency, fixed example
- `src/templates/slash-commands/_canonical/deep.md` - v4.6 Agent Transparency, removed v2.7
- `src/templates/slash-commands/_canonical/prd.md` - v4.6 Agent Transparency
- `src/templates/slash-commands/_canonical/archive.md` - Removed v2.7 reference
- `src/templates/slash-commands/_components/agent-protocols/decision-rules.md` - Added Rule 11
- `src/templates/slash-commands/_components/sections/pattern-visibility.md` - Fixed Deep count to 27
- `scripts/validate-consistency.ts` - v4.6 with version reference validation
- `tests/integration/template-coverage.test.ts` - Updated for v4.6 (removed v2.7 expectations)

#### Test Results
- **137 test suites passed**
- **3872 tests passed**
- **Consistency validation: 7/7 checks pass**

---

## [4.5.0] - 2025-11-25

### Consolidation Release

**Major architectural consolidation with unified pattern type system, shared confidence utilities, and pattern dependencies.**

#### Pattern Type System (Parts 1-4)
- **Unified types**: `PatternMode`, `PatternPriority` (1-10 scale), `PatternPhase`
- **PatternConfigSchema**: Declarative pattern configuration with validation
- **IPatternLibrary interface**: Dependency injection for patterns
- All 27 patterns updated with readonly properties and phase declarations

#### Confidence Calculator (Part 5)
New shared `confidence-calculator.ts` module:
| Function | Purpose |
|----------|---------|
| `calculateAdditiveConfidence()` | Bonus-based scoring (base + conditional bonuses) |
| `calculateRatioConfidence()` | Ratio-based scoring (primary/total) |
| `applyCompetitionPenalty()` | Ambiguity detection penalty |
| `calculateWeightedConfidence()` | Weighted average calculation |

- IntentDetector and ConversationSummarizer now use shared utilities

#### Pattern Dependencies (Part 6)
New `PatternDependency` interface:
- `runAfter`: Patterns that must execute before this one
- `excludesWith`: Mutually exclusive patterns
- `enhancedBy`: Informational synergies
- Topological sort with circular dependency detection

#### Generator Include Resolution (Part 7)
- InstructionsGenerator uses TemplateAssembler for `{{INCLUDE:}}` resolution
- Canonical templates fully assembled before copying to output

#### Documentation Sync (Part 8)
- Updated intent-types.md with summarization intent (11 total)
- Fixed pattern-visibility.md priorities (8 patterns corrected)
- Corrected pattern counts (12 fast mode, 27 deep mode)
- Updated validate-consistency.ts for v4.5 pattern format

#### Files Added
- `src/core/intelligence/confidence-calculator.ts`

#### Files Modified
- `src/core/intelligence/patterns/base-pattern.ts` - v4.5 unified type system
- `src/core/intelligence/pattern-library.ts` - Dependency sorting, phase filtering
- `src/core/intelligence/intent-detector.ts` - Shared confidence calculator
- `src/core/intelligence/patterns/*.ts` - All 27 patterns updated
- `src/core/adapters/instructions-generator.ts` - TemplateAssembler integration
- `scripts/validate-consistency.ts` - v4.5 pattern format support
- `src/templates/slash-commands/_components/sections/pattern-visibility.md`
- `src/templates/slash-commands/_components/references/intent-types.md`

---

## [4.4.0] - 2025-11-25

### Quality & Stability Release

**Comprehensive test coverage, enhanced conversational patterns, and config-based extensibility.**

#### Test Coverage (Part 1)
- **100% pattern test coverage**: Added tests for all 21 previously untested patterns
- **Total tests: 3841** across 135 test suites
- Tests cover all pattern properties, isApplicable(), apply(), edge cases, and result structures

#### Enhanced Conversational Patterns (Part 2)
| Pattern | Enhancement |
|---------|-------------|
| ConversationSummarizer | Expanded ~30 conversational markers, confidence scoring (50-100%), enhanced goal/requirement extraction |
| TopicCoherenceAnalyzer | Expanded to 15 topic categories with more keywords per category |
| ImplicitRequirementExtractor | Categorized patterns (infrastructure, security, performance, UX, integration), increased limit to 10, emoji-labeled output |

#### Config-Based Extensibility (Part 3)
New `intelligence` section in `.clavix/config.json`:
```json
{
  "intelligence": {
    "defaultMode": "fast",
    "verbosePatternLogs": false,
    "patterns": {
      "disabled": ["pattern-id"],
      "priorityOverrides": { "pattern-id": 5 },
      "customSettings": { "pattern-id": { "key": "value" } }
    }
  }
}
```

#### Template Polish (Part 4)
- Updated all canonical templates to v4.4 Agent Transparency
- Added v4.4 extraction capabilities to start.md and summarize.md
- Updated configuration documentation with new intelligence settings

#### Files Added
- 21 new test files in `tests/core/intelligence/patterns/`

#### Files Modified
- `src/types/config.ts` - Added IntelligenceConfig, PatternSettingsConfig
- `src/core/intelligence/pattern-library.ts` - Added applyConfig(), isPatternDisabled(), getPatternSettings()
- `src/core/intelligence/patterns/conversation-summarizer.ts` - v4.4 enhancements
- `src/core/intelligence/patterns/topic-coherence-analyzer.ts` - v4.4 enhancements
- `src/core/intelligence/patterns/implicit-requirement-extractor.ts` - v4.4 enhancements
- `src/templates/slash-commands/_canonical/*.md` - v4.4 version updates
- `.clavix/instructions/workflows/*.md` - v4.4 version updates
- `docs/guides/configuration.md` - Intelligence configuration documentation

---

## [4.3.2] - 2025-11-25

### PRD & Conversational Intelligence Release

**Extends Clavix Intelligence to PRD mode (`/clavix:prd`) and Conversational mode (`/clavix:start`) with 7 new dedicated patterns and "Supportive Companion" UX for non-intrusive quality tracking.**

#### New Patterns (7 total)

**PRD Mode Patterns (4):**
| Pattern | Priority | Purpose |
|---------|----------|---------|
| RequirementPrioritizer | P7 | Separates must-have from nice-to-have requirements |
| UserPersonaEnricher | P6 | Adds missing user context and personas |
| SuccessMetricsEnforcer | P7 | Ensures measurable success criteria exist |
| DependencyIdentifier | P5 | Identifies technical and external dependencies |

**Conversational Mode Patterns (3):**
| Pattern | Priority | Purpose |
|---------|----------|---------|
| ConversationSummarizer | P8 | Extracts structured requirements from messages |
| TopicCoherenceAnalyzer | P6 | Detects topic shifts and multi-topic conversations |
| ImplicitRequirementExtractor | P7 | Surfaces requirements mentioned indirectly |

#### Core Infrastructure Updates

- **New Types:** `OptimizationPhase`, `DocumentType` for phase-aware pattern selection
- **Extended `OptimizationMode`:** Now includes `'prd'` and `'conversational'` modes
- **Enhanced `PatternContext`:** Added `phase`, `documentType`, `questionId` fields
- **New Pattern Selection:** `selectPatternsForMode()` method with phase-aware filtering
- **PRD Answer Validation:** `validatePRDAnswer()` method with adaptive threshold (< 50%)

#### "Supportive Companion" UX for Conversational Mode

New `ConversationQualityTracker` class implementing UX-first design:
- Silent tracking during normal conversation flow
- Positive checkpoints: "📝 Shaping up nicely! Covered: features, constraints..."
- Gentle nudges only for critical gaps (max 1 per session)
- Reassuring end message: "✨ Clavix Intelligence will enhance your summary"

#### Updated Pattern Counts

| Mode | Patterns Available |
|------|-------------------|
| Fast | 21 core patterns |
| Deep | 27 total patterns |
| PRD | 15 patterns |
| Conversational | 11 patterns |

#### Files Added
- `src/core/intelligence/patterns/requirement-prioritizer.ts`
- `src/core/intelligence/patterns/user-persona-enricher.ts`
- `src/core/intelligence/patterns/success-metrics-enforcer.ts`
- `src/core/intelligence/patterns/dependency-identifier.ts`
- `src/core/intelligence/patterns/conversation-summarizer.ts`
- `src/core/intelligence/patterns/topic-coherence-analyzer.ts`
- `src/core/intelligence/patterns/implicit-requirement-extractor.ts`
- `src/core/conversation-quality-tracker.ts`

#### Files Modified
- `src/core/intelligence/types.ts` - New types and extended interfaces
- `src/core/intelligence/pattern-library.ts` - Phase-aware selection, new pattern registration
- `src/core/intelligence/universal-optimizer.ts` - Context override support, PRD validation
- `src/core/intelligence/intent-detector.ts` - Added 'summarization' intent
- `src/core/intelligence/quality-assessor.ts` - Added summarization requirements
- `src/templates/slash-commands/_components/sections/pattern-visibility.md` - New pattern tables
- `src/templates/slash-commands/_canonical/fast.md` - Added summarization intent
- `src/templates/slash-commands/_canonical/deep.md` - Added summarization intent

---

## [4.1.1] - 2025-11-25

### Bug Fixes

**Fixed template variable mismatch in generated slash commands**

After `clavix init`, templates (e.g., `fast.md`) were generating with unsubstituted mustache variables like `{{MODE_TYPE}}`, `{{WORKFLOW_TYPE}}`, `{{ACTION}}`, etc.

**Root Cause:** Variable name mismatch between `{{INCLUDE:}}` directives and component files:
- Include directives passed `MODE="prompt optimization"`
- Component files expected `{{MODE_TYPE}}`, `{{WORKFLOW_TYPE}}`, etc.

**Fix:** Replaced complex mustache-templated mode header components with inline static content in all 8 canonical templates:
- `fast.md`, `deep.md`, `plan.md`, `prd.md`, `implement.md`, `execute.md`, `start.md`, `summarize.md`

Each template now has properly formatted, static mode enforcement and self-correction protocol sections specific to that mode. This eliminates variable interpolation complexity and ensures consistent template output.

---

## [4.1.0] - 2025-11-25

### Agent Transparency Release: Clavix Intelligence v4.1

**Comprehensive agent-first design improvements with transparent decision rules, reusable template components, and 6 new optimization patterns for better AI agent interaction.**

#### Phase 1: Agent Transparency Components (7 components)

**New Component Directory Structure:**
Created `_components/agent-protocols/` and enhanced `_components/sections/` with reusable agent transparency components:

| Component | Purpose |
|-----------|---------|
| `agent-protocols/decision-rules.md` | Deterministic IF-THEN rules for agent behavior |
| `agent-protocols/quality-output.md` | Action-oriented quality output format |
| `agent-protocols/state-awareness.md` | Workflow state detection protocol (6 states) |
| `agent-protocols/error-handling.md` | Three-tier error classification (RECOVERABLE, BLOCKING, UNRECOVERABLE) |
| `agent-protocols/file-formats.md` | JSON schemas for config and task files |
| `sections/escalation-factors.md` | 8-factor smart triage system with point values |
| `sections/pattern-visibility.md` | Pattern documentation with impact indicators |

#### Phase 2: Template Refactoring (8 templates)

**All canonical templates refactored to use `{{INCLUDE:}}` directives:**
- `fast.md`, `deep.md`, `implement.md`, `plan.md`, `prd.md`, `execute.md`, `start.md`, `summarize.md`
- Each template now includes "Agent Transparency (v4.1)" section
- Mode headers extracted to reusable components
- Self-correction protocols standardized across templates

#### Phase 3: New Optimization Patterns (6 patterns)

**v4.1 Agent Transparency Patterns (both modes):**
| Pattern | Priority | Purpose |
|---------|----------|---------|
| AmbiguityDetector | 9 | Identifies ambiguous terms and vague references |
| OutputFormatEnforcer | 7 | Adds explicit output format specifications |
| SuccessCriteriaEnforcer | 6 | Adds measurable success criteria |
| DomainContextEnricher | 5 | Adds domain-specific best practices |

**Deep Mode Only Patterns (2):**
| Pattern | Priority | Purpose |
|---------|----------|---------|
| ErrorToleranceEnhancer | 5 | Adds error handling requirements |
| PrerequisiteIdentifier | 6 | Identifies prerequisites and dependencies |

**Pattern Count Updated:**
- Fast mode: 8 → 12 patterns
- Deep mode: 14 → 20 patterns

#### Key Improvements

- **Agent-First Design**: Templates now explain CLI behavior to agents, not the other way around
- **Transparent Decision Rules**: Agents can follow deterministic IF-THEN rules
- **Error Classification**: Clear guidance on what's recoverable vs blocking vs unrecoverable
- **State Awareness**: Agents can detect workflow state from file presence
- **Domain Expertise**: Domain-specific best practices automatically added

#### Tests

- All 3,270 tests pass
- Updated snapshots for new pattern outputs
- Updated test expectations for v4.1 behavior

---

## [4.0.0] - 2025-11-25

### Major Release: Clavix Intelligence v4.0

**Comprehensive enhancement of the Clavix Intelligence system with expanded intent detection, improved quality assessment, guardrails for mode enforcement, template modularity, and 8 new optimization patterns.**

#### Phase 1: Enhanced Intent Detection

**New Intents Added (4 new types):**
- `testing` - Detects test writing, unit tests, integration tests, mocking patterns
- `migration` - Detects technology migrations, version upgrades, framework switches
- `security-review` - Detects security audits, vulnerability scanning, OWASP checks
- `learning` - Detects educational requests, tutorials, concept explanations

**Keyword Enhancements:**
- Added spec-driven development keywords to PLANNING intent ("write spec", "create specification", "technical spec")
- Enhanced keyword arrays with strong, medium, and weak indicators for all new intents
- Added `EnhancedIntentAnalysis` interface for secondary intent tracking

#### Phase 2: Quality Assessment Improvements

**New Quality Dimension:**
- Added `specificity` as 6th quality dimension (assesses concreteness and precision)
- Specificity rewards: numbers (+10), file paths (+10), technical terms (+5)
- Specificity penalties: vague terms (-15 each for "somewhat", "maybe", "probably", etc.)

**Intent-Specific Completeness:**
- Added `COMPLETENESS_REQUIREMENTS` map with intent-specific criteria
- Updated `calculateOverall()` with 6-dimension weighted scoring per intent
- Implemented `EscalationAnalysis` for smart triage decisions with 8 escalation factors

#### Phase 3: Guardrails & Mode Enforcement

**Mode Clarity:**
- Added CLAVIX MODE blocks to planning templates (plan.md)
- Added IMPLEMENTATION MODE blocks to implementation templates (implement.md, execute.md)
- Clear separation between planning (no code changes) and implementation (code changes)

**Self-Correction Protocol:**
- Added self-correction checklist to all 6 planning templates
- Automatic mode drift detection and correction guidance
- Checkpoint patterns for workflow integrity

**New Files:**
- `src/templates/instructions/core/mode-enforcement.md` - Authoritative mode enforcement reference

#### Phase 4: Template Modularity

**Component System:**
- Created `_components/` directory structure for reusable template parts
- Implemented `{{INCLUDE:}}` marker syntax for component inclusion
- Support for variable interpolation with mustache-style syntax

**TemplateAssembler Class:**
- New `src/core/template-assembler.ts` with caching and validation
- Processes includes, handles missing components gracefully
- Supports nested includes and section blocks for conditionals

**Component Files Created:**
- `mode-headers/`: planning-mode.md, implementation-mode.md
- `sections/`: quality-assessment.md, file-saving-protocol.md, workflow-navigation.md, intent-detection.md, self-correction.md
- `troubleshooting/`: file-not-saved.md, triage-escalation.md, mode-confusion.md

#### Phase 5: New Optimization Patterns (8 patterns)

**Deep Mode Patterns (6):**
| Pattern | File | Purpose |
|---------|------|---------|
| AlternativePhrasingGenerator | `alternative-phrasing-generator.ts` | Generate 2-3 alternative prompt structures |
| EdgeCaseIdentifier | `edge-case-identifier.ts` | Identify potential edge cases by domain |
| ValidationChecklistCreator | `validation-checklist-creator.ts` | Create implementation validation checklists |
| AssumptionExplicitizer | `assumption-explicitizer.ts` | Make implicit assumptions explicit |
| ScopeDefiner | `scope-definer.ts` | Add explicit scope boundaries |
| PRDStructureEnforcer | `prd-structure-enforcer.ts` | Ensure PRD completeness |

**Both Mode Patterns (2):**
| Pattern | File | Purpose |
|---------|------|---------|
| StepDecomposer | `step-decomposer.ts` | Break complex prompts into sequential steps |
| ContextPrecisionBooster | `context-precision.ts` | Add precise context when missing |

**PatternLibrary Updated:**
- All 8 new patterns registered in `pattern-library.ts`
- Total patterns increased from 6 to 14

#### Phase 6: Testing & Documentation

**New Tests:**
- Intent detector tests for all 4 new intents
- Quality assessor tests for specificity dimension and new intent weights
- TemplateAssembler comprehensive test suite (20 tests)
- Updated existing tests for v4.0 API changes

#### Technical Changes

**Files Added:**
- `src/core/template-assembler.ts`
- `src/core/intelligence/patterns/alternative-phrasing-generator.ts`
- `src/core/intelligence/patterns/edge-case-identifier.ts`
- `src/core/intelligence/patterns/validation-checklist-creator.ts`
- `src/core/intelligence/patterns/assumption-explicitizer.ts`
- `src/core/intelligence/patterns/scope-definer.ts`
- `src/core/intelligence/patterns/prd-structure-enforcer.ts`
- `src/core/intelligence/patterns/step-decomposer.ts`
- `src/core/intelligence/patterns/context-precision.ts`
- `src/templates/instructions/core/mode-enforcement.md`
- `src/templates/slash-commands/_components/` directory structure
- `tests/core/template-assembler.test.ts`

**Files Modified:**
- `src/core/intelligence/types.ts` - New PromptIntent values, QualityDimension, interfaces
- `src/core/intelligence/intent-detector.ts` - New keyword arrays, getKeywordsForIntent()
- `src/core/intelligence/quality-assessor.ts` - assessSpecificity(), COMPLETENESS_REQUIREMENTS
- `src/core/intelligence/universal-optimizer.ts` - analyzeEscalation(), EscalationAnalysis
- `src/core/intelligence/pattern-library.ts` - 8 new pattern registrations
- `src/utils/template-loader.ts` - TemplateAssembler integration
- `src/templates/slash-commands/_canonical/plan.md` - Mode block, self-correction
- `src/templates/slash-commands/_canonical/implement.md` - Implementation mode block
- `src/templates/slash-commands/_canonical/execute.md` - Implementation mode block
- All planning templates - Self-correction protocol

#### Breaking Changes

None - v4.0 maintains backward compatibility with existing configurations.

---

## [3.6.1] - 2025-11-24

### 📐 Documentation Hierarchy & Verbosity Reduction

**Comprehensive refactoring of instruction architecture to reduce verbosity and improve maintainability.**

#### Fixed Issues

- **Fixed**: Generic connector files (octo.md, agents.md, copilot-instructions.md) were too large (7-20K) with extensive workflow duplication
- **Fixed**: Ambiguous terminology - "CLAVIX MODE" didn't distinguish planning vs implementation workflows clearly
- **Fixed**: Inconsistent workflow references between canonical templates, instruction files, and generic connectors
- **Fixed**: Missing documentation hierarchy principles causing maintenance confusion

#### New Features

- **Added**: Comprehensive `src/templates/instructions/README.md` documenting three-layer hierarchy (Canonical → Instructions → Connectors)
- **Added**: Explicit mode distinction - "CLAVIX PLANNING MODE" vs "CLAVIX IMPLEMENTATION MODE" terminology throughout
- **Added**: Standard workflow documentation (PRD → Plan → Implement → Archive) across all files
- **Added**: Command categorization table showing which commands implement vs plan

#### Improvements

**Instruction Files Expanded** (to match canonical 100%):
- `workflows/fast.md`: 2.7K → 13K (expanded with complete workflow, intent detection, quality assessment, smart triage)
- `workflows/deep.md`: 3.2K → 17K (added strategic scope detection, alternatives, validation, edge cases, risk assessment)
- `workflows/prd.md`: 4.2K → 14K (expanded with complete 5-question Socratic sequence, validation criteria, file-saving protocol)
- `workflows/start.md`: Updated terminology (CLAVIX MODE → CLAVIX PLANNING MODE)
- `workflows/summarize.md`: Updated terminology and mode boundaries

**Core Documentation Updated**:
- `core/clavix-mode.md`: Complete restructure with mode table, standard workflow, planning vs implementation distinction

**Generic Connectors Simplified** (removed duplicate workflows):
- `agents/octo.md`: 20K → 7.3K (64% reduction, 504 → 211 lines)
  - Removed all duplicate workflow descriptions
  - Kept only Octofriend-specific guidance (model switching, multi-turn thinking, zero telemetry)
  - Added workflow reference table pointing to instruction files
- `agents/agents.md`: 5.6K → 6.5K (restructured with tables, removed implementation workflow details)
- `agents/copilot-instructions.md`: 7K → 6.2K (12% reduction, 158 → 153 lines)

#### Technical Changes

**Documentation Architecture**:
```
Canonical Templates (SOURCE OF TRUTH)
  ↓ (inform)
Instruction Files (AGENT-CONSUMABLE)
  ↓ (reference)
Generic Connectors (THIN WRAPPERS + PLATFORM-SPECIFIC)
  ↓ (integrated into)
Platform Files (.clavix/ directory in user projects)
```

**Key Principles**:
1. **Single Source of Truth**: Canonical templates define authoritative behavior
2. **DRY Principle**: Instruction files implement canonical, connectors reference instructions
3. **Platform Focus**: Connector files focus on platform-specific value only

**Mode Distinction**:
- Planning workflows: `/clavix:start`, `/clavix:summarize`, `/clavix:fast`, `/clavix:deep`, `/clavix:prd`, `/clavix:plan` - DO NOT implement
- Implementation workflows: `/clavix:implement`, `/clavix:execute`, `/clavix:task-complete` - DO implement code

#### Files Updated

**Instruction Files Expanded**:
- `src/templates/instructions/workflows/fast.md` (2.7K → 13K)
- `src/templates/instructions/workflows/deep.md` (3.2K → 17K)
- `src/templates/instructions/workflows/prd.md` (4.2K → 14K)
- `src/templates/instructions/workflows/start.md` (terminology updated)
- `src/templates/instructions/workflows/summarize.md` (terminology updated)
- `src/templates/instructions/core/clavix-mode.md` (comprehensive restructure)

**Generic Connectors Simplified**:
- `src/templates/agents/octo.md` (20K → 7.3K, 64% reduction)
- `src/templates/agents/agents.md` (restructured with reference tables)
- `src/templates/agents/copilot-instructions.md` (7K → 6.2K, 12% reduction)

**New Documentation**:
- `src/templates/instructions/README.md` (comprehensive hierarchy principles, maintenance workflow, troubleshooting)

#### Migration

No migration needed. Run `clavix update` to regenerate improved instructions:

```bash
clavix update
# or
clavix init --force
```

This will deploy updated instruction files and generic connectors with improved structure and reduced verbosity.

---

## [3.6.0] - 2025-11-24

### 🎯 Enhanced Generic Connector Instructions

**Major improvements to AI agent instruction clarity for generic integrations (agents.md, octo.md, warp.md, GitHub Copilot)**

#### Fixed Issues

- **Fixed**: Agents jumping to implementation in `/clavix:start` conversational mode instead of gathering requirements
- **Fixed**: Agents skipping file creation in `/clavix:summarize` workflow (files not created despite instructions)
- **Fixed**: Ambiguous mode boundaries causing premature feature implementation

#### New Features

- **Added**: `.clavix/instructions/` reference folder with detailed workflow guides for generic integrations
- **Added**: Explicit "CLAVIX MODE" boundary at start of all workflows
- **Added**: Step-by-step file creation instructions with Write tool guidance (copied from proven fast.md pattern)
- **Added**: Verification checkpoints for critical workflow steps
- **Added**: Self-correction prompts for common agent failures
- **Added**: Comprehensive troubleshooting guides for workflow issues

#### Improvements

- **Improved**: `/clavix:start` workflow now explicitly prevents premature implementation with repeated "DO NOT IMPLEMENT" instructions
- **Improved**: `/clavix:summarize` workflow with mandatory file creation at step 3 (moved from step 5)
- **Improved**: All generic connector instructions (agents.md, octo.md, warp.md) with CLAVIX MODE blocks and instruction references
- **Improved**: GitHub Copilot integration with adapted workflows and fallback instructions
- **Improved**: Instruction clarity using repetition and explicit commands instead of passive suggestions

#### Technical Changes

- Restructured canonical templates (`start.md`, `summarize.md`) for stronger agent compliance
- Added hybrid instruction architecture (inline summaries + detailed reference files)
- Strengthened mode enforcement with redundant boundaries and checkpoints
- Replaced suggestive language ("suggest saving") with imperative commands ("you MUST create")
- Added explicit Write tool instructions for all file operations
- Copied proven file creation pattern from `fast.md` to `summarize.md`

#### Files Updated

**Canonical Templates:**
- `src/templates/slash-commands/_canonical/start.md` - Mode enforcement + checkpoints
- `src/templates/slash-commands/_canonical/summarize.md` - File creation fix (step 3)
- `src/templates/slash-commands/_canonical/fast.md` - CLAVIX MODE block
- `src/templates/slash-commands/_canonical/deep.md` - CLAVIX MODE block
- `src/templates/slash-commands/_canonical/prd.md` - CLAVIX MODE block

**Generic Connectors:**
- `src/templates/agents/agents.md` - CLAVIX MODE + instructions reference
- `src/templates/agents/octo.md` - CLAVIX MODE + strengthened workflows
- `src/templates/agents/warp.md` - CLAVIX MODE + instructions reference
- `src/templates/agents/copilot-instructions.md` - CLAVIX MODE + Copilot adaptations

**New Instruction Reference Files:**
- Added: `src/templates/instructions/` directory structure with 10 new reference files:
  - Core: `clavix-mode.md`, `file-operations.md`, `verification.md`
  - Workflows: `start.md`, `summarize.md`, `fast.md`, `deep.md`, `prd.md`
  - Troubleshooting: `jumped-to-implementation.md`, `skipped-file-creation.md`, `mode-confusion.md`

#### Migration

No migration needed. Run `clavix init` or `clavix update` to regenerate improved instructions with new `.clavix/instructions/` folder.

**For users of generic integrations** (Octofriend, agents.md, Warp, GitHub Copilot):
```bash
clavix update
# or
clavix init --force
```

This will regenerate instruction files with significantly improved agent compliance.

---

## [3.5.0] - 2025-01-24

### 🔄 Breaking Changes (With Automatic Migration)

#### Terminology Update: "Providers" → "Integrations"
Renamed core terminology from "providers" to "integrations" throughout Clavix for improved semantic clarity and industry alignment.

**What Changed**:
- **Configuration**: `config.integrations` replaces `config.providers` in `.clavix/config.json`
- **TypeScript Types**:
  - `ClavixConfig.integrations` replaces `ClavixConfig.providers`
  - `IntegrationFeatures` replaces `ProviderFeatures` (deprecated type alias maintained for backward compatibility)
- **CLI Commands**:
  - `clavix config` menu now shows "Manage integrations (add/remove)"
  - `clavix init` displays "integration" terminology throughout
  - `clavix update` uses "integrations" in all output messages
- **Documentation**:
  - Renamed `docs/providers.md` → `docs/integrations.md`
  - Updated all references across README, guides, and templates
- **Utilities**: Renamed `provider-selector.ts` → `integration-selector.ts`

**Why**: The term "provider" implied Clavix receives a service FROM these tools, when actually Clavix integrates WITH them. "Integration" more accurately describes the relationship (Clavix ↔ AI Tools) and aligns with industry standards (VS Code integrations, Zapier integrations, etc.).

**Backward Compatibility**:
- ✅ **Automatic Migration**: Old configs with `"providers": []` are automatically migrated to `"integrations": []`
- ✅ **Zero User Action Required**: Migration happens transparently on first config load
- ✅ **Type Alias**: `ProviderFeatures` maintained as deprecated alias (removed in v4.0.0)
- ✅ **Config Fallback**: `config.providers` reads work during transition period

**Impact**:
- **For End Users**: Seamless upgrade with automatic migration - no manual changes needed
- **For TypeScript Users**: If importing `ProviderFeatures` type, update to `IntegrationFeatures` (deprecation warning added)

This follows the same proven migration pattern used in v1.4.0 (`agent` → `providers`).

## [3.4.0] - 2025-11-23

### 🐛 Bug Fixes

#### Provider Categorization in `clavix init`
Fixed multiple provider categorization issues in the interactive provider selection menu.

**What Changed**:
- **CLI Tools** - Properly categorized:
  - Moved Claude Code from IDE to CLI section
  - Moved CodeBuddy from IDE to CLI section
  - Moved Crush from IDE to CLI section
- **IDE Tools** - Properly categorized:
  - Moved Kilocode from CLI to IDE section
  - Moved Roocode from CLI to IDE section
- **Universal Adapters**:
  - Added missing WARP.md option (implementation existed but was not in selector)
  - Removed non-functional "Custom" option (had no adapter implementation)
- **Display Names**:
  - Cleaned up Qwen display name (removed Chinese symbols "通义灵码")
  - Improved clarity of Universal Adapter names

**Why**: The v3.3.0 refactor that extracted providers into a shared utility (`provider-selector.ts`) introduced categorization errors. This release corrects all misclassifications and ensures the provider list matches the actual tool types.

**Impact**: Users will now see providers correctly organized by type (CLI Tools, IDE & IDE Extensions, Universal Adapters) when running `clavix init` or `clavix config`.

This is a **minor version bump** due to the addition of WARP.md as a new selectable option.

## [3.2.1] - 2025-11-23

### 🐛 Bug Fix

#### LLXPRT Provider Categorization
Fixed incorrect categorization of LLXPRT provider in `clavix init` command.

**What Changed**:
- Moved LLXPRT from "IDE & IDE Extensions" section to "CLI Tools" section
- LLXPRT now appears alphabetically between Gemini CLI and OpenCode
- Documentation in `docs/integrations.md` was already correct (no changes needed)

**Why**: LLXPRT is a CLI tool, not an IDE extension. This fix ensures proper categorization in the interactive provider selection menu.

This is a **patch release** with no breaking changes or functional impact.

## [3.2.0] - 2025-11-23

### ✨ New Provider Support

#### LLXPRT Integration
Added support for **LLXPRT** - a new AI coding CLI tool with TOML-based custom commands.

**Features**:
- TOML format with `prompt = """..."""` wrapper
- Namespace support: commands accessible as `/clavix:fast`, `/clavix:deep`, etc.
- Commands generated in `.llxprt/commands/clavix/` directory
- Argument placeholder: `{{args}}`
- Subdirectory support enabled

**What Changed**:
- New `LlxprtAdapter` class following established Clavix patterns
- Added to provider selection in `clavix init` command
- Full test coverage with 6 new tests
- Documentation updated in `docs/integrations.md`

**Total Providers**: Now supports **16 built-in adapters** + 4 universal adapters (20 total integrations)

This is a **non-breaking minor version** - existing configurations remain unchanged.

## [3.1.0] - 2025-11-23

### ✨ Branding Evolution - Clavix Intelligence™

**Major Update**: Rebranded from "Universal Intelligence" and "Adaptive Prompt Intelligence™" to **"Clavix Intelligence™"** across all user-facing content. This establishes Clavix as a distinctive branded methodology rather than generic terminology.

#### What Changed
- **Marketing & Documentation**: All references to "Universal Intelligence" and "Adaptive Prompt Intelligence™" now use "Clavix Intelligence™"
- **Brand Identity**: Establishes Clavix as a recognizable methodology and strengthens brand presence
- **Documentation**: Renamed `docs/prompt-intelligence.md` → `docs/clavix-intelligence.md`

#### What Stayed The Same
- **Zero Breaking Changes**: All APIs, class names, and imports remain unchanged
- **Backward Compatibility**: 100% compatible with v3.0.x - no migration required
- **Functionality**: Same powerful intent detection, quality assessment, and optimization patterns

This is a **non-breaking minor version** focused on brand consistency and market positioning.

## [3.0.1] - 2025-11-23

### ✨ Enhancements

#### Enhanced Intent Detector (95%+ Accuracy)
- **Weighted Keyword System**: Strong (20pts), Medium (10pts), Weak (5pts) scoring
- **Phrase-Based Detection**: Multi-word phrases get higher priority than single keywords
- **Negation Detection**: Automatically reduces keyword score by 50% when negation words detected
- **Intent Priority Rules**: Explicit ordering (Debugging > Documentation > Planning > Refinement > Code Generation)
- **Context Analysis**: Code snippets, question marks, and technical terms influence final scoring
- **Confidence Thresholds**: Identifies mixed-intent prompts and low-confidence scenarios

#### New Optimization Patterns (6 Total)
Added 3 production-ready patterns to complete the pattern library:

1. **Structure Organizer** (Priority: 8/10 - HIGH)
   - Reorders information into logical sections
   - Flow: Objective → Requirements → Technical Constraints → Expected Output → Success Criteria
   - Detects disorganized prompts and reorganizes automatically

2. **Completeness Validator** (Priority: 6/10 - MEDIUM)
   - Ensures all required elements are present
   - Validates: objective, tech stack, success criteria, constraints, output format
   - Adds "Missing Information" prompts with completeness score

3. **Actionability Enhancer** (Priority: 7/10 - HIGH)
   - Converts vague language to concrete requirements
   - Replaces abstract terms with specific alternatives
   - Adds measurable criteria where missing

#### Test Coverage Improvements
- Fixed all 15 existing Intent Detector tests
- Added 17 comprehensive new tests (total: 32 tests, 100% passing)
- Updated UniversalOptimizer tests for new pattern interfaces
- Updated template coverage tests for v3.0 format
- **All 1718 tests passing** ✅

### 🔧 Technical Improvements
- Pattern library now has 6 fully functional optimization patterns
- Enhanced `IntentAnalysis` with confidence scores and mode suggestions
- Improved `PatternContext` and `PatternResult` interfaces
- Better separation of concerns between intent detection and pattern application

### 📚 Documentation
- Updated clavix-website to remove all CLEAR Framework references
- Replaced with "Clavix Intelligence™" branding
- Updated comparison tables, feature descriptions, and terminal demos
- Improved meta descriptions for SEO

## [3.0.0] - 2025-11-23

### ⚠️ BREAKING CHANGES - Clavix Intelligence

**Major Rebrand**: Clavix has evolved from a CLEAR Framework-based tool to Clavix Intelligence™—a platform with automatic intent detection and adaptive optimization patterns.

#### What Changed

**From CLEAR Framework → To Clavix Intelligence™**
- **Before**: Users needed to understand CLEAR Framework (Concise, Logical, Explicit, Adaptive, Reflective) components
- **After**: Automatic intent detection and pattern selection—no framework knowledge required
- **Impact**: Zero learning curve for new users, seamless experience for existing users

**Breaking Changes:**
1. **Terminology Changes**:
   - "CLEAR Framework" → "Quality Assessment" (5 dimensions)
   - "CLEAR scores" → "Quality metrics"
   - "CLEAR components (C/L/E/A/R)" → "Quality dimensions (Clarity, Efficiency, Structure, Completeness, Actionability)"
   - "CLEAR-optimized" → "Optimized prompt"

2. **File Naming**:
   - `.clavix/outputs/prompts/fast/clear-optimized-prompt.md` → `optimized-prompt.md`
   - PRD footers: "Generated by CLEAR Framework" → "Generated with Clavix Planning Mode"

3. **Documentation Structure**:
   - Removed `docs/clear-framework.md` (replaced with `docs/prompt-intelligence.md`)
   - Updated all references in README, templates, and provider docs

4. **API Changes** (Internal):
   - `PromptOptimizer` class → `UniversalOptimizer` class
   - New core modules: `IntentDetector`, `QualityAssessor`, `PatternLibrary`
   - Methods renamed to reflect universal optimization approach

### ✨ New Features

#### Clavix Intelligence™

**Core Intelligence Layer** (10 new files):
- **Intent Detection** - Automatically recognizes 6 intent types:
  - Code generation
  - Planning/architecture
  - Refinement/optimization
  - Debugging/troubleshooting
  - Documentation
  - PRD generation
- **Quality Assessment** - 5-dimension evaluation system:
  - **Clarity** - Is the objective clear and unambiguous?
  - **Efficiency** - Is the prompt concise without losing information?
  - **Structure** - Is information organized logically?
  - **Completeness** - Are all necessary details provided?
  - **Actionability** - Can AI take immediate action?
- **Pattern Library** - Modular optimization patterns:
  - Conciseness filter (removes verbosity)
  - Objective clarifier (adds specificity)
  - Technical context enricher (adds missing details)
  - Priority-based pattern selection
  - Extensible architecture for future patterns

**Universal Optimizer**:
- Orchestrates intent detection → quality assessment → pattern application
- Automatic mode selection based on quality metrics
- Smart triage (recommends deep analysis when needed)
- Preserves all existing functionality while improving UX

### 🔧 Command Updates

**All 4 core commands refactored**:
- `clavix fast` - Now uses UniversalOptimizer with intent detection
- `clavix deep` - Enhanced with pattern library and TODO markers for future features
- `clavix prd` - Rebranded to "Clavix Planning Mode"
- `clavix summarize` - Always optimizes, cleaner file naming (removed "clear-" prefix)

### 📝 Template Updates

**All 8 canonical templates updated**:
- `fast.md` - Removed CLEAR Framework references, added 5 quality dimensions
- `deep.md` - Complete rebrand to "Comprehensive Prompt Intelligence"
- `prd.md` - Rebranded to "Clavix Planning Mode"
- `start.md` - Updated to "Clavix Intelligence"
- `summarize.md` - File naming updated, quality dimensions added
- `plan.md` - Task quality labeling (Clarity/Structure/Actionability)
- `implement.md` - Quality principles reference
- `execute.md` - No changes needed

**All 4 provider adapter templates updated**:
- `agents.md` - Universal managed block with quality-based descriptions
- `octo.md` - Extensive workflow updates (15+ sections modified)
- `copilot-instructions.md` - Complete rewrite with new quality dimensions
- `warp.md` - Command descriptions updated

**All 3 PRD templates updated**:
- `full-prd-template.hbs` - Footer: "Generated with Clavix Planning Mode"
- `quick-prd-template.hbs` - Footer: "Generated with Clavix Planning Mode"
- `prd-questions.md` - "Built with Clavix Planning Mode"

### 📚 Documentation Updates

**README.md** - Complete rewrite:
- New tagline: "Clavix Intelligence™ for AI coding"
- "Why CLEAR?" → "How It Works" (explains Clavix Intelligence™)
- Updated examples to use quality dimensions
- Removed academic references to CLEAR Framework
- Added intent detection explanation

**package.json**:
- Version: `2.9.0` → `3.0.0`
- Updated description to emphasize Clavix Intelligence
- Added keywords: `prompt-intelligence`, `intent-detection`, `quality-assessment`

**CHANGELOG.md** - This comprehensive entry

### 🎯 Migration Guide

**For Existing Users:**

No code changes required! Clavix v3.0 maintains full backward compatibility while improving the user experience.

**What You'll Notice:**
1. Commands work exactly the same way
2. Output format is cleaner (no "CLEAR" branding)
3. Quality dimensions have clearer names
4. File naming is simpler (`optimized-prompt.md` vs `clear-optimized-prompt.md`)

**Migrating Saved Prompts:**
- Old prompts in `.clavix/outputs/prompts/` continue to work
- New prompts use updated file naming convention
- No migration script needed

**Updating Documentation:**
- Run `clavix update` to refresh all templates and provider docs
- Old slash commands continue to work (updated content)

### 🔬 Technical Details

**New Core Modules** (src/core/intelligence/):
- `types.ts` - Core type definitions (IntentType, QualityMetrics, OptimizationPattern)
- `intent-detector.ts` - Intent classification with keyword matching
- `quality-assessor.ts` - 5-dimension quality scoring (0-100% per dimension)
- `pattern-library.ts` - Pattern registration and selection
- `universal-optimizer.ts` - Main orchestrator
- `index.ts` - Module exports
- `patterns/base-pattern.ts` - Abstract pattern base class
- `patterns/conciseness-filter.ts` - Efficiency optimization
- `patterns/objective-clarifier.ts` - Clarity optimization
- `patterns/technical-context-enricher.ts` - Completeness optimization

**Refactored Commands** (src/cli/commands/):
- `fast.ts` - Complete UniversalOptimizer integration
- `deep.ts` - Pattern-based deep mode with extensibility markers
- `prd.ts` - Rebranded command with quality validation
- `summarize.ts` - Simplified file naming, always optimizes

### 📊 Impact

**Lines Changed**: ~5,000+ lines across 30+ files
**Files Created**: 10 new core intelligence files
**Files Updated**: 20+ templates, commands, and docs
**Breaking Changes**: Terminology and naming only (no functionality changes)

### 🚀 Future Enhancements

The new modular architecture enables:
- Additional intent types (e.g., "testing", "security review")
- More optimization patterns (e.g., "accessibility-enhancer", "performance-optimizer")
- Plugin system for custom patterns
- Multi-language support
- Advanced analytics and insights

### ✅ Validation

- All existing tests passing (updated assertions)
- Zero regressions in functionality
- Improved UX validated across all 22 providers
- Documentation coverage: 100%

---

**Made for vibecoders, by vibecoders** 🚀

## [2.9.0] - 2025-11-18

### Changed

#### ESLint 9+ Migration with Flat Config

**Major Upgrade**: Migrated from ESLint 8 (legacy eslintrc) to ESLint 9 with modern flat config format.

**Dependencies Updated**:
- `eslint`: ^8.57.0 → ^9.17.0
- Added `@eslint/js@^9.17.0` (required for flat config presets)
- Added `typescript-eslint@^8.46.4` (unified TypeScript-ESLint package)
- Kept `@typescript-eslint/eslint-plugin@^8.46.4` and `@typescript-eslint/parser@^8.46.4` (already ESLint 9 compatible)

**Configuration Changes**:
- Migrated from `.eslintrc.json` to `eslint.config.js` (flat config format)
- Implemented TypeScript's `projectService` for better performance (faster than legacy `project` option)
- Uses new `tseslint.config()` wrapper for type-safe configuration
- Configured separate rules for `src/` files with type-aware linting
- Excluded test files from linting (matching tsconfig.json exclusions)
- Updated npm scripts: removed `--ext .ts` flags (now defined in config)

**Preserved Custom Rules**:
- `@typescript-eslint/no-explicit-any`: warn
- `@typescript-eslint/explicit-module-boundary-types`: off
- `@typescript-eslint/no-unused-vars`: error with `argsIgnorePattern: '^_'` and `caughtErrors: 'all'`
- `no-console`: off

**Benefits**:
- ✅ Better performance with `projectService` configuration
- ✅ Modern ESLint 9 recommended ruleset with new safety checks
- ✅ Cleaner, more maintainable flat config format
- ✅ Future-proof for upcoming ESLint and TypeScript-ESLint features
- ✅ All 1,592 tests pass
- ✅ No breaking changes to source code
- ✅ CI/CD compatible (no workflow changes needed)

**Migration Details**:
- Deleted legacy `.eslintrc.json`
- Created new `eslint.config.js` with ESLint 9 flat config
- Test files excluded from linting (already excluded from tsconfig.json)
- Proper Node.js globals configuration
- Ignores: `dist/`, `node_modules/`, `coverage/`, `bin/`, `tests/`

## [2.8.3] - 2025-11-17

### Fixed

#### Task ID Persistence in tasks.md

**Problem**: Task IDs were never written to `tasks.md`, only regenerated from phase names on read. This caused mismatches between config expectations and actual task IDs, breaking `clavix task-complete`.

**Symptom**:
```bash
# tasks.md showed (user added manually):
Task ID: phase-1-setup-1

# CLI expected (regenerated from "Phase 1: Project Setup & Configuration"):
Task ID: phase-1-project-setup-configur-1  # Truncated at 30 chars

# Result:
✗ Task ID "phase-1-setup-1" not found
```

**Root Cause**:
- `writeTasksFile()` never wrote Task ID lines to tasks.md
- `parseTasksFile()` regenerated IDs from phase names instead of reading from file
- `sanitizeId()` truncated phase names to 30 chars ("configuration" → "configur")
- Manual Task IDs added by users/agents were ignored

**Fix**:
1. **Write Task IDs**: `writeTasksFile()` now writes `  Task ID: {id}` after each task
2. **Read Task IDs**: `parseTasksFile()` reads IDs from file with fallback to regeneration
3. **Backward Compatible**: Old tasks.md files without IDs still work (IDs regenerated on read)
4. **Manual Edits Respected**: Task IDs from file take priority over regeneration

**Impact**:
- ✅ `clavix task-complete phase-1-setup-1` works with readable IDs
- ✅ Task IDs persist across write-read cycles
- ✅ No more truncated/obfuscated IDs
- ✅ Existing projects continue working (backward compatible)

**Test Coverage**:
- Write Task IDs to tasks.md
- Read Task IDs from tasks.md
- Preserve IDs through write-read cycle
- Fallback to regeneration for old format
- Use file IDs over regenerated IDs
- Mark task complete with readable ID

**Example tasks.md Format**:
```markdown
## Phase 1: Setup

- [ ] Initialize React project (ref: Technical Requirements)
  Task ID: phase-1-setup-1
- [ ] Configure Tailwind CSS (ref: Technical Requirements)
  Task ID: phase-1-setup-2
```

### Changed

#### Enhanced INSTRUCTIONS.md in .clavix Directory

**Update**: Comprehensive rewrite of `.clavix/INSTRUCTIONS.md` created by `clavix init`.

**Improvements**:
- **Visual Directory Structure**: ASCII tree diagram showing all folders and key files
- **Complete CLI Reference**: All 17 commands organized by category (Prompt/PRD/Implementation/Management/Config)
- **Slash Commands Section**: Clear mapping for Claude Code, Cursor, Windsurf users
- **Workflow Guides**: Step-by-step examples for common patterns
  - Prompt Lifecycle (v2.7): fast → execute → iterate
  - PRD to Implementation: prd → plan → implement → task-complete
  - Archive Management: archive → restore workflows
- **Per-Project Outputs**: Explanation of `.clavix/outputs/<project-name>/` structure
- **Prompt Storage**: Documentation of `prompts/fast/` and `prompts/deep/` organization
- **Flag Documentation**: Comprehensive coverage of command options and strategies

**Before** (2.8.2): Basic command list with minimal context
**After** (2.8.3): Production-ready reference guide for both CLI and agent users

**Example Addition** - Prompt Lifecycle Workflow:
```bash
# 1. Improve prompt
clavix fast "add user auth"

# 2. Review and execute
clavix execute --latest

# 3. Iterate if needed
clavix fast "add password reset to auth"
clavix execute --latest

# 4. Cleanup when done
clavix prompts clear --executed
```

### Chore

- Downgrade jest from 30.2.0 to 29.7.0 (compatibility with ts-jest)
- Fix ESLint unused variables warnings in task-manager.ts

## [2.8.2] - 2025-11-17

### Added

#### Complete Documentation Coverage for v2.7-v2.8 Features

**Background**: Comprehensive documentation audit revealed critical gaps where recent features (v2.7.0 prompt lifecycle, v2.8.0 task generation, v2.8.1 task-complete) lacked user-facing documentation despite having excellent agent template coverage.

**Audit Results**:
- **Before**: 75% documentation coverage (15/17 commands documented)
- **After**: 100% documentation coverage (17/17 commands documented)
- **Gap**: 3 implemented commands with zero or partial user documentation

**New Command Documentation** (docs/commands/):

1. **task-complete.md** - Mark tasks as completed with validation and git auto-commit
   - Command syntax, flags (--no-git, --force, --config)
   - Integration with implement workflow
   - Git auto-commit strategy behavior (none/per-task/per-5-tasks/per-phase)
   - Auto-discovery of config files
   - Next task display after completion
   - Troubleshooting stale in-memory bug (fixed in v2.8.1)
   - Recovery options for common errors

2. **execute.md** - Execute saved prompts from fast/deep optimization
   - Interactive selection mode with status indicators (○ NEW / ✓ EXECUTED)
   - Auto-selection flags (--latest, --fast, --deep, --id)
   - Execution status tracking and prompt reusability
   - Storage cleanup suggestions (≥5 executed prompts)
   - CLI auto-save vs slash command manual save explanation (v2.8.1)
   - Troubleshooting prompt discovery and file errors

3. **prompts.md** - Manage saved prompts lifecycle (list/clear subcommands)
   - **List subcommand**: View prompts with age warnings and storage statistics
     - Status indicators: ○ NEW, ✓ EXECUTED
     - Age color coding: Gray (0-7d), Yellow (8-30d), Red (>30d)
     - Age warning labels: [OLD], [STALE]
     - Storage hygiene recommendations (stale/executed/total limits)
   - **Clear subcommand**: Safe cleanup with multiple filtering options
     - Filter flags: --executed (safe), --stale (>30d), --fast, --deep, --all
     - Safety mechanisms: unexecuted prompt warnings, confirmation prompts
     - Interactive mode with 6 cleanup options
     - Remaining storage statistics after deletion

**Enhanced Documentation** (docs/):

4. **docs/commands/implement.md** - Git Auto-Commit Strategies section (150+ lines)
   - All 4 strategies documented in detail:
     - `none` (default since v2.8.1): Manual git workflow
     - `per-task`: Commit after every task
     - `per-5-tasks`: Commit every 5 tasks
     - `per-phase`: Commit when phase completes
   - When to use each strategy (use cases, project types, team workflows)
   - Commit message formats with examples
   - Strategy override mechanisms (--no-git flag, mid-implementation changes)
   - Git repository detection and validation logic
   - Breaking change note (v2.8.1 default changed from per-task to none)

5. **docs/commands/plan.md** - Task Generation Algorithm section (280+ lines)
   - Hierarchical parsing strategy (top-level features vs nested details)
   - Before/after examples (401 tasks → 25 tasks real-world case study)
   - Behavior section grouping (numbered feature with Behavior = 1 task)
   - Warning thresholds:
     - Feature count warning (>50 top-level features)
     - Task count warning (>50 tasks per phase)
   - PRD structuring best practices (Do's and Don'ts)
   - Algorithm flowchart (PRD → Extract → Filter → Group → Check → Generate)
   - Troubleshooting (too many/too few tasks, missing details)

6. **docs/guides/workflows.md** - Prompt Lifecycle Management section
   - Complete v2.7+ workflow: optimize → review → execute → cleanup
   - Alternative workflow paths (fast/deep/PRD)
   - Review saved prompts (status, age warnings, statistics)
   - Execute when ready (quick/filtered/interactive/specific)
   - Clean up prompts (safe/stale/source/interactive)
   - Best practice: `clavix prompts clear --executed` after execution
   - Git auto-commit strategies in "Execute tasks" section

7. **README.md** - Prompt Saving Modes clarification
   - CLI Usage (Auto-Save): Direct file system access, automatic saving
   - Slash Command Usage (Agent Manual Save): Requires Write tool execution
   - Why the difference explained (Node.js vs agent tool architecture)
   - Added task-complete to quickstart workflow (#4)

**Agent Template Coverage**:

8. **src/templates/slash-commands/_canonical/task-complete.md** - New canonical template
   - Prerequisites (implement config, tasks.md)
   - Task ID verification workflow
   - Git auto-commit behavior by strategy
   - Command output handling (success/already-complete/all-done)
   - Error recovery for task not found, config missing, file errors
   - Best practices (never manual edit, verify completion, use --no-git for experiments)

9. **Provider Template Updates** - All 4 provider templates updated:
   - `agents.md` - Added task-complete to command reference table
   - `octo.md` - Added to CLI reference cheat sheet
   - `warp.md` - Added to common commands list
   - `copilot-instructions.md` - Added to Strategic Planning section

**Documentation Index Updates**:
- `docs/commands/README.md` - Added 3 new command entries (task-complete, execute, prompts)

**Impact**:
- Users can now discover and use task-complete command (previously hidden despite critical workflow role)
- Prompt lifecycle workflow fully documented end-to-end
- Git auto-commit strategies explained for informed decision-making
- Task generation algorithm documented for PRD optimization
- All 17 CLI commands have comprehensive user-facing documentation
- Agent templates maintain command parity across all 4 providers

**Files Created**: 4 new documentation files
**Files Updated**: 9 existing documentation files
**Lines Added**: ~1,500 lines of comprehensive documentation

## [2.8.1] - 2025-11-17

### Fixed

#### Prompt Saving in Agent Execution Context

**Problem**: Templates for `/clavix:fast` and `/clavix:deep` slash commands did not instruct AI agents to save prompts when executed directly. Only the CLI commands (`clavix fast` / `clavix deep`) automatically saved prompts, breaking the prompt lifecycle workflow for agent-driven workflows.

**Root Cause**: Templates violated the AI-Agent-First Design Philosophy by assuming automatic saving without providing explicit agent instructions, creating a gap between CLI behavior and slash command behavior.

**Solution**: Implemented Dual Mode (Hybrid) approach with explicit saving instructions:

**Template Updates:**

1. **Canonical Templates** (`fast.md`, `deep.md`):
   - Added comprehensive "Saving the Prompt (REQUIRED)" section with conditional logic
   - **Step 1**: Directory creation (`mkdir -p .clavix/outputs/prompts/{fast|deep}`)
   - **Step 2**: Prompt ID generation (`{fast|deep}-YYYYMMDD-HHMMSS-<random>`)
   - **Step 3**: File creation with frontmatter (Write tool instructions)
   - **Step 4**: Index update (`.index.json` management)
   - **Step 5**: Verification confirmation
   - Added troubleshooting section for saving errors

2. **Provider Templates** (agents.md, octo.md, warp.md, copilot-instructions.md):
   - Updated command reference tables to clarify: "CLI auto-saves; slash commands require manual saving per template instructions"
   - Updated workflow documentation to reflect dual saving modes

**File Format Specification:**
```markdown
---
id: <prompt-id>
source: {fast|deep}
timestamp: <ISO-8601>
executed: false
originalPrompt: <original text>
---

# Improved Prompt
<CLEAR-optimized content>

## CLEAR Scores
- C, L, E (fast) or C, L, E, A, R (deep)

## Original Prompt
<original text>
```

**Testing:**
- Added comprehensive template coverage tests (v2.8.1) validating:
  - Presence of saving instructions in canonical templates
  - Step-by-step format verification
  - File format specification completeness
  - Troubleshooting section coverage
  - Provider template clarification language

**Files Modified:**
- `src/templates/slash-commands/_canonical/fast.md` - Added 100+ lines of saving instructions
- `src/templates/slash-commands/_canonical/deep.md` - Added 100+ lines of saving instructions (with A/R components)
- `src/templates/agents/agents.md` - Updated command table descriptions
- `src/templates/agents/octo.md` - Updated CLI reference
- `src/templates/agents/warp.md` - Updated common commands list
- `src/templates/agents/copilot-instructions.md` - Updated prompt improvement and lifecycle workflow sections
- `tests/integration/template-coverage.test.ts` - Added 10 new test cases

**Impact:**
- ✅ Prompts now save consistently in both CLI and agent execution contexts
- ✅ Agents receive explicit, actionable instructions (not passive documentation)
- ✅ Prompt lifecycle workflow (optimize → review → execute → cleanup) now works end-to-end
- ✅ Compliance with AI-Agent-First Design Philosophy and Template Quality Checklist

**Example Agent Workflow:**
```bash
# User runs /clavix:fast "create login page"
# Agent executes template → performs CLEAR analysis → follows saving steps:

1. mkdir -p .clavix/outputs/prompts/fast
2. Generate ID: fast-20250117-143022-a3f2
3. Write file with frontmatter and content
4. Update .index.json with metadata
5. Verify and confirm: ✓ Prompt saved: fast-20250117-143022-a3f2.md
6. Continue to /clavix:execute --latest
```

## [2.8.0] - 2025-11-17

### ⚠️ BREAKING CHANGES - ESM Migration

**Node.js 16+ Required**: Clavix is now a pure ESM package using TypeScript NodeNext module system.

#### Why This Migration?

**Future-Proofing & Modern Standards:**
- ESM is the JavaScript standard (CommonJS is legacy)
- Required for modern dependencies (chalk v5+, ora v8+, inquirer v10+)
- Better tree-shaking and bundle optimization
- Native TypeScript support with proper module resolution

**Immediate Benefits:**
- ✅ Unlocked chalk v5.4.1 (from v4.1.2) - Better color support and performance
- ✅ Modern dependency ecosystem access
- ✅ Faster startup times with native ES modules
- ✅ Improved type safety with NodeNext resolution

#### Migration Requirements

**For End Users:**
```bash
# Minimum Node.js version
node --version  # Must be v16.0.0 or higher

# Upgrade Clavix
npm install -g clavix@2.8.0

# No code changes needed - CLI usage unchanged
clavix init
clavix prd
clavix plan
```

**For Developers/Contributors:**
```bash
# Install dependencies
npm install

# Build (now uses ES2020 modules)
npm run build

# Run tests (with ESM experimental flag)
npm test  # Uses --experimental-vm-modules for Jest
```

#### What Changed Internally

**Package Configuration (`package.json`):**
- Added `"type": "module"` for pure ESM
- Updated exports to ESM syntax
- All dependencies now use ESM-compatible versions
- Chalk upgraded: v4.1.2 → v5.4.1

**TypeScript Configuration (`tsconfig.json`):**
- `module`: `"CommonJS"` → `"ES2020"`
- `moduleResolution`: `"node"` → `"NodeNext"`
- `target`: `"ES2020"` → `"ES2021"`
- Added `"lib": ["ES2021"]` for modern JS features

**Source Code (139 files modified):**
- Import syntax: `require()` → `import` statements
- Export syntax: `module.exports` → `export` declarations
- File extensions: Added `.js` to all relative imports
- `__dirname` replacement: Custom utility for ESM compatibility
- Dynamic imports: `await import()` for runtime loading

**Build & Testing:**
- Jest configuration: Added `--experimental-vm-modules` flag
- Jest config: Converted `jest.config.js` → `jest.config.mjs`
- All test imports: Updated to use `import` from `@jest/globals`
- Template loading: Updated for ESM module resolution
- Binary shebang: Maintained `#!/usr/bin/env node` compatibility

#### Files Modified Summary

**Core Infrastructure (10 files):**
- `package.json` - ESM type, exports, dependencies
- `tsconfig.json` - NodeNext module system
- `jest.config.mjs` - ESM-compatible Jest config
- `bin/clavix.js` - ESM entry point
- `src/index.ts` - ESM exports
- Build scripts and utilities

**Source Code (129 files):**
- All CLI commands (15 files in `src/cli/commands/`)
- All core modules (15 files in `src/core/`)
- All adapters (16 files in `src/core/adapters/`)
- All utilities (5 files in `src/utils/`)
- All tests (78 files in `tests/`)

#### Validation & Testing

✅ **All 1581 tests passing** with ESM configuration
✅ **Zero regressions** - All functionality preserved
✅ **Build succeeds** - TypeScript compilation error-free
✅ **Runtime verified** - All CLI commands working
✅ **Coverage maintained** - 90%+ test coverage preserved

#### Rollback Plan (If Needed)

If you encounter issues with v2.8.0:

```bash
# Downgrade to v2.8.1 (pre-ESM)
npm install -g clavix@2.8.1

# Or use npx for isolated execution
npx clavix@2.8.1 init
```

**Known compatibility:**
- Works on: Node.js 16.x, 18.x, 20.x, 21.x, 22.x
- Does NOT work on: Node.js 14.x or earlier (ESM support incomplete)

---

### 🎉 NEW FEATURE - Intelligent Task Generator

#### Problem Solved

**Before v2.8.0:** The `clavix plan` command generated excessive, unusable task breakdowns:
- 401 tasks in 80 phases for ESM migration PRD (should be ~30 tasks)
- Every nested bullet treated as separate feature
- Fixed 5-task boilerplate for all features (implement, test, integrate, document, validate)
- No hierarchical understanding of PRD structure

**After v2.8.0:** Smart, context-aware task generation:
- 15-30 tasks in 5-8 logical phases for same PRD
- Only top-level features extracted (nested bullets = implementation details)
- Context-aware templates (1-2 tasks per feature, not fixed 5)
- Intelligent phase grouping by category

#### What Changed

**1. Hierarchical PRD Parsing** (`src/core/task-manager.ts:extractListItems()`)
- Line-by-line parsing instead of flat regex matching
- Only extracts bullets with ZERO indentation (top-level features)
- Skips nested bullets (constraints, requirements, sub-details)
- Filters out code examples and file paths
- Detects implementation details ("must", "should", "required")

**Example:**
```markdown
Before: Treated as 3 separate tasks ❌
- User authentication
  - Password must be 8+ characters
  - Email validation required

After: 1 feature with 2 implementation details ✅
- User authentication (→ 2 tasks: implement + test)
```

**2. Context-Aware Task Templates** (`src/core/task-manager.ts:buildFeatureTaskDescriptions()`)

| Feature Type | Old | New | Example |
|--------------|-----|-----|---------|
| Configuration | 5 tasks | **1 task** | "Update tsconfig.json for ESM" |
| Documentation | 5 tasks | **1 task** | "Update CHANGELOG.md" |
| Testing | 5 tasks | **2 tasks** | Implement + Verify passes |
| Conversion | 5 tasks | **2 tasks** | Convert + Test works |
| Default | 5 tasks | **2 tasks** | Implement + Add tests |

**Result:** ~50% reduction in task count for same features

**3. Task Grouping by Category** (`src/core/task-manager.ts:groupFeaturesByCategory()`)

Instead of "1 bullet = 1 phase", features are intelligently grouped:
- **Configuration & Setup** - Config files, dependencies, environment
- **Core Implementation** - Main features and functionality
- **Testing & Validation** - Test suites, QA, verification
- **Documentation** - README, CHANGELOG, guides
- **Integration & Release** - Build, deploy, publish

**Result:** 5 logical phases instead of 80 arbitrary phases

**4. Granularity Controls** (`src/core/task-manager.ts:generatePhasesFromCoreFeatures()`)
- Warning if >50 top-level features detected in PRD
- Warning if >50 total tasks generated
- Automatic skipping of empty phases
- Suggestion to simplify over-detailed PRDs

#### Real-World Impact

**Test Case: Authentication Feature PRD**
- **Before:** 31 tasks in 3 phases (every constraint = separate task)
- **After:** 15 tasks in 2 phases (52% reduction)
- **Quality:** All essential work captured, no boilerplate bloat

**ESM Migration PRD (This Release):**
- **Old generator:** 401 tasks in 80 phases (unusable)
- **Manual planning:** 34 tasks in 8 phases (optimal)
- **New generator:** Expected 20-30 tasks in 5-8 phases (usable)

#### Code Changes

**Modified Files (1):**
- `src/core/task-manager.ts` - 260+ lines changed
  - Lines 263-413: Hierarchical parsing logic
  - Lines 220-323: Category grouping logic
  - Lines 415-461: Context-aware templates
  - New methods: `looksLikeCodeOrPath()`, `looksLikeImplementationDetail()`, `groupFeaturesByCategory()`

**Documentation:**
- `ESM_MIGRATION_NOTES.md` - Complete analysis and algorithm documentation

**Testing:**
- ✅ All 1581 tests passing
- ✅ New validation test with authentication PRD
- ✅ Zero regressions in existing workflows

#### User Experience

**Before v2.8.0:**
```bash
clavix plan
# Generated tasks.md with 401 tasks
# 80 phases to manage
# Unusable for actual implementation
```

**After v2.8.0:**
```bash
clavix plan
# Generated tasks.md with 25 tasks
# 5 logical phases
# Actually implementable workflow

# Smart warnings when PRD is too detailed:
⚠️  Warning: PRD contains 72 top-level features. Consider grouping related items.
⚠️  Warning: Generated 58 tasks. Consider merging related tasks or simplifying PRD.
```

#### Future Enhancements (Not in 2.8.0)

Potential improvements for future versions:
- `--granularity` CLI flag to control task detail level
- PRD linting to warn about over-detailed specifications
- Custom category definitions via `.clavixrc`

---

### 📚 Documentation

**Updated Files:**
- `ESM_MIGRATION_NOTES.md` - Complete ESM migration and task generator analysis
- `README.md` - Node.js 16+ requirement (coming in this commit)
- `CHANGELOG.md` - This comprehensive entry

---

### 🎯 Upgrade Checklist

**For End Users:**
- [ ] Verify Node.js version: `node --version` (must be ≥16.0.0)
- [ ] Upgrade Clavix: `npm install -g clavix@2.8.0`
- [ ] Test workflow: `clavix init` in a test project
- [ ] Verify slash commands work in your IDE

**For Contributors:**
- [ ] Pull latest: `git pull origin main`
- [ ] Clean install: `rm -rf node_modules package-lock.json && npm install`
- [ ] Build: `npm run build`
- [ ] Test: `npm test` (should show 1581 passing tests)
- [ ] Verify ESM imports work: Check any custom integrations

---

### 🔗 Related Issues

- ESM Migration enables chalk v5+ (better color support)
- Task generator fix makes `clavix plan` actually usable
- Zero breaking changes for CLI users (only internal module system)

---

### 📦 Package Details

**Version:** 2.8.0
**Release Date:** 2025-11-17
**Commit:** `dc02eea` (ESM migration) + `0658c3a` (task generator fix)
**Total Changes:** 139 files modified, 1581 tests passing

---

## [2.8.1] - 2025-11-17

### ⚠️ Breaking Changes

- **`clavix implement`**: Now defaults to `--commit-strategy=none` (manual git workflow) instead of showing interactive prompt
  - **Migration**: To enable auto-commits, explicitly specify: `clavix implement --commit-strategy=<type>`
  - **Options**: `per-task`, `per-5-tasks`, `per-phase`, `none`
  - **Rationale**: Enables AI agents to execute implementation workflows without blocking on interactive prompts

### ✨ New Features - Agent-Friendly Execution

Transform Clavix into a fully non-blocking tool for AI agent automation.

**Agent-First Commands:**
- **`clavix implement --commit-strategy=<type>`**: Explicit git strategy selection (no interactive prompt)
  - Defaults to `'none'` (manual git workflow) if flag not provided
  - Agents can optionally ask users for git preference when tasks.md has >3 phases
  - Maintains all existing git automation capabilities

- **`clavix archive --yes` / `-y`**: Skip all confirmation prompts
  - Archive projects without user interaction: `clavix archive my-project --yes`
  - Restore projects without confirmation: `clavix archive --restore project-1 --yes`

- **`clavix update --force`**: Skip legacy cleanup confirmation (fixed)
  - Previously `--force` didn't skip all prompts
  - Now fully non-interactive: `clavix update --force`

### 🤖 Agent Template Updates

Updated all agent integration templates with git strategy workflow guidance:
- `src/templates/slash-commands/_canonical/implement.md` - Added git strategy selection workflow
- `src/templates/agents/agents.md` - Added "Implementation with Git Strategy" section
- `src/templates/agents/octo.md` - Added git auto-commit strategy guidance
- `src/templates/agents/warp.md` - Updated command list with flags
- `src/templates/agents/copilot-instructions.md` - Updated strategic planning section

### 🔧 Bug Fixes & Improvements

- **`task-complete.ts`**: Fixed stale in-memory bug preventing task advancement
  - Root cause: `phases` object not refreshed after marking task complete in file
  - Fix: Re-read tasks.md after successful completion to sync in-memory state
  - Impact: `clavix task-complete` now correctly shows NEXT task instead of same task

- **`prompts/clear.ts`**: `--force` flag already correctly skips all prompts ✅
- **`archive.ts`**: Added comprehensive `--yes` flag support across all confirmation prompts

### 📚 Modified Files (12 total)

**CLI Commands (6)**:
- `src/cli/commands/implement.ts` - Removed git prompt, default to 'none'
- `src/cli/commands/task-complete.ts` - Fixed stale phases bug
- `src/cli/commands/archive.ts` - Added --yes flag
- `src/cli/commands/update.ts` - Fixed --force to skip legacy cleanup
- `src/cli/commands/prompts/clear.ts` - Verified --force works correctly

**Templates (5)**:
- `src/templates/slash-commands/_canonical/implement.md`
- `src/templates/agents/agents.md`
- `src/templates/agents/octo.md`
- `src/templates/agents/warp.md`
- `src/templates/agents/copilot-instructions.md`

### 🎯 Why This Matters

**Before v2.8.1:**
```bash
# Agent executes /clavix:implement
clavix implement
# ❌ BLOCKS on interactive git strategy prompt
# Agent workflow cannot continue
```

**After v2.8.1:**
```bash
# Agent executes with default
clavix implement
# ✅ Proceeds immediately (default: manual git)

# Or agent asks user, then specifies:
clavix implement --commit-strategy=per-phase
# ✅ No prompts, full automation
```

**Example Agent Workflow (Now Possible):**
```bash
# Full automation without blocking
clavix prd                                  # Human-guided PRD
clavix plan                                 # Generate tasks
clavix implement --commit-strategy=none     # Agent implements (no prompts)
clavix task-complete phase-1-setup-1        # Mark complete
clavix archive my-project --yes             # Archive (no confirmation)
```

### 📖 Documentation

Agent integration patterns documented in all provider templates. After running `clavix init`, see:
- `.claude/commands/clavix/implement.md` - Implementation workflow with git strategy
- `docs/agents.md` - Universal agent instructions
- Provider-specific templates (Octofriend, Warp, Copilot)

## [2.7.1] - 2025-11-17

### 🔧 Updates

#### Branding & Documentation
- Updated package metadata to reflect ClavixDev organization
- Updated homepage to https://clavix.dev/
- Updated repository references to ClavixDev/Clavix
- Enhanced Star History chart with theme support (dark/light mode)

**Migration notes:**
- Package name remains `clavix` (unchanged)
- All GitHub references now point to ClavixDev organization
- Homepage now redirects to official website

## [2.7.0] - 2025-11-17

### 🎉 New Features - Prompt Lifecycle Management

#### Prompt Persistence & Execution System
Transform vague ideas into executable prompts with full lifecycle tracking.

**Core Features:**
- **Automatic Prompt Saving**: Optimized prompts from `/clavix:fast` and `/clavix:deep` auto-saved to `.clavix/outputs/prompts/`
  - Fast prompts: `.clavix/outputs/prompts/fast/`
  - Deep prompts: `.clavix/outputs/prompts/deep/`
  - Each saved prompt includes:
    - Original user input
    - CLEAR-optimized version
    - CLEAR Framework scores (C, L, E for fast; full C, L, E, A, R for deep)
    - Metadata (timestamp, source, execution status)
    - Unique ID for tracking (`{source}-YYYYMMDD-HHMMSS-{hash}`)

- **`clavix execute` - Prompt Execution Command**
  ```bash
  clavix execute               # Interactive selection
  clavix execute --latest      # Execute most recent prompt
  clavix execute --latest --fast   # Latest fast mode prompt
  clavix execute --latest --deep   # Latest deep mode prompt
  clavix execute --id <prompt-id>  # Execute specific prompt by ID
  ```
  - Interactive prompt selection with details
  - Auto-marks prompts as EXECUTED after display
  - Storage cleanup suggestions post-execution
  - Agent-friendly with `--latest` flag

- **`clavix prompts list` - Lifecycle Visibility**
  ```bash
  clavix prompts list          # View all saved prompts
  ```
  - Status indicators: ✓ EXECUTED, ○ NEW
  - Age warnings: >7 days = OLD (yellow), >30 days = STALE (red)
  - Grouped by source (fast/deep)
  - Storage statistics dashboard:
    - Total prompts count
    - Fast vs deep breakdown
    - Executed vs pending counts
    - Oldest prompt age
  - Hygiene recommendations (stale prompts, executed cleanup, storage limits)

- **`clavix prompts clear` - Storage Hygiene Management**
  ```bash
  clavix prompts clear                 # Interactive cleanup
  clavix prompts clear --executed      # Clear executed prompts (safe)
  clavix prompts clear --stale         # Clear prompts >30 days old
  clavix prompts clear --fast          # Clear fast mode prompts
  clavix prompts clear --deep          # Clear deep mode prompts
  clavix prompts clear --all           # Clear all (with confirmation)
  clavix prompts clear --all --force   # Skip confirmations
  ```
  - Safety confirmations before deletion
  - Preview before cleanup
  - Unexecuted prompt warnings
  - Filter composition (combine flags)

#### Slash Commands - AI Agent Integration

- **`/clavix:execute` - Execute Saved Prompts**
  - Full integration with agent workflows
  - Supports interactive selection or `--latest` flag
  - Template includes agent recovery instructions
  - Cross-references to prompt management commands

- **`/clavix:prompts` - Manage Prompt Lifecycle**
  - Complete workflow documentation for agents
  - List, cleanup, and hygiene workflows
  - Best practices for lifecycle management
  - Storage health monitoring

### 🏗️ Technical Implementation

**New Core Module:**
- `src/core/prompt-manager.ts` - PromptManager class
  - `savePrompt()` - Save with metadata and frontmatter
  - `loadPrompt()` - Retrieve by ID
  - `listPrompts()` - Filter by source/executed/age
  - `deletePrompts()` - Remove with safety filters
  - `markExecuted()` - Update execution status
  - `getPromptAge()` - Calculate days since creation
  - `getStorageStats()` - Real-time statistics
  - Index management via `.index.json`
  - Age-based stale detection (>30 days)

**New CLI Commands:**
- `src/cli/commands/execute.ts` - Execution command with flags
- `src/cli/commands/prompts/list.ts` - Listing with statistics
- `src/cli/commands/prompts/clear.ts` - Cleanup with safety

**New Canonical Templates:**
- `src/templates/slash-commands/_canonical/execute.md` - Agent execution workflow
- `src/templates/slash-commands/_canonical/prompts.md` - Agent lifecycle management

**Updated Canonical Templates:**
- `src/templates/slash-commands/_canonical/fast.md` - Auto-save notification + next steps
- `src/templates/slash-commands/_canonical/deep.md` - Auto-save notification + next steps
- `src/templates/slash-commands/_canonical/archive.md` - Prompts exclusion documentation

**Updated Commands:**
- `src/cli/commands/fast.ts` - Integrated PromptManager, auto-saves after optimization
- `src/cli/commands/deep.ts` - Integrated PromptManager, auto-saves after optimization

### 📊 Workflow Improvements

**Before v2.7.0:**
```bash
clavix fast "create a login page"
→ See optimized prompt in terminal
→ Copy-paste manually
→ Implement
→ Prompt lost after session
```

**After v2.7.0:**
```bash
clavix fast "create a login page"
→ Auto-saved to .clavix/outputs/prompts/fast/fast-20251117-143022-a3f8.md
→ ✅ Prompt saved!

clavix prompts list
→ Review all saved prompts with status

clavix execute --latest
→ Select and implement when ready

clavix prompts clear --executed
→ Clean up after completion
```

### 🎯 Benefits

- **No Lost Prompts**: All CLEAR-optimized prompts automatically persisted
- **Review Before Execution**: See all saved prompts, choose when to implement
- **Lifecycle Awareness**: Age tracking prevents stale prompt accumulation
- **Storage Hygiene**: Easy cleanup of executed/old prompts with safety checks
- **Agent-Friendly**: Full slash command integration for AI coding assistants
- **Robustness**: Safety confirmations, preview before deletion, unexecuted warnings
- **Statistics Dashboard**: Real-time visibility into prompt storage health

### 📚 Documentation Updates

**Updated Files:**
- `CLAUDE.md` - Complete v2.7 workflow documentation
- `fast.md` / `deep.md` templates - Next steps with execute/prompts commands
- `archive.md` template - Prompts separation from PRD lifecycle
- New `execute.md` and `prompts.md` templates for agent workflows

### ⚡ Migration Notes

**Existing Users:**
- ✅ No breaking changes
- ✅ Old workflow still works (manual copy-paste)
- ✅ New workflow is opt-in (use `/clavix:execute`)
- ✅ Prompts saved automatically after upgrade

**Best Practices:**
1. Review prompts weekly: `clavix prompts list`
2. Clear after execution: `clavix prompts clear --executed`
3. Remove stale prompts: `clavix prompts clear --stale`
4. Keep storage lean (<20 active prompts recommended)

**Complete Lifecycle:**
```
CREATE     → clavix fast/deep "requirement"
REVIEW     → clavix prompts list
EXECUTE    → clavix execute --latest
CLEANUP    → clavix prompts clear --executed
```

### 🔗 Related Commands

**Prompt Optimization:**
- `clavix fast` - Quick CLEAR improvements (C, L, E)
- `clavix deep` - Full CLEAR analysis (C, L, E, A, R)

**Prompt Management:**
- `clavix execute` - Execute saved prompts
- `clavix prompts list` - View all prompts
- `clavix prompts clear` - Cleanup prompts

**Slash Commands:**
- `/clavix:fast` - Quick optimization (auto-save)
- `/clavix:deep` - Deep optimization (auto-save)
- `/clavix:execute` - Execute saved prompts
- `/clavix:prompts` - Manage lifecycle

---

## [2.4.0] - 2025-11-16

### 🎯 Major Improvements

#### Template Architecture Overhaul
- **67% package size reduction**: 1.5MB → 830KB unpacked (159KB → 141.5KB compressed)
- **Single source of truth**: All templates now loaded from `_canonical/` directory
- **Zero duplication**: Eliminated 120 duplicate template files across 16 providers
- **TOML generation validated**: Gemini/Qwen .toml templates generated correctly from canonical .md source

#### Technical Changes
- Templates now stored in `src/templates/slash-commands/_canonical/`
- Runtime template generation per provider (TOML vs Markdown)
- Adapters handle format transformation via `formatCommand()`
- All 1462 tests passing with updated assertions

#### Architecture Benefits
- Single template maintenance point (8 files vs 128 files)
- Consistent content across all providers
- Easier updates and bug fixes

### 🔧 Breaking Changes

**None** - User-facing behavior is identical. Templates are generated at runtime instead of being pre-shipped.

### 📊 Impact

**Before:**
- 128 template files (16 providers × 8 templates)
- 1.2MB of duplicated content
- Manual synchronization needed across providers

**After:**
- 8 canonical templates
- 63KB total template size
- Automatic generation per provider

### ✅ Validation

- All 60 test suites passing
- 1462 tests passing
- TOML generation verified for Gemini/Qwen
- Markdown generation verified for all other providers
- Package size confirmed: 830.6KB unpacked

---

## [2.3.1] - 2025-11-16

### 🐛 Fixed
- **Consistent Provider Naming**: Updated AGENTS.md provider display name in `clavix init` to follow the same pattern as other universal adapters
  - Changed from: `'agents.md (Universal - for tools without slash commands)'`
  - Changed to: `'Agents (AGENTS.md - Universal - for tools without slash commands)'`
  - Now consistent with GitHub Copilot, Warp, and Octofriend naming patterns

---

## [2.3.0] - 2025-11-16

### ⚠️ Breaking Changes
- **GitHub Copilot Integration Migration**: Moved from non-working slash commands (`.github/agents/`) to official repository instructions (`.github/copilot-instructions.md`)
  - Old `.github/agents/clavix-*.agent.md` files no longer generated
  - Copilot now uses natural language instructions per [GitHub documentation](https://docs.github.com/en/copilot/how-tos/configure-custom-instructions/add-repository-instructions)
  - Copilot moved from "CLI Tools" to "Universal Adapters" section in `clavix init`

### ✨ Features
- **GitHub Copilot Instructions Generator**: New adapter for `.github/copilot-instructions.md`
  - Generates natural language Clavix workflow instructions for GitHub Copilot
  - Uses managed blocks (`<!-- CLAVIX:START -->` / `<!-- CLAVIX:END -->`) for easy updates via `clavix update`
  - Includes command reference, CLEAR Framework principles, and workflow patterns
  - Automatically creates `.github/` directory if needed

### 🗑️ Removed
- `CopilotAdapter` class (replaced with `CopilotInstructionsGenerator`)
- Copilot slash command templates (8 files: `archive.agent.md`, `deep.agent.md`, `fast.agent.md`, etc.)
- Agent type `'copilot'` (replaced with `'copilot-instructions'`)

### 🔧 Technical Changes
- **New Files**:
  - `src/templates/agents/copilot-instructions.md` - Copilot workflow instructions template
  - `src/core/adapters/copilot-instructions-generator.ts` - Generator class for `.github/copilot-instructions.md`
- **Modified Files**:
  - `src/cli/commands/init.ts` - Updated provider selection UI
  - `src/core/agent-manager.ts` - Removed CopilotAdapter registration
  - `src/types/agent.ts` - Updated AgentType union
- **Deleted Files**:
  - `src/core/adapters/copilot-adapter.ts`
  - `src/templates/slash-commands/copilot/*.agent.md` (8 files)

### 📚 Documentation
- Updated README.md: Copilot now listed under "Universal adapters"
- Updated docs/integrations.md: Changed Copilot entry to GitHub Copilot with `.github/copilot-instructions.md` path
- CHANGELOG.md: This entry

### 🎯 Migration Guide
**For existing Copilot users:**
1. Run `clavix init` and select "GitHub Copilot (.github/copilot-instructions.md)"
2. Old `.github/agents/clavix-*.agent.md` files can be safely deleted
3. GitHub Copilot will now read instructions from `.github/copilot-instructions.md`
4. Use `clavix update` to refresh instructions in future versions

**Why this change?**
- GitHub Copilot doesn't support custom slash commands via `.github/agents/`
- Official documentation specifies `.github/copilot-instructions.md` for repository-wide instructions
- Natural language instructions provide better integration with Copilot's AI

---

## [1.9.0] - 2025-11-15

### ⚠️ Breaking Changes / Migrations
- Standardized flat-provider command filenames to `clavix-<command>` and relocated Cline workflows to `.clinerules/workflows/`; legacy filenames are auto-detected with an opt-out cleanup prompt during `clavix init` and `clavix update`.

### ✨ Enhancements
- Added adapter filename overrides and shared template loader so all providers respect the new naming scheme while keeping namespaced folders (e.g., `.claude/commands/clavix/`).
- Implemented legacy command cleanup utilities reused by init/update flows, preserving provider-specific formatting and supporting Gemini/Qwen namespace opt-outs.

### 🧪 Testing
- `NODE_OPTIONS="--localstorage-file=.jest-localstorage" npm test`

## [1.8.3] - 2025-11-15

### 🐛 Fixes
- Hardened Gemini CLI and Qwen Code CLI TOML parsing so only the inner prompt body is injected, preventing duplicated headers and keeping custom commands discoverable.

### 🧪 Testing
- `npm run lint`
- `npx tsc --noEmit`
- `NODE_OPTIONS="--localstorage-file=.jest-localstorage" npm test`
- `npm run build:prod`

## [1.8.2] - 2025-11-15

### ✨ Features
- Added Augment CLI and Copilot CLI providers with template support and detection during `clavix init`.
- Alphabetized IDE and CLI tool selections in the initialization wizard for easier navigation.

### 🐛 Fixes
- Fixed Gemini CLI and Qwen Code CLI template handling to avoid nested `prompt = """` blocks and ensured their commands remain discoverable.
- Restored the default namespaced layout (`.gemini/commands/clavix` and `.qwen/commands/clavix`) while offering an opt-out during initialization for flat command naming.

### 🧪 Testing
- `npm run lint`
- `npx tsc --noEmit`
- `NODE_OPTIONS="--localstorage-file=.jest-localstorage" npm test`

## [1.8.1] - 2025-11-15

### 🐛 Fixes
- Flattened Gemini CLI and Qwen Code CLI command directories to `.gemini/commands` and `.qwen/commands` so commands surface without namespacing.
- Updated templates, CLI prompts, and tests to align with the new locations.

### 🧪 Testing
- `NODE_OPTIONS="--localstorage-file=.jest-localstorage" npm test`
- `npm run build:prod`

## [1.8.0] - 2025-11-15

### 🎉 New Features
- **Added** adapters for CodeBuddy CLI, Gemini CLI, Qwen Code CLI, and Codex CLI
  - Project-level and global detection (Codex/CodeBuddy support `~` home directories)
  - Provider-specific formatting (`$1`, `{{args}}`, `$ARGUMENTS`) applied automatically during command generation
- **Enhanced** `clavix init` & `clavix update` to respect provider file extensions (Markdown/TOML)
- **Added** confirmation prompt when generating Codex commands (writes to `~/.codex/prompts`)

### 🛠️ Technical Implementation
- New adapters: `codebuddy-adapter.ts`, `gemini-adapter.ts`, `qwen-adapter.ts`, `codex-adapter.ts`
- Template packs: `slash-commands/codebuddy`, `slash-commands/gemini` (`.toml`), `slash-commands/qwen` (`.toml`), `slash-commands/codex`
- Updated `AgentManager`, `init.ts`, and `update.ts` for dynamic extensions and provider registration
- Extended `extractDescription` to parse both YAML (`description:`) and TOML (`description = ""`) metadata

### 🧪 Testing
- Added adapter test suites covering detection, formatting, and command generation for each new provider
- Updated CLI init tests to assert availability of new providers

### 📚 Documentation
- README: expanded CLI tools table, added placeholder reference, updated init walkthrough
- CHANGELOG: this entry

---

## [1.6.0] - 2025-11-14

### 🎉 New Features

#### Crush CLI Support
- **Added**: Full Crush CLI adapter with slash command support
  - **Reference**: [Crush CLI COMMANDS.md](https://github.com/charmbracelet/crush/blob/main/COMMANDS.md)
  - **Directory**: `.crush/commands/clavix/` (subdirectory support)
  - **Placeholder**: `$PROMPT` (Crush-specific syntax automatically converted from `{{ARGS}}`)
  - **Command Access**: Via Ctrl+P or `/` in Crush terminal
  - **Command IDs**: `project:clavix:fast`, `project:clavix:deep`, `project:clavix:prd`, etc.

### 📊 Supported Providers
**Now 6 adapters**: claude-code, cursor, droid, opencode, amp, **crush**

### 🛠️ Technical Implementation

#### New Files
- `src/core/adapters/crush-adapter.ts` - Crush CLI adapter implementation
- `src/templates/slash-commands/crush/` - Command templates (8 files)
- `tests/adapters/crush-adapter.test.ts` - Comprehensive test suite (34 tests)

#### Updated Files
- `src/core/agent-manager.ts` - Registered CrushAdapter
- `src/cli/commands/init.ts` - Added Crush to provider selection
- `tests/integration/multi-provider-workflow.test.ts` - Added Crush to integration tests

#### Key Features
- **Subdirectory Support**: Commands in `.crush/commands/clavix/` (like Claude Code)
- **Automatic Placeholder Conversion**: `{{ARGS}}` → `$PROMPT` via `formatCommand()`
- **No Frontmatter**: Uses simple markdown format
- **Project Detection**: Checks for `.crush` directory

### 🧪 Testing

#### Test Coverage
- **Unit Tests**: 34 tests in `crush-adapter.test.ts`
  - Adapter properties validation
  - Project detection (`.crush` directory)
  - Command generation in subdirectory structure
  - `$PROMPT` placeholder replacement (single & multiple occurrences)
  - `formatCommand()` method testing
  - Edge cases (unicode, code blocks, long content, empty content)
  - Validation flow
  - BaseAdapter integration

- **Integration Tests**: Updated `multi-provider-workflow.test.ts`
  - Adapter registration (5→6 adapters)
  - Multi-provider detection
  - Adapter choices for UI

#### Test Results
- **Total**: 1,273 tests (1,239 existing + 34 new)
- **Status**: All passing
- **Coverage**: 100% for CrushAdapter
- **Regression**: Zero impact on existing 5 adapters

### 📚 Documentation
- **README.md**: Added Crush to supported tools table with $PROMPT note
- **CHANGELOG.md**: This entry

### 🎯 Usage

#### Initialization
```bash
clavix init
# Select "Crush CLI (.crush/commands/clavix/)"
```

#### Generated Structure
```
.crush/
  └── commands/
      └── clavix/
          ├── fast.md          ($PROMPT syntax)
          ├── deep.md          ($PROMPT syntax)
          ├── prd.md           ($PROMPT syntax)
          ├── start.md         ($PROMPT syntax)
          ├── summarize.md     ($PROMPT syntax)
          ├── plan.md          ($PROMPT syntax)
          ├── implement.md     ($PROMPT syntax)
          └── archive.md       ($PROMPT syntax)
```

#### In Crush Terminal
- Press `/` or `Ctrl+P` to access command palette
- Select commands: `project:clavix:fast`, `project:clavix:deep`, etc.
- Crush will prompt for `$PROMPT` input when command is invoked

### ⚡ Migration Notes
**Existing Users**: No action required. This is a purely additive feature.

**New Crush Users**:
1. Ensure Crush CLI is installed
2. Run `clavix init` in your project
3. Select "Crush CLI" from provider list
4. Access commands via Ctrl+P in Crush

---

## [1.5.2] - 2025-11-14

### 🐛 Critical Fixes

#### Multi-Provider Support in Update Command
- **Fixed**: `clavix update` now properly updates all installed providers instead of only claude-code
  - **Root Cause**: `update.ts` was reading non-existent `config.agent` field instead of `config.providers` array
  - **Impact**: Users with OpenCode, Cursor, Droid, or Amp were not getting command updates
  - **Solution**: Refactored to iterate over all providers in `config.providers`
  - **Technical Changes**: `src/cli/commands/update.ts:52-103`

#### IDE Slash Commands Updated to v1.5.0
- **Fixed**: All provider slash command templates synchronized with v1.5.0 (7→5 questions)
  - **Affected Files**:
    - `src/templates/slash-commands/claude-code/prd.md`
    - `src/templates/slash-commands/opencode/prd.md`
    - `src/templates/slash-commands/cursor/prd.md`
    - `src/templates/slash-commands/amp/prd.md`
    - `src/templates/slash-commands/droid/prd.md`
  - **Issue**: v1.5.0 updated CLI flow (7→5 questions) but forgot to update IDE slash commands
  - **Result**: `/clavix:prd` in all IDEs now uses streamlined 5-question flow

#### Hardcoded Template Paths Fixed
- **Fixed**: Dynamic template path resolution based on provider name
  - **Before**: `path.join(__dirname, 'templates/slash-commands/claude-code')` (hardcoded)
  - **After**: `path.join(__dirname, 'templates/slash-commands', adapter.name)` (dynamic)
  - **Impact**: Enables true multi-provider template management
  - **Files Updated**:
    - `src/cli/commands/update.ts:140`
    - `src/cli/commands/init.ts:274`

#### Added Special Handling for Universal Formats
- **Added**: Dedicated update methods for `agents-md` and `octo-md` providers
  - These are not standard adapters and require special handling
  - New methods: `updateAgentsMd()` and `updateOctoMd()`

### 📊 What This Fixes

**Before 1.5.2:**
```bash
clavix update --commands-only
# Only updated .claude/commands/clavix/
# OpenCode, Cursor, etc. were ignored
# Still showed 7 questions instead of 5
```

**After 1.5.2:**
```bash
clavix update --commands-only
# Updates ALL providers: claude-code, opencode, cursor, droid, amp
# All commands now use 5-question flow
# ✅ 32 files updated (4 providers × 8 commands)
```

### 🎯 Verification

All providers confirmed working with 5-question PRD flow:
- ✅ Claude Code (`/clavix:prd`)
- ✅ OpenCode (`/clavix:prd`)
- ✅ Cursor (`/clavix:prd`)
- ✅ Droid CLI
- ✅ Amp

## [1.5.1] - 2025-11-14

### 🐛 Fixed

#### Archive Detection Improvements
- **Enhanced PRD File Detection**: Extended support for multiple naming conventions in archive detection
  - Now recognizes: `FULL_PRD.md`, `QUICK_PRD.md`, `FULL-PRD.md` (uppercase and hyphenated variants)
  - Previously only detected: `PRD.md`, `full-prd.md`, `prd.md`, `Full-PRD.md`
- **Resolved Issue**: Manually archived projects with non-standard PRD filenames now appear in `clavix archive --list`
- **Technical Changes**:
  - Updated `possibleFiles` array in `src/core/archive-manager.ts:328`
  - Updated `possibleFiles` array in `src/core/task-manager.ts:611`
  - Both detection methods now consistently support all naming variants

**Impact**: Projects archived manually (e.g., via `clavix archive project-name`) that use uppercase or alternative naming conventions are now properly detected and listed.

## [1.5.0] - 2025-11-14

### 🚀 Major Features

#### Vibecoding-Optimized PRD Generation
- **Streamlined Questions**: Reduced from 8 questions to 5 focused questions for faster workflow
- **Smart Tech Detection**: Auto-detects tech stack from project files (package.json, requirements.txt, Gemfile, go.mod, Cargo.toml, composer.json)
- **CLEAR Framework Integration**: Questions designed with CLEAR principles (Concise, Logical, Explicit)
- **Maintained Quality**: All essential information captured without ceremony

### 🎯 New PRD Question Structure

**5 Focused Questions:**
1. 🎯 **Problem & Goal** (Required) - What are we building and why?
2. ⚡ **Core Features** (Required) - Must-have functionality (3-5 features)
3. 🔧 **Tech Stack** (Smart/Optional) - Auto-detected or manual input
4. 🚫 **Out of Scope** (Required) - Explicit boundaries
5. 💡 **Additional Context** (Optional) - Bonus information

**Removed Questions:**
- ❌ Target users - Unnecessary for personal projects and vibecoding
- ❌ Success metrics - Too "corporate" for fast iteration
- ❌ Deadlines/milestones - Not applicable for AI-driven development

### ✨ Smart Tech Stack Detection

**Automatic Detection:**
- Scans common config files in project root
- Detects frameworks from package.json dependencies (React, Vue, Next.js, Astro, etc.)
- Supports Python (Django, Flask, FastAPI), Ruby (Rails), Go, Rust, PHP (Laravel, Symfony)
- Shows detected stack with option to press Enter to accept or type to override
- Gracefully skips if extending existing project

**User Experience:**
```
🔧 Tech stack and requirements?
  Detected: TypeScript, Astro, Tailwind CSS (press Enter to use, or type to override)
```

### 🔧 Technical Improvements

**PRD Generator:**
- Added `detectProjectTechStack()` method in `prd.ts` for intelligent stack detection
- Updated question mapping: q1 → problem, q2 → features, q3 → technical, q4 → outOfScope, q5 → additional
- Enhanced question flow with conditional smart detection for Q3
- Auto-populates Q3 with detected stack if user presses Enter

**Templates:**
- Updated `prd-questions.md` with 5 streamlined questions and emoji indicators
- Simplified `full-prd-template.hbs` - removed users, success, timeline sections
- Optimized `quick-prd-template.hbs` for vibecoding workflow
- Updated acceptance criteria to reflect new structure

**Documentation:**
- Updated `.claude/commands/clavix/prd.md` slash command description
- Enhanced `CLAUDE.md` with vibecoding-optimized workflow details
- Updated `README.md` features and command descriptions

### 📊 Impact

**Time Savings:**
- ~40% reduction in question count (8 → 5 questions)
- Smart defaults for tech stack reduce manual input
- Optional questions can be skipped entirely

**Quality Maintained:**
- CLEAR validation still applies (C, L, E components)
- All essential project context captured
- Out-of-scope boundaries remain required for clarity

### 🎨 UX Enhancements

- Emoji indicators for each question type
- Clear "(Required)" vs "(Optional)" labels
- Helpful inline hints (e.g., "press Enter to skip if extending existing project")
- Color-coded detected tech stack display

### 📝 Migration Notes

**No Breaking Changes:**
- Existing PRD templates continue to work
- Custom templates in `.clavix/templates/` still supported
- CLEAR validation unchanged (C, L, E only for PRDs)

**New Behavior:**
- Q3 (tech stack) now auto-detects from project files
- Users can press Enter to skip optional questions
- Generated PRDs have simpler section structure

---

## [1.4.1] - 2025-11-14

### 🐛 Bug Fixes

#### Missing Commands in New Providers
- **Fixed**: Added missing `plan.md` and `implement.md` commands to all providers
- **Affected**: Cursor, Droid CLI, OpenCode, Amp providers
- **Root cause**: Commands were added to deployed location instead of source templates in v1.3.0
- **Impact**: Users selecting new providers (cursor, droid, opencode, amp) now receive complete command set including `/clavix:plan` and `/clavix:implement`

### 📝 What Was Fixed
- Added `plan.md` to all 5 provider template directories
- Added `implement.md` to all 5 provider template directories
- Verified frontmatter compatibility with Droid and OpenCode YAML requirements
- All providers now have feature parity with Claude Code

### ✅ Complete Command List (All Providers)
- `/clavix:fast` - Quick prompt improvements
- `/clavix:deep` - Comprehensive analysis
- `/clavix:prd` - PRD generation
- `/clavix:plan` - Task breakdown ✨ NEW for cursor/droid/opencode/amp
- `/clavix:implement` - Task execution ✨ NEW for cursor/droid/opencode/amp
- `/clavix:start` - Conversational mode
- `/clavix:summarize` - Extract requirements

---

## [1.4.0] - 2025-11-14

### 🎉 Major Features

#### Multi-Provider Support
- **Breaking Change**: Config now uses `providers: string[]` instead of `agent: string`
- Interactive multi-select checkbox UI during `clavix init`
- Select multiple AI development tools simultaneously
- Automatic config migration from v1.3.0 → v1.4.0

#### New Provider Support
- ✨ **Cursor** - `.cursor/commands/` (flat structure, no frontmatter)
- ✨ **Droid CLI** - `.factory/commands/` (YAML frontmatter, `$ARGUMENTS` placeholder)
- ✨ **OpenCode** - `.opencode/command/` (frontmatter with description, `$ARGUMENTS`)
- ✨ **Amp** - `.agents/commands/` (simple markdown, experimental executable support)
- ✨ **Universal agents.md** - Workflow instructions for tools without slash command support

### 🏗️ Architecture Improvements
- Introduced `BaseAdapter` abstract class for shared adapter logic
- Plugin-based provider system ensures backward compatibility
- Per-provider validation before command generation
- Template system with `{{ARGS}}` placeholder replaced by adapter-specific formats
- Isolated provider modules - adding new providers doesn't affect existing ones

### 🔧 Enhancements
- Enhanced `AgentAdapter` interface with `directory`, `fileExtension`, `features` properties
- Added `ProviderFeatures` interface for provider-specific capabilities
- Added `ValidationResult` interface for adapter validation
- Config migration utilities: `migrateConfig()`, `isLegacyConfig()`
- `AgentManager` now registers all 5 provider adapters
- Per-provider validation with error/warning reporting
- Improved init command UX with provider descriptions and checkbox validation

### 📝 Templates
- Created provider-specific template directories for all 5 providers
- Universal `agents.md` template with workflow detection and CLEAR framework integration
- Standardized `{{ARGS}}` placeholder across all base templates
- Provider adapters transform placeholders to tool-specific formats

### 🧪 Testing & Quality
- TypeScript compilation successful across all new code
- Backward compatibility maintained for v1.3.0 configurations
- BaseAdapter inheritance tested across all provider adapters

### 📚 Documentation
- Updated README with supported tools table
- Multi-provider selection example in Quick Start
- Updated "AI Agent Integration" section
- Comprehensive PRD and implementation plan in `.clavix/outputs/`
- Migration guide for v1.3.0 users

### ⚠️ Breaking Changes
- Config field `agent: string` replaced with `providers: string[]`
- Old configs automatically migrated on next `clavix init`
- No manual migration required - fully automated

### 📦 Migration Guide
If upgrading from v1.3.0:
1. Run `clavix init` in your project
2. Select desired providers (old provider pre-selected)
3. Config automatically migrated to v1.4.0 format
4. Slash commands regenerated for all selected providers

---

## [1.3.0] - 2025-11-14

### Added

- **PRD-to-Implementation Workflow** - Seamless transition from PRD to coded features
  - `clavix plan` command - Generates implementation task breakdown from PRD
  - `clavix implement` command - Executes tasks with AI assistance and session resume
  - Tasks organized into logical phases with CLEAR-optimized atomic descriptions
  - Markdown checkbox format (`- [ ]` / `- [x]`) for stateful progress tracking
  - Task references to PRD sections for context and traceability

- **Git Auto-Commit Integration** - Optional automatic commits during implementation
  - Four commit strategies: per-task, per-5-tasks, per-phase, or none
  - Interactive CLI prompt for commit preference selection
  - Descriptive commit messages with task lists and project context
  - `CommitScheduler` class for tracking commit timing
  - `GitManager` class for git operations and validation

- **Session Resume Capability** - Pick up where you left off
  - Stateful task tracking via markdown checkboxes
  - Automatic detection of first incomplete task
  - Progress statistics (completed/total/percentage)
  - Configuration file (`.clavix-implement-config.json`) for AI agent coordination

- **Core Classes**:
  - `TaskManager` - PRD parsing, task generation, file I/O, progress tracking
  - `GitManager` - Git operations, commit creation, repository validation
  - `CommitScheduler` - Strategy-based commit timing logic

- **Slash Commands**:
  - `/clavix:plan` - Generate task breakdown from PRD
  - `/clavix:implement` - Execute tasks with AI assistance

### Changed

- **Command Structure**: Updated slash command file organization
  - Commands now in `.claude/commands/clavix/` subdirectory
  - README.md updated with plan and implement command documentation
  - CLAUDE.md updated with new workflow commands

### Documentation

- **README.md**: New "PRD-to-Implementation Workflow" feature section
- **Slash Commands**: Detailed implementation guides for AI agents
- **Examples**: Git commit format and task tracking examples

## [1.2.0] - 2025-01-13

### Added

- **CLEAR Framework Integration** - Academically-validated prompt engineering methodology
  - Integrated Dr. Leo Lo's CLEAR Framework (Concise, Logical, Explicit, Adaptive, Reflective)
  - Fast mode now applies C, L, E components with enhanced triage
  - Deep mode now applies full CLEAR framework (C, L, E, A, R)
  - PRD mode now validates generated PRDs using CLEAR framework (C, L, E)
  - Summarize mode now optimizes extracted prompts using CLEAR framework (C, L, E)
  - Added `--framework-info` flag to all commands for CLEAR education
  - Added `--clear-only` flag to fast/deep modes for score-only display
  - Added `--skip-validation` flag to PRD mode
  - Added `--skip-clear` flag to summarize mode
  - Academic citation included: Lo, L. S. (2023). "The CLEAR Path: A Framework for Enhancing Information Literacy through Prompt Engineering"

### Changed

- **Core Engine**: `PromptOptimizer` now uses CLEAR framework methods
  - `applyCLEARFramework(prompt, mode)` orchestrator for all modes
  - Individual component analyzers: `analyzeConciseness()`, `analyzeLogic()`, `analyzeExplicitness()`, `analyzeAdaptiveness()`, `analyzeReflectiveness()`
  - `calculateCLEARScore()` for comprehensive scoring
  - Backward compatibility preserved via `mapCLEARToLegacy()` helper

- **Documentation**: Comprehensive CLEAR framework documentation
  - README.md now prominently features CLEAR Framework with academic citation
  - CLAUDE.md updated with CLEAR-aware slash command descriptions
  - All slash command templates updated to reference CLEAR components
  - Added "Why CLEAR?" section explaining the framework benefits

- **Output Format**: Enhanced user-facing output
  - Color-coded CLEAR scores (green ≥80, yellow ≥60, red <60)
  - Component-labeled improvements ([C], [L], [E], [A], [R])
  - Educational "Changes Made" section references CLEAR components
  - PRD validation shows AI consumption quality scores
  - Summarize generates both raw and CLEAR-optimized versions

### Fixed

- Lint errors: Removed unused error variables in catch blocks

## [1.1.2] - 2025-11-13

### Fixed

- **Template Path Resolution**
  - Fix template path resolution in globally installed package
  - Add copyfiles to build process for template distribution
  - Update template paths from `src/templates/` to `dist/templates/` for production
  - Ensure templates are included in npm package
  - Fix `clavix init` and `clavix update` failures when installed via `npm install -g`

## [1.1.1] - 2025-11-13

### Fixed

- **Command Structure**
  - Adopt OpenSpec directory structure for Claude commands (`.claude/commands/clavix/*.md`)
  - Remove colons from command filenames for cross-platform compatibility
  - Fix `clavix update` to dynamically scan template directory (no hardcoded lists)
  - Fix JSON5 config parsing in update command
  - Add automatic migration from old command structure
  - Commands now properly update during re-initialization

### Changed

- **Command Organization**
  - Move commands to `.claude/commands/clavix/` subdirectory
  - Update template filenames (removed colons)
  - Add `name:` field to command frontmatter

- **Documentation**
  - Update command references from `clavix:improve` to `clavix:fast` and `clavix:deep`
  - Add usage guidance for fast vs deep vs PRD modes
  - Update AGENTS.md and CLAUDE.md with new command paths

## [1.1.0] - 2025-11-13

### Added

- **Dual-Mode Prompt Improvement System**
  - `clavix fast` command for quick prompt improvements with smart triage
  - `clavix deep` command for comprehensive prompt analysis
  - Smart triage system that detects when prompts need deep analysis based on:
    - Prompt length < 20 characters
    - Missing 3+ critical elements (context, tech stack, success criteria, user needs, expected output)
    - Vague scope words without sufficient context
  - Quality assessment feature that identifies already-good prompts (meeting 3/4 quality criteria)
  - "Changes Made" educational summary in both modes
  - Deep mode exclusive features:
    - Alternative phrasings of requirements
    - Edge case identification for requirements
    - Good/bad implementation examples
    - Alternative prompt structures
    - "What could go wrong" analysis

- **Colon Notation for Slash Commands**
  - Migrated all slash commands from dash to colon notation
  - `/clavix:fast` - Quick prompt improvements
  - `/clavix:deep` - Comprehensive analysis
  - `/clavix:prd` - PRD generation (renamed from `/clavix-prd`)
  - `/clavix:start` - Conversational mode (renamed from `/clavix-start`)
  - `/clavix:summarize` - Conversation analysis (renamed from `/clavix-summarize`)

### Changed

- Enhanced `PromptOptimizer` class with dual-mode support
- Updated all documentation to reflect new command structure
- Updated managed documentation blocks (AGENTS.md, CLAUDE.md)
- Improved initialization workflow to generate colon-based slash commands

### Removed

- `clavix improve` command (replaced by `fast` and `deep` commands)
- `/clavix:improve` slash command (replaced by `/clavix:fast` and `/clavix:deep`)

### Fixed

- Test suite updated to reflect new command structure (153/153 tests passing)

## [1.0.0] - 2025-11-13

### Added

- Initial release
- Global CLI tool for prompt improvement and PRD generation
- Claude Code integration with slash commands
- Prompt improvement with gap and ambiguity analysis
- PRD generation through guided Socratic questioning
- Conversational mode for iterative requirement gathering
- Session management for tracking conversations
- Managed documentation injection (AGENTS.md, CLAUDE.md)
- Template system for customization
- Configuration management (`clavix config`)
- List and show commands for session inspection
- Update command for managed blocks

---

**Made for vibecoders, by vibecoders** 🚀
