# Core Concepts

## 1) Multi-Agent Architecture (Role-Based)
Core system uses stable, reusable role agents:
- Planner
- Executor (or stage-specific executors)
- Critic
- Finalizer

Key principle: **intelligence quality comes from structure + context + iteration**, not from creating many hardcoded agents.

## 2) Dynamic Persona System
Personas are not fixed agents. They are injected based on:
- user input
- detected intent
- content type
- complexity

Examples of injectable personas:
- Art Director
- Photographer
- Cinematographer
- Product Architect
- QA Strategist

Model:
- `Role` = what part of pipeline executes
- `Persona` = how that part reasons

## 3) Studio-Based UX Model
Platform is organized as studios (user-facing capability spaces), not technical pipelines:
- Product Studio
- Creative / Media Studio
- Future studios through config expansion

## 4) Conditional Pipeline Activation
No universal fixed chain.
Pipeline stages/personas activate based on:
- intent (what user wants)
- complexity (simple vs high-detail request)
- output type (PRD, prompt, assets)
- medium (image/video)

## 5) Reflection & Refinement
System includes explicit quality loop:
- generate draft
- evaluate with critic
- refine if below threshold
- stop when threshold met or max loops reached

This provides controlled "self-improving" behavior.

## 6) Observability Layer
A2A/A2UI-style logs are treated as a **presentation/observability layer**, not the orchestration core.
- Curated summaries for default UX
- More detailed traces under advanced mode

## 7) Output Philosophy
Each run should produce structured value, such as:
- high-quality generation prompts
- engineering documentation artifacts
- downloadable structured outputs

## 8) Scalability Philosophy
Scale by adding:
- studio configs,
- persona packs,
- routing logic,
not by cloning entire agent systems.
