import { callLLMWithRetry } from "@/lib/llm/gateway";
import { extractJSON } from "@/lib/llm/parse";
import type { LLMResponse } from "@/types";
import type {
  CreativeAnalysis,
  CreativeVision,
  PhotographySpecs,
  CinematographySpecs,
  PoseSpecs,
  ArtDirectionSpecs,
  CreativeCritique,
  CreativePromptBundle,
} from "@/types/creative";
import {
  CREATIVE_ANALYZER_PROMPT,
  CREATIVE_DIRECTOR_PROMPT,
  PHOTOGRAPHER_PROMPT,
  CINEMATOGRAPHER_PROMPT,
  POSE_DIRECTOR_PROMPT,
  ART_DIRECTOR_PROMPT,
  CREATIVE_CRITIC_PROMPT,
  CREATIVE_ASSEMBLER_PROMPT,
} from "./creative-prompts";

// ─── Input Analyzer ──────────────────────────────────────────────────────────

export async function analyzeCreativeInput(
  rawInput: string,
  medium: "image" | "video"
): Promise<{ result: CreativeAnalysis; usage: LLMResponse["usage"] }> {
  const resp = await callLLMWithRetry(
    [
      { role: "system", content: CREATIVE_ANALYZER_PROMPT },
      {
        role: "user",
        content: `User selected medium: ${medium}\n\nUser input: ${rawInput}`,
      },
    ],
    1024,
    0.4
  );
  return { result: extractJSON<CreativeAnalysis>(resp.content), usage: resp.usage };
}

// ─── Creative Director ───────────────────────────────────────────────────────

export async function runCreativeDirector(
  analysis: CreativeAnalysis
): Promise<{ result: CreativeVision; usage: LLMResponse["usage"] }> {
  const resp = await callLLMWithRetry(
    [
      { role: "system", content: CREATIVE_DIRECTOR_PROMPT },
      {
        role: "user",
        content: `Create a complete creative vision for this concept.\n\nMedium: ${analysis.medium}\nStyle: ${analysis.style}\nSubject type: ${analysis.subjectType}\nHas humans: ${analysis.hasHumans}\nExpanded concept: ${analysis.expandedConcept}\n\nOriginal intent: ${analysis.originalIntent}`,
      },
    ],
    2048,
    0.5
  );
  return { result: extractJSON<CreativeVision>(resp.content), usage: resp.usage };
}

// ─── Photographer ────────────────────────────────────────────────────────────

export async function runPhotographer(
  analysis: CreativeAnalysis,
  vision: CreativeVision
): Promise<{ result: PhotographySpecs; usage: LLMResponse["usage"] }> {
  const resp = await callLLMWithRetry(
    [
      { role: "system", content: PHOTOGRAPHER_PROMPT },
      {
        role: "user",
        content: `Specify exact photography settings for this creative vision.\n\nTitle: ${vision.title}\nConcept: ${vision.concept}\nSubject: ${vision.subject.description} (${vision.subject.position}, ${vision.subject.scale})\nEnvironment: ${vision.environment.setting}, ${vision.environment.timeOfDay}\nMood: ${vision.mood}\nColor palette: ${vision.colorPalette.primary}, ${vision.colorPalette.secondary}\nComposition: ${vision.composition.framing}, ${vision.composition.perspective}`,
      },
    ],
    1024,
    0.3
  );
  return { result: extractJSON<PhotographySpecs>(resp.content), usage: resp.usage };
}

// ─── Cinematographer ─────────────────────────────────────────────────────────

export async function runCinematographer(
  analysis: CreativeAnalysis,
  vision: CreativeVision
): Promise<{ result: CinematographySpecs; usage: LLMResponse["usage"] }> {
  const resp = await callLLMWithRetry(
    [
      { role: "system", content: CINEMATOGRAPHER_PROMPT },
      {
        role: "user",
        content: `Specify exact cinematography details for this creative vision.\n\nTitle: ${vision.title}\nConcept: ${vision.concept}\nSubject: ${vision.subject.description} (${vision.subject.position}, ${vision.subject.scale})\nEnvironment: ${vision.environment.setting}, ${vision.environment.timeOfDay}\nMood: ${vision.mood}`,
      },
    ],
    1024,
    0.3
  );
  return { result: extractJSON<CinematographySpecs>(resp.content), usage: resp.usage };
}

// ─── Pose Director ───────────────────────────────────────────────────────────

