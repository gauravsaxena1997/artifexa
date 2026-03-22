# Tech Stack

## Confirmed Stack Direction
- **Frontend + Backend shell**: Next.js
- **Deployment**: Vercel
- **LLM access**: free-tier compatible providers (OpenRouter/Cerebras-style)
- **Analytics + lightweight storage**: Supabase
- **OCR**: file extraction service/library integrated in upload flow

## Why this stack
- aligns with current skills and delivery speed
- keeps MVP operationally simple
- sufficient for portfolio-grade orchestration demos

## Framework Positioning
- Start with custom orchestrator in Next.js for clarity/control.
- LangChain JS is optional later for tooling convenience.
- LangGraph (Python-first) acknowledged as advanced path but intentionally deferred.

## Recommended Internal Modules
- `orchestrator/` (state + routing)
- `agents/` (planner/executor/critic/finalizer definitions)
- `personas/` (config packs + trigger logic)
- `schemas/` (zod/json schema contracts)
- `events/` (A2A/A2UI-style event envelope)
- `studios/` (product/creative pipeline configs)

## Operational Libraries (Suggested)
- JSON schema validation (`zod` or equivalent)
- rate limiter middleware
- Supabase client
- OCR integration SDK/library

## Scaling Notes
- keep model/provider abstraction layer to avoid lock-in
- include per-stage token/time telemetry for tuning
- support fallback model strategy for rate-limit pressure
