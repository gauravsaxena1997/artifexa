# Bug Tracking

| ID | Title | Priority | Status | Logged |
|---|---|---|---|---|
| BUG-001 | Output panel not scrollable | P0 | open | 2026-03-23 |
| BUG-002 | Copy All button — verify functionality | P0 | open | 2026-03-23 |
| BUG-003 | .md download — verify functionality | P0 | open | 2026-03-23 |
| BUG-004 | .json download — verify functionality | P0 | open | 2026-03-23 |

---

## BUG-001: Output panel not scrollable

**Priority:** P0
**Status:** open
**Logged:** 2026-03-23

**Description:**
After pipeline completes and output renders in the Output panel (PRD, Architecture, QA, Score tabs), the user cannot scroll the content. Only a single viewport worth of content is visible. Content below the fold is inaccessible.

**Repro Steps:**
1. Go to `/studio/product`
2. Enter any input (e.g., "food delivery but better")
3. Run Pipeline → wait for completion
4. Observe the Output panel — content is cut off, no scroll

**Expected:** Output panel should scroll vertically to show all content within each tab.

**Root Cause:** TBD — likely missing `overflow-y: auto` or parent container constraining height with `overflow: hidden`.

**Fix:** TBD

---

## BUG-002: Copy All button — verify functionality

**Priority:** P0
**Status:** open
**Logged:** 2026-03-23

**Description:**
Need to verify the Copy All button in the Output panel copies all output content (PRD + Architecture + QA + Score) to clipboard.

**Repro Steps:**
1. Complete a pipeline run
2. Click "Copy All" button
3. Paste into a text editor
4. Verify content is complete

**Root Cause:** TBD

**Fix:** TBD

---

## BUG-003: .md download — verify functionality

**Priority:** P0
**Status:** open
**Logged:** 2026-03-23

**Description:**
Verify .md download button produces a valid, complete markdown file with all output sections.

**Repro Steps:**
1. Complete a pipeline run
2. Click ".md" download button
3. Open downloaded file
4. Verify content is complete and properly formatted

**Root Cause:** TBD

**Fix:** TBD

---

## BUG-004: .json download — verify functionality

**Priority:** P0
**Status:** open
**Logged:** 2026-03-23

**Description:**
Verify .json download button produces a valid JSON file with the full FinalBundle structure.

**Repro Steps:**
1. Complete a pipeline run
2. Click ".json" download button
3. Open downloaded file
4. Verify JSON is valid and complete

**Root Cause:** TBD

**Fix:** TBD
