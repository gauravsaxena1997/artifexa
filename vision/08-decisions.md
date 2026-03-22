# Key Decisions

## D1 — Use role-based generic core agents
**Decision**: Keep Planner/Executor/Critic/Finalizer fixed.

**Why**:
- prevents agent sprawl
- improves maintainability
- supports cross-domain reuse

**Trade-off**:
- requires strong prompt/system design per stage

## D2 — Use dynamic persona injection
**Decision**: Inject personas contextually instead of implementing each persona as a separate service agent.

**Why**:
- scalable and composable
- lower latency/cost than many discrete calls
- clearer evolution path via config

## D3 — Adopt studio product model
**Decision**: Product organized as studios, not pipeline jargon.

**Why**:
- better UX language
- supports non-technical users
- future expansion ready

## D4 — Pipelines are conditional
**Decision**: Activate steps/personas based on intent, complexity, and output medium.

**Why**:
- avoids irrelevant processing
- improves output relevance
- controls cost

## D5 — Enforce strict JSON contracts
**Decision**: All orchestration stages emit schema-validated JSON.

**Why**:
- resilient UI rendering
- easier debugging/retries
- consistent downstream processing

## D6 — Include critic-driven refinement loop
**Decision**: Add quality-gated loop with max-iteration cap.

**Why**:
- improves reliability/quality
- demonstrates advanced orchestration
- keeps runtime bounded with hard limits

## D7 — Sequential execution by default
**Decision**: Prefer sequential calls in MVP.

**Why**:
- safer under per-minute rate limits
- easier observability and debugging

**Trade-off**:
- slower than parallel execution

## D8 — A2A/A2UI as observability layer
**Decision**: Show curated inter-stage communication in UI with advanced toggle.

**Why**:
- strong portfolio differentiator
- transparency without overwhelming default UX

## D9 — No mandatory auth in MVP
**Decision**: public access + IP-based controls.

**Why**:
- reduces friction
- supports demo/discovery goals

**Compensating controls**:
- rate limiting
- abuse analytics

## D10 — Keep Next.js-first, avoid premature framework migration
**Decision**: build orchestration fundamentals manually before adding heavy abstraction frameworks.

**Why**:
- deeper system understanding
- lower implementation risk for current goals
