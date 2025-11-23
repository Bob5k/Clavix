# Clavix v3.0 Implementation Plan

## Status: IN PROGRESS
**Last Updated:** 2025-01-23
**Completion:** ~40%

---

## Executive Summary

Transforming Clavix from CLEAR Framework-dependent to universal prompt intelligence tool. Removing all CLEAR branding, implementing intent-aware optimization with modular pattern system.

---

## ✅ Completed Tasks

### 1. Core Intelligence Layer ✓
**Status:** COMPLETE
**Files Created:**
- `src/core/intelligence/types.ts` - Core type definitions
- `src/core/intelligence/intent-detector.ts` - Automatic prompt intent detection
- `src/core/intelligence/pattern-library.ts` - Pattern management system
- `src/core/intelligence/quality-assessor.ts` - 5-dimension quality metrics
- `src/core/intelligence/universal-optimizer.ts` - Main orchestrator
- `src/core/intelligence/index.ts` - Module exports
- `src/core/intelligence/patterns/base-pattern.ts` - Base pattern class
- `src/core/intelligence/patterns/conciseness-filter.ts` - Pattern implementation
- `src/core/intelligence/patterns/objective-clarifier.ts` - Pattern implementation
- `src/core/intelligence/patterns/technical-context-enricher.ts` - Pattern implementation

**Key Features:**
- Intent detection (6 types: code-generation, planning, refinement, debugging, documentation, prd-generation)
- Quality assessment (5 dimensions: clarity, efficiency, structure, completeness, actionability)
- Pattern library with priority-based selection
- Modular architecture for easy extension

**Note:** Currently 3 patterns implemented. 17 more patterns TODO (see Remaining Work section).

### 2. Command Refactoring
**Status:** COMPLETE ✓
**Files Updated:**
- `src/cli/commands/fast.ts` - COMPLETE ✓
  - Replaced PromptOptimizer with UniversalOptimizer
  - Removed all CLEAR terminology
  - Updated UI with 5 quality dimensions
  - Added intent display
  - Updated triage logic

- `src/cli/commands/deep.ts` - COMPLETE ✓
  - Full UniversalOptimizer integration
  - Comprehensive intent analysis display
  - Deep mode features (alternatives, edge cases, validation) with TODO markers for pattern implementation
  - No CLEAR references

- `src/cli/commands/prd.ts` - COMPLETE ✓
  - Rebranded to "Clavix Planning Mode"
  - Removed `--skip-validation` flag (always validates)
  - Updated quality validation with UniversalOptimizer
  - Cleaner UI and messaging

- `src/cli/commands/summarize.ts` - COMPLETE ✓
  - Removed `--skip-clear` flag (always optimizes)
  - UniversalOptimizer integration
  - Cleaner file naming (original-prompt.md + optimized-prompt.md)

---

## 🚧 In Progress Tasks

### 3. Remaining Command Files
**Priority:** HIGH
**Files to Update:**
1. **deep.ts** - Similar to fast.ts but add deep mode features
2. **prd.ts** - Rebrand to "Clavix Planning Mode", update validation
3. **summarize.ts** - Remove `--skip-clear` flag, always optimize

**Approach:** Follow same pattern as fast.ts refactor

---

## 📋 Pending Tasks (In Order)

### 4. Update Canonical Templates
**Priority:** CRITICAL (affects all 22 providers)
**Directory:** `src/templates/slash-commands/_canonical/`
**Files to Update:**
1. `fast.md` (316 lines) - Remove CLEAR references, add quality dimensions
2. `deep.md` (421 lines) - Remove CLEAR references, add alternatives/validation
3. `prd.md` (289 lines) - Rebrand to "Clavix Planning Mode"
4. `start.md` (~150 lines) - Remove CLEAR references
5. `summarize.md` (~180 lines) - Remove CLEAR/`--skip-clear` references
6. `execute.md` (~120 lines) - Minor CLEAR reference cleanup
7. `plan.md` - Minor updates
8. `implement.md` - No changes needed
9. `task-complete.md` - No changes needed
10. `archive.md` - No changes needed
11. `list.md` - Update quality metric examples
12. DELETE: `clear.md` - Cleanup command

**Why Critical:** These templates are transformed by all 22 provider adapters. Once updated, ALL providers automatically get new terminology.

### 5. Update Provider Adapters (Managed Blocks)
**Priority:** HIGH
**Files with Managed Blocks:**
1. `src/core/adapters/agents-md-generator.ts` - Update CLAVIX:START block
2. `src/core/adapters/claude-code-adapter.ts` - Update CLAUDE.md injection
3. `src/core/adapters/octo-md-generator.ts` - Update OCTO:START block
4. `src/core/adapters/warp-md-generator.ts` - Update WARP:START block
5. `src/core/adapters/copilot-instructions-generator.ts` - Update instructions

**Content Updates:**
- Remove "CLEAR Framework" mentions
- Add "universal prompt intelligence"
- List 5 quality dimensions
- Emphasize "zero learning curve"

### 6. Update PRD Templates
**Priority:** MEDIUM
**Files:**
1. `src/templates/full-prd-template.hbs` - Update header/footer
2. `src/templates/quick-prd-template.hbs` - Update header/footer
3. `src/templates/prd-questions.md` - Rebrand to "Planning Mode"

**Changes:**
- Header: "Generated with Clavix Planning Mode" (not "CLEAR Framework")
- Footer: Link to Clavix docs

### 7. Update Main Documentation
**Priority:** HIGH
**Files:**
1. **README.md** (~400 → ~500 lines) - Complete rewrite
   - Remove "CLEAR Framework-based tool"
   - Add "Universal prompt intelligence for developers"
   - New positioning: "The Key to Better Prompts"
   - Update features, examples, how it works sections

