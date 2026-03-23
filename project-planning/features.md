# Feature Tracking

| ID | Title | Priority | Status | Depends On | Logged |
|---|---|---|---|---|---|
| FEAT-001 | Full-screen output toggle | P1 | open | BUG-001 | 2026-03-23 |
| FEAT-002 | Token usage tracking (input/output tokens) | P1 | open | — | 2026-03-23 |
| FEAT-003 | Usage limits (trial/case study cap) | P1 | open | FEAT-002 | 2026-03-23 |
| FEAT-004 | Token info dialog (via info icon) | P1 | open | FEAT-002, FEAT-003 | 2026-03-23 |
| FEAT-005 | Show exact agent names in process panel | P2 | open | — | 2026-03-23 |
| FEAT-006 | Process panel auto-expand/collapse with loaders | P1 | open | — | 2026-03-23 |
| FEAT-007 | Artificial pacing delays between LLM calls | P2 | open | FEAT-006 | 2026-03-23 |

---

## FEAT-001: Full-screen output toggle

**Priority:** P1
**Status:** open
**Depends On:** BUG-001 (scroll must work first)
**Logged:** 2026-03-23

**Description:**
Add a button/icon in the Output panel header that expands it to full width, hiding Input and Process panels. When in full-screen mode, show an exit button to restore 3-panel layout.

**Happy Flow:**
1. User completes a pipeline run, sees output in right panel
2. User clicks expand icon in Output header
3. Input + Process panels hide, Output takes full width and height
4. User reads full output comfortably
5. User clicks "Exit full screen" button
6. Layout returns to 3-panel view

**Edge Cases:**
- Mobile: full-screen toggle should still work (already single panel, so this is a no-op or optional)
- If pipeline is still running when user clicks expand, process events should still be tracked in background
- Browser back button should exit full-screen mode (optional, nice-to-have)

**Test Plan:**
- [ ] Desktop: click expand, verify Input/Process hidden, Output full-width
- [ ] Click exit, verify 3-panel layout restored
- [ ] Verify all output tabs still work in full-screen mode
- [ ] Verify copy/download still work in full-screen mode

**Deliverables:**
- Expand/collapse icon in OutputPanel header
- State management in product studio page
- CSS transitions for smooth panel hide/show

---

## FEAT-002: Token usage tracking

**Priority:** P1
**Status:** open
**Logged:** 2026-03-23

**Description:**
Track and display input tokens and output tokens used per pipeline run. The LLM gateway response already includes `usage` data — capture it and surface it.

**Happy Flow:**
1. User runs pipeline
2. Each LLM call captures `usage.prompt_tokens` and `usage.completion_tokens` from gateway response
3. Running totals accumulated in RunMemory
4. After completion, totals displayed in header bar (next to "6 LLM calls" and "10.0s")

**Edge Cases:**
- Gateway might not return usage data → default to 0
- Multiple refinement loops → accumulate across all calls

**Test Plan:**
- [ ] Run pipeline, verify token counts appear in header
- [ ] Verify counts match sum of all LLM calls
- [ ] Verify display when gateway returns no usage data

**Deliverables:**
- Update gateway client to capture and return usage
- Update RunMemory type to store token totals
- Update orchestrator to accumulate tokens
- Update SSE events to include token data
- Update studio header bar to display tokens

---

## FEAT-003: Usage limits

**Priority:** P1
**Status:** open
**Depends On:** FEAT-002
**Logged:** 2026-03-23

**Description:**
Add a generous but enforced limit on pipeline runs to prevent abuse. Track usage per session/browser using localStorage. Show remaining quota.

**Happy Flow:**
1. User opens Product Studio — limit counter initialized (e.g., 20 runs per day)
2. User runs pipelines normally
3. As limit approaches, subtle warning shown ("3 runs remaining today")
4. When limit reached, Run button disabled with message "Daily limit reached. Resets in X hours."

**Edge Cases:**
- User clears localStorage → limit resets (acceptable for case study)
- Limit should be generous enough for genuine testing (20/day suggested)
- Show limit info in info dialog (FEAT-004)