export async function runPoseDirector(
  analysis: CreativeAnalysis,
  vision: CreativeVision
): Promise<{ result: PoseSpecs; usage: LLMResponse["usage"] }> {
  const resp = await callLLMWithRetry(
    [
      { role: "system", content: POSE_DIRECTOR_PROMPT },
      {
        role: "user",
        content: `Specify exact human appearance, pose, and wardrobe details.\n\nSubject: ${vision.subject.description}\nEnvironment: ${vision.environment.setting}\nMood: ${vision.mood}\nColor palette: ${vision.colorPalette.primary}, ${vision.colorPalette.secondary}, ${vision.colorPalette.accent}\nStyle: ${analysis.style}`,
      },
    ],
    1536,
    0.4
  );
  return { result: extractJSON<PoseSpecs>(resp.content), usage: resp.usage };
}

// ─── Art Director ────────────────────────────────────────────────────────────

export async function runArtDirector(
  analysis: CreativeAnalysis,
  vision: CreativeVision
): Promise<{ result: ArtDirectionSpecs; usage: LLMResponse["usage"] }> {
  const resp = await callLLMWithRetry(
    [
      { role: "system", content: ART_DIRECTOR_PROMPT },
      {
        role: "user",
        content: `Define the art style and technique for this creative vision.\n\nStyle: ${analysis.style}\nTitle: ${vision.title}\nConcept: ${vision.concept}\nSubject: ${vision.subject.description}\nMood: ${vision.mood}\nColor palette: ${vision.colorPalette.primary}, ${vision.colorPalette.secondary}, ${vision.colorPalette.accent}\nMood: ${vision.colorPalette.mood}`,
      },
    ],
    1024,
    0.4
  );
  return { result: extractJSON<ArtDirectionSpecs>(resp.content), usage: resp.usage };
}

// ─── Creative Critic ─────────────────────────────────────────────────────────

export async function runCreativeCritic(
  analysis: CreativeAnalysis,
  vision: CreativeVision,
  photoSpecs: PhotographySpecs | null,
  cinemaSpecs: CinematographySpecs | null,
  poseSpecs: PoseSpecs | null,
  artSpecs: ArtDirectionSpecs | null
): Promise<{ result: CreativeCritique; usage: LLMResponse["usage"] }> {
  const sections: string[] = [
    `## Analysis\n${JSON.stringify(analysis, null, 2)}`,
    `## Creative Vision\n${JSON.stringify(vision, null, 2)}`,
  ];
  if (photoSpecs) sections.push(`## Photography Specs\n${JSON.stringify(photoSpecs, null, 2)}`);
  if (cinemaSpecs) sections.push(`## Cinematography Specs\n${JSON.stringify(cinemaSpecs, null, 2)}`);
  if (poseSpecs) sections.push(`## Pose Specs\n${JSON.stringify(poseSpecs, null, 2)}`);
  if (artSpecs) sections.push(`## Art Direction Specs\n${JSON.stringify(artSpecs, null, 2)}`);

  const resp = await callLLMWithRetry(
    [
      { role: "system", content: CREATIVE_CRITIC_PROMPT },
      {
        role: "user",
        content: `Review this creative prompt bundle for completeness and specificity.\n\n${sections.join("\n\n")}`,
      },
    ],
    1024,
    0.3
  );
  return { result: extractJSON<CreativeCritique>(resp.content), usage: resp.usage };
}

// ─── Prompt Assembler ────────────────────────────────────────────────────────

export async function runPromptAssembler(
  analysis: CreativeAnalysis,
  vision: CreativeVision,
  photoSpecs: PhotographySpecs | null,
  cinemaSpecs: CinematographySpecs | null,
  poseSpecs: PoseSpecs | null,
  artSpecs: ArtDirectionSpecs | null,
  critique: CreativeCritique
): Promise<{ result: CreativePromptBundle; usage: LLMResponse["usage"] }> {
  const sections: string[] = [
    `## Analysis\n${JSON.stringify(analysis, null, 2)}`,
    `## Creative Vision\n${JSON.stringify(vision, null, 2)}`,
  ];
  if (photoSpecs) sections.push(`## Photography Specs\n${JSON.stringify(photoSpecs, null, 2)}`);
  if (cinemaSpecs) sections.push(`## Cinematography Specs\n${JSON.stringify(cinemaSpecs, null, 2)}`);
  if (poseSpecs) sections.push(`## Pose Specs\n${JSON.stringify(poseSpecs, null, 2)}`);
  if (artSpecs) sections.push(`## Art Direction Specs\n${JSON.stringify(artSpecs, null, 2)}`);
  sections.push(`## Quality Review\n${JSON.stringify(critique, null, 2)}`);

  const resp = await callLLMWithRetry(
    [
      { role: "system", content: CREATIVE_ASSEMBLER_PROMPT },
      {
        role: "user",
        content: `Assemble the final prompt bundle from all agent outputs.\n\nActive agents: ${analysis.activeAgents.join(", ")}\n\n${sections.join("\n\n")}`,
      },
    ],
    2048,
    0.3
  );
  return { result: extractJSON<CreativePromptBundle>(resp.content), usage: resp.usage };
}
