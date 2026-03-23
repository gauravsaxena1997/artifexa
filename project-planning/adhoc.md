# Ad-hoc Tasks

| ID | Title | Priority | Status | Logged |
|---|---|---|---|---|
| ADHOC-001 | Create anti-AI writing skill from Wikipedia reference | P1 | open | 2026-03-23 |
| ADHOC-002 | Document output format approach (how .md/.json downloads work) | P2 | open | 2026-03-23 |

---

## ADHOC-001: Create anti-AI writing skill

**Priority:** P1
**Status:** open
**Logged:** 2026-03-23

**Description:**
Read the Wikipedia "Signs of AI writing" article and distill it into a reusable skill file at `skills/anti-ai-writing.md`. This skill will be applied to all LLM system prompts so outputs read naturally.

**Source:** https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing

**Key areas to cover:**
- Banned AI vocabulary words (delve, tapestry, crucial, pivotal, underscore, vibrant, etc.)
- Avoid puffery and promotional language
- Avoid rule-of-three pattern abuse
- Avoid negative parallelisms ("not just X, but also Y")
- Avoid elegant variation (synonym cycling)
- Avoid overuse of em dashes
- Avoid vague attributions
- Avoid superficial analyses tacked on to facts
- Use simple copulatives ("is", "are") instead of "serves as", "stands as"
- Write specific, not generic

**Deliverables:**
- `skills/anti-ai-writing.md` with input/output format matching existing skill style

---

## ADHOC-002: Document output format approach

**Priority:** P2
**Status:** open
**Logged:** 2026-03-23

**Description:**
Document how we handle output formats:

**Current approach:**
- LLM returns structured JSON from each agent (normalizer, planner, architect, QA, critic)
- The finalizer agent only generates a title + executive summary; the FinalBundle is assembled in code from actual agent outputs
- `.json` download: `JSON.stringify(finalBundle)` — raw JSON of the full structured output
- `.md` download: `bundleToMarkdown()` function in `src/lib/downloads.ts` converts FinalBundle to formatted markdown
- `Copy All`: copies the markdown version to clipboard
- We do NOT ask the LLM to produce markdown or formatted text — we convert JSON to both formats ourselves

**Deliverables:**
- This documentation (already done by writing this entry)
