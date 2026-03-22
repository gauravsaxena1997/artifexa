# Open Questions / Unclear Areas

## Open Product Questions
- What exact scoring rubric should Critic use per studio?
- What is the minimum acceptable quality threshold by output type?
- Should users be allowed to edit persona packs directly in UI (future) or remain internal config only?

## Open Technical Questions
- What is the exact per-minute provider limit to tune throttling safely?
- Which OCR provider/library best fits current deployment and cost profile?
- Should Fast Mode (merged stages) be runtime-selectable or internal auto-optimization?

## Open UX Questions
- Should `Show Thinking` default to ON or OFF for first-time users?
- How deep should advanced trace mode expose internal step data?
- What is the right balance between visual process detail and interface simplicity on mobile?

## Risks to Track
- Token/call inflation from oversized context passing
- Schema drift between stages
- Long-tail prompt types that trigger poor persona selection
- Potential abuse with public access model despite IP throttling

## Assumptions Currently Held
- Next.js-only implementation remains the primary build path.
- Provider free tier is sufficient for portfolio/demo usage volume.
- Two initial studios are enough for MVP value demonstration.

## ⚠️ अस्पष्ट (Unclear) Items From Source Discussions
- Mention of moving to a more robust system later ("OpenClock") is referenced but not concretely defined.
- Final branding decision is not locked; several options were discussed.
- Whether parallel execution will be enabled in first release remains unresolved.

## Suggested Resolution Order
1. Freeze stage schemas and critic score rubric.
2. Confirm provider rate limits and loop cap defaults.
3. Lock UX defaults (`Show Thinking`, trace depth).
4. Finalize branding and landing copy.
