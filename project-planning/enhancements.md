# Enhancement Tracking

| ID | Title | Priority | Status | Depends On | Logged |
|---|---|---|---|---|---|
| ENH-001 | Light mode UI overhaul | P1 | open | — | 2026-03-23 |
| ENH-002 | Non-technical friendly UX (spacious, larger text, elegant) | P1 | open | ENH-001 | 2026-03-23 |
| ENH-003 | Show Thinking toggle default ON | P2 | open | — | 2026-03-23 |
| ENH-004 | Anti-AI writing style in LLM outputs | P1 | open | ADHOC-001 | 2026-03-23 |
| ENH-005 | Custom loaders and transition states | P2 | open | FEAT-006 | 2026-03-23 |
| ENH-006 | Verify and document critique loop behavior | P2 | open | — | 2026-03-23 |

---

## ENH-001: Light mode UI overhaul

**Priority:** P1
**Status:** open
**Logged:** 2026-03-23

**Description:**
Switch from dark mode to light mode. The product is intended for generic (non-technical) users. Dark mode feels too "developer tool." Light mode with warm, clean aesthetics will feel more approachable and alive.

**Scope:**
- Replace dark theme CSS variables with light theme
- Update globals.css `@theme` block
- Update all hardcoded dark colors in components
- Ensure all shadcn/ui components respect new theme
- Navbar, Footer, Landing page, Studio page all updated
- Accent color: keep indigo or shift to a warmer creative palette

**Test Plan:**
- [ ] All pages render correctly in light mode
- [ ] No dark background remnants
- [ ] Text contrast meets WCAG AA
- [ ] All interactive elements visible and usable

**Deliverables:**
- Updated globals.css theme
- Component color audit and fixes

---

## ENH-002: Non-technical friendly UX

**Priority:** P1
**Status:** open
**Depends On:** ENH-001
**Logged:** 2026-03-23

**Description:**
Make the UI feel alive, creative, and approachable for non-technical users. Changes include:
- Larger base font size (16px body, 18px in studio)
- More generous spacing/padding
- Friendlier language (avoid jargon like "pipeline", "orchestrator" in user-facing text)
- Warmer, more inviting design language
- Subtle animations that feel playful, not mechanical
- Rounded corners, softer shadows
- Better visual hierarchy with whitespace

**Test Plan:**
- [ ] Non-technical person can understand what each section does
- [ ] Text is readable without squinting
- [ ] Layout feels spacious, not cramped
- [ ] Visual hierarchy guides the eye naturally

**Deliverables:**
- Typography updates (size, weight, spacing)
- Padding/margin audit across all components
- Copy rewrites for user-facing labels
- Animation polish

---

## ENH-003: Show Thinking toggle default ON

**Priority:** P2
**Status:** open
**Logged:** 2026-03-23

**Description:**
Change the Show Thinking toggle in the Process panel to be ON by default. Users want to see what is happening by default.

**Test Plan:**
- [ ] Toggle is ON when page loads
- [ ] User can still toggle it OFF
- [ ] Thinking details visible by default during pipeline run

**Deliverables:**
- Update default state in ProcessView or parent page

---

## ENH-004: Anti-AI writing style in LLM outputs

**Priority:** P1
**Status:** open
**Depends On:** ADHOC-001 (anti-AI skill must exist first)
**Logged:** 2026-03-23

**Description:**
Apply the anti-AI writing skill to all agent system prompts so LLM outputs read naturally and don't exhibit common AI writing patterns (overuse of "crucial", "tapestry", "leveraging", em dashes, rule-of-three, puffery, etc.)

**Scope:**
- Update all system prompts in `src/lib/agents/prompts.ts`
- Add anti-AI writing constraints to each prompt
- Test output quality difference

**Test Plan:**
- [ ] Run pipeline, check output text for AI-isms
- [ ] Compare before/after output samples
- [ ] Verify output still contains useful, accurate content

**Deliverables:**
- Updated prompts.ts with anti-AI constraints
- Skill file reference

---

## ENH-005: Custom loaders and transition states

**Priority:** P2
**Status:** open
**Depends On:** FEAT-006
**Logged:** 2026-03-23

**Description:**
Add customized loading animations and transition messages between pipeline stages. Instead of generic spinners, use contextual messages like:
- "Reading your idea..."
- "Thinking about the product shape..."
- "Designing the technical blueprint..."
- "Writing test scenarios..."
- "Running quality checks..."
- "Polishing the final documents..."

**Test Plan:**
- [ ] Each stage shows a relevant loading message
- [ ] Animations are smooth and not jarring
- [ ] Messages feel human, not robotic

**Deliverables:**
- Stage-specific loading messages
- Animated loader component
- Integration into ProcessView

---

## ENH-006: Verify and document critique loop behavior

**Priority:** P2
**Status:** open
**Logged:** 2026-03-23

**Description:**
Clarify and document how the critique/refinement loop works. Current implementation:
- `MAX_REFINEMENT_LOOPS = 1` — so max 2 total critic passes (initial + 1 refinement)
- `QUALITY_THRESHOLD = 7.5` — if score >= 7.5, no refinement needed
- If score < 7.5 on first pass, the weakest area (architect or QA) gets refined, then critic re-evaluates
- Total possible LLM calls: 6 (no refinement) or 8 (with refinement)

User wants to understand this and potentially show it in the UI. Document this flow clearly.

**Test Plan:**
- [ ] Trigger a low-quality-score scenario and verify refinement loop fires
- [ ] Verify the correct section is refined based on `refinementTarget`
- [ ] Verify process panel shows refinement loop clearly

**Deliverables:**
- Documentation of critique loop in README or docs
- Process panel showing refinement loop steps when they occur
