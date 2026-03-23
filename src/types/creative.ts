// ─── Creative Studio Types ───────────────────────────────────────────────────

import type { LLMResponse } from "./index";

export type CreativeMedium = "image" | "video";

export type CreativeStyle =
  | "photography"
  | "illustration"
  | "digital_art"
  | "painting"
  | "3d_render"
  | "concept_art"
  | "watercolor"
  | "sketch"
  | "anime"
  | "cinematic";

export type CreativeOrchestratorState =
  | "IDLE"
  | "ANALYZING"
  | "DIRECTING"
  | "PHOTOGRAPHING"
  | "CINEMATOGRAPHING"
  | "POSE_DIRECTING"
  | "ART_DIRECTING"
  | "REVIEWING"
  | "REFINING"
  | "ASSEMBLING"
  | "DONE"
  | "ERROR";

export interface CreativeAgentEvent {
  id: string;
  timestamp: number;
  state: CreativeOrchestratorState;
  agent: "System" | "Planner" | "Executor" | "Critic" | "Finalizer";
  persona?: string;
  type: "started" | "thinking" | "completed" | "error" | "loop";
  message: string;
  detail?: string;
}

// ─── Normalizer / Analyzer Output ────────────────────────────────────────────

export interface CreativeAnalysis {
  medium: CreativeMedium;
  style: CreativeStyle;
  subjectType: "person" | "animal" | "object" | "landscape" | "scene" | "abstract";
  hasHumans: boolean;
  hasAnimals: boolean;
  isArtistic: boolean;
  originalIntent: string;
  expandedConcept: string;
  activeAgents: string[];
}

// ─── Creative Director Output ────────────────────────────────────────────────

export interface CreativeVision {
  title: string;
  concept: string;
  subject: {
    description: string;
    position: string;
    scale: string;
  };
  environment: {
    setting: string;
    background: string;
    timeOfDay: string;
    weather: string;
  };
  colorPalette: {
    primary: string;
    secondary: string;
    accent: string;
    mood: string;
  };
  composition: {
    framing: string;
    perspective: string;
    depthOfField: string;
    focalPoint: string;
  };
  mood: string;
  additionalDetails: string[];
}

// ─── Photographer Output ─────────────────────────────────────────────────────

export interface PhotographySpecs {
  camera: {
    type: string;
    lens: string;
    focalLength: string;
    aperture: string;
    shutterSpeed: string;
    iso: string;
  };
  lighting: {
    type: string;
    direction: string;
    colorTemperature: string;
    intensity: string;
    shadows: string;
    highlights: string;
    setup: string;
  };
  postProcessing: string[];
  qualityModifiers: string[];
}

// ─── Cinematographer Output ──────────────────────────────────────────────────

export interface CinematographySpecs {
  shotType: string;
  cameraMovement: string;
  angle: string;
  speed: string;
  transition: string;
  aspectRatio: string;
  frameRate: string;
  motionBlur: string;
  visualFlow: string;
}

// ─── Pose Director Output ────────────────────────────────────────────────────

export interface PoseSpecs {
  pose: string;
  gesture: string;
  expression: string;
  eyeDirection: string;
  bodyLanguage: string;
  wardrobe: {
    clothing: string;
    colors: string;
    material: string;
    fit: string;
  };
  hair: {
    style: string;
    color: string;
    length: string;
  };
  accessories: string[];
  makeup: string;
  skinDetails: string;
}

// ─── Art Director Output ─────────────────────────────────────────────────────

export interface ArtDirectionSpecs {
  artStyle: string;
  technique: string;
  texture: string;
  brushwork: string;
  colorTheory: string;
  visualReferences: string[];
  medium: string;
  detailLevel: string;
}

// ─── Critic Output ───────────────────────────────────────────────────────────

export interface CreativeCritique {
  specificityScore: number;
  completenessScore: number;
  overallScore: number;
  summary: string;
  vagueElements: string[];
  suggestions: string[];
  refinementTarget: "vision" | "photography" | "cinematography" | "pose" | "art" | "none";
}