2. **package.json** - Update description and keywords
   ```json
   "description": "Universal prompt intelligence for developers. Transform messy ideas into structured, AI-ready prompts instantly."
   ```

3. **CHANGELOG.md** - Add v3.0.0 section with breaking changes

### 8. Create New Documentation
**Priority:** HIGH
**New Files:**
1. **docs/prompt-intelligence.md** (~800 lines)
   - Explain Adaptive Prompt Intelligence™
   - How intent detection works
   - Pattern library overview
   - Quality dimensions explained
   - Framework-agnostic philosophy

2. **docs/migration-v2-to-v3.md** (~500 lines)
   - What changed
   - Migration steps
   - Compatibility notes
   - FAQ
   - Rollback instructions

**Delete:**
- `docs/clear-framework.md` (1200+ lines)

### 9. Update Test Files
**Priority:** MEDIUM
**Directory:** `tests/`
**Changes Needed:**
1. Rename `tests/unit/core/prompt-optimizer.test.ts` → `universal-optimizer.test.ts`
2. Update all CLEAR score assertions → quality metric assertions
3. Add tests for:
   - Intent detection (20+ cases)
   - Pattern library (3+ implemented patterns)
   - Quality assessor (5 dimensions)
4. Update integration tests in `tests/integration/commands/`

### 10. Integration Testing & Verification
**Priority:** HIGH (before release)
**Tasks:**
1. Test all 22 provider adapters
2. Verify slash commands generate correctly
3. Check for ANY remaining CLEAR references
4. Verify quality metrics display properly
5. Test backward compatibility with v2.x saved prompts
6. Performance benchmarks (fast <3s, deep <15s)

---

## 📊 Remaining Work Summary

### Files to Modify
- **3 command files** (deep.ts, prd.ts, summarize.ts)
- **12 canonical templates** (fast.md, deep.md, prd.md, etc.)
- **5 provider adapters** (managed blocks)
- **3 PRD templates** (handlebars files)
- **3 main docs** (README, package.json, CHANGELOG)
- **2 new docs** (prompt-intelligence.md, migration guide)
- **~50 test files** (unit + integration)

### Files to Delete
- `src/core/prompt-optimizer.ts` (1281 lines) - **TODO: DELETE after commands updated**
- `docs/clear-framework.md`
- `src/templates/slash-commands/_canonical/clear.md`

### Patterns to Implement (17 remaining)
**Fast Mode (7):**
1. LogicalFlowEnforcer
2. OutputFormatSpecifier
3. SuccessCriteriaAdder
4. ConstraintExtractor
5. PersonaAssigner
6. AudienceTargeter
7. SecurityAwarenessInjector

**Deep Mode Exclusive (10):**
1. AlternativePhrasingGenerator
2. StructureVariationGenerator
3. EdgeCaseIdentifier
4. ValidationChecklistCreator
5. AssumptionExplicitizer
6. ScopeDefiner
7. StepByStepDecomposer
8. TemplatePatternApplier
9. ReflectionPrompter
10. ContextPrecisionBooster

---

## 🎯 Quick Reference: Key Changes

### Terminology Mapping
| Old (CLEAR) | New (Universal) |
|-------------|-----------------|
| [C] Conciseness | Efficiency |
| [L] Logic | Structure |
| [E] Explicitness | Clarity |
| (none) | Completeness |
| (none) | Actionability |
| CLEAR Framework | Universal Prompt Intelligence |
| CLEAR score | Quality metrics |
| PRD Generation | Clavix Planning Mode |

### Architecture Change
```
OLD: User Input → CLEAR Framework (C/L/E/A/R) → Scored Output

NEW: User Input → Intent Detection → Pattern Selection →
     Universal Optimization → Quality Assessment
```

### Import Changes
```typescript
// OLD:
import { PromptOptimizer } from '../../core/prompt-optimizer.js';

// NEW:
import { UniversalOptimizer } from '../../core/intelligence/index.js';
```

---

## 🚀 Next Steps (Priority Order)

1. **Finish command refactoring** (deep.ts, prd.ts, summarize.ts)
2. **Update all 12 canonical templates** (CRITICAL - affects all providers)
3. **Update provider adapters** (managed blocks)
4. **Update PRD templates**
5. **Rewrite README.md**
6. **Create new documentation files**
7. **Update test files**
8. **Run integration tests**
9. **Delete old files** (prompt-optimizer.ts, clear-framework.md)
10. **Final verification** (all 22 providers work correctly)

---

## ⚡ Performance Targets
- Intent detection: < 50ms
- Fast mode optimization: < 3s
- Deep mode optimization: < 15s
- Quality assessment: < 100ms

---

## ✅ Success Criteria
- [ ] Zero "CLEAR Framework" mentions in user-facing text
- [ ] All 22 providers generate commands successfully
- [ ] Tests pass with >80% coverage
- [ ] Backward compatible with v2.x saved prompts
- [ ] Fast mode < 3s, Deep mode < 15s
- [ ] Documentation complete and accurate

---

## 📝 Notes

### Pattern Implementation Strategy
Start with 3 core patterns (DONE):
1. ConcisenessFilter ✓
2. ObjectiveClarifier ✓
3. TechnicalContextEnricher ✓

Add remaining 17 patterns incrementally as needed. System works with current 3 patterns.

### Testing Strategy
1. Unit tests for each intelligence module
2. Integration tests for command flows
3. Provider adapter verification (all 22)
4. Backward compatibility tests

### Deployment Strategy
1. Complete all code changes
2. Run full test suite
3. Test with all 22 providers
4. Update version to 3.0.0
5. Publish to npm
6. Announce on GitHub, HackerNews

---

**End of Implementation Plan**

*This document should be updated as tasks are completed. Use it to track progress and avoid context bloat.*
