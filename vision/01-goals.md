# Goals & Objectives

## Primary Goals
- Build a **portfolio-grade AI system** that clearly demonstrates multi-agent architecture.
- Keep the product useful enough to also serve internal/personal workflows.
- Deliver an implementation that is practical in Next.js with free/low-cost model usage.

## Product Goals
- Provide at least two high-value studios from day one:
  - Product Studio
  - Creative / Media Studio
- Ensure outputs are actionable and structured, not generic text.
- Maintain non-technical usability while preserving advanced architecture underneath.

## Technical Goals
- Implement controllable orchestration with:
  - clear stage boundaries,
  - strict output contracts,
  - retry/refinement loops,
  - bounded latency/cost.
- Keep architecture composable so new studios can be added by configuration.
- Standardize inter-stage payloads in strict JSON for reliability and UI rendering.

## UX Goals
- Minimize cognitive load for first-time users.
- Replace opaque model logs with understandable process states.
- Offer optional deep visibility (`Show Thinking`) for advanced users.

## Performance & Cost Goals
- Keep per-request calls in a controlled band:
  - balanced path: ~5 LLM calls
  - fast path: ~4 LLM calls
  - guarded refinement: max 1–2 loops
- Operate safely under daily token and per-minute request limits.

## Business/Portfolio Goals
- Position as a "system" rather than a wrapper.
- Showcase production thinking: orchestration, quality gates, observability, and UX discipline.
- Make the project suitable as a client-facing demo and a lead magnet for freelance work.

## Non-Goals (MVP)
- Full autonomous agents with uncontrolled actions.
- Heavy framework dependency before core orchestration is understood.
- Full enterprise auth/billing stack in initial release.