// ─── Final Prompt Output ─────────────────────────────────────────────────────

export interface CreativePromptBundle {
  title: string;
  generatedAt: string;
  medium: CreativeMedium;
  style: CreativeStyle;
  platform: "gemini";
  qualityScore: number;
  activeAgents: string[];
  jsonPrompt: {
    subject: string;
    environment: string;
    style: string;
    lighting: string;
    camera: string;
    composition: string;
    mood: string;
    colors: string;
    details: string;
    negativePrompt: string;
    qualityModifiers: string[];
    [key: string]: unknown;
  };
  textPrompt: string;
  negativePrompt: string;
  platformNotes: string;
}

// ─── Run Memory ──────────────────────────────────────────────────────────────

export interface CreativeRunMemory {
  runId: string;
  studio: "creative";
  status: CreativeOrchestratorState;
  userInput: {
    raw: string;
    source: "text" | "ocr";
    medium: CreativeMedium;
    fileName?: string;
  };
  analysis: CreativeAnalysis | null;
  vision: CreativeVision | null;
  photographySpecs: PhotographySpecs | null;
  cinematographySpecs: CinematographySpecs | null;
  poseSpecs: PoseSpecs | null;
  artSpecs: ArtDirectionSpecs | null;
  critique: CreativeCritique | null;
  finalOutput: CreativePromptBundle | null;
  events: CreativeAgentEvent[];
  meta: {
    totalCalls: number;
    totalTokensEstimate: number;
    promptTokens: number;
    completionTokens: number;
    refinementLoops: number;
    startedAt: number;
    completedAt: number | null;
  };
}

// ─── Agent info definitions (shared across studios) ──────────────────────────

export interface AgentInfo {
  coreAgent: string;
  persona: string;
  role: string;
  conditional: boolean;
  condition?: string;
}

export const PRODUCT_STUDIO_AGENTS: AgentInfo[] = [
  { coreAgent: "System", persona: "Input Normalizer", role: "Sanitizes and structures raw user input", conditional: false },
  { coreAgent: "Planner", persona: "Product Manager + UX Thinker", role: "Creates PRD, user journeys, phases, and priorities", conditional: false },
  { coreAgent: "Executor", persona: "Tech Architect + Backend Eng + DB Designer", role: "Designs HLD, LLD, API endpoints, and database schema", conditional: false },
  { coreAgent: "Executor", persona: "QA Strategist", role: "Generates test strategy and test cases", conditional: false },
  { coreAgent: "Critic", persona: "Senior Engineering Reviewer", role: "Scores quality, finds gaps, suggests refinements", conditional: false },
  { coreAgent: "Finalizer", persona: "Technical Writer", role: "Merges and formats all outputs into a download bundle", conditional: false },
];

export const CREATIVE_STUDIO_AGENTS: AgentInfo[] = [
  { coreAgent: "System", persona: "Input Analyzer", role: "Detects medium, style, subject type, and activates required agents", conditional: false },
  { coreAgent: "Planner", persona: "Creative Director", role: "Defines creative vision, fills all missing details, composition, and color palette", conditional: false },
  { coreAgent: "Executor", persona: "Photographer", role: "Specifies camera, lens, lighting, and post-processing details", conditional: true, condition: "Image medium" },
  { coreAgent: "Executor", persona: "Cinematographer", role: "Defines camera movement, shot type, angle, and visual flow", conditional: true, condition: "Video medium" },
  { coreAgent: "Executor", persona: "Pose Director", role: "Specifies pose, wardrobe, hair, accessories, expression, and body language", conditional: true, condition: "Humans detected" },
  { coreAgent: "Executor", persona: "Art Director", role: "Defines art style, technique, texture, and visual references", conditional: true, condition: "Artistic style" },
  { coreAgent: "Critic", persona: "Prompt Quality Reviewer", role: "Checks for vagueness, completeness, and platform compatibility", conditional: false },
  { coreAgent: "Finalizer", persona: "Prompt Assembler", role: "Produces JSON structured prompt and natural language prompt", conditional: false },
];
