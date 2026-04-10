// ─── Unified Stage Metadata ──────────────────────────────────────────────────
// Each studio exports its own STAGE_META array that drives the StudioProcessView.
// The component is completely data-driven: UI comes from one place, data from here.

export interface StageMeta {
  state: string;
  label: string;
  coreAgent: string;
  persona: string;
  description: string;
  loadingMessage: string;
  conditional: boolean;
}

// ─── Creative Studio Stages ──────────────────────────────────────────────────

export const CREATIVE_STAGE_META: StageMeta[] = [
  {
    state: "ANALYZING",
    label: "Analyzing input",
    coreAgent: "System",
    persona: "Input Analyzer",
    description: "Detecting medium, style, subject type, and determining which specialist agents to activate",
    loadingMessage: "Understanding your creative request...",
    conditional: false,
  },
  {
    state: "DIRECTING",
    label: "Creative direction",
    coreAgent: "Planner",
    persona: "Creative Director",
    description: "Defining creative vision, filling all missing details, composition, color palette, and mood",
    loadingMessage: "Shaping the creative vision...",
    conditional: false,
  },
  {
    state: "PHOTOGRAPHING",
    label: "Photography specs",
    coreAgent: "Executor",
    persona: "Photographer",
    description: "Setting camera, lens, lighting setup, and post-processing details",
    loadingMessage: "Setting up the perfect shot...",
    conditional: true,
  },
  {
    state: "CINEMATOGRAPHING",
    label: "Cinematography specs",
    coreAgent: "Executor",
    persona: "Cinematographer",
    description: "Planning camera movement, shot type, angle, and visual flow",
    loadingMessage: "Choreographing the camera movement...",
    conditional: true,
  },
  {
    state: "POSE_DIRECTING",
    label: "Pose & wardrobe",
    coreAgent: "Executor",
    persona: "Pose Director",
    description: "Specifying pose, wardrobe, hair, accessories, expression, and body language",
    loadingMessage: "Directing the pose and wardrobe...",
    conditional: true,
  },
  {
    state: "ART_DIRECTING",
    label: "Art direction",
    coreAgent: "Executor",
    persona: "Art Director",
    description: "Defining art style, technique, texture, and visual references",
    loadingMessage: "Crafting the artistic style...",
    conditional: true,
  },
  {
    state: "REVIEWING",
    label: "Quality review",
    coreAgent: "Critic",
    persona: "Prompt Quality Reviewer",
    description: "Checking for vagueness, completeness, and platform compatibility",
    loadingMessage: "Reviewing prompt specificity...",
    conditional: false,
  },
  {
    state: "REFINING",
    label: "Refining output",
    coreAgent: "System",
    persona: "Refinement Loop",
    description: "Re-running weakest section based on critic feedback",
    loadingMessage: "Improving based on feedback...",
    conditional: true,
  },
  {
    state: "ASSEMBLING",
    label: "Assembling prompts",
    coreAgent: "Finalizer",
    persona: "Prompt Assembler",
    description: "Producing JSON structured prompt and natural language prompt for Gemini",
    loadingMessage: "Assembling the final prompts...",
    conditional: false,
  },
];

// ─── Product Studio Stages ───────────────────────────────────────────────────

export const PRODUCT_STAGE_META: StageMeta[] = [
  {
    state: "NORMALIZING",
    label: "Understanding input",
    coreAgent: "System",
    persona: "Input Normalizer",
    description: "Sanitizing input, extracting context, adding guardrails",
    loadingMessage: "Reading your idea...",
    conditional: false,
  },
  {
    state: "PLANNING",
    label: "Planning product",
    coreAgent: "Planner",
    persona: "Product Manager + UX Thinker",
    description: "Building PRD with features, phases, and user journeys",
    loadingMessage: "Thinking about the product shape...",
    conditional: false,
  },
  {
    state: "EXECUTING_ARCHITECT",
    label: "Designing architecture",
    coreAgent: "Executor",
    persona: "Tech Architect + Backend Eng + DB Designer",
    description: "Designing tech stack, APIs, database schema, and system components",
    loadingMessage: "Designing the technical blueprint...",
    conditional: false,
  },
  {
    state: "EXECUTING_QA",
    label: "Generating test plan",
    coreAgent: "Executor",
    persona: "QA Strategist",
    description: "Writing test strategy, functional tests, edge cases, and security checks",
    loadingMessage: "Writing test scenarios...",
    conditional: false,
  },
  {
    state: "REVIEWING",
    label: "Quality review",
    coreAgent: "Critic",
    persona: "Senior Engineering Reviewer",
    description: "Scoring output quality, checking consistency, flagging issues",
    loadingMessage: "Running quality checks...",
    conditional: false,
  },
  {
    state: "REFINING",
    label: "Refining output",
    coreAgent: "System",
    persona: "Refinement Loop",
    description: "Re-running weakest section based on critic feedback",
    loadingMessage: "Improving based on feedback...",
    conditional: true,
  },
  {
    state: "FINALIZING",
    label: "Preparing documents",
    coreAgent: "Finalizer",
    persona: "Technical Writer",
    description: "Assembling final bundle with title and executive summary",
    loadingMessage: "Polishing the final documents...",
    conditional: false,
  },
];
