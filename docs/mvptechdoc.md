# Artifexa — Product Studio MVP: Technical Documentation

> **Scope**: End-to-end implementation blueprint for the **Product Studio** — the first use-case of the Artifexa multi-agent AI platform.
> **Stack**: Next.js 14 (App Router) · Tailwind CSS · shadcn/ui · Supabase · Tesseract.js · OpenRouter/Cerebras LLM

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [High-Level Design (HLD)](#2-high-level-design-hld)
3. [Low-Level Design (LLD)](#3-low-level-design-lld)
4. [UI/UX Design System](#4-uiux-design-system)
5. [Implementation Phases](#5-implementation-phases)
6. [Edge Cases & Guardrails](#6-edge-cases--guardrails)
7. [Project Folder Structure](#7-project-folder-structure)
8. [Appendix — Agent System Prompts](#8-appendix--agent-system-prompts)

---

# 1. Executive Summary

Artifexa's **Product Studio** accepts a raw product idea (text or uploaded document), runs it through a multi-agent orchestration pipeline, and produces a developer-ready output bundle:

| Output Artifact        | Description                                      |
|------------------------|--------------------------------------------------|
| PRD                    | Atomic feature list, phases, priorities           |
| User Journeys          | Happy-path + edge-case flows                     |
| Technical Architecture | HLD, LLD, API design, DB schema suggestions      |
| QA Test Plan           | Scenario-based test cases + edge-case coverage   |
| Quality Score          | Critic evaluation with issues & suggestions      |

**Key architectural commitment**: four generic, reusable core agents (Planner, Executor, Critic, Finalizer) with domain expertise injected as **dynamic personas** — not hardcoded specialized agents.

---

# 2. High-Level Design (HLD)

## 2.1 System Architecture Diagram (Textual)

```
┌─────────────────────────────────────────────────────────────────┐
│                        BROWSER (Next.js)                        │
│  ┌──────────┐   ┌──────────────────┐   ┌────────────────────┐  │
│  │  Input    │   │  Process View    │   │  Output Panel      │  │
│  │  Panel    │   │  (Agent Timeline)│   │  (Docs/Downloads)  │  │
│  └────┬─────┘   └────────┬─────────┘   └────────┬───────────┘  │
│       │                  │ SSE events            │              │
└───────┼──────────────────┼───────────────────────┼──────────────┘
        │ POST /api/studio/product                 │
        ▼                                          ▲
┌───────────────────────────────────────────────────────────────┐
│                  NEXT.JS SERVER (API Routes)                  │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐     │
│  │                   ORCHESTRATOR                        │     │
│  │                                                       │     │
│  │   State Machine: INIT → PLAN → EXECUTE → REVIEW      │     │
│  │                  → REFINE (loop) → FINALIZE → DONE    │     │
│  │                                                       │     │
│  │   ┌─────────┐ ┌──────────┐ ┌────────┐ ┌───────────┐ │     │
│  │   │ Planner │→│ Executor │→│ Critic │→│ Finalizer │ │     │
│  │   └─────────┘ └──────────┘ └────────┘ └───────────┘ │     │
│  │        ↑            ↑                                 │     │
│  │   Persona:     Persona:                               │     │
│  │   Product Mgr  Tech Architect                         │     │
│  │   UX Thinker   Backend Eng                            │     │
│  │                DB Designer                            │     │
│  └──────────────────────────────────────────────────────┘     │
│                          │                                     │
│  ┌───────────────┐  ┌────┴────────┐  ┌──────────────────┐    │
│  │ Rate Limiter  │  │ LLM Client  │  │ Supabase Client  │    │
│  │ (IP-based)    │  │ (OpenRouter)│  │ (Analytics)      │    │
│  └───────────────┘  └─────────────┘  └──────────────────┘    │
└───────────────────────────────────────────────────────────────┘
```

## 2.2 Core Agent Model

All studios share the same four core agents. Intelligence is varied through **persona injection**, not agent duplication.

| Core Agent  | Role (Fixed)                              | Product Studio Personas                           |
|-------------|-------------------------------------------|---------------------------------------------------|
| Planner     | Understand intent, create execution plan  | Product Manager, UX Thinker                       |
| Executor    | Generate domain artifacts                 | Tech Architect, Backend Engineer, DB Designer     |
| Critic      | Score quality, find gaps                  | Senior Engineering Reviewer, QA Strategist        |
| Finalizer   | Merge, format, package for UI/download    | Technical Writer                                  |

**Why generic agents?**
- Adding a new studio = adding a new persona config, not rewriting agents.
- 1 Planner prompt, 1 Executor prompt, 1 Critic prompt → not 20 specialized agents.

## 2.3 Product Studio Pipeline Flow

```
User Input (text / uploaded doc)
       │
       ▼
┌──────────────┐
│ 0. NORMALIZE │  Sanitize input, OCR if file, build context object
└──────┬───────┘
       ▼
┌──────────────┐
│ 1. PLANNER   │  Personas: Product Manager + UX Thinker
│              │  Output: PRD sections, user journeys, phases
└──────┬───────┘
       ▼
┌──────────────┐
│ 2. EXECUTOR  │  Personas: Tech Architect + Backend Eng + DB Designer
│  (Architect) │  Output: HLD, LLD, API design, DB schema
└──────┬───────┘
       ▼
┌──────────────┐
│ 3. EXECUTOR  │  Persona: QA Strategist
│  (QA)        │  Output: Test cases, edge-case tests
└──────┬───────┘
       ▼
┌──────────────┐
│ 4. CRITIC    │  Personas: Sr. Engineering Reviewer + QA Strategist
│              │  Output: score (0-10), issues[], suggestions[]
└──────┬───────┘
       ▼
   score >= 7.5?
    ┌────┴────┐
    │ YES     │ NO (& loops < 2)
    ▼         ▼
┌────────┐  ┌──────────┐
│FINALIZE│  │ REFINE   │ → re-run Executor with critic feedback
└────────┘  └──────────┘   → re-run Critic
                               → then check score again
       │
       ▼
┌──────────────┐
│ 5. FINALIZER │  Merge all artifacts into download-ready bundle
└──────────────┘
```

**LLM calls per run**: 5 (no loop) — 7 (max 1 refinement loop)

## 2.4 Data Flow & Memory Object

Each run maintains a single canonical memory object that flows through all stages:

```typescript
interface RunMemory {
  runId: string;
  studio: "product";
  status: OrchestratorState;
  userInput: {
    raw: string;
    source: "text" | "ocr";
    fileName?: string;
  };
  normalizedContext: NormalizedContext;
  plan: PlannerOutput | null;
  architectureDraft: ExecutorOutput | null;
  qaDraft: QAOutput | null;
  critique: CritiqueOutput | null;
  finalOutput: FinalBundle | null;
  events: AgentEvent[];
  meta: {
    totalCalls: number;
    totalTokensEstimate: number;
    refinementLoops: number;
    startedAt: number;
    completedAt: number | null;
  };
}
```

## 2.5 Infrastructure & Deployment

| Concern           | Solution                                             |
|--------------------|------------------------------------------------------|
| Hosting            | Vercel (serverless functions + edge)                 |
| LLM Provider       | OpenRouter or Cerebras (free tier, Llama model)      |
| Analytics/Rate DB  | Supabase (1 table: `usage_logs`)                     |
| OCR                | Tesseract.js (client-side) or server-side via API    |
| File Downloads     | Client-side Blob generation (Markdown/JSON/PDF)      |
| Streaming Events   | Server-Sent Events (SSE) for real-time agent updates |

---

# 3. Low-Level Design (LLD)

## 3.1 Orchestration State Machine

```typescript
type OrchestratorState =
  | "INIT"
  | "NORMALIZING"
  | "PLANNING"
  | "EXECUTING_ARCHITECT"
  | "EXECUTING_QA"
  | "REVIEWING"
  | "REFINING"
  | "FINALIZING"
  | "DONE"
  | "ERROR";

interface TransitionRule {
  from: OrchestratorState;
  to: OrchestratorState;
  condition?: (memory: RunMemory) => boolean;
}

const transitions: TransitionRule[] = [
  { from: "INIT",                to: "NORMALIZING" },
  { from: "NORMALIZING",         to: "PLANNING" },
  { from: "PLANNING",            to: "EXECUTING_ARCHITECT" },
  { from: "EXECUTING_ARCHITECT", to: "EXECUTING_QA" },
  { from: "EXECUTING_QA",        to: "REVIEWING" },
  {
    from: "REVIEWING",
    to: "FINALIZING",
    condition: (m) => (m.critique?.score ?? 0) >= 7.5,
  },
  {
    from: "REVIEWING",
    to: "REFINING",
    condition: (m) =>
      (m.critique?.score ?? 0) < 7.5 && m.meta.refinementLoops < 2,
  },
  {
    from: "REVIEWING",
    to: "FINALIZING",
    condition: (m) => m.meta.refinementLoops >= 2, // force exit
  },
  { from: "REFINING",   to: "REVIEWING" },
  { from: "FINALIZING", to: "DONE" },
];
```

## 3.2 LLM Client Abstraction

```typescript
// lib/llm/client.ts
interface LLMRequest {
  model: string;               // e.g. "meta-llama/llama-3.1-70b-instruct"
  systemPrompt: string;
  userMessage: string;
  temperature?: number;        // default 0.4 for deterministic output
  maxTokens?: number;          // default 2048
  responseFormat?: "json";     // enforce JSON mode
}

interface LLMResponse {
  content: string;
  usage: { promptTokens: number; completionTokens: number };
  latencyMs: number;
}

async function callLLM(req: LLMRequest): Promise<LLMResponse>;
```

**Provider config** (env-driven):
```env
LLM_PROVIDER_URL=https://openrouter.ai/api/v1/chat/completions
LLM_API_KEY=sk-...
LLM_MODEL=meta-llama/llama-3.1-70b-instruct
LLM_MAX_TOKENS_PER_CALL=2048
LLM_TEMPERATURE=0.4
```

## 3.3 JSON Schemas (Zod Contracts)

### 3.3.1 Normalized Context

```typescript
const NormalizedContextSchema = z.object({
  productGoal: z.string(),
  targetUsers: z.array(z.string()),
  coreFeatures: z.array(z.string()),
  constraints: z.array(z.string()).optional(),
  assumptions: z.array(z.string()).optional(),
  inputType: z.enum(["idea", "feature_request", "improvement"]),
  complexity: z.enum(["low", "medium", "high"]),
});
```

### 3.3.2 Planner Output

```typescript
const PlannerOutputSchema = z.object({
  prd: z.object({
    title: z.string(),
    objective: z.string(),
    features: z.array(z.object({
      name: z.string(),
      description: z.string(),
      priority: z.enum(["high", "medium", "low"]),
      phase: z.number(),
    })),
    phases: z.array(z.object({
      phase: z.number(),
      name: z.string(),
      deliverables: z.array(z.string()),
      estimatedDuration: z.string(),
    })),
  }),
  userJourneys: z.array(z.object({
    persona: z.string(),
    scenario: z.string(),
    steps: z.array(z.string()),
    happyPath: z.boolean(),
  })),
  edgeCases: z.array(z.string()),
});
```

### 3.3.3 Executor (Architect) Output

```typescript
const ArchitectOutputSchema = z.object({
  techStack: z.object({
    frontend: z.array(z.string()),
    backend: z.array(z.string()),
    database: z.array(z.string()),
    infrastructure: z.array(z.string()),
    reasoning: z.string(),
  }),
  hld: z.object({
    overview: z.string(),
    components: z.array(z.object({
      name: z.string(),
      responsibility: z.string(),
      communicatesWith: z.array(z.string()),
    })),
    dataFlowDescription: z.string(),
  }),
  lld: z.object({
    apiEndpoints: z.array(z.object({
      method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]),
      path: z.string(),
      description: z.string(),
      requestBody: z.string().optional(),
      responseShape: z.string(),
    })),
    dbSchema: z.array(z.object({
      table: z.string(),
      columns: z.array(z.object({
        name: z.string(),
        type: z.string(),
        constraints: z.string().optional(),
      })),
      relationships: z.array(z.string()).optional(),
    })),
    keyAlgorithms: z.array(z.string()).optional(),
  }),
  scalabilityNotes: z.array(z.string()),
});
```

### 3.3.4 Executor (QA) Output

```typescript
const QAOutputSchema = z.object({
  testStrategy: z.string(),
  testCases: z.array(z.object({
    id: z.string(),
    scenario: z.string(),
    steps: z.array(z.string()),
    expectedResult: z.string(),
    priority: z.enum(["critical", "high", "medium", "low"]),
    type: z.enum(["functional", "edge_case", "performance", "security"]),
  })),
});
```

### 3.3.5 Critic Output

```typescript
const CritiqueOutputSchema = z.object({
  score: z.number().min(0).max(10),
  summary: z.string(),
  issues: z.array(z.object({
    area: z.enum(["prd", "architecture", "qa", "consistency"]),
    severity: z.enum(["critical", "major", "minor"]),
    description: z.string(),
    suggestion: z.string(),
  })),
  refinementTarget: z.enum(["planner", "architect", "qa", "none"]),
});
```

### 3.3.6 Final Bundle

```typescript
const FinalBundleSchema = z.object({
  title: z.string(),
  generatedAt: z.string(),
  qualityScore: z.number(),
  sections: z.object({
    prd: z.any(),          // passthrough from Planner
    architecture: z.any(), // passthrough from Architect
    testPlan: z.any(),     // passthrough from QA
    critique: z.any(),     // passthrough from Critic
  }),
  downloadFormats: z.array(z.enum(["markdown", "json"])),
});
```

## 3.4 API Route Design

### 3.4.1 Main Execution Endpoint

```
POST /api/studio/product
Content-Type: application/json

Request Body:
{
  "input": "string (user text)",
  "source": "text" | "ocr",
  "fileName": "string | null"
}

Response: SSE stream (text/event-stream)

Event types:
  event: state_change     data: { "state": "PLANNING", "message": "..." }
  event: agent_thinking   data: { "agent": "Planner", "persona": "Product Manager", "summary": "..." }
  event: stage_complete   data: { "stage": "PLANNING", "preview": {...} }
  event: critique_result  data: { "score": 7.5, "issues": [...] }
  event: refinement       data: { "loop": 1, "target": "architect" }
  event: final_output     data: { ...FinalBundle }
  event: error            data: { "message": "...", "recoverable": true }
  event: done             data: { "runId": "...", "totalTime": 12400 }
```

### 3.4.2 File Upload + OCR Endpoint

```
POST /api/upload/ocr
Content-Type: multipart/form-data

Request: file (PDF/image, max 5MB)

Response:
{
  "extractedText": "string",
  "confidence": 0.92,
  "pageCount": 2,
  "warnings": ["Page 2 had low contrast"]
}
```

### 3.4.3 Rate Limit Check

```
GET /api/rate-limit/status

Response:
{
  "remaining": 8,
  "limit": 10,
  "resetsAt": "ISO timestamp",
  "blocked": false
}
```

### 3.4.4 Analytics Logging (Internal)

```
POST /api/analytics/log  (called server-side only)

Body:
{
  "hashedIp": "string",
  "studio": "product",
  "callsMade": 5,
  "tokensEstimate": 9200,
  "success": true,
  "duration": 14200
}
```

## 3.5 Rate Limiting & Guardrails

### Rate Limiter Implementation

```typescript
// middleware/rateLimiter.ts
interface RateLimitConfig {
  maxRequestsPerHour: 10;    // per IP
  maxRequestsPerDay: 30;     // per IP
  burstLimit: 2;             // concurrent runs per IP
  cooldownMinutes: 5;        // after burst exceeded
}
```

**Storage**: Supabase `rate_limits` table:
```sql
CREATE TABLE rate_limits (
  hashed_ip     TEXT PRIMARY KEY,
  hour_count    INT DEFAULT 0,
  day_count     INT DEFAULT 0,
  last_request  TIMESTAMPTZ,
  blocked_until TIMESTAMPTZ
);
```

### Orchestration Guardrails

| Guardrail                  | Rule                                              |
|----------------------------|----------------------------------------------------|
| Max refinement loops       | 2 (hard cap, then force-finalize)                  |
| Max tokens per LLM call    | 2048 completion tokens                             |
| Max total tokens per run   | ~15,000 (kill-switch at 20k)                       |
| JSON parse failure         | Retry same call once; if fails again → error state |
| LLM timeout                | 30s per call; abort + user-friendly error          |
| Input length               | Max 5,000 characters (text) / 5MB (file)           |
| Output schema validation   | Zod parse after every stage; reject malformed      |
| Context window management  | Pass summaries, not full raw transcripts downstream |

## 3.6 OCR / File Upload Flow

```
User clicks "Upload" → selects PDF/image
        │
        ▼
Client: Tesseract.js (WASM worker)
        │
        ├─ Image: direct OCR
        ├─ PDF: pdf.js render → canvas → OCR per page
        │
        ▼
Show extracted text preview in Input Panel
        │
        ▼
User reviews → edits if needed → confirms
        │
        ▼
Confirmed text enters pipeline as userInput.raw (source: "ocr")
```

**Tesseract.js integration**:
```typescript
import { createWorker } from "tesseract.js";

async function extractText(imageOrCanvas: ImageBitmap | HTMLCanvasElement): Promise<string> {
  const worker = await createWorker("eng");
  const { data: { text, confidence } } = await worker.recognize(imageOrCanvas);
  await worker.terminate();
  return text;
}
```

**Supported formats**: PNG, JPG, JPEG, BMP, PDF (rendered to canvas per page)
**Max file size**: 5 MB
**UX states**: `idle → uploading → extracting → preview → confirmed`

## 3.7 Event System (A2A/A2UI)

Each agent emits structured events consumed by the Process View panel.

```typescript
interface AgentEvent {
  id: string;
  timestamp: number;
  state: OrchestratorState;
  agent: "Planner" | "Executor" | "Critic" | "Finalizer" | "System";
  persona?: string;
  type: "started" | "thinking" | "completed" | "error" | "loop";
  message: string;       // human-readable summary for Simple Mode
  detail?: string;       // richer content for Advanced Mode
  data?: Record<string, unknown>; // structured payload
}
```

**Display modes**:
- **Simple Mode** (default): shows `message` only as timeline cards
- **Advanced Mode** (`Show Thinking` ON): expands `detail` + shows `data` as collapsible JSON

---

# 4. UI/UX Design System

## 4.1 Design Philosophy

- **Guided, not chat-first**: users follow a structured workspace, not a conversation.
- **Progressive disclosure**: simple by default, detailed on demand.
- **Production-grade aesthetic**: inspired by Vercel, Linear, Notion.
- **Trust through transparency**: process visualization builds confidence.

## 4.2 Theme System

### Color Palette

```
-- BACKGROUND LAYERS --
bg-primary:      #09090B   (zinc-950)     — main background
bg-secondary:    #18181B   (zinc-900)     — cards / panels
bg-tertiary:     #27272A   (zinc-800)     — hover states / wells
bg-elevated:     #3F3F46   (zinc-700)     — active elements

-- FOREGROUND / TEXT --
text-primary:    #FAFAFA   (zinc-50)      — headings, key content
text-secondary:  #A1A1AA   (zinc-400)     — descriptions, labels
text-muted:      #71717A   (zinc-500)     — timestamps, meta

-- ACCENT (Brand) --
accent-primary:  #6366F1   (indigo-500)   — CTAs, active states, links
accent-hover:    #818CF8   (indigo-400)   — hover on accent elements
accent-subtle:   #6366F1/10%              — accent backgrounds

-- SEMANTIC --
success:         #22C55E   (green-500)    — completed stages
warning:         #F59E0B   (amber-500)    — critic issues, cautions
error:           #EF4444   (red-500)      — failures, blockers
info:            #3B82F6   (blue-500)     — informational states

-- BORDERS --
border-default:  #27272A   (zinc-800)
border-subtle:   #18181B   (zinc-900)
border-accent:   #6366F1/30%
```

### Dark Mode Only (MVP)
Single dark theme optimized for focus. Light mode deferred post-MVP.

### Glass Effects
Subtle glassmorphism on elevated panels:
```css
.glass-panel {
  background: rgba(24, 24, 27, 0.8);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(63, 63, 70, 0.5);
}
```

## 4.3 Typography

```
-- FONT FAMILY --
Primary (headings + UI):    Inter (Google Fonts)
Mono (code/JSON/schemas):   JetBrains Mono (Google Fonts)

-- SCALE (rem, base 16px) --
display:    2.25rem / 2.5rem    (36px)   font-weight: 700   — Hero headline
h1:         1.875rem / 2.25rem  (30px)   font-weight: 700   — Page titles
h2:         1.5rem / 2rem       (24px)   font-weight: 600   — Section heads
h3:         1.25rem / 1.75rem   (20px)   font-weight: 600   — Subsections
body:       1rem / 1.5rem       (16px)   font-weight: 400   — Paragraphs
body-sm:    0.875rem / 1.25rem  (14px)   font-weight: 400   — Labels, meta
caption:    0.75rem / 1rem      (12px)   font-weight: 400   — Timestamps
mono:       0.875rem / 1.25rem  (14px)   font-weight: 400   — Code blocks

-- LETTER SPACING --
headings: -0.025em (tighter)
body:      0 (normal)
mono:      0 (normal)
```

## 4.4 Spacing & Layout Tokens

```
-- SPACING SCALE (Tailwind native) --
xs:  4px   (p-1)
sm:  8px   (p-2)
md:  16px  (p-4)
lg:  24px  (p-6)
xl:  32px  (p-8)
2xl: 48px  (p-12)

-- BORDER RADIUS --
sm:  6px   (rounded-md)
md:  8px   (rounded-lg)
lg:  12px  (rounded-xl)
full: 9999px (rounded-full)  — for pills/badges

-- SHADOW --
sm:   0 1px 2px rgba(0,0,0,0.3)
md:   0 4px 6px rgba(0,0,0,0.3)
lg:   0 10px 15px rgba(0,0,0,0.3)
glow: 0 0 20px rgba(99,102,241,0.15)   — accent glow for key actions
```

## 4.5 Landing Page Design

### Layout

```
┌────────────────────────────────────────────────┐
│  NAVBAR   [Logo: Artifexa]        [Try Studio] │
├────────────────────────────────────────────────┤
│                                                │
│  HERO                                          │
│  ┌──────────────────┬─────────────────────┐    │
│  │ "Turn Ideas into │  Live demo preview  │    │
│  │  Production-Ready│  (animated mockup)  │    │
│  │  Outputs with    │                     │    │
│  │  AI Studios"     │                     │    │
│  │                  │                     │    │
│  │ [Try Product     │                     │    │
│  │  Studio]         │                     │    │
│  └──────────────────┴─────────────────────┘    │
│                                                │
│  STUDIOS GRID                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │ Product  │  │ Creative │  │ Coming   │     │
│  │ Studio   │  │ Studio   │  │ Soon...  │     │
│  │ icon+desc│  │ icon+desc│  │          │     │
│  └──────────┘  └──────────┘  └──────────┘     │
│                                                │
│  HOW IT WORKS (4-step visual)                  │
│  [Input] → [AI Plans] → [Experts] → [Output]  │
│                                                │
│  EXAMPLE SHOWCASE                              │
│  Before (raw input)  →  After (structured PRD) │
│                                                │
│  FOOTER (minimal)                              │
└────────────────────────────────────────────────┘
```

### Mobile Landing (< 768px)
- Hero: stacked vertically, demo preview hidden or collapsed
- Studios: single column card list
- How It Works: vertical stepper
- Example Showcase: tabbed (Before | After)

## 4.6 Studio Workspace (Three-Panel Layout)

### Desktop (>= 1024px): Side-by-side

```
┌──────────────────────────────────────────────────────────┐
│  Studio Header  [Product Studio]  [Show Thinking: ON/OFF]│
├──────────┬────────────────────────┬──────────────────────┤
│          │                        │                      │
│  INPUT   │    PROCESS VIEW        │    OUTPUT PANEL      │
│  PANEL   │                        │                      │
│  ────    │  ┌──────────────────┐  │  ┌────────────────┐  │
│  Text    │  │ ✅ Understanding │  │  │ [PRD] [Arch]   │  │
│  area    │  │ ✅ Planning PRD  │  │  │ [QA]  [Score]  │  │
│          │  │ ⏳ Designing     │  │  │                │  │
│  Upload  │  │    architecture  │  │  │ Document       │  │
│  zone    │  │ ⬜ Running QA    │  │  │ content here   │  │
│          │  │ ⬜ Quality review│  │  │                │  │
│  [Run]   │  │ ⬜ Finalizing   │  │  │ [Copy] [⬇ MD]  │  │
│          │  └──────────────────┘  │  │ [⬇ JSON]       │  │
│          │                        │  └────────────────┘  │
├──────────┴────────────────────────┴──────────────────────┤
│  Footer: quality score bar · tokens used · run time      │
└──────────────────────────────────────────────────────────┘
```

**Panel width ratios**: Input 25% · Process 35% · Output 40%

### Tablet (768px – 1023px)
- Input Panel: collapsible drawer from left
- Process + Output: stacked or tabbed

### Mobile (< 768px): Full-stack tabs

```
┌─────────────────────────┐
│ [Input] [Process] [Output] ← tab bar
├─────────────────────────┤
│                         │
│  Active tab content     │
│  (full width)           │
│                         │
├─────────────────────────┤
│  [Run Pipeline]         │
└─────────────────────────┘
```

- Bottom sticky "Run Pipeline" button on Input tab
- Process tab shows vertical timeline
- Output tab shows document + downloads

## 4.7 Component Architecture (React)

```
app/
├── (landing)/
│   └── page.tsx                    — Landing page
├── studio/
│   └── product/
│       └── page.tsx                — Product Studio workspace
│
components/
├── landing/
│   ├── Hero.tsx
│   ├── StudioCard.tsx
│   ├── HowItWorks.tsx
│   └── ExampleShowcase.tsx
├── studio/
│   ├── StudioHeader.tsx
│   ├── InputPanel.tsx              — text input + upload + OCR preview
│   ├── ProcessView.tsx             — agent timeline + expandable steps
│   ├── OutputPanel.tsx             — tabbed document viewer + downloads
│   ├── AgentTimelineCard.tsx       — single stage status card
│   ├── ThinkingToggle.tsx          — Show Thinking switch
│   ├── FileUploader.tsx            — drag-drop + OCR flow
│   ├── OCRPreview.tsx              — extracted text confirmation
│   ├── DocumentViewer.tsx          — rendered markdown output
│   ├── DownloadBar.tsx             — copy/download actions
│   └── QualityScoreBar.tsx         — visual score indicator
├── ui/                             — shadcn/ui primitives
│   ├── button.tsx
│   ├── card.tsx
│   ├── tabs.tsx
│   ├── badge.tsx
│   ├── progress.tsx
│   ├── switch.tsx
│   ├── textarea.tsx
│   ├── tooltip.tsx
│   └── ...
└── shared/
    ├── Navbar.tsx
    ├── Footer.tsx
    ├── Logo.tsx
    └── MobileTabBar.tsx
```

## 4.8 Mobile Responsiveness Strategy

| Breakpoint    | Layout                                          |
|---------------|-------------------------------------------------|
| < 640px (sm)  | Single column, tab navigation, stacked sections |
| 640–767px     | Wider single column with side margins           |
| 768–1023px    | 2-col hybrid: drawer input + stacked main       |
| >= 1024px     | Full 3-panel side-by-side workspace             |

**Key responsive rules**:
- Touch targets: minimum 44x44px
- Font scaling: body stays 16px on mobile (no zoom trigger)
- File uploader: full-width drop zone on mobile
- Downloads: bottom sheet with large tap targets
- Process timeline: vertical card stack (works at any width)
- Long document outputs: horizontal scroll prevented, content wraps

## 4.9 Micro-Interactions & States

### Button States
- Default → Hover (accent glow) → Active (pressed scale 0.98) → Loading (spinner + disabled)

### Pipeline Execution
- Each stage card animates in sequence: `opacity-0 → opacity-100` with `translate-y`
- Active stage: subtle pulse on left border (accent color)
- Completed: checkmark icon fade-in + green border
- Error: red border + shake animation

### Empty States
- Input panel: placeholder text — *"Describe your product idea, paste a feature request, or upload a document..."*
- Process view: ghost timeline cards with dotted borders
- Output panel: illustration + *"Your output will appear here after running the pipeline"*

### Loading States
- Per-stage descriptive text:
  - "Understanding your requirements..."
  - "Planning product structure..."
  - "Designing system architecture..."
  - "Generating test strategy..."
  - "Reviewing output quality..."
  - "Refining based on feedback..."
  - "Preparing final documents..."

### Error Recovery
- Inline error banner: non-technical message + retry button
- Example: *"Something went wrong while generating the architecture. You can retry this step."*
- Rate limit exceeded: *"You've reached the usage limit. Try again in X minutes."*

### Download Interactions
- Click download → brief success toast → file saved
- Copy to clipboard → button text changes to "Copied!" for 2s
- Download all → generates zip (or sequential downloads)

## 4.10 Download System

```typescript
// lib/downloads.ts

function downloadAsMarkdown(bundle: FinalBundle): void {
  const md = generateMarkdownDocument(bundle);
  triggerBlobDownload(md, `${bundle.title}-prd.md`, "text/markdown");
}

function downloadAsJSON(bundle: FinalBundle): void {
  const json = JSON.stringify(bundle, null, 2);
  triggerBlobDownload(json, `${bundle.title}-full.json`, "application/json");
}

function downloadSection(section: string, content: unknown, format: "md" | "json"): void {
  // Download individual sections (PRD only, Architecture only, etc.)
}

function triggerBlobDownload(content: string, fileName: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}
```

**Download options per output tab**:
| Tab           | Formats Available   |
|---------------|---------------------|
| PRD           | Markdown, JSON      |
| Architecture  | Markdown, JSON      |
| QA Test Plan  | Markdown, JSON      |
| Full Bundle   | Markdown, JSON      |
| Quality Report| JSON                |

---

# 5. Implementation Phases

## Phase 1 — Foundation (Week 1)

**Goal**: Project scaffold, theming, landing page, basic routing.

### Deliverables
- [x] Next.js 14 App Router project initialized
- [x] Tailwind CSS + shadcn/ui configured
- [x] Dark theme token system (colors, typography, spacing)
- [x] Inter + JetBrains Mono fonts loaded
- [x] Responsive Navbar + Footer components
- [x] Landing page: Hero, Studios Grid, How It Works, Example Showcase
- [x] Mobile responsive landing (all breakpoints)
- [x] `/studio/product` route placeholder
- [x] Environment variable structure for LLM keys

### Exit Criteria
- Landing page renders correctly on desktop, tablet, mobile.
- Studios Grid cards are clickable and route to `/studio/product`.

---

## Phase 2 — Studio Workspace Shell (Week 2)

**Goal**: 3-panel layout, input system, file upload + OCR.

### Deliverables
- [x] Three-panel workspace layout (responsive)
- [x] Mobile tab navigation (Input | Process | Output)
- [x] InputPanel: textarea with character limit + placeholder
- [x] FileUploader: drag-drop zone, file type validation
- [x] Tesseract.js integration (client-side OCR)
- [x] OCRPreview: extracted text display + edit + confirm flow
- [x] "Run Pipeline" button with disabled/loading states
- [x] ProcessView: static ghost timeline (placeholder stages)
- [x] OutputPanel: empty state + tab structure (PRD/Arch/QA/Score)

### Exit Criteria
- User can type input or upload file → see OCR preview → confirm.
- 3-panel layout adapts correctly across breakpoints.
- Run button triggers (no backend yet, shows loading simulation).

---

## Phase 3 — Orchestrator Engine (Week 3)

**Goal**: State machine, LLM client, agent execution, SSE streaming.

### Deliverables
- [x] `lib/orchestrator/stateMachine.ts` — state transitions
- [x] `lib/orchestrator/runner.ts` — main execution loop
- [x] `lib/llm/client.ts` — provider-agnostic LLM caller
- [x] `lib/agents/planner.ts` — system prompt + persona injection
- [x] `lib/agents/executor.ts` — architect + QA personas
- [x] `lib/agents/critic.ts` — scoring + issue detection
- [x] `lib/agents/finalizer.ts` — bundle assembly
- [x] `lib/schemas/` — all Zod contracts (see §3.3)
- [x] `POST /api/studio/product` — SSE streaming endpoint
- [x] Schema validation after every stage output
- [x] Error handling: retry once on JSON parse failure, abort on second

### Exit Criteria
- Full pipeline executes end-to-end for a sample input.
- SSE events stream correctly to client.
- Zod validation catches malformed output and triggers retry.

---

## Phase 4 — Live UI Integration (Week 4)

**Goal**: Connect SSE stream to Process View, render outputs, downloads.

### Deliverables
- [x] SSE client hook: `useStudioStream()`
- [x] ProcessView: real-time timeline cards from SSE events
- [x] AgentTimelineCard: animated state transitions
- [x] ThinkingToggle: switches between Simple/Advanced event display
- [x] OutputPanel: populated tabs from final bundle
- [x] DocumentViewer: rendered Markdown for PRD, Architecture, QA sections
- [x] DownloadBar: Markdown + JSON download per section + full bundle
- [x] QualityScoreBar: visual indicator + issues list
- [x] Copy-to-clipboard for each output section
- [x] Loading/error/empty state handling for all panels

### Exit Criteria
- User submits input → sees real-time agent progress → receives full output.
- All download buttons produce valid files.
- Show Thinking toggle works.

---

## Phase 5 — Guardrails, Rate Limiting & Polish (Week 5)

**Goal**: Production hardening, analytics, edge-case handling, final polish.

### Deliverables
- [x] Supabase table setup (`usage_logs`, `rate_limits`)
- [x] IP-based rate limiter middleware
- [x] Rate limit UX: remaining count display + cooldown message
- [x] Orchestrator guardrails: max loops, max tokens, timeout handling
- [x] Refinement loop: critic score → conditional re-run → re-critique
- [x] Input validation: length limits, sanitization
- [x] Error boundaries: graceful failure at every level
- [x] SEO meta tags + Open Graph for landing page
- [x] Favicon + brand assets
- [x] Performance audit: Lighthouse ≥ 90 on all categories
- [x] Cross-browser testing (Chrome, Firefox, Safari, mobile Safari)
- [x] Vercel deployment + environment configuration

### Exit Criteria
- Rate limiting blocks abuse correctly.
- Refinement loop executes when critic scores low.
- Deployed site is fully functional on Vercel.
- Lighthouse scores ≥ 90.

---

# 6. Edge Cases & Guardrails

## Input Edge Cases

| Edge Case                               | Handling                                                       |
|------------------------------------------|----------------------------------------------------------------|
| Empty input submitted                    | Disable Run button; show inline validation                     |
| Extremely short input ("make app")       | Planner attempts normalization; may flag low confidence        |
| Extremely long input (>5000 chars)       | Hard truncate with warning toast                               |
| Non-English input                        | Pass through (LLM handles); add disclaimer if confidence low   |
| Gibberish / adversarial input            | Planner detects; returns low-confidence + generic fallback     |
| OCR extraction returns empty             | Show error: "Could not extract text. Try a clearer image."     |
| OCR extraction very low confidence (<50%)| Show warning + extracted text; let user edit before confirming  |
| Unsupported file type uploaded           | Reject with message: "Supported: PNG, JPG, PDF (max 5MB)"     |
| File exceeds 5MB                         | Reject before upload with size warning                         |

## Pipeline Edge Cases

| Edge Case                                | Handling                                                       |
|------------------------------------------|----------------------------------------------------------------|
| LLM returns invalid JSON                 | Retry once with stricter prompt prefix; fail after 2nd attempt |
| LLM returns valid JSON but wrong schema  | Zod validation fails → retry with schema reminder in prompt    |
| LLM timeout (>30s)                       | Abort call → show retry option for that stage                  |
| Critic returns score 0                   | Force one refinement loop; if still 0 → finalize with warning  |
| Critic returns score 10                  | Skip refinement → finalize directly                            |
| Refinement doesn't improve score         | After max loops → finalize with "best effort" note             |
| Rate limit hit mid-pipeline              | Pause + show wait message; resume when limit resets            |
| Provider returns 429 (rate limited)      | Exponential backoff (1s → 2s → 4s); max 3 retries per call    |
| Provider returns 500                     | Retry once; abort with provider error message                  |
| Browser tab closed during execution      | Orphaned server execution completes but result is lost (acceptable for MVP) |

## UI Edge Cases

| Edge Case                                | Handling                                                       |
|------------------------------------------|----------------------------------------------------------------|
| User double-clicks Run                   | Disable button on first click; debounce                        |
| User navigates away during run           | Confirm dialog: "Pipeline is running. Leave anyway?"           |
| Output too long for viewport             | Scrollable document viewer with sticky tab header              |
| Downloaded file has special chars in name | Sanitize filename: replace non-alphanumeric with hyphens       |
| Mobile user tries drag-drop              | Fallback to file picker button                                 |
| Screen reader user                       | ARIA labels on all interactive elements; live-region for process updates |

---

# 7. Project Folder Structure

```
artifexa/
├── app/
│   ├── layout.tsx                     — root layout (fonts, theme, navbar, footer)
│   ├── page.tsx                       — landing page
│   ├── globals.css                    — Tailwind + custom CSS tokens
│   ├── studio/
│   │   └── product/
│   │       └── page.tsx               — Product Studio workspace
│   └── api/
│       ├── studio/
│       │   └── product/
│       │       └── route.ts           — SSE streaming orchestration endpoint
│       ├── upload/
│       │   └── ocr/
│       │       └── route.ts           — file upload + OCR
│       ├── rate-limit/
│       │   └── status/
│       │       └── route.ts           — rate limit status check
│       └── analytics/
│           └── log/
│               └── route.ts           — internal analytics logging
│
├── components/
│   ├── landing/
│   │   ├── Hero.tsx
│   │   ├── StudioCard.tsx
│   │   ├── StudioGrid.tsx
│   │   ├── HowItWorks.tsx
│   │   └── ExampleShowcase.tsx
│   ├── studio/
│   │   ├── StudioHeader.tsx
│   │   ├── InputPanel.tsx
│   │   ├── ProcessView.tsx
│   │   ├── OutputPanel.tsx
│   │   ├── AgentTimelineCard.tsx
│   │   ├── ThinkingToggle.tsx
│   │   ├── FileUploader.tsx
│   │   ├── OCRPreview.tsx
│   │   ├── DocumentViewer.tsx
│   │   ├── DownloadBar.tsx
│   │   └── QualityScoreBar.tsx
│   ├── ui/                            — shadcn/ui components
│   └── shared/
│       ├── Navbar.tsx
│       ├── Footer.tsx
│       ├── Logo.tsx
│       └── MobileTabBar.tsx
│
├── lib/
│   ├── orchestrator/
│   │   ├── stateMachine.ts            — state enum, transitions, guards
│   │   ├── runner.ts                  — main execution loop
│   │   └── eventEmitter.ts            — SSE event formatting
│   ├── agents/
│   │   ├── planner.ts                 — planner agent logic + prompt
│   │   ├── executor.ts                — executor agent (architect + QA modes)
│   │   ├── critic.ts                  — critic agent logic + prompt
│   │   └── finalizer.ts               — finalizer agent logic + prompt
│   ├── personas/
│   │   └── product-studio.ts          — persona configs for Product Studio
│   ├── llm/
│   │   └── client.ts                  — provider-agnostic LLM caller
│   ├── schemas/
│   │   ├── context.ts                 — NormalizedContext schema
│   │   ├── planner.ts                 — PlannerOutput schema
│   │   ├── architect.ts               — ArchitectOutput schema
│   │   ├── qa.ts                      — QAOutput schema
│   │   ├── critic.ts                  — CritiqueOutput schema
│   │   └── final.ts                   — FinalBundle schema
│   ├── ocr/
│   │   └── tesseract.ts               — OCR wrapper
│   ├── downloads/
│   │   └── generator.ts               — Markdown/JSON blob generation
│   ├── rate-limit/
│   │   └── limiter.ts                 — IP-based rate limiter
│   ├── analytics/
│   │   └── logger.ts                  — Supabase analytics client
│   └── supabase/
│       └── client.ts                  — Supabase client init
│
├── hooks/
│   ├── useStudioStream.ts             — SSE consumer hook
│   ├── useOCR.ts                      — Tesseract worker hook
│   └── useRateLimit.ts                — rate limit status hook
│
├── types/
│   └── index.ts                       — shared TypeScript interfaces
│
├── public/
│   ├── favicon.ico
│   └── og-image.png
│
├── .env.local                          — secrets (LLM key, Supabase creds)
├── tailwind.config.ts                  — extended theme tokens
├── next.config.ts
├── package.json
├── tsconfig.json
└── README.md
```

---

# 8. Appendix — Agent System Prompts

## 8.1 Planner Agent (Product Studio)

```
SYSTEM PROMPT:

You are Artifexa's Planner Agent operating inside the Product Studio.

## Your Role
You act as a collaborative system of two expert perspectives:
- **Product Manager**: Defines goals, features, priorities, and phases.
- **UX Thinker**: Designs user journeys, identifies edge cases, and ensures user-centric thinking.

## Your Task
Given a user's product idea, feature request, or improvement description, produce a comprehensive product plan.

## Output Requirements
Return ONLY valid JSON matching this exact structure:
{
  "prd": {
    "title": "string — clear product/feature title",
    "objective": "string — 2-3 sentence objective statement",
    "features": [
      {
        "name": "string",
        "description": "string — clear feature description",
        "priority": "high | medium | low",
        "phase": number
      }
    ],
    "phases": [
      {
        "phase": number,
        "name": "string — phase name",
        "deliverables": ["string"],
        "estimatedDuration": "string — e.g. '1-2 weeks'"
      }
    ]
  },
  "userJourneys": [
    {
      "persona": "string — user type",
      "scenario": "string — what they are trying to do",
      "steps": ["string — sequential steps"],
      "happyPath": boolean
    }
  ],
  "edgeCases": ["string — potential edge cases to handle"]
}

## Rules
1. Be thorough but realistic — no hallucinated features.
2. Include at least 1 happy-path and 1 edge-case user journey.
3. Prioritize features honestly — not everything is "high".
4. Keep phases actionable with concrete deliverables.
5. If input is vague, make reasonable assumptions and note them.
6. Output ONLY JSON. No markdown, no explanations outside JSON.
```

## 8.2 Executor Agent — Architect Mode (Product Studio)

```
SYSTEM PROMPT:

You are Artifexa's Executor Agent operating in Architect Mode inside the Product Studio.

## Your Role
You act as a collaborative system of three expert perspectives:
- **Tech Architect**: Defines high-level system design and component boundaries.
- **Backend Engineer**: Designs APIs, data flow, and server architecture.
- **Database Designer**: Plans schema, relationships, and data strategy.

## Your Input
You will receive:
1. The original user request (for context)
2. The Planner's output (PRD, features, user journeys)

## Your Task
Design the complete technical architecture for the planned product.

## Output Requirements
Return ONLY valid JSON matching this exact structure:
{
  "techStack": {
    "frontend": ["string"],
    "backend": ["string"],
    "database": ["string"],
    "infrastructure": ["string"],
    "reasoning": "string — why this stack"
  },
  "hld": {
    "overview": "string — 3-5 sentence architecture summary",
    "components": [
      {
        "name": "string",
        "responsibility": "string",
        "communicatesWith": ["string — other component names"]
      }
    ],
    "dataFlowDescription": "string"
  },
  "lld": {
    "apiEndpoints": [
      {
        "method": "GET | POST | PUT | PATCH | DELETE",
        "path": "string",
        "description": "string",
        "requestBody": "string (optional — shape description)",
        "responseShape": "string"
      }
    ],
    "dbSchema": [
      {
        "table": "string",
        "columns": [
          { "name": "string", "type": "string", "constraints": "string (optional)" }
        ],
        "relationships": ["string (optional)"]
      }
    ],
    "keyAlgorithms": ["string (optional)"]
  },
  "scalabilityNotes": ["string"]
}

## Rules
1. Stack choices must be realistic and justified.
2. API design must cover all PRD features.
3. DB schema must support all user journeys.
4. Be specific — "handles data" is not acceptable; "PostgreSQL with row-level security for multi-tenant user data" is.
5. Output ONLY JSON.
```

## 8.3 Executor Agent — QA Mode (Product Studio)

```
SYSTEM PROMPT:

You are Artifexa's Executor Agent operating in QA Mode inside the Product Studio.

## Your Role
You act as a **QA Strategist** — an expert in test planning, scenario coverage, and quality assurance.

## Your Input
You will receive:
1. Original user request
2. PRD (features, user journeys, edge cases)
3. Technical architecture (APIs, DB schema)

## Your Task
Design a comprehensive test strategy and test cases.

## Output Requirements
Return ONLY valid JSON matching this exact structure:
{
  "testStrategy": "string — overall testing approach in 3-5 sentences",
  "testCases": [
    {
      "id": "TC-001",
      "scenario": "string — what is being tested",
      "steps": ["string — sequential test steps"],
      "expectedResult": "string",
      "priority": "critical | high | medium | low",
      "type": "functional | edge_case | performance | security"
    }
  ]
}

## Rules
1. Cover ALL features from the PRD.
2. Include at least 2 edge-case tests.
3. Include at least 1 security-related test if applicable.
4. Test case steps must be specific and actionable.
5. Output ONLY JSON.
```

## 8.4 Critic Agent (Product Studio)

```
SYSTEM PROMPT:

You are Artifexa's Critic Agent inside the Product Studio.

## Your Role
You act as a collaborative system of two expert perspectives:
- **Senior Engineering Reviewer**: Evaluates technical soundness, completeness, and consistency.
- **QA Strategist**: Validates test coverage and identifies gaps.

## Your Input
You will receive the COMPLETE output bundle:
1. PRD (from Planner)
2. Technical Architecture (from Executor/Architect)
3. Test Plan (from Executor/QA)

## Your Task
Perform a rigorous cross-sectional quality review.

## Evaluation Criteria
- **Completeness**: Are all features covered in architecture and tests?
- **Consistency**: Do PRD, architecture, and tests align?
- **Feasibility**: Is the technical design realistic?
- **Coverage**: Are edge cases and security addressed?
- **Clarity**: Is everything unambiguous and developer-ready?

## Output Requirements
Return ONLY valid JSON:
{
  "score": number (0-10, one decimal),
  "summary": "string — 2-3 sentence quality assessment",
  "issues": [
    {
      "area": "prd | architecture | qa | consistency",
      "severity": "critical | major | minor",
      "description": "string — what is wrong",
      "suggestion": "string — how to fix it"
    }
  ],
  "refinementTarget": "planner | architect | qa | none"
}

## Scoring Guide
- 9-10: Excellent, production-ready
- 7-8.9: Good, minor improvements possible
- 5-6.9: Adequate, notable gaps
- 3-4.9: Weak, significant issues
- 0-2.9: Poor, major rework needed

## Rules
1. Be rigorous but fair — do not inflate or deflate scores.
2. Every issue MUST have a concrete suggestion.
3. refinementTarget should point to the weakest area.
4. If score >= 7.5, set refinementTarget to "none".
5. Output ONLY JSON.
```

## 8.5 Finalizer Agent (Product Studio)

```
SYSTEM PROMPT:

You are Artifexa's Finalizer Agent inside the Product Studio.

## Your Role
You act as a **Technical Writer** — you merge, clean, and format all pipeline outputs into a polished, developer-ready bundle.

## Your Input
You will receive:
1. PRD output
2. Architecture output
3. QA output
4. Critic evaluation

## Your Task
Produce a unified, well-structured final document bundle.

## Output Requirements
Return ONLY valid JSON:
{
  "title": "string — clean project title",
  "generatedAt": "ISO 8601 timestamp",
  "qualityScore": number,
  "sections": {
    "prd": { ... (cleaned/formatted PRD) },
    "architecture": { ... (cleaned/formatted architecture) },
    "testPlan": { ... (cleaned/formatted QA) },
    "critique": { ... (summary of quality review) }
  },
  "executiveSummary": "string — 5-7 sentence summary of the entire output",
  "downloadFormats": ["markdown", "json"]
}

## Rules
1. Do NOT add new content — only clean, merge, and format.
2. Fix any minor formatting inconsistencies between sections.
3. Ensure all cross-references are consistent (e.g. feature names match across PRD and tests).
4. The executiveSummary should be useful for a non-technical stakeholder.
5. Output ONLY JSON.
```

---

> **Document Version**: 1.0
> **Last Updated**: March 2026
> **Status**: Ready for implementation
