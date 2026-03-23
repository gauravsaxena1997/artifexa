# Project Planning

Lightweight project tracking for Artifexa. Mirrors Jira/Asana workflows without the overhead.

## Folder Structure

| File | Purpose | When to Use |
|---|---|---|
| `current.md` | Active sprint / current focus | Updated every session with what we are working on right now |
| `bugs.md` | Bug tracking with repro steps, root cause, fix | Any confirmed or suspected bug |
| `features.md` | New feature specs with user journeys, edge cases, test plan | New functionality being added |
| `enhancements.md` | Improvements to existing functionality | Upgrading existing features |
| `adhoc.md` | One-off tasks, research, refactoring | Anything that doesn't fit above |

## Item Format

Every item gets:
- **ID**: Sequential per file (BUG-001, FEAT-001, ENH-001, ADHOC-001)
- **Timestamp**: When logged
- **Status**: `open` → `in-progress` → `done` / `wont-fix`
- **Priority**: `P0` (critical) / `P1` (high) / `P2` (medium) / `P3` (low)

## Workflow

1. New request comes in → categorize into the right file
2. Update `current.md` with prioritized work order
3. Pick items top-down from `current.md`
4. When done, update status in source file + mark complete in `current.md`
5. If a task reveals new bugs/features, log them in the right file immediately

## Dependencies

If Task B depends on Task A, note it in the `Depends On` column. Always resolve dependencies first.

## Batching

Group related tasks that touch the same files to minimize context switching and save tokens.
