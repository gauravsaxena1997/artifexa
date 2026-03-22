# Architecture Overview

## High-Level Architecture
- Frontend: Next.js guided workspace
- Backend: Next.js API routes/server actions orchestrating stages
- LLM Layer: provider via OpenRouter/Cerebras-like endpoint
- Storage (lightweight): Supabase for analytics/rate metadata
- File processing: upload + OCR pre-processing layer

## Core Runtime Components
1. `Intent/Context Interpreter`
   - normalize user request
   - detect domain, medium, complexity
2. `Planner`
   - create execution plan + schema targets
3. `Execution Stage(s)`
   - run with dynamic persona injection
4. `Critic`
   - score output quality and return structured issues
5. `Refinement Controller`
   - conditional loop with iteration guard
6. `Finalizer`
   - compose final artifacts in UI-ready contracts
7. `A2A/A2UI Event Stream`
   - curated step events for process visualization

## Product Studio Architecture
Flow:
`Input -> Context -> Planner(PRD/Journeys) -> Architect(HLD/LLD/API/DB) -> QA(Test Plan) -> Critic -> Loop? -> Finalizer`

Output bundle:
- PRD sections
- User journeys
- Technical architecture
- Test strategy
- Quality score + issues

## Creative / Media Studio Architecture
Flow:
`Input -> Intent Analyzer -> Capability Selector -> Planner -> Executor(multi-persona synthesis) -> Critic -> Loop? -> Finalizer(platform formatting)`

Output bundle:
- final media prompt(s)
- optional image->video extension prompt
- style/composition metadata
- quality notes

## Dynamic Persona Injection Logic
- personas are selected from intent flags, not hardcoded path names
- capability selector maps requirement flags to persona packs
- example flags:
  - `needs_pose`
  - `needs_camera`
  - `needs_lighting`
  - `needs_motion`

## Control Strategy
- default execution sequential for rate-limit safety
- optional partial parallelization for independent substeps (future)
- max refinement iterations: 1–2 in MVP

## Reliability Guardrails
- strict JSON output enforcement per stage
- schema validation between stages
- fallback behavior when stage output invalid
- bounded context window transfer (summaries over raw transcript)

## Why this architecture
- balances credibility (real orchestration) with cost/latency constraints
- supports both portfolio demos and real usage patterns
- keeps Next.js-only implementation practical
