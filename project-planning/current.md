# Current Sprint

**Session:** 2026-03-23
**Focus:** Bug fixes, UI/UX overhaul, feature additions

## Prioritized Work Order

Dependencies analyzed. Execution order optimized for batching and minimal context switching.

### Batch 1: Foundation (can run in parallel)
| # | Item | Type | Why First |
|---|---|---|---|
| 1 | ADHOC-001: Anti-AI writing skill | adhoc | Needed by ENH-004, no code deps |
| 2 | BUG-001: Fix output scroll | bug | P0, blocks FEAT-001, blocks testing everything else |
| 3 | ENH-003: Show Thinking default ON | enhancement | One-line change, no deps |

### Batch 2: UI/UX Overhaul (sequential — touches same files)
| # | Item | Type | Why Here |
|---|---|---|---|
| 4 | ENH-001: Light mode | enhancement | Foundation for all visual work |
| 5 | ENH-002: Non-technical UX (spacing, fonts, copy) | enhancement | Depends on ENH-001 theme |
| 6 | ENH-004: Anti-AI writing in prompts | enhancement | Depends on ADHOC-001 skill |

### Batch 3: Features — Process Panel (sequential)
| # | Item | Type | Why Here |
|---|---|---|---|
| 7 | FEAT-006: Auto-expand/collapse process stages | feature | Core UX improvement |
| 8 | FEAT-005: Show agent names in process | feature | Can batch with FEAT-006 |
| 9 | ENH-005: Custom loaders/transitions | enhancement | Depends on FEAT-006 |
| 10 | FEAT-007: Artificial pacing delays | feature | Depends on FEAT-006 |

### Batch 4: Features — Output Panel + Tracking (sequential)
| # | Item | Type | Why Here |
|---|---|---|---|
| 11 | FEAT-001: Full-screen output toggle | feature | Depends on BUG-001 |
| 12 | FEAT-002: Token usage tracking | feature | Independent |
| 13 | FEAT-003: Usage limits | feature | Depends on FEAT-002 |
| 14 | FEAT-004: Token info dialog | feature | Depends on FEAT-002 + FEAT-003 |

### Batch 5: Verification
| # | Item | Type | Why Here |
|---|---|---|---|
| 15 | BUG-002/003/004: Verify copy + downloads | bug | Test after all UI changes |
| 16 | ENH-006: Document critique loop | enhancement | Documentation, no code deps |
| 17 | Full smoke test with Playwright | testing | Final verification |

### Batch 6: Creative Studio (new use case)
| # | Item | Type | Why Here |
|---|---|---|---|
| 18 | Creative Studio types (CreativeRunMemory, output interfaces) | feature | Foundation for all creative studio code |
| 19 | Creative agent prompts with persona injection | feature | Depends on types |
| 20 | Creative orchestrator with conditional agent activation | feature | Depends on prompts + types |
| 21 | Creative API route (SSE streaming) | feature | Depends on orchestrator |
| 22 | useCreativeStream hook | feature | Depends on API route |
| 23 | Creative Studio UI (InputPanel, ProcessView, OutputPanel) | feature | Depends on hook |
| 24 | Sample cases + download utilities | feature | Independent |
| 25 | Landing page update — link Creative Studio | feature | Depends on page |
| 26 | Agent info dialogs in both studios | feature | Cross-cutting |
| 27 | ProcessView Core Agent → Persona format | enhancement | Cross-cutting |
| 28 | Build check + end-to-end smoke test | testing | Final verification |

## Progress Log

- [x] Batch 1 completed — BUG-001 scroll fix, ENH-003 Show Thinking ON, ADHOC-001 anti-AI skill created
- [x] Batch 2 completed — ENH-001 light mode, ENH-004 anti-AI prompts integrated
- [x] Batch 3 completed — FEAT-005/006 process panel rewrite (auto-expand, agent names, loaders, pacing)
- [x] Batch 4 completed — FEAT-001 fullscreen toggle, FEAT-002 token tracking, FEAT-003 usage limits, FEAT-004 token info dialog
- [ ] Batch 5 in progress — ENH-002 UX polish, BUG-002/003/004 verify copy/downloads, smoke test
- [x] Batch 6 completed — Creative Studio end-to-end: types, 7 agent prompts with persona injection, conditional orchestrator (Photographer/Cinematographer/Pose Director/Art Director activated by input), SSE API route, useCreativeStream hook, 3-panel UI (InputPanel with medium selector + Gemini platform, ProcessView with Core Agent → Persona format, OutputPanel with Text/JSON/Agents tabs), 8 sample cases, download utilities (.txt/.md/.json), landing page link enabled, agent info dialogs in both studios, ProcessView updated to show Generic Agent → Personality format. Build passes. Smoke test: "image of a random animal" → 5 LLM calls, 11.2s, 7776 tokens, quality score 9.2/10.
