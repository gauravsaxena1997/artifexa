# Vision Overview

## Project Intent
Build a production-grade, portfolio-ready AI system that demonstrates real multi-agent orchestration in a way that is understandable to both technical and non-technical users.

The system is designed as a **scalable studio platform** (not a single prompt tool), where each studio runs a conditional pipeline and produces structured, high-value outputs.

## Product Positioning
- Preferred positioning: `AI Studios`, `AI Production Pipeline`, or `AI Thinking Engine`
- Avoid positioning as a simple `Prompt Enhancer` or `Simulator`
- Core promise: "turn user intent into production-ready outputs through guided AI workflows"

## Studio Model (Current + Future)
- **Product Studio** (current priority)
  - Input: product ideas, features, improvement requests
  - Output: PRD, user journeys, HLD/LLD, API/DB notes, QA test plan
- **Creative / Media Studio** (current priority)
  - Input: text prompts for image/video generation
  - Output: platform-optimized text-to-image/video prompts with reasoning trail
- Future studios can be added through config (e.g., Marketing Studio) without changing core orchestration.

## Core Architectural Direction
- Generic core agents remain fixed:
  - Planner
  - Executor (or stage executors)
  - Critic
  - Finalizer
- Domain expertise is injected dynamically as personas based on intent/context.
- Pipelines are conditional, not static.
- Iterative refinement loops are controlled by score thresholds and max-iteration guards.

## UX Direction
- Not chat-first.
- Guided workspace layout:
  - Input Panel
  - Process Visualization
  - Output Panel
- Optional advanced transparency via A2A/A2UI-style step logs.

## Operational Constraints
- Next.js-first architecture
- LLM provider with daily and per-minute limits
- No mandatory auth for MVP
- IP-based rate limiting + lightweight analytics (Supabase)
- OCR-enabled file upload support

## Final Outcome this vision targets
A developer-ready blueprint for a modular, multi-domain AI system that is:
- understandable by clients,
- credible for technical review,
- and extensible for future commercial use.
