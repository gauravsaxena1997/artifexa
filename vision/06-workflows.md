# Workflows / Pipelines

## Global Execution Pattern
`Input -> Normalize -> Plan -> Execute -> Review -> (Refine?) -> Finalize -> Render`

Loop rule:
- refine only when score below threshold
- stop at max iteration count (MVP: 1-2)

---

## Workflow A: Product Studio

### Entry Inputs
- idea statement
- feature request
- existing product improvement
- optional uploaded docs

### Pipeline Steps
1. Input Normalization
2. Planner (PRD + user journey framing)
3. Architect (HLD/LLD/API/DB thinking)
4. QA Designer (test strategy + cases)
5. Critic (cross-section validation and score)
6. Refinement (conditional)
7. Finalizer (developer-ready bundle)

### Output Artifacts
- PRD (atomic tasks + phases)
- user journeys (happy/edge)
- technical document
- QA cases
- deliverables/timeline summary

### Example Control Logic
- if architecture gaps found -> re-run architect + critic
- if product clarity gaps found -> re-run planner + critic

---

## Workflow B: Creative / Media Studio

### Entry Inputs
- text prompt for visual generation
- target medium: text->image, text->video
- optional style or platform hints

### Pipeline Steps
1. Intent Analyzer
   - classify subject/medium/style/complexity
2. Capability Selector
   - map intent flags to persona set
3. Planner
   - build visual/technical blueprint
4. Executor
   - synthesize output through selected personas
5. Critic
   - evaluate quality/completeness
6. Refinement (conditional)
7. Finalizer
   - platform-aware prompt packaging

### Output Artifacts
- final prompt(s)
- optional secondary prompt (image->video style extension)
- metadata for reuse and iteration

### Conditional Persona Activation Examples
- no human subject -> skip pose persona
- no camera realism need -> skip photographer persona
- video request -> add cinematographer/motion persona

---

## A2A/A2UI Event Workflow (Observability)
Each stage emits UI events:
- stage started
- stage completed
- summary generated
- critique/score published
- loop triggered (if any)

Display modes:
- Simple mode: concise curated progress
- Advanced mode: richer structured event trace