**Test Plan:**
- [ ] Run pipelines, verify counter decrements
- [ ] Verify warning when near limit
- [ ] Verify block when limit reached
- [ ] Verify reset after period

**Deliverables:**
- localStorage-based usage tracker utility
- Limit check before pipeline run
- Warning/block UI in InputPanel
- Limit display in info dialog

---

## FEAT-004: Token info dialog

**Priority:** P1
**Status:** open
**Depends On:** FEAT-002, FEAT-003
**Logged:** 2026-03-23

**Description:**
Add an info icon (ℹ) in the studio header that opens a dialog showing:
- Input tokens used (this run)
- Output tokens used (this run)
- Total tokens (this run)
- Runs remaining today (from FEAT-003 limits)
- Pipeline duration
- LLM calls count

**Happy Flow:**
1. User completes pipeline run
2. User clicks info icon in header
3. Dialog opens showing all usage stats
4. User closes dialog

**Edge Cases:**
- Before any run, show "No run data yet"
- During a run, show live/partial data

**Test Plan:**
- [ ] Verify dialog opens and shows correct data
- [ ] Verify data matches actual pipeline stats
- [ ] Verify dialog works before, during, and after runs

**Deliverables:**
- Info icon in studio header
- UsageInfoDialog component
- Wire to RunMemory data

---

## FEAT-005: Show exact agent names in process panel

**Priority:** P2
**Status:** open
**Logged:** 2026-03-23

**Description:**
Show technical agent names and what they do in the process panel. When a stage expands, show which specific agents are involved (Normalizer, Planner, Architect, QA Strategist, Critic, Finalizer) along with brief descriptions of what they are doing (sanitizing, adding guardrails, planning, etc.)

**Happy Flow:**
1. Pipeline starts
2. First stage shows: "Normalizer Agent — Sanitizing input, extracting structured context, adding guardrails"
3. Each subsequent stage shows the active agent(s) with their role

**Test Plan:**
- [ ] Verify each stage shows correct agent name
- [ ] Verify descriptions are accurate

**Deliverables:**
- Update ProcessView stage data with agent metadata
- Update event rendering to show agent info

---

## FEAT-006: Process panel auto-expand/collapse with loaders

**Priority:** P1
**Status:** open
**Logged:** 2026-03-23

**Description:**
When a pipeline stage starts, auto-expand that stage. When it completes, auto-collapse it and expand the next one. Show animated loaders (spinner/pulse) during active stages to indicate work in progress.

**Happy Flow:**
1. Pipeline starts → "Understanding input" stage auto-expands, shows loader
2. Stage completes → collapses, "Planning product" auto-expands with loader
3. Pattern continues through all stages
4. User can manually expand/collapse any stage at any time

**Edge Cases:**
- If user manually expanded a completed stage, don't force-collapse it
- Show Thinking toggle should still work (controls detail level within expanded stages)
- Multiple events in one stage: keep expanded until final "completed" event

**Test Plan:**
- [ ] Verify auto-expand on stage start
- [ ] Verify auto-collapse on stage complete
- [ ] Verify manual expand/collapse overrides auto behavior
- [ ] Verify loaders visible during active stages

**Deliverables:**
- Auto-expand/collapse state management in ProcessView
- Animated loader component for active stages
- Respect manual overrides

---

## FEAT-007: Artificial pacing delays

**Priority:** P2
**Status:** open
**Depends On:** FEAT-006
**Logged:** 2026-03-23

**Description:**
Add small artificial delays (1-2 seconds) between LLM calls to:
1. Help users read stage results before the next one starts
2. Reduce LLM gateway rate pressure
3. Show "Initializing...", "Preparing next stage..." type loading states

**Happy Flow:**
1. Stage completes → 1.5s pause with "Preparing next stage..." message
2. Next stage begins

**Test Plan:**
- [ ] Verify delays visible between stages
- [ ] Verify total pipeline time increases slightly but UX feels smoother

**Deliverables:**
- Delay utility in orchestrator runner
- Transition loading states in ProcessView
