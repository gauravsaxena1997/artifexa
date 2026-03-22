# System Design

## Orchestration State Model
Recommended state machine:
- `PLAN`
- `EXECUTE`
- `REVIEW`
- `REFINE`
- `FINALIZE`
- `DONE`

Transition logic:
- `REVIEW -> DONE` when score >= threshold
- `REVIEW -> REFINE` when score < threshold and loop budget remains
- `REFINE -> REVIEW` after corrected draft generation

## Data Contract Shape (Global)
Canonical run memory object:
```json
{
  "runId": "string",
  "studio": "product|creative",
  "userInput": "string",
  "normalizedContext": {},
  "plan": {},
  "draft": {},
  "critique": {"score": 0, "issues": []},
  "finalOutput": {},
  "events": []
}
```

## Stage Contract Requirements
Every stage should return strict JSON:
- `status`
- `stage`
- `output`
- `confidence` (optional but useful)
- `issues` (if any)

Validation checks:
- schema presence
- required keys
- output type conformity

## LLM Call Budgeting
Observed design range:
- Product Studio balanced flow: ~5 calls
- Product Studio with loop: ~6–8 calls
- Creative Studio balanced flow: ~5 calls
- Creative Studio with loop: ~6–7 calls

Token guidance:
- estimated 8k–12k tokens/run depending on prompt sizes and loop count

## Rate & Abuse Controls
- IP-based request limiting
- per-minute burst control
- daily token budget thresholds
- cooldown response when threshold exceeded

## Lightweight Analytics (Supabase)
Store minimal operational events:
- timestamp
- hashed IP/session key
- studio selected
- calls made
- token estimate
- success/failure

Purpose:
- usage insight
- abuse prevention tuning
- demo reliability monitoring

## File Upload + OCR Flow
1. user uploads file
2. OCR extraction
3. preview extracted text for user confirmation
4. approved text enters pipeline context

## Output Rendering Model
UI consumes normalized output payloads, not raw model text:
- `processSteps`
- `documentSections`
- `promptOutputs`
- `downloadables`

## Security / Privacy Notes (MVP)
- avoid storing raw sensitive input unless needed
- hash/anonymize IP where possible
- expose only curated reasoning summaries in UI
