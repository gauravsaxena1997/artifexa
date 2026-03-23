import type { CreativeMedium } from "@/types/creative";

export interface CreativeSampleCase {
  id: string;
  title: string;
  category: string;
  description: string;
  input: string;
  medium: CreativeMedium;
  difficulty: "simple" | "moderate" | "complex";
}

export const CREATIVE_SAMPLE_CASES: CreativeSampleCase[] = [
  {
    id: "cs-001",
    title: "Fashion Editorial",
    category: "Photography — Human Subject",
    description: "A fashion model in a studio setting. Tests pose direction, wardrobe specifics, and professional photography details.",
    input: "A female model doing a ramp walk inside a high-end fashion studio",
    medium: "image",
    difficulty: "complex",
  },
  {
    id: "cs-002",
    title: "Watercolor Village",
    category: "Art — Landscape",
    description: "A watercolor painting of a rural scene. Tests art direction and the artistic style pipeline.",
    input: "A watercolor painting of a small European village at sunrise",
    medium: "image",
    difficulty: "moderate",
  },
  {
    id: "cs-003",
    title: "Vague Animal Prompt",
    category: "Photography — Animal",
    description: "A deliberately vague input to test how the system expands minimal input into a rich, specific prompt.",
    input: "image of a random animal",
    medium: "image",
    difficulty: "simple",
  },
  {
    id: "cs-004",
    title: "Product Shot",
    category: "Photography — Object",
    description: "A commercial product photograph. Tests studio lighting and photography specs without human subjects.",
    input: "A luxury watch on a dark surface with dramatic lighting",
    medium: "image",
    difficulty: "moderate",
  },
  {
    id: "cs-005",
    title: "Cinematic Scene",
    category: "Video — Cinematic",
    description: "A cinematic video prompt. Tests cinematographer agent activation and video-specific specs.",
    input: "A slow-motion shot of rain falling on a neon-lit Tokyo street at night",
    medium: "video",
    difficulty: "complex",
  },
  {
    id: "cs-006",
    title: "Anime Character",
    category: "Art — Character",
    description: "An anime-style character illustration. Tests art direction with human features and anime aesthetics.",
    input: "An anime warrior girl standing on a cliff overlooking the ocean during a storm",
    medium: "image",
    difficulty: "complex",
  },
  {
    id: "cs-007",
    title: "Minimal Landscape",
    category: "Photography — Landscape",
    description: "A clean landscape photograph. Tests photography pipeline without human or animal subjects.",
    input: "Misty mountain lake at dawn with perfect reflections",
    medium: "image",
    difficulty: "simple",
  },
  {
    id: "cs-008",
    title: "Street Portrait",
    category: "Photography — Human Subject",
    description: "An environmental portrait on city streets. Tests pose direction in a candid setting.",
    input: "A jazz musician playing saxophone on a rainy Paris street corner under a streetlight",
    medium: "image",
    difficulty: "complex",
  },
];
